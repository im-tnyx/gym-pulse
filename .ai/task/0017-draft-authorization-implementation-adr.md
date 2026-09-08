# Task 0017: Draft Authorization Implementation Boundary ADR

## Goal

Draft one `Proposed` ADR for canonical architecture decision `D-ARCH-015` defining the provider-independent GymPulse authorization implementation boundary and policy model without creating authorization code, schema, migrations, RLS, policy-engine configuration, caches, or provider infrastructure.

Canonical target:

`docs/adr/ADR-0009-authorization-implementation.md`

## Inputs Read

Current structured repository inputs reviewed from latest `main`:

- `.ai/README.md`
- `.ai/current-state.md`
- `.ai/task/0016-draft-member-authentication-method-adr.md`
- `docs/README.md`
- `docs/00-overview/assumptions.md`
- `docs/01-product/functional-requirements.md`
- `docs/01-product/non-functional-requirements.md`
- `docs/01-product/user-roles.md`
- `docs/01-product/personas.md`
- `docs/01-product/user-journeys.md`
- `docs/02-architecture/architecture-principles.md`
- `docs/02-architecture/architecture-overview.md`
- `docs/02-architecture/system-context.md`
- `docs/02-architecture/container-architecture.md`
- `docs/02-architecture/component-architecture.md`
- `docs/02-architecture/data-flow.md`
- `docs/02-architecture/technology-stack.md`
- `docs/adr/README.md`
- `docs/adr/ADR-0001-modular-monolith.md`
- `docs/adr/ADR-0004-database-engine.md`
- `docs/adr/ADR-0005-data-access-migration-strategy.md`
- `docs/adr/ADR-0006-managed-backend-responsibilities.md`
- `docs/adr/ADR-0007-authentication-session-architecture.md`
- `docs/adr/ADR-0008-member-authentication-method.md`

Legacy authorization/security files remain migration/evidence sources only. Current structured documents control when they conflict.

No external authorization product/library research was required because Task 0017 compares architecture categories and does not select a product or library.

## Repository State Verified

Before creating `ADR-0009`:

- `docs/adr/ADR-0009-authorization-implementation.md` did not exist on current `main`.
- `.ai/task/0017-draft-authorization-implementation-adr.md` did not exist.
- `D-ARCH-015` remained `P0 PROPOSED` in `docs/00-overview/assumptions.md`.
- `D-ARCH-015` remained the next bounded item in `docs/adr/README.md` after `ADR-0008`.
- repository search found no explicit approval evidence promoting `D-ARCH-015` to `DECIDED` or an authorization ADR to `Accepted`.
- no current ADR is `Accepted`.
- `D-ARCH-004` remained `P0 OPEN` with `ADR-0007` only `Proposed`.
- `D-SEC-002` remained `P0 OPEN` with `ADR-0008` only `Proposed`.
- `D-SEC-004` remained `P1 OPEN`.
- `D-SEC-008` remained `OPEN` and no RLS/direct-client decision changed the baseline trust path.
- direct browser/mobile canonical database mutation remained unapproved.
- canonical roles, capabilities, scopes, and current open permission questions remained unchanged.

## Canonical Decision State

```text
D-ARCH-015
Priority: P0
Status: PROPOSED
Decision: Authorization implementation boundary
Current direction: central server-side capability + tenant/resource-scope enforcement is required; exact policy/library/storage implementation remains open
```

`ADR-0009` is drafted as `Proposed`. Task 0017 does not change `D-ARCH-015` to `DECIDED`.

## Authorization Requirements

Core runtime formula:

```text
verified Principal
  + current account eligibility
  + current tenant/resource scope
  + current named capability or Member-self relationship
  + trusted resource relationship
  -> allow / deny
```

Mandatory invariants:

```text
UI != Authorization Boundary
Role != Permission Check
Authentication != Authorization
Tenant ID from Client != Trusted Scope
Provider Claim != Business Authority
RLS != Complete Authorization System
```

## Existing Role / Capability / Scope Model

Current Phase 1 roles:

```text
Member
Front Desk Staff
Owner
Manager
```

Roles remain capability bundles and assignment conveniences rather than scattered runtime role predicates.

Current conceptual scopes:

```text
Self
Branch
Gym
Organization
Platform
```

Verified canonical capability identifiers include:

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

Task 0017 does not finalize Manager authority, refund authority, attendance-correction authority, offline-payment authority, bulk-export policy, support elevation, or cross-branch portability.

## Authentication Boundary

Task 0017 preserves:

```text
Authentication Evidence
  -> Authentication Verification
  -> AuthIdentity
  -> GymPulse Principal
  -> Authorization
```

Provider roles/groups/custom claims/profile metadata are not canonical GymPulse business authorization.

A valid provider/session credential cannot preserve access after current GymPulse account/assignment/capability/scope revocation.

## Member-Self Boundary

Member self-service remains:

```text
verified Principal
  -> explicit Principal/Member-self link
  -> requested Member-owned resource
  -> current self/resource policy
  -> allow / deny
```

Rejected shortcuts:

```text
verified phone == Member.phone
arbitrary client Member ID + Member role
provider subject == Member ID
```

