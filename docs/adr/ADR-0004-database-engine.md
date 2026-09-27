# ADR-0004: Canonical Database Engine

## Status

`Proposed`

## Decision Metadata

- ADR: `ADR-0004`
- Primary Decision ID: `D-ARCH-002`
- Related Decision IDs: `D-ARCH-005`, `D-ARCH-001`, `D-ARCH-016`, `D-ARCH-014`, `D-ARCH-017`, `D-SEC-008`, `D-ARCH-007`, `D-ARCH-008`, `D-ARCH-009`, `D-ARCH-018`, `D-DATA-001`, `D-DATA-002`, `D-DATA-003`, `D-DATA-004`, `D-DATA-005`, `D-DATA-006`, `D-DATA-007`, `D-SEC-001`, `D-SEC-005`, `D-SEC-006`
- Decision Owner: `Open`
- Technical Owner: `Architecture / Data Architecture`
- Date Proposed: `2026-09-02`
- Date Accepted: `Not accepted`
- Supersedes: `None`
- Superseded By: `None`

## 1. Context

GymPulse needs one canonical transactional database engine for Phase 1 system-of-record state. The engine must support the already-defined architecture rather than redefine it.

Canonical persistence eventually needs to hold or support durable state for areas such as:

```text
tenant / gym ownership
users / identity linkage
members
memberships
attendance and corrections
retention cases and follow-ups
renewal orders
payments
provider events
payment business effects
add-on orders / entitlements / usage
notification intent and observed state
audit history
data-quality issue state
operational configuration
durable reconciliation / continuation state where selected
```

GymPulse is primarily a correctness-heavy transactional application. Its most important database concerns are not benchmark-leading raw throughput. They are:

- atomic multi-record changes,
- concurrency-safe invariants,
- durable idempotency and effect uniqueness,
- relational integrity,
- explicit tenant ownership,
- reconstructable financial and operational history,
- flexible operational queries and reporting,
- auditable schema evolution,
- recoverable production operations.

Representative correctness-sensitive flows include:

```text
Attendance
  -> verify membership eligibility
  -> protect logical duplicate check-in
  -> create exactly one attendance effect
  -> preserve correction/history context

Verified Payment Event
  -> persist provider evidence uniquely
  -> transition canonical payment state
  -> claim business effect exactly once
  -> update intended membership/add-on state
  -> preserve audit/reconciliation evidence
  -> persist durable continuation when required

No-show Scan
  -> evaluate current eligible population
  -> create at most one active case per rule context
  -> remain retry-safe under concurrent or repeated execution
```

The database engine is one layer of correctness. It does not replace application/domain rules.

The architecture remains:

```text
Application / Domain Rules
          +
Database Correctness Backstops
```

not:

```text
Database replaces the domain architecture
```

This ADR answers only:

> What database engine should own GymPulse canonical transactional business state?

It does not select a managed provider, ORM/query builder, RLS policy, hosting platform, job runner, cache/broker, final schema, or exact engine version.

## 2. Requirements and Decision Drivers

### 2.1 Functional correctness drivers

- `FR-AUTHZ-001` tenant-scoped authorization
- `FR-MEMBER-001` stable member identity and explicit tenant/gym/branch ownership
- `FR-MEMBERSHIP-001` membership relationship and tenant scope
- `FR-MEMBERSHIP-003` valid membership date range
- `FR-MEMBERSHIP-004` server-side entitlement-sensitive eligibility
- `FR-ATTENDANCE-003` exactly one canonical attendance record for successful check-in
- `FR-ATTENDANCE-005` duplicate protection
- `FR-ATTENDANCE-006` retry-safe attendance
- `FR-ATTENDANCE-010` reconstructable correction context
- `FR-ATTENDANCE-011` no silent destructive correction
- `FR-RETENTION-005` one active no-show case for the same member/rule context
- `FR-FOLLOWUP-004` preserved follow-up history
- `FR-RETURN-002` preserved recovery linkage
- `FR-RENEWAL-004` renewal order separate from payment
- `FR-RENEWAL-006` no membership extension on payment initiation
- `FR-PAYMENT-002` provider-verified payment truth
- `FR-PAYMENT-004` provider event/reference persistence
- `FR-PAYMENT-005` duplicate provider callback safety
- `FR-PAYMENT-006` exactly-once membership effect
- `FR-PAYMENT-007` exactly-once add-on effect
- `FR-PAYMENT-009` reconstructable refund/reversal history
- `FR-ADDON-007` no negative session/stock balance in normal flows
- `FR-DASHBOARD-002` operational summary data
- `FR-DASHBOARD-003` action queues
- `FR-DASHBOARD-004` metric drill-down to underlying records
- `FR-NOTIFICATION-002` business-stage notification deduplication
- `FR-AUDIT-001` sensitive action log
- `FR-AUDIT-003` audit integrity with actor/time/tenant/resource context
- `FR-DATA-QUALITY-001` inconsistency detection
- `FR-DATA-QUALITY-002` actionable issue state
- `FR-CROSS-001` server-side canonical truth
- `FR-CROSS-002` idempotent critical effects
- `FR-CROSS-003` explicit tenant context
- `FR-CROSS-004` gym-local business time

