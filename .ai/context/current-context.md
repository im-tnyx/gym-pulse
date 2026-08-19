# GymPulse Current Context

## Current phase

`Phase 4: Design System Architecture`

Product foundation and structured product documentation are complete at Draft v1.x level. Architecture documentation is being created deliberately, one bounded artifact at a time.

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
- `docs/02-architecture/component-architecture.md`

## Architecture governance

Canonical decision source:

`docs/00-overview/assumptions.md`

Current structured architecture uses canonical scoped decision IDs only. Legacy `docs/16-open-decisions.md` remains migration input.

No provider/runtime selection has been silently finalized.

## Component architecture established

`component-architecture.md` now defines the C4 Level 3-style internal decomposition of the trusted Application/API and Worker boundaries.

Important established boundaries:

- transport adapters do not own business rules,
- Principal Resolver converts verified auth evidence into application principal,
- Tenant Context Resolver establishes allowed organization/gym/branch scope,
- Capability Authorization enforces named permissions server-side,
- boundary schemas validate untrusted inputs,
- Application Use Cases orchestrate domain modules and transactions,
- each domain owns its canonical mutations,
- cross-domain read models may join data but are read-only,
- Unit of Work protects correctness-sensitive multi-record effects,
- Idempotency uses durable layered protections rather than process-local locks,
- provider SDK/payloads remain behind adapters,
- payment provider-event dedupe is separate from business-effect dedupe,
- worker handlers reuse application/domain logic rather than duplicate it,
- audit history is part of required sensitive mutation semantics,
- durable continuations/outbox-equivalent are required where losing async work would violate requirements.

Critical sequences documented:

```text
QR check-in
Verified renewal payment
```

## Architecture direction still Proposed/Open

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

High-impact choices still requiring decisions/ADRs include:

```text
D-ARCH-001      Monorepo
D-ARCH-002      PostgreSQL
D-ARCH-004      Authentication/session strategy
D-ARCH-006      API deployment topology
D-ARCH-007      Job runner
D-ARCH-009      Hosting
D-ARCH-010      Object storage
D-ARCH-011      Owner/Staff web framework
D-ARCH-012      Member mobile framework
D-ARCH-013      Managed backend
D-PROVIDER-001  Payment provider
D-PROVIDER-002  Messaging provider
D-PROVIDER-006  Observability provider
D-SEC-002       Member authentication
D-SEC-008       RLS strategy
D-DATA-007      Membership renewal representation
```

## Immediate next action

`TASK-DOC-ARCH-006 - Create Architecture Data Flows`

Target:

`docs/02-architecture/data-flow.md`

The next document must trace end-to-end Phase 1 flows using the existing System Context, Container, and Component boundaries.

Minimum flows:

- authentication + principal/tenant authorization context,
- member QR check-in,
- assisted check-in,
- no-show scan -> red-list case,
- follow-up -> member return resolution,
- renewal eligibility/reminder,
- renewal order -> payment initiation,
- payment webhook -> exactly-once membership/add-on effect,
- notification intent -> dispatch -> provider delivery status,
- controlled import,
- owner dashboard/read-model query,
- data-quality scan.

## Stop condition

After `data-flow.md` is complete:

- update `.ai/context/documentation-state.md`,
- update `.ai/task/current.md`,
- append `.ai/task/completed.md`,
- update `.ai/memory/session-handoff.md`,
- set exact next task to `technology-stack.md`,
- do not begin `technology-stack.md` in the same bounded task unless explicitly requested.
