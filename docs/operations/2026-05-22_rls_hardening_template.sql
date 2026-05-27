-- 2026-05-22_rls_hardening_template.sql
-- -----------------------------------------------------------------------
-- Hardening RLS scrittura (owner-scope) applicato allo schema 'template'
-- GIA' ESISTENTE (pre-freeze).
--
-- Cosa fa:
--   1. Crea/aggiorna la funzione helper public.is_tenant_owner()
--      (SECURITY DEFINER, STABLE) + REVOKE/GRANT EXECUTE.
--   2. Riscrive le 10 policy di scrittura admin del template da
--      `auth.uid() IS NOT NULL` a `public.is_tenant_owner()`:
--        menu_sections_admin_all, menu_categories_admin_all,
--        menu_items_admin_all, time_slots_admin_all, closed_dates_admin_all,
--        site_settings_admin_all, news_slides_admin_all,
--        bookings_admin_select, bookings_admin_update, bookings_admin_delete.
--
-- Cosa NON tocca:
--   - Le policy *_public_read (FOR SELECT USING (true)) → lettura pubblica
--     invariata. Non vanno droppate/ricreate.
--   - La policy bookings_public_insert (FOR INSERT WITH CHECK (true)) →
--     insert anonimo di prenotazioni invariato.
--   - GRANT, tabelle, seed, RLS enable: già presenti dal create iniziale.
--
-- STATO: contesto Sprint 6 — template freeze + hardening RLS scrittura.
-- Decisione: decision-log "2026-05-22 — Hardening RLS scrittura: owner
--            verificato contro public.tenants via funzione SECURITY DEFINER".
--
-- Applicare a: template (pre-freeze).
--
-- USO:
--   Eseguire come service_role dal Supabase SQL editor, oppure:
--     psql $DATABASE_URL -f 2026-05-22_rls_hardening_template.sql
--
-- IDEMPOTENTE: CREATE OR REPLACE FUNCTION + DROP POLICY IF EXISTS … ; CREATE.
--   Rieseguibile più volte senza errori.
--
-- VERIFICA POST-APPLICAZIONE:
--   - docs/operations/audit_rls.sql → atteso zero righe sul template
--     (RLS + GRANT + helper presenti).
--   - docs/operations/rls_isolation_tests.sql Sezione 3 → 3.1/3.2/3.3/3.4 PASS.
-- -----------------------------------------------------------------------


-- -----------------------------------------------------------------------
-- 1. Helper di ownership — public.is_tenant_owner()
--
-- ⚠️  GOTCHA — NON aggiungere `SET search_path` a questa funzione.
--     current_schema() deve risolvere allo schema del CHIAMANTE (lo schema
--     tenant che PostgREST mette nel search_path per-richiesta). Un
--     `SET search_path = ...` fisserebbe lo schema della funzione → nessun
--     owner combacerebbe mai → tutte le scritture verrebbero bloccate in
--     silenzio. La protezione da search_path hijacking è garantita invece
--     qualificando completamente l'unico oggetto referenziato (public.tenants).
--     Il linter Supabase segnalerà `function_search_path_mutable`: è ATTESO
--     e va lasciato così di proposito — NON "correggerlo" aggiungendo
--     SET search_path (romperebbe l'hardening).
--
-- Coerente con create_schema_from_template.sql §3c (stessa definizione).
-- -----------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_tenant_owner()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenants
    WHERE schema_name = current_schema()
      AND owner_id    = auth.uid()
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_tenant_owner() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.is_tenant_owner() TO authenticated, service_role;


-- -----------------------------------------------------------------------
-- 2. Riscrittura delle 10 policy di scrittura admin sullo schema template
--
-- Drop/recreate idempotente. Testo allineato a create_schema_from_template.sql
-- §4 (stesso USING (public.is_tenant_owner())).
-- Le *_public_read e bookings_public_insert NON vengono toccate.
-- -----------------------------------------------------------------------

-- menu_sections
DROP POLICY IF EXISTS "menu_sections_admin_all" ON template.menu_sections;
CREATE POLICY "menu_sections_admin_all"
  ON template.menu_sections FOR ALL USING (public.is_tenant_owner());

-- menu_categories
DROP POLICY IF EXISTS "menu_categories_admin_all" ON template.menu_categories;
CREATE POLICY "menu_categories_admin_all"
  ON template.menu_categories FOR ALL USING (public.is_tenant_owner());

-- menu_items
DROP POLICY IF EXISTS "menu_items_admin_all" ON template.menu_items;
CREATE POLICY "menu_items_admin_all"
  ON template.menu_items FOR ALL USING (public.is_tenant_owner());

-- time_slots
DROP POLICY IF EXISTS "time_slots_admin_all" ON template.time_slots;
CREATE POLICY "time_slots_admin_all"
  ON template.time_slots FOR ALL USING (public.is_tenant_owner());

-- closed_dates
DROP POLICY IF EXISTS "closed_dates_admin_all" ON template.closed_dates;
CREATE POLICY "closed_dates_admin_all"
  ON template.closed_dates FOR ALL USING (public.is_tenant_owner());

-- site_settings
DROP POLICY IF EXISTS "site_settings_admin_all" ON template.site_settings;
CREATE POLICY "site_settings_admin_all"
  ON template.site_settings FOR ALL USING (public.is_tenant_owner());

-- news_slides
DROP POLICY IF EXISTS "news_slides_admin_all" ON template.news_slides;
CREATE POLICY "news_slides_admin_all"
  ON template.news_slides FOR ALL USING (public.is_tenant_owner());

-- bookings (SELECT / UPDATE / DELETE admin — l'INSERT pubblico non si tocca)
DROP POLICY IF EXISTS "bookings_admin_select" ON template.bookings;
CREATE POLICY "bookings_admin_select"
  ON template.bookings FOR SELECT USING (public.is_tenant_owner());

DROP POLICY IF EXISTS "bookings_admin_update" ON template.bookings;
CREATE POLICY "bookings_admin_update"
  ON template.bookings FOR UPDATE USING (public.is_tenant_owner());

DROP POLICY IF EXISTS "bookings_admin_delete" ON template.bookings;
CREATE POLICY "bookings_admin_delete"
  ON template.bookings FOR DELETE USING (public.is_tenant_owner());


-- -----------------------------------------------------------------------
-- Fine script
-- Eseguire docs/operations/audit_rls.sql (atteso 0 righe) e la Sezione 3
-- di docs/operations/rls_isolation_tests.sql (3.1–3.4 PASS) per confermare.
-- -----------------------------------------------------------------------
