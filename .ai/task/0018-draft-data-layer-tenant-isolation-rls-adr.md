# Task 0018: Draft Data-Layer Tenant Isolation / RLS ADR

## Goal

Draft one `Proposed` ADR for canonical security decision `D-SEC-008`, defining whether and how GymPulse should use data-layer tenant isolation and PostgreSQL Row-Level Security as defense in depth beneath mandatory application authorization, without creating database implementation, policies, roles, migrations, direct-client data access, provider infrastructure, or application code.

Canonical target:

`docs/adr/ADR-0010-data-layer-tenant-isolation-rls.md`

## Inputs Read

Current structured repository inputs reviewed from latest `main`:

- `.ai/README.md`
- `.ai/current-state.md`
- `.ai/task/0017-draft-authorization-implementation-adr.md`
- `docs/README.md`
- `docs/00-overview/assumptions.md`
- `docs/01-product/functional-requirements.md`
- `docs/01-product/non-functional-requirements.md`
- `docs/01-product/user-roles.md`
- `docs/01-product/user-journeys.md`
- `docs/02-architecture/architecture-principles.md`
- `docs/02-architecture/architecture-overview.md`
- `docs/02-architecture/system-context.md`
- `docs/02-architecture/container-architecture.md`
- `docs/02-architecture/component-architecture.md`
- `docs/02-architecture/data-flow.md`
- `docs/02-architecture/technology-stack.md`
- `docs/adr/README.md`
- `docs/adr/ADR-0004-database-engine.md`
- `docs/adr/ADR-0005-data-access-migration-strategy.md`
- `docs/adr/ADR-0006-managed-backend-responsibilities.md`
- `docs/adr/ADR-0007-authentication-session-architecture.md`
- `docs/adr/ADR-0008-member-authentication-method.md`
- `docs/adr/ADR-0009-authorization-implementation.md`

Legacy migration/evidence inputs reviewed without treating them as canonical:

- `docs/06-database-schema.md`
- `docs/12-security-audit.md`
- `docs/16-open-decisions.md`

External official research was limited to current PostgreSQL documentation and representative Supabase documentation needed to verify RLS, privilege/bypass, context, view/function, service-role, pooling, and migration semantics.

## Repository State Verified

Before creating ADR-0010:

- `docs/adr/ADR-0010-data-layer-tenant-isolation-rls.md` did not exist on current `main`.
- `.ai/task/0018-draft-data-layer-tenant-isolation-rls-adr.md` did not exist.
- `D-SEC-008` remained the next bounded item in the ordered ADR backlog after `ADR-0009`.
- `D-SEC-008` remained canonically `OPEN`.
- repository search found no explicit approval evidence promoting `D-SEC-008` to `DECIDED` or accepting an RLS/data-isolation ADR.
- no current ADR was `Accepted`.
- `D-SEC-003` remained `PROPOSED`.
- `D-ARCH-015` remained `PROPOSED`; `ADR-0009` remained only Proposed.
- `D-ARCH-002` remained `PROPOSED`; PostgreSQL remained a recommendation only.
- `D-ARCH-017` remained `PROPOSED`; no persistence/query/migration product was accepted.
- `D-ARCH-014` remained `OPEN`; no managed backend/provider was accepted.
- direct browser/mobile canonical database access remained unapproved.
- no database provider or database implementation had been silently accepted.

## Canonical Decision State

```text
D-SEC-008
Priority: P0 when client-accessible database patterns are used
Status: OPEN
Decision: define data-layer tenant-isolation/RLS strategy and its relationship to application capability authorization
```

Related security direction:

```text
D-SEC-003
Status: PROPOSED
Tenant isolation must be enforced server-side and reinforced at the data layer where practical.
```

`ADR-0010` is drafted as `Proposed`; Task 0018 does not change `D-SEC-008` to `DECIDED`.

## Existing Authorization Boundary

Task 0018 preserves the authorization model proposed by `ADR-0009`:

```text
verified Principal
  + current account eligibility
  + current tenant/resource scope
  + current named capability or Member-self relationship
  + trusted resource relationship
  -> allow / deny
```

The required layering remains:

```text
Application Authorization = Mandatory
Data-Layer Tenant Isolation = Defense in Depth
RLS != Complete Authorization System
```

RLS/data-layer isolation sits below application/domain authorization rather than replacing it.

## Isolation Threat Model

Primary application/data-access defects addressed:

- missing tenant predicate,
- wrong tenant identifier,
- incorrect repository filter,
- unsafe join,
- BOLA/IDOR that reaches persistence,
- worker/job scope loss,
- accidental global query,
- feature/read-model bypass of tenant helpers,
- bulk export/import scope error,
- pooled connection tenant-context bleed,
- service-role/table-owner/BYPASSRLS misuse,
- migration/admin credential misuse,
- policy drift/misconfiguration,
- privileged view/function bypass,
- future direct-client policy bypass.

