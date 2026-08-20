# GymPulse

GymPulse is a gym operations, member retention, attendance, renewal, payments, and revenue workflow platform for gyms and fitness studios.

The product is being designed as a standalone multi-tenant SaaS. Phase 1 stays intentionally focused on the operational loop that matters most to a local gym:

`attendance -> risk detection -> follow-up -> member return -> renewal -> relevant add-ons -> measurable outcomes`

## Product goals

GymPulse should help a gym answer these questions every day:

- Who came today?
- Who has quietly stopped coming?
- Who should staff contact next?
- Which memberships are about to expire?
- Which payments failed or are still pending?
- Which members returned after follow-up?
- Which PT, diet, or product orders still need action?
- What measurable retention or revenue outcome did the workflow produce?

## Phase 1 scope

- Tenant-aware authentication and authorization
- Members, plans, memberships, pauses, and expiry rules
- Rotating/session-bound QR attendance
- Assisted front-desk check-in with audit reason
- Attendance history and fair weekly goal/streak
- Configurable no-show risk detection
- Staff follow-up queue, outcomes, and next actions
- Renewal offers and reminder stages
- Verified payment lifecycle and receipts
- Optional PT, diet/nutrition, and product add-ons
- Owner operational dashboard
- Transactional notifications and opt-out controls
- Audit history and data-quality alerts

## Product expansion

After Phase 1 proves daily usage, GymPulse can expand into:

- Lead CRM and trial conversion
- Trainer and PT scheduling
- Classes and bookings
- Member 360 profile
- Workout programming and logging
- Progress measurements and photos
- Multi-branch operations
- SaaS subscriptions and platform administration
- Rules-based churn scoring
- AI-assisted owner and trainer insights

## Documentation

**Canonical documentation entry point:** [`docs/README.md`](./docs/README.md)

Use the structured documentation first:

| Area | Purpose |
|---|---|
| [`docs/00-overview/`](./docs/00-overview/) | Vision, goals, scope, terminology, assumptions, and canonical open decisions |
| [`docs/01-product/`](./docs/01-product/) | Product requirements, roles, journeys, features, FRs/NFRs, and success metrics |
| [`docs/02-architecture/`](./docs/02-architecture/) | Architecture principles and subsequent architecture documents |
| [`docs/adr/`](./docs/adr/) | Architecture Decision Record governance and accepted/proposed decision history |

The older flat files under `docs/` remain **legacy migration sources** until their useful content is migrated and explicitly deprecated. They are not the preferred entry point when a structured canonical document covers the same topic.

## Current status

`Architecture Foundation Gate`

Product foundation is documented. Architecture work has begun with technology-neutral principles and ADR governance. Application implementation, database migrations, and API scaffolding should not begin merely because a legacy document recommends a technology.

Open architecture, security, provider, and pilot decisions are tracked canonically in [`docs/00-overview/assumptions.md`](./docs/00-overview/assumptions.md).

## Source basis

The initial retention workflow is derived from the uploaded **Gym App Blueprint by Roy Digital App Studio**. GymPulse preserves its core attendance, no-show recovery, renewal, add-on, automation, KPI, and pilot concepts, then extends them into a standalone SaaS architecture.
