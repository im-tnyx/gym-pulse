# ADR-0025: Redis, Cache, and Ephemeral Coordination Requirement

## Status

Proposed

## Decision Metadata

- ADR: ADR-0025
- Primary Decision ID: D-ARCH-008
- Related Decision IDs: D-ARCH-002, D-ARCH-004, D-ARCH-006, D-ARCH-007, D-ARCH-009, D-ARCH-012, D-ARCH-015, D-ARCH-017, D-ARCH-018, D-ARCH-019, D-SEC-004, D-SEC-008, D-PROVIDER-006
- Decision Owner: Open
- Technical Owner: Architecture / Backend / Platform / Reliability
- Date Proposed: 2026-09-27
- Date Accepted: Not accepted
- Supersedes: None
- Superseded By: None

## 1. Context

GymPulse Phase 1 currently targets an operations/retention MVP with modest pilot scale, a trusted application/API boundary, canonical relational persistence, explicit business idempotency, and durable asynchronous work that is separately governed.

The central question is not:

~~~text
Redis vs Valkey vs Upstash
~~~

It is:

> Does GymPulse Phase 1 contain any demonstrated requirement that actually needs a shared low-latency ephemeral state system beyond canonical persistence, existing runtime behavior, database primitives, and the proposed durable-job architecture?

Canonical governance already says:

~~~text
D-ARCH-008 = P2 OPEN
Do not add without demonstrated need.
~~~

The technology evaluation also states:

~~~text
No Redis dependency in the Phase 1 baseline.
~~~

and identifies Redis only as a future possibility when a measured shared-ephemeral-state requirement appears.

Current architecture principles explicitly prohibit adding caches, brokers, distributed locks, or other infrastructure merely because mature systems often use them.

Fresh repository audit found no current requirement, accepted dependency, provisioned service, credential, client library, cache implementation, rate-limit store, session store, distributed lock, Redis-backed queue, pub/sub path, or realtime feature that makes Redis/Valkey a Phase 1 baseline dependency.

Therefore this ADR evaluates each potential Redis responsibility independently before deciding whether any requirement survives.

Canonical D-ARCH-008 remains P2 OPEN.

## 2. Requirements and Decision Drivers

### Requirements

- NFR-SECURITY-001 — tenant isolation must hold across APIs, jobs, analytics, storage, and related infrastructure.
- NFR-SECURITY-002 — least-privilege authorization.
- NFR-SECURITY-003 — server-side authorization for protected operations.
- NFR-SECURITY-004 — secrets and infrastructure credentials stay out of source/client bundles.
- NFR-SECURITY-005 — protected production traffic uses secure transport.
- NFR-SECURITY-010 — authentication, verification, QR, payment-initiation, and other abuse-sensitive endpoints should support rate limiting and/or provider-appropriate abuse controls.
- NFR-SECURITY-011 — logs/errors avoid secrets, cross-tenant identifiers, and unnecessary PII.
- NFR-RELIABILITY-001 — critical mutations remain retry-safe.
- NFR-RELIABILITY-002 — verified payment effects apply exactly once.
- NFR-RELIABILITY-003 — scheduled jobs are retry-safe.
- NFR-RELIABILITY-004 — correctness-critical uniqueness/relations should be reinforced at the database layer where practical.
- NFR-PERFORMANCE-001 — Member check-in should feel immediate under normal conditions.
- NFR-PERFORMANCE-002 — staff Member search uses indexed server-side search/filtering.
- NFR-PERFORMANCE-003 — action queues are bounded/paginated and appropriately indexed.
- NFR-PERFORMANCE-004 — dashboard queries avoid normal-path N+1/full-table scans.
- NFR-PERFORMANCE-005 — long provider operations do not unnecessarily hold DB transactions.
- NFR-SCALABILITY-002 — Phase 1 favors simple modular deployment before distributed services.
- NFR-SCALABILITY-003 — request runtimes should scale horizontally without process-local business truth.
- NFR-SCALABILITY-004 — retryable background work is separable from request processing.
- NFR-SCALABILITY-005 — no premature microservices/distributed infrastructure for hypothetical scale.
- NFR-SCALABILITY-006 — operational tenant/status/date queries should be indexed.
- NFR-OBSERVABILITY-001..007 — production request/job/dependency behavior remains diagnosable.
- NFR-OPERATIONS-001..005 — environment separation, secret separation, release safety, and operability.
- NFR-MAINTAINABILITY-001..006 — business rules remain shared, boundaries documented, and material architecture changes governed.
- NFR-TESTABILITY-001..005 — deterministic business, provider, failure, authorization, and time behavior remains testable.

### Decision drivers

