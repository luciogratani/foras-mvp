---
status: DONE
sprint: ux-fix
stream: C
task: C3
created: 2026-05-22
suggested_model: sonnet
suggested_effort: high
owner: master-chat
---

# UX-fix / C3 — Capienza turni: semantica `max_covers` + orario libero cliente

## Contesto

`foras-mvp` è un template multi-tenant per siti di bar/ristoranti (Next.js App Router + Supabase + shadcn/ui). Il freeze del template è posticipato per permettere alcuni fix pre-freeze. Questo è il terzo.

**Problema (punto 5 dell'audit).** Il modello a turni fissi ha due lacune distinte:

**5a — Semantica ambigua di `max_covers`.** Il campo significa "coperti totali accettati per questa seduta" ma non lo dice da nessuna parte. Il gestore che vede "max_covers" nel form admin potrebbe intenderlo come capienza massima della sala o come limite per seduta singola, portando a over/under-prenotazione. La fix è una label chiara + testo esplicativo nell'admin — zero DB change.

**5b — Il cliente non può indicare l'orario desiderato.** La prenotazione richiede solo la scelta del turno (es. "Cena 20:00") ma molti clienti arriveranno alle 21:15. Il gestore riceve tutte le prenotazioni etichettate "20:00" senza sapere la distribuzione reale degli arrivi. La fix è un campo `preferred_time` opzionale in `bookings`: il cliente indica la propria preferenza, il gestore la vede nella lista prenotazioni. Non cambia la logica di conferma automatica né il conteggio coperti.

**5c — Turnazione a scatti rigidi.** Già gestibile creando più time_slots (es. "Cena 19:30" e "Cena 21:30"). Nessun codice da scrivere — solo documentazione in onboarding.

Questo task copre **5a** e **5b**. Per 5c, aggiungi una nota nel messaggio di completamento per Lucio.

## File da leggere prima di iniziare

- `docs/operations/create_schema_from_template.sql` — tabella `bookings` (righe ~96–113): da aggiungere `preferred_time`
- `packages/supabase/src/types/database.ts` — tipo `bookings` (Row/Insert/Update): da aggiornare manualmente
- `packages/supabase/src/schemas/bookings.ts` — `CreateBookingInputSchema`: da aggiungere `preferred_time`
- `apps/web/app/booking/_components/BookingForm.tsx` — form prenotazione pubblico: da aggiungere campo orario
- `apps/admin/app/dashboard/prenotazioni/_components/BookingList.tsx` — lista prenotazioni admin: da aggiungere colonna orario
- `apps/admin/app/dashboard/orari/_components/` — form `time_slots` con il campo `max_covers` (da migliorare la label)

## Scope

### 1. SQL — aggiunta colonna `preferred_time` alla tabella `bookings`

Esegui nel SQL editor (schema `template`):

```sql
ALTER TABLE template.bookings ADD COLUMN preferred_time TIME;
```

Aggiorna anche `docs/operations/create_schema_from_template.sql`: nella `CREATE TABLE bookings`, aggiungi `preferred_time TIME,` dopo la riga `notes TEXT,`.

### 2. `packages/supabase/src/types/database.ts` — aggiornamento manuale

Aggiungi `preferred_time` ai tipi `bookings` (non rigenerare il file):

```typescript
// bookings.Row — aggiungi:
preferred_time: string | null   // formato 'HH:MM:SS' (PostgreSQL time)

// bookings.Insert — aggiungi:
preferred_time?: string | null

// bookings.Update — aggiungi:
preferred_time?: string | null
```

### 3. `packages/supabase/src/schemas/bookings.ts` — aggiorna `CreateBookingInputSchema`

Aggiungi il campo opzionale:

```typescript
preferred_time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM').nullable().optional(),
```

Il Supabase JS client accetta `'HH:MM'` per un campo `TIME` — il DB lo normalizza a `'HH:MM:SS'` in lettura. Non serve aggiustare il formato in scrittura.

### 4. `apps/web/app/booking/_components/BookingForm.tsx` — nuovo campo "Orario preferito"

Aggiungi un campo opzionale tra il selettore turno e il campo nome. Il campo va mostrato **solo quando il form ha slot disponibili** (stesso condizionale del `<form>` principale).

```tsx
<div>
  <label htmlFor="preferred_time">Orario preferito (facoltativo)</label>
  <input id="preferred_time" type="time" name="preferred_time" />
  <p><small>Indicaci a che ora vorresti sederti. Sarà mostrato al gestore come preferenza.</small></p>
</div>
```

Il campo `name="preferred_time"` viene letto da `createBookingAction` (in `actions.ts`) tramite `formData.get('preferred_time') || null` e passato al service. Aggiorna `actions.ts` di conseguenza:

```typescript
const rawInput = {
  // ... campi esistenti ...
  preferred_time: formData.get('preferred_time') || null,
}
```

### 5. `apps/admin/app/dashboard/prenotazioni/_components/BookingList.tsx` — colonna "Orario pref."

Aggiungi una colonna nella lista prenotazioni confermate che mostra `preferred_time` se presente. Formatta come `'HH:MM'` (tronca i secondi: `time.substring(0, 5)`). Se null, mostra `—`.

Inserisci la colonna dopo "Coperti" e prima di "Note" (o in fondo — scegli il punto più leggibile in base al layout attuale).

### 6. Admin form `time_slots` — label `max_covers` con semantica esplicita

Individua il campo `max_covers` nel form di creazione/modifica dei turni (in `apps/admin/app/dashboard/orari/`). Aggiungi un testo descrittivo sotto il campo:

```tsx
<p className="text-xs text-muted-foreground mt-1">
  Coperti totali accettati per questa seduta. Per gestire due sedute a sera
  (es. 19:30 e 21:30), crea due turni separati con il proprio limite ciascuno.
</p>
```

Applica la stessa descrizione sia al form di creazione sia a quello di modifica (se sono componenti distinti).

## Vincoli

- **`preferred_time` non influenza la logica di conferma automatica né il conteggio coperti.** È informativo puro: viene salvato nel DB e mostrato al gestore, nient'altro.
- **Il campo è opzionale end-to-end**: il form può essere inviato senza, il DB accetta NULL, il Zod schema lo marca `optional()`.
- **Nessuna nuova dipendenza npm.**
- La colonna `preferred_time` in `BookingList.tsx` deve gestire il caso `null` senza errori (mostrare `—`).
- Non toccare la logica di `getAvailableTimeSlots` né di `createBooking` (oltre a passare `preferred_time` nell'insert).

## Output atteso

- SQL eseguito su `template` (`ALTER TABLE bookings ADD COLUMN preferred_time TIME`)
- `create_schema_from_template.sql` aggiornato (colonna aggiunta alla `CREATE TABLE bookings`)
- `packages/supabase/src/types/database.ts` — `preferred_time` nei tipi `bookings`
- `packages/supabase/src/schemas/bookings.ts` — campo aggiunto a `CreateBookingInputSchema`
- `apps/web/app/booking/actions.ts` — `preferred_time` letto da formData e passato al service
- `apps/web/app/booking/_components/BookingForm.tsx` — campo orario preferito aggiunto
- `apps/admin/app/dashboard/prenotazioni/_components/BookingList.tsx` — colonna orario pref.
- `apps/admin/app/dashboard/orari/` — label `max_covers` con testo esplicativo

## Done when

- `pnpm -r exec tsc --noEmit` exit 0
- Build `web` e `admin` verdi
- Il form di prenotazione pubblica mostra il campo "Orario preferito" (facoltativo, non bloccante se non compilato)
- Una prenotazione con `preferred_time` compilato mostra il valore nella colonna admin
- Una prenotazione senza `preferred_time` mostra `—` nella colonna admin senza errori
- Il campo `max_covers` nell'admin ha il testo esplicativo visibile sotto l'input

## Note per la sub-chat

- Il SQL `ALTER TABLE` va eseguito **manualmente da Lucio** nel SQL editor — includilo nel messaggio di completamento.
- PostgreSQL restituisce `TIME` come stringa `'HH:MM:SS'` — tronca a `'HH:MM'` con `.substring(0, 5)` dove serve (admin list). Il form web invia già `'HH:MM'` via `<input type="time">` — non serve conversione in scrittura.
- Per il punto **5c (turnazione a scatti)**: nella risposta finale a Lucio, aggiungi una nota: *"Per gestire due sedute nella stessa serata, il pattern consigliato è creare due time_slots separati (es. 'Cena Prima' ore 19:30 e 'Cena Seconda' ore 21:30), ciascuno col proprio `max_covers`. Questo va documentato in onboarding."*
