# GymPulse Documentation State

## Status legend

- `DONE`: canonical structured draft exists
- `IN_PROGRESS`: current phase
- `QUEUED`: next planned work
- `FUTURE`: later documentation phase
- `LEGACY`: source material still awaiting migration/deprecation

## Phase status

| Phase | Area | Status |
|---|---|---|
| 1 | Existing information assessment | DONE |
| 2 | Documentation information architecture | DONE |
| 3 | Overview + Product | DONE |
| 4 | System Architecture | IN_PROGRESS |
| 5 | Domain Architecture | QUEUED |
| 6 | Database + API | QUEUED |
| 7 | AI Architecture | FUTURE |
| 8 | Security + Privacy | FUTURE |
| 9 | Infrastructure + DevOps | FUTURE |
| 10 | Testing + Observability | FUTURE |
| 11 | Engineering Standards | FUTURE |
| 12 | MVP + Technical Roadmap | FUTURE |
| 13 | Consistency Audit | FUTURE |

## Structured docs completed

### `00-overview`

All planned Draft v1.x overview files exist. `assumptions.md` is the canonical decision register.

### `01-product`

All planned Draft v1.x product files exist.

### `02-architecture`

Completed drafts:

- `architecture-principles.md`
- `architecture-overview.md`
- `system-context.md`
- `container-architecture.md`
- `component-architecture.md`
- `data-flow.md`
- `technology-stack.md`

### `adr`

Created:

- `docs/adr/README.md` - active governance
- `docs/adr/ADR-0001-use-monorepo.md` - `Proposed`

## Architecture governance state

Canonical decision source:

`docs/00-overview/assumptions.md`

Canonical rationale/history:

`docs/adr/`

No architecture/provider/framework choice becomes Accepted through drafting alone.

Legacy `docs/16-open-decisions.md` remains migration input only.

## ADR-0001 state

Primary decision:

`D-ARCH-001 - Use a monorepo and define package boundaries`

Current state:

```text
Canonical decision: PROPOSED
ADR-0001: Proposed
Acceptance evidence: None
```

ADR-0001 evaluates:

- explicit apps/packages monorepo,
- separate repositories per runtime/application,
- one application repository without deliberate reusable package boundaries.

The proposed direction is a monorepo with enforced package/dependency boundaries while keeping deployment topology independent.

The ADR does not decide package manager, API deployment topology, frameworks, job runner, hosting, or providers.

## Current architecture maturity

The Phase 4 baseline now has:

```text
Architecture principles
C4 Level 1 system context
C4 Level 2 containers
C4 Level 3-style components
12 critical Phase 1 data flows
Technology stack evaluation
ADR governance framework
ADR-0001 monorepo proposal
```

## Requirement traceability state

Current target traceability:

```text
Requirement
  -> Domain
  -> Component
  -> Data Flow
  -> Technology Evaluation
  -> Canonical Decision ID
  -> ADR
  -> Database/API/Security/Test artifacts
```

## ADR state

```text
ADR-0001-use-monorepo.md             D-ARCH-001  P0 Proposed  CREATED
ADR-0002-database-selection.md       D-ARCH-002  P0 Proposed  NEXT
ADR-0003-api-architecture.md         D-ARCH-003  P0 Proposed  QUEUED
ADR-0004-authentication-strategy.md  D-ARCH-004  P0 Open      QUEUED
ADR-0005-managed-backend-platform.md D-ARCH-013  P0 Open      QUEUED
ADR-0006-background-job-runner.md    D-ARCH-007  P1 Open      QUEUED
```

## Immediate next documentation task

`TASK-DOC-ADR-003 - Draft Database Selection ADR`

Target:

`docs/adr/ADR-0002-database-selection.md`

Primary canonical decision:

`D-ARCH-002`

Initial ADR status:

`Proposed`

The ADR must evaluate PostgreSQL against viable alternatives without bundling managed-backend/provider, RLS-policy, ORM/query-builder, or hosting decisions.

## Legacy flat documents

High-value migration sources still include:

- `docs/05-system-architecture.md`
- `docs/06-database-schema.md`
- `docs/07-api-contracts.md`
- `docs/08-automations.md`
- `docs/09-payments-billing.md`
- `docs/10-notifications-whatsapp.md`
- `docs/11-analytics-kpis.md`
- `docs/12-security-audit.md`
- `docs/13-testing-qa.md`
- `docs/14-roadmap.md`
- `docs/15-engineering-workflow.md`
- `docs/16-open-decisions.md`

Do not delete them until their material has canonical destinations and deprecation pointers exist.

## Last update

`TASK-DOC-ADR-002` completed on branch `docs/phase-2-architecture`. Phase 4 remains in progress while foundational ADRs are drafted one bounded decision at a time.
