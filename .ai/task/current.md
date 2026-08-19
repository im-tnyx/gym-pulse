# Current Task

## TASK-DOC-ADR-002

**Title:** Draft Monorepo Architecture Decision Record

**Status:** `READY`

**Phase:** `Phase 4 - System Architecture`

**Target file:** `docs/adr/ADR-0001-use-monorepo.md`

## Objective

Create a reviewable ADR for the canonical decision `D-ARCH-001` covering whether GymPulse should use a monorepo and what architectural boundaries the repository strategy must preserve.

The ADR MUST begin with status `Proposed` unless explicit acceptance evidence is separately authorized and recorded.

This task drafts the decision rationale. It does not accept the decision merely because current architecture documents recommend a monorepo.

## Primary decision

```text
D-ARCH-001
Priority: P0
Canonical status: PROPOSED
Decision: Use a monorepo and define package boundaries.
```

## Related but separate decisions

- `D-ARCH-014` package manager (`pnpm` currently Assumed)
- `D-ARCH-005` modular monolith architecture style
- `D-ARCH-006` API deployment topology
- `D-ARCH-011` Owner/Staff web framework
- `D-ARCH-012` Member mobile framework

Do not silently resolve these related decisions inside ADR-0001.

## Inputs to read

1. `docs/adr/README.md`
2. `docs/00-overview/assumptions.md`
3. `docs/01-product/non-functional-requirements.md`
4. `docs/02-architecture/architecture-principles.md`
5. `docs/02-architecture/architecture-overview.md`
6. `docs/02-architecture/container-architecture.md`
7. `docs/02-architecture/component-architecture.md`
8. `docs/02-architecture/technology-stack.md`
9. legacy `docs/15-engineering-workflow.md` only as migration input
10. current repository tree/state where relevant

## Required alternatives

Evaluate at least:

1. TypeScript monorepo with multiple apps/packages,
2. separate repositories per application/runtime,
3. a single application repository with minimal/no reusable package boundaries.

## Required evaluation criteria

- shared domain/business-rule reuse,
- typed contract reuse,
- cross-app atomic changes,
- CI/build impact,
- dependency boundary enforcement,
- local-development ergonomics,
- release/deployment independence,
- mobile/web/API coordination,
- code ownership and future team scaling,
- migration/reversibility,
- security implications of shared packages/configuration,
- risk of monorepo becoming an unstructured shared-code dump.

## Mandatory ADR content

Follow `docs/adr/README.md` and include:

- Status = `Proposed`,
- Primary Decision ID = `D-ARCH-001`,
- requirements/decision drivers,
- constraints/assumptions,
- alternatives,
- explicit evaluation,
- proposed decision,
- consequences,
- security/privacy implications,
- reliability/performance/scalability implications,
- CI/operations implications,
- testing/validation,
- migration/rollout,
- reversibility,
- risks/mitigations,
- open questions,
- decision evidence = `None - Proposed` unless explicit approval is supplied,
- related documents.

## Important design boundary

A monorepo decision determines source/repository organization, not runtime deployment.

It must remain valid whether:

```text
Option A: Web + server/API initially share one deployable runtime
Option B: Web and API deploy independently
```

Similarly, a shared repository must not allow client code to import server secrets or database/provider adapters.

## Definition of Done

- `docs/adr/ADR-0001-use-monorepo.md` exists,
- status is `Proposed` unless explicit acceptance is separately authorized,
- `D-ARCH-001` is the primary decision ID,
- alternatives and tradeoffs are concrete,
- package/dependency/security boundaries are explicit,
- runtime deployment remains a separate decision,
- no unrelated provider/framework decision becomes Accepted,
- `.ai/context/documentation-state.md` updated,
- this task recorded in `.ai/task/completed.md`,
- `.ai/context/current-context.md` and `.ai/memory/session-handoff.md` updated,
- next bounded ADR task selected according to canonical P0 decision order.
