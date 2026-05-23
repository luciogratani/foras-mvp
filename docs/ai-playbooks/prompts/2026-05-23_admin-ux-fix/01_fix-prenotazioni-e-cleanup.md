---
status: READY
created: 2026-05-23
area: apps/admin
type: prompt
model: claude-sonnet-4-6
effort: medium
---

# Admin UX-fix 01 — Prenotazioni e cleanup

## Contesto

`foras-mvp` è un sistema multi-tenant per siti di bar/ristoranti (Next.js 16 + Supabase self-hosted + pnpm workspaces). Il backoffice (`apps/admin`) ha superato un audit esterno che ha rilevato problemi operativi nella pagina prenotazioni e codice morto. Questo task corregge i problemi **senza refactor strutturali della UI**: sono fix chirurgici su dati già presenti nel DB e componenti esistenti.

## File da leggere prima di iniziare

- `apps/admin/app/dashboard/prenotazioni/page.tsx` — logica fetch e composizione props
- `apps/admin/app/dashboard/prenotazioni/_components/BookingList.tsx` — rendering lista
- `apps/admin/app/dashboard/prenotazioni/_components/BookingFilters.tsx` — filtri
- `apps/admin/app/dashboard/novita/page.tsx` — route da rimuovere
- `apps/admin/app/dashboard/layout.tsx` — sidebar (verifica link `/dashboard/news`)
- `packages/supabase/src/services/bookings.ts` — `getBookingsAdmin`, `BookingAdmin` type
- `packages/supabase/src/services/site-admin.ts` — `getTimeSlotsAdmin`, `TimeSlotAdmin` type

## Scope

### Fix 1 — Ordinamento prenotazioni per orario turno (non per UUID)

`getBookingsAdmin` ordina per `time_slot_id` (UUID) → i turni compaiono in ordine casuale. Il service è corretto nella firma, il problema va risolto in `page.tsx` dove `timeSlots` è già disponibile:

- Costruisci una mappa `slotId → time` dai `timeSlots` fetchati
- Dopo aver separato `confirmed` e `cancelled`, ordina ciascun array così:
  1. Per data (più recente prima, o crescente se si imposta default data odierna — vedi Fix 2)
  2. Per `time_slots.time` crescente (orario turno, es. "12:30" < "20:00")
  3. A parità di turno, per cognome/nome del cliente

### Fix 2 — Default data odierna nei filtri

Oggi senza filtro si vedono tutte le prenotazioni di tutti i giorni mescolate. Il default utile è la data di oggi:

- In `page.tsx`, se `params.date` è assente, usa la data odierna (`new Date().toISOString().slice(0, 10)`) come default di visualizzazione
- Aggiorna `BookingFilters` in modo che il campo data mostri la data corrente se nessun filtro è attivo (il filtro "pulisci" deve riportare a oggi, non a vuoto)

### Fix 3 — Colonne mancanti in BookingList: telefono, orario preferito, note

`BookingAdmin` include già tutti i campi via `select('*')`. `BookingList` non li rende. Aggiungere:

- **Telefono**: colonna con valore cliccabile `<a href="tel:...">`. Se null, cella vuota.
- **Orario preferito** (`preferred_time`): colonna opzionale, se null non mostrare nulla (non è un campo obbligatorio).
- **Note** (`notes`): colonna opzionale, se null non mostrare nulla.

Mantieni l'ordine colonne: Nome · Telefono · Coperti · Data · Turno · Orario pref. · Note · Azioni.

### Fix 4 — Totale coperti prenotati / capienza per turno

Per ogni turno attivo nella data filtrata, mostrare sopra le righe del turno un'intestazione con: `<label turno> — <coperti prenotati> / <max_covers>` (es. "Cena 20:00 — 38/40").

- `timeSlots` è già fetchato in `page.tsx` — la `max_covers` è lì
- Calcola la somma `covers` delle prenotazioni `confirmed` per ogni `time_slot_id`
- Raggruppare visivamente le prenotazioni per turno (con intestazione) invece di una lista piatta unica

### Fix 5 — Rimozione route morta `/dashboard/novita`

`apps/admin/app/dashboard/novita/page.tsx` è un placeholder "Sezione in arrivo (Sprint 5)" — la sezione reale è `/dashboard/news`. Va rimossa:

- Elimina il file `apps/admin/app/dashboard/novita/page.tsx` (e la cartella se vuota)
- Verifica che `layout.tsx` non punti mai a `/novita` (ci si aspetta che punti già a `/dashboard/news`)
- Non serve redirect: la rotta non è linkata da nessuna parte nel codice

---
<!-- SEZIONE IN COMPILAZIONE — aggiungere rilievi prima di eseguire il prompt -->

---

## Vincoli

- Nessuna modifica al service layer (`packages/supabase/src/services/`) tranne eventuale aggiornamento dei tipi se necessario
- Nessun refactor strutturale dei componenti — fix chirurgici sui componenti esistenti
- Nessuna dipendenza nuova
- `pnpm -r exec tsc --noEmit` deve restare verde
- `export const dynamic = 'force-dynamic'` su `prenotazioni/page.tsx` deve restare

## Output atteso

- `apps/admin/app/dashboard/prenotazioni/page.tsx` — ordinamento corretto + default data odierna + raggruppamento per turno con intestazione coperti/capienza
- `apps/admin/app/dashboard/prenotazioni/_components/BookingList.tsx` — colonne telefono, orario preferito, note aggiunte
- `apps/admin/app/dashboard/novita/` — rimossa
- `pnpm -r exec tsc --noEmit` exit 0

## Done when

- [ ] La pagina prenotazioni aperta senza filtri mostra la data odierna di default
- [ ] I turni sono ordinati per orario (non UUID), le righe per nome dentro ogni turno
- [ ] Colonna telefono visibile e cliccabile (`tel:`) per ogni prenotazione confermata
- [ ] Intestazione per turno con `<label> — <coperti prenotati>/<max_covers>`
- [ ] `/dashboard/novita` restituisce 404 (route eliminata)
- [ ] `pnpm -r exec tsc --noEmit` exit 0
- [ ] Build admin verde
