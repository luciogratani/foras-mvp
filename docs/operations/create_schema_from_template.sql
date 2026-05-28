-- create_schema_from_template.sql
-- -----------------------------------------------------------------------
-- Script di onboarding: crea un nuovo schema tenant a partire dal template.
--
-- STATO: parametrizzato con psql -v (Sprint 6 / A2, 2026-05-27).
--        Struttura tabelle, RLS e policy invariate rispetto al baseline A1.
--
-- USO:
--   psql $DATABASE_URL \
--     -v schema=bar_rossi \
--     -v owner_uuid=<uuid-dell-admin> \
--     -f docs/operations/create_schema_from_template.sql
--
--   Le variabili sono OBBLIGATORIE — lo script fallisce in testa se mancano.
--
-- PER RICREARE IL TENANT 'template' (snapshot identico al baseline):
--   psql $DATABASE_URL \
--     -v schema=template \
--     -v owner_uuid=1c486961-12b2-47d0-8aef-0aee30df083c \
--     -f docs/operations/create_schema_from_template.sql
--
-- CAVEAT:
--   Le variabili :var funzionano in psql, NON nel Supabase SQL editor.
--   L'onboarding è quindi un'operazione da CLI (psql), eseguita dal master/dev.
--
-- DIPENDENZE:
--   - Tabella public.tenants deve esistere
--   - L'utente admin del tenant deve essere già creato in auth.users
--     con user_metadata.schema = '<schema>'
--   - La funzione public.is_tenant_owner() deve esistere (condivisa tra tutti
--     i tenant, creata una volta sola in public — vedi §3c)
--
-- IDEMPOTENZA:
--   CREATE SCHEMA IF NOT EXISTS e CREATE TABLE IF NOT EXISTS rendono lo script
--   rieseguibile, ma i blocchi INSERT (§5 seed + §6 public.tenants) NON sono
--   idempotenti: rieseguire su uno schema già seedato DUPLICA i dati.
--   Lo script è progettato per uno schema NUOVO.
-- -----------------------------------------------------------------------


-- -----------------------------------------------------------------------
-- Guard: fallisce subito se le variabili obbligatorie non sono state passate.
-- ":?" è la forma psql per "variabile non impostata → errore".
-- Queste righe producono errori "invalid variable name" nel Supabase SQL
-- editor (che non supporta le variabili psql): usare esclusivamente psql.
-- -----------------------------------------------------------------------

\if :{?schema}
\else
\warn 'ERRORE: variabile "schema" non impostata. Passarla con -v schema=<nome_schema>'
\quit
\endif

\if :{?owner_uuid}
\else
\warn 'ERRORE: variabile "owner_uuid" non impostata. Passarla con -v owner_uuid=<uuid>'
\quit
\endif


-- -----------------------------------------------------------------------
-- 0. Bootstrap public.tenants (idempotente — safe se già esiste)
-- -----------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.tenants (
  schema_name TEXT        PRIMARY KEY,
  owner_id    UUID        NOT NULL REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS su public.tenants: la tabella è nello schema public esposto a PostgREST →
-- senza RLS un client API (anon/authenticated) potrebbe enumerare schemi tenant
-- e owner_id (chiude il linter Supabase 0013_rls_disabled_in_public).
-- NESSUNA policy di proposito: anon/authenticated sono negati via API. L'accesso
-- legittimo resta garantito da chi bypassa la RLS non-FORCE:
--   - service_role (BYPASSRLS) → auth admin getVerifiedTenantClient + audit_rls.sql;
--   - public.is_tenant_owner() (SECURITY DEFINER, owner = owner della tabella) →
--     legge public.tenants per le policy di scrittura dei tenant.
-- Idempotente: ENABLE su tabella già abilitata è un no-op.
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;


-- -----------------------------------------------------------------------
-- 1. Creazione schema
-- -----------------------------------------------------------------------

CREATE SCHEMA IF NOT EXISTS :"schema";
SET search_path = :"schema";


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
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  label       TEXT        NOT NULL,   -- es. "Pranzo", "Cena"
  time        TIME        NOT NULL,
  end_time    TIME,                   -- NULL = orario fisso; valorizzato = finestra [time, end_time] per prenotazioni a orario libero
  max_covers  INTEGER     NOT NULL,
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  archived_at TIMESTAMPTZ            -- NULL = attivo; valorizzato = archiviato (nascosto da admin/sito, storico conservato)
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
  preferred_time     TIME,
  cancellation_token UUID        NOT NULL DEFAULT gen_random_uuid(),
  status             TEXT        NOT NULL DEFAULT 'confirmed'
                                 CHECK (status IN ('confirmed', 'cancelled')),
  gdpr_consent       BOOLEAN     NOT NULL DEFAULT false,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Una sola prenotazione per email per turno per data
  UNIQUE (email, time_slot_id, date)
);

