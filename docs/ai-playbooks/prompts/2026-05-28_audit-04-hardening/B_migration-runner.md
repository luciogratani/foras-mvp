---
status: DONE
sprint: post-audit-04
task: B
created: 2026-05-28
completed: 2026-05-28
commit: TBD
suggested_model: sonnet
suggested_effort: high
owner: master-chat
---

> **Esito (2026-05-28):** sub-chat Sonnet. Worktree branchato da `e406095` (pre-freeze, quirk dell'infra di isolamento) → la branch del worktree **non ha mai committato**: i file vivevano solo nel working dir del worktree. Salvataggio manuale del master nel main tree:
> - `scripts/migrate.sh` (~350 righe bash, executable; `bash -n` OK).
> - `docs/operations/migration-runbook.md`: sezione "Runner migrazioni" sostituisce il loop manuale dei vecchi step 4-5; aggiunti caveat ruolo `supabase_admin` per `template` (vedi gotcha in D) e procedura di backfill per migrazioni applicate manualmente.
>
> **DB live primed** (master, via SSH come `supabase_admin`): `public.tenant_migrations` creata; backfill `('template','001')` + `('template','002')` (la 002 era stata applicata manualmente nella cerimonia D del master prima del runner).
>
> Validazione semantica end-to-end del runner contro DB live: **non eseguita** (richiede risolvere la connessione `psql` come `supabase_admin` via socket dentro il container; rimandata al primo onboarding cliente, che è esattamente il primo uso reale del runner). Logica verificata via code review del master.

# B — Runner migrazioni idempotente (`scripts/migrate.sh`)

## Contesto

`foras-mvp` è multi-tenant via **schema-per-tenant** su un unico Postgres self-hosted (Supabase in Docker, raggiungibile solo via SSH + `docker exec`, non sulla 5432). Oggi ogni modifica di schema è un file numerato in `/migrations` applicato **a mano, schema per schema** (`docs/operations/migration-runbook.md`). L'audit interno ha segnalato questa propagazione manuale O(n) come un rischio reale appena ci sono >1 tenant. Sostituisci "ripeti a mano per ogni cliente" con un **runner idempotente + tabella di tracking per-tenant** — senza adottare un framework pesante (il progetto rifiuta esplicitamente Flyway/Sqitch a questa scala).

## File da leggere prima di iniziare

- `docs/operations/migration-runbook.md` — flusso manuale corrente, convenzione `/migrations/NNN_name.sql`, comando SSH+`docker exec`, rationale "why not an automatic tool" (rispettalo — resta leggero).
- `migrations/001_init.sql` — baseline. IMPORTANTE: 001 è un **pointer** al provisioner `docs/operations/create_schema_from_template.sql`, **non** è un ALTER reale. Il runner deve gestirlo correttamente (trattare 001 come baseline già stabilita dal provisioner — non ri-eseguirlo come ALTER).
- `migrations/002_bookings_overbooking_trigger.sql` — una migrazione **reale** appena aggiunta da un teammate: crea una FUNCTION plpgsql (corpo dollar-quoted, multi-statement) + un TRIGGER. Il runner DEVE applicare un file simile come **unica unità transazionale**. Usalo come fixture di prova.
- `docs/operations/create_schema_from_template.sql` — come nasce uno schema tenant; il registry globale è `public.tenants(schema_name, owner_id, ...)`; le migrazioni vanno applicate con `SET search_path = <schema>`.
- `docs/operations/onboarding-tenant.md` per il contesto operativo.

## Scope

### 1. Tracking table

`public.tenant_migrations(schema_name text NOT NULL, version text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (schema_name, version))`, bootstrap idempotente dal runner stesso (`CREATE TABLE IF NOT EXISTS`).

### 2. Runner

Script in **bash + `psql`** (coerente con lo stile `psql -v` dell'onboarding A2, **NON** un tool node — il repo non ha deps JS per runner). Posizione: `scripts/migrate.sh` (crea `scripts/`). Comportamento:

- Connessione via un unico `psql` conninfo (env `DATABASE_URL`, overridable), così funziona sia in locale sia attraverso SSH+`docker exec`.
- Enumera gli schemi target da `public.tenants.schema_name`. Flag per includere `template` e/o targetare un singolo schema.
- Per ogni schema, per ogni `/migrations/NNN_*.sql` (numerico ascendente) **non** già in `public.tenant_migrations` per quello schema: esegui il file **dentro una singola transazione** con `SET search_path = <schema>` prependato; poi inserisci la riga `(schema_name, version)`; commit per migrazione. **STOP al primo errore** (la transazione fallita rollbacka pulita).
- Salta opportunamente il pointer `001` (seed come già-applicato, o escludi i pointer files — documenta la regola).
- Idempotente / re-eseguibile: un secondo run non applica nulla.
- Logging chiaro per-schema: applied / skipped / failed.

### 3. Aggiorna `docs/operations/migration-runbook.md`

Documenta il runner come nuovo passo principale (sostituisce il loop manuale negli step 4-5), tenendo il comando `docker exec` come fallback documentato. Aggiungi la tabella `public.tenant_migrations` + una nota di backfill per migrazioni già-applicate (es. come marcare 002 come applicata su `template` se è stata applicata a mano prima).

## Vincoli

- **Non** modificare `schema.sql` o struttura tabelle del tenant; `public.tenant_migrations` è un nuovo oggetto globale creato dal runner stesso, non dal provisioner.
- Tieni tutto leggero e leggibile — niente framework di migrazione.

## Done when

- `bash -n` (e se disponibile `shellcheck`) sullo script. Se Docker è disponibile localmente, spinning di un `postgres:15.8` usa-e-getta, creazione `public.tenants` + 2 schemi dummy e prova con `migrations/002_*.sql`: primo run applica + tracking; secondo run no-op; migrazione volutamente fallibile → stop pulito, nessuna riga di tracking.

## Note di esecuzione per la sub-chat

- **Non** puoi raggiungere il DB live (è dietro SSH, master-only). Rendi lo script self-contained e parametrizzato; "non posso eseguire dal vivo" non è un blocco.
- Reporta nel summary: file aggiunti/modificati, comando esatto per eseguire il runner via SSH+`docker exec`, come sono gestiti i pointer files e migrazioni già-applicate, cosa hai verificato vs cosa no.
