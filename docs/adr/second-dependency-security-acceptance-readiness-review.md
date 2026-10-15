# Second Dependency/Security Acceptance-Readiness Review

## 1. Document Control
- Review date: 2026-10-15.
- Repository: im-tnyx/gym-pulse. Audited main commit: 787955db8618578ab66ee49a78dc7390f75f4c08.
- Scope: ADR-0005..ADR-0010; sources include docs/00-overview/assumptions.md, foundation review packet, architecture principles/overview/components/data-flow/technology-stack, validation/foundation/README.md, EVIDENCE.md, postgres/README.md and .ai/current-state.md.
- Type: unnumbered governance review, **not an ADR or approval**.
- Status: **COMPLETED** for evidence/readiness classification only. No validation was run.
- Human decision owner / decisions / approval references for this batch: **OPEN / PENDING / MISSING**.
- Overall production implementation gate: **CLOSED**.

## 2. Executive Summary

GitHub Issue #1 records santosh's authorized **2026-09-29** acceptance of ADR-0001..ADR-0004; D-ARCH-005, D-ARCH-016, D-ARCH-001, and D-ARCH-002 are DECIDED. The foundation is Modular Monolith, strict TypeScript, supported Node.js LTS, explicit monorepo, and PostgreSQL. It does **not** select an ORM, managed database, Auth provider, package manager, API deployment, or RLS.

Real PostgreSQL Foundation Validation, Stage 3, Stage 6, and cleanup are PASS. The disposable synthetic harness proved migration-from-zero, forward upgrade, 12-way attendance uniqueness/provider dedupe/exactly-once business effects, rollback, tenant-scoped SQL, relational/history queries, SQLSTATE mapping, backup/restore, stop/restart/reconnect and replay safety. The temporary pg client and explicit SQL **do not** demonstrate Drizzle/Kysely/Prisma suitability, PostgreSQL RLS, production provider connectivity, or session/OTP security.

### Executive readiness matrix

| ADR / ID | Canonical | Existing evidence | Security/business gaps | Classification | Next prerequisite |
|---|---|---|---|---|---|
| ADR-0005 / D-ARCH-017 | PROPOSED | Real PostgreSQL SQL/transaction/migration engine proof | Candidate tooling, cross-module transaction, partial indexes, migrations/drift/recovery, pool/RLS fit | **BOUNDED VALIDATION REQUIRED** | Fair real-PG Drizzle vs Kysely comparison |
| ADR-0006 / D-ARCH-014 | OPEN | Clear managed/GymPulse responsibility boundary; local restore only | Region, residency, recovery/SLA, provider cost/support/admin/exit | **DECISION-OWNER REVIEWABLE** (model only) | Human review of boundary; provider selection separate |
| ADR-0007 / D-ARCH-004 | OPEN | Identity/principal boundary modeled, no actual provider-session proof | D-SEC-004, revocation model, staff auth/MFA/recovery, provider/jurisdiction | **EVIDENCE-BLOCKED** (whole ADR) | Resolve session-security and staff-login policy inputs |
| ADR-0008 / D-SEC-002 | OPEN | Verification vs Member claiming separated in design | Pilot contact quality, shared/recycled numbers, claim/recovery policy, SMS abuse/delivery/UX | **EVIDENCE-BLOCKED** | De-identified pilot/contact and recovery-policy assessment |
| ADR-0009 / D-ARCH-015 | PROPOSED | Foundation tenant/branch/capability negatives and protected command | Manager/finance/export policy, complete BOLA/revocation/worker/TOCTOU matrix | **DECISION-OWNER REVIEWABLE** (boundary only) | Owner reviews architecture; policies and tests before implementation |
| ADR-0010 / D-SEC-008 | OPEN | Tenant-scoped SQL PASS; no RLS test | Real read/write RLS, non-bypass roles, invalid context, pool/rollback reuse, drift, performance | **BOUNDED VALIDATION REQUIRED** | Disposable real-PostgreSQL RLS isolation validation |

Architecture-category reviewability is not production readiness. None of the six ADRs is Accepted.

## 3. Accepted Foundation Prerequisites

| Accepted ADR | Category | Explicit exclusions |
|---|---|---|
| ADR-0001 / D-ARCH-005 | Modular Monolith | API deployment/service topology |
| ADR-0002 / D-ARCH-016 | Strict TypeScript + supported Node.js LTS | Exact versions, Next.js, auth/persistence tools |
| ADR-0003 / D-ARCH-001 | Explicit Monorepo | pnpm/Turborepo/CI/final package graph |
| ADR-0004 / D-ARCH-002 | PostgreSQL | Managed provider/version, RLS, ORM, production schema, HA/PITR |

