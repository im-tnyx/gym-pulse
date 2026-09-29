# ADR-0015: Durable Background Jobs and Scheduler Strategy

## Status

`Proposed`

## Decision Metadata

- ADR: `ADR-0015`
- Primary Decision ID: `D-ARCH-007`
- Related Decision IDs: `D-ARCH-005`, `D-ARCH-016`, `D-ARCH-001`, `D-ARCH-002`, `D-ARCH-017`, `D-ARCH-014`, `D-ARCH-006`, `D-ARCH-008`, `D-ARCH-009`, `D-ARCH-015`, `D-SEC-008`, `D-ARCH-018`, `D-ARCH-019`, `D-PROVIDER-001`, `D-PROVIDER-002`, `D-PROVIDER-006`
- Decision Owner: `Open`
- Technical Owner: `Architecture / Backend / Platform / Reliability`
- Date Proposed: `2026-09-26`
- Date Accepted: `Not accepted`
- Supersedes: `None`
- Superseded By: `None`

## 1. Context

GymPulse Phase 1 requires durable scheduled and asynchronous work for business-critical operational workflows, including:

- no-show/inactivity scans,
- renewal-window scans,
- notification dispatch,
- payment reconciliation and pending recovery,
- owner daily summaries,
- data-quality scans,
- selected post-commit attendance/payment/read-model continuations,
- provider-bound retryable work.

The canonical architecture already separates:

```text
HTTP Request Runtime
!=
Durable Background Execution
```

and requires background handlers to reuse the same application/domain rules as interactive requests.

The unresolved question under `D-ARCH-007` is:

> What durable job/scheduler architecture should GymPulse use for Phase 1 so that scheduled and asynchronous work is retry-safe, tenant-scoped, observable, recoverable, and operationally simple without introducing unnecessary infrastructure?

This ADR proposes a technology category and leading implementation direction. It does not provision or accept a queue, scheduler, worker platform, database, hosting provider, or managed backend.

Canonical `D-ARCH-007` remains `P1 OPEN` until explicit approval evidence changes it.

## 2. Requirements and Decision Drivers

### 2.1 Functional requirements

Retention and follow-up:

- `FR-RETENTION-001`: inactivity threshold is gym-policy driven.
- `FR-RETENTION-003..005`: scans must apply eligibility exclusions, use canonical attendance, and prevent duplicate active cases.
- `FR-RETENTION-006..007`: resulting cases feed actionable operational queues.
- `FR-FOLLOWUP-005`: next action can be scheduled where policy requires it.
- `FR-RETURN-001..002`: valid return attendance can resolve an eligible no-show case while preserving linkage.

Renewals:

- `FR-RENEWAL-001`: identify memberships entering configured renewal windows.
- `FR-RENEWAL-002`: support configurable reminder stages.
- `FR-RENEWAL-007`: stop later stages after verified renewal, cancellation, or another suppressing condition.

Payments:

- `FR-PAYMENT-002..007`: provider verification, provider-event retention, duplicate callback safety, and exactly-once membership/add-on effects.
- `FR-PAYMENT-009`: refunds/reversals remain reconstructable.
- Payment reconciliation after ambiguous provider outcomes requires durable retry/recovery but must never guess success.

Notifications:

- `FR-NOTIFICATION-001`: Phase 1 service notification intents include no-show care, renewal reminder, payment success/failure, and owner daily summary.
- `FR-NOTIFICATION-002`: retries must not create duplicate business-stage messages.
- `FR-NOTIFICATION-003`: only provider-observed delivery states may be represented.
- `FR-NOTIFICATION-004`: stale renewal notifications must be suppressed when canonical state changes.
- `FR-CONSENT-001..002`: communication policy/preferences remain part of send eligibility.

Operational summaries/data quality:

- `FR-SUMMARY-001`: gym-local daily operational summary.
- `FR-DATA-QUALITY-001..002`: identify material data issues and expose actionable issue state.

Cross-domain:

- `FR-CROSS-001`: canonical authorization/attendance/payment/membership truth remains server-side.
- `FR-CROSS-002`: critical automation effects are replay-safe.
- `FR-CROSS-003`: tenant/gym/branch context is explicit in background jobs where relevant.
- `FR-CROSS-004`: business-day logic uses configured gym timezone.

### 2.2 Non-functional requirements

Reliability:

- `NFR-RELIABILITY-001`: request/job/provider retries must not duplicate critical business outcomes.
- `NFR-RELIABILITY-002`: verified payment business effect applies no more than once.
- `NFR-RELIABILITY-003`: no-show scans, renewal scans, notification dispatch, owner summaries, and data-quality jobs are retry-safe.
- `NFR-RELIABILITY-004`: database constraints reinforce critical uniqueness where practical.
- `NFR-RELIABILITY-005`: canonical truth comes from server-side system-of-record data.
- `NFR-RELIABILITY-006`: gym-local time controls business calendar boundaries.
- `NFR-RELIABILITY-007`: deduplicated retries expose enough diagnostic linkage where appropriate.
- `NFR-RELIABILITY-008`: payment/membership state supports reconciliation after provider/network interruption.

Availability:

- `NFR-AVAILABILITY-001`: non-critical dependency failure must not corrupt canonical business data.
- `NFR-AVAILABILITY-002`: messaging failure leaves visible retry/diagnostic state.
- `NFR-AVAILABILITY-003`: failed production jobs are visible and support retry/dead-letter or equivalent recovery semantics.
- `NFR-AVAILABILITY-005`: formal RPO/RTO remains Open.

Scalability/operations:

- `NFR-SCALABILITY-002`: Phase 1 favors simple modular deployment before distributed services.
- `NFR-SCALABILITY-003`: interactive application components should evolve horizontally without process-local business state.
- `NFR-SCALABILITY-004`: retryable/scheduled background work is separable from interactive requests.
- `NFR-SCALABILITY-005`: no premature microservices.
- `NFR-OBSERVABILITY-001..007`: structured/correlated server-job telemetry, payment/job diagnostics, and business-health signals.
- `NFR-OPERATIONS-001..005`: environment separation, secret separation, migration safety, release smoke tests, and staff operability.

Maintainability/testing:

- `NFR-MAINTAINABILITY-001`: core rules are not duplicated in workers.
- `NFR-MAINTAINABILITY-002`: typed/runtime-validated boundaries where applicable.
- `NFR-MAINTAINABILITY-003`: provider adapters remain internal boundaries.
- `NFR-MAINTAINABILITY-005..006`: documentation and ADR governance.
- `NFR-TESTABILITY-001..005`: deterministic domain tests, provider simulation, failure injection, authorization testing, and controlled time.

### 2.3 Decision drivers

The job/scheduler strategy must provide:

- durable enqueue/scheduling,
- crash-safe worker recovery,
- bounded retries/backoff,
- explicit terminal-failure/dead-letter handling,
- deterministic job identity/dedupe support,
- explicit tenant/gym scope,
- gym-local scheduling semantics,
- payload/version validation,
- current-state reload before business decisions,
- operator-visible status/failure,
- safe redrive/reconciliation,
- transactional handoff from canonical writes where losing work would violate requirements,
- separate worker runtime,
- low Phase 1 operational overhead,
- compatibility with the proposed modular monolith and monorepo,
- portability across future hosting choices,
- no mandatory Redis/broker unless evidence requires it.

## 3. Constraints and Assumptions

1. `D-ARCH-007` remains `P1 OPEN`; this ADR is `Proposed`.
2. `D-ARCH-002` is `DECIDED`; PostgreSQL is the accepted canonical transactional database engine.
3. `D-ARCH-016` is `DECIDED`; strict TypeScript + supported Node.js LTS is the accepted runtime category, while exact version remains separate.
4. `D-ARCH-017` remains `PROPOSED`; no ORM/query/migration tool is accepted.
5. `D-ARCH-014` remains `OPEN`; no managed backend/platform is selected.
6. `D-ARCH-006` remains `OPEN`; ADR-0014 proposes a separate Background Execution Runtime but does not accept a physical topology.
7. `D-ARCH-008` remains `OPEN`; Redis/cache/broker is not introduced by default.
8. `D-ARCH-009` remains `OPEN`; no hosting provider is selected.
9. `D-ARCH-015` remains `PROPOSED`; workers use explicit system/job context and tenant/resource scope but do not redefine authorization.
10. `D-SEC-008` remains `OPEN`; any future RLS worker path remains separately governed.
11. Provider products remain separately governed.
12. External provider calls do not participate in the local canonical database transaction.
13. Job delivery semantics never replace business-effect idempotency.
14. Client devices are not trusted schedulers for business-critical workflows.
15. Job payloads should prefer identifiers/stable execution parameters over large snapshots of mutable business state.
16. Workers reload current canonical state before evaluating stale-sensitive business rules.
17. Exact retry counts, timeouts, concurrency limits, retention periods, and schedule frequencies are not fabricated here.
18. Job operational history is not a substitute for canonical audit/business history.
19. Background execution must not create a second implementation of domain/application behavior.
20. Material infrastructure introduced by this decision remains subject to later implementation validation and explicit acceptance.

## 4. Background Execution Model

The canonical logical flow is:

```text
Trigger / Durable Continuation
  -> Job Entry
  -> payload type/version validation
  -> Job ID + correlation ID
  -> explicit tenant/gym/branch scope
  -> deterministic business/dedupe key
  -> trusted System/Job Principal context
  -> reload current canonical state
  -> application command/query
  -> domain rules
  -> local transaction where required
  -> provider port outside long DB transaction
  -> persist attempt/result/failure state
  -> complete / retry / terminal-fail
```

### 4.1 Background execution categories

Scheduled scans:

- no-show detection,
- renewal-stage scans,
- owner daily summary,
- data-quality scans.

Event-driven durable continuations:

- notification dispatch,
- selected attendance post-processing,
- selected post-payment notification/read-model work,
- provider delivery/status processing when asynchronous.

Reconciliation:

- pending/ambiguous payment reconciliation,
- provider-supported recovery work.

Longer administrative work may be backgrounded later, but import/export details remain separately governed.

### 4.2 Synchronous correctness remains synchronous where required

Background architecture does not move every operation off the request path.

Examples that remain part of the bounded synchronous correctness transaction when required:

- successful attendance creation and duplicate protection,
- verified payment canonical transition and exactly-once intended business effect,
- required audit/idempotency evidence,
- durable continuation creation when loss would violate a requirement.

Non-critical provider-bound or scheduled follow-up work can continue asynchronously after durable handoff.

## 5. Options Considered

### Option A — PostgreSQL-backed job runner and scheduler; pg-boss-style

Use the same PostgreSQL engine as canonical persistence for durable jobs/schedules, with a separate worker runtime. pg-boss is the representative current library.

Relevant capabilities from current official documentation include:

- PostgreSQL-backed job storage and claiming,
- `SKIP LOCKED`-based concurrency,
- retries/backoff,
- dead-letter queues,
- queue policies/concurrency,
- cron/RRULE scheduling with explicit time zone support,
- worker heartbeats/expiration,
- transactional enqueue inside an existing application transaction,
- Node/TypeScript-oriented worker integration.

Important limitation:

> queue/library delivery semantics do not mean a business effect can never run twice.

pg-boss documentation itself notes that retries can cause reprocessing even when delivery claiming is exactly-once. GymPulse must therefore keep application/business idempotency and database uniqueness.

