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
```

No authorized approval evidence exists for these ADRs. None is `Accepted`.

Canonical decision status remains controlled by `docs/00-overview/assumptions.md`, not ADR draft status.

Relevant canonical status:

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
D-SEC-008   RLS/data-layer tenant isolation      OPEN; P0 when client-accessible DB patterns are used
D-PROVIDER-001 payment provider                  P1 OPEN
D-PROVIDER-002 messaging provider                P1 OPEN
D-PROVIDER-006 observability provider            P1 OPEN
D-DATA-004  Member/AuthIdentity separation       P1 PROPOSED
D-DATA-007  Member/Membership state ownership    P1 PROPOSED
```

## Current Authentication and Identity Position

`ADR-0007` remains `Proposed`; canonical `D-ARCH-004` remains `OPEN`.

```text
Authentication Evidence
  -> Authentication Verification
  -> AuthIdentity
  -> stable GymPulse Principal
  -> Authorization
```

Mandatory separation:

```text
Authentication != Authorization
Provider Identity != GymPulse Principal
GymPulse Principal != Member
Valid Authentication Session != Current Business Access
```

`ADR-0008` remains `Proposed`; canonical `D-SEC-002` remains `OPEN`.

Current Member-verification proposal remains managed phone OTP/passwordless for routine verification with explicit tenant-aware `Principal -> Member-self` linking and stronger controlled handling for ambiguous, reassigned, already-claimed, recovery, and re-link cases.

No authentication, SMS, email, or business-messaging provider is accepted or provisioned.

## Current Authorization Proposal

`ADR-0009` remains `Proposed`; canonical `D-ARCH-015` remains `P0 PROPOSED`.

```text
verified Principal
  + current account eligibility
  + current tenant/resource scope
  + current named capability or Member-self relationship
  + trusted resource relationship
  -> allow / deny
```

Core rules remain:

```text
UI != Authorization Boundary
Role != Permission Check
Authentication != Authorization
Client Tenant/Resource ID != Trusted Scope
Provider Role/Claim != GymPulse Business Authority
RLS != Complete Authorization System
```

Roles remain stable capability bundles and scoped assignments rather than runtime wildcard predicates. Owner is not an implicit wildcard/superuser role. Manager exact authority remains open.

Member self-service requires an explicit Principal/Member-self relationship. Phone/email equality, arbitrary client Member ID, or provider subject equality cannot replace it.

Background execution uses bounded System Principal/job context with explicit tenant/gym/branch scope. Provider callbacks use separately verified provider context and bounded application use cases rather than human capabilities.

## Current Data-Layer Tenant Isolation Proposal

`ADR-0010` remains `Proposed`; canonical `D-SEC-008` remains `OPEN`.

Mandatory invariant:

```text
Application Authorization = Mandatory
Data-Layer Tenant Isolation = Defense in Depth
RLS != Complete Authorization System
```

Task 0018 evaluated:

```text
A. application authorization + explicit tenant predicates only
B. application authorization + explicit tenant predicates + selective PostgreSQL RLS
C. RLS-heavy tenant filtering
D. schema/database-per-tenant physical isolation
```

Current strongest conditional direction is Option B if PostgreSQL is later accepted and the selected runtime/pooling topology passes security validation.

Proposed layering:

```text
Client
  -> Trusted GymPulse Runtime
  -> Authentication / Principal Resolution
  -> Application Authorization
  -> Application / Domain
  -> Explicit tenant-scoped Data Access
  -> Selective Data-Layer Tenant Isolation / RLS where adopted
  -> Canonical Database
```

PostgreSQL remains only `PROPOSED` under `D-ARCH-002`. No managed provider is selected. Direct browser/mobile canonical database access remains unapproved.

If PostgreSQL RLS is later adopted:

- materially tenant-owned canonical tables are the leading policy candidates,
- explicit application tenant predicates remain required/valuable,
- missing/invalid tenant context fails closed with no default tenant,
- ordinary runtime/worker access must not silently use owner/superuser/`BYPASSRLS` privilege,
- migration/admin privilege remains separate,
- transaction-scoped tenant context is the leading category for pooled trusted-server traffic when runtime context is required,
- Tenant A -> Tenant B connection reuse, rollback reuse, parallel tenant, worker reuse, and selected pooler modes require real tests,
- RLS remains tenant-focused and does not own capabilities, Member-self rules, payment/attendance/renewal business rules, or domain state transitions.

