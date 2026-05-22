---
status: DRAFT
updated: 2026-05-19
area: build-delivery
type: runbook
tags: [foras-mvp, build-delivery]
owner: master-chat
---

# Runbook Implementazione

## Purpose

Tradurre la roadmap in una sequenza eseguibile:

- cosa fare prima;
- cosa non fare ancora;
- cosa verificare prima dello step successivo.

## Working Rules

- Nessuna feature nuova se il flusso corrente non è stabile.
- Nessuna modifica allo schema senza script di migrazione numerato (post-freeze).
- Ogni step chiude con test manuali minimi prima di avanzare.
- Il service layer va in `/packages` — nessuna query DB diretta nei componenti UI.
- Non onboardare clienti reali prima del freeze del template.

---

## Phase 0 — Monorepo Setup (0,5 giorni)

### Tasks

- Inizializzare repo con struttura pnpm workspaces
- Creare `pnpm-workspace.yaml` con `apps/*` e `packages/*`
- Scaffoldare `/apps/web` e `/apps/admin` con Next.js App Router
- Creare `/packages/supabase` (client condiviso) e `/packages/ui` (shadcn)
- Configurare `.env.example` con le tre variabili Supabase
- Configurare TypeScript path aliases (`@repo/supabase`, `@repo/ui`)
- Connettere Vercel al repo con build separati per web e admin

### Done when

- `pnpm --filter web dev` → `localhost:3000` senza errori
- `pnpm --filter admin dev` → `localhost:3001` senza errori
- Deploy preview su Vercel per entrambe le app
- `pnpm -r tsc --noEmit` pulito

---

## Phase 1 — Data e Security Baseline (1–2 giorni)

### Tasks

