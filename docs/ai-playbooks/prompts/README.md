---
status: DRAFT
updated: 2026-05-21
area: ai-playbooks
type: index
tags: [foras-mvp, ai-playbooks, prompts]
owner: master-chat
---

# Prompts — archivio sessioni sub-chat

Questa cartella contiene i prompt scritti dal master per le sub-chat, secondo le regole di [[workflow-master-sub]].

## Organizzazione cartelle

I prompt sono raggruppati per sprint in sottocartelle:

```
prompts/
  2026-05-20_sprint0/   ← Sprint 0 (DONE)
  2026-05-20_sprint1/   ← Sprint 1 (DONE)
  2026-05-21_sprint2/   ← Sprint 2 (DONE — service layer)
```

I wikilink Obsidian risolvono per nome file, quindi funzionano anche tra sottocartelle.

## Convenzione naming

```
YYYY-MM-DD_[fase]_[descrizione-breve].md
```

## Stato

Ogni file di prompt ha nel frontmatter:

- `status: DRAFT` → scritto, non ancora eseguito
- `status: IN_PROGRESS` → in esecuzione su una sub-chat
- `status: DONE` → eseguito e mergiato in repo

I prompt non vanno mai eliminati: restano come traccia delle sessioni.

## Sprint 0 — set di prompt

Lo Sprint 0 è suddiviso in 5 sub-task per limitare il consumo token di ogni sub-chat e isolare i fallimenti:

1. [[2026-05-20_sprint0_01_monorepo-root]] — Root del monorepo (pnpm workspaces, tsconfig base, ESLint, Prettier, .env.example, README repo)
2. [[2026-05-20_sprint0_02_apps-web]] — Scaffold `/apps/web` con Next.js App Router su porta 3000
3. [[2026-05-20_sprint0_03_apps-admin]] — Scaffold `/apps/admin` con Next.js App Router su porta 3001
4. [[2026-05-20_sprint0_04_packages]] — `/packages/supabase` (client condiviso) e `/packages/ui` (placeholder shadcn)
5. [[2026-05-20_sprint0_05_supabase-smoke]] — Connessione Supabase e smoke test query

Il task **"deploy preview Vercel"** del backlog Sprint 0 resta a carico del master e si esegue manualmente al termine dei 5 sub-task — non viene delegato a sub-chat.

## Sprint 1 — set di prompt

DB online, isolamento verificato, tipi generati. 5 sub-task. Esecuzione **sequenziale** (ci sono dipendenze forti: i tipi richiedono lo schema applicato, i client richiedono i tipi):

1. [[2026-05-20_sprint1_01_audit-rls-and-db-baseline]] — Finalizza `audit_rls.sql` + applica `create_schema_from_template.sql` sullo schema `template`
2. [[2026-05-20_sprint1_02_typescript-types]] — Genera i tipi TS via `postgres-meta` HTTP (`curl` + tunnel SSH → `packages/supabase/src/types/database.ts`)
3. [[2026-05-20_sprint1_03_public-supabase-client]] — Client anonimo condiviso schema-aware in `@repo/supabase`
4. [[2026-05-20_sprint1_04_admin-verified-client]] — `getVerifiedTenantClient()` + auth admin schema-validata (⚠️ alto rischio: leak cross-tenant)
4b. [[2026-05-20_sprint1_04b_admin-login-form]] — Mini-login form per chiudere lo scope gap del 04 (senza form la sessione non è creabile via browser)
5. [[2026-05-20_sprint1_05_isolation-tests]] — Suite test isolamento e verifica RLS (gate di sicurezza)

**Step manuali del master (NON delegabili a sub-chat):** creazione utente admin `template` in Supabase Auth, esecuzione degli script SQL nel SQL editor come service_role, set di `SUPABASE_SERVICE_ROLE_KEY` (env server-only, mai `NEXT_PUBLIC`), apertura del tunnel SSH verso `supabase-meta` per la generazione tipi (`ssh -N -L 18080:<IP_CONTAINER_META>:8080 foras-vps`) e set opzionale di `SUPABASE_META_URL` (env CLI/dev). Nessun `SUPABASE_PROJECT_ID`/`SUPABASE_ACCESS_TOKEN`: la CLI Supabase non è utilizzata, vedi decision-log.

