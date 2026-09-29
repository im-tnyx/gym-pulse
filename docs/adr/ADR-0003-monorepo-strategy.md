# ADR-0003: Repository and Workspace Strategy

## Status

`Accepted`

## Decision Metadata

- ADR: `ADR-0003`
- Primary Decision ID: `D-ARCH-001`
- Related Decision IDs: `D-ARCH-005`, `D-ARCH-016`, `D-ARCH-003`, `D-ARCH-006`, `D-ARCH-007`, `D-ARCH-011`, `D-ARCH-012`, `D-ARCH-013`, `D-ARCH-017`, `D-ARCH-018`, `D-ARCH-019`, `D-ARCH-002`, `D-ARCH-015`, `D-SEC-008`
- Decision Owner: `santosh`
- Technical Owner: `Architecture`
- Date Proposed: `2026-08-30`
- Date Accepted: `2026-09-29`
- Approval Evidence / Reference: GitHub Issue #1 — https://github.com/im-tnyx/gym-pulse/issues/1
- Supersedes: `None`
- Superseded By: `None`

## 1. Context

GymPulse Phase 1 must keep several correctness-sensitive concerns synchronized while preserving explicit architecture boundaries. A typical product change can span:

```text
business rule
  + application use case
  + API/runtime contract
  + persistence migration
  + worker behavior
  + authorization policy
  + tests
  + documentation
```

Examples include attendance duplicate protection, payment exactly-once effects, membership entitlement, no-show lifecycle behavior, renewal stages, tenant authorization, notification deduplication, and gym-local time rules.

The repository/workspace decision determines how these source artifacts are organized, versioned, reviewed, tested, and evolved together. It does not determine how many production services exist or where they are deployed.

The following invariant is mandatory:

```text
Repository topology != Deployment topology
```

One repository may contain multiple independently buildable and independently deployable applications. Conversely, multiple repositories do not automatically imply microservices.

Current architecture already distinguishes conceptual runtime responsibilities for:

```text
Owner / Staff Application
Member Client Application
Trusted Application / API Runtime
Background Execution Runtime
Canonical Persistence
```

`D-ARCH-006` remains `OPEN`, so the Trusted Application/API responsibility may later be co-hosted with a web runtime or independently deployed. The repository strategy must support both outcomes without reorganizing domain meaning.

`D-ARCH-001` currently records an explicit monorepo with deliberate application/package boundaries as the leading direction. This ADR evaluates that direction rather than treating it as predetermined truth.

`ADR-0001` and `ADR-0002` remain independent `Proposed` decisions. This ADR must remain compatible with their proposed modular-boundary and TypeScript/Node.js directions without accepting them through repository structure.

## 2. Requirements and Decision Drivers

### 2.1 Primary non-functional drivers

- `NFR-SECURITY-001` tenant isolation
- `NFR-SECURITY-003` server-side authorization
- `NFR-SECURITY-004` secret protection
- `NFR-SECURITY-011` sensitive error minimization
- `NFR-RELIABILITY-001` idempotent critical mutations
- `NFR-RELIABILITY-002` payment exactly-once effect
- `NFR-RELIABILITY-003` scheduled job retry safety
- `NFR-RELIABILITY-004` database-enforced invariants where practical
- `NFR-RELIABILITY-005` canonical source of truth
- `NFR-SCALABILITY-002` modular boundaries before distributed services
- `NFR-SCALABILITY-003` horizontal evolution
- `NFR-SCALABILITY-004` separable asynchronous work
- `NFR-SCALABILITY-005` no premature microservices
- `NFR-MAINTAINABILITY-001` shared domain rules
- `NFR-MAINTAINABILITY-002` typed contracts
- `NFR-MAINTAINABILITY-003` provider abstraction
- `NFR-MAINTAINABILITY-004` migration discipline
- `NFR-MAINTAINABILITY-005` documentation synchronization
- `NFR-MAINTAINABILITY-006` ADR governance
- `NFR-TESTABILITY-001` deterministic domain tests
- `NFR-TESTABILITY-002` provider simulation
- `NFR-TESTABILITY-003` failure injection
- `NFR-TESTABILITY-004` authorization matrix tests
- `NFR-TESTABILITY-005` time-controlled tests
- `NFR-OPERATIONS-001` separate environments
- `NFR-OPERATIONS-002` production secrets separation
- `NFR-OPERATIONS-003` migration safety
- `NFR-OPERATIONS-004` release smoke tests

### 2.2 Functional correctness drivers

Repository synchronization directly affects these existing functional requirements:

