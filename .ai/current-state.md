# GymPulse Current State

## Project

`GymPulse` (`im-tnyx/gym-pulse`)

## Current Documentation Phase

`Phase 4 - System Architecture / Architecture Governance`

## Canonical Architecture Completed at Draft Level

```text
docs/02-architecture/architecture-principles.md
docs/02-architecture/architecture-overview.md
docs/02-architecture/system-context.md
docs/02-architecture/container-architecture.md
docs/02-architecture/component-architecture.md
docs/02-architecture/data-flow.md
docs/02-architecture/technology-stack.md
docs/adr/README.md
```

## Current ADR State

```text
ADR-0001  D-ARCH-005  Phase 1 architecture style               Proposed
ADR-0002  D-ARCH-016  Primary language/runtime                 Proposed
ADR-0003  D-ARCH-001  Repository/workspace strategy            Proposed
ADR-0004  D-ARCH-002  Canonical database engine                Proposed
ADR-0005  D-ARCH-017  Data access/query/transaction/migrations Proposed
ADR-0006  D-ARCH-014  Managed backend/platform responsibilities Proposed
```

No authorized approval evidence exists for these ADRs. None is `Accepted`.

Canonical decision status remains controlled by `docs/00-overview/assumptions.md`:

```text
D-ARCH-005 remains PROPOSED
D-ARCH-016 remains PROPOSED
D-ARCH-001 remains PROPOSED
D-ARCH-002 remains PROPOSED
D-ARCH-017 remains PROPOSED
D-ARCH-014 remains OPEN
```

`ADR-0006` being `Proposed` does not itself change `D-ARCH-014` from `OPEN`.

## Current Managed Platform Position

`ADR-0006` proposes a **selective managed-backend responsibility model**.

The proposed posture is:

```text
Managed Infrastructure != Application Architecture
Managed Backend != Domain Layer
Provider Feature != Canonical Business Rule
```

A managed/integrated platform may be used for eligible commodity infrastructure, but capabilities are adopted individually rather than as an implicit bundle.

Current posture by capability:

```text
Managed database hosting   strong candidate if database engine direction is later accepted
Authentication             candidate only; D-ARCH-004 / D-SEC-002 / D-SEC-004 remain separate
Object storage             conditional; D-ARCH-010 remains OPEN
RLS/data policies          compatibility useful; D-SEC-008 remains OPEN
Queues/Cron                later candidates only; D-ARCH-007 remains OPEN
Edge/server functions      optional bounded adapters/helpers, not domain architecture
Realtime                   not a Phase 1 baseline dependency
Application/API hosting    separate under D-ARCH-006 / D-ARCH-009
Observability              platform-native diagnostics supplemental; provider remains OPEN
Backups/PITR               provider capability required, but GymPulse owns restore/recovery verification
Connection pooling         must be validated against eventual runtime/hosting topology
```

Supabase is a strong integrated-platform candidate used as current official capability evidence. It is **not accepted or provisioned**.

Direct browser/mobile canonical database mutation is not approved. Default trust flow remains:

```text
Client
  -> Trusted GymPulse Runtime
  -> Canonical Persistence
```

## Current Persistence Position

`ADR-0004` proposes PostgreSQL as the canonical transactional database engine. PostgreSQL is not accepted.

`ADR-0005` proposes, conditionally on compatible final runtime/database decisions, a Drizzle-oriented SQL-transparent TypeScript persistence strategy with explicit application-owned transactions and committed/reviewed SQL migrations. Drizzle is not installed or accepted.

`D-ARCH-002` and `D-ARCH-017` both remain `PROPOSED`.

## D-DATA-007 State

`D-DATA-007` remains `P1 PROPOSED` and unresolved.

Platform responsibility decisions can proceed independently, but final Member/Membership schema, lifecycle constraints, entitlement queries/policies, state-machine migrations, and lifecycle-derived RLS policies must not be finalized until state ownership is resolved.

No change was made to `FR-MEMBER-004` or `FR-MEMBERSHIP-002`.

## Important Architecture Boundaries

- Clients are untrusted for canonical business truth.
- Authentication evidence and GymPulse authorization remain separate responsibilities.
- Protected operations require verified principal + tenant/resource scope + named capability.
- Provider identity/roles/claims do not become canonical GymPulse business authorization.
- Application handlers own cross-domain orchestration and correctness-sensitive local transaction boundaries.
- Domain modules own business rules/state transitions; managed platform features do not own domain semantics.
- Database constraints reinforce durable invariants but do not replace domain/application rules.
- Request idempotency, provider-event dedupe, job dedupe, and business-effect uniqueness remain distinct.
- External provider calls do not participate in long local database transactions.
- Background execution reuses the same application/domain rules as interactive flows.
- Tenant scope remains explicit in application and persistence paths.
- Privileged/service-role credentials are server-only and must not appear in browser/mobile bundles.
- Broad provider/RLS bypass credentials must not become normal user-request execution authority.
- Platform-native logs do not replace request/job/payment correlation and application diagnostics.
- Managed backups do not remove GymPulse responsibility for restore procedures, restore rehearsal, and recovery acceptance.
- `D-SEC-001` jurisdiction/privacy remains a prerequisite for final provider/region approval.

