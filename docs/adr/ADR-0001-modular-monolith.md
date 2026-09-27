# ADR-0001: Phase 1 Modular Monolith Architecture

## Status

`Proposed`

## Decision Metadata

- ADR: `ADR-0001`
- Primary Decision ID: `D-ARCH-005`
- Related Decision IDs: `D-ARCH-001`, `D-ARCH-003`, `D-ARCH-006`, `D-ARCH-007`, `D-ARCH-014`, `D-ARCH-015`, `D-ARCH-016`, `D-ARCH-017`, `D-ARCH-019`, `D-SEC-008`, `D-DATA-007`
- Decision Owner: `Open`
- Technical Owner: `Architecture`
- Date Proposed: `2026-08-20`
- Date Accepted: `Not accepted`
- Supersedes: `None`
- Superseded By: `None`

## 1. Context

GymPulse Phase 1 is an operations and retention product centered on attendance, inactivity detection, staff follow-up, member return, renewal, verified payment, notifications, basic add-ons, audit, and data-quality workflows.

The current architecture already defines:

- explicit tenant/gym/branch scope,
- server-side principal and capability authorization,
- application command/query orchestration,
- explicit Phase 1 domain ownership,
- transaction and Unit-of-Work boundaries,
- request/job/provider/business-effect idempotency,
- provider ports/adapters,
- durable asynchronous continuation,
- background execution that reuses application/domain rules,
- canonical persistence as business truth,
- operational read models that are not alternate write authorities,
- audit and observability as cross-cutting responsibilities.

Those are logical/application boundaries. They are not a requirement to deploy one network service per domain.

`D-ARCH-005` asks how these boundaries should be organized for Phase 1. The canonical decision register currently marks the modular-monolith direction as `PROPOSED`, not `DECIDED`.

The architecture-style choice matters because GymPulse has correctness-sensitive cross-domain workflows. Examples include:

```text
Attendance
  -> Retention case resolution

Renewal Order
  -> Payment verification
  -> Payment effect
  -> Membership entitlement
  -> Receipt / Notification continuation

Authorized staff action
  -> Domain mutation
  -> Audit evidence
```

Prematurely splitting these responsibilities across network services introduces distributed failure and consistency concerns before there is evidence that independent deployment or scaling is required. Conversely, putting all logic into one unstructured application would remove the module ownership and testing seams required by the current architecture.

This ADR therefore evaluates the architecture style only. It does not choose the repository tool, programming language/runtime, database engine, API topology, managed backend, job runner, hosting platform, provider, ORM/data-access tool, or RLS mechanism.

## 2. Requirements and Decision Drivers

### 2.1 Primary functional drivers

- `FR-AUTHZ-001` tenant-scoped authorization
- `FR-AUTHZ-002` named capability enforcement
- `FR-ATTENDANCE-003` exactly one canonical attendance on successful check-in
- `FR-ATTENDANCE-006` retry-safe attendance
- `FR-RETENTION-005` single active no-show case
- `FR-RETURN-001` valid attendance can resolve an eligible no-show case
- `FR-RENEWAL-004` renewal order is separate from payment
- `FR-RENEWAL-006` payment initiation does not extend membership
- `FR-PAYMENT-002` verified provider evidence is payment truth
- `FR-PAYMENT-005` duplicate provider callback safety
- `FR-PAYMENT-006` exactly-once membership effect
- `FR-PAYMENT-007` exactly-once add-on effect
- `FR-NOTIFICATION-002` notification retry deduplication
- `FR-AUDIT-001` sensitive action audit
- `FR-AUDIT-003` audit integrity
- `FR-CROSS-001` server-side canonical truth
- `FR-CROSS-002` idempotent critical effects
- `FR-CROSS-003` explicit tenant context
- `FR-CROSS-004` gym-local timezone correctness

### 2.2 Primary non-functional drivers