- `FR-AUTHZ-001` tenant-scoped authorization
- `FR-AUTHZ-002` named capability enforcement
- `FR-ATTENDANCE-003` exactly one canonical attendance effect
- `FR-ATTENDANCE-006` retry-safe attendance
- `FR-RETENTION-005` one active no-show case per rule context
- `FR-RENEWAL-006` no membership extension on payment initiation
- `FR-PAYMENT-002` provider-verified payment truth
- `FR-PAYMENT-005` duplicate callback safety
- `FR-PAYMENT-006` exactly-once membership effect
- `FR-PAYMENT-007` exactly-once add-on effect
- `FR-NOTIFICATION-002` notification retry deduplication
- `FR-CROSS-001` server-side canonical truth
- `FR-CROSS-002` idempotent critical effects
- `FR-CROSS-003` explicit tenant context
- `FR-CROSS-004` gym-local timezone correctness

### 2.3 Architecture-principle drivers

The repository strategy must preserve:

- `ARCH-PRIN-001` Tenant Isolation by Design
- `ARCH-PRIN-004` Deterministic Server-Side Business Truth
- `ARCH-PRIN-006` Idempotent Critical Effects
- `ARCH-PRIN-009` Explicit Domain and State Ownership
- `ARCH-PRIN-010` Transactional Consistency for Correctness-Sensitive Changes
- `ARCH-PRIN-011` Async Side Effects Are Isolated From Canonical Transactions
- `ARCH-PRIN-012` Provider Abstraction at Integration Boundaries
- `ARCH-PRIN-016` Secure Defaults and Least Privilege
- `ARCH-PRIN-017` Modular Monolith Before Microservices, currently Proposed
- `ARCH-PRIN-018` No Premature Infrastructure
- `ARCH-PRIN-019` Evolution Through Explicit Decisions

## 3. Constraints and Assumptions

1. Repository organization must not decide deployment topology.
2. Domain, package, application, service, repository, and deployment are different concepts:

```text
Domain != Package
Package != Application
Application != Service
Service != Repository
Repository != Deployment
```

3. Logical Phase 1 domains such as Identity, Members, Memberships, Attendance, Retention, Renewals, Payments, Add-ons, Notifications, Audit, and Data Quality must not automatically become one package each.
4. Package boundaries should exist only when they enforce useful dependency, ownership, security, build, or reuse rules.
5. The repository must preserve the conceptual dependency direction:

```text
UI / Transport
      ↓
Application
      ↓
Domain

Infrastructure implements inward-facing ports used by application/domain.
```

6. Domain code must not depend on web frameworks, React, database ORM/driver objects, payment SDKs, messaging SDKs, job-runner objects, or hosting-specific APIs.
7. Client-safe code must never depend on privileged server infrastructure.
8. `D-ARCH-011` remains `ASSUMED`; this ADR may require workspace-capable package management but does not accept `pnpm` or any package manager.
9. A task orchestrator is not equivalent to a monorepo. Turborepo remains a candidate, not a consequence of this decision.
10. `D-ARCH-002` database engine remains `PROPOSED`; repository layout for migrations must remain database-technology neutral.
11. `D-ARCH-017` data-access tooling remains `PROPOSED`; this ADR does not choose Drizzle, Kysely, Prisma, or another persistence library.
12. `D-ARCH-018` test tooling remains `PROPOSED`; this ADR defines test placement/capabilities, not a final test framework.
13. `D-ARCH-019` CI/CD and release tooling remains `OPEN`; this ADR defines repository capabilities that future CI must support, not a CI provider.
14. `docs/` remains the canonical project documentation tree.
15. `.ai/` remains non-canonical AI working context and stays in the same repository for continuity during this phase.

## 4. Options Considered

### Option A: Explicit monorepo with deliberate application/package boundaries

Use one source repository containing identifiable application entry points, reusable/internal packages only where useful, build/tooling support, tests, documentation, and AI working context.

Conceptually:

```text
apps/
packages/
tooling/
tests/
docs/
.ai/
```

This is a conceptual architecture, not a folder scaffold approved by this ADR. Exact directories should be created only when implementation is authorized and the corresponding application/package actually exists.

Potential independently buildable application artifacts may include:

- Owner / Staff Web,
- Member Client,
- Trusted API Runtime if separately deployed,
- Background Worker Runtime,
- migration/administrative tooling where required.

The monorepo can support one or several deployment artifacts. It does not require one deployable or one release cadence.

### Option B: Multiple repositories by application/deployable

