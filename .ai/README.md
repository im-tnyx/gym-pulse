# GymPulse AI Workspace

## Purpose

The `.ai/` directory is a repository-persisted working memory and task system for AI-assisted GymPulse documentation and engineering work.

It exists so a new AI session or human contributor can resume work without depending on chat history or model memory.

## Rules

1. Repository files are the source of continuity, not chat memory.
2. Before starting work, read `.ai/context/` and `.ai/tasks/current.md`.
3. Never silently change an architectural decision. Update the relevant ADR or open-decision record.
4. After completing a meaningful task, update `.ai/context/documentation-state.md` and `.ai/tasks/`.
5. Keep canonical product/architecture truth in `docs/`; `.ai/` stores working context, execution state, handoff notes, and task tracking.
6. Do not duplicate full canonical documents into `.ai/`. Link to them.

## Structure

```text
.ai/
├── README.md
├── context/
│   ├── project-context.md
│   └── documentation-state.md
├── tasks/
│   ├── current.md
│   ├── backlog.md
│   └── completed.md
├── memory/
│   ├── decisions.md
│   └── session-handoff.md
├── rules/
│   └── documentation-rules.md
└── templates/
    └── task-template.md
```

## Start-of-session checklist

```text
1. Read .ai/context/project-context.md
2. Read .ai/context/documentation-state.md
3. Read .ai/tasks/current.md
4. Read linked canonical docs for the current task
5. Check relevant ADRs/open decisions
6. Execute one bounded task
7. Update task state + handoff
```

## Separation of concerns

### `docs/`
Canonical product and technical documentation.

### `.ai/context/`
Compact project context and current documentation state.

### `.ai/tasks/`
What is active, queued, and completed.

### `.ai/memory/`
Short durable notes about accepted decisions and session handoff.

### `.ai/rules/`
Working rules for AI-assisted documentation.

### `.ai/templates/`
Reusable task format so work stays consistent.