Evidence: GitHub Issue #1, docs/adr/foundation-decision-owner-review-packet.md, docs/00-overview/assumptions.md, validation/foundation/EVIDENCE.md. D-DATA-007 Member/Membership state ownership remains unresolved and blocks final production state schema, **not** synthetic validation.

## 4. Classification Model

- **DECISION-OWNER REVIEWABLE:** evidence permits an explicitly authorized owner to evaluate the category; not acceptance or implementation authorization.
- **EVIDENCE-BLOCKED:** a material policy, business, security or provider input could change the proposal.
- **BOUNDED VALIDATION REQUIRED:** the next material evidence is an executable non-production test, described but **not executed** here.
- Every ADR below independently separates: (1) category, (2) technical, (3) security/privacy, (4) business/policy, (5) provider/external, (6) production, and (7) human governance.

## 5. ADR-0005: Data Access / Query / Transactions / Migrations

**BOUNDED VALIDATION REQUIRED.** SQL-transparent typed persistence with application-owned transactions, parameterized raw SQL, purpose-specific read models, and committed reviewed migrations is compatible with the foundation. But **Drizzle-oriented acceptance itself** requires representative proof against its strongest materially relevant alternative, **Kysely**. Prisma and SQL-first stay credible alternatives, not strawmen.

1. **Category:** Drizzle remains proposed; accepting PostgreSQL/TypeScript did not accept a query/migration product.
2. **Technical:** Fair isolated comparison on identical synthetic real-PostgreSQL schema/fixtures: two-module + audit atomic transaction; shared explicit transaction context without domain-level ORM types; concurrent attendance and provider-effect uniqueness/idempotency; SQLSTATE classification; parameterized raw SQL inside managed transaction; partial unique, CHECK, FK/index DDL; migration from zero and forward upgrade with data preservation; failed migration recovery, schema-drift detection; SQL visibility/EXPLAIN; pooled connections; RLS DDL/context compatibility. Compare reviewable generated SQL vs Kysely migration/type-generation conventions.
3. **Security/privacy:** Server-only adapters, tenant scope, no SQL injection or client credential/DB access, no hidden RLS bypass.
4. **Business/policy:** D-DATA-007 and detailed schema are separate; do not use a tooling spike to settle entitlement rules.
5. **Provider:** Production pool/runtime/provider yet undecided; isolated database comparison remains possible.
6. **Production:** No production migrations, ORM models, release migration strategy or connection topology ready.
7. **Human:** Owner OPEN; decision PENDING; no approval reference.
**Later deliverable:** side-by-side test matrix and pass/fail logs, SQL migrations, rollback/drift evidence, query plans, constraints, tradeoffs and recommended candidate. **Not executed**.

## 6. ADR-0006: Managed Backend Responsibilities

**DECISION-OWNER REVIEWABLE for responsibility model only.**
1. **Category:** Managed services may operate commodity Postgres/Auth/storage/queues as separately governed capabilities; GymPulse owns domain rules, identity/principal authorization, tenant scope, payment evidence and exactly-once effects, attendance, retry, audit and current business state. Provider selection is not part of this decision-category acceptance.
2. **Technical:** No managed PostgreSQL region/connectivity/pooler/HA/PITR/restore/outage proof; foundation disposable PG backup is not provider evidence.
3. **Security/privacy:** No direct client canonical DB mutation; isolate server/admin secrets; non-bypass application credentials; least-privileged admin/support, audit and environment separation.
4. **Business/policy:** D-SEC-001 jurisdiction/residency, RPO/RTO, backup retention, admin access, incident/support, cost budget and operational responsibility.
5. **Provider:** Supabase is a candidate, not accepted. Validate provider region, service/admin access, backup/restore, exit/data-export, cost, outage and contract/privacy before selection.
6. **Production:** Provider, region, runtime topology, secrets, failover/recovery and runbooks remain blocked.
7. **Human:** Owner OPEN, decision PENDING, no approval reference.
**Distinction:** Managed Responsibility Model Acceptance != Managed Provider Selection != Production Infrastructure Readiness.

## 7. ADR-0007: Authentication / Session Architecture

