# Task 0020: Draft Owner / Staff Web Application Framework ADR

## Goal

Draft one `Proposed` ADR for canonical architecture decision `D-ARCH-012`, evaluating the Owner/Staff web framework against current GymPulse product, security, API-contract, authentication/session, authorization, accessibility, testing, observability, deployment-neutrality, and operational requirements without creating application scaffolding or accepting any prior decision.

Canonical target:

`docs/adr/ADR-0012-owner-staff-web-framework.md`

## Inputs Read

Current structured repository inputs reviewed from latest `main`:

- `.ai/README.md`
- `.ai/current-state.md`
- `.ai/task/0019-draft-api-contract-architecture-adr.md`
- `docs/README.md`
- `docs/00-overview/assumptions.md`
- `docs/01-product/functional-requirements.md`
- `docs/01-product/non-functional-requirements.md`
- `docs/01-product/user-roles.md`
- `docs/01-product/personas.md`
- `docs/01-product/user-journeys.md`
- `docs/02-architecture/architecture-principles.md`
- `docs/02-architecture/architecture-overview.md`
- `docs/02-architecture/container-architecture.md`
- `docs/02-architecture/component-architecture.md`
- `docs/02-architecture/data-flow.md`
- `docs/02-architecture/technology-stack.md`
- `docs/adr/README.md`
- `docs/adr/ADR-0007-authentication-session-architecture.md`
- `docs/adr/ADR-0009-authorization-implementation.md`
- `docs/adr/ADR-0011-api-contract-architecture.md`

Legacy migration/evidence inputs reviewed without treating them as canonical:

- `docs/05-system-architecture.md`
- `docs/07-api-contracts.md`
- `docs/15-engineering-workflow.md`
- `docs/16-open-decisions.md`

External official research was limited to current Next.js, React, React Router, and Vite documentation needed to compare framework architecture, rendering/server-client boundaries, authentication/data-security guidance, deployment portability, observability, CSP, and alternative React framework models.

## Repository State Verified

Before creating ADR-0012:

- `docs/adr/ADR-0012-owner-staff-web-framework.md` did not exist on current `main`.
- `.ai/task/0020-draft-owner-staff-web-framework-adr.md` did not exist.
- `D-ARCH-012` remained the next bounded ADR item after ADR-0011.
- `D-ARCH-012` remained `P0 PROPOSED` in `docs/00-overview/assumptions.md`.
- the canonical register described Next.js + TypeScript as a candidate recommendation only.
- repository search found no explicit approval evidence promoting `D-ARCH-012` to `DECIDED` or accepting an Owner/Staff web framework ADR.
- no current ADR was `Accepted`.
- `D-ARCH-016` remained `PROPOSED`; TypeScript/Node.js was not accepted.
- `D-ARCH-003` remained `PROPOSED`; ADR-0011 remained only Proposed.
- `D-ARCH-004` remained `OPEN`; authentication/session remained separately governed.
- `D-SEC-004` remained `OPEN`; exact session/device/revocation policy remained open.
- `D-ARCH-015` remained `PROPOSED`; application authorization remained mandatory and framework-independent.
- `D-ARCH-006` remained `OPEN`; co-hosted versus independently deployed API/runtime remained unresolved.
- `D-ARCH-007`, `D-ARCH-009`, `D-ARCH-019`, and `D-PROVIDER-006` remained separately governed.
- no Owner/Staff application scaffold or framework dependency was present/accepted as decision evidence.

## Canonical Decision State

```text
D-ARCH-012
Priority: P0
Status: PROPOSED
Decision: Owner/Staff web application framework
Current direction: Next.js + TypeScript is a candidate recommendation only
```

`ADR-0012` is drafted as `Proposed`. Task 0020 does not change `D-ARCH-012` to `DECIDED`.

## Product / UX Drivers

The Owner/Staff web application is an authenticated operational application centered on:

```text
member search and summary
membership / plan operations
assisted attendance and correction
retention / no-show queues
follow-up recording and assignment
renewal pipeline
payment exception review
add-on fulfillment
owner dashboard + drill-down
data-quality queues
authorized audit views
configuration / permission-sensitive actions
controlled import / reconciliation
```

The Owner persona needs prioritized action queues and drill-down rather than decorative charts. The Front Desk persona operates under time pressure and needs keyboard-friendly search, compact member context, explicit eligibility/blocked reasons, and safe reason-required sensitive actions.

SEO is not a primary Phase 1 driver for the authenticated staff surface.

## Existing Architecture Boundaries Preserved

Mandatory separations:

```text
Web Framework != Authorization Boundary
Web Framework != Domain/Application Architecture
Web Framework != API Deployment Topology
UI Visibility != Authorization
Server Component != Domain Service
Server Action/Function != Trusted Business Rule
Route Handler != Application Architecture
Client State != Canonical Business Truth
```

