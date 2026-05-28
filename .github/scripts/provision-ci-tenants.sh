#!/usr/bin/env bash
# provision-ci-tenants.sh
# -----------------------------------------------------------------------
# Provisions TWO throwaway tenant schemas (ci_tenant_a, ci_tenant_b)
# using create_schema_from_template.sql.
#
# Because the provisioner hard-codes 'template' as the schema name and
# one specific owner UUID, we perform text substitution via sed before
# passing the SQL to psql — same transformation the production onboarding
# runbook does (psql -v schema=... -v owner_uuid=...), but done portably
# for CI where psql \if / \set variable-reuse is not needed.
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

TEMPLATE_OWNER="1c486961-12b2-47d0-8aef-0aee30df083c"

provision_schema() {
  local schema_name="$1"
  local owner_uuid="$2"

  echo "==> Provisioning schema: ${schema_name} (owner: ${owner_uuid})"

  # Perform text substitution:
  #   'template'       → 'ci_tenant_a' (or 'ci_tenant_b')
  #   template schema identifier → quoted schema name
  #   hardcoded owner UUID      → test owner UUID
  #   Make the public.tenants INSERT idempotent
  sed \
    -e "s/'template'/'${schema_name}'/g" \
    -e "s/CREATE SCHEMA IF NOT EXISTS template\b/CREATE SCHEMA IF NOT EXISTS \"${schema_name}\"/g" \
    -e "s/SET search_path = template\b/SET search_path = \"${schema_name}\"/g" \
    -e "s/ON SCHEMA template\b/ON SCHEMA \"${schema_name}\"/g" \
    -e "s/IN SCHEMA template\b/IN SCHEMA \"${schema_name}\"/g" \
    -e "s/ON template\./ON \"${schema_name}\"./g" \
    -e "s/FROM template\./FROM \"${schema_name}\"./g" \
    -e "s/${TEMPLATE_OWNER}/${owner_uuid}/g" \
    -e "s/INSERT INTO public\.tenants (schema_name, owner_id)/INSERT INTO public.tenants (schema_name, owner_id) ON CONFLICT (schema_name) DO UPDATE SET owner_id = EXCLUDED.owner_id --/g" \
    "${TEMPLATE_SQL}" \
  | psql "${PGURL}" --no-psqlrc -v ON_ERROR_STOP=1

  echo "==> Schema ${schema_name} provisioned OK"
}

provision_schema "ci_tenant_a" "aaaaaaaa-0000-0000-0000-000000000001"
provision_schema "ci_tenant_b" "bbbbbbbb-0000-0000-0000-000000000002"

echo ""
echo "Both tenant schemas provisioned successfully."
