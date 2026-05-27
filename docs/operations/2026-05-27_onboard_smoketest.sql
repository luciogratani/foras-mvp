-- 2026-05-27_onboard_smoketest.sql
-- -----------------------------------------------------------------------
-- Smoke-test onboarding su schema usa-e-getta 'onboard_test'.
--
-- SCOPO
--   Verificare che create_schema_from_template.sql parametrizzato funzioni
--   correttamente su uno schema arbitrario, senza toccare template /
--   alex_akashi / underclub.
--
-- PREREQUISITI
--   1. Supabase running con public.tenants presente.
--   2. public.is_tenant_owner() già creata (viene ricreata idempotente
--      dallo script di onboarding, ma deve poter fare riferimento a
--      public.tenants).
--   3. L'UUID owner usato nel test deve esistere in auth.users.
--      Qui si usa '1c486961-12b2-47d0-8aef-0aee30df083c' (owner del template,
--      noto come esistente in auth.users). Sostituirlo se il DB di test ne ha
--      un altro.
--
-- ORDINE DI ESECUZIONE
--   Passo 1 — Eseguire create_schema_from_template.sql con schema=onboard_test
--   Passo 2 — Eseguire questo file (smoke-test)
--   Passo 3 — Eseguire il file di cleanup (2026-05-27_onboard_cleanup.sql)
--
-- COME INTERPRETARE L'OUTPUT
--   Ogni query SELECT mostra il valore atteso nel commento "PASS quando".
--   I blocchi DO $$ ... $$ stampano PASS/FAIL come NOTICE nel pannello Messages.
--   Zero righe nei SELECT di discrepanza = tutto ok.
--   Nessun FAIL nei NOTICE = tutto ok.
--
-- VINCOLO: ZERO scritture su template / alex_akashi / underclub.
-- -----------------------------------------------------------------------


-- =======================================================================
-- PASSO 1: Creare lo schema onboard_test
-- (eseguire PRIMA di questo file, da terminale)
-- =======================================================================
--
-- Comando da eseguire nel terminale PRIMA di questo script:
--
--   psql $DATABASE_URL \
--     -v schema=onboard_test \
--     -v owner_uuid=1c486961-12b2-47d0-8aef-0aee30df083c \
--     -f docs/operations/create_schema_from_template.sql
--
-- Se l'UUID 1c486961-... non esiste nel tuo auth.users, sostituirlo con
-- un UUID reale presente nel database (es. quello di un admin esistente).
--
-- =======================================================================


-- =======================================================================
-- PASSO 2: Smoke-test (questo file)
-- Eseguire nel Supabase SQL editor come service_role, oppure con psql.
-- =======================================================================


-- -----------------------------------------------------------------------
-- T1. Verifica registrazione in public.tenants
-- -----------------------------------------------------------------------
SELECT
  schema_name,
  owner_id,
  created_at
FROM public.tenants
WHERE schema_name = 'onboard_test';
-- PASS quando: 1 riga con schema_name='onboard_test' e owner_id corretto.
-- FAIL se: 0 righe (la INSERT §6 non ha funzionato).


-- -----------------------------------------------------------------------
-- T2. Verifica 9 tabelle presenti nello schema
-- -----------------------------------------------------------------------
SELECT tablename
FROM pg_tables
WHERE schemaname = 'onboard_test'
ORDER BY tablename;
-- PASS quando: 9 righe esatte — allergens, bookings, closed_dates,
--   menu_categories, menu_items, menu_sections, news_slides, site_settings,
--   time_slots.
-- FAIL se: mancano tabelle o ce ne sono di extra.


-- -----------------------------------------------------------------------
-- T3. Verifica RLS abilitata su tutte le 9 tabelle
-- -----------------------------------------------------------------------
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'onboard_test'
  AND tablename IN (
    'allergens', 'menu_sections', 'menu_categories', 'menu_items',
    'time_slots', 'bookings', 'closed_dates', 'site_settings', 'news_slides'
  )
ORDER BY tablename;
-- PASS quando: 9 righe, tutte con rowsecurity = true.
-- FAIL se: rowsecurity = false su una o più tabelle.


-- -----------------------------------------------------------------------
-- T4. Verifica seed: 14 allergeni
-- -----------------------------------------------------------------------
SELECT COUNT(*) AS cnt_allergens FROM onboard_test.allergens;
-- PASS quando: cnt_allergens = 14.
-- FAIL se: 0 (seed non eseguito) o != 14.


-- -----------------------------------------------------------------------
-- T5. Verifica seed: 6 sezioni menu
-- -----------------------------------------------------------------------
SELECT COUNT(*) AS cnt_menu_sections FROM onboard_test.menu_sections;
-- PASS quando: cnt_menu_sections = 6.
-- FAIL se: 0 o != 6.


-- -----------------------------------------------------------------------
-- T6. Verifica seed: 1 riga site_settings
-- -----------------------------------------------------------------------
SELECT COUNT(*) AS cnt_site_settings FROM onboard_test.site_settings;
-- PASS quando: cnt_site_settings = 1.
-- FAIL se: 0 (seed non eseguito).


-- -----------------------------------------------------------------------
-- T7. Verifica seed: 2 time_slots
-- -----------------------------------------------------------------------
SELECT COUNT(*) AS cnt_time_slots FROM onboard_test.time_slots;
-- PASS quando: cnt_time_slots = 2 (Pranzo + Cena).
-- FAIL se: 0 o != 2.


