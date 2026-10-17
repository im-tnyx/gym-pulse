# GymPulse — Main Branch Protection and PR CI Readiness Audit

## Record Control

| Field | Value |
| --- | --- |
| Date | 2026-10-17 |
| Issue | [#10 — Repository governance / delivery gate](https://github.com/im-tnyx/gym-pulse/issues/10) |
| Record maturity | **DRAFT / TECHNICAL RECOMMENDATION — NOT APPROVED POLICY** |
| Audited branch | `main` at `0160030f364eba68336235ed8f598e365ab501f6` |
| Repo posture | **Private**; default branch `main`; owner login `im-tnyx` |
| Canonical dependencies | [ADR-0017](../adr/ADR-0017-ci-cd-release-secrets.md) = Proposed / `D-ARCH-019 OPEN`; [decision register](../00-overview/assumptions.md) |
| Release/security impact | **NO CONFIGURATION APPLIED**; no CI runs, production changes, secrets, branch rules or ADR acceptance |
| Requested next decision | Human repository admin verifies GitHub plan/control eligibility and selects an enforceable change-control baseline; separately authorizes a **non-production** validation PR if warranted |

## 1. Executive Finding

GitHub branch metadata directly reports `main.protected=false`, `protection.enabled=false`, and **no required status checks** on the audited `main`. Its merge commit has **0 GitHub Check Runs and 0 commit statuses**. The only committed GitHub Actions workflow, [`rls-isolation-validation.yml`](../../.github/workflows/rls-isolation-validation.yml), is triggered by `validation/rls-*` branch pushes affecting the validation paths, or by manual dispatch; it does **not** validate ordinary documentation/application PRs targeting `main`.

These are **verified repository change-control gaps**, not evidence that secrets were exposed or that a particular exploit occurred. The absence of a GitHub check is **not** proof no separate local tests were executed; it means GitHub lacks a recorded check for the cited commit.

At audit time there are **no general PR CI workflows** in the live tree. The historical GitHub Actions results are restricted to foundation PostgreSQL and synthetic RLS proof branches. The 29/29 PostgreSQL RLS synthetic PASS / cleanup PASS is **not production test coverage or an enforceable current PR gate**.

## 2. Evidence and Uncertainty Ledger

| Control / artifact | Verified evidence | Status |
| --- | --- | --- |
| Private repository | GitHub repo GET: `visibility=private`, `default_branch=main` | CONFIRMED |
| `main` branch protection | GitHub branch GET: `protected=false`, `protection.enabled=false` | **NOT ENABLED** |
| Required checks | GitHub branch GET: `required_status_checks.contexts=[]`; `checks=[]` | **NONE** |
| CI checks for audited main | GitHub Check Runs for `0160030f...` `total_count=0`; commit statuses `[]` | **NO CHECK EVIDENCE** |
| Existing workflow | [Isolated RLS test YAML](../../.github/workflows/rls-isolation-validation.yml) only `validation/rls-*` paths or `workflow_dispatch` | BOUNDED, NOT GENERAL PR CI |
| Historical suite | [RLS evidence](../../validation/security/rls/EVIDENCE.md); [successful isolated run](https://github.com/im-tnyx/gym-pulse/actions/runs/38773398231) | 29/29 synthetic PASS at a different SHA |
| Rulesets availability | GitHub Rulesets GET returned HTTP **403** and message suggesting Pro or public-repository eligibility | **UNAVAILABLE TO THIS API CALL** — do not infer exact paid plan from message alone |
| Detailed branch protection read | GitHub branch protection GET returned HTTP **403**, `Resource not accessible by integration` | **NOT DIRECTLY AUDITABLE** through connected integration |
| Actual account subscription and admin UI eligibility | Not exposed by connected tools | **HUMAN ADMIN VERIFICATION REQUIRED** |
| PR reviewer independence / required checks | No enforced main protections observable; previous doc PRs had assistant-authored `COMMENTED` reviews, not independent `APPROVED` reviews | **NOT PROVEN ENFORCED** |
| Automated test / CI product decision | [Register](../00-overview/assumptions.md) `D-ARCH-018 PROPOSED`; `D-ARCH-019 OPEN` | **NOT ACCEPTED** |

GitHub's current public documentation describes protected branches for public repositories on Free and for private repositories on eligible paid plans. Rulesets have similar private-repo plan requirements. This does **not** establish the user's actual plan; inspect settings before deciding or purchasing anything:

- [GitHub Docs — Managing protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
- [GitHub Docs — Creating rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository)
- [GitHub Docs — Troubleshooting required checks](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks)

**Do not make the private repository public simply to obtain free protection.** That action exposes non-public code and project records; it is out of scope and must never be an implicit workaround.

## 3. Proposed Target Control Baseline (NOT Configured)

Minimum controls to evaluate, in order of risk:

| Control | Proposed direction | Verifiable acceptance criteria |
| --- | --- | --- |
| Protected `main` | Require pull request before merge; prevent force pushes and deletion; minimize bypasses | An authorized admin can show the live rule, affected branch and exact bypass list; protected setting true |
| Review authority | Require **one independent human review** where collaboration/plan supports it; ensure creator/connected assistant is not counted as independent reviewer | Test same-author review rejection and separate-human `APPROVED` review; document limitations |
| Automated PR check | One stable, uniquely named **read-only docs lint** status for **every** PR targeting `main`, without path filters when later required | Green valid sample, red intentionally invalid sample, real run link and matching SHA |
| Status check enforcement | Add required-check rule **only after** an actual named check exists and a non-production test has passed | Verified allowed/blocked PR behavior, rule screenshot/export, no accidentally stuck branch |
| Repository token permissions | Least privilege; no workflow write scopes, repository/environment secrets or `pull_request_target` for untrusted PR lint | Workflow permissions `contents: read`; no privileged deployment or secrets injected |
| Change provenance | PR links issue, risk, exact executed tests, changed files; retain declined checks as `NOT RUN` | Reviewable PR template / actual evidence, not inferred from commit title |
| Exception / plan fallback | If protection cannot be enforced, require explicit process-only two-person review policy as an **interim human procedure**, record unenforceable residual risk | Named human owner, link to actual review comments/records, review date, plan reassessment; do **not** label procedural policy equivalent to technical enforcement |

A protected branch or selected CI runner is not itself a production release authorization. Future deployment, migration and secrets gates remain governed under `D-ARCH-019` and the separate system/security decisions.

## 4. Proposed Low-Risk PR-Only Validation Candidate — NOT Executed

**Scope boundary:** a future **non-production** pull-request workflow that validates repository documentation independently of framework/runtime/provider selections. It must not deploy, migrate, access tenant data, infer production security, or execute untrusted PR-provided scripts with elevated privileges.

### Suggested initial checks

1. `git diff --check` for source changes against the PR's approved target, with correct fetch history. This detects selected whitespace errors and merge markers; it does **not** replace a secret scanner.
2. Verify repository-relative Markdown links and path case for current changed documents, including their base directory, while ignoring explicit external URLs, anchors and fenced code; avoid false positives for historical archives. Adopt/implement a checker only in a separately reviewed test task.
3. Validate checked-in workflow YAML syntax, permission scope and stable job name. This is a design checklist, **not a claim an executable lint command or test framework already exists**.
4. Run **no** RLS/PostgreSQL suite by default for every docs-only PR; retain the isolated RLS validation history as bounded evidence unless a separate approved risk/test plan changes scope.

**Candidate trigger/security contract (illustration, not a live workflow):**

```yaml
# NOT INSTALLED — draft only; exact actions SHA pins / runner policy not selected.
name: GymPulse PR Documentation Gate
on:
  pull_request:
    branches: [main]
permissions:
  contents: read
jobs:
  docs-integrity:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      # Proposed: review and pin checkout action commit before adoption.
      # Proposed: fetch the PR's base and head safely.
      # Proposed: diff whitespace + Markdown relative-link validation.
      # Must not use secrets, deploy, migrate, publish or run privileged PR code.
```

**Selection/implementation remains gated:** the real workflow, GitHub Action versions/pins and potential script are subject to a reviewed, non-production PR and an explicit owner decision that it is only a limited docs-integrity check. This document does not update `.github/workflows/` or mark `D-ARCH-018/019` Accepted.

### Required negative and positive evidence before marking any control PASS

| Test | Expected outcome | Evidence |
| --- | --- | --- |
| Normal documentation-only review PR | Read-only lint runs on PR head and passes | Workflow URL, exact SHA, step logs |
| Whitespace-injected disposable PR | Lint fails with clear file/line | Red check result and artifact |
| Broken repository-relative link in disposable PR | Link checker fails for intended broken path | Red check result |
| PR from untrusted fork or account (only if relevant) | No secret or write privilege in job | Workflow permissions and scoped job log |
| Attempt to bypass review requirement (when plan supports protection) | GitHub rejects unauthorized merge | Admin-provided settings evidence and blocked merge UI |
| Two-person review with passing check (when eligible) | Merge permitted only after required review | Reviewer identity and successful PR evidence |
| Unsupported private plan | Rule cannot be enforced | Plan/admin UI evidence; explicit fallback policy **not equal to enforcement** |

Never run destructive test pushes to `main` just to probe branch controls. Use a disposable branch and explicit scoped permission.

## 5. Decision Gate and Human Administrator Action

1. **Owner/admin verification — mandatory:** Open [repository Settings](https://github.com/im-tnyx/gym-pulse/settings), inspect **Rules / Rulesets** and **Branches**, and determine current private-repo entitlements, collaborator/reviewer availability, and whether branch protections can be enabled. This connector cannot read/modify privileged settings on behalf of the user.
2. **Choose target policy explicitly:** minimum required reviews (recommended at least one independent human), direct-push/force-push/delete restrictions, required checks, bypass principals and admin applicability; record whether the policy is technically available or manual-only.
3. **Authorize a limited trial only if appropriate:** a future PR for read-only documentation lint, with named reviewer, test plan and scope boundaries. Execute real positive/negative runs and capture links. Only after a known successful check exists, decide whether to require it on `main`.
4. **Defer production releases:** [ADR-0017](../adr/ADR-0017-ci-cd-release-secrets.md) remains Proposed and `D-ARCH-019 OPEN`; app E2E/DB/secret-management strategy is still separately proposed/open. No provider, workflow, branch rule or environment is selected by this report.
5. **If plan upgrade is needed:** confirm cost/eligibility outside this task, and obtain owner's explicit authorization before purchase. Do not change repository visibility automatically.

### Minimum issue-close criteria

Issue #10 remains OPEN until **(a)** actual GitHub branch protection/plan availability is evidenced, **(b)** approved controls are recorded with human owner and scope, **(c)** required checks and merge restrictions are verified in live GitHub, or **(d)** limitations and a specific, formally documented temporary manual-only risk disposition are accepted by an authorized owner. A suggested workflow, Markdown report or checkless merge does not satisfy these requirements.

## 6. Immutable Governance Boundaries

- Foundation ADR-0001–0004 are Accepted; no new human decision is implied here.
- [ADR-0017](../adr/ADR-0017-ci-cd-release-secrets.md) remains Proposed; `D-ARCH-019` remains OPEN. `D-ARCH-018` remains PROPOSED.
- [ADR-0010](../adr/ADR-0010-data-layer-tenant-isolation-rls.md) remains Proposed; `D-SEC-008` remains OPEN. [Issue #2](https://github.com/im-tnyx/gym-pulse/issues/2) still needs **12** explicit human evidence-gap dispositions.
- Prior isolated PostgreSQL RLS **29/29 synthetic PASS** is an executed but narrow validation fact, not proof that branch protection, real application authorization, pooler compatibility or production is safe.
- **Production implementation and deployment gate: CLOSED.**
- **This audit is not a finding of a compromise.** No GitHub administration or subscription setting was changed, no general PR workflow added, no new tests run, no CI PASS claimed.

## 7. Next Bounded Action

The repository owner must identify which **private-repository** review/branch-rule controls are actually available in the admin UI and select the minimum policy or an explicit temporary unenforced procedure. That determines the scope of a separate non-production documentation-gate test PR; **do not conflate the owner decision with assistant-written audit prose**.
