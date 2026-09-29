# ADR-0011: Primary API Contract Architecture

## Status

`Proposed`

## Decision Metadata

- ADR: `ADR-0011`
- Primary Decision ID: `D-ARCH-003`
- Related Decision IDs: `D-ARCH-016`, `D-ARCH-001`, `D-ARCH-004`, `D-SEC-002`, `D-ARCH-015`, `D-SEC-008`, `D-ARCH-012`, `D-ARCH-013`, `D-ARCH-006`, `D-ARCH-007`, `D-ARCH-014`, `D-ARCH-002`, `D-ARCH-017`, `D-ARCH-018`, `D-ARCH-010`, `D-PROVIDER-001`, `D-DATA-001`, `D-DATA-002`, `D-DATA-003`
- Decision Owner: `Open`
- Technical Owner: `Architecture / API / Backend / Security`
- Date Proposed: `2026-09-11`
- Date Accepted: `Not accepted`
- Supersedes: `None`
- Superseded By: `None`

## 1. Context

GymPulse Phase 1 has multiple first-party interaction surfaces and multiple trust paths:

```text
Owner / Manager / Front Desk web client
Member web/PWA or future native client
Payment and messaging provider callbacks
Future first-party integrations
Background execution adapters
```

The architecture already requires one trusted application boundary that owns authentication handoff, Principal resolution, tenant/resource resolution, named-capability authorization, runtime contract validation, application command/query orchestration, domain rules, transactional consistency, idempotency, audit, and safe response translation.

`D-ARCH-003` asks a narrower question:

> What is GymPulse's primary client/server application contract architecture, independent of the final web framework, API deployment topology, provider products, and persistence implementation?

The canonical register currently marks `D-ARCH-003` as `P0 PROPOSED` and recommends JSON HTTP with typed/runtime-validated contracts. This ADR evaluates that proposal against credible alternatives. It does not change the canonical decision to `DECIDED`.

The contract decision must stay separate from deployment:

```text
API Contract Architecture
!=
API Deployment Architecture
```

`D-ARCH-006` therefore remains `OPEN`. The same contract semantics must remain viable if the trusted application/API responsibility is later co-hosted with the Owner/Staff web runtime or deployed independently.

The contract also cannot be allowed to collapse application/domain boundaries. The following separation is mandatory:

```text
External API DTO
!=
Application Command / Query
!=
Domain Model
!=
Persistence Model
```

A database row, ORM-generated model, provider object, framework request object, or internal domain event is not automatically a public API contract.

The central trust rule is that compile-time types are not runtime security. Every external request remains untrusted until the applicable transport, authentication, authorization, validation, and business checks have succeeded.

## 2. Requirements and Decision Drivers

### 2.1 Functional requirements

Primary identity and authorization drivers:

- `FR-IDENTITY-001` protected staff functionality requires authenticated identity.
- `FR-IDENTITY-002` authenticated users require termination/revocation/expiry semantics through the selected authentication architecture.
- `FR-IDENTITY-003` protected Member self-service requires verified identity; raw mobile number is not authorization proof.
- `FR-AUTHZ-001` every protected operation is tenant/gym/branch scoped where applicable.
- `FR-AUTHZ-002` protected mutations use named capabilities, not UI visibility or client role checks alone.
- `FR-AUTHZ-003` Member-facing APIs must prevent one Member from reading another Member's protected records.
- `FR-AUTHZ-004` sensitive staff actions require trusted actor attribution.

Correctness-sensitive workflow drivers:

- `FR-ATTENDANCE-001..010` require server-verifiable QR/session input, verified Member identity, server-side eligibility, exactly one canonical attendance effect, duplicate protection, retry safety, auditable assisted attendance, self/in-scope history, and reconstructable correction.
- `FR-RENEWAL-003..007` require server-authoritative renewal details, an order separate from payment, preserved commercial terms, no extension on payment initiation, and reminder suppression after verified completion.
- `FR-PAYMENT-001..010` require canonical payment states, verified provider evidence, webhook authenticity, retained provider references, duplicate callback safety, exactly-once business effects, no raw payment credentials, reconstructable refunds/reversals, and a separate authorized offline-payment path where enabled.
- `FR-AUDIT-001..003` require sensitive-action audit records with trusted actor, resource, time, tenant, and relevant reason/before-after context.
- `FR-CROSS-001` keeps final authorization, attendance eligibility, payment success, and membership entitlement server-side.
- `FR-CROSS-002` requires retry/replay-safe critical effects.
- `FR-CROSS-003` requires explicit tenant/gym/branch context in requests, relationships, and jobs where relevant.
- `FR-CROSS-004` requires gym-local business calendar semantics.

### 2.2 Non-functional requirements

Security and privacy:

- `NFR-SECURITY-001..005` require tenant isolation, least privilege, server-side authorization, secret protection, and encrypted transport.
- `NFR-SECURITY-009..011` require attributable sensitive actions, abuse controls for sensitive endpoints, and safe error/log behavior.
- `NFR-PRIVACY-001` requires data minimization.
- `NFR-PRIVACY-003` requires authorization-scoped exports.

Reliability and correctness:

- `NFR-RELIABILITY-001..005` require idempotent critical mutations, exactly-once payment effect, retry-safe jobs, database backstops where practical, and server-side canonical truth.
- `NFR-RELIABILITY-007` expects deduplicated retries to expose the existing canonical result where appropriate.
- `NFR-RELIABILITY-008` requires reconciliation after provider/network interruption.

Performance and scale:

- `NFR-PERFORMANCE-001..006` require responsive check-in, indexed server-side search, bounded/paginated queues, efficient dashboard queries, provider-latency separation, and purpose-specific Member payloads.
- `NFR-SCALABILITY-003..006` require stateless horizontal evolution, separable asynchronous work, no premature distributed architecture, and indexed tenant-oriented queries.

Maintainability and testability:

- `NFR-MAINTAINABILITY-001` prohibits duplicating core business rules across clients/workers.
- `NFR-MAINTAINABILITY-002` recommends shared/generated typed contracts plus runtime validation at trust boundaries for the proposed TypeScript direction.
- `NFR-MAINTAINABILITY-003` requires provider abstraction.
- `NFR-MAINTAINABILITY-005..006` require Docs-as-Code synchronization and ADR governance.
- `NFR-TESTABILITY-001..005` require deterministic domain tests, provider simulation, failure-path coverage, authorization matrix tests, and controllable time.
- `NFR-COMPATIBILITY-002` requires an explicit API evolution policy before third-party integrations are enabled.

Observability:

- `NFR-OBSERVABILITY-001..007` require structured diagnostics, safe context, centralized errors, payment/job diagnosis, health signals, and request/correlation identifiers.

Data representation:

- `NFR-DATA-001` favors opaque externally exposed identifiers.
- `NFR-DATA-002` requires integer minor-unit money plus currency.
- `NFR-DATA-003` requires UTC event timestamps with gym timezone retained separately for business-calendar calculations.

### 2.3 Product and architecture drivers

GymPulse Phase 1 is a small-team operations/retention product, not a general integration platform. The contract must fit:

```text
fast Owner/Staff operational workflows
mobile-first Member flows
QR check-in
payment checkout + verified provider callbacks
bounded action queues
future native Member client compatibility
future first-party integrations
multi-tenant authorization
retry-safe critical commands
simple debugging and operations
```

Relevant principles include `ARCH-PRIN-001` through `ARCH-PRIN-016`, especially tenant isolation, authentication/authorization separation, capability permissions, deterministic server truth, financial correctness, idempotency, audit, gym-local time, explicit domain ownership, transactional consistency, provider abstraction, failure visibility, observability, data minimization, and secure defaults. `ARCH-PRIN-018` rejects premature infrastructure and `ARCH-PRIN-019` requires major commitments to remain explicitly governed.

## 3. Constraints and Assumptions

