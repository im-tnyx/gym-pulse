# GymPulse Documentation

## Purpose

This `docs/` directory is the canonical Docs-as-Code knowledge base for GymPulse. It is intended to let product, design, engineering, QA, security, operations, and future contributors understand why the product exists, how it should behave, how it is designed, and how it is operated.

Structured documents take precedence over legacy flat files when both describe the same topic.

## Documentation Taxonomy

Use explicit labels when `Status` could be ambiguous.

### Document Maturity

```text
Draft
Review
Approved
Deprecated
```

### Scope Status

```text
In Scope
Future
Out of Scope
Conditional
```

### Decision Status

Canonical decisions in `00-overview/assumptions.md` use:

```text
Open
Proposed
Assumed
Decided
Blocked
Deferred
```

Existing product documents may also use `Confirmed`, `Conditional`, and `Open` for requirement confidence/applicability. Do not mechanically rewrite stable documents only to change labels.

## Source Hierarchy

When documents conflict, use this order:

1. Accepted ADRs and explicitly approved business decisions.
2. Current structured documents under `docs/00-overview/` through `docs/15-roadmap/`.
3. Current requirement IDs and domain specifications.
4. Explicit assumptions/open decisions in `docs/00-overview/assumptions.md`.
5. Legacy flat documents in `docs/` that have not yet been fully migrated.
6. Original Gym App Blueprint source material for source-derived Phase 1 behavior.

No undocumented implementation detail overrides an approved requirement or ADR.

## Canonical Decision Register

`docs/00-overview/assumptions.md` is the canonical decision and assumption register.

`docs/16-open-decisions.md` is a legacy migration source. New structured documents must use canonical scoped IDs rather than legacy numeric IDs.

Task 0008 normalized these technology-governance decisions:

```text
D-ARCH-016  Primary implementation language/runtime
D-ARCH-017  Data-access/query/migration strategy
D-ARCH-018  Core automated testing toolchain
D-ARCH-019  CI/CD + production release tooling
```

Registration of an ID does not accept its candidate technology.

## Target Information Architecture

```text
docs/
├── README.md
├── 00-overview/
├── 01-product/
├── 02-architecture/
│   ├── architecture-principles.md
│   ├── architecture-overview.md
│   ├── system-context.md
│   ├── container-architecture.md
│   ├── component-architecture.md
│   ├── data-flow.md
│   └── technology-stack.md
├── 03-applications/
├── 04-backend/
├── 05-database/
├── 06-api/
├── 07-domains/
├── 08-ai/
├── 09-security/
├── 10-infrastructure/
├── 11-observability/
├── 12-testing/
├── 13-engineering/
├── 14-operations/
├── 15-roadmap/
└── adr/
    ├── README.md
    └── ADR-XXXX-title.md
```

`docs/adr/` is the single canonical ADR store. Do not create a competing ADR directory under `02-architecture/`.

## Documentation Creation Sequence

1. Existing-information assessment and information architecture.
2. Project overview, vision, goals, scope, terminology, assumptions.
3. Product requirements, personas, roles, journeys, features, FRs/NFRs, success metrics.
4. Architecture foundation and C4 architecture.
5. Domain boundaries and domain specifications.
6. Database and API design.
7. AI architecture and safety model.
8. Security and privacy architecture.
9. Infrastructure, environments, deployment, and DevOps.
10. Testing and observability.
11. Engineering standards and workflow.
12. MVP, phased roadmap, technical debt, future architecture.
13. Cross-document consistency and traceability audit.

## Requirement Traceability

Requirements use stable IDs such as:

```text
FR-IDENTITY-001
FR-MEMBERSHIP-001
FR-ATTENDANCE-001
FR-RETENTION-001
FR-PAYMENT-001
NFR-SECURITY-001
NFR-PERFORMANCE-001
```

Target traceability:

```text
Requirement
  -> Product Capability
  -> Domain
  -> Architecture Principle / Component
  -> Canonical Decision ID / ADR
  -> Database Entity
  -> API Contract
  -> Security Control
  -> Test
```

## ADR Policy

Major architecture commitments require explicit governance and an ADR when material. Architecture style, primary runtime, repository strategy, database, persistence tooling, API architecture, application frameworks, authentication/authorization, jobs, hosting, providers, tenant-isolation strategy, and release infrastructure must not become accepted merely because they appear in planning or implementation.

ADR governance lives in `adr/README.md`.

## Documentation Quality Rules

- Prefer precise behavior over aspirational language.
- Explain decisions, alternatives, tradeoffs, and implications.
- Do not fabricate missing business rules; record assumptions/open decisions.
- Keep deterministic business logic separate from probabilistic AI behavior.
- Treat tenancy, authorization, idempotency, auditability, privacy, and observability as cross-cutting concerns.
- Use Mermaid when diagrams improve clarity.
- Avoid duplicating the same canonical rule across many files.
- Update dependent documentation when a canonical rule changes.
- Do not introduce legacy decision IDs into structured docs.

## Current Structured-Document Status

### `00-overview/`

Draft foundation complete:

```text
project-overview.md
vision.md
goals.md
scope.md
glossary.md
assumptions.md
```

`assumptions.md` owns canonical decision status, including `D-ARCH-016..019`, `D-SEC-008`, and unresolved `D-DATA-007` Member-vs-Membership state ownership.

### `01-product/`

Draft foundation complete:

```text
product-requirements.md
personas.md
user-roles.md
user-journeys.md
feature-catalog.md
functional-requirements.md
non-functional-requirements.md
success-metrics.md
```

### `02-architecture/`

Completed Draft architecture documents:

```text
architecture-principles.md
architecture-overview.md
system-context.md
container-architecture.md
component-architecture.md
data-flow.md
technology-stack.md
```

These establish the Phase 1 technology-neutral architecture, C4 views, component ownership, critical data flows, and technology evaluation while preserving unresolved decision status.

### ADRs

ADR governance:

```text
docs/adr/README.md
```

Current decision ADRs:

