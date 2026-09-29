# ADR-0005: Data Access, Query, Transaction, and Migration Strategy

## Status

`Proposed`

## Decision Metadata

- ADR: `ADR-0005`
- Primary Decision ID: `D-ARCH-017`
- Related Decision IDs: `D-ARCH-002`, `D-ARCH-005`, `D-ARCH-001`, `D-ARCH-016`, `D-ARCH-014`, `D-SEC-008`, `D-ARCH-007`, `D-ARCH-009`, `D-ARCH-018`, `D-ARCH-019`, `D-DATA-001`, `D-DATA-002`, `D-DATA-003`, `D-DATA-004`, `D-DATA-005`, `D-DATA-006`, `D-DATA-007`
- Decision Owner: `Open`
- Technical Owner: `Architecture / Data Architecture / Backend`
- Date Proposed: `2026-09-06`
- Date Accepted: `Not accepted`
- Supersedes: `None`
- Superseded By: `None`

## 1. Context

GymPulse needs a persistence-access and migration strategy for trusted server-side code that preserves the architecture already defined for Phase 1.

The strategy must support two materially different access patterns.

### Correctness-sensitive commands

Examples include:

```text
check-in
membership renewal effect
verified payment processing
payment business-effect claim
no-show case creation
attendance correction
add-on entitlement / usage
sensitive audit-producing mutation
```

These operations require visible transaction ownership, concurrency-safe database constraints, durable idempotency/effect uniqueness, controlled error mapping, and the ability for several persistence components to participate in one local transaction when the application use case requires it.

### Operational queries

Examples include:

```text
member search
no-show / follow-up queues
renewal pipeline
payment reconciliation
owner dashboard aggregates
audit lookup
data-quality queues
```

These require transparent SQL, joins, aggregates, bounded pagination, index-aware filtering, purpose-specific read models, and the ability to inspect the actual SQL and query plan.

The persistence layer is infrastructure. The architecture remains:

```text
Transport / Framework
        ↓
Application
        ↓
Domain
        ↓ ports used by application/domain where useful
Persistence Infrastructure
        ↓
Database access / query tool
        ↓
Canonical database
```

Domain modules must not depend directly on Drizzle, Kysely, Prisma, a PostgreSQL driver, a database connection object, or database-row/query-result objects where that would make infrastructure representation define business semantics.

At the same time, GymPulse should not hide the database behind generic `Repository<T>` or database-agnostic abstractions that make transactions, constraints, SQL, and database-specific correctness features harder to use.

`D-ARCH-017` is the canonical decision ID for this topic. Earlier wording in `technology-stack.md` that called this a `Decision Register Gap` is historical; Task 0008 normalized the decision register and `docs/00-overview/assumptions.md` is authoritative.

`ADR-0004` is Accepted and `D-ARCH-002 = DECIDED`; PostgreSQL is the canonical transactional database engine. This ADR therefore evaluates data-access/migration candidates against accepted PostgreSQL while remaining separately governed under `D-ARCH-017`.

This ADR answers:

> How should GymPulse trusted server-side application code query and mutate canonical persistence, own transactions, and manage version-controlled database migrations?

It does not define the final schema, choose a managed provider, adopt RLS, select hosting, select background jobs, or resolve data-model decisions.

## 2. Requirements and Decision Drivers

### 2.1 Functional correctness drivers

- `FR-AUTHZ-001` tenant-scoped authorization
- `FR-MEMBER-001` explicit tenant/gym/branch ownership on canonical member records
- `FR-MEMBERSHIP-003` valid membership date range
- `FR-MEMBERSHIP-004` server-side entitlement-sensitive eligibility
- `FR-ATTENDANCE-003` exactly one canonical attendance result
- `FR-ATTENDANCE-005` duplicate protection
- `FR-ATTENDANCE-006` retry-safe attendance
- `FR-ATTENDANCE-010` reconstructable attendance correction context
- `FR-ATTENDANCE-011` no silent destructive correction
- `FR-RETENTION-005` one active no-show case per member/rule context
- `FR-FOLLOWUP-004` preserved follow-up history
- `FR-RENEWAL-006` no membership extension on payment initiation
- `FR-PAYMENT-002` verified provider evidence as payment truth
- `FR-PAYMENT-004` retained provider-event/reference evidence
- `FR-PAYMENT-005` duplicate callback safety
- `FR-PAYMENT-006` exactly-once membership effect
- `FR-PAYMENT-007` exactly-once add-on effect
- `FR-PAYMENT-009` reconstructable refund/reversal history
- `FR-ADDON-007` no negative usage/stock balance in normal flows
- `FR-DASHBOARD-003` actionable operational queues
- `FR-DASHBOARD-004` drill-down to underlying records
- `FR-AUDIT-001` sensitive action log
- `FR-AUDIT-003` audit integrity
- `FR-CROSS-001` server-side canonical truth
- `FR-CROSS-002` idempotent critical effects
- `FR-CROSS-003` explicit tenant context

### 2.2 Non-functional drivers

Security and isolation:

- `NFR-SECURITY-001` tenant isolation
- `NFR-SECURITY-002` least privilege
- `NFR-SECURITY-003` server-side authorization
- `NFR-SECURITY-004` secret protection
- `NFR-SECURITY-009` auditability
- `NFR-SECURITY-011` sensitive error minimization