1. `D-ARCH-003` remains `P0 PROPOSED`; this ADR is Proposed and does not make it `DECIDED`.
2. `D-ARCH-016` is `DECIDED`; strict TypeScript with a supported Node.js LTS runtime is an accepted foundation category, while exact versions remain separate.
3. `D-ARCH-001` is `DECIDED`; an explicit monorepo is accepted, but the exact shared-contract package/folder design remains implementation work and is not decided by this ADR.
4. `D-ARCH-004` remains `OPEN`; no authentication/session provider or exact browser/native credential transport is selected.
5. `D-SEC-002` remains `OPEN`; Member verification method remains separately governed even though ADR-0008 is Proposed.
6. `D-ARCH-015` remains `PROPOSED`; ADR-0009 remains Proposed and application authorization stays mandatory.
7. `D-SEC-008` remains `OPEN`; ADR-0010 remains Proposed. API semantics must not depend on RLS being accepted or present.
8. `D-ARCH-012` and `D-ARCH-013` remain `PROPOSED`; this ADR does not accept Next.js, responsive web/PWA, Expo/React Native, or another client framework.
9. `D-ARCH-006` remains `OPEN`; contract semantics must work in co-hosted and independently deployed API mappings.
10. `D-ARCH-007` remains `OPEN`; background-job technology is not part of the public API contract.
11. `D-ARCH-014` remains `OPEN`; no managed backend or provider Data API is selected.
12. `D-ARCH-002` is `DECIDED` with PostgreSQL; `D-ARCH-017` remains `PROPOSED`. Public contracts must not be generated directly from database rows/ORM models or depend on Drizzle/Kysely/Prisma semantics.
13. `D-ARCH-018` remains `PROPOSED`; this ADR defines required contract/security tests but selects no test tool.
14. `D-ARCH-010` remains `OPEN`; file transport categories are considered without selecting object storage.
15. `D-DATA-001..003` remain separately governed Proposed data decisions; this ADR preserves their current direction without accepting them.
16. Public/client DTOs are purpose-specific projections. They do not expose persistence models wholesale.
17. Incoming request objects are allowlisted DTOs. Mass-assignment safety cannot rely on clients omitting protected fields.
18. Client-provided tenant/gym/branch/resource IDs are locators/routing/filter inputs, not authorization authority.
19. Client-supplied actor IDs, payment-success state, entitlement state, server timestamps, provider-verification state, and final price are not canonical truth.
20. Provider callback contracts, public client contracts, job payloads, and internal application commands are distinct contract classes. Shared primitives may be reused only when semantics are genuinely identical.
21. Internal application/domain events are not automatically external API messages.
22. Phase 1 does not require a public third-party developer platform, public OAuth app model, developer API keys, or public API portal.
23. No exact endpoint inventory is finalized by this ADR. Endpoint-level specification belongs later under `docs/06-api/`.
24. No API framework, validator, schema library, OpenAPI generator, RPC library, or client generator is selected here.

## 4. Contract and Trust-Boundary Model

### 4.1 Contract classes

GymPulse must distinguish at least four contract classes:

```text
External first-party client HTTP contract
Provider callback / webhook contract
Background job payload contract
Internal application command/query contract
```

One schema is not assumed to be ideal for all four.

### 4.2 External DTO separation

The canonical dependency boundary is:

```text
HTTP / External DTO
      ↓ mapping
Application Command / Query
      ↓
Domain Model / Policy
      ↓
Persistence Ports / Provider Ports
```

The API layer may return purpose-specific read models, but read models remain non-authoritative for writes.

Prohibited shortcuts include:

```text
request JSON -> ORM entity auto-bind
DB row -> public JSON by generic serialization
provider response object -> client response wholesale
client DTO -> domain entity without explicit mapping/policy
```

### 4.3 Trust progression

External input remains untrusted. A protected interactive request conceptually passes through staged controls:

```text
receive request
  -> enforce transport/request-size limits
  -> establish server request/correlation ID
  -> parse bounded routing/header/body material needed by the operation
  -> runtime-validate external contract inputs before those values influence business behavior
  -> verify authentication evidence where required
  -> resolve GymPulse Principal
  -> resolve trusted tenant/resource relationship
  -> authorize named capability / Member-self policy
  -> map validated DTO to application command/query
  -> execute domain rules and canonical state changes
  -> map canonical result to explicit response DTO
```

Exact ordering between authentication evidence verification and full body validation may vary by framework/runtime and denial-cost considerations. The invariant is stronger than one fixed middleware order:

- malformed/untrusted fields do not reach application/domain logic,
- unverified client tenant/resource claims never become trusted authorization context,
- authentication does not replace contract validation,
- contract validation does not replace authorization,
- authorization does not replace domain validation,
- domain validation does not replace database constraints,
- provider verification remains a separate authenticity boundary.

### 4.4 Client intent versus canonical truth

The API accepts intent and evidence appropriate to the caller. The server derives canonical outcomes.

Clients are not authoritative for:

```text
online payment Paid state
membership eligibility
membership extension
attendance canonical timestamp
final renewal price
tenant authorization
actor identity / audit actor
provider verification result
no-show derived state
```

For example, a payment client success screen may trigger a refresh or status read, but it cannot write `status=paid` as authoritative online-payment evidence.

## 5. Options Considered

### Option A: JSON HTTP resource/action API + runtime-validated typed contracts

Use standard HTTP semantics with JSON application messages, explicit resource and business-action routes, runtime contract schemas at external trust boundaries, typed client/server representations where the accepted language/runtime permits, and optional mechanically derived OpenAPI documentation.

Representative shape:

```text
HTTPS
+
application/json
+
resource-oriented reads
+
explicit business-command actions where clearer than generic CRUD
+
runtime schema validation
+
stable machine errors
```

Strengths:

- natural fit for browser/web/PWA and future native clients,
- easy inspection and debugging with ordinary HTTP tooling,
- provider webhooks already arrive over HTTP,
- explicit HTTP status/retry/cache semantics,
- language-neutral wire contract,
- good OpenAPI/documentation interoperability,
- contract can remain independent of framework and deployment topology,
- explicit command endpoints model GymPulse business operations better than raw CRUD.

Tradeoffs:

- compile-time type synchronization requires deliberate generation/derivation if multiple implementations exist,
- runtime validation and DTO mapping remain explicit work,
- weak discipline can degrade into ad-hoc CRUD unless contract governance is maintained.

### Option B: typed RPC / tRPC-style contract

Expose procedure contracts whose server definitions drive TypeScript inference end-to-end.

Strengths:

- excellent same-repository TypeScript ergonomics,
- strong end-to-end inference,
- little/no client type duplication,
- low ceremony for a TypeScript-only full-stack team.

Tradeoffs for GymPulse:

- the strongest benefits align with the accepted TypeScript runtime category, while wire contracts must remain language-neutral,
- future non-TypeScript clients/integrations require additional interoperability/documentation strategy,
- provider webhooks remain separate HTTP contracts,
- the canonical contract becomes closer to the server code/type system,
- external documentation and independent contract consumption are less naturally language-neutral than standard HTTP descriptions.

This is a credible implementation option for tightly coupled TypeScript applications, but it is not the best primary architecture for GymPulse's multi-client/provider/deployment-neutral contract.

### Option C: GraphQL

Expose a typed GraphQL schema with client-selected query fields and GraphQL mutations.

Strengths:

- flexible client read selection,
- strong schema/tooling ecosystem,
- introspection and typed client tooling,
- useful when many clients need materially different compositions of a large graph.

Tradeoffs for GymPulse:

- field/object authorization requires careful resolver-level and query-level security,
- query depth/cost/resource controls become a first-class operational concern,
- N+1/data-loader/query-planning discipline adds complexity,
- mutation/business-command semantics still need explicit design,
- provider callbacks still use separate HTTP verification contracts,
- the current Phase 1 read surface and team size do not demonstrate enough graph/query flexibility need to offset the extra platform surface.

