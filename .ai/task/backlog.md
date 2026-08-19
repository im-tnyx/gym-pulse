# Documentation Task Backlog

Tasks are ordered. Do not skip ahead unless a blocking dependency requires it.

## Architecture Governance

- `TASK-DOC-GOV-002` Normalize legacy decision IDs in existing structured architecture drafts before creating new downstream architecture.

## Architecture

After `TASK-DOC-GOV-002` is complete:

- `TASK-DOC-ARCH-005` Create `docs/02-architecture/component-architecture.md`
- `TASK-DOC-ARCH-006` Create `docs/02-architecture/data-flow.md`
- `TASK-DOC-ARCH-007` Create `docs/02-architecture/technology-stack.md`
- `TASK-DOC-ADR-001` Create ADR framework/index
- `TASK-DOC-ADR-002` Draft monorepo ADR
- `TASK-DOC-ADR-003` Draft PostgreSQL ADR
- `TASK-DOC-ADR-004` Draft API deployment ADR
- `TASK-DOC-ADR-005` Draft authentication ADR as `Proposed` if provider remains unresolved

## Domain Architecture

After architecture baseline is coherent:

- Identity
- Members
- Memberships
- Attendance
- Retention
- Payments/Renewals
- Add-ons
- Notifications
- Analytics/Audit

Only then document future domains such as Workout, Nutrition, Health, Coaching, and AI in detail.

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
- auth
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