Split major applications/runtimes and reusable contracts into separate repositories, for example:

```text
gym-pulse-web
gym-pulse-api
gym-pulse-worker
gym-pulse-member
shared-contracts
```

Typical consequences include:

- repository-level ownership and access boundaries,
- independent versioning/release workflows,
- explicit publication/versioning for shared contracts and libraries,
- multi-repository changes for cross-cutting correctness work,
- greater risk of temporary version skew between contracts, migrations, workers, and applications unless release coordination is strong.

### Option C: One repository without deliberate reusable package/module boundaries

Keep all code in one repository but organize primarily by convenience or application folders without explicit dependency ownership.

Typical characteristics include:

- broad relative imports between unrelated concerns,
- generic `shared/`, `common/`, or `utils/` dumping grounds,
- client/server code mixed without structural barriers,
- routes/workers importing database/provider implementations directly,
- domain logic duplicated or coupled to application/framework code,
- one repository history but weak architecture enforcement.

This option gets some atomic-change benefits of one repository while losing the architectural and security benefits of a deliberately governed monorepo.

## 5. Evaluation

| Criterion | Option A: Explicit monorepo | Option B: Multiple repositories | Option C: Unstructured single repo |
|---|---|---|---|
| Domain ownership | Strong if boundaries are explicit | Strong if repos align well, but can over-map domain to deployable | Weak/implicit |
| Application-layer boundaries | Strong through dependency rules | Strong per repo, cross-repo contracts add overhead | Weak |
| Shared business rules | Strong, one versioned source | Requires package publication or duplication avoidance | High duplication/coupling risk |
| Shared API/runtime contracts | Strong with intentional client-safe contracts | Explicit versioning required across repos | Easy to import internals accidentally |
| Runtime validation contracts | Can be versioned with callers/handlers atomically | Version skew must be managed | Often coupled to framework code |
| Migration coordination | Strong atomic code + migration review | Multi-repo release coordination required | Same repo but ownership unclear |
| Worker coordination | Strong shared application/domain behavior | Shared library or network contract/versioning required | High duplicate worker-rule risk |
| Provider adapter isolation | Strong with server-only package rules | Strong by repo if disciplined | High leakage risk |
| Authorization consistency | Strong reusable application policy | Requires package/version coordination | High scattered-policy risk |
| Tenant isolation consistency | Strong dependency/test enforcement | Strong possible, but repeated integration/version work | High inconsistency risk |
| Payment correctness changes | Strong atomic payment + membership + migration + tests + docs changes | Often spans repositories/releases | Same repo but weak ownership can still corrupt boundaries |
| Attendance correctness changes | Strong atomic request/worker/domain/test changes | Multi-repo synchronization burden | Duplicate logic likely |
| Atomic cross-cutting change sets | Strongest | Weakest unless mature multi-repo release tooling exists | Strong repository atomicity, weak architecture atomicity |
| Client-safe/server-only separation | Strong if structural rules are mandatory | Natural separation between client/server repos, shared repo still risky | Weakest |
| Secret leakage risk | Manageable with explicit boundaries/checks | Lower across fully separate repos, but shared packages still require care | Highest |
| Dependency-cycle visibility | Strong with workspace graph | Cross-repo cycles can be organizational/version cycles | Poor if imports are unconstrained |
| Domain/application tests | Strong local reuse | More setup for shared integration tests | Possible but prone to broad brittle tests |
| CI affected scope | Strong potential | Naturally repo-scoped | Usually whole-repo or ad hoc |
| Independent builds | Supported by app/package graph | Strong | Possible but often poorly isolated |
| Independent deployments | Supported; repository does not prevent it | Strong | Possible but implicit |
| Rollback coordination | One change can describe coupled artifacts/migrations; deployments still separate | Requires release manifest/version coordination | Often unclear which changes belong together |
| Developer workflow | Strong for cross-cutting changes | More context switching/publishing | Simple initially |
| Code review | One PR can show full correctness change | Review may be fragmented across repos | One PR but architecture impact hard to see |
| Documentation synchronization | Strong, same change history | Docs can drift or require separate coordination | Same repo but low structural traceability |
| Future native client | Easy to add as an independently buildable app while sharing client-safe contracts | New repo plus shared contract versioning | Risks sharing too much server code |
| Future service extraction | Good when packages/contracts are explicit | Already separated physically, but may be premature | Expensive untangling |
| Team scaling | Strong for small/medium coordinated team; ownership rules can evolve | Strong for independent teams | Degrades as ownership grows |
| Repository growth | Requires affected builds and dependency governance | Smaller repos individually | Grows without structure |
| Operational complexity | Low repository overhead, future CI graph needed | Higher release/versioning overhead | Low initially, high maintenance cost |
| Reversibility | High if package/app contracts remain explicit | Medium; consolidating repos and versions has cost | Medium/Low due to entanglement |

