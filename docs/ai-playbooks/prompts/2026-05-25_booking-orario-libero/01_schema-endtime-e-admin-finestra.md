---
status: TODO
created: 2026-05-25
area: ai-playbooks
type: prompt
topic: booking-orario-libero
owner: master-chat
model: claude-sonnet-4-6
effort: medium
---

# Sub-task 01 — Colonna `end_time` sul turno + admin "finestra turno"

> **/model** `claude-sonnet-4-6` · **/effort** `medium`
> Aggiunge una colonna `time_slots.end_time` (nullable) e permette al gestore di impostarla dall'admin. È il primo di 2 sub-task: questo rende la **finestra configurabile**; il 02 (web) la userà per le prenotazioni a orario libero. Decisione: `docs/decision-log/decisioni.md` voce 2026-05-25 *Prenotazione a orario libero nella finestra del turno*.

## Contesto

`foras` è un template multi-tenant per siti di bar/ristoranti (Next.js App Router + Supabase, schema-per-tenant) in `/Users/lucio/Desktop/foras-mvp`. Oggi i **turni** (`time_slots`) hanno solo un orario **puntuale** (`time`, es. Cena 20:00). Lucio ha deciso (decision-log 2026-05-25) di dare a ogni turno una **finestra opzionale** `[time, end_time]`: se valorizzata, in un sub-task successivo il cliente potrà scegliere l'orario di arrivo dentro la finestra; se `end_time` è NULL il turno resta a orario fisso come oggi. **Questo sub-task NON tocca il flusso di prenotazione** (né `apps/web`, né `createBooking`): si limita a (1) aggiungere la colonna allo schema baseline + ai tipi, (2) farla impostare/visualizzare dall'admin.

## File da leggere prima di iniziare

- `docs/decision-log/decisioni.md` — voce 2026-05-25 (finestra turno / orario libero): leggi i 3 gotcha (HH:MM vs HH:MM:SS, oltre-mezzanotte fuori scope, `end_time > time`)
- `docs/operations/create_schema_from_template.sql` — blocco `CREATE TABLE time_slots (...)` (~riga 87): qui va la nuova colonna DDL
- `packages/supabase/src/types/database.ts` — definizioni generate di `time_slots` (Row/Insert/Update ~riga 282): vanno editate a mano (no CLI di generazione live)
- `packages/supabase/src/schemas/settings.ts` — `TimeSlotCreateSchema` / `TimeSlotUpdateSchema` (modelli Zod; nota `ClosedDateCreateSchema` come esempio di `.refine` cross-field)
- `packages/supabase/src/services/site-admin.ts` — `createTimeSlot` / `updateTimeSlot` / `getTimeSlotsAdmin` (pass-through: cambiano solo i tipi)
- `apps/admin/app/dashboard/orari/actions.ts` — `createTimeSlotAction` / `updateTimeSlotAction` (costruzione `raw` da `FormData`)
- `apps/admin/app/dashboard/orari/_components/CreateTimeSlotDialog.tsx`, `EditTimeSlotDialog.tsx`, `TimeSlotCard.tsx` — UI da estendere

## Scope

1. **Schema baseline + tipi (NESSUNA scrittura sul DB live):**
   - In `create_schema_from_template.sql`, dentro `CREATE TABLE time_slots`, aggiungi la colonna **`end_time TIME`** (nullable, subito dopo `time`), con un commento di una riga: `NULL = orario fisso; valorizzato = finestra [time, end_time] per prenotazioni a orario libero`.
   - In `types/database.ts`, aggiungi a mano `end_time` a `time_slots`: `end_time: string | null` nel `Row`, `end_time?: string | null` in `Insert` e `Update`. **Non** rigenerare i tipi via CLI (il progetto non la usa).
   - **NON** eseguire `ALTER`/SQL contro il database: l'applicazione sullo schema `template` è uno step manuale del master.

2. **Zod (`schemas/settings.ts`):**
   - Aggiungi `end_time` a `TimeSlotCreateSchema`: stringa `HH:MM` (stesso regex di `time`), **opzionale e nullable** (`.regex(...).nullable().optional()`).
   - Aggiungi una `.refine` (cross-field) che, **solo quando sia `time` sia `end_time` sono presenti**, imponga `end_time > time` (confronto stringa HH:MM va bene), con messaggio sul path `end_time` (es. "La fine deve essere dopo l'inizio").
   - Attenzione a `TimeSlotUpdateSchema`: oggi è `TimeSlotCreateSchema.partial()`. Il `.refine` produce un `ZodEffects` su cui `.partial()` non è disponibile. Ristruttura così: definisci l'**oggetto base** (`z.object({...})`), poi `export const TimeSlotCreateSchema = baseObject.refine(...)` e `export const TimeSlotUpdateSchema = baseObject.partial().refine(...)` riusando lo stesso predicato (che già gestisce i campi possibilmente `undefined`). Mantieni invariati i tipi esportati.