```text
docs/adr/ADR-0001-modular-monolith.md                    Proposed   D-ARCH-005
docs/adr/ADR-0002-primary-language-runtime.md            Proposed   D-ARCH-016
docs/adr/ADR-0003-monorepo-strategy.md                   Proposed   D-ARCH-001
docs/adr/ADR-0004-database-engine.md                     Proposed   D-ARCH-002
docs/adr/ADR-0005-data-access-migration-strategy.md      Proposed   D-ARCH-017
docs/adr/ADR-0006-managed-backend-responsibilities.md    Proposed   D-ARCH-014
docs/adr/ADR-0007-authentication-session-architecture.md Proposed   D-ARCH-004
docs/adr/ADR-0008-member-authentication-method.md        Proposed   D-SEC-002
docs/adr/ADR-0009-authorization-implementation.md        Proposed   D-ARCH-015
docs/adr/ADR-0010-data-layer-tenant-isolation-rls.md    Proposed   D-SEC-008
docs/adr/ADR-0011-api-contract-architecture.md           Proposed   D-ARCH-003
docs/adr/ADR-0012-owner-staff-web-framework.md           Proposed   D-ARCH-012
docs/adr/ADR-0013-member-client-strategy.md               Proposed   D-ARCH-013
docs/adr/ADR-0014-api-deployment-boundary.md              Proposed   D-ARCH-006
docs/adr/ADR-0015-background-jobs-scheduler.md             Proposed   D-ARCH-007
docs/adr/ADR-0016-hosting-deployment-platform.md            Proposed   D-ARCH-009
docs/adr/ADR-0017-ci-cd-release-secrets.md                  Proposed   D-ARCH-019
docs/adr/ADR-0018-testing-toolchain.md                       Proposed   D-ARCH-018
docs/adr/ADR-0019-package-manager.md                           Proposed   D-ARCH-011
docs/adr/ADR-0020-observability-provider.md                      Proposed   D-PROVIDER-006
docs/adr/ADR-0021-object-storage.md                                Proposed   D-ARCH-010
docs/adr/ADR-0022-payment-provider.md                              Proposed   D-PROVIDER-001
docs/adr/ADR-0023-messaging-provider.md                            Proposed   D-PROVIDER-002
docs/adr/ADR-0024-product-analytics-provider.md                    Proposed   D-PROVIDER-005
docs/adr/ADR-0025-redis-cache-requirement.md                      Proposed   D-ARCH-008
docs/adr/ADR-0026-member-membership-state-ownership.md              Proposed   D-DATA-007
```

`ADR-0001` proposes a modular monolith with explicit domain/application/component boundaries and remains unaccepted.

`ADR-0002` proposes strict TypeScript with a supported Node.js LTS runtime, while keeping framework, repository, database, hosting, job-runner, test-tool, and provider choices separate. It requires runtime validation and explicit client-safe/server-only source boundaries. It remains unaccepted.

`ADR-0003` proposes an explicit monorepo with deliberate application/package boundaries, independent build/deployment artifacts, and structural client-safe/server-only enforcement. It keeps package manager, workspace orchestrator, API deployment topology, database, data-access tooling, CI/CD, framework, and hosting decisions separate. It remains unaccepted.

`ADR-0004` proposes PostgreSQL as the canonical transactional database engine after comparing MySQL/MariaDB, document/NoSQL-first, and distributed SQL alternatives against GymPulse correctness, tenancy, querying, backup/restore, and operational requirements. It explicitly does not approve a final schema, managed provider, RLS policy, ORM/query builder, hosting platform, job runner, database role model, exact indexes, or exact PostgreSQL version. It remains unaccepted.

`ADR-0005` proposes a Drizzle-oriented SQL-transparent TypeScript persistence strategy with application-owned transaction boundaries, generated/reviewed committed SQL migrations, raw/custom SQL escape capability, purpose-specific read models, and future RLS compatibility. It is conditional on compatible final runtime/database decisions and does not approve Drizzle, PostgreSQL, RLS, a managed provider, or a final schema. It remains unaccepted.

`ADR-0006` proposes a selective managed-backend responsibility model: commodity infrastructure may be delegated to managed services while GymPulse retains product/domain/application/security semantics. Integrated platforms such as Supabase are candidates only; database, Auth/session, Storage, RLS, jobs/queues/Cron, hosting, observability, and direct-client database access remain separately governed. `D-ARCH-014` remains canonically `OPEN` and no provider is accepted or provisioned.

`ADR-0007` proposes a managed-authentication-provider architecture category with provider-independent AuthIdentity mapping, stable GymPulse Principal resolution, current GymPulse tenant/resource/capability authorization, and a secure server-mediated staff-web session posture. It keeps Member identity separate from authentication identity, keeps future native compatibility without selecting native delivery, and does not select Supabase Auth, Clerk, Auth0, Keycloak, member OTP/passwordless, an MFA mandate, or exact session/device policy. `D-ARCH-004` remains canonically `OPEN`.

`ADR-0008` proposes managed phone OTP/passwordless as the primary Phase 1 member-verification method, but separates verified channel control from tenant-aware Member claiming/linking. It requires stronger controlled handling for ambiguous/shared/reassigned/already-claimed records, recovery and authentication-channel changes. It does not select Supabase Auth, Clerk, Auth0, an SMS/email provider, exact OTP controls, exact session policy, an MFA mandate, or native delivery. `D-SEC-002` remains canonically `OPEN`.

`ADR-0009` proposes a GymPulse-owned provider-independent application authorization module using stable named capabilities, roles as capability bundles, current scoped assignments, trusted resource ownership resolution, explicit Member-self relationships, deny-by-default behavior, and bounded non-human execution contexts. Provider roles/claims, framework middleware, RLS, and external policy engines are not the sole business authority. No authorization library/service, role/capability schema, RLS policy, Redis/cache, or full permission matrix is accepted. `D-ARCH-015` remains canonically `PROPOSED`.

`ADR-0010` proposes the data-layer tenant-isolation posture beneath application authorization. It keeps application authorization mandatory and keeps explicit tenant-scoped persistence queries. If `D-ARCH-002` is later accepted with PostgreSQL, it proposes selective tenant-focused PostgreSQL RLS on materially tenant-owned canonical tables as defense in depth, policy-enforced least-privileged runtime/worker access, separate migration/admin privilege, and transaction-safe trusted tenant context when required. It explicitly does not approve PostgreSQL, Supabase or another provider, a specific RLS policy, database role, schema, migration, Data API, direct-client database access, or implementation. Canonical `D-SEC-008` remains `OPEN`.

`ADR-0011` proposes a versioned JSON-over-HTTPS resource/action application contract with runtime trust-boundary schemas, explicit API DTO/application/domain/persistence separation, purpose-specific success representations, RFC 9457-compatible machine-readable errors, cursor-first bounded operational pagination, explicit idempotency semantics for designated retry-sensitive commands, a provider-specific raw-body verification boundary for webhooks, and optional mechanically derived OpenAPI. It does not select an API framework, runtime validator, OpenAPI/client generator, web/native framework, or API deployment topology. `D-ARCH-003` remains canonically `PROPOSED`.

`ADR-0012` proposes Next.js App Router + React as the Owner/Staff web presentation framework, with strict TypeScript conditional on later compatible acceptance of `D-ARCH-016`. It keeps application/domain/security logic framework-independent, treats Server Components/Client Components as presentation boundaries and Server Functions/Route Handlers as adapters, preserves ADR-0011 as the independently consumable contract, requires tenant-sensitive cache isolation and server-only/client-safe dependency boundaries, and leaves API deployment, auth/session provider, hosting, testing, UI libraries, CI/CD, and observability separately governed. `D-ARCH-012` remains canonically `PROPOSED`.

