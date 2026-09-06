# Task 0014: Draft Managed Backend / Platform Responsibilities ADR

## Goal

Draft one `Proposed` ADR under canonical decision `D-ARCH-014` that determines which infrastructure/platform responsibilities GymPulse should delegate to managed services, which responsibilities remain GymPulse-owned, and how integrated managed-backend capabilities should be adopted selectively without allowing a provider to redefine application/domain architecture.

Canonical target:

`docs/adr/ADR-0006-managed-backend-responsibilities.md`

## Inputs Read

Current repository inputs:

- `.ai/README.md`
- `.ai/current-state.md`
- `.ai/task/0013-draft-data-access-migration-strategy-adr.md`
- `docs/README.md`
- `docs/00-overview/assumptions.md`
- `docs/01-product/functional-requirements.md`
- `docs/01-product/non-functional-requirements.md`
- `docs/02-architecture/architecture-principles.md`
- `docs/02-architecture/architecture-overview.md`
- `docs/02-architecture/system-context.md`
- `docs/02-architecture/container-architecture.md`
- `docs/02-architecture/component-architecture.md`
- `docs/02-architecture/data-flow.md`
- `docs/02-architecture/technology-stack.md`
- `docs/adr/README.md`
- `docs/adr/ADR-0001-modular-monolith.md`
- `docs/adr/ADR-0002-primary-language-runtime.md`
- `docs/adr/ADR-0003-monorepo-strategy.md`
- `docs/adr/ADR-0004-database-engine.md`
- `docs/adr/ADR-0005-data-access-migration-strategy.md`

Legacy files were not needed to resolve this bounded responsibility-model decision because current canonical architecture already contains the controlling boundaries. They remain migration/evidence sources only.

Current official Supabase documentation was checked on `2026-09-06` for database hosting/connectivity, backups/PITR, regions, Auth/session capability, RLS/service-role behavior, Storage/private/S3 access, Queues, Cron, Edge Functions, Realtime, logs, local development/migrations, and representative export/migration paths.

## Repository State Verified

Before creation:

- `docs/adr/ADR-0006-managed-backend-responsibilities.md` did not exist on latest `main`.
- `.ai/task/0014-draft-managed-backend-responsibilities-adr.md` did not exist.
- `D-ARCH-014` remained `P0 OPEN` in `docs/00-overview/assumptions.md`.
- `D-ARCH-014` was the next bounded item in the ordered ADR queue after `ADR-0005`.
- `ADR-0001` through `ADR-0005` remained `Proposed`; none was Accepted.
- `D-ARCH-002` remained `PROPOSED`; PostgreSQL remained a recommendation only.
- `D-ARCH-017` remained `PROPOSED`; Drizzle-oriented persistence remained a recommendation only.
- `D-ARCH-004`, `D-SEC-002`, `D-SEC-004`, `D-SEC-008`, `D-ARCH-007`, `D-ARCH-009`, and `D-ARCH-010` remained unresolved as recorded canonically.
- no authorized provider/platform approval evidence was found.

Actual repository state matched the Task 0014 instruction.

## Canonical Decision State

```text
D-ARCH-014
Priority: P0
Status: OPEN
Decision: whether GymPulse should use a managed backend platform and which infrastructure responsibilities it owns
```

`ADR-0006` is drafted as `Proposed`, but this task does not change the canonical decision register to `PROPOSED` or `DECIDED`.

## Capabilities Evaluated

Capability-by-capability evaluation covered:

- managed database hosting,
- authentication,
- session management,
- member OTP/passwordless identity verification,
- object storage,
- RLS/data-policy capability,
- durable queues,
- Cron/scheduling,
- server/Edge Functions,
- Realtime,
- application/API/worker hosting,
- infrastructure/application observability,
- backups/PITR,
- connection pooling.

Each capability was evaluated for Phase 1 need, managed-service suitability, GymPulse-owned semantics, provider portability, separate canonical governance, current recommendation, and blocking evidence.

## Responsibility Ownership Findings

Managed infrastructure can own commodity operational mechanisms, but GymPulse must always own:

```text
business/domain rules
state transitions
application use cases
principal resolution
tenant/resource resolution
named-capability authorization
payment verification semantics
payment business-effect idempotency
attendance correctness
membership entitlement
retention/no-show rules
transaction boundaries
provider abstraction
audit semantics
business-time semantics
data-quality rules
reconciliation semantics
runtime validation
failure mapping
```

The governing rules are:

```text
Managed Infrastructure != Application Architecture
Managed Backend != Domain Layer
Provider Feature != Canonical Business Rule
```

