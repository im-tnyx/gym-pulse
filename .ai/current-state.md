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
ADR-0001  D-ARCH-005  Phase 1 architecture style                 Proposed
ADR-0002  D-ARCH-016  Primary language/runtime                   Proposed
ADR-0003  D-ARCH-001  Repository/workspace strategy              Proposed
ADR-0004  D-ARCH-002  Canonical database engine                  Proposed
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
```

No authorized approval evidence exists for these ADRs. None is `Accepted`.

Canonical decision status remains controlled by `docs/00-overview/assumptions.md`, not ADR draft status.

## Key Canonical Decision State

```text
D-ARCH-001  repository strategy                  P0 PROPOSED
D-ARCH-002  database engine                      P0 PROPOSED
D-ARCH-003  API contract architecture            P0 PROPOSED
D-ARCH-004  authentication/session               P0 OPEN
D-ARCH-005  architecture style                   P1 PROPOSED
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
D-ARCH-016  primary language/runtime             P0 PROPOSED
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

PostgreSQL itself remains only `PROPOSED` under `D-ARCH-002`.

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

## Last Completed Task

`0029-draft-object-storage-adr`

```text
ADR-0021 Status: Proposed
D-ARCH-010 canonical status: P1 OPEN
Persistent object storage: deferred
Receipt PDF persistence: not required by current canonical evidence
Export artifact persistence: not required by current canonical evidence
Controlled import: no indefinite raw-file retention requirement
Provider selected: none
No object-storage implementation
```

## Current Task

None in progress.

## Next Task

Post-Task-0029 synchronization confirms the next bounded governance task as:

```text
Task 0030: Draft Payment Provider ADR
Primary decision: D-PROVIDER-001
Canonical status: P1 OPEN
Target ADR filename/number: confirm from fresh latest-main audit before execution
```

The next task should verify current pilot payment-method requirements and evaluate bounded serious payment-provider candidates for:

```text
India/launch-market applicability
checkout/payment initiation
server-side verification
webhook authenticity
idempotency/replay handling
refund/reversal semantics
reconciliation
settlement
payment-method coverage
fees/cost
sandbox/testing
operational support
security/privacy
provider abstraction
migration/exit
```

Do not open a payment-provider account, create credentials, install an SDK, implement checkout/webhooks, or silently accept a provider during the ADR-only task.

## Files To Read Next

```text
.ai/README.md
.ai/current-state.md
.ai/task/0029-draft-object-storage-adr.md
docs/README.md
docs/00-overview/assumptions.md
docs/01-product/functional-requirements.md
docs/01-product/non-functional-requirements.md
docs/01-product/user-roles.md
docs/01-product/user-journeys.md
docs/02-architecture/architecture-principles.md
docs/02-architecture/architecture-overview.md
docs/02-architecture/container-architecture.md
docs/02-architecture/component-architecture.md
docs/02-architecture/data-flow.md
docs/02-architecture/technology-stack.md
docs/adr/README.md
docs/adr/ADR-0006-managed-backend-responsibilities.md
docs/adr/ADR-0011-api-contract-architecture.md
docs/adr/ADR-0015-background-jobs-scheduler.md
docs/adr/ADR-0017-ci-cd-release-secrets.md
docs/adr/ADR-0018-testing-toolchain.md
docs/adr/ADR-0020-observability-provider.md
docs/adr/ADR-0021-object-storage.md
legacy migration source: docs/09-payments-billing.md
legacy migration source: docs/12-security-audit.md
legacy migration source: docs/16-open-decisions.md
```