## Current Primary API Contract Proposal

`ADR-0011` now exists as `Proposed`; canonical `D-ARCH-003` remains `P0 PROPOSED`.

The proposal is:

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

### Contract and trust boundaries

Mandatory separation:

```text
Static Type != Runtime Validation
External API DTO != Application Command/Query
Application Command/Query != Domain Model
Domain Model != Persistence Model
Provider Payload != Public Client DTO
Client Tenant ID != Trusted Tenant Scope
Client Success Screen != Canonical Payment Success
```

The API accepts caller intent and required evidence. The server derives canonical business results.

Clients are not authoritative for:

```text
online payment Paid state
membership eligibility
membership extension
canonical attendance timestamp
final renewal price
tenant authorization
actor / audit identity
provider verification result
no-show derived state
```

No request JSON is automatically bound to a domain/persistence entity. Request DTOs explicitly allowlist writable fields and security-sensitive mutation objects reject unknown properties by default unless an operation explicitly documents a compatibility exception.

### Architecture options evaluated

Task 0019 compared:

```text
A. JSON HTTP resource/action API + runtime-validated typed contracts
B. typed RPC / tRPC-style contract
C. GraphQL
D. gRPC / Protobuf-first
E. framework-specific server actions/internal functions as primary contract
```

Option A is the strongest current Phase 1 fit. Typed RPC remains credible for a tightly coupled TypeScript-only surface but is weaker as the canonical language-neutral contract. GraphQL and gRPC add capabilities/platform cost not justified by current Phase 1 needs. Framework server actions may be secondary UI-server adapters but are not the canonical multi-client contract.

### Contract source of truth

Task 0019 compared:

```text
runtime-schema first
OpenAPI first
static type-only first
framework-inferred
```

Proposed source model:

```text
runtime trust-boundary schema
  -> derived/mechanically synchronized static type where the accepted language supports it
  -> mechanically derived OpenAPI where useful
  -> optional generated clients/docs where justified
```

Static TypeScript types alone are explicitly insufficient for runtime trust. `D-ARCH-016` remains `PROPOSED`; no TypeScript runtime/library is accepted by ADR-0011.

### Success response model

ADR-0011 does **not** require a universal `{ data, meta }` wrapper.

Proposed convention:

```text
single resource / command success -> purpose-specific direct JSON DTO
collection -> { items, page }
request correlation -> server-generated response header + protected telemetry
204 -> allowed when the operation intentionally has no representation
```

Operation-specific metadata may be added only with defined semantics.

### Runtime validation posture

External validation covers as applicable:

```text
path
query
headers
JSON body
enums
opaque IDs
dates/timestamps
money
pagination
idempotency keys
provider callback structures
```

Validation layers remain separate:

```text
contract shape
!= authentication
!= authorization
!= domain validation
!= database constraints
!= provider verification
```

No Zod/Valibot/TypeBox/ArkType/JSON-Schema validator or other validation library is selected.

### Error model

Proposed error architecture uses HTTP status semantics plus RFC 9457-compatible `application/problem+json`, extended with a stable GymPulse machine `code`, safe detail, and request correlation.

Clients branch on machine codes, not human/localized message text.

Baseline categories:

```text
400 malformed/contract input
401 missing/invalid authentication
403 authenticated denial where disclosure is safe
404 missing or intentionally undisclosed protected resource
409 current-state / idempotency conflict
422 well-formed input rejected by semantic/business rule
429 abuse/rate control
500 unexpected internal failure
503 temporary dependency/system unavailability
```

Errors never expose SQL, stack traces, provider secrets, other-tenant identifiers, raw tokens, policy internals, or unnecessary Member data.

### Pagination

Opaque cursor/keyset-style pagination is the default for mutable operational collections such as Member search, attendance history, no-show/follow-up queues, renewal pipelines, payment exceptions, audit history, and data-quality queues.

Offset pagination remains an explicit exception for small/static lists where random page access materially benefits UX and its consistency/performance cost is acceptable.

Only allowlisted filters/sorts are accepted. Raw database offsets/SQL expressions are not client contract requirements. Client-provided branch/gym filters remain untrusted until scope is server-authorized.

### Idempotency and retry

Designated retry-sensitive critical commands accept an opaque idempotency identity, with `Idempotency-Key` as the proposed HTTP convention.

