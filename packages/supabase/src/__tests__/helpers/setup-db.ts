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

// Path to the ops SQL files. This file lives at
// packages/supabase/src/__tests__/helpers/setup-db.ts → 5 levels up to the repo root.
const REPO_ROOT = resolve(__dirname, '../../../../..')
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

      -- NOTE: public.is_tenant_owner() (0-arg) is created by the provisioner
      -- (create_schema_from_template.sql §3c) — no stub needed here.
    `)
  } finally {
    client.release()
  }
}

/**
 * Provisions a tenant schema using the SQL from create_schema_from_template.sql.
 *
 * The provisioner is parameterized via psql -v variables (`:"schema"`, `:'schema'`,
 * `:'owner_uuid'`) and protected by `\if :{?schema}` input guards. `pg.Pool#query`
 * is a SQL pipe, not a psql process — it doesn't interpret meta-commands. We
 * pre-process the script in JS: strip backslash-meta lines and substitute the
 * variables inline. Net effect: same SQL psql would have executed.
 */
export async function provisionSchema(
  pool: Pool,
  schemaName: string,
  ownerUuid: string
): Promise<void> {
  const client = await pool.connect()
  try {
    // Owner must exist in auth.users (FK from public.tenants.owner_id).
    await client.query(
      `INSERT INTO auth.users (id) VALUES ($1) ON CONFLICT (id) DO NOTHING`,
      [ownerUuid]
    )

    let sql = readFileSync(CREATE_TEMPLATE_SQL, 'utf-8')

    // Drop any psql meta-command line (\if/\else/\warn/\quit/\endif). The
    // provisioner uses these only as input guards at the top.
    sql = sql.replace(/^\\[^\n]*\n?/gm, '')

    // Substitute psql -v variables.
    //   :"schema"      → quoted identifier   "<name>"
    //   :'schema'      → string literal      '<name>'
    //   :'owner_uuid'  → string literal      '<uuid>'
    sql = sql
      .replace(/:"schema"/g, `"${schemaName}"`)
      .replace(/:'schema'/g, `'${schemaName}'`)
      .replace(/:'owner_uuid'/g, `'${ownerUuid}'`)

    // Make the public.tenants INSERT idempotent on rerun (PK is schema_name).
    sql = sql.replace(
      /INSERT INTO public\.tenants \(schema_name, owner_id\)/g,
      'INSERT INTO public.tenants (schema_name, owner_id) ON CONFLICT (schema_name) DO UPDATE SET owner_id = EXCLUDED.owner_id --'
    )

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
