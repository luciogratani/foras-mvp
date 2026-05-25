---
status: DRAFT
updated: 2026-05-22
area: build-delivery
type: backlog
tags: [foras-mvp, build-delivery]
owner: master-chat
---

# Backlog

## Scopo

Backlog esecutivo MVP orientato al freeze del template e all'onboarding del primo cliente reale. 

**Controlli pre-Sprint 6 eseguiti (2026-05-22):**

1) ✅ Coerenza docs md — incongruenze trovate e sanate: email descritta come "consegnata" in roadmap/runbook (in realtà demandata e ridefinita centralizzata, ora in Sprint 6); riferimenti stale a "Supabase CLI" (→ `postgres-meta` HTTP), `apps/admin/middleware.ts` (→ `proxy.ts`), `app/api/bookings/route.ts` (→ Server Action). Resta da chiudere al freeze: `create_schema_from_template.sql` hardcoded `template` (header/onboarding-doc dicono `-v schema=` ma lo script non è parametrizzato) — fix in Sprint 6.
2) ✅ build-delivery completa e coerente (backlog/roadmap/runbook allineati su Fase 0→7); statuses → `LOCKED` da impostare al freeze.


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

## Sprint 5 — Admin panel ✅ CHIUSO (2026-05-22)

**Goal:** il gestore gestisce tutti i contenuti del proprio sito dal backoffice.

**Decisioni master all'apertura** (vedi `decision-log/decisioni.md` voce *2026-05-21 — Sprint 5 (Admin panel)*):
- **Slice verticali**, non orizzontale: ogni sub-task = una sezione CRUD completa (service + UI), demoabile a fine review. Unica fondazione orizzontale: la baseline UI + shell.
- **Drag-and-drop come sub-task dedicato** (dopo il CRUD menu); fallback su/giù se `@dnd-kit` non regge React 19.
- **Immagini via URL testuale** (no Storage): l'upload resta Sprint 7.
- **Nessuna modifica DB**: le RLS di scrittura (`auth.uid() IS NOT NULL`) + GRANT a `authenticated` sono già a posto; il CRUD usa il verified tenant client.

**Stato di partenza rilevato:** `apps/admin` non ha ancora Tailwind/shadcn (parte da zero, a differenza di `apps/web`); il service layer è solo *read* e filtrato `is_active=true` → servono funzioni *admin-read* (non filtrate) + *write* in `@repo/supabase`.

Piano a 6 sub-task verticali in `docs/ai-playbooks/prompts/2026-05-21_sprint5/`:
- ✅ `01` (commit `dd99c70`) baseline UI (TW4 + `@repo/ui` in `apps/admin`) + shell/nav `/dashboard/*` + helper server `requireTenantClient()` + restyle login/dashboard. Nessun CRUD. Review trust-but-verify: `pnpm -r exec tsc --noEmit` + build admin verdi (7 route dinamiche), `globals.css`/`postcss` identici a `apps/web`, browser smoke OK (Lucio).
- `02` CRUD menu — **splittato in 02a/02b** (gerarchia profonda → review più trattabili):
  - ✅ `02a` (commit `d671c9a`) sezioni + categorie: service *admin-read* (non filtrato) + update sezioni (rinomina/toggle — le 6 sezioni sono seed predefiniti, **no create/delete**) + CRUD categorie. UI: shell pagina menu con lista sezioni e categorie. FK `ON DELETE CASCADE`: cancellare una categoria cancella i suoi item (avviso nel dialog di delete). Primitiva `Switch` in `@repo/ui`. Review verde (tsc -r + build admin/web + smoke browser di Lucio: rinomina/toggle sezione propagata al sito pubblico senza rebuild).
  - ✅ `02b` (commit `6958c5d`) item + allergeni: service CRUD item (`getMenuItemsAdmin`, `createMenuItem`, `updateMenuItem`, `deleteMenuItem`, order position NULLS LAST poi name) + Zod `MenuItemCreateSchema`/`MenuItemUpdateSchema` (`z.coerce.number()` per price, empty→null, `allergen_ids` array UUID) + `Textarea`/`Checkbox` in `@repo/ui` (hand-written, zero dipendenze nuove) + UI item sotto le categorie con checkbox dei 14 allergeni seed precheckati in edit + toggle `is_active` per item + 3 dialog Create/Edit/Delete. Propagazione allergeni nel popup `MenuClient` verificata. Review verde (tsc -r + build admin/web + smoke browser di Lucio).
