# ADR-0002: Primary Implementation Language and Server Runtime

## Status

`Accepted`

## Decision Metadata

- ADR: `ADR-0002`
- Primary Decision ID: `D-ARCH-016`
- Related Decision IDs: `D-ARCH-005`, `D-ARCH-001`, `D-ARCH-003`, `D-ARCH-006`, `D-ARCH-007`, `D-ARCH-012`, `D-ARCH-013`, `D-ARCH-017`, `D-ARCH-018`, `D-ARCH-019`
- Decision Owner: `santosh`
- Technical Owner: `Architecture`
- Date Proposed: `2026-08-20`
- Date Accepted: `2026-09-29`
- Approval Evidence / Reference: GitHub Issue #1 — https://github.com/im-tnyx/gym-pulse/issues/1
- Supersedes: `None`
- Superseded By: `None`

## 1. Context

GymPulse needs a primary implementation language and server runtime for the trusted application/API responsibilities, background execution, provider adapters, application/domain logic, and a substantial portion of the automated test suite.

The architecture already requires:

- deterministic server-side business rules,
- explicit application/domain boundaries,
- shared or generated typed contracts where useful,
- runtime validation at trust boundaries,
- transaction and idempotency correctness,
- provider adapters for authentication, payments, messaging, storage, and telemetry,
- background execution that reuses application/domain behavior,
- structured observability,
- horizontal evolution without process-local business truth,
- compatibility with owner/staff web and a member delivery strategy that remains separately governed.

`D-ARCH-016` currently records strict TypeScript with a supported Node.js LTS runtime as the proposed direction. This ADR evaluates that direction against credible alternatives.

This decision is intentionally narrower than framework or deployment selection. Choosing TypeScript/Node.js would not automatically choose Next.js, Expo/React Native, a monorepo, PostgreSQL, an ORM/query builder, API deployment topology, job runner, hosting platform, managed backend, CI provider, or any external provider.

Likewise, a shared language does not permit unsafe source sharing. Client code must never gain access to server-only secrets, database credentials, provider SDK implementations, or privileged configuration merely because both client and server are written in TypeScript.

## 2. Requirements and Decision Drivers

### 2.1 Primary functional drivers

- `FR-CROSS-001` server-side canonical truth
- `FR-CROSS-002` idempotent critical effects
- `FR-CROSS-003` explicit tenant context
- `FR-CROSS-004` gym-local timezone correctness
- `FR-AUTHZ-001` tenant-scoped authorization
- `FR-AUTHZ-002` named capability enforcement
- `FR-ATTENDANCE-003` exactly one canonical attendance effect
- `FR-ATTENDANCE-006` retry-safe attendance
- `FR-PAYMENT-002` provider-verified payment truth
- `FR-PAYMENT-005` duplicate provider callback safety
- `FR-PAYMENT-006` exactly-once membership effect
- `FR-PAYMENT-007` exactly-once add-on effect
- `FR-NOTIFICATION-002` notification retry deduplication

### 2.2 Primary non-functional drivers

- `NFR-SECURITY-003` server-side authorization
- `NFR-SECURITY-004` secret protection
- `NFR-SECURITY-008` webhook verification
- `NFR-SECURITY-011` sensitive error minimization
- `NFR-RELIABILITY-001..005` idempotency, exactly-once effects, retry safety, data constraints, canonical truth
- `NFR-RELIABILITY-006` timezone correctness
- `NFR-AVAILABILITY-001..003` dependency isolation and visible recoverable failures
- `NFR-PERFORMANCE-005` provider latency separation
- `NFR-SCALABILITY-003` horizontal evolution
- `NFR-SCALABILITY-004` queueable asynchronous work
- `NFR-MAINTAINABILITY-001` shared domain rules
- `NFR-MAINTAINABILITY-002` typed contracts
- `NFR-MAINTAINABILITY-003` provider abstraction
- `NFR-MAINTAINABILITY-005` documentation synchronization
- `NFR-MAINTAINABILITY-006` ADR governance
- `NFR-TESTABILITY-001..005` deterministic domain, provider, failure, authorization, and time-controlled testing
- `NFR-OBSERVABILITY-001..007` structured diagnostics and correlation
- `NFR-OPERATIONS-001..004` environment, secret, migration, and release discipline