GraphQL is technically capable but not preferred for Phase 1.

### Option D: gRPC / Protobuf-first

Define service contracts and messages in Protocol Buffers and generate client/server code.

Strengths:

- strong IDL-first contracts,
- multi-language code generation,
- compact binary transport,
- good service-to-service and streaming capabilities,
- disciplined compatibility model when field evolution rules are followed.

Tradeoffs for GymPulse:

- browser clients typically need gRPC-Web or another browser-compatible bridge/gateway,
- generated-code/toolchain operational cost is higher for a small Phase 1 team,
- ordinary browser/network debugging is less direct than JSON HTTP,
- payment/messaging webhooks still arrive as provider-defined HTTP callbacks,
- current Phase 1 has no streaming or polyglot service requirement strong enough to justify the extra machinery.

### Option E: framework-specific server actions / internal functions as the primary contract

Use a web framework's server actions/functions or framework-specific serialized calls as the main client/server interface.

Strengths:

- excellent co-located web developer ergonomics,
- reduced route/DTO ceremony for one web application,
- can integrate naturally with framework rendering/data-fetching primitives.

Tradeoffs for GymPulse:

- ties canonical semantics to `D-ARCH-012` and often to one deployment/runtime shape,
- future native Member clients cannot consume browser-framework internals directly,
- independent API deployment becomes harder to preserve cleanly,
- provider callbacks and external integrations still require separate explicit contracts,
- security boundaries can become less visible if internal function invocation is mistaken for authorization,
- discoverability and language-neutral documentation are weaker.

Framework actions may later be used as a secondary UI-server optimization if they call the same application commands/queries and preserve validation/authorization. They should not be the canonical multi-client contract.

## 6. Evaluation

### 6.1 Architecture matrix

| Criterion | JSON HTTP + runtime schemas | Typed RPC | GraphQL | gRPC / Protobuf | Framework actions |
|---|---|---|---|---|---|
| Owner/Staff web fit | Strong | Very strong for TypeScript | Strong | Moderate via web bridge | Very strong for matching framework |
| Future native fit | Strong | Moderate/Strong if TS client | Strong | Strong native ecosystem | Weak as primary contract |
| Runtime validation | Strong with explicit schemas | Strong when validators are explicitly used | Strong GraphQL input/schema validation, domain checks still separate | Strong protobuf decoding/IDL constraints, domain checks separate | Framework-dependent; must be added explicitly |
| Compile-time type safety | Strong with derivation/generation | Very strong | Strong with generation | Very strong with generation | Strong within one framework/language |
| Security-boundary visibility | **Strong** | Strong/Moderate | Moderate/Strong but resolver complexity | Strong | Moderate/Weak if calls feel local |
| Authorization integration | **Explicit and direct** | Explicit procedure middleware/app layer | Requires consistent field/object/mutation policy | Explicit interceptor/app layer | Risk of framework middleware being mistaken for authority |
| Idempotency semantics | **Natural HTTP header + application contract** | Must define custom procedure semantics | Must define mutation semantics | Metadata/application semantics | Framework-specific/custom |
| Provider webhook fit | **Very strong** | Separate HTTP path required | Separate HTTP path required | Separate HTTP gateway required | Separate callback path required |
| Stable error model | Strong HTTP + machine problem codes | Custom RPC error model | GraphQL error model requires application conventions | gRPC status/details model | Framework-specific |
| Pagination | Explicit cursor/resource contracts | Explicit procedure contract | Connections/cursors common | Explicit message contract | Custom/framework-specific |
| API documentation | **Strong** | Moderate; TS-centric docs/tooling | Strong schema introspection | Strong IDL/generated docs | Weak/Moderate |
| OpenAPI/tooling | **Natural optional fit** | Secondary | Not primary fit | Not primary fit | Weak |
| Provider independence | Strong | Strong | Strong | Strong | Moderate |
| Framework independence | **Strong** | Strong across JS runtimes but TS ecosystem coupled | Strong | Strong | Weak |
| Deployment independence | **Strong** | Strong if adapter discipline retained | Strong | Strong | Weak/Moderate |
| Non-TypeScript interoperability | **Strong** | Weaker than language-neutral HTTP schema | Strong | Very strong | Weak |
| Debuggability | **Very strong** | Strong with tooling | Moderate/Strong | Moderate | Strong inside framework, weaker as external contract |
| Operational complexity | **Low/Moderate** | Low/Moderate | Moderate/High | Moderate/High | Low initially, coupling cost later |
| Phase 1 simplicity | **Strongest overall** | Strong if TypeScript-only | Moderate | Weak/Moderate | Strong only for one web surface |
| Future evolution | Strong | Strong within TS ecosystem | Strong for graph-heavy clients | Strong for service/polyglot evolution | Moderate/Weak |
| Reversibility | **High** | Moderate/High | Moderate | Moderate | Lower if deeply framework-bound |
| Overall GymPulse fit | **Strongest current fit** | Credible secondary alternative | Capable but unjustified complexity | Capable but unjustified current cost | Useful secondary optimization, not primary contract |

The matrix does not claim JSON HTTP is universally superior. It fits GymPulse's current drivers with the least new platform surface while preserving future clients, provider callbacks, and deployment independence.

### 6.2 Contract source-of-truth matrix

| Source model | Runtime trust safety | Type synchronization | OpenAPI synchronization | Maintenance / GymPulse fit |
|---|---|---|---|---|
| Runtime-schema first | **Strong** because executable validation is primary | **Strong** if static types are derived/generated | Strong if OpenAPI is mechanically exported | **Preferred**: one trust-boundary definition with derived artifacts |
| OpenAPI first | Strong only if runtime validators/server bindings are generated or otherwise enforced | Strong with code generation | **Strongest by definition** | Credible if language-neutral/public API becomes dominant; adds generation/tooling dependence now |
| Static type-only first | **Insufficient**: compile-time types disappear at runtime | Strong only inside compiler boundary | Weak without a second manual/generated source | **Rejected as sufficient trust model** |
| Framework-inferred | Variable; depends on framework behavior and explicit validation | Strong inside framework | Variable/secondary | Weakest independence; risks coupling contract to web/runtime choice |

### 6.3 Conclusion

Option A best matches GymPulse Phase 1. Runtime-schema-first contract ownership best preserves the trust boundary while allowing static types and OpenAPI to be derived rather than separately maintained.

## 7. Proposed Decision

**Propose a versioned JSON-over-HTTPS, resource/action-oriented application contract with explicit runtime trust-boundary schemas, purpose-specific DTOs, stable machine-readable errors, bounded cursor-first pagination, explicit idempotency semantics for designated retryable commands, provider-specific webhook verification boundaries, and optional mechanically derived OpenAPI documentation.**

The proposal is governed by these rules:

1. HTTPS is required in production for authenticated/personal/financial/operational traffic under `NFR-SECURITY-005`.
2. Standard application API bodies use JSON unless the operation is inherently file/binary/provider-specific.
3. Reads should be resource/query-oriented; business-sensitive mutations may use explicit command/action routes rather than generic CRUD.
4. The external DTO is explicitly mapped to an application command/query. No persistence/domain/provider object becomes public automatically.
5. Runtime schemas are the implementation-level source of truth for external request/response shape where practical.
6. With the TypeScript direction accepted under ADR-0002, static TypeScript types should be derived from or mechanically synchronized with runtime schemas rather than maintained independently.
7. OpenAPI may be mechanically exported/generated where useful; it is not required to be the primary manually maintained source of truth.
8. API semantics remain framework- and deployment-independent.
9. Provider callbacks are a separate contract class with provider authenticity verification before canonical mutation.
10. Background job payloads are not public APIs and need not be forced into HTTP/OpenAPI.
11. The proposal does not select a validator/schema library, API framework, OpenAPI generator, SDK generator, or deployment topology.