Presentation owns rendering, navigation, forms, local interaction, accessibility behavior, request invocation, loading/error states, filters, and formatting.

The trusted application boundary remains responsible for Principal resolution, tenant/resource scope, capability authorization, runtime contract validation, application/domain logic, transactions, canonical persistence, idempotency, audit, and safe response translation.

## Architecture Options Evaluated

1. **Next.js App Router + React**.
2. **React Router Framework Mode + React**.
3. **React SPA + Vite + client routing with a separately deployed trusted API**.
4. **Another mature non-React full-stack/server-rendered framework**.

The evaluation considered:

- forms/tables/action queues,
- staff operational responsiveness,
- server/client boundaries,
- compatibility with ADR-0011,
- co-hosted and independent API mappings,
- authentication/session posture,
- operation-level authorization,
- tenant-sensitive caching,
- server-only/client-safe dependency boundaries,
- observability,
- accessibility,
- browser E2E suitability,
- deployment portability,
- framework/business coupling,
- Phase 1 operational simplicity,
- future reversibility.

Next.js App Router is the strongest current fit. React Router Framework Mode is the strongest current alternative. A Vite SPA remains a credible topology-dependent fallback if `D-ARCH-006` later clearly prefers a separate API and full-stack framework features add little value.

## Proposed Direction

ADR-0012 proposes:

```text
Next.js App Router + React
+
strict TypeScript only if D-ARCH-016 is later accepted compatibly
+
Server Components by default for non-interactive composition
+
narrow Client Component boundaries for browser interactivity
+
Server Functions/Actions and Route Handlers as thin adapters only
+
ADR-0011 JSON HTTP preserved as the primary independently consumable contract
+
operation/resource authorization independent of framework routing or UI
+
private-by-default tenant-sensitive data and cache discipline
+
server-only/client-safe module boundaries
+
deployment neutrality between co-hosted and independent API mappings
```

This proposal does not accept Next.js, React, TypeScript, Node.js, Vercel, an API topology, an authentication provider, a UI library, a state/query library, a test framework, or an observability provider.

## Server / Client Boundary

For the proposed App Router direction:

- Server Components are the default for page/layout composition and non-interactive server-rendered presentation.
- Client Components are introduced only where browser state, events, effects, or browser-only APIs require them.
- `use client` boundaries should remain narrow.
- data passed to Client Components is treated as a public serialization boundary and must be a purpose-specific authorized DTO.
- database rows, provider objects, secrets, session credentials, authorization internals, and unrestricted domain objects must not cross the client boundary.

Server Components remain presentation/framework code; they do not own GymPulse application/domain rules.

## Server Functions / Route Handlers

Server Functions/Actions are network-reachable mutation entry points and therefore remain untrusted at their arguments.

They must:

```text
runtime-validate input
verify current session / Principal
authorize current scope/resource/capability
invoke application command/query
preserve idempotency when required
return safe presentation/application errors
```

Route Handlers may implement ADR-0011 HTTP adapters if a co-hosted topology is later accepted, but they remain thin and framework-specific request/response objects stop at the transport boundary.

## Authentication / Session Relationship

`ADR-0007` remains Proposed and `D-ARCH-004` remains OPEN.

ADR-0012 is compatible with the current leading staff-web posture:

- first-party server-mediated secure-cookie-compatible session transport,
- `HttpOnly` where compatible,
- `Secure` in production,
- deliberate `SameSite`/host/path scope,
- logout and provider/session invalidation where supported,
- session fixation/rotation protection,
- explicit CSRF protection for cookie-authenticated mutations,
- no long-lived reusable browser bearer token in `localStorage` as the baseline.

Framework cookie APIs do not decide authentication/session policy.

## Authorization Relationship

Protected reads and mutations continue through the application authorization model:

```text
Principal
+ current account eligibility
+ trusted tenant/resource scope
+ named capability / permitted relationship
+ trusted resource relationship
-> allow / deny
```

Framework route guards, layouts, middleware/Proxy, Server Components, Server Actions, hidden buttons, and client role flags may improve UX but are not authoritative security controls.

A stale rendered page must not preserve authority after account/scope/capability revocation.

## Tenant-Sensitive Cache Posture

The main framework-specific security risk is accidental cross-user/cross-tenant reuse of authenticated data.

Proposed rules:

- authenticated tenant data is private by default,
- no public/shared cache merely because the operation is read-only,
- Principal/capability decisions are not placed in shared cache without explicit safe-key/invalidation/revocation evidence,
- any cached tenant DTO must be scoped by all authority-relevant dimensions,
- Tenant A -> Tenant B runtime/cache reuse requires negative tests,
- framework caching is never an authorization system,
- `D-ARCH-008` remains OPEN; this ADR does not add Redis solely for Next.js caching.

