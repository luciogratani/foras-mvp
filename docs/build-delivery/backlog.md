---
status: DRAFT
updated: 2026-05-19
area: build-delivery
type: backlog
tags: [foras-mvp, build-delivery]
owner: master-chat
---

# Backlog

## Scopo

Backlog esecutivo MVP orientato al freeze del template e all'onboarding del primo cliente reale. 

**Attenzione**

**Questa è una bozza avanzata creata come placeholder, può essere considerata già pronta ma va prima revisionata con attenzione. Prima di iniziare con lo sviluppo del codice eseguire i seguenti due controlli:**

1) Coerenza fra tutti i docs md e ricerca incongruenze
2) Accertarsi che la cartella build-delivery sia completa e sensata


---

## Sprint 0 — Monorepo Setup — ✅ DONE (2026-05-20)

**Goal:** base tecnica funzionante in locale e su Vercel.

Tasks:
- [x] Scaffoldare monorepo pnpm workspaces con struttura `/apps/web`, `/apps/admin`, `/packages/supabase`, `/packages/ui`
- [x] Configurare Next.js App Router su entrambe le app (Next 14.2, porte 3000/3001)
- [x] Collegare Supabase (progetto esistente) — client factory in `@repo/supabase`
- [x] Configurare `.env.example` con le tre variabili tenant
- [x] Configurare TypeScript, ESLint, Prettier condivisi (`tsconfig.base.json`, `strict: true`)
- [ ] Primo deploy preview su Vercel per entrambe le app — *in corso (config manuale master)*

Done when:
- [x] `pnpm --filter web dev` e `pnpm --filter admin dev` girano in locale senza errori
- [ ] Deploy preview funzionante su Vercel — *in setup*
- [x] Connessione a Supabase testata (health endpoint `GET /api/health` su `apps/web`)

**Note di esecuzione:**
- Eseguito in 5 sub-task (`docs/ai-playbooks/prompts/2026-05-20_sprint0_0[1-5]_*.md`).
- Lesson learned: `next dev` riscrive `strict`/`allowJs` nei tsconfig delle app → esplicitati `strict: true` e `allowJs: false` in ogni app Next (vedi `prompts/README.md`).
- Smoke test Supabase fatto via `auth.getSession()` (no dipendenza da tabelle: lo schema `template` nasce in Sprint 1).

---

## Sprint 1 — DB, RLS e tipi TypeScript ✅ CHIUSO (2026-05-21)

**Goal:** schema tenant completo, isolamento verificato, tipi generati.

Tasks (eseguiti come 5 sub-task + 1 follow-up in `docs/ai-playbooks/prompts/2026-05-20_sprint1/`):
- ✅ Eseguito `create_schema_from_template.sql` sullo schema `template` (sub-task 01)
- ✅ Verificate RLS con `audit_rls.sql` (sub-task 01)
- ✅ Generati tipi TypeScript via `postgres-meta` HTTP — bypass CLI Supabase per setup self-hosted (sub-task 02)
- ✅ `createSupabaseClient()` schema-aware tipato `SupabaseClient<Database, SchemaName>` in `@repo/supabase` (sub-task 03)
- ✅ `getVerifiedTenantClient()` + `supabaseAdmin` server-only + middleware `/dashboard` (sub-task 04)
- ✅ Mini-login form admin per chiudere lo scope gap del 04 (sub-task 04b)
- ✅ Suite test isolamento `docs/operations/rls_isolation_tests.sql` con sezioni 1/2a/2b (sub-task 05)

Done when:
- ✅ Tutti i test di isolamento passano
- ✅ Tipi TypeScript generati e importabili nelle app
- ✅ `getVerifiedTenantClient()` implementata e funzionante in `/apps/admin`

**Scoperte e decisioni durante l'esecuzione** (vedi `decision-log/decisioni.md`):
- Generazione tipi via `postgres-meta` HTTP (no CLI Supabase, no Docker locale)
- GRANT espliciti aggiunti a `create_schema_from_template.sql` §3b — RLS senza GRANT non sono raggiungibili
- `SUPABASE_SERVICE_ROLE_KEY` su Vercel admin per MVP; trigger di migrazione a Edge Function tracciato in `post-mvp.md`
- Hardening RLS scrittura (owner-scope vs `auth.uid() IS NOT NULL`): trigger = secondo tenant o freeze template