Reliability and correctness:

- `NFR-RELIABILITY-001` idempotent critical mutations
- `NFR-RELIABILITY-002` payment exactly-once effect
- `NFR-RELIABILITY-003` retry-safe background work
- `NFR-RELIABILITY-004` database-enforced invariants where practical
- `NFR-RELIABILITY-005` canonical source of truth
- `NFR-RELIABILITY-007` retry diagnosis
- `NFR-RELIABILITY-008` payment/membership reconciliation

Performance and scale:

- `NFR-PERFORMANCE-001` responsive check-in
- `NFR-PERFORMANCE-002` indexed member search
- `NFR-PERFORMANCE-003` bounded/indexed action queues
- `NFR-PERFORMANCE-004` efficient dashboard queries
- `NFR-PERFORMANCE-005` provider latency outside long transactions
- `NFR-SCALABILITY-001` explicit tenant ownership
- `NFR-SCALABILITY-006` indexed tenant/status/date queries

Maintainability, testability, and operations:

- `NFR-MAINTAINABILITY-001` shared domain rules
- `NFR-MAINTAINABILITY-004` committed/auditable migrations
- `NFR-MAINTAINABILITY-005` documentation synchronization
- `NFR-MAINTAINABILITY-006` ADR governance
- `NFR-TESTABILITY-001` deterministic domain tests
- `NFR-TESTABILITY-003` database conflict/failure testing
- `NFR-TESTABILITY-004` authorization matrix testing
- `NFR-OPERATIONS-001` separate environments
- `NFR-OPERATIONS-002` production-secret separation
- `NFR-OPERATIONS-003` migration safety
- `NFR-OPERATIONS-004` release smoke validation
- `NFR-DATA-004` reconstructable history

### 2.3 Architecture-principle drivers

The decision is especially constrained by:

- `ARCH-PRIN-001` Tenant Isolation by Design
- `ARCH-PRIN-004` Deterministic Server-Side Business Truth
- `ARCH-PRIN-005` Financial Correctness Before Convenience
- `ARCH-PRIN-006` Idempotent Critical Effects
- `ARCH-PRIN-007` Auditable Sensitive Mutations
- `ARCH-PRIN-009` Explicit Domain and State Ownership
- `ARCH-PRIN-010` Transactional Consistency for Correctness-Sensitive Changes
- `ARCH-PRIN-011` Async Side Effects Are Isolated From Canonical Transactions
- `ARCH-PRIN-013` Failure Visibility and Reconciliation
- `ARCH-PRIN-014` Observability by Design
- `ARCH-PRIN-016` Secure Defaults and Least Privilege
- `ARCH-PRIN-018` No Premature Infrastructure
- `ARCH-PRIN-019` Evolution Through Explicit Decisions

## 3. Constraints and Assumptions

1. `D-ARCH-017` is `P1 PROPOSED`; no data-access/query/migration tool is accepted.
2. `D-ARCH-002` is `P0 DECIDED`; PostgreSQL is the accepted canonical transactional database engine.
3. A future superseding database-engine ADR would require this persistence-tooling proposal to be re-evaluated.
4. `D-ARCH-016` is `DECIDED`; strict TypeScript with a supported Node.js LTS runtime is an accepted foundation category, while exact versions remain separate.
5. Application command handlers own correctness-sensitive local transaction boundaries.
6. Domain modules own business rules/state transitions and must not be defined by generated database models.
7. Persistence adapters are server-only infrastructure.
8. Client applications must never import database clients, migrations, credentials, privileged configuration, or migration/admin APIs.
9. Database constraints are first-class correctness backstops and must remain visible/reviewable.
10. Raw SQL is an intentional capability, not an abstraction failure.
11. External payment, messaging, authentication, storage, and telemetry calls do not participate in a local database transaction.
12. Cross-domain module boundaries must not artificially prevent one transaction when one application use case requires atomic writes across the shared canonical database.
13. Purpose-specific read/query services may bypass generic entity repositories when SQL-shaped read models are clearer, provided authorization/tenant scope is already established and the read model has no alternate mutation authority.
14. `D-SEC-008` remains `OPEN`; RLS compatibility is required, RLS adoption is not.
15. `D-DATA-001..007` remain separate. This ADR does not approve schema semantics.
16. `D-DATA-007` remains unresolved and blocks final Member/Membership schema/state-machine work.
17. One shared canonical database should have one canonical ordered migration history unless a later architecture decision explicitly introduces independent database ownership.
18. Production schema evolution must be driven by committed migration artifacts, not ad-hoc console changes or direct schema push.
19. Compile-time database types do not replace runtime validation of HTTP, webhook, job, provider, or configuration input.
20. Connection strategy must remain compatible with long-lived servers, serverless request runtimes, background workers, migration runners, and test environments without selecting hosting now.

## 4. Options Considered

### Option A: Drizzle-oriented TypeScript persistence

Evaluate Drizzle ORM as the primary typed SQL/query layer and Drizzle Kit as the integrated migration companion against the now-accepted TypeScript/Node.js and PostgreSQL foundation categories.

Expected characteristics:

- TypeScript schema declarations feed strongly typed query construction,
- SQL-shaped query API rather than a fully opaque entity ORM,
- explicit transaction callbacks with transaction-scoped query handles and savepoint support,
- parameterized `sql` escape hatch that can participate in normal queries/transactions,
- first-class PostgreSQL constraint/index definitions including partial/expression indexes,
- generated SQL migration files that can be committed and reviewed,
- custom SQL migrations for DDL/data changes not represented cleanly by the schema DSL,
- PostgreSQL RLS/role/policy capability exists, while adoption remains separately governed.

Primary architectural risk: maintaining disciplined synchronization between the desired TypeScript schema declaration, committed migration history, and actual database state. The tool must not be used as permission to `push` unmanaged production schema changes.

### Option B: Kysely-oriented typed query layer

Use Kysely as a thin SQL-shaped typed query layer and keep migration ownership explicit.

Expected characteristics:

- strong TypeScript query/result typing with SQL-shaped composition,
- highly visible relationship between query code and generated SQL,
- explicit transaction callbacks, controlled transactions, and savepoints,
- raw SQL and DDL/query-builder escape hatches,
- classic ordered migrations are available,
- database types may be maintained manually or generated from database/schema sources,
- PostgreSQL-specific DDL/RLS/index operations can be expressed through SQL when needed.

Primary architectural risk: the cleanest GymPulse version of this option may require a second migration/type-generation convention beyond the query builder itself. That can be justified, but it adds moving parts relative to one integrated schema/query/migration family.

### Option C: Prisma-oriented ORM strategy

Use Prisma ORM as the primary schema/query/client/migration abstraction.

Prisma is a credible alternative and must be evaluated using its current capability, not older limitations. As of the research date, Prisma 8 is the current `prisma@latest` line and includes:

- a rich PostgreSQL transaction surface,
- typed SQL-shaped query building plus raw SQL escape paths,
- expression/partial/unique index authoring,
- RLS policy authoring/introspection capability,
- a contract-based migration workflow with planned/reviewed version-controlled migration artifacts,
- editable TypeScript migration intent with compiled operations and DDL previews.

Primary architectural tradeoff: Prisma 8 uses a more opinionated contract/client/migration model. Its migration system is also newer and evolving relative to classic SQL-file migration systems. This increases tool-model lock-in and makes the committed deployment artifact less directly SQL-first than the GymPulse preference for simple reviewable SQL change history.

### Option D: SQL-first persistence strategy

Center persistence on hand-authored, version-controlled SQL migrations plus parameterized SQL for queries, optionally supplemented by generated database types or a very thin typed helper.

Expected characteristics:

- maximum visibility into database behavior,
- direct access to every PostgreSQL feature if PostgreSQL is accepted,
- migration artifacts are plain SQL and easy to review with database-native tooling,
- straightforward RLS/policy/index/backfill support,
- minimal ORM/schema-DSL lock-in.

Primary tradeoff: more manual mapping, result typing, boilerplate, refactoring effort, and team SQL discipline. Without a well-governed type-generation/mapping convention, compile-time drift between SQL and application types becomes easier to introduce.

## 5. Evaluation

### 5.1 Decision matrix

| Criterion | Drizzle-oriented | Kysely-oriented | Prisma-oriented | SQL-first |
|---|---|---|---|---|
| SQL transparency | Strong | **Very strong** | Strong/Moderate; current SQL builder helps, higher abstraction remains | **Very strong** |
| TypeScript type safety | **Strong** | **Strong** | **Strong** | Moderate unless generated/typed layer added |
| Explicit transaction ownership | **Strong** | **Strong** | **Strong** | Strong, but more manual |
| Transaction-scoped context | Strong | Strong | Strong | Strong with driver discipline |
| Savepoint/nested capability | Strong | Strong | Supported capability depends on chosen API/use case; validate in spike | Database-native/manual |
| PostgreSQL feature access | **Strong** | **Strong via SQL/DDL** | Strong and materially improved in Prisma 8; escape hatch still important | **Strongest** |
| Constraints/index support | **Strong** | Strong through migrations/DDL | Strong, including current partial/expression index support | **Strongest** |
| Raw SQL ergonomics | **Strong** | **Strong** | Strong, but multiple raw/typed SQL surfaces require clear policy | Native |
| Migration control | **Strong** with generated + custom SQL | Strong but convention/tool ownership is more explicit/manual | Strong but more tool-owned/contract-driven | **Strongest** |
| Migration reviewability | **Strong: committed SQL** | Strong; depends on chosen migration convention | Moderate/Strong: review TS intent, compiled ops, DDL preview | **Strongest: committed SQL** |
| RLS compatibility | Strong; native support + custom SQL | Strong through explicit SQL | Strong and improved in Prisma 8 | Strong through SQL |
| Complex operational queries | Strong | **Very strong** | Strong, including typed SQL/raw escape paths | **Very strong** |
| Read-model flexibility | Strong | **Very strong** | Strong | **Very strong** |
| Schema/type drift handling | Strong if schema + migrations + checks are synchronized | Moderate/Strong; type-generation/source convention must be explicit | Strong contract/history model | Moderate unless automated checks/type generation added |
| Real-database testing | Strong | Strong | Strong | Strong |
| Repository/server-only isolation | Strong | Strong | Strong | Strong |
| Operational migration safety | Strong if direct push is prohibited and SQL is reviewed | Strong with disciplined migrations | Strong capability; newer migration model must prove operational fit | Strong but manual discipline is highest |
| Learning/maintenance cost | Moderate | Moderate; SQL literacy high | Moderate; broader Prisma model/tooling to learn | Highest SQL/mapping discipline |
| Tool lock-in | Moderate | Low/Moderate | Highest of these options | Lowest |
| Reversibility | Strong/Moderate | Strong | Moderate | Strongest |
| Overall GymPulse fit | **Strongest current fit** | **Strong alternative** | Credible alternative; validate current migration model carefully | Strong control, higher maintenance cost |

