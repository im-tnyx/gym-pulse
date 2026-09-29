# ADR-0006: Managed Backend and Platform Responsibilities

## Status

`Proposed`

## Decision Metadata

- ADR: `ADR-0006`
- Primary Decision ID: `D-ARCH-014`
- Related Decision IDs: `D-ARCH-002`, `D-ARCH-017`, `D-ARCH-004`, `D-SEC-002`, `D-SEC-004`, `D-SEC-008`, `D-ARCH-010`, `D-ARCH-007`, `D-ARCH-006`, `D-ARCH-009`, `D-PROVIDER-006`, `D-SEC-001`, `D-ARCH-016`, `D-ARCH-019`, `D-DATA-007`
- Decision Owner: `Open`
- Technical Owner: `Architecture / Platform / Security`
- Date Proposed: `2026-09-06`
- Date Accepted: `Not accepted`
- Supersedes: `None`
- Superseded By: `None`

## 1. Context

GymPulse Phase 1 needs production-grade infrastructure for canonical persistence, authentication support, scheduled/background work, protected files when required, application hosting, observability, backups, and environment separation.

The architecture already establishes that infrastructure providers are supporting mechanisms, not owners of GymPulse business semantics.

The governing invariants are:

```text
Managed Infrastructure != Application Architecture
Managed Backend != Domain Layer
Provider Feature != Canonical Business Rule
```

Regardless of provider choice, GymPulse owns:

```text
product/business rules
domain state transitions
application use cases
principal resolution
tenant/resource resolution
named-capability authorization
payment verification semantics
payment business-effect idempotency
attendance correctness
membership entitlement rules
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

A managed platform may operate commodity infrastructure, but it must not become the place where these responsibilities are implicitly defined by provider roles, dashboards, client SDKs, functions, queues, or database policies.

The current architecture keeps clients outside the trusted business boundary:

```text
Client
  -> Trusted GymPulse Runtime
  -> Canonical Persistence
