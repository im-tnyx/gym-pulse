# GymPulse — Bounded Task Brief Template

> **NONCANONICAL WORKING RECORD.** Copy this to `.ai/task/NNNN-short-task-name.md` when a new bounded task record is useful. Preserve the existing four-digit sequence. Do **not** treat an example or this template as a work order, product specification, security approval or accepted ADR. Follow [the agent workflow](../workflow.md) and [root contributor guardrails](../../AGENTS.md).

## Task identity

- **Title:** `<short objective>`
- **Issue / PR:** `<live links, or none>`
- **Implementation owner:** `<one named owner, or unassigned>`
- **Task status (current lifecycle):** `PLANNED | IN_PROGRESS | BLOCKED | NEEDS_APPROVAL | READY_FOR_REVIEW | COMPLETE`; task status can be `IN_PROGRESS` even if no handoff has occurred.
- **Baseline:** `<verified main SHA + date; active branch/HEAD; worktree status if available>`

## Evidence and approvals

- **Read and verified:** `<specific canonical files, live issues/PRs and observed source/config>`
- **Requirement IDs:** `<exact IDs, links or none>`
- **Decision/ADR IDs + live statuses:** `<IDs, statuses and approved evidence links; list OPEN/PROPOSED separately>`
- **Task/docs preparation authorization:** `<scoped user instruction or specific owner record/link; clarify exactly what review-only activity is permitted. Issue creation alone is not permission>`
- **Separate architecture/product/provider ADR approval:** `<Accepted ADR + synchronized DECIDED record/owner evidence, NOT APPLICABLE, or NOT GRANTED>`
- **Separate auth/security/privacy/risk approval:** `<explicit governing decision, NOT APPLICABLE, or NOT GRANTED>`
- **Separate production/infra/destructive-action authorization:** `<explicit governing decision, NOT APPLICABLE, or NOT GRANTED>`
- **Review/merge policy status and source:** `<adopted/enforced rule + evidence, or PROPOSED / NOT ADOPTED / UNENFORCED; Issue #15's interim manual procedure is only a proposal>`
- **PR-specific reviewer and owner decision evidence:** `<latest-head independent review/owner merge disposition if actually recorded, REVIEW UNAVAILABLE, NOT APPLICABLE until PR, or NOT GRANTED; never infer policy adoption or approval>`
- **Unresolved blockers:** `<what cannot be chosen or changed without approval>`

## Bounded plan

- **Goal:** `<one verifiable outcome>`
- **In scope:** `<exact paths, behaviors or artifacts>`
- **Out of scope:** `<explicit non-goals, especially production/provider/schema decisions>`
- **Dependencies and risks:** `<links and specific failure modes>`
- **Acceptance criteria:**
  - [ ] `<observable criterion 1>`
  - [ ] `<observable criterion 2>`
- **Planned validation:** `<relevant existing commands or safe inspection methods; do not invent a toolchain>`

## Execution / verification

- **Files and commits changed:** `<exact paths + ref; none until changed>`
- **Actual validation results:** `<PASS/FAIL/NOT RUN/BLOCKED, tool/command, ref and observed output>`
- **Checks not run and why:** `<including local git commands if only GitHub API was available>`
- **Review/PR evidence:** `<PR link, review disposition, CI status as actually observed>`
- **Remaining risks/decisions:** `<specific unresolved items>`
- **Resumable continuation checkpoint (if paused while IN_PROGRESS):** `<CONTINUATION — IN_PROGRESS; branch/head, clean/dirty state, owner/transfer, changed paths, completed/pending steps, checks actually run/not run, one next action; NOT a formal handoff outcome>`
- **Review/completion outcome (only if applicable):** `BLOCKED | NEEDS_APPROVAL | READY_FOR_REVIEW | COMPLETE`; leave unfilled during normal unblocked `IN_PROGRESS` work, even across sessions.
- **Next bounded action:** `<one action, owner/dependency if known>`
- **Ownership transfer (if any):** `<from/to, time, branch/commit, worktree status, pending work; otherwise none>`

## Illustrative docs-only example (not an active task)

- **Issue:** `#EXAMPLE` (placeholder, not a real issue)
- **Owner:** `<assigned reviewer-approved owner>`
- **Baseline:** `<live HEAD SHA to verify>`
- **Goal:** Correct an outdated link in one documentation file.
- **Scope:** `docs/example.md` only; no ADR, implementation, CI or production changes.
- **Approval:** An explicit scoped request may permit drafting this docs-only PR. Architecture/security/production approvals are **NOT APPLICABLE** to the example's non-production task; human PR-merge authorization is **NOT GRANTED**.
- **Acceptance:** Link resolves, one-file reviewable diff, checks honestly reported.
- **Validation:** `git diff --check: NOT RUN` if no local worktree; `relative link target: PASS` only after the actual check is performed.
- **Continuation:** If the docs edit is unfinished at session end, keep task status `IN_PROGRESS` and record `CONTINUATION — IN_PROGRESS` with branch/head, owner, changes, actual checks and next action. Leave review/completion outcome empty.
- **Handoff:** Use `READY_FOR_REVIEW` only after a real, reviewable PR exists; record that outcome with evidence, not merely because an issue was opened.
- **Next action:** Review the docs-only diff before any merge.
