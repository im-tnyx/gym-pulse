# Task 0033: Draft Redis / Cache Requirement ADR

## Goal

Draft one Proposed ADR for D-ARCH-008 that determines whether GymPulse Phase 1 requires Redis/Valkey or another shared low-latency ephemeral-state system at all, before evaluating engines/providers.

Target:

docs/adr/ADR-0025-redis-cache-requirement.md

Continuity:

.ai/task/0033-draft-redis-cache-requirement-adr.md

## Inputs Read

Fresh latest-main repository/governance inputs included:

- .ai/README.md
- .ai/current-state.md
- .ai/task/0032-draft-product-analytics-provider-adr.md
- docs/README.md
- docs/00-overview/assumptions.md
- docs/01-product/functional-requirements.md
- docs/01-product/non-functional-requirements.md
- docs/02-architecture/architecture-principles.md
- docs/02-architecture/architecture-overview.md
- docs/02-architecture/system-context.md
- docs/02-architecture/container-architecture.md
- docs/02-architecture/component-architecture.md
- docs/02-architecture/data-flow.md
- docs/02-architecture/technology-stack.md
- docs/adr/README.md
- docs/adr/ADR-0004-database-engine.md
- docs/adr/ADR-0005-data-access-migration-strategy.md
- docs/adr/ADR-0007-authentication-session-architecture.md
- docs/adr/ADR-0009-authorization-implementation.md
- docs/adr/ADR-0010-data-layer-tenant-isolation-rls.md
- docs/adr/ADR-0012-owner-staff-web-framework.md
- docs/adr/ADR-0014-api-deployment-boundary.md
- docs/adr/ADR-0015-background-jobs-scheduler.md
- docs/adr/ADR-0016-hosting-deployment-platform.md
- docs/adr/ADR-0017-ci-cd-release-secrets.md
- docs/adr/ADR-0018-testing-toolchain.md
- docs/adr/ADR-0020-observability-provider.md
- docs/adr/ADR-0024-product-analytics-provider.md

Legacy evidence was used only as supporting/migration input:

- docs/05-system-architecture.md
- docs/12-security-audit.md
- docs/16-open-decisions.md

Canonical structured documentation controlled.

## Repository State Verified

At Task 0033 start:

- latest main was 7cf7ca2afb4f95e32396ef6b6c22c96fd57625e2;
- Task 0032 / ADR-0024 were synchronized;
- docs/adr/ADR-0025-redis-cache-requirement.md did not exist;
- .ai/task/0033-draft-redis-cache-requirement-adr.md did not exist;
- ADR backlog order 25 remained D-ARCH-008 Redis/cache requirement OPEN;
- canonical D-ARCH-008 remained P2 OPEN;
- no ADR was Accepted;
- no Redis/Valkey dependency was accepted;
- no redis, ioredis, @upstash/redis, bullmq, redlock, rate-limit-redis or equivalent implementation evidence was found;
- no current provisioned-cache configuration/credential evidence was found;
- current architecture already stated that framework caching, background jobs, authentication/session, authorization, dashboard reads, and product analytics do not automatically require Redis.

Task 0033 was the actual next bounded governance task.

## Canonical Decision State

~~~text
D-ARCH-008
Priority: P2
Status: OPEN
Decision: Whether Redis/cache/ephemeral coordination is required in Phase 1
Constraint: Do not add without demonstrated need
~~~

ADR-0025 = Proposed.

Creating it does not promote D-ARCH-008 to DECIDED.

## Phase 1 Workload Findings

Phase 1 is correctness-heavy and modest-scale.

Interactive workload includes:

- Member search;
- Member Home;
- Owner dashboard;
- no-show / renewal / payment / follow-up queues;
- check-in;
- assisted attendance;
- renewal;
- payment state;
- add-on state.

Async workload includes:

- no-show scan;
- renewal scan;
- notification dispatch;
- payment reconciliation;
- owner summary;
- data-quality jobs;
- selected durable continuations.

Current NFR direction already requires:

~~~text
indexed server-side search
bounded/paginated queues
dashboard queries without N+1/full scans
horizontal-ready request runtimes
durable retry-safe jobs
~~~

No requirement establishes extreme concurrency, global active-active state, massive realtime fanout, or shared low-latency coordination.

## Redis Requirement Finding

Outcome:

~~~text
No Redis / Valkey requirement for Phase 1; defer.
~~~

No candidate Redis responsibility survived the required-now test.

D-ARCH-008 remains OPEN for future evidence-triggered reconsideration.