```

Direct browser/mobile access to canonical database mutation paths is therefore **not** introduced by this ADR merely because a platform offers a client SDK or Data API.

`D-ARCH-014` is currently `P0 OPEN`. This ADR creates a concrete proposal for review. The ADR status is `Proposed`; the canonical decision remains `OPEN` until the normal decision workflow records explicit approval or another canonical status change.

Several related technical directions remain unaccepted:

- `D-ARCH-002` proposes PostgreSQL.
- `D-ARCH-017` proposes a Drizzle-oriented SQL-transparent persistence strategy.
- `D-ARCH-016` proposes strict TypeScript with a supported Node.js LTS runtime.

This ADR therefore phrases platform implications conditionally and does not accept any of those decisions.

## 2. Requirements and Decision Drivers

### 2.1 Functional drivers

- `FR-IDENTITY-001` staff authentication
- `FR-IDENTITY-002` session termination/revocation semantics
- `FR-IDENTITY-003` verified member identity
- `FR-AUTHZ-001` tenant-scoped authorization
- `FR-AUTHZ-002` named capability enforcement
- `FR-AUTHZ-003` self-only member access
- `FR-AUTHZ-004` sensitive action attribution
- `FR-ATTENDANCE-003` exactly one canonical attendance effect
- `FR-ATTENDANCE-006` retry-safe attendance
- `FR-RETENTION-005` single active no-show case
- `FR-RENEWAL-007` renewal reminder stop conditions
- `FR-PAYMENT-002` verified provider evidence as payment truth
- `FR-PAYMENT-003` webhook authenticity
- `FR-PAYMENT-004` provider-event persistence
- `FR-PAYMENT-005` duplicate callback safety
- `FR-PAYMENT-006` exactly-once membership effect
- `FR-PAYMENT-007` exactly-once add-on effect
- `FR-NOTIFICATION-002` notification deduplication
- `FR-AUDIT-001` sensitive-action audit
- `FR-AUDIT-003` audit integrity
- `FR-CROSS-001` server-side canonical truth
- `FR-CROSS-002` idempotent critical effects
- `FR-CROSS-003` explicit tenant context
- `FR-CROSS-004` gym-local business time

### 2.2 Non-functional drivers

Security/privacy:

- `NFR-SECURITY-001` tenant isolation
- `NFR-SECURITY-002` least privilege
- `NFR-SECURITY-003` server-side authorization
- `NFR-SECURITY-004` secret protection
- `NFR-SECURITY-005` encryption in transit
- `NFR-SECURITY-006` data-at-rest protection
- `NFR-SECURITY-008` webhook verification
- `NFR-SECURITY-009` auditability
- `NFR-SECURITY-011` sensitive error minimization
- `NFR-PRIVACY-001` data minimization
- `NFR-PRIVACY-003` protected exports
- `NFR-PRIVACY-005` retention policy, currently Open
- `NFR-PRIVACY-006` future export/correction/deletion support

Reliability/availability:

- `NFR-RELIABILITY-001` idempotent critical mutations
- `NFR-RELIABILITY-002` payment exactly-once effect
- `NFR-RELIABILITY-003` retry-safe scheduled work
- `NFR-RELIABILITY-004` database-enforced invariants where practical
- `NFR-RELIABILITY-005` canonical server-side source of truth
- `NFR-RELIABILITY-008` reconciliation after provider/network interruption
- `NFR-AVAILABILITY-001` non-critical dependency isolation
- `NFR-AVAILABILITY-002` messaging degradation visibility
- `NFR-AVAILABILITY-003` job failure visibility/recovery
- `NFR-AVAILABILITY-004` automated backup and tested restore
- `NFR-AVAILABILITY-005` RPO/RTO remains Open

Maintainability/operations/observability:

- `NFR-MAINTAINABILITY-001` shared domain rules
- `NFR-MAINTAINABILITY-003` provider abstraction
- `NFR-MAINTAINABILITY-004` migration discipline
- `NFR-MAINTAINABILITY-005` documentation synchronization
- `NFR-MAINTAINABILITY-006` ADR governance
- `NFR-SCALABILITY-003` stateless horizontal evolution
- `NFR-SCALABILITY-004` queueable asynchronous work
- `NFR-SCALABILITY-005` no premature distributed architecture
- `NFR-OBSERVABILITY-001..007` structured diagnostics and correlation
- `NFR-OPERATIONS-001` separate environments
- `NFR-OPERATIONS-002` production secret separation
- `NFR-OPERATIONS-003` migration safety
- `NFR-OPERATIONS-004` release smoke validation
- `NFR-OPERATIONS-005` normal operations must not require developer intervention

### 2.3 Architecture-principle drivers

Especially relevant principles are:

- `ARCH-PRIN-001` Tenant Isolation by Design
- `ARCH-PRIN-002` Authentication and Authorization Are Separate Responsibilities
- `ARCH-PRIN-003` Capability-Based Permissions
- `ARCH-PRIN-004` Deterministic Server-Side Business Truth
- `ARCH-PRIN-005` Financial Correctness Before Convenience
- `ARCH-PRIN-006` Idempotent Critical Effects
- `ARCH-PRIN-007` Auditable Sensitive Mutations
- `ARCH-PRIN-010` Transactional Consistency for Correctness-Sensitive Changes
- `ARCH-PRIN-011` Async Side Effects Are Isolated From Canonical Transactions
- `ARCH-PRIN-012` Provider Abstraction at Integration Boundaries
- `ARCH-PRIN-013` Failure Visibility and Reconciliation
- `ARCH-PRIN-014` Observability by Design
- `ARCH-PRIN-015` Data Minimization and Purpose Separation
- `ARCH-PRIN-016` Secure Defaults and Least Privilege
- `ARCH-PRIN-018` No Premature Infrastructure
- `ARCH-PRIN-019` Evolution Through Explicit Decisions

## 3. Constraints and Assumptions

1. Platform products implement the GymPulse architecture; the architecture is not redesigned around a platform feature catalog.
2. Domain/application behavior stays executable from trusted API/runtime, worker, and tests without requiring proprietary function APIs.
3. Provider-specific SDKs and APIs remain behind infrastructure adapters or explicit integration boundaries.
4. Application authorization remains `principal + tenant/resource scope + named capability -> allow/deny` even when a provider supplies authentication, JWTs, or RLS tooling.
5. Direct client database mutation is not a baseline architecture. A future proposal for direct client access would require explicit security architecture and would materially increase the importance of `D-SEC-008`.
6. `D-ARCH-002` is `DECIDED`; PostgreSQL is accepted as the canonical transactional database engine. This ADR does not accept a managed PostgreSQL provider or exact production version.
7. `D-ARCH-017` remains `PROPOSED`; this ADR does not accept Drizzle or another query/migration tool.
8. `D-ARCH-004`, `D-SEC-002`, and `D-SEC-004` remain `OPEN`; this ADR does not select staff/member authentication or session policy.
9. `D-SEC-008` remains `OPEN`; RLS compatibility may be evaluated but production RLS policy is not selected here.
10. `D-ARCH-010` remains `OPEN`; object storage is conditional until a real Phase 1 file requirement exists.
11. `D-ARCH-007` remains `OPEN`; queues/cron/job products remain candidates only.
12. `D-ARCH-006` and `D-ARCH-009` remain `OPEN`; application/API/worker deployment and hosting are separate decisions.
13. `D-PROVIDER-006` remains `OPEN`; provider-native infrastructure logs do not replace application observability.
14. `D-SEC-001` remains `OPEN`; provider/region approval is conditional on launch jurisdiction, residency, support/admin access, contractual, and backup-location requirements.
15. `D-DATA-007` remains unresolved; this ADR does not create Member/Membership schema, lifecycle constraints, entitlement policies, or RLS policies derived from unresolved lifecycle state.
16. Managed services may reduce operational toil but do not transfer GymPulse responsibility for recovery procedures, tenant correctness, secrets, audit semantics, or incident readiness.
17. Provider cost is evaluated qualitatively because pricing and plan entitlements change frequently.

## 4. Responsibility Model

### 4.1 Capability ownership matrix

| Capability | Needed Phase 1? | Managed service appropriate? | GymPulse owns semantics? | Separate canonical decision | Recommended posture |
|---|---|---|---|---|---|
| Canonical database hosting | Yes; engine category is approved | Yes | Yes: schema/business transactions/invariants | `D-ARCH-002` | **Strong managed-service candidate** for accepted PostgreSQL; provider remains unselected |
| Authentication service | Yes | Yes | Yes: principal mapping and authorization remain GymPulse-owned | `D-ARCH-004` | **Candidate only**, to be decided by auth ADR |
| Session management | Yes | Yes | Yes: required revocation/lifetime policy remains GymPulse-governed | `D-ARCH-004`, `D-SEC-004` | **Candidate only**, pending explicit session design |
| Member OTP/passwordless | Verified identity is required; method Open | Yes | Yes: member identity mapping/self scope remain GymPulse-owned | `D-SEC-002` | **Deferred to member-auth decision** |
| Object storage | Conditional | Yes | Yes: tenant ownership, business metadata, authorization and retention | `D-ARCH-010` | **Do not enable by default**; evaluate when receipts/exports/protected files require it |
| RLS / data policies | Defense-in-depth only; not baseline authority | Platform support can help | Yes: tenant semantics and authorization policy remain GymPulse-owned | `D-SEC-008` | **Compatibility required; adoption deferred** |
| Durable queues | Async work required; exact mechanism Open | Yes | Yes: dedupe, current-state recheck, retry classification and business effects | `D-ARCH-007` | **Eligible candidate only** for later job ADR |
| Cron / scheduling | Scheduled workflows required | Yes | Yes: qualification/business-time rules | `D-ARCH-007` | **Eligible candidate only** for later job ADR |
| Server/Edge Functions | Not intrinsically required | Sometimes | Yes: application/domain behavior | `D-ARCH-006`, `D-ARCH-009` | **Optional integration/runtime helper**, not the default domain/application host |
| Realtime | No confirmed Phase 1 requirement | N/A | Any business semantics would remain GymPulse-owned | No dedicated decision today | **Not a baseline dependency** |
| Application/API/worker hosting | Yes | Yes | Yes: runtime/application behavior | `D-ARCH-006`, `D-ARCH-009` | **Keep separate from managed-backend selection** |
| Observability | Yes | Yes | Yes: correlation/business diagnostics semantics | `D-PROVIDER-006` | Platform-native logs are **supplemental**, not the complete application observability solution |
| Backups / PITR | Yes before production | Yes | Yes: recovery procedure, verification, RPO/RTO acceptance | `D-ARCH-002`, `D-SEC-001` plus NFRs | **Mandatory provider capability evaluation**; managed backup alone is insufficient |
| Connection pooling | Runtime-dependent, likely required | Yes | GymPulse owns safe connection/transaction usage | `D-ARCH-006`, `D-ARCH-009`, `D-ARCH-014` | **Validate provider pooling modes against final runtime topology** |

### 4.2 Responsibilities that may be managed

Commodity operational responsibilities are appropriate candidates for managed ownership when the provider meets security, residency, recovery, portability, and runtime requirements. Examples include:

- database provisioning and routine patching,
- database backup/PITR infrastructure,
- database connection pooling endpoints,
- authentication protocol/credential infrastructure once auth decisions are approved,
- protected object bytes once storage is required,
- durable queue/scheduler infrastructure once `D-ARCH-007` chooses a model,
- infrastructure-level logs/metrics,
- platform operational control plane.

GymPulse still owns the configuration, validation, access model, recovery runbook, and acceptance criteria for those managed capabilities.

### 4.3 Responsibilities that must remain GymPulse-owned

A managed provider must never become the authority for:

- tenant/gym/branch meaning,
- domain entities/state machines,
- named capabilities,
- business authorization,
- membership entitlement,
- attendance duplicate/eligibility rules,
- payment verification and business-effect uniqueness,
- no-show/follow-up/return logic,
- renewal rules,
- audit business semantics,
- data-quality semantics,
- gym-local time rules,
- external provider normalization,
- application transaction boundaries,
- client/server trust decisions,
- stable application error/failure mapping.

## 5. Options Considered

### Option A: Selective integrated managed backend

Use an integrated platform as the preferred place for **eligible commodity infrastructure**, but adopt each capability only after its own need and canonical decision are satisfied.

Supabase is the current representative integrated-platform candidate because current official documentation shows one project can provide a full PostgreSQL database plus optional Auth, Storage, RLS tooling, Edge Functions, Queues, Cron, Realtime, connection pooling, logs, local-development tooling, and backup/PITR capabilities.

This option explicitly does **not** mean "use every Supabase feature" or "select Supabase now".

Conceptually:

```text
Integrated managed platform
  -> managed database operations          strong candidate if DB direction is accepted
  -> Auth                                optional / separately governed
  -> Storage                             conditional / separately governed
  -> RLS tooling                         compatible / separately governed
  -> Queues + Cron                       later job candidates
  -> Functions                           optional helper/runtime only
  -> Realtime                            not baseline
  -> provider logs                       supplemental