**Debito tecnico aperto:**
- `audit_rls.sql` non controlla i GRANT — va esteso prima del secondo tenant o del freeze del template

---

## Sprint 2 — Service layer in `@repo/supabase` ✅ CHIUSO (2026-05-21)

**Goal:** service layer riusabile in `packages/supabase/src/services/` consumato da homepage pubblica (Sprint 3) e backoffice (Sprint 5). Nessuna query DB nei componenti UI.

**Allineamento docs (2026-05-21):** il backlog precedente fondeva "Sprint 2 = Homepage" e "Sprint 3 = Menu", mentre `roadmap-sviluppo.md` (Fase 2) e `runbook-implementazione.md` (Phase 2) trattano il service layer come uno sprint distinto. Riallineato in apertura.

Eseguito come 3 sub-task sequenziali in `docs/ai-playbooks/prompts/2026-05-21_sprint2/`:
- ✅ 01 [[2026-05-21_sprint2_01_site-service]] (commit `b8877b3`) — `getSiteSettings`, `getActiveNews` su `template.site_settings` / `template.news_slides` (read-only, client anon)
- ✅ 02 [[2026-05-21_sprint2_02_menu-service]] (commit `aadc338`) — `getMenuSections`, `getMenuBySection`, `getAllergens` + tipo composito `MenuCategoryWithItems`. `getMenuBySection` implementato con 2 query separate (categorie + item via `in(category_id, ids)`) per preservare categorie con `items: []` — `!inner` avrebbe escluso categorie vuote.
- ✅ 03 [[2026-05-21_sprint2_03_bookings-service]] (commit `15c5978`) — `getAvailableTimeSlots`, `createBooking`, `cancelBookingByToken` + Zod schemas in `packages/supabase/src/schemas/` + `OverbookingError`, `DuplicateBookingError`. `zod` aggiunto come `dependencies` di `@repo/supabase`.

**Decisioni architetturali Sprint 2** (vedi `decision-log/decisioni.md`):
- *Service layer — funzioni ricevono il client come parametro* — firma uniforme `(client: TenantClient, ...args)`; il consumer inietta le credenziali
- *`bookings` lato pubblico — service_role server-side, no RPC* — niente cambio dello schema baseline; Sprint 4 (form prenotazioni) introdurrà `apps/web/lib/supabaseAdmin.ts` server-only per `getAvailableTimeSlots`/`cancelBookingByToken`
- Zod schemas in directory dedicata `schemas/` (non co-located in `services/*.ts`) — evita di trascinare `@supabase/supabase-js` nei bundle dei form Sprint 4
- `zod` aggiunto come `dependencies` (runtime) di `@repo/supabase` nel sub-task 03

Done when:
- ✅ I service sono tipati end-to-end (`Tables<{ schema: 'template' }, ...>`, niente `any`)
- ✅ `pnpm -r tsc --noEmit` exit 0
- ✅ Nessuna query DB diretta fuori da `@repo/supabase`
- ✅ `createBooking` rifiuta `gdpr_consent: false` via Zod e mappa il `23505` di Postgres a `DuplicateBookingError`
- ✅ `cancelBookingByToken` mai throw per token non valido (ritorna `{ cancelled: false }`)

**Prerequisito Sprint 3/4 emergente:** apps/web dovrà introdurre `lib/supabaseAdmin.ts` server-only + env `SUPABASE_SERVICE_ROLE_KEY` su Vercel (pattern già rodato in `apps/admin`). Prerequisito per consumare `getAvailableTimeSlots` e `cancelBookingByToken` lato pubblico.

---

## Sprint 2.5 — Stack upgrade framework (Next 16 + React 19 + @supabase/ssr 0.10) — milestone infrastrutturale ✅ DONE (2026-05-21)

**Goal:** portare il monorepo allo stack corrente *prima* di costruire la prima UI vera. Non è una feature: è un prerequisito di Sprint 3 emerso aprendo la scelta Tailwind.

