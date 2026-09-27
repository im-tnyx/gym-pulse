
# Task 0026: Draft Core Automated Testing Toolchain ADR

## Goal

Draft one `Proposed` ADR for canonical decision `D-ARCH-018` defining GymPulse's core automated testing architecture and leading toolchain candidates without creating tests, installing dependencies, provisioning databases, or implementing CI.

Target:

`docs/adr/ADR-0018-testing-toolchain.md`

## Inputs Read

Fresh latest-`main` inputs:

- `.ai/README.md`
- `.ai/current-state.md`
- `.ai/task/0025-draft-ci-cd-release-secrets-adr.md`
- `docs/README.md`
- `docs/00-overview/assumptions.md`
- `docs/01-product/functional-requirements.md`
- `docs/01-product/non-functional-requirements.md`
- `docs/01-product/user-roles.md`
- `docs/01-product/user-journeys.md`
- `docs/02-architecture/architecture-principles.md`
- `docs/02-architecture/architecture-overview.md`
- `docs/02-architecture/container-architecture.md`
- `docs/02-architecture/component-architecture.md`
- `docs/02-architecture/data-flow.md`
- `docs/02-architecture/technology-stack.md`
- `docs/adr/README.md`
- `docs/adr/ADR-0001-modular-monolith.md`
- `docs/adr/ADR-0002-primary-language-runtime.md`
- `docs/adr/ADR-0003-monorepo-strategy.md`
- `docs/adr/ADR-0004-database-engine.md`
- `docs/adr/ADR-0005-data-access-migration-strategy.md`
- `docs/adr/ADR-0006-managed-backend-responsibilities.md`
- `docs/adr/ADR-0007-authentication-session-architecture.md`
- `docs/adr/ADR-0008-member-authentication-method.md`
- `docs/adr/ADR-0009-authorization-implementation.md`
- `docs/adr/ADR-0010-data-layer-tenant-isolation-rls.md`
- `docs/adr/ADR-0011-api-contract-architecture.md`
- `docs/adr/ADR-0012-owner-staff-web-framework.md`
- `docs/adr/ADR-0013-member-client-strategy.md`
- `docs/adr/ADR-0014-api-deployment-boundary.md`
- `docs/adr/ADR-0015-background-jobs-scheduler.md`
- `docs/adr/ADR-0016-hosting-deployment-platform.md`
- `docs/adr/ADR-0017-ci-cd-release-secrets.md`

Structured directories under `docs/09-security/`, `docs/11-observability/`, `docs/12-testing/`, `docs/13-engineering/`, and `docs/14-operations/` were checked and were not present on latest main.

Legacy migration/evidence inputs reviewed:

- `docs/12-security-audit.md`
- `docs/13-testing-qa.md`
- `docs/15-engineering-workflow.md`
- `docs/16-open-decisions.md`

Canonical structured documentation controls over legacy guidance.

## Repository State Verified

Before creation:

- `docs/adr/ADR-0018-testing-toolchain.md` did not exist.
- `.ai/task/0026-draft-testing-toolchain-adr.md` did not exist.
- Task 0026 remained the actual next bounded governance task.
- `D-ARCH-018` remained `P1 PROPOSED`.
- ADR-0017 was `Proposed` and `D-ARCH-019` remained `OPEN`.
- no current ADR was `Accepted`.
- repository search found no explicit approval evidence accepting Vitest, Playwright, Testcontainers, PostgreSQL, Node.js, Jest, Cypress, or another testing tool.
- no test implementation/configuration/database/container/CI state existed as approval evidence.

## Canonical Decision State

```text
D-ARCH-018
Priority: P1
Status: PROPOSED
Decision: Core automated testing toolchain
Current direction:
  TS-native unit/application tests
  + real PostgreSQL integration tests
  + Playwright-style browser E2E
Exact tools: not accepted
```

ADR-0018 is `Proposed` and does not change `D-ARCH-018` to `DECIDED`.

## Canonical Testability Requirements

