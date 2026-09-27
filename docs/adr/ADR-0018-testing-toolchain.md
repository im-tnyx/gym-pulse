
# ADR-0018: Core Automated Testing Toolchain

## Status

`Proposed`

## Decision Metadata

- ADR: `ADR-0018`
- Primary Decision ID: `D-ARCH-018`
- Related Decision IDs: `D-ARCH-019`, `D-ARCH-016`, `D-ARCH-001`, `D-ARCH-002`, `D-ARCH-017`, `D-ARCH-015`, `D-SEC-008`, `D-ARCH-003`, `D-ARCH-012`, `D-ARCH-013`, `D-ARCH-007`, `D-ARCH-009`, `D-ARCH-011`, `D-ARCH-004`, `D-SEC-002`, `D-PROVIDER-001`, `D-PROVIDER-002`, `D-PROVIDER-006`
- Decision Owner: `Open`
- Technical Owner: `Architecture / Engineering / QA / Security`
- Date Proposed: `2026-09-27`
- Date Accepted: `Not accepted`
- Supersedes: `None`
- Superseded By: `None`

## 1. Context

GymPulse is a correctness-sensitive multi-tenant operational system. Phase 1 combines membership eligibility, attendance dedupe, renewal state, verified-payment effects, provider callbacks, background retries, authorization, tenant isolation, gym-local time, and browser journeys. A trustworthy test strategy therefore cannot be reduced to one runner or a large browser suite.

The architecture already separates:

```text
Domain
Application
Authorization
Persistence
Provider Adapters
HTTP/API
Background Worker
Web UI
```

Testing should follow these boundaries and prove each concern at the cheapest level that still exercises the semantics that matter.

The decision question is:

> What core automated testing architecture and toolchain should GymPulse use to produce trustworthy evidence across domain logic, application workflows, PostgreSQL behavior, authorization/tenant isolation, API contracts, provider integrations, durable workers, and browser journeys without turning the test suite into a slow, brittle production clone?

Canonical `D-ARCH-018` is `P1 PROPOSED`. The current technology direction names TypeScript-native tests, real PostgreSQL integration tests, and Playwright-style browser E2E as candidates. This ADR independently evaluates that direction.

This ADR does not create tests, install dependencies, provision databases, configure CI, or promote `D-ARCH-018` to `DECIDED`.

## 2. Requirements and Decision Drivers

The primary canonical drivers are:

- `NFR-TESTABILITY-001` — attendance eligibility, duplicate rules, no-show eligibility, membership transitions, payment effects, and notification suppression should be testable without full UI execution.
- `NFR-TESTABILITY-002` — payment and messaging provider adapters must support sandbox or simulated behavior suitable for integration tests.
- `NFR-TESTABILITY-003` — duplicate webhooks, delayed provider response, notification failure, job retry, and database-conflict paths should be injectable/testable.
- `NFR-TESTABILITY-004` — the permission matrix must have positive and negative automated tests for critical capabilities/scopes.
- `NFR-TESTABILITY-005` — timezone/window behavior should use injectable/testable clock abstractions where practical.

Related drivers include:

- `NFR-SECURITY-001..005` and `NFR-SECURITY-008..011` for tenant isolation, least privilege, server-side authorization, secret handling, webhook verification, auditability, abuse controls, and safe errors.
- `NFR-PRIVACY-001..006` for minimization and safe test/artifact data.
- `NFR-RELIABILITY-001..008` for idempotency, payment exactly-once effects, retries, DB backstops, canonical truth, time semantics, diagnostics, and reconciliation.
- `NFR-PERFORMANCE-001..006` for representative behavior without replacing correctness tests with load tests.
- `NFR-SCALABILITY-003..004` for stateless request handling and separable workers.
- `NFR-OBSERVABILITY-001..007` for correlation and diagnosable failure paths.
- `NFR-OPERATIONS-001..004` for isolated environments, secret separation, migration safety, and release smoke checks.
- `FR-CROSS-001..004` for server-owned truth, audit, explicit tenant context, and gym-local time.
- current attendance, renewal, payment, notification, consent, provider-webhook, and reconciliation requirements.

Decision drivers:

1. maximize confidence per unit of test cost;
2. keep domain/application testing independent from browser/framework/provider;
3. make authorization and tenant isolation first-class negative tests;
4. exercise real database semantics where those semantics are correctness-critical;
5. keep provider tests deterministic by default and sandboxed selectively;
6. prove worker replay/restart/idempotency behavior;
7. keep browser E2E focused on high-value journeys;
8. make time and failure deterministic;
9. support parallelism without shared mutable test state;
10. fit the proposed TypeScript/Node/monorepo direction without silently accepting it;
11. integrate with ADR-0017 release gates without duplicating release governance;
12. avoid production credentials/PII in tests and artifacts;
13. preserve portability across hosting/provider choices.

## 3. Constraints and Assumptions

1. `D-ARCH-018` remains `P1 PROPOSED`.
2. `D-ARCH-016` remains `PROPOSED`; TypeScript/Node is not accepted by this ADR.
3. `D-ARCH-002` remains `PROPOSED`; PostgreSQL is not accepted by this ADR.
4. `D-ARCH-017` remains `PROPOSED`; no ORM/query/migration tool is accepted.
5. `D-ARCH-015` remains `PROPOSED`; authorization implementation details remain separately governed.
6. `D-SEC-008` remains `OPEN`; RLS testing is conditional on later RLS acceptance.
7. `D-ARCH-003` remains `PROPOSED`; API tests align to ADR-0011 but do not accept it.
8. `D-ARCH-012` and `D-ARCH-013` remain `PROPOSED`.
9. `D-ARCH-007` remains `OPEN`; worker tests target Durable Continuation behavior, not pg-boss APIs.
10. `D-ARCH-009` remains `OPEN`; ordinary correctness tests do not require the production host.
11. `D-ARCH-019` remains `OPEN`; ADR-0017 is Proposed and owns when evidence gates releases.
12. `D-ARCH-011` remains `ASSUMED`; this ADR does not accept pnpm.
13. Auth, payment, messaging, and observability providers remain unselected.
14. Native Member delivery is not accepted; native E2E is not a Phase 1 baseline.
15. No numeric coverage target or unit/integration/E2E percentage is invented.
16. Test retries are not a substitute for fixing nondeterminism.
17. A fake DB, mock ORM, or SQLite substitute is not evidence of PostgreSQL-specific behavior.
18. Browser emulation is not evidence of physical camera/mobile-OS permission behavior.