### 7.1 Resource versus command semantics

GymPulse should not force "pure REST" uniformity when a named business command is safer and clearer.

Illustrative patterns, not canonical endpoint inventory:

```text
GET  /.../members/{memberId}              resource/query
POST /.../attendance/check-in              business command
POST /.../memberships/{id}/freeze          business command
POST /.../attendance/{id}/corrections      business/audit command
POST /.../payments/{id}/refunds             financial command
```

A generic mutation such as:

```text
PATCH payment { status: "paid" }
```

is not an acceptable substitute for provider-verified payment transition rules.

### 7.2 HTTP method posture

- `GET`: safe read/query operations; no business mutation.
- `POST`: resource creation and business commands where server state/effects are created or transitioned.
- `PUT`: only genuine complete replacement/upsert semantics where the operation is designed to be idempotent and the client is allowed to specify the full representation.
- `PATCH`: allowlisted partial edits where partial resource update is genuinely the domain operation; never generic access to protected state fields.
- `DELETE`: only where the domain permits actual deletion. Cancellation, void, reversal, or historical correction should use explicit business operations when deletion would destroy required history.

HTTP method semantics do not decide domain authorization or idempotency by themselves.

## 8. Request, Response, and Error Semantics

### 8.1 Standard content types

Normal application request/response bodies use:

```text
application/json
```

Error responses should use the standard problem-details media type when the proposed error model is implemented:

```text
application/problem+json
```

File upload/download/export and provider webhook content types are operation/provider-specific and are not forced into JSON.

### 8.2 Request DTOs and unknown fields

Every operation defines an explicit request DTO/schema for the fields the caller may provide.

Default posture:

- reject unknown properties on security-sensitive mutation objects,
- prefer rejecting unknown request fields generally so client/server drift and mass-assignment attempts fail visibly,
- allow an operation-specific tolerant policy only when there is a documented compatibility reason,
- never bind arbitrary request properties to domain/persistence objects.

Response consumers should tolerate unknown additive response fields unless a specific closed contract states otherwise.

This asymmetric posture supports safe input allowlisting and additive response evolution.

### 8.3 Runtime validation layers

Contract validation covers, as applicable:

```text
path parameters
query parameters
headers
JSON body
enums
opaque IDs
dates/timestamps
money input
pagination
idempotency keys
provider callback envelope/metadata
```

It remains distinct from:

```text
contract shape validation
authentication verification
authorization
domain/business validation
database constraints
provider authenticity/semantic verification
```

Example:

```text
amountMinor is an integer         -> contract validation
caller may refund                 -> authorization
payment is refundable             -> domain rule
amount <= refundable balance      -> business invariant
provider accepts/records refund   -> provider interaction
```

No validator package is selected.

### 8.4 Response body posture

GymPulse should **not require a universal `{ data, meta }` envelope for every successful response**.

Proposed convention:

- a single-resource or command success returns its explicit purpose-specific JSON representation directly,
- a collection returns an object such as `{ items, page }` so pagination metadata has a stable home,
- `204 No Content` is available when a successful operation intentionally returns no representation,
- request correlation is carried in a response header rather than forcing a body wrapper on every response,
- operation-specific metadata may be added only when it has defined semantics.

This keeps resource bodies simple while retaining structured list pagination and cross-cutting request correlation.

### 8.5 Request and correlation ID

The trusted server generates a request identifier for every externally handled request if one does not already exist in a trusted internal continuation.

Conceptually expose:

```text
X-Request-Id: <opaque server request id>
```

The identifier should be available to:

- client support/debugging,
- structured logs,
- application execution context,
- provider calls where correlation is supported and safe,
- audit/domain continuation correlation where useful.

A client-supplied correlation/trace value, if supported, is untrusted input and must be length/format bounded. It cannot replace the server request identity.

### 8.6 Stable error model

Use HTTP status for broad transport semantics plus a stable GymPulse machine code for application semantics.

The leading format is **RFC 9457 Problem Details-compatible JSON**, with GymPulse extensions such as a stable `code`, safe structured validation issues where needed, and `requestId`.

Conceptual shape:

```json
{
  "type": "<stable GymPulse problem-type URI>",
  "title": "Membership not eligible",
  "status": 422,
  "code": "MEMBERSHIP_NOT_ELIGIBLE",
  "detail": "The current membership cannot be used for check-in.",
  "requestId": "req_..."
}
```

Exact problem-type URI namespace belongs to later API specification. Clients must branch on stable machine `code` and status semantics, not parse `title` or `detail` text.

Validation problems may include a bounded safe list of field/path issues. They must not echo secrets or unrestricted request values.

### 8.7 Error categories and statuses

Proposed baseline:

| HTTP status | GymPulse use |
|---|---|
| `400 Bad Request` | malformed JSON, invalid transport/contract syntax or unsupported query/filter structure |
| `401 Unauthorized` | required authentication evidence missing, invalid, expired, or unverifiable according to selected auth/session architecture |
| `403 Forbidden` | authenticated caller lacks authority and disclosing the protected resource context is safe |
| `404 Not Found` | resource absent **or intentionally undisclosed** to avoid cross-tenant/protected-resource enumeration |
| `409 Conflict` | current-state conflict, duplicate/state race, or incompatible idempotency-key reuse |
| `422 Unprocessable Content` | well-formed contract input cannot be processed because of a business/semantic rule that is not better represented as a state conflict |
| `429 Too Many Requests` | abuse/rate control has rejected the request; exact policy remains separate |
| `500 Internal Server Error` | unexpected internal failure without implementation detail disclosure |
| `503 Service Unavailable` | temporary system/provider dependency unavailability where retry may be appropriate |

`201 Created`, `202 Accepted`, and `204 No Content` remain available for successful semantics. `202` must mean processing has been accepted but is not yet complete; it must not masquerade as completed canonical business success.

### 8.8 Domain versus infrastructure errors

Stable business errors include concepts such as:

```text
MEMBERSHIP_NOT_ELIGIBLE
ATTENDANCE_DUPLICATE
CASE_CLOSED
IDEMPOTENCY_KEY_REUSED
```

Infrastructure details such as database timeout, connection failure, provider SDK exception, stack trace, SQL state, or internal file path are not public machine contracts. They are translated to safe dependency/internal categories and preserved in protected observability.

### 8.9 Error-detail safety

External errors must not disclose:

```text
other tenant identifiers
hidden resource existence when policy forbids disclosure
SQL / database details
stack traces
provider secrets or signing details
raw authentication/session tokens
authorization policy internals
unnecessary Member/private data
```

### 8.10 Purpose-specific projections

Response fields are selected for the authorized purpose, not because fields exist in a domain/database object.

Member-facing responses must not expose staff-only follow-up notes, internal audit metadata, other Members, provider secrets, role-assignment internals, or owner-only finance analytics.

Staff/Owner projections may differ where capability/scope and product purpose require it. Client-side hiding is not a security boundary.

## 9. Pagination, Idempotency, and Concurrency

### 9.1 Pagination default

Operational collections are mutable and can grow while a user is paging through them. Examples include Member search, attendance history, no-show/follow-up queues, renewal pipelines, payment exception queues, audit history, and data-quality queues.

Propose **opaque cursor/keyset-style pagination as the default for mutable operational lists**.

Offset pagination remains an allowed exception for small/static administrative lists or explicit UX needs where random page access matters more than mutation consistency and the performance behavior is understood.

### 9.2 Cursor contract

A cursor-paginated contract should define:

```text
items
nextCursor
hasMore
stable deterministic sort
tie-break semantics
page-size/limit bounds
filter/sort consistency across the cursor chain
invalid/expired cursor behavior
```

Cursors are opaque to clients. They must not require clients to construct database offsets, SQL expressions, or persistence primary-key internals.

A cursor may encode or bind filter/sort state internally, but the encoding/signing/storage strategy is an implementation detail.