## Options Evaluated

1. **GymPulse-owned application authorization module** using current assignments, named capabilities, trusted resource/scope resolution, Member-self relationships, and default denial.
2. **Authentication-provider roles/claims as primary authority**.
3. **Framework middleware as primary authorization**.
4. **External authorization/policy engine** such as policy-as-code, relationship authorization, or external permission service architecture.
5. **Database RLS as primary authorization**.

The strongest Phase 1 fit is Option 1.

## Policy Models Evaluated

1. direct role checks,
2. role bundles -> named capabilities -> scope/resource checks,
3. general ABAC,
4. general ReBAC.

Recommended model:

```text
role bundles
  + named capabilities
  + scoped assignments
  + trusted resource ownership
  + explicit Member-self relationship
```

Current relationships/attributes do not justify a general-purpose ABAC language or ReBAC graph platform.

## Proposed Direction

`ADR-0009` proposes:

```text
GymPulse-owned authorization module
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

Framework middleware may reject coarse unauthenticated/obviously unauthorized traffic early, but it is not the sole authority.

Provider claims are not authority.

RLS is not authority replacement.

No external policy engine/library is required by current Phase 1 evidence.

## Capability Model

The capability catalog is a stable machine-contract surface.

Adding, renaming, or removing capabilities requires security/product mapping review, tests, and migration/backward-compatibility treatment where persisted assignments or audit history refer to identifiers.

The ADR does not create source constants or persistence schema.

## Scope / Resource Resolution

Client-supplied tenant/gym/branch/resource IDs are routing/input identifiers, not authority.

Preferred patterns:

```text
Principal assignment/scope
  -> query constrained to authorized scope
```

for lists/search/queues, and:

```text
opaque resource ID
  -> minimum trusted ownership lookup
  -> capability + scope/resource decision
  -> full use case
```

when resource metadata is required to authorize.

Global load-by-ID followed by distinguishable cross-tenant denial is not the default pattern.

## Assignment / Revocation Model

Conceptually:

```text
Principal
  -> RoleAssignment
      -> Role capability bundle
      -> Scope
```

Current assignments/scopes are canonical GymPulse authorization state.

Permission changes must be authorized, scoped, and auditable where sensitive.

Revoking role, capability, branch/gym scope, account eligibility, or Member-self relationship must affect future protected operations without waiting for authentication-session expiry.

## Background/System Principal Model

Background jobs are not Owners or PlatformAdmins.

Use a bounded trusted context:

```text
System Principal / Job Context
  + approved job/operation type
  + explicit tenant/gym/branch scope
