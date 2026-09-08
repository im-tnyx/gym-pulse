# GymPulse Architecture Decision Records

## Document Control

- Document Maturity: `Draft`
- Scope: Architecture decision governance
- Canonical Decision Register: `../00-overview/assumptions.md`

## 1. Purpose

`docs/adr/` is the canonical home for Architecture Decision Records (ADRs) in GymPulse.

An ADR records one material technical decision, why it exists, the evidence and constraints considered, alternatives, the selected outcome when accepted, and the consequences of that outcome.

A technology appearing in a legacy architecture, schema, API, engineering document, or technology-evaluation document does **not** make it an accepted architectural decision.

## 2. Relationship to the Decision Register

`../00-overview/assumptions.md` owns:

- canonical decision IDs such as `D-ARCH-001`,
- priority,
- current decision status,
- unresolved question or proposed direction.

An ADR owns:

- detailed context,
- requirements and decision drivers,
- evidence,
- alternatives,
- tradeoffs,
- rationale,
- consequences,
- supersession history.

When an ADR becomes `Accepted`, the matching canonical decision must be updated to `DECIDED` with the ADR reference. If the two disagree, treat it as a documentation defect.

Legacy IDs from `../16-open-decisions.md` are migration aliases only. New ADRs use canonical IDs from `../00-overview/assumptions.md`.

## 3. ADR Statuses

ADR files use only these states:

```text
Proposed
Accepted
Rejected
Superseded
Deprecated
```

### Proposed

A concrete recommendation is ready for review but is not authoritative.

### Accepted

The authorized decision owner has explicitly approved the decision and approval evidence is recorded.

### Rejected

The proposal was reviewed and declined. Rejection does not automatically select another option.

### Superseded

A later Accepted ADR replaces the decision. Keep the old ADR for historical traceability.

### Deprecated

The decision is no longer applicable because the capability or architecture was retired.

`Deferred`, `Blocked`, `Open`, `Assumed`, `Proposed`, and `Decided` remain valid statuses in the canonical decision register. For example, a deferred architecture decision may have no ADR yet, or a draft ADR may remain `Proposed` while the register is `DEFERRED`.

## 4. Naming and Numbering

Use monotonically increasing four-digit numbers:

```text
ADR-0001-modular-monolith.md
ADR-0002-primary-language-runtime.md
ADR-0003-monorepo-strategy.md
ADR-0004-database-engine.md
ADR-0005-data-access-migration-strategy.md
ADR-0006-managed-backend-responsibilities.md
ADR-0007-authentication-session-architecture.md
ADR-0008-member-authentication-method.md
ADR-0009-authorization-implementation.md
```

Rules:

1. Never reuse an ADR number.
2. Number indicates creation order, not importance.
3. Use lower-case kebab-case after the number.
4. Renaming keeps the original ADR number.
5. A material replacement decision receives a new number.
6. Do not reserve speculative numbers before an ADR is actually drafted.

`ADR-0001` through `ADR-0009` now exist.

## 5. When an ADR Is Required

Create an ADR when a decision is expensive to reverse, affects several domains/runtimes, changes security or reliability risk, constrains future evolution, or introduces a major provider/platform dependency.

Typical examples:

- architecture style,
- primary implementation language/runtime,
- monorepo/repository strategy,
- database engine,
- data-access/migration strategy when it materially constrains persistence,
- managed backend/platform responsibility,
- authentication/session architecture,
- authorization implementation model,
- API contract/runtime boundary,
- background-job infrastructure,
- tenant-isolation/RLS strategy,
- hosting,
- payment/messaging providers,
- required cache/broker infrastructure,
- major state-model representation decisions,
- production release/secrets architecture when it creates material provider/security coupling.

Routine refactors, small UI-library choices, formatter/lint preferences, and low-impact reversible tooling usually do not need separate ADRs.

## 6. Required ADR Sections

Use this structure unless a section is genuinely irrelevant:

```markdown
# ADR-XXXX: Decision Title

## Status
Proposed

## Decision Metadata
- ADR: ADR-XXXX
- Primary Decision ID: D-...
- Related Decision IDs: ...
- Decision Owner: Open
- Technical Owner: Architecture
- Date Proposed: YYYY-MM-DD
- Date Accepted: Not accepted
- Supersedes: None
- Superseded By: None

## 1. Context
## 2. Requirements and Decision Drivers
## 3. Constraints and Assumptions
## 4. Options Considered
## 5. Evaluation
## 6. Proposed Decision / Decision
## 7. Consequences
## 8. Security and Privacy Impact
## 9. Reliability, Performance, and Scalability Impact
## 10. Operations and Observability Impact
## 11. Testing and Validation
## 12. Migration and Rollout
## 13. Reversibility
## 14. Risks and Mitigations
## 15. Open Questions
## 16. Decision Evidence
## 17. Related Documents
```

