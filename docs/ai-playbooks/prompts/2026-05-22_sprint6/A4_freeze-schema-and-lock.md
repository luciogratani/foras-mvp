---
status: DONE
sprint: 6
stream: A
task: A4
created: 2026-05-25
completed: 2026-05-27
suggested_model: claude-sonnet-4-6
suggested_effort: high
owner: master-chat
---

> **DONE 2026-05-27.** Eseguito dal master (parte operativa via SSH+docker exec sul server self-hosted, niente subchat). Creato schema usa-e-getta `freeze_test` dallo script A2 → audit `audit_rls.sql` **0 discrepanze** vs `template` (policy/RLS/GRANT/helper) → `pg_dump --schema-only` → generati `schema.sql` (root, `freeze_test`→`template` + header FROZEN) e `migrations/001_init.sql` (pointer sottile al provisioner, no duplicazione) → `freeze_test` droppato. `migration-runbook.md` allineato (baseline 001 + applicazione via Docker). **Template FROZEN/LOCKED** (decision-log 2026-05-27). NB: lo schema `template` live NON è stato toccato (resta sandbox dev/test).

# Sprint 6 / A4 — Genera `schema.sql` + `migrations/001_init.sql`, testa, FREEZE LOCKED

> **Ultimo step del freeze.** Dipendenze: A1 (RLS hardened) + A1b (timezone, opzione B) + A2 (script parametrizzato e testato) **tutti completati**. **A3 è CANCELLATO** (decision-log 2026-05-27): non si tocca il `template`. Dopo A4 il baseline è congelato: la fonte di verità diventa `schema.sql` e ogni modifica passa per migrazioni numerate.
>
> **Approccio (deciso 2026-05-27): NON dumpare il `template`.** `schema.sql` si genera da uno schema **usa-e-getta** `freeze_test`, creato dallo script A2 (pulito per costruzione), che è anche lo schema su cui girano i test; poi si droppa. Il `template` resta un sandbox dev/test (anche per James) e non viene mai toccato.
>
> Parte **autoriale** (file + doc, delegabile) e parte **operativa** (creazione/dump/test dello schema `freeze_test`) che esegue il master via SSH+psql sul server self-hosted (la 5432 non è esposta). Indicato chi fa cosa.

## Contesto

Oggi `migrations/001_init.sql` e `schema.sql` (root del repo) **non esistono** (solo `.gitkeep`). Il baseline è stato hardenato (A1), reso tz-correct via helper condiviso (A1b, opzione B — nessuna colonna), e lo script di onboarding è parametrizzato/testato (A2). A3 (pulizia `template`) è cancellato: A4 lavora su uno schema usa-e-getta `freeze_test`, non sul `template`. A4 produce gli artefatti congelati e li valida, poi marca lo stato LOCKED in tutta la documentazione.

## File da leggere prima di iniziare

- `docs/operations/create_schema_from_template.sql` — la fonte DDL parametrizzata (post-A2): è la base da cui derivare `schema.sql` e `001_init.sql`.
- `docs/operations/audit_rls.sql` e `rls_isolation_tests.sql` — per la validazione finale.
- `docs/tech-architecture/architettura-fullstack.md` (§ "Schema template come ambiente di sviluppo", criterio di freeze) e `docs/operations/migration-runbook.md` (flusso migrazioni post-freeze).
- `docs/product-scope/mvp.md` (criteri di freeze + checklist pulizia) e `docs/build-delivery/backlog.md` (§ Sprint 6).
- `docs/decision-log/decisioni.md` — per scrivere la voce di chiusura "Template FROZEN".

## Scope

### 1. `schema.sql` (root del repo) — fotografia canonica del baseline congelato
**Generare da uno schema usa-e-getta `freeze_test` (NON dal `template`).** Master, operativo, via SSH+psql sul server:
1. Creare `freeze_test` con lo script A2: `psql -h 127.0.0.1 -p 5432 -U postgres -d postgres -v schema=freeze_test -v owner_uuid=1c486961-12b2-47d0-8aef-0aee30df083c -f create_schema_from_template.sql`.
2. `pg_dump --schema-only --schema=freeze_test` → normalizzare: sostituire l'identificatore `freeze_test` con un placeholder coerente (o documentarlo come schema di riferimento), rimuovere riferimenti owner/ambiente. È fedele perché cattura lo stato reale che lo script produce post-A1/A1b/A2, **senza toccare il `template`**.
3. Coerenza con `create_schema_from_template.sql` (la sub-chat verifica che `schema.sql` e lo script producano lo stesso schema). Lo schema `freeze_test` serve anche per i test (§3) → riusare lo stesso, droppare alla fine.
Header di `schema.sql`: data del freeze, versione, "FONTE DI VERITÀ post-freeze — non modificare senza una migrazione numerata in `/migrations`".

