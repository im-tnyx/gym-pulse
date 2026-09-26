# Task 0023: Draft Background Jobs / Scheduler ADR

## Goal

Draft one `Proposed` ADR for canonical decision `D-ARCH-007`, defining the recommended durable background-job and scheduler architecture for GymPulse Phase 1 without creating queue/worker infrastructure.

Target:

`docs/adr/ADR-0015-background-jobs-scheduler.md`

## Inputs Read

Fresh latest-`main` canonical inputs:

- `.ai/README.md`
- `.ai/current-state.md`
- `.ai/task/0022-draft-api-deployment-boundary-adr.md`
- `docs/README.md`
- `docs/00-overview/assumptions.md`
- `docs/01-product/functional-requirements.md`
- `docs/01-product/non-functional-requirements.md`
- `docs/01-product/user-journeys.md`
- `docs/02-architecture/architecture-principles.md`
- `docs/02-architecture/architecture-overview.md`
- `docs/02-architecture/container-architecture.md`
- `docs/02-architecture/component-architecture.md`
- `docs/02-architecture/data-flow.md`
- `docs/02-architecture/technology-stack.md`
- `docs/adr/README.md`
- `docs/adr/ADR-0001-modular-monolith.md`
- `docs/adr/ADR-0003-monorepo-strategy.md`
- `docs/adr/ADR-0005-data-access-migration-strategy.md`
- `docs/adr/ADR-0006-managed-backend-responsibilities.md`
- `docs/adr/ADR-0009-authorization-implementation.md`
- `docs/adr/ADR-0010-data-layer-tenant-isolation-rls.md`
- `docs/adr/ADR-0014-api-deployment-boundary.md`

Legacy evidence:

- `docs/08-automations.md`
- `docs/12-security-audit.md`
- `docs/15-engineering-workflow.md`
- `docs/16-open-decisions.md`

Current official research was limited to decision-relevant durable queue/scheduler products/categories.

## Repository State Verified

Before creation:

- `docs/adr/ADR-0015-background-jobs-scheduler.md` did not exist.
- `.ai/task/0023-draft-background-jobs-scheduler-adr.md` did not exist.
- `D-ARCH-007` remained the exact next bounded decision after ADR-0014.
- canonical `D-ARCH-007` remained `P1 OPEN`.
- repository search found no explicit approval evidence promoting `D-ARCH-007` to `DECIDED`.
- no current ADR was `Accepted`.
- `D-ARCH-002` PostgreSQL remained `PROPOSED`, not accepted.
- `D-ARCH-016` TypeScript/Node remained `PROPOSED`, not accepted.
- `D-ARCH-008` Redis/cache remained `OPEN`.
- `D-ARCH-009` hosting remained `OPEN`.
- `D-ARCH-014` managed backend remained `OPEN`.
- ADR-0014 preserved a separate Background Execution Runtime but selected no queue/scheduler product.

## Canonical Decision State

```text
D-ARCH-007
Priority: P1
Status: OPEN
Decision: durable background-job/scheduler technology
Requirement: retries + visibility + tenant scope + deterministic dedupe
```

ADR-0015 is `Proposed`. Task 0023 does not change `D-ARCH-007` to `DECIDED`.

## Background Workloads Evaluated

Phase 1 workloads:

- daily no-show/inactivity scans,
- renewal-stage scans,
- notification dispatch,
- payment reconciliation/pending recovery,
- owner daily summaries,
- data-quality scans,
- selected attendance/payment/read-model continuations,
- provider-bound retryable work.

Canonical invariants:

```text
HTTP Request Runtime != Durable Background Execution
job delivery guarantee != business exactly-once
scheduler timing != business eligibility
job payload != canonical business state
job history != canonical audit/business history
```

## Technology Options Evaluated

### Option A — PostgreSQL-backed job runner/scheduler

Representative: pg-boss.

Evaluation included:

- same-DB transactional enqueue,
- retries/backoff,
- dead-letter handling,
- worker heartbeats/expiration,
- queue policies/concurrency,
- cron/RRULE/timezone scheduling,
- separate worker runtime,
- Postgres resource coupling.

### Option B — Postgres-native queue + Cron

Representatives:

- PGMQ,
- pg_cron,
- Supabase Queues + Cron as integrated managed evidence.

Evaluation included:

- Postgres-native durability,
- visibility timeout,
- archival,
- scheduling,
- platform coupling,
- worker composition.

### Option C — Managed durable task/workflow platform

Representative: Trigger.dev.

Evaluation included:

- managed durable execution,
- retries,
- queues/concurrency,
- schedules/timezones,
- run observability,
- idempotency features,
- external-provider transaction handoff,
- outbox requirement,
- long-running workflow capability.

### Option D — Redis-backed queue

Representative: BullMQ.

Evaluation included:

- Redis dependency,
- horizontal workers,
- retries/backoff,
- delayed/scheduled jobs,
- deduplication,
- external dual-write/outbox implications.

### Option E — Custom DB job table + poller/Cron

Evaluated fairly for SQL transparency and low external dependency, but found to transfer too much commodity queue correctness/operational burden into GymPulse.

## Current Official Research

Research date: `2026-09-26`.

Official/current sources reviewed:

- pg-boss: `https://pgboss.io/`
- pg-boss Introduction: `https://pgboss.io/introduction`
- pg-boss Transaction Adapters: `https://pgboss.io/api/adapters`
- pg-boss Queues: `https://pgboss.io/api/queues`
- pg-boss Scheduling: `https://pgboss.io/api/scheduling`
- pg-boss Workers: `https://pgboss.io/api/workers`
- Supabase Queues: `https://supabase.com/docs/guides/queues`
- Supabase PGMQ: `https://supabase.com/docs/guides/queues/pgmq`
- Supabase Cron: `https://supabase.com/docs/guides/cron`
- Trigger.dev Scheduled Tasks: `https://trigger.dev/product/scheduled-tasks`
- Trigger.dev Concurrency/Queues: `https://trigger.dev/product/concurrency-and-queues`
- Trigger.dev Product: `https://trigger.dev/product`
- BullMQ: `https://docs.bullmq.io/`
- BullMQ Retries: `https://docs.bullmq.io/guide/retrying-failing-jobs`
- BullMQ Deduplication: `https://docs.bullmq.io/guide/jobs/deduplication`

Research conclusions are evidence only; no product/library/provider is accepted.

## Evaluation Summary

Current strongest fit is conditional:

```text
PostgreSQL-backed durable queue/scheduler
+
separate worker runtime
+
same-transaction enqueue when possible
+
application-owned business idempotency
+
Durable Continuation abstraction
```

If PostgreSQL + compatible Node.js are accepted later, pg-boss is the leading current implementation candidate.

Why:

- transactional enqueue can close the canonical-write/enqueue dual-write gap,
- no additional Redis/broker baseline,
- retries/DLQ/scheduling are commodity features rather than custom code,
- Phase 1 load is correctness-heavy rather than extreme throughput,
- worker deployment remains separate,
- future external queue migration remains possible behind the port.

## Proposed Direction

```text
Application / Webhook transaction
  -> canonical writes
  -> durable continuation in same DB transaction where possible
  -> COMMIT

Background Worker Runtime
  -> claim durable job
  -> validate payload/version
  -> explicit tenant/system context
  -> reload current canonical state
  -> invoke shared application handler
  -> local transaction / provider adapter
  -> complete / retry / terminal fail
```

If queue/task execution is external to canonical DB:

```text
canonical transaction
  -> write durable outbox/continuation
COMMIT
  -> dispatcher
  -> external durable task platform
```

Direct post-commit fire-and-forget enqueue without durable recovery is not acceptable for required work.

## Job Context / Payload Model

Conceptual metadata:

```text
job_id
job_type
payload_version
tenant_id
gym_id
branch_id nullable
business_key / dedupe_key
scheduled_for
logical business date/time where relevant
correlation_id
attempt/status/error category operationally
```

Payloads contain stable identifiers/parameters, not large mutable record snapshots or secrets.

Job execution creates a trusted System/Job Context rather than pretending to be a human session.

## Scheduling / Timezone Model

Scheduler controls wake-up timing only.

Domain/application handlers control current eligibility.

Gym-local schedules use configured IANA timezone/business clock; event timestamps remain UTC.

Implementation may use:

- per-tenant schedule definitions, or
- a bounded due-tenant scan,

provided scheduling remains observable and business eligibility is rechecked.

Exact schedule frequency/missed-run policy remains per job type.

## Transactional Handoff

Preferred same-DB path:

```text
BEGIN
  canonical write
  audit/idempotency
  enqueue durable continuation
COMMIT
```

Preferred external-system path:

```text
BEGIN
  canonical write
  durable outbox record
COMMIT

dispatcher -> external task system
```

Application code uses a Durable Continuation port rather than a job-runner SDK directly.

## Retry / Dedupe / Business Idempotency

Distinct protections:

```text
job queue claim/delivery
!=
job dedupe
!=
request idempotency
!=
provider-event dedupe
!=
business-effect uniqueness
```

Handlers assume replay is possible.

Use:

- deterministic business keys,
- canonical state reload,
- database uniqueness/invariants,
- provider idempotency where available,
- bounded retries/backoff,
- terminal/dead-letter path.

No queue's “exactly once” wording is treated as exactly-once business semantics.

## Dead-Letter / Recovery

Required:

- visible terminal failures,
- preserved job/business/correlation identity,
- safe operator redrive,
- idempotency preserved during redrive,
- poison job isolation,
- cancellation not treated as undo.

A DLQ may be an implementation or an equivalent terminal failure state.

## Security / Tenant Scope

Workers use:

- explicit tenant/gym/branch scope,
- trusted System/Job Principal,
- least-privilege runtime credentials,
- separate migration/admin credentials,
- server-only provider secrets.

No browser/Member client receives queue access.

Job payload/logs avoid secrets and unnecessary PII.

If RLS is later accepted, worker DB access requires separately governed safe service/tenant context.

## Provider Boundaries

Notifications:

- reload current state/preferences,
- send or suppress,
- provider adapter,
- persist normalized attempt/result.

Payment reconciliation:

- provider verification remains mandatory,
- reuse payment application handler/business-effect uniqueness,
- never infer success from job completion.

Provider calls should not keep long correctness-critical DB transactions open.

## Reliability / Scaling Findings

Postgres-backed queue reduces infrastructure but shares OLTP resources.

Monitor:

- backlog,
- oldest job age,
- retry volume,
- failure/dead-letter count,
- execution duration,
- queue table growth,
- DB pressure,
- interactive latency impact.

Revisit external broker/managed durable workflows if queue load harms OLTP, long-running workflows dominate, orchestration becomes complex, provider rate/concurrency needs outgrow simple workers, multi-region requirements emerge, or team/hosting boundaries require separate infrastructure.

Redis remains unneeded until measured/tool-driven evidence exists.

## Observability Findings

Background operations require:

- job/run state,
- tenant-safe context,
- correlation IDs,
- attempts,
- sanitized failure categories,
- schedule lag,
- backlog/oldest age,
- terminal failure visibility,
- provider/reconciliation diagnostics.

Job history is operational metadata, not canonical business audit.

## Decisions Kept Separate

Task 0023 does not decide or accept:

```text
D-ARCH-002 PostgreSQL
D-ARCH-016 TypeScript/Node
D-ARCH-017 data-access tool
D-ARCH-014 managed backend/provider
D-ARCH-006 API deployment acceptance
D-ARCH-008 Redis
D-ARCH-009 hosting
D-ARCH-015 authorization acceptance
D-SEC-008 RLS
D-ARCH-018 testing toolchain
D-ARCH-019 CI/CD
D-PROVIDER-001 payment provider
D-PROVIDER-002 messaging provider
D-PROVIDER-006 observability provider
```

No queue/scheduler provider or library is accepted.

## Requirement IDs Referenced

Verified current canonical requirements include:

```text
FR-RETENTION-001
FR-RETENTION-003..007
FR-FOLLOWUP-005
FR-RETURN-001..002
FR-RENEWAL-001..002
FR-RENEWAL-007
FR-PAYMENT-002..007
FR-PAYMENT-009
FR-NOTIFICATION-001..004
FR-CONSENT-001..002
FR-SUMMARY-001
FR-DATA-QUALITY-001..002
FR-CROSS-001..004

NFR-RELIABILITY-001..008
NFR-AVAILABILITY-001..003
NFR-AVAILABILITY-005
NFR-SCALABILITY-002..005
NFR-OBSERVABILITY-001..007
NFR-OPERATIONS-001..005
NFR-MAINTAINABILITY-001..003
NFR-MAINTAINABILITY-005..006
NFR-TESTABILITY-001..005
```

