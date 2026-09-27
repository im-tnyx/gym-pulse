# Foundation Validation Evidence

## Document Control

- Status: Partial validation evidence
- Date: 2026-09-27
- Scope: ADR-0001 through ADR-0004
- Approval effect: none
- Production implementation effect: none

## Environment Used

```text
Validation host: current isolated ChatGPT execution sandbox
Node.js: v22.16.0
TypeScript compiler: 5.8.3

PostgreSQL server version: NOT AVAILABLE
PostgreSQL client version: NOT AVAILABLE
pg_dump / pg_restore version: NOT AVAILABLE
temporary PostgreSQL driver: NOT USED
container image/tag/digest: NOT USED

PostgreSQL server/client binaries: unavailable
Docker / Podman / nerdctl: unavailable
local TCP listener on 5432: none found
local PostgreSQL socket on 5432: none found
installed PostgreSQL server/client packages: none found
installed libpq libraries: libpq 17.10 only; no server/client executable
apt PostgreSQL candidate: none
DNS resolution for deb.debian.org: unavailable
```

Environment-gate probe:

```sh
command -v psql postgres pg_ctl initdb pg_dump pg_restore createdb dropdb docker podman nerdctl
ls -ld /usr/lib/postgresql /var/lib/postgresql /var/run/postgresql
find /usr/lib/postgresql -maxdepth 3 -type f \
  \( -name postgres -o -name psql -o -name pg_dump -o -name pg_restore \)
dpkg -l | awk '/^ii/ && $2 ~ /^postgresql|^postgresql-client|^libpq/ {print $2,$3}'
ss -ltn | grep -E '(:5432\\b)'
find /tmp /var/run -maxdepth 3 -type s -name '.s.PGSQL.5432'
apt-cache policy postgresql postgresql-client
getent hosts deb.debian.org
```

Observed result:

```text
Real PostgreSQL Foundation Validation = BLOCKED
Reason = no approved real PostgreSQL environment is available in this sandbox
No substitute database used
No external managed database/cloud resource provisioned
```

These exact versions/environment observations are validation evidence only and are not accepted production choices.

## Evidence Matrix

| ADR | Evidence Requirement | Test / Artifact | Result | Remaining Gap |
|---|---|---|---|---|
| ADR-0001 | module/application dependency direction | `scripts/check-boundaries.mjs` on `src/` | PASS | Broader multi-domain direct-write enforcement still needs a larger/future slice |
| ADR-0001 | forbidden boundary is actually detected | deliberate `fixtures/forbidden-client.ts` | PASS | None for this narrow boundary proof |
| ADR-0001 | request + worker reuse same application behavior | `handleRequest` and `handleWorkerDelivery` both call `checkIn` | PASS | Real job-runner integration remains separately governed |
| ADR-0001 | protected command authorization negatives | tenant/branch/capability negative tests | PASS | Full authorization matrix remains ADR-0009/testing follow-up |
| ADR-0001 | retry produces one effective attendance result | request replay + worker replay | PASS | Real DB concurrency still pending |
| ADR-0001 | module-aware diagnostics/correlation | correlation ID carried into result across request/worker adapters | PASS (narrow) | Production observability backend/correlation remains ADR-0020 |
| ADR-0002 | strict TypeScript representative boundaries | three strict `tsc` builds | PASS | Exact production TypeScript/Node versions remain unaccepted |
| ADR-0002 | runtime validation rejects malformed external input | malformed request test | PASS | Production schema library remains unselected |
| ADR-0002 | protected application command | principal -> scope/capability -> eligibility -> application -> port | PASS | Real persistence transaction pending |
| ADR-0002 | client-safe/server-only import isolation | negative fixture + separate client build | PASS | Production repository mechanism may differ |
| ADR-0002 | raw signed webhook bytes preserved/verified | `webhook.ts` HMAC fixture | PASS | Real provider/framework webhook integration pending |
| ADR-0002 | worker retry/restart assumption | separate Node processes share durable validation file state | PASS (architecture) | Production durable job technology pending |
| ADR-0002 | gym-local time behavior | UTC instant crosses date boundary in `Asia/Kolkata` | PASS | Broader business-time rules remain separate |
| ADR-0003 | independent build artifacts | client/request/worker TypeScript builds | PASS | Production app/package topology unaccepted |
| ADR-0003 | dependency cycle detection | deliberate cycle fixtures detected | PASS | Future production workspace CI integration pending |
| ADR-0003 | shared client-safe contract | client/request/worker reuse `contracts.ts` | PASS | Generated/public contract strategy remains ADR-0011 |
| ADR-0003 | affected build/test behavior | separate scoped compile commands | PASS (narrow) | No production CI baseline exists |
| ADR-0004 | real PostgreSQL concurrency/idempotency | requires real PostgreSQL | NOT RUN | PostgreSQL unavailable in execution environment |
| ADR-0004 | transaction rollback | requires real PostgreSQL | NOT RUN | PostgreSQL unavailable |
| ADR-0004 | tenant-scoped SQL behavior | requires real PostgreSQL | NOT RUN | PostgreSQL unavailable |
| ADR-0004 | representative relational aggregate/history query | requires real PostgreSQL | NOT RUN | PostgreSQL unavailable |
| ADR-0004 | backup + restore rehearsal | requires `pg_dump` / restore-capable PostgreSQL | NOT RUN | PostgreSQL tooling unavailable |
| ADR-0004 | connection/pooling/restart behavior | requires real PostgreSQL + client/driver | NOT RUN | PostgreSQL unavailable; production data-access tool remains unaccepted |
| ADR-0001..0004 | authorized decision owner | human governance evidence | EXTERNAL / HUMAN EVIDENCE REQUIRED | Decision Owner remains Open |
| ADR-0001..0004 | explicit acceptance/rejection | human governance evidence | EXTERNAL / HUMAN EVIDENCE REQUIRED | No approval record exists |

