# GymPulse Documentation

## Purpose

This `docs/` directory is the canonical Docs-as-Code knowledge base for GymPulse. It is intended to let product, design, engineering, QA, security, operations, and future contributors understand why the product exists, how it should behave, how it is designed, and how it is operated.

Structured documents take precedence over legacy flat files when both describe the same topic.

## Documentation Taxonomy

Use explicit labels when `Status` could be ambiguous.

### Document Maturity

```text
Draft
Review
Approved
Deprecated
```

### Scope Status

```text
In Scope
Future
Out of Scope
Conditional
```

### Decision Status

Canonical decisions in `00-overview/assumptions.md` use:

```text
Open
Proposed
Assumed
Decided
Blocked
Deferred
```

Existing product documents may also use `Confirmed`, `Conditional`, and `Open` for requirement confidence/applicability. Do not mechanically rewrite stable documents only to change labels.

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

`docs/16-open-decisions.md` is a legacy migration source. New structured documents must use canonical scoped IDs rather than legacy numeric IDs.

Task 0008 normalized these technology-governance decisions:

```text
D-ARCH-016  Primary implementation language/runtime
D-ARCH-017  Data-access/query/migration strategy
D-ARCH-018  Core automated testing toolchain
D-ARCH-019  CI/CD + production release tooling
```

Registration of an ID does not accept its candidate technology.

## Target Information Architecture

