# Task 0022: Draft API Deployment Boundary ADR

## Goal

Draft one `Proposed` ADR for canonical decision `D-ARCH-006`, defining the recommended Phase 1 trusted HTTP/API deployment boundary without creating implementation or selecting hosting.

Target:

`docs/adr/ADR-0014-api-deployment-boundary.md`

## Inputs Read

Fresh latest-`main` canonical inputs:

- `.ai/README.md`
- `.ai/current-state.md`
- `.ai/task/0021-draft-member-client-strategy-adr.md`
- `docs/README.md`
- `docs/00-overview/assumptions.md`
- `docs/01-product/functional-requirements.md`
- `docs/01-product/non-functional-requirements.md`
- `docs/01-product/user-journeys.md`
- `docs/02-architecture/architecture-principles.md`
- `docs/02-architecture/architecture-overview.md`
- `docs/02-architecture/system-context.md`
- `docs/02-architecture/container-architecture.md`
- `docs/02-architecture/component-architecture.md`
- `docs/02-architecture/data-flow.md`
- `docs/02-architecture/technology-stack.md`
- `docs/adr/README.md`
- `docs/adr/ADR-0001-modular-monolith.md`
- `docs/adr/ADR-0002-primary-language-runtime.md`
- `docs/adr/ADR-0003-monorepo-strategy.md`
- `docs/adr/ADR-0005-data-access-migration-strategy.md`
- `docs/adr/ADR-0006-managed-backend-responsibilities.md`
- `docs/adr/ADR-0007-authentication-session-architecture.md`
- `docs/adr/ADR-0009-authorization-implementation.md`
- `docs/adr/ADR-0010-data-layer-tenant-isolation-rls.md`
- `docs/adr/ADR-0011-api-contract-architecture.md`
- `docs/adr/ADR-0012-owner-staff-web-framework.md`
- `docs/adr/ADR-0013-member-client-strategy.md`

Legacy evidence reviewed where useful:

- `docs/05-system-architecture.md`
- `docs/07-api-contracts.md`
- `docs/08-automations.md`
- `docs/12-security-audit.md`
- `docs/15-engineering-workflow.md`
- `docs/16-open-decisions.md`

External research was restricted to current official framework/runtime/browser/representative-hosting documentation materially relevant to topology constraints.

## Repository State Verified

Before creation:

- `docs/adr/ADR-0014-api-deployment-boundary.md` did not exist.
- `.ai/task/0022-draft-api-deployment-boundary-adr.md` did not exist.
- `D-ARCH-006` remained the exact next bounded ADR item after ADR-0013.
- canonical `D-ARCH-006` remained `P1 OPEN`.
- repository search found no explicit approval evidence promoting `D-ARCH-006` to `DECIDED`.
- no current decision ADR was `Accepted`.
- ADR-0011 remained `Proposed`.
- ADR-0012 remained `Proposed`.
- ADR-0013 remained `Proposed`.
- `D-ARCH-007` background jobs remained `OPEN`.
- `D-ARCH-009` hosting remained `OPEN`.
- `D-ARCH-004` authentication/session remained `OPEN`.
- no newer API implementation, hosting, infrastructure, or deployment decision superseded the current constraints.

## Canonical Decision State

```text
D-ARCH-006
Priority: P1
Status: OPEN
Decision: API deployment boundary
Question: co-host web-runtime API vs independently deployed API while preserving domain separation
```

ADR-0014 is `Proposed`. Task 0022 does not change `D-ARCH-006` to `DECIDED`.

## Existing API Contract Boundary

ADR-0011 remains Proposed and defines the independently consumable contract:

```text
versioned JSON over HTTPS
+
resource/query reads
+
explicit business-command actions
+
runtime trust-boundary validation
+
purpose-specific DTOs
+
stable machine-readable errors
+
bounded/cursor-oriented pagination
+
critical-mutation idempotency
+
provider-specific webhook verification
```

Task 0022 decides where the trusted transport/runtime executes, not contract semantics.

## Existing Web / Member Client Decisions

Owner/Staff:

```text
ADR-0012 Proposed
D-ARCH-012 PROPOSED
Next.js App Router + React is a candidate only
```

Member:

```text
ADR-0013 Proposed
D-ARCH-013 PROPOSED
responsive HTTPS web-first is proposed
future native remains evidence-triggered
```

Both clients require framework-independent trusted application semantics.

## Deployment Options Evaluated

1. Co-hosted Owner/Staff web + trusted API runtime.
2. Independent trusted API deployment.
3. Co-hosted-first with explicit extraction seam.
4. Client-specific BFF/split API topology.
5. Function-per-route/provider-function-heavy topology.

