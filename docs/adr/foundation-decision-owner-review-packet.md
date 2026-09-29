# Foundation Decision-Owner Review Packet

## Document Control

- Status: PREPARED FOR AUTHORIZED HUMAN REVIEW
- Review Scope: ADR-0001 through ADR-0004
- Preparation Date: 2026-09-29
- Repository Baseline Audited: `24d9629249a75bd553ecbe21ba8b2716a153b774`
- Decision Owner: Open — authorized owner must be identified
- Explicit Approval: Missing
- Approval Effect: none
- Canonical Decision Effect: none
- Production Implementation Effect: none
- Review Packet Type: governance review artifact, not an ADR
- Validation Harness Disposition: retained as reusable technical evidence

This packet prepares the first GymPulse foundation ADR batch for an authorized human decision. It does not approve, reject, or change the status of any ADR.

Preserve:

```text
Technical Evidence
!=
Governance Approval

Passing Validation
!=
ADR Acceptance

Review Packet Prepared
!=
Decision Completed
```

## Executive Summary

| ADR | Decision | Current Status | Technical Evidence | Key Remaining Gap | Owner Decision |
|---|---|---|---|---|---|
| ADR-0001 | D-ARCH-005 — Phase 1 Architecture Style | Proposed / PROPOSED | Bounded evidence sufficient for owner review | Owner/approval missing; production-scale boundary enforcement remains implementation evidence | Pending |
| ADR-0002 | D-ARCH-016 — Primary Language / Runtime | Proposed / PROPOSED | Bounded evidence sufficient for owner review | Owner/approval missing; production framework/tool/version choices remain separate | Pending |
| ADR-0003 | D-ARCH-001 — Repository / Workspace Strategy | Proposed / PROPOSED | Partial but reviewable | Owner/approval missing; final workspace/package graph and accepted CI enforcement do not exist yet | Pending |
| ADR-0004 | D-ARCH-002 — Canonical Database Engine | Proposed / PROPOSED | Bounded PostgreSQL technical evidence complete for owner review | Owner/approval missing; production deployment/provider/recovery decisions remain separate | Pending |

Current foundation state:

```text
ADR-0001 = Proposed
ADR-0002 = Proposed
ADR-0003 = Proposed
ADR-0004 = Proposed

D-ARCH-005 = PROPOSED
D-ARCH-016 = PROPOSED
D-ARCH-001 = PROPOSED
D-ARCH-002 = PROPOSED

Decision Owner = Open
Explicit Approval = Missing
Production implementation gate = closed
```

Technical validation is sufficiently mature for owner review. Technical PASS does not equal governance acceptance.

## Cross-ADR Dependency View

```text
ADR-0001 / D-ARCH-005
Phase 1 architecture style
    -> influences internal application/domain boundaries

ADR-0002 / D-ARCH-016
Primary language/runtime
    -> provides implementation runtime direction

ADR-0003 / D-ARCH-001
Repository/workspace strategy
    -> organizes implementation artifacts

ADR-0004 / D-ARCH-002
Canonical database engine
    -> provides transactional persistence category
```

These decisions are related but remain independently governed.

```text
Accept ADR-0001
!=
Accept ADR-0002

Accept ADR-0002
!=
Accept ADR-0003

Accept ADR-0004
!=
Accept D-ARCH-017

Accept ADR-0004
!=
Accept Supabase / Neon / Render / RDS / another provider

Accept ADR-0004
!=
Accept RLS

Accept ADR-0004
!=
Accept pg-boss

Accept ADR-0004
!=
Finalize production schema
```

## Gap Classification Used In This Packet

Each ADR separates remaining gaps into four categories:

1. **Decision-category inputs** — evidence or constraints the authorized owner may consider when deciding the architecture category itself.
2. **Production-readiness blockers** — matters that can remain unresolved at architecture-category review but must be resolved before safe production deployment where applicable.
3. **Dependent-decision blockers** — separately governed ADRs/decision IDs that are intentionally not bundled into this decision.
4. **Human-governance blockers** — authorized owner identity and explicit approval/rejection/remain-Proposed evidence.

This packet does not decide on the owner's behalf whether a specific remaining input must block acceptance of the architecture category.

---

# ADR-0001 Review — Phase 1 Architecture Style

## Decision Record

- ADR: `ADR-0001`
- Canonical Decision ID: `D-ARCH-005`
- Current ADR Status: `Proposed`
- Current Canonical Status: `PROPOSED`
- Decision Owner: Open — authorized owner must be identified
- Review Date: Pending
- Approval Evidence / Reference: Pending authorized decision

## Proposed Choice

**Phase 1 modular monolith with explicit domain and component boundaries.**

The proposal is one application architecture with intentionally enforced source/application boundaries rather than one giant undifferentiated codebase.

The proposed rules include:

- Phase 1 domains have explicit write ownership.
- Application command/query handlers orchestrate use cases across modules.
- Domain modules expose intentional application/domain contracts instead of arbitrary internal-table access.
- Routes/controllers remain thin transport adapters.
- Background workers reuse the same application/domain behavior rather than copy business rules.
- Repository/data-access implementations sit behind module/application ports where appropriate.
- Provider integrations stay behind provider ports/adapters.
- Correctness-sensitive changes may use local transactions when required data is under one canonical persistence boundary.
- Async continuation is used across process/provider boundaries or where canonical transactions should not be blocked.
- Read models may span modules for authorized queries while canonical mutation remains with owning modules.
- Network service boundaries are introduced only through a later accepted decision supported by evidence.

