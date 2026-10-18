# GymPulse: Read-Only PR Documentation CI Pilot Plan

## Record control

| Field | Value |
| --- | --- |
| Maturity | **DRAFT / PROPOSED / NOT IMPLEMENTED / NOT APPROVED** |
| Issue | [#16: Read-only PR CI pilot plan](https://github.com/im-tnyx/gym-pulse/issues/16) |
| Parent governance | [Issue #10: protection and CI readiness](https://github.com/im-tnyx/gym-pulse/issues/10) |
| Baseline | `main` at `7c573b98ccb7b5d7b3d234893370e10008a1f4c6` (audited snapshot, verify again before work) |
| Repo posture | **GitHub Free; PRIVATE; branch rules/checks NOT ENFORCED** |
| Scope | Future read-only, non-production **documentation-integrity** check only |
| Current action | **Write a reviewable test plan only**; no workflow, checker, dependencies or runs |
| Approval | A separate owner decision is required **before** any workflow implementation or pilot execution |

This document **does not install CI**, choose production CI/CD tooling, accept a security risk, approve an ADR, authorize a merge, or declare production readiness. A passing future lint check could provide evidence only for the checks it actually runs; it **cannot** replace independent review or GitHub-enforced branch protection.

## 1. Audited sources and dependencies

Use [canonical docs hierarchy](../README.md), [root agent guardrails](../../AGENTS.md), the [decision register](../00-overview/assumptions.md), and [ADR governance](../adr/README.md) before implementation. At this original pilot-plan snapshot, the [manual PR review document](interim-manual-pr-review-proposal.md) was **Proposed / Not adopted**. **Later owner decision (2026-10-18): ADOPTED voluntarily for docs-only/non-production work, MANUAL-ONLY / UNENFORCED**, with Codex bot technical review and separate owner authorization per PR ([Issue #15 decision](https://github.com/im-tnyx/gym-pulse/issues/15#issuecomment-6252020586)); **no formal residual-risk acceptance**. [PR #14](https://github.com/im-tnyx/gym-pulse/pull/14) is now MERGED, and a limited [read-only docs CI](../../.github/workflows/docs-integrity-pilot.yml) is installed; this original pilot-plan design remains a dated historical proposal, not a production or required check.

- [ADR-0017: CI/CD, release and secrets](../adr/ADR-0017-ci-cd-release-secrets.md) is **Proposed**; `D-ARCH-019 = OPEN`. No provider, production pipeline, release or secrets architecture is accepted by this plan.
- [ADR-0018: testing toolchain](../adr/ADR-0018-testing-toolchain.md) is **Proposed**; `D-ARCH-018 = PROPOSED`. No library, test runner or dependency selection is approved.
- [ADR-0010: RLS](../adr/ADR-0010-data-layer-tenant-isolation-rls.md) is **Proposed**; `D-SEC-008 = OPEN`. The existing [isolated PostgreSQL RLS validation workflow](../../.github/workflows/rls-isolation-validation.yml) runs on scoped `validation/rls-*` pushes or manual dispatch, **not all `pull_request` events**. Its prior 29/29 synthetic PASS is **not** PR-CI or production security evidence.
- Foundation ADR-0001 through ADR-0004 remain Accepted. The production implementation/release gate remains **CLOSED**.
- Owner-provided screenshots described in [Issue #10](https://github.com/im-tnyx/gym-pulse/issues/10) show GitHub Free, missing classic branch rules and **unenforced** private-repository Rulesets. Redacted independent evidence, reviewer availability and an actual enforceability decision remain open.

## 2. Bounded future pilot contract: design proposal only

| Property | Candidate behavior; **nothing configured here** |
| --- | --- |
| Event | `pull_request` against `main`, including opened, synchronize and reopened as supported |
| Paths | **No event-level docs-only path filter** if the job may later be required: ordinary PRs must not silently skip a required check |
| Intended status | One stable, uniquely named job, e.g. `docs-integrity`; uniqueness and naming must be verified before marking anything required |
| Permissions | Global/job `GITHUB_TOKEN` **`contents: read`** and no other required write scopes; additional permissions default to none |
| Execution | GitHub-hosted disposable runner (candidate `ubuntu-latest`) with a short timeout, e.g. 10 minutes; runner/pin details still to be reviewed |
| Dependencies | Prefer a dependency-free, deterministic checker maintained and reviewed as a separate task. No `npm install`, remote scripts or newly trusted packages in this planning PR |
| Trusted code | Execute **only separately reviewed trusted checker code**, pinned to an immutable trusted commit/base. PR-head files are **untrusted data**, never automatically executed as validation scripts |
| Actions | Review exact SHA pins for any third-party or GitHub-maintained actions before implementation, including checkout. Do not adopt mutable tags as a security guarantee |
| Checkout | If needed, fetch only the Git tree history necessary for reliable `base...head` evaluation; handle forks and PR merge refs deliberately; read PR content as data |
| Output | Per-check PASS/FAIL/NOT RUN, exact head/base/merge SHA, job run URL, non-sensitive logs, paths and line numbers where appropriate |
| Exclusions | **No** `pull_request_target`, untrusted write token, `id-token: write`, workflow dispatch elevation, repository secrets, deployment, migration, payment callback, real tenant data or PostgreSQL suite |

**Important:** `pull_request` check success alone does not enforce merging restrictions on this GitHub Free/private repository. No required check is configured or implied. Only an authorized admin can assess whether future paid-plan enforcement is available. Do not make the repository public as a workaround.

## 3. Minimal threat model

| Threat | Trust boundary and mitigation candidate | Evidence needed |
| --- | --- | --- |
| Malicious fork/PR embeds executable code | Checkout PR content only as **data**; run checker from independently reviewed pinned/trusted source, not `scripts/` supplied by the PR | Confirm executed code SHA, no PR-provided commands executed |
| Shell/path injection via PR title, filenames, Markdown or branch | Never concatenate PR text into shell commands; pass immutable refs as data and path lists via safely quoted arguments or APIs | Crafted path/name negative test, no unexpected command |
| Secrets/privilege exposure | Read-only scoped token; no environment secrets, OIDC write, deployment key, privileged event or elevated actor | Job permission transcript, workflow review, no secret available |
| Wrong-base comparison or shallow checkout | Explicit base SHA + head SHA; verify real merge base and required history, handle new files/deletions/renames | Actual SHA/log and accurate changed-path list |
| Link parser false negatives/positives | Resolve links relative to each Markdown file; check path case, percent encoding, anchors and exclusions explicitly | Fixed fixture table for case, anchor, code fence and external URL behavior |
| CI bypass due to path filter or skipped job | No trigger-level paths filter if eventually required; each target-branch PR must yield a status or an explicitly documented limitation | Docs-only and non-doc PR both get status |
| Log or artifact data leak | Do not echo PR contents, secrets or private user data; bound diagnostic output, restrict artifacts and retention | Inspect failure logs and artifact policy |
| False security/release confidence | Status name clearly says **docs**, not security/production; separate application/RLS/release decisions | Review wording and unrun-test reporting |

Untrusted PRs from forks may have different event/permission behavior. The pilot must test the actual fork path if available and **fail closed or mark NOT RUN with reason** when a permission or checkout assumption is not met. No workflow may gain write permission just to make a fork test pass.

## 4. Candidate tests and parser boundaries (not code)

1. **Whitespace:** evaluate exact changed Git text using an appropriately fetched base/head and `git diff --check`, including newly added files. If a command cannot run because checkout/history is incomplete, report **NOT RUN/FAIL**, not PASS.
2. **Markdown links:** inspect changed `.md` files only (including additions, renames and deletions correctly); resolve repository-relative file targets from each document directory; validate exact path case. Explicitly define behavior for headings/anchors, percent-encoded URLs, reference-style links, image links, links in fenced/inline code, encoded parentheses and intentionally historical archive docs. External URLs are **not** live-network checked in this initial pilot.
3. **Workflow configuration:** review workflow YAML syntax and effective `permissions`; only run a safe parser once independently selected and approved. Treat a workflow YAML in a PR as **untrusted source text**, not executable configuration to evaluate with secrets. A future workflow-change PR may require additional manual security review.
4. **Scope:** no application tests, database provisioning, PostgreSQL RLS suite, network integration checks, publishing or deployment. Do not claim absence of vulnerabilities, SAST, dependency scanning or production readiness from passing docs checks.
5. **Logging:** capture stable check name, event type, immutable refs, actual commands and result; redact or avoid sensitive content. Be explicit if check could not inspect a file or ref.

A checker choice and any actions/pins are **unresolved design details**. An illustration in a Markdown proposal must not be interpreted as a working `.github/workflows/` file.

## 5. Evidence matrix for a separately authorized disposable pilot

| Case | Expected observation | What to record |
| --- | --- | --- |
| A. Valid docs-only PR | Job triggers and docs checks PASS | PR URL, event, head/base SHA, job name, workflow run URL, step logs |
| B. Inject trailing whitespace in a disposable Markdown file | Whitespace check FAIL with exact path/line | Red status and logs, cleanup/revert evidence |
| C. Add clearly broken local Markdown path | Link check FAIL, nonzero check conclusion | Error path and run URL |
| D. Wrong-case relative link | FAIL on case-sensitive repository path | Source path, referenced path, run result |
| E. A non-doc PR that targets `main` | Job runs (perhaps no changed docs to inspect); does **not** silently skip required status | Run URL and an explicit `NO DOC FILES` classification |
| F. External URL or sample in fenced code | No network access; avoid incorrectly flagging documented exclusion | Fixture expectations and output |
| G. Fork PR if feasible | Read-only checkout/check; no secrets or write permissions; safe failure if denied | Actor/event, permissions, restricted run evidence |
| H. Manipulated PR filename/Markdown payload | No arbitrary shell/script execution | Proof of fixed checker source, safe diagnostics |
| I. CI infrastructure/checkout error | FAIL or neutral `NOT RUN` explicitly, **never** reported as PASS | Cause, run SHA/URL, follow-up |

Each red/green result must be observed on an actual future run; **all cases above are NOT RUN**. Use disposable PR branches only. Do not intentionally break `main`, push dangerous test data, or relax permissions to make checks green.

## 6. Proposed implementation separation and decision gates

**Stage 0 (this issue):** one Markdown pilot plan in a review-only PR; perform static link/format/governance review. **No workflow implemented**.

**Gate A: explicit task-specific human authorization for implementation.** Confirm a trusted checker source and action pins, exact runner/token permissions, workflow trigger and CI minute budget. If the [manual review proposal](interim-manual-pr-review-proposal.md) has not been formally adopted, explicitly document that dependency rather than silently treating its merge as process approval.

**Stage 1 (future separate issue/PR only):** create a small read-only workflow and checker (if needed) without production access. Review the workflow as security-sensitive source before any run. Test behavior in disposable PRs and keep `main` protected by manual commitments where technically possible.

**Gate B: verified test evidence.** Record real green and red run links, stable job names, exact SHAs, fork restrictions, cost, and which scenarios were **NOT RUN**. Bot summaries, synthetic RLS history and GitHub `mergeable=true` cannot replace actual docs workflow results.

**Stage 2 (separate future administrator choice):** require the check on `main` only if actual branch rules can be enforced, after verifying the name and successful execution. Review bypass actors, direct pushes, force-push/deletion and independent approval. **No plan purchase, visibility/settings change or risk acceptance is approved here.**

**Issue #10 stays OPEN** until its own evidence and approved-control/residual-risk criteria are met. A merged planning document or a standalone green job does not close it. **Issue #16 planning completion does not authorize the Stage 1 workflow.**

## 7. Pilot run record template (future use only)

~~~text
Approval/owner + scope:
Issue / PR / workflow file:
Trust model and exact trusted checker version:
Event, actor, fork/source context:
Base SHA / PR head SHA / merge SHA:
Workflow run URL / stable job name:
Token permissions / runner / action pins:
Commands/checks actually executed:
A valid docs case:
B whitespace failure:
C broken-link failure:
D case-sensitive path failure:
E non-doc PR status:
F excluded inputs behavior:
G fork behavior or NOT RUN:
H injection safety or NOT RUN:
I infrastructure failure or NOT RUN:
Logs reviewed for confidential data:
Duration/minutes/billing observations:
Any bypass, protection gap, unresolved risks:
Owner/reviewer disposition, approval evidence:
One next bounded action:
~~~

**Final state for this proposal:** all pilot executions **NOT RUN**; no CI PASS claimed, no required check enabled, no human process adopted by default, no ADR/security/production gate altered, and no PR merge authorized.
