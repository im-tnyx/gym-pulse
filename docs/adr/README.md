# GymPulse Architecture Decision Records

## Document Control

- Document Maturity: `Draft`
- Scope: Architecture decision governance
- Canonical Decision Register: `../00-overview/assumptions.md`

## 1. Purpose

`docs/adr/` is the canonical home for Architecture Decision Records (ADRs) in GymPulse.

An ADR records one material technical decision, why it exists, the evidence and constraints considered, alternatives, the selected outcome when accepted, and the consequences of that outcome.

A technology appearing in a legacy architecture, schema, API, engineering document, or technology-evaluation document does **not** make it an accepted architectural decision.

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

`Deferred`, `Blocked`, `Open`, `Assumed`, `Proposed`, and `Decided` remain valid statuses in the canonical decision register. A draft ADR may remain `Proposed` while its canonical decision is still `OPEN`, `PROPOSED`, `DEFERRED`, or another non-decided state.

## 4. Naming and Numbering

Use monotonically increasing four-digit numbers:

```text
ADR-0001-modular-monolith.md
ADR-0002-primary-language-runtime.md
ADR-0003-monorepo-strategy.md
ADR-0004-database-engine.md
ADR-0005-data-access-migration-strategy.md
ADR-0006-managed-backend-responsibilities.md
ADR-0007-authentication-session-architecture.md
ADR-0008-member-authentication-method.md
ADR-0009-authorization-implementation.md
ADR-0010-data-layer-tenant-isolation-rls.md
ADR-0011-api-contract-architecture.md
ADR-0012-owner-staff-web-framework.md
ADR-0013-member-client-strategy.md
ADR-0014-api-deployment-boundary.md
ADR-0015-background-jobs-scheduler.md
ADR-0016-hosting-deployment-platform.md
ADR-0017-ci-cd-release-secrets.md
ADR-0018-testing-toolchain.md
ADR-0019-package-manager.md
ADR-0020-observability-provider.md
ADR-0021-object-storage.md
ADR-0022-payment-provider.md
ADR-0023-messaging-provider.md
ADR-0024-product-analytics-provider.md
ADR-0025-redis-cache-requirement.md
ADR-0026-member-membership-state-ownership.md
```

Rules:

1. Never reuse an ADR number.
2. Number indicates creation order, not importance.
3. Use lower-case kebab-case after the number.
4. Renaming keeps the original ADR number.
5. A material replacement decision receives a new number.
6. Do not reserve speculative numbers before an ADR is actually drafted.

`ADR-0001` through `ADR-0026` now exist.

## 5. When an ADR Is Required

Create an ADR when a decision is expensive to reverse, affects several domains/runtimes, changes security or reliability risk, constrains future evolution, or introduces a major provider/platform dependency.

Typical examples:

- architecture style,
- primary implementation language/runtime,
- monorepo/repository strategy,
- database engine,
- data-access/migration strategy when it materially constrains persistence,
- managed backend/platform responsibility,
- authentication/session architecture,
- authorization implementation model,
- API contract/runtime boundary,
- Owner/Staff or Member application framework when it materially constrains runtime/security/deployment,
- background-job infrastructure,
- tenant-isolation/RLS strategy,
- hosting,
- payment/messaging providers,
- required cache/broker infrastructure,
- major state-model representation decisions,
- production release/secrets architecture when it creates material provider/security coupling.

Routine refactors, small UI-library choices, formatter/lint preferences, and low-impact reversible tooling usually do not need separate ADRs.

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

A decision-specific ADR may expand this structure when the subject requires additional explicit sections, while preserving the same governance information.

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

A merged file, prototype, deployed package, provisioned provider, or technology recommendation is not acceptance evidence by itself.

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

## 11. Technology-Evaluation Normalization

Task `0007-technology-stack` identified four material decisions that previously had no canonical IDs. Task `0008-technology-decision-register-normalization` registered them in `../00-overview/assumptions.md` without approving any candidate:

```text
D-ARCH-016  Primary implementation language/runtime
D-ARCH-017  Data-access/query/migration strategy
D-ARCH-018  Core automated testing toolchain
D-ARCH-019  CI/CD + production release/secrets tooling
```

Their registration means ADRs can reference canonical IDs. It does not mean TypeScript/Node.js, Drizzle/Kysely/Prisma, Vitest/Playwright, GitHub Actions, or any other candidate is accepted.

## 12. Current ADR Index