```text
docs/
├── README.md
├── 00-overview/
├── 01-product/
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

## Documentation Creation Sequence

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

Target traceability:

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

Major architecture commitments require explicit governance and an ADR when material. Architecture style, primary runtime, repository strategy, database, persistence tooling, API architecture, authentication/authorization, jobs, hosting, providers, and release infrastructure must not become accepted merely because they appear in planning or implementation.

ADR governance lives in `adr/README.md`.

## Documentation Quality Rules

- Prefer precise behavior over aspirational language.
- Explain decisions, alternatives, tradeoffs, and implications.
- Do not fabricate missing business rules; record assumptions/open decisions.
- Keep deterministic business logic separate from probabilistic AI behavior.
- Treat tenancy, authorization, idempotency, auditability, privacy, and observability as cross-cutting concerns.
- Use Mermaid when diagrams improve clarity.
- Avoid duplicating the same canonical rule across many files.
- Update dependent documentation when a canonical rule changes.
- Do not introduce legacy decision IDs into structured docs.

## Current Structured-Document Status

### `00-overview/`

Draft foundation complete:

```text
project-overview.md
vision.md
goals.md
scope.md
glossary.md
assumptions.md
```

`assumptions.md` owns canonical decision status, including `D-ARCH-016..019` and unresolved `D-DATA-007` Member-vs-Membership state ownership.

### `01-product/`

Draft foundation complete:

```text
product-requirements.md
personas.md
user-roles.md
user-journeys.md
feature-catalog.md
functional-requirements.md
non-functional-requirements.md
success-metrics.md
```

### `02-architecture/`

Completed Draft architecture documents:

```text
architecture-principles.md
architecture-overview.md
system-context.md
container-architecture.md
component-architecture.md
data-flow.md
technology-stack.md
```

These establish the Phase 1 technology-neutral architecture, C4 views, component ownership, critical data flows, and technology evaluation while preserving unresolved decision status.

### ADRs

ADR governance:

```text
docs/adr/README.md
```

Current decision ADRs:

```text
docs/adr/ADR-0001-modular-monolith.md                    Proposed   D-ARCH-005
docs/adr/ADR-0002-primary-language-runtime.md            Proposed   D-ARCH-016
docs/adr/ADR-0003-monorepo-strategy.md                   Proposed   D-ARCH-001
docs/adr/ADR-0004-database-engine.md                     Proposed   D-ARCH-002
docs/adr/ADR-0005-data-access-migration-strategy.md      Proposed   D-ARCH-017
docs/adr/ADR-0006-managed-backend-responsibilities.md    Proposed   D-ARCH-014
docs/adr/ADR-0007-authentication-session-architecture.md Proposed   D-ARCH-004
docs/adr/ADR-0008-member-authentication-method.md        Proposed   D-SEC-002
docs/adr/ADR-0009-authorization-implementation.md        Proposed   D-ARCH-015
```

`ADR-0001` proposes a modular monolith with explicit domain/application/component boundaries and remains unaccepted.

`ADR-0002` proposes strict TypeScript with a supported Node.js LTS runtime, while keeping framework, repository, database, hosting, job-runner, test-tool, and provider choices separate. It requires runtime validation and explicit client-safe/server-only source boundaries. It remains unaccepted.

`ADR-0003` proposes an explicit monorepo with deliberate application/package boundaries, independent build/deployment artifacts, and structural client-safe/server-only enforcement. It keeps package manager, workspace orchestrator, API deployment topology, database, data-access tooling, CI/CD, framework, and hosting decisions separate. It remains unaccepted.

`ADR-0004` proposes PostgreSQL as the canonical transactional database engine after comparing MySQL/MariaDB, document/NoSQL-first, and distributed SQL alternatives against GymPulse correctness, tenancy, querying, backup/restore, and operational requirements. It explicitly does not approve a final schema, managed provider, RLS policy, ORM/query builder, hosting platform, job runner, database role model, exact indexes, or exact PostgreSQL version. It remains unaccepted.

`ADR-0005` proposes a Drizzle-oriented SQL-transparent TypeScript persistence strategy with application-owned transaction boundaries, generated/reviewed committed SQL migrations, raw/custom SQL escape capability, purpose-specific read models, and future RLS compatibility. It is conditional on compatible final runtime/database decisions and does not approve Drizzle, PostgreSQL, RLS, a managed provider, or a final schema. It remains unaccepted.

`ADR-0006` proposes a selective managed-backend responsibility model: commodity infrastructure may be delegated to managed services while GymPulse retains product/domain/application/security semantics. Integrated platforms such as Supabase are candidates only; database, Auth/session, Storage, RLS, jobs/queues/Cron, hosting, observability, and direct-client database access remain separately governed. `D-ARCH-014` remains canonically `OPEN` and no provider is accepted or provisioned.

`ADR-0007` proposes a managed-authentication-provider architecture category with provider-independent AuthIdentity mapping, stable GymPulse Principal resolution, current GymPulse tenant/resource/capability authorization, and a secure server-mediated staff-web session posture. It keeps Member identity separate from authentication identity, keeps future native compatibility without selecting native delivery, and does not select Supabase Auth, Clerk, Auth0, Keycloak, member OTP/passwordless, an MFA mandate, or exact session/device policy. `D-ARCH-004` remains canonically `OPEN`.

`ADR-0008` proposes managed phone OTP/passwordless as the primary Phase 1 member-verification method, but separates verified channel control from tenant-aware Member claiming/linking. It requires stronger controlled handling for ambiguous/shared/reassigned/already-claimed records, recovery and authentication-channel changes. It does not select Supabase Auth, Clerk, Auth0, an SMS/email provider, exact OTP controls, exact session policy, an MFA mandate, or native delivery. `D-SEC-002` remains canonically `OPEN`.

`ADR-0009` proposes a GymPulse-owned provider-independent application authorization module using stable named capabilities, roles as capability bundles, current scoped assignments, trusted resource ownership resolution, explicit Member-self relationships, deny-by-default behavior, and bounded non-human execution contexts. Provider roles/claims, framework middleware, RLS, and external policy engines are not the sole business authority. No authorization library/service, role/capability schema, RLS policy, Redis/cache, or full permission matrix is accepted. `D-ARCH-015` remains canonically `PROPOSED`.

No decision ADR is currently `Accepted`.

## Current Architecture Governance Position

The architecture foundation, C4 views, data flows, technology evaluation, technology decision normalization, and first nine ADR drafts are complete.

This does not make GymPulse implementation-ready. Relevant P0/P1 decisions remain Open/Proposed/Assumed until explicit review and approval evidence exists.

Authentication and authorization remain separate. Provider identity/session evidence must resolve to a GymPulse Principal, then current tenant/resource scope and named capabilities or an explicit Member-self relationship are evaluated from GymPulse-controlled state. A valid authentication session does not preserve business access after an account, tenant assignment, branch scope, capability, or Member-self relationship is revoked.

`D-ARCH-004` remains `P0 OPEN` even though `ADR-0007` is Proposed. `D-SEC-002` remains `P0 OPEN` even though `ADR-0008` proposes managed phone OTP/passwordless as the routine Member-verification direction. `D-SEC-004` exact session lifecycle/device policy remains `P1 OPEN`. `D-ARCH-015` remains `P0 PROPOSED` even though `ADR-0009` now proposes the authorization implementation boundary.

The Task 0017 authorization proposal is:

```text
verified Principal
  + current account eligibility
  + current tenant/resource scope
  + current named capability or Member-self relationship
  + trusted resource relationship
  -> allow / deny
