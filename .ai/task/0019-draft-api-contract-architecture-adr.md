# Task 0019: Draft Primary API Contract Architecture ADR

## Goal

Draft one `Proposed` ADR for canonical architecture decision `D-ARCH-003`, defining GymPulse's primary client/server contract architecture independently from final web framework, API deployment topology, provider products, persistence tooling, and implementation libraries.

Canonical target:

`docs/adr/ADR-0011-api-contract-architecture.md`

## Inputs Read

Current structured repository inputs reviewed from latest `main`:

- `.ai/README.md`
- `.ai/current-state.md`
- `.ai/task/0018-draft-data-layer-tenant-isolation-rls-adr.md`
- `docs/README.md`
- `docs/00-overview/assumptions.md`
- `docs/01-product/functional-requirements.md`
- `docs/01-product/non-functional-requirements.md`
- `docs/01-product/user-roles.md`
- `docs/01-product/personas.md`
- `docs/01-product/user-journeys.md`
- `docs/02-architecture/architecture-principles.md`
- `docs/02-architecture/architecture-overview.md`
- `docs/02-architecture/system-context.md`
- `docs/02-architecture/container-architecture.md`
- `docs/02-architecture/component-architecture.md`
- `docs/02-architecture/data-flow.md`
- `docs/02-architecture/technology-stack.md`
- `docs/adr/README.md`
- `docs/adr/ADR-0007-authentication-session-architecture.md`
- `docs/adr/ADR-0008-member-authentication-method.md`
- `docs/adr/ADR-0009-authorization-implementation.md`
- `docs/adr/ADR-0010-data-layer-tenant-isolation-rls.md`

Legacy migration/evidence inputs reviewed without treating them as canonical:

- `docs/07-api-contracts.md`
- `docs/05-system-architecture.md`
- `docs/12-security-audit.md`
- `docs/16-open-decisions.md`

External official research was limited to current HTTP/IETF standards, OpenAPI, JSON Schema, GraphQL, tRPC, gRPC, and OWASP API Security material needed for architecture comparison and security semantics.

## Repository State Verified

Before creating ADR-0011:

- `docs/adr/ADR-0011-api-contract-architecture.md` did not exist on current `main`.
- `.ai/task/0019-draft-api-contract-architecture-adr.md` did not exist.
- `D-ARCH-003` remained the actual next undrafted item in the canonical ADR dependency queue after ADR-0010.
- `D-ARCH-003` remained `P0 PROPOSED` in `docs/00-overview/assumptions.md`.
- repository search found no explicit approval evidence promoting `D-ARCH-003` to `DECIDED` or accepting an API-contract ADR.
- no current ADR was `Accepted`.
- `D-ARCH-006` remained `OPEN`; co-hosted versus independent API deployment remained unresolved.
- `D-ARCH-012` and `D-ARCH-013` remained `PROPOSED`; no web/native framework was accepted.
- `D-ARCH-016` remained `PROPOSED`; TypeScript/Node.js remained a recommendation only.
- `D-ARCH-004` and `D-SEC-002` remained `OPEN`; authentication/session and Member verification remained separate.
- `D-ARCH-015` remained `PROPOSED`; application authorization remained mandatory and ADR-0009 remained only Proposed.
- `D-SEC-008` remained `OPEN`; ADR-0010 remained only Proposed.
- direct browser/mobile canonical database access remained unapproved.
- repository search found no installed/selected Express, Fastify, Hono, NestJS, tRPC, GraphQL, validator, or OpenAPI-generation stack.

## Canonical Decision State

```text
D-ARCH-003
Priority: P0
Status: PROPOSED
Decision: Primary client/server contract architecture
Current direction: JSON HTTP with typed/runtime-validated contracts
```

`ADR-0011` is drafted as `Proposed`. Task 0019 does not change `D-ARCH-003` to `DECIDED`.

## Existing Contract Evidence

Canonical structured architecture already establishes:

- clients are untrusted for canonical business truth,
- the trusted Application/API boundary owns request decoding, authentication handoff, Principal resolution, tenant/resource resolution, capability authorization, contract validation, safe response/error translation, transactions, idempotency, and canonical reads/writes,
- transport adapters must stay thin,
- provider callbacks require a distinct raw-request verification/normalization path,
- request idempotency, provider-event deduplication, job deduplication, and business-effect uniqueness are different controls,
- API deployment topology is separately governed.

Legacy `docs/07-api-contracts.md` provides migration evidence for JSON HTTPS, stable machine error codes, idempotency keys, request IDs, cursor pagination, explicit business-action routes, and raw webhook verification. Its exact endpoints, `/v1` paths, and `{data,meta}` envelope were not treated as canonical automatically.

## Trust Boundary Findings

Mandatory separations preserved:

```text
Static Type != Runtime Validation
Authentication != Authorization
API DTO != Application Command/Query
Application Command/Query != Domain Model
Domain Model != Persistence Model
Provider Payload != Public Client DTO
Client Tenant ID != Trusted Tenant Scope
Client Success Screen != Canonical Payment Success
```

The request pipeline is staged. Runtime contract validation, authentication verification, Principal resolution, trusted resource/scope resolution, authorization, and domain validation remain explicit controls. Exact middleware ordering can vary, but no untrusted client field may become trusted scope/business truth merely because it is typed or parsed.

## Architecture Options Evaluated

1. **JSON HTTP resource/action API + runtime-validated typed contracts**.
2. **Typed RPC / tRPC-style contract**.
3. **GraphQL**.
4. **gRPC / Protobuf-first**.
5. **Framework-specific server actions/internal function calls as the primary contract**.

The evaluation considered web fit, future native fit, runtime validation, compile-time types, security-boundary visibility, authorization, idempotency, provider webhooks, errors, pagination, documentation, OpenAPI/tooling, provider/framework/deployment independence, non-TypeScript interoperability, debuggability, operations, Phase 1 simplicity, evolution, and reversibility.

## Contract Source Models Evaluated

Compared:

```text
runtime-schema first
OpenAPI first
static type-only first
framework-inferred
```

Static type-only validation was explicitly rejected as sufficient because external runtime data remains untrusted.

The strongest current source model is runtime-schema first, with static types and documentation generated/derived where compatible with the eventually accepted language/tooling.

## Current Standards / Official Research

Research date: `2026-09-11`.

Official sources reviewed:

- RFC 9110 HTTP Semantics: `https://www.rfc-editor.org/rfc/rfc9110.html`
- RFC 6585 Additional HTTP Status Codes: `https://www.rfc-editor.org/rfc/rfc6585.html`
- RFC 9457 Problem Details for HTTP APIs: `https://www.rfc-editor.org/rfc/rfc9457.html`
- OpenAPI Specification: `https://spec.openapis.org/oas/`
- JSON Schema current specification: `https://json-schema.org/specification`
- GraphQL September 2025 Specification: `https://spec.graphql.org/September2025/`
- tRPC official documentation: `https://trpc.io/`
- gRPC introduction and gRPC-Web documentation: `https://grpc.io/docs/what-is-grpc/introduction/`, `https://grpc.io/docs/platforms/web/`
- OWASP API Security Top 10 2023: `https://owasp.org/API-Security/editions/2023/en/0x11-t10/`
- IETF HTTPAPI Idempotency-Key draft: `https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/`

Material findings:

- RFC 9110 provides standard method/idempotency/status/conditional-request semantics, including `409`, `422`, and `If-Match` lost-update protection.
- RFC 6585 defines `429 Too Many Requests`.
- RFC 9457 defines `application/problem+json`; human detail text is not intended as a machine contract.
- current published OpenAPI includes v3.2.0, but no OpenAPI version/generator is pinned by this task.
- JSON Schema's current released specification remains 2020-12, but JSON Schema is not required as GymPulse's source of truth.
- current GraphQL specification includes typed schema, validation/execution and introspection.
- tRPC officially emphasizes end-to-end TypeScript inference/no codegen and JS runtime/framework adapters.
- gRPC officially uses Protocol Buffers service definitions and generated code; gRPC-Web provides a browser path.
- OWASP 2023 reinforces BOLA, broken object-property authorization/mass assignment, resource consumption, function-level authorization, sensitive business-flow abuse, inventory/version management, and unsafe provider consumption.
- the IETF `Idempotency-Key` HTTP header draft revision 07 expired on 2026-04-18 and is not a published RFC. GymPulse can use that header as its own explicit contract convention but must not claim current standards status.

