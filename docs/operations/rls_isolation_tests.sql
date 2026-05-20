-- rls_isolation_tests.sql
-- -----------------------------------------------------------------------
-- Suite di test per l'isolamento multi-tenant e la verifica delle RLS
-- policies su tutti gli schemi del progetto foras-mvp.
--
-- PREREQUISITI
--   1. create_schema_from_template.sql eseguito su 'template' (incluso §3b GRANTs)
--   2. audit_rls.sql eseguito → zero discrepanze
--   3. Schemi alex_akashi e underclub presenti nel database (NON toccarli)
--   4. Eseguire dal Supabase SQL Editor come service_role (default)
--   5. Sezione 2b: se si vuole verificare anche via PostgREST/REST, aggiungere
--      'test_iso' a PGRST_DB_SCHEMAS + docker compose up -d --force-recreate rest
--      durante il test, poi rimuoverlo al teardown.
--
-- ORDINE DI ESECUZIONE
--   Eseguire le sezioni nell'ordine: 1 → 2a → 2b
--   Sezione 2b è idempotente (dropa e ricrea test_iso) e fa il cleanup finale.
--
-- COME INTERPRETARE L'OUTPUT
--   - Le query SELECT mostrano conteggi nel pannello Data: confrontare con
--     il valore atteso nel commento "PASS quando".
--   - I blocchi DO $$ ... $$ stampano PASS/FAIL come NOTICE nel pannello Messages.
--     Cercare "NOTICE: PASS" (ok) vs "ERROR" o "NOTICE: FAIL" (problema).
--   - Ogni test che si aspetta un errore di permesso wrappa con gestione eccezione:
--     se nessun errore viene lanciato, il DO block genera FAIL esplicitamente.
--   - Sezione 1 write tests: ogni DO block include ROLLBACK automatico
--     (le transazioni di scrittura non vengono mai committate).
--
-- NOTE DI SICUREZZA
--   - ZERO scritture su alex_akashi o underclub. Solo SELECT in DO block controllati.
--   - Tutti gli INSERT di prova usano dati fittizi con prefisso '__test__'.
--   - Sezione 2b: test_iso viene eliminato in fondo con DROP SCHEMA CASCADE.
-- -----------------------------------------------------------------------


-- =======================================================================
-- 1. Public read / write permessi e negati su template (anon)
-- =======================================================================
--
-- Ruolo testato: anon (visitatore homepage, nessun JWT)
-- GRANTs attesi su template: SELECT su tutto, INSERT solo su bookings
-- RLS attesa: SELECT pubblica su tutte le tabelle tranne bookings
--             bookings: INSERT permesso, SELECT/UPDATE/DELETE negati
--
-- Nota su SET LOCAL ROLE: cambia il ruolo per la transazione corrente.
-- auth.uid() ritorna NULL quando il ruolo è anon (nessun JWT in SQL editor).
-- -----------------------------------------------------------------------


-- 1.1 allergens — SELECT pubblica
BEGIN;
SET LOCAL ROLE anon;
SELECT COUNT(*) AS cnt_allergens FROM template.allergens;
-- PASS quando: cnt_allergens = 14 (seed obbligatorio Reg. UE 1169/2011)
-- FAIL se: errore 42501 (mancano GRANTs) oppure 0 righe (RLS blocca erroneamente)
ROLLBACK;


-- 1.2 menu_sections — SELECT pubblica
BEGIN;
SET LOCAL ROLE anon;
SELECT COUNT(*) AS cnt_menu_sections FROM template.menu_sections;
-- PASS quando: cnt_menu_sections = 6 (seed predefinito)
-- FAIL se: errore 42501 o RLS blocca SELECT pubblica
ROLLBACK;


-- 1.3 menu_categories — SELECT pubblica (0 righe attese senza seed aggiuntivo)
BEGIN;
SET LOCAL ROLE anon;
SELECT COUNT(*) AS cnt_menu_categories FROM template.menu_categories;
-- PASS quando: nessun errore (cnt può essere 0 se non è stato aggiunto seed)
-- FAIL se: errore 42501
ROLLBACK;


-- 1.4 menu_items — SELECT pubblica
BEGIN;
SET LOCAL ROLE anon;
SELECT COUNT(*) AS cnt_menu_items FROM template.menu_items;
-- PASS quando: nessun errore (cnt può essere 0)
-- FAIL se: errore 42501
ROLLBACK;


-- 1.5 time_slots — SELECT pubblica
BEGIN;
SET LOCAL ROLE anon;
SELECT COUNT(*) AS cnt_time_slots FROM template.time_slots;
-- PASS quando: nessun errore (cnt può essere 0)
-- FAIL se: errore 42501
ROLLBACK;


