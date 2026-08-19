# GymPulse Session Handoff

## Last completed task

`TASK-DOC-ADR-002 - Draft Monorepo Architecture Decision Record`

Branch:

`docs/phase-2-architecture`

Created:

`docs/adr/ADR-0001-use-monorepo.md`

## What ADR-0001 established

ADR-0001 is a **Proposed** architecture decision for `D-ARCH-001`.

It evaluates:

1. explicit monorepo with apps/packages boundaries,
2. separate repositories per application/runtime,
3. one application repository without deliberate reusable package boundaries.

Current proposal:

```text
Use a monorepo with explicit source-code/package boundaries.
Keep deployment topology independent from repository topology.
```

Primary reasons:

- shared domain/application rules across API and workers,
- typed contract reuse across web/mobile/server,
- atomic schema/contract/application/docs changes,
- one Docs-as-Code and test review surface,
- easier pilot-stage coordination,
- package-level boundaries can exist before runtime/service extraction.

## Important boundaries preserved

ADR-0001 does not decide:

```text
D-ARCH-006 API deployment topology
D-ARCH-014 package manager
D-ARCH-011 web framework
D-ARCH-012 mobile framework
job runner / hosting / providers
```

Security rule:

```text
client apps must not import server-only database/provider/secret packages
```

A monorepo is source organization, not permission to collapse domain ownership or runtime boundaries.

## Decision status

```text
ADR-0001: Proposed
D-ARCH-001: PROPOSED
Decision Owner: Open
Acceptance Evidence: None
```

Do not treat the monorepo as Accepted until explicit approval evidence is recorded and the canonical decision register is synchronized.

## Current task

Read `.ai/task/current.md`.

Current task:

`TASK-DOC-ADR-003 - Draft Database Selection Architecture Decision Record`

Target:

`docs/adr/ADR-0002-database-selection.md`

Primary canonical decision:

`D-ARCH-002`

Initial status:

`Proposed`

## Exact next action

Evaluate the canonical database engine using GymPulse requirements.

Minimum options:

1. PostgreSQL,
2. MySQL/MariaDB-family relational database,
3. document/NoSQL-first canonical persistence.

Evaluation must cover:

- transactions and relational integrity,
- uniqueness/idempotency constraints,
- tenant scoping and possible RLS support,
- operational queue/index/query needs,
- provider-event JSON support where useful,
- migrations/schema evolution,
- test/local development,
- backup/restore,
- managed-service portability,
- observability/operations,
- reversibility.

## Do not forget

- database engine selection is separate from managed backend/provider selection,
- RLS strategy remains `D-SEC-008`,
- ORM/query-builder remains separate implementation decision,
- hosting/provider/region remain separate,
- keep ADR status `Proposed` unless explicit acceptance is separately authorized,
- do not batch-create the next ADRs in the same bounded task.

## Blockers/open questions

No blocker prevents drafting ADR-0002 as `Proposed`.

Formal acceptance still requires an authorized decision owner and explicit evidence/approval.