### 2.3 Architecture-principle drivers

The decision is especially constrained by:

- `ARCH-PRIN-004` Deterministic Server-Side Business Truth
- `ARCH-PRIN-005` Financial Correctness Before Convenience
- `ARCH-PRIN-006` Idempotent Critical Effects
- `ARCH-PRIN-008` Explicit Business-Time Semantics
- `ARCH-PRIN-009` Explicit Domain and State Ownership
- `ARCH-PRIN-010` Transactional Consistency for Correctness-Sensitive Changes
- `ARCH-PRIN-011` Async Side Effects Are Isolated From Canonical Transactions
- `ARCH-PRIN-012` Provider Abstraction at Integration Boundaries
- `ARCH-PRIN-013` Failure Visibility and Reconciliation
- `ARCH-PRIN-014` Observability by Design
- `ARCH-PRIN-016` Secure Defaults and Least Privilege
- `ARCH-PRIN-017` Modular Monolith Before Microservices, currently Proposed in `ADR-0001`
- `ARCH-PRIN-019` Evolution Through Explicit Decisions

## 3. Constraints and Assumptions

1. The language/runtime must implement the existing architecture rather than redefine it.
2. External inputs remain untrusted regardless of static types and require runtime validation.
3. Database transactions, constraints, idempotency records, and provider verification remain the source of correctness for critical effects; compile-time typing cannot replace them.
4. Permanent business state must not depend on process memory.
5. Web/API and background execution may be co-hosted or independently deployed under future decisions.
6. Provider SDKs must remain behind adapters/ports.
7. The exact Node.js version, package manager, build tool, runtime-validation library, web framework, test runner, and hosting product are separate implementation/governance decisions.
8. No repository evidence currently establishes a hard requirement for JVM, Go, Python, or another specialized server runtime.
9. No repository evidence currently provides production benchmarks proving Node.js is either insufficient or uniquely required.
10. No repository evidence establishes team-language expertise strongly enough to decide the architecture by staffing preference alone.
11. `D-ARCH-005`/`ADR-0001` remains Proposed; this ADR can be reviewed independently but must preserve modular boundaries whichever architecture-style outcome is later accepted.

## 4. Options Considered

### Option A: Strict TypeScript with a supported Node.js LTS runtime

Use TypeScript in strict mode for the primary trusted application/API, background handlers, domain/application modules, provider adapters, and primary JavaScript/TypeScript test code. Run server-side code on a supported Node.js LTS line selected at implementation time.

Expected characteristics:

- one primary language across proposed web/member TypeScript clients and server-side application code,
- strong compile-time type checking with runtime validation at trust boundaries,
- broad ecosystem for HTTP, authentication, PostgreSQL, payment/messaging SDKs, observability, jobs, and tests,
- event-loop/asynchronous I/O model appropriate for request/provider/database-heavy workloads,
- need for explicit CPU-bound work controls if such workloads appear later,
- strong risk of unsafe client/server code sharing unless server-only package and import boundaries are enforced.

### Option B: Java or Kotlin on the JVM for trusted server code, TypeScript for clients

Use Java/Kotlin for API/domain/jobs/integrations, while owner/member clients remain TypeScript or their separately selected client language/framework.

Expected characteristics:

- mature static typing and server ecosystem,
- strong concurrency and long-running service tooling,
- mature database/transaction/observability options,
- separate client/server language/toolchains,
- generated or duplicated client/server contract models rather than direct TypeScript sharing,
- higher Phase 1 build/runtime/tooling diversity.

