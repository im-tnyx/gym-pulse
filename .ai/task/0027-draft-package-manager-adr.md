# Task 0027: Draft Package Manager ADR

## Goal

Draft one `Proposed` ADR for `D-ARCH-011` defining the GymPulse package-manager/workspace-installation baseline without installing a package manager, creating workspace configuration, creating a lockfile, or changing canonical decision status to `DECIDED`.

Target:

`docs/adr/ADR-0019-package-manager.md`

## Inputs Read

Fresh latest-`main` governance/repository inputs included:

- `.ai/README.md`
- `.ai/current-state.md`
- `.ai/task/0026-draft-testing-toolchain-adr.md`
- `docs/README.md`
- `docs/00-overview/assumptions.md`
- `docs/01-product/non-functional-requirements.md`
- `docs/02-architecture/architecture-principles.md`
- `docs/02-architecture/technology-stack.md`
- `docs/adr/README.md`
- `docs/adr/ADR-0002-primary-language-runtime.md`
- `docs/adr/ADR-0003-monorepo-strategy.md`
- `docs/adr/ADR-0017-ci-cd-release-secrets.md`
- `docs/adr/ADR-0018-testing-toolchain.md`

Legacy migration/evidence inputs:

- `docs/12-security-audit.md`
- `docs/15-engineering-workflow.md`
- `docs/16-open-decisions.md`

Canonical structured documentation controls over legacy examples/recommendations.

## Repository State Verified

At task start:

- latest `main` commit was `ae15fbedc04378bdd872584402d53d8745988426`;
- Task 0026 and `ADR-0018` already existed and were complete at documentation level;
- `docs/adr/ADR-0019-package-manager.md` did not exist;
- `.ai/task/0027-draft-package-manager-adr.md` did not exist;
- `D-ARCH-011` remained `P1 ASSUMED`;
- the repository still described pnpm as a working assumption/leading candidate, not an accepted choice;
- no package-manager approval evidence was found;
- no accepted ADR existed;
- no current package-manager lockfile/workspace configuration was treated as decision evidence.

Task 0027 was therefore the actual next bounded governance task.

## Canonical Decision State

```text
D-ARCH-011
Priority: P1
Status: ASSUMED
Decision: Package manager for a future workspace/monorepo
Legacy/current working assumption: pnpm
Acceptance: none
```

`ADR-0019` is `Proposed`. Creating it does not convert `D-ARCH-011` to `DECIDED`.

## Decision Drivers

The evaluation focused on:

- deterministic dependency installation;
- one authoritative lockfile;
- workspace support;
- explicit internal package relationships;
- undeclared/phantom dependency resistance;
- frozen CI behavior;
- cache correctness;
- dependency lifecycle-script risk;
- dependency/security review;
- compatibility with the proposed TypeScript/Node ecosystem;
- independence from Turborepo/CI/hosting/framework decisions;
- developer ergonomics;
- migration cost and reversibility.

## Options Evaluated

Compared:

1. `pnpm`
2. `npm`
3. `Yarn`
4. `Bun` package manager

No option is accepted by this task.

## Current Official Research

Fresh first-party documentation reviewed on `2026-09-27`:

### pnpm

- built-in workspace support;
- `pnpm-workspace.yaml`;
- `workspace:` protocol;
- one shared workspace lockfile by default;
- strict declared-dependency access under its workspace linking model;
- frozen-lockfile CI behavior;
- current security/build-script configuration capabilities.

Sources:

- https://pnpm.io/workspaces
- https://pnpm.io/cli/install
- https://pnpm.io/settings

### npm

- standard workspaces;
- `package-lock.json`;
- `npm ci` frozen install behavior;
- workspace command filtering;
- alternative linked installation strategy;
- audit, registry-signature, and provenance verification support.

Sources:

- https://docs.npmjs.com/cli/v11/commands/npm-ci/
- https://docs.npmjs.com/cli/v11/using-npm/workspaces/
- https://docs.npmjs.com/cli/v11/commands/npm-audit/

### Yarn

- workspaces and `workspace:` protocol;
- immutable CI installs;
- focused workspace installs;
- constraints for dependency policy;
- current audit/install-script/age-gate/hardened-mode controls.

Sources:

- https://yarnpkg.com/cli/install
- https://yarnpkg.com/features/workspaces
- https://yarnpkg.com/features/constraints
- https://yarnpkg.com/features/security

### Bun

- workspaces and filters;
- `bun.lock`;
- frozen install / `bun ci`;
- isolated installs for new workspaces;
- trusted dependency lifecycle-script model;
- lockfile migration support.

Sources:

- https://bun.sh/docs/pm/cli/install
- https://bun.sh/docs/pm/workspaces
- https://bun.sh/docs/pm/isolated-installs
- https://bun.sh/docs/pm/lockfile

No version observed during research is an accepted pin.

## Evaluation Summary

`pnpm` is the leading proposal for GymPulse because its current workspace model directly supports the proposed repository architecture:

```text
explicit workspace graph
+
single root lockfile
+
local-only workspace dependency protocol
+
strict declared-dependency linking
+
frozen CI installs
+
workspace filtering
```