## Use Cases Evaluated

~~~text
application caching
query/result caching
framework cache sharing
rate limiting
authentication/session storage
session revocation
authorization caching
distributed locks
distributed coordination
idempotency assistance
dedupe assistance
job queue
job scheduling
pub/sub
realtime
leader election
distributed counters
temporary state
feature flags
analytics buffering
~~~

Classification:

~~~text
Required now
  -> none

Potential later
  -> measured read cache
  -> shared distributed rate limit
  -> shared session state if future accepted auth architecture needs it
  -> narrow coordination/dedupe optimization

Already solved elsewhere
  -> durable jobs/scheduling
  -> critical idempotency/business dedupe
  -> canonical business counters
  -> authorization truth

Not justified
  -> pub/sub/realtime
  -> leader election
  -> feature flags
  -> analytics buffering
  -> multi-purpose Redis platform

Unsafe use
  -> Redis as sole payment/attendance/membership/idempotency correctness guard
  -> stale authorization cache as authority
  -> volatile pub/sub for durable critical work
~~~

## Cache Findings

No measured hot-query evidence exists.

Before shared cache:

~~~text
query shape
indexes
pagination
N+1 analysis
read models
materialized/derived projections if justified
connection behavior
~~~

must be evaluated.

Representative future measurements:

- Owner dashboard;
- Member search;
- no-show queue;
- renewal queue;
- payment exception queue;
- Member Home.

Request/process-local caching remains acceptable only for non-authoritative data where cross-instance incoherence is harmless.

## Rate-Limit Findings

NFR-SECURITY-010 requires rate limiting and/or provider-appropriate abuse controls for sensitive paths.

That requirement does not specify Redis.

Initial mechanisms may include:

- auth/OTP provider limits;
- payment/provider controls;
- API gateway/hosting controls;
- DB-backed bounded counters for low-volume critical paths;
- process-local best-effort limiting only where security semantics allow it.

Shared Redis/Valkey becomes a real trigger only if multiple stateless replicas need a high-volume global limit and existing controls/DB approach are inadequate.

Fail-open/fail-closed/degraded behavior must be explicit for security-critical limits.

## Session Findings

Canonical:

~~~text
D-ARCH-004 = OPEN
ADR-0007 = Proposed
D-SEC-004 = OPEN
~~~

Preserve:

~~~text
Session Architecture != Redis Requirement
~~~

ADR-0007 explicitly states authentication/principal caching is not required and no Redis dependency follows.

Possible future session-state stores remain conceptually separate.

No session store is selected or created.

## Job / Broker Findings

ADR-0015 owns durable background work.

Current proposal:

~~~text
PostgreSQL-backed durable jobs/scheduling
+
separate worker runtime
~~~

conditionally on its own governance.

Redis/BullMQ remains an alternative only if future job evidence materially changes the outcome.

Background work itself does not establish Redis.

No job is moved to Redis.

## Lock / Coordination Findings

Redis distributed locks are not a correctness substitute.

Prefer durable correctness mechanisms as appropriate:

~~~text
unique constraints
transactions
conditional updates
row locks
advisory locks where narrowly justified
durable idempotency/effect records
~~~

PostgreSQL-specific mechanisms remain conditional on D-ARCH-002.

Future distributed lock evaluation must model lease expiry, process pause, network partition, crash, timing assumptions, and stale/duplicate ownership.

No current distributed-lock requirement exists.

## Dedupe / Idempotency Findings

Preserve:

~~~text
Redis Dedupe != Business Exactly Once
~~~

Critical idempotency remains durable:

- business idempotency key;
- provider-event uniqueness;
- business-effect uniqueness;
- canonical state/transaction constraints;
- replay result where required.

Ephemeral duplicate suppression may be a future optimization only.

## PubSub / Realtime Findings

No Phase 1 requirement establishes distributed pub/sub or realtime fanout.

Ordinary dashboard refresh does not imply realtime infrastructure.

Current official Redis docs describe Pub/Sub as at-most-once.

Current official Valkey docs describe Pub/Sub channels as non-persistent; messages without active subscribers can be lost.

Therefore volatile Pub/Sub is not a durable business continuation mechanism.

## Database / Platform Alternatives

Current preferred order:

~~~text
indexed canonical database queries
-> bounded pagination
-> read models/projections
-> transaction/constraint primitives
-> provider/platform-native abuse limits
-> Postgres-oriented durable jobs
-> shared Redis/Valkey only when one measured need survives
~~~

