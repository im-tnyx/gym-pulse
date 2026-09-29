# ADR-0012: Owner / Staff Web Application Framework

## Status

`Proposed`

## Decision Metadata

- ADR: `ADR-0012`
- Primary Decision ID: `D-ARCH-012`
- Related Decision IDs: `D-ARCH-016`, `D-ARCH-003`, `D-ARCH-004`, `D-SEC-004`, `D-ARCH-015`, `D-SEC-008`, `D-ARCH-005`, `D-ARCH-001`, `D-ARCH-006`, `D-ARCH-007`, `D-ARCH-009`, `D-ARCH-014`, `D-ARCH-018`, `D-ARCH-019`, `D-PROVIDER-006`
- Decision Owner: `Open`
- Technical Owner: `Architecture / Frontend / Security`
- Date Proposed: `2026-09-11`
- Date Accepted: `Not accepted`
- Supersedes: `None`
- Superseded By: `None`

## 1. Context

GymPulse Phase 1 needs one secure operational web application for Owner, Manager, and Front Desk workflows. The web surface is primarily an authenticated business application rather than a public content site.

Representative Phase 1 staff workflows include:

```text
member search and member summary
membership and plan operations
assisted attendance
attendance correction
retention / no-show queues
follow-up recording and assignment
renewal pipeline
payment exception review
add-on fulfillment
owner operational dashboard and drill-down
data-quality queues
authorized audit views
configuration and permission-sensitive actions
controlled import / reconciliation
```

The application must work well for two different operating styles:

- Owner/Manager users reviewing prioritized queues, summaries, exceptions, configuration, and drill-downs.
- Front Desk users performing fast member lookup and safe operational actions while a member may be physically waiting.

The canonical container architecture treats the Owner/Staff Application as an untrusted client with respect to canonical business truth. The trusted GymPulse application boundary, whether co-hosted with the web runtime or independently deployed, remains responsible for authentication verification, Principal resolution, tenant/resource resolution, authorization, runtime contract validation, application/domain behavior, canonical persistence, idempotency, audit, and safe error translation.

Therefore:

```text
Web Framework
!=
Authorization Boundary
!=
Domain/Application Architecture
!=
API Deployment Topology
```

`D-ARCH-012` is currently `P0 PROPOSED` and names Next.js + TypeScript as the leading candidate only. This ADR evaluates that direction against credible alternatives. It does not change the canonical decision to `DECIDED`.

The web framework decision must preserve the already-proposed API contract in `ADR-0011`:

```text
JSON over HTTPS
+
resource/query reads and explicit business-command actions
+
runtime trust-boundary schemas
+
purpose-specific DTOs
+
stable machine-readable errors
+
explicit idempotency for designated retry-sensitive commands
```

Framework-local server features may optimize the Owner/Staff experience, but they must not silently replace the canonical application contract, authorization model, or domain ownership.

## 2. Requirements and Decision Drivers

### 2.1 Functional requirements

The web framework must support the staff-facing requirements that include:

- `FR-IDENTITY-001` authenticated Owner, Manager, and staff functionality.
- `FR-IDENTITY-002` session termination and revocation/expiry semantics suitable for the selected authentication architecture.
- `FR-AUTHZ-001` tenant/gym/branch-scoped authorization for every protected operation.
- `FR-AUTHZ-002` named capability enforcement for protected mutations.
- `FR-AUTHZ-004` trusted actor attribution for sensitive staff actions.
- `FR-MEMBER-005` fast in-scope member search.
- `FR-PLAN-001..003` authorized plan management and historical commercial traceability.
- `FR-MEMBERSHIP-001..007` membership lifecycle presentation and authorized operations.
- `FR-ATTENDANCE-007..011` assisted attendance, mandatory reason, in-scope history, auditable correction, and preserved history.
- `FR-RETENTION-001..007` configurable inactivity policy and actionable retention queue.
- `FR-FOLLOWUP-001..006` append-oriented follow-up workflow, next actions, assignment/recent-contact visibility, and preserved history.
- `FR-RENEWAL-001..007` renewal pipeline and server-authoritative offer/order state.
- `FR-PAYMENT-001..010` canonical payment-state presentation, payment exception handling, verified online-payment semantics, and authorized offline-payment path if enabled.
- `FR-ADDON-001..008` add-on configuration and fulfillment/usage state.
- `FR-DASHBOARD-001..004` daily Owner/Manager dashboard, required cards, action queues, and metric drill-down.
- `FR-AUDIT-001..003` attributable sensitive actions and authorized audit views.
- `FR-DATA-QUALITY-001..002` operational issue visibility and resolution tracking.
- `FR-IMPORT-001..002` controlled import preview/error/reconciliation without fabrication.
- `FR-CROSS-001..004` server truth, idempotent critical effects, explicit tenant context, and gym-local time correctness.

### 2.2 Non-functional requirements

Security and privacy:

- `NFR-SECURITY-001` tenant isolation.
- `NFR-SECURITY-002` least privilege.
- `NFR-SECURITY-003` server-side authorization.
- `NFR-SECURITY-004` server/client secret separation.
- `NFR-SECURITY-005` encrypted production traffic.
- `NFR-SECURITY-009` sensitive-action attribution.
- `NFR-SECURITY-010` abuse controls for sensitive endpoints.
- `NFR-SECURITY-011` safe client errors and logs.
- `NFR-PRIVACY-001` data minimization.
- `NFR-PRIVACY-003` authorization-scoped exports.

Performance and operational UX:

