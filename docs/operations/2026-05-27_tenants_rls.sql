-- 2026-05-27_tenants_rls.sql
-- -----------------------------------------------------------------------
-- Abilita RLS su public.tenants — chiude il linter Supabase
-- 0013_rls_disabled_in_public (ERROR, SECURITY, EXTERNAL).
--
-- IL PROBLEMA:
--   public.tenants (registro schema_name → owner_id) vive nello schema public
--   esposto a PostgREST. Senza RLS, un client API (anon/authenticated) potrebbe
--   enumerare gli schemi tenant e gli owner_id (UUID utente) → information
--   disclosure in un sistema multi-tenant.
--
-- IL FIX:
--   ENABLE ROW LEVEL SECURITY senza alcuna policy → anon/authenticated sono
--   negati via API. L'accesso legittimo NON si rompe perché passa per ruoli che
--   bypassano la RLS non-FORCE:
--     - service_role (BYPASSRLS): auth admin (getVerifiedTenantClient,
--       apps/admin/lib/auth.ts) + audit_rls.sql;
--     - public.is_tenant_owner() (SECURITY DEFINER, owner = owner della tabella):
--       legge public.tenants per le policy di scrittura owner-scope dei tenant (A1).
--
-- Contesto: Sprint 6 — freeze. Complemento di A1 (hardening RLS scrittura).
-- Entra nel baseline (create_schema_from_template.sql §0) + va applicato alla
-- DB live (public.tenants è globale, creata una volta sola).
--
-- IDEMPOTENTE: ENABLE su tabella già abilitata è un no-op.
--
-- USO: eseguire come service_role/postgres (SQL editor o psql).
-- -----------------------------------------------------------------------

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;


-- -----------------------------------------------------------------------
-- VERIFICA POST-APPLICAZIONE
-- -----------------------------------------------------------------------

SELECT relrowsecurity AS rls_enabled, relforcerowsecurity AS rls_forced
FROM   pg_class
WHERE  oid = 'public.tenants'::regclass;
-- PASS quando: rls_enabled = t (rls_forced = f è corretto: i bypass owner/service_role devono restare).

-- Dopo l'applicazione, ri-eseguire (per sezioni) docs/operations/rls_isolation_tests.sql
-- Sezione 3: i casi 3.1 (owner scrive) e 3.2 (non-owner bloccato) devono restare PASS.
-- In particolare 3.1 PASS conferma che is_tenant_owner() legge ancora public.tenants
-- nonostante la RLS (se non riuscisse, 3.1 fallirebbe — l'owner non scriverebbe).