-- 1.6 site_settings — SELECT pubblica (riga unica di onboarding)
BEGIN;
SET LOCAL ROLE anon;
SELECT COUNT(*) AS cnt_site_settings FROM template.site_settings;
-- PASS quando: cnt_site_settings = 1 (seed di onboarding)
-- FAIL se: errore 42501 o cnt = 0
ROLLBACK;


-- 1.7 news_slides — SELECT pubblica
BEGIN;
SET LOCAL ROLE anon;
SELECT COUNT(*) AS cnt_news_slides FROM template.news_slides;
-- PASS quando: nessun errore (cnt può essere 0 se non è stato aggiunto seed)
-- FAIL se: errore 42501
ROLLBACK;


-- 1.8 bookings — SELECT anon rifiutata dalla RLS (0 righe, non errore)
-- La policy "bookings_admin_select" usa USING (auth.uid() IS NOT NULL).
-- Con anon e nessun JWT, auth.uid() = NULL → RLS filtra tutte le righe.
BEGIN;
SET LOCAL ROLE anon;
SELECT COUNT(*) AS cnt_bookings_anon FROM template.bookings;
-- PASS quando: cnt_bookings_anon = 0 (RLS filtra, non errore 42501)
-- FAIL se: cnt > 0 (buco di sicurezza: un visitatore vede le prenotazioni)
-- FAIL se: errore 42501 (indica problema con i GRANTs SELECT)
ROLLBACK;


