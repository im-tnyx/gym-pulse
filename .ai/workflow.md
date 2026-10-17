# GymPulse — Bounded AI Task Workflow

> **Contributor execution aid, not a decision authority.** Follow [root AGENTS.md](../AGENTS.md), the [canonical documentation hierarchy](../docs/README.md), [decision register](../docs/00-overview/assumptions.md), and [ADR approval rules](../docs/adr/README.md). This file cannot approve implementation, providers, security risk, releases, or production access.

Use these steps for one reviewable task slice. Read the smallest relevant source set; do not ingest all historical handoffs by default.

## 1. Discover and reconcile

- Identify the user request, linked issue/PR, requested deliverable, and whether the task is docs-only, application, security/data, or production-related.
- Inspect live `main` HEAD, active branch/PR, relevant files, and `git status --short --branch` **when a worktree exists**. Never overwrite unrelated changes.
- Compare current GitHub issue/PR states and actual source/config with [`.ai/current-state.md`](current-state.md). Report stale or inaccessible context; do not treat old snapshots as current.
- Read only applicable canonical requirements, approved decisions and relevant ADR statuses. Record exact references, not invented approvals.

## 2. Check evidence and decision gates

- Confirm an authorized, bounded scope before editing. An issue, a PR, a roadmap entry, a passing test, or a casual "go" is **not** ADR acceptance or production authorization.
- Require the applicable authorized decision process before a new independently scoped product feature, unresolved technology/provider commitment, sensitive schema/security change, production action, or risk acceptance.
- Routine subtasks **within an already authorized scope** do not require an invented new approval; keep changes inside the recorded boundaries.
- If a required decision is `OPEN`, `PROPOSED`, `ASSUMED` or `BLOCKED`, do not silently implement the proposed choice. Continue only with work that is independently safe and permitted (for example, a clearly labeled docs proposal). Report the blocker precisely.
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
- Propose changes in a reviewable branch and PR. Never auto-merge or bypass required human reviews.

## 5. Validate relevant evidence

- For docs, check changed-file links/formatting and run `git diff --check` **if a git worktree is available**. A GitHub API/static check is different from executing a local command; identify exactly which was done.
- For code/security/data, run only approved and available scope-specific checks, including negative/fail-closed tenant and authorization tests when applicable. Never claim tests or scans that did not execute.
- Distinguish `PASS`, `FAIL`, `NOT RUN` and `BLOCKED`; record the command/tool, target/ref, result and limitations. Do not treat missing required CI as a pass or synthetic RLS evidence as production proof.
- Keep secrets and private member/payment/health data out of prompts, fixtures, outputs and logs.

## 6. Review and hand off

Use one clear task outcome:

| Outcome | Required evidence |
| --- | --- |
| `BLOCKED` | Exact external blocker, affected scope and safe next action |
| `NEEDS_APPROVAL` | Decision needed, authorized owner and recorded proposal; no assumed authorization |
| `READY_FOR_REVIEW` | Reviewable branch/PR, changed paths, actual validations and reviewer questions |
| `COMPLETE` | Acceptance criteria met with evidence and any required review/merge confirmed; not just PR opened |

At handoff, record actual file/commit/PR links, validation run/not-run, residual risks, unresolved approvals, current outcome and **one next bounded action**. Update [`.ai/current-state.md`](current-state.md) only when useful, and only after checking live sources. Keep historical audit records intact.

## Tool or tracker unavailable?

Record what could not be inspected, which statements remain unverified, and which safe steps were completed. Do not invent an issue status, branch protection rule, test result, review outcome or approval. Seek only the minimum missing access/decision needed for the blocked work.