Unknown owners or evidence must be marked `Open`/`None`, not invented.

## 7. Requirement Traceability

ADRs should reference actual requirement IDs that drive the choice.

Examples:

```text
NFR-SECURITY-001
NFR-RELIABILITY-001
NFR-SCALABILITY-002
NFR-MAINTAINABILITY-006
FR-AUTHZ-001
FR-PAYMENT-005
```

Target traceability:

```text
Requirement
  -> Architecture Principle
  -> Canonical Decision ID
  -> ADR
  -> Implementation
  -> Test / Operations
```

Do not invent a requirement ID inside an ADR. If a required requirement does not exist, update the canonical requirement owner first.

## 8. Decision Workflow

```text
Canonical decision exists
  -> collect constraints/evidence
  -> draft ADR as Proposed
  -> architecture/security/product review as applicable
  -> explicit outcome
      -> Accepted
      -> Rejected
      -> remain Proposed while more evidence is needed
  -> synchronize assumptions.md
  -> update affected canonical docs
  -> implement only after the implementation gate permits it
  -> validate through tests/operations
```

A merged file, prototype, deployed package, provisioned provider, or technology recommendation is not acceptance evidence by itself.

## 9. Acceptance Requirements

Before an ADR becomes `Accepted`:

1. its primary canonical decision ID exists,
2. relevant FR/NFR drivers are linked,
3. meaningful alternatives are documented,
4. material security/reliability/operations consequences are reviewed,
5. evidence gaps are resolved or explicitly accepted as risk,
6. a decision owner is identified,
7. explicit approval evidence is recorded,
8. `assumptions.md` is synchronized to `DECIDED`,
9. affected canonical documents are identified for update.

## 10. Supersession Rules

Do not rewrite historical rationale in an Accepted ADR when architecture changes.

To replace it:

1. create a new ADR,
2. reference the old ADR in `Supersedes`,
3. review and accept the new ADR,
4. mark the old ADR `Superseded`,
5. add `Superseded By`,
6. update the canonical decision register,
7. document migration and rollback/forward-fix implications.

Use `Deprecated` when a decision becomes irrelevant without a direct replacement.

## 11. Technology-Evaluation Normalization

Task `0007-technology-stack` identified four material decisions that previously had no canonical IDs. Task `0008-technology-decision-register-normalization` registers them in `../00-overview/assumptions.md` without approving any candidate:

```text
D-ARCH-016  Primary implementation language/runtime
D-ARCH-017  Data-access/query/migration strategy
D-ARCH-018  Core automated testing toolchain
D-ARCH-019  CI/CD + production release/secrets tooling
```

Their registration means future ADRs can reference canonical IDs. It does not mean TypeScript/Node.js, Drizzle/Kysely/Prisma, Vitest/Playwright, GitHub Actions, or any other candidate is accepted.

## 12. Current ADR Index