**Perché ora:** la codebase è al minimo storico (`apps/web` stub, `apps/admin` minimale, `packages/ui` vuoto, **nessun cliente ha forkato il template**) → costo di migrazione minimo. Rimandare a pre-freeze (Sprint 6) significherebbe migrare anche tutta la homepage + admin CRUD. Inoltre Tailwind 4 è comunque obbligato (gli strumenti `latest` la assumono) e TW4 su React 18 è meno battuto di TW4 su React 19 → un solo giro di migrazione. Decisione, rationale e blast radius: `decision-log/decisioni.md` voce *2026-05-21 — Upgrade stack major*.

Eseguito come milestone dedicata (1 prompt) in `docs/ai-playbooks/prompts/2026-05-21_stack-upgrade/`:
- [[2026-05-21_stack-upgrade_01_framework]] — Next 14.2→16, React 18.3→19, `@supabase/ssr` 0.5→0.10, `supabase-js`, `eslint-config-next`, toolchain. **Tailwind 4 NON qui** (è Sprint 3 / 01, col setup shadcn).

Tasks:
- Bump versioni coerente su tutto il monorepo (React **unica** versione, `pnpm.overrides` se serve)
- Codemod ufficiali Next + React; fix async request APIs (`cookies()`/`headers()`/`params`); migrazione cookie pattern `@supabase/ssr` 0.5→0.10
- Verifica caching defaults (Next 15+ non cache-by-default su `fetch`/`GET` route handler)

Done when:
- `pnpm -r tsc --noEmit` + build `web`/`admin` verdi; `pnpm why react` → una sola versione
- **GATE di sicurezza auth admin** (codice Sprint 1): login + sessione + route protetta + `getVerifiedTenantClient` + `supabaseAdmin` server-only — tutti verdi
- `apps/web` stub e `/api/health` funzionanti sul nuovo stack

**Esito (2026-05-21):** eseguito sul branch `chore/stack-upgrade` (commit `6e9a227`), mergiato su `main` con `--no-ff` (`cb9e2dd`). Highlights: `middleware.ts` → `proxy.ts` via codemod ufficiale (Next 16 deprecava middleware; runtime `nodejs`); cookie pattern `getAll/setAll` per `@supabase/ssr` 0.10 + `await cookies()`; `next lint` rimosso → flat config `eslint.config.mjs` (eslint 9 + typescript-eslint 8, 3 regole custom preservate); `pnpm.overrides` su `@supabase/supabase-js@2.106.1` (versione unica); `TenantClient`/`createSupabaseClient` allineati ai generici a 3 parametri di supabase-js 2.106 (micro-fix, nessun refactor dei service). Verifiche verdi: tsc, build web+admin (Turbopack), lint, `pnpm why react` → solo 19.2.6. **Gate di sicurezza §5: tutti e 5 verdi** (login/sessione/owner verificati in browser dal master). Review del diff: nessun red flag.

**Follow-up di sicurezza aperto** (non risolto in 2.5, fuori scope "solo framework"): in `apps/admin/app/dashboard/page.tsx` l'identità è letta con `getSession()` (dati dai cookie, non verificati contro l'Auth server) e passata a `getVerifiedTenantClient(session)` → supabase-js emette un advisory. **Non è una regressione** (pattern pre-esistente) ed è **mitigato** da `proxy.ts`, che autentica con `getUser()` prima che `/dashboard` renderizzi (un cookie forgiato fallisce lì). Hardening corretto: usare `getUser()` per l'identità in `dashboard/page.tsx` e cambiare la firma di `getVerifiedTenantClient` a `(user, accessToken)` — modifica al security helper chiuso in Sprint 1, da fare come **sub-task dedicato con commit/review propri**. **Trigger:** prima/durante Sprint 5 (admin panel tocca dashboard e auth), o prima se possibile dato che è codice di sicurezza.

**Caveat:** Next 16 / React 19 sono successivi al knowledge cutoff dell'assistente (gen 2026) → il prompt richiedeva di seguire le **upgrade guide ufficiali correnti** + codemod, non istruzioni a memoria. **Trigger di rollback** (→ TW4 su Next 14.2/React 18) se l'auth admin non avesse superato il gate: non innescato.

---

## Sprint 3 — Homepage pubblica SSR (con menu) ✓ DONE

