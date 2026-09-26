
# Task 0024: Draft Hosting / Deployment Platform ADR

## Goal

Draft one `Proposed` ADR for canonical decision `D-ARCH-009` that defines the recommended GymPulse Phase 1 hosting/deployment model without provisioning infrastructure or accepting a hosting provider.

Target:

`docs/adr/ADR-0016-hosting-deployment-platform.md`

## Inputs Read

Fresh latest-`main` inputs:

- `.ai/README.md`
- `.ai/current-state.md`
- `.ai/task/0021-draft-member-client-strategy-adr.md`
- `.ai/task/0022-draft-api-deployment-boundary-adr.md`
- `.ai/task/0023-draft-background-jobs-scheduler-adr.md`
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
- `docs/adr/ADR-0002-primary-language-runtime.md`
- `docs/adr/ADR-0004-database-engine.md`
- `docs/adr/ADR-0005-data-access-migration-strategy.md`
- `docs/adr/ADR-0006-managed-backend-responsibilities.md`
- `docs/adr/ADR-0007-authentication-session-architecture.md`
- `docs/adr/ADR-0010-data-layer-tenant-isolation-rls.md`
- `docs/adr/ADR-0011-api-contract-architecture.md`
- `docs/adr/ADR-0012-owner-staff-web-framework.md`
- `docs/adr/ADR-0013-member-client-strategy.md`
- `docs/adr/ADR-0014-api-deployment-boundary.md`
- `docs/adr/ADR-0015-background-jobs-scheduler.md`

Legacy documents remained evidence/migration inputs only where useful.

## Repository State Verified

Before creation:

- `docs/adr/ADR-0016-hosting-deployment-platform.md` did not exist.
- `.ai/task/0024-draft-hosting-deployment-platform-adr.md` did not exist.
- `D-ARCH-009` remained the actual next bounded architecture decision.
- canonical `D-ARCH-009` remained `P1 OPEN`.
- repository search found no approval evidence promoting `D-ARCH-009` to `DECIDED`.
- no current ADR was `Accepted`.
- `D-SEC-001` remained `P0 OPEN`.
- `D-ARCH-014` remained `OPEN`.
- `D-ARCH-006` remained `OPEN` with ADR-0014 Proposed.
- `D-ARCH-007` remained `OPEN` with ADR-0015 Proposed.
- no cloud account/project/service or deployment existed as approval evidence.

## Canonical Decision State

```text
D-ARCH-009
Priority: P1
Status: OPEN
Decision: Hosting / deployment platform
```

ADR-0016 is `Proposed`. Task 0024 does not change `D-ARCH-009` to `DECIDED`.

## Current Runtime Topology

ADR-0014 currently proposes:

```text
Owner/Staff Web + Trusted HTTP/API Runtime
  -> co-hosted request-serving runtime for Phase 1
  -> thin transport/framework adapters
  -> framework-independent application/domain/security modules
  -> future independent API extraction seam
```

This topology remains only Proposed.

## Current Worker Topology

ADR-0015 currently proposes:

```text
Durable Continuation
  -> separate Background Worker Runtime
  -> current-state reload
  -> shared application/domain handlers
```

Conditional current job direction remains PostgreSQL-backed durable jobs with pg-boss as a leading candidate only if PostgreSQL/Node later become accepted.

Hosting must not turn durable worker execution back into request-process memory.

## Hosting Requirements

The hosting decision must support:

- a public request-serving service,
- a separate non-public-by-default worker,
- secure DB/provider egress,
- managed TLS/custom-domain capability,
- meaningful health/readiness,
- graceful shutdown,
- independent scaling,
- environment-scoped secrets,
- preview/staging/production separation,
- controlled migrations,
- deployment rollback/forward-fix,
- logs/metrics/traces integration,
- provider webhook reachability,
- region/data-residency gating,
- provider exit/reversibility.

## Options Evaluated

A. Integrated Service / Worker PaaS, represented by Render.

B. Web-optimized/serverless web platform + separate worker platform, represented by Vercel for web.

C. Portable container PaaS, represented by Fly.io.

