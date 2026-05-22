---
status: DONE
updated: 2026-05-22
area: ai-playbooks
type: prompt
sprint: 5
order: 6
tags: [foras-mvp, sprint5, admin, prenotazioni]
owner: master-chat
suggested_model: claude-sonnet-4-6
suggested_effort: medium
---

# Sprint 5 / 6 di 6 — Vista prenotazioni admin

## Contesto

Ultimo sub-task Sprint 5. L'admin può vedere le prenotazioni ricevute, filtrarle per data e turno, e cancellarle. Il write-path prenotazioni esiste già (`createBooking`, `cancelBookingByToken` in `services/bookings.ts`); serve una funzione admin-read (non filtrata per status) e una cancel-by-id (senza token).

La vista mostra **due sezioni separate**: prenotazioni confermate (con azione cancella) e storico cancellazioni (sola lettura, visivamente distinto).

## File da leggere prima di iniziare

- `packages/supabase/src/services/bookings.ts` — funzioni esistenti, schema `AvailableTimeSlot`
- `packages/supabase/src/services/news.ts` — pattern service admin più recente
- `apps/admin/app/dashboard/news/actions.ts` — pattern action + `requireTenantClient`
- `apps/admin/app/dashboard/news/_components/SlideList.tsx` — pattern lista client
- `docs/tech-architecture/data-model.md` — tabella `bookings`

## Scope

### 1. Service — `packages/supabase/src/services/bookings.ts` (estendere)

```ts
export type BookingAdmin = Tables<{ schema: 'template' }, 'bookings'>

export async function getBookingsAdmin(
  client: TenantClient,
  filters?: { date?: string; time_slot_id?: string }
): Promise<BookingAdmin[]>
// SELECT * WHERE (date=filter?) AND (time_slot_id=filter?)
// Nessun filtro su status: ritorna sia confirmed che cancelled
// ORDER BY date DESC, time_slot_id ASC

export async function cancelBookingAdmin(client: TenantClient, id: string): Promise<void>
// UPDATE bookings SET status='cancelled' WHERE id=id
```

### 2. Barrel `packages/supabase/src/index.ts`

Aggiungere `getBookingsAdmin`, `cancelBookingAdmin`, `BookingAdmin`.

### 3. Server Actions — `apps/admin/app/dashboard/prenotazioni/actions.ts`

- `cancelBookingAction(prevState, formData)` — id da FormData → `cancelBookingAdmin` → `revalidatePath('/dashboard/prenotazioni')` → return state
- Filtraggio: gestito lato client (i filtri cambiano la query in `page.tsx` via searchParams — no action separata)

### 4. Page — `apps/admin/app/dashboard/prenotazioni/page.tsx`

Server Component con `export const dynamic = 'force-dynamic'`. Legge `searchParams.date` e `searchParams.time_slot_id` per filtrare. Fetcha:
- `getBookingsAdmin(client, { date, time_slot_id })` — tutte le prenotazioni (confirmed + cancelled)
- `getTimeSlotsAdmin(client)` — per popolare la select filtro turni (funzione già esistente in `services/site-admin.ts`)

Divide il risultato in due array (`confirmed`, `cancelled`) e passa entrambi a `BookingList`.

### 5. UI — `apps/admin/app/dashboard/prenotazioni/_components/`

**`BookingFilters.tsx`** — `'use client'`. Select data (input `type="date"`) + select turno (opzioni da time slots). Submit aggiorna searchParams con `router.push`. Valore corrente dei filtri letto da props (passato dalla page via searchParams).

**`BookingList.tsx`** — riceve `confirmed: BookingAdmin[]` e `cancelled: BookingAdmin[]`. Renderizza:
1. Sezione **"Prenotazioni confermate"** — tabella/lista con colonne: nome, email, coperti, data, turno (label). Ogni riga ha bottone "Cancella" che apre `DeleteBookingDialog`. Se la lista è vuota: messaggio "Nessuna prenotazione confermata per i filtri selezionati."
2. Sezione **"Storico cancellazioni"** — tabella/lista identica ma visivamente attenuata (es. `opacity-60` o testo `text-muted-foreground`), senza il bottone cancella. Se vuota: non renderizzare la sezione (nessun messaggio).

**`DeleteBookingDialog.tsx`** — confirm dialog con `useActionState(cancelBookingAction, initialState)`. Input hidden con `id` della prenotazione. Messaggio di conferma con nome e data. Dopo submit con successo il dialog si chiude (effetto `useEffect` su state.success).

## Vincoli

- Nessuna query DB nei componenti — tutto via `@repo/supabase`
- Nessuna modifica a `createBooking` / `cancelBookingByToken` (usati dal sito pubblico)
- Nessuna nuova primitiva in `@repo/ui`
- Nessuna modifica DB
- Il turno nella UI si mostra con la label del time slot (non solo l'UUID) — unisci i dati in `page.tsx` prima di passarli a `BookingList`, oppure includi un join nella query di `getBookingsAdmin` (se più semplice con `.select('*, time_slots(label, start_time)')`)

## Output atteso

- `packages/supabase/src/services/bookings.ts` (+ 2 funzioni admin)
- `packages/supabase/src/index.ts` (export estesi)
- `apps/admin/app/dashboard/prenotazioni/actions.ts`
- `apps/admin/app/dashboard/prenotazioni/page.tsx`
- `apps/admin/app/dashboard/prenotazioni/_components/BookingFilters.tsx`
- `apps/admin/app/dashboard/prenotazioni/_components/BookingList.tsx`
- `apps/admin/app/dashboard/prenotazioni/_components/DeleteBookingDialog.tsx`

## Done when

- `pnpm -r exec tsc --noEmit` exit 0
- `/dashboard/prenotazioni` mostra le prenotazioni confermate con nome, email, coperti, data, label turno
- Lo storico cancellazioni appare sotto, visivamente attenuato, senza bottone cancella
- Filtro per data e turno funzionante (searchParams); entrambe le sezioni si aggiornano
- Cancellazione da admin cambia `status` a `cancelled`; la riga si sposta dalla sezione confirmed allo storico
- Se non ci sono cancellazioni, la sezione storico non appare

## Note per il master

1. **Decisione presa (2026-05-22):** mostrare sia `confirmed` che `cancelled` — due sezioni separate. Lo storico è sola lettura e visivamente attenuato.
2. **Join time_slots:** lasciare alla sub-chat la scelta tra join nella query o lookup in `page.tsx` — entrambi validi, purché la label sia visibile in UI e i tipi siano corretti.
3. **Commit (master, dopo review):** `feat(admin): add bookings list with date/slot filter and cancel action`
4. Frontmatter → `status: DONE` a fine sessione.