## PostgreSQL Validation Evidence Matrix — Environment-Gated Attempt

Every PostgreSQL-specific item below is explicitly classified. No SQLite, DuckDB, file-backed state, in-memory map, mock database, fake repository, or documentation inference was used as PostgreSQL evidence.

| ADR | Evidence Requirement | Test / Artifact | Result | Reproducible Command | Remaining Gap |
|---|---|---|---|---|---|
| ADR-0004 | real PostgreSQL instance/version recorded | environment gate | NOT RUN | `command -v postgres psql pg_ctl initdb` | No server/client executable or approved isolated instance |
| ADR-0004 | migration from zero | requires isolated real PostgreSQL | NOT RUN | Requires approved PostgreSQL environment, then validation-only SQL sequence | Environment unavailable |
| ADR-0004 | forward migration | requires isolated real PostgreSQL | NOT RUN | Requires approved PostgreSQL environment, then validation-only forward SQL | Environment unavailable |
| ADR-0001 / ADR-0002 / ADR-0004 | concurrent attendance uniqueness | 8-20 genuinely overlapping DB attempts required | NOT RUN | Requires approved PostgreSQL environment | Environment unavailable |
| ADR-0004 | provider-event dedupe under DB uniqueness | concurrent/replay insert claim | NOT RUN | Requires approved PostgreSQL environment | Environment unavailable |
| ADR-0001 / ADR-0004 | exactly-once business effect | transactional unique effect claim + target mutation | NOT RUN | Requires approved PostgreSQL environment | Environment unavailable |
| ADR-0004 | single-active no-show invariant | concurrent active-case inserts + conditional uniqueness | NOT RUN | Requires approved PostgreSQL environment | Environment unavailable |
| ADR-0001 / ADR-0002 / ADR-0004 | transaction rollback | two-table transaction + forced failure + new-connection verification | NOT RUN | Requires approved PostgreSQL environment | Environment unavailable |
| ADR-0004 | tenant-scoped SQL isolation | tenant-a / tenant-b synthetic scoped query | NOT RUN | Requires approved PostgreSQL environment | Environment unavailable |
| ADR-0004 | representative relational aggregate/history query | tenant predicate + joins + aggregate/latest lookup + bounded ordering | NOT RUN | Requires approved PostgreSQL environment | Environment unavailable |
| ADR-0001 / ADR-0002 / ADR-0004 | database error translation | observe real SQLSTATE/constraint error and translate to stable result | NOT RUN | Requires approved PostgreSQL environment | Environment unavailable |
| ADR-0004 | backup creation | normal PostgreSQL backup tool | NOT RUN | Requires `pg_dump` against approved validation DB | `pg_dump` unavailable |
| ADR-0004 | restore into separate database | restore validation dump into distinct DB | NOT RUN | Requires `pg_restore`/equivalent and approved validation DBs | tooling/environment unavailable |
| ADR-0004 | restored invariant verification | rerun constraint/history checks against restored DB | NOT RUN | Requires successful backup/restore first | prior stages unavailable |
| ADR-0002 / ADR-0004 | application-style connection | temporary validation-only PostgreSQL client | NOT RUN | Requires approved PostgreSQL environment + temporary client | no server; no driver selected/installed |
| ADR-0004 | concurrent connections | genuinely overlapping DB sessions | NOT RUN | Requires approved PostgreSQL environment | Environment unavailable |
| ADR-0004 | disconnect/unavailable behavior | stop isolated DB / observe safe failure | NOT RUN | Requires disposable/safe-to-restart PostgreSQL | Environment unavailable |
| ADR-0004 | database restart | restart isolated PostgreSQL only | NOT RUN | Requires disposable/safe-to-restart PostgreSQL | Environment unavailable |
| ADR-0002 / ADR-0004 | reconnect/recovery | reconnect after isolated DB returns | NOT RUN | Requires restart-capable PostgreSQL environment | Environment unavailable |
| ADR-0001 / ADR-0004 | post-restart replay does not duplicate committed effect | retry same durable effect after restart | NOT RUN | Requires completed DB effect + restart sequence | Environment unavailable |
| ADR-0001..0004 | authorized decision owner | human governance evidence | EXTERNAL / HUMAN EVIDENCE REQUIRED | N/A | Decision Owner remains Open |
| ADR-0001..0004 | explicit acceptance/rejection | human governance evidence | EXTERNAL / HUMAN EVIDENCE REQUIRED | N/A | No approval record exists |

