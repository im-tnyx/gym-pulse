# Task 0008: Technology Decision Register Gap Normalization

## Goal

Normalize the material technology-governance gaps identified by Task 0007 into the canonical GymPulse decision register, reconcile ADR ordering/dependencies with the completed technology evaluation, and prepare the first ADR drafting task without accepting any technology or creating implementation code.

Canonical targets:

- `docs/00-overview/assumptions.md`
- `docs/adr/README.md`

Working-context/continuity targets:

- `.ai/task/0008-technology-decision-register-normalization.md`
- `.ai/current-state.md`
- `docs/README.md`

## Inputs Read

- `.ai/README.md`
- `.ai/current-state.md`
- `.ai/task/0007-technology-stack.md`
- `docs/README.md`
- `docs/00-overview/assumptions.md`
- `docs/02-architecture/technology-stack.md`
- `docs/adr/README.md`

Task 0007 already evaluated current ecosystem/provider capabilities. Task 0008 does not repeat provider research because its scope is canonical governance normalization rather than technology re-evaluation.

## Findings

- Task 0007 identified four material technology areas with no canonical decision IDs: primary language/runtime, data-access/query/migration tooling, core testing toolchain, and CI/CD + production release/secrets tooling.
- The current decision families already support these topics without introducing a new namespace. They fit under `D-ARCH` because each choice materially affects cross-cutting implementation, reliability, security, release, or deployment behavior.
- The primary language/runtime choice is P0 because it shapes web/API/jobs/provider/test/deployment code and is expensive to reverse after implementation begins.
- Data-access/migration and core testing tooling are P1 because they materially affect correctness evidence, migration safety, transaction/RLS behavior, and implementation workflow.
- CI/CD + production release/secrets tooling is P1 but remains OPEN because final platform binding depends on runtime/hosting/security choices even though required release capabilities are already clear.
- The ADR backlog was stale after the technology evaluation: it did not include the newly identified cross-cutting decisions and still described the pre-C4 foundation gate as the next work item.
- No technology evaluation result provides acceptance evidence. Canonical IDs can be created without changing any candidate to `DECIDED`.

## Decisions Encountered

No existing canonical decision was promoted to `DECIDED` and no ADR was accepted.

New canonical decision entries registered:

```text
D-ARCH-016  P0 PROPOSED  Primary implementation language/runtime
D-ARCH-017  P1 PROPOSED  Data-access/query/migration strategy
D-ARCH-018  P1 PROPOSED  Core automated testing toolchain
D-ARCH-019  P1 OPEN      CI/CD + production release/secrets tooling
```

Current candidate directions remain non-authoritative:

- `D-ARCH-016`: strict TypeScript + supported Node.js LTS,
- `D-ARCH-017`: SQL-aware typed access with committed migrations and raw-SQL escape hatch; Drizzle/Kysely leading candidates, Prisma credible alternative,
- `D-ARCH-018`: TS-native unit/application tests + real PostgreSQL integration + Playwright-style browser E2E,
- `D-ARCH-019`: capability-first release pipeline with GitHub-native CI as a leading candidate, final tooling still Open.

## Technology Areas Evaluated

Task 0008 did not perform a new technology comparison. It normalized governance for four Task 0007 evaluation areas:

1. primary implementation language/runtime,
2. persistence/data-access/query/migration tooling,
3. core automated testing toolchain,
4. CI/CD, production release gates, and secrets-management tooling.

## Files Changed

Updated canonical governance:

- `docs/00-overview/assumptions.md`
- `docs/adr/README.md`

Created working-context task record:

- `.ai/task/0008-technology-decision-register-normalization.md`

Continuity/index updates:

- `.ai/current-state.md`
- `docs/README.md`

No application code, package scaffold, schema/migration, API route, provider account, deployment configuration, production infrastructure, product requirement, or ADR acceptance was created.

## Requirement IDs Affected

No FR/NFR definition changed.

The new decision entries trace existing requirements already used by the technology evaluation, especially:

- `NFR-MAINTAINABILITY-*`
- `NFR-TESTABILITY-*`
- `NFR-SCALABILITY-*`
- `NFR-RELIABILITY-*`
- `NFR-OPERATIONS-*`
- `NFR-SECURITY-*`
- `FR-CROSS-*`

Exact ADRs must reference only the specific requirement IDs relevant to each decision when drafted.

## Decision Register Gaps

The four material Task 0007 gaps are now normalized and no longer lack canonical IDs.

No additional decision IDs were invented for lower-impact choices such as formatter, lint rules, runtime-validation library, UI component library, or exact dependency versions.

Potential future governance gaps should be created only when repository evidence shows that a choice is materially cross-cutting, expensive to reverse, or security/reliability relevant.

## ADR Readiness

The ADR backlog is now dependency-aware after technology evaluation.

First foundation group:

```text
D-ARCH-005  Phase 1 architecture style
D-ARCH-016  Primary implementation language/runtime
D-ARCH-001  Repository/workspace strategy
D-ARCH-002  Canonical database engine
```

These are separate decisions and should be drafted/reviewed independently.

The exact next bounded task is intentionally only the first ADR:

```text
D-ARCH-005
Phase 1 architecture style
```

Suggested target:

`docs/adr/ADR-0001-modular-monolith.md`

It must remain `Proposed` unless explicit decision-owner approval evidence is later provided.

## Result

Technology decision-register normalization is complete.

The canonical register now has stable IDs for all four material technology gaps identified in Task 0007, and the ADR governance/index now reflects the post-C4/post-technology-evaluation dependency order.

No technology, framework, provider, database, job runner, testing tool, CI provider, or runtime became accepted because of this task.

GymPulse remains gated from authoritative production scaffolding by unresolved P0/P1 architecture, security, provider, data-model, and pilot decisions.

## Next Recommended Task

Task `0009-draft-phase1-architecture-style-adr`.

Create only:

`docs/adr/ADR-0001-modular-monolith.md`

Primary canonical decision:

`D-ARCH-005`

Initial ADR status:

`Proposed`

Required comparison:

- modular monolith with explicit domain/component boundaries,
- premature service-per-domain/microservices,
- unstructured single application with weak internal boundaries.

The ADR must preserve the established C4/container/component/data-flow architecture, reference actual FR/NFR drivers, document tradeoffs/reversibility/operations/security/testing, and contain no acceptance claim without explicit approval evidence.

Do not draft `D-ARCH-016`, `D-ARCH-001`, or `D-ARCH-002` ADRs in the same bounded task.
