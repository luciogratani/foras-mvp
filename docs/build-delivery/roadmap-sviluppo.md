---
status: DRAFT
updated: 2026-05-19
area: build-delivery
type: roadmap
tags: [foras-mvp, build-delivery]
owner: master-chat
---

# Roadmap Sviluppo

## Scopo

Definire la sequenza di sviluppo MVP a blocchi, con priorità orientata a:

- freeze rapido del template su un flusso end-to-end completo;
- riduzione rischio tecnico su isolamento tenant, prenotazioni e admin panel;
- consegna progressiva senza scope creep.

## Principio guida

Costruire prima il flusso end-to-end minimo:

`monorepo setup → schema + RLS → homepage SSR → menu → prenotazioni → admin panel → freeze → primo cliente`

Solo dopo il freeze del template: UI custom per ogni cliente, ottimizzazioni, feature post-MVP.

---

## Fasi roadmap

### Fase 0 — Fondazioni

- Scaffolding monorepo pnpm workspaces (apps, packages)
- Configurazione Next.js, TypeScript, ESLint, Prettier
- Connessione Supabase e primo deploy Vercel

### Fase 1 — Data e Security Baseline

- Esecuzione `create_schema_from_template.sql` sullo schema `template`
- RLS attiva e verificata su tutte le tabelle
- Test di isolamento cross-tenant
- Tipi TypeScript generati da Supabase CLI
- `getVerifiedTenantClient()` implementata nel middleware admin

### Fase 2 — Service Layer

- Service functions per homepage: `getSiteSettings()`, `getActiveNews()`, `getMenuBySection()`
- Service functions per prenotazioni: `getAvailableTimeSlots()`, `createBooking()`, `cancelBooking()`
- Validazioni Zod centralizzate
- Nessun componente UI con query DB dirette

### Fase 3 — Homepage pubblica

- Homepage SSR headless con tutti i componenti (Hero, Slogan, Bio, Galleria, Popup, Menu, Orari, Footer)
- Skeleton screens per contenuti secondari (client-side)
- Meta tag dinamici, `error.tsx`, `loading.tsx`
- Rotta pubblica `/booking/cancel/[token]`

### Fase 4 — Prenotazioni

- Form prenotazione con validazione Zod e controllo coperti
- Conferma automatica e `cancellation_token`
- Edge function Resend: email al cliente e notifica al gestore
- Test unique constraint e cancellazione

### Fase 5 — Admin panel

- Autenticazione admin con validazione schema
- CRUD completo: menu (sezioni, categorie, item, allergeni), popup/novità, orari, site settings
- Drag-and-drop ordinamento con bulk update `position`
- Vista prenotazioni per data/turno

### Fase 6 — Template freeze

- Checklist pulizia pre-freeze eseguita
- `schema.sql` e `migrations/001_init.sql` finalizzati
- `create_schema_from_template.sql` testato end-to-end
- Template dichiarato frozen — nessuna modifica strutturale senza migrazione

### Fase 7 — Onboarding e UI custom primo cliente

- Onboarding primo schema cliente con audit RLS
- Deploy su dominio custom
- UI custom su `/apps/web` del repo fork
- Raccolta feedback e iterazione

---

## Gate per avanzamento fase

Passare alla fase successiva solo se:

- i criteri "Done when" del backlog per quella fase sono tutti verificati;
- nessuna regressione sui flussi critici (prenotazioni, isolamento tenant, admin login);
- il service layer è pulito e i tipi TypeScript sono allineati allo schema.

---

## Rischi principali da monitorare

- **Data leakage cross-tenant** — RLS mal configurata su uno schema
- **Schema drift post-freeze** — modifiche fatte direttamente sul dashboard Supabase senza script di migrazione
- **Email non consegnata** — Resend plan gratuito ha limiti; testare in anticipo
- **Onboarding primo cliente prima del freeze** — il template non sarebbe stabile, rischio di divergenza schemi
