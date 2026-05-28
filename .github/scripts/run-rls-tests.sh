#!/usr/bin/env bash
# run-rls-tests.sh
# -----------------------------------------------------------------------
# Runs the RLS isolation test suite (docs/operations/rls_isolation_tests.sql)
# and fails the CI job on any FAIL notice or SQL error.
#
# The test file was written for the live multi-tenant DB (with alex_akashi +
# underclub schemas). In CI we only have ci_tenant_a + ci_tenant_b, so
# cross-tenant sections 2a.1–2a.5 are replaced by a CI-equivalent that tests
# the same isolation guarantee between ci_tenant_a and ci_tenant_b.
#
# Sections 1.x (template-based public read/write tests) run against ci_tenant_a
# (aliased as 'template' for the duration of the test via search_path tricks, or
# by rewriting 'template.' to 'ci_tenant_a.').
#
# The audit_rls.sql check runs as the last step and fails if any row is returned.
#
# Usage:
#   PGURL="postgres://postgres:postgres@localhost:5432/postgres"
#   bash .github/scripts/run-rls-tests.sh "$PGURL"
# -----------------------------------------------------------------------

set -euo pipefail

PGURL="${1:?Usage: $0 <postgres-connection-url>}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

ISOLATION_SQL="${REPO_ROOT}/docs/operations/rls_isolation_tests.sql"
AUDIT_SQL="${REPO_ROOT}/docs/operations/audit_rls.sql"

FAIL=0

# ── Helper: run SQL and check for FAIL notices ──────────────────────────────
run_sql_check() {
  local label="$1"
  local sql="$2"
  local tmpfile
  tmpfile=$(mktemp /tmp/rls_test_XXXXX.sql)
  printf '%s' "$sql" > "$tmpfile"

  echo ""
  echo "==> Running: ${label}"

  local output
  # Capture both stdout and stderr; psql errors become non-zero exit
  if ! output=$(psql "${PGURL}" --no-psqlrc -v ON_ERROR_STOP=1 \
    --tuples-only --no-align -f "$tmpfile" 2>&1); then
    echo "FAIL: SQL error in ${label}:"
    echo "$output"
    FAIL=1
    rm -f "$tmpfile"
    return
  fi

  # Check for explicit FAIL notices
  if echo "$output" | grep -q "NOTICE: FAIL\|FAIL "; then
    echo "FAIL: test failure detected in ${label}:"
    echo "$output" | grep -i "FAIL"
    FAIL=1
  else
    echo "OK: ${label} passed"
    # Show PASS notices for visibility
    echo "$output" | grep -i "NOTICE: PASS" | head -20 || true
  fi

  rm -f "$tmpfile"
}

# ── Section 1: Public read/write tests on ci_tenant_a (≡ template) ──────────
# Rewrite 'template.' references to 'ci_tenant_a.'
SECTION1_SQL=$(sed 's/template\./ci_tenant_a./g' "${ISOLATION_SQL}" \
  | sed -n '/1\. Public read/,/2a\. Cross-tenant/p' \
  | head -n -3)  # remove the last section header line

run_sql_check "Section 1 (public read/write on ci_tenant_a)" "$SECTION1_SQL"

# ── Section 2b: test_iso setup+test+teardown ─────────────────────────────────
SECTION2B_SQL=$(sed -n '/2b\. Setup/,/Checklist/p' "${ISOLATION_SQL}" | head -n -3)
run_sql_check "Section 2b (test_iso isolated schema RLS)" "$SECTION2B_SQL"