`ADR-0013` proposes responsive browser-first Member delivery as the Phase 1 baseline, with normal HTTPS use requiring no installation, OS-camera HTTPS QR entry as the primary QR path, browser scanning only after target-device validation, PWA capabilities added progressively rather than as an offline-first bundle, and Expo/React Native retained only as an evidence-triggered future native path. It preserves ADR-0011 as the common API boundary, keeps Member-self authorization and attendance/payment/membership truth server-side, rejects offline canonical attendance/payment truth, and selects no Auth/payment/messaging/push/hosting provider. `D-ARCH-013` remains canonically `PROPOSED`.

`ADR-0014` proposes a co-hosted-first Phase 1 API deployment boundary: the trusted `/v1` HTTP transport may execute with the Owner/Staff server runtime while Route Handlers/Server Functions remain thin adapters, application/domain/security modules remain framework-independent, Member/future-native clients retain ADR-0011, provider callbacks preserve their own verification boundary, background workers remain separate, and a deliberate extraction seam permits a future independent API deployment when operational evidence requires it. It selects no hosting provider, serverless/edge model, API gateway, Auth provider, database provider, or job technology. Canonical `D-ARCH-006` remains `OPEN`.

`ADR-0015` proposes PostgreSQL-backed durable jobs/scheduling behind a GymPulse Durable Continuation port, executed by a separate Background Worker Runtime. If PostgreSQL and a compatible Node runtime are later accepted, pg-boss is the leading current implementation candidate because same-database enqueue can participate in the application transaction while retries, dead-letter handling, scheduling, and worker recovery remain explicit. External task systems require a transactional outbox/dispatcher handoff; queue delivery never replaces business idempotency. Redis/BullMQ and managed durable-task platforms remain alternatives rather than baseline dependencies. Canonical `D-ARCH-007` remains `OPEN`.

`ADR-0016` proposes a conventional regional managed service/worker PaaS as the Phase 1 hosting category: a stateless public request service plus a separately deployable non-public-by-default Background Worker, both near canonical persistence and independently scalable. Render is the leading current provider candidate only if jurisdiction/privacy, region/locality, DB connectivity, runtime, worker, webhook, secret, migration, rollback, and load gates pass. Its current documented service-region set includes Singapore but not India, so `D-SEC-001` may materially change the provider direction. Google Cloud Run and Fly.io remain serious region-flexible alternatives; Vercel plus a separate worker remains a credible web-led split. No provider or production region is accepted. Canonical `D-ARCH-009` remains `OPEN`.

`ADR-0017` proposes the Phase 1 CI/CD, production-release, artifact-provenance, environment-promotion, migration-gate, and secrets architecture. It keeps GitHub Actions as the leading orchestration candidate only, requires protected PR/required checks, traceable source/build/deployment identity, environment-aware promotion, least-privilege CI credentials, OIDC/federated deployment identity where supported, isolation of production secrets from PR/preview contexts, separate runtime and migration credentials where practical, one controlled production migration action, compatible web/worker rollout, post-deploy verification, and explicit rollback-versus-forward-fix handling. No CI vendor, workflow, GitHub environment, secret, artifact, deployment, hosting provider, or production credential is accepted or created. Canonical `D-ARCH-019` remains `OPEN`.

`ADR-0018` proposes a layered automated-testing architecture driven by `NFR-TESTABILITY-001..005`: deterministic domain/application tests, table-driven authorization and cross-tenant negatives, real database integration where persistence semantics matter, API/provider/worker integration, focused browser E2E, controlled time/failure injection, and release-smoke evidence coordinated with ADR-0017. Vitest is the leading fast TypeScript runner candidate, Testcontainers-style real-PostgreSQL orchestration is the leading database-test candidate if PostgreSQL is later accepted, and Playwright is the leading focused browser-E2E candidate. Native E2E remains deferred. No testing tool, dependency, configuration, test, browser, container, test database, or CI workflow is accepted or created. Canonical `D-ARCH-018` remains `PROPOSED`.

`ADR-0019` proposes `pnpm` as the leading package-manager direction for the proposed multi-package repository. It requires one committed root lockfile, explicit workspace dependencies, `workspace:` references where local-only package resolution is intended, frozen CI/release installation, declared-dependency isolation, package-manager version pinning, and reviewed/restricted dependency build scripts. `npm` remains the conservative fallback; `Yarn` and `Bun` remain credible alternatives. No package manager, lockfile, workspace config, dependency, Turborepo setup, Node.js runtime, or CI workflow is accepted or created. Canonical `D-ARCH-011` remains `P1 ASSUMED`.

`ADR-0020` proposes Grafana Cloud as the leading managed observability provider while canonical `D-PROVIDER-006` remains `P1 OPEN`. It preserves GymPulse-owned structured telemetry semantics, privacy-safe logs, request/job/provider correlation, OpenTelemetry-compatible server traces/metrics, focused alerting, and optional privacy-reviewed frontend telemetry. Observability remains diagnostic rather than canonical business/audit truth, and telemetry exporter failure must not block business operations. No provider account, region, SDK, credential, dashboard, alert, SLO, session replay, collector, or production telemetry is accepted or created.

`ADR-0021` concludes that persistent object storage is not currently justified as a Phase 1 baseline and keeps canonical `D-ARCH-010` `P1 OPEN`. Receipt/payment truth remains canonical structured data; no current requirement mandates a persisted receipt PDF. Controlled import may use bounded temporary input, while exports and receipt representations prefer streaming/on-demand generation unless a future workflow proves persistence necessary. Any future storage must be private by default, provider-neutral at the application boundary, server-authorized, tenant/resource scoped, lifecycle-controlled, residency-gated, and independently migratable. AWS S3, Cloudflare R2, Google Cloud Storage, and Supabase Storage are research candidates only.

`ADR-0022` keeps Razorpay and Cashfree as the bounded Phase 1 payment-provider sandbox shortlist while canonical `D-PROVIDER-001` remains `P1 OPEN`. The payment architecture is provider-neutral: server-owned amount/currency/purpose, provider-managed browser checkout, raw webhook verification, canonical GymPulse payment-state mapping, separate provider-event dedupe and business-effect uniqueness, reconciliation, refund/reversal history, settlement evidence, and provider exit. Merchant account / settlement ownership is an explicitly identified decision-register gap; GymPulse is not assumed to be merchant of record. No provider account, credential, SDK, route, payment, refund, migration, or production integration is created.

