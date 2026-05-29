---
status: LOCKED
updated: 2026-05-29
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

Scheletro delle fasi MVP. **Per il dettaglio task, lo stato e la cronaca di ogni fase → [[backlog]]; per lo stato vivo ("cosa è vero ORA") → [[STATUS]].** Qui resta solo la sequenza macroscopica e la sua mappatura sugli sprint del backlog.

| Fase | Nome | Sprint backlog | Stato |
|------|------|----------------|-------|
| Fase 0 | Fondazioni | Sprint 0 | ✅ eseguita (frozen 2026-05-27) |
| Fase 1 | Data e Security Baseline | Sprint 1 | ✅ eseguita (frozen 2026-05-27) |
| Fase 2 | Service Layer | Sprint 2 | ✅ eseguita (frozen 2026-05-27) |
| Fase 3 | Homepage pubblica | Sprint 3 | ✅ eseguita (frozen 2026-05-27) |
| Fase 4 | Prenotazioni | Sprint 4 | ✅ eseguita (frozen 2026-05-27) |
| Fase 5 | Admin panel | Sprint 5 | ✅ eseguita (frozen 2026-05-27) |
| Fase 6 | Template freeze + email centralizzata | Sprint 6 | ✅ eseguita — 🔒 template FROZEN (2026-05-27) |
| Fase 7 | Onboarding e UI custom primo cliente | Sprint 7 / Stream C | ⏳ in corso (tracciata nel backlog) |

> **Nota storica (2026-05-21/22):** l'email (conferma cliente + notifica gestore) è stata **demandata fuori da Fase 4** e ridefinita come Edge Function centralizzata con dominio di servizio condiviso `foras.*`, costruita in Fase 6 in parallelo al freeze. Vedi [[decisioni]] voci *Email prenotazioni* (2026-05-21 e 2026-05-22).

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
