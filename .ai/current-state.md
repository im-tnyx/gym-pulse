# GymPulse Current State

## Project

`GymPulse` (`im-tnyx/gym-pulse`)

## Current Documentation Phase

`Phase 4 - System Architecture / Architecture Governance`

## Canonical Architecture Completed at Draft Level

```text
docs/02-architecture/architecture-principles.md
docs/02-architecture/architecture-overview.md
docs/02-architecture/system-context.md
docs/02-architecture/container-architecture.md
docs/02-architecture/component-architecture.md
docs/02-architecture/data-flow.md
docs/02-architecture/technology-stack.md
docs/adr/README.md
```

## Current ADR State

```text
ADR-0001-modular-monolith.md
Primary decision: D-ARCH-005
Status: Proposed
Accepted: No

ADR-0002-primary-language-runtime.md
Primary decision: D-ARCH-016
Status: Proposed
Accepted: No

ADR-0003-monorepo-strategy.md
Primary decision: D-ARCH-001
Status: Proposed
Accepted: No

ADR-0004-database-engine.md
Primary decision: D-ARCH-002
Status: Proposed
Accepted: No
```

No authorized approval evidence exists for these ADRs. Therefore:

```text
D-ARCH-005 remains PROPOSED
D-ARCH-016 remains PROPOSED
D-ARCH-001 remains PROPOSED
D-ARCH-002 remains PROPOSED
```

## Canonical Database Position

`ADR-0004` proposes PostgreSQL as the canonical transactional database engine for Phase 1 after evaluating:

```text
A. PostgreSQL relational database
B. MySQL / MariaDB relational family
C. Document / NoSQL-first database
D. Distributed SQL / NewSQL database
```

The recommendation is based on GymPulse's relational domain shape, transaction/constraint requirements, attendance and payment idempotency, tenant-scoped operational queries, reconciliation/audit needs, backup/restore expectations, and Phase 1 operational simplicity.

PostgreSQL is **not accepted** by this state file or by the ADR draft.

Database-engine selection remains distinct from:

```text
D-ARCH-014  managed backend/provider responsibilities
D-ARCH-017  data-access/query/migration tooling
D-SEC-008   RLS/data-layer tenant isolation
D-ARCH-007  background jobs/scheduler
D-ARCH-008  Redis/cache/broker
D-ARCH-009  hosting/deployment platform
D-ARCH-018  test tooling
```

No managed database provider, RLS policy, ORM/query builder, job technology, cache/broker, hosting provider, exact PostgreSQL version, final database role model, or exact index strategy has been selected.

## D-DATA-007 State

`D-DATA-007` remains `P1 PROPOSED` and unresolved.

Database-engine selection can proceed independently, but final Member/Membership lifecycle schema, constraints, indexes, entitlement queries, and state-machine migrations must not be finalized until state ownership is resolved.

No change was made to `FR-MEMBER-004` or `FR-MEMBERSHIP-002`.

## Important Architecture Boundaries

- Phase 1 is gym operations/retention, not a generic fitness super-app.
- Clients are untrusted for canonical business truth.
- Authentication and GymPulse authorization are separate responsibilities.
- Protected operations require principal + tenant/resource scope + named capability.
- Application handlers own cross-domain orchestration; domain modules own canonical state transitions.
- Database constraints reinforce durable invariants but do not replace domain/application rules.
- Background execution reuses the same application/domain rules as interactive flows.
- Payment provider evidence must be verified before canonical payment mutation.
- Membership/add-on payment effects are protected exactly once.
- External provider calls do not participate in long local database transactions.
- Gym-local timezone controls business calendar logic; event timestamps remain UTC.
- Read models, telemetry, analytics, and data-quality views are non-authoritative for writes.
- Static types do not replace runtime validation, authorization, transactions, idempotency, or database constraints.

## Technology Governance State

Key unresolved decisions include:

```text
D-ARCH-001  repository strategy                  P0 PROPOSED / ADR-0003 drafted
D-ARCH-002  database engine                      P0 PROPOSED / ADR-0004 drafted
D-ARCH-003  API contract architecture            P0 PROPOSED
D-ARCH-004  authentication/session               P0 OPEN
D-ARCH-005  architecture style                   P1 PROPOSED / ADR-0001 drafted
D-ARCH-006  API deployment topology              P1 OPEN
D-ARCH-007  background jobs                      P1 OPEN
D-ARCH-009  hosting                              P1 OPEN
D-ARCH-011  package manager                      P1 ASSUMED
D-ARCH-012  Owner/Staff web framework            P0 PROPOSED
D-ARCH-013  member client strategy               P1 PROPOSED
D-ARCH-014  managed backend responsibilities     P0 OPEN
D-ARCH-015  authorization implementation         P0 PROPOSED
D-ARCH-016  primary language/runtime             P0 PROPOSED / ADR-0002 drafted
D-ARCH-017  data access/migrations               P1 PROPOSED
D-ARCH-018  testing toolchain                    P1 PROPOSED
D-ARCH-019  CI/CD + release/secrets tooling      P1 OPEN
D-SEC-001   jurisdiction/privacy                 P0 OPEN
D-SEC-002   member authentication                P0 OPEN
D-SEC-004   session lifecycle                    P1 OPEN
D-SEC-008   RLS/data-layer isolation             conditional P0 OPEN
D-PROVIDER-001 payment provider                  P1 OPEN
D-PROVIDER-002 messaging provider                P1 OPEN
D-PROVIDER-006 observability provider            P1 OPEN
D-DATA-007  Member vs Membership state ownership P1 PROPOSED
```

`D-ARCH-008` Redis/cache/broker remains P2 OPEN and is not a baseline dependency.

## Task 0012 Implementation Status

Task `0012-draft-canonical-database-engine-adr` completed documentation/governance work only.

Created:

```text
docs/adr/ADR-0004-database-engine.md
.ai/task/0012-draft-canonical-database-engine-adr.md
```

Updated:

```text
docs/adr/README.md
docs/README.md
.ai/current-state.md
```

Explicitly not created/selected:

```text
No final schema
No database/ directory
No migrations
No schema.sql / schema.prisma / ORM models
No database client
No Docker database configuration
No Supabase/managed-backend project
No RLS policies
No seed scripts
No application/API/worker code
No managed PostgreSQL provider
No ORM/query builder
No background-job technology
No Redis/cache/broker
No hosting provider
No CI workflow
No deployment configuration
No database infrastructure
```

## Last Completed Task

`0012-draft-canonical-database-engine-adr`

`ADR-0004` remains `Proposed`; `D-ARCH-002` remains `PROPOSED`.

## Current Task

None in progress.

## Next Task

The post-Task-0012 re-check of `docs/adr/README.md` and `docs/00-overview/assumptions.md` confirms the next bounded item in the current dependency queue is:

Task `0013-draft-data-access-migration-strategy-adr`.

Create only when explicitly started:

```text
docs/adr/ADR-0005-data-access-migration-strategy.md
```

Primary canonical decision:

```text
D-ARCH-017
```

Initial ADR status:

```text
Proposed
```

The task should compare credible data-access/query/migration strategies against the **Proposed** PostgreSQL direction while preserving:

- explicit transaction ownership,
- database constraints as correctness backstops,
- raw-SQL escape capability,
- committed/auditable migrations,
- production-like database integration tests,
- compatibility with a future `D-SEC-008` RLS decision.

It must not accept PostgreSQL, select a managed provider, finalize the canonical schema, resolve `D-DATA-007`, or create application/database scaffolding.

## Files To Read Next

```text
.ai/README.md
.ai/current-state.md
.ai/task/0012-draft-canonical-database-engine-adr.md
docs/README.md
docs/00-overview/assumptions.md
docs/01-product/functional-requirements.md
docs/01-product/non-functional-requirements.md
docs/02-architecture/architecture-principles.md
docs/02-architecture/architecture-overview.md
docs/02-architecture/component-architecture.md
docs/02-architecture/data-flow.md
docs/02-architecture/technology-stack.md
docs/adr/README.md
docs/adr/ADR-0001-modular-monolith.md
docs/adr/ADR-0002-primary-language-runtime.md
docs/adr/ADR-0003-monorepo-strategy.md
docs/adr/ADR-0004-database-engine.md
```