The defense-in-depth model intentionally derives database tenant context from trusted application/system authorization rather than reusing an unverified client tenant ID as both controls' authority.

## Data Ownership Categories

ADR-0010 defines conceptual classifications without finalizing tables:

```text
tenant-owned business data
tenant-scoped configuration
global reference/catalog data
platform/system metadata
cross-tenant operational metadata
```

Tenant-owned and sensitive categories are the default candidates for tenant data-layer isolation. Global/system objects are governed separately rather than receiving identical RLS automatically.

The ADR also evaluates direct row ownership versus safely derived ownership and records that later schema work may add direct tenant ownership to high-volume/security-critical relationships when this improves policy simplicity, indexing, and query safety, provided relational consistency is separately enforced.

## Access Paths Evaluated

The ADR evaluates:

- interactive staff requests,
- Member self-service,
- background tenant jobs,
- cross-tenant scheduler/discovery,
- verified provider callbacks,
- migration processes,
- break-glass/admin paths,
- read-only operational/reporting paths,
- future direct-client data access.

Normal interactive, Member, worker, and callback flows remain tenant-resolved and non-bypass. Migration/admin is a separate controlled privilege path. Direct-client canonical database access remains unapproved.

## Options Evaluated

1. **Application authorization + explicit tenant predicates only**, without RLS.
2. **Application authorization + explicit tenant predicates + selective PostgreSQL RLS defense in depth**.
3. **RLS-heavy tenant filtering**, where normal SQL relies substantially on policies.
4. **Strong physical/schema isolation**, such as database-per-tenant/schema-per-tenant/segmented clusters.

Option 1 remains a credible fallback. Option 2 is the strongest conditional current fit if PostgreSQL and compatible runtime/pooling behavior are later accepted. Option 3 adds hidden policy/context complexity without a current direct-client requirement. Option 4 provides strong isolation but disproportionate Phase 1 operational cost.

## Current PostgreSQL Research

Research date: `2026-09-08`.

Current PostgreSQL documentation is version 18.

Official documentation reviewed:

- `https://www.postgresql.org/docs/current/ddl-rowsecurity.html`
- `https://www.postgresql.org/docs/current/sql-createpolicy.html`
- `https://www.postgresql.org/docs/current/sql-createrole.html`
- `https://www.postgresql.org/docs/18/sql-set.html`
- `https://www.postgresql.org/docs/18/functions-admin.html`
- `https://www.postgresql.org/docs/current/sql-createview.html`
- `https://www.postgresql.org/docs/current/sql-createfunction.html`
- `https://www.postgresql.org/docs/current/app-pgdump.html`

Verified security-critical behavior:

- RLS can constrain `SELECT`, `INSERT`, `UPDATE`, and `DELETE` on covered tables.
- enabled RLS with no applicable policy is default deny.
- policies can be operation/role-specific and permissive/restrictive.
- `USING` and `WITH CHECK` control existing-row visibility/targeting and new-row/update acceptance.
- superusers and `BYPASSRLS` roles always bypass RLS.
- table owners normally bypass; `FORCE ROW LEVEL SECURITY` can subject the owner to policies.
- `NOBYPASSRLS` is the default role posture.
- referential-integrity checks bypass row security and therefore remain a separate integrity/information-channel concern.
- `SET LOCAL` and `set_config(..., true)` are transaction-local and cleared at transaction end/rollback; session `SET` can persist after commit.
- views can use owner or invoker privilege/RLS semantics, so view security cannot be assumed.
- `SECURITY DEFINER` functions execute with owner privilege and require safe `search_path`/execution privilege design.
- backup tooling has explicit row-security behavior and belongs to a privileged operational path.

No PostgreSQL implementation was created.

## Managed-Platform Research

Research date: `2026-09-08`.

Representative Supabase documentation reviewed because Supabase remains an evaluated managed PostgreSQL candidate, not because it is selected:

- `https://supabase.com/docs/guides/database/postgres/row-level-security`
- `https://supabase.com/docs/guides/database/secure-data`
- `https://supabase.com/docs/guides/getting-started/api-keys`
- `https://supabase.com/docs/guides/database/connecting-to-postgres`
- `https://supabase.com/docs/guides/deployment/database-migrations`
- `https://supabase.com/docs/guides/local-development/database-migrations`

Verified representative behavior:

- Supabase combines PostgreSQL grants and RLS policies.
- service-role/secret access is privileged and bypasses RLS, so it is server-only and unsuitable as proof that normal GymPulse runtime is policy-enforced.
- Auth/JWT context can drive provider Data API RLS patterns; claim source/freshness matters.
- direct, session-pooled, and transaction-pooled connection modes exist for different runtime classes.
- version-controlled database migration workflows are supported.

