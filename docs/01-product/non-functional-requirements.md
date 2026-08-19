# GymPulse Non-Functional Requirements

## Document Control

- Status: `Draft v1.0`
- Scope: Phase 1 Operations MVP and production-readiness baseline
- Audience: Architecture, Backend, Frontend, Mobile, DevOps, Security, QA
- Parent: `product-requirements.md`

## 1. Purpose

Define measurable quality attributes and engineering constraints that apply across GymPulse capabilities.

These requirements are intentionally separated from functional behavior. They describe how reliably, securely, observably, and efficiently the product must operate.

## 2. Requirement Language

- `MUST`: release-blocking unless explicitly waived through an architecture/risk decision.
- `SHOULD`: expected production behavior; deviations require documented rationale.
- `MAY`: optional.

Where exact numerical targets depend on pilot scale or provider behavior, the requirement is marked `Proposed` or `Open` rather than fabricated.

## 3. Security

### NFR-SECURITY-001 Tenant isolation

**Status:** Confirmed

GymPulse MUST prevent users, jobs, APIs, analytics, storage access, and exports from crossing unauthorized tenant/gym/branch boundaries.

Verification must include negative authorization tests.

### NFR-SECURITY-002 Least privilege

Protected capabilities MUST follow least-privilege authorization with explicit role/capability scope.

### NFR-SECURITY-003 Server-side authorization

Authorization MUST be enforced server-side for every protected operation. Client-side hiding MUST NOT be treated as a security control.

### NFR-SECURITY-004 Secret protection

Secrets, provider credentials, signing keys, database credentials, and webhook secrets MUST NOT be committed to source control or exposed in client bundles.

### NFR-SECURITY-005 Encryption in transit

Production traffic carrying authenticated, personal, financial, or operational data MUST use transport encryption through supported secure protocols.

### NFR-SECURITY-006 Data-at-rest protection

Production databases and protected object storage SHOULD use encryption-at-rest capabilities provided by the selected infrastructure platform.

### NFR-SECURITY-007 Payment credential boundary

GymPulse MUST NOT store raw card credentials or raw UPI credentials.

### NFR-SECURITY-008 Webhook verification

Payment and other security-sensitive provider webhooks MUST be authenticated/verified before their payload can mutate canonical state.

### NFR-SECURITY-009 Auditability

Sensitive actions MUST be attributable to an actor or trusted system process with timestamp, tenant context, action, and target resource.

### NFR-SECURITY-010 Abuse controls

Authentication, verification, QR, payment-initiation, and other abuse-sensitive endpoints SHOULD support rate limiting and/or provider-appropriate abuse controls.

Exact rate limits are implementation decisions and must be documented in API/security documentation.

### NFR-SECURITY-011 Sensitive error minimization

Error responses and logs MUST NOT reveal secrets, cross-tenant identifiers, raw credentials, or unnecessary private member information.

## 4. Privacy and Data Protection

### NFR-PRIVACY-001 Data minimization

GymPulse SHOULD collect only personal information required for approved product capabilities.

### NFR-PRIVACY-002 Purpose separation

Marketing consent and service/transactional communication policy MUST remain distinct.

### NFR-PRIVACY-003 Protected exports

Data exports MUST enforce authorization scope and SHOULD be auditable.

### NFR-PRIVACY-004 Analytics minimization

General product analytics SHOULD avoid raw phone numbers, email addresses, free-text notes, payment secrets, and health-related details unless explicitly justified and protected.

### NFR-PRIVACY-005 Retention policy

**Status:** Open

Production data-retention and deletion periods MUST be documented before broad production rollout. Exact periods depend on legal/business requirements and are not inferred here.

### NFR-PRIVACY-006 Data access/deletion requests

**Status:** Proposed/Compliance dependent

The architecture SHOULD support future data export, correction, and deletion workflows without corrupting legally or operationally required financial/audit records.

## 5. Reliability and Correctness

### NFR-RELIABILITY-001 Idempotent critical mutations

Critical workflows MUST tolerate request/job/provider retries without duplicating attendance, membership extension, add-on activation, or business-stage notifications.

### NFR-RELIABILITY-002 Payment exactly-once effect

