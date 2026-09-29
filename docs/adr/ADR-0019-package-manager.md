# ADR-0019: Package Manager

## Status

`Proposed`

## Decision Metadata

- ADR: `ADR-0019`
- Primary Decision ID: `D-ARCH-011`
- Related Decision IDs: `D-ARCH-001`, `D-ARCH-016`, `D-ARCH-019`, `D-ARCH-018`, `D-ARCH-012`, `D-ARCH-013`, `D-ARCH-009`
- Decision Owner: `Open`
- Technical Owner: `Architecture / Engineering / DevSecOps`
- Date Proposed: `2026-09-27`
- Date Accepted: `Not accepted`
- Supersedes: `None`
- Superseded By: `None`

## 1. Context

GymPulse is moving toward one repository with deliberate application/package boundaries, but the repository strategy, TypeScript/Node runtime, web framework, CI/CD platform, and exact implementation tooling all remain governed independently.

Canonical `D-ARCH-011` is currently `P1 ASSUMED`. The legacy/current working assumption is `pnpm`, but an assumption and repeated examples are not approval evidence.

The package-manager decision is narrower than the monorepo decision. It must answer:

> What package manager should GymPulse use to produce deterministic, reviewable, workspace-aware dependency installation with strong dependency isolation and safe CI behavior, without silently selecting the runtime, monorepo orchestrator, application frameworks, or CI provider?

This ADR evaluates `pnpm`, `npm`, `Yarn`, and `Bun` against GymPulse-specific repository, security, CI, and reversibility needs.

This ADR does not install a package manager, create a lockfile, create workspace configuration, create `package.json`, install dependencies, or make `D-ARCH-011` `DECIDED`.

## 2. Requirements and Decision Drivers

Primary repository and quality drivers are:

- `NFR-MAINTAINABILITY-001`: shared domain rules should not be duplicated across applications/workers.
- `NFR-MAINTAINABILITY-002`: typed application boundaries should remain reusable where the accepted runtime supports them.
- `NFR-MAINTAINABILITY-005`: material architecture/tooling changes should synchronize Docs-as-Code.
- `NFR-MAINTAINABILITY-006`: major architecture choices require ADR governance.
- `NFR-SECURITY-004`: secrets and credentials must not be committed or exposed through client artifacts.
- `NFR-OPERATIONS-001`: development/test/staging/production configuration must remain separated.
- `NFR-OPERATIONS-002`: production credentials must not be casually reused in development/preview.
- `NFR-TESTABILITY-001..005`: the future install/tooling model must support deterministic local and CI execution of the accepted testing architecture.

Repository/CI evidence additionally requires:

1. one reviewable dependency graph and lockfile policy;
2. deterministic/frozen CI installation;
3. explicit workspace package ownership and linking;
4. protection against accidental undeclared/phantom dependencies;
5. ordinary local and CI reproducibility;
6. no package-manager dependency on production hosting;
7. cache behavior that improves performance without changing correctness;
8. explicit handling of dependency lifecycle/install scripts;
9. dependency-security review without treating an audit command as complete supply-chain assurance;
10. compatibility with the eventual accepted TypeScript/Node toolchain;
11. compatibility with independent application build/deployment artifacts;
12. low-cost migration/reversal if later evidence changes the choice.

## 3. Constraints and Assumptions

1. `D-ARCH-011` remains `P1 ASSUMED`.
2. `ADR-0019` is `Proposed`, not `Accepted`.
3. `D-ARCH-001` is `DECIDED`; the explicit monorepo strategy is accepted by ADR-0003, not by this ADR.
4. `D-ARCH-016` is `DECIDED`; strict TypeScript + supported Node.js LTS is accepted by ADR-0002, while exact runtime version remains separate.
5. `D-ARCH-019` remains `OPEN`; this ADR does not accept GitHub Actions or another CI provider.
6. `D-ARCH-018` remains `PROPOSED`; this ADR does not install or accept test tooling.
7. `D-ARCH-012` and `D-ARCH-013` remain `PROPOSED`.
8. Turborepo is a separate workspace/task-orchestration concern and is not accepted by choosing a package manager.
9. Exact package-manager version pinning is required before implementation, but no version is selected by this ADR.
10. Exact dependency versions remain ordinary implementation/dependency-governance choices unless separately material.
11. Package-manager security features reduce risk but do not replace dependency review, CI security, provenance, vulnerability management, or code review.
12. Registry credentials, tokens, and private-registry configuration containing secrets must never be committed.
13. No current lockfile or package-manager configuration is treated as approval evidence because none exists on latest `main`.

