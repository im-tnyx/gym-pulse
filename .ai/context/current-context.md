# GymPulse Current Context

## Current phase

`Phase 4: Design System Architecture`

Product foundation and structured product documentation are complete at Draft v1.x level. C4 architecture, Phase 1 data flows, and technology-stack evaluation are now documented. The next bounded work is ADR governance and explicit decision records.

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

### `docs/02-architecture/`

- `architecture-principles.md`
- `architecture-overview.md`
- `system-context.md`
- `container-architecture.md`
- `component-architecture.md`
- `data-flow.md`
- `technology-stack.md`

## Architecture governance

Canonical decision source:

`docs/00-overview/assumptions.md`

Structured architecture uses canonical scoped decision IDs. Legacy `docs/16-open-decisions.md` remains migration input only.

No provider/runtime/framework recommendation becomes Accepted merely because it appears in `technology-stack.md`.

## Technology evaluation established

`technology-stack.md` now distinguishes required capabilities from Proposed/Assumed/Open choices.

Current recommended baseline, still subject to decision/ADR acceptance:

```text
Architecture         Modular monolith
Language             TypeScript
Monorepo              Turborepo-style workspace
Package manager       pnpm
Owner/Staff Web       Next.js + React
Member Mobile         Expo / React Native when native delivery is active
API                   JSON HTTP + runtime-validated typed contracts
Database              PostgreSQL
Data access           SQL-aware typed repository layer; exact library Open
Managed backend       Supabase-like option evaluated; Open
Auth                  Provider/session strategy Open
Jobs                  Durable managed job/scheduler preferred for pilot; Open
Redis                 Not required by default; Open
Payments              Provider adapter; provider Open
Messaging             Provider adapter; provider/channels Open
Object storage        Private managed/S3-compatible; Open
Observability         Centralized error monitoring + structured logs; provider Open
Product analytics     Privacy-minimized, non-canonical events; provider Open
Hosting               Managed platform preferred for pilot; provider Open
```

Important evaluated tradeoffs:

- Next.js/server API vs separate TypeScript API,
- managed backend vs independent platform services,
- managed durable jobs vs Redis-backed queue vs database-backed jobs,
- SQL-aware typed data layer vs heavier ORM,
- responsive member web/PWA vs immediate native mobile,
- PostgreSQL/indexing first vs Redis cache.

## High-impact decisions still requiring ADR work

```text
D-ARCH-001      Monorepo
D-ARCH-002      PostgreSQL
D-ARCH-003      JSON HTTP API
D-ARCH-004      Authentication/session strategy
D-ARCH-005      Modular monolith
D-ARCH-006      API deployment topology
D-ARCH-007      Job runner
D-ARCH-008      Redis requirement
D-ARCH-009      Hosting
D-ARCH-010      Object storage
D-ARCH-011      Owner/Staff web framework
D-ARCH-012      Member mobile framework
D-ARCH-013      Managed backend
D-ARCH-014      Package manager
D-PROVIDER-001  Payment provider
D-PROVIDER-002  Messaging provider
D-PROVIDER-005  Product analytics
D-PROVIDER-006  Observability
D-SEC-002       Member authentication
D-SEC-008       RLS strategy
D-DATA-007      Membership renewal representation
```

## Immediate next action

`TASK-DOC-ADR-001 - Create ADR Framework and Index`

Target:

`docs/adr/README.md`

The ADR framework must define:

- ADR purpose and scope,
- status model such as Proposed/Accepted/Rejected/Superseded/Deprecated,
- numbering and filename conventions,
- mandatory ADR sections,
- canonical decision-ID linkage,
- evidence and alternatives requirements,
- review/acceptance workflow,
- supersession rules,
- cross-document update rules,
- rule that implementation alone does not make a decision Accepted.

## After ADR framework

Proceed one bounded ADR at a time, beginning with the highest-value foundational decisions already listed in the canonical register.

Do not create or accept all ADRs blindly in one task.

## Stop condition

After `docs/adr/README.md` is complete:

- update `.ai/context/documentation-state.md`,
- update `.ai/task/current.md`,
- append `.ai/task/completed.md`,
- update `.ai/memory/session-handoff.md`,
- set the exact next ADR task,
- do not silently accept any technology choice while creating the framework.