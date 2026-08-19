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

## Architecture work remaining

Create in this order:

1. `docs/02-architecture/component-architecture.md`
2. `docs/02-architecture/data-flow.md`
3. `docs/02-architecture/technology-stack.md`
4. `docs/adr/README.md`
5. initial ADRs for major architecture choices

## Current architecture direction

Proposed, not fully accepted yet:

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

## C4 Level 2 decisions established

`container-architecture.md` now defines the logical containers and boundaries.

Important points:

- clients do not own canonical business truth,
- Application/API owns trusted interactive orchestration,
- Worker owns durable scheduled/retryable work,
- PostgreSQL is the proposed canonical system of record,
- external Auth/Payment/Messaging providers remain adapters with limited authority,
- product analytics is never canonical financial/attendance truth,
- object storage is private/tenant-scoped when used,
- `D-060` remains Open with Option A and Option B documented.

## Do not finalize yet

The following remain open and require ADR/decision work:

- exact monorepo tooling final acceptance,
- exact database/managed platform final acceptance,
- auth provider,
- member auth method,
- API deployment topology,
- background job runner,
- payment provider,
- messaging provider,
- hosting,
- observability stack,
- Redis requirement,
- RLS strategy.

## Immediate next action

Create `docs/02-architecture/component-architecture.md` as C4 Level 3-style internal architecture.

It must decompose the trusted Application/API and Worker logical containers into source-code components such as:

- transport adapters,
- authentication/principal resolution,
- tenant-context resolution,
- capability authorization,
- validation/contracts,
- application use cases,
- domain modules,
- transaction/unit-of-work handling,
- repositories/ports,
- provider adapters,
- audit/events,
- idempotency,
- worker schedulers/handlers,
- operational read models.

Do not turn every domain component into a deployable service.

## Stop condition

After `component-architecture.md` is complete:

- update `.ai/context/documentation-state.md`,
- update `.ai/task/current.md`,
- append `.ai/task/completed.md`,
- update `.ai/memory/session-handoff.md`,
- set exact next task to `data-flow.md`,
- do not begin `data-flow.md` in the same bounded task unless explicitly requested.