GymPulse trusted runtime/domain/application architecture
  -> remains GymPulse-owned
```

### Option B: Managed database + independent specialist services

Use a managed relational database provider plus separately selected authentication, object storage, durable jobs, application hosting, and observability services.

Examples of provider categories include independent managed PostgreSQL services, dedicated auth providers, S3-compatible storage, dedicated task/job services, and independent application hosting.

This model reduces cross-capability platform coupling and allows best-fit substitution, but increases provider count, credentials, billing surfaces, incident paths, staging setup, and cross-provider operational coordination.

### Option C: Cloud-native composable services

Use one major cloud provider as the organizational/security boundary while assembling separate managed products for database, identity, storage, compute, queues/scheduling, secrets, and monitoring.

This can provide strong enterprise control, IAM/network integration, regional options, and mature operational primitives. It also introduces a larger cloud configuration/IAM/network surface and more platform engineering work than current Phase 1 evidence requires.

### Option D: Mostly self-managed infrastructure

Operate substantial infrastructure directly, such as self-managed database/runtime/queue/storage components on VMs/containers.

This maximizes operational control and can reduce some vendor API coupling, but GymPulse would own patching, upgrades, backup systems, restore tooling, failover, monitoring, capacity, vulnerability response, incident response, and much more configuration from Phase 1.

No current Phase 1 requirement justifies that operational burden.

## 6. Evaluation

### 6.1 Responsibility-model matrix

| Criterion | A: Selective integrated managed backend | B: Managed DB + independent services | C: Cloud-native composable | D: Mostly self-managed |
|---|---|---|---|---|
| Phase 1 operational simplicity | **Strong** | Moderate | Weak/Moderate | Weak |
| Fit if relational database direction is accepted | **Strong** | **Strong** | **Strong** | Strong technically, high ops cost |
| Provider coupling | Moderate; varies sharply by capability | Low/Moderate | Moderate/High to cloud primitives | Low API coupling, high operational coupling |
| Auth flexibility | Moderate/Strong if kept optional | **Strong** | Strong | Weak/Moderate; self-running auth is high risk |
| Storage flexibility | Moderate/Strong if conditional | **Strong** | Strong | Moderate with high ops burden |
| Job flexibility | Moderate; integrated queue/cron may constrain model | **Strong** | Strong | Strong technically, high ops burden |
| Security posture | Strong if privileged boundaries and platform account security are disciplined | Strong, but more secrets/providers | Strong, but IAM/network complexity rises | Highest responsibility burden on team |
| Tenant-isolation compatibility | Strong with application scoping and optional DB defense in depth | Strong | Strong | Strong if implemented correctly |
| Future RLS compatibility | Strong for PostgreSQL-oriented integrated platforms | Strong with compatible PostgreSQL | Strong with compatible PostgreSQL | Strong if team operates compatible PostgreSQL |
| Backup/recovery capability | Strong candidate capability; provider details/plan must be validated | Strong; provider-specific | Strong; provider-specific | Weakest operational burden profile |
| Application observability | Platform logs help but separate app telemetry still required | Flexible | Strong building blocks, more assembly | Entire stack team-owned |
| Local development | **Strong when platform offers local stack/standard DB access** | Moderate/Strong | Moderate | Moderate/Strong but costly to maintain |
| Environment separation | Strong with separate projects/environments and config discipline | Strong | Strong | Possible, highest setup burden |
| Exit/migration path | **Strong for standard Postgres; medium for Auth/queues/functions/storage policy metadata** | **Strongest overall** | Moderate | High data/control ownership but expensive |
| Regional flexibility | Provider-dependent; must pass `D-SEC-001` | **Strong across provider choices** | Strong inside cloud footprint | Depends on self-managed footprint |
| Cost predictability | Moderate; integrated quotas simplify some bills but bundle economics vary | Moderate; many bills/egress surfaces | Moderate/Weak without FinOps discipline | Infrastructure bill may look lower while engineering cost is high |
| Developer experience | **Strong if feature adoption stays disciplined** | Strong but more local/provider setup | Moderate | Weakest operations-to-feature ratio |
| Future scale | Strong for current evidence; capability split remains possible | Strong | Strong | Strong technically with highest team burden |
| Reversibility | Strong/Moderate if proprietary features are limited | **Strong** | Moderate | Moderate |
| Overall GymPulse Phase 1 fit | **Strongest current responsibility model** | Strong fallback | Moderate; likely premature | Weak |

### 6.2 Supabase capability posture from current evidence

Supabase is evaluated as a representative candidate, not selected as a provider.

| Supabase capability | GymPulse posture |
|---|---|
| PostgreSQL hosting | **Strong candidate** now that `D-ARCH-002` is DECIDED with PostgreSQL; standard Postgres connectivity and SQL remain important exit boundaries |
| Auth | **Candidate only** pending `D-ARCH-004`, `D-SEC-002`, `D-SEC-004`; provider identity must map to a GymPulse principal |
| Storage | **Conditional candidate** pending actual `D-ARCH-010` requirement; private access and tenant ownership remain GymPulse policy |
| RLS support | **Compatible defense-in-depth capability**, not authorization-system selection; `D-SEC-008` stays Open |
| Edge Functions | **Optional** for bounded integration/entry helpers; not a baseline domain/application host |
| Queues | **Eligible later candidate** for `D-ARCH-007`; queue delivery semantics never replace business idempotency |
| Cron | **Eligible later candidate** for `D-ARCH-007`; scheduling does not own no-show/renewal qualification logic |
| Realtime | **Not needed as a baseline** because no current Phase 1 requirement requires subscriptions/presence/broadcast |
| Operational tooling/logs | Useful infrastructure diagnostics; does not replace GymPulse request/job/payment correlation and business diagnostics |
| Local development/migrations | Useful capability evidence; adoption must remain consistent with `ADR-0005` migration governance if that ADR is later accepted |

### 6.3 Direct client database access

An integrated backend can make direct client-to-data APIs attractive. GymPulse should **not** adopt that access pattern as a side effect of platform selection.

Current default remains:

```text
Browser / Member Client
  -> Trusted GymPulse Runtime
      -> principal resolution
      -> tenant/resource scope
      -> named capability
      -> runtime/domain validation
      -> transaction/business rules
  -> Canonical Persistence
