---
status: DONE
updated: 2026-05-20
area: ai-playbooks
type: prompt
sprint: 1
order: 1
tags:
  - foras-mvp
  - sprint1
  - db
  - rls
  - sql
owner: master-chat
---

# Sprint 1 / 1 of 5 — audit_rls.sql + applicazione schema `template`

## Contesto

Sprint 0 è chiuso (monorepo + apps + packages scaffoldati, smoke test Supabase ok). Sprint 1 porta online lo schema dati. Questo primo sub-task ha due obiettivi: (a) **finalizzare lo script `audit_rls.sql`** — oggi esiste solo come bozza incollata dentro `migration-runbook.md`, va estratto in un file vero; (b) preparare e documentare l'applicazione di `create_schema_from_template.sql` sullo schema `template`.

L'esecuzione effettiva dello SQL su Supabase è uno **step manuale del master** (richiede service_role nel SQL editor): la sub-chat **non** ha accesso al DB. La sub-chat produce e finalizza i file SQL e le istruzioni; il master li esegue.

## File da leggere prima di iniziare

- `docs/operations/create_schema_from_template.sql` — schema completo, RLS, seed (già esistente, da NON riscrivere)
- `docs/operations/migration-runbook.md` — sezione "Script di audit RLS" (righe ~95 in poi): contiene la bozza di `audit_rls.sql` da estrarre e completare
- `docs/tech-architecture/data-model.md` — per verificare che le tabelle nello script corrispondano al modello
- `docs/tech-architecture/architettura-fullstack.md` — sezioni "Multi-tenancy" e "Auth — validazione schema al login" (per capire il modello RLS anonimo vs admin)

## Scope

1. **Creare `docs/operations/audit_rls.sql`** estraendo e completando la bozza presente in `migration-runbook.md`. Lo script deve:
   - Confrontare le RLS policies di tutti gli schemi in `public.tenants` con lo schema di riferimento `template`
   - Restituire le **discrepanze** (policy presenti in uno schema e non nell'altro), table_name + policy_name + command
   - Restituire anche un check "RLS abilitata su tutte le tabelle attese" (tabelle senza `rowsecurity = true` → segnalate)
   - Essere eseguibile sia con `\i` da psql sia da Supabase SQL editor (service_role)
   - Avere commenti d'uso in testa

2. **Aggiornare i riferimenti incrociati**: nei file che citano `scripts/audit_rls.sql` (vedi `create_schema_from_template.sql` riga ~261 e `migration-runbook.md`), correggere il path al reale `docs/operations/audit_rls.sql`. NON spostare/duplicare la bozza dentro migration-runbook: lasciarla lì come riferimento storico, ma aggiungere una riga "→ versione finale: `docs/operations/audit_rls.sql`".

3. **Scrivere un blocco istruzioni** (in fondo a questo prompt come output, NON in un nuovo file) per lo step manuale del master:
   - Come impostare `target_schema = 'template'` e `owner_uuid` in `create_schema_from_template.sql`
   - Prerequisito: l'utente admin del template deve già esistere in `auth.users` con `user_metadata.schema = 'template'` (il suo UUID diventa l'`owner_uuid`)
   - Sequenza: crea utente admin → esegui create_schema → esegui audit_rls.sql → verifica zero discrepanze

## Vincoli

- **Non modificare** `create_schema_from_template.sql` salvo la correzione del path di riferimento all'audit (riga ~261).
- Non eseguire SQL: la sub-chat non ha connessione DB. Solo produzione file + istruzioni.
- `audit_rls.sql` deve essere idempotente e read-only (solo SELECT/CTE, nessun ALTER/CREATE).
- Niente dipendenze da estensioni non standard: usare solo `pg_policy`, `pg_class`, `pg_namespace`, `pg_tables`.

## Output atteso

- `docs/operations/audit_rls.sql` completo e read-only
- Riferimenti al path corretti negli altri doc
- Blocco istruzioni per l'esecuzione manuale del master (nel messaggio finale della sub-chat)

## Done when

- `audit_rls.sql` esiste, è read-only, e restituisce sia discrepanze policy sia tabelle senza RLS
- Eseguito dal master su `template` (unico schema esistente), l'audit non riporta discrepanze e conferma RLS attiva su tutte e 8 le tabelle
- Tutti i riferimenti `scripts/audit_rls.sql` puntano al path reale

## Note per il master (step manuali, NON delegabili alla sub-chat)

1. In Supabase Auth: creare l'utente admin del template con `user_metadata.schema = 'template'`. Annotarne l'UUID.
2. In `create_schema_from_template.sql`: impostare `\set target_schema 'template'` e `\set owner_uuid '<UUID-admin>'`.
3. Eseguire lo script come service_role (SQL editor o psql).
4. Eseguire `docs/operations/audit_rls.sql` → atteso: zero discrepanze, RLS attiva ovunque.
5. Commit: `feat(db): finalize audit_rls.sql and apply template schema`
6. Frontmatter → `status: DONE`. Procedere al sub-task 02 (tipi TS).
