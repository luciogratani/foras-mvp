---
status: DRAFT
created: 2026-05-25
area: ai-playbooks
type: prompt
topic: booking-orario-libero
owner: master-chat
model: claude-sonnet-4-6
effort: high
---

# Sub-task 02 — Web "prenotazione a orario libero" + enforcement

> **/model** `claude-sonnet-4-6` · **/effort** `high`
> Secondo (e ultimo) sub-task dell'intermezzo. Il 01 ha aggiunto `time_slots.end_time` (finestra opzionale) e l'admin per impostarla. Questo sub-task fa **usare** quella finestra al funnel pubblico: quando un turno ha `end_time`, il cliente sceglie l'orario d'arrivo dentro `[time, end_time)` e il campo `preferred_time` smette di essere solo indicativo e viene **validato e reso obbligatorio**. Se `end_time` è NULL il flusso resta identico a oggi. Decisione: `docs/decision-log/decisioni.md` voce 2026-05-25 *Prenotazione a orario libero nella finestra del turno* (punto 3).

## Contesto

`foras` è un template multi-tenant per siti di bar/ristoranti (Next.js App Router + Supabase, schema-per-tenant) in `/Users/lucio/Desktop/foras-mvp`. Il write-path prenotazioni è: `apps/web/app/booking/page.tsx` (Server Component, fetcha i turni) → `BookingForm` (client) → `createBookingAction` (Server Action, valida Zod) → `createBooking` (service in `@repo/supabase`, controlla capacità + inserisce). Oggi il cliente sceglie un **turno a orario puntuale** e `preferred_time` è un campo libero **solo indicativo** (non validato, non vincolante). Dopo il 01, ogni turno può avere una **finestra** `[time, end_time]` opzionale. Questo task: per i turni **con finestra**, `preferred_time` diventa l'**orario di arrivo** obbligatorio e vincolato alla finestra; per i turni **senza finestra** (`end_time` NULL) tutto resta come oggi. **La capacità (coperti) NON cambia**: il cap resta per-turno, l'orario d'arrivo non sotto-suddivide i coperti.

## File da leggere prima di iniziare

- `docs/decision-log/decisioni.md` — voce 2026-05-25 (orario libero), in particolare punto 3 (`preferred_time` promosso) e i **gotcha tecnici**: normalizzazione `TIME` a HH:MM, oltre-mezzanotte fuori scope.
- `packages/supabase/src/services/bookings.ts` — `AvailableTimeSlot` (~riga 13), `getAvailableTimeSlots` (~riga 44, vedi il `.map` finale ~riga 98), `createBooking` (~riga 121, già fa `slots.find(...)` per il controllo capacità), classi `OverbookingError`/`DuplicateBookingError` (~riga 22-34, pattern da replicare).
- `packages/supabase/src/index.ts` — export di `getAvailableTimeSlots`, `OverbookingError`, `DuplicateBookingError`, tipo `AvailableTimeSlot` (~righe 49-60): qui va esportata la nuova error class.
- `packages/supabase/src/schemas/bookings.ts` — `CreateBookingInputSchema`: `preferred_time` è già `HH:MM` nullable/optional. **NON renderlo obbligatorio a livello Zod** (la requiredness dipende dalla finestra del turno scelto, che Zod non conosce).
- `apps/web/app/booking/_components/BookingForm.tsx` — form client (`useActionState`). Vedi il `<select name="time_slot_id">` (~riga 66) e il campo `preferred_time` (~riga 92).
- `apps/web/app/booking/actions.ts` — `createBookingAction`: costruzione `values`/`rawInput`, `safeParse`, blocchi `catch` per `OverbookingError`/`DuplicateBookingError` (~riga 78-94). Tipo `BookingFieldErrors` già presente.
- `apps/web/app/booking/page.tsx` — passa `slots` a `BookingForm` (nessuna modifica attesa qui, ma leggi per contesto).

## Scope

### 1. Service — esporre `end_time` (`bookings.ts`)
- Aggiungi `end_time: string | null` al type **`AvailableTimeSlot`**.
- Nel `.map` finale di `getAvailableTimeSlots`, aggiungi `end_time: slot.end_time` (passa il valore grezzo dal DB, può essere `"HH:MM:SS"` o `null`). **Non** filtrare/escludere turni in base a `end_time`: la presenza della finestra non cambia la disponibilità.

### 2. Service — enforcement finestra in `createBooking` (`bookings.ts`)
- Nuova error class **`BookingWindowError extends Error`** (`this.name = 'BookingWindowError'`), stesso pattern di `OverbookingError`. Esportala da `index.ts` (sia il valore sia, se serve, niente type).
- In `createBooking`, **dopo** aver trovato `slot` (`slots.find(...)`) e **prima** dell'`insert` (l'ordine rispetto al check capacità è indifferente, ma fallo dopo il `find` perché serve `slot`):
  - **Normalizza a HH:MM**: `const start = slot.time.substring(0, 5)`; `const end = slot.end_time ? slot.end_time.substring(0, 5) : null`. `parsed.preferred_time` è già HH:MM (o null) — non ri-troncarlo.
  - **Se `end` è valorizzato** (turno con finestra):
    - se `parsed.preferred_time` è assente (`null`/`undefined`) → `throw new BookingWindowError('Per questo turno indica l\'orario di arrivo (tra ' + start + ' e ' + end + ').')`.
    - altrimenti se **non** `start <= preferred_time < end` (confronto stringa HH:MM) → `throw new BookingWindowError('L\'orario di arrivo deve essere tra ' + start + ' e ' + end + '.')`.
  - **Se `end` è NULL**: nessun vincolo (comportamento attuale — `preferred_time` resta nota indicativa, anche se assente).
