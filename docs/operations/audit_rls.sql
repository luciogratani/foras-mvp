-- audit_rls.sql
-- -----------------------------------------------------------------------
-- Audit delle RLS policies su tutti gli schemi tenant registrati in
-- public.tenants, confrontato con lo schema di riferimento 'template'.
--
-- Output (3 query separate — ognuna "zero righe = ok"):
--   QUERY 1. Discrepanze di policy + tabelle attese senza RLS abilitata.
--   QUERY 2. GRANT minimi mancanti sui ruoli Supabase per ogni schema tenant.
--   QUERY 3. public.is_tenant_owner() assente o non SECURITY DEFINER.
--
-- Quando eseguirlo:
--   - Dopo ogni migrazione che tocca RLS o GRANT
--   - Come check prima di onboardare un nuovo cliente
--   - Dopo l'applicazione iniziale di create_schema_from_template.sql
--   - Dopo 2026-05-22_rls_hardening_template.sql (verifica helper + policy)
--
-- Uso:
--   \i docs/operations/audit_rls.sql
--   oppure incollare nel Supabase SQL editor (richiede service_role).
--
-- Vincoli:
--   - Read-only: nessun ALTER/CREATE/DROP.
--   - Idempotente: può essere eseguito più volte senza effetti collaterali.
--   - Dipendenze: pg_policy, pg_class, pg_namespace, pg_tables, pg_proc,
--     has_schema_privilege(), has_table_privilege().
--
-- Interpretazione risultati (vale per tutte e 3 le query):
--   Nessuna riga   → schema allineato (policy, RLS, GRANT, helper a posto).
--   Righe presenti → ogni riga è un problema da correggere (vedi colonna
--                    `problema`).
-- -----------------------------------------------------------------------


-- =======================================================================
-- QUERY 1 — Discrepanze di policy + tabelle senza RLS
-- =======================================================================

WITH reference_schema AS (
  -- Cambiare 'template' solo se si usa uno schema di riferimento diverso
  SELECT 'template' AS schema_name
),

all_tenant_schemas AS (
  SELECT schema_name FROM public.tenants
  UNION
  SELECT schema_name FROM reference_schema
),

-- Tutte le policies degli schemi monitorati
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
  WHERE  schema_name = (SELECT schema_name FROM reference_schema)
),

-- -----------------------------------------------------------------------
-- Parte 1: discrepanze di policy
-- -----------------------------------------------------------------------
discrepancies AS (

  -- Policy presente nel riferimento ma assente in uno schema tenant
  SELECT
    t.schema_name,
    r.table_name,
    r.policy_name,
    r.command,
    'MANCANTE nello schema tenant' AS problema
  FROM reference_policies r
  CROSS JOIN all_tenant_schemas t
  WHERE t.schema_name <> (SELECT schema_name FROM reference_schema)
    AND NOT EXISTS (
      SELECT 1 FROM policies_per_schema p
      WHERE p.schema_name = t.schema_name
        AND p.table_name  = r.table_name
        AND p.policy_name = r.policy_name
        AND p.command     = r.command
    )

  UNION ALL

  -- Policy presente in uno schema tenant ma assente nel riferimento
  SELECT
    p.schema_name,
    p.table_name,
    p.policy_name,
    p.command,
    'EXTRA rispetto al riferimento' AS problema
  FROM policies_per_schema p
  WHERE p.schema_name <> (SELECT schema_name FROM reference_schema)
    AND NOT EXISTS (
      SELECT 1 FROM reference_policies r
      WHERE r.table_name  = p.table_name
        AND r.policy_name = p.policy_name
        AND r.command     = p.command
    )
),

-- -----------------------------------------------------------------------
-- Parte 2: tabelle attese con RLS non abilitata
-- Fonte: 9 tabelle definite in create_schema_from_template.sql
-- -----------------------------------------------------------------------
expected_tables (table_name) AS (
  VALUES
    ('allergens'),
    ('menu_sections'),
    ('menu_categories'),
    ('menu_items'),
    ('time_slots'),
    ('bookings'),
    ('closed_dates'),
    ('site_settings'),
    ('news_slides')
),

tables_without_rls AS (
  SELECT
    t.schemaname  AS schema_name,
    t.tablename   AS table_name,
    NULL::text    AS policy_name,
    NULL::text    AS command,
    'RLS NON ABILITATA sulla tabella' AS problema
  FROM pg_tables t
  WHERE t.schemaname IN (SELECT schema_name FROM all_tenant_schemas)
    AND t.tablename   IN (SELECT table_name FROM expected_tables)
    AND t.rowsecurity = false
)

-- -----------------------------------------------------------------------
-- Risultato finale
-- -----------------------------------------------------------------------
SELECT schema_name, table_name, policy_name, command, problema
FROM   discrepancies

UNION ALL

SELECT schema_name, table_name, policy_name, command, problema
FROM   tables_without_rls

ORDER BY schema_name, table_name, policy_name;


-- =======================================================================
-- QUERY 2 — GRANT minimi mancanti sui ruoli Supabase
--
-- Per ogni schema tenant registrato (public.tenants + template) verifica i
-- GRANT attesi dal modello di create_schema_from_template.sql §3b:
--   - USAGE su schema   → anon, authenticated, service_role
--   - SELECT su tabelle → anon, authenticated
--   - INSERT su bookings→ anon (prenotazione pubblica)
--   - INSERT/UPDATE/DEL → authenticated (admin CRUD; RLS filtra per owner)
--
-- Usa has_schema_privilege()/has_table_privilege(): valuta il privilegio
-- EFFETTIVO (include eredità da PUBLIC/ruoli), coerente con ciò che il ruolo
-- può davvero fare a runtime.
--
-- Output: una riga per ogni GRANT atteso MANCANTE. Zero righe = ok.
-- =======================================================================

