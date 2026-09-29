# GymPulse Technology Stack Architecture

## Document Control

- Document Maturity: `Draft`
- Scope Status: `In Scope` for Phase 1 architecture evaluation
- Architecture View: `Technology evaluation and recommendation`
- Audience: Architecture, Backend, Frontend, Mobile, Security, DevOps, QA, Operations
- Canonical Decision Register: `../00-overview/assumptions.md`
- Architecture Principles: `architecture-principles.md`
- Parent Architecture Views: `architecture-overview.md`, `system-context.md`, `container-architecture.md`, `component-architecture.md`, `data-flow.md`
- ADR Governance: `../adr/README.md`
- Evaluation Date: `2026-08-20`

## 1. Purpose

Evaluate technologies that can implement the already-defined GymPulse Phase 1 requirements and architecture without changing the logical architecture to fit a preferred framework or provider.

This document is a **technology evaluation**, not a decision-approval record.

A recommendation in this document does not change canonical decision status. In particular:

```text
OPEN      does not become DECIDED
PROPOSED  does not become DECIDED
ASSUMED   does not become DECIDED
```

Only the canonical decision register plus the ADR/approval workflow may establish an accepted architecture decision.

No exact dependency version is pinned here. Version selection belongs to implementation/scaffolding after the relevant architecture gates are approved.

## 2. Architecture That Technology Must Implement

Technology must preserve the existing C4/container responsibilities:

```text
Member Client Application
Owner / Staff Application
Trusted Application / API Runtime
Background Execution Runtime
Canonical Persistence
Protected Object Storage where required
External Authentication Provider
External Payment Provider
External Messaging Provider
Observability / Telemetry
```

It must also preserve the component responsibilities already defined in `component-architecture.md`:

```text
Transport / Callback Entry
Authentication Verification
Principal Resolution
Tenant / Resource Resolution
Capability Authorization
Contract Validation
Application Command Handlers
Application Query Handlers
Domain Modules
Transaction / Unit of Work
Idempotency / Deduplication
Repositories / Data Access
Provider Ports / Adapters
Audit
Events / Durable Continuation
Business Clock
Background Execution
Observability
```

A framework is acceptable only when it can host these boundaries without turning route handlers, UI components, provider SDKs, or database models into the domain architecture.

## 3. Evaluation Criteria

Every material choice is evaluated against:

- tenant isolation and least privilege,
- deterministic server-side business truth,
- transactional and idempotent correctness,
- payment and attendance integrity,
- gym-local time correctness,
- provider abstraction,
- background-work durability and recoverability,
- observability and failure diagnosis,
- testability,
- Phase 1 operational simplicity,
- future extraction/evolution without premature distributed infrastructure,
- developer productivity without hiding correctness-critical behavior.

Primary architecture principles include `ARCH-PRIN-001` through `ARCH-PRIN-016`, especially tenant isolation, authentication/authorization separation, capability authorization, financial correctness, idempotency, domain ownership, transactions, provider abstraction, reconciliation, observability, and data minimization.

## 4. Technology Decision Summary Matrix

`Implementation Allowed?` refers to authoritative product/infrastructure implementation based on the current decision state. A disposable local spike does not count as approval.

| Area | Canonical Decision ID | Current Status | Recommended Direction | Confidence | Blocking Inputs | ADR Required | Implementation Allowed? |
|---|---|---|---|---|---|---|---|
| Primary language/runtime | `D-ARCH-016` | DECIDED | Strict TypeScript with a supported Node.js LTS runtime; exact production version remains separate | High | Downstream framework/deployment/tooling decisions | `ADR-0002` Accepted | Foundation category decided; overall production scaffold still gated |
| Architecture style | `D-ARCH-005` | DECIDED | Modular monolith with explicit domain/component boundaries | High | Production boundary enforcement remains implementation work | `ADR-0001` Accepted | Foundation category decided; overall production scaffold still gated |
| Repository/workspace | `D-ARCH-001` | DECIDED | Explicit monorepo with deliberate app/package boundaries and independently buildable artifacts | High | Concrete package graph/tooling/CI remain separate | `ADR-0003` Accepted | Foundation category decided; overall production scaffold still gated |
| Workspace orchestrator | `D-ARCH-001` | DECIDED (monorepo only) | Turborepo remains a leading candidate, not an accepted requirement | Medium | Measured task-graph/cache/CI need | Separate tooling decision if material | No; candidate only |
| Package manager | `D-ARCH-011` | ASSUMED | pnpm workspaces | High | Approval with repository tooling | Yes if treated as material; otherwise related decision evidence | No; spike only |
| Owner/Staff web | `D-ARCH-012` | PROPOSED | Next.js + TypeScript | High | Framework ADR/approval; API topology | Yes | No; spike only |
| Member client | `D-ARCH-013` | PROPOSED | Phase 1 responsive web/PWA first; Expo/React Native when native requirements justify it | Medium-High | Target-device QR test, notification/offline requirements, adoption evidence | Yes | No; prototype only |
| API contract style | `D-ARCH-003` | PROPOSED | JSON HTTP, typed/runtime-validated contracts, stable error model; OpenAPI export where useful | High | Contract ADR/approval | Yes | No; spike only |
| API deployment topology | `D-ARCH-006` | OPEN | Keep co-hosted web/server and separate API both viable; prefer simplest topology that passes webhook/job/runtime constraints | Medium | Web framework, jobs, hosting, auth, load profile | Yes | No |
| Canonical database | `D-ARCH-002` | DECIDED | PostgreSQL | High | Provider/region/recovery/connection topology remain separate | `ADR-0004` Accepted | Engine category decided; production database deployment still gated |
| Data access/migrations | `D-ARCH-017` | PROPOSED | SQL-aware typed layer; Drizzle or Kysely lead candidates, Prisma credible alternative | Medium | Tooling acceptance, migration/RLS/constraint evidence | `ADR-0005` drafted | No; proposal only |
| Managed backend responsibilities | `D-ARCH-014` | OPEN | Evaluate capabilities independently; Supabase is a strong candidate for managed Postgres and optional Auth/Storage, not an application-architecture replacement | Medium | DB/auth/storage/RLS/jobs decisions, jurisdiction | Yes | No |
| Authentication/session | `D-ARCH-004` | OPEN | Managed authentication with server-side principal resolution and explicit session revocation/expiry | Medium | Staff/member UX, provider, session policy | Yes | No; sandbox only |
| Member authentication | `D-SEC-002` | OPEN | Phone OTP/passwordless is a leading pilot candidate, but not selected | Medium | Pilot member UX, abuse/cost/recovery requirements | Yes | No; sandbox only |
| Authorization implementation | `D-ARCH-015` | PROPOSED | GymPulse-owned capability + tenant/resource policy module; provider roles are not authority | High | Policy storage/caching model, ADR | Yes | No; policy prototype only |
| Tenant isolation / RLS | `D-SEC-008` | OPEN when applicable | Application authorization mandatory; PostgreSQL RLS as defense in depth for tenant tables when topology benefits from it | High on principle, Medium on exact policy | DB/managed-backend/service-role topology | Yes | No; isolated policy spike only |
| Background jobs/scheduling | `D-ARCH-007` | OPEN | Prefer durable Postgres-backed jobs/outbox for Phase 1 if PostgreSQL is accepted; compare pg-boss/Supabase Queues+Cron with managed durable task platforms | Medium | DB/managed-backend/hosting choices and workload spike | Yes | No; spike only |
| Redis/cache/broker | `D-ARCH-008` | OPEN | Do not add to Phase 1 baseline without a measured or tool-driven requirement | High | Demonstrated need | ADR only if introduced materially | No |
| Payment provider | `D-PROVIDER-001` | OPEN | Keep adapter; pilot-evaluate Razorpay and Cashfree against confirmed payment methods/support/fees/reconciliation | Medium | Pilot payment methods, fees, settlement/support expectations | Yes | No; sandbox only |
| Messaging provider | `D-PROVIDER-002` | OPEN | WhatsApp-capable provider/BSP shortlist after launch-channel and consent policy are confirmed | Medium | Enabled channels, template/consent policy, pricing/support | Yes | No; test recipients only |
| Protected object storage | `D-ARCH-010` | OPEN | Keep conditional; private S3-compatible/managed storage only when receipt/export/file artifacts require it | High | Actual artifact requirement, retention policy | Yes if provider/model becomes material | No |
| Observability provider | `D-PROVIDER-006` | OPEN | Structured logs + correlation + managed error monitoring; OpenTelemetry-compatible instrumentation where practical | High on capability, Medium on provider | Runtime/hosting topology, cost/retention | Yes for provider | No provider binding |
| Product analytics | `D-PROVIDER-005` | OPEN | Defer provider until pilot funnel questions exist; privacy-minimized non-canonical events | High | Event plan, privacy/retention, pilot questions | Usually yes for provider if material | No provider binding |
| Testing stack | Decision Register Gap | None | Vitest-style TS unit/integration runner + real PostgreSQL integration tests + Playwright web E2E; mobile E2E later if native app is accepted | Medium-High | Runtime/framework choices, CI environment | Engineering decision; ADR only if materially constraining | No final stack; spike only |
| Hosting/deployment | `D-ARCH-009` | OPEN | Choose after API/jobs/managed-backend decisions; compare serverless web hosting + durable jobs vs integrated service/worker hosting | Medium | `D-ARCH-006`, `D-ARCH-007`, `D-ARCH-014`, `D-SEC-001` | Yes | No |
| CI/CD and production secrets | Decision Register Gap | None | GitHub-native CI is a leading candidate; environment-scoped secrets, migration gates, protected production deployment | High on capability, Medium on tooling | Hosting/runtime choices, canonical governance | Recommended for production release architecture | No final pipeline binding |

## 5. Primary Language and Runtime

### Decision ID

Decision Register Gap: the canonical register currently has framework/repository decisions but no explicit primary implementation language/runtime decision.

### Current Decision Status

No canonical status exists.

### Problem Being Solved

GymPulse needs one primary server/client language and supported runtime that can express shared contracts, deterministic domain rules, provider adapters, background work, tests, and framework-independent application components.

### Relevant Requirements

- `NFR-MAINTAINABILITY-001..006`
- `NFR-TESTABILITY-001..005`
- `NFR-SCALABILITY-003..005`
- `FR-CROSS-001..004`

### Relevant Architecture Principles

`ARCH-PRIN-004`, `ARCH-PRIN-006`, `ARCH-PRIN-009`, `ARCH-PRIN-010`, `ARCH-PRIN-012`, `ARCH-PRIN-014`.

### Current Candidate

TypeScript across primary application code with a supported Node.js LTS runtime for server-side execution.

### Alternatives Considered

- Java/Kotlin server with TypeScript clients,
- Go server with TypeScript clients,
- Python server with TypeScript clients,
- JavaScript without strict TypeScript.

### Recommended Direction

Use strict TypeScript for primary application/domain/integration code and Node.js LTS for the primary server runtime, subject to creation and approval of a canonical decision.

### Why

- The proposed Next.js and Expo/React Native clients already align with TypeScript.
- Shared or generated contract types can reduce duplication across clients and server while runtime validation still protects trust boundaries.
- The Node ecosystem supports HTTP servers, provider SDKs, PostgreSQL clients, job workers, tests, observability, and deployment choices needed by the current architecture.
- TypeScript project references/workspace boundaries can reinforce separation without requiring separate repositories.
- Strict typing helps expose state and contract mismatches earlier, but does not replace runtime validation, transactions, database constraints, or tests.

