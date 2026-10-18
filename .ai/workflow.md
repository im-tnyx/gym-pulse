# GymPulse — Bounded AI Task Workflow

> **Contributor execution aid, not a decision authority.** Follow [root AGENTS.md](../AGENTS.md), the [canonical documentation hierarchy](../docs/README.md), [decision register](../docs/00-overview/assumptions.md), and [ADR approval rules](../docs/adr/README.md). This file cannot approve implementation, providers, security risk, releases, or production access.

Use these steps for one reviewable task slice. Read the smallest relevant source set; do not ingest all historical handoffs by default.

## 1. Discover and reconcile

- Identify the user request, linked issue/PR, requested deliverable, and whether the task is docs-only, application, security/data, or production-related.
- Inspect live `main` HEAD, active branch/PR, relevant files, and `git status --short --branch` **when a worktree exists**. Never overwrite unrelated changes.
- Compare current GitHub issue/PR states and actual source/config with [`.ai/current-state.md`](current-state.md). Report stale or inaccessible context; do not treat old snapshots as current.
- Read only applicable canonical requirements, approved decisions and relevant ADR statuses. Record exact references, not invented approvals.

## 2. Check evidence and decision gates

- Confirm a bounded task scope and relevant authority before editing. A clearly scoped user request may authorize **preparing docs or a review-only PR**, subject to applicable repo rules; an issue's existence alone does not. This task-level permission is **not** ADR acceptance, security-risk disposition, production authorization or permission to merge. A PR, roadmap entry, passing test or generic "go" must never substitute for those distinct gates.
- Record the **separate gate and evidence for each applicable category**: (1) bounded task/docs scope; (2) architecture/product/provider/ADR choice; (3) auth, privacy, tenant/security or residual-risk decision; (4) production/infra or destructive action; and (5) the actually adopted review/merge policy plus any explicit PR-specific merge decision. The owner **ADOPTED** the [voluntary manual PR review procedure](../docs/13-engineering/interim-manual-pr-review-proposal.md) for **docs-only/non-production changes** in [Issue #15's exact dated decision](https://github.com/im-tnyx/gym-pulse/issues/15#issuecomment-6252020586); it remains **MANUAL-ONLY / UNENFORCED**, Codex is the automated technical reviewer (**not independent human approval**), and only the owner can separately authorize each merge. The decision did **NOT** formally accept unprotected-main or missing-human-review residual risk; [Issue #10](https://github.com/im-tnyx/gym-pulse/issues/10) stays OPEN. Verify any separately adopted policy and its source before describing a review as required or permission to merge as granted. Require the applicable owner decision before a new product feature, unresolved technology/provider commitment, sensitive schema/security change, production action or risk acceptance. Do not let a lower-tier task approval satisfy a higher-tier gate.
- Routine subtasks **within an already authorized scope** do not require an invented new approval; keep changes inside the recorded boundaries.
- If a required decision is `OPEN`, `PROPOSED`, `ASSUMED`, `DEFERRED` or `BLOCKED`, do **not** treat its candidate direction as approved implementation authority. Only an applicable `DECIDED` register entry synchronized with an authorized `Accepted` ADR/explicit owner decision supports that governed choice. `Rejected`, `Superseded` or `Deprecated` ADRs are historical evidence, not permission to implement their rejected/replaced choice. Continue only with independently permitted work (for example, a labeled docs proposal) and report the blocker.
- For tenant isolation, authorization, payments, audit, consent, identity or RLS, apply the unchanged restrictions in root `AGENTS.md`; a validation-only proof is not production authorization.

## 3. Plan a bounded task

- Create/update a compact brief using [`task/TEMPLATE.md`](task/TEMPLATE.md) and the existing [four-digit task naming convention](README.md) **when a task record is warranted**. Do not create an extra record merely to duplicate a GitHub issue.
- Specify issue, implementation owner, inspected baseline SHA, goals, scope/non-goals, required approvals, relevant requirements/ADRs, acceptance criteria, risks and verification plan.
- Do not select an unapproved framework, package manager, CI pipeline, migration strategy or provider while planning.
- A slice should be small enough that a reviewer can validate both its diff and its claims.

## 4. Execute with one implementation owner

- Assign at most **one active implementation owner per bounded slice**. Planning/review agents can research and review, but must not simultaneously edit the slice's implementation files.
- Before takeover, record a handoff with previous owner, new owner, branch/commit, dirty/uncommitted work, outstanding decisions and actual verification status. Never overwrite another contributor's work.
- Use existing patterns and exact file boundaries. If scope or approval conditions change, stop and re-plan rather than expanding silently.
- Propose changes in a reviewable branch and PR. Never auto-merge or bypass any **actually adopted** required human reviews. Apply the owner's [ADOPTED docs-only voluntary procedure](https://github.com/im-tnyx/gym-pulse/issues/15#issuecomment-6252020586): seek a current-head Codex technical review, clearly report when no independent human reviewer or enforced branch/check gate exists, and stop for separate explicit owner authorization on that specific PR head. Do **not** represent this manual adoption as GitHub enforcement, human approval or formal residual-risk acceptance. Opening/reviewing a PR is never permission to merge.

## 5. Validate relevant evidence

- For docs, check changed-file links/formatting and run `git diff --check` **if a git worktree is available**. A GitHub API/static check is different from executing a local command; identify exactly which was done.
- For code/security/data, run only approved and available scope-specific checks, including negative/fail-closed tenant and authorization tests when applicable. Never claim tests or scans that did not execute.
- Distinguish `PASS`, `FAIL`, `NOT RUN` and `BLOCKED`; record the command/tool, target/ref, result and limitations. Do not treat missing required CI as a pass or synthetic RLS evidence as production proof.
- Keep secrets and private member/payment/health data out of prompts, fixtures, outputs and logs.

## 6. Review and hand off

**Task status** may be `PLANNED` or `IN_PROGRESS` while work continues. A **terminal/review handoff outcome** is used only when work is blocked, awaits a required approval, is ready for review, or is complete; it is one of the four values below. `IN_PROGRESS` alone does **not** imply review readiness or completion.

| Outcome | Required evidence |
| --- | --- |
| `BLOCKED` | Exact external blocker, affected scope and safe next action |
| `NEEDS_APPROVAL` | Decision needed, authorized owner and recorded proposal; no assumed authorization |
| `READY_FOR_REVIEW` | Reviewable branch/PR, changed paths, actual validations and reviewer questions |
| `COMPLETE` | Acceptance criteria met with evidence and any required review/merge confirmed; not just PR opened |

**Routine pause / resumable continuation:** A healthy task may remain `IN_PROGRESS` across sessions without a blocker, approval request, or reviewable PR. Record a **continuation checkpoint**, not a false terminal/review outcome: current owner (and incoming owner if transferring), branch and exact HEAD/baseline, clean/dirty/uncommitted work where visible, changed paths, completed and pending steps, actual validation with `NOT RUN` reasons, risks, and **one next bounded action**. Keep the terminal/review outcome field empty (note `CONTINUATION — IN_PROGRESS` separately). On restart, inspect live files/branch/status before resuming; if a transfer occurs, explicitly acknowledge ownership without overwriting another contributor's work.

**Blocked/review/completion handoff:** Record actual file/commit/PR links, validation run/not-run, residual risks, unresolved approvals, the applicable outcome from the table, and **one next bounded action**. Update the existing task brief **only when used**; otherwise keep the evidence in the linked issue/PR. Refresh [`.ai/current-state.md`](current-state.md) only for a material context/next-action change or confirmed staleness, and only after checking live sources. Keep historical audit records intact.

## Tool or tracker unavailable?

Record what could not be inspected, which statements remain unverified, and which safe steps were completed. Do not invent an issue status, branch protection rule, test result, review outcome or approval. Seek only the minimum missing access/decision needed for the blocked work.