Verified:

- `NFR-TESTABILITY-001` — deterministic domain tests.
- `NFR-TESTABILITY-002` — provider simulation.
- `NFR-TESTABILITY-003` — failure injection.
- `NFR-TESTABILITY-004` — authorization matrix tests.
- `NFR-TESTABILITY-005` — controlled/testable time.

Related security/reliability/operations requirements require cross-tenant negative coverage, server-side authorization, webhook verification, retry/idempotency testing, environment isolation, migration safety, safe logs/artifacts, and release gating.

## Testing Layers

The ADR defines:

```text
L1 deterministic domain tests
L2 application/use-case tests
L3 authorization/policy tests
L4 persistence / real-database integration tests
L5 API/contract tests
L6 provider-adapter integration/simulation tests
L7 durable worker/job tests
L8 browser end-to-end tests
L9 deployment/smoke tests owned primarily by ADR-0017
```

The portfolio uses many cheap deterministic tests, focused orchestration tests, targeted real-infrastructure/security evidence, and a small set of high-value browser journeys rather than fixed percentage ratios.

## Tool Categories Evaluated

- TypeScript/Node-compatible unit/application runner.
- Real-database orchestration.
- Browser E2E.
- Provider simulation/sandbox strategy.
- Worker/job behavioral integration.
- time-control/failure-injection strategy.
- CI evidence layering relative to ADR-0017.

## Unit Runner Evaluation

Compared:

- Vitest.
- Node.js built-in test runner.
- Jest.

Current direction:

```text
Vitest = leading candidate
Node test runner = strong minimal-dependency fallback
Jest = credible mature fallback
```

Vitest currently fits the proposed strict-TypeScript/ESM/monorepo direction well through TypeScript support, projects, watch mode, mocking, fake timers, and coverage.

Node's built-in runner has strong runtime alignment and low dependency count but the final experience depends more directly on the accepted Node/TypeScript execution model and current test-runner feature maturity.

Jest remains mature but current official ESM guidance still describes experimental support, and TypeScript commonly introduces extra transform/compilation setup.

No runner is accepted by Task 0026.

## Database Test Strategy Evaluation

Compared:

A. Testcontainers-style isolated ephemeral real PostgreSQL.
B. shared local/CI PostgreSQL service with explicit isolation.
C. managed ephemeral/test PostgreSQL.
D. in-memory/fake persistence only.

Current direction if PostgreSQL is later accepted:

```text
real PostgreSQL semantics
+
Testcontainers-style ephemeral orchestration as leading candidate
+
shared CI PostgreSQL as first fallback
```

Testcontainers is only infrastructure orchestration; GymPulse still owns migrations, fixtures, isolation, assertions, cleanup, and concurrency semantics.

Fake/in-memory persistence may support non-persistence application tests but is not PostgreSQL proof.

No database/container/runtime is created or accepted.

## Browser E2E Evaluation

Compared Playwright and Cypress.

Current direction:

`Playwright` is the leading browser E2E candidate because current official capabilities align well with GymPulse needs:

- Chromium/WebKit/Firefox projects;
- isolated BrowserContexts;
- multiple user contexts in one scenario;
- parallel workers;
- authentication state;
- trace/debug artifacts;
- network control;
- mobile emulation.

Cypress remains credible but current WebKit support is experimental and its single-tab/cross-origin model is less convenient for some GymPulse multi-user and iPhone-adjacent evidence.

Browser emulation is explicitly not treated as real-device camera/mobile-OS proof.

No browser is installed and no E2E config is created.

## Current Official Research

Fresh first-party documentation was researched for:

- Vitest features, projects, mocking, timers, coverage, watch behavior.
- Node.js test runner, mocking, timers, coverage, watch/isolation.
- Jest ESM, TypeScript guidance, timers, coverage/projects.
- Playwright projects, browsers, contexts, parallelism, retries, tracing, auth state, web server configuration.
- Cypress browser support, WebKit, isolation, origin/session/network behavior.
- Testcontainers for Node.js PostgreSQL module, runtimes, wait strategies, lifecycle/reuse.
- PostgreSQL current transactions/isolation, constraints, and row security.