- `NFR-PERFORMANCE-002` indexed server-side member search rather than loading all members to the browser.
- `NFR-PERFORMANCE-003` bounded/paginated operational queues.
- `NFR-PERFORMANCE-004` efficient dashboard reads without N+1/full scans.
- `NFR-UX-002` actionable operational state and recoverable errors before decorative presentation.
- `NFR-UX-003` explicit loading, success, validation, authorization, business rejection, and retry states.
- `NFR-OPERATIONS-005` routine daily staff workflows must not require developer intervention.

Accessibility and compatibility:

- `NFR-ACCESSIBILITY-001` semantic controls and keyboard/focus behavior.
- `NFR-ACCESSIBILITY-002` readable contrast and non-color-only critical state.
- `NFR-ACCESSIBILITY-003` formal conformance target remains Open and must be defined before broad release.
- `NFR-COMPATIBILITY-001` supported browsers remain Open until the stack/version policy is finalized.

Maintainability, observability, and testing:

- `NFR-MAINTAINABILITY-001` core business rules must not be duplicated inside the web UI.
- `NFR-MAINTAINABILITY-002` typed contracts plus runtime validation for the proposed TypeScript direction.
- `NFR-MAINTAINABILITY-005..006` Docs-as-Code synchronization and ADR governance.
- `NFR-TESTABILITY-001..005` deterministic domain testing, provider simulation, failure paths, authorization matrix tests, and controlled time.
- `NFR-OBSERVABILITY-001..007` structured logs, safe context, browser/server error visibility, diagnostics, and request/correlation identifiers.
- `NFR-OPERATIONS-001..004` environment separation, secret separation, safe release behavior, and critical smoke tests.

### 2.3 Product and interaction drivers

The Owner/Staff application is dominated by authenticated operational interaction:

```text
forms
tables
filtered queues
search
contextual actions
status and exception handling
multi-step controlled mutations
dashboards with drill-down
import/reconciliation
permission-sensitive configuration
```

SEO is not a primary Phase 1 requirement for the authenticated staff application. Rendering strategy should therefore optimize secure operations, responsiveness, maintainability, and appropriate JavaScript/data transfer rather than public-page search indexing.

Front Desk workflows require keyboard-friendly navigation and low-latency search/action feedback. Owner workflows require dense but understandable operational state, filters, and drill-downs. The framework must support both without moving canonical decisions into browser state.

### 2.4 Architecture principles

This decision is especially constrained by:

- `ARCH-PRIN-001` Tenant Isolation by Design.
- `ARCH-PRIN-002` Authentication and Authorization Are Separate Responsibilities.
- `ARCH-PRIN-003` Capability-Based Permissions.
- `ARCH-PRIN-004` Deterministic Server-Side Business Truth.
- `ARCH-PRIN-006` Idempotent Critical Effects.
- `ARCH-PRIN-007` Auditable Sensitive Mutations.
- `ARCH-PRIN-009` Explicit Domain and State Ownership.
- `ARCH-PRIN-012` Provider Abstraction at Integration Boundaries.
- `ARCH-PRIN-013` Failure Visibility and Reconciliation.
- `ARCH-PRIN-014` Observability by Design.
- `ARCH-PRIN-015` Data Minimization and Purpose Separation.
- `ARCH-PRIN-016` Secure Defaults and Least Privilege.
- `ARCH-PRIN-017` Modular Monolith Before Microservices.
- `ARCH-PRIN-018` No Premature Infrastructure.
- `ARCH-PRIN-019` Evolution Through Explicit Decisions.

## 3. Constraints and Assumptions

1. `D-ARCH-012` remains `P0 PROPOSED`; this ADR is Proposed and does not make it `DECIDED`.
2. `D-ARCH-016` is `DECIDED`; strict TypeScript + supported Node.js LTS is an accepted foundation category. This ADR still does not pin an exact runtime version.
3. `D-ARCH-003` remains `PROPOSED`; `ADR-0011` is only Proposed. The framework must preserve its versioned JSON HTTP contract and runtime trust-boundary validation architecture.
4. `D-ARCH-004` remains `OPEN`; no authentication provider or final session implementation is selected.
5. `D-SEC-004` remains `OPEN`; exact session lifetime, device policy, inactivity, remember-me, and revocation SLA are not selected.
6. `D-ARCH-015` remains `PROPOSED`; application authorization remains server-owned and provider/framework roles are not authority.
7. `D-SEC-008` remains `OPEN`; the web framework does not decide RLS or direct-client database access.
8. `D-ARCH-006` remains `OPEN`; this ADR must work whether trusted API/application responsibilities are co-hosted with the web runtime or independently deployed.
9. `D-ARCH-007` remains `OPEN`; scheduled/durable background work must not rely on web request lifetime or a framework scheduler assumption.
10. `D-ARCH-009` remains `OPEN`; this ADR does not select Vercel or another hosting platform.
11. `D-ARCH-014` remains `OPEN`; no managed backend/platform responsibility or provider Data API is selected.
12. `D-ARCH-018` remains `PROPOSED`; this ADR defines required web/security test categories but selects no final test runner or browser test product.
13. `D-ARCH-019` remains `OPEN`; no production release platform or secret-management product is selected.
14. `D-PROVIDER-006` remains `OPEN`; observability capability is required but no provider is selected.
15. `D-ARCH-001` is `DECIDED`; the repository strategy is an explicit monorepo. This ADR does not decide the final package graph, package manager, or workspace orchestrator.
16. The Owner/Staff application is not permitted to mutate canonical persistence directly from browser code.
17. Server-rendered code is not automatically an authorization boundary merely because it executes on a server. Protected reads/mutations still pass current Principal/scope/capability/resource checks.
18. UI visibility, route guards, layouts, redirects, framework middleware/proxy, and client role flags are UX/navigation controls only. They do not replace operation-level authorization.
19. Business/domain logic stays outside React components, route modules, Server Actions/Functions, and framework-specific handlers.
20. API DTOs, domain models, persistence models, and provider objects remain distinct even when TypeScript inference makes sharing easy.
21. A framework cache must not become an alternate source of canonical truth or permit cross-user/cross-tenant data reuse.
22. Exact browser support, UI component library, table library, form library, CSS solution, state library, design system, test framework, and observability vendor remain separate implementation/tooling choices.
23. The web framework must support application behavior with JavaScript enabled. A no-JavaScript operational mode is not a Phase 1 requirement unless separately approved.
24. The framework choice must not force the Member client under `D-ARCH-013` to use the same framework.