## 4. Decision Boundaries

Keep these distinctions explicit:

```text
Package Manager != Repository Strategy
Package Manager != Workspace Orchestrator
Package Manager != Application Runtime
Package Manager != Build System
Package Manager != CI Provider
Lockfile != Supply-Chain Security
Frozen Install != Dependency Approval
Audit Result != Package Safety
Cache Hit != Reproducibility Proof
Workspace Linking != Architecture Boundary Enforcement
```

The package manager controls dependency resolution/installation and workspace-aware commands. It does not own GymPulse domain boundaries, deployment topology, authorization, release approval, or application architecture.

## 5. Options Considered

### Option A — pnpm

Current official documentation provides:

- built-in workspace/monorepo support;
- a root `pnpm-workspace.yaml` workspace definition;
- explicit `workspace:` protocol for local package references;
- one shared workspace `pnpm-lock.yaml` by default;
- strict package access that exposes declared dependencies rather than arbitrary hoisted packages;
- frozen-lockfile behavior that fails when manifests and lockfile disagree;
- workspace filtering/recursive command support;
- current security-oriented settings for release-age controls, integrity behavior, dependency build scripts, and explicit build-script allow/deny controls.

Tradeoffs:

- it adds a package-manager tool beyond the npm client normally associated with Node installations;
- symlink/content-addressable-store semantics can expose assumptions in tools that expect a traditional fully-hoisted `node_modules`;
- exact pnpm configuration and compatible tool versions must be validated rather than copied from examples.

### Option B — npm

Current official documentation provides:

- native workspace support;
- `package-lock.json`;
- `npm ci` frozen-style installation that errors on manifest/lockfile mismatch and does not rewrite the lockfile;
- workspace-scoped command execution;
- multiple installation strategies, including a linked strategy useful for catching undeclared dependencies;
- vulnerability audit plus registry-signature/provenance verification capabilities.

Tradeoffs:

- default installation remains hoisted, so accidental undeclared dependency access needs deliberate prevention/validation;
- workspace ergonomics and dependency-graph controls are less specialized than pnpm's current workspace model for the proposed multi-package repository;
- security/audit capabilities still require explicit CI policy and do not make dependencies trusted automatically.

### Option C — Yarn

Current official documentation provides:

- workspaces and the `workspace:` protocol;
- immutable installs that fail if the lockfile would change, enabled by default in CI;
- focused workspace installs;
- constraints that can enforce dependency rules across workspaces;
- configurable linker approaches and current security features around audits, install scripts, age gates, and hardened-mode validation.

Tradeoffs:

- Plug'n'Play versus `node_modules` linker policy is an additional material compatibility choice;
- Yarn-specific constraints/configuration can increase tooling surface area;
- migration and developer onboarding must account for current Yarn configuration semantics rather than assuming Yarn Classic behavior.

### Option D — Bun package manager

Current official documentation provides:

- workspaces and workspace filtering;
- text `bun.lock`;
- frozen-lockfile / `bun ci` behavior;
- isolated installs for new workspaces that prevent phantom dependencies;
- explicit trusted-dependency handling for lifecycle scripts;
- migration support from common existing lockfiles.

Tradeoffs:

- the package-manager executable and installation semantics come from the Bun toolchain while GymPulse's application runtime decision remains separately governed;
- lifecycle-script, linker, and compatibility behavior differ from Node-oriented package managers and require additional validation across the proposed framework/database/test stack;
- adopting Bun as package manager must not be interpreted as adopting Bun as the application runtime.