## Technology Governance State

Key unresolved decisions include:

```text
D-ARCH-001  repository strategy                  P0 PROPOSED / ADR-0003 drafted
D-ARCH-002  database engine                      P0 PROPOSED / ADR-0004 drafted
D-ARCH-003  API contract architecture            P0 PROPOSED
D-ARCH-004  authentication/session               P0 OPEN
D-ARCH-005  architecture style                   P1 PROPOSED / ADR-0001 drafted
D-ARCH-006  API deployment topology              P1 OPEN
D-ARCH-007  background jobs                      P1 OPEN
D-ARCH-009  hosting                              P1 OPEN
D-ARCH-010  object storage                       P1 OPEN
D-ARCH-011  package manager                      P1 ASSUMED
D-ARCH-012  Owner/Staff web framework            P0 PROPOSED
D-ARCH-013  member client strategy               P1 PROPOSED
D-ARCH-014  managed backend responsibilities     P0 OPEN / ADR-0006 drafted
D-ARCH-015  authorization implementation         P0 PROPOSED
D-ARCH-016  primary language/runtime             P0 PROPOSED / ADR-0002 drafted
D-ARCH-017  data access/migrations               P1 PROPOSED / ADR-0005 drafted
D-ARCH-018  testing toolchain                    P1 PROPOSED
D-ARCH-019  CI/CD + release/secrets tooling      P1 OPEN
D-SEC-001   jurisdiction/privacy                 P0 OPEN
D-SEC-002   member authentication                P0 OPEN
D-SEC-004   session lifecycle                    P1 OPEN
D-SEC-008   RLS/data-layer isolation             conditional P0 OPEN
D-PROVIDER-001 payment provider                  P1 OPEN
D-PROVIDER-002 messaging provider                P1 OPEN
D-PROVIDER-006 observability provider            P1 OPEN
D-DATA-007  Member vs Membership state ownership P1 PROPOSED
```

`D-ARCH-008` Redis/cache/broker remains P2 OPEN and is not a baseline dependency.

## Task 0014 Implementation Status

Task `0014-draft-managed-backend-responsibilities-adr` completed documentation/governance work only.

Created:

```text
docs/adr/ADR-0006-managed-backend-responsibilities.md
.ai/task/0014-draft-managed-backend-responsibilities-adr.md
```

Updated:

```text
docs/adr/README.md
docs/README.md
.ai/current-state.md
```

Explicitly not created/selected:

```text
No Supabase/Neon/cloud project
No database instance
No Auth tenant/provider account
No storage bucket
No queue or Cron schedule
No Edge/server function
No RLS policy or database role model
No provider secret
No provider SDK installation
No application/API/worker code
No migration files or schema
No CI workflow
No deployment configuration
No managed provider accepted
No PostgreSQL acceptance
No Drizzle acceptance
No hosting selection
```

## Last Completed Task

`0014-draft-managed-backend-responsibilities-adr`

```text
ADR-0006 Status: Proposed
D-ARCH-014 canonical status: OPEN
```

No managed provider was provisioned or accepted.

## Current Task

None in progress.

## Next Task

Post-Task-0014 synchronization identifies the next bounded item in the current ADR dependency queue as:

```text
Task 0015: Draft Authentication / Session Architecture ADR
```

Primary canonical decision:

```text
D-ARCH-004
```

Likely target when explicitly started:

```text
docs/adr/ADR-0007-authentication-session-architecture.md
```

Initial ADR status should be `Proposed` while the canonical decision remains governed by `docs/00-overview/assumptions.md`.

The task should define staff/member-compatible authentication/session architecture, identity-evidence verification, GymPulse principal mapping, session expiry/revocation, secure credential/token handling, recovery/provider boundaries, and failure behavior.

It must preserve:

- `D-SEC-002` member authentication method as separately governed,
- `D-SEC-004` exact session lifecycle policy as separately governed where applicable,
- GymPulse-owned tenant/resource/capability authorization,
- no provider acceptance/provisioning without evidence.

Do not create ADR-0007 or implementation until Task 0015 is explicitly started.

## Files To Read Next

```text
.ai/README.md
.ai/current-state.md
.ai/task/0014-draft-managed-backend-responsibilities-adr.md
docs/README.md
docs/00-overview/assumptions.md
docs/01-product/functional-requirements.md
docs/01-product/non-functional-requirements.md
docs/02-architecture/architecture-principles.md
docs/02-architecture/architecture-overview.md
docs/02-architecture/system-context.md
docs/02-architecture/container-architecture.md
docs/02-architecture/component-architecture.md
docs/02-architecture/data-flow.md
docs/02-architecture/technology-stack.md
docs/adr/README.md
docs/adr/ADR-0006-managed-backend-responsibilities.md
```
