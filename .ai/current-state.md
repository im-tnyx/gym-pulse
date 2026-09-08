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
ADR-0010  D-SEC-008   Data-layer tenant isolation / RLS          Proposed
```

No authorized approval evidence exists for these ADRs. None is `Accepted`.

Canonical decision status remains controlled by `docs/00-overview/assumptions.md`, not ADR draft status.

Relevant canonical status:

```text
D-ARCH-002  database engine                      P0 PROPOSED
D-ARCH-003  API contract architecture            P0 PROPOSED
D-ARCH-004  authentication/session               P0 OPEN
D-ARCH-014  managed backend responsibilities     P0 OPEN
D-ARCH-015  authorization implementation         P0 PROPOSED
D-ARCH-017  data access/migrations               P1 PROPOSED
D-ARCH-018  testing toolchain                    P1 PROPOSED
D-SEC-002   member authentication                P0 OPEN
D-SEC-003   tenant isolation principle           P0 PROPOSED
D-SEC-004   session lifecycle                    P1 OPEN
D-SEC-008   RLS/data-layer tenant isolation      OPEN; P0 when client-accessible DB patterns are used
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

Current Member-verification proposal remains managed phone OTP/passwordless for routine verification with explicit tenant-aware `Principal -> Member-self` linking and stronger controlled handling for ambiguous, reassigned, already-claimed, recovery, and re-link cases.

No authentication, SMS, email, or business-messaging provider is accepted or provisioned.

## Current Authorization Proposal

`ADR-0009` remains `Proposed`; canonical `D-ARCH-015` remains `P0 PROPOSED`.

The proposed authoritative application authorization boundary is:

```text
verified Principal
  + current account eligibility
  + current tenant/resource scope
  + current named capability or Member-self relationship
  + trusted resource relationship
  -> allow / deny
```

Core rules remain:

```text
UI != Authorization Boundary
Role != Permission Check
Authentication != Authorization
Client Tenant/Resource ID != Trusted Scope
Provider Role/Claim != GymPulse Business Authority
RLS != Complete Authorization System
```

Roles remain stable capability bundles and scoped assignments rather than runtime wildcard predicates. Owner is not an implicit wildcard/superuser role. Manager exact authority remains open.

Conceptual scopes remain:

```text
Self
Branch
Gym
Organization
Platform
```

Member self-service still requires an explicit Principal/Member-self relationship. Phone/email equality, arbitrary client Member ID, or provider subject equality cannot replace it.

Background execution uses bounded System Principal/job context with explicit tenant/gym/branch scope. Provider callbacks use separately verified provider context and bounded application use cases rather than human capabilities.

## Current Data-Layer Tenant Isolation Proposal

`ADR-0010` now exists as `Proposed`; canonical `D-SEC-008` remains `OPEN`.

Mandatory invariant:

```text
Application Authorization = Mandatory
Data-Layer Tenant Isolation = Defense in Depth
RLS != Complete Authorization System
```

Task 0018 evaluated:

```text
A. Application authorization + explicit tenant predicates only
B. Application authorization + explicit tenant predicates + selective PostgreSQL RLS
C. RLS-heavy tenant filtering
D. schema/database-per-tenant physical isolation
```

Current strongest conditional direction is Option B if PostgreSQL is later accepted and the selected runtime/pooling topology passes security validation.

Proposed layering:

```text
Client
  -> Trusted GymPulse Runtime
  -> Authentication / Principal Resolution
  -> Application Authorization
  -> Application / Domain
  -> Explicit tenant-scoped Data Access
  -> Selective Data-Layer Tenant Isolation / RLS where adopted
  -> Canonical Database
```

PostgreSQL remains only `PROPOSED` under `D-ARCH-002`. ADR-0010 does not accept PostgreSQL.

No managed provider is selected. `D-ARCH-014` remains `OPEN`.

Direct browser/mobile canonical database access remains unapproved.

### RLS posture

If PostgreSQL is eventually accepted, ADR-0010 proposes selective RLS on materially tenant-owned canonical tables as a tenant-row visibility/mutation backstop while application SQL remains explicitly tenant-scoped.

RLS must not become the primary implementation of:

```text
membership entitlement
attendance eligibility
refund approval
payment verification
payment exactly-once effects
no-show policy
renewal eligibility
pricing
role/capability business semantics
domain state transitions
```

Member-self and named-capability authorization remain application-owned for the current trusted-server topology.

### Data ownership classification

Task 0018 establishes conceptual classifications only:

```text
tenant-owned business data
tenant-scoped configuration
global reference/catalog data
platform/system metadata
cross-tenant operational metadata
```

Not every database object receives identical RLS automatically.

Tenant-owned records must contain or safely derive organization/gym/branch ownership. Direct tenant ownership may later be preferred on high-volume/security-critical relationships when it improves policy simplicity, indexing, query safety, and reviewability, but schema/columns are not finalized by ADR-0010.

RLS does not replace relational integrity. Future schema work must ensure parent/child tenant ownership cannot silently disagree.

### Tenant context model

If RLS uses runtime tenant context, Task 0018 evaluated:

```text
database role per tenant
transaction-scoped database setting/context
session-scoped database setting/context
explicit query/context value
provider JWT/Auth context for future provider-specific direct-client topology
```

Transaction-scoped context is the leading category for pooled trusted-server traffic because current PostgreSQL semantics bound `SET LOCAL` / local `set_config` state to the current transaction and clear it at transaction end/rollback.

The exact mechanism remains deferred to approved database/data-access/runtime/pooler decisions.

Missing, invalid, malformed, or application-unauthorized tenant context must fail safely. No default tenant is allowed.

### Pooling and transaction safety

Unsafe pattern explicitly rejected:

```text
Tenant A uses physical DB connection
  -> session tenant state survives
  -> connection returns to pool
  -> Tenant B receives same connection
  -> Tenant B inherits Tenant A state
```

Mandatory future validation includes:

- Tenant A -> Tenant B reuse on same physical connection,
- transaction rollback then connection reuse,
- parallel tenants,
- worker Tenant A then Tenant B on reused connections,
- serverless/transaction-pooler compatibility,
- retry/nested transaction context re-establishment.

Uncontrolled session-scoped tenant state is not the default pooled application posture.

### Conceptual database role classes

If PostgreSQL/RLS is later approved, distinguish at minimum:

```text
application runtime role
background worker role
migration/schema-owner role
break-glass/admin role
read-only operational/reporting role if later required
```

Current proposal requires normal application/worker access to be policy-enforced and to avoid table/schema owner, superuser, and `BYPASSRLS` privilege when RLS is intended to protect it.

Migration/admin privilege is separate from ordinary runtime traffic.

No actual database roles/users/GRANT/REVOKE statements were created.

### PostgreSQL semantics verified on 2026-09-08

Current official PostgreSQL documentation is PostgreSQL 18.

Task 0018 verified:

- RLS can constrain `SELECT`, `INSERT`, `UPDATE`, and `DELETE`.
- enabled RLS without an applicable policy is default deny.
- policies can be operation/role-specific and permissive/restrictive.
- `USING` and `WITH CHECK` serve existing-row visibility/targeting and new-row/update acceptance.
- superusers and `BYPASSRLS` roles always bypass RLS.
- table owners normally bypass; `FORCE ROW LEVEL SECURITY` can subject an owner to policies.
- `NOBYPASSRLS` is the default role posture.
- referential-integrity checks bypass RLS and remain a separate integrity/information-channel concern.
- `SET LOCAL` and `set_config(..., true)` are transaction-local; normal session `SET` can persist after commit.
- views can apply owner/invoker security/RLS behavior and require explicit review.
- `SECURITY DEFINER` functions execute with owner privileges and require safe `search_path`/privilege handling.
- backup tooling has explicit row-security behavior and is a privileged operational path.

No PostgreSQL policy/configuration was created.

### Representative managed-platform findings

Supabase was researched only as one managed PostgreSQL candidate already present in technology evaluation.

Current official documentation confirms that its service-role/secret access is privileged and bypasses RLS, must remain server-side, and is not evidence that a normal GymPulse runtime is policy-enforced. Supabase also exposes direct, session-pooled, and transaction-pooled connection modes and version-controlled migration workflows.

No Supabase project, key, Auth integration, RLS configuration, Data API topology, pooler, CLI, or provider selection was created/accepted.

### Workers and provider callbacks

Normal tenant workers should remain tenant-scoped and policy-enforced where practical.

Preferred global scheduling pattern:

```text
narrow scheduler/discovery path
  -> identify tenant IDs / due work
  -> fan out one tenant-scoped work item
  -> tenant-aware persistence
```

Avoid generic unrestricted worker bypass when tenant-scoped access is sufficient.

Provider callbacks remain:

```text
verify provider evidence
  -> resolve canonical internal resource
  -> resolve tenant/resource ownership
  -> bounded application use case
  -> tenant-aware persistence
```

System Principal / verified provider context is not PostgreSQL superuser authority.

### Direct-client boundary

Current baseline remains:

```text
Client
  -> Trusted GymPulse Runtime
  -> Application Authorization
  -> Persistence
```

Direct browser/mobile canonical database mutation remains unapproved.

If a future Data API/direct-client topology is proposed, RLS/grant/JWT/Member-self policy correctness becomes a stronger P0 application-security boundary and requires separate governance/assurance. ADR-0010 does not approve it.

### Policy/change ownership

If RLS is later adopted, policy/role changes should be server-only, reviewable, version-controlled, repeatable, environment-consistent, and deployed through the controlled database migration history where practical.

No policy should exist only as undocumented provider-console production configuration.

`D-ARCH-017` must preserve raw/custom SQL migration capability if database-native security requires it, but no query/migration tool is accepted here.

### Performance posture

RLS is neither assumed to have zero cost nor rejected on hypothetical performance concerns.

Acceptance requires representative query-plan/latency validation for:

```text
Member search
operational queues
Owner dashboards/read models
attendance-related queries
payment reconciliation/exception queries
```

Later schema/index design should support frequent tenant predicates/policy conditions. No indexes were created by Task 0018.

## Important Security Boundaries

