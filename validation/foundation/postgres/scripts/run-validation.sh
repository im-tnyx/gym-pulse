#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RESULT="$ROOT/results"
SQL="$ROOT/sql"
CLIENT="$ROOT/src/validation-client.mjs"
NODE_CLIENT="$ROOT/.node-client"
mkdir -p "$RESULT"
rm -f "$RESULT"/*

RUN_SUFFIX="$GITHUB_RUN_ID"
[ -n "$RUN_SUFFIX" ] || RUN_SUFFIX="$$"
[ -n "$POSTGRES_IMAGE" ] || POSTGRES_IMAGE="postgres:17-bookworm"
[ -n "$PGPORT" ] || PGPORT="55432"

PGUSER="gympulse_validation"
PGPASSWORD="$(openssl rand -hex 18)"
CONTAINER="gympulse-foundation-pg-$RUN_SUFFIX"
VOLUME="gympulse-foundation-pg-$RUN_SUFFIX-data"
DB="gympulse_foundation_validation_$RUN_SUFFIX"
RESTORE_DB="gympulse_foundation_restore_$RUN_SUFFIX"
READY_DB="gympulse_readiness_$RUN_SUFFIX"
READY_RESTORE="gympulse_readiness_restore_$RUN_SUFFIX"
TMP="$(mktemp -d)"
DUMP="$TMP/foundation.dump"
READY_DUMP="$TMP/readiness.dump"
SUMMARY="$RESULT/summary.txt"

export PGHOST=127.0.0.1 PGPORT PGUSER PGPASSWORD
[ "$GITHUB_ACTIONS" = "true" ] && echo "::add-mask::$PGPASSWORD" || true

cat > "$SUMMARY" <<EOF
GymPulse Real PostgreSQL Foundation Validation
Synthetic data only: yes
Production resources: none
EOF

cleanup() {
  rc="$1"
  trap - EXIT
  set +e
  cleanup_result=PASS
  docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
  if docker volume ls --format '{{.Name}}' | grep -Fxq "$VOLUME"; then
    docker volume rm "$VOLUME" >/dev/null 2>&1 || cleanup_result=FAIL
  fi
  rm -rf "$TMP" "$NODE_CLIENT" || cleanup_result=FAIL
  echo "Cleanup: $cleanup_result" | tee -a "$SUMMARY"
  exit "$rc"
}
trap 'cleanup $?' EXIT

fail() { echo "VALIDATION FAILURE: $*" | tee -a "$SUMMARY" >&2; exit 1; }
assert_eq() { [ "$1" = "$2" ] || fail "$3 expected=$2 actual=$1"; }

wait_pg() {
  n=0
  until docker exec -e PGPASSWORD="$PGPASSWORD" "$CONTAINER" pg_isready -U "$PGUSER" -d postgres >/dev/null 2>&1; do
    n=$((n+1)); [ "$n" -lt 60 ] || fail "PostgreSQL readiness timeout"; sleep 1
  done
}
psqlq() {
  db="$1"; shift
  docker exec -e PGPASSWORD="$PGPASSWORD" "$CONTAINER" psql -X -qAt -v ON_ERROR_STOP=1 -U "$PGUSER" -d "$db" "$@"
}
sql() { db="$1"; statement="$2"; psqlq "$db" -c "$statement"; }
sqlfile() {
  db="$1"; file="$2"
  docker exec -i -e PGPASSWORD="$PGPASSWORD" "$CONTAINER" psql -X -v ON_ERROR_STOP=1 -U "$PGUSER" -d "$db" < "$file"
}
createdb_v() { sql postgres "CREATE DATABASE \"$1\";" >/dev/null; }
dropdb_v() { sql postgres "DROP DATABASE IF EXISTS \"$1\" WITH (FORCE);" >/dev/null; }

echo "== Environment readiness =="
command -v docker >/dev/null || fail "Docker unavailable"
DOCKER_VERSION="$(docker --version)"
echo "Docker: $DOCKER_VERSION" > "$RESULT/tool-versions.txt"
docker pull "$POSTGRES_IMAGE" >/dev/null
IMAGE_DIGEST="$(docker image inspect "$POSTGRES_IMAGE" --format '{{if .RepoDigests}}{{index .RepoDigests 0}}{{else}}unavailable{{end}}')"
echo "Image RepoDigest: $IMAGE_DIGEST" >> "$RESULT/tool-versions.txt"
docker volume create "$VOLUME" >/dev/null
docker run -d --name "$CONTAINER" --label gympulse.foundation.validation=true \
  -e POSTGRES_USER="$PGUSER" -e POSTGRES_PASSWORD="$PGPASSWORD" -e POSTGRES_DB=postgres \
  -p "127.0.0.1:$PGPORT:5432" -v "$VOLUME:/var/lib/postgresql/data" "$POSTGRES_IMAGE" >/dev/null
wait_pg

SERVER_VERSION="$(sql postgres 'show server_version;')"
PSQL_VERSION="$(docker exec "$CONTAINER" psql --version)"
DUMP_VERSION="$(docker exec "$CONTAINER" pg_dump --version)"
RESTORE_VERSION="$(docker exec "$CONTAINER" pg_restore --version)"
printf 'PostgreSQL server: %s\npsql: %s\npg_dump: %s\npg_restore: %s\n' \
  "$SERVER_VERSION" "$PSQL_VERSION" "$DUMP_VERSION" "$RESTORE_VERSION" >> "$RESULT/tool-versions.txt"

createdb_v "$READY_DB"
sql "$READY_DB" "CREATE TABLE readiness_probe(id integer PRIMARY KEY,value text NOT NULL); INSERT INTO readiness_probe VALUES(1,'ready');" >/dev/null
sql "$READY_DB" "BEGIN; INSERT INTO readiness_probe VALUES(2,'commit'); COMMIT;" >/dev/null
sql "$READY_DB" "BEGIN; INSERT INTO readiness_probe VALUES(3,'rollback'); ROLLBACK;" >/dev/null
assert_eq "$(sql "$READY_DB" 'SELECT count(*) FROM readiness_probe WHERE id=3;')" 0 "readiness rollback"
for i in 1 2 3 4; do (sql "$READY_DB" 'SELECT pg_backend_pid() FROM (SELECT pg_sleep(0.3)) s;' > "$TMP/ready-$i") & done
wait
docker exec -e PGPASSWORD="$PGPASSWORD" "$CONTAINER" pg_dump -U "$PGUSER" -d "$READY_DB" -Fc > "$READY_DUMP"
createdb_v "$READY_RESTORE"
docker exec -i -e PGPASSWORD="$PGPASSWORD" "$CONTAINER" pg_restore -U "$PGUSER" -d "$READY_RESTORE" --no-owner --no-privileges < "$READY_DUMP"
assert_eq "$(sql "$READY_RESTORE" 'SELECT count(*) FROM readiness_probe;')" 2 "readiness restore"
dropdb_v "$READY_RESTORE"; dropdb_v "$READY_DB"
docker restart "$CONTAINER" >/dev/null; wait_pg
assert_eq "$(sql postgres 'SELECT 1;')" 1 "readiness reconnect"

cat >> "$SUMMARY" <<EOF
Validation runner: READY
Environment: GitHub Actions Docker runner
Docker runtime: $DOCKER_VERSION
PostgreSQL image: $POSTGRES_IMAGE
Image digest: $IMAGE_DIGEST
PostgreSQL server version: $SERVER_VERSION
psql version: $PSQL_VERSION
pg_dump version: $DUMP_VERSION
pg_restore version: $RESTORE_VERSION
EOF

echo "== Migrations =="
createdb_v "$DB"
sqlfile "$DB" "$SQL/001-initial.sql" > "$RESULT/migration-001.log"
sql "$DB" "
INSERT INTO validation_tenant VALUES ('tenant-a','Synthetic Tenant A'),('tenant-b','Synthetic Tenant B');
INSERT INTO validation_member_ref(tenant_id,member_ref,eligibility_marker) VALUES
 ('tenant-a','member-001','eligible'),('tenant-a','shared-member','unknown'),('tenant-b','shared-member','ineligible');
INSERT INTO validation_effect_target VALUES ('tenant-a','target-001',0),('tenant-a','target-restart',0);
INSERT INTO validation_history(tenant_id,member_ref,seq,event_type,occurred_at,detail) VALUES
 ('tenant-a','member-001',1,'created','2026-09-01T08:00:00Z','synthetic'),
 ('tenant-a','member-001',2,'reviewed','2026-09-02T08:00:00Z','synthetic'),
 ('tenant-a','shared-member',1,'created','2026-09-03T08:00:00Z','synthetic'),
 ('tenant-b','shared-member',1,'created','2026-09-04T08:00:00Z','synthetic');" >/dev/null
PRE="$(sql "$DB" 'SELECT count(*) FROM validation_member_ref;')"
sqlfile "$DB" "$SQL/002-forward.sql" > "$RESULT/migration-002.log"
POST="$(sql "$DB" 'SELECT count(*) FROM validation_member_ref;')"
assert_eq "$POST" "$PRE" "forward migration row preservation"
assert_eq "$(sql "$DB" "SELECT count(*) FROM validation_forward_marker WHERE marker_key='forward-migration-002-applied';")" 1 "forward marker"

echo "== Attendance concurrency =="
ATTEMPTS=12; mkdir -p "$TMP/att"
for i in $(seq 1 "$ATTEMPTS"); do
  (sql "$DB" "INSERT INTO validation_attendance(tenant_id,member_ref,logical_key,note)
   VALUES('tenant-a','member-001','attendance-race-001','attempt-$i')
   ON CONFLICT DO NOTHING RETURNING id;" > "$TMP/att/$i.out") &
done
wait
ATT_CREATED="$(cat "$TMP"/att/*.out | grep -cE '^[0-9]+$' || true)"
ATT_FINAL="$(sql "$DB" "SELECT count(*) FROM validation_attendance WHERE tenant_id='tenant-a' AND member_ref='member-001' AND logical_key='attendance-race-001';")"
assert_eq "$ATT_CREATED" 1 "attendance created"; assert_eq "$ATT_FINAL" 1 "attendance final"
echo "attempts=$ATTEMPTS created=$ATT_CREATED conflicts=$((ATTEMPTS-ATT_CREATED)) final=$ATT_FINAL" > "$RESULT/attendance-concurrency.txt"

echo "== Provider-event dedupe =="
PROVIDER_ATTEMPTS=12; mkdir -p "$TMP/provider"
for i in $(seq 1 "$PROVIDER_ATTEMPTS"); do
  (sql "$DB" "INSERT INTO validation_provider_event(provider,provider_event_id)
   VALUES('synthetic-provider','provider-event-001') ON CONFLICT DO NOTHING RETURNING id;" > "$TMP/provider/$i.out") &
done
wait
PROVIDER_CREATED="$(cat "$TMP"/provider/*.out | grep -cE '^[0-9]+$' || true)"
PROVIDER_FINAL="$(sql "$DB" "SELECT count(*) FROM validation_provider_event WHERE provider='synthetic-provider' AND provider_event_id='provider-event-001';")"
assert_eq "$PROVIDER_CREATED" 1 "provider created"; assert_eq "$PROVIDER_FINAL" 1 "provider final"
echo "attempts=$PROVIDER_ATTEMPTS created=$PROVIDER_CREATED final=$PROVIDER_FINAL" > "$RESULT/provider-event-dedupe.txt"

echo "== Exactly-once business effect =="
EFFECT_ATTEMPTS=12
EFFECT_SQL="BEGIN;
WITH claimed AS (
 INSERT INTO validation_business_effect(effect_key,tenant_id,target_ref)
 VALUES('validation-order-001:renewal-effect','tenant-a','target-001')
 ON CONFLICT DO NOTHING RETURNING 1)
UPDATE validation_effect_target SET effect_count=effect_count+1
 WHERE tenant_id='tenant-a' AND target_ref='target-001' AND EXISTS(SELECT 1 FROM claimed);
COMMIT;"
for i in $(seq 1 "$EFFECT_ATTEMPTS"); do (sql "$DB" "$EFFECT_SQL" >/dev/null) & done
wait
EFFECT_CLAIMS="$(sql "$DB" "SELECT count(*) FROM validation_business_effect WHERE effect_key='validation-order-001:renewal-effect';")"
EFFECT_COUNT="$(sql "$DB" "SELECT effect_count FROM validation_effect_target WHERE tenant_id='tenant-a' AND target_ref='target-001';")"
assert_eq "$EFFECT_CLAIMS" 1 "effect claims"; assert_eq "$EFFECT_COUNT" 1 "effect mutation"
sql "$DB" "$EFFECT_SQL" >/dev/null
assert_eq "$(sql "$DB" "SELECT effect_count FROM validation_effect_target WHERE tenant_id='tenant-a' AND target_ref='target-001';")" 1 "effect replay"
echo "attempts=$EFFECT_ATTEMPTS claims=$EFFECT_CLAIMS effect_count=$EFFECT_COUNT replay=unchanged" > "$RESULT/exactly-once-effect.txt"

echo "== Single active no-show =="
NO_SHOW_ATTEMPTS=12; mkdir -p "$TMP/no-show"
for i in $(seq 1 "$NO_SHOW_ATTEMPTS"); do
  (sql "$DB" "INSERT INTO validation_no_show_case(tenant_id,member_ref,rule_key,status)
   VALUES('tenant-a','member-001','rule-001','active') ON CONFLICT DO NOTHING RETURNING id;" > "$TMP/no-show/$i.out") &
done
wait
NO_SHOW_CREATED="$(cat "$TMP"/no-show/*.out | grep -cE '^[0-9]+$' || true)"
assert_eq "$NO_SHOW_CREATED" 1 "no-show race"
assert_eq "$(sql "$DB" "SELECT count(*) FROM validation_no_show_case WHERE status='active' AND tenant_id='tenant-a' AND member_ref='member-001' AND rule_key='rule-001';")" 1 "active no-show"
sql "$DB" "UPDATE validation_no_show_case SET status='resolved',resolved_at=clock_timestamp() WHERE status='active' AND tenant_id='tenant-a' AND member_ref='member-001' AND rule_key='rule-001';" >/dev/null
sql "$DB" "INSERT INTO validation_no_show_case(tenant_id,member_ref,rule_key,status) VALUES('tenant-a','member-001','rule-001','active');" >/dev/null
assert_eq "$(sql "$DB" "SELECT count(*) FROM validation_no_show_case WHERE tenant_id='tenant-a' AND member_ref='member-001' AND rule_key='rule-001';")" 2 "no-show history"

echo "== Rollback =="
BEFORE="$(sql "$DB" "SELECT effect_count FROM validation_effect_target WHERE tenant_id='tenant-a' AND target_ref='target-001';")"
set +e
docker exec -i -e PGPASSWORD="$PGPASSWORD" "$CONTAINER" psql -X -v ON_ERROR_STOP=1 -U "$PGUSER" -d "$DB" > "$RESULT/rollback-error.txt" 2>&1 <<'SQL'
BEGIN;
INSERT INTO validation_history(tenant_id,member_ref,seq,event_type,occurred_at,detail)
VALUES('tenant-a','member-001',999,'rollback-probe',clock_timestamp(),'must rollback');
UPDATE validation_effect_target SET effect_count=effect_count+100 WHERE tenant_id='tenant-a' AND target_ref='target-001';
INSERT INTO validation_member_ref(tenant_id,member_ref,eligibility_marker)
VALUES('tenant-a','rollback-invalid-member','invalid-marker');
COMMIT;
SQL
ROLLBACK_RC=$?
set -e
[ "$ROLLBACK_RC" -ne 0 ] || fail "rollback probe unexpectedly committed"
AFTER="$(sql "$DB" "SELECT effect_count FROM validation_effect_target WHERE tenant_id='tenant-a' AND target_ref='target-001';")"
PARTIAL="$(sql "$DB" "SELECT count(*) FROM validation_history WHERE tenant_id='tenant-a' AND member_ref='member-001' AND seq=999;")"
assert_eq "$AFTER" "$BEFORE" "rollback target"; assert_eq "$PARTIAL" 0 "rollback partial row"

echo "== Tenant-scoped SQL =="
A_RESULT="$(sql "$DB" "SELECT tenant_id||':'||member_ref FROM validation_member_ref WHERE tenant_id='tenant-a' ORDER BY member_ref;")"
B_RESULT="$(sql "$DB" "SELECT tenant_id||':'||member_ref FROM validation_member_ref WHERE tenant_id='tenant-b' ORDER BY member_ref;")"
case "$A_RESULT" in *tenant-b:*) fail "tenant-a leaked tenant-b";; esac
case "$B_RESULT" in *tenant-a:*) fail "tenant-b leaked tenant-a";; esac
printf 'Tenant A:\n%s\nTenant B:\n%s\nExplicit Tenant Query != RLS Acceptance\n' "$A_RESULT" "$B_RESULT" > "$RESULT/tenant-isolation.txt"

echo "== Relational/history query =="
sql "$DB" "INSERT INTO validation_attendance(tenant_id,member_ref,logical_key,occurred_at,note) VALUES
 ('tenant-a','shared-member','relational-a-001','2026-09-05T08:00:00Z','synthetic'),
 ('tenant-b','shared-member','relational-b-001','2026-09-06T08:00:00Z','synthetic');" >/dev/null
REL_QUERY="SELECT m.member_ref,m.eligibility_marker,latest.occurred_at AS latest_attendance,
 COALESCE(h.history_count,0) AS history_count
FROM validation_member_ref m
LEFT JOIN LATERAL (
 SELECT a.occurred_at FROM validation_attendance a
 WHERE a.tenant_id=m.tenant_id AND a.member_ref=m.member_ref
 ORDER BY a.occurred_at DESC,a.id DESC LIMIT 1
) latest ON true
LEFT JOIN LATERAL (
 SELECT count(*)::integer AS history_count FROM validation_history vh
 WHERE vh.tenant_id=m.tenant_id AND vh.member_ref=m.member_ref
) h ON true
WHERE m.tenant_id='tenant-a'
ORDER BY latest.occurred_at NULLS FIRST,m.member_ref LIMIT 10;"
sql "$DB" "$REL_QUERY" > "$RESULT/relational-query.txt"
sql "$DB" "EXPLAIN (ANALYZE,BUFFERS,FORMAT TEXT) $REL_QUERY" > "$RESULT/relational-query-explain.txt"
REL_ROWS="$(sql "$DB" "SELECT count(*) FROM validation_member_ref WHERE tenant_id='tenant-a';")"; assert_eq "$REL_ROWS" 2 "relational seed"

echo "== Application client + SQLSTATE =="
mkdir -p "$NODE_CLIENT"
npm install --prefix "$NODE_CLIENT" --package-lock=false --no-save --ignore-scripts pg@8.16.3 >/dev/null
PG_CLIENT_VERSION="$(node -p "require('$NODE_CLIENT/node_modules/pg/package.json').version")"
NODE_VERSION="$(node --version)"
echo "Node: $NODE_VERSION" >> "$RESULT/tool-versions.txt"; echo "Temporary pg client: $PG_CLIENT_VERSION" >> "$RESULT/tool-versions.txt"
export PGDATABASE="$DB"
node "$CLIENT" connection | tee "$RESULT/application-connection.json"
node "$CLIENT" errors | tee "$RESULT/error-translation.json"

echo "== Backup + separate restore =="
docker exec -e PGPASSWORD="$PGPASSWORD" "$CONTAINER" pg_dump -U "$PGUSER" -d "$DB" -Fc > "$DUMP"
[ -s "$DUMP" ] || fail "empty dump"
createdb_v "$RESTORE_DB"
docker exec -i -e PGPASSWORD="$PGPASSWORD" "$CONTAINER" pg_restore -U "$PGUSER" -d "$RESTORE_DB" --no-owner --no-privileges < "$DUMP"
assert_eq "$(sql "$RESTORE_DB" "SELECT count(*) FROM validation_attendance WHERE tenant_id='tenant-a' AND member_ref='member-001' AND logical_key='attendance-race-001';")" 1 "restored attendance"
assert_eq "$(sql "$RESTORE_DB" "SELECT count(*) FROM validation_provider_event WHERE provider='synthetic-provider' AND provider_event_id='provider-event-001';")" 1 "restored provider event"
assert_eq "$(sql "$RESTORE_DB" "SELECT count(*) FROM validation_business_effect WHERE effect_key='validation-order-001:renewal-effect';")" 1 "restored effect claim"
assert_eq "$(sql "$RESTORE_DB" "SELECT effect_count FROM validation_effect_target WHERE tenant_id='tenant-a' AND target_ref='target-001';")" 1 "restored effect mutation"
assert_eq "$(sql "$RESTORE_DB" "SELECT count(*) FROM validation_no_show_case WHERE status='active' AND tenant_id='tenant-a' AND member_ref='member-001' AND rule_key='rule-001';")" 1 "restored active no-show"
sql "$RESTORE_DB" "$REL_QUERY" > "$RESULT/restored-relational-query.txt"

echo "== Restart + reconnect + idempotent replay =="
RESTART_SQL="BEGIN;
WITH claimed AS (
 INSERT INTO validation_business_effect(effect_key,tenant_id,target_ref)
 VALUES('restart-critical-effect','tenant-a','target-restart')
 ON CONFLICT DO NOTHING RETURNING 1)
UPDATE validation_effect_target SET effect_count=effect_count+1
 WHERE tenant_id='tenant-a' AND target_ref='target-restart' AND EXISTS(SELECT 1 FROM claimed);
COMMIT;"
sql "$DB" "$RESTART_SQL" >/dev/null
assert_eq "$(sql "$DB" "SELECT effect_count FROM validation_effect_target WHERE tenant_id='tenant-a' AND target_ref='target-restart';")" 1 "pre-restart effect"
docker stop "$CONTAINER" >/dev/null
node "$CLIENT" expect-unavailable | tee "$RESULT/unavailable.json"
docker start "$CONTAINER" >/dev/null; wait_pg
node "$CLIENT" reconnect | tee "$RESULT/reconnect.json"
sql "$DB" "$RESTART_SQL" >/dev/null
POST_EFFECT="$(sql "$DB" "SELECT effect_count FROM validation_effect_target WHERE tenant_id='tenant-a' AND target_ref='target-restart';")"
POST_CLAIM="$(sql "$DB" "SELECT count(*) FROM validation_business_effect WHERE effect_key='restart-critical-effect';")"
assert_eq "$POST_EFFECT" 1 "post-restart effect"; assert_eq "$POST_CLAIM" 1 "post-restart claim"

cat >> "$SUMMARY" <<EOF
Node validation runtime: $NODE_VERSION
Temporary application client: pg $PG_CLIENT_VERSION
Migration from zero: PASS
Forward migration: PASS
Attendance concurrency: PASS (12 overlapping sessions; created=$ATT_CREATED final=$ATT_FINAL)
Provider-event dedupe: PASS (12 overlapping sessions; created=$PROVIDER_CREATED final=$PROVIDER_FINAL)
Exactly-once business effect: PASS (12 overlapping sessions; claims=$EFFECT_CLAIMS target=$EFFECT_COUNT replay unchanged)
Single-active no-show: PASS (12 overlapping sessions; one active; resolved history plus later active coexist)
Rollback: PASS (new connection; before=$BEFORE after=$AFTER partial_rows=$PARTIAL)
Tenant SQL isolation: PASS
Relational/history query: PASS (bounded tenant query + EXPLAIN ANALYZE)
Database error translation: PASS (actual SQLSTATEs captured)
Backup: PASS (custom pg_dump; source=$DB; dump not committed)
Restore: PASS (separate DB=$RESTORE_DB)
Restored invariant verification: PASS
Connection: PASS
Concurrent connections: PASS (race sessions + 6 Node connections)
Database unavailable behavior: PASS
Restart: PASS (disposable container only)
Reconnect: PASS
Post-restart replay: PASS
Optional ambiguous commit-window test: NOT RUN
Stage 3: PASS
Stage 6: PASS
Not proven: managed HA, multi-AZ, provider failover, regional DR, PITR, production SLA
EOF
cat "$SUMMARY"
