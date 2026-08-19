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
- `technology-stack.md`

Remaining Phase 4 architecture work:

- ADR framework/index
- initial ADRs for major architecture decisions
- optional `architecture-decisions/` pointer/index only if it adds navigation value beyond `docs/adr/`

## Architecture governance state

Completed:

- canonical decision source explicitly declared,
- legacy-to-canonical decision-ID crosswalk added,
- structured architecture drafts use canonical scoped decision IDs,
- provider/runtime recommendations remain Proposed/Open/Assumed until decision/ADR acceptance.

Legacy `docs/16-open-decisions.md` remains migration input until its content has canonical destinations and deprecation pointers.

## Component architecture state

`component-architecture.md` is the canonical C4 Level 3-style draft for trusted Application/API and Worker internals.

It defines transport, principal/tenant resolution, capability authorization, validation, use cases, domain ownership, transactions, repositories, layered idempotency, provider adapters, audit/events, worker handlers, operational read models, failure propagation, observability, and test seams.

## Data-flow architecture state

`data-flow.md` is the canonical Phase 1 end-to-end data-flow draft.

It covers authentication, attendance, retention, renewal/payment, notification, import, owner-read-model, and data-quality flows with explicit trust, transaction, idempotency, retry, reconciliation, audit, observability, and gym-local time boundaries.

## Technology stack state

`technology-stack.md` is now the canonical architecture-level technology evaluation.

It covers:

- TypeScript runtime direction,
- monorepo and package manager,
- Next.js Owner/Staff Web direction,
- Expo/React Native Member Mobile direction,
- JSON HTTP typed contracts,
- API deployment Option A vs Option B,
- PostgreSQL,
- data-access/migration approach options,
- managed backend platform evaluation,
- auth/session requirements,
- RLS posture,
- durable job/scheduler options,
- Redis posture,
- payment and messaging adapter requirements,
- object storage,
- observability,
- product analytics,
- testing/local-development tooling,
- secret/configuration rules,
- hosting/deployment requirements,
- CI/CD implications,
- technology spikes and selection gates.

No Open/Proposed technology was marked Accepted. Exact library/framework versions are intentionally left to implementation dependency policy rather than architecture documentation.

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

Canonical `FR-*` and `NFR-*` IDs are referenced by component/data-flow/technology architecture where relevant.

Target traceability remains:

```text
Requirement
  -> Domain
  -> Component
  -> Data flow
  -> Technology/ADR
  -> Database/API/Security/Test artifacts
```

## ADR state

ADR framework has not yet been created.

Initial candidates remain Proposed/Open, not Accepted:

```text
ADR-0001-use-monorepo.md
ADR-0002-database-selection.md
ADR-0003-api-architecture.md
ADR-0004-authentication-strategy.md
ADR-0005-managed-backend-platform.md
ADR-0006-background-job-runner.md
```

Provider-specific ADRs for payments, messaging, hosting, observability, and product analytics should be created when evidence is sufficient.

## Immediate next documentation task

`TASK-DOC-ADR-001 - Create ADR Framework and Index`

Target:

`docs/adr/README.md`

The ADR framework must define status semantics, numbering/naming, required sections, canonical decision-ID linkage, proposal/acceptance/deprecation workflow, supersession rules, evidence requirements, and cross-document update expectations. It must not accept any architecture choice merely by creating the framework.

## Last update

Technology stack evaluation completed on branch `docs/phase-2-architecture`. Phase 4 remains in progress until ADR framework and the planned initial decision records are addressed.