### Tradeoffs

- One language can encourage accidental over-sharing of server-only code into clients unless package/build boundaries are enforced.
- TypeScript types disappear at runtime, so external payloads remain `unknown` until validated.
- Node process/runtime behavior must not be used as permanent state or locking authority.

### Security Impact

Positive when strict types and explicit server-only packages reduce mistakes. Risk remains if secrets/provider SDKs are imported into client bundles or if types are mistaken for validation.

### Reliability Impact

Neutral-to-positive. Reliability comes from transaction/idempotency design, not the language itself.

### Performance Impact

Sufficient for Phase 1 request and worker workloads if database/provider interactions are designed correctly. Performance should be measured before runtime specialization.

### Scalability Impact

Stateless Node application/worker components can scale horizontally. Domain boundaries remain extractable if future evidence requires another runtime.

### Operational Impact

One primary runtime reduces build/dependency/observability diversity during Phase 1.

### Developer Experience Impact

Strong shared tooling and contract reuse, with risk of monorepo coupling if package boundaries are weak.

### Reversibility

Medium. Client TypeScript is easy to retain if the server is later specialized, but replacing the primary server language is expensive.

### Validation / Spike Required

- strict TS workspace compile,
- contract runtime-validation example,
- one transaction-heavy attendance/payment test,
- one scheduled/background handler,
- one provider webhook raw-body verification spike.

### ADR Required

Recommended after the missing canonical decision is registered because the choice affects most primary implementation code.

### What Would Change the Recommendation

A hard runtime requirement unsupported by Node, a team constraint with materially stronger operational evidence for another language, or measured performance/latency needs that cannot be solved cleanly within the current architecture.

## 6. Repository and Workspace Strategy

### Decision ID

`D-ARCH-001`

### Current Decision Status

`PROPOSED`

### Problem Being Solved

Keep web/member clients, trusted server code, domain rules, contracts, jobs, provider adapters, tests, migrations, and Docs-as-Code synchronized without forcing one deployable runtime.

### Relevant Requirements

`NFR-MAINTAINABILITY-001..006`, `NFR-TESTABILITY-001..005`, `NFR-SCALABILITY-002..005`.

### Relevant Architecture Principles

`ARCH-PRIN-009`, `ARCH-PRIN-012`, `ARCH-PRIN-014`.

### Current Candidate

Monorepo, with Turborepo as the leading orchestration candidate.

### Alternatives Considered

- multiple repositories per client/runtime,
- monorepo with native package-manager workspaces and no task orchestrator initially,
- Nx or another integrated monorepo tool,
- single repository without explicit package boundaries.

### Recommended Direction

Use the explicit monorepo strategy accepted under `ADR-0003` / `D-ARCH-001 = DECIDED`. Package-manager choice remains separate; add a task orchestrator such as Turborepo only when task graph, caching, affected-package CI, or multi-app developer workflow provides measurable value.

Conceptual boundaries remain:

```text
apps/      deployable/client entry points
packages/  domain/application/contracts/integration/building blocks
docs/      canonical documentation
```

The repository must not imply one deployment. Web, API, worker, and future mobile artifacts may remain independently deployable.

### Why

GymPulse has correctness rules shared conceptually by multiple entry points. Atomic changes to domain rules, API contracts, migrations, jobs, tests, and docs are easier to review when versioned together.

### Tradeoffs

- broader CI impact without careful task dependency configuration,
- accidental package cycles or client-to-server dependency leaks,
- repository size/tooling complexity as teams grow.

### Security Impact

Requires explicit server-only package/import boundaries so provider secrets and database adapters cannot enter client bundles.

### Reliability Impact

Positive when one change can update domain rule, migration, tests, and worker behavior together.

### Performance Impact

Build/test performance depends on task graph/caching. Runtime performance is unaffected.

### Scalability Impact

Scales well for a small/medium product team; repository splitting remains possible later when ownership/release independence justifies it.

### Operational Impact

Simplifies one CI source but requires deployment pipelines to distinguish artifacts.

### Developer Experience Impact

Strong local cross-app changes and shared contracts. Turborepo can improve affected-task execution, but is not required to define architecture.

### Reversibility

Medium-High if package boundaries and publishable contracts are explicit.

### Validation / Spike Required

- workspace dependency graph,
- server-only/client-safe import rule,
- affected-package CI prototype,
- independent build artifacts for web/API/worker candidate mappings.

### ADR Required

Yes under `D-ARCH-001`.

### What Would Change the Recommendation

Independent teams with separate release/compliance boundaries, repository scale causing unacceptable CI/developer cost, or a provider/platform constraint that makes shared workspace deployment unsafe.

## 7. Package Manager

### Decision ID

`D-ARCH-011`

### Current Decision Status

`ASSUMED`

### Problem Being Solved

Deterministic dependency installation, workspace linking, lockfile governance, CI efficiency, and consistent developer commands.

### Relevant Requirements

`NFR-MAINTAINABILITY-004..006`, `NFR-OPERATIONS-001..004`.

### Relevant Architecture Principles

`ARCH-PRIN-013`, `ARCH-PRIN-016`.

### Current Candidate

pnpm.

### Alternatives Considered

npm workspaces, Yarn workspaces, Bun package manager.

### Recommended Direction

Retain pnpm as the leading candidate if the TypeScript monorepo direction is accepted.

### Why

pnpm has first-class workspace support, deterministic lockfile workflows, and disk/install efficiency useful for a multi-package repository. It does not constrain runtime architecture.

### Tradeoffs

Team/CI tooling must understand pnpm workspace and stricter dependency-linking behavior.

### Security Impact

Lockfile and frozen-install discipline help dependency review. No package manager substitutes for dependency scanning or review.

### Reliability Impact

Positive for reproducible installs when lockfile is enforced.

### Performance Impact

Primarily developer/CI install efficiency; not runtime performance.

### Scalability Impact

Supports multi-package repository growth.

### Operational Impact

CI images/runners must enable the selected pnpm mechanism consistently.

### Developer Experience Impact

Strong for workspaces; requires one documented version-management policy later.

### Reversibility

High before implementation; medium after large workspace scripts/tooling accumulate.

### Validation / Spike Required

Frozen lockfile install, workspace scripts, Turborepo/no-Turborepo compatibility, CI caching.

### ADR Required

Can be a related explicit decision in the repository/workspace ADR or a small dedicated ADR if governance requires one-decision-per-ADR strictly.

### What Would Change the Recommendation

A deployment/build platform with materially worse pnpm support or a demonstrably simpler workspace workflow with equivalent reproducibility.

## 8. Owner / Staff Web Application

### Decision ID

`D-ARCH-012`

### Current Decision Status

`PROPOSED`

### Problem Being Solved

Build a secure operational application for authenticated staff workflows, forms, tables, action queues, dashboards, protected server interactions, and observable production behavior.

### Relevant Requirements

`FR-MEMBER-*`, `FR-MEMBERSHIP-*`, `FR-ATTENDANCE-007..011`, `FR-RETENTION-*`, `FR-FOLLOWUP-*`, `FR-DASHBOARD-*`, `FR-AUDIT-*`, `NFR-UX-*`, `NFR-SECURITY-*`.

### Relevant Architecture Principles

`ARCH-PRIN-001..004`, `ARCH-PRIN-007`, `ARCH-PRIN-014`, `ARCH-PRIN-016`.

### Current Candidate

Next.js + React + TypeScript.

### Alternatives Considered

- React SPA with a separately deployed API,
- Remix/React Router full-stack patterns,
- another mature server-rendered React framework,
- non-React server-rendered web stack.

### Recommended Direction

Keep Next.js + TypeScript as the leading Owner/Staff candidate, while keeping domain/application logic outside React components and framework route handlers.

### Why

- The product is a form/table/action-queue-heavy authenticated operational web application.
- Next.js can support server and client rendering boundaries while still calling a separate API if `D-ARCH-006` chooses that topology.
- It can co-host trusted server entry components for a simple Phase 1 deployment if the runtime/hosting/job/webhook constraints pass validation.
- React ecosystem support for forms, accessibility, tables, testing, and observability is mature.

### Tradeoffs

- Framework-integrated server features can tempt application/domain logic into route/server-action code.
- Co-hosting API responsibilities may couple runtime scaling/deployment unless package boundaries stay explicit.
- Caching/server-render defaults must never cache tenant-sensitive data incorrectly.

### Security Impact

Server/client module boundaries must prevent secret leakage. All protected mutations still execute GymPulse principal/scope/capability checks server-side.

### Reliability Impact

Good if server routes remain thin adapters and critical transactions live below framework boundaries.

### Performance Impact

Suitable for dashboard/action-queue UX; large tables require server-side pagination/indexed queries rather than client loading.

### Scalability Impact

Can scale the web runtime horizontally; separate API/worker extraction remains viable.

### Operational Impact

Potentially fewer Phase 1 deployables if co-hosted, but final topology remains `D-ARCH-006`.

### Developer Experience Impact

Strong TypeScript/React ecosystem and shared contracts, with discipline required around server/client boundaries.

### Reversibility

Medium. UI replacement is expensive; domain/application packages should remain portable.

### Validation / Spike Required

- authenticated protected route,
- safe cookie/session flow candidate,
- large action-queue table,
- raw payment webhook verification path if co-hosted,
- observability/error propagation,
- independent API extraction seam.

### ADR Required

Yes under `D-ARCH-012`.

### What Would Change the Recommendation

A separate API-first architecture with a simpler SPA operational model, framework constraints on raw webhook/body or long-running behavior, or measured deployment/runtime complexity that outweighs full-stack benefits.

## 9. Member Client Strategy

### Decision ID

`D-ARCH-013`

### Current Decision Status

`PROPOSED`

### Problem Being Solved

Give members low-friction access to membership status, QR check-in, renewal/payment, attendance/goal state, and preferences while minimizing installation and support burden.

### Relevant Requirements

`FR-IDENTITY-003`, `FR-AUTHZ-003`, `FR-ATTENDANCE-001..006`, `FR-MEMBERSHIP-*`, `FR-RENEWAL-*`, `FR-PAYMENT-*`, `NFR-UX-001`, `NFR-PERFORMANCE-006`, `NFR-COMPATIBILITY-001`.

### Relevant Architecture Principles

`ARCH-PRIN-004`, `ARCH-PRIN-006`, `ARCH-PRIN-015`, `ARCH-PRIN-016`.

### Current Candidate

Responsive web/PWA versus Expo/React Native.

### Alternatives Considered

- responsive web only,
- installable PWA,
- Expo/React Native cross-platform app,
- separate native iOS/Android applications.

### Recommended Direction

For Phase 1, prefer a responsive web/PWA member experience first **if target-device QR-camera and authentication tests pass**. Keep Expo/React Native as the leading native evolution path when requirements justify app-store distribution, deeper push/deep-link integration, richer offline/device behavior, or later fitness features.

### Why

Phase 1 member repeated actions are intentionally small. Web/PWA reduces installation/app-store friction and can shorten pilot iteration. Current web camera APIs/frameworks can support QR scanning on many target devices, but the actual pilot device/browser mix must be tested.

