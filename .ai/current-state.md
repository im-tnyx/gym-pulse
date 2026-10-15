# GymPulse Current State

## Project

`GymPulse` (`im-tnyx/gym-pulse`)

## Current Documentation Phase

`Phase 4 - System Architecture / Architecture Governance`

## Canonical Architecture Completed at Draft Level

```text
docs/02-architecture/architecture-principles.md
docs/02-architecture/architecture-overview.md
docs/02-architecture/system-context.md
docs/02-architecture/container-architecture.md
docs/02-architecture/component-architecture.md
docs/02-architecture/data-flow.md
docs/02-architecture/technology-stack.md
docs/adr/README.md
```

## Current ADR State

```text
ADR-0001  D-ARCH-005  Phase 1 architecture style                 Accepted
ADR-0002  D-ARCH-016  Primary language/runtime                   Accepted
ADR-0003  D-ARCH-001  Repository/workspace strategy              Accepted
ADR-0004  D-ARCH-002  Canonical database engine                  Accepted
ADR-0005  D-ARCH-017  Data access/query/transaction/migrations   Proposed
ADR-0006  D-ARCH-014  Managed backend/platform responsibilities  Proposed
ADR-0007  D-ARCH-004  Authentication/session architecture        Proposed
ADR-0008  D-SEC-002   Member authentication/verification method  Proposed
ADR-0009  D-ARCH-015  Authorization implementation boundary      Proposed
ADR-0010  D-SEC-008   Data-layer tenant isolation / RLS          Proposed
ADR-0011  D-ARCH-003  Primary API contract architecture          Proposed
ADR-0012  D-ARCH-012  Owner/Staff web application framework      Proposed
ADR-0013  D-ARCH-013  Member client framework / delivery strategy Proposed
ADR-0014  D-ARCH-006  API deployment boundary                    Proposed
ADR-0015  D-ARCH-007  Background jobs / scheduler                Proposed
ADR-0016  D-ARCH-009  Hosting / deployment platform               Proposed
ADR-0017  D-ARCH-019  CI/CD / production release / secrets        Proposed
ADR-0018  D-ARCH-018  Core automated testing toolchain              Proposed
ADR-0019  D-ARCH-011  Package manager                                Proposed
ADR-0020  D-PROVIDER-006 Observability provider                          Proposed
ADR-0021  D-ARCH-010  Object Storage / Protected File Access              Proposed
ADR-0022  D-PROVIDER-001 Payment Provider / Integration Strategy           Proposed
ADR-0023  D-PROVIDER-002 Messaging Provider / Notification Delivery Strategy Proposed
ADR-0024  D-PROVIDER-005 Product Analytics Provider / Instrumentation Strategy       Proposed
ADR-0025  D-ARCH-008     Redis / Cache / Ephemeral Coordination Requirement           Proposed
ADR-0026  D-DATA-007     Member / Membership State Ownership                          Proposed
```

Authorized approval evidence exists for ADR-0001 through ADR-0004 via GitHub Issue #1. Those four ADRs are `Accepted`; ADR-0005 through ADR-0026 remain independently Proposed unless their own records state otherwise.

Canonical decision status remains controlled by `docs/00-overview/assumptions.md`, not ADR draft status.

## Key Canonical Decision State

```text
D-ARCH-001  repository strategy                  P0 DECIDED
D-ARCH-002  database engine                      P0 DECIDED
D-ARCH-003  API contract architecture            P0 PROPOSED
D-ARCH-004  authentication/session               P0 OPEN
D-ARCH-005  architecture style                   P1 DECIDED
D-ARCH-006  API deployment topology              P1 OPEN
D-ARCH-007  background jobs                      P1 OPEN
D-ARCH-008  Redis/cache requirement              P2 OPEN
D-ARCH-009  hosting                              P1 OPEN
D-ARCH-010  object storage                       P1 OPEN
D-ARCH-011  package manager                      P1 ASSUMED
D-ARCH-012  Owner/Staff web framework            P0 PROPOSED
D-ARCH-013  member client strategy               P1 PROPOSED
D-ARCH-014  managed backend responsibilities     P0 OPEN
D-ARCH-015  authorization implementation         P0 PROPOSED
D-ARCH-016  primary language/runtime             P0 DECIDED
D-ARCH-017  data access/migrations               P1 PROPOSED
D-ARCH-018  testing toolchain                    P1 PROPOSED
D-ARCH-019  CI/CD + release/secrets tooling      P1 OPEN
D-SEC-001   jurisdiction/privacy                 P0 OPEN
D-SEC-002   member authentication                P0 OPEN
D-SEC-003   tenant isolation principle           P0 PROPOSED
D-SEC-004   session lifecycle                    P1 OPEN
D-SEC-008   RLS/data-layer tenant isolation      OPEN when applicable
D-PROVIDER-001 payment provider                  P1 OPEN
D-PROVIDER-002 messaging provider                P1 OPEN
D-PROVIDER-003 email provider                    P2 OPEN
D-PROVIDER-004 push provider                     P2 OPEN
D-PROVIDER-005 product analytics provider        P2 OPEN
D-PROVIDER-006 observability provider            P1 OPEN
D-DATA-004  Member/AuthIdentity separation       P1 PROPOSED
D-DATA-007  Member/Membership state ownership    P1 PROPOSED / unresolved
```

## Stable Architecture Boundaries

```text
Authentication != Authorization
Provider Identity != GymPulse Principal
GymPulse Principal != Member
UI != Authorization Boundary
Role != Permission Check
Client Tenant/Resource ID != Trusted Scope
RLS != Complete Authorization System
Static Type != Runtime Validation
API DTO != Application Command/Query
Application Command/Query != Domain Model
Domain Model != Persistence Model
Web Framework != Domain/Application Architecture
Web Framework != API Deployment Topology
Client State != Canonical Business Truth
```

Protected human operations continue to use:

```text
verified Principal
  + current account eligibility
  + current tenant/resource scope
  + current named capability or Member-self relationship
  + trusted resource relationship
  -> allow / deny
```

The trusted GymPulse runtime owns server-side authorization, runtime validation, application/domain behavior, transactions, canonical persistence, idempotency, provider verification, audit, and safe response translation.

Direct browser/mobile canonical database mutation remains unapproved.

## Current Authentication / Session Proposal

`ADR-0007` remains `Proposed`; canonical `D-ARCH-004` remains `OPEN`.

The current leading staff-web posture remains first-party, server-mediated, secure-cookie-compatible session transport with deliberate `HttpOnly`/`Secure`/`SameSite`/scope behavior where compatible, logout/invalidation, fixation/rotation controls, and explicit CSRF protection for cookie-authenticated mutations.

Exact provider, token/cookie implementation, session/device lifetime, remember-me policy, revocation SLA, and MFA posture remain separately governed.

## Current Authorization Proposal

`ADR-0009` remains `Proposed`; canonical `D-ARCH-015` remains `PROPOSED`.

Roles are scoped capability bundles, not runtime wildcard predicates. Owner is not an implicit superuser. Manager exact authority remains open. UI/route/framework guards may improve UX but every protected operation is still authorized at the trusted application boundary.

## Current Data-Layer Isolation Proposal

`ADR-0010` remains `Proposed`; canonical `D-SEC-008` remains `OPEN`.

```text
Application Authorization = Mandatory
Data-Layer Tenant Isolation = Defense in Depth
RLS != Complete Authorization System
```

If PostgreSQL is later accepted, selective tenant-focused RLS remains the leading defense-in-depth direction. Explicit tenant-scoped application queries, least-privileged non-bypass runtime/worker access, separate migration/admin privilege, transaction-safe tenant context, and Tenant A -> Tenant B pool/reuse tests remain required.

PostgreSQL is Accepted via ADR-0004 / D-ARCH-002 = DECIDED; this does not accept RLS under D-SEC-008.

## Current Primary API Contract Proposal

`ADR-0011` remains `Proposed`; canonical `D-ARCH-003` remains `P0 PROPOSED`.

```text
JSON over HTTPS
+
resource/query reads and explicit business-command actions
+
runtime trust-boundary schemas
+
purpose-specific DTOs
+
stable HTTP semantics and machine-readable problem codes
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

ADR-0011 preserves runtime validation, DTO/application/domain/persistence separation, server-authoritative business truth, application authorization, and provider callback verification. `D-ARCH-006` remains `OPEN` for co-hosted vs independently deployed API mapping.

## Current Owner / Staff Web Framework Proposal

`ADR-0012` now exists as `Proposed`; canonical `D-ARCH-012` remains `P0 PROPOSED`.

Task 0020 compared:

```text
A. Next.js App Router + React
B. React Router Framework Mode + React
C. React SPA + Vite + separate trusted API
D. another mature non-React full-stack/server-rendered framework
```

Current strongest fit is Option A, with React Router Framework Mode the strongest alternative and a Vite SPA a credible topology-dependent fallback.

Proposed direction:

```text
Next.js App Router + React
+
strict TypeScript only if D-ARCH-016 is later accepted compatibly
+
Server Components by default for non-interactive page/layout composition
+
narrow Client Component boundaries for browser interaction
+
Server Functions/Actions and Route Handlers as thin adapters only
+
ADR-0011 JSON HTTP preserved as the primary independently consumable contract
+
operation/resource authorization independent of framework routing/UI
+
private-by-default tenant-sensitive cache posture
+
server-only/client-safe module boundaries
+
D-ARCH-006 co-hosted/separate API optionality preserved
```

### Framework security boundaries

- Next.js/React presentation code does not own domain/application rules.
- Server Components are not authorization or domain-service boundaries.
- Server Functions/Actions are network-reachable mutation adapters: runtime validate, authenticate/resolve Principal, authorize, invoke application commands, preserve idempotency/audit semantics.
- Route Handlers may implement ADR-0011 transport adapters if co-hosting is later accepted, but remain thin.
- Client Components receive only purpose-specific authorized DTOs; no database rows, provider objects, session secrets, server config, database clients, privileged authorization internals, or raw provider payloads.
- navigation/layout/middleware/Proxy/UI visibility is never sufficient authorization.
- authenticated tenant data is private by default; shared cache behavior requires authority-complete keys, revocation/invalidation reasoning, and Tenant A -> Tenant B negative tests.
- `D-ARCH-008` remains OPEN; Task 0020 does not add Redis for framework caching.
- cookie-based staff sessions require a complete CSRF model under the later accepted auth/session architecture.
- XSS remains material even with `HttpOnly` cookies because same-origin script can invoke authenticated actions.

### Rendering / performance posture

The Owner/Staff surface is an authenticated operational app, not an SEO-first site. Rendering/caching is selected by workflow need rather than maximal static generation.

Large Member search, no-show/renewal/payment queues, and dashboard drill-down remain server-filtered/paginated with bounded DTOs. Client state is presentation state only; current server state resolves authorization and business conflicts.

### Accessibility / operations posture

Critical Owner/Front Desk workflows require semantic controls, keyboard/focus behavior, clear validation/blocked/retry states, and non-color-only critical status. Formal conformance target remains OPEN under `NFR-ACCESSIBILITY-003`.

No framework makes the repository implementation-ready. Acceptance still needs session/topology compatibility, server/client boundary validation, cache isolation tests, representative staff workflow validation, accessibility/browser evidence, and explicit decision-owner approval.

### Official framework research recorded by Task 0020

Research date: `2026-09-11`.

Task 0020 reviewed official current Next.js, React, React Router, and Vite material for App Router, Server/Client Components, Server Functions, authentication/data-security guidance, CSP, self-hosting/deployment, instrumentation/OpenTelemetry, React Server Component/Function semantics, React Router Framework/Data/Declarative modes, loaders/actions/rendering/deployment, and Vite SSR.

Observed current Next.js `16.3.4` and React Router `8.2.0` are research evidence only. No exact version is pinned or accepted.

## Current Member Client Delivery Proposal

`ADR-0013` now exists as `Proposed`; canonical `D-ARCH-013` remains `P1 PROPOSED`.

Task 0021 compared:

```text
A. responsive browser-first web
B. responsive web + progressive PWA capabilities
C. Expo / React Native native client
D. credible hybrid native wrapper
```

Current proposed direction:

```text
responsive HTTPS Member web as Phase 1 baseline
+
normal use without installation
+
OS Camera -> HTTPS GymPulse QR entry as baseline
+
browser camera scanner only after real target-device validation
+
PWA capabilities added progressively and individually
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

