---
status: LOCKED
updated: 2026-05-29
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

Per i task → [[backlog]] (Sprint 0).

### Done when

- `pnpm --filter web dev` → `localhost:3000` senza errori
- `pnpm --filter admin dev` → `localhost:3001` senza errori
- Deploy preview su Vercel per entrambe le app
- `pnpm -r tsc --noEmit` pulito

---

## Phase 1 — Data e Security Baseline (1–2 giorni)

Per i task → [[backlog]] (Sprint 1).

### Comandi / verifiche

- Eseguire `docs/operations/create_schema_from_template.sql` sullo schema `template`
- Eseguire `docs/operations/audit_rls.sql` — nessuna discrepanza attesa
- Generare tipi TypeScript: `pnpm --filter @repo/supabase gen:types` (curl contro `postgres-meta` HTTP via tunnel SSH — vedi `monorepo-structure.md` e [[decisioni]])

### Done when

- Tentativi cross-tenant rifiutati con 403
- Public read vede solo dati attesi (site_settings, menu pubblico, time_slots)
- Booking insert anonimo funziona; update/delete anonimi rifiutati
- `getVerifiedTenantClient()` invalida la sessione se schema non corrisponde a `public.tenants`

---

## Phase 2 — Service Layer (1 giorno)

Per i task → [[backlog]] (Sprint 2).

### Done when

- Tutti i service functions sono tipati con i tipi generati via `postgres-meta` HTTP (no CLI Supabase)
- Nessuna query DB diretta fuori da `/packages/supabase`
- Zod schemas coprono tutti i campi obbligatori e opzionali

---

## Phase 3 — Homepage pubblica (2 giorni)

Per i task → [[backlog]] (Sprint 3).

### Done when

- Lighthouse SEO score ≥ 90 sulla homepage
- Nessun layout shift (CLS) sui contenuti above the fold
- Pagina `/booking/cancel/[token]` cancella la prenotazione e mostra conferma
- Con Supabase irraggiungibile: `error.tsx` mostrato senza pagina rotta

---

## Phase 4 — Prenotazioni (1–2 giorni)

Per i task → [[backlog]] (Sprint 4).

> **Email demandata a Phase 6.** L'invio email (conferma cliente + notifica gestore) NON è in Phase 4: è ridefinito come Edge Function centralizzata `send-booking-email` con dominio di servizio condiviso `foras.*`, costruita in Phase 6 in parallelo al freeze. Phase 4 chiude col `cancellation_token` mostrato nella success page come link diretto. Vedi [[decisioni]] *Email prenotazioni* (2026-05-21 e 2026-05-22).

### Done when

- Prenotazione completata end-to-end (success page mostra il link `/booking/cancel/{token}`)
- Secondo tentativo con stessa email/turno/data rifiutato da Postgres
- Cancellazione via link ripristina i coperti

---

## Phase 5 — Admin panel (2–3 giorni)

Per i task → [[backlog]] (Sprint 5).

### Done when

- Tutte le sezioni CRUD funzionanti senza errori Zod o TypeScript
- Modifiche visibili sulla homepage pubblica senza rebuild
- Drag-and-drop aggiorna correttamente `position` su tutti gli item della lista

---

## Phase 6 — Template freeze + email centralizzata (1,5–2 giorni)

Per i task → [[backlog]] (Sprint 6). Qui resta la sequenza operativa di freeze (comandi/verifiche concreti).

### Comandi / verifiche (sequenza di freeze)

- Eseguire checklist pulizia pre-freeze (vedi [[mvp]])
- Finalizzare `schema.sql` dallo stato attuale dello schema `template` (`pg_dump --schema-only`)
- Creare `migrations/001_init.sql` = contenuto di `schema.sql`
- Testare `create_schema_from_template.sql` su uno schema di prova (`test_freeze`), poi eliminarlo
- Verifica dominio `foras.*` su Resend (one-time)
- Dichiarare freeze: aggiornare `status: LOCKED` nei file rilevanti

### Done when

- Tutti e tre i criteri di freeze soddisfatti (vedi [[mvp]])
- `create_schema_from_template.sql` crea uno schema funzionante end-to-end con RLS hardened
- Audit RLS pulito (RLS + GRANT) sullo schema `test_freeze`
- Schema `test_freeze` eliminato dopo il test
- Email conferma + notifica inviate via Edge Function su una prenotazione di prova

---

## Phase 7 — Onboarding primo cliente (1 giorno)

Per i task → [[backlog]] (Sprint 7 / Stream C). Procedura operativa completa in [[onboarding-tenant]].

### Comandi / verifiche

- Eseguire `create_schema_from_template.sql` con schema e owner reali (`-v schema=` / `-v owner_uuid=`)
- Creare utente admin in Supabase Auth con `user_metadata.schema`
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
- **Ven:** commit, aggiornamento docs, revisione backlog (push su richiesta esplicita di Lucio)

Regola: una settimana = un flusso end-to-end dimostrabile.