`ADR-0023` defers production messaging-provider selection while canonical `D-PROVIDER-002` remains `P1 OPEN`. WhatsApp is a serious external channel candidate but is not canonically mandatory; Direct Meta, Twilio, and Gupshup remain comparison candidates only. The provider-neutral direction keeps `NotificationIntent`, service/marketing policy, preferences, business template keys, tenant sender/template configuration, stale-state suppression, business-stage dedupe, callback normalization, and provider-observed delivery truth GymPulse-owned. Launch channels, sender/WABA/phone ownership, and externally enabled service intents remain explicit decision-register gaps. No messaging account, WABA, sender, template, credential, SDK, route, job, message, or marketing campaign is created.

`ADR-0024` defers any external product-analytics provider for the initial Phase 1 pilot while canonical `D-PROVIDER-005` remains `P2 OPEN`. Attendance, QR adoption, no-show recovery, renewals, verified revenue/refunds, add-on revenue, payment exceptions, and follow-up completion continue to derive from canonical GymPulse records. Future behavioral instrumentation is limited to concrete unanswered questions using precise provider-neutral event names, property allowlists, pseudonymous identity, trusted tenant context, and non-blocking delivery. Autocapture, session replay, analytics-owned feature flags/experiments, warehouse/CDP infrastructure, and broad track-everything collection are not Phase 1 baselines. PostHog, Mixpanel, and Amplitude remain future candidates only; no provider is selected.

`ADR-0025` defers Redis/Valkey as a Phase 1 baseline while canonical `D-ARCH-008` remains `P2 OPEN`. No cache/session/queue/lock/pubsub responsibility is currently classified Required now. Database query/index/read-model optimization comes before distributed read caching; authorization has no distributed cross-request cache baseline; authentication/session storage remains separately governed; abuse controls do not imply Redis; ADR-0015 durable jobs remain PostgreSQL-oriented and independent; Redis locks/dedupe cannot replace durable business correctness; and no realtime/pubsub requirement exists. Redis/Valkey may be reconsidered only for one measured shared-ephemeral need with explicit outage, eviction, tenant-isolation, security, operations, and cost evidence.

`ADR-0026` proposes Membership as the owner of time-bounded commercial entitlement and separates Member administrative/relationship state from entitlement. Membership keeps `Pending / Active / Frozen / Expired / Cancelled`; the leading Member-state candidate is `Enabled / Blocked / Archived`, with `Enabled` explicitly not meaning an Active Membership. Membership expiry/freeze/cancellation no longer mirror into Member state in the proposal. `FR-MEMBER-004` remains unchanged because the ADR is Proposed; exact Blocked/Archived behavior, current-Membership selection, overlap rules, early-renewal timing, cancellation/refund, deletion/export, retention, and schema/migration mechanics remain unresolved.

No decision ADR is currently `Accepted`.

## Current Architecture Governance Position

The architecture foundation, C4 views, data flows, technology evaluation, technology decision normalization, and first twenty-six ADR drafts are complete.

This does not make GymPulse implementation-ready. Relevant P0/P1 decisions remain Open/Proposed/Assumed until explicit review and approval evidence exists.

Authentication and authorization remain separate. Provider identity/session evidence must resolve to a GymPulse Principal, then current tenant/resource scope and named capabilities or an explicit Member-self relationship are evaluated from GymPulse-controlled state. A valid authentication session does not preserve business access after an account, tenant assignment, branch scope, capability, or Member-self relationship is revoked.

`D-ARCH-004` remains `P0 OPEN` even though `ADR-0007` is Proposed. `D-SEC-002` remains `P0 OPEN` even though `ADR-0008` proposes managed phone OTP/passwordless as the routine Member-verification direction. `D-SEC-004` exact session lifecycle/device policy remains `P1 OPEN`. `D-ARCH-015` remains `P0 PROPOSED` even though `ADR-0009` proposes the authorization implementation boundary.

The current authorization proposal remains:

```text
verified Principal
  + current account eligibility
  + current tenant/resource scope
  + current named capability or Member-self relationship
  + trusted resource relationship
  -> allow / deny
```

`ADR-0010` adds a proposed independent persistence backstop below that boundary:

```text
Application Authorization = Mandatory
Data-Layer Tenant Isolation = Defense in Depth
RLS != Complete Authorization System
```

`D-SEC-008` remains `OPEN`. `D-ARCH-002` remains `PROPOSED`; PostgreSQL remains unaccepted. `D-ARCH-017` remains `PROPOSED`; no query/migration tool is accepted. `D-ARCH-014` remains `OPEN`; no managed provider is accepted.

The current Phase 1 trust path remains:

```text
Client
  -> Trusted GymPulse Runtime
  -> Application Authorization
  -> tenant-aware persistence
```

Direct browser/mobile canonical database mutation remains unapproved. RLS adoption is not permission to bypass the trusted GymPulse runtime.

### Primary API contract proposal

`ADR-0011` defines the Proposed contract boundary under `D-ARCH-003` without accepting it.

Current proposed external application contract:

```text
JSON over HTTPS
+
resource/query reads and explicit business-command actions
+
runtime trust-boundary schemas
+
purpose-specific API DTOs
+
stable HTTP semantics + machine-readable problem codes
+
cursor-first bounded operational pagination
+
explicit idempotency for retry-sensitive critical mutations
+
provider-specific webhook verification boundary
+
major contract versioning
+
optional mechanically derived OpenAPI
+
framework/deployment independence
```

The API DTO is separate from application commands/queries, domain models, persistence models, and provider objects. Incoming requests use explicit allowlisted contracts; database/ORM objects are not public response contracts.

Static TypeScript types are not runtime validation. `D-ARCH-016` remains `PROPOSED`. ADR-0011 proposes runtime-schema-first contract ownership and, if TypeScript is later accepted, derived/mechanically synchronized static types rather than manually duplicated type truth.

Single-resource/command successes use purpose-specific JSON DTOs; collections have a structured `items` + pagination object; request correlation is carried through a server-generated request-ID response header and protected telemetry. Errors use a Proposed RFC 9457-compatible `application/problem+json` shape with stable GymPulse machine codes and safe human detail.

Operational collections default to opaque cursor/keyset-style pagination. Offset pagination remains a documented exception for small/static lists. Filters/sorts are allowlisted and tenant/branch identifiers remain untrusted routing/filter input until server authorization verifies scope.

Critical retryable commands use an explicit idempotency contract. The same trusted tenant/caller context + operation + key + compatible request maps to one canonical logical outcome; same key with a materially different request is a stable conflict.

Provider callbacks remain a separate contract class:

```text
raw callback
  -> preserve signature-verification material
  -> verify provider authenticity
  -> normalize provider event
  -> resolve canonical resource + tenant
  -> bounded application use case
  -> idempotent canonical effect
```