```text
same trusted tenant/caller context
+ same operation
+ same key
+ compatible request
-> same canonical logical outcome
```

Same key + materially different request is a stable conflict. Concurrent duplicates cannot create duplicate effects. Prior success returns/reconstructs the canonical result. A client timeout does not prove server failure; same-key retry or canonical read-after-timeout must recover safely.

The IETF HTTPAPI `Idempotency-Key` document is an expired Internet-Draft as of current research, not a published RFC. GymPulse therefore owns the exact contract semantics and must not claim standard-header RFC status.

Idempotency and database transactionality remain distinct correctness controls.

### Concurrency/conflict

Current-state races such as duplicate attendance, closed case, already-frozen membership, already-processed payment, or selected configuration conflicts use stable machine conflict codes, normally with `409` where refresh/reconciliation is meaningful.

ETag/`If-Match` remains a possible later pattern for selected editable configuration resources only. It is not a universal baseline and no version/ETag implementation was created.

### Authentication, authorization, and tenant context

Protected human calls use whatever authentication/session architecture is later accepted under `D-ARCH-004`, then resolve the existing GymPulse Principal and application authorization boundary.

```text
Principal
+ trusted scope/resource
+ named capability / Member-self relationship
-> allow / deny
```

Routes, verbs, middleware, DTO types, client role names, hidden UI, opaque IDs, or client tenant headers do not replace authorization.

`/me`-style Member contracts may reduce arbitrary Member-ID injection for self-service where appropriate, but they do not replace server authorization.

Client-supplied tenant/gym/branch/resource IDs are routing/filter inputs, never authority.

### Webhook/provider callback boundary

Provider callbacks remain a separate contract class:

```text
raw provider request
  -> preserve verification inputs
  -> verify provider authenticity
  -> normalize provider event
  -> resolve canonical internal resource + tenant
  -> bounded application use case
  -> idempotent canonical effect
```

Framework parsing must not destroy raw-body/signature material. Valid duplicate callbacks may receive provider-appropriate acknowledgement after the existing business effect is recognized. Provider-specific response codes remain provider adapter details.

No provider object becomes a normal client DTO except narrowly approved public checkout material required by a future selected provider.

### Versioning and compatibility

Proposed major contract namespace starts at `v1` from the first supported independently consumable application contract. Exact host/base prefix remains a later API/deployment specification.

Compatible additive response fields can remain within a major version when supported clients tolerate unknown fields.

Potentially breaking changes include removed/renamed/semantic fields, newly required input, stable error-code changes, pagination changes, authorization/existence behavior changes, and output enum additions that old clients cannot safely handle.

Output enum additions are compatibility-sensitive and may require fallback or coordinated rollout.

No fixed deprecation window is invented.

### OpenAPI position

OpenAPI is Proposed only as an optional documentation/export/generation artifact.

Preferred direction if compatible tooling is later selected:

```text
runtime contract
  -> static type where useful
  -> OpenAPI where useful
  -> optional generated client/docs
```

OpenAPI must not silently diverge from runtime validation. No OpenAPI YAML/JSON, generator, generated client, or SDK was created.

### Framework and deployment independence

Canonical contract semantics do not depend on:

```text
Next.js route handlers
Next.js Server Actions
Express
Fastify
Hono
NestJS
tRPC
GraphQL
gRPC
Supabase Functions
specific deployment topology
```

A later framework adapter may implement the contract. A server action may be a secondary internal UI-server optimization if it invokes the same application use cases and preserves security boundaries.

`D-ARCH-006` remains `OPEN`; ADR-0011 works with co-hosted or independently deployed trusted API mapping.

`D-ARCH-012` and `D-ARCH-013` remain `PROPOSED`; no web/native client framework is accepted.

### Current official research verified on 2026-09-11

Task 0019 reviewed current official material for:

- RFC 9110 HTTP semantics, status codes, method idempotency, `If-Match`,
- RFC 6585 `429`,
- RFC 9457 Problem Details,
- current OpenAPI specification (including published 3.2.0),
- current released JSON Schema 2020-12,
- GraphQL September 2025 specification,
- tRPC official TypeScript inference/adapters,
- gRPC/Protobuf and gRPC-Web official documentation,
- OWASP API Security Top 10 2023,
- current IETF HTTPAPI Idempotency-Key draft status.

