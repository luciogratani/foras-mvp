# Migration runbook

Procedura per gestire le modifiche allo schema PostgreSQL dopo il congelamento del template. Valida sia per modifiche strutturali che per aggiornamenti alle RLS policies.

---

## Quando eseguire una migrazione

Ogni modifica allo schema di un tenant attivo — aggiunta di colonne, nuove tabelle, modifica di indici o modifica di una RLS policy — va gestita come migrazione formale. Non si modificano schemi attivi tramite il dashboard Supabase senza uno script corrispondente.

**Regola per le RLS:** ogni modifica a una RLS policy viene trattata esattamente come una modifica strutturale. Va scritta in uno script numerato e applicata a tutti gli schemi esistenti.

---

## Struttura dei file

```
/migrations
    001_init.sql              ← baseline (FROZEN 2026-05-27) — pointer al provisioner
    002_bookings_overbooking_trigger.sql  ← prima migrazione reale (trigger anti-overbooking)
    NNN_<descrizione>.sql                 ← migrazioni successive (ALTER numerati, per-schema)
schema.sql                    ← fotografia strutturale congelata, aggiornata dopo ogni migrazione
CHANGELOG.md                  ← registro human-readable delle modifiche
```

> **Baseline 001 (freeze 2026-05-27).** `migrations/001_init.sql` **non duplica** lo schema: rimanda al provisioner canonico parametrizzato `docs/operations/create_schema_from_template.sql` (crea schema + tabelle + RLS owner-scope + GRANT + seed + bootstrap globale `public.tenants`/`is_tenant_owner`). `schema.sql` (root) è la fotografia strutturale congelata di un tenant (generata via `pg_dump --schema-only`, validata identica a `template` dall'audit). Dal **002** in poi: `ALTER` numerati applicati a ogni schema tenant.

---

## Convenzione per ogni script

```sql
-- 002_add_og_image.sql
-- Aggiunge og_image a site_settings
-- Data: YYYY-MM-DD | Applicare a: tutti i clienti esistenti

ALTER TABLE site_settings ADD COLUMN og_image TEXT;
```

Ogni script deve:
- Avere un numero progressivo nel nome
- Contenere un commento di intestazione con descrizione, data e destinatari
- Essere idempotente dove possibile (es. `ADD COLUMN IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION`, `DROP ... IF EXISTS`)
- **NON aprire transazioni esplicite** (no `BEGIN;`/`COMMIT;`) né DDL non-transazionali (`CREATE INDEX CONCURRENTLY`, `VACUUM`, ecc.): il runner `scripts/migrate.sh` wrappa già ogni file in `BEGIN; SET LOCAL search_path; <file>; INSERT tracking; COMMIT;`. Una `COMMIT` annidata o un DDL non-transazionale farebbe sballare il wrapper o impedirebbe il rollback al primo errore.

---

## Flusso di lavoro

1. Scrivere lo script numerato in `/migrations`
2. Aggiornare `schema.sql` per riflettere lo stato corrente
3. Aggiungere una riga in `CHANGELOG.md` con numero, data e descrizione
4. Applicare via il runner — vedi **Runner migrazioni** sotto. (Fallback manuale documentato lì.)

---

## Runner migrazioni — `scripts/migrate.sh`

Sostituisce il loop manuale per-schema. **Idempotente e re-eseguibile**: un secondo run produce solo righe `SKIP`, zero scritture al DB.

**Cosa fa:**
- Bootstrap `public.tenant_migrations(schema_name, version, applied_at)` con `CREATE TABLE IF NOT EXISTS`.
- Legge gli schemi da `public.tenants`. Flag: `--template` per includere `template`, `--schema <nome>` per uno solo, `--dry-run` per anteprima.
- Per ogni schema, per ogni `/migrations/NNN_*.sql` non ancora tracciato: `BEGIN; SET LOCAL search_path = <schema>; <contenuto file>; INSERT public.tenant_migrations; COMMIT;` con `ON_ERROR_STOP=1`. Fail-fast al primo errore (rollback automatico, nessuna riga di tracking).
- `001_init.sql` è il pointer-baseline: marcato come applicato (`ON CONFLICT DO NOTHING`) senza essere eseguito.

**Esecuzione locale** (psql sul PATH):
```bash
DATABASE_URL="postgres://..." bash scripts/migrate.sh --template
```

**Esecuzione live via SSH + `docker exec`:**
```bash
scp -r migrations scripts root@<server>:/tmp/foras/
ssh root@<server> "docker exec \
  -e DATABASE_URL='postgres://supabase_admin@/postgres?host=/var/run/postgresql' \
  -e MIGRATIONS_DIR=/tmp/foras/migrations \
  supabase-db bash /tmp/foras/scripts/migrate.sh --template"
```

### ⚠️ Ruolo di connessione (gotcha su questo DB self-hosted)

Lo schema `template` è stato creato da Studio → di proprietà di `supabase_admin`. Connettersi come `postgres` per applicare migrazioni a `template` fallisce con `permission denied for schema template`. **Per `--template` connettersi come `supabase_admin`.** Gli schemi cliente provisionati dal provisioner come `postgres` sono `postgres`-owned → `postgres` funziona per `--schema <cliente>`. Vedi anche il *Gotcha ruoli* in `docs/ai-playbooks/workflow-master-sub.md`.

### Backfill — migrazioni già applicate manualmente

Se una migrazione è stata applicata prima dell'introduzione del runner (es. la 002 al `template` durante la cerimonia D del 2026-05-28), va registrata per evitare ri-esecuzione:
```sql
INSERT INTO public.tenant_migrations (schema_name, version) VALUES
  ('template', '001'),
  ('template', '002')
ON CONFLICT (schema_name, version) DO NOTHING;
```
Questo stato di partenza è stato seedato sul DB live il 2026-05-28.

### Fallback manuale (uso eccezionale)

Per un'applicazione one-off senza passare dal runner:
```bash
cat migrations/NNN_*.sql | ssh root@<server> \
  "docker exec -i supabase-db psql -U supabase_admin -d postgres -v ON_ERROR_STOP=1 -c 'SET search_path = <schema>' -f -"
```
Nota: il fallback **NON aggiorna** `public.tenant_migrations` — fare il backfill come sopra.

---

## Propagazione modifiche RLS

Le RLS policies sono identiche su tutti gli schemi ma vanno applicate manualmente su ognuno. Una policy corretta su un schema non si propaga automaticamente agli altri.

**Procedura:**
1. Identificare la policy da modificare
2. Scrivere uno script di migrazione numerato (es. `003_fix_rls_bookings.sql`)
3. Applicare lo script su tutti gli schemi esistenti, uno per uno
4. Aggiornare `schema.sql` e `CHANGELOG.md`

**Esempio:**

```sql
-- 003_fix_rls_bookings.sql
-- Corregge la policy di lettura admin su bookings (pattern owner-scope, post-A1)
-- Data: YYYY-MM-DD | Applicare a: tutti i clienti esistenti

DROP POLICY IF EXISTS "bookings_admin_select" ON bookings;
CREATE POLICY "bookings_admin_select"
ON bookings FOR SELECT
USING (public.is_tenant_owner());
```

---

## Rollback

Non esiste un meccanismo automatico di rollback. In caso di errore:

1. Scrivere uno script di rollback manuale (es. `002_rollback_add_og_image.sql`) che inverte la modifica
2. Applicarlo su tutti gli schemi interessati
3. Registrarlo nel `CHANGELOG.md` con nota di rollback

---

## Script di audit RLS — verifica allineamento tra schemi

Dopo ogni migrazione che tocca RLS, eseguire questo script per verificare che tutti gli schemi tenant abbiano lo stesso set di policies. Individua le discrepanze prima che diventino un problema di sicurezza.

→ versione finale: `docs/operations/audit_rls.sql`

```sql
-- audit_rls.sql
-- Confronta le RLS policies su tutti gli schemi tenant registrati in public.tenants
-- con lo schema di riferimento (di default 'template').
-- Output: righe presenti in un solo schema → indicano una discrepanza da correggere.
--
-- Uso:
--   \i docs/operations/audit_rls.sql
-- oppure eseguire dal Supabase SQL editor (con service_role).

WITH reference_schema AS (
  -- Cambiare 'template' con il nome dello schema di riferimento se diverso
  SELECT 'template' AS schema_name
),

all_tenant_schemas AS (
  SELECT schema_name FROM public.tenants
  UNION
  SELECT schema_name FROM reference_schema
),

policies_per_schema AS (
  SELECT
    n.nspname   AS schema_name,
    c.relname   AS table_name,
    p.polname   AS policy_name,
    CASE p.polcmd
      WHEN 'r' THEN 'SELECT'
      WHEN 'a' THEN 'INSERT'
      WHEN 'w' THEN 'UPDATE'
      WHEN 'd' THEN 'DELETE'
      ELSE 'ALL'
    END         AS command
  FROM pg_policy p
  JOIN pg_class  c ON c.oid = p.polrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname IN (SELECT schema_name FROM all_tenant_schemas)
),

reference_policies AS (
  SELECT table_name, policy_name, command
  FROM policies_per_schema
  WHERE schema_name = (SELECT schema_name FROM reference_schema)
),

discrepancies AS (
  -- Policy presente nel riferimento ma assente in almeno uno schema tenant
  SELECT
    t.schema_name,
    r.table_name,
    r.policy_name,
    r.command,
    'MANCANTE nello schema tenant' AS problema
  FROM reference_policies r
  CROSS JOIN all_tenant_schemas t
  WHERE t.schema_name != (SELECT schema_name FROM reference_schema)
    AND NOT EXISTS (
      SELECT 1 FROM policies_per_schema p
      WHERE p.schema_name = t.schema_name
        AND p.table_name  = r.table_name
        AND p.policy_name = r.policy_name
        AND p.command     = r.command
    )

  UNION ALL

  -- Policy presente in uno schema tenant ma assente nel riferimento
  SELECT
    p.schema_name,
    p.table_name,
    p.policy_name,
    p.command,
    'EXTRA rispetto al riferimento' AS problema
  FROM policies_per_schema p
  WHERE p.schema_name != (SELECT schema_name FROM reference_schema)
    AND NOT EXISTS (
      SELECT 1 FROM reference_policies r
      WHERE r.table_name  = p.table_name
        AND r.policy_name = p.policy_name
        AND r.command     = p.command
    )
)

SELECT * FROM discrepancies
ORDER BY schema_name, table_name, policy_name;

-- Se la query non restituisce righe: tutti gli schemi sono allineati.
-- Se restituisce righe: ogni riga è una discrepanza da correggere con una migrazione.
```

**Quando eseguirlo:** dopo ogni migrazione RLS, e come check periodico prima di onboardare un nuovo cliente.

---

## Perché non un tool automatico

Per la scala di questo progetto (pochi clienti, modifiche rare), tool come Flyway o le Supabase migrations automatizzate aggiungono complessità senza benefici reali. Il flusso manuale con script numerati è sufficiente e leggibile.

**Trigger per riconsiderare:** numero di clienti attivi oltre 5-6, oppure frequenza di migrazioni superiore a una alla settimana.
