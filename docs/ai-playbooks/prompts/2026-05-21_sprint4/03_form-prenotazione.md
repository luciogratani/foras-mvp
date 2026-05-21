---
status: DONE
sprint: 4
sub-task: "03"
created: 2026-05-21
---

# Sprint 4 / 03 — Form prenotazione pubblico

> /model opus  
> /effort high

## Contesto

Progetto foras-mvp: sistema multi-tenant per siti di bar/ristoranti (Next.js 16 + Supabase self-hosted + pnpm workspaces). Questo è il primo write-path reale dal sito pubblico. Il service layer bookings è già completo in `@repo/supabase` (`getAvailableTimeSlots`, `createBooking`, `OverbookingError`, `DuplicateBookingError`, `CreateBookingInputSchema`). Il client privilegiato `getWebSupabaseAdmin()` è stato creato nel sub-task 02. Questo sub-task consuma entrambi.

**Scope Sprint 4 sull'email:** il canale email (Resend) è rimandato a un follow-up. Il form funziona end-to-end senza email — il `cancellation_token` viene mostrato nella success page come link diretto `/booking/cancel/{token}`, così l'utente può cancellare anche senza email.

**Prerequisiti:** i sub-task 01 e 02 devono essere stati eseguiti e le loro modifiche applicate prima di iniziare questo.

## File da leggere prima di iniziare

- `docs/product-scope/mvp.md` — sezione "Prenotazioni — feature incluse nell'MVP" (campi form, flusso, GDPR)
- `packages/supabase/src/services/bookings.ts` — `getAvailableTimeSlots`, `createBooking`, `OverbookingError`, `DuplicateBookingError`; le JSDoc spiegano i requisiti del client privilegiato
- `packages/supabase/src/schemas/bookings.ts` — `CreateBookingInputSchema` (campi e vincoli Zod)
- `packages/supabase/src/index.ts` — esportazioni disponibili da `@repo/supabase`
- `apps/web/lib/supabaseAdmin.ts` — `getWebSupabaseAdmin()` creato nel sub-task 02
- `apps/web/app/page.tsx` — come è strutturata la homepage (`export const dynamic = 'force-dynamic'`, pattern Server Component)
- `apps/web/app/booking/cancel/[token]/page.tsx` — la cancel page creata nel sub-task 02 (per capire il pattern della cartella `/booking/`)
- `docs/decision-log/decisioni.md` — voce *"Rate limiting prenotazioni"* (unique constraint `(email, time_slot_id, date)` → `DuplicateBookingError`)
- `docs/decision-log/decisioni.md` — voce *"Conferma prenotazioni"* (conferma automatica con controllo coperti)

## Scope

### Struttura file da creare

```
apps/web/app/booking/
  page.tsx                    ← Server Component, legge searchParams.date, fetcha slot
  actions.ts                  ← 'use server', createBookingAction
  _components/
    BookingForm.tsx            ← 'use client', form + useActionState
```

La cancel page `/booking/cancel/[token]/page.tsx` esiste già (sub-task 02) — non modificarla.

---

### `apps/web/app/booking/page.tsx` — Server Component

Logica:
1. `export const dynamic = 'force-dynamic'`
2. Leggere la data da `searchParams`: `const { date: rawDate } = await searchParams`. Default se assente: data UTC di oggi (`new Date().toISOString().slice(0, 10)`). Validare che `rawDate` sia nel formato `YYYY-MM-DD` con una regex semplice; se non valido, usare oggi. (Nota: la data è UTC server-side; per MVP è accettabile.)
3. Chiamare `getAvailableTimeSlots(getWebSupabaseAdmin(), date)` in un try/catch. Se errore → mostrare messaggio di errore generico e non renderizzare il form.
4. Passare `slots` e `date` al componente `<BookingForm>`.
5. Struttura pagina: titolo "Prenota un tavolo", sottotitolo con la data selezionata, il `<BookingForm>`.

Signature del componente:
```typescript
export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
})
```

---

### `apps/web/app/booking/actions.ts` — Server Action

```typescript
'use server'
import {
  createBooking,
  OverbookingError,
  DuplicateBookingError,
  CreateBookingInputSchema,
} from '@repo/supabase'
import { getWebSupabaseAdmin } from '../../../lib/supabaseAdmin'

export type BookingActionState =
  | { status: 'idle' }
  | { status: 'success'; cancellation_token: string; booking_id: string }
  | { status: 'error'; message: string }

export async function createBookingAction(
  _prevState: BookingActionState,
  formData: FormData
): Promise<BookingActionState> {
  const rawInput = {
    time_slot_id: formData.get('time_slot_id'),
    date: formData.get('date'),
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone') || null,
    covers: Number(formData.get('covers')),
    notes: formData.get('notes') || null,
    gdpr_consent: formData.get('gdpr_consent') === 'on' ? true : false,
  }

  const parsed = CreateBookingInputSchema.safeParse(rawInput)
  if (!parsed.success) {
    return { status: 'error', message: 'Dati non validi. Controlla i campi e riprova.' }
  }

  try {
    const { id, cancellation_token } = await createBooking(getWebSupabaseAdmin(), parsed.data)
    return { status: 'success', cancellation_token, booking_id: id }
  } catch (err) {
    if (err instanceof OverbookingError) {
      return {
        status: 'error',
        message: 'Non ci sono abbastanza coperti disponibili per il turno selezionato.',
      }
    }
    if (err instanceof DuplicateBookingError) {
      return {
        status: 'error',
        message: 'Esiste già una prenotazione con questa email per il turno e la data selezionati.',
      }
    }
    return { status: 'error', message: 'Si è verificato un errore. Riprova più tardi.' }
  }
}
```

