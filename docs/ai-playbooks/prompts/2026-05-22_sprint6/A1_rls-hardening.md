---
status: DONE
sprint: 6
stream: A
task: A1
created: 2026-05-22
reviewed: 2026-05-25
completed: 2026-05-27
commit: 887df1b
suggested_model: opus
suggested_effort: high
owner: master-chat
---

> **DONE 2026-05-27 (commit `887df1b`).** Implementato da subchat (opus/high), revisionato e committato dal master. Eseguito da Lucio nel SQL editor: hardening applicato al `template`, `audit_rls.sql` pulito (0 righe su tutte e 3 le query), `rls_isolation_tests.sql` Sezione 3 con 3.1–3.4 tutti PASS. **Quirk:** la suite di test va eseguita per sezioni — il run "in blocco" fallisce su `CREATE SCHEMA test_iso` (§2b) con `42501 permission denied for database postgres` a causa di un ruolo non-privilegiato residuo (comportamento pre-esistente del file, non introdotto da A1).

> **Nota di revisione (master, 2026-05-25).** Prompt rivisto contro lo stato reale dello schema. Aggiornamenti rispetto alla stesura del 2026-05-22: (1) le policy di scrittura sono **10, non 9** — è stata aggiunta `closed_dates_admin_all` (intermezzo UX-fix C2); (2) la baseline `create_schema_from_template.sql` è stata ri-allineata il 2026-05-25 (ripiegata la migration schema-extras: `site_settings.extra_data/social_*/maintenance_mode`, `closed_dates.end_date`+CHECK) → lo script che leggi è **attuale**; (3) `audit_rls.sql` ha già `expected_tables` a **9 tabelle** (`closed_dates` inclusa) → in questo task lo estendi solo con i check GRANT + helper, **non** ritoccare la lista tabelle. Il resto del prompt (funzione `is_tenant_owner`, gotcha `current_schema()`, test JWT) resta valido e verificato.

# Sprint 6 / A1 — Hardening RLS scrittura (owner vs `public.tenants`) + estensione audit ai GRANT

## Contesto

`foras-mvp` è un sistema multi-tenant: ogni cliente bar ha uno schema PostgreSQL isolato su un singolo progetto Supabase **condiviso** (`auth.users` e `public` sono globali di progetto). Stiamo aprendo **Sprint 6 — template freeze + onboarding del primo cliente reale**: prima di congelare lo schema `template` (da cui ogni nuovo tenant viene clonato) dobbiamo chiudere un debito di sicurezza noto.

**Il problema.** Le policy RLS di **scrittura** admin usano oggi `auth.uid() IS NOT NULL` ("qualsiasi utente autenticato"). Poiché `auth.users` è condiviso, questo NON isola le scritture: un qualunque utente autenticato (anche admin di un altro tenant, o di un progetto personale che condivide lo stesso `auth.users`) passerebbe la policy su qualsiasi schema tenant esposto in PostgREST. L'isolamento in scrittura oggi regge solo a livello applicativo (`getVerifiedTenantClient`), non a livello DB. Con dati di clienti reali in arrivo (GDPR), va chiuso a livello RLS.

**La decisione (presa dal master con Lucio, 2026-05-22 — vedi `decision-log/decisioni.md`):** legare ogni scrittura admin all'owner registrato in `public.tenants`, verificato tramite una funzione `public.is_tenant_owner()` `SECURITY DEFINER`. Questo entra nel **baseline congelato** (ogni nuovo tenant nasce hardened) e va applicato anche al `template` esistente.

Questo task è **solo SQL/sicurezza** (più l'estensione dell'audit). Il fix timezone e la parametrizzazione dello script sono task gemelli separati (A1b, A2) — **non rientrano in questo scope**.

## File da leggere prima di iniziare

- `docs/decision-log/decisioni.md` — voci **2026-05-22 — Hardening RLS scrittura** (la decisione che stai implementando) e **2026-05-20 — Hardening RLS scrittura** (il debito originale). Leggi anche **2026-05-21 — GRANT espliciti per i ruoli Supabase** (perché i GRANT sono il complemento obbligatorio delle RLS).
- `docs/operations/create_schema_from_template.sql` — lo script baseline. §3 (RLS enable), §3b (GRANT), §4 (policies — è qui che intervieni), §0 (tabella `public.tenants`). **Nota:** lo script oggi è hardcoded sullo schema `template` — va bene così per questo task, la parametrizzazione è A2.
- `docs/operations/rls_isolation_tests.sql` — la suite di test esistente (sezioni 1, 2a, 2b). Studia **come simula i ruoli**: `SET LOCAL ROLE anon/authenticated`. Nota che nel SQL editor **non c'è JWT** → `auth.uid()` = NULL. Devi estenderla con una sezione che simula un JWT con `sub` specifico (vedi sotto).
- `docs/operations/audit_rls.sql` — l'audit attuale (controlla solo `rowsecurity` + presenza policy, **non** i GRANT). Lo estendi.
- `docs/tech-architecture/data-model.md` § `public.tenants` — `schema_name TEXT PK`, `owner_id UUID NOT NULL REFERENCES auth.users(id)`.

