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

Completed Draft architecture documents:

```text
docs/02-architecture/architecture-principles.md
docs/02-architecture/architecture-overview.md
docs/02-architecture/system-context.md
docs/adr/README.md
```

`system-context.md` is the current C4 Level 1 context. It treats GymPulse as a black-box Phase 1 system and defines active human actors, external systems, trust relationships, authoritative-state boundaries, high-level information flows, failure/degradation expectations, tenant/time context, and open-decision dependencies.

## Important Confirmed Boundaries

- Phase 1 is gym operations/retention, not a generic fitness super-app.
- Core loop: attendance -> inactivity risk -> follow-up -> return/outcome -> renewal -> verified payment -> optional add-on -> measurable result.
- Active Phase 1 human actors are Member, Owner, Manager, and Front Desk Staff.
- Trainer/Coach application users and platform-level roles remain Future.
- Tenant isolation and server-side authorization are mandatory.
- Capability-based permissions are the product authorization model.
- Authentication proves identity/session state; GymPulse still owns business authorization.
- Payment initiation/client success is not canonical payment success.
- Critical effects must be idempotent and concurrency-safe.
- Sensitive operational/financial changes must remain auditable.
- Gym-local timezone controls business-day/week rules; canonical event timestamps use UTC.
- Canonical state is server-side; dashboards/read models and telemetry are derived/non-authoritative.
- External provider state must be verified/translated before mutating canonical state.
- Future workout, advanced nutrition, health, coaching, multi-branch product workflows, and AI scope must not leak into Phase 1.

## C4 Level 1 External Relationships

Current context-level external systems/supporting dependencies:

```text
Authentication / Identity Provider
Payment Provider
Messaging / Delivery Provider
Protected Object Storage (conditional)
Operational Telemetry / Analytics
Pilot Import Source
```

No provider product is selected by the System Context.

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
D-ARCH-010  object storage                          P1 OPEN
D-ARCH-012  Owner/Staff web framework               P0 PROPOSED
D-ARCH-013  member client/framework strategy        P1 PROPOSED
D-ARCH-014  managed backend platform                P0 OPEN
D-ARCH-015  authorization implementation boundary   P0 PROPOSED
D-SEC-001   launch jurisdiction/privacy obligations P0 OPEN
D-SEC-002   member authentication                   P0 OPEN
D-SEC-008   RLS/data-layer tenant isolation         conditional P0 OPEN
D-PROVIDER-001 payment provider                     P1 OPEN
D-PROVIDER-002 messaging provider                   P1 OPEN
D-PROVIDER-006 observability provider               P1 OPEN
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

`0003-system-context.md`

Created:

`docs/02-architecture/system-context.md`

## Current Task

None in progress.

## Next Task

Task `0004-container-architecture`.

Create only:

`docs/02-architecture/container-architecture.md`

The document should provide C4 Level 2 decomposition while keeping unresolved runtime/provider choices explicit. It should distinguish logical/deployable responsibilities such as member-facing client, owner/staff client, trusted application/API boundary, durable background execution, canonical persistence, and provider adapters without silently selecting a framework, database engine, hosting platform, managed backend, or job technology.

It must explicitly preserve the open API deployment question under `D-ARCH-006` rather than assuming the API is embedded in or separate from the web runtime.

Do not proceed automatically to component architecture in the same bounded task.

## Files To Read Next

```text
docs/README.md
docs/00-overview/project-overview.md
docs/00-overview/scope.md
docs/00-overview/assumptions.md
docs/01-product/user-roles.md
docs/01-product/user-journeys.md
docs/01-product/functional-requirements.md
docs/01-product/non-functional-requirements.md
docs/02-architecture/architecture-principles.md
docs/02-architecture/architecture-overview.md
docs/02-architecture/system-context.md
docs/adr/README.md

legacy migration inputs only as needed:
docs/05-system-architecture.md
docs/06-database-schema.md
docs/07-api-contracts.md
docs/08-automations.md
docs/09-payments-billing.md
docs/10-notifications-whatsapp.md
docs/12-security-audit.md
docs/15-engineering-workflow.md
```