## Current Runtime / Framework Research

Research date: `2026-09-26`.

Current official Next.js sources reviewed:

- Deploying.
- Self-Hosting.
- Deploying to Platforms.
- Route Handlers.
- Backend for Frontend.
- Mutating Data / Server Functions.

Material findings:

- Next.js can run as a normal Node server/container or through platform adapters; no single hosting vendor is inherent.
- Route Handlers are external HTTP request handlers and therefore transport adapters, not trusted business methods.
- Server Functions/Actions are network-reachable POST operations and must not bypass authorization/business semantics.
- some hosting modes deploy route handlers as ephemeral/functions where shared memory/filesystem/runtime duration are constrained.
- multi-instance Next.js deployments introduce version, Server Function key, and cache-coordination concerns.
- none of these observations accepts Next.js or a compute model.

Current Node.js release-schedule material was reviewed only to confirm runtime support policies continue to evolve; no Node version was selected.

## Current Representative Hosting Research

Official Render documentation was reviewed only as representative topology evidence:

- public web services,
- separate background workers,
- health checks,
- deploy/rollback behavior,
- horizontal scaling/operational service types.

This research demonstrates common managed platforms can support both a co-hosted request-serving deployment and later separate worker/API deployment. Render was not selected or provisioned.

No Vercel, Render, Supabase, AWS, GCP, Azure, Fly.io, Railway, or other host was accepted.

## Evaluation Summary

Strongest Phase 1 fit:

```text
Co-hosted-first / explicitly extractable trusted API

Phase 1:
  Owner/Staff server deployment
    + thin /v1 HTTP adapters
    + provider callback adapters
    + shared trusted application runtime

Separate responsibility:
  background execution runtime
  exact job technology OPEN

Stable boundary:
  ADR-0011 remains externally consumable for Member web/future native

Future:
  extract API deployment only when measured evidence justifies it
```

This balances current simplicity against future separation without turning framework files into application/domain architecture.

Independent API from day one remains the strongest alternative if stronger isolation/release/scaling/security evidence emerges.

## Proposed Direction

Propose:

```text
Phase 1:
co-host trusted HTTP/API transport with Owner/Staff server runtime

while:
application/domain/security modules remain framework-independent
ADR-0011 /v1 remains stable/independently consumable
Member web and future native consume the same API
provider callbacks use bounded verification adapters
background workers remain separate
canonical truth is never process-local

later:
extract trusted API into independent deployment
without rewriting application/domain semantics
when evidence triggers it
```

This is a proposal only.

## Deployment Unit Model

Conceptual only:

```text
Deployable A:
  Owner/Staff presentation/server
  + /v1 HTTP transport
  + provider callback transport
  + trusted application runtime

Deployable B:
  durable worker runtime
  only after D-ARCH-007 is separately resolved

Administrative/release responsibility:
  migration runner/admin path
  separately privileged

Member web hosting:
  remains separately governed
```

No actual deployable or configuration was created.

## Framework Adapter Model

If Next.js is later accepted:

```text
Route Handler
-> raw-input preservation where required
-> runtime validation
-> authentication / Principal resolution
-> tenant/resource resolution
-> authorization
-> application command/query
-> domain/persistence/provider ports
```

Route Handler and Server Action remain adapters.

Owner/Staff server rendering may invoke the same application handlers directly in-process when appropriate, but may not create separate business semantics.

```text
Direct in-process call != separate implementation
```

## Member / Native Client Relationship

Member web and future native clients continue to use ADR-0011.

No Next.js-specific client protocol is allowed to replace the external API contract.

Physical deployment and public origin remain separate questions.

Potential mappings remain possible:

- same deployment / same origin,
- reverse-proxied same-site,
- separate Member web + shared API,
- cross-origin API with explicit security policy.

No hostnames/domains were chosen.

## Authentication / Cookie / Origin Findings

`D-ARCH-004` and `D-SEC-004` remain OPEN.

Co-hosting naturally supports a simple same-origin staff-web/API posture, but same-origin is not a mandatory physical topology.

Cookie concerns preserved:

- `HttpOnly` where applicable,
- `Secure`,
- deliberate `SameSite`,
- Domain/Path scope,
- logout/revocation,
- fixation/rotation,
- CSRF protection.

No cookie name/domain/TTL/provider was selected.

## CORS / CSRF Findings

Current MDN guidance confirms credentialed CORS must use explicit allowed origins rather than wildcard `*`.

Proposed posture if cross-origin browser access exists:

```text
explicit origins
environment-aware
least privilege
credential settings deliberate
```

CORS does not solve CSRF.

Cookie-authenticated mutations still require explicit CSRF defense. SameSite is defense in depth only.