## Scope

Tre deliverable, tutti SQL:

### 1. Funzione helper `public.is_tenant_owner()`

Da aggiungere a `create_schema_from_template.sql` (nuova sotto-sezione, es. §3c, **prima** delle policy §4) e allo script di applicazione al template (deliverable 2).

```sql
CREATE OR REPLACE FUNCTION public.is_tenant_owner()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenants
    WHERE schema_name = current_schema()
      AND owner_id    = auth.uid()
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_tenant_owner() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.is_tenant_owner() TO authenticated, service_role;
```

### 2. Riscrittura delle policy di scrittura

In `create_schema_from_template.sql` §4, sostituire `auth.uid() IS NOT NULL` con `public.is_tenant_owner()` in **tutte e 10** le policy admin (le 7 `*_admin_all` + le 3 `bookings_admin_*`):
`menu_sections_admin_all`, `menu_categories_admin_all`, `menu_items_admin_all`, `time_slots_admin_all`, `closed_dates_admin_all`, `site_settings_admin_all`, `news_slides_admin_all`, `bookings_admin_select`, `bookings_admin_update`, `bookings_admin_delete`.

> ⚠️ **Verificato 2026-05-25:** sono **10** policy. `closed_dates_admin_all` (riga ~268 della baseline) è la decima — assente nella prima stesura di questo prompt perché `closed_dates` è stata introdotta dopo (UX-fix C2). Controlla a vista che non ne siano comparse altre `*_admin_all` rispetto a questo elenco prima di procedere.

**Le policy `*_public_read` (FOR SELECT USING (true)) e `bookings_public_insert` (FOR INSERT WITH CHECK (true)) NON si toccano** — la lettura pubblica e l'insert anonimo di prenotazioni devono restare invariati. (Ricorda: PostgreSQL combina in OR le policy per lo stesso comando → la SELECT resta pubblica perché `true OR is_tenant_owner()`; INSERT/UPDATE/DELETE hanno solo la policy admin → richiedono owner.)

