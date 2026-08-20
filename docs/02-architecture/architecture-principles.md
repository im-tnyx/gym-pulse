# GymPulse Architecture Principles

## Document Control

- Document Maturity: `Draft`
- Scope Status: `In Scope` for Phase 1 architecture
- Audience: Architecture, Backend, Frontend, Mobile, Security, DevOps, QA
- Canonical Decision Register: `../00-overview/assumptions.md`

## 1. Purpose

Define the architecture principles that shape GymPulse Phase 1 before selecting frameworks, providers, deployment platforms, or implementation libraries.

These principles are derived from confirmed product behavior and non-functional requirements. They are not technology selections.

A technology recommendation may satisfy a principle, but the recommendation remains governed by its canonical decision ID and ADR process.

## 2. Principle Format

Each principle defines:

- a stable Principle ID,
- the statement,
- why it exists,
- related requirements,
- architectural consequence,
- what it prohibits,
- exceptions or ADR requirements.

## ARCH-PRIN-001: Tenant Isolation by Design

### Statement

Every protected operation and tenant-owned record must preserve explicit organization/gym/branch ownership and authorization scope.

### Why

Cross-tenant exposure is a release-blocking security failure. Phase 1 must not rely on a future SaaS migration to discover data ownership later.

### Related requirements

- `FR-AUTHZ-001`
- `FR-CROSS-003`
- `NFR-SECURITY-001`
- `NFR-SCALABILITY-001`

### Architectural consequence

- request, job, repository, storage, export, and analytics paths carry or derive explicit tenant context,
- resource scope is independently verified rather than trusted from client input,
- data-layer defense in depth may reinforce application authorization according to `D-SEC-008`.

### Prohibits

- global unscoped tenant queries in protected flows,
- tenant authorization based only on UI filters,
- trusting client-submitted tenant IDs as authority.

### Exceptions / ADR requirement

No exception may weaken tenant isolation. Implementation mechanism changes require security review and, when material, an ADR.

## ARCH-PRIN-002: Authentication and Authorization Are Separate Responsibilities

### Statement

Authentication establishes identity. GymPulse authorization determines what that identity may access and do within tenant/resource scope.

### Why

An external authentication provider cannot safely encode the full GymPulse permission, branch, resource, and business-rule model.

### Related requirements

- `FR-IDENTITY-001`
- `FR-IDENTITY-003`
- `FR-AUTHZ-001`
- `FR-AUTHZ-002`
- `NFR-SECURITY-002`
- `NFR-SECURITY-003`

### Architectural consequence

- authenticated identity is resolved into a GymPulse principal,
- role/capability assignments and tenant/resource scope are evaluated server-side,
- auth-provider identity metadata is not the sole authorization source.

### Prohibits

- client-only authorization,
- raw mobile number as authorization proof,
- using an auth-provider role claim as unrestricted business authorization.

### Exceptions / ADR requirement

Authentication/session implementation is open under `D-ARCH-004`; member verification is open under `D-SEC-002`.

## ARCH-PRIN-003: Capability-Based Permissions

### Statement

Protected behavior should be authorized through stable named capabilities plus scope, not scattered role-name conditionals.

### Why

Owner, manager, front-desk, future trainer, and future organization roles may overlap while still requiring different authority.

### Related requirements

- `FR-AUTHZ-002`
- `FR-AUTHZ-004`
- `NFR-SECURITY-002`
- `NFR-TESTABILITY-004`

### Architectural consequence

Authorization checks should resemble:

```text
principal + tenant/resource scope + named capability -> allow / deny
```

Roles remain permission bundles, not the only runtime decision mechanism.

### Prohibits

- duplicated `if role == owner` checks across routes/screens,
- hidden UI controls being treated as security.

### Exceptions / ADR requirement

Exact authorization implementation is governed by `D-ARCH-015`.

## ARCH-PRIN-004: Deterministic Server-Side Business Truth

### Statement

