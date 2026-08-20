# Task 0009: Draft Phase 1 Architecture Style ADR

## Goal

Draft one Proposed Architecture Decision Record for GymPulse Phase 1 system decomposition under canonical decision `D-ARCH-005`.

Canonical target:

`docs/adr/ADR-0001-modular-monolith.md`

This task records a recommendation for review only. It does not accept the ADR, change `D-ARCH-005` to `DECIDED`, create implementation code, or draft the next foundation ADRs.

## Inputs Read

- `.ai/current-state.md`
- `.ai/task/0008-technology-decision-register-normalization.md`
- `docs/00-overview/assumptions.md`
- `docs/01-product/functional-requirements.md`
- `docs/01-product/non-functional-requirements.md`
- `docs/02-architecture/architecture-principles.md`
- `docs/02-architecture/architecture-overview.md`
- `docs/02-architecture/component-architecture.md`
- `docs/02-architecture/technology-stack.md`
- `docs/adr/README.md`

The existing container/data-flow architecture remains binding context through the referenced canonical architecture set. No new technology research was required because this task decides architecture style, not provider/framework capability.

## Findings

- `NFR-SCALABILITY-002` explicitly prefers a modular monolith or equivalent simple deployment model with domain boundaries before distributed services.
- `NFR-SCALABILITY-005` explicitly prohibits requiring microservices solely for hypothetical scale.
- `NFR-MAINTAINABILITY-001` requires core business rules not to be duplicated across member, staff, and background paths.
- `NFR-TESTABILITY-001` requires deterministic domain rules to be testable outside full UI execution.
- The component architecture already defines source-code/application boundaries and states that components are not mandatory processes or microservices.
- GymPulse Phase 1 includes correctness-sensitive flows where attendance, retention, renewal, payment, membership, audit, and notification responsibilities interact. Premature network separation would add distributed consistency/failure complexity before independent scaling/team/security evidence exists.
- An unstructured single application would be operationally simple but would violate current domain ownership, dependency-direction, testability, and provider-boundary expectations.
- `D-DATA-007` remains unresolved and is not decided by the architecture-style ADR.

## Decisions Encountered

Primary canonical decision:

```text
D-ARCH-005  P1 PROPOSED  Phase 1 system decomposition style
```

Related unresolved decisions remain unchanged, including:

```text
D-ARCH-016  primary language/runtime            P0 PROPOSED
D-ARCH-001  repository strategy                 P0 PROPOSED
D-ARCH-002  database engine                     P0 PROPOSED
D-ARCH-017  data-access/migrations               P1 PROPOSED
D-ARCH-003  API contract                         P0 PROPOSED
D-ARCH-006  API deployment topology             P1 OPEN
D-ARCH-007  background jobs                     P1 OPEN
D-ARCH-014  managed backend                     P0 OPEN
D-ARCH-015  authorization implementation        P0 PROPOSED
D-SEC-008   RLS/data-layer isolation            conditional P0 OPEN
D-ARCH-009  hosting                             P1 OPEN
D-ARCH-019  CI/CD + release/secrets             P1 OPEN
D-DATA-007  Member vs Membership ownership      P1 PROPOSED
```

No status changed to `DECIDED`.

## Options Evaluated

1. Modular monolith with explicit domain/component boundaries.
2. Service-per-domain / microservices from Phase 1.
3. Unstructured single application with weak internal boundaries.

The Proposed ADR recommends Option 1 while preserving deployment neutrality and future extraction criteria.

## Files Changed

Created:

- `docs/adr/ADR-0001-modular-monolith.md`
- `.ai/task/0009-draft-phase1-architecture-style-adr.md`

Continuity/index updates:

- `docs/adr/README.md`
- `docs/README.md`
- `.ai/current-state.md`

No product requirement, canonical decision status, technology/provider selection, schema/migration, API route, application scaffold, deployment configuration, or infrastructure was changed.

## Requirement IDs Affected

No requirement definition changed.

Primary traceability includes:

- `FR-AUTHZ-001..002`
- `FR-ATTENDANCE-003,006`
- `FR-RETENTION-005`
- `FR-RETURN-001`
- `FR-RENEWAL-004,006`
- `FR-PAYMENT-002,005..007`
- `FR-NOTIFICATION-002`
- `FR-AUDIT-001,003`
- `FR-CROSS-001..004`
- `NFR-SECURITY-001..003,009`
- `NFR-RELIABILITY-001..005`
- `NFR-AVAILABILITY-001,003`
- `NFR-SCALABILITY-002..005`
- `NFR-MAINTAINABILITY-001,003,005..006`
- `NFR-TESTABILITY-001,003..005`
- `NFR-OBSERVABILITY-001..007`
- `NFR-OPERATIONS-005`

## Result

`ADR-0001` now proposes a Phase 1 modular monolith with explicit domain/application/component boundaries.

The proposal preserves:

- domain write ownership,
- application orchestration,
- thin transport/worker adapters,
- transaction/idempotency semantics,
- provider abstraction,
- tenant/capability authorization,
- background rule reuse,
- deployment neutrality,
- future service extraction through evidence-backed ADRs.

It explicitly rejects premature service-per-domain decomposition and an unstructured monolith as current recommendations.

The ADR remains `Proposed` because no authorized decision-owner approval evidence exists.

## Next Recommended Task

Task `0010-draft-primary-language-runtime-adr`.

Create only:

`docs/adr/ADR-0002-primary-language-runtime.md`

Primary canonical decision:

`D-ARCH-016`

Initial ADR status:

`Proposed`

Required comparison should include the current TypeScript + supported Node.js LTS direction and credible alternatives, while separating language/runtime choice from Next.js, repository, database, hosting, and provider decisions.

Do not draft the repository or database ADR in the same bounded task.
