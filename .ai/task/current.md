# Current Task

## TASK-DOC-ARCH-005

**Title:** Create C4 Component Architecture

**Status:** `READY`

**Phase:** `Phase 4 - System Architecture`

**Target file:** `docs/02-architecture/component-architecture.md`

## Objective

Decompose the trusted GymPulse Application/API and Worker boundaries into implementation-oriented components while preserving the modular-monolith architecture and avoiding premature microservice boundaries.

## Inputs to read

1. `.ai/context/project-context.md`
2. `.ai/context/current-context.md`
3. `docs/01-product/functional-requirements.md`
4. `docs/01-product/non-functional-requirements.md`
5. `docs/02-architecture/architecture-principles.md`
6. `docs/02-architecture/architecture-overview.md`
7. `docs/02-architecture/system-context.md`
8. `docs/02-architecture/container-architecture.md`
9. `docs/00-overview/assumptions.md`
10. relevant legacy migration sources such as `docs/05-system-architecture.md`, `docs/06-database-schema.md`, `docs/07-api-contracts.md`, `docs/08-automations.md`, and `docs/12-security-audit.md`

## Required output

The document must define at least:

- transport/HTTP adapters,
- authentication/principal resolver,
- tenant-context resolver,
- capability authorization component,
- request validation/contracts,
- application use-case layer,
- Phase 1 domain modules,
- transaction/unit-of-work boundary,
- repositories/data-access ports,
- payment adapter and webhook mapper,
- notification policy/intent and delivery adapter,
- audit/event components,
- idempotency/deduplication component,
- background-job scheduler/handlers,
- operational read/query components.

## Mandatory design points

- C4 Level 3-style Mermaid diagram(s),
- explicit dependency direction,
- which component owns which business rule,
- shared write restrictions between domains,
- transaction boundaries,
- synchronous vs asynchronous component interactions,
- idempotency locations,
- authorization enforcement points,
- provider adapter boundaries,
- failure propagation rules,
- test seams,
- observability hooks,
- alternatives/tradeoffs,
- no silent selection of Open providers/runtimes.

## Decision discipline

Use canonical scoped decision IDs from `docs/00-overview/assumptions.md` only.

Do not introduce legacy numeric decision IDs from `docs/16-open-decisions.md` into this document.

## Important constraint

Components are source-code/application boundaries, not automatic deployable services.

Do not create one service per domain. Preserve `AP-001 Modular Monolith Before Microservices`.

## Definition of Done

- file exists at canonical path,
- components align with C4 Level 2 container architecture,
- domain ownership is explicit,
- critical mutations show transaction/idempotency ownership,
- terminology aligns with requirement IDs,
- provider choices remain abstract where Open,
- canonical decision IDs are used where decisions are referenced,
- Mermaid diagrams are syntactically reasonable,
- `.ai/context/documentation-state.md` is updated,
- this task is recorded in `.ai/task/completed.md`,
- next task becomes `data-flow.md`,
- `.ai/context/current-context.md` and `.ai/memory/session-handoff.md` are updated.
