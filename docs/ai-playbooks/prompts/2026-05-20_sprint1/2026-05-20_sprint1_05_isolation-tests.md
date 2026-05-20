---
status: DRAFT
updated: 2026-05-20
area: ai-playbooks
type: prompt
sprint: 1
order: 5
tags: [foras-mvp, sprint1, rls, security, testing]
owner: master-chat
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

2. **Test isolamento cross-tenant** — script (SQL o piccolo script node con due client su schemi diversi) che dimostra che una query lanciata con lo schema `template` non può leggere/scrivere dati di un altro schema, e che un accesso a uno schema non in `public.tenants` viene rifiutato (atteso 403 lato app via `getVerifiedTenantClient`).
   - Nota: se esiste un solo schema (`template`), creare uno schema di prova usa-e-getta (es. `test_iso`) per il test cross-tenant, poi eliminarlo. Documentare la procedura; l'esecuzione su DB è step manuale del master.

3. **Checklist verificabile** in coda al file di test: i 4 criteri "Done when" del runbook, ciascuno con come verificarlo.

## Vincoli

- I test SQL devono essere **read-only dove possibile**; dove serve un INSERT di prova (bookings), usare dati chiaramente fittizi e ripulirli a fine test (o usare una transazione con ROLLBACK).
- Non modificare le RLS policy: se un test fallisce, **segnalare** la discrepanza al master, non "aggiustare" lo schema in autonomia (decisione architetturale = master).
- Eventuale schema `test_iso` va eliminato a fine test (`DROP SCHEMA test_iso CASCADE`).
- L'esecuzione su Supabase è manuale (master); la sub-chat produce gli script e la procedura.

## Output atteso

- `docs/operations/rls_isolation_tests.sql` (o nome equivalente) con casi PASS/FAIL espliciti
- Procedura cross-tenant documentata (con setup/teardown di `test_iso`)
- Checklist dei 4 criteri "Done when" in fondo al file

## Done when

- Tentativi cross-tenant rifiutati (403 a livello app / nessuna riga a livello RLS)
- Public read vede solo i dati attesi (site_settings, menu pubblico, time_slots, allergens, news_slides)
- Booking INSERT anonimo funziona; UPDATE/DELETE anonimi rifiutati
- `getVerifiedTenantClient()` invalida la sessione se lo schema non corrisponde a `public.tenants`
- `audit_rls.sql` pulito (zero discrepanze) anche dopo i test (schema `test_iso` rimosso)

## Note per il master

1. Eseguire la suite su Supabase come service_role + un client anon di prova.
2. Se un test FAIL: aprire una voce nel `decision-log/` o correggere `create_schema_from_template.sql`, poi ri-eseguire l'audit.
3. Commit: `test(rls): add tenant isolation and RLS verification suite`
4. Frontmatter → `status: DONE`. **Sprint 1 chiuso** → aggiornare `backlog.md` (criteri Done Sprint 1) e aprire Sprint 2 (service layer).
