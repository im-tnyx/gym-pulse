# GymPulse Current Context

## Current phase

`Phase 4: Design System Architecture`

Product foundation and structured product documentation are complete at Draft v1.x level. Architecture documentation is being created deliberately, one bounded artifact at a time.

## Current branch

`docs/phase-2-architecture`

## Completed structured documentation

### `docs/00-overview/`

- `project-overview.md`
- `vision.md`
- `goals.md`
- `scope.md`
- `glossary.md`
- `assumptions.md`

### `docs/01-product/`

- `product-requirements.md`
- `personas.md`
- `user-roles.md`
- `user-journeys.md`
- `feature-catalog.md`
- `functional-requirements.md`
- `non-functional-requirements.md`
- `success-metrics.md`

## Architecture files completed on current branch

- `docs/02-architecture/architecture-principles.md`
- `docs/02-architecture/architecture-overview.md`
- `docs/02-architecture/system-context.md`
- `docs/02-architecture/container-architecture.md`
- `docs/02-architecture/component-architecture.md`
- `docs/02-architecture/data-flow.md`

## Architecture governance

Canonical decision source:

`docs/00-overview/assumptions.md`

Structured architecture uses canonical scoped decision IDs. Legacy `docs/16-open-decisions.md` remains migration input only.

No provider/runtime selection has been silently finalized.

## Component architecture established

`component-architecture.md` defines:

- transport adapters,
- request/correlation context,
- Principal Resolver,
- Tenant Context Resolver,
- Capability Authorization,
- contract validation/DTO mapping,
- application use-case orchestration,
- Phase 1 domain ownership,
- Unit of Work,
- repository/data ports,
- layered idempotency,
- provider adapters,
- audit/events/durable continuation,
- worker handlers,
- operational read models.

Components are source-code/application boundaries, not automatic microservices.

## Data-flow architecture established

`data-flow.md` now traces these Phase 1 flows end to end:

```text
authentication -> principal -> tenant authorization
member QR check-in
assisted staff check-in
scheduled no-show scan -> retention case
follow-up -> return attendance -> case resolution
renewal window -> reminder intent
renewal order -> payment checkout initiation
verified payment event -> exactly-once membership/add-on effect
notification intent -> current-policy check -> provider delivery state
controlled import -> staging/reconciliation -> canonical write
owner dashboard/action-queue read model
data-quality scan -> issue lifecycle
```

For these flows the document makes explicit:

- canonical vs derived/external data,
- trust-boundary crossings,
- authorization checkpoints,
- transaction boundaries,
- synchronous vs asynchronous handoffs,
- durable continuation points,
- request/domain/provider/business-effect idempotency,
- failure/retry/reconciliation paths,
- audit and observability points,
- gym-local business-time behavior.

## Architecture direction still Proposed/Open

```text
Monorepo
TypeScript
Modular Monolith
Owner/Staff Web + Member Mobile
Trusted Application/API boundary
Separate logical Worker/Job boundary
PostgreSQL canonical store
Provider adapters
Explicit multi-tenancy
Capability-based authorization
Idempotent critical workflows
```

High-impact choices still requiring decisions/ADRs include:

```text
D-ARCH-001      Monorepo
D-ARCH-002      PostgreSQL
D-ARCH-003      JSON HTTP API
D-ARCH-004      Authentication/session strategy
D-ARCH-006      API deployment topology
D-ARCH-007      Job runner
D-ARCH-008      Redis requirement
D-ARCH-009      Hosting
D-ARCH-010      Object storage
D-ARCH-011      Owner/Staff web framework
D-ARCH-012      Member mobile framework
D-ARCH-013      Managed backend
D-ARCH-014      Package manager
D-PROVIDER-001  Payment provider
D-PROVIDER-002  Messaging provider
D-PROVIDER-005  Product analytics
D-PROVIDER-006  Observability
D-SEC-002       Member authentication
D-SEC-008       RLS strategy
D-DATA-007      Membership renewal representation
```

## Immediate next action

`TASK-DOC-ARCH-007 - Create Technology Stack Evaluation`

Target:

`docs/02-architecture/technology-stack.md`

The next document must evaluate the technology choices required to implement the existing architecture without treating recommendations as accepted decisions.

It should cover at least:

- primary language/runtime,
- monorepo/package manager,
- Owner/Staff web framework,
- member mobile framework,
- Application/API deployment options,
- PostgreSQL and data-access approach,
- managed backend option,
- authentication/session requirements,
- job runner/scheduler,
- payments,
- messaging,
- object storage,
- observability,
- product analytics,
- Redis/cache decision posture,
- local development/testing implications,
- security/operations implications,
- alternatives and tradeoffs,
- canonical decision IDs and planned ADR ownership.

## Stop condition

After `technology-stack.md` is complete:

- update `.ai/context/documentation-state.md`,
- update `.ai/task/current.md`,
- append `.ai/task/completed.md`,
- update `.ai/memory/session-handoff.md`,
- move to ADR framework creation,
- do not silently mark Proposed/Open technologies Accepted.