Strengths:

- no additional broker infrastructure if PostgreSQL is accepted,
- atomic enqueue with canonical transaction is possible,
- strong fit with Phase 1 volumes/correctness,
- simple local/test environment relative to separate broker/provider,
- schedule, retry, failure, and queue state stay inspectable with SQL/library tooling,
- straightforward separate worker deployment.

Risks:

- conditional on PostgreSQL and Node-compatible runtime directions,
- background workload shares database resources with OLTP,
- library-owned queue schema/migrations require governance,
- high sustained backlog/throughput can increase DB load,
- long-running orchestration features are narrower than dedicated durable-workflow platforms.

### Option B — Postgres-native queue + scheduler modules; PGMQ + pg_cron / Supabase Queues + Cron as representative

Use Postgres-native queue tables/functions plus database-native scheduling, potentially through an integrated platform.

Current Supabase Queues documentation shows PGMQ-backed durable message queues stored in Postgres with visibility timeouts, archival, and monitoring. Supabase Cron uses `pg_cron` for recurring schedules/run history.

Strengths:

- Postgres-native durability,
- no Redis baseline,
- queue enqueue can participate in application SQL transactions when using the same database,
- clear separation between queue messages and worker code,
- integrated dashboard/monitoring can reduce operations if that managed platform is later selected,
- provider platform remains optional because PGMQ/pg_cron are PostgreSQL technologies.

Tradeoffs:

- queue + scheduler + worker/retry/dead-letter conventions require more composition than a unified job library,
- some operational behavior becomes extension/platform-specific,
- PGMQ “exactly once within a visibility window” still does not guarantee exactly-once business effects,
- `pg_cron` scheduling should not own GymPulse business eligibility,
- adoption of Supabase-specific operations would increase platform coupling,
- Supabase remains unselected under `D-ARCH-014`.

### Option C — Managed durable task/workflow platform; Trigger.dev-style

Use an external managed durable execution platform for tasks, retries, schedules, concurrency, observability, and scaling. Trigger.dev is the representative current platform.

Current official materials show:

- durable task execution,
- retries,
- queues/concurrency controls,
- scheduled tasks with time zone support,
- multi-tenant scheduling constructs,
- idempotency keys,
- run observability/versioning,
- managed worker execution with self-hosting options.

Strengths:

- strong operational visibility,
- managed scaling/retry/schedule features,
- supports long-running/waiting workflows better than a simple queue,
- can reduce worker-platform operations.

Tradeoffs:

- external provider dependency for a core execution path,
- canonical DB transaction cannot atomically commit directly into the external task platform,
- therefore correctness-sensitive handoff requires a transactional outbox/durable continuation record plus dispatcher,
- provider outage becomes a new continuation dependency,
- vendor/platform lifecycle and pricing become material,
- more capability than current Phase 1 workflows require.

This remains a credible alternative if future workloads need durable long-running orchestration or managed operations more than Phase 1 simplicity.

### Option D — Redis-backed queue/scheduler; BullMQ-style

Use Redis as a dedicated queue/broker with a Node worker library such as BullMQ.

Current BullMQ documentation shows:

- Redis-backed queues,
- horizontal workers,
- retries/backoff,
- delayed/scheduled jobs,
- deduplication modes,
- crash recovery,
- concurrency controls.

Strengths:

- mature high-throughput queue patterns,
- strong concurrency and scheduling features,
- independent scaling from canonical database.

Tradeoffs:

- requires Redis/broker infrastructure under currently OPEN `D-ARCH-008`,
- enqueue cannot share the canonical PostgreSQL transaction directly; durable outbox is required for correctness-sensitive handoff,
- another production datastore, backup/monitoring/availability surface,
- current Phase 1 load does not justify the extra broker solely for throughput.

BullMQ remains credible if later measured throughput/latency/tool constraints justify Redis. It is not the Phase 1 baseline.

### Option E — Custom database job table + generic Cron/poller

Build a minimal GymPulse-owned job table, polling/claiming semantics, retry logic, scheduling, failure states, and worker coordination directly.

Strengths:

- no library/provider lock-in,
- full SQL visibility,
- can participate in canonical DB transactions,
- minimal external infrastructure.

Tradeoffs:

- GymPulse owns queue claiming correctness,
- crash recovery/lease semantics,
- retries/backoff,
- scheduling,
- concurrency,
- dead-letter/recovery,
- observability/admin controls,
- schema/migration maintenance,
- subtle race/failure behavior.

The apparent simplicity shifts significant infrastructure correctness burden into GymPulse. Current evidence does not justify rebuilding commodity queue semantics.

## 6. Evaluation

