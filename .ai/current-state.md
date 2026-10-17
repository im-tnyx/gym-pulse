# GymPulse — Current Working State

> **AI session handoff — noncanonical.** This is a short navigation snapshot, **not** the authority for product, architecture, security or production decisions. Verify live GitHub and canonical docs before acting. Full pre-cleanup working history is preserved **byte-for-byte** in [the dated archive](archive/current-state-pre-cleanup-2026-10-17.md); see [archive policy](archive/README.md).

## 1. Baseline and documentation phase

- **Prepared:** 2026-10-17; Issue [#5](https://github.com/im-tnyx/gym-pulse/issues/5). This is a proposed docs-only cleanup on a separate review branch, not a merged `main` change.
- **Audited `main` source:** `d41bbca92dbc49d1f40f987391ddb527a3f32bee`.
- **Phase:** Architecture Foundation Gate / Docs-as-Code governance; no application/production implementation authorization. The structured product and C4/system architecture **drafts exist**; complete production/provider and security acceptance is not established.
- **Canonical sources:** [docs precedence](../docs/README.md), [decision register](../docs/00-overview/assumptions.md), [ADR index and acceptance policy](../docs/adr/README.md), [architecture principles](../docs/02-architecture/architecture-principles.md), [AI continuity contract](README.md). Legacy flat documents, old branches and `.ai/` notes are not approval evidence.
- **Bounded agent tasks:** [task index](task/), especially [Task 0034, Member/Membership state ownership ADR proposal](task/0034-resolve-member-membership-state-ownership-adr.md). Do not interpret historical completed-task files as a current work order; consult live issues below.

## 2. Actual decisions and test evidence

| Topic | Verified current state and canonical proof |
| --- | --- |
| Foundation architecture | **ADR-0001..0004 Accepted**: modular monolith (`D-ARCH-005`), strict TypeScript / Node LTS (`D-ARCH-016`), monorepo (`D-ARCH-001`), PostgreSQL category (`D-ARCH-002`); authorized approval [Issue #1](https://github.com/im-tnyx/gym-pulse/issues/1) |
| Other architecture/provider/identity topics | **OPEN or PROPOSED as recorded in register**; ADR-0005 onward do **not** inherit Foundation approval. Especially `D-ARCH-004` Auth/Sessions OPEN, `D-ARCH-015` App Authorization PROPOSED, `D-ARCH-014` managed backend OPEN, `D-ARCH-017` data access PROPOSED, `D-DATA-007` Member/Membership ownership unresolved |
| RLS architecture | [ADR-0010](../docs/adr/ADR-0010-data-layer-tenant-isolation-rls.md) = **Proposed**; canonical `D-SEC-008 = OPEN`; application capability/tenant/Member-self authorization remains separately required |
| Human security owner | `@im-tnyx` personally self-confirmed D-SEC-008 ownership and governance authority in [direct GitHub comment](https://github.com/im-tnyx/gym-pulse/issues/2#issuecomment-6214567976). **Independent security reviewer not appointed; no ADR acceptance** |
| Bounded PostgreSQL validation | [29/29 synthetic RLS PASS, cleanup PASS](../validation/security/rls/EVIDENCE.md) at [Actions run #38773398231](https://github.com/im-tnyx/gym-pulse/actions/runs/38773398231). **Not** production, real app authorization, pooler, restore or performance proof |
| Residual security review | [Issue #2](https://github.com/im-tnyx/gym-pulse/issues/2) = **OPEN**; human row decisions **0/12**. The [G01–G12 triage + TP-01–TP-10 test proposals](../docs/adr/adr-0010-security-evidence-gap-triage-plan.md) are prepared but **not executed/approved** |
| Production implementation | **CLOSED** until separate documented approvals. PostgreSQL custom tenant GUC under one SQL role is **not independently trusted tenant identity** |

**Do not** upgrade Proposed/OPEN decisions, mark risk accepted, or infer production authorization from owner appointment, test success, PR merge or a user saying `go`.

## 3. Git branch / PR audit and active documentation work

- Three earlier branches' **Git history is merged**: `docs/phase-2-architecture`, `validation/postgres-foundation-20260929`, `validation/rls-isolation-20261015`. All had **0 unmerged commits** after reconciliation; branch references may remain visible. Audit: [branch history reconciliation](../docs/adr/branch-history-reconciliation-2026-10-16.md); merged PRs [#7](https://github.com/im-tnyx/gym-pulse/pull/7) and [#8](https://github.com/im-tnyx/gym-pulse/pull/8). Do not revive historical ADR numbering.
- [Issue #3](https://github.com/im-tnyx/gym-pulse/issues/3) / [PR #9](https://github.com/im-tnyx/gym-pulse/pull/9): root `AGENTS.md` is **on review branch only**; technical `COMMENT` review recorded, **no independent human approval or merge**.
- [Issue #4](https://github.com/im-tnyx/gym-pulse/issues/4) / [PR #11](https://github.com/im-tnyx/gym-pulse/pull/11): `DESIGN.md` + design-system **Draft/Proposed** docs are **on review branch only**; source precedence correction made; technical `COMMENT` review, **no independent human approval or merge**.
- [Issue #5](https://github.com/im-tnyx/gym-pulse/issues/5): **this cleanup** on `docs/ai-current-state-cleanup-issue-5` awaiting review. The earlier 102 KB / 3,606-line working-state content is preserved unmodified in `.ai/archive/`; this landing page is intentionally short.
- [Issue #6](https://github.com/im-tnyx/gym-pulse/issues/6): Copilot thin instructions **pending** the review/merge of canonical `AGENTS.md`; do not reference a file not yet on `main` as though it is accepted.
- [Issue #10](https://github.com/im-tnyx/gym-pulse/issues/10): **OPEN** for branch protection/CI enforcement audit. Observed `main.protected=false` and **0 general PR check runs**; rulesets/branch-protection details have account-plan or connector access limitations. Do not treat `mergeable_state=clean` as tests passing.

## 4. Stable security and product invariants

Authenticated identity is separate from **server-side capability and verified tenant/gym/branch/resource/Member-self authorization**. UI filters, client tenant IDs and raw phone numbers are not authority. Data access must preserve tenant isolation. Sensitive writes capture actors/reasons; payment effects require verified provider truth and idempotent handling; attendance and membership entitlement are authoritative on the trusted server. No raw credentials, real member data or unredacted payment material in examples/artifacts. The exact providers, auth/session policies, final RLS implementation and UI frameworks remain governed by their **own** unresolved decisions.

## 5. Exact next bounded action

**Human review of [PR #9](https://github.com/im-tnyx/gym-pulse/pull/9) against [Issue #3](https://github.com/im-tnyx/gym-pulse/issues/3)** is the first dependency for contributor-tooling consistency; independently verify the technical checks and record an explicit merge/revision decision. Until then keep PRs #9/#11 and Issue #5's cleanup PR under review, and do not start Issue #6 as if `AGENTS.md` is live on `main`. Separately, D-SEC-008 owner `@im-tnyx` must personally disposition G01–G12 in Issue #2 before formal ADR consideration.

After each approved bounded task, update this file **only with a concise current summary and links**, not a new large chronological transcript.
