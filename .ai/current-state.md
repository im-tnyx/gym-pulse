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
ADR-0001  D-ARCH-005  Phase 1 architecture style              Proposed
ADR-0002  D-ARCH-016  Primary language/runtime                Proposed
ADR-0003  D-ARCH-001  Repository/workspace strategy           Proposed
ADR-0004  D-ARCH-002  Canonical database engine               Proposed
ADR-0005  D-ARCH-017  Data access/query/transaction/migrations Proposed
```

No authorized approval evidence exists for these ADRs. None is `Accepted`.

Therefore:

```text
D-ARCH-005 remains PROPOSED
D-ARCH-016 remains PROPOSED
D-ARCH-001 remains PROPOSED
D-ARCH-002 remains PROPOSED
D-ARCH-017 remains PROPOSED
```

## Current Persistence Position

`ADR-0004` proposes PostgreSQL as the canonical transactional database engine. PostgreSQL is not accepted.

`ADR-0005` proposes, conditionally on compatible final runtime/database decisions, a Drizzle-oriented TypeScript persistence strategy with:

```text
application-owned explicit transaction boundaries
SQL-transparent typed query access
server-only persistence adapters
purpose-specific operational read/query services
generated + reviewed committed SQL migrations
custom/raw SQL as a first-class escape path
one canonical migration history for the shared canonical database
future RLS compatibility without RLS adoption
```

Drizzle is not installed or accepted. Kysely, Prisma, and SQL-first remain evaluated alternatives.

Migration governance in the proposal distinguishes:

```text
typed desired persistence schema declaration
  !=
committed migration history
  !=
actual database state
```

The committed migration history is the proposed governed deployment/change record. Direct schema push is not the proposed staging/production mechanism.

## D-DATA-007 State

`D-DATA-007` remains `P1 PROPOSED` and unresolved.

Persistence tooling can be evaluated, but final Member/Membership schema, lifecycle constraints, entitlement queries, indexes, and state-machine migrations must not be finalized until state ownership is resolved.

No change was made to `FR-MEMBER-004` or `FR-MEMBERSHIP-002`.

## Important Architecture Boundaries

- Clients are untrusted for canonical business truth.
- Protected operations require verified principal + tenant/resource scope + named capability.
- Application handlers own cross-domain orchestration and correctness-sensitive local transaction boundaries.
- Domain modules own business rules/state transitions; persistence types do not define domain semantics.
- Multi-domain source/package boundaries must not fragment one database transaction when a use case requires atomicity.
- Database constraints reinforce durable invariants but do not replace domain/application rules.
- Request idempotency, provider-event dedupe, job dedupe, and business-effect uniqueness remain distinct concerns.
- External provider calls do not participate in long local database transactions.
- Background execution reuses the same application/domain rules as interactive flows.
- Tenant scope must remain explicit in persistence operations.
- Operational read models may use purpose-specific joins/aggregates but are non-authoritative for writes.
- Raw SQL is acceptable inside the server-only persistence boundary when parameterized/reviewed and must not bypass authorization/domain ownership.
- Compile-time database/TypeScript types do not replace runtime validation at trust boundaries.
- Gym-local timezone controls business calendar logic; canonical event timestamps remain UTC.

## Technology Governance State

Key unresolved decisions now include:

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
D-ARCH-017  data access/migrations               P1 PROPOSED / ADR-0005 drafted
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

## Task 0013 Implementation Status

Task `0013-draft-data-access-migration-strategy-adr` completed documentation/governance work only.

Created:

```text
docs/adr/ADR-0005-data-access-migration-strategy.md
.ai/task/0013-draft-data-access-migration-strategy-adr.md
```

Updated:

```text
docs/adr/README.md
docs/README.md
.ai/current-state.md
```

Explicitly not created/selected:

```text
No ORM/query dependency installed
No Drizzle/Kysely/Prisma package installed
No database driver installed
No database/ or migrations/ scaffold
No schema.sql / schema.prisma / Drizzle schema
No migration files
No final database schema
No database client
No seed scripts
No Docker database setup
No RLS policies or database role model
No managed backend/provider
No database infrastructure
No application/API/worker code
No background-job technology
No hosting provider
No CI workflow
No deployment configuration
```

## Last Completed Task

`0013-draft-data-access-migration-strategy-adr`

`ADR-0005` remains `Proposed`; `D-ARCH-017` remains `PROPOSED`.

`ADR-0004` remains `Proposed`; `D-ARCH-002` remains `PROPOSED`.

## Current Task

None in progress.

## Next Task

Post-Task-0013 re-check of `docs/adr/README.md` and `docs/00-overview/assumptions.md` confirms the next bounded item in the current ADR dependency queue is:

Task `0014-draft-managed-backend-responsibilities-adr`.

Create only when explicitly started:

```text
docs/adr/ADR-0006-managed-backend-responsibilities.md
```

Primary canonical decision:

```text
D-ARCH-014
```

Initial ADR status should be:

```text
Proposed
```

The task should evaluate managed-backend/platform responsibilities by capability rather than bundle adoption. It must keep database-engine acceptance, authentication/session, member authentication, protected storage, RLS/data-layer isolation, background jobs/queues/cron, API deployment, hosting, and application/domain architecture as separately governed decisions.

Do not provision a managed backend or start implementation in Task 0014.

## Files To Read Next

```text
.ai/README.md
.ai/current-state.md
.ai/task/0013-draft-data-access-migration-strategy-adr.md
docs/README.md
docs/00-overview/assumptions.md
docs/01-product/functional-requirements.md
docs/01-product/non-functional-requirements.md
docs/02-architecture/architecture-principles.md
docs/02-architecture/architecture-overview.md
docs/02-architecture/container-architecture.md
docs/02-architecture/component-architecture.md
docs/02-architecture/data-flow.md
docs/02-architecture/technology-stack.md
docs/adr/README.md
docs/adr/ADR-0004-database-engine.md
docs/adr/ADR-0005-data-access-migration-strategy.md
```