### 9.3 Filtering and sorting

Each operation allowlists supported filters and sort fields.

Contract rules:

- filter names and meanings are stable per operation,
- sort direction uses a bounded documented enum,
- date ranges distinguish UTC instants from gym-local business dates,
- branch/gym filters are only routing/query intent and are independently authorization-scoped,
- unsupported filter/sort keys are rejected rather than interpreted as arbitrary storage fields,
- clients never submit raw SQL column/order expressions.

### 9.4 Idempotency contract

Designated retry-sensitive mutation operations accept an opaque client-generated idempotency key, using an `Idempotency-Key` request header or a semantically equivalent transport field if a future transport requires it.

The HTTP header is a GymPulse contract convention. As of the research date, the IETF `Idempotency-Key` header document remains an expired Internet-Draft rather than a published RFC; GymPulse must therefore define its own exact semantics rather than claim standards compliance.

Core semantic invariant:

```text
same resolved tenant/caller context
+ same operation
+ same idempotency key
+ compatible request
-> same canonical logical outcome
```

Applicable Phase 1 command categories include attendance check-in, assisted attendance, renewal-order creation, payment checkout initiation, and other explicitly designated retry-sensitive operations.

### 9.5 Idempotency cases

The implementation contract must distinguish:

- **previous success:** return/reconstruct the same canonical logical result; do not create another effect,
- **same key + materially different request:** reject with `409` and stable conflict code,
- **concurrent duplicate:** ensure only one logical effect can win; duplicate may wait for the canonical result or receive a bounded in-progress/conflict response according to later endpoint specification,
- **previous deterministic terminal business failure:** may replay the recorded logical failure when the implementation intentionally persists it,
- **transient infrastructure/provider failure:** must not be frozen permanently as a false business result; retry re-evaluates/reconciles according to operation semantics,
- **retired/expired key:** retention duration is a later policy/implementation decision and must not be invented here.

Keys must be bounded, opaque, non-secret, and unsuitable as the sole durable business uniqueness mechanism.

### 9.6 Idempotency is not transactionality

```text
Idempotency != Database Transaction
```

A local transaction protects atomic internal changes. Idempotency protects repeated logical requests/effects. Correct critical workflows may require both plus domain/database uniqueness.

### 9.7 Network timeouts and retries

A client timeout does not prove the server failed before commit.

Critical mutations must support recovery through one or both of:

```text
retry with same idempotency identity
read canonical operation/resource status after timeout
```

The contract must not instruct a client to create a new logical payment/check-in/renewal attempt merely because the response was lost.

### 9.8 Concurrency and business conflict

Examples include:

```text
duplicate attendance
already-closed no-show case
membership already frozen/cancelled
payment already processed
resource configuration changed since read
```

Use stable business conflict codes. `409` is the default transport category for a current-state conflict where the caller can potentially refresh/reconcile and retry.

HTTP conditional requests such as ETag/`If-Match` are an available later pattern for selected editable configuration resources that need lost-update protection. They are not a universal Phase 1 baseline and this ADR creates no version columns/ETag scheme.

## 10. Authentication, Authorization, and Tenant Boundary

### 10.1 Authentication contract categories

The contract architecture recognizes distinct trust categories:

```text
anonymous/public request where explicitly allowed
authenticated human request
verified provider callback
trusted background/internal invocation
```

Protected human calls require authentication evidence verified according to `D-ARCH-004`. This ADR does not select the provider, token/cookie/session format, or native credential storage model.

### 10.2 Authorization remains application-owned

The transport adapter must reach the authorization boundary proposed by ADR-0009:

```text
Principal
+ current account eligibility
+ named capability or Member-self relationship
+ trusted tenant/resource scope
+ trusted resource relationship
-> allow / deny
```

The following are not substitutes for authorization:

```text
route existence
HTTP method
framework middleware
client role string
DTO type
hidden button
opaque identifier alone
```

### 10.3 Tenant context

A client may submit a gym/branch/resource identifier where routing or filtering requires it. The server independently verifies that input against trusted Principal assignments and resource ownership.

A generic header such as `X-Tenant-Id`, if ever introduced as a routing hint, must never become authorization proof.

### 10.4 401 / 403 / 404 posture

The API must be able to distinguish internally between:

```text
unauthenticated
invalid authentication
authenticated but unauthorized
resource absent
resource exists but must remain undisclosed
```

External mapping is use-case/security dependent. Cross-tenant resource probing must not become enumerable through inconsistent `403`/`404` details.

### 10.5 Member-self APIs

Where it improves safety and ergonomics, self-service may use `/me`-style contract patterns that derive Member identity from the verified Principal/link rather than accepting arbitrary Member IDs.

Illustrative only:

```text
/me/membership
/me/attendance
/me/renewal-options
```

This reduces BOLA surface but does not replace Member-self authorization. Explicit resource IDs remain valid where the use case genuinely needs them.

### 10.6 Staff APIs

Staff operations can accept explicit opaque resource IDs such as Member IDs. Those IDs are locators, not authority. The server resolves ownership/scope and capability for each protected operation.

### 10.7 Audit attribution

Trusted actor identity comes from Principal/System Context, not from client JSON.

A client may supply an explicit business reason, note, or intended action where required, but cannot set authoritative `actorId`, tenant, or audit timestamp fields.

Sensitive commands that require a reason should model the reason explicitly in the request contract rather than hiding it in generic metadata.

### 10.8 Browser transport constraints

CORS, CSRF, cookie attributes, bearer/session transport, and allowed origins depend on `D-ARCH-004`, `D-ARCH-006`, and final deployment topology.

Constraints preserved here:

- credentialed/private APIs must not assume permissive `Access-Control-Allow-Origin: *`,
- if cookie-authenticated browser mutations are selected, the approved CSRF defense remains mandatory,
- auth/session secrets never become normal API response fields or client logs.

## 11. Provider Callback / Webhook Contracts

Provider callbacks are a separate contract class from human APIs.

### 11.1 Trust flow

```text
raw provider HTTP request
  -> preserve verification-required bytes/headers
  -> provider authenticity verification
  -> runtime-validate/normalize provider event after or as required by verification semantics
  -> resolve canonical internal resource
  -> resolve tenant/resource ownership
  -> bounded application use case
  -> canonical transition/idempotent effect
```

If a provider signs raw bytes/body, framework parsing must not destroy or mutate the verification material before the provider adapter can verify it.

### 11.2 No human session assumption

A webhook does not use logged-in Member/Staff authorization as its trust basis. It uses provider-specific authenticity verification, then bounded internal resource/tenant resolution and application behavior.

### 11.3 Duplicate delivery

Provider retries are expected. A valid already-processed provider event should receive the provider-appropriate success/acknowledgement behavior when the business effect is already safely idempotent.

Exact callback response codes and retry interpretation remain provider-specific under the selected provider adapter. Duplicate delivery must never apply the business effect twice.

### 11.4 Webhook response safety

Callback responses must not disclose internal payment state, tenant data, stack traces, provider secrets, or authorization internals. Diagnosis belongs in protected logs/telemetry with provider/request correlation.

### 11.5 Provider payload boundary

Raw Razorpay/Cashfree/other payment objects, authentication provider user objects, messaging-provider callbacks, and other provider-specific payloads stop at integration adapters. Normal clients receive canonical GymPulse representations, except for narrowly approved public checkout fields required by the chosen provider.

## 12. Versioning and Compatibility

### 12.1 Version strategy

Propose an explicit **major contract version in the HTTP API namespace from the first supported client contract**, conceptually `v1`.

The exact host/base prefix is a later deployment/API-spec detail; the architectural rule is that a major version is visible to independently deployed clients rather than inferred from framework build coupling.

Rationale:

- web and future native clients may have different release cadences,
- payment/provider integrations and future first-party clients benefit from explicit compatibility boundaries,
- adding a major namespace at the start is low cost,
- compatible additive evolution can continue within one major version without route churn.