Membership eligibility, attendance validity, payment truth, no-show state, balances, authorization, and other canonical business state must be determined by trusted server-side logic and canonical records.

### Why

Client state, analytics events, redirects, and UI success messages can be stale, forged, duplicated, or incomplete.

### Related requirements

- `FR-CROSS-001`
- `FR-MEMBERSHIP-004`
- `FR-PAYMENT-002`
- `NFR-RELIABILITY-005`

### Architectural consequence

Clients request operations and render authoritative results; they do not calculate final entitlement or financial state.

### Prohibits

- client-calculated membership expiry as authoritative,
- analytics events as attendance/revenue truth,
- client payment-success callback directly granting entitlement.

### Exceptions / ADR requirement

None for canonical Phase 1 business truth.

## ARCH-PRIN-005: Financial Correctness Before Convenience

### Statement

Financial side effects occur only from verified or explicitly authorized payment state, with immutable reconciliation evidence.

### Why

A duplicate, forged, or ambiguous payment flow can create financial loss and incorrect membership/add-on entitlement.

### Related requirements

- `FR-PAYMENT-002`
- `FR-PAYMENT-003`
- `FR-PAYMENT-004`
- `FR-PAYMENT-005`
- `FR-PAYMENT-006`
- `FR-PAYMENT-007`
- `FR-PAYMENT-008`
- `FR-PAYMENT-009`
- `NFR-SECURITY-007`
- `NFR-SECURITY-008`
- `NFR-RELIABILITY-002`
- `NFR-RELIABILITY-008`

### Architectural consequence

- payment provider evidence is verified at a controlled integration boundary,
- provider-event history and business-effect deduplication are separate concerns,
- refund/reversal history remains reconstructable,
- online and authorized offline payment semantics remain distinct.

### Prohibits

- generic `mark online payment paid` capability,
- storing raw card/UPI credentials,
- destructive rewriting of original payment history.

### Exceptions / ADR requirement

Payment provider selection requires its own decision/ADR under `D-PROVIDER-001`.

## ARCH-PRIN-006: Idempotent Critical Effects

### Statement

Any critical request, provider event, or background job that may be retried must be safe to replay without duplicating the business outcome.

### Why

Network retries, job retries, duplicate webhooks, and concurrent requests are normal distributed-system behavior.

### Related requirements

- `FR-ATTENDANCE-003`
- `FR-ATTENDANCE-006`
- `FR-RETENTION-005`
- `FR-PAYMENT-005`
- `FR-PAYMENT-006`
- `FR-PAYMENT-007`
- `FR-NOTIFICATION-002`
- `FR-CROSS-002`
- `NFR-RELIABILITY-001`
- `NFR-RELIABILITY-002`
- `NFR-RELIABILITY-003`

### Architectural consequence

Use stable logical keys, uniqueness constraints, effect records, transactional checks, or equivalent durable mechanisms.

### Prohibits

- process-local memory/locks as the only protection for permanent business integrity,
- retry handlers that repeat side effects blindly.

### Exceptions / ADR requirement

Implementation mechanism may vary, but any exception must prove equivalent replay safety.

## ARCH-PRIN-007: Auditable Sensitive Mutations

### Statement

Sensitive operational, financial, authorization, and configuration changes must remain attributable and reconstructable.

### Why

GymPulse must explain who changed attendance, membership, permissions, payment-related state, and retention/renewal configuration.

### Related requirements

- `FR-AUTHZ-004`
- `FR-ATTENDANCE-008`
- `FR-ATTENDANCE-010`
- `FR-ATTENDANCE-011`
- `FR-AUDIT-001`
- `FR-AUDIT-003`
- `NFR-SECURITY-009`
- `NFR-DATA-004`

### Architectural consequence

Sensitive mutation paths capture actor/system process, tenant context, target, timestamp, reason and before/after context where relevant.

### Prohibits

- silent destructive correction,
- anonymous privileged actions,
- using dashboard cleanup as a reason to erase history.

