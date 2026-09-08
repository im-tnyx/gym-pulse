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

`Deferred`, `Blocked`, `Open`, `Assumed`, `Proposed`, and `Decided` remain valid statuses in the canonical decision register. A draft ADR may remain `Proposed` while its canonical decision is still `OPEN`, `PROPOSED`, `DEFERRED`, or another non-decided state.

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
ADR-0010-data-layer-tenant-isolation-rls.md
```

Rules:

1. Never reuse an ADR number.
2. Number indicates creation order, not importance.
3. Use lower-case kebab-case after the number.
4. Renaming keeps the original ADR number.
5. A material replacement decision receives a new number.
6. Do not reserve speculative numbers before an ADR is actually drafted.

`ADR-0001` through `ADR-0010` now exist.

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

A decision-specific ADR may expand this structure when the subject requires additional explicit sections, while preserving the same governance information.

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

Task `0007-technology-stack` identified four material decisions that previously had no canonical IDs. Task `0008-technology-decision-register-normalization` registered them in `../00-overview/assumptions.md` without approving any candidate:

```text
D-ARCH-016  Primary implementation language/runtime
D-ARCH-017  Data-access/query/migration strategy
D-ARCH-018  Core automated testing toolchain
D-ARCH-019  CI/CD + production release/secrets tooling
```

Their registration means ADRs can reference canonical IDs. It does not mean TypeScript/Node.js, Drizzle/Kysely/Prisma, Vitest/Playwright, GitHub Actions, or any other candidate is accepted.

## 12. Current ADR Index

| ADR | Primary Decision | ADR Status | Canonical Status | Summary |
|---|---|---|---|---|
| `ADR-0001-modular-monolith.md` | `D-ARCH-005` | Proposed | PROPOSED | Proposes a Phase 1 modular monolith with explicit domain/application/component boundaries; no acceptance evidence exists. |
| `ADR-0002-primary-language-runtime.md` | `D-ARCH-016` | Proposed | PROPOSED | Proposes strict TypeScript with a supported Node.js LTS runtime while preserving framework/deployment/provider independence. |
| `ADR-0003-monorepo-strategy.md` | `D-ARCH-001` | Proposed | PROPOSED | Proposes an explicit monorepo with deliberate application/package boundaries and independent build/deployment artifacts. |
| `ADR-0004-database-engine.md` | `D-ARCH-002` | Proposed | PROPOSED | Proposes PostgreSQL as the canonical transactional database engine; PostgreSQL is not accepted. |
| `ADR-0005-data-access-migration-strategy.md` | `D-ARCH-017` | Proposed | PROPOSED | Proposes a Drizzle-oriented SQL-transparent persistence direction with explicit transactions and committed migrations; no tool is accepted. |
| `ADR-0006-managed-backend-responsibilities.md` | `D-ARCH-014` | Proposed | OPEN | Proposes selective managed infrastructure adoption by capability; no managed provider or direct-client DB topology is accepted. |
| `ADR-0007-authentication-session-architecture.md` | `D-ARCH-004` | Proposed | OPEN | Proposes managed authentication as a category with provider-independent GymPulse Principal resolution and server-mediated session posture. |
| `ADR-0008-member-authentication-method.md` | `D-SEC-002` | Proposed | OPEN | Proposes managed phone OTP/passwordless for routine Member verification with separate tenant-aware Member claiming/linking. |
| `ADR-0009-authorization-implementation.md` | `D-ARCH-015` | Proposed | PROPOSED | Proposes GymPulse-owned application authorization using named capabilities, trusted scopes/resources, Member-self relationships, and deny-by-default behavior. |
| `ADR-0010-data-layer-tenant-isolation-rls.md` | `D-SEC-008` | Proposed | OPEN | Proposes mandatory application authorization plus explicit tenant-scoped queries and, if PostgreSQL is later accepted, selective tenant-focused RLS as defense in depth. No RLS policy, role, migration, provider, or direct-client access is accepted. |

No ADR is currently `Accepted`.

## 13. Ordered ADR Backlog

The order reflects current GymPulse dependency reasoning. Presence in this backlog does not mean acceptance. The first ten ADRs have now been drafted; later ADR numbers are assigned only when a file is actually created.

| Order | Decision | Canonical ID | Current Status | Reason for Order |
|---:|---|---|---|---|
| 1 | Phase 1 architecture style: modular monolith before microservices | `D-ARCH-005` | PROPOSED / ADR-0001 drafted | Establishes decomposition/state-ownership boundaries. |
| 2 | Primary implementation language/runtime | `D-ARCH-016` | PROPOSED / ADR-0002 drafted | Cross-cuts web, API, jobs, providers, tests, and deployment. |
| 3 | Repository/monorepo strategy | `D-ARCH-001` | PROPOSED / ADR-0003 drafted | Determines source/package boundaries while preserving independent deployables. |
| 4 | Canonical database engine | `D-ARCH-002` | PROPOSED / ADR-0004 drafted | Persistence capabilities underpin transactions, constraints, reconciliation, and tenant isolation. |
| 5 | Data-access/query/migration strategy | `D-ARCH-017` | PROPOSED / ADR-0005 drafted | Defines transaction/query/migration mechanics while keeping provider/RLS/schema decisions separate. |
| 6 | Managed backend/platform responsibilities | `D-ARCH-014` | OPEN / ADR-0006 drafted | Defines managed commodity boundaries without surrendering application/domain/security ownership. |
| 7 | Authentication/session architecture | `D-ARCH-004` | OPEN / ADR-0007 drafted | Establishes identity/session boundary before authorization and provider binding. |
| 8 | Member authentication method | `D-SEC-002` | OPEN / ADR-0008 drafted | Proposes routine verification while separating Member claiming/recovery/authorization. |
| 9 | Authorization implementation boundary | `D-ARCH-015` | PROPOSED / ADR-0009 drafted | Defines application-owned capability + trusted scope/resource authorization. |
| 10 | Data-layer tenant isolation / RLS | `D-SEC-008` | OPEN / ADR-0010 drafted | Proposes independent tenant-row defense in depth beneath mandatory application authorization; PostgreSQL-specific RLS remains conditional. |
| 11 | Primary API contract architecture | `D-ARCH-003` | PROPOSED | Defines client/server contract shape independently of deployment topology and is now the next undrafted item in this dependency queue. |
| 12 | Owner/Staff web framework | `D-ARCH-012` | PROPOSED | Depends on language/runtime and must preserve thin framework boundaries. |
| 13 | Member client framework/delivery | `D-ARCH-013` | PROPOSED | Decide responsive web/PWA vs native from validated delivery needs. |
| 14 | API deployment boundary | `D-ARCH-006` | OPEN | Depends on API/web/runtime/auth/hosting constraints. |
| 15 | Background jobs/scheduler | `D-ARCH-007` | OPEN | Needed for retention, renewals, notifications, reconciliation, summaries, and data quality. |
| 16 | Hosting/deployment platform | `D-ARCH-009` | OPEN | Evaluate after API/jobs/database/managed-backend/jurisdiction decisions narrow. |
| 17 | CI/CD + production release/secrets tooling | `D-ARCH-019` | OPEN | Production binding depends on runtime/hosting while security gates remain explicit. |
| 18 | Core testing toolchain | `D-ARCH-018` | PROPOSED | Must fit approved runtime/database/web choices and preserve real-DB/negative security testing. |
| 19 | Package manager | `D-ARCH-011` | ASSUMED | Low-cost choice; finalize with repository/tooling governance. |
| 20 | Observability provider | `D-PROVIDER-006` | OPEN | Select after runtime/job/hosting topology is understood. |
| 21 | Object storage | `D-ARCH-010` | OPEN | Conditional on real receipt/export/protected-file requirements. |
| 22 | Payment provider | `D-PROVIDER-001` | OPEN | Depends on pilot methods, webhooks/refunds/reconciliation, fees, settlement, and support. |
| 23 | Messaging provider | `D-PROVIDER-002` | OPEN | Depends on launch channels, templates, consent/service policy, and support. |
| 24 | Product analytics provider | `D-PROVIDER-005` | OPEN | Remains non-canonical/provider-neutral until pilot instrumentation needs are concrete. |
| 25 | Redis/cache requirement | `D-ARCH-008` | OPEN | Introduce only for a demonstrated cache/coordination need. |
| 26 | Member vs Membership state ownership | `D-DATA-007` | PROPOSED | Must resolve before canonical lifecycle schema/state-machine finalization; can proceed in parallel with platform ADRs. |

## 14. ADR Batch Readiness

No ADR is accepted by this README.

### First foundation batch

```text
D-ARCH-005  Phase 1 architecture style               ADR-0001 drafted, Proposed
D-ARCH-016  Primary implementation language/runtime  ADR-0002 drafted, Proposed
D-ARCH-001  Repository/workspace strategy            ADR-0003 drafted, Proposed
D-ARCH-002  Canonical database engine                ADR-0004 drafted, Proposed
```

These define the initial implementation envelope but remain unaccepted.

### Second dependency/security batch

```text
D-ARCH-017  Data-access/query/migration strategy      PROPOSED / ADR-0005 drafted
D-ARCH-014  Managed backend responsibilities          OPEN / ADR-0006 drafted
D-ARCH-004  Authentication/session                    OPEN / ADR-0007 drafted
D-SEC-002   Member authentication                     OPEN / ADR-0008 drafted
D-ARCH-015  Authorization implementation              PROPOSED / ADR-0009 drafted
D-SEC-008   RLS/data-layer tenant isolation           OPEN / ADR-0010 drafted
```

`ADR-0010` preserves:

```text
Application Authorization = Mandatory
Data-Layer Tenant Isolation = Defense in Depth
RLS != Complete Authorization System
```

Its leading direction is conditional on PostgreSQL later being accepted: retain explicit tenant-scoped SQL and add selective tenant-focused RLS on materially tenant-owned canonical tables using policy-enforced runtime/worker access, separate migration/admin privilege, and transaction-safe tenant context where required. It does not accept PostgreSQL, Supabase or another provider, direct-client database access, any database role, any RLS policy, or any migration. Canonical `D-SEC-008` remains `OPEN`.

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

The C4 architecture, data-flow architecture, technology evaluation, technology-decision normalization, and `ADR-0001` through `ADR-0010` are complete at Draft/Proposed level.

The repository is **not** thereby implementation-ready. No ADR is Accepted. `D-ARCH-002`, `D-ARCH-017`, and `D-ARCH-015` remain `PROPOSED`; `D-ARCH-014`, `D-ARCH-004`, `D-SEC-002`, and `D-SEC-008` remain `OPEN`; other P0/P1 product/security/platform decisions remain unresolved.

`ADR-0010` does not deploy or accept RLS. It establishes a Proposed defense-in-depth architecture only, keeps explicit application tenant scoping, and keeps direct browser/mobile canonical database access unapproved.

The actual next bounded governance task in the current dependency queue is:

```text
Draft one Proposed ADR only:
D-ARCH-003 - Primary API Contract Architecture
```

Likely target when that task explicitly begins:

```text
docs/adr/ADR-0011-api-contract-architecture.md
```

That next ADR should define the primary client/server contract architecture while preserving deployment topology, framework, provider, authorization, and persistence decisions as separately governed.

Do not create ADR-0011 or API implementation as part of Task 0018.

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
- `ADR-0010-data-layer-tenant-isolation-rls.md`
- legacy migration source: `../05-system-architecture.md`
- legacy migration source: `../12-security-audit.md`
- legacy migration source: `../15-engineering-workflow.md`
- legacy migration source: `../16-open-decisions.md`
