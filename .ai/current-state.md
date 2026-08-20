# GymPulse Current State

## Project

`GymPulse` (`im-tnyx/gym-pulse`)

## Current Documentation Phase

`Phase 4 - System Architecture / Architecture Governance`

## Canonical Architecture Completed at Draft Level

```text
docs/02-architecture/architecture-principles.md
docs/02-architecture/architecture-overview.md
docs/02-architecture/system-context.md
docs/02-architecture/container-architecture.md
docs/02-architecture/component-architecture.md
docs/02-architecture/data-flow.md
docs/02-architecture/technology-stack.md
docs/adr/README.md
```

## Current ADR State

```text
ADR-0001-modular-monolith.md
Primary decision: D-ARCH-005
ADR status: Proposed
Canonical decision status: PROPOSED
Accepted: No
```

`ADR-0001` proposes a Phase 1 modular monolith with explicit domain/application/component boundaries. It compares:

```text
A. Modular monolith with explicit boundaries
B. Service-per-domain / microservices from Phase 1
C. Unstructured single application with weak boundaries
```

The proposal preserves:

- domain write ownership,
- application command/query orchestration,
- tenant/resource/capability authorization,
- local correctness-sensitive transaction boundaries,
- request/job/provider/business-effect idempotency separation,
- provider ports/adapters,
- background handlers reusing application/domain rules,
- deployment neutrality,
- future service extraction only after evidence and a later Accepted ADR.

No decision-owner approval evidence exists, so `D-ARCH-005` remains `PROPOSED` and ADR-0001 remains `Proposed`.

## Important Architecture Boundaries

- Phase 1 is gym operations/retention, not a generic fitness super-app.
- Clients are untrusted for canonical business truth.
- Authentication and GymPulse authorization are separate responsibilities.
- Protected operations require principal + tenant/resource scope + named capability.
- Application handlers own cross-domain orchestration; domain modules own canonical state transitions.
- Arbitrary cross-domain direct writes are not an approved pattern.
- Background execution reuses the same application/domain rules as interactive flows.
- Payment provider evidence must be verified before canonical payment mutation.
- Membership/add-on payment effects are protected exactly once.
- External provider calls do not participate in local database transactions.
- Gym-local timezone controls business calendar logic; event timestamps remain UTC.
- Read models, telemetry, analytics, and data-quality views are non-authoritative for writes.
- `D-DATA-007` remains unresolved and still blocks final Member/Membership state-machine/schema semantics.

## Technology Governance State

Task 0008 registered:

```text
D-ARCH-016  P0 PROPOSED  Primary implementation language/runtime
D-ARCH-017  P1 PROPOSED  Data-access/query/migration strategy
D-ARCH-018  P1 PROPOSED  Core automated testing toolchain
D-ARCH-019  P1 OPEN      CI/CD + production release/secrets tooling
```

Key unresolved P0/P1 decisions still include:

```text
D-ARCH-001  repository strategy                  P0 PROPOSED
D-ARCH-002  database engine                      P0 PROPOSED
D-ARCH-003  API contract architecture            P0 PROPOSED
D-ARCH-004  authentication/session               P0 OPEN
D-ARCH-005  architecture style                   P1 PROPOSED / ADR-0001 drafted
D-ARCH-006  API deployment topology              P1 OPEN
D-ARCH-007  background jobs                      P1 OPEN
D-ARCH-009  hosting                              P1 OPEN
D-ARCH-012  Owner/Staff web framework            P0 PROPOSED
D-ARCH-013  member client strategy               P1 PROPOSED
D-ARCH-014  managed backend responsibilities     P0 OPEN
D-ARCH-015  authorization implementation         P0 PROPOSED
D-ARCH-016  primary language/runtime             P0 PROPOSED
D-ARCH-017  data access/migrations               P1 PROPOSED
D-ARCH-018  testing toolchain                    P1 PROPOSED
D-ARCH-019  CI/CD + release/secrets              P1 OPEN
D-SEC-001   jurisdiction/privacy                 P0 OPEN
D-SEC-002   member authentication                P0 OPEN
D-SEC-004   session lifecycle                    P1 OPEN
D-SEC-008   RLS/data-layer isolation             conditional P0 OPEN
D-PROVIDER-001 payment provider                  P1 OPEN
D-PROVIDER-002 messaging provider                P1 OPEN
D-PROVIDER-006 observability provider            P1 OPEN
D-DATA-007  Member vs Membership state ownership P1 PROPOSED
```

`D-ARCH-008` Redis/cache/broker remains P2 OPEN and is not a Phase 1 baseline recommendation.

## Last Completed Task

`0009-draft-phase1-architecture-style-adr`

Created:

```text
docs/adr/ADR-0001-modular-monolith.md
.ai/task/0009-draft-phase1-architecture-style-adr.md
```

Continuity/index updated:

```text
docs/adr/README.md
docs/README.md
.ai/current-state.md
```

No product requirement, canonical decision status, technology/provider selection, application code, schema/migration, API route, deployment configuration, or infrastructure was changed.

## Current Task

None in progress.

## Next Task

Task `0010-draft-primary-language-runtime-adr`.

Create only:

```text
docs/adr/ADR-0002-primary-language-runtime.md
```

Primary canonical decision:

```text
D-ARCH-016
```

Initial ADR status:

```text
Proposed
```

The ADR should evaluate the current strict TypeScript + supported Node.js LTS recommendation against credible alternatives while preserving separation from:

```text
D-ARCH-012  Next.js Owner/Staff framework
D-ARCH-013  member client strategy
D-ARCH-001  repository/workspace strategy
D-ARCH-002  database engine
D-ARCH-006  API deployment topology
D-ARCH-009  hosting
provider selections
```

Do not draft the repository or database ADR in the same bounded task.

## Files To Read Next

```text
.ai/README.md
.ai/current-state.md
.ai/task/0009-draft-phase1-architecture-style-adr.md
docs/README.md
docs/00-overview/assumptions.md
docs/01-product/functional-requirements.md
docs/01-product/non-functional-requirements.md
docs/02-architecture/architecture-principles.md
docs/02-architecture/architecture-overview.md
docs/02-architecture/component-architecture.md
docs/02-architecture/technology-stack.md
docs/adr/README.md
docs/adr/ADR-0001-modular-monolith.md
```
