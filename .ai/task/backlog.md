# Documentation Task Backlog

Tasks are ordered. Do not skip ahead unless a blocking dependency requires it.

## Completed Architecture Foundation

```text
TASK-DOC-ARCH-005  C4 Component Architecture
TASK-DOC-ARCH-006  Architecture Data Flows
TASK-DOC-ARCH-007  Technology Stack Evaluation
TASK-DOC-ADR-001   ADR Framework and Index
TASK-DOC-ADR-002   Draft ADR-0001 Monorepo
```

## Current ADR Sequence

Proceed one bounded decision record at a time. Drafting an ADR does not mean accepting it.

1. `TASK-DOC-ADR-003` Draft `docs/adr/ADR-0002-database-selection.md` for `D-ARCH-002` as `Proposed`.
2. `TASK-DOC-ADR-004` Draft `docs/adr/ADR-0003-api-architecture.md` for `D-ARCH-003` as `Proposed`.
3. `TASK-DOC-ADR-005` Draft `docs/adr/ADR-0004-authentication-strategy.md` for `D-ARCH-004`; provider/session choice may remain unresolved until evidence is sufficient.
4. `TASK-DOC-ADR-006` Draft `docs/adr/ADR-0005-managed-backend-platform.md` for `D-ARCH-013`.
5. `TASK-DOC-ADR-007` Draft `docs/adr/ADR-0006-background-job-runner.md` for `D-ARCH-007`.

Created but not accepted:

```text
ADR-0001-use-monorepo.md  D-ARCH-001  Proposed
```

Related decisions such as `D-ARCH-006` API deployment topology, `D-SEC-008` RLS strategy, hosting, object storage, frameworks, package manager, and providers should receive separate ADRs when their evidence/priority justifies creation.

## Domain Architecture

After the foundational architecture/ADR baseline is coherent enough to avoid redefining domain ownership:

- Identity
- Members
- Memberships
- Attendance
- Retention
- Payments/Renewals
- Add-ons
- Notifications
- Analytics/Audit

Only then document future domains such as Workout, Nutrition, Health, Coaching, and AI in detail unless product scope changes explicitly.

## Database + API

After domain ownership is documented:

- database overview
- schema design
- entities
- relationships
- indexing
- migrations
- retention
- API overview
- API conventions
- authentication
- endpoints
- errors
- pagination
- rate limits
- versioning

## Later Phases

- AI architecture
- Security and Privacy
- Infrastructure and DevOps
- Observability
- Testing
- Engineering standards
- Operations/runbooks
- MVP/phase roadmap
- cross-document consistency audit
