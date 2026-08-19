# GymPulse Session Handoff

## Last completed task

`TASK-DOC-ARCH-005 - Create C4 Component Architecture`

Branch:

`docs/phase-2-architecture`

Created:

`docs/02-architecture/component-architecture.md`

## What the component architecture established

The trusted Application/API and Worker logical containers are now decomposed into implementation-oriented source-code components.

Key boundaries:

- Transport Adapters own protocol translation, not business rules.
- Request/Correlation Context propagates safe diagnostic identity.
- Principal Resolver maps verified authentication evidence to GymPulse principals.
- Tenant Context Resolver determines allowed organization/gym/branch scope.
- Capability Authorization enforces named permissions server-side.
- Contract Validation protects trust boundaries.
- Application Use Cases coordinate transactions and cross-domain intent.
- Domain modules own canonical business mutations.
- Repository/Data Ports prevent arbitrary table mutation across domains.
- Unit of Work defines correctness-sensitive transaction boundaries.
- Idempotency uses request, domain uniqueness, provider-event, and business-effect layers.
- Provider SDK/payloads remain behind Auth, Payment, Messaging, Object Storage, and Observability adapters.
- Notification business intent/policy is separate from delivery transport.
- Audit history is required for defined sensitive mutations.
- Operational Read Models may join domains but are read-only authorities.
- Worker handlers reuse application/domain rules and carry explicit tenant context/system capabilities.

## Critical flows already illustrated

`component-architecture.md` contains sequence diagrams for:

1. member QR check-in,
2. verified renewal payment -> exactly-once membership effect.

These sequences show authorization, transaction, idempotency, domain ownership, and canonical persistence boundaries.

## Important decision state

No major technology/provider decision was accepted.

Still Proposed/Open according to `docs/00-overview/assumptions.md`:

```text
D-ARCH-001      Monorepo
D-ARCH-002      PostgreSQL
D-ARCH-004      Authentication/session strategy
D-ARCH-006      API deployment topology
D-ARCH-007      Job runner
D-ARCH-009      Hosting
D-ARCH-010      Object storage
D-ARCH-011      Owner/Staff web framework
D-ARCH-012      Member mobile framework
D-ARCH-013      Managed backend
D-PROVIDER-001  Payment provider
D-PROVIDER-002  Messaging provider
D-PROVIDER-006  Observability provider
D-SEC-002       Member authentication
D-SEC-008       RLS strategy
D-DATA-007      Membership renewal representation
```

## Current task

Read `.ai/task/current.md`.

Current task:

`TASK-DOC-ARCH-006 - Create Architecture Data Flows`

Target:

`docs/02-architecture/data-flow.md`

## Exact next action

Trace Phase 1 end-to-end data movement through the boundaries that already exist.

Minimum flows:

- authentication -> principal -> tenant/capability authorization,
- QR check-in,
- assisted check-in,
- no-show scan -> case,
- follow-up -> return resolution,
- renewal-window scan -> notification intent,
- renewal order -> payment checkout,
- payment webhook -> exactly-once business effect,
- notification dispatch/delivery callback,
- controlled import,
- owner dashboard/read model,
- data-quality scan.

Each flow must show:

- canonical source/destination,
- trust boundary crossing,
- auth/authz checkpoint,
- transaction boundary,
- sync/async handoff,
- durable continuation if required,
- idempotency/dedupe invariant,
- retry/failure/reconciliation path,
- audit/observability hooks,
- relevant FR/NFR traceability.

## Do not forget

- `docs/` is canonical truth.
- `.ai/` is execution continuity, not canonical architecture.
- use canonical scoped decision IDs only.
- do not invent new services merely to draw a flow.
- provider/runtime choices remain abstract until ADR/decision acceptance.
- deterministic business truth stays in trusted domain/application code.
- do not begin `technology-stack.md` until `data-flow.md` and context updates are complete.

## Blockers/open questions

No blocker prevents writing the logical data-flow architecture.

Open provider and runtime choices can remain behind the existing ports/adapters.
