# Task 0012: Draft Canonical Database Engine ADR

## Goal

Draft one `Proposed` Architecture Decision Record for GymPulse canonical transactional database engine under `D-ARCH-002`, without accepting the engine, creating schema/migrations, or selecting managed hosting, RLS, data-access tooling, jobs, cache, or deployment infrastructure.

Canonical target:

`docs/adr/ADR-0004-database-engine.md`

## Inputs Read

Repository/current-state inputs:

- `.ai/README.md`
- `.ai/current-state.md`
- `.ai/task/0011-draft-repository-workspace-adr.md`
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

Legacy flat documents were not required to resolve the engine recommendation because current canonical structured docs already contain the controlling requirements, architecture boundaries, and decision status. They remain migration/evidence sources only.

Current official capability documentation was also checked on `2026-09-02` for PostgreSQL, MySQL, MongoDB, and CockroachDB in areas material to this ADR: transactions, constraints, conditional uniqueness where applicable, backup/PITR, row security capability, document transactions/uniqueness, and distributed SQL transactions/constraints.

## Repository State Verified

Before creating `ADR-0004`:

- `docs/adr/ADR-0004-database-engine.md` did not exist on latest `main`.
- `.ai/task/0012-draft-canonical-database-engine-adr.md` did not exist.
- `D-ARCH-002` remained `P0 PROPOSED` with PostgreSQL as the recommendation, explicitly not accepted.
- `docs/adr/README.md` placed `D-ARCH-002` next after ADR-0001 through ADR-0003.
- no authorized acceptance evidence for `D-ARCH-002` was present.
- `ADR-0001`, `ADR-0002`, and `ADR-0003` remained `Proposed`.
- `D-DATA-007` remained `PROPOSED` and unresolved.

Actual repository state matched the Task 0012 instruction, so drafting ADR-0004 was the correct bounded action.

## Current Database Decision

```text
D-ARCH-002
Priority: P0
Status: PROPOSED
Decision: Canonical database engine
Current recommendation: PostgreSQL
```

This task does not change the status to `DECIDED`.

## Findings

- GymPulse canonical Phase 1 state is strongly relational: tenants/gyms, identities, members, memberships, attendance, retention cases/follow-ups, renewals, payments/provider events/effects, add-ons, notifications, audit, and data-quality state have explicit ownership and relationships.
- Correctness-sensitive flows require local ACID transactions, concurrency-safe uniqueness, durable idempotency/effect evidence, reconstructable history, and operational reconciliation.
- `NFR-RELIABILITY-004` explicitly calls for database-enforced uniqueness/relational constraints where practical.
- Operational queues and dashboards need tenant/status/date filtering, joins, aggregates, pagination, and drill-down into canonical records.
- Backup and tested restore are production requirements under `NFR-AVAILABILITY-004`.
- PostgreSQL's current official capabilities align strongly with those needs, especially relational constraints, partial unique indexes, transaction isolation, SQL/query flexibility, backup/PITR, and optional RLS capability.
- MySQL/InnoDB is a credible relational alternative with ACID transactions, relational constraints, mature operations, and PITR; it was not treated as a strawman.
- Modern MongoDB supports multi-document transactions and unique indexes, but a document-first canonical model does not simplify GymPulse's relational integrity/query requirements.
- Distributed SQL such as CockroachDB is technically capable but introduces distributed transaction/topology/retry/latency complexity without a current Phase 1 requirement for that architecture.
- Database correctness backstops supplement application/domain rules. They do not move domain ownership into the database.
- External payment/messaging/provider calls remain outside long local database transactions.

## Options Evaluated

1. PostgreSQL as canonical relational database.
2. MySQL / MariaDB family as canonical relational database.
3. Document / NoSQL-first canonical database, using MongoDB as representative capability evidence.
4. Distributed SQL / NewSQL canonical database, using CockroachDB as representative capability evidence.

## Evaluation Summary

PostgreSQL is the strongest current GymPulse fit because it combines:

- natural relational modeling,
- strong transaction semantics,
- expressive durable constraints,
- useful conditional uniqueness through partial unique indexes,
- flexible SQL joins/aggregates/indexing for operational queries,
- mature backup/PITR/replication/monitoring ecosystem,
- JSON/JSONB for bounded semi-structured metadata without requiring document-first modeling,
- optional RLS capability that can be evaluated separately,
- normal relational scaling options before distributed complexity is needed.

MySQL/MariaDB remains a strong credible relational alternative. Document-first and distributed SQL architectures remain technically viable but do not currently improve the Phase 1 correctness/complexity tradeoff.

## Proposed Direction

`ADR-0004` proposes PostgreSQL as the canonical transactional database engine for GymPulse Phase 1.

This is a recommendation for review only.

It does not approve PostgreSQL and does not pin an exact PostgreSQL version.

## Decisions Explicitly Kept Separate

