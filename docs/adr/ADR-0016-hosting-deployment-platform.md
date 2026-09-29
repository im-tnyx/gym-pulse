
# ADR-0016: Hosting and Deployment Platform

## Status

`Proposed`

## Decision Metadata

- ADR: `ADR-0016`
- Primary Decision ID: `D-ARCH-009`
- Related Decision IDs: `D-ARCH-006`, `D-ARCH-007`, `D-ARCH-012`, `D-ARCH-013`, `D-ARCH-016`, `D-ARCH-002`, `D-ARCH-017`, `D-ARCH-014`, `D-ARCH-004`, `D-ARCH-015`, `D-SEC-008`, `D-SEC-001`, `D-ARCH-019`, `D-ARCH-018`, `D-ARCH-010`, `D-ARCH-008`, `D-PROVIDER-006`
- Decision Owner: `Open`
- Technical Owner: `Architecture / Platform / Security / Reliability`
- Date Proposed: `2026-09-26`
- Date Accepted: `Not accepted`
- Supersedes: `None`
- Superseded By: `None`

## 1. Context

GymPulse now has enough draft-level runtime architecture to evaluate hosting without collapsing unrelated architecture decisions into a provider choice.

ADR-0014 proposes a Phase 1 request-serving boundary in which the Owner/Staff web server and trusted HTTP/API transport may be co-hosted while application, domain, authorization, persistence, and provider boundaries remain framework-independent and extractable. ADR-0015 separately proposes durable background execution in a Background Worker Runtime.

The resulting conceptual topology is:

```text
Public HTTPS
    |
    v
Owner/Staff Web + Trusted HTTP/API Runtime
    |
    +------> Canonical Persistence / External Providers
    |
    +------> Durable Continuation
                 |
                 v
          Background Worker Runtime
                 |
                 +------> Canonical Persistence / External Providers
```

Hosting therefore needs to support at least these independently scalable/failable responsibilities:

1. Owner/Staff Web + Trusted HTTP/API Runtime.
2. Background Worker Runtime.
3. Member web/static/runtime responsibility when separately deployed.
4. Controlled migration/release execution.

External dependencies remain separately governed:

- canonical database,
- authentication provider,
- payment provider,
- messaging provider,
- object storage,
- observability backend.

Canonical `D-ARCH-009` remains `P1 OPEN`. No hosting provider, production region, cloud account, or deployment environment has been approved or provisioned.

The decision question is:

> What hosting/deployment platform model best supports GymPulse Phase 1 request-serving, separate durable workers, security boundaries, database/provider connectivity, observability, deployments, and future extraction while minimizing unnecessary operational complexity?

This ADR proposes a hosting category and current provider direction. It does not provision infrastructure and does not promote `D-ARCH-009` to `DECIDED`.

## 2. Requirements and Decision Drivers

### 2.1 Security and privacy

Relevant current requirements include:

- `NFR-SECURITY-001` tenant/gym/branch isolation.
- `NFR-SECURITY-002` least privilege.
- `NFR-SECURITY-003` server-side authorization.
- `NFR-SECURITY-004` secret protection.
- `NFR-SECURITY-005` encryption in transit.
- `NFR-SECURITY-006` infrastructure encryption-at-rest capability.
- `NFR-SECURITY-008` provider webhook verification.
- `NFR-SECURITY-009` auditability.
- `NFR-SECURITY-011` sensitive error/log minimization.
- `NFR-PRIVACY-001..006` minimization, purpose separation, protected exports, analytics minimization, unresolved retention, and future data-right workflows.

`D-SEC-001` remains `P0 OPEN`, so no region/provider can be treated as legally sufficient merely because it is technically available.

### 2.2 Reliability and availability

- `NFR-RELIABILITY-001..008` require retry-safe critical work, exactly-once intended payment effects, retry-safe jobs, durable invariants, canonical server truth, gym-local time, retry diagnosis, and reconciliation.
- `NFR-AVAILABILITY-001` requires non-critical dependency isolation.
- `NFR-AVAILABILITY-002` requires visible messaging-degradation state.
- `NFR-AVAILABILITY-003` requires visible failed jobs and retry/dead-letter or equivalent recovery.
- `NFR-AVAILABILITY-004` requires production backup/restore capability and a tested restore process.
- `NFR-AVAILABILITY-005` keeps formal RPO/RTO targets open.

### 2.3 Performance and scalability

- `NFR-PERFORMANCE-001` check-in should feel immediate under normal conditions.
- `NFR-PERFORMANCE-002..004` require efficient indexed/bounded operational queries.
- `NFR-PERFORMANCE-005` keeps provider latency outside long correctness-critical DB transactions.
- `NFR-PERFORMANCE-006` requires bounded purpose-specific Member API payloads.
- `NFR-SCALABILITY-001` requires explicit tenant ownership.
- `NFR-SCALABILITY-002` favors a simple modular Phase 1 architecture.
- `NFR-SCALABILITY-003` requires stateless horizontal evolution.
- `NFR-SCALABILITY-004` requires asynchronous work to remain separable from interactive requests.
- `NFR-SCALABILITY-005` prohibits premature microservice decomposition.

### 2.4 Operations, observability, maintainability, and testing

- `NFR-OBSERVABILITY-001..007` require structured request/job logs, safe context, error monitoring, payment/job diagnostics, health signals, and correlation.
- `NFR-MAINTAINABILITY-001` prohibits duplicating core business rules between web and workers.
- `NFR-MAINTAINABILITY-004` requires auditable migration discipline.
- `NFR-MAINTAINABILITY-005..006` require Docs-as-Code and ADR governance.
- `NFR-TESTABILITY-001..005` require deterministic domain tests, provider simulation, failure injection, authorization tests, and controlled time.
- `NFR-OPERATIONS-001` requires environment separation.
- `NFR-OPERATIONS-002` prohibits casual production-secret reuse outside production.
- `NFR-OPERATIONS-003` requires migration safety.
- `NFR-OPERATIONS-004` requires release smoke testing.
- `NFR-OPERATIONS-005` requires normal operations without routine developer intervention.

