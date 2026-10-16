# ADR-0010 / D-SEC-008 — Security Evidence-Gap Triage and Validation Plan

## 0. Record Type, Baseline, and Safety Boundary

- **Prepared:** 2026-10-16; **record type:** proposed security/architecture triage **for decision-owner review**, not an ADR, approval, accepted risk waiver, CI workflow, test execution, or implementation.
- **Audited `main` baseline:** `6610aaaa609eaaa4286c28cd399bd2bb9c293793`.
- **Human Owner:** `@im-tnyx`; personally confirmed and self-attested governance authority in [GitHub Issue #2, owner comment](https://github.com/im-tnyx/gym-pulse/issues/2#issuecomment-6214567976). This GitHub record demonstrates owner consent and repo-admin access, **not independent third-party attestation**.
- **Governance parent:** [Issue #2 — D-SEC-008 Owner / Evidence-Gap Triage](https://github.com/im-tnyx/gym-pulse/issues/2).
- **ADR:** [ADR-0010](ADR-0010-data-layer-tenant-isolation-rls.md), **Proposed**. **Canonical `D-SEC-008 = OPEN`** ([assumptions register](../00-overview/assumptions.md)).
- **Actual bounded evidence:** [PostgreSQL RLS results](../../validation/security/rls/EVIDENCE.md), [executed run #38773398231](https://github.com/im-tnyx/gym-pulse/actions/runs/38773398231) at `6431efb84aa1cd202e33f88b781d668927459291`: 29/29 synthetic PASS; cleanup PASS; **not production proof**.
- **Independent Security Reviewer:** not appointed. **Formal gap dispositions:** **PENDING (0/12 explicitly adopted in a human comment)**.
- **Authoring boundary:** plan/design/checklist only. **No PostgreSQL resources, policy migrations, workflow runs, provider selections, credentials, staging or production mutations.**
- **Production implementation gate:** **CLOSED**.

**Decision status distinction**

```text
Proposed technical triage (this document) != approved security requirements
Verified owner declaration != ADR-0010 acceptance
29/29 synthetic RLS PASS != integrated production authorization
RLS GUC is user-settable under the same SQL role != authenticated tenant authority
Category direction != approval of provider, pooler, schema, role, or production rollout
Human per-gap disposition != final ADR approval
```

## 1. Decision-Owner Scope and Proposed Disposition Vocabulary

This document prepares a bounded **12/12 recommendation matrix**; it does **not** sign it on the owner's behalf. Its `G01–G12` rows align in order to the existing 12 Issue #2 evidence-gap rows.

- **REQUIRE PROOF BEFORE ADR ACCEPTANCE:** architecture/security evidence is needed before the human owner may responsibly accept the RLS decision.
- **REQUIRE PROOF BEFORE PRODUCTION / AFFECTED LIVE PATH:** explicit release-gate technical evidence, typically dependent on future approved provider/schema/runtime decisions; not permission to deploy now.
- **DEFAULT PROHIBIT / KEEP OPEN:** recommended hard boundary, or a required separate decision if the topology changes.
- **CONDITIONAL / DEFER-WITH-RATIONALE:** not applicable only after an inventory shows feature absent, or the owner documents the dependency, accountable person, proof condition, and final-gate applicability. **Silence never means waived.**
- **Risk P0/P1 here is internal triage shorthand**, not a change to canonical register priorities.

Technical reviewers can recommend a category direction, but **only an explicit authorized human owner comment** can convert a recommendation into an adopted per-gap disposition. A later separate formal decision is needed to accept ADR-0010.

## 2. Complete 12-Gap Proposed Decision Matrix

| Gap | Technical urgency | Residual gap | Recommended disposition (NOT owner-approved) | Accountable role proposed |
| --- | --- | --- | --- | --- |
| G01 | P0 | Trusted tenant authority / arbitrary SQL and GUC tampering | REQUIRE PROOF BEFORE ADR ACCEPTANCE | Security + Identity + Backend |
| G02 | P0 | Real application authorization / BOLA / Member-self | REQUIRE PROOF BEFORE ADR ACCEPTANCE | Security + Authorization + Identity |
| G03 | P1 | Selected provider, driver, restricted DB roles and pooler | REQUIRE COMPATIBILITY PROOF BEFORE FULL ADR ACCEPTANCE; STAGING PROOF BEFORE DEPLOYMENT | Data + Platform + Security |
| G04 | P0 | Tenant/organization/gym/branch table coverage + data integrity | REQUIRE OWNERSHIP DESIGN AND NEGATIVE PROOF BEFORE ADR ACCEPTANCE | Data + Domain + Security |
| G05 | P1 conditional | Worker System Context and real provider callbacks | REQUIRE PROOF BEFORE RESPECTIVE LIVE PATH; DOCUMENT ADR REVIEW DEPENDENCY | Backend + Security + Integrations |
| G06 | P0 conditional | SECURITY DEFINER, views, owner/service/admin bypass | DEFAULT PROHIBIT PRIVILEGED HELPERS; IF PRESENT REQUIRE SECURITY MATRIX BEFORE ACCEPTANCE | Data + Security + Platform |
| G07 | P1 | Backup/restore, raw dumps, policy+role recovery | REQUIRE ISOLATED RLS RECOVERY PROOF BEFORE PRODUCTION RELEASE | Platform + Data + Security |
| G08 | P1 | Versioned policy template, drift and forward-fix/rollback | REQUIRE POLICY-AS-CODE AND DRIFT PROOF BEFORE DEPLOYMENT | Data + Platform + Security |
| G09 | P1 | Representative tenant-scale performance and query plans | REQUIRE MATCHED REPRESENTATIVE QUERY BENCHMARK BEFORE PRODUCTION | Data + Backend + Performance |
| G10 | P0 boundary | Direct-client canonical database access | RETAIN PROHIBITION; NEW SEPARATE P0 DECISION IF EVER PROPOSED | Security + Architecture |
| G11 | P1 external | Jurisdiction/privacy/provider/deployment and identity/session dependencies | KEEP CANONICAL DECISIONS OPEN; REQUIRE OWNER ROUTING AND EVIDENCE BEFORE THEIR DEPENDENT RELEASE | Product + Legal/Privacy + Platform + Identity |
| G12 | P0 governance | Final human risk acceptance, independent review, ADR status | KEEP ADR PROPOSED AND D-SEC-008 OPEN; HUMAN DECISION LATER | Confirmed owner @im-tnyx; independent reviewer not appointed |

**All twelve rows:** recommendation `PREPARED`; **human adoption `PENDING`**. Owner nomination is already verified and **must not be re-requested**. Actual named test owners are not yet assigned; role owners above are **suggestions only**.

## 3. Evidence / Negative-Test Contract Per Gap

Each requirement below uses the repository's documented trust boundaries. A green matrix without recorded failure paths is insufficient; preserve observed logs/artifacts and failure findings.

### G01 — Trusted tenant authority / arbitrary SQL and GUC tampering

**Proposed disposition (not a human decision):** REQUIRE PROOF BEFORE ADR ACCEPTANCE.  
**Proposed accountable role (no individual assigned):** Security + Identity + Backend.  
**Dependencies:** ADR-0007/0009; final tenant context design.  
**Required verifiable evidence / test design:** Signed-off trust-boundary design: verified Principal → current scope/resource authorization → per-transaction DB context; threat model acknowledges same-role SQL can SET a custom GUC; tests for untrusted tenant ID, SQL parameterization, hostile inputs, unauthorized scope, retry/rollback.  
**Blocker / caveat:** Cannot claim GUC provides independent protection when arbitrary SQL executes as same DB role; unsupported threat model or implicit client authority blocks acceptance.

**Human decision:** PENDING — confirmed owner must record **adopt / amend / defer-with-rationale / reject**, a responsible person, proof or allowed exclusion, and target review condition in Issue #2.

### G02 — Real application authorization / BOLA / Member-self

**Proposed disposition (not a human decision):** REQUIRE PROOF BEFORE ADR ACCEPTANCE.  
**Proposed accountable role (no individual assigned):** Security + Authorization + Identity.  
**Dependencies:** ADR-0009 D-ARCH-015; ADR-0007/0008 and Member-self policy.  
**Required verifiable evidence / test design:** Executable server authorization policy: named capability, tenant/branch/resource ownership, Member Access Link, account revocation, role change, export/refund/attendance negatives. Re-run when RLS off in isolated test and again with RLS on.  
**Blocker / caveat:** Synthetic adapter from prior suite is not production GymPulse authorization; ability to bypass via endpoint/job or Member ID is blocker.

**Human decision:** PENDING — confirmed owner must record **adopt / amend / defer-with-rationale / reject**, a responsible person, proof or allowed exclusion, and target review condition in Issue #2.

### G03 — Selected provider, driver, restricted DB roles and pooler

**Proposed disposition (not a human decision):** REQUIRE COMPATIBILITY PROOF BEFORE FULL ADR ACCEPTANCE; STAGING PROOF BEFORE DEPLOYMENT.  
**Proposed accountable role (no individual assigned):** Data + Platform + Security.  
**Dependencies:** ADR-0005 D-ARCH-017; ADR-0006 D-ARCH-014; deployment mode.  
**Required verifiable evidence / test design:** Role/GRANT catalog and migration/runtime credential separation; actual chosen transaction pooler/driver: same physical connection A→B, missing context, commit/rollback, retry, parallel worker and request traces. Verify non-owner/no BYPASSRLS/non-superuser normal credentials.  
**Blocker / caveat:** Disposable direct-PG test proves only engine behavior, not managed-provider transaction/session pooling or runtime secrets.

**Human decision:** PENDING — confirmed owner must record **adopt / amend / defer-with-rationale / reject**, a responsible person, proof or allowed exclusion, and target review condition in Issue #2.

### G04 — Tenant/organization/gym/branch table coverage + data integrity

**Proposed disposition (not a human decision):** REQUIRE OWNERSHIP DESIGN AND NEGATIVE PROOF BEFORE ADR ACCEPTANCE.  
**Proposed accountable role (no individual assigned):** Data + Domain + Security.  
**Dependencies:** D-DATA-004; D-DATA-007/ADR-0026; final schema.  
**Required verifiable evidence / test design:** Classify all canonical/config/reference/operational tables; define authoritative isolation key for org/gym/branch; direct-vs-derived ownership and composite tenant-aware FK constraints; policy coverage + cross-tenant joins/foreign references/updates tests.  
**Blocker / caveat:** No production table inventory or member/membership ownership currently decided; default policy cannot be extrapolated from synthetic two-table schema.

**Human decision:** PENDING — confirmed owner must record **adopt / amend / defer-with-rationale / reject**, a responsible person, proof or allowed exclusion, and target review condition in Issue #2.

### G05 — Worker System Context and real provider callbacks

**Proposed disposition (not a human decision):** REQUIRE PROOF BEFORE RESPECTIVE LIVE PATH; DOCUMENT ADR REVIEW DEPENDENCY.  
**Proposed accountable role (no individual assigned):** Backend + Security + Integrations.  
**Dependencies:** Background jobs ADR-0015; authentication/provider signature choice.  
**Required verifiable evidence / test design:** Job envelope: tenant/resource/job type, authorized capability and idempotency, scheduler discovery separation; duplicate/retry/wrong-tenant jobs. Callback: real provider signature/replay/timestamp checks and canonical resource/tenant lookup before write; negative tests on staging after selection.  
**Blocker / caveat:** Synthetic post-verification adapter is not provider signature verification. If no callback/live worker path exists yet, record path as not deployed, not PASS.

**Human decision:** PENDING — confirmed owner must record **adopt / amend / defer-with-rationale / reject**, a responsible person, proof or allowed exclusion, and target review condition in Issue #2.

### G06 — SECURITY DEFINER, views, owner/service/admin bypass

**Proposed disposition (not a human decision):** DEFAULT PROHIBIT PRIVILEGED HELPERS; IF PRESENT REQUIRE SECURITY MATRIX BEFORE ACCEPTANCE.  
**Proposed accountable role (no individual assigned):** Data + Security + Platform.  
**Dependencies:** Final PG role/function/view inventory.  
**Required verifiable evidence / test design:** Catalog diff for runtime/worker/migration/owner, GRANT/default privileges, view invoker rights and `search_path`; if any SECURITY DEFINER function appears test malicious search_path shadowing, dynamic SQL, revoked EXECUTE, cross-tenant calls and impersonation.  
**Blocker / caveat:** Do not mark NOT APPLICABLE unless a catalog inventory proves no privileged helpers; owner/FORCE observations from synthetic suite do not cover future code.

**Human decision:** PENDING — confirmed owner must record **adopt / amend / defer-with-rationale / reject**, a responsible person, proof or allowed exclusion, and target review condition in Issue #2.

### G07 — Backup/restore, raw dumps, policy+role recovery

**Proposed disposition (not a human decision):** REQUIRE ISOLATED RLS RECOVERY PROOF BEFORE PRODUCTION RELEASE.  
**Proposed accountable role (no individual assigned):** Platform + Data + Security.  
**Dependencies:** Selected backup tooling, retention, region/jurisdiction decisions.  
**Required verifiable evidence / test design:** Disposable/staging backup of representative RLS-enabled schema; restore under restricted accounts; compare pg_roles, grants, policies, FORCE and row counts; demonstrate backup confidentiality, access logging and restricted storage; verify business-row isolation after restore.  
**Blocker / caveat:** Foundation PG backup PASS does not prove RLS policy recovery or raw dump protection.

**Human decision:** PENDING — confirmed owner must record **adopt / amend / defer-with-rationale / reject**, a responsible person, proof or allowed exclusion, and target review condition in Issue #2.

### G08 — Versioned policy template, drift and forward-fix/rollback

**Proposed disposition (not a human decision):** REQUIRE POLICY-AS-CODE AND DRIFT PROOF BEFORE DEPLOYMENT.  
**Proposed accountable role (no individual assigned):** Data + Platform + Security.  
**Dependencies:** ADR-0005 migration tooling; CI/release ADR-0017.  
**Required verifiable evidence / test design:** Commit canonical expected RLS policy/role grants in controlled migrations; bootstrap staging from zero; compare deployed pg_catalog to approved state; inject drift in disposable DB, detect and restore; forward-fix/backout after failed migration; fail CI on mismatch.  
**Blocker / caveat:** Synthetic run-local drift comparison not the same as committed-template vs deployed-policy drift.

**Human decision:** PENDING — confirmed owner must record **adopt / amend / defer-with-rationale / reject**, a responsible person, proof or allowed exclusion, and target review condition in Issue #2.

### G09 — Representative tenant-scale performance and query plans

**Proposed disposition (not a human decision):** REQUIRE MATCHED REPRESENTATIVE QUERY BENCHMARK BEFORE PRODUCTION.  
**Proposed accountable role (no individual assigned):** Data + Backend + Performance.  
**Dependencies:** Query API design, representative scale and indexes.  
**Required verifiable evidence / test design:** Choose synthetic distributions for big/small tenants and branch skews; baseline and RLS queries under comparable least-privileged role/plan settings with indexes, explain buffers/rows/latency percentiles; list/search/dashboard/payment/export workflows.  
**Blocker / caveat:** Small 3-row synthetic EXPLAIN is not production cost or SLO evidence; fix unacceptable plans before rollout.

**Human decision:** PENDING — confirmed owner must record **adopt / amend / defer-with-rationale / reject**, a responsible person, proof or allowed exclusion, and target review condition in Issue #2.

### G10 — Direct-client canonical database access

**Proposed disposition (not a human decision):** RETAIN PROHIBITION; NEW SEPARATE P0 DECISION IF EVER PROPOSED.  
**Proposed accountable role (no individual assigned):** Security + Architecture.  
**Dependencies:** ADR-0006/0009/0010 trust-boundary proposals.  
**Required verifiable evidence / test design:** Architecture tests/review show browser and member client use only trusted GymPulse runtime for canonical data. No client-side service key or unmanaged SQL access; future direct-client proposal must include token freshness, grants, member-self/tenant RLS and separate human decision.  
**Blocker / caveat:** This row is a proposed **architecture exclusion**, not approval of any direct DB access.

**Human decision:** PENDING — confirmed owner must record **adopt / amend / defer-with-rationale / reject**, a responsible person, proof or allowed exclusion, and target review condition in Issue #2.

### G11 — Jurisdiction/privacy/provider/deployment and identity/session dependencies

**Proposed disposition (not a human decision):** KEEP CANONICAL DECISIONS OPEN; REQUIRE OWNER ROUTING AND EVIDENCE BEFORE THEIR DEPENDENT RELEASE.  
**Proposed accountable role (no individual assigned):** Product + Legal/Privacy + Platform + Identity.  
**Dependencies:** D-SEC-001, D-SEC-004, D-ARCH-014, D-ARCH-004, D-SEC-002.  
**Required verifiable evidence / test design:** Document launch jurisdiction, residency/backup support access, retention/deletion, session revocation requirements and actual chosen providers; link approved decision outcomes rather than pretending ADR-0010 resolves them.  
**Blocker / caveat:** Security team must not turn technical RLS PASS into jurisdiction/provider/identity authorization.

**Human decision:** PENDING — confirmed owner must record **adopt / amend / defer-with-rationale / reject**, a responsible person, proof or allowed exclusion, and target review condition in Issue #2.

### G12 — Final human risk acceptance, independent review, ADR status

**Proposed disposition (not a human decision):** KEEP ADR PROPOSED AND D-SEC-008 OPEN; HUMAN DECISION LATER.  
**Proposed accountable role (no individual assigned):** Confirmed owner @im-tnyx; independent reviewer not appointed.  
**Dependencies:** Issue #2; ADR-0010 governance; assumptions register.  
**Required verifiable evidence / test design:** Human owner to confirm each G01–G12 row with evidence/waiver rationale and scope, reference independent review policy, then separately issue an explicit Accept/Reject/Revise decision with date, rationale and record. Only after that may canonical ADR/register be synchronized.  
**Blocker / caveat:** GitHub issue existence, request to proceed, synthetic 29/29 PASS and this draft plan are not formal ADR acceptance or production authorization.

**Human decision:** PENDING — confirmed owner must record **adopt / amend / defer-with-rationale / reject**, a responsible person, proof or allowed exclusion, and target review condition in Issue #2.


## 4. Executable-Quality Validation Backlog (Not Executed)

The following is an **ordered proposed future test backlog**, not authorization to run tests or alter infrastructure. Every execution task later requires a defined risk owner, isolated environment, data classification, and scope. A runner or managed provider cannot be assumed available.

| Candidate test pack | Gaps covered | Test cases to implement (synthetic unless separately authorized) | Evidence to retain | Prerequisite / trigger |
| --- | --- | --- | --- | --- |
| TP-01 — Server tenant-context authority and injection boundary | G01 / G10 | User-supplied tenant substitution; forged branch ID; unauthorized cross-tenant resource; missing Principal; structured SQL parameterization; hostile SQL fields; commit/rollback/retry context and explicit inability of same-role GUC to authenticate input | Redacted request+authorization decision trace, SQLSTATE, reasoned threat-model residual-risk note | Trusted runtime + approved tenant resolver design |
| TP-02 — Independent application authorization and BOLA | G02 / G04 | Capability wrong scope, disabled account, revoked assignment, Member Access Link mismatch, resource enumeration, staff financial/export denied, same-tenant unauthorized action; verify with *no RLS* and with RLS | Negative matrix by action/scope/actor, assertions and test runner output | ADR-0009 policy and real server module design |
| TP-03 — Tenant ownership and schema coverage | G04 / G06 | Org/gym/branch mixed ownership, derived-parent FK mismatch, cross-tenant key/existence leak, UPDATE ownership change, owner/FORCE policies, invoker views, privileged-function paths if any | Versioned schema inventory and pg_catalog role/constraint/policy diff | Draft reviewed schema and role/function inventory |
| TP-04 — Selected driver and managed pooler scope hygiene | G03 / G01 | Transaction vs session pool, same connection A→B, rolled-back retries, mixed worker/API sessions, unknown tenant, role bypass probes, credential separation | Pooler mode, client/driver version, PID/transaction traces, catalog role checks, cleanup | Actual chosen topology after D-ARCH-017/D-ARCH-014 approval |
| TP-05 — Real callback and worker principal | G05 / G02 | Bad signature, stale/replayed callback, duplicate event, mismatched resource tenant, wrong job tenant/capability, expired/revoked actor, poisoned discovery entry, callback after tenant move | Signed-request verdicts, idempotency audit, denied actions, System Context provenance | Real provider choice + approved bounded runner topology |
| TP-06 — Privileged SQL escalation (conditional) | G06 | Invoker/definer effective role checks; mutable search_path shadowing; unsafe EXECUTE grant; dynamic SQL; wrong-tenant definer call; owner/role and service-key misuse | Catalog snapshot, negative attack matrix, test account grants | Only if callable privileged functions/views are introduced |
| TP-07 — RLS-preserving backup and recovery | G07 | Restore synthetic RLS+policy+role schema; compare policies/grants/FORCE, non-bypass A/B CRUD after restoration; privilege/raw-dump confidentiality; unauthorized restore access | Redacted restore log, catalog diff, A/B assertions, RTO/RPO observation explicitly non-production | Approved staging/provider backup and encryption/access model |
| TP-08 — Policy-as-migration / external drift | G08 | Fresh migration, drift diff against committed expected state, unexpected ALTER POLICY, omitted FORCE, rollback/failure simulation, forward fix | Migration hash, expected/observed policy diff, drift-failure and remediation logs | Migration tool/CI approach accepted; isolated staging |
| TP-09 — Representative tenant and branch query performance | G09 | Big/small tenant skew, wrong-scope list/dashboard/export access; EXPLAIN (ANALYZE, BUFFERS), matched SQL and privileges, p50/p95/p99 latency; evaluate tenant indexes | Workload definition, row counts, plans, measured latency and SLO decision | Target load/SLO model and reviewed ownership/index strategy |
| TP-10 — Governance/documentation closeout | G10–G12 | Verify direct-client prohibited, privacy/session/provider dependencies linked, each gap has owner & decision, final human ADR approval record is separate | Issue #2 decision ledger, reviewed architecture diff, references, explicit signoff | Owner-approved row decisions and requested evidence; not executable as a substitute |

**Pass semantics:** a test pack is `NOT RUN` until a real runner and artifacts exist. The 2026-10-15 29/29 suite is already `PASS` **only for its exact synthetic scope**. This plan does not retroactively mark any production test or missing validation `PASS`.

## 5. Safe Sequence, Gate Separation, and Exit Criteria

1. **NOW / governance only:** the confirmed human owner reviews G01–G12 in Issue #2, adopts or changes each recommendation, names accountable humans, specifies which proof is acceptance-blocking vs later release-blocking, and supplies dates/conditions. **Do not infer consent from "go" to approve unreviewed risks**.
2. **After explicit bounded test authorization:** prepare controlled non-production threat model, final data ownership/policy catalog and independent authorization negative suite (G01/G02/G04/G06). Record real evidence before proposing acceptance.
3. **After separate provider/runtime/data-access decisions:** validate actual pooler/roles and bounded worker/provider behavior (G03/G05), plus versioned policy drift and backup safety (G07/G08). Do not create a managed provider solely to close this issue.
4. **After representative scale, SLO and privacy constraints are supplied:** evaluate plans/latency and deployment controls (G09/G10/G11). Test failing scenarios and root-cause corrections.
5. **Only with complete evidence and risk review:** human owner separately decides whether to Accept/Reject/Revise ADR-0010; document reviewer role, any residual waiver with scope/date/rationale, issue reference and downstream canonical sync. Production authorization remains an **independent later gate**, not automatic upon ADR acceptance.

### Acceptance-readiness exit checks

| Check | Current state |
| --- | --- |
| Authorized decision owner recorded | **YES — self-attested @im-tnyx, issuecomment 6214567976** |
| Every outstanding gap given an actual human disposition | **NO — 0/12 adopted** |
| Production authorization/module tests complete | **NO — synthetic independent adapter only** |
| Tenant-context threat boundary independently addressed | **NO — GUC arbitrary SQL risk unresolved** |
| Final tenancy schema, provider/pooler and privileged path reviewed | **NO — decisions still open** |
| Performance, recovery, drift and real callbacks proved where applicable | **NO — not run for final topology** |
| Independent reviewer appointed if required | **NO — not appointed** |
| Explicit ADR-0010 approval recorded and canonical register synced | **NO — Proposed / OPEN** |
| Production implementation authorization granted | **NO — CLOSED** |

**Issue #2 remains OPEN** until its required human row decisions are on record; suggested dispositions do not close the issue, and no component under this packet becomes a deployed production policy.

## 6. Minimal Human-Owner Action Requested in GitHub Issue #2

The confirmed owner can record one **single explicit** review comment covering all gaps, rather than twelve separate interactions. The following is a **template to inspect, edit and personally post**, not evidence of an executed decision:

```text
D-SEC-008 EVIDENCE-GAP DISPOSITION REVIEW
Owner: @im-tnyx (my prior owner confirmation stands)
Date: [actual date]
I personally reviewed G01–G12 in
docs/adr/adr-0010-security-evidence-gap-triage-plan.md

My dispositions by ID:
G01: [adopt/modify + acceptance gate + owner]
G02: [adopt/modify + acceptance gate + owner]
G03: [adopt/modify + selected-topology requirement + owner]
G04: [adopt/modify + data-ownership gate + owner]
G05: [adopt/modify + callback/worker applicability + owner]
G06: [adopt/modify + definer-function applicability + owner]
G07: [adopt/modify + backup/restore release gate + owner]
G08: [adopt/modify + policy drift gate + owner]
G09: [adopt/modify + representative benchmark gate + owner]
G10: [adopt/modify + direct-client prohibition/conditional gate]
G11: [adopt/modify + external owner(s)/dependency]
G12: [adopt/modify + formal approval still pending]

Unaccepted risk/exception rationale and review condition: [...]
Independent security reviewer: [not appointed / nominated]
ADR-0010 final decision: NOT APPROVED; remains Proposed
D-SEC-008: OPEN
Production implementation: NOT AUTHORIZED
One next bounded action: [proposed]
```

An owner may reject a suggestion, require more tests, or direct a revised review without accepting the ADR. The assistant should then update the issue's triage ledger based **only on the owner's actual response**.

## 7. Provenance and Related Decisions

- [Issue #2](https://github.com/im-tnyx/gym-pulse/issues/2) and [direct owner confirmation](https://github.com/im-tnyx/gym-pulse/issues/2#issuecomment-6214567976)
- [ADR-0010](ADR-0010-data-layer-tenant-isolation-rls.md) / `D-SEC-008 = OPEN`
- [ADR-0010 RLS evidence and owner review packet](adr-0010-rls-evidence-decision-owner-review-packet.md)
- [Synthetic RLS execution evidence](../../validation/security/rls/EVIDENCE.md)
- [ADR-0009 / D-ARCH-015 authorization](ADR-0009-authorization-implementation.md)
- [ADR-0005 / D-ARCH-017 SQL/migrations](ADR-0005-data-access-migration-strategy.md)
- [ADR-0006 / D-ARCH-014 managed backend](ADR-0006-managed-backend-responsibilities.md)
- [ADR-0007 / D-ARCH-004 identity/session](ADR-0007-authentication-session-architecture.md)
- [ADR-0008 / D-SEC-002 member verification](ADR-0008-member-authentication-method.md)
- [ADR-0026 / D-DATA-007 membership lifecycle](ADR-0026-member-membership-state-ownership.md)
- [Canonical decision register](../00-overview/assumptions.md)
