# Task 0006: Architecture Data Flows

## Goal

Create the technology-neutral end-to-end data-flow architecture for GymPulse Phase 1.

Target canonical document:

`docs/02-architecture/data-flow.md`

## Inputs Read

Canonical inputs:

- `docs/README.md`
- `docs/00-overview/assumptions.md`
- `docs/01-product/user-journeys.md`
- `docs/01-product/functional-requirements.md`
- `docs/01-product/non-functional-requirements.md`
- `docs/02-architecture/architecture-principles.md`
- `docs/02-architecture/architecture-overview.md`
- `docs/02-architecture/system-context.md`
- `docs/02-architecture/container-architecture.md`
- `docs/02-architecture/component-architecture.md`
- `docs/adr/README.md`

AI continuity input:

- `.ai/current-state.md`

Legacy files remain migration inputs only and were not promoted above the structured canonical documents.

## Findings

- The component model is sufficiently stable to trace Phase 1 behavior without selecting implementation technologies.
- Request idempotency, job dedupe, provider-event dedupe, and payment business-effect uniqueness must remain separate protections.
- External provider calls cannot be part of a local atomic transaction and therefore require explicit state/retry/reconciliation behavior.
- Background flows require explicit tenant/gym scope, deterministic execution identity, current-state reload, retry classification, and failure visibility.
- Renewal reminder creation and actual message dispatch are separate moments because stale business conditions/preferences must be rechecked before sending.
- Payment checkout initialization and verified payment application are separate flows; client-facing success never grants entitlement.
- Read models and data-quality components may inspect several domains but may not become cross-domain write authorities.
- `D-DATA-007` affects attendance, no-show, renewal, import, dashboard, and data-quality flows because Member and Membership status ownership remains unresolved.

## Decisions Encountered

No decision was accepted or changed by this task.

Important decisions preserved:

- `D-ARCH-004` authentication/session: OPEN
- `D-ARCH-005` modular-monolith direction: PROPOSED
- `D-ARCH-006` API deployment boundary: OPEN
- `D-ARCH-007` background jobs: OPEN
- `D-ARCH-008` cache/broker requirement: OPEN
- `D-ARCH-015` authorization implementation boundary: PROPOSED
- `D-SEC-002` member authentication: OPEN
- `D-SEC-008` data-layer tenant isolation/RLS: OPEN when applicable
- `D-PROVIDER-001` payment provider: OPEN
- `D-PROVIDER-002` messaging provider: OPEN
- `D-PROVIDER-005` product analytics provider: OPEN
- `D-PROVIDER-006` observability provider: OPEN
- `D-DATA-007` Member vs Membership state ownership: PROPOSED

## Files Changed

Created:

- `docs/02-architecture/data-flow.md`
- `.ai/task/0006-data-flow.md`

Continuity/index updates:

- `docs/README.md`
- `.ai/current-state.md`

No product requirement, schema, API contract, provider selection, runtime topology, or ADR acceptance was changed.

## Flows Documented

1. Authentication + tenant/resource authorization
2. QR check-in
3. Assisted attendance
4. Daily no-show/inactivity scan
5. Staff follow-up + member return resolution
6. Renewal-stage reminder scan
7. Renewal order + payment checkout initialization
8. Verified payment webhook + exactly-once entitlement effect
9. Notification dispatch + delivery callback
10. Pilot member import
11. Owner dashboard / operational read-model query
12. Data-quality scan + resolution

Cross-flow sections also define transaction boundaries, idempotency matrix, retry classification, reconciliation, audit boundaries, observability/correlation, gym-local time, security/privacy, deployment neutrality, and derived test scenarios.

## Requirement IDs Affected

No requirement definition was changed.

The data-flow architecture traces existing requirement families including:

- `FR-IDENTITY-*`
- `FR-AUTHZ-*`
- `FR-MEMBER-*`
- `FR-MEMBERSHIP-*`
- `FR-ATTENDANCE-*`
- `FR-RETENTION-*`
- `FR-FOLLOWUP-*`
- `FR-RETURN-*`
- `FR-RENEWAL-*`
- `FR-PAYMENT-*`
- `FR-RECEIPT-*`
- `FR-NOTIFICATION-*`
- `FR-CONSENT-*`
- `FR-IMPORT-*`
- `FR-DASHBOARD-*`
- `FR-DATA-QUALITY-*`
- `FR-AUDIT-*`
- `FR-CROSS-*`
- `NFR-SECURITY-*`
- `NFR-RELIABILITY-*`
- `NFR-AVAILABILITY-*`
- `NFR-PERFORMANCE-*`
- `NFR-SCALABILITY-*`
- `NFR-OBSERVABILITY-*`
- `NFR-MAINTAINABILITY-*`
- `NFR-TESTABILITY-*`
- `NFR-DATA-*`

Wildcards refer only to IDs already defined in canonical requirement documents.

## Result

`docs/02-architecture/data-flow.md` now provides an implementation-neutral trace of critical Phase 1 control/data movement across actors, clients, trusted components, workers, canonical persistence, and providers.

It preserves:

- server-side authorization,
- explicit tenant scope,
- transaction ownership,
- idempotency/dedupe layers,
- verified provider boundaries,
- exactly-once payment effects,
- durable async continuation,
- retry/reconciliation,
- audit/history integrity,
- observability/correlation,
- gym-local business time,
- domain write ownership,
- read-model non-authority,
- unresolved architecture decisions.

No Future capability was promoted and no Open/Proposed technology decision became accepted fact.

## Next Recommended Task

Task `0007-technology-stack`.

Create only:

`docs/02-architecture/technology-stack.md`

The document should evaluate candidate technologies against the approved requirements and current architecture. It should cover language/runtime, repository/workspace, web/member clients, API style/topology, persistence/data-access, managed backend responsibilities, authentication, authorization, jobs, payments, messaging, object storage, observability, analytics, testing, hosting, and cache/broker need.

Every recommendation must retain its canonical decision status and ADR dependency. Do not mark a technology Accepted merely because it is recommended or appears in legacy planning.