## 4. Framework Boundary Model

### 4.1 Owner/Staff presentation boundary

The web application owns presentation responsibilities:

```text
routes / screen composition
navigation
forms and local interaction state
filter/sort/query intent
loading / empty / error / blocked states
accessible controls and focus behavior
presentation formatting
request invocation
safe display of authorized DTOs
```

It does not own:

```text
tenant or branch authority
capability authorization
membership eligibility
payment truth
attendance validity
no-show policy
renewal eligibility / final price
provider verification
canonical audit actor
database transactions
business-effect idempotency
```

### 4.2 Framework server/runtime boundary

A full-stack web framework can execute server-side code. That fact does not collapse logical responsibilities.

If `D-ARCH-006` later approves a co-hosted topology, the Next.js server runtime may physically host trusted transport/application adapters. Those adapters must still invoke the same framework-independent application/domain modules and security boundaries.

Conceptually:

```text
Next.js page / route / Server Function
        ↓ thin adapter
runtime contract / trusted execution context
        ↓
Principal + scope + capability authorization
        ↓
application command/query
        ↓
domain / ports / persistence
```

If `D-ARCH-006` later chooses an independently deployed API:

```text
Next.js presentation/server rendering
        ↓
ADR-0011 JSON HTTP contract
        ↓
Trusted Application/API Runtime
```

Both mappings must remain viable.

### 4.3 Server Components and Client Components

For a Next.js App Router implementation, use the server/client boundary deliberately:

- Server Components are the default for page/layout composition and non-interactive server-rendered presentation.
- Client Components are introduced where browser state, event handlers, effects, or browser-only APIs are required.
- keep `use client` boundaries as narrow as practical so server-only dependencies and unnecessary code do not enter browser bundles.
- values passed from server rendering to Client Components are treated as a serialization/public-output boundary and must contain only purpose-appropriate authorized DTO data.
- do not pass database rows, provider objects, session secrets, authorization internals, or unrestricted domain objects to Client Components.

This is a framework usage rule, not a statement that Server Components own domain/application logic.

### 4.4 Server Functions / Server Actions

React/Next Server Functions can be useful for web-local form mutation ergonomics, but they are network-reachable mutation entry points and remain untrusted at their arguments.

Rules:

- validate external inputs at runtime,
- verify the current session/Principal,
- authorize every protected operation,
- invoke an application command rather than implementing business rules inline,
- preserve idempotency where the logical operation is retry-sensitive,
- return safe presentation/application errors,
- never treat closure variables, hidden form fields, route placement, or UI visibility as authorization.

`ADR-0011` remains the primary independently consumable client/server contract. A Server Function may be a secondary Owner/Staff adapter/optimization when it calls the same application use case and does not create a second domain or security implementation.

### 4.5 Route Handlers

Next.js Route Handlers may implement HTTP adapters if a co-hosted topology is later accepted, but:

- the route handler remains thin,
- runtime contract schemas remain authoritative for external inputs,
- provider callbacks preserve raw verification material where required,
- no route directly performs arbitrary database mutations,
- framework-specific request/response types stop at the transport boundary,
- the same application/domain use case remains testable without Next.js.

This ADR does not decide that the canonical API must be hosted inside Next.js.

## 5. Options Considered

### Option A: Next.js App Router + React

Use the current supported Next.js line with the App Router and React as the Owner/Staff web framework. The accepted implementation-language category is strict TypeScript under `D-ARCH-016`; exact framework/runtime versions remain separately selected.

Strengths:

- mature React-based full-stack framework and ecosystem,
- server/client component boundaries can reduce unnecessary browser JavaScript and keep server-only work off the client,
- file-based routing, nested layouts, loading/error conventions, and streaming support fit an operational application,
- can use server rendering and server-side data loading while retaining interactive Client Components,
- can call an independently deployed ADR-0011 API or, if later approved, co-host trusted HTTP/application adapters,
- current official deployment model supports full-feature Node.js server and Docker operation as well as platform adapters,
- current official guidance explicitly separates authentication, session management, authorization, DAL/DTO concerns, and supports server-only data boundaries,
- current instrumentation conventions support server error capture and OpenTelemetry-compatible observability,
- broad React ecosystem for forms, tables, accessibility, testing, and operational UI components.

Tradeoffs:

- server/client/render/cache concepts increase framework mental model compared with a client-only SPA,
- full-stack convenience can tempt business logic and authorization into pages, layouts, Server Functions, or Route Handlers,
- framework caching/revalidation behavior requires explicit security review for tenant-sensitive authenticated data,
- multi-instance cache/revalidation features can add coordination concerns if heavily used,
- React Server Component/framework internals evolve with React/Next releases and require disciplined upgrade testing,
- UI/runtime coupling is material and framework replacement later is expensive.

### Option B: React Router Framework Mode + React

Use React Router Framework Mode for routing, route loaders/actions, type-safe route modules, optional SSR, and optional pre-rendering.

Strengths:

- React ecosystem and familiar component model,
- route loaders/actions and automatic data revalidation fit form/table operational workflows,
- supports CSR, SSR, and pre-rendering strategies,
- official deployment templates cover full-stack and static-hosting models,
- lower framework coupling to React Server Components in the stable non-RSC path,
- strong migration path from client routing toward fuller framework features.

Tradeoffs for GymPulse:

- fewer integrated conventions than Next.js for a broad full-stack/BFF surface,
- final security/session/data-access conventions still need more project-level assembly,
- deployment/runtime adapter choices remain explicit operational work,
- current RSC integration is still documented as unstable/experimental and should not be a Phase 1 dependency,
- choosing Framework Mode still creates framework-specific loader/action semantics that must remain adapters around ADR-0011/application use cases.

This is the strongest current alternative to Next.js.

### Option C: React SPA + Vite + client routing, separate trusted API

Build the Owner/Staff application as a client-rendered React SPA, typically with Vite and React Router Data/Declarative mode, with all protected server behavior in an independently deployed API.

Strengths:

- simple browser/server responsibility split,
- low server-rendering/cache complexity in the web app,
- natural fit when `D-ARCH-006` selects an independent API,
- static web hosting is straightforward,
- familiar React client development and strong tool ecosystem.

Tradeoffs for GymPulse:

- pushes all protected data loading through browser-to-API calls and client orchestration,
- larger default client-side responsibility for loading/error/query state,
- no server-rendered/BFF seam for first-party session/data shaping when that is useful,
- first-load and bundle behavior can be worse if the application grows without disciplined code splitting,
- secure cookie/CORS/CSRF/origin topology may be more operationally complex when web and API are cross-origin,
- selecting this now would prematurely constrain `D-ARCH-006` toward a separate-API model.

This remains a credible fallback if independent API deployment becomes clearly preferable and full-stack Next.js features provide little value.

### Option D: another mature non-React full-stack/server-rendered web framework

Use a different mature framework ecosystem for the staff application.

Potential benefits:

- may offer simpler mental models or stronger conventions for particular teams,
- may reduce React/Next-specific complexity,
- can still consume ADR-0011 JSON HTTP contracts.

Current drawbacks:

- introduces a second primary UI language/ecosystem direction relative to the current TypeScript/React candidate stack,
- reduces opportunity to share client-safe TypeScript contracts/tooling if the candidate runtime direction is accepted,
- no current GymPulse requirement demonstrates a capability gap in React/Next.js that justifies the ecosystem switch,
- would require new accessibility, testing, hiring/maintenance, observability, and deployment evidence.

No non-React framework is selected by this ADR.

## 6. Evaluation

| Criterion | Next.js App Router | React Router Framework Mode | React SPA + separate API | Other full-stack web framework |
|---|---|---|---|---|
| Staff forms/tables/queues | **Strong** | **Strong** | **Strong** | Varies |
| Server/client boundary | **Strong, explicit RSC/client model** | Strong | Simple client/API split | Varies |
| Independent ADR-0011 API consumption | **Strong** | Strong | **Strongest/natural** | Strong if HTTP client |
| Co-hosted trusted adapter option | **Strong** | Strong | Weak by design | Varies |
| Preserve `D-ARCH-006` optionality | **Strong** | Strong | Weaker; biases separate API | Varies |
| Authenticated SSR/server rendering | **Strong** | Strong | None at runtime | Varies |
| Client bundle control | Strong with narrow client boundaries | Strong | Requires explicit code splitting | Varies |
| Authorization boundary visibility | Strong only with discipline | Strong only with discipline | Strong API boundary, UI still untrusted | Varies |
| Tenant-sensitive cache risk | Moderate; must govern framework caches | Moderate | Lower in web static layer; API cache still separate | Varies |
| Session/cookie compatibility | **Strong** | Strong | Strong but cross-origin topology can complicate | Varies |
| Framework-level observability hooks | **Strong** | Strong/adapter-dependent | Client-focused; API owns server tracing | Varies |
| Accessibility ecosystem | **Strong** | **Strong** | **Strong** | Varies |
| Browser E2E fit | Strong | Strong | Strong | Varies |
| Deployment portability | Strong Node/Docker + adapters | Strong templates/adapters | **Strong static web portability** | Varies |
| Phase 1 operational simplicity | **Strong if used conservatively** | Strong | Strong when separate API already exists | Varies |
| Risk of framework/business coupling | Moderate/High without rules | Moderate | Moderate client coupling, lower server coupling | Varies |
| Current evidence / project alignment | **Strongest** | Strong alternative | Strong fallback | Weak without new evidence |
| Reversibility | Medium | Medium | Medium-High at server boundary | Varies |
| Overall GymPulse fit | **Strongest current fit** | Strong alternative | Credible topology-dependent fallback | Not justified currently |

The evaluation does not claim Next.js is universally better. It provides the best current balance for GymPulse because it supports both a full-stack/co-hosted presentation adapter and an independent API consumer without forcing the final deployment decision now.

## 7. Proposed Decision

**Propose Next.js App Router with React as the Owner/Staff web application framework. Use the accepted strict-TypeScript language category from `D-ARCH-016`, while keeping exact runtime/framework versions separately governed. Keep all domain/application/security semantics framework-independent and preserve `ADR-0011` as the canonical independently consumable client/server contract.**

The proposal is governed by these rules:

1. Next.js/React own web presentation and framework adaptation, not GymPulse domain truth.
2. App Router is the default Next.js routing/rendering model for new implementation; Pages Router is not the planned baseline.
3. Server Components are preferred for non-interactive page/layout composition and server-side presentation reads where appropriate.
4. Client Components are used only where interactivity/browser APIs require them; client boundaries stay narrow.
5. Server Functions/Actions and Route Handlers are adapters. They do not contain duplicated application/domain rules.
6. `ADR-0011` JSON HTTP contracts remain the primary independently consumable contract. Framework-local adapters may call the same application commands/queries without redefining semantics.
7. `D-ARCH-006` remains `OPEN`; this ADR does not decide whether the trusted API is co-hosted with Next.js or independently deployed.
8. Protected browser/server data access is authorized from the current GymPulse Principal/resource/capability state. Layout, Proxy/middleware, route presence, or UI visibility is not authorization.
9. Client code receives only purpose-specific authorized DTOs. Database rows, provider payloads, secrets, privileged session material, and authorization internals do not cross the client serialization boundary.
10. Tenant-sensitive/private data is not placed in shared caches unless isolation keys, invalidation, privacy behavior, and negative cross-tenant tests are explicit and proven.
11. Exact UI library, CSS system, form library, table library, client state/query library, test tools, hosting, and observability provider remain separate decisions.
12. Background/durable jobs remain outside browser/request lifetime and under `D-ARCH-007`.
13. No direct browser-to-database canonical mutation is introduced.
14. Framework upgrades must preserve server/client, cache, security, contract, and deployment invariants through tests and review.

## 8. Rendering and Data-Loading Posture

### 8.1 Authenticated application, not SEO-driven site

The Owner/Staff surface should not maximize static generation merely because the framework supports it. Protected operational data is current, tenant-scoped, and permission-sensitive.

Use rendering modes intentionally:

- static/prerendered output for genuinely public/static shell/content where applicable,
- server rendering/Server Components for protected presentation that benefits from server-side data access or smaller client bundles,
- Client Components for interactive controls, filters, forms, tables, dialogs, optimistic presentation, and browser APIs,
- client-side refetch/revalidation where operational UX needs live refresh or user-triggered refresh.

No route is considered safe to cache publicly solely because it is read-only.

### 8.2 Data access through application boundaries

Two allowed architecture mappings remain:

```text
Independent API topology:
Next.js -> ADR-0011 HTTP contract -> Trusted API -> application/domain
```

or, if later approved:

```text
Co-hosted topology:
Next.js server adapter -> application command/query -> domain
```

Even when co-hosted, a page/component does not directly own repository/persistence semantics. Server-side presentation code may invoke a purpose-specific application query/read model through an explicit server-only boundary.

### 8.3 Client-side state

Browser state is presentation state. It may hold:

```text
selected filters
sort intent
pagination cursor
form drafts
open dialog state
safe optimistic presentation
cached authorized DTOs for UX
```

It must not become canonical for:

```text
current capability truth
payment success
membership entitlement
attendance validity
final price
audit actor
provider verification
cross-tenant resource ownership
```

A stale client state conflict is resolved from canonical server state using the stable conflict/error semantics proposed by ADR-0011.

## 9. Authentication, Session, and Authorization Impact

### 9.1 Staff browser session posture

`ADR-0007` remains Proposed and `D-ARCH-004` remains OPEN. This ADR is compatible with its leading first-party server-mediated secure-cookie posture.

If that session architecture is later accepted, the Next.js implementation must support:

- `HttpOnly` session material where compatible,
- `Secure` production cookies,
- deliberate `SameSite`, host/domain/path scope,
- session fixation/rotation protections,
- current-session logout and provider/session invalidation where supported,
- explicit CSRF protection for cookie-authenticated mutations,
- no long-lived reusable browser bearer credential in `localStorage` as the default.

Next.js cookie APIs are an implementation mechanism only; session semantics remain under `D-ARCH-004`/`D-SEC-004`.

### 9.2 Authorization placement

The secure authorization point is the trusted application operation/data access, not a top-level page or route guard.

Framework navigation guards may perform optimistic UX checks, but every protected read/mutation still evaluates:

```text
Principal
+ current account eligibility
+ trusted tenant/resource scope
+ named capability or permitted relationship
+ trusted resource relationship
-> allow / deny
```

This follows `ADR-0009` without accepting it.

### 9.3 Revocation and stale rendering

A previously rendered page or hidden/shown button must not preserve authority after a role, scope, account, or capability is revoked.

Protected operations reload/resolve current authorization according to the accepted security design. Any authorization-related caching requires explicit invalidation/revocation evidence and tests.

## 10. Security and Privacy Impact

### 10.1 Server-only and client-safe module boundaries

The implementation must structurally separate server-only code from client-safe code.

Server-only material includes, at minimum:

```text
auth/session secrets
provider secrets
database credentials and clients
migration tooling
server configuration
provider administrative SDKs
raw webhook verification secrets
privileged authorization internals
server observability credentials
```

Use framework-supported server-only import guards and repository/lint/build boundaries where practical. A successful browser build must not contain server secrets or privileged modules.

### 10.2 Serialization/data exposure

React Server Components can pass serializable data to Client Components. Treat this as an external presentation boundary.

Requirements:

- map to explicit purpose-specific DTOs,
- minimize PII and internal fields,
- never serialize whole database/domain/provider objects for convenience,
- do not expose role/capability internals beyond what the UI actually needs,
- internal notes/audit/payment/provider details remain capability/purpose filtered.

### 10.3 XSS and content security

`HttpOnly` does not make XSS harmless because same-origin script can still invoke authenticated actions.

The eventual implementation should include:

- React-safe output rendering practices,
- controlled treatment of any future rich HTML/content,
- dependency/script hygiene,
- a reviewed Content Security Policy suitable for the final rendering/deployment strategy,
- minimal third-party scripts,
- no secrets/tokens in browser logs or analytics.

Current Next.js documentation supports CSP including nonce-based patterns, but nonce/CSP strategy can affect rendering/caching and is therefore an implementation/security design to validate rather than an automatic framework default.

### 10.4 CSRF