| Criterion | pg-boss / Postgres runner | PGMQ + pg_cron / integrated Postgres | Managed durable platform | BullMQ / Redis | Custom DB jobs |
|---|---|---|---|---|---|
| Durable enqueue | Strong | Strong | Strong provider-side after handoff | Strong after Redis handoff | Strong if correctly built |
| Atomic enqueue with canonical DB transaction | **Strong** | **Strong** when same DB | Requires outbox/relay | Requires outbox/relay | **Strong** |
| Retry/backoff | Strong | Moderate; compose conventions | Strong | Strong | Must build |
| Dead-letter/terminal failure | Strong | Moderate; compose/archival pattern | Strong | Strong failed/dead-letter patterns possible | Must build |
| Crash recovery | Strong | Strong with visibility timeout + worker discipline | Strong | Strong | Must build carefully |
| Deterministic dedupe support | Strong queue primitives + app keys | Queue visibility/IDs + app keys | Platform idempotency + app keys | Strong library dedupe + app keys | Must build |
| Business-effect idempotency | Application/database responsibility | Application/database responsibility | Application/database responsibility | Application/database responsibility | Application/database responsibility |
| Gym-local scheduling | Strong timezone/RRULE support | Moderate; Cron + GymPulse clock policy | Strong timezone scheduling | Credible; implementation-specific | Must build |
| Stale-state recheck | Strong app handler fit | Strong app handler fit | Strong app handler fit | Strong app handler fit | Strong if designed |
| Tenant context | Explicit payload/context | Explicit payload/context | Explicit payload/context/tags | Explicit payload/context | Must build |
| Operational visibility | Strong library/SQL/dashboard possibilities | Strong with integrated tooling; otherwise SQL | **Strongest managed UX** | Moderate; often needs extra UI | Weak until built |
| Local integration testing | **Strong with real Postgres** | Strong with extensions available | Moderate; provider/local model dependent | Requires Redis | Strong but own semantics |
| Extra infrastructure | **None beyond Postgres** | None beyond Postgres/extensions | External platform | Redis required | None beyond Postgres |
| DB resource isolation | Shares OLTP DB | Shares OLTP DB | Strong external isolation | Strong external isolation | Shares OLTP DB |
| Long-running workflow orchestration | Moderate | Moderate | **Strong** | Moderate | Weak |
| Provider coupling | Low/Moderate library coupling | Low/Moderate extension/platform coupling | Higher | Medium Redis/library coupling | Lowest external coupling |
| Phase 1 operational simplicity | **Strong** | Strong/Moderate | Moderate/Strong but provider-bound | Weak/Moderate due Redis | Superficially strong; correctness burden high |
| Reversibility | Strong behind Durable Continuation port | Strong behind port | Moderate/Strong with outbox boundary | Strong with outbox boundary | Moderate; custom schema/semantics |
| Overall GymPulse Phase 1 fit | **Strongest if PostgreSQL + Node directions hold** | Strong alternative | Credible future/ops alternative | Not justified without Redis need | Not recommended |

The strongest current fit is Option A **conditionally** because GymPulse is already evaluating PostgreSQL and Node, Phase 1 background volume is correctness-heavy rather than extreme-throughput, transactional handoff is valuable, and avoiding a second broker reduces operational surface.

Option B is a strong Postgres-native alternative, particularly if an integrated managed backend with PGMQ/pg_cron becomes separately accepted.

Option C is the strongest external managed alternative if long-running workflow/managed-operations requirements become material.

## 7. Proposed Decision

**Propose a PostgreSQL-backed durable job queue/scheduler behind a GymPulse Durable Continuation port, executed by a separate Background Worker Runtime. PostgreSQL and the Node.js runtime category are now accepted foundation decisions, so pg-boss remains the leading current implementation candidate for Phase 1; `D-ARCH-007` itself remains OPEN and pg-boss is not accepted by this fact.**

This proposal does **not** accept PostgreSQL, Node.js, pg-boss, Supabase Queues/Cron, Trigger.dev, BullMQ, Redis, or any hosting platform.

Conceptually:

```text
Interactive / Callback Transaction
  -> canonical business writes
  -> durable continuation enqueue in same transaction when possible
  -> COMMIT

Separate Worker Runtime
  -> claim due job
  -> validate job type/version
  -> create System/Job Context
  -> resolve explicit tenant/gym scope
  -> reload current canonical state
  -> run shared application handler
  -> apply bounded local transaction
  -> call external provider outside long DB transaction
  -> persist attempt/result/failure
  -> complete / retry / terminal-fail
```

### 7.1 Primary rationale

1. Phase 1 workloads are mostly scheduled scans, provider-bound retries, notifications, reconciliation, and summaries, not high-throughput streaming.
2. Correctness depends on atomic durable handoff and idempotent business effects more than broker throughput.
3. A Postgres-backed queue can avoid introducing Redis/broker infrastructure while the system already needs canonical persistence.
4. Same-database transactional enqueue can eliminate a “DB commit succeeded but enqueue failed” gap for some workflows.
5. A separate worker runtime still preserves failure/resource separation from interactive requests.
6. Job handlers can reuse application/domain logic without network microservice boundaries.
7. The architecture remains reversible behind the Durable Continuation port.
8. If external managed execution later becomes justified, a transactional outbox can bridge canonical commits to that external platform.

### 7.2 Queue delivery is not business exactly-once

Mandatory invariant:

```text
Queue delivery guarantee
!=
Business-effect exactly-once guarantee
```

Assume a handler can execute again because of:

- retries,
- worker crash after side effect but before completion acknowledgement,
- timeout/lease expiry,
- operator redrive,
- provider ambiguity,
- duplicate schedule/enqueue attempts.

Therefore every correctness-sensitive handler must still use:

- deterministic business key,
- canonical current-state recheck,
- database uniqueness/transition invariants where practical,
- provider idempotency keys where supported,
- separate provider-event/business-effect uniqueness where applicable.

## 8. Job Identity, Payload, and Execution Context

### 8.1 Conceptual job envelope

A job should conceptually expose:

```text
job_id
job_type
payload_version
tenant_id
gym_id
branch_id nullable
business_key / dedupe_key
scheduled_for
logical_business_date/time where relevant
correlation_id
originating_operation/reference nullable
attempt
```

Exact schema belongs to implementation.

### 8.2 Payload minimization

Prefer:

```text
identifiers
+
stable execution parameters
+
version
```

over copying mutable business records into the queue.

Example:

```text
notification dispatch:
notification_intent_id
tenant_id
business_stage_key
```

not an entire Member profile/preferences snapshot.

The handler reloads current canonical state before sending, so revocation, cancellation, renewal completion, opt-out, or other stale conditions can suppress work safely.

### 8.3 Trusted job context

A background job is not a human session.

The worker constructs an explicit trusted System/Job Context containing:

- job/correlation identity,
- job type/version,
- tenant/gym/branch scope,
- system actor identity where audit requires it.

