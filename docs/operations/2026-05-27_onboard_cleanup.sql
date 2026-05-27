-- 2026-05-27_onboard_cleanup.sql
-- -----------------------------------------------------------------------
-- !! SCRIPT DISTRUTTIVO !!
--
-- Elimina lo schema di test 'onboard_test' e la sua riga in public.tenants.
-- Eseguire SOLO dopo aver completato lo smoke-test e verificato i risultati.
--
-- EFFETTI IRREVERSIBILI:
--   - DROP SCHEMA onboard_test CASCADE: rimuove lo schema e TUTTE le tabelle,
--     dati, policy, sequence al suo interno. Non recuperabile.
--   - DELETE FROM public.tenants: rimuove la riga di registrazione del tenant.
--
-- SICUREZZA:
--   - Questo script non tocca template, alex_akashi, underclub o qualsiasi
--     altro schema/tenant.
--   - La WHERE clause è hardcoded su 'onboard_test': non c'è rischio di
--     cancellare altri tenant per errore di variabile.
--
-- QUANDO ESEGUIRLO:
--   Dopo aver completato e verificato lo smoke-test
--   (docs/operations/2026-05-27_onboard_smoketest.sql).
--
-- USO:
--   psql $DATABASE_URL -f docs/operations/2026-05-27_onboard_cleanup.sql
--   oppure incollare nel Supabase SQL editor come service_role.
-- -----------------------------------------------------------------------


-- -----------------------------------------------------------------------
-- C1. Verifica pre-cleanup: mostrare cosa verrà eliminato
-- -----------------------------------------------------------------------
SELECT
  'TABELLE IN onboard_test' AS cosa,
  COUNT(*)::text            AS quante
FROM pg_tables
WHERE schemaname = 'onboard_test'
UNION ALL
SELECT
  'RIGA IN public.tenants',
  COUNT(*)::text
FROM public.tenants
WHERE schema_name = 'onboard_test';
-- Leggere l'output PRIMA di procedere: confermare che ci siano le 9 tabelle
-- e la riga in public.tenants corrispondenti al test.


-- -----------------------------------------------------------------------
-- C2. !! DISTRUTTIVO !! Eliminazione schema onboard_test
-- -----------------------------------------------------------------------
DROP SCHEMA IF EXISTS onboard_test CASCADE;
-- CASCADE elimina tutte le tabelle, dati, policy, sequence nello schema.
-- Irreversibile.


-- -----------------------------------------------------------------------
-- C3. !! DISTRUTTIVO !! Rimozione riga da public.tenants
-- -----------------------------------------------------------------------
DELETE FROM public.tenants
WHERE schema_name = 'onboard_test';


-- -----------------------------------------------------------------------
-- C4. Verifica post-cleanup: confermare che non esista più nulla
-- -----------------------------------------------------------------------
SELECT COUNT(*) AS schema_exists
FROM pg_namespace
WHERE nspname = 'onboard_test';
-- PASS quando: schema_exists = 0 (schema eliminato).
-- FAIL se: 1 (DROP non eseguito o rollback implicito).

SELECT COUNT(*) AS tenant_row_exists
FROM public.tenants
WHERE schema_name = 'onboard_test';
-- PASS quando: tenant_row_exists = 0 (riga eliminata).
-- FAIL se: 1 (DELETE non eseguita).


-- -----------------------------------------------------------------------
-- C5. Rieseguire l'audit dopo il cleanup (opzionale ma raccomandato)
-- -----------------------------------------------------------------------
-- Dopo il cleanup, eseguire audit_rls.sql: onboard_test non deve apparire
-- tra gli schemi monitorati. Zero discrepanze attese.
--
--   psql $DATABASE_URL -f docs/operations/audit_rls.sql
-- -----------------------------------------------------------------------