No Supabase product, project, Auth integration, Data API topology, pooler, key, CLI, or provider was selected/provisioned.

## Evaluation Summary

Strongest current conditional direction:

```text
mandatory application authorization
+
explicit tenant-scoped persistence queries
+
selective PostgreSQL RLS on materially tenant-owned canonical tables if PostgreSQL is accepted
+
least-privileged policy-enforced runtime/worker DB access
+
separate migration/admin privilege
+
transaction-safe trusted tenant context when runtime context is required
```

This provides materially stronger independence from application query bugs without adopting database-per-tenant complexity or turning RLS into the application permission model.

## Proposed Direction

ADR-0010 proposes:

- preserve `ADR-0009` application authorization as mandatory,
- keep explicit tenant predicates in application persistence queries,
- classify data before policy coverage,
- if PostgreSQL is accepted, selectively apply tenant-focused RLS to materially tenant-owned canonical data,
- fail closed on missing/invalid tenant context,
- keep runtime/worker credentials non-owner/non-superuser/non-BYPASSRLS when policies are intended to protect them,
- keep migrations/admin access separate,
- avoid duplicating Member-self/capabilities/domain rules into RLS in the current trusted-server topology,
- require real PostgreSQL, pool, role, worker, callback, import/export, view/function, and performance tests before acceptance.

## Tenant Context Model

If RLS needs runtime tenant context, evaluated categories include:

- database role per tenant,
- transaction-scoped database setting/context,
- session-scoped setting/context,
- explicit query/context values,
- provider JWT/Auth context in a future provider-specific direct-client topology.

Transaction-scoped context is the leading category for pooled trusted-server traffic because PostgreSQL current semantics bound `SET LOCAL` / local `set_config` state to the transaction.

The exact implementation remains deferred to final database/data-access/hosting/pooler decisions.

## Database Role Model

Conceptual role classes:

```text
application runtime role
background worker role
migration/schema-owner role
break-glass/admin role
read-only operational/reporting role if later required
```

Normal runtime/worker access should be policy-enforced and lack schema-owner, migration, superuser, and RLS-bypass privilege where the selected topology supports it.

Migration/admin privilege exists only in a controlled release/maintenance path.

No actual database role/user/GRANT/REVOKE was created.

## Application Authorization Relationship

RLS remains deliberately narrower than application authorization.

Application authorization still owns:

- Principal/account eligibility,
- capabilities and scoped assignments,
- Member-self relationship,
- sensitive financial/attendance/export permissions,
- provider callback bounded use case,
- System Principal/job operation type.

Application/domain logic still owns entitlement, attendance eligibility, pricing, renewal rules, payment verification/effects, no-show policy, and state transitions.

## Worker / Provider Callback Model

Tenant jobs should operate one explicit tenant scope at a time where practical. Global scheduling/discovery should identify tenant IDs/eligible work through a narrow controlled metadata path, then fan out tenant-scoped execution.

Provider callbacks remain:

```text
verify provider evidence
  -> resolve canonical internal resource
  -> resolve tenant
  -> bounded application use case
  -> tenant-aware persistence
```

System Principal or verified provider context is not PostgreSQL superuser authority.

## Direct-Client Boundary

Direct browser/mobile canonical database mutation remains unapproved.

RLS adoption does not justify bypassing the trusted GymPulse runtime.

If a direct Data API/database topology is ever proposed, RLS/grant/JWT/member policy correctness becomes a materially stronger P0 application-security boundary and requires separate governance and assurance.

## Pooling / Transaction Safety

Critical finding:

- uncontrolled persistent session tenant context is unsafe in a reusable multi-tenant pool unless reset/ownership guarantees are proved,
- transaction-local context is preferred when context-driven RLS is used,
- Tenant A -> connection pool -> Tenant B leakage and rollback/reuse tests are mandatory,
- serverless/transaction poolers must be tested because session-state assumptions may not hold,
- retries/nested operations must re-establish/validate the intended trusted tenant context.

No middleware, pool configuration, or DB client was created.

## Migration / Admin Boundary

Policies/roles, if adopted, should be version-controlled and deployed through controlled server-side database migration history where practical.

No provider-console-only production policy is acceptable as canonical configuration.

Ordinary runtime credentials must not inherit migration/schema-owner privilege.

No migration or policy was created.

## Performance Findings

RLS is not assumed cost-free or prohibitively expensive.

Acceptance requires representative query-plan/latency validation for Member search, queues, dashboards/read models, attendance-related queries, and payment reconciliation.

