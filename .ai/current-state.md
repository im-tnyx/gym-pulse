# GymPulse Current State

## Project

`GymPulse` (`im-tnyx/gym-pulse`)

## Current Documentation Phase

`Phase 4 - System Architecture / Architecture Governance`

## Canonical Architecture Completed at Draft Level

```text
docs/02-architecture/architecture-principles.md
docs/02-architecture/architecture-overview.md
docs/02-architecture/system-context.md
docs/02-architecture/container-architecture.md
docs/02-architecture/component-architecture.md
docs/02-architecture/data-flow.md
docs/02-architecture/technology-stack.md
docs/adr/README.md
```

## Current ADR State

```text
ADR-0001  D-ARCH-005  Phase 1 architecture style                 Proposed
ADR-0002  D-ARCH-016  Primary language/runtime                   Proposed
ADR-0003  D-ARCH-001  Repository/workspace strategy              Proposed
ADR-0004  D-ARCH-002  Canonical database engine                  Proposed
ADR-0005  D-ARCH-017  Data access/query/transaction/migrations   Proposed
ADR-0006  D-ARCH-014  Managed backend/platform responsibilities  Proposed
ADR-0007  D-ARCH-004  Authentication/session architecture        Proposed
ADR-0008  D-SEC-002   Member authentication/verification method  Proposed
ADR-0009  D-ARCH-015  Authorization implementation boundary      Proposed
```

No authorized approval evidence exists for these ADRs. None is `Accepted`.

Canonical decision status remains controlled by `docs/00-overview/assumptions.md`, not ADR draft status.

Relevant canonical status:

```text
D-ARCH-004  authentication/session               P0 OPEN
D-ARCH-014  managed backend responsibilities     P0 OPEN
D-ARCH-015  authorization implementation         P0 PROPOSED
D-SEC-002   member authentication                P0 OPEN
D-SEC-004   session lifecycle                    P1 OPEN
D-SEC-008   RLS/data-layer tenant isolation      OPEN when applicable
D-DATA-004  Member/AuthIdentity separation       P1 PROPOSED
D-DATA-007  Member/Membership state ownership    P1 PROPOSED
```

`D-ARCH-008` Redis/cache remains `P2 OPEN` and is not a baseline dependency.

## Current Authentication and Identity Position

`ADR-0007` remains `Proposed`; canonical `D-ARCH-004` remains `OPEN`.

```text
Authentication Evidence
  -> Authentication Verification
  -> AuthIdentity
  -> stable GymPulse Principal
  -> Authorization
```

Mandatory separation:

```text
Authentication != Authorization
Provider Identity != GymPulse Principal
GymPulse Principal != Member
Valid Authentication Session != Current Business Access
```

`ADR-0008` remains `Proposed`; canonical `D-SEC-002` remains `OPEN`.

Its current member-verification proposal is managed phone OTP/passwordless for routine verification with explicit tenant-aware `Principal -> Member-self` linking and stronger controlled handling for ambiguous, reassigned, already-claimed, recovery, and re-link cases.

No authentication, SMS, email, or business-messaging provider is accepted or provisioned.

## Current Authorization Proposal

`ADR-0009` now exists as `Proposed`; canonical `D-ARCH-015` remains `P0 PROPOSED`.

The proposed authoritative authorization boundary is:

```text
verified Principal
  + current account eligibility
  + current tenant/resource scope
  + current named capability or Member-self relationship
  + trusted resource relationship
  -> allow / deny
```

Core rules:

```text
UI != Authorization Boundary
Role != Permission Check
Authentication != Authorization
Client Tenant/Resource ID != Trusted Scope
Provider Role/Claim != GymPulse Business Authority
RLS != Complete Authorization System
```

### Capability and role model

Roles remain assignment/UX bundles of stable named capabilities. Runtime authorization reasons about capability + scope + resource rather than scattered role-name conditionals.

Current canonical capability identifiers remain governed by `docs/01-product/user-roles.md`.

Owner is not an implicit wildcard/superuser role. Manager exact authority remains open.

Open product policy remains unresolved for:

```text
Owner vs Manager split
attendance correction authority
offline payment authority
refund approval
bulk export
support impersonation/elevation
cross-branch portability
```

Task 0017 did not fabricate those decisions.

### Scope and resource model

Conceptual scopes remain:

```text
Self
Branch
Gym
Organization
Platform
```

