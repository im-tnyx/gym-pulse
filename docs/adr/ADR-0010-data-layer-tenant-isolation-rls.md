# ADR-0010: Data-Layer Tenant Isolation and Row-Level Security

## Status

`Proposed`

## Decision Metadata

- ADR: `ADR-0010`
- Primary Decision ID: `D-SEC-008`
- Related Decision IDs: `D-SEC-003`, `D-ARCH-015`, `D-ARCH-004`, `D-SEC-002`, `D-ARCH-002`, `D-ARCH-017`, `D-ARCH-014`, `D-ARCH-006`, `D-ARCH-007`, `D-ARCH-009`, `D-ARCH-018`, `D-DATA-004`, `D-DATA-007`
- Decision Owner: `@im-tnyx` — directly self-confirmed 2026-10-16 in [human GitHub comment](https://github.com/im-tnyx/gym-pulse/issues/2#issuecomment-6214567976); repository admin permission observed; no ADR approval implied
- Technical Owner: `Security / Architecture / Data Architecture`
- Date Proposed: `2026-09-08`
- Date Accepted: `Not accepted`
- Supersedes: `None`
- Superseded By: `None`

## 1. Context

GymPulse is designed as a multi-tenant SaaS system from the data and authorization boundary even when an initial pilot contains one organization, gym, or branch. Cross-tenant disclosure or mutation is a release-blocking security failure.

The trusted Phase 1 path is currently:

```text
Client
  -> Trusted GymPulse Runtime
  -> Authentication / Principal Resolution
  -> Application Authorization
  -> Application / Domain
  -> Data Access
  -> Canonical Persistence
```

`ADR-0009` proposes a provider-independent application authorization boundary:

```text
verified Principal
  + current account eligibility
  + current tenant/resource scope
  + current named capability or Member-self relationship
  + trusted resource relationship
  -> allow / deny
```

This ADR evaluates the independent persistence-layer backstop that should sit below that application authorization boundary.

The governing invariant is:

```text
Application Authorization = Mandatory

Data-Layer Tenant Isolation = Defense in Depth

RLS != Complete Authorization System
```

The architecture must reject both of these false choices:

```text
RLS instead of application authorization
```

and:

```text
application authorization means database isolation is unnecessary
```

The controls address different failure modes. Application authorization decides whether the current Principal or trusted system context may perform a protected operation on a resource. Data-layer isolation limits which tenant-owned rows a database access path can see or mutate if application/data-access code contains a defect or a trusted process is incorrectly scoped.

The primary defects this ADR is intended to contain include:

```text
missing tenant predicate
wrong tenant identifier
incorrect repository filter
unsafe join
background job scope loss
accidental global query
new feature bypassing a shared data-access helper
misconfigured read model
bulk operation scope error
```

`D-SEC-008` remains canonically `OPEN`. This ADR creates a concrete proposal for review; it does not promote `D-SEC-008` to `DECIDED`.

`D-SEC-003` remains `PROPOSED` and states that tenant isolation must be enforced server-side and reinforced at the data layer where practical.

`D-ARCH-002` is `DECIDED` via accepted ADR-0004, so PostgreSQL is the canonical transactional database engine. PostgreSQL Row-Level Security is therefore the primary database-native tenant-isolation mechanism evaluated by this ADR; whether GymPulse adopts RLS remains independently governed by `D-SEC-008`.

`D-ARCH-017` remains `PROPOSED`; no ORM/query-builder/migration product is accepted here. `D-ARCH-014` remains `OPEN`; PostgreSQL RLS does not imply Supabase or another managed platform. Direct browser/mobile canonical database access remains unapproved.

## 2. Requirements and Decision Drivers

### 2.1 Functional requirements

Verified primary requirements include:

- `FR-AUTHZ-001`: every protected operation is authorized against organization/gym/branch scope where applicable.
- `FR-AUTHZ-002`: protected mutations use named capabilities rather than UI visibility or client role checks alone.
- `FR-AUTHZ-003`: normal Member-facing APIs must prevent one Member from accessing another Member's protected records.
- `FR-MEMBER-005`: authorized staff Member search is limited to Members in authorized scope.
- `FR-ATTENDANCE-009`: Member attendance history is self-scoped and staff history is limited to authorized scope.
- `FR-RETENTION-006`: the no-show queue is exposed to authorized Owner/Staff users.
- `FR-DASHBOARD-004`: dashboard metrics drill down to underlying records, so derived/read-model access must preserve tenant scope.
- `FR-AUDIT-003`: audit history preserves actor, action, resource, time, and tenant context.
- `FR-CROSS-001`: clients are not authoritative for authorization or canonical business truth.
- `FR-CROSS-003`: tenant/gym/branch context is explicit in protected requests, relevant data relationships, and background jobs.

Related import/export/provider workflows also require tenant-safe canonical writes and reads. The ADR does not create new functional requirements.

### 2.2 Non-functional requirements

Security and privacy:

- `NFR-SECURITY-001`: tenant isolation across users, jobs, APIs, analytics, storage, and exports, including negative authorization tests.
- `NFR-SECURITY-002`: least privilege with explicit role/capability scope.
- `NFR-SECURITY-003`: server-side authorization for every protected operation.
- `NFR-SECURITY-004`: database credentials and other secrets remain protected and out of client bundles/source control.
- `NFR-SECURITY-009`: sensitive actions are attributable to a human actor or trusted system process with tenant context.
- `NFR-SECURITY-011`: errors/logs do not disclose cross-tenant identifiers or unnecessary private information.
- `NFR-PRIVACY-003`: exports enforce authorization scope and should be auditable.

Reliability and data correctness:

- `NFR-RELIABILITY-004`: correctness-critical uniqueness and relational invariants should be reinforced at the database layer where practical.
- `NFR-RELIABILITY-005`: canonical state comes from trusted server-side system-of-record data.

Testability:

- `NFR-TESTABILITY-004`: critical capabilities/scopes require positive and negative authorization matrix tests.

Performance and scale:

- `NFR-PERFORMANCE-002`: Member search uses indexed server-side filtering.
- `NFR-PERFORMANCE-003`: action queues are bounded/paginated and appropriately indexed.
- `NFR-PERFORMANCE-004`: dashboard queries avoid normal-path N+1 behavior and expensive full-table scans.
- `NFR-PERFORMANCE-006`: Member-facing APIs return bounded, purpose-specific data rather than unrelated Owner or Member records.
- `NFR-SCALABILITY-006`: operational queries should index tenant/branch plus relevant status/date fields.

Operational/migration requirements also include `NFR-MAINTAINABILITY-004` for committed/auditable schema-change mechanisms and environment-specific production secret separation.

### 2.3 Architecture drivers

Especially relevant architecture principles are:

- `ARCH-PRIN-001` Tenant Isolation by Design.
- `ARCH-PRIN-002` Authentication and Authorization Are Separate Responsibilities.
- `ARCH-PRIN-003` Capability-Based Permissions.
- `ARCH-PRIN-004` Deterministic Server-Side Business Truth.
- `ARCH-PRIN-007` Auditable Sensitive Mutations.
- `ARCH-PRIN-009` Explicit Domain and State Ownership.
- `ARCH-PRIN-010` Transactional Consistency for Correctness-Sensitive Changes.
- `ARCH-PRIN-013` Failure Visibility and Reconciliation.
- `ARCH-PRIN-014` Observability by Design.
- `ARCH-PRIN-015` Data Minimization and Purpose Separation.
- `ARCH-PRIN-016` Secure Defaults and Least Privilege.
- `ARCH-PRIN-018` No Premature Infrastructure.
- `ARCH-PRIN-019` Evolution Through Explicit Decisions.

## 3. Constraints and Assumptions

1. `D-SEC-008` remains `OPEN`; this ADR is only `Proposed`.
2. `D-SEC-003` remains `PROPOSED`; this ADR does not silently decide it.
3. `D-ARCH-015` remains `PROPOSED`; `ADR-0009` is also only Proposed. Application authorization remains mandatory regardless of database defenses.
4. `D-ARCH-004` and `D-SEC-002` remain `OPEN`; authentication/session and Member verification are separate decisions.
5. `D-ARCH-002` is `DECIDED`; PostgreSQL is accepted by ADR-0004, not by this ADR. `D-SEC-008` remains independently open.
6. `D-ARCH-017` remains `PROPOSED`; no Drizzle, Kysely, Prisma, or other persistence tool is selected or installed.
7. `D-ARCH-014` remains `OPEN`; RLS does not select Supabase or another managed backend/provider.
8. `D-ARCH-006`, `D-ARCH-007`, and `D-ARCH-009` remain `OPEN`; RLS/context design must not silently select API topology, job technology, or hosting.
9. `D-ARCH-018` remains separately governed; this ADR specifies required test behavior but not a testing framework.
10. `D-DATA-004` remains `PROPOSED`; `Member`, `AuthIdentity`, and Principal remain separate concepts.
11. `D-DATA-007` remains unresolved. Tenant isolation can proceed conceptually without deciding Member/Membership lifecycle semantics.
12. Direct browser/mobile mutation of canonical persistence is not an approved baseline. The trusted server runtime remains in the Phase 1 business path.
13. Shared canonical persistence with explicit tenant ownership remains the current architecture direction. This ADR does not finalize physical schema, table names, tenant columns, indexes, database roles, or migrations.
14. Application SQL should continue to reason explicitly about tenant scope even if database RLS is later adopted.
15. RLS, if adopted, is intentionally narrower than the full GymPulse authorization model.
16. RLS must not own membership entitlement, attendance eligibility, payment verification, refund approval, payment exactly-once effects, no-show policy, renewal eligibility, pricing policy, capability semantics, or domain state transitions.
17. Data-layer isolation must protect both reads and writes for the rows/tables it covers.
18. No default tenant may exist for a missing or malformed tenant context.
19. A trusted System Principal/job context does not imply PostgreSQL superuser, table-owner, or `BYPASSRLS` access.
20. Provider callbacks do not receive tenant-unrestricted database privilege merely because their upstream provider evidence was verified.
21. Database backup files, administrative access, and replicas require separate infrastructure/security controls because RLS protects normal query paths, not raw storage artifacts.
22. Referential integrity, uniqueness, transactions, authorization, and tenant isolation are complementary controls. None replaces the others.

## 4. Threat Model and Isolation Goals

### 4.1 Primary isolation goal

For tenant-owned canonical data, a defect in application/data-access code should not be sufficient by itself to disclose or mutate another tenant's rows when a practical independent database backstop can prevent it.

A strong defense-in-depth design is intentionally independent:

```text
untrusted client input
  -> trusted Principal and authorized tenant resolved by application
  -> trusted runtime establishes bounded database tenant context
  -> data-layer isolation compares trusted context with stored row ownership
```

The following is not sufficient independence:

```text
client sends tenant_id
application trusts tenant_id
RLS trusts the same unverified tenant_id
```

### 4.2 Threat/control matrix

| Threat | Application control | Database control | Operational control / test | Residual or unresolved risk |
|---|---|---|---|---|
| Missing tenant predicate | Scope-aware application/data-access API and code review | Selective tenant RLS if adopted | Intentionally unsafe-query negative test | Coverage mistakes if a tenant-owned table is omitted from policy classification |
| Malicious tenant ID substitution | Resolve Principal + trusted resource ownership; reject client authority | Compare trusted DB tenant context to stored ownership | Cross-tenant request tests | Resource ownership schema must be correct |
| Incorrect join | Query scoping and review | RLS on protected base tables can limit reachable rows | Real DB join tests | Complex views/functions may change effective security context |
| BOLA/IDOR slipping past repository | `ADR-0009` resource authorization | Tenant isolation backstop limits cross-tenant rows, not same-tenant capability misuse | BOLA and same/cross-tenant matrices | RLS does not replace same-tenant capability/Member-self authorization |
| Worker loses tenant context | Explicit System Context, one-tenant work unit | Missing DB context denies if policy model requires context | Job-context + pool-reuse tests | Global discovery path needs explicit separate design |
| Connection-pool tenant bleed | Transaction-bound context lifecycle | Transaction-local context instead of uncontrolled session state | Tenant A -> Tenant B same-connection test and rollback test | Pooler/runtime behavior must be validated for selected platform |
| Service-role misuse | No privileged credential in normal runtime | Normal runtime role must not bypass intended RLS | Credential/use monitoring and role-behavior tests | Managed platform-specific privilege semantics need verification |
| Migration credential misuse | Separate release/admin path | Migration/schema-owner privilege separated from app runtime | Detect privileged role outside deployment | Break-glass and migration credential lifecycle still needs operational policy |
| Table-owner RLS bypass | Runtime must not use schema/table owner | Use non-owner, non-BYPASSRLS runtime role; evaluate FORCE RLS where justified | Explicit owner/bypass tests | Exact role topology deferred until DB/provider decisions |
| Policy misconfiguration | Application remains an independent control | Default-deny posture and simple tenant predicates | Policy unit/integration matrix | Policy itself can be wrong; review/testing is mandatory |
| Policy drift across environments | Docs/migration discipline | Policies versioned with controlled DB migrations | Drift checks/staging rollout | Exact drift tooling deferred |
| Privileged function bypass | Application does not depend on hidden DB escape hatches | Avoid unnecessary privileged functions; tightly govern if ever used | Security review + function privilege/search-path tests | Exact function use deferred |
| Cross-tenant export | Explicit `export.create` + tenant scope | RLS can constrain accidental broad export reads | Export scope tests and audit | RLS does not grant export capability |
| Future direct-client policy bypass | Not approved; trusted runtime remains mandatory today | Would require materially stronger RLS/grant/member policy model if ever approved | Dedicated P0 direct-client security assurance | Future topology not decided |

### 4.3 Isolation scope

Data-layer tenant isolation primarily addresses row visibility and mutation boundaries. It is not the correct home for application/domain decisions such as:

```text
attendance eligibility
membership entitlement
refund authority
payment verification
payment effect idempotency
no-show policy
role/capability business semantics
pricing
renewal eligibility
business state transitions
```

Those remain application/domain responsibilities.

## 5. Data Ownership and Access Paths

### 5.1 Conceptual data ownership categories

Not every database object needs the same policy. Later schema work should classify objects before policy rollout.

| Category | Examples conceptually | Default RLS/data-isolation posture |
|---|---|---|
| Tenant-owned business data | Members, Memberships, Attendance, Retention, Renewals, Payments, Add-ons, tenant audit/business history | Strong candidate for explicit tenant scoping and selective tenant RLS if PostgreSQL is accepted |
| Tenant-scoped configuration | gym/branch settings, plan/risk/renewal configuration | Strong candidate when records are tenant-specific and sensitive |
| Global reference/catalog data | immutable/common reference values intended for all tenants | Do not force tenant policy merely because RLS exists; normal grants/immutability controls may be sufficient |
| Platform/system metadata | migration metadata, technical catalog, provider integration metadata not representing tenant business rows | Govern by purpose and privilege; not automatically tenant RLS |
| Cross-tenant operational metadata | tenant registry/discovery metadata required for schedulers/platform operations | Separate narrow privileged path; do not weaken all business-row policies to support discovery |

This ADR does not finalize a table classification.

### 5.2 Shared-schema ownership invariant

Tenant-owned records must contain or safely derive organization/gym/branch ownership according to the approved data model.

Conceptual hierarchy:

```text
Organization
  -> Gym
      -> Branch
          -> tenant-owned business resources
```

The policy invariant is stable even if the final table/column representation changes.

### 5.3 Direct versus derived ownership

Two patterns are valid candidates.

**Direct ownership** means the row carries a direct tenant/gym/branch reference needed for isolation.

**Derived ownership** means ownership is determined through a trusted relationship chain, for example conceptually:

```text
Payment
  -> Renewal Order
  -> Membership
  -> Member
  -> Gym
```

Direct ownership can be preferable on high-volume or security-critical records when it materially improves:

- policy simplicity,
- query/index clarity,
- fewer joins in security predicates,
- safer bulk operations,
- easier negative testing,
- operational diagnosis.

Derived ownership can avoid redundant fields when the relationship is short, stable, indexed, and unambiguous.

If later schema work introduces redundant direct tenant ownership for defense in depth, it must also preserve integrity so the redundant tenant reference cannot silently disagree with the referenced parent. Candidate later patterns include tenant-aware composite constraints, trusted ownership checks, or equivalent relational protections. This ADR does not choose one.

### 5.4 Access-path matrix

| Access path | Application auth required? | RLS/data-layer isolation enforced? | Trusted tenant context source | Privileged bypass allowed? |
|---|---|---|---|---|
| Interactive staff request | Yes | Yes on covered tenant-owned tables if selective RLS is later adopted | Verified Principal + current scoped assignment/resource ownership | No in normal runtime |
| Member self-service request | Yes, including explicit Member-self relation | Yes at tenant layer if adopted; Member-self remains application-owned in current topology | Verified Principal + explicit Member-self link + resolved tenant/resource | No |
| Background tenant job | Bounded System Context/application use case required | Yes on covered tables if adopted | Validated job tenant/gym/branch scope from canonical job context | No for ordinary tenant job |
| Cross-tenant scheduler/discovery | Separate bounded system authorization | Tenant business-table RLS should not be globally weakened; use narrow registry/discovery path | Controlled platform/system metadata path | Only a separately governed minimal discovery privilege if needed |
| Verified provider callback | Provider verification + bounded application use case | Yes after internal resource/tenant resolution if adopted | Verified provider reference -> canonical internal resource -> tenant | No generic bypass |
| Migration process | Release/admin authorization, not end-user capability authorization | May require policy/schema-owner privilege for controlled changes | Deployment/environment identity, not a tenant session | Yes only for the dedicated controlled migration/admin path as required |
| Break-glass/admin | Explicit operational authorization/reason | May use privileged path only when necessary | Approved incident/admin context | Possible only as rare, auditable, time-bounded/restricted access where practical |
| Reporting/read-only operational path | Explicit purpose + tenant/platform authorization | Prefer policy-enforced/tenant-by-tenant reads for tenant data | Authorized reporting scope | No normal blanket bypass |
| Future direct-client access | Not approved; would require new security architecture | If ever approved, RLS/grants become a P0 application-security boundary | Provider-verified identity/JWT plus approved policy model | Never through client-held bypass credentials |

### 5.5 Tenant-context matrix

| Execution context | Trusted context derivation | Database-context posture if RLS uses runtime tenant context | Missing/invalid context behavior |
|---|---|---|---|
| HTTP request | Authentication -> Principal -> current application authorization -> trusted tenant/resource | Establish tenant context only after authorization; bind it to the intended transaction/query unit | Fail closed; no default tenant |
| Background tenant job | Validated job type + explicit tenant/gym scope + current-state recheck | One tenant-scoped execution/transaction at a time where practical | Fail job safely; never fall back to global business-row access |
| Provider callback | Verify provider evidence -> resolve internal payment/message/auth relation -> resolve tenant | Establish tenant context only after canonical resource resolution | Reject/defer mutation if tenant/resource cannot be resolved safely |
| Migration/admin | Controlled release/administrative identity | Use separate privileged role/process; not a fabricated tenant context | Operation fails unless explicit admin authority exists |
| Test | Deterministic fixture + policy-enforced test role | Set explicit test tenant per transaction/case and exercise connection reuse | Missing/wrong context must be a negative test |
| Cross-tenant discovery | Controlled tenant registry/platform metadata | Prefer discovery of tenant IDs then fan out into tenant-scoped work | No unrestricted scan of tenant business rows by default |

## 6. Options Considered

### Option A: Application authorization + explicit tenant predicates only

Architecture:

```text
Application Authorization
  + every persistence query explicitly tenant-scoped
  + relational/database constraints
  + no RLS
```

Strengths:

- simplest database privilege/policy model,
- SQL tenant scope remains fully visible in query code and query plans,
- fewer connection-context and policy-debugging concerns,
- straightforward migration/admin behavior,
- provider/database portability is high,
- application integration tests remain easy to reason about.

Weaknesses:

- a single missing tenant predicate or unsafe join can become a cross-tenant disclosure/mutation if application authorization/data-access review also misses it,
- new repositories/read models/bulk operations can bypass conventions accidentally,
- workers that process many tenants can fail dangerously if scope is lost,
- the database does not independently reject an intentionally unsafe query executed with the normal application credential.

Assessment:

This is a credible Phase 1 option, especially if the selected database is not PostgreSQL or if runtime/pooling constraints make safe policy context impractical. Its key weakness is limited independence from application/data-access defects.

### Option B: Application authorization + explicit tenant predicates + selective PostgreSQL RLS defense in depth

Conditional architecture if PostgreSQL is accepted:

```text
Application Authorization
  + explicit tenant-scoped persistence SQL
  + selective RLS on materially tenant-owned canonical tables
  + least-privileged policy-enforced application/worker role
  + separate migration/admin privilege
```

Strengths:

- adds an independent row-level backstop against missing/wrong tenant filters,
- keeps application SQL explicit and reviewable,
- allows database isolation policy to remain narrow and tenant-focused instead of duplicating full capability/business semantics,
- can provide safe default-deny behavior when RLS is enabled but no applicable policy permits access,
- can protect both read and write paths,
- can reinforce tenant safety for imports, exports, workers, read models, and new features.

Costs/tradeoffs:

- policy lifecycle, role behavior, and tenant-context propagation must be designed and tested carefully,
- connection pooling makes persistent session tenant state unsafe without strict cleanup guarantees,
- table-owner/superuser/`BYPASSRLS` semantics can silently defeat the control if runtime credentials are over-privileged,
- worker/global discovery and migration/admin paths need deliberate privilege separation,
- policies add query-planning/debugging complexity and must be included in performance validation,
- provider poolers/proxies may constrain how session/transaction context can be used.

Assessment:

This is the strongest current hypothesis for GymPulse if PostgreSQL is later accepted and a compatible runtime/pooling design is validated.

### Option C: RLS-heavy data access

Architecture:

```text
Application Authorization
  + database RLS as the dominant tenant filter
  + normal queries rely substantially on policies rather than explicit tenant predicates
```

Strengths:

- highly centralized tenant filtering,
- less repetitive tenant predicate code,
- can reduce accidental broad-row access in code paths that consistently use policy-enforced credentials/context,
- may be a better fit for approved direct-client/PostgREST-style architectures.

Weaknesses:

- tenant scope becomes less visible in application SQL and code review,
- developers may stop reasoning explicitly about tenant boundaries,
- context-propagation bugs and privileged-role bypass become higher-impact,
- debugging and query-plan reasoning become more implicit,
- workers/migrations/admin/reporting need more exceptions or separate paths,
- complex policy expressions can drift toward duplicating capability/Member-self/business authorization,
- provider-specific JWT/policy conventions can increase lock-in.

Assessment:

Not preferred for the current trusted-server Phase 1 topology. It offers stronger centralization but weakens SQL clarity and increases dependence on policy/context correctness without a current requirement for direct-client canonical DB access.

### Option D: Strong physical/schema isolation

Alternatives include:

```text
database per tenant
schema per tenant
separate database clusters for classes of tenants
```

Strengths:

- very strong blast-radius boundaries depending on topology,
- can simplify some tenant-specific backup/restore or regulated-isolation scenarios,
- credentials/connections can encode a physical tenant boundary.

Costs/tradeoffs:

- significantly greater migration/schema-version orchestration,
- connection/pool management becomes more complex,
- cross-tenant operational analytics/reporting requires aggregation across stores,
- backup/restore and incident operations multiply by tenant/store,
- pilot onboarding/provisioning and local development become heavier,
- Phase 1 evidence does not show a scale, regulatory, residency, or enterprise-isolation requirement that justifies the operational cost.

Assessment:

Technically strong isolation but disproportionate to current GymPulse Phase 1 needs. Keep it as a future option for exceptional regulatory/enterprise requirements rather than a baseline.

## 7. Evaluation

### 7.1 Evaluation matrix

| Criterion | Explicit app scoping only | App scoping + selective RLS | RLS-heavy | Schema/DB per tenant |
|---|---|---|---|---|
| Tenant isolation strength | Strong when code is correct | **Very strong layered control** | Very strong when context/policies/roles are correct | Strongest physical boundary |
| Independence from application bug | Moderate | **Strong** | Strong | Strong |
| Authorization separation | Strong | **Strong if RLS kept tenant-only** | Moderate; risk of policy/business duplication | Strong but app authorization still required |
| SQL clarity | **Strongest** | **Strong** because explicit predicates remain | Moderate/Weak | Strong per tenant, but topology is implicit context |
| Pooling safety | Simple | Moderate; transaction-context discipline required if context-driven | Harder; policy depends heavily on context correctness | Moderate/Hard across many pools |
| Worker compatibility | Strong with explicit scope | **Strong if jobs fan out tenant-by-tenant** | Moderate; global/system jobs need careful bypass design | Operationally heavy |
| Migration/admin ergonomics | **Strongest** | Strong with separate migration role | Moderate | Weakest at scale due repeated migrations |
| Provider independence | **High** | High/Moderate; PostgreSQL feature dependency if selected | Moderate; often more policy/provider coupling | High at logical level, high infra coupling |
| Future direct-client compatibility | Weak without new boundary | **Strong base, but would require stronger user-level RLS policy if approved** | Strongest natural fit | Possible but operationally heavy |
| Testability | Strong | **Strong but requires real DB role/policy/pool tests** | Strong but complex matrix | Strong isolation tests, costly environments |
| Policy complexity | None | **Low-Moderate if tenant-only** | High | Low per DB, high operational complexity |
| Operational complexity | **Lowest** | Moderate | Moderate/High | **Highest** |
| Performance transparency | **Highest** | High with EXPLAIN validation | Moderate; more implicit filters/functions | High per DB, cross-tenant work expensive |
| Debuggability | **Highest** | High/Moderate | Moderate | Moderate due distributed tenant stores |
| Phase 1 simplicity | **Strong** | **Strong/Moderate and justified by security value** | Moderate/Weak | Weak |
| Future scalability | Strong | **Strong** | Strong | Strong for isolation, operationally expensive |
| Reversibility | **High** | **High if application predicates remain correct** | Moderate | Low/Moderate |
| Overall GymPulse fit | Credible fallback | **Recommended conditional direction** | Not preferred for current topology | Defer unless future evidence requires |

### 7.2 Evaluation conclusion

GymPulse has unusually high consequences for cross-tenant mistakes because the same canonical store contains member identity/contact data, attendance, retention notes, membership state, and payment metadata. At the same time, current Phase 1 scale and operating model do not justify database-per-tenant complexity, and direct-client database access is not approved.

Option B provides the best current balance if PostgreSQL is later accepted:

- application authorization stays authoritative,
- explicit tenant predicates stay visible in persistence code,
- tenant-only RLS adds an independent backstop,
- policy complexity can remain small,
- normal runtime/worker access can remain least privileged,
- physical multi-database operations are avoided.

The complexity is justified only if GymPulse proves the actual runtime role is subject to policies and the tenant-context mechanism is safe under the selected pooler/runtime. An RLS label on tables while the normal application credential bypasses RLS would provide false assurance and is explicitly rejected.

## 8. Proposed Decision

**Propose mandatory GymPulse application authorization plus explicit tenant-scoped persistence queries, reinforced by selective database-level tenant isolation; with PostgreSQL accepted under `D-ARCH-002`, selective PostgreSQL RLS on materially tenant-owned canonical tables is the leading data-layer defense-in-depth mechanism. `D-SEC-008` itself remains OPEN.**

This remains a proposal. `D-SEC-008` stays `OPEN` until explicit review/approval evidence changes the canonical register.

If later accepted with PostgreSQL, the architecture rules are:

1. Application authorization under `D-ARCH-015` remains mandatory before protected data disclosure or business effects.
2. Persistence queries remain explicitly tenant/gym/branch scoped where practical even when RLS is enabled.
3. RLS covers tenant row visibility/mutation boundaries, not the full GymPulse capability/domain policy model.
4. Policy coverage follows data ownership/risk classification; not every database object receives identical RLS.
5. Materially tenant-owned canonical tables are the default candidates for RLS.
6. Tenant-scoped configuration may receive equivalent protection when it can expose or alter tenant-specific behavior/data.
7. Global reference data and platform/system metadata are classified separately and not forced into a tenant policy without a real ownership requirement.
8. The database tenant context must be derived from a trusted application/system authorization result, never directly from an unverified client tenant ID.
9. No tenant context, malformed context, or unresolved tenant context must fail safely. No default tenant is permitted.
10. Normal interactive application database access uses a least-privileged policy-enforced role when the selected PostgreSQL topology supports it.
11. Normal application traffic must not use a superuser, table/schema owner, or a role with `BYPASSRLS` merely for convenience.
12. Background tenant jobs use an explicit tenant-scoped System Context and should use the same policy-enforced database posture where practical.
13. Cross-tenant scheduler/discovery responsibilities should be narrow: discover tenant IDs/eligible work through controlled metadata, then fan out tenant-scoped work rather than giving every worker unrestricted business-row access.
14. Verified provider callbacks resolve the canonical internal resource and tenant before tenant-aware persistence. They do not receive a generic RLS-bypass database path.
15. Migration/schema-owner privilege is separate from ordinary application/worker privilege.
16. Emergency/break-glass database access, if later needed, is rare, explicit, least privileged, auditable, and time-bounded/restricted where practical.
17. If tenant context is represented through PostgreSQL transaction/session configuration, prefer transaction-scoped context over persistent uncontrolled session state for pooled application traffic.
18. The exact context mechanism is deferred until database/provider/pooling/runtime decisions are known, but it must be testable under long-lived, worker, serverless, and selected pooler modes.
19. Pool reuse must never allow Tenant A's context to become Tenant B's context.
20. Transaction rollback must clear transaction-local tenant context before the connection can be reused.
21. Nested application operations must share or explicitly validate the same trusted tenant transaction context rather than silently replacing it.
22. Retried transactions must re-establish trusted tenant context from the application execution context rather than assuming connection state survived safely.
23. RLS protects both reads and writes on covered tables; policy design must address existing-row visibility and new-row/update write checks.
24. RLS does not grant export capability. Application authorization still controls whether a user/system may create and retrieve exports.
25. RLS does not replace import validation. It may provide a useful write-side tenant backstop against an import batch assigning a row to the wrong tenant.
26. RLS does not replace relational integrity; foreign keys, uniqueness, transactions, and tenant-aware relationship integrity remain separate schema responsibilities.
27. Direct versus derived tenant ownership is decided per schema relationship later. Direct tenant references are favored when they materially simplify security, indexing, query safety, or policy review, provided consistency with parent ownership is enforced.
28. Complex policy functions/subqueries should be avoided where a simple row-ownership comparison can satisfy the isolation invariant.
29. Privileged database functions are not a routine escape hatch. Any future `SECURITY DEFINER`-style mechanism requires explicit purpose, least privilege, safe object lookup/search path, narrow execution privilege, and security tests.
30. Views/read models must be reviewed for effective execution privileges and RLS behavior; they cannot be assumed safe merely because their base tables have RLS.
31. Policies and database privilege changes, if adopted, are server-only infrastructure/security artifacts maintained through the controlled, versioned database migration history rather than frontend code or undocumented provider-console edits.
32. Local/staging/integration test environments must include a real policy-enforced application/worker role if RLS is adopted; testing only as a database owner/superuser is insufficient.
33. Application authorization and RLS must be tested independently so one control's success does not conceal a defect in the other.
34. Representative query plans and latency are validated before acceptance/production rollout. RLS is neither assumed free nor rejected based on hypothetical overhead.
35. A provider-specific RLS/Auth/JWT/service-role design is not accepted by this ADR. Managed platforms remain replaceable infrastructure candidates.
36. Direct browser/mobile canonical DB access remains unapproved. RLS adoption is not justification to bypass the trusted GymPulse runtime.
37. If direct-client access is ever proposed, `D-SEC-008` becomes a materially stronger P0 application-security gate requiring separate review of grants, Member-self policy, JWT freshness/claims, capability duplication, service-role exposure, and provider-specific policy semantics.
38. `D-DATA-007` remains separate; no membership entitlement/lifecycle policy is encoded into RLS by this ADR.
39. Backup/restore access, raw files, replicas, and operator access remain protected through infrastructure/security controls independent of RLS.
40. No RLS policy, role, schema change, migration, database instance, provider configuration, or application implementation is created by Task 0018.

## 9. Tenant Context and Database Role Model

### 9.1 Tenant-context candidate mechanisms

If PostgreSQL RLS is adopted and policies need runtime tenant context, candidate mechanism categories include:

| Mechanism | Advantages | Material risks / concerns | Current posture |
|---|---|---|---|
| Database role per tenant | Very explicit DB identity boundary | Role explosion, connection/pool management, migrations/rotation complexity, future many-tenant scale | Not preferred for shared Phase 1 baseline |
| Transaction-scoped database setting/context | Works with one policy-enforced runtime role; bounded to transaction; compatible with explicit Unit of Work concept | Must be established only from trusted app context; every transaction/query path must be disciplined; pooler compatibility must be tested | **Leading context category if runtime context is required** |
| Session-scoped setting/context | Simple for long-lived dedicated sessions | Dangerous with reusable connection pools if cleanup/reset fails; can bleed between requests/tenants | Not preferred for pooled multi-tenant application traffic |
| Explicit tenant value passed/query-scoped policy relation | Makes tenant identity explicit in operation | Exact safe implementation depends on SQL/data-access design; can become coupled to queries/helpers | Candidate only; evaluate with final persistence design |
| Provider JWT/Auth context | Convenient in provider Data API/direct-client architectures | Provider coupling, JWT staleness/claims semantics, capability duplication, current direct-client path unapproved | Not a Phase 1 baseline; revisit only if topology changes |

### 9.2 Transaction-scoped context

PostgreSQL 18 documentation states that `SET LOCAL` lasts only until the end of the current transaction, whether committed or rolled back, and that `set_config(..., is_local=true)` is transaction-local. This makes transaction-scoped configuration materially safer than uncontrolled session-scoped tenant state for reusable application connections.

Conceptually:

```text
begin trusted application transaction
  -> establish verified tenant context for this transaction
  -> execute explicitly tenant-scoped reads/writes
  -> commit or rollback
  -> transaction-local context expires
```

No implementation SQL is defined by this ADR.

The final implementation must also define behavior for:

- operations that do not otherwise require a business transaction but need RLS context,
- nested Unit-of-Work calls,
- savepoints,
- retry after serialization/deadlock failure,
- connection acquisition/release,
- worker jobs that process successive tenants,
- provider poolers in transaction vs session mode.

### 9.3 Connection-pool safety

A forbidden failure pattern is:

```text
physical connection handles Tenant A
  -> tenant context remains on the session
  -> connection returns to pool
  -> next request for Tenant B checks out same connection
  -> Tenant B inherits Tenant A context
```

A safe architecture must prevent this by construction and prove it with real pool-reuse tests.

Transaction-local context is favored because PostgreSQL clears it at transaction end/rollback. Session-scoped state may still be usable in special dedicated-session designs, but it is not the default multi-tenant pooled-request posture and would require explicit reset/verification guarantees plus tests.

Managed poolers/proxies may use session pooling or transaction pooling. The final platform evaluation must confirm whether the chosen context mechanism is compatible with the selected mode. No design may assume that arbitrary session state persists safely across a transaction pooler.

### 9.4 Conceptual database role classes

If PostgreSQL is accepted, at minimum distinguish these responsibility classes. These are conceptual roles only, not actual usernames or grants.

| Role class | Purpose | RLS posture | Schema/policy ownership | Bypass posture |
|---|---|---|---|---|
| Application runtime role | Interactive trusted application queries/mutations | Subject to tenant RLS on covered tables | No schema-owner/migration authority | No normal RLS bypass |
| Background worker role | Tenant-scoped jobs and async use cases | Subject to tenant RLS for ordinary tenant work | No migration authority | No generic bypass |
| Migration/schema-owner role | Controlled schema/policy/migration changes | May require owner/admin privilege for controlled maintenance | Yes, through release process | Privilege only in migration/admin path |
| Break-glass/admin role | Rare incident/recovery operations | May require privileged access | No routine application use | Explicit, auditable, constrained |
| Read-only operational/reporting role | Future authorized diagnostics/reporting | Prefer tenant-scoped/policy-enforced access or controlled tenant-by-tenant path | No | No blanket bypass by default |

### 9.5 PostgreSQL bypass semantics verified

Current PostgreSQL 18 documentation confirms:

- normal RLS-enforced access applies to rows returned by `SELECT` and rows inserted/updated/deleted by data-modification commands;
- when RLS is enabled and no applicable policy allows access, PostgreSQL uses default deny;
- superusers and roles with `BYPASSRLS` always bypass RLS;
- table owners normally bypass RLS;
- `FORCE ROW LEVEL SECURITY` can make a table owner subject to row-security policies;
- `NOBYPASSRLS` is the default role attribute;
- normal SQL privileges/grants and RLS are complementary, not replacements for one another.

Therefore, the policy-enforced runtime/worker credential cannot be the table owner, superuser, or an accidental `BYPASSRLS` role if RLS is expected to provide real defense in depth.

Whether `FORCE ROW LEVEL SECURITY` should be applied to specific tables is deferred to implementation/security review after the final role/ownership topology is known. It must be tested if selected.

### 9.6 Worker posture

Normal tenant work should be structured as:

```text
job with explicit tenant/gym scope
  -> validate bounded System Context
  -> establish tenant-scoped application authorization/execution context
  -> tenant-aware database context
  -> run use case
```

For global schedules, a safer default architecture is:

```text
scheduler/discovery
  -> identify tenant IDs or due work through a narrow controlled metadata path
  -> dispatch/fan out tenant-scoped work
  -> each worker operates under one explicit tenant context
```

This keeps the normal business-row path policy-enforced and reduces the need for an unrestricted worker credential.

### 9.7 Provider callbacks

Verified payment/auth/messaging callbacks do not justify tenant-unrestricted database access.

Preferred conceptual path:

```text
raw provider event
  -> verify provider authenticity
  -> normalize provider reference/evidence
  -> resolve canonical internal resource
  -> resolve tenant/resource ownership
  -> bounded application use case
  -> tenant-aware persistence
```

If the tenant cannot be resolved unambiguously and safely, the mutation remains rejected/unresolved for reconciliation rather than falling back to global write privilege.

### 9.8 Migration and admin boundary

Migration/policy/schema changes require privileges that ordinary application traffic should not possess.

The controlled migration process may need ownership/admin capability to create or alter schema/policies. That credential/process must remain separate from application/worker credentials.

A migration/admin role is not a reason to run normal requests with the schema owner.

Future break-glass access must be:

- rare,
- explicit,
- purpose-scoped,
- least privileged,
- audited,
- time-bounded/restricted where practical,
- operationally documented.

No final break-glass mechanism is chosen here.

## 10. Application Authorization Relationship

### 10.1 Layering

The intended control sequence is:

```text
Client
  -> Trusted GymPulse Runtime
  -> Authentication / Principal Resolution
  -> Application Authorization
  -> Application / Domain
  -> Explicitly tenant-scoped Data Access
  -> Data-Layer Tenant Isolation
  -> Canonical Database
```

The database layer deliberately sits below `ADR-0009`.

### 10.2 What remains application-owned

Application authorization remains responsible for:

- current Principal/account eligibility,
- current role/capability assignments,
- Branch/Gym/Organization scope semantics,
- Member-self relationship,
- Owner/Manager/Front Desk permission distinctions,
- export permission,
- attendance correction permission,
- offline-payment/refund permission,
- privileged settings/role changes,
- resource-level purpose authorization,
- provider callback business routing,
- bounded System Principal/job operation type.

Domain/application code remains responsible for:

- membership entitlement,
- attendance eligibility/duplicate policy,
- pricing/renewal eligibility,
- payment verification and exactly-once effects,
- no-show/retention rules,
- valid state transitions,
- business audit semantics.

### 10.3 Member-self posture

For the current trusted-server topology, RLS should not automatically duplicate the full Member-self authorization model.

Preferred layering:

```text
Application Authorization
  -> explicit Principal-to-Member relationship and purpose/capability

RLS
  -> tenant/gym isolation backstop on tenant-owned rows
```

This reduces policy complexity and provider/identity coupling. If a direct-client Data API is ever approved, the appropriate balance may change and would require a separate security architecture review.

### 10.4 Capability policy posture

Do not encode the entire capability catalog in row policies merely because PostgreSQL can evaluate expressions.

In particular, tenant RLS should not become the primary implementation of:

```text
payment.refund
payment.record_offline
attendance.correct
attendance.checkin.assisted
manager/owner business policy
```

That duplication creates policy drift between application and database layers and weakens separation of responsibilities.

### 10.5 Application authorization independence

The application authorization test suite must prove protected operations remain tenant/capability-safe even when RLS is disabled or otherwise isolated in a dedicated safe test environment.

Separately, RLS tests must prove an intentionally unsafe tenant query is blocked when executed through the policy-enforced database role.

This demonstrates two independent controls rather than one control being tested twice.

## 11. Security and Privacy Impact

### 11.1 Read and write isolation

Current PostgreSQL 18 `CREATE POLICY` documentation distinguishes:

- `USING` expressions for which existing rows are visible/targetable, and
- `WITH CHECK` expressions for new rows created by `INSERT` or new row versions produced by `UPDATE`.

Policies can be operation-specific for `SELECT`, `INSERT`, `UPDATE`, and `DELETE`, and permissive/restrictive composition exists.

GymPulse must therefore test both read isolation and write isolation. A policy that prevents Tenant A from selecting Tenant B but permits writing a row for Tenant B is not acceptable.

This ADR does not define actual policy expressions.

### 11.2 Default deny and missing context

PostgreSQL current documentation states that when RLS is enabled and no policy applies, access is default deny.

The intended GymPulse failure model is similarly fail closed:

```text
missing tenant context -> no tenant-row access
invalid tenant context -> no tenant-row access
malformed tenant identifier -> reject/fail safely
tenant context not authorized by application -> application denies and DB context is never established
```

No fallback tenant may exist.

### 11.3 Referential integrity is separate

PostgreSQL documentation notes that referential-integrity checks such as unique/primary-key/foreign-key checks bypass row security so integrity can be maintained. Therefore RLS cannot be presented as a complete relational-integrity boundary, and schema design must consider possible information-leak/covert-channel implications from constraint behavior.

Future schema work should ensure that relationships linking tenant-owned rows cannot silently cross tenants merely because a foreign key proves that a target ID exists. Tenant-aware composite integrity or equivalent trusted ownership validation may be required where the risk justifies it.

### 11.4 Views/read models

Current PostgreSQL 18 view documentation states that base-relation privileges and RLS policies normally operate according to the view owner's context, while `security_invoker` changes evaluation to the invoking user's privileges/policies.

Therefore:

- a view over RLS-protected tables is not automatically safe,
- effective view ownership/invoker semantics must be reviewed,
- read-model/view tests must prove tenant behavior,
- no view should become an accidental bypass because it was created by an over-privileged owner.

No views are created by this ADR.

### 11.5 Policy helper functions

Simple row comparisons are preferred when sufficient.

If future policies call helper functions, security review must consider:

- volatility and planner behavior,
- execution privilege/context,
- query cost,
- race/concurrency behavior when consulting other tables,
- `search_path` safety,
- ownership and `EXECUTE` privilege,
- testing and observability.

Current PostgreSQL documentation also warns that complex policy expressions that consult other tables can introduce race/security considerations under concurrency.

### 11.6 Privileged functions

`SECURITY DEFINER` functions execute with the function owner's privileges rather than the caller's. PostgreSQL 18 documentation explicitly requires careful handling and recommends a `search_path` that excludes schemas writable by untrusted users, with the temporary schema ordered safely.

Accordingly, privileged functions are high-risk escape paths and are not part of the baseline tenant-isolation design. Any later use requires a specific justified purpose, safe object lookup path, narrow privileges, input validation, review, and negative tests.

### 11.7 Managed service-role semantics

Representative current Supabase documentation was reviewed only to understand one managed-platform risk model; it is not provider selection.

Current Supabase documentation states:

- the `service_role`/secret-key path uses elevated access and bypasses RLS,
- service/secret credentials must remain server-side,
- RLS policies and table grants are separate controls,
- Supabase Auth/JWT context can feed policies for direct Data API patterns,
- user/JWT metadata can be stale or user-modifiable depending on claim source,
- a service/secret key must not be exposed to clients.

Therefore, adopting Supabase later would not justify using a service-role bypass as the normal GymPulse application credential if ADR-0010 expects RLS to be an independent backstop. Provider-specific privileged paths would need explicit mapping to the GymPulse role model and tests.

### 11.8 Direct-client boundary

Current Phase 1 remains:

```text
Client
  -> Trusted GymPulse Runtime
  -> Application Authorization
  -> Persistence
```

RLS adoption does not approve:

```text
Client
  -> Provider Data API / Canonical Database
```

If such a topology is later proposed, RLS/grants/JWT policy correctness becomes a first-class P0 application security control, not merely defense in depth. The change would require separate review of Member-self authorization, capability semantics, claim freshness, service-role exposure, policy coverage, provider outages, rate abuse, and audit behavior.

### 11.9 Exports/imports

For exports:

```text
RLS does not grant export capability
```

Application authorization still decides export authority and scope. RLS may reduce blast radius from an accidentally broad export query.

Pilot imports remain application-validated and tenant-authorized. RLS can add write-side protection against a batch attempting to create/change another tenant's row, but it cannot validate membership state, expiry, plan semantics, or source reconciliation.

### 11.10 Backups and replicas

RLS does not protect raw backup files from someone with backup-file access. PostgreSQL `pg_dump` also has explicit row-security behavior intended to avoid accidentally incomplete backups. Backup/restore remains a privileged infrastructure path requiring encryption/access controls, environment controls, and restore testing.

If read replicas are later introduced, RLS policy/role/configuration behavior and tenant context must remain consistent with the source topology. Replica architecture is not decided here.

## 12. Reliability, Performance, and Scalability Impact

### 12.1 Query performance

RLS is evaluated as a security control that participates in query execution; it is not assumed to have zero cost.

Representative performance-sensitive GymPulse paths include:

- Member search,
- attendance history/check-in supporting reads,
- no-show/follow-up queues,
- renewal queues,
- payment reconciliation/exception views,
- Owner dashboard/drill-down queries,
- background scans.

Future validation must examine actual query plans with policies enabled and realistic tenant predicates/data distributions.

### 12.2 Tenant indexes

If tenant ownership is a frequent explicit query predicate and/or RLS condition, later schema/index design should support that access pattern efficiently.

`NFR-SCALABILITY-006` already requires tenant/branch + operational-field indexing for high-volume queries. This ADR records the security/performance dependency but creates no indexes.

### 12.3 Explicit predicates remain useful

Even with RLS, explicit tenant predicates improve:

- reviewer understanding,
- plan/index intent,
- purpose-specific query boundaries,
- accidental broad-query prevention,
- consistency between RLS and non-RLS safe tests,
- provider/database reversibility.

RLS should be a backstop rather than a reason to write globally broad application queries.

### 12.4 Policy complexity budget

Prefer policies shaped like:

```text
stored row ownership matches current trusted tenant context
```

rather than policies that perform complex authorization joins or domain calculations.

Revisit the architecture if policies require:

- large relationship graphs,
- repeated capability lookups,
- many cross-table subqueries,
- frequent privileged helper functions,
- business-state transitions inside policies,
- provider-specific JWT claims as the primary business authorization source.

At that point, policy complexity may be signaling the wrong boundary rather than a need for more SQL logic.

### 12.5 Runtime topology compatibility

The proposed model must remain feasible for:

- long-lived trusted application servers,
- serverless request runtimes,
- background workers,
- controlled migration processes.

Managed platforms may provide direct, session-pooled, or transaction-pooled connections. Representative current Supabase documentation explicitly distinguishes persistent/session-pooler use and transaction-pooler use for temporary/serverless clients.

Therefore the final database context design must be verified against the selected topology. Session-scoped tenant context cannot be assumed safe or persistent under transaction pooling.

### 12.6 Scalability

Selective RLS does not require one database per tenant and therefore fits the current shared-schema Phase 1 scaling direction.

Physical isolation remains available later if regulatory/enterprise evidence requires it. Keeping application authorization and explicit tenant predicates correct preserves reversibility if the data-layer mechanism changes.

## 13. Operations and Observability Impact

### 13.1 Policy ownership and change control

If RLS is adopted, policy changes are owned by server-side persistence/security architecture through the controlled database migration process.

Policies must be:

- reviewable,
- version controlled,
- repeatable,
- environment consistent,
- testable from an empty database and across representative upgrades,
- not maintained only through a provider dashboard/manual production edits.

No migration is created by this ADR.

### 13.2 Raw SQL capability

RLS, roles, policy ownership, and database-native security are legitimate database features. The future `D-ARCH-017` implementation must allow reviewable raw/custom SQL migration capability rather than weakening security design to fit an ORM abstraction.

This does not accept Drizzle, Kysely, Prisma, or a SQL-first implementation.

### 13.3 Local development

A developer environment that always connects as schema owner/superuser can hide production RLS defects.

If RLS is adopted, local/integration workflows must include a policy-enforced runtime role and realistic tenant context. Privileged connections may still exist for migrations/test setup, but they must not be the only database path exercised by tests.

### 13.4 Observability

Future safe diagnostics may include:

```text
request/job correlation ID
safe tenant/gym reference where appropriate
database operation/use-case name
database role class
whether tenant context was established
safe policy-denial/context-missing category where detectable
```

Logs must not expose:

```text
other tenant row contents
raw authentication tokens
database passwords/connection secrets
provider secret keys
unnecessary member/private data
```

Raw database policy errors are not returned directly to untrusted clients. Application error mapping remains controlled by the API architecture.

### 13.5 Incident/security signals

Useful future signals include:

- unexpected RLS/policy denials on valid flows,
- tenant-scoped query attempted with missing DB context,
- privileged/bypass database role used outside approved migration/admin operation,
- migration credential observed in runtime processes,
- policy drift between expected migration state and environment,
- cross-tenant negative test failure,
- worker executing without valid tenant scope,
- sudden increase in tenant-isolation/application authorization failures.

No alerting tool is selected here.

### 13.6 Credentials

Conceptually separate credentials/identities for:

```text
application runtime
background worker
migration/admin
```

where separate privilege materially improves least privilege. Read-only operational/reporting credentials may be introduced later if needed.

No credential, secret-manager product, or environment variable is created by this ADR.

### 13.7 Failure and recovery

Minimum failure modes to plan for:

```text
missing tenant context
wrong tenant context
pool context leak
application role unexpectedly bypasses RLS
worker accidentally uses privileged role
migration credential leaks into runtime
policy blocks legitimate operation
policy permits cross-tenant operation
policy drift across environments
policy migration failure
performance regression
provider pooler incompatible with context mechanism
```

If a policy rollout blocks legitimate production access, recovery must be controlled. Acceptable categories include:

- rollback of the specific policy/security migration when safe,
- forward-fix policy migration,
- temporary restricted and audited administrative intervention.

Permanent blanket disabling of isolation is not an acceptable recovery strategy.

## 14. Testing and Validation

Mocks are insufficient for database RLS semantics. Acceptance requires real PostgreSQL validation if PostgreSQL/RLS remains the selected direction.

Required future non-production validation includes at least:

1. Tenant A `SELECT` path cannot see a Tenant B protected row.
2. Tenant A `INSERT` path cannot create a Tenant B-owned protected row.
3. Tenant A `UPDATE` path cannot mutate a Tenant B protected row.
4. Tenant A `DELETE` path cannot remove a Tenant B protected row.
5. Missing tenant database context fails closed on covered tables.
6. Invalid tenant database context fails closed.
7. Explicit application tenant predicates remain present/enforced on representative data-access paths.
8. Application authorization independently protects protected operations with RLS disabled or isolated in a safe dedicated test configuration.
9. RLS independently blocks an intentionally unsafe broad tenant query executed through the policy-enforced runtime role.
10. Normal application runtime role is actually subject to policies.
11. Normal application runtime cannot use migration/schema-owner privileges.
12. Table-owner/superuser/`BYPASSRLS` behavior is explicitly tested against the selected role model.
13. `FORCE ROW LEVEL SECURITY` behavior is explicitly tested if selected for any covered table.
14. Connection-pool leakage test: a physical connection used for Tenant A transaction returns to the pool and later serves Tenant B without inheriting Tenant A context.
15. Rollback leakage test: tenant context is established, transaction fails/rolls back, connection is reused, and no context leaks.
16. Parallel Tenant A/Tenant B workload on the real pool remains isolated.
17. Background Tenant A job can access only Tenant A covered data.
18. Successive background Tenant B job can access only Tenant B data even with connection reuse.
19. Missing/malformed job scope fails safely and never falls back to a global business-row query.
20. Cross-tenant scheduler/discovery path can identify work without granting normal workers unrestricted tenant business-data access.
21. Verified provider callback resolves the correct tenant before covered persistence operations.
22. Provider callback carrying/causing a wrong-tenant resource association cannot mutate that tenant's protected rows.
23. Pilot import with a tenant mismatch is rejected/contained without cross-tenant row creation.
24. Member search returns only authorized/tenant-scoped Members.
25. No-show/renewal/payment operational queues stay tenant-scoped.
26. Export query cannot cross tenant scope, while application authorization separately requires export capability.
27. Member-self application authorization remains effective independently of tenant-only RLS.
28. Migration/admin path can perform required controlled policy/schema administration without giving runtime processes equivalent privilege.
29. If a managed platform is evaluated, its service/secret-role and user/JWT RLS behavior is tested rather than assumed.
30. Representative `EXPLAIN`/query-plan and latency checks cover Member search, queues, dashboard/read models, and payment reconciliation with RLS enabled.
31. Policy/migration history can build the intended policy-enforced state from an empty database.
32. Policy upgrade between representative prior/current schema states is repeatable and safe.
33. Policy drift detection identifies a manually changed/missing policy/role configuration in a test environment.
34. Negative application authorization suite runs with RLS disabled/isolated where safe to prove application control independence.
35. Negative RLS suite runs through the policy-enforced database role without relying on application capability checks to prove database-control independence.
36. `USING`/`WITH CHECK` behavior for read/write policy cases matches the intended isolation model.
37. Views/read models over protected tables preserve intended tenant isolation under the selected invoker/owner semantics.
38. Privileged helper/security-definer functions, if ever introduced, cannot broaden tenant access unexpectedly and use safe execution/search-path/privilege rules.
39. Foreign-key/unique constraint behavior cannot be used to create unacceptable cross-tenant information disclosure in tested sensitive paths.
40. Backup/restore procedure is validated separately from tenant RLS so full backups are neither silently incomplete nor exposed through normal runtime credentials.

Task 0018 implements none of these tests.

## 15. Migration and Rollout

There is no existing GymPulse RLS implementation to migrate.

If this ADR, PostgreSQL, and dependent infrastructure choices are later approved, use a staged rollout concept:

```text
1. inventory/classify tenant-owned and sensitive tables/relationships
2. verify explicit tenant ownership and explicit tenant predicates
3. define least-privileged runtime/worker vs migration/admin role model
4. select and validate the trusted tenant-context mechanism
5. implement policy changes through controlled migration history in isolated test DB
6. run read/write negative cross-tenant tests
7. run pool/context leakage + rollback + worker reuse tests
8. validate views/functions/constraints/imports/exports/provider callbacks
9. validate representative query plans and latency
10. enable/validate in staging with real policy-enforced roles
11. verify migrations/admin/break-glass/recovery paths
12. roll out to production with explicit rollback/forward-fix plan and observability
```

### 15.1 No silent schema redesign

If later policy simplicity/security requires direct tenant ownership on additional records, treat that as an explicit schema decision/migration with integrity review. This ADR does not modify canonical entities or add columns.

### 15.2 No provider-console-only policy

If a managed PostgreSQL platform is selected, its UI may assist development/inspection, but the canonical policy/role changes should remain represented by the repository's controlled migration/change history where practical.

Representative current Supabase migration documentation supports version-controlled SQL migration workflows, but this does not select Supabase or its CLI.

## 16. Reversibility

### Application authorization

High reversibility and mandatory permanence as a conceptual control. It remains correct even if RLS/provider/database technology changes.

### Explicit tenant predicates

High reversibility and portability. They preserve SQL clarity across PostgreSQL and alternative engines/providers.

### Selective RLS policies

Medium-High reversibility if policies remain tenant-focused and migration-owned. They are PostgreSQL-specific but can be removed/replaced without rewriting application authorization when app predicates stay correct.

### Database role/context mechanism

Medium reversibility. Transaction-local settings, role attributes, pool behavior, and provider connection modes can create runtime coupling. Keep the context adapter boundary explicit.

### Provider-specific Auth/JWT/RLS coupling

Lower reversibility because policy semantics can spread into provider claim structure and direct-client SDK/data-access assumptions. Avoid this coupling unless a separately approved direct-client architecture requires it.

### Physical/schema-per-tenant isolation

Lowest reversibility among evaluated options because data movement, connection routing, migration orchestration, and cross-tenant operations become structural.

## 17. Risks and Mitigations

| Risk | Mitigation / decision boundary |
|---|---|
| False assurance because RLS exists but runtime bypasses it | Explicit runtime-role behavior tests; no owner/superuser/BYPASSRLS normal credential |
| RLS becomes substitute for app authorization | Mandatory `ADR-0009` boundary remains; app authorization tested independently |
| Developers omit tenant predicates because RLS exists | Explicit tenant predicates remain the application convention; code review and query tests preserve scope visibility |
| Pool tenant-context bleed | Prefer transaction-local context; mandatory same-connection tenant-switch and rollback tests |
| Serverless/transaction pooler incompatible with session context | Do not depend on persistent session tenant state; validate final pooler/runtime modes |
| Worker uses unrestricted credential | Tenant-scoped System Context + policy-enforced worker role; narrow separate discovery path |
| Provider callback overreach | Resolve canonical resource/tenant after verification; bounded app use case; no generic bypass |
| Table/view/function owner bypass | Separate ownership from runtime; explicit views/function security review; role tests |
| Service/secret role accidentally used in normal app | Separate credentials/config; provider-specific behavior tests; operational detection |
| Migration credential appears in runtime | Environment/secret separation, least privilege, deployment-only use, monitoring |
| Policy blocks legitimate operation | Staging integration tests, safe error diagnosis, rollback/forward-fix migration |
| Policy permits cross-tenant operation | Default-deny posture, simple policy invariant, negative SELECT/INSERT/UPDATE/DELETE tests |
| Policy complexity grows into business authorization | Complexity budget; capabilities/Member-self/domain remain application-owned |
| Direct/derived tenant ownership drift | Later schema integrity design; direct tenant columns only with consistency constraints/validation |
| Constraint covert-channel leakage | Schema/security review + sensitive-path negative tests; RLS not assumed to cover integrity checks |
| View accidentally bypasses base-table policy | Explicit effective-user/RLS review and real database tests |
| Privileged helper function bypass | Avoid by default; if unavoidable use narrow privileges, safe search path, tests, documented purpose |
| Query-plan/performance regression | Representative EXPLAIN/latency validation and tenant-aware indexes in later schema work |
| Policy drift across environments | Policy-as-migration/version control and drift detection |
| Backup incomplete because of RLS | Dedicated backup role/process; verify PostgreSQL backup row-security behavior; restore tests |
| Analytics/reporting receives broad production DB access | Purpose-specific/tenant-scoped read model or controlled operational path; no blanket analytics bypass |
| Incident recovery permanently disables isolation | Controlled rollback/forward-fix or restricted break-glass only |
| Provider lock-in | PostgreSQL-native/security concepts behind application/persistence boundary; no direct-client/provider JWT baseline |

## 18. Open Questions

- **Resolved for repository tracking 2026-10-16:** `@im-tnyx` personally confirmed owner responsibility and self-attested governance authority ([human GitHub comment](https://github.com/im-tnyx/gym-pulse/issues/2#issuecomment-6214567976)); an independent reviewer is not appointed, and no actual ADR approval was given.
- Will `D-ARCH-002` ultimately accept PostgreSQL, another relational engine, or another persistence architecture?
- Which eventual schema objects qualify as tenant-owned, tenant-scoped configuration, global reference, or platform/system metadata?
- At which ownership level should the initial isolation key be represented where organization, gym, and branch scopes coexist?
- Which high-risk/high-volume relationships justify direct redundant tenant ownership rather than derived ownership?
- What exact relational constraint design will keep direct tenant ownership synchronized with parent/resource ownership?
- Which tenant-context mechanism is safest with the final data-access library and connection driver?
- Which connection/pooler modes will the final hosting/managed database platform use for web/API and workers?
- Can every tenant-scoped interactive operation execute within an explicit transaction boundary if RLS context is transaction-local, or do some safe read patterns need a bounded alternative?
- Which tables, if any, should use `FORCE ROW LEVEL SECURITY` after final ownership/role topology is known?
- Does the worker need a separate database role from the interactive runtime, or can one policy-enforced role with distinct application System Contexts satisfy least privilege?
- What minimum cross-tenant scheduler/discovery metadata needs controlled platform access?
- Is a read-only operational/reporting role needed in Phase 1, and if so what scope model applies?
- Is any break-glass database access required for Phase 1 or should it remain absent until production operations are defined?
- How will policy drift be detected across local/staging/production environments?
- What representative tenant scale/data distribution is required for meaningful RLS query-plan performance validation?
- Does any future approved direct-client use case justify adding Member-self/capability semantics to database policies, or should it remain server-only?
- How will backups/restores and any future replicas preserve the intended role/policy configuration without relying on runtime RLS for raw artifact security?
- What exact policy/function/view conventions should become database engineering standards after the database/persistence decisions are accepted?

## 19. Decision Evidence

### 19.1 Canonical repository evidence

Latest `main` establishes:

- `D-SEC-008` is `OPEN` and asks for data-layer tenant isolation/RLS strategy and its relationship to application authorization.
- `D-SEC-003` is `PROPOSED`: tenant isolation is server-side and should be reinforced at the data layer where practical.
- `D-ARCH-015` is `PROPOSED`; `ADR-0009` proposes a GymPulse-owned capability + trusted scope/resource authorization module.
- `D-ARCH-002` is `DECIDED`; PostgreSQL is the accepted canonical database engine.
- `D-ARCH-017` is `PROPOSED`; no persistence/query/migration tool is accepted.
- `D-ARCH-014` is `OPEN`; no managed backend/provider is accepted.
- direct browser/mobile canonical database mutation is not an approved baseline.
- container/component/data-flow architecture requires explicit tenant context on interactive and background paths.
- `D-DATA-004` remains `PROPOSED` and `D-DATA-007` remains unresolved.
- foundation ADR-0001 through ADR-0004 are now Accepted; no approval evidence for `D-SEC-008` itself exists, so ADR-0010 remains Proposed and `D-SEC-008` remains OPEN.

Legacy `docs/06-database-schema.md`, `docs/12-security-audit.md`, and `docs/16-open-decisions.md` were used only as migration/evidence sources. Where the legacy schema describes PostgreSQL as canonical, the current structured decision register now agrees on the engine category: `D-ARCH-002 = DECIDED` via ADR-0004. Final schema and RLS choices remain separate.

### 19.2 Current official PostgreSQL research

**Research date:** `2026-09-08`

Current PostgreSQL documentation is PostgreSQL 18 as of this research date.

Official documentation reviewed:

- Row Security Policies: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- CREATE POLICY: https://www.postgresql.org/docs/current/sql-createpolicy.html
- CREATE ROLE: https://www.postgresql.org/docs/current/sql-createrole.html
- SET: https://www.postgresql.org/docs/18/sql-set.html
- System Administration Functions (`current_setting`, `set_config`): https://www.postgresql.org/docs/18/functions-admin.html
- CREATE VIEW: https://www.postgresql.org/docs/current/sql-createview.html
- CREATE FUNCTION / SECURITY DEFINER guidance: https://www.postgresql.org/docs/current/sql-createfunction.html
- pg_dump row-security behavior: https://www.postgresql.org/docs/current/app-pgdump.html

Material verified behavior used by this ADR:

1. RLS restricts normal row access for `SELECT`, `INSERT`, `UPDATE`, and `DELETE` when enabled and permitted by policies.
2. RLS-enabled tables with no applicable policy use default-deny behavior.
3. Policies can be command-specific and role-specific; permissive and restrictive policy composition exist.
4. `USING` and `WITH CHECK` address existing-row visibility/targeting and new-row/update acceptance respectively.
5. Superusers and `BYPASSRLS` roles always bypass RLS.
6. Table owners normally bypass RLS; `FORCE ROW LEVEL SECURITY` can subject owners to policies.
7. `NOBYPASSRLS` is the normal/default role posture.
8. Referential integrity checks can bypass row security, so integrity and possible information-channel behavior require separate design/testing.
9. `SET LOCAL` and `set_config(..., is_local=true)` are transaction-scoped and are cleared at transaction end/rollback; ordinary session `SET` may persist after commit for the session.
10. Views can apply owner or invoker security/RLS semantics depending on configuration, so views require explicit security review.
11. `SECURITY DEFINER` functions execute with owner privilege and require safe `search_path`/privilege handling.
12. PostgreSQL backup tooling has explicit row-security behavior, reinforcing that backup is a privileged operational path rather than a normal tenant query.

No PostgreSQL configuration or policy was created during this research.

### 19.3 Representative managed-platform research

**Research date:** `2026-09-08`

Official Supabase documentation reviewed only as a representative managed PostgreSQL environment already present in GymPulse technology evaluation:

- Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Securing your data: https://supabase.com/docs/guides/database/secure-data
- API keys/service-role behavior: https://supabase.com/docs/guides/getting-started/api-keys
- Connecting to Postgres / pooler modes: https://supabase.com/docs/guides/database/connecting-to-postgres
- Database migrations: https://supabase.com/docs/guides/deployment/database-migrations
- Local database migrations: https://supabase.com/docs/guides/local-development/database-migrations

Material verified behavior used only for provider-risk evaluation:

- Supabase exposes PostgreSQL RLS and combines table grants with policies.
- Supabase `service_role`/secret access is privileged and bypasses RLS, so it must not be exposed to browsers/clients.
- Supabase Auth/JWT can supply user context to RLS in direct Data API patterns; claim freshness/source matters.
- Supabase provides direct, session-pooled, and transaction-pooled database connection modes for different runtime classes.
- Supabase documents version-controlled database migration workflows.

This research does **not** select Supabase, Supabase Auth, Supabase RLS conventions, its Data API, its pooler, or its CLI.

### 19.4 Acceptance evidence still missing

Before ADR-0010 can become `Accepted` and `D-SEC-008` can become `DECIDED`, evidence still includes at least:

- an authorized decision owner and explicit approval,
- compatible outcome for the database engine and managed-platform/runtime decisions,
- final role/connection/pooling model,
- tenant-owned data classification and ownership model review,
- real PostgreSQL RLS/read-write negative tests if PostgreSQL is selected,
- runtime role non-bypass verification,
- transaction/pool tenant-context leakage tests,
- worker/provider callback/admin/migration path tests,
- views/functions/constraint behavior review,
- independent application authorization tests,
- representative query-plan/performance validation,
- migration/rollout/rollback and drift-control evidence.


### 19.5 Executed real PostgreSQL RLS isolation evidence (2026-10-15)

**Evidence type:** authorized, non-production synthetic test only. Source: [validation/security/rls/EVIDENCE.md](../../validation/security/rls/EVIDENCE.md); [GitHub Actions run](https://github.com/im-tnyx/gym-pulse/actions/runs/38772742264); tested branch commit `239e334af3fed69fee97c0b198916722c84b2b79`.

- PostgreSQL **17.11** in a disposable GitHub Actions Docker instance. Node **v22.23.3**, temporary `pg@8.16.3`; these do not pin or select production tooling.
- **29/29 executed scenarios PASS; disposal/cleanup PASS.** Includes A/B SELECT and all mutation paths, RLS WITH CHECK/default deny, missing/unknown/malformed context, broad query containment, runtime/worker non-bypass and DDL denial, owner vs FORCE RLS, transaction-local scope, same physical connection reuse, rollback, two concurrent sessions, scoped workers/callback simulations, independent synthetic application authorization (including a table without RLS), `security_invoker` view, tenant-aware FK, validation-only migrations, policy drift and bounded query plans.
- The ordinary role is an actual PostgreSQL LOGIN role without superuser/BYPASSRLS/table ownership and with no owner role-switch permission. Separate admin path used for policies. Owner saw **3** rows before FORCE RLS and **0** without authorized context after FORCE; this is not proof against privileged/superuser bypass.
- **Security finding:** PostgreSQL custom tenant GUC cannot itself authenticate tenant authority; arbitrary SQL using the runtime role can set it. Application identity, eligibility, resource/capability/member-self verification and explicit tenant-scoped SQL remain mandatory. A verified webhook is not a GymPulse Owner.
- **Unresolved / NOT RUN:** privileged SECURITY DEFINER helper attacks, production pooler/session modes, production database roles and ownership schema, managed-provider configuration, real callback signatures, scale/latency, backup confidentiality/policy restoration and static deployed-policy drift monitoring. Member/Membership D-DATA-007 remains unresolved.
- **Boundary:** bounded RLS scenario suite = **PASS**; overall ADR-0010 acceptance-readiness evidence = **PARTIAL**. Technical tests are **not** human decision-owner approval or production readiness. **Status: Proposed; D-SEC-008: OPEN.**

**Next bounded governance action:** ADR-0010 Evidence Consolidation and Decision-Owner Review Preparation (no approval within this action).

### 19.6 ADR-0010 evidence consolidation and decision-owner review preparation (2026-10-16)

A separate unnumbered [ADR-0010 RLS evidence / decision-owner review packet](adr-0010-rls-evidence-decision-owner-review-packet.md) consolidates the **29/29 PASS** bounded synthetic RLS results and **cleanup PASS**, independently cross-checks the latest completed [GitHub Actions run](https://github.com/im-tnyx/gym-pulse/actions/runs/38773398231) at source SHA `6431efb84aa1cd202e33f88b781d668927459291`, and maps the remaining security/provider/authorization/ownership/performance evidence gaps to decision-owner questions.

**Governance effect: NONE.** This packet is **prepared for review but full acceptance-readiness remains PARTIAL/evidence-gated**. The authorized `D-SEC-008` decision owner remains **OPEN**, explicit review/approval remains **MISSING**, `ADR-0010` remains **Proposed**, `D-SEC-008` remains **OPEN**, and the production gate remains **CLOSED**. The next single bounded action is `D-SEC-008 Authorized Decision-Owner Assignment and Evidence-Gap Triage`; it is not performed by preparing the packet.

### 19.7 Human decision-owner confirmation — not ADR acceptance (2026-10-16)

The connected account `@im-tnyx` (verified repository `admin` permission) posted its own [D-SEC-008 owner confirmation](https://github.com/im-tnyx/gym-pulse/issues/2#issuecomment-6214567976) on 2026-10-16. The human explicitly accepted the **ADR-0010 / D-SEC-008 Decision Owner** responsibility, self-attested authority over GymPulse architecture/security governance, accepted evidence-review responsibility, and **explicitly withheld final ADR acceptance and production implementation authorization**. Independent Security Reviewer is **not appointed**. This is an owner's self-attestation with durable issue evidence, not an independently documented external delegation.

The owner nomination/confirmation step is **COMPLETED** for repository governance tracking. The **12 individual evidence-gap dispositions remain PENDING** in [Issue #2](https://github.com/im-tnyx/gym-pulse/issues/2); do not transform the assistant's prior recommended dispositions into human-approved risk decisions. Consequently **ADR-0010 remains Proposed**, **D-SEC-008 remains OPEN**, risk acceptance and ADR final approval are **MISSING**, and production implementation gate remains **CLOSED**. The next one bounded action is **human review and explicit per-gap triage of all 12 open rows in Issue #2**.

## 20. Related Documents

- [ADR-0010 Evidence and Decision-Owner Review Packet](adr-0010-rls-evidence-decision-owner-review-packet.md)
- `README.md`
- `../README.md`
- `../00-overview/assumptions.md`
- `../01-product/functional-requirements.md`
- `../01-product/non-functional-requirements.md`
- `../01-product/user-roles.md`
- `../01-product/user-journeys.md`
- `../02-architecture/architecture-principles.md`
- `../02-architecture/architecture-overview.md`
- `../02-architecture/system-context.md`
- `../02-architecture/container-architecture.md`
- `../02-architecture/component-architecture.md`
- `../02-architecture/data-flow.md`
- `../02-architecture/technology-stack.md`
- `ADR-0004-database-engine.md`
- `ADR-0005-data-access-migration-strategy.md`
- `ADR-0006-managed-backend-responsibilities.md`
- `ADR-0007-authentication-session-architecture.md`
- `ADR-0008-member-authentication-method.md`
- `ADR-0009-authorization-implementation.md`
- legacy migration source: `../06-database-schema.md`
- legacy migration source: `../12-security-audit.md`
- legacy migration source: `../16-open-decisions.md`
