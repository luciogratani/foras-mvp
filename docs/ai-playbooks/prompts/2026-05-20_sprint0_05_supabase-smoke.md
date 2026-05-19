---
status: DRAFT
updated: 2026-05-20
area: ai-playbooks
type: prompt
sprint: 0
order: 5
tags: [foras-mvp, sprint0, supabase, smoke-test]
owner: master-chat
---

# Sprint 0 / 5 of 5 — Connessione Supabase + smoke test query

## Contesto

Ultimo sub-task dello Sprint 0. Monorepo, apps e packages sono scaffoldati. Resta solo da **verificare** che il progetto Supabase esistente sia raggiungibile dal codice — un test minimo, non l'implementazione del client di produzione (quella arriva in Sprint 1 con i tipi generati e `getVerifiedTenantClient()`).

## File da leggere prima di iniziare

- `docs/tech-architecture/architettura-fullstack.md` — sezione su Supabase Auth/DB/Storage
- `packages/supabase/src/client.ts` (scaffoldato al sub-task 4 con placeholder)
- `.env.example` (sub-task 1) — variabili attese

Non leggere `data-model.md` o file su RLS: in questo sub-task non si tocca lo schema, si fa solo una query "ping".

## Scope

1. Implementare in `packages/supabase/src/client.ts` un **vero** `createSupabaseClient()` che:
   - Importa `createClient` da `@supabase/supabase-js`
   - Legge `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` da `process.env`
   - Lancia un errore esplicito se le variabili mancano
   - Ritorna il client tipato `SupabaseClient` (any tipo per ora, i tipi generati arrivano in Sprint 1)

2. Creare una route smoke test in `apps/web/app/api/health/route.ts`:
   - GET handler che esegue una query banale (`select 1` via RPC se disponibile, oppure `auth.getSession()` che non richiede tabelle)
   - Ritorna `{ ok: true, supabase: 'reachable' }` su successo
   - Ritorna `{ ok: false, error: string }` con status 500 su fallimento

3. Aggiungere a `.env.example` un commento accanto a `NEXT_PUBLIC_SUPABASE_SCHEMA=template` che spiega come ottenere URL e anon key dalla dashboard Supabase.

4. Aggiungere una sezione "Smoke test Supabase" al README root: come settare `.env.local` su `apps/web` e curl-are `localhost:3000/api/health`.

## Vincoli

- **Nessuna query su tabelle** dello schema `template`: lo schema sarà creato in Sprint 1, qui non esiste ancora. Usare query che non dipendono da tabelle (`auth.getSession()` è ideale: non richiede tabelle né auth attiva).
- Non creare `getVerifiedTenantClient()`: Sprint 1.
- Non generare tipi TypeScript Supabase: Sprint 1.
- Non toccare `apps/admin/`: lo smoke test gira solo su web. Il client in `@repo/supabase` resta condiviso ma testato solo via web in questo sub-task.
- Non committare un `.env.local` reale (deve restare in `.gitignore`).

## Output atteso

- `packages/supabase/src/client.ts` con factory funzionante
- `apps/web/app/api/health/route.ts` con handler GET
- README root aggiornato con sezione smoke test
- `.env.example` con commenti chiarificatori

## Done when

- Settando `apps/web/.env.local` con credenziali reali, `curl localhost:3000/api/health` ritorna `{ ok: true, supabase: 'reachable' }`
- Senza `.env.local`, il health endpoint ritorna errore 500 chiaro (no crash silenzioso, no schermo bianco)
- `pnpm -r tsc --noEmit` resta pulito
- `pnpm --filter @repo/web build` exit 0

## Note per il master

1. Commit: `feat(supabase): add health endpoint and minimal client factory`
2. Frontmatter → `status: DONE`
3. **Sprint 0 chiuso.** Eseguire manualmente:
   - Deploy preview Vercel per `apps/web` e `apps/admin` (collegare i due progetti al repo, env vars su entrambi)
   - Aggiornare `docs/build-delivery/backlog.md` con i tre criteri Done dello Sprint 0
   - Aprire Sprint 1 (data baseline + RLS)