- Eseguire `docs/operations/create_schema_from_template.sql` sullo schema `template`
- Eseguire `docs/operations/audit_rls.sql` — nessuna discrepanza attesa
- Test isolamento cross-tenant (query da un schema sull'altro devono fallire)
- Generare tipi TypeScript: `pnpm --filter @repo/supabase gen:types` (curl contro `postgres-meta` HTTP via tunnel SSH — vedi `monorepo-structure.md` e decision-log)
- Implementare `supabaseClient.ts` in `/packages/supabase` che legge le env vars
- Implementare `getVerifiedTenantClient()` in `/apps/admin/lib/auth.ts`
- Testare login admin con utente sullo schema `template`

### Done when

- Tentativi cross-tenant rifiutati con 403
- Public read vede solo dati attesi (site_settings, menu pubblico, time_slots)
- Booking insert anonimo funziona; update/delete anonimi rifiutati
- `getVerifiedTenantClient()` invalida la sessione se schema non corrisponde a `public.tenants`

---

## Phase 2 — Service Layer (1 giorno)

### Tasks

- `/packages/supabase/src/services/site.ts`: `getSiteSettings()`, `getActiveNews()`
- `/packages/supabase/src/services/menu.ts`: `getMenuBySection()`, `getMenuSections()`
- `/packages/supabase/src/services/bookings.ts`: `getAvailableTimeSlots()`, `createBooking()`, `cancelBookingByToken()`
- Validazioni Zod per tutti gli input (in `/packages/supabase/src/schemas/`)
- Esportare tutto da `/packages/supabase/src/index.ts`

### Done when

- Tutti i service functions sono tipati con i tipi generati via `postgres-meta` HTTP (no CLI Supabase)
- Nessuna query DB diretta fuori da `/packages/supabase`
- Zod schemas coprono tutti i campi obbligatori e opzionali

---

## Phase 3 — Homepage pubblica (2 giorni)

### Tasks

- `app/page.tsx`: fetch server-side di `getSiteSettings()` e `getActiveNews()`
- Componenti headless: `Hero`, `Slogan`, `Bio`, `OpeningHours`, `Footer`, `Gallery`, `NewsPopup`, `NewsSection`
- Skeleton screens: `SkeletonGallery`, `SkeletonNews` (client-side)
- `app/error.tsx` e `app/loading.tsx`
- Meta tag dinamici in `app/layout.tsx` da `site_settings`
- `app/booking/cancel/[token]/page.tsx`: chiamata a `cancelBookingByToken()`

### Done when

- Lighthouse SEO score ≥ 90 sulla homepage
- Nessun layout shift (CLS) sui contenuti above the fold
- Pagina `/booking/cancel/[token]` cancella la prenotazione e mostra conferma
- Con Supabase irraggiungibile: `error.tsx` mostrato senza pagina rotta

---

## Phase 4 — Prenotazioni (1–2 giorni)

### Tasks

- `app/booking/page.tsx`: form con validazione Zod client+server
- `createBookingAction` (Server Action, non API route) → `createBooking()` con controllo coperti
- Test unique constraint `(email, time_slot_id, date)`
- Test overbooking (coperti esauriti → rifiuto con messaggio chiaro)

> **Email demandata a Phase 6.** L'invio email (conferma cliente + notifica gestore) NON è in Phase 4: è ridefinito come Edge Function centralizzata `send-booking-email` con dominio di servizio condiviso `foras.*`, costruita in Phase 6 in parallelo al freeze. Phase 4 chiude col `cancellation_token` mostrato nella success page come link diretto. Vedi decision-log *Email prenotazioni* (2026-05-21 e 2026-05-22).

### Done when

- Prenotazione completata end-to-end (success page mostra il link `/booking/cancel/{token}`)
- Secondo tentativo con stessa email/turno/data rifiutato da Postgres
- Cancellazione via link ripristina i coperti

---

## Phase 5 — Admin panel (2–3 giorni)

### Tasks

**Auth e layout:**
- `apps/admin/proxy.ts`: protezione route con `getUser()` + `getVerifiedTenantClient()` (era `middleware.ts`, rinominato nello stack upgrade Next 16)
- Layout con sidebar navigazione

**Menu:**
- CRUD sezioni (abilita/disabilita, rinomina — no creazione da zero)
- CRUD categorie e item con form Zod + shadcn
- Drag-and-drop con bulk update `position` (libreria: `@dnd-kit/core`)
- Checkbox allergeni su item

**Contenuti:**
- CRUD popup/novità con ordinamento slide
- Form orari di apertura (7 giorni, toggle closed)
- Impostazioni sito: title, description, og:image, slogan, bio, indirizzo

**Prenotazioni:**
- Vista prenotazioni con filtro per data e turno
- Visualizzazione stato (confirmed/cancelled)

### Done when

- Tutte le sezioni CRUD funzionanti senza errori Zod o TypeScript
- Modifiche visibili sulla homepage pubblica senza rebuild
- Drag-and-drop aggiorna correttamente `position` su tutti gli item della lista

---

## Phase 6 — Template freeze + email centralizzata (1,5–2 giorni)

### Tasks

**Hardening pre-freeze (entra nel baseline congelato):**
- Funzione `public.is_tenant_owner()` `SECURITY DEFINER` + riscrittura policy di scrittura admin (owner vs `public.tenants`) in `create_schema_from_template.sql`; migrazione per applicarla al `template` esistente
- Colonna `site_settings.timezone TEXT NOT NULL DEFAULT 'Europe/Rome'` + guard booking (`getAvailableTimeSlots`/`createBooking`) in ora locale del tenant
- Estendere `docs/operations/audit_rls.sql` ai GRANT minimi + presenza di `is_tenant_owner()`

**Freeze:**
- Parametrizzare `create_schema_from_template.sql` (`:schema`/`:owner_uuid`, niente `template`/owner hardcoded)
- Eseguire checklist pulizia pre-freeze (vedi [[mvp]])
- Finalizzare `schema.sql` dallo stato attuale dello schema `template`
- Creare `migrations/001_init.sql` = contenuto di `schema.sql`
- Testare `create_schema_from_template.sql` su uno schema di prova (`test_freeze`)
- Dichiarare freeze: aggiornare `status: LOCKED` nei file rilevanti

**Email (parallelo, infra tenant-agnostica):**
- Verifica dominio `foras.*` su Resend (one-time)
- Edge Function `send-booking-email` (conferma cliente + notifica gestore) + wiring `apps/web` dopo `createBooking`

### Done when

- Tutti e tre i criteri di freeze soddisfatti (vedi [[mvp]])
- `create_schema_from_template.sql` crea uno schema funzionante end-to-end con RLS hardened
- Audit RLS pulito (RLS + GRANT) sullo schema `test_freeze`
- Schema `test_freeze` eliminato dopo il test
- Email conferma + notifica inviate via Edge Function su una prenotazione di prova

---

## Phase 7 — Onboarding primo cliente (1 giorno)

### Tasks

- Fork di `repo-template` → `repo-[nome-cliente]`
- Impostare `.env` con `NEXT_PUBLIC_SUPABASE_SCHEMA=[nome-cliente]`
- Eseguire `create_schema_from_template.sql` con schema e owner reali
- Creare utente admin in Supabase Auth con `user_metadata.schema`
- Configurare dominio custom su Vercel
- Implementare UI custom su `/apps/web`
- Upload asset su `bar-assets/[nome-cliente]/`
- Compilare checklist pre-deploy (vedi [[onboarding-tenant]])

### Done when

- Homepage live su dominio custom del cliente
- Admin panel accessibile su `admin.[dominio]`
- Audit RLS pulito sul nuovo schema
- Prenotazione end-to-end testata sul dominio reale

---

## Test Checklist Per Ogni Deploy

- [ ] Isolamento tenant verificato (cross-tenant query rifiutate)
- [ ] Admin login con schema errato rifiutato
- [ ] Prenotazione oltre capienza bloccata
- [ ] Unique constraint `(email, time_slot_id, date)` testato
- [ ] Email conferma e notifica gestore consegnate
- [ ] Cancellazione via link funzionante
- [ ] RLS audit pulito (nessuna discrepanza)

---

## Anti-Scope-Creep

Non fare prima del freeze del template:

- UI custom per alcun cliente
- Pagamenti online
- Reminder prenotazioni (SMS/email schedulati)
- Form candidature staff
- Routing multi-tenant su dominio condiviso
- Monorepo unificato (Modello B)

---

## Weekly Rhythm

- **Lun:** planning tecnico — obiettivo unico della settimana, prompt scritti per sub-chat
- **Mar–Mer:** build verticale — un flusso completo, non dieci feature parziali
- **Gio:** hardening — test manuali, edge cases, TypeScript pulito
- **Ven:** commit, push, aggiornamento docs, revisione backlog

Regola: una settimana = un flusso end-to-end dimostrabile.
