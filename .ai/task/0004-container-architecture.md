# Task 0004: C4 Container Architecture

## Goal

Create the C4 Level 2 Container Architecture for GymPulse Phase 1 while preserving unresolved deployment/provider decisions.

Target canonical document:

`docs/02-architecture/container-architecture.md`

## Inputs Read

Canonical inputs:

- `docs/README.md`
- `docs/00-overview/project-overview.md`
- `docs/00-overview/scope.md`
- `docs/00-overview/assumptions.md`
- `docs/01-product/user-roles.md`
- `docs/01-product/user-journeys.md`
- `docs/01-product/functional-requirements.md`
- `docs/01-product/non-functional-requirements.md`
- `docs/02-architecture/architecture-principles.md`
- `docs/02-architecture/architecture-overview.md`
- `docs/02-architecture/system-context.md`
- `docs/adr/README.md`

AI continuity input:

- `.ai/current-state.md`
- `.ai/README.md`

Legacy architecture/database/API/automation/payment/notification/security/engineering files remain migration inputs only and were not promoted above structured canonical documentation.

## Findings

- The C4 Level 2 model needs explicit Member Client, Owner/Staff Application, Trusted Application/API, Background Execution, Canonical Persistence, and conditional Protected Object Storage responsibilities.
- Client containers are untrusted for canonical authorization, entitlement, attendance, pricing, and payment truth.
- The Trusted Application/API boundary owns principal resolution, capability + tenant/resource authorization, application orchestration, domain rules, transaction ownership, idempotency, canonical reads/writes, and safe provider interaction.
- Background execution must share domain/application rules rather than become a second implementation of business logic.
- Canonical persistence is the protected system-of-record boundary; exact database engine remains `PROPOSED` under `D-ARCH-002`.
- `D-ARCH-006` remains explicitly open. Co-hosted web/server API and independently deployed API are both valid mappings if logical trust/domain boundaries remain intact.
- `D-ARCH-007` remains open; background-job technology is not selected.
- Redis/cache/broker infrastructure is not implied by the existence of asynchronous work.
- Payment/messaging/auth/storage/telemetry providers remain external and provider-neutral.
- Provider callbacks use provider verification rather than end-user session authorization.
- `D-DATA-007` remains unresolved and no client/component may use Member status alone as entitlement truth.

## Decisions Encountered

No decision was accepted or changed by this task.

Important referenced decisions:

- `D-ARCH-001` repository strategy: PROPOSED
- `D-ARCH-002` database engine: PROPOSED
- `D-ARCH-003` API contract architecture: PROPOSED
- `D-ARCH-004` authentication/session: OPEN
- `D-ARCH-005` modular-monolith direction: PROPOSED
- `D-ARCH-006` API deployment boundary: OPEN
- `D-ARCH-007` background jobs: OPEN
- `D-ARCH-008` Redis/cache/broker requirement: OPEN
- `D-ARCH-009` hosting: OPEN
- `D-ARCH-010` object storage: OPEN
- `D-ARCH-012` Owner/Staff framework: PROPOSED
- `D-ARCH-013` Member client/framework strategy: PROPOSED
- `D-ARCH-014` managed backend: OPEN
- `D-ARCH-015` authorization implementation: PROPOSED
- `D-SEC-002` member authentication: OPEN
- `D-SEC-008` data-layer tenant isolation/RLS: OPEN when applicable
- `D-PROVIDER-001` payment provider: OPEN
- `D-PROVIDER-002` messaging provider: OPEN
- `D-PROVIDER-005` analytics provider: OPEN
- `D-PROVIDER-006` observability provider: OPEN
- `D-DATA-007` Member vs Membership state ownership: PROPOSED

## Files Changed

Created:

- `docs/02-architecture/container-architecture.md`
- `.ai/task/0004-container-architecture.md`

Continuity/index updates for this bounded task:

- `docs/README.md`
- `.ai/current-state.md`

No product requirement, schema, API contract, provider selection, runtime topology, framework selection, or ADR acceptance was changed.

## Requirement IDs Affected

No requirement definition was changed.

The Container Architecture traces existing requirement families including:

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

Wildcards/ranges refer only to existing canonical requirement IDs.

## Result

`docs/02-architecture/container-architecture.md` now defines:

- the C4 Level 2 container-responsibility model,
- Member Client and Owner/Staff Application responsibilities,
- Trusted Application/API responsibilities,
- Background Execution responsibilities,
- Canonical Persistence and conditional Protected Object Storage boundaries,
- external authentication/payment/messaging/telemetry/import relationships,
- C4 Mermaid container diagram,
- two explicit API deployment mappings while preserving `D-ARCH-006`,
- sync/async interaction rules,
- transaction and idempotency boundaries,
- authorization enforcement for interactive requests, jobs, and provider callbacks,
- provider adapter boundaries,
- failure/degradation behavior,
- scalability/evolution rules,
- security controls,
- observability expectations,
- testing seams,
- open-decision dependencies and requirement traceability.

No Future feature was promoted and no Open/Proposed technology decision became accepted fact.

## Next Recommended Task

Task `0005-component-architecture`.

Create only:

`docs/02-architecture/component-architecture.md`

It should decompose the Trusted Application/API and Background Execution responsibilities into implementation-oriented source-code/application components, including principal resolution, tenant context, capability authorization, validation/contracts, application use cases, Phase 1 domain modules, transactions, repositories/ports, provider adapters, audit/events, idempotency, background handlers, read/query components, observability hooks, and test seams.

Do not proceed automatically to data-flow or technology-stack documentation in the same bounded task.