- ✅ `03` (commit `fadd2f0`) drag-and-drop ordinamento: `@dnd-kit/core`+`sortable`+`utilities` in `apps/admin`; service `reorderMenuSections`/`reorderMenuCategories`/`reorderMenuItems` (Promise.all update position 0-based); reorder Server Actions (firma `string[]`, non FormData); `SectionList.tsx` nuovo client wrapper per DndContext sezioni; `SectionCard`+`CategoryRow` estesi con `useSortable`+`GripVertical`+DndContext annidati. Fix React 19: `startTransition` separato da `setState`; `useEffect` per sincronizzare state locale con props dopo revalidatePath; `id={useId()}` su ogni DndContext (fix hydration mismatch aria-describedby). Review verde (tsc -r + build admin/web + smoke browser Lucio: DnD funzionante a tutti e 3 i livelli, ordine persistito, CRUD invariato).
- ✅ `04` (commit `eb237fa`) CRUD novità: `news_slides` (titolo, body, `image_url`, toggle, posizione + DnD). Pattern identico al menu: `NewsSlideAdmin` alias per evitare collisione con `NewsSlide` pubblico nel barrel.
- ✅ `05` (commit `36aba34`) orari apertura (`site_settings.opening_hours` JSON, form 7 giorni con toggle chiuso) + coperti/`time_slots` (label/orario/`max_covers`/attivo, nessun DnD) + impostazioni sito (SEO title/description/`og_image`, testi: slogan/bio/indirizzo/telefono/email). `services/site-admin.ts` separato per non toccare l'invariante `services/site.ts`.
- ✅ `05b` (commit `8739e12`) guard booking: `getAvailableTimeSlots` ritorna `[]` per date passate, giorni chiusi (`opening_hours[day].closed`), e filtra turni fuori dalla finestra `open`/`close` del giorno. Guard data passata aggiunto anche in `createBooking` (server-side). Confronto orario in UTC puro — **post-MVP**: aggiungere `timezone` a `site_settings` (es. `"Europe/Rome"`) per confronto ora locale corretto.
- ✅ `06` (commit `b22a8bd`) vista prenotazioni: lista filtrabile per data/turno + cancellazione lato admin. Due sezioni: confirmed (con dialog cancella) + storico cancelled (sola lettura, muted). Service: `getBookingsAdmin`, `cancelBookingAdmin`. Slot label risolto via lookup in page.tsx. tsc -r exit 0.

Done when:
- Tutte le sezioni CRUD funzionanti
- Modifiche visibili sulla homepage pubblica senza rebuild
- Nessuna query DB diretta nei componenti UI (solo tramite service layer)

---

## Intermezzo UX-fix — Fix pre-freeze (2026-05-22 → CHIUSO 2026-05-23)

**Goal:** correggere tre lacune rilevate dall'audit esterno (`docs/audit/03_fit-modello-dati-realta-bar.md`) prima del freeze del template. Sono modifiche schema-affecting: farle ora costa una migrazione su 1 schema, farle dopo costa una migrazione su ogni schema cliente.

> **Fuori sprint.** Questo intermezzo non era pianificato. È stato introdotto dopo che l'audit esterno ha rilevato che orari e prenotazioni producono informazioni false per la realtà operativa italiana. ~~Il freeze è sospeso finché i 3 task non sono chiusi.~~ I 3 task sono chiusi e i 4 test browser superati (2026-05-23) — l'intermezzo non è più un blocco. (Il freeze resta comunque posticipato per le valutazioni UX, vedi Sprint 6.)