Avoiding shared dynamic application caching is a valid Phase 1 baseline.

## Security Findings

Primary risks addressed:

- server secrets leaking into browser bundles,
- Server Component serialization over-exposing private/internal data,
- Server Actions bypassing normal contract/authz/domain boundaries,
- authorization implemented only in layouts/middleware/navigation,
- tenant-sensitive framework cache leakage,
- cookie session without complete CSRF posture,
- XSS invoking authenticated actions even when cookies are `HttpOnly`,
- provider SDK/database clients imported into client components,
- framework defaults becoming canonical business logic,
- provider-specific hosting capabilities becoming accidental lock-in.

CSP and security headers are required implementation/security work but exact directives are not invented by this ADR.

## Reliability / Performance Findings

Framework rendering does not provide business correctness. Attendance/payment/membership/retention integrity still comes from application/domain rules, idempotency, transactions, constraints, provider verification, durable continuation, and reconciliation.

Operational performance posture:

- server-side search/filter/pagination for large datasets,
- bounded DTOs,
- no hidden bulk dataset transfer to browser,
- narrow Client Component/hydration boundaries,
- representative pilot-scale queue/dashboard measurement,
- expensive aggregates belong to query/read-model design, not component rendering hacks.

Framework re-render/navigation/form retries must not duplicate business effects.

## Accessibility Findings

Next.js/React do not make an interface accessible automatically.

Required validation includes:

- semantic HTML,
- labels and clear validation errors,
- keyboard-operable search/tables/menus/dialogs/actions,
- predictable focus behavior,
- visible focus,
- no color-only critical status,
- accessible loading/progress/error states,
- representative manual keyboard/screen-reader review.

`NFR-ACCESSIBILITY-003` formal conformance target remains Open.

## Current Official Framework Research

Research date: `2026-09-11`.

Official material reviewed:

- `https://nextjs.org/docs`
- `https://nextjs.org/docs/app`
- `https://nextjs.org/docs/app/getting-started/server-and-client-components`
- `https://nextjs.org/docs/app/guides/authentication`
- `https://nextjs.org/docs/app/guides/data-security`
- `https://nextjs.org/docs/app/guides/content-security-policy`
- `https://nextjs.org/docs/app/guides/self-hosting`
- `https://nextjs.org/docs/app/getting-started/deploying`
- `https://nextjs.org/docs/app/guides/instrumentation`
- `https://nextjs.org/docs/app/guides/open-telemetry`
- `https://react.dev/reference/rsc/server-components`
- `https://react.dev/reference/rsc/use-server`
- `https://reactrouter.com/start/modes`
- `https://reactrouter.com/start/framework/actions`
- `https://reactrouter.com/start/framework/rendering`
- `https://reactrouter.com/start/framework/deploying`
- `https://reactrouter.com/changelog`
- `https://vite.dev/guide/ssr`

Material findings:

- current Next.js App Router documentation uses Server Components, Client Components, Server Functions, Route Handlers, and nested rendering/loading/error conventions,
- current Next.js security guidance separates authentication, session management, authorization, data access, and DTO concerns rather than treating route middleware as complete authorization,
- current Next.js self-hosting guidance supports a full-feature Node.js server/Docker path and documents multi-instance cache coordination concerns,
- Next.js instrumentation supports provider-neutral server instrumentation/OpenTelemetry integration,
- React documents Server Functions as server-side functions callable from client code through framework-generated network interaction and therefore subject to input/security concerns,
- React Router provides Declarative, Data, and Framework modes with loaders/actions plus CSR/SSR/pre-rendering and portable deployment models,
- current React Router RSC integration remains documented as unstable/experimental and is not required by this proposal,
- Vite documents its raw SSR API as a low-level capability and points application authors toward higher-level framework/plugin approaches for SSR applications.

Research observed Next.js `16.3.4` and React Router `8.2.0` in current official documentation/changelog. These values are evidence only and are not pinned or accepted.

## Validation Required Before Acceptance

Required non-production evidence includes:

- production framework build and browser bundle inspection,
- server-only/client-safe dependency checks,
- representative authenticated protected page,
- missing/expired/revoked session handling,
- logout and final CSRF/origin behavior,
- Owner/Manager/Front Desk authorization matrix positive/negative tests,
- Branch A -> Branch B and Tenant A -> Tenant B negative tests,
- stale page after permission revocation cannot perform protected action,
- sensitive action actor/reason/audit preservation,
- no tenant/private data in static/public output,
- cache/render isolation across user/tenant reuse,
- representative member-search and large queue responsiveness,
- loading/empty/forbidden/validation/conflict/dependency/retry UX states,
- idempotent timeout recovery for critical mutations,
- keyboard/focus/accessibility validation,
- request/error correlation through browser/server/trusted API path,
- webhook/raw-body compatibility if co-hosted topology is later chosen,
- proof of independent API extraction seam if co-hosted initially.

