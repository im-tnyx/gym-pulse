# Current Task

## TASK-DOC-ADR-003

**Title:** Draft Database Selection Architecture Decision Record

**Status:** `READY`

**Phase:** `Phase 4 - System Architecture`

**Target file:** `docs/adr/ADR-0002-database-selection.md`

## Objective

Create a reviewable ADR for canonical decision `D-ARCH-002` covering the canonical relational database technology for GymPulse Phase 1 and its expected evolution path.

The ADR MUST begin with status `Proposed` unless explicit acceptance evidence is separately authorized and recorded.

This task drafts rationale only. It does not accept PostgreSQL merely because current architecture documents recommend it.

## Primary decision

```text
D-ARCH-002
Priority: P0
Canonical status: PROPOSED
Decision: Select canonical relational database technology.
Current recommendation: PostgreSQL.
```

## Related but separate decisions

- `D-ARCH-013` managed backend/platform responsibilities
- `D-SEC-008` RLS strategy
- `D-DATA-008` enum/status representation
- data-access/ORM/query-builder selection, which currently has no dedicated canonical ID
- hosting/database-provider selection

Do not silently resolve these decisions inside ADR-0002.

## Inputs to read

1. `docs/adr/README.md`
2. `docs/adr/ADR-0001-use-monorepo.md` for ADR style only
3. `docs/00-overview/assumptions.md`
4. `docs/01-product/functional-requirements.md`
5. `docs/01-product/non-functional-requirements.md`
6. `docs/02-architecture/architecture-principles.md`
7. `docs/02-architecture/architecture-overview.md`
8. `docs/02-architecture/component-architecture.md`
9. `docs/02-architecture/data-flow.md`
10. `docs/02-architecture/technology-stack.md`
11. legacy `docs/06-database-schema.md` and `docs/05-system-architecture.md` only as migration inputs

## Required alternatives

Evaluate at least:

1. PostgreSQL as canonical relational store,
2. MySQL/MariaDB-family relational database,
3. document/NoSQL-first canonical persistence for Phase 1,
4. optionally distinguish managed PostgreSQL service from database-engine selection without bundling provider choice.

## Required evaluation criteria

- relational integrity and foreign keys,
- transactions for attendance/payment/membership effects,
- uniqueness/partial-uniqueness requirements,
- tenant scoping and possible RLS defense in depth,
- indexing/query support for operational queues,
- JSON/provider-event storage where needed,
- migrations and schema evolution,
- local/test environment support,
- backup/restore and managed-service availability,
- connection/runtime compatibility,
- observability/operability,
- team/tool ecosystem fit,
- portability and provider lock-in,
- migration/reversibility.

## Mandatory ADR content

Follow `docs/adr/README.md` and include:

- Status = `Proposed`,
- Primary Decision ID = `D-ARCH-002`,
- requirements/decision drivers,
- constraints/assumptions,
- alternatives,
- explicit evaluation,
- proposed decision,
- consequences,
- security/privacy implications,
- reliability/performance/scalability implications,
- operations/backup/restore implications,
- testing/validation,
- migration/rollout,
- reversibility,
- risks/mitigations,
- open questions,
- decision evidence = `None - Proposed` unless explicit approval is supplied,
- related documents.

## Important design boundary

Database **engine selection** is separate from:

- managed backend/provider selection,
- RLS policy details,
- ORM/query-builder choice,
- hosting region/provider,
- final schema design.

The ADR may explain how PostgreSQL capabilities support those concerns without silently resolving them.

## Definition of Done

- `docs/adr/ADR-0002-database-selection.md` exists,
- status is `Proposed` unless explicit acceptance is separately authorized,
- `D-ARCH-002` is primary decision ID,
- alternatives and tradeoffs are concrete,
- Phase 1 integrity/idempotency/tenant requirements are traced,
- managed provider and RLS choices remain separate,
- no unrelated technology/provider decision becomes Accepted,
- `.ai/context/documentation-state.md` updated,
- this task recorded in `.ai/task/completed.md`,
- `.ai/context/current-context.md` and `.ai/memory/session-handoff.md` updated,
- next bounded ADR task selected according to canonical P0 decision order.