The job payload must not blindly grant access merely because it contains a tenant ID. Resource relationships and current tenant ownership remain validated through application/persistence rules.

## 9. Scheduling and Gym-Local Time

The scheduler decides **when to wake work**. Domain/application logic decides **whether the business action is currently eligible**.

```text
Schedule trigger
!=
No-show eligibility
!=
Renewal eligibility
!=
Notification permission
```

Gym-local requirements:

- business schedules use the configured gym timezone,
- canonical event timestamps remain UTC,
- intended logical business date/time should be explicit where relevant,
- daylight-saving/time-zone rules are resolved by an IANA-zone-aware clock/scheduler,
- server machine timezone never defines business-day meaning.

Implementation may use:

- per-gym/per-tenant scheduler entries,
- a bounded recurring “find due schedules/tenants” sweep,
- another library-supported schedule registry,

provided schedule state remains observable and business eligibility is rechecked canonically.

Exact schedule frequencies and missed-run policy are job-specific and remain unfinalized.

### 9.1 Missed-run policy

A single global catch-up rule is unsafe.

Examples:

- a no-show scan may safely run once after outage if idempotent,
- a renewal stage may need one catch-up evaluation but must suppress stale/duplicate messages,
- an owner summary may skip or regenerate according to later product policy,
- reconciliation should resume until canonical ambiguity is resolved.

Each job class must define one of:

```text
skip missed
run once after recovery
bounded catch-up
continuous reconciliation until resolved
```

with deterministic business keys.

## 10. Transactional Handoff and Durable Continuation

### 10.1 Same-database atomic enqueue

When the selected job runner stores jobs in the same accepted PostgreSQL database and supports enqueue inside the current application transaction:

```text
BEGIN
  mutate canonical state
  record required audit/idempotency
  enqueue durable continuation
COMMIT
```

If the transaction rolls back, both business writes and job creation roll back.

This is the leading Phase 1 handoff because it minimizes the dual-write gap.

### 10.2 External queue/platform handoff

If the selected job system cannot participate in the canonical transaction:

```text
BEGIN
  mutate canonical state
  write durable outbox/continuation record
COMMIT

Dispatcher
  -> reads committed continuation
  -> sends to external queue/platform
  -> records delivery/dispatch state
```

A direct “commit DB, then call external queue” without durable recovery is not sufficient when losing the work would violate a requirement.

### 10.3 Durable Continuation port

Application code depends on a conceptual port such as:

```text
DurableContinuation
  enqueue(type, stable identifiers, business key, tenant scope, timing)
```

not pg-boss, PGMQ, Trigger.dev, BullMQ, or provider SDK objects.

The adapter may implement:

- same-transaction Postgres enqueue, or
- transactional outbox + external dispatcher.

## 11. Retry, Idempotency, and Failure Classification

Retries are expected.

### 11.1 Failure classes

Transient infrastructure/provider failure:

- network timeout,
- temporary provider outage,
- temporary DB connection issue,
- retryable serialization/deadlock conflict.

Posture: bounded retry with backoff/jitter; preserve business key.

Rate-limit response:

- respect provider retry guidance where available,
- do not create unbounded retry storms.

Permanent provider/domain rejection:

- terminal fail or persist domain-specific failure state,
- do not blind-retry indefinitely.

Stale business condition:

- reload current state,
- suppress/no-op deterministically,
- record completion/suppression reason.

Invalid job payload/version:

- fail closed,
- terminal failure with operator-visible diagnostic,
- no canonical business mutation.

Data-quality inconsistency:

- create/expose data-quality issue where appropriate,
- isolate tenant/member failure,
- continue other safe work.

Security/tenant mismatch:

- fail closed,
- emit security-relevant diagnostic,
- never “fix” tenant scope from untrusted payload assumptions.

Unknown provider outcome:

- move to explicit reconciliation,
- do not guess success/failure.

### 11.2 Retry configuration

Exact attempt counts/delays are implementation policy and must be chosen per job/provider class.

Architecture requires:

- bounded retries,
- backoff,
- jitter where suitable,
- timeout/lease/heartbeat semantics,
- terminal state,
- visible error category,
- safe manual redrive.

## 12. Dead-Letter, Recovery, and Operator Control

A dead-letter queue is one implementation; an explicit terminal failed state with equivalent recovery can also satisfy the architecture.

Required behavior:

- terminal failures are visible,
- original job ID/type/version/tenant/business key/correlation remain inspectable,
- sanitized failure category/message is retained,
- operator can safely redrive when cause is corrected,
- redrive reuses the original business key or otherwise preserves idempotency,
- redrive does not bypass current-state/authorization/business validation,
- completed business effects are never repeated merely because the job record is retried,
- cancellation prevents future execution but does not undo committed business state.

A DLQ must not become a silent graveyard.

Exact operator UI/runbook is later operational work.

## 13. Provider and Business-Workflow Boundaries

### 13.1 Notification dispatch

```text
durable notification intent
-> worker reloads current Member/business/preference state
-> send/suppress decision
-> provider adapter
-> persist provider attempt/reference/observed state
```

Notification retry dedupe remains based on business stage/intent, not only queue job ID.

### 13.2 Payment reconciliation

Reconciliation workers may:

- load stuck/pending payment,
- query/verify provider status through adapter,
- convert verified evidence into the same application handler used by webhook processing,
- rely on provider-event/business-effect uniqueness,
- preserve auditable reconciliation attempts.

A job result never directly declares payment success without verified provider evidence.

### 13.3 No-show/renewal scans

Scheduled scan job:

- carries tenant/gym scope and logical schedule reference,
- reloads current configuration/state,
- evaluates using gym-local clock,
- performs canonical mutations through normal application/domain rules,
- relies on unique constraints/business keys to prevent duplicate cases/stages.

