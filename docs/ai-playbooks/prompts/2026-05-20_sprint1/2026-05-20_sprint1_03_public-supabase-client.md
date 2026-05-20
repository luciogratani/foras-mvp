---
status: DRAFT
updated: 2026-05-20
area: ai-playbooks
type: prompt
sprint: 1
order: 3
tags: [foras-mvp, sprint1, supabase, client]
owner: master-chat
---

# Sprint 1 / 3 of 5 — Client Supabase pubblico condiviso (schema-aware)

## Contesto

Lo schema `template` è applicato e i tipi `Database` sono generati (sub-task 01-02 completati). Ora si implementa il **client Supabase pubblico** condiviso in `@repo/supabase`: legge le tre `NEXT_PUBLIC_*` env e inizializza il client sullo schema corretto. In Sprint 0 era stato lasciato un placeholder (`createSupabaseClient()` che lancia "not implemented yet") + un health endpoint: ora si implementa per davvero, tipato con `Database`.

Questo client è quello **anonimo/pubblico** (usato dalla homepage SSR e dal form prenotazioni). Il client admin verificato è il sub-task 04 successivo — non implementarlo qui.

## File da leggere prima di iniziare

- `packages/supabase/src/client.ts` — placeholder attuale da sostituire
- `packages/supabase/src/index.ts` — export
- `packages/supabase/src/types/database.ts` — tipo `Database` generato (sub-task 02)
- `docs/tech-architecture/architettura-fullstack.md` — sezioni "Multi-tenancy — schema separation" e "Variabili d'ambiente per tenant" (mostra `createClient(URL, KEY, { db: { schema } })`)
- `apps/web/app/api/health/route.ts` — health endpoint che già usa la factory placeholder (va mantenuto funzionante)

## Scope

1. Reimplementare `packages/supabase/src/client.ts`:
   - `createSupabaseClient()` → ritorna `SupabaseClient<Database>` tipato
   - Legge `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_SCHEMA` da `process.env`
   - Inizializza con `{ db: { schema: <NEXT_PUBLIC_SUPABASE_SCHEMA> } }`
   - Errore esplicito (throw con messaggio chiaro) se una delle tre variabili manca
   - Usa `@supabase/supabase-js` (già peer dependency dello Sprint 0)
2. Esportare da `src/index.ts`: `createSupabaseClient` e il tipo `SupabaseClient<Database>` come alias comodo (es. `export type TenantClient = SupabaseClient<Database>`).
3. Verificare che `apps/web/app/api/health/route.ts` continui a funzionare con la nuova factory (deve restituire `{ ok: true, supabase: 'reachable' }`). Adattare l'import se cambia la firma, senza cambiare il comportamento dell'endpoint.

## Vincoli

- Solo client **anonimo** (anon key). Niente service_role qui (è del sub-task 04, server-only).
- Il client deve essere tipato `SupabaseClient<Database>` — niente `any`.
- Nessun service function (`getSiteSettings`, `getMenuBySection`, ecc.): quelli sono Sprint 2. Qui solo la factory del client.
- Nessuna dipendenza nuova oltre `@supabase/supabase-js`.
- Lo schema NON è hardcodato: viene sempre da `NEXT_PUBLIC_SUPABASE_SCHEMA` (così il fork cliente cambia solo la env).

## Output atteso

- `packages/supabase/src/client.ts` con `createSupabaseClient()` reale e tipato
- `src/index.ts` esporta factory + tipo `TenantClient`
- Health endpoint web ancora verde

## Done when

- `createSupabaseClient()` ritorna un client tipato `Database` sullo schema da env
- Variabili mancanti → errore esplicito (no crash silenzioso)
- `curl localhost:3000/api/health` → `{ ok: true, supabase: 'reachable' }` (con `.env.local` popolato)
- `pnpm -r tsc --noEmit` pulito; `pnpm --filter @repo/web build` exit 0

## Note per il master

1. Commit: `feat(supabase): implement schema-aware public client`
2. Frontmatter → `status: DONE`. Procedere al sub-task 04 (admin auth verificata).
