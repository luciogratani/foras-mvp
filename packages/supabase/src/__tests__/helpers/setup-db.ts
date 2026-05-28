/**
 * setup-db.ts
 *
 * Bootstraps a minimal "Supabase-like" Postgres environment for tests:
 *   - auth schema + auth.users table + auth.uid() stub function
 *   - roles: anon, authenticated, service_role (idempotent)
 *   - public.tenants table (required by create_schema_from_template)
 *   - provisions one tenant schema via the SQL in create_schema_from_template.sql
 *     (re-implemented inline here to avoid psql dependency in tests — we apply
 *     each section directly through the pg Pool)
 *
 * Design: every test suite that needs a real schema should call `setupTestSchema()`
 * in `beforeAll` and `teardownTestSchema()` in `afterAll`.
 */

import { Pool } from 'pg'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Path to the ops SQL files (relative to this file at packages/supabase/src/__tests__/helpers/)
const REPO_ROOT = resolve(__dirname, '../../../../../..')
const CREATE_TEMPLATE_SQL = resolve(
  REPO_ROOT,
  'docs/operations/create_schema_from_template.sql'
)

export function getTestPool(): Pool {
  const connectionString =
    process.env.TEST_DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/postgres'
  return new Pool({ connectionString, max: 5 })
}

/**
 * Bootstrap the minimal Supabase-like harness on the test database.
 * Safe to call multiple times (uses IF NOT EXISTS / CREATE IF NOT EXISTS).
 */
export async function bootstrapHarness(pool: Pool): Promise<void> {
  const client = await pool.connect()
  try {
    await client.query(`
      -- auth schema
      CREATE SCHEMA IF NOT EXISTS auth;

      -- auth.users (minimal — only the columns referenced by create_schema_from_template.sql)
      CREATE TABLE IF NOT EXISTS auth.users (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email       TEXT,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      -- auth.uid() stub: returns the 'sub' claim from request.jwt.claims GUC,
      -- or NULL if absent / empty / not valid JSON (= anon session).
      CREATE OR REPLACE FUNCTION auth.uid() RETURNS UUID
        LANGUAGE plpgsql STABLE
        AS $$
        DECLARE
          v_claims TEXT;
        BEGIN
          v_claims := current_setting('request.jwt.claims', true);
          IF v_claims IS NULL OR v_claims = '' THEN
            RETURN NULL;
          END IF;
          RETURN (v_claims::json->>'sub')::uuid;
        EXCEPTION WHEN OTHERS THEN
          RETURN NULL;
        END;
        $$;

      -- roles (idempotent)
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
          CREATE ROLE anon NOLOGIN;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
          CREATE ROLE authenticated NOLOGIN;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
          CREATE ROLE service_role NOLOGIN BYPASSRLS;
        END IF;
      END $$;

      -- public.tenants (required by create_schema_from_template.sql §0)
      CREATE TABLE IF NOT EXISTS public.tenants (
        schema_name TEXT        PRIMARY KEY,
        owner_id    UUID        NOT NULL REFERENCES auth.users(id),
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      -- public.is_tenant_owner() helper (used by some policies)
      CREATE OR REPLACE FUNCTION public.is_tenant_owner(p_schema TEXT) RETURNS BOOLEAN
        LANGUAGE sql STABLE SECURITY DEFINER
        AS $$
          SELECT EXISTS (
            SELECT 1 FROM public.tenants
            WHERE schema_name = p_schema
              AND owner_id = auth.uid()
          );
        $$;

      GRANT EXECUTE ON FUNCTION public.is_tenant_owner(TEXT) TO authenticated;
    `)
  } finally {
    client.release()
  }
}

/**
 * Provisions a tenant schema using the SQL from create_schema_from_template.sql,
 * adapted to use the given schema name and owner UUID instead of 'template'.
 *
 * We read create_schema_from_template.sql and perform simple text substitution
 * (template → schemaName, the hardcoded owner UUID → ownerUuid) then execute.
 *
 * This reproduces exactly what `psql -v schema=... -v owner_uuid=...` does in
 * production CI — the same SQL, just pre-processed in JS instead of by psql.
 */
