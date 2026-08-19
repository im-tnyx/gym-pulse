# GymPulse AI Workspace

## Purpose

The `.ai/` directory is a repository-persisted working-memory and task-control layer for AI-assisted GymPulse documentation and engineering work.

Its purpose is continuity. A fresh AI session or new contributor should be able to resume the project by reading repository state instead of depending on chat history or model memory.

## Source-of-truth boundary

- `docs/` contains canonical product and technical truth.
- `docs/adr/` or `adr/` contains accepted architecture decisions.
- `docs/16-open-decisions.md` remains the legacy/open-decision register until migrated.
- `.ai/` contains current context, execution state, working memory, handoff notes, and task sequencing.
- `.ai/` must not silently override canonical documentation.

## Structure

```text
.ai/
├── README.md
├── context/
│   ├── project-context.md
│   ├── current-context.md
│   └── documentation-state.md
├── task/
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

## Mandatory start-of-session workflow

```text
1. Read .ai/README.md
2. Read .ai/context/project-context.md
3. Read .ai/context/current-context.md
4. Read .ai/context/documentation-state.md
5. Read .ai/task/current.md
6. Read only the canonical docs linked by the current task
7. Check relevant ADRs and open decisions
8. Execute one bounded documentation task
9. Update documentation-state.md
10. Move/record task state
11. Update session-handoff.md before stopping
```

## Mandatory end-of-session workflow

Before ending a meaningful work session:

1. Record what changed.
2. Record the last completed file.
3. Record the exact next file/task.
4. Record unresolved blockers and decisions.
5. Update `.ai/task/current.md`.
6. Update `.ai/memory/session-handoff.md`.
7. Do not leave critical context only in chat.

## Working rules

1. Repository state is the durable memory layer.
2. Work one bounded phase/task at a time.
3. Do not generate the entire documentation tree blindly.
4. Do not invent missing business rules. Mark them `Open`, `Assumed`, or `Proposed`.
5. Major architecture decisions require ADRs before becoming final.
6. Requirement IDs must remain stable after publication unless a migration is explicitly documented.
7. Canonical docs should link rather than duplicate the same rule across many files.
8. Every completed task should leave the repository easier for the next session to understand.
