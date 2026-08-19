# GymPulse Session Handoff

## Last completed task

`TASK-DOC-ARCH-007 - Create Technology Stack Evaluation`

Branch:

`docs/phase-2-architecture`

Created:

`docs/02-architecture/technology-stack.md`

## What the technology evaluation established

The architecture now has a canonical technology-evaluation document that separates required capabilities from Proposed, Assumed, and Open choices.

Evaluated areas:

- TypeScript primary application direction,
- Turborepo-style monorepo and pnpm assumption,
- Next.js Owner/Staff Web,
- Expo/React Native Member Mobile,
- JSON HTTP runtime-validated typed contracts,
- API deployment Option A vs Option B,
- PostgreSQL,
- SQL-aware typed data-access and migration approaches,
- Supabase-like managed backend option,
- auth/session requirements,
- RLS implications,
- durable job/scheduler options,
- Redis posture,
- payment and messaging provider criteria,
- object storage,
- observability/error monitoring,
- product analytics,
- testing/local-development tooling,
- secrets/configuration,
- hosting/deployment,
- database connection implications,
- CI/CD and versioning policy,
- technology spikes and pre-scaffold selection gates.

## Important recommendation state

The document contains a recommended Phase 1 baseline for planning, but no Open/Proposed technology became Accepted.

Examples that still require decisions/ADRs:

```text
D-ARCH-001      Monorepo
D-ARCH-002      PostgreSQL
D-ARCH-003      JSON HTTP API
D-ARCH-004      Authentication/session
D-ARCH-006      API deployment topology
D-ARCH-007      Job runner
D-ARCH-009      Hosting
D-ARCH-011      Owner/Staff web framework
D-ARCH-012      Member mobile framework
D-ARCH-013      Managed backend
D-PROVIDER-001  Payment provider
D-PROVIDER-002  Messaging provider
D-PROVIDER-006  Observability
D-SEC-008       RLS strategy
```

The legacy `docs/05-system-architecture.md` may contain older `Accepted recommendations` language. It remains migration input; the canonical decision register in `docs/00-overview/assumptions.md` controls current status.

## Current task

Read `.ai/task/current.md`.

Current task:

`TASK-DOC-ADR-001 - Create ADR Framework and Index`

Target:

`docs/adr/README.md`

## Exact next action

Create the ADR governance framework only.

It must define:

- when ADRs are required,
- status lifecycle,
- numbering/filename convention,
- mandatory sections,
- canonical decision-ID linkage,
- requirement/NFR linkage,
- evidence/alternatives expectations,
- review and acceptance process,
- rejected/deferred handling,
- supersession/deprecation rules,
- implementation and cross-document update responsibilities,
- initial ADR candidate index.

## Do not forget

- creating the ADR framework does not accept any technology,
- `docs/00-overview/assumptions.md` remains the canonical decision register,
- use canonical scoped decision IDs only,
- implementation alone cannot make an ADR Accepted,
- do not batch-accept the initial ADR set,
- proceed one bounded decision record at a time after the framework exists.

## Blockers/open questions

No blocker prevents creating the ADR framework.

Actual ADR acceptance may require architecture spikes, provider evidence, product decisions, or explicit owner approval depending on the decision.