### Option C: Go for trusted server code, TypeScript for clients

Use Go for API/domain/jobs/integrations and TypeScript for clients.

Expected characteristics:

- simple deployment artifacts and efficient runtime characteristics,
- strong concurrency model and good suitability for network services/workers,
- explicit interfaces and straightforward operational footprint,
- less direct type/model sharing with proposed TypeScript clients,
- additional contract-generation/tooling path and potentially more application-layer mapping code.

### Option D: Python for trusted server code, TypeScript for clients

Use Python with a typed modern server framework/ecosystem for API/domain/jobs/integrations, while clients remain TypeScript.

Expected characteristics:

- high development productivity and broad integration/data ecosystem,
- mature web/background tooling,
- runtime typing/validation discipline must be actively enforced,
- separate client/server language and contract tooling,
- performance/concurrency profile may require more deliberate runtime/process choices for some workloads.

### Option E: JavaScript on Node.js without strict TypeScript as the primary baseline

Use the Node.js runtime but rely primarily on JavaScript and tests/runtime validation rather than strict compile-time TypeScript.

Expected characteristics:

- lowest typing ceremony,
- simplest Node execution path,
- weaker compile-time guarantees for cross-module contracts and refactors,
- higher risk of contract/state mismatches as modules, providers, jobs, and clients evolve.

## 5. Evaluation

| Criterion | A: TypeScript + Node.js LTS | B: Java/Kotlin JVM | C: Go | D: Python | E: JavaScript + Node.js |
|---|---|---|---|---|---|
| Alignment with proposed TypeScript clients | Strong | Moderate | Moderate | Moderate | Strong |
| Compile-time application/domain safety | Strong | Strong | Strong | Moderate with typing discipline | Weak/Moderate |
| Runtime trust-boundary validation | Required | Required | Required | Required | Required |
| Shared/generated contract ergonomics | Strong | Moderate | Moderate | Moderate | Moderate |
| Provider/SDK ecosystem fit | Strong | Strong | Strong | Strong | Strong |
| Database/transaction ecosystem | Strong | Strong | Strong | Strong | Strong |
| Async I/O/provider-heavy Phase 1 fit | Strong | Strong | Strong | Strong with framework/runtime discipline | Strong |
| CPU-bound specialization | Moderate | Strong | Strong | Moderate | Moderate |
| Background-worker suitability | Strong | Strong | Strong | Strong | Strong |
| One primary application toolchain | Strong | Weak/Moderate | Weak/Moderate | Weak/Moderate | Strong |
| Type-safe cross-module refactoring | Strong | Strong | Strong | Moderate | Weak |
| Operational simplicity for Phase 1 | Strong | Moderate | Strong | Moderate/Strong | Strong |
| Client/server secret-boundary risk from code sharing | Higher; must be enforced | Lower by language split | Lower by language split | Lower by language split | Higher; must be enforced |
| Ecosystem flexibility across hosting models | Strong | Strong | Strong | Strong | Strong |
| Evidence of need for this option | High alignment with current proposed stack | No specific repository requirement | No specific repository requirement | No specific repository requirement | Conflicts with typed-contract direction |
| Reversibility after substantial implementation | Medium | Medium/Low | Medium/Low | Medium/Low | Medium |

### 5.1 Why Option A is the current recommendation

Option A best fits the current architecture and technology evaluation without adding a second primary application language before there is evidence that another runtime materially reduces risk.

The strongest reasons are:

- `NFR-MAINTAINABILITY-002` already prefers typed contracts across primary TypeScript application boundaries.
- The current Owner/Staff and Member technology candidates are TypeScript-oriented, so TypeScript can reduce duplicated application/contract models while still requiring runtime validation.
- Node.js is suitable for the dominant Phase 1 workload shape: HTTP requests, database transactions, webhooks, provider calls, background jobs, and observability rather than sustained CPU-heavy numerical computation.
- One primary language/runtime reduces Phase 1 build, lint, test, dependency, and observability diversity.
- TypeScript is compatible with the proposed modular-monolith boundaries and can support framework-independent domain/application modules.
- The technology evaluation already identified strict TypeScript + supported Node.js LTS as a high-confidence direction after checking current official ecosystem documentation.

