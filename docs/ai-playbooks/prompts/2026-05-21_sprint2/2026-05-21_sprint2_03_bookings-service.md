---
status: DRAFT
updated: 2026-05-21
area: ai-playbooks
type: prompt
sprint: 2
order: 3
tags: [foras-mvp, sprint2, service-layer, bookings, zod, security]
owner: master-chat
suggested_model: claude-sonnet-4-6
suggested_effort: high
---

# Sprint 2 / 3 of 3 — Service layer: bookings (+ Zod schemas)

## Contesto

Chiude Sprint 2. È il sub-task più denso: tre funzioni con tre profili di privilegi diversi, validazione Zod centralizzata, e l'unico punto del service layer che tocca la **superficie d'attacco anonima** della scrittura (`createBooking`). I sub-task 01 (site) e 02 (menu) sono read-only puri; questo introduce la prima vera "intelligenza" del service layer.

Le RLS attuali su `bookings` (definite in `create_schema_from_template.sql` §4) sono:

- `bookings_public_insert` → INSERT permesso ad anon (con check `true` — qualsiasi inserimento)
- `bookings_admin_select`, `bookings_admin_update`, `bookings_admin_delete` → solo `auth.uid() IS NOT NULL`

Questo significa che:

- `createBooking` è eseguibile con **client anon** (è il caso d'uso pubblico del form prenotazioni di Sprint 4).
- `getAvailableTimeSlots` e `cancelBookingByToken` richiedono un **client privilegiato** (SELECT/UPDATE su bookings). Il consumer di Sprint 3/4 lo fornirà server-side. La decisione architetturale di **non** aggiungere RPC `SECURITY DEFINER` è tracciata nel decision-log (voce *2026-05-21 — `bookings` lato pubblico — service_role server-side, no RPC*). Sprint 2 produce solo i service; le credenziali sono problema del consumer.

In questo sub-task si introduce inoltre la directory `packages/supabase/src/schemas/` per i Zod schema — vedi `## Note di design` in coda al prompt per il rationale.

## File da leggere prima di iniziare

- `docs/tech-architecture/data-model.md` — sezione "Schema prenotazioni" (`time_slots`, `bookings`, unique constraint, flusso cancellazione)
- `docs/product-scope/mvp.md` — sezione "Prenotazioni — feature incluse nell'MVP" (campi del form, GDPR, cancellation_token)
- `docs/build-delivery/runbook-implementazione.md` — sezione "Phase 2 — Service Layer" (criteri "Done when")
- `docs/decision-log/decisioni.md` — voci:
  - *Rate limiting prenotazioni* (unique constraint a livello DB)
  - *Conferma prenotazioni* (automatica con controllo coperti)
  - *2026-05-21 — Service layer — funzioni ricevono il client come parametro*
  - *2026-05-21 — `bookings` lato pubblico — service_role server-side, no RPC* ← centrale per capire perché due dei tre service richiedono client privilegiato
- `docs/operations/create_schema_from_template.sql` — §2 (tabelle `time_slots`, `bookings`), §4 (policy `bookings_*`)
- `docs/operations/rls_isolation_tests.sql` — sezione 1.8–1.11 (cosa anon può e non può fare su `bookings`)
- `packages/supabase/src/services/site.ts` e `menu.ts` — pattern di riferimento (firma, error handling)
- `packages/supabase/src/types/database.ts` — tipi Row per `time_slots` e `bookings`

## Scope

### 1. Zod schemas in directory dedicata

Creare `packages/supabase/src/schemas/bookings.ts` con:

```ts
import { z } from 'zod'

export const CreateBookingInputSchema = z.object({
  time_slot_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD'),
  name: z.string().min(1).max(120).trim(),
  email: z.string().email().max(255).trim().toLowerCase(),
  phone: z.string().min(3).max(40).trim().nullable().optional(),
  covers: z.number().int().min(1).max(50),
  notes: z.string().max(500).trim().nullable().optional(),
  gdpr_consent: z.literal(true), // obbligatorio per accettare la prenotazione
})

export type CreateBookingInput = z.infer<typeof CreateBookingInputSchema>

export const CancelBookingTokenSchema = z.string().uuid()
```

Esportare lo schema **e** il tipo inferito. Le regole sui campi vengono dal data model e dal product scope (`docs/product-scope/mvp.md` → "Form prenotazioni — campi").

Aggiungere `packages/supabase/src/schemas/index.ts` come barrel che re-esporta tutto da `bookings.ts`:

```ts
export * from './bookings'
```

### 2. Service in `packages/supabase/src/services/bookings.ts`

```ts
import type { Tables } from '../types/database'
import type { TenantClient } from '../index'
import { CreateBookingInputSchema, CancelBookingTokenSchema, type CreateBookingInput } from '../schemas/bookings'

export type TimeSlot = Tables<{ schema: 'template' }, 'time_slots'>
export type Booking = Tables<{ schema: 'template' }, 'bookings'>

export type AvailableTimeSlot = {
  time_slot_id: string
  label: string
  time: string             // 'HH:MM:SS' come ritornato da PostgreSQL TIME
  max_covers: number
  booked_covers: number
  available_covers: number // max_covers - booked_covers, mai negativo
}

/**
 * Per una data, ritorna i turni attivi con i coperti residui.
 *
 * Richiede un client privilegiato (auth.uid() IS NOT NULL): la RLS attuale
 * blocca SELECT su bookings ad anon. Il consumer server-side è responsabile
 * di passare un client istanziato con SUPABASE_SERVICE_ROLE_KEY.
 * Vedi decision-log: "2026-05-21 — bookings lato pubblico — service_role server-side, no RPC".
 */
export async function getAvailableTimeSlots(
  client: TenantClient,
  date: string
): Promise<AvailableTimeSlot[]>

/**
 * Crea una prenotazione. Eseguibile con client anon (RLS: bookings_public_insert).
 *
 * - Valida l'input con CreateBookingInputSchema (throw ZodError su input non valido).
 * - Verifica disponibilità coperti per (time_slot_id, date): legge i bookings
 *   confermati e somma `covers`. Se covers richiesti > available → throw
 *   OverbookingError. NOTA: questa lettura richiede client privilegiato per la
 *   stessa ragione di getAvailableTimeSlots. Il consumer chiamerà createBooking
 *   con il client server-side, NON con il client browser anon.
 * - Affida l'unique constraint (email, time_slot_id, date) a Postgres: in caso
 *   di duplicato il client riceve un errore 23505 → mappare a DuplicateBookingError.
 * - Ritorna { id, cancellation_token } per consentire al consumer di inviare
 *   l'email di conferma (Sprint 4).
 */
export async function createBooking(
  client: TenantClient,
  input: CreateBookingInput
): Promise<{ id: string; cancellation_token: string }>

/**
 * Cancella una prenotazione confermata dato il suo token.
 *
 * Richiede client privilegiato (RLS: bookings_admin_update).
 * - Valida il token come UUID (throw ZodError su non-UUID).
 * - UPDATE status='cancelled' WHERE cancellation_token = token AND status = 'confirmed'.
 * - Ritorna { cancelled: true, booking_id } se ha aggiornato 1 riga,
 *   { cancelled: false } se 0 righe (token inesistente o già cancellato).
 *   Mai throw per "token non trovato": è un esito normale per un link riusato.
 */
export async function cancelBookingByToken(
  client: TenantClient,
  token: string
): Promise<{ cancelled: boolean; booking_id?: string }>
```

Note implementative chiave:

- **`getAvailableTimeSlots(client, date)`**
  - Una query su `time_slots` (active) + una query su `bookings` filtrata su `date` e `status='confirmed'`, poi merge in TS:
    ```ts
    const [slotsRes, bookedRes] = await Promise.all([
      client.from('time_slots').select('*').eq('is_active', true).order('time', { ascending: true }),
      client.from('bookings').select('time_slot_id, covers').eq('date', date).eq('status', 'confirmed'),
    ])
    ```
  - `booked_covers` = somma `covers` raggruppata per `time_slot_id` (Map locale).
  - `available_covers = Math.max(0, max_covers - booked_covers)` (mai negativo, anche se per ipotesi un seed avesse generato overbooking storico).
  - Ritorna `AvailableTimeSlot[]` ordinato per `time` ascendente.

- **`createBooking(client, input)`**
  - Validazione: `const parsed = CreateBookingInputSchema.parse(input)` (lascia bubble-up ZodError).
  - Controllo capacità: chiama `getAvailableTimeSlots(client, parsed.date)`, trova lo slot per `parsed.time_slot_id`, se assente o non attivo → `throw new Error('time_slot non disponibile')`. Se `available_covers < parsed.covers` → `throw new OverbookingError(...)`.
  - Inserimento: `from('bookings').insert({ ...parsed }).select('id, cancellation_token').single()`.
  - Errore duplicato: il codice Postgres per unique violation è `23505`. Mappare a `throw new DuplicateBookingError(...)` con messaggio chiaro.
  - Errori custom (`OverbookingError`, `DuplicateBookingError`) come `class extends Error` con `name` settato, in cima al file. Vanno **esportati**, così la route handler di Sprint 4 può discriminare i 4xx con `instanceof`.
  - **Race condition nota:** il controllo capacità + insert non è atomico. Per MVP è accettabile (la unique constraint è il vero rate-limit; l'overbooking soft può capitare con due inserimenti simultanei sullo stesso slot in pochi millisecondi). Documentato come limitazione in un commento JSDoc, trigger di revisione = caso reale di overbooking osservato.

- **`cancelBookingByToken(client, token)`**
  - Validazione: `CancelBookingTokenSchema.parse(token)` (lascia bubble-up ZodError per input non-UUID).
  - `from('bookings').update({ status: 'cancelled' }).eq('cancellation_token', token).eq('status', 'confirmed').select('id').maybeSingle()`
  - Se `data?.id` esiste → `{ cancelled: true, booking_id: data.id }`. Altrimenti `{ cancelled: false }`.
  - Mai throw per "token non trovato" — la pagina `/booking/cancel/[token]` deve poter mostrare "Prenotazione già cancellata o link non valido" senza un 500.

### 3. Aggiornare `packages/supabase/src/index.ts`

```ts
// Services
export { getSiteSettings, getActiveNews } from './services/site'
export { getMenuSections, getMenuBySection, getAllergens } from './services/menu'
export {
  getAvailableTimeSlots,
  createBooking,
  cancelBookingByToken,
  OverbookingError,
  DuplicateBookingError,
} from './services/bookings'

// Types
export type { SiteSettings, NewsSlide } from './services/site'
export type { MenuSection, MenuCategory, MenuItem, Allergen } from './services/menu'
export type { TimeSlot, Booking, AvailableTimeSlot } from './services/bookings'

// Schemas (Zod + types inferiti)
export { CreateBookingInputSchema, CancelBookingTokenSchema } from './schemas/bookings'
export type { CreateBookingInput } from './schemas/bookings'
```

### 4. Aggiungere `zod` come dependency di `@repo/supabase`

`packages/supabase/package.json`:

```jsonc
{
  "dependencies": {
    "zod": "^3.23.0"
  }
}
```

`zod` va in **`dependencies`** (non devDep né peer): viene importato sia dai service (runtime) sia dagli schema (runtime, per i form lato client). È una scelta deliberata — i form di Sprint 4 potranno fare:

```ts
import { CreateBookingInputSchema } from '@repo/supabase/schemas/bookings'
```

senza tirare giù `@supabase/supabase-js` (vedi `## Note di design`).

Eseguire `pnpm install` e committare il `pnpm-lock.yaml` aggiornato.

### 5. Verifiche finali

- `pnpm -r tsc --noEmit` pulito
- `pnpm --filter @repo/web build` e `pnpm --filter @repo/admin build` continuano a girare (i service non sono ancora consumati, ma non devono rompere il graph)

## Vincoli

- **Firma fissa** `(client: TenantClient, ...)` su tutte e tre le service function. Niente client interno.
- **Niente RPC PostgreSQL, niente cambio dello schema baseline.** La decisione è tracciata e i service operano puramente in TypeScript sopra le tabelle esistenti.
- **Validazione Zod per ogni input utente** (`createBooking.input`, `cancelBookingByToken.token`). Mai fidarsi del chiamante.
- **Mapping errori esplicito:** Postgres `23505` → `DuplicateBookingError`; overbooking → `OverbookingError`. Altri errori si propagano come `Error` con messaggio leggibile. Mai inghiottire un errore.
- **`cancelBookingByToken` non deve mai throw per token-non-valido.** È un caso d'uso normale, non un errore.
- **GDPR:** `gdpr_consent` deve essere `true` (Zod `z.literal(true)`) — il form di Sprint 4 *deve* impostarlo, il service non accetta `false`.
- **Niente side-effect cross-domain:** nessuna chiamata Resend qui (è Sprint 4, dentro l'edge function). Il service ritorna solo `id` e `cancellation_token`; chi consuma decide se inviare l'email.
- **Schema Zod separati dai service:** `schemas/` è una directory di pari livello a `services/`. Non co-locare gli schema nei service files. Vedi `## Note di design` per il rationale.
- **Non toccare** `client.ts`, `types/database.ts`, `services/site.ts`, `services/menu.ts`, `apps/`.

## Output atteso

- `packages/supabase/src/schemas/bookings.ts` (Zod schemas + types)
- `packages/supabase/src/schemas/index.ts` (barrel)
- `packages/supabase/src/services/bookings.ts` (3 funzioni + 2 error class + type alias)
- `packages/supabase/src/index.ts` con tutti i re-export aggiornati (site + menu + bookings + schemas)
- `packages/supabase/package.json` con `zod` in `dependencies`
- `pnpm-lock.yaml` aggiornato
- `pnpm -r tsc --noEmit` exit 0

## Done when

- Le tre funzioni sono importabili da `@repo/supabase` e tipate
- `CreateBookingInputSchema.parse({...valido})` ritorna i dati validati; input non valido throw `ZodError`
- `createBooking` rifiuta `gdpr_consent: false` via Zod (prima ancora di toccare il DB)
- `createBooking` con `covers > available_covers` throw `OverbookingError`
- Duplicato `(email, time_slot_id, date)` throw `DuplicateBookingError` (codice 23505 mappato)
- `getAvailableTimeSlots(client, '2099-12-31')` con DB vuoto di prenotazioni → `available_covers = max_covers` per ogni slot attivo
- `cancelBookingByToken(client, '<token-valido>')` → `{ cancelled: true, booking_id }`, status passa a `'cancelled'`; secondo tentativo → `{ cancelled: false }`
- `cancelBookingByToken(client, 'non-uuid')` → throw `ZodError`
- `pnpm -r tsc --noEmit` exit 0

## Note per il master

1. **Smoke test prerequisito:** `create_schema_from_template.sql` §5d ora include due seed di default per `time_slots` (Pranzo 12:30/30, Cena 20:00/50). Assicurarsi che siano presenti anche nel `template` già esistente — se sono stati introdotti dopo l'applicazione iniziale, eseguirli manualmente nel SQL editor come service_role:
   ```sql
   INSERT INTO template.time_slots (label, time, max_covers, is_active) VALUES
     ('Pranzo', '12:30', 30, true),
     ('Cena',   '20:00', 50, true);
   ```
   Verifica attesa:
   - `getAvailableTimeSlots(adminClient, '2099-12-31')` → 2 righe con `available_covers` pari ai rispettivi `max_covers`
   - `createBooking(adminClient, { time_slot_id: '<id-pranzo>', date: '2099-12-31', name: 'Test', email: 'a@test.com', covers: 4, gdpr_consent: true })` → `{ id, cancellation_token }`
   - Re-chiamare `getAvailableTimeSlots` → `available_covers` per quello slot = `max_covers - 4`
   - `cancelBookingByToken(adminClient, '<token>')` → `{ cancelled: true, booking_id }`; re-chiamare → `{ cancelled: false }`
   - Cleanup: `DELETE FROM template.bookings WHERE email = 'a@test.com'` (i seed `time_slots` restano — sono il default del template).
2. **Lo smoke test deve usare un client privilegiato.** L'unico già esistente nel repo è `apps/admin/lib/supabaseAdmin.ts`. Per testare puramente dentro `@repo/supabase` (senza dipendere da apps), si può istanziare `createClient(URL, SERVICE_ROLE_KEY, { db: { schema: 'template' } })` in uno script `tsx` temporaneo non committato.
3. **Sprint 4 prerequisito (out of scope qui, ma da tenere in agenda):** `apps/web` dovrà introdurre il proprio `lib/supabaseAdmin.ts` server-only + env `SUPABASE_SERVICE_ROLE_KEY` su Vercel, replicando il pattern di `apps/admin`. Il prompt di Sprint 4 lo richiamerà esplicitamente.
4. **Suggerito:** `/model claude-sonnet-4-6`, `/effort high`. Densità di edge case alta (race, errori mappati, RLS, GDPR consent).
5. **Commit:** `feat(supabase): add bookings service with zod schemas and error mapping`
6. Frontmatter → `status: DONE`. **Sprint 2 chiuso** → aggiornare `backlog.md` (criteri Done Sprint 2) e aprire Sprint 3 (homepage SSR — primo consumer reale del service layer).

## Note di design — perché `schemas/` separato da `services/`

Tre opzioni considerate per la collocazione degli Zod schema:

- (a) **Co-located nei service files** (`services/bookings.ts` contiene sia `CreateBookingInputSchema` che `createBooking`)
- (b) **Co-located in file fratelli** (`services/bookings.schemas.ts` accanto a `services/bookings.ts`)
- (c) **Directory dedicata** `schemas/` di pari livello a `services/`

**Scelta: (c).** Motivi:

1. **Bundle separation per i consumer client.** I form lato client (Sprint 4 — `apps/web/app/booking/...`) hanno bisogno di `CreateBookingInputSchema` per `react-hook-form` + `zodResolver`. Se gli schema vivono dentro `services/bookings.ts`, importarli da quel file trascina via tree-shaking l'intero modulo (e quindi i suoi import: `@supabase/supabase-js`, i tipi `Database`, ecc.) — non c'è side-effect, ma alcuni bundler non sono perfetti e il rischio di portarsi via `@supabase/supabase-js` nel browser bundle è reale. Tenere `schemas/` puro `zod` evita il problema by design.
2. **Riusabilità simmetrica.** Gli schema sono il contratto tra producer (service) e consumer (form). Vivono al boundary, non da una parte sola. Tenerli in una directory dedicata segnala questa natura.
3. **Estensibilità senza refactor.** Se Sprint 3+ aggiungesse schemi per `site` (es. updateSiteSettingsInput) o `menu` (`upsertMenuItemInput` lato admin Sprint 5), si aggiungono come `schemas/site.ts`, `schemas/menu.ts` senza spostamenti di codice.

L'opzione (a) è più compatta ma intreccia tipi di input con logica DB. L'opzione (b) risolve il bundle problem ma frammenta i file dentro la stessa directory. (c) è la più chiara a costo zero (per ora un solo file `schemas/bookings.ts`).
