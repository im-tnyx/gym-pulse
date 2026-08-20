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
docs/02-architecture/container-architecture.md
docs/adr/README.md
```

`container-architecture.md` is the current C4 Level 2 view. It defines the Member Client, Owner/Staff Application, Trusted Application/API, Background Execution, Canonical Persistence, conditional Protected Object Storage, external provider boundaries, API deployment alternatives, transaction/idempotency boundaries, authorization enforcement points, failure behavior, observability, and testing seams without selecting unresolved technologies.

## Important Confirmed Boundaries

- Phase 1 is gym operations/retention, not a generic fitness super-app.
- Core loop: attendance -> inactivity risk -> follow-up -> return/outcome -> renewal -> verified payment -> optional add-on -> measurable result.
- Active Phase 1 human actors are Member, Owner, Manager, and Front Desk Staff.
- Trainer/Coach application users and platform-level roles remain Future.
- Tenant isolation and server-side authorization are mandatory.
- Capability-based permissions are the product authorization model.
- Authentication proves identity/session state; GymPulse still owns business authorization.
- Member/Staff clients are untrusted for canonical business truth.
- Trusted Application/API owns interactive authorization, application orchestration, domain execution, transaction ownership, canonical mutation, and safe provider interaction.
- Background execution reuses the same domain/application rules and must remain scoped, retry-safe, and observable.
- Payment initiation/client success is not canonical payment success.
- Critical effects must be idempotent and concurrency-safe.
- Sensitive operational/financial changes must remain auditable.
- Gym-local timezone controls business-day/week rules; canonical event timestamps use UTC.
- Canonical state is server-side; dashboards/read models and telemetry are derived/non-authoritative.
- External provider state must be verified/translated before mutating canonical state.
- Canonical persistence is the protected system-of-record boundary; exact database engine remains unresolved/proposed.
- Future workout, advanced nutrition, health, coaching, multi-branch product workflows, and AI scope must not leak into Phase 1.

## Current C4 Model

### C4 Level 1 external relationships

```text
Authentication / Identity Provider
Payment Provider
Messaging / Delivery Provider
Protected Object Storage (conditional)
Operational Telemetry / Analytics
Pilot Import Source
```

### C4 Level 2 GymPulse container responsibilities

```text
Member Client Application
Owner / Staff Application
Trusted Application / API Runtime
Background Execution Runtime
Canonical Persistence
Protected Object Storage (conditional)
```

No provider product or runtime technology is selected by the C4 documents.

## API Deployment Boundary

`D-ARCH-006` remains `OPEN`.

Both high-level mappings remain valid candidates:

```text
A. Owner/Staff web server runtime co-hosts trusted application/API responsibilities
B. Owner/Staff web UI and trusted API are independently deployed
```

The final mapping must preserve domain separation, server-only secrets, authorization, testable contracts, background execution independence, and future extractability.

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
D-ARCH-008  Redis/cache/broker requirement          P2 OPEN
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

`0004-container-architecture.md`

Created:

`docs/02-architecture/container-architecture.md`

## Current Task

None in progress.

## Next Task

Task `0005-component-architecture`.

Create only:

`docs/02-architecture/component-architecture.md`

The document should provide a C4 Level 3-style decomposition of the Trusted Application/API and Background Execution responsibilities into implementation-oriented source-code/application components.

Required areas include:

```text
transport/application-entry adapters
authentication/principal resolver
tenant/resource-context resolver
capability authorization
request validation/contracts
application use cases
Phase 1 domain modules
transaction/unit-of-work boundary
repositories/data-access ports
payment adapter and webhook normalization
notification policy/intent and provider adapter
audit/event components
idempotency/deduplication
background scheduler/handlers
operational read/query components
observability hooks and test seams
```

The component architecture must:

- preserve `D-ARCH-005` as Proposed rather than assume microservices,
- preserve `D-ARCH-006` deployment neutrality,
- show explicit dependency direction,
- identify domain ownership and cross-domain write restrictions,
- define transaction ownership,
- distinguish sync vs async component interaction,
- show idempotency and authorization enforcement points,
- keep provider adapters at integration boundaries,
- define failure propagation and test seams,
- keep `D-DATA-007` visible until state ownership is resolved.

Do not proceed automatically to data-flow or technology-stack documentation in the same bounded task.

## Files To Read Next

```text
docs/README.md
docs/00-overview/project-overview.md
docs/00-overview/scope.md
docs/00-overview/assumptions.md
docs/01-product/functional-requirements.md
docs/01-product/non-functional-requirements.md
docs/02-architecture/architecture-principles.md
docs/02-architecture/architecture-overview.md
docs/02-architecture/system-context.md
docs/02-architecture/container-architecture.md
docs/adr/README.md

legacy migration inputs only as needed:
docs/05-system-architecture.md
docs/06-database-schema.md
docs/07-api-contracts.md
docs/08-automations.md
docs/09-payments-billing.md
docs/10-notifications-whatsapp.md
docs/12-security-audit.md
docs/13-testing-qa.md
docs/15-engineering-workflow.md
```