```text
D-ARCH-014  Managed backend/platform responsibilities     OPEN
D-ARCH-017  Data-access/query/migration tooling           PROPOSED
D-SEC-008   RLS/data-layer tenant isolation               OPEN when applicable
D-ARCH-007  Background jobs/scheduler                     OPEN
D-ARCH-008  Redis/cache/broker requirement                OPEN
D-ARCH-009  Hosting/deployment platform                   OPEN
D-ARCH-018  Core testing toolchain                        PROPOSED
D-DATA-001..007 data-model proposals                      PROPOSED
```

Therefore this task does not select Supabase, Neon, RDS, Cloud SQL, Azure Database, Drizzle, Kysely, Prisma, pg-boss, Redis, a hosting provider, a CI provider, or any managed database product.

## Requirement IDs Referenced

No requirement definition changed.

Functional requirements referenced include:

- `FR-AUTHZ-001`
- `FR-MEMBER-001`
- `FR-MEMBERSHIP-001,003,004`
- `FR-ATTENDANCE-003,005,006,010,011`
- `FR-RETENTION-005`
- `FR-FOLLOWUP-004`
- `FR-RETURN-002`
- `FR-RENEWAL-004,006`
- `FR-PAYMENT-002,004..007,009`
- `FR-ADDON-007`
- `FR-DASHBOARD-002..004`
- `FR-NOTIFICATION-002`
- `FR-AUDIT-001,003`
- `FR-DATA-QUALITY-001..002`
- `FR-CROSS-001..004`

Non-functional requirements referenced include:

- `NFR-SECURITY-001..006,009,011`
- `NFR-PRIVACY-001,003,005,006`
- `NFR-RELIABILITY-001..008`
- `NFR-AVAILABILITY-004..005`
- `NFR-PERFORMANCE-001..005`
- `NFR-SCALABILITY-001,003,005,006`
- `NFR-MAINTAINABILITY-004..006`
- `NFR-TESTABILITY-001,003..005`
- `NFR-DATA-001..005`
- `NFR-OPERATIONS-001..004`

## D-DATA-007 Impact

`D-DATA-007` remains `PROPOSED` and unresolved.

The database-engine decision can proceed because PostgreSQL, MySQL/MariaDB, document databases, and distributed SQL systems can all physically represent either eventual Member/Membership state model.

However, final schema/state-machine work must not proceed as if the ambiguity were resolved. In particular, final Member/Membership tables, lifecycle constraints, entitlement queries, indexes, and migration semantics must wait for explicit state-ownership resolution.

`ADR-0004` does not revise `FR-MEMBER-004` or `FR-MEMBERSHIP-002`.

## Validation Needed

Before ADR-0004 is treated as an implementation gate, run non-production validation covering:

1. concurrent attendance uniqueness,
2. provider-event dedupe,
3. exactly-once payment business effect,
4. single-active no-show invariant,
5. transaction rollback on partial failure,
6. tenant-scoped query isolation,
7. representative dashboard aggregate/query plan,
8. audit/history reconstruction,
9. migration-from-zero after tooling is selected,
10. forward-compatible migration behavior,
11. backup and restore rehearsal,
12. runtime/connection-pooling compatibility,
13. optional RLS capability experiment without adopting RLS.

No spike was implemented in Task 0012.

## Files Changed

Created:

- `docs/adr/ADR-0004-database-engine.md`
- `.ai/task/0012-draft-canonical-database-engine-adr.md`

Allowed continuity/index updates for this task:

- `docs/adr/README.md`
- `docs/README.md`
- `.ai/current-state.md`

No other canonical file required modification because no contradiction was discovered.

## Open Questions

- Who is the authorized decision owner for `D-ARCH-002`?
- What launch jurisdiction/region requirements will constrain future hosting?
- What representative pilot/near-term scale should be used for validation?
- What RPO/RTO objectives will be approved?
- Which managed PostgreSQL platform/provider, if any, will be selected separately?
- Will `D-SEC-008` adopt RLS defense in depth?
- Which data-access/query/migration approach will be selected under `D-ARCH-017`?
- What final Member/Membership state ownership will be approved under `D-DATA-007`?
- Which supported PostgreSQL version will be chosen at implementation time?
- What connection-pooling model fits the eventual runtime/hosting topology?

## Result

`ADR-0004` now exists as a `Proposed` recommendation for PostgreSQL as GymPulse canonical transactional database engine.

`D-ARCH-002` remains `PROPOSED`; no approval evidence was created or inferred.

No final schema, migration, RLS policy, ORM/query builder, database role model, managed provider, hosting, job runner, cache, database infrastructure, or application code was created.

## Next Recommended Task

After completing index/current-state synchronization, re-check the actual canonical ADR queue and decision register.

If repository state remains unchanged, the expected next bounded task is:

```text
Task 0013: Draft Data Access / Query / Migration Strategy ADR
Primary decision: D-ARCH-017
Likely target: docs/adr/ADR-0005-data-access-migration-strategy.md
Initial status: Proposed
```

Do not draft ADR-0005 during Task 0012.