-- Chiusure straordinarie (ferie, festività, serate private)
CREATE TABLE closed_dates (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date     DATE NOT NULL,
  end_date DATE,                  -- NULL = giorno singolo; valorizzato = intervallo [date, end_date]
  reason   TEXT,
  UNIQUE (date),
  CONSTRAINT closed_dates_end_after_start CHECK (end_date IS NULL OR end_date >= date)
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
    "monday":    {"closed": true, "ranges": []},
    "tuesday":   {"closed": true, "ranges": []},
    "wednesday": {"closed": true, "ranges": []},
    "thursday":  {"closed": true, "ranges": []},
    "friday":    {"closed": true, "ranges": []},
    "saturday":  {"closed": true, "ranges": []},
    "sunday":    {"closed": true, "ranges": []}
  }'::jsonb,
  social_whatsapp  TEXT,
  social_instagram TEXT,
  social_facebook  TEXT,
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  extra_data       JSONB   NOT NULL DEFAULT '{}'
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
ALTER TABLE closed_dates  ENABLE ROW LEVEL SECURITY;
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

GRANT USAGE ON SCHEMA :"schema" TO anon, authenticated, service_role;

GRANT SELECT ON ALL TABLES IN SCHEMA :"schema" TO anon, authenticated;
GRANT INSERT ON :"schema".bookings TO anon;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA :"schema" TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA :"schema" TO service_role;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA :"schema" TO anon, authenticated;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA :"schema" TO service_role;

-- Default per oggetti creati in futuro nello schema (post-freeze migrations)
ALTER DEFAULT PRIVILEGES IN SCHEMA :"schema" GRANT SELECT ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA :"schema" GRANT INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA :"schema" GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA :"schema" GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA :"schema" GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO service_role;


