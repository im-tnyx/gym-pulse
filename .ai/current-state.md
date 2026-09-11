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

## Task 0020 Implementation Status

Task `0020-draft-owner-staff-web-framework-adr` completed documentation/governance work only.

Created:

```text
docs/adr/ADR-0012-owner-staff-web-framework.md
.ai/task/0020-draft-owner-staff-web-framework-adr.md
```

Updated:

```text
docs/adr/README.md
docs/README.md
.ai/current-state.md
```

Explicitly not created/selected:

```text
No Next.js/React application scaffold
No package/dependency installation
No Next.js/TypeScript config
No page/layout/component
No Server Function/Action
No Route Handler
No auth/session integration
No CSRF implementation
No API implementation
No database access code
No migration/RLS policy
No worker/job implementation
No hosting provider or Vercel project
No CI workflow
No observability provider
No test framework installation
No production secret/config
No TypeScript/Node acceptance
No API deployment topology selection
No D-ARCH-012 promotion to DECIDED
No previous ADR promotion to Accepted
```

## Last Completed Task

`0020-draft-owner-staff-web-framework-adr`

```text
ADR-0012 Status: Proposed
D-ARCH-012 canonical status: PROPOSED
D-ARCH-013 canonical status: PROPOSED
D-ARCH-006 canonical status: OPEN
D-ARCH-004 canonical status: OPEN
D-ARCH-016 canonical status: PROPOSED
```

The Owner/Staff web framework direction is not accepted or implemented merely because ADR-0012 exists.

## Current Task

None in progress.

## Next Task

Post-Task-0020 synchronization of the ADR dependency queue identifies the next bounded item as:

```text
Task 0021: Draft Member Client Framework / Delivery ADR
```

Primary canonical decision:

```text
D-ARCH-013
```

Likely target when explicitly started:

```text
docs/adr/ADR-0013-member-client-strategy.md
```

Initial ADR status should be `Proposed`. Canonical `D-ARCH-013` remains `PROPOSED` unless explicit review/approval changes it.

The next task should compare responsive web/PWA and native/Expo/React Native delivery against the validated Member journeys, QR/camera requirements, authentication/session model, installation friction, notification/offline requirements, accessibility, supported-client policy, ADR-0011 API contract, and current security boundaries.

It must not assume native delivery merely because Expo/React Native appears in legacy recommendations and must not create a Member application scaffold or accept prior ADRs.

Do not execute Task 0021 until explicitly requested.

## Files To Read Next

```text
.ai/README.md
.ai/current-state.md
.ai/task/0020-draft-owner-staff-web-framework-adr.md
docs/README.md
docs/00-overview/assumptions.md
docs/01-product/functional-requirements.md
docs/01-product/non-functional-requirements.md
docs/01-product/user-roles.md
docs/01-product/personas.md
docs/01-product/user-journeys.md
docs/02-architecture/architecture-principles.md
docs/02-architecture/architecture-overview.md
docs/02-architecture/container-architecture.md
docs/02-architecture/component-architecture.md
docs/02-architecture/data-flow.md
docs/02-architecture/technology-stack.md
docs/adr/README.md
docs/adr/ADR-0007-authentication-session-architecture.md
docs/adr/ADR-0008-member-authentication-method.md
docs/adr/ADR-0011-api-contract-architecture.md
docs/adr/ADR-0012-owner-staff-web-framework.md
legacy migration source: docs/05-system-architecture.md
legacy migration source: docs/07-api-contracts.md
legacy migration source: docs/15-engineering-workflow.md
legacy migration source: docs/16-open-decisions.md
```
