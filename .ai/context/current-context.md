# GymPulse Current Context

## Current phase

`Phase 4: Design System Architecture`

Product foundation and structured product documentation are complete at Draft v1.x level. Architecture documentation is now being created deliberately, file-by-file.

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

## Architecture work remaining

Create in this order:

1. `docs/02-architecture/container-architecture.md`
2. `docs/02-architecture/component-architecture.md`
3. `docs/02-architecture/data-flow.md`
4. `docs/02-architecture/technology-stack.md`
5. `docs/adr/README.md`
6. initial ADRs for major architecture choices

## Current architecture direction

Proposed, not fully accepted yet:

```text
Monorepo
TypeScript
Modular Monolith
Web + Mobile + Application/API entry points
PostgreSQL canonical store
Durable job runner
Provider adapters
Explicit multi-tenancy
Capability-based authorization
Idempotent critical workflows
```

## Do not finalize yet

The following remain open and require ADR/decision work:

- exact monorepo tooling final acceptance
- exact database/managed platform final acceptance
- auth provider
- member auth method
- API deployment topology
- background job runner
- payment provider
- messaging provider
- hosting
- observability stack
- Redis requirement
- RLS strategy

## Immediate next action

Create `docs/02-architecture/container-architecture.md` as C4 Level 2.

It should define logical/deployable containers without prematurely forcing separate services. It must clearly distinguish:

- Owner/Staff Web
- Member Mobile
- Application/API runtime
- Worker/Job runtime
- PostgreSQL
- Object Storage
- external auth/payment/messaging/observability systems

It must describe Option A vs Option B for API deployment because `D-060` is still open.

## Stop condition

After `container-architecture.md` is complete:

- update `.ai/context/documentation-state.md`
- update `.ai/task/current.md`
- update `.ai/memory/session-handoff.md`
- continue to `component-architecture.md` only in the next bounded task unless explicitly requested otherwise