### 2.5 Functional workflow drivers

Hosting must preserve current correctness semantics for:

- attendance/check-in retry safety,
- retention and no-show scans,
- renewal scans/reminder suppression,
- verified payment webhooks,
- payment reconciliation,
- notification dispatch,
- owner summaries,
- data-quality scans,
- audit attribution,
- explicit tenant context under `FR-CROSS-003`,
- gym-local time under `FR-CROSS-004`.

### 2.6 Primary decision drivers

The hosting model should provide:

1. low Phase 1 operational burden;
2. clear request-runtime versus worker-runtime separation;
3. conventional regional server semantics for transactional work;
4. secure/minimized public exposure;
5. predictable DB locality and connection behavior;
6. long-lived/separate worker compatibility;
7. stateless disposable request instances;
8. meaningful health/readiness behavior;
9. graceful request/worker shutdown;
10. independent web/API and worker scaling;
11. stable public HTTPS for callbacks;
12. environment-scoped server secrets;
13. controlled migration/release execution;
14. rollback/forward-fix support;
15. provider-neutral telemetry/correlation;
16. explicit region/residency gate;
17. future API extraction;
18. provider exit/reversibility;
19. no mandatory Kubernetes, Redis, or edge-first runtime without evidence.

## 3. Constraints and Assumptions

1. `D-ARCH-009` remains `OPEN`; this ADR is `Proposed`.
2. `D-ARCH-006` remains `OPEN`; ADR-0014 is Proposed.
3. `D-ARCH-007` remains `OPEN`; ADR-0015 is Proposed.
4. `D-ARCH-012` remains `PROPOSED`; Next.js is not accepted.
5. `D-ARCH-013` remains `PROPOSED`; browser-first Member delivery is not accepted.
6. `D-ARCH-016` is `DECIDED`; strict TypeScript + supported Node.js LTS is accepted, while exact runtime version remains separate.
7. `D-ARCH-002` is `DECIDED`; PostgreSQL is the accepted canonical database engine, while provider/region/recovery topology remain separate.
8. `D-ARCH-017` remains `PROPOSED`; no persistence tool is accepted.
9. `D-ARCH-014` remains `OPEN`; hosting does not select DB/Auth/Storage/RLS responsibilities.
10. `D-ARCH-004` remains `OPEN`; no Auth/session provider is selected.
11. `D-ARCH-015` remains `PROPOSED`; hosting does not replace GymPulse authorization.
12. `D-SEC-008` remains `OPEN`; hosting must remain compatible with safe pooled transaction context if RLS is later accepted.
13. `D-SEC-001` remains `P0 OPEN`; production provider/region acceptance is gated on jurisdiction/privacy requirements.
14. `D-ARCH-019` remains `OPEN`; final CI/CD/release/secrets tooling is separate.
15. `D-PROVIDER-006` remains `OPEN`; provider-native logs are supplemental.
16. Request instances are disposable/stateless.
17. Application-local filesystem is assumed ephemeral/non-shared and is not canonical persistence.
18. Worker services do not require public inbound exposure by default.
19. Provider Cron is not canonical scheduler semantics merely because a host offers it.
20. Production migrations do not race from every request/worker replica at startup.
21. Multi-region active-active is not a Phase 1 baseline.
22. Edge execution is optional and workload-specific.
23. Physical deployment topology is separate from public DNS/origin topology.
24. One vendor may host several deployables, but web/API and worker retain independent lifecycle/scaling roles.

## 4. Runtime and Deployable-Unit Model

### 4.1 Conceptual deployables

```text
Deployable A
Owner/Staff Web + Trusted HTTP/API Runtime
  -> public HTTPS
  -> stateless request serving
  -> callback/webhook entry
  -> shared application/domain/security modules
  -> canonical persistence/providers

Deployable B
Background Worker Runtime
  -> outbound-only/private by default
  -> durable-job consumer
  -> shared application/domain/security modules
  -> canonical persistence/providers

Optional Deployable C
Member web/static/runtime responsibility
  -> untrusted client of ADR-0011 API

Controlled Release/Migration Runner
  -> one-off privileged execution only as required
  -> not a permanently privileged web/worker replica
```

### 4.2 Compute independence

```text
web/API process
!=
worker process
```

Even when one vendor hosts both, they should be independently deployable/scalable where practical.

### 4.3 Request runtime requirements

If current runtime/framework proposals are later accepted, the host should support:

- conventional supported Node server deployment,
- framework build output,
- Route Handlers/Server Functions as thin adapters,
- ordinary JSON HTTPS requests,
- secure browser sessions,
- provider callbacks preserving signature inputs/raw body where required,
- DB transactions,
- durable job handoff,
- horizontal replicas,
- graceful termination.

### 4.4 Worker runtime requirements

The host should support a separate worker that can:

- run continuously or according to the approved job-runtime lifecycle,
- connect securely to canonical persistence,
- claim durable work,
- retry safely,
- receive termination signals,
- recover after crash/deploy,
- operate across tenants with explicit scope,
- scale separately,
- emit logs/metrics/traces.

Scale-to-zero is not assumed compatible with a continuously polling worker.

## 5. Network and Trust Boundary

### 5.1 Public ingress

Public exposure should normally be limited to:

- Owner/Staff web/API,
- Member web/API,
- provider callbacks/webhooks,
- intentionally exposed health endpoint where appropriate.

Workers, migration runners, databases, queue administration, and internal admin services should not become public by default.

### 5.2 Private/internal communication

Prefer private/internal connectivity where compatible for:

- web/API -> database,
- worker -> database,
- web/API -> internal service,
- worker -> internal service.