Header/media-type versioning is more flexible but harder to inspect/debug and offers no demonstrated Phase 1 benefit over a simple major namespace. "No version until the first breaking change" is simpler initially but creates avoidable migration work once a native or independently deployed client exists.

### 12.2 Compatibility within a major version

Potentially breaking changes include:

```text
removing or renaming a field
changing a field's meaning/type
making an optional request field required
changing an existing enum meaning
adding an output enum value when existing clients cannot safely handle unknown values
renaming/removing a stable machine error code
changing pagination/cursor semantics
changing authorization/existence-disclosure behavior
changing money/time semantics
changing idempotency semantics
```

Usually compatible changes include additive optional response fields and new endpoints/commands, provided clients are explicitly expected to ignore unknown response fields.

### 12.3 Enum evolution

Response enums are compatibility-sensitive. Independent clients must not be assumed to survive a newly added server value merely because code generation produced a closed union.

Rules:

- request enums accept only documented supported values,
- response enum additions require review of supported-client fallback behavior,
- clients should have an unknown/fallback presentation where product semantics permit,
- security/business-critical enum additions may require coordinated client/server rollout instead of blind additive release.

### 12.4 Deprecation

A contract deprecation process should:

```text
document the replacement
identify affected clients/consumers
instrument usage where practical and privacy-safe
coordinate migration according to product/client needs
remove only through a controlled release/change review
```

No fixed deprecation window is invented here.

### 12.5 API change governance

Material breaking API changes require requirement/client/security impact review, contract update, tests, and release coordination. A new ADR is required only for architecture-level contract changes, not every endpoint or field change.

## 13. Security and Privacy Impact

### 13.1 API threat model

| Threat | Architectural mitigation |
|---|---|
| BOLA / IDOR | Opaque IDs are locators only; resolve trusted ownership and run Member-self/capability authorization for every protected resource operation |
| Broken function-level authorization | Route existence/HTTP verb/UI visibility never grants permission; application named-capability authorization remains mandatory |
| Mass assignment | Explicit input DTO allowlists; reject unknown sensitive mutation fields; never bind JSON directly to domain/persistence objects |
| Over-fetching / property exposure | Purpose-specific response DTOs; do not serialize database/domain objects wholesale; response-contract tests |
| Sensitive data exposure | Data-minimized projections; safe error/details policy; server-only secrets/provider objects |
| Client tenant spoofing | Tenant/gym/branch input is untrusted routing/filter intent and independently resolved from Principal/resource state |
| Contract/schema validation bypass | Runtime trust-boundary validation before application/domain use; request-size/type/enum/ID/date/money bounds |
| Parameter pollution / unsupported filters | Define one bounded parameter contract per operation; reject unsupported/repeated forms according to schema rather than pass through to SQL |
| Idempotency replay/collision | Scope key by trusted context+operation, compare request compatibility, durable app/business dedupe, bounded key validation |
| Webhook forgery | Preserve provider verification material and authenticate callback before canonical mutation |
| Webhook replay | Provider-event uniqueness plus idempotent canonical business effects |
| Provider payload leakage | Provider objects stop at adapters; clients receive canonical safe DTOs only |
| Unsafe generic PATCH | Explicit allowlisted editable fields; sensitive transitions use business commands |
| Error-based resource enumeration | Consistent safe `403/404` behavior; no cross-tenant identifiers or hidden policy details |
| Unbounded pagination/filtering | Bounded page size, opaque cursor, filter/sort allowlist, request/query-size limits |
| Request flooding / expensive sensitive flows | Consistent `429` support, request-size bounds, operation-specific abuse controls; exact thresholds/storage remain separate |
| Framework-specific contract coupling | Canonical semantics defined independently of Next.js/Express/Fastify/Hono/Nest/etc. |
| Stale generated client/schema drift | One primary contract representation with mechanically derived types/docs plus future drift tests |

The OWASP API Security Top 10 2023 specifically reinforces BOLA, broken authentication, broken object-property authorization (including excessive data exposure/mass assignment), resource consumption, broken function-level authorization, sensitive business-flow abuse, inventory/version management, and unsafe provider consumption as relevant design risks.

### 13.2 Request-size and resource bounds

Each operation must have bounded request/query/body/file limits appropriate to its purpose. Exact numerical limits are implementation/security policy, not this ADR.

Bulk imports, uploads, provider webhooks, authentication/OTP/payment initiation, and search endpoints require explicit resource/abuse consideration.

### 13.3 Unknown fields and mass assignment

A Member-profile update must not become capable of changing fields such as:

```text
role/assignments
tenant ownership
membership entitlement/status
payment state
audit actor
authorization scope
```

merely because those properties exist in internal models.

### 13.4 Sensitive caching

Private Member/Staff/payment/dashboard responses must not be made shared-cacheable by default. HTTP caching is evaluated per endpoint later. Public immutable/reference data may use cache semantics when explicitly safe.

No CDN/provider is selected.

### 13.5 Data minimization

PII such as phone/email and private Member operational data is returned only when the authorized operation needs it. Search/list responses may use summary or masked values where product workflow supports that, but no blanket masking rule is invented here.

## 14. Reliability, Performance, and Scalability Impact

### 14.1 Retry model

Clients can distinguish:

```text
safe/idempotent reads
explicitly idempotent critical mutations
non-idempotent external-provider operations protected by application idempotency/reconciliation
```

Automatic retries must respect operation semantics. Network retries must not duplicate attendance, renewal, payment, or other critical effects.

### 14.2 Partial failure

External providers do not participate in GymPulse's local transaction.

A workflow can legitimately expose transitional canonical states such as `Pending`/`Processing` when:

```text
local state
+
provider interaction
+
durable continuation/reconciliation
```

cannot complete atomically.

The API reports canonical application state rather than pretending distributed work is one transaction.

### 14.3 Asynchronous operations

Use `202 Accepted` only when processing is genuinely asynchronous and not yet complete. If imports/exports or another long-running operation later requires asynchronous execution, the contract should expose an operation/reference that can be queried or used to retrieve the authorized result.

Do not introduce queues or asynchronous export infrastructure without requirement evidence.

### 14.4 File transport

Standard application JSON is not used as a forced container for large binary data.

Future file contract candidates include:

```text
multipart upload
server-mediated upload
short-lived signed object-storage upload/download
```

Selection depends on `D-ARCH-010`, security, size, and product requirements. Protected file authorization/business metadata remains server-governed.

### 14.5 Query complexity

JSON HTTP keeps query complexity explicit per route/query contract. If GraphQL is reconsidered later, depth/cost limits, resolver authorization, batching/N+1 control, and resource-consumption protections become mandatory evaluation gates.

### 14.6 Horizontal and deployment evolution

The contract uses no process-local business state and no framework-specific client serialization as canonical semantics. It can therefore be served by a co-hosted trusted runtime or an independently deployed API if `D-ARCH-006` later chooses either topology.

## 15. Operations and Observability Impact

### 15.1 Safe request telemetry

The API layer should propagate safe operational metadata such as:

```text
request ID
correlation ID
operation name
resolved Principal ID where appropriate
verified tenant/gym/branch scope where privacy-safe
latency
HTTP status
stable error category/code
idempotency replay indicator where useful
provider event/reference where safe
```

It must avoid logging:

```text
passwords
OTP values
auth tokens/cookies
provider secrets/webhook signing material
raw card/UPI data
full sensitive request bodies by default
private notes unless explicitly justified
```

### 15.2 API metrics

Future operational metrics may include request count, latency, status/error rate, contract-validation failure, authorization denial category, idempotency replay, webhook verification/processing failure, and dependency failure.

No observability provider is selected.

### 15.3 Rate-limit semantics

