# GymPulse AI Working Context

## Purpose

`.ai/` is a lightweight working area for AI-assisted documentation sessions. It exists so a future session can resume bounded work without rereading the entire repository.

`.ai/` is **not canonical product or architecture documentation**.

Canonical truth lives under `docs/` and approved repository decisions/ADRs.

## Source-of-Truth Rule

When `.ai/` conflicts with canonical documentation:

```text
docs/ + Accepted ADR / approved decision
  wins over
.ai/
```

AI notes must never be cited as approval evidence for a product, security, architecture, or provider decision.

## Contents

```text
.ai/
├── README.md
├── current-state.md
├── workflow.md          # Bounded contributor execution guide
└── task/
    ├── TEMPLATE.md      # Reusable, noncanonical task brief
    └── NNNN-short-task-name.md
```

## Task Naming Convention

Use monotonically increasing four-digit task numbers:

```text
0001-architecture-foundation.md
0002-architecture-overview.md
0003-system-context.md
```

One task should represent one bounded documentation objective.

Before starting a bounded task, consult the [contributor execution workflow](workflow.md). Create or update a brief using [the task template](task/TEMPLATE.md) **when the task needs durable, cross-session ownership/decision/validation context**; for a small single-PR docs fix, a sufficiently complete GitHub issue/PR can be the sole execution record. Both aids are **noncanonical**; recheck live source and authoritative decisions first.

## Update Protocol

At a pause, review handoff or completion of a bounded task:

1. record the real changed files/commits, task status, executed/not-run checks, blockers and one next bounded action in its **existing** issue/PR or task brief; for an ordinary unblocked pause, capture a `CONTINUATION — IN_PROGRESS` checkpoint rather than inventing a terminal/review outcome;
2. update `.ai/task/NNNN-...md` **only if** that brief exists or durable handoff/ownership details justify creating one; do not generate duplicate records for every small issue;
3. refresh `current-state.md` **only when** the active working context, blocker or next bounded action materially changes, or to correct verified staleness; verify live GitHub and canonical docs first;
4. preserve audit history and link to canonical sources instead of copying their content;
5. never treat Open/Proposed decisions or these handoff notes as an approved architecture or production authorization.

## Rules

- `.ai/` may summarize repository state but cannot redefine it.
- Open decisions remain open until canonical decision governance resolves them.
- Requirement IDs must come from canonical requirement documents.
- Legacy flat docs may be listed as migration inputs, not promoted to canonical truth.
- Future AI sessions should read `current-state.md`, then the active task, then only the canonical files listed for that task.

## Agent evaluation reference (draft)

The [agent effectiveness evaluation proposal](agent-effectiveness-evaluation.md) defines a prospective evidence rubric for separately authorized tasks. It is **not an active benchmark**, an agent policy override, a CI gate, an ADR acceptance or proof of improved results. Check its current PR/decision status before using it.
