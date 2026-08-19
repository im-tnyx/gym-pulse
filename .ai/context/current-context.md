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

## Governance correction completed

A repository documentation audit found that structured architecture documents still referenced legacy decision IDs such as `D-060`, while the canonical structured decision register uses IDs such as `D-ARCH-006`.

The canonical decision source is now explicitly:

`docs/00-overview/assumptions.md`

That document now contains:

- canonical decision-ID policy,
- missing architecture/product/security/data decision IDs needed by current architecture,
- a legacy-to-canonical decision-ID crosswalk,
- a rule that new structured documents must use canonical IDs only.

`docs/README.md` and `.ai/memory/decisions.md` now point to the canonical register.

## Known inconsistency still to fix

Existing structured architecture drafts created before the audit still contain legacy IDs.

Affected files:

- `docs/02-architecture/architecture-principles.md`
- `docs/02-architecture/architecture-overview.md`
- `docs/02-architecture/system-context.md`
- `docs/02-architecture/container-architecture.md`

Do not create `component-architecture.md` until these references are normalized.

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
D-ARCH-001   Monorepo
D-ARCH-002   PostgreSQL
D-ARCH-004   Authentication/session strategy
D-ARCH-006   API deployment topology
D-ARCH-007   Job runner
D-ARCH-008   Redis requirement
D-ARCH-009   Hosting
D-ARCH-010   Object storage
D-ARCH-011   Owner/Staff web framework
D-ARCH-012   Member mobile framework
D-ARCH-013   Managed backend
D-PROVIDER-001 Payment provider
D-PROVIDER-002 Messaging provider
D-PROVIDER-005 Product analytics provider
D-PROVIDER-006 Observability provider
D-SEC-002    Member authentication
D-SEC-008    RLS strategy
D-DATA-007   Membership renewal representation
```

## Immediate next action

Normalize legacy decision references inside all existing structured architecture documents.

Target behavior:

```text
legacy D-060 -> canonical D-ARCH-006
legacy D-058 -> canonical D-ARCH-002
legacy D-049 -> canonical D-ARCH-004
...
```

No decision status should change during this task.

## After normalization

Resume:

`TASK-DOC-ARCH-005 - Create C4 Component Architecture`

Then continue with `data-flow.md`, `technology-stack.md`, and ADR framework creation.