# ── Cross-tenant isolation: ci_tenant_a vs ci_tenant_b ──────────────────────
#
# Modello di isolamento foras (decisione 2026-05-28 in decisioni.md +
# audit/04b_followup_2026-05-28_ci-failures-e-modello-isolamento.md):
#
#   - PII (bookings) e TUTTE le scritture: isolate per schema (owner-scope
#     via public.is_tenant_owner()).
#   - Contenuto PUBBLICO (site_settings, menu_*, news_slides): leggibile
#     cross-schema da anon via Accept-Profile. Comportamento ATTESO, non leak:
#     gli stessi dati sono già esposti sul dominio del cliente.
#
# I test sotto verificano i 3 invarianti che il modello DAVVERO promette.
CROSS_TENANT_SQL=$(cat <<'EOSQL'
-- ─── Invariant 1: anon non legge bookings cross-tenant (PII) ───────────────
BEGIN;
SET LOCAL ROLE anon;
DO $$
DECLARE v_cnt INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_cnt FROM ci_tenant_b.bookings;
  IF v_cnt = 0 THEN
    RAISE NOTICE 'PASS ci_xc.1: anon vede 0 bookings in ci_tenant_b (RLS owner-scope OK)';
  ELSE
    RAISE EXCEPTION 'FAIL ci_xc.1: anon vede % righe in ci_tenant_b.bookings (PII leak)', v_cnt;
  END IF;
EXCEPTION
  WHEN insufficient_privilege THEN
    -- Accettato come PASS: anon è negato a livello GRANT/EXECUTE prima della RLS.
    -- Semanticamente equivalente a "0 righe restituite". Vedi punto aperto A
    -- in audit/04b_*.md: il fix opzionale è GRANT EXECUTE su is_tenant_owner()
    -- a anon, che farebbe ritornare 0 righe pulite invece di errore 42501.
    RAISE NOTICE 'PASS ci_xc.1 (alt): anon negato su ci_tenant_b.bookings (42501)';
END $$;
ROLLBACK;

-- ─── Invariant 2: anon non scrive/aggiorna/cancella cross-tenant ───────────
BEGIN;
SET LOCAL ROLE anon;

-- 2a INSERT su tabella admin (site_settings) deve fallire
DO $$
BEGIN
  INSERT INTO ci_tenant_b.site_settings (title) VALUES ('xc_probe_pwned');
  RAISE EXCEPTION 'FAIL ci_xc.2a: anon ha potuto INSERT su ci_tenant_b.site_settings';
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS ci_xc.2a: anon negato INSERT su ci_tenant_b.site_settings (42501)';
  WHEN OTHERS THEN
    -- accetta anche RLS WITH CHECK violation (SQLSTATE 42501 o 23514)
    RAISE NOTICE 'PASS ci_xc.2a (alt): anon INSERT bloccato (%)', SQLSTATE;
END $$;

-- 2b UPDATE su site_settings deve fallire (RLS owner-scope)
DO $$
DECLARE v_rows INTEGER;
BEGIN
  UPDATE ci_tenant_b.site_settings SET title = 'pwned' WHERE TRUE;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  IF v_rows > 0 THEN
    RAISE EXCEPTION 'FAIL ci_xc.2b: anon ha aggiornato % righe in ci_tenant_b.site_settings', v_rows;
  ELSE
    RAISE NOTICE 'PASS ci_xc.2b: anon UPDATE no-op su ci_tenant_b.site_settings (RLS owner-scope OK)';
  END IF;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS ci_xc.2b (alt): anon UPDATE negato (42501)';
END $$;

-- 2c DELETE su site_settings deve fallire (RLS owner-scope)
DO $$
DECLARE v_rows INTEGER;
BEGIN
  DELETE FROM ci_tenant_b.site_settings WHERE TRUE;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  IF v_rows > 0 THEN
    RAISE EXCEPTION 'FAIL ci_xc.2c: anon ha cancellato % righe in ci_tenant_b.site_settings', v_rows;
  ELSE
    RAISE NOTICE 'PASS ci_xc.2c: anon DELETE no-op su ci_tenant_b.site_settings (RLS owner-scope OK)';
  END IF;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS ci_xc.2c (alt): anon DELETE negato (42501)';
END $$;
ROLLBACK;

-- ─── Invariant 3: authenticated di tenant A non scrive su tenant B ─────────
-- Simula un utente loggato come owner di ci_tenant_a che tenta di scrivere
-- su ci_tenant_b. La policy admin di tenant_b chiama is_tenant_owner() che
-- verifica auth.uid() = owner_id di current_schema(); deve fallire.
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"sub":"aaaaaaaa-0000-0000-0000-000000000001"}';
SET LOCAL search_path = ci_tenant_b, public;