Cookie-authenticated state-changing operations require a complete CSRF design under `ADR-0007` and the eventual session implementation.

Framework built-in origin checks or Server Action behavior may contribute defense in depth, but they do not replace the approved application session/CSRF threat model.

### 10.5 Tenant-sensitive caching

The most important framework-specific security risk is accidental reuse of authenticated data across users/tenants.

Rules:

- do not publicly cache authenticated tenant responses,
- do not put Principal/capability decisions in a shared cache without an explicit safe key/invalidation model,
- any cached tenant DTO must be scoped by all authority-relevant dimensions and must not outlive acceptable revocation semantics,
- tests must cover Tenant A then Tenant B requests through reused runtime/cache paths,
- a framework cache is never a permission system.

Because `D-ARCH-008` remains OPEN, this ADR does not add Redis solely to coordinate Next.js caches. Avoiding shared dynamic application caching is a valid Phase 1 baseline.

### 10.6 Browser security headers

The implementation must support security headers appropriate to the final origin and content model, including an evaluated posture for CSP, framing/clickjacking protection, MIME sniffing controls, referrer policy, transport security, and permissions policy as applicable.

Exact header values remain implementation/security configuration and are not invented here.

## 11. Reliability, Performance, and Scalability Impact

### 11.1 Reliability

The framework must not own correctness guarantees for attendance, payments, membership, retention, or audit.

Reliability remains in:

- application/domain invariants,
- idempotency,
- transactions and database constraints,
- provider verification,
- durable continuation/job architecture,
- reconciliation.

Framework retries, re-renders, prefetches, navigation, or form re-submission must not duplicate business effects.

### 11.2 Performance

The staff application should optimize for operational responsiveness rather than maximum static-generation metrics.

Required practices include:

- server-side search/filter/pagination for large member/queue datasets,
- bounded response DTOs,
- avoid shipping large hidden datasets to the browser,
- code-split/browser-load interactive code intentionally,
- keep Server/Client component boundaries narrow enough to avoid unnecessary hydration,
- measure queue/dashboard page behavior with pilot-scale and representative datasets,
- treat expensive dashboard aggregation as a query/read-model concern, not a component-rendering problem.

### 11.3 Caching and freshness

Operational state such as payment exceptions, membership eligibility, no-show queues, assignments, and permissions can change while a user has the application open.

Caching policy must classify data by required freshness. Stale UI may exist briefly for presentation, but protected mutations always validate current canonical state.

Where Next.js revalidation/cache features are used across multiple runtime instances, the selected hosting architecture must validate invalidation consistency. Current official self-hosting documentation notes that multi-instance cache/tag coordination can require shared coordination. This ADR does not choose that infrastructure and does not require such dynamic shared caching for Phase 1.

### 11.4 Horizontal scalability

Next.js can run in horizontally scaled server deployments when the selected host supports the required runtime model. GymPulse must not store canonical business, session-revocation, or idempotency truth only in one web process's memory.

`D-ARCH-009` and `D-ARCH-006` remain responsible for the final deployment shape.

## 12. Operations and Observability Impact

### 12.1 Deployment neutrality

Current official Next.js documentation supports a full-feature Node.js server and Docker deployment, with additional platform adapters. This is compatible with the proposed Node direction without selecting any hosting provider.

No Vercel-specific capability may become required canonical business logic unless a later provider/hosting decision explicitly accepts that coupling.

### 12.2 Observability

The framework must propagate GymPulse request/correlation context through:

```text
browser request
Next.js server/render/adapter
trusted application/API
provider calls / durable continuations where applicable
protected telemetry
```

Current Next.js instrumentation supports server instrumentation and OpenTelemetry-compatible integration. Use of that capability remains provider-neutral; `D-PROVIDER-006` stays OPEN.

Browser monitoring must minimize PII and never capture secrets, session tokens, unrestricted form payloads, internal follow-up notes, or payment credentials.

### 12.3 Error behavior

Expected authorization/business/validation failures use the stable error semantics from ADR-0011/application contracts and are rendered as recoverable UI states.

Unexpected framework/render/runtime failures should reach protected error monitoring with request/correlation identity while the browser receives a safe error boundary/state.

### 12.4 Preview and staging

If previews are later enabled, they must not receive production secrets or production data by default. Staging remains the production-like integration environment for session, authorization, payment sandbox, queue/dashboard, browser compatibility, and security validation.

This ADR does not choose a CI or hosting product.

## 13. Accessibility and UX Impact

Next.js/React do not automatically make application UI accessible. GymPulse must still implement accessible interaction semantics.

Required application behaviors include:

- semantic HTML before custom ARIA abstractions where possible,
- associated form labels and clear validation errors,
- keyboard-operable member search, tables, menus, dialogs, and actions,
- predictable focus movement after navigation/dialog/error state changes,
- visible focus indicators,
- critical state not conveyed by color alone,
- accessible loading/progress/error feedback,
- confirmation and clear reason capture for sensitive operations where required,
- table/list alternatives or responsive layouts when dense tables become unusable at smaller staff-device sizes.

The exact accessibility conformance target remains Open under `NFR-ACCESSIBILITY-003`.

## 14. Testing and Validation

Acceptance requires non-production validation of the framework architecture, not merely successful rendering.

### 14.1 Build and boundary validation

- production build succeeds using the supported framework/runtime line,
- server-only modules/secrets do not enter browser bundles,
- Client Components do not import database/provider/server-config modules,
- application/domain packages remain usable/testable without importing Next.js,
- ADR-0011 contract schemas/types remain independent of framework request objects.

### 14.2 Authentication/session validation