This recommendation is not based on an assumption that one language is universally superior. It is a fit-to-current-requirements decision.

### 5.2 Why JVM, Go, or Python are not the current recommendation

All three are technically credible and capable of implementing GymPulse correctly.

They are not currently preferred because the repository does not establish a requirement that offsets the additional Phase 1 language/toolchain boundary between server and proposed TypeScript clients.

They should be reconsidered if evidence later shows:

- sustained CPU-bound/server workloads where another runtime has material measured benefit,
- a platform/security/compliance constraint that favors another runtime,
- a deployment environment with significantly better support for another runtime,
- team capability evidence that materially changes delivery/operations risk,
- a separately extracted service with requirements distinct from the main application.

### 5.3 Why untyped JavaScript is not the current recommendation

JavaScript on Node.js keeps runtime/tooling simplicity but gives up a major benefit that current requirements explicitly value: typed application boundaries and safer cross-module refactoring.

Runtime validation and tests remain mandatory in TypeScript, but removing compile-time types would increase the chance of preventable mismatches without providing a clear architecture benefit for Phase 1.

## 6. Proposed Decision

**Propose Option A: strict TypeScript as the primary implementation language and a supported Node.js LTS line as the primary trusted server runtime.**

If accepted, the implementation rules are:

1. Enable strict TypeScript for primary application/domain/server packages unless a bounded exception is documented.
2. Treat all external request, webhook, job, environment/configuration, and provider payloads as untrusted at runtime until validated.
3. Keep domain/application modules independent of web framework request objects, provider SDK payloads, database driver objects, and job-runner-specific objects.
4. Keep permanent business truth in canonical persistence; do not rely on Node process memory for locks, entitlement, idempotency, or durable workflow state.
5. Use asynchronous/non-blocking I/O patterns for provider/database/network-heavy work and isolate long CPU-heavy tasks if they are later introduced.
6. Keep client-safe and server-only source boundaries explicit. Server-only code may contain database access, secrets, privileged configuration, and provider implementations; client packages must not import it.
7. Select an actively supported Node.js LTS line during implementation and maintain an upgrade policy. This ADR does not pin an exact version.
8. Preserve portability of core application/domain behavior so a future extracted service can use another runtime if a later ADR establishes sufficient evidence.

This proposal does **not** decide:

- Next.js or another web framework (`D-ARCH-012`),
- responsive web/PWA vs Expo/React Native member delivery (`D-ARCH-013`),
- monorepo/workspace design (`D-ARCH-001`),
- package manager (`D-ARCH-011`),
- API contract style (`D-ARCH-003`),
- API deployment topology (`D-ARCH-006`),
- PostgreSQL/database engine (`D-ARCH-002`),
- data-access/migration tooling (`D-ARCH-017`),
- background-job runner (`D-ARCH-007`),
- hosting (`D-ARCH-009`),
- CI/CD tooling (`D-ARCH-019`),
- test tools (`D-ARCH-018`),
- any provider selection.

## 7. Consequences

### Positive consequences

- One primary language can cover proposed web/member clients, trusted application/API code, workers, provider adapters, and much of the test stack.
- Shared or generated TypeScript contracts can reduce duplicated client/server model maintenance.
- Strict typing improves refactoring safety across explicit application/domain boundaries.
- A broad Node ecosystem supports the integration-heavy Phase 1 architecture without introducing another runtime by default.
- Local development and CI can use a more consistent dependency/tooling model.
- Framework-independent TypeScript modules remain portable across co-hosted or separately deployed API/job topologies.

### Negative consequences

