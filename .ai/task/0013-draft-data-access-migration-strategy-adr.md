# Task 0013: Draft Data Access / Query / Migration Strategy ADR

## Goal

Draft one `Proposed` ADR for GymPulse persistence access, transaction ownership, query construction, raw SQL, and version-controlled migration strategy under canonical decision `D-ARCH-017`, without accepting any persistence tool or creating database/application implementation.

Canonical target:

`docs/adr/ADR-0005-data-access-migration-strategy.md`

## Inputs Read

Current repository inputs:

- `.ai/README.md`
- `.ai/current-state.md`
- `.ai/task/0012-draft-canonical-database-engine-adr.md`
- `docs/README.md`
- `docs/00-overview/assumptions.md`
- `docs/01-product/functional-requirements.md`
- `docs/01-product/non-functional-requirements.md`
- `docs/02-architecture/architecture-principles.md`
- `docs/02-architecture/architecture-overview.md`
- `docs/02-architecture/container-architecture.md`
- `docs/02-architecture/component-architecture.md`
- `docs/02-architecture/data-flow.md`
- `docs/02-architecture/technology-stack.md`
- `docs/adr/README.md`
- `docs/adr/ADR-0001-modular-monolith.md`
- `docs/adr/ADR-0002-primary-language-runtime.md`
- `docs/adr/ADR-0003-monorepo-strategy.md`
- `docs/adr/ADR-0004-database-engine.md`

Legacy files were not required to resolve this bounded decision because current structured architecture and requirements already contain controlling evidence. They remain migration/evidence sources only.

Current official documentation was checked on `2026-09-06` for Drizzle ORM/Drizzle Kit, Kysely, Prisma ORM, and PostgreSQL capabilities material to transaction ownership, raw SQL, constraints/indexes, migrations, and future RLS compatibility.

## Repository State Verified

Before creation:

- `docs/adr/ADR-0005-data-access-migration-strategy.md` did not exist on latest `main`.
- `.ai/task/0013-draft-data-access-migration-strategy-adr.md` did not exist.
- `D-ARCH-017` remained `P1 PROPOSED` and was the next bounded ADR item in `docs/adr/README.md`.
- `D-ARCH-002` remained `P0 PROPOSED`; `ADR-0004` continued to recommend PostgreSQL without accepting it.
- `ADR-0001` through `ADR-0004` remained `Proposed` with no authorized acceptance evidence.
- `D-SEC-008` remained `OPEN`.
- `D-DATA-007` remained `P1 PROPOSED` and unresolved.

The actual repository state matched the Task 0013 instruction.

## Canonical Decision State

```text
D-ARCH-017
Priority: P1
Status: PROPOSED
Decision: Data-access, query, transaction, and migration tooling strategy
Current direction: SQL-aware typed layer + explicit committed migrations + raw-SQL escape hatch
```

No candidate was accepted by this task.

## Historical Decision-ID Normalization

`technology-stack.md` was written before Task 0008 and still contains historical `Decision Register Gap` wording for data-access tooling.

The current canonical register assigns this decision to:

```text
D-ARCH-017
```

`docs/00-overview/assumptions.md` and `docs/adr/README.md` control the current ID/status. No new decision ID was created.

## Findings

- Correctness-sensitive commands and operational queries have different persistence needs; one generic CRUD repository model is not sufficient.
- Application command handlers must own local transaction boundaries and be able to pass one transaction-scoped persistence context across several module adapters.
- Source-code/domain boundaries must not fragment a transaction that must be atomic in the shared canonical persistence boundary.
- Database uniqueness/check/foreign-key/index constraints remain first-class correctness backstops.
- Raw SQL is required for advanced PostgreSQL features, migration backfills, complex read models, future RLS policy DDL, and operational verification.
- Committed migration artifacts must be reviewable and must be the governed deployment/change history; direct schema push is not an acceptable staging/production source of truth.
- Read/query models should be purpose-specific and SQL-aware rather than forced through generic entity repositories.
- Persistence types are infrastructure types and must not silently become domain models.
- PostgreSQL and TypeScript/Node.js remain Proposed, so the tooling recommendation is conditional and revisitable.
- Prisma's current capability is materially stronger than older comparisons: Prisma 8 is current `prisma@latest`, supports richer PostgreSQL transactions, typed/raw SQL, partial/expression indexes, RLS authoring, and a new contract/migration model. Its remaining tradeoffs are fit, migration-model maturity/complexity, SQL review ergonomics, and lock-in rather than missing basic capabilities.

## Options Evaluated

