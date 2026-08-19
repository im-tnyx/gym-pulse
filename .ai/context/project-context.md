# GymPulse Project Context

## Project identity

- Project: `GymPulse`
- Repository: `im-tnyx/gym-pulse`
- Documentation model: Docs-as-Code
- Canonical documentation root: `docs/`
- AI continuity root: `.ai/`
- Current working branch: `docs/phase-2-architecture`

## Product posture

GymPulse is currently defined as a gym operations and member-retention platform first. It may later evolve into a broader fitness platform covering workouts, nutrition, health, coaching, AI, subscriptions, and multi-branch SaaS capabilities.

Future capabilities must not silently expand Phase 1 scope.

## Phase 1 core operating loop

```text
Attendance
  -> inactivity/risk detection
  -> staff follow-up
  -> member return/outcome
  -> renewal
  -> verified payment
  -> optional add-on delivery
  -> measurable operational result
```

## Confirmed Phase 1 capabilities

- identity and authorization
- member management
- plans and memberships
- QR attendance
- assisted attendance
- attendance history/corrections
- weekly visit goal
- no-show detection
- retention/red-list queue
- follow-ups and next actions
- return resolution
- renewal eligibility and offers
- renewal orders
- payment lifecycle
- receipts where applicable
- PT/diet/product add-ons
- owner dashboard
- transactional/service notifications
- communication preferences
- audit history
- data-quality controls
- pilot analytics

## Product principles

- owner views prioritize actionable work over decorative charts
- payment initiation is never payment truth
- critical business effects must be idempotent
- sensitive operational history must remain reconstructable
- tenant isolation is mandatory
- authorization is server-side
- motivation/streak logic must be fair
- marketing and service communication are separate consent concepts
- deterministic business rules remain separate from future probabilistic AI behavior

## Proposed architecture posture

The current architecture work proposes:

- TypeScript as primary application language
- modular monolith before microservices
- explicit domain boundaries
- PostgreSQL as canonical relational store
- multi-tenant hierarchy from day one
- web/mobile/API clients sharing stable contracts
- provider adapters for auth, payments, messaging, storage, analytics
- durable observable background jobs
- UTC event timestamps + gym-local business timezone
- integer minor units for money

These are not all final until the relevant ADRs are accepted.

## Tenant hierarchy

```text
Platform
  -> Organization
      -> Gym
          -> Branch
              -> Staff / Members / Operational Data
```

## Current architecture baseline

Structured architecture currently includes:

```text
docs/02-architecture/
  architecture-principles.md
  architecture-overview.md
  system-context.md
  container-architecture.md
  component-architecture.md
```

The component architecture establishes transport, identity/tenant/authz, application-use-case, domain ownership, transaction, repository/port, provider adapter, idempotency, audit, read-model, and worker boundaries without creating microservices.

The next architecture artifact is `data-flow.md`.

## Major future domains

```text
Workouts
Exercises
Nutrition
Meals
Health
Progress
Human Coaching
AI Coach / AI Insights
SaaS Subscriptions
Advanced Analytics
Multi-branch Operations
```

Their detailed product requirements are not yet confirmed.

## Canonical source order

When information conflicts, use:

1. accepted ADRs and approved business decisions
2. structured docs under `docs/00-overview/` through `docs/15-roadmap/`
3. current requirement IDs/domain specifications
4. explicit assumptions/open decisions in `docs/00-overview/assumptions.md`
5. legacy flat docs that are not yet migrated
6. original Gym App Blueprint source material

## Canonical decision register

Use:

`docs/00-overview/assumptions.md`

for current decision IDs, status, owners, and legacy-ID migration crosswalk.

`docs/16-open-decisions.md` is a legacy migration source and MUST NOT be used as the canonical decision register for new structured documentation.

## Important open decisions

Do not guess these silently:

- pilot gym and real operating rules
- freeze expiry effect
- renewal effective-date policy
- duplicate attendance window / multiple visits per day
- staff/member authentication strategy and method
- managed backend
- API deployment model
- job runner
- payment provider
- messaging provider
- hosting
- observability provider
- RLS strategy
- membership renewal representation
- receipt/tax document requirements
- privacy/jurisdiction requirements

Use canonical scoped decision IDs from `docs/00-overview/assumptions.md` when referencing these choices.
