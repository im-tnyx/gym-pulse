# GymPulse Architecture Principles

## Document Control

- Status: `Draft v1.0`
- Scope: Phase 1 Operations MVP with forward compatibility for later GymPulse domains
- Audience: Architecture, Backend, Frontend, Mobile, Security, DevOps, QA
- Source inputs: `../00-overview/`, `../01-product/`, legacy `../05-system-architecture.md`, and `../16-open-decisions.md`

## 1. Purpose

Define the architectural rules that all GymPulse implementation decisions must follow unless an accepted ADR explicitly supersedes them.

These principles are not provider selections. They describe how the system must be shaped so product behavior remains secure, testable, auditable, and evolvable.

## 2. Requirement Drivers

The principles primarily support:

- `FR-AUTHZ-001` tenant-scoped authorization
- `FR-AUTHZ-002` named capability enforcement
- `FR-MEMBERSHIP-004` server-side membership eligibility
- `FR-ATTENDANCE-003` exactly one canonical attendance record
- `FR-ATTENDANCE-006` retry safety
- `FR-RETENTION-005` single active no-show case
- payment and renewal idempotency requirements in `functional-requirements.md`
- security, reliability, observability, performance, privacy, and testability NFRs

## 3. Principle AP-001: Modular Monolith Before Microservices

**Status:** Proposed, pending ADR acceptance.

Phase 1 should be implemented as a modular monolith with explicit domain boundaries rather than as a distributed microservice system.

### Why

GymPulse must first prove product workflows such as attendance, retention, renewal, payment, and staff operations. Splitting these capabilities across network services too early would add deployment, tracing, consistency, retry, and operational complexity before scale requires it.

### Implementation implications

- domain modules must be explicit in code,
- modules communicate through stable application interfaces,
- business rules are not placed inside UI components or HTTP route handlers,
- domain events may be used internally without requiring a distributed broker,
- later service extraction should preserve existing domain contracts.

### Extraction trigger

A domain should become a separate deployable service only when there is measured need such as independent scaling, security isolation, operational ownership, integration volume, or deployment cadence.

## 4. Principle AP-002: Server Owns Business Truth

Canonical business state must be calculated and validated on trusted server-side code.

Clients may request an action, but must not decide:

- tenant scope,
- membership eligibility,
- payment success,
- attendance validity,
- renewal effective dates,
- stock/session balances,
- no-show eligibility,
- authorization.

A client showing a payment-success screen is not proof that the payment succeeded.

## 5. Principle AP-003: Explicit Domain Boundaries

Phase 1 must preserve explicit boundaries for at least:

```text
Identity & Authorization
Members
Plans & Memberships
Attendance
Retention & Follow-up
Renewals & Payments
Add-ons
Notifications
Operational Analytics
Audit & Data Quality
```

Future domains such as Workouts, Nutrition, Health, Progress, Coaching, AI, and SaaS Subscriptions must integrate through defined contracts rather than becoming unrelated logic inside Phase 1 modules.

## 6. Principle AP-004: Multi-Tenant Scope Is a First-Class Invariant

Tenant isolation is not an optional later SaaS enhancement.

The conceptual hierarchy is:

```text
Platform
  -> Organization
      -> Gym
          -> Branch
              -> Staff / Members / Operational Data
```

For a single-gym pilot these levels may be one-to-one, but tenant context must remain explicit.

### Rules

- protected operations derive or verify scope server-side,
- repository/query interfaces receive tenant context,
- background jobs carry tenant context,
- object storage paths are tenant-scoped,
- analytics events preserve tenant identifiers without unnecessary PII,
- database RLS may provide defense in depth if the selected platform supports it.

## 7. Principle AP-005: Authorization Uses Capabilities, Not Scattered Role Checks

Code should ask whether a principal has a named permission within a scope.

Preferred concept:

```ts
requirePermission(principal, "attendance.checkin.assisted", scope)
```

Avoid distributed logic such as:

```ts
if (user.role === "owner") { ... }
```

Roles remain useful as permission bundles, but application behavior must depend on capabilities and scope.

## 8. Principle AP-006: Idempotency for Every Critical Business Effect

Any operation that may be retried must tolerate retries without duplicating the business effect.

Mandatory examples:

- QR check-in,
- assisted attendance mutation,
- payment webhook processing,
- membership renewal application,
- add-on activation,
- scheduled renewal-stage notification,
- no-show case creation,
- import batches where retry is possible.

Use stable idempotency keys, provider event IDs, unique constraints, effect ledgers, or equivalent durable mechanisms. In-memory locks alone are insufficient.

## 9. Principle AP-007: Database Constraints Protect Invariants

Application checks are necessary but are not enough for race-sensitive invariants.

Where practical, PostgreSQL constraints/indexes should protect:

- unique canonical identifiers,
- valid foreign-key relationships,
- valid date ranges,
- one active no-show case per member/rule context,
- unique provider event processing,
- unique applied payment effect,
- non-negative balances where representable safely.

The database is a defense layer, not a replacement for domain validation.