**EVIDENCE-BLOCKED** for the full managed-auth + first-party secure-cookie staff-session proposal. Its provider-independent identity/principal boundary is reviewable as a principle, but the unresolved security session objectives may change provider-token versus GymPulse opaque-server-session implementation.
1. **Category:** Verified provider authentication evidence -> stable AuthIdentity(provider + immutable subject) -> GymPulse Principal -> **current** account eligibility -> trusted scope -> named capability/Member-self -> allow/deny. Provider roles/JWT never equal business capabilities.
2. **Technical:** No real provider login/session, expired/revoked/logout, issuer/audience/signature/key-rotation, cookie CSRF/fixation, or provider exit proof. After policy resolution, run provider-neutral identity/session validation with valid-session account/assignment revocation and outage/secret-isolation negatives.
3. **Security/privacy:** XSS/CSRF, browser token handling, principal linking/recovery, active-session revocation and provider unavailability are material.
4. **Business/policy:** D-SEC-004 exact session lifetime, device policy, revocation SLA, remember-me, idle timeout; staff sign-in/MFA/step-up and recovery authority; D-SEC-001.
5. **Provider:** No Supabase Auth/Clerk/Auth0/Keycloak choice. Verify operational, privacy, region and recovery guarantees later.
6. **Production:** No provider-backed cryptographic/session proof or final cookie-origin/topology.
7. **Human:** Owner OPEN, decision PENDING, approval missing.
**Next prerequisite:** bounded session-lifecycle/security-policy and staff-sign-in decision inputs; then provider-neutral validation. Member method remains separate.

## 8. ADR-0008: Member Verification

**EVIDENCE-BLOCKED.** Phone OTP/passwordless is a leading proposal, not the only viable method.
1. **Category:** Verified phone != Member identity; verified contact != Member-self authorization; phone equality != safe account linking. An explicit Principal-to-Member link must be tenant-aware, concurrency-safe and reversible only through controlled recovery.
2. **Technical:** Later sandbox tests for OTP expiry/reuse/attempt/resend abuse, simultaneous claims, zero/duplicate/already-claimed matches, shared/recycled numbers, wrong-tenant Member ID substitution, self-only, outage/no partial link and provider exit.
3. **Security/privacy:** SIM-swap, number porting/reassignment, channel change, enumeration, consent, recovery attack and SMS exposure need documented controls.
4. **Business/policy:** Obtain **aggregated/de-identified** pilot completeness/duplicate/shared/invalid phone data; decide claim evidence, ambiguity handling, staff-assisted recovery permissions/audit, acceptable SMS support/cost/UX and email/hybrid fallback.
5. **Provider:** Launch market telecom/privacy and SMS delivery proof missing; business messaging provider decision is separate.
6. **Production:** No member accounts, SMS sends, OTP resources, provider integration or final claiming schema.
7. **Human:** Owner OPEN, decision PENDING, approval missing.
**Next prerequisite:** pilot identity-data/business-security policy evaluation before any real provider tests.

## 9. ADR-0009: Authorization Implementation

**DECISION-OWNER REVIEWABLE for core application boundary only.**
1. **Category:** Mandatory trusted GymPulse authorization uses verified Principal + current account eligibility + trusted tenant/resource scope + named capability OR explicit Member-self link + resource relationship. Roles are capability bundles; Owner is not a wildcard superuser.
2. **Technical:** Existing foundation harness PASS for bounded tenant, branch, capability negatives and protected command; does **not** establish complete production matrix.
3. **Security/privacy:** Later negative matrix must test BOLA/ID substitution, masked resource existence, Member-self, wrong-tenant/branch, role/claim spoof, valid-session revocation, current-state query scoping, export/refund/offline payment/attendance correction, Owner non-bypass, worker System Context, provider callback authority, audit attribution, RLS independence and high-impact transaction TOCTOU.
4. **Business/policy:** Manager exact capabilities, refunds, offline payments, exports, attendance correction, support elevation and cross-branch rules await approval.
5. **Provider:** No provider JWT role, middleware, Auth service, RLS or external policy engine replaces this application boundary.
6. **Production:** Policy storage, positive/negative matrix, scoped workers and transaction-safe mutation proof outstanding.
7. **Human:** Owner OPEN, decision PENDING, no approval reference.
**Separation:** category review can occur before final role assignments, but protected production actions require policies and tests.

## 10. ADR-0010: Data-Layer Tenant Isolation / PostgreSQL RLS

