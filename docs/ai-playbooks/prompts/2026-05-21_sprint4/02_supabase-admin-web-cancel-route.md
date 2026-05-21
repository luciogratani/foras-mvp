---
status: READY
sprint: 4
sub-task: "02"
created: 2026-05-21
---

# Sprint 4 / 02 — `apps/web/lib/supabaseAdmin.ts` server-only + rotta `/booking/cancel/[token]`

> /model opus  
> /effort high

## Contesto

Progetto foras-mvp: sistema multi-tenant per siti di bar/ristoranti (Next.js 16 + Supabase self-hosted + pnpm workspaces). Sprint 4 introduce il primo write dal sito pubblico. I service `getAvailableTimeSlots`, `createBooking`, `cancelBookingByToken` (già pronti in `@repo/supabase`) richiedono tutti un client **privilegiato** (`service_role`) — le RLS attuali bloccano SELECT/UPDATE su `bookings` per utenti `anon`, e `createBooking` chiama `getAvailableTimeSlots` internamente. `apps/web` non ha ancora né il client privilegiato né `SUPABASE_SERVICE_ROLE_KEY`.

Questo sub-task è la **fondazione privilegiata** per tutto il write-path di Sprint 4:
1. Crea `apps/web/lib/supabaseAdmin.ts` — client privilegiato per lo schema tenant
2. Aggiunge `SUPABASE_SERVICE_ROLE_KEY` all'env di `apps/web`
3. Implementa la rotta pubblica `/booking/cancel/[token]` come primo consumer del client privilegiato

**DIFFERENZA CRITICA rispetto ad `apps/admin/lib/supabaseAdmin.ts`:**
- `apps/admin` punta allo schema `public` con tipo `AdminDatabase` (per leggere `public.tenants`)
- `apps/web` deve produrre un `TenantClient` (`Database`, schema `template`) così da poterlo passare ai service di `@repo/supabase`. Non è un client admin generico: è un client tenant con credenziali privilegiate.

## File da leggere prima di iniziare

- `docs/decision-log/decisioni.md` — voce *"2026-05-21 — `SUPABASE_SERVICE_ROLE_KEY` su Vercel admin"* (regole operative vincolanti — vedi sezione "Regole operative", si applicano identicamente a `apps/web`)
- `docs/decision-log/decisioni.md` — voce *"2026-05-21 — `bookings` lato pubblico — service_role server-side, no RPC"* (rationale della scelta architetturale)
- `apps/admin/lib/supabaseAdmin.ts` — pattern di riferimento (import 'server-only', singleton cached, auth flags)
- `packages/supabase/src/client.ts` — `createSupabaseClient()`: usa `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_SCHEMA`. Il nuovo file usa le stesse env URL/SCHEMA ma `SUPABASE_SERVICE_ROLE_KEY` al posto della anon key.
- `packages/supabase/src/index.ts` — vedi `TenantClient`, `Database`, `cancelBookingByToken`, `CancelBookingTokenSchema`
- `packages/supabase/src/services/bookings.ts` — firma `cancelBookingByToken(client: TenantClient, token: string)`
- `packages/supabase/src/schemas/bookings.ts` — `CancelBookingTokenSchema` (UUID validation)
- `apps/web/.env.local` — variabili esistenti (aggiungere SUPABASE_SERVICE_ROLE_KEY con placeholder)
- `.env.example` — il commento di SUPABASE_SERVICE_ROLE_KEY dice "solo apps/admin" — va aggiornato

## Scope

### File da creare

**`apps/web/lib/supabaseAdmin.ts`**

Singleton factory che produce `TenantClient`. Struttura:

```typescript
import 'server-only'  // PRIMA RIGA — obbligatorio
import { createClient } from '@supabase/supabase-js'
import type { Database, TenantClient } from '@repo/supabase'

type SchemaName = Exclude<keyof Database, '__InternalSupabase'>

let cached: TenantClient | undefined

export function getWebSupabaseAdmin(): TenantClient {
  if (cached) return cached

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const schema = process.env.NEXT_PUBLIC_SUPABASE_SCHEMA

  if (!url || !serviceRoleKey || !schema) {
    throw new Error(
      'Missing env vars for web admin client: NEXT_PUBLIC_SUPABASE_URL, ' +
      'NEXT_PUBLIC_SUPABASE_SCHEMA, SUPABASE_SERVICE_ROLE_KEY (server-only)'
    )
  }

  cached = createClient<Database, SchemaName>(url, serviceRoleKey, {
    db: { schema: schema as SchemaName },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return cached
}
```