The contract supports `429 Too Many Requests` and, where appropriate, retry guidance. Exact rate-limit numbers, distributed storage, vendor, device/IP strategy, CAPTCHA, or provider abuse-control implementation remain outside this ADR.

### 15.4 Documentation and inventory

Canonical architecture/product docs own behavior semantics. Generated API reference may later describe routes, schemas, auth requirements, errors, and examples, but it does not replace requirements/domain documentation.

API inventory/version visibility is an operational security concern; deprecated/debug/old endpoints must not remain unintentionally reachable.

## 16. Testing and Validation

No tests are implemented by this ADR. Before acceptance/production implementation, future automated validation should include at least:

1. malformed JSON is rejected safely,
2. wrong path/query/header types are rejected,
3. unknown/mass-assignment fields follow the declared policy,
4. missing authentication is rejected on protected operations,
5. invalid/expired/unverifiable authentication is rejected,
6. wrong-tenant resource request is denied without leakage,
7. Member-self resource-ID substitution is denied,
8. directly invoking a hidden UI operation still enforces authorization,
9. unauthorized versus not-found behavior matches the security policy consistently,
10. error responses contain no sensitive implementation/tenant/private details,
11. oversized requests are bounded,
12. unbounded page-size attempts are rejected/clamped according to later contract policy,
13. unsupported filters/sorts are rejected,
14. attendance retry with the same logical idempotency key creates one effect and returns the canonical result,
15. same idempotency key with a materially different request produces a stable conflict,
16. concurrent duplicate mutation creates at most one logical business effect,
17. client timeout followed by same-key retry recovers the canonical result,
18. a client cannot forge online Payment `Paid` state,
19. final renewal amount is computed/validated server-side rather than trusted from the client,
20. client-supplied actor ID cannot forge audit attribution,
21. forged webhook signature/authenticity evidence is rejected,
22. valid webhook verification path succeeds,
23. duplicate valid webhook delivery does not duplicate the business effect,
24. framework/raw-body handling preserves provider signature-verification material,
25. raw provider payload/secret fields do not leak into normal client DTOs,
26. money serializes as integer minor units plus currency according to the approved data decision,
27. event timestamps serialize as unambiguous UTC instants,
28. business date/local time/timezone identifier are not confused with UTC instants,
29. cursor pagination remains consistent under the documented sort/filter contract,
30. an older supported client tolerates an additive optional response field,
31. output enum expansion receives explicit compatibility review/fallback coverage,
32. generated/documented schema drift is detected if OpenAPI/client generation is adopted,
33. request/correlation ID appears consistently in response/telemetry paths,
34. abuse-controlled operations can emit stable `429` behavior,
35. provider/dependency failures map to safe stable external semantics without raw exception leakage,
36. response DTO validation/projection prevents unauthorized over-fetching,
37. direct DB/domain object serialization cannot bypass response contracts,
38. `202` operations distinguish accepted/in-progress from completed canonical business state,
39. safe retry guidance does not create new logical payment/check-in/renewal effects,
40. if ETag/`If-Match` is later used, stale preconditions cannot silently overwrite newer state.

If OpenAPI or generated clients are introduced later, contract tests should compare the runtime contract, generated description, and generated consumer types where applicable.

## 17. Migration and Rollout

There is no accepted GymPulse application API implementation to migrate in this governance task. Legacy `docs/07-api-contracts.md` remains migration/evidence material; its endpoint paths and envelopes do not become canonical merely because they exist.

If this ADR is later accepted, implementation should proceed in controlled stages:

```text
1. approve D-ARCH-003 / ADR through normal governance
2. select compatible runtime/framework/validator tooling through separately governed implementation decisions
3. define reusable contract primitives: IDs, time, money, problem/error, pagination, idempotency
4. write endpoint-level specifications under docs/06-api/
5. implement runtime schemas and explicit DTO mapping at transport boundaries
6. implement thin framework adapters over existing application commands/queries
7. add contract/authz/idempotency/webhook/security tests
8. optionally derive OpenAPI and/or generated clients where value is demonstrated
9. validate web and Member/future-native consumers against the supported major contract version
10. deploy only through the separately approved API/hosting/release topology
```

A secondary framework action/server function may call the same application command/query for co-hosted web ergonomics, but it must not create a second set of business/security semantics.

## 18. Reversibility

### JSON HTTP resource/action contract

High reversibility. The wire format is broadly interoperable and can be implemented by different frameworks/languages. The application/domain layer remains transport-independent.

### Runtime-schema-first ownership

Medium-High reversibility if schemas remain contract-focused and framework-neutral. A validator library can be replaced when the public semantics remain stable.

### Derived TypeScript types

High reversibility for clients/servers if `D-ARCH-016` is later accepted. The wire contract remains language-neutral.

### Derived OpenAPI

High reversibility when treated as a generated artifact rather than a separate manually maintained truth source.

### Typed RPC as canonical contract

Medium reversibility because client/server type-system coupling can spread across application call sites.

### GraphQL as canonical contract

Medium reversibility because client query documents, schema/resolver behavior, and operational tooling become platform assumptions.

### gRPC/Protobuf-first

Medium reversibility due IDL/code-generation/tooling/client commitments, despite strong compatibility support.

### Framework actions as primary contract

Lower reversibility because client transport and business entry semantics become tied to the selected web framework/runtime.

## 19. Risks and Mitigations

| Risk | Mitigation / decision boundary |
|---|---|
| JSON HTTP degenerates into DB CRUD | Resource/action semantics, explicit application commands, DTO/domain/persistence separation |
| TypeScript type mistaken for validation | Runtime schemas mandatory at external trust boundaries; static types are derived convenience only |
| Runtime schema and static type drift | One primary schema representation or mechanical synchronization; future drift tests |
| OpenAPI becomes stale | Generate/export from runtime contract where practical; do not hand-maintain a second truth source without automated drift control |
| Mass assignment | Explicit mutation DTO allowlist + unknown-field policy + no auto-binding to persistence/domain entities |
| Over-fetching | Purpose-specific response DTOs and response-contract tests |
| Cross-tenant BOLA | Every protected object access resolves trusted ownership + capability/Member-self authorization |
| Generic PATCH changes protected state | Sensitive lifecycle/financial/audit actions use explicit commands |
| Client forges canonical truth | Server derives payment/eligibility/price/time/actor/provider state from canonical data/evidence |
| Idempotency key reused with different intent | Request compatibility/fingerprint check and stable `409` conflict |
| Duplicate request races | Durable application/business uniqueness + transaction/idempotency coordination |
| Client timeout causes duplicate payment/attendance | Same-key retry/read-after-timeout canonical recovery |
| Cursor leaks DB internals | Opaque cursor contract; no required raw offset/primary-key exposure |
| New enum breaks old client | Treat output enum additions as compatibility-sensitive; require fallback/coordinated rollout where needed |
| `403/404` leaks resource existence | Use consistent use-case-specific undisclosed-not-found behavior |
| Error body leaks internals | RFC 9457-compatible safe public problem details + protected correlated diagnostics |
| Framework parser breaks webhook signature | Raw-body/verification material preservation is an explicit callback contract requirement |
| Provider object leaks to clients | Provider adapter normalization and narrow public checkout projection |
| Framework/server-action coupling blocks native/API extraction | Framework actions remain optional secondary adapters, not canonical contract |
| GraphQL query abuse if later adopted | Separate future decision must include depth/cost/authz/N+1/resource controls |
| Unbounded request/filter/page consumes resources | Operation-specific size/page/filter bounds and abuse controls |
| Sensitive private responses cached publicly | Private-by-default cache posture; per-operation explicit caching only |
| OpenAPI/client generation creates tool lock-in | Generation is optional; semantics remain runtime/framework independent |
| API version sprawl | One major namespace; additive compatible changes stay within the major; deprecate deliberately |
| Background jobs exposed as unauthenticated HTTP shortcuts | Jobs remain internal adapter contracts unless a separately secured topology explicitly requires HTTP |

