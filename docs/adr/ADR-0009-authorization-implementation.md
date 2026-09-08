# ADR-0009: Authorization Implementation Boundary

## Status

`Proposed`

## Decision Metadata

- ADR: `ADR-0009`
- Primary Decision ID: `D-ARCH-015`
- Related Decision IDs: `D-ARCH-004`, `D-SEC-002`, `D-SEC-004`, `D-SEC-008`, `D-ARCH-014`, `D-ARCH-003`, `D-ARCH-006`, `D-ARCH-012`, `D-ARCH-013`, `D-ARCH-002`, `D-ARCH-017`, `D-DATA-004`, `D-DATA-007`, `D-ARCH-007`, `D-ARCH-008`, `D-SEC-003`
- Decision Owner: `Open`
- Technical Owner: `Architecture / Security / Backend`
- Date Proposed: `2026-09-08`
- Date Accepted: `Not accepted`
- Supersedes: `None`
- Superseded By: `None`

## 1. Context

GymPulse Phase 1 requires authoritative authorization decisions for human principals and bounded trusted system operations across a multi-tenant application boundary.

The canonical product/security model already requires:

```text
verified Principal
  + current tenant/resource scope
  + current named capability or Member-self relationship
  -> allow / deny
```

The canonical role model also already establishes these principles:

```text
UI != Authorization Boundary
Role != Permission Check
Authentication != Authorization
Tenant ID from Client != Trusted Scope
RLS != Complete Authorization System
```

The exact authorization implementation remains separately governed under `D-ARCH-015`, which is currently `P0 PROPOSED` in `docs/00-overview/assumptions.md`.

This ADR defines the implementation boundary and policy model that should realize the already-documented authorization semantics. It does not accept `D-ARCH-015`, does not finalize every Phase 1 permission assignment, and does not select a policy engine/library/service.

Authentication remains upstream and separately governed:

```text
Authentication Evidence
      ↓
Authentication Verification
      ↓
AuthIdentity
      ↓
GymPulse Principal
      ↓
Authorization
```

The authentication provider may prove identity/session evidence. It must not become the sole authority for GymPulse tenant, branch, Member, payment, configuration, or operational permissions.

`ADR-0008` also preserves a separate Member-self trust relationship:

```text
verified channel
  !=
Member authorization
```

A verified Member-facing principal must reach protected self-service through an explicit Principal-to-Member relationship, not through mutable phone/email equality or arbitrary client member IDs.

This ADR must therefore define one authorization model usable consistently from:

- the trusted interactive application/API runtime,
- co-hosted server-side web runtime if later selected,
- independently deployed API runtime if later selected,
- background execution,
- provider callback handling,
- automated tests,
- future application entry adapters.

The decision must stay independent of the currently unresolved framework, database, RLS, managed-backend, API-deployment, and job-technology decisions.

## 2. Requirements and Decision Drivers

### 2.1 Functional requirements

Primary authorization requirements:

- `FR-AUTHZ-001` requires every protected operation to be authorized against organization/gym/branch scope where applicable.
- `FR-AUTHZ-002` requires protected mutations to use named capabilities rather than only UI visibility or client-side role checks.
- `FR-AUTHZ-003` requires Member self-service to prevent access to another Member's protected records.
- `FR-AUTHZ-004` requires sensitive staff actions to record the authenticated actor.

Resource/query and workflow requirements materially affected by authorization:

- `FR-MEMBER-005` requires authorized staff member search over only in-scope Members.
- `FR-ATTENDANCE-007` requires authorized assisted attendance.
- `FR-ATTENDANCE-008` requires actor and mandatory reason for assisted attendance.
- `FR-ATTENDANCE-009` separates Member self-history from authorized staff in-scope history.
- `FR-ATTENDANCE-010` requires actor/reason and reconstructable correction context.
- `FR-ATTENDANCE-011` prohibits silent destructive correction.
- `FR-RETENTION-006` requires an actionable no-show queue for authorized owner/staff users.
- `FR-FOLLOWUP-001` requires authorized staff to append follow-up/contact records.
- `FR-PAYMENT-010` requires a separate authorized offline-payment workflow if offline payment is enabled.
- `FR-AUDIT-001` requires audit records for defined sensitive actions.
- `FR-AUDIT-002` explicitly includes assisted attendance, attendance correction, membership/freeze changes, permission changes, retention/renewal configuration changes, staff financial interventions, and refund/reversal actions in the minimum auditable set.
- `FR-AUDIT-003` requires actor, action, resource, time, and tenant context, with reason/before-after detail where relevant.
- `FR-CROSS-001` requires server-side canonical authorization truth rather than client authority.
- `FR-CROSS-003` requires explicit tenant/gym/branch context in requests, data relationships, and background jobs where relevant.

### 2.2 Non-functional requirements

Security and privacy:

- `NFR-SECURITY-001` tenant isolation across users, jobs, APIs, analytics, storage, and exports.
- `NFR-SECURITY-002` least privilege with explicit role/capability scope.
- `NFR-SECURITY-003` server-side authorization for every protected operation.
- `NFR-SECURITY-009` attributable sensitive actions by actor or trusted system process.
- `NFR-SECURITY-011` sensitive error minimization, including cross-tenant identifiers and unnecessary Member data.
- `NFR-PRIVACY-003` protected exports must enforce authorization scope and should be auditable.

Performance and query safety:

- `NFR-PERFORMANCE-002` requires indexed server-side Member search rather than loading all Members to the client.
- `NFR-PERFORMANCE-003` requires bounded/paginated operational queues.
- `NFR-PERFORMANCE-004` requires efficient dashboard queries without N+1/full-table scan behavior.
- `NFR-PERFORMANCE-006` requires Member-facing APIs to avoid returning owner-only or unrelated records.
- `NFR-SCALABILITY-006` requires indexed tenant/status/date query patterns for operational data.

Maintainability and testability:

- `NFR-MAINTAINABILITY-001` requires shared core rules rather than duplicated independent logic across clients/workers.
- `NFR-MAINTAINABILITY-005` requires Docs-as-Code synchronization for material behavior/architecture changes.
- `NFR-MAINTAINABILITY-006` requires ADR governance for major architecture choices.
- `NFR-TESTABILITY-004` requires positive and negative automated authorization matrix tests for critical capabilities/scopes.

### 2.3 Product-role drivers

The canonical product role model includes Phase 1 roles:

```text
Member
Front Desk Staff
Owner
Manager
```

and conceptual scopes:

```text
Self
Branch
Gym
Organization
Platform
```

`Manager` remains a confirmed role with an exact permission profile still open. Owner status is broad but does not bypass explicit capabilities, resource scope, audit requirements, or business invariants.

Current open permission questions include:

- exact Owner versus Manager split,
- attendance correction authority,
- offline-payment authority,
- refund approval,
- bulk export,
- support impersonation/elevation,
- cross-branch portability.