No requirement ID was invented.

## Validation Required

Before acceptance, validate at least:

1. atomic canonical write + enqueue.
2. rollback prevents job creation.
3. outbox relay if an external system is tested.
4. concurrent workers.
5. crash after claim.
6. crash after business effect before completion acknowledgement.
7. provider succeeds before worker records result.
8. duplicate enqueue/business key.
9. terminal failure + operator redrive.
10. transient provider outage.
11. permanent provider failure.
12. rate-limit handling.
13. DB conflict retry.
14. invalid payload/version.
15. wrong tenant/resource scope.
16. tenant failure isolation.
17. stale renewal suppression.
18. stale notification/preference suppression.
19. no-show scan replay.
20. payment reconciliation exactly-once business effect.
21. data-quality corrupt-row isolation.
22. gym-local timezone scheduling.
23. DST behavior where applicable.
24. missed-run recovery.
25. server timezone differs from gym timezone.
26. old queued payload after deployment.
27. representative backlog/load.
28. OLTP impact.
29. graceful worker shutdown.
30. terminal/dead-letter visibility.
31. correlation propagation.
32. sensitive payload/log review.
33. future RLS worker-context compatibility.
34. real-Postgres integration tests.
35. external managed task fallback spike if required.

No validation spike was implemented.

## Files Changed

Created:

```text
docs/adr/ADR-0015-background-jobs-scheduler.md
.ai/task/0023-draft-background-jobs-scheduler-adr.md
```

Governance continuity updates:

```text
docs/adr/README.md
docs/README.md
.ai/current-state.md
```

## Open Questions

- final DB/runtime/tool acceptance,
- exact queue runner/library,
- exact worker hosting,
- exact retry/timeout/concurrency values,
- exact dead-letter retention/redrive permissions,
- schedule representation,
- missed-run policies,
- job history retention,
- worker RLS/service role,
- SLO/RPO/RTO,
- observability provider,
- whether measured load later justifies Redis/external durable workflow platform.

## Result

Task 0023 creates a review-ready proposal:

```text
Postgres-backed durable jobs/scheduling
+
separate worker runtime
+
same-transaction enqueue where possible
+
Durable Continuation port
+
business-level idempotency always
+
transactional outbox only when crossing to external queue/platform
+
no Redis baseline
```

If PostgreSQL + compatible Node runtime are later accepted, pg-boss is the leading implementation candidate.

ADR-0015 remains `Proposed`.

Canonical `D-ARCH-007` remains `OPEN`.

Explicitly not created/selected:

```text
No worker implementation
No queue
No scheduler
No Cron configuration
No pg-boss installation/acceptance
No Supabase Queues/Cron selection
No Trigger.dev selection
No BullMQ selection
No Redis
No outbox table
No job table
No migration
No queue schema
No worker deployment
No hosting provider
No DB provider
No CI/CD
No observability provider
No production secrets
No prior ADR accepted
No D-ARCH-007 promotion to DECIDED
```

## Next Recommended Task

Post-Task-0023 governance state was freshly re-read from:

- `docs/adr/README.md`
- `docs/00-overview/assumptions.md`
- `.ai/current-state.md`

The synchronized repository confirms the actual next bounded task as:

```text
Task 0024: Draft Hosting / Deployment Platform ADR
Primary decision: D-ARCH-009
Likely target: docs/adr/ADR-0016-hosting-deployment-platform.md
Initial ADR status: Proposed
Canonical D-ARCH-009 status: OPEN
```

The next ADR should evaluate hosting against ADR-0014 request-serving topology, ADR-0015 separate-worker requirements, database/network connectivity, TLS/custom routing, secret management, health/readiness, horizontal scaling, provider webhook reachability, environment separation, rollback, logs/metrics integration, regional/privacy constraints, cost/operability, and Phase 1 simplicity.

Task 0024 was not executed as part of Task 0023.