No product version is accepted/pinned by this research.

## Research Date

`2026-09-27`

## Domain Test Posture

Domain tests should be deterministic and independent from browser/HTTP/provider/production DB when infrastructure semantics are not part of the rule.

Target rules include:

- membership and attendance eligibility;
- duplicate attendance;
- lifecycle transitions;
- renewals;
- payment effects;
- no-show/retention;
- notification eligibility/suppression;
- add-on entitlement;
- time-window behavior.

## Application Test Posture

Application/use-case tests verify orchestration:

```text
load current state
-> authorize
-> validate rule
-> transact
-> audit
-> enqueue durable continuation
-> return result
```

Use fakes/stubs for external ports when appropriate, but use real DB integration whenever transactions/constraints/concurrency are the subject.

## Authorization Test Posture

Authorization is first-class.

Use table-driven positive/negative cases for:

- capability present/missing;
- tenant/gym/branch scope;
- resource relationship;
- Member-self correct/wrong Member;
- revoked assignment;
- disabled/ineligible account;
- tenant/resource spoofing;
- owner without implicit global bypass.

Tests exercise the same production authorization predicate.

## Tenant Isolation / RLS Test Posture

Every relevant integration layer should support at least two tenants/gyms for negative tests.

If PostgreSQL RLS is later accepted, test:

- runtime role;
- worker role;
- migration/admin role;
- tenant context;
- missing/wrong context;
- connection/pool/transaction/rollback reuse;
- Tenant A -> Tenant B reuse;
- owner/BYPASSRLS behavior.

This ADR does not accept RLS.

## Database Integration Posture

If PostgreSQL is accepted, critical persistence tests must run against real PostgreSQL for:

- transactions/commit/rollback;
- constraints;
- migrations;
- locking/isolation/concurrency;
- idempotency uniqueness;
- provider-event uniqueness;
- optional RLS behavior.

Test-wide rollback is not the only isolation strategy because it can hide commit visibility, multi-connection, worker, outbox, and locking behavior.

## API Contract Test Posture

ADR-0011-aligned contract tests should verify:

- runtime validation;
- DTO shape;
- status + stable machine error;
- safe authorization errors;
- pagination;
- idempotency;
- version behavior;
- extra/unknown-field policy;
- money/time representation;
- webhook raw-signature boundary.

Large snapshots are not the primary correctness mechanism.

## Provider Test Posture

Provider adapters use combinations of:

- deterministic fake;
- sanitized fixture;
- official sandbox;
- targeted non-production integration.

Routine CI does not use production provider accounts.

Webhook tests include authentic, forged, missing/tampered, duplicate, out-of-order, delayed, timeout, and retry paths.

Provider fixtures contain no production secret, OTP, raw payment credential, or unnecessary PII.

## Worker / Job Test Posture

Test Durable Continuation behavior rather than pg-boss/vendor API semantics.

Cover:

- claim/success;
- retryable/permanent failure;
- terminal/redrive behavior when implemented;
- worker restart;
- lease/reclaim;
- duplicate delivery;
- multiple workers;
- tenant context;
- current-state reload;
- business idempotency;
- scheduled timezone/missed-run behavior.

No queue implementation is accepted.

## Browser E2E Posture

Use a bounded set of critical Owner/Staff and responsive-Member journeys.

Representative candidates include:

- staff auth/session;
- Member search/create/update;
- assisted attendance/correction;
- no-show/follow-up;
- renewal/payment;
- Member identity/Home/check-in/payment-return reconciliation.

Cross-browser strategy should follow accepted supported-client policy rather than blindly running every test on every engine.

Real mobile-device evidence remains separate from emulation.

## Native E2E Posture

Deferred.

Maestro, Detox, Appium, or equivalent are not Phase 1 baseline tooling unless native Member delivery is later accepted.