| ADR | Primary Decision | ADR Status | Canonical Status | Summary |
|---|---|---|---|---|
| `ADR-0001-modular-monolith.md` | `D-ARCH-005` | Accepted | DECIDED | Phase 1 modular monolith with explicit domain/application/component boundaries. Authorized by `santosh` on 2026-09-29; approval: GitHub Issue #1. |
| `ADR-0002-primary-language-runtime.md` | `D-ARCH-016` | Accepted | DECIDED | Strict TypeScript with a supported Node.js LTS runtime category is accepted; exact versions/frameworks/providers remain separate. Approval: GitHub Issue #1. |
| `ADR-0003-monorepo-strategy.md` | `D-ARCH-001` | Accepted | DECIDED | Explicit monorepo with deliberate application/package boundaries and independently buildable artifacts is accepted; concrete tooling remains separate. Approval: GitHub Issue #1. |
| `ADR-0004-database-engine.md` | `D-ARCH-002` | Accepted | DECIDED | PostgreSQL is the canonical transactional database engine; provider/version/data-access/RLS/recovery/schema decisions remain separate. Approval: GitHub Issue #1. |
| `ADR-0005-data-access-migration-strategy.md` | `D-ARCH-017` | Proposed | PROPOSED | Proposes a Drizzle-oriented SQL-transparent persistence direction with explicit transactions and committed migrations; no tool is accepted. |
| `ADR-0006-managed-backend-responsibilities.md` | `D-ARCH-014` | Proposed | OPEN | Proposes selective managed infrastructure adoption by capability; no managed provider or direct-client DB topology is accepted. |
| `ADR-0007-authentication-session-architecture.md` | `D-ARCH-004` | Proposed | OPEN | Proposes managed authentication as a category with provider-independent GymPulse Principal resolution and server-mediated session posture. |
| `ADR-0008-member-authentication-method.md` | `D-SEC-002` | Proposed | OPEN | Proposes managed phone OTP/passwordless for routine Member verification with separate tenant-aware Member claiming/linking. |
| `ADR-0009-authorization-implementation.md` | `D-ARCH-015` | Proposed | PROPOSED | Proposes GymPulse-owned application authorization using named capabilities, trusted scopes/resources, Member-self relationships, and deny-by-default behavior. |
| `ADR-0010-data-layer-tenant-isolation-rls.md` | `D-SEC-008` | Proposed | OPEN | Proposes mandatory application authorization plus explicit tenant-scoped queries and selective tenant-focused PostgreSQL RLS as defense in depth; PostgreSQL is accepted under ADR-0004, while RLS itself remains unaccepted. No RLS policy, role, migration, provider, or direct-client access is accepted. |
| `ADR-0011-api-contract-architecture.md` | `D-ARCH-003` | Proposed | PROPOSED | Proposes a versioned JSON-over-HTTPS resource/action contract with runtime trust-boundary schemas, explicit DTO separation, RFC 9457-compatible machine errors, cursor-first pagination, critical-mutation idempotency, verified webhook boundaries, and optional derived OpenAPI. No framework/validator/generator/deployment topology is accepted. |
| `ADR-0012-owner-staff-web-framework.md` | `D-ARCH-012` | Proposed | PROPOSED | Proposes Next.js App Router + React for the Owner/Staff web presentation while keeping application/domain/security logic framework-independent, preserving ADR-0011 as the independently consumable contract, and leaving API deployment/hosting/tooling separately governed. |
| `ADR-0013-member-client-strategy.md` | `D-ARCH-013` | Proposed | PROPOSED | Proposes responsive browser-first Member delivery, OS-camera HTTPS QR entry, optional progressive PWA capabilities, and evidence-triggered future native evolution while preserving ADR-0011 and server-owned business truth. |
| `ADR-0014-api-deployment-boundary.md` | `D-ARCH-006` | Proposed | OPEN | Proposes co-hosted-first trusted HTTP/API deployment with thin framework adapters, stable ADR-0011 contracts, separate durable background execution, and an explicit future API-extraction seam. |
| `ADR-0015-background-jobs-scheduler.md` | `D-ARCH-007` | Proposed | OPEN | Proposes a PostgreSQL-backed durable queue/scheduler behind a Durable Continuation port, separate worker runtime, same-transaction enqueue when possible, business-level idempotency, and transactional outbox only when crossing to an external task system; pg-boss is a leading candidate now that PostgreSQL and the TypeScript/Node runtime category are accepted; the job technology itself remains unaccepted. |
| `ADR-0016-hosting-deployment-platform.md` | `D-ARCH-009` | Proposed | OPEN | Proposes a conventional regional managed service/worker PaaS with separate request and worker services, one approved primary region, explicit residency/security gates, and provider portability; Render is a leading candidate only if validation passes. |
| `ADR-0017-ci-cd-release-secrets.md` | `D-ARCH-019` | Proposed | OPEN | Proposes release-security capabilities before vendor binding: protected PR/required checks, traceable source/build/deploy identity, controlled environment promotion and migration, least-privilege/OIDC-preferred deployment identity, runtime-vs-migration secret separation, coordinated web/worker rollout, and rollback/forward-fix discipline; GitHub Actions is the leading candidate only. |
| `ADR-0018-testing-toolchain.md` | `D-ARCH-018` | Proposed | PROPOSED | Proposes layered automated-test evidence: Vitest as the leading fast TypeScript runner, real PostgreSQL semantics (the engine is accepted under ADR-0004) with Testcontainers-style orchestration as the leading candidate, focused Playwright browser E2E, provider fakes/sandboxes, first-class authorization/tenant negatives, worker replay/idempotency tests, and controlled time/failure injection. No tool, test, config, database, browser, or CI workflow is accepted or created. |
| `ADR-0019-package-manager.md` | `D-ARCH-011` | Proposed | ASSUMED | Proposes pnpm as the leading Phase 1 package-manager direction with one committed root lockfile, explicit workspace dependencies, frozen CI installs, strict declared-dependency posture, package-manager version pinning, and reviewed dependency build scripts. pnpm, Turborepo, Node.js, CI tooling, frameworks, and exact versions remain unaccepted. |
| `ADR-0020-observability-provider.md` | `D-PROVIDER-006` | Proposed | OPEN | Proposes Grafana Cloud as the leading managed observability provider with GymPulse-owned telemetry semantics, privacy-safe structured logs/correlation, OpenTelemetry server traces/metrics, focused alerting, and optional privacy-gated frontend telemetry. No provider, region, SDK, credential, dashboard, or telemetry pipeline is accepted or provisioned. |
| `ADR-0021-object-storage.md` | `D-ARCH-010` | Proposed | OPEN | Defers persistent object storage because current Phase 1 evidence does not require persisted binary artifacts; preserves a conditional private/provider-neutral protected-object architecture with canonical ownership metadata, server-authorized short-lived access, explicit lifecycle/residency gates, and no provider acceptance or provisioning. |
| `ADR-0022-payment-provider.md` | `D-PROVIDER-001` | Proposed | OPEN | Keeps Razorpay and Cashfree as the bounded Phase 1 sandbox shortlist while defining provider-managed browser checkout, server-owned amount/currency/purpose, raw webhook verification, normalized canonical payment state, separate event dedupe/business-effect uniqueness, reconciliation, refund/settlement boundaries, and provider exit. Production selection remains blocked by merchant/settlement ownership and business/commercial validation. |
| `ADR-0023-messaging-provider.md` | `D-PROVIDER-002` | Proposed | OPEN | Defers production messaging-provider selection because launch channels, sender/WABA ownership, consent/service policy, and validation remain unresolved; preserves Direct Meta, Twilio, and Gupshup as a bounded WhatsApp comparison set behind GymPulse-owned notification policy, tenant-safe template/sender mapping, stale-state suppression, business-stage dedupe, and provider-observed delivery truth. |
| `ADR-0024-product-analytics-provider.md` | `D-PROVIDER-005` | Proposed | OPEN | Defers external product analytics for the initial Phase 1 pilot because core KPIs are derivable from canonical records; preserves a minimal provider-neutral behavioral-event vocabulary for concrete future questions, with pseudonymous identity, tenant-safe context, explicit property allowlists, and no autocapture/session replay baseline. PostHog, Mixpanel, and Amplitude remain future candidates only. |
| `ADR-0025-redis-cache-requirement.md` | `D-ARCH-008` | Proposed | OPEN | Defers Redis/Valkey as a Phase 1 baseline because no shared low-latency ephemeral-state requirement is demonstrated; preserves indexed/bounded database reads, durable database-backed correctness/jobs, no distributed authorization cache baseline, separately governed sessions/rate limits, and evidence-triggered narrow future cache/coordination adoption. |
| `ADR-0026-member-membership-state-ownership.md` | `D-DATA-007` | Proposed | PROPOSED / unresolved | Proposes Membership as the sole time-bounded entitlement owner and a distinct Member administrative/relationship axis, recommending `Enabled / Blocked / Archived` for review while keeping FR-MEMBER-004 unchanged until explicit approval. No schema, migration, enum/type, API, test, or production behavior is created. |