```

If a future use case proposes direct client reads or writes against canonical tables, it requires explicit architecture/security review. Direct canonical mutation would materially expand the assurance burden for:

- RLS policy completeness,
- JWT/session claim trust,
- resource authorization,
- negative cross-tenant tests,
- privileged/service-role paths,
- policy migration review,
- bypass behavior.

This ADR does not approve that pattern.

### 6.4 Vendor lock-in by capability

| Capability | Coupling level | Exit posture |
|---|---|---|
| Standard PostgreSQL schema/SQL/migrations | Low/Moderate | Preserve standard SQL/connectivity and tested dumps/restores; PostgreSQL-specific features are acceptable when correctness value justifies them |
| Managed DB operations/backup UI | Moderate | Document provider recovery/export procedures; provider tooling must not be the only copy of migration history |
| Auth identities/sessions/MFA/provider metadata | Medium/High | Keep GymPulse identity mapping separate; maintain migration/re-authentication strategy; do not use provider subject as every domain ID |
| Storage object API/policy metadata | Moderate | Prefer standard/S3-compatible transfer where practical; keep canonical business metadata in database |
| RLS/provider role conventions | Moderate | Keep application authorization independent; policy DDL version-controlled if later adopted |
| Queues/Cron | Moderate | Keep job payload/application handlers provider-neutral; make durable business dedupe live in canonical state where required |
| Edge/server functions | Medium/High | Keep function handlers thin; domain/application behavior portable to normal trusted runtime/worker |
| Realtime | High if used deeply in product state flow | Not baseline, so avoid coupling until a real requirement exists |
| Provider-native logs | Low | Application telemetry/correlation remains independent |

## 7. Proposed Decision

**Propose Option A: use a selective integrated managed-backend responsibility model for Phase 1, while adopting managed capabilities individually and preserving GymPulse ownership of all application/domain/security semantics.**

This is a responsibility-model proposal, not a vendor acceptance.

### 7.1 What the proposal means

1. Prefer managed services over self-operating commodity infrastructure where they reduce Phase 1 operational risk without weakening security/correctness or creating unjustified lock-in.
2. Because `D-ARCH-002` is accepted with PostgreSQL, prefer **managed PostgreSQL hosting** rather than self-managing the database for Phase 1, subject to the still-open provider/region/recovery/connection decisions.
3. Treat an integrated platform such as Supabase as a **strong candidate** because it can consolidate eligible infrastructure responsibilities, but do not enable capabilities merely because they are bundled.
4. Authentication remains a separate architecture/security decision. A managed-platform Auth component is an eligible candidate, not an outcome of this ADR.
5. Storage remains conditional and must not be provisioned until a requirement justifies it.
6. RLS remains separately governed under `D-SEC-008`; compatibility is valuable, but application authorization is mandatory regardless.
7. Queue/Cron capabilities remain candidates for `D-ARCH-007`; business retries/idempotency/current-state checks stay in GymPulse application/domain design.
8. Managed Edge/server functions are optional execution adapters/helpers, not a default location for domain logic.
9. Realtime is not a Phase 1 baseline dependency.
10. Application/API/worker hosting remains separate under `D-ARCH-006` and `D-ARCH-009`.
11. Provider-native logs/metrics supplement, but do not replace, GymPulse application observability under `D-PROVIDER-006`.
12. Direct browser/mobile canonical database mutation is not approved.
13. Every adopted managed capability needs a documented exit path and environment/secrets model.

### 7.2 Privileged-access rules

Any future provider implementation must enforce:

- privileged/service secret keys remain server-only,
- browser/mobile bundles never contain privileged credentials,
- migration/admin credentials are separated from normal application credentials where supported,
- worker credentials are scoped where practical,
- broad RLS-bypass credentials are not normal user-request execution authority,
- provider dashboard/account administrative access uses least privilege and MFA where available,
- support/admin access and sensitive configuration changes should be auditable,
- provider secrets are separated across development/test/staging/production.

### 7.3 Environment model

Any later managed-platform implementation must support isolated lifecycle environments:

```text
development / local
CI / test
staging
production
```

Separate, as applicable:

- data,
- provider projects/accounts,
- secrets,
- callback URLs,
- Auth users/test identities,
- storage objects,
- queues/schedules,
- function/runtime configuration,
- observability destinations.

Local emulation is useful where safe and reproducible, but GymPulse does not require every SaaS capability to be perfectly self-hosted locally if isolated provider test/sandbox environments provide safer evidence.

## 8. Security and Privacy Impact

### 8.1 Identity and authorization

A managed Auth provider may establish identity/session evidence, but the trust chain remains:

```text
Provider Identity / Session Evidence
  -> GymPulse Principal Resolution
  -> GymPulse tenant/resource scope
  -> GymPulse named-capability authorization
  -> domain/business rule