Expo/React Native becomes more compelling if native push, secure-storage behavior, background processing, richer camera/device APIs, or future workout/nutrition/progress experiences become core rather than future scope.

### Tradeoffs

Responsive web/PWA:
- lowest distribution friction,
- weaker/less-consistent platform integration and background behavior across devices,
- camera permission/browser differences require testing.

Expo/React Native:
- stronger native integration,
- app-store/release/support overhead,
- greater implementation surface before Phase 1 proves need.

Fully native:
- maximum platform control,
- highest duplicated implementation/release cost.

### Security Impact

Web should prefer secure cookie/session mechanisms when compatible. Native apps require platform secure storage for long-lived session secrets. Neither client owns authorization/business truth.

### Reliability Impact

Online-first check-in and payment verification remain server-authoritative regardless of client. Offline attendance should not be introduced merely to justify native delivery.

### Performance Impact

Both web and Expo are sufficient for Phase 1 UI if payloads are bounded. Camera UX must be measured on actual pilot devices.

### Scalability Impact

A stable API contract allows later native adoption without changing domain logic.

### Operational Impact

Web/PWA avoids app-store release cadence initially. Native adds signing, store review, mobile crash/update support.

### Developer Experience Impact

Web can reuse the Owner/Staff web ecosystem selectively but must not mix member authorization. Expo shares TypeScript and React mental models if native becomes necessary.

### Reversibility

High if APIs/contracts remain independent and member UI contains no business truth.

### Validation / Spike Required

- QR scan on representative Android/iOS devices and browsers,
- member auth/session recovery,
- payment checkout/return/deep-link behavior,
- installability/offline-shell expectations,
- notification requirement validation with pilot owner/member workflow.

### ADR Required

Yes under `D-ARCH-013`.

### What Would Change the Recommendation

A confirmed native push requirement, unreliable target-browser camera support, mandatory offline attendance/device capability, or validated member engagement features that materially benefit from native distribution.

## 10. API Contract Architecture and Deployment Topology

### Decision IDs

- `D-ARCH-003`: contract architecture, `PROPOSED`
- `D-ARCH-006`: deployment topology, `OPEN`

These are separate decisions.

### Problem Being Solved

Provide stable, validated contracts to web/member clients and providers while preserving framework-independent application/domain logic and deployment flexibility.

### Relevant Requirements

`FR-CROSS-001..003`, `FR-ATTENDANCE-006`, `FR-PAYMENT-003..007`, `NFR-MAINTAINABILITY-002`, `NFR-COMPATIBILITY-002`, `NFR-SECURITY-003`, `NFR-TESTABILITY-002..004`.

### Relevant Architecture Principles

`ARCH-PRIN-002..006`, `ARCH-PRIN-012`, `ARCH-PRIN-013`.

### Current Candidate

JSON HTTP with typed/runtime-validated contracts. Deployment may be co-hosted in the Owner/Staff web server runtime or an independent API runtime.

### Alternatives Considered

Contract style:
- REST/resource-oriented JSON HTTP,
- typed RPC-style API,
- GraphQL,
- generated OpenAPI-first contracts.

Deployment:
- framework-integrated server/API routes,
- independent Node API runtime.

### Recommended Direction

Use resource/use-case-oriented JSON HTTP with runtime schema validation, stable machine-readable errors, explicit idempotency headers/keys for critical mutations, pagination, and OpenAPI generation/export where mobile/external contract stability benefits from it.

Do not bind domain/application interfaces to Next.js request objects or a typed-RPC framework. Typed RPC may be useful internally, but should not make future mobile/provider/external contracts dependent on one web framework.

For deployment, preserve both `D-ARCH-006` options. Prefer the simplest one that passes raw webhook verification, session/auth, worker separation, scaling, observability, and hosting constraints.

### Why

The existing data-flow architecture already requires trust-boundary validation, stable errors, webhook verification, and client independence. JSON HTTP is broadly portable and works for web and future native clients.

### Tradeoffs

- REST/resource contracts require deliberate DTO/schema maintenance.
- Typed RPC can improve same-repo ergonomics but increases framework/tool coupling.
- GraphQL adds schema/runtime complexity not justified by current Phase 1 query needs.
- Separate API deployment adds operational/network complexity; co-hosting adds runtime coupling.

### Security Impact

Runtime validation and centralized authz remain mandatory. Raw provider callbacks must preserve verification inputs before parsing/normalization.

### Reliability Impact

Stable idempotency and error semantics improve retry/reconciliation behavior.

### Performance Impact

JSON HTTP is adequate; query shape and database indexing dominate current bottlenecks.

### Scalability Impact

An explicit contract allows independent client/server scaling and later API extraction.

### Operational Impact

Topology changes number of deployables, secrets, networks, traces, and rollback paths.

### Developer Experience Impact

Shared/generated types can give strong ergonomics without making TypeScript compile-time types the runtime trust boundary.

### Reversibility

High for deployment if application/domain packages are framework-independent; medium for public contract style after native/external consumers ship.

### Validation / Spike Required

- one protected read and mutation schema,
- stable error/idempotency contract,
- raw payment webhook path,
- generated OpenAPI feasibility,
- co-hosted vs separate deployment smoke comparison.

### ADR Required

Yes, separately for `D-ARCH-003` and `D-ARCH-006` if both remain material.

### What Would Change the Recommendation

A confirmed external/public API strategy with stronger OpenAPI-first governance, client volume requiring specialized gateway behavior, or framework/runtime constraints that make co-hosting unsafe.

## 11. Canonical Database

### Decision ID

`D-ARCH-002`

### Current Decision Status

`PROPOSED`

### Problem Being Solved

Persist multi-tenant operational and financial state with transactions, constraints, indexed queries, audit/reconciliation history, and a path to data-layer tenant defense in depth.

### Relevant Requirements

`FR-CROSS-001..004`, `FR-ATTENDANCE-003..006`, `FR-RETENTION-005`, `FR-PAYMENT-004..009`, `FR-AUDIT-*`, `NFR-RELIABILITY-001..008`, `NFR-DATA-*`, `NFR-AVAILABILITY-004`, `NFR-SCALABILITY-001,006`.

### Relevant Architecture Principles

`ARCH-PRIN-001`, `ARCH-PRIN-005..010`, `ARCH-PRIN-013`.

### Current Candidate

PostgreSQL.

### Alternatives Considered

MySQL/MariaDB, distributed SQL products, document/NoSQL-first databases.

### Recommended Direction

Use PostgreSQL as canonical persistence; `ADR-0004` is Accepted and `D-ARCH-002 = DECIDED`.

### Why

GymPulse is relational and correctness-heavy: members/memberships/attendance/renewals/payments/provider events/payment effects/audit/follow-ups have explicit relationships and uniqueness rules. PostgreSQL supports transactions, constraints, partial/conditional indexing patterns, JSON where appropriate, strong query/reporting support, and Row Level Security when defense in depth is chosen.

### Tradeoffs

- schema/migration discipline is required,
- connection management matters in serverless topologies,
- RLS/service roles can become complex if mixed with broad privileged access,
- relational modeling requires explicit evolution rather than schema-free shortcuts.

### Security Impact

Strong fit for explicit tenant columns, least-privilege DB roles, and optional RLS. RLS does not replace application authorization, and owner/BYPASSRLS/service-role behavior must be tested explicitly.

### Reliability Impact

High fit for transactional attendance/payment/idempotency constraints and durable reconciliation state.

### Performance Impact

Pilot and early SaaS operational queries should fit well with tenant/status/date indexes and bounded read models. Measure before adding cache infrastructure.

### Scalability Impact

Supports significant vertical/horizontal read scaling before microservice/database fragmentation is justified. Tenant partitioning/sharding remains a later evidence-driven concern.

### Operational Impact

Requires managed backups, restore rehearsal, migration safety, connection monitoring, and region placement.

### Developer Experience Impact

Mature tooling and strong SQL semantics; developers need SQL/transaction literacy.

### Reversibility

Medium-Low once production data and migrations accumulate, which is why ADR approval is required before authoritative schema work.

### Validation / Spike Required

- transaction/concurrency test for attendance/payment effect,
- partial uniqueness/index patterns,
- RLS/service-role test if applicable,
- migration-from-zero and backup/restore plan,
- hosting connection/pooling test.

### ADR Required

Yes under `D-ARCH-002`.

### What Would Change the Recommendation

A hard provider/regional constraint, a demonstrated data model that is not relational, or a scale/availability requirement beyond the current product that materially changes consistency architecture.

## 12. Data Access and Migration Strategy

### Decision ID

Decision Register Gap.

### Current Decision Status

No canonical decision exists for ORM/query-builder/migration ownership.

### Problem Being Solved

Expose transactions, constraints, type-safe queries, migrations, raw SQL escape hatches, and testable repositories without leaking infrastructure objects into domain logic.

### Relevant Requirements

`NFR-RELIABILITY-004`, `NFR-MAINTAINABILITY-004`, `NFR-TESTABILITY-001..003`, `NFR-OPERATIONS-003`, `NFR-DATA-*`.

### Relevant Architecture Principles

`ARCH-PRIN-009`, `ARCH-PRIN-010`, `ARCH-PRIN-013`.

### Current Candidates

- Drizzle ORM / Drizzle Kit,
- Kysely plus explicit migration tooling,
- Prisma ORM / Prisma Migrate,
- SQL-first migrations + typed query generation/hand-written repositories.

### Recommended Direction

Prefer an **SQL-aware typed approach**. Drizzle is the leading candidate when one TypeScript-oriented schema/migration/query tool is desired. Kysely is the leading alternative when the team prefers a thin, SQL-shaped query builder and explicit migration ownership. Prisma remains credible, especially for developer productivity, but must be proven against GymPulse's partial uniqueness, RLS/policy, raw SQL, transaction, and migration-control needs.

Do not select an ORM because it can generate CRUD quickly. The decisive question is whether it keeps database constraints and transactions visible enough for attendance/payment integrity.

### Why

GymPulse requires database-level uniqueness, transaction boundaries, tenant-aware queries, migration discipline, and occasional PostgreSQL-specific features. A SQL-aware layer minimizes impedance between architecture rules and implementation.

### Tradeoffs

- Drizzle/Kysely require more SQL literacy.
- Prisma offers high-level schema/client ergonomics but may need raw/custom SQL for advanced Postgres features.
- Pure SQL maximizes control but increases manual type/boilerplate burden.

### Security Impact

Parameterized queries and explicit tenant-scoped repositories are required. RLS policy/migration ownership must be clear regardless of library.

### Reliability Impact

Tool must support explicit transactions and allow database constraints to remain authoritative backstops.

### Performance Impact

SQL visibility helps diagnose query plans/N+1/large scans. Any ORM can still produce poor queries if used carelessly.

### Scalability Impact

Database schema/query design matters more than ORM choice. Avoid framework-specific repositories that block later runtime extraction.

### Operational Impact

Migration files must be reviewable, reproducible, staged for destructive changes, and runnable in CI/staging/production.

### Developer Experience Impact

Drizzle/Kysely favor TypeScript + SQL alignment; Prisma favors generated-client ergonomics. Team familiarity should be tested with real GymPulse queries.

### Reversibility

Medium. Repository/port boundaries reduce the cost, but migration history and query code make wholesale replacement non-trivial.

### Validation / Spike Required