Foundation ADR-0001 through ADR-0004 are `Accepted`; all other ADR statuses remain independently governed.

## 13. Ordered ADR Backlog

The order reflects current GymPulse dependency reasoning. Presence in this backlog does not mean acceptance. The first twenty-six ADRs have now been drafted; later ADR numbers are assigned only when a file is actually created.

| Order | Decision | Canonical ID | Current Status | Reason for Order |
|---:|---|---|---|---|
| 1 | Phase 1 architecture style: modular monolith before microservices | `D-ARCH-005` | DECIDED / ADR-0001 Accepted | Establishes decomposition/state-ownership boundaries. |
| 2 | Primary implementation language/runtime | `D-ARCH-016` | DECIDED / ADR-0002 Accepted | Cross-cuts web, API, jobs, providers, tests, and deployment. |
| 3 | Repository/monorepo strategy | `D-ARCH-001` | DECIDED / ADR-0003 Accepted | Determines source/package boundaries while preserving independent deployables. |
| 4 | Canonical database engine | `D-ARCH-002` | DECIDED / ADR-0004 Accepted | Persistence capabilities underpin transactions, constraints, reconciliation, and tenant isolation. |
| 5 | Data-access/query/migration strategy | `D-ARCH-017` | PROPOSED / ADR-0005 drafted | Defines transaction/query/migration mechanics while keeping provider/RLS/schema decisions separate. |
| 6 | Managed backend/platform responsibilities | `D-ARCH-014` | OPEN / ADR-0006 drafted | Defines managed commodity boundaries without surrendering application/domain/security ownership. |
| 7 | Authentication/session architecture | `D-ARCH-004` | OPEN / ADR-0007 drafted | Establishes identity/session boundary before authorization and provider binding. |
| 8 | Member authentication method | `D-SEC-002` | OPEN / ADR-0008 drafted | Proposes routine verification while separating Member claiming/recovery/authorization. |
| 9 | Authorization implementation boundary | `D-ARCH-015` | PROPOSED / ADR-0009 drafted | Defines application-owned capability + trusted scope/resource authorization. |
| 10 | Data-layer tenant isolation / RLS | `D-SEC-008` | OPEN / ADR-0010 drafted | Proposes independent tenant-row defense in depth beneath mandatory application authorization; PostgreSQL-specific RLS remains conditional. |
| 11 | Primary API contract architecture | `D-ARCH-003` | PROPOSED / ADR-0011 drafted | Defines a runtime-validated JSON HTTP contract independently of framework/deployment while preserving stable errors, idempotency, pagination, and webhook trust boundaries. |
| 12 | Owner/Staff web framework | `D-ARCH-012` | PROPOSED / ADR-0012 drafted | Proposes a staff operational web framework while preserving thin framework boundaries, API-contract independence, application authorization, and deployment optionality. |
| 13 | Member client framework/delivery | `D-ARCH-013` | PROPOSED / ADR-0013 drafted | Proposes browser-first delivery with progressive PWA/native escalation governed by target-device and product evidence. |
| 14 | API deployment boundary | `D-ARCH-006` | OPEN / ADR-0014 drafted | Proposes co-hosted-first request serving with explicit extraction seam, stable ADR-0011 transport, and separate worker responsibility. |
| 15 | Background jobs/scheduler | `D-ARCH-007` | OPEN / ADR-0015 drafted | Proposes Postgres-backed durable jobs/scheduling with separate workers, transactional handoff, explicit retry/dead-letter behavior, and no Redis baseline. |
| 16 | Hosting/deployment platform | `D-ARCH-009` | OPEN / ADR-0016 drafted | Proposes a conventional regional managed service/worker PaaS with separate runtime units and an explicit jurisdiction/region/provider-validation gate. |
| 17 | CI/CD + production release/secrets tooling | `D-ARCH-019` | OPEN / ADR-0017 drafted | Proposes protected CI/release gates, provenance, environment promotion, secret boundaries, one controlled migration action, web/worker rollout coordination, and rollback/forward-fix while leaving the CI vendor unaccepted. |
| 18 | Core testing toolchain | `D-ARCH-018` | PROPOSED / ADR-0018 drafted | Proposes layered deterministic, authorization, real-database, provider/worker, contract, and focused browser evidence while keeping exact tools unaccepted. |
| 19 | Package manager | `D-ARCH-011` | ASSUMED / ADR-0019 drafted | Proposes pnpm for deterministic workspace installation while keeping the canonical decision unaccepted. |
| 20 | Observability provider | `D-PROVIDER-006` | OPEN / ADR-0020 drafted | Proposes Grafana Cloud with provider-neutral server telemetry semantics while keeping canonical provider selection open. |
| 21 | Object storage | `D-ARCH-010` | OPEN / ADR-0021 drafted | Defers baseline persistent storage; future private protected-object storage is introduced only when a confirmed artifact requirement justifies it. |
| 22 | Payment provider | `D-PROVIDER-001` | OPEN / ADR-0022 drafted | Keeps Razorpay + Cashfree as a sandbox shortlist; production selection remains blocked by merchant/settlement ownership, pilot methods, business policy, sandbox correctness, commercial terms, and support evidence. |
| 23 | Messaging provider | `D-PROVIDER-002` | OPEN / ADR-0023 drafted | Defers provider selection until launch channels, sender/WABA ownership, consent/service policy, callback security, pricing/support, and tenant-isolation evidence are resolved. |
| 24 | Product analytics provider | `D-PROVIDER-005` | OPEN / ADR-0024 drafted | Defers an external provider for the initial pilot; canonical KPIs stay in GymPulse records and behavioral instrumentation is introduced only for a concrete question with privacy/identity/tenant/exit validation. |
| 25 | Redis/cache requirement | `D-ARCH-008` | OPEN / ADR-0025 drafted | Defers Redis/Valkey for Phase 1; introduce shared ephemeral state only after a measured cache, distributed rate-limit, session, job, realtime, or coordination requirement survives database/platform alternatives. |
| 26 | Member vs Membership state ownership | `D-DATA-007` | PROPOSED / ADR-0026 drafted | Proposes Membership-owned entitlement and distinct Member administrative/relationship state; FR-MEMBER-004 and schema remain unchanged until explicit approval. |

