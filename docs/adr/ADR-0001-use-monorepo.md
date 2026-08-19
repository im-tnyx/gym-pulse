# ADR-0001: Use a Monorepo

## Status

Proposed

## Decision Metadata

- ADR: `ADR-0001`
- Primary Decision ID: `D-ARCH-001`
- Related Decision IDs: `D-ARCH-005`, `D-ARCH-006`, `D-ARCH-011`, `D-ARCH-012`, `D-ARCH-014`
- Decision Owner: `Open`
- Technical Owner: `Architecture`
- Date Proposed: `2026-08-19`
- Date Accepted: `Not accepted`
- Supersedes: `None`
- Superseded By: `None`

## 1. Context

GymPulse is being designed as a multi-client, multi-tenant product with at least these logical code consumers:

- Owner/Staff Web,
- Member Mobile when native delivery is activated,
- trusted Application/API runtime,
- Worker/Job runtime,
- shared domain and application logic,
- typed contracts and runtime schemas,
- database schema/migrations/repositories,
- payment, messaging, storage, analytics, and observability adapters,
- documentation, test utilities, configuration, and CI rules.

The current repository is still in product/architecture specification state rather than implementation state. This means the repository strategy can be chosen before application code and package coupling make reversal more expensive.

The central decision is whether GymPulse should organize implementation in one repository with explicit workspace/package boundaries, split applications/runtimes into separate repositories, or keep a single application repository without deliberate reusable package boundaries.

This ADR resolves repository/source organization only. It does **not** decide runtime deployment topology. A monorepo can still deploy the web application, API, worker, and mobile application independently.

## 2. Requirements and Decision Drivers

The decision is primarily driven by these requirements and architecture constraints:

- `NFR-MAINTAINABILITY-001` Core business rules must not be duplicated across member app, owner web, and workers.
- `NFR-MAINTAINABILITY-002` Primary TypeScript boundaries should use shared/generated typed contracts with runtime validation.
- `NFR-MAINTAINABILITY-005` Material product/architecture/API/state changes should update Docs-as-Code in the same change set.
- `NFR-MAINTAINABILITY-006` Major architecture choices require ADRs.
- `NFR-SCALABILITY-002` Phase 1 should preserve modular boundaries before distributed-service decomposition.
- `NFR-SCALABILITY-004` Background work should be separable from interactive request processing.
- `NFR-SCALABILITY-005` Phase 1 should not introduce microservices for hypothetical scale.
- `NFR-TESTABILITY-001` Domain rules should be testable outside UI execution.
- `NFR-SECURITY-004` Secrets and server credentials must not leak into client bundles.
- `AP-001` Modular Monolith Before Microservices.
- `AP-003` Explicit Domain Boundaries.
- `AP-013` Stable Contracts at Boundaries.

Operational decision drivers:

1. small initial engineering surface and fast pilot iteration,
2. coordinated web/mobile/API/worker changes,
3. one review surface for schema + contracts + application changes,
4. ability to test affected consumers together,
5. ability to preserve package-level security/dependency boundaries,
6. future ability to deploy runtimes independently,
7. low migration cost while implementation has not yet begun.

## 3. Constraints and Assumptions

### Confirmed / established constraints

- Phase 1 architecture is a modular monolith, not a microservice-per-domain design.
- Server-side application/domain logic owns canonical business truth.
- Web/mobile clients must not own final membership, attendance, payment, or authorization decisions.
- API and worker components should reuse the same domain/application rules instead of copying them.
- Provider adapters and database access are server-only concerns.

### Proposed / assumed related choices

- TypeScript is the current primary application-language direction.
- `D-ARCH-014` currently assumes `pnpm`, but this ADR does not accept that package-manager decision.
- Turborepo is the current leading task-orchestration candidate, but the core decision is **monorepo**, not a permanent commitment to one orchestration tool.
- `D-ARCH-011` and `D-ARCH-012` propose Next.js and Expo/React Native respectively; this ADR remains valid if those framework decisions later change.

### Open choices deliberately not resolved here

- `D-ARCH-006` API deployment topology,
- `D-ARCH-007` job-runner technology,
- `D-ARCH-013` managed backend,
- hosting/provider selections,
- exact package manager,
- exact workspace task orchestrator,
- exact final package names.

## 4. Options Considered

### Option A: TypeScript monorepo with explicit apps/packages boundaries

Conceptual shape:

```text
apps/
  web/
  member-mobile/
  api/          # only if deployed separately
  worker/       # deployable form remains separate decision

packages/
  application/
  domain/
  contracts/
  auth/
  database/
  payments/
  notifications/
  jobs/
  audit/
  observability/
  config/
  ui/

docs/
.ai/
```

The exact package tree remains implementation design, but dependencies are intentional and enforced.

Benefits:

- shared domain/application code without publishing internal packages externally,
- typed contract changes can be updated atomically with consumers,
- schema/migration changes can be reviewed with affected API/application changes,
- one PR can update implementation, tests, and Docs-as-Code together,
- CI can run affected-package checks while still validating shared-package dependents,
- mobile/web/API/worker compatibility is easier to inspect in one change set,
- later runtime deployment can remain independent.

Costs/risks:

- package boundaries must be actively enforced,
- CI may grow if every change triggers every application,
- repository permissions are coarser than separate-repository permissions,
- careless shared packages can become an unstructured dependency dump,
- server-only modules can leak toward client applications if import boundaries are weak.

### Option B: Separate repositories per application/runtime

Possible shape:

```text
gym-pulse-web
gym-pulse-mobile
gym-pulse-api
gym-pulse-worker
gym-pulse-shared-contracts
```

Benefits:

- repository-level access and ownership isolation,
- independent versioning and release workflows,
- smaller repository checkout/build surfaces per team,
- stronger organizational boundaries when independent teams own runtimes.

Costs/risks for current GymPulse phase:

- shared contracts/domain behavior require package publishing or duplicated definitions,
- cross-repository changes become coordinated multi-PR releases,
- schema/API/client compatibility becomes more operationally expensive,
- documentation can drift from implementation across repositories,
- early small-team development gains little from repository-level separation,
- version skew is more likely before independent release cadence is actually needed.

### Option C: Single application repository with minimal/no package boundaries

Possible shape:

```text
src/
  app/
  api/
  lib/
  utils/
```

Benefits:

- least setup effort,
- simple local development for one initial application,
- minimal workspace/task-orchestration configuration.

Costs/risks:

- domain/application/provider/database concerns tend to collapse into framework folders,
- future mobile/worker/API reuse becomes copying or refactoring under delivery pressure,
- client/server import boundaries become unclear,
- large generic `lib/` or `utils/` areas become architectural escape hatches,
- later extraction into deliberate packages is more expensive after code is coupled.

## 5. Evaluation

| Criterion | Option A: Explicit monorepo | Option B: Separate repos | Option C: Single unstructured repo |
|---|---|---|---|
| Shared domain-rule reuse | Strong | Possible but requires versioned shared packages | Weak as clients/runtimes expand |
| Typed contract reuse | Strong and atomic | Strong only with publishing/version coordination | Local only; weak across future repos/apps |
| Cross-app atomic change | Strong | Weak/coordination-heavy | Strong initially, then degrades as apps separate |
| Domain boundary enforcement | Strong if workspace rules exist | Strong at repo boundary, weaker for shared contracts | Weak unless discipline is added later |
| CI/build simplicity now | Moderate | Higher operational setup | Strong initially |
| Affected-build optimization later | Strong | Naturally isolated per repo | Limited without later restructuring |
| Local development | Strong for integrated flows | More setup across repositories | Strong for one app only |
| Independent deployment | Supported | Supported | Possible but usually requires restructuring |
| Release independence | Supported with path/build pipelines | Strongest | Weak initially |
| Mobile/web/API coordination | Strong | Coordination-heavy | Becomes difficult as clients multiply |
| Docs-as-Code synchronization | Strong | Harder across repos | Strong while one repo remains sufficient |
| Security through repo permissions | Moderate | Strongest | Moderate |
| Security through code/import boundaries | Strong if enforced | Strong between repos | Weak by default |
| Reversibility | Moderate | Moderate | Becomes expensive after coupling grows |
| Fit for current small-team/pilot stage | Strong | Overhead exceeds current need | Fastest initially but highest architecture-debt risk |

### Evaluation summary

Option A best matches the current architecture because GymPulse has several logical applications/runtimes that intentionally share domain/application/contracts while still requiring server/client boundaries.

Option B becomes more attractive if future teams require independent repository permissions, ownership, release cadences, or compliance isolation. Current evidence does not establish that need.

Option C optimizes initial setup at the cost of the exact modular boundaries the architecture has already identified as important.

## 6. Proposed Decision