## 6. Evaluation

| Criterion | pnpm | npm | Yarn | Bun |
|---|---|---|---|---|
| Workspace support | Built-in; dedicated workspace file; filters | Built-in `package.json` workspaces | Built-in; strong workspace commands | Built-in; filters |
| Explicit local package reference | `workspace:` supported | Workspace linking supported; no equivalent pnpm-only workspace guarantee syntax required | `workspace:` supported | `workspace:` supported |
| Single root lockfile | `pnpm-lock.yaml` | `package-lock.json` | `yarn.lock` | `bun.lock` |
| Frozen CI install | Strong; lockfile mismatch fails | Strong via `npm ci` | Strong via `--immutable` | Strong via `--frozen-lockfile` / `bun ci` |
| Default undeclared-dependency resistance | Strong strict linking model | Hoisted by default; linked strategy available | Depends on linker; PnP can be strict | Isolated by default for new workspaces |
| Workspace dependency-policy tooling | Strong filters + workspace settings | Adequate workspace flags | Strong, including constraints | Strong basic workspace/filter model |
| Lifecycle-script control | Explicit build-script controls available | Script controls available; policy required | Current defaults/config allow restrictive posture | Trusted-dependency model |
| Registry/audit/provenance tooling | Security settings plus registry ecosystem tooling | Strong npm-registry audit/signature/provenance integration | Audit + hardened/security controls | Integrity/trust controls; verify ecosystem needs |
| CI cache model | Cache/store can be keyed independently from correctness | npm cache | Yarn cache/Zero-Install options | Bun cache |
| Fit with proposed Node/TS monorepo | Strong, subject to runtime acceptance | Strong and conservative baseline | Strong but linker/config policy adds choices | Viable, with extra compatibility/toolchain validation |
| Turborepo dependency | None | None | None | None |
| Hosting-provider dependency | None | None | None | None |
| Migration cost from empty repository | Low | Low | Low-Medium | Low-Medium |
| Reversibility later | Good if manifests stay standards-based | Good | Good if Yarn-specific features are contained | Good if Bun-specific behavior is contained |

No matrix row by itself makes a tool accepted. The recommendation below is a proposed direction pending implementation evidence and explicit approval.

## 7. Proposed Decision

Propose `pnpm` as the Phase 1 GymPulse package manager, conditional on compatible acceptance of the repository and runtime decisions.

The proposed package-management contract is:

```text
standards-based package manifests
+
one committed root lockfile
+
workspace-aware installation
+
explicit local workspace dependency edges
+
frozen CI install
+
declared-dependency isolation
+
reviewed install/build scripts
+
package-manager version pinning
+
cache as performance optimization only
```

For the accepted monorepo strategy when implementation is later authorized:

1. use one root `pnpm-lock.yaml`;
2. define workspaces centrally with `pnpm-workspace.yaml`;
3. use `workspace:` references where an internal dependency must resolve to the local GymPulse workspace package;
4. keep every package's dependencies explicit;
5. use frozen/lockfile-respecting installation in CI and release builds;
6. pin the package-manager release through a repository-supported mechanism after compatibility validation;
7. treat lockfile changes as reviewable source changes;
8. avoid package-manager configuration that weakens package-boundary isolation merely to make an undeclared import work;
9. keep workspace/task orchestration optional and separately governed;
10. keep package scripts thin entry points into repository-owned build/test/migration commands rather than embedding architecture policy in one package manager.

This is a proposal, not acceptance. `pnpm` must not be installed or configured solely because this ADR exists.

## 8. Workspace and Dependency Model

Because `D-ARCH-001` is accepted, the selected package manager must support application/package boundaries such as Owner/Staff Web, Member Web, trusted API/runtime adapters, Background Worker, migrations/admin tooling, domain/application packages, contracts, and bounded test support.

Workspace dependency edges must be explicit.

Preferred rule:

```text
package A imports package B
=> package A declares package B
=> the workspace graph shows the edge
```