- **Capacità invariata**: non toccare il calcolo `available_covers`/`OverbookingError`.

### 3. Action — mappa l'errore a field error (`actions.ts`)
- Importa `BookingWindowError` da `@repo/supabase`.
- Aggiungi un blocco `catch` (prima o dopo gli altri, l'ordine `instanceof` non collide) che, su `BookingWindowError`, ritorni:
  `{ status: 'error', message: 'Controlla l\'orario di arrivo.', fieldErrors: { preferred_time: [err.message] }, values }`.
  Usa `err.message` (già in italiano e contestualizzato con la finestra). Mantieni invariati i blocchi `OverbookingError`/`DuplicateBookingError` e il fallback generico.

### 4. Form — `preferred_time` dinamico (`BookingForm.tsx`)
Il form è già `'use client'`. Rendi il campo orario sensibile al turno selezionato:
- Aggiungi stato per il turno scelto: `const [selectedId, setSelectedId] = useState(v?.time_slot_id ?? '')` (importa `useState` da 'react'). Sul `<select name="time_slot_id">` aggiungi `onChange={(e) => setSelectedId(e.currentTarget.value)}` mantenendo `defaultValue={v?.time_slot_id ?? ''}`.
- Deriva: `const selected = slots.find((s) => s.time_slot_id === selectedId)`; `const winStart = selected ? selected.time.substring(0, 5) : ''`; `const winEnd = selected?.end_time ? selected.end_time.substring(0, 5) : null`; `const hasWindow = winEnd !== null`.
- **Option label**: mostra la finestra quando presente e normalizza a HH:MM:
  `{slot.label} ({slot.time.substring(0, 5)}{slot.end_time ? `–${slot.end_time.substring(0, 5)}` : ''})` — questo sostituisce l'attuale `({slot.time})` (che oggi stampa anche i secondi). Mantieni il suffisso ` — Completo` e il `disabled` su `available_covers === 0`.
- **Campo `preferred_time`**:
  - `required={hasWindow}`; quando `hasWindow`: `min={winStart}` e `max={winEnd}` (nota: l'attributo HTML `max` è **inclusivo**, mentre il server impone `< end` esclusivo — è un hint UI, la verità è server-side; va bene così).
  - `<label>` dinamico: `hasWindow ? 'Orario di arrivo' : 'Orario preferito (facoltativo)'`.
  - Testo di aiuto dinamico: `hasWindow ? `Scegli un orario tra ${winStart} e ${winEnd}.` : 'Indicaci a che ora vorresti sederti. Sarà mostrato al gestore come preferenza.'`.
  - Mantieni `defaultValue={v?.preferred_time}` per il ripopolamento e il rendering del field error `fe?.preferred_time` (aggiungi `<p role="alert">{fe.preferred_time[0]}</p>` con `aria-describedby` sull'input, sullo stile degli altri campi).

## Vincoli

- **NESSUNA modifica DB / nessun `ALTER`.** La colonna `end_time` esiste già (sub-task 01). Solo TypeScript/UI.
- **NON toccare** `CreateBookingInputSchema` (Zod): `preferred_time` resta `HH:MM` nullable/optional. La requiredness è condizionale al turno → vive nel service, non in Zod.
- **Capacità invariata**: niente sotto-slotting, il cap resta per-turno.
- **Oltre mezzanotte fuori scope**: confronto stringa HH:MM, si assume `end_time > time` nello stesso giorno (garantito dal `.refine` del 01).
- **Normalizza sempre i `TIME` a HH:MM su entrambi i lati** prima di confrontare/visualizzare: il DB ritorna `"HH:MM:SS"`, il form invia `"HH:MM"` (`"20:00" >= "20:00:00"` è falso lessicograficamente).
- Nessuna dipendenza nuova. Nessuna modifica fuori dai file elencati senza segnalarlo.
- Additivo: non rinominare/spostare funzioni o tipi esistenti.

## Output atteso

- `bookings.ts`: `end_time` in `AvailableTimeSlot` + nel `.map` di `getAvailableTimeSlots`; classe `BookingWindowError`; enforcement finestra in `createBooking`.
- `index.ts`: export di `BookingWindowError`.
- `actions.ts`: `catch (BookingWindowError)` → field error su `preferred_time` + `values`.
- `BookingForm.tsx`: select con stato + option label con finestra (HH:MM); `preferred_time` `required`/`min`/`max`/label/aiuto dinamici; rendering field error `preferred_time`.

## Done when

- Turno **con finestra** (es. Cena 20:00–23:00): nel form l'option mostra `Cena (20:00–23:00)`, il campo "Orario di arrivo" è **obbligatorio** con `min=20:00`/`max=23:00`; prenotare senza orario o con orario fuori finestra → errore **sul campo** `preferred_time` (messaggio con la finestra); con orario valido (es. 21:30) → prenotazione confermata.
- Turno **senza finestra** (es. Pranzo 12:30): option mostra `Pranzo (12:30)`, il campo resta "Orario preferito (facoltativo)" e prenotare **senza** orario funziona come oggi.
- Capacità: l'`OverbookingError` continua a scattare quando i coperti finiscono, indipendentemente dall'orario d'arrivo.
- `pnpm -r exec tsc --noEmit` pulito e `pnpm --filter web build` verde. Riporta gli esiti reali.

## Report finale (conciso)

(1) File creati/modificati, una riga ciascuno. (2) Esiti `tsc -r` e `build web`. (3) Dove hai messo l'enforcement in `createBooking` e come hai normalizzato i confronti. (4) Come il form decide `required`/`min`/`max` al cambio turno. (5) Dubbi o cose da verificare nello smoke.
