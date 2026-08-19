# GymPulse Decision Memory

This file is a compact index for AI continuity. It is not the canonical ADR store.

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

- modular monolith before microservices
- TypeScript primary application stack
- PostgreSQL canonical relational store
- explicit multi-tenant hierarchy
- capability-based authorization
- provider adapter boundaries
- durable background jobs
- UTC event timestamps plus gym timezone
- integer minor-unit money

## Open P0/P1 Decisions

See `docs/16-open-decisions.md` for canonical current detail.

High-impact items:

- freeze expiry effect
- renewal effective date
- payment provider
- staff auth provider
- member auth method
- managed backend
- API deployment model
- job runner
- hosting
- messaging provider
- RLS strategy
- renewal representation
- receipt/tax requirements

## Rule

Do not convert a `Proposed`, `Assumed`, or `Open` item into `Accepted` in this memory file without updating the canonical ADR/decision record first.