The proposed major contract namespace is `v1` from the first independently consumable contract, with compatible additive evolution inside the major version. OpenAPI is optional and should be mechanically derived/exported from runtime contracts where useful rather than maintained as an independent truth source.

`D-ARCH-006` remains `OPEN`. ADR-0011 intentionally works whether the trusted API is later co-hosted with the web runtime or deployed independently.

### Owner / Staff web framework proposal

`ADR-0012` now defines the Proposed web presentation direction under `D-ARCH-012` without accepting it.

Current proposal:

```text
Next.js App Router + React
+
strict TypeScript only if D-ARCH-016 is later accepted compatibly
+
Server Components for non-interactive page/layout composition
+
narrow Client Component boundaries for browser interaction
+
Server Functions/Actions and Route Handlers as thin adapters
+
ADR-0011 preserved as the independently consumable contract
+
current Principal/resource/capability authorization on every protected operation
+
private-by-default tenant-sensitive data and cache behavior
+
server-only/client-safe dependency boundaries
+
co-hosted/separate API deployment optionality preserved
```

The web framework is not the authorization boundary. Layouts, navigation guards, middleware/Proxy, hidden buttons, Server Components, and Server Actions may improve UX or adapt transport, but they do not replace current application authorization.

The framework also does not become the domain architecture. Business rules, application commands/queries, idempotency, provider verification, transactions, audit semantics, and canonical state remain outside React/Next.js components and framework handlers.

Tenant-sensitive framework caching is a security review surface. Authenticated data is private by default; shared caching requires authority-complete scoping, invalidation/revocation evidence, and Tenant A -> Tenant B negative tests. `D-ARCH-008` remains `OPEN`; ADR-0012 does not add Redis merely for framework caching.

`ADR-0012` is compatible with the Proposed first-party secure-cookie staff session posture from ADR-0007, but `D-ARCH-004` and `D-SEC-004` remain unresolved. Exact cookie, CSRF, session, provider, CSP, security-header, hosting, UI-library, testing, and observability implementation remains separately governed.

No Next.js/React scaffold, dependency, route, Server Action, Route Handler, authentication integration, CI workflow, hosting configuration, production secret, or provider binding was created by Task 0020.

`D-DATA-004` remains `PROPOSED`; Member and authenticated User/AuthIdentity remain separate concepts without finalized schema/cardinality. `D-DATA-007` remains unresolved and continues to block final Member/Membership lifecycle schema semantics.

### Member client delivery proposal

`ADR-0013` now defines the Proposed Member delivery direction under `D-ARCH-013` without accepting it.

Current proposal:

```text
responsive HTTPS Member web as Phase 1 baseline
+
normal browser use without installation
+
OS Camera -> HTTPS GymPulse QR entry
+
optional browser scanner only after real-device validation
+
optional PWA installability as progressive enhancement
+
service worker only for a concrete approved need
+
no offline canonical attendance/payment/membership truth
+
no mandatory push
+
Expo / React Native retained as evidence-triggered future native path
+
ADR-0011 shared by web and future native clients
```

The QR scan is only input acquisition. Member identity, QR/session validity, expiry, branch, membership eligibility, duplicate policy, and idempotency remain server-owned. Payment return/deep links are navigation only; canonical payment state still comes from verified provider evidence and the trusted runtime.

Browser/PWA remains compatible with the current proposed first-party server-mediated secure-cookie session architecture. A future native client may use a different credential transport with OS-protected storage while sharing the same AuthIdentity -> Principal -> Member-self authorization model. `D-ARCH-004`, `D-SEC-002`, and `D-SEC-004` remain unresolved.

No Member client, PWA, service worker, native app, Expo/React Native project, QR scanner, Auth/payment/push integration, deep-link configuration, direct database path, or production configuration was created by Task 0021.

### API deployment-boundary proposal

`ADR-0014` now defines the Proposed deployment mapping under `D-ARCH-006` without accepting it.

Current proposal:

```text
Phase 1:
co-host trusted HTTP/API transport with Owner/Staff server runtime
+
thin framework/transport adapters
+
framework-independent application/domain/security modules
+
ADR-0011 /v1 remains independently consumable
+
Member web/future native use the same API
+
provider callbacks keep dedicated verification adapters
+
background execution remains a separate runtime responsibility
+
no process-local canonical truth
+
explicit future API-extraction seam
```

Owner/Staff server rendering may call shared application handlers directly in-process where appropriate, but direct calls and HTTP adapters must preserve the same Principal, tenant/resource authorization, use-case, domain, audit, idempotency, and transaction semantics. No second Server-Action business implementation is permitted.

Public origin/DNS layout remains separate from physical deployment. Same-origin browser access may simplify Phase 1, but a future independent API may still be reverse-proxied under a common origin. Cross-origin credentialed access, if later used, requires explicit least-privilege CORS and separate CSRF controls.

No API application, Route Handler, Server Action, standalone API service, serverless/edge function, API gateway, reverse proxy, hosting resource, CORS/cookie/CSRF config, worker/queue/Cron, DNS/domain, CI/CD workflow, or production secret was created by Task 0022.

### Background jobs / scheduler proposal

`ADR-0015` now defines the Proposed durable background-execution direction under `D-ARCH-007` without accepting it.

Current proposal:

```text
PostgreSQL-backed durable queue/scheduler
+
separate Background Worker Runtime
+
Durable Continuation port
+
same-transaction enqueue when the selected Postgres-backed runner permits it
+
transactional outbox/dispatcher only when crossing to an external queue/platform
+
explicit retry / terminal-failure / redrive semantics
+
business-level idempotency remains mandatory
+
no Redis baseline
```

If PostgreSQL and a compatible Node runtime are later accepted, pg-boss is the leading current implementation candidate. PGMQ + pg_cron/Supabase Queues+Cron remain strong Postgres-native alternatives; Trigger.dev-style managed durable tasks remain a credible external platform option; BullMQ remains credible only if Redis becomes justified.

The scheduler controls wake-up timing, not domain eligibility. Workers reload canonical state, carry explicit tenant/gym scope and System/Job Context, and reuse shared application/domain rules. Queue delivery guarantees never replace request/job/provider/business-effect idempotency.

No worker, queue, scheduler, Cron config, pg-boss/Supabase/Trigger.dev/BullMQ integration, Redis instance, outbox/job table, migration, queue schema, hosting resource, CI/CD workflow, or production secret was created by Task 0023.

### Hosting / deployment platform proposal

`ADR-0016` now defines the Proposed hosting direction under `D-ARCH-009` without accepting a provider.

Current proposal:

```text
one approved primary region
+
managed stateless request-serving service
+
separate managed Background Worker service
+
independent scaling/failure lifecycle
+
compute close to canonical persistence
+
managed TLS / health / deployment lifecycle
+
server-only environment-scoped secrets
+
no Kubernetes baseline
+
no Redis baseline
+
no edge-first business-runtime requirement
```