Piano a 3 sub-task in `docs/ai-playbooks/prompts/2026-05-22_ux-fix/`. C1 e C3 sono indipendenti; C2 è indipendente da entrambi. Ordine suggerito: C1 → C3 → C2 (dalla più chirurgica alla più articolata). Esecuzione sequenziale, un sub-task per volta.

- [x] **C1** — Orari spezzati — tsc + build verdi (2026-05-22). ✓ test browser superato (2026-05-23)
- [x] **C3** — `preferred_time` + label `max_covers` — tsc + build verdi (2026-05-22). ✓ test browser superato (2026-05-23)
- [x] **C2** — `closed_dates` — SQL applicato, tsc + build verdi (2026-05-22). ✓ test browser superato (2026-05-23)

**✓ TEST BROWSER SUPERATI (2026-05-23, tutti e 4 verdi):**
1. Admin `/dashboard/orari` → 2 fasce per un giorno → homepage mostra entrambe — ✓
2. Admin `/dashboard/orari` → chiusura straordinaria data odierna → `/booking?date=<oggi>` "Nessun turno disponibile", ripristino dopo rimozione — ✓
3. `/booking` → "Orario preferito" → admin `/dashboard/prenotazioni` mostra il valore — ✓ (pecca nota: `preferred_time` non validato contro turno/orari apertura → tracciato in `product-scope/post-mvp.md`)
4. Admin `/dashboard/orari` → dialog turno → testo esplicativo sotto "Coperti massimi" — ✓

Done when:
- [x] I 3 task sono chiusi e committati
- [x] `pnpm -r exec tsc --noEmit` + build `web` e `admin` verdi
- [x] 4 test browser superati da Lucio (2026-05-23)

---

## Intermezzo Admin-fix — Miglioramenti UX backoffice (2026-05-23 → CHIUSO 2026-05-24)

**Goal:** correggere le lacune operative emerse dalla valutazione UX del backoffice e aggiungere feature schema-affecting prima del freeze. Identificate tramite audit esterno (`docs/audit/02_ux-workflow-admin-gestore.md`) e richieste dirette di Lucio.

> **Fuori sprint.** Lavoro pre-freeze: modifiche schema e UI che farebbero migrazioni costose se fatte dopo il freeze.

Piano a 3 sub-task in `docs/ai-playbooks/prompts/2026-05-23_admin-ux-fix/` + una seconda sessione (2026-05-24):

- [x] **01** — Fix prenotazioni + route cleanup — `fix(admin)` commit `c45f92b` (2026-05-23)
  - Ordinamento per orario turno (non UUID), default data odierna, colonne Telefono/Orario pref./Note, intestazione turno con coperti/capienza, rimossa route morta `/dashboard/novita`
- [x] **02** — Schema esteso — `feat(supabase)` commit `15341eb` (2026-05-23)
  - `site_settings`: +`extra_data` JSONB, +`social_whatsapp/instagram/facebook` TEXT, +`maintenance_mode` BOOLEAN. `closed_dates`: +`end_date` DATE (range multi-day). SQL applicato su schema `template`.
- [x] **03** — UI admin + pagina manutenzione web — `feat(admin)` commit `705d818` (2026-05-23)
  - Impostazioni: social links, toggle manutenzione (pannello evidenziato), editor JSONB `extra_data` con accordion. Orari: chiusure straordinarie multi-day. `apps/web`: pagina `/maintenance` + redirect da layout quando `maintenance_mode=true`.
