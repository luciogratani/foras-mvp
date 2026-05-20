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

## Sprint 2 — Service layer in `@repo/supabase` — DRAFT (apertura 2026-05-21)

**Goal:** service layer riusabile in `packages/supabase/src/services/` consumato da homepage pubblica (Sprint 3) e backoffice (Sprint 5). Nessuna query DB nei componenti UI.

**Allineamento docs (2026-05-21):** il backlog precedente fondeva "Sprint 2 = Homepage" e "Sprint 3 = Menu", mentre `roadmap-sviluppo.md` (Fase 2) e `runbook-implementazione.md` (Phase 2) trattano il service layer come uno sprint distinto. Riallineato qui.

Eseguito come 3 sub-task sequenziali in `docs/ai-playbooks/prompts/2026-05-21_sprint2/`:
- 01 [[2026-05-21_sprint2_01_site-service]] — `getSiteSettings`, `getActiveNews` su `template.site_settings` / `template.news_slides` (read-only, client anon)
- 02 [[2026-05-21_sprint2_02_menu-service]] — `getMenuSections`, `getMenuBySection`, `getAllergens` con convenzione di ordinamento `position asc NULLS LAST, name asc` (read-only, client anon)
- 03 [[2026-05-21_sprint2_03_bookings-service]] — `getAvailableTimeSlots`, `createBooking`, `cancelBookingByToken` + Zod schemas in `packages/supabase/src/schemas/` + error class (`OverbookingError`, `DuplicateBookingError`). ⚠️ due funzioni richiedono client privilegiato server-side.

**Decisioni architetturali Sprint 2** (vedi `decision-log/decisioni.md`):
- *Service layer — funzioni ricevono il client come parametro* — firma uniforme `(client: TenantClient, ...args)`; il consumer inietta le credenziali
- *`bookings` lato pubblico — service_role server-side, no RPC* — niente cambio dello schema baseline; Sprint 4 introdurrà `apps/web/lib/supabaseAdmin.ts` server-only
- Zod schemas in directory dedicata `schemas/` (non co-located in `services/*.ts`) — evita di trascinare `@supabase/supabase-js` nei bundle dei form Sprint 4
- `zod` aggiunto come `dependencies` di `@repo/supabase` nel sub-task 03

Done when:
- I service sono tipati end-to-end (`Tables<{ schema: 'template' }, ...>`, niente `any`)
- `pnpm -r tsc --noEmit` exit 0
- Nessuna query DB diretta fuori da `@repo/supabase`
- Smoke test manuale eseguito contro lo schema `template` (procedura in coda a ciascun prompt)
- `createBooking` rifiuta `gdpr_consent: false` via Zod e mappa il `23505` di Postgres a `DuplicateBookingError`

---

## Sprint 3 — Homepage pubblica SSR (con menu)

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

---

## Sprint 4 — Form prenotazioni

**Goal:** un visitatore prenota un tavolo e riceve conferma via email.

Tasks:
- Implementare `getAvailableTimeSlots()` con conteggio coperti disponibili
- Form prenotazione: nome, email, telefono (opzionale), coperti, note, GDPR
- Validazione Zod lato server
- Controllo disponibilità coperti e rifiuto se esauriti
- Conferma automatica con `cancellation_token`
- Route `GET /booking/cancel/[token]` per cancellazione senza auth
- Edge function Resend: email conferma al cliente + notifica al gestore

Done when:
- Prenotazione completata end-to-end con email ricevuta
- Unique constraint `(email, time_slot_id, date)` testato
- Cancellazione via link funzionante, coperti ripristinati

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