### Exceptions / ADR requirement

Retention/deletion policies remain subject to legal/business decisions, but audit integrity cannot be weakened silently.

## ARCH-PRIN-008: Gym-Local Business Time, UTC Event Time

### Statement

Event timestamps are canonical in UTC while gym-local timezone controls business-day/week semantics.

### Why

No-show thresholds, renewal stages, weekly goals, dashboards, and owner summaries depend on the gym's local calendar rather than server machine time.

### Related requirements

- `FR-CROSS-004`
- `NFR-RELIABILITY-006`
- `NFR-DATA-003`
- `NFR-TESTABILITY-005`

### Architectural consequence

- gym timezone is explicit configuration,
- local business-date calculations are centralized/testable,
- timezone-sensitive tests use controlled time.

### Prohibits

- server-local timezone as implicit business timezone,
- ambiguous date-only/timestamp behavior in critical rules.

### Exceptions / ADR requirement

No exception for Phase 1 scheduled/calendar logic.

## ARCH-PRIN-009: Explicit Domain and State Ownership

### Statement

Every canonical business state belongs to one domain concept; duplicated state across entities must not independently determine the same business truth.

### Why

Duplicated lifecycle states create contradictions and unclear write ownership.

### Related requirements

- `FR-MEMBER-004`
- `FR-MEMBERSHIP-001`
- `FR-MEMBERSHIP-002`
- `FR-MEMBERSHIP-004`
- `FR-MEMBERSHIP-006`
- `FR-RETENTION-003`
- `NFR-RELIABILITY-005`
- `NFR-MAINTAINABILITY-001`

### Architectural consequence

- domain boundaries own state transitions,
- downstream workflows consume the owning domain's canonical state,
- cross-domain derived views do not become competing write authorities.

### Current ambiguity

`FR-MEMBER-004` currently gives `Member.status` values `Active`, `Paused`, `Expired`, `Cancelled`, `Blocked`, while `Membership.status` owns `Pending`, `Active`, `Frozen`, `Expired`, `Cancelled`.

`D-DATA-007` records the proposed cleaner ownership: membership entitlement/pause/expiry belongs to `Membership`; member-level status should represent a distinct administrative/relationship state. This is not yet decided.

### Prohibits

- independent expiry/pause truth in both Member and Membership,
- state transitions written by unrelated domains without an owning contract.

### Exceptions / ADR requirement

Resolve `D-DATA-007` before canonical domain/schema state machines are finalized.

## ARCH-PRIN-010: Transactional Consistency for Correctness-Sensitive Changes

### Statement

Changes that must succeed or fail together should use one atomic transaction or an explicitly durable consistency pattern.

### Why

Attendance, payment effects, stock/session balances, and case creation can be corrupted by partial success or races.

### Related requirements

- `FR-ATTENDANCE-003`
- `FR-RETENTION-005`
- `FR-PAYMENT-006`
- `FR-PAYMENT-007`
- `FR-ADDON-007`
- `NFR-RELIABILITY-004`

### Architectural consequence

Race-sensitive invariants should be backed by transactional state and data-store constraints where practical.

### Prohibits

- check-then-insert logic with no concurrency protection for uniqueness-critical state,
- remote-provider calls unnecessarily held inside long database transactions.

### Exceptions / ADR requirement

If a workflow spans systems, use an explicit durable consistency/reconciliation design rather than pretending it is one transaction.

## ARCH-PRIN-011: Async Side Effects Are Isolated From Canonical Transactions

### Statement

Notifications, analytics, summaries, and other secondary effects should not corrupt or roll back canonical business state merely because an external dependency fails.

### Why

Provider outages are expected and should not make attendance/payment/membership state inconsistent.

### Related requirements

- `NFR-AVAILABILITY-001`
- `NFR-AVAILABILITY-002`
- `NFR-PERFORMANCE-005`
- `NFR-SCALABILITY-004`

### Architectural consequence