### 2. `migrations/001_init.sql` — migrazione iniziale
La migrazione "zero" che porta uno schema vuoto allo stato `schema.sql`. In pratica coincide con lo script di onboarding parametrizzato (A2) o con `schema.sql` stesso applicato a uno schema nuovo. Definire la convenzione con `migration-runbook.md` (numerazione, idempotenza, ordine). Header coerente.

### 3. Test su schema usa-e-getta (master, operativo)
- Creare `freeze_test` applicando `migrations/001_init.sql` (o lo script A2 con `-v schema=freeze_test`).
- `audit_rls.sql` → zero discrepanze vs `template`.
- `rls_isolation_tests.sql` (sez. 1/2a/2b + sez. 3 owner-scope) adattati a `freeze_test` → tutti PASS.
- Sanity: 9 tabelle, seed canonico (14 allergeni / 6 sezioni / 2 time_slots / 1 site_settings), `is_tenant_owner` presente e SECURITY DEFINER.
- **Cleanup:** `DROP SCHEMA freeze_test CASCADE;` + `DELETE FROM public.tenants WHERE schema_name='freeze_test';`.

### 4. Marcare LOCKED in tutta la documentazione
- `docs/build-delivery/backlog.md` § Sprint 6: spuntare Stream A; segnare il template **FROZEN/LOCKED** con data.
- Frontmatter `status: LOCKED` dove pertinente (es. una nota nel README hub o nei doc di onboarding che il template è congelato).
- `docs/operations/onboarding-tenant.md`: rimuovere le note "bozza/da finalizzare post-freeze" dallo Step 1 (ora lo script è pronto e testato); confermare i pre-requisiti.
- `docs/decision-log/decisioni.md`: nuova voce datata "Template FROZEN" con cosa include il baseline congelato (RLS owner-scope, schema-extras, end_time, timezone se opzione A) e la regola "da qui in poi solo migrazioni numerate".
- `docs/ai-playbooks/prompts/2026-05-22_sprint6/`: A1/A1b/A2 già `DONE`, A3 `CANCELLED`, A4 → `status: DONE`.

## Vincoli

- **Nessuna modifica di schema in A4**: A4 fotografa e congela, non cambia. Se durante il test emerge una discrepanza, **fermarsi e segnalare al master** (è sintomo che A1/A1b/A2/A3 non hanno chiuso qualcosa) — non "aggiustare" lo schema qui.
- Coerenza assoluta tra `schema.sql`, `001_init.sql` e `create_schema_from_template.sql`: i tre devono produrre lo stesso schema.
- Il dump e i run SQL li fa il master; la sub-chat produce/normalizza i file e aggiorna i doc.
- Non committare dati/segreti nel dump (owner UUID reali, chiavi): `schema.sql` è struttura + seed, non dati.

## Output atteso

- `schema.sql` (root) — schema canonico congelato.
- `migrations/001_init.sql` — migrazione iniziale.
- Doc aggiornati a LOCKED (backlog, onboarding-tenant, decision-log, README hub se serve) + i 5 prompt Stream A a `status: DONE`.

## Done when

- `schema.sql` e `001_init.sql` esistono, coerenti tra loro e con la baseline; applicati a `freeze_test` passano audit + isolation test; cleanup eseguito.
- La documentazione dichiara il template **FROZEN/LOCKED** con data; la regola "solo migrazioni numerate" è esplicita.
- Il primo onboarding reale (Stream C) può partire.

## Report finale (conciso)

(1) Come è stato generato `schema.sql` (dump o derivazione) e perché. (2) Esito del test `freeze_test` (audit zero righe? isolation PASS?) come riportato dal master. (3) Elenco doc marcati LOCKED. (4) Eventuali discrepanze emerse (e stop, se è il caso). (5) Conferma coerenza schema.sql ↔ 001_init.sql ↔ create_schema_from_template.sql.
