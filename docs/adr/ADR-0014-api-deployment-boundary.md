# ADR-0014: API Deployment Boundary

## Status

`Proposed`

## Decision Metadata

- ADR: `ADR-0014`
- Primary Decision ID: `D-ARCH-006`
- Related Decision IDs: `D-ARCH-005`, `D-ARCH-016`, `D-ARCH-001`, `D-ARCH-003`, `D-ARCH-004`, `D-ARCH-012`, `D-ARCH-013`, `D-ARCH-014`, `D-ARCH-015`, `D-ARCH-017`, `D-SEC-004`, `D-SEC-008`, `D-ARCH-007`, `D-ARCH-008`, `D-ARCH-009`, `D-ARCH-019`, `D-PROVIDER-006`
- Decision Owner: `Open`
- Technical Owner: `Architecture / Backend / Platform / Security`
- Date Proposed: `2026-09-26`
- Date Accepted: `Not accepted`
- Supersedes: `None`
- Superseded By: `None`

## 1. Context

GymPulse already has a logical trusted application/API boundary. What remains unresolved is how that boundary should map to Phase 1 deployment units.

The decision question is:

> For Phase 1, should GymPulse's trusted HTTP/API request boundary be deployed together with the Owner/Staff web server runtime, as an independently deployed API service, or through another bounded topology?

This ADR is intentionally about **deployment units and runtime boundaries**, not API semantics or domain decomposition.

The following separations remain mandatory:

```text
API Contract != API Deployment

Repository Topology != Deployment Topology

Web Framework != Domain/Application Architecture

Route Handler != Application Use Case

Server Action != Business Rule

HTTP Process != Canonical Business State

Background Worker != HTTP Request Runtime
```

One monorepo may contain several independently deployable artifacts. Conversely, one deployment unit may host several logical adapters. Neither fact changes domain ownership.

ADR-0011 already proposes the primary external client/server contract:

```text
versioned JSON over HTTPS
+
resource/query reads
+
explicit business-command actions
+
runtime-validated trust-boundary schemas
+
purpose-specific DTOs
+
stable machine-readable errors
+
cursor-oriented bounded pagination
+
critical-mutation idempotency
+
verified provider webhook boundary
```

ADR-0014 decides where that contract can execute. It does not redesign it.

Current proposed clients are:

```text
Owner/Staff:
  Next.js App Router + React
  under ADR-0012, Proposed

Member:
  responsive HTTPS web first
  + future evidence-triggered native client
  under ADR-0013, Proposed
```

Both remain unaccepted.

The deployment topology must support:

- Owner/Staff web,
- Member web,
- future native Member client,
- provider webhooks,
- background/system execution,
- tests/admin tooling where appropriate,

without binding canonical application behavior to one UI framework.

The canonical decision register currently keeps `D-ARCH-006` at `P1 OPEN`. This ADR creates a concrete proposal for review and does not promote the decision to `DECIDED`.

## 2. Requirements and Decision Drivers

### 2.1 Functional requirements

Identity and authorization:

- `FR-IDENTITY-001`: protected staff functionality requires authenticated identity.
- `FR-IDENTITY-002`: current sessions must support termination and provider-appropriate revocation/expiry semantics.
- `FR-IDENTITY-003`: protected Member self-service requires verified identity.
- `FR-AUTHZ-001`: every protected operation requires applicable tenant/gym/branch authorization.
- `FR-AUTHZ-002`: protected mutations require named capabilities rather than UI-only controls.
- `FR-AUTHZ-003`: Member-facing APIs must prevent access to another Member's protected records.
- `FR-AUTHZ-004`: sensitive staff actions must preserve actor attribution.

Attendance:

- `FR-ATTENDANCE-001..006`: server-verifiable QR/session input, validation, exactly one canonical attendance effect, duplicate protection, and retry safety.
- `FR-ATTENDANCE-007..011`: assisted/corrected attendance requires authorized, auditable handling.

Payments/provider callbacks:

- `FR-PAYMENT-002`: canonical payment success is based on verified provider evidence.
- `FR-PAYMENT-003`: provider callbacks must be authenticated/verified.
- `FR-PAYMENT-004`: provider references/events needed for reconciliation/idempotency are retained.
- `FR-PAYMENT-005`: duplicate callbacks cannot duplicate business effects.
- `FR-PAYMENT-006..007`: verified payment effects apply exactly once.
- `FR-PAYMENT-008..009`: raw payment credentials are not stored and financial history remains reconstructable.

Cross-domain:

- `FR-CROSS-001`: clients do not determine final authorization, attendance eligibility, payment success, or membership entitlement.
- `FR-CROSS-002`: critical mutations/automation effects are replay-safe.
- `FR-CROSS-003`: tenant/gym/branch context is explicit in requests, relationships, and background jobs where applicable.
- `FR-CROSS-004`: gym-local business-day logic does not depend on process/server timezone.

### 2.2 Non-functional requirements

Security:

- `NFR-SECURITY-001`: tenant isolation across users, jobs, APIs, analytics, storage, and exports.
- `NFR-SECURITY-002`: least-privilege authorization.
- `NFR-SECURITY-003`: server-side authorization on every protected operation.
- `NFR-SECURITY-004`: server/provider/database/webhook secrets never enter source control or client bundles.
- `NFR-SECURITY-005`: authenticated/personal/financial/operational traffic uses secure transport.
- `NFR-SECURITY-008`: security-sensitive webhooks are verified before canonical mutation.
- `NFR-SECURITY-009..011`: auditable sensitive actions, abuse controls, and minimized sensitive errors/logging.

Reliability:

- `NFR-RELIABILITY-001`: retry-safe critical mutations.
- `NFR-RELIABILITY-002`: payment effects exactly once.
- `NFR-RELIABILITY-003`: scheduled jobs retry safely.
- `NFR-RELIABILITY-004`: database-enforced invariants where practical.
- `NFR-RELIABILITY-005`: canonical truth comes from server-side system-of-record state.
- `NFR-RELIABILITY-007..008`: retry diagnosis and reconciliation after network/provider interruption.

Availability/resilience:

- `NFR-AVAILABILITY-001`: non-critical integration failure must not corrupt canonical membership/attendance/payment.
- `NFR-AVAILABILITY-002`: messaging degradation remains visible/retryable.
- `NFR-AVAILABILITY-003`: failed background jobs are visible and recoverable.
- `NFR-AVAILABILITY-005`: numerical recovery objectives remain Open.

