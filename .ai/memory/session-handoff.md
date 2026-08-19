# GymPulse Session Handoff

## Last completed task

`TASK-DOC-ARCH-006 - Create Architecture Data Flows`

Branch:

`docs/phase-2-architecture`

Created:

`docs/02-architecture/data-flow.md`

## What the data-flow architecture established

The Phase 1 architecture now traces critical data movement end to end across clients, trusted Application/API components, domain modules, PostgreSQL, workers, and external providers.

Covered flows:

1. authentication -> principal -> tenant/capability authorization,
2. member QR check-in,
3. assisted staff check-in,
4. scheduled no-show scan -> retention case,
5. follow-up -> return attendance -> case resolution,
6. renewal window -> reminder intent,
7. renewal order -> payment checkout initiation,
8. verified payment webhook -> canonical payment transition -> exactly-once membership/add-on effect,
9. notification intent -> current policy -> provider dispatch -> delivery status,
10. controlled import -> staging/reconciliation -> canonical write,
11. owner dashboard/action-queue read model,
12. data-quality scan -> issue lifecycle.

## Important architecture rules captured

- client/provider analytics are not canonical business truth,
- authentication and tenant authorization are separate concerns,
- clients cannot self-authorize tenant/member scope,
- domain modules retain write ownership even with a shared database,
- correctness-sensitive mutations use explicit transactions,
- external provider latency stays outside long DB transactions where practical,
- asynchronous work that must not be lost requires durable continuation/outbox-equivalent behavior,
- request idempotency, domain uniqueness, provider-event dedupe, and business-effect dedupe are separate layers,
- payment initiation never extends membership,
- verified provider evidence plus a unique business-effect key is required for entitlement activation,
- scheduled business rules use gym-local timezone while event timestamps remain UTC,
- worker retries must be safe and observable,
- dashboard/read-model projections remain read-only and traceable to canonical records.

## Important decision state

No provider/runtime or framework decision was accepted by the data-flow task.

Still Proposed/Open according to `docs/00-overview/assumptions.md`:

```text
D-ARCH-001      Monorepo
D-ARCH-002      PostgreSQL
D-ARCH-003      JSON HTTP API
D-ARCH-004      Authentication/session strategy
D-ARCH-006      API deployment topology
D-ARCH-007      Job runner
D-ARCH-008      Redis requirement
D-ARCH-009      Hosting
D-ARCH-010      Object storage
D-ARCH-011      Owner/Staff web framework
D-ARCH-012      Member mobile framework
D-ARCH-013      Managed backend
D-ARCH-014      Package manager
D-PROVIDER-001  Payment provider
D-PROVIDER-002  Messaging provider
D-PROVIDER-005  Product analytics
D-PROVIDER-006  Observability
D-SEC-002       Member authentication
D-SEC-008       RLS strategy
D-DATA-007      Membership renewal representation
```

## Current task

Read `.ai/task/current.md`.

Current task:

`TASK-DOC-ARCH-007 - Create Technology Stack Evaluation`

Target:

`docs/02-architecture/technology-stack.md`

## Exact next action

Evaluate the concrete technology options required to implement the architecture without treating recommendations as accepted decisions.

The next document must cover:

- TypeScript/runtime direction,
- monorepo and package manager,
- Owner/Staff web framework,
- Member mobile framework,
- API style and deployment topology,
- PostgreSQL/data-access/migrations,
- managed backend option,
- auth/session requirements,
- job runner/scheduler,
- payments,
- messaging,
- object storage,
- observability,
- product analytics,
- Redis/cache posture,
- local development/testing,
- security and operations implications,
- alternatives/tradeoffs,
- canonical decision IDs and ADR ownership.

## Do not forget

- `docs/` is canonical truth.
- `.ai/` is execution continuity only.
- use canonical scoped decision IDs.
- `technology-stack.md` is evaluation/guidance, not an ADR substitute.
- recommendations may be `Proposed` or `Assumed`, not silently `Accepted`.
- preserve the modular-monolith, tenant-isolation, idempotency, and provider-adapter boundaries already documented.
- do not start ADR acceptance in the same bounded task unless explicitly requested.

## Blockers/open questions

No blocker prevents writing the technology evaluation.

Some vendor/provider choices may remain Open because current repository evidence does not yet justify selection.