## 20. Open Questions

- Who is the authorized decision owner for `D-ARCH-003`?
- Which runtime schema/validation library, if any, best satisfies the accepted runtime/framework after `D-ARCH-016`/`D-ARCH-012`/`D-ARCH-006` are resolved?
- Should response schemas be runtime-validated in production for every response, only for higher-risk boundaries, or primarily in tests/non-production after explicit DTO construction?
- What exact stable namespace should GymPulse use for RFC 9457 problem `type` URIs?
- What exact request-ID header casing/name and correlation propagation rules should endpoint-level documentation standardize?
- Which operations require `Idempotency-Key` versus domain-specific unique operation identities?
- What later retention period should idempotency records use per operation class?
- Should concurrent same-key in-progress duplicates wait briefly for a canonical result or receive an explicit in-progress conflict/status response?
- Which small/static lists justify offset pagination as an exception to cursor-first pagination?
- Which editable configuration resources, if any, warrant ETag/`If-Match` optimistic concurrency?
- What exact output-enum fallback conventions should web/native generated clients follow?
- What exact major-version base-path shape should be used once API host/deployment topology is known?
- Which successful command responses should use `200`, `201`, or `204` in the endpoint-level contract?
- Which long-running import/export operations, if any, require explicit asynchronous operation resources in Phase 1?
- Does future public/partner API demand justify moving from runtime-schema-first to OpenAPI/IDL-first governance?
- When a native Member client is approved, is shared static typing sufficient or does generated HTTP client code materially reduce contract drift?

## 21. Decision Evidence

### 21.1 Canonical repository evidence

Latest `main` at drafting time establishes:

- `D-ARCH-003` is `P0 PROPOSED`, with JSON HTTP + typed/runtime-validated contracts as the current recommendation.
- `D-ARCH-006` remains `OPEN`; co-hosted and independently deployed API mappings are both still viable.
- `D-ARCH-004` and `D-SEC-002` remain `OPEN`; authentication/session and Member verification remain separately governed.
- `D-ARCH-015` remains `PROPOSED`; ADR-0009 proposes application capability/scope/resource authorization but is not Accepted.
- `D-SEC-008` remains `OPEN`; ADR-0010 proposes data-layer tenant isolation/RLS defense in depth but is not Accepted.
- `D-ARCH-016` is DECIDED for the TypeScript/Node.js category; `D-ARCH-012` and `D-ARCH-013` remain Proposed framework/client decisions.
- the component architecture already requires a Transport/Entry Adapter, Contract/Boundary Validator, provider callback entry, request/correlation context, authentication/principal resolution, trusted resource/scope resolution, capability authorization, and thin application command/query handlers.
- the data-flow architecture already separates request idempotency, provider-event deduplication, job deduplication, and business-effect uniqueness.
- no current ADR is Accepted and no approval evidence for `D-ARCH-003` was found before drafting ADR-0011.
- repository search did not reveal an installed/selected API framework, validator, RPC stack, GraphQL stack, or OpenAPI generator.

Legacy `docs/07-api-contracts.md`, `docs/05-system-architecture.md`, `docs/12-security-audit.md`, and `docs/16-open-decisions.md` were used only as migration/evidence sources. Their endpoint examples, `/v1` paths, response envelopes, or legacy stack statements do not override current structured governance.

### 21.2 Current official standards and technology research

**Research date:** `2026-09-11`

Authoritative material reviewed for claims that can materially affect the architecture:

- RFC 9110, HTTP Semantics: `https://www.rfc-editor.org/rfc/rfc9110.html`
  - confirms method safety/idempotency semantics, standard status semantics, `409 Conflict`, `422 Unprocessable Content`, and conditional `If-Match` use for preventing lost updates.
- RFC 6585, Additional HTTP Status Codes: `https://www.rfc-editor.org/rfc/rfc6585.html`
  - defines `429 Too Many Requests`.
- RFC 9457, Problem Details for HTTP APIs: `https://www.rfc-editor.org/rfc/rfc9457.html`
  - defines `application/problem+json`, standard problem fields/extensions, and explicitly advises clients not to parse human `detail` text as machine semantics.
- OpenAPI Specification: `https://spec.openapis.org/oas/`
  - current published specification includes OpenAPI 3.2.0 (published 2025-09-19) and defines a language-neutral HTTP API description usable by documentation/codegen/testing tools. This ADR does not pin an OpenAPI version or generator.
- JSON Schema current specification: `https://json-schema.org/specification`
  - current released version remains Draft 2020-12 and provides a language-independent JSON structure/validation vocabulary. This ADR does not require JSON Schema as the implementation source.
- GraphQL September 2025 Specification: `https://spec.graphql.org/September2025/`
  - confirms typed schema, query/mutation language, validation/execution and introspection capabilities used in the GraphQL option evaluation.
- tRPC official documentation: `https://trpc.io/`
  - documents TypeScript inference, no-codegen end-to-end typing, and adapters across JavaScript frameworks/runtimes. These are strengths of Option B, not a selection.
- gRPC official documentation: `https://grpc.io/docs/what-is-grpc/introduction/` and `https://grpc.io/docs/platforms/web/`
  - documents Protocol Buffers service definitions, generated client/server code, multi-language support, and the gRPC-Web browser model used in Option D evaluation.
- OWASP API Security Top 10 2023: `https://owasp.org/API-Security/editions/2023/en/0x11-t10/`
  - current public edition reviewed for BOLA, broken authentication, object-property authorization/mass assignment, resource consumption, function-level authorization, sensitive-flow abuse, inventory, and unsafe provider-consumption risks.
- IETF HTTPAPI `Idempotency-Key` draft: `https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/`
  - latest revision 07 expired on 2026-04-18 and is not a published RFC. GymPulse may still define `Idempotency-Key` as its own contract convention, but must not describe it as a current IETF standard.

No external standard or technology was adopted merely because it was researched.

### 21.3 Acceptance evidence still missing

Before ADR-0011 can become `Accepted` and `D-ARCH-003` can become `DECIDED`, evidence still includes at least:

- an authorized decision owner and explicit approval,
- review of the JSON HTTP versus typed RPC/GraphQL/gRPC/framework-action tradeoffs,
- confirmation that the runtime-schema-first model is compatible with the finally accepted language/framework/runtime,
- representative request/response validation spike without selecting a library through this ADR,
- raw-body webhook verification compatibility with the chosen runtime/framework,
- idempotency concurrency/retry validation on attendance/payment-like flows,
- Member/staff authorization/BOLA contract tests,
- stable error/problem model review by client and security owners,
- cursor pagination validation on mutable operational queues,
- compatibility behavior for independent web/native client releases,
- OpenAPI derivation/drift feasibility if OpenAPI is adopted,
- deployment compatibility with both currently viable `D-ARCH-006` mappings.

## 22. Related Documents

- `README.md`
- `../README.md`
- `../00-overview/assumptions.md`
- `../01-product/functional-requirements.md`
- `../01-product/non-functional-requirements.md`
- `../01-product/user-roles.md`
- `../01-product/personas.md`
- `../01-product/user-journeys.md`
- `../02-architecture/architecture-principles.md`
- `../02-architecture/architecture-overview.md`
- `../02-architecture/system-context.md`
- `../02-architecture/container-architecture.md`
- `../02-architecture/component-architecture.md`
- `../02-architecture/data-flow.md`
- `../02-architecture/technology-stack.md`
- `ADR-0007-authentication-session-architecture.md`
- `ADR-0008-member-authentication-method.md`
- `ADR-0009-authorization-implementation.md`
- `ADR-0010-data-layer-tenant-isolation-rls.md`
- legacy migration source: `../07-api-contracts.md`
- legacy migration source: `../05-system-architecture.md`
- legacy migration source: `../12-security-audit.md`
- legacy migration source: `../16-open-decisions.md`