Private networking remains defense in depth, not a replacement for TLS, authentication, least privilege, application authorization, or RLS.

### 5.3 TLS/custom domains

Hosting should provide managed TLS/certificate lifecycle, custom domains, and HTTP-to-HTTPS enforcement. No DNS or certificate configuration is performed by this ADR.

### 5.4 Database connectivity

Hosting must be compatible with:

- TLS DB connections,
- explicit pooling,
- web + worker concurrent connections,
- controlled migration connections,
- region locality,
- private connectivity where feasible,
- safe public connectivity where private connectivity is unavailable,
- future transaction-local tenant context.

Compute should be reasonably close to canonical persistence; global browser-edge distribution must not create unnecessary server-to-database latency.

## 6. Options Considered

### Option A — Integrated Service / Worker PaaS

One managed application platform hosts a public web/API service and a separate continuously running worker service.

Representative current candidate: **Render**.

Current official documentation shows support for:

- Web Services,
- continuously running Background Workers without inbound traffic,
- same-region private networking,
- managed TLS/custom domains,
- HTTP health checks for web services,
- managed deploy lifecycle and rollback,
- manual/autoscaling for supported service types,
- environment variables/groups,
- preview environments,
- pre-deploy commands and one-off jobs,
- current service regions in Oregon, Ohio, Virginia, Frankfurt, and Singapore.

Strengths:

- one operational control plane for web + worker,
- direct fit for ADR-0014 and ADR-0015,
- conventional process semantics,
- independent service scaling,
- low platform-engineering burden,
- no Kubernetes baseline,
- no Redis baseline.

Tradeoffs:

- provider-specific deployment/network/config model,
- shared vendor control-plane risk,
- current regions may not satisfy future residency/locality needs,
- background-worker business health still needs GymPulse telemetry,
- private connectivity to an external DB depends on provider topology.

### Option B — Web-Optimized / Serverless Frontend Platform + Separate Worker Platform

Use a web/framework-optimized platform for the request runtime and a different durable worker platform.

Representative web candidate: **Vercel**.

Current official materials support strong Next.js deployment integration, preview/production environments, environment-scoped variables, configurable compute regions, rollback/promotion, and bounded Functions/Fluid Compute execution.

Strengths:

- excellent web-framework ergonomics if Next.js is accepted,
- strong preview/release UX,
- request scaling managed by platform,
- configurable compute locality.

Tradeoffs:

- a second provider for ADR-0015's continuously running worker model,
- duplicated secrets/access/billing/incident surfaces,
- split observability,
- cross-provider networking/egress,
- more complex DB connectivity and end-to-end diagnosis,
- greater provider-specific web/serverless coupling.

The option is credible if web benefits materially outweigh the split.

### Option C — Portable Container PaaS

Use OCI/container-oriented deployment for separate request and worker processes/apps.

Representative current candidate: **Fly.io**.

Current official materials show:

- Machines/OCI-based deployment,
- multiple process groups,
- independent process-group scaling,
- private networking,
- rolling/canary/blue-green deployment strategies,
- release commands,
- a current consolidated region set that includes Mumbai and Singapore.

Strengths:

- strong artifact/runtime portability,
- web + worker fit,
- private networking,
- broad regional flexibility,
- explicit deployment control.

Tradeoffs:

- more container/network/lifecycle configuration than a service PaaS,
- greater operational learning burden,
- release/secret/scaling boundaries require more deliberate assembly,
- current regional capacity/fit must still be validated.

### Option D — Major Cloud Managed Container / Serverless Platform

Use a hyperscaler-managed compute platform with distinct request and worker resources.

Representative current candidate: **Google Cloud Run**.

Current official documentation shows:

- Services for HTTP request workloads,
- Jobs for run-to-completion work,
- Worker Pools for continuous non-request workloads,
- Worker Pools without a load-balanced public endpoint,
- immutable revisions,
- startup/liveness/readiness probes,
- traffic migration/rollback for services,
- VPC/network integration,
- secrets integration,
- current regional availability including Mumbai for supported Cloud Run resources.

Strengths:

- strong runtime/network/IAM controls,
- broad region flexibility,
- explicit service/worker split,
- container portability,
- mature revision/traffic model.

Tradeoffs:

- more IAM/project/network/artifact/secrets concepts,
- higher platform-engineering burden,
- worker scaling/health model requires more explicit configuration,
- easy to accumulate unnecessary cloud services if governance is weak.

### Option E — Self-Managed VM / Kubernetes Baseline

Run VMs and/or Kubernetes as the default.

Strengths:

- maximum runtime/network control,
- broad software portability,
- custom scaling/scheduling.

Tradeoffs:

- OS/base-image patching,
- ingress/TLS,
- cluster/node lifecycle,
- autoscaling,
- secret systems,
- deploy orchestration,
- monitoring,
- backup/DR integration,
- security hardening,
- incident/on-call burden.

Current Phase 1 evidence does not justify owning this control plane. Kubernetes remains a future option if concrete isolation/scale/platform requirements appear.

## 7. Evaluation

### 7.1 Architecture-category matrix

