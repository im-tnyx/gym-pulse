# Current Task

## TASK-DOC-ARCH-006

**Title:** Create Architecture Data Flows

**Status:** `READY`

**Phase:** `Phase 4 - System Architecture`

**Target file:** `docs/02-architecture/data-flow.md`

## Objective

Trace the important GymPulse Phase 1 end-to-end data flows across actors/clients, trusted Application/API components, domain modules, PostgreSQL, workers, and external providers.

The data-flow document must reuse the boundaries defined by the current C4 System Context, Container, and Component architecture. It MUST NOT casually invent new deployable services, providers, or accepted technology decisions.

## Inputs to read

1. `.ai/context/project-context.md`
2. `.ai/context/current-context.md`
3. `docs/00-overview/assumptions.md`
4. `docs/01-product/user-journeys.md`
5. `docs/01-product/functional-requirements.md`
6. `docs/01-product/non-functional-requirements.md`
7. `docs/02-architecture/architecture-principles.md`
8. `docs/02-architecture/architecture-overview.md`
9. `docs/02-architecture/system-context.md`
10. `docs/02-architecture/container-architecture.md`
11. `docs/02-architecture/component-architecture.md`
12. relevant legacy flow/API/automation/payment/security sources where migration detail is useful

## Required flows

Document at least:

1. staff/member authentication -> principal resolution -> tenant authorization context,
2. member QR check-in,
3. assisted staff check-in,
4. scheduled no-show scan -> red-list/no-show case,
5. follow-up recording -> return attendance -> case resolution,
6. renewal-window evaluation -> reminder intent,
7. renewal order -> payment checkout initiation,
8. verified payment webhook -> canonical payment transition -> exactly-once membership/add-on effect,
9. notification intent -> current policy check -> provider dispatch -> provider delivery status,
10. controlled import -> validation/staging/reconciliation -> canonical write,
11. owner dashboard/action-queue read model,
12. data-quality scan -> issue lifecycle.

## Mandatory design points

- Mermaid sequence/data-flow diagrams where they improve clarity,
- source and destination of canonical data,
- trust-boundary crossings,
- authorization checkpoints,
- transaction boundaries,
- synchronous vs asynchronous handoffs,
- durable continuation/outbox-equivalent points where required,
- idempotency/deduplication keys or invariants,
- failure/retry/reconciliation paths,
- audit and observability points,
- gym-local timezone behavior for scheduled flows,
- no client/provider analytics event treated as canonical business truth,
- cross-domain ownership respected.

## Requirement traceability

Each major flow should reference the most relevant `FR-*` and `NFR-*` IDs.

## Decision discipline

Use canonical scoped decision IDs from `docs/00-overview/assumptions.md` only.

Do not introduce legacy numeric IDs into this structured document.

Open provider/runtime decisions remain abstract, including authentication, payment, messaging, job runner, hosting, managed backend, object storage, observability, and RLS.

## Important constraint

`data-flow.md` describes movement and transformation of data across existing components. If a flow appears to require a new component or service, first record the gap and justify it rather than silently changing the architecture.

## Definition of Done

- file exists at canonical path,
- all required Phase 1 flows are covered,
- flows align with component/domain ownership,
- trust/authorization/transaction/idempotency boundaries are visible,
- async retries and failure states are explicit,
- canonical vs derived/non-canonical data is distinguishable,
- provider choices remain abstract where Open,
- canonical decision IDs only,
- Mermaid diagrams are syntactically reasonable,
- `.ai/context/documentation-state.md` updated,
- this task recorded in `.ai/task/completed.md`,
- next task becomes `technology-stack.md`,
- `.ai/context/current-context.md` and `.ai/memory/session-handoff.md` updated.