## Test Data / Isolation Posture

Use:

- deterministic factories/builders;
- focused scenario fixtures;
- test-only DB seeds where needed;
- sanitized provider fixtures;
- browser personas.

Avoid one giant mutable seed DB.

Use synthetic PII/payment/provider references unless a future governed process approves sanitized production-derived data.

Tests should be order-independent, parallel-safe, and deterministic.

## Time Control Posture

Prefer an application/domain `Clock` abstraction or equivalent seam.

Pin explicit instants plus gym timezone for expiry, local midnight, renewal/no-show windows, QR expiry, scheduler eligibility, reconciliation, and relevant DST scenarios.

Runner fake timers are useful but do not replace the application-level time seam.

## Failure Injection Posture

Inject failures through ports/adapters/test infrastructure:

- provider timeout/rejection;
- DB conflict/deadlock where practical;
- job failure;
- notification failure;
- webhook duplicate;
- network timeout.

Reject unsafe test-only business-code branches or production bypass endpoints.

## CI Layering Posture

ADR-0018 owns test evidence categories; ADR-0017 owns release gating.

Conceptual layering:

```text
PR fast gate
  -> domain/application
  -> authorization/security
  -> targeted integration

full merge/release gate
  -> real database/migration/concurrency
  -> API/provider/worker
  -> focused browser E2E
  -> deployment evidence under ADR-0017
```

No CI workflow is implemented.

## Security Findings

Testing architecture explicitly addresses:

- cross-tenant/IDOR/BOLA regression;
- authorization bypass;
- forged webhooks;
- CSRF where applicable;
- idempotency replay;
- tenant spoofing;
- safe errors/logs;
- production-secret exclusion;
- synthetic/minimized test data;
- browser trace/storage-state sensitivity;
- test-container isolation from production data/credentials.

## Reliability Findings

The proposal directly exercises:

- duplicate/retry paths;
- transaction/concurrency behavior;
- payment exactly-once effects;
- worker restart/replay;
- provider timeouts;
- reconciliation;
- scheduler/timezone semantics.

Persistent flaky tests are correctness debt. Runner retry is diagnostic, not a flake solution.

Coverage is a diagnostic signal, not correctness proof.

## Developer Experience Findings

Leading candidates emphasize:

- fast local feedback;
- watch/targeted runs;
- monorepo/project grouping;
- parallelism/isolation;
- separately runnable slow suites;
- actionable failure artifacts.

Testcontainers-style DB and Playwright browser execution add real setup/runtime cost that must be measured before acceptance.

## Evaluation Summary

Current strongest composite direction:

```text
Vitest candidate
  -> fast TS domain/application/authorization tests

real PostgreSQL if accepted
  -> isolated ephemeral integration
  -> Testcontainers-style orchestration leading candidate

Playwright candidate
  -> focused browser E2E

provider fakes + sanitized fixtures + sandboxes
+
table-driven auth/tenant negatives
+
worker/job integration
+
application Clock
+
controlled failure injection
+
native E2E deferred
```

This is a proposal, not accepted implementation.

## Proposed Direction

Adopt the layered testing architecture as the architectural direction and retain Vitest, Testcontainers-style PostgreSQL orchestration, and Playwright as the current leading concrete tools pending explicit acceptance and implementation evidence.

Do not couple domain correctness to UI/framework/provider tools.

## Decisions Kept Separate

Task 0026 does not accept or decide:

```text
D-ARCH-016 TypeScript / Node runtime
D-ARCH-002 PostgreSQL
D-ARCH-017 Drizzle/Kysely/Prisma
D-ARCH-015 authorization implementation acceptance
D-SEC-008 RLS
D-ARCH-003 API contract acceptance
D-ARCH-012 Next.js
D-ARCH-013 Member delivery/native client
D-ARCH-007 pg-boss / queue technology
D-ARCH-009 hosting
D-ARCH-019 GitHub Actions / CI implementation
D-ARCH-011 pnpm
D-ARCH-004 Auth provider/session
D-SEC-002 member authentication
D-PROVIDER-001 payment provider
D-PROVIDER-002 messaging provider
D-PROVIDER-006 observability provider
```