Implement only in an isolated spike:

- tenant-scoped member search,
- attendance create-if-not-duplicate transaction,
- active no-show partial uniqueness,
- provider-event/effect uniqueness,
- RLS migration/policy if relevant,
- one dashboard aggregate,
- migration rollback/forward-fix exercise.

### ADR Required

Recommended if the chosen tool owns schema/migrations and becomes a cross-cutting persistence dependency.

### What Would Change the Recommendation

A chosen managed backend strongly constraining migrations/client access, team evidence favoring another tool, or inability of the lead candidate to express/test required PostgreSQL features cleanly.

## 13. Managed Backend Platform

### Decision ID

`D-ARCH-014`

### Current Decision Status

`OPEN`

### Problem Being Solved

Reduce operational burden by purchasing managed infrastructure capabilities without allowing one provider bundle to silently redefine GymPulse application/domain architecture.

### Relevant Requirements

`NFR-SECURITY-*`, `NFR-AVAILABILITY-003..005`, `NFR-OPERATIONS-*`, `NFR-MAINTAINABILITY-003..006`, `NFR-SCALABILITY-004`.

### Relevant Architecture Principles

`ARCH-PRIN-001`, `ARCH-PRIN-002`, `ARCH-PRIN-011..014`, `ARCH-PRIN-016`.

### Current Candidate

Supabase is a strong candidate because it provides managed PostgreSQL plus separable Auth, Storage, RLS-oriented data policies, Realtime, Edge Functions, Cron, and Queues.

### Alternatives Considered

- managed PostgreSQL + independent Auth/Storage/jobs providers,
- cloud-provider-native managed services,
- application hosting platform plus independent managed database,
- another backend-as-a-service.

### Recommended Direction

Evaluate managed-backend responsibilities independently:

| Capability | Recommendation posture |
|---|---|
| PostgreSQL hosting | Strong candidate if `D-ARCH-002` selects PostgreSQL and region/backup/connection needs fit |
| Auth | Candidate only; governed by `D-ARCH-004` / `D-SEC-002` |
| Storage | Conditional candidate; governed by `D-ARCH-010` |
| RLS | Useful defense-in-depth mechanism if adopted; governed by `D-SEC-008` |
| Edge/server functions | Optional runtime, not required to own application architecture |
| Realtime | No current Phase 1 requirement justifies it as a baseline dependency |
| Cron/Queues | Credible job candidates, but governed by `D-ARCH-007` |
| Operational tooling | Evaluate backup/restore, logs, connection limits, region, incident workflow |

GymPulse should continue to own principal resolution, capability authorization, application use cases, domain rules, transaction orchestration, idempotency, audit semantics, and provider ports/adapters.

### Why

A managed platform can reduce Phase 1 operational load, but bundling every offered feature would create unnecessary coupling and could blur security boundaries.

### Tradeoffs

- fewer infrastructure components versus greater platform coupling,
- integrated Auth/RLS/Storage ergonomics versus service-role/policy complexity,
- faster setup versus migration/exit planning needs.

### Security Impact

Service-role credentials must stay server-only. If client-accessible database patterns are ever used, RLS policy assurance becomes P0. Even with RLS, capability authorization remains application-owned.

### Reliability Impact

Managed backups/operations can help, but provider outages and job semantics still require application-level reconciliation/diagnostics.

### Performance Impact

App/database region proximity and connection strategy matter more than brand choice.

### Scalability Impact

Good early scaling path if quotas/connection limits are monitored; architecture must not depend on proprietary client behavior for core domain truth.

### Operational Impact

Potentially simpler database/Auth/Storage operations, with provider-specific incident and migration procedures.

### Developer Experience Impact

Integrated local/dev tooling can be productive; direct-client patterns must not bypass server architecture.

### Reversibility

Medium if GymPulse uses standard PostgreSQL and internal ports; lower if domain logic moves into platform-specific functions/policies excessively.

### Validation / Spike Required

- region and data-residency fit,
- backup/restore rehearsal capability,
- pooled/serverless connections,
- RLS/service-role/background-job access tests,
- Auth session/revocation spike,
- Cron/Queues durability/visibility test if considered,
- export/exit path for PostgreSQL data and storage metadata.

### ADR Required

Yes under `D-ARCH-014`.

### What Would Change the Recommendation

Jurisdiction constraints, missing region/backup controls, unacceptable service-role/RLS complexity, required worker behavior unsupported by selected services, or better operational fit from independent providers.

## 14. Authentication and Session Architecture

### Decision IDs

- `D-ARCH-004`: `OPEN`
- `D-SEC-002`: `OPEN`
- `D-SEC-004`: `OPEN` session lifecycle policy

### Problem Being Solved

Securely prove staff/member identity across web and possible future native clients, with revocation, expiry, account recovery, identity linking, and server-side principal resolution.

### Relevant Requirements

`FR-IDENTITY-001..003`, `FR-AUTHZ-*`, `NFR-SECURITY-002..005,010..011`, `NFR-TESTABILITY-004`.

### Relevant Architecture Principles

`ARCH-PRIN-001..003`, `ARCH-PRIN-016`.

### Current Candidate

Managed authentication provider; potential member phone OTP/passwordless flow; web sessions compatible with secure HttpOnly cookies; native secure storage if a native client is accepted.

### Alternatives Considered

- Supabase Auth if Supabase responsibilities are accepted,
- specialized managed auth providers,
- custom credential/password/OTP implementation,
- magic-link member access.

### Recommended Direction

Prefer managed authentication over building credential/OTP infrastructure. Keep staff and member identity mappings explicit in GymPulse (`AuthIdentity -> User` and/or member-auth link) rather than treating auth-provider metadata as domain identity.

For members, phone OTP/passwordless is a strong pilot candidate because member contact is phone-centric, but it remains unselected until abuse protection, cost, account-recovery, phone-change, and pilot UX are validated.

For staff web, prefer a secure server-managed/cookie-compatible session model where the selected provider/runtime supports it. Final cookie/token/session mechanics require the auth/session ADR.

### Why

Authentication is security-sensitive but not product-differentiating. Managed providers can reduce credential-handling risk while GymPulse keeps business authorization.

### Tradeoffs

- provider cost/lock-in,
- OTP delivery/abuse and recovery complexity,
- cross-platform session mechanics,
- auth provider availability becomes a dependency.

### Security Impact

High. Must support expiry/revocation, secure token handling, enumeration/OTP abuse controls, server-side verification, and no raw phone-number authorization.

### Reliability Impact

Session/provider outage behavior and token refresh must fail safely without corrupting canonical business state.

### Performance Impact

Session verification/identity lookup should be bounded and cache only where safe.

### Scalability Impact

Managed auth scales identity delivery, while GymPulse authorization data stays independently evolvable.

### Operational Impact

Requires staging/test identities, recovery workflows, provider incident handling, and revocation diagnostics.

### Developer Experience Impact

Managed SDKs can accelerate setup but must be wrapped at the authentication-verification boundary.

### Reversibility

Medium if provider subject IDs are mapped through an internal identity layer rather than used as primary domain IDs everywhere.

### Validation / Spike Required

- staff login/logout/revocation,
- member OTP request/verify/abuse limits,
- account recovery/phone change,
- server-side principal mapping,
- web cookie/CSRF posture,
- future native refresh-token secure storage path,
- auth-provider outage/expired-session behavior.

### ADR Required

Yes for `D-ARCH-004`; member method requires explicit `D-SEC-002` decision evidence/ADR or equivalent security decision governance.

### What Would Change the Recommendation

Pilot members lack reliable phone access, OTP cost/delivery is unacceptable, jurisdiction/provider constraints, or a stronger identity source is already deployed at the gym.

## 15. Authorization Implementation

### Decision ID

`D-ARCH-015`

### Current Decision Status

`PROPOSED`

### Problem Being Solved

Enforce the established formula:

```text
principal + tenant/resource scope + named capability -> allow / deny
```

### Relevant Requirements

`FR-AUTHZ-001..004`, `FR-CROSS-003`, `NFR-SECURITY-001..003`, `NFR-TESTABILITY-004`.

### Relevant Architecture Principles

`ARCH-PRIN-001..003`, `ARCH-PRIN-016`.

### Current Candidate

A GymPulse-owned authorization module/policy service in the trusted application boundary, backed by role/capability assignments in canonical persistence.

### Alternatives Considered

- auth-provider roles/claims as primary authority,
- framework middleware-only authorization,
- external policy engines,
- database RLS-only authorization.

### Recommended Direction

Keep authorization as an application/security component independent of UI/framework/provider. Roles are bundles; runtime decisions use named capabilities plus resolved scope/resource ownership. Middleware may perform coarse checks, but use-case/resource authorization must remain close to protected application behavior.

### Why

GymPulse needs branch/member self-scope, delegated staff authority, and future role overlap that cannot be expressed safely as one role string.

### Tradeoffs

More explicit policy code and tests than provider-role shortcuts, but substantially clearer security semantics.

### Security Impact

Directly reduces BOLA/IDOR/cross-tenant risk when consistently applied.

### Reliability Impact

Authorization failures are deterministic business/security results; policy lookup must not silently default allow.

### Performance Impact

May require efficient assignment/scope lookup. Cache only if invalidation/revocation correctness is preserved.

### Scalability Impact

Named capabilities scale better than scattered role checks as roles/branches evolve.

### Operational Impact

Requires auditable role assignment changes and support diagnostics for denials.

### Developer Experience Impact

Central helpers/policies improve consistency and testability.

### Reversibility

High if policy interfaces are provider/framework independent.

### Validation / Spike Required

Positive/negative authorization matrix for Member, Front Desk, Manager, Owner; revoked assignment; cross-branch/cross-tenant access; background-system actor context.

### ADR Required

Yes under `D-ARCH-015`.

### What Would Change the Recommendation

Nothing may remove server-side capability/scope authorization. Only the policy implementation/storage engine may change.

## 16. Tenant Isolation and PostgreSQL RLS

### Decision ID

`D-SEC-008`

### Current Decision Status

`OPEN` when applicable.

### Problem Being Solved

Prevent tenant data leakage even when application code makes a query mistake, without confusing database row policy with business authorization.

### Relevant Requirements

`FR-AUTHZ-001`, `FR-CROSS-003`, `NFR-SECURITY-001..003`, `NFR-SCALABILITY-001`, `NFR-TESTABILITY-004`.

### Relevant Architecture Principles

`ARCH-PRIN-001..003`, `ARCH-PRIN-016`.

### Current Candidate

Application-level tenant authorization plus PostgreSQL RLS defense in depth on tenant-owned tables where the selected topology makes it reliable and testable.

### Alternatives Considered

- application-only tenant predicates,
- RLS for all tenant tables,
- separate database/schema per tenant,
- direct client database access with RLS-centric authorization.

### Recommended Direction

Application authorization remains mandatory. If PostgreSQL/Supabase is selected, use RLS as defense in depth for tenant-owned data after explicit policy design.

Define separate access modes for:

- normal application requests,
- background jobs,
- migrations/admin operations,
- support/diagnostic access,
- any future direct-client access.

Do not use broad service-role bypass in application code as a shortcut that makes RLS tests meaningless.

### Why

Defense in depth is valuable for P0 tenant isolation, but GymPulse permissions are richer than `tenant_id = claim`.

### Tradeoffs