### 2.2 Non-functional drivers

Security and privacy:

- `NFR-SECURITY-001` tenant isolation
- `NFR-SECURITY-002` least privilege
- `NFR-SECURITY-003` server-side authorization
- `NFR-SECURITY-004` secret protection
- `NFR-SECURITY-005` encryption in transit
- `NFR-SECURITY-006` data-at-rest protection
- `NFR-SECURITY-009` auditability
- `NFR-SECURITY-011` sensitive error minimization
- `NFR-PRIVACY-001` data minimization
- `NFR-PRIVACY-003` protected exports
- `NFR-PRIVACY-005` retention policy, currently Open
- `NFR-PRIVACY-006` export/correction/deletion evolution without corrupting required history

Reliability and operations:

- `NFR-RELIABILITY-001` idempotent critical mutations
- `NFR-RELIABILITY-002` payment exactly-once effect
- `NFR-RELIABILITY-003` retry-safe scheduled work
- `NFR-RELIABILITY-004` database-enforced invariants where practical
- `NFR-RELIABILITY-005` canonical system-of-record truth
- `NFR-RELIABILITY-006` timezone correctness
- `NFR-RELIABILITY-007` retry diagnosis
- `NFR-RELIABILITY-008` payment/membership reconciliation
- `NFR-AVAILABILITY-004` automated backup and tested restore process
- `NFR-AVAILABILITY-005` future RPO/RTO decision
- `NFR-OPERATIONS-001` separate environments
- `NFR-OPERATIONS-002` production secret separation
- `NFR-OPERATIONS-003` migration safety
- `NFR-OPERATIONS-004` release smoke validation

Performance and scalability:

- `NFR-PERFORMANCE-001` responsive check-in
- `NFR-PERFORMANCE-002` indexed member search
- `NFR-PERFORMANCE-003` bounded/indexed operational queues
- `NFR-PERFORMANCE-004` efficient dashboard queries
- `NFR-PERFORMANCE-005` provider latency outside long database transactions
- `NFR-SCALABILITY-001` explicit tenant ownership from Phase 1
- `NFR-SCALABILITY-003` stateless horizontal application evolution
- `NFR-SCALABILITY-005` no premature distributed architecture
- `NFR-SCALABILITY-006` indexed tenant/status/date queries

Maintainability and testability:

- `NFR-MAINTAINABILITY-004` committed/auditable migrations
- `NFR-MAINTAINABILITY-005` Docs-as-Code synchronization
- `NFR-MAINTAINABILITY-006` ADR governance
- `NFR-TESTABILITY-001` deterministic domain tests
- `NFR-TESTABILITY-003` duplicate/failure/database-conflict coverage
- `NFR-TESTABILITY-004` authorization matrix testing
- `NFR-TESTABILITY-005` time-controlled testing
- `NFR-DATA-001` opaque public identifiers
- `NFR-DATA-002` integer minor-unit money representation
- `NFR-DATA-003` UTC event timestamps with explicit gym timezone
- `NFR-DATA-004` reconstructable history
- `NFR-DATA-005` domain-specific deletion/archival policy

### 2.3 Architecture-principle drivers

The database engine must support, without taking ownership away from application/domain code:

- `ARCH-PRIN-001` Tenant Isolation by Design
- `ARCH-PRIN-004` Deterministic Server-Side Business Truth
- `ARCH-PRIN-005` Financial Correctness Before Convenience
- `ARCH-PRIN-006` Idempotent Critical Effects
- `ARCH-PRIN-007` Auditable Sensitive Mutations
- `ARCH-PRIN-008` Gym-Local Business Time, UTC Event Time
- `ARCH-PRIN-009` Explicit Domain and State Ownership
- `ARCH-PRIN-010` Transactional Consistency for Correctness-Sensitive Changes
- `ARCH-PRIN-011` Async Side Effects Are Isolated From Canonical Transactions
- `ARCH-PRIN-013` Failure Visibility and Reconciliation
- `ARCH-PRIN-014` Observability by Design
- `ARCH-PRIN-016` Secure Defaults and Least Privilege
- `ARCH-PRIN-018` No Premature Infrastructure
- `ARCH-PRIN-019` Evolution Through Explicit Decisions

## 3. Constraints and Assumptions