A modular monolith does **not** mean:

```text
one giant source file
controllers writing arbitrary tables
no internal boundaries
one mandatory deployment process forever
no asynchronous work
no provider boundaries
future services prohibited
```

## Why This Decision Exists

GymPulse Phase 1 has correctness-sensitive workflows spanning Membership, Attendance, Retention, Payments, Add-ons, notifications, authorization, audit, and background processing. The architecture needs explicit ownership and reuse without adding distributed failure modes before independent scaling/team/security requirements exist.

The decision establishes the Phase 1 default architecture style. It does not decide repository topology, runtime, database, API deployment topology, job runner, hosting, provider choices, or RLS.

## Alternatives Considered

### Option A — Modular monolith with explicit domain/component boundaries

Benefits/tradeoffs:

- keeps correctness-sensitive orchestration local where appropriate;
- centralizes reusable authorization and application policy;
- enables request/worker reuse;
- keeps provider-specific behavior behind adapters;
- reduces Phase 1 network/operational complexity;
- still requires active structural enforcement to prevent boundary decay.

### Option B — Service-per-domain / microservices from Phase 1

The ADR recognizes potential future benefits from independent scaling, deployment, ownership, security isolation, or runtime specialization.

Current tradeoffs include:

- service APIs/contracts from day one;
- distributed tracing baseline;
- network failure between domain operations;
- saga/outbox/distributed consistency concerns for workflows that could otherwise be local transactions;
- more local-development and integration-test complexity;
- more service identity/secrets complexity.

The ADR does not prohibit future extraction. It requires a later accepted decision when evidence justifies network service boundaries.

### Option C — Unstructured single application with weak internal boundaries

This preserves initial operational simplicity but permits direct cross-layer/database/provider coupling, scattered authorization, duplicated request/worker rules, and cross-domain writes without intentional ownership.

The ADR distinguishes a modular monolith from this option by **enforced ownership and dependency architecture**, not by number of deployables.

## Key Tradeoffs

Positive consequences:

- local transactional correctness is simpler for tightly related workflows;
- authorization policy can be consistently reused;
- request/background paths can share domain/application behavior;
- provider isolation is possible without multiplying services;
- local development, migration, integration testing, and debugging remain simpler than service-per-domain Phase 1;
- explicit module contracts create an extraction seam for future services.

Negative consequences:

- weak enforcement can decay into an unstructured monolith;
- one domain is not independently deployable automatically;
- shared persistence can permit accidental coupling if write ownership is ignored;
- build/test time may grow;
- one runtime failure can affect multiple modules depending on deployment topology;
- team discipline and architecture tests are required because network boundaries do not enforce separation.

## Technical Evidence

The bounded foundation harness provides:

```text
strict dependency/boundary checking                       PASS
deliberate forbidden-import detection                    PASS
dependency-cycle detection                               PASS
request + worker reuse of one application behavior       PASS
cross-tenant negative authorization                      PASS
cross-branch negative authorization                      PASS
capability negative authorization                        PASS
runtime input rejection                                  PASS
gym-local timezone behavior                              PASS
correlation propagation                                  PASS
```

Real PostgreSQL supporting evidence adds:

```text
attendance concurrency:
12 overlapping attempts -> 1 effective result             PASS

exactly-once business effect:
12 overlapping attempts -> 1 durable effect claim
                        -> 1 target mutation              PASS

later replay -> unchanged                                PASS
transaction rollback                                     PASS
post-restart replay safety                               PASS
```

This is a deliberately narrow validation harness, not a production application.

## Evidence Limitations

- The harness proves representative boundary/correctness properties, not every future GymPulse module.
- Production-scale cross-domain direct-write prevention is not yet exercised against a full application graph.
- Validation provider-event/business-effect behavior is provider-neutral and does not replace future production payment/provider integration evidence.
- Production module-aware observability remains separately governed.
- Passing the harness does not prove all future implementation changes will preserve the architecture.

## Remaining Gaps

### Decision-category inputs

- The current repository contains no evidence requiring Phase 1 service-per-domain decomposition.
- The harness is intentionally narrow rather than a complete production application.
- Broader production-scale boundary enforcement remains future implementation evidence.
- The authorized owner must decide whether current evidence is sufficient for the architecture-style category.

### Production-readiness blockers

- production observability implementation/provider remains separate;
- production provider integrations remain separate;
- actual deployment/process isolation and operational runbooks remain future work.

### Dependent-decision blockers

Separately governed:

```text
D-ARCH-001 repository/workspace
D-ARCH-016 language/runtime
D-ARCH-002 database engine
D-ARCH-006 API deployment topology
D-ARCH-007 background jobs
D-ARCH-014 managed backend
D-ARCH-017 data-access tooling
D-ARCH-009 hosting
D-SEC-008 RLS/data-layer isolation
provider decisions
```