Redis must not hide bad database access patterns.

## Tenant-Sensitive Cache Findings

Authenticated data is private by default.

Future shared cache requires authority-complete isolation.

Potential dimensions:

~~~text
tenant/gym
resource
query
permission visibility
version/schema
~~~

Client-supplied tenant/resource IDs are not authority.

Tenant A -> Tenant B negative tests are mandatory if tenant-sensitive cache ever appears.

Keys should avoid unnecessary PII.

## Security Findings

Threats addressed:

- public Redis exposure;
- weak/no authentication;
- credential leakage;
- browser-visible credentials;
- cross-environment reuse;
- cross-tenant key collision;
- cache poisoning;
- stale authorization;
- PII in keys/values;
- session theft;
- rate-limit bypass during outage;
- lock lease expiry;
- volatile job loss;
- treating cache as canonical truth;
- overprivileged admin access;
- test/prod cache crossover.

If Redis/Valkey is later introduced:

~~~text
private/trusted network
TLS
authentication
least-privilege ACL/credential
environment separation
no browser access
~~~

are baseline controls.

## Reliability Findings

Deferral removes one stateful dependency and its outage/eviction/staleness/failover paths.

Preserve:

~~~text
optional cache lost
-> performance may degrade
-> correctness remains
~~~

If cache loss cannot be tolerated, question whether the data belongs in a cache.

Canonical correctness remains in durable systems.

## Performance Findings

No cache acceleration is assumed.

Measure first:

- request/query latency;
- DB CPU/load;
- read frequency;
- concurrency;
- repeated expensive computation;
- N+1 patterns;
- index selectivity;
- connection behavior.

Do not invent hard thresholds not present in NFRs.

## Operational Findings

No baseline Redis means no:

- cache service health;
- connection pool;
- eviction monitoring;
- failover runbook;
- persistence/backup policy;
- credential rotation;
- cache local service;
- CI cache service;
- Redis region placement;
- cache incident ownership.

If later introduced, observe availability, latency, connections, memory, evictions, hit/miss, errors/timeouts, failover, and safe hot-key signals.

Cache metrics are not business KPIs.

## Cost Findings

Deferral avoids:

- managed service cost;
- memory/replica/failover cost;
- network cost;
- extra observability;
- local service;
- CI service;
- dependency/config/credential burden;
- failure testing/runbooks.

Free tiers are not architecture justification.

## Official Research Date

2026-09-27.

Current first-party Redis research:

- https://redis.io/docs/latest/develop/reference/eviction/
- https://redis.io/docs/latest/develop/pubsub/
- https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/
- https://redis.io/docs/latest/operate/oss_and_stack/management/security/
- https://redis.io/docs/latest/operate/oss_and_stack/management/security/acl/
- https://redis.io/docs/latest/operate/oss_and_stack/management/security/encryption/
- https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/

Current first-party Valkey research:

- https://valkey.io/topics/introduction/
- https://valkey.io/topics/persistence/
- https://valkey.io/topics/pubsub/
- https://valkey.io/topics/acl/
- https://valkey.io/topics/tls/

Research validated capability/failure assumptions only.

No managed-provider market survey was warranted because no shared-cache requirement exists.

## Evaluation Summary

~~~text
Phase 1 Redis requirement
  -> not demonstrated

Shared read cache
  -> potential later after measurement

Distributed rate-limit store
  -> potential later

Shared session store
  -> not proven

Authorization cache
  -> no baseline

Durable jobs
  -> already separately governed; current proposal avoids Redis

Distributed locks
  -> not justified as correctness architecture

Pub/Sub / realtime
  -> not required

Redis vs Valkey
  -> not evaluated for selection because infrastructure category is deferred
~~~

## Proposed Direction

Outcome A:

~~~text
No Redis / Valkey requirement for Phase 1; defer.
~~~

Use existing database/platform/runtime primitives first.

Introduce a shared cache/ephemeral store later only for one measured and explicitly approved purpose.

No Redis/Valkey engine or provider recommendation.

## Decision Confidence

~~~text
No Phase 1 Redis baseline               High
DB/index/read-model first               High
Authorization cache need                None
Session-store need                      Not proven
Distributed rate-limit need             Not proven
Redis-backed jobs need                  Not proven
Pub/Sub/realtime need                    None
Provider/engine selection               None
~~~

## Revisit Triggers

Reopen D-ARCH-008 when:

~~~text
measured hot-query pressure remains after index/read-model work

approved global distributed rate-limit requirement emerges