## 14. ADR Batch Readiness

No ADR is accepted by this README.

### First foundation batch

```text
D-ARCH-005  Phase 1 architecture style               ADR-0001 Accepted / DECIDED
D-ARCH-016  Primary implementation language/runtime  ADR-0002 Accepted / DECIDED
D-ARCH-001  Repository/workspace strategy            ADR-0003 Accepted / DECIDED
D-ARCH-002  Canonical database engine                ADR-0004 Accepted / DECIDED
```

These four foundation architecture categories are now authorized and synchronized. They do not accept downstream tooling/providers or make GymPulse production-ready.

#### Foundation acceptance-readiness review — updated 2026-09-29

Fresh review uses each ADR's own acceptance/validation sections plus the canonical decision register and the completed shared validation evidence under `validation/foundation/`.

This review does not approve or reject any ADR.

| ADR | Canonical status | Reviewable now | Acceptance readiness | Current evidence / remaining blockers |
|---|---|---|---|---|
| `ADR-0001` / `D-ARCH-005` | DECIDED | Yes | **Accepted** | Authorized owner `santosh` accepted the modular-monolith category on 2026-09-29 via GitHub Issue #1. Production-scale boundary enforcement and observability/provider implementation remain downstream work. |
| `ADR-0002` / `D-ARCH-016` | DECIDED | Yes | **Accepted** | Authorized owner `santosh` accepted strict TypeScript + supported Node.js LTS category on 2026-09-29 via GitHub Issue #1. Exact versions/frameworks/providers remain separate. |
| `ADR-0003` / `D-ARCH-001` | DECIDED | Yes | **Accepted** | Authorized owner `santosh` explicitly accepted the monorepo strategy despite documented partial implementation evidence; package manager/orchestrator/CI/final graph remain separate. |
| `ADR-0004` / `D-ARCH-002` | DECIDED | Yes | **Accepted** | Authorized owner `santosh` accepted PostgreSQL as the canonical transactional database engine after bounded real-PostgreSQL evidence. Provider/version/RLS/data-access/recovery/schema remain separate. |

Executed validation evidence is recorded in:

```text
validation/foundation/EVIDENCE.md
validation/foundation/postgres/
```

Current cross-batch findings:

```text
Decision Owner = santosh
Authorized review completed = 2026-09-29
Approval Evidence = GitHub Issue #1

ADR-0001 Accepted / D-ARCH-005 DECIDED
ADR-0002 Accepted / D-ARCH-016 DECIDED
ADR-0003 Accepted / D-ARCH-001 DECIDED
ADR-0004 Accepted / D-ARCH-002 DECIDED

Real PostgreSQL Stage 3 = PASS
Real PostgreSQL Stage 6 = PASS
PostgreSQL validation cleanup = PASS

ADR-0001 technical evidence advanced
ADR-0002 technical evidence advanced
ADR-0003 evidence unchanged by PostgreSQL work
ADR-0004 bounded technical database-engine evidence complete

foundation canonical status synchronization is complete
foundation architecture category gate is partially opened
overall production implementation gate remains closed
```

Acceptance-readiness must not be confused with implementation completion.

The PostgreSQL environment blocker is resolved and the **Foundation Decision-Owner Review Packet** at `foundation-decision-owner-review-packet.md` is synchronized with the authorized review. Owner `santosh` accepted ADR-0001 through ADR-0004 on 2026-09-29; approval evidence is GitHub Issue #1. The next bounded governance action must be derived from the remaining unresolved decision batches.

### Second dependency/security batch