Required decision boundaries:

```text
Test Runner != Test Architecture
Mock != Integration Evidence
Browser E2E != Domain Test
SQLite/Fake DB != PostgreSQL Proof
Code Coverage != Correctness
Test Retry != Flake Fix
Provider Sandbox != Production Truth
CI Pipeline != Test Semantics
```

## 4. Testing Architecture and Evidence Model

GymPulse should use a layered test portfolio:

```text
many cheap deterministic tests
+
focused application/use-case tests
+
first-class authorization tests
+
real persistence/security integration tests
+
provider/worker integration tests
+
small high-value browser journeys
+
release smoke evidence
```

Confidence is allocated by risk and architecture semantics, not fixed test-count percentages.

A behavior should normally be tested at the lowest layer that can prove it accurately, then only a smaller representative subset should be repeated through higher layers.

Examples:

- duplicate attendance rule -> domain/application + real DB concurrency, not every browser path;
- cross-tenant denial -> authorization predicate + API/DB negative tests, plus representative E2E;
- payment verified effect -> application + webhook/provider + DB idempotency tests, plus one critical E2E flow;
- QR camera permission -> real-device acceptance evidence, not a domain unit test.

## 5. Test Layers

### L1 — Deterministic domain tests

Purpose: pure business rules and state transitions.

Examples:

- membership/attendance eligibility;
- duplicate attendance policy;
- membership lifecycle/renewal calculation;
- payment-effect application;
- no-show/retention transitions;
- notification eligibility/suppression;
- add-on entitlement;
- time-window rules using injected Clock.

No browser, HTTP server, provider, or production DB is required unless the rule fundamentally depends on infrastructure.

### L2 — Application/use-case tests

Purpose: command/query orchestration.

Prove:

```text
load current state
-> authorize
-> validate business rule
-> transact
-> audit
-> enqueue durable continuation
-> return stable result
```

Use explicit fakes/stubs at external ports where infrastructure semantics are not the subject.

### L3 — Authorization/policy tests

Purpose: deterministic positive/negative permission evidence.

Table-driven inputs should cover Principal, capability, scope, tenant, branch, resource relationship, Member-self relationship, account eligibility, and expected allow/deny.

These tests exercise the same central production authorization predicate, not a test-only bypass.

### L4 — Persistence / real-database integration tests

Purpose: database semantics that mocks cannot prove.

If PostgreSQL is accepted, critical persistence tests run against real PostgreSQL for:

- transactions/commit/rollback;
- constraints/foreign keys/unique effects;
- locking/concurrency;
- isolation behavior;
- migrations;
- idempotency uniqueness;
- provider-event uniqueness;
- optional RLS/pool-context behavior.

### L5 — API/contract tests

Purpose: ADR-0011 trust-boundary behavior.

Verify runtime validation, DTOs, HTTP status, stable machine-readable errors, safe authorization errors, pagination, idempotency, versioning, unknown-field policy, money/time representation, and webhook raw-signature boundary.

### L6 — Provider-adapter integration/simulation tests

Purpose: deterministic adapter behavior plus selective official sandbox evidence.

Use combinations of:

- deterministic fake;
- sanitized representative fixtures;
- official sandbox;
- targeted real integration tests against non-production provider accounts.

Routine CI must not depend on production provider accounts.

### L7 — Durable worker/job tests

Purpose: retry/restart/duplicate-delivery/system-context behavior.

Prove claim, success, retryable/permanent failure, terminal handling, lease/reclaim, multiple workers, tenant scope, current-state reload, and business idempotency.

### L8 — Browser end-to-end tests

Purpose: a focused set of critical Owner/Staff and responsive-Member journeys through real HTTP/browser boundaries.

Do not move every validation permutation into E2E.

### L9 — Deployment/smoke tests

Purpose: post-build/deploy confidence such as application reachability, auth path, check-in safe-mode, worker health, webhook path, and critical dashboard availability.

ADR-0017 primarily owns when/how these gates production release.

## 6. Options Considered

### 6.1 Fast TypeScript/Node-compatible runner

#### Option A — Vitest

Current official documentation provides:

- out-of-box TypeScript/JSX support;
- ESM-first execution model;
- watch/run modes;
- projects for multi-project/monorepo configurations;
- mocking/spies;
- fake timers and system-time control;
- V8 or Istanbul coverage;
- concurrency/isolation features.

Tradeoff: additional dependency and a Vite-oriented transform/module layer that must not be mistaken for raw production-runtime behavior when testing runtime-specific semantics.

#### Option B — Node.js built-in test runner

Current Node documentation provides:

- built-in test runner;
- process-level test isolation/concurrency;
- watch mode;
- mocking/spies;
- stable MockTimers including Date;
- coverage support in current Node documentation, though some runner features remain marked experimental/early development.

Strength: minimal dependency and direct runtime alignment if Node is accepted.

Tradeoff: current ergonomics for TypeScript transformation/project orchestration/coverage tooling are less integrated than Vitest for the proposed monorepo/TypeScript development experience, and exact behavior is tied more directly to the finally accepted Node version.

#### Option C — Jest

Current official documentation provides:

- mature mocking/fake timers;
- projects/configuration;
- coverage;
- broad ecosystem.

Tradeoff: current Jest documentation still describes ESM support as experimental, and TypeScript commonly requires Babel, ts-jest, or separate compilation. That adds configuration friction for the current strict-TypeScript/ESM-oriented proposal.