-- -----------------------------------------------------------------------
-- 3c. Helper di ownership — public.is_tenant_owner()
--
-- Verifica che l'utente autenticato corrente (auth.uid()) sia l'owner
-- registrato in public.tenants per lo schema tenant corrente. Usata dalle
-- policy di scrittura (§4) per legare ogni scrittura admin all'owner dello
-- schema invece che a "un qualsiasi utente autenticato" (auth.users è
-- condiviso a livello di progetto → auth.uid() IS NOT NULL non isola i tenant).
--
-- ⚠️  FUNZIONE CONDIVISA — NON PARAMETRIZZATA.
--     public.is_tenant_owner() vive in public ed è condivisa da tutti i tenant.
--     Va creata UNA SOLA VOLTA (o idempotente con CREATE OR REPLACE) e usa
--     current_schema() a runtime per sapere in quale schema opera.
--     Non va ricreata per ogni tenant: eseguire questa sezione la prima volta,
--     poi è già presente per i tenant successivi.
--
-- ⚠️  GOTCHA — NON aggiungere `SET search_path` a questa funzione.
--     current_schema() deve risolvere allo schema del CHIAMANTE (lo schema
--     tenant che PostgREST mette nel search_path per-richiesta). Un
--     `SET search_path = ...` fisserebbe lo schema della funzione → nessun
--     owner combacerebbe mai → tutte le scritture verrebbero bloccate in
--     silenzio. La protezione da search_path hijacking è garantita invece
--     qualificando completamente l'unico oggetto referenziato (public.tenants);
--     auth.uid() è già schema-qualificato e current_schema() è un builtin di
--     pg_catalog.
--     Il linter Supabase segnalerà `function_search_path_mutable` su questa
--     funzione: è ATTESO e va lasciato così di proposito — NON "correggerlo"
--     aggiungendo SET search_path (romperebbe l'hardening).
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
-- 4. RLS — policies
--
-- Modello: utente anonimo = visitatore homepage (sola lettura su dati pubblici)
--          utente autenticato = admin del tenant (CRUD completo SE owner)
--
-- Le policy di scrittura usano public.is_tenant_owner() (§3c): solo l'owner
-- registrato in public.tenants per lo schema corrente può scrivere. La lettura
-- pubblica (*_public_read) e l'insert anonimo di prenotazioni
-- (bookings_public_insert) restano invariati — USING (true)/WITH CHECK (true).
-- Nota: per le policy FOR SELECT, PostgreSQL combina in OR le policy dello
-- stesso comando → la SELECT resta pubblica (true OR is_tenant_owner()).
-- INSERT/UPDATE/DELETE hanno solo la policy admin → richiedono owner.
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
  ON menu_sections FOR ALL USING (public.is_tenant_owner());

-- menu_categories: lettura pubblica, scrittura solo admin
CREATE POLICY "menu_categories_public_read"
  ON menu_categories FOR SELECT USING (true);
CREATE POLICY "menu_categories_admin_all"
  ON menu_categories FOR ALL USING (public.is_tenant_owner());

-- menu_items: lettura pubblica, scrittura solo admin
CREATE POLICY "menu_items_public_read"
  ON menu_items FOR SELECT USING (true);
CREATE POLICY "menu_items_admin_all"
  ON menu_items FOR ALL USING (public.is_tenant_owner());

-- time_slots: lettura pubblica (serve per il form prenotazioni), scrittura solo admin
CREATE POLICY "time_slots_public_read"
  ON time_slots FOR SELECT USING (true);
CREATE POLICY "time_slots_admin_all"
  ON time_slots FOR ALL USING (public.is_tenant_owner());

-- bookings: inserimento anonimo (chiunque può prenotare),
--           lettura e modifica solo admin,
--           cancellazione via edge function (service_role, bypassa RLS)
CREATE POLICY "bookings_public_insert"
  ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "bookings_admin_select"
  ON bookings FOR SELECT USING (public.is_tenant_owner());
CREATE POLICY "bookings_admin_update"
  ON bookings FOR UPDATE USING (public.is_tenant_owner());
CREATE POLICY "bookings_admin_delete"
  ON bookings FOR DELETE USING (public.is_tenant_owner());

-- site_settings: lettura pubblica (SSR homepage), scrittura solo admin
CREATE POLICY "site_settings_public_read"
  ON site_settings FOR SELECT USING (true);
CREATE POLICY "site_settings_admin_all"
  ON site_settings FOR ALL USING (public.is_tenant_owner());

-- closed_dates: lettura pubblica (necessaria per bloccare prenotazioni lato pubblico), scrittura solo admin
CREATE POLICY "closed_dates_public_read"
  ON closed_dates FOR SELECT USING (true);
CREATE POLICY "closed_dates_admin_all"
  ON closed_dates FOR ALL USING (public.is_tenant_owner());

-- news_slides: lettura pubblica, scrittura solo admin
CREATE POLICY "news_slides_public_read"
  ON news_slides FOR SELECT USING (true);
CREATE POLICY "news_slides_admin_all"
  ON news_slides FOR ALL USING (public.is_tenant_owner());


-- -----------------------------------------------------------------------
-- 4b. Vincolo DB anti-overbooking (trigger BEFORE INSERT su bookings)
--
-- Rete di sicurezza per la race "check capacità + insert" non atomica del
-- service layer (createBooking): due insert simultanei sullo stesso turno/data
-- potrebbero superare max_covers. Il check applicativo resta per il messaggio
-- UX; questo trigger rende il vincolo autoritativo a livello DB.
--
-- ⚠️  SET search_path = '' DI PROPOSITO (l'opposto del divieto su
--     public.is_tenant_owner()): qui ogni oggetto è qualificato esplicitamente
--     (tabelle via TG_TABLE_SCHEMA + format %I, builtin in pg_catalog), e lo
--     schema target è quello della TABELLA, non del chiamante → fissarlo è
--     corretto e blocca il search_path hijacking. SECURITY DEFINER serve per
--     contare TUTTE le prenotazioni confermate bypassando la RLS owner-scope.
--
-- Mantenuto in sync con migrations/002_bookings_overbooking_trigger.sql.
-- -----------------------------------------------------------------------

CREATE OR REPLACE FUNCTION check_booking_capacity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_max    integer;
  v_booked integer;
BEGIN
  -- Solo le prenotazioni confermate consumano capacità.
  IF NEW.status IS DISTINCT FROM 'confirmed' THEN
    RETURN NEW;
  END IF;

  EXECUTE format('SELECT max_covers FROM %I.time_slots WHERE id = $1', TG_TABLE_SCHEMA)
    INTO v_max USING NEW.time_slot_id;

  -- Slot inesistente: lasciamo decidere alla FK bookings_time_slot_id_fkey.
  IF v_max IS NULL THEN
    RETURN NEW;
  END IF;

  EXECUTE format('SELECT COALESCE(SUM(covers), 0) FROM %I.bookings WHERE time_slot_id = $1 AND date = $2 AND status = ''confirmed''', TG_TABLE_SCHEMA)
    INTO v_booked USING NEW.time_slot_id, NEW.date;

  IF v_booked + NEW.covers > v_max THEN
    RAISE EXCEPTION
      'Overbooking: turno % data % — richiesti % coperti, disponibili %',
      NEW.time_slot_id, NEW.date, NEW.covers, GREATEST(v_max - v_booked, 0)
      USING ERRCODE = 'OB001';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bookings_capacity_check ON bookings;
CREATE TRIGGER bookings_capacity_check
  BEFORE INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_booking_capacity();


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
VALUES (:'schema', :'owner_uuid'::uuid);


-- -----------------------------------------------------------------------
-- Fine script
-- Verificare con l'audit RLS (docs/operations/audit_rls.sql) prima di procedere
-- con il resto dell'onboarding.
-- -----------------------------------------------------------------------