### 5.1 Correctness-sensitive change sets

GymPulse frequently needs changes that should be reviewed as one coherent unit.

#### Attendance duplicate protection

A policy change may affect:

```text
Attendance domain rule
+ CheckInMember application use case
+ request/runtime contract
+ uniqueness/idempotency persistence change
+ background/return behavior
+ concurrency tests
+ product/architecture documentation
```

Option A lets one review establish whether the entire correctness chain moved together. Option B can support the same result but requires multi-repository version/release coordination. Option C keeps files together but does not enforce which layer owns the rule.

#### Payment exactly-once effect

A payment-effect change may affect:

```text
provider adapter normalization
+ Payments application/domain logic
+ Membership/Add-on effect contract
+ persistence constraint/migration
+ webhook/background behavior
+ duplicate-event tests
+ audit/reconciliation behavior
+ documentation
```

Version skew in this flow can create real entitlement or financial defects. Co-versioning the relevant source and migration is therefore materially valuable.

#### Tenant authorization

An authorization change may affect web/member request contracts, principal/scope/capability policy, background system context, repository queries, negative tests, and documentation. A single versioned change set reduces the chance that a new entry point ships without the corresponding policy/test update.

### 5.2 Why Option B is not currently recommended

Multiple repositories provide valuable isolation when teams, release cycles, security boundaries, or products are genuinely independent.

Current GymPulse evidence instead shows a tightly connected Phase 1 correctness model where web/member clients, trusted application logic, workers, contracts, migrations, tests, and documentation frequently evolve together. Creating separate repositories now would add shared-package publication, multi-PR sequencing, version compatibility, and release coordination before independent ownership/release requirements have been demonstrated.

This does not mean multiple repositories are wrong permanently. They are a valid future evolution when the triggers in Section 13 are met.

### 5.3 Why Option C is not currently recommended

Option C gains one Git history but does not solve the actual architecture problem. It increases the risk that:

- client applications import privileged server code,
- routes/workers bypass application/domain ownership,
- generic shared helpers accumulate unrelated responsibilities,
- provider SDKs leak into domain logic,
- dependency cycles become normal,
- tests exercise framework wiring instead of deterministic domain behavior,
- future extraction requires untangling architecture rather than moving a well-defined boundary.

The difference between Option A and Option C is governance and dependency architecture, not merely whether both use one Git repository.

## 6. Proposed Decision

**Propose Option A: use one explicit GymPulse monorepo with deliberate application and package boundaries, while preserving independent build/deployment artifacts.**

If accepted, the repository architecture should follow these rules.

### 6.1 Repository-level invariants

1. Repository topology never determines deployment topology.
2. Applications are identifiable build/run entry points; packages are reusable or boundary-enforcing source units.
3. Domains remain logical ownership boundaries and are not automatically promoted into packages.
4. A package is created only when it provides a clear ownership, dependency, security, reuse, testing, or build boundary.
5. Avoid generic `shared/`, `common/`, or `utils/` packages without a narrow owner and contract.
6. Canonical documentation remains under `docs/` in the same repository.
7. `.ai/` remains in the same repository as non-canonical working context.
8. Migrations, when the database decision is later accepted, must be co-versioned with the application changes that require them.
9. Each independently deployable artifact must be independently buildable/testable even though it lives in one repository.

### 6.2 Conceptual application boundaries

The repository must support, without prematurely fixing exact folders:

| Application responsibility | Repository role | Deployment status |
|---|---|---|
| Owner / Staff Web | client/web entry point | Framework and deployment open |
| Member Client | member-facing entry point | Web/PWA vs native open |
| Trusted API Runtime | trusted transport/application entry | May be co-hosted with web or independent under `D-ARCH-006` |
| Background Worker Runtime | scheduled/retryable entry point | Job technology/deployment open |
| Migration/Admin Tooling | privileged operational entry point when needed | Server/build-only; database/tooling decisions separate |

A co-hosted web+API runtime and an independently deployed API must both remain possible.

### 6.3 Conceptual package categories

The following are categories, not a mandate to create one package for each row.