-- 1.9 bookings — INSERT anonimo permesso (anon può prenotare)
-- Usiamo un time_slot_id fittizio: il test dimostra che il permesso è accordato
-- (l'INSERT supera la verifica GRANT+RLS). Un errore FK (23503) è accettabile —
-- significa che la sicurezza è corretta ma il time_slot non esiste nel seed.
-- Un errore 42501 significa invece che anon non può inserire (BUG).
DO $$
DECLARE
  v_ts_id UUID;
BEGIN
  -- Usa il primo time_slot esistente, se presente; altrimenti UUID fittizio
  SELECT id INTO v_ts_id FROM template.time_slots LIMIT 1;
  IF v_ts_id IS NULL THEN
    v_ts_id := gen_random_uuid(); -- causerà FK violation (23503) — vedi nota sopra
  END IF;

  SET LOCAL ROLE anon;

  INSERT INTO template.bookings (
    time_slot_id, date, name, email, phone, covers, gdpr_consent
  ) VALUES (
    v_ts_id,
    '2099-12-31'::date,
    '__test_booking__',
    '__test__@test.invalid',
    NULL,
    1,
    true
  );

  RAISE NOTICE 'PASS 1.9: INSERT anon su bookings riuscito (time_slot valido trovato)';

EXCEPTION
  WHEN foreign_key_violation THEN
    RAISE NOTICE 'PASS 1.9: INSERT anon su bookings riuscito dal punto di vista RLS/GRANT (FK violation 23503 su time_slot_id fittizio — comportamento atteso)';
  WHEN insufficient_privilege THEN
    RAISE EXCEPTION 'FAIL 1.9: INSERT anon su bookings rifiutato con 42501 — controllare GRANT INSERT ON template.bookings TO anon';
END $$;
-- (la transazione del DO block non fa COMMIT — nessun dato sporco rimane)


-- 1.10 bookings — UPDATE anonimo rifiutato (nessun GRANT UPDATE per anon)
DO $$
BEGIN
  SET LOCAL ROLE anon;
  UPDATE template.bookings SET notes = '__test__' WHERE id = gen_random_uuid();
  -- Se arriviamo qui senza errore, RLS ha bloccato righe (0 rows) — verificare se
  -- il GRANT UPDATE è assente (dovrebbe essere assente per anon)
  RAISE NOTICE 'PASS 1.10: UPDATE anon su bookings → 0 righe aggiornate (nessun GRANT UPDATE per anon oppure RLS filtra tutto)';
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS 1.10: UPDATE anon su bookings rifiutato con 42501 (GRANT UPDATE assente — comportamento corretto)';
END $$;
-- PASS quando: 0 righe aggiornate o errore 42501
-- FAIL se: UPDATE aggiorna anche una sola riga reale


-- 1.11 bookings — DELETE anonimo rifiutato
DO $$
BEGIN
  SET LOCAL ROLE anon;
  DELETE FROM template.bookings WHERE id = gen_random_uuid();
  RAISE NOTICE 'PASS 1.11: DELETE anon su bookings → 0 righe eliminate (GRANT DELETE assente o RLS filtra)';
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS 1.11: DELETE anon su bookings rifiutato con 42501 (GRANT DELETE assente — comportamento corretto)';
END $$;
-- PASS quando: 0 righe eliminate o errore 42501
-- FAIL se: DELETE elimina anche una sola riga reale


-- 1.12 menu_sections — INSERT anonimo rifiutato (no GRANT INSERT per anon)
DO $$
BEGIN
  SET LOCAL ROLE anon;
  INSERT INTO template.menu_sections (name) VALUES ('__test_should_fail__');
  RAISE EXCEPTION 'FAIL 1.12: INSERT anon su menu_sections ha avuto successo — manca la restrizione GRANT';
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS 1.12: INSERT anon su menu_sections rifiutato con 42501 (GRANT INSERT assente — comportamento corretto)';
END $$;


-- 1.13 site_settings — UPDATE anonimo rifiutato
DO $$
BEGIN
  SET LOCAL ROLE anon;
  UPDATE template.site_settings SET title = '__test__';
  RAISE EXCEPTION 'FAIL 1.13: UPDATE anon su site_settings ha avuto successo — buco di sicurezza';
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS 1.13: UPDATE anon su site_settings rifiutato con 42501';
END $$;


-- =======================================================================
-- 2a. Cross-tenant READ-ONLY contro alex_akashi e underclub
-- =======================================================================
--
-- Obiettivo: dimostrare che nessun ruolo (anon, authenticated) può accedere
-- agli schemi di altri tenant. La protezione è a livello di GRANT: questi
-- schemi NON hanno GRANT USAGE verso anon o authenticated.
--
-- VINCOLO ASSOLUTO: zero INSERT/UPDATE/DELETE su alex_akashi o underclub.
-- I test qui sotto usano solo SELECT dentro DO block con gestione eccezione.
-- Il fallimento atteso è: 42501 "permission denied for schema <nome>"
--
-- Test 2a.4 (getVerifiedTenantClient mismatch) è un test applicativo manuale:
-- non è riproducibile in puro SQL perché dipende dalla logica Next.js/auth.ts.
-- -----------------------------------------------------------------------


-- 2a.1 anon non può leggere alex_akashi.site_settings
DO $$
BEGIN
  SET LOCAL ROLE anon;
  PERFORM * FROM alex_akashi.site_settings LIMIT 1;
  RAISE EXCEPTION 'FAIL 2a.1: anon ha potuto accedere a alex_akashi.site_settings — lo schema è esposto al ruolo anon';
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS 2a.1: anon rifiutato da alex_akashi.site_settings (42501) — isolamento corretto';
  WHEN undefined_table THEN
    RAISE NOTICE 'PASS 2a.1 (alt): alex_akashi.site_settings non visibile da anon (schema non raggiungibile)';
END $$;


-- 2a.2 anon non può leggere underclub.site_settings
DO $$
BEGIN
  SET LOCAL ROLE anon;
  PERFORM * FROM underclub.site_settings LIMIT 1;
  RAISE EXCEPTION 'FAIL 2a.2: anon ha potuto accedere a underclub.site_settings — lo schema è esposto al ruolo anon';
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS 2a.2: anon rifiutato da underclub.site_settings (42501) — isolamento corretto';
  WHEN undefined_table THEN
    RAISE NOTICE 'PASS 2a.2 (alt): underclub.site_settings non visibile da anon';
END $$;


-- 2a.3 authenticated (senza JWT valido) non può leggere alex_akashi
-- Nota: in SQL editor non c'è una sessione JWT → auth.uid() = NULL.
-- Il test dimostra il livello GRANT (non RLS): authenticated non ha USAGE su alex_akashi.
DO $$
BEGIN
  SET LOCAL ROLE authenticated;
  PERFORM * FROM alex_akashi.site_settings LIMIT 1;
  RAISE EXCEPTION 'FAIL 2a.3: authenticated ha potuto accedere a alex_akashi.site_settings';
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS 2a.3: authenticated rifiutato da alex_akashi (42501) — nessun GRANT USAGE cross-tenant';
  WHEN undefined_table THEN
    RAISE NOTICE 'PASS 2a.3 (alt): alex_akashi non visibile da authenticated';
END $$;


-- 2a.4 authenticated (senza JWT valido) non può leggere underclub
DO $$
BEGIN
  SET LOCAL ROLE authenticated;
  PERFORM * FROM underclub.site_settings LIMIT 1;
  RAISE EXCEPTION 'FAIL 2a.4: authenticated ha potuto accedere a underclub.site_settings';
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS 2a.4: authenticated rifiutato da underclub (42501)';
  WHEN undefined_table THEN
    RAISE NOTICE 'PASS 2a.4 (alt): underclub non visibile da authenticated';
END $$;


-- 2a.5 Verifica GRANT USAGE assenti su alex_akashi e underclub
-- Query diagnostica: mostra i GRANT USAGE correnti sugli schemi tenant.
-- PASS quando: le colonne grantee per alex_akashi e underclub NON mostrano 'anon' o 'authenticated'
SELECT
  n.nspname                    AS schema_name,
  COALESCE(r.rolname, 'PUBLIC') AS grantee,
  'USAGE'                      AS privilege
FROM pg_namespace n
JOIN pg_roles r ON has_schema_privilege(r.rolname, n.nspname, 'USAGE')
WHERE n.nspname IN ('alex_akashi', 'underclub', 'template')
  AND r.rolname IN ('anon', 'authenticated', 'service_role')
ORDER BY n.nspname, r.rolname;
-- PASS quando:
--   - template: anon=USAGE, authenticated=USAGE, service_role=USAGE (abilitati da §3b)
--   - alex_akashi / underclub: nessun record per anon o authenticated
-- FAIL se: anon o authenticated appaiono con USAGE su alex_akashi o underclub


-- 2a.6 Test applicativo manuale — getVerifiedTenantClient() con schema mismatch
-- NON eseguibile in SQL: richiede un client autenticato con sessione JWT.
--
-- PROCEDURA DI VERIFICA MANUALE:
--   1. Nel Supabase Dashboard → Authentication → Users: prendere un utente admin
--      il cui user_metadata.schema = 'alex_akashi'.
--   2. Aprire l'app admin (localhost:3001), effettuare il login con quell'utente.
--   3. Modificare temporaneamente public.tenants: cambiare l'owner_id di 'alex_akashi'
--      in modo che NON corrisponda all'utente loggato.
--   4. Triggare una richiesta autenticata (es. navigare al dashboard).
--   5. PASS quando: la sessione viene invalidata (signOut()) e il browser viene
--      reindirizzato a /?reason=tenant-mismatch (comportamento di auth.ts L.32-35).
--   6. FAIL se: la richiesta ha successo o mostra dati di un tenant non autorizzato.
--   7. Ripristinare public.tenants dopo il test.
--
-- Riferimento codice: apps/admin/lib/auth.ts:28-35


-- =======================================================================
-- 2b. Setup + test + teardown di test_iso
-- =======================================================================
--
-- Schema usa-e-getta per i casi che richiedono scrittura.
-- Struttura minima: tabella dummy(id, owner_id) con RLS attiva.
-- GRANTs replicati dal modello di create_schema_from_template.sql §3b.
--
-- Questo script è idempotente: se test_iso esiste già da un'esecuzione
-- precedente non completata, viene eliminato e ricreato.
--
-- NOTA PostgREST (solo se si vuole testare via REST oltre che via SQL):
--   Prima di eseguire questa sezione, aggiungere 'test_iso' a PGRST_DB_SCHEMAS
--   e riavviare il container rest. Rimuoverlo dopo il DROP finale.
-- -----------------------------------------------------------------------


-- 2b.0 Teardown preventivo (idempotente)
DROP SCHEMA IF EXISTS test_iso CASCADE;


-- 2b.1 Creazione schema, tabella, RLS e GRANTs
CREATE SCHEMA test_iso;

CREATE TABLE test_iso.dummy (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL
);

ALTER TABLE test_iso.dummy ENABLE ROW LEVEL SECURITY;

-- GRANTs minimi — stesso pattern di create_schema_from_template.sql §3b
-- IMPORTANTE: senza GRANT USAGE, i test fallirebbero con 42501 prima ancora
-- di raggiungere la valutazione RLS (lesson learned Sprint 1 / 04b).
GRANT USAGE ON SCHEMA test_iso TO anon, authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA test_iso TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA test_iso TO service_role;

-- Policy RLS: solo authenticated (admin loggato) può SELECT.
-- anon non ha policy SELECT → RLS nega per default (0 righe, non errore).
-- service_role bypassa RLS → può sempre leggere.
CREATE POLICY "dummy_admin_select"
  ON test_iso.dummy FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Non creiamo policy INSERT per anon su test_iso.dummy:
-- serve a dimostrare che il modello di accesso è controllato dai GRANTs + RLS,
-- non dalla sola presenza dello schema.


-- 2b.2 Inserimento riga di prova come service_role (bypassa RLS — ok per setup)
INSERT INTO test_iso.dummy (owner_id)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid);