```

Provider roles/claims cannot become unrestricted business authorization.

### 8.2 Tenant isolation

Managed-platform tenancy does not replace GymPulse tenant semantics.

All protected operations must preserve explicit GymPulse organization/gym/branch/resource ownership in application execution and persistence queries. If database RLS is later adopted, it is defense in depth and must be tested for application, worker, migration/admin, support, and privileged bypass paths.

### 8.3 Privileged credentials and blast radius

An integrated platform can increase control-plane blast radius because one provider account may control database, Auth, Storage, functions, or other capabilities.

Mitigations include:

- least-privilege organization/project roles,
- MFA for administrative accounts where available,
- separate environment projects,
- server-only privileged keys,
- credential rotation procedures,
- audit-log review where the provider supports it,
- minimizing enabled capabilities,
- keeping provider-specific APIs out of domain code.

### 8.4 Data residency and privacy

`D-SEC-001` remains `OPEN`.

Provider approval must wait for evidence covering:

- launch jurisdiction,
- primary data region,
- backup/replica location behavior,
- contractual/privacy requirements,
- provider employee/support access model,
- export/deletion support,
- incident notification expectations,
- data-processing terms.

A region selector is a data-location control, not proof of legal compliance.

### 8.5 Storage security

If object storage becomes required:

- buckets/objects are private by default,
- access is tenant-scoped and server-authorized or granted through controlled short-lived access,
- privileged storage credentials remain server-only,
- file metadata/business ownership remains canonical in GymPulse,
- file type/size/malware-validation requirements are defined for the actual use case,
- retention/deletion follows explicit privacy/business decisions.

## 9. Reliability, Performance, and Scalability Impact

### 9.1 Managed does not mean failure-free

GymPulse must design for:

- database outage,
- Auth outage,
- storage outage,
- queue/scheduler outage,
- function/runtime outage,
- regional incident,
- provider API degradation,
- rate/quota exhaustion,
- connection exhaustion,
- backup/restore failure.

Non-critical managed feature failure must not corrupt canonical transactional truth.

Examples:

- telemetry failure does not roll back attendance,
- messaging failure does not change payment truth,
- storage failure does not create a paid receipt before payment is canonical,
- queue delivery does not replace payment/attendance business idempotency,
- Auth outage fails protected access safely but does not rewrite canonical business state.

### 9.2 Database recovery

Even when backups and PITR are provider-managed, GymPulse owns:

- documented restore procedure,
- restore to an isolated environment where supported,
- recovery validation checks,
- migration/application compatibility after restore,
- eventual RPO/RTO acceptance,
- periodic restore rehearsal.

`NFR-AVAILABILITY-004` is not satisfied by a dashboard checkbox alone.

### 9.3 Connection management

If a managed PostgreSQL platform is later selected, connection mode must match runtime topology.

Persistent API/worker processes, serverless requests, migrations, administrative tools, and test runners may require different direct/pooler modes. Transaction-pooling limitations, connection caps, prepared-statement behavior, and transaction pinning must be validated before hosting/runtime decisions are accepted.

### 9.4 Scale posture

The managed-platform model should follow normal evidence-driven scaling:

```text
right-sized managed database/runtime
  -> indexing/query optimization
  -> connection tuning
  -> compute/storage scaling
  -> read scaling where justified
  -> workload isolation where justified
  -> stronger distribution only with measured need