| Category | Responsibility | Allowed dependencies | Forbidden dependencies | Classification | Reason to extract |
|---|---|---|---|---|---|
| Domain | Deterministic business rules, entities/value objects/policies, domain ports where appropriate | domain-safe types and narrowly defined internal contracts | UI frameworks, transport objects, ORM/DB driver, provider SDK, job runner, hosting APIs | Server-safe logic; may be client-safe only if intentionally designed with no privileged behavior | Multiple entry points need identical business behavior or ownership boundary needs enforcement |
| Application | Commands, queries, orchestration, transaction/idempotency/use-case contracts | Domain and inward-facing ports/contracts | UI components, raw provider payloads, direct framework coupling | Server-only by default | Request and worker entries must reuse the same use cases |
| Contracts | Purpose-specific API/event/command DTO schemas and generated/shared types where safe | validation-neutral primitives or explicitly client-safe validation schemas | database models, secrets, privileged adapters, server environment | Client-safe only when explicitly marked | Multiple clients/runtimes need the same externally safe contract |
| Validation | Trust-boundary schemas/utilities when shared safely | client-safe primitives/contracts or server-only schemas depending on package purpose | privileged infrastructure in client-safe validation | Split client-safe/server-only by purpose | Same boundary schema must be enforced consistently without importing privileged code |
| Authorization | GymPulse capability/scope policy contracts and evaluation logic | Domain/application policy types, tenant/resource abstractions | UI-only role checks, provider SDK roles as authority | Server-only | Protected request and job paths require one policy implementation |
| Database | Repository implementations, transaction/UoW adapters, migration-facing persistence code | Domain/application repository ports | Client apps, UI, provider-independent domain imports outward | Server-only | Persistence implementation must be structurally isolated and replaceable/testable |
| Payments | Payment provider adapters and provider normalization | Application/payment ports, server configuration | Client packages, raw provider types leaking into domain | Server-only | Provider SDK/secrets/failure semantics require an explicit integration boundary |
| Notifications | Messaging provider adapters/delivery infrastructure | Notification/application ports, server configuration | Client packages, notification-policy ownership inside adapter | Server-only | Delivery provider concerns need isolation from notification business policy |
| Jobs | Scheduler/job-runner adapters and payload entry points | Application use cases, job contracts | Reimplemented domain rules, client code | Server-only | Worker runtime needs independent build/deploy while reusing application behavior |
| Observability | Server telemetry adapters and safe shared telemetry contracts | application/runtime hooks | secrets/PII-heavy generic logging helpers; provider SDK leakage into domain | Usually server-only; limited client-safe telemetry contracts may be separate | Provider/runtime observability must not contaminate domain logic |
| Config | Validated configuration/environment schemas split by trust level | primitive validation helpers | server secrets exposed through client-safe exports | Client-safe or server-only as distinct explicit surfaces | Prevent accidental environment/secrets leakage and centralize validation |
| UI | Reusable presentation components/tokens for compatible clients | client-safe contracts/config only | database, payment/messaging adapters, server config/secrets | Client-safe | Genuine presentation reuse across supported clients justifies it |
| Testing support | Fixtures/builders/fakes for domain/application/integration tests | explicit test-target contracts | production secret defaults or hidden business-rule copies | Build/test-only | Reuse test utilities without creating production dependencies |
| Tooling | Build/lint/architecture-check scripts/configuration | repository metadata/tool APIs | runtime application dependencies unless intentionally invoked | Build/tooling-only | Repository-level enforcement or developer workflow is shared |
| Documentation | Architecture/product/operational documentation | links/metadata only | runtime imports | Documentation-only | Canonical knowledge and traceability belong in repository history |

The initial implementation should create the minimum set of packages necessary to enforce real boundaries. A conceptual domain does not deserve a package merely because it has a name in architecture diagrams.

### 6.4 Dependency direction

The default source dependency direction should remain:

```text
Client/UI or Transport Entry
          ↓
Application
          ↓
Domain
          ↓
Ports / contracts as defined inward

Infrastructure Adapters
  ├── Database Adapter
  ├── Payment Adapter
  ├── Messaging Adapter
  ├── Auth Adapter
  ├── Job Adapter
  └── Observability Adapter
          ↓ implements
Application / Domain Ports
```

Infrastructure depends inward on stable contracts. Domain code does not depend outward on infrastructure implementations.

### 6.5 Client-safe versus server-only boundary

Every package/export surface must be classifiable as one of:

```text
Client-safe
Server-only
Build/tooling-only
Documentation-only
```

Browser/member-client code must never import:

- database credentials,
- database adapters or migration code,
- service-role/admin credentials,
- payment or messaging secrets,
- privileged provider SDK implementations,
- server environment variables,
- admin scripts,
- privileged configuration.

Recommended structural enforcement capabilities, without selecting exact tools, include:

- explicit package exports/entry points,
- dependency-direction rules,
- static/lint architecture checks,
- server-only entry-point markers or equivalent build barriers,
- CI dependency-graph validation,
- separate client/server environment schemas,
- client bundle checks for forbidden server modules/secrets.

### 6.6 Workspace and task orchestration boundary

If this ADR is accepted, the implementation needs workspace-capable dependency management, but the package manager remains governed by `D-ARCH-011`.

Task orchestration is a separate capability from repository architecture. Start with the simplest workspace-native build/test commands that satisfy the repository graph. Add a task orchestrator or build cache only when affected-task execution, caching, or multi-application workflow provides measured value.

This ADR does not accept Turborepo, Nx, or any alternative.

## 7. Consequences

### Positive consequences

- Correctness-sensitive changes can update business rules, contracts, migrations, workers, tests, authorization policy, and docs in one reviewable commit/PR.
- Shared business behavior can have one source rather than client/worker copies.
- API/event contracts can evolve with their producers and consumers while preserving explicit client-safe surfaces.
- Independently deployable applications can still be built from one versioned source graph.
- Documentation and ADRs remain traceable to the implementation changes they govern.
- Future native member delivery can reuse only intentionally client-safe contracts/components instead of importing server internals.
- Future service extraction starts from explicit package/application contracts rather than an unstructured codebase.

### Negative consequences

- Without structural enforcement, a monorepo can create accidental client/server leakage and package cycles.
- CI/build time can grow with repository size unless affected-scope execution is introduced when justified.
- Co-versioning can tempt unnecessary synchronized releases unless deployment pipelines preserve artifact independence.
- Repository-level access control is coarser than separate repositories for teams requiring hard source visibility boundaries.
- Over-packaging can create local complexity comparable to premature services.

## 8. Security and Privacy Impact

The monorepo recommendation is acceptable only with a hard client-safe/server-only dependency model.

Required security rules:

1. Server secrets and privileged configuration must exist only in server-only/build-only surfaces.
2. Client build graphs must be unable to reach database, migration, payment, messaging, admin, or privileged provider modules.
3. Authentication provider SDKs used by clients must not expose server credentials; server verification adapters remain server-only.
4. Authorization policy remains server-side and cannot be replaced by client-shared role helpers.
5. Tenant-scope checks and negative authorization tests must execute against every protected entry point, including worker/system contexts.
6. Test fixtures and documentation must not contain production secrets or unnecessary PII.
7. Future CI must fail closed when dependency-policy checks detect a client-to-server-only edge.

Separate repositories would provide a stronger physical source boundary between client and server, but current GymPulse does not require that cost if repository-level structural controls are demonstrably effective. If future regulation or access-control requirements demand separate source visibility, that becomes a repository-split trigger.

## 9. Reliability, Performance, and Scalability Impact

### Reliability

One versioned source graph reduces accidental skew in critical flows.

Examples:

- payment effect logic and the migration/constraint supporting dedupe can be reviewed together,
- attendance duplicate rules and worker/request behavior can evolve together,
- authorization policy and all application entry points can be tested against the same change,
- notification intent/dedupe changes can update worker, persistence, and tests atomically.

Repository co-location does not itself provide runtime reliability. Transactions, database constraints, idempotency records, provider verification, retries, and reconciliation remain separate runtime mechanisms.

### Performance

Repository topology has no direct production runtime-performance benefit.

Build/test performance may degrade as the repository grows. Future tooling must support affected-scope or dependency-aware execution before introducing unnecessary build infrastructure solely for fashion.

### Scalability

A monorepo can scale with more applications and teams if ownership, dependency rules, and affected builds remain explicit. It should not become a reason to couple releases or to keep a future service in the repository when regulatory/team/business boundaries require otherwise.

## 10. Operations and Observability Impact

Future CI/CD must be able to derive and validate the repository dependency graph without forcing all artifacts into one deployment.

Required repository capabilities for later CI/CD design include:

- affected application/package testing,
- parallel independent builds,
- dependency-cycle detection,
- architecture-boundary checks,
- client/server dependency checks,
- migration validation when migrations exist,
- documentation/ADR consistency checks,
- independent artifact version/build metadata,
- release manifests or equivalent traceability for which repository revision produced each deployed artifact.

`D-ARCH-019` remains `OPEN`; no CI provider is selected here.

