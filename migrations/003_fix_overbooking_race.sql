-- 003_fix_overbooking_race.sql
-- Chiude la race rimasta nella 002.
-- Data: 2026-05-28 | Applicare a: tutti i clienti esistenti + template
--
-- Contesto: sotto READ COMMITTED (default Postgres), due BEFORE INSERT
-- concorrenti sullo stesso (time_slot_id, date) leggono entrambi
-- SUM=N (i row in-flight delle altre transazioni sono invisibili),
-- entrambi passano il check N + NEW.covers <= max_covers, entrambi
-- inseriscono → overbooking soft. SECURITY DEFINER cambia il ruolo,
-- non l'isolamento.
--
-- Fix: SELECT ... FOR UPDATE sulla riga di time_slots all'inizio del
-- trigger acquisisce un row-lock esclusivo → due trigger concorrenti
-- sullo stesso slot vengono serializzati (paralleli su slot diversi).
-- Il secondo vede il SUM aggiornato dopo il commit del primo.
--
-- Origine: audit 04 (review opus-high) — trust-but-verify del primo
-- round di fix. Vedi decision-log voce 2026-05-28 "Post-review fix".
--
-- Idempotente: CREATE OR REPLACE FUNCTION sostituisce il body; il
-- trigger bookings_capacity_check punta alla funzione per nome quindi
-- resta valido senza DROP/CREATE.
-- Applicare con search_path impostato sullo schema tenant.

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

  -- FOR UPDATE: row-lock esclusivo sul time_slot → serializza i BEFORE
  -- INSERT concorrenti sullo stesso slot e chiude la race vista dalla 002
  -- sotto READ COMMITTED (SUM cieco al row in-flight di altre transazioni).
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
