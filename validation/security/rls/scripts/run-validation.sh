#!/usr/bin/env bash
# Authorization: user-approved isolated GymPulse security evidence run; never production.
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RESULT="$ROOT/results"
SQL="$ROOT/sql"
mkdir -p "$RESULT"
rm -f "$RESULT/summary.txt" "$RESULT/tool-versions.txt" "$RESULT/test-results.json" "$RESULT/test-matrix.md" "$RESULT/cleanup.txt"
RUN_SUFFIX="${GITHUB_RUN_ID:-$$}"
POSTGRES_IMAGE="${POSTGRES_IMAGE:-postgres:17-bookworm}"
CONTAINER="gympulse-rls-pg-${RUN_SUFFIX}"
VOLUME="gympulse-rls-pg-${RUN_SUFFIX}-data"
PGUSER="gympulse_rls_bootstrap"
PGPASSWORD="$(openssl rand -hex 24)"
RUNTIME_PASSWORD="$(openssl rand -hex 24)"
WORKER_PASSWORD="$(openssl rand -hex 24)"
ADMIN_PASSWORD="$(openssl rand -hex 24)"
PGDATABASE="gympulse_rls_synthetic"
TEMP_DIR="$(mktemp -d)"
SUMMARY="$RESULT/summary.txt"
export PGHOST=127.0.0.1 PGUSER PGPASSWORD PGDATABASE RUNTIME_PASSWORD WORKER_PASSWORD ADMIN_PASSWORD
if [[ "${GITHUB_ACTIONS:-}" == "true" ]]; then
  for secret in "$PGPASSWORD" "$RUNTIME_PASSWORD" "$WORKER_PASSWORD" "$ADMIN_PASSWORD"; do
    echo "::add-mask::$secret"
  done
fi
printf 'GymPulse RLS Isolation Validation\nSynthetic environment: disposable real PostgreSQL\nAuthorization: user approval in conversation, 2026-10-15\nProduction resources: none\n' > "$SUMMARY"
cleanup() {
  local rc=$?
  trap - EXIT
  set +e
  local status=PASS
  if docker container inspect "$CONTAINER" >/dev/null 2>&1; then
    docker rm -f "$CONTAINER" >/dev/null 2>&1 || status=FAIL
  fi
  if docker volume inspect "$VOLUME" >/dev/null 2>&1; then
    docker volume rm "$VOLUME" >/dev/null 2>&1 || status=FAIL
  fi
  if docker container inspect "$CONTAINER" >/dev/null 2>&1; then status=FAIL; fi
  if docker volume inspect "$VOLUME" >/dev/null 2>&1; then status=FAIL; fi
  rm -rf "$TEMP_DIR" || status=FAIL
  printf 'Cleanup: %s\n' "$status" | tee "$RESULT/cleanup.txt" | tee -a "$SUMMARY"
  if [[ "$status" != PASS ]]; then rc=1; fi
  printf 'Runner exit code: %s\n' "$rc" | tee -a "$SUMMARY"
  exit "$rc"
}
trap cleanup EXIT
command -v docker >/dev/null || { echo 'Docker unavailable'; exit 1; }
command -v node >/dev/null || { echo 'Node unavailable'; exit 1; }
command -v npm >/dev/null || { echo 'npm unavailable'; exit 1; }
command -v openssl >/dev/null || { echo 'openssl unavailable'; exit 1; }
echo "== Disposable PostgreSQL boot =="
docker pull "$POSTGRES_IMAGE" >/dev/null
docker volume create "$VOLUME" >/dev/null
docker run -d --rm --name "$CONTAINER" --label gympulse.rls.validation=true \
  -e POSTGRES_USER="$PGUSER" -e POSTGRES_PASSWORD="$PGPASSWORD" -e POSTGRES_DB=postgres \
  -p 127.0.0.1::5432 -v "$VOLUME:/var/lib/postgresql/data" "$POSTGRES_IMAGE" >/dev/null
for i in $(seq 1 75); do
  if docker exec -e PGPASSWORD="$PGPASSWORD" "$CONTAINER" \
    pg_isready -h 127.0.0.1 -U "$PGUSER" -d postgres >/dev/null 2>&1; then break; fi
  if [[ "$i" == 75 ]]; then echo 'PostgreSQL readiness timeout'; exit 1; fi
  sleep 1
done
PORT_BINDING="$(docker port "$CONTAINER" 5432/tcp | head -n 1)"
PGPORT="${PORT_BINDING##*:}"
export PGPORT
[[ "$PGPORT" =~ ^[0-9]+$ ]] || { echo 'Invalid mapped port'; exit 1; }
POSTGRES_VERSION="$(docker exec -e PGPASSWORD="$PGPASSWORD" "$CONTAINER" \
 psql -X -qAt -v ON_ERROR_STOP=1 -U "$PGUSER" -d postgres -c 'SHOW server_version;')"
IMAGE_DIGEST="$(docker image inspect "$POSTGRES_IMAGE" --format '{{if .RepoDigests}}{{index .RepoDigests 0}}{{else}}not-resolved{{end}}')"
printf 'PostgreSQL version: %s\nImage: %s\nImage digest: %s\nDocker: %s\nNode: %s\n' \
 "$POSTGRES_VERSION" "$POSTGRES_IMAGE" "$IMAGE_DIGEST" "$(docker --version)" "$(node --version)" > "$RESULT/tool-versions.txt"
docker exec -e PGPASSWORD="$PGPASSWORD" "$CONTAINER" \
 psql -X -qAt -v ON_ERROR_STOP=1 -U "$PGUSER" -d postgres \
 -c "CREATE DATABASE $PGDATABASE;" >/dev/null
echo "== Migration from zero =="
docker exec -i -e PGPASSWORD="$PGPASSWORD" "$CONTAINER" \
 psql -X -v ON_ERROR_STOP=1 -U "$PGUSER" -d "$PGDATABASE" \
 -v "runtime_password=$RUNTIME_PASSWORD" -v "worker_password=$WORKER_PASSWORD" \
 -v "admin_password=$ADMIN_PASSWORD" < "$SQL/001-validation-schema.sql" > "$RESULT/migration-001.log"
echo "== Temporary test client =="
npm install --prefix "$TEMP_DIR/pg-client" --no-save --package-lock=false \
 --ignore-scripts --no-audit --no-fund pg@8.16.3 >/dev/null
export NODE_PATH="$TEMP_DIR/pg-client/node_modules"
printf 'Temporary pg driver: %s\n' \
 "$(node -p 'require(process.env.NODE_PATH+"/pg/package.json").version')" >> "$RESULT/tool-versions.txt"
echo "== Restricted-role RLS suite =="
set +e
node "$ROOT/src/validate.cjs"
TEST_RC=$?
set -e
if [[ "$TEST_RC" != 0 ]]; then
  echo 'RLS security scenarios FAILED or incomplete' | tee -a "$SUMMARY"
  exit "$TEST_RC"
fi
echo 'RLS security scenarios: runner PASS (see matrix for scenario details)' | tee -a "$SUMMARY"
echo 'Production decisions: none; ADR-0010 Proposed; D-SEC-008 OPEN' >> "$SUMMARY"