export async function provisionSchema(
  pool: Pool,
  schemaName: string,
  ownerUuid: string
): Promise<void> {
  // First insert the owner into auth.users (idempotent)
  const client = await pool.connect()
  try {
    await client.query(
      `INSERT INTO auth.users (id) VALUES ($1) ON CONFLICT (id) DO NOTHING`,
      [ownerUuid]
    )

    let sql = readFileSync(CREATE_TEMPLATE_SQL, 'utf-8')

    // Replace hardcoded 'template' schema references:
    //   CREATE SCHEMA IF NOT EXISTS template  → schemaName
    //   SET search_path = template            → schemaName
    //   GRANT ... ON SCHEMA template TO       → schemaName
    //   GRANT ... IN SCHEMA template TO       → schemaName
    //   GRANT ... ON template.bookings TO     → schemaName.bookings
    //   ALTER DEFAULT PRIVILEGES IN SCHEMA template → schemaName
    //   public.tenants VALUES ('template', ...)  → schemaName
    // We also replace the hardcoded owner UUID.

    const TEMPLATE_OWNER = '1c486961-12b2-47d0-8aef-0aee30df083c'

    // Perform replacements (order matters — most specific first)
    sql = sql
      // schema name in single quotes (VALUES insert)
      .replace(/'template'/g, `'${schemaName}'`)
      // bare identifier occurrences — use word-boundary-like replacements
      // "CREATE SCHEMA IF NOT EXISTS template"
      .replace(/CREATE SCHEMA IF NOT EXISTS template\b/gi, `CREATE SCHEMA IF NOT EXISTS "${schemaName}"`)
      // "SET search_path = template"
      .replace(/SET search_path = template\b/gi, `SET search_path = "${schemaName}"`)
      // "ON SCHEMA template TO"
      .replace(/ON SCHEMA template\b/gi, `ON SCHEMA "${schemaName}"`)
      // "IN SCHEMA template "
      .replace(/IN SCHEMA template\b/gi, `IN SCHEMA "${schemaName}"`)
      // "ON template.bookings" etc.
      .replace(/ON template\./g, `ON "${schemaName}".`)
      // "FROM template." (in audit_rls references, not in provisioner but safe)
      .replace(/FROM template\./g, `FROM "${schemaName}".`)
      // owner UUID
      .replace(new RegExp(TEMPLATE_OWNER, 'gi'), ownerUuid)

    // The provisioner bootstraps public.tenants itself (§0), but we've already
    // created it. The INSERT INTO public.tenants may conflict if we run twice;
    // patch it to be idempotent.
    sql = sql.replace(
      /INSERT INTO public\.tenants \(schema_name, owner_id\)/g,
      'INSERT INTO public.tenants (schema_name, owner_id) ON CONFLICT (schema_name) DO UPDATE SET owner_id = EXCLUDED.owner_id --'
    )

    // Also handle the CREATE TABLE IF NOT EXISTS public.tenants block —
    // it's already created, but IF NOT EXISTS handles it fine.

    await client.query(sql)
  } finally {
    client.release()
  }
}

/**
 * Drop a tenant schema. Used in afterAll to clean up.
 */
export async function dropSchema(pool: Pool, schemaName: string): Promise<void> {
  const client = await pool.connect()
  try {
    await client.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`)
    await client.query(`DELETE FROM public.tenants WHERE schema_name = $1`, [schemaName])
  } finally {
    client.release()
  }
}

/**
 * Set the acting JWT uid for the current transaction (used by auth.uid() stub).
 * Call within a transaction (BEGIN ... SET LOCAL ... COMMIT/ROLLBACK).
 */
export async function setAuthUid(pool: Pool, uid: string | null): Promise<void> {
  const client = await pool.connect()
  try {
    if (uid) {
      await client.query(
        `SELECT set_config('request.jwt.claims', $1, false)`,
        [JSON.stringify({ sub: uid })]
      )
    } else {
      await client.query(`SELECT set_config('request.jwt.claims', '', false)`)
    }
  } finally {
    client.release()
  }
}