### Member delivery security boundaries

- Both web/PWA and future native clients remain untrusted.
- `QR token != Member identity`.
- `QR scan != Attendance truth`.
- `Payment return/deep link != Payment proof`.
- `Notification delivery != Canonical business state`.
- Member IDs, phone numbers, provider subjects, route state, and cached client state do not establish Member-self authorization.
- Browser reusable secrets are not stored in ordinary `localStorage`.
- Future native reusable credentials require an OS-protected storage category; no package/token format is selected.
- Service-worker/private-cache behavior, if ever enabled, requires Member A -> Member B same-device isolation and stale-revocation tests.
- Direct browser/mobile canonical database access remains unapproved.

### QR / camera posture

Preferred order:

```text
1. OS Camera -> HTTPS GymPulse link
2. browser/PWA in-app scanner after Android/iPhone/low-end validation
3. native in-app scanner only after native escalation evidence
```

Browser camera access is technically viable over HTTPS with user permission, but browser-native barcode detection is not universally available enough to be the sole cross-browser production decoder. No QR package was selected or installed.

### Authentication/session relationship

```text
D-ARCH-004 OPEN
ADR-0007 Proposed
D-SEC-002 OPEN
ADR-0008 Proposed
D-SEC-004 OPEN
```

The proposed browser-first client remains compatible with first-party server-mediated secure-cookie session transport with `HttpOnly` where compatible, `Secure`, deliberate `SameSite`, CSRF protection, logout/revocation, and fixation/rotation controls.

Managed phone OTP/passwordless remains only Proposed under ADR-0008; Task 0021 does not accept it.

A future native client may use a different secure credential transport while preserving:

```text
Authentication Evidence
-> AuthIdentity
-> GymPulse Principal
-> explicit Member-self relationship
-> authorization
```

### Offline / push / payment posture

No offline-first canonical workflow is proposed. Offline/local client state cannot establish attendance, membership eligibility, renewal, payment, entitlement, or authorization.

Push remains optional and separately governed. `D-PROVIDER-002` and `D-PROVIDER-004` remain OPEN.

Payment checkout/return is navigation and presentation only. A return URL, Universal Link, App Link, or query string must refresh canonical Payment state; client-visible success cannot make a payment Paid.

### Native escalation triggers

Revisit native if evidence shows browser QR/camera fails acceptance, native push becomes business-critical, approved background/offline/device requirements emerge, app-store distribution becomes a business requirement, browser payment/auth UX is materially unacceptable, active workout/progress/health scope benefits materially from native APIs, or measured adoption/support/reliability favors native.

These triggers reopen governance; they do not accept Expo/React Native automatically.

### Target-device and accessibility evidence still required

Validation remains required on current Android Chrome, representative low-end/older Android, current iPhone Safari, installed PWA mode if proposed, slow/unstable network, and camera permission granted/denied/unavailable.

Critical Member flows require screen-reader semantics, text scaling/zoom, touch-target sizing, contrast, clear loading/error/retry behavior, camera fallback, and assisted check-in fallback where policy permits.

## Current API Deployment Boundary Proposal

`ADR-0014` now exists as `Proposed`; canonical `D-ARCH-006` remains `P1 OPEN`.

Task 0022 compared:

```text
A. co-hosted web + trusted API runtime
B. independent trusted API deployment
C. co-hosted-first with explicit extraction seam
D. client-specific BFF / split API topology
E. function-per-route / provider-function-heavy API
```

Current proposed direction:

```text
Phase 1:
co-host trusted /v1 HTTP/API transport with Owner/Staff server runtime
+
thin transport/framework adapters
+
framework-independent application/domain/security modules
+
ADR-0011 remains independently consumable
+
Member web/future native consume the same API
+
provider callbacks preserve dedicated verification adapters
+
background execution remains separate
+
canonical/security-critical truth is never process-local
+
future independent API extraction seam exists from day one
```

### Deployment boundary invariants

```text
API Contract != API Deployment
Repository Topology != Deployment Topology
Web Framework != Domain/Application Architecture
Route Handler != Application Use Case
Server Action != Business Rule
HTTP Process != Canonical Business State
Background Worker != HTTP Request Runtime
Physical Deployment Topology != Public DNS / Origin Topology
```

### Owner/Staff web relationship

If Next.js is later accepted, Route Handlers/Server Functions remain adapters only.

Owner/Staff server-rendering code may call the same application handlers directly in-process when that avoids an unnecessary loopback HTTP call, but:

```text
Direct in-process call != different business semantics
```

Principal resolution, tenant/resource authorization, use-case rules, domain logic, audit, idempotency, and transactions remain shared.

### Member / future-native relationship

ADR-0011 remains the hard external boundary:

```text
Member Web / Future Native
-> versioned JSON HTTPS
-> Trusted GymPulse Runtime
```

No Next.js-specific transport is allowed to replace it.

### Authentication / CORS / CSRF posture

`D-ARCH-004` and `D-SEC-004` remain OPEN.

Co-hosting may enable same-origin staff-web/API traffic, but same-origin is not a deployment requirement.

If cross-origin credentialed browser traffic is later used:

- allowed origins are explicit and environment-aware,
- wildcard credentialed CORS is not allowed,
- cookie/session configuration is deliberate,
- CORS does not replace CSRF protection.

No cookie, CORS, CSRF, or Auth implementation was created.

### Webhook boundary

Provider callbacks remain separate trust entries:

```text
raw/signature material
-> provider verification
-> normalized event
-> internal resource/tenant resolution
-> dedupe/idempotent correctness work
-> durable continuation where needed
-> acknowledgement
```

Webhook verification is not human-session authentication.

### Background worker boundary

`D-ARCH-007` remains OPEN.

```text
HTTP Request Runtime
!=
Durable Background Execution
```

No critical retryable workflow may depend only on process-memory timers or fire-and-forget promises.

### Database / RLS / secret boundary

`D-ARCH-002`, `D-ARCH-017`, and `D-SEC-008` remain separately governed.

Topology must support pool/connection behavior, horizontal replicas, transaction-safe tenant context if RLS is later accepted, and separate migration/admin credentials.

Normal request runtime is not schema owner.

Browser bundles receive no DB credentials, provider secrets, webhook secrets, Auth server secrets, migration/admin credentials, or similar privileged values.

### Failure / scaling / extraction findings

Co-hosting initially shares web/API resource and failure domains. Independent API deployment improves some failure isolation but adds network, release, origin/session, observability, and operational surfaces.

Current evidence favors co-hosted-first plus explicit extraction triggers.

Revisit independent API deployment when web/API scaling diverges, shared releases create unacceptable availability risk, native/external traffic dominates, runtime/security constraints diverge, separate release cadence becomes valuable, hosting constraints make co-hosting inefficient, sustained resource contention is measured, or team ownership requires separation.

These are revisit triggers, not automatic extraction.

## Current Background Jobs / Scheduler Proposal

`ADR-0015` now exists as `Proposed`; canonical `D-ARCH-007` remains `P1 OPEN`.

Task 0023 compared:

```text
A. PostgreSQL-backed job runner/scheduler (pg-boss-style)
B. Postgres-native queue + Cron (PGMQ + pg_cron / Supabase Queues+Cron)
C. managed durable task/workflow platform (Trigger.dev-style)
D. Redis-backed queue/scheduler (BullMQ-style)
E. custom database job table + generic Cron/poller
```

Current proposed direction:

```text
PostgreSQL-backed durable queue/scheduler
+
separate Background Worker Runtime
+
GymPulse Durable Continuation port
+
same-transaction enqueue where possible
+
transactional outbox/dispatcher only when crossing to an external queue/platform
+
explicit retry / terminal failure / redrive behavior
+
business-level idempotency always
+
no Redis baseline
```

If PostgreSQL and a compatible Node runtime are later accepted, pg-boss is the leading current implementation candidate. No queue/library/provider is accepted by ADR-0015.

### Background-execution invariants

```text
HTTP Request Runtime != Durable Background Execution
Queue Delivery Guarantee != Business-Effect Exactly-Once
Scheduler Timing != Business Eligibility
Job Payload != Canonical Business State
Job History != Canonical Audit / Business History
```

Workers use explicit System/Job Context, tenant/gym/branch scope, payload type/version validation, deterministic business keys, current-state reload, shared application/domain handlers, and safe provider adapters.

### Transactional handoff

Preferred same-database handoff when supported:

```text
BEGIN
  canonical business write
  required audit/idempotency
  durable job enqueue
COMMIT
```

If the queue/task system cannot participate in the canonical transaction:

```text
BEGIN
  canonical business write
  durable outbox/continuation record
COMMIT

dispatcher -> external task system
```

Direct post-commit fire-and-forget enqueue is not acceptable where losing the continuation would violate requirements.

### Scheduling / timezone posture

The scheduler wakes work; application/domain rules decide current eligibility.

Gym-local schedules use configured gym timezone/business clock while canonical timestamps remain UTC.

Implementation may use per-tenant schedules or a bounded due-tenant sweep. Exact frequencies and missed-run policies remain job-specific and unfinalized.

### Retry / failure posture

Retries are expected and bounded.

Failures are classified as:

- transient infrastructure/provider,
- rate-limit,
- permanent provider/domain rejection,
- stale business condition,
- invalid payload/version,
- data-quality inconsistency,
- security/tenant mismatch,
- ambiguous provider outcome requiring reconciliation.

Terminal failures remain operator-visible and support safe redrive without bypassing business idempotency.

### Provider boundaries

Notification jobs reload current business/preference state before send/suppress decisions.

Payment reconciliation reuses verified provider evidence and existing payment-effect uniqueness; job completion never becomes payment proof.

External provider calls remain outside long correctness-critical DB transactions where practical.

### Security / tenant scope

Workers are trusted server runtimes but not unrestricted.

They require:

- least-privilege runtime credentials,
- explicit tenant/resource scope,
- trusted System/Job Principal,
- separate migration/admin credentials,
- server-only provider secrets,
- no direct client queue access.

Job payloads/logs avoid secrets and unnecessary PII.

### Scaling / revisit triggers

Postgres-backed jobs share database resources with canonical OLTP.

Monitor backlog, oldest job age, retries, terminal failures, job duration, queue-table growth, DB CPU/I/O/locks, and interactive latency.

Revisit external broker/managed durable execution if measured queue load harms OLTP, long-running workflow orchestration becomes core, provider concurrency becomes complex, multi-region execution is required, worker hosting constraints emerge, or ownership/release boundaries justify it.

Redis remains unnecessary until measured/tool-driven evidence exists.


## Current Hosting / Deployment Platform Proposal

`ADR-0016` now exists as `Proposed`; canonical `D-ARCH-009` remains `P1 OPEN`.

Task 0024 compared:

```text
A. Integrated Service / Worker PaaS — Render representative
B. Web-optimized platform + separate worker — Vercel representative
C. Portable container PaaS — Fly.io representative
D. Major-cloud managed compute — Google Cloud Run representative
E. Self-managed VM / Kubernetes baseline
```

Current proposed direction:

```text
one approved primary region
+
managed stateless request-serving service
+
separate non-public-by-default Background Worker service
+
independent web/worker scaling and failure lifecycle
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
no edge-first transactional runtime requirement
```

Render is the leading current integrated service/worker PaaS candidate only if jurisdiction/privacy, region/locality, DB connectivity, worker lifecycle, webhook, secret, migration, rollback, and load validation pass.

Current official Render region documentation includes Oregon, Ohio, Virginia, Frankfurt, and Singapore; no India region is currently documented. Because `D-SEC-001` remains `P0 OPEN`, this is a material unresolved provider gate.

Google Cloud Run and Fly.io remain serious region-flexible alternatives with current Mumbai-region evidence. Vercel plus a separate worker platform remains a credible web-led split if its framework/deployment benefits justify an additional provider/control plane.

### Hosting boundary invariants

```text
Hosting Provider != Application Architecture
Hosting Provider != Managed Backend Responsibilities
Hosting Provider != Database Provider
Hosting Provider != Authentication Provider
Hosting Provider != Job Semantics
Hosting Provider != Observability Architecture

web/API process != worker process
Physical Deployment != Public DNS / Origin
Provider Region Availability != Legal / Privacy Acceptance
Process Memory / Local Disk != Canonical Business Truth
```

### Request runtime mapping

The request service may co-host Owner/Staff web + trusted HTTP/API as proposed by ADR-0014 while keeping framework/application/domain/security boundaries reusable.

It remains stateless/disposable and must not own canonical session revocation, payment, attendance dedupe, idempotency, job, authorization, or tenant state in process memory or host-local disk.

### Worker runtime mapping

The Background Worker remains a separate deployment unit:

- no public ingress by default,
- secure DB/provider egress,
- durable job claims,
- graceful shutdown,
- crash/redeploy recovery,
- multiple-worker safety,
- tenant/job correlation,
- independent scaling.

Scale-to-zero is not assumed compatible with a continuously polling worker.

### Network and database posture

Public ingress is limited to web/API/webhooks/appropriate health paths.

Prefer private/internal connectivity where compatible, but private networking never replaces TLS, authentication, least privilege, application authorization, or RLS.

Request runtime, worker, and canonical DB should be regionally close. Database pooling must account for web + worker replicas and preserve transaction-local tenant context if RLS is later accepted.

### Region / residency posture

`D-SEC-001` remains `OPEN`.

No production provider or region can be accepted until launch jurisdiction/privacy requirements are resolved.

Current Phase 1 baseline is one approved primary region, stateless replaceable compute, recoverable managed persistence, and tested backup/restore before any multi-region active-active architecture.

### Environment / secrets posture

Conceptual environments remain:

```text
local/development
test
staging/pre-production where adopted
production
```

Production secrets must not be automatically inherited by preview environments.

Browser-visible/build-public configuration is not a secret.

Final production release/secrets tooling remains separately governed by `D-ARCH-019`.

### Deployment / rollback posture

Preferred release model:

```text
reproducible version
-> validation
-> controlled deploy
-> health/readiness
-> cutover
-> smoke verification
-> rollback or forward-fix
```

Production migration runs once through a controlled release mechanism. Every replica racing migrations on startup is rejected.

Provider rollback does not make destructive schema migration reversible.

### Scaling posture

Web/API and worker scale independently.

Request scale signals include HTTP concurrency/latency/resource pressure.

Worker scale signals include queue depth, oldest job age, execution duration, provider limits, and resource pressure.

No Kubernetes or Redis baseline is introduced for hypothetical scale.

### Observability posture

Hosting-native logs/metrics are supplemental.

GymPulse still owns:

- request/job correlation,
- privacy-safe tenant context,
- payment/webhook diagnostics,
- queue/backlog health,
- reconciliation state,
- business-health signals.


## Current CI/CD / Release / Secrets Proposal

`ADR-0017` now exists as `Proposed`; canonical `D-ARCH-019` remains `P1 OPEN`.

Task 0025 proposes a release-security capability model first, with GitHub Actions as the leading orchestration candidate only.

### Release trust model

```text
source revision
-> required CI gates
-> traceable build/artifact identity
-> controlled environment promotion
-> one controlled production migration action
-> compatible web/worker deployment
-> post-deploy smoke/observation
-> rollback where safe / forward-fix where rollback is unsafe
```

The CI system is a policy/orchestration layer. The eventual hosting provider remains a replaceable deployment executor rather than the authority for source review, business correctness, or canonical release policy.

### PR / required-check posture

Protected production source flow should require the approved set of checks before promotion.

Untrusted pull-request execution must not receive production deployment, migration, database, Auth, payment, messaging, or other production credentials.

Exact branch protection/ruleset configuration remains implementation work and may depend on repository-plan capabilities.

### Artifact / provenance posture

A production deployment should be traceable to:

```text
source commit SHA
+
CI/release run
+
build/artifact or deployment identifier
+
target environment
+
deployed service/runtime unit
+
actor/approval where available
```

Build/test commands and release identity conventions must remain documented outside a single CI vendor.

### Secrets / deployment identity posture

```text
untrusted PR/preview
!=
production trust
```

Preferred controls:

- least-privilege CI token permissions;
- production/environment-scoped secrets;
- OIDC/federated short-lived deployment identity where the selected host supports it;
- narrow static deployment credentials only where federation is unavailable;
- no runtime application secrets copied into CI unless a release step genuinely requires them;
- separate runtime and migration credentials where practical;
- no secrets in source, logs, caches, or artifacts.

GitHub Environments, repository/environment secrets, OIDC trust, deployment tokens, and hosting credentials are not configured by Task 0025.

### Database migration posture

```text
production migration
=
one controlled release action
```

Never:

```text
every web/worker replica startup
-> migration race
```

Preferred where practical:

```text
Runtime DB Role != Migration DB Role
```

Migration failure blocks unsafe rollout. Expand/contract schema evolution remains the baseline for rolling compatibility.

### Web / worker rollout posture

Release architecture must tolerate bounded version overlap such as:

```text
old web + new worker
new web + old worker
old job payload + new worker
new code + old expanded schema
old code + expanded schema
```

Worker deployment continues to respect ADR-0015 drain/lease/retry/idempotency semantics.

No universal web-before-worker ordering was invented.

### Recovery posture

Rollback and forward-fix are different controls.

Rollback may be safe for compatible application/worker code or configuration.

A destructive migration or irreversible business-data transformation may require forward-fix rather than reversal.

```text
database backup restore
!=
routine deployment rollback
```

Backup restore remains disaster-recovery capability, not the default production release rollback mechanism.

### Post-deploy posture

After deployment, later implementation should verify safe signals such as:

- liveness/readiness;
- public web/API reachability;
- DB connectivity;
- worker health;
- webhook/callback error state;
- migration errors;
- authentication failures;
- error/latency anomalies;
- release-version correlation.

Sensitive financial/attendance flows should be validated primarily in sandbox/non-production rather than through destructive production synthetic transactions.


## Current Core Automated Testing Toolchain Proposal

`ADR-0018` now exists as `Proposed`; canonical `D-ARCH-018` remains `P1 PROPOSED`.

Task 0026 defines the testing architecture before binding tools.

### Evidence portfolio

```text
L1 deterministic domain
L2 application/use-case
L3 authorization/policy
L4 persistence / real-database integration
L5 API/contract
L6 provider adapter simulation/integration
L7 durable worker/job
L8 focused browser E2E
L9 deployment/smoke evidence under ADR-0017
```

The portfolio is risk-based rather than a fixed unit/integration/E2E percentage.

### Current leading tool direction

```text
Vitest
  -> leading fast TypeScript domain/application/authorization runner

real PostgreSQL if D-ARCH-002 is later accepted
  -> required for transaction/constraint/concurrency/RLS proof
  -> Testcontainers-style isolated ephemeral orchestration is leading
  -> shared CI PostgreSQL remains a fallback

Playwright
  -> leading focused Owner/Staff + responsive-Member browser E2E

provider fakes + sanitized fixtures + official sandboxes
+
table-driven authorization and cross-tenant negatives
+
worker retry/restart/idempotency integration
+
application-level Clock / controlled time
+
adapter/infrastructure failure injection
+
native E2E deferred
```

Vitest, Testcontainers, Playwright, PostgreSQL, Node.js, Jest, Cypress, and every exact testing tool remain unaccepted.

### Testing boundary invariants

```text
Test Runner != Test Architecture
Mock != Integration Evidence
Browser E2E != Domain Test
SQLite/Fake DB != PostgreSQL Proof
Code Coverage != Correctness
Test Retry != Flake Fix
Provider Sandbox != Production Truth
CI Pipeline != Test Semantics
```

### Domain / application posture

Core business rules are tested below UI/framework/provider boundaries.

Application tests verify:

```text
load state
-> authorize
-> validate rule
-> transact
-> audit
-> durable continuation
-> result
```

External ports use controlled fakes when infrastructure semantics are not the subject.

### Authorization / tenant-isolation posture

Authorization tests are first-class, table-driven positive/negative evidence across capability, tenant/gym/branch scope, resource relationship, Member-self relationship, account eligibility, revoked assignment, and spoofed resource/tenant input.

At least two tenant/gym fixture groups should be easy to construct.

If selective PostgreSQL RLS is later accepted, real DB tests must cover runtime/worker/admin roles, tenant context, missing/wrong context, pool reuse, transaction reuse, rollback reuse, Tenant A -> Tenant B reuse, and BYPASSRLS/owner behavior.

### Database integration posture

If PostgreSQL is accepted, critical persistence evidence uses real PostgreSQL.

Real-engine evidence is required for:

- transactions and commit visibility;
- constraints;
- migrations;
- locking/isolation/concurrency;
- idempotency/provider-event uniqueness;
- RLS where later accepted.

Test-wide rollback cannot be the only isolation method because it can hide multi-connection/commit/worker/locking behavior.

### API / provider posture

