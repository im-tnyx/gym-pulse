# GymPulse — Current Working State

> **AI session handoff — noncanonical.** This is a short navigation snapshot, **not** the authority for product, architecture, security or production decisions. Verify live GitHub and canonical docs before acting. Full pre-cleanup working history is preserved **byte-for-byte** in [the dated archive](archive/current-state-pre-cleanup-2026-10-17.md); see [archive policy](archive/README.md).

## 1. Baseline and documentation phase

- **Live status audit:** 2026-10-17 for [Issue #22](https://github.com/im-tnyx/gym-pulse/issues/22), P0 context reconciliation. The earlier [Issue #5](https://github.com/im-tnyx/gym-pulse/issues/5) cleanup is **closed/completed** and its compact handoff is already on `main`. This snapshot is noncanonical and must be rechecked before work.
- **Audited `main` HEAD (2026-10-17):** `7c73ee19e0605d0c2bbace33ea3a2d09dfb55dd2`. This SHA is a point-in-time reference, not a substitute for checking the current HEAD.
- **Phase:** Architecture Foundation Gate / Docs-as-Code governance; no application/production implementation authorization. The structured product and C4/system architecture **drafts exist**; complete production/provider and security acceptance is not established.
- **Canonical sources:** [docs precedence](../docs/README.md), [decision register](../docs/00-overview/assumptions.md), [ADR index and acceptance policy](../docs/adr/README.md), [architecture principles](../docs/02-architecture/architecture-principles.md), [AI continuity contract](README.md). Legacy flat documents, old branches and `.ai/` notes are not approval evidence.
- **Bounded agent tasks:** [task index](task/), especially [Task 0034, Member/Membership state ownership ADR proposal](task/0034-resolve-member-membership-state-ownership-adr.md). Do not interpret historical completed-task files as a current work order; consult live issues below.

## 2. Decision and test evidence at audited snapshot

The statuses and open-item counts below are **observations as of 2026-10-17**, not permanently current facts. Recheck each linked canonical decision/ADR, GitHub issue and test run before acting; newer evidence can supersede this handoff, but never silently approve a previously unapproved decision.

| Topic | Evidence at audit date (recheck live canonical source) |
| --- | --- |
| Foundation architecture | **ADR-0001..0004 Accepted**: modular monolith (`D-ARCH-005`), strict TypeScript / Node LTS (`D-ARCH-016`), monorepo (`D-ARCH-001`), PostgreSQL category (`D-ARCH-002`); authorized approval [Issue #1](https://github.com/im-tnyx/gym-pulse/issues/1) |
| Other architecture/provider/identity topics | **OPEN or PROPOSED as recorded in register**; ADR-0005 onward do **not** inherit Foundation approval. Especially `D-ARCH-004` Auth/Sessions OPEN, `D-ARCH-015` App Authorization PROPOSED, `D-ARCH-014` managed backend OPEN, `D-ARCH-017` data access PROPOSED, `D-DATA-007` Member/Membership ownership unresolved |
| RLS architecture | [ADR-0010](../docs/adr/ADR-0010-data-layer-tenant-isolation-rls.md) = **Proposed**; canonical `D-SEC-008 = OPEN`; application capability/tenant/Member-self authorization remains separately required |
| Human security owner | `@im-tnyx` personally self-confirmed D-SEC-008 ownership and governance authority in [direct GitHub comment](https://github.com/im-tnyx/gym-pulse/issues/2#issuecomment-6214567976). **Independent security reviewer not appointed; no ADR acceptance** |
| Bounded PostgreSQL validation | [29/29 synthetic RLS PASS, cleanup PASS](../validation/security/rls/EVIDENCE.md) at [Actions run #38773398231](https://github.com/im-tnyx/gym-pulse/actions/runs/38773398231). **Not** production, real app authorization, pooler, restore or performance proof |
| Residual security review | As of **2026-10-17**, [Issue #2](https://github.com/im-tnyx/gym-pulse/issues/2) was **OPEN** and human row dispositions were **0/12**. The [G01–G12 triage + TP-01–TP-10 test proposals](../docs/adr/adr-0010-security-evidence-gap-triage-plan.md) had been prepared but **not executed or accepted**. Recheck the live issue before using those counts or conclusions |
| Production implementation | **CLOSED** until separate documented approvals. PostgreSQL custom tenant GUC under one SQL role is **not independently trusted tenant identity** |

**Do not** upgrade Proposed/OPEN decisions, mark risk accepted, or infer production authorization from owner appointment, test success, PR merge or a user saying `go`.

## 3. Git branch / PR audit and active documentation work

- Three earlier branches' **Git history was merged at the historical 2026-10-16 audit**: `docs/phase-2-architecture`, `validation/postgres-foundation-20260929`, `validation/rls-isolation-20261015`. They had **0 unmerged commits at that audit**; branch references may remain visible. Audit: [branch history reconciliation](../docs/adr/branch-history-reconciliation-2026-10-16.md); merged PRs [#7](https://github.com/im-tnyx/gym-pulse/pull/7) and [#8](https://github.com/im-tnyx/gym-pulse/pull/8). Do not revive historical ADR numbering.
- [Issue #3](https://github.com/im-tnyx/gym-pulse/issues/3) is **CLOSED/completed**; [PR #9](https://github.com/im-tnyx/gym-pulse/pull/9) is **MERGED**. Root `AGENTS.md` exists on `main`. A merge does not accept unrelated Proposed ADRs or grant production permission.
- [Issue #4](https://github.com/im-tnyx/gym-pulse/issues/4) is **CLOSED/completed**; [PR #11](https://github.com/im-tnyx/gym-pulse/pull/11) is **MERGED**. `DESIGN.md` and the design-system **Draft/Proposed** docs are on `main`; merging a design proposal does **not** approve palette, framework or other open design decisions.
- [Issue #5](https://github.com/im-tnyx/gym-pulse/issues/5) is **CLOSED/completed**. Its compact `.ai/current-state.md` landed on `main`; the earlier working-state content remains in [the dated archive](archive/current-state-pre-cleanup-2026-10-17.md). Do not resurrect its historical "awaiting review" wording.
- [Issue #6](https://github.com/im-tnyx/gym-pulse/issues/6) remains **OPEN**, but [`.github/copilot-instructions.md`](../.github/copilot-instructions.md) already exists on `main`. Reconcile current deliverables/status in Issue #6 before treating that task as finished; root `AGENTS.md` is already merged.
- [Issue #22](https://github.com/im-tnyx/gym-pulse/issues/22) is the live work tracker for staged agent-documentation reviews: [P0 PR #23](https://github.com/im-tnyx/gym-pulse/pull/23), [P1 PR #24](https://github.com/im-tnyx/gym-pulse/pull/24) and [P2 PR #25](https://github.com/im-tnyx/gym-pulse/pull/25). These are **review references, not frozen status claims**; verify each current PR state, head SHA and review findings before any action. No PR in this series grants ADR or production approval.
- [Issue #10](https://github.com/im-tnyx/gym-pulse/issues/10) remains **OPEN** for branch protection/CI enforcement. The current branch lookup reported `main.protected=false`; the visible committed workflow is a scoped RLS validation workflow, not general PR CI. Historical check-run observations are not current check results. Review enforcement/plan limitations separately through [#10](https://github.com/im-tnyx/gym-pulse/issues/10), [#15](https://github.com/im-tnyx/gym-pulse/issues/15), [#16](https://github.com/im-tnyx/gym-pulse/issues/16) and [#19](https://github.com/im-tnyx/gym-pulse/issues/19); never interpret an absent check as PASS.

## 4. Stable security and product invariants

Authenticated identity is separate from **server-side capability and verified tenant/gym/branch/resource/Member-self authorization**. UI filters, client tenant IDs and raw phone numbers are not authority. Data access must preserve tenant isolation. Sensitive writes capture actors/reasons; payment effects require verified provider truth and idempotent handling; attendance and membership entitlement are authoritative on the trusted server. No raw credentials, real member data or unredacted payment material in examples/artifacts. The exact providers, auth/session policies, final RLS implementation and UI frameworks remain governed by their **own** unresolved decisions.

## 5. Exact next bounded action

**Next bounded action:** inspect live [Issue #22](https://github.com/im-tnyx/gym-pulse/issues/22) and its P0 → P1 → P2 review queue, then address the **first still-actionable PR's** recorded findings and request its authorized human review/merge disposition. Recheck current `main`, exact PR head, actual validations and open blockers at that point; never infer merge authorization from a passing check or agent review. After any merge, derive the next action from live issues rather than this historical snapshot. [Issue #6](https://github.com/im-tnyx/gym-pulse/issues/6) and [Issue #2](https://github.com/im-tnyx/gym-pulse/issues/2) require separate governance.

After each approved bounded task, update this file **only with a concise current summary and links**, not a new large chronological transcript.
