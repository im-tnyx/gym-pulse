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
└── task/
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

## Update Protocol

At the end of a bounded documentation task:

1. update the task file with result and files changed,
2. refresh `current-state.md` with only the minimum context needed to resume,
3. record the exact next task,
4. do not copy large canonical sections into `.ai/`,
5. do not mark Open/Proposed decisions as accepted in `.ai/`,
6. link to canonical files instead of duplicating them.

## Rules

- `.ai/` may summarize repository state but cannot redefine it.
- Open decisions remain open until canonical decision governance resolves them.
- Requirement IDs must come from canonical requirement documents.
- Legacy flat docs may be listed as migration inputs, not promoted to canonical truth.
- Future AI sessions should read `current-state.md`, then the active task, then only the canonical files listed for that task.