Note:
- `@supabase/supabase-js` è già in `apps/web/package.json` (2.106.1) — nessuna nuova dipendenza.
- Il tipo di ritorno deve essere `TenantClient` (da `@repo/supabase`) così che TypeScript verifichi la compatibilità con le firme dei service.
- Nessun `global.headers` di Authorization (non è un client autenticato come utente — è un service_role client di sistema).

---

**`apps/web/app/booking/cancel/[token]/page.tsx`**

Server Component. Legge `params.token` dal path. Flusso:

1. `const { token } = await params` (params è `Promise<{ token: string }>` in Next 16)
2. `const parsed = CancelBookingTokenSchema.safeParse(token)` — se non è un UUID valido, mostra pagina "Token non valido." (no redirect, no throw)
3. `const result = await cancelBookingByToken(getWebSupabaseAdmin(), parsed.data)` in un try/catch
4. `result.cancelled === true` → UI "Prenotazione annullata con successo. I coperti sono stati liberati."
5. `result.cancelled === false` → UI "Link già utilizzato o prenotazione non trovata." (esito normale — `cancelBookingByToken` non throwa mai per token inesistente)
6. `catch` → UI "Si è verificato un errore. Riprova più tardi."
7. Ogni UI include un link `<a href="/">← Torna alla homepage</a>`
8. `export const dynamic = 'force-dynamic'`
9. UI headless semplice: un `<main>` con titolo, messaggio, e il link di ritorno. Nessun componente shadcn complesso necessario.

### File da modificare

**`apps/web/.env.local`** — aggiungere in fondo:
```
# SERVER ONLY — non esporre, non NEXT_PUBLIC_, mai nel bundle client.
# Stesso valore di apps/admin/.env.local → SUPABASE_SERVICE_ROLE_KEY
# Settings Supabase → API → Project API keys → service_role
SUPABASE_SERVICE_ROLE_KEY=INSERIRE_VALORE_REALE
```
*(il master sostituisce INSERIRE_VALORE_REALE — non committare mai il valore reale)*

**`.env.example`** — aggiornare il commento della variabile `SUPABASE_SERVICE_ROLE_KEY` rimuovendo "Usata solo da apps/admin": ora serve anche `apps/web`.

## Vincoli di sicurezza (NON NEGOZIABILI)

- `import 'server-only'` come **prima riga** di `supabaseAdmin.ts` — nessuna eccezione. Un import lato client di questo file deve far fallire `next build`.
- `SUPABASE_SERVICE_ROLE_KEY` **mai con prefisso `NEXT_PUBLIC_`** — finisce nel bundle browser.
- Il token dal path URL **passa sempre per `CancelBookingTokenSchema.safeParse()`** prima di essere usato, anche se il service lo valida internamente. Coerenza col contratto del service.
- Non loggare `getWebSupabaseAdmin()`, la sua config, né `process.env.SUPABASE_SERVICE_ROLE_KEY`.
- Mai accettare input utente come argomento diretto di `.from(...)`, `.select(...)`, `.eq(...)` sul client admin — il token passa solo attraverso il service tipato `cancelBookingByToken`.
- Non committare — il master esamina e committa.

## Output atteso

- `apps/web/lib/supabaseAdmin.ts` — server-only, `TenantClient` privilegiato
- `apps/web/app/booking/cancel/[token]/page.tsx` — pagina cancel con UI semplice e validazione token
- `apps/web/.env.local` — `SUPABASE_SERVICE_ROLE_KEY` aggiunta con placeholder
- `.env.example` — commento aggiornato

## Done when

- `pnpm -r exec tsc --noEmit` exit 0 (tutto il workspace, non solo apps/web)
- `apps/web/lib/supabaseAdmin.ts` inizia con `import 'server-only'` come prima riga
- `getWebSupabaseAdmin()` ritorna `TenantClient` (verifica: TypeScript non si lamenta quando il valore viene passato a `cancelBookingByToken(client: TenantClient, ...)`)
- La cancel page valida il token via `CancelBookingTokenSchema.safeParse()` prima di chiamare il service
- `SUPABASE_SERVICE_ROLE_KEY` **non compare** in nessuna variabile `NEXT_PUBLIC_` né in file tracciati da git
- Nessun `console.log` che espone la service_role key o il client admin
- `.env.local` non è incluso nell'output (è in `.gitignore`)