API tests align with ADR-0011 runtime validation, DTO, stable error, authorization, pagination, idempotency, version, money/time, and raw webhook-signature boundaries.

Provider adapters use deterministic fakes, sanitized fixtures, official sandboxes, and targeted non-production integration.

Routine CI never uses production provider accounts.

### Worker / job posture

Worker tests target Durable Continuation behavior instead of pg-boss-specific APIs.

Required evidence includes claim, retry, terminal failure, restart, lease/reclaim, duplicate delivery, multiple workers, tenant context, current-state reload, scheduler time behavior, and business idempotency.

### Browser / device posture

Browser E2E remains focused on critical Owner/Staff and Member journeys rather than every validation permutation.

Playwright is the leading current browser runner candidate because its current browser-project, BrowserContext, multi-user, trace, and cross-browser capabilities fit the proposed client architecture.

Browser emulation does not replace physical-device camera/mobile-OS evidence.

Native E2E remains deferred until native Member delivery is accepted.

### Test data / time / failure posture

Use small deterministic builders/factories, focused scenario fixtures, synthetic PII/provider/payment references, and isolated test databases/sessions/contexts.

Avoid one giant mutable seed database.

Application/domain business time uses an injectable/testable Clock seam where practical.

Failure injection occurs through ports/adapters/test infrastructure, not unsafe test-only branches inside production business logic.

### CI relationship

ADR-0018 defines what evidence exists.

ADR-0017 defines when/how that evidence blocks promotion.

Conceptual split:

```text
PR fast evidence
  -> domain/application
  -> auth/security
  -> targeted integration

full merge/release evidence
  -> real DB/migration/concurrency
  -> API/provider/worker
  -> focused browser E2E
  -> deployment smoke under ADR-0017
```

No CI workflow or release gate is implemented by Task 0026.

## Task 0026 Implementation Status

Task `0026-draft-testing-toolchain-adr` completed documentation/governance work only.

Created:

```text
docs/adr/ADR-0018-testing-toolchain.md
.ai/task/0026-draft-testing-toolchain-adr.md
```

Updated:

```text
docs/adr/README.md
docs/README.md
.ai/current-state.md
```

Explicitly not created/installed/configured/accepted:

```text
No tests/ or __tests__/
No *.test.ts / *.spec.ts
No vitest.config
No jest.config
No playwright.config
No cypress.config
No testing dependency
No browser install
No Testcontainers setup
No Docker/Docker Compose test stack
No test database
No fixture/factory implementation
No mock server
No provider sandbox account
No CI workflow
No coverage configuration
No native E2E tooling
No Vitest acceptance
No Playwright acceptance
No Testcontainers acceptance
No PostgreSQL acceptance
No Node.js acceptance
No D-ARCH-018 promotion to DECIDED
No previous ADR promotion to Accepted
```


## Current Package Manager Proposal

`ADR-0019` now exists as `Proposed`; canonical `D-ARCH-011` remains `P1 ASSUMED`.

Task 0027 compared `pnpm`, `npm`, `Yarn`, and `Bun` using current official documentation.

Current proposed direction:

```text
pnpm
+
one committed root pnpm-lock.yaml
+
pnpm workspace definition if the monorepo is accepted
+
workspace: for intentional local package edges
+
frozen CI/release install
+
strict declared dependency posture
+
package-manager version pinning
+
reviewed/restricted dependency build scripts
```

Key boundaries:

```text
Package Manager != Repository Strategy
Package Manager != Workspace Orchestrator
Package Manager != Application Runtime
Package Manager != CI Provider
Lockfile != Supply-Chain Security
Frozen Install != Dependency Approval
```

`npm` remains the conservative fallback. `Yarn` and `Bun` remain credible alternatives with different linker/configuration semantics.

No package manager is Accepted or installed.

Task 0027 created no:

```text
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
package-lock.json
yarn.lock
bun.lock
.npmrc
.yarnrc.yml
bunfig.toml
node_modules
package-manager dependency install
CI workflow/cache
Turborepo configuration
```

`D-ARCH-001`, `D-ARCH-016`, `D-ARCH-019`, `D-ARCH-018`, `D-ARCH-012`, `D-ARCH-013`, and `D-ARCH-009` remain independently governed.


## Current Observability Provider Proposal

`ADR-0020` now exists as `Proposed`; canonical `D-PROVIDER-006` remains `P1 OPEN`.

Task 0028 compared Grafana Cloud, Sentry, Datadog, Better Stack, and hosting-native telemetry using current official documentation.

Current proposed direction:

```text
Grafana Cloud
  -> leading managed provider proposal

GymPulse-owned telemetry semantics
  -> structured privacy-safe logs
  -> stable correlation context

OpenTelemetry
  -> leading server traces + metrics portability path

focused operational alerts
+
optional privacy-reviewed Faro frontend telemetry
+
no unrestricted session replay baseline
```

OpenTelemetry JavaScript maturity recorded by Task 0028:

```text
Traces   Stable
Metrics  Stable
Logs     Development
Browser  Experimental
```

Therefore GymPulse does not force OTel JS logs/browser instrumentation merely for uniformity.

Key boundaries:

```text
Observability != Audit Log
Observability != Product Analytics
Metric != Canonical Business Truth
OpenTelemetry != Observability Backend
Correlation ID != Tenant Authority
Telemetry Export Failure != Business Operation Failure
```

Current Grafana Cloud India stack availability is evidence for regional optionality only. `D-SEC-001` remains `P0 OPEN`; no production telemetry region is approved.

Task 0028 created no:

```text
Grafana Cloud stack/account
Sentry / Datadog / Better Stack project
observability SDK dependency
OpenTelemetry package
Grafana Faro package
Grafana Alloy / Collector process
ingestion/API credential
dashboard
alert rule
SLO
session replay
log drain
telemetry pipeline
production telemetry
CI workflow
```

No observability provider is Accepted or provisioned.


## Current Object Storage / Protected File Access Proposal

`ADR-0021` now exists as `Proposed`; canonical `D-ARCH-010` remains `P1 OPEN`.

Task 0029 first tested whether current Phase 1 scope actually requires persistent binary/object storage.

### Confirmed artifact requirement assessment

```text
stable receipt business record             confirmed/conditional
persisted receipt PDF                      not required
controlled member import                   confirmed
indefinite raw import-file retention       not required
protected export capability                anticipated/possible
long-lived persisted export artifact       not required
general member/staff uploads               not required
profile/media/document upload platform     future/not required
```

Current decision outcome:

```text
Phase 1 does not currently justify persistent object storage as a baseline dependency.
```

### Receipt artifact posture

`FR-RECEIPT-001..002` establish receipt record/truth but do not establish a stored PDF requirement.

Preferred current flow:

```text
canonical Payment / Receipt data
-> authorized request
-> generate representation on demand
-> stream/download
```

If persistence becomes necessary later, the PDF remains a derived/regenerable artifact. A storage failure never invalidates a canonical successful payment.

### Export artifact posture

`export.create` plus `NFR-PRIVACY-003` requires scoped authorization and auditability.

Preferred order:

```text
direct stream
-> on-demand generation
-> short-lived private artifact when asynchronous download is justified
-> long-term persistence only with explicit requirement evidence
```

### Controlled import posture

`FR-IMPORT-001..002` confirms controlled member import, not long-term raw-file storage.

```text
bounded untrusted source
-> validate / parse
-> preview / reconcile
-> authorized controlled write
-> retain required canonical/audit metadata
-> discard temporary raw source according to policy
```

### Conditional future protected-storage model

If a persisted-artifact requirement is later approved:

```text
private managed object storage
+
narrow provider-neutral ProtectedObjectStore
+
canonical object ownership metadata
+
opaque non-PII keys
+
server authorization
+
short-lived signed/presigned access
+
explicit artifact-class retention/deletion
+
D-SEC-001 region gate
+
provider-exit/checksum/bulk-transfer validation
```

Key boundaries:

```text
Object Storage != Canonical Business Database
Signed URL != Authorization Decision
Storage Policy != Complete Authorization System
Object Key / Tenant Prefix != Authorization
Provider Durability != Complete Backup/Recovery
```

Current provider research covered AWS S3, Cloudflare R2, Google Cloud Storage, and Supabase Storage. None is accepted.

`D-SEC-001`, `D-SEC-005`, and `D-SEC-006` remain separate open gates for residency, deletion/export authority, and retention.

Task 0029 created no:

```text
storage bucket/account
IAM/storage credential
storage SDK/client
upload route
download route
signed URL implementation
receipt PDF
export job
file generator
database schema/migration
worker
lifecycle rule
versioning/replication config
CDN config
Terraform/Pulumi/cloud config
file upload
CI workflow
```

No prior ADR is Accepted.


## Current Payment Provider / Integration Strategy Proposal

`ADR-0022` now exists as `Proposed`; canonical `D-PROVIDER-001` remains `P1 OPEN`.

Task 0030 freshly compared Razorpay and Cashfree using current official documentation.

### Merchant / settlement ownership finding

No canonical structured decision currently answers:

```text
Whose payment-provider merchant account receives member funds?
```

Potential models remain:

```text
A. gym-owned merchant account
B. GymPulse-owned merchant account
C. platform / sub-merchant model
```

No model is accepted by Task 0030.

A new canonical decision-register gap is recorded conceptually:

```text
merchant account / settlement ownership
```

No new decision ID was invented.

### Provider shortlist

```text
Razorpay
+
Cashfree
=
bounded sandbox shortlist
```

No production provider is selected.

No third provider was added because the unresolved fund-flow/business/commercial inputs are more decision-critical than expanding the technically credible India shortlist.

### Payment trust model

```text
Provider Payment State != GymPulse Payment State
Client Success != Canonical Payment Success
Payment Return / Redirect = navigation + UX signal
Customer Payment Success != Merchant Bank Settlement Complete
Provider Event Dedupe != Business Effect Exactly Once
```

Canonical payment states remain:

```text
Created
Pending
Paid
Failed
Refunded
Reversed
```

### Checkout / UPI posture

Phase 1 remains browser-first.

```text
trusted server
-> canonical amount / currency / purpose
-> provider order/payment session
-> provider-managed checkout
-> mobile UPI Intent / supported app handoff
   or desktop Dynamic QR where appropriate
-> return to GymPulse
-> refresh canonical server state
```

Do not build around stale/manual UPI Collect assumptions. Exact merchant-category/provider/network behavior remains an acceptance-time validation.

UPI AutoPay is not a Phase 1 baseline.

### Webhook posture

```text
raw callback
-> provider-specific authenticity verification
-> normalized verified evidence
-> resolve canonical Payment/resource
-> validate amount/currency/purpose/reference
-> provider-event dedupe
-> legal canonical transition
-> exactly-once business effect
```

Razorpay current docs explicitly document raw-body HMAC verification, `x-razorpay-event-id`, at-least-once delivery, out-of-order delivery, and 24-hour exponential-backoff retry behavior.

Cashfree current docs/tools require signature + timestamp verification and current first-party guidance requires raw-body/idempotent handling. Exact production retry/timeout behavior remains a sandbox/support validation gate.

