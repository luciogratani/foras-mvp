---
status: DONE
updated: 2026-05-21
area: ai-playbooks
type: prompt
sprint: 1
order: 5
tags: [foras-mvp, sprint1, rls, security, testing]
owner: master-chat
suggested_model: claude-sonnet-4-6
suggested_effort: medium
patched: 2026-05-21 — usa alex_akashi/underclub come fixture READ-ONLY (tenant reali); mantiene test_iso per i casi di scrittura; nota GRANT prerequisite scoperto in 04b
---

# Sprint 1 / 5 of 5 — Test di isolamento e verifica RLS

## Contesto

Ultimo sub-task dello Sprint 1. Schema applicato, tipi generati, client pubblico e client admin verificato pronti. Ora si **dimostra** che l'isolamento multi-tenant e le RLS funzionano davvero. È il gate di sicurezza prima di costruire feature sopra il DB: se l'isolamento non regge, tutto il resto è compromesso.

I "Done when" qui vengono direttamente dal runbook Phase 1 e dal backlog Sprint 1.

## File da leggere prima di iniziare

- `docs/build-delivery/runbook-implementazione.md` — sezione "Phase 1 — Data e Security Baseline", i criteri "Done when"
- `docs/operations/create_schema_from_template.sql` — sezione 4 (RLS policies): capire esattamente cosa è permesso a chi
- `docs/operations/audit_rls.sql` — creato nel sub-task 01
- `docs/tech-architecture/architettura-fullstack.md` — sezione Edge Functions (validazione schema, risposta 403)

## Scope

Creare una suite di test di isolamento riproducibile. Due livelli:

1. **Test SQL/RLS** in `docs/operations/` (es. `rls_isolation_tests.sql`) — query eseguibili in Supabase che verificano:
   - Lettura pubblica (anon) vede solo: `site_settings`, menu pubblico (`menu_sections/categories/items`), `time_slots`, `allergens`, `news_slides` — sola SELECT
   - `bookings`: INSERT anonimo permesso; SELECT/UPDATE/DELETE anonimi **rifiutati**
   - Scrittura su menu/site_settings da anon **rifiutata**
   - Per ogni caso, output atteso esplicito (PASS/FAIL)

2. **Test isolamento cross-tenant** — due livelli complementari:

   **2a. Verifica READ-ONLY contro tenant reali esistenti** (`alex_akashi`, `underclub`).
   Nel progetto Supabase esistono già due schemi tenant di clienti reali. Sono **off-limits per scrittura** ma vanno benissimo come fixture di sola lettura per dimostrare l'isolamento. Casi da coprire:
   - Client tenant configurato su `template` che tenta `SELECT` da una tabella di `alex_akashi` (es. via `from()` con schema cross-call, oppure via REST forzando `Accept-Profile: alex_akashi`): atteso fallimento (`42501` o "schema not bound").
   - Stesso scenario contro `underclub` per confermare che non è specifico di un singolo schema.
   - Tentativo di login admin con `user_metadata.schema = 'alex_akashi'` ma `owner_id` che non corrisponde a quella riga in `public.tenants`: atteso `signOut()` + redirect a `/?reason=tenant-mismatch` (è il flow del 04 / 04b).
   - **Vincolo non negoziabile:** zero INSERT/UPDATE/DELETE contro `alex_akashi` o `underclub`. Mai. I test che richiedono scrittura usano `test_iso` (vedi 2b).

   **2b. Schema usa-e-getta `test_iso` per i casi di scrittura.**
   Crea uno schema temporaneo `test_iso` (struttura minima: una sola tabella `dummy(id, owner_id)` con RLS attiva e un GRANT minimo replicato dal modello di `create_schema_from_template.sql` §3b), inserisce una riga, dimostra che un client `template`-bound non può leggerla né modificarla, poi `DROP SCHEMA test_iso CASCADE`. Lo step esecutivo SQL è manuale del master — la sub-chat produce lo script idempotente.

   Tutti gli script SQL vanno in `docs/operations/rls_isolation_tests.sql` (un solo file con sezioni etichettate `-- 2a` e `-- 2b`).