Direct browser/mobile canonical database mutation is not approved. The default remains `Client -> Trusted GymPulse Runtime -> Canonical Persistence`.

## Options Evaluated

1. **Selective integrated managed backend**: one integrated platform may host several eligible commodity capabilities, but each capability is enabled only after its own need/decision is approved.
2. **Managed database + independent specialist services**: managed database plus separately selected Auth, storage, jobs, hosting, and observability providers.
3. **Cloud-native composable services**: one major cloud provider with separate managed database, identity, storage, compute, queues, and monitoring products.
4. **Mostly self-managed infrastructure**: GymPulse operates more database/runtime/queue/storage infrastructure directly.

## Current Provider Research

Supabase was evaluated as the current representative integrated-platform candidate, not as an accepted provider.

Current official documentation supports treating these capabilities as technically credible candidates:

- managed PostgreSQL/database connectivity and managed backup/PITR capabilities,
- direct and pooled connection modes,
- Auth/session infrastructure,
- PostgreSQL RLS with privileged bypass paths that require strict server-only handling,
- private Storage and S3-compatible access,
- PostgreSQL-backed Queues and Cron,
- TypeScript/Deno-compatible Edge Functions,
- Realtime Broadcast/Presence/Postgres Changes,
- provider-level logs,
- local development/migration workflows,
- documented database/Auth/Storage export or migration paths.

The research did not establish that GymPulse should enable all of these capabilities. In particular, no current Phase 1 requirement establishes Realtime as a baseline dependency.

## Proposed Direction

`ADR-0006` proposes a **selective integrated managed-backend responsibility model** for Phase 1.

Meaning:

- prefer managed commodity infrastructure over self-operation where it reduces operational/security risk,
- if `D-ARCH-002` later accepts PostgreSQL, managed PostgreSQL hosting is a strong responsibility candidate,
- an integrated platform such as Supabase is a strong candidate for consolidated commodity infrastructure,
- each capability remains individually governed,
- the platform does not own GymPulse domain/application/security semantics,
- direct-client canonical database mutation is not approved,
- no provider is accepted by this task.

## Capabilities Recommended for Managed Ownership

Subject to their separate decisions and validation:

- database provisioning/patching/backups/PITR/connection infrastructure if the database direction is accepted,
- authentication protocol/credential infrastructure after the authentication/session decisions are approved,
- protected object bytes only when a real storage requirement is approved,
- durable queue/scheduler infrastructure after the jobs decision is approved,
- infrastructure-level operational logs/metrics,
- provider control-plane operations.

GymPulse retains configuration, access-control meaning, recovery runbooks, validation, and acceptance criteria for all of these.

## Capabilities Kept Separately Governed

```text
D-ARCH-002  canonical database engine             PROPOSED
D-ARCH-017  data-access/migrations                PROPOSED
D-ARCH-004  authentication/session                OPEN
D-SEC-002   member authentication                 OPEN
D-SEC-004   session lifecycle                     OPEN
D-SEC-008   RLS/data-layer isolation              OPEN when applicable
D-ARCH-010  object storage                        OPEN
D-ARCH-007  background jobs                       OPEN
D-ARCH-006  API deployment topology               OPEN
D-ARCH-009  hosting                               OPEN
D-PROVIDER-006 observability provider             OPEN
D-SEC-001   jurisdiction/privacy                  OPEN
```

No related decision was collapsed into `ADR-0006`.

## Capabilities Not Needed for Phase 1

- Realtime subscriptions/presence/broadcast are not a baseline dependency because no confirmed Phase 1 requirement requires them.
- Edge/server functions are not required as a baseline application/domain host; they remain optional bounded adapters/helpers.
- Object storage is not enabled merely because a platform includes it.
- Queues/Cron are not selected merely because the platform offers them.
- direct client database access is not introduced.

## Security Findings

- Provider identity/session evidence must always resolve through GymPulse principal/scope/capability authorization.
- Platform roles/JWT claims do not become GymPulse business authorization.
- Privileged/service-role keys remain server-only and must never enter browser/mobile bundles.
- Broad RLS-bypass credentials must not become normal user-request authority.
- Application, worker, migration/admin, support, and future direct-client database paths require separate privilege analysis.
- Integrated platforms increase provider-account/control-plane blast radius; mitigate with least privilege, MFA/admin security where supported, environment separation, minimum feature enablement, rotation, and audit review.
- `D-SEC-001` remains a blocker for final provider/region approval.

## Portability / Exit Findings

Lock-in differs by capability:

- standard PostgreSQL data/schema/migrations are relatively portable compared with provider-specific features,
- Auth identity/session/MFA/provider metadata creates higher migration coupling,
- Storage is moderately coupled; S3-compatible transfer can improve exit options but policy/signed-access semantics remain provider-specific,
- queues/Cron are manageable if job payloads/application handlers remain provider-neutral and durable business dedupe remains canonical,
- platform-specific functions create higher coupling unless kept as thin adapters,
- Realtime can create high product coupling and is therefore not introduced without evidence,
- provider-native logs are low-coupling supplements.

Every adopted managed capability requires a documented export/migration/fallback path.

## Decisions Kept Separate

This task does not accept or decide PostgreSQL, Drizzle, TypeScript/Node.js, Auth provider/method, session policy, RLS, storage, jobs, hosting, observability provider, API deployment, or jurisdiction/privacy policy.

`D-DATA-007` remains unresolved. No Member/Membership schema, lifecycle constraint, entitlement policy, or lifecycle-derived RLS policy was created.

## Requirement IDs Referenced

No requirement definition changed.

Functional requirements include:

- `FR-IDENTITY-001..003`
- `FR-AUTHZ-001..004`
- `FR-ATTENDANCE-003,006`
- `FR-RETENTION-005`
- `FR-RENEWAL-007`
- `FR-PAYMENT-002..007`
- `FR-NOTIFICATION-002`
- `FR-AUDIT-001,003`
- `FR-CROSS-001..004`

Non-functional requirements include:

- `NFR-SECURITY-001..006,008,009,011`
- `NFR-PRIVACY-001,003,005,006`
- `NFR-RELIABILITY-001..005,008`
- `NFR-AVAILABILITY-001..005`
- `NFR-MAINTAINABILITY-001,003..006`
- `NFR-SCALABILITY-003..005`
- `NFR-OBSERVABILITY-001..007`
- `NFR-OPERATIONS-001..005`

## Validation Required

Before acceptance/provider binding, run non-production validation for:

1. managed PostgreSQL connectivity,
2. migration from zero,
3. connection pooling under likely runtime patterns,
4. backup + restore rehearsal,
5. provider outage/degradation behavior,
6. Auth principal-mapping proof if platform Auth is considered,
7. service-role/privileged secret isolation,
8. client-bundle secret-leak checks,
9. future RLS compatibility proof without adopting RLS,
10. private/signed Storage access only if storage is required,
11. queue/Cron durability/retry/visibility proof only if later considered by `D-ARCH-007`,
12. environment separation,
13. database/Auth/Storage/provider exit rehearsal for adopted capabilities,
14. privacy-safe logs and diagnostics.

No validation spike was implemented in Task 0014.

## Files Changed

Created:

- `docs/adr/ADR-0006-managed-backend-responsibilities.md`
- `.ai/task/0014-draft-managed-backend-responsibilities-adr.md`

Continuity/index updates authorized for this task:

- `docs/adr/README.md`
- `docs/README.md`
- `.ai/current-state.md`

No other canonical file required modification because no contradiction was discovered.

## Open Questions

- Who is the authorized owner for `D-ARCH-014`?
- What jurisdiction/data-residency requirements will `D-SEC-001` establish?
- If PostgreSQL is later accepted, which managed provider best satisfies region, backup/PITR, connection, support, and exit requirements?
- What RPO/RTO targets will be approved?
- Will the auth/session ADR choose integrated-platform Auth or an independent identity provider?
- Does Phase 1 require persisted object files beyond database metadata/exports?
- Will RLS be adopted, and how will application/worker/migration/admin/support paths behave?
- Which queue/scheduling model will `D-ARCH-007` select?
- Which API/worker/application hosting topology will later decisions select?
- What provider exit-rehearsal cadence is appropriate before production?

## Result

`ADR-0006` now exists as a `Proposed` responsibility-model recommendation for selective managed infrastructure adoption.

`D-ARCH-014` remains canonically `OPEN`. No provider is accepted or provisioned.

`D-ARCH-002` and `D-ARCH-017` remain `PROPOSED`; PostgreSQL and Drizzle remain unaccepted recommendations.

No provider account, database instance, Auth tenant, bucket, queue, schedule, function, RLS policy, infrastructure configuration, provider SDK, application code, migration, CI workflow, or deployment configuration was created.

## Next Recommended Task

After index/current-state synchronization, re-check `docs/adr/README.md`, `docs/00-overview/assumptions.md`, and `.ai/current-state.md`.

If the dependency queue remains unchanged, the expected next bounded task is:

```text
Task 0015: Draft Authentication / Session Architecture ADR
Primary decision: D-ARCH-004
Likely target: docs/adr/ADR-0007-authentication-session-architecture.md
Initial status: Proposed
```

Do not create ADR-0007 during Task 0014.