D. Major-cloud managed container/serverless platform, represented by Google Cloud Run.

E. Self-managed VM/Kubernetes baseline.

## Concrete Providers Researched

### Render

Official current documentation was reviewed for:

- Web Services,
- Background Workers,
- private networking,
- health checks,
- scaling,
- deploy lifecycle,
- rollback,
- regions,
- environment variables/groups,
- preview environments,
- one-off jobs,
- persistent-disk limitations.

Material findings:

- separate web and continuously running worker service types,
- worker does not need inbound traffic,
- same-region private networking,
- managed public-web TLS/health/deploy lifecycle,
- controlled pre-deploy/one-off execution,
- current regions include Oregon, Ohio, Virginia, Frankfurt, Singapore,
- current official region list does not include India.

### Vercel

Official current materials were reviewed for:

- Next.js/function deployment model,
- current Function/Fluid Compute duration,
- configurable regions,
- environment scoping,
- previews,
- deployment/rollback behavior.

Vercel remains a strong web platform candidate but the ADR-0015 continuous-worker model still requires a separate worker platform in this comparison.

### Fly.io

Official current materials were reviewed for:

- deploy/release command,
- rolling/canary/blue-green strategies,
- process groups,
- independent scaling,
- private networking,
- current region consolidation.

Current region materials include Mumbai and Singapore.

### Google Cloud Run

Official current materials were reviewed for:

- Services,
- Jobs,
- Worker Pools,
- Worker Pool regions,
- health checks,
- traffic migration/rollback,
- execution/shutdown,
- secrets.

Current documentation includes Mumbai for applicable Cloud Run resources.

## Official Research Date

`2026-09-26`

## Region / Residency Findings

`D-SEC-001` remains `P0 OPEN`.

Therefore technical region availability does not establish legal/privacy acceptability.

Current serious-provider evidence:

- Render: Singapore available; no India region in current official Render region list.
- Fly.io: current consolidated region set includes Mumbai.
- Google Cloud Run: current regional documentation includes Mumbai.
- Vercel: current compute-region materials include Mumbai.

Current proposal uses one approved primary region before any multi-region design.

## Network Findings

Proposed posture:

- public ingress only for web/API/webhooks/appropriate health endpoint,
- worker/migration/database/internal admin not public by default,
- prefer compatible private service/DB connectivity,
- otherwise TLS-secured least-privilege DB connectivity,
- private network is not authorization,
- request/worker/database locality should be optimized together.

## Database Connectivity Findings

Hosting must remain database-provider neutral while supporting:

- secure standard DB connections,
- explicit connection pools,
- request + worker connection budgets,
- controlled migration connections,
- region locality,
- future RLS transaction-local tenant context,
- no browser DB credentials.

Serverless connection bursts and pooled tenant context require explicit validation.

## Secrets / Environment Findings

Required environment model:

```text
local/development
test
staging/pre-production where adopted
production
```

Production secrets are server-only, environment-scoped, and never automatically inherited by previews.

Build/public configuration is explicitly separate from runtime secrets.

Final secrets manager/release tooling remains under `D-ARCH-019`.

## Deployment / Rollback Findings

Hosting must support:

```text
versioned/reproducible build
-> validation
-> controlled deploy
-> health/readiness
-> cutover
-> smoke verification
-> rollback or forward-fix
```

Migration execution is controlled once through a pre-deploy/release/one-off/CI mechanism.

Every web replica running production migration on startup is explicitly rejected.

Provider rollback does not make destructive schema migration reversible.

## Worker Lifecycle Findings

Worker must remain a separate runtime with:

- no inbound public endpoint by default,
- durable job claim,
- termination handling,
- safe in-flight work behavior,
- retry after crash/deploy,
- multiple-worker safety,
- tenant/job correlation,
- worker/job health telemetry.

Scale-to-zero is not assumed safe for continuously polling workers.

## Evaluation Summary

The strongest current hosting category is:

```text
conventional regional managed Service/Worker PaaS
+
public stateless web/API service
+
separate durable Background Worker service
+
both near canonical persistence
+
managed TLS/health/deploy lifecycle
+
environment-scoped server secrets
+
no Kubernetes baseline
+
no Redis baseline
+
no edge-first business-runtime requirement
```