Vitest, Playwright, Testcontainers, Jest, Cypress, Node test runner, PostgreSQL, Node.js, and native E2E tools remain unaccepted.

## Requirement IDs Referenced

Verified current IDs include:

```text
NFR-TESTABILITY-001..005
NFR-SECURITY-001..005
NFR-SECURITY-008..011
NFR-PRIVACY-001..006
NFR-RELIABILITY-001..008
NFR-PERFORMANCE-001..006
NFR-SCALABILITY-003..004
NFR-OBSERVABILITY-001..007
NFR-OPERATIONS-001..004
FR-CROSS-001..004
```

No requirement ID was invented.

## Validation Required

Before acceptance:

1. deterministic domain test.
2. fake Clock/time-window test.
3. application handler test.
4. authorization positive matrix.
5. authorization negative matrix.
6. cross-tenant negative test.
7. Member-self wrong-member denial.
8. real PostgreSQL migration-from-zero if PostgreSQL accepted.
9. real PostgreSQL constraint test if PostgreSQL accepted.
10. transaction rollback test.
11. actual commit visibility.
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
33. multiple browser/session users.
34. Chromium critical smoke.
35. WebKit critical Member smoke where policy requires.
36. Firefox smoke where policy requires.
37. real mobile-browser QR/device acceptance outside emulation.
38. test artifact contains no secret.
39. no production credential in test.
40. parallel isolation.
41. no order dependence.
42. deterministic repeat run.
43. representative CI runtime/cost.
44. flaky-test handling proof.
45. required test failure blocks release under ADR-0017.

No validation is implemented in Task 0026.

## Files Changed

Created:

```text
docs/adr/ADR-0018-testing-toolchain.md
.ai/task/0026-draft-testing-toolchain-adr.md
```

Governance continuity updates:

```text
docs/adr/README.md
docs/README.md
.ai/current-state.md
```

## Open Questions

- final TypeScript/Node acceptance;
- final PostgreSQL acceptance;
- selected CI runner/container-runtime compatibility;
- DB test-isolation mechanism;
- mandatory supported browser matrix;
- PR versus release cross-browser depth;
- browser artifact retention;
- Auth/payment/messaging sandbox details;
- RLS role/pool behavior if accepted;
- acceptable test runtime/cost budget;
- flaky-test ownership policy;
- future property/mutation/fuzz tooling;
- real-device Member test matrix.

## Result

Task 0026 produces a review-ready layered testing proposal:

```text
fast deterministic TS-oriented tests
+
first-class authorization/tenant negatives
+
real database semantics where required
+
provider fakes/sandboxes
+
worker retry/restart/idempotency evidence
+
focused Playwright-style browser E2E
+
controlled time/failure injection
+
ADR-0017-aware CI evidence layering
```

ADR-0018 remains `Proposed`.

Canonical `D-ARCH-018` remains `P1 PROPOSED`.

Explicitly not created/installed/configured:

```text
No tests/ or __tests__/
No *.test.ts / *.spec.ts
No Vitest/Jest/Playwright/Cypress config
No testing dependency
No browser install
No Testcontainers setup
No Docker/Docker Compose test stack
No test database
No fixture/factory implementation
No mock server
No provider sandbox account
No CI workflow
No coverage config
No native E2E tooling
No prior ADR acceptance
No D-ARCH-018 promotion to DECIDED
```

## Next Recommended Task

After governance synchronization, fresh-read:

- `docs/adr/README.md`
- `docs/00-overview/assumptions.md`
- `docs/README.md`
- `.ai/current-state.md`

and record the actual next bounded task.

The pre-task queue currently suggests `D-ARCH-011` Package Manager as order 19, but Task 0026 does not assume or execute Task 0027 until synchronization confirms the queue.
