-- ci-harness-bootstrap.sql
-- -----------------------------------------------------------------------
-- Bootstraps a minimal "Supabase-like" Postgres harness for CI.
-- Run ONCE before provisioning tenant schemas and executing tests.
--
-- Creates:
--   - auth schema + auth.users table + auth.uid() stub function
--   - roles: anon, authenticated, service_role (idempotent)
--   - public.tenants (referenced by create_schema_from_template.sql §0)
--   - public.is_tenant_owner() helper
--
-- Mirrors exactly what the self-hosted Supabase stack provides:
--   - auth schema: auth.users is the standard Supabase auth table
--   - auth.uid(): returns the 'sub' claim from request.jwt.claims GUC
--     (PostgREST sets this GUC per-request from the JWT; in SQL-only
--     tests we SET LOCAL request.jwt.claims = '{"sub":"<uuid>"}')
--   - anon / authenticated / service_role roles: standard Supabase roles
-- -----------------------------------------------------------------------

-- auth schema
CREATE SCHEMA IF NOT EXISTS auth;

-- auth.users (only the columns that create_schema_from_template.sql references)
CREATE TABLE IF NOT EXISTS auth.users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- auth.uid() — returns the JWT 'sub' claim from the per-session GUC.
-- PostgREST sets:  SELECT set_config('request.jwt.claims', '<jwt-payload-json>', true)
-- In SQL tests:    SET LOCAL request.jwt.claims = '{"sub":"<uuid>"}';
--
-- Returns NULL when the GUC is absent, empty, or not valid JSON (= anon session).
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

-- Roles (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
  -- BYPASSRLS mirrors production service_role behaviour
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN BYPASSRLS;
  END IF;
END $$;

-- public.tenants (§0 of create_schema_from_template.sql — idempotent)
CREATE TABLE IF NOT EXISTS public.tenants (
  schema_name TEXT        PRIMARY KEY,
  owner_id    UUID        NOT NULL REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- NOTE: public.is_tenant_owner() (0-arg, current_schema()-based) is created by
-- the provisioner itself (create_schema_from_template.sql §3c). No stub needed
-- here — RLS policies in the tenant schemas reference the 0-arg overload.

-- Pre-seed two distinct owners that will be used for the two test tenant schemas.
-- UUIDs chosen to be deterministic so the provisioner INSERT can reference them.
INSERT INTO auth.users (id, email) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001'::uuid, 'tenant_a@ci.test'),
  ('bbbbbbbb-0000-0000-0000-000000000002'::uuid, 'tenant_b@ci.test')
ON CONFLICT (id) DO NOTHING;
