# GymPulse Documentation

## Purpose

This `docs/` directory is the canonical Docs-as-Code knowledge base for GymPulse. It is intended to let product, design, engineering, QA, security, operations, and future contributors understand why the product exists, how it should behave, how it is designed, and how it is operated.

The documentation is being migrated from an initial flat set of planning files into a domain-oriented structure. During migration, files in the new folder structure take precedence over legacy flat files when both describe the same topic.

## Documentation Taxonomy

The word `Status` previously mixed several different concepts. New or materially revised documents should use an explicit label instead of a bare `Status` field where ambiguity is possible.

### Document Maturity

Describes the maturity of the document itself:

```text
Draft
Review
Approved
Deprecated
```

`Deprecated` means the document is retained for history/traceability and is no longer canonical.

### Scope Status

Describes whether a capability belongs to the referenced delivery phase:

```text
In Scope
Future
Out of Scope
```

`Conditional` may be used for a capability that enters scope only if an explicit business/pilot decision enables it.

### Decision Status

Canonical architecture/product/security decisions are tracked in `00-overview/assumptions.md` using:

```text
Open
Proposed
Assumed
Decided
Blocked
Deferred
```

### Requirement / Content Status

Existing structured product documents also use terms such as `Confirmed`, `Conditional`, and `Open` to describe requirement confidence or applicability. These meanings are preserved during migration.

Do not mechanically rewrite every existing document merely to change labels. When a file is materially revised, prefer fields such as `Document Maturity`, `Scope Status`, `Decision Status`, or `Requirement Status` so the meaning is explicit.

## Source Hierarchy

When documents conflict, use this order:

1. Accepted ADRs and explicitly approved business decisions.
2. Current structured documents under `docs/00-overview/` through `docs/15-roadmap/`.
3. Current requirement IDs and domain specifications.
4. Explicit assumptions/open decisions in `docs/00-overview/assumptions.md`.
5. Legacy flat documents in `docs/` that have not yet been fully migrated.
6. Original Gym App Blueprint source material for source-derived Phase 1 behavior.

No undocumented implementation detail overrides an approved requirement or ADR.

## Canonical Decision Register

`docs/00-overview/assumptions.md` is the canonical decision and assumption register.

`docs/16-open-decisions.md` is a legacy migration source. New structured documents must use canonical scoped IDs such as `D-ARCH-006`, not legacy IDs such as `D-060`.

## Target Information Architecture

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
│   ├── architecture-principles.md
│   ├── architecture-overview.md
│   ├── system-context.md
│   ├── container-architecture.md
│   ├── component-architecture.md
│   ├── data-flow.md
│   └── technology-stack.md
├── 03-applications/
├── 04-backend/
├── 05-database/
├── 06-api/
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

`docs/adr/` is the single canonical ADR store. Do not create a competing ADR directory under `02-architecture/`.

The domain tree deliberately includes `memberships`, `attendance`, `retention`, and `payments` because these are core GymPulse Phase 1 business domains.

## Documentation Creation Sequence

Documentation is created and reviewed in this order:

1. Existing-information assessment and information architecture.
2. Project overview, vision, goals, scope, terminology, assumptions.
3. Product requirements, personas, roles, journeys, features, FRs/NFRs, success metrics.
4. Architecture foundation and C4 architecture.
5. Domain boundaries and domain specifications.
6. Database and API design.
7. AI architecture and safety model.
8. Security and privacy architecture.
9. Infrastructure, environments, deployment, and DevOps.
10. Testing and observability.
11. Engineering standards and workflow.
12. MVP, phased roadmap, technical debt, future architecture.
13. Cross-document consistency and traceability audit.

## Requirement Traceability

Requirements use stable IDs such as:

```text
FR-IDENTITY-001
FR-MEMBERSHIP-001
FR-ATTENDANCE-001
FR-RETENTION-001
FR-PAYMENT-001
NFR-SECURITY-001
NFR-PERFORMANCE-001
```

Architecture documents and ADRs should reference the requirement IDs they satisfy. Tests should reference requirement or acceptance-criterion IDs where practical.

Target traceability direction:

```text
Requirement
  -> Product Capability
  -> Domain
  -> Architecture Principle / Component
  -> Canonical Decision ID / ADR
  -> Database Entity
  -> API Contract
  -> Security Control
  -> Test
```

## ADR Policy

A major architecture decision is not considered final merely because it appears in a design or legacy implementation-planning document.

Decisions such as architecture style, repository strategy, database, API style, authentication, authorization implementation, job runner, payment provider, hosting platform, or required infrastructure dependency require explicit decision governance and an ADR when material.

ADR governance lives in `adr/README.md`.

Implementation alone does not convert an Open/Proposed/Assumed decision into an Accepted/Decided decision.

## Documentation Quality Rules

- Prefer precise behavior over aspirational language.
- Explain selected designs, reasoning, alternatives, tradeoffs, and implications.
- Do not fabricate missing business rules. Record them as assumptions or open decisions.
- Keep deterministic business logic separate from probabilistic AI behavior.
- Security, privacy, tenancy, idempotency, auditability, and observability are cross-cutting concerns.
- Use Mermaid diagrams when a diagram is clearer than prose.
- Avoid repeating the same rule in many places; link to the canonical owning document.
- When a canonical rule changes, identify and update all dependent documents in the same change set.
- New structured documents must not introduce legacy decision IDs.