- commit canonical state first where safe,
- persist a durable continuation when losing the async work would violate a requirement,
- retry secondary effects independently and observably.

### Prohibits

- analytics delivery blocking successful attendance,
- message-provider latency inside long correctness-critical transactions.

### Exceptions / ADR requirement

The durable job/continuation technology is open under `D-ARCH-007`.

## ARCH-PRIN-012: Provider Abstraction at Integration Boundaries

### Statement

Provider-specific SDKs, payloads, identifiers, and failure semantics are translated into stable GymPulse application/domain contracts at integration boundaries.

### Why

Payments, messaging, storage, analytics, observability, and authentication providers may change and expose different semantics.

### Related requirements

- `NFR-MAINTAINABILITY-003`
- `NFR-TESTABILITY-002`
- `FR-PAYMENT-003`
- `FR-NOTIFICATION-003`

### Architectural consequence

Core business logic depends on internal ports/contracts rather than provider data structures.

### Prohibits

- provider webhook payloads becoming domain entities,
- provider SDK calls scattered through business logic.

### Exceptions / ADR requirement

Provider selections require explicit decisions; no provider is accepted by this principle.

## ARCH-PRIN-013: Failure Visibility and Reconciliation

### Statement

Critical failures must be diagnosable and recoverable without destructive manual repair.

### Why

Payment ambiguity, failed jobs, notification outages, and inconsistent imported data are operational realities.

### Related requirements

- `NFR-RELIABILITY-007`
- `NFR-RELIABILITY-008`
- `NFR-AVAILABILITY-002`
- `NFR-AVAILABILITY-003`
- `NFR-OBSERVABILITY-004`
- `NFR-OBSERVABILITY-005`

### Architectural consequence

Critical workflows expose stable identifiers, state, retry/reconciliation paths, and operator-visible failure diagnostics.

### Prohibits

- silent job failure,
- state repair by deleting financial/audit records,
- infinite blind retries for permanent errors.

### Exceptions / ADR requirement

None for production-critical Phase 1 flows.

## ARCH-PRIN-014: Observability by Design

### Statement

Requests, jobs, provider events, and critical business effects must be traceable through structured operational telemetry designed with the workflow.

### Why

Production correctness cannot be defended if payment, job, webhook, or tenant failures cannot be investigated.

### Related requirements

- `NFR-OBSERVABILITY-001`
- `NFR-OBSERVABILITY-002`
- `NFR-OBSERVABILITY-003`
- `NFR-OBSERVABILITY-004`
- `NFR-OBSERVABILITY-005`
- `NFR-OBSERVABILITY-007`

### Architectural consequence

Use correlation/request/job identifiers and structured safe context across synchronous and asynchronous boundaries.

### Prohibits

- relying on ad-hoc console output as the production diagnostic model,
- logging secrets or unnecessary PII for convenience.

### Exceptions / ADR requirement

Observability provider remains open under `D-PROVIDER-006`.

## ARCH-PRIN-015: Data Minimization and Purpose Separation

### Statement

Collect, expose, log, export, and retain only data required for approved capabilities and approved purposes.

### Why

Member contact, attendance, payment metadata, follow-up notes, and future fitness/health data have different sensitivity and purpose boundaries.

### Related requirements

- `NFR-PRIVACY-001`
- `NFR-PRIVACY-002`
- `NFR-PRIVACY-003`
- `NFR-PRIVACY-004`
- `NFR-PRIVACY-005`
- `FR-CONSENT-001`
- `FR-CONSENT-002`

### Architectural consequence

- marketing and service communication remain separate,
- analytics avoids unnecessary direct identifiers/free text,
- exports are scope-limited and auditable,
- future health data requires separate requirements/security design.

### Prohibits

- collecting detailed health data because storage is available,
- copying internal notes into general analytics,
- one global consent flag for unrelated purposes.

### Exceptions / ADR requirement

Retention/deletion/jurisdiction decisions remain open under `D-SEC-001`, `D-SEC-005`, and `D-SEC-006`.

