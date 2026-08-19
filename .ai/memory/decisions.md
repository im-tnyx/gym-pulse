# GymPulse Decision Memory

This file is a compact index for AI continuity. It is not the canonical ADR or decision store.

## Canonical decision source

Read:

`docs/00-overview/assumptions.md`

That file owns canonical IDs such as:

```text
D-ARCH-006
D-PROVIDER-001
D-SEC-002
D-DATA-007
```

`docs/16-open-decisions.md` is a legacy migration source. Do not introduce its historical IDs such as `D-060` into new structured documentation.

## Confirmed / Accepted Product-Level Rules

- Phase 1 focuses on gym operations and retention, not a generic fitness super-app.
- Payment initiation is not payment success.
- Critical payment effects must happen exactly once.
- Attendance must be canonical and retry-safe.
- Frozen/paused memberships are excluded from standard no-show workflows.
- Sensitive operational changes must be auditable.
- Tenant authorization is server-side.
- Marketing and service/transactional communication are separate concepts.

## Proposed Architecture Direction

Pending ADR acceptance:

- modular monolith before microservices,
- TypeScript primary application stack,
- PostgreSQL canonical relational store,
- explicit multi-tenant hierarchy,
- capability-based authorization,
- provider adapter boundaries,
- durable background jobs,
- UTC event timestamps plus gym timezone,
- integer minor-unit money.

## Open P0/P1 Decisions

High-impact canonical decisions include:

- `D-BIZ-007` freeze expiry effect,
- `D-BIZ-010` renewal effective date,
- `D-PROVIDER-001` payment provider,
- `D-ARCH-004` authentication/session strategy,
- `D-SEC-002` member authentication method,
- `D-ARCH-013` managed backend,
- `D-ARCH-006` API deployment model,
- `D-ARCH-007` job runner,
- `D-ARCH-009` hosting,
- `D-PROVIDER-002` messaging provider,
- `D-SEC-008` RLS strategy,
- `D-DATA-007` renewal representation,
- `D-BIZ-013` receipt/tax requirements.

## Rule

Do not convert a `Proposed`, `Assumed`, or `Open` item into `Accepted` in this memory file without updating the canonical decision record and the relevant ADR first.
