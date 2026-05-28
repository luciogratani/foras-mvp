#!/usr/bin/env bash
# provision-ci-tenants.sh
# -----------------------------------------------------------------------
# Provisions TWO throwaway tenant schemas (ci_tenant_a, ci_tenant_b)
# using create_schema_from_template.sql.
#
# Uses psql -v schema=... -v owner_uuid=... — the same mechanism as the
# production onboarding runbook (no sed gymnastics; psql does the variable
# substitution and respects the input guards `\if :{?schema}` / `\if :{?owner_uuid}`).
#
# Usage (called from GitHub Actions after ci-harness-bootstrap.sql):
#   PGURL="postgres://postgres:postgres@localhost:5432/postgres"
#   bash .github/scripts/provision-ci-tenants.sh "$PGURL"
# -----------------------------------------------------------------------

set -euo pipefail

PGURL="${1:?Usage: $0 <postgres-connection-url>}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
TEMPLATE_SQL="${REPO_ROOT}/docs/operations/create_schema_from_template.sql"

provision_schema() {
  local schema_name="$1"
  local owner_uuid="$2"

  echo "==> Provisioning schema: ${schema_name} (owner: ${owner_uuid})"
  psql "${PGURL}" --no-psqlrc -v ON_ERROR_STOP=1 \
    -v schema="${schema_name}" \
    -v owner_uuid="${owner_uuid}" \
    -f "${TEMPLATE_SQL}"
  echo "==> Schema ${schema_name} provisioned OK"
}

# The two owner UUIDs MUST exist in auth.users (seeded by ci-harness-bootstrap.sql).
provision_schema "ci_tenant_a" "aaaaaaaa-0000-0000-0000-000000000001"
provision_schema "ci_tenant_b" "bbbbbbbb-0000-0000-0000-000000000002"

echo ""
echo "Both tenant schemas provisioned successfully."