## ARCH-PRIN-016: Secure Defaults and Least Privilege

### Statement

The default architecture should deny unnecessary access, keep secrets server-side, make protected storage private, and require explicit elevation for sensitive actions.

### Why

Security controls fail when optional hardening is deferred until launch.

### Related requirements

- `NFR-SECURITY-002`
- `NFR-SECURITY-004`
- `NFR-SECURITY-005`
- `NFR-SECURITY-006`
- `NFR-SECURITY-011`
- `FR-AUDIT-001`

### Architectural consequence

- server credentials never enter client bundles,
- production/staging credentials are separate,
- protected objects use authorized access,
- sensitive actions use named capabilities and audit.

### Prohibits

- shared root/service credentials in client code,
- public-by-default protected member files,
- broad wildcard permissions without explicit need.

### Exceptions / ADR requirement

Any deliberate reduction in a security control requires documented risk acceptance.

## ARCH-PRIN-017: Modular Monolith Before Microservices

### Statement

Phase 1 should preserve explicit modules/domain boundaries in one simple application architecture before introducing network-distributed services.

### Why

The pilot needs correctness, speed of change, and operational simplicity more than hypothetical independent service scaling.

### Related requirements

- `NFR-SCALABILITY-002`
- `NFR-SCALABILITY-005`
- `NFR-MAINTAINABILITY-001`
- `NFR-TESTABILITY-001`

### Architectural consequence

- modules own business rules and data mutations,
- deployment boundaries may evolve later without rewriting domain semantics,
- internal boundaries are enforced in code even when processes/databases are shared.

### Prohibits

- one microservice per domain solely for anticipated scale,
- business logic embedded only in framework/UI code.

### Exceptions / ADR requirement

This principle is `Proposed` pending formal architecture-style decision `D-ARCH-005`. Service extraction requires an Accepted ADR with measured or security/ownership justification.

## ARCH-PRIN-018: No Premature Infrastructure

### Statement

Do not add caches, brokers, distributed locks, separate services, or other infrastructure until a concrete requirement or measured bottleneck justifies them.

### Why

Each infrastructure dependency adds deployment, failure, security, cost, local-development, and operational complexity.

### Related requirements

- `NFR-SCALABILITY-005`
- `NFR-PERFORMANCE-002`
- `NFR-PERFORMANCE-003`
- `NFR-PERFORMANCE-004`

### Architectural consequence

Prefer correct indexing, bounded queries, transactions, and simple durable mechanisms before introducing additional infrastructure.

### Prohibits

- Redis as a default architecture assumption,
- event broker because domain events exist,
- microservices to solve organization problems that do not yet exist.

### Exceptions / ADR requirement

Material new infrastructure requires evidence and an ADR. Redis requirement remains open under `D-ARCH-008`.

## ARCH-PRIN-019: Evolution Through Explicit Decisions

### Statement

Major architecture and provider commitments must evolve through canonical decisions and ADRs rather than becoming facts through implementation drift.

### Why

Legacy GymPulse documents contain strong recommendations such as PostgreSQL, Next.js, Expo, Turborepo, pnpm, and managed-platform options. Recommendations are useful evidence, not approval.

### Related requirements

- `NFR-MAINTAINABILITY-005`
- `NFR-MAINTAINABILITY-006`

### Architectural consequence

- canonical decision status remains in `../00-overview/assumptions.md`,
- rationale/history lives in `../adr/`,
- accepted decisions trigger updates to dependent docs and tests.

### Prohibits

- treating package presence, prototype use, or legacy prose as acceptance,
- silently changing Open/Proposed decisions to facts.

### Exceptions / ADR requirement

No exception for major architecture commitments.

## 3. Principle-to-Requirement Traceability Summary

