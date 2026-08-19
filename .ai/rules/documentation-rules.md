# GymPulse AI Documentation Rules

## 1. Canonical Truth

- Put durable product/technical truth in `docs/`.
- Put working state and handoff in `.ai/`.
- Never rely on chat history as the only record of a decision.

## 2. Work in Bounded Tasks

One task should normally produce one primary canonical document or one tightly related update set.

Do not generate many downstream documents when upstream boundaries are still unresolved.

## 3. Read Before Write

Before a task:

- read `.ai/context/current-context.md`,
- read `.ai/task/current.md`,
- read linked canonical documents,
- read relevant open decisions/ADRs.

Do not infer project state from filenames alone.

## 4. Status Discipline

Use these states consistently:

```text
Confirmed
Proposed
Assumed
Open
Future
Out of Scope
Deprecated
```

Do not present `Proposed` technology as final architecture.

## 5. Requirement Traceability

Architecture, domain, API, database, security, and tests should reference stable requirement IDs when practical.

Do not casually renumber published requirement IDs.

## 6. ADR Discipline

Major architectural decisions require an ADR.

Examples:

- monorepo/tooling
- database
- API deployment model
- auth strategy
- managed backend
- job runner
- payment provider
- messaging provider
- hosting
- AI model/runtime strategy

## 7. Consistency

When changing a canonical rule:

1. identify owning document,
2. identify dependent documents,
3. update cross-references,
4. update `.ai/context/documentation-state.md`,
5. update decision/task memory where relevant.

## 8. No Fabrication

If business input is unavailable, write:

```text
Status: Open
Assumption: ...
Decision Required: ...
Impact: ...
```

Do not invent pilot rules, legal requirements, pricing, providers, or health-policy assumptions.

## 9. Security and Privacy

Security, privacy, tenancy, authorization, idempotency, auditability, and observability are cross-cutting. Mention them inside the architecture where they matter instead of deferring everything to one later security document.

## 10. AI Boundary

Future AI behavior must remain separate from deterministic business truth.

AI must not become canonical authority for payment, membership entitlement, attendance validity, authorization, or medical facts.

## 11. Handoff Requirement

Before stopping meaningful work:

- update current task,
- record completed task,
- update documentation state,
- update session handoff,
- ensure exact next action is repository-visible.