No CORS/CSRF configuration was created.

## Webhook Boundary

Provider callbacks remain:

```text
external callback
-> preserve raw verification material
-> provider-specific authenticity verification
-> bounded parse/validation
-> canonical internal resource/tenant resolution
-> provider-event dedupe
-> correctness-sensitive transaction
-> durable continuation where needed
-> safe acknowledgement
```

Webhook authentication is not human-session authentication.

Runtime/body/duration/provider-retry constraints require later implementation validation.

## Background Worker Boundary

`D-ARCH-007` remains OPEN.

Preserved seam:

```text
HTTP request runtime
!=
durable background execution
```

Request handlers must not depend on process-memory timers or fire-and-forget promises for durable critical work.

No queue/job/scheduler/Cron technology was selected.

## Database / RLS Implications

`D-ARCH-002`, `D-ARCH-017`, and `D-SEC-008` remain separately governed.

Topology must support:

- pool/connection management,
- horizontal replicas,
- local transactions,
- worker DB connections,
- safe transaction-scoped tenant context if RLS is later accepted,
- separate migration/admin credentials.

Tenant identity must never live in mutable process-global state.

Normal request runtime must not be schema owner.

## Secret Boundary

Server-only categories include DB runtime credentials, Auth server credentials, provider secrets, webhook secrets, messaging secrets, observability credentials, and migration/admin credentials.

Browser bundles receive none.

Co-hosting increases the importance of client/server dependency enforcement; independent deployment does not remove secret-management obligations.

## Failure-Domain Findings

Co-hosting shares web/API resource and failure domains.

Potential Phase 1 consequence:

- rendering regression can impact API,
- API issue can impact staff web,
- webhook surge can compete with interactive traffic.

Independent API improves some isolation but introduces a new network/service/release/observability boundary.

Current evidence favors simpler shared Phase 1 request runtime plus explicit extraction triggers.

## Scaling Findings

All request handlers must remain horizontally evolvable:

- no process-local canonical truth,
- shared canonical persistence,
- replay-safe requests/webhooks,
- replica-safe auth/session behavior,
- correlation across instances.

No Redis/cache was introduced.

Future extraction triggers include materially different web/API scaling, unacceptable shared availability risk, native/external traffic dominance, runtime/security requirements, independent release cadence, hosting inefficiency, persistent resource contention, or ownership boundaries.

## Release / Rollback Findings

Co-hosted-first reduces initial staff-web/API version skew.

ADR-0011 compatibility still matters because Member/native clients may not update atomically.

Future release validation must cover:

- rolling multi-instance version skew,
- web/API rollback compatibility,
- schema compatibility,
- old Member client + new API,
- extraction transition.

Migrations remain separate controlled release/admin work.

## Observability Findings

End-to-end correlation must span:

```text
client
-> web/runtime entry
-> API adapter
-> application
-> DB/provider
-> durable continuation / worker
```

Safe telemetry may include request/trace ID, operation, deployment identity, verified tenant context, safe Principal context, provider-event reference, latency/error category.

No cookies, authorization headers, OTPs, refresh tokens, provider/payment secrets, or unnecessary PII belong in logs.

No observability provider/SLO was selected.

## Extraction / Migration Strategy

Make later API extraction cheap by enforcing now:

- framework-independent application handlers,
- framework-independent domain modules,
- explicit ADR-0011 contracts,
- server-only provider/persistence adapters,
- no Next.js request/response objects below transport,
- no React types below presentation,
- no process-local canonical state,
- portable configuration,
- contract/architecture tests.

Later extraction should primarily relocate transport/runtime composition, not rewrite business/domain/security behavior.

## Decisions Kept Separate

Task 0022 does not decide or accept:

```text
D-ARCH-005 architecture style acceptance
D-ARCH-016 language/runtime
D-ARCH-001 repository strategy acceptance
D-ARCH-003 API contract acceptance
D-ARCH-004 authentication/session
D-ARCH-012 Owner/Staff web framework acceptance
D-ARCH-013 Member delivery acceptance
D-ARCH-014 managed backend
D-ARCH-015 authorization acceptance
D-ARCH-017 persistence tooling
D-SEC-004 exact session lifecycle
D-SEC-008 RLS adoption
D-ARCH-007 background jobs/scheduler
D-ARCH-008 Redis/cache
D-ARCH-009 hosting
D-ARCH-019 CI/CD/release tooling
D-PROVIDER-006 observability provider
```

No API gateway, host, compute model, queue, database provider, Auth provider, or public domain was selected.

## Requirement IDs Referenced

Verified current canonical IDs include:

```text
FR-IDENTITY-001..003
FR-AUTHZ-001..004
FR-ATTENDANCE-001..011
FR-PAYMENT-002..009
FR-CROSS-001..004

NFR-SECURITY-001..005
NFR-SECURITY-008..011
NFR-RELIABILITY-001..005
NFR-RELIABILITY-007..008
NFR-AVAILABILITY-001..005
NFR-PERFORMANCE-001..006
NFR-SCALABILITY-002..005
NFR-OBSERVABILITY-001..007
NFR-MAINTAINABILITY-001..003
NFR-MAINTAINABILITY-005..006
NFR-TESTABILITY-001..005
NFR-OPERATIONS-001..005
```

No requirement ID was invented.

## Validation Required

Before acceptance, require at least:

1. Owner/Staff protected API request.
2. Member protected API request.
3. unauthenticated request.
4. revoked session.
5. wrong tenant.
6. Member-self ID substitution.
7. runtime validation failure.
8. idempotent mutation retry.
9. client timeout after successful mutation.
10. raw payment webhook verification.
11. forged webhook.
12. duplicate webhook.
13. webhook body-size/parse behavior.
14. API/web process restart during normal traffic.
15. horizontal instance A/B requests.
16. proof no canonical state exists only in process memory.
17. DB connection/pool behavior.
18. tenant context isolation.
19. staff web/API same-origin path.
20. Member-client API path.
21. cross-origin path if implemented.
22. CORS negative test.
23. CSRF negative test for cookie mutation.
24. browser bundle secret inspection.
25. route/server-action authorization bypass attempt.
26. co-hosted adapter invokes shared application handler.
27. independent API extraction spike.
28. network outage in independent-API spike.
29. webhook traffic does not corrupt staff web behavior.
30. deployment rollback compatibility.
31. worker/application-module reuse seam.
32. request correlation end-to-end.
33. representative load/latency.
34. eventual hosting/runtime-limit compatibility.
35. future native client consumes ADR-0011 without framework protocol.

No tests were implemented.

## Files Changed

Created:

```text
docs/adr/ADR-0014-api-deployment-boundary.md
.ai/task/0022-draft-api-deployment-boundary-adr.md
```

Governance continuity updates:

```text
docs/adr/README.md
docs/README.md
.ai/current-state.md
```

## Open Questions

- final Owner/Staff web framework acceptance,
- final language/runtime acceptance,
- Auth/session provider and exact session policy,
- public domain/origin/routing layout,
- Member web hosting mapping,
- long-lived vs serverless/container compute,
- hosting provider,
- DB provider/pool/RLS details,
- background job technology,
- whether API gateway is ever needed,
- rate limits,
- formal SLOs,
- health/readiness contract,
- release/CI orchestration,
- observability provider,
- whether evidence eventually triggers API extraction.

## Result

Task 0022 creates a review-ready proposal:

```text
Phase 1:
co-host trusted HTTP/API transport with Owner/Staff server runtime

But:
framework adapters remain thin
ADR-0011 remains independently consumable
Member/future native share same API
background execution remains separate
canonical state is never process-local
hosting remains open
extraction seam exists from day one
```

ADR-0014 remains `Proposed`.

Canonical `D-ARCH-006` remains `OPEN`.

Explicitly not created/selected:

```text
No API implementation
No standalone API service
No Route Handler
No Server Action
No Express/Fastify/Hono/Nest server
No hosting provider
No Next.js deployment
No Dockerfile/container
No serverless/edge function
No API gateway
No reverse proxy config
No CORS config
No cookie config
No CSRF implementation
No Auth integration/provider
No database provider/connection implementation
No worker
No queue
No cron
No migration
No CI/CD
No observability setup
No DNS/domain
No production secrets
No load test
No background-job technology selection
No previous ADR accepted
No D-ARCH-006 promotion to DECIDED
```

## Next Recommended Task

Post-Task-0022 governance state was freshly re-read from:

- `docs/adr/README.md`
- `docs/00-overview/assumptions.md`
- `.ai/current-state.md`

The synchronized repository confirms the actual next bounded task as:

```text
Task 0023: Draft Background Jobs / Scheduler ADR
Primary decision: D-ARCH-007
Likely target: docs/adr/ADR-0015-background-jobs-scheduler.md
Initial ADR status: Proposed
Canonical D-ARCH-007 status: OPEN
```

The next ADR should evaluate durable scheduling/job execution against retries, deterministic dedupe, tenant scope, failure visibility, recovery/dead-letter behavior, API-to-worker continuation, provider calls, database transaction/outbox implications, operational simplicity, scaling, and hosting portability.

Task 0023 was not executed as part of Task 0022.