- Shared language can tempt developers to import server-only code into client packages.
- TypeScript can create false confidence if compile-time types are mistaken for runtime validation.
- Node.js is not the best runtime for every possible future workload, especially sustained CPU-heavy computation.
- A single ecosystem can concentrate supply-chain/dependency risk if dependencies are adopted indiscriminately.
- Future extraction into another language requires explicit contract boundaries and migration work.

## 8. Security and Privacy Impact

This proposal improves some development-time safety but does not change the trust model.

Required controls:

- secrets, database credentials, signing keys, webhook secrets, and privileged provider credentials remain server-only,
- client bundles must not import server-only configuration or adapters,
- environment/configuration values are validated before use,
- external request/webhook/job/provider payloads are runtime validated even when TypeScript definitions exist,
- authentication evidence is verified server-side and mapped to GymPulse principals,
- authorization remains GymPulse-owned principal + tenant/resource scope + capability,
- raw provider/payment credentials are never stored merely because an SDK makes them accessible,
- logs/errors must avoid leaking secrets and unnecessary PII,
- dependency/package adoption follows review and update discipline.

If monorepo/source-sharing is later accepted, architecture tests/import rules should explicitly prevent client-safe packages from depending on server-only packages.

## 9. Reliability, Performance, and Scalability Impact

### Reliability

Language/runtime selection does not replace database or application correctness mechanisms.

GymPulse must still use:

- explicit transactions where changes must succeed/fail together,
- durable idempotency/business-effect constraints,
- provider-event verification/deduplication,
- retry-safe jobs,
- reconciliation after cross-system uncertainty,
- injectable business time for deterministic tests.

Node process restarts must not lose canonical state or make a critical effect replay unsafe.

### Performance

The dominant Phase 1 workload is expected to be I/O-heavy: HTTP, database access, authentication, provider callbacks, messaging/payment integrations, and scheduled work. Node.js is a reasonable fit for that workload shape.

Performance acceptance must still be measurement-based. This ADR does not claim a specific p95/p99 latency, throughput, or memory target.

Potential CPU-heavy work should not block the event loop. If such work becomes material, use worker isolation, bounded background processing, or a future specialized service/runtime decision rather than weakening interactive request reliability.

### Scalability

Trusted application and worker components should remain stateless with respect to permanent business truth so multiple Node processes/instances can run safely when later hosting decisions permit.

Scaling should be driven by measured request/job/database/provider behavior, not by assuming Node process-local concurrency is a correctness mechanism.

## 10. Operations and Observability Impact

If accepted, operations should standardize on:

- a supported Node.js LTS release line,
- explicit runtime-version declaration in repository/build/deployment configuration,
- dependency lock/frozen install behavior once repository/package-manager decisions are accepted,
- structured server/job logging,
- correlation propagation,
- unhandled exception/rejection capture,
- process health/readiness handling appropriate to selected hosting,
- memory/event-loop/latency diagnostics where operationally useful,
- controlled runtime upgrades with CI/staging validation.

The exact hosting, CI/CD, observability provider, package manager, and runtime-version pinning mechanism remain separate decisions.

## 11. Testing and Validation

Before this ADR becomes an implementation gate, validate the proposed runtime against representative architecture behavior.

Minimum evidence:

1. strict TypeScript compilation across representative application/domain boundaries,
2. a trust-boundary example proving runtime validation rejects invalid external data despite compile-time types,
3. one protected application command with principal/scope/capability checks,
4. one real transaction-heavy attendance or payment-effect integration path,
5. duplicate request/provider-event tests demonstrating exactly-one business effect,
6. a raw-body/security-sensitive webhook verification spike compatible with the selected transport layer,
7. a scheduled/background handler that reuses application/domain logic and survives retry/restart assumptions,
8. a gym-time test using an injectable clock and timezone,
9. structured correlation across one request -> durable continuation -> background handler flow,
10. a source-boundary test proving client-safe code cannot import a server-only secret/database/provider module once repository packaging is selected.

