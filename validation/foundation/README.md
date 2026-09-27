# GymPulse Foundation Validation Harness

Status: validation-only / non-production.

This directory exists only to gather technical acceptance evidence for ADR-0001 through ADR-0004. It is not the GymPulse production scaffold and does not accept Node.js, TypeScript, a package manager, a web framework, a job runner, a data-access tool, PostgreSQL provider, CI platform, or hosting provider.

The harness intentionally uses no third-party runtime dependencies. `package.json` only marks the validation files as ESM; it is not a production package-manager decision.

## What this harness proves now

- strict TypeScript compilation for separate client/request/worker validation artifacts;
- client-safe/server-only import boundary checks;
- cycle detection including deliberate negative fixtures;
- protected command path with tenant/branch/capability checks;
- runtime validation of untrusted input;
- request and worker adapters reusing the same application/domain behavior;
- replay-safe attendance result using validation-only durable file state;
- separate-process replay after restart-style handoff;
- gym-timezone date boundary behavior;
- raw-byte HMAC webhook verification and tamper rejection;
- provider-event replay dedupe in validation-only durable state.

## What this harness does not prove

- PostgreSQL transactions, constraints, concurrency, backup/restore, pooling, or restart behavior;
- production schema;
- Member/Membership final state model;
- production performance;
- production hosting/region/jurisdiction;
- decision-owner approval.

Real PostgreSQL evidence remains required by `docs/adr/foundation-acceptance-evidence-plan.md`.

## Real PostgreSQL Validation Attempt — 2026-09-27

Overall result:

```text
Real PostgreSQL Foundation Validation = BLOCKED
```

Environment gate:

```text
PostgreSQL server: unavailable
psql: unavailable
pg_dump / pg_restore: unavailable
Docker: unavailable
Podman: unavailable
nerdctl: unavailable
local 5432 listener/socket: none
PostgreSQL server/client packages: none
libpq libraries only: 17.10
apt PostgreSQL candidate: none
DNS resolution to Debian package host: unavailable
```

No PostgreSQL server version can be recorded because no real server is available.

No temporary PostgreSQL driver was installed.

No container image was used.

No validation database/schema, credentials, backup, restore database, or PostgreSQL-specific state was created.

No external managed database or potentially billable cloud/CI resource was provisioned.

The PostgreSQL-specific Stage 3 and Stage 6 evidence rows remain `NOT RUN`; see `EVIDENCE.md`.

Next technical prerequisite:

```text
obtain/authorize an isolated real PostgreSQL validation environment
```

Allowed environment remains:

```text
non-production
isolated
synthetic-data only
safe to restart
safe to delete
```

Do not substitute SQLite, DuckDB, JSON/file state, an in-memory map, mocks, or documentation inference.

Preserve:

```text
validation harness
!=
production scaffold

file-backed durability
!=
PostgreSQL evidence
```

### Environment-gate reproduction

```sh
command -v psql postgres pg_ctl initdb pg_dump pg_restore createdb dropdb docker podman nerdctl
ls -ld /usr/lib/postgresql /var/lib/postgresql /var/run/postgresql
dpkg -l | awk '/^ii/ && $2 ~ /^postgresql|^postgresql-client|^libpq/ {print $2,$3}'
ss -ltn | grep -E '(:5432\\b)'
find /tmp /var/run -maxdepth 3 -type s -name '.s.PGSQL.5432'
apt-cache policy postgresql postgresql-client
getent hosts deb.debian.org
```

### Cleanup

No PostgreSQL resources were created, so there is no database/container/volume/backup/credential cleanup from this blocked attempt.

Compiled TypeScript output and validation-only file state remain disposable under the existing harness rules.

## Reproduce in a compatible environment

```text
tsc -p tsconfig.client.json
tsc -p tsconfig.request.json
tsc -p tsconfig.worker.json
node scripts/check-boundaries.mjs .
node scripts/check-boundaries.mjs . --fixtures
node scripts/run-tests.mjs
node scripts/request-once.mjs <temporary-state-file>
node scripts/worker-replay.mjs <same-temporary-state-file>
```

Compiled output and state files are disposable and are not committed.