Nota critica: `gdpr_consent` dalla checkbox HTML è `'on'` quando checked, `null` quando unchecked. La conversione `=== 'on' ? true : false` è corretta. `CreateBookingInputSchema` ha `gdpr_consent: z.literal(true)` — se l'utente non ha checkato, il `safeParse` fallisce e si ritorna il messaggio di errore generico. Questo è il comportamento corretto (GDPR obbligatorio).

---

### `apps/web/app/booking/_components/BookingForm.tsx` — Client Component

```typescript
'use client'
import { useActionState } from 'react'  // React 19 — import da 'react', NON da 'react-dom'
import type { AvailableTimeSlot } from '@repo/supabase'
import { createBookingAction, type BookingActionState } from '../actions'
```

Props: `{ slots: AvailableTimeSlot[], date: string }`

Struttura del form:
- **Campo data (GET navigation):** un `<form method="GET" action="/booking">` separato con `<input type="date" name="date" defaultValue={date}>` e un button "Aggiorna". Questo ricarica la pagina con la nuova data (server re-fetcha gli slot). Non usa la Server Action.
- **Form prenotazione (POST via Server Action):** usa `useActionState(createBookingAction, { status: 'idle' })`. Il form include:
  - `<input type="hidden" name="date" value={date}>` (la data corrente)
  - `<select name="time_slot_id">` — opzione per ogni slot in `slots`. Mostrare tutti gli slot, con quelli a `available_covers === 0` come `disabled`. Label: `{slot.label} ({slot.time}) — {slot.available_covers} coperti disponibili`.
  - Se `slots` è vuoto o tutti a 0 coperti: messaggio "Nessun turno disponibile per questa data. Seleziona un'altra data." e form prenotazione non renderizzato.
  - `<input type="text" name="name" required>` — Nome
  - `<input type="email" name="email" required>` — Email
  - `<input type="tel" name="phone">` — Telefono (opzionale, no required)
  - `<input type="number" name="covers" min="1" max="50" required>` — Numero di coperti
  - `<textarea name="notes">` — Note (opzionale)
  - `<input type="checkbox" name="gdpr_consent" required>` + label con testo consenso trattamento dati. Il `required` HTML è un fallback client-side; la validazione vera avviene nel Server Action.
  - Submit button con testo "Prenota" (disabilitato durante pending con `isPending` da `useActionState`)

**Success state** (`state.status === 'success'`): non mostrare il form, mostrare:
- "Prenotazione confermata!"
- "Per annullare la prenotazione, usa questo link:" + link a `/booking/cancel/{state.cancellation_token}`
- Note: "Conserva questo link — è il tuo unico modo per cancellare la prenotazione (le email di conferma non sono ancora attive)."
- Link "← Torna alla homepage"

**Error state** (`state.status === 'error'`): mostrare `state.message` in un banner di errore sopra il form. Il form rimane visibile per permettere la correzione.

## Vincoli di sicurezza (NON NEGOZIABILI)

- **Mai** passare input utente grezzo (da `formData`) direttamente in `.from(...)`, `.select(...)`, `.eq(...)` del client privilegiato. Tutto passa attraverso `createBooking` dal service layer, che riceve l'input già validato da `CreateBookingInputSchema.safeParse()`.
- Il `gdpr_consent: false` deve essere rifiutato dalla Zod validation — non aggiungere logica separata per questo, lasciare che `z.literal(true)` nella schema lo gestisca.
- Non importare né usare `getWebSupabaseAdmin()` in componenti `'use client'` — solo in `actions.ts` (server) e `page.tsx` (server).
- Non committare — il master esamina e committa.

## Output atteso

- `apps/web/app/booking/page.tsx` — Server Component che fetcha slot e passa a BookingForm
- `apps/web/app/booking/actions.ts` — Server Action con error mapping completo
- `apps/web/app/booking/_components/BookingForm.tsx` — form client con success/error state

## Done when

- `pnpm -r exec tsc --noEmit` exit 0 (tutto il workspace)
- `export const dynamic = 'force-dynamic'` presente in `booking/page.tsx`
- `createBookingAction` usa `CreateBookingInputSchema.safeParse()` **prima** di chiamare `createBooking`
- `OverbookingError` e `DuplicateBookingError` producono messaggi IT distinti e comprensibili all'utente
- `gdpr_consent: false` (checkbox non checked) restituisce errore — testabile: inviare il form senza spuntare GDPR → `{ status: 'error' }`
- Il success state mostra il link di cancellazione `/booking/cancel/{token}`
- `useActionState` è importato da `'react'` (non da `'react-dom'`)
- `getWebSupabaseAdmin()` non è importato in nessun file `'use client'`
- Nessun input utente grezzo finisce in chiamate dirette al client privilegiato fuori dal service layer