| Criterion | Integrated Service/Worker PaaS | Web-Optimized + Separate Worker | Portable Container PaaS | Major Cloud Managed Compute | Self-Managed/K8s |
|---|---|---|---|---|---|
| ADR-0014 request topology fit | **Strong** | Strong | Strong | Strong | Strong technically |
| ADR-0015 worker fit | **Strong** | Moderate; second platform | Strong | Strong | Strong technically |
| Next.js/web compatibility | Strong with conventional runtime | **Strongest** if Next.js accepted | Strong | Strong | Strong |
| Long-lived worker | **Native** | Separate provider needed | Native | Native Worker Pool/container | Native |
| Private networking | Strong same-platform | Split-provider dependent | Strong | Strong/VPC | Team-owned |
| Database connectivity | Strong conventional model | Must validate serverless/cross-provider model | Strong | Strong | Strong but self-owned |
| Webhook reachability | Strong | Strong | Strong | Strong | Team-owned |
| Health/readiness | Strong web support; worker app metrics | Split | Strong configurable checks | **Strong probes/revisions** | Team-owned |
| Graceful shutdown | Strong managed lifecycle | Split-provider dependent | Strong | Strong | Team-owned |
| Independent web/worker scaling | **Strong** | Strong but split | Strong | Strong | Strong |
| Environment separation | Strong | **Strong previews** | Strong with discipline | Strong | Team-owned |
| Secret handling | Strong platform env model | Strong but duplicated | Strong | Strong cloud controls | Team-owned |
| Preview environments | Strong | **Strongest web UX** | Possible | Possible | Costly/manual |
| Rollback/deploy safety | Strong | Strong web + split worker | Strong strategies | Strong revisions/traffic | Team-owned |
| Migration-runner support | **Strong one-off/pre-deploy model** | Separate controlled path | Strong release command | Strong job/release model | Team-owned |
| Logs/metrics/traces | Strong platform basics | Split control planes | Strong basics | Strong cloud primitives | Build/operate |
| Region availability | Moderate | Strong web regions; worker dependent | Strong | **Strongest serious option set** | Depends |
| Residency flexibility | D-SEC-001 gate; provider region bound | Split-provider gate | Strong candidate | Strong candidate | Maximum but costly |
| Vendor lock-in | Moderate | Higher web/serverless + multi-provider | Low/Moderate | Moderate | Low API lock-in, high ops lock-in |
| Portability | Strong with conventional runtime | Moderate | **Strong** | Strong container portability | Strong |
| Cost predictability | **Good fixed-service baseline** | Web + second-provider complexity | Moderate | Usage/network complexity | Infra + engineering |
| Operational burden | **Lowest current full-stack fit** | Medium | Medium | Medium/High | **Highest** |
| Security controls | Strong baseline | Strong but split | Strong | **Strongest control surface** | Only if implemented well |
| Future API extraction | Strong | Strong | Strong | Strong | Strong |
| Phase 1 simplicity | **Strongest** | Moderate | Moderate | Moderate | Weak |
| Reversibility | Strong | Moderate | **Strong** | Strong | Moderate |
| Overall GymPulse fit | **Strongest current category** | Credible web-led alternative | Strong portability alternative | Strong region/control fallback | Not justified |

### 7.2 Serious provider matrix

| Concern | Render | Vercel + separate worker | Fly.io | Google Cloud Run |
|---|---|---|---|---|
| Request runtime | Web Service | Functions/Next deployment | Machine/process group | Cloud Run Service |
| Long-running worker | Background Worker | Separate worker platform in this architecture | Worker process group/app | Worker Pool |
| Worker public ingress required | No | Depends on worker provider | No by default | No load-balanced public endpoint |
| Private connectivity | Same-region private network | Cross-provider dependent | Private network | VPC/network integration |
| Health model | Web health; worker business telemetry | Web platform + worker provider | Configurable checks | Startup/liveness/readiness probes |
| Deployment | Managed service deploy + rollback | Immutable previews/prod + rollback | Rolling/canary/blue-green | Revisions + traffic split/rollback |
| Migration task | Pre-deploy/one-off | Separate release step | Release command | Job/controlled release execution |
| Environment/secrets | Env vars/groups | Prod/Preview/Dev scopes | Platform secrets/config | IAM/service identity + secrets |
| Independent scaling | Web/worker services | Web + worker-provider scaling | Groups/apps | Service + Worker Pool |
| Current region evidence | Oregon/Ohio/Virginia/Frankfurt/Singapore | Configurable compute regions incl. Mumbai in current platform materials | Consolidated regions incl. Mumbai/Singapore | Regional; Mumbai available |
| Material caveat | **No India region in current Render region list** | Operational split | More platform config | More cloud/IAM complexity |
| Current posture | **Leading if residency/locality gate passes** | Credible web-led split | Strong portable/regional fallback | Strong region/control fallback |

Feature count alone does not determine the recommendation.

## 8. Proposed Decision

### 8.1 Hosting category

**Propose a conventional regional managed service/worker PaaS as the Phase 1 hosting model.**

Target shape:

```text
one approved primary region

Public HTTPS
  -> managed request-serving service
     Owner/Staff Web + Trusted HTTP/API
     stateless/disposable replicas
     managed TLS + health + deploy lifecycle

Private / outbound-only
  -> separate managed Background Worker service
     durable-job consumer
     independently deployable/scalable
     no public ingress by default

Both
  -> located close to canonical persistence
  -> environment-scoped server secrets
  -> shared correlation conventions
  -> no process-local canonical truth
```

### 8.2 Current provider direction

**Render is the leading current Phase 1 provider candidate for this category**, because its current platform maps public Web Services and continuously running Background Workers into separate managed services, provides same-region private networking, managed TLS, health/deploy lifecycle, scaling, environment groups/previews, rollback, and controlled pre-deploy/one-off execution without requiring Kubernetes or Redis.

This is conditional and not accepted.

Render must pass:

1. `D-SEC-001` jurisdiction/privacy review.
2. approved production-region review.
3. database/provider locality review.
4. secure DB connectivity/pooling.
5. representative runtime/framework compatibility if those proposals are accepted.
6. worker graceful-shutdown/retry validation.
7. webhook/raw-signature-path validation.
8. environment/secret separation validation.
9. migration/rollback safety.
10. representative latency/load/cost observation.

A material current constraint is Render's official region list: it includes Singapore but currently no India region. If approved residency/locality requirements require India-resident compute, the current Render candidate may be disqualified.

### 8.3 Region-flexible alternatives

If the region/privacy gate makes Render unsuitable:

- **Google Cloud Run** is the leading current major-cloud fallback because it supports regional HTTP Services plus continuous Worker Pools and current documentation includes Mumbai.
- **Fly.io** is the leading current portable-container PaaS fallback; current region materials include Mumbai and it supports separate process groups/apps plus private networking.
- **Vercel + a separate worker platform** remains credible if Next.js-specific web benefits materially outweigh the operational split.

### 8.4 Explicit non-decisions

This ADR does not accept:

- Render,
- Vercel,
- Fly.io,
- Google Cloud,
- AWS/Azure,
- Kubernetes,
- Docker as mandatory packaging,
- PostgreSQL,
- Node.js,
- Next.js,
- pg-boss,
- Supabase,
- Redis,
- a database provider,
- an Auth provider,
- payment/messaging providers,
- an observability provider,
- a production region,
- a CI/CD system,
- a secrets manager.

## 9. Request-Serving Deployment

The Phase 1 request service should be one conventional regional runtime if ADR-0014 remains compatible.

Responsibilities include:

- Owner/Staff web presentation adapters,
- ADR-0011 `/v1` JSON HTTP transport,
- authentication verification adapter,
- Principal/tenant/resource resolution,
- authorization,
- application/domain handlers,
- webhook/callback adapters,
- canonical DB access,
- durable-continuation enqueue,
- safe request telemetry.

### 9.1 Stateless/disposable

Request replicas must not keep canonical/security-critical truth only in:

- process memory,
- local filesystem,
- framework cache,
- one replica.

Examples include session revocation, payments, attendance dedupe, idempotency claims, job state, authorization assignments, and tenant membership.

### 9.2 Local filesystem

Treat application-local disk as ephemeral/non-shared. Canonical uploaded/protected artifacts remain under separately governed object storage if required.

### 9.3 Edge posture

No edge-first business architecture is selected.

Static assets may use CDN/edge distribution, while transaction-heavy business compute remains regional and close to persistence. Edge compute requires separate workload-specific evidence.

## 10. Background Worker Deployment

The worker remains a separate runtime.

It requires:

- no public ingress by default,
- secure DB/provider egress,
- durable job claiming,
- graceful termination,
- crash/redeploy recovery,
- safe multiple-worker operation,
- explicit tenant/system context,
- independent scaling,
- job/worker telemetry.

### 10.1 Graceful shutdown

Deployment/scale-down should:

1. signal termination;
2. stop claiming new work;
3. finish or safely abandon in-flight work;
4. allow lease/retry semantics to recover unfinished work;
5. restart;
6. rely on business idempotency.

Exact grace periods remain provider/runtime configuration.

### 10.2 Worker health

Worker health should distinguish:

- process running,
- queue polling healthy,
- job success/failure,
- retries,
- terminal/dead-letter work,
- oldest job/backlog,
- scheduler lag.

A host showing only `process up` is insufficient.

### 10.3 Scaling

Web and worker have different scaling signals:

```text
web/API:
HTTP concurrency
latency
CPU/memory

worker:
queue depth
oldest job age
execution duration
provider rate limits
CPU/memory
```

They must not be forced into one scaling unit.

## 11. Database and Provider Connectivity

### 11.1 Database compatibility

Hosting must not select the DB provider.

Required compatibility:

- secure standard DB connection,
- region co-location,
- explicit pooling,
- web + worker connection budgets,
- controlled migration connection,
- safe reconnect/failure behavior,
- transaction-scoped context,
- no client DB credentials.

If PostgreSQL/RLS is later accepted, pooling must preserve transaction-local tenant context and avoid leakage across reused connections.

### 11.2 Private/public connection posture

Preferred:

1. compatible private connectivity in the approved region;
2. otherwise TLS-secured public DB endpoint with least-privilege credentials and network restrictions.

Private networking is not a replacement for authentication, TLS, application authorization, or RLS.

### 11.3 External providers

Request and worker runtimes need outbound connectivity to separately selected Auth, payment, messaging, storage, and observability providers.

Static outbound IP is only a future compatibility requirement if a selected provider needs allowlisting.

### 11.4 Webhooks

Hosting must support stable public HTTPS callbacks with raw/signature verification material, bounded request sizes, provider retry compatibility, bounded acknowledgement behavior, and correlation.

Long non-critical continuation goes to durable background execution.

## 12. Region and Data-Residency Posture

### 12.1 Mandatory gate

`D-SEC-001 = P0 OPEN`.

Therefore:

```text
provider has a region
!=
provider/region is legally or privacy acceptable
```

Before production acceptance, validate:

- launch jurisdiction,
- compute region,
- DB region,
- backup/log location,
- support/operator access,
- cross-region transfer implications,
- third-party provider regions,
- applicable contractual/legal requirements.

No legal conclusion is made here.

### 12.2 Current region evidence

Research date: `2026-09-26`.

- Render currently documents Oregon, Ohio, Virginia, Frankfurt, and Singapore.
- Fly.io's current consolidated region set includes Mumbai and Singapore.
- Cloud Run is regional and current Worker Pool documentation includes Mumbai (`asia-south1`).
- Vercel current compute-region materials include Mumbai (`bom1`).

These are technical availability facts only.

### 12.3 Phase 1 baseline

Prefer:

```text
one approved primary region
+
stateless replaceable compute
+
recoverable managed persistence
+
tested backup/restore
```

before multi-region active-active complexity.

Request runtime, worker, and canonical DB should be co-located or sufficiently near one another for predictable transactional latency.

## 13. Secrets and Environment Model

### 13.1 Environment classes

Conceptually separate:

```text
local/development
test
staging/pre-production where adopted
production
```

Production data/secrets are not automatically available to preview/PR environments.

### 13.2 Secret classes

Server-only examples:

- DB credentials,
- Auth server credentials,
- payment keys/webhook secrets,
- messaging credentials,
- signing keys,
- migration/admin credentials,
- observability export credentials.

Build-time/public configuration is separately classified and reviewed.

```text
browser-visible environment value
!=
secret
```

