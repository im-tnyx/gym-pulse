# GymPulse Current Context

## Current phase

`Phase 4: Design System Architecture`

Product foundation, structured product documentation, C4 architecture, Phase 1 data flows, technology-stack evaluation, ADR governance, and the first foundational ADR draft are now documented. Foundational ADRs are being drafted one bounded decision at a time.

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

All planned Draft v1.x product documents are complete.

### `docs/02-architecture/`

- `architecture-principles.md`
- `architecture-overview.md`
- `system-context.md`
- `container-architecture.md`
- `component-architecture.md`
- `data-flow.md`
- `technology-stack.md`

### `docs/adr/`

- `README.md` ADR governance framework
- `ADR-0001-use-monorepo.md` - `Proposed`

## Architecture governance

Canonical decision source:

`docs/00-overview/assumptions.md`

Canonical decision rationale/history:

`docs/adr/`

Rules:

- ADRs use canonical scoped decision IDs only,
- drafting/merging/implementing an ADR does not make it `Accepted`,
- explicit approval evidence is required for acceptance,
- accepted ADR status and the canonical decision register must be synchronized,
- related decisions must not be silently bundled.

## ADR-0001 state

`ADR-0001-use-monorepo.md` has been drafted for `D-ARCH-001`.

Status remains:

```text
ADR: Proposed
D-ARCH-001: PROPOSED
```

The ADR proposes a monorepo with explicit apps/packages boundaries because GymPulse must share domain/application logic, typed contracts, tests, migrations, and documentation across web/mobile/API/worker concerns while retaining independent deployment boundaries.

It explicitly does **not** decide:

- `D-ARCH-006` API deployment topology,
- `D-ARCH-014` package manager,
- exact task orchestrator,
- Next.js/Expo/provider selections.

Important boundary:

```text
one repository != one deployable runtime
shared repository != permission to import server secrets into clients
```

## Current architecture direction still Proposed/Open

```text
Architecture         Modular monolith
Language             TypeScript direction
Monorepo              Proposed via ADR-0001
Package manager       pnpm Assumed, not decided
Owner/Staff Web       Next.js + React Proposed
Member Mobile         Expo / React Native Proposed
API                   JSON HTTP typed contracts Proposed
API deployment        Open
Database              PostgreSQL Proposed
Managed backend       Open
Auth                  Open
Jobs                  Open
Redis                 Open / not required by default
Payments              Provider Open
Messaging             Provider/channels Open
Object storage        Open
Observability         Provider Open
Product analytics     Provider Open
Hosting               Open
```

## Immediate next action

`TASK-DOC-ADR-003 - Draft Database Selection Architecture Decision Record`

Target:

`docs/adr/ADR-0002-database-selection.md`

Primary decision:

`D-ARCH-002 - Select canonical relational database technology`

Canonical status:

`PROPOSED`

Initial ADR status:

`Proposed`

The next ADR should evaluate PostgreSQL against viable relational and NoSQL-first alternatives using GymPulse transaction, relational-integrity, tenant, idempotency, operational-query, migration, backup/restore, and portability requirements.

Do not silently decide managed backend, RLS policy, ORM/query-builder, or hosting provider inside the database-engine ADR.

## Stop condition

After ADR-0002 is drafted:

- keep status `Proposed` unless explicit acceptance is authorized,
- update `.ai/context/documentation-state.md`,
- update `.ai/task/current.md`,
- append `.ai/task/completed.md`,
- update `.ai/memory/session-handoff.md`,
- select the next bounded P0 ADR task.