Render is the leading current integrated service/worker PaaS candidate if `D-SEC-001`, region/locality, database connectivity, worker lifecycle, webhook, secret, migration, rollback, and load validation pass. Its current official service-region list does not include India. Cloud Run and Fly.io therefore remain important region-flexible alternatives; Vercel plus a separate worker remains a credible web-first split where its web ergonomics justify a second runtime provider.

The request runtime remains stateless/disposable. The worker remains a separate non-public-by-default runtime. Production migrations are one controlled release action, not a startup race across replicas. Preview environments must not inherit production secrets. Provider-native logs do not replace GymPulse request/job/payment correlation.

No cloud account/project/service, environment, DNS/TLS record, Dockerfile, deployment manifest, IaC, database, queue, Redis instance, migration, CI workflow, production secret, or monitoring integration was created by Task 0024.

### CI/CD / production release / secrets proposal

`ADR-0017` now defines the Proposed CI/CD/release/secrets direction under `D-ARCH-019` without accepting a CI vendor.

Current proposal:

```text
source revision
-> required CI gates
-> traceable build/artifact identity
-> controlled environment promotion
-> one controlled migration action
-> coordinated web/worker deployment
-> post-deploy smoke/observation
-> rollback where safe / forward-fix where rollback is unsafe
```

Security posture:

```text
untrusted PR/preview
!=
production trust

least-privilege CI credentials
+
OIDC/federated deployment identity where supported
+
environment-scoped secrets
+
runtime DB credential != migration DB credential where practical
```

GitHub Actions remains the leading candidate only. No `.github/workflows`, GitHub environment, repository/environment secret, OIDC trust, production credential, release artifact, migration execution, deployment, or hosting-provider acceptance was created by Task 0025.

### Core automated testing proposal

`ADR-0018` now defines the Proposed test-evidence architecture under `D-ARCH-018` without accepting a tool.

Current proposal:

```text
many deterministic domain/application tests
+
table-driven authorization + cross-tenant negative tests
+
real database integration where DB semantics matter
+
provider fakes / sanitized fixtures / official sandboxes
+
worker retry/restart/idempotency integration
+
focused browser E2E
+
controlled Clock + failure injection
+
release evidence layered with ADR-0017
```

Vitest is the leading TypeScript test-runner candidate. If PostgreSQL is later accepted, real PostgreSQL integration is required for transaction/constraint/concurrency/RLS semantics, with Testcontainers-style ephemeral orchestration as the leading approach and a shared CI PostgreSQL service as a fallback. Playwright is the leading browser-E2E candidate because the current Member/Staff strategy benefits from Chromium/WebKit/Firefox projects, isolated multi-user browser contexts, tracing, and focused cross-browser coverage. Cypress remains a credible alternative. Native E2E is deferred unless native Member delivery is accepted.

`Test Runner != Test Architecture`, `Browser E2E != Domain Test`, `SQLite/Fake DB != PostgreSQL Proof`, `Code Coverage != Correctness`, and `Test Retry != Flake Fix` remain explicit boundaries.

No test dependency, test config, test file, browser, Testcontainers/Docker setup, test database, provider sandbox account, coverage config, or CI workflow was created by Task 0026.

### Package manager proposal

`ADR-0019` now defines the Proposed package-manager direction under `D-ARCH-011` without accepting or installing a tool.

Current proposal:

```text
pnpm
+
one committed root lockfile
+
explicit workspace dependency edges
+
workspace: for intentional local-only package resolution
+
frozen CI/release install
+
declared-dependency isolation
+
reviewed dependency build scripts
+
package-manager version pinning
```

`Package Manager != Repository Strategy`, `Package Manager != Turborepo`, `Package Manager != Node Runtime`, and `Lockfile != Supply-Chain Security` remain explicit boundaries.

No package manager, lockfile, workspace file, dependency, package-manager config, CI workflow, or cache configuration was created by Task 0027.

### Observability provider proposal

`ADR-0020` now defines the Proposed observability direction under `D-PROVIDER-006` without accepting or provisioning a provider.

Current proposal:

```text
Grafana Cloud as leading managed provider
+
GymPulse-owned structured telemetry semantics
+
privacy-safe application / worker logs
+
request / job / provider correlation
+
OpenTelemetry server traces + metrics where mature/useful
+
focused operational alerts
+
optional privacy-reviewed Faro frontend telemetry
```

Key boundaries remain explicit:

```text
Observability != Audit Log
Observability != Product Analytics
OpenTelemetry != Observability Backend
Correlation ID != Tenant Authority
Telemetry Export Failure != Business Operation Failure
```

OpenTelemetry JavaScript server traces and metrics are the proposed portability path; OTel JS logs/browser instrumentation are not forced for uniformity. Browser monitoring remains optional and privacy-gated, with unrestricted session replay excluded from the Phase 1 baseline.

No observability account/stack, SDK dependency, OpenTelemetry/Faro package, ingestion credential, dashboard, alert, SLO, session replay, log drain, Alloy/Collector process, telemetry pipeline, or production telemetry was created by Task 0028.

### Object storage / protected file access proposal

`ADR-0021` now defines the Proposed object-storage posture under `D-ARCH-010` without accepting or provisioning a provider.

Current finding:

```text
no baseline persistent object storage
+
canonical receipt/payment/export/import metadata in GymPulse persistence
+
receipt/export representation generated or streamed on demand where sufficient
+
controlled import may process bounded temporary files without indefinite raw retention
+
future private ProtectedObjectStore only after a confirmed persisted-artifact requirement
```

If a future requirement triggers storage, preserve:

```text
private by default
+
canonical provider-neutral ownership metadata
+
opaque non-PII object keys
+
server authorization before short-lived signed access
+
explicit retention / deletion
+
D-SEC-001 region/residency gate
+
provider-exit / checksum / bulk-transfer validation
```

`Object Storage != Canonical Business Database`, `Signed URL != Authorization Decision`, and `Storage Policy != Complete Authorization System` remain explicit boundaries.

A stable receipt business record is required where applicable, but current canonical requirements do not mandate persisted receipt PDFs. `export.create` and protected-export requirements establish authorization/audit constraints, not long-lived stored export files. Controlled member import is confirmed, but raw source-file persistence is not.

No object-storage account/bucket, storage/IAM credential, SDK dependency, upload/download route, signed-URL implementation, receipt PDF, export job, database schema/migration, lifecycle/versioning/replication/CDN configuration, IaC, file upload, or CI workflow was created by Task 0029.

### Payment provider / integration strategy proposal

`ADR-0022` now defines the Proposed payment-provider architecture under `D-PROVIDER-001` without accepting or integrating a provider.