`npm` remains the strongest conservative fallback because it provides standard workspaces, `npm ci`, and direct Node ecosystem alignment.

`Yarn` remains credible, especially where constraints or alternative linker models are valuable, but its linker/config policy adds another decision surface.

`Bun` remains credible as a package manager but requires extra compatibility validation because its executable, linker, lifecycle-script, and toolchain semantics differ while GymPulse's application runtime remains separately governed.

## Proposed Direction

Propose:

```text
pnpm
+
one committed root pnpm-lock.yaml
+
pnpm workspace definition
+
workspace: for intentional local package edges
+
frozen CI install
+
package-manager version pinning
+
strict declared dependency posture
+
reviewed/restricted dependency build scripts
```

This direction remains unaccepted.

No `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `package.json`, `.npmrc`, `.yarnrc.yml`, `bunfig.toml`, or dependency installation is created by Task 0027.

## Workspace / Dependency Posture

- Workspace package dependencies are explicit.
- Undeclared imports are defects, not convenience.
- `workspace:` is preferred where an internal dependency must resolve to the local package.
- Package-manager linking does not replace architecture-boundary enforcement.
- A single shared mutable "everything package" is still rejected by ADR-0003 boundaries.

## Lockfile / CI Posture

- exactly one authoritative package-manager lockfile;
- lockfile committed and reviewed;
- manifest + lockfile change together;
- CI/release install fails instead of rewriting a stale lockfile;
- package-manager release is pinned when implementation is authorized;
- cold-cache install remains a supported validation path;
- cache is performance only, not correctness.

ADR-0017 still owns the actual CI/release gate implementation.

## Supply-Chain / Security Posture

- registry credentials never committed;
- production credentials are unavailable to dependency installs;
- dependency lifecycle/build scripts are reviewed and minimized;
- prefer restrictive/allowlisted script behavior where accepted tool compatibility permits;
- dependency advisories, signatures/provenance, and integrity controls are evidence, not complete trust;
- automated dependency changes remain subject to review/tests.

No scanner, registry, update bot, or provenance enforcement product is selected.

## Runtime / Orchestrator Separation

Kept separate:

```text
D-ARCH-016 Node/TypeScript runtime
D-ARCH-001 repository/monorepo strategy
Turborepo/workspace task orchestration
D-ARCH-019 CI/CD provider
D-ARCH-012 Owner/Staff framework
D-ARCH-013 Member client strategy
D-ARCH-018 testing tools
D-ARCH-009 hosting
```

Choosing pnpm in a future acceptance must not silently decide any of these.

## Validation Required

Before acceptance:

1. clean cold install;
2. deterministic repeat install;
3. frozen mismatch failure;
4. correct local workspace resolution;
5. missing/incompatible local workspace failure;
6. undeclared-dependency negative proof;
7. accepted web/API/worker build compatibility;
8. accepted test/data tooling compatibility;
9. native/binary dependency compatibility on supported environments;
10. install/build-script inventory;
11. reviewed restrictive script policy;
12. no registry/production credential leakage;
13. cache-loss correctness;
14. package-manager version pin reproducibility;
15. dependency audit/integrity/provenance behavior;
16. representative CI install/runtime measurement;
17. documented fallback/migration path;
18. explicit decision-owner approval.

## Requirement IDs Referenced

- `NFR-MAINTAINABILITY-001`
- `NFR-MAINTAINABILITY-002`
- `NFR-MAINTAINABILITY-005`
- `NFR-MAINTAINABILITY-006`
- `NFR-SECURITY-004`
- `NFR-OPERATIONS-001`
- `NFR-OPERATIONS-002`
- `NFR-TESTABILITY-001..005`

## Files Changed

Created:

- `docs/adr/ADR-0019-package-manager.md`
- `.ai/task/0027-draft-package-manager-adr.md`

Governance continuity updates:

- `docs/adr/README.md`
- `docs/README.md`
- `.ai/current-state.md`

No canonical requirement or architecture source required contradiction correction.

## Open Questions

- exact pnpm release to pin after validation;
- supported developer/CI OS matrix;
- dependencies requiring install/build scripts;
- exact restrictive build-script policy;
- dependency-update automation;
- registry/provenance policy;
- CI cache implementation;
- whether/when Turborepo becomes justified.

## Result

Task 0027 drafts the package-manager decision without implementing it.

Expected state after synchronization:

```text
ADR-0019 = Proposed
D-ARCH-011 = P1 ASSUMED
pnpm = leading proposal only
No package manager installed
No lockfile created
No workspace config created
No dependency installed
No CI workflow created
No prior ADR accepted
```

## Next Recommended Task

After Task 0027 synchronization, the ordered ADR backlog points to:

```text
Task 0028: Draft Observability Provider ADR
Primary decision: D-PROVIDER-006
Likely target: docs/adr/ADR-0020-observability-provider.md
Canonical status: P1 OPEN
```

The target filename/number follows the current monotonic ADR sequence and was verified not to exist at Task 0027 time.

Do not execute Task 0028 as part of Task 0027.