## Evaluation Summary

Strongest current Phase 1 fit:

```text
JSON over HTTPS
+
resource/query reads and explicit business-command actions
+
runtime trust-boundary schemas
+
purpose-specific DTOs
+
stable HTTP semantics and machine errors
+
cursor-first bounded operational pagination
+
explicit idempotency for retry-sensitive commands
+
provider-specific webhook verification boundary
+
optional mechanically derived OpenAPI
+
framework/deployment independence
```

Typed RPC is credible for a tightly coupled TypeScript-only surface but weaker as the canonical language-neutral multi-client/provider contract. GraphQL and gRPC provide real capabilities but introduce platform/tooling cost not justified by current Phase 1 needs. Framework-specific server actions may remain a secondary adapter optimization, not the canonical contract.

## Proposed Direction

ADR-0011 proposes:

- JSON over HTTPS as the primary external first-party application contract,
- resource-oriented reads plus explicit business command/action contracts,
- runtime-schema-first trust-boundary definitions,
- API DTO / application / domain / persistence separation,
- no direct DB/ORM/provider object exposure,
- direct purpose-specific success DTOs rather than a universal `{data,meta}` envelope,
- collection responses with explicit `items` + `page`,
- RFC 9457-compatible errors with a stable GymPulse machine `code` extension,
- response request ID header plus protected correlation context,
- cursor/keyset-style default pagination for mutable operational lists,
- `Idempotency-Key` as a GymPulse-defined convention for designated retry-sensitive commands,
- a major API namespace/version (`v1`) from the first supported independently consumable contract,
- optional OpenAPI mechanically derived from runtime contracts where tooling proves reliable,
- framework/deployment/provider independence.

No exact endpoint inventory is finalized.

## Request / Response Model

Request DTOs explicitly allowlist writable fields and reject unknown properties by default for security-sensitive mutations; operation-specific tolerance requires justification.

Clients are not trusted to provide payment success, membership entitlement/extension, canonical attendance timestamps, final renewal price, trusted tenant scope, actor/audit identity, provider verification state, or derived no-show state.

Success responses use purpose-specific direct JSON DTOs. Collections use a stable object containing `items` and pagination data. Request correlation lives in a response header so it also works for `204`, non-JSON, and file responses.

Standard application content is `application/json`; file/binary/provider callback formats are separate.

## Runtime Validation Model

External contract validation covers path/query/header/body shape, enum values, IDs, dates/timestamps, money inputs, pagination, idempotency keys, and provider callback structures where applicable.

Validation remains layered:

```text
contract shape
!= authentication
!= authorization
!= domain validation
!= database constraints
!= provider verification
```

No validation library is selected.

## Type Strategy

If `D-ARCH-016` later accepts TypeScript, static TypeScript request/response types should be derived from or mechanically synchronized with runtime schemas.

A monorepo, if later accepted, may expose client-safe contract packages, but those packages must not expose database clients, secrets, server config, authorization internals, raw provider payloads, or migrations.

TypeScript remains Proposed and is not accepted by ADR-0011.

## Error Model

Leading format: RFC 9457-compatible `application/problem+json` with stable GymPulse machine `code`, safe human `title/detail`, `status`, request correlation, and safe field-validation details where needed.

Clients branch on machine codes, not localized/human messages.

Baseline status semantics:

```text
400 malformed/contract request
401 missing/invalid authentication
403 authenticated deny where safe to disclose
404 missing or intentionally undisclosed protected resource
409 current-state/idempotency conflict
422 well-formed request rejected by semantic/business rule
429 abuse/rate control
500 unexpected internal failure
503 temporary dependency/system unavailability
```

Errors do not expose SQL, stack traces, provider secrets, other tenant identifiers, policy internals, tokens, or unnecessary Member data.

## Pagination Model