3. **Service (`site-admin.ts`):** `createTimeSlot`/`updateTimeSlot` passano già `input`/`patch` interi e `getTimeSlotsAdmin` fa `select('*')` → con i tipi aggiornati `end_time` fluisce da solo. Verifica che non serva altro; **non** aggiungere logica.

4. **Admin actions (`orari/actions.ts`):** in `createTimeSlotAction` e `updateTimeSlotAction` aggiungi `end_time` all'oggetto `raw` letto da `FormData`. **Stringa vuota → `null`** (un input time lasciato vuoto manda `""`): `const et = (formData.get('end_time') as string | null)?.trim(); end_time: et ? et : null`. Lascia che sia lo Zod a validare.

5. **Admin UI:**
   - `CreateTimeSlotDialog` + `EditTimeSlotDialog`: aggiungi un campo **`end_time`** (`<Input type="time" name="end_time">`), **facoltativo** (no `required`), con `Label` "Fine turno (facoltativo)" e una riga di aiuto `text-xs text-muted-foreground`: *"Lascia vuoto per un orario fisso. Imposta una fine per far scegliere ai clienti l'orario di arrivo nella finestra (es. 20:00–23:00)."* In `EditTimeSlotDialog` precompila il valore da `slot.end_time` troncato a HH:MM (`slot.end_time?.substring(0, 5)`), gestendo `null`.
   - `TimeSlotCard`: dove mostra `{slot.time.substring(0, 5)} — {slot.max_covers} coperti` (due punti: ramo attivo **e** ramo archiviato), mostra la finestra quando presente: `{slot.time.substring(0,5)}{slot.end_time ? `–${slot.end_time.substring(0,5)}` : ''}`. Niente altre modifiche di layout.

## Vincoli

- **NESSUNA scrittura sul DB live / nessun `ALTER` eseguito.** Solo edit del file SQL baseline + hand-edit dei tipi. L'`ALTER` su `template` lo fa il master a mano.
- **NON toccare `apps/web`, né `services/bookings.ts`, né `createBooking`/`getAvailableTimeSlots`/`BookingForm`** — è tutto il sub-task 02.
- **Capacità invariata.** Questo task non tocca il conteggio coperti.
- `end_time` è **nullable**: con `end_time` NULL tutto si comporta esattamente come oggi (turno a orario fisso).
- **Oltre mezzanotte fuori scope**: assumiamo `end_time > time` nello stesso giorno (confronto stringa HH:MM). Non gestire finestre che scavalcano la mezzanotte.
- Nessuna dipendenza nuova. Primitivi UI da `@repo/ui`.
- Non rinominare/spostare funzioni o file esistenti; resta additivo.

## Output atteso

- `create_schema_from_template.sql`: colonna `end_time TIME` in `time_slots` (+ commento).
- `types/database.ts`: `end_time` in Row/Insert/Update di `time_slots`.
- `schemas/settings.ts`: `end_time` opzionale/nullable + `.refine(end_time > time)`; `TimeSlotUpdateSchema` ristrutturato per preservare il refine; tipi esportati invariati.
- `orari/actions.ts`: `end_time` (vuoto→null) nel `raw` di create/update.
- `CreateTimeSlotDialog.tsx` / `EditTimeSlotDialog.tsx`: campo `end_time` facoltativo + aiuto; edit precompila da `slot.end_time`.
- `TimeSlotCard.tsx`: finestra mostrata (`time–end_time`) quando `end_time` presente, nei due rami.

## Done when

- Dall'admin orari si può creare/modificare un turno impostando (o lasciando vuota) una **fine turno**; la card mostra `20:00–23:00` se valorizzata, `20:00` se no. Validazione: fine ≤ inizio → errore sul campo.
- `end_time` vuoto si salva come `NULL` (non `""`).
- `pnpm -r exec tsc --noEmit` pulito e `pnpm --filter admin build` verde. Riporta gli esiti reali.
- **Nota per il master (non un blocco del task):** prima dello smoke va eseguito a mano sullo schema `template`: `ALTER TABLE template.time_slots ADD COLUMN end_time TIME;`

## Report finale (conciso)

(1) File creati/modificati, una riga ciascuno. (2) Esiti `tsc -r` e `build admin`. (3) Come hai ristrutturato lo Zod Update per preservare il refine. (4) Dubbi o cose da verificare nello smoke.