- Every protected operation remains server-authorized.
- Application authorization and data-layer isolation are independent controls.
- Client-supplied tenant identifiers are routing input, not authority.
- RLS must derive from trusted runtime context if context-driven.
- Explicit application tenant predicates remain valuable even with RLS.
- Missing/invalid tenant context fails closed; no default tenant.
- RLS protects covered row visibility/mutation, not capability/domain semantics.
- Tenant isolation covers both read and write paths.
- Normal runtime/worker credentials must not silently bypass intended RLS.
- A policy existing while runtime uses owner/superuser/BYPASSRLS is false assurance.
- Migration/schema-owner privilege remains separate from ordinary runtime.
- System Principal/job context is not a database superuser.
- Verified provider callbacks do not get generic tenant-unrestricted DB access.
- Cross-tenant scheduler/reporting needs use explicit narrow paths instead of weakening all tenant policies.
- Exports require application export authorization even if RLS is present.
- Imports remain application-validated; RLS may provide write-side tenant backstop only.
- RLS does not replace foreign keys, uniqueness, transactions, or tenant-aware relational integrity.
- Privileged database functions/views are explicit security-review surfaces.
- Backups/raw database artifacts require separate infrastructure protection.
- Direct-client canonical DB access remains unapproved.
- No managed provider is accepted.

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
D-SEC-003   tenant isolation principle           P0 PROPOSED
D-SEC-004   session lifecycle                    P1 OPEN
D-SEC-008   RLS/data-layer tenant isolation      OPEN / ADR-0010 drafted
D-PROVIDER-001 payment provider                  P1 OPEN
D-PROVIDER-002 messaging provider                P1 OPEN
D-PROVIDER-006 observability provider            P1 OPEN
D-DATA-004  Member vs AuthIdentity separation    P1 PROPOSED
D-DATA-007  Member vs Membership state ownership P1 PROPOSED
```

## Task 0018 Implementation Status

Task `0018-draft-data-layer-tenant-isolation-rls-adr` completed documentation/governance work only.

Created:

```text
docs/adr/ADR-0010-data-layer-tenant-isolation-rls.md
.ai/task/0018-draft-data-layer-tenant-isolation-rls-adr.md
```

Updated:

```text
docs/adr/README.md
docs/README.md
.ai/current-state.md
```

Explicitly not created/selected:

```text
No CREATE POLICY implementation
No RLS policy
No ENABLE/FORCE RLS database change
No database role/user
No GRANT/REVOKE
No schema change
No migration
No Drizzle migration
No Prisma migration
No RLS helper/security-definer function
No tenant-context middleware
No application DB client
No direct browser/mobile DB client
No API route
No worker code
No CI workflow
No deployment config
No database configuration
No Supabase configuration
No PostgreSQL/Supabase/Neon/RDS/Cloud SQL/Azure provisioning
No dependency installation
No PostgreSQL acceptance
No managed provider acceptance
No direct-client database access approval
No D-DATA-007 resolution
```

## Last Completed Task

`0018-draft-data-layer-tenant-isolation-rls-adr`

```text
ADR-0010 Status: Proposed
D-SEC-008 canonical status: OPEN
D-SEC-003 canonical status: PROPOSED
D-ARCH-015 canonical status: PROPOSED
D-ARCH-002 canonical status: PROPOSED
D-ARCH-017 canonical status: PROPOSED
D-ARCH-014 canonical status: OPEN
D-DATA-007 canonical status: PROPOSED / unresolved
```

The data-layer isolation/RLS direction is not accepted merely because ADR-0010 exists.

## Current Task

None in progress.

## Next Task

Post-Task-0018 synchronization of the ADR queue identifies the next bounded item as:

```text
Task 0019: Draft Primary API Contract Architecture ADR
```

Primary canonical decision:

```text
D-ARCH-003
```

Likely target when explicitly started:

```text
docs/adr/ADR-0011-api-contract-architecture.md
```

Initial ADR status should be `Proposed`. Canonical `D-ARCH-003` remains `PROPOSED` unless explicit review/approval changes it.

The next task should define the primary client/server contract architecture while keeping API deployment topology, framework, provider, authorization, data access, RLS, jobs, hosting, and client delivery strategies separately governed.

Do not create ADR-0011 or API implementation until Task 0019 is explicitly started.

## Files To Read Next

```text
.ai/README.md
.ai/current-state.md
.ai/task/0018-draft-data-layer-tenant-isolation-rls-adr.md
docs/README.md
docs/00-overview/assumptions.md
docs/01-product/functional-requirements.md
docs/01-product/non-functional-requirements.md
docs/01-product/user-journeys.md
docs/02-architecture/architecture-principles.md
docs/02-architecture/architecture-overview.md
docs/02-architecture/container-architecture.md
docs/02-architecture/component-architecture.md
docs/02-architecture/data-flow.md
docs/02-architecture/technology-stack.md
docs/adr/README.md
docs/adr/ADR-0009-authorization-implementation.md
docs/adr/ADR-0010-data-layer-tenant-isolation-rls.md
legacy migration source: docs/07-api-contracts.md
legacy migration source: docs/16-open-decisions.md
```