Cursor/keyset-style pagination is the default for mutable operational lists. Cursors remain opaque and bind to stable sort/filter semantics. Page-size limits are bounded but exact numbers remain later specification.

Offset pagination remains a documented exception for small/static lists where random access materially benefits UX and consistency/performance costs are acceptable.

Only allowlisted filters/sorts are accepted. Client-supplied branch/gym filters remain untrusted and authorization-scoped server-side.

## Idempotency Model

Designated critical mutations accept an opaque idempotency key.

Core invariant:

```text
same trusted caller/tenant context
+ same operation
+ same key
+ compatible request
-> same canonical logical outcome
```

Same key + different material request is a stable `409` conflict. Concurrent duplicates cannot create duplicate business effects. Prior success returns/reconstructs canonical result. Transient infrastructure failures remain retry/reconciliation concerns and are not blindly frozen as permanent business outcomes. Exact key retention is open.

Idempotency and transactionality remain distinct controls.

## Concurrency / Conflict Model

Business state races such as duplicate attendance, closed cases, already-frozen membership, already-processed payment, or changed configuration use stable business conflict codes and usually `409` when the caller can refresh/reconcile.

ETag/`If-Match` remains an optional later pattern for selected editable configuration resources, not a universal baseline. No version columns/ETag implementation was created.

## Authentication / Authorization Boundary

Human request categories, provider callback trust, and background/system invocation remain distinct.

Protected HTTP calls eventually use the selected `D-ARCH-004` authentication evidence but always resolve a GymPulse Principal and current authorization under `D-ARCH-015`.

Routes, HTTP verbs, DTOs, middleware, role names, UI hiding, opaque IDs, and client tenant headers are never sufficient authorization.

Member-self endpoints may prefer `/me`-style patterns where useful to reduce arbitrary ID injection, but self authorization remains server-side.

## Tenant Context Boundary

Client tenant/gym/branch/resource identifiers are locators/routing/filter input only.

Server authorization resolves trusted scope/resource ownership from Principal + canonical relationships. No `X-Tenant-Id`-style input, if ever used, may become authority by itself.

`D-SEC-008` remains separate and OPEN; RLS/data-layer isolation does not define the API authorization contract.

## Provider Webhook Boundary

Provider callbacks remain separate from logged-in human APIs.

```text
raw request
-> preserve verification material
-> verify provider authenticity
-> normalize provider event
-> resolve internal resource + tenant
-> bounded application use case
-> idempotent canonical effect
```

Framework parsing must not destroy raw-body/signature verification inputs. Valid duplicate events may receive provider-appropriate success while business effects remain exactly-once. Provider-specific response codes remain adapter/provider behavior.

## Versioning / Compatibility

Proposed version posture: one explicit major contract namespace (`v1`) from the first supported contract, with compatible additive changes staying within the major version.

Potential breaking changes include removed/renamed/semantic fields, newly required inputs, machine error-code changes, pagination changes, authorization/existence changes, and output enum additions that old clients cannot tolerate.

Response clients should tolerate unknown additive fields. Enum additions are compatibility-sensitive and may require fallback or coordinated rollout.

Deprecation uses documented replacement, consumer impact review/usage visibility where practical, migration coordination, and controlled removal. No fixed deprecation duration is invented.

## OpenAPI Position

OpenAPI is recommended as an optional documentation/generation/export artifact rather than a separately hand-maintained primary source of truth.

Preferred pipeline if compatible tooling is later selected:

```text
runtime contract schema
-> derived static type
-> mechanically derived OpenAPI where useful
-> optional generated client/documentation
```

OpenAPI must not silently diverge from runtime validation. No OpenAPI file, generator, client, or SDK was created.

## Security Findings

Primary threats addressed:

- BOLA/IDOR,
- broken function-level authorization,
- mass assignment,
- over-fetching/property exposure,
- sensitive data exposure,
- client tenant spoofing,
- schema validation bypass,
- parameter pollution,
- idempotency replay/collision,
- webhook forgery/replay,
- provider payload leakage,
- unsafe generic PATCH,
- existence enumeration,
- unbounded pagination/filtering,
- request/sensitive-flow flooding,
- framework contract coupling,
- generated schema/client drift.

