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

Remaining architecture artifacts:

- `data-flow.md`
- `technology-stack.md`
- `architecture-decisions/` index/pointers if retained
- initial ADRs

## Architecture governance state

Completed:

- canonical decision source explicitly declared,
- missing canonical decision IDs added where current architecture required them,
- legacy-to-canonical decision-ID crosswalk added,
- structured architecture drafts normalized to canonical scoped decision IDs,
- architecture related-document links point to the canonical assumptions register,
- no provider/runtime decision was accepted as part of normalization.

Legacy `docs/16-open-decisions.md` remains a migration input and may retain historical numeric IDs until its content has canonical destinations and deprecation pointers.

## Component architecture state

`component-architecture.md` is now the canonical C4 Level 3-style draft for trusted Application/API and Worker internals.

It defines:

- transport adapters and request/correlation context,
- principal and tenant-context resolution,
- capability authorization,
- contract validation and DTO mapping,
- application use-case/orchestration layer,
- Phase 1 domain ownership,
- transaction/unit-of-work boundaries,
- repository/data-access ports,
- layered request/domain/provider/business-effect idempotency,
- payment adapter and verified webhook mapper,
- notification policy/intent vs transport separation,
- audit recorder and data-quality component,
- operational query/read models,
- worker scheduler/handlers,
- cross-domain write restrictions,
- synchronous vs asynchronous interaction rules,
- failure propagation,
- observability hooks and test seams.

The document does not make components separate services and does not finalize open providers/runtimes.

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

`component-architecture.md` now maps requirements into application/domain components and explicit critical sequence flows.

Structured architecture decision traceability uses canonical scoped decision IDs from `docs/00-overview/assumptions.md`.

## ADR state

ADR framework not yet created in the structured architecture pass.

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

`TASK-DOC-ARCH-006 - Create Architecture Data Flows`

Target:

`docs/02-architecture/data-flow.md`

The document should trace concrete Phase 1 end-to-end data flows across clients, Application/API components, domain ownership, PostgreSQL, workers, and external providers. It must reuse the boundaries already defined rather than inventing new services casually.

## Last update

C4 Level 3-style `component-architecture.md` completed on branch `docs/phase-2-architecture`. Architecture Phase 4 remains in progress.