1. Drizzle-oriented TypeScript persistence with Drizzle Kit migration support.
2. Kysely-oriented typed SQL query layer with explicit migration ownership.
3. Prisma-oriented ORM/client/contract/migration strategy using current Prisma 8 capabilities.
4. SQL-first migrations and parameterized SQL/thin typed query layer.

## Evaluation Summary

Drizzle is the strongest current GymPulse fit if the proposed TypeScript/PostgreSQL directions are later accepted because it provides one cohesive server-side typed SQL/query/schema/migration family while preserving:

- explicit transaction callbacks/context,
- SQL transparency,
- raw SQL escape capability,
- PostgreSQL constraints/partial indexes,
- generated reviewable SQL migrations,
- custom SQL migrations,
- future RLS compatibility,
- direct operational query flexibility.

Kysely is the strongest alternative when maximum SQL-shaped query transparency and more explicit migration ownership are preferred. SQL-first provides maximum control at higher mapping/type/maintenance cost. Prisma remains credible but its more opinionated and comparatively new Prisma 8 contract/migration model creates greater tool-model coupling for the current GymPulse migration-governance preference.

## Proposed Direction

`ADR-0005` proposes a **Drizzle-oriented TypeScript persistence strategy** with explicit transaction ownership and a **generated-then-reviewed committed SQL migration model**, conditional on later acceptance of compatible runtime/database decisions.

This task does not approve or install Drizzle.

## Transaction Strategy

Application command handlers own correctness-sensitive transaction boundaries.

Conceptually:

```text
Application Command Handler
  -> withTransaction(txContext)
       -> persistence adapter A(txContext)
       -> persistence adapter B(txContext)
       -> audit/continuation persistence(txContext)
  -> COMMIT / ROLLBACK
```

One transaction context may span several module persistence adapters. The transaction abstraction owns lifecycle/context, not business rules. External provider calls remain outside long local transactions. Known database conflicts are classified; safe serialization/deadlock retries retry the whole transaction with bounded policy where replay safety is established.

## Migration Strategy

Recommended philosophy:

```text
typed desired persistence schema
  -> generated migration SQL
  -> review SQL/safety
  -> custom SQL migration when needed
  -> commit migration history
  -> test fresh + upgrade path
  -> controlled apply
  -> verify database state/drift
```

The typed schema declaration expresses desired implementation state where supported. The committed migration history is the authoritative ordered deployment/change record for governed environments. Direct schema push is not the production/staging mechanism.

One shared canonical database should have one canonical migration history unless a future database-ownership ADR establishes otherwise.

## Raw SQL Policy

Raw SQL remains first-class for:

- advanced constraints/indexes,
- partial/expression indexes,
- future RLS DDL if separately approved,
- data backfills,
- complex operational/read-model queries,
- database-native features,
- measured performance-critical queries,
- administrative/EXPLAIN/migration verification.

Dynamic values must be parameterized. Raw SQL may execute inside the normal transaction context and must not bypass tenant authorization/domain/audit boundaries.

## Schema Ownership Boundary

The ADR does not create/finalize the domain schema.

Persistence schema definitions, database-row/query-result types, and query-tool types remain infrastructure. Domain/application types remain separately owned and are mapped explicitly where business and storage representations differ.

No generic `Repository<T>` or DAO-per-table architecture is proposed. Narrow domain/application persistence ports are used where they enforce ownership/concurrency semantics; purpose-specific read/query services are used for operational joins/aggregates.

## RLS Compatibility

`D-SEC-008` remains `OPEN`.

The proposed strategy is compatible with future PostgreSQL RLS/role/policy DDL through Drizzle's current capability and/or explicit SQL migrations. This is proof of compatibility only. No policy, database role, tenant session-context mechanism, or RLS adoption decision was created.

Application authorization remains principal + tenant/resource scope + named capability regardless of a future database defense-in-depth choice.

## D-DATA-007 Impact

`D-DATA-007` remains unresolved.

Data-access/migration strategy can be evaluated now, but final Member/Membership tables, lifecycle constraints, entitlement queries, indexes, and state-machine migrations cannot be finalized until state ownership is approved.

No change was made to `FR-MEMBER-004` or `FR-MEMBERSHIP-002`.

## Decisions Kept Separate