Inoltre crea un nuovo script idempotente **`docs/operations/2026-05-22_rls_hardening_template.sql`** che applica helper + drop/recreate delle **10** policy **allo schema `template` già esistente** (Lucio lo eseguirà come `service_role` nel SQL editor). Idempotente: `CREATE OR REPLACE FUNCTION`, `DROP POLICY IF EXISTS … ; CREATE POLICY …`. Header con descrizione, data, "Applicare a: template (pre-freeze)". (Nota: lo script aggiorna solo le policy di scrittura — la lettura pubblica e l'insert anon restano invariate; non serve droppare le `*_public_read`.)

### 3. Estensione `audit_rls.sql` ai GRANT + presenza helper

Aggiungere allo script (senza rompere il check esistente sulle discrepanze di policy):
- un check dei **GRANT minimi** attesi sui ruoli Supabase per ogni schema tenant: `USAGE` su schema per `anon`/`authenticated`/`service_role`; `SELECT` tabelle per `anon`/`authenticated`; `INSERT` su `bookings` per `anon`; `INSERT/UPDATE/DELETE` per `authenticated`. Usa `has_schema_privilege(...)` / `has_table_privilege(...)`. Output: righe per ogni GRANT atteso **mancante**.
- un check che `public.is_tenant_owner()` esista e sia `SECURITY DEFINER` (`prosecdef = true` in `pg_proc`).

### 4. Nuova sezione nei test di isolamento

Aggiungi a `rls_isolation_tests.sql` una **Sezione 3 — Owner-scoped write hardening** che simula il JWT (nel SQL editor non c'è sessione, quindi imposta i claim a mano):

```sql
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"sub":"<uuid>","role":"authenticated"}';
-- auth.uid() ora ritorna <uuid>
```

Casi da coprire (ognuno in un `DO $$` con `BEGIN … ROLLBACK`-style come gli altri, niente COMMIT):
- **3.1 owner OK:** `sub` = owner del template (`1c486961-12b2-47d0-8aef-0aee30df083c`) → UPDATE/INSERT su `template.site_settings`/`menu_sections` **riesce** (`is_tenant_owner()` = true).
- **3.2 non-owner BLOCCATO:** `sub` = un UUID casuale non registrato come owner del template → la stessa scrittura **fallisce** (0 righe su UPDATE / errore RLS su INSERT). Questo è il cuore del fix: dimostra che un autenticato non-owner non scrive.
- **3.3 lettura pubblica preservata:** anon legge ancora `template.site_settings` (richiama il test 1.6) — sanity che la riscrittura non abbia rotto la SELECT pubblica.
- **3.4 booking insert anon preservato:** anon inserisce ancora su `template.bookings` (richiama 1.9).

## Vincoli

- **GOTCHA CRITICO — non aggiungere `SET search_path` alla funzione.** La funzione usa `current_schema()` per scoprire lo schema del *chiamante* (lo schema tenant che PostgREST imposta nel search_path). Se aggiungi `SET search_path = public` (o qualsiasi valore) alla funzione `SECURITY DEFINER`, `current_schema()` ritornerà quello schema invece di quello del tenant → la logica si rompe silenziosamente (nessun owner combacia mai → tutte le scritture bloccate). La protezione da search_path hijacking è garantita invece **qualificando completamente** l'unico riferimento a oggetto (`public.tenants`); `auth.uid()` è già schema-qualificato e `current_schema()` è un builtin di `pg_catalog`. Documenta questo motivo con un commento di una riga sopra la funzione.
- **Il linter Supabase segnalerà `function_search_path_mutable` su `is_tenant_owner` — è ATTESO e va lasciato così.** È il prezzo consapevole della riga sopra: la mutabilità del search_path è *necessaria* perché la funzione legga il search_path del chiamante. Non "correggere" l'avviso aggiungendo `SET search_path` (romperebbe il fix). Annota nel commento della funzione che l'avviso del linter è accettato di proposito, così una chat futura non lo "sistema" per errore.
- **`current_schema()` deve risolvere allo schema tenant.** È un'assunzione su come PostgREST imposta il search_path per-richiesta. Va **verificata nel test 3.1/3.2** (se non risolve, i test falliscono in modo evidente). Se emergesse che non risolve come atteso, **fermati e segnala al master** prima di cercare workaround — è un punto architetturale, non da decidere in autonomia.
- **Idempotenza** sullo script di applicazione al template e nell'audit (riesecuzioni multiple senza errori).
- **Zero scritture su `alex_akashi` / `underclub`** (schemi di progetti personali sullo stesso DB). Come per i test esistenti.
- **Nessuna nuova dipendenza**, nessuna modifica a codice TypeScript/app: questo è un task SQL puro.
- **Non parametrizzare** lo script (`:schema`) e **non aggiungere** la colonna timezone: sono A2 e A1b.
- Coerenza testuale delle policy tra `create_schema_from_template.sql` e lo script di applicazione al template (stesso `USING (public.is_tenant_owner())`).

## Output atteso

- `docs/operations/create_schema_from_template.sql` — §3c helper + §4 policy riscritte (9 policy → `public.is_tenant_owner()`).
- `docs/operations/2026-05-22_rls_hardening_template.sql` — nuovo, idempotente, applica helper + policy al `template` esistente.
- `docs/operations/audit_rls.sql` — esteso: check GRANT minimi + presenza/`SECURITY DEFINER` di `is_tenant_owner()`.
- `docs/operations/rls_isolation_tests.sql` — nuova Sezione 3 (owner-scoped writes).

## Done when

- La funzione `public.is_tenant_owner()` esiste, è `SECURITY DEFINER`, `STABLE`, **senza** `SET search_path`, con `public.tenants` qualificato; `EXECUTE` revocato a PUBLIC e concesso a `authenticated`/`service_role`.
- Le 9 policy di scrittura usano `public.is_tenant_owner()`; le policy `*_public_read` e `bookings_public_insert` sono **invariate**.
- Lo script di applicazione al template è idempotente e allineato testualmente al baseline.
- `audit_rls.sql` esteso restituisce **zero righe** sul `template` correttamente configurato (RLS + GRANT + helper presenti) e segnalerebbe un GRANT mancante se introdotto.
- Sezione 3 dei test: **3.1 PASS** (owner scrive), **3.2 PASS** (non-owner bloccato), **3.3/3.4 PASS** (lettura pubblica + booking anon preservati). Output via `NOTICE: PASS`/`FAIL` come le sezioni esistenti.
- Nessuna scrittura committata su alcuno schema durante i test (tutti i `DO`/`BEGIN` con ROLLBACK).

## Note di esecuzione per la sub-chat

- L'esecuzione effettiva degli script sul DB la fa **Lucio** (master) come `service_role` nel Supabase SQL editor — tu produci gli script e descrivi nei commenti come interpretarne l'output (PASS/FAIL), seguendo lo stile già presente in `rls_isolation_tests.sql`.
- Se durante la stesura emergono ambiguità sul modello di sicurezza (es. comportamento di `current_schema()` via PostgREST, o se `request.jwt.claims` non popola `auth.uid()` come atteso nel SQL editor), **segnala al master** invece di procedere con un'assunzione.