| ADR | Primary Decision | Status | Summary |
|---|---|---|---|
| `ADR-0001-modular-monolith.md` | `D-ARCH-005` | Proposed | Proposes a Phase 1 modular monolith with explicit domain/application/component boundaries; compares Phase 1 microservices and an unstructured single application. No acceptance evidence exists yet. |
| `ADR-0002-primary-language-runtime.md` | `D-ARCH-016` | Proposed | Proposes strict TypeScript with a supported Node.js LTS runtime; compares JVM, Go, Python, and untyped JavaScript alternatives while preserving framework/deployment/provider independence. No acceptance evidence exists yet. |
| `ADR-0003-monorepo-strategy.md` | `D-ARCH-001` | Proposed | Proposes an explicit monorepo with deliberate application/package boundaries, independent build/deployment artifacts, and client-safe/server-only enforcement; compares multi-repository and unstructured single-repository alternatives. No acceptance evidence exists yet. |
| `ADR-0004-database-engine.md` | `D-ARCH-002` | Proposed | Proposes PostgreSQL as the canonical transactional database engine; compares MySQL/MariaDB, document/NoSQL-first, and distributed SQL alternatives while keeping schema, provider, RLS, ORM/query tooling, hosting, and jobs separate. No acceptance evidence exists yet. |
| `ADR-0005-data-access-migration-strategy.md` | `D-ARCH-017` | Proposed | Proposes a Drizzle-oriented SQL-transparent TypeScript persistence strategy with application-owned transactions, generated/reviewed committed SQL migrations, custom/raw SQL escape paths, and future RLS compatibility. PostgreSQL and the tool remain unaccepted. |
| `ADR-0006-managed-backend-responsibilities.md` | `D-ARCH-014` | Proposed | Proposes selective managed infrastructure adoption by capability, with integrated platforms such as Supabase eligible candidates rather than application-architecture owners. Database, Auth, Storage, RLS, jobs, hosting, observability, and direct-client access remain separately governed; no provider is accepted. |
| `ADR-0007-authentication-session-architecture.md` | `D-ARCH-004` | Proposed | Proposes a managed-authentication-provider category with provider-independent AuthIdentity mapping, GymPulse Principal resolution, current tenant/capability authorization, and a secure server-mediated staff-web session posture. No provider, member method, exact session policy, or MFA mandate is accepted; `D-ARCH-004` remains canonically `OPEN`. |
| `ADR-0008-member-authentication-method.md` | `D-SEC-002` | Proposed | Proposes managed phone OTP/passwordless as the primary Phase 1 member-verification method, with explicit tenant-aware `AuthIdentity -> Principal -> Member` claiming/linking and stronger recovery/re-link handling for ambiguous, reassigned, already-claimed, or high-risk cases. No Auth/SMS/email provider or exact OTP/session policy is accepted; `D-SEC-002` remains canonically `OPEN`. |
| `ADR-0009-authorization-implementation.md` | `D-ARCH-015` | Proposed | Proposes a GymPulse-owned provider-independent application authorization module using stable named capabilities, scoped assignments, trusted resource ownership, explicit Member-self relationships, deny-by-default behavior, and bounded system/provider contexts. Provider claims, framework middleware, RLS, and external policy engines are not sole authorities; no library/service/schema/cache is accepted. |

No ADR is currently `Accepted`.

## 13. Ordered ADR Backlog

The order reflects current GymPulse dependency reasoning after the technology evaluation. Presence in this backlog does not mean acceptance. The first nine ADRs have now been drafted; later ADR numbers are assigned only when a file is actually created.