### 5.2 Correctness-sensitive command fit

The persistence strategy must make a flow like this explicit:

```text
Application Command Handler
  -> begin local transaction
  -> load/recheck canonical state
  -> invoke domain policy
  -> write owning-domain state
  -> claim idempotency / uniqueness evidence
  -> write required audit / durable continuation state
  -> commit
```

For a verified payment event, the same local transaction may need to coordinate Payments, Memberships/Add-ons, Audit, and durable continuation persistence after provider evidence has already been verified:

```text
verified provider event
  -> claim provider event uniquely
  -> load/transition canonical payment
  -> claim business effect uniquely
  -> apply intended membership/add-on effect
  -> persist audit/continuation state
  -> COMMIT
```

The payment provider call itself remains outside the transaction.

Drizzle and Kysely both expose transaction-scoped query handles directly and preserve SQL visibility. Prisma also supports explicit PostgreSQL transaction APIs and raw/typed SQL inside transaction scope, so it remains credible. SQL-first provides maximum control but requires more infrastructure code to propagate transaction context safely.

### 5.3 Attendance concurrency fit

Attendance cannot use only:

```text
check for attendance
then insert
```

because concurrent/retried requests can race.

The strategy must allow the eventual design to combine:

- request idempotency,
- domain duplicate policy,
- database uniqueness/constraint backstop,
- one transaction where required,
- deterministic mapping of known uniqueness/conflict outcomes.

All four options can support this. Drizzle is favored because it keeps typed query ergonomics while leaving PostgreSQL uniqueness/partial-index behavior visible and testable.

### 5.4 Command persistence abstractions versus read/query models

GymPulse should not force every persistence operation through a generic entity repository.

Recommended distinction:

```text
Correctness-sensitive commands
  -> domain/application-focused persistence ports or narrow repositories
  -> transaction-scoped persistence context

Operational reads
  -> purpose-specific query services/read models
  -> SQL-shaped joins/aggregates/pagination
  -> no mutation authority
```

Examples of useful command-facing methods may include `claimPaymentEffect`, `createAttendanceWithConflictProtection`, or `createActiveCaseIfAbsent`, because these express persistence semantics required by the use case.

A dashboard query should be allowed to join canonical tables through a purpose-specific query service rather than pretending a sequence of generic repositories is more domain-pure.

### 5.5 Domain types versus persistence types

Generated or inferred database types are infrastructure types, not canonical domain models.

Conceptually:

```text
Database row/result
      ↓
Persistence mapper / application boundary
      ↓
Domain or application type
```

Mapping can be lightweight where representations align. It must remain explicit where database representation differs from business meaning, where nullable/storage states exist that the domain should not expose, or where a read model intentionally differs from a write model.

No Drizzle/Kysely/Prisma-generated type should silently redefine membership, payment, attendance, authorization, or other domain semantics.

### 5.6 Query visibility and performance

Whichever strategy is later accepted must allow developers to:

- inspect generated/executed SQL,
- attach a safe operation/use-case name to database telemetry,
- measure query and transaction duration,
- run `EXPLAIN`/database-native plan inspection on representative queries,
- detect N+1 patterns,
- inspect tenant/status/date filtering,
- verify pagination and index use,
- implement purpose-built aggregates/read models.

This is especially important for no-show scans, renewal scans, payment reconciliation, owner dashboards, audit queries, and data-quality queues.

## 6. Proposed Decision

**Propose Option A: a Drizzle-oriented TypeScript persistence strategy with explicit transaction ownership, SQL-transparent queries, and generated-then-reviewed committed SQL migrations. The foundation TypeScript/Node.js and PostgreSQL categories are now accepted; this ADR and `D-ARCH-017` remain Proposed until separately authorized.**

The proposal is architectural, not permission to install or scaffold Drizzle.

### 6.1 Persistence-access rules

If accepted after its dependencies are approved:

1. Use Drizzle as server-only persistence infrastructure, not as the domain model.
2. Application command handlers own correctness-sensitive transaction boundaries.
3. A narrow transaction callback/context or Unit-of-Work adapter supplies the same transaction-scoped database handle to all participating persistence adapters.
4. Do not use a global service locator or hidden implicit transaction mechanism.
5. Domain code does not import Drizzle table/query/transaction types.
6. Purpose-specific operational query services may use Drizzle/SQL directly inside the persistence boundary after authorization/tenant scope is established.
7. Raw SQL remains a supported first-class escape hatch.
8. Database-specific correctness features may be used deliberately if `D-ARCH-002` ultimately accepts PostgreSQL.

### 6.2 Transaction strategy

Preferred conceptual interface:

```text
Application Command Handler
  -> withTransaction(async txContext =>
       repository/query A(txContext)
       repository/query B(txContext)
       audit/continuation persistence(txContext)
     )
  -> commit or rollback
```

