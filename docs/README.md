# GymPulse Documentation

## Purpose

This `docs/` directory is the canonical Docs-as-Code knowledge base for GymPulse. It is intended to let product, design, engineering, QA, security, operations, and future contributors understand why the product exists, how it should behave, how it is designed, and how it is operated.

The documentation is being migrated from an initial flat set of planning files into a domain-oriented structure. During migration, files in the new folder structure take precedence over legacy flat files when both describe the same topic.

## Documentation status model

Every document or major decision should use one of these states where relevant:

- `Confirmed`: supported by an approved product/business decision or source material.
- `Proposed`: recommended design that still requires explicit approval or ADR acceptance.
- `Assumed`: temporary working assumption used only to unblock design; must have an owner and review point.
- `Future`: intentionally outside the current delivery phase.
- `Out of Scope`: explicitly excluded from the referenced phase.
- `Deprecated`: retained only for historical traceability and must not be treated as current truth.

## Source hierarchy

When documents conflict, use this order:

1. Accepted ADRs and explicitly approved business decisions.
2. Current structured documents under `docs/00-overview/` through `docs/15-roadmap/`.
3. Current requirement IDs and domain specifications.
4. Legacy flat documents in `docs/` that have not yet been migrated.
5. Original Gym App Blueprint source material for source-derived Phase 1 behavior.

No undocumented implementation detail overrides an approved requirement or ADR.

## Target information architecture

```text
docs/
├── README.md
├── 00-overview/
│   ├── project-overview.md
│   ├── vision.md
│   ├── goals.md
│   ├── scope.md
│   ├── glossary.md
│   └── assumptions.md
├── 01-product/
│   ├── product-requirements.md
│   ├── personas.md
│   ├── user-roles.md
│   ├── user-journeys.md
│   ├── feature-catalog.md
│   ├── functional-requirements.md
│   ├── non-functional-requirements.md
│   └── success-metrics.md
├── 02-architecture/
│   ├── architecture-overview.md
│   ├── system-context.md
│   ├── container-architecture.md
│   ├── component-architecture.md
│   ├── data-flow.md
│   ├── architecture-principles.md
│   ├── technology-stack.md
│   └── architecture-decisions/
├── 03-applications/
│   ├── web-app.md
│   ├── mobile-app.md
│   ├── admin-panel.md
│   └── coach-dashboard.md
├── 04-backend/
│   ├── backend-architecture.md
│   ├── services.md
│   ├── modules.md
│   ├── background-jobs.md
│   ├── caching.md
│   ├── events.md
│   └── error-handling.md
├── 05-database/
│   ├── database-overview.md
│   ├── schema-design.md
│   ├── entities.md
│   ├── relationships.md
│   ├── indexing.md
│   ├── migrations.md
│   └── data-retention.md
├── 06-api/
│   ├── api-overview.md
│   ├── api-conventions.md
│   ├── authentication.md
│   ├── endpoints.md
│   ├── errors.md
│   ├── pagination.md
│   ├── rate-limits.md
│   └── versioning.md
├── 07-domains/
│   ├── identity/
│   ├── members/
│   ├── memberships/
│   ├── attendance/
│   ├── retention/
│   ├── payments/
│   ├── workouts/
│   ├── exercises/
│   ├── nutrition/
│   ├── meals/
│   ├── health/
│   ├── progress/
│   ├── coaching/
│   ├── ai/
│   ├── notifications/
│   ├── subscriptions/
│   └── analytics/
├── 08-ai/
├── 09-security/
├── 10-infrastructure/
├── 11-observability/
├── 12-testing/
├── 13-engineering/
├── 14-operations/
├── 15-roadmap/
└── adr/
    ├── README.md
    └── ADR-XXXX-title.md
```

The domain tree deliberately adds `memberships`, `attendance`, `retention`, and `payments` because these are core GymPulse Phase 1 business domains and should not be hidden inside generic user or analytics documentation.

## Documentation creation sequence

Documentation is created and reviewed in this order:

1. Existing-information assessment and information architecture.
2. Project overview, vision, goals, scope, terminology, assumptions.
3. Product requirements, personas, roles, journeys, features, FRs/NFRs, success metrics.
4. C4 architecture and architectural principles.
5. Domain boundaries and domain specifications.
6. Database and API design.
7. AI architecture and safety model.
8. Security and privacy architecture.
9. Infrastructure, environments, deployment, and DevOps.
10. Testing and observability.
11. Engineering standards and workflow.
12. MVP, phased roadmap, technical debt, future architecture.
13. Cross-document consistency and traceability audit.

## Requirement traceability

Requirements use stable IDs such as:

```text
FR-IDENTITY-001
FR-MEMBERSHIP-001
FR-ATTENDANCE-001
FR-RETENTION-001
FR-PAYMENT-001
FR-WORKOUT-001
FR-NUTRITION-001
NFR-SECURITY-001
NFR-PERFORMANCE-001
```

Architecture documents and ADRs should reference the requirement IDs they satisfy. Tests should reference requirement or acceptance-criterion IDs where practical.

## ADR policy

A major architecture decision is not considered final merely because it appears in a design document. Decisions such as monorepo strategy, database, API style, authentication, job runner, payment provider, hosting platform, AI model strategy, or event architecture require an ADR before they become architectural commitments.

## Documentation quality rules

- Prefer precise behavior over aspirational language.
- Explain selected designs, reasoning, alternatives, tradeoffs, and implications.
- Do not fabricate missing business rules. Record them as assumptions or open decisions.
- Keep deterministic business logic separate from probabilistic AI behavior.
- Security, privacy, tenancy, idempotency, auditability, and observability are cross-cutting concerns.
- Use Mermaid diagrams when a diagram is clearer than prose.
- Avoid repeating the same rule in many places; link to the canonical owning document.
- When a canonical rule changes, identify and update all dependent documents in the same change set.

## Current structured-document status

### Completed foundation

`00-overview/` is complete at Draft v1.x level:

- `project-overview.md`
- `vision.md`
- `goals.md`
- `scope.md`
- `glossary.md`
- `assumptions.md`

`01-product/` is complete at Draft v1.x level:

- `product-requirements.md`
- `personas.md`
- `user-roles.md`
- `user-journeys.md`
- `feature-catalog.md`
- `functional-requirements.md`
- `non-functional-requirements.md`
- `success-metrics.md`

### Next documentation phase

The next canonical phase is `02-architecture/`:

1. `architecture-principles.md`
2. `architecture-overview.md`
3. `system-context.md`
4. `container-architecture.md`
5. `component-architecture.md`
6. `data-flow.md`
7. `technology-stack.md`
8. initial ADRs for major decisions

The legacy flat files remain migration inputs until their material has canonical structured destinations and they are explicitly marked deprecated.

## Current delivery boundary

The confirmed source-derived Phase 1 product centers on:

- member and membership management,
- QR and assisted attendance,
- inactivity/no-show detection,
- staff follow-up and member return tracking,
- renewal reminders and verified payment state,
- basic PT, diet/nutrition, and product add-ons,
- owner operational dashboard,
- notifications, consent, data-quality controls, and audit history.

Workout programming, detailed nutrition tracking, health metrics, coaching platforms, multi-branch SaaS, and AI are broader GymPulse capabilities that must remain `Proposed` or `Future` until their product requirements are explicitly approved.