- [x] **04** — UX audit P0-4 + P1-2 + P1-5 + P2 + archiviazione turni (2026-05-24, non committato separatamente)
  - **Sonner toast** (`sonner@2.0.7`) aggiunto a `@repo/ui`; `<Toaster>` montato in `apps/admin/app/layout.tsx`. Pattern: `startTransition(async () => { await action(); toast.success(...) })` per sopravvivere al `revalidatePath` unmount.
  - **P0-4** — `getBookingCountsBySlot` (`{ total, upcoming }`) nel service; `TimeSlotCard` mostra "N prenotazioni in arrivo"; `DeleteTimeSlotDialog` mostra banner FK-block se `total > 0`, nasconde il pulsante Elimina.
  - **P1-2** — Tutti gli switch (`aria-label/title="Visibile sul sito"`); banner sezione inattiva in `SectionCard`; `CategoryRow` avvisa quando sezione attiva + categoria inattiva.
  - **P1-5** — Toast `"Prenotazione di X cancellata — data / turno"` (6 s) + nota "Il cliente non riceve notifica automatica" in `DeleteBookingDialog`. Fix React key: `<Fragment key={slotId}>` in `BookingList`.
  - **P2-1** — Link "Vedi il sito ↗" in sidebar (da `NEXT_PUBLIC_SITE_URL`).
  - **P2-3** — Hint "Usa il punto per i decimali, es. 8.50" in `CreateItemDialog`/`EditItemDialog`.
  - **Archiviazione turni** — Turni con storico prenotazioni non eliminabili (FK); nuovo pulsante "Archivia" (`setTimeSlotArchived` + `archived_at TIMESTAMPTZ`); `TimeSlotList` collassa archiviati in sezione espandibile "Turni archiviati (N)"; ripristino con toast; eliminazione definitiva solo per turni senza prenotazioni collegate.
  - **Schema**: `time_slots.archived_at TIMESTAMPTZ` aggiunto su `template` (script `docs/operations/migration-2026-05-24-time-slot-archive.sql`); `create_schema_from_template.sql` aggiornato per nuovi tenant.

**✓ SMOKE TEST SUPERATI (2026-05-24):**
1. Social links — ✓
2. Toggle manutenzione — ✓ (fix React 19 `startTransition` commit `dcf5640`)
3. Editor JSONB — ✓
4. Chiusure range — ✓
5. Toast cancellazione prenotazione — ✓
6. P0-4: dialog turno blocco FK + "N prenotazioni in arrivo" — ✓
7. P1-2: switch labels + banner sezione inattiva — ✓
8. Archiviazione turni: archivia/ripristina/sezione collassabile — ✓

**Nota refactor DnD menu:** rimandato a sprint dedicato (stub in `docs/ai-playbooks/prompts/2026-05-23_admin-ux-fix/FUTURO_dnd-menu-refactor.md`).

Done when:
- [x] Sub-task 01/02/03 committati
- [x] Sub-task 04 committato (pending — da fare al termine di questa sessione)
- [x] tsc + build `web` e `admin` verdi
- [x] Tutti i smoke test superati da Lucio (2026-05-24)

---

## Intermezzo Admin-UX-2 — Migliorie UX backoffice (2026-05-24 → CHIUSO 2026-05-24)

**Goal:** migliorare l'esperienza d'uso quotidiana del pannello admin: dashboard operativa, sidebar moderna, fix ambiguità UI, filtri rapidi prenotazioni.

> **Fuori sprint.** Nessuna modifica schema DB. Lavoro interamente UI/service layer.

Piano a 4 sub-task in `docs/ai-playbooks/prompts/2026-05-24_admin-ux2/`:

- [x] **01** — Fix Orari switch ambiguo + reorder nav — commit `adf1cf2` (incluso in 01+02)
  - Switch orari: semantica "Aperto" (checked = giorno aperto), label dinamica
  - Nav sidebar: Prenotazioni seconda voce, Impostazioni ultima
- [x] **02** — Sidebar shadcn completa — commit `adf1cf2` (2026-05-24)
  - `npx shadcn add sidebar` → `@repo/ui`; nuovi primitivi: Sidebar, Separator, Sheet, Tooltip
  - `AppSidebar` client component con `usePathname` per active state, icone Lucide, SidebarRail
  - `logoutAction` estratto in `dashboard/actions.ts`; sidebar CSS vars in `apps/admin/globals.css`
