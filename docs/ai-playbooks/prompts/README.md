---
status: DRAFT
updated: 2026-05-25
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
  2026-05-20_sprint0/            ← Sprint 0 (DONE — monorepo setup)
  2026-05-20_sprint1/            ← Sprint 1 (DONE — DB, RLS, tipi TS)
  2026-05-21_sprint2/            ← Sprint 2 (DONE — service layer)
  2026-05-21_stack-upgrade/      ← Sprint 2.5 (DONE — upgrade Next 16 / React 19)
  2026-05-21_sprint3/            ← Sprint 3 (DONE — homepage SSR)
  2026-05-21_sprint4/            ← Sprint 4 (DONE — form prenotazioni)
  2026-05-21_sprint5/            ← Sprint 5 (DONE — admin panel CRUD)
  2026-05-22_sprint6/            ← Sprint 6 (IN CORSO — freeze posticipato)
  2026-05-22_ux-fix/             ← Intermezzo UX-fix (DONE — fix pre-freeze da audit)
  2026-05-23_admin-ux-fix/       ← Intermezzo Admin-fix (DONE — UX backoffice + schema pre-freeze)
  2026-05-24_admin-ux2/          ← Intermezzo Admin-UX-2 (DONE — migliorie backoffice)
  2026-05-24_web-ux-funnel/      ← Intermezzo Web-UX-funnel (DONE — funnel prenotazione web)
  2026-05-24_menu-refactor/      ← Intermezzo Menu-refactor (DONE — /dashboard/menu accordion + CRUD sezioni)
  2026-05-25_booking-orario-libero/ ← Intermezzo Booking-orario-libero (DONE — finestra turno + orario libero)