- `NFR-SECURITY-001` tenant isolation
- `NFR-SECURITY-002` least privilege
- `NFR-SECURITY-003` server-side authorization
- `NFR-SECURITY-009` auditability
- `NFR-RELIABILITY-001` idempotent critical mutations
- `NFR-RELIABILITY-002` payment exactly-once effect
- `NFR-RELIABILITY-003` retry-safe scheduled jobs
- `NFR-RELIABILITY-004` database-enforced invariants where practical
- `NFR-RELIABILITY-005` canonical source of truth
- `NFR-AVAILABILITY-001` non-critical dependency isolation
- `NFR-AVAILABILITY-003` job failure visibility
- `NFR-SCALABILITY-002` modular boundaries before distributed services
- `NFR-SCALABILITY-003` horizontal evolution of stateless application components
- `NFR-SCALABILITY-004` separable asynchronous work
- `NFR-SCALABILITY-005` no premature microservices
- `NFR-MAINTAINABILITY-001` shared domain rules
- `NFR-MAINTAINABILITY-003` provider abstraction
- `NFR-MAINTAINABILITY-005` documentation synchronization
- `NFR-MAINTAINABILITY-006` ADR governance for major architecture choices
- `NFR-TESTABILITY-001` deterministic domain tests
- `NFR-TESTABILITY-003` failure injection
- `NFR-TESTABILITY-004` authorization matrix tests
- `NFR-TESTABILITY-005` time-controlled tests
- `NFR-OBSERVABILITY-001..007` structured diagnostics and correlation
- `NFR-OPERATIONS-005` routine staff workflows must not require developer intervention

### 2.3 Architecture-principle drivers

The decision is especially constrained by:

- `ARCH-PRIN-001` Tenant Isolation by Design
- `ARCH-PRIN-002` Authentication and Authorization Are Separate Responsibilities
- `ARCH-PRIN-003` Capability-Based Permissions
- `ARCH-PRIN-004` Deterministic Server-Side Business Truth
- `ARCH-PRIN-005` Financial Correctness Before Convenience
- `ARCH-PRIN-006` Idempotent Critical Effects
- `ARCH-PRIN-009` Explicit Domain and State Ownership
- `ARCH-PRIN-010` Transactional Consistency for Correctness-Sensitive Changes
- `ARCH-PRIN-011` Async Side Effects Are Isolated From Canonical Transactions
- `ARCH-PRIN-012` Provider Abstraction at Integration Boundaries
- `ARCH-PRIN-013` Failure Visibility and Reconciliation
- `ARCH-PRIN-014` Observability by Design
- `ARCH-PRIN-016` Secure Defaults and Least Privilege
- `ARCH-PRIN-017` Modular Monolith Before Microservices, currently proposed pending this ADR
- `ARCH-PRIN-018` No Premature Infrastructure
- `ARCH-PRIN-019` Evolution Through Explicit Decisions

## 3. Constraints and Assumptions

This proposal must preserve the already-defined C4/container/component/data-flow architecture.

In particular:

1. Domain modules own canonical state transitions.
2. Application command handlers own cross-domain orchestration.
3. Cross-domain direct table writes are not an approved architecture pattern.
4. Background handlers reuse application/domain use cases rather than owning a second copy of business rules.
5. Provider SDKs remain behind provider adapters/ports.
6. Request idempotency, job dedupe, provider-event dedupe, and business-effect uniqueness remain distinct mechanisms.
7. External provider calls are not part of a local atomic transaction.
8. Read models may combine data for queries but do not become alternate mutation owners.
9. API deployment topology remains open under `D-ARCH-006`.
10. Background-job technology remains open under `D-ARCH-007`.
11. Database engine remains proposed under `D-ARCH-002`.
12. Repository strategy remains proposed under `D-ARCH-001`.
13. Member vs Membership lifecycle ownership remains unresolved under `D-DATA-007`.
14. Phase 1 does not require one independently deployable service per domain.
15. Future extraction must be possible when evidence justifies it, but extraction must not be paid for in operational complexity before that evidence exists.

## 4. Options Considered

### Option A: Modular monolith with explicit domain/component boundaries

One application architecture contains explicit modules for Phase 1 domains and cross-cutting application components. Modules are separated by source-code dependencies, application contracts, ownership rules, tests, and review rules rather than network boundaries.

Conceptually:

```text
Trusted Application
  ├── Identity/AuthZ
  ├── Members
  ├── Memberships
  ├── Attendance
  ├── Retention/Follow-up
  ├── Renewals
  ├── Payments
  ├── Add-ons
  ├── Notification Policy
  ├── Audit/Data Quality
  └── Shared application infrastructure ports
```

The web/API runtime and background execution runtime may be separate processes/deployables if later decisions choose that mapping, while still using the same application/domain architecture.

A modular monolith does not mean:

- one giant source file,
- controllers directly writing arbitrary tables,
- all components tightly coupled,
- one mandatory deployment process forever,
- no asynchronous work,
- no provider boundaries,
- no future service extraction.

### Option B: Service-per-domain / microservices from Phase 1

Deploy major domains as separate networked services from the beginning, for example separate Attendance, Retention, Membership, Payment, Notification, and Identity services.

Typical consequences would include:

- independent service APIs/contracts,
- separate deployment and operational ownership,
- distributed tracing as a baseline requirement,
- network failure between domain operations,
- distributed consistency/saga/outbox requirements for workflows that are local transactions in Option A,
- more complex local development and integration testing,
- more complex secrets/service-identity management,
- potential independent scaling/deployment benefits.

### Option C: Unstructured single application with weak internal boundaries

Keep one application/deployable and optimize purely for immediate coding convenience. Controllers/routes, database access, provider calls, and business rules may call each other freely with limited module ownership.

Typical characteristics:

- shared generic service/helper layers,
- direct database access from routes/workers,
- role checks scattered through controllers,
- provider SDK usage inside business flows,
- duplicate business logic between requests and jobs,
- cross-domain writes without an owning application contract.

This is operationally simple at first but structurally conflicts with the architecture already established for GymPulse.

## 5. Evaluation

| Criterion | Option A: Modular monolith | Option B: Phase 1 microservices | Option C: Unstructured application |
|---|---|---|---|
| Phase 1 operational simplicity | Strong | Weak | Strong initially |
| Explicit domain ownership | Strong if enforced | Strong by service boundary | Weak |
| Transactional correctness | Strong for local cross-domain orchestration | More distributed-consistency work | Possible but ownership unclear |
| Payment/attendance idempotency | Straightforward with shared persistence/application transaction patterns | More coordination and event-delivery concerns | Easy to implement inconsistently |
| Tenant authorization consistency | Central reusable policy with module/resource checks | Must be consistently propagated across services | High risk of scattered checks |
| Shared domain rules | Strong | Requires shared packages/contracts or duplication avoidance across services | High duplication risk |
| Background-job rule reuse | Strong | Requires remote calls or shared libraries/services | High worker-specific logic risk |
| Provider isolation | Strong through ports/adapters | Strong when service boundaries are well designed | Easy to leak SDKs into business code |
| Local development | Moderate/Strong | Weakest | Strong initially |
| Integration testing | Strong with module/application + real persistence tests | Higher environment/network complexity | Tests become broad and fragile |
| Deployment independence | Moderate; selected runtimes can split | Strong | Weak/implicit |
| Independent domain scaling | Later extraction required | Strong from day one | Poor |
| Failure surface | Lower | Highest | Lower runtime surface, higher code-coupling risk |
| Observability complexity | Moderate | High | Low initially but poor ownership diagnostics |
| Reversibility | High if boundaries are real | Medium/Low because service topology becomes embedded | Medium/Low because untangling code becomes costly |
| Alignment with `NFR-SCALABILITY-002/005` | Strong | Weak | Weak |
| Alignment with current C4/component model | Strong | Possible but exceeds current need | Weak |

### 5.1 Why Option B is not recommended for Phase 1

Microservices can be appropriate when one or more of the following become real:

- a module requires materially different scaling characteristics,
- a separate team owns and releases a domain independently,
- security/compliance needs demand a stronger process/data boundary,
- availability isolation is impossible to achieve acceptably inside the current deployment,
- technology/runtime specialization has measured benefit,
- change/release coupling becomes an operational bottleneck,
- one domain's workload threatens others despite normal scaling and query/job isolation.

The current repository evidence does not establish those conditions for Phase 1.

Splitting now would add distributed failure and data-consistency problems to workflows whose most important requirements are transactionality, idempotency, auditability, tenant isolation, and fast pilot iteration.