WITH tenant_schemas AS (
  SELECT schema_name FROM public.tenants
  UNION
  SELECT 'template'
),

-- GRANT attesi a livello di SCHEMA (USAGE)
expected_schema_grants (role_name, privilege) AS (
  VALUES
    ('anon',          'USAGE'),
    ('authenticated', 'USAGE'),
    ('service_role',  'USAGE')
),

-- GRANT attesi a livello di TABELLA, applicabili a TUTTE le tabelle attese
expected_table_grants_all (role_name, privilege) AS (
  VALUES
    ('anon',          'SELECT'),
    ('authenticated', 'SELECT'),
    ('authenticated', 'INSERT'),
    ('authenticated', 'UPDATE'),
    ('authenticated', 'DELETE')
),

-- GRANT attesi solo sulla tabella bookings (insert anonimo)
expected_bookings_grants (role_name, privilege) AS (
  VALUES
    ('anon', 'INSERT')
),

-- Le tabelle attese in ogni schema tenant (stessa lista di QUERY 1)
expected_tables_audit (table_name) AS (
  VALUES
    ('allergens'),
    ('menu_sections'),
    ('menu_categories'),
    ('menu_items'),
    ('time_slots'),
    ('bookings'),
    ('closed_dates'),
    ('site_settings'),
    ('news_slides')
),

-- USAGE su schema mancante
missing_schema_grants AS (
  SELECT
    s.schema_name,
    NULL::text          AS table_name,
    g.role_name,
    g.privilege,
    'GRANT ' || g.privilege || ' SU SCHEMA mancante per il ruolo' AS problema
  FROM tenant_schemas s
  CROSS JOIN expected_schema_grants g
  WHERE NOT has_schema_privilege(g.role_name, s.schema_name, g.privilege)
),

-- GRANT su tabella mancante (privilegi comuni a tutte le tabelle)
missing_table_grants AS (
  SELECT
    s.schema_name,
    t.table_name,
    g.role_name,
    g.privilege,
    'GRANT ' || g.privilege || ' SU TABELLA mancante per il ruolo' AS problema
  FROM tenant_schemas s
  CROSS JOIN expected_tables_audit t
  CROSS JOIN expected_table_grants_all g
  WHERE EXISTS (
    SELECT 1 FROM pg_tables pt
    WHERE pt.schemaname = s.schema_name
      AND pt.tablename  = t.table_name
  )
  AND NOT has_table_privilege(
        g.role_name,
        format('%I.%I', s.schema_name, t.table_name),
        g.privilege
      )
),

-- INSERT su bookings per anon mancante
missing_bookings_grants AS (
  SELECT
    s.schema_name,
    'bookings'::text    AS table_name,
    g.role_name,
    g.privilege,
    'GRANT ' || g.privilege || ' SU bookings mancante per il ruolo' AS problema
  FROM tenant_schemas s
  CROSS JOIN expected_bookings_grants g
  WHERE EXISTS (
    SELECT 1 FROM pg_tables pt
    WHERE pt.schemaname = s.schema_name
      AND pt.tablename  = 'bookings'
  )
  AND NOT has_table_privilege(
        g.role_name,
        format('%I.bookings', s.schema_name),
        g.privilege
      )
)

SELECT schema_name, table_name, role_name, privilege, problema
FROM   missing_schema_grants
UNION ALL
SELECT schema_name, table_name, role_name, privilege, problema
FROM   missing_table_grants
UNION ALL
SELECT schema_name, table_name, role_name, privilege, problema
FROM   missing_bookings_grants
ORDER BY schema_name, table_name, role_name, privilege;


-- =======================================================================
-- QUERY 3 — public.is_tenant_owner(): presenza + SECURITY DEFINER
--
-- L'hardening RLS scrittura (decision-log 2026-05-22) dipende da questa
-- funzione. Verifica che:
--   - esista in public con 0 argomenti;
--   - sia SECURITY DEFINER (prosecdef = true).
-- NB: la funzione è VOLUTAMENTE senza `SET search_path` (current_schema()
--     deve risolvere allo schema del chiamante) → l'avviso del linter
--     `function_search_path_mutable` è atteso e NON è un problema qui.
--
-- Output: una riga se la funzione è assente o non SECURITY DEFINER.
--         Zero righe = ok.
-- =======================================================================

SELECT
  'public'                                   AS schema_name,
  'is_tenant_owner()'                        AS object_name,
  CASE
    WHEN p.oid IS NULL
      THEN 'FUNZIONE public.is_tenant_owner() ASSENTE'
    WHEN p.prosecdef = false
      THEN 'public.is_tenant_owner() NON e'' SECURITY DEFINER'
  END                                        AS problema
FROM (SELECT 1) dummy
LEFT JOIN pg_proc p
  ON p.pronamespace = 'public'::regnamespace
 AND p.proname      = 'is_tenant_owner'
 AND p.pronargs     = 0
WHERE p.oid IS NULL
   OR p.prosecdef = false;