Architectural mitigations are recorded in ADR-0011 and align with current OWASP API Security guidance.

## Decisions Kept Separate

Task 0019 does not decide or accept:

```text
D-ARCH-016 primary language/runtime
D-ARCH-001 repository/monorepo
D-ARCH-004 authentication/session
D-SEC-002 member verification
D-ARCH-015 authorization implementation
D-SEC-008 data-layer isolation/RLS
D-ARCH-012 Owner/Staff framework
D-ARCH-013 Member client framework/delivery
D-ARCH-006 API deployment topology
D-ARCH-007 background jobs
D-ARCH-014 managed backend
D-ARCH-002 database engine
D-ARCH-017 data-access/migrations
D-ARCH-018 testing toolchain
D-ARCH-010 object storage
D-PROVIDER-001 payment provider
D-DATA-001 identifiers
D-DATA-002 time
D-DATA-003 money
```

No previous ADR was promoted to Accepted.

## Requirement IDs Referenced

Verified canonical requirements referenced in ADR-0011 include:

```text
FR-IDENTITY-001..003
FR-AUTHZ-001..004
FR-ATTENDANCE-001..010
FR-RENEWAL-003..007
FR-PAYMENT-001..010
FR-AUDIT-001..003
FR-CROSS-001..004

NFR-SECURITY-001..005
NFR-SECURITY-009..011
NFR-RELIABILITY-001..005
NFR-RELIABILITY-007..008
NFR-PERFORMANCE-001..006
NFR-TESTABILITY-001..005
NFR-MAINTAINABILITY-001..003
NFR-MAINTAINABILITY-005..006
NFR-OBSERVABILITY-001..007
NFR-SCALABILITY-003..006
NFR-COMPATIBILITY-002
NFR-DATA-001..003
```

No requirement identifier was invented.

## Validation Required

Before acceptance/production implementation, future validation must cover malformed/oversized requests, path/query/body validation, unknown/mass-assignment fields, auth/authz, cross-tenant and Member-self BOLA, stable 401/403/404/error semantics, sensitive-error leakage, pagination/filter bounds, idempotent retry, same-key/different-payload conflict, concurrent duplicates, timeout/retry recovery, payment/price/actor anti-forgery, webhook forgery/validity/duplicates/raw-body behavior, provider payload projection, money/time serialization, cursor stability, additive-client compatibility, enum evolution, schema/client drift where generated, request ID propagation, 429, and dependency failure mapping.

No tests were implemented.

## Files Changed

Created:

```text
docs/adr/ADR-0011-api-contract-architecture.md
.ai/task/0019-draft-api-contract-architecture-adr.md
```

Governance/index files updated by this task:

```text
docs/adr/README.md
docs/README.md
.ai/current-state.md
```

## Open Questions

Open questions remain around decision owner, exact runtime validation tool, production response-validation posture, RFC 9457 problem-type namespace, exact idempotency retention/in-progress handling, offset-pagination exceptions, conditional-request usage, enum fallback conventions, exact base-path version placement, long-running operation needs, and whether future public/partner/native client requirements justify stronger OpenAPI/client generation.

## Result

Task 0019 produces architecture/governance documentation only.

Explicitly not created/selected:

```text
No API implementation
No route/controller/handler/middleware
No server action
No GraphQL schema
No tRPC router
No protobuf/gRPC file
No OpenAPI document
No JSON Schema file
No runtime validation source code
No DTO source code
No generated client/SDK
No API tests
No database schema/migration/RLS policy
No background worker implementation
No webhook implementation
No CI/deployment configuration
No API framework
No validation library
No OpenAPI/client generator
No API deployment topology
No accepted web/native framework
No previous ADR acceptance
```

Final expected decision state:

```text
ADR-0011 = Proposed
D-ARCH-003 = PROPOSED
```

## Next Recommended Task

After synchronizing Task 0019, re-read `docs/adr/README.md`, `docs/00-overview/assumptions.md`, and `.ai/current-state.md` and record the actual next bounded ADR decision.

The pre-task queue suggests `D-ARCH-012` Owner/Staff Web Application Framework may be next, but this continuity record does not pre-authorize or execute that task.