A verified successful payment MUST NOT apply its intended business effect more than once.

### NFR-RELIABILITY-003 Scheduled job retry safety

No-show scans, renewal scans, notification dispatch, owner summaries, and data-quality jobs MUST be retry-safe.

### NFR-RELIABILITY-004 Database-enforced invariants

Where practical, correctness-critical uniqueness and relational constraints SHOULD be reinforced at the database layer rather than relying only on application checks.

Examples:

- one active no-show case for a member/rule context,
- unique processed provider event,
- unique effective payment action.

### NFR-RELIABILITY-005 Canonical source of truth

Canonical attendance, payment, membership, and follow-up state MUST come from server-side system-of-record data, not client analytics events or local UI state.

### NFR-RELIABILITY-006 Timezone correctness

Gym-local day/week logic MUST use the configured gym timezone. Server machine timezone MUST NOT define business-day boundaries.

### NFR-RELIABILITY-007 Retry diagnosis

When a retry is deduplicated, the system SHOULD return or expose enough information to identify the existing canonical result where appropriate.

### NFR-RELIABILITY-008 Data reconciliation

Payment and membership state SHOULD support reconciliation after provider/network interruption without requiring destructive manual repair.

## 6. Availability and Resilience

### NFR-AVAILABILITY-001 Production dependency isolation

Failure of a non-critical integration SHOULD NOT corrupt canonical membership, attendance, or payment data.

Example: analytics delivery failure must not make attendance creation fail if analytics is not part of the business transaction.

### NFR-AVAILABILITY-002 Messaging degradation

Messaging provider failure SHOULD leave notification intent/state visible for retry or operational diagnosis rather than silently discarding the message.

### NFR-AVAILABILITY-003 Job failure visibility

Failed production jobs MUST be visible to operators and SHOULD support retry/dead-letter or equivalent recovery semantics.

### NFR-AVAILABILITY-004 Backup and restore

Production MUST have automated database backup capability and a documented restore process before production launch.

Restore procedures SHOULD be tested, not merely configured.

### NFR-AVAILABILITY-005 Recovery objectives

**Status:** Open

Formal RPO/RTO targets MUST be agreed before scaling beyond the initial pilot. The current sources do not define appropriate numerical objectives.

## 7. Performance

### NFR-PERFORMANCE-001 Check-in responsiveness

Member check-in SHOULD feel immediate under normal network conditions.

**Proposed target for engineering validation:** server processing for a normal successful check-in should typically complete within sub-second to low-single-second latency, excluding user camera scan time and severe network/provider delay.

A hard percentile SLO must be set after baseline measurement rather than fabricated now.

### NFR-PERFORMANCE-002 Staff member search

Authorized member search SHOULD return usable results quickly for pilot-scale data and MUST use indexed server-side search/filtering rather than loading all members to the client.

### NFR-PERFORMANCE-003 Owner action queues

No-show, renewal, payment-exception, and follow-up queues MUST support pagination or bounded result sets and appropriate indexes.

### NFR-PERFORMANCE-004 Dashboard efficiency

Owner dashboard summary queries SHOULD avoid N+1 query patterns and expensive full-table scans in normal operation.

### NFR-PERFORMANCE-005 Provider latency separation

Long-running external provider operations SHOULD NOT unnecessarily hold database transactions open.

### NFR-PERFORMANCE-006 Mobile payload efficiency

Member-facing APIs SHOULD avoid transferring owner-only or unrelated records and SHOULD return bounded, purpose-specific DTOs.

## 8. Scalability

### NFR-SCALABILITY-001 Multi-tenant data model

Tenant ownership MUST be explicit from Phase 1 so later multi-gym SaaS growth does not require re-identifying data ownership across the entire schema.

### NFR-SCALABILITY-002 Modular boundaries

Phase 1 SHOULD use a modular monolith or equivalent simple deployment model with domain boundaries in code before introducing distributed services.

### NFR-SCALABILITY-003 Horizontal evolution

Stateless API/application components SHOULD be designed so they can later scale horizontally without relying on process-local business state.

### NFR-SCALABILITY-004 Queueable asynchronous work

