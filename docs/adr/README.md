# GymPulse Architecture Decision Records

## Document Control

- Document Maturity: `Draft`
- Scope: Architecture decision governance
- Canonical Decision Register: `../00-overview/assumptions.md`

## 1. Purpose

`docs/adr/` is the canonical home for Architecture Decision Records (ADRs) in GymPulse.

An ADR records one material technical decision, why it exists, the evidence and constraints considered, alternatives, the selected outcome when accepted, and the consequences of that outcome.

A technology appearing in a legacy architecture, schema, API, or engineering document does **not** make it an accepted architectural decision.

## 2. Relationship to the Decision Register

`../00-overview/assumptions.md` owns:

- canonical decision IDs such as `D-ARCH-001`,
- priority,
- current decision status,
- unresolved question or proposed direction.

An ADR owns:

- detailed context,
- requirements and decision drivers,
- evidence,
- alternatives,
- tradeoffs,
- rationale,
- consequences,
- supersession history.

When an ADR becomes `Accepted`, the matching canonical decision must be updated to `DECIDED` with the ADR reference. If the two disagree, treat it as a documentation defect.

Legacy IDs from `../16-open-decisions.md` are migration aliases only. New ADRs use canonical IDs from `../00-overview/assumptions.md`.

## 3. ADR Statuses

ADR files use only these states:

```text
Proposed
Accepted
Rejected
Superseded
Deprecated
```

### Proposed

A concrete recommendation is ready for review but is not authoritative.

### Accepted

The authorized decision owner has explicitly approved the decision and approval evidence is recorded.

### Rejected

The proposal was reviewed and declined. Rejection does not automatically select another option.

### Superseded

A later Accepted ADR replaces the decision. Keep the old ADR for historical traceability.

### Deprecated

The decision is no longer applicable because the capability or architecture was retired.

`Deferred`, `Blocked`, `Open`, `Assumed`, `Proposed`, and `Decided` remain valid statuses in the canonical decision register. For example, a deferred architecture decision may have no ADR yet, or a draft ADR may remain `Proposed` while the register is `DEFERRED`.

## 4. Naming and Numbering

Use monotonically increasing four-digit numbers:

```text
ADR-0001-modular-monolith.md
ADR-0002-monorepo-strategy.md
ADR-0003-database-engine.md
```

Rules:

1. Never reuse an ADR number.
2. Number indicates creation order, not importance.
3. Use lower-case kebab-case after the number.
4. Renaming keeps the original ADR number.
5. A materially replacement decision receives a new number.
6. Do not reserve speculative numbers before an ADR is actually drafted.

## 5. When an ADR Is Required

Create an ADR when a decision is expensive to reverse, affects several domains/runtimes, changes security or reliability risk, constrains future evolution, or introduces a major provider/platform dependency.

Typical examples:

- architecture style,
- monorepo/repository strategy,
- database engine,
- managed backend/platform responsibility,
- authentication/session architecture,
- authorization implementation model,
- API contract/runtime boundary,
- background-job infrastructure,
- tenant-isolation/RLS strategy,
- hosting,
- payment/messaging providers,
- required cache/broker infrastructure,
- major state-model representation decisions.

Routine refactors, small UI-library choices, and low-impact reversible tooling usually do not need separate ADRs.

## 6. Required ADR Sections

Use this structure unless a section is genuinely irrelevant:

```markdown
# ADR-XXXX: Decision Title

## Status
Proposed

## Decision Metadata
- ADR: ADR-XXXX
- Primary Decision ID: D-...
- Related Decision IDs: ...
- Decision Owner: Open
- Technical Owner: Architecture
- Date Proposed: YYYY-MM-DD
- Date Accepted: Not accepted
- Supersedes: None
- Superseded By: None

## 1. Context
## 2. Requirements and Decision Drivers
## 3. Constraints and Assumptions
## 4. Options Considered
## 5. Evaluation
## 6. Proposed Decision / Decision
## 7. Consequences
## 8. Security and Privacy Impact
## 9. Reliability, Performance, and Scalability Impact
## 10. Operations and Observability Impact
## 11. Testing and Validation
## 12. Migration and Rollout
## 13. Reversibility
## 14. Risks and Mitigations
## 15. Open Questions
## 16. Decision Evidence
## 17. Related Documents
```

Unknown owners or evidence must be marked `Open`/`None`, not invented.

## 7. Requirement Traceability

ADRs should reference actual requirement IDs that drive the choice.

Examples:

```text
NFR-SECURITY-001
NFR-RELIABILITY-001
NFR-SCALABILITY-002
NFR-MAINTAINABILITY-006
FR-AUTHZ-001
FR-PAYMENT-005
```

Target traceability:

```text
Requirement
  -> Architecture Principle
  -> Canonical Decision ID
  -> ADR
  -> Implementation
  -> Test / Operations
```

Do not invent a requirement ID inside an ADR. If a required requirement does not exist, update the canonical requirement owner first.

## 8. Decision Workflow

```text
Canonical decision exists
  -> collect constraints/evidence
  -> draft ADR as Proposed
  -> architecture/security/product review as applicable
  -> explicit outcome
      -> Accepted
      -> Rejected
      -> remain Proposed while more evidence is needed
  -> synchronize assumptions.md
  -> update affected canonical docs
  -> implement only after the implementation gate permits it
  -> validate through tests/operations
```

