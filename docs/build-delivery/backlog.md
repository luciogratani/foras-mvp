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

## Sprint 0 — Monorepo Setup

**Goal:** base tecnica funzionante in locale e su Vercel.

Tasks:
- Scaffoldare monorepo pnpm workspaces con struttura `/apps/web`, `/apps/admin`, `/packages/supabase`, `/packages/ui`
- Configurare Next.js App Router su entrambe le app
- Collegare Supabase (progetto esistente)
- Configurare `.env.example` con le tre variabili tenant
- Configurare TypeScript, ESLint, Prettier condivisi
- Primo deploy preview su Vercel per entrambe le app

Done when:
- `pnpm --filter web dev` e `pnpm --filter admin dev` girano in locale senza errori
- Deploy preview funzionante su Vercel
- Connessione a Supabase testata (query di prova sullo schema `template`)

---

## Sprint 1 — DB, RLS e tipi TypeScript

**Goal:** schema tenant completo, isolamento verificato, tipi generati.

Tasks:
- Eseguire `create_schema_from_template.sql` sullo schema `template`
- Verificare RLS con lo script `audit_rls.sql`
- Eseguire test di isolamento cross-tenant
- Generare tipi TypeScript con Supabase CLI (`database.ts` in `/packages/supabase`)
- Scrivere `supabaseClient.ts` condiviso che legge `NEXT_PUBLIC_SUPABASE_SCHEMA`

Done when:
- Tutti i test di isolamento passano
- Tipi TypeScript generati e importabili nelle app
- `getVerifiedTenantClient()` implementata e funzionante in `/apps/admin`

---

## Sprint 2 — Homepage pubblica — struttura e SSR

**Goal:** homepage SSR headless funzionante sullo schema `template`.

Tasks:
- Implementare `getSiteSettings()` e `getActiveNews()` server-side
- Implementare layout homepage con skeleton dei componenti principali
- Componenti headless: Hero, Slogan, Bio, Orari, Footer, Galleria, Popup, Sezione news
- Skeleton screens per contenuti secondari (Galleria, Popup, News)
- `error.tsx` e `loading.tsx`
- Meta tag dinamici da `site_settings`

Done when:
- Homepage carica con SSR e mostra dati dallo schema `template`
- Nessun flash di layout shift sui contenuti above the fold
- Meta tag corretti nel `<head>`

---

## Sprint 3 — Menu pubblico

**Goal:** menu consultabile sulla homepage pubblica.

Tasks:
- Implementare query `getMenuBySection()` server-side
- Componente Menu con navigazione a tab per section
- Visualizzazione categorie e item con prezzo
- Popup/sheet allergeni per item
- `is_active` rispettato su tutti i livelli

Done when:
- Menu completo navigabile sulla homepage
- Allergeni visualizzabili senza navigare fuori dalla pagina
- Item e categorie disabilitate non visibili

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