No external standard/tool was selected merely because it was researched.

## Important Security Boundaries

- Every protected operation remains server-authorized.
- Authentication, contract validation, authorization, domain validation, DB constraints, and provider verification remain separate controls.
- API input is untrusted at runtime even when static types exist.
- Incoming DTOs are allowlists; no mass assignment into persistence/domain objects.
- Public response DTOs are purpose-specific; no generic DB/domain serialization.
- Client tenant/resource identifiers are locators/routing/filter input, not authority.
- Member-self BOLA protections remain application-owned.
- Safe `404` may intentionally hide protected resource existence.
- Client cannot forge online payment Paid state, final renewal price, canonical attendance time, entitlement, actor/audit identity, or provider verification state.
- Stable machine error codes do not expose internal security reasoning.
- Critical mutation retries use explicit idempotency plus canonical uniqueness/transaction rules.
- Provider callbacks preserve raw verification material and use provider authenticity, not human sessions.
- Background jobs remain internal adapters and are not public unauthenticated endpoints by default.
- Sensitive responses are not shared-cacheable by default.
- Request/body/page/filter sizes remain bounded per operation.
- No API framework, validator, generator, or deployment topology is accepted.
- No previous ADR is Accepted.

## Task 0019 Implementation Status

Task `0019-draft-api-contract-architecture-adr` completed documentation/governance work only.

Created:

```text
docs/adr/ADR-0011-api-contract-architecture.md
.ai/task/0019-draft-api-contract-architecture-adr.md
```

Updated:

```text
docs/adr/README.md
docs/README.md
.ai/current-state.md
```

Explicitly not created/selected:

```text
No API implementation
No route handler
No controller
No middleware
No server action
No GraphQL schema
No tRPC router
No protobuf/gRPC service file
No OpenAPI YAML/JSON
No JSON Schema file
No runtime validation source code
No DTO source code
No generated client/SDK
No API test
No database schema
No migration
No RLS policy
No worker implementation
No webhook implementation
No CI configuration
No deployment configuration
No Express/Fastify/Hono/NestJS/API framework
No Zod/Valibot/TypeBox/ArkType/validation library
No OpenAPI/client generator
No API deployment topology selection
No Owner/Staff web framework acceptance
No Member native/web framework acceptance
No TypeScript/Node acceptance
No previous ADR promotion to Accepted
```

## Last Completed Task

`0019-draft-api-contract-architecture-adr`

```text
ADR-0011 Status: Proposed
D-ARCH-003 canonical status: PROPOSED
D-ARCH-006 canonical status: OPEN
D-ARCH-012 canonical status: PROPOSED
D-ARCH-013 canonical status: PROPOSED
D-ARCH-016 canonical status: PROPOSED
D-ARCH-004 canonical status: OPEN
D-ARCH-015 canonical status: PROPOSED
D-SEC-008 canonical status: OPEN
```

The API contract architecture is not accepted or implemented merely because ADR-0011 exists.

## Current Task

None in progress.

## Next Task

Post-Task-0019 synchronization of the ADR dependency queue identifies the next bounded item as:

```text
Task 0020: Draft Owner / Staff Web Application Framework ADR
```

Primary canonical decision:

```text
D-ARCH-012
```

Likely target when explicitly started:

```text
docs/adr/ADR-0012-owner-staff-web-framework.md
```

Initial ADR status should be `Proposed`. Canonical `D-ARCH-012` remains `PROPOSED` unless explicit review/approval changes it.

The next task should evaluate Owner/Staff web framework options against the proposed TypeScript/runtime direction, ADR-0011 API contract, authentication/session boundary, authorization model, accessibility, testing, observability, deployment-neutral application architecture, and operational constraints.

It must keep `D-ARCH-006` API deployment topology separate and must not create application scaffolding or silently accept prior ADRs.

Do not execute Task 0020 until explicitly requested.

## Files To Read Next

```text
.ai/README.md
.ai/current-state.md
.ai/task/0019-draft-api-contract-architecture-adr.md
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
docs/adr/ADR-0009-authorization-implementation.md
docs/adr/ADR-0011-api-contract-architecture.md
legacy migration source: docs/05-system-architecture.md
legacy migration source: docs/07-api-contracts.md
legacy migration source: docs/15-engineering-workflow.md
legacy migration source: docs/16-open-decisions.md
```