### Human-governance blockers

```text
Decision Owner = Open
Explicit Approval = Missing
```

## What Acceptance Would Mean

If an authorized owner later chooses `Accept`, a separate synchronization action may:

```text
ADR-0001 -> Accepted
D-ARCH-005 -> DECIDED
record authorized owner
record acceptance date
record approval evidence/reference
synchronize affected architecture docs
```

That would accept only the Phase 1 architecture-style decision. It would not automatically accept runtime, repository, database, hosting, jobs, providers, RLS, or all downstream implementation choices.

## Reject Path

If explicitly rejected later:

- record rejection owner/date/evidence;
- retain ADR-0001 as historical decision evidence;
- identify replacement architecture-style decision work;
- do not silently promote Phase 1 microservices or the unstructured application;
- reassess dependent Proposed ADRs only where materially affected.

## Remain Proposed Path

If the authorized owner chooses `Remain Proposed`:

- do not promote `D-ARCH-005` to `DECIDED`;
- keep the architecture-style implementation gate closed;
- record the exact additional evidence/input required;
- schedule the smallest follow-up evidence/governance action.

`Remain Proposed` is not a validation failure.

## What Remains Proposed Either Way

Until separately decided, repository strategy, runtime, database, API topology, jobs, hosting, data-access tooling, RLS, providers, and other downstream choices remain independently governed.

## Decision Form

Decision Owner:  
Open — authorized owner must be identified

Review Date:  
Pending

Decision:

- [ ] Accept
- [ ] Reject
- [ ] Remain Proposed

Decision Rationale:  
Pending authorized review

Approval Evidence / Reference:  
Pending authorized decision

Canonical Follow-Up If Accepted:  
ADR-0001 -> Accepted; D-ARCH-005 -> DECIDED; record owner/date/evidence; synchronize only affected architecture documents.

Canonical Follow-Up If Rejected:  
Record rejection; retain historical ADR; initiate explicit replacement architecture-style decision work; reassess materially dependent proposals.

Canonical Follow-Up:  
Pending decision

---

# ADR-0002 Review — Primary Language / Runtime

## Decision Record

- ADR: `ADR-0002`
- Canonical Decision ID: `D-ARCH-016`
- Current ADR Status: `Proposed`
- Current Canonical Status: `PROPOSED`
- Decision Owner: Open — authorized owner must be identified
- Review Date: Pending
- Approval Evidence / Reference: Pending authorized decision

## Proposed Choice

**Strict TypeScript as the primary implementation language with a supported Node.js LTS line as the primary trusted server runtime.**

The proposal requires:

- strict TypeScript for primary application/domain/server packages unless a bounded exception is documented;
- runtime validation for external requests, webhooks, jobs, environment/config, and provider payloads;
- domain/application modules independent of framework requests, provider SDK payloads, DB driver objects, and job-runner-specific objects;
- permanent business truth in canonical persistence rather than process memory;
- asynchronous/non-blocking I/O for provider/database/network-heavy work;
- explicit client-safe/server-only source boundaries;
- an actively supported Node.js LTS line selected at implementation time;
- portability of core application/domain behavior so future extracted services may use another runtime if later evidence supports it.

## Why This Decision Exists

GymPulse's current client directions, contracts, application layers, workers, provider integration needs, and testability requirements benefit from a primary typed application language with runtime validation at trust boundaries.

The proposal is a fit-to-current-requirements direction, not a claim that TypeScript/Node.js is universally superior.

## Alternatives Considered

### Option A — Strict TypeScript + supported Node.js LTS

Tradeoffs:

- one primary language across current TypeScript-oriented clients and trusted server/application code;
- strong compile-time support plus mandatory runtime validation;
- broad HTTP/PostgreSQL/provider/observability/jobs/test ecosystem;
- good fit for I/O-heavy workloads;
- requires explicit server-only/client-safe boundaries;
- sustained CPU-heavy workloads would require deliberate isolation or later reconsideration.

### Option B — Java/Kotlin on the JVM for trusted server code

Credible strengths include mature static typing, concurrency, transaction, and observability ecosystems. Tradeoff is a separate server/client language/toolchain plus explicit cross-language contract/version management.

### Option C — Go for trusted server code

Credible strengths include deployment simplicity, efficient runtime behavior, concurrency model, and operational footprint. Tradeoff is additional cross-language contract/tooling and less direct model reuse with TypeScript-oriented clients.

### Option D — Python for trusted server code

Credible strengths include development productivity and broad integration/data ecosystem. Tradeoffs include explicit runtime typing/validation discipline and separate client/server contract/tooling paths.

### Option E — JavaScript on Node.js without strict TypeScript

Keeps Node runtime simplicity but gives up compile-time guarantees the current typed-contract and maintainability requirements value.

The ADR records JVM, Go, and Python as technically credible. They are not ruled out forever.

## Key Tradeoffs

Positive consequences:

- one primary language across much of the proposed client/server/worker/test surface;
- safer cross-module refactoring;
- fewer duplicated client/server model definitions where shared/generated contracts are appropriate;
- broad integration ecosystem;
- framework-independent TypeScript application/domain code remains portable across deployment topologies.

Negative consequences:

- shared language can encourage accidental server-only imports into client code;
- compile-time types can create false confidence if runtime validation is skipped;
- Node.js is not ideal for every possible CPU-heavy workload;
- supply-chain concentration must be controlled;
- future service extraction to another language requires contract/migration work.

## Technical Evidence

Existing foundation evidence:

```text
strict TypeScript builds                                 PASS
separate client/request/worker artifacts                 PASS
runtime external-input validation                        PASS
protected Principal -> scope/capability -> application  PASS
client-safe/server-only import isolation                 PASS
raw webhook bytes preserved                              PASS
signature tamper rejection                               PASS
separate-process worker replay                           PASS
gym-local timezone behavior                              PASS
correlation propagation                                  PASS
```

Real PostgreSQL runtime evidence:

```text
Node.js validation runtime:
v22.23.2

temporary PostgreSQL client:
pg 8.16.3

application-style PostgreSQL connection                  PASS
BEGIN / COMMIT                                            PASS
close / reconnect                                         PASS
six simultaneous Node PostgreSQL connections              PASS
12-session PostgreSQL race scenarios                      PASS
database unavailable behavior                             PASS
restart / reconnect                                       PASS
post-restart replay                                       PASS
```

Earlier validation-only runtime evidence also used Node.js `v22.16.0` and TypeScript compiler `5.8.3`.

Version boundary:

```text
Observed Validation Version
!=
Accepted Production Version
```

Therefore:

```text
Node v22.23.2
TypeScript 5.8.3
pg 8.16.3
```

are evidence values, not production pins.

## Evidence Limitations

- No exact production Node.js version is selected.
- The temporary `pg` client is not data-access-tool acceptance.
- The validation harness is not the final production repository/application structure.
- No production web framework, hosting topology, job runner, test framework, or CI/CD provider is accepted by this ADR.
- No currently recorded benchmark/team/deployment constraint materially contradicts the proposal, but future contrary evidence must be considered if it appears.

## Remaining Gaps

### Decision-category inputs

- No contrary benchmark, deployment constraint, or team-capability evidence is currently recorded that materially changes the proposal.
- The owner must judge whether current technical and requirements evidence is sufficient for the runtime/language category.
- Future specialized workloads may justify another runtime for a bounded extracted service.

### Production-readiness blockers

- exact supported Node.js production version;
- production runtime configuration/update policy;
- production framework/provider integration;
- production dependency/supply-chain controls;
- production deployment/performance evidence for the implemented system.

### Dependent-decision blockers

This ADR does not accept:

```text
D-ARCH-012 web framework
D-ARCH-013 member delivery framework/strategy
D-ARCH-001 repository/workspace
D-ARCH-011 package manager
D-ARCH-003 API contract style
D-ARCH-006 API deployment topology
D-ARCH-002 database engine
D-ARCH-017 data-access/migration tooling
D-ARCH-007 background-job runner
D-ARCH-009 hosting
D-ARCH-019 CI/CD
D-ARCH-018 testing toolchain
provider selections
```

### Human-governance blockers

```text
Decision Owner = Open
Explicit Approval = Missing
```

## What Acceptance Would Mean

If later explicitly accepted:

```text
ADR-0002 -> Accepted
D-ARCH-016 -> DECIDED
```

with authorized owner/date/evidence.

Acceptance would establish the primary language/runtime category. It would not automatically select an exact Node.js version, framework, database library, ORM/query builder, hosting platform, job runner, test framework, or CI/CD provider.

## Reject Path

If rejected later:

- record owner/date/evidence;
- retain the historical ADR;
- initiate explicit replacement language/runtime decision work;
- do not silently promote JVM, Go, Python, or untyped JavaScript;
- reassess dependent proposals if the replacement materially changes them.

## Remain Proposed Path

If `Remain Proposed` is chosen:

- keep `D-ARCH-016` PROPOSED;
- keep its implementation gate closed;
- record the exact missing input;
- schedule only the smallest required follow-up evidence/governance action.

## What Remains Proposed Either Way

Repository/workspace, web/member frameworks, database engine, data-access tooling, job runner, hosting, testing, CI/CD, providers, and exact production versions remain separately governed until explicitly decided.

## Decision Form

Decision Owner:  
Open — authorized owner must be identified

Review Date:  
Pending

Decision:

- [ ] Accept
- [ ] Reject
- [ ] Remain Proposed

Decision Rationale:  
Pending authorized review

Approval Evidence / Reference:  
Pending authorized decision

Canonical Follow-Up If Accepted:  
ADR-0002 -> Accepted; D-ARCH-016 -> DECIDED; record owner/date/evidence; synchronize only affected runtime/language documentation.

Canonical Follow-Up If Rejected:  
Record rejection; retain historical ADR; initiate explicit replacement runtime/language decision work; reassess materially affected dependent proposals.

Canonical Follow-Up:  
Pending decision

---

# ADR-0003 Review — Repository / Workspace Strategy

## Decision Record

- ADR: `ADR-0003`
- Canonical Decision ID: `D-ARCH-001`
- Current ADR Status: `Proposed`
- Current Canonical Status: `PROPOSED`
- Decision Owner: Open — authorized owner must be identified
- Review Date: Pending
- Approval Evidence / Reference: Pending authorized decision