Render is the leading current provider candidate for this category if region/privacy/locality and validation gates pass.

Cloud Run and Fly.io are stronger current fallbacks when India-region flexibility or stronger platform/network controls are required.

Vercel + a separate worker provider remains credible if its web-specific benefits justify the additional operational split.

## Proposed Direction

```text
Phase 1
one approved primary region

Managed Request Service
  -> Owner/Staff Web + Trusted HTTP/API

Separate Managed Worker Service
  -> durable background execution

Both
  -> close to DB
  -> independently scalable
  -> stateless/durable boundaries
  -> server-only environment-scoped secrets
  -> shared correlation conventions
```

Provider selection remains conditional.

## Request Runtime Mapping

The request runtime owns public HTTP/webhook adapters and calls shared application/domain/security modules.

It remains stateless/disposable and does not own canonical session/payment/attendance/idempotency/job/authorization truth in process memory or local disk.

## Worker Runtime Mapping

The worker is independently deployed and uses the same application/domain rules with System/Job Context and explicit tenant scope.

It is not a human session and does not require public ingress by default.

## Environment Model

Production is isolated from development/test/previews.

Preview environments use non-production credentials/data.

No production secret is a browser/public build variable.

## Security Findings

Primary threats covered:

- production secret exposure,
- preview-to-production credential leakage,
- public DB/worker exposure,
- provider-account takeover,
- tenant PII in logs,
- local-disk/process-memory state loss,
- migration races,
- worker termination,
- webhook downtime,
- region/control-plane outage,
- cross-provider network failure,
- TLS/domain mistakes,
- client-bundle secret leakage.

Provider feature availability does not equal configured security.

## Reliability Findings

Web and worker are separate failure/deployment units.

Database outage causes correctness-sensitive work to fail safely rather than buffer canonical truth in volatile memory.

External provider outages remain application/provider-adapter concerns.

Managed hosting does not automatically imply HA; RPO/RTO/SLO remain unresolved.

## Performance Findings

Current posture prefers regional request/worker/database locality over edge-first transactional compute.

Web/API and worker scale independently.

Representative latency, DB round trips, worker claim/start latency, scheduler lag, and scale behavior still require measurement.

## Operational Findings

Integrated service/worker PaaS currently minimizes the number of control planes for:

- deploy/rollback,
- worker restart,
- secrets,
- networking,
- logs,
- DNS/TLS,
- incident response,
- billing.

This is a primary Phase 1 reason it leads over web+worker multi-provider hosting.

## Provider Exit / Reversibility

Provider exit must preserve:

- source code,
- explicit build/start instructions,
- config inventory,
- DNS/domain ownership,
- DB dump/restore path,
- provider adapters,
- request/worker process definitions,
- migration command,
- health semantics,
- correlation conventions.

Provider-specific state must not become canonical business truth.

## Decisions Kept Separate

Task 0024 does not decide or accept:

```text
D-ARCH-006 API deployment acceptance
D-ARCH-007 job technology acceptance
D-ARCH-012 Next.js
D-ARCH-013 Member client delivery
D-ARCH-016 Node.js
D-ARCH-002 PostgreSQL
D-ARCH-017 data-access tool
D-ARCH-014 Supabase/managed backend
D-ARCH-004 Auth provider/session
D-ARCH-015 authorization acceptance
D-SEC-008 RLS
D-SEC-001 legal/privacy outcome
D-ARCH-019 CI/CD/secrets tooling
D-ARCH-018 testing toolchain
D-ARCH-010 object storage
D-ARCH-008 Redis
D-PROVIDER-006 observability provider
```

No hosting provider or production region is accepted.

## Requirement IDs Referenced

Verified current IDs include:

```text
FR-CROSS-001..004

NFR-SECURITY-001..006
NFR-SECURITY-008..011
NFR-PRIVACY-001..006
NFR-RELIABILITY-001..008
NFR-AVAILABILITY-001..005
NFR-PERFORMANCE-001..006
NFR-SCALABILITY-001..005
NFR-OBSERVABILITY-001..007
NFR-MAINTAINABILITY-001
NFR-MAINTAINABILITY-004..006
NFR-TESTABILITY-001..005
NFR-OPERATIONS-001..005
```

