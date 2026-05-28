#!/usr/bin/env bash
# =============================================================================
# scripts/migrate.sh — Runner migrazioni schema-per-tenant (foras-mvp)
# =============================================================================
#
# Applica idempotentemente i file /migrations/NNN_*.sql a ogni schema tenant.
# Traccia le migrazioni applicate in public.tenant_migrations.
#
# USO:
#   DATABASE_URL="postgres://..." bash scripts/migrate.sh [OPZIONI]
#
# OPZIONI:
#   --template          Includi lo schema 'template' oltre ai tenant in public.tenants
#   --schema <name>     Applica solo allo schema specificato (non legge public.tenants)
#   --dry-run           Mostra cosa verrebbe applicato senza eseguire nulla
#   --help              Mostra questo messaggio
#
# VARIABILI D'AMBIENTE:
#   DATABASE_URL        Connstring psql (default: postgres://postgres:postgres@localhost:5432/postgres)
#   MIGRATIONS_DIR      Directory dei file .sql (default: <repo_root>/migrations)
#
# ESECUZIONE VIA SSH + docker exec (produzione):
#
#   Modo raccomandato — script passato via stdin al container:
#     ssh root@<server> \
#       "docker exec -e DATABASE_URL='postgres://postgres:<pw>@localhost:5432/postgres' \
#        -e MIGRATIONS_DIR=/opt/app/migrations \
#        supabase-db bash -s" \
#       < scripts/migrate.sh
#
#   Prerequisito: le migrations devono essere disponibili nel container, oppure
#   si può usare il metodo "copia + esegui":
#     scp -r migrations scripts root@<server>:/tmp/foras/
#     ssh root@<server> "docker exec \
#       -e DATABASE_URL='postgres://postgres:<pw>@localhost:5432/postgres' \
#       -e MIGRATIONS_DIR=/tmp/foras/migrations \
#       supabase-db bash /tmp/foras/scripts/migrate.sh [--template] [--schema <name>]"
#
# REGOLA 001 — POINTER FILE:
#   001_init.sql è un commento-pointer al provisioner create_schema_from_template.sql,
#   non contiene DDL eseguibile. Il runner marca 001 come "già applicato" per ogni
#   schema target (INSERT ON CONFLICT DO NOTHING) senza mai eseguire il file.
#   Ogni schema creato tramite il provisioner è implicitamente al baseline 001.
#
# GESTIONE MIGRAZIONI GIA' APPLICATE MANUALMENTE (backfill):
#   Se una migrazione (es. 002) è stata già applicata manualmente a uno schema
#   prima dell'introduzione del runner, inserire la riga di backfill:
#     psql $DATABASE_URL -c "INSERT INTO public.tenant_migrations
#       (schema_name, version) VALUES ('template', '002')
#       ON CONFLICT DO NOTHING;"
#   Poi il runner non la ri-eseguirà.
#
# IDEMPOTENZA:
#   - public.tenant_migrations viene creata con CREATE TABLE IF NOT EXISTS
#   - Ogni migrazione è saltata se già presente nella tabella di tracking
#   - Re-run sicuro: un secondo run non applica nulla
#
# ATOMICITA':
#   - Ogni migrazione viene eseguita in una singola transazione psql
#     (BEGIN + SET LOCAL search_path + DDL del file + INSERT tracking + COMMIT)
#     con psql -v ON_ERROR_STOP=1
#   - In caso di errore la transazione fa ROLLBACK automatico; la riga di
#     tracking NON viene inserita; il runner si ferma (fail-fast)
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Configurazione
# ---------------------------------------------------------------------------

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
MIGRATIONS_DIR="${MIGRATIONS_DIR:-${REPO_ROOT}/migrations}"
DATABASE_URL="${DATABASE_URL:-postgres://postgres:postgres@localhost:5432/postgres}"

# Opzioni
OPT_TEMPLATE=false
OPT_SCHEMA=""
OPT_DRY_RUN=false

# ---------------------------------------------------------------------------
# Parse argomenti
# ---------------------------------------------------------------------------

