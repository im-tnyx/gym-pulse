# GymPulse Foundation Validation Harness

Status: validation-only / non-production.

This directory exists only to gather technical acceptance evidence for ADR-0001 through ADR-0004. It is not the GymPulse production scaffold and does not accept Node.js, TypeScript, a package manager, a web framework, a job runner, a data-access tool, a PostgreSQL provider, a CI platform, or a hosting provider.

## What this harness proves now

The original validation slice proves:

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

The real PostgreSQL extension under `postgres/` additionally proves, for the bounded synthetic validation model:

- migration from an empty PostgreSQL database;
- one forward-compatible validation migration with seeded-data preservation;
- real overlapping-session attendance uniqueness;
- real overlapping-session provider-event dedupe;
- one transactional business-effect claim + target mutation under concurrency and replay;
- one-active validation no-show uniqueness with historical resolved case + later active case;
- transaction rollback verified from a fresh connection;
- explicit tenant-scoped SQL negative isolation;
- a bounded relational/latest/history query with `EXPLAIN ANALYZE`;
- observed unique/FK/check SQLSTATE translation;
- custom-format PostgreSQL backup;
- restore into a separate database plus invariant rechecks;
- application-style Node PostgreSQL connection and reconnect;
- multiple simultaneous connections;
- unavailable behavior during PostgreSQL stop;
- restart/reconnect;
- post-restart idempotent replay.

## Real PostgreSQL Validation — 2026-09-29

Overall result:

```text
Real PostgreSQL Foundation Validation = PASS
Stage 3 = PASS
Stage 6 = PASS
Cleanup = PASS
```

Execution environment:

```text
GitHub Actions hosted Ubuntu 24.04.5 validation runner
Docker 28.0.4

PostgreSQL image:
postgres:17-bookworm

Image digest:
postgres@sha256:639ab7ceb90e13123085b741fb31ef493fba25463002f6da665352e7b534b652

PostgreSQL server / psql / pg_dump / pg_restore:
17.11 (Debian 17.11-1.pgdg12+2)

Node validation runtime:
v22.23.2

Temporary validation-only client:
pg 8.16.3
```

Execution references:

```text
workflow run: 36554395928
validation head: e257e6ef5f3aa6eb26b159fb4374da06dbfd2d9d
workflow job: 109359954215
artifact id: 11025937126
artifact digest: sha256:a4e4f54c3b94c6c16efd4cc259223b374712e758821862239a735978c8d01b2c
```

The workflow existed only on the temporary validation branch used to execute this bounded run. The reusable harness is committed under `validation/foundation/postgres/`.

## Reproduce

Existing non-PostgreSQL validation:

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

Real PostgreSQL validation on an already-authorized Docker runner:

```bash
bash validation/foundation/postgres/scripts/run-validation.sh
```

The PostgreSQL runner creates uniquely named validation-only resources, binds PostgreSQL to localhost/private access, generates synthetic credentials at runtime, uses synthetic data only, backs up/restores only the validation databases, and removes the container, volume, dump, and temporary Node client on exit.

## What this harness does not prove

- final production schema;
- final Member/Membership state model;
- production RLS policy;
- production runtime/migration/admin database-role design;
- production ORM/query-builder/migration-tool selection;
- production PostgreSQL provider;
- production PostgreSQL version pin;
- production connection-pool sizing;
- production performance/capacity;
- managed HA or multi-AZ behavior;
- provider failover;
- regional disaster recovery;
- PITR;
- production SLA;
- launch region/jurisdiction;
- RPO/RTO or backup retention;
- decision-owner approval.

Optional disproportionate commit-window network fault injection remains `NOT RUN`; durable post-restart replay was proven through the business-effect identity instead.

## Safety / Decision Boundaries

```text
Validation Harness
!=
Production Scaffold

File-backed durability
!=
PostgreSQL evidence

Validation PostgreSQL
!=
Production PostgreSQL Provider

Temporary PostgreSQL Driver
!=
D-ARCH-017 Acceptance

Docker Validation Container
!=
Production Container Architecture

Explicit Tenant Query
!=
RLS Acceptance

Validation Schema
!=
Production Schema

Passing Technical Evidence
!=
ADR Acceptance
```

No production/member/payment/provider data or production credentials were used.

No external managed database was provisioned.

## Current Governance State

```text
ADR-0001 = Proposed
ADR-0002 = Proposed
ADR-0003 = Proposed
ADR-0004 = Proposed

D-ARCH-005 = PROPOSED
D-ARCH-016 = PROPOSED
D-ARCH-001 = PROPOSED
D-ARCH-002 = PROPOSED

Decision Owner = Open
Explicit Approval = Missing
```

The PostgreSQL technical blocker is resolved for this bounded foundation evidence plan. The next bounded governance action is the **Foundation Decision-Owner Review Packet**; that review must not automatically accept any ADR.