1. Canonical business state belongs in trusted server-side persistence, not client state or analytics.
2. The data model is predominantly relational: tenants own members and identities; members have memberships, attendance, retention/follow-up history, renewals, payments, add-ons, notifications, and audit relationships.
3. Correctness-sensitive internal writes require normal local ACID transactions or an equivalent durable mechanism.
4. External payment, messaging, authentication, storage, and telemetry providers do not participate in a local database transaction.
5. Provider calls must not be held inside long correctness-critical database transactions without a specific reason.
6. Database constraints are backstops for durable invariants; they do not replace application/domain policy.
7. Tenant/gym/branch ownership must be explicit in the eventual schema wherever applicable.
8. Application-level authorization remains mandatory regardless of database capabilities.
9. `D-SEC-008` remains `OPEN`. Row-level security or equivalent database defense in depth may be evaluated later but is not selected here.
10. `D-ARCH-014` remains `OPEN`. Selecting PostgreSQL would not select Supabase, Neon, RDS, Cloud SQL, Azure Database, or any managed platform.
11. `D-ARCH-017` remains `PROPOSED`. This ADR does not select Drizzle, Kysely, Prisma, another query builder/ORM, or migration tooling.
12. `D-ARCH-007` remains `OPEN`. A database engine may enable durable database-backed job/outbox designs, but this ADR does not select one.
13. `D-ARCH-008` remains `OPEN`. Redis/cache/broker is not introduced by the database choice.
14. `D-ARCH-009` remains `OPEN`. Hosting/deployment provider selection is separate.
15. `D-ARCH-018` remains `PROPOSED`. This ADR requires production-like database integration testing but does not select the test framework.
16. `D-DATA-001..007` remain separate data-model decisions/proposals. Engine choice must support them without silently accepting them.
17. `D-DATA-007` does not block choosing an engine, but it blocks final Member/Membership schema and lifecycle constraints.
18. The ADR does not pin an exact database version. If accepted later, implementation must choose a supported release compatible with the selected platform, security support, extensions, and migration strategy.

## 4. Options Considered

### Option A: PostgreSQL as the canonical relational database

Use PostgreSQL as the primary canonical transactional database for Phase 1 state.

Relevant characteristics for GymPulse include:

- mature ACID transaction semantics,
- primary key, foreign key, unique, check, not-null, and exclusion constraints,
- partial indexes and partial unique indexes for conditional uniqueness when appropriate,
- mature SQL joins, aggregates, windowing, indexing, and query-planning capabilities,
- multiple transaction isolation levels including serializable behavior that requires application retry handling for serialization failures,
- JSON/JSONB support for bounded semi-structured metadata without forcing core state into documents,
- row-level security capability that can be evaluated separately under `D-SEC-008`,
- mature backup/restore, WAL, continuous archiving, replication, and point-in-time-recovery capabilities,
- broad managed-hosting and local-development ecosystems without tying the engine to one provider.

### Option B: MySQL / MariaDB family as the canonical relational database

Use the MySQL/MariaDB relational family, with a transactional storage engine such as InnoDB where applicable, for canonical state.

Relevant characteristics include:

- mature ACID transactions and rollback/crash recovery,
- primary keys, unique constraints/indexes, foreign keys, and standard relational modeling,
- mature SQL query, indexing, replication, backup, and point-in-time-recovery ecosystems,
- broad operational/provider support,
- generally strong suitability for ordinary transactional web applications.

This is a credible alternative. Material evaluation differences for GymPulse include less direct conditional/partial uniqueness expression than PostgreSQL and product-family divergence that would require a more exact MySQL-versus-MariaDB compatibility decision before implementation.

### Option C: Document / NoSQL-first canonical database

Use a document-oriented canonical database architecture, with MongoDB as the representative capability model.

Modern document databases can provide:

- multi-document transactions,
- unique indexes,
- schema validation,
- replication and backup/recovery capabilities,
- strong document-centric querying and aggregation.

However, GymPulse's canonical relationships and integrity rules are predominantly relational. A document-first model would require deliberate decisions about embedding versus references, cross-document transaction scope, application-enforced referential integrity, and join-like/reporting workflows without clear Phase 1 evidence that those tradeoffs benefit the product.

### Option D: Distributed SQL / NewSQL canonical database

Use a distributed relational database such as CockroachDB or another credible distributed SQL system as the canonical store.

This category can provide:

- SQL/relational data modeling,
- ACID transactions across distributed rows/tables,
- constraints and indexes,
- horizontal/distributed scaling,
- node/region resilience options depending on topology,
- distributed backup/restore capabilities.

It is technically credible, but it introduces distributed transaction, latency, retry, topology, capacity, and operational concerns that the current Phase 1 requirements do not demonstrate a need for.

## 5. Evaluation

### 5.1 Decision matrix

| Criterion | PostgreSQL | MySQL / MariaDB | Document / NoSQL-first | Distributed SQL / NewSQL |
|---|---|---|---|---|
| Natural fit for GymPulse relational model | Strong | Strong | Weak/Moderate | Strong |
| Multi-record ACID transactions | Strong | Strong | Supported | Strong, distributed |
| Foreign-key / relational integrity | Strong | Strong | Primarily application/reference design | Strong |
| Constraint expressiveness | Strong; includes partial unique/exclusion options | Strong standard relational constraints; conditional uniqueness less direct | Unique indexes/schema validation; weaker relational integrity model | Strong SQL constraints, product-specific compatibility nuances |
| Concurrency control | Strong | Strong | Strong with explicit transaction/read/write semantics | Strong; distributed retry semantics matter |
| Idempotency/effect uniqueness support | Strong | Strong | Strong when modeled with unique indexes/transactions | Strong |
| Operational joins/reporting/aggregates | Strong | Strong | Capable aggregation, less natural for heavily relational joins | Strong |
| Tenant-scoped indexing/querying | Strong | Strong | Strong field/index support | Strong |
| Optional database RLS capability | Available, separately governed | Different mechanisms; no assumption here | Different security model | Product-specific; separate decision still required |
| Migration/schema-evolution maturity | Strong | Strong | Mature but document-schema strategy differs | Strong, with distributed-DDL considerations |
| Backup/restore/PITR ecosystem | Strong | Strong | Strong ecosystem | Strong, but distributed operational model |
| Operational maturity | Strong | Strong | Strong | Strong but higher topology complexity |
| Local development/integration tests | Strong | Strong | Strong | Moderate/Strong, more realistic distributed tests may cost more |
| Phase 1 operational simplicity | Strong | Strong | Moderate | Weak/Moderate |
| Normal vertical/read-scaling evolution | Strong | Strong | Strong | Strong, distributed by design |
| Future partitioning/scale options | Strong | Strong | Strong | Strongest distributed model |
| Vendor/provider portability | Strong open ecosystem | Strong, but MySQL/MariaDB divergence matters | Medium; data model may lock in document assumptions | Medium; distributed-product semantics matter |
| Reversibility | Strong if SQL/domain boundaries stay explicit | Strong | Medium because canonical model would be document-shaped | Medium because distributed assumptions can enter operations/schema |
| Overall GymPulse Phase 1 fit | **Strongest** | **Strong credible alternative** | **Not preferred for canonical core** | **Not justified yet** |