## Proposed Choice

**One explicit GymPulse monorepo with deliberate application/package boundaries while preserving independently buildable/deployable artifacts.**

Conceptual repository shape may include:

```text
apps/
packages/
tooling/
tests/
docs/
.ai/
```

This is conceptual architecture, not an approved folder scaffold.

The proposal requires:

- repository topology does not determine deployment topology;
- applications are identifiable build/run entry points;
- packages exist only for clear ownership/dependency/security/reuse/testing/build boundaries;
- domains are logical ownership boundaries and are not automatically packages;
- generic `shared/common/utils` dumping grounds are avoided;
- migrations, once separately authorized, are co-versioned with changes that require them;
- independently deployable artifacts remain independently buildable/testable.

Preserve:

```text
monorepo strategy
!=
package manager
!=
workspace orchestrator
!=
CI/CD platform
!=
deployment topology
```

## Why This Decision Exists

GymPulse correctness-sensitive changes often span trusted application logic, clients, workers, contracts, migrations, tests, documentation, and authorization policy. A repository strategy must make those changes reviewable and co-versioned without erasing application/server/client boundaries.

## Alternatives Considered

### Option A — Explicit monorepo with deliberate application/package boundaries

Provides atomic source evolution, explicit dependency graphs, client-safe/server-only controls, independently buildable artifacts, and co-versioned correctness changes.

The main risks are over-packaging, client/server leakage, package cycles, growing CI cost, and false coupling of deployment cadence if structural rules are weak.

### Option B — Multiple repositories by application/deployable

Potential benefits:

- repository-level ownership/access boundaries;
- naturally independent versioning/release workflows.

Tradeoffs:

- publication/versioning of shared contracts/libraries;
- multi-repository changes for cross-cutting correctness;
- temporary version skew between contracts, migrations, workers, and applications;
- more release/compatibility coordination.

This remains a valid future evolution when ownership/release/security boundaries become genuinely independent.

### Option C — One repository without deliberate reusable package/module boundaries

Gets one Git history but loses the governing dependency architecture.

Risks include:

- broad cross-concern imports;
- generic shared dumping grounds;
- client/server mixing;
- routes/workers importing privileged infrastructure directly;
- provider SDK leakage;
- duplicate/coupled domain rules;
- dependency cycles and weak extraction seams.

## Key Tradeoffs

Positive consequences:

- one PR can show full correctness changes across code/contracts/tests/docs;
- shared business behavior can have one source;
- independently deployable applications can still be built separately;
- future native/member artifacts can reuse only intentionally client-safe contracts;
- future service extraction starts from explicit boundaries.

Negative consequences:

- monorepo structure alone does not enforce architecture;
- CI/build time can grow;
- repository-level source access is coarser than separate repositories;
- over-packaging can recreate premature distributed complexity locally;
- independent deployment still requires proper release pipelines.

## Technical Evidence

Existing validation evidence includes:

```text
separate strict client/request/worker builds                     PASS
client-safe/server-only negative import test                    PASS
dependency-cycle detection                                     PASS
shared request/worker application behavior                      PASS
shared client-safe contract without server-infrastructure import PASS
scoped/affected-artifact build behavior                         PASS (narrow)
```

The PostgreSQL validation did **not** materially add new ADR-0003 evidence.

Technical evidence classification:

```text
Partial but reviewable
```

This classification is not an acceptance verdict.

## Evidence Limitations

- There is no final production workspace/package graph.
- No eventual workspace mechanism has been validated against an authorized production scaffold.
- Production-scale dependency enforcement is not yet part of accepted CI.
- No measured repository/CI baseline exists.
- Exact application/package placement depends on separately governed framework/runtime/API/job decisions.
- The current validation artifacts demonstrate boundary mechanics, not a final monorepo implementation.

## Remaining Gaps

### Decision-category inputs

- no final production workspace/package graph;
- no production scaffold against which to validate the eventual workspace mechanism;
- no measured repository/CI baseline;
- current evidence demonstrates the governing idea but not final repository scale.

The authorized owner must decide whether these gaps require more evidence before deciding the repository-strategy category.

### Production-readiness blockers

- actual folder/package topology;
- accepted package manager/workspace mechanism;
- production CI dependency-rule enforcement;
- affected-build/cache strategy if later required;
- source access/ownership controls if team/security needs change.

### Dependent-decision blockers

Separately governed:

```text
D-ARCH-011 package manager
workspace orchestrator choice
D-ARCH-019 CI/CD
D-ARCH-012 Owner/Staff web framework
D-ARCH-013 Member delivery/framework
D-ARCH-006 API deployment topology
D-ARCH-007 worker/job topology
D-ARCH-017 migration/data-access implementation
```

### Human-governance blockers

```text
Decision Owner = Open
Explicit Approval = Missing
```

## What Acceptance Would Mean

If later explicitly accepted:

```text
ADR-0003 -> Accepted
D-ARCH-001 -> DECIDED
```

This would accept the repository/workspace strategy category, not automatically:

```text
pnpm
Turborepo
Nx
CI platform
final folder structure
deployment topology
```

