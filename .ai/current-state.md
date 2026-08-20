# GymPulse Current State

## Project

`GymPulse` (`im-tnyx/gym-pulse`)

## Current Documentation Phase

`Phase 4 - System Architecture / Architecture Governance`

## Canonical Documentation Completed

```text
docs/00-overview/   foundation complete at Draft v1.x
docs/01-product/    product definition complete at Draft v1.x
```

## Current Architecture Phase

Completed Draft architecture documents:

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

`technology-stack.md` is the current technology-evaluation view. It evaluates implementation candidates against the established C4/component/data-flow architecture without accepting any Open/Proposed/Assumed choice.

## Important Confirmed Boundaries

- Phase 1 is gym operations/retention, not a generic fitness super-app.
- Core loop: attendance -> inactivity risk -> follow-up -> return/outcome -> renewal -> verified payment -> optional add-on -> measurable result.
- Active Phase 1 human actors are Member, Owner, Manager, and Front Desk Staff.
- Trainer/Coach application users and platform-level roles remain Future.
- Tenant isolation and server-side authorization are mandatory.
- Capability-based permissions are the product authorization model.
- Authentication proves identity/session state; GymPulse still owns business authorization.
- Clients are untrusted for canonical business truth.
- Application command handlers own cross-domain orchestration and correctness-sensitive transaction boundaries.
- Domain modules own canonical state; arbitrary cross-domain direct writes are not allowed.
- Background execution reuses application/domain rules and remains scoped, retry-safe, and observable.
- Request idempotency, job dedupe, provider-event dedupe, and business-effect uniqueness are separate protections.
- Payment provider adapters verify/normalize evidence but cannot directly grant entitlement.
- Notification policy/intent is separate from messaging-provider delivery.
- Payment checkout/client success is not canonical payment success.
- Verified payment effect applies membership/add-on value exactly once through the owning domain.
- Gym-local timezone controls business-day/week rules; canonical event timestamps use UTC.
- External calls do not participate in local atomic transactions; retries/reconciliation handle uncertainty.
- Read models, telemetry, analytics, and data-quality views are non-authoritative for cross-domain writes.
- Future workout, advanced nutrition, health, coaching, multi-branch product workflows, and AI remain outside Phase 1.

## Current Architecture Model

### C4 Level 2 responsibilities

```text
Member Client Application
Owner / Staff Application
Trusted Application / API Runtime
Background Execution Runtime
Canonical Persistence
Protected Object Storage (conditional)
```

### C4 Level 3-style internal responsibilities

```text
Transport / Callback Entry
Authentication Verification
Principal Resolution
Tenant / Resource Resolution
Capability Authorization
Contract Validation
Application Commands / Queries
Phase 1 Domain Modules
Transaction / Unit of Work
Idempotency / Deduplication
Repositories / Data Access Ports
Provider Ports / Adapters
Audit
Domain/Application Events + Durable Continuation
Business Clock / Gym-Time
Scheduler / Jobs
Observability
```

## Technology Evaluation Summary

Current recommendations only, not accepted decisions:

```text
Primary language/runtime    TypeScript + supported Node.js LTS (Decision Register Gap)
Repository                 Monorepo with explicit boundaries; Turborepo candidate
Package manager            pnpm candidate
Owner/Staff web            Next.js + TypeScript candidate
Member Phase 1             Responsive web/PWA first if target-device QR/auth tests pass
Member native evolution    Expo / React Native when native requirements justify it
API contract               JSON HTTP + typed/runtime-validated contracts
API deployment             Co-hosted vs separate remains OPEN
Canonical database         PostgreSQL recommendation
Data access                SQL-aware typed layer; Drizzle/Kysely lead candidates, Prisma alternative
Managed backend            Supabase strong candidate by separable responsibility, not one indivisible bundle
Authentication             Managed auth preferred; provider/session/member method OPEN
Authorization              GymPulse-owned principal + scope + capability
RLS                        PostgreSQL RLS defense in depth where applicable; never authz replacement
Jobs                       Prefer Postgres-backed durable jobs/outbox for Phase 1 if PostgreSQL accepted
Redis                      Do not add without demonstrated requirement
Payments                   Razorpay/Cashfree sandbox shortlist; provider OPEN
Messaging                  WhatsApp-capable provider/BSP shortlist after channels/policy confirmed
Object storage             Conditional; do not provision before artifact need exists
Observability              Structured correlation + managed errors; OTel-compatible server instrumentation
Product analytics          Defer provider; non-canonical/privacy-minimized only
Testing                    TS unit/application + real PostgreSQL integration + Playwright web E2E candidate
Hosting                    Decide after API/jobs/managed backend/jurisdiction constraints
CI/CD                      GitHub-native candidate; production release/secrets decision gap remains
```

## Technology Decision Register Gaps

`technology-stack.md` identified material choices that currently lack canonical decision IDs:

```text
Primary implementation language/runtime       P0 suggested Architecture family
Data-access/query/migration strategy           P1 suggested Architecture/Data family
Core testing toolchain                         P1 engineering/architecture governance
CI/CD + production release/secrets tooling     P1 engineering/architecture/security governance
```

No IDs were invented and `docs/00-overview/assumptions.md` was not modified by Task 0007.

## D-DATA-007 Gate

`D-DATA-007` remains unresolved.

Do not finalize schema/state machines that duplicate `Paused/Expired/Cancelled` semantics across Member and Membership. The ambiguity affects:

```text
schema constraints
queries
authorization distinctions
attendance eligibility
retention/no-show eligibility
renewal
imports
reporting
```

Technology selection does not resolve it.

## API Deployment Boundary

`D-ARCH-006` remains `OPEN`.

Both mappings remain candidates:

```text
A. Owner/Staff web server runtime co-hosts trusted Application/API responsibilities
B. Owner/Staff UI and trusted Application/API are independently deployed
```

The same security/domain/transaction/idempotency/component boundaries must survive either mapping.

## Important Open P0/P1 Decisions

Read `docs/00-overview/assumptions.md` for canonical status.

High-impact current examples:

```text
D-ARCH-001  repository/monorepo strategy            P0 PROPOSED
D-ARCH-002  database engine                         P0 PROPOSED
D-ARCH-003  API contract architecture               P0 PROPOSED
D-ARCH-004  authentication/session                  P0 OPEN
D-ARCH-005  modular-monolith architecture style     P1 PROPOSED
D-ARCH-006  API deployment boundary                 P1 OPEN
D-ARCH-007  background jobs                         P1 OPEN
D-ARCH-009  hosting                                 P1 OPEN
D-ARCH-010  object storage                          P1 OPEN
D-ARCH-011  package manager                         P1 ASSUMED
D-ARCH-012  Owner/Staff web framework               P0 PROPOSED
D-ARCH-013  member client/framework strategy        P1 PROPOSED
D-ARCH-014  managed backend responsibilities        P0 OPEN
D-ARCH-015  authorization implementation boundary   P0 PROPOSED
D-SEC-001   launch jurisdiction/privacy obligations P0 OPEN
D-SEC-002   member authentication                   P0 OPEN
D-SEC-004   session lifecycle                       P1 OPEN
D-SEC-008   RLS/data-layer tenant isolation         conditional P0 OPEN
D-PROVIDER-001 payment provider                     P1 OPEN
D-PROVIDER-002 messaging provider                   P1 OPEN
D-PROVIDER-006 observability provider               P1 OPEN
D-DATA-007  Member vs Membership state ownership    P1 PROPOSED
```

`D-ARCH-008` Redis/cache/broker remains P2 OPEN and is not recommended as a baseline dependency.

## ADR Readiness

No decision ADR has been created or accepted.

ADR governance exists at:

`docs/adr/README.md`

After Decision Register Gap normalization, the recommended smallest first ADR batch is:

```text
D-ARCH-005  Phase 1 architecture style
D-ARCH-001  repository/workspace strategy
D-ARCH-002  canonical database engine
```

Provider ADRs should wait for pilot methods/channels and provider-specific evidence.

## Legacy Migration State

Legacy architecture/database/API/automation/payment/notification/security/testing/engineering/open-decision files remain migration inputs. None are deleted or Deprecated.

Important contradiction remains:

`docs/05-system-architecture.md` uses older `Accepted recommendations` wording for technologies that remain Proposed/Open in the canonical decision register. Canonical structured docs and decision statuses win.

## Last Completed Task

`0007-technology-stack.md`

Created:

```text
docs/02-architecture/technology-stack.md
.ai/task/0007-technology-stack.md
```

Updated:

```text
docs/README.md
.ai/current-state.md
```

No product requirements, canonical decision statuses, ADRs, application code, migrations, provider accounts, deployment configuration, or infrastructure were changed.

## Current Task

None in progress.

## Next Task

Task `0008-technology-decision-register-normalization`.

Canonical targets:

```text
docs/00-overview/assumptions.md
docs/adr/README.md
```

Working-context target:

```text
.ai/task/0008-technology-decision-register-normalization.md
```

Goal:

- add canonical decision entries for material technology gaps identified by Task 0007,
- reconcile ADR ordering/dependencies after technology evaluation,
- preserve Open/Proposed/Assumed status semantics,
- prepare the first ADR batch,
- accept no ADR and create no application scaffold.

Do not proceed automatically into ADR drafting or implementation in the same bounded task.

## Files To Read Next

```text
.ai/README.md
.ai/current-state.md
.ai/task/0007-technology-stack.md
docs/README.md
docs/00-overview/assumptions.md
docs/02-architecture/technology-stack.md
docs/adr/README.md
```
