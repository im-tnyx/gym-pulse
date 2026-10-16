# GymPulse — Real PostgreSQL RLS Isolation Validation Evidence

## 1. Execution and authorization

- User authorization: 2026-10-15, specifically proceeding with the previously described GitHub Actions disposable PostgreSQL RLS validation; **no** production or external managed database approval.
- Pre-execution audited `main`: `9a39f71a8dcc31c4cb311694df474396c8e5f660`.
- Validation branch: `validation/rls-isolation-20261015`. Tested exact source SHA: `239e334af3fed69fee97c0b198916722c84b2b79`.
- Completed successful Actions run: https://github.com/im-tnyx/gym-pulse/actions/runs/38772742264
- Workflow run ID: `38772742264`. Job ID: `116552503245`. Runner job conclusion: **success**.
- GitHub-hosted ephemeral Ubuntu 24.04.5 runner, Docker 28.0.4; validation-only Node.js **v22.23.3**, npm test client `pg@8.16.3`.
- Real PostgreSQL **17.11** (Debian 17.11-1.pgdg12+2), Docker image `postgres:17-bookworm`, observed digest `postgres@sha256:3645570cccdfa447589da9f57dd740faa29b30938e861289a5574b6ca6b03826`. These are **validation versions, not production selections**.
- Entirely synthetic Tenant A (`11111111-1111-4111-8111-111111111111`) / Tenant B (`22222222-2222-4222-8222-222222222222`); no production data, credentials, schema, providers, or services.
- Actions artifact `gympulse-rls-security-evidence`, artifact ID `11991319247`, retained until **2026-10-22** unless deleted earlier. Captured: `summary.txt`, `tool-versions.txt`, `test-results.json`, `test-matrix.md`, `migration-001.log`, `cleanup.txt`. The repository carries reusable tests and a concise observed evidence summary, **not** temporary passwords/dumps.
- Earlier attempt https://github.com/im-tnyx/gym-pulse/actions/runs/38772087448 failed during startup readiness (the temporary initialization server briefly answered the socket). Corrected by waiting for PostgreSQL **TCP** readiness before schema migration. Intermediate run https://github.com/im-tnyx/gym-pulse/actions/runs/38772260264 passed 26/26; latest completed suite added three more bounded cases and passed 29/29. Previous failure is retained as historical evidence.

## 2. Actual result

```text
Authorized isolated environment = VERIFIED
Real PostgreSQL = 17.11 (executed)
Foundation PostgreSQL validation = separately PASS, not RLS proof
Executed validation scenarios = PASS (29 / 29)
Explicit failed scenarios in final run = 0
Disposal and cleanup = PASS
GitHub job conclusion = success
Overall bounded synthetic RLS test suite = PASS
Overall ADR-0010 acceptance/readiness evidence = PARTIAL (see untested gaps below)
ADR-0010 = Proposed
D-SEC-008 = OPEN
Production implementation gate = CLOSED
```

### Database role evidence

| Role | Real PostgreSQL status | Purpose |
| --- | --- | --- |
| `validation_schema_owner` | NOLOGIN, NOSUPERUSER, NOBYPASSRLS, owns protected tables | Schema ownership |
| `validation_runtime` | LOGIN, NOSUPERUSER, NOBYPASSRLS, non-owner | Actual restricted-role CRUD test |
| `validation_worker` | LOGIN, NOSUPERUSER, NOBYPASSRLS, non-owner | Bounded synthetic worker tests |
| `validation_migration_admin` | LOGIN, NOSUPERUSER, NOBYPASSRLS, explicitly granted owner-role switch | Isolated DDL and policy migration |
| `gympulse_rls_bootstrap` | Disposable initialization superuser | Seed/catalog inspection only; **not** used for runtime security assertions |

Actual attempted runtime/worker DDL and unauthorized owner-role switches all returned SQLSTATE `42501`. Normal runtime neither owns tenant tables nor has BYPASSRLS. Before FORCE RLS, the non-superuser table owner observed **3** records; after FORCE, the owner without a matching tenant policy observed **0**. Superusers and BYPASSRLS roles are not contained by FORCE.

