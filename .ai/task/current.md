# Current Task

## TASK-DOC-GOV-002

**Title:** Normalize Architecture Decision References

**Status:** `READY`

**Phase:** `Phase 4 - System Architecture`

## Objective

Replace legacy decision IDs inside existing structured architecture drafts with canonical scoped decision IDs from `docs/00-overview/assumptions.md`.

This task changes references only. It MUST NOT change decision status, select providers, accept technologies, or alter business requirements.

## Inputs to read

1. `docs/README.md`
2. `docs/00-overview/assumptions.md`
3. `docs/02-architecture/architecture-principles.md`
4. `docs/02-architecture/architecture-overview.md`
5. `docs/02-architecture/system-context.md`
6. `docs/02-architecture/container-architecture.md`
7. legacy `docs/16-open-decisions.md` only when crosswalk context is needed
8. `.ai/context/current-context.md`

## Canonical mapping source

Use section `Legacy Decision ID Migration Crosswalk` in:

`docs/00-overview/assumptions.md`

Examples:

```text
D-020 -> D-PROD-010
D-030 -> D-PROVIDER-001
D-038 -> D-PROVIDER-002
D-049 -> D-ARCH-004
D-050 -> D-SEC-002
D-055 -> D-ARCH-001
D-056 -> D-ARCH-011
D-057 -> D-ARCH-012
D-058 -> D-ARCH-002
D-059 -> D-ARCH-013
D-060 -> D-ARCH-006
D-061 -> D-ARCH-007
D-062 -> D-ARCH-008
D-063 -> D-ARCH-010
D-064 -> D-ARCH-009
D-065 -> D-PROVIDER-006
D-066 -> D-PROVIDER-005
D-068 -> D-SEC-008
D-069 -> D-DATA-007
```

## Files to update

- `docs/02-architecture/architecture-principles.md`
- `docs/02-architecture/architecture-overview.md`
- `docs/02-architecture/system-context.md`
- `docs/02-architecture/container-architecture.md`

## Required checks

- no legacy `D-###` reference remains in the four structured architecture files,
- canonical IDs match the owning decision concern,
- no decision state changes,
- no provider selection introduced,
- no architecture behavior rewritten merely to perform ID migration,
- cross-document terminology remains unchanged unless needed for the ID correction.

## Definition of Done

- all four structured architecture documents use canonical decision IDs only,
- `.ai/context/documentation-state.md` updated,
- this task recorded in `.ai/task/completed.md`,
- `.ai/memory/session-handoff.md` updated,
- current task returns to `TASK-DOC-ARCH-005 - Create C4 Component Architecture`.
