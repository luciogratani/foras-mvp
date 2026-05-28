-- =======================================================================
-- schema.sql — BASELINE TENANT CONGELATO (FROZEN)
-- =======================================================================
-- Freeze: 2026-05-27 (Sprint 6 / A4). PostgreSQL 15.8.
--
-- FONTE DI VERITÀ STRUTTURALE post-freeze di un singolo schema tenant.
-- Generato via `pg_dump --schema-only` di uno schema usa-e-getta (`freeze_test`)
-- creato dallo script di onboarding `docs/operations/create_schema_from_template.sql`,
-- e validato IDENTICO a `template` dall'audit (`audit_rls.sql` → 0 discrepanze
-- su policy/RLS/GRANT/helper).
--
-- ⚠️  NON modificare a mano e NON eseguire direttamente.
--   - Ogni cambiamento di schema post-freeze passa per una migrazione numerata
--     in `/migrations` (vedi `docs/operations/migration-runbook.md`).
--   - Il provisioning di un nuovo tenant si fa con lo script parametrizzato
--     `create_schema_from_template.sql` (psql -v schema=... -v owner_uuid=...),
--     NON applicando questo file.
--
-- NON incluso qui — oggetti GLOBALI in `public`, condivisi tra i tenant e creati
-- una volta sola dallo script di onboarding (§0 e §3c):
--   - `public.tenants`        (registro schema→owner, RLS abilitata)
--   - `public.is_tenant_owner()` (SECURITY DEFINER, usata dalle policy owner-scope)
--
-- Lo schema è nominato `template` come riferimento canonico (lo stesso usato da
-- `audit_rls.sql`). NB: lo schema `template` *live* resta un sandbox dev/test —
-- questo file è una fotografia di struttura, non un'istantanea di quel sandbox.
-- =======================================================================


--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.8

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: template; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA template;


ALTER SCHEMA template OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: check_booking_capacity(); Type: FUNCTION; Schema: template; Owner: postgres
--

CREATE FUNCTION template.check_booking_capacity() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
DECLARE
  v_max    integer;
  v_booked integer;
BEGIN
  -- Solo le prenotazioni confermate consumano capacità.
  IF NEW.status IS DISTINCT FROM 'confirmed' THEN
    RETURN NEW;
  END IF;

  EXECUTE format('SELECT max_covers FROM %I.time_slots WHERE id = $1 FOR UPDATE', TG_TABLE_SCHEMA)
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


ALTER FUNCTION template.check_booking_capacity() OWNER TO postgres;

--
-- Name: allergens; Type: TABLE; Schema: template; Owner: postgres
--

CREATE TABLE template.allergens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL
);


ALTER TABLE template.allergens OWNER TO postgres;

--
-- Name: bookings; Type: TABLE; Schema: template; Owner: postgres
--

CREATE TABLE template.bookings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    time_slot_id uuid NOT NULL,
    date date NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    covers integer NOT NULL,
    notes text,
    preferred_time time without time zone,
    cancellation_token uuid DEFAULT gen_random_uuid() NOT NULL,
    status text DEFAULT 'confirmed'::text NOT NULL,
    gdpr_consent boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT bookings_status_check CHECK ((status = ANY (ARRAY['confirmed'::text, 'cancelled'::text])))
);


ALTER TABLE template.bookings OWNER TO postgres;

--
-- Name: closed_dates; Type: TABLE; Schema: template; Owner: postgres
--

CREATE TABLE template.closed_dates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    date date NOT NULL,
    end_date date,
    reason text,
    CONSTRAINT closed_dates_end_after_start CHECK (((end_date IS NULL) OR (end_date >= date)))
);


ALTER TABLE template.closed_dates OWNER TO postgres;

--
-- Name: menu_categories; Type: TABLE; Schema: template; Owner: postgres
--

CREATE TABLE template.menu_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    section_id uuid NOT NULL,
    name text NOT NULL,
    "position" integer,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE template.menu_categories OWNER TO postgres;

--
-- Name: menu_items; Type: TABLE; Schema: template; Owner: postgres
--

CREATE TABLE template.menu_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(8,2) NOT NULL,
    "position" integer,
    is_active boolean DEFAULT true NOT NULL,
    image_url text,
    allergen_ids uuid[] DEFAULT '{}'::uuid[] NOT NULL
);


ALTER TABLE template.menu_items OWNER TO postgres;

--
-- Name: menu_sections; Type: TABLE; Schema: template; Owner: postgres
--

CREATE TABLE template.menu_sections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    "position" integer,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE template.menu_sections OWNER TO postgres;