**Propose using a monorepo for GymPulse implementation, with explicit application and package boundaries.**

The decision, if later accepted, means:

1. web, mobile, API, worker, shared application/domain/contracts, infrastructure adapters, documentation, and tests may live in one repository,
2. reusable business logic must live outside UI/framework route layers,
3. server-only packages must be non-importable from browser/mobile bundles,
4. package dependency direction must reflect the component architecture,
5. application deployability remains independent from repository organization,
6. internal package sharing does not grant cross-domain write ownership,
7. CI should validate affected applications when shared packages change,
8. repository organization must not become a generic shared-code dumping ground.

### Proposed dependency direction

```text
apps/*
  -> application/contracts/ui as appropriate

application
  -> domain + ports/contracts

domain
  -> domain-safe types/interfaces only

infrastructure adapters
  -> implement application/domain ports

client apps
  -X-> database adapters
  -X-> provider secrets
  -X-> server configuration
```

### Tooling scope

This ADR proposes the **monorepo architecture**, not permanent selection of Turborepo or pnpm.

- Turborepo remains a leading orchestration candidate.
- `D-ARCH-014` package manager remains `ASSUMED` until separately resolved or explicitly included in a later accepted tooling decision.

## 7. Consequences

### Positive

- one change set can modify domain rules, contracts, clients, tests, migrations, and docs coherently,
- web/API/worker code can share business rules without external package publishing,
- contract compatibility is easier to verify during review,
- future application additions can reuse established packages,
- CI can understand dependency graphs and run affected checks,
- the source organization supports the modular-monolith architecture without forcing one runtime deployment.

### Negative

- repository size and CI complexity will grow,
- package boundaries require lint/build/import enforcement,
- developer tooling must handle multiple applications and environments,
- ownership boundaries are conventions/configuration rather than repository separation,
- an accidental server package import into client code can create security/bundle risk if guardrails are absent.

### Neutral / operational

- deployment pipelines can still be independent per application,
- one repository does not imply one database connection strategy or one hosting platform,
- package versioning can remain workspace-internal until external consumers appear.

## 8. Security and Privacy Impact

A monorepo increases the importance of **code-boundary enforcement** because client and server code are physically near each other.

Required controls if accepted:

- server-only packages for database/provider/secret-bearing code,
- build-time/lint dependency restrictions preventing web/mobile imports of server-only packages,
- environment-variable conventions that distinguish public client configuration from server secrets,
- no service-role/database credentials in reusable client-safe packages,
- secret scanning in CI,
- code owners/review rules for auth, payment, database, security, and infrastructure packages where useful,
- tenant authorization remains runtime/server-side and is not weakened by shared repository access.

Repository access itself must not be treated as production-data or production-secret access.

## 9. Reliability, Performance, and Scalability Impact

Repository strategy does not directly determine runtime performance.

Reliability benefits come indirectly from:

- one canonical domain-rule implementation reused by API and workers,
- atomic contract + consumer changes,
- shared deterministic test utilities,
- easier integration testing across application boundaries.

Scalability implications:

- each deployable application can still scale independently,
- source packages can later be extracted into separate repositories/services if evidence requires it,
- monorepo task orchestration should support affected builds/tests so repository growth does not force full rebuilds forever.

This ADR does not accept microservices or separate API deployment.

## 10. Operations and Observability Impact

If accepted, CI/CD should understand applications as independently buildable/deployable units even though they share a repository.

Recommended operational properties:

- one root lockfile/workspace dependency graph,
- per-app build/deploy targets,
- shared package changes trigger dependent checks,
- environment-specific secrets remain outside source control,
- release metadata can identify commit SHA plus application deployment version,
- observability packages may share interfaces/configuration but runtime credentials remain environment-specific.

Monorepo CI failure must not automatically require all applications to deploy together.

## 11. Testing and Validation

Before acceptance or implementation scaffold completion, validate at least:

1. a minimal workspace can build web plus one shared domain/contracts package,
2. a server-only package cannot be imported into a client/mobile application without CI/build failure,
3. shared contract change triggers affected consumer typecheck/tests,
4. domain tests run without Next.js/Expo runtime,
5. application and worker layers can import the same domain/application logic without duplication,
6. CI can target an application while still including affected shared dependencies,
7. local development commands remain understandable for a small team.

### Evidence Gap

No implementation spike or CI benchmark is currently recorded in the repository.

### Decision Required Before

Repository/application scaffold is treated as the long-term implementation baseline.