```

> Gli **intermezzi** sono lavori schema-affecting o UX inseriti fuori sprint (tutti CHIUSI al 2026-05-25). Il dettaglio per-sub-task con commit e esiti smoke è in `docs/build-delivery/backlog.md`; le decisioni in `docs/decision-log/decisioni.md`. Lo Sprint 6 (freeze + onboarding) resta l'unico aperto.

I wikilink Obsidian risolvono per nome file, quindi funzionano anche tra sottocartelle. Da Sprint 4 in poi i file usano il naming corto `NN_descrizione.md` dentro la cartella dello sprint.

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

## Sprint 2.5 — set di prompt

Milestone **infrastrutturale** (non una feature): upgrade major dello stack *prima* della prima UI vera. Emersa aprendo Sprint 3 sulla scelta Tailwind. 1 sub-task in `2026-05-21_stack-upgrade/`. Decisione e rationale: decision-log voce *2026-05-21 — Upgrade stack major*.

1. [[2026-05-21_stack-upgrade_01_framework]] — Next 14.2→16, React 18.3→19, `@supabase/ssr` 0.5→0.10, `supabase-js`, toolchain. Tailwind 4 **escluso** (è Sprint 3 / 01, col setup shadcn). ⚠️ **Gate di sicurezza sull'auth admin** (codice chiuso in Sprint 1): login + middleware + `getVerifiedTenantClient` + `supabaseAdmin` server-only.

**Step manuali del master:** review del diff sul branch `chore/stack-upgrade` prima del merge (tocca codice di sicurezza); test login admin in locale (utente `template` già in Auth da Sprint 1). Nessun nuovo step infra.

**Decisioni master prese per Sprint 2.5:** (a) **upgrade completo** (non TW4-only su stack vecchio) — un solo giro di migrazione mentre la codebase è minimale; (b) **milestone separata** da Sprint 3 per isolare il gate di sicurezza e tenere Sprint 3 = homepage; (c) **Tailwind 4 installato in Sprint 3 / 01** (dove serve), non nella milestone framework; (d) per le versioni successive al cutoff dell'assistente, il prompt impone di seguire le **upgrade guide ufficiali correnti + codemod**.

## Sprint 3 — set di prompt

Homepage pubblica SSR (primo consumer reale del service layer). Gira sul nuovo stack (Next 16 + React 19 + TW4). 3 sub-task in `2026-05-21_sprint3/`. Esecuzione **sequenziale** (01 baseline UI → 02 SSR statico → 03 interattività client; 02 e 03 dipendono dalle primitives del 01, il 03 estende il `page.tsx` del 02):

1. [[2026-05-21_sprint3_01_ui-baseline]] — Tailwind 4 (CSS-first: `@theme`, `@source`, `@tailwindcss/postcss`, `tw-animate-css`) + shadcn in `@repo/ui` + `<Skeleton>`. Nessun componente applicativo.
2. [[2026-05-21_sprint3_02_homepage-ssr]] — `generateMetadata` da `site_settings`, `page.tsx` SSR, 6 componenti Server (Hero/Slogan/Bio/OpeningHours/NewsSection/Footer), `error.tsx` + `loading.tsx`.
3. [[2026-05-21_sprint3_03_menu-news-popup-gallery]] — `MenuClient` (shadcn Tabs + Dialog allergeni, `'use client'`), `NewsPopup` (auto-open + `sessionStorage`), `Gallery` (skeleton placeholder). Estende `page.tsx` con i fetch menu.

**Step manuali del master:** seed opzionali nel SQL editor per gli smoke test (categoria+item con `allergen_ids` per il popup del 03; `bio`/`slogan`/`address` per le sezioni opzionali del 02; una `news_slide` attiva per il popup del 03). Cleanup a fine test.

**Decisioni master prese per Sprint 3:** (a) **3 sub-task** (baseline UI / SSR statico / interattività) per isolare setup e idratazione client; (b) **SSR completo del menu**, tabs come pura UI state (no lazy fetch) — SEO-first; (c) **skeleton solo per Galleria** (Storage non popolato), non per News che è SSR-ready — risolta una contraddizione del backlog originale; (d) componenti applicativi in `apps/web/app/_components/`, primitives shadcn condivise in `@repo/ui`.

## Sprint 4 — set di prompt

Form prenotazioni: write-path completo end-to-end (client privilegiato + form + cancel route + hardening auth admin). 3 sub-task in `2026-05-21_sprint4/`, tutti DONE (commit `94e00c6`).

1. `01_auth-hardening` — `getVerifiedTenantClient(user, accessToken)` (firma cambiata da `(session)`); `dashboard/page.tsx` usa `getUser()` per l'identità verificata. Chiude il follow-up sicurezza di Sprint 2.5.
2. `02_supabase-admin-web-cancel-route` — `apps/web/lib/supabaseAdmin.ts` server-only (`TenantClient` privilegiato, distinto da quello di `apps/admin`) + rotta `/booking/cancel/[token]`.
3. `03_form-prenotazione` — `BookingPage` (Server Component) + `BookingForm` (`useActionState`) + `createBookingAction` (Zod + mapping `OverbookingError`/`DuplicateBookingError`).

**Decisione master:** email Resend **demandata a follow-up** (poi ridefinita in Sprint 6 come Edge Function centralizzata) — il write-path è completo senza, il `cancellation_token` è mostrato in success page.

## Sprint 5 — set di prompt

Admin panel CRUD (il più ampio del progetto). **Slice verticali** (ogni sub-task = una sezione CRUD service+UI demoabile). 6 sub-task (02 splittato in 02a/02b) in `2026-05-21_sprint5/`, tutti DONE (ultimo commit `b22a8bd`).

1. `01_admin-ui-baseline-shell` — TW4 + shadcn in `apps/admin`, shell `/dashboard/*`, helper `requireTenantClient()`.
2. `02a_menu-sezioni-categorie` / `02b_menu-item-allergeni` — CRUD menu (service admin-read non filtrato + write).
3. `03_menu-drag-drop` — `@dnd-kit` a 3 livelli + bulk-update `position`.
4. `04_news-slides-crud-dnd` — CRUD novità.
5. `05_orari-time-slots-site-settings` (+ `05b_booking-closed-day-guard`) — orari apertura + coperti + impostazioni sito; guard booking (date passate/giorni chiusi/finestra oraria).
6. `06_prenotazioni-admin` — vista prenotazioni filtrabile + cancel admin.

**Decisioni master:** slice verticali (non orizzontale); drag&drop come sub-task dedicato; immagini via URL testuale (Storage resta Sprint 7); nessuna modifica DB.

## Intermezzo UX-fix — set di prompt (2026-05-22)

Fix pre-freeze da audit esterno (`docs/audit/03_fit-modello-dati-realta-bar.md`). Tre task schema-affecting inseriti fuori sprint perché devono precedere il freeze. Cartella `2026-05-22_ux-fix/`. Esecuzione sequenziale suggerita: C1 → C3 → C2.

1. [[C1_orari-spezzati]] — `opening_hours` JSONB da singola fascia ad array di fasce (max 2/giorno). Schemi Zod + filtro `getAvailableTimeSlots` + form admin + rendering homepage. 1 migrazione SQL dati + 6 file.
2. [[C3_capienza-orario-libero]] — Label esplicita `max_covers` nell'admin + campo `preferred_time` opzionale in `bookings` (form pubblico + colonna lista admin). 1 ALTER TABLE + 6 file.
3. [[C2_date-chiusura]] — Nuova tabella `closed_dates` + guard in `getAvailableTimeSlots` + sezione "Chiusure straordinarie" in `/dashboard/orari`. 1 nuova tabella + 7 file.

**Trigger di rientro nel freeze (Sprint 6):** tutti e 3 i task chiusi, `tsc -r` + build verdi, smoke test Lucio OK.

## Sprint 6 — set di prompt

Template freeze + onboarding primo cliente. **Operativo, non di sviluppo.** Cartella `2026-05-22_sprint6/`.

> **Strategia (2026-05-25): freeze SBLOCCATO lato scope.** I tre candidati schema-affecting pre-freeze sono chiusi (orari spezzati, DnD menu, orario libero); la capienza tavoli+coperti è rimandata a post-onboarding (decision-log 2026-05-25). Lo Stream A non è più trattenuto da lavoro schema-affecting. Dettaglio: `backlog.md` § Sprint 6 + decisioni 2026-05-22/2026-05-25 nel `decision-log/decisioni.md`.

**Stream A (freeze) — tutti i prompt scritti (DRAFT), in ordine di esecuzione A1 → A1b → A2 → A3 → A4:**
- `A1_rls-hardening` (DRAFT, **revisionato 2026-05-25**) — hardening RLS scrittura (`is_tenant_owner()` `SECURITY DEFINER` + **10** policy, `closed_dates_admin_all` inclusa + applicazione al `template`) + estensione `audit_rls.sql` ai GRANT. Pronto per la prossima chat master.
- `A1b_timezone` (DRAFT) — fix correttezza UTC→`Europe/Rome` (opzione B raccomandata, no schema; opzione A per-tenant in addendum). **Decisione A/B aperta.**
- `A2_parametrize-onboarding-script` (DRAFT) — parametrizza `create_schema_from_template.sql` + test su schema usa-e-getta. **Decisione meccanismo aperta** (psql -v vs funzione dinamica). Dipende da A1/A1b.
- `A3_template-cleanup` (DRAFT) — runbook operativo (master, non delegabile): pulizia dati di test sul `template` pre-dump.
- `A4_freeze-schema-and-lock` (DRAFT) — genera `schema.sql`/`migrations/001_init.sql`, test su schema usa-e-getta, marca tutto LOCKED.

**Stream B (email):**
- `B2_send-booking-email-dormant` (DONE, commit `ada289c`) — Edge Function `send-booking-email` (Resend) + wiring `apps/web`, **costruita dormiente** (default OFF, no-op, mai blocca una prenotazione). B1 (dominio `foras.*`) differito.

## Ordine di esecuzione

Esecuzione sequenziale, un sub-task per volta. Dopo ogni sub-task: commit + aggiornamento [[backlog]] (push solo su richiesta esplicita di Lucio). **Sprint 2.5 va eseguito e mergiato prima di aprire Sprint 3 / 01** (la UI si costruisce sul nuovo stack).

---

## Lesson learned (vincoli permanenti per scaffolding Next.js)

Da rispettare in **ogni** prompt che scaffolda un'app Next.js (`apps/web`, `apps/admin`, future app):

- Nel `tsconfig.json` locale dell'app, **dichiarare esplicitamente** `"strict": true` e `"allowJs": false` dentro `compilerOptions`, anche se già presenti nel `tsconfig.base.json` ereditato via `extends`. Motivo: `next dev` esegue `writeConfigurationDefaults` al primo avvio e, se non vede `strict` esplicito nel file locale, lo considera "non impostato" e lo tratta come `false` (avviso "Strict-mode is set to false by default"); inoltre aggiunge `allowJs: true` come suggested. Esplicitare le due chiavi blocca entrambi gli override.
- `esModuleInterop: true` lasciarlo esplicito (Next lo forza comunque come "mandatory" per SWC, ma metterlo evita warning).