Performance:

- `NFR-PERFORMANCE-001`: check-in should feel immediate under normal network conditions; no hard SLO is accepted.
- `NFR-PERFORMANCE-002..004`: operational reads require bounded/index-aware server-side behavior.
- `NFR-PERFORMANCE-005`: slow external providers should not hold correctness-sensitive DB transactions open.
- `NFR-PERFORMANCE-006`: Member APIs return bounded purpose-specific DTOs.

Scalability:

- `NFR-SCALABILITY-002`: Phase 1 should keep simple deployment/domain boundaries before distributed services.
- `NFR-SCALABILITY-003`: request-serving components should evolve horizontally without process-local business truth.
- `NFR-SCALABILITY-004`: retryable background work should be separable from interactive request processing.
- `NFR-SCALABILITY-005`: no microservices solely for hypothetical scale.

Observability/operations:

- `NFR-OBSERVABILITY-001..007`: structured logs, safe tenant context, centralized API/webhook/job failures, payment/job diagnostics, health signals, and correlation IDs.
- `NFR-OPERATIONS-001..002`: distinct environments and production-secret separation.
- `NFR-OPERATIONS-003`: migration safety.
- `NFR-OPERATIONS-004`: release smoke tests include authentication, Member lookup, check-in, payment webhook path, and critical dashboard behavior.
- `NFR-OPERATIONS-005`: routine Phase 1 operations cannot require developer intervention.

Maintainability/testability:

- `NFR-MAINTAINABILITY-001`: core rules are not duplicated across Member app, Owner web, and workers.
- `NFR-MAINTAINABILITY-002`: typed/runtime-validated boundaries where TypeScript is eventually accepted.
- `NFR-MAINTAINABILITY-003`: provider abstraction.
- `NFR-MAINTAINABILITY-005..006`: documentation synchronization and ADR governance.
- `NFR-TESTABILITY-001..005`: deterministic domain tests, provider simulation, failure injection, authorization matrices, and controlled time.

### 2.3 Decision drivers

The main tradeoff is between:

```text
Phase 1 operational simplicity
vs
runtime isolation / independent scaling / independent releases
```

Additional drivers:

- preserve ADR-0011 as an independently consumable transport contract,
- avoid unnecessary distributed-runtime complexity,
- preserve future native consumption,
- support raw-body/signature-verifiable provider callbacks,
- preserve explicit authorization and tenant isolation,
- keep durable background execution separate,
- support stateless/horizontally scalable request handling,
- prevent process-local canonical state,
- keep release/rollback/version-skew manageable,
- preserve future API extraction without reimplementing application/domain behavior.

## 3. Constraints and Assumptions

1. `D-ARCH-006` remains `P1 OPEN`; this ADR is `Proposed`.
2. `D-ARCH-005` is `DECIDED`; Phase 1 modular monolith is the accepted architecture style.
3. `D-ARCH-016` is `DECIDED`; strict TypeScript + supported Node.js LTS is the accepted runtime category, while exact version remains separate.
4. `D-ARCH-001` is `DECIDED`; monorepo source topology is accepted and still does not force deployment topology.
5. `D-ARCH-003` remains `PROPOSED`; ADR-0011 contract semantics remain independent from deployment.
6. `D-ARCH-004` remains `OPEN`; exact authentication/session architecture/provider is unresolved.
7. `D-SEC-004` remains `OPEN`; cookie/session lifetimes and device policy are not decided here.
8. `D-ARCH-012` remains `PROPOSED`; Next.js/React is not accepted through co-hosting.
9. `D-ARCH-013` remains `PROPOSED`; Member browser-first/native evolution does not force a specific API deployment.
10. `D-ARCH-014` remains `OPEN`; managed backend/platform responsibilities do not select deployment.
11. `D-ARCH-015` remains `PROPOSED`; authorization is server-owned regardless of runtime topology.
12. `D-ARCH-017` remains `PROPOSED`; no persistence library is accepted.
13. `D-SEC-008` remains `OPEN`; RLS remains a separate conditional defense-in-depth decision.
14. `D-ARCH-007` remains `OPEN`; no job runner/scheduler is selected.
15. `D-ARCH-008` remains `OPEN`; Redis/cache is not required by this ADR.
16. `D-ARCH-009` remains `OPEN`; no hosting provider is selected.
17. `D-ARCH-019` remains `OPEN`; release/CI implementation is separate.
18. `D-PROVIDER-006` remains `OPEN`; no observability vendor is selected.
19. Background workers are conceptually separate from the interactive HTTP request runtime.
20. Migrations are a distinct controlled administrative/release responsibility and should not execute automatically on every application instance startup.
21. No browser bundle may contain server-side provider/database/auth/webhook secrets.
22. No canonical session revocation, authorization decision, idempotency record, payment state, membership state, attendance state, or job state may exist only in one process's memory.
23. Deployment topology does not imply microservice decomposition.
24. Public DNS/origin topology remains distinct from physical deployment topology.

## 4. Existing Logical and Trust Boundaries

The logical trust path remains:

```text
Untrusted Client / Provider Request
  -> Transport / Callback Entry Adapter
  -> Runtime Contract / Raw-Callback Verification
  -> Authentication Verification when human request
  -> GymPulse Principal Resolution
  -> Trusted Tenant / Resource Resolution
  -> Capability / Member-Self Authorization
  -> Application Command / Query
  -> Domain Rules
  -> Transaction / Persistence / Provider Ports
  -> Canonical Result
```

For provider callbacks:

```text
Provider Callback
  -> preserve required raw verification material
  -> provider-specific authenticity verification
  -> normalized provider event
  -> canonical internal resource + tenant resolution
  -> bounded application use case
  -> dedupe / idempotent canonical effect
```

For background work:

```text
Durable Work / Scheduled Trigger
  -> bounded System / Job Context
  -> explicit tenant/resource scope
  -> shared application handler
  -> same domain / transaction rules
```

A background job is not an authenticated human request, and a verified webhook is not a human session.

The container architecture already permits the trusted Application/API responsibility to be either co-hosted with a web runtime or independently deployed. This ADR maps that logical flexibility to a recommended Phase 1 topology.

## 5. Deployment Options Considered

### Option A — Co-Hosted Web + Trusted API Runtime

Conceptually:

```text
Owner/Staff Web Deployment
  ├── presentation / SSR / Server Components if framework accepted
  ├── thin framework adapters
  ├── /v1 HTTP API adapters
  └── trusted application runtime
```

Member web and future native clients consume the ADR-0011 `/v1` boundary exposed by the deployment.

Application/domain modules remain independent of Next.js or any other web framework.

Benefits:

- minimal number of Phase 1 request-serving deployables,
- same-origin staff interaction can be simple where desired,
- fewer runtime/network failure boundaries,
- less release/version skew between staff web adapters and application code,
- simple local development and tracing,
- natural fit with one modular application.

Costs:

- web rendering and API share a deployment/failure/resource domain,
- framework boundaries require discipline to prevent application logic leaking into route/actions,
- web deploy regressions may impact API availability,
- different web/API scaling needs may later create contention,
- future extraction must be designed rather than assumed.

### Option B — Independent Trusted API Deployment

Conceptually:

```text
Owner/Staff Web
      |
      v
Trusted API Service
      ^
      |
Member Web / Future Native
```

Provider callbacks enter the API service where appropriate.

Benefits:

- clear runtime/process boundary,
- independent web/API scale and release cadence,
- stronger failure-domain separation between rendering and API,
- naturally obvious framework independence,
- direct future-native fit,
- easier to assign different hosting/runtime constraints later.

Costs:

- additional network hop for server-side web calls,
- more deployment/health/secret/observability surface,
- cross-origin or reverse-proxy complexity depending public origin design,
- CORS/cookie/session complexity if origins differ,
- additional local-development topology,
- version skew between web and API becomes an operational concern,
- more release/rollback coordination,
- no current Phase 1 load or team-ownership evidence requires this separation.

### Option C — Co-Hosted-First With Explicit Extraction Seam

Conceptually:

```text
Phase 1 deployment:
  Owner/Staff server deployment
    + trusted /v1 HTTP API adapters
    + shared application runtime

Logical architecture:
  framework-independent application/domain/security modules
  ADR-0011 contract remains externally stable
  Member web / future native call /v1
  background workers remain separate
  no process-local canonical truth

Later, when evidence exists:
  extract HTTP/API transport + trusted runtime
  into an independently deployed API
  without rewriting application/domain behavior
```

This is not merely a migration note. It intentionally combines:

- Phase 1 operational simplicity,
- explicit transport/application boundaries,
- a stable independently consumable HTTP contract,
- future deployment separation by moving adapters/runtime rather than rewriting business logic.

Costs/risks:

- still shares Phase 1 web/API failure/resource domain,
- extraction quality depends on keeping framework objects out of application/domain layers,
- direct in-process staff calls must not create a hidden second semantics path,
- shared framework caches must not become canonical or tenant-unsafe.

### Option D — Client-Specific BFF / Split API Topology

Conceptually:

```text
Owner Web BFF
Member BFF / API
        /
    shared application/core
```

Possible benefits:

- client-specific payload/credential adaptation,
- independent client optimization,
- explicit differences in browser/native session transport.

Costs:

- duplicated transport/business orchestration risk,
- contract divergence,
- duplicated authorization/tenant-scope checks,
- more deployments/secrets/observability,
- future native may add another boundary,
- no current product need justifies this extra topology.

Client-specific presentation adaptation can remain inside thin transport/presentation adapters without separate BFF deployables at Phase 1.

### Option E — Function-per-Route / Provider-Function-Heavy API

Conceptually, external routes are deployed primarily as separate serverless/edge/function units.

Possible benefits:

- fine-grained deployment/scale,
- provider-native ingress integration,
- scale-to-zero on some platforms,
- independently constrained endpoints.

Costs/risks:

- route-level deployment can fragment application boundaries,
- runtime duration/cold-start/body-handling limits vary,
- DB pooling/transaction context must be designed carefully,
- provider-specific function semantics increase coupling,
- per-function observability/release/version consistency can become harder,
- fire-and-forget continuation is unsafe,
- domain names can accidentally become network service boundaries.

Serverless compute remains compatible with several deployment-unit options; it is not itself a microservice architecture. This ADR does not select it.

## 6. Evaluation

| Criterion | Co-hosted | Independent API | Co-hosted-first / extractable | BFF / split | Function-heavy |
|---|---|---|---|---|---|
| Phase 1 simplicity | Strong | Moderate | **Strong** | Weak-Moderate | Moderate |
| Owner/Staff web fit | Strong | Strong | **Strong** | Strong | Moderate |
| Member web fit | Strong | Strong | **Strong** | Strong | Strong |
| Future native fit | Strong via ADR-0011 | Strong | **Strong via ADR-0011** | Moderate-Strong | Strong if contract stays stable |
| ADR-0011 compatibility | Strong | Strong | **Strong** | Risk of divergence | Strong if consistently enforced |
| Auth/session ergonomics | Strong same-site/same-origin option | More topology-sensitive | **Strong initially; preserves future change** | More moving parts | Provider/runtime dependent |
| Same-origin capability | Natural | Possible via proxy/gateway | **Natural initially** | Possible | Possible |
| CORS complexity | Lowest if same-origin | Higher when cross-origin | **Low initially; explicit if extracted** | Higher | Per-route/platform dependent |
| CSRF implications | Still required for cookie mutations | Still required for cookie mutations | **Same; not confused with CORS** | More surfaces | More surfaces |
| Authorization consistency | Strong if shared handler | Strong if centralized | **Strong with shared handler** | Duplication risk | Fragmentation risk |
| Tenant isolation | Strong if common persistence controls | Strong | **Strong** | Duplication risk | Context propagation risk |
| Webhook support | Strong if raw input preserved | Strong dedicated ingress | **Strong with bounded callback adapters** | Unclear benefit | Runtime/provider limits must be proven |
| Raw-body verification | Framework-specific adapter concern | API adapter concern | **Explicit callback seam** | Multiple concerns | Function/runtime specific |
| Payment callbacks | Strong | Strong | **Strong** | Unnecessary split | Possible but more provider/runtime variance |
| DB transactions | Strong normal server model | Strong | **Strong** | Shared core required | Runtime/pool limits vary |
| Connection management | Simpler | Additional service pool | **Simple initially; extraction-ready** | Multiple pools | High sensitivity to platform model |
| Background-job separation | Must be explicit | Explicit | **Explicit requirement** | Explicit | Easy to confuse with functions |
| Horizontal scaling | Possible | Strong | **Possible + extraction trigger** | Possible | Platform dependent |
| Failure isolation | Moderate | Strong | **Moderate initially** | Stronger but complex | Per-function but dependency failures remain |
| Release coupling | Higher | Lower | **Higher initially by design** | Lower but complex | Fine-grained/high coordination |
| Version skew | Low for staff/web adapters | Higher | **Low initially; ADR-0011 preserves extraction** | Higher | Higher |
| Rollback | One request-serving artifact | Separate web/API rollback | **Simple initially; compatibility rules retained** | Multi-artifact | Many units/functions |
| Observability | Simplest correlation | Multi-service tracing required | **Simple initially; service identity seam retained** | More complex | More fragmented |
| Operational burden | Lowest | Higher | **Low** | High | Moderate-High |
| Secret boundary | Server-only build/runtime discipline critical | Clear service boundary | **Server-only discipline + future split** | More secret stores | Per-function secret scope |
| Hosting portability | Good if framework portable | Good | **Good** | Moderate | Often provider-coupled |
| Framework independence | Requires discipline | Naturally visible | **Explicit extraction requirement** | Good if core shared | Risk of handler-centric architecture |
| Provider independence | Strong | Strong | **Strong** | Moderate | Lower if provider-function-heavy |
| Future extraction | Moderate if not planned | Already extracted | **Strongest intentional path** | Already fragmented | Requires consolidation discipline |
| Performance/latency | No internal web->API hop required | Extra hop for server web path | **Same-process option initially** | Additional hops | Cold starts/serialization vary |
| Cost complexity | Lowest | Higher | **Lowest while preserving exit** | Higher | Platform-specific |
| Reversibility | Moderate-High | High | **High** | Medium | Medium |
| Overall GymPulse fit | Strong | Credible but premature | **Strongest current fit** | Weak current evidence | Weak-Moderate current evidence |