### Verified scenario matrix

| Actual test | Result | Evidence |
| --- | --- | --- |
| `real_postgresql_and_runtime_roles` | PASS | Completed job log + test-results.json |
| `migration_from_zero` | PASS | Completed job log + test-results.json |
| `application_authorization_independent_of_rls` | PASS | Completed job log + test-results.json |
| `tenant_a_select_isolation` | PASS | Completed job log + test-results.json |
| `tenant_b_select_isolation` | PASS | Completed job log + test-results.json |
| `insert_with_check` | PASS | Completed job log + test-results.json |
| `update_cross_tenant_denial` | PASS | Completed job log + test-results.json |
| `tenant_ownership_update_denial` | PASS | Completed job log + test-results.json |
| `delete_cross_tenant_denial` | PASS | Completed job log + test-results.json |
| `missing_tenant_context_fail_closed` | PASS | Completed job log + test-results.json |
| `invalid_tenant_context_fail_closed` | PASS | Completed job log + test-results.json |
| `broad_query_rls_independent_of_sql_predicates` | PASS | Completed job log + test-results.json |
| `runtime_and_worker_cannot_alter_policies_or_switch_role` | PASS | Completed job log + test-results.json |
| `table_owner_bypass_and_force_rls` | PASS | Completed job log + test-results.json |
| `transaction_commit_context_clears` | PASS | Completed job log + test-results.json |
| `same_physical_pool_connection_a_then_b` | PASS | Completed job log + test-results.json |
| `rollback_context_and_business_rows_clear` | PASS | Completed job log + test-results.json |
| `genuine_parallel_a_b_sessions` | PASS | Completed job log + test-results.json |
| `background_worker_scope_and_reuse` | PASS | Completed job log + test-results.json |
| `verified_callback_resource_scope` | PASS | Completed job log + test-results.json |
| `security_invoker_view_isolation` | PASS | Completed job log + test-results.json |
| `tenant_aware_referential_integrity` | PASS | Completed job log + test-results.json |
| `admin_forward_policy_migration` | PASS | Completed job log + test-results.json |
| `validation_policy_drift_detection` | PASS | Completed job log + test-results.json |
| `representative_query_plans` | PASS | Completed job log + test-results.json |
| `worker_invalid_tenant_context` | PASS | Completed job log + test-results.json |
| `application_auth_with_rls_absent_in_disposable_table` | PASS | Completed job log + test-results.json |
| `protected_vs_unprotected_explain_assessment` | PASS | Completed job log + test-results.json |
| `policy_force_state_after_forward` | PASS | Completed job log + test-results.json |

### Observed cross-tenant behavior and boundaries

- Tenant A SELECT returned only **2** A rows; Tenant B SELECT returned only **1** B row. A broad SELECT without tenant predicate was still scoped under real RLS.
- A's allowed INSERT/UPDATE/DELETE committed where permitted. Cross-tenant INSERT and tenant-ownership UPDATE were denied; cross-tenant UPDATE and DELETE changed **0** rows. B's row remained intact.
- Missing tenant context: SELECT/UPDATE/DELETE returned no unauthorized rows or mutations; INSERT was denied. Unknown UUID contexts yielded no rows; malformed worker/runtime tenant IDs produced safe SQLSTATE `22P02`, not authorization approval.
- Same-physical-connection A-to-B reuse and post-COMMIT/reset were verified by real backend PID. Post-ROLLBACK reuse preserved no A row or context. Two distinct PostgreSQL backend PIDs overlapped approximately **302 ms** with isolated A/B row counts (observed in the 26-test intermediate run; final suite repeated concurrency successfully).
- Validation-only worker used actual restricted credentials and did not see other tenant's jobs, including A-to-B reuse and missing/invalid job scopes. Synthetic callback-resource mismatch denied before SQL; **not** a signature-verification test.
- Independent validation authorization rejected wrong tenant, branch, capability and member-self, even for a separate disposable table with **no RLS**. This is **not** the production GymPulse policy engine.
- `security_invoker=true` PostgreSQL view was tenant-contained. No SECURITY DEFINER function was created in the validation schema; privileged helper-function attack cases are **NOT RUN**.
- Tenant-aware composite FK rejected an impossible cross-tenant reference (SQLSTATE `23503`); referential/uniqueness error existence-disclosure risk remains.
- Fresh SQL migration, subsequent tightening forward policy migration, disposable drift mutation/detection/restore and five generic EXPLAIN ANALYZE query plans all passed.
- Compared unrestricted bootstrap vs RLS-restricted plan/row cardinality: **3 privileged rows vs 2 Tenant A rows**. Different effective roles and tiny data make this **not a production performance benchmark**.
- Docker container and uniquely named volume were removed; exit code **0**. Reported `Cleanup: PASS`.