### 5.2 Why Option C is not recommended

The project already depends on explicit ownership and reusable policy boundaries. An unstructured application would undermine:

- `NFR-MAINTAINABILITY-001` shared domain rules,
- `NFR-TESTABILITY-001` deterministic domain tests,
- `NFR-SECURITY-003` consistent server-side authorization,
- `NFR-RELIABILITY-001..004` replay/concurrency protections,
- provider abstraction,
- future extraction without rewriting business semantics.

The distinction between Option A and Option C is therefore not the number of deployables. It is whether application/domain boundaries are intentionally enforced.

## 6. Proposed Decision

**Propose Option A: a modular monolith with explicit domain and component boundaries for GymPulse Phase 1.**

This proposal means:

1. Phase 1 business domains are modules with explicit write ownership.
2. Application command/query handlers orchestrate use cases across modules.
3. Domain modules expose intentional application/domain contracts rather than arbitrary internal table access.
4. Route/controllers and background workers remain thin adapters around the same application/domain behavior.
5. Repository/data-access implementations remain behind module/application ports where appropriate.
6. Provider integrations remain behind provider ports/adapters.
7. Correctness-sensitive changes use local transactions when the required data is under one canonical persistence boundary.
8. Async continuation is used when work must cross process/provider boundaries or should not block canonical transactions.
9. Read models may span modules for authorized queries, while canonical mutation remains with owning modules.
10. Network service boundaries are introduced only through a later Accepted ADR supported by operational/security/ownership evidence.

This proposal does **not** decide:

- monorepo vs multi-repository (`D-ARCH-001`),
- TypeScript/Node.js (`D-ARCH-016`),
- PostgreSQL (`D-ARCH-002`),
- web/API co-hosting vs separate API (`D-ARCH-006`),
- worker/job technology (`D-ARCH-007`),
- managed backend (`D-ARCH-014`),
- data-access tooling (`D-ARCH-017`),
- hosting (`D-ARCH-009`),
- provider selections,
- RLS implementation (`D-SEC-008`).

## 7. Consequences

### Positive consequences

- Correctness-sensitive cross-domain workflows can use one clearly owned transaction boundary where appropriate.
- Tenant/resource/capability authorization can be applied consistently through common application-security components.
- Background jobs can reuse the same use cases and domain policies as interactive requests.
- Provider-specific behavior remains isolated without multiplying integration services.
- Local development, migrations, integration tests, and debugging remain simpler than a service-per-domain topology.
- Domain boundaries exist before any future service extraction, reducing the risk that later extraction is a full rewrite.
- Architecture complexity is proportional to current Phase 1 requirements rather than hypothetical scale.

### Negative consequences

- A weakly enforced modular monolith can decay into an unstructured monolith.
- Independent deployment of one domain is not available automatically.
- A shared persistence boundary can allow accidental cross-domain coupling unless repository/write ownership is enforced.
- Build/test time can grow as the application grows unless repository/package/CI decisions later introduce affected-scope execution.
- One application runtime failure can affect multiple modules unless process/deployment and workload isolation are designed carefully.
- Teams must actively maintain module contracts because the compiler/database will not automatically provide the same isolation as a network boundary.

## 8. Security and Privacy Impact

The proposed style supports the security model but does not provide security automatically.

Required controls remain:

- authentication verification is separate from GymPulse authorization,
- every protected use case resolves principal, tenant/resource scope, and capability,
- module boundaries must not bypass authorization by exposing unrestricted data helpers to transports,
- background jobs use explicit system actor and tenant/gym context,
- provider secrets remain server-side in integration adapters,
- sensitive mutations remain auditable,
- logs/telemetry minimize PII and secrets,
- future RLS/database defense in depth remains a separate decision.

A modular monolith can reduce service-to-service authentication complexity in Phase 1, but that benefit must not be used to justify broad in-process authority. Internal module calls still require application contracts that preserve business and tenant invariants.

## 9. Reliability, Performance, and Scalability Impact

### Reliability

The architecture favors local atomic transactions for invariants such as:

- one canonical attendance effect,
- one active no-show case for a context,
- canonical payment state + payment-effect claim + entitlement mutation where designed as one transaction,
- sensitive mutation + required audit evidence where atomicity is required.

External providers remain outside local transactions and use durable state, retries, reconciliation, and idempotency.

### Performance

Phase 1 performance should first be addressed with:

- indexed tenant-aware queries,
- bounded/paginated reads,
- purpose-specific read components,
- appropriate transaction design,
- asynchronous separation of non-critical/provider work.

Microservice decomposition is not a performance optimization by default and may add network latency.

### Scalability

The proposed style must keep application components stateless with respect to permanent business state so that web/API and worker processes can scale horizontally when hosting/runtime decisions permit.

If one module later becomes a measured bottleneck, the module boundary should make extraction possible without changing the product/domain meaning.

## 10. Operations and Observability Impact

Compared with Phase 1 microservices, the proposed style reduces the number of independently deployed and monitored services.

However, observability must remain module/use-case aware. Logs/traces/metrics should preserve fields such as:

```text
request_id / correlation_id
job_id
use_case / query / job type
module/domain
safe tenant/gym/branch context
canonical resource ID
provider event/reference where safe
result/error code
latency
```

Operational diagnostics still need to distinguish:

- payment verification/reconciliation failure,
- duplicate provider events,
- attendance rejection/dedupe,
- no-show job failure,
- notification delivery failure,
- authorization denial,
- data-quality issue lifecycle.

A single deployable must not become a single undifferentiated log stream with no domain/use-case context.

## 11. Testing and Validation

Before this ADR could be accepted and used as a scaffold gate, validate that the architecture can enforce modularity through executable tests and dependency rules.

Minimum validation evidence:

1. A representative protected command passes through principal -> scope -> capability -> validation -> application handler -> domain owner.
2. Attendance logic is testable without UI/framework execution.
3. A duplicate attendance request produces one effective attendance under concurrency/retry tests.
4. A payment callback adapter can be tested separately from the Payments domain and application effect logic.
5. Duplicate provider events and distinct duplicate success events apply one business effect.
6. A background handler invokes the same application/domain behavior as an interactive path rather than copying rules.
7. An attempted cross-domain direct write is prohibited by source/package/repository conventions or review/static checks selected later.
8. Authorization negative tests cover cross-tenant and cross-branch access.
9. Time-controlled tests cover gym-local no-show/renewal logic.
10. Module-aware observability identifies the failing use case without exposing secrets/PII.

These tests do not require all final technologies to be selected before the architecture style is reviewed.

## 12. Migration and Rollout

There is no existing production service topology to migrate in this documentation phase.

If accepted, implementation should establish boundaries incrementally:

```text
entry adapters
  -> application commands/queries
  -> domain modules
  -> ports
  -> infrastructure adapters
```

Initial source packaging should focus on ownership and dependency direction rather than creating one package/service per conceptual component.

When legacy planning documents describe a separate `api/`, `jobs/`, or domain package, those descriptions remain implementation candidates. This ADR would accept an architecture style, not a specific folder tree.

## 13. Reversibility

The proposal is intentionally designed for later extraction.

A module is a candidate for service extraction only when evidence shows a concrete benefit. A future extraction ADR should evaluate at least:

- independent scaling requirement,
- separate team/release ownership,
- stronger security/compliance isolation,
- failure-domain isolation need,
- different runtime/data-store requirement,
- unacceptable release coupling,
- measured throughput/latency bottleneck,
- operational maturity to own distributed retries, tracing, deployment, and incident response.

Before extraction, the module should already have:

- explicit application/domain contracts,
- clear write ownership,
- minimal direct cross-module data mutation,
- provider/infrastructure isolation,
- tests around its public behaviors,
- event/continuation contracts where asynchronous integration is needed.

This makes the move from module boundary to network boundary an architecture evolution rather than a domain redesign.

## 14. Risks and Mitigations

### Risk: modular monolith degenerates into a big ball of mud

Mitigations:

- explicit module ownership,
- dependency-direction rules,
- no route/worker ad-hoc SQL,
- no cross-domain direct writes,
- architecture tests/static import rules where useful,
- code review against component ownership,
- domain-focused test suites.

