-- migration-2026-05-23-schema-extras.sql
-- -----------------------------------------------------------------------
-- Migrazione: aggiunta colonne extra_data, social, maintenance_mode in
-- site_settings; aggiunta end_date + constraint in closed_dates.
--
-- USO: eseguire nel SQL editor del Supabase dashboard come service_role.
-- Le istruzioni sono idempotenti (IF NOT EXISTS / IF NOT EXISTS sui constraint).
-- Nessuna policy RLS nuova: le nuove colonne ereditano le policy della tabella.
--
-- Data: 2026-05-23
-- -----------------------------------------------------------------------


-- -----------------------------------------------------------------------
-- 1. Nuove colonne site_settings
-- -----------------------------------------------------------------------

ALTER TABLE template.site_settings
  ADD COLUMN IF NOT EXISTS extra_data        JSONB    NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS social_whatsapp   TEXT,
  ADD COLUMN IF NOT EXISTS social_instagram  TEXT,
  ADD COLUMN IF NOT EXISTS social_facebook   TEXT,
  ADD COLUMN IF NOT EXISTS maintenance_mode  BOOLEAN  NOT NULL DEFAULT false;


-- -----------------------------------------------------------------------
-- 2. Supporto range in closed_dates
--    end_date nullable = giorno singolo quando NULL
-- -----------------------------------------------------------------------

ALTER TABLE template.closed_dates
  ADD COLUMN IF NOT EXISTS end_date DATE;

-- Constraint: end_date >= date (solo quando valorizzato)
ALTER TABLE template.closed_dates
  ADD CONSTRAINT closed_dates_end_after_start
  CHECK (end_date IS NULL OR end_date >= date);


-- -----------------------------------------------------------------------
-- Fine migrazione
-- -----------------------------------------------------------------------