An import that succeeds only because another package happened to hoist a dependency is a defect.

`workspace:` references are especially useful for internal packages where resolving to a registry package with the same name/version would be unsafe or surprising.

The package manager does not replace architecture-boundary enforcement. Client-safe/server-only restrictions and allowed package dependency directions still need source/build/lint/test enforcement under the repository architecture.

## 9. Lockfile and Deterministic Installation

The lockfile is committed source material.

Rules:

- manifest and lockfile changes land together;
- CI/release installation must fail rather than silently rewrite an out-of-sync lockfile;
- local dependency-update commands may intentionally update the lockfile, but the diff must be reviewable;
- production/release builds use the same committed lockfile lineage as the reviewed source revision;
- package-manager version changes are explicit repository changes;
- caches may accelerate downloads/content stores but must not change the resolved dependency graph;
- a cold-cache install must remain supported and tested.

A frozen install proves manifest/lockfile consistency. It does not prove the dependencies are safe, approved, vulnerability-free, or semantically compatible.

## 10. Dependency Isolation and Package Boundaries

GymPulse should prefer installation semantics that make undeclared dependencies fail rather than work accidentally.

The chosen configuration must preserve:

```text
declared dependency
  -> resolvable

undeclared dependency
  -> not relied upon
```

Do not weaken strict dependency behavior to hide incorrect package manifests.

Peer dependency handling, optional/native packages, platform-specific packages, and framework bundlers must be validated against the accepted Node/framework/test stack before acceptance.

## 11. Supply-Chain and Install-Script Security

Dependency installation is code execution and supply-chain exposure.

Required posture:

- no registry token or credential committed to the repository;
- no production credential exposed to dependency install scripts;
- dependency lifecycle/build scripts are minimized and reviewed;
- where supported, prefer explicit allowlisting/restrictive policy for dependency build scripts after compatibility validation;
- use release-age/trust/integrity controls where they add measurable protection without making emergency patching impossible;
- dependency updates receive review and tests;
- high-risk abandoned or unnecessary dependencies are avoided;
- vulnerability/advisory scanning is part of the later CI security policy;
- registry signatures/provenance may strengthen evidence where supported but do not replace source/dependency review;
- automatic remediation that changes dependency graphs must still pass normal review/testing.

Exact vulnerability scanner, update bot, registry, provenance enforcement, and dependency-policy thresholds remain separate implementation decisions.

## 12. CI and Cache Integration

ADR-0017 owns when and how package-install evidence gates a release.

Package-manager requirements for CI are:

```text
checkout reviewed revision
-> select pinned package-manager release
-> restore compatible package-store/cache if available
-> frozen install
-> run required checks/builds
```

Cache keys should include at least the relevant lockfile identity and package-manager/toolchain compatibility inputs.

Do not use a stale `node_modules` cache as an authority for dependency correctness.

CI must be able to run from an empty workspace/cache. The cache is an optimization, not a prerequisite.

No GitHub Actions workflow or other CI configuration is created by this ADR.

## 13. Runtime, Framework, and Orchestrator Independence

### Package manager != Node acceptance

The current direction targets the accepted TypeScript/Node-compatible ecosystem under `D-ARCH-016`; the exact Node.js version remains separately selected.

### Package manager != Turborepo

`pnpm` workspaces can exist with or without Turborepo. Turborepo remains a separate candidate under repository/CI governance.

### Package manager != Next.js / Playwright / Drizzle

Compatibility with current leading framework/test/data candidates matters, but choosing pnpm does not accept those candidates.

### Package manager != hosting

Local and ordinary CI installs must not require Render, Vercel, Fly.io, Cloud Run, Supabase, or another production provider.

## 14. Developer Experience

The proposed baseline should provide a small predictable command surface:

```text
install
run workspace command
run filtered package command
add/remove dependency in one package
update dependency intentionally
inspect why a dependency exists
run frozen validation
```

Exact scripts are implementation details and are not created here.

Developer onboarding must document the pinned package-manager release and installation method once implementation is authorized.