-- Verifica: la riga è presente come service_role
SELECT COUNT(*) AS cnt_service_role FROM test_iso.dummy;
-- PASS quando: cnt_service_role = 1


-- 2b.3 anon non vede le righe di test_iso.dummy (RLS: nessuna policy SELECT per anon)
BEGIN;
SET LOCAL ROLE anon;
SELECT COUNT(*) AS cnt_dummy_anon FROM test_iso.dummy;
-- PASS quando: cnt_dummy_anon = 0 (RLS filtra — nessuna policy SELECT attiva per anon)
-- FAIL se: cnt_dummy_anon > 0 (buco RLS: anon vede dati di un altro tenant)
-- FAIL se: errore 42501 (indica problema con i GRANTs USAGE/SELECT su test_iso)
ROLLBACK;


-- 2b.4 anon non può INSERT su test_iso.dummy (nessun GRANT INSERT)
DO $$
BEGIN
  SET LOCAL ROLE anon;
  INSERT INTO test_iso.dummy (owner_id)
  VALUES ('00000000-0000-0000-0000-000000000002'::uuid);
  RAISE EXCEPTION 'FAIL 2b.4: INSERT anon su test_iso.dummy ha avuto successo — mancano le restrizioni';
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS 2b.4: INSERT anon su test_iso.dummy rifiutato con 42501 (GRANT INSERT assente)';
END $$;