The matrix favors Option C because it deliberately obtains the principal Phase 1 benefits of Option A while making later extraction an architecture property rather than an emergency refactor.

Option B remains the strongest alternative if real security, scaling, release-cadence, runtime, or ownership evidence requires separation earlier than expected.

## 7. Proposed Decision

**Propose Option C: co-host the trusted HTTP/API transport with the Owner/Staff server runtime for Phase 1, while enforcing an explicit extraction seam so the API can later become an independently deployed runtime without rewriting application/domain behavior.**

The accepted TypeScript/Node.js foundation category satisfies the runtime dependency; the proposal still depends on separately governed web-framework/deployment/hosting choices. It does not accept Next.js, hosting, or any provider.

Conceptually:

```text
Phase 1 request-serving deployment

[Web / Server Deployment]
  ├── Owner/Staff presentation adapters
  ├── /v1 ADR-0011 HTTP adapters
  ├── provider callback adapters
  └── Trusted Application Runtime
        ├── auth verification / Principal resolution
        ├── tenant/resource resolution
        ├── authorization
        ├── application commands/queries
        ├── domain rules
        ├── transaction / persistence adapters
        └── provider ports/adapters

[Background Execution Runtime]
  separate deployment responsibility
  exact technology OPEN under D-ARCH-007

[Canonical Persistence]
  separate system-of-record responsibility
```

Core rules:

1. ADR-0011 `/v1` remains a real independently consumable contract for Member web, future native, integration tests, provider-independent first-party transport, and future extraction.
2. A framework Route Handler or equivalent is only a transport adapter.
3. Server Actions/Server Functions, if later used, are presentation-facing adapters and do not own business rules.
4. Application/domain/security modules do not depend on Next.js request/response types, React types, web framework routing, or deployment-provider objects.
5. Owner/Staff server-rendering code may call shared application handlers directly in-process when appropriate rather than performing unnecessary loopback HTTP, but the same Principal, authorization, use-case, domain, audit, idempotency, and transaction semantics apply.
6. Direct in-process calls do not create a second business implementation.
7. External Member/native requests always enter through ADR-0011-compatible trusted transport.
8. Provider callbacks use dedicated verification adapters and are not human sessions.
9. Durable background work is not implemented as process-memory timers/fire-and-forget request work.
10. Canonical state and security-critical revocation/idempotency/authorization truth are not process-local.
11. Migrations use separate controlled administrative/release privilege; the web/API runtime is not schema owner.
12. Public origin design remains separate from physical deployment design.
13. No API gateway is required merely because extraction is possible.
14. No Redis/cache is required merely to scale request handlers.
15. Extraction occurs only when evidence triggers a revisit.

## 8. Web / API Runtime Relationship

### 8.1 Framework adapters remain thin

If the proposed Owner/Staff Next.js direction is later accepted, a conceptual external HTTP path is:

```text
Route Handler
  -> preserve raw input where required
  -> runtime validation
  -> authentication verification
  -> Principal resolution
  -> trusted tenant/resource resolution
  -> authorization
  -> application command/query
  -> domain/persistence/provider ports
  -> safe response mapping
```

Canonical business logic does not belong in:

- `route.ts`,
- Server Action / Server Function,
- React component,
- middleware/proxy,
- layout.

Current Next.js documentation confirms Route Handlers are standard request handlers using Web Request/Response APIs and Server Functions invoked from client UI are network-reachable POST operations. That reinforces treating them as untrusted transport entry points rather than private trusted methods.

### 8.2 Framework-local trusted server calls

When Owner/Staff server-rendering code is in the same trusted process, it may call application handlers directly rather than loop back through HTTP.

The invariant is:

```text
Direct in-process call
!=
different business semantics
```

The same trusted request context must still establish:

- verified Principal,
- current account eligibility,
- tenant/resource scope,
- named capability,
- application use case,
- domain rules,
- audit context,
- idempotency where applicable,
- transaction boundary.

HTTP DTO validation applies at HTTP trust boundaries. In-process calls still validate any data crossing their own trust/contract boundary and cannot bypass domain/application validation.

### 8.3 ADR-0011 remains mandatory

Co-hosting does not demote ADR-0011 to documentation only.

It remains required for:

- Member web,
- future native client,
- stable first-party HTTP transport,
- provider-independent client integration,
- contract tests,
- future API extraction,
- versioned compatibility across independently updated clients.

## 9. Member Client and Future Native Relationship

ADR-0013 proposes browser-first Member delivery while keeping future native possible.