## Current Structured-Document Status

### `00-overview/`

Complete at Draft v1.x foundation level:

- `project-overview.md`
- `vision.md`
- `goals.md`
- `scope.md`
- `glossary.md`
- `assumptions.md`

`assumptions.md` also owns the normalized architecture-decision inventory and the Member-vs-Membership state-ownership ambiguity.

### `01-product/`

Complete at Draft v1.x foundation level:

- `product-requirements.md`
- `personas.md`
- `user-roles.md`
- `user-journeys.md`
- `feature-catalog.md`
- `functional-requirements.md`
- `non-functional-requirements.md`
- `success-metrics.md`

### `02-architecture/`

Completed Draft architecture documents:

```text
docs/02-architecture/architecture-principles.md
docs/02-architecture/architecture-overview.md
docs/02-architecture/system-context.md
docs/02-architecture/container-architecture.md
docs/02-architecture/component-architecture.md
docs/02-architecture/data-flow.md
docs/02-architecture/technology-stack.md
```

ADR governance exists at:

```text
docs/adr/README.md
```

`architecture-overview.md` defines technology-neutral logical boundaries, trust boundaries, domain ownership, synchronous/asynchronous interaction patterns, consistency expectations, failure isolation, and deployment neutrality.

`system-context.md` is the C4 Level 1 system view. It defines GymPulse as a black-box Phase 1 system, active human actors, external provider/supporting systems, trust relationships, authoritative-state boundaries, high-level information flows, tenant/time context, and failure/degradation expectations without selecting providers or runtime technologies.

`container-architecture.md` is the C4 Level 2 view. It defines Member Client, Owner/Staff Application, Trusted Application/API, Background Execution, Canonical Persistence, conditional Protected Object Storage, external-provider boundaries, deployment alternatives, transaction/idempotency boundaries, authorization enforcement points, observability, failure behavior, and testing seams while keeping `D-ARCH-006` and other runtime/provider decisions explicit.

`component-architecture.md` is the C4 Level 3-style view for Trusted Application/API and Background Execution responsibilities. It defines entry adapters, authentication/principal resolution, tenant/resource scope, capability authorization, validation, command/query handlers, Phase 1 domain ownership, cross-domain write restrictions, Unit of Work, repositories, idempotency, provider ports/adapters, notification policy, audit/events, business-time support, background handlers, observability, failure propagation, and test seams without selecting unresolved technologies.

`data-flow.md` traces the major Phase 1 end-to-end flows across actors, client/container/component boundaries, canonical persistence, external providers, transaction boundaries, idempotency/deduplication, retries/reconciliation, audit, observability, gym-local time, and durable async continuation. It covers authentication/authorization, attendance, retention, renewal, payment, notifications, import, dashboard/read models, and data-quality lifecycle while preserving unresolved technology decisions.

`technology-stack.md` evaluates the implementation stack against those established boundaries. It recommends directions such as TypeScript/Node.js, monorepo/pnpm, Next.js for Owner/Staff, web/PWA-first member delivery, JSON HTTP contracts, PostgreSQL, SQL-aware persistence tooling, durable Postgres-backed background work, and provider-neutral integrations while explicitly preserving every canonical Open/Proposed/Assumed status. It also records technology decision dependencies, Decision Register Gaps, ADR readiness, `D-DATA-007` impacts, official ecosystem verification, and implementation blockers.

The next bounded architecture-governance task is:

```text
Task 0008: Technology Decision Register Gap Normalization
```

It should update the canonical decision register with the material technology decisions that currently lack IDs, reconcile the ADR queue/dependencies, and preserve unresolved statuses. It must not accept ADRs or begin application scaffolding automatically.

## Legacy Migration State

Legacy flat files remain migration inputs until their useful material has canonical structured destinations and they are explicitly marked Deprecated or replaced by a pointer.

High-value architecture migration sources include:

- `05-system-architecture.md`
- `06-database-schema.md`
- `07-api-contracts.md`
- `08-automations.md`
- `09-payments-billing.md`
- `10-notifications-whatsapp.md`
- `12-security-audit.md`
- `13-testing-qa.md`
- `15-engineering-workflow.md`
- `16-open-decisions.md`

Do not delete or deprecate them merely because architecture foundation documents now exist.

## Current Delivery Boundary

The confirmed source-derived Phase 1 product centers on:

- member and membership management,
- QR and assisted attendance,
- inactivity/no-show detection,
- staff follow-up and member return tracking,
- renewal reminders and verified payment state,
- basic PT, diet/nutrition, and product add-ons,
- owner operational dashboard,
- notifications, consent, data-quality controls, and audit history.

Workout programming, detailed nutrition tracking, health metrics, coaching platforms, multi-branch SaaS, and AI remain `Future` or otherwise outside active Phase 1 requirements until explicitly approved.