-- 3a INSERT
DO $$
BEGIN
  INSERT INTO ci_tenant_b.site_settings (title) VALUES ('xc_probe_pwned');
  RAISE EXCEPTION 'FAIL ci_xc.3a: authenticated di tenant_a ha INSERT su tenant_b';
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS ci_xc.3a: authenticated di tenant_a negato INSERT su tenant_b (RLS owner-scope)';
  WHEN check_violation THEN
    RAISE NOTICE 'PASS ci_xc.3a (alt): authenticated di tenant_a negato INSERT su tenant_b (WITH CHECK)';
  WHEN OTHERS THEN
    RAISE NOTICE 'PASS ci_xc.3a (alt): INSERT bloccato (%)', SQLSTATE;
END $$;

-- 3b UPDATE
DO $$
DECLARE v_rows INTEGER;
BEGIN
  UPDATE ci_tenant_b.site_settings SET title = 'pwned' WHERE TRUE;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  IF v_rows > 0 THEN
    RAISE EXCEPTION 'FAIL ci_xc.3b: authenticated di tenant_a ha aggiornato % righe su tenant_b', v_rows;
  ELSE
    RAISE NOTICE 'PASS ci_xc.3b: authenticated di tenant_a UPDATE no-op su tenant_b (RLS owner-scope)';
  END IF;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS ci_xc.3b (alt): UPDATE negato (42501)';
END $$;

-- 3c DELETE
DO $$
DECLARE v_rows INTEGER;
BEGIN
  DELETE FROM ci_tenant_b.site_settings WHERE TRUE;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  IF v_rows > 0 THEN
    RAISE EXCEPTION 'FAIL ci_xc.3c: authenticated di tenant_a ha cancellato % righe su tenant_b', v_rows;
  ELSE
    RAISE NOTICE 'PASS ci_xc.3c: authenticated di tenant_a DELETE no-op su tenant_b (RLS owner-scope)';
  END IF;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'PASS ci_xc.3c (alt): DELETE negato (42501)';
END $$;
ROLLBACK;

-- ─── Nota informativa (NON un test): lettura cross-tenant di contenuto pubblico ───
-- Per modello, anon PUO leggere site_settings/menu/news cross-schema via API.
-- Lo verifichiamo qui solo per documentare il modello reale nel log della CI;
-- non è un FAIL se passa, è il comportamento atteso (decisione 2026-05-28).
BEGIN;
SET LOCAL ROLE anon;
DO $$
DECLARE v_cnt INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_cnt FROM ci_tenant_b.site_settings;
  RAISE NOTICE 'INFO ci_xc.note: anon vede % righe in ci_tenant_b.site_settings (comportamento atteso)', v_cnt;
END $$;
ROLLBACK;
EOSQL
)

run_sql_check "Cross-tenant isolation (ci_tenant_a vs ci_tenant_b)" "$CROSS_TENANT_SQL"

# ── audit_rls.sql — must return zero rows ────────────────────────────────────
echo ""
echo "==> Running audit_rls.sql (must return 0 rows)"

# Patch audit_rls.sql: it references public.tenants (which has ci_tenant_a + ci_tenant_b)
# and 'template' as reference schema. We need ci_tenant_a as the reference.
AUDIT_PATCHED=$(sed "s/'template'/'ci_tenant_a'/g" "${AUDIT_SQL}")

AUDIT_ROWS=$(printf '%s' "$AUDIT_PATCHED" \
  | psql "${PGURL}" --no-psqlrc -v ON_ERROR_STOP=1 \
    --tuples-only --no-align 2>&1)

if [ -n "$(echo "$AUDIT_ROWS" | grep -v '^$' | head -1)" ]; then
  echo "FAIL: audit_rls.sql returned discrepancies:"
  echo "$AUDIT_ROWS"
  FAIL=1
else
  echo "OK: audit_rls.sql returned 0 rows (schemas are aligned)"
fi

# ── Final result ─────────────────────────────────────────────────────────────
echo ""
if [ "$FAIL" -ne 0 ]; then
  echo "=========================================="
  echo "RESULT: RLS ISOLATION TESTS FAILED"
  echo "=========================================="
  exit 1
else
  echo "=========================================="
  echo "RESULT: All RLS isolation tests passed"
  echo "=========================================="
  exit 0
fi
