# Task 0005: Component Architecture

## Goal

Create the C4 Level 3-style component architecture for the Trusted Application/API and Background Execution responsibilities in GymPulse Phase 1.

Target canonical document:

`docs/02-architecture/component-architecture.md`

## Inputs Read

Canonical inputs:

- `docs/README.md`
- `docs/00-overview/assumptions.md`
- `docs/02-architecture/architecture-overview.md`
- `docs/02-architecture/system-context.md`
- `docs/02-architecture/container-architecture.md`
- existing Phase 1 functional/non-functional requirement families referenced by those architecture documents

AI continuity input:

- `.ai/current-state.md`

Legacy flat documents remain migration inputs only. No legacy technology recommendation was promoted to accepted architecture.

## Findings

- The Trusted Application/API and Background Execution responsibilities can be decomposed into stable implementation-oriented components without choosing frameworks/providers.
- Authentication evidence, GymPulse principal resolution, tenant/resource scope, capability authorization, contract validation, and domain business rules are distinct responsibilities.
- Application command handlers should own cross-domain orchestration and transaction boundaries rather than routes/controllers or repositories.
- Domain modules should own their canonical state and state transitions; cross-domain direct writes should be prohibited by design.
- Request idempotency and domain/business-effect uniqueness are separate protections.
- Payment provider adapters should verify/normalize evidence but must not directly grant membership/add-on entitlement.
- Notification intent/policy should remain separate from provider delivery adapters.
- Workers should execute the same application/domain rules as interactive requests and must not duplicate business logic.
- Background system actors still require explicit tenant/gym scope and bounded job semantics.
- Read/query components may join domains but remain non-authoritative for writes.
- A testable gym-local business clock should support no-show, renewal, weekly-goal, QR-expiry, and summary logic.
- `D-DATA-007` remains unresolved, so entitlement-sensitive logic must not use `Member.status` alone.

## Decisions Encountered

No decision was accepted or changed by this task.

Important referenced decisions remain:

- `D-ARCH-001` repository strategy: PROPOSED
- `D-ARCH-002` database engine: PROPOSED
- `D-ARCH-003` API contract architecture: PROPOSED
- `D-ARCH-004` authentication/session: OPEN
- `D-ARCH-005` modular-monolith direction: PROPOSED
- `D-ARCH-006` API deployment boundary: OPEN
- `D-ARCH-007` background jobs: OPEN
- `D-ARCH-008` cache/broker requirement: OPEN
- `D-ARCH-009` hosting: OPEN
- `D-ARCH-010` object storage: OPEN
- `D-ARCH-011` package manager: ASSUMED
- `D-ARCH-012` Owner/Staff web framework: PROPOSED
- `D-ARCH-013` member client delivery/framework: PROPOSED
- `D-ARCH-014` managed backend: OPEN
- `D-ARCH-015` authorization implementation: PROPOSED
- `D-SEC-002` member authentication: OPEN
- `D-SEC-008` data-layer tenant isolation/RLS: OPEN when applicable
- `D-PROVIDER-001` payment provider: OPEN
- `D-PROVIDER-002` messaging provider: OPEN
- `D-PROVIDER-005` product analytics provider: OPEN
- `D-PROVIDER-006` observability provider: OPEN
- `D-DATA-007` Member vs Membership state ownership: PROPOSED

## Files Changed

Created:

- `docs/02-architecture/component-architecture.md`
- `.ai/task/0005-component-architecture.md`

Continuity/index updates for this bounded task:

- `docs/README.md`
- `.ai/current-state.md`

No application code, schema, API contract, infrastructure, provider selection, or ADR acceptance was changed.

## Requirement IDs Affected

No requirement definition was changed.

The component architecture traces existing families including:

- `FR-IDENTITY-*`
- `FR-AUTHZ-*`
- `FR-MEMBER-*`
- `FR-MEMBERSHIP-*`
- `FR-ATTENDANCE-*`
- `FR-MOTIVATION-*`
- `FR-RETENTION-*`
- `FR-FOLLOWUP-*`
- `FR-RETURN-*`
- `FR-RENEWAL-*`
- `FR-PAYMENT-*`
- `FR-RECEIPT-*`
- `FR-ADDON-*`
- `FR-DASHBOARD-*`
- `FR-NOTIFICATION-*`
- `FR-CONSENT-*`
- `FR-AUDIT-*`
- `FR-SUMMARY-*`
- `FR-DATA-QUALITY-*`
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

Wildcards refer only to existing canonical requirement IDs.

## Result

`docs/02-architecture/component-architecture.md` now defines:

- C4 Level 3-style component decomposition,
- explicit dependency direction,
- transport and provider-callback entry components,
- request/background execution context,
- authentication verification and GymPulse principal resolution,
- tenant/resource scope and capability authorization,
- contract/domain validation separation,
- command/query handlers,
- Phase 1 domain-module ownership,
- cross-domain write restrictions,
- Unit of Work/transaction ownership,
- request idempotency vs business-effect dedupe,
- repository/data-access ports,
- operational read/query components,
- payment verification/normalization boundary,
- notification intent/policy vs provider delivery boundary,
- audit/event/durable-continuation components,
- business clock/gym-time component,
- scheduler/job entry/retry/background handlers,
- representative QR, payment, and notification component flows,
- failure propagation,
- observability hooks,
- testing seams,
- conceptual packaging guidance without accepting repository/tooling decisions.

No Future feature was promoted and no Open/Proposed technology decision became accepted fact.

## Next Recommended Task

Task `0006-data-flow`.

Create only:

`docs/02-architecture/data-flow.md`

It should trace the major Phase 1 end-to-end flows across actors, client/container/component boundaries, canonical persistence, providers, transactions, idempotency, retries, audit, and durable asynchronous continuation. It must remain technology/provider neutral and must not proceed to technology-stack evaluation in the same bounded task.