| Principle | Primary Requirement Drivers |
|---|---|
| `ARCH-PRIN-001` | `FR-AUTHZ-001`, `FR-CROSS-003`, `NFR-SECURITY-001`, `NFR-SCALABILITY-001` |
| `ARCH-PRIN-002` | `FR-IDENTITY-001`, `FR-IDENTITY-003`, `FR-AUTHZ-001`, `NFR-SECURITY-003` |
| `ARCH-PRIN-003` | `FR-AUTHZ-002`, `FR-AUTHZ-004`, `NFR-TESTABILITY-004` |
| `ARCH-PRIN-004` | `FR-CROSS-001`, `FR-MEMBERSHIP-004`, `FR-PAYMENT-002`, `NFR-RELIABILITY-005` |
| `ARCH-PRIN-005` | `FR-PAYMENT-002..009`, `NFR-RELIABILITY-002`, `NFR-SECURITY-007..008` |
| `ARCH-PRIN-006` | `FR-ATTENDANCE-006`, `FR-PAYMENT-005..007`, `FR-NOTIFICATION-002`, `NFR-RELIABILITY-001..003` |
| `ARCH-PRIN-007` | `FR-AUDIT-001`, `FR-AUDIT-003`, `FR-ATTENDANCE-010`, `NFR-SECURITY-009` |
| `ARCH-PRIN-008` | `FR-CROSS-004`, `NFR-RELIABILITY-006`, `NFR-DATA-003`, `NFR-TESTABILITY-005` |
| `ARCH-PRIN-009` | `FR-MEMBER-004`, `FR-MEMBERSHIP-002`, `FR-RETENTION-003`, `NFR-RELIABILITY-005` |
| `ARCH-PRIN-010` | `FR-ATTENDANCE-003`, `FR-RETENTION-005`, `FR-PAYMENT-006..007`, `NFR-RELIABILITY-004` |
| `ARCH-PRIN-011` | `NFR-AVAILABILITY-001..002`, `NFR-PERFORMANCE-005`, `NFR-SCALABILITY-004` |
| `ARCH-PRIN-012` | `NFR-MAINTAINABILITY-003`, `NFR-TESTABILITY-002` |
| `ARCH-PRIN-013` | `NFR-RELIABILITY-007..008`, `NFR-AVAILABILITY-003`, `NFR-OBSERVABILITY-004..005` |
| `ARCH-PRIN-014` | `NFR-OBSERVABILITY-001..007` |
| `ARCH-PRIN-015` | `NFR-PRIVACY-001..006`, `FR-CONSENT-001..002` |
| `ARCH-PRIN-016` | `NFR-SECURITY-002`, `NFR-SECURITY-004..006`, `NFR-SECURITY-011` |
| `ARCH-PRIN-017` | `NFR-SCALABILITY-002`, `NFR-SCALABILITY-005`, `NFR-MAINTAINABILITY-001` |
| `ARCH-PRIN-018` | `NFR-SCALABILITY-005`, `NFR-PERFORMANCE-002..004` |
| `ARCH-PRIN-019` | `NFR-MAINTAINABILITY-005..006` |

Ranges in this table are shorthand for requirement IDs that already exist in the canonical requirement documents; no new requirement IDs are introduced here.

## 4. Architecture Foundation Gate

Before the next architecture document is treated as valid:

- no principle may promote a Future capability into Phase 1,
- no principle may accept an Open/Proposed technology decision,
- `D-DATA-007` remains explicit until Member vs Membership state ownership is decided,
- canonical decision IDs come from `../00-overview/assumptions.md`,
- legacy architecture files remain migration evidence only.

If these checks remain true, the next bounded architecture task is:

```text
architecture-overview.md
```

## 5. Related Documents

- `../README.md`
- `../00-overview/project-overview.md`
- `../00-overview/scope.md`
- `../00-overview/assumptions.md`
- `../01-product/functional-requirements.md`
- `../01-product/non-functional-requirements.md`
- `../01-product/user-roles.md`
- `../adr/README.md`
- legacy migration source: `../05-system-architecture.md`
- legacy migration source: `../12-security-audit.md`