--
-- Name: news_slides; Type: TABLE; Schema: template; Owner: postgres
--

CREATE TABLE template.news_slides (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    body text,
    image_url text,
    "position" integer,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE template.news_slides OWNER TO postgres;

--
-- Name: site_settings; Type: TABLE; Schema: template; Owner: postgres
--

CREATE TABLE template.site_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text,
    description text,
    og_image text,
    slogan text,
    bio text,
    address text,
    phone text,
    email text,
    opening_hours jsonb DEFAULT '{"friday": {"closed": true, "ranges": []}, "monday": {"closed": true, "ranges": []}, "sunday": {"closed": true, "ranges": []}, "tuesday": {"closed": true, "ranges": []}, "saturday": {"closed": true, "ranges": []}, "thursday": {"closed": true, "ranges": []}, "wednesday": {"closed": true, "ranges": []}}'::jsonb NOT NULL,
    social_whatsapp text,
    social_instagram text,
    social_facebook text,
    maintenance_mode boolean DEFAULT false NOT NULL,
    extra_data jsonb DEFAULT '{}'::jsonb NOT NULL
);


ALTER TABLE template.site_settings OWNER TO postgres;

--
-- Name: time_slots; Type: TABLE; Schema: template; Owner: postgres
--

CREATE TABLE template.time_slots (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    label text NOT NULL,
    "time" time without time zone NOT NULL,
    end_time time without time zone,
    max_covers integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    archived_at timestamp with time zone
);


ALTER TABLE template.time_slots OWNER TO postgres;

--
-- Name: allergens allergens_pkey; Type: CONSTRAINT; Schema: template; Owner: postgres
--

ALTER TABLE ONLY template.allergens
    ADD CONSTRAINT allergens_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_email_time_slot_id_date_key; Type: CONSTRAINT; Schema: template; Owner: postgres
--

ALTER TABLE ONLY template.bookings
    ADD CONSTRAINT bookings_email_time_slot_id_date_key UNIQUE (email, time_slot_id, date);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: template; Owner: postgres
--

ALTER TABLE ONLY template.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: closed_dates closed_dates_date_key; Type: CONSTRAINT; Schema: template; Owner: postgres
--

ALTER TABLE ONLY template.closed_dates
    ADD CONSTRAINT closed_dates_date_key UNIQUE (date);


--
-- Name: closed_dates closed_dates_pkey; Type: CONSTRAINT; Schema: template; Owner: postgres
--

ALTER TABLE ONLY template.closed_dates
    ADD CONSTRAINT closed_dates_pkey PRIMARY KEY (id);


--
-- Name: menu_categories menu_categories_pkey; Type: CONSTRAINT; Schema: template; Owner: postgres
--

ALTER TABLE ONLY template.menu_categories
    ADD CONSTRAINT menu_categories_pkey PRIMARY KEY (id);


--
-- Name: menu_items menu_items_pkey; Type: CONSTRAINT; Schema: template; Owner: postgres
--

ALTER TABLE ONLY template.menu_items
    ADD CONSTRAINT menu_items_pkey PRIMARY KEY (id);


--
-- Name: menu_sections menu_sections_pkey; Type: CONSTRAINT; Schema: template; Owner: postgres
--

ALTER TABLE ONLY template.menu_sections
    ADD CONSTRAINT menu_sections_pkey PRIMARY KEY (id);


--
-- Name: news_slides news_slides_pkey; Type: CONSTRAINT; Schema: template; Owner: postgres
--

ALTER TABLE ONLY template.news_slides
    ADD CONSTRAINT news_slides_pkey PRIMARY KEY (id);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: template; Owner: postgres
--

ALTER TABLE ONLY template.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);


--
-- Name: time_slots time_slots_pkey; Type: CONSTRAINT; Schema: template; Owner: postgres
--

ALTER TABLE ONLY template.time_slots
    ADD CONSTRAINT time_slots_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_time_slot_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: postgres
--

ALTER TABLE ONLY template.bookings
    ADD CONSTRAINT bookings_time_slot_id_fkey FOREIGN KEY (time_slot_id) REFERENCES template.time_slots(id);


--
-- Name: menu_categories menu_categories_section_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: postgres
--

ALTER TABLE ONLY template.menu_categories
    ADD CONSTRAINT menu_categories_section_id_fkey FOREIGN KEY (section_id) REFERENCES template.menu_sections(id) ON DELETE CASCADE;