No exact testing framework is accepted by this ADR.

## 12. Migration and Rollout

There is no established production server runtime to migrate in the current documentation phase.

If accepted, rollout should proceed in a bounded scaffold after repository and related foundation decisions are reviewed:

```text
runtime/version declaration
  -> strict TypeScript configuration
  -> application/domain module baseline
  -> trust-boundary runtime validation
  -> server-only/client-safe dependency rules
  -> representative API/application path
  -> representative background path
  -> test/observability validation
```

Do not use initial scaffolding as proof that the ADR was accepted. Acceptance must precede authoritative implementation under the governance model.

## 13. Reversibility

Changing the primary server language after substantial application/domain implementation is expensive, so reversibility depends on preserving explicit contracts.

Reversibility is improved by:

- keeping transport/framework details outside domain/application modules,
- keeping provider SDKs behind ports/adapters,
- defining stable external API contracts,
- keeping persistence contracts explicit,
- avoiding Node-specific global/process state as business logic,
- documenting event/job payload contracts,
- using tests around behavior rather than framework internals.

A future service can use another language/runtime if a later ADR shows a concrete reason. The new service should consume explicit network/event contracts rather than importing TypeScript implementation internals.

## 14. Risks and Mitigations

### Risk: TypeScript types are mistaken for runtime validation

Mitigations:

- treat every external payload as `unknown` until validated,
- centralize trust-boundary validation,
- test malformed/missing/extra provider/request fields,
- keep business invariants in domain/application/database controls.

### Risk: client bundles receive server-only code or secrets

Mitigations:

- explicit client-safe vs server-only package boundaries,
- no broad generic `shared` package containing privileged code,
- import/dependency rules in CI,
- environment variables loaded only at trusted runtime edges,
- bundle/build checks for client artifacts.

### Risk: Node event loop is blocked by CPU-heavy work

Mitigations:

- profile before optimizing,
- isolate CPU-heavy work from interactive request execution,
- use bounded workers/worker threads or later service extraction when justified,
- do not perform unbounded synchronous computation in request handlers.

### Risk: dependency ecosystem increases supply-chain surface

Mitigations:

- minimize dependencies,
- prefer maintained libraries with clear ownership,
- lock dependencies after package-manager decision,
- automated dependency/security review in later CI/CD design,
- keep security-critical logic understandable without opaque dependency chains.

### Risk: one-language convenience erodes architectural boundaries

Mitigations:

- preserve `ADR-0001` module ownership rules if accepted,
- enforce inward dependency direction,
- prohibit UI/route/provider SDK objects from entering domain APIs,
- require explicit cross-module contracts and tests.

### Risk: future workload needs another runtime

Mitigation:

Use measured evidence and a new ADR for specialized extraction rather than making the entire Phase 1 stack heterogeneous preemptively.

## 15. Open Questions

These remain separate decisions or evidence gaps:

- Who is the authorized decision owner for `D-ARCH-016`?
- What exact Node.js LTS version will be pinned when implementation begins?
- What repository/package boundaries will enforce client-safe vs server-only code (`D-ARCH-001`)?
- What package manager/workspace tooling will be used (`D-ARCH-011`)?
- What runtime-validation library, if any, will standardize trust-boundary schemas?
- What web framework will host Owner/Staff UI/server responsibilities (`D-ARCH-012`)?
- What member delivery strategy will be accepted (`D-ARCH-013`)?
- What API deployment topology will be accepted (`D-ARCH-006`)?
- What background-job runner will be accepted (`D-ARCH-007`)?
- What data-access tooling will be accepted (`D-ARCH-017`)?
- What hosting/runtime constraints will apply (`D-ARCH-009`)?
- What test tooling will be accepted (`D-ARCH-018`)?
- What CI/CD/release tooling will be accepted (`D-ARCH-019`)?
- Is there any team capability or deployment constraint that materially favors JVM, Go, Python, or another runtime? No such evidence is currently recorded.