### 6.2 Real database orchestration

#### Option A — Testcontainers-style ephemeral PostgreSQL

- real PostgreSQL engine;
- disposable isolated instances;
- repeatable local/CI lifecycle;
- dynamic host ports;
- PostgreSQL-specific module;
- explicit wait strategies.

Tradeoffs:

- compatible container runtime required;
- image-pull/startup cost;
- local/CI runtime compatibility must be validated;
- isolation/migrations/fixtures/assertions remain GymPulse-owned.

#### Option B — Shared local/CI PostgreSQL service

- real engine;
- simpler service lifecycle;
- can be efficient for large suites.

Tradeoffs:

- explicit database/schema isolation required;
- shared mutable state risk;
- local and CI setup can diverge;
- cleanup/order dependence must be controlled.

#### Option C — Managed ephemeral/test PostgreSQL

- real engine and potentially provider-specific behavior;
- useful for selected provider integration.

Tradeoffs:

- network dependency;
- credential lifecycle;
- provider cost/latency;
- provider coupling;
- slower feedback.

#### Option D — Fake/in-memory persistence only

Useful for focused application tests where persistence semantics are not under test.

Insufficient for transaction, constraint, concurrency, migration, SQL, or RLS evidence.

### 6.3 Browser E2E

#### Option A — Playwright

Current official documentation provides:

- Chromium, WebKit, and Firefox projects;
- isolated BrowserContexts;
- multiple independent contexts in one test;
- parallel workers;
- retries and flaky-test classification;
- tracing/debug artifacts;
- saved authentication state;
- device/mobile emulation;
- webServer integration.

Tradeoffs:

- browser binaries and CI resources;
- authenticated storage state/traces/screenshots can contain sensitive test data;
- device emulation is not physical-device evidence.

#### Option B — Cypress

Current official documentation provides:

- Chrome-family and Firefox support;
- test isolation and sessions;
- network interception;
- parallelization strategies;
- current experimental WebKit support.

Current limitations relevant to GymPulse include:

- WebKit remains experimental;
- `cy.origin()` is not supported under Cypress experimental WebKit;
- Cypress is single-tab by design unless additional tooling is introduced.

These limitations increase friction for GymPulse's iPhone-adjacent cross-browser evidence and multi-user authorization scenarios.

## 7. Evaluation

### 7.1 Unit/application runner matrix

| Criterion | Vitest | Node test runner | Jest |
|---|---|---|---|
| TypeScript ergonomics | **Strong**; out-of-box TS transform | Conditional on final Node/TS execution policy | Strong with Babel/ts-jest or separate compilation |
| ESM compatibility | **Strong / ESM-first** | Native runtime semantics | Current docs still call ESM support experimental |
| Node runtime fit | Strong | **Direct** | Strong, but own module layer |
| Local feedback | **Strong watch mode** | Good; watch currently documented with stability caveat | Mature watch mode |
| Mocking/spies | Strong | Strong core primitives | Strong/mature |
| Fake timers / Date | Strong | Strong; MockTimers stable in current docs | Strong |
| Coverage | V8/Istanbul | Built-in coverage capability; current docs still mark coverage experimental | Mature coverage |
| Projects/workspaces | **Strong projects support** | Less monorepo-oriented | Mature projects |
| IDE/ecosystem | Strong | Growing/minimal | **Very mature** |
| CI behavior | Strong | Strong/minimal | Strong |
| Framework coupling | Vite transform layer, but usable for server/domain | Minimal | Jest transform/module system |
| Maintenance surface | Moderate | **Lowest dependency count** | Moderate/high configuration |
| Phase 1 fit | **Leading candidate** | Strong fallback if minimalism outranks ergonomics | Credible fallback |

### 7.2 PostgreSQL test-orchestration matrix

| Criterion | Testcontainers-style | Shared CI PostgreSQL | Managed ephemeral DB | Fake/in-memory only |
|---|---|---|---|---|
| Production-engine fidelity if PG accepted | **High** | **High** | **High** | Low |
| Local reproducibility | **High** with compatible runtime | Medium | Low/Medium | High |
| CI reproducibility | **High** with compatible runtime | High | Medium | High |
| Startup cost | Medium | Low/Medium | Medium/High | **Low** |
| Parallel isolation | **Strong with isolated instances/databases** | Must design explicitly | Provider dependent | Strong |
| Network dependency | Local container runtime | Local/CI service | **External network** | None |
| Cleanup | Disposable lifecycle | Explicit | Provider lifecycle | Simple |
| Developer setup | Requires container runtime | Requires PostgreSQL/service | Requires credentials/network | Minimal |
| Migration testing | **Strong** | Strong | Strong | Weak |
| RLS testing if later accepted | **Strong** | Strong | Strong | Not evidence |
| Concurrency testing | **Strong** | Strong | Strong but slower | Weak |
| Cost | Local/CI compute | CI service compute | Provider cost | Minimal |
| Phase 1 posture | **Leading orchestration candidate** | Strong fallback | Targeted/provider-specific | Only for non-DB semantics |

### 7.3 Browser E2E matrix

| Criterion | Playwright | Cypress |
|---|---|---|
| Chromium | Strong | Strong |
| Firefox | Strong | Strong |
| WebKit | **First-class project/browser support** | Experimental |
| Parallelism | Strong | Strong; distributed features may involve Cypress Cloud depending model |
| Test isolation | BrowserContext per test | Strong test isolation |
| Multiple users/contexts in one scenario | **Direct multiple BrowserContexts** | Less natural; single-tab architecture |
| Network/failure control | Strong | Strong |
| Trace/debug artifacts | **Trace Viewer + screenshots/network/steps** | Strong runner UI/screenshots/video ecosystem |
| Auth/session setup | Storage state/projects/fixtures | cy.session and setup patterns |
| Mobile emulation | Strong | Viewport/browser automation; WebKit experimental |
| iPhone-adjacent engine evidence | **Stronger via WebKit** | Experimental WebKit |
| CI ergonomics | Strong | Strong |
| GymPulse fit | **Leading candidate** | Credible alternative |

