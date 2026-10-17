# GymPulse: Interim Manual Pull Request Review (Proposal)

## Record and authority

| Field | Value |
| --- | --- |
| Maturity | **PROPOSED / MANUAL-ONLY / UNENFORCED** |
| Scope | Documentation and change-control process for the current GitHub Free, private repository |
| Tracking | [Issue #15](https://github.com/im-tnyx/gym-pulse/issues/15), parent [Issue #10](https://github.com/im-tnyx/gym-pulse/issues/10) |
| Baseline | `main` at `0160030f364eba68336235ed8f598e365ab501f6` (audit snapshot, not a permanent head) |
| Status | **Not adopted. No GitHub protection/required checks enabled. No production authorization.** |

This is a **review candidate**, not an Accepted ADR, mandatory repository rule, technical enforcement, approval of residual risk, or permission to merge. An authorized owner must **separately** adopt or decline the process, and must **separately** authorize each future PR merge. This document has no authority to change [canonical decision status](../00-overview/assumptions.md).

## 1. Evidence and remaining risks

On 2026-10-17, the repository owner provided GitHub UI screenshots showing a **GitHub Free** personal subscription, an empty Rulesets screen warning that rulesets will not be enforced on the private repository, and **no configured classic branch protection**. The screenshots were not added to GitHub because an unredacted billing image must not be published as evidence. [Issue #10](https://github.com/im-tnyx/gym-pulse/issues/10) records their provenance and the need for a redacted owner attestation if durable evidence is required.

The repository stays **private** and on **GitHub Free** for this proposal. GitHub has not been shown to enforce required PRs, independent reviews, checks, restrictions on direct pushes, force pushes or branch deletion for this repository. A voluntary rule is **not equivalent** to branch protection; anyone with sufficient GitHub access may still be able to bypass this procedure. Treat bypass risk and lack of independent reviewer availability as **unaccepted residual risks**, not findings of an exploit.

This interim procedure **cannot establish** production readiness or replace enforceable controls. Re-evaluate available controls when the plan, ownership, collaborators or rules change. [PR #14](https://github.com/im-tnyx/gym-pulse/pull/14) is a related unmerged audit proposal, not an active rule. [Issue #16](https://github.com/im-tnyx/gym-pulse/issues/16) is a separate planning task for read-only PR documentation CI, not an installed or required check.

## 2. Sources and precedence

Follow [root agent guidance](../../AGENTS.md), [canonical documentation precedence](../README.md), the [decision register](../00-overview/assumptions.md), and [ADR governance](../adr/README.md). These sources outrank this proposal. Historical flat docs or noncanonical `.ai/` snapshots do not authorize implementation or status changes.

Foundation ADR-0001–0004 remain **Accepted**. [ADR-0017](../adr/ADR-0017-ci-cd-release-secrets.md) and [ADR-0018](../adr/ADR-0018-testing-toolchain.md) remain **Proposed**; `D-ARCH-019 = OPEN` and `D-ARCH-018 = PROPOSED`. [ADR-0010](../adr/ADR-0010-data-layer-tenant-isolation-rls.md) remains **Proposed**, `D-SEC-008 = OPEN`. None is approved through a checklist, passing test, owner instruction to "go", PR merge, or this document.

## 3. Proposed bounded change sequence (human-operated)

### A. Before the branch

1. Identify the issue, explicit task authorization, expected paths, dependencies, risks, owner and acceptance criteria. Distinguish an approved **documentation task** from architecture, production or risk approvals.
2. Record the **current** `main` SHA, relevant open PRs and applicable ADR/decision statuses. Inspect source truth rather than trusting cached AI notes.
3. Prefer one branch and one minimal change per issue, based on fresh `main`. Do not work directly on `main`, force-push, delete shared branches or bypass review as routine practice. **These are voluntary actions, not enforced restrictions.**
4. Confirm a suitably independent reviewer **before relying on one**. If none is available, mark `INDEPENDENT REVIEW UNAVAILABLE`, record the risk, and **escalate to an authorized owner**. Neither self-review nor a bot `COMMENTED` review may be described as independent approval.

### B. Author prepares the PR

1. Link the issue and include purpose, exact changed paths, impact/threat considerations, dependency and ADR status, rollback outline and one bounded next action.
2. Review the complete diff for unintended files, generated content, untracked artifacts, secrets, credentials, private/member/payment data, logs and unsafe links. Use synthetic/redacted material; **never** copy an unredacted billing screenshot or real production records into a PR.
3. Record base/head SHAs, `ahead/behind`, changed file count, additions/deletions, conflicts/mergeability and the exact files reviewed. Recheck after every head/base update.
4. For available local verification, attempt `git diff --check`, relevant Markdown relative-link checks, syntax checks and scoped tests. Record **real command, exact result and SHA**. Mark any check **NOT RUN** with reason; do not equate GitHub mergeability, an empty checks list, or a bot summary with `CI PASS`.
5. Submit the PR for human review. Do not enable auto-merge. Do not rewrite audit/failed-test evidence to look green.

### C. Human review and decision

1. An independent human reviewer, **when available**, checks the exact latest diff and commit, sources/ADR status, security boundaries, path scope, links, changes to checks, and executed or missing test evidence; request revisions for gaps.
2. A GitHub `APPROVED` review from a **different authorized human** is useful evidence, but on this Free/private repository it is **not guaranteed enforced**. `COMMENTED` by the author/agent, self-review, or Codex review is **not** independent approval.
3. Reviewer records a scoped disposition: `APPROVE FOR HUMAN MERGE CONSIDERATION`, `REQUEST CHANGES`, or `DEFER/BLOCK`. A technical review note is not a formal architecture/security decision.
4. Reconfirm latest `main`, PR head, mergeability/conflicts, review state, CI status and risk changes **immediately before any proposed merge**. If head changes after review, repeat relevant verification and request renewed approval where needed.
5. Obtain **explicit per-PR merge authorization** from the authorized human owner **after** review; a general `go` for drafting/auditing is not merge approval. Do not merge merely because GitHub permits it. Preserve issue/PR references and decision evidence.

### D. If no independent reviewer or CI gate exists

Document `HUMAN REVIEW GAP` / `AUTOMATED GATE NOT ENFORCED` and the precise risks and scope. Seek a separate owner disposition and a suitably independent reviewer; **do not fabricate a two-person review** or claim that manual policy blocks direct pushes. A residual-risk acknowledgement, if later authorized, must be explicit, scoped, dated and linked; this proposal grants none.

## 4. Escalation and stop conditions

**Stop; do not proceed under this documentation-only procedure** if the change selects unresolved providers/frameworks/CI tooling, weakens tenant isolation or authorization, changes auth/session/RLS/payment flows, access privileges, protected secrets, production infrastructure, deployment permissions, destructive migrations, real data, security risk acceptance or ADR statuses. Refer changes to separately authorized owners and the existing ADR/security/release gates. A passing synthetic RLS run never proves production-safe access.

If unexpected secrets or personal data appear in a diff, pause publication and follow appropriate credential-rotation/privacy response with an authorized owner; do not treat deletion in a later commit as erasure of an exposed secret. Never use force-push/history rewriting to quietly conceal an incident.

## 5. Proposed review record (copy per PR)

~~~text
Issue / PR:
Task scope and explicit authorization:
Base branch and latest base SHA:
PR branch and latest head SHA:
Files changed / lines added / deleted:
Ahead/behind and mergeability/conflicts:
Canonical sources and ADR statuses checked:
Threat/tenant/privacy/financial impact:
Tests/checks (command + SHA + PASS/FAIL/NOT RUN + reason):
Secrets/PII exposure check and scope:
Author/technical review evidence (not an independent approval):
Independent reviewer identity / APPROVED evidence / unavailable:
Known unenforced protections and residual risks:
Human owner disposition / reference / effective date:
Per-PR merge authorization (separate, or NONE):
Rollback/revert plan and owner:
One next bounded action:
~~~

Use this record as a **proposal template** only. An empty field cannot imply an approval.

## 6. Post-merge traceability and recovery (only after separate authorization)

If a PR is later authorized and merged, retain source/head/merge SHAs, reviewer and test records, and update issue/task status honestly. Use a normal reviewable `git revert` PR for a bad merge where appropriate; do not assume a revert repairs exposed credentials, leaked data, external effects or migrations. Production changes require their own incident/rollback plan and permission.

## 7. Review criteria and next bounded action

- [ ] Authorized human assesses whether this proposed **manual-only** practice is appropriate, including who can independently review.
- [ ] Human records whether residual unprotected-`main` risk is tolerable **for this limited documentation phase**, without calling the decision ADR/security approval or equating manual steps with technical protection.
- [ ] Separate [Issue #16](https://github.com/im-tnyx/gym-pulse/issues/16) may prepare a scoped CI pilot plan; workflow implementation or required-check enablement needs its own approval and actual positive/negative evidence.
- [ ] [Issue #10](https://github.com/im-tnyx/gym-pulse/issues/10) stays **OPEN** until its independent exit criteria are satisfied.
- [ ] No repository settings, visibility, protections, workflows, secrets, ADRs, production gates or PR merge are modified by this document.

**Next action:** Review this proposal on its own PR; record human feedback and a decision on whether to adopt the manual-only procedure. **No auto-merge.**
