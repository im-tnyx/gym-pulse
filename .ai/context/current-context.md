# GymPulse Current Context

## Current phase

`Phase 4: Design System Architecture`

Product foundation and structured product documentation are complete at Draft v1.x level. Architecture documentation is being created deliberately, one bounded artifact or governance correction at a time.

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

## Governance normalization completed

Repository documentation audit identified that structured architecture drafts still referenced legacy numeric decision IDs such as `D-060` while the canonical structured decision register uses scoped IDs such as `D-ARCH-006`.

Canonical decision source:

`docs/00-overview/assumptions.md`

Completed corrections:

- canonical decision-ID policy exists,
- legacy-to-canonical decision crosswalk exists,
- all four current structured architecture drafts now use canonical scoped decision IDs,
- related architecture links point to the canonical assumptions register,
- no provider/runtime selection was introduced by the normalization task.

Legacy `docs/16-open-decisions.md` remains a migration source and may retain its historical numeric IDs until deprecated safely.

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

## Canonical high-impact decision references

Use these IDs going forward:

```text
D-ARCH-001      Monorepo
D-ARCH-002      PostgreSQL
D-ARCH-004      Authentication/session strategy
D-ARCH-006      API deployment topology
D-ARCH-007      Job runner
D-ARCH-008      Redis requirement
D-ARCH-009      Hosting
D-ARCH-010      Object storage
D-ARCH-011      Owner/Staff web framework
D-ARCH-012      Member mobile framework
D-ARCH-013      Managed backend
D-PROVIDER-001  Payment provider
D-PROVIDER-002  Messaging provider
D-PROVIDER-005  Product analytics provider
D-PROVIDER-006  Observability provider
D-SEC-002       Member authentication
D-SEC-008       RLS strategy
D-DATA-007      Membership renewal representation
```

## Immediate next action

Resume:

`TASK-DOC-ARCH-005 - Create C4 Component Architecture`

Target:

`docs/02-architecture/component-architecture.md`

The component architecture must decompose the trusted Application/API and Worker logical containers into source-code/application components without turning each domain into a deployable service.

Required concerns include:

- HTTP/transport adapters,
- authentication/principal resolution,
- tenant-context resolution,
- capability authorization,
- validation/contracts,
- application use cases,
- Phase 1 domain modules,
- transaction/unit-of-work boundaries,
- repositories/data-access ports,
- provider adapters,
- audit/events,
- idempotency/deduplication,
- worker scheduler/handlers,
- operational read/query components.

## Stop condition

After `component-architecture.md` is complete:

- update `.ai/context/documentation-state.md`,
- update `.ai/task/current.md`,
- append `.ai/task/completed.md`,
- update `.ai/memory/session-handoff.md`,
- set exact next task to `data-flow.md`,
- do not begin `data-flow.md` in the same bounded task unless explicitly requested.