accepted session architecture requires shared ephemeral state

winning job architecture requires Redis

approved realtime/pubsub requirement appears

high-volume distributed coordination is demonstrated

measured DB contention is genuinely solved by cache
~~~

Triggers reopen governance; they do not accept Redis.

## Decisions Kept Separate

~~~text
D-ARCH-008 Redis/cache requirement       P2 OPEN

D-ARCH-002 database engine               PROPOSED
D-ARCH-004 authentication/session        OPEN
D-ARCH-006 API deployment                OPEN
D-ARCH-007 background jobs               OPEN
D-ARCH-009 hosting                       OPEN
D-ARCH-012 Owner/Staff framework         PROPOSED
D-ARCH-015 authorization                 PROPOSED
D-ARCH-017 data access/migrations        PROPOSED
D-ARCH-018 testing                       PROPOSED
D-ARCH-019 CI/CD + secrets               OPEN

D-SEC-004 session lifecycle              OPEN
D-SEC-008 data-layer tenant isolation    OPEN

D-PROVIDER-006 observability             OPEN
~~~

No related decision is silently resolved.

## Requirement IDs Referenced

~~~text
NFR-SECURITY-001..005
NFR-SECURITY-010..011
NFR-RELIABILITY-001..004
NFR-PERFORMANCE-001..005
NFR-SCALABILITY-002..006
NFR-OBSERVABILITY-001..007
NFR-OPERATIONS-001..005
NFR-MAINTAINABILITY-001..006
NFR-TESTABILITY-001..005
~~~

No requirement ID was invented.

## Validation Required

If no Redis baseline remains the accepted direction, future implementation evidence must show:

1. Owner dashboard queries perform acceptably;
2. Member search performs acceptably;
3. no-show/renewal/payment queues perform acceptably;
4. Member Home performs acceptably;
5. background jobs do not require Redis;
6. accepted auth/session model does not require Redis;
7. rate-limit needs are safely covered without Redis;
8. critical idempotency remains durable;
9. canonical authorization remains correct;
10. horizontal scaling does not use process-local business truth.

If a narrow Redis use is later proposed, additionally validate outage, eviction, stale data, tenant isolation, revocation, multi-replica behavior, lock race if applicable, complete Redis loss, rolling-deployment compatibility, credentials/environments, failover, observability, and cost.

No tests are implemented in Task 0033.

## Files Changed

Created:

- docs/adr/ADR-0025-redis-cache-requirement.md
- .ai/task/0033-draft-redis-cache-requirement-adr.md

Governance continuity updates:

- docs/adr/README.md
- docs/README.md
- .ai/current-state.md

No canonical requirement/assumption status was modified.

## Open Questions

- representative pilot query/load measurements;
- exact abuse-control architecture;
- final auth/session state-store needs;
- final durable-job technology;
- future realtime/pubsub need;
- any future measured shared-cache hot path;
- cache region/provider/HA only if need becomes real.

## Result

Expected synchronized end state:

~~~text
ADR-0025 = Proposed
D-ARCH-008 = P2 OPEN

Phase 1 Redis baseline = no
Phase 1 Valkey baseline = no
Managed cache provider selected = no

Read cache = measure first
Authorization cache = no baseline
Session store = separately governed
Rate limiting = required capability, Redis not assumed
Jobs = ADR-0015 remains independent
Distributed locks = not correctness authority
Pub/Sub/realtime = not required
~~~

Implementation status:

~~~text
No Redis instance created
No Valkey instance created
No managed cache account created
No cache credential/URL/certificate created
No redis client installed
No ioredis installed
No @upstash/redis installed
No bullmq installed
No redlock installed
No rate-limit-redis installed
No cache adapter implemented
No rate limiter implemented
No session store implemented
No distributed lock implemented
No pub/sub implemented
No Redis Stream implemented
No queue migrated
No BullMQ worker implemented
No cache key implementation
No Docker Redis container created
No CI Redis service created
No IaC/deployment created
No prior ADR accepted
~~~

## Next Recommended Task

Fresh-read the synchronized queue after governance updates.

Pre-synchronization queue shows:

~~~text
Order 26
D-DATA-007
Member vs Membership state ownership
PROPOSED / unresolved
~~~

Likely next bounded task:

~~~text
Task 0034: Resolve / Draft Member vs Membership State Ownership ADR
likely ADR-0026
~~~

Do not assume filename/task shape blindly.

Verify latest main after Task 0033 synchronization.

Do not execute Task 0034 as part of Task 0033.
