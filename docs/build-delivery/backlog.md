---
status: DRAFT
updated: 2026-05-29
area: build-delivery
type: backlog
tags: [foras-mvp, build-delivery]
owner: master-chat
---

# Backlog

## Scopo

Backlog esecutivo MVP orientato al freeze del template e all'onboarding del primo cliente reale. Qui vivono **solo gli item aperti**; la cronaca degli sprint/intermezzi chiusi è stata spostata intatta in [[backlog-archive]] (vedi indice storico in fondo). Lo stato vivo autorevole è in [[STATUS]].

---

## Item aperti

> 🔒 **Template FROZEN (2026-05-27).** Sprint 0→6/Stream A e tutti gli intermezzi sono chiusi → in [[backlog-archive]]. Restano aperti: Stream B (email, dormiente), Stream C (onboarding cliente #1), Sprint 7 (UI custom). Stato vivo in [[STATUS]].

---

## Sprint 6 — Stream B / Stream C (residuo aperto dello Sprint 6)

> Lo **Stream A** (artefatti di freeze) è ✅ COMPLETO e archiviato in [[backlog-archive]]. Qui restano gli stream ancora aperti dello Sprint 6. Decisioni master all'apertura (2026-05-22) e cronaca Stream A: [[backlog-archive]] + `decision-log/decisioni.md`.

**Goal (Sprint 6):** template congelato, primo cliente reale onboardato.

**Stream B — Email** (parallelo, infra tenant-agnostica) — **costruita dormiente**:
- B1: account Resend + verifica dominio `foras.*` (operativo) — **differito** (Lucio non ha ancora il dominio)
- B2: Edge Function `send-booking-email` + wiring `apps/web` — **default OFF / no-op se non configurato, mai blocca una prenotazione** (l'email darebbe fastidio agli smoke test). Attivazione = solo flip di config quando dominio+deploy pronti. (`@supabase/supabase-js` pinnato a `2.106.1` nell'Intermezzo Audit-04-hardening, punto F.)

**Stream C — Onboarding cliente #1** (dopo freeze + email) — **prossimo passo, bloccato da dipendenze esterne (nessun cliente/dominio ancora)**:
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

---

## Indice storico (cronaca chiusa → [[backlog-archive]])

Mappa "cosa è stato fatto e dove leggerlo". Dettaglio integrale (commit, gotcha, smoke test, "Done when") in [[backlog-archive]].

- **Sprint 0** — Monorepo setup pnpm + Next + Supabase — ✅ DONE (2026-05-20) — [[backlog-archive]]
- **Sprint 1** — DB, RLS, tipi TS; service helper auth admin — ✅ CHIUSO (2026-05-21) — [[backlog-archive]]
- **Sprint 2** — Service layer in `@repo/supabase` (site/menu/bookings) — ✅ CHIUSO (2026-05-21) — [[backlog-archive]]
- **Sprint 2.5** — Stack upgrade Next 16 + React 19 + `@supabase/ssr` 0.10 — ✅ DONE (2026-05-21) — [[backlog-archive]]
- **Sprint 3** — Homepage pubblica SSR con menu — ✅ DONE — [[backlog-archive]]
- **Sprint 4** — Form prenotazioni end-to-end + cancel route + auth hardening — ✅ CHIUSO (2026-05-21) — [[backlog-archive]]
- **Sprint 5** — Admin panel CRUD (menu, novità, orari, prenotazioni, DnD) — ✅ CHIUSO (2026-05-22) — [[backlog-archive]]
- **Intermezzo UX-fix** — orari spezzati, `preferred_time`, `closed_dates` (pre-freeze) — ✅ CHIUSO (2026-05-23) — [[backlog-archive]]
- **Intermezzo Admin-fix** — UX backoffice + schema-extras (social, manutenzione, archiviazione turni) — ✅ CHIUSO (2026-05-24) — [[backlog-archive]]
- **Intermezzo Admin-UX-2** — dashboard operativa, sidebar shadcn, filtri rapidi — ✅ CHIUSO (2026-05-24) — [[backlog-archive]]
- **Intermezzo Web-UX-funnel** — UX funnel prenotazione pubblico (Secchio A) — ✅ CHIUSO (2026-05-24) — [[backlog-archive]]
- **Intermezzo Menu-refactor** — `/dashboard/menu` accordion + hardening + sezioni CRUD — ✅ CHIUSO (2026-05-25) — [[backlog-archive]]
- **Intermezzo Booking-orario-libero** — finestra turno `end_time` + orario di arrivo custom — ✅ CHIUSO (2026-05-25) — [[backlog-archive]]
- **Sprint 6 / Stream A** — artefatti freeze (RLS hardening, timezone, provisioner, schema snapshot) — ✅ COMPLETO → 🔒 TEMPLATE FROZEN (2026-05-27) — [[backlog-archive]]
- **Intermezzo Audit-04-hardening** — rete di sicurezza pre-cliente #1 (RLS in CI, runner migrazioni, trigger anti-overbooking, pin edge fn) — ✅ CHIUSO (2026-05-28; CI verde 2026-05-29) — [[backlog-archive]]
- **Controlli pre-Sprint 6** — coerenza docs + allineamento build-delivery (2026-05-22) — ✅ CHIUSO — [[backlog-archive]]