1. introduce shared ephemeral infrastructure only for a demonstrated requirement;
2. keep canonical truth reconstructable without Redis/Valkey;
3. preserve database-backed correctness and business idempotency;
4. optimize query/index/read-model design before distributed caching;
5. keep tenant-sensitive caching private and authority-complete;
6. preserve immediate-enough authorization/revocation semantics;
7. keep session architecture separate from cache choice;
8. meet abuse-control requirements without presupposing Redis;
9. keep ADR-0015 durable-job architecture independent from Redis;
10. avoid distributed locks as a substitute for relational correctness;
11. avoid pub/sub/realtime without an approved product need;
12. define degraded behavior before introducing any mandatory cache dependency;
13. minimize new credentials, networking, monitoring, failure, local-dev, and cost surfaces;
14. preserve provider/runtime portability.

## 3. Current Phase 1 Workload

Current Phase 1 workload is correctness-heavy, not extreme-throughput.

Representative synchronous reads/writes:

~~~text
Member search
Member Home
Owner dashboard
no-show queue
renewal queue
payment exception queue
check-in
assisted attendance
follow-up
renewal order
payment state read
add-on purchase/fulfillment state
~~~

Representative asynchronous work:

~~~text
no-show scan
renewal scan
notification dispatch
payment reconciliation
owner daily summary
data-quality scan
selected post-commit continuation
~~~

Current scale guidance emphasizes:

- indexed server-side search;
- bounded/paginated queues;
- efficient dashboard/read-model queries;
- modular monolith simplicity;
- horizontal-ready stateless request runtimes without process-local canonical state.

No canonical requirement establishes:

~~~text
millions of concurrent users
global active-active application state
sub-millisecond distributed coordination
high-volume realtime fanout
distributed leader election
high-throughput broker semantics
shared cache hit-rate target
~~~

Performance evidence remains measurement-driven.

## 4. Candidate Redis / Cache Use Cases

Each potential use is classified independently.

| Potential use | Classification | Current finding |
|---|---|---|
| Application read caching | Potential later | No measured hot-query evidence yet; optimize SQL/indexes/read models first. |
| Query/result caching | Potential later | Same; no required shared cache. |
| Framework/server-render cache sharing | Not justified now | Protected tenant data is private by default; framework cache does not imply Redis. |
| Abuse/rate-limit state | Potential later / requirement exists at capability level | NFR-SECURITY-010 requires controls, not Redis specifically. Provider/gateway/platform/DB/in-process alternatives remain viable. |
| Authentication/session storage | Potential later | D-ARCH-004 and D-SEC-004 remain open; ADR-0007 explicitly does not require Redis. |
| Session revocation | Already governed elsewhere / potential later | Current GymPulse account/assignment state must still deny access; exact session architecture remains separate. |
| Cross-request authorization cache | Not justified / security-sensitive | ADR-0009 baseline is no distributed cross-request authorization cache. |
| Distributed locks | Not justified; unsafe as sole correctness guard | DB uniqueness, transactions, conditional updates, row/advisory locks where justified, and idempotency records are primary. |
| Distributed coordination | Potential later | No current multi-replica coordination requirement survives alternatives analysis. |
| Critical idempotency | Already solved elsewhere | Durable idempotency/canonical uniqueness belongs in persistent correctness mechanisms. |
| Short-lived duplicate suppression | Potential later | May be optimization only; cannot replace durable business dedupe. |
| Job queue/broker | Already solved by proposed architecture | ADR-0015 proposes PostgreSQL-backed durable jobs; Redis/BullMQ is an alternative only if future evidence changes the decision. |
| Job scheduling | Already solved by proposed architecture | PostgreSQL-backed scheduler direction; no Redis need. |
| Pub/Sub | Not justified | No approved distributed broadcast/realtime requirement. |
| Realtime fanout | Not justified | Ordinary dashboard/member refresh does not imply realtime infrastructure. |
| Leader election | Not justified | No current workload requires it. |
| Distributed counters | Not justified as business truth | Canonical/read-model queries own operational counts. |
| Temporary non-authoritative state | Already solvable without Redis | Process/request-local state is acceptable where incoherence is harmless. |
| Feature flags | Not justified / separately governed | No Phase 1 feature-flag platform requirement. |
| Analytics buffering | Not justified | ADR-0024 defers external product analytics and forbids a Redis buffer by implication of no provider pipeline. |

No use case is classified **Required now**.

## 5. Canonical Truth Boundary

Preserve:

~~~text
Redis != Canonical Business Database

Cache Hit != Canonical Truth
Cache Miss != Record Missing
Cache Write != Canonical Commit
~~~

Redis/Valkey must never be the sole authority for:

~~~text
payment success
membership entitlement
attendance
renewal
refund
add-on entitlement
authorization assignment
tenant ownership
audit truth
durable notification intent
provider-event history
critical idempotency result
~~~

If every cache key disappears, GymPulse canonical business truth must remain reconstructable from canonical persistence and independently durable systems.

For correctness-sensitive operations:

~~~text
database constraints
transactions
canonical state
business idempotency
verified provider evidence
~~~

remain authoritative.