```text
D-ARCH-002  Canonical database engine                 PROPOSED / ADR-0004 Proposed
D-ARCH-005  Architecture style                        PROPOSED / ADR-0001 Proposed
D-ARCH-001  Repository/workspace                      PROPOSED / ADR-0003 Proposed
D-ARCH-016  Primary language/runtime                  PROPOSED / ADR-0002 Proposed
D-ARCH-014  Managed backend/platform responsibilities OPEN
D-SEC-008   RLS/data-layer tenant isolation           OPEN when applicable
D-ARCH-007  Background jobs                           OPEN
D-ARCH-009  Hosting                                   OPEN
D-ARCH-018  Testing toolchain                         PROPOSED
D-ARCH-019  CI/CD + release/secrets tooling           OPEN
D-DATA-001..007 data-model decisions                  PROPOSED
```

No managed provider, job runner, hosting platform, test framework, CI provider, RLS strategy, or final schema was selected.

## Requirement IDs Referenced

No requirement definition changed.

Functional requirements include:

- `FR-AUTHZ-001`
- `FR-MEMBER-001`
- `FR-MEMBERSHIP-003,004`
- `FR-ATTENDANCE-003,005,006,010,011`
- `FR-RETENTION-005`
- `FR-FOLLOWUP-004`
- `FR-RENEWAL-006`
- `FR-PAYMENT-002,004..007,009`
- `FR-ADDON-007`
- `FR-DASHBOARD-003..004`
- `FR-AUDIT-001,003`
- `FR-CROSS-001..003`

Non-functional requirements include:

- `NFR-SECURITY-001..004,009,011`
- `NFR-RELIABILITY-001..005,007,008`
- `NFR-PERFORMANCE-001..005`
- `NFR-SCALABILITY-001,006`
- `NFR-MAINTAINABILITY-001,004..006`
- `NFR-TESTABILITY-001,003,004`
- `NFR-OPERATIONS-001..004`
- `NFR-DATA-004`

## Validation Required

Before acceptance/implementation, run non-production validation for:

1. transaction spanning two persistence modules,
2. concurrent attendance uniqueness,
3. provider-event dedupe,
4. payment exactly-once business effect,
5. partial/conditional unique-index migration,
6. check/foreign-key constraint migration,
7. complex tenant/status/date operational query,
8. dashboard aggregate,
9. raw SQL inside managed transaction,
10. migration from empty database,
11. upgrade from previous representative schema,
12. failed migration behavior,
13. schema drift detection,
14. serverless/pooled connection compatibility,
15. RLS-policy migration proof-of-capability without adopting RLS,
16. query observability / SQL inspection.

No spike was implemented in Task 0013.

## Files Changed

Created:

- `docs/adr/ADR-0005-data-access-migration-strategy.md`
- `.ai/task/0013-draft-data-access-migration-strategy-adr.md`

Continuity/index updates authorized for this task:

- `docs/adr/README.md`
- `docs/README.md`
- `.ai/current-state.md`

No other canonical file required modification because no contradiction was discovered.

## Open Questions

- Who owns final approval for `D-ARCH-017`?
- Will `D-ARCH-002` accept PostgreSQL and `D-ARCH-016` accept TypeScript/Node.js?
- Does the Drizzle spike preserve cross-module transaction and raw-SQL ergonomics under realistic GymPulse flows?
- What migration naming/ownership convention best maintains one canonical migration history?
- Which drift-check mechanism should later CI use?
- What connection/pooling strategy follows from eventual API/worker/hosting topology?
- Will `D-SEC-008` adopt RLS and how would app/worker/migration/admin roles behave?
- Which Member/Membership state model will resolve `D-DATA-007`?
- Does Kysely or SQL-first materially outperform the proposed strategy on any representative query/migration case?

## Result

`ADR-0005` now exists as a `Proposed` recommendation for a Drizzle-oriented, SQL-transparent TypeScript persistence approach with explicit transaction ownership, committed reviewable SQL migrations, and a first-class raw-SQL escape hatch.

`D-ARCH-017` remains `PROPOSED`.

`D-ARCH-002` remains `PROPOSED`; PostgreSQL is not accepted by this task.

No ORM/query tool was installed. No database client, schema, migration, RLS policy, managed backend, database infrastructure, application code, job runner, CI workflow, or deployment configuration was created.

## Next Recommended Task

After synchronizing the ADR/documentation/current-state indexes, re-check `docs/adr/README.md`, `docs/00-overview/assumptions.md`, and `.ai/current-state.md`.

If the dependency queue remains unchanged, the expected next bounded task is:

```text
Task 0014: Draft Managed Backend / Platform Responsibilities ADR
Primary decision: D-ARCH-014
Likely target: docs/adr/ADR-0006-managed-backend-responsibilities.md
Initial status: Proposed
```

Do not create ADR-0006 during Task 0013.
