# Task 0011: Draft Repository / Workspace Architecture Decision Record

## Goal

Draft one Proposed ADR for GymPulse repository/workspace architecture under canonical decision `D-ARCH-001`, without accepting the decision or creating implementation scaffolding.

Canonical target:

`docs/adr/ADR-0003-monorepo-strategy.md`

## Inputs Read

Canonical/current inputs:

- `.ai/README.md`
- `.ai/current-state.md`
- `.ai/task/0009-draft-phase1-architecture-style-adr.md`
- `.ai/task/0010-draft-primary-language-runtime-adr.md`
- `docs/README.md`
- `docs/00-overview/assumptions.md`
- `docs/01-product/functional-requirements.md`
- `docs/01-product/non-functional-requirements.md`
- `docs/02-architecture/architecture-principles.md`
- `docs/02-architecture/architecture-overview.md`
- `docs/02-architecture/container-architecture.md`
- `docs/02-architecture/component-architecture.md`
- `docs/02-architecture/data-flow.md`
- `docs/02-architecture/technology-stack.md`
- `docs/adr/README.md`
- `docs/adr/ADR-0001-modular-monolith.md`
- `docs/adr/ADR-0002-primary-language-runtime.md`

Legacy migration files were not required to resolve this task because the canonical structured documentation and technology evaluation already contained the current repository/workspace evidence. They remain migration evidence only.

## Repository State Verified

Before creation:

- `docs/adr/ADR-0003-monorepo-strategy.md` did not exist on latest `main`.
- `D-ARCH-001` was `P0 PROPOSED` with an explicit monorepo as the leading recommendation.
- `ADR-0001` remained `Proposed` for `D-ARCH-005`.
- `ADR-0002` remained `Proposed` for `D-ARCH-016`.
- `D-ARCH-006` API deployment topology remained `OPEN`.
- `D-ARCH-011` package manager remained `ASSUMED` with pnpm only as a candidate.
- `D-ARCH-002` database engine remained `PROPOSED`.
- `D-ARCH-017` data-access/migration tooling remained `PROPOSED`.
- `D-ARCH-018` testing toolchain remained `PROPOSED`.
- `D-ARCH-019` CI/CD + production release tooling remained `OPEN`.

The actual repository state matched the bounded Task 0011 instruction, so no alternate next action was required.

## Findings

- GymPulse correctness-sensitive changes frequently span business rules, application orchestration, contracts, persistence changes, workers, authorization, tests, and documentation.
- A single versioned repository provides material value only if it has deliberate application/package boundaries. One Git repository without dependency governance is not equivalent to a well-structured monorepo.
- Repository topology and deployment topology must remain independent. Owner/Staff Web, Member Client, Trusted API, Background Worker, and migration/admin tooling may be independently buildable/deployable from one repository.
- `D-ARCH-006` must remain open because repository organization cannot decide whether API transport is co-hosted with a web runtime or independently deployed.
- Logical domains must not automatically become packages. `Domain != Package`, and package extraction requires an explicit ownership/reuse/security/build reason.
- Client-safe/server-only separation is a release-critical security concern in a shared repository. Client build graphs must not reach database, migration, provider-secret, service-role, admin, or privileged configuration modules.
- Co-versioning helps reduce version skew for attendance duplicate protection, payment exactly-once effects, membership entitlement, no-show/renewal behavior, tenant authorization, notification deduplication, and gym-local time changes.
- Multiple repositories remain a credible future option when team, release, regulatory, source-access, or business boundaries become truly independent.
- Package manager, task orchestrator, database, data-access library, test framework, CI provider, web framework, hosting, and provider selections remain separate decisions.

## Decisions Encountered

Primary decision:

```text
D-ARCH-001  P0 PROPOSED  Repository strategy and package boundaries
```

Related decisions preserved unchanged:

```text
D-ARCH-005  architecture style                    P1 PROPOSED / ADR-0001 Proposed
D-ARCH-016  primary language/runtime             P0 PROPOSED / ADR-0002 Proposed
D-ARCH-006  API deployment topology              P1 OPEN
D-ARCH-011  package manager                      P1 ASSUMED
D-ARCH-002  database engine                      P0 PROPOSED
D-ARCH-017  data access/migrations               P1 PROPOSED
D-ARCH-018  testing toolchain                    P1 PROPOSED
D-ARCH-019  CI/CD + release tooling              P1 OPEN
D-ARCH-012  Owner/Staff web framework            P0 PROPOSED
D-ARCH-013  member client strategy               P1 PROPOSED
D-ARCH-007  background jobs                      P1 OPEN
D-ARCH-015  authorization implementation         P0 PROPOSED
D-SEC-008   RLS/data-layer isolation             conditional P0 OPEN
```