## 16. Decision Evidence

### Current evidence supporting the proposal

- `docs/02-architecture/technology-stack.md` evaluated TypeScript + supported Node.js LTS as the high-confidence language/runtime direction; acceptance is now recorded separately through the authorized governance decision in GitHub Issue #1.
- The technology evaluation checked current official TypeScript strict-mode/project-reference documentation and Node.js release/LTS documentation on `2026-08-20` for capability evidence.
- `NFR-MAINTAINABILITY-002` explicitly states that primary TypeScript application boundaries should use shared or generated typed contracts plus runtime validation.
- `NFR-MAINTAINABILITY-001` requires shared domain rules rather than independent duplication across member, owner/staff, and background execution paths.
- `NFR-TESTABILITY-001..005` favor deterministic, injectable, provider-simulatable architecture that is compatible with framework-independent TypeScript modules.
- The current component architecture already separates domain/application contracts from transport, provider, database, and job-runner-specific objects, which limits runtime lock-in.
- Current candidate Owner/Staff and Member technology directions are TypeScript-oriented, increasing the value of one primary application language without making those framework decisions accepted.

### Acceptance-readiness evidence update — 2026-09-29

The validation-only harness at `../../validation/foundation/` provides bounded runtime evidence.

Existing evidence used Node.js `v22.16.0` and TypeScript compiler `5.8.3` as validation-only versions and proved:

- strict TypeScript compilation for separate client/request/worker validation artifacts;
- malformed external input rejection;
- a protected Principal -> scope/capability -> application -> persistence-port flow;
- client-safe -> server-only import violation detection;
- raw webhook-byte verification before parsing plus tamper rejection;
- shared request/worker application behavior;
- separate-process durable replay behavior;
- deterministic gym-timezone handling;
- correlation propagation.

The 2026-09-29 real PostgreSQL run adds a transaction-heavy server-path proof using Node.js `v22.23.2` and temporary validation-only `pg 8.16.3`:

- application-style PostgreSQL connect/query/BEGIN/COMMIT/close/reconnect passes;
- six simultaneous Node PostgreSQL connections are successful;
- 12-session database races prove transaction/constraint-backed idempotency;
- real PostgreSQL constraint errors are normalized after observing SQLSTATE `23505`, `23503`, and `23514`;
- connection fails safely while the disposable PostgreSQL instance is stopped;
- reconnect succeeds after restart;
- replay after restart does not duplicate a committed business effect.

These versions are validation evidence only. They do not pin a production Node.js release or accept `pg`, an ORM/query builder, a pool strategy, hosting topology, or CI platform.

Post-acceptance implementation/dependency gaps remain:

- the validation harness is not the final repository/workspace topology;
- production provider/framework integration remains unproven;
- no production benchmark/deployment constraint or canonical team-capability evidence has been recorded that materially changes the tradeoff.

Authorized Decision Owner `santosh` accepted the strict-TypeScript / supported-Node.js-LTS category on `2026-09-29`, with durable approval evidence in GitHub Issue #1.

Therefore this ADR is `Accepted` and `D-ARCH-016` is synchronized as `DECIDED`. Exact Node.js, TypeScript, database-client, framework, hosting, test, and CI/CD versions/tools remain separately governed.

## 17. Related Documents

- `../00-overview/assumptions.md`
- `../01-product/functional-requirements.md`
- `../01-product/non-functional-requirements.md`
- `../02-architecture/architecture-principles.md`
- `../02-architecture/architecture-overview.md`
- `../02-architecture/container-architecture.md`
- `../02-architecture/component-architecture.md`
- `../02-architecture/data-flow.md`
- `../02-architecture/technology-stack.md`
- `ADR-0001-modular-monolith.md`
- `README.md`
- legacy migration evidence: `../05-system-architecture.md`
- legacy migration evidence: `../15-engineering-workflow.md`