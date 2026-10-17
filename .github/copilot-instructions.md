# GymPulse — GitHub Copilot repository instructions

This repository is a **Docs-as-Code architecture and Phase 1 product specification** for a multi-tenant gym operations/retention SaaS; do **not** treat proposed architecture or legacy docs as implemented code.

## Read before changing anything

- **Primary agent workflow and security boundaries:** [`AGENTS.md`](../AGENTS.md). Follow it; this file is a short Copilot entry point, **not** a competing policy.
- **Canonical source ordering:** [`docs/README.md`](../docs/README.md); [decision status register](../docs/00-overview/assumptions.md); [ADR policy and Accepted/Proposed index](../docs/adr/README.md); [architecture principles](../docs/02-architecture/architecture-principles.md).
- **Working handoff only:** [`.ai/README.md`](../.ai/README.md) and [`.ai/current-state.md`](../.ai/current-state.md). Verify live `main`, issues, and canonical docs; historical AI notes are **not approvals**.
- Scope requirements from [product docs](../docs/01-product/) and current ADRs. Four foundation ADRs (0001–0004) are Accepted, but **other Open/Proposed choices still need their own governance**.

## How to contribute

- Inspect the latest branch, issue, requirements, decision status, and relevant implementation/test files **before writing**. Keep changes small, issue-linked and reviewable; do not invent frameworks, providers, migrations, build scripts or approvals.
- Preserve explicit **trusted-server tenant and resource scoping** and named capability/Member-self authorization. Authentication, a JWT role, client tenant ID, screen visibility and RLS alone are **not** authorization; see [ADR-0009](../docs/adr/ADR-0009-authorization-implementation.md) and [ADR-0010](../docs/adr/ADR-0010-data-layer-tenant-isolation-rls.md), both **Proposed**. `D-SEC-008` remains **OPEN**.
- Keep payments, attendance, membership entitlement and sensitive mutations server-authoritative; verify provider events, guard retry/idempotency paths and preserve auditable actor/reason. Do not introduce direct client canonical-database access.
- **Never** place API keys, passwords, access tokens, private member/health/payment data, production dumps or sensitive logs into prompts, examples, commits or test artifacts. Use synthetic/redacted fixtures.
- Use **only tests/tools actually present and approved for the task**. Check relevant negative paths, links and whitespace; report exact commands and real results, plus tests **not run**. The isolated 29/29 PostgreSQL RLS result is not an application/production test or blanket CI PASS.
- Submit a PR with changed files, requirements, assumptions, tests/evidence, residual risks and one next action. Never silently change `Open`/`Proposed` decisions to `Decided`/`Accepted` or claim an agent-written review as human approval.
- **Production and security gates are closed by default:** no deployment, provider provisioning, destructive migrations, secrets/permissions changes, policy bypass or risk acceptance without specific authorized human decisions. Verify review/CI enforcement; absent GitHub checks are **not CI PASS evidence**. Report any separately executed tests with their own actual results.

See [Issue #6](https://github.com/im-tnyx/gym-pulse/issues/6) for this document's review task. GitHub Copilot instructions guide suggestions; they do not grant privileges or replace human judgment.
