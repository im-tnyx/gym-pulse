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

### `adr`

Created:

- `docs/adr/README.md`

The ADR framework now defines:

- when ADRs are required,
- status lifecycle,
- numbering and filename conventions,
- canonical decision-ID linkage,
- FR/NFR and architecture traceability,
- standard ADR metadata/template,
- evidence and alternative expectations,
- review and explicit acceptance workflow,
- Rejected/Deferred handling,
- Superseded/Deprecated handling,
- post-acceptance documentation/implementation responsibilities,
- rule that implementation alone does not confer acceptance,
- initial ADR candidate index.

No architecture/provider/framework choice became Accepted through framework creation.

## Architecture governance state

Canonical decision source:

`docs/00-overview/assumptions.md`

Canonical rationale records:

`docs/adr/`

The decision register owns current status/priority; ADRs own the detailed rationale and consequence history. Accepted ADRs and the canonical register must remain synchronized.

Legacy `docs/16-open-decisions.md` remains migration input only.

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
```

Major technologies remain Proposed/Open/Assumed according to the canonical register until individual ADRs are explicitly resolved.

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

ADR framework: `DONE`.

Initial candidate backlog:

```text
ADR-0001-use-monorepo.md            D-ARCH-001  P0 PROPOSED
ADR-0002-database-selection.md      D-ARCH-002  P0 PROPOSED
ADR-0003-api-architecture.md        D-ARCH-003  P0 PROPOSED
ADR-0004-authentication-strategy.md D-ARCH-004  P0 OPEN
ADR-0005-managed-backend-platform.md D-ARCH-013 P0 OPEN
ADR-0006-background-job-runner.md   D-ARCH-007  P1 OPEN
```

No candidate ADR file exists merely because it appears in the index unless explicitly created.

## Immediate next documentation task

`TASK-DOC-ADR-002 - Draft Monorepo ADR`

Target:

`docs/adr/ADR-0001-use-monorepo.md`

Primary canonical decision:

`D-ARCH-001`

Initial ADR status:

`Proposed`

The next task should evaluate the monorepo decision from current repository/architecture evidence and produce a reviewable ADR. It MUST NOT mark the decision Accepted without explicit acceptance evidence.

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

`TASK-DOC-ADR-001` completed on branch `docs/phase-2-architecture`. Phase 4 remains in progress while foundational ADRs are drafted and explicitly resolved one bounded decision at a time.
