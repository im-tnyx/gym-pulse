# Foundation Validation Evidence

## Document Control

- Status: Foundation technical evidence complete for Real PostgreSQL Stage 3 / Stage 6; governance approval still required
- Date: 2026-09-29
- Scope: ADR-0001 through ADR-0004
- Approval effect: none
- Production implementation effect: none
- Canonical decision effect: none

## Current Execution Record

The prior 2026-09-27 sandbox attempt remains historical evidence that the original execution environment could not run PostgreSQL. It is superseded for the technical PostgreSQL gate by the successful authorized validation run below.

```text
Repository baseline audited:
67bfaafbd45d8be7a26dabe82d0261bf84a7d0c3

Validation runner:
GitHub Actions hosted Ubuntu runner
Ubuntu 24.04.5 LTS
runner version 2.337.0

Workflow run:
36554395928

Validation head:
e257e6ef5f3aa6eb26b159fb4374da06dbfd2d9d

Workflow job:
109359954215

Artifact:
foundation-postgres-evidence
artifact id 11025937126
artifact SHA-256 a4e4f54c3b94c6c16efd4cc259223b374712e758821862239a735978c8d01b2c

Docker:
Docker version 28.0.4, build b8034c0

PostgreSQL image:
postgres:17-bookworm

Image digest:
postgres@sha256:639ab7ceb90e13123085b741fb31ef493fba25463002f6da665352e7b534b652

PostgreSQL server:
17.11 (Debian 17.11-1.pgdg12+2)

psql:
17.11 (Debian 17.11-1.pgdg12+2)

pg_dump:
17.11 (Debian 17.11-1.pgdg12+2)

pg_restore:
17.11 (Debian 17.11-1.pgdg12+2)

Node validation runtime:
v22.23.2

Temporary validation-only PostgreSQL client:
pg 8.16.3
```

These versions are validation evidence only. They are not production version pins, provider choices, CI/CD acceptance, or data-access-tool acceptance.

## Safety Boundary

```text
non-production = yes
synthetic data only = yes
localhost/private PostgreSQL binding = yes
production member data = none
production payment data = none
production provider credentials = none
external managed database = none
production infrastructure = none
validation container/volume/dump/client cleanup = PASS
```

Preserve:

```text
Validation Harness
!=
Production Scaffold

Validation PostgreSQL
!=
Production PostgreSQL Provider

Temporary PostgreSQL Driver
!=
D-ARCH-017 Acceptance

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

## Evidence Matrix

| ADR | Evidence Requirement | Test / Artifact | Result | Remaining Gap |
|---|---|---|---|---|
| ADR-0001 | module/application dependency direction | `scripts/check-boundaries.mjs` on existing validation source | PASS | Broader production-scale multi-domain direct-write enforcement remains future implementation evidence |
| ADR-0001 | forbidden boundary detection | deliberate `fixtures/forbidden-client.ts` | PASS | None for this bounded proof |
| ADR-0001 | request + worker reuse same application behavior | existing validation application/request/worker path | PASS | Production job-runner integration remains separately governed |
| ADR-0001 | protected command authorization negatives | tenant/branch/capability negative tests | PASS | Full authorization matrix remains ADR-0009/testing follow-up |
| ADR-0001 | retry produces one effective attendance result | file-backed replay plus real PostgreSQL concurrent attendance test | PASS | Production Attendance schema remains unfinalized |
| ADR-0001 | local transactional/idempotent business effect | real PostgreSQL transactional effect claim + target mutation | PASS | Production payment/renewal effect path remains separately implemented/validated |
| ADR-0002 | strict TypeScript representative boundaries | existing three strict `tsc` builds | PASS | Exact production TypeScript/Node versions remain unaccepted |
| ADR-0002 | runtime validation rejects malformed external input | existing malformed request test | PASS | Production schema library remains unselected |
| ADR-0002 | protected application command | existing principal/scope/capability/application/port flow | PASS | Production persistence implementation remains separately governed |
| ADR-0002 | raw signed webhook bytes preserved/verified | existing HMAC fixture | PASS | Real provider/framework integration remains future evidence |
| ADR-0002 | real transaction-heavy PostgreSQL runtime path | temporary Node `pg` client + real PostgreSQL | PASS | Temporary `pg` version is not D-ARCH-017 acceptance |
| ADR-0002 | disconnect/reconnect behavior | stop PostgreSQL -> observed unavailable -> reconnect | PASS | Production topology/pooling/HA remains external |
| ADR-0003 | independent build artifacts | existing client/request/worker TypeScript builds | PASS | Production app/package topology unaccepted |
| ADR-0003 | dependency cycle detection | deliberate cycle fixtures | PASS | Future production workspace CI integration pending |
| ADR-0003 | shared client-safe contract | existing shared contract proof | PASS | Generated/public contract strategy remains ADR-0011 |
| ADR-0004 | real PostgreSQL engine/version recorded | authorized disposable Docker validation runner | PASS | Exact production PostgreSQL release remains unselected |
| ADR-0004 | migration from zero | `postgres/sql/001-initial.sql` on clean validation DB | PASS | Production migration framework/schema remains separately governed |
| ADR-0004 | forward migration | `postgres/sql/002-forward.sql` preserves seeded data | PASS | Production expand/contract strategy still requires implementation evidence |
| ADR-0001 / ADR-0002 / ADR-0004 | concurrent attendance uniqueness | 12 overlapping PostgreSQL sessions | PASS | Validation schema only |
| ADR-0004 | provider-event dedupe under DB uniqueness | 12 overlapping PostgreSQL sessions | PASS | Provider-neutral validation only |
| ADR-0001 / ADR-0004 | exactly-once business effect | 12 overlapping transactional claims + replay | PASS | Production domain effect mapping remains separate |
| ADR-0004 | single-active no-show invariant | 12 overlapping inserts + validation-only partial unique index | PASS | Final no-show schema remains unfinalized |
| ADR-0001 / ADR-0002 / ADR-0004 | transaction rollback | forced failure after two writes, then fresh-connection verification | PASS | Validation schema only |
| ADR-0004 | tenant-scoped SQL isolation | Tenant A / Tenant B scoped queries | PASS | Does not accept RLS or production DB role model |
| ADR-0004 | representative relational aggregate/history query | tenant predicate + joins/latest lookup/history count + bounded order + EXPLAIN ANALYZE | PASS | Tiny synthetic dataset is not production performance evidence |
| ADR-0001 / ADR-0002 / ADR-0004 | database error translation | real PostgreSQL constraint errors through temporary Node client | PASS | Production API error contract remains separately governed |
| ADR-0004 | backup creation | custom-format `pg_dump` | PASS | Local validation backup does not prove production retention/PITR |
| ADR-0004 | restore into separate database | `pg_restore` into distinct validation DB | PASS | Managed recovery topology remains external |
| ADR-0004 | restored invariant verification | attendance/provider-event/effect/no-show/query checks | PASS | Production recovery objectives remain external |
| ADR-0002 / ADR-0004 | application-style connection | temporary Node `pg 8.16.3` client | PASS | No production client/pool strategy accepted |
| ADR-0004 | concurrent connections | race sessions plus six simultaneous Node connections | PASS | No production pool size inferred |
| ADR-0004 | disconnect/unavailable behavior | stopped disposable PostgreSQL container | PASS | Local interruption only |
| ADR-0004 | database restart | disposable container stop/start | PASS | Not managed HA/failover evidence |
| ADR-0002 / ADR-0004 | reconnect/recovery | Node reconnect after restart | PASS | Production connection topology remains external |
| ADR-0001 / ADR-0004 | post-restart replay does not duplicate committed effect | durable effect key + replay | PASS | Local restart only |
| ADR-0004 | optional ambiguous commit-window fault injection | no disproportionate network fault injection added | NOT RUN | Optional extra scenario |
| ADR-0001..0004 | authorized decision owner | human governance evidence | EXTERNAL / HUMAN EVIDENCE REQUIRED | Decision Owner remains Open |
| ADR-0001..0004 | explicit acceptance/rejection | human governance evidence | EXTERNAL / HUMAN EVIDENCE REQUIRED | No approval record exists |
| ADR-0004 | launch jurisdiction / production region / provider / RPO / RTO / retention / admin-support access / production connection topology | external governance/platform evidence | EXTERNAL / HUMAN EVIDENCE REQUIRED | Not decided by local validation |

## Stage 3 Observed Results

```text
Migration from zero:
PASS