### 7.4 Composite architecture matrix

| Concern | Proposed Tool/Strategy | Alternatives | Why |
|---|---|---|---|
| Unit/domain runner | Vitest candidate | Node test runner, Jest | strong TS/ESM/projects/timer ergonomics |
| Application tests | Vitest + explicit fakes/ports | Node/Jest | cheap orchestration evidence |
| Authorization matrix | table-driven tests on production predicate | ad hoc endpoint-only tests | explicit positive/negative scope evidence |
| Real DB orchestration | Testcontainers-style real PG if PG accepted | shared CI PG, managed test DB | repeatable real semantics |
| API/contract tests | runtime-level HTTP/adapter tests | browser-only | cheaper, more exhaustive contract coverage |
| Provider simulation | deterministic fake + sanitized fixtures + sandbox | live production | reproducible and safe |
| Worker tests | behavior-level Durable Continuation + real DB integration where required | queue-vendor API-only tests | keeps queue implementation replaceable |
| Browser E2E | Playwright candidate | Cypress | WebKit + multi-context + trace fit |
| Native E2E | deferred | Maestro/Detox/Appium later | native delivery not accepted |
| Time control | injected application/domain Clock + runner timers where useful | wall-clock sleeps | deterministic business calendar tests |
| Failure injection | ports/adapters/test infrastructure | TEST branches in domain code | production path remains unchanged |
| CI layering | fast PR gate + full merge/release evidence under ADR-0017 | one monolithic suite | fast feedback without dropping release evidence |

## 8. Proposed Decision

Propose the following core testing architecture:

```text
Vitest
  -> leading fast TypeScript domain/application/authorization runner

real PostgreSQL integration
  -> required for critical DB semantics if PostgreSQL is later accepted
  -> Testcontainers-style isolated ephemeral orchestration is the leading approach
  -> shared CI PostgreSQL remains a valid fallback

Playwright
  -> leading focused Owner/Staff + responsive-Member browser E2E runner

provider fakes + sanitized fixtures + official sandboxes
  -> adapter evidence without production-provider dependence

explicit Clock / controlled time
  -> deterministic timezone/window behavior

table-driven authorization + cross-tenant negatives
  -> first-class security regression evidence

worker/job integration
  -> replay/restart/concurrency/idempotency evidence

native mobile E2E
  -> deferred until native delivery is accepted
```

This ADR proposes Vitest, Testcontainers-style orchestration, and Playwright as leading concrete tools. They remain unaccepted until the ADR itself is explicitly accepted and implementation evidence satisfies Section 23.

The proposal is conditional:

- if TypeScript/Node is not accepted, the fast runner must be re-evaluated;
- if PostgreSQL is not accepted, the real-database strategy must target the accepted canonical engine;
- if native Member delivery is accepted, native E2E needs a new evaluation;
- if CI/container constraints make Testcontainers-style orchestration unsuitable, a shared real PostgreSQL service is the first fallback.

## 9. Domain and Application Testing

### 9.1 Domain posture

Prefer small deterministic tests over infrastructure-heavy setup.

Inject or otherwise control:

- business Clock;
- randomness/ID generation where material;
- provider ports;
- policy inputs.

Avoid direct wall-clock sleeps.

Representative domain coverage:

- membership eligibility and expiry boundaries;
- attendance eligibility/duplicates;
- renewal windows/calculations;
- payment effects;
- no-show/retention transitions;
- notification eligibility;
- add-on entitlements;
- money/state invariants.

### 9.2 Application posture

Application/use-case tests verify orchestration while using controlled external ports.

Use:

- fake repository/port only when DB semantics are irrelevant to the use case being tested;
- real DB integration when transaction/constraint/locking semantics matter;
- provider fakes for ordinary application tests;
- the same production authorization boundary.

Do not add `if (TEST)` behavior to business logic.

### 9.3 Test-double taxonomy

- **Fake:** functional in-memory/test implementation with state/behavior.
- **Stub:** supplies controlled inputs/results.
- **Spy:** records interactions for assertions.
- **Mock:** interaction expectation where the interaction itself is contractual.
- **Sandbox:** real provider non-production environment.
- **Real integration:** actual engine/protocol/provider boundary under controlled credentials.

Defaulting every collaborator to a mock is discouraged.

## 10. Authorization and Tenant-Isolation Testing

Authorization is first-class test architecture, not an HTTP-status afterthought.

Required table-driven cases include:

- permitted capability;
- missing capability;
- wrong branch;
- wrong gym;
- cross-tenant resource;
- Member-self correct Member;
- Member-self wrong Member;
- revoked assignment;
- disabled/ineligible account;
- owner without implicit platform/global bypass;
- client-supplied tenant spoof;
- resource-ID substitution.

Tenant fixtures should make at least two independent organizations/gyms easy to construct:

```text
Gym A / Branch A1 / Owner A / Staff A / Member A
Gym B / Branch B1 / Owner B / Staff B / Member B
```

The same production authorization predicate must execute in tests.

If selective PostgreSQL RLS is later accepted, real DB tests must cover runtime/worker/migration roles, missing/wrong tenant context, pool/transaction reuse, rollback reuse, Tenant A -> Tenant B reuse, and owner/BYPASSRLS behavior.

RLS is not accepted by this ADR.

## 11. Database Integration Testing

If `D-ARCH-002` is accepted with PostgreSQL, critical persistence evidence must use real PostgreSQL.

Do not use SQLite, a mock ORM, or in-memory persistence as proof for:

- transactions;
- unique/foreign-key/check constraints;
- locks;
- isolation/concurrency;
- PostgreSQL SQL behavior;
- RLS;
- migrations;
- commit visibility.