**BOUNDED VALIDATION REQUIRED.** Explicit tenant-scoped SQL passed against real PG. Real RLS did **not** run.
1. **Category:** Application authorization mandatory; tenant predicates required; RLS is a selective defense-in-depth candidate, not complete authorization.
2. **Technical:** Separately authorized disposable PG test with synthetic tenant A/B rows and an actual unprivileged NOBYPASSRLS runtime role. Prove SELECT/INSERT/UPDATE/DELETE positives/negatives, missing/invalid context default deny, unsafe broad query containment, table-owner/BYPASSRLS/superuser behavior, FORCE ROW LEVEL SECURITY option, separate migration/admin role, transaction-local tenant context, A->B serial/parallel pooled connection reuse, commit/rollback leak negatives, worker and verified provider-callback scoped access, views/functions/derived ownership, EXPLAIN cost, versioned policy migration, rollback/drift. Test independent app authorization with RLS disabled in isolated validation.
3. **Security/privacy:** No runtime bypass roles, no client-supplied tenant context, no cross-tenant disclosure on pool reuse.
4. **Business/policy:** Test representative tenant/gym/branch classes synthetically; actual table coverage requires ownership classification and D-DATA-007 resolution.
5. **Provider:** Later managed pooler/data-access compatibility required, but not to prove engine-level RLS behaviors.
6. **Production:** No real role/policy, schema, migration, provider or performance baseline accepted.
7. **Human:** Owner OPEN, decision PENDING, approval missing.
**Future deliverable:** reproducible SQL/test logs, effective privileges, negative matrix, pool/rollback traces, EXPLAIN, policy drift and cleanup evidence; **no production resource**.

## 11. Cross-ADR Dependency Matrix

This enumerates pairwise relationships; category-review dependencies must not create circular approval chains.

| Pair | Classification | Why |
|---|---|---|
| 0005 ↔ 0006 | COMPATIBILITY DEPENDENCY | Pooling/managed PG fit; provider does not select ORM |
| 0005 ↔ 0007 | SEPARATELY GOVERNED | Persistence tool does not decide human identity |
| 0005 ↔ 0008 | IMPLEMENTATION-ONLY | Atomic Member-claim persistence follows later |
| 0005 ↔ 0009 | IMPLEMENTATION-ONLY | Authorization state storage/transaction wiring follows later |
| 0005 ↔ 0010 | COMPATIBILITY DEPENDENCY | RLS policy DDL, non-bypass role and transaction context compatible |
| 0006 ↔ 0007 | SEPARATELY GOVERNED | Managed responsibility does not choose Auth vendor |
| 0006 ↔ 0008 | COMPATIBILITY DEPENDENCY | OTP provider/region/recovery must fit boundaries |
| 0006 ↔ 0009 | SEPARATELY GOVERNED | Platform cannot own capability authorization |
| 0006 ↔ 0010 | IMPLEMENTATION-ONLY | Actual managed pooler/role/policy support |
| 0007 ↔ 0008 | COMPATIBILITY DEPENDENCY | OTP evidence must map into approved identity/session model |
| 0007 ↔ 0009 | COMPATIBILITY DEPENDENCY | Verified Principal feeds independent current authorization |
| 0007 ↔ 0010 | IMPLEMENTATION-ONLY | Trusted tenant context comes from app, not provider JWT |
| 0008 ↔ 0009 | COMPATIBILITY DEPENDENCY | Explicit Member-self link required |
| 0008 ↔ 0010 | SEPARATELY GOVERNED | RLS is not member claim or OTP authority |
| 0009 ↔ 0010 | COMPATIBILITY DEPENDENCY | Both controls independently enforced |

**HARD BLOCKERS to production integration, not six-way category acceptance:** D-SEC-004 session policy and validated session controls for human access; approved sensitive capabilities + authorization negative matrix for protected operations; final ownership/role/pooler proof for production RLS; D-DATA-007 for final Member/Membership schema; D-SEC-001 jurisdiction before provider commitment; accepted persistence/migration tooling before production DB implementation. A category acceptance may precede provider binding.

## 12. Security Architecture Findings

**Cross-ADR security contradiction count: none material detected** in the actual six proposals. The existing design repeatedly preserves mandatory application authorization, separate principal resolution, no direct-client canonical DB mutation, bounded workers/callbacks and runtime validation. These invariants are *proposed safeguards*, not evidence of live enforcement.

| Trust boundary | Required control | Evidence / gap |
|---|---|---|
| Browser/Member -> GymPulse runtime | No client canonical mutation or UI-only permission | Design preserved; no production implementation |
| Provider evidence -> internal Principal | Verified immutable-subject mapping | Proposed; no real provider proof |
| Principal -> current authorization | Recheck account, scope, capability, Member-self | Foundation bounded negative PASS; full matrix missing |
| Authorized command -> transaction/SQL | Explicit transaction, constraints, idempotency | Real PG SQL PASS; ORM candidate pending |
| Tenant query -> database RLS | Explicit SQL + optional independent non-bypass policy | Scoped SQL PASS, RLS not tested |
| Background job -> System Context | Bounded action/tenant, fail closed | Design only; real worker matrix pending |
| Verified callback -> use case | No Owner impersonation or unconditional payment truth | Design only; actual provider integration pending |

