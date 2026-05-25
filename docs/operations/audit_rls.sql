-- audit_rls.sql
-- -----------------------------------------------------------------------
-- Audit delle RLS policies su tutti gli schemi tenant registrati in
-- public.tenants, confrontato con lo schema di riferimento 'template'.
--
-- Output:
--   1. Discrepanze di policy (presenti in un solo schema → da correggere
--      con una migrazione numerata)
--   2. Tabelle attese con RLS non abilitata
--
-- Quando eseguirlo:
--   - Dopo ogni migrazione che tocca RLS
--   - Come check prima di onboardare un nuovo cliente
--   - Dopo l'applicazione iniziale di create_schema_from_template.sql
--
-- Uso:
--   \i docs/operations/audit_rls.sql
--   oppure incollare nel Supabase SQL editor (richiede service_role).
--
-- Vincoli:
--   - Read-only: nessun ALTER/CREATE/DROP.
--   - Idempotente: può essere eseguito più volte senza effetti collaterali.
--   - Dipendenze: solo pg_policy, pg_class, pg_namespace, pg_tables.
--
-- Interpretazione risultati:
--   Nessuna riga   → tutti gli schemi sono allineati e RLS è attiva ovunque.
--   Righe presenti → ogni riga è una discrepanza da correggere.
-- -----------------------------------------------------------------------

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