### 11.1 Leading orchestration

Testcontainers-style ephemeral PostgreSQL is the leading orchestration candidate because it provides real disposable PostgreSQL with repeatable local/CI lifecycle and dynamic ports.

`Testcontainers != database test framework`.

GymPulse still owns migrations, fixture/builders, isolation, assertions, cleanup, and concurrency scenarios.

A compatible container runtime is a real prerequisite and must be measured for local/CI startup cost.

### 11.2 Isolation options

The implementation may mix:

- database per suite/worker;
- schema per suite;
- explicit fixture reset;
- template/snapshot restore;
- narrowly scoped transaction rollback.

Requirements:

- deterministic;
- parallel-safe;
- no test-order dependence;
- no cross-test data leakage.

A rollback-wrapped transaction cannot be the only persistence strategy because it can hide multi-connection, commit visibility, worker pickup, outbox, locking, and transaction-boundary behavior.

### 11.3 Migration and constraint evidence

Require:

```text
empty DB
-> all migrations
-> current schema
```

and representative supported upgrade-path testing where applicable.

Real DB tests should prove correctness-critical constraints such as provider-event uniqueness, idempotency uniqueness, foreign-key ownership, and financial-effect uniqueness once those schemas are accepted.

### 11.4 Concurrency and idempotency

Support concurrent scenarios:

- duplicate check-in;
- duplicate provider event;
- same idempotency key;
- two renewal attempts;
- worker race;
- payment-effect race;
- job lease/claim race.

Idempotency evidence:

```text
same key + compatible request -> same logical outcome
same key + incompatible request -> stable conflict
concurrent duplicate -> one logical effect
timeout + retry -> no duplicate business effect
```

## 12. API and Contract Testing

ADR-0011 contract tests should verify:

- runtime validation;
- purpose-specific DTO shape;
- status code;
- stable machine-readable error code;
- safe `401/403/404` behavior;
- pagination;
- designated idempotency semantics;
- version behavior;
- unknown/extra-field policy;
- integer-minor-unit money + currency;
- UTC/timezone representations;
- raw webhook verification material.

Testing should detect drift between runtime schema, static TypeScript representation if used, generated OpenAPI if later introduced, and actual HTTP behavior.

Large snapshots are not the primary correctness mechanism. Small structured snapshots may be used when semantic review remains clear.

## 13. Provider Adapter Testing

Each provider adapter should support the smallest useful combination of:

- deterministic fake;
- sanitized representative fixtures;
- official sandbox;
- targeted adapter integration tests.

Fixtures must never contain production secrets, OTPs, raw payment credentials, or unnecessary real PII.

Webhook tests should cover:

- valid signature;
- invalid/wrong/missing signature;
- tampered/raw-body mismatch;
- duplicate event;
- out-of-order/delayed event;
- unknown event;
- retry;
- handler timeout.

Payment tests preserve:

```text
Client Success != Canonical Payment Success
```

and verify that a verified provider event applies the intended membership/add-on effect at most once.

Messaging tests include success, rejection, temporary failure, rate limit, timeout, retry, duplicate-dispatch protection where required, and stale consent/eligibility recheck.

No provider is selected by this ADR.

## 14. Background Worker / Job Testing

Target the Durable Continuation behavior rather than a queue vendor API.

Required scenarios:

- claim;
- success;
- retryable failure;
- permanent/terminal failure;
- dead-letter/redrive semantics when implemented;
- worker restart;
- lease expiry/reclaim;
- duplicate delivery;
- multiple workers;
- tenant context;
- current-state reload;
- business idempotency;
- gym-local scheduled eligibility;
- missed execution/re-run/duplicate trigger.

A strong integration scenario is:

```text
application transaction
-> commit canonical state + durable continuation
-> worker claims
-> reloads current canonical state
-> applies safe idempotent effect
```

If a future external queue requires an outbox, add commit/dispatch failure/retry/duplicate tests then. This ADR does not introduce an outbox or pg-boss.

## 15. Browser E2E Testing

Playwright is the leading browser E2E candidate.

### 15.1 Scope

Keep E2E focused on high-value journeys.

Owner/Staff candidates:

- authentication/session;
- Member search / Member 360 entry;
- Member creation/update;
- assisted check-in;
- attendance correction;
- no-show queue and follow-up;
- renewal flow;
- authorized offline payment/refund paths where enabled.

Member candidates:

- identity verification;
- Member Home;
- QR link entry;
- browser scanner only if implemented;
- check-in;
- renewal;
- checkout launch;
- payment-return reconciliation.

Not every business validation belongs at browser level.

### 15.2 Browser coverage

A future supported-client policy should choose coverage.

Current tool capability supports a pattern such as:

```text
critical smoke across required Chromium/WebKit/Firefox engines
+
deeper regression on representative primary browser(s)
```

without forcing every E2E onto every engine.

### 15.3 Multi-user and auth

Playwright BrowserContexts make isolated simultaneous principals practical for authorization scenarios such as staff + Member or Tenant A + Tenant B.

Stored browser auth state is test-only sensitive material and must never be committed or use production credentials.

### 15.4 Real mobile devices

Browser automation/emulation does not prove:

- physical camera behavior;
- OS permission prompts;
- iOS Safari behavior on a physical device;
- low-end Android performance;
- PWA installed-mode behavior.

Those remain separate real-device acceptance evidence.

### 15.5 Native E2E

Maestro, Detox, Appium, or equivalent are deferred until native delivery is accepted. No native E2E dependency is part of the Phase 1 baseline.

## 16. Test Data, Fixtures, and Isolation

Use:

- small deterministic builders/factories;
- explicit scenario fixtures;
- test database seeds only where appropriate;
- sanitized provider fixtures;
- browser personas.

Prefer builders/factories for combinatorial domain states and fixtures for stable external payloads/canonical scenarios.

Avoid one large shared mutable seed database.