3. **Checklist verificabile** in coda al file di test: i 4 criteri "Done when" del runbook, ciascuno con come verificarlo.

## Vincoli

- I test SQL devono essere **read-only dove possibile**; dove serve un INSERT di prova (bookings su `template`, dummy su `test_iso`), usare dati chiaramente fittizi e ripulirli a fine test (transazione con `ROLLBACK` o `DELETE` esplicito).
- **Zero scritture su `alex_akashi` e `underclub`** — sono tenant di clienti reali. Solo SELECT, e solo per dimostrare l'isolamento.
- Non modificare le RLS policy né i GRANT esistenti: se un test fallisce, **segnalare** la discrepanza al master, non "aggiustare" lo schema in autonomia (decisione architetturale = master).
- `test_iso` va eliminato a fine test (`DROP SCHEMA test_iso CASCADE`). Lo script deve essere idempotente: se `test_iso` esiste già da un'esecuzione precedente non chiusa, droppare prima di ricreare.
- L'esecuzione su Supabase è manuale (master); la sub-chat produce gli script e la procedura.
- **Prerequisito DB (acquisito in 04b):** lo schema `template` ha già i GRANT per `anon/authenticated/service_role` (vedi voce *2026-05-21 — GRANT espliciti per i ruoli Supabase* nel decision-log). Se viene creato `test_iso`, replicare lo stesso pattern di GRANT, altrimenti i test falliranno con `42501` invece che con il vero motivo di isolamento.

## Output atteso

- `docs/operations/rls_isolation_tests.sql` con tre sezioni etichettate:
  - `-- 1. Public read / write permessi e negati su template` (anon)
  - `-- 2a. Cross-tenant READ-ONLY contro alex_akashi e underclub` (PASS = denied)
  - `-- 2b. Setup + test + teardown di test_iso` (PASS = denied + DROP a fine sezione)
- Ogni caso con un commento `-- PASS quando: ...` / `-- FAIL se: ...` esplicito.
- Procedura per il master in un commento in testa al file: prerequisiti, ordine di esecuzione, come interpretare l'output.
- Checklist dei 4 criteri "Done when" in coda al file (sotto forma di `-- [ ] criterio ...`).

## Done when

- Tentativi cross-tenant rifiutati (403 a livello app / nessuna riga a livello RLS)
- Public read vede solo i dati attesi (site_settings, menu pubblico, time_slots, allergens, news_slides)
- Booking INSERT anonimo funziona; UPDATE/DELETE anonimi rifiutati
- `getVerifiedTenantClient()` invalida la sessione se lo schema non corrisponde a `public.tenants`
- `audit_rls.sql` pulito (zero discrepanze) anche dopo i test (schema `test_iso` rimosso)

## Note per il master

1. Eseguire la suite su Supabase come service_role + un client anon di prova. Per le sezioni cross-tenant 2a/2b ricordarsi che PostgREST richiede lo schema target nella whitelist `PGRST_DB_SCHEMAS` (lesson learned 04b): `template`, `alex_akashi`, `underclub` sono già esposti; se viene creato `test_iso` per la 2b, va aggiunto temporaneamente alla whitelist + `docker compose up -d --force-recreate rest` per il test, poi rimosso al teardown.
2. Se un test FAIL: aprire una voce nel `decision-log/` o correggere `create_schema_from_template.sql`, poi ri-eseguire l'audit.
3. Suggerito: `/model claude-sonnet-4-6`, `/effort medium`. Scope chiuso (file SQL + procedura), nessuna decisione architetturale.
4. Commit: `test(rls): add tenant isolation and RLS verification suite`
5. Frontmatter → `status: DONE`. **Sprint 1 chiuso** → aggiornare `backlog.md` (criteri Done Sprint 1) e aprire Sprint 2 (service layer).