Current provider outcome:

```text
Razorpay + Cashfree
-> bounded sandbox shortlist only

production provider
-> not selected
```

Current integration posture:

```text
canonical RenewalOrder / AddOnOrder / Payment
+
server-owned amount / currency / purpose
+
provider-managed browser checkout
+
provider-specific raw webhook verification
+
normalized GymPulse payment states
+
provider-event dedupe
+
separate exactly-once membership/add-on effect
+
status/reconciliation API
+
refund/reversal history
+
settlement traceability
+
provider-neutral PaymentProvider port
```

Key boundaries remain explicit:

```text
Provider Payment State != GymPulse Payment State
Client Success != Canonical Payment Success
Payment Return / Redirect = Navigation + UX Signal
Provider Event Dedupe != Business Effect Exactly Once
Customer Payment Success != Merchant Bank Settlement Complete
```

A material decision-register gap was found: **merchant account / settlement ownership** is not canonically decided. Task 0030 does not assume GymPulse is merchant of record and does not select a platform/sub-merchant architecture. `D-BIZ-011` refund policy, `D-BIZ-012` offline payment policy, and `D-BIZ-013` receipt/invoice fields remain open.

No payment provider account, merchant ID, API/webhook secret, SDK, checkout/payment/webhook/refund route, reconciliation worker, payment migration/schema, sandbox/real transaction, refund, settlement configuration, provider-dashboard user, CI/environment secret, IaC, or deployment was created by Task 0030.

### Messaging provider / notification delivery proposal

`ADR-0023` now defines the Proposed messaging-delivery architecture under `D-PROVIDER-002` while intentionally deferring production provider selection.

Current channel finding:

```text
WhatsApp
-> leading external candidate, still unresolved

SMS / email
-> optional/fallback candidates only

in-app state
-> canonical product baseline, not an external-provider channel

push
-> future / not baseline
```

Current provider comparison if WhatsApp is approved:

```text
Direct Meta Cloud API
Twilio WhatsApp
Gupshup WhatsApp
```

Current provider-neutral posture:

```text
GymPulse-owned NotificationIntent + policy
+
marketing/service separation
+
business template key != provider template ID
+
durable async dispatch
+
current-state / preference / destination recheck
+
business-stage dedupe
+
tenant-safe sender/template configuration
+
provider-specific callback verification
+
provider-observed delivery truth only
+
provider-exit planning
```

Material decision-register gaps remain:

```text
initial launch communication channels
sender / WABA / phone-number ownership
which supported service intents are externally enabled at pilot launch
```

`D-BIZ-014` communication-consent capture remains `P1 OPEN`; Task 0031 enables no marketing campaign. Authentication OTP messaging remains separately governed under ADR-0008. Email and push providers remain separately governed by `D-PROVIDER-003` and `D-PROVIDER-004`.

No Meta Business/WABA/sender, Twilio/Gupshup account, credential, template, SDK, callback route, notification table/job, test/production message, campaign, provider-dashboard user, CI secret, IaC, or deployment was created by Task 0031.

### Product analytics provider / instrumentation proposal

`ADR-0024` now defines the Proposed product-analytics posture under `D-PROVIDER-005` without introducing an external provider for the initial pilot.

Current need finding:

```text
canonical Phase 1 KPI coverage
-> strong

behavioral funnel need
-> plausible but not yet prioritized

initial external analytics provider
-> none
```

Canonical boundary:

```text
Analytics Event != Canonical Business Record
Client Event != Payment / Attendance / Membership Truth
Product Analytics != Audit Log
Observability != Product Analytics
```

Future event posture is deliberately narrow:

```text
concrete pilot question
-> minimal event(s)
-> explicit property allowlist
-> pseudonymous identity
-> trusted tenant context
-> non-authoritative analytics
```

Candidate behavioral events include precise observations such as `renewal.options_viewed`, `payment.checkout_ui_opened`, `owner.dashboard_viewed`, `addon.detail_viewed`, or `attendance.scan_ui_opened` only when a real pilot question justifies them. Canonical outcomes such as attendance success, RenewalOrder creation, verified payment, or recorded follow-up remain measured from system-of-record data rather than duplicate analytics events.

```text
autocapture = not approved
session replay = not approved
feature flags/experiments via analytics = not adopted
warehouse/CDP = not required
```

PostHog, Mixpanel, and Amplitude were checked as credible future managed options only. `D-SEC-001`, `D-SEC-005`, and `D-SEC-006` remain open gates for jurisdiction/privacy, deletion/export, and retention. No analytics account/project/key, SDK, event, dashboard, funnel, replay, autocapture, feature flag, experiment, pipeline, CI secret, or production/test analytics traffic was created by Task 0032.

### Redis / cache / ephemeral coordination proposal

`ADR-0025` now defines the Proposed shared-cache/ephemeral-state posture under `D-ARCH-008` without introducing Redis or Valkey into the Phase 1 baseline.

Current requirement finding:

```text
Required-now Redis/Valkey use cases
-> none

Phase 1 Redis baseline
-> no

Phase 1 Valkey baseline
-> no
```

Current responsibility split:

```text
read/query cache
-> measure first; indexes/read models/database optimization first

tenant-sensitive cache
-> private by default; authority-complete isolation required if introduced

cross-request authorization cache
-> no baseline

session store
-> D-ARCH-004 / D-SEC-004 remain separately governed

rate limiting
-> abuse-control capability required where applicable
-> Redis storage not assumed

durable jobs / broker
-> ADR-0015 remains independently governed
-> Redis/BullMQ not baseline

distributed locks
-> not canonical correctness authority

idempotency / dedupe
-> durable business semantics remain outside ephemeral cache

pub/sub / realtime
-> no current Phase 1 requirement
```

Preferred future optional-cache behavior remains:

```text
cache unavailable / evicted
-> canonical persistence or safe recomputation
-> business correctness remains intact
```

Revisit `D-ARCH-008` only after measured hot-query pressure survives index/read-model work, an approved cross-replica distributed rate-limit requirement emerges, accepted session/job architecture genuinely requires shared ephemeral state, a realtime/pubsub requirement is approved, or another high-volume coordination need is demonstrated.

No Redis/Valkey instance/account/credential, client dependency, cache adapter, rate limiter, session store, distributed lock, queue/worker migration, pub/sub, Docker/CI service, IaC, or deployment was created by Task 0033.

### Member / Membership state-ownership proposal

`ADR-0026` now defines the Proposed state-ownership direction under `D-DATA-007`.

Current proposal:

```text
Member
-> stable tenant-scoped member relationship / operational record
-> independent administrative/relationship state

Membership
-> time-bounded commercial entitlement
-> Pending / Active / Frozen / Expired / Cancelled
```

Leading Member-state candidate:

```text
Enabled
Blocked
Archived
```

Key non-equivalences:

```text
Member Enabled != Membership Active
Member Blocked != Membership Cancelled
Member Archived != Membership Expired
Membership Frozen != Member Paused
Membership Expired != Member Expired
FollowUpOutcome.Cancelled != Membership Cancelled
```

Entitlement-sensitive attendance, standard no-show eligibility, renewal windows, and verified renewal effects continue to derive from Membership plus their other independent checks.

Authentication remains separate:

```text
AuthIdentity / Principal
!=
Member
!=
Membership
```

Import/reconciliation must classify source status meaning rather than copy one legacy status into both Member and Membership.

Reporting/read models should distinguish Member administrative state from Membership state; ambiguous labels such as `Active Members` require explicit definitions.

`FR-MEMBER-004` remains canonically unchanged. ADR-0026 records proposed replacement wording only and does not apply it.

No Member/Membership schema, migration, enum/type, ORM model, constraint, index, trigger, RLS policy, API/DTO/domain implementation, import mapper, test, UI, or production-data change was created by Task 0034.

Post-Task-0034 synchronization completes the existing numbered ADR queue through order 26. No Task 0035 is invented.

Fresh synchronized review identified **Architecture Decision Review / Acceptance Readiness** as the next governance phase. The first foundation batch review is now complete.

Foundation result:

```text
ADR-0001 / D-ARCH-005  reviewable, not acceptance-ready
ADR-0002 / D-ARCH-016  reviewable, not acceptance-ready
ADR-0003 / D-ARCH-001  reviewable, not acceptance-ready
ADR-0004 / D-ARCH-002  reviewable, not acceptance-ready
```

All four remain Proposed. Common hard blockers are an unidentified authorized decision owner and absent explicit approval evidence. Each also still lacks its own bounded non-production validation evidence: module-boundary enforcement for ADR-0001; strict-TypeScript/runtime/webhook/worker/import-isolation evidence for ADR-0002; workspace/dependency/build evidence for ADR-0003; and real-PostgreSQL concurrency, restore, pooling/restart, and regional/hosting evidence for ADR-0004.

`D-DATA-007` still blocks final Member/Membership schema semantics, but `ADR-0004` explicitly states that this does not prevent reviewing the database-engine choice independently.

No ADR was Accepted or Rejected, no canonical status changed, and no implementation/scaffold gate was opened by this review.

The **Foundation Acceptance Evidence Plan** exists at `docs/adr/foundation-acceptance-evidence-plan.md`, and the first isolated validation pass is now committed under `validation/foundation/`.

Current evidence:

```text
strict client/request/worker TypeScript builds            PASS
clean source dependency graph                             PASS
forbidden client -> server import detection               PASS
dependency-cycle detection                                PASS
tenant/branch/capability authorization negatives          PASS
malformed external input rejection                        PASS
request/worker reuse of one application command           PASS
replay-safe result across separate Node processes         PASS
gym-timezone boundary behavior                            PASS
raw-byte webhook verification + tamper rejection          PASS
provider-event replay dedupe                              PASS

real PostgreSQL concurrency / rollback / SQL isolation    NOT RUN
PostgreSQL backup + restore                               NOT RUN
PostgreSQL connection/pooling/restart                     NOT RUN
```

The executed environment provided Node.js `v22.16.0` and TypeScript `5.8.3` but no PostgreSQL client/server tools and no Docker/Podman. A later attempt to install PostgreSQL could not reach Debian package repositories because the sandbox has no DNS/network access. These exact versions and environment facts are validation evidence only; they are not production choices.

`validation/foundation/EVIDENCE.md` is the current evidence matrix. ADR-0001 through ADR-0004 all remain Proposed. Passing validation does not Accept an ADR, and the validation-only file-backed durability proof is explicitly **not** PostgreSQL evidence.

The next bounded evidence action is real PostgreSQL validation in an approved isolated environment, followed by decision-owner review. No external CI/cloud runner is provisioned automatically because that may create provider/cost/governance side effects.

`ADR-0026` still requires later explicit review of Member administrative semantics, Membership entitlement ownership, the proposed `FR-MEMBER-004` replacement, Blocked/Archived effects, import/reporting semantics, attendance/no-show/authorization interaction, and historical migration approach before `D-DATA-007` can become Decided.

## Legacy Migration State

Legacy flat architecture/database/API/automation/payment/notification/security/testing/engineering/open-decision files remain migration inputs until their useful material has canonical structured destinations and they are explicitly deprecated or replaced by pointers.

High-value migration sources include:

```text
05-system-architecture.md
06-database-schema.md
07-api-contracts.md
08-automations.md
09-payments-billing.md
10-notifications-whatsapp.md
12-security-audit.md
13-testing-qa.md
15-engineering-workflow.md
16-open-decisions.md
```

Legacy wording such as `docs/06-database-schema.md` describing PostgreSQL as already canonical does not override current structured governance. `docs/00-overview/assumptions.md` remains authoritative and keeps `D-ARCH-002` `PROPOSED`.

Legacy API endpoint/envelope examples in `docs/07-api-contracts.md` also remain migration evidence; ADR-0011 does not make every legacy path or payload canonical.

Legacy Next.js/Expo/Turborepo/API-deployment/job-runner/hosting/CI/testing recommendations remain evidence only. ADR-0012 through ADR-0026 are still `Proposed`, not Accepted. Neither Next.js, Expo/React Native, the co-hosted API topology, PostgreSQL-backed jobs, pg-boss, Render, Vercel, Fly.io, Cloud Run, GitHub Actions, Vitest, Playwright, Testcontainers, Jest, Cypress, pnpm, npm, Yarn, Bun, Turborepo, Grafana Cloud, Sentry, Datadog, Better Stack, OpenTelemetry, Grafana Faro, AWS S3, Cloudflare R2, Google Cloud Storage, nor Supabase Storage, Razorpay, Cashfree, PhonePe Payment Gateway, PayU, Direct Meta WhatsApp Cloud API, Twilio WhatsApp, Gupshup, MSG91, Interakt, AiSensy, PostHog, Mixpanel, Amplitude, Redis, Valkey, Upstash, Redis Cloud, ElastiCache, Memorystore, BullMQ, or Redlock is accepted merely because current evaluation recommends or compares them.

Do not delete or deprecate legacy sources merely because structured architecture documents now exist.

## Current Delivery Boundary

Phase 1 centers on member/membership management, QR and assisted attendance, inactivity detection, follow-up/return, renewals, verified payments, basic add-ons, owner operational views, notifications, consent, data quality, and audit history.

Workout programming, detailed nutrition tracking, health metrics, coaching platforms, advanced multi-branch workflows, and AI remain Future or outside active Phase 1 requirements until explicitly approved.