### 13.3 Hosting requirements

The platform should support environment scoping, protected secret storage capability, safe rotation/redeployment, masked logs where practical, and least-privilege team access.

Exact secrets tooling remains under `D-ARCH-019`.

### 13.4 Preview environments

Previews should use test/staging credentials and isolated data where appropriate. Preview convenience must not grant production credentials.

## 14. Deployment, Health, and Rollback Model

### 14.1 Release model

Hosting should support:

```text
reproducible build/version identity
-> validation
-> controlled deploy
-> liveness/readiness
-> traffic cutover
-> smoke verification
-> rollback or forward-fix
```

Automatic Git-based deploy may exist but must not be the only possible production control model. Final release governance belongs to `D-ARCH-019`.

### 14.2 Health semantics

Separate:

```text
liveness
!=
readiness
!=
business workflow health
```

A messaging/analytics outage should not automatically make request compute unhealthy unless it is truly required for the operation.

Health checks must not mutate business state.

### 14.3 Request shutdown

The request runtime should drain/finish in-flight work where possible, but application transactions/idempotency must tolerate interrupted connections/restarts.

### 14.4 Migrations

Explicitly reject:

```text
every web replica starts
-> every replica races to run production migrations
```

Migrations are one controlled release action, potentially via a pre-deploy command, release command, one-off job, or protected CI step.

### 14.5 Rollback

Code rollback must remain compatible with current schema. Provider “instant rollback” does not make destructive schema migration reversible. Expand/contract migration discipline remains required.

## 15. Scaling and Performance Model

### 15.1 Request scaling

Horizontal request scaling is safe only when process-local truth is absent, DB pool budgets are controlled, sessions/idempotency are durable, tenant-sensitive caches are safe, and version overlap preserves contract compatibility.

### 15.2 Worker scaling

Multiple worker replicas must preserve queue claiming, tenant isolation, provider rate limits, job dedupe, and business-effect idempotency.

### 15.3 Scale-to-zero

Scale-to-zero may be acceptable for some request workloads after latency/cold-start testing. It is not the baseline for a continuously polling worker.

### 15.4 Locality

For GymPulse's transaction-heavy workflows, server-to-DB latency is often more important than globally distributing business logic. Prefer regional transactional compute near persistence; static assets may remain globally distributed.

### 15.5 Measurement

Later validation should measure representative Owner/Staff and Member requests, check-in, renewal, checkout initiation, webhook processing, DB round trips, operational queries, worker claim/start latency, and scheduler lag. No production SLO is invented here.

## 16. Security and Privacy Impact

| Threat | Architecture control / posture |
|---|---|
| Production secret exposure | environment-scoped server secrets; no source/client inclusion |
| Preview reaches production | separate credentials/data; no implicit production inheritance |
| Public database exposure | prefer private connectivity; otherwise TLS + strong auth/restriction |
| Public worker | no inbound endpoint by default |
| Cross-environment credentials | explicit environment ownership and secret inventory |
| Unreviewed production code | future CI/release approval under D-ARCH-019 |
| Stale vulnerable runtime | supported runtime/base lifecycle and patch ownership |
| Provider account takeover | individual accounts, MFA, least privilege, audit/offboarding |
| Tenant data in logs | minimization and safe structured telemetry |
| Local disk treated as durable | canonical state/artifacts in managed persistence/storage |
| Process-memory truth loss | stateless compute + durable persistence/jobs |
| Migration race | one controlled migration execution |
| Worker termination mid-job | durable lease/retry + application idempotency |
| Webhook unavailable during deploy | health-aware deploy + provider retry/idempotency |
| Control-plane outage | documented incident/exit posture |
| Region outage | single-region bounded risk + backup/recovery + revisit trigger |
| Cross-provider network failure | minimize split; explicit retries/failure semantics |
| TLS/domain misconfiguration | managed TLS + deployment validation |
| Secret embedded in client bundle | explicit server/public config boundary + bundle review |
| App uses migration/admin credential | separate release/runtime credentials |

Production provider access is privileged and should later require individual accounts, MFA, least privilege, auditable changes, offboarding, and an auditable break-glass procedure.

Logs must never contain passwords, OTPs, session cookies, bearer/refresh tokens, DB credentials, provider secrets, full sensitive payment payloads, or unnecessary PII.

## 17. Reliability and Availability Impact

### 17.1 Failure isolation

Web/API and worker remain separate runtime units:

- worker crash should not terminate HTTP serving,
- web deploy should not destroy durable queued work,
- worker deploy should not interrupt public HTTP serving.

### 17.2 Database outage

Correctness-sensitive writes fail safely if canonical persistence is unavailable. Do not accept payment/attendance/membership truth into volatile process memory.

### 17.3 Provider outage

Provider failures remain application/provider-adapter concerns. Hosting-level retries must not create unknown business semantics.

### 17.4 Request timeout

Normal JSON API, checkout initiation, and webhook verification should fit host request/runtime limits. Long work goes to ADR-0015 durable execution.

### 17.5 Managed does not imply highly available

Availability still depends on provider region/control plane, DB, releases, worker health, external dependencies, backup/restore, and application correctness. Formal SLO/RTO/RPO remain separately unresolved.

## 18. Operations and Observability Impact

Hosting should expose platform/runtime information for:

- deploy/restart events,
- CPU/memory/resource pressure,
- HTTP health,
- latency/error rates,
- worker process lifecycle.

GymPulse still owns:

- request/job correlation,
- privacy-safe tenant context,
- payment/webhook diagnostics,
- queue/backlog health,
- reconciliation state,
- business-health signals.

Correlation should survive:

```text
request/webhook
-> application command
-> DB transaction
-> durable continuation
-> worker execution
-> provider call
```

Phase 1 cost evaluation should include web baseline, always-on worker baseline, build minutes, bandwidth/egress, private-network features, preview/staging usage, logs, and any second-provider overhead. Architecture must not depend on temporary free-tier pricing.