The repository should avoid requiring developers to understand multiple active package managers at the same time.

## 15. Migration and Adoption Plan

After explicit acceptance and implementation authorization:

1. pin the approved package-manager release;
2. add the minimum workspace configuration;
3. create the initial lockfile from reviewed manifests;
4. validate a clean cold install;
5. validate frozen CI-style install;
6. validate workspace-local dependency resolution;
7. validate that a representative undeclared dependency fails;
8. validate current accepted application/test/build tools;
9. inventory packages requiring install/build scripts;
10. define reviewed script policy;
11. define dependency-update/security-check workflow;
12. measure clean and cached install behavior in representative CI;
13. document developer commands;
14. only then wire the package manager into CI/release workflows under ADR-0017.

This ADR does not perform any of these implementation steps.

## 16. Validation Before Acceptance

Acceptance should require evidence for at least:

1. clean install from an empty dependency cache;
2. repeat install resolves the same committed dependency graph;
3. frozen install fails on manifest/lockfile mismatch;
4. workspace package resolution uses the intended local package;
5. incompatible/missing local `workspace:` reference fails safely;
6. undeclared dependency cannot become an accidental production dependency;
7. representative Owner/Staff application install/build compatibility if that framework is accepted;
8. representative Member web install/build compatibility if browser-first delivery is accepted;
9. representative API/worker package compatibility;
10. representative migration/data-access package compatibility if accepted;
11. representative Vitest/Playwright/Testcontainers tooling compatibility if those tools are later accepted;
12. required native/binary package install behavior on supported CI/developer platforms;
13. dependency lifecycle/build-script inventory and reviewed policy;
14. no registry/production credentials appear in repository config or logs;
15. cache loss does not break correctness;
16. package-manager version pin is reproducible on ordinary CI;
17. dependency audit/integrity/provenance workflow is understood for the selected registry;
18. measured install time/storage/cache behavior is acceptable for Phase 1;
19. rollback/migration to a fallback manager is documented at a high level;
20. explicit decision-owner approval is recorded.

## 17. Reversibility

Package-manager choice is relatively reversible while GymPulse remains early and package manifests stay standards-based.

To preserve reversibility:

- avoid unnecessary package-manager-specific scripts;
- keep application architecture independent from package-manager APIs;
- isolate manager-specific workspace/config files;
- do not encode domain logic in package scripts;
- keep CI steps conceptually expressed as install/run/build/test rather than manager-specific architecture;
- do not retain two authoritative lockfiles.

A future migration should regenerate one authoritative lockfile under the replacement manager and validate the full repository rather than attempting to mechanically treat two lockfiles as equivalent.

## 18. Security and Privacy Impact

Positive effects of the proposed direction:

- deterministic reviewed lockfile lineage;
- stronger resistance to undeclared dependency leakage;
- explicit workspace package resolution;
- ability to restrict dependency build scripts;
- ordinary CI installs without production credentials;
- clear separation between cache performance and dependency correctness.

Residual risks:

- malicious or compromised packages can still execute through allowed scripts/runtime imports;
- typosquatting and maintainer compromise are not solved by a lockfile;
- lockfile review can be difficult for large transitive changes;
- registry compromise or poisoned metadata remains relevant;
- dependency scanners can miss unknown vulnerabilities;
- developer machines and CI runners remain trust boundaries.

No personal data is required for package installation. Production datasets must never be used to make dependency installation succeed.

## 19. Reliability and Maintainability Impact

A single package manager and one authoritative lockfile reduce environment drift and command ambiguity.

Strict workspace dependency declaration supports the package boundaries proposed by ADR-0003.

The main maintainability risk is overusing package-manager-specific features until migration becomes expensive. GymPulse therefore uses package-manager-specific capabilities where they materially improve deterministic workspaces/security, while keeping application manifests and architecture portable.

