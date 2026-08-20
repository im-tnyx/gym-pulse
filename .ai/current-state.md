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
docs/02-architecture/component-architecture.md
docs/02-architecture/data-flow.md
docs/adr/README.md
```

`data-flow.md` is the current end-to-end architecture view. It traces the critical Phase 1 flows across human actors, client/container/component boundaries, canonical persistence, external providers, transaction boundaries, idempotency/deduplication, retries/reconciliation, audit, observability, gym-local time, and durable async continuation.

## Important Confirmed Boundaries

- Phase 1 is gym operations/retention, not a generic fitness super-app.
- Core loop: attendance -> inactivity risk -> follow-up -> return/outcome -> renewal -> verified payment -> optional add-on -> measurable result.
- Active Phase 1 human actors are Member, Owner, Manager, and Front Desk Staff.
- Trainer/Coach application users and platform-level roles remain Future.
- Tenant isolation and server-side authorization are mandatory.
- Capability-based permissions are the product authorization model.
- Authentication proves identity/session state; GymPulse still owns business authorization.
- Clients are untrusted for canonical business truth.
- Authentication verification, principal resolution, tenant/resource resolution, capability authorization, contract validation, and domain rules are separate component responsibilities.
- Application command handlers own cross-domain orchestration and correctness-sensitive transaction boundaries.
- Domain modules own their canonical state; arbitrary cross-domain direct writes are not allowed.
- Background execution reuses application/domain rules and must remain scoped, retry-safe, and observable.
- Request idempotency, job dedupe, provider-event dedupe, and business-effect uniqueness are separate protections.
- Payment provider adapters verify/normalize evidence but cannot directly grant entitlement.
- Notification policy/intent is separate from messaging-provider delivery.
- Payment checkout/client success is not canonical payment success.
- Verified payment effect applies membership/add-on value exactly once through the owning domain.
- Sensitive operational/financial changes must remain auditable.
- Gym-local timezone controls business-day/week rules; canonical event timestamps use UTC.
- Canonical state is server-side; read models and telemetry are non-authoritative for writes.
- External provider state must be verified/translated before mutating canonical state.
- External calls do not participate in local atomic transactions; retries/reconciliation handle cross-system uncertainty.
- Read models and data-quality components may inspect several domains but do not become alternate write owners.
- Canonical persistence is the protected system-of-record boundary; exact database engine remains unresolved/proposed.
- Future workout, advanced nutrition, health, coaching, multi-branch product workflows, and AI scope must not leak into Phase 1.

## Current Architecture Model

### C4 Level 1

GymPulse system boundary with Member, Owner, Manager, Front Desk and external Authentication, Payment, Messaging, Storage, Telemetry, and Pilot Import relationships.

### C4 Level 2

```text
Member Client Application
Owner / Staff Application
Trusted Application / API Runtime
Background Execution Runtime
Canonical Persistence
Protected Object Storage (conditional)
```

### C4 Level 3-style internal components

```text
Transport / Callback Entry
Request / System Execution Context
Authentication Verification Adapter
GymPulse Principal Resolver
Tenant / Resource Context Resolver
Capability Authorizer
Contract Validator
Application Command Handlers
Application Query Handlers
Phase 1 Domain Modules
Transaction / Unit of Work
Idempotency / Deduplication
Repository / Data Access Ports
Operational Read Components
Payment / Messaging / Storage Ports and Adapters
Audit Recorder
Domain/Application Events + Durable Continuation Port
Business Clock / Gym-Time Service
Scheduler / Job Entry / Retry Coordinator / Background Handlers
Observability Hooks
```

### End-to-end data flows

```text
Authentication + tenant/resource authorization
QR check-in
Assisted attendance
No-show scan
Follow-up + member return resolution
Renewal-stage reminder
Renewal order + checkout initialization
Verified payment webhook + exactly-once entitlement effect
Notification dispatch + delivery callback
Pilot member import
Owner dashboard / read-model query
Data-quality scan + resolution
```

No provider product, framework, database engine, job technology, cache/broker, or deployment topology is selected by the architecture documents.

## API Deployment Boundary

`D-ARCH-006` remains `OPEN`.

Both high-level mappings remain valid candidates:

```text
A. Owner/Staff web server runtime co-hosts trusted application/API responsibilities
B. Owner/Staff web UI and trusted API are independently deployed
```

The same component ownership, security, domain rules, contracts, transaction/idempotency semantics, and background-execution behavior must survive either mapping.

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
D-ARCH-011  package manager                         P1 ASSUMED
D-ARCH-012  Owner/Staff web framework               P0 PROPOSED
D-ARCH-013  member client/framework strategy        P1 PROPOSED
D-ARCH-014  managed backend platform                P0 OPEN
D-ARCH-015  authorization implementation boundary   P0 PROPOSED
D-SEC-001   launch jurisdiction/privacy obligations P0 OPEN
D-SEC-002   member authentication                   P0 OPEN
D-SEC-008   RLS/data-layer tenant isolation         conditional P0 OPEN
D-PROVIDER-001 payment provider                     P1 OPEN
D-PROVIDER-002 messaging provider                   P1 OPEN
D-PROVIDER-005 product analytics provider           P2 OPEN
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

`0006-data-flow.md`

Created:

`docs/02-architecture/data-flow.md`

## Current Task

None in progress.

## Next Task

Task `0007-technology-stack`.

Create only:

`docs/02-architecture/technology-stack.md`

The document should evaluate candidate technologies against the established requirements and architecture rather than merely listing tools.

Required evaluation areas include:

```text
language/runtime
repository/workspace strategy
package manager
Owner/Staff web framework
Member delivery/framework strategy
API contract architecture and deployment topology
canonical database engine
data-access/migration approach
managed backend responsibilities
authentication/session
member authentication
capability authorization implementation boundary
data-layer tenant isolation/RLS
background jobs/scheduler
Redis/cache/broker need
payment integration/provider boundary
messaging/provider boundary
protected object storage
observability and product analytics
testing stack
hosting/deployment
CI/CD and secrets posture
```

Each technology recommendation must state:

- canonical decision ID,
- current decision status,
- requirement/architecture drivers,
- recommended direction,
- alternatives,
- tradeoffs,
- security/reliability/operations impact,
- validation/spike needs,
- ADR requirement.

Do not mark any Open/Proposed/Assumed technology decision Accepted/Decided in the technology-stack document.

## Files To Read Next

```text
docs/README.md
docs/00-overview/assumptions.md
docs/01-product/functional-requirements.md
docs/01-product/non-functional-requirements.md
docs/02-architecture/architecture-principles.md
docs/02-architecture/architecture-overview.md
docs/02-architecture/system-context.md
docs/02-architecture/container-architecture.md
docs/02-architecture/component-architecture.md
docs/02-architecture/data-flow.md
docs/adr/README.md

legacy migration inputs only as evidence/candidate history:
docs/05-system-architecture.md
docs/06-database-schema.md
docs/07-api-contracts.md
docs/08-automations.md
docs/09-payments-billing.md
docs/10-notifications-whatsapp.md
docs/12-security-audit.md
docs/13-testing-qa.md
docs/15-engineering-workflow.md
docs/16-open-decisions.md
```