- stronger blast-radius reduction versus policy/query complexity,
- service worker/admin/migration access needs explicit bypass/role design,
- debugging can be harder if execution identity is unclear.

### Security Impact

Potentially strong improvement when tested. PostgreSQL table owners and `BYPASSRLS` roles can bypass policy, so privileged paths need separate controls.

### Reliability Impact

Misconfigured RLS can deny legitimate jobs or, worse, leave unintended privileged access. Negative tests are mandatory.

### Performance Impact

Policy/index design must be profiled for high-volume tenant queries.

### Scalability Impact

Shared-schema tenancy remains operationally simple early; RLS can reinforce isolation as tenant count grows.

### Operational Impact

Migrations, emergency access, backups, and background workers need documented roles and runbooks.

### Developer Experience Impact

Local/test tooling must reproduce policies; hidden superuser behavior can give false confidence.

### Reversibility

Medium. Policies can be changed, but application code/data ownership should remain tenant-explicit regardless.

### Validation / Spike Required

Cross-tenant read/write/insert/update tests, service-role behavior, worker scoped access, migration role, connection-pool/session-variable strategy if used.

### ADR Required

Yes under `D-SEC-008` when RLS becomes part of the production security model.

### What Would Change the Recommendation

A topology that never permits meaningful database-layer tenant enforcement, or a future isolation model with dedicated databases/stronger boundaries. Application authz still remains.

## 17. Background Jobs and Scheduling

### Decision ID

`D-ARCH-007`

### Current Decision Status

`OPEN`

### Problem Being Solved

Durably execute no-show scans, renewal scans, notification dispatch, payment reconciliation, owner summaries, data-quality scans, and retryable provider work with tenant scope, dedupe, visibility, and recovery.

### Relevant Requirements

`FR-RETENTION-*`, `FR-RENEWAL-*`, `FR-NOTIFICATION-*`, `FR-SUMMARY-001`, `FR-DATA-QUALITY-*`, `NFR-RELIABILITY-003`, `NFR-AVAILABILITY-003`, `NFR-OBSERVABILITY-005`, `NFR-SCALABILITY-004`.

### Relevant Architecture Principles

`ARCH-PRIN-006`, `ARCH-PRIN-008`, `ARCH-PRIN-011`, `ARCH-PRIN-013`, `ARCH-PRIN-014`.

### Current Candidates

- PostgreSQL-backed queue/job system such as pg-boss,
- Supabase Queues + Cron if Supabase is accepted,
- managed durable TypeScript task platform such as Trigger.dev,
- Redis-backed queue such as BullMQ only if Redis is separately justified,
- platform cron invoking application endpoints only for simple schedule triggering, not as the whole durable-work model.

### Recommended Direction

For Phase 1, if PostgreSQL is accepted, prefer a PostgreSQL-backed durable queue/outbox + scheduler approach before adding Redis. This keeps correctness-critical continuation close to canonical transactions and reduces infrastructure count.

Leading candidates to spike:

1. pg-boss with PostgreSQL, or
2. Supabase Queues + Cron when Supabase is selected for managed Postgres, or
3. a managed durable task platform when built-in visibility/retry/deployment ergonomics materially reduce operations.

The job product must never be treated as the only idempotency protection; canonical business uniqueness still lives in the application/database model.

### Why

Workload volume is modest but durability/diagnostics are critical. The architecture needs retries and visibility more than extreme queue throughput.

### Tradeoffs

PostgreSQL-backed jobs:
- fewer infrastructure systems,
- potential DB load/coupling,
- good transactional/outbox alignment.

Managed task platform:
- stronger operational UI/retry ergonomics,
- additional provider dependency/cost,
- possible runtime coupling.

Redis queue:
- mature high-throughput patterns,
- adds a separate critical data service before measured need.

### Security Impact

Jobs must carry explicit tenant/gym scope and use server-only credentials. Job UIs/provider payloads must avoid unnecessary PII/secrets.

### Reliability Impact

Must support durable delivery, retries/backoff, deterministic dedupe/business keys, visible failure, recovery/dead-letter equivalent, and missed-schedule recovery.

### Performance Impact

Current workload is database/provider-bound; extreme queue throughput is not a Phase 1 driver.

### Scalability Impact

Worker concurrency can scale separately later. Avoid global unscoped scans where per-tenant jobs are safer.

### Operational Impact

Operators need to answer whether each gym-local scan ran and diagnose provider/job failures without provider-console archaeology.

### Developer Experience Impact

TypeScript-native handlers and local testability are valuable. Platform decorators/config must not own domain rules.

### Reversibility

Medium-High if handlers depend on internal job contracts/ports rather than runner-specific payload types.

### Validation / Spike Required

- gym-time scheduled execution,
- duplicate job delivery,
- retry after crash/partial commit,
- payment post-commit continuation,
- dead-letter/recovery equivalent,
- per-tenant failure isolation,
- staging/production visibility,
- provider outage backoff.

### ADR Required

Yes under `D-ARCH-007`.

### What Would Change the Recommendation

Measured queue throughput/coordination demands, hosting restrictions, a managed-backend job capability that clearly satisfies durability/visibility, or operational evidence that a managed task platform materially reduces risk.

## 18. Redis / Cache / Broker

### Decision ID

`D-ARCH-008`

### Current Decision Status

`OPEN`

### Problem Being Solved

Potential future high-throughput cache, ephemeral coordination, rate limiting, or queue/broker needs.

### Relevant Requirements

`NFR-PERFORMANCE-002..005`, `NFR-SCALABILITY-003..006`, `NFR-RELIABILITY-001..004`.

### Relevant Architecture Principles

Operational simplicity and `ARCH-PRIN-006`, `ARCH-PRIN-010`, `ARCH-PRIN-013`.

### Current Candidate

No Redis dependency in the Phase 1 baseline.

### Alternatives Considered

PostgreSQL-backed jobs/locks/queries, platform-native rate limits, in-process cache for non-authoritative ephemeral data, Redis/Valkey.

### Recommended Direction

Do not add Redis/Valkey until one concrete requirement justifies operating another stateful dependency.

Concrete triggers could include:

- selected job runner requires Redis and wins evaluation on reliability/operations,
- measured dashboard/query pressure cannot be solved acceptably with indexes/read models/materialization,
- high-volume distributed rate limiting/coordination requires shared low-latency state,
- pub/sub/realtime workload becomes an approved product requirement.

Redis must never be the sole permanent correctness guard for attendance/payment effects.

### Why

Current Phase 1 requirements emphasize correctness and modest operational volume, not sub-millisecond shared cache or extreme queue throughput.

### Tradeoffs

Deferring Redis reduces infrastructure and failure modes but may require later introduction if load/coordination evidence changes.

### Security Impact

Avoids another credential/network/data surface initially.

### Reliability Impact

Avoids adding a dependency whose outage could complicate jobs/caching before it is needed.

### Performance Impact

No assumed cache boost; optimize SQL/indexes and measure first.

### Scalability Impact

Redis remains available as a later scale tool.

### Operational Impact

Simpler Phase 1 monitoring/backups/networking.

### Developer Experience Impact

Fewer local services.

### Reversibility

High; can introduce behind ports later.

### Validation / Spike Required

Performance baseline before any cache proposal.

### ADR Required

Only when introduction becomes material under `D-ARCH-008`.

### What Would Change the Recommendation

A measured requirement or winning job/rate-limit architecture that genuinely requires Redis/Valkey.

## 19. Payment Integration and Provider

### Decision ID

`D-PROVIDER-001`

### Current Decision Status

`OPEN`

### Problem Being Solved

Accept Indian member payments, especially UPI, while preserving verified webhook truth, exactly-once business effects, refunds/reconciliation, and reliable pilot operations.

### Relevant Requirements

`FR-PAYMENT-001..010`, `FR-RENEWAL-003..007`, `FR-RECEIPT-*`, `NFR-SECURITY-007..008`, `NFR-RELIABILITY-001,002,008`, `NFR-OBSERVABILITY-004`.

### Relevant Architecture Principles

`ARCH-PRIN-005`, `ARCH-PRIN-006`, `ARCH-PRIN-010..013`.

### Current Candidates

Razorpay and Cashfree are credible India-focused candidates for a pilot comparison. Provider abstraction remains mandatory.

### Alternatives Considered

Other India-capable payment gateways/aggregators that satisfy the confirmed pilot payment methods, settlement, webhook, refund, and support requirements.

### Recommended Direction

Do **not** choose a provider yet. Run a bounded sandbox/provider evaluation after the pilot gym confirms launch payment methods and operational expectations.

Minimum provider scorecard:

- UPI flow supported for the 2026 regulatory/product environment,
- cards/netbanking only if pilot needs them,
- webhook authenticity using raw-request verification as required,
- duplicate/retry behavior,
- payment/order reference model,
- status/reconciliation API,
- full refund support and reversal semantics if Phase 1 enables them,
- sandbox fidelity,
- fees/settlement timing,
- India support/escalation quality,
- documentation and incident diagnostics.

Current ecosystem note: Razorpay documents that UPI Collect was deprecated for most use cases effective February 2026 and directs merchants toward UPI Intent/QR-style flows. Any pilot evaluation must test the current supported UPI path rather than implementing an obsolete collect flow.

### Why

The architecture cannot safely select a provider from popularity. Pilot methods, settlement/support, refund policy, and operational reconciliation are still open business inputs.

### Tradeoffs

Provider SDK convenience versus lock-in; fee/support differences; varying webhook and reconciliation semantics.

### Security Impact

Provider secrets and signature verification remain server-only. GymPulse stores no raw card/UPI credentials.

### Reliability Impact

Webhook replay, delayed status, ambiguous checkout, and reconciliation must be supported through one canonical payment processor.

### Performance Impact

Provider latency must stay outside long database transactions.

### Scalability Impact

Adapter design permits provider replacement/multi-provider evolution later if justified.

### Operational Impact

Sandbox quality, support, settlement/reconciliation reports, incident escalation, and refund tooling are decision-critical.

### Developer Experience Impact

SDK quality matters, but cannot outweigh correctness/support requirements.

### Reversibility

Medium if all provider-specific payloads stay in adapters and immutable provider references are retained.

### Validation / Spike Required

For each shortlisted provider:

- UPI checkout on representative devices,
- raw webhook signature verification,
- duplicate webhook replay,
- delayed webhook/pending reconciliation,
- amount/currency/reference mismatch,
- refund if in scope,
- sandbox-to-production configuration separation,
- support/escalation/fee review with business owner.

### ADR Required

Yes under `D-PROVIDER-001`.

### What Would Change the Recommendation

Confirmed payment methods, negotiated fees/support, settlement needs, provider regional/compliance constraints, or sandbox evidence showing one provider materially safer/easier to reconcile.

## 20. Messaging Provider

### Decision ID

`D-PROVIDER-002`

### Current Decision Status

`OPEN`

### Problem Being Solved

Deliver approved Phase 1 service/transactional messages such as no-show care, renewal reminders, payment results, and owner summaries with templates, callbacks, dedupe, consent/policy, and operational diagnosis.

### Relevant Requirements

`FR-NOTIFICATION-001..004`, `FR-CONSENT-001..002`, `NFR-AVAILABILITY-002`, `NFR-PRIVACY-002,004`, `NFR-MAINTAINABILITY-003`.