This ADR must support later resolution of those policies without inventing answers now.

### 2.4 Architecture principles

This decision is especially constrained by:

- `ARCH-PRIN-001` Tenant Isolation by Design.
- `ARCH-PRIN-002` Authentication and Authorization Are Separate Responsibilities.
- `ARCH-PRIN-003` Capability-Based Permissions.
- `ARCH-PRIN-004` Deterministic Server-Side Business Truth.
- `ARCH-PRIN-007` Auditable Sensitive Mutations.
- `ARCH-PRIN-009` Explicit Domain and State Ownership.
- `ARCH-PRIN-010` Transactional Consistency for Correctness-Sensitive Changes.
- `ARCH-PRIN-014` Observability by Design.
- `ARCH-PRIN-015` Data Minimization and Purpose Separation.
- `ARCH-PRIN-016` Secure Defaults and Least Privilege.
- `ARCH-PRIN-018` No Premature Infrastructure.
- `ARCH-PRIN-019` Evolution Through Explicit Decisions.

## 3. Constraints and Assumptions

1. `D-ARCH-015` remains `P0 PROPOSED`; this ADR is a proposal and does not change the canonical status to `DECIDED`.
2. `D-ARCH-004` remains `P0 OPEN`; `ADR-0007` only proposes authentication/session architecture.
3. `D-SEC-002` remains `P0 OPEN`; `ADR-0008` only proposes managed phone OTP/passwordless as the routine Member verification direction.
4. `D-SEC-004` remains `P1 OPEN`; exact session lifetime/device/revocation policy is not defined here.
5. `D-SEC-008` remains `OPEN`; this ADR does not adopt RLS, create RLS policies, or make RLS the primary authorization system.
6. `D-ARCH-014` remains `OPEN`; no managed backend/platform is accepted.
7. `D-ARCH-003` remains `PROPOSED`; exact API/error-contract architecture is separately governed.
8. `D-ARCH-006` remains `OPEN`; the trusted authorization model must work whether the application/API is co-hosted with a web runtime or independently deployed.
9. `D-ARCH-012` and `D-ARCH-013` remain `PROPOSED`; authorization must not be defined by Next.js middleware, React components, a mobile framework, or other client/runtime framework.
10. `D-ARCH-002` and `D-ARCH-017` remain `PROPOSED`; authorization semantics cannot depend on PostgreSQL, Drizzle, Kysely, Prisma, driver objects, or RLS session variables.
11. `D-DATA-004` remains `PROPOSED`; Member and AuthIdentity/Principal are separate concepts.
12. `D-DATA-007` remains unresolved; authorization must not use overlapping Member/Membership lifecycle states as entitlement truth.
13. `D-ARCH-007` remains `OPEN`; background authorization cannot depend on a selected job technology.
14. `D-ARCH-008` remains `OPEN`; no Redis/cache/broker dependency is introduced by this ADR.
15. Direct browser/mobile canonical database mutation remains unapproved. The baseline trust path is `Client -> Trusted GymPulse Runtime -> Authorization -> Canonical Persistence`.
16. A valid authentication session is necessary for protected human operations but is not sufficient for current business access.
17. Provider roles, provider groups, custom JWT claims, provider organization roles, profile metadata, client role strings, or UI visibility cannot be the sole canonical business authority.
18. Capability authorization answers whether the actor may attempt an operation; domain rules independently determine whether the requested business transition is valid.
19. Role names are assignment/UX abstractions and capability bundles, not the final runtime predicate.
20. Owner is not a universal bypass role.
21. Undefined capability, missing scope, ambiguous resource ownership, missing Member-self link, ineligible account, or malformed system context defaults to denial.
22. This ADR does not finalize role-assignment schemas, capability tables, permission-assignment tables, policy tables, or cache tables.
23. This ADR does not introduce support impersonation, platform-admin wildcard access, or an unrestricted superuser path.
24. Policy evaluation must work for single-resource commands, scoped list/search queries, exports, background jobs, provider callbacks, and sensitive recovery/administrative operations.

## 4. Authorization Model

### 4.1 Core authorization formula

The proposed model is:

```text
Principal
  + Current Account Eligibility
  + Named Capability or Member-Self Policy
  + Trusted Scope
  + Trusted Resource Relationship
  -> Authorization Decision
```

The model intentionally combines a small amount of role-derived RBAC with explicit capability, scope, and relationship checks without introducing a general-purpose policy language.

### 4.2 Roles are capability bundles

Conceptually:

```text
Role
  -> stable bundle of named capabilities

Principal
  -> one or more scoped RoleAssignments
```

Example conceptual assignment:

```text
Principal P
  -> Front Desk role
  -> Branch A
  -> capabilities derived from current role bundle
```

Runtime authorization should not scatter conditions such as:

```text
if role == owner
if role == manager
if role == front_desk
```

through routes, repositories, workers, or UI.

The role assignment contributes capabilities and scope; the requested resource still needs trusted scope/relationship resolution.

### 4.3 Stable named capabilities

The current canonical capability catalog uses dot-separated stable machine identifiers, including:

```text
member.read
member.create
member.update
member.export

membership.read
membership.create
membership.update
membership.freeze
membership.cancel

plan.read
plan.manage

attendance.read
attendance.checkin.self
attendance.checkin.assisted
attendance.correct

retention.case.read
retention.case.assign
followup.create
followup.correct

renewal.read
renewal.manage

payment.read
payment.create
payment.record_offline
payment.refund

receipt.read

addon.read
addon.manage

analytics.read
settings.manage
roles.manage
audit.read
export.create
```

Capability names should remain stable machine identifiers even if UI labels, role names, screen names, or workflow labels change.

### 4.4 Capability catalog governance

The capability catalog should be treated as versioned application/security contract material, not UI copy.

Adding a capability should require:

- a documented protected behavior/use case,
- a defined default-deny posture,
- role/policy mapping review,
- positive and negative scope tests,
- audit implications where sensitive,
- Docs-as-Code update when material.

Renaming/removing a capability should require:

- search of role/policy mappings and tests,
- migration/backward-compatibility plan where persisted assignments refer to the old identifier,
- safe default-deny behavior during transition,
- review of audit/reporting semantics if historical records store capability identifiers.

This ADR does not create source-code constants or a capability table.

### 4.5 Policy model comparison

| Model | Phase 1 fit | Complexity | Expressiveness | Operational burden |
|---|---|---:|---|---|
| Direct role checks | Weak | Low initially | Low | Low initially, high drift risk as policy grows |
| Role bundles -> named capabilities -> scope/resource checks | **Strong** | Moderate | Strong for current GymPulse needs | **Low-Moderate** and application-owned |
| General ABAC | Moderate | High | Very high | High policy/governance/debug burden |
| General ReBAC | Moderate/Low for Phase 1 | High | Very high for relationship graphs | High model/service/tooling burden |

