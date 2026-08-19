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

`assumptions.md` is the canonical decision register and now includes the legacy decision-ID crosswalk.

### `01-product`

All planned files complete at Draft v1.x.

### `02-architecture`

Completed drafts:

- `architecture-principles.md`
- `architecture-overview.md`
- `system-context.md`
- `container-architecture.md`

Remaining architecture artifacts:

- `component-architecture.md`
- `data-flow.md`
- `technology-stack.md`
- `architecture-decisions/` index/pointers if retained
- initial ADRs

## Architecture governance state

Repository audit identified a decision-reference inconsistency:

- legacy `docs/16-open-decisions.md` uses numeric IDs such as `D-060`,
- canonical `docs/00-overview/assumptions.md` uses scoped IDs such as `D-ARCH-006`,
- existing structured architecture drafts still contain some legacy IDs.

Completed governance correction:

- canonical decision source explicitly declared,
- missing canonical IDs added where current architecture required them,
- legacy-to-canonical crosswalk added,
- `docs/README.md` source hierarchy refreshed,
- `.ai` decision memory now points to canonical source.

Current correction task:

Normalize legacy IDs in the four structured architecture drafts before creating new downstream architecture documents.

## Container architecture state

`container-architecture.md` is the current C4 Level 2 draft.

It defines:

- Owner/Staff Web logical container,
- Member Mobile logical container,
- trusted Application/API runtime,
- Worker/Job runtime,
- PostgreSQL proposed canonical store,
- private Object Storage,
- external Auth, Payment, Messaging, Observability, and Product Analytics boundaries,
- synchronous vs asynchronous interactions,
- data ownership,
- dependency direction,
- trust/failure/scaling/test boundaries,
- both API deployment options without selecting one.

No provider selection or API deployment topology is final.

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

Decision traceability is being normalized to canonical scoped IDs before component architecture begins.

## ADR state

ADR framework not yet created in structured architecture pass.

Initial ADR candidates remain Proposed/Open, not Accepted:

```text
ADR-0001-use-monorepo.md
ADR-0002-use-postgresql.md
ADR-0003-api-architecture.md
ADR-0004-authentication-strategy.md
ADR-0005-managed-backend-platform.md
ADR-0006-background-job-runner.md
```

Provider-specific ADRs for payments, messaging, hosting, and observability should wait until evaluation data exists.

## Immediate next documentation task

Normalize legacy decision references in:

- `docs/02-architecture/architecture-principles.md`
- `docs/02-architecture/architecture-overview.md`
- `docs/02-architecture/system-context.md`
- `docs/02-architecture/container-architecture.md`

Use the crosswalk in `docs/00-overview/assumptions.md`.

After that sweep, resume `TASK-DOC-ARCH-005` for `component-architecture.md`.

## Last update

Architecture governance reconciliation completed after repository audit. Phase 4 remains in progress on branch `docs/phase-2-architecture`.