### Reconciliation posture

Webhooks are not sufficient alone.

```text
Pending / Ambiguous
-> immutable provider references
-> trusted status lookup
-> normalize + verify
-> same canonical transition rules
-> same exactly-once effect rules
-> record reconciliation result
```

### Refund posture

Provider refund capability is evaluated separately from business entitlement.

`D-BIZ-011` remains `OPEN`.

Original Payment history is preserved; refund/reversal never becomes silent deletion.

### Settlement posture

Settlement reporting is operational/financial evidence.

```text
Payment success
!=
merchant bank settlement completion
```

Merchant account ownership must be resolved before settlement architecture can be accepted.

### Sandbox/commercial gates

Before production provider acceptance require:

- merchant/settlement ownership;
- launch payment methods;
- merchant onboarding eligibility;
- refund policy;
- receipt/invoice requirements;
- sandbox correctness;
- Android/iPhone UPI evidence;
- webhook/reconciliation evidence;
- settlement/report evidence;
- merchant-specific pricing;
- support/escalation confidence;
- security/privacy review;
- explicit decision-owner approval.

### Provider-exit posture

Canonical financial history remains GymPulse-owned.

Old historical payments retain their original provider identity and immutable external references after any future migration.

Provider-specific checkout/webhook/refund/reconciliation semantics remain behind adapters.

Task 0030 created no:

```text
payment provider account
merchant ID
API key / client secret
webhook secret
payment SDK
checkout/payment route
webhook route
refund route
reconciliation worker
payment/provider-event schema
database migration
sandbox transaction
real payment
refund
settlement configuration
bank-account configuration
CI/environment secret
provider-dashboard user
Terraform / IaC
deployment
```

No prior ADR is Accepted.


## Current Messaging Provider / Notification Delivery Proposal

ADR-0023 now exists as Proposed; canonical D-PROVIDER-002 remains P1 OPEN.

Task 0031 compared Direct Meta WhatsApp Business Platform / Cloud API, Twilio WhatsApp, and Gupshup using current first-party evidence.

### Launch-channel finding

Canonical notification requirements define supported service/transactional intent types and correctness rules, but do not select an external launch channel.

~~~text
WhatsApp
  -> leading external candidate
  -> not canonically mandatory

SMS
  -> optional/fallback candidate only

email
  -> optional/fallback candidate only
  -> D-PROVIDER-003 remains OPEN

in-app state
  -> canonical product baseline
  -> not an external-provider channel

push
  -> future / not Phase 1 baseline
  -> D-PROVIDER-004 remains OPEN
~~~

Legacy D-039 remains OPEN evidence only and was not promoted.

### Sender / WABA ownership finding

No canonical structured decision answers:

~~~text
Whose WABA / business sender / phone number
sends a tenant's messages?
~~~

Models remain:

~~~text
A. GymPulse-owned shared sender
B. gym-owned sender/WABA
C. provider/platform multi-tenant onboarding model
~~~

None is selected.

This decision affects member-visible branding, business verification, phone ownership, template ownership, credentials, billing, tenant offboarding, account-suspension blast radius, support and provider migration.

### Decision-register gaps

Task 0031 identifies these unresolved governance gaps without inventing IDs:

~~~text
initial launch communication channels
sender / WABA / phone-number ownership
which supported service intents are externally enabled at pilot launch
~~~

### Consent / service-policy posture

D-BIZ-014 remains P1 OPEN.

~~~text
Marketing Consent
!=
Service / Transactional Communication Policy

Provider Template Category
!=
GymPulse Policy Category
~~~

No marketing campaign is enabled.

Current WhatsApp platform policy requires appropriate WhatsApp opt-in for business messaging and respect for opt-out/stop requests; business-initiated messages outside the customer-service window use approved templates.

Legal/privacy conclusions remain outside Task 0031.

### Provider comparison

~~~text
Direct Meta Cloud API
  -> credible direct candidate
  -> higher operational ownership
  -> direct technical callback/security proof still required

Twilio WhatsApp
  -> credible BSP candidate
  -> signed X-Twilio-Signature callbacks
  -> strong documented Tech Provider + subaccount/WABA onboarding
  -> sandbox/test model
  -> extra provider fee layer

Gupshup
  -> credible India-focused BSP candidate
  -> direct + ISV/Tech Provider onboarding
  -> strong template/status lifecycle
  -> audited public webhook docs emphasize IP allowlisting;
     cryptographic callback authenticity remains a security gate
~~~

No provider is selected.

Outcome:

~~~text
Provider Selection Deferred
~~~

If WhatsApp is later approved as a pilot external channel, Direct Meta, Twilio, and Gupshup remain the bounded comparison set.

### Notification architecture

~~~text
Business Event / Schedule
-> NotificationIntent
-> current eligibility / policy
-> current preference / destination
-> tenant-approved sender configuration
-> GymPulse business template key
-> provider template/language mapping
-> MessagingProvider adapter
-> Provider
-> verified/normalized provider observation
~~~

GymPulse owns notification eligibility and policy.

### Business-template posture

~~~text
GymPulse Business Template Key
!=
Meta / Twilio / Gupshup Provider Template ID
~~~

Provider template IDs/language mappings remain configuration/integration metadata.

Exact language policy remains unresolved.

### Tenant / sender posture

Trusted configuration concept:

~~~text
tenant/gym
-> channel
-> approved provider/account/sender
-> approved template mappings
~~~

Client input cannot choose arbitrary sender, WABA, provider credential or template.

Tenant A -> Tenant B sender/template negative tests are required later.

### Async dispatch posture

Messaging is outside canonical correctness-sensitive transactions.

~~~text
canonical business transaction
-> durable notification intent
-> worker reloads current state
-> policy/preference/destination recheck
-> provider adapter send
-> attempt/reference/status evidence
~~~

ADR-0015 continues to own durable background technology.

### Retry / dedupe posture

~~~text
Notification Intent Dedupe
!=
Provider Attempt ID

Provider Callback Dedupe
!=
Business Notification Dedupe

GymPulse job retry
!=
Provider API retry
!=
Provider internal delivery retry
!=
Provider callback retry
~~~

Permanent failures are not retried blindly.

### Delivery callback posture

Twilio current docs provide signed X-Twilio-Signature callbacks and warn that status callbacks can arrive out of order.

Gupshup current docs expose message/user/system callbacks and quick-ack/retry behavior. The audited public docs recommend IP allowlisting; equivalent cryptographic signing was not established during Task 0031 and remains an acceptance gate.

Direct Meta technical callback mechanics require current first-party proof before acceptance.

### Delivery-state truth

Preserve FR-NOTIFICATION-003:

~~~text
Provider Accepted != Delivered
Delivered != Read
~~~

Twilio may expose queued/failed/sent/delivered/read where the channel supports it.

Gupshup exposes enqueued/failed/sent/delivered/read and documents that arrival order may differ from event chronology.

Unsupported/unobserved states are never fabricated.

### Stale-state / preference posture

Before every delayed send or retry:

~~~text
reload current canonical business state
reload current preference/policy
reload current allowed contact destination
reload current tenant sender/template config
~~~

Queued work is not irrevocable permission to send.

A Member who renewed before an old reminder dispatch causes that reminder to be suppressed.

A changed/invalid destination is not blindly reused.

### SMS / email / push posture

SMS is not a canonical pilot-launch requirement, so Task 0031 does not perform or accept an SMS/DLT provider architecture.

If SMS is later promoted, current TRAI/DLT/provider requirements must be researched separately.

Email remains D-PROVIDER-003 OPEN.

Push remains D-PROVIDER-004 OPEN and is not mandatory under ADR-0013.

No automatic WhatsApp -> SMS/email fallback is accepted.

### Authentication OTP separation

~~~text
Authentication OTP Channel
!=
Business Messaging Provider / Consent Policy
~~~

Task 0031 does not select Member OTP transport.

### Security / privacy posture

Required controls include:

- server-only provider secrets;
- provider-supported callback authenticity validation;
- callback replay/idempotency handling;
- tenant sender/template isolation;
- current destination resolution;
- no marketing without approved policy;
- stale-state suppression;
- restricted provider-dashboard/template administration;
- non-production send guardrails;
- link authorization through GymPulse;
- minimized message content and telemetry.

Full phone numbers, full message bodies, provider secrets, callback signatures and raw provider payloads are not general-purpose logs/metrics.

D-SEC-001 remains OPEN.

### Pricing / support posture

Current public evidence is time-sensitive.

~~~text
Twilio:
  USD 0.005/message handling fee
  + Meta template fees
  (public pricing current as of Aug 2026)

Gupshup:
  public partner pricing from about USD 0.001/message
  + WhatsApp fees
  exact contract/support terms still required

Direct Meta:
  upstream fees without BSP handling layer
  but higher direct operational ownership
~~~

Headline price does not select a provider.

Support/escalation evidence for onboarding, template issues, sender/account suspension, API incidents, callbacks, billing and migration remains an acceptance gate.

### Provider-exit posture

Keep GymPulse-owned:

~~~text
NotificationIntent
business template key
policy / preference
business dedupe identity
attempt/history
tenant configuration identity
~~~

Provider-specific WABA/sender/template/message IDs remain bounded integration metadata.

Number/WABA/template migration is not assumed frictionless.

No active-active provider failover is a Phase 1 baseline.

Task 0031 created no:

~~~text
Meta Business account
WhatsApp Business Account
sender / phone registration
Twilio account / subaccount
Gupshup account / app
other BSP account
API/access/webhook secret
WhatsApp/SMS/email template
messaging SDK
messaging/callback/webhook route
NotificationIntent table
database migration
notification worker/job
test message
production message
broadcast/campaign
provider-dashboard user
CI/environment secret
IaC
deployment
~~~

No prior ADR is Accepted.


## Current Product Analytics Provider / Instrumentation Proposal

ADR-0024 now exists as Proposed; canonical D-PROVIDER-005 remains P2 OPEN.

Task 0032 first tested whether the initial Phase 1 pilot requires an external product-analytics provider.

### External analytics need finding

~~~text
Initial Phase 1 external product analytics provider
-> not required
~~~

Core pilot outcome metrics are already derivable from canonical GymPulse records.

Examples:

~~~text
Active Members
Valid Check-ins
QR-source adoption
7-Day Active Members
Open No-show Cases
Returned Members
Renewal Rate
Verified Gross Collected
Refunds / Reversals
Payment Exceptions
Add-on Revenue
Follow-up Completion
~~~

Manual pilot observation remains acceptable for early Staff Workflow Independence and UX discovery where canonical data does not answer the question.

### Canonical KPI boundary

Preserve:

~~~text
Analytics Event != Canonical Business Record
Client Event != Payment Truth
Client Event != Attendance Truth
Client Event != Membership Truth
Analytics Funnel != Financial Ledger
Analytics Conversion != Verified Business Outcome
Product Analytics != Audit Log
Observability != Product Analytics
~~~

Owner-facing operational KPI cards continue to use authorized canonical/read-model state.

### Behavioral analytics needs

Behavioral analytics may later answer:

~~~text
Did a Member open Member Home?
Did a Member reach the QR scan UI?
Did a Member view renewal options?
Where was renewal abandoned before checkout?
Did an Owner open the daily dashboard?
Did a Member view add-on details?
~~~

These are plausible future questions, not initial-pilot provider requirements.

### Candidate event posture

Current candidate events were reviewed rather than copied blindly.

~~~text
member.home_viewed
  -> useful behavioral event if prioritized

attendance.scan_started
  -> useful but prefer precise attendance.scan_ui_opened

attendance.checkin_succeeded
  -> do not use as canonical success;
     Attendance record is authoritative

attendance.checkin_failed
  -> observability/UX question only if specifically needed

renewal.options_viewed
  -> useful behavioral event

renewal.order_created
  -> canonical RenewalOrder is stronger evidence

payment.checkout_started
  -> prefer payment.checkout_ui_opened for UI behavior

addon.catalog_viewed
  -> useful if browsing is a product question

addon.detail_viewed
  -> useful if view-to-purchase is prioritized

owner.dashboard_viewed
  -> useful behavioral event

followup.recorded
  -> canonical FollowUp record is stronger evidence
~~~

Legacy outcome-style analytics events are not copied into the future behavioral baseline.

### Event taxonomy posture

If analytics is later justified:

~~~text
Pilot/Product Question
-> Metric/Funnel
-> Minimal Event(s)
-> Explicit Property Allowlist
~~~

Provider-neutral event documentation should include:

~~~text
event name
event version
question answered
client/server source
allowed properties
privacy classification
authority status = non-authoritative
~~~

Do not track everything now for hypothetical future analysis.

### Client/server event boundary

Client events may represent:

~~~text
surface viewed
scan UI opened
renewal options displayed
checkout UI opened
catalog/detail viewed
~~~

Browser events are untrusted and may be blocked, forged, duplicated, or lost.

Canonical outcomes remain server/system-of-record state.

Server analytics events should not duplicate canonical state unless a concrete non-authoritative funnel question requires the boundary.

### Analytics identity posture

Preferred future identity:

~~~text
opaque pseudonymous analytics subject
+
opaque tenant/gym analytics identity where needed
+
safe coarse actor type
~~~

Do not use raw phone, email, display name, or external provider subject as the default analytics identity.

Preserve:

~~~text
Provider Identity != GymPulse Principal
GymPulse Principal != Member
Provider Session != GymPulse Login Session
~~~

Anonymous acquisition identity merging is not a Phase 1 requirement.

Shared-device logout/account change requires provider identity reset validation before future adoption.

### Tenant isolation posture

~~~text
Analytics tenant/gym property != Application Authorization
Provider Group != GymPulse Tenant Authority
~~~

Browser-submitted tenant identifiers are not trusted analytics scope.

Prefer trusted server-issued safe analytics context where practical.

Cross-tenant product analytics access remains privileged internal access.

Project-per-gym complexity is not introduced without evidence.

### PII/privacy posture

NFR-PRIVACY-004 remains first-class.

General product analytics excludes by default:

~~~text
raw phone
raw email
OTP
session/auth tokens
provider secrets
raw payment/provider payloads
free-text staff/follow-up notes
health/medical details
message bodies
unsafe URL/query values
~~~

Provider automatic IP, geo, device, browser, referrer, URL and persistent-identifier behavior requires explicit review before adoption.

D-SEC-001 remains OPEN.

### Autocapture posture

~~~text
Autocapture = not approved
~~~

Explicit stable event instrumentation is preferred over broad DOM/form/click capture.

### Session replay posture

~~~text
Session Replay = not approved
~~~

Replay requires a separate explicit product need plus masking proof, sampling, retention/deletion, jurisdiction/privacy and security validation.

Provider masking capability does not imply zero privacy risk.

### Provider evaluation

Current first-party research date: 2026-09-27.

~~~text
PostHog
  -> credible future managed option
  -> explicit events/funnels + autocapture/replay available
  -> defer

Mixpanel
  -> credible future managed option
  -> browser/server/API analytics + identity/privacy controls
  -> current technical India data-residency option visible
  -> defer

Amplitude
  -> credible future managed option
  -> browser/server SDKs + groups/TTL/privacy APIs
  -> defer
~~~

No provider is selected.

Provider region availability is technical evidence only:

~~~text
provider region availability
!=
legal/privacy approval
~~~

### Environment model

Any future provider must preserve:

~~~text
development
preview
staging/test
production
~~~

separation or equivalent reliable filtering/isolation.

Synthetic tests must not pollute production metrics.

~~~text
public/browser ingestion identifier
!=
private management/export/admin credential
~~~

### Retention / deletion dependencies

Canonical gates remain:

~~~text
D-SEC-001 = OPEN
D-SEC-005 = OPEN
D-SEC-006 = OPEN
~~~

No analytics retention period is invented.

Future provider acceptance requires deletion/export/retention and safe subject-mapping evidence.

### Reliability posture

~~~text
Analytics Provider Failure
!=
GymPulse Business Failure
~~~

Analytics never blocks:

~~~text
check-in
renewal
payment
staff follow-up
member update
Owner/Staff operations
~~~

No financial-grade exactly-once requirement exists for product analytics.

No Redis/durable business queue is introduced solely for analytics.

### Performance posture

No initial analytics browser SDK means no new analytics-specific Member bundle/startup/network cost.

A future browser SDK must prove acceptable bundle/startup/network/batching/CSP behavior on representative low-end Member devices.

### Cost / operations posture

Initial external analytics ingestion cost:

~~~text
0
~~~

Current provider free/pilot tiers are not a justification for collection.

Future operations would include event-taxonomy review, privacy/property review, identity/reset behavior, environment isolation, access control, volume/cost monitoring, retention/deletion/export and provider incidents.

### Provider-exit posture

Keep GymPulse-owned:

~~~text
event names
event versions
question/metric mapping
allowed properties
privacy classification
authority status
identity mapping rules
tenant-context rules
~~~

Provider replacement should primarily change adapter/SDK/transport/configuration.

Raw-event export, deletion and migration behavior require validation before provider acceptance.

### Proposed outcome

~~~text
Outcome A:
Defer external product analytics for initial Phase 1 pilot.
~~~

D-PROVIDER-005 remains P2 OPEN so a later concrete behavioral need can reopen provider evaluation.

Task 0032 created no:

~~~text
analytics provider account
analytics project
API/project/management key
browser SDK
server SDK
event helper implementation
ProductAnalytics port implementation
event instrumentation
dashboard
funnel
cohort
retention report
heatmap
session replay
autocapture
feature flag
experiment
analytics database
warehouse
CDP
event pipeline
CI/environment secret
production/test analytics traffic
deployment
~~~

No prior ADR is Accepted.


## Current Redis / Cache / Ephemeral Coordination Proposal

ADR-0025 now exists as Proposed; canonical D-ARCH-008 remains P2 OPEN.

Task 0033 first tested whether Phase 1 needs any shared low-latency ephemeral-state infrastructure.

### Redis requirement finding

~~~text
Phase 1 Redis baseline
-> no

Phase 1 Valkey baseline
-> no

Required-now shared ephemeral use cases
-> none
~~~

Current evidence supports deferral rather than selecting an engine/provider.

### Use-case classification

~~~text
Required now
  -> none

Potential later
  -> measured hot read/query cache
  -> distributed shared rate limit after multi-replica evidence
  -> shared session state only if accepted session architecture needs it
  -> narrow ephemeral coordination/dedupe optimization

Already solved elsewhere
  -> durable jobs/scheduling
  -> critical idempotency/business dedupe
  -> canonical business counters
  -> authorization truth

Not justified
  -> pub/sub/realtime
  -> leader election
  -> feature flags
  -> analytics buffering
  -> multi-purpose Redis platform

Unsafe use
  -> Redis as sole payment/attendance/membership/idempotency guard
  -> stale authorization cache as authority
  -> volatile pub/sub as durable critical continuation
~~~

### Canonical truth boundary

Preserve:

~~~text
Redis != Canonical Business Database

Cache Hit != Canonical Truth
Cache Miss != Record Missing
Cache Write != Canonical Commit

Redis Dedupe != Business Exactly Once
~~~

Complete Redis/cache loss must not destroy or make unreconstructable canonical GymPulse business truth.

Correctness continues to rely on durable state, transactions, constraints, verified provider evidence and business idempotency according to the owning decisions.

### Read/query cache posture

Database/query work comes first:

~~~text
measure
-> query shape
-> indexes
-> bounded pagination
-> N+1 analysis
-> read models / projections where justified
-> connection/runtime analysis
-> shared cache only if a measured problem remains
~~~

Representative paths to measure before proposing a distributed read cache:

~~~text
Owner dashboard
Member search
no-show queue
renewal queue
payment-exception queue
Member Home
~~~

No measured hot-query requirement currently exists.

Small request/process-local caching remains acceptable only for safe non-authoritative state where instance-local incoherence is harmless.

### Tenant-sensitive cache posture

Authenticated tenant/member data remains private by default.

Any future shared cache requires authority-complete scope/invalidation reasoning.

Potential key dimensions may include tenant/gym, resource, query dimensions, visibility/permission context and representation/schema version.

Do not trust client-supplied tenant/resource identifiers as cache authority.

Future implementation requires explicit Tenant A -> Tenant B negative tests.

Cache keys/values should minimize PII and must not casually contain phone, email, names, notes, tokens or sensitive payment data.

### Authorization-cache posture

ADR-0009 baseline remains:

~~~text
no distributed cross-request authorization cache required

request-scoped trusted context / memoization
allowed only when it cannot outlive the request safely
~~~

Preserve:

~~~text
Cached Authorization Result
!=
Canonical Authorization State
~~~

Any future cross-request authorization cache requires explicit invalidation, bounded staleness, revocation semantics, tenant-safe keys and negative tests.

No Redis/Valkey product is selected for authorization.

### Authentication/session posture

Canonical:

~~~text
D-ARCH-004 = P0 OPEN
ADR-0007 = Proposed
D-SEC-004 = P1 OPEN
~~~

Preserve:

~~~text
Session Architecture
!=
Redis Requirement
~~~

ADR-0007 already states authentication/principal caching is not required and no Redis dependency follows.

Task 0033 does not select a session store or change revocation/session-lifetime policy.

### Rate-limit posture

NFR-SECURITY-010 establishes an abuse-control capability requirement.

It does not establish Redis storage.

Initial mechanisms may include provider-native limits, API gateway/hosting controls, bounded DB-backed counters for selected low-volume paths, or carefully limited process-local controls where security semantics allow them.

A shared Redis/Valkey limiter becomes a revisit trigger only if multiple stateless replicas, high-volume global limits and inadequate provider/platform/DB alternatives are actually demonstrated.

If a security-critical shared limiter is later adopted, fail-open/fail-closed/degraded behavior must be explicit per operation.

### Job / broker posture

ADR-0015 continues to own durable background execution.

Current proposal remains:

~~~text
PostgreSQL-backed durable jobs/scheduling
+
separate Background Worker Runtime
~~~

conditionally on independently governed database/runtime decisions.

Preserve:

~~~text
Background Work Exists
!=
Redis Required
~~~