The recommended model uses attributes/relationships naturally required by the product, such as `resource.branch_id`, `resource.gym_id`, scoped staff assignments, and the Principal-to-Member-self link. Using these facts does not require a general-purpose ABAC language or ReBAC graph service.

### 4.6 Authorization decision result

The conceptual decision result is intentionally small:

```text
Allowed
Denied
```

Internal diagnostic categories may include safe values such as:

```text
unauthenticated
account_ineligible
missing_capability
scope_mismatch
resource_unresolved
self_mismatch
system_scope_invalid
```

Detailed internal policy reasoning must not be reflected directly to untrusted clients when it could leak protected resource existence, assignments, or tenant information.

### 4.7 Explicit call-site semantics

Application and adapter code should use explicit authorization concepts rather than arbitrary booleans.

Conceptual shapes may include:

```text
authorize(...)
requireCapability(...)
scopeQuery(...)
resolveAuthorizedResource(...)
```

These are responsibility/API-shape examples only. This ADR creates no implementation API or source code.

## 5. Principal, Capability, Scope, and Resource Semantics

### 5.1 Principal

The Principal is the stable provider-independent GymPulse actor resolved after authentication verification.

For a human actor, the Principal supplies identity context but not a precomputed unrestricted authorization conclusion.

Conceptually relevant trusted context may include only what authorization needs:

```text
principal_id
principal_type
current account eligibility
current scoped assignment references
explicit Member-self linkage where applicable
```

Whole provider tokens, provider profile objects, Member profiles, and database rows should not be copied through every use case when a smaller trusted context is sufficient.

### 5.2 Scope hierarchy

The existing conceptual hierarchy is:

```text
Platform
  -> Organization
      -> Gym
          -> Branch
```

and Member self-service uses:

```text
Self
```

Not every scope is necessarily active in every Phase 1 workflow.

Authorization should evaluate scope coverage using trusted ownership relationships rather than assuming that a broader scope is valid merely because a client supplied it.

Example:

```text
Principal has member.read at Branch A
Resource belongs to Branch B
=> Denied
```

### 5.3 Client scope is routing input, not authority

Client-supplied values such as:

```text
tenant_id
gym_id
branch_id
member_id
membership_id
payment_id
case_id
```

may identify the requested route/resource. They are not proof that the Principal can access that resource.

The required trust path is:

```text
request resource identifier
        ↓
trusted scoped lookup / ownership resolution
        ↓
actual organization/gym/branch/resource relationship
        ↓
current assignment + capability / self relationship
        ↓
authorization decision
```

### 5.4 Safe query-before/after-authorization patterns

There is no single safe ordering for every use case.

#### Pattern A: scope-first query

Preferred for many protected lists/reads:

```text
resolve Principal assignment/scope
  -> construct query already constrained to authorized tenant/gym/branch
  -> apply filters/pagination
  -> return authorized records only
```

This is preferred for Member search, no-show queues, renewal queues, payment exceptions, audit history, dashboard drill-down, and other list-style views.

#### Pattern B: minimum ownership metadata then authorize

Some resource operations require trusted resource facts before the authorization decision can be completed:

```text
request opaque resource ID
  -> load minimum trusted ownership metadata through tenant-safe lookup
  -> evaluate capability + scope/resource relationship
  -> if allowed, load additional business data / execute use case
```

This may be appropriate when scope is stored on the target resource or reached through a small trusted ownership chain.

The implementation must avoid a generic global `load by ID -> disclose existence -> then check access` pattern that creates BOLA/IDOR or cross-tenant existence leaks.

### 5.5 Member-self authorization

`Self` is a resource relationship, not merely a role string.

The required conceptual path is:

```text
verified Principal
  -> explicit Principal/Member-self linkage
  -> requested Member-owned resource
  -> verify resource belongs to linked Member and correct tenant context
  -> allow / deny
```

Prohibited shortcuts include:

```text
verified phone == Member.phone
request.memberId == arbitrary client memberId
provider subject == Member ID
member role + any Member ID -> allow
```

Member-facing APIs should favor self-scoped query shapes that do not expose arbitrary cross-Member selection when possible.

### 5.6 Resource-level authorization

Capability alone is insufficient whenever the capability is scoped.

For example:

```text
payment.read
```

means only:

```text
actor may read payments within the actor's authorized resource scope
```

not:

```text
actor may read every payment in every GymPulse tenant
```

The same applies to:

- Member records,
- Memberships,
- Attendance,
- no-show cases,
- Follow-ups,
- Renewals,
- Payments/Receipts,
- Add-ons,
- audit history,
- configuration,
- exports.

### 5.7 List, search, queue, dashboard, and export authorization

Authorization must shape queries, not just individual mutation checks.

Protected list/read patterns should:

- start from an authorized scope or a query object that encodes the resolved scope,
- constrain tenant/gym/branch before pagination/result materialization,
- apply purpose-specific field selection,
- avoid loading global tenant data and filtering in application memory,
- preserve existence-leak protections for direct resource drill-down.

Exports require a separate authorization boundary beyond ordinary reads:

```text
export.create
  + current tenant/resource scope
  + requested data class / report purpose
  + authorized retrieval/access to generated result
  + audit context where required
```

Ordinary `member.read`, `payment.read`, or dashboard access does not automatically imply bulk export authority.

### 5.8 Financial operations

High-impact payment operations must use precise capabilities already represented in the product model, such as:

```text
payment.record_offline
payment.refund
```

A generic mutation capability must not silently become a financial bypass when a more specific capability exists.

Authorization answers whether the actor may attempt the financial operation. Payment provider verification, amount/currency checks, refund/reversal semantics, idempotency, and entitlement effects remain domain/application responsibilities.

### 5.9 Attendance operations

The authorization model distinguishes:

```text
attendance.checkin.assisted
attendance.correct
```

Assisted attendance does not imply correction authority.

Correction is independently sensitive and auditable, and the final role allowed to perform it remains a product policy question.

### 5.10 Configuration and permission changes

Mutations such as:

- no-show threshold changes,
- renewal schedule changes,
- plan pricing changes,
- role/permission changes,
- tenant settings,
- bulk import/export,

require explicit relevant capabilities and audit context.

This ADR does not assign these actions permanently to Owner or Manager while the product policy remains open.

## 6. Options Considered

### Option A: GymPulse-owned application authorization module

Conceptually:

```text
Principal
  + current assignments
  + named capability
  + trusted resource/scope relationship
  + Member-self relation where applicable
  -> application/security policy
  -> allow / deny
```

Assignments/scopes are read from canonical GymPulse state through persistence/application ports. The authorization semantics are application-owned and framework/provider-independent.

Strengths:

- directly matches current requirements and architecture principles,
- immediate/current assignment checks support revocation independent of auth-session expiry,
- resource relationships and Member-self access can be expressed explicitly,
- shared by web/API/worker/tests,
- avoids a new network dependency,
- keeps provider migration localized,
- easy to pair later with database defense in depth.