## 10. Principle AP-008: Auditability Over Destructive Convenience

Material operational history must remain reconstructable.

Examples:

- attendance correction,
- membership changes,
- freeze changes,
- payment state interventions,
- refunds/reversals,
- follow-up corrections,
- role/permission changes,
- configuration changes affecting risk or renewal behavior.

Hard deletion should not be the default correction mechanism for auditable business records.

## 11. Principle AP-009: Provider Integrations Are Adapters

Payment, messaging, storage, analytics, and future biometric/wearable providers must be isolated behind internal interfaces.

Provider-specific payloads should be converted into canonical internal models at the integration boundary.

Example:

```text
Provider Webhook
  -> verify authenticity
  -> map provider payload
  -> canonical payment event
  -> domain handler
```

This prevents provider SDK types from becoming domain entities.

## 12. Principle AP-010: Background Work Must Be Durable and Observable

Critical scheduled and asynchronous work must not depend on a client being open or on an unobservable best-effort cron.

Jobs must support:

- retry safety,
- tenant scope,
- deterministic deduplication,
- failure visibility,
- correlation IDs,
- staging/production separation.

The exact job runner remains an open architecture decision (`D-ARCH-007`).

## 13. Principle AP-011: UTC Storage, Gym-Local Business Time

Event timestamps should be persisted in UTC.

Gym timezone must be stored explicitly and used for domain concepts such as:

- today's dashboard,
- business date,
- no-show daily scan,
- renewal reminder timing,
- weekly goals,
- owner closing summary.

Server machine timezone must never silently define gym-local behavior.

## 14. Principle AP-012: Money Uses Integer Minor Units

Currency values should avoid binary floating-point representation.

Recommended canonical representation:

```text
amount_minor: bigint/integer
currency: ISO-style currency code
```

Example:

```text
INR 1,299.00 -> 129900 paise
```

Commercial snapshots must be preserved where later plan edits could otherwise change historical meaning.

## 15. Principle AP-013: Stable Contracts at Boundaries

HTTP/API contracts, background-job payloads, provider adapters, and domain interfaces should be explicitly versionable and validated.

Boundary data must use typed validation rather than trusting TypeScript compile-time types alone.

Avoid passing raw database rows directly to external clients when a stable response DTO is more appropriate.

## 16. Principle AP-014: Observability Is Part of the Design

Production-critical flows require telemetry designed at implementation time.

Minimum correlation dimensions:

- request/correlation ID,
- job ID,
- tenant/gym/branch identifier where safe,
- resource/business object ID,
- provider event/reference where safe.

Do not log raw secrets, credentials, full payment payloads, or sensitive notes.

## 17. Principle AP-015: Security and Privacy Are Cross-Cutting

Every architecture layer must consider:

- authentication,
- authorization,
- tenant isolation,
- secret boundaries,
- data minimization,
- sensitive logging,
- export/delete access,
- protected object storage,
- abuse/rate limits,
- auditability.

Security is not postponed to a final hardening sprint.

## 18. Principle AP-016: Deterministic Logic and AI Must Stay Separate

Future AI capabilities must not become the source of truth for:

- membership entitlement,
- attendance validity,
- payment state,
- financial totals,
- authorization,
- medical facts.

AI may summarize, recommend, explain, or assist within permission-aware context. Deterministic domain logic remains authoritative.

## 19. Principle AP-017: Prefer Operational Simplicity Until Evidence Demands Complexity

Do not add infrastructure only because it is common in large systems.

Examples:

- Redis is not required until a real caching/coordination need exists (`D-ARCH-008`),
- a distributed event broker is not required for Phase 1,
- microservices are not the default,
- offline attendance should not be implemented unless pilot connectivity requires it (`D-PROD-010`).

## 20. Principle AP-018: Architecture Decisions Must Be Recorded

Major decisions require ADRs before being treated as final.

At minimum:

- monorepo strategy,
- database selection,
- API deployment architecture,
- authentication strategy,
- managed backend selection,
- job runner,
- payment provider,
- hosting platform,
- event architecture if it becomes distributed,
- AI model/runtime strategy when AI enters active scope.

A recommendation in a design document remains `Proposed` or `Assumed` until accepted through the project decision process.

## 21. Architecture Quality Gate

A Phase 1 implementation is not architecture-complete if any of the following are true:

- tenant scope is trusted from the client without verification,
- payment initiation extends membership,
- duplicate webhook delivery can duplicate membership entitlement,
- attendance retry can create duplicate check-ins,
- business rules are duplicated independently across web/mobile clients,
- sensitive staff actions cannot be attributed,
- background jobs are not diagnosable,
- provider-specific models leak throughout domain code,
- canonical financial or attendance metrics depend on client analytics events.

## 22. Related Documents

- `../01-product/functional-requirements.md`
- `../01-product/non-functional-requirements.md`
- `architecture-overview.md`
- `system-context.md`
- `container-architecture.md`
- `component-architecture.md`
- `data-flow.md`
- `technology-stack.md`
- `../adr/README.md`
- `../00-overview/assumptions.md`