### PostgreSQL attempt disposition

```text
Overall PostgreSQL action = BLOCKED

Stage 3 real PostgreSQL correctness slice = NOT RUN
Stage 6 backup/restore/connection/restart = NOT RUN

No PostgreSQL version recorded because no server exists.
No PostgreSQL client/tool version recorded because no client tools exist.
No temporary PostgreSQL driver installed.
No container image used.
No validation database/schema created.
No backup artifact created.
No credentials created.
No cloud resource provisioned.
No production resource touched.
```

The next action remains:

```text
obtain/authorize an isolated real PostgreSQL validation environment
```

## Executed Results

Clean source boundary graph:

```json
{
  "violations": [],
  "cycles": []
}
```

Deliberate negative fixtures were correctly detected:

```json
{
  "violations": [
    "fixtures/forbidden-client.ts -> ../src/infrastructure.js"
  ],
  "cycles": [
    "fixtures/cycle-a.ts -> fixtures/cycle-b.ts -> fixtures/cycle-a.ts"
  ]
}
```

Runtime tests:

```json
{
  "strictRuntimeValidation": "PASS",
  "requestReplayDedup": "PASS",
  "workerReplayAfterNewRepositoryInstance": "PASS",
  "crossTenantNegative": "PASS",
  "crossBranchNegative": "PASS",
  "capabilityNegative": "PASS",
  "gymTimezoneBoundary": "PASS",
  "rawWebhookExactBytes": "PASS",
  "rawWebhookTamperReject": "PASS",
  "providerEventReplayDedup": "PASS"
}
```

Separate-process replay:

```text
process 1 -> {"attendanceId":"att-1","created":true,"correlationId":"corr-process-1"}
process 2 -> {"attendanceId":"att-1","created":false,"correlationId":"corr-process-2"}
```

## Important Limitation

The file-backed validation port proves only that correctness need not depend on process memory and that request/worker adapters can reuse application/domain logic across processes.

It is not evidence for the PostgreSQL decision itself.

ADR-0004 remains technically unvalidated until the real PostgreSQL stages run.

## Current Readiness Impact

```text
Real PostgreSQL Foundation Validation: BLOCKED

ADR-0001: existing partial supporting evidence preserved, still Proposed
ADR-0002: existing partial supporting evidence preserved, still Proposed
ADR-0003: existing partial supporting evidence preserved, still Proposed
ADR-0004: PostgreSQL-specific evidence NOT RUN, still Proposed

D-ARCH-005: PROPOSED
D-ARCH-016: PROPOSED
D-ARCH-001: PROPOSED
D-ARCH-002: PROPOSED
```

No ADR becomes acceptance-ready from this environment-gated attempt. The authorized decision owner/approval record remains missing, and ADR-0004 still lacks all required real PostgreSQL engine evidence.

No production implementation gate is opened.
