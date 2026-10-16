# ADR-0010 — RLS Evidence Consolidation and Decision-Owner Review Preparation

## 1. Document Control and Scope

- **Document type:** unnumbered, non-approval architecture governance review packet; not a new ADR, numbered task, implementation authorization, or human decision.
- **Preparation date:** 2026-10-16.
- **Repository:** `im-tnyx/gym-pulse`.
- **Fresh `main` audit baseline:** `6431efb84aa1cd202e33f88b781d668927459291`.
- **Primary ADR:** [ADR-0010 — Data-Layer Tenant Isolation and RLS](ADR-0010-data-layer-tenant-isolation-rls.md).
- **Canonical decision:** `D-SEC-008 = OPEN` in [assumptions.md](../00-overview/assumptions.md).
- **ADR status:** `Proposed`; **Decision Owner: Open**; authorized decision record for ADR-0010 **MISSING**.
- **Decision scope being prepared:** proposed **mandatory GymPulse application authorization + explicit tenant-scoped SQL + selective PostgreSQL RLS as defense in depth**, not provider selection, database deployment, unrestricted/direct client database access, final roles, or policy rollout.
- **Latest completed successful source-branch run reviewed:** [GitHub Actions #38773398231](https://github.com/im-tnyx/gym-pulse/actions/runs/38773398231), exactly `6431efb84aa1cd202e33f88b781d668927459291`, **29/29 PASS** with **cleanup PASS**.
- **Original 29/29 execution run:** [#38772742264](https://github.com/im-tnyx/gym-pulse/actions/runs/38772742264), test source SHA `239e334af3fed69fee97c0b198916722c84b2b79`.
- **Canonical execution evidence:** [validation/security/rls/EVIDENCE.md](../../validation/security/rls/EVIDENCE.md). This packet supplements rather than modifies historical execution facts.

**Preparation result:** **COMPLETED — OWNER REVIEW PACKET PREPARED; FULL ACCEPTANCE READINESS = PARTIAL / EVIDENCE-GATED**. No decision, acceptance, or owner appointment performed.

```text
PostgreSQL Foundation PASS != RLS PASS
Executed RLS Tests PASS != ADR-0010 Accepted
Synthetic Validation App Policy != GymPulse Production Authorization
Transaction-local GUC != Verified Tenant Authority
Decision-Owner Review Packet != Human Decision
Testing/Review != Production Implementation Authorization
```

## 2. Current Governance and Dependency Snapshot

| Prerequisite | Verified current status | Effect on ADR-0010 |
| --- | --- | --- |
| ADR-0001 / D-ARCH-005 | Accepted / DECIDED | Trusted modular monolith direction, not deployed runtime |
| ADR-0002 / D-ARCH-016 | Accepted / DECIDED | Strict TypeScript and supported Node LTS category; validation tool versions not production pins |
| ADR-0003 / D-ARCH-001 | Accepted / DECIDED | Explicit monorepo; does not approve operational CI/provider |
| ADR-0004 / D-ARCH-002 | Accepted / DECIDED | PostgreSQL engine accepted; provider/hosting/roles not approved |
| ADR-0005 / D-ARCH-017 | Proposed / PROPOSED | ORM/query/driver/migration strategy not selected; transaction context compatibility outstanding |
| ADR-0006 / D-ARCH-014 | Proposed / OPEN | Managed responsibility/provider/pooler/recovery/access model outstanding |
| ADR-0007 / D-ARCH-004 | Proposed / OPEN | Auth/session identity boundary unresolved |
| ADR-0008 / D-SEC-002 | Proposed / OPEN | Member verification unresolved |
| ADR-0009 / D-ARCH-015 | Proposed / PROPOSED | Real named-capability and Member-self engine unapproved; RLS cannot take its place |
| ADR-0010 / D-SEC-008 | **Proposed / OPEN** | Prepared for owner **gap triage**, **not full acceptance** |
| D-SEC-001; D-SEC-004 | OPEN; OPEN | Jurisdiction/privacy and session lifecycle policies separately governed |
| D-DATA-007 | PROPOSED | Member/Membership ownership not decided; synthetic fixtures cannot decide it |

The 2026-09-29 Foundation approval at [Issue #1](https://github.com/im-tnyx/gym-pulse/issues/1) identifies `santosh` **for ADR-0001–0004 only**. It is **not** authorization to appoint or approve a D-SEC-008 owner.

**Topology prohibition:** browser/mobile direct canonical database access remains **unapproved**. Under the canonical register, D-SEC-008 is especially P0 **when client-accessible DB patterns are used**; the current plan retains the trusted GymPulse server runtime.

## 3. Evidence Provenance, Reproduction, and Limits

| Evidence item | Observed / reference | Trustworthiness limitation |
| --- | --- | --- |
| Exact source/test commit | `6431efb84aa1cd202e33f88b781d668927459291` via completed [run #38773398231](https://github.com/im-tnyx/gym-pulse/actions/runs/38773398231) | Later documentation commits must not be mistaken for a tested changed harness |
| Real DB engine | PostgreSQL **17.11** / Debian `17.11-1.pgdg12+2`; Docker `postgres:17-bookworm` | Disposable validation version, not a production pin or managed provider |
| Image provenance | `postgres@sha256:3645570cccdfa447589da9f57dd740faa29b30938e861289a5574b6ca6b03826` | Recorded image digest, not supply-chain certification |
| Validation client | Node `v22.23.3` and temporary `pg@8.16.3` | Not an adopted application data-access stack |
| Runtime proof | `validation_runtime` / `validation_worker`: actual restricted PostgreSQL roles, no superuser/BYPASSRLS/table ownership | No final managed-provider role model |
| Job + artifact | [Run #38773398231](https://github.com/im-tnyx/gym-pulse/actions/runs/38773398231), artifact `11992323149` (`gympulse-rls-security-evidence`) | Short retention, scheduled expiration **2026-10-22**; repository evidence + harness remain |
| Executed matrix | **29/29 PASS**; same-PID A→B reuse, rollback and overlapping sessions, positive/negative CRUD | Synthetic A/B fixtures, not real production data, tenancy graph or load |
| Cleanup | `cleanup.txt`: **PASS**, runner exit **0** | No claim about production disposal/recovery |

Independently inspected latest run artifact files: `summary.txt`, `tool-versions.txt`, `test-results.json`, `test-matrix.md`, `migration-001.log`, and `cleanup.txt`. JSON attests `status=PASS`, `passed=29`, `total=29`, all matrix outcomes PASS, matching source SHA and successful GitHub job. Role catalog identifies `validation_schema_owner`, `validation_runtime`, `validation_worker`, `validation_migration_admin` with `rolsuper=false`/`rolbypassrls=false`. A→B pool reuse shared PID **109**; concurrent A and B used PIDs **114/115** with **301ms** measured overlap. These measurements are evidence of that **synthetic run only**.

History: [first attempt #38772087448](https://github.com/im-tnyx/gym-pulse/actions/runs/38772087448) **FAIL** at startup/readiness before security cases; TCP readiness correction; [#38772260264](https://github.com/im-tnyx/gym-pulse/actions/runs/38772260264) 26/26 PASS; [#38772742264](https://github.com/im-tnyx/gym-pulse/actions/runs/38772742264) 29/29 PASS; latest #38773398231 29/29 PASS. Keep failed attempt visible; do not relabel historical failures.

Reproduction (only on a separately authorized disposable local/GitHub Actions runner):

```bash
bash validation/security/rls/scripts/run-validation.sh
```

The workflow is `.github/workflows/rls-isolation-validation.yml`. Re-running is **not** part of this governance-only preparation; evidence is read-only.

## 4. Consolidated 29-Case Execution Matrix

All results below come from the **actual** completed run (not presumed source-code behavior). Detailed per-test observations are in the GitHub run artifact and [EVIDENCE.md](../../validation/security/rls/EVIDENCE.md).

| Domain | Executed test | Result | What this bounded test established |
| --- | --- | --- | --- |
| Role + migration | `real_postgresql_and_runtime_roles` | PASS | Non-owner LOGIN roles; no superuser/BYPASSRLS; PostgreSQL catalog verified |
| Role + migration | `migration_from_zero` | PASS | Fresh disposable DB contains synthetic tables/policies |
| App authorization | `application_authorization_independent_of_rls` | PASS | Validation-layer deny paths; not production policy |
| Tenant CRUD | `tenant_a_select_isolation` | PASS | Tenant A reads only A rows |
| Tenant CRUD | `tenant_b_select_isolation` | PASS | Tenant B reads only B rows |
| Tenant CRUD | `insert_with_check` | PASS | WITH CHECK blocks wrong-tenant writes |
| Tenant CRUD | `update_cross_tenant_denial` | PASS | Cross-tenant UPDATE changes 0 rows |
| Tenant CRUD | `tenant_ownership_update_denial` | PASS | Unauthorized ownership reassignment denied |
| Tenant CRUD | `delete_cross_tenant_denial` | PASS | Cross-tenant DELETE changes 0 rows |
| Fail closed | `missing_tenant_context_fail_closed` | PASS | No-context CRUD fails closed |
| Fail closed | `invalid_tenant_context_fail_closed` | PASS | Unknown context 0 rows; malformed SQLSTATE 22P02 |
| Independence | `broad_query_rls_independent_of_sql_predicates` | PASS | Deliberately broad SELECT remains tenant-contained |
| Privileges | `runtime_and_worker_cannot_alter_policies_or_switch_role` | PASS | DDL and unauthorized SET ROLE denied with SQLSTATE 42501 |
| Privileges | `table_owner_bypass_and_force_rls` | PASS | Non-superuser table owner observes 3 before FORCE, 0 after FORCE without context |
| Context + pooling | `transaction_commit_context_clears` | PASS | Transaction-local context absent after COMMIT |
| Context + pooling | `same_physical_pool_connection_a_then_b` | PASS | Same backend PID reused without tenant inheritance |
| Context + pooling | `rollback_context_and_business_rows_clear` | PASS | Rollback discards tenant context and business mutation |
| Context + pooling | `genuine_parallel_a_b_sessions` | PASS | Two real backend PIDs with overlapping A/B work |
| Worker + callback | `background_worker_scope_and_reuse` | PASS | Scoped synthetic jobs under restricted worker account |
| Worker + callback | `verified_callback_resource_scope` | PASS | Post-verification synthetic adapter rejects mismatched resource tenant |
| Read models | `security_invoker_view_isolation` | PASS | security_invoker=true view tenant-contained |
| Integrity | `tenant_aware_referential_integrity` | PASS | Cross-tenant FK rejected with SQLSTATE 23503 |
| Migration + drift | `admin_forward_policy_migration` | PASS | Separate admin tightens policy and maintains A/B isolation |
| Migration + drift | `validation_policy_drift_detection` | PASS | Run-local mutation detected and restored |
| Performance | `representative_query_plans` | PASS | Five bounded EXPLAIN ANALYZE synthetic plans |
| Worker + callback | `worker_invalid_tenant_context` | PASS | Unknown worker tenant returns 0; malformed context safely errors |
| App authorization | `application_auth_with_rls_absent_in_disposable_table` | PASS | Validation adapter denies wrong tenant/branch/capability/member self with RLS off |
| Performance | `protected_vs_unprotected_explain_assessment` | PASS | Privileged 3 rows versus RLS-constrained A 2; not overhead benchmark |
| Migration + drift | `policy_force_state_after_forward` | PASS | FORCE/RLS remain enabled after forward change |

**Interpretation:**
1. **RLS independence was tested:** intentionally broad SELECT remained tenant-contained under a restricted actual database role despite lack of tenant predicate. This does **not** remove the obligation for explicit predicates.
2. **Application authorization independence was tested as a synthetic adapter:** denied wrong tenant/branch/capability/member self even on a disposable table with RLS **off**; it is **not** the production GymPulse authorization module.
3. **Database owner / FORCE semantics were observed:** table owner without FORCE bypassed row filter; with FORCE and no matching context saw 0 rows. `FORCE ROW LEVEL SECURITY` **does not contain superuser or BYPASSRLS roles**.
4. **Pooling tests used actual physical connection reuse:** transactional scope cleared after commit and rollback; overlapping real A/B sessions isolated.
5. **Post-verification callbacks and background workers were simulated:** neither provider signature verification nor unrestricted platform/system-worker access was proven.
6. **Five query plans / one limited comparison were inspected:** small fixtures and differing effective roles make them unsuitable for production-scale cost/latency guarantees.
7. **Migration and policy drift cases were disposable:** forward policy migration tested; drift checked against a run-captured policy baseline, not a committed deployed-production expected state.

## 5. Security Threats, Control Ownership, and Residual Exposure

| Threat / failure condition | Application / policy control required | Bounded evidence | Remaining exposure / owner question |
| --- | --- | --- | --- |
| Client substitutes tenant ID / compromised SQL sets arbitrary `gympulse.tenant_id` | Verified principal + current eligibility + authorized tenant/resource resolver; transaction context established only from trusted server state | Missing, invalid and forged-context *scoping* exercised | **Critical residual:** custom GUC is user-settable by any arbitrary SQL on same DB role; decide threat model and runtime/SQL-injection boundaries |
| Missing predicate/incorrect join | Explicit tenant-scoped SQL + query review + RLS on classified tenant-owned tables | Broad SELECT and CRUD tenant isolation PASS | No final protected-table inventory/coverage for production |
| Same-tenant BOLA/IDOR / capability escalation | Named capability, gym/branch/member-self policies, audit and revocation | Synthetic independent adapter PASS | Production authorization module and policy matrix in ADR-0009 not yet validated/approved |
| Owner, privileged runtime, service-role bypass | Non-owner NOBYPASSRLS ordinary role, least privilege, separated migration/admin and break-glass | PostgreSQL catalog, DDL denial and FORCE behavior PASS | Final production roles, privileged secrets, managed-service grants and owner topology open |
| Worker or callback wrong-tenant mutation | Canonical job resource/tenant, System Principal, separate callback signature/resource verification | Synthetic worker/callback negative tests PASS | Live provider signature verification and real job execution pipelines NOT RUN |
| Pooled scope bleed / rollback | Transaction-local scope; re-establish after each transaction, retry and worker task | A/B same PID, rollback, concurrency PASS | Final runtime/driver/pooler transaction mode unresolved |
| Definer function, views, constraints | `security_invoker` view; strict `SECURITY DEFINER` search path/grants or avoidance; tenant-aware composite constraints | Invoker view and composite FK PASS | Privileged-function escalation matrix NOT RUN; FK/unique existence-disclosure mitigations require schema review |
| Backups/replicas/raw dumps/export | Separate audited backup/restore privileges, export capability, encryption/retention | Separate foundation backup/restore evidence exists, not RLS confidentiality proof | Production backup/policy restore, direct dumps, replicas, support permissions NOT RUN |
| Policy drift/rollback/performance | Versioned production migrations, drift CI/ops, representative load, rollback plan | Fresh migration, forward policy tweak, run-local drift, synthetic EXPLAIN PASS | Deployed static policy-template drift, production query cardinality and managed performance NOT RUN |
| Direct-client DB access | Independent P0 review of provider tokens, grants, JWT freshness, member-self RLS, privileged key handling | **None** for direct client access | **Not authorized; do not silently treat these tests as sufficient** |

## 6. Remaining Acceptance Evidence: Disposition and Exact Requested Proof

| Requirement / dependency | Evidence disposition | Human/technical proof needed before full ADR acceptance |
| --- | --- | --- |
| Core A/B RLS CRUD, missing context, role non-bypass, same-PID reuse and independent app adapter | **PASS for bounded disposable PostgreSQL** | Do not repeat without new risk/coverage need; carry evidence to decision owner |
| Trusted tenant authority and SQL-injection/compromised-runtime threat boundary | **EVIDENCE GAP — P0 security** | Approved model for deriving tenant context only from verified server-side scope; handle runtime arbitrary-SQL substitution risk explicitly |
| Provider/managed pooler/driver behavior | **EXTERNAL / FUTURE COMPATIBILITY — P1** | State proposed connection modes and test transaction-local A/B isolation on *selected* topology, including worker/long-lived/serverless modes |
| Final tenant-owned table and direct/derived schema inventory | **DECISION DEPENDENCY — P1** | Determine organizational/gym/branch key, tenant-aware FK and ownership classification; coordinate D-DATA-007 without prematurely deciding it |
| Actual application capability/Member-self negative matrix | **NOT RUN IN PRODUCTION MODULE — P0 authorization** | ADR-0009 policy/catalog assignment, current account revocation, BOLA/IDOR, export/financial/attendance paths and negative cases under trusted runtime |
| Privileged function/view/owner and bypass policy | **PARTIAL: invoker view PASS; definer attacks NOT RUN** | Avoid definer helpers or authorize narrow search_path/GRANT/effective-user tests if any are proposed |
| Backup/restore role-policy preservation, raw backup security | **NOT RUN FOR RLS POLICY RESTORE** | Scoped backup/policy restore proof plus documented confidentiality/recovery controls; foundation backup PASS is separate |
| Policy-template drift, change control and rollback | **PARTIAL: run-local drift PASS** | Committed policy expectations vs observed deployed environment, least-privileged migration duties, rollback/forward-fix plan |
| Representative production/large-fixture performance | **PARTIAL: tiny synthetic EXPLAIN PASS** | Selected tenant volumes, branch distributions and query access plans; compare secure variants under matched conditions |
| Actual callback verification/job pipeline | **PARTIAL: scoped synthetic adapter PASS** | Provider signature/replay/authentication, canonical resource ownership, bounded System Context, callback/job negative tests |
| Human decision owner, approval and signoff | **MISSING** | Identify authorized D-SEC-008 owner, document review decision/date/rationale, any explicit conditional exclusions and durable approval reference |

**Priority labels in this review packet are risk-triage labels, not new canonical priority/status decisions.** The canonical register retains `D-SEC-008 = OPEN` and existing dependencies unchanged.

## 7. Decision-Owner Review Agenda and Options (No Decision Taken)

**Preparation recommends: `KEEP PROPOSED; REQUEST GAP TRIAGE`.** The core PostgreSQL behavior has favorable bounded evidence, but full security-architecture acceptance cannot be inferred from 29/29 synthetic cases.

A future authorized D-SEC-008 decision owner should explicitly address:

1. Who has **documented authority** over D-SEC-008 (not automatically the Foundation owner at Issue #1)?
2. Is the architectural *category* of mandatory application authorization + explicit tenant predicates + **selective PostgreSQL RLS** supported in principle, while final scope/provider/pooler mechanics remain separately gated?
3. Does the threat model accept custom transaction-local PostgreSQL GUC only as an **input to RLS** after trusted authorization, with the **arbitrary SQL/SQL-injection substitution risk** explicitly owned and mitigated elsewhere? What would be insufficient?
4. Which table families require RLS? What is the tenant/org/gym/branch ownership key, and how are related-row invariants guaranteed independently of RLS?
5. Which final restricted runtime, worker, migration and operational roles and provider/pooler paths can enforce the observed properties? Are any privileged functions or non-tenant scheduler/discovery queries required?
6. Which ADR-0009 capability/Member-self tests, callback proof, recovery/backup controls, migration drift checks and representative performance criteria must be available **before full ADR-0010 acceptance**?
7. Is direct-client canonical data access explicitly still disallowed? If any such use case is requested later, require a **separate P0 security review**, not an extension of this approval.
8. What remaining tests, decision dependencies, and explicit human signoffs have to be completed, deferred with recorded rationale, or rejected?

**Possible human-owner dispositions (not applied):** `REQUEST FURTHER EVIDENCE`; `REQUEST ADR REVISION`; `ACKNOWLEDGE CATEGORY DIRECTION WITHOUT APPROVAL`; `REJECT PROPOSAL`; or `APPROVE` only after the owner judges acceptance requirements met and records authority, rationale, date, evidence and limitations. This packet **does not** pre-authorize any of these actions.

## 8. Human Signoff Template — Intentionally Unfilled

```text
Decision ID: D-SEC-008
ADR: ADR-0010
Authorized Decision Owner: OPEN — not supplied
Decision: PENDING — no human disposition
Decision Date: NOT RECORDED
Approval/Review Reference: MISSING
Evidence Reviewed: validation/security/rls/EVIDENCE.md and this packet
Risk Acceptance / Explicit Exclusions: NOT RECORDED
Independent Security Review (if needed): NOT RECORDED
Canonical Status: OPEN
ADR Status: Proposed
Production Authorization: NONE
```

**Do not fill these from a technical PASS, GitHub issue created by automation, or the Foundation Issue #1.** Only a separately evidenced authorized human decision may update the canonical register and ADR status.

## 9. Scope Guardrails and Exact Next Bounded Action

This action created a governance packet and synchronized live documentation pointers only. It did **not** run new PostgreSQL tests, add a CI workflow, change role/policy/schema/migration implementation, choose provider/ORM/hosting, create infrastructure/secrets, implement GymPulse business APIs, create Task 0035/ADR-0027, or conduct human approval. Historical foundation and RLS validation evidence remains intact. All six second-batch ADRs remain Proposed. The production implementation gate remains **CLOSED**.

**EXACTLY ONE NEXT BOUNDED GOVERNANCE ACTION: `D-SEC-008 Authorized Decision-Owner Assignment and Evidence-Gap Triage`.**

A human must identify/confirm the authorized D-SEC-008 reviewer and triage the table in Section 6 into concrete approve/defer/request-more-evidence decisions, with a durable review reference. **No auto-acceptance and no production execution**. Do not start a technical provider evaluation, policy installation, implementation or acceptance workflow under this preparation task.

## 10. Source of Truth / Evidence References

- [assumptions.md — canonical decision register](../00-overview/assumptions.md)
- [ADR-0010 proposal](ADR-0010-data-layer-tenant-isolation-rls.md)
- [ADR-0009 authorization proposal](ADR-0009-authorization-implementation.md)
- [ADR-0005 data access proposal](ADR-0005-data-access-migration-strategy.md)
- [ADR-0006 managed backend proposal](ADR-0006-managed-backend-responsibilities.md)
- [Second Dependency/Security Readiness Review](second-dependency-security-acceptance-readiness-review.md) — historical pre-RLS finding; not silently overwritten
- [Real PostgreSQL RLS Evidence](../../validation/security/rls/EVIDENCE.md)
- [GitHub run #38773398231](https://github.com/im-tnyx/gym-pulse/actions/runs/38773398231) and uploaded synthetic evidence artifact `11992323149`
- [GitHub Foundation approval Issue #1](https://github.com/im-tnyx/gym-pulse/issues/1) — Foundation scope **only**

## 11. Human Governance Review Request — Opened 2026-10-16

The next bounded action has been **initiated as a human-review request**, not completed as an owner assignment or triage: [GitHub Issue #2 — D-SEC-008 Owner Assignment and Evidence-Gap Triage](https://github.com/im-tnyx/gym-pulse/issues/2). This issue contains explicit authority-verification fields, an **unfilled** disposition for each outstanding P0/P1/security/provider/policy gap, a human-response template and completion criteria. No GitHub assignee or decision owner was assigned based on inference.

**Request status: OPEN / AWAITING AUTHORIZED HUMAN RESPONSE.** At issuance, neither the authorized D-SEC-008 decision owner nor risk/acceptance dispositions have been evidenced. Issue #2 is **a request**, **not an approval reference**. Foundation Issue #1 grants no implied authority over this ADR. The active single next human governance step is **document authorized D-SEC-008 owner authority and complete issue-level evidence-gap dispositions in Issue #2**. Until then, `ADR-0010 = Proposed`, `D-SEC-008 = OPEN`, approval **MISSING**, overall production implementation **CLOSED**.
