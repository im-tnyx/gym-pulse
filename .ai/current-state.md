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

## Task 0024 Implementation Status

Task `0024-draft-hosting-deployment-platform-adr` completed documentation/governance work only.

Created:

```text
docs/adr/ADR-0016-hosting-deployment-platform.md
.ai/task/0024-draft-hosting-deployment-platform-adr.md
```

Updated:

```text
docs/adr/README.md
docs/README.md
.ai/current-state.md
```

Explicitly not created/selected:

```text
No cloud project/account
No Render service/project
No Vercel project
No Fly.io app
No Google Cloud resource
No AWS/Azure resource
No Kubernetes cluster
No Dockerfile
No Terraform/Pulumi/CloudFormation
No deployment manifest
No production/staging environment
No DNS/TLS configuration
No database
No Redis
No queue
No worker deployment
No migration
No CI/CD workflow
No production secret
No monitoring integration
No hosting provider accepted
No production region accepted
No PostgreSQL/Node/Next.js/pg-boss/Supabase accepted
No D-ARCH-009 promotion to DECIDED
No previous ADR promotion to Accepted
```

## Last Completed Task

`0024-draft-hosting-deployment-platform-adr`

```text
ADR-0016 Status: Proposed
D-ARCH-009 canonical status: OPEN
D-SEC-001 canonical status: OPEN
D-ARCH-006 canonical status: OPEN
D-ARCH-007 canonical status: OPEN
D-ARCH-014 canonical status: OPEN
D-ARCH-019 canonical status: OPEN
D-ARCH-002 canonical status: PROPOSED
D-ARCH-012 canonical status: PROPOSED
D-ARCH-016 canonical status: PROPOSED
```

The hosting/provider direction is not accepted or implemented merely because ADR-0016 exists.

## Current Task

None in progress.

## Next Task

Post-Task-0024 synchronization of the ADR dependency queue identifies the next bounded item as:

```text
Task 0025: Draft CI/CD + Production Release / Secrets ADR
```

Primary canonical decision:

```text
D-ARCH-019
```

Likely target when explicitly started:

```text
docs/adr/ADR-0017-ci-cd-release-secrets.md
```

Initial ADR status should be `Proposed`. Canonical `D-ARCH-019` remains `OPEN` unless explicit review/approval changes it.

The next task should define production build/test gates, controlled promotion, artifact/version provenance, environment/secrets ownership, migration sequencing, release smoke tests, rollback/forward-fix, branch/review protections, and selected-host integration while preserving provider portability.

It must not create CI/CD workflows, production secrets, deployment environments, or accept prior ADRs.

Do not execute Task 0025 until explicitly requested.

## Files To Read Next

```text
.ai/README.md
.ai/current-state.md
.ai/task/0024-draft-hosting-deployment-platform-adr.md
docs/README.md
docs/00-overview/assumptions.md
docs/01-product/functional-requirements.md
docs/01-product/non-functional-requirements.md
docs/02-architecture/architecture-principles.md
docs/02-architecture/architecture-overview.md
docs/02-architecture/container-architecture.md
docs/02-architecture/component-architecture.md
docs/02-architecture/technology-stack.md
docs/adr/README.md
docs/adr/ADR-0002-primary-language-runtime.md
docs/adr/ADR-0003-monorepo-strategy.md
docs/adr/ADR-0004-database-engine.md
docs/adr/ADR-0005-data-access-migration-strategy.md
docs/adr/ADR-0006-managed-backend-responsibilities.md
docs/adr/ADR-0010-data-layer-tenant-isolation-rls.md
docs/adr/ADR-0012-owner-staff-web-framework.md
docs/adr/ADR-0014-api-deployment-boundary.md
docs/adr/ADR-0015-background-jobs-scheduler.md
docs/adr/ADR-0016-hosting-deployment-platform.md
legacy migration source: docs/12-security-audit.md
legacy migration source: docs/15-engineering-workflow.md
legacy migration source: docs/16-open-decisions.md
```