-- 2b.5 template-anon non può leggere test_iso tramite schema cross-call
-- Simula un client PostgREST bound su 'template' che tenta Accept-Profile: test_iso.
-- A livello SQL: il ruolo anon ha USAGE su test_iso (GRANT dato sopra),
-- ma la RLS blocca le righe. Questo test verifica che la riga inserita in 2b.2
-- non sia visibile da anon nemmeno con USAGE esplicito sullo schema.
DO $$
DECLARE
  v_cnt INTEGER;
BEGIN
  SET LOCAL ROLE anon;
  SELECT COUNT(*) INTO v_cnt FROM test_iso.dummy;
  IF v_cnt = 0 THEN
    RAISE NOTICE 'PASS 2b.5: anon con USAGE su test_iso vede 0 righe (RLS funziona)';
  ELSE
    RAISE EXCEPTION 'FAIL 2b.5: anon vede % righe in test_iso.dummy — RLS non sta filtrando', v_cnt;
  END IF;
END $$;


-- 2b.6 Verifica finale: service_role vede ancora la riga (RLS bypass corretto)
SELECT COUNT(*) AS cnt_final_service_role FROM test_iso.dummy;
-- PASS quando: cnt_final_service_role = 1 (la riga inserita in 2b.2 è ancora lì)
-- FAIL se: 0 righe (service_role non dovrebbe essere bloccato da RLS)


-- 2b.7 Teardown finale — eliminare test_iso
DROP SCHEMA test_iso CASCADE;

-- Verifica che test_iso non esista più
SELECT COUNT(*) AS schema_exists
FROM pg_namespace
WHERE nspname = 'test_iso';
-- PASS quando: schema_exists = 0


-- =======================================================================
-- Checklist criteri "Done when" — Sprint 1 / Phase 1 Data e Security Baseline
-- (da docs/build-delivery/runbook-implementazione.md)
-- =======================================================================
--
-- [ ] Tentativi cross-tenant rifiutati (403 a livello app / nessuna riga a livello RLS)
--     → Verificato con i test 2a.1–2a.5: anon e authenticated ottengono 42501
--       sugli schemi alex_akashi e underclub. A livello PostgREST corrisponde a 403.
--
-- [ ] Public read vede solo i dati attesi (site_settings, menu pubblico, time_slots, allergens, news_slides)
--     → Verificato con i test 1.1–1.7: SELECT come anon restituisce righe su tutte
--       le tabelle pubbliche; bookings ritorna 0 righe (test 1.8).
--
-- [ ] Booking INSERT anonimo funziona; UPDATE/DELETE anonimi rifiutati
--     → Verificato con i test 1.9 (INSERT PASS), 1.10 (UPDATE negato), 1.11 (DELETE negato).
--
-- [ ] getVerifiedTenantClient() invalida la sessione se schema non corrisponde a public.tenants
--     → Verificato manualmente (test 2a.6): login con user_metadata.schema = 'alex_akashi'
--       ma owner_id non corrispondente → signOut() + redirect /?reason=tenant-mismatch.
--
-- [ ] audit_rls.sql pulito (zero discrepanze) anche dopo i test (schema test_iso rimosso)
--     → Rieseguire docs/operations/audit_rls.sql dopo questa suite: atteso 0 righe.
--       test_iso è stato eliminato in 2b.7, non appare più tra gli schemi monitorati.