No tests were implemented by Task 0020.

## Decisions Kept Separate

Task 0020 does not decide or accept:

```text
D-ARCH-016 primary language/runtime
D-ARCH-003 API contract architecture
D-ARCH-004 authentication/session provider/implementation
D-SEC-004 exact session lifecycle/device policy
D-ARCH-015 authorization implementation acceptance
D-SEC-008 RLS/data-layer isolation
D-ARCH-006 API deployment topology
D-ARCH-007 background job technology
D-ARCH-009 hosting/deployment provider
D-ARCH-014 managed backend responsibilities
D-ARCH-018 testing toolchain
D-ARCH-019 CI/CD + release/secrets tooling
D-PROVIDER-006 observability provider
D-ARCH-013 Member client delivery/framework
```

It also does not select a UI component library, CSS system, form library, table library, query-state library, client state library, CSP directive set, browser matrix, or accessibility conformance level.

## Requirement IDs Referenced

Verified canonical IDs used by ADR-0012 include:

```text
FR-IDENTITY-001
FR-IDENTITY-002
FR-AUTHZ-001
FR-AUTHZ-002
FR-AUTHZ-004
FR-MEMBER-005
FR-PLAN-001..003
FR-MEMBERSHIP-001..007
FR-ATTENDANCE-007..011
FR-RETENTION-001..007
FR-FOLLOWUP-001..006
FR-RENEWAL-001..007
FR-PAYMENT-001..010
FR-ADDON-001..008
FR-DASHBOARD-001..004
FR-AUDIT-001..003
FR-DATA-QUALITY-001..002
FR-IMPORT-001..002
FR-CROSS-001..004

NFR-SECURITY-001..005
NFR-SECURITY-009..011
NFR-PRIVACY-001
NFR-PRIVACY-003
NFR-PERFORMANCE-002..004
NFR-UX-002..003
NFR-ACCESSIBILITY-001..003
NFR-COMPATIBILITY-001
NFR-MAINTAINABILITY-001..002
NFR-MAINTAINABILITY-005..006
NFR-TESTABILITY-001..005
NFR-OBSERVABILITY-001..007
NFR-OPERATIONS-001..005
```

No new requirement ID was invented.

## Files Changed

Created:

```text
docs/adr/ADR-0012-owner-staff-web-framework.md
.ai/task/0020-draft-owner-staff-web-framework-adr.md
```

Governance synchronization updates:

```text
docs/adr/README.md
docs/README.md
.ai/current-state.md
```

## Explicitly Not Created / Selected

```text
No Next.js application scaffold
No React application scaffold
No package.json dependency change
No Next.js config
No TypeScript config
No application route/page/layout
No Server Action/Function
No Route Handler
No UI component library
No CSS framework
No form/table/query-state library
No auth integration
No session implementation
No CSRF implementation
No API implementation
No database access code
No direct browser database access
No migration
No RLS policy
No worker/job implementation
No hosting provider
No Vercel project/config
No CI workflow
No observability provider
No test framework installation
No production secret/config
No prior ADR promotion to Accepted
No D-ARCH-012 promotion to DECIDED
```

## Result

Task 0020 produces a review-ready framework proposal while preserving every unresolved platform/security decision.

Current direction:

```text
Next.js App Router + React
  as Owner/Staff presentation framework

ADR-0011 JSON HTTP
  remains the independently consumable client/server contract

GymPulse application/domain/security modules
  remain framework-independent

D-ARCH-006
  remains OPEN for co-hosted vs independent API deployment
```

`ADR-0012` remains `Proposed`; canonical `D-ARCH-012` remains `PROPOSED`.

## Next Recommended Task

After governance synchronization, the next bounded ADR item is expected to be:

```text
Task 0021: Draft Member Client Framework / Delivery ADR
Primary decision: D-ARCH-013
Likely target: docs/adr/ADR-0013-member-client-strategy.md
Initial ADR status: Proposed
```

The next task should compare responsive web/PWA and native/Expo/React Native delivery against the validated member journeys, QR/camera needs, authentication/session model, install friction, notification/offline requirements, accessibility, supported-client policy, and ADR-0011 contract boundary without accepting native delivery merely because Expo/React Native appears in legacy recommendations.

Do not execute Task 0021 as part of Task 0020.