The transaction adapter owns lifecycle and the transaction-scoped query handle only. It must not own business policy.

Rules:

- transactions are explicit around use cases that need atomicity,
- cross-module persistence may share the same transaction when correctness requires it,
- external provider calls stay outside long local transactions,
- savepoints are available for genuine lower-level atomic sub-operations but are not a default business partial-success mechanism,
- serialization/deadlock failures may retry the **whole safe transaction** with bounded policy when the operation is replay-safe,
- uniqueness/foreign-key/check conflicts are classified and mapped deliberately rather than blindly retried,
- raw SQL must be able to execute using the same transaction-scoped context.

### 6.3 Migration strategy and source of truth

Adopt a **controlled code-first + committed-SQL migration model**:

```text
desired persistence schema declaration
  -> generate migration SQL
  -> review SQL and safety impact
  -> use explicit custom SQL migration when required
  -> commit migration artifact
  -> validate from empty + upgrade path
  -> apply through controlled migration runner
  -> verify resulting database state
```

Authority is split deliberately by purpose:

- the typed persistence schema declaration represents the desired implementation schema where the selected tool models it,
- the **committed migration history** is the authoritative ordered change/deployment record for governed environments,
- the actual database must be verified against that history; unmanaged drift is a defect.

Production/staging schema change must not rely on direct schema `push` or console mutation.

For PostgreSQL-specific DDL, advanced constraints, partial/expression indexes, future RLS policies, data backfills, or other operations that are clearer outside the schema DSL, use explicit committed SQL migration steps/custom migrations rather than hiding the capability.

The shared canonical database should have one canonical migration history. Domain/module ownership can be reflected in migration naming/review, but separate independent migration histories against the same shared database would create ordering and cross-domain transaction ambiguity without a later explicit database-boundary decision.

### 6.4 Production migration safety

Future migration design must support:

```text
additive / nullable change
  -> deploy compatible readers/writers
  -> backfill in bounded/restartable manner
  -> validate data/invariant
  -> strengthen constraint / index
  -> remove obsolete path later
```

Use expand-and-contract when staggered deployment requires compatibility. Avoid destructive one-step renames/drops/type changes when a forward-compatible sequence is safer.

Large-table operations, blocking DDL, index creation, backfills, constraint validation, and data rewrites require explicit operational review. A failed schema change is not assumed universally reversible; forward-fix may be safer than rollback after data-shape changes.

Application deployment and migration application remain separately ordered release steps. `D-ARCH-019` will choose CI/CD tooling later.

### 6.5 Raw SQL policy

Raw SQL is permitted and sometimes preferred when it makes the database contract more explicit.

Approved categories include:

- constraints/indexes not represented cleanly by the typed API,
- partial/expression indexes,
- future RLS policy/role/session-context DDL if separately approved,
- migration backfills,
- complex operational/read-model queries,
- database-native functions/features with clear value,
- performance-critical queries after measurement,
- `EXPLAIN`/administrative verification and migration checks.

Rules:

1. Dynamic values must be parameterized through safe APIs; never concatenate untrusted values into SQL.
2. Raw SQL may run inside the normal transaction context.
3. Migration SQL is version-controlled and reviewable.
4. Database-specific SQL is documented when it creates material lock-in.
5. Raw SQL does not bypass tenant authorization, domain ownership, or audit requirements.
6. Query telemetry must not log raw secrets, tokens, payment payloads, or unnecessary PII.

### 6.6 Failure classification

Persistence infrastructure should normalize known database failures into stable internal categories such as:

```text
UniqueConflict
ForeignKeyConflict
CheckConstraintConflict
SerializationOrDeadlockRetryable
ConnectionUnavailable
Timeout
MigrationFailure
UnexpectedDatabaseError
```

Application code maps known conflicts into controlled business/application outcomes when appropriate. Raw driver/database errors must not be sent directly to clients.

## 7. Consequences

### Positive consequences

- Transaction boundaries remain visible at the application layer.
- One transaction can span several module persistence adapters when the shared canonical database and use case require it.
- SQL remains understandable enough for correctness and performance review.
- TypeScript query safety reduces common mapping/query mistakes without making types the runtime trust boundary.
- PostgreSQL-specific constraints/indexes can remain first-class if PostgreSQL is accepted.
- Generated migration SQL provides a direct review artifact and custom SQL preserves database escape hatches.
- Operational read models are not forced through generic CRUD repositories.
- Domain/application code stays framework/query-tool independent.
- The strategy can run from interactive servers, workers, tests, and migration/admin tooling.

### Negative consequences

- The team must maintain SQL literacy and understand transaction/isolation/locking behavior.
- Keeping TypeScript schema declarations, migration history, and actual database state synchronized requires discipline and automated checks.
- Drizzle-specific query/schema code creates moderate tool lock-in.
- Advanced custom SQL requires careful coordination so schema declarations and database state do not diverge.
- Generated SQL still requires human review; generation does not make migrations automatically safe.
- Connection pooling/runtime behavior remains a separate deployment concern and needs validation for serverless topologies.

## 8. Security and Privacy Impact

### Server-only boundary

Persistence implementation, database clients, migrations, schema administration, and credentials are server-only.

Client-safe code must never import or receive:

- database connection strings/credentials,
- migration/admin credentials,
- database client instances,
- migration tooling,
- service-role credentials,
- schema-management APIs,
- privileged database configuration.

### Query safety

- Prefer typed/parameterized query APIs for dynamic values.
- Raw SQL must use parameter binding for values.
- Dynamic identifiers require narrowly controlled allowlists/builders, not user string interpolation.
- Database errors/logs must be sanitized before crossing trust boundaries.

### Tenant scope

Protected persistence operations must receive or derive trusted tenant/gym/resource scope from the authorized application execution context. A client-supplied tenant ID is never sufficient authority.

Repository/query interfaces should make tenant scope difficult to omit on protected operations, while recognizing that some privileged system/migration operations need separately governed access.

### Least privilege

The strategy must be compatible with separate application, migration/admin, and operational roles/credentials where the later platform design uses them. The data-access library does not define GymPulse authorization.

### Privacy evolution

The strategy must allow later targeted export, correction, anonymization, retention, archival, and financial/audit preservation workflows without requiring that database rows themselves become domain models. Exact privacy/retention policy remains outside this ADR.

## 9. Reliability, Performance, and Scalability Impact

### Reliability

Correctness-sensitive operations combine application/domain rules with database backstops.

The strategy must preserve:

- explicit transaction scope,
- durable uniqueness/constraint enforcement,
- deterministic conflict handling,
- request/provider/business-effect idempotency separation,
- reconstructable history,
- bounded retry for known transient transaction conflicts,
- durable continuation when required.

Repository/module boundaries must not split a transaction merely because source code is split into packages or domains.

### Performance

Prefer database fundamentals before additional infrastructure:

```text
tenant/status/date filters
+ appropriate indexes
+ bounded pagination
+ explicit joins/aggregates
+ query-plan inspection
+ slow-query measurement
+ purpose-built read models where justified
```

The selected tool must not obscure N+1 behavior or make it difficult to inspect actual SQL.

### Scalability and connection context

The persistence strategy must be compatible with:

- a normal long-lived Node server,
- a serverless request runtime,
- a background worker,
- a migration runner,
- an isolated real-database test environment.

Connection pool sizing, serverless proxies/poolers, prepared-statement behavior, transaction pinning, connection lifetime, and failover handling depend on the eventual driver/hosting/provider topology and must be validated later. No managed pool/provider is selected here.

## 10. Operations and Observability Impact

Future persistence operations should expose privacy-safe telemetry for:

- query operation/use-case name,
- query duration,
- transaction duration,
- slow-query category,
- database error category,
- migration identifier and duration,
- connection/pool pressure where exposed,
- request/job/correlation identifier.

Avoid logging full SQL with interpolated sensitive values by default. Prefer normalized operation names, parameter-redacted SQL/templates, and database-side slow-query tooling where appropriate.

Migration operations must support future release separation such as:

```text
validate migration history
  -> verify expected schema state
  -> apply approved migration step
  -> deploy compatible application/worker artifact
  -> post-deploy smoke/reconciliation verification
```

Exact release automation remains under `D-ARCH-019`.

Operators must be able to distinguish migration failure, transient connection failure, constraint conflict, and application/domain rejection rather than receiving one generic database error.

## 11. Testing and Validation

Before this ADR becomes an implementation gate, run non-production spikes against a real database implementation consistent with the still-Proposed engine direction.

Required validation:

1. **Transaction spanning two persistence modules**: one application command uses two domain persistence adapters plus audit/continuation inside one transaction.
2. **Concurrent attendance uniqueness**: concurrent/retried check-ins produce one canonical business effect and deterministic conflict handling.
3. **Provider-event dedupe**: repeated provider event identity is recorded/processed once.
4. **Payment exactly-once business effect**: concurrent/replayed payment processing cannot extend membership or activate an add-on twice.
5. **Partial/conditional unique index migration**: prove the proposed tool can create/review/apply the needed PostgreSQL-style invariant if PostgreSQL is accepted.
6. **Check/foreign-key constraint migration**: verify DDL review and conflict behavior.
7. **Complex tenant/status/date operational query**: no-show/renewal/payment-style query with pagination and index-aware plan inspection.
8. **Dashboard aggregate**: purpose-specific aggregate/read-model query without generic repository N+1 behavior.
9. **Raw SQL inside managed transaction**: parameterized custom SQL shares the same transaction and rollback semantics.
10. **Migration from empty database**: committed history builds the representative schema from zero.
11. **Upgrade from previous representative schema**: migration sequence preserves representative data and compatibility.
12. **Failed migration behavior**: verify diagnostics and recovery/forward-fix process.
13. **Schema drift detection**: an unmanaged database/schema change is detected rather than silently normalized.
14. **Serverless/pooled connection compatibility**: validate transaction pinning, pooling, restart/disconnect behavior for the eventual runtime candidate.
15. **RLS-policy migration proof of capability**: create/test representative policy DDL only in a disposable spike without adopting RLS.
16. **Query observability / SQL inspection**: prove SQL, duration, error category, and correlation can be inspected without logging secrets/PII.

The spike must compare the proposal against the strongest alternative where material. No production schema should be created through this validation.

## 12. Migration and Rollout

There is no application/database scaffold or canonical schema to migrate today.

If this ADR and its prerequisite decisions are later Accepted, implementation rollout should be incremental:

```text
approve prerequisite database/runtime decisions
  -> establish server-only persistence boundary
  -> establish explicit transaction context
  -> establish one canonical migration history
  -> prove generated + custom SQL review workflow
  -> prove fresh + upgrade migration tests
  -> implement one correctness-sensitive command
  -> implement one operational read query
  -> add drift/dependency/secret boundaries
  -> integrate release migration gates later
```

Do not create one repository/package per table or domain automatically. Persistence grouping should follow real ownership and transaction/query needs.

Migrations must be committed with the application change that requires them when possible, while deployment order remains explicit and independently controllable.

Production migration safety favors forward-compatible change sequences and forward-fix where rollback would risk data loss or application incompatibility.

## 13. Reversibility

Tool replacement becomes harder as query code, schema DSL, migrations, and generated types accumulate. This proposal preserves reversibility by:

- keeping domain/application types independent of Drizzle types,
- exposing narrow persistence ports only where they add business/transaction value,
- allowing purpose-specific query services rather than ORM-shaped domain APIs,
- preserving committed SQL migration artifacts,
- allowing parameterized raw SQL for database-native features,
- documenting PostgreSQL-specific dependencies if later accepted,
- avoiding tool-specific behavior in external API/domain contracts.

Kysely or a SQL-first strategy remains a practical fallback if validation shows Drizzle hides or complicates a required transaction, PostgreSQL feature, migration-safety practice, RLS capability, connection topology, or query-plan workflow.

Prisma remains revisitable if its current contract/migration model proves operationally simpler without losing SQL/constraint visibility.

A change after production adoption requires a new ADR and migration/replacement plan; it must not be performed by incrementally mixing multiple persistence tools without governance.

## 14. Risks and Mitigations

### Risk: typed schema becomes mistaken for domain model

Mitigations:

- keep generated/database types in infrastructure,
- map to domain/application types where semantics differ,
- forbid domain imports from persistence-tool packages.

### Risk: generated migrations are trusted without review

Mitigations:

- commit generated SQL,
- review SQL/lock/data implications,
- require migration tests from empty and previous representative state,
- use custom SQL migrations for operations that need explicit control.

### Risk: schema declaration and custom SQL drift apart

Mitigations:

- define drift as a defect,
- keep custom DDL documented in migration history,
- add future automated drift checks,
- update schema declarations where the tool must know the resulting object.

### Risk: raw SQL introduces injection or bypasses architecture

Mitigations:

- parameterize dynamic values,
- restrict dynamic identifiers,
- keep raw SQL server-only,
- preserve tenant/application authorization,
- review database-specific SQL and tests.

### Risk: one repository abstraction fragments multi-domain transactions

Mitigations:

- transaction is owned by the application command,
- participating adapters receive the same transaction context,
- package/domain boundaries do not imply separate transactions.

### Risk: direct schema push bypasses migration governance

Mitigations:

- prohibit direct push for staging/production governed environments,
- use committed migration history as deployment record,
- detect unmanaged drift.

### Risk: connection handling fails under serverless/worker topology

Mitigations:

- keep connection strategy outside domain/application code,
- validate pool/proxy/transaction semantics against final hosting topology,
- classify connection/transient errors explicitly.

### Risk: Prisma alternative is rejected using stale capability assumptions

Mitigation:

- current research explicitly recognizes Prisma 8 transactions, partial/expression indexes, RLS authoring, typed/raw SQL, and its new migration model; the remaining concern is fit, maturity, SQL-review ergonomics, and lock-in rather than a claim that those features do not exist.

## 15. Open Questions

- Who is the authorized decision owner for `D-ARCH-017`?
- Will `D-ARCH-002` ultimately accept PostgreSQL, or must this ADR be re-evaluated for another engine?
- Will `D-ARCH-016` accept TypeScript/Node.js, which materially affects the fit of all three TypeScript tooling options?
- Does the Drizzle spike preserve transaction/context ergonomics across interactive and worker runtimes without leaking tool types into application/domain code?
- What migration naming/ownership convention best represents one canonical migration history without mapping one domain to one migration stream?
- What drift-check mechanism should future CI use under `D-ARCH-019`?
- What exact connection/pooling strategy follows from the future API/worker/hosting topology?
- Will `D-SEC-008` adopt RLS defense in depth, and if so how will application, worker, migration, and admin roles/session context interact?
- Which `D-DATA-007` state ownership model will eventually define Member/Membership constraints and entitlement queries?
- Which query/transaction cases, if any, are materially clearer with Kysely or SQL-first than with Drizzle after the spike?
- What operational evidence threshold would justify mixing a second query tool rather than keeping one primary persistence approach?

## 16. Decision Evidence

### 16.1 Repository evidence

Current repository evidence supports an SQL-aware typed strategy because:

- `D-ARCH-017` is `P1 PROPOSED` and explicitly calls for a SQL-aware typed layer, committed migrations, and raw-SQL escape capability,
- `ADR-0004` proposes PostgreSQL but keeps data-access tooling separate,
- the component architecture assigns transaction ownership to application handlers/Unit of Work and requires transaction context to propagate through persistence ports,
- operational read/query components are allowed purpose-specific indexed joins/aggregates and are not alternate write authorities,
- critical data flows require concurrency-safe attendance, provider-event/effect uniqueness, cross-domain local transactions, audit, and tenant scope,
- `NFR-RELIABILITY-004` requires database-enforced invariants where practical,
- `NFR-MAINTAINABILITY-004` requires committed/auditable migrations,
- `NFR-OPERATIONS-003` requires migration safety,
- `NFR-TESTABILITY-003` requires database-conflict/failure coverage.