Redis/BullMQ remains an alternative only if a later job evaluation proves a material throughput/operations advantage.

Task 0033 does not move jobs to Redis.

### Distributed-lock posture

Redis locks are not the permanent correctness guard for:

~~~text
payment exactly once
attendance uniqueness
membership effect uniqueness
provider-event dedupe
refund history
authorization truth
~~~

Prefer durable database/business mechanisms where applicable:

~~~text
unique constraints
transactions
conditional updates
row locks
advisory locks where narrowly justified
durable idempotency/effect records
~~~

PostgreSQL-specific mechanics remain conditional while D-ARCH-002 is Proposed.

Future distributed-lock evaluation must account for lease expiry, process pause, network partition, client crash, timing assumptions and stale/duplicate ownership.

### Idempotency / dedupe posture

Critical idempotency remains durable.

Ephemeral duplicate suppression may later optimize low-value/repeated work, but deleting all Redis keys must not enable duplicate financial, attendance, membership or provider-event business effects.

### Pub/Sub / realtime posture

No current Phase 1 requirement establishes distributed Pub/Sub or realtime fanout.

~~~text
ordinary dashboard refresh
!=
realtime infrastructure requirement
~~~

Current Redis Pub/Sub semantics are at-most-once.

Current Valkey Pub/Sub channels are non-persistent.

Therefore volatile Pub/Sub is not a durable business continuation mechanism.

### Failure / degraded-mode posture

Different future shared-state responsibilities would require separate failure policy.

Preferred optional-cache behavior:

~~~text
cache unavailable / evicted
-> read canonical data or safely recompute
-> product may be slower
-> canonical correctness remains
~~~

A future security/session/job dependency must document its own fail-open/fail-closed/recovery model.

### Security posture

If Redis/Valkey is later introduced, baseline controls include:

~~~text
private/trusted network where practical
TLS
authentication / least privilege
environment isolation
server-only credentials
no browser/mobile direct access
tenant-safe keys/values
PII minimization
~~~

Threat model includes public exposure, credential leakage, cross-tenant key collisions, poisoning, stale authorization, session theft, rate-limit bypass, lock expiry, volatile job loss and test/production crossover.

### Reliability posture

Deferring Redis avoids one additional stateful dependency and its network, eviction, invalidation, connection and failover failure modes.

Ideal optional cache remains removable:

~~~text
remove cache
-> system becomes slower
-> system remains correct
~~~

### Performance posture

No cache speedup is assumed.

Before introduction measure representative query/request latency, DB load, index selectivity, N+1 behavior, connection use, repeated expensive calculations, concurrency and read frequency.

Do not add Redis to hide poor query/index/read-model design.

### Operations / cost posture

No baseline Redis/Valkey means no additional managed cache account, memory/HA tier, connection operations, eviction/failover monitoring, region placement, credential rotation, local service, CI service or cache-specific incident runbook.

Free tiers do not justify new infrastructure.

### Revisit triggers

Reopen D-ARCH-008 only when evidence shows:

~~~text
measured hot-query pressure survives index/read-model optimization

approved distributed rate-limit requirement across multiple replicas

accepted session architecture requires shared ephemeral state

winning durable-job architecture requires Redis

approved realtime/pubsub requirement emerges

high-volume distributed coordination is demonstrated

measured database contention is genuinely solved by cache
~~~

A trigger reopens governance; it does not accept Redis or Valkey.

Task 0033 created no:

~~~text
Redis instance
Valkey instance
managed cache account
cache database / cluster
connection URL
credential / certificate
redis client
ioredis
@upstash/redis
bullmq
redlock
rate-limit-redis
cache adapter
rate limiter
session store
distributed lock
pub/sub
Redis Stream
queue migration
BullMQ worker
cache-key implementation
Docker Redis container
CI Redis service
IaC
deployment
~~~

No prior ADR is Accepted.


## Current Member / Membership State-Ownership Proposal

ADR-0026 now exists as Proposed; canonical D-DATA-007 remains P1 PROPOSED / unresolved.

Task 0034 resolves the state-ownership conflict at proposal level only.

### Current conflict

~~~text
Member.status
Active / Paused / Expired / Cancelled / Blocked

Membership.status
Pending / Active / Frozen / Expired / Cancelled
~~~

The overlap creates duplicate ownership for Active, pause/freeze, expiry and cancellation semantics.

### Proposed domain ownership

~~~text
Member
=
stable tenant-scoped member relationship / operational record
+
independent administrative/relationship state

Membership
=
time-bounded commercial entitlement
~~~

A Member may exist before, during and after any one Membership period.

Multiple historical Membership periods remain reconstructable.

### Proposed entitlement owner

~~~text
Membership
~~~

Membership owns:

~~~text
Pending
Active
Frozen
Expired
Cancelled

start/expiry period context
freeze/pause
attendance entitlement
standard no-show Membership eligibility
renewal-window context
verified renewal Membership effect
~~~

### Proposed Member-state meaning

Member state becomes a separate administrative/relationship axis.

Leading candidate:

~~~text
Enabled
Blocked
Archived
~~~

Enabled means the Member record/relationship may participate in ordinary workflows subject to independent authorization/business eligibility.

Enabled does not imply an Active Membership.

Blocked is an independent administrative/member restriction, not Membership expiry/freeze/cancellation and not automatically an AuthIdentity disable.

Archived means the Member relationship/record is inactive in normal operations while required history remains retained.

Archived is not deletion.

### Why Member Active is not recommended

~~~text
Member Active
vs
Membership Active
~~~

creates avoidable ambiguity.

Enabled is preferred because it does not imply paid/current entitlement.

### No mirrored lifecycle

Reject:

~~~text
Membership Expired
-> Member Expired

Membership Frozen
-> Member Paused

Membership Active
-> Member Active

Membership Cancelled
-> Member Cancelled
~~~

unless a separately approved Member relationship transition independently occurs.

### Authentication boundary

Preserve:

~~~text
AuthIdentity / Principal
!=
Member
!=
Membership
~~~

Therefore:

~~~text
Membership Expired
!=
AuthIdentity Deleted

Member Blocked
!=
AuthIdentity Disabled

Member Archived
!=
Auth Provider Account Deleted
~~~

D-ARCH-004 / D-SEC-004 remain separate.

### Attendance impact

Conceptual lifecycle/security gate:

~~~text
verified Member identity / Member-self
+
Member administrative eligibility
+
relevant Membership entitlement
+
branch/context rules
+
duplicate policy
=
attendance eligibility
~~~

Do not use Member Active as entitlement truth.

Representative combinations:

~~~text
Enabled + Active Membership
-> lifecycle gate may pass

Enabled + Frozen Membership
-> not entitled during approved freeze

Enabled + Expired Membership
-> not entitled; renewal/history may remain

Enabled + no current Membership
-> no current entitlement

Blocked + Active Membership
-> commercial entitlement remains;
   administrative restriction is independent
~~~

### Retention / no-show impact

FR-RETENTION-003 already excludes relevant Memberships that are frozen/paused, expired or cancelled.

Standard population conceptually uses:

~~~text
Member
+
eligible relevant Membership
+
last valid Attendance
+
separate Member administrative exclusion if later approved
~~~

Return Attendance does not imply a Member pause/active transition.

### Renewal impact

FR-RENEWAL-001 uses Memberships entering renewal windows.

Preserve:

~~~text
Renewal eligibility
-> Membership
~~~

Enabled + Expired Membership is a normal representable renewal/history/re-engagement scenario.

D-BIZ-010 early-renewal effective-date policy remains OPEN.

Extend-existing-vs-create-new Membership period remains separately unresolved where applicable.

### Payment impact

FR-PAYMENT-006:

~~~text
verified successful renewal payment
-> intended Membership effect exactly once
~~~

No mirrored Member Active/Expired effect is proposed.

D-BIZ-011 cancellation/refund remains OPEN.

### Blocked policy

Blocked is defined only as an independent administrative fact.

Exact consequences remain Open, including whether it affects:

~~~text
attendance
self-service
renewal initiation
selected staff operations
~~~

Do not invent those consequences.

### Import impact

One source status is never copied automatically into both Member and Membership.

Guidance:

~~~text
Expired
-> likely Membership evidence

Paused / Frozen
-> possible Membership freeze evidence

Blocked
-> possible Member administrative evidence

Cancelled
-> ambiguous; reconcile meaning

Inactive
-> ambiguous; reconcile meaning

missing / ambiguous
-> reconciliation
~~~

Do not fabricate semantics.

### Reporting / read-model impact

Future purposeful representations should distinguish:

~~~text
memberState
membershipState
membershipExpiry
freezeContext
~~~

Member search should not rely on ambiguous status=Active.

Member 360/read models may combine both axes but remain non-authoritative for writes.

Active Members requires explicit metric definition:

~~~text
Members with Active Membership
vs
Administratively Enabled Members
~~~

### Data-quality impact

Valid independent combinations may include:

~~~text
Enabled + Active Membership
Enabled + Frozen Membership
Enabled + Expired Membership
Enabled + no current Membership
Blocked + Active Membership
historical Cancelled Membership + later Active Membership
~~~

Potential review cases include Archived + current Active Membership, multiple applicable Active Memberships and state/date mismatches.

Exact constraints remain unfinalized.

### Proposed FR-MEMBER-004 follow-up if accepted

Current canonical FR-MEMBER-004 remains unchanged.

If ADR-0026 is explicitly accepted, proposed replacement should make Member status an independent administrative/relationship state and use:

~~~text
Enabled
Blocked
Archived
~~~

with explicit rules:

~~~text
Enabled != Active Membership
Blocked = independent administrative restriction
Archived != deletion
Member state must not duplicate Membership entitlement
~~~

The exact proposed replacement wording is recorded in ADR-0026 and Task 0034 continuity.

### Schema follow-up if accepted

Acceptance would unblock a later data-model/schema task for:

~~~text
Member 1 -> N Memberships
state representation
dates
tenant ownership
relevant/current Membership resolution
constraints
indexes
import migration
historical mapping
DTOs
state transitions
tests
~~~

Task 0034 creates none of this.

### Security findings

Preserve:

~~~text
Member Blocked != AuthIdentity Disabled
Membership Active != Authorization Allowed
Membership Expired != Authentication Revoked
~~~

Authorization remains Principal + scope + capability/self + business eligibility.

### Privacy findings

Preserve:

~~~text
Member Archived != Data Subject Deletion Complete
~~~

D-SEC-005 deletion/export remains OPEN.

D-SEC-006 retention remains OPEN.

### Business policies kept separate

~~~text
D-BIZ-005 freeze reasons                    OPEN
D-BIZ-006 freeze approval                   OPEN
D-BIZ-007 freeze expiry extension           OPEN
D-BIZ-010 early renewal period start        OPEN
D-BIZ-011 cancellation/refund               OPEN
~~~

### Validation before acceptance

Future review/implementation must prove at least the 26 examples recorded in ADR-0026, including:

- Enabled + Active/Frozen/Expired/no Membership;
- Blocked + Active Membership;
- historical cancelled then later active Membership;
- Membership expiry preserves Member identity/history;
- no-show/attendance/renewal use Membership;
- renewal effect changes Membership once;
- follow-up Cancelled remains separate;
- import mappings do not duplicate state;
- API/search/reporting distinguish both axes;
- AuthIdentity remains separate;
- historical records remain reconstructable.

Task 0034 created no tests.

Task 0034 created no:

~~~text
Member table
Membership table
enum/type
ORM model
database migration
CHECK constraint
index
trigger
RLS policy
API endpoint
DTO implementation
domain/state-machine code
import mapper
test implementation
UI status badge
production-data change
FR-MEMBER-004 canonical change
assumptions.md canonical status change
~~~

No prior ADR is Accepted.

## Last Completed Task

0034-resolve-member-membership-state-ownership-adr

~~~text
ADR-0026 Status: Proposed
D-DATA-007 canonical status: P1 PROPOSED / unresolved

Entitlement owner:
Membership

Member-state meaning:
administrative / relationship state

Leading Member-state candidate:
Enabled / Blocked / Archived

Membership states:
Pending / Active / Frozen / Expired / Cancelled

FR-MEMBER-004:
unchanged

schema/migrations/code:
not created

production behavior:
unchanged
~~~

## Current Task

None in progress.

## Foundation Acceptance-Readiness Review

The first foundation batch remains:

~~~text
ADR-0001  D-ARCH-005  Phase 1 architecture style
ADR-0002  D-ARCH-016  Primary language/runtime
ADR-0003  D-ARCH-001  Repository/workspace strategy
ADR-0004  D-ARCH-002  Canonical database engine
~~~

Current status:

~~~text
ADR-0001 Accepted
ADR-0002 Accepted
ADR-0003 Accepted
ADR-0004 Accepted

D-ARCH-005 DECIDED
D-ARCH-016 DECIDED
D-ARCH-001 DECIDED
D-ARCH-002 DECIDED

Authorized Decision Owner = santosh
Review Date = 2026-09-29
Approval Evidence = GitHub Issue #1
https://github.com/im-tnyx/gym-pulse/issues/1

Foundation architecture category gate = partially opened
Overall production implementation gate = closed
~~~

D-DATA-007 remains P1 PROPOSED / unresolved. FR-MEMBER-004 remains unchanged. Final Member/Membership production schema semantics remain unfinalized.

## Real PostgreSQL Foundation Validation Result

Overall:

~~~text
PASS
~~~

Fresh repository audit for this action started from:

~~~text
67bfaafbd45d8be7a26dabe82d0261bf84a7d0c3
~~~

The authorized execution path used a temporary branch-only GitHub Actions workflow and a disposable local Docker PostgreSQL instance. No workflow was accepted as production CI by this evidence action.

Execution references:

~~~text
validation branch:
validation/postgres-foundation-20260929

validation head:
e257e6ef5f3aa6eb26b159fb4374da06dbfd2d9d

workflow run:
36554395928

workflow job:
109359954215

artifact:
foundation-postgres-evidence / 11025937126

artifact sha256:
a4e4f54c3b94c6c16efd4cc259223b374712e758821862239a735978c8d01b2c
~~~

### Environment used

~~~text
GitHub Actions hosted Ubuntu 24.04.5
runner 2.337.0
Docker 28.0.4

PostgreSQL image:
postgres:17-bookworm

image digest:
postgres@sha256:639ab7ceb90e13123085b741fb31ef493fba25463002f6da665352e7b534b652

PostgreSQL server / psql / pg_dump / pg_restore:
17.11 (Debian 17.11-1.pgdg12+2)

Node validation runtime:
v22.23.2

temporary validation-only PostgreSQL client:
pg 8.16.3
~~~

These versions are validation evidence only.

### Stage 3 result

~~~text
real PostgreSQL correctness slice = PASS

migration from zero = PASS
forward migration = PASS

concurrent attendance uniqueness = PASS
12 attempts -> 1 effective row

provider-event dedupe = PASS
12 attempts -> 1 durable event claim

exactly-once business effect = PASS
12 attempts -> 1 effect claim
            -> 1 target mutation
later replay -> unchanged

single-active no-show invariant = PASS
12 attempts -> 1 active case
resolved historical + later active -> valid

transaction rollback = PASS
fresh connection verification
no partial mutation committed

tenant-scoped SQL isolation = PASS

representative relational/history query = PASS
bounded Tenant A query + EXPLAIN ANALYZE

database error translation = PASS
23505 -> already_applied
23503 -> invalid_reference
23514 -> invalid_value
~~~

### Stage 6 result

~~~text
backup creation = PASS
custom pg_dump

restore into separate database = PASS

restored invariant verification = PASS

application-style connection = PASS

concurrent connections = PASS
race sessions + six Node connections

disconnect/unavailable behavior = PASS

database restart = PASS
disposable container only

reconnect/recovery = PASS

post-restart replay safety = PASS

cleanup = PASS
~~~

Optional disproportionate ambiguous commit-window fault injection remains:

~~~text
NOT RUN
~~~

### Safety / boundary findings

~~~text
synthetic data only
no production member data
no production payment data
no production provider credentials
no production database
no external managed database
no production infrastructure
no production secret
~~~

Reusable validation harness now exists at:

~~~text
validation/foundation/postgres/
~~~

Preserve:

~~~text
Validation Harness
!=
Production Scaffold

Validation PostgreSQL
!=
Production PostgreSQL Provider

Temporary PostgreSQL Driver
!=
D-ARCH-017 Acceptance

Docker Validation Container
!=
Production Container Architecture

Explicit Tenant Query
!=
RLS Acceptance

Validation Schema
!=
Production Schema

Passing Technical Evidence
!=
ADR Acceptance
~~~

Local restart evidence does not prove managed HA, multi-AZ failover, regional DR, PITR, provider SLA, or production connection topology.

### ADR evidence impact

ADR-0001 now has direct real-PostgreSQL supporting evidence for one-effective-result concurrency, transactional effect uniqueness, rollback, and post-restart replay.

ADR-0002 now has direct real-PostgreSQL supporting evidence for a Node transaction-heavy path, simultaneous connections, real SQLSTATE observation, disconnect/reconnect, and restart recovery.

ADR-0003 is unchanged by this PostgreSQL action because no material new workspace/package-boundary evidence was produced.

ADR-0004 now has PASS evidence for its bounded PostgreSQL migration, correctness/concurrency, rollback, tenant-query, relational-query, backup/restore, connection, restart/reconnect, and replay gates.

All four ADRs remain Proposed.

### Remaining external/security gaps

~~~text
launch jurisdiction
production region
managed PostgreSQL provider
RPO / RTO
backup retention
production admin/support access
production connection topology
managed HA / failover / PITR evidence
~~~

### Foundation human governance result

~~~text
Decision Owner = santosh
Review Date = 2026-09-29
Explicit Approval = Recorded
Approval Evidence = GitHub Issue #1
~~~

## Foundation Decision-Owner Review Packet

The canonical review packet is synchronized at:

~~~text
docs/adr/foundation-decision-owner-review-packet.md
~~~

Synchronization result:

~~~text
Foundation Decision-Owner Review Packet = SYNCHRONIZED

ADR-0001 = Accepted
ADR-0002 = Accepted
ADR-0003 = Accepted
ADR-0004 = Accepted

D-ARCH-005 = DECIDED
D-ARCH-016 = DECIDED
D-ARCH-001 = DECIDED
D-ARCH-002 = DECIDED

Decision Owner = santosh
Review Date = 2026-09-29
Approval Evidence = GitHub Issue #1

Foundation architecture category gate = partially opened
Overall production implementation gate = closed
~~~

The packet preserves the original alternatives, evidence, limitations, scope boundaries, and the exact authorized rationale for each decision.

The validation harness is retained as reusable technical evidence and remains non-production.

## Second Dependency/Security Acceptance-Readiness Review

Review date: 2026-10-15. Baseline audited: 787955db8618578ab66ee49a78dc7390f75f4c08.

Canonical review: docs/adr/second-dependency-security-acceptance-readiness-review.md

~~~text
Second Dependency/Security Acceptance-Readiness Review = COMPLETED
ADR-0005 / D-ARCH-017 = Proposed / PROPOSED | BOUNDED VALIDATION REQUIRED
ADR-0006 / D-ARCH-014 = Proposed / OPEN | DECISION-OWNER REVIEWABLE (boundary only)
ADR-0007 / D-ARCH-004 = Proposed / OPEN | EVIDENCE-BLOCKED
ADR-0008 / D-SEC-002 = Proposed / OPEN | EVIDENCE-BLOCKED
ADR-0009 / D-ARCH-015 = Proposed / PROPOSED | DECISION-OWNER REVIEWABLE (boundary only)
ADR-0010 / D-SEC-008 = Proposed / OPEN | BOUNDED VALIDATION REQUIRED
Second-batch Decision Owners = OPEN
Second-batch Decisions = PENDING
Second-batch Approval References = MISSING
ADR status changes = none
Canonical decision changes = none
Production implementation = none
Overall production implementation gate = CLOSED
~~~

Foundation Accepted/DECIDED via GitHub Issue #1. D-SEC-001, D-SEC-004, D-DATA-007, provider/policy/hosting/deployment/tool decisions remain unresolved. The existing PostgreSQL foundation PASS does not prove RLS or candidate ORM/auth integration.

## Isolated Real PostgreSQL RLS Isolation Validation — Executed

User-specific authorization: 2026-10-15; GitHub Actions isolated synthetic PostgreSQL runner. Audited main baseline: 9a39f71a8dcc31c4cb311694df474396c8e5f660. Tested branch commit: 239e334af3fed69fee97c0b198916722c84b2b79; [workflow run](https://github.com/im-tnyx/gym-pulse/actions/runs/38772742264).

~~~text
Real PostgreSQL = 17.11 (disposable Docker)
RLS scenario suite = PASS (29/29)
A/B CRUD, missing/invalid context, non-bypass roles = PASS
FORCE RLS, broad SQL, admin policy separation = PASS
Transaction commit/rollback, same backend pool reuse, concurrent A/B = PASS
Synthetic worker/callback and independent application authorization = PASS
Invoker view, tenant-aware FK, migration/forward/drift, EXPLAIN = PASS
Explicit cleanup = PASS
Overall ADR-0010 acceptance/readiness evidence = PARTIAL
ADR-0010 / D-SEC-008 = Proposed / OPEN
Second-batch statuses = unchanged
Canonical decision changes = none
Production implementation gate = CLOSED
~~~

Canonical executed results, security findings, missing tests and observed versions: validation/security/rls/EVIDENCE.md. First failed startup-readiness run and recovery preserved. PostgreSQL GUC is not an authoritative tenant identity; managed pooler, privileged functions, real callback signatures, production performance and authorized human approval remain open.

## Exact Next Bounded Governance Action

**ADR-0010 Evidence Consolidation and Decision-Owner Review Preparation**, using actual RLS synthetic evidence and explicit untested/provider/security gaps. Not ADR acceptance. Do not decide D-SEC-008, open production implementation, fabricate Task 0035/ADR-0027, or alter other canonical decisions. Production implementation gate remains CLOSED.
