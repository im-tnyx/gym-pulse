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

### `01-product`

All planned files complete at Draft v1.x.

### `02-architecture`

Completed:

- `architecture-principles.md`
- `architecture-overview.md`
- `system-context.md`
- `container-architecture.md`

Remaining:

- `component-architecture.md`
- `data-flow.md`
- `technology-stack.md`
- `architecture-decisions/` index/pointers if retained
- initial ADRs

## Container architecture state

`container-architecture.md` is now the canonical C4 Level 2 draft.

It defines:

- Owner/Staff Web logical container,
- Member Mobile logical container,
- trusted Application/API runtime,
- Worker/Job runtime,
- PostgreSQL canonical store,
- private Object Storage,
- external Auth, Payment, Messaging, Observability, and Product Analytics boundaries,
- synchronous vs asynchronous interactions,
- data ownership,
- dependency direction,
- trust/failure/scaling/test boundaries,
- both `D-060` deployment options without selecting one.

No provider selection or API deployment topology was finalized.

## Legacy flat documents

The repository still contains legacy flat documents such as:

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

These remain migration inputs. Do not delete them until their material has canonical destinations and deprecation pointers exist.

## Requirement traceability state

Canonical requirement IDs exist in `docs/01-product/functional-requirements.md` and `non-functional-requirements.md`.

Architecture documents reference requirement drivers where relevant.

## ADR state

ADR framework not yet created in structured architecture pass.

Initial ADRs planned:

```text
ADR-0001-use-monorepo.md
ADR-0002-use-postgresql.md
ADR-0003-api-deployment-model.md
ADR-0004-authentication-strategy.md
ADR-0005-managed-backend-platform.md
ADR-0006-background-job-runner.md
```

Provider-specific ADRs for payments, messaging, hosting, and observability should wait until evaluation data exists.

## Immediate next documentation task

Create `docs/02-architecture/component-architecture.md`.

The component architecture should decompose the trusted Application/API and Worker boundaries into application services, domain modules, authorization, repositories/ports, provider adapters, audit/event handling, and job components without converting them into microservices.

## Last update

C4 Level 2 `container-architecture.md` completed on branch `docs/phase-2-architecture`. Architecture Phase 4 remains in progress.