```text
D-ARCH-017  Data-access/query/migration strategy      PROPOSED / ADR-0005 drafted
D-ARCH-014  Managed backend responsibilities          OPEN / ADR-0006 drafted
D-ARCH-004  Authentication/session                    OPEN / ADR-0007 drafted
D-SEC-002   Member authentication                     OPEN / ADR-0008 drafted
D-ARCH-015  Authorization implementation              PROPOSED / ADR-0009 drafted
D-SEC-008   RLS/data-layer tenant isolation           OPEN / ADR-0010 drafted
```

`ADR-0010` preserves:

```text
Application Authorization = Mandatory
Data-Layer Tenant Isolation = Defense in Depth
RLS != Complete Authorization System
```

Its leading direction is conditional on PostgreSQL later being accepted: retain explicit tenant-scoped SQL and add selective tenant-focused RLS on materially tenant-owned canonical tables using policy-enforced runtime/worker access, separate migration/admin privilege, and transaction-safe tenant context where required. It does not accept PostgreSQL, Supabase or another provider, direct-client database access, any database role, any RLS policy, or any migration. Canonical `D-SEC-008` remains `OPEN`.

### Third runtime/operations batch

```text
D-ARCH-003     API contract architecture              PROPOSED / ADR-0011 drafted
D-ARCH-012     Owner/Staff framework                  PROPOSED / ADR-0012 drafted
D-ARCH-013     Member client strategy                 PROPOSED / ADR-0013 drafted
D-ARCH-006     API deployment topology                OPEN / ADR-0014 drafted
D-ARCH-007     Background jobs                        OPEN / ADR-0015 drafted
D-ARCH-009     Hosting                                OPEN / ADR-0016 drafted
D-ARCH-019     CI/CD + release/secrets tooling        OPEN / ADR-0017 drafted
D-ARCH-018     Testing toolchain                      PROPOSED / ADR-0018 drafted
D-ARCH-011     Package manager                       ASSUMED / ADR-0019 drafted
D-PROVIDER-006 Observability provider                 OPEN / ADR-0020 drafted
```

`ADR-0011` proposes JSON over HTTPS with resource/action semantics, runtime-schema-first trust-boundary contracts, purpose-specific DTOs, RFC 9457-compatible stable machine errors, cursor-first bounded pagination, explicit idempotency for designated retry-sensitive mutations, provider-specific webhook verification, major contract versioning, and optional mechanically derived OpenAPI. It accepts no API framework, validation library, OpenAPI/client generator, web framework, native framework, or API deployment topology. Canonical `D-ARCH-003` remains `PROPOSED`.

`ADR-0012` proposes Next.js App Router + React as the Owner/Staff presentation framework. It keeps Server Components and Client Components as presentation concerns, treats Server Functions/Actions and Route Handlers as thin adapters, preserves operation-level GymPulse authorization and ADR-0011 contracts, requires server-only/client-safe module boundaries and explicit tenant-sensitive cache safety, and leaves TypeScript/Node acceptance, API deployment, auth/session provider, hosting, testing, CI/CD, UI libraries, and observability provider separately governed. Canonical `D-ARCH-012` remains `PROPOSED`.

`ADR-0013` proposes responsive browser-first Member delivery as the Phase 1 baseline, with normal HTTPS use requiring no install, OS-camera HTTPS QR entry as the baseline QR path, browser scanning only after real-device validation, PWA capabilities added progressively rather than as an offline-first bundle, and Expo/React Native retained only as an evidence-triggered native evolution path. It preserves ADR-0011 as the common client/server contract, keeps Member-self authorization and attendance/payment truth server-side, rejects offline canonical attendance/payment truth, and does not select Auth, payment, messaging, push, hosting, or native providers. Canonical `D-ARCH-013` remains `PROPOSED`.

`ADR-0014` proposes a co-hosted-first Phase 1 request-serving topology: the trusted `/v1` HTTP/API transport may live with the Owner/Staff server runtime while framework adapters remain thin, ADR-0011 stays independently consumable by Member/future native clients, provider callbacks use dedicated verification adapters, durable background execution remains separate, and application/domain/security modules preserve an explicit extraction seam to a future independent API deployment. It selects no hosting provider, compute model, API gateway, Auth provider, database provider, or job technology. Canonical `D-ARCH-006` remains `OPEN`.

`ADR-0015` proposes PostgreSQL-backed durable jobs/scheduling behind a GymPulse Durable Continuation port, executed by a separate Background Worker Runtime. If PostgreSQL and a compatible Node runtime are later accepted, pg-boss is the leading current implementation candidate; same-database enqueue should join the canonical transaction where possible, while external queue/platform handoff requires a transactional outbox/dispatcher. Queue delivery guarantees never replace application/business idempotency. Redis/BullMQ and managed durable platforms remain separately justified alternatives. Canonical `D-ARCH-007` remains `OPEN`.

`ADR-0016` proposes a conventional regional managed service/worker PaaS as the Phase 1 hosting category: one stateless public request-serving service plus a separate non-public-by-default worker, both located near canonical persistence and independently deployable/scalable. Render is the leading current candidate only if `D-SEC-001`, region/locality, database connectivity, runtime, worker, webhook, secret, migration, rollback, and load validation pass. Cloud Run and Fly.io remain serious region-flexible alternatives; Vercel plus a separate worker remains a credible web-led split. No provider, production region, runtime, database, job runner, or CI/CD system is accepted. Canonical `D-ARCH-009` remains `OPEN`.

`ADR-0017` proposes the Phase 1 CI/CD, production-release, artifact-provenance, environment-promotion, migration-gate, and secrets architecture. GitHub Actions is the leading orchestration candidate only; the invariant is provider-neutral release security: protected PR/required checks, traceable source-to-deployment identity, least-privilege/OIDC-preferred deployment credentials where supported, production-secret isolation from PR/preview contexts, separate runtime and migration credentials where practical, one controlled production migration action, compatible web/worker rollout, post-deploy verification, and explicit rollback-versus-forward-fix handling. Canonical `D-ARCH-019` remains `OPEN`; no workflow, environment, secret, artifact, deployment, or provider acceptance exists.