## 6. Options Considered

### Option A — No Shared Redis / Valkey Baseline

~~~text
canonical persistence
+
indexed/bounded application queries
+
read models/projections where justified
+
safe request/process/framework-local caching only for non-authoritative data
+
provider/platform abuse controls where adequate
+
PostgreSQL-oriented durable jobs if separately accepted
~~~

Advantages:

- lowest operational complexity;
- no additional stateful runtime dependency;
- no new cache credentials/network/data surface;
- no cache invalidation correctness burden;
- no Redis outage path;
- simplest local/CI environment;
- preserves current job/session/provider decisions;
- easiest provider portability.

Tradeoff:

- no distributed-cache speedup;
- a proven shared ephemeral use may require introducing a service later.

### Option B — Database / Platform-Native Primitives

Use existing/accepted primitives for the specific problem:

~~~text
indexes
bounded queries
read models
transactions
unique constraints
conditional updates
row/advisory locks where specifically justified
database-backed durable jobs
auth-provider abuse controls
gateway/hosting limits
low-volume DB counters where justified
~~~

Advantages:

- fewer infrastructure systems;
- keeps correctness close to canonical state;
- reduces dual-write/cache invalidation complexity.

Tradeoff:

- inappropriate for genuinely high-volume low-latency shared ephemeral workloads if those emerge.

### Option C — Managed Redis / Valkey for One Narrow Proven Use

Examples:

~~~text
measured hot read cache
or
shared distributed rate limiter
~~~

Advantages:

- low-latency shared state;
- mature TTL/expiry/data-structure ecosystem;
- independent scaling from canonical DB.

Costs:

- extra stateful dependency;
- credentials/network/availability/monitoring;
- tenant/cache-key security;
- failure-mode design;
- local/CI dependency;
- cost and region considerations.

This option is deferred until a concrete requirement passes the demonstrated-need test.

### Option D — Redis as Multi-Purpose Platform Dependency

Use one Redis-compatible system for:

~~~text
cache
sessions
jobs
locks
rate limits
pub/sub
~~~

Advantages:

- one shared low-latency system can technically serve multiple concerns.

Risks:

- unrelated failure domains become coupled;
- Redis outage has much larger blast radius;
- different responsibilities need different durability/fail-open/fail-closed semantics;
- encourages accidental canonical-state drift;
- makes provider/service removal difficult;
- creates circular architecture reasoning.

Not justified for Phase 1.

## 7. Evaluation

| Criterion | No Shared Redis | Existing DB / Platform Primitives | Narrow Redis / Valkey Use | Multi-Purpose Redis |
|---|---|---|---|---|
| Phase 1 requirement fit | Strongest | Strong | Conditional only | Weak |
| Canonical correctness | Strong | Strong | Strong only if cache remains non-authoritative | High risk if responsibilities blur |
| Operational simplicity | Strongest | Strong | Medium | Weak |
| Read latency | Baseline DB/runtime | Baseline/optimized DB | Strong for proven hot reads | Strong technically |
| Throughput | Adequate until measured otherwise | Adequate until measured otherwise | Strong for matching workload | Strong but overbroad |
| Failure modes | Fewest | Existing dependencies | New cache outage/network/eviction | Large shared blast radius |
| Tenant isolation | Simpler | Existing DB authz/RLS boundaries | New key/value isolation surface | Broad isolation surface |
| Security | Lowest new surface | Existing controls | New credentials/network/ACL/TLS needs | Highest |
| Availability dependency | None | Existing DB/platform only | One new optional/mandatory dependency | Multiple business concerns depend on it |
| Job architecture fit | Strong with ADR-0015 direction | Strong | Redis queue possible later | Over-couples queue to unrelated uses |
| Session architecture fit | Neutral | Provider/DB alternatives remain | Possible later if proven | Premature coupling |
| Rate-limit fit | Provider/platform/DB may suffice | Good for low/moderate volume | Strong for cross-replica high volume | Technically strong but overbroad |
| Cache usefulness | No shared cache | Read-model/index first | Strong only with measured hot path | Easy to overuse |
| Invalidation complexity | None | Read-model-specific only | Material | Material across many domains |
| Local development | Simplest | Existing DB stack | Extra service/config | Extra critical service |
| CI/test complexity | Simplest | Existing integration setup | Redis lifecycle/failure tests | Broad Redis-dependent test stack |
| Hosting portability | High | High/conditional DB | Medium-High with protocol portability | Lower due broad coupling |
| Provider lock-in | None | Existing decisions only | Low-Medium if narrow abstraction | Higher integration coupling |
| Cost | No Redis cost | Existing infra cost | Added managed memory/network cost | Added cost plus HA/durability burden |
| Observability | Existing only | Existing DB/platform | New cache metrics needed | Broad critical metrics/alerts |
| Reversibility | Highest | High | High if cache is optional/narrow | Low-Medium |