Tradeoffs:

- GymPulse owns secure policy implementation, testing, review, and observability,
- capability/scope conventions require discipline,
- query scoping and resource authorization must be implemented consistently rather than left to framework magic.

### Option B: Authentication-provider roles/claims as primary authority

Conceptually:

```text
provider JWT / organization role / group / metadata
  -> route/application access
```

Strengths:

- superficially simple when the provider already emits role/group claims,
- fewer application reads in some flows,
- provider administration UI may reduce initial assignment tooling.

Material weaknesses for GymPulse:

- provider identity/session state is already architecturally separate from GymPulse authorization,
- claims may remain valid/stale after an internal assignment or capability is revoked,
- branch/resource and Member-self relationships are more detailed than typical coarse provider roles,
- provider role semantics couple business authorization to the selected authentication vendor,
- background/system contexts do not map naturally to human provider roles,
- direct use of provider claims can make provider migration rewrite business authorization semantics.

Provider claims may be safe inputs for identity/session verification or carefully bounded hints after validation, but they are not recommended as the canonical authority.

### Option C: framework middleware as primary authorization

Conceptually:

```text
route middleware
  -> role/scope check
  -> handler
```

Strengths:

- useful for coarse early rejection,
- convenient for broad authenticated-area boundaries,
- may reduce accidental unauthenticated route exposure.

Limitations:

- route-level metadata usually lacks the trusted resource facts needed for Member, branch, Payment, export, or configuration authorization,
- background handlers and provider callbacks do not share browser/web middleware naturally,
- policy becomes framework-bound,
- middleware can encourage role-name checks before resource ownership is known,
- a handler invoked through a different entry path can bypass middleware-only policy.

Framework middleware is a useful adapter/defense layer but not sufficient as the sole authorization authority.

### Option D: external authorization/policy engine

Conceptually:

```text
Principal + relationships/attributes + action + resource
  -> external policy-as-code / relationship / permission service
  -> allow / deny
```

Strengths:

- centralized policy evaluation across many services/languages,
- strong fit for large relationship graphs or independently deployed systems,
- mature policy/change/audit tooling can be valuable at scale,
- explicit policy-as-data or policy-as-code can support complex future models.

Tradeoffs for current Phase 1:

- adds a new critical security dependency and outage mode,
- policy data synchronization and consistency/revocation semantics become distributed-system problems,
- increases local development, testing, observability, deployment, and incident complexity,
- may encourage modeling ordinary branch/Member relationships in a general policy language/graph before requirements justify it,
- adds provider/tooling lock-in and a migration surface.

The current GymPulse model is expressible with a small explicit application module, named capabilities, scoped assignments, and resource relationships. No current requirement demonstrates the need for a separate external policy engine.

### Option E: database RLS as primary authorization

Conceptually:

```text
request/session context
  -> database role/session variables/policies
  -> rows allowed/denied by database
```

Strengths:

- powerful data-layer defense against accidental cross-tenant row access,
- can reinforce tenant isolation close to the data,
- useful if future direct-client database access is ever approved.

Limitations as primary GymPulse authorization:

- does not by itself model every application capability, sensitive action, Member-self operation, export policy, business workflow, provider callback, background job, or audit requirement cleanly,
- can couple authorization semantics tightly to database topology/session context,
- application still needs authorization before provider calls, object storage, exports, and non-database effects,
- policy/session context failures can be difficult to diagnose without an application-owned model,
- `D-SEC-008` is still open and separately governed.

RLS may later provide defense in depth. It is not recommended as the sole or primary authorization architecture.

## 7. Evaluation

### 7.1 Authorization architecture matrix

| Criterion | GymPulse application policy module | Provider roles/claims | Middleware-only | External policy engine | RLS-primary |
|---|---|---|---|---|---|
| Tenant scope correctness | **Strong** with trusted ownership resolution | Moderate/Weak for current resource detail | Moderate | Strong if modeled/synchronized correctly | Strong for database rows only |
| Resource-level authorization | **Strong** | Weak/Moderate | Weak | **Strong** | Moderate/Strong for row-addressable resources |
| Member-self support | **Strong** via explicit relationship | Weak if based on provider metadata | Weak | Strong | Moderate; awkward outside row queries |
| Capability model | **Strong** and matches canonical catalog | Moderate; vendor model coupling | Moderate/coarse | Strong | Weak/Moderate outside DB operations |
| Revocation behavior | **Strong** with current assignment checks | Weak/Moderate if claims are stale | Depends on backing state | Strong if policy data is current; distributed consistency required | Strong for current DB policy state; incomplete for non-DB effects |
| Framework independence | **Strong** | Moderate | **Weak** | Strong | Strong at DB layer but app semantics still needed |
| Provider independence | **Strong** | **Weak** | Moderate | Moderate; new policy-provider/tool dependency | Moderate; database-specific |
| Background-job support | **Strong** with bounded System Context | Weak | Weak | Strong if modeled | Moderate for DB queries; incomplete for job operation semantics |
| Provider-callback support | **Strong** with bounded callback context | Weak | Weak | Strong if modeled | Moderate for DB rows; incomplete for external effects |
| Auditability | **Strong** with explicit actor/capability/resource context | Moderate | Moderate | Strong if integrated | Moderate; application audit still required |
| Testability | **Strong** in process/application tests | Moderate | Moderate | Strong but requires service/test fixture | Moderate/High for DB integration tests only |
| Existence-leak resistance | **Strong** with scoped query/resource patterns | Weak/Moderate | Moderate | Strong if carefully modeled | Strong for row visibility but API mapping still required |
| Operational complexity | **Low-Moderate** | Low initially | Low initially | **High** | Moderate/High depending on policy complexity |
| New critical dependencies | **None beyond canonical application state** | Authentication provider becomes policy authority | Framework/runtime becomes policy authority | **Yes** | Database/policy context becomes central authorization dependency |
| Performance | Strong with scoped queries/request context | Fast claim checks but stale-state risk | Fast for coarse checks | Network/policy lookup latency unless local/embedded | Strong row filtering; application checks still needed |
| Future scale | Strong for Phase 1 and modular evolution | Limited by provider/business mismatch | Limited | Very strong for large distributed relationship policy | Strong for data-layer isolation, not complete business policy |
| Policy evolution | Strong with explicit capability governance | Coupled to provider semantics | Coupled to framework/route structure | Very strong but higher governance cost | Coupled to schema/policy model |
| Phase 1 simplicity | **Strongest fit** | Superficially simple, security mismatch | Simple but incomplete | Too complex for current evidence | Too database-centric/incomplete |
| Reversibility | **High** while interfaces stay explicit | Medium/Low | Medium | Medium | Medium |
| Overall GymPulse fit | **Recommended** | Not recommended as authority | Supporting layer only | Defer until demonstrated need | Defense in depth only; separate decision |

### 7.2 Policy-model matrix

