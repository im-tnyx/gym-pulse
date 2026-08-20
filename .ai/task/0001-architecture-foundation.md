# Task 0001: Architecture Foundation

## Goal

Establish a minimal, technology-neutral architecture foundation on `main` without redesigning the product, starting implementation, scaffolding application code, creating database migrations/APIs, or generating the full architecture set.

## Inputs Read

Canonical/main:

```text
README.md
docs/README.md

docs/00-overview/project-overview.md
docs/00-overview/vision.md
docs/00-overview/goals.md
docs/00-overview/scope.md
docs/00-overview/glossary.md
docs/00-overview/assumptions.md

docs/01-product/product-requirements.md
docs/01-product/personas.md
docs/01-product/user-roles.md
docs/01-product/user-journeys.md
docs/01-product/feature-catalog.md
docs/01-product/functional-requirements.md
docs/01-product/non-functional-requirements.md
docs/01-product/success-metrics.md
```

Legacy migration inputs:

```text
docs/05-system-architecture.md
docs/06-database-schema.md
docs/07-api-contracts.md
docs/08-automations.md
docs/09-payments-billing.md
docs/10-notifications-whatsapp.md
docs/12-security-audit.md
docs/13-testing-qa.md
docs/15-engineering-workflow.md
docs/16-open-decisions.md
```

## Findings

1. Structured `00-overview/` and `01-product/` documents are the canonical foundation; legacy flat files remain useful migration sources.
2. Root `README.md` still presented legacy flat files as the primary documentation map.
3. `docs/README.md` used one broad `Status` vocabulary for document maturity, scope, decision state, and requirement confidence.
4. Legacy architecture/engineering files contain strong technology recommendations, including older `Accepted recommendations` wording, while canonical decisions remain Open/Proposed/Assumed.
5. `Member.status` and `Membership.status` duplicate entitlement-like states and create unclear state ownership.
6. Canonical assumptions lacked several architecture decisions that existed only in legacy `D-*` inventory, including package manager, web framework, member client framework, managed backend, and explicit authorization implementation boundary.
7. Phase 1 architecture is driven primarily by tenant isolation, server-side/capability authorization, deterministic canonical state, idempotency, financial correctness, auditability, timezone correctness, provider boundaries, retry/reconciliation, and no premature distributed infrastructure.

## Decisions Encountered

No Open/Proposed technology was accepted.

Canonical decision inventory was expanded/normalized with:

```text
D-ARCH-011  package manager
D-ARCH-012  Owner/Staff web framework
D-ARCH-013  Member client/framework strategy
D-ARCH-014  managed backend/platform responsibilities
D-ARCH-015  authorization implementation boundary
D-SEC-008   data-layer tenant isolation/RLS strategy
D-DATA-007  Member vs Membership state ownership
```

Legacy architecture IDs were mapped to canonical IDs in `docs/00-overview/assumptions.md`.

## Files Changed

Created:

```text
.ai/README.md
.ai/current-state.md
.ai/task/0001-architecture-foundation.md
docs/adr/README.md
docs/02-architecture/architecture-principles.md
```

Updated:

```text
README.md
docs/README.md
docs/00-overview/assumptions.md
```

No legacy file was deleted or marked Deprecated.

## Requirement IDs Affected

No requirement ID was added, deleted, or renumbered.

Architecture traceability and the state-ownership ambiguity primarily involve:

```text
FR-IDENTITY-001
FR-IDENTITY-003
FR-AUTHZ-001..004
FR-MEMBER-002
FR-MEMBER-004
FR-MEMBERSHIP-001..007
FR-ATTENDANCE-003
FR-ATTENDANCE-006
FR-ATTENDANCE-008
FR-ATTENDANCE-010..011
FR-RETENTION-003
FR-RETENTION-005
FR-PAYMENT-002..009
FR-NOTIFICATION-002..004
FR-CONSENT-001..002
FR-AUDIT-001..003
FR-CROSS-001..004

NFR-SECURITY-001..011
NFR-PRIVACY-001..006
NFR-RELIABILITY-001..008
NFR-AVAILABILITY-001..003
NFR-PERFORMANCE-002..005
NFR-SCALABILITY-001..005
NFR-OBSERVABILITY-001..007
NFR-MAINTAINABILITY-001..006
NFR-TESTABILITY-001..005
NFR-DATA-003..005
```

## Open Questions

- Should `FR-MEMBER-004` be revised so Member status no longer duplicates membership entitlement states?
- What exact administrative/member-record states should replace or refine `Active/Paused/Expired/Cancelled/Blocked` if `D-DATA-007` is approved?
- Which architecture decisions should be accepted first after architecture overview clarifies boundaries?
- Who is the decision owner for P0 architecture/security decisions?

## Result

Architecture Foundation Gate passes the intended constraints:

- no Future feature promoted into Phase 1,
- no technology/provider was accepted,
- no application code/API/migration created,
- architecture principles trace to existing FR/NFR IDs,
- ADR governance exists,
- `.ai/` is explicitly non-canonical,
- root documentation navigation now points to structured canonical docs,
- Member vs Membership state ambiguity is explicitly recorded rather than silently resolved.

## Next Recommended Task

Create only:

```text
docs/02-architecture/architecture-overview.md
```

The architecture overview should define system boundaries, architectural drivers, logical layers/modules, trust boundaries, synchronous vs asynchronous responsibilities, and open decision dependencies without selecting unresolved technologies.