Current best fit is Option A with Option B for specific needs already covered by accepted/proposed architecture.

## 8. Proposed Decision

Choose Outcome A:

~~~text
No Redis / Valkey requirement for Phase 1; defer.
~~~

Proposed architecture:

~~~text
canonical database/system-of-record
+
correct indexed/bounded queries
+
read models/materialization only when justified
+
database constraints/transactions/idempotency for correctness
+
PostgreSQL-oriented durable job direction under ADR-0015
+
provider/platform-native abuse controls where adequate
+
safe request/process/framework-local caching only when non-authoritative
+
introduce shared Redis/Valkey later only for one measured requirement
~~~

Important qualifications:

~~~text
No Redis baseline
!=
Redis prohibited forever

Background work exists
!=
Redis required

Next.js/framework caching exists
!=
Redis required

Session architecture exists
!=
Redis required
~~~

Canonical D-ARCH-008 remains P2 OPEN because this ADR proposes deferral and explicit revisit triggers rather than permanently rejecting shared ephemeral infrastructure.

### Decision confidence

~~~text
No Phase 1 Redis baseline               High
Database/query optimization first       High
Postgres-oriented job fit               High, conditional on owning decisions
Cross-request authorization cache need  None
Shared session-store need               Not proven
Distributed rate-limit store need       Not proven
Realtime/pubsub need                    None
Provider/engine selection               None
~~~

## 9. Read / Query Cache Posture

### 9.1 Database optimization first

Before introducing distributed caching, investigate:

~~~text
query shape
indexes
bounded pagination
N+1 behavior
join shape
read-model design
precomputed/materialized operational aggregates where justified
connection-pool/runtime behavior
~~~

Do not use Redis to conceal poor query design.

### 9.2 Representative reads

For:

~~~text
Owner dashboard
Member search
no-show queue
renewal queue
payment queue
Member Home
~~~

first answer:

- actual query latency;
- DB CPU/load;
- row counts;
- request concurrency;
- indexes used;
- data staleness tolerance;
- invalidation requirements;
- security/tenant dimensions.

No representative measured bottleneck exists in current repository evidence.

### 9.3 Safe local caching

Request-scoped memoization or small process-local cache may be acceptable for:

- immutable/static configuration;
- safe non-authoritative metadata;
- repeated pure computations;

only where instance-local incoherence is acceptable.

Process-local state is never distributed canonical truth.

## 10. Tenant-Sensitive Cache Posture

Authenticated tenant/member data is private by default.

A future shared cache must prove authority-complete isolation.

Potential security dimensions include:

~~~text
tenant/gym
resource
query/filter dimensions
permission-relevant visibility
version/schema
~~~

depending on the use case.

Do not finalize cache keys before a real cache requirement exists.

Unsafe design example:

~~~text
member:{memberId}
~~~

when that key omits relevant tenant/security dimensions.

Any future tenant-sensitive cache requires explicit negative tests:

~~~text
Tenant A -> Tenant B
same resource-like identifier
different user
different role/capability
logout/login on same device
post-mutation invalidation
post-revocation invalidation
~~~

Cache keys should avoid unnecessary phone/email/member name/private notes/tokens/payment references because operational cache tooling may expose keys.

## 11. Authorization Cache Posture

Preserve ADR-0009 baseline:

~~~text
no distributed cross-request authorization cache required
request-scoped trusted context/memoization allowed where safe
~~~

Critical invariant:

~~~text
Cached Authorization Result
!=
Canonical Authorization State
~~~

Be cautious with caching:

- role assignments;
- capabilities;
- Member-self links;
- tenant relationships;
- account eligibility;
- administrative disable state.

A role revocation or account disable must not remain authorized because a stale cache entry has an uncontrolled TTL.

Any future cross-request authorization cache requires explicit:

~~~text
invalidation
bounded staleness
revocation semantics
tenant-safe key
negative tests
~~~

No Redis product is selected for authorization.

## 12. Authentication / Session Posture

Canonical decisions remain:

~~~text
D-ARCH-004 = OPEN
ADR-0007 = Proposed
D-SEC-004 = OPEN
~~~

Preserve:

~~~text
Session Architecture
!=
Redis Requirement
~~~

ADR-0007 already states authentication/principal caching is not required and no Redis dependency follows.

Potential future session implementations include conceptually:

- auth-provider-managed sessions;
- canonical/database-backed session state;
- dedicated provider/session service;
- Redis/Valkey only if a later accepted architecture demonstrates a high-frequency shared state need.

This ADR does not choose among them.

If shared session state is later introduced, logout, account disable, role revocation, and credential reset must propagate according to the separately approved session policy.

Redis latency is not itself a revocation SLA.

## 13. Rate-Limiting Posture

NFR-SECURITY-010 establishes a capability requirement:

~~~text
abuse-sensitive endpoints SHOULD support
rate limiting and/or provider-appropriate abuse controls
~~~