```

Missing/malformed tenant scope fails closed.

Provider callbacks use a separate verified provider context and may invoke only the bounded callback use case.

## RLS Boundary

Canonical boundary remains:

```text
Application Authorization = mandatory
RLS = possible defense in depth under D-SEC-008
```

Task 0017 does not create or approve RLS policy and does not approve direct client canonical database access.

## Failure / Existence-Leak Model

Authorization defaults to denial for undefined/missing/ambiguous authority.

Internal reason categories may distinguish unauthenticated, missing capability, scope mismatch, self mismatch, resource unresolved, or system scope invalid.

External API behavior must deliberately map to safe `401`/`403`/`404`-style semantics without creating cross-tenant existence or assignment oracles. Exact API error contract remains under `D-ARCH-003`.

## Threat Model Findings

Threats explicitly addressed:

- BOLA/IDOR,
- cross-tenant access,
- stale role/capability,
- provider-claim privilege escalation,
- client tenant spoofing,
- hidden-route invocation,
- role escalation,
- Member-self ID substitution,
- bulk export abuse,
- background-job scope loss,
- provider-callback overreach,
- support/admin bypass,
- authorization-cache staleness,
- existence enumeration,
- framework bypass,
- RLS policy drift,
- TOCTOU between authorization and high-impact mutation,
- N+1 authorization query behavior,
- authorization-state persistence failure,
- policy sprawl.

## Caching Position

Baseline:

```text
no cross-request authorization cache required
request-scoped trusted context/memoization allowed where safe
```

No Redis/cache dependency is introduced.

Any future cross-request cache must define invalidation, bounded staleness, revocation behavior, tenant-safe keys, fail-closed behavior, and negative tests before adoption.

## Decisions Kept Separate

```text
D-ARCH-004  authentication/session                     OPEN / ADR-0007 Proposed
D-SEC-002   Member authentication                      OPEN / ADR-0008 Proposed
D-SEC-004   exact session lifecycle/device policy      OPEN
D-SEC-008   RLS/data-layer tenant isolation            OPEN
D-ARCH-014  managed backend responsibilities           OPEN / ADR-0006 Proposed
D-ARCH-003  API contract architecture                  PROPOSED
D-ARCH-006  API deployment topology                    OPEN
D-ARCH-012  Owner/Staff framework                      PROPOSED
D-ARCH-013  Member client strategy                     PROPOSED
D-ARCH-002  database engine                            PROPOSED / ADR-0004 Proposed
D-ARCH-017  data access/migrations                     PROPOSED / ADR-0005 Proposed
D-DATA-004  Member vs AuthIdentity separation          PROPOSED
D-DATA-007  Member vs Membership lifecycle ownership   PROPOSED
D-ARCH-007  background jobs                            OPEN
D-ARCH-008  Redis/cache requirement                    OPEN
```

Task 0017 accepts none of these decisions.

## Requirement IDs Referenced

Verified existing functional requirements:

- `FR-AUTHZ-001..004`
- `FR-MEMBER-005`
- `FR-ATTENDANCE-007..011`
- `FR-RETENTION-006`
- `FR-FOLLOWUP-001`
- `FR-PAYMENT-010`
- `FR-AUDIT-001..003`
- `FR-CROSS-001`
- `FR-CROSS-003`

Verified non-functional requirements:

- `NFR-SECURITY-001..003`
- `NFR-SECURITY-009`
- `NFR-SECURITY-011`
- `NFR-PRIVACY-003`
- `NFR-PERFORMANCE-002..004`
- `NFR-PERFORMANCE-006`
- `NFR-SCALABILITY-006`
- `NFR-MAINTAINABILITY-001`
- `NFR-MAINTAINABILITY-005..006`
- `NFR-TESTABILITY-004`

No requirement definition changed.

## Validation Required

Before acceptance/production authorization implementation, validate at least:

1. Member reads own protected resource.
2. Member cannot read another Member.
3. Member ID substitution/BOLA attempt.
4. Front Desk reads authorized Branch.
5. Front Desk denied another Branch.
6. Owner access limited to correct Gym.
7. Capability present + wrong scope -> denied.
8. Scope present + missing capability -> denied.
9. Hidden UI endpoint called directly -> denied.
10. Revoked assignment while auth session remains valid.
11. Role/capability change takes effect.
12. Scoped Member search.
13. Scoped no-show queue.
14. Scoped payment query.
15. Unauthorized ID produces safe existence behavior.
16. Export requires separate capability.
17. Refund requires explicit capability.
18. Attendance correction requires explicit capability.
19. Provider role/claim injection does not grant access.
20. Client-supplied tenant spoofing.
21. Background job with correct tenant context.
22. Background job missing/wrong tenant context.
23. Provider callback cannot act as arbitrary human.
24. Member-recovery staff capability correctly scoped if later created.
25. Authorization decision is framework-independent.
26. RLS absent/disabled -> application authorization still protects access.
27. Future RLS enabled -> no policy conflict with application authorization.
28. Authorization cache/revocation experiment if caching is proposed.
29. Negative cross-tenant automated test matrix.
30. Audit attribution for sensitive authorized mutation.
31. Owner receives no implicit wildcard for conditional permission.
32. Manager title alone does not expand authority.
33. Generated export retrieval is separately authorized where applicable.
34. `401`/`403`/`404` mapping does not become an existence oracle.
35. High-impact TOCTOU case revalidates final authorized resource/tenant state when required.

No validation test or prototype was implemented during Task 0017.

## Files Changed

Created:

- `docs/adr/ADR-0009-authorization-implementation.md`
- `.ai/task/0017-draft-authorization-implementation-adr.md`

Continuity/index updates authorized:

- `docs/adr/README.md`
- `docs/README.md`
- `.ai/current-state.md`

No other canonical document required correction because no contradiction was found.

## Open Questions

- Who owns final approval for `D-ARCH-015`?
- What exact Manager capability bundle will the pilot approve?
- Who may correct attendance?
- Who may record offline payment if enabled?
- Who may initiate/approve refunds?
- What exact bulk-export policy applies?
- Is any support/elevation path required for Phase 1?
- What cross-branch portability model is approved later?
- What exact persistence representation will model assignments/capability bundles/scopes/Member-self links?
- What exact API error contract will `D-ARCH-003` approve?
- Which high-impact operations require in-transaction authorization-state revalidation?
- What evidence would justify cross-request authorization caching?
- What future distributed-policy need would justify an external policy engine/ReBAC service?
- How should `D-SEC-008` reinforce this model after database/runtime topology is known?

## Result

`ADR-0009` now exists as a `Proposed` authorization implementation-boundary recommendation.

It proposes a provider-independent GymPulse-owned authorization module built around current Principal state, stable named capabilities, scoped role assignments, trusted resource ownership, explicit Member-self relationships, deny-by-default behavior, and server-side enforcement.

No authorization library, policy engine, external authorization service, schema, migration, middleware, route guard, RLS policy, database role, Redis/cache, permission constant, API route, CI workflow, or deployment configuration was created.

The full role/permission matrix remains intentionally unresolved where canonical product policy is conditional/open.

`D-ARCH-015` remains canonically `PROPOSED` and `ADR-0009` remains `Proposed`.

## Next Recommended Task

After Task 0017 synchronization, re-read the current ADR queue and canonical decision register.

The expected next bounded decision is:

```text
Task 0018: Draft Data-Layer Tenant Isolation / RLS ADR
Primary decision: D-SEC-008
Likely target: docs/adr/ADR-0010-data-layer-tenant-isolation-rls.md
Initial ADR status: Proposed
```

Do not execute Task 0018 as part of Task 0017.