`ADR-0018` proposes a layered automated testing architecture: deterministic domain/application tests; table-driven authorization and cross-tenant negatives; real database integration where persistence semantics matter; API/provider/worker integration; focused browser E2E; controlled time and failure injection; and release-smoke evidence owned by ADR-0017. Vitest, Testcontainers-style real-PostgreSQL orchestration, and Playwright are the leading current concrete candidates, each conditional on the related runtime/database/client decisions and future implementation evidence. Native E2E remains deferred. Canonical `D-ARCH-018` remains `PROPOSED`; no tool is accepted or installed.

`ADR-0019` proposes `pnpm` as the leading Phase 1 package-manager direction while keeping canonical `D-ARCH-011` `P1 ASSUMED`. The proposal uses one committed root lockfile, explicit workspace package edges, `workspace:` references where local-only resolution is intended, frozen CI/release installs, declared-dependency isolation, package-manager version pinning, and reviewed/restricted dependency build scripts. `npm` is the conservative fallback; `Yarn` and `Bun` remain credible alternatives with different linker/configuration semantics. Package manager, Turborepo, Node.js, frameworks, CI provider, registry/security tooling, and exact versions remain independently governed.

`ADR-0020` proposes Grafana Cloud as the leading Phase 1 managed observability provider while canonical `D-PROVIDER-006` remains `P1 OPEN`. GymPulse keeps application-owned structured telemetry semantics, correlation across request/job/provider paths, privacy-safe logs, OpenTelemetry-compatible server traces/metrics, focused alerting, and optional privacy-reviewed frontend telemetry. Audit logs and canonical business state remain separate; observability export failure must not block canonical operations. No provider, region, SDK, credential, dashboard, alert, session replay, collector, or telemetry pipeline is accepted or provisioned.

`ADR-0021` concludes that current Phase 1 evidence does **not** justify persistent object storage as a baseline dependency while canonical `D-ARCH-010` remains `P1 OPEN`. Stable receipt business truth stays in canonical persistence; a persisted receipt PDF is not currently required. Controlled member import may process bounded temporary input without indefinite raw-file retention, and exports should use direct/on-demand generation before introducing persistent artifacts. If a future requirement justifies storage, the proposed boundary is private-by-default managed storage behind a narrow provider-neutral `ProtectedObjectStore`, with canonical ownership metadata, opaque non-PII keys, server authorization before short-lived signed access, explicit retention/deletion, a `D-SEC-001` region gate, and provider-exit validation. AWS S3, Cloudflare R2, Google Cloud Storage, and Supabase Storage remain evaluated alternatives only.

`ADR-0022` keeps Razorpay and Cashfree as the bounded Phase 1 payment-provider sandbox shortlist while canonical `D-PROVIDER-001` remains `P1 OPEN`. It defines the provider-independent payment architecture: provider-managed browser checkout, server-created provider context from canonical amount/currency/purpose, raw provider webhook verification, normalized GymPulse `Payment` states, separate provider-event dedupe and exactly-once membership/add-on effects, status reconciliation, refund/reversal history, settlement traceability, environment/secret isolation, and provider exit. A new decision-register gap was identified for merchant account / settlement ownership; GymPulse is not assumed to be merchant of record or a platform/sub-merchant operator. No production provider is selected.

`ADR-0023` defers production messaging-provider selection while canonical `D-PROVIDER-002` remains `P1 OPEN`. WhatsApp remains a leading external candidate rather than a mandatory launch channel; Direct Meta, Twilio, and Gupshup remain a bounded comparison set only if WhatsApp is approved. The proposal keeps notification intent/policy, consent separation, business template keys, tenant sender/template mapping, stale-state and preference rechecks, business-stage dedupe, delivery-state truth, async dispatch, and provider exit GymPulse-owned. New decision-register gaps were identified for initial launch communication channels, sender/WABA/phone ownership, and which supported service intents are externally enabled at pilot launch. No provider, channel, sender model, or marketing capability is accepted.

`ADR-0024` proposes **no external product-analytics provider for the initial Phase 1 pilot** while canonical `D-PROVIDER-005` remains `P2 OPEN`. Core pilot KPIs continue to come from canonical attendance, membership, follow-up, payment, renewal, and add-on records. Behavioral events are introduced only when a concrete pilot question cannot be answered adequately from canonical data/manual observation, using precise provider-neutral names, explicit property allowlists, pseudonymous identity, trusted tenant context, environment separation, and non-blocking delivery. Autocapture, session replay, analytics-owned feature flags/experiments, and warehouse/CDP infrastructure are not Phase 1 baselines. PostHog, Mixpanel, and Amplitude are credible future candidates only; none is selected or accepted.

`ADR-0025` proposes **no Redis/Valkey requirement for the Phase 1 baseline** while canonical `D-ARCH-008` remains `P2 OPEN`. No current use case is classified Required now. Indexed/bounded canonical database queries and read models precede shared caching; ADR-0009 keeps distributed cross-request authorization caching out of the baseline; ADR-0007/session policy remains separately governed; `NFR-SECURITY-010` requires abuse controls but not Redis specifically; ADR-0015 continues to own durable jobs without assuming BullMQ/Redis; distributed locks and ephemeral dedupe cannot replace database transactions, constraints, or durable business idempotency; pub/sub/realtime has no current product requirement. A narrow shared cache/ephemeral store may be reconsidered only after measured evidence and explicit degraded-mode, tenant-isolation, security, operations, and cost validation.