It does not establish a Redis requirement.

Potential initial mechanisms include:

- authentication/OTP provider limits;
- payment/provider native controls;
- API gateway/hosting platform controls;
- low-volume database-backed counters for specific sensitive paths;
- in-process best-effort limits only when the security semantics permit replica-local behavior.

No exact thresholds are defined here.

A distributed shared limiter becomes a serious Redis/Valkey trigger only when evidence shows:

~~~text
multiple stateless replicas
+
high-volume shared limit
+
provider/platform controls insufficient
+
database-backed approach operationally poor
~~~

If a security-critical limiter later depends on shared state, fail-open/fail-closed/degraded behavior must be explicitly decided per operation.

Redis outage must not silently disable abuse controls by accident.

## 14. Background-Job / Broker Posture

ADR-0015 owns durable background execution.

Current proposal:

~~~text
PostgreSQL-backed durable jobs/scheduling
+
separate Background Worker Runtime
+
transactional handoff where possible
~~~

conditionally on its independently governed dependencies.

Preserve:

~~~text
Background Work Exists
!=
Redis Required
~~~

Redis/BullMQ was already evaluated in ADR-0015 as a credible alternative with additional broker infrastructure and outbox/handoff complexity.

Task 0033 does not reopen or override ADR-0015.

A Redis-backed job architecture becomes a revisit trigger only if a future job evaluation proves that its throughput/latency/operations benefits materially outweigh the extra dependency.

No circular reasoning:

~~~text
Need Redis because queue uses Redis.
Choose queue because Redis exists.
~~~

Durable job truth must survive process/runtime/cache loss according to the accepted job architecture.

## 15. Locking / Coordination Posture

Do not use a Redis lock as the primary guard for:

~~~text
payment exactly-once
attendance uniqueness
membership renewal uniqueness
provider-event dedupe
refund history
authorization truth
~~~

Prefer durable relational correctness mechanisms where applicable:

- unique constraints;
- conditional updates;
- transactions;
- row locks;
- advisory locks for narrowly justified DB coordination;
- durable idempotency/effect records.

PostgreSQL-specific mechanisms remain conditional because D-ARCH-002 is only Proposed.

Current Redis official distributed-lock guidance itself depends on leases/validity time, client timing, failure assumptions, and careful algorithms rather than providing absolute mutual exclusion independent of failures.

If future distributed locking is proposed, analyze:

~~~text
lease expiry
process pause
network partition
client crash
clock/timing assumptions
duplicate holder
fencing / stale-owner effects where applicable
~~~

No distributed lock requirement exists now.

## 16. Dedupe / Idempotency Posture

Preserve:

~~~text
Redis Dedupe != Business Exactly Once
~~~

Critical idempotency belongs in durable semantics:

- stable business idempotency keys;
- unique processed provider-event identity;
- unique business-effect/effect-purpose claim;
- transactionally protected canonical state;
- request replay result where required.

Redis may later assist with short-lived duplicate suppression if useful, but it is never the only record for financial/correctness-critical idempotency.

The system must remain correct if every ephemeral dedupe key disappears.

## 17. Pub/Sub / Realtime Posture

No current Phase 1 requirement establishes distributed pub/sub or realtime fanout.

Preserve:

~~~text
ordinary dashboard refresh
!=
realtime infrastructure requirement
~~~

Request/response refresh, polling, or user-triggered refresh may be sufficient until a product requirement proves otherwise.

Current Redis documentation states Pub/Sub has at-most-once delivery: a disconnected/failed subscriber can permanently miss a message.

Current Valkey documentation similarly states Pub/Sub channels are not persisted and messages published without an active subscriber are lost.

Therefore volatile pub/sub is not a durable continuation mechanism for business-critical GymPulse work.

Redis Streams/other persistent messaging features are not evaluated because no corresponding product requirement exists.

## 18. Failure and Degraded-Mode Model

Different future Redis uses would have different failure semantics.

| Future use | Preferred failure/degraded posture |
|---|---|
| Optional read cache | Fall back to canonical DB/recomputation where capacity permits. |
| Security-critical rate limiter | Explicit fail-open/fail-closed/degraded policy; never accidental. |
| Session store | Authentication/session architecture must define outage behavior. |
| Job dependency | Durable-job ADR must define recovery/durability. |
| Coordination/lock | Owning workflow must remain safe under lease loss/partition. |
| Short-lived dedupe optimization | Durable business idempotency still protects effects. |

For an optional cache:

~~~text
Cache Unavailable
-> canonical persistence / recomputation
~~~

is the desired Phase 1 property.

A future mandatory Redis dependency must justify its added:

~~~text
availability
monitoring
failover
persistence if relevant
network
credentials
cost
incident response
~~~

requirements.

## 19. Security and Tenant-Isolation Impact

### Threat/control matrix

