# GymPulse Current State

## Project

`GymPulse` (`im-tnyx/gym-pulse`)

## Current Documentation Phase

`Architecture Foundation Gate`

## Canonical Documentation Completed

```text
docs/00-overview/   foundation complete at Draft v1.x
docs/01-product/    product definition complete at Draft v1.x
```

## Current Architecture Phase

Foundation created:

```text
docs/02-architecture/architecture-principles.md
docs/adr/README.md
```

No later architecture document has been created on `main` in this gate.

## Important Confirmed Boundaries

- Phase 1 is gym operations/retention, not a generic fitness super-app.
- Core loop: attendance -> inactivity risk -> follow-up -> return/outcome -> renewal -> verified payment -> optional add-on -> measurable result.
- Tenant isolation and server-side authorization are mandatory.
- Capability-based permissions are the product authorization model.
- Payment initiation is not payment success.
- Critical effects must be idempotent.
- Sensitive operational/financial changes must remain auditable.
- Gym-local timezone controls business-day/week rules; canonical event timestamps use UTC.
- Future workout, advanced nutrition, health, coaching, multi-branch SaaS, and AI scope must not leak into Phase 1.

## Important Open P0/P1 Decisions

Read `docs/00-overview/assumptions.md` for canonical status.

High-impact examples:

```text
D-ARCH-001  repository/monorepo strategy            P0 PROPOSED
D-ARCH-002  database engine                         P0 PROPOSED
D-ARCH-003  API contract architecture               P0 PROPOSED
D-ARCH-004  authentication/session                  P0 OPEN
D-ARCH-005  modular-monolith architecture style     P1 PROPOSED
D-ARCH-006  API deployment boundary                 P1 OPEN
D-ARCH-007  background jobs                         P1 OPEN
D-ARCH-009  hosting                                 P1 OPEN
D-ARCH-012  Owner/Staff web framework               P0 PROPOSED
D-ARCH-014  managed backend platform                P0 OPEN
D-ARCH-015  authorization implementation boundary   P0 PROPOSED
D-SEC-001   launch jurisdiction/privacy obligations P0 OPEN
D-SEC-002   member authentication                   P0 OPEN
D-SEC-008   RLS/data-layer tenant isolation         conditional P0 OPEN
D-DATA-007  Member vs Membership state ownership    P1 PROPOSED
```

## Active ADRs

No decision ADR has been created or accepted.

ADR governance exists at:

`docs/adr/README.md`

## Legacy Migration State

Legacy architecture/database/API/automation/payment/notification/security/testing/engineering/open-decision files remain migration inputs. None were deleted or marked Deprecated in this gate.

Important contradiction found:

`docs/05-system-architecture.md` uses older `Accepted recommendations` wording for technologies that remain Proposed/Open in the canonical decision register.

## Current Task

`0001-architecture-foundation.md` complete.

## Next Task

Create only:

`docs/02-architecture/architecture-overview.md`

Do not proceed automatically beyond that file.

## Files To Read Next

```text
docs/README.md
docs/00-overview/project-overview.md
docs/00-overview/scope.md
docs/00-overview/assumptions.md
docs/01-product/functional-requirements.md
docs/01-product/non-functional-requirements.md
docs/01-product/user-roles.md
docs/01-product/user-journeys.md
docs/02-architecture/architecture-principles.md
docs/adr/README.md

legacy migration inputs as needed:
docs/05-system-architecture.md
docs/06-database-schema.md
docs/08-automations.md
docs/12-security-audit.md
```