Operational rollback still occurs per deployment artifact. A single repository revision may produce web, API, worker, member, and migration artifacts that are rolled out on different schedules. Release procedures must record compatibility when deployments are staggered.

## 11. Testing and Validation

This ADR recommends non-production validation before it becomes an implementation/scaffold gate.

Required validation evidence:

1. Produce a conceptual/workspace dependency graph and confirm intended dependency direction.
2. Prove a client-safe application cannot import a server-only database/provider/config package.
3. Add an architecture dependency test that rejects forbidden outward domain/application dependencies.
4. Demonstrate independently buildable artifacts for the candidate Owner/Staff Web, Trusted API, Background Worker, and Member Client mappings without selecting final deployment topology.
5. Define one client-safe validated contract consumed by a client and trusted entry point without importing server internals.
6. Demonstrate one application/domain use case invoked by both a request entry and background worker entry without duplicating the business rule.
7. Detect dependency cycles in the workspace graph.
8. Prototype affected test/build execution and compare it with whole-repository execution.
9. Demonstrate one atomic change containing code, a persistence migration placeholder/example appropriate to the later database decision, tests, and documentation, proving review traceability without implementing production schema now.
10. Verify that `docs/` remains canonical and `.ai/` remains non-canonical working state in repository policy/documentation.

No package manager, task orchestrator, test framework, CI provider, database, or deployment product is selected by this validation plan.

## 12. Migration and Rollout

There is no existing application scaffold to migrate in the current documentation phase.

If this ADR is later accepted, repository implementation should be incremental:

```text
identify actual application entry points
  -> identify real shared/boundary-enforcing source needs
  -> create only necessary workspace boundaries
  -> establish client-safe/server-only classifications
  -> establish dependency rules
  -> make each application independently buildable
  -> add affected build/test orchestration only when useful
```

Do not pre-create empty packages for every conceptual domain or component.

`docs/` and `.ai/` remain where they are. Existing documentation history does not move to a separate repository.

No repository scaffold is created by this ADR task.

## 13. Reversibility

The proposed monorepo is intentionally reversible.

A future move to multiple repositories should be considered when evidence shows one or more of these conditions:

- independent teams own areas with truly independent release cycles,
- security/regulatory rules require stronger source visibility or access-control isolation,
- repository/CI performance remains unacceptable after reasonable affected-scope optimization,
- a public SDK or separately distributed package needs independent versioning/governance,
- a service has been extracted with distinct ownership and lifecycle,
- an acquisition or business boundary requires repository separation,
- different confidentiality/access-control requirements make one repository inappropriate,
- a runtime/product has a materially independent release and support model.

A future split is easier when packages/applications already have:

- narrow public contracts,
- explicit dependency direction,
- no hidden cross-package imports,
- independent builds/tests,
- provider/infrastructure isolation,
- versioned API/event contracts where runtime boundaries exist.

A repository split should receive a new ADR and migration plan rather than being performed incrementally through undocumented code movement.

## 14. Risks and Mitigations

### Risk: monorepo becomes an unstructured codebase

Mitigations:

- package creation requires a clear responsibility/owner,
- enforce dependency direction,
- prohibit generic catch-all shared packages,
- add architecture/dependency tests,
- keep route/worker adapters thin,
- review cross-boundary imports explicitly.

### Risk: client bundles import privileged server code

Mitigations:

- classify every exported package surface,
- separate client/server config schemas,
- explicit server-only exports/entry points,
- CI dependency checks,
- client bundle inspection for forbidden modules/secrets.

### Risk: too many packages create accidental complexity

Mitigations:

- Domain != Package,
- extract only when ownership/reuse/security/build boundaries justify it,
- prefer cohesive internal modules before separate packages,
- merge packages whose boundary provides no measurable value.

### Risk: one repository becomes one release train

Mitigations:

- each application has an independent build artifact,
- deployment metadata records repository revision per artifact,
- CI/CD treats changed graph and deployment targets separately,
- `D-ARCH-006` and hosting decisions remain independent.

### Risk: package cycles erode architecture

Mitigations:

- define allowed dependency graph,
- detect cycles automatically,
- move shared abstractions only to a genuinely lower-level contract/port when ownership is clear,
- do not solve cycles by creating a generic `common` package.

### Risk: repository grows beyond efficient developer/CI operation

Mitigations:

- measure install/build/test times,
- use affected execution and caching only when justified,
- split repositories only after evidence shows structural rather than tooling limits.

### Risk: cross-cutting atomic changes encourage tight runtime coupling