| Threat | Required control |
|---|---|
| Publicly exposed Redis | Private/trusted network boundary; never direct browser/mobile access. |
| Weak/no authentication | Managed/provider authentication and least-privilege ACL where supported. |
| Credential leakage | Server-only secrets, release-secret governance, rotation. |
| Browser-visible credential | Prohibited. Browser -> trusted GymPulse runtime -> optional cache only. |
| Cross-environment reuse | Separate dev/test/preview/prod credentials/state. |
| Cross-tenant cache-key collision | Authority-complete scoped key design + negative tests. |
| Cache poisoning from untrusted inputs | Validate/normalize key dimensions and never trust client tenant/resource values as authority. |
| Stale authorization result | No baseline cross-request auth cache; explicit invalidation/revocation if introduced. |
| PII in keys | Opaque/minimal keys; no phone/email/name/notes/tokens. |
| Sensitive oversized values | Cache only deliberately minimized representations. |
| Session theft | Separately governed session design + transport/access controls. |
| Rate-limit bypass on outage | Explicit security failure policy. |
| Lock expiry causes concurrent execution | Durable correctness invariant remains outside lock; analyze lease failure. |
| Job loss from volatile state | Volatile cache/pubsub never owns durable work. |
| Redis treated as canonical truth | Architecture prohibition + failure tests. |
| Overprivileged admin/client | Least privilege/ACL/provider access review. |
| Test reaches production cache | Environment isolation and secret separation. |

Current Redis and Valkey official documentation supports ACL-style command/key restrictions and TLS-protected connections.

Redis documentation also explicitly warns that Redis is intended for trusted clients/trusted environments and should not be exposed directly to untrusted internet clients.

No Redis/Valkey security configuration is created by this ADR.

## 20. Reliability Impact

Deferring Redis removes one stateful dependency and one source of:

- network partitions;
- connection exhaustion;
- eviction;
- stale cache;
- partial invalidation;
- hot keys;
- failover behavior;
- cache schema/version mismatch.

Canonical reliability remains based on:

~~~text
canonical durable persistence
+
transactions/constraints
+
business idempotency
+
durable jobs
+
provider reconciliation
~~~

where separately accepted.

If Redis is later added as an optional cache, complete Redis loss should normally reduce performance, not correctness.

If a future Redis use cannot tolerate key eviction/loss, the design must question whether that data belongs in a cache at all.

## 21. Performance and Scalability

No cache boost is assumed.

Performance strategy:

~~~text
measure
-> inspect query/index/read model
-> optimize
-> load-test representative pilot path
-> only then consider shared cache
~~~

Representative measurements:

- request latency;
- query latency;
- DB CPU;
- row count/selectivity;
- connection usage;
- N+1 count;
- repeated expensive calculation;
- read frequency/hot keys;
- concurrency.

Before a read cache, validate:

~~~text
Owner dashboard
Member search
no-show queue
renewal queue
payment-exception queue
Member Home
~~~

under plausible pilot load.

NFRs intentionally avoid fabricated hard latency thresholds where baseline measurement is absent.

Horizontal request scaling must not depend on process-local canonical state.

A shared cache becomes relevant only when measured multi-instance performance/coordination needs cannot be solved acceptably with existing primitives.

## 22. Operations and Observability

No Phase 1 Redis baseline means no Redis-specific:

- service health;
- connection-pool management;
- memory/eviction monitoring;
- hit/miss dashboard;
- failover runbook;
- backup/persistence policy;
- credential rotation;
- local service;
- CI service;
- region placement;
- cache incident ownership.

If introduced later, observe as relevant:

~~~text
availability
command latency
connection count
memory
evictions
hit/miss rate
timeouts/errors
failovers
hot keys where safely observable
~~~

Do not expose sensitive key/value contents.

Preserve:

~~~text
Cache Metric != Business Metric
~~~

ADR-0020 continues to govern observability-provider selection.

## 23. Testing and Validation

If the decision remains no Redis baseline, acceptance of the deferral still requires implementation evidence that:

1. representative Owner dashboard queries perform acceptably;
2. Member search performs acceptably;
3. no-show/renewal/payment queues perform acceptably;
4. Member Home performs acceptably;
5. accepted background jobs do not require Redis;
6. accepted authentication/session architecture does not require Redis;
7. abuse-control needs are safely covered without Redis;
8. critical idempotency is durable without Redis;
9. canonical authorization is correct without Redis;
10. horizontal scaling does not depend on process-local business truth.

If a narrow Redis use is later proposed, additionally validate:

11. concrete measured requirement;
12. outage behavior;
13. eviction behavior;
14. stale-value behavior;
15. Tenant A -> Tenant B isolation;
16. authorization revocation if relevant;
17. session revocation if relevant;
18. cross-replica rate-limit behavior if relevant;
19. lock-expiry/race behavior if relevant;
20. canonical correctness after complete Redis loss;
21. rolling-deployment/cache-version compatibility;
22. credential/environment isolation;
23. connection/failover behavior;
24. operational metrics/alerting;
25. cost.