Forward migration:
PASS

Concurrent attendance uniqueness:
PASS
attempts = 12
created = 1
conflicts = 11
final effective attendance rows = 1

Provider-event dedupe:
PASS
attempts = 12
created = 1
final durable provider-event claims = 1

Exactly-once business effect:
PASS
overlapping attempts = 12
business-effect claims = 1
target effect count = 1
later replay = unchanged

Single-active no-show:
PASS
overlapping attempts = 12
active after race = 1
resolved historical case + later active case = valid

Transaction rollback:
PASS
target before = 1
target after forced failure = 1
partial history rows after rollback = 0
verification used a new connection

Tenant-scoped SQL:
PASS
Tenant A query returned only Tenant A rows
Tenant B query returned only Tenant B rows

Representative relational/history query:
PASS
Tenant A bounded result rows = 2
join/latest lookup/history aggregate = exercised
EXPLAIN ANALYZE = captured

Database error translation:
PASS
```

Observed PostgreSQL SQLSTATE mappings:

| PostgreSQL observation | SQLSTATE | Validation/application category |
|---|---:|---|
| unique violation | `23505` | `already_applied` |
| foreign-key violation | `23503` | `invalid_reference` |
| check violation | `23514` | `invalid_value` |

Preserve:

```text
SQLSTATE
!=
Application API Error Contract
```

## Representative Relational Query Evidence

Observed Tenant A result:

```text
shared-member | unknown  | 2026-09-05 08:00:00+00              | history_count 1
member-001    | eligible | 2026-09-29 10:15:31.552021+00       | history_count 2
```

The captured plan used the tenant/member primary-key index, the validation attendance unique index, lateral latest-attendance lookup, history aggregation, deterministic ordering, and `LIMIT 10`.

The synthetic query completed in approximately 0.194 ms in this tiny validation dataset. This is query-shape evidence only and MUST NOT be presented as a production performance/capacity claim.

## Stage 6 Observed Results

```text
Backup:
PASS
format = PostgreSQL custom format
tool = pg_dump 17.11
dump committed to repository = no

Restore:
PASS
source DB != restore DB

Restored invariant verification:
PASS

Application-style connection:
PASS

Concurrent connections:
PASS
12-session race scenarios
+
6 simultaneous Node client connections

Database unavailable behavior:
PASS

Restart:
PASS
disposable validation PostgreSQL only

Reconnect:
PASS

Post-restart replay:
PASS
committed state survived
effect claim count remained 1
target effect count remained 1

Cleanup:
PASS
container removed
volume removed
temporary dump removed
temporary validation client removed
```

Local restart/recovery evidence does NOT prove:

```text
managed HA
multi-AZ
provider failover
regional disaster recovery
PITR
production SLA
production connection topology
```

## Reproduction

Reusable validation harness:

```text
validation/foundation/postgres/
```

Primary entry command on an already-authorized Docker runner:

```bash
bash validation/foundation/postgres/scripts/run-validation.sh
```

The successful evidence run used a temporary branch-only GitHub Actions workflow as execution orchestration. That workflow is evidence of one authorized run, not acceptance of GitHub Actions under D-ARCH-019.

## Current Readiness Impact

```text
Real PostgreSQL Foundation Validation: PASS

Stage 3: PASS
Stage 6: PASS

ADR-0001: Proposed
ADR-0002: Proposed
ADR-0003: Proposed
ADR-0004: Proposed

D-ARCH-005: PROPOSED
D-ARCH-016: PROPOSED
D-ARCH-001: PROPOSED
D-ARCH-002: PROPOSED

Decision Owner: Open
Explicit Approval: Missing
Production implementation gate: closed
```

The PostgreSQL environment blocker is removed for the bounded foundation technical evidence plan.

The technical evidence is now sufficiently complete to prepare the **Foundation Decision-Owner Review Packet** as the next bounded governance action.

That next action may review evidence and request an explicit decision. It must not auto-Accept an ADR, auto-promote a canonical decision to `DECIDED`, select a production PostgreSQL provider, or claim GymPulse is implementation-ready.
