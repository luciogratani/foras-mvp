---
status: DONE
sprint: 6
stream: A
task: A2
created: 2026-05-25
completed: 2026-05-27
commit: 5ad19e9
suggested_model: claude-sonnet-4-6
suggested_effort: high
owner: master-chat
---

> **DONE 2026-05-27 (commit `5ad19e9`).** Implementato da subchat sonnet/high, revisionato e committato dal master. `create_schema_from_template.sql` parametrizzato con `psql -v` (`:"schema"` identificatori, `:'schema'`/`:'owner_uuid'` literal; `public.is_tenant_owner()`/`public.tenants` lasciati letterali; guard `\if :{?schema}`/`:{?owner_uuid}`). Nuovi `2026-05-27_onboard_smoketest.sql` (12 verifiche read-only) e `2026-05-27_onboard_cleanup.sql` (distruttivo, `onboard_test` hardcoded). `onboarding-tenant.md` Step 1 allineato. **Verificato da Lucio via psql (SSH sul server self-hosted, `psql -h 127.0.0.1 -U postgres`):** crea `onboard_test` ok (warning benigno su `is_tenant_owner` già esistente — `CREATE OR REPLACE` idempotente), smoke 12/12 ok, audit cross-schema 0 discrepanze, cleanup `schema_exists=0`/`tenant_row_exists=0`. **Nota operativa:** Supabase self-hosted non espone 5432 → onboarding/test via SSH+psql sul server.

# Sprint 6 / A2 — Parametrizzazione dello script di onboarding + test su schema usa-e-getta

> **Dipendenze:** eseguire **dopo** A1 (policy hardened con `is_tenant_owner()`) e A1b (se l'opzione A aggiunge la colonna `timezone`), così la parametrizzazione cattura lo stato finale del baseline. La baseline è già stata ri-allineata il 2026-05-25 (migration schema-extras ripiegata: `site_settings` extras + `closed_dates.end_date`).
>
> **MECCANISMO DECISO (Lucio, 2026-05-25): variabili `psql -v`.** Vedi `decision-log/decisioni.md` voce *Freeze Stream A: parametrizzazione onboarding*. Implementa **solo** questa via (lo script resta DDL statico leggibile). L'alternativa "funzione `plpgsql` con SQL dinamico" è scartata — non implementarla. Conseguenza: l'onboarding si esegue da terminale (`psql`), non dal Supabase SQL editor.

## Contesto

`docs/operations/create_schema_from_template.sql` crea lo schema di un tenant, ma è **hardcoded sullo schema `template`** (e sull'owner UUID del template), nonostante l'header e `onboarding-tenant.md` promettano `psql -v schema=bar_rossi`. Per onboardare clienti reali serve renderlo riusabile per un qualsiasi `(schema, owner_uuid)` e **testarlo** creando uno schema usa-e-getta, verificandolo con l'audit, e distruggendolo. Buona notizia: dopo `SET search_path = <schema>` quasi tutto il corpo (DDL tabelle, RLS, policy, seed) è già **relativo al search_path** → i punti da parametrizzare sono pochi e concentrati.

## File da leggere prima di iniziare

- `docs/operations/create_schema_from_template.sql` — i ~14 punti con il literal `template`: `CREATE SCHEMA` + `SET search_path` (righe 40–41); il blocco GRANT/`ALTER DEFAULT PRIVILEGES` (§3b, righe 190–205, gli unici DDL che richiedono il nome schema esplicito); la `INSERT INTO public.tenants` con owner hardcoded (riga ~325). Il resto (§2 tabelle, §3 RLS enable, §4 policy, §5 seed) è search_path-relativo → non va parametrizzato.
- `docs/operations/audit_rls.sql` — legge `public.tenants` e confronta ogni schema con `template`; lo userai per validare lo schema di test (`expected_tables` è già a 9, `closed_dates` inclusa).
- `docs/operations/onboarding-tenant.md` — Step 1 documenta l'invocazione attesa (`-v schema=`, `-v owner_uuid=`): allinealo alla forma finale.
- `docs/operations/rls_isolation_tests.sql` — pattern dei test (per la sezione di verifica sullo schema usa-e-getta).

## Scope

### 1. Parametrizzare lo script (meccanismo raccomandato: `psql -v`)

- Sostituire il literal schema con la variabile psql, distinguendo i due usi:
  - **identificatore** (in `CREATE SCHEMA`, `SET search_path`, GRANT, `ALTER DEFAULT PRIVILEGES`, `template.bookings`): usare `:"schema"` (quoting identifier, doppi apici).
  - **stringa** (nella `INSERT INTO public.tenants (schema_name, ...) VALUES (...)`): usare `:'schema'` (quoting literal, apici singoli).
  - owner: `:'owner_uuid'::uuid`.
- Aggiungere in testa un guard utile: `\if :{?schema}` … (o un commento chiaro) per fallire presto se le variabili non sono passate.
- Aggiornare l'header dello script con l'uso reale e rimuovere la nota "⚠️ schema e owner già impostati per template".
- **Mantenere uno snippet per ricreare il `template` stesso** (es. `-v schema=template -v owner_uuid=1c486961-12b2-47d0-8aef-0aee30df083c`) documentato nell'header, così il template resta ricreabile in modo identico.

> **Caveat operativo (accettato nella decisione):** le variabili `:var` funzionano in `psql`, **non** nel Supabase SQL editor. L'onboarding è quindi un'operazione da CLI (`psql $DATABASE_URL -v schema=... -v owner_uuid=... -f ...`), eseguita dal master/dev. Va bene così: è un'operazione rara. (L'alternativa "funzione `plpgsql` con SQL dinamico", che girava nel SQL editor, è stata scartata per non rendere lo script verboso.)

### 2. Test su schema usa-e-getta

Aggiungere uno script/sezione di verifica (es. `docs/operations/2026-05-XX_onboard_smoketest.sql` o istruzioni nel report) che il master esegue:
1. Crea uno schema di prova (es. `:schema = onboard_test`, owner = un UUID auth reale o quello del template).
2. Esegue l'audit `audit_rls.sql` → deve riportare **zero discrepanze** per `onboard_test` (stesse policy e RLS del `template`, GRANT inclusi se A1 ha esteso l'audit).
3. Verifica rapida: lo schema ha le 9 tabelle, il seed (14 allergeni, 6 sezioni, 2 time_slots, riga site_settings), e `public.tenants` ha la riga.
4. **Cleanup:** `DROP SCHEMA onboard_test CASCADE;` + `DELETE FROM public.tenants WHERE schema_name='onboard_test';`. Lo script di cleanup va fornito esplicitamente e marcato come distruttivo.