### Risk: shared database encourages coupling

Mitigations:

- repository/data-access ownership by domain/use case,
- cross-domain queries handled through explicit read components,
- application handlers orchestrate cross-domain mutations,
- future data-access strategy must preserve transaction and ownership semantics.

### Risk: background workers become a second application

Mitigations:

- workers invoke shared application commands/queries,
- job payloads contain scoped identifiers rather than copied mutable business state,
- worker-specific code owns scheduling/retry mechanics, not domain rules.

### Risk: one runtime becomes a broad failure domain

Mitigations:

- keep non-critical provider work asynchronous,
- separate background execution process/deployable when selected,
- health checks/resource controls at deployment layer,
- later extraction if measured failure isolation requires it.

### Risk: future scale is harder than starting with microservices

Mitigation:

The proposal deliberately pays for strong module contracts now and defers network/process complexity until there is evidence. The extraction criteria above become the trigger for a future ADR.

## 15. Open Questions

This ADR does not require these questions to be resolved before review, but they affect implementation after acceptance:

- `D-ARCH-016`: primary language/runtime
- `D-ARCH-001`: repository/workspace strategy
- `D-ARCH-002`: canonical database engine
- `D-ARCH-017`: data-access/migration tooling
- `D-ARCH-003`: API contract architecture
- `D-ARCH-006`: API deployment topology
- `D-ARCH-007`: durable background-job technology
- `D-ARCH-014`: managed backend responsibilities
- `D-ARCH-015`: exact authorization implementation
- `D-SEC-008`: RLS/data-layer isolation
- `D-ARCH-009`: hosting
- `D-ARCH-019`: CI/CD/release/secrets tooling
- `D-DATA-007`: Member vs Membership lifecycle ownership

## 16. Decision Evidence

### Current evidence supporting the proposal

- Canonical NFRs explicitly state that Phase 1 should use a modular monolith or equivalent simple deployment model with domain boundaries before distributed services (`NFR-SCALABILITY-002`).
- Canonical NFRs explicitly prohibit requiring microservices solely for hypothetical scale (`NFR-SCALABILITY-005`).
- Canonical maintainability requirements prohibit duplicating core business rules across member, staff, and background execution paths (`NFR-MAINTAINABILITY-001`).
- Canonical testability requirements require deterministic domain tests outside full UI execution (`NFR-TESTABILITY-001`).
- Current component architecture already models domains/components as source-code/application boundaries and explicitly says they are not mandatory processes or microservices.
- Current data flows repeatedly depend on local transactional correctness, explicit idempotency layers, and provider-boundary reconciliation.
- Current technology evaluation rates the modular-monolith direction as high-confidence but explicitly leaves `D-ARCH-005` `PROPOSED` pending ADR/decision-owner approval.

### Acceptance-readiness evidence update — 2026-09-27

The validation-only harness at `../../validation/foundation/` now provides partial non-production evidence for this ADR:

- strict source-boundary checking reports no violations in the validation source;
- a deliberate client-to-server forbidden import is detected;
- deliberate dependency-cycle fixtures are detected;
- request and worker adapters reuse the same application `checkIn` behavior;
- cross-tenant, cross-branch, and capability negative paths pass;
- malformed external input is rejected before application/domain execution;
- request replay and worker replay return one effective attendance result using validation-only durable state;
- gym-local date behavior is tested across a UTC -> `Asia/Kolkata` date boundary;
- correlation identifiers survive request/worker adapter paths.

This is supporting evidence, not production implementation and not approval.

Remaining acceptance gaps include:

- authorized decision owner is not identified in canonical evidence;
- no explicit approval record exists;
- real database concurrency/transaction evidence is still missing;
- the narrow harness does not yet prove broader multi-domain direct-write prevention in a production-scale module graph;
- provider-event/business-effect evidence is validation-only and does not yet prove the full payment-domain effect path;
- production module-aware observability remains separately governed.

Therefore this ADR remains `Proposed`.

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
- `README.md`
- legacy migration evidence: `../05-system-architecture.md`
- legacy migration evidence: `../15-engineering-workflow.md`
