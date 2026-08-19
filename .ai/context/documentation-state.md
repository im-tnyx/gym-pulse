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

All planned files complete at Draft v1.x.

`assumptions.md` is the canonical decision register and includes the legacy decision-ID crosswalk.

### `01-product`

All planned files complete at Draft v1.x.

### `02-architecture`

Completed drafts:

- `architecture-principles.md`
- `architecture-overview.md`
- `system-context.md`
- `container-architecture.md`
- `component-architecture.md`
- `data-flow.md`

Remaining architecture artifacts:

- `technology-stack.md`
- `architecture-decisions/` index/pointers if retained
- ADR framework and initial ADRs

## Architecture governance state

Completed:

- canonical decision source explicitly declared,
- missing canonical decision IDs added where current architecture required them,
- legacy-to-canonical decision-ID crosswalk added,
- structured architecture drafts normalized to canonical scoped decision IDs,
- no provider/runtime decision accepted implicitly.

Legacy `docs/16-open-decisions.md` remains migration input until its content has canonical destinations and deprecation pointers.

## Component architecture state

`component-architecture.md` is the canonical C4 Level 3-style draft for trusted Application/API and Worker internals.

It defines transport, principal/tenant resolution, capability authorization, validation, use cases, domain ownership, transactions, repositories, layered idempotency, provider adapters, audit/events, worker handlers, operational read models, failure propagation, observability, and test seams.

## Data-flow architecture state

`data-flow.md` is now the canonical Phase 1 end-to-end data-flow draft.

It covers:

1. authentication -> principal -> tenant authorization,
2. member QR check-in,
3. assisted check-in,
4. scheduled no-show scan,
5. follow-up -> return resolution,
6. renewal-window -> reminder intent,
7. renewal order -> payment checkout,
8. verified payment -> exactly-once business effect,
9. notification intent -> provider delivery state,
10. controlled import,
11. owner dashboard/action queues,
12. data-quality scan/issue lifecycle.

The document makes canonical data, trust boundaries, authorization, transactions, idempotency, durable continuation, retries, reconciliation, audit, observability, and gym-local time behavior explicit.

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

## Requirement traceability state

Canonical `FR-*` and `NFR-*` IDs are now referenced by component and data-flow architecture.

Target traceability remains:

```text
Requirement
  -> Domain
  -> Component
  -> Data flow
  -> Database/API/Security/Test artifacts
```

## ADR state

ADR framework has not yet been created.

Initial candidates remain Proposed/Open, not Accepted:

```text
ADR-0001-use-monorepo.md
ADR-0002-use-postgresql.md
ADR-0003-api-architecture.md
ADR-0004-authentication-strategy.md
ADR-0005-managed-backend-platform.md
ADR-0006-background-job-runner.md
```

## Immediate next documentation task

`TASK-DOC-ARCH-007 - Create Technology Stack Evaluation`

Target:

`docs/02-architecture/technology-stack.md`

The next document must distinguish required technical capabilities from Proposed/Open technology choices, compare alternatives and tradeoffs, map them to canonical decision IDs, and avoid marking any technology Accepted before ADR approval.

## Last update

C4 component and Phase 1 data-flow architecture are complete at Draft v1.0 level. Architecture Phase 4 remains in progress on branch `docs/phase-2-architecture`.