### Relevant Architecture Principles

`ARCH-PRIN-011..015`.

### Current Candidates

WhatsApp-capable providers/BSPs such as Twilio or Gupshup, or a direct WhatsApp Business Platform integration where operational ownership makes sense. SMS/email providers remain optional according to launch channels.

### Alternatives Considered

WhatsApp-only launch, WhatsApp + SMS fallback, in-app first with external messaging only for selected flows, other approved BSPs.

### Recommended Direction

Keep provider selection open until launch channels and service/marketing policy are confirmed. Architect business template keys and `NotificationIntent` independently from provider template IDs.

For shortlisted providers, verify:

- WhatsApp template lifecycle/approval,
- India recipient support,
- delivery/status callbacks actually exposed,
- webhook verification,
- rate limits and retry semantics,
- sandbox/test recipient workflow,
- quiet-hours/template localization support as required,
- pricing and operational support.

### Why

The core architecture needs provider-neutral policy/deduplication more than a specific vendor. The product must not accidentally combine marketing consent with service communication.

### Tradeoffs

BSP convenience/support versus cost/provider lock-in; direct integration versus more operational ownership.

### Security Impact

Credentials/callback secrets remain server-only. Message content/logs must minimize PII.

### Reliability Impact

Provider outage must leave durable intent/failure state; stale queued messages recheck business state before sending.

### Performance Impact

Dispatch is async and should not block canonical transactions.

### Scalability Impact

Provider adapter allows later channel/provider changes.

### Operational Impact

Template approval, delivery failures, recipient validity, and support diagnostics are recurring operational concerns.

### Developer Experience Impact

SDK/API ergonomics matter after webhook/status semantics and operational support pass the scorecard.

### Reversibility

Medium-High if provider template IDs/config stay outside domain logic.

### Validation / Spike Required

Template send, status callback, duplicate callback, transient/permanent error classification, opt-out/policy suppression, test recipients, quiet-hours behavior if enabled.

### ADR Required

Yes under `D-PROVIDER-002`.

### What Would Change the Recommendation

Pilot chooses no external messaging at launch, chooses SMS/email instead of WhatsApp, or provider pricing/template/support constraints materially change the shortlist.

## 21. Protected Object Storage

### Decision ID

`D-ARCH-010`

### Current Decision Status

`OPEN`

### Problem Being Solved

Store protected binary/generated artifacts such as receipt PDFs or exports if Phase 1 actually requires persisted files.

### Relevant Requirements

`FR-RECEIPT-*`, `NFR-PRIVACY-003`, `NFR-SECURITY-004,006`, `NFR-AVAILABILITY-004`, `NFR-DATA-004`.

### Relevant Architecture Principles

`ARCH-PRIN-001`, `ARCH-PRIN-015`, `ARCH-PRIN-016`.

### Current Candidate

Private managed/S3-compatible object storage, including Supabase Storage if Supabase is selected.

### Alternatives Considered

Generate receipt/export on demand from canonical data, store small generated artifacts in another approved durable service, S3-compatible providers.

### Recommended Direction

Do not provision object storage merely because the architecture has a conditional storage boundary. First confirm whether Phase 1 requires persisted receipt/export binaries rather than structured receipt records plus on-demand generation.

If required, use private-by-default storage with tenant-scoped metadata, short-lived signed access, explicit retention, and server-authorized access.

### Why

Storage adds credentials, retention, access-control and backup obligations. The current product may not need general uploads.

### Tradeoffs

Persisted files simplify repeated downloads but add lifecycle/authorization management; on-demand generation reduces storage but increases compute/render dependency.

### Security Impact

Private bucket/object policy, random keys, signed URLs, no admin credentials in clients.

### Reliability Impact

Business truth remains in canonical persistence so object-store outage does not corrupt payments/memberships.

### Performance Impact

Signed direct downloads can offload application runtime when needed.

### Scalability Impact

Managed object storage scales independently.

### Operational Impact

Retention/deletion, failed generation, stale links, and artifact regeneration need runbooks.

### Developer Experience Impact

Straightforward through a storage port once actual artifact requirements are known.

### Reversibility

High with a provider-neutral storage port and metadata in canonical persistence.

### Validation / Spike Required

Private upload/download, signed URL expiry, cross-tenant denial, retention/delete behavior, generated receipt/export regeneration.

### ADR Required

Yes if a provider/access model becomes a material production dependency.

### What Would Change the Recommendation

Confirmed Phase 1 requirement for persisted receipts/exports or later approved member file/image workflows.

## 22. Observability

### Decision ID

`D-PROVIDER-006`

### Current Decision Status

`OPEN`

### Problem Being Solved

Diagnose API exceptions, job failures, payment/webhook anomalies, cross-tenant denials, provider incidents, and latency without leaking secrets/PII.

### Relevant Requirements

`NFR-OBSERVABILITY-001..007`, `NFR-SECURITY-011`, `NFR-AVAILABILITY-003`, `NFR-RELIABILITY-007..008`.

### Relevant Architecture Principles

`ARCH-PRIN-013`, `ARCH-PRIN-014`, `ARCH-PRIN-015`.

### Current Candidate

Capability baseline:

- structured application/job logs,
- request/job/correlation IDs,
- centralized error monitoring,
- payment/webhook/job diagnostics,
- performance/latency telemetry,
- actionable alerts,
- OpenTelemetry-compatible traces/metrics where practical to reduce provider coupling.

Exact managed provider remains open.

### Alternatives Considered

Hosting-native observability, managed error-monitoring/APM provider, OpenTelemetry collector + managed backend, cloud-native logs/metrics.

### Recommended Direction

Standardize internal correlation/context semantics first, then select a provider that can ingest them and satisfy retention/cost/alerting needs. Use OpenTelemetry on server components where it adds portability and supported instrumentation; do not force immature/browser instrumentation into Phase 1 merely for uniformity.

### Why

Operational correctness requires investigation across request -> job -> provider event -> business effect, independent of one provider UI.

### Tradeoffs

More instrumentation improves diagnosis but increases cost/noise and privacy surface. Alert quality matters more than event volume.

### Security Impact

Redact tokens, OTPs, payment secrets, full messages, and sensitive notes. Tenant/resource IDs only where operationally safe.

### Reliability Impact

Strong positive when payment/job/retry state is diagnosable; observability outage must not block canonical business operations.

### Performance Impact

Sampling/batching and exporter behavior must avoid material request latency.

### Scalability Impact

Correlation standards remain stable as runtimes split later.

### Operational Impact

Need alert ownership, retention, environment separation, dashboards for payment/jobs/data-quality.

### Developer Experience Impact

One logging/context API should hide provider SDK details from domain code.

### Reversibility

Medium-High with vendor-neutral internal instrumentation/contracts.

### Validation / Spike Required

Trace one QR request, one payment webhook/effect, one retrying job; verify redaction, cross-runtime correlation, alert path, cost/retention sample.

### ADR Required

Yes for managed provider selection under `D-PROVIDER-006`.

### What Would Change the Recommendation

Hosting platform provides adequate integrated observability at lower operational cost, or compliance/retention requirements force a different telemetry location.

## 23. Product Analytics

### Decision ID

`D-PROVIDER-005`

### Current Decision Status

`OPEN`

### Problem Being Solved

Measure member/staff product usage and funnels without confusing analytics with canonical operational metrics or exposing unnecessary PII.

### Relevant Requirements

`NFR-PRIVACY-001..004`, `NFR-RELIABILITY-005`, `NFR-OBSERVABILITY-006`.

### Relevant Architecture Principles

`ARCH-PRIN-004`, `ARCH-PRIN-014`, `ARCH-PRIN-015`.

### Current Candidate

No provider required for architecture completion. Define a minimal privacy-safe event vocabulary when pilot questions are known.

### Alternatives Considered

Managed product analytics provider, privacy-focused analytics, warehouse/event pipeline later, no external analytics during pilot.

### Recommended Direction

Defer provider selection. Operational KPIs such as attendance, renewal revenue, payment success, and returns are computed from canonical records. Product analytics may capture non-authoritative events such as view/click/scan-start with pseudonymous IDs and no raw phone/email/notes/provider payloads.

### Why

The pilot's first success metrics can often be answered from canonical business data. Adding analytics infrastructure before funnel questions are defined creates noise/privacy risk.

### Tradeoffs

Deferral loses some behavioral telemetry early; adopting too early creates cost and schema churn.

### Security Impact

PII minimization and tenant-safe event properties required.

### Reliability Impact

Analytics failure never affects business transactions.

### Performance Impact

Events should be non-blocking/batched where applicable.

### Scalability Impact

Provider can be added behind a small analytics port later.

### Operational Impact

Event taxonomy/retention/data-access ownership must be explicit before broad collection.

### Developer Experience Impact

Minimal event helper prevents ad-hoc analytics calls in domain logic.

### Reversibility

High if event names/internal port are provider-neutral.

### Validation / Spike Required

Pilot question -> event mapping, privacy review, one funnel prototype, cost/retention review.

### ADR Required

Provider decision under `D-PROVIDER-005` if/when material.

### What Would Change the Recommendation

A pilot success metric that cannot be reconstructed from canonical data and requires behavioral funnel instrumentation.

## 24. Testing Stack

### Decision ID

Decision Register Gap for the primary test-tooling baseline if the team wants this governed canonically.

### Current Decision Status

No canonical technology decision exists.

### Problem Being Solved

Automate deterministic domain tests, PostgreSQL transactions/constraints, API contracts, authorization negative cases, idempotency, provider adapters, background jobs, and web/mobile E2E.

### Relevant Requirements

`NFR-TESTABILITY-001..005`, Phase 1 quality gates, `NFR-SECURITY-001`, `NFR-RELIABILITY-001..004`.

### Relevant Architecture Principles

`ARCH-PRIN-001`, `ARCH-PRIN-005..006`, `ARCH-PRIN-010`, `ARCH-PRIN-013..014`.

### Current Candidates

- Vitest for TypeScript unit/application tests,
- real PostgreSQL integration tests using isolated databases/Testcontainers-style orchestration,
- Playwright for Owner/Staff and responsive-member web E2E,
- provider sandbox/fakes at adapter boundaries,
- mobile E2E tooling such as Maestro/Detox only after native delivery is accepted.

### Alternatives Considered

Jest or Node built-in test runner, Cypress for web E2E, mocked/in-memory database tests only, provider-only sandbox manual tests.

### Recommended Direction

If TypeScript/Node is approved, use a fast TS-native unit/application runner, real PostgreSQL integration tests for transaction/constraint/RLS behavior, and Playwright for browser E2E. Do not replace database integration tests with mocks for payment/attendance uniqueness.

Vitest is the leading unit/application candidate. Playwright is the leading web E2E candidate because it supports multiple browser projects and isolated parallel workers. Testcontainers-style PostgreSQL environments are a strong integration-test candidate when CI supports containers.

### Why

GymPulse's highest risks are concurrency, tenant isolation, idempotency, webhook verification, and state transitions, which require tests below and above UI layers.

### Tradeoffs

Real database/E2E tests cost more CI time than pure unit tests but provide evidence on the exact failure modes that matter.

### Security Impact

Negative authorization/RLS tests become release gates; CI must never use production credentials/data.

### Reliability Impact

High positive when duplicate/retry/concurrency tests are automated.

### Performance Impact