## 3. Explicit NOT RUN / external evidence still required

| Gap | Classification | Why it remains |
| --- | --- | --- |
| Privileged SECURITY DEFINER function escalation matrix | NOT RUN | No such function introduced; production callable helper contracts unresolved |
| Final production pooler/provider transaction/session compatibility | EXTERNAL / HUMAN EVIDENCE REQUIRED | Disposable Docker connection pool is not a managed pooler |
| Production tenant-context authority or SQL-injection-compromised-runtime resistance | EXTERNAL / HUMAN EVIDENCE REQUIRED | Custom GUC can be changed by arbitrary SQL under same role; RLS alone cannot authenticate it |
| Real provider webhook signature verification | NOT RUN | Only post-verification synthetic callback scope tested |
| Production query scale, multi-branch ownership and final Member/Membership schemas | EXTERNAL / HUMAN EVIDENCE REQUIRED | Generic small fixtures only; D-DATA-007 stays unresolved |
| Production backup confidentiality and live RLS policy restoration | NOT RUN | Foundation's separate backup/restore PASS does not validate these concerns |
| Static committed policy-template versus deployed policy drift in an existing environment | NOT RUN | This run tested mutation detection against a run-captured baseline; no production CI/drift design accepted |
| Authorized architecture decision-owner approval | EXTERNAL / HUMAN EVIDENCE REQUIRED | Technical green tests do not constitute approval |

**Overall evaluation:** real PostgreSQL **RLS isolation scenario suite PASS (29/29)** and **cleanup PASS**. **Acceptance-readiness remains PARTIAL** because the above untested/provider/governance gates are not resolved. No claim of production RLS acceptance or security-architecture approval is made.

## 4. Next bounded governance action

**ADR-0010 Evidence Consolidation and Decision-Owner Review Preparation** — review the executed synthetic evidence and unresolved production/security requirements for an authorized human decision owner; **do not accept ADR-0010, decide D-SEC-008, deploy policies or begin production implementation**. A further targeted evidence request may be needed.

No Task 0035, ADR-0027, production secrets, infra or canonical status changes were created.

## 5. Subsequent independently verified run / governance review (2026-10-16)

The repository's subsequently completed [Actions run #38773398231](https://github.com/im-tnyx/gym-pulse/actions/runs/38773398231) tested source SHA `6431efb84aa1cd202e33f88b781d668927459291`. Its downloaded artifact `11992323149` (`gympulse-rls-security-evidence`, scheduled expiration **2026-10-22**) was independently inspected: `test-results.json` reported **29/29 PASS**, every enumerated case PASS; PostgreSQL version **17.11**; `cleanup.txt` **PASS**; `summary.txt` exit **0**; restricted runtime/worker roles remained non-superuser/non-BYPASSRLS. This is confirmation of the **same bounded synthetic suite**, not validation of the remaining production gaps.

The next governance-preparation artifact is the [ADR-0010 RLS Evidence Consolidation and Decision-Owner Review Packet](../../docs/adr/adr-0010-rls-evidence-decision-owner-review-packet.md) (**PREPARED**); the **one next bounded action** is `D-SEC-008 Authorized Decision-Owner Assignment and Evidence-Gap Triage` (**NOT STARTED**). Historical Section 4 records the immediate next step at execution time. `ADR-0010` stays **Proposed**, `D-SEC-008` stays **OPEN**, and production remains **CLOSED**.