### 16.2 Current official capability verification

Official documentation was checked on `2026-09-06` for material capability claims only.

#### Drizzle ORM / Drizzle Kit

Official Drizzle documentation confirms:

- explicit transaction callbacks and nested/savepoint transactions,
- a parameterized `sql` escape hatch,
- primary/unique/check/not-null constraints plus PostgreSQL index APIs that include expression and partial-index predicates,
- generated SQL migrations applied from committed migration files,
- custom SQL migrations for unsupported/specialized DDL or data work,
- PostgreSQL RLS/role/policy support that can remain unused unless `D-SEC-008` later adopts it.

Primary references:

- <https://orm.drizzle.team/docs/transactions>
- <https://orm.drizzle.team/docs/sql>
- <https://orm.drizzle.team/docs/indexes-constraints>
- <https://orm.drizzle.team/docs/kit-overview>
- <https://orm.drizzle.team/docs/drizzle-kit-migrate>
- <https://orm.drizzle.team/docs/kit-custom-migrations>
- <https://orm.drizzle.team/docs/rls>

#### Kysely

Official Kysely documentation confirms:

- SQL-shaped strongly typed query construction,
- PostgreSQL dialect support through a database driver,
- raw SQL, transactions, DDL, joins, aggregates/window functions, and purpose-specific repository/query code,
- simple and controlled transaction APIs plus savepoints,
- classic ordered migration support,
- generated database types are recommended for production applications when appropriate.

Primary references:

- <https://www.kysely.dev/docs/getting-started>
- <https://www.kysely.dev/docs/migrations>
- <https://www.kysely.dev/docs/examples/transactions/simple-transaction>
- <https://www.kysely.dev/docs/examples/transactions/controlled-transaction>
- <https://www.kysely.dev/docs/examples/transactions/controlled-transaction-w-savepoints>

#### Prisma ORM

Current Prisma documentation/changelog confirms that Prisma 8 is now `prisma@latest` and materially changes the comparison from older Prisma versions. Current capabilities include:

- a rich PostgreSQL transaction surface,
- typed SQL/query-builder and raw SQL escape paths,
- partial/expression/unique index authoring,
- PostgreSQL RLS policy authoring/introspection,
- a contract-based migration flow with version-controlled TypeScript migration intent, compiled operations, DDL previews, checks, and raw-SQL escape for database-specific operations.

Prisma 8's migration architecture is comparatively new and more tool-owned than the plain-SQL migration history preferred by this proposal. That is a fit/reversibility consideration, not a claim that Prisma lacks the required database features.

Primary references:

- <https://www.prisma.io/docs/orm/reference/transactions-and-runtime>
- <https://www.prisma.io/docs/orm/reference/sql-query-builder>
- <https://www.prisma.io/docs/orm/reference/raw-queries>
- <https://docs.prisma.io/docs/orm/prisma-schema/data-model/indexes>
- <https://docs.prisma.io/docs/orm/migrations/how-migrations-work>
- <https://docs.prisma.io/docs/orm/v8/migrations/editing-a-migration>
- <https://www.prisma.io/changelog/2026-07-17>
- <https://www.prisma.io/changelog/2026-08-02>
- <https://www.prisma.io/changelog/2026-08-28>

#### PostgreSQL capability context

Because `D-ARCH-002` is now DECIDED via ADR-0004, PostgreSQL-specific claims can be treated as engine-specific architecture evidence while data-access tooling remains separately Proposed. Official PostgreSQL documentation confirms the material primitives that the persistence layer must not obscure, including constraints, partial indexes, transaction isolation, and RLS capability.

Primary references:

- <https://www.postgresql.org/docs/current/ddl-constraints.html>
- <https://www.postgresql.org/docs/current/indexes-partial.html>
- <https://www.postgresql.org/docs/current/transaction-iso.html>
- <https://www.postgresql.org/docs/current/ddl-rowsecurity.html>

### 16.3 Missing acceptance evidence

This ADR remains `Proposed` because:

- the decision owner is not identified,
- no explicit approval exists,
- PostgreSQL and the TypeScript/Node.js foundation categories are accepted dependencies; exact versions and the data-access tool remain separately governed,
- no representative Drizzle/Kysely/Prisma/SQL-first spike has been executed,
- no cross-module transaction spike exists,
- no real concurrency/conflict test exists,
- no migration-from-zero/upgrade/failure/drift test exists,
- no serverless/pool compatibility evidence exists,
- no RLS compatibility spike exists,
- `D-DATA-007` still blocks final Member/Membership schema semantics.

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
- `ADR-0004-database-engine.md`
- `README.md`
- legacy migration evidence if later needed: `../06-database-schema.md`
- legacy migration evidence if later needed: `../07-api-contracts.md`
- legacy migration evidence if later needed: `../12-security-audit.md`
- legacy migration evidence if later needed: `../13-testing-qa.md`
- legacy migration evidence if later needed: `../15-engineering-workflow.md`
- legacy migration evidence if later needed: `../16-open-decisions.md`
