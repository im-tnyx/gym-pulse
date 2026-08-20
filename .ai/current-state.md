# GymPulse Current State

## Project

`GymPulse` (`im-tnyx/gym-pulse`)

## Current Documentation Phase

`Phase 4 - System Architecture`

## Canonical Documentation Completed

```text
docs/00-overview/   foundation complete at Draft v1.x
docs/01-product/    product definition complete at Draft v1.x
```

## Current Architecture Phase

Completed Draft foundation:

```text
docs/02-architecture/architecture-principles.md
docs/02-architecture/architecture-overview.md
docs/adr/README.md
```

The architecture overview is technology-neutral and defines logical boundaries, trust boundaries, domain ownership, sync/async responsibilities, consistency, failure isolation, deployment neutrality, and architecture invariants.

## Important Confirmed Boundaries

- Phase 1 is gym operations/retention, not a generic fitness super-app.
- Core loop: attendance -> inactivity risk -> follow-up -> return/outcome -> renewal -> verified payment -> optional add-on -> measurable result.
- Tenant isolation and server-side authorization are mandatory.
- Capability-based permissions are the product authorization model.
- Payment initiation/client success is not canonical payment success.
- Critical effects must be idempotent and concurrency-safe.
- Sensitive operational/financial changes must remain auditable.
- Gym-local timezone controls business-day/week rules; canonical event timestamps use UTC.
- Canonical state is server-side; dashboards/read models are derived.
- External provider state must be verified/translated before mutating canonical state.
- Future workout, advanced nutrition, health, coaching, multi-branch product workflows, and AI scope must not leak into Phase 1.

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

Legacy architecture/database/API/automation/payment/notification/security/testing/engineering/open-decision files remain migration inputs. None are deleted or Deprecated.

Important contradiction remains:

`docs/05-system-architecture.md` uses older `Accepted recommendations` wording for technologies that remain Proposed/Open in the canonical decision register.

## Last Completed Task

`0002-architecture-overview.md`

Created:

`docs/02-architecture/architecture-overview.md`

## Current Task

None in progress.

## Next Task

Task `0003-system-context`.

Create only:

`docs/02-architecture/system-context.md`

The document should provide C4 Level 1 context for GymPulse, human actors, external systems, major responsibilities, trust relationships, and high-level information flows. It must remain technology/provider neutral.

Do not proceed automatically to container architecture in the same bounded task.

## Files To Read Next

```text
docs/README.md
docs/00-overview/project-overview.md
docs/00-overview/scope.md
docs/00-overview/assumptions.md
docs/01-product/personas.md
docs/01-product/user-roles.md
docs/01-product/user-journeys.md
docs/01-product/functional-requirements.md
docs/01-product/non-functional-requirements.md
docs/02-architecture/architecture-principles.md
docs/02-architecture/architecture-overview.md
docs/adr/README.md

legacy migration inputs only as needed:
docs/05-system-architecture.md
docs/07-api-contracts.md
docs/08-automations.md
docs/09-payments-billing.md
docs/10-notifications-whatsapp.md
docs/12-security-audit.md
```
