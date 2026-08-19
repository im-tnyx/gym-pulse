# GymPulse Session Handoff

## Last completed task

`TASK-DOC-ADR-001 - Create ADR Framework and Index`

Branch:

`docs/phase-2-architecture`

Created:

`docs/adr/README.md`

## What the ADR framework established

GymPulse now has a canonical ADR governance model.

Source-of-truth relationship:

```text
docs/00-overview/assumptions.md
  -> canonical decision ID, priority, current status, owner/question

docs/adr/ADR-*.md
  -> detailed context, evidence, alternatives, rationale, consequences, history
```

Important rules:

- new ADRs use canonical scoped decision IDs only,
- ADRs normally begin as `Proposed`,
- accepted decisions require explicit approval evidence,
- implementation, merge, deployment, or prototype use does not automatically mean `Accepted`,
- decision register and Accepted ADR status must remain synchronized,
- Rejected and Deferred proposals remain traceable,
- materially replacing an Accepted decision requires a new superseding ADR,
- old Accepted ADRs are preserved as historical records rather than rewritten.

## ADR lifecycle

```text
Canonical decision
  -> evidence / spike
  -> Proposed ADR
  -> review
  -> Accepted | Rejected | Deferred
  -> canonical register synchronization
  -> affected docs update
  -> implementation / migration
  -> validation
```

Supported ADR statuses:

```text
Proposed
Accepted
Rejected
Deferred
Superseded
Deprecated
```

## Initial ADR backlog

```text
ADR-0001-use-monorepo.md             D-ARCH-001  P0 PROPOSED
ADR-0002-database-selection.md       D-ARCH-002  P0 PROPOSED
ADR-0003-api-architecture.md         D-ARCH-003  P0 PROPOSED
ADR-0004-authentication-strategy.md  D-ARCH-004  P0 OPEN
ADR-0005-managed-backend-platform.md D-ARCH-013  P0 OPEN
ADR-0006-background-job-runner.md    D-ARCH-007  P1 OPEN
```

These are candidates only. No candidate became Accepted by being indexed.

## Important current decision state

Current recommended architecture remains Proposed/Open/Assumed according to `docs/00-overview/assumptions.md`.

Examples:

```text
D-ARCH-001 Monorepo                  PROPOSED
D-ARCH-002 PostgreSQL                PROPOSED
D-ARCH-003 JSON HTTP API             PROPOSED
D-ARCH-004 Authentication/session    OPEN
D-ARCH-006 API deployment topology   OPEN
D-ARCH-007 Job runner                OPEN
D-ARCH-013 Managed backend           OPEN
D-ARCH-014 Package manager           ASSUMED
D-SEC-008  RLS strategy              OPEN
```

## Current task

Read `.ai/task/current.md`.

Current task:

`TASK-DOC-ADR-002 - Draft Monorepo Architecture Decision Record`

Target:

`docs/adr/ADR-0001-use-monorepo.md`

Primary canonical decision:

`D-ARCH-001`

Required initial status:

`Proposed`

## Exact next action

Draft a reviewable monorepo ADR using existing repository and architecture evidence.

Evaluate at least:

1. TypeScript monorepo with apps/packages,
2. separate repositories by application/runtime,
3. single application repository without deliberate reusable package boundaries.

Evaluate against:

- shared domain rules,
- typed contracts,
- atomic cross-app changes,
- CI/build impact,
- dependency boundaries,
- local development,
- release independence,
- mobile/web/API coordination,
- future team ownership,
- reversibility,
- security boundaries for server-only code/secrets.

## Do not forget

- a monorepo ADR does not decide API deployment topology,
- shared source repository does not mean one deployable runtime,
- clients must not import server-only secrets/adapters,
- package manager `D-ARCH-014` is related but remains separate unless explicitly brought into scope,
- keep ADR status `Proposed` unless explicit acceptance is separately authorized,
- use `docs/adr/README.md` template and workflow,
- do not batch-create or accept the next ADRs in the same bounded task.

## Blockers/open questions

No blocker prevents drafting ADR-0001 as `Proposed`.

Formal acceptance will require explicit decision-owner approval after the rationale and consequences are reviewable.