## 20. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Tooling incompatible with pnpm's linking model | Validate representative accepted framework/build/test tools before acceptance; use documented compatibility settings only where necessary |
| Lifecycle script supply-chain risk | Inventory scripts; minimize and explicitly allow/review required builds |
| Lockfile churn obscures review | Keep one root lockfile; isolate intentional dependency updates; require normal review |
| Developer package-manager drift | Pin the approved manager release and document onboarding |
| CI depends on warm cache | Require cold-cache install validation |
| Turborepo becomes coupled implicitly | Keep orchestration separately governed; pnpm commands must remain usable without Turborepo |
| Node runtime is accepted accidentally | Keep `D-ARCH-016` status independent and explicit |
| Audit tool creates false confidence | Treat audits/signatures/provenance as evidence, not complete trust |
| Manager-specific features reduce reversibility | Use them deliberately and keep standards-based manifests as the core dependency declaration |

## 21. Open Questions

Before acceptance/implementation:

1. Which exact package-manager release is pinned after compatibility validation?
2. Which developer/CI operating systems are officially supported?
3. Which dependencies require lifecycle/build scripts?
4. Which restrictive build-script policy can be enabled without breaking accepted tools?
5. Which registry-signature/provenance checks are practical for the selected registry?
6. Is a dependency update bot required in Phase 1?
7. What cache strategy will ADR-0017 use in CI?
8. Will repository orchestration remain package-manager-native initially or add Turborepo after a measured need?
9. Are any private packages/registries required in Phase 1?

None of these questions changes `D-ARCH-011` to `DECIDED`.

## 22. Decision Evidence

Research date: `2026-09-27`.

Repository evidence:

- `docs/00-overview/assumptions.md` keeps `D-ARCH-011` `P1 ASSUMED` and describes pnpm as a legacy working assumption, not accepted.
- `docs/02-architecture/technology-stack.md` records pnpm workspaces as the leading package-manager direction and requires deterministic installation, workspace linking, lockfile governance, CI efficiency, and consistent commands.
- `ADR-0003` requires workspace-capable package management but explicitly keeps pnpm and Turborepo unaccepted.
- `ADR-0017` requires lockfile-respecting/frozen dependency installation while keeping the package manager separately governed.
- legacy engineering/security documents recommend a lockfile, dependency review, frozen CI install, and pnpm examples; they remain evidence inputs only.

Current official documentation reviewed:

- pnpm Workspace: https://pnpm.io/workspaces
- pnpm install: https://pnpm.io/cli/install
- pnpm settings: https://pnpm.io/settings
- npm ci: https://docs.npmjs.com/cli/v11/commands/npm-ci/
- npm Workspaces: https://docs.npmjs.com/cli/v11/using-npm/workspaces/
- npm audit/signatures: https://docs.npmjs.com/cli/v11/commands/npm-audit/
- Yarn install: https://yarnpkg.com/cli/install
- Yarn Workspaces: https://yarnpkg.com/features/workspaces
- Yarn Constraints: https://yarnpkg.com/features/constraints
- Yarn Security: https://yarnpkg.com/features/security
- Bun install: https://bun.sh/docs/pm/cli/install
- Bun Workspaces: https://bun.sh/docs/pm/workspaces
- Bun isolated installs: https://bun.sh/docs/pm/isolated-installs
- Bun lockfile: https://bun.sh/docs/pm/lockfile

Observed documentation versions/capabilities are research evidence only. No exact package-manager version is pinned or accepted by this ADR.

## 23. Related Documents

- `../00-overview/assumptions.md`
- `../01-product/non-functional-requirements.md`
- `../02-architecture/architecture-principles.md`
- `../02-architecture/technology-stack.md`
- `README.md`
- `ADR-0002-primary-language-runtime.md`
- `ADR-0003-monorepo-strategy.md`
- `ADR-0012-owner-staff-web-framework.md`
- `ADR-0013-member-client-strategy.md`
- `ADR-0017-ci-cd-release-secrets.md`
- `ADR-0018-testing-toolchain.md`
- legacy migration source: `../12-security-audit.md`
- legacy migration source: `../15-engineering-workflow.md`
- legacy migration source: `../16-open-decisions.md`