### 5.2 Relational fit

GymPulse already has explicit relationships such as:

```text
Tenant / Gym
  -> Users / Identity Links
  -> Members
      -> Memberships
      -> Attendance
      -> Retention Cases
          -> Follow-ups
      -> Renewal Orders
          -> Payments
              -> Provider Events
              -> Business Effects
      -> Add-on Orders / Entitlements

Actor / System Process
  -> Audit Records
```

This is not a final schema. It demonstrates that ownership, foreign-key-like relationships, uniqueness, and multi-entity operational queries are central rather than incidental.

A relational engine therefore fits the existing domain model without forcing the team to model core invariants as application-managed document references.

### 5.3 Attendance correctness

GymPulse must tolerate retry/concurrency without creating duplicate logical attendance.

The eventual implementation may need some combination of:

```text
transaction
+ canonical-state recheck
+ idempotency key/effect record
+ domain duplicate policy
+ unique/index-backed invariant
+ auditable correction history
```

PostgreSQL and MySQL/MariaDB both provide strong transactional and uniqueness primitives. PostgreSQL's partial unique-index capability is additionally useful if the approved duplicate rule later needs a conditional uniqueness invariant that applies only to a subset of rows.

A document database can implement durable uniqueness and transactions, but attendance/member/membership/audit relationships offer no clear document-centric advantage for Phase 1.

A distributed SQL database can enforce the same class of invariant, but distributed consensus is not required to solve the current duplicate-check-in problem.

### 5.4 No-show / retention correctness

`FR-RETENTION-005` requires preventing duplicate active cases for the same member/rule context.

The invariant must not depend only on process-local locks. A relational database can combine application policy with transaction/concurrency handling and a uniqueness backstop appropriate to the approved state model.

PostgreSQL makes conditional uniqueness particularly direct if the eventual design expresses uniqueness only for active cases. This is a useful engine capability, not a final schema prescription.

### 5.5 Payment correctness

Payment handling may require one local transaction to perform several correctness-sensitive writes after provider evidence has already been verified:

```text
record provider event uniquely
  -> verify event has not already produced an effect
  -> transition canonical payment state
  -> claim intended business effect uniquely
  -> update membership or add-on through owning application/domain rules
  -> append required audit/reconciliation evidence
  -> persist durable continuation when required
  -> COMMIT
```

The checkout/client success screen is not a source of canonical payment truth.

PostgreSQL and MySQL/MariaDB both provide a strong relational transaction model for this flow. PostgreSQL's constraint/index expressiveness and SQL diagnostics fit the current exactly-once-effect/reconciliation model well.

A document-first database can perform multi-document transactions, but the payment, order, membership, provider-event, effect, and audit relationships are relational and cross-document by nature. The document model does not remove the transaction requirement.

### 5.6 Membership and renewal consistency

After verified payment evidence, the application may need to update payment-effect evidence and membership entitlement consistently with related audit/continuation state.

The engine must support a normal transaction pattern such as:

```text
BEGIN
  reload / verify current canonical state
  enforce domain invariant
  mutate canonical entities
  record idempotency / effect evidence
  record required audit / durable continuation
COMMIT
```

External payment or messaging calls stay outside that transaction.

`D-DATA-007` remains unresolved. The database engine can be selected now because every credible option can represent either final state model. Final Member/Membership tables, constraints, indexes, and state transitions must not be finalized until state ownership is resolved.

### 5.7 Multi-tenancy

The engine must support explicit tenant/gym ownership on tenant-owned records and efficient tenant-scoped keys/indexes/queries.

Application authorization remains:

```text
principal
+ tenant/resource scope
+ named capability
-> allow / deny
```

Database roles or row policies do not replace that model.

PostgreSQL additionally exposes row-level security as a possible defense-in-depth capability. Whether GymPulse adopts RLS, how service roles interact with it, and how policies are tested remain entirely under `D-SEC-008`.

### 5.8 Query and reporting fit

Likely Phase 1 operational queries include:

- members absent beyond threshold,
- follow-up due/actionable retention cases,
- returned members after outreach,
- memberships expiring soon,
- renewal pipeline,
- pending/failed/payment-exception queues,
- daily attendance by tenant/branch/date,
- revenue/payment reconciliation summaries,
- add-on fulfillment/usage queues,
- owner dashboard aggregates,
- audit investigation,
- data-quality exceptions.

These queries commonly combine tenant scope, status, dates, relationships, grouping, aggregates, and drill-down. Relational SQL with well-designed indexes and purpose-specific read models is a strong fit.

Analytics/read models remain non-authoritative and may later use materialized/derived representations where justified.

### 5.9 Data types and semi-structured data

The selected engine should support the current proposed data semantics without forcing final schema decisions:

- opaque UUID-like identifiers,
- UTC timestamps,
- explicit gym timezone,
- integer minor-unit money plus currency code,
- immutable provider references,
- structured metadata where justified.

PostgreSQL JSON/JSONB capability is useful as a supplement for bounded semi-structured data such as provider metadata or extensible non-core configuration. It should not be used to hide core membership/payment/attendance relationships or avoid explicit relational constraints.

## 6. Proposed Decision

**Propose Option A: PostgreSQL as the canonical transactional database engine for GymPulse Phase 1.**

The recommendation is driven by GymPulse-specific requirements:

1. The canonical model is naturally relational.
2. Attendance, payment effects, retention uniqueness, balance protection, and audit/history require strong transaction and constraint support.
3. PostgreSQL supports expressive durable correctness backstops, including standard relational constraints and conditional uniqueness through partial unique indexes where appropriate.
4. SQL joins, aggregates, indexes, and mature query planning fit operational queues, reconciliation, dashboards, audit investigation, and data-quality workflows.
5. PostgreSQL provides mature backup/restore, WAL/PITR, replication, and operational tooling foundations expected by `NFR-AVAILABILITY-004`.
6. Explicit tenant-scoped relational modeling fits Phase 1 and leaves optional row-level-security defense in depth available for later evaluation without making RLS part of this decision.
7. JSON/JSONB is available for bounded semi-structured metadata without requiring a document-first canonical model.
8. The engine can evolve through normal relational scaling techniques before distributed database complexity is justified.
9. PostgreSQL has broad managed-hosting/provider availability, allowing the engine choice to remain independent from `D-ARCH-014` and `D-ARCH-009`.

This proposal does **not** approve:

- the final database schema,
- `Member.status` versus `Membership.status` lifecycle semantics (`D-DATA-007`),
- RLS or any tenant-policy implementation (`D-SEC-008`),
- Drizzle, Kysely, Prisma, or any ORM/query builder (`D-ARCH-017`),
- a managed database/backend provider (`D-ARCH-014`),
- a hosting platform (`D-ARCH-009`),
- a background-job technology (`D-ARCH-007`),
- Redis/cache/broker (`D-ARCH-008`),
- database application/admin/migration role design,
- exact indexes,
- an exact PostgreSQL version.

If this ADR is later Accepted, implementation should select an actively supported PostgreSQL release compatible with the chosen managed/self-managed platform, security-support policy, required extensions, and migration strategy.

## 7. Consequences

### Positive consequences

- Correctness-sensitive application changes can use one well-understood relational transaction model.
- Foreign keys and relational constraints can reinforce ownership/reference integrity where the final schema allows them.
- Unique/partial-unique/index-backed invariants can provide durable protection against replay/concurrency defects.
- Payment/provider-event/effect history can remain strongly related and queryable for reconciliation.
- Operational queues and dashboard drill-down can be expressed directly with SQL before introducing separate analytics infrastructure.
- PostgreSQL-specific advanced capabilities remain optional rather than forcing an external cache, broker, document store, or distributed database.
- Broad tooling/provider support improves future hosting portability.

### Negative consequences

- PostgreSQL-specific features can create portability cost if used pervasively without justification.
- Connection management becomes an operational concern for serverless/high-concurrency runtime topologies.
- Long transactions, poor indexes, unbounded queries, or lock-heavy workflows can create latency and contention.
- Schema/migration discipline is mandatory; strong relational constraints make careless changes visible rather than allowing silent shape drift.
- Database correctness features can tempt over-centralization of business rules into SQL/triggers; the application/domain boundary must remain authoritative.

## 8. Security and Privacy Impact

### Database security capabilities required

Whichever PostgreSQL hosting/platform is later chosen must support a security posture including:

- encrypted client connections/TLS where production traffic requires it,
- least-privilege database accounts,
- separation of normal application, migration/admin, and operational access where practical,
- credential rotation without application redesign,
- protected backups,
- encryption-at-rest capability through the chosen platform,
- audit-safe access and operational diagnostics,
- tenant-aware queries and indexes,
- safe export/restore workflows.

### Application authorization remains authoritative

Database privileges and optional row-level policies do not replace GymPulse business authorization.

Protected operations still require:

```text
verified identity
  -> GymPulse principal
  -> tenant/resource scope
  -> named capability
  -> application/domain eligibility
```

`D-SEC-008` will separately decide whether PostgreSQL RLS is appropriate as defense in depth, including service-role behavior and negative policy tests.

### Privacy evolution

