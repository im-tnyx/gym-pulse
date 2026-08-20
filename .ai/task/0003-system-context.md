# Task 0003: C4 System Context

## Goal

Create the technology-neutral C4 Level 1 System Context for GymPulse Phase 1.

Target canonical document:

`docs/02-architecture/system-context.md`

## Inputs Read

Canonical inputs:

- `docs/README.md`
- `docs/00-overview/project-overview.md`
- `docs/00-overview/scope.md`
- `docs/00-overview/assumptions.md`
- `docs/01-product/personas.md`
- `docs/01-product/user-roles.md`
- `docs/01-product/user-journeys.md`
- `docs/01-product/functional-requirements.md`
- `docs/01-product/non-functional-requirements.md`
- `docs/02-architecture/architecture-principles.md`
- `docs/02-architecture/architecture-overview.md`
- `docs/adr/README.md`

AI continuity input:

- `.ai/current-state.md`
- `.ai/README.md`

Legacy migration inputs were used only as previously audited supporting evidence where relevant. They remain non-canonical migration sources.

## Findings

- The active Phase 1 human actors are Member, Owner, Manager, and Front Desk Staff.
- A complete Trainer/Coach application and platform-level roles remain Future and must not appear as active Phase 1 actors.
- GymPulse can be modeled as one black-box operational system at C4 Level 1 while keeping internal runtime/container decisions unresolved.
- External identity proof does not replace GymPulse capability + tenant/resource authorization.
- Payment-provider evidence must cross a verification and idempotency boundary before it changes canonical payment/entitlement state.
- Messaging providers deliver approved notification intent but do not own business eligibility, consent policy, or conversion truth.
- Protected object storage and telemetry are supporting external systems, not canonical business-state authorities.
- Pilot import data is untrusted onboarding input until validation/reconciliation completes.
- Tenant scope remains explicit even if the first pilot contains one organization/gym/branch.
- `D-DATA-007` remains unresolved and therefore Member status cannot independently establish entitlement truth.

## Decisions Encountered

No decision was accepted or changed by this task.

Context-sensitive decisions include:

- `D-ARCH-004` authentication/session: OPEN
- `D-SEC-002` member authentication: OPEN
- `D-ARCH-014` managed backend responsibilities: OPEN
- `D-ARCH-015` authorization implementation boundary: PROPOSED
- `D-SEC-008` data-layer tenant isolation/RLS: OPEN when applicable
- `D-PROVIDER-001` payment provider: OPEN
- `D-PROVIDER-002` messaging provider: OPEN
- `D-ARCH-010` object storage: OPEN
- `D-PROVIDER-005` product analytics provider: OPEN
- `D-PROVIDER-006` observability provider: OPEN
- `D-DATA-007` Member vs Membership state ownership: PROPOSED

Runtime/container decisions such as database engine, API deployment, job runner, hosting, repository strategy, web/member frameworks, package manager, and Redis remain unresolved/proposed and were not selected here.

## Files Changed

Created:

- `docs/02-architecture/system-context.md`
- `.ai/task/0003-system-context.md`

Continuity/index updates for this bounded task:

- `docs/README.md`
- `.ai/current-state.md`

No product requirement, provider selection, runtime topology, schema, API contract, or ADR acceptance was changed.

## Requirement IDs Affected

No requirement definition was changed.

The System Context traces existing requirements including:

- `FR-IDENTITY-*`
- `FR-AUTHZ-*`
- `FR-MEMBER-*`
- `FR-MEMBERSHIP-*`
- `FR-ATTENDANCE-*`
- `FR-RETENTION-*`
- `FR-FOLLOWUP-*`
- `FR-RENEWAL-*`
- `FR-PAYMENT-*`
- `FR-ADDON-*`
- `FR-DASHBOARD-*`
- `FR-NOTIFICATION-*`
- `FR-CONSENT-*`
- `FR-AUDIT-*`
- `FR-IMPORT-*`
- `FR-CROSS-*`
- `NFR-SECURITY-*`
- `NFR-PRIVACY-*`
- `NFR-RELIABILITY-*`
- `NFR-AVAILABILITY-*`
- `NFR-OBSERVABILITY-*`
- `NFR-MAINTAINABILITY-*`
- `NFR-DATA-*`

Wildcards refer only to existing canonical requirement IDs.

## Result

`docs/02-architecture/system-context.md` now defines:

- the GymPulse black-box Phase 1 system boundary,
- active human actors and their trust/authorization boundaries,
- future actors explicitly excluded from Phase 1,
- authentication, payment, messaging, storage, telemetry, and import-source relationships,
- C4 Level 1 Mermaid context diagram,
- actor and external-system relationship matrices,
- check-in, assisted attendance, retention, renewal/payment, notification, and owner-operation information flows,
- trust rules for human/client/provider/import/telemetry input,
- canonical state ownership at the system boundary,
- tenant/scope and time context,
- dependency-failure/degradation expectations,
- security/privacy context controls,
- open-decision dependencies and requirement traceability.

No Future feature was promoted and no Open/Proposed technology decision became accepted fact.

## Next Recommended Task

Task `0004-container-architecture`.

Create only:

`docs/02-architecture/container-architecture.md`

It should provide C4 Level 2 decomposition of GymPulse into logical/deployable containers while preserving the System Context boundary and keeping unresolved API deployment, job-runtime, database, framework, hosting, managed-backend, and provider decisions explicit.
