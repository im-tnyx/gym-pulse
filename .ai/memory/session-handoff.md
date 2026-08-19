# GymPulse Session Handoff

## Last completed task

`TASK-DOC-GOV-002 - Normalize Architecture Decision References`

Branch:

`docs/phase-2-architecture`

## Files changed in the last bounded task

Canonical architecture:

- `docs/02-architecture/architecture-principles.md`
- `docs/02-architecture/architecture-overview.md`
- `docs/02-architecture/system-context.md`
- `docs/02-architecture/container-architecture.md`

AI continuity:

- `.ai/context/current-context.md`
- `.ai/context/documentation-state.md`
- `.ai/task/current.md`
- `.ai/task/completed.md`
- `.ai/memory/session-handoff.md`

## What changed

All current structured architecture drafts now use canonical scoped decision IDs from:

`docs/00-overview/assumptions.md`

Examples:

```text
D-060 -> D-ARCH-006
D-058 -> D-ARCH-002
D-049 -> D-ARCH-004
D-050 -> D-SEC-002
D-030 -> D-PROVIDER-001
D-038 -> D-PROVIDER-002
D-068 -> D-SEC-008
D-069 -> D-DATA-007
```

Structured architecture related-document links now point to the canonical assumptions register instead of treating `docs/16-open-decisions.md` as current truth.

Legacy `docs/16-open-decisions.md` remains a migration source and is not deleted.

## Important decision state

No provider/runtime selection became Accepted through this task.

High-impact choices still remain Proposed/Open/Assumed according to the canonical register, including:

- monorepo strategy,
- PostgreSQL acceptance,
- authentication/session strategy,
- member authentication,
- API deployment topology,
- job runner,
- managed backend,
- hosting,
- payment provider,
- messaging provider,
- observability provider,
- RLS strategy,
- membership renewal representation.

## Current task

Read `.ai/task/current.md`.

Current task:

`TASK-DOC-ARCH-005 - Create C4 Component Architecture`

Target:

`docs/02-architecture/component-architecture.md`

## Exact next action

Decompose the trusted Application/API and Worker logical containers into implementation-oriented source-code components without turning each domain into a deployable service.

Must include:

- HTTP/transport adapters,
- authentication/principal resolver,
- tenant-context resolver,
- capability authorization,
- validation/contracts,
- application use cases,
- domain modules,
- transaction/unit-of-work boundary,
- repository/data-access ports,
- payment/webhook adapters,
- notification policy/intent/delivery adapters,
- audit/events,
- idempotency/dedupe,
- worker scheduler/handlers,
- operational read/query components,
- synchronous vs asynchronous interaction rules,
- failure propagation,
- observability and test seams.

## Inputs that must be read before writing

- `.ai/context/project-context.md`
- `.ai/context/current-context.md`
- `docs/00-overview/assumptions.md`
- `docs/01-product/functional-requirements.md`
- `docs/01-product/non-functional-requirements.md`
- all four current `docs/02-architecture/` drafts
- relevant legacy architecture/database/API/automation/security sources

## Do not forget

- `docs/` is canonical truth.
- `.ai/` is execution continuity, not canonical architecture.
- use canonical scoped decision IDs only in new structured docs.
- components are code boundaries, not automatic microservices.
- provider decisions remain Open until accepted through ADRs.
- preserve requirement traceability.
- do not begin `data-flow.md` until the component task is complete and context files are updated.

## Blockers/open questions

No blocker prevents writing logical C4 Level 3 component architecture.

Open provider/runtime choices can remain abstract behind ports/adapters.