```

Realtime, Redis, distributed databases, extra queues, or platform functions are not added for hypothetical scale.

## 10. Operations and Observability Impact

### 10.1 Operational complexity

Option A reduces the number of baseline control planes and credentials **only when capability adoption stays selective**. Enabling every bundled service would recreate complexity inside one vendor and increase blast radius/coupling.

Operational review must account for:

- provider/project ownership,
- credentials and rotation,
- environment setup,
- backup/recovery,
- quota/capacity monitoring,
- incident escalation/support,
- migration/deployment sequencing,
- cost/usage monitoring,
- export/exit procedures.

### 10.2 Observability boundary

Platform-native database/Auth/Storage/function/queue logs can help diagnose infrastructure behavior.

GymPulse still requires application-level telemetry for:

- request/correlation IDs,
- job IDs and attempts,
- tenant-safe context,
- payment-provider event/effect diagnostics,
- authorization failure categories,
- business retry/dedupe outcomes,
- domain/application failures,
- external-provider adapter failures.

`D-PROVIDER-006` remains open. Platform-native logs do not decide the application observability provider.

### 10.3 Cost architecture

Cost should be evaluated as total operational cost, not only monthly infrastructure line items.

Compare:

- base platform/database compute,
- storage and backup retention,
- data egress,
- Auth message/OTP costs if used,
- function/compute usage,
- queue/scheduler usage,
- logging/retention volume,
- support tier,
- number of provider contracts/bills,
- engineering time for upgrades, backup, incidents, security, and local/staging setup.

No volatile price is made part of this ADR.

## 11. Testing and Validation

Before this ADR or any provider becomes an implementation gate, run non-production validation covering at least:

1. **Managed PostgreSQL connectivity** from representative trusted runtime and worker shapes if PostgreSQL remains the engine direction.
2. **Migration from zero** using the governed migration strategy, without platform-dashboard-only schema changes.
3. **Connection pooling** under likely persistent and/or serverless runtime patterns, including transaction behavior and connection exhaustion.
4. **Backup + restore rehearsal** to an isolated/non-production target, followed by invariant and application compatibility checks.
5. **Provider outage/degradation behavior** for database/Auth/storage/jobs as applicable; verify canonical state is not silently corrupted.
6. **Auth principal mapping proof** if platform Auth is considered: provider identity -> GymPulse identity/principal -> tenant/resource/capability authorization.
7. **Privileged/service secret isolation** with separate server/admin paths.
8. **Client-bundle secret-leak check** proving privileged keys, database credentials, migration/admin secrets, and server config cannot enter browser/mobile artifacts.
9. **RLS compatibility proof** in a disposable environment without adopting production RLS; test normal user, worker, migration/admin, and bypass behavior.
10. **Storage signed/private access proof** only if storage becomes a real requirement, including tenant/cross-tenant negative tests.
11. **Queue/Cron durability proof** only if the later jobs ADR considers platform capabilities; test retries, visibility, stale-condition recheck, and business dedupe.
12. **Environment separation** proving non-production cannot accidentally use production data/secrets/callback configuration.
13. **Data/provider exit rehearsal** covering database dump/restore and any adopted Auth/Storage/function/job metadata needed to move providers.
14. **Logs/diagnostics privacy test** proving infrastructure/application diagnostics do not leak tokens, privileged keys, raw payment payloads, or unnecessary PII.

No spike or provider project is created by this ADR.

## 12. Migration and Rollout

There is no managed-backend implementation to migrate today.

If this ADR and dependent decisions are later accepted, rollout should be capability-by-capability:

```text
approve provider/residency/recovery constraints
  -> provision isolated non-production environment
  -> validate database connectivity/recovery first if applicable
  -> apply version-controlled schema/migrations
  -> connect trusted server runtime through server-only credentials
  -> validate tenant/authorization boundaries
  -> adopt Auth only after auth/session ADR
  -> adopt Storage only after storage requirement/ADR
  -> adopt Queue/Cron only after jobs ADR
  -> add production environment after backup/restore and security gates pass