Notification dispatch, scheduled scans, reconciliation, and other retryable background work SHOULD be separable from interactive request processing.

### NFR-SCALABILITY-005 No premature microservices

Phase 1 MUST NOT require microservice decomposition merely to satisfy hypothetical scale. Service extraction requires operational evidence or a clear boundary need.

### NFR-SCALABILITY-006 Indexed tenant queries

High-volume/operational queries SHOULD index tenant/branch plus the fields used for status, date, next action, membership expiry, and attendance lookup.

## 9. Observability

### NFR-OBSERVABILITY-001 Structured logs

Production server and job logs SHOULD be structured and include a request/job correlation identifier.

### NFR-OBSERVABILITY-002 Safe operational context

Logs SHOULD include tenant/gym/branch references where operationally useful and privacy-safe, but MUST avoid secrets and unnecessary PII.

### NFR-OBSERVABILITY-003 Error monitoring

Production SHOULD capture API exceptions, web/mobile crashes, worker failures, and webhook-processing errors in centralized error monitoring.

### NFR-OBSERVABILITY-004 Payment diagnostics

Operators MUST be able to investigate:

- webhook verification failures,
- duplicate provider events,
- stuck pending payments,
- business-effect application failures,
- reconciliation attempts.

### NFR-OBSERVABILITY-005 Job diagnostics

Scheduled/background jobs MUST expose run status, failure state, tenant context, and enough metadata for diagnosis without reading raw production data unnecessarily.

### NFR-OBSERVABILITY-006 Business health signals

Production operations SHOULD expose metrics/queries for notification failures, no-show job failures, payment exceptions, and data-quality issues.

### NFR-OBSERVABILITY-007 Correlation IDs

External requests and asynchronous continuations SHOULD preserve a correlation/request identifier where practical.

## 10. Maintainability and Architecture Quality

### NFR-MAINTAINABILITY-001 Shared domain rules

Core business rules MUST NOT be duplicated independently across member app, owner web, and background workers.

### NFR-MAINTAINABILITY-002 Typed contracts

Primary TypeScript application boundaries SHOULD use shared or generated typed contracts and runtime validation at trust boundaries.

### NFR-MAINTAINABILITY-003 Provider abstraction

Payment and messaging integrations SHOULD be accessed through internal provider abstractions so domain logic does not depend on provider-specific payload shape.

### NFR-MAINTAINABILITY-004 Migration discipline

Database schema changes MUST be represented by committed migrations or equivalent auditable schema-change mechanism.

### NFR-MAINTAINABILITY-005 Documentation synchronization

A change that materially alters product behavior, architecture, API contracts, or state models SHOULD update the relevant Docs-as-Code documentation in the same change set.

### NFR-MAINTAINABILITY-006 ADR requirement

Major architecture choices MUST have an Architecture Decision Record once the ADR framework is established.

## 11. Testability

### NFR-TESTABILITY-001 Deterministic domain tests

Attendance eligibility, duplicate rules, no-show eligibility, membership state transitions, payment effects, and notification suppression SHOULD be testable without requiring full UI execution.

### NFR-TESTABILITY-002 Provider simulation

Payment and messaging provider adapters MUST support test/sandbox or simulated behavior suitable for integration tests.

### NFR-TESTABILITY-003 Failure injection

Integration tests SHOULD cover duplicate webhooks, delayed provider response, failed notification dispatch, job retry, and database conflict paths.

### NFR-TESTABILITY-004 Authorization matrix tests

The permission matrix MUST have negative and positive automated tests for critical capabilities and scopes.

### NFR-TESTABILITY-005 Time-controlled tests

Timezone/window-based logic SHOULD use injectable/testable clock abstractions where practical so expiry, renewal, and no-show edge cases can be tested deterministically.

## 12. UX and Accessibility

### NFR-UX-001 Mobile-first member experience

Member flows MUST be usable on mobile-sized screens with minimal repeated interaction.

### NFR-UX-002 Operational clarity

Owner and staff views SHOULD prioritize actionable state, clear reason codes, and recoverable errors over decorative presentation.

### NFR-UX-003 Loading/error states

