---
status: DRAFT
updated: 2026-05-20
area: ai-playbooks
type: prompt
sprint: 1
order: 4
tags: [foras-mvp, sprint1, admin, auth, rls, security]
owner: master-chat
---

# Sprint 1 / 4 of 5 — getVerifiedTenantClient() + auth admin

## Contesto

Il client pubblico anonimo è pronto (sub-task 03). Ora si implementa il **percorso autenticato e verificato** del backoffice: al login, prima di toccare il DB tenant, si verifica che lo schema dell'utente (`user_metadata.schema`) corrisponda a un record di cui è owner in `public.tenants`. È il cuore della sicurezza multi-tenant: un `user_metadata` manomesso non deve dare accesso allo schema sbagliato.

⚠️ Sub-task ad alto rischio: un errore qui è un leak cross-tenant. Implementare esattamente il flusso documentato, niente scorciatoie.

## File da leggere prima di iniziare

- `docs/tech-architecture/architettura-fullstack.md` — sezione "Auth — validazione schema al login" (contiene l'implementazione di riferimento di `getVerifiedTenantClient`) e "Variabili d'ambiente per tenant" (nota su service_role server-only)
- `docs/tech-architecture/data-model.md` — tabella `public.tenants` (schema_name PK, owner_id FK auth.users)
- `packages/supabase/src/client.ts` e `src/index.ts` — factory e tipi esistenti (sub-task 03)
- `apps/admin/` — struttura attuale (scaffold Sprint 0)

## Scope

1. **`apps/admin/lib/auth.ts`** — implementare `getVerifiedTenantClient(session)` seguendo il flusso documentato:
   - Legge `session.user.user_metadata?.schema`
   - Se assente → `signOut()` + throw esplicito
   - Verifica via `supabaseAdmin` (service_role) che esista in `public.tenants` un record `schema_name = schema AND owner_id = session.user.id`
   - Se non trovato → `signOut()` + throw esplicito
   - Solo dopo: ritorna `createClient(URL, ANON_KEY, { db: { schema } })` tipato `Database`
2. **`supabaseAdmin`** — client service_role, definito in un modulo server-only (es. `apps/admin/lib/supabaseAdmin.ts`):
   - Legge `SUPABASE_SERVICE_ROLE_KEY` (NUOVA env, **mai** `NEXT_PUBLIC_`, mai nel bundle client)
   - Usato solo per leggere `public.tenants` (schema `public`)
   - Marcare il file con `import 'server-only'` per impedirne l'import accidentale lato client
3. **`apps/admin/.env.local` e `.env.example`** — aggiungere `SUPABASE_SERVICE_ROLE_KEY=` con commento esplicito "SERVER ONLY — non esporre, non NEXT_PUBLIC".
4. **Wiring**: agganciare la verifica nel `middleware.ts` di `apps/admin` (o nel layout root server-side) così che ogni route protetta passi da `getVerifiedTenantClient` prima di qualsiasi query tenant. Una pagina admin minima protetta basta per dimostrarlo.

## Vincoli

- `SUPABASE_SERVICE_ROLE_KEY` **solo server-side**. Qualsiasi import lato client deve fallire (usare `server-only`).
- Non implementare CRUD admin (menu, prenotazioni, ecc.): è Sprint 5. Qui solo auth + client verificato + una route protetta dimostrativa.
- Riusare la generazione client da `@repo/supabase` dove possibile, ma `supabaseAdmin` resta in `apps/admin` (è specifico del backoffice e usa service_role).
- Niente bypass: la verifica owner su `public.tenants` è obbligatoria prima di restituire il client.
- Tipi: client tenant tipato `Database`, niente `any`.

## Output atteso

- `apps/admin/lib/auth.ts` con `getVerifiedTenantClient()`
- `apps/admin/lib/supabaseAdmin.ts` server-only
- `apps/admin/middleware.ts` (o layout) che protegge almeno una route
- `.env.example` + `apps/admin/.env.local` con `SUPABASE_SERVICE_ROLE_KEY`

## Done when

- Login admin con utente che ha `user_metadata.schema = 'template'` (owner in `public.tenants`) → accesso ok, client sullo schema `template`
- Utente senza `user_metadata.schema` → sessione invalidata (signOut) + errore
- Utente con `schema` non corrispondente a un record owner in `public.tenants` → sessione invalidata
- `SUPABASE_SERVICE_ROLE_KEY` non compare in alcun bundle client (verificare che `supabaseAdmin` non sia importabile lato client)
- `pnpm -r tsc --noEmit` pulito; `pnpm --filter @repo/admin build` exit 0

## Note per il master

1. Prerequisito: l'utente admin del template (creato nel sub-task 01) esiste con `user_metadata.schema = 'template'`.
2. Impostare `SUPABASE_SERVICE_ROLE_KEY` su `apps/admin/.env.local` (locale) e sul progetto Vercel `foras-mvp-admin` (Production + Preview).
3. Commit: `feat(admin): add verified tenant client and schema-validated auth`
4. Frontmatter → `status: DONE`. Procedere al sub-task 05 (test isolamento).