`ADR-0026` proposes **Membership-owned entitlement state with a separate Member administrative/relationship state** while canonical `D-DATA-007` remains `P1 PROPOSED / unresolved`. Membership retains `Pending / Active / Frozen / Expired / Cancelled` and owns attendance/no-show/renewal entitlement semantics. The leading Member-state candidate is `Enabled / Blocked / Archived`, deliberately avoiding an overloaded Member `Active` and removing Member-level pause/expiry/cancellation duplication. `FR-MEMBER-004` remains canonically unchanged; exact Blocked/Archived policy, Membership overlap/current-selection rules, early renewal, freeze-expiry behavior, cancellation/refund, deletion/export, retention, and schema/migration design remain separately governed.

Payment and messaging provider ADRs should follow confirmed pilot methods/channels and provider-specific evidence rather than being forced into the foundation batch.

## 15. Current Governance Gate

The C4 architecture, data-flow architecture, technology evaluation, technology-decision normalization, and `ADR-0001` through `ADR-0026` are complete at Draft/Proposed level.

The repository is **not** thereby implementation-ready. No ADR is Accepted. `D-ARCH-003`, `D-ARCH-012`, `D-ARCH-013`, `D-ARCH-002`, `D-ARCH-017`, and `D-ARCH-015` remain `PROPOSED`; `D-ARCH-014`, `D-ARCH-004`, `D-SEC-002`, and `D-SEC-008` remain `OPEN`; other P0/P1 product/security/platform decisions remain unresolved.

`ADR-0012` does not create a Next.js/React application, install dependencies, select hosting, accept TypeScript/Node.js, or decide whether the trusted API is co-hosted with the web runtime or independently deployed. `D-ARCH-006` remains `OPEN`.

`ADR-0013` does not create a Member web/PWA/native application, manifest, service worker, camera/QR implementation, Auth/payment/push integration, native build/signing configuration, or direct database path. Responsive web/PWA and Expo/React Native remain proposal/evolution directions only; no client framework is Accepted.

`ADR-0014` does not create an API application, Route Handler, Server Action, standalone service, serverless/edge function, API gateway, reverse proxy, hosting project, CORS/cookie/CSRF configuration, worker, queue, migration, CI/CD workflow, DNS/domain, or production secret. `D-ARCH-006` remains `OPEN`; no topology is Accepted.

`ADR-0015` does not create a worker, queue, scheduler, Cron configuration, job/outbox table, queue schema, migration, Redis instance, hosting resource, CI/CD workflow, or provider integration. pg-boss, Supabase Queues/Cron, Trigger.dev, BullMQ, PostgreSQL, Node.js, Redis, and hosting remain unaccepted.

`ADR-0016` does not create a cloud account/project, Render/Vercel/Fly/Cloud Run service, worker, environment, DNS/TLS record, Dockerfile, IaC, deployment manifest, database, queue, Redis, migration, CI workflow, production secret, or monitoring integration. Render, Vercel, Fly.io, Google Cloud, PostgreSQL, Node.js, Next.js, pg-boss, Supabase, Redis, and the production region remain unaccepted.

`ADR-0017` does not create `.github/workflows`, branch protection/rulesets, GitHub environments, repository/environment secrets, OIDC trust, production credentials, release artifacts, attestations/SBOMs, migrations, deployments, or hosting resources. GitHub Actions remains a leading candidate only; `D-ARCH-019` remains `OPEN`.

`ADR-0018` does not create test directories/files, Vitest/Jest/Playwright/Cypress configuration, Testcontainers/Docker setup, a test database, fixtures/factories, provider sandbox accounts, browser installs, coverage configuration, CI workflows, or native-E2E tooling. Vitest, Playwright, Testcontainers, Node's test runner, Jest, Cypress, PostgreSQL, Node.js, and all exact testing tools remain unaccepted; `D-ARCH-018` remains `PROPOSED`.

`ADR-0019` does not install pnpm/npm/Yarn/Bun, create `package.json`, create `pnpm-workspace.yaml`, create any lockfile, create package-manager config, install dependencies, create CI cache/configuration, or accept Turborepo/Node.js/frameworks. `pnpm` remains a leading proposal only; canonical `D-ARCH-011` remains `P1 ASSUMED`.

`ADR-0020` does not create a Grafana Cloud/Sentry/Datadog/Better Stack account or stack, install an observability/OpenTelemetry/Faro SDK, create ingestion credentials, dashboards, alerts, SLOs, session replay, log drains, Alloy/Collector processes, telemetry pipelines, or production telemetry. Grafana Cloud remains a leading proposal only; canonical `D-PROVIDER-006` remains `P1 OPEN`.

`ADR-0021` does not create an object-storage account or bucket, install an S3/R2/GCS/Supabase Storage SDK, create storage/IAM credentials, create upload/download routes, generate receipt PDFs, implement export jobs, create database schema/migrations, configure lifecycle/versioning/replication/CDN, upload files, or create IaC/CI. AWS S3, Cloudflare R2, Google Cloud Storage, and Supabase Storage remain evaluated alternatives only; canonical `D-ARCH-010` remains `P1 OPEN`.

`ADR-0022` does not create a Razorpay/Cashfree/PhonePe/PayU account, merchant ID, API/webhook secret, SDK dependency, checkout/payment/webhook/refund route, reconciliation worker, payment/provider-event schema, migration, sandbox/real transaction, refund, settlement, bank-account configuration, CI/environment secret, provider dashboard user, IaC, or deployment. Razorpay and Cashfree remain sandbox candidates only; canonical `D-PROVIDER-001` remains `P1 OPEN`.

`ADR-0023` does not create a Meta Business account, WABA, sender/phone registration, Twilio/Gupshup/BSP account, API/access/webhook secret, WhatsApp/SMS/email template, SDK dependency, messaging/callback/webhook route, NotificationIntent table, migration, worker/job, test/production message, broadcast/campaign, provider-dashboard user, CI/environment secret, IaC, or deployment. Direct Meta, Twilio, and Gupshup remain comparison candidates only; canonical `D-PROVIDER-002` remains `P1 OPEN`.