### 13.4 External provider latency

Do not hold correctness-sensitive database transactions open while waiting on messaging/payment/provider network calls unless a specific bounded design proves it necessary.

Prefer:

```text
canonical intent/state
COMMIT
-> provider call
-> record normalized result
```

with idempotent retry/reconciliation.

## 14. Security and Privacy Impact

### 14.1 Worker privilege

Workers are trusted server-side runtimes but are not omnipotent by default.

Use:

- least-privilege runtime credentials,
- explicit job/System Principal,
- explicit tenant/resource scope,
- separate migration/admin credentials,
- provider secrets only in server runtime,
- no direct browser/client queue access for canonical workflows.

If selective RLS is later accepted, worker access must follow a separately reviewed service-role/tenant-context strategy rather than blanket bypass by convenience.

### 14.2 Payload safety

Do not place:

- passwords,
- OTPs,
- refresh tokens,
- session secrets,
- payment credentials,
- provider API secrets,
- unnecessary PII,
- whole mutable Member/payment records,

into routine job payloads/logs.

Use stable internal identifiers and reload canonical data.

### 14.3 Queue exposure

Job/queue administration is server/operations-only unless a later explicit decision proves another pattern safe.

Supabase PGMQ APIs or managed platform task APIs must not be exposed to Member/browser clients as a side effect of provider capability.

### 14.4 Threats

| Threat | Architecture control |
|---|---|
| Duplicate delivery repeats business effect | business key + canonical idempotency/uniqueness |
| Forged client creates privileged job | no direct client queue access; trusted server enqueue only |
| Tenant ID substitution in payload | explicit system context + current resource ownership validation |
| Job payload leaks PII/secrets | identifier-only payloads; safe logging |
| Worker uses migration/admin credential | distinct least-privilege runtime roles |
| Infinite retry/provider abuse | bounded retry classification/backoff/terminal state |
| Poison job blocks queue | per-job failure isolation + terminal/dead-letter path |
| One tenant monopolizes workers | bounded concurrency/fairness controls where evidence requires |
| Stale reminder sent after renewal | current-state reload + suppression |
| Provider succeeds then worker crashes | provider/business idempotency + reconciliation |
| Queue record deleted but audit needed | canonical audit/business history separate from queue retention |
| Schedule uses server timezone | GymPulse Business Clock + explicit gym timezone |

## 15. Reliability, Performance, and Scalability Impact

### 15.1 Database-backed queue impact

A Postgres-backed queue reduces infrastructure count but shares resources with canonical OLTP.

Must monitor:

- queue depth,
- oldest ready job age,
- claim/dispatch latency,
- retry volume,
- dead-letter/terminal failure count,
- queue table/index growth,
- DB CPU/I/O/lock pressure,
- impact on interactive queries/transactions.

Phase 1 expected volume does not justify a separate broker solely for throughput.

### 15.2 Worker concurrency

Worker concurrency is bounded by:

- database capacity,
- provider rate limits,
- job type cost,
- tenant fairness,
- idempotency/locking characteristics.

Do not set one global high concurrency number without measurement.

Where the runner supports per-key/group concurrency, tenant/provider fairness can use it, but queue-level concurrency is not authorization.

### 15.3 Scale/extraction triggers

Revisit a separate broker or managed durable workflow platform when measured evidence shows:

- sustained queue/backlog load materially harms canonical DB latency,
- job throughput requires independent broker scaling,
- long-running/CPU-heavy workflows dominate,
- multi-step waits/human approvals/workflow orchestration become core,
- queue table retention/maintenance becomes operationally costly,
- multi-region active execution becomes required,
- provider rate/concurrency orchestration materially exceeds simple workers,
- team ownership/release cadence requires an independent platform,
- hosting cannot run healthy persistent workers,
- a required product capability is materially simpler/safer on a managed durable platform.

These are revisit triggers, not automatic migration.

### 15.4 Redis trigger

Redis/BullMQ should be reconsidered only if:

- measured queue throughput/latency requires it,
- another accepted capability already requires Redis and operational ownership exists,
- a library/platform constraint makes Redis materially safer/simpler.

Do not introduce Redis “because queues normally use Redis.”

## 16. Operations and Observability Impact

Required operational state per job/run should conceptually expose:

```text
job_id
job_type
payload_version
tenant/gym/branch scope
business/dedupe key
scheduled_for
started_at
finished_at
attempt
status
sanitized error category
correlation_id
```

Exact schema is not selected.

Useful metrics:

- ready/backlog count,
- oldest job age,
- schedule lag,
- success/failure/retry rates,
- dead-letter/terminal failures,
- execution duration by job type,
- provider failure/rate-limit categories,
- reconciliation backlog,
- per-tenant failure concentration where privacy-safe.

Operational requirements:

- worker health/readiness distinct from web/API health,
- graceful shutdown stops claiming new work and handles in-flight jobs safely,
- deployments preserve compatibility with queued payload versions,
- failed jobs are searchable and redrivable,
- queue/scheduler schema migrations follow release governance,
- queue cleanup/retention does not delete canonical audit/business history,
- secrets remain environment-specific and server-only.

Do not log full sensitive payloads merely for diagnostics.

## 17. Testing and Validation

No implementation is created by this ADR.

Before acceptance, validate at least:

1. enqueue + canonical business write commit atomically when same-DB path is used.
2. rollback removes/avoids the corresponding job.
3. external-platform path uses outbox/relay without a lost-work window.
4. two workers race for the same job without duplicate business effect.
5. worker crashes after claim before side effect.
6. worker crashes after local side effect but before completion acknowledgement.
7. provider succeeds but worker crashes before recording result.
8. duplicate enqueue with the same business key.
9. operator redrive after terminal failure.
10. transient provider outage and bounded backoff.
11. permanent provider rejection.
12. provider rate-limit handling.
13. DB serialization/deadlock retry.
14. invalid payload/version fails closed.
15. job carries wrong tenant/resource relationship.
16. one tenant's failed job does not block other tenants.
17. stale renewal reminder suppresses after verified renewal.
18. stale notification suppresses after preference/consent change where applicable.
19. no-show scan rerun does not duplicate active case.
20. payment reconciliation cannot duplicate membership/add-on effect.
21. data-quality scan isolates corrupt records.
22. gym-local schedule on current timezone rules.
23. daylight-saving transition for applicable time zones.
24. missed schedule policy after worker/scheduler outage.
25. server machine timezone differs from gym timezone.
26. worker restart/deploy with queued old payload version.
27. queue backlog under representative Phase 1 load.
28. queue load does not materially degrade interactive DB paths.
29. worker graceful shutdown.
30. terminal/dead-letter visibility and safe redrive.
31. correlation ID propagates request/webhook -> continuation -> worker.
32. secrets/PII absent from routine job payload/log review.
33. RLS/tenant-context compatibility spike if RLS remains a candidate.
34. real Postgres integration tests for queue transaction behavior.
35. alternative external managed-task outbox spike if pg-boss/Postgres path cannot satisfy final hosting/runtime constraints.

Tool-specific spike if the proposed direction remains leading:

- prove pg-boss enqueue inside the selected future data-access transaction,
- prove cron/RRULE timezone behavior for GymPulse schedule cases,
- prove retries/dead-letter/heartbeat behavior,
- prove worker process separation and multi-worker concurrency,
- prove queue schema/migration lifecycle is compatible with ADR-0005 governance.

## 18. Migration and Rollout

If this ADR is later accepted with a PostgreSQL-backed runner:

1. finalize database/runtime compatibility first.
2. create one server-only background-runtime composition path.
3. install queue schema through reviewed committed migration/release procedure according to the selected library's supported lifecycle.
4. implement Durable Continuation adapter.
5. prove atomic enqueue for a non-critical representative continuation.
6. implement worker payload validation and System/Job Context.
7. add one scheduled tenant-scoped scan.
8. add retries/terminal failure visibility.
9. add provider-bound notification/reconciliation path.
10. validate multi-worker and restart behavior.
11. add operational metrics/alerts/runbook.
12. expand job types only after idempotency/failure behavior is proven.

Do not migrate every synchronous action to the worker merely because a queue exists.

If an external managed task platform is selected later, preserve the application port and insert a durable outbox/dispatcher bridge rather than direct post-commit fire-and-forget API calls.

## 19. Reversibility

Reversibility is **High** if the application/domain layer depends only on the Durable Continuation port and shared application handlers.

Postgres runner -> managed platform:

- keep job types/business keys/payload contracts,
- keep application handlers,
- replace enqueue adapter with outbox + dispatcher,
- replace worker entry/runtime,
- preserve canonical idempotency and observability semantics.

Postgres runner -> Redis/BullMQ:

- same outbox requirement for atomic handoff,
- replace worker/queue adapter,
- preserve business semantics.

Managed platform -> Postgres runner:

- move durable enqueue into same DB transaction where possible,
- remove external handoff after migration,
- preserve job handler contracts.

The main lock-in risks are:

- job-runner SDK types leaking into application/domain code,
- provider-specific workflow primitives defining business state,
- scheduler expressions becoming the only representation of product policy,
- queue job IDs used as business idempotency keys,
- job history treated as canonical audit/business history.

## 20. Risks and Mitigations

### Risk: Postgres queue competes with OLTP workload

**Mitigation:** bounded worker concurrency, queue/backlog metrics, retention maintenance, query/index review, extraction triggers.

### Risk: “Exactly once” marketing weakens application idempotency

**Mitigation:** architecture assumes replay; business uniqueness remains canonical and database-backed.

### Risk: transactional enqueue couples to a specific library schema

**Mitigation:** Durable Continuation port + implementation adapter; business/application types never depend on library rows.

### Risk: schedules encode business rules

**Mitigation:** scheduler only triggers; handler reloads current configuration/state and evaluates domain eligibility.

### Risk: many per-tenant schedules become difficult to manage

**Mitigation:** implementation may use a due-tenant sweep or library multi-tenant schedules; measure before choosing representation.

### Risk: missed runs send stale/duplicate reminders

**Mitigation:** per-job missed-run policy, current-state reload, stage/business keys, suppression rules.

### Risk: provider retry duplicates external effect

**Mitigation:** provider idempotency key/reference where supported, persisted attempt/reference, reconciliation, business-stage dedupe.

### Risk: one poison job blocks progress

**Mitigation:** isolated claims, bounded retry, terminal state/dead-letter, tenant/job-type visibility.

### Risk: worker gets excessive privileges

**Mitigation:** dedicated least-privilege runtime account, explicit system context, separate migration/admin credentials.

### Risk: managed task platform becomes canonical workflow database

**Mitigation:** canonical business state remains GymPulse persistence; platform run state is operational execution metadata.

### Risk: custom outbox/dispatcher itself becomes unreliable

**Mitigation:** only use when queue cannot join the DB transaction; store durable state, retry dispatch, observe lag, test crash windows.

## 21. Open Questions

Separately governed or still unresolved:

- accepted PostgreSQL engine constraints under `D-ARCH-002`,
- exact supported Node.js production version/runtime constraints under `D-ARCH-016`,
- final data-access/migration tooling under `D-ARCH-017`,
- exact queue/job library,
- whether integrated Supabase Queues/Cron is later selected,
- whether a managed durable task platform is preferred for operations,
- exact worker hosting/runtime model,
- exact retry/backoff values per job/provider,
- exact dead-letter retention/redrive permissions,
- exact concurrency/fairness limits,
- exact job-history retention,
- exact schedule representation: per-tenant vs due-schedule sweep,
- exact missed-run policies by job type,
- whether selective RLS changes worker DB-role/context design,
- formal RPO/RTO/SLOs,
- observability provider,
- whether future load justifies Redis or another broker.

