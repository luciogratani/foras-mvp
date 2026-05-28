# CHANGELOG — migrazioni schema tenant

Registro human-readable delle modifiche allo schema tenant dopo il freeze del
template (2026-05-27). Ogni voce corrisponde a uno script in `/migrations`.
Vedi `docs/operations/migration-runbook.md` per la procedura.

| Versione | Data       | Descrizione                                                                 | Applicare a            |
|----------|------------|-----------------------------------------------------------------------------|------------------------|
| 001      | 2026-05-27 | Baseline FROZEN — pointer al provisioner `create_schema_from_template.sql`. | (baseline, nuovi schemi) |
| 002      | 2026-05-28 | Vincolo DB anti-overbooking: trigger `BEFORE INSERT` su `bookings`.         | tutti i clienti + template |
| 003      | 2026-05-28 | Fix race trigger overbooking: `SELECT ... FOR UPDATE` sul time_slot.        | tutti i clienti + template |

## 002 — bookings_overbooking_trigger

Aggiunge `check_booking_capacity()` (SECURITY DEFINER, `search_path = ''`,
schema-portabile via `TG_TABLE_SCHEMA`) + trigger `bookings_capacity_check`
`BEFORE INSERT` su `bookings`: somma i coperti delle prenotazioni `confirmed`
per `(time_slot_id, date)` e rifiuta (`ERRCODE 'OB001'`) se la nuova supererebbe
`time_slots.max_covers`. Rete di sicurezza per la race check+insert non atomica
del service layer; il check applicativo in `bookings.ts` resta per il messaggio UX
(che mappa `OB001` → `OverbookingError`). Riflesso anche in
`create_schema_from_template.sql` (§4b) e nello snapshot `schema.sql`.

> ⚠️ La versione 002 originale lascia una race residua sotto READ COMMITTED — vedi 003.

## 003 — fix_overbooking_race

`CREATE OR REPLACE FUNCTION check_booking_capacity()` con `SELECT ... FOR UPDATE`
sulla riga di `time_slots` all'inizio del body: acquisisce row-lock esclusivo
sullo slot, serializza i BEFORE INSERT concorrenti sullo stesso slot (paralleli
su slot diversi) e chiude la race in cui due transazioni concorrenti vedono
entrambe SUM=N (row in-flight invisibili sotto READ COMMITTED) e passano il
check. Trigger invariato (punta alla funzione per nome). Origine: audit 04
(review opus-high) — voce 2026-05-28 "Post-review fix" nel decision-log.