| Order | Decision | Canonical ID | Current Status | Reason for Order |
|---:|---|---|---|---|
| 1 | Phase 1 architecture style: modular monolith before microservices | `D-ARCH-005` | PROPOSED / ADR-0001 drafted | Establishes decomposition and state-ownership boundaries before implementation structure. |
| 2 | Primary implementation language/runtime | `D-ARCH-016` | PROPOSED / ADR-0002 drafted | Cross-cuts web, API, jobs, provider adapters, testing, and deployment; should be explicit before scaffold commitments. |
| 3 | Repository/monorepo strategy | `D-ARCH-001` | PROPOSED / ADR-0003 drafted | Determines shared source/package boundaries and how independently deployable applications evolve together. |
| 4 | Canonical database engine | `D-ARCH-002` | PROPOSED / ADR-0004 drafted | Transactions, constraints, idempotency, reconciliation, reporting, and tenant isolation depend on persistence capabilities. |
| 5 | Data-access/query/migration strategy | `D-ARCH-017` | PROPOSED / ADR-0005 drafted | Defines transaction/query/migration mechanics while keeping database/provider/RLS/schema decisions separate. |
| 6 | Managed backend/platform responsibilities | `D-ARCH-014` | OPEN / ADR-0006 drafted | Defines which commodity responsibilities may be managed while keeping platform features subordinate to GymPulse application/domain/security ownership. |
| 7 | Authentication/session architecture | `D-ARCH-004` | OPEN / ADR-0007 drafted | Defines provider-independent identity mapping, principal resolution, secure session transport, revocation/logout capability, and provider responsibility boundaries without changing canonical status. |
| 8 | Member authentication method | `D-SEC-002` | OPEN / ADR-0008 drafted | Proposes routine managed phone OTP/passwordless while separating verified-channel proof from tenant-aware Member claiming, recovery, authorization, and session policy. |
| 9 | Authorization implementation boundary | `D-ARCH-015` | PROPOSED / ADR-0009 drafted | Proposes application-owned capability + trusted tenant/resource authorization while keeping provider claims, middleware, RLS, and policy services subordinate/separate. |
| 10 | Data-layer tenant isolation / RLS | `D-SEC-008` | OPEN | Depends on database/managed-backend/service-role topology; defense in depth only. |
| 11 | Primary API contract architecture | `D-ARCH-003` | PROPOSED | Defines client/server contract shape independently of deployment topology. |
| 12 | Owner/Staff web framework | `D-ARCH-012` | PROPOSED | Depends on language/runtime and must preserve thin framework boundaries. |
| 13 | Member client framework/delivery | `D-ARCH-013` | PROPOSED | Decide responsive web/PWA vs native according to validated QR/auth/notification/offline needs. |
| 14 | API deployment boundary | `D-ARCH-006` | OPEN | Separate from API contract style; depends on web/runtime/auth/hosting constraints. |
| 15 | Background jobs/scheduler | `D-ARCH-007` | OPEN | Needed for no-show, renewal, notifications, reconciliation, owner summaries, and data quality. |
| 16 | Hosting/deployment platform | `D-ARCH-009` | OPEN | Evaluate after API, jobs, database/managed backend, and jurisdiction constraints are narrowed. |
| 17 | CI/CD + production release/secrets tooling | `D-ARCH-019` | OPEN | Production pipeline binding depends on runtime/hosting while security gates must remain explicit. |
| 18 | Core testing toolchain | `D-ARCH-018` | PROPOSED | Tooling should fit approved runtime/database/web choices while preserving real DB and negative authorization coverage. |
| 19 | Package manager | `D-ARCH-011` | ASSUMED | Low-cost choice; finalize with repository/tooling decision rather than treating legacy pnpm use as fact. |
| 20 | Observability provider | `D-PROVIDER-006` | OPEN | Select after runtime/job/hosting topology is understood; capability requirements already exist. |
| 21 | Object storage | `D-ARCH-010` | OPEN | Required only when receipts/exports/protected files need durable object storage. |
| 22 | Payment provider | `D-PROVIDER-001` | OPEN | Depends on pilot payment methods, webhook/refund/reconciliation, fees, settlement, and support requirements. |
| 23 | Messaging provider | `D-PROVIDER-002` | OPEN | Depends on approved launch channels, templates, consent/service policy, and operational support. |
| 24 | Product analytics provider | `D-PROVIDER-005` | OPEN | Non-canonical analytics can remain provider-neutral until pilot instrumentation questions are concrete. |
| 25 | Redis/cache requirement | `D-ARCH-008` | OPEN | Decide only after a measured cache/queue/coordination need exists. |
| 26 | Member vs Membership state ownership | `D-DATA-007` | PROPOSED | Resolve before canonical domain/schema/state-machine finalization; it can proceed in parallel with platform ADRs but blocks schema semantics. |

## 14. ADR Batch Readiness

No ADR is accepted by this README.

### First foundation batch

The foundation group is:

```text
D-ARCH-005  Phase 1 architecture style              ADR-0001 drafted, Proposed
D-ARCH-016  Primary implementation language/runtime ADR-0002 drafted, Proposed
D-ARCH-001  Repository/workspace strategy           ADR-0003 drafted, Proposed
D-ARCH-002  Canonical database engine               ADR-0004 drafted, Proposed
```

These decisions define the initial implementation envelope without selecting auth, provider, job, or hosting products.

Draft and review them separately. Do not mark any as `Accepted` merely because the recommendation is strong.

### Second dependency batch

```text
D-ARCH-017  Data-access/query/migration strategy      PROPOSED / ADR-0005 drafted
D-ARCH-014  Managed backend responsibilities          OPEN / ADR-0006 drafted
D-ARCH-004  Authentication/session                    OPEN / ADR-0007 drafted
D-SEC-002   Member authentication                     OPEN / ADR-0008 drafted
D-ARCH-015  Authorization implementation              PROPOSED / ADR-0009 drafted
D-SEC-008   RLS/data-layer tenant isolation           OPEN
```

`ADR-0005` is conditional on compatible final runtime/database decisions and does not accept PostgreSQL, Drizzle, RLS, or a managed backend.

`ADR-0006` proposes selective managed infrastructure responsibilities but does not accept Supabase or another provider, PostgreSQL, Auth, Storage, RLS, jobs, hosting, or direct-client database access. Its canonical decision `D-ARCH-014` remains `OPEN` pending review/approval evidence.