The Member client consumes a stable trusted API boundary regardless of whether the first physical runtime is co-hosted with Owner/Staff web.

Possible public-origin mappings remain implementation/hosting decisions:

```text
same deployment + same origin

same deployment + separately routed API path/hostname

separate Member web deployment + shared API

reverse-proxied same-site web/API

cross-origin API with explicit CORS policy
```

No hostname or domain is selected.

Hard portability criterion:

```text
Future Native Client
  -> ADR-0011 API
```

A future native client must not require Next.js-specific Server Action protocols or framework-local serialization.

## 10. Authentication, Cookies, CORS, and CSRF Impact

### 10.1 Authentication remains separately governed

`D-ARCH-004` remains OPEN. The current proposal is compatible with a first-party, server-mediated, secure-cookie-compatible browser session model, but this ADR does not select provider/session implementation.

Topology affects mechanics such as:

- same-origin cookie simplicity,
- same-site cross-subdomain cookies,
- cross-origin credentialed requests,
- cookie `Domain`/`Path`,
- `Secure`/`SameSite`,
- logout/revocation,
- fixation/rotation.

Exact cookie names/domains/TTLs remain unselected.

### 10.2 Same-origin is useful but not an architectural requirement

Co-hosting can naturally support same-origin Owner/Staff web + API, reducing browser CORS surface and avoiding an unnecessary server-side loopback hop.

However:

```text
Physical Deployment Topology
!=
Public DNS / Origin Topology
```

An independent API can later be reverse-proxied under a same-site/same-origin public path, and a co-hosted runtime can later expose a dedicated API hostname. DNS does not define application architecture.

### 10.3 CORS

If a browser client calls a cross-origin API, allowed origins must be:

```text
explicit
environment-aware
least privilege
```

For credentialed private APIs, wildcard origin is not acceptable. Current MDN guidance confirms credentialed CORS responses require an explicit origin rather than `Access-Control-Allow-Origin: *`.

CORS configuration is not implemented by this ADR.

### 10.4 CSRF

CORS and CSRF are separate controls.

Cookie-authenticated mutations still require the accepted authentication architecture's CSRF posture even when CORS is correctly configured.

`SameSite` is defense in depth, not a complete CSRF solution.

This ADR does not implement CSRF tokens/origin validation/framework protections.

## 11. Webhook and Provider Callback Boundary

Payment and other provider callbacks require stable externally reachable trusted endpoints.

The deployment must preserve:

```text
bounded body size
+ required raw/signature verification material
+ provider-specific authenticity verification
+ normalized event
+ canonical resource/tenant resolution
+ provider-event dedupe
+ bounded correctness-sensitive transaction
+ durable continuation where required
+ safe acknowledgement
```

A framework/deployment choice must not transform request bodies in a way that destroys provider signature-verification material.

Provider callback:

```text
!= authenticated staff/member request
```

It uses provider-specific trust verification and a bounded application use case.

Runtime constraints that must be validated later include:

- body handling,
- request duration,
- cold starts if applicable,
- edge/runtime crypto/SDK compatibility,
- provider retries,
- connection/transaction behavior.

Function-heavy/serverless deployment is not accepted merely because callbacks are HTTP endpoints.

## 12. Background Worker Boundary

`D-ARCH-007` remains OPEN.

This ADR defines only the seam:

```text
HTTP Request Runtime
  -> persist bounded canonical transaction / durable intent as applicable
  -> durable continuation boundary
  -> Background Execution Runtime
```

The HTTP process must not be required to remain alive for:

- notification dispatch,
- renewal scans,
- no-show scans,
- provider reconciliation,
- long-running imports/exports,
- retry loops.

Critical scheduled/retryable work must not rely only on:

- `setInterval`,
- one web process's memory,
- detached/fire-and-forget promises.

A worker reuses the same application/domain rules with explicit System/Job Context and tenant scope.

No queue, scheduler, cron, outbox, or job product is selected.

## 13. Database and Tenant-Isolation Impact

Deployment topology must remain compatible with future accepted persistence/isolation decisions.

### 13.1 Connection management

Future runtime validation must cover:

- connection pooling,
- horizontal request replicas,
- transaction pinning,
- serverless/function connection churn if applicable,
- worker connection behavior,
- database failure/reconnect behavior.

No pooler or DB provider is selected.

### 13.2 Transaction/RLS context

If selective PostgreSQL RLS is eventually accepted under `D-SEC-008`, the request runtime must support transaction-safe tenant context and least-privileged runtime credentials.

Tenant security must not depend on mutable process-global variables.

Request A and Request B sharing a process must never share tenant identity through ambient mutable state.

### 13.3 Migration/admin privilege

Production migration/schema ownership remains separate from normal request/worker credentials.

Do not:

- run migrations automatically from every web/API instance startup,
- make the request-serving process the schema owner,
- use migration/admin credentials for normal application traffic.

## 14. Security and Privacy Impact

### 14.1 Secret boundary

Conceptual server-only secret categories include:

- database runtime credentials,
- Auth provider server credentials,
- payment provider secrets,
- webhook secrets,
- messaging/provider secrets,
- observability credentials,
- migration/admin credentials.

Browser bundles receive none of these.

Co-hosting therefore makes server-only/client-safe build dependency enforcement especially important. An independent API would make the process boundary more visible but would not eliminate secret-management requirements.

### 14.2 Threat model

| Threat | Primary control |
|---|---|
| Web route bypasses authorization | every protected adapter invokes server authorization; negative tests |
| Server Action duplicates business logic | Server Action only adapts to shared application handler |
| CORS misconfiguration | explicit least-privilege origin policy when cross-origin |
| CSRF | separate CSRF protections for cookie mutations; do not rely on CORS alone |
| Browser secret leakage | strict server-only/client-safe dependencies and bundle inspection |
| Cross-origin credential exposure | explicit origins, deliberate credentials/cookie policy, TLS |
| Webhook forgery | provider-specific authenticity verification before mutation |
| Raw-body verification failure | callback adapter preserves required verification material |
| Webhook replay | provider-event dedupe + business-effect idempotency |
| Process-local idempotency/session truth | durable canonical persistence/provider session controls |
| Connection-pool exhaustion | measured pool/connection limits; bounded requests; operational monitoring |
| Serverless timeout during critical operation | runtime compatibility spike; bounded transaction; no unsafe continuation |
| Fire-and-forget work lost | durable continuation boundary under later D-ARCH-007 |
| Framework cache leaks tenant data | private-by-default sensitive data; tenant-safe cache rules/tests |
| Internal network request trusted as authority | network location is not Principal/capability authorization |
| Migration credential used by runtime | distinct runtime vs migration/admin privileges |
| Provider secret exposed to client | server-only modules + client bundle inspection |
| Client/API version skew | ADR-0011 compatibility/versioning; deployment smoke tests |
| Rollback with incompatible schema | expand/contract migrations and forward/backward compatibility windows |

