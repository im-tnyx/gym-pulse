# Foundation Validation Evidence

## Document Control

- Status: Partial validation evidence
- Date: 2026-09-27
- Scope: ADR-0001 through ADR-0004
- Approval effect: none
- Production implementation effect: none

## Environment Used

```text
Node.js: v22.16.0
TypeScript compiler: 5.8.3
PostgreSQL client/server tools: unavailable in execution environment
Docker/Podman: unavailable in execution environment
```

These exact versions/tools are validation evidence only and are not accepted production versions.

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
ADR-0001: more supporting evidence, still Proposed
ADR-0002: more supporting evidence, still Proposed
ADR-0003: more supporting evidence, still Proposed
ADR-0004: PostgreSQL-specific evidence still missing, still Proposed
```

No ADR becomes acceptance-ready solely from this partial harness because the authorized decision owner/approval record remains missing, and ADR-0004 still lacks its core database evidence.