**Goal:** homepage SSR headless funzionante sullo schema `template`, completa di sezione menu — primo consumer reale del service layer.

Tasks:
- `app/page.tsx`: fetch server-side di `getSiteSettings()` e `getActiveNews()` da `@repo/supabase`
- Componenti headless: Hero, Slogan, Bio, OpeningHours, Footer, Galleria, NewsPopup, NewsSection, Menu (tab per `getMenuSections`, contenuto da `getMenuBySection`)
- Skeleton screens per contenuti secondari (Galleria, NewsPopup, NewsSection)
- Popup/sheet allergeni per item (consuma `getAllergens` + `menu_items.allergen_ids`)
- `error.tsx` e `loading.tsx`
- Meta tag dinamici in `app/layout.tsx` da `site_settings`

Done when:
- Homepage carica con SSR e mostra dati dallo schema `template`
- Nessun flash di layout shift sui contenuti above the fold
- Meta tag corretti nel `<head>`
- Menu navigabile per sezione con allergeni visibili in popup
- Item e categorie disabilitate non visibili (filtro applicato già nel service)
- Nessuna query DB dentro i componenti — tutto via service layer

**Esecuzione (3 sub-task sequenziali in `docs/ai-playbooks/prompts/2026-05-21_sprint3/`, sul nuovo stack post-2.5):**
- [[2026-05-21_sprint3_01_ui-baseline]] — Tailwind 4 (CSS-first) + shadcn in `@repo/ui` + `<Skeleton>`. Nessun componente applicativo.
- [[2026-05-21_sprint3_02_homepage-ssr]] — `generateMetadata` da `site_settings`, `page.tsx` SSR, componenti Server (Hero/Slogan/Bio/OpeningHours/NewsSection/Footer), `error.tsx` + `loading.tsx`.
- [[2026-05-21_sprint3_03_menu-news-popup-gallery]] — `MenuClient` (tabs + dialog allergeni, `'use client'`), `NewsPopup` (auto-open + `sessionStorage`), `Gallery` (skeleton placeholder). Estende `page.tsx` con i fetch menu.

**Decisioni master Sprint 3:** (a) 3 sub-task (baseline UI / SSR statico / interattività client) per isolare setup e idratazione; (b) SSR completo del menu, tabs come pura UI state (no lazy fetch) — SEO-first; (c) skeleton **solo** per Galleria (Storage non popolato), non per News che è SSR-ready — risolta una contraddizione del backlog originale; (d) componenti applicativi in `apps/web/app/_components/`, primitives shadcn in `@repo/ui`.

---

## Sprint 4 — Form prenotazioni ✅ CHIUSO (2026-05-21)

**Goal:** un visitatore prenota un tavolo; il write-path è completo end-to-end (privileged client + form + cancel route + hardening auth admin). Email di conferma/notifica demandata a follow-up (vedi nota sotto).

**Nota — Email Resend: demandata a follow-up.** Decisione 2026-05-21: il canale email richiede scelte ancora aperte (dominio generico vs per-cliente, email vs SMS, Edge Function vs Server Action + Resend SDK). Il write-path funziona senza email — `cancellation_token` è mostrato nella success page come link diretto. Tracciato in `decision-log/decisioni.md`.

Tasks (3 sub-task sequenziali in `docs/ai-playbooks/prompts/2026-05-21_sprint4/`):
- ✅ 01 [[2026-05-21_sprint4_01_auth-hardening]] (commit `94e00c6`) — `dashboard/page.tsx` usa `getUser()` per l'identità; firma `getVerifiedTenantClient(user, accessToken)`. Chiude follow-up sicurezza Sprint 2.5.
- ✅ 02 [[2026-05-21_sprint4_02_supabase-admin-web-cancel-route]] (commit `94e00c6`) — `apps/web/lib/supabaseAdmin.ts` server-only (TenantClient privilegiato) + `SUPABASE_SERVICE_ROLE_KEY` env + rotta `/booking/cancel/[token]`
- ✅ 03 [[2026-05-21_sprint4_03_form-prenotazione]] (commit `94e00c6`) — `BookingPage` (Server Component, slot fetch), `BookingForm` ('use client', useActionState React 19), `createBookingAction` (Zod + OverbookingError/DuplicateBookingError mapping)

