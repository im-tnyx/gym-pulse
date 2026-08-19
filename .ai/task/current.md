# Current Task

## TASK-DOC-ADR-001

**Title:** Create ADR Framework and Index

**Status:** `READY`

**Phase:** `Phase 4 - System Architecture`

**Target file:** `docs/adr/README.md`

## Objective

Create the canonical Architecture Decision Record framework for GymPulse so major technical decisions are proposed, reviewed, accepted, rejected, superseded, and traced consistently.

This task creates governance only. It MUST NOT accept monorepo, PostgreSQL, API topology, authentication, managed backend, job runner, or provider choices merely because they are referenced as candidate ADRs.

## Inputs to read

1. `docs/README.md`
2. `docs/00-overview/assumptions.md`
3. `docs/02-architecture/architecture-principles.md`
4. `docs/02-architecture/technology-stack.md`
5. `.ai/context/current-context.md`
6. legacy `docs/15-engineering-workflow.md` only as migration input

## Required output

`docs/adr/README.md` must define:

- ADR purpose and when one is required,
- source-of-truth relationship with `docs/00-overview/assumptions.md`,
- status model,
- numbering and filename convention,
- mandatory ADR sections,
- canonical decision-ID linkage,
- requirement/NFR linkage where relevant,
- evidence and alternatives expectations,
- proposal/review/acceptance workflow,
- rejected/deferred decision handling,
- supersession/deprecation rules,
- implementation and documentation update responsibilities,
- rule that implementation alone does not make an ADR Accepted,
- initial ADR backlog/index without falsely accepting any decision.

## Initial ADR candidates

```text
ADR-0001-use-monorepo.md
ADR-0002-database-selection.md
ADR-0003-api-architecture.md
ADR-0004-authentication-strategy.md
ADR-0005-managed-backend-platform.md
ADR-0006-background-job-runner.md
```

Provider-specific ADRs should be added when evidence is sufficient.

## Decision discipline

Use canonical scoped decision IDs from `docs/00-overview/assumptions.md` only.

Do not introduce legacy numeric IDs.

## Definition of Done

- `docs/adr/README.md` exists,
- status/numbering/template/workflow/supersession rules are explicit,
- canonical decision-ID relationship is explicit,
- initial ADR candidate index exists,
- no architecture choice becomes Accepted through framework creation,
- `.ai/context/documentation-state.md` updated,
- this task recorded in `.ai/task/completed.md`,
- `.ai/context/current-context.md` and `.ai/memory/session-handoff.md` updated,
- next bounded ADR task is selected based on the canonical P0/P1 decision order.