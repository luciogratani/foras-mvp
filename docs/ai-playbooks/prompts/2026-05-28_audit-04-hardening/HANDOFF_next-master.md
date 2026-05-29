---
status: CONSUMED
type: master-handoff
created: 2026-05-28
consumed: 2026-05-29
owner: master-chat
---

> ✅ **CONSUMATO 2026-05-29.** Questo handoff è stato raccolto e completato: N investigato e chiuso, B' revisionato/eseguito, C/D fatti, E tracciato e rimandato. **CI interamente verde, filone audit-04b CHIUSO.** Lo stato live aggiornato è in `docs/audit/04b_followup_*.md` § "Punti aperti" + `MEMORY.md`. Il testo sotto è storico (fotografia del 2026-05-28).

# Handoff alla prossima master chat

Ciao! Sei la nuova chat master per `foras-mvp`. Lucio è il principal (italiano, master di un workflow master/sub-chat).

## 1. Setup base (prima di rispondere a Lucio)

Leggi in quest'ordine:
1. `docs/README.md` + `docs/ai-playbooks/workflow-master-sub.md` — regole master/sub-chat (commit/push, file di doc da mantenere, template prompt).
2. `MEMORY.md` nella tua auto-memory + i file `project_*.md` linkati (in particolare `project_ci-state-audit04b.md` e `project_isolation-model.md`).
3. `docs/audit/04b_followup_2026-05-28_ci-failures-e-modello-isolamento.md` — il filo conduttore di questa fase.
4. `docs/decision-log/decisioni.md` — solo le ultime 3-4 voci (2026-05-28) bastano per il contesto recente.

## 2. Stato in cui ti trovo il banco di lavoro

**Pipeline CI (audit-04b):**
- 🟢 RLS isolation SQL test → tutti verdi.
- 🔴 RLS isolation Vitest step → fallisce su `bookings.test.ts` per un bug dello shim `pg-mock-client.ts` (punto **N**, nuovo).
- 🔴 Static job → fallisce per 8 errori + 1 warning su `apps/admin` (punto **B'**).

**Cosa è già fatto e committato (origin/main, fino a `95d2ee1`):**
- Decisione modello isolamento (PII + scrittura, non contenuto pubblico).
- Migrazione 004 (`GRANT EXECUTE is_tenant_owner TO anon`), applicata live.
- Fix lint apps/web (NewsPopup `useSyncExternalStore` + `<Link>` + postcss).
- Test cross-tenant `ci_xc.*` riallineato + fixato (forma reale di `site_settings`).
- Prompt sub-chat per B' scritto in `docs/ai-playbooks/prompts/2026-05-28_audit-04-hardening/B-prime_admin-lint.md` con status `NEEDS_MASTER_REVIEW` (Lucio vuole rileggerlo prima di girarlo).

**Cosa NON è fatto:**
- Punto **N** (Vitest pg-mock-client SQL error) — non investigato.
- Punto **B'** (apps/admin lint) — prompt da approvare + sub-chat da girare.
- Punto **C** (cleanup `docs/ci-logs/logs_*`) — banale, dopo N+B'.

## 3. Prima azione consigliata

Saluta Lucio in italiano. Riassumi in 4-6 righe lo stato (basandoti sui file letti, non su questo handoff a memoria). Proponi una di queste tre direzioni in base a quello che chiede:
- **(a)** Investigare N (Vitest shim). Apri `packages/supabase/src/__tests__/helpers/pg-mock-client.ts` + `bookings.test.ts`, capisci dove rompe, decidi fix.
- **(b)** Aiutare Lucio a revisionare il prompt B' (`docs/ai-playbooks/prompts/2026-05-28_audit-04-hardening/B-prime_admin-lint.md`) e farlo passare a `TODO`.
- **(c)** Lanciare la sub-chat B' (solo se Lucio ha già approvato il prompt) e poi reviewere il diff.

## 4. Regole operative da rispettare (riassunto, vedi workflow-master-sub.md per i dettagli)

- Italiano sempre con Lucio.
- Commit dopo ogni sessione produttiva (convenzionali con scope). **Push solo su richiesta esplicita di Lucio.**
- Sub-task non banali → delegale a sub-chat con prompt `.md` autonomo in `docs/ai-playbooks/prompts/` (non eseguire inline lavoro di scope grosso).
- Decisioni architetturali → master prende e documenta in `decisioni.md`, non delega.
- Tieni docs sincronizzate con stato reale (audit/04b_*.md, decisioni.md, MEMORY.md).
- Quando proponi qualcosa: 2-3 righe + raccomandazione + presentala come modificabile, non come piano deciso.

## 5. Cosa NON rifare (già deciso, non ridiscutere a meno di nuovi input)

- Schema-per-tenant = isolamento di **PII + scrittura, non contenuto pubblico**. Non proporre fix architetturali per chiudere la lettura cross-tenant di site_settings/menu/news (è scelta consapevole). Vedi `project_isolation-model.md`.
- Stack: Next 16 + React 19 + Tailwind 4 + Supabase self-hosted in Docker (SSH+docker exec). Non proporre downgrade.
- DB live va toccato via `docker exec -U supabase_admin` quando l'operazione richiede ownership (es. ALTER su public.tenant_migrations); `postgres` per le altre.

Buon lavoro!