## Reject Path

If rejected later:

- record owner/date/evidence;
- retain ADR-0003 historically;
- initiate explicit replacement repository-strategy work;
- do not silently promote the multi-repo alternative;
- reassess materially dependent proposals and tooling decisions.

## Remain Proposed Path

If `Remain Proposed` is chosen:

- keep `D-ARCH-001` PROPOSED;
- keep repository/scaffold authorization closed;
- record exact missing workspace/repository evidence;
- schedule the smallest follow-up proof/governance action.

## What Remains Proposed Either Way

Package manager, task/workspace orchestrator, CI platform, exact folders/packages, application framework boundaries, and deployment topology remain separately governed.

## Decision Form

Decision Owner:  
Open — authorized owner must be identified

Review Date:  
Pending

Decision:

- [ ] Accept
- [ ] Reject
- [ ] Remain Proposed

Decision Rationale:  
Pending authorized review

Approval Evidence / Reference:  
Pending authorized decision

Canonical Follow-Up If Accepted:  
ADR-0003 -> Accepted; D-ARCH-001 -> DECIDED; record owner/date/evidence; synchronize only repository-strategy documentation.

Canonical Follow-Up If Rejected:  
Record rejection; retain historical ADR; initiate explicit replacement repository/workspace decision work; reassess materially affected dependent proposals.

Canonical Follow-Up:  
Pending decision

---

# ADR-0004 Review — Canonical Database Engine

## Decision Record

- ADR: `ADR-0004`
- Canonical Decision ID: `D-ARCH-002`
- Current ADR Status: `Proposed`
- Current Canonical Status: `PROPOSED`
- Decision Owner: Open — authorized owner must be identified
- Review Date: Pending
- Approval Evidence / Reference: Pending authorized decision

## Proposed Choice

**PostgreSQL as the canonical transactional database engine for GymPulse Phase 1.**

The proposal is based on:

- relational canonical state;
- ACID transaction requirements;
- primary/foreign/unique/check/not-null constraints;
- conditional uniqueness capability where appropriate;
- SQL joins, aggregates, indexing, query planning, and operational reporting;
- idempotency/effect uniqueness;
- backup/restore and operational tooling;
- broad provider availability without binding the engine decision to one provider;
- optional PostgreSQL capabilities such as JSON/JSONB and RLS without bundling them into this decision.

This proposal does **not** select:

```text
managed PostgreSQL provider
exact PostgreSQL production version
ORM/query builder
migration framework
RLS policy
database role model
hosting
job runner
final schema
Member/Membership lifecycle constraints
```

## Why This Decision Exists

GymPulse canonical workflows are relational and transaction-heavy: Attendance duplicate protection, payment/provider event reconciliation, exactly-once business effects, Membership/renewal consistency, retention/no-show uniqueness, audit/history, tenant-scoped operational queries, and reporting.

The engine category needs strong relational integrity and operational tooling without prematurely selecting a hosting/provider/tooling stack.

## Alternatives Considered

### Option A — PostgreSQL

Strengths relevant to GymPulse:

- mature ACID semantics;
- rich constraint/index model including partial unique indexes;
- strong SQL joins/aggregates/windowing/query planning;
- multiple isolation levels;
- JSON/JSONB as bounded supplement;
- optional RLS capability;
- mature backup/restore/WAL/replication/PITR foundations;
- broad managed/local ecosystem.

Tradeoffs include connection management, migration discipline, portability cost from unjustified PostgreSQL-specific features, and risk of over-centralizing business rules into SQL/triggers.

### Option B — MySQL / MariaDB family

A strong credible relational alternative with mature transactions, constraints, indexing, replication, backup, and provider support.

Material GymPulse differences noted by the ADR include less direct conditional/partial uniqueness and MySQL/MariaDB family divergence that would require an exact compatibility choice later.

### Option C — Document / NoSQL-first canonical database

Modern document databases can provide multi-document transactions, unique indexes, validation, replication, and backups.

The tradeoff is that GymPulse's core relationships/integrity are naturally relational, so a document-first model adds embedding/reference decisions, application-managed referential integrity, and less natural cross-entity operational querying without current evidence of a product benefit.

### Option D — Distributed SQL / NewSQL canonical database

Technically credible for relational/ACID/distributed workloads.

Tradeoffs include distributed transaction, latency, retry, topology, capacity, and operational complexity that current Phase 1 requirements do not demonstrate a need for.

## Key Tradeoffs

Positive consequences:

- one mature relational transaction model for correctness-sensitive workflows;
- durable relational/unique/conditional invariants;
- queryable provider-event/payment/effect/audit history;
- strong operational SQL for queues, reconciliation, dashboards, and investigation;
- provider portability at the engine category;
- optional advanced capabilities without requiring another canonical store.

Negative consequences:

- connection management matters under some deployment topologies;
- schema/migration discipline is mandatory;
- poor queries/locks/transactions can cause contention;
- unjustified PostgreSQL-specific features can reduce portability;
- DB capabilities must not replace application/domain ownership.

## Real PostgreSQL Evidence Environment

Successful authorized validation environment:

```text
Authorized disposable GitHub Actions validation runner
Ubuntu 24.04.5
runner 2.337.0

Docker 28.0.4

PostgreSQL image:
postgres:17-bookworm

image digest:
postgres@sha256:639ab7ceb90e13123085b741fb31ef493fba25463002f6da665352e7b534b652

PostgreSQL server:
17.11 (Debian 17.11-1.pgdg12+2)

Node validation runtime:
v22.23.2

validation-only pg client:
8.16.3
```

These versions are validation evidence only:

```text
Observed Validation Version
!=
Accepted Production Version
```

## Stage 3 Technical Evidence

```text
migration from zero                                      PASS
forward migration                                        PASS

attendance uniqueness:
12 attempts -> 1 effective row                           PASS

provider-event dedupe:
12 attempts -> 1 durable claim                           PASS

exactly-once business effect:
12 attempts -> 1 effect claim
            -> 1 target mutation                         PASS
later replay -> unchanged                                PASS

single-active no-show:
12 attempts -> 1 active case                             PASS
resolved history + later active case                     PASS

transaction rollback                                     PASS
tenant-scoped SQL isolation                              PASS
representative bounded relational/history query          PASS
EXPLAIN ANALYZE executed                                 PASS
database error translation                              PASS
```

Observed SQLSTATE evidence:

```text
23505 unique_violation
-> already_applied

23503 foreign_key_violation
-> invalid_reference

23514 check_violation
-> invalid_value
```

Preserve:

```text
SQLSTATE
!=
Application API Error Contract
```

## Stage 6 Technical Evidence

```text
custom pg_dump                                           PASS
restore into separate database                           PASS
restored invariant verification                          PASS
application-style connection                             PASS
concurrent connections                                   PASS
database unavailable behavior                            PASS
disposable PostgreSQL restart                            PASS
reconnect                                                PASS
post-restart replay safety                               PASS
cleanup                                                  PASS
```

Traceability:

```text
validation branch:
validation/postgres-foundation-20260929

validation head:
e257e6ef5f3aa6eb26b159fb4374da06dbfd2d9d

workflow run:
36554395928

workflow job:
109359954215

artifact:
foundation-postgres-evidence

artifact id:
11025937126

artifact sha256:
a4e4f54c3b94c6c16efd4cc259223b374712e758821862239a735978c8d01b2c
```

This traceability does **not** accept GitHub Actions as production CI.

## Validation Boundaries

```text
Validation PostgreSQL
!=
Production PostgreSQL Provider

Temporary PostgreSQL Driver
!=
D-ARCH-017 Acceptance

Docker Validation Container
!=
Production Container Architecture

Explicit Tenant Query
!=
RLS Acceptance

Validation Schema
!=
Production Schema
```

Optional ambiguous commit-window network fault injection:

```text
NOT RUN
```

Durable post-restart replay was directly proven. No ambiguous network-fault evidence is fabricated.

The local restart/recovery proof does not prove:

```text
managed HA
multi-AZ
provider failover
regional DR
PITR
production SLA
production connection topology
```

## D-DATA-007 Relationship

```text
D-DATA-007 remains P1 PROPOSED / unresolved
```

Preserve:

```text
D-DATA-007 unresolved
-> blocks final Member/Membership schema semantics

D-DATA-007 unresolved
!=
automatic blocker to PostgreSQL engine review
```

No final Member/Membership schema is authorized by this packet.

## Remaining Gaps

### Decision-category inputs

The engine-specific bounded technical evidence is complete for owner review.

The authorized owner must still decide whether any unresolved jurisdiction, recovery, operational-support, or deployment constraint materially affects the **database-engine category** decision itself, or whether those concerns belong only to later deployment/provider decisions.

This packet does not answer that governance question for the owner.

### Production-readiness blockers

```text
launch jurisdiction
production region
managed PostgreSQL provider
RPO / RTO
backup retention
production admin / support access
production connection topology
managed HA
multi-AZ / provider failover
PITR
provider SLA
exact supported production PostgreSQL version
production capacity/performance validation
```

Preserve distinction:

```text
Database Engine Decision
!=
Production Database Deployment Readiness
```

### Dependent-decision blockers

Separately governed:

```text
D-ARCH-017 data-access/query/migration tooling
D-SEC-008 RLS/data-layer tenant isolation
D-DATA-007 Member/Membership state ownership
D-ARCH-014 managed backend responsibilities/provider
D-ARCH-009 hosting
D-ARCH-007 background jobs
D-ARCH-008 Redis/cache requirement
database runtime/admin/migration role design
final schema/migrations/indexes
```

### Human-governance blockers

```text
Decision Owner = Open
Explicit Approval = Missing
```

## What Acceptance Would Mean

If later explicitly accepted:

```text
ADR-0004 -> Accepted
D-ARCH-002 -> DECIDED
```

with authorized owner/date/evidence.

That would accept PostgreSQL as the canonical database-engine category.

It would **not** automatically accept:

```text
managed provider
exact PostgreSQL production version
Drizzle
Kysely
Prisma
RLS
pg-boss
hosting
final schema
Member/Membership lifecycle constraints
```

## Reject Path

If rejected later:

- record owner/date/evidence;
- retain ADR-0004 as historical evidence;
- identify explicit replacement database-engine decision work;
- do not silently promote MySQL/MariaDB, document-first, or distributed SQL;
- reassess materially dependent Proposed ADRs/decisions.

## Remain Proposed Path

If `Remain Proposed` is chosen:

- keep `D-ARCH-002` PROPOSED;
- keep the database-engine implementation gate closed;
- record the exact additional decision-category evidence/input required;
- schedule the smallest follow-up governance/evidence action.

## What Remains Proposed Either Way

Managed provider, exact production PostgreSQL version, data-access/migration tooling, RLS, database roles, hosting, jobs, cache, final schema, and D-DATA-007 remain separately governed unless explicitly decided elsewhere.

## Decision Form

Decision Owner:  
Open — authorized owner must be identified

Review Date:  
Pending

Decision:

- [ ] Accept
- [ ] Reject
- [ ] Remain Proposed

Decision Rationale:  
Pending authorized review

Approval Evidence / Reference:  
Pending authorized decision

Canonical Follow-Up If Accepted:  
ADR-0004 -> Accepted; D-ARCH-002 -> DECIDED; record owner/date/evidence; synchronize only database-engine-category documentation.

Canonical Follow-Up If Rejected:  
Record rejection; retain historical ADR; initiate explicit replacement database-engine decision work; reassess materially affected dependent proposals.

Canonical Follow-Up:  
Pending decision

---

# Consolidated Remaining Gaps

## Decision-Category Inputs

- ADR-0001: owner judgment on whether bounded architecture/boundary evidence is sufficient for Phase 1 architecture-style acceptance before the full production module graph exists.
- ADR-0002: owner judgment using current requirements/evidence; no contrary benchmark/team/deployment constraint is currently recorded.
- ADR-0003: final production workspace/package graph and production-scale enforcement do not yet exist; owner decides whether the repository-strategy category can be accepted before scaffold evidence.
- ADR-0004: owner decides whether unresolved jurisdiction/recovery/deployment constraints materially affect the engine category or only later provider/deployment readiness.

## Production-Readiness Blockers

Across the batch, production readiness still requires the relevant combination of:

- production frameworks and deployment topology;
- production provider integrations;
- production observability;
- package/workspace/CI implementation;
- exact supported runtime/database versions;
- database provider/region/jurisdiction;
- RPO/RTO/backup-retention;
- managed HA/failover/PITR;
- production connection topology and access model;
- final schema/data-access/RLS decisions;
- production performance/capacity evidence.

## Dependent-Decision Blockers

Acceptance of this foundation batch does not silently decide:

```text
D-ARCH-003 API contracts
D-ARCH-004 authentication/session
D-ARCH-006 API deployment
D-ARCH-007 background jobs
D-ARCH-008 Redis/cache
D-ARCH-009 hosting
D-ARCH-011 package manager
D-ARCH-012 Owner/Staff framework
D-ARCH-013 Member client strategy
D-ARCH-014 managed backend
D-ARCH-015 authorization implementation
D-ARCH-017 data-access/migrations
D-ARCH-018 testing toolchain
D-ARCH-019 CI/CD
D-SEC-008 RLS/data-layer isolation
D-DATA-007 Member/Membership state ownership
provider selections
production schema
```

## Human-Governance Blockers

For all four ADRs:

```text
Decision Owner = Open
Explicit Approval = Missing
Review Date = Pending
Decision = Pending
Approval Evidence / Reference = Pending
```

No test result, merged file, Git commit, CI run, or technical recommendation substitutes for explicit authorized governance evidence.

# Required Authorized Human Review

The next bounded action is:

```text
Authorized Foundation Decision Review
```

The authorized owner must choose separately for each ADR:

```text
ADR-0001:
[ ] Accept
[ ] Reject
[ ] Remain Proposed

ADR-0002:
[ ] Accept
[ ] Reject
[ ] Remain Proposed

ADR-0003:
[ ] Accept
[ ] Reject
[ ] Remain Proposed

ADR-0004:
[ ] Accept
[ ] Reject
[ ] Remain Proposed
```

No box is selected by this packet.

# Canonical Synchronization Rules After A Future Authorized Decision

Only after explicit authorized evidence exists:

- update the relevant ADR status/owner/date/reference;
- update only its matching canonical decision to `DECIDED` if accepted;
- synchronize affected canonical architecture/documentation;
- open only the implementation gate that the accepted decision actually permits;
- keep unrelated downstream decisions unchanged.

If rejected, retain the ADR historically and create explicit replacement decision work rather than promoting an alternative implicitly.

If left Proposed, record the smallest concrete missing evidence/input and keep that decision's implementation gate closed.

# Final Prepared State

```text
Foundation Decision-Owner Review Packet = PREPARED

ADR-0001 = Proposed
ADR-0002 = Proposed
ADR-0003 = Proposed
ADR-0004 = Proposed

D-ARCH-005 = PROPOSED
D-ARCH-016 = PROPOSED
D-ARCH-001 = PROPOSED
D-ARCH-002 = PROPOSED

Decision Owner = Open
Explicit Approval = Missing

Production implementation gate = closed

Next bounded action:
Authorized Foundation Decision Review
```