Operational simplicity is a primary Phase 1 criterion: minimize distinct systems required to deploy, rollback, inspect logs, restart workers, manage secrets/networks/DNS, respond to incidents, and understand billing.

## 19. Testing and Validation

Before acceptance, non-production evidence must cover at least:

1. web/API service deploy.
2. authenticated Owner/Staff request.
3. Member API request.
4. provider-style webhook reachability.
5. raw-body/signature verification compatibility.
6. web instance restart.
7. in-flight idempotent mutation recovery.
8. horizontal web scaling.
9. separate worker runtime.
10. worker restart.
11. graceful worker shutdown.
12. unfinished job retry.
13. multiple worker replicas.
14. no duplicate business effect.
15. scheduler/job recovery after downtime.
16. web deploy does not destroy durable jobs.
17. worker deploy does not interrupt HTTP.
18. secure DB connectivity.
19. connection pooling under combined web + worker load.
20. Tenant A -> Tenant B isolation.
21. safe pooled tenant context if RLS later enabled.
22. secrets absent from browser/client bundle.
23. secrets absent from logs.
24. preview environment cannot access production secrets.
25. migration runner executes once.
26. failed migration prevents unsafe release.
27. liveness behavior.
28. readiness behavior.
29. failed deploy rollback/forward-fix.
30. custom domain + TLS.
31. region selection evidence against accepted D-SEC-001 obligations.
32. request/log correlation.
33. worker/job correlation.
34. outbound provider connectivity.
35. provider timeout/failure handling.
36. host request-timeout compatibility.
37. representative Phase 1 latency.
38. baseline/idle cost observation.
39. scale-up/down observation.
40. provider-exit/redeploy spike.

Candidate-specific validation should also cover Render web+worker/private-network behavior, worker shutdown and DB connectivity; Cloud Run Service+Worker Pool lifecycle; Fly web/worker process-group deployment; and Vercel plus separate-worker end-to-end correlation if that split remains competitive.

No validation is implemented by this ADR.

## 20. Migration and Rollout

If later accepted with a service/worker PaaS:

1. resolve `D-SEC-001` and approved region.
2. confirm compatible runtime/framework/job/database decisions.
3. create non-production request service only.
4. create non-production worker service separately.
5. configure non-production DB/provider connectivity.
6. configure environment-scoped non-production secrets.
7. implement health/readiness and worker diagnostics.
8. validate job behavior across deploy/restart.
9. validate webhook/raw-signature path.
10. validate controlled migration execution.
11. validate preview/staging isolation.
12. validate rollback/forward-fix.
13. observe representative latency/load/cost.
14. document provider exit.
15. only then consider production provisioning through approved release/security governance.

Do not merge worker and web into one process merely to reduce service count.

## 21. Provider Exit and Reversibility

Preserve for provider exit:

- source repository,
- explicit build/start instructions,
- environment/config inventory,
- documented secret names/owners without values,
- DNS/domain ownership,
- DB dump/restore path,
- provider adapters,
- ADR-0011 contract,
- request/worker process definitions,
- migration command,
- health/readiness semantics,
- correlation conventions,
- vendor-neutral observability where practical.

A migration from Render to another container/service platform should move compute/network/configuration, not rewrite application/domain semantics.

Provider-specific queues, IAM, serverless APIs, environment dashboards, or local filesystem must never become the only representation of canonical GymPulse business truth.

## 22. Risks and Mitigations

### Risk: leading candidate later fails residency requirements

Mitigation: Render remains unaccepted; `D-SEC-001` is a production gate; Cloud Run/Fly remain current region-flexible alternatives.

### Risk: one provider creates shared control-plane blast radius

Mitigation: keep separate web/worker runtime units, durable external canonical state, backups/recovery, and provider-exit plan; add multi-provider complexity only if evidence requires it.

### Risk: autoscaling exhausts DB connections

Mitigation: explicit pool/instance limits, representative load tests, DB monitoring, region co-location.

### Risk: previews gain production access

Mitigation: separate credentials/data; production secrets never implicitly inherited.

### Risk: rollback conflicts with schema

Mitigation: expand/contract migrations and schema compatibility checks; forward-fix when rollback is unsafe.

### Risk: provider Cron bypasses ADR-0015 semantics

Mitigation: provider Cron may be only a wake-up trigger; durable scheduling/business eligibility remains owned by the job/application architecture.

### Risk: serverless hosting creates accidental worker semantics

Mitigation: preserve separate Background Worker Runtime until `D-ARCH-007` is explicitly reopened.

### Risk: edge/global execution adds DB/session complexity

Mitigation: regional transactional runtime near DB; edge only for justified workloads.

### Risk: cloud option grows into premature platform engineering

Mitigation: adopt only capabilities required by accepted decisions; no service because it is bundled.

## 23. Revisit Triggers

Revisit hosting when evidence shows:

- accepted `D-SEC-001` requires another region/provider,
- provider limits constrain request/worker behavior,
- worker load grows materially,
- cost curve changes materially,
- SLO/RPO/RTO requirements increase,
- private-network requirements change,
- compliance requires stronger isolation,
- multi-region becomes justified,
- provider exit/support risk increases,
- DB/provider locality becomes unacceptable,
- sustained server/DB latency fails measured objectives,
- Member/native traffic justifies API extraction,
- independent API release/security/scaling becomes useful,
- framework/runtime constraints become material,
- team growth justifies more platform engineering,
- Kubernetes/service-mesh capabilities become genuinely required.

## 24. Open Questions