### 14.3 Internal network trust

If Owner/Staff web later calls an independent API:

```text
internal/private network location
!=
business authority
```

Human operations still require current Principal, tenant/resource scope, and capability authorization.

Any system-to-system credential/context must be explicitly bounded and auditable rather than implicitly trusted because it originated inside a private network.

### 14.4 API gateway

No API gateway is required for Phase 1 merely because the API could later become a separate deployable.

Normal platform ingress/reverse-proxy routing is sufficient conceptually unless later requirements justify gateway-specific behavior.

## 15. Reliability, Availability, Performance, and Scalability

### 15.1 Process-local state prohibition

Regardless of physical topology, the following cannot exist only in one request-serving process's memory:

- canonical session revocation,
- idempotency results,
- payment state,
- membership state,
- attendance,
- tenant authorization assignments,
- job state.

Restarts/horizontal scaling must not corrupt business truth.

### 15.2 Failure domains

Co-hosted-first means Phase 1 initially shares some failure/resource domain:

- web rendering regression can affect API availability,
- webhook surge can consume shared runtime capacity,
- API defect can affect staff web operations.

An independent API would separate some of these failure domains but introduces:

- web-to-API network dependency,
- separate deployment health,
- separate release/version compatibility,
- potentially cross-origin/session complexity,
- multi-service observability.

The proposal accepts the shared Phase 1 request-runtime domain because current scale/team evidence does not justify the extra distributed operational surface, while defining extraction triggers before that shared domain becomes harmful.

### 15.3 Horizontal scaling

The co-hosted request deployment must remain horizontally scalable:

- stateless request handling,
- shared canonical persistence,
- no local business truth,
- session provider/server session behavior that works across replicas,
- idempotent duplicate webhook/request handling,
- correlation IDs across replicas.

If an accepted web framework introduces per-instance caches, tenant-sensitive correctness must not depend on them being globally coherent.

Current Next.js self-hosting documentation confirms multi-server deployments require attention to build/version consistency, Server Function keys, and cache coordination. This is implementation evidence, not acceptance of Next.js or a cache product.

### 15.4 Performance

Qualitative tradeoff:

Co-hosted-first:

- can avoid an internal web-server-to-API network/TLS/serialization hop for trusted in-process server rendering,
- still uses HTTP for Member/native/external API callers,
- has one shared resource pool, so contention must be measured.

Independent API:

- adds a network/proxy/serialization hop for server-side web calls,
- allows independently sized API resources,
- can isolate rendering resource contention.

Function-heavy:

- may add cold starts and connection churn depending provider/runtime,
- can scale per route but increases operational variability.

No current Phase 1 evidence justifies accepting distributed request-serving infrastructure purely for hypothetical throughput.

### 15.5 API extraction triggers

Revisit independent API deployment when measured evidence shows one or more of:

1. API and web need materially different scaling.
2. Web releases create unacceptable API availability risk.
3. Native/external clients dominate API traffic.
4. Different runtime constraints become necessary.
5. Security/compliance requires stronger runtime/process separation.
6. Independent API release cadence becomes materially valuable.
7. Hosting constraints make co-hosting inefficient.
8. Metrics prove persistent web/API resource contention.
9. Team/ownership boundaries require separate deployment responsibility.

These are revisit triggers, not automatic extraction.

## 16. Operations, Deployment, and Observability

### 16.1 Deployment unit model

Phase 1 proposal:

```text
Deployable A:
  Owner/Staff Web + trusted /v1 HTTP/API adapters + provider callback adapters
  + trusted application runtime

Deployable B:
  Background Worker Runtime
  only when D-ARCH-007 later selects/approves implementation

Other deployables:
  Member web hosting mapping remains under client/hosting work
  migration/admin runner remains controlled release/admin responsibility
```

This is conceptual only. No deployment resource is created.

### 16.2 Hosting capabilities, not hosting vendor

`D-ARCH-009` remains OPEN.

A future hosting evaluation should support, as applicable:

- TLS,
- routing/custom-domain support,
- server-side runtime,
- secret/environment injection,
- health/readiness,
- horizontal scaling,
- logs/metrics/tracing integration,
- public webhook reachability,
- DB network connectivity,
- deploy rollback,
- separate background-worker compatibility.

Current official Next.js documentation confirms the framework can be deployed as a Node.js server, Docker container, or through adapters, and current Render documentation demonstrates that common platforms can model public web services, separate workers, health checks, scaling, and rollback. These sources are evidence that both co-hosted and later-separated topologies are operationally feasible; no provider is selected.

### 16.3 Release/rollback posture

Co-hosted-first reduces Phase 1 version skew between staff presentation adapters and trusted application code because they release together.

ADR-0011 compatibility is still mandatory because:

- Member web may not deploy atomically,
- future native clients can remain old,
- future extraction may separate web/API releases.

Release validation must consider:

```text
web rollback
API/transport rollback
database migration compatibility
old Member client + new API
new web + old compatible contract
rolling/multi-instance deployment skew
```

Migration rollout should prefer expand/contract compatibility; rollback is not assumed safe for arbitrary schema changes.

### 16.4 Health/readiness

If multiple runtime deployments later exist, each requires meaningful health/readiness behavior without publicly leaking detailed private dependency state.

No health endpoint is implemented here.

### 16.5 Observability

Topology must preserve end-to-end correlation across:

```text
browser / Member client
-> web runtime
-> API adapter
-> application handler
-> DB/provider
-> durable continuation / worker
```

Useful future telemetry context:

- request/correlation ID,
- operation name,
- deployment/service identity,
- verified tenant/gym/branch context where privacy-safe,
- safe Principal/actor reference,
- provider event reference,
- latency/error category.

Never log:

- cookies,
- Authorization headers,
- OTPs,
- refresh tokens,
- provider secrets,
- payment credentials/secrets,
- unnecessary private cross-tenant data.