Use synthetic names, phone numbers, email addresses, provider references, and payment payloads unless a later governed process approves sanitized production-derived data.

Tests must be:

```text
order-independent
parallel-safe where designed
deterministically cleaned up
free of shared mutable singleton state
```

When starting local servers/services, isolate ports, databases/schemas, sessions, and browser contexts dynamically.

## 17. Time and Failure Injection

### 17.1 Time

Business/domain code should receive an injectable/testable `Clock` abstraction or equivalent seam rather than scatter direct wall-clock reads.

Tests should pin explicit instants plus gym timezone and cover:

- membership expiry;
- gym-local midnight;
- renewal window;
- no-show threshold;
- QR expiry;
- scheduler eligibility;
- payment reconciliation windows;
- DST where relevant to supported gyms.

Runner fake timers are useful but do not replace an application-level Clock abstraction.

### 17.2 Failure injection

Inject failures at ports/adapters/test infrastructure:

- provider timeout/rejection;
- DB conflict;
- deadlock/retryable DB error where practical;
- job failure;
- notification failure;
- duplicate webhook;
- network timeout.

Reject test-only production backdoors such as:

```text
if (process.env.TEST) bypassAuthorization()
secret production route for E2E
global master test tenant
```

## 18. CI / Release Integration

ADR-0018 defines what evidence is needed. ADR-0017 defines when/how that evidence gates release.

Conceptual layering:

```text
PR fast gate
  -> static/type gates where accepted
  -> domain/application tests
  -> targeted authorization/security tests
  -> targeted integration tests

full merge/release gate
  -> real database/migration/concurrency tests
  -> API/provider/worker tests
  -> focused browser E2E
  -> build/deployment validation under ADR-0017
```

Slow suites are not optional for production simply because developers have a fast local subset.

Tests should be categorizable by architecture/behavior, such as `domain`, `application`, `authorization`, `integration`, `contract`, `provider`, `worker`, `e2e`.

No CI workflow is created by this ADR.

## 19. Security and Privacy Impact

Primary controls:

- no production credentials in test config;
- no production OTP/payment secrets in fixtures;
- no production data mounted into test containers;
- no auth bypass route available in production behavior;
- same production authorization predicate in tests;
- synthetic/minimized test data;
- cross-tenant negative tests;
- raw webhook forgery tests;
- CSRF tests if cookie-session topology uses CSRF-sensitive flows;
- IDOR/BOLA/resource-substitution regression tests;
- safe error/log disclosure tests.

Test artifacts may contain sensitive test state:

- browser traces;
- screenshots;
- storage state;
- network logs;
- test reports;
- failure logs.

Artifact handling under ADR-0017 must prevent leakage. Exact retention remains separately governed.

Playwright auth storage state, if later used, is test-only, short-lived where practical, ignored by source control, and never derived from production credentials.

## 20. Reliability and Maintainability Impact

### Reliability

The portfolio explicitly tests retry, timeout, concurrency, duplicate delivery, commit visibility, worker restart, provider failure, and reconciliation behavior.

Persistent flaky tests are defects.

Runner retries may help diagnose infrastructure instability, but:

```text
retry until green
!=
flake fix
```

Product retry semantics being tested are separate from test-runner retries.

### Maintainability

Shared domain rules remain testable independently from UI/provider frameworks.

Provider changes should replace/extend adapter contract tests without rewriting domain tests.

Queue changes should preserve worker behavioral contracts.

Database provider changes should not rewrite engine-level tests unless the canonical engine changes or provider-specific features are used.

Snapshots are kept small and reviewable.

Coverage is a diagnostic signal, not proof of correctness. No `100% coverage` target is established.

Property-based testing may later target state/money/date/idempotency invariants. Mutation testing/fuzzing may be used selectively for high-risk code. No such tool is mandatory now.

## 21. Developer Experience and Performance

The toolchain should support:

- fast local domain/application feedback;
- watch mode;
- targeted test selection;
- project/package grouping;
- deterministic parallelism;
- separately runnable integration/E2E suites;
- useful failure artifacts;
- reasonable CI startup/runtime.

Vitest currently leads because the proposed TypeScript/ESM/monorepo direction benefits from out-of-box TS/ESM, projects, watch mode, mocks, fake timers, and coverage in one runner.

Node's built-in runner remains a strong minimal-dependency fallback and should be reconsidered if its project/TypeScript/coverage ergonomics materially improve or GymPulse prioritizes dependency minimization.

Testcontainers-style real DB testing adds startup cost. Measure container pulls/startup, DB migration time, parallel worker count, and CI cost before acceptance.

Playwright adds browser download/runtime cost. Keep the browser suite focused and retain traces only according to safe artifact policy.

No exact CI runtime budget is invented.

## 22. Migration and Adoption Plan

If later accepted:

1. establish conceptual test categories and naming.
2. add the selected fast runner only.
3. implement representative pure-domain + Clock tests.
4. add application/use-case and authorization matrix tests.
5. establish safe test builders and two-tenant fixtures.
6. if PostgreSQL is accepted, add real PostgreSQL integration orchestration.
7. prove migrations/constraints/concurrency/idempotency.
8. add API contract tests.
9. add provider fakes/sandbox adapters.
10. add worker retry/restart integration tests.
11. add a small Playwright critical-journey suite.
12. connect evidence categories to ADR-0017 release gates.
13. measure runtime/flakiness/cost.
14. expand only where failure risk justifies it.

Do not begin with a large E2E suite.

## 23. Validation Before Acceptance

Before accepting this ADR, implementation evidence should include at least:

1. deterministic domain test.
2. fake Clock/time-window test.
3. application handler test.
4. authorization positive matrix.
5. authorization negative matrix.
6. cross-tenant negative test.
7. Member-self wrong-member denial.
8. real PostgreSQL migration-from-zero if PostgreSQL is accepted.
9. real PostgreSQL constraint test if PostgreSQL is accepted.
10. transaction rollback test.
11. actual commit visibility test.
12. concurrent duplicate attendance.
13. concurrent idempotency key.
14. duplicate payment webhook.
15. forged payment webhook.
16. payment effect exactly once.
17. DB conflict/failure injection.
18. provider timeout simulation.
19. messaging failure simulation.
20. worker retry.
21. worker duplicate delivery.
22. worker crash/restart.
23. multi-worker race.
24. gym-local timezone boundary.
25. scheduler/missed-run behavior.
26. API validation failure.
27. safe API authorization errors.
28. pagination contract.
29. API idempotency.
30. provider sandbox integration.
31. Owner/Staff critical browser journey.
32. Member browser journey.
33. multiple simultaneous browser/session users.
34. current Chromium critical smoke.
35. WebKit critical Member smoke where supported-client policy requires.
36. Firefox smoke where policy requires.
37. real mobile-browser QR/device acceptance outside emulation.
38. test artifact secret-leak review.
39. no production credential in test environment.
40. parallel suite isolation.
41. no test-order dependence.
42. repeat-run determinism.
43. representative CI runtime/cost measurement.
44. flaky-test ownership/remediation proof.
45. failed required test correctly blocks release under ADR-0017.

No validation is implemented by Task 0026.

## 24. Reversibility

The layered architecture keeps tools replaceable:

- Vitest -> Node/Jest replacement should not change domain/application behavior if tests use normal boundaries.
- Testcontainers -> shared/managed PostgreSQL changes infrastructure orchestration, not DB assertions/fixtures/contracts.
- Playwright -> another browser runner changes E2E harness, not API/domain semantics.
- provider fake/sandbox implementations remain behind provider ports.
- worker tests target Durable Continuation semantics, not queue-vendor APIs.

Avoid tool-specific APIs inside production business code.

## 25. Risks and Mitigations

### Risk: too many slow integration/E2E tests

Mitigation: test behavior at the cheapest trustworthy layer; reserve browser tests for critical journeys.

### Risk: fake-heavy tests create false confidence

Mitigation: real DB/security/provider-boundary tests where infrastructure semantics matter.

### Risk: Testcontainers increases developer/CI setup cost

Mitigation: validate supported container runtimes and startup cost; keep shared CI PostgreSQL as fallback.

### Risk: transaction-rollback fixtures hide commit behavior

Mitigation: dedicated committed/multi-connection/worker/concurrency tests.

### Risk: test auth bypass differs from production

Mitigation: bootstrap test identity/session outside public production routes but exercise the same Principal/authorization code.

### Risk: browser retries hide flakes

Mitigation: retries are diagnostic only; track and fix persistent flakes.

### Risk: traces/screenshots leak test credentials or PII

Mitigation: synthetic data, secure artifact handling, no production auth state.

### Risk: coverage target drives low-value tests

Mitigation: treat coverage as diagnostic; prioritize critical invariants and failure paths.

### Risk: current proposed runtime/database changes

Mitigation: conditionalize Vitest/Testcontainers/PostgreSQL choices and preserve layered contracts.

### Risk: E2E emulation is mistaken for real-device evidence

Mitigation: explicit physical-device acceptance for camera/mobile-OS behavior.

## 26. Revisit Triggers

Revisit the toolchain if:

- TypeScript/Node direction is rejected or materially changes;
- PostgreSQL direction changes;
- container runtime is unavailable/too costly in accepted CI;
- test-suite startup/runtime materially harms developer/release flow;
- persistent flakiness appears;
- browser support policy changes;
- native Member delivery is accepted;
- provider-specific contract complexity increases;
- multiple services require new contract/component testing;
- performance/load testing becomes a release requirement;
- property/mutation/fuzz testing provides clear value for high-risk rules;
- Playwright/Cypress/Node/Vitest capabilities change materially.

## 27. Open Questions

1. Will `D-ARCH-016` be accepted with TypeScript/Node?
2. Will `D-ARCH-002` be accepted with PostgreSQL?
3. Which CI runner/runtime will `D-ARCH-019` accept?
4. Is a compatible container runtime available on the eventual CI runner?
5. What DB isolation mode gives the best speed/fidelity once schema volume is known?
6. Which supported browser engines become mandatory under client policy?
7. How much cross-browser smoke belongs on PR versus merge/release?
8. What artifact retention is safe for browser traces/screenshots/storage state?
9. Which Auth provider sandbox/fixture mechanism is selected?
10. Which payment/messaging provider sandbox policies apply?
11. If RLS is accepted, which DB roles and pooling mode must tests reproduce?
12. What release-time test runtime/cost budget is acceptable?
13. What flake escalation/quarantine policy will Engineering own?
14. When, if ever, does targeted property/mutation/fuzz testing become mandatory?
15. What real-device matrix is required for Member QR/browser acceptance?

## 28. Decision Evidence

### 28.1 Fresh repository audit

Fresh latest-`main` audit verified:

- `docs/adr/ADR-0018-testing-toolchain.md` did not exist before Task 0026.
- `.ai/task/0026-draft-testing-toolchain-adr.md` did not exist.
- Task 0026 remained the next bounded governance task.
- `D-ARCH-018 = P1 PROPOSED`.
- no testing tool had explicit acceptance evidence.
- no current ADR was `Accepted`.
- ADR-0017 was `Proposed` and `D-ARCH-019` remained `OPEN`.
- Vitest, Playwright, Testcontainers, PostgreSQL, Node.js, and exact testing tools remained unaccepted.
- no structured documents currently existed under `docs/09-security/`, `docs/11-observability/`, `docs/12-testing/`, `docs/13-engineering/`, or `docs/14-operations/`; legacy testing/security/engineering documents therefore remained migration evidence only.

Legacy `docs/13-testing-qa.md` already emphasized below-UI business-rule tests, tenant isolation as a tested feature, payment/attendance retries, duplicate scheduled automation, integration tests for DB constraints/tenant filters/API authorization, contract/provider tests, E2E journeys, isolated CI DB, fake/sandbox providers, and controllable time. The structured NFRs and ADRs remain authoritative.