`ADR-0024` does not create a PostHog/Mixpanel/Amplitude/other analytics account or project, API/project/management key, browser/server SDK, analytics helper/port, event instrumentation, dashboard, funnel, cohort, retention report, heatmap, session replay, autocapture, feature flag, experiment, analytics database/warehouse/CDP/event pipeline, CI/environment secret, production/test analytics traffic, or deployment. Canonical operational metrics remain independent of product analytics; canonical `D-PROVIDER-005` remains `P2 OPEN`.

`ADR-0025` does not create a Redis/Valkey instance, managed cache account, database/cluster, connection URL, credential/certificate, Redis client, cache adapter, rate limiter, session store, distributed lock, pub/sub/stream, BullMQ queue/worker, cache-key implementation, Docker/CI cache service, IaC, or deployment. It does not move ADR-0015 jobs to Redis or resolve D-ARCH-004/D-SEC-004 session policy. Redis and Valkey remain unaccepted; canonical `D-ARCH-008` remains `P2 OPEN`.

`ADR-0026` does not modify `FR-MEMBER-004` or `assumptions.md`, create Member/Membership tables, enums/types, ORM models, migrations, constraints, indexes, triggers, RLS, DTO/API/domain code, import mappers, tests, or UI. It only records a Proposed ownership model. Canonical `D-DATA-007` remains `P1 PROPOSED / unresolved`; no state name or transition is accepted as production behavior.

Post-Task-0034 synchronization completes the existing numbered ADR backlog through order 26.

```text
ADR-0001 through ADR-0026 drafted
Order 26 / D-DATA-007 now has ADR-0026
No ADR is Accepted
D-DATA-007 remains PROPOSED / unresolved
FR-MEMBER-004 remains unchanged
Schema/migrations remain unfinalized
```

No Task 0035 is invented here.

Fresh post-Task-0034 governance review moved into **Architecture Decision Review / Acceptance Readiness**. The first foundation review and first isolated validation pass are complete.

Current validation evidence is recorded at:

```text
validation/foundation/EVIDENCE.md
```

ADR-0001 and ADR-0002 now include bounded real-PostgreSQL supporting evidence. ADR-0003 retains its earlier repository-boundary evidence and was not materially advanced by PostgreSQL validation. ADR-0004 now has successful Stage 3 and Stage 6 real-PostgreSQL evidence.

Current technical state:

```text
Real PostgreSQL Foundation Validation = PASS
Stage 3 = PASS
Stage 6 = PASS
Cleanup = PASS
```

The reusable validation harness is retained under:

```text
validation/foundation/
validation/foundation/postgres/
```

The canonical governance review artifact is now prepared:

```text
docs/adr/foundation-decision-owner-review-packet.md
```

Current governance state remains:

```text
ADR-0001 = Proposed
ADR-0002 = Proposed
ADR-0003 = Proposed
ADR-0004 = Proposed

D-ARCH-005 = PROPOSED
D-ARCH-016 = PROPOSED
D-ARCH-001 = PROPOSED
D-ARCH-002 = PROPOSED

Decision Owner = Open
Explicit Approval = Missing
Production implementation gate = closed
```

The next bounded action is **Authorized Foundation Decision Review**. The authorized owner must choose independently for each ADR: `Accept`, `Reject`, or `Remain Proposed`. The prepared packet does not preselect any choice.

No ADR may move to `Accepted` and no canonical decision may move to `DECIDED` without explicit authorized approval.

For `ADR-0026` specifically, later acceptance review must cover the proposed Member administrative semantics, Membership entitlement ownership, the proposed `FR-MEMBER-004` replacement, Blocked/Archived policy, import/reporting terminology, attendance/no-show/authorization interaction, and historical migration strategy.

## 16. Related Documents

- `foundation-decision-owner-review-packet.md`
- `foundation-acceptance-evidence-plan.md`
- `../README.md`
- `../00-overview/assumptions.md`
- `../01-product/functional-requirements.md`
- `../01-product/non-functional-requirements.md`
- `../01-product/user-roles.md`
- `../01-product/personas.md`
- `../01-product/user-journeys.md`
- `../02-architecture/architecture-principles.md`
- `../02-architecture/architecture-overview.md`
- `../02-architecture/container-architecture.md`
- `../02-architecture/component-architecture.md`
- `../02-architecture/data-flow.md`
- `../02-architecture/technology-stack.md`
- `ADR-0001-modular-monolith.md`
- `ADR-0002-primary-language-runtime.md`
- `ADR-0003-monorepo-strategy.md`
- `ADR-0004-database-engine.md`
- `ADR-0005-data-access-migration-strategy.md`
- `ADR-0006-managed-backend-responsibilities.md`
- `ADR-0007-authentication-session-architecture.md`
- `ADR-0008-member-authentication-method.md`
- `ADR-0009-authorization-implementation.md`
- `ADR-0010-data-layer-tenant-isolation-rls.md`
- `ADR-0011-api-contract-architecture.md`
- `ADR-0012-owner-staff-web-framework.md`
- `ADR-0013-member-client-strategy.md`
- `ADR-0014-api-deployment-boundary.md`
- `ADR-0015-background-jobs-scheduler.md`
- `ADR-0016-hosting-deployment-platform.md`
- `ADR-0017-ci-cd-release-secrets.md`
- `ADR-0018-testing-toolchain.md`
- `ADR-0019-package-manager.md`
- `ADR-0020-observability-provider.md`
- `ADR-0021-object-storage.md`
- `ADR-0022-payment-provider.md`
- `ADR-0023-messaging-provider.md`
- `ADR-0024-product-analytics-provider.md`
- `ADR-0025-redis-cache-requirement.md`
- `ADR-0026-member-membership-state-ownership.md`
- legacy migration source: `../05-system-architecture.md`
- legacy migration source: `../07-api-contracts.md`
- legacy migration source: `../12-security-audit.md`
- legacy migration source: `../15-engineering-workflow.md`
- legacy migration source: `../16-open-decisions.md`
