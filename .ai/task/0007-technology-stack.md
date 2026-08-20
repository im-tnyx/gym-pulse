# Task 0007: Technology Stack Architecture

## Goal

Evaluate technologies that can implement the established GymPulse Phase 1 requirements and architecture without changing the logical architecture or converting unresolved decisions into accepted facts.

Target canonical document:

`docs/02-architecture/technology-stack.md`

This task is technology evaluation only. It creates no application scaffold, migration, provider account, deployment configuration, production infrastructure, or accepted ADR.

## Inputs Read

Canonical/structured repository inputs:

- `.ai/README.md` for working-context rules only
- `.ai/current-state.md`
- `.ai/task/0006-data-flow.md`
- `docs/README.md`
- `docs/00-overview/assumptions.md`
- `docs/01-product/functional-requirements.md`
- `docs/01-product/non-functional-requirements.md`
- `docs/02-architecture/architecture-principles.md`
- `docs/02-architecture/architecture-overview.md`
- `docs/02-architecture/system-context.md`
- `docs/02-architecture/container-architecture.md`
- `docs/02-architecture/component-architecture.md`
- `docs/02-architecture/data-flow.md`
- `docs/adr/README.md`

Legacy migration/evidence inputs only:

- `docs/05-system-architecture.md`
- `docs/06-database-schema.md`
- `docs/07-api-contracts.md`
- `docs/08-automations.md`
- `docs/09-payments-billing.md`
- `docs/10-notifications-whatsapp.md`
- `docs/12-security-audit.md`
- `docs/13-testing-qa.md`
- `docs/15-engineering-workflow.md`
- `docs/16-open-decisions.md`

Current official ecosystem documentation was checked where capability changes materially affect the evaluation, including TypeScript/Node.js, Next.js, Expo Camera, pnpm, PostgreSQL RLS, Drizzle, Prisma, Kysely, Supabase, pg-boss, Trigger.dev, Razorpay, Cashfree, Twilio WhatsApp, Gupshup, Render, Vercel, OpenTelemetry, Vitest, Playwright, and Testcontainers for Node.js.

Canonical structured documentation remained authoritative over legacy technology recommendations.

## Findings

- The established C4/container/component architecture can be implemented with a TypeScript/Node.js-oriented stack without changing domain ownership, but there is no canonical decision ID for the primary language/runtime yet.
- PostgreSQL remains the strongest canonical-persistence recommendation because Phase 1 depends on transactions, uniqueness, relational integrity, reporting, payment reconciliation, and optional RLS defense in depth. `D-ARCH-002` remains `PROPOSED`, not accepted.
- A monorepo remains a strong recommendation for synchronized domain/contracts/tests/docs while preserving independent deployables. `D-ARCH-001` remains `PROPOSED`.
- pnpm remains a strong workspace candidate, but `D-ARCH-011` remains `ASSUMED`.
- Next.js remains a strong Owner/Staff candidate if route/server boundaries stay thin and framework-independent application/domain code is preserved. `D-ARCH-012` remains `PROPOSED`.
- Phase 1 does not currently justify forcing a native member app. Responsive web/PWA is the recommended first pilot direction if representative QR-camera/auth/payment tests pass; Expo/React Native remains the leading native evolution candidate. `D-ARCH-013` remains `PROPOSED`.
- API contract style and API deployment topology are separate decisions. JSON HTTP with runtime-validated typed contracts remains recommended under `D-ARCH-003`; `D-ARCH-006` remains open between co-hosted and independent API deployment.
- Data access/migration tooling has no canonical decision ID. A SQL-aware typed approach is recommended, with Drizzle/Kysely leading candidates and Prisma a credible alternative subject to a real PostgreSQL/RLS/constraint spike.
- Supabase is a credible managed-platform candidate, but its PostgreSQL, Auth, Storage, RLS, Functions, Cron, and Queues capabilities must be evaluated independently. GymPulse still owns authorization, application use cases, domain rules, transaction/idempotency semantics, and provider ports.
- Authentication should use a managed provider rather than custom credential/OTP infrastructure, but staff session architecture and member verification remain open.
- Authorization remains GymPulse-owned `principal + scope + capability`, not auth-provider roles or RLS alone.
- PostgreSQL RLS is recommended as defense in depth when applicable, but privileged/service-role/background-job behavior must be designed and tested explicitly.
- For Phase 1 background work, a PostgreSQL-backed durable job/outbox approach is preferred to introducing Redis by default. pg-boss, Supabase Queues+Cron, and managed durable TypeScript task platforms are credible spike candidates. `D-ARCH-007` remains open.
- No concrete Phase 1 requirement currently justifies Redis as a baseline dependency. `D-ARCH-008` remains open with a recommendation not to add it without evidence.
- Payment provider selection remains open. Razorpay and Cashfree are credible India-focused sandbox candidates, but pilot payment methods, fees, settlement/support, refund policy, and reconciliation requirements are not confirmed. Current Razorpay documentation also makes obsolete UPI Collect assumptions unsafe for 2026 implementation planning.
- Messaging provider selection remains open until launch channels and service/marketing policy are confirmed. WhatsApp-capable BSP/provider candidates should be compared through template/webhook/delivery/retry/support evidence.
- Object storage remains conditional; no general upload/storage infrastructure should be provisioned until receipt/export/file requirements justify it.
- Observability capability requirements are clear even though the provider is open. Structured correlation, payment/job diagnostics, centralized error monitoring, and OpenTelemetry-compatible server instrumentation are recommended.
- Product analytics remains non-authoritative and can be deferred until pilot behavior/funnel questions require it.
- Core testing and CI/CD/release/secrets tooling are material technology areas but currently lack canonical decision IDs.
- Hosting should be selected after API topology, jobs, managed backend, and jurisdiction/data-residency constraints are narrowed, not before them.
- `D-DATA-007` still blocks final schema/state-machine constraints and affects queries, imports, attendance/retention/renewal semantics, authorization distinctions, and reporting definitions.

