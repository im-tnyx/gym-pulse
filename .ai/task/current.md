# Current Task

## TASK-DOC-ARCH-004

**Title:** Create C4 Container Architecture

**Status:** `READY`

**Phase:** `Phase 4 - System Architecture`

**Target file:** `docs/02-architecture/container-architecture.md`

## Objective

Define GymPulse C4 Level 2 containers and runtime responsibilities without prematurely turning logical boundaries into microservices.

## Inputs to read

1. `.ai/context/project-context.md`
2. `.ai/context/current-context.md`
3. `docs/01-product/functional-requirements.md`
4. `docs/01-product/non-functional-requirements.md`
5. `docs/02-architecture/architecture-principles.md`
6. `docs/02-architecture/architecture-overview.md`
7. `docs/02-architecture/system-context.md`
8. relevant sections of `docs/16-open-decisions.md`

## Required output

The document must define at least:

- Owner/Staff Web container
- Member Mobile container
- Application/API container/runtime
- Worker/Job runtime
- PostgreSQL
- Object Storage
- external Auth Provider
- Payment Provider
- Messaging Provider
- Observability/Analytics systems

## Mandatory design points

- C4 Level 2 Mermaid diagram
- responsibilities of every container
- dependency direction
- trust boundaries
- data ownership
- synchronous vs asynchronous interactions
- deployment implications
- scaling implications
- failure boundaries
- security considerations
- test boundaries
- alternatives considered
- `D-060` API deployment model remains Open

## Important constraint

Document both viable Phase 1 deployment forms:

```text
Option A: Next.js Web + server/API initially
Option B: separate TypeScript API runtime
```

Do not select one as final without ADR acceptance.

## Definition of Done

- file exists at canonical path
- terminology aligns with product and architecture docs
- no provider choice is fabricated
- open decisions are explicitly referenced
- Mermaid diagram is syntactically reasonable
- `.ai/context/documentation-state.md` is updated
- this task is recorded in `.ai/task/completed.md`
- next task becomes `component-architecture.md`
- `.ai/memory/session-handoff.md` is updated