Critical flows MUST define loading, success, validation-error, authorization-error, business-rule rejection, and retry states.

### NFR-ACCESSIBILITY-001 Semantic accessibility

Interactive controls SHOULD use accessible labels/semantics and keyboard/focus behavior appropriate to the target platform.

### NFR-ACCESSIBILITY-002 Contrast and error communication

UI design SHOULD provide readable contrast and must not communicate critical state using color alone.

### NFR-ACCESSIBILITY-003 Conformance target

**Status:** Open

The formal accessibility conformance target must be defined in application/UI documentation before broad release.

## 13. Compatibility

### NFR-COMPATIBILITY-001 Supported clients

**Status:** Open

The project must define supported web browsers and mobile OS versions when application stack/version choices are finalized.

### NFR-COMPATIBILITY-002 API evolution

Externally consumed API contracts SHOULD follow an explicit versioning/evolution policy before third-party integrations are enabled.

## 14. Data Integrity

### NFR-DATA-001 Opaque identifiers

Externally exposed primary identifiers SHOULD be opaque UUID/ULID-style identifiers rather than sequential IDs that leak cardinality or facilitate enumeration.

### NFR-DATA-002 Money representation

Financial amounts SHOULD use integer minor units plus currency code, not binary floating-point arithmetic.

### NFR-DATA-003 UTC event timestamps

Event timestamps SHOULD be stored in UTC while gym timezone is stored separately for business-calendar calculations.

### NFR-DATA-004 Historical integrity

Financial, attendance-correction, and follow-up history MUST remain reconstructable after later edits.

### NFR-DATA-005 Soft-delete policy

**Status:** Domain-specific/Open

Soft deletion must not be applied indiscriminately. Each domain must define whether records can be deleted, voided, archived, or must remain immutable for audit/reconciliation.

## 15. Operational Readiness

### NFR-OPERATIONS-001 Separate environments

Recommended production lifecycle MUST distinguish at least local/development, staging/test, and production data/configuration.

### NFR-OPERATIONS-002 Production secrets separation

Production credentials MUST NOT be reused casually in preview/development environments.

### NFR-OPERATIONS-003 Migration safety

Production migration plans SHOULD avoid destructive one-step changes that make rollback/forward-fix unsafe.

### NFR-OPERATIONS-004 Release smoke tests

Production releases SHOULD include smoke validation of authentication, member lookup, check-in, payment-webhook path in safe mode, and critical dashboard availability where feasible.

### NFR-OPERATIONS-005 Staff operability

The Phase 1 release is not successful if routine daily workflows require developer intervention.

## 16. Phase 1 Quality Gates

Production/pilot release should be blocked when any of the following remain unverified:

- tenant isolation on protected paths,
- duplicate attendance safety,
- duplicate payment-event safety,
- membership extension before verified payment,
- assisted attendance without actor/reason,
- job retries creating duplicate cases/messages,
- inability to diagnose failed payment webhook/job,
- dashboard metrics not reconciling with canonical records,
- missing database backup/restore plan for production.

## 17. Open Quantitative Targets

The following numerical targets require measurement or business decisions rather than assumption:

- API p95/p99 latency SLOs,
- check-in p95 target,
- availability SLO,
- RPO/RTO,
- retention duration,
- maximum tenant/member scale per deployment stage,
- rate limits,
- supported browser/mobile versions,
- notification delivery SLO.

These should become ADR/SLO decisions after the prototype and pilot environment provide real baseline data.

## 18. Traceability Examples

```text
NFR-SECURITY-001
  -> tenant isolation architecture
  -> RLS/application authorization
  -> authorization integration tests
```

```text
NFR-RELIABILITY-002
  -> payment effect ledger/constraint
  -> webhook worker
  -> duplicate callback integration tests
```

```text
NFR-OBSERVABILITY-004
  -> payment metrics/logging/tracing
  -> operations runbook
```

## 19. Related Documents

- `functional-requirements.md`
- `user-roles.md`
- `success-metrics.md`
- `../00-overview/assumptions.md`
- future `../09-security/`
- future `../10-infrastructure/`
- future `../11-observability/`
- future `../12-testing/`