`ADR-0007` proposes managed authentication as an architecture category with explicit GymPulse identity/principal mapping and secure server-mediated staff-web session transport. It does not accept Supabase Auth, Clerk, Auth0, Keycloak, member OTP/passwordless, exact session lifetime/device policy, MFA policy, or a GymPulse opaque session store. Its canonical decision `D-ARCH-004` remains `OPEN` pending review/approval evidence.

`ADR-0008` proposes managed phone OTP/passwordless as the routine Phase 1 member-verification method, but channel verification is explicitly separated from GymPulse Member claiming/linking. Ambiguous, reassigned, already-claimed, recovery, and channel-change cases require controlled higher-assurance handling. No Auth, SMS, email, or business-messaging provider is accepted; exact OTP and session policy remain separate. Canonical `D-SEC-002` remains `OPEN` pending review/approval evidence.

`ADR-0009` proposes a GymPulse-owned provider-independent authorization module using stable named capabilities, roles as capability bundles, current scoped assignments, trusted resource ownership, explicit Member-self relationships, deny-by-default behavior, and bounded non-human execution contexts. Provider claims, framework middleware, RLS, and external policy engines are not the sole authority. No authorization library/service, policy engine, schema, RLS policy, Redis/cache, or full permission matrix is accepted. Canonical `D-ARCH-015` remains `PROPOSED` pending review/approval evidence.

### Third runtime/operations batch

```text
D-ARCH-003     API contract architecture
D-ARCH-012     Owner/Staff framework
D-ARCH-013     Member client strategy
D-ARCH-006     API deployment topology
D-ARCH-007     Background jobs
D-ARCH-009     Hosting
D-ARCH-019     CI/CD + release/secrets tooling
D-ARCH-018     Testing toolchain
D-PROVIDER-006 Observability provider
```

Payment and messaging provider ADRs should follow confirmed pilot methods/channels and provider-specific evidence rather than being forced into the foundation batch.

## 15. Current Governance Gate

The C4 architecture, data-flow architecture, technology evaluation, and technology decision-gap normalization are complete at Draft level. `ADR-0001` through `ADR-0009` now exist as `Proposed` decision records.

The repository is **not** thereby implementation-ready. `D-ARCH-005`, `D-ARCH-016`, `D-ARCH-001`, `D-ARCH-002`, `D-ARCH-017`, and `D-ARCH-015` remain `PROPOSED`; `D-ARCH-014`, `D-ARCH-004`, `D-SEC-002`, and `D-SEC-008` remain `OPEN` where applicable; other P0/P1 decisions also remain unresolved because no authorized approval evidence exists.

The actual next bounded governance task in the current dependency queue is:

```text
Draft one Proposed ADR only:
D-SEC-008 - Data-Layer Tenant Isolation / RLS
```

Suggested target when the task begins:

```text
docs/adr/ADR-0010-data-layer-tenant-isolation-rls.md
```

That ADR should define whether and how data-layer tenant isolation/RLS reinforces the mandatory application authorization boundary. It should evaluate trusted application/service-role access, background jobs, provider callbacks, migration/admin paths, current database/managed-backend proposals, direct-client-access implications, fail-closed behavior, policy observability/testing, and operational recovery while keeping `D-ARCH-015` application authorization mandatory and separately governed.

Do not create ADR-0010, RLS policies, database roles, or authorization implementation as part of Task 0017.

## 16. Related Documents

- `../README.md`
- `../00-overview/assumptions.md`
- `../01-product/functional-requirements.md`
- `../01-product/non-functional-requirements.md`
- `../02-architecture/architecture-principles.md`
- `../02-architecture/architecture-overview.md`
- `../02-architecture/container-architecture.md`
- `../02-architecture/component-architecture.md`
- `../02-architecture/data-flow.md`
- `../02-architecture/technology-stack.md`
- `ADR-0001-modular-monolith.md`
- `ADR-0002-primary-language-runtime.md`
- `ADR-0003-monorepo-strategy.md`
- `ADR-0004-database-engine.md`
- `ADR-0005-data-access-migration-strategy.md`
- `ADR-0006-managed-backend-responsibilities.md`
- `ADR-0007-authentication-session-architecture.md`
- `ADR-0008-member-authentication-method.md`
- `ADR-0009-authorization-implementation.md`
- legacy migration source: `../05-system-architecture.md`
- legacy migration source: `../15-engineering-workflow.md`
- legacy migration source: `../16-open-decisions.md`
