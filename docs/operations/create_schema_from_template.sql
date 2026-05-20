-- create_schema_from_template.sql
-- -----------------------------------------------------------------------
-- Script di onboarding: crea un nuovo schema tenant a partire dal template.
--
-- STATO: bozza — basata sul data model in tech-architecture/data-model.md.
-- Da verificare e finalizzare contestualmente alla scrittura di schema.sql
-- nel repo-template (post-freeze).
--
-- USO:
--   Sostituire 'nome_schema' con il nome del bar (es. 'bar_rossi').
--   Eseguire come service_role dal Supabase SQL editor o tramite psql.
--
--   psql $DATABASE_URL -v schema=bar_rossi -f create_schema_from_template.sql
--
-- DIPENDENZE:
--   - Tabella public.tenants deve esistere
--   - L'utente admin del tenant deve essere già creato in auth.users
--     con user_metadata.schema = 'nome_schema'
-- -----------------------------------------------------------------------

-- ⚠️  Schema e owner già impostati per il tenant 'template'
--     (usare psql con \set per altri tenant)


-- -----------------------------------------------------------------------
-- 0. Bootstrap public.tenants (idempotente — safe se già esiste)
-- -----------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.tenants (
  schema_name TEXT        PRIMARY KEY,
  owner_id    UUID        NOT NULL REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- -----------------------------------------------------------------------
-- 1. Creazione schema
-- -----------------------------------------------------------------------

CREATE SCHEMA IF NOT EXISTS template;
SET search_path = template;


-- -----------------------------------------------------------------------
-- 2. Tabelle
-- -----------------------------------------------------------------------

-- Allergeni (14 obbligatori per legge — Reg. UE 1169/2011)
-- Non modificabili dal gestore, popolati una volta sola al momento dell'onboarding.
CREATE TABLE allergens (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL
);

-- Sezioni menu (Colazione, Pranzo, Aperitivo, Cena, Cocktail, Carta dei vini)
-- Il gestore può rinominarle e abilitare/disabilitare, non crearne di nuove.
CREATE TABLE menu_sections (
  id        UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  name      TEXT    NOT NULL,
  position  INTEGER,           -- NULL = in coda, ordine alfabetico tra i NULL
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Categorie menu (figlie di una section)
CREATE TABLE menu_categories (
  id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID    NOT NULL REFERENCES menu_sections(id) ON DELETE CASCADE,
  name       TEXT    NOT NULL,
  position   INTEGER,
  is_active  BOOLEAN NOT NULL DEFAULT true
);

-- Voci menu
CREATE TABLE menu_items (
  id           UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id  UUID           NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
  name         TEXT           NOT NULL,
  description  TEXT,
  price        NUMERIC(8, 2)  NOT NULL,
  position     INTEGER,
  is_active    BOOLEAN        NOT NULL DEFAULT true,
  image_url    TEXT,
  allergen_ids UUID[]         NOT NULL DEFAULT '{}'   -- FK → allergens.id (enforced a livello applicativo)
);

-- Turni disponibili (configurati dal gestore)
CREATE TABLE time_slots (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  label       TEXT    NOT NULL,   -- es. "Pranzo", "Cena"
  time        TIME    NOT NULL,
  max_covers  INTEGER NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT true
);

-- Prenotazioni
CREATE TABLE bookings (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  time_slot_id       UUID        NOT NULL REFERENCES time_slots(id),
  date               DATE        NOT NULL,
  name               TEXT        NOT NULL,
  email              TEXT        NOT NULL,
  phone              TEXT,
  covers             INTEGER     NOT NULL,
  notes              TEXT,
  cancellation_token UUID        NOT NULL DEFAULT gen_random_uuid(),
  status             TEXT        NOT NULL DEFAULT 'confirmed'
                                 CHECK (status IN ('confirmed', 'cancelled')),
  gdpr_consent       BOOLEAN     NOT NULL DEFAULT false,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Una sola prenotazione per email per turno per data
  UNIQUE (email, time_slot_id, date)
);

-- Impostazioni sito e SEO (riga unica per tenant)
CREATE TABLE site_settings (
  id            UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT,
  description   TEXT,
  og_image      TEXT,
  slogan        TEXT,
  bio           TEXT,
  address       TEXT,
  phone         TEXT,
  email         TEXT,
  opening_hours JSONB NOT NULL DEFAULT '{
    "monday":    {"open": null, "close": null, "closed": true},
    "tuesday":   {"open": null, "close": null, "closed": true},
    "wednesday": {"open": null, "close": null, "closed": true},
    "thursday":  {"open": null, "close": null, "closed": true},
    "friday":    {"open": null, "close": null, "closed": true},
    "saturday":  {"open": null, "close": null, "closed": true},
    "sunday":    {"open": null, "close": null, "closed": true}
  }'::jsonb
);

-- Popup / novità (slide multiple, stessi contenuti della sezione news in homepage)
CREATE TABLE news_slides (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT        NOT NULL,
  body       TEXT,
  image_url  TEXT,
  position   INTEGER,
  is_active  BOOLEAN     NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- -----------------------------------------------------------------------
-- 3. RLS — abilitazione su tutte le tabelle
-- -----------------------------------------------------------------------

ALTER TABLE allergens     ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots    ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_slides   ENABLE ROW LEVEL SECURITY;


-- -----------------------------------------------------------------------
-- 3b. GRANT espliciti per i ruoli Supabase
--
-- IMPORTANTE: senza questi GRANT, qualsiasi query allo schema viene respinta
-- da Postgres con 42501 "permission denied" PRIMA che le RLS vengano valutate.
-- Le RLS filtrano solo righe — i GRANT autorizzano l'accesso alla tabella.
-- Scoperto in Sprint 1 al primo smoke test admin: vedi voce
-- "GRANT espliciti per i ruoli Supabase" nel decision-log.
--
-- Note:
--   anon          → visitatore homepage (read pubblico + insert bookings)
--   authenticated → admin del tenant loggato (CRUD; RLS filtra per ruolo)
--   service_role  → server-side (Edge Functions, supabaseAdmin) — bypassa RLS
-- -----------------------------------------------------------------------

GRANT USAGE ON SCHEMA template TO anon, authenticated, service_role;

GRANT SELECT ON ALL TABLES IN SCHEMA template TO anon, authenticated;
GRANT INSERT ON template.bookings TO anon;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA template TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA template TO service_role;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA template TO anon, authenticated;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA template TO service_role;

-- Default per oggetti creati in futuro nello schema (post-freeze migrations)
ALTER DEFAULT PRIVILEGES IN SCHEMA template GRANT SELECT ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA template GRANT INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA template GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA template GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA template GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO service_role;


-- -----------------------------------------------------------------------
-- 4. RLS — policies
--
-- Modello: utente anonimo = visitatore homepage (sola lettura su dati pubblici)
--          utente autenticato = admin del tenant (CRUD completo)
--
-- ⚠️  Queste policies assumono un solo admin per schema.
--     Se in futuro si aggiungono ruoli multipli, rivedere.
-- -----------------------------------------------------------------------

-- allergens: lettura pubblica, nessuna scrittura dal client (solo onboarding)
CREATE POLICY "allergens_public_read"
  ON allergens FOR SELECT USING (true);

-- menu_sections: lettura pubblica, scrittura solo admin
CREATE POLICY "menu_sections_public_read"
  ON menu_sections FOR SELECT USING (true);
CREATE POLICY "menu_sections_admin_all"
  ON menu_sections FOR ALL USING (auth.uid() IS NOT NULL);

-- menu_categories: lettura pubblica, scrittura solo admin
CREATE POLICY "menu_categories_public_read"
  ON menu_categories FOR SELECT USING (true);
CREATE POLICY "menu_categories_admin_all"
  ON menu_categories FOR ALL USING (auth.uid() IS NOT NULL);

-- menu_items: lettura pubblica, scrittura solo admin
CREATE POLICY "menu_items_public_read"
  ON menu_items FOR SELECT USING (true);
CREATE POLICY "menu_items_admin_all"
  ON menu_items FOR ALL USING (auth.uid() IS NOT NULL);

-- time_slots: lettura pubblica (serve per il form prenotazioni), scrittura solo admin
CREATE POLICY "time_slots_public_read"
  ON time_slots FOR SELECT USING (true);
CREATE POLICY "time_slots_admin_all"
  ON time_slots FOR ALL USING (auth.uid() IS NOT NULL);

-- bookings: inserimento anonimo (chiunque può prenotare),
--           lettura e modifica solo admin,
--           cancellazione via edge function (service_role, bypassa RLS)
CREATE POLICY "bookings_public_insert"
  ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "bookings_admin_select"
  ON bookings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "bookings_admin_update"
  ON bookings FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "bookings_admin_delete"
  ON bookings FOR DELETE USING (auth.uid() IS NOT NULL);

-- site_settings: lettura pubblica (SSR homepage), scrittura solo admin
CREATE POLICY "site_settings_public_read"
  ON site_settings FOR SELECT USING (true);
CREATE POLICY "site_settings_admin_all"
  ON site_settings FOR ALL USING (auth.uid() IS NOT NULL);

-- news_slides: lettura pubblica, scrittura solo admin
CREATE POLICY "news_slides_public_read"
  ON news_slides FOR SELECT USING (true);
CREATE POLICY "news_slides_admin_all"
  ON news_slides FOR ALL USING (auth.uid() IS NOT NULL);


-- -----------------------------------------------------------------------
-- 5. Seed — dati iniziali
-- -----------------------------------------------------------------------

-- 5a. Allergeni (14 obbligatori Reg. UE 1169/2011)
INSERT INTO allergens (name) VALUES
  ('Glutine'),
  ('Crostacei'),
  ('Uova'),
  ('Pesce'),
  ('Arachidi'),
  ('Soia'),
  ('Latte'),
  ('Frutta a guscio'),
  ('Sedano'),
  ('Senape'),
  ('Semi di sesamo'),
  ('Anidride solforosa e solfiti'),
  ('Lupini'),
  ('Molluschi');

-- 5b. Sezioni menu predefinite
INSERT INTO menu_sections (name, position, is_active) VALUES
  ('Colazione',      1, true),
  ('Pranzo',         2, true),
  ('Aperitivo',      3, true),
  ('Cena',           4, true),
  ('Cocktail',       5, false),  -- disabilitato di default, attivabile
  ('Carta dei vini', 6, false);  -- disabilitato di default, attivabile

-- 5c. Riga unica site_settings (valori placeholder)
INSERT INTO site_settings (title, description) VALUES
  ('Nome del locale', 'Descrizione del locale — da personalizzare nel backoffice');

-- 5d. Turni di prenotazione (due placeholder ragionevoli)
-- Un tenant senza time_slots non ha form prenotazioni utilizzabile: il gestore
-- aggiusterà orari e capacità dal backoffice. Default ragionevole per un bar:
-- pranzo 12:30 (30 coperti) + cena 20:00 (50 coperti), entrambi attivi.
INSERT INTO time_slots (label, time, max_covers, is_active) VALUES
  ('Pranzo', '12:30', 30, true),
  ('Cena',   '20:00', 50, true);


-- -----------------------------------------------------------------------
-- 6. Registrazione in public.tenants
-- -----------------------------------------------------------------------

INSERT INTO public.tenants (schema_name, owner_id)
VALUES ('template', '1c486961-12b2-47d0-8aef-0aee30df083c'::uuid);


-- -----------------------------------------------------------------------
-- Fine script
-- Verificare con l'audit RLS (docs/operations/audit_rls.sql) prima di procedere
-- con il resto dell'onboarding.
-- -----------------------------------------------------------------------