while [[ $# -gt 0 ]]; do
  case "$1" in
    --template)
      OPT_TEMPLATE=true
      shift
      ;;
    --schema)
      if [[ -z "${2:-}" ]]; then
        echo "ERRORE: --schema richiede un valore" >&2
        exit 1
      fi
      OPT_SCHEMA="$2"
      shift 2
      ;;
    --dry-run)
      OPT_DRY_RUN=true
      shift
      ;;
    --help|-h)
      grep '^#' "${BASH_SOURCE[0]}" | grep -v '^#!/' | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      echo "ERRORE: opzione sconosciuta '$1'" >&2
      echo "Usa --help per la guida." >&2
      exit 1
      ;;
  esac
done

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

log()  { echo "[migrate] $*"; }
info() { echo "[migrate] INFO  $*"; }
ok()   { echo "[migrate] OK    $*"; }
skip() { echo "[migrate] SKIP  $*"; }
fail() { echo "[migrate] ERROR $*" >&2; }

# Esegui una query contro DATABASE_URL; restituisce l'output tabulare (-t -A -q).
run_psql() {
  psql "${DATABASE_URL}" --no-psqlrc -v ON_ERROR_STOP=1 -t -A -q "$@"
}

# ---------------------------------------------------------------------------
# Verifica prerequisiti
# ---------------------------------------------------------------------------

if ! command -v psql &>/dev/null; then
  fail "psql non trovato nel PATH. Installare postgresql-client."
  exit 1
fi

if [[ ! -d "${MIGRATIONS_DIR}" ]]; then
  fail "Directory migrations non trovata: ${MIGRATIONS_DIR}"
  exit 1
fi

# ---------------------------------------------------------------------------
# Bootstrap public.tenant_migrations (idempotente)
# ---------------------------------------------------------------------------

log "Bootstrap public.tenant_migrations..."

if [[ "${OPT_DRY_RUN}" == "true" ]]; then
  log "[dry-run] Verrebbe creata public.tenant_migrations (IF NOT EXISTS)"
else
  run_psql -c "
    CREATE TABLE IF NOT EXISTS public.tenant_migrations (
      schema_name TEXT        NOT NULL,
      version     TEXT        NOT NULL,
      applied_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (schema_name, version)
    );
  "
  ok "public.tenant_migrations pronta."
fi

# ---------------------------------------------------------------------------
# Raccolta file di migrazione (ordine numerico ascendente)
# ---------------------------------------------------------------------------

mapfile -t MIGRATION_FILES < <(
  find "${MIGRATIONS_DIR}" -maxdepth 1 -name '[0-9][0-9][0-9]_*.sql' | sort
)