CI duration must be managed with test layering/parallelism, not by removing critical integration coverage.

### Scalability Impact

Workspace/project test configuration can run affected suites as monorepo grows.

### Operational Impact

Staging/provider sandbox and migration-from-zero tests become part of release confidence.

### Developer Experience Impact

One primary runner plus explicit integration/E2E layers is easier to understand than many overlapping frameworks.

### Reversibility

High for unit/E2E tools if tests use business interfaces instead of tool-specific architecture.

### Validation / Spike Required

- transaction/concurrency test with real PostgreSQL,
- multi-browser QR/member flow feasibility,
- provider webhook sandbox/fake test,
- worker retry/time-control test,
- CI runtime baseline.

### ADR Required

Not necessarily a full ADR unless the chosen test infrastructure becomes expensive/cross-cutting. It should at least receive a canonical engineering decision or standards entry after the decision-register gap is normalized.

### What Would Change the Recommendation

Chosen frontend/runtime tooling with materially better integrated testing, CI environment without container support, or native member app decision requiring mobile-specific E2E earlier.

## 25. Hosting and Deployment

### Decision ID

`D-ARCH-009`

### Current Decision Status

`OPEN`

### Problem Being Solved

Host web/API/workers with secure secrets, database connectivity, staging/preview separation, observability, rollback, scaling, and regional controls.

### Relevant Requirements

`NFR-OPERATIONS-001..005`, `NFR-AVAILABILITY-*`, `NFR-SECURITY-004..006`, `NFR-SCALABILITY-003..005`, `NFR-OBSERVABILITY-*`.

### Relevant Architecture Principles

`ARCH-PRIN-011`, `ARCH-PRIN-013`, `ARCH-PRIN-014`, `ARCH-PRIN-016`.

### Current Candidates

Two broad deployment families:

1. serverless/web-first hosting such as Vercel for Next.js web/API responsibilities, paired with a deliberately selected durable job solution and managed database, or
2. service/worker hosting such as Render where web/API/background workers can run as separate services with private networking, plus managed database as selected.

Other cloud providers remain valid alternatives.

### Recommended Direction

Do not select hosting before `D-ARCH-006`, `D-ARCH-007`, and `D-ARCH-014` are narrowed.

If API is co-hosted with Next.js and durable jobs are external/managed, a Next.js-optimized serverless platform is a strong candidate.

If GymPulse wants one operational surface for an independent API plus long-lived background workers/private services, a service/worker platform is a strong candidate.

Deployment region must wait for `D-SEC-001` jurisdiction/data-residency obligations before production data is committed.

### Why

Hosting should fit runtime/job/connection/security needs, not drive the logical architecture backward.

### Tradeoffs

Serverless web-first:
- excellent web deployment/preview ergonomics,
- function/runtime/cron limits require deliberate job design,
- database connection strategy matters.

Service/worker platform:
- straightforward long-running worker/private service model,
- potentially more service operations and scaling configuration.

### Security Impact

Environment-scoped secrets, private database networking where possible, no production secrets in PR previews, TLS, least-privilege deployment tokens.

### Reliability Impact

Need rollback/forward-fix, health checks, separate worker recovery, provider webhook reachability, backup/restore for data services.

### Performance Impact

Region/database proximity, cold-start/runtime behavior, and connection pooling must be tested for check-in and webhook paths.

### Scalability Impact

Stateless web/API and independent workers should scale separately when topology allows.

### Operational Impact

Number of deployables, logs, networking, cron/jobs, preview environments, and incident tooling differ materially by platform.

### Developer Experience Impact

Preview deployments and consistent environment configuration are valuable but cannot expose production data/secrets.

### Reversibility

Medium when deployment artifacts use standard Node/container/runtime contracts; lower when deeply tied to platform-only APIs.

### Validation / Spike Required

- preview/staging isolation,
- web/API latency to database,
- raw webhook path,
- worker/scheduler recovery,
- secret scoping,
- rollback/forward-fix,
- observability integration,
- region/compliance review.

### ADR Required

Yes under `D-ARCH-009`.

### What Would Change the Recommendation

Final API topology, managed backend/database region, job runner, compliance/data residency, or cost/scale evidence.

## 26. CI/CD and Secrets

### Decision ID

Decision Register Gap for the production CI/CD/release and secret-management tooling baseline.

### Current Decision Status

No canonical technology decision exists.

### Problem Being Solved

Make every release reproducible and gated by install/typecheck/lint/tests/build/migration/security checks while isolating environment secrets and supporting rollback/forward-fix.

### Relevant Requirements

`NFR-OPERATIONS-001..004`, `NFR-SECURITY-004`, `NFR-MAINTAINABILITY-004..006`, `NFR-TESTABILITY-*`.

### Relevant Architecture Principles

`ARCH-PRIN-013`, `ARCH-PRIN-014`, `ARCH-PRIN-016`.

### Current Candidate

GitHub Actions is a leading candidate because source/PR governance is already GitHub-based, combined with environment-scoped secrets/approvals and hosting-provider deployment integration.

### Alternatives Considered

Hosting-provider-native build pipelines, other CI platforms, self-hosted runners where future security/compliance requires them.

### Recommended Direction

Adopt a pipeline capability model first:

```text
checkout
  -> frozen dependency install
  -> lint
  -> typecheck
  -> unit/domain tests
  -> integration/database tests
  -> authorization/idempotency contract tests
  -> build
  -> migration-from-zero / migration validation
  -> dependency/secret/security checks
  -> preview or staging deployment
  -> smoke/UAT gate
  -> protected production deploy
  -> post-deploy smoke + monitoring
```

Secrets must be environment-scoped, server-only, masked from logs, and unavailable to untrusted PR code. Production migration credentials should be narrower than routine application credentials where practical.

### Why

Production safety depends more on gates and secret boundaries than the CI vendor itself.

### Tradeoffs

Stronger gates increase CI duration and setup; weak gates shift failures to production.

### Security Impact

High. Least-privilege CI tokens, environment approvals, dependency/secret scanning, and no production secrets in previews are required.

### Reliability Impact

Migration validation, automated tests, smoke checks, and rollback/forward-fix improve release safety.

### Performance Impact

CI should use affected-package caching/parallelism after correctness coverage is established.

### Scalability Impact

Monorepo task graph can limit work while shared-domain changes trigger dependent suites.

### Operational Impact

Need auditability of production deploys, release ownership, environment separation, and secret rotation.

### Developer Experience Impact

Fast deterministic CI improves iteration; excessive flaky E2E creates bypass pressure and must be fixed rather than ignored.

### Reversibility

High if pipeline steps are conventional and deployment-specific integration is isolated.

### Validation / Spike Required

PR without production secrets, ephemeral test DB, migration check, provider sandbox credentials in staging only, deployment approval, rollback smoke test.

### ADR Required

Recommended if the production release/secrets architecture becomes a material provider dependency; otherwise govern as an explicit engineering/operations decision after the canonical gap is registered.

### What Would Change the Recommendation

Compliance requiring self-hosted runners or a selected hosting platform providing a materially safer/integrated deployment path.

## 27. Technology Decision Dependency Order

Technology decisions are not independent. Recommended dependency order:

```text
Phase 1 architecture style (D-ARCH-005 — DECIDED)
  -> primary language/runtime (D-ARCH-016 — DECIDED)
  -> repository/workspace (D-ARCH-001 — DECIDED)
      -> package manager (D-ARCH-011)
      -> Owner/Staff web framework (D-ARCH-012)
      -> Member client strategy (D-ARCH-013)
  -> canonical database (D-ARCH-002 — DECIDED)
      -> data access/migrations (D-ARCH-017 — PROPOSED)
      -> managed backend responsibilities (D-ARCH-014)
      -> tenant isolation/RLS (D-SEC-008)
  -> authentication/session (D-ARCH-004, D-SEC-002, D-SEC-004)
      -> authorization implementation (D-ARCH-015)
  -> API contract style (D-ARCH-003)
      -> API deployment topology (D-ARCH-006)
  -> background jobs (D-ARCH-007)
      -> Redis/cache/broker only if justified (D-ARCH-008)
  -> hosting/deployment (D-ARCH-009)
      -> CI/CD/secrets tooling (D-ARCH-019 — OPEN)
      -> observability provider (D-PROVIDER-006)
  -> payment provider (D-PROVIDER-001)
  -> messaging provider (D-PROVIDER-002)
  -> object storage when required (D-ARCH-010)
  -> product analytics when pilot questions justify it (D-PROVIDER-005)
```

Dependency reasoning:

- repository/framework/runtime choices should not be finalized before the architecture style and primary runtime direction are clear,
- data access and RLS depend on the canonical database and managed-backend model,
- authentication must be known before session/cookie/mobile token mechanics are implemented, while authorization remains GymPulse-owned,
- API deployment depends on web/runtime and authentication constraints but is separate from contract style,
- jobs and API topology materially influence hosting,
- Redis should follow an actual job/cache/coordination requirement rather than precede it,
- provider selections should follow confirmed pilot methods/channels and operational requirements,
- CI/CD production deployment should bind to the chosen hosting/runtime only after the release-security capability model is agreed.

## 28. Decision Register Gaps

Do not invent canonical IDs inside this document. The following topics deserve a bounded follow-up in `assumptions.md` before implementation decisions are treated as authoritative.

| Topic | Why it deserves governance | Related requirements | Suggested decision family | Priority | Recommended follow-up task |
|---|---|---|---|---|---|
| Primary TypeScript/Node language/runtime | Cross-cuts almost every application, job, provider, test, and deployment artifact and is expensive to reverse | `NFR-MAINTAINABILITY-*`, `NFR-TESTABILITY-*`, `NFR-SCALABILITY-003` | Architecture (`D-ARCH`) | P0 | Add canonical language/runtime decision, status initially Open/Proposed based on review |
| Data-access/query/migration strategy | Owns migration format, transaction APIs, PostgreSQL feature access, repository ergonomics, RLS policy integration | `NFR-RELIABILITY-004`, `NFR-MAINTAINABILITY-004`, `NFR-OPERATIONS-003` | Architecture/Data (`D-ARCH` or `D-DATA`) | P1 | Register persistence-tooling decision and run Drizzle/Kysely/Prisma spike |
| Core testing toolchain | Release gates require deterministic domain, real DB, authorization, provider, worker and E2E tests; exact tooling is currently legacy-only guidance | `NFR-TESTABILITY-*`, `NFR-SECURITY-001`, `NFR-RELIABILITY-*` | Engineering/Architecture | P1 | Register testing baseline or explicitly classify it as governed engineering standard |
| CI/CD and production release/secrets tooling | Controls migration safety, production secrets, environment isolation and deployment approval | `NFR-OPERATIONS-*`, `NFR-SECURITY-004`, `NFR-MAINTAINABILITY-004` | Engineering/Architecture/Security | P1 | Register release-pipeline/secrets decision before production pipeline binding |

Potential lower-level choices such as the exact runtime-validation library, lint configuration, formatter, or UI component library do not currently justify separate architecture decisions unless later evidence makes them cross-cutting/expensive to reverse.

## 29. ADR Readiness / Recommended ADR Queue

No ADR is created or accepted by this task.

The existing ADR governance remains authoritative. Before drafting new ADRs, normalize the Decision Register Gaps above so the ADRs can reference canonical IDs rather than inventing them.

