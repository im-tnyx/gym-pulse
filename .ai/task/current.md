# Current Task

## TASK-DOC-ARCH-007

**Title:** Create Technology Stack Evaluation

**Status:** `READY`

**Phase:** `Phase 4 - System Architecture`

**Target file:** `docs/02-architecture/technology-stack.md`

## Objective

Evaluate and document the technology stack needed to implement the existing GymPulse architecture while clearly separating required technical capabilities from Proposed, Assumed, and Open technology choices.

The document must not silently convert a recommendation into an Accepted architecture decision. Major choices remain governed by canonical decision IDs and future ADRs.

## Inputs to read

1. `.ai/context/project-context.md`
2. `.ai/context/current-context.md`
3. `docs/00-overview/assumptions.md`
4. `docs/01-product/functional-requirements.md`
5. `docs/01-product/non-functional-requirements.md`
6. `docs/02-architecture/architecture-principles.md`
7. `docs/02-architecture/architecture-overview.md`
8. `docs/02-architecture/system-context.md`
9. `docs/02-architecture/container-architecture.md`
10. `docs/02-architecture/component-architecture.md`
11. `docs/02-architecture/data-flow.md`
12. relevant legacy architecture/engineering/provider notes only as migration inputs

## Required evaluation areas

Document at least:

- primary application language/runtime,
- monorepo strategy and package manager,
- Owner/Staff web framework,
- Member mobile framework,
- API contract/runtime approach,
- API deployment topology options,
- PostgreSQL and data-access/migration approach,
- managed backend platform option,
- authentication/session strategy requirements,
- background job/scheduler technology requirements,
- payment provider requirements and adapter posture,
- messaging provider requirements and adapter posture,
- object storage,
- observability/error monitoring,
- product analytics,
- Redis/cache posture,
- testing/local-development implications,
- security/secret-management implications,
- deployment/operational implications.

## Mandatory design points

For each meaningful technology choice include where applicable:

1. capability/problem being solved,
2. current status (`Proposed`, `Assumed`, or `Open`),
3. recommended direction if one exists,
4. alternatives considered,
5. selection criteria,
6. tradeoffs,
7. implementation implications,
8. security/operations implications,
9. related canonical decision ID,
10. planned ADR requirement.

## Decision discipline

Use canonical scoped decision IDs from `docs/00-overview/assumptions.md` only.

Relevant IDs include:

```text
D-ARCH-001  Monorepo
D-ARCH-002  PostgreSQL
D-ARCH-003  JSON HTTP API
D-ARCH-004  Authentication/session
D-ARCH-005  Modular monolith
D-ARCH-006  API deployment topology
D-ARCH-007  Job runner
D-ARCH-008  Redis requirement
D-ARCH-009  Hosting
D-ARCH-010  Object storage
D-ARCH-011  Owner/Staff web framework
D-ARCH-012  Member mobile framework
D-ARCH-013  Managed backend
D-ARCH-014  Package manager
D-PROVIDER-001 Payment provider
D-PROVIDER-002 Messaging provider
D-PROVIDER-005 Product analytics
D-PROVIDER-006 Observability
D-SEC-002   Member authentication method
D-SEC-008   RLS strategy
```

Do not introduce legacy numeric IDs.

## Important constraint

`technology-stack.md` is an evaluation and architecture guidance document, not an ADR substitute.

A technology may be recommended as `Proposed` without being accepted.

## Definition of Done

- file exists at canonical path,
- required evaluation areas are covered,
- choices map to architecture requirements and canonical decision IDs,
- alternatives and tradeoffs are explicit,
- no Open/Proposed decision becomes Accepted silently,
- unresolved provider choices remain abstract where evidence is missing,
- cross-document terminology remains consistent,
- `.ai/context/documentation-state.md` updated,
- this task recorded in `.ai/task/completed.md`,
- `.ai/context/current-context.md` and `.ai/memory/session-handoff.md` updated,
- next task becomes ADR framework creation,
- do not draft/accept ADRs in the same bounded task unless explicitly requested.