```

Roles remain capability bundles rather than runtime wildcard predicates. Client-supplied tenant/gym/branch/resource identifiers are routing input, not authority. List/search/queue/dashboard reads should be scoped before result materialization where possible. Exports require separate authorization. Background jobs use bounded System Principal/job context, and provider callbacks use separately verified bounded provider context rather than human capabilities.

The baseline introduces no cross-request authorization cache or Redis dependency. Framework middleware may provide coarse early rejection but is not the sole authority. Application authorization remains mandatory if future RLS is adopted. `D-SEC-008` remains separately governed and `OPEN`; no RLS policy or direct-client canonical database topology is approved by Task 0017.

Open product permission questions remain open, including exact Manager authority, attendance correction, offline-payment authority, refund approval, bulk export, support elevation/impersonation, and cross-branch portability.

`D-DATA-004` remains `PROPOSED`; Member and authenticated User/AuthIdentity remain separate concepts without finalized schema/cardinality. `D-DATA-007` also remains unresolved and continues to block final Member/Membership lifecycle schema semantics.

The exact next bounded governance task from the synchronized ADR dependency queue is:

```text
Task 0018: Draft Data-Layer Tenant Isolation / RLS ADR
```

Primary decision:

```text
D-SEC-008
```

Likely target when explicitly started:

```text
docs/adr/ADR-0010-data-layer-tenant-isolation-rls.md
```

The next task should evaluate whether and how data-layer tenant isolation/RLS reinforces mandatory GymPulse application authorization across trusted application/service-role access, workers, provider callbacks, migration/admin paths, and any future direct-client proposal. It must keep application capability authorization mandatory and avoid treating RLS as a replacement for `D-ARCH-015`.

Do not create ADR-0010, database roles, or RLS policies merely because ADR-0009 exists.

## Legacy Migration State

Legacy flat architecture/database/API/automation/payment/notification/security/testing/engineering/open-decision files remain migration inputs until their useful material has canonical structured destinations and they are explicitly deprecated or replaced by pointers.

High-value migration sources include:

```text
05-system-architecture.md
06-database-schema.md
07-api-contracts.md
08-automations.md
09-payments-billing.md
10-notifications-whatsapp.md
12-security-audit.md
13-testing-qa.md
15-engineering-workflow.md
16-open-decisions.md
```

Do not delete or deprecate them merely because structured architecture documents now exist.

## Current Delivery Boundary

Phase 1 centers on member/membership management, QR and assisted attendance, inactivity detection, follow-up/return, renewals, verified payments, basic add-ons, owner operational views, notifications, consent, data quality, and audit history.

Workout programming, detailed nutrition tracking, health metrics, coaching platforms, advanced multi-branch workflows, and AI remain Future or outside active Phase 1 requirements until explicitly approved.