```

Do not allow dashboard configuration to become an undocumented source of truth. Where a provider supports configuration-as-code, migrations, CLI configuration, or exported settings, capture the reproducible subset in the repository during implementation governance.

Application deployment and platform/database change sequencing remain under later hosting/CI decisions.

## 13. Reversibility and Exit Strategy

A managed-platform choice is acceptable only with a realistic exit path.

### 13.1 Database

If PostgreSQL is accepted, preserve standard connection and SQL/migration history where practical. A future provider change should be supportable through database dump/restore or equivalent provider-supported migration paths plus verification.

### 13.2 Authentication

Auth migration is materially harder than database hosting migration because identities, password hashes, MFA factors, sessions, provider links, token signing, rate limits, and recovery behavior may be provider-specific.

Mitigations:

- maintain GymPulse identity/principal mapping separate from provider subject IDs,
- avoid provider role claims as domain authorization,
- document export/import capability before production adoption,
- design reauthentication/session invalidation as an explicit migration possibility.

### 13.3 Storage

Keep canonical object ownership/business metadata in GymPulse persistence. Prefer standard/S3-compatible bulk transfer where the chosen provider supports it. Signed URL and provider policy semantics are not portable business contracts.

### 13.4 Queues/Cron

Job payloads and application handlers remain provider-neutral. Durable business idempotency/effect records remain canonical where required. A queue provider should be replaceable without rewriting no-show, renewal, payment, or notification business rules.

### 13.5 Functions

Provider functions remain thin adapters/helpers. Core application/domain logic must remain reusable outside the proprietary function runtime. If a function runtime is adopted, source and required environment/configuration must be version-controlled.

### 13.6 Realtime

Realtime is not a Phase 1 baseline dependency, so no exit burden should be created yet.

## 14. Risks and Mitigations

### Risk: integrated platform becomes the application architecture

Mitigations:

- preserve internal ports/adapters,
- keep domain/application code provider-independent,
- prohibit provider SDK objects in domain contracts,
- review each capability through its canonical decision.

### Risk: provider Auth roles/JWT claims become GymPulse authorization

Mitigations:

- always resolve a GymPulse principal,
- load GymPulse scope/capability assignments,
- test cross-tenant/negative authorization independently of provider role metadata.

### Risk: direct client database access bypasses trusted runtime

Mitigation:

- retain server-mediated canonical access by default,
- require explicit security ADR before direct access,
- treat direct access as raising `D-SEC-008` assurance requirements.

### Risk: privileged key or RLS-bypass role leaks to client

Mitigations:

- server-only credential storage,
- build/import boundary checks,
- separate application vs admin/migration secrets,
- client-bundle scans,
- rotation/revocation procedure.

### Risk: one provider account increases blast radius

Mitigations:

- enable only justified capabilities,
- use least-privilege platform access/MFA,
- isolate environments,
- preserve independent application authorization,
- document recovery/exit paths.

### Risk: managed backups create false confidence

Mitigations:

- verify backup coverage/retention/PITR before production,
- rehearse restore,
- define recovery checks/RPO/RTO later,
- maintain export path where appropriate.

### Risk: integrated queue/cron semantics are mistaken for business idempotency

Mitigation:

- keep deterministic business keys, uniqueness/effect records, current-state rechecks, and reconciliation inside GymPulse architecture.

### Risk: platform-specific functions fragment business logic

Mitigations:

- functions are adapters/entry points only,
- application/domain code remains callable from normal runtime/worker/tests,
- no duplicated domain rules in function-only code.

### Risk: provider region does not satisfy launch obligations

Mitigation:

- keep provider recommendation conditional on `D-SEC-001`, contractual review, backup/data-location evidence, and support/admin access review.

## 15. Open Questions

- Who is the authorized decision owner for `D-ARCH-014`?
- What launch jurisdiction/data-residency obligations will be approved under `D-SEC-001`?
- If PostgreSQL is accepted, which managed PostgreSQL/platform provider best meets region, backup/PITR, restore, support, connection, and exit requirements?
- What RPO/RTO targets will be approved?
- Will the authentication ADR choose a managed-platform Auth component or an independent identity provider?
- What staff and member session/recovery requirements constrain Auth-provider choice?
- Does Phase 1 require persisted file objects beyond canonical receipt metadata/exports?
- Will `D-SEC-008` adopt RLS as defense in depth, and how will application/worker/migration/admin/support roles behave?
- Which job architecture will `D-ARCH-007` select, and do integrated queue/cron capabilities satisfy its retry/visibility/recovery requirements?
- Which application/API/worker hosting topology will `D-ARCH-006` and `D-ARCH-009` select?
- Which provider-native logs are useful enough to retain versus duplicative of the later observability stack?
- What provider exit rehearsal frequency is appropriate before production?

## 16. Decision Evidence

### 16.1 Repository evidence

This proposal is derived from current canonical GymPulse requirements and architecture, especially tenant isolation, server-owned authorization/business truth, provider abstraction, transaction/idempotency correctness, dependency isolation, backup/restore, observability, environment separation, and the rule that managed infrastructure does not own domain/application semantics.

No repository evidence requires direct-client database access, realtime subscriptions, one provider for every capability, self-managed infrastructure, or platform-specific functions as the baseline runtime.

### 16.2 Current official provider research

Research date: `2026-09-06`.

Supabase was checked as the representative integrated-platform candidate using current official documentation. Material observations used by this ADR:

- A Supabase project provides a full PostgreSQL database and exposes standard database connectivity; the platform also provides managed backups and optional PITR according to plan/capability configuration.
- Current connection guidance distinguishes direct connections and pooled modes, including transaction pooling for short-lived/serverless traffic; transaction-pooling constraints must be validated with the selected data-access/runtime stack.
- Supabase Auth provides configurable authentication/session capabilities, but this does not establish GymPulse authorization semantics.
- Supabase RLS uses PostgreSQL roles/policies; privileged secret/service-role access can bypass RLS and must remain server-only.
- Supabase Storage supports private-access patterns and an S3-compatible interface, giving a plausible bulk export/transfer path, while access policies and metadata remain provider-specific concerns.
- Supabase Queues is PostgreSQL/`pgmq` based and Supabase Cron is `pg_cron` based; both are credible candidates for later job evaluation, but their delivery/scheduling mechanics do not replace GymPulse business idempotency.
- Edge Functions are TypeScript on a Deno-compatible runtime and can run locally; they are technically credible helpers but would introduce a runtime/platform boundary if used as the application architecture.
- Realtime provides Broadcast, Presence, and database-change subscriptions, but no current GymPulse Phase 1 requirement requires it.
- Supabase provides provider-level logs and local-development/migration tooling, useful as infrastructure evidence but not a substitute for GymPulse application telemetry or `ADR-0005` governance.
- Supabase supports specific project regions and states that region selection controls primary project data location; final legal/residency suitability remains a separate GymPulse decision.
- Database and Auth data have documented export/migration paths; Storage exposes S3-compatible and bulk-download/migration paths. Exit complexity remains materially higher for identity/session/provider-policy semantics than for standard PostgreSQL data.

Primary official references:

- <https://supabase.com/docs/guides/database/overview>
- <https://supabase.com/docs/guides/database/connecting-to-postgres>
- <https://supabase.com/docs/guides/platform/backups>
- <https://supabase.com/docs/guides/platform/regions>
- <https://supabase.com/docs/guides/auth/sessions>
- <https://supabase.com/docs/guides/auth/general-configuration>
- <https://supabase.com/docs/guides/database/postgres/row-level-security>
- <https://supabase.com/docs/guides/storage>
- <https://supabase.com/docs/guides/storage/s3/compatibility>
- <https://supabase.com/docs/guides/queues>
- <https://supabase.com/docs/guides/cron>
- <https://supabase.com/docs/guides/functions>
- <https://supabase.com/docs/guides/realtime>
- <https://supabase.com/docs/guides/monitoring-and-debugging/logs>
- <https://supabase.com/docs/guides/local-development/cli-workflows>
- <https://supabase.com/docs/guides/local-development/database-migrations>
- <https://supabase.com/docs/guides/auth/managing-user-data>
- <https://supabase.com/docs/guides/troubleshooting/migrating-auth-users-between-projects>

### 16.3 Missing acceptance evidence

This ADR remains `Proposed` and `D-ARCH-014` remains `OPEN` because:

- no authorized decision owner/approval evidence exists,
- launch jurisdiction and residency obligations remain unresolved,
- PostgreSQL is accepted as the canonical database engine, while the managed provider remains open,
- no managed provider has passed a connection/pooling/recovery/region/exit spike,
- authentication/session/member-auth decisions remain Open,
- no RLS role/bypass model is approved,
- no jobs/queue/scheduler decision is approved,
- no hosting topology is approved,
- no provider account security/incident/support review has been performed,
- no provider exit rehearsal has been performed.

## 17. Related Documents

- `../00-overview/assumptions.md`
- `../01-product/functional-requirements.md`
- `../01-product/non-functional-requirements.md`
- `../02-architecture/architecture-principles.md`
- `../02-architecture/architecture-overview.md`
- `../02-architecture/system-context.md`
- `../02-architecture/container-architecture.md`
- `../02-architecture/component-architecture.md`
- `../02-architecture/data-flow.md`
- `../02-architecture/technology-stack.md`
- `ADR-0001-modular-monolith.md`
- `ADR-0002-primary-language-runtime.md`
- `ADR-0003-monorepo-strategy.md`
- `ADR-0004-database-engine.md`
- `ADR-0005-data-access-migration-strategy.md`
- `README.md`
- legacy migration evidence if later needed: `../05-system-architecture.md`
- legacy migration evidence if later needed: `../08-automations.md`
- legacy migration evidence if later needed: `../10-notifications-whatsapp.md`
- legacy migration evidence if later needed: `../12-security-audit.md`
- legacy migration evidence if later needed: `../15-engineering-workflow.md`
- legacy migration evidence if later needed: `../16-open-decisions.md`