--
-- Name: menu_items menu_items_category_id_fkey; Type: FK CONSTRAINT; Schema: template; Owner: postgres
--

ALTER TABLE ONLY template.menu_items
    ADD CONSTRAINT menu_items_category_id_fkey FOREIGN KEY (category_id) REFERENCES template.menu_categories(id) ON DELETE CASCADE;


--
-- Name: bookings bookings_capacity_check; Type: TRIGGER; Schema: template; Owner: postgres
--

CREATE TRIGGER bookings_capacity_check BEFORE INSERT ON template.bookings FOR EACH ROW EXECUTE FUNCTION template.check_booking_capacity();


--
-- Name: allergens; Type: ROW SECURITY; Schema: template; Owner: postgres
--

ALTER TABLE template.allergens ENABLE ROW LEVEL SECURITY;

--
-- Name: allergens allergens_public_read; Type: POLICY; Schema: template; Owner: postgres
--

CREATE POLICY allergens_public_read ON template.allergens FOR SELECT USING (true);


--
-- Name: bookings; Type: ROW SECURITY; Schema: template; Owner: postgres
--

ALTER TABLE template.bookings ENABLE ROW LEVEL SECURITY;

--
-- Name: bookings bookings_admin_delete; Type: POLICY; Schema: template; Owner: postgres
--

CREATE POLICY bookings_admin_delete ON template.bookings FOR DELETE USING (public.is_tenant_owner());


--
-- Name: bookings bookings_admin_select; Type: POLICY; Schema: template; Owner: postgres
--

CREATE POLICY bookings_admin_select ON template.bookings FOR SELECT USING (public.is_tenant_owner());


--
-- Name: bookings bookings_admin_update; Type: POLICY; Schema: template; Owner: postgres
--

CREATE POLICY bookings_admin_update ON template.bookings FOR UPDATE USING (public.is_tenant_owner());


--
-- Name: bookings bookings_public_insert; Type: POLICY; Schema: template; Owner: postgres
--

CREATE POLICY bookings_public_insert ON template.bookings FOR INSERT WITH CHECK (true);


--
-- Name: closed_dates; Type: ROW SECURITY; Schema: template; Owner: postgres
--

ALTER TABLE template.closed_dates ENABLE ROW LEVEL SECURITY;

--
-- Name: closed_dates closed_dates_admin_all; Type: POLICY; Schema: template; Owner: postgres
--

CREATE POLICY closed_dates_admin_all ON template.closed_dates USING (public.is_tenant_owner());


--
-- Name: closed_dates closed_dates_public_read; Type: POLICY; Schema: template; Owner: postgres
--

CREATE POLICY closed_dates_public_read ON template.closed_dates FOR SELECT USING (true);


--
-- Name: menu_categories; Type: ROW SECURITY; Schema: template; Owner: postgres
--

ALTER TABLE template.menu_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: menu_categories menu_categories_admin_all; Type: POLICY; Schema: template; Owner: postgres
--

CREATE POLICY menu_categories_admin_all ON template.menu_categories USING (public.is_tenant_owner());


--
-- Name: menu_categories menu_categories_public_read; Type: POLICY; Schema: template; Owner: postgres
--

CREATE POLICY menu_categories_public_read ON template.menu_categories FOR SELECT USING (true);


--
-- Name: menu_items; Type: ROW SECURITY; Schema: template; Owner: postgres
--

ALTER TABLE template.menu_items ENABLE ROW LEVEL SECURITY;

--
-- Name: menu_items menu_items_admin_all; Type: POLICY; Schema: template; Owner: postgres
--

CREATE POLICY menu_items_admin_all ON template.menu_items USING (public.is_tenant_owner());


--
-- Name: menu_items menu_items_public_read; Type: POLICY; Schema: template; Owner: postgres
--

CREATE POLICY menu_items_public_read ON template.menu_items FOR SELECT USING (true);


--
-- Name: menu_sections; Type: ROW SECURITY; Schema: template; Owner: postgres
--

ALTER TABLE template.menu_sections ENABLE ROW LEVEL SECURITY;

--
-- Name: menu_sections menu_sections_admin_all; Type: POLICY; Schema: template; Owner: postgres
--

CREATE POLICY menu_sections_admin_all ON template.menu_sections USING (public.is_tenant_owner());


--
-- Name: menu_sections menu_sections_public_read; Type: POLICY; Schema: template; Owner: postgres
--

CREATE POLICY menu_sections_public_read ON template.menu_sections FOR SELECT USING (true);


--
-- Name: news_slides; Type: ROW SECURITY; Schema: template; Owner: postgres
--