- protected route/page with valid session,
- missing/expired/invalid session behavior,
- current-session logout,
- disabled/revoked staff access denied on subsequent protected operation,
- session rotation/fixation controls when final session design is selected,
- cookie and CSRF behavior under the deployed origin/topology,
- browser JavaScript cannot read `HttpOnly` session material.

### 14.3 Authorization and tenancy validation

- Owner/Manager/Front Desk capability/scope matrix positive and negative tests,
- hidden UI does not permit direct unauthorized operation invocation,
- Branch A staff cannot access Branch B through route manipulation or filters,
- Tenant A -> Tenant B navigation/request/cache reuse does not leak data,
- a stale page after capability revocation cannot perform the protected operation,
- sensitive actions preserve actor/reason/audit context.

### 14.4 Framework rendering/cache validation

- Server and Client Component boundaries behave as intended,
- private tenant data is not emitted into static/public output,
- authenticated/private content is not cross-user cached,
- multi-instance cache/revalidation behavior is tested if those features are used,
- loading/error/not-found boundaries do not expose protected information,
- hydration/navigation does not duplicate mutations or side effects.

### 14.5 Operational UX validation

- member search remains responsive on representative pilot-scale data,
- large no-show/renewal/payment queues use bounded server-side pagination/filtering,
- front-desk keyboard workflow is usable without excessive pointer interaction,
- dashboard drill-down reaches the underlying authorized records,
- loading, empty, forbidden, validation, business-conflict, dependency-failure, and retry states are covered,
- network timeout after critical mutation uses idempotent recovery rather than creating a new business effect.

### 14.6 Accessibility validation

- keyboard navigation/focus tests for critical workflows,
- automated semantic/accessibility checks where useful,
- manual screen-reader/keyboard review for representative flows,
- critical status and validation errors are understandable without color alone.

### 14.7 Observability validation

- browser and server errors correlate with request ID where practical,
- safe route/use-case telemetry exists without secrets/unnecessary PII,
- failed protected server operations are diagnosable without exposing stack traces to the browser,
- source maps/debug artifacts follow the selected release/security policy.

Exact testing products remain under `D-ARCH-018`.

## 15. Migration and Rollout

No application scaffold exists as a consequence of this ADR.

If accepted later, implementation should proceed in bounded steps:

1. pin a supported Next.js/React version according to dependency policy rather than this ADR,
2. establish server-only/client-safe package and import boundaries,
3. establish the base authenticated shell/navigation without embedding authorization truth in navigation,
4. implement one representative read flow such as member search through the application/API contract,
5. implement one representative sensitive mutation such as assisted attendance through the same authorization/domain/audit boundaries,
6. validate session/CSRF/origin behavior in the target topology,
7. validate tenant-sensitive caching and browser bundle secret isolation,
8. validate representative dashboard/queue performance and accessibility,
9. integrate provider-neutral observability hooks,
10. expand only after architecture/security tests are green.

Do not introduce live payment/messaging providers or production secrets merely to scaffold the web application.

## 16. Reversibility

Reversibility is **Medium**.

Replacing a mature web UI framework is expensive because route conventions, rendering/data-loading patterns, component composition, test harnesses, and deployment behavior accumulate framework coupling.

The decision remains materially more reversible when GymPulse keeps these assets outside the framework boundary:

```text
application commands / queries
domain rules
runtime contract schemas / DTOs
capability authorization semantics
provider ports
persistence ports
business clock
idempotency semantics
audit semantics
```

A later migration can then replace the presentation/adapter layer while retaining business/security behavior.

## 17. Risks and Mitigations

### Risk: Next.js convenience becomes the architecture

**Mitigation:** enforce thin page/route/action adapters, framework-independent application/domain modules, and ADR-0011 contracts.

### Risk: cross-tenant/private data cached by framework features

**Mitigation:** private-by-default authenticated data, explicit cache review, scoped cache keys only when justified, negative Tenant A/Tenant B tests, and avoid shared dynamic caches until needed.

### Risk: Server Actions bypass canonical API/security semantics

**Mitigation:** treat them as untrusted transport adapters; runtime-validate, authorize, invoke the same application command, and preserve idempotency/audit requirements.

### Risk: Server Component serialization leaks private/internal fields

**Mitigation:** explicit purpose-specific DTO mapping; do not serialize database/domain/provider objects wholesale.

### Risk: authorization implemented only in navigation/layout/middleware

**Mitigation:** application-level operation/resource authorization remains mandatory; UI guards are UX optimization only.

### Risk: browser session security is coupled to framework defaults

**Mitigation:** keep session architecture under `D-ARCH-004`/`D-SEC-004`; explicitly test cookie, CSRF, logout, revocation, and origin behavior.

### Risk: Next.js deployment features create provider lock-in

**Mitigation:** use portable framework capabilities first, preserve Node/Docker-compatible deployment, and require separate governance for hosting/provider-specific dependencies.

### Risk: React/Next upgrades alter rendering/cache/security behavior

**Mitigation:** pin implementation versions after approval, review upgrade notes, run production-build/security/cache/session/browser E2E checks before upgrade rollout.

### Risk: large client bundle or over-hydration reduces front-desk responsiveness

**Mitigation:** narrow Client Component boundaries, code split heavy interactive areas, server-side pagination, measure bundles and representative workflows.

### Risk: framework rendering hides stale business state

**Mitigation:** canonical mutation validation always reloads/checks current server state; UI conflicts use stable `409`/business errors and refresh/reconciliation.

## 18. Open Questions

The following remain outside this ADR:

- final authentication provider and exact staff session implementation (`D-ARCH-004`),
- exact session/device/revocation policy (`D-SEC-004`),
- co-hosted versus independently deployed trusted API (`D-ARCH-006`),
- final hosting platform/runtime topology (`D-ARCH-009`),
- exact testing toolchain (`D-ARCH-018`),
- CI/CD and production secrets tooling (`D-ARCH-019`),
- observability provider (`D-PROVIDER-006`),
- exact browser support matrix (`NFR-COMPATIBILITY-001`),
- formal accessibility conformance target (`NFR-ACCESSIBILITY-003`),
- UI component/design system,
- form/table/query-state libraries,
- CSS/styling solution,
- precise CSP policy,
- whether any Next.js shared application cache is needed in Phase 1,
- whether Server Functions are used at all for business mutations versus HTTP-only adapters,
- member web/PWA/native delivery architecture (`D-ARCH-013`).

## 19. Decision Evidence

Evidence currently supporting the proposal:

- canonical product requirements define a browser-oriented Owner/Manager/Front Desk operational surface with search, forms, action queues, dashboards, and sensitive mutations,
- canonical architecture requires client/server trust separation and keeps domain/application logic framework-independent,
- `ADR-0011` proposes a framework-independent JSON HTTP contract that Next.js can consume or host through thin adapters,
- `ADR-0007` proposes a first-party secure-cookie-compatible staff web session posture that a server-capable framework can support,
- `ADR-0009` keeps authorization in GymPulse application state rather than framework middleware/UI roles,
- technology evaluation already identified Next.js + React + TypeScript as the leading candidate,
- current official Next.js documentation provides App Router, Server/Client Components, Server Functions, Route Handlers, authentication/data-security guidance, Node/Docker deployment support, CSP guidance, and instrumentation/OpenTelemetry hooks,
- current React Router documentation provides a credible alternative with Framework/Data/Declarative modes, route loaders/actions, CSR/SSR/pre-rendering, and portable deployment templates,
- current Vite SSR guidance treats Vite's direct SSR API as a low-level capability and points application authors toward higher-level frameworks/plugins, reinforcing that a hand-assembled SSR stack adds project responsibility without a current GymPulse need.

Evidence still missing for acceptance:

- authorized decision owner and explicit approval,
- one representative staff workflow spike or implementation validation,
- final authentication/session integration compatibility,
- target hosting/runtime compatibility,
- tenant-cache isolation tests,
- accessibility/browser validation on representative staff devices,
- production-build/bundle/server-only boundary validation,
- evidence that the chosen deployment mapping satisfies webhook/job/observability constraints.

Therefore this ADR remains `Proposed`.

### Current official framework research

Research date: `2026-09-11`.

Official material reviewed:

- Next.js documentation and current latest-version page: `https://nextjs.org/docs`
- Next.js App Router: `https://nextjs.org/docs/app`
- Next.js Server and Client Components: `https://nextjs.org/docs/app/getting-started/server-and-client-components`
- Next.js Authentication guide: `https://nextjs.org/docs/app/guides/authentication`
- Next.js Data Security guide: `https://nextjs.org/docs/app/guides/data-security`
- Next.js Content Security Policy guide: `https://nextjs.org/docs/app/guides/content-security-policy`
- Next.js self-hosting and deployment guidance: `https://nextjs.org/docs/app/guides/self-hosting`, `https://nextjs.org/docs/app/getting-started/deploying`
- Next.js Instrumentation/OpenTelemetry guidance: `https://nextjs.org/docs/app/guides/instrumentation`, `https://nextjs.org/docs/app/guides/open-telemetry`
- React Server Components: `https://react.dev/reference/rsc/server-components`
- React Server Functions security semantics: `https://react.dev/reference/rsc/use-server`
- React Router modes/actions/rendering/deployment: `https://reactrouter.com/start/modes`, `https://reactrouter.com/start/framework/actions`, `https://reactrouter.com/start/framework/rendering`, `https://reactrouter.com/start/framework/deploying`
- React Router changelog/current stable line: `https://reactrouter.com/changelog`
- Vite SSR guidance: `https://vite.dev/guide/ssr`

Current documentation observed during research reported Next.js `16.3.4` as the latest documented release and React Router `8.2.0` as the latest changelog release. These versions are **research evidence only** and are not pinned or accepted by this ADR.

## 20. Acceptance Criteria

Before this ADR can become `Accepted`:

1. `D-ARCH-012` has an identified authorized decision owner.
2. The owner explicitly approves the framework direction and approval evidence is recorded.
3. `D-ARCH-016` is resolved compatibly or the framework implementation language/runtime dependency is explicitly reconciled.
4. Authentication/session architecture can implement the required secure browser posture without weakening `ADR-0007` security requirements.
5. Authorization remains operation/resource based and does not depend on layout/Proxy/UI-only checks.
6. A representative read workflow and sensitive mutation validate framework/application boundaries.
7. Server-only/client-safe dependency and secret-leak checks pass.
8. Tenant A/Tenant B cache/rendering isolation tests pass for any enabled framework cache behavior.
9. Browser/accessibility tests cover representative Owner and Front Desk workflows.
10. The framework can preserve ADR-0011 contracts under both plausible `D-ARCH-006` deployment mappings or the later accepted topology explicitly narrows that requirement.
11. Observability/error propagation works without exposing secrets/PII.
12. `docs/00-overview/assumptions.md` is synchronized to `DECIDED` only when acceptance actually occurs.

## 21. Related Documents

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
- `ADR-0002-primary-language-runtime.md`
- `ADR-0003-monorepo-strategy.md`
- `ADR-0007-authentication-session-architecture.md`
- `ADR-0009-authorization-implementation.md`
- `ADR-0011-api-contract-architecture.md`
- legacy migration source: `../05-system-architecture.md`
- legacy migration source: `../07-api-contracts.md`
- legacy migration source: `../15-engineering-workflow.md`
- legacy migration source: `../16-open-decisions.md`