### 28.2 Current official research

Research date: `2026-09-27`.

Vitest:

- Features: https://vitest.dev/guide/features
- Projects: https://vitest.dev/guide/projects
- Mocking: https://vitest.dev/guide/mocking
- Timers: https://vitest.dev/guide/mocking/timers
- Coverage: https://vitest.dev/config/coverage
- Watch: https://vitest.dev/config/watch

Node.js:

- Test runner / mocking / timers / coverage / watch: https://nodejs.org/api/test.html

Jest:

- Configuration/coverage: https://jestjs.io/docs/configuration
- ECMAScript modules: https://jestjs.io/docs/ecmascript-modules
- Timer mocks: https://jestjs.io/docs/timer-mocks
- Getting started / TypeScript guidance: https://jestjs.io/docs/getting-started

Playwright:

- Projects/browsers: https://playwright.dev/docs/test-projects
- Isolation/browser contexts: https://playwright.dev/docs/browser-contexts
- Authentication state: https://playwright.dev/docs/auth
- Parallelism: https://playwright.dev/docs/test-parallel
- Retries: https://playwright.dev/docs/test-retries
- Tracing: https://playwright.dev/docs/trace-viewer
- Configuration/webServer: https://playwright.dev/docs/test-configuration

Cypress:

- Test isolation: https://docs.cypress.io/app/core-concepts/test-isolation
- Cross-browser testing: https://docs.cypress.io/app/guides/cross-browser-testing
- Browser/WebKit support: https://docs.cypress.io/app/references/launching-browsers
- Network interception: https://docs.cypress.io/app/guides/native-network-interception
- Cross-origin behavior: https://docs.cypress.io/api/commands/origin

Testcontainers for Node.js:

- Overview: https://node.testcontainers.org/
- PostgreSQL module: https://node.testcontainers.org/modules/postgresql/
- Supported container runtimes: https://node.testcontainers.org/supported-container-runtimes/
- Wait strategies: https://node.testcontainers.org/features/wait-strategies/
- Container lifecycle/reuse: https://node.testcontainers.org/features/containers/
- Global setup considerations: https://node.testcontainers.org/quickstart/global-setup/

PostgreSQL:

- Current transaction isolation: https://www.postgresql.org/docs/current/transaction-iso.html
- Current constraints: https://www.postgresql.org/docs/current/ddl-constraints.html
- Current row security: https://www.postgresql.org/docs/current/ddl-rowsecurity.html

### 28.3 Material current findings

- Vitest currently provides out-of-box TypeScript/JSX, ESM-first behavior, projects, watch mode, mocking, fake timers, and V8/Istanbul coverage.
- Node's built-in runner currently provides process isolation/concurrency, mocking, stable MockTimers, watch and coverage capabilities, but some test-runner capabilities in current Node docs remain experimental/early-development and exact behavior is version-dependent.
- Jest remains feature-rich, but current Jest documentation still describes ESM support as experimental and TypeScript commonly needs additional transform/compilation setup.
- Playwright supports Chromium/WebKit/Firefox projects, independent BrowserContexts including multiple contexts in one scenario, parallelism, auth state, traces, and mobile emulation.
- Cypress supports Chrome-family/Firefox and currently experimental WebKit; current docs still identify WebKit-specific limitations and a single-tab design.
- Testcontainers for Node.js supports disposable PostgreSQL containers, wait strategies, dynamic ports, and multiple container runtimes, but requires compatible container-runtime infrastructure and adds startup cost.
- Current PostgreSQL documentation confirms behavior around transaction isolation/concurrency, constraints, and RLS that fake persistence cannot faithfully prove.

### 28.4 Missing acceptance evidence

ADR-0018 remains Proposed because there is no implemented representative suite proving:

- developer/CI runtime and startup cost;
- Vitest fit with final TS/runtime/module layout;
- real PostgreSQL isolation strategy;
- Testcontainers compatibility with selected CI;
- concurrency/idempotency behavior;
- provider sandbox strategy;
- worker restart/race behavior;
- Playwright browser matrix and flake rate;
- artifact/secret handling;
- release-gate integration under ADR-0017.

## 29. Related Documents

- `../README.md`
- `../00-overview/assumptions.md`
- `../01-product/functional-requirements.md`
- `../01-product/non-functional-requirements.md`
- `../01-product/user-roles.md`
- `../01-product/user-journeys.md`
- `../02-architecture/architecture-principles.md`
- `../02-architecture/architecture-overview.md`
- `../02-architecture/container-architecture.md`
- `../02-architecture/component-architecture.md`
- `../02-architecture/data-flow.md`
- `../02-architecture/technology-stack.md`
- `README.md`
- `ADR-0001-modular-monolith.md`
- `ADR-0002-primary-language-runtime.md`
- `ADR-0003-monorepo-strategy.md`
- `ADR-0004-database-engine.md`
- `ADR-0005-data-access-migration-strategy.md`
- `ADR-0006-managed-backend-responsibilities.md`
- `ADR-0007-authentication-session-architecture.md`
- `ADR-0008-member-authentication-method.md`
- `ADR-0009-authorization-implementation.md`
- `ADR-0010-data-layer-tenant-isolation-rls.md`
- `ADR-0011-api-contract-architecture.md`
- `ADR-0012-owner-staff-web-framework.md`
- `ADR-0013-member-client-strategy.md`
- `ADR-0014-api-deployment-boundary.md`
- `ADR-0015-background-jobs-scheduler.md`
- `ADR-0016-hosting-deployment-platform.md`
- `ADR-0017-ci-cd-release-secrets.md`
- legacy migration source: `../12-security-audit.md`
- legacy migration source: `../13-testing-qa.md`
- legacy migration source: `../15-engineering-workflow.md`
- legacy migration source: `../16-open-decisions.md`
