# Task 0010: Draft Primary Language and Runtime ADR

## Goal

Draft one Proposed Architecture Decision Record for GymPulse primary implementation language and trusted server runtime under canonical decision `D-ARCH-016`.

Canonical target:

`docs/adr/ADR-0002-primary-language-runtime.md`

This task records a recommendation for review only. It does not accept the ADR, change `D-ARCH-016` to `DECIDED`, create implementation code, or draft repository/database ADRs.

## Inputs Read

- `.ai/current-state.md`
- `.ai/task/0008-technology-decision-register-normalization.md`
- `.ai/task/0009-draft-phase1-architecture-style-adr.md`
- `docs/00-overview/assumptions.md`
- `docs/01-product/functional-requirements.md`
- `docs/01-product/non-functional-requirements.md`
- `docs/02-architecture/architecture-principles.md`
- `docs/02-architecture/architecture-overview.md`
- `docs/02-architecture/component-architecture.md`
- `docs/02-architecture/technology-stack.md`
- `docs/adr/README.md`
- `docs/adr/ADR-0001-modular-monolith.md`

Task 0007 already checked current official TypeScript and Node.js ecosystem documentation on `2026-08-20`. This task uses that technology evaluation as current capability evidence and does not repeat provider/framework research.

## Findings

- `D-ARCH-016` is the canonical P0 Proposed decision for the primary language/runtime.
- Strict TypeScript + a supported Node.js LTS line remains the strongest current fit for GymPulse's Phase 1 workload and proposed client ecosystem.
- The architecture remains framework-independent: choosing TypeScript/Node.js does not choose Next.js, Expo/React Native, monorepo tooling, PostgreSQL, an ORM/query builder, API topology, job runner, hosting, CI, or any provider.
- Static types cannot replace runtime validation, transactions, constraints, provider verification, idempotency, or authorization.
- Shared language creates a specific security risk: client code must never import server-only database/provider/secrets/configuration code.
- JVM, Go, and Python are all credible server alternatives. The repository currently contains no hard runtime, benchmark, compliance, deployment, or team-capability evidence that outweighs the operational/tooling simplicity of the TypeScript/Node.js direction.
- Untyped JavaScript on Node.js conflicts with the current typed-contract and maintainability direction without providing a clear architecture benefit.
- `ADR-0001` remains Proposed and no architecture-style acceptance is implied by this task.

## Decisions Encountered

Primary canonical decision:

```text
D-ARCH-016  P0 PROPOSED  Primary implementation language/runtime
```

Related decisions remain unchanged, including:

```text
D-ARCH-005  architecture style                P1 PROPOSED / ADR-0001 Proposed
D-ARCH-001  repository/workspace strategy     P0 PROPOSED
D-ARCH-003  API contract architecture         P0 PROPOSED
D-ARCH-006  API deployment topology           P1 OPEN
D-ARCH-007  background jobs                   P1 OPEN
D-ARCH-012  Owner/Staff web framework         P0 PROPOSED
D-ARCH-013  member delivery/framework         P1 PROPOSED
D-ARCH-017  data-access/query/migrations       P1 PROPOSED
D-ARCH-018  core testing toolchain            P1 PROPOSED
D-ARCH-019  CI/CD + release/secrets           P1 OPEN
```

No status changed to `DECIDED`.

## Options Evaluated

1. Strict TypeScript + supported Node.js LTS.
2. Java/Kotlin JVM server + TypeScript clients.
3. Go server + TypeScript clients.
4. Python server + TypeScript clients.
5. JavaScript + Node.js without strict TypeScript as the primary baseline.

The Proposed ADR recommends Option 1 while preserving runtime validation, server-only source boundaries, framework independence, deployment neutrality, and future specialized-runtime extraction through a later ADR.

## Files Changed

Created:

- `docs/adr/ADR-0002-primary-language-runtime.md`
- `.ai/task/0010-draft-primary-language-runtime-adr.md`

Continuity/index updates required by this task:

- `docs/adr/README.md`
- `docs/README.md`
- `.ai/current-state.md`

No product requirement, canonical decision status, framework/provider selection, repository scaffold, schema/migration, API route, deployment configuration, or infrastructure was changed.

## Requirement IDs Affected

No requirement definition changed.

Primary traceability includes:

- `FR-CROSS-001..004`
- `FR-AUTHZ-001..002`
- `FR-ATTENDANCE-003,006`
- `FR-PAYMENT-002,005..007`
- `FR-NOTIFICATION-002`
- `NFR-SECURITY-003..004,008,011`
- `NFR-RELIABILITY-001..006`
- `NFR-AVAILABILITY-001..003`
- `NFR-PERFORMANCE-005`
- `NFR-SCALABILITY-003..004`
- `NFR-MAINTAINABILITY-001..003,005..006`
- `NFR-TESTABILITY-001..005`
- `NFR-OBSERVABILITY-001..007`
- `NFR-OPERATIONS-001..004`

## Result

`ADR-0002` now proposes strict TypeScript as the primary implementation language and a supported Node.js LTS line as the primary trusted server runtime.

The proposal explicitly preserves:

- runtime validation at trust boundaries,
- domain/application independence from frameworks and SDKs,
- server-only secret/database/provider boundaries,
- transaction/idempotency correctness outside the type system,
- stateless horizontal evolution,
- deployment neutrality,
- ability to extract a future service into another runtime when measured evidence justifies it.

The ADR remains `Proposed` because no authorized decision-owner approval evidence exists.

## Next Recommended Task

Task `0011-draft-repository-workspace-adr`.

Create only:

`docs/adr/ADR-0003-monorepo-strategy.md`

Primary canonical decision:

`D-ARCH-001`

Initial ADR status:

`Proposed`

Required comparison should include an explicit monorepo with app/package boundaries, multiple repositories per deployable/application, and a single repository without deliberate reusable package boundaries. Runtime deployment must remain a separate concern under `D-ARCH-006`.

Do not draft the database ADR in the same bounded task.
