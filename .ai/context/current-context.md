# GymPulse Current Context

## Current phase

`Phase 4: Design System Architecture`

Product foundation, structured product documentation, C4 architecture, Phase 1 data flows, technology-stack evaluation, and ADR governance are documented. The next bounded work is drafting foundational ADRs one decision at a time.

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

### `docs/adr/`

- `README.md` ADR governance framework and candidate index

## Architecture governance

Canonical decision source:

`docs/00-overview/assumptions.md`

Canonical decision rationale/history:

`docs/adr/`

Rules now established:

- new ADRs use canonical scoped decision IDs only,
- ADR files normally begin `Proposed`,
- merging or implementing an ADR does not make it `Accepted`,
- explicit approval evidence is required for `Accepted`,
- accepted ADR status and the canonical decision register must remain synchronized,
- rejected/deferred proposals remain traceable,
- materially changing an accepted decision requires a new superseding ADR,
- accepted ADRs are not rewritten to erase historical rationale.

Legacy `docs/16-open-decisions.md` remains migration input only.

## Current architecture direction still Proposed/Open

```text
Architecture         Modular monolith
Language             TypeScript
Monorepo              Turborepo-style workspace
Package manager       pnpm
Owner/Staff Web       Next.js + React
Member Mobile         Expo / React Native when native delivery is active
API                   JSON HTTP + runtime-validated typed contracts
API deployment        Open
Database              PostgreSQL
Data access           SQL-aware typed repository layer; exact library Open
Managed backend       Supabase-like option evaluated; Open
Auth                  Provider/session strategy Open
Jobs                  Durable job/scheduler; exact technology Open
Redis                 Not required by default; Open
Payments              Provider adapter; provider Open
Messaging             Provider adapter; provider/channels Open
Object storage        Private managed/S3-compatible; Open
Observability         Centralized error monitoring + structured logs; provider Open
Product analytics     Privacy-minimized, non-canonical events; provider Open
Hosting               Managed platform preferred for pilot; provider Open
```

No item above is Accepted merely because it is recommended.

## ADR framework established

`docs/adr/README.md` defines:

- when an ADR is required,
- `Proposed`, `Accepted`, `Rejected`, `Deferred`, `Superseded`, and `Deprecated`,
- four-digit ADR numbering and kebab-case filenames,
- standard metadata and ADR sections,
- canonical decision-ID and FR/NFR traceability,
- evidence requirements,
- alternatives/tradeoff expectations,
- review/acceptance workflow,
- supersession/deprecation rules,
- implementation/document synchronization obligations,
- initial candidate ADR index.

## Immediate next action

`TASK-DOC-ADR-002 - Draft Monorepo ADR`

Target:

`docs/adr/ADR-0001-use-monorepo.md`

Primary decision:

`D-ARCH-001 - Use a monorepo and define package boundaries`

Canonical current status:

`PROPOSED`

Initial ADR status must be:

`Proposed`

The task should evaluate the monorepo strategy using current architecture, technology evaluation, repository shape, dependency boundaries, CI implications, alternatives, migration/reversibility, and package-boundary enforcement.

Do not decide unrelated concerns such as API deployment topology or provider selection inside this ADR.

Package manager `D-ARCH-014` may be listed as related, but should not silently become decided unless explicitly in scope and authorized.

## Stop condition

After `ADR-0001-use-monorepo.md` is drafted:

- keep status `Proposed` unless explicit acceptance is separately authorized,
- update `.ai/context/documentation-state.md`,
- update `.ai/task/current.md`,
- append `.ai/task/completed.md`,
- update `.ai/memory/session-handoff.md`,
- select the next bounded ADR task,
- do not batch-accept foundational decisions.