PostgreSQL is compatible with future scoped export, correction, deletion/anonymization, and retention workflows, but this ADR does not invent legal policies.

The following remain separate:

- `D-SEC-001` launch jurisdiction/privacy obligations,
- `D-SEC-005` deletion/export workflow and authority,
- `D-SEC-006` retention periods.

Financial/audit history must remain reconstructable according to existing requirements even if future privacy policies permit deletion/anonymization of other data.

## 9. Reliability, Performance, and Scalability Impact

### 9.1 Reliability and failure model

The application must expect and handle ordinary database failure modes, including:

- temporary database unavailability,
- connection-pool exhaustion,
- lock waits/deadlocks,
- serialization/retry errors at stronger isolation,
- statement/transaction timeouts,
- replica lag if read replicas are introduced,
- failover/reconnection windows,
- failed or partially applied migrations,
- slow queries,
- disk/storage/quota pressure.

Correct behavior requires explicit transient/permanent error classification, bounded retries where safe, idempotency, and operator-visible diagnostics. Blindly retrying arbitrary transactions is not acceptable.

### 9.2 Performance

Phase 1 should optimize normal relational performance before adding infrastructure.

Expected techniques include:

```text
explicit tenant ownership
+ appropriate tenant/status/date indexes
+ bounded pagination
+ selective joins
+ query-plan inspection
+ efficient aggregate/read-model queries
+ measurement
```

Likely hot paths include:

- member search,
- check-in eligibility and duplicate check,
- attendance time ranges,
- no-show/renewal scans,
- payment reconciliation,
- action queues,
- dashboard aggregates,
- audit lookup.

This ADR does not introduce Redis, sharding, or a distributed database to solve hypothetical scale.

### 9.3 Scalability path

The expected evolution path is:

```text
single primary relational database
  -> vertical capacity as needed
  -> schema/index/query optimization
  -> bounded/materialized derived read models where justified
  -> read replicas for read-heavy workloads where justified
  -> partitioning or stronger tenant partitioning when measured need appears
  -> distributed database/sharding only with evidence
```

A distributed SQL choice should be revisited if requirements later include hard multi-region write survivability/latency, distributed-consensus availability, scale beyond practical single-cluster relational evolution, or tenant/regulatory isolation that cannot be met cleanly with the current architecture.

## 10. Operations and Observability Impact

A future production PostgreSQL platform must expose enough operational capability to support:

- automated backups,
- point-in-time recovery or equivalent recovery to an approved point,
- restore into a separate environment,
- tested restore/recovery procedures,
- logical export/import when operationally appropriate,
- replication/failover behavior suitable to agreed availability targets,
- connection/session monitoring,
- slow-query/query-plan diagnosis,
- storage/capacity monitoring,
- transaction/lock/deadlock diagnostics,
- migration visibility,
- database health metrics and alerts.

`NFR-AVAILABILITY-005` RPO/RTO values are still Open. A managed-provider decision must later prove that its backup/restore/failover capabilities meet the approved objectives rather than assuming the engine alone provides operational recovery.

Connection strategy also depends on final runtime/hosting topology. The future platform evaluation must verify safe pooling/concurrency behavior for the selected application and worker runtimes.

## 11. Testing and Validation

Before this ADR becomes an implementation gate, run bounded non-production validation against a real PostgreSQL instance or equivalent isolated environment. Do not rely only on mocks for database-specific behavior.

Required validation scenarios:

1. **Concurrent attendance check-in uniqueness**: race two logical check-ins and prove one canonical business outcome.
2. **Payment provider-event dedupe**: replay the same verified provider-event identity and prove one canonical event/effect path.
3. **Exactly-once payment business effect**: concurrent/repeated effect application must not extend membership or activate an add-on twice.
4. **Single-active no-show invariant**: repeated/concurrent scans must not create duplicate active cases for one member/rule context.
5. **Transaction rollback on partial failure**: force failure after an intermediate write and prove correctness-sensitive state does not partially commit.
6. **Tenant-scoped query isolation**: verify query/repository behavior cannot accidentally return another tenant's records under the tested application scope.
7. **Representative dashboard aggregate**: prove bounded/indexable query plans for pilot-scale operational metrics.
8. **Audit/history query**: reconstruct a representative attendance/payment correction or reversal history.
9. **Migration from zero**: a fresh database can reach the expected schema state from committed migration history once `D-ARCH-017` is selected.
10. **Forward-compatible migration**: exercise an expand/contract-style change without requiring unsafe simultaneous deployment assumptions.
11. **Backup + restore rehearsal**: restore a representative database into a separate environment and verify integrity/reconciliation records.
12. **Connection-pooling/runtime compatibility**: verify selected runtime/deployment pattern handles pooling, restart, and transient disconnect behavior safely.
13. **Optional RLS capability experiment**: if `D-SEC-008` remains under consideration, test representative tenant policies as a separate spike without treating the spike as RLS adoption.

These validation scenarios do not select the final test runner, ORM/query builder, migration tool, managed provider, or job runner.

## 12. Migration and Rollout

There is no canonical production schema or database infrastructure to migrate in the current documentation phase.

If this ADR is later Accepted, the bounded rollout sequence should be:

```text
accept database engine decision
  -> resolve/sequence blocking data-model decisions such as D-DATA-007
  -> decide D-ARCH-017 data-access/query/migration strategy
  -> decide managed platform/hosting responsibilities
  -> design canonical schema and tenant ownership
  -> create committed migrations
  -> run real-database correctness/concurrency tests
  -> validate backup/restore and operational controls
  -> provision production infrastructure only after required gates
```

Schema changes should follow version-controlled migration discipline and favor forward-compatible expand/contract evolution when staggered application/worker deployments require it.

Rollback is not always the safest response to a production schema change. Migration design must support explicit rollback where safe or controlled forward-fix where reversal would risk data loss/incompatibility.

This ADR does not choose migration tooling.

## 13. Reversibility

Database-engine changes become expensive after substantial production data, migrations, SQL features, and operational processes exist. Reversibility therefore depends on disciplined boundaries rather than pretending the decision is cost-free.

Reversibility is improved by:

- keeping domain rules out of database-specific stored logic unless strongly justified,
- using repository/data-access ports rather than exposing driver objects to domain code,
- keeping provider and application contracts independent of database row shapes,
- avoiding JSONB/document storage for core relationships merely for convenience,
- documenting PostgreSQL-specific features when they are intentionally used,
- maintaining committed migration history and export/reconciliation capability,
- preserving stable business identifiers and external provider references.

Revisit the engine decision if evidence shows:

- a hard regional/provider constraint makes PostgreSQL impractical,
- a regulatory isolation requirement demands a materially different database architecture,
- measured scale exceeds practical relational vertical/read/partitioning evolution,
- the dominant canonical workload becomes genuinely non-relational,
- availability requirements require distributed-consensus topology that ordinary PostgreSQL architecture cannot meet acceptably,
- an approved platform constraint cannot support PostgreSQL safely,
- measured bottlenecks remain after sound schema/index/query/application design.

A revisit requires a new ADR and explicit data-migration/rollback plan.

## 14. Risks and Mitigations

### Risk: PostgreSQL recommendation becomes implicit provider selection

Mitigations:

- keep `D-ARCH-014` and `D-ARCH-009` separate,
- evaluate managed PostgreSQL providers only after requirements for region, backup, networking, security, jobs, and cost are explicit,
- state provider-neutral engine requirements in infrastructure documentation.

### Risk: ORM/query tooling hides database behavior

Mitigations:

- keep `D-ARCH-017` separate,
- require transaction/constraint/raw-SQL capability from future tooling,
- test real query plans and constraints,
- do not expose ORM models as domain architecture by default.

### Risk: database features replace domain ownership

Mitigations:

- application/domain modules own business state transitions,
- database enforces durable invariants that are suitable as backstops,
- avoid stored business workflows/triggers unless a later decision justifies them,
- keep data-access ports explicit.

### Risk: overuse of PostgreSQL-specific features reduces portability

Mitigations:

- use PostgreSQL-specific features when they materially improve correctness/operations,
- document each material dependency,
- prefer standard relational semantics where they are sufficient.

### Risk: JSONB becomes an unstructured canonical-model escape hatch

Mitigations:

- model core tenant/member/membership/attendance/payment relationships explicitly,
- reserve JSONB for justified semi-structured metadata,
- validate provider/config metadata at application boundaries.

### Risk: long/contended transactions hurt check-in/payment latency

Mitigations:

- keep external calls outside local transactions,
- keep transaction scope minimal and correctness-driven,
- index lookup/uniqueness paths,
- monitor lock/transaction latency,
- add bounded retry handling only for safe transient errors.

### Risk: backup exists but restore is untested

Mitigations:

- treat restore rehearsal as a release-readiness requirement,
- restore to a separate environment,
- verify constraints, key records, and reconciliation paths after restore.

### Risk: premature distributed scaling

Mitigations:

- measure first,
- optimize schema/index/query behavior,
- use vertical/read-scaling and bounded read models before sharding/distributed SQL,
- revisit only with concrete scale/availability evidence.

## 15. Open Questions

- Who is the authorized decision owner for `D-ARCH-002`?
- What launch jurisdiction/regional constraints under `D-SEC-001` will constrain future database hosting?
- What pilot and near-term tenant/member/payment/attendance volumes should be used for representative performance tests?
- What RPO/RTO targets will be approved under `NFR-AVAILABILITY-005`?
- Which managed PostgreSQL provider/platform responsibilities will later be selected under `D-ARCH-014` and `D-ARCH-009`?
- Will `D-SEC-008` adopt PostgreSQL RLS as defense in depth, and how will service/migration roles interact with it?
- Which data-access/query/migration approach will be selected under `D-ARCH-017`?
- What final Member versus Membership lifecycle model will be approved under `D-DATA-007`?
- Which exact PostgreSQL release will be supported at implementation time?
- Are any PostgreSQL extensions actually required? No requirement currently establishes one.
- What connection-pooling model is compatible with the eventual API/worker/hosting topology?
- What backup retention/recovery policy follows from `D-SEC-006` and approved RPO/RTO requirements?

## 16. Decision Evidence

### 16.1 Repository evidence

The repository currently supports the PostgreSQL recommendation because:

- the canonical decision register marks `D-ARCH-002` as `P0 PROPOSED` and explicitly states PostgreSQL is recommended but not accepted,
- the functional requirements define relational, transactional, historical, and idempotency-heavy workflows,
- `NFR-RELIABILITY-004` explicitly requires database-enforced uniqueness/relational constraints where practical,
- `NFR-AVAILABILITY-004` requires automated backups and a tested restore process,
- the architecture overview/component/data-flow documents define one canonical persistence boundary with local atomic transactions and durable effect evidence,
- the technology evaluation rates PostgreSQL as the current high-confidence engine direction while keeping managed backend, RLS, and data-access tooling separate.

### 16.2 Current official capability verification

Official product documentation was checked on `2026-09-02` only for capabilities material to this decision.

PostgreSQL official documentation confirms:

- check, not-null, unique, primary-key, foreign-key, and exclusion constraints, plus partial unique indexes for uniqueness over selected rows,
- mature transaction-isolation semantics including serializable execution with retryable serialization failures,
- row-level security capability, which remains separately governed for GymPulse,
- JSON/JSONB support as a supplemental structured-data capability,
- server administration support for backup/restore, WAL, replication, monitoring, and point-in-time recovery.

Primary references:

- <https://www.postgresql.org/docs/current/ddl-constraints.html>
- <https://www.postgresql.org/docs/current/indexes-partial.html>
- <https://www.postgresql.org/docs/current/transaction-iso.html>
- <https://www.postgresql.org/docs/current/ddl-rowsecurity.html>
- <https://www.postgresql.org/docs/current/datatype-json.html>
- <https://www.postgresql.org/docs/current/continuous-archiving.html>

MySQL official documentation confirms InnoDB provides ACID transactions, commit/rollback, crash recovery, row-level locking, foreign-key support, and point-in-time recovery through binary logs. This validates MySQL as a credible relational alternative rather than a strawman.

Primary references:

- <https://dev.mysql.com/doc/refman/8.4/en/innodb-introduction.html>
- <https://dev.mysql.com/doc/refman/8.4/en/create-table-foreign-keys.html>
- <https://dev.mysql.com/doc/refman/8.4/en/point-in-time-recovery.html>

MongoDB official documentation confirms multi-document transactions, unique indexes/schema validation, and backup capabilities. The reason it is not preferred is therefore relational fit and invariant/query complexity, not an incorrect claim that document databases cannot transact.

Primary references:

- <https://www.mongodb.com/docs/manual/core/transactions/>
- <https://www.mongodb.com/docs/manual/tutorial/unique-indexes-schema-validation/>
- <https://www.mongodb.com/docs/manual/core/backups/>

CockroachDB official documentation confirms distributed ACID transactions, relational constraints, and backup support. The reason it is not preferred is lack of a current Phase 1 requirement for distributed SQL complexity, not lack of correctness capability.

Primary references:

- <https://www.cockroachlabs.com/docs/stable/transactions>
- <https://www.cockroachlabs.com/docs/stable/constraints>
- <https://www.cockroachlabs.com/docs/stable/backup>

### 16.3 Acceptance-readiness evidence update — 2026-09-27

The shared validation harness at `../../validation/foundation/` proves several architecture/runtime prerequisites around retry-safe adapters and durable-state independence, but it **does not provide PostgreSQL evidence**.

The execution environment used for the current harness had no PostgreSQL client/server tools and no Docker/Podman runtime. Therefore all PostgreSQL-specific scenarios remain explicitly `NOT RUN`.

This ADR remains `Proposed` because:

- no authorized decision owner is identified;
- no explicit approval record exists;
- no real-PostgreSQL concurrency/idempotency spike has been run;
- transaction rollback, tenant-scoped SQL, representative relational query, and database error-translation evidence remain missing;
- no PostgreSQL backup/restore rehearsal exists;
- no representative PostgreSQL connection/pooling/restart validation exists;
- no production hosting/regional constraints are approved;
- `D-DATA-007` still blocks final Member/Membership schema semantics, while this ADR explicitly keeps the engine decision independently reviewable;
- no final schema/migration/data-access design exists.

The file-backed durability proof in the validation harness must not be cited as PostgreSQL acceptance evidence.

## 17. Related Documents

- `../00-overview/assumptions.md`
- `../01-product/functional-requirements.md`
- `../01-product/non-functional-requirements.md`
- `../02-architecture/architecture-principles.md`
- `../02-architecture/architecture-overview.md`
- `../02-architecture/container-architecture.md`
- `../02-architecture/component-architecture.md`
- `../02-architecture/data-flow.md`
- `../02-architecture/technology-stack.md`
- `ADR-0001-modular-monolith.md`
- `ADR-0002-primary-language-runtime.md`
- `ADR-0003-monorepo-strategy.md`
- `README.md`
- legacy migration evidence if needed: `../05-system-architecture.md`
- legacy migration evidence if needed: `../06-database-schema.md`
- legacy migration evidence if needed: `../09-payments-billing.md`
- legacy migration evidence if needed: `../12-security-audit.md`
- legacy migration evidence if needed: `../13-testing-qa.md`
- legacy migration evidence if needed: `../16-open-decisions.md`