-- -----------------------------------------------------------------------
-- T8. Audit RLS: zero discrepanze rispetto a template
-- Eseguire docs/operations/audit_rls.sql e cercare righe con
-- schema_name = 'onboard_test'. Zero righe = ok.
-- -----------------------------------------------------------------------
-- Shortcut: eseguire solo la QUERY 1 dell'audit filtrata su onboard_test:

WITH reference_schema AS (
  SELECT 'template' AS schema_name
),
all_tenant_schemas AS (
  SELECT schema_name FROM public.tenants
  UNION
  SELECT schema_name FROM reference_schema
),
policies_per_schema AS (
  SELECT
    n.nspname   AS schema_name,
    c.relname   AS table_name,
    p.polname   AS policy_name,
    CASE p.polcmd
      WHEN 'r' THEN 'SELECT'
      WHEN 'a' THEN 'INSERT'
      WHEN 'w' THEN 'UPDATE'
      WHEN 'd' THEN 'DELETE'
      ELSE          'ALL'
    END         AS command
  FROM pg_policy    p
  JOIN pg_class     c ON c.oid = p.polrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname IN (SELECT schema_name FROM all_tenant_schemas)
),
reference_policies AS (
  SELECT table_name, policy_name, command
  FROM   policies_per_schema
  WHERE  schema_name = 'template'
),
discrepancies AS (
  SELECT
    'onboard_test'::text AS schema_name,
    r.table_name,
    r.policy_name,
    r.command,
    'MANCANTE nello schema tenant' AS problema
  FROM reference_policies r
  WHERE NOT EXISTS (
    SELECT 1 FROM policies_per_schema p
    WHERE p.schema_name = 'onboard_test'
      AND p.table_name  = r.table_name
      AND p.policy_name = r.policy_name
      AND p.command     = r.command
  )
  UNION ALL
  SELECT
    p.schema_name,
    p.table_name,
    p.policy_name,
    p.command,
    'EXTRA rispetto al riferimento' AS problema
  FROM policies_per_schema p
  WHERE p.schema_name = 'onboard_test'
    AND NOT EXISTS (
      SELECT 1 FROM reference_policies r
      WHERE r.table_name  = p.table_name
        AND r.policy_name = p.policy_name
        AND r.command     = p.command
    )
)
SELECT * FROM discrepancies ORDER BY table_name, policy_name;
-- PASS quando: 0 righe (onboard_test identico al template per policy).
-- FAIL se: righe presenti → policy mancanti o extra rispetto a template.


-- -----------------------------------------------------------------------
-- T9. Verifica GRANT: USAGE su schema per anon, authenticated, service_role
-- -----------------------------------------------------------------------
SELECT r.rolname, 'USAGE on schema' AS privilege
FROM pg_roles r
WHERE r.rolname IN ('anon', 'authenticated', 'service_role')
  AND has_schema_privilege(r.rolname, 'onboard_test', 'USAGE')
ORDER BY r.rolname;
-- PASS quando: 3 righe (anon, authenticated, service_role).
-- FAIL se: mancano uno o più ruoli.


-- -----------------------------------------------------------------------
-- T10. Verifica GRANT tabelle: anon SELECT, authenticated INSERT
-- -----------------------------------------------------------------------
SELECT
  r.rolname,
  has_table_privilege(r.rolname, 'onboard_test.allergens', 'SELECT') AS allergens_select,
  has_table_privilege(r.rolname, 'onboard_test.bookings',  'SELECT') AS bookings_select,
  has_table_privilege(r.rolname, 'onboard_test.bookings',  'INSERT') AS bookings_insert
FROM pg_roles r
WHERE r.rolname IN ('anon', 'authenticated')
ORDER BY r.rolname;
-- PASS quando:
--   anon:          allergens_select=t, bookings_select=t, bookings_insert=t
--   authenticated: allergens_select=t, bookings_select=t, bookings_insert=t


-- -----------------------------------------------------------------------
-- T11. Lettura pubblica come anon (usa BEGIN/ROLLBACK per sicurezza)
-- -----------------------------------------------------------------------
BEGIN;
SET LOCAL ROLE anon;
SELECT COUNT(*) AS anon_can_read_allergens FROM onboard_test.allergens;
-- PASS quando: 14 (anon legge gli allergeni)
-- FAIL se: errore 42501 (GRANT mancante)
ROLLBACK;


-- -----------------------------------------------------------------------
-- T12. Verifica public.is_tenant_owner() presente e SECURITY DEFINER
-- (ripete QUERY 3 di audit_rls.sql)
-- -----------------------------------------------------------------------
SELECT
  'public'                AS schema_name,
  'is_tenant_owner()'     AS object_name,
  CASE
    WHEN p.oid IS NULL        THEN 'FUNZIONE ASSENTE'
    WHEN p.prosecdef = false  THEN 'NON e'' SECURITY DEFINER'
    ELSE                           'OK'
  END                     AS stato
FROM (SELECT 1) dummy
LEFT JOIN pg_proc p
  ON p.pronamespace = 'public'::regnamespace
 AND p.proname      = 'is_tenant_owner'
 AND p.pronargs     = 0;
-- PASS quando: stato = 'OK'.
-- FAIL se: FUNZIONE ASSENTE o NON è SECURITY DEFINER.