| Model | Phase 1 fit | Complexity | Expressiveness | Operational burden |
|---|---|---|---|---|
| Direct role checks | Weak | Low initially | Low | Policy drift, special cases, poor scope semantics |
| Capability + scoped role assignments | **Recommended** | Moderate | High for current needs | Moderate and understandable |
| General ABAC | Moderate | High | Very high | High policy authoring/debugging/governance burden |
| General ReBAC | Moderate/Low | High | Very high for graph relationships | High modeling/storage/service burden |

### 7.3 Evaluation conclusion

Current GymPulse requirements already provide the essential policy vocabulary:

```text
stable Principal
named capability
scoped role/assignment
trusted organization/gym/branch ownership
explicit Member-self relationship
current account eligibility
deny by default
```

This is enough to implement the current Phase 1 authorization model safely without introducing a general policy language, a relationship graph service, an authorization SaaS, or RLS as the primary authority.

The strongest current direction is therefore:

```text
GymPulse-owned application authorization module
+
stable named capabilities
+
roles as capability bundles
+
current scoped assignments
+
trusted resource ownership resolution
+
explicit Member-self relationship
+
deny by default
+
server-side enforcement
```

Framework middleware and future RLS may add complementary layers. Neither replaces the application authorization module.

## 8. Proposed Decision

**Propose a GymPulse-owned, provider-independent application authorization module as the authoritative Phase 1 authorization boundary.**

This is a Proposed ADR recommendation only. Canonical `D-ARCH-015` remains `PROPOSED` until explicit review/approval evidence changes it.

If later accepted, the architecture rules are:

1. All protected human operations require a verified GymPulse Principal before authorization.
2. Current GymPulse-controlled authorization state is authoritative for tenant/resource/business access; provider roles/groups/claims/metadata are not the sole authority.
3. Roles are capability bundles and assignment conveniences, not the final runtime predicate.
4. Runtime checks use stable named capabilities from the governed capability catalog.
5. Authorization evaluates the capability against trusted current scope/resource relationships rather than trusting client-supplied tenant/gym/branch/resource values.
6. Member self-service uses an explicit Principal-to-Member-self relationship and current resource ownership, not mutable phone/email equality or arbitrary client Member IDs.
7. `Self`, `Branch`, `Gym`, `Organization`, and `Platform` remain conceptual scope types; only scopes justified by the current workflow/policy are used.
8. Undefined capability, missing/invalid assignment, missing/ambiguous ownership, invalid Member-self relationship, or ineligible account denies by default.
9. The trusted authorization module is framework-independent and callable from application/API runtimes, server-side web runtimes, background handlers, provider-callback handlers where appropriate, and tests.
10. Framework middleware may perform coarse authentication/early access rejection but does not replace resource/use-case authorization.
11. Application authorization remains mandatory even if `D-SEC-008` later adopts RLS or equivalent data-layer defenses.
12. Direct client canonical database mutation remains unapproved and is not introduced by this ADR.
13. For many list/search/queue/dashboard queries, authorization should constrain the query to already-authorized tenant/gym/branch scope before result materialization.
14. When resource metadata is required to decide authorization, load only the minimum trusted ownership metadata through a tenant-safe lookup, authorize, then load/execute the full use case.
15. Do not expose cross-tenant resource existence through globally loading a resource and returning distinguishable errors before scope checks.
16. Exports require separate capability/scope/retrieval authorization and audit treatment where required; ordinary read access does not imply bulk export.
17. Sensitive financial and attendance operations use the precise named capability already modeled, such as `payment.record_offline`, `payment.refund`, `attendance.checkin.assisted`, and `attendance.correct`.
18. Authorization determines whether an actor may attempt an operation. Domain/application rules independently determine whether the business state transition is valid.
19. Role/capability/scope assignment changes are security-sensitive, tenant-scoped, authorized, and auditable.
20. Current assignment/account state must take effect for future protected operations without waiting for a valid external authentication session to expire.
21. The baseline uses no distributed cross-request authorization cache. Request-scoped memoization/context is allowed when it cannot outlive the request and preserves tenant/resource identity.
22. Any future cross-request authorization cache requires explicit invalidation, bounded staleness, revocation semantics, tenant-safe keys, and negative tests. No Redis/cache product is selected.
23. Background execution uses an explicit bounded System Principal/System Execution Context with job type/operation and tenant/gym/branch scope as required; it never impersonates Owner/PlatformAdmin for convenience.
24. Missing/malformed background tenant scope fails safely rather than falling back to an unbounded global mutation path.
25. Verified provider callbacks use a provider-specific trusted callback context and a bounded application use case. They do not receive arbitrary human capabilities.
26. Scheduled reconciliation/no-show/renewal processes use explicit operation type plus tenant context and current-state rechecks before applying effects.
27. No Phase 1 support impersonation, superuser wildcard, platform-admin bypass, or invisible elevation path is created by this decision.
28. High-impact operations may revalidate authorization-relevant account/assignment/resource state inside the correctness-sensitive application transaction when concurrency/TOCTOU risk materially justifies it.
29. Authorization context should be minimized to stable internal identifiers and required policy facts rather than whole profiles/provider tokens/DB rows.
30. External client responses expose only safe `401`/`403`/`404`-style outcomes according to the later API contract, while internal telemetry may record safe reason categories for diagnosis.
31. The capability catalog is code/docs-governed; current role assignments/scopes are canonical application state. Exact persistence schema remains a later data-model decision.
32. No external authorization engine/library/service is required for Phase 1 based on current evidence. A later proposal may introduce one only when policy/distribution/scale requirements justify the additional dependency and migration cost.

### 8.1 Recommended execution boundary

The conceptual human-request path is:

```text
basic safe input parsing / identifier validation
  -> authentication verification
  -> Principal resolution
  -> trusted tenant/resource ownership resolution
  -> capability / Member-self authorization
  -> application handler
  -> domain/business validation
  -> transaction / persistence / effects
```

Exact ordering can vary safely when resource metadata is required for authorization. The invariant is that no protected business effect or protected data disclosure occurs before the required authorization decision.

### 8.2 Authorization versus domain rules

Examples:

```text
authorization:
  Can this actor attempt membership.freeze for this Membership in this Gym?

domain rule:
  Is this Membership currently eligible to enter Frozen state under current policy?
```

```text
authorization:
  Can this staff Principal create assisted attendance for this Branch/Member?

domain rule:
  Is the Membership attendance-eligible and is the duplicate rule satisfied?
```

Both must pass.

### 8.3 Authorization versus validation

The architecture distinguishes:

```text
request/boundary validation
authentication
Principal resolution
trusted scope/resource resolution
authorization
domain/business validation
transaction
```

Basic format validation may happen before authentication to reject malformed input safely. Resource metadata may be loaded before the final authorization decision when that metadata is required to establish ownership. Domain eligibility/state validation remains separate from authorization.

### 8.4 Assignment and revocation model

Conceptually:

```text
Principal
  -> current RoleAssignment(s)
      -> Role
          -> capability bundle
      -> Scope
```

Current assignment/scope/capability state is canonical GymPulse application data.

A role assignment or capability/scope change must:

- itself be authorized,
- stay tenant-scoped,
- be auditable when security-sensitive,
- affect future authorization decisions promptly enough to meet the later approved security/session policy.

A currently valid provider session cannot preserve permission removed from GymPulse state.

### 8.5 Authorization caching posture

Baseline:

```text
no cross-request authorization cache required
request-scoped resolved authorization context allowed
```

Request-scoped reuse may prevent repeated assignment/resource lookups inside one request when the same trusted facts are reused safely.

A future cross-request cache must prove:

- cache key includes relevant Principal and tenant/resource/policy version dimensions,
- invalidation/change propagation is defined,
- maximum staleness is bounded,
- revocation semantics are tested,
- negative cache behavior cannot create cross-tenant confusion,
- cache failure does not become fail-open access,
- measured benefit justifies the complexity.

This ADR does not create Redis, cache infrastructure, or a cache decision.

### 8.6 Transaction and TOCTOU posture

Most authorization checks occur before a correctness-sensitive transaction.

For sensitive operations where authorization-relevant state can change between authorization and mutation, the application may need to revalidate current facts within the transaction or ensure that the final mutation is constrained to the same authorized tenant/resource.

Examples include:

- role/capability changes concurrent with privileged mutation,
- resource reassignment between branches/gyms where such movement is supported,
- Member-self link revocation concurrent with a sensitive self-service operation,
- high-impact financial/configuration operations.

The architecture does not require database locking for every harmless read. The revalidation/locking strategy should be proportional to the operation's risk and selected persistence model.

## 9. Security and Privacy Impact

### 9.1 Tenant isolation

Application authorization is the mandatory application-layer tenant-isolation mechanism for protected operations.

Every protected human operation must preserve:

```text
Principal
  + verified tenant/resource ownership
  + capability or Member-self relationship
```

Global unscoped protected queries followed by UI or in-memory filtering are unacceptable.

### 9.2 BOLA / IDOR resistance

Opaque identifiers reduce enumeration convenience but are not authorization controls.

The architecture prevents object-level authorization bypass by:

- using scoped queries where possible,
- resolving trusted resource ownership rather than client scope,
- verifying Member-self relationships,
- checking current capability + scope for staff operations,
- mapping unauthorized existence to safe error behavior.

### 9.3 Member-self security

A verified Member authentication channel/session does not authorize arbitrary Member resources.

Self-service authorization requires the explicit Principal-to-Member relationship. Phone number equality, provider subject equality, or a route Member ID cannot replace it.

### 9.4 Provider-claim privilege escalation

Provider roles/groups/custom JWT claims/organization membership/profile metadata do not become direct GymPulse business permissions.

The verified provider subject resolves to the internal Principal; current GymPulse authorization state is then evaluated.

### 9.5 Hidden UI / direct route invocation

Client-side hiding improves UX only. A user who calls a hidden or disabled endpoint directly receives the same server-side authorization enforcement.

### 9.6 Role escalation and permission administration

Role/permission/scope changes are security-sensitive actions requiring:

- named administrative capability,
- current tenant/resource scope,
- target Principal/assignment context,
- actor attribution,
- audit history where required.

This ADR does not determine which Phase 1 role receives `roles.manage` or other sensitive capabilities where policy remains conditional/open.

### 9.7 Exports

Bulk exports have greater disclosure impact than ordinary record reads.

They require explicit export authorization, scoped data selection, safe generated-result access, and auditability according to the product/security policy.

### 9.8 Unauthorized existence protection

The internal authorization layer may distinguish safe reason categories, but the public API should not disclose protected resource existence through inconsistent `403` versus `404` behavior that enables cross-tenant enumeration.

`D-ARCH-003` will govern the exact API error contract. This ADR requires only that the mapping be deliberate, consistent, and non-leaking.

### 9.9 Support and platform access

No support impersonation, PlatformAdmin wildcard, or permanent superuser bypass is introduced for Phase 1.

If future support access is required, it needs explicit purpose, scope, capability, audit, and time-bounded elevation where appropriate, and may warrant a separate security/architecture decision.

### 9.10 RLS separation

This ADR explicitly establishes:

```text
Application Authorization = mandatory
RLS = possible defense in depth under D-SEC-008
```

It does not establish:

```text
RLS replaces application authorization
```

or:

```text
application authorization means RLS is unnecessary
```

### 9.11 Data minimization

Authorization context should carry only the facts needed to decide access. Provider tokens, credentials, full profiles, unrestricted Member records, and unrelated role rows should not be propagated merely for convenience.

## 10. Reliability, Performance, and Scalability Impact

### 10.1 Availability posture

The recommended module does not add an external authorization service to the critical path.

Protected operations depend on:

- trusted application runtime availability,
- current authorization-state persistence/query availability,
- required resource ownership data.

If current authorization state cannot be established safely because canonical persistence is unavailable or ambiguous, protected operations fail closed rather than use stale/unverified authority.

### 10.2 Assignment lookup frequency

A naive implementation can create repeated assignment/resource lookups.

The design should favor:

- one request-scoped Principal/assignment context where safe,
- scope-first query construction,
- purpose-specific authorization/read queries,
- batching/resource-aware lookups for lists,
- avoiding per-row authorization N+1 patterns.

Performance optimization must not weaken tenant correctness or current revocation semantics.

### 10.3 List/query performance

Authorized list/search/queue reads should push tenant/scope predicates into the query/data-access boundary so the database can use tenant/branch/status/date indexes selected later.

Avoid:

```text
load all tenant/global rows
  -> authorize each in application memory
```

for normal operational queries.

### 10.4 Scaling

The authorization module can remain in-process with the trusted application architecture while the application scales horizontally because authorization state comes from canonical shared state, not process-local permanent state.

A later move to distributed services may justify extracting policy evaluation or introducing a dedicated policy system, but that requires new evidence/ADR rather than being pre-optimized now.

### 10.5 Cache correctness

No distributed cache is required. If a future cache is proposed, the primary risk is stale permission after revocation. Correctness/revocation tests must precede adoption.

## 11. Operations and Observability Impact

### 11.1 Security telemetry versus business audit

Not every harmless `allow`/`deny` decision requires a permanent audit row.

Operational/security telemetry may capture safe fields such as:

```text
request/correlation ID
principal_id or safe actor category when resolved
tenant/gym/branch reference where privacy-safe
capability
authorization result
safe internal reason category
route/use-case identifier
```

Sensitive business/security mutations should separately create durable audit history according to `FR-AUDIT-001..003`.

### 11.2 Sensitive-action audit context

Where applicable, sensitive mutation audit may include:

```text
principal_id
tenant/gym/branch
capability
resource_type/resource_id
action
reason where required
request/correlation ID
timestamp
before/after summary where policy requires
```