ALTER TABLE template.news_slides ENABLE ROW LEVEL SECURITY;

--
-- Name: news_slides news_slides_admin_all; Type: POLICY; Schema: template; Owner: postgres
--

CREATE POLICY news_slides_admin_all ON template.news_slides USING (public.is_tenant_owner());


--
-- Name: news_slides news_slides_public_read; Type: POLICY; Schema: template; Owner: postgres
--

CREATE POLICY news_slides_public_read ON template.news_slides FOR SELECT USING (true);


--
-- Name: site_settings; Type: ROW SECURITY; Schema: template; Owner: postgres
--

ALTER TABLE template.site_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: site_settings site_settings_admin_all; Type: POLICY; Schema: template; Owner: postgres
--

CREATE POLICY site_settings_admin_all ON template.site_settings USING (public.is_tenant_owner());


--
-- Name: site_settings site_settings_public_read; Type: POLICY; Schema: template; Owner: postgres
--

CREATE POLICY site_settings_public_read ON template.site_settings FOR SELECT USING (true);


--
-- Name: time_slots; Type: ROW SECURITY; Schema: template; Owner: postgres
--

ALTER TABLE template.time_slots ENABLE ROW LEVEL SECURITY;

--
-- Name: time_slots time_slots_admin_all; Type: POLICY; Schema: template; Owner: postgres
--

CREATE POLICY time_slots_admin_all ON template.time_slots USING (public.is_tenant_owner());


--
-- Name: time_slots time_slots_public_read; Type: POLICY; Schema: template; Owner: postgres
--

CREATE POLICY time_slots_public_read ON template.time_slots FOR SELECT USING (true);


--
-- Name: SCHEMA template; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA template TO anon;
GRANT USAGE ON SCHEMA template TO authenticated;
GRANT USAGE ON SCHEMA template TO service_role;


--
-- Name: TABLE allergens; Type: ACL; Schema: template; Owner: postgres
--

GRANT SELECT ON TABLE template.allergens TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE template.allergens TO authenticated;
GRANT ALL ON TABLE template.allergens TO service_role;


--
-- Name: TABLE bookings; Type: ACL; Schema: template; Owner: postgres
--

GRANT SELECT,INSERT ON TABLE template.bookings TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE template.bookings TO authenticated;
GRANT ALL ON TABLE template.bookings TO service_role;


--
-- Name: TABLE closed_dates; Type: ACL; Schema: template; Owner: postgres
--

GRANT SELECT ON TABLE template.closed_dates TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE template.closed_dates TO authenticated;
GRANT ALL ON TABLE template.closed_dates TO service_role;


--
-- Name: TABLE menu_categories; Type: ACL; Schema: template; Owner: postgres
--

GRANT SELECT ON TABLE template.menu_categories TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE template.menu_categories TO authenticated;
GRANT ALL ON TABLE template.menu_categories TO service_role;


--
-- Name: TABLE menu_items; Type: ACL; Schema: template; Owner: postgres
--

GRANT SELECT ON TABLE template.menu_items TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE template.menu_items TO authenticated;
GRANT ALL ON TABLE template.menu_items TO service_role;


--
-- Name: TABLE menu_sections; Type: ACL; Schema: template; Owner: postgres
--

GRANT SELECT ON TABLE template.menu_sections TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE template.menu_sections TO authenticated;
GRANT ALL ON TABLE template.menu_sections TO service_role;


--
-- Name: TABLE news_slides; Type: ACL; Schema: template; Owner: postgres
--

GRANT SELECT ON TABLE template.news_slides TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE template.news_slides TO authenticated;
GRANT ALL ON TABLE template.news_slides TO service_role;


--
-- Name: TABLE site_settings; Type: ACL; Schema: template; Owner: postgres
--

GRANT SELECT ON TABLE template.site_settings TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE template.site_settings TO authenticated;
GRANT ALL ON TABLE template.site_settings TO service_role;


--
-- Name: TABLE time_slots; Type: ACL; Schema: template; Owner: postgres
--

GRANT SELECT ON TABLE template.time_slots TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE template.time_slots TO authenticated;
GRANT ALL ON TABLE template.time_slots TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: template; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA template GRANT SELECT,USAGE ON SEQUENCES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA template GRANT SELECT,USAGE ON SEQUENCES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA template GRANT ALL ON SEQUENCES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: template; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA template GRANT SELECT ON TABLES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA template GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA template GRANT ALL ON TABLES  TO service_role;


--
-- PostgreSQL database dump complete
--