No such implementation tests are created by Task 0033.

## 24. Cost and Developer Experience

Deferral avoids:

~~~text
managed cache service cost
memory tier cost
replica/HA cost
network/egress cost
Redis observability cost
local Redis/Valkey process
Docker/CI service
client dependency
credentials/config
failure simulation
cache migrations/versioning
incident/runbook burden
~~~

Do not optimize for a free tier.

If Redis is later proposed, cost review includes:

- always-on versus serverless/on-demand billing;
- memory size and eviction model;
- replica/failover requirement;
- region/locality;
- request/worker/DB/cache network path;
- monitoring;
- development/test lifecycle.

Current Phase 1 developer experience benefits from fewer moving parts.

## 25. Migration / Introduction Plan

No Redis/Valkey service is introduced now.

If a revisit trigger occurs:

~~~text
measure concrete problem
-> demonstrate DB/platform primitives are insufficient
-> define one narrow shared-ephemeral responsibility
-> define correctness authority outside cache
-> define failure/degraded behavior
-> define tenant/security boundary
-> compare Redis/Valkey/current managed options
-> validate locally/non-production
-> validate outage/eviction/staleness
-> validate operations/cost/region
-> explicit approval
-> introduce narrow purpose-specific abstraction
-> production rollout
~~~

Do not create one generic RedisService.

If introduced, use an abstraction named by approved purpose, for example:

~~~text
RateLimiter
Cache
EphemeralCoordinator
SessionStore
~~~

only for the actually approved use.

## 26. Reversibility

Ideal optional-cache property:

~~~text
remove cache
-> system becomes slower
-> system remains correct
~~~

That property does not automatically hold for sessions/jobs/security-critical rate limiting.

Any future mandatory Redis responsibility requires a new/revised ADR explaining its tighter coupling.

Provider-neutral protocol/client compatibility can help migration, but application semantics matter more than wire compatibility.

No Redis-versus-Valkey engine choice is made because no shared cache requirement exists.

## 27. Revisit Triggers

Reopen D-ARCH-008 when evidence shows one or more of:

~~~text
measured hot-query pressure after index/read-model optimization

approved distributed rate-limit requirement across multiple replicas

accepted session architecture requiring shared ephemeral state

winning durable-job architecture requires Redis

approved realtime/pubsub requirement

high-volume distributed coordination requirement

measured DB contention that a cache genuinely addresses
~~~

A trigger reopens governance.

It does not automatically accept Redis/Valkey.

## 28. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Redis added because it is conventional | Demonstrated-need gate under ARCH-PRIN-018. |
| Slow query hidden by cache | Query/index/read-model investigation first. |
| Cache becomes business truth | Explicit canonical boundary and loss test. |
| Stale financial/eligibility data used for mutation | Commands reload current canonical state. |
| Cross-tenant cache leakage | Authority-complete key/value design + negative tests. |
| Authorization revocation delayed | No distributed auth cache baseline. |
| Session decision silently made by cache ADR | D-ARCH-004/D-SEC-004 remain separate. |
| Rate limiting assumed to require Redis | Evaluate provider/gateway/platform/DB alternatives first. |
| Redis queue selected because Redis exists | ADR-0015 remains independent; no circular reasoning. |
| Distributed lock replaces DB invariant | Durable constraints/transactions/idempotency remain primary. |
| Pub/Sub loses critical message | Volatile pub/sub prohibited as durable continuation. |
| Eviction corrupts behavior | Cache data must be reconstructable/disposable. |
| Cache outage takes down product | Optional cache degrades to canonical data where safe. |
| Redis credential exposed | Server-only secret and private/trusted network controls. |
| PII leaks through keys/values | Opaque keys + minimized payloads. |
| One Redis serves unrelated critical functions | Narrow purpose-specific introduction only. |
| Cache schema breaks rolling deploy | version keys/compatible decoder/flush strategy if later introduced. |
| Premature complexity slows pilot | No baseline service. |

## 29. Open Questions

1. What measured Owner dashboard/member-search/queue latency appears under representative pilot data?
2. Does any accepted hosting/API topology later make platform-native distributed rate limiting insufficient?
3. What exact abuse-sensitive endpoints require global cross-replica counters?
4. What authentication/session architecture will D-ARCH-004 and D-SEC-004 eventually accept?
5. Does that session model require a shared server-side store at all?
6. Does the accepted background-job stack remain PostgreSQL-backed?
7. Will any approved realtime/pubsub UX requirement emerge?
8. Which process-local/framework caches, if any, are worth using for non-authoritative data?
9. What future read model/materialization strategy is sufficient before external cache?
10. If Redis/Valkey is introduced later, what exact failure class is acceptable for its one approved purpose?
11. What provider/region/HA/cost model would fit accepted hosting and D-SEC-001 if cache data becomes materially regulated/personal?
12. Which engine/provider should be evaluated only after a concrete need appears?