## Vincoli

- **Idempotenza dove sensata** (`CREATE TABLE IF NOT EXISTS`, `CREATE SCHEMA IF NOT EXISTS`) — ma attenzione: ri-eseguire su uno schema già seedato duplica i seed. Documentare che lo script è pensato per uno schema **nuovo**.
- **Zero scritture su `template`, `alex_akashi`, `underclub`** durante i test — usare solo `onboard_test`.
- L'esecuzione reale (psql o SQL editor) la fa **il master**: tu produci gli script e documenti come interpretarli.
- Non cambiare la struttura delle tabelle/policy (è il lavoro di A1/A1b, già dentro il baseline) — A2 tocca **solo** la parametrizzazione + il test.
- Coerenza con `onboarding-tenant.md` (Step 1) e con il futuro `schema.sql`/`001_init.sql` (A4).

## Output atteso

- `create_schema_from_template.sql` parametrizzato (meccanismo confermato dal master) + header aggiornato.
- Script di smoke-test onboarding + script di cleanup distruttivo, con commenti d'interpretazione.
- `onboarding-tenant.md` Step 1 allineato alla forma finale.

## Done when

- Lo script crea un tenant arbitrario `(schema, owner)`; con `onboard_test` l'audit RLS riporta **zero discrepanze** vs `template`; le 9 tabelle + seed + riga `public.tenants` ci sono; il cleanup rimuove tutto.
- Il `template` resta ricreabile in modo bit-compatibile con l'invocazione documentata.
- Nessuna modifica residua a `template` dopo i test.

## Report finale (conciso)

(1) Meccanismo usato e perché. (2) File modificati/creati. (3) Punti parametrizzati (elenco). (4) Esito del test `onboard_test` (audit zero righe? tabelle/seed ok?) come riportato dal master, o le istruzioni precise se non eseguito. (5) Dubbi.