if [[ ${#MIGRATION_FILES[@]} -eq 0 ]]; then
  log "Nessun file di migrazione trovato in ${MIGRATIONS_DIR}."
  exit 0
fi

log "File trovati: ${#MIGRATION_FILES[@]}"
for f in "${MIGRATION_FILES[@]}"; do
  log "  $(basename "$f")"
done

# ---------------------------------------------------------------------------
# Raccolta schemi target
# ---------------------------------------------------------------------------

TARGET_SCHEMAS=()

if [[ -n "${OPT_SCHEMA}" ]]; then
  # Modalità singolo schema
  TARGET_SCHEMAS+=("${OPT_SCHEMA}")
else
  # Leggi tutti i tenant registrati in public.tenants
  while IFS= read -r row; do
    [[ -n "${row}" ]] && TARGET_SCHEMAS+=("${row}")
  done < <(
    run_psql -c "SELECT schema_name FROM public.tenants ORDER BY schema_name;" 2>/dev/null || true
  )

  # Aggiungi 'template' se richiesto e non già incluso nella lista tenants
  if [[ "${OPT_TEMPLATE}" == "true" ]]; then
    already_in=false
    if [[ ${#TARGET_SCHEMAS[@]} -gt 0 ]]; then
      for s in "${TARGET_SCHEMAS[@]}"; do
        if [[ "$s" == "template" ]]; then
          already_in=true
          break
        fi
      done
    fi
    if [[ "${already_in}" == "false" ]]; then
      TARGET_SCHEMAS+=("template")
    fi
  fi
fi

if [[ ${#TARGET_SCHEMAS[@]} -eq 0 ]]; then
  log "Nessuno schema target trovato. Usa --schema o --template, oppure verifica public.tenants."
  exit 0
fi

log "Schemi target: ${TARGET_SCHEMAS[*]}"

# ---------------------------------------------------------------------------
# Funzione: applica le migrazioni a un singolo schema
# ---------------------------------------------------------------------------

apply_schema() {
  local schema="$1"
  local applied=0
  local skipped=0
  local tmpfile exit_code

  log "--- Schema: ${schema} ---"

  # Marca 001 come applicato (pointer-baseline — nessun DDL da eseguire).
  # INSERT ON CONFLICT DO NOTHING è idempotente: safe su re-run.
  if [[ "${OPT_DRY_RUN}" == "false" ]]; then
    run_psql -c "
      INSERT INTO public.tenant_migrations (schema_name, version)
      VALUES ('${schema}', '001')
      ON CONFLICT (schema_name, version) DO NOTHING;
    "
  else
    log "[dry-run] '${schema}' | 001 verrebbe segnato come baseline (ON CONFLICT DO NOTHING)"
  fi

  for filepath in "${MIGRATION_FILES[@]}"; do
    local filename version already_applied
    filename="$(basename "${filepath}")"

    # Versione = i 3 digit iniziali del nome file (es. "002" da "002_foo.sql")
    version="${filename:0:3}"

    # 001 è il pointer-baseline: non va mai eseguito come DDL
    if [[ "${version}" == "001" ]]; then
      skip "${schema} | ${filename} (pointer baseline — skipped)"
      skipped=$(( skipped + 1 ))
      continue
    fi

    # Controlla se già tracciata per questo schema
    already_applied="$(
      run_psql -c "
        SELECT COUNT(*)
        FROM public.tenant_migrations
        WHERE schema_name = '${schema}' AND version = '${version}';
      " 2>/dev/null || echo "0"
    )"

    if [[ "${already_applied}" -gt "0" ]]; then
      skip "${schema} | ${filename} (già applicata)"
      skipped=$(( skipped + 1 ))
      continue
    fi

    if [[ "${OPT_DRY_RUN}" == "true" ]]; then
      log "[dry-run] '${schema}' | ${filename} verrebbe applicata"
      applied=$(( applied + 1 ))
      continue
    fi

    info "${schema} | ${filename} — applicazione in corso..."

    # Costruisce un file SQL temporaneo che racchiude la migrazione in una
    # singola transazione:
    #   BEGIN
    #   SET LOCAL search_path = <schema>   ← scoped alla transazione
    #   <contenuto del file di migrazione>  ← DDL/DML del file
    #   INSERT INTO public.tenant_migrations ...
    #   COMMIT
    #
    # Con ON_ERROR_STOP=1, qualsiasi errore SQL causa ROLLBACK automatico
    # e psql restituisce exit code != 0: la riga di tracking NON viene inserita.
    tmpfile="$(mktemp /tmp/migrate_XXXXXX.sql)"

    cat > "${tmpfile}" <<EOF
BEGIN;
SET LOCAL search_path = ${schema};
$(cat "${filepath}")
INSERT INTO public.tenant_migrations (schema_name, version)
  VALUES ('${schema}', '${version}');
COMMIT;
EOF

    exit_code=0
    psql "${DATABASE_URL}" --no-psqlrc -v ON_ERROR_STOP=1 -q -f "${tmpfile}" \
      || exit_code=$?
    rm -f "${tmpfile}"

    if [[ "${exit_code}" -ne 0 ]]; then
      fail "${schema} | ${filename} — FALLITA (rollback eseguito, tracking non aggiornato)"
      log "Schema ${schema}: ${applied} applicata/e, ${skipped} saltata/e, 1 fallita."
      return 1
    fi

    ok "${schema} | ${filename} — applicata"
    applied=$(( applied + 1 ))
  done

  log "Schema ${schema}: ${applied} applicata/e, ${skipped} saltata/e, 0 fallite."
  return 0
}

# ---------------------------------------------------------------------------
# Loop principale — applica a tutti gli schemi target
# ---------------------------------------------------------------------------

TOTAL_OK=0
TOTAL_FAILED=0

for schema in "${TARGET_SCHEMAS[@]}"; do
  if apply_schema "${schema}"; then
    TOTAL_OK=$(( TOTAL_OK + 1 ))
  else
    TOTAL_FAILED=$(( TOTAL_FAILED + 1 ))
    fail "Migrazione fallita su schema '${schema}'. Interruzione."
    break
  fi
done

echo ""
log "============================================"
log "Completato: ${TOTAL_OK} schemi OK, ${TOTAL_FAILED} falliti."
log "============================================"

if [[ "${TOTAL_FAILED}" -gt 0 ]]; then
  exit 1
fi

exit 0
