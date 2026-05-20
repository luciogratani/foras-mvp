---
status: DRAFT
updated: 2026-05-21
area: ai-playbooks
type: prompt
sprint: 2
order: 1
tags: [foras-mvp, sprint2, service-layer, site]
owner: master-chat
suggested_model: claude-sonnet-4-6
suggested_effort: medium
---

# Sprint 2 / 1 of 3 — Service layer: site

## Contesto

Apre Sprint 2 (service layer in `@repo/supabase`). Sprint 1 ha lasciato lo schema `template` applicato, i tipi `Database` generati, il client schema-aware tipato (`createSupabaseClient`, alias `TenantClient`) e l'admin client verificato. Adesso si inizia a costruire le funzioni server-side che la homepage SSR (Sprint 3) e il backoffice (Sprint 5) consumeranno.

Questo sub-task copre **solo i dati "site"**: la riga unica di `site_settings` (titolo, descrizione, slogan, bio, contatti, opening_hours, og_image) e le slide attive di `news_slides`. Sono entrambe **read-only pubbliche**: la RLS in `create_schema_from_template.sql` espone SELECT a tutti (anon incluso), nessuna restrizione. Nessun input utente → nessuna validazione Zod necessaria.

I service di `menu` e `bookings` arrivano nei sub-task 02 e 03.

## File da leggere prima di iniziare

- `docs/build-delivery/runbook-implementazione.md` — sezione "Phase 2 — Service Layer" (criteri "Done when")
- `docs/tech-architecture/data-model.md` — tabelle `site_settings` e `news_slides`; struttura JSON di `opening_hours`
- `docs/tech-architecture/architettura-fullstack.md` — sezione "Strategia di caricamento — homepage pubblica" (capire chi consumerà questi service e come)
- `docs/decision-log/decisioni.md` — voce *2026-05-21 — Service layer — funzioni ricevono il client come parametro*
- `packages/supabase/src/types/database.ts` — tipi Row generati per `template`
- `packages/supabase/src/client.ts` e `packages/supabase/src/index.ts` — `createSupabaseClient`, `TenantClient`
- `docs/operations/create_schema_from_template.sql` — sezione 4, policy `site_settings_public_read` / `news_slides_public_read`

## Scope

1. Creare `packages/supabase/src/services/site.ts` con due funzioni:

   ```ts
   import type { Tables } from '../types/database'
   import type { TenantClient } from '../index'

   export type SiteSettings = Tables<{ schema: 'template' }, 'site_settings'>
   export type NewsSlide = Tables<{ schema: 'template' }, 'news_slides'>

   /**
    * Riga unica di site_settings per il tenant corrente.
    * Eseguibile con client anon (RLS: site_settings_public_read).
    */
   export async function getSiteSettings(client: TenantClient): Promise<SiteSettings | null> { ... }

   /**
    * Slide attive ordinate per position (NULLS LAST), poi name alfabetico.
    * Eseguibile con client anon (RLS: news_slides_public_read).
    */
   export async function getActiveNews(client: TenantClient): Promise<NewsSlide[]> { ... }
   ```

   - `getSiteSettings`:
     - `from('site_settings').select('*').limit(1).maybeSingle()`
     - Ritorna `SiteSettings | null` (null se il seed non è stato applicato)
     - Su errore Supabase: throw con messaggio chiaro (`new Error(\`getSiteSettings failed: ${error.message}\`)`)

   - `getActiveNews`:
     - `from('news_slides').select('*').eq('is_active', true).order('position', { ascending: true, nullsFirst: false }).order('title', { ascending: true })`
     - Ritorna `NewsSlide[]` (array vuoto se nessuna slide attiva, non null)
     - Stesso pattern di error handling

2. Aggiornare `packages/supabase/src/index.ts` esportando da `./services/site`:
   ```ts
   export { getSiteSettings, getActiveNews } from './services/site'
   export type { SiteSettings, NewsSlide } from './services/site'
   ```

3. Verificare che `pnpm -r tsc --noEmit` resti pulito.

## Vincoli

- **Firma fissa:** ogni service riceve `client: TenantClient` come **primo argomento**. Non istanziare il client dentro la funzione, non importare `createSupabaseClient` qui. Riferimento: decision-log voce *Service layer — funzioni ricevono il client come parametro*.
- **Niente query DB fuori da `@repo/supabase`.** I service in `services/` sono l'unico posto in cui può stare `client.from('...')`.
- **Tipi:** usare l'helper `Tables<{ schema: 'template' }, 'name'>` esportato da `index.ts`. Niente `any`, niente tipi a mano.
- **Nessun side-effect:** queste funzioni sono pure read. Nessun logging in produzione, nessuna scrittura.
- **Nessuna nuova dipendenza:** Zod non serve qui (nessun input). `@supabase/supabase-js` è già peer dep di `@repo/supabase`.
- **Non toccare** `client.ts`, `types/database.ts`, né i package di `apps/`.
- **Naming files:** `services/site.ts` (kebab-case singolare per il "dominio dati", non plurale). Convenzione coerente con `menu.ts` e `bookings.ts` in arrivo.

## Output atteso

- `packages/supabase/src/services/site.ts` con le due funzioni + i due type alias
- `packages/supabase/src/index.ts` con i nuovi re-export (le funzioni e i tipi)
- `pnpm -r tsc --noEmit` pulito
- Nessun altro file modificato

## Done when

- `pnpm -r tsc --noEmit` exit 0
- `getSiteSettings(client)` ritorna l'oggetto `site_settings` quando esiste, `null` quando la tabella è vuota
- `getActiveNews(client)` ritorna solo righe con `is_active = true`, nell'ordine corretto (position asc nulls last, poi title asc)
- Errori Supabase si propagano come `Error` con messaggio leggibile (non come oggetto opaco)
- Le funzioni sono importabili da un'app consumer come:
  ```ts
  import { createSupabaseClient, getSiteSettings, getActiveNews } from '@repo/supabase'
  const client = createSupabaseClient()
  const settings = await getSiteSettings(client)
  ```

## Note per il master

1. **Smoke test prima del commit:** dal repo root, con `.env.local` di `apps/web` popolato, è sufficiente importare le funzioni in un Server Component temporaneo o in uno script Node (`tsx`) e stamparne l'output. Lo schema `template` ha un seed `INSERT INTO site_settings (title, description) VALUES ('Nome del locale', '...')` (vedi §5c di `create_schema_from_template.sql`) → `getSiteSettings` deve restituire quella riga. `getActiveNews` ritornerà `[]` finché non si inseriscono slide.
2. **Suggerito:** `/model claude-sonnet-4-6`, `/effort medium`. Scope chiuso (2 funzioni, 1 file nuovo + 1 export).
3. **Commit:** `feat(supabase): add site service (getSiteSettings, getActiveNews)`
4. Frontmatter → `status: DONE`. Procedere al sub-task 02 (menu).
