---
status: READY
created: 2026-05-23
area: packages/supabase
type: prompt
model: claude-sonnet-4-6
effort: medium
---

# Admin UX-fix 02 — Schema: extra_data, social, maintenance_mode, closed_dates range

## Contesto

`foras-mvp` è un sistema multi-tenant per siti di bar/ristoranti (Next.js 16 + Supabase self-hosted + pnpm workspaces). Questo task estende lo schema del template con nuove colonne in `site_settings` e `closed_dates`, aggiorna i tipi TypeScript a mano e aggiorna il service layer. Il SQL verrà applicato manualmente da Lucio nel dashboard Supabase — il tuo compito è produrre il file di migrazione e aggiornare tutto il codice TypeScript coerentemente.

## File da leggere prima di iniziare

- `packages/supabase/src/types/database.ts` — tipi generati, da aggiornare a mano (sezioni `site_settings` e `closed_dates` in `Row`/`Insert`/`Update`)
- `packages/supabase/src/services/site-admin.ts` — `updateSiteSettings`, `addClosedDate`, `getClosedDates`, `ClosedDate` type
- `packages/supabase/src/services/bookings.ts` — `getAvailableTimeSlots`: query su `closed_dates` da aggiornare per supportare i range
- `packages/supabase/src/schemas/settings.ts` — Zod schemas per settings (aggiornare con nuovi campi)
- `docs/operations/create_schema_from_template.sql` — riferimento per lo stile SQL del progetto (RLS, naming, commenti)

## Scope

### 1 — File SQL di migrazione

Crea `docs/operations/migration-2026-05-23-schema-extras.sql` con le seguenti modifiche, applicate allo schema `template`. Il file sarà eseguito da Lucio nel SQL editor del dashboard Supabase. Seguire lo stile del progetto: commenti per sezione, istruzioni idempotenti dove possibile.

```sql
-- Nuove colonne site_settings
ALTER TABLE template.site_settings
  ADD COLUMN IF NOT EXISTS extra_data     JSONB    NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS social_whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS social_instagram TEXT,
  ADD COLUMN IF NOT EXISTS social_facebook  TEXT,
  ADD COLUMN IF NOT EXISTS maintenance_mode BOOLEAN NOT NULL DEFAULT false;

-- Supporto range in closed_dates (end_date nullable = giorno singolo se NULL)
ALTER TABLE template.closed_dates
  ADD COLUMN IF NOT EXISTS end_date DATE;

-- Constraint: end_date >= date (solo quando valorizzato)
ALTER TABLE template.closed_dates
  ADD CONSTRAINT IF NOT EXISTS closed_dates_end_after_start
  CHECK (end_date IS NULL OR end_date >= date);
```

Nessuna modifica alle policy RLS esistenti: le colonne nuove ereditano le policy della tabella padre.

### 2 — Aggiornamento tipi TypeScript (`packages/supabase/src/types/database.ts`)

Aggiungere le nuove colonne ai tipi `site_settings` e `closed_dates` in tutte e tre le sezioni (`Row`, `Insert`, `Update`):

**`site_settings`:**
- `Row`: `extra_data: Json`, `social_whatsapp: string | null`, `social_instagram: string | null`, `social_facebook: string | null`, `maintenance_mode: boolean`
- `Insert`: tutti opzionali con default (`extra_data?: Json`, `maintenance_mode?: boolean`, gli altri `string | null`)
- `Update`: tutti opzionali

**`closed_dates`:**
- `Row`: `end_date: string | null`
- `Insert`: `end_date?: string | null`
- `Update`: `end_date?: string | null`

### 3 — Aggiornamento service: `site-admin.ts`

**`updateSiteSettings`:** la funzione riceve un oggetto patch — assicurarsi che i nuovi campi (`extra_data`, `social_whatsapp`, `social_instagram`, `social_facebook`, `maintenance_mode`) siano inclusi nel tipo di input. Se esiste uno Zod schema per settings, aggiornarlo in `packages/supabase/src/schemas/settings.ts`.

**`addClosedDate`:** aggiungere campo opzionale `end_date?: string` all'input. Aggiornare l'INSERT per includerlo se presente. Aggiornare lo Zod schema corrispondente se esiste (validare che `end_date >= date` se valorizzato).

### 4 — Aggiornamento service: `bookings.ts` — `getAvailableTimeSlots`

La query su `closed_dates` attuale è:
```ts
client.from('closed_dates').select('id').eq('date', date).limit(1).maybeSingle()
```

Deve diventare range-aware: la data target è chiusa se cade all'interno di un qualsiasi range `[date, COALESCE(end_date, date)]`:
```ts
client
  .from('closed_dates')
  .select('id')
  .lte('date', date)                              // start_date <= target
  .or(`end_date.is.null,end_date.gte.${date}`)    // end_date IS NULL OR end_date >= target
  .limit(1)
  .maybeSingle()
```

La logica downstream (`if (closedDateRes.data) return []`) resta invariata.

## Vincoli

- Non applicare il SQL al DB — produrre solo il file `.sql`
- Non modificare file fuori da `packages/supabase/src/` e `docs/operations/`
- Non aggiungere dipendenze nuove
- `pnpm -r exec tsc --noEmit` deve restare verde dopo le modifiche TypeScript (anche senza aver applicato il SQL — i tipi devono essere coerenti col codice)
- Mantenere lo stile uniforme con le altre funzioni del service layer (firma `(client: TenantClient, ...)`, error wrap `new Error('<fn> failed: <msg>')`)

## Output atteso

- `docs/operations/migration-2026-05-23-schema-extras.sql` — file SQL pronto per l'esecuzione manuale
- `packages/supabase/src/types/database.ts` — `site_settings` e `closed_dates` aggiornati
- `packages/supabase/src/services/site-admin.ts` — `updateSiteSettings` e `addClosedDate` aggiornati
- `packages/supabase/src/schemas/settings.ts` — Zod schemas aggiornati se presenti
- `packages/supabase/src/services/bookings.ts` — query `closed_dates` range-aware
- `pnpm -r exec tsc --noEmit` exit 0

## Done when

- [ ] `migration-2026-05-23-schema-extras.sql` esiste e contiene tutte e 6 le modifiche (5 colonne `site_settings` + 1 colonna + 1 constraint `closed_dates`)
- [ ] `database.ts` riflette le nuove colonne in Row/Insert/Update per entrambe le tabelle
- [ ] `addClosedDate` accetta `end_date` opzionale
- [ ] `getAvailableTimeSlots` usa la query range-aware
- [ ] `pnpm -r exec tsc --noEmit` exit 0