## 30. Decision Evidence

Research date: 2026-09-27.

### Repository evidence

- docs/00-overview/assumptions.md — D-ARCH-008 remains P2 OPEN with “Do not add without demonstrated need.”
- docs/01-product/non-functional-requirements.md — indexed search, bounded queues, dashboard query efficiency, abuse controls, horizontal evolution, durable retry/idempotency requirements.
- docs/02-architecture/architecture-principles.md — ARCH-PRIN-018 explicitly prohibits caches/brokers/distributed locks without a concrete requirement/measured bottleneck.
- docs/02-architecture/container-architecture.md — background work does not imply Redis/cache/broker.
- docs/02-architecture/data-flow.md — no cache is required merely because dashboards exist; canonical idempotency concepts remain durable.
- docs/02-architecture/technology-stack.md — no Redis dependency in Phase 1; explicit revisit triggers only.
- ADR-0004 / ADR-0005 — database and data-access direction preserve transactions/indexes/constraints without introducing Redis.
- ADR-0007 — authentication/principal caching is not required; no Redis dependency follows.
- ADR-0009 — baseline has no distributed cross-request authorization cache.
- ADR-0010 — tenant isolation is a database/application security concern, not cache authority.
- ADR-0012 — shared framework caching for private tenant data requires explicit isolation/invalidation proof; Redis is not required for Next.js caching.
- ADR-0014 — API deployment does not require Redis.
- ADR-0015 — PostgreSQL-backed durable jobs are the leading proposal; Redis/BullMQ remains an alternative only.
- ADR-0016 — hosting candidate mapping does not require Redis.
- ADR-0017 — credentials/release boundaries remain independently governed.
- ADR-0018 — future cache behavior would require real integration/failure evidence.
- ADR-0020 — cache metrics/failures would be an operational observability concern, not business truth.
- ADR-0024 — analytics is deferred and does not justify Redis buffering.

### Redis first-party research

- https://redis.io/docs/latest/develop/reference/eviction/
- https://redis.io/docs/latest/develop/pubsub/
- https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/
- https://redis.io/docs/latest/operate/oss_and_stack/management/security/
- https://redis.io/docs/latest/operate/oss_and_stack/management/security/acl/
- https://redis.io/docs/latest/operate/oss_and_stack/management/security/encryption/
- https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/

Current evidence confirms:

- eviction is normal cache behavior and cached data should be safely re-creatable;
- Pub/Sub is at-most-once and missed subscriber messages are lost;
- persistence is separately configurable through RDB/AOF/no persistence;
- ACL and TLS capabilities exist;
- Redis is intended for trusted-client/trusted-network deployment rather than direct untrusted internet access;
- distributed locking has lease/timing/failure assumptions and requires deliberate algorithm design.

These capabilities make Redis viable for future narrow ephemeral workloads but do not establish a GymPulse requirement.

### Valkey first-party research

- https://valkey.io/topics/introduction/
- https://valkey.io/topics/persistence/
- https://valkey.io/topics/pubsub/
- https://valkey.io/topics/acl/
- https://valkey.io/topics/tls/

Current evidence confirms Valkey is an in-memory datastore with TTL/eviction, optional persistence, replication/failover, transactions, Pub/Sub, ACLs, and TLS capabilities.

Valkey Pub/Sub is non-persistent; messages can be lost when no subscriber is present.

Redis versus Valkey licensing/governance/provider fit is intentionally not compared further because there is no approved shared-cache requirement to satisfy.

No managed Redis provider market survey was performed.

## 31. Related Documents

- ../README.md
- ../00-overview/assumptions.md
- ../01-product/functional-requirements.md
- ../01-product/non-functional-requirements.md
- ../02-architecture/architecture-principles.md
- ../02-architecture/architecture-overview.md
- ../02-architecture/system-context.md
- ../02-architecture/container-architecture.md
- ../02-architecture/component-architecture.md
- ../02-architecture/data-flow.md
- ../02-architecture/technology-stack.md
- README.md
- ADR-0004-database-engine.md
- ADR-0005-data-access-migration-strategy.md
- ADR-0007-authentication-session-architecture.md
- ADR-0009-authorization-implementation.md
- ADR-0010-data-layer-tenant-isolation-rls.md
- ADR-0012-owner-staff-web-framework.md
- ADR-0014-api-deployment-boundary.md
- ADR-0015-background-jobs-scheduler.md
- ADR-0016-hosting-deployment-platform.md
- ADR-0017-ci-cd-release-secrets.md
- ADR-0018-testing-toolchain.md
- ADR-0020-observability-provider.md
- ADR-0024-product-analytics-provider.md
- legacy migration source: ../05-system-architecture.md
- legacy migration source: ../12-security-audit.md
- legacy migration source: ../16-open-decisions.md