Never include:

```text
authentication tokens
complete cookies
passwords
OTP/magic-link/recovery secrets
provider credentials
unnecessary private resource content
```

### 11.3 Authorization failure diagnostics

Operators should be able to distinguish internally between categories such as:

- unauthenticated request,
- unmapped/ineligible Principal,
- missing capability,
- scope mismatch,
- Member-self mismatch,
- unresolved resource ownership,
- invalid System Principal/job context,
- stale/invalid assignment state.

External responses remain deliberately less detailed when disclosure would be unsafe.

### 11.4 Assignment/change operations

Role/capability/scope administration should expose enough audit and operational state to investigate:

- who granted/revoked access,
- which Principal was affected,
- which tenant/scope was affected,
- which capability bundle/role changed,
- when the change occurred,
- whether subsequent access correctly reflects the new state.

Exact administrative UI/process remains outside this ADR.

### 11.5 External policy-engine operations

Because no external policy engine is selected, there is no new policy-service availability/SLO/configuration/secrets surface in Phase 1.

If later introduced, monitoring must include policy-engine availability, policy-data synchronization, decision latency, version/config rollout, fail-closed behavior, and migration/reconciliation of authorization data.

## 12. Testing and Validation

Before this ADR can be accepted and the authorization implementation considered production-ready, non-production validation must cover at least:

1. Member reads their own protected Member resource.
2. Member cannot read another Member's protected resource.
3. Member ID substitution/BOLA attempt is denied even with a valid Member session.
4. Front Desk with appropriate capability/scope can read authorized Branch data.
5. Front Desk is denied equivalent resource in another Branch outside assignment scope.
6. Owner access is limited to the correct Gym despite broad Owner role semantics.
7. Capability present plus wrong scope is denied.
8. Correct scope plus missing capability is denied.
9. A hidden/disabled UI action called directly against the server is denied when capability is absent.
10. A revoked role/scope/capability denies future protected operations while authentication session remains valid.
11. Role/capability change becomes effective for subsequent authorization decisions according to the current-state model.
12. Member search returns only authorized scoped Members.
13. No-show/retention queue returns only authorized scoped cases.
14. Payment query/exception queue returns only authorized scoped financial records.
15. Unauthorized resource IDs use safe existence behavior without cross-tenant disclosure.
16. Export requires separate `export.create` or equivalent governed export capability and correct scope.
17. Refund requires explicit `payment.refund` capability and correct resource scope.
18. Attendance correction requires explicit `attendance.correct`; `attendance.checkin.assisted` alone is insufficient.
19. Forged/injected provider role/group/custom claim does not grant GymPulse business access.
20. Client-supplied tenant/gym/branch spoofing is denied after trusted ownership resolution.
21. Background job with correct bounded operation and tenant scope can perform only its approved use case.
22. Background job with missing/wrong tenant scope fails safely and cannot fall back to global access.
23. Verified provider callback can invoke only the bounded callback use case and cannot act as arbitrary Owner/Member/Front Desk.
24. Any Member-recovery staff capability introduced later is correctly tenant-scoped and audited.
25. Authorization policy tests can execute without requiring the selected web/mobile framework.
26. With RLS disabled/not adopted, application authorization still prevents cross-tenant protected access.
27. If future RLS is enabled, integration tests prove data-layer policies reinforce rather than conflict with application authorization.
28. If cross-request authorization caching is later proposed, revocation/staleness/invalidation experiments prove the approved bound before adoption.
29. Automated negative cross-tenant matrix covers critical capabilities, scopes, resource substitutions, list endpoints, and direct resource endpoints.
30. Sensitive authorized mutation produces stable actor/capability/resource audit attribution where required.
31. Owner role without a specifically granted conditional capability does not receive an implicit wildcard bypass.
32. Manager policy remains only the explicitly configured capability bundle; title alone does not expand authority.
33. Export retrieval/access is authorized independently from export creation if generated artifacts are used.
34. Safe error mapping does not create an existence oracle across `401`/`403`/`404` outcomes.
35. Assignment/resource ownership change concurrency for selected high-impact operations is tested for TOCTOU-safe final mutation behavior.

Task 0017 creates no test implementation.

## 13. Migration and Rollout

There is no existing GymPulse authorization implementation to migrate.

If this ADR and dependent decisions are later approved, rollout should be evidence-driven:

```text
approve/review D-ARCH-015
  -> freeze initial capability naming/catalog contract
  -> document initial role bundles without resolving still-open product policy by assumption
  -> define conceptual/persistence model for Principal assignments and scopes in the later data-model phase
  -> implement provider-independent authorization interfaces/application module
  -> implement trusted resource ownership resolution/scoped query helpers
  -> implement Member-self relationship authorization
  -> add bounded System Principal/provider-callback contexts
  -> add positive/negative authorization matrix tests
  -> add safe telemetry and sensitive-action audit integration
  -> validate revocation while sessions remain valid
  -> validate list/search/export scoping and existence-leak behavior
  -> evaluate D-SEC-008 separately for data-layer defense in depth
```

### 13.1 No broad role bootstrap by assumption

Initial role bundles may be seeded later only from approved product policy.

Do not convert current conditional/open matrix cells into broad permissions merely to simplify implementation.

### 13.2 No wildcard owner migration

If legacy/prototype logic contains broad role checks, migration should replace them with explicit named capability + scope checks rather than preserving a hidden `Owner = *` wildcard.

### 13.3 Capability changes

When capability identifiers change after deployment, migration must preserve safe deny-by-default semantics and update role bundles/assignments/tests atomically enough to avoid unintended privilege expansion.

## 14. Reversibility

The proposed application-owned model is intentionally reversible.

Stable internal concepts:

```text
Principal
Capability
Scope
Resource Relationship
Member-self Relationship
Authorization Decision
```

can later be mapped to:

- an embedded policy library,
- an external policy-as-code engine,
- a relationship authorization system,
- stronger database defense-in-depth,

without rewriting every business-domain API, provided the application keeps a clear authorization boundary and avoids provider/framework-specific semantics at call sites.

Reversibility is reduced if:

- provider role IDs are stored throughout business tables,
- framework route metadata becomes the only policy definition,
- database RLS session state becomes the only authorization representation,
- authorization checks are scattered as arbitrary booleans/role strings,
- capability identifiers are changed casually without migration discipline.

## 15. Threats, Risks, and Mitigations

