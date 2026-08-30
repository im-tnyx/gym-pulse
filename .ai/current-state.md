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
```

No authorized approval evidence exists for these ADRs. Therefore:

```text
D-ARCH-005 remains PROPOSED
D-ARCH-016 remains PROPOSED
D-ARCH-001 remains PROPOSED
```

## Repository / Workspace Position

`ADR-0003` proposes one explicit GymPulse monorepo with deliberate application/package boundaries and independently buildable/deployable artifacts.

Required invariants:

```text
Repository topology != Deployment topology
Domain != Package
Package != Application
Application != Service
Service != Repository
Repository != Deployment
```

Default dependency direction:

```text
UI / Transport
    -> Application
    -> Domain

Infrastructure adapters implement inward-facing ports.
```

Every package/export surface must be classifiable as:

```text
Client-safe
Server-only
Build/tooling-only
Documentation-only
```

Client applications must never reach server-only database/migration/provider-secret/service-role/admin/configuration code through the repository dependency graph.

The ADR does not require one package per logical domain and explicitly rejects generic catch-all `shared/common/utils` ownership.

## Important Architecture Boundaries

- Phase 1 is gym operations/retention, not a generic fitness super-app.
- Clients are untrusted for canonical business truth.
- Authentication and GymPulse authorization are separate responsibilities.
- Protected operations require principal + tenant/resource scope + named capability.
- Application handlers own cross-domain orchestration; domain modules own canonical state transitions.
- Arbitrary cross-domain direct writes are not an approved pattern.
- Background execution reuses the same application/domain rules as interactive flows.
- Payment provider evidence must be verified before canonical payment mutation.
- Membership/add-on payment effects are protected exactly once.
- External provider calls do not participate in local database transactions.
- Gym-local timezone controls business calendar logic; event timestamps remain UTC.
- Read models, telemetry, analytics, and data-quality views are non-authoritative for writes.
- Static types do not replace runtime validation, authorization, transactions, idempotency, or database constraints.
- `D-DATA-007` remains unresolved and blocks final Member/Membership state-machine/schema semantics.

## Technology Governance State

Key unresolved decisions include:

```text
D-ARCH-001  repository strategy                  P0 PROPOSED / ADR-0003 drafted
D-ARCH-002  database engine                      P0 PROPOSED
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

## Task 0011 Implementation Status

Task `0011-draft-repository-workspace-adr` completed documentation/governance work only.

Created:

```text
docs/adr/ADR-0003-monorepo-strategy.md
.ai/task/0011-draft-repository-workspace-adr.md
```

Updated:

```text
docs/adr/README.md
docs/README.md
.ai/current-state.md
```

Explicitly not created/selected:

```text
No apps/ scaffold
No packages/ scaffold
No package.json/workspace manifest
No package manager accepted
No Turborepo/Nx/task orchestrator accepted
No deployment topology selected
No database selected
No ORM/query builder selected
No CI provider selected
No application code
No migrations
No API routes
No deployment configuration
```

## Last Completed Task

`0011-draft-repository-workspace-adr`

`ADR-0003` remains `Proposed`; `D-ARCH-001` remains `PROPOSED`.

## Current Task

None in progress.

## Next Task

The current ADR dependency queue places the canonical database engine after the three drafted foundation decisions.

Task `0012-draft-canonical-database-engine-adr`.

Create only when that task is explicitly started:

```text
docs/adr/ADR-0004-database-engine.md
```

Primary canonical decision:

```text
D-ARCH-002
```

Initial ADR status:

```text
Proposed
```

The database ADR must compare the current PostgreSQL recommendation with credible alternatives against GymPulse transaction, relational-integrity, idempotency, tenant-scoping, migration, backup/restore, testing, and operations requirements.

It must keep these decisions separate:

```text
D-ARCH-014 managed backend/provider responsibilities
D-SEC-008  RLS/data-layer isolation policy
D-ARCH-017 data-access/query/migration tooling
D-ARCH-009 hosting/deployment platform
```

Do not draft data-access tooling or implementation scaffolding in the same bounded task.

## Files To Read Next

```text
.ai/README.md
.ai/current-state.md
.ai/task/0011-draft-repository-workspace-adr.md
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
```
