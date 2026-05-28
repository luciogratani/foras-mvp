-- 002_bookings_overbooking_trigger.sql
-- Vincolo DB anti-overbooking su bookings — rete di sicurezza per la race
-- "check capacità + insert" NON atomica del service layer (createBooking).
-- Data: 2026-05-28 | Applicare a: tutti i clienti esistenti + template
--
-- Contesto (audit 04, punto D): packages/supabase/src/services/bookings.ts fa
-- il controllo capacità e poi l'insert in due step separati → due inserimenti
-- simultanei sullo stesso turno/data possono superare max_covers (overbooking
-- soft). Il controllo applicativo RESTA per il messaggio UX; questo trigger è il
-- backstop che rende il vincolo autoritativo a livello DB e copre anche eventuali
-- insert fuori dal service layer.
--
-- Scope: solo BEFORE INSERT. Gli UPDATE admin (locale fidato) non sono coperti di
-- proposito, coerentemente con il check applicativo che vive solo in createBooking.
--
-- Idempotente: CREATE OR REPLACE FUNCTION + DROP TRIGGER IF EXISTS.
-- Applicare con search_path impostato sullo schema tenant (vedi migration-runbook.md).
-- La funzione vive nello schema tenant ed è schema-portabile via TG_TABLE_SCHEMA.

CREATE OR REPLACE FUNCTION check_booking_capacity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
-- search_path FISSATO a vuoto DI PROPOSITO: ogni oggetto referenziato è qualificato
-- esplicitamente (le tabelle via TG_TABLE_SCHEMA + format %I; i builtin vivono in
-- pg_catalog, sempre implicito) → nessun rischio di search_path hijacking.
-- NB: è l'OPPOSTO del divieto su public.is_tenant_owner() — lì serve current_schema()
-- del CHIAMANTE, mentre qui lo schema target è quello della TABELLA (TG_TABLE_SCHEMA),
-- indipendente dal search_path del chiamante, quindi fissarlo è corretto e sicuro.
-- SECURITY DEFINER (owner = postgres) serve per contare TUTTE le prenotazioni
-- confermate bypassando la RLS: anon/authenticated non vedono le righe altrui su
-- bookings (policy owner-scope), quindi un conteggio SECURITY INVOKER sarebbe a zero
-- per un insert anonimo e il vincolo risulterebbe inefficace.
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