- What launch jurisdiction/privacy obligations will `D-SEC-001` establish?
- Which production region is acceptable?
- Which managed PostgreSQL provider/region/recovery/connection topology satisfies the accepted engine decision?
- Which managed DB provider/region will be used?
- Which exact supported Node.js production version is selected, and will the separately governed Next.js proposal be accepted?
- Will pg-boss/Postgres-backed durable jobs be accepted?
- What private DB connectivity exists between serious hosting/DB candidates?
- What pooling model is required?
- Will selective RLS be accepted and how will pool context be managed?
- What are production availability/RPO/RTO targets?
- Is staging permanent?
- What preview data policy applies?
- What CI/CD/release/secrets tooling will be accepted?
- Which observability provider will be selected?
- Does any selected provider require static outbound IP?
- What support/on-call model is required?
- What cost budget/alert thresholds apply?
- If Render remains leading, does its region set satisfy approved launch/legal requirements?

## 25. Decision Evidence

### 25.1 Repository evidence

Fresh repository audit verified:

- `ADR-0016-hosting-deployment-platform.md` did not exist before Task 0024.
- `D-ARCH-009` remained the next bounded decision.
- canonical `D-ARCH-009 = P1 OPEN`.
- no approval evidence promoted `D-ARCH-009` to `DECIDED`.
- no current ADR was `Accepted`.
- `D-SEC-001 = P0 OPEN`.
- `D-ARCH-014 = OPEN`.
- `D-ARCH-006 = OPEN`; ADR-0014 remains Proposed.
- `D-ARCH-007 = OPEN`; ADR-0015 remains Proposed.
- PostgreSQL and the TypeScript/Node.js category are accepted foundation decisions; Next.js and pg-boss remain unaccepted.
- canonical architecture requires stateless request evolution, separate durable background work, environment/secret separation, and no process-local canonical truth.

### 25.2 Current official provider research

Research date: `2026-09-26`.

Render:

- Web Services: https://render.com/docs/web-services
- Background Workers: https://render.com/docs/background-workers
- Private Network: https://render.com/docs/private-network
- Health Checks: https://render.com/docs/health-checks
- Scaling: https://render.com/docs/scaling
- Deploys: https://render.com/docs/deploys
- Rollbacks: https://render.com/docs/rollbacks
- Regions: https://render.com/docs/regions
- Environment Variables/Groups: https://render.com/docs/configure-environment-variables
- Preview Environments: https://render.com/docs/preview-environments
- One-Off Jobs: https://render.com/docs/one-off-jobs
- Persistent Disks: https://render.com/docs/disks

Vercel:

- Function duration / Fluid Compute: https://vercel.com/changelog/vercel-functions-can-now-run-up-to-30-minutes
- configurable function regions: https://vercel.com/changelog/pro-customers-can-now-configure-up-to-3-regions-for-vercel-functions
- environment/deployment settings: https://vercel.com/academy/vercel-foundations/vercel-settings
- preview deployments: https://vercel.com/academy/svelte-on-vercel/preview-deployments
- deployment/rollback concepts: https://vercel.com/academy/vercel-foundations/deployments

Fly.io:

- deploy/release commands/strategies: https://fly.io/docs/launch/deploy/
- process groups: https://fly.io/docs/app-guides/multiple-processes/
- private networking: https://fly.io/docs/networking/custom-private-networks/
- current region consolidation: https://fly.io/blog/the-region-consolidation-project/
- background process/queue example: https://fly.io/docs/laravel/the-basics/cron-and-queues/

Google Cloud Run:

- Services, Jobs, Worker Pools: https://cloud.google.com/run/docs/overview/what-is-cloud-run
- Worker Pools/regions: https://cloud.google.com/run/docs/deploy-worker-pools
- Worker Pool health checks: https://cloud.google.com/run/docs/configuring/workerpools/healthchecks
- Service health checks: https://cloud.google.com/run/docs/configuring/healthchecks
- rollouts/rollbacks/traffic migration: https://cloud.google.com/run/docs/rollouts-rollbacks-traffic-migration
- execution environment/graceful shutdown: https://cloud.google.com/run/docs/configuring/execution-environments
- Worker Pool secrets: https://cloud.google.com/run/docs/configuring/workerpools/secrets

### 25.3 Material findings

- Render directly supports separate conventional Web Service and Background Worker service types.
- Render supports same-region private networking and managed public-web TLS/health/deploy lifecycle.
- Render supports controlled pre-deploy/one-off execution useful for migration release steps.
- Render's current official service-region list contains Singapore but not India.
- Vercel remains a strong web-optimized deployment candidate but the current ADR-0015 continuous-worker model still requires a separate worker runtime/platform in this comparison.
- Fly.io supports container/Machine process groups, private networking, independent scaling, and current Mumbai-region presence.
- Cloud Run supports HTTP Services and continuous Worker Pools as distinct runtime resources; current regional documentation includes Mumbai.
- Managed provider capability does not prove configured security, legal suitability, or availability.

### 25.4 Missing acceptance evidence

Acceptance still requires:

- resolved `D-SEC-001`,
- approved production region,
- selected DB provider/region/connectivity,
- compatible runtime/framework/job decisions,
- representative non-production deployment,
- web/worker lifecycle tests,
- graceful worker shutdown/retry proof,
- webhook/raw-body proof,
- DB pool/RLS-context proof,
- preview secret isolation,
- controlled migration/release proof,
- latency/load/cost observation,
- rollback/schema compatibility,
- provider control-plane security review,
- provider-exit rehearsal.

## 26. Related Documents

- `../README.md`
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
- `ADR-0002-primary-language-runtime.md`
- `ADR-0004-database-engine.md`
- `ADR-0005-data-access-migration-strategy.md`
- `ADR-0006-managed-backend-responsibilities.md`
- `ADR-0007-authentication-session-architecture.md`
- `ADR-0010-data-layer-tenant-isolation-rls.md`
- `ADR-0011-api-contract-architecture.md`
- `ADR-0012-owner-staff-web-framework.md`
- `ADR-0013-member-client-strategy.md`
- `ADR-0014-api-deployment-boundary.md`
- `ADR-0015-background-jobs-scheduler.md`
