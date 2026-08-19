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

The complete product and technical specification lives in [`docs/`](./docs).

| Document | Purpose |
| --- | --- |
| [`00-product-blueprint.md`](./docs/00-product-blueprint.md) | Product vision, business model, scope, principles, domain, and success definition |
| [`01-product-requirements.md`](./docs/01-product-requirements.md) | Functional and non-functional product requirements |
| [`02-user-roles-permissions.md`](./docs/02-user-roles-permissions.md) | Role hierarchy, permissions, tenancy boundaries, and authorization rules |
| [`03-user-flows.md`](./docs/03-user-flows.md) | End-to-end member, staff, owner, payment, and retention journeys |
| [`04-screen-specifications.md`](./docs/04-screen-specifications.md) | Screen inventory, components, states, actions, and UX requirements |
| [`05-system-architecture.md`](./docs/05-system-architecture.md) | Recommended platform architecture, service boundaries, and runtime design |
| [`06-database-schema.md`](./docs/06-database-schema.md) | Relational data model, enums, constraints, indexes, and tenant isolation |
| [`07-api-contracts.md`](./docs/07-api-contracts.md) | API conventions, endpoint contracts, errors, idempotency, and webhooks |
| [`08-automations.md`](./docs/08-automations.md) | Scheduled jobs, workflow rules, retries, and automation idempotency |
| [`09-payments-billing.md`](./docs/09-payments-billing.md) | Member payment lifecycle, refunds, receipts, reconciliation, and SaaS billing boundary |
| [`10-notifications-whatsapp.md`](./docs/10-notifications-whatsapp.md) | Transactional messaging, consent, templates, deduplication, and delivery tracking |
| [`11-analytics-kpis.md`](./docs/11-analytics-kpis.md) | KPI definitions, formulas, event model, and operational reporting |
| [`12-security-audit.md`](./docs/12-security-audit.md) | Security model, auditability, privacy, and operational controls |
| [`13-testing-qa.md`](./docs/13-testing-qa.md) | Test strategy, critical scenarios, release gates, and pilot QA |
| [`14-roadmap.md`](./docs/14-roadmap.md) | Delivery phases, milestones, sprints, and pilot sequence |
| [`15-engineering-workflow.md`](./docs/15-engineering-workflow.md) | Monorepo conventions, branching, CI, environments, and definition of done |
| [`16-open-decisions.md`](./docs/16-open-decisions.md) | Product and implementation decisions that must be confirmed before production |

## Current status

`Product architecture and specification`

Implementation should begin only after Phase 0 decisions marked as blocking in `docs/16-open-decisions.md` are resolved or explicitly accepted as assumptions.

## Source basis

The initial retention workflow is derived from the uploaded **Gym App Blueprint by Roy Digital App Studio**. GymPulse preserves its core attendance, no-show recovery, renewal, add-on, automation, KPI, and pilot concepts, then extends them into a standalone SaaS architecture.