Done when:
- ✅ `getVerifiedTenantClient` usa `(user, accessToken)` — identità da `getUser()` verificata
- ✅ `apps/web/lib/supabaseAdmin.ts` esiste, inizia con `import 'server-only'`, tipato `TenantClient`
- ✅ `/booking` mostra form con slot disponibili per la data selezionata
- ✅ Prenotazione persistita su DB con `cancellation_token`; unique constraint `(email, time_slot_id, date)` gestito con messaggio utente (`DuplicateBookingError`)
- ✅ `/booking/cancel/[token]` funzionante: token UUID invalido → errore, token valido → cancellazione, token riusato → "già utilizzato"
- ✅ GDPR non spuntato → errore client; `z.literal(true)` blocca server-side
- ✅ `SUPABASE_SERVICE_ROLE_KEY` non compare in bundle browser né in file committati
- ⏳ Email conferma/notifica — follow-up (pending decisioni dominio + canale)

**Test manuali (2026-05-21):** tutti i round-trip sotto il secondo, console Next.js pulita, nessun 4xx/5xx.

**Gotcha intercettato durante i test:** `SUPABASE_SERVICE_ROLE_KEY` troncata a 117/180 caratteri in `apps/web/.env.local` per copia-incolla incompleta → `Unauthorized` da Supabase. Risolto ricollando la chiave completa. **Checklist per Vercel:** verificare che la chiave sia integra dopo il paste (180 caratteri esatti per le chiavi JWT Supabase).

---

## Sprint 5 — Admin panel

**Goal:** il gestore gestisce tutti i contenuti del proprio sito dal backoffice.

Tasks:
- Layout admin con navigazione (autenticazione con `getVerifiedTenantClient()`)
- CRUD menu: sezioni (abilita/disabilita, rinomina), categorie, item, allergeni
- Drag-and-drop per ordinamento con bulk update `position`
- CRUD popup/novità (ordinamento slide)
- Gestione orari di apertura (form con 7 giorni, toggle chiuso/aperto)
- Impostazioni sito: SEO (title, description, og:image), testi homepage (slogan, bio, indirizzo)
- Vista prenotazioni: lista per data/turno, filtrabile

Done when:
- Tutte le sezioni CRUD funzionanti
- Modifiche visibili sulla homepage pubblica senza rebuild
- Nessuna query DB diretta nei componenti UI (solo tramite service layer)

---

## Sprint 6 — Template freeze + onboarding primo cliente

**Goal:** template congelato, primo cliente reale onboardato.

Tasks:
- Eseguire checklist di pulizia pre-freeze (vedi [[mvp]])
- Finalizzare `schema.sql` e `migrations/001_init.sql`
- Finalizzare e testare `create_schema_from_template.sql`
- Onboarding primo cliente: creare schema, utente admin, deploy su dominio custom
- Pagina `/privacy` personalizzata per il cliente
- Checklist pre-deploy GDPR completata

Done when:
- Tutti e tre i criteri di freeze soddisfatti
- Primo cliente in produzione su dominio custom
- Audit RLS pulito sul nuovo schema cliente

---

## Sprint 7 — UI custom primo cliente

**Goal:** homepage visivamente personalizzata per il primo cliente.

Tasks:
- Design e implementazione UI custom su `/apps/web` del repo cliente
- Upload asset (hero, galleria) su bucket Storage nel path `/{schema}/`
- Test end-to-end su dominio custom del cliente
- Raccolta feedback

Done when:
- Il cliente approva la homepage
- Nessuna regressione sul flusso prenotazioni

---

## MVP Release Checklist

- [ ] Schema tenant creato e RLS verificata
- [ ] Admin login funzionante con validazione schema
- [ ] Homepage pubblica SSR con meta tag corretti
- [ ] Menu navigabile con allergeni
- [ ] Form prenotazione con controllo coperti
- [ ] Email conferma e notifica gestore consegnate
- [ ] Cancellazione prenotazione via link funzionante
- [ ] Admin panel CRUD completo
- [ ] Primo cliente live su dominio custom
- [ ] Pagina `/privacy` presente
- [ ] GDPR consent attivo nel form
