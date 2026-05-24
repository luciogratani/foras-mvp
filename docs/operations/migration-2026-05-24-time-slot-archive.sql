-- migration-2026-05-24-time-slot-archive.sql
-- -----------------------------------------------------------------------
-- Migrazione: aggiunta colonna archived_at a template.time_slots per
-- l'archiviazione dei turni.
--
-- SEMANTICA:
--   archived_at IS NULL      -> turno attivo, visibile nella lista admin
--   archived_at valorizzato  -> turno archiviato: nascosto da admin e sito,
--                               ma la riga resta nel DB così lo storico delle
--                               prenotazioni (FK bookings.time_slot_id) è intatto.
--
-- NOTA: nessun vincolo UNIQUE su label, quindi un turno archiviato non
-- impedisce di crearne uno nuovo con lo stesso nome (la chiave è l'UUID).
--
-- USO: eseguire nel SQL editor del Supabase dashboard come service_role.
-- Idempotente (ADD COLUMN IF NOT EXISTS). Nessuna policy RLS nuova: la
-- colonna eredita le policy della tabella.
--
-- Data: 2026-05-24
-- -----------------------------------------------------------------------

ALTER TABLE template.time_slots
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- -----------------------------------------------------------------------
-- Fine migrazione
-- -----------------------------------------------------------------------