Client-supplied tenant/gym/branch/resource identifiers are routing/input identifiers, not authority.

Preferred authorization/query patterns:

```text
Principal assignment/scope
  -> query already constrained to authorized scope
```

for list/search/queue/dashboard flows, and:

```text
opaque resource ID
  -> minimum trusted ownership lookup
  -> capability + scope/resource decision
  -> full use case
```

when resource metadata is required for authorization.

Global unscoped load-and-filter patterns are not an approved protected-query model.

### Member-self model

Member self-service requires:

```text
verified Principal
  -> explicit Principal/Member-self link
  -> requested Member-owned resource
  -> self/resource check
  -> allow / deny
```

Prohibited shortcuts:

```text
verified phone == Member.phone
arbitrary client Member ID + Member role
provider subject == Member ID
```

### Assignment and revocation

Current GymPulse role/capability/scope/account state is authoritative for future protected operations.

Revoking a role, capability, branch/gym assignment, account eligibility, or Member-self relationship must deny future protected operations without waiting for an external authentication session to expire.

Assignment/permission changes are security-sensitive, tenant-scoped, authorized, and auditable where required.

### Background/system authorization

Background execution does not impersonate Owner or PlatformAdmin.

Conceptually:

```text
System Principal / Job Context
  + approved job/operation type
  + explicit tenant/gym/branch scope
```

Missing or malformed scope fails safely.

Provider callbacks use verified provider-specific context and may invoke only bounded application use cases; they are not human principals and receive no generic human capabilities.

### RLS and direct-client boundary

```text
Application Authorization = mandatory
RLS = possible defense in depth under D-SEC-008
```

`D-SEC-008` remains `OPEN`. No RLS policy, database role, or direct browser/mobile canonical database mutation path was approved or created by Task 0017.

### Authorization caching

Baseline:

```text
no cross-request authorization cache required
request-scoped trusted context/memoization allowed where safe
```

No Redis/cache dependency was introduced.

Any future cross-request authorization cache must define invalidation, bounded staleness, revocation behavior, tenant-safe keys, fail-closed behavior, and negative tests before adoption.

### Authorization versus domain rules

Authorization answers whether the actor may attempt a protected operation on the scoped resource.

Domain rules separately answer whether the requested business state transition is valid.

Both must pass.

## Important Security Boundaries

- Every protected operation is server-authorized.
- Tenant/resource ownership is independently resolved from trusted state.
- Named capabilities are the runtime permission abstraction.
- Roles are bundles, not universal predicates.
- Undefined capability/scope/resource relationship denies by default.
- Member access is self-scoped through an explicit relationship.
- List/search/queue/dashboard/export paths are authorization boundaries, not only single-resource mutations.
- Bulk export authority is separate from ordinary read authority.
- `payment.record_offline` and `payment.refund` are distinct sensitive financial capabilities.
- `attendance.checkin.assisted` does not imply `attendance.correct`.
- Provider claims, route middleware, and UI hiding cannot grant business authority by themselves.
- Unauthorized resource existence must not be leaked through inconsistent cross-tenant error behavior.
- No support impersonation, platform-admin wildcard, or permanent superuser bypass is introduced as a Phase 1 baseline.
- High-impact flows may need current authorization/resource-state revalidation inside the transaction where TOCTOU risk materially justifies it.
- Authorization context should minimize copied provider/profile/private data.

## Technology Governance State

Key unresolved decisions include:

```text
D-ARCH-001  repository strategy                  P0 PROPOSED / ADR-0003 drafted
D-ARCH-002  database engine                      P0 PROPOSED / ADR-0004 drafted
D-ARCH-003  API contract architecture            P0 PROPOSED
D-ARCH-004  authentication/session               P0 OPEN / ADR-0007 drafted
D-ARCH-005  architecture style                   P1 PROPOSED / ADR-0001 drafted
D-ARCH-006  API deployment topology              P1 OPEN
D-ARCH-007  background jobs                      P1 OPEN
D-ARCH-008  Redis/cache requirement              P2 OPEN
D-ARCH-009  hosting                              P1 OPEN
D-ARCH-010  object storage                       P1 OPEN
D-ARCH-011  package manager                      P1 ASSUMED
D-ARCH-012  Owner/Staff web framework            P0 PROPOSED
D-ARCH-013  member client strategy               P1 PROPOSED
D-ARCH-014  managed backend responsibilities     P0 OPEN / ADR-0006 drafted
D-ARCH-015  authorization implementation         P0 PROPOSED / ADR-0009 drafted
D-ARCH-016  primary language/runtime             P0 PROPOSED / ADR-0002 drafted
D-ARCH-017  data access/migrations               P1 PROPOSED / ADR-0005 drafted
D-ARCH-018  testing toolchain                    P1 PROPOSED
D-ARCH-019  CI/CD + release/secrets tooling      P1 OPEN
D-SEC-001   jurisdiction/privacy                 P0 OPEN
D-SEC-002   member authentication                P0 OPEN / ADR-0008 drafted
D-SEC-004   session lifecycle                    P1 OPEN
D-SEC-008   RLS/data-layer tenant isolation      conditional P0 OPEN
D-PROVIDER-001 payment provider                  P1 OPEN
D-PROVIDER-002 messaging provider                P1 OPEN
D-PROVIDER-006 observability provider            P1 OPEN
D-DATA-004  Member vs AuthIdentity separation    P1 PROPOSED
D-DATA-007  Member vs Membership state ownership P1 PROPOSED
```

## Task 0017 Implementation Status

Task `0017-draft-authorization-implementation-adr` completed documentation/governance work only.

Created:

```text
docs/adr/ADR-0009-authorization-implementation.md
.ai/task/0017-draft-authorization-implementation-adr.md
```

Updated:

```text
docs/adr/README.md
docs/README.md
.ai/current-state.md
```

Explicitly not created/selected:

```text
No authorization source code
No permission constants
No authorization middleware or route guards
No role/capability/assignment/scope database schema
No database migration
No RLS policy
No database role
No policy-as-code file
No OPA/Cedar/OpenFGA/SpiceDB model or service
No authorization library or SDK
No external authorization service
No cross-request authorization cache
No Redis dependency
No API route
No CI workflow
No deployment configuration
No support impersonation/superuser bypass
No final Manager/refund/attendance-correction/offline-payment/export permission policy
No authorization implementation accepted
```

## Last Completed Task

`0017-draft-authorization-implementation-adr`

```text
ADR-0009 Status: Proposed
D-ARCH-015 canonical status: PROPOSED
D-ARCH-004 canonical status: OPEN
D-SEC-002 canonical status: OPEN
D-SEC-004 canonical status: OPEN
D-SEC-008 canonical status: OPEN when applicable
```

The authorization implementation boundary is not accepted merely because ADR-0009 exists.

## Current Task

None in progress.

## Next Task

Post-Task-0017 synchronization identifies the next bounded item in the current ADR dependency queue as:

```text
Task 0018: Draft Data-Layer Tenant Isolation / RLS ADR
```

Primary canonical decision:

```text
D-SEC-008
```

Likely target when explicitly started:

```text
docs/adr/ADR-0010-data-layer-tenant-isolation-rls.md
```

Initial ADR status should be `Proposed`. Canonical `D-SEC-008` remains `OPEN` unless explicit review/approval changes it.

The task should evaluate whether and how data-layer tenant isolation/RLS reinforces mandatory application authorization across trusted application/service-role access, workers, provider callbacks, migration/admin paths, and any future direct-client proposal.

It must preserve:

```text
Application Authorization = mandatory
RLS = possible defense in depth
```

Do not create ADR-0010, RLS policies, database roles, migrations, or direct-client database access until Task 0018 is explicitly started.

## Files To Read Next

```text
.ai/README.md
.ai/current-state.md
.ai/task/0017-draft-authorization-implementation-adr.md
docs/README.md
docs/00-overview/assumptions.md
docs/01-product/functional-requirements.md
docs/01-product/non-functional-requirements.md
docs/01-product/user-roles.md
docs/02-architecture/architecture-principles.md
docs/02-architecture/architecture-overview.md
docs/02-architecture/container-architecture.md
docs/02-architecture/component-architecture.md
docs/02-architecture/data-flow.md
docs/02-architecture/technology-stack.md
docs/adr/README.md
docs/adr/ADR-0004-database-engine.md
docs/adr/ADR-0005-data-access-migration-strategy.md
docs/adr/ADR-0006-managed-backend-responsibilities.md
docs/adr/ADR-0007-authentication-session-architecture.md
docs/adr/ADR-0008-member-authentication-method.md
docs/adr/ADR-0009-authorization-implementation.md
```