## Decisions Encountered

No canonical decision status was changed.

Important preserved states include:

- `D-ARCH-001` repository strategy: PROPOSED
- `D-ARCH-002` database engine: PROPOSED
- `D-ARCH-003` API contract architecture: PROPOSED
- `D-ARCH-004` authentication/session: OPEN
- `D-ARCH-005` architecture style: PROPOSED
- `D-ARCH-006` API deployment topology: OPEN
- `D-ARCH-007` background jobs: OPEN
- `D-ARCH-008` Redis/cache/broker: OPEN
- `D-ARCH-009` hosting: OPEN
- `D-ARCH-010` object storage: OPEN
- `D-ARCH-011` package manager: ASSUMED
- `D-ARCH-012` Owner/Staff web framework: PROPOSED
- `D-ARCH-013` member delivery/framework: PROPOSED
- `D-ARCH-014` managed backend responsibilities: OPEN
- `D-ARCH-015` authorization implementation: PROPOSED
- `D-SEC-001` jurisdiction/privacy obligations: OPEN
- `D-SEC-002` member authentication: OPEN
- `D-SEC-004` session lifecycle: OPEN
- `D-SEC-008` RLS/data-layer tenant isolation: OPEN when applicable
- `D-PROVIDER-001` payment provider: OPEN
- `D-PROVIDER-002` messaging provider: OPEN
- `D-PROVIDER-005` product analytics provider: OPEN
- `D-PROVIDER-006` observability provider: OPEN
- `D-DATA-007` Member vs Membership state ownership: PROPOSED/unresolved

No recommendation in `technology-stack.md` is acceptance evidence.

## Technology Areas Evaluated

1. Primary TypeScript/Node.js language/runtime
2. Repository/workspace strategy and Turborepo alternatives
3. pnpm package manager
4. Next.js Owner/Staff web application
5. Responsive web/PWA vs Expo/React Native/native member delivery
6. JSON HTTP typed/runtime-validated API contracts
7. Co-hosted vs independently deployed API topology
8. PostgreSQL canonical persistence
9. Drizzle/Kysely/Prisma/SQL-first data access and migrations
10. Supabase/managed-backend responsibilities by capability
11. Staff/member authentication and session architecture
12. GymPulse capability authorization
13. PostgreSQL RLS/data-layer tenant isolation
14. Durable jobs/scheduling and Postgres-backed alternatives
15. Redis/cache/broker need
16. India payment-provider requirements and Razorpay/Cashfree shortlist
17. WhatsApp/messaging provider requirements
18. Conditional protected object storage
19. Observability and OpenTelemetry-compatible instrumentation
20. Non-authoritative product analytics
21. Unit/integration/database/E2E testing stack
22. Hosting/deployment alternatives
23. CI/CD, environment separation, migration gates, and secrets