- [x] **03** — Dashboard redesign — commit `e60d4f7` (2026-05-24)
  - `getDashboardStats()` nel service: prenotazioni/coperti oggi + prossimi 7gg + turni attivi
  - `dashboard/page.tsx`: 4 stat card + 3 quick link; rimossa card "da sviluppatore"
- [x] **04** — Prenotazioni filtri rapidi — commit `3dfb9f7` (2026-05-24)
  - Bottoni "Oggi" / "Domani" ancorati a destra, navigazione immediata senza submit
  - Bottone attivo evidenziato con colore primary

**FUTURO (stub documentati, non implementati):**
- `FUTURO_polling-prenotazioni.md` — auto-refresh + Sonner toast + suono notifica
- `FUTURO_dnd-menu-refactor.md` (già esistente, invariato) — refactor gerarchia menu

Done when:
- [x] Sub-task 01/02/03/04 committati
- [x] tsc + build `admin` verdi
- [x] Smoke test da Lucio — 16/16 verdi (2026-05-24)

**Nit UI da smoke test, fixati in `0a5cc7b` (2026-05-24):**
- Sidebar collassata: titolo "Foras Admin" si troncava a "F..." → nascosto in modalità icona (`group-data-[collapsible=icon]:hidden`).
- `/dashboard/orari`: label dello switch ora dinamica `Aperto`/`Chiuso` (prima sempre "Aperto", solo spenta visivamente).

---

## Intermezzo Web-UX-funnel — UX del funnel prenotazione `apps/web` (2026-05-24 → CHIUSO 2026-05-24)

**Goal:** chiudere i rilievi **UI-neutri** dell'audit `docs/audit/01_ux-funnel-prenotazione-web.md` (comportamento, copy, accessibilità, correttezza) sul funnel di prenotazione pubblico, lasciando congelata l'estetica fino al primo onboarding.

> **Fuori sprint.** Trigger: la **UI** di `apps/web` è congelata fino al primo onboarding cliente, ma la **UX** del funnel è azionabile ora (è il percorso che genera valore). Distinzione decisa con Lucio. Triage completo nella sezione "Note del master" dell'audit 01 (secchi A/B/C). Solo il Secchio A entra qui; B è rimandato al consolidamento UI, C è gated sulla decisione email (B2).

Piano a 2 sub-task in `docs/ai-playbooks/prompts/2026-05-24_web-ux-funnel/`:

- [x] **01** — Raggiungibilità funnel + UX form — commit `b483b47` (tsc + build `web` verdi; **smoke browser di Lucio verde 2026-05-24**): link "Prenota" minimale in Hero/Footer (P0.1), `min` data + auto-submit (P1.1/P2.3), errori per-campo + GDPR visibile + ripopolamento valori (P1.4/P0.3-cheap), data leggibile IT (P2.2), messaggi "nessun turno" differenziati cheap (P1.2). Solo `apps/web`, nessuna modifica service. **Estensione minore in-spirit:** aggiunto placeholder "Seleziona un turno" + label "Completo" sui turni pieni (al posto di "0 coperti disponibili") — sfiora P2.7/Secchio B ma copy-only, no redesign; il redesign select→card resta in Secchio B.
- [x] **02** — Annullamento a due passi — commit `1cbe429` (tsc -r + build `web` verdi; **smoke browser di Lucio verde 2026-05-24**): nuova `getBookingByToken` (sola lettura, join `time_slots`) + tipo `BookingSummary` nel service, server action `confirmCancelAction` su POST, riscrittura `cancel/[token]/page.tsx` (GET mostra dettagli, POST cancella) + `CancelConfirm` client component. Chiude P0.2 — bug latente che diventa critico all'attivazione dell'email B2.