### Smallest logical first ADR batch after gap normalization

1. **Phase 1 architecture style** — `D-ARCH-005` — confirm modular monolith vs alternatives.
2. **Repository/workspace strategy** — `D-ARCH-001` — monorepo boundaries and orchestration approach; relate but do not silently accept `D-ARCH-011`.
3. **Canonical database engine** — `D-ARCH-002` — PostgreSQL vs credible relational alternatives.

Why this batch first:

- it establishes code/dependency and persistence foundations used by later ADRs,
- it does not require payment/messaging provider decisions,
- it reduces rework before auth/API/jobs/hosting evaluation becomes concrete,
- it leaves runtime/provider decisions reversible until their own evidence exists.

### Recommended second dependency batch

After the first batch and gap normalization:

- `D-ARCH-014` managed backend responsibilities,
- `D-ARCH-004` authentication/session,
- `D-SEC-002` member authentication method,
- `D-ARCH-015` authorization implementation boundary,
- `D-SEC-008` RLS/data-layer tenant isolation.

### Recommended third dependency batch

- `D-ARCH-003` API contract architecture,
- `D-ARCH-006` API deployment topology,
- `D-ARCH-007` background jobs,
- `D-ARCH-009` hosting/deployment,
- `D-PROVIDER-006` observability provider.

Payment and messaging provider ADRs should follow confirmed pilot methods/channels rather than being forced into an architecture-first batch.

## 30. D-DATA-007 Impact on Technology Decisions

`D-DATA-007` remains unresolved. Technology selection does not resolve Member vs Membership lifecycle ownership.

It affects:

### Schema design

Do not finalize overlapping `Member.status` and `Membership.status` constraints/state machines until ownership is decided.

### Constraints

Attendance/no-show/renewal eligibility constraints must not encode contradictory entitlement truth in both entities.

### Queries

Dashboard `active member`, member search filters, retention eligibility, and renewal queries must state whether they mean member-record state or active membership entitlement.

### Authorization

A blocked/admin-disabled member-record state may become an access/security condition, but membership expiry/freeze is an entitlement condition. The final distinction requires the decision.

### Attendance eligibility

Continue using relevant Membership eligibility; never infer access from `Member.status` alone.

### Retention

No-show scans must exclude canonical frozen/expired/cancelled membership states without duplicating that lifecycle into member status.

### Renewal

Renewal stage and commercial eligibility depend on membership state/history. The exact renewal-period representation remains a separate data/business decision.

### Imports

Import mapping must not copy one source status into both Member and Membership lifecycle state silently.

### Reporting

Metrics must define member-record counts separately from membership-entitlement counts until the model is resolved.

Therefore canonical schema/state-machine finalization remains gated by `D-DATA-007`, independent of whether PostgreSQL or a particular ORM is recommended.

## 31. Blocking Inputs Before Authoritative Implementation

Technology evaluation is complete, but GymPulse is **not implementation-ready for authoritative production scaffolding** because several P0/P1 gates remain unresolved.

High-impact blockers include:

- `D-ARCH-001` repository strategy is DECIDED — explicit monorepo,
- `D-ARCH-002` database engine is DECIDED — PostgreSQL,
- `D-ARCH-005` architecture style is DECIDED — modular monolith,
- `D-ARCH-016` language/runtime category is DECIDED — strict TypeScript + supported Node.js LTS,
- `D-ARCH-003` API contract architecture is Proposed,
- `D-ARCH-004` authentication/session is Open,
- `D-ARCH-006` API deployment topology is Open,
- `D-ARCH-007` background job technology is Open,
- `D-ARCH-009` hosting is Open,
- `D-ARCH-012` Owner/Staff framework is Proposed,
- `D-ARCH-013` member client strategy is Proposed,
- `D-ARCH-014` managed backend responsibilities are Open,
- `D-ARCH-015` authorization implementation is Proposed,
- `D-SEC-001` launch jurisdiction/privacy obligations are Open,
- `D-SEC-002` member authentication is Open,
- `D-SEC-004` session lifecycle is Open,
- `D-SEC-008` RLS/data-layer tenant isolation is Open when applicable,
- `D-PROVIDER-001` payment provider is Open,
- `D-PROVIDER-002` messaging provider is Open,
- `D-PROVIDER-006` observability provider is Open,
- `D-DATA-007` Member vs Membership state ownership is Proposed/unresolved,
- primary language/runtime, data-access/migrations, testing stack, and CI/CD/secrets have no canonical decision IDs yet.

Production provider/hosting region decisions are additionally constrained by the unresolved jurisdiction/privacy requirements.

Provider selection is also blocked by pilot inputs such as launch payment methods, refund/offline-payment policy, launch communication channels, service/marketing policy, and required receipt/invoice behavior.

## 32. Official Ecosystem Verification Used for This Evaluation

Current ecosystem facts were checked against official documentation on `2026-08-20`. These references support capability evaluation only; they do not establish GymPulse decisions.

| Area | Official documentation checked | Decision-relevant fact |
|---|---|---|
| TypeScript | https://www.typescriptlang.org/tsconfig/strict.html ; https://www.typescriptlang.org/docs/handbook/project-references.html | strict checking and project references/workspace separation are supported |
| Node.js | https://nodejs.org/en/about/previous-releases | use a supported LTS line; exact version is deferred to implementation |
| Next.js | https://nextjs.org/docs/app ; https://nextjs.org/docs/app/getting-started/server-and-client-components | full-stack React framework with explicit server/client component boundaries |
| Expo Camera | https://docs.expo.dev/versions/latest/sdk/camera/ | camera/barcode APIs support native platforms and web; target-device validation is still required |
| pnpm | https://pnpm.io/workspaces | first-class workspace support |
| PostgreSQL RLS | https://www.postgresql.org/docs/current/ddl-rowsecurity.html | row policies can restrict rows; privileged owner/BYPASSRLS behavior must be understood |
| Drizzle | https://orm.drizzle.team/docs/transactions ; https://orm.drizzle.team/docs/sql | explicit transactions and SQL escape hatch |
| Prisma | https://www.prisma.io/docs/orm/prisma-migrate ; https://www.prisma.io/docs/orm/prisma-client/using-raw-sql | SQL migration history plus raw/custom SQL escape paths |
| Kysely | https://kysely.dev/ | thin type-safe SQL query-builder approach |
| Supabase | https://supabase.com/docs ; https://supabase.com/docs/guides/database/postgres/row-level-security ; https://supabase.com/docs/guides/queues ; https://supabase.com/docs/guides/cron | managed Postgres/Auth/Storage/RLS plus separate queue/cron capabilities; responsibilities need not be adopted as one bundle |
| pg-boss | https://github.com/timgit/pg-boss | PostgreSQL-backed jobs, retry/schedule/singleton patterns; business idempotency remains application-owned |
| Trigger.dev | https://trigger.dev/docs | managed durable TypeScript tasks, retries, schedules and operational visibility are available as a candidate |
| Razorpay | https://razorpay.com/docs/payments/payment-methods/upi/ ; https://razorpay.com/docs/webhooks/payments/ ; https://razorpay.com/docs/payments/refunds/ | current UPI flow guidance, payment webhooks and refunds are decision-relevant |
| Cashfree | https://www.cashfree.com/docs/docs/webhook-signature-verification ; https://www.cashfree.com/docs/payments/online/webhooks/overview | raw-body webhook signature verification and webhook delivery behavior are decision-relevant |
| Twilio WhatsApp | https://www.twilio.com/docs/whatsapp ; https://www.twilio.com/docs/messaging/guides/track-outbound-message-status | template messaging and delivery status callbacks are available candidate capabilities |
| Gupshup WhatsApp | https://docs.gupshup.io/docs/whatsapp | template/webhook capabilities are available for BSP evaluation |
| Render | https://render.com/docs/background-workers ; https://render.com/docs/cronjobs ; https://render.com/docs/private-network | worker, cron and private-service hosting are candidate capabilities |
| Vercel | https://vercel.com/docs/functions/limitations ; https://vercel.com/docs/cron-jobs ; https://vercel.com/docs/environment-variables | function/cron/runtime limits and secret/environment behavior must be validated when considering co-hosted API topology |
| OpenTelemetry | https://opentelemetry.io/docs/languages/js/ | vendor-neutral telemetry instrumentation is available; maturity differs by signal/runtime |
| Vitest | https://vitest.dev/guide/ | TS/JS unit/application test runner candidate |
| Playwright | https://playwright.dev/docs/test-projects ; https://playwright.dev/docs/browsers | multi-browser/project E2E support |
| Testcontainers for Node.js | https://node.testcontainers.org/ | isolated real-service integration-test environments including PostgreSQL are available |

Official documentation is intentionally preferred over community popularity claims. Pricing, provider regional availability, limits, and commercial support must be rechecked during the actual decision/ADR because they can change.

## 33. Technology Architecture Gate

This document is complete only as an evaluation. It does not authorize implementation.

The technology architecture remains consistent when:

- framework/provider choices preserve the existing C4/component boundaries,
- server-side principal/scope/capability authorization remains mandatory,
- PostgreSQL/ORM recommendations do not resolve `D-DATA-007`,
- web/member clients remain untrusted for canonical business truth,
- provider SDKs remain behind adapters,
- payment success still requires verified provider evidence and exactly-once effect protection,
- jobs remain tenant-scoped, retry-safe and observable,
- Redis is not introduced without a concrete requirement,
- RLS is defense in depth rather than a replacement for capability authorization,
- read models/analytics remain non-authoritative,
- no Open/Proposed/Assumed decision is described as Accepted/Decided,
- production secrets remain server-only and environment-separated,
- future workout, advanced nutrition, health, coaching, multi-branch product workflows and AI remain outside Phase 1 unless separately approved.

## 34. Next Recommended Bounded Task

**Task 0008: Technology Decision Register Gap Normalization**

Purpose:

1. update the canonical `docs/00-overview/assumptions.md` with explicit decision entries for the material gaps identified here,
2. reconcile `docs/adr/README.md` ordering/dependencies with the completed technology evaluation,
3. assign only `OPEN`/`PROPOSED`/`ASSUMED` statuses supported by evidence,
4. do not accept ADRs or create implementation code,
5. prepare the first ADR batch after canonical IDs exist.

Suggested task file:

```text
.ai/task/0008-technology-decision-register-normalization.md
```

Do not start Task 0008 as part of this document.

## 35. Related Documents

- `../README.md`
- `../00-overview/assumptions.md`
- `../01-product/functional-requirements.md`
- `../01-product/non-functional-requirements.md`
- `architecture-principles.md`
- `architecture-overview.md`
- `system-context.md`
- `container-architecture.md`
- `component-architecture.md`
- `data-flow.md`
- `../adr/README.md`
- legacy migration evidence: `../05-system-architecture.md`
- legacy migration evidence: `../06-database-schema.md`
- legacy migration evidence: `../07-api-contracts.md`
- legacy migration evidence: `../08-automations.md`
- legacy migration evidence: `../09-payments-billing.md`
- legacy migration evidence: `../10-notifications-whatsapp.md`
- legacy migration evidence: `../12-security-audit.md`
- legacy migration evidence: `../13-testing-qa.md`
- legacy migration evidence: `../15-engineering-workflow.md`
- legacy migration evidence: `../16-open-decisions.md`