Later schema/index work should support frequent tenant predicates/policy conditions efficiently without being created by this ADR.

Simple row-ownership policies are preferred over complex policy functions/subqueries.

## Decisions Kept Separate

Task 0018 does not decide or accept:

```text
D-SEC-003
D-ARCH-015
D-ARCH-004
D-SEC-002
D-ARCH-002
D-ARCH-017
D-ARCH-014
D-ARCH-006
D-ARCH-007
D-ARCH-009
D-ARCH-018
D-DATA-004
D-DATA-007
```

Specific boundaries retained:

```text
PostgreSQL remains PROPOSED
no data-access tool accepted
managed backend remains OPEN
no provider accepted
application authorization remains mandatory
Member-self/capability policy remains application-owned
D-DATA-007 remains unresolved
```

## Requirement IDs Referenced

Verified canonical IDs used by ADR-0010 include:

```text
FR-AUTHZ-001
FR-AUTHZ-002
FR-AUTHZ-003
FR-MEMBER-005
FR-ATTENDANCE-009
FR-RETENTION-006
FR-DASHBOARD-004
FR-AUDIT-003
FR-CROSS-001
FR-CROSS-003

NFR-SECURITY-001
NFR-SECURITY-002
NFR-SECURITY-003
NFR-SECURITY-004
NFR-SECURITY-009
NFR-SECURITY-011
NFR-PRIVACY-003
NFR-RELIABILITY-004
NFR-RELIABILITY-005
NFR-TESTABILITY-004
NFR-PERFORMANCE-002
NFR-PERFORMANCE-003
NFR-PERFORMANCE-004
NFR-PERFORMANCE-006
NFR-SCALABILITY-006
NFR-MAINTAINABILITY-004
```

No new requirement ID was invented.

## Validation Required

ADR-0010 requires future non-production validation for:

- cross-tenant `SELECT`/`INSERT`/`UPDATE`/`DELETE`,
- missing/invalid context,
- application authorization independent of RLS,
- RLS independent of application authorization,
- policy-enforced runtime role,
- runtime unable to use migration privilege,
- table-owner/superuser/BYPASSRLS behavior,
- FORCE-RLS behavior if selected,
- Tenant A -> Tenant B pool reuse,
- rollback/reuse leakage,
- parallel tenants,
- tenant-scoped workers and malformed job scope,
- narrow cross-tenant discovery,
- provider callback correct/wrong tenant,
- import mismatch,
- scoped Member search/queues/export,
- Member-self app authorization,
- migration/admin separation,
- managed service-role behavior if tested,
- representative EXPLAIN/query performance,
- empty-database policy migration and upgrades,
- policy drift detection,
- views/functions/constraints/backup behavior.

Task 0018 implements none of these tests.

## Files Changed

Created:

```text
docs/adr/ADR-0010-data-layer-tenant-isolation-rls.md
.ai/task/0018-draft-data-layer-tenant-isolation-rls-adr.md
```

Expected continuity/index updates in this task:

```text
docs/adr/README.md
docs/README.md
.ai/current-state.md
```

No other canonical document required correction; the only apparent legacy conflict was `docs/06-database-schema.md` describing PostgreSQL as already canonical. Current structured `docs/00-overview/assumptions.md` and ADR governance are authoritative, so the legacy file was left unchanged and treated as migration evidence only.

## Open Questions

Primary unresolved questions include:

- final decision owner/approval for `D-SEC-008`,
- final database engine/provider/runtime/pooler,
- tenant-owned table classification,
- direct vs derived ownership by relation,
- exact transaction/context mechanism,
- exact RLS coverage and whether FORCE RLS is justified per table,
- exact runtime vs worker role split,
- cross-tenant scheduler/discovery privilege,
- break-glass/reporting access needs,
- policy drift tooling,
- representative scale/performance test dataset,
- future direct-client requirements, if any.

## Result

`ADR-0010` was drafted as `Proposed` for `D-SEC-008`.

Canonical `D-SEC-008` remains `OPEN`.

The proposed direction is conditional selective data-layer tenant isolation/RLS below mandatory application authorization, with explicit application tenant predicates retained and PostgreSQL-specific RLS recommendations conditional on later acceptance of PostgreSQL.

No database implementation, policy, role, migration, provider, direct-client access, code, schema, or infrastructure was created or accepted.

## Next Recommended Task

After the index/current-state synchronization for Task 0018, re-read:

```text
docs/adr/README.md
docs/00-overview/assumptions.md
.ai/current-state.md
```

The pre-task queue suggests `D-ARCH-003` Primary API Contract Architecture as the likely next bounded governance item, probably Task 0019 / ADR-0011, but the actual next task must be recorded only after that post-task re-check.

Do not draft the next ADR as part of Task 0018.