**Rimandati (documentati nell'audit):** Secchio B (CTA stilizzato, select→card, trust su `/booking`, galleria skeleton, disponibilità "Disponibile/Completo") → consolidamento UI al primo onboarding. Secchio C (persistenza token, telefono obbligatorio) → con la decisione email B2. Follow-up: P1.2 ricco richiede cambio firma `getAvailableTimeSlots`.

Done when:
- [x] Sub-task 01/02 committati + tsc -r e build `web` verdi
- [x] Smoke test da Lucio — 01 e 02 verdi (2026-05-24)

---

## Intermezzo Menu-refactor — `/dashboard/menu` accordion + hardening (2026-05-24 → CHIUSO 2026-05-25)

**Goal:** rendere la gestione del menu comprensibile e usabile da tablet per un gestore non tecnico, su menu reali (decine di voci). Esegue lo stub `FUTURO_dnd-menu-refactor.md`.

> **Fuori sprint.** Trigger: Lucio ha scelto di affrontare ora il "mostro". Decisione di direzione nel `decision-log/decisioni.md` (voce 2026-05-24 *Refactor /dashboard/menu*): **Strada A** (accordion + hardening sulla pagina unica), **riordino solo a frecce ↑/↓, DnD rimosso dal menu**. Nessuna modifica schema (le colonne `position` esistono già) → compatibile col pre-freeze. Ancorato all'audit `02_ux-workflow-admin-gestore.md` (P1-1, P2-5, P2-6).

Piano a 5 sub-task in `docs/ai-playbooks/prompts/2026-05-24_menu-refactor/`:

- [x] **01** — Service — commit `b8567e0` (subchat Sonnet/medium; tsc -r + build `admin` verdi; smoke leggero pendente): `moveItemToCategory(client, itemId, newCategoryId)` (guard stessa sezione, append in fondo) + i `reorder*Action` ritornano `{ ok: boolean }` (revalidate solo al successo). Nessuna migrazione.
- [x] **02** — Accordion + conteggi — commit `7936db4` (subchat Sonnet/high + fix master nesting DOM; tsc -r + build `admin` verdi; **smoke di Lucio verde 2026-05-25**): sezioni/categorie collassabili (default collassate) con conteggio voci; figli montati solo se espansi; toggle accessibile distinto dal grip DnD.
- [x] **03** — Riordino: hardening — commit `1a12a2c` (subchat Sonnet/high + fix master sensori; tsc -r + build `admin` verdi; **smoke di Lucio verde 2026-05-25**). **DnD mantenuto**: rollback ottimistico su `{ ok:false }` + toast su riordino e toggle (3 livelli); `KeyboardSensor` (a11y) + `TouchSensor` con delay; `PointerSensor`→`MouseSensor` (evita doppia attivazione touch). Niente frecce.
- [x] **04** — "Sposta in categoria" + toast dialog — commit `1312b79` (subchat Sonnet/medium; tsc -r + build `admin` verdi; **smoke di Lucio verde 2026-05-25**): `moveItemToCategoryAction` + selettore "sposta (stessa sezione)" in EditItemDialog (plumbing `sectionCategories`); toast di conferma/errore su tutti i dialog CRUD.
- [x] **05** — Densità mobile/tablet + "Vedi sul sito" — commit `1e935b5` (subchat Sonnet/medium; tsc -r + build `admin` verdi; **smoke di Lucio verde 2026-05-25**): azioni di riga come bottoni-icona (testo da `sm`, `aria-label`) → niente wrapping su mobile; link "Vedi sul sito" nell'header se `NEXT_PUBLIC_SITE_URL` settata. No DropdownMenu/dipendenze nuove.
- [x] **06** — Sezioni a CRUD completo (`sonnet`/high) — commit `ac8981a` (subchat Sonnet/high; tsc -r + build `admin` verdi; **smoke di Lucio verde 2026-05-25**): `createMenuSection` (append in fondo) / `deleteMenuSection` nel service + Zod `MenuSectionCreateSchema`; `createSectionAction`/`deleteSectionAction`; `CreateSectionDialog` (bottone "+ Aggiungi sezione" in fondo a `SectionList`, fuori dal DnD context) + `DeleteSectionDialog` (**conferma cascade** con conteggi reali categorie+voci). Stato vuoto sito pubblico già gestito in `MenuClient` (`sections.length === 0 → null`), invariato. Le 6 sezioni restano il seed di `create_schema_from_template.sql`. Nessuna migrazione (insert/delete + cascade FK già presenti).

> I prompt si scrivono dopo che il sub-task precedente è atterrato (il codice su cui si appoggiano cambia). 06 è indipendente da 03-05 e può essere fatto in qualsiasi momento.

Done when:
- [x] Sub-task 01-06 committati + tsc -r e build `admin` verdi
- [x] Smoke test da Lucio (per sub-task) — tutti verdi 2026-05-25; stato menu-vuoto sito pubblico confermato live (0 sezioni attive → `MenuClient` null, nessun titolo orfano)

---

## Intermezzo Booking-orario-libero — finestra turno + prenotazione a orario custom (2026-05-25 → APERTO)

**Goal:** il cliente può prenotare a un **orario di arrivo libero** dentro la finestra del turno (es. Cena 20:00–23:00), non solo all'orario puntuale del turno. Capacità **per turno invariata**.

> **Pre-freeze, schema-affecting.** Trigger: punto 0 della pianificazione post-Menu-refactor (vedi anche audit `03_fit-modello-dati-realta-bar.md`). Decisione completa + 3 forcelle + gotcha tecnici nel `decision-log/decisioni.md` (voce 2026-05-25 *Prenotazione a orario libero nella finestra del turno*): (A) cap **per turno** invariato, (A) colonna **`time_slots.end_time`** nullable (opt-in per turno), (A) **`preferred_time`** promosso a orario validato. **Una sola colonna**, niente slotting/tabelle nuove → entra nel **baseline congelato**.

Piano a 2 sub-task in `docs/ai-playbooks/prompts/2026-05-25_booking-orario-libero/`:

- [x] **01** — Schema `end_time` + admin "finestra turno" (`sonnet`/medium) — commit `a96483a` (subchat Sonnet/medium; tsc -r + build `admin` verdi; **smoke di Lucio pendente**, richiede l'`ALTER` su `template`): colonna `end_time TIME` nel baseline + `types/database.ts`; Zod `TimeSlot*Schema` con `end_time` opzionale/nullable + `.refine(end_time > time)` (oggetto base + refine su Create **e** Update, per preservare il vincolo dopo `.partial()`); admin orari (Create/Edit dialog campo facoltativo, edit precompila da `slot.end_time`; `TimeSlotCard` mostra `time–end_time` nei due rami). `apps/web`/`bookings` intatti. **Step manuale master:** `ALTER TABLE template.time_slots ADD COLUMN end_time TIME;` prima dello smoke.
- [ ] **02** — Web "prenotazione a orario libero" + enforcement (`sonnet`/high): `getAvailableTimeSlots` ritorna `end_time`; `createBooking` valida `preferred_time` in `[time, end_time)` (obbligatorio quando il turno ha finestra; capacità invariata); `BookingForm` rende `preferred_time` richiesto con `min`/`max` sui turni con finestra, altrimenti resta facoltativo; `actions.ts` mappa l'errore finestra a field error. Dipende da 01 (la colonna deve esistere). Gotcha: confronti `TIME` normalizzati a HH:MM; oltre-mezzanotte fuori scope.

Done when:
- [ ] Sub-task 01-02 committati + tsc -r e build (`admin` per 01, `web` per 02) verdi
- [ ] `end_time` applicata allo schema `template` (step master)
- [ ] Smoke di Lucio: turno con finestra → cliente prenota a orario custom validato; turno senza finestra → comportamento attuale; capacità sempre per-turno

---

## Sprint 6 — Template freeze + onboarding primo cliente

**Goal:** template congelato, primo cliente reale onboardato.

> **Strategia aggiornata (2026-05-22):** il **freeze è posticipato**. Prima si fanno smoke test approfonditi + valutazione UX di `apps/web` e `apps/admin`; è probabile che ne emergano mini-implementazioni comode (vedi appunti privati di Lucio) **schema-affecting** — es. orari di apertura spezzati e orario di prenotazione custom — che vanno fatte *prima* del freeze per non trasformarle in migrazioni post-freeze su ogni schema cliente. Conseguenze: **A1 (RLS hardening) è parcheggiato** col freeze (trigger "2° tenant o freeze", nessuno imminente — prompt già scritto e pronto). L'unico lavoro che procede ora è lo Stream B (email), perché tenant-agnostico e a prova di futuro — e viene costruito **dormiente** (vedi B2). Ordine A2/A3/A4 invariato ma differito a dopo le decisioni UX.

**Decisioni master all'apertura** (2026-05-22, dettaglio nel `decision-log/decisioni.md`):
- **RLS hardening scrittura** → owner verificato contro `public.tenants` via funzione `public.is_tenant_owner()` `SECURITY DEFINER` (chiude il debito 2026-05-20). Entra nel baseline congelato + applicata al `template`.
- **Progetto Supabase** → ri-confermato condiviso (il vettore cross-tenant lo chiude l'hardening RLS).
- **Email** → Edge Function centralizzata `send-booking-email` + dominio di servizio unico `foras.*` (no DNS per-cliente; `RESEND_API_KEY` fuori da ogni Vercel). Costruita in parallelo al freeze.
- **Timezone** → `site_settings.timezone` + guard booking in ora locale del tenant (anticipato da post-MVP; è modifica di schema → nel baseline). **Nota:** `maintenance_mode`, `extra_data`, social columns sono stati aggiunti nell'Intermezzo Admin-fix (2026-05-23) — non entrano più in A1b.

Piano a 3 stream (`docs/ai-playbooks/prompts/2026-05-22_sprint6/`):

**Stream A — Artefatti freeze** (sequenziale):
- A1: hardening RLS (`is_tenant_owner()` `SECURITY DEFINER` + riscrittura policy di scrittura) + estensione `audit_rls.sql` ai GRANT — SQL/sicurezza, verificato via `rls_isolation_tests.sql`
- A1b: colonna `site_settings.timezone` + guard booking (`getAvailableTimeSlots`/`createBooking`) in ora locale del tenant — schema + service layer, verificato via flusso prenotazione
- A2: parametrizzazione `create_schema_from_template.sql` (`:schema`/`:owner_uuid`)
- A3: pulizia pre-freeze schema `template` (checklist [[mvp]] — operativo)
- A4: genera `schema.sql` + `migrations/001_init.sql`, test su schema usa-e-getta (`test_freeze`), audit pulito, drop, freeze `LOCKED`

**Stream B — Email** (parallelo, infra tenant-agnostica) — **in corso ora, costruita dormiente**:
- B1: account Resend + verifica dominio `foras.*` (operativo) — **differito** (Lucio non ha ancora il dominio)
- B2: Edge Function `send-booking-email` + wiring `apps/web` — **default OFF / no-op se non configurato, mai blocca una prenotazione** (l'email darebbe fastidio agli smoke test). Attivazione = solo flip di config quando dominio+deploy pronti.

**Stream C — Onboarding cliente #1** (dopo freeze + email):
- Creare schema, utente admin (`user_metadata.schema`), deploy su dominio custom
- Pagina `/privacy` personalizzata (incl. nota foras = data processor email)
- Checklist pre-deploy GDPR completata

Done when:
- Tutti e tre i criteri di freeze soddisfatti
- Primo cliente in produzione su dominio custom, con email conferma/notifica funzionanti
- Audit RLS pulito (RLS + GRANT) sul nuovo schema cliente

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