| Threat / risk | Mitigation / boundary |
|---|---|
| BOLA / IDOR | Scoped queries or minimum trusted ownership lookup followed by resource-aware authorization; opaque ID alone never grants access |
| Cross-tenant access | Current Principal assignment + trusted tenant/resource ownership + capability; default deny; negative tenant tests |
| Stale role/capability | Read/evaluate current GymPulse authorization state; valid auth session does not preserve revoked business access |
| Provider-claim privilege escalation | Provider claims establish only verified identity/session facts; GymPulse capability/scope state remains authority |
| Client-supplied tenant spoofing | Client scope is routing input; independently derive/verify resource ownership |
| Hidden-route invocation | Server-side authorization on every protected operation; UI hiding is not security |
| Role escalation | Role/assignment/capability administration requires separate named capability, scope, and audit |
| Member-self ID substitution | Explicit Principal-to-Member relationship and server-side self/resource equality; no phone/member-ID shortcut |
| Bulk export abuse | Separate export capability, scope/data-class checks, result access control, auditability |
| Financial intervention bypass | Precise capabilities such as `payment.record_offline` and `payment.refund`; domain/payment rules remain separate |
| Attendance privilege widening | `attendance.checkin.assisted` and `attendance.correct` remain separate capabilities |
| Background-job scope loss | Bounded System Context with explicit tenant/gym/job operation; missing/malformed scope fails closed |
| Provider callback overreach | Verified provider context maps only to bounded callback use case, never generic human capabilities |
| Support/admin bypass | No baseline impersonation/superuser wildcard; future support access requires explicit governance/purpose/scope/audit |
| Authorization cache staleness | No cross-request cache baseline; future cache requires bounded staleness/invalidation/revocation tests |
| Existence enumeration | Consistent safe 401/403/404 mapping; scope-safe lookups; no cross-tenant diagnostic details |
| Framework bypass | Authorization module remains application-owned and callable independently of route middleware |
| RLS policy drift | Application authorization remains primary; any future RLS is separately reviewed/tested under D-SEC-008 |
| TOCTOU between authorization and mutation | Revalidate current authorization/resource facts or constrain final mutation in transaction for high-impact concurrent-change cases |
| N+1 authorization queries | Request-scoped trusted context, scope-first query construction, batching/purpose-specific query adapters |
| Authorization DB failure | Protected operation fails closed; no stale implicit privilege fallback |
| Policy sprawl | Stable capability catalog, explicit role bundles, no general ABAC/ReBAC language until requirements justify it |
| Domain-rule leakage into authorization | Authorizer decides actor permission; domain owns business eligibility/state transition; both must pass |

## 16. Open Questions

- Who is the authorized decision owner for `D-ARCH-015`?
- Which exact Manager capabilities will the pilot approve?
- Which role/capability, if any, may perform attendance correction?
- Which role/capability may record offline payments under `FR-PAYMENT-010` if enabled?
- Which role/capability may initiate/approve refunds?
- What exact bulk-export policy and data classifications will be approved?
- Is any support/elevation capability required for Phase 1, or should it remain absent?
- What cross-branch Member portability behavior will the product eventually approve?
- What exact persistence representation will later model Role, RoleAssignment, capability bundles, scopes, and Member-self links?
- What exact API error envelope/status mapping will `D-ARCH-003` approve while preserving existence confidentiality?
- Does any high-impact operation require stronger in-transaction authorization-state revalidation after the final persistence model is known?
- What exact latency/scale evidence, if any, would justify a cross-request authorization cache?
- What future service/deployment scale would justify evaluating an external policy engine or ReBAC system?
- What `D-SEC-008` defense-in-depth model best reinforces this application authorization architecture after database/runtime topology is decided?

## 17. Decision Evidence

### 17.1 Canonical repository evidence

Latest `main` establishes:

- `D-ARCH-015` is `P0 PROPOSED` with the current direction: central server-side capability + tenant/resource-scope enforcement; exact policy/library/storage implementation remains open.
- `FR-AUTHZ-001..004` require tenant-scoped authorization, named capabilities, Member self-only access, and sensitive actor attribution.
- `NFR-SECURITY-001..003` require tenant isolation, least privilege, and server-side authorization.
- `NFR-TESTABILITY-004` requires positive/negative permission-matrix tests.
- `user-roles.md` defines named capability identifiers, conceptual scopes, roles as scoped assignments, Owner non-bypass semantics, and explicit open permission questions.
- the C4/component/data-flow architecture already contains separate Principal Resolver, Tenant/Resource Context Resolver, Capability Authorizer, Background System Execution Context, and provider callback trust paths.
- `ADR-0007` preserves `Authentication != Authorization` and current GymPulse-controlled authorization after authentication.
- `ADR-0008` preserves `verified channel != Member authorization` and requires an explicit Member-self link.
- `ADR-0006` keeps application authorization GymPulse-owned even when managed platforms offer Auth, RLS, or client SDKs.
- direct client canonical database mutation is not an approved baseline architecture.
- `D-SEC-008` remains Open; RLS/data-layer isolation is separately governed.
- `D-ARCH-008` remains Open; Redis/cache is not a baseline requirement.
- no repository approval evidence marks an authorization implementation accepted or `D-ARCH-015` decided.

### 17.2 Why no external product research was required for this ADR

Task 0017 evaluates architecture categories rather than selecting an authorization product or library.

The repository requirements are sufficient to compare:

- application-owned policy,
- provider-claim authority,
- middleware-only authority,
- external policy-engine architecture,
- RLS-primary architecture,

without relying on product-specific capabilities. No current external authorization product/library is selected, installed, provisioned, or recommended as a Phase 1 dependency by this ADR.

### 17.3 Acceptance evidence still missing

`ADR-0009` remains `Proposed` and `D-ARCH-015` remains `PROPOSED` because acceptance still requires at least:

- an authorized decision owner,
- explicit approval evidence,
- review of the proposed boundary by architecture/security/product as applicable,
- approved initial capability/role policy for still-open sensitive actions,
- later persistence representation review,
- positive/negative automated authorization matrix evidence,
- cross-tenant/BOLA/existence-leak validation,
- revocation-with-valid-session validation,
- background/provider-context validation,
- export/financial/attendance-correction policy validation,
- compatibility review with the later `D-SEC-008` data-layer isolation decision.

## 18. Related Documents

- `README.md`
- `../README.md`
- `../00-overview/assumptions.md`
- `../01-product/functional-requirements.md`
- `../01-product/non-functional-requirements.md`
- `../01-product/user-roles.md`
- `../01-product/personas.md`
- `../01-product/user-journeys.md`
- `../02-architecture/architecture-principles.md`
- `../02-architecture/architecture-overview.md`
- `../02-architecture/system-context.md`
- `../02-architecture/container-architecture.md`
- `../02-architecture/component-architecture.md`
- `../02-architecture/data-flow.md`
- `../02-architecture/technology-stack.md`
- `ADR-0001-modular-monolith.md`
- `ADR-0004-database-engine.md`
- `ADR-0005-data-access-migration-strategy.md`
- `ADR-0006-managed-backend-responsibilities.md`
- `ADR-0007-authentication-session-architecture.md`
- `ADR-0008-member-authentication-method.md`
- legacy migration sources: `../02-user-roles-permissions.md`, `../05-system-architecture.md`, `../12-security-audit.md`, `../16-open-decisions.md`