**Decisioni master prese per Sprint 1:** (a) `audit_rls.sql` viene creato in `docs/operations/` estraendolo dalla bozza in `migration-runbook.md`; (b) si introduce `SUPABASE_SERVICE_ROLE_KEY` come env server-only per `supabaseAdmin`; (c) il client tenant è tipato `Database`, niente `any`.

## Sprint 2 — set di prompt

Service layer in `packages/supabase/src/services/` (+ Zod schemas in `packages/supabase/src/schemas/`). 3 sub-task. Esecuzione **sequenziale** ma debolmente accoppiata (il 03 importa da `src/index.ts`, quindi parte dopo che 01 e 02 hanno popolato gli export — ma i tre file `services/*.ts` non si toccano tra loro):

1. [[2026-05-21_sprint2_01_site-service]] — `getSiteSettings`, `getActiveNews` su `template.site_settings` / `template.news_slides`. Read-only puro, client anon.
2. [[2026-05-21_sprint2_02_menu-service]] — `getMenuSections`, `getMenuBySection`, `getAllergens` con la convenzione di ordinamento condivisa (position asc nulls last, poi name asc). Read-only puro, client anon.
3. [[2026-05-21_sprint2_03_bookings-service]] — `getAvailableTimeSlots`, `createBooking`, `cancelBookingByToken` + Zod schemas in directory dedicata `schemas/` + error class custom (`OverbookingError`, `DuplicateBookingError`). ⚠️ scope più ampio: input validation, mapping errori Postgres `23505`, due funzioni che richiedono client privilegiato server-side (vedi decision-log voce *2026-05-21 — `bookings` lato pubblico — service_role server-side, no RPC*).

**Step manuali del master (NON delegabili a sub-chat):** lo smoke test del sub-task 03 richiede un seed `time_slots` (inserito come service_role nel SQL editor, e cleanup a fine test) + un client istanziato con `SUPABASE_SERVICE_ROLE_KEY` (lo si può fare ad hoc con uno script `tsx` non committato). Le funzioni anon di 01 e 02 sono testabili con `createSupabaseClient()` + `.env.local` di `apps/web`.

**Decisioni master prese per Sprint 2:** (a) **3 sub-task** (site/menu/bookings) per isolare il rischio sul bookings; (b) **firma uniforme** `(client: TenantClient, ...args)` — il client è iniettato dal consumer, mai istanziato nel service (vedi decision-log voce *Service layer — funzioni ricevono il client come parametro*); (c) **Zod in directory `schemas/` dedicata** (non co-located nei service files) per evitare di trascinare `@supabase/supabase-js` nei bundle client dei form Sprint 4; (d) **niente RPC PostgreSQL** per le funzioni che richiedono privilegi su `bookings` — si delega al consumer la scelta del client, sub-task 03 lo documenta.

## Ordine di esecuzione

Esecuzione sequenziale, un sub-task per volta. Dopo ogni sub-task: commit + push + aggiornamento [[backlog]].

---

## Lesson learned (vincoli permanenti per scaffolding Next.js)

Da rispettare in **ogni** prompt che scaffolda un'app Next.js (`apps/web`, `apps/admin`, future app):

- Nel `tsconfig.json` locale dell'app, **dichiarare esplicitamente** `"strict": true` e `"allowJs": false` dentro `compilerOptions`, anche se già presenti nel `tsconfig.base.json` ereditato via `extends`. Motivo: `next dev` esegue `writeConfigurationDefaults` al primo avvio e, se non vede `strict` esplicito nel file locale, lo considera "non impostato" e lo tratta come `false` (avviso "Strict-mode is set to false by default"); inoltre aggiunge `allowJs: true` come suggested. Esplicitare le due chiavi blocca entrambi gli override.
- `esModuleInterop: true` lasciarlo esplicito (Next lo forza comunque come "mandatory" per SWC, ma metterlo evita warning).