Future metrics should include:

- request latency/error rate,
- webhook processing/ack behavior,
- DB connection pressure,
- cold starts if compute model has them,
- web rendering saturation,
- API saturation,
- dependency failures.

No observability provider or SLO number is selected.

## 17. Testing and Validation

No implementation/tests are created by this ADR. Before acceptance, validate at least:

1. Owner/Staff protected API request.
2. Member protected API request.
3. Unauthenticated request.
4. Revoked session.
5. Wrong tenant.
6. Member-self ID substitution.
7. Runtime validation failure.
8. Idempotent mutation retry.
9. Client timeout after successful mutation.
10. Raw payment webhook verification.
11. Forged webhook.
12. Duplicate webhook.
13. Webhook body-size/parse behavior.
14. API/web process restart during normal traffic.
15. Horizontal instance A/B requests.
16. Proof no canonical state exists only in process memory.
17. DB connection/pool behavior.
18. Tenant-context isolation.
19. Staff web/API same-origin path if proposed.
20. Member-client API path.
21. Cross-origin path if the implemented origin topology uses one.
22. CORS negative test.
23. CSRF negative test for cookie-authenticated mutation.
24. Browser bundle secret inspection.
25. Route/Server-Action authorization bypass attempt if the web framework supports them.
26. Co-hosted framework adapter invokes the shared application handler rather than duplicating logic.
27. Independent extraction spike from co-hosted-first structure.
28. Network-outage behavior in an independent-API spike.
29. Webhook traffic does not corrupt staff web behavior under representative load.
30. Deployment rollback compatibility.
31. Worker/application-module reuse seam.
32. Request correlation end to end.
33. Representative load/latency.
34. Selected hosting/runtime limit compatibility.
35. Future native client can consume ADR-0011 without framework-specific protocol.

Additional architecture tests should verify:

- domain/application packages import no framework request/response types,
- React/UI types do not appear below presentation adapters,
- provider/webhook secrets cannot enter client dependency graph,
- migration/admin credentials are not available to normal request runtime,
- background work does not depend on request-process lifetime.

## 18. Migration / Extraction Strategy

If this proposal is accepted, the extraction seam must exist from the first implementation even while API/web are one deployment.

Required seam:

```text
Transport adapter
  -> provider-independent request context
  -> application handler
  -> domain / persistence / provider ports
```

The application handler must not accept:

- Next.js `Request`/`Response` or route-context objects,
- React values/types,
- deployment-provider invocation objects,
- browser cookie objects as business identity,
- process-global tenant context.

A later extraction should primarily move:

- HTTP route adapters,
- authentication/session verification adapter wiring,
- request-context construction,
- provider callback adapters,
- application runtime composition,

into an API deployable.

It should **not** require rewriting:

- application commands/queries,
- domain rules/state ownership,
- authorization policy semantics,
- transaction/idempotency logic,
- persistence/provider ports,
- ADR-0011 contract semantics.

Extraction sequence conceptually:

1. prove application/domain tests run without web framework,
2. prove `/v1` contract tests against existing co-hosted runtime,
3. compose same handlers behind an independent API entry in a non-production spike,
4. prove authentication/session/origin behavior,
5. prove provider callbacks/raw-body verification,
6. prove DB/RLS/tenant context and secret boundaries,
7. prove Member/native compatibility,
8. compare operational/latency/failure evidence,
9. create a later ADR/update if the extraction is to become authoritative.

## 19. Reversibility

The Proposed co-hosted-first/extractable strategy has **High** architectural reversibility when the extraction rules are enforced.

Co-hosted -> independent API:

- move transport/runtime composition to separate deployment,
- preserve ADR-0011,
- preserve application/domain modules,
- add explicit network/origin/service health concerns,
- keep workers separate.

Independent API -> co-hosted, if later operational evidence shows separation was unnecessary:

- route the same transport adapters through the web/server runtime,
- preserve application/domain boundaries,
- retain ADR-0011 for Member/native/external consumption.

The least reversible risks are not the number of processes themselves; they are:

- framework objects leaked into application/domain layers,
- duplicated Server Action and HTTP business implementations,
- provider-function-specific business logic,
- direct client database coupling,
- process-local business truth,
- client-specific API semantics that diverge from ADR-0011.

## 20. Risks and Mitigations

### Risk: co-hosting becomes framework-owned architecture

**Mitigation:** Route Handlers/Server Functions are adapters only; architecture/dependency tests keep framework objects out of application/domain.

### Risk: shared web/API deployment creates unacceptable blast radius

**Mitigation:** measure web/API saturation and webhook load; health/readiness; define extraction triggers; preserve independent extraction seam.

### Risk: Server Actions create parallel business semantics

**Mitigation:** all mutation adapters invoke the same application command handlers and authorization/idempotency logic.

### Risk: Member/native clients become coupled to Next.js internals

**Mitigation:** ADR-0011 JSON HTTPS remains the stable external contract; no framework-specific client transport.

### Risk: same-origin convenience hides future cross-origin complexity

**Mitigation:** keep public origin separate from physical deployment; include explicit CORS/session extraction spike before separation.

### Risk: CORS is treated as authorization or CSRF protection

**Mitigation:** server authorization remains mandatory; CSRF separately validated for cookie mutations; CORS uses explicit allowed origins only when needed.

### Risk: webhook parsing destroys signature-verification input

**Mitigation:** provider callback adapter preserves required raw verification material and is tested with actual provider contract later.

### Risk: request handler launches fire-and-forget work that is lost

**Mitigation:** durable continuation boundary; exact job/outbox technology decided under `D-ARCH-007`.

### Risk: horizontal replicas diverge through framework-local caches

**Mitigation:** canonical truth never depends on framework cache; tenant-sensitive cache is private by default; multi-instance consistency tested where caching is enabled.

### Risk: runtime holds migration/admin privilege

**Mitigation:** separate runtime and migration/admin credentials; no schema ownership from web/API process.

### Risk: rollback meets incompatible DB schema

**Mitigation:** expand/contract migration discipline, compatibility windows, migration validation, smoke tests, and forward-fix where rollback is unsafe.

### Risk: serverless/function model is assumed safe without runtime evidence

**Mitigation:** deployment boundary remains compute-model neutral; provider/runtime duration, body, crypto, DB, transaction, and observability limits require validation before selection.

## 21. Open Questions

Still separately governed:

- whether `D-ARCH-012` Next.js direction is accepted,
- exact Node.js production version/runtime constraints under accepted `D-ARCH-016`,
- exact authentication/session provider and cookie/session policy,
- exact physical hosting/provider under `D-ARCH-009`,
- exact public domain/origin/routing layout,
- exact Member web hosting mapping,
- exact durable job/scheduler technology under `D-ARCH-007`,
- exact database/pooling/RLS implementation,
- whether any API gateway is ever justified,
- whether request runtime should be long-lived, serverless, containerized, or platform-adapted,
- exact rate/abuse limits,
- exact health/readiness contract,
- formal latency/availability/RPO/RTO SLOs,
- exact CI/CD/release orchestration,
- observability provider,
- whether future scale/security/team evidence triggers API extraction.

## 22. Decision Evidence

### 22.1 Repository evidence

Latest canonical repository state verifies:

- `D-ARCH-006 = P1 OPEN`.
- ADR-0014 did not exist before this task.
- no explicit approval evidence promotes `D-ARCH-006` to `DECIDED`.
- ADR-0011 remains Proposed and requires deployment compatibility.
- ADR-0012 remains Proposed and keeps the trusted application boundary independent from the web framework.
- ADR-0013 remains Proposed and requires a stable trusted API for Member web/future native.
- the container/component architecture already permits co-hosted or independent API mapping.
- `NFR-SCALABILITY-002` and `NFR-SCALABILITY-005` favor simple Phase 1 deployment and reject premature service decomposition.
- `NFR-SCALABILITY-003` requires horizontally evolvable stateless request handling.
- `NFR-SCALABILITY-004` requires asynchronous work to remain separable.
- `D-ARCH-007` background jobs and `D-ARCH-009` hosting remain OPEN.
- no production API runtime, host, job system, or infrastructure has been selected.

Legacy `docs/16-open-decisions.md` listed “Next.js server/API initially” versus “separate TypeScript API app from day one” as an unresolved deployment choice. That legacy evidence is consistent with the current canonical question but does not control the decision.

### 22.2 Current official research

Research date: `2026-09-26`.

Primary/current material reviewed:

- Next.js Deploying: https://nextjs.org/docs/app/getting-started/deploying
- Next.js Self-Hosting: https://nextjs.org/docs/app/guides/self-hosting
- Next.js Deploying to Platforms: https://nextjs.org/docs/app/guides/deploying-to-platforms
- Next.js Route Handlers: https://nextjs.org/docs/app/getting-started/route-handlers
- Next.js Backend for Frontend: https://nextjs.org/docs/app/guides/backend-for-frontend
- Next.js Mutating Data / Server Functions: https://nextjs.org/docs/app/getting-started/mutating-data
- MDN CORS: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS
- MDN CSRF: https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/CSRF
- MDN Set-Cookie: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie
- Node.js release-schedule update: https://nodejs.org/en/blog/announcements/evolving-the-nodejs-release-schedule
- Render Web Services: https://render.com/docs/web-services
- Render Health Checks: https://render.com/docs/health-checks
- Render Background Workers: https://render.com/docs/background-workers
- Render Deploy/Rollback documentation: https://render.com/docs/deploys and https://render.com/docs/rollbacks

Material findings used by this ADR:

- current Next.js supports full-feature Node server/container deployment and other platform adapters; the framework does not require one hosting vendor,
- Route Handlers are ordinary external HTTP request handlers and should remain thin adapters,
- Server Functions/Actions are network-reachable operations and therefore do not become trusted business boundaries merely because framework-generated,
- some hosts map route handlers to ephemeral/function runtimes with timeout/shared-state restrictions, so compute/runtime compatibility must be validated separately from logical API deployment,
- multi-instance Next.js deployments introduce version/cache/server-function coordination considerations, reinforcing the rule that canonical state cannot depend on process-local framework state,
- credentialed cross-origin browser requests require explicit allowed origins rather than wildcard CORS,
- SameSite cookies are CSRF defense in depth, not a complete CSRF solution,
- mainstream hosting models can support public web services, separate workers, health checks, horizontal scaling, and rollback, demonstrating the proposed co-hosted-first plus later-extraction model is operationally feasible without choosing a host.

No specific Next.js, Node.js, Render, Vercel, serverless, container, or hosting version/product is accepted by this research.

### 22.3 Missing acceptance evidence

ADR-0014 remains Proposed because acceptance still lacks:

- decision-owner approval,
- a real co-hosted framework-adapter spike,
- proof application/domain logic runs independently of framework request types,
- Owner/Staff same-origin protected-flow evidence,
- Member-client API evidence,
- raw payment webhook verification in the selected runtime,
- DB/pool/tenant-context evidence,
- horizontal multi-instance behavior,
- browser-bundle secret inspection,
- request/worker reuse seam,
- independent extraction spike,
- representative load/failure/rollback evidence,
- selected-host runtime-limit compatibility,
- finalized authentication/session topology,
- hosting decision.

## 23. Related Documents

- `../README.md`
- `../00-overview/assumptions.md`
- `../01-product/functional-requirements.md`
- `../01-product/non-functional-requirements.md`
- `../01-product/user-journeys.md`
- `../02-architecture/architecture-principles.md`
- `../02-architecture/architecture-overview.md`
- `../02-architecture/system-context.md`
- `../02-architecture/container-architecture.md`
- `../02-architecture/component-architecture.md`
- `../02-architecture/data-flow.md`
- `../02-architecture/technology-stack.md`
- `ADR-0001-modular-monolith.md`
- `ADR-0002-primary-language-runtime.md`
- `ADR-0003-monorepo-strategy.md`
- `ADR-0005-data-access-migration-strategy.md`
- `ADR-0006-managed-backend-responsibilities.md`
- `ADR-0007-authentication-session-architecture.md`
- `ADR-0009-authorization-implementation.md`
- `ADR-0010-data-layer-tenant-isolation-rls.md`
- `ADR-0011-api-contract-architecture.md`
- `ADR-0012-owner-staff-web-framework.md`
- `ADR-0013-member-client-strategy.md`
- legacy migration source: `../05-system-architecture.md`
- legacy migration source: `../07-api-contracts.md`
- legacy migration source: `../08-automations.md`
- legacy migration source: `../12-security-audit.md`
- legacy migration source: `../15-engineering-workflow.md`
- legacy migration source: `../16-open-decisions.md`