Mitigation:

Atomic source changes are not permission for runtime coupling. Stable application/domain/API/event contracts and independent artifact builds remain required.

## 15. Open Questions

- Who is the authorized decision owner for `D-ARCH-001`?
- Which package manager will be accepted under `D-ARCH-011`?
- Does Phase 1 initially need a task orchestrator, or are workspace-native commands sufficient?
- If a task orchestrator is later needed, what measured CI/developer problem must it solve?
- What exact application folders/entry points are justified once `D-ARCH-006`, `D-ARCH-012`, and `D-ARCH-013` are resolved?
- Which conceptual package categories need extraction at initial scaffold time versus remaining internal modules?
- What mechanism will enforce dependency direction and client-safe/server-only rules?
- How will future CI represent affected builds and independent deployment artifacts under `D-ARCH-019`?
- What database/migration location follows from `D-ARCH-002` and `D-ARCH-017` once those decisions are approved?
- What repository-scale thresholds would trigger a split review?

## 16. Decision Evidence

### Current evidence supporting the proposal

- The canonical decision register originally marked `D-ARCH-001` as `P0 PROPOSED` with a monorepo recommendation and no accepted repository tool; the repository-strategy category is now accepted while concrete repository tooling remains separate.
- `NFR-MAINTAINABILITY-001` requires core business rules not to be duplicated across member, owner/staff, and background execution paths.
- `NFR-MAINTAINABILITY-002` supports shared/generated typed contracts with runtime validation at trust boundaries.
- `NFR-MAINTAINABILITY-004` requires auditable migration discipline, and `NFR-MAINTAINABILITY-005` requires documentation synchronization with material behavior/architecture changes.
- `NFR-TESTABILITY-001..005` require deterministic domain, provider, failure, authorization, and time-controlled tests across several execution paths.
- Current component architecture explicitly says its components are source-code/application boundaries rather than mandatory processes or microservices and requires inward dependency direction.
- Current container architecture keeps API deployment topology open and explicitly distinguishes container responsibility from final deployment mapping.
- Current technology evaluation recommends an explicit monorepo because GymPulse frequently needs coordinated changes across clients, domain rules, contracts, jobs, provider adapters, tests, migrations, and documentation.
- `ADR-0002` identifies client-safe/server-only separation as a material security requirement if source sharing is adopted.

### Acceptance-readiness evidence update — 2026-09-27

The validation-only harness at `../../validation/foundation/` now provides partial repository-boundary evidence:

- separate strict TypeScript builds exist for client, request, and worker validation artifacts;
- client-safe/server-only boundary checking detects a deliberate forbidden import;
- deliberate dependency cycles are detected;
- request and worker entry artifacts reuse one shared application command;
- one client-safe contract module is reused without importing server infrastructure;
- scoped build commands demonstrate narrow affected-artifact compilation.

This is not yet a production monorepo/workspace scaffold. The harness intentionally avoids accepting a package manager, workspace orchestrator, CI platform, or final app/package topology.

Post-acceptance implementation/tooling gaps remain:

- no actual workspace/package graph using the eventual workspace mechanism has been validated;
- no production-scale architecture dependency rule has been integrated into CI;
- no measured repository/CI baseline exists because application scaffolding has not begun;
- no team/release/security constraint has been recorded that requires multiple repositories;
- final application/package placement still depends on separately governed framework/topology decisions.

Authorized Decision Owner `santosh` accepted the explicit-monorepo strategy on `2026-09-29`, with durable approval evidence in GitHub Issue #1. The partial-but-reviewable evidence limitation remains documented and does not imply acceptance of pnpm, Turborepo, Nx, GitHub Actions, a final package graph, or a final directory layout.

Therefore this ADR is `Accepted` and `D-ARCH-001` is synchronized as `DECIDED`.

## 17. Related Documents

- `../00-overview/assumptions.md`
- `../01-product/functional-requirements.md`
- `../01-product/non-functional-requirements.md`
- `../02-architecture/architecture-principles.md`
- `../02-architecture/architecture-overview.md`
- `../02-architecture/container-architecture.md`
- `../02-architecture/component-architecture.md`
- `../02-architecture/data-flow.md`
- `../02-architecture/technology-stack.md`
- `ADR-0001-modular-monolith.md`
- `ADR-0002-primary-language-runtime.md`
- `README.md`
- legacy migration evidence if needed: `../05-system-architecture.md`
- legacy migration evidence if needed: `../15-engineering-workflow.md`
- legacy migration evidence if needed: `../16-open-decisions.md`