No canonical decision changed to `DECIDED`.

## Options Evaluated

1. Explicit monorepo with deliberate application/package boundaries.
2. Multiple repositories by application/deployable.
3. One repository without deliberate reusable package/module boundaries.

## Proposed Direction

`ADR-0003` proposes Option 1: one explicit GymPulse monorepo with deliberate application/package boundaries and independently buildable/deployable artifacts.

The recommendation is based on GymPulse-specific need to coordinate correctness-sensitive changes across request paths, background paths, contracts, persistence changes, authorization, tests, and Docs-as-Code.

It does not accept a package manager or task orchestrator and does not equate monorepo with Turborepo.

## Boundary Rules

Key rules recorded in ADR-0003:

```text
Repository topology != Deployment topology
Domain != Package
Package != Application
Application != Service
Service != Repository
Repository != Deployment
```

Default dependency direction:

```text
UI / Transport
    -> Application
    -> Domain

Infrastructure adapters implement inward-facing ports.
```

Client-safe code must never import privileged server-only infrastructure.

Package/export classifications:

```text
Client-safe
Server-only
Build/tooling-only
Documentation-only
```

Conceptual package categories were documented for domain, application, contracts, validation, authorization, database, payments, notifications, jobs, observability, config, UI, testing support, tooling, and documentation. The ADR explicitly states these are categories only and must not be pre-created automatically.

## Files Changed

Created:

- `docs/adr/ADR-0003-monorepo-strategy.md`
- `.ai/task/0011-draft-repository-workspace-adr.md`

Allowed continuity/index updates for this task:

- `docs/adr/README.md`
- `docs/README.md`
- `.ai/current-state.md`

No other canonical file required modification because no new contradiction was discovered.

## Requirement IDs Referenced

No requirement definition changed.

Primary NFR traceability:

- `NFR-SECURITY-001,003,004,011`
- `NFR-RELIABILITY-001..005`
- `NFR-SCALABILITY-002..005`
- `NFR-MAINTAINABILITY-001..006`
- `NFR-TESTABILITY-001..005`
- `NFR-OPERATIONS-001..004`

Functional correctness examples:

- `FR-AUTHZ-001..002`
- `FR-ATTENDANCE-003,006`
- `FR-RETENTION-005`
- `FR-RENEWAL-006`
- `FR-PAYMENT-002,005..007`
- `FR-NOTIFICATION-002`
- `FR-CROSS-001..004`

## Open Questions

- Who is the authorized decision owner for `D-ARCH-001`?
- Which package manager will ultimately be approved under `D-ARCH-011`?
- Is workspace-native task execution sufficient initially, or is a task orchestrator justified by measured build/test needs?
- Which conceptual package categories justify extraction at initial scaffold time?
- Which structural mechanism will enforce client-safe/server-only and dependency-direction rules?
- How will future CI implement affected builds and independent deployment artifacts under `D-ARCH-019`?
- What exact application entry points follow from later web/member/API deployment decisions?
- What repository-scale/team/security threshold should trigger a repository-split review?

## Result

`ADR-0003` now exists as a `Proposed` repository/workspace recommendation for `D-ARCH-001`.

The ADR recommends an explicit monorepo because it reduces accidental version skew in GymPulse correctness-sensitive cross-cutting changes while preserving application/package boundaries, client/server security separation, independent build/deployment artifacts, and future repository splitting.

It does not create `apps/`, `packages/`, package manifests, workspace configuration, build orchestration, CI workflows, migrations, application code, or deployment configuration.

`D-ARCH-001` remains `PROPOSED` because no authorized approval evidence exists.

## Next Recommended Task

After synchronization, re-check the canonical ADR queue, assumptions register, and current state. If unchanged, the expected next bounded task is the canonical database-engine ADR for `D-ARCH-002`, likely Task `0012-draft-canonical-database-engine-adr` targeting `docs/adr/ADR-0004-database-engine.md`.

Do not create ADR-0004 in Task 0011.