## 12. Migration and Rollout

Because the repository is still documentation/architecture-first, the cheapest rollout is to establish workspace boundaries during the initial scaffold rather than migrating coupled application code later.

Proposed rollout if accepted:

```text
1. create workspace root
2. create minimal apps/ and packages/ boundaries
3. add dependency-direction rules
4. add strict TypeScript/runtime validation conventions
5. add CI for lint/typecheck/test/build
6. verify server-only/client-safe package boundaries
7. add applications incrementally
8. keep docs and ADRs in the same repository
```

Do not create empty packages merely to match a diagram. A package should exist when it owns real source, a stable boundary, or tooling responsibility.

## 13. Reversibility

### Cost of reversing early

Low to moderate while implementation is small. Applications/packages can be split into separate repositories with history-preserving tooling if needed.

### Cost of reversing later

Moderate to high once:

- CI depends heavily on workspace graphs,
- many internal packages have direct source imports,
- coordinated releases assume one repository,
- shared tooling/config becomes deeply centralized.

### Reconsideration triggers

Revisit this decision if:

- independent teams require repository-level permission isolation,
- applications have materially independent release cadences and shared-package coordination becomes a bottleneck,
- compliance/security requires source isolation,
- repository/CI scale causes persistent operational problems not solved by affected-build tooling,
- part of the platform is acquired, outsourced, or transferred to an independent ownership boundary.

A material reversal after acceptance should use a superseding ADR.

## 14. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Monorepo becomes a shared-code dump | Enforce domain/application/package ownership and dependency rules. |
| Client imports server secrets/adapters | Separate client-safe/server-only packages; lint/build checks; secret scanning. |
| Every change runs every pipeline | Use dependency-aware affected builds/tests when repository size warrants it. |
| One repository implies one deployment | Maintain per-app build/deploy configuration; keep `D-ARCH-006` separate. |
| Shared package changes break many consumers | Typed contracts, CI dependency graph, integration tests, controlled compatibility rules. |
| Package cycles appear | Dependency-direction rules and architecture tests. |
| Tooling becomes Turborepo-specific | Keep logical package boundaries independent of orchestration implementation where practical. |
| Repo-level permissions become insufficient later | Introduce CODEOWNERS/review rules first; split repositories through superseding ADR if organizational need becomes real. |

## 15. Open Questions

1. Who is the authorized decision owner for `D-ARCH-001`?
2. Should the initial monorepo orchestrator be Turborepo, or should the first scaffold compare another workspace task runner?
3. Should `D-ARCH-014` package-manager selection be accepted inside a separate tooling ADR or handled as a lower-impact engineering decision?
4. Which dependency-boundary mechanism will enforce client-safe vs server-only imports?
5. Which packages should exist on day one versus be introduced only when real code requires them?
6. What CI provider and deployment platform constraints may affect workspace caching or affected builds?

None of these questions prevent the monorepo strategy from being reviewed, but they should be resolved during scaffold planning where they affect implementation.

## 16. Decision Evidence

`None - Proposed`.

Current supporting design evidence is repository documentation:

- the product requires multiple clients/runtimes with shared business truth,
- architecture documents require explicit domain boundaries and reusable application/domain logic,
- technology evaluation recommends a monorepo for the current TypeScript-heavy direction,
- implementation has not yet established an irreversible repository topology.

Explicit acceptance evidence has not been supplied. Therefore this ADR remains `Proposed` and `D-ARCH-001` remains `PROPOSED` in the canonical decision register.

## 17. Related Documents

- `README.md` in this ADR directory
- `../00-overview/assumptions.md`
- `../01-product/non-functional-requirements.md`
- `../02-architecture/architecture-principles.md`
- `../02-architecture/architecture-overview.md`
- `../02-architecture/container-architecture.md`
- `../02-architecture/component-architecture.md`
- `../02-architecture/data-flow.md`
- `../02-architecture/technology-stack.md`
- legacy migration input: `../15-engineering-workflow.md`

## Acceptance Checklist

This ADR may move from `Proposed` to `Accepted` only when:

- an authorized decision owner is identified,
- explicit approval evidence is recorded,
- the monorepo boundary proposal is reviewed against implementation/scaffold constraints,
- unresolved evidence gaps are either resolved or explicitly accepted as risk,
- `D-ARCH-001` is changed from `PROPOSED` to `DECIDED` in `../00-overview/assumptions.md`,
- affected architecture/engineering documentation is synchronized.