No requirement ID was invented.

## Validation Required

Before acceptance:

1. web/API deploy.
2. authenticated staff request.
3. Member API request.
4. provider-style webhook.
5. raw-body verification.
6. web restart.
7. idempotent mutation recovery.
8. horizontal web scale.
9. separate worker.
10. worker restart.
11. graceful worker shutdown.
12. unfinished-job retry.
13. multiple worker replicas.
14. no duplicate business effect.
15. scheduler recovery.
16. web deploy preserves queued work.
17. worker deploy preserves HTTP service.
18. secure DB connectivity.
19. DB pooling under combined load.
20. cross-tenant negative isolation.
21. RLS tenant context if later enabled.
22. no secrets in browser bundle.
23. no secrets in logs.
24. preview cannot use production secrets.
25. one controlled migration runner.
26. failed migration blocks unsafe release.
27. liveness.
28. readiness.
29. rollback/forward-fix.
30. custom domain/TLS.
31. approved-region evidence.
32. request correlation.
33. worker correlation.
34. provider egress.
35. provider timeout.
36. request timeout.
37. representative latency.
38. baseline cost.
39. scaling.
40. provider exit/redeploy spike.

No validation was implemented.

## Files Changed

Created:

```text
docs/adr/ADR-0016-hosting-deployment-platform.md
.ai/task/0024-draft-hosting-deployment-platform-adr.md
```

Governance continuity updates:

```text
docs/adr/README.md
docs/README.md
.ai/current-state.md
```

## Open Questions

- accepted launch jurisdiction/region,
- final runtime/framework,
- final database/provider,
- final job runner,
- DB private connectivity/pooling,
- RLS worker/request pool semantics,
- production SLO/RPO/RTO,
- staging/preview data policy,
- CI/CD/release/secrets tooling,
- observability provider,
- static outbound-IP need,
- support/on-call model,
- cost budget,
- Render region suitability after D-SEC-001.

## Result

Task 0024 creates a review-ready proposal:

```text
conventional regional managed Service/Worker PaaS
+
public stateless request service
+
separate non-public-by-default worker
+
one approved primary region
+
compute close to DB
+
managed TLS/health/deploy lifecycle
+
server-only environment-scoped secrets
+
no Kubernetes/Redis/edge-first baseline
```

Render is the leading current provider candidate only if region/privacy/locality and technical validation gates pass.

Google Cloud Run and Fly.io remain serious region-flexible fallbacks; Vercel + separate worker remains a credible web-led split.

ADR-0016 remains `Proposed`.

Canonical `D-ARCH-009` remains `OPEN`.

Explicitly not created/selected:

```text
No Render/Vercel/Fly/GCP/AWS/Azure project
No hosting resource
No web service
No worker service
No cloud account
No production/staging environment
No DNS/TLS configuration
No Dockerfile
No IaC
No deployment manifest
No database
No Redis
No queue
No migration
No CI workflow
No production secret
No monitoring integration
No hosting provider acceptance
No production region acceptance
No D-ARCH-009 promotion to DECIDED
No previous ADR promotion to Accepted
```

## Next Recommended Task

Post-Task-0024 governance state was freshly re-read from:

- `docs/adr/README.md`
- `docs/00-overview/assumptions.md`
- `.ai/current-state.md`

The synchronized repository confirms the actual next bounded task as:

```text
Task 0025: Draft CI/CD + Production Release / Secrets ADR
Primary decision: D-ARCH-019
Likely target: docs/adr/ADR-0017-ci-cd-release-secrets.md
Initial ADR status: Proposed
Canonical D-ARCH-019 status: OPEN
```

The next ADR should define production build/test gates, controlled promotion, artifact/version provenance, environment and secret ownership, migration sequencing, release smoke tests, rollback/forward-fix, branch/review protections, and selected-host integration without creating CI/CD workflows or production secrets.

Task 0025 was not executed as part of Task 0024.