## Files Changed

Created:

- `docs/02-architecture/technology-stack.md`
- `.ai/task/0007-technology-stack.md`

Continuity/index updates required by this task:

- `docs/README.md`
- `.ai/current-state.md`

No application code, package scaffold, schema/migration, API route, provider account, deployment configuration, infrastructure, product requirement, canonical decision status, or ADR acceptance was created/changed.

## Requirement IDs Affected

No requirement definition was changed.

Technology evaluation traces existing requirement families including:

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
- `NFR-PRIVACY-*`
- `NFR-RELIABILITY-*`
- `NFR-AVAILABILITY-*`
- `NFR-PERFORMANCE-*`
- `NFR-SCALABILITY-*`
- `NFR-OBSERVABILITY-*`
- `NFR-MAINTAINABILITY-*`
- `NFR-TESTABILITY-*`
- `NFR-DATA-*`
- `NFR-OPERATIONS-*`
- `NFR-UX-*`
- `NFR-COMPATIBILITY-*`

Wildcards refer only to IDs already defined in canonical requirement documents.

## Decision Register Gaps

Material gaps identified without inventing IDs in the canonical document:

1. Primary implementation language/runtime (TypeScript/Node.js candidate), suggested `D-ARCH` family, P0.
2. Data-access/query/migration strategy, suggested `D-ARCH` or `D-DATA` family, P1.
3. Core testing toolchain baseline, suggested engineering/architecture governance, P1.
4. CI/CD and production release/secrets tooling baseline, suggested engineering/architecture/security governance, P1.

Exact runtime-validation library, formatter, lint rules, UI component library, and other lower-cost tooling were not promoted to architecture decisions without evidence.

## ADR Readiness

No ADR was created or accepted.

Recommended prerequisite:

Task 0008 should normalize the four Decision Register Gaps in `docs/00-overview/assumptions.md` and reconcile the ADR queue before implementation scaffolding.

Smallest logical first ADR batch after gap normalization:

1. `D-ARCH-005` Phase 1 architecture style
2. `D-ARCH-001` repository/workspace strategy
3. `D-ARCH-002` canonical database engine

Second dependency batch can then address managed backend, auth/session, member auth, authorization, and RLS.

Third dependency batch can address API contract/deployment, jobs, hosting, and observability.

Payment/messaging provider ADRs should wait for confirmed pilot methods/channels and provider-specific evidence.

## Result

`docs/02-architecture/technology-stack.md` now provides:

- decision-status-preserving technology evaluation,
- technology summary matrix with implementation gates,
- per-area recommendation/alternatives/tradeoffs/security/reliability/performance/scalability/operations/DX/reversibility/spike/ADR analysis,
- Phase 1 web/PWA-first member recommendation with native evolution path,
- PostgreSQL and SQL-aware persistence-tooling evaluation,
- managed-backend responsibility decomposition,
- auth/authz/RLS separation,
- durable job evaluation without assuming Redis,
- India payment and WhatsApp messaging provider scorecards,
- conditional storage posture,
- observability/analytics/testing/hosting/CI evaluation,
- decision dependency order,
- Decision Register Gap analysis,
- ADR readiness queue,
- explicit `D-DATA-007` impact,
- blocking issues and production-readiness gate,
- official ecosystem reference list dated to the evaluation.

No Open/Proposed/Assumed choice became Decided/Accepted.

## Next Recommended Task

Task `0008-technology-decision-register-normalization`.

Canonical targets:

- `docs/00-overview/assumptions.md`
- `docs/adr/README.md`

Working-context target:

- `.ai/task/0008-technology-decision-register-normalization.md`

Goal:

- add canonical decision entries for material technology gaps,
- reconcile ADR ordering/dependencies after technology evaluation,
- preserve unresolved statuses,
- prepare the first ADR batch,
- create no implementation code and accept no ADR.