## 22. Decision Evidence

### 22.1 Repository evidence

Latest repository state verifies:

- `D-ARCH-007 = P1 OPEN`.
- ADR-0015 did not exist before Task 0023.
- no explicit approval evidence promotes `D-ARCH-007` to `DECIDED`.
- no current ADR is Accepted.
- `NFR-RELIABILITY-003` requires retry-safe scheduled jobs.
- `NFR-AVAILABILITY-003` requires visible failures and retry/dead-letter or equivalent recovery.
- `NFR-SCALABILITY-004` requires retryable background work to remain separable from interactive requests.
- canonical architecture already defines Scheduler Adapter, Job Entry, Job Context, Job Dedupe/Retry Coordinator, shared Background Application Handlers, and a Durable Continuation port.
- canonical data flow distinguishes request idempotency, provider-event dedupe, job dedupe, and business-effect uniqueness.
- ADR-0014 preserves a separate Background Execution Runtime and prohibits process-memory timers/fire-and-forget critical work.
- `D-ARCH-008` explicitly says do not add Redis/cache without demonstrated need.
- current technology evaluation recommends comparing PostgreSQL-backed jobs/outbox, pg-boss/Supabase Queues+Cron, and managed durable task platforms.

Legacy `docs/08-automations.md` is consistent with current requirements on explicit tenant scope, deterministic business keys, visible failure, retry safety, and gym-local schedules, but remains a migration/evidence source rather than canonical authority.

### 22.2 Current official research

Research date: `2026-09-26`.

Primary/current material reviewed:

- pg-boss: https://pgboss.io/
- pg-boss Introduction: https://pgboss.io/introduction
- pg-boss Transaction Adapters: https://pgboss.io/api/adapters
- pg-boss Queues: https://pgboss.io/api/queues
- pg-boss Scheduling: https://pgboss.io/api/scheduling
- pg-boss Workers: https://pgboss.io/api/workers
- Supabase Queues: https://supabase.com/docs/guides/queues
- Supabase PGMQ: https://supabase.com/docs/guides/queues/pgmq
- Supabase Cron: https://supabase.com/docs/guides/cron
- Trigger.dev Scheduled Tasks: https://trigger.dev/product/scheduled-tasks
- Trigger.dev Concurrency and Queues: https://trigger.dev/product/concurrency-and-queues
- Trigger.dev Product capabilities: https://trigger.dev/product
- BullMQ documentation: https://docs.bullmq.io/
- BullMQ retries: https://docs.bullmq.io/guide/retrying-failing-jobs
- BullMQ deduplication: https://docs.bullmq.io/guide/jobs/deduplication

Material findings:

- pg-boss is PostgreSQL-backed and can enqueue jobs within an existing application/ORM transaction, enabling atomic application-write + job creation when the same database is used.
- pg-boss supports retries, dead-letter queues, worker heartbeats, concurrency policies, and cron/RRULE schedules with time zone support.
- pg-boss warns that retrying can process a job again even with exactly-once claiming semantics; idempotent handlers remain necessary.
- PGMQ/Supabase Queues stores durable messages in PostgreSQL and uses visibility-timeout style delivery; messages can be archived.
- Supabase Cron is based on `pg_cron` and stores run history in PostgreSQL.
- Trigger.dev provides managed durable tasks, retries, queues/concurrency, schedules, time-zone/multi-tenant scheduling, idempotency features, versioning, and run observability.
- BullMQ is Redis-backed and supports retries, delayed/scheduled jobs, deduplication, and horizontal workers; adopting it introduces Redis as an additional infrastructure dependency.

These capabilities are evaluation evidence only. No product/library/provider is accepted or pinned.

### 22.3 Missing acceptance evidence

ADR-0015 remains Proposed because acceptance still requires:

- decision-owner approval,
- accepted/compatible database/runtime direction or a justified external-platform alternative,
- representative transactional enqueue/outbox spike,
- worker crash/retry/redrive tests,
- gym-local schedule/timezone tests,
- tenant-isolation tests,
- provider ambiguity/idempotency tests,
- queue/backlog effect on canonical DB performance,
- hosting compatibility for persistent/separate workers,
- operational failure visibility/runbook,
- queue schema/migration lifecycle validation,
- payload-version compatibility test,
- evidence that the selected option is simpler/safer than alternatives for actual pilot load.

## 23. Related Documents

- `../README.md`
- `../00-overview/assumptions.md`
- `../01-product/functional-requirements.md`
- `../01-product/non-functional-requirements.md`
- `../01-product/user-journeys.md`
- `../02-architecture/architecture-principles.md`
- `../02-architecture/architecture-overview.md`
- `../02-architecture/container-architecture.md`
- `../02-architecture/component-architecture.md`
- `../02-architecture/data-flow.md`
- `../02-architecture/technology-stack.md`
- `ADR-0001-modular-monolith.md`
- `ADR-0003-monorepo-strategy.md`
- `ADR-0005-data-access-migration-strategy.md`
- `ADR-0006-managed-backend-responsibilities.md`
- `ADR-0009-authorization-implementation.md`
- `ADR-0010-data-layer-tenant-isolation-rls.md`
- `ADR-0014-api-deployment-boundary.md`
- legacy migration source: `../08-automations.md`
- legacy migration source: `../12-security-audit.md`
- legacy migration source: `../15-engineering-workflow.md`
- legacy migration source: `../16-open-decisions.md`