Reject any implementation treating managed Auth as GymPulse authorization, RLS as complete authorization, JWT role as capability, browser as canonical DB writer, worker as unrestricted principal, payment callback as Owner privilege, or TypeScript types as runtime validation.

**Documentation consistency finding:** a few live docs/README.md / docs/adr/README.md / .ai/current-state.md statements still described accepted PostgreSQL/foundation categories as Proposed. Correct only live current-status wording/indexes; preserve historical task/validation reports unchanged. Stale prose is not proof of security architecture contradiction.

## 13. Exact Evidence Gaps

Verified: accepted foundation and Issue #1; bounded real PG SQL/constraints, migration, backup/restart evidence; six ADR proposal texts, tradeoffs and current canonical statuses. **Not verified:** candidate ORM migrations, actual RLS, production managed DB/provider recovery, Auth cryptography/logout/revocation, real SMS/OTP UX, exact staff/member/security policy, full authorization matrix or production schema.

Outside inputs remain separate: D-SEC-001 jurisdiction/privacy, D-SEC-004 session policy, pilot phone-data quality and claim/recovery authority, Manager/financial/export roles, RPO/RTO, support/admin, D-DATA-007 state ownership, hosting/package-manager/testing/CI and provider choices. No Issue or review evidence authorized ADR-0005..0010 acceptance.

## 14. Priority and Critical Path

The next experiment should reduce P0 cross-tenant disclosure/mutation risk, remain reversible, reuse accepted PostgreSQL evidence and avoid selecting a vendor. Real RLS non-bypass/context/pool behavior materially affects ADR-0010 and later data-access/managed-pooler requirements. Drizzle/Kysely comparison is valuable but P1 and can incorporate learned RLS requirements. Session/member-auth policy work is P0 yet needs separately gathered business/security inputs, while an isolated real-PG RLS proof can run without them. Owner review of ADR-0006/0009 may happen independently; no owner decision is presumed.

## 15. Exactly One Recommended Next Bounded Action

**Isolated Real PostgreSQL RLS Isolation Validation** (separately authorized; **NOT STARTED**).

Bounded plan: use disposable non-production PG, synthetic Tenant A/B ownership fixtures, least-privileged non-bypass runtime/worker roles, explicit SQL predicates and transaction-scoped tenant context. Execute CRUD isolation, absent/malformed context, intentionally broad query, bypass/owner/FORCE behavior, reused connections after commit/rollback, mixed parallel tenants, worker/callback paths, policy migration/drift and representative query plans. Validate application authorization independently. Record observations, fail-closed behavior, caveats and cleanup; never create production policies, roles, migrations or provider resources.

**Success gate:** no cross-tenant read/write under effective runtime role; missing scope denies; no pool/rollback context leak; no accidental bypass; independent app authorization continues to hold. Failed cases remain findings. This review does not execute the plan or create a numbered task.

## 16. Governance Guardrails / Completion Check

- Foundation: ADR-0001..0004 **Accepted**; D-ARCH-005/016/001/002 **DECIDED**; Issue #1 decision owner santosh, date 2026-09-29 unchanged.
- Second batch: ADR-0005..0010 **Proposed**; D-ARCH-017 and D-ARCH-015 **PROPOSED**; D-ARCH-014, D-ARCH-004, D-SEC-002, D-SEC-008 **OPEN**. Owners OPEN, decisions PENDING, approval references MISSING.
- D-SEC-001, D-SEC-004, D-DATA-007, D-ARCH-006/007/009/011/018/019 and provider-specific decisions remain unresolved/separately governed.
- This action reviewed/planned only: **no** ORM install, Auth/OTP send, user/account, production PG/schema/role/RLS/migration, API/app scaffold, infrastructure, hosting, secrets, CI/CD or implementation.
- No Task 0035, ADR-0027 or human approval invented. Historical .ai/task/ and passing validation evidence preserved.
- Second Dependency/Security Acceptance-Readiness Review = **COMPLETED**. Production implementation gate = **CLOSED**.

### Evidence references
- https://github.com/im-tnyx/gym-pulse/issues/1
- docs/adr/ADR-0005-data-access-migration-strategy.md
- docs/adr/ADR-0006-managed-backend-responsibilities.md
- docs/adr/ADR-0007-authentication-session-architecture.md
- docs/adr/ADR-0008-member-authentication-method.md
- docs/adr/ADR-0009-authorization-implementation.md
- docs/adr/ADR-0010-data-layer-tenant-isolation-rls.md
- docs/adr/foundation-decision-owner-review-packet.md
- validation/foundation/EVIDENCE.md
