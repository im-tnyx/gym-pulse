# GymPulse — Agent Contributor Guide

This is the repository entry point for AI-assisted contributors. It is a **navigation and safety guide**, not an architecture decision, product specification, security approval, or permission to deploy.

## Read first: authority and current state

Before proposing or editing anything, consult only the relevant live sources:

1. [Canonical documentation and precedence](docs/README.md) — structured docs and approved decisions outrank legacy sources.
2. [Canonical decision register](docs/00-overview/assumptions.md) — authoritative `OPEN`, `PROPOSED`, `ASSUMED`, `DECIDED`, `DEFERRED`, and `BLOCKED` statuses.
3. [ADR governance](docs/adr/README.md) — acceptance requires an authorized owner, explicit approval evidence, and synchronized canonical records.
4. [Architecture principles](docs/02-architecture/architecture-principles.md) — approved architectural constraints and governed proposals are distinguished in their sources.
5. [AI continuity contract](.ai/README.md) and [working handoff](.ai/current-state.md) — noncanonical working notes; validate against live docs and GitHub.
6. [Repository overview](README.md) and applicable product requirements in [docs/01-product/](docs/01-product/).

**Precedence:** explicit authorized human decisions + accepted ADRs and current structured canonical docs govern. `.ai/` is only a resume aid; older flat documents and superseded branches are historical context. If a source conflicts with an accepted ADR or decision register, stop and report the conflict rather than silently choosing a technology or rewriting an approval.

## Safe task workflow

- Inspect the current `main` head, relevant branch/PR/issue, owners, canonical files and applicable ADR statuses **before editing**.
- Work on **one bounded task** and use the smallest reviewable change. Link it to the issue and identify scope, dependencies, success criteria and risks.
- Consult the [AI task workflow](.ai/workflow.md) for bounded planning, ownership, verification and handoff; create a [task brief](.ai/task/TEMPLATE.md) only when durable context is warranted, not merely to duplicate an issue. Neither grants approval authority.
- Never interpret `go`, a passing test, a merged branch, or an issue opened by an agent as **human ADR acceptance** or production authorization.
- Open a reviewable pull request for proposed changes; do not bypass agreed human reviews, required checks, branch rules or release approvals. If protection/checks are missing, **report the gap** instead of assuming automatic merge is safe.
- Keep proposals explicitly marked as proposals. Do not turn an `OPEN`, `PROPOSED`, or `ASSUMED` decision into `DECIDED`, `Accepted`, or an implementation mandate without the recorded, authorized decision process.
- Verify external claims and actual command/test output; do not report a simulated test as executed. For documentation-only tasks, validate link targets and whitespace; for code, run relevant approved tests where available and permitted.
- At handoff, report exact changed files/commits, real test results, unresolved blockers, and **one next bounded action**. Update `.ai/` only when needed; avoid copying canonical documents or historical logs into it.

## Trust, tenancy and business invariants

- **Authentication is not authorization.** A verified GymPulse Principal, current eligibility, tenant/resource/branch scope and named capability or Member-self relationship are independently required for protected operations. See [authorization proposal](docs/adr/ADR-0009-authorization-implementation.md); its ADR is still **Proposed**.
- Never trust browser/mobile tenant IDs, provider JWT role labels, UI hiding or mutable contact information as sole business authorization. Client applications must not receive server secrets or privileged database/service credentials.
- Preserve explicit tenant-scoped data access; [RLS proposal](docs/adr/ADR-0010-data-layer-tenant-isolation-rls.md) is **defense in depth**, not complete authorization. PostgreSQL custom tenant GUCs are **not authenticated authority** by themselves. Direct client access to canonical tenant data is **not an approved architecture**.
- Keep membership eligibility, attendance validity, payments/refunds, financial effects, communication consent, exports and audit trails under trusted server/domain control. Verify provider events; make retry-sensitive effects idempotent; never treat redirects or UI state as payment truth.
- Use synthetic or redacted fixtures for tests and examples. Do not commit or paste real credentials, API keys, personal/member data, payment data, production dumps, private tokens or sensitive logs. Do not weaken least-privilege roles or bypass controls for convenience.

## Change and verification boundaries

- **No production changes by default.** Do not provision infrastructure, access a real database, alter production permissions, upload data, select unresolved providers, run destructive migrations, release, or accept residual risk without **specific authorization** and the applicable approved governance.
- Preserve historical audit evidence; document corrections rather than erasing failed runs or overwriting older records with invented green results.
- Keep code/runtime version recommendations separate from accepted technology categories. Verify current dependency and runtime choices before implementation, especially where decisions remain open.
- For security, migration, auth and RLS changes: state the tenant isolation threat model, test negative/fail-closed paths, capture actual results, and explicitly identify tests **not run**. Never infer production readiness from an isolated synthetic validation.
- This file provides **instructions to contributors only**; it does not grant approval over any project owner, issue, ADR, branch, test environment or production system.

## Review starting points

- [Issue #2 — ADR-0010 owner and twelve open security evidence gaps](https://github.com/im-tnyx/gym-pulse/issues/2)
- [Issue #3 — AGENTS.md entry point](https://github.com/im-tnyx/gym-pulse/issues/3)
- [Issue #4 — proposed design system](https://github.com/im-tnyx/gym-pulse/issues/4)
- [Issue #5 — compact AI handoff](https://github.com/im-tnyx/gym-pulse/issues/5)
- [Issue #6 — Copilot instructions, depends on this guide](https://github.com/im-tnyx/gym-pulse/issues/6)

Review the live issue/ADR status before relying on any snapshot above.