A merged file, prototype, deployed package, or provisioned provider is not acceptance evidence by itself.

## 9. Acceptance Requirements

Before an ADR becomes `Accepted`:

1. its primary canonical decision ID exists,
2. relevant FR/NFR drivers are linked,
3. meaningful alternatives are documented,
4. material security/reliability/operations consequences are reviewed,
5. evidence gaps are resolved or explicitly accepted as risk,
6. a decision owner is identified,
7. explicit approval evidence is recorded,
8. `assumptions.md` is synchronized to `DECIDED`,
9. affected canonical documents are identified for update.

## 10. Supersession Rules

Do not rewrite historical rationale in an Accepted ADR when architecture changes.

To replace it:

1. create a new ADR,
2. reference the old ADR in `Supersedes`,
3. review and accept the new ADR,
4. mark the old ADR `Superseded`,
5. add `Superseded By`,
6. update the canonical decision register,
7. document migration and rollback/forward-fix implications.

Use `Deprecated` when a decision becomes irrelevant without a direct replacement.

## 11. Initial Ordered ADR Backlog

The order reflects current GymPulse dependencies. Presence in this backlog does not mean acceptance.

| Order | Decision | Canonical ID | Current Status | Reason for Order |
|---:|---|---|---|---|
| 1 | Phase 1 architecture style: modular monolith before microservices | `D-ARCH-005` | PROPOSED | Establishes decomposition assumptions before repository/runtime choices. |
| 2 | Repository/monorepo strategy | `D-ARCH-001` | PROPOSED | Determines shared source/package boundaries for clients, domain logic, and docs. |
| 3 | Canonical database engine | `D-ARCH-002` | PROPOSED | Transaction/integrity requirements affect later data and tenancy design. |
| 4 | Managed backend/platform responsibilities | `D-ARCH-014` | OPEN | May own database hosting, auth, storage, or data-layer controls and therefore affects several later choices. |
| 5 | Authentication/session architecture | `D-ARCH-004` | OPEN | Required before protected client/runtime architecture is final. |
| 6 | Member authentication method | `D-SEC-002` | OPEN | Depends on authentication architecture and product UX/security needs. |
| 7 | Authorization implementation boundary | `D-ARCH-015` | PROPOSED | Must preserve capability + tenant/resource scope independently of auth provider. |
| 8 | Data-layer tenant isolation / RLS | `D-SEC-008` | OPEN | Depends on database/managed-backend topology; defense-in-depth only. |
| 9 | Primary API contract architecture | `D-ARCH-003` | PROPOSED | Defines client/server contract shape after core trust boundaries are clear. |
| 10 | API deployment boundary | `D-ARCH-006` | OPEN | Separate from API contract style; depends on web/runtime/hosting constraints. |
| 11 | Background jobs/scheduler | `D-ARCH-007` | OPEN | Needed for no-show, renewal, notifications, reconciliation, and data quality. |
| 12 | Hosting/deployment platform | `D-ARCH-009` | OPEN | Evaluate after runtime, database, auth, and job needs are known. |
| 13 | Owner/Staff web framework | `D-ARCH-012` | PROPOSED | Next.js is a candidate, not accepted. |
| 14 | Member client framework/delivery | `D-ARCH-013` | PROPOSED | Decide responsive web/PWA vs native app according to validated member needs. |
| 15 | Package manager | `D-ARCH-011` | ASSUMED | Low-cost choice; finalize with repository/tooling decision rather than treating legacy pnpm use as fact. |
| 16 | Object storage | `D-ARCH-010` | OPEN | Required when receipts/exports/protected files need durable storage. |
| 17 | Payment provider | `D-PROVIDER-001` | OPEN | Depends on pilot payment methods, webhook/refund/reconciliation requirements. |
| 18 | Messaging provider | `D-PROVIDER-002` | OPEN | Depends on approved launch channels and consent policy. |
| 19 | Observability provider | `D-PROVIDER-006` | OPEN | Select after runtime/job/hosting topology is understood. |
| 20 | Product analytics provider | `D-PROVIDER-005` | OPEN | Non-canonical analytics can remain provider-neutral until instrumentation needs are concrete. |
| 21 | Redis/cache requirement | `D-ARCH-008` | OPEN | Decide only after measured cache/queue/coordination need exists. |
| 22 | Member vs Membership state ownership | `D-DATA-007` | PROPOSED | Resolve before canonical domain/schema/state-machine design. |

## 12. Current Foundation Gate

No ADR is accepted by this README.

The next architecture document after the foundation gate is expected to be:

```text
../02-architecture/architecture-overview.md
```

Create it only after the current architecture foundation passes consistency review.

## 13. Related Documents

- `../README.md`
- `../00-overview/assumptions.md`
- `../01-product/functional-requirements.md`
- `../01-product/non-functional-requirements.md`
- `../02-architecture/architecture-principles.md`
- legacy migration source: `../05-system-architecture.md`
- legacy migration source: `../15-engineering-workflow.md`
- legacy migration source: `../16-open-decisions.md`
