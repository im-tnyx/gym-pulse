
# Task 0025: Draft CI/CD + Production Release / Secrets ADR

## Goal

Draft one `Proposed` ADR for canonical decision `D-ARCH-019` defining GymPulse Phase 1 CI/CD, production-release, artifact-provenance, environment-promotion, migration-gate, and secret-management architecture without creating workflows, secrets, environments, deployments, or migrations.

Target:

`docs/adr/ADR-0017-ci-cd-release-secrets.md`

## Inputs Read

Fresh latest-`main` inputs:

- `.ai/README.md`
- `.ai/current-state.md`
- `.ai/task/0022-draft-api-deployment-boundary-adr.md`
- `.ai/task/0023-draft-background-jobs-scheduler-adr.md`
- `.ai/task/0024-draft-hosting-deployment-platform-adr.md`
- `docs/README.md`
- `docs/00-overview/assumptions.md`
- `docs/01-product/functional-requirements.md`
- `docs/01-product/non-functional-requirements.md`
- `docs/02-architecture/architecture-principles.md`
- `docs/02-architecture/architecture-overview.md`
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
- `docs/adr/ADR-0006-managed-backend-responsibilities.md`
- `docs/adr/ADR-0010-data-layer-tenant-isolation-rls.md`
- `docs/adr/ADR-0011-api-contract-architecture.md`
- `docs/adr/ADR-0012-owner-staff-web-framework.md`
- `docs/adr/ADR-0014-api-deployment-boundary.md`
- `docs/adr/ADR-0015-background-jobs-scheduler.md`
- `docs/adr/ADR-0016-hosting-deployment-platform.md`

Requested structured directories were checked:

```text
docs/09-security/
docs/10-infrastructure/
docs/11-observability/
docs/12-testing/
docs/13-engineering/
docs/14-operations/
```

They do not currently exist on latest `main`.

Legacy evidence used only where useful:

- `docs/12-security-audit.md`
- `docs/13-testing-qa.md`
- `docs/14-roadmap.md`
- `docs/15-engineering-workflow.md`
- `docs/16-open-decisions.md`

Canonical structured documentation remained authoritative.

## Repository State Verified

Before creation:

- `docs/adr/ADR-0017-ci-cd-release-secrets.md` did not exist.
- `.ai/task/0025-draft-ci-cd-release-secrets-adr.md` did not exist.
- `D-ARCH-019` remained the actual next bounded architecture decision.
- canonical `D-ARCH-019` remained `P1 OPEN`.
- GitHub-native CI remained a leading candidate only.
- no current ADR was `Accepted`.
- no `.github/workflows` directory existed.
- no production CI workflow existed as decision evidence.
- no hosting provider was accepted.
- ADR-0016 remained `Proposed` and `D-ARCH-009` remained `OPEN`.
- repository visibility was private.
- a current repository-rulesets API read returned a GitHub plan-gating message; no rule was created or assumed.
- branch-protection state could not be used as evidence because the connected integration could not read the administrative branch-protection endpoint.

## Canonical Decision State

```text
D-ARCH-019
Priority: P1
Status: OPEN
Decision: CI/CD + production release-gate + secrets-management tooling baseline
```

ADR-0017 is `Proposed`.

Task 0025 does not change `D-ARCH-019` to `DECIDED`.

## Current Hosting / Runtime Constraints

ADR-0016 remains Proposed and currently recommends:

```text
one approved primary region
+
managed stateless request-serving service
+
separate non-public-by-default Background Worker service
+
managed TLS/health/deploy lifecycle
+
server-only environment-scoped secrets
+
provider portability
```

Render is only a conditional leading hosting candidate.

Release architecture must support this model without accepting Render or another host.

## Current Deployable Units

Release architecture must support:

```text
Owner/Staff Web + Trusted HTTP/API Runtime
Background Worker Runtime
future Member web runtime if separately deployed
database migration/release runner
shared packages/contracts
```

One repository does not imply one deployment artifact.

## Release Trust Boundary

Proposed trust progression:

```text
unreviewed PR
-> reviewed source revision
-> verified CI
-> reproducible build
-> tested release identity/artifact
-> explicit production promotion
-> controlled migration
-> web/API + worker deployment
-> smoke validation
-> operational watch
-> complete / rollback / forward-fix
```

Untrusted PR code never receives production credentials or production deployment write capability.

CI runner execution is itself treated as a privileged security boundary.

## CI/CD Options Evaluated

### Option A — GitHub Actions primary CI/release orchestrator

Evaluated for:

- repository/PR proximity,
- status checks,
- environment controls,
- least-privilege token permissions,
- OIDC,
- reusable workflows,
- artifacts,
- security ecosystem,
- provenance,
- hosting integration.

### Option B — Hosting-provider-native build/deploy

Evaluated for:

- simplicity,
- preview ergonomics,
- runtime integration,
- CI-check integration,
- production approval limits,
- migration sequencing,
- web/worker coordination,
- provider lock-in.

Render current official deployment behavior was researched only as a current hosting candidate; it remains unaccepted.

### Option C — Independent CI platform

Evaluated as a category for:

- source-host independence,
- flexible runners/networking,
- enterprise/compliance growth,
- extra account/secret/audit/operations burden.

No independent CI vendor was selected.

### Option D — Split model

```text
GitHub Actions
  -> PR CI / security / release orchestration

Hosting platform
  -> deployment execution

Runtime secret facility
  -> application runtime secrets

DB/provider-specific release identity
  -> narrow migration/deployment privilege
```

This is the proposed direction.

## Official Research Date

`2026-09-26`

## Pipeline Capability Model

Production-capable pipeline should eventually support:

```text
checkout
-> frozen/deterministic dependency install
-> lint/static quality gate where accepted
-> typecheck where applicable
-> unit/domain tests
-> application tests
-> authorization/security tests
-> integration/real-database tests
-> contract tests
-> build
-> migration validation
-> dependency/supply-chain checks
-> secret scanning
-> release identity/provenance
-> pre-production validation
-> production approval
-> controlled migration
-> deploy
-> post-deploy smoke
-> observability check
```

Required gates fail closed.

## PR / Branch Gate Model

Conceptual posture:

- reviewed PR for non-trivial production-bound changes,
- protected default branch,
- required status checks,
- no uncontrolled direct production mutation,
- sensitive-path ownership/review rules later,
- no exact reviewer count invented.

Current GitHub plan feature availability must be validated before choosing exact branch/ruleset/environment mechanisms.

## Build / Artifact Model

Preferred:

```text
reviewed commit SHA
-> deterministic build
-> tested immutable artifact/digest
-> deliberate promotion
```

When hosting rebuilds from source:

- deploy exact approved commit SHA,
- retain CI run ID,
- retain host build/deploy ID,
- preserve target environment/time/actor,
- do not silently rebuild from another source revision.

Git SHA remains canonical source provenance.

## Environment Model

Conceptual environments:

```text
local/development
CI/test
preview
pre-production/staging where adopted
production
```

Persistent staging is not mandated.

A pre-production validation class is required; it may be an isolated CI environment, ephemeral preview, or persistent staging where evidence justifies it.

Preview does not inherit production credentials or production dependencies.

## Promotion Model

Preferred:

```text
PR checks
-> review/merge
-> reviewed main commit SHA
-> release candidate validation
-> pre-production validation
-> production approval
-> serialized production release
```

One production mutation at a time where migration/deployment ordering requires it.

## Secrets / Credential Model

Categories remain separate:

```text
CI-only credentials
deployment credentials
application runtime secrets
runtime DB credentials
migration DB credentials
provider secrets
webhook verification secrets
public client-safe configuration
```

Runtime secrets should normally remain in the runtime/approved secret facility rather than be copied into CI.

Production Secret != Repository Variable != Client Config != Preview Secret.

## OIDC / Federation Findings

GitHub Actions OIDC can exchange workflow identity for short-lived provider credentials where the target provider supports federation.

Proposed preference:

```text
short-lived federated deployment credential
>
long-lived stored production deployment secret
```

This is not mandatory if the selected hosting provider cannot support it safely.

Current Render official material researched for this task documents CI-check integration, deploy hooks, API/CLI deploy paths, and specific-commit deploys; it does not establish a GymPulse-approved OIDC path.

Any Render deploy hook/API key used later would remain a secret and require narrow production-only handling.

## Migration Release Model

Preserved invariant:

```text
production migration
=
one controlled release action
```

Never:

```text
every replica startup
-> migration race
```

Preferred where supported:

```text
Runtime DB Role != Migration DB Role
```

Validation includes migration-from-zero, representative upgrade, failure blocking, single runner, and conditional RLS role/policy tests.

Schema evolution prefers expand -> compatible deploy -> backfill/migrate -> later contract.

## Web / Worker Coordination

Rolling release must tolerate:

```text
old web + new worker
new web + old worker
old job payload + new worker
new code + old schema
old code + expanded schema
```

Worker deployment respects ADR-0015 drain/lease/retry semantics.

No universal web-before-worker ordering was invented.

## Rollback / Forward-Fix Model

Rollback is separated for:

- web/API code,
- worker code,
- configuration,
- database schema,
- transformed business data.

Destructive migrations may require a compatible forward fix rather than reversal.

```text
database backup restore
!=
routine deployment rollback
```

Automatic rollback is not universally safe after irreversible state changes.

## Supply-Chain Security Findings

Current proposed posture:

- deterministic/frozen dependency resolution,
- dependency vulnerability/change review,
- secret scanning,
- minimal CI token permissions,
- minimize third-party actions,
- prefer immutable full commit pinning for third-party/high-risk production actions,
- never put secrets in caches/artifacts/logs,
- treat caches as untrusted,
- preserve low-trust cache write restrictions,
- avoid privileged untrusted-PR checkout patterns,
- artifact attestations are optional defense-in-depth and plan/artifact-model dependent,
- SBOM is a recommended future capability/compliance trigger rather than a mandatory Phase 1 artifact.

No scanner/action/tool was installed.

## Security Findings

Primary release threats addressed:

- production secret exposure,
- untrusted PR secret access,
- overprivileged `GITHUB_TOKEN`,
- long-lived deployment credential theft,
- preview-to-production leakage,
- runtime secrets copied into CI,
- migration credential overreach,
- third-party action compromise,
- cache poisoning,
- shell/script injection from untrusted GitHub context,
- production DB exposed to broad CI,
- sensitive test data,
- cross-tenant regression,
- payment correctness regression,
- worker replay/tenant-scope regression.

## Reliability Findings

- required gates fail closed;
- rolling web/worker compatibility is explicit;
- migration sequencing is part of release architecture;
- request idempotency and durable jobs protect interruptions;
- a killed worker is not considered completed work;
- rollback and forward-fix are distinct;
- backup restore is disaster recovery, not ordinary release rollback;
- break-glass release remains exceptional and auditable.

## Operational Findings

Every production change should be attributable to:

```text
commit SHA
release/workflow run
deployable
environment
deployment/build ID
actor/approval where available
timestamp
result
```

Post-deploy validation covers liveness/readiness, web/API reachability, DB connectivity, worker health, callback errors, migration errors, auth failures, and latency/error anomalies.

Hosting console drift should later be controlled through access restriction, audit/configuration inventory, and IaC only when complexity/compliance/drift evidence justifies it.

## Evaluation Summary

Strongest current architecture:

```text
GitHub-native CI/release policy orchestration
+
hosting provider as replaceable deployment executor
+
runtime-owned application secrets
+
OIDC/federation where supported
+
narrow static deployment credential only where unavoidable
+
one controlled migration runner
+
serialized production release mutation
+
safe web/worker rolling compatibility
+
post-deploy smoke and observation
```

GitHub Actions is the leading current CI candidate, not Accepted.

## Proposed Direction

Propose the Split Model:

```text
GitHub Actions
  -> PR checks
  -> security/test gates
  -> build/provenance
  -> production release orchestration

Selected hosting provider
  -> deploy exact approved release revision

Runtime environment / approved secret facility
  -> runtime application/provider secrets

Controlled migration identity
  -> schema-change execution only
```

Exact GitHub plan/protection mechanism and hosting deployment credential remain validation gates.

## Decisions Kept Separate

Task 0025 does not decide or accept:

```text
D-ARCH-009 hosting provider
D-ARCH-006 API topology acceptance
D-ARCH-007 job technology acceptance
D-ARCH-001 monorepo acceptance
D-ARCH-011 package manager
D-ARCH-016 Node/runtime
D-ARCH-018 testing toolchain
D-ARCH-002 PostgreSQL
D-ARCH-017 data-access/migration tool
D-ARCH-014 managed backend
D-ARCH-004 Auth/session provider
D-ARCH-015 authorization acceptance
D-SEC-008 RLS
D-SEC-001 legal/privacy outcome
D-PROVIDER-006 observability provider
```

GitHub Actions remains only the leading proposed CI candidate.

Render remains only a hosting candidate.

## Requirement IDs Referenced

Verified current IDs include:

```text
FR-AUTHZ-001..004
FR-ATTENDANCE-002..006
FR-PAYMENT-002..009
FR-AUDIT-003
FR-CROSS-001..004

NFR-SECURITY-001..006
NFR-SECURITY-008..011
NFR-PRIVACY-001..006
NFR-RELIABILITY-001..008
NFR-AVAILABILITY-003..005
NFR-SCALABILITY-002..005
NFR-OBSERVABILITY-001..007
NFR-MAINTAINABILITY-001..006
NFR-TESTABILITY-001..005
NFR-OPERATIONS-001..005
```

No requirement ID was invented.

## Validation Required

Before acceptance, require future proof for at least:

1. required PR checks.
2. failed lint/static gate blocks when required.
3. failed typecheck blocks where applicable.
4. failed domain/unit test blocks.
5. failed authz negative test blocks.
6. failed real-DB integration test blocks.
7. failed build blocks.
8. frozen dependency install.
9. untrusted PR has no production secret.
10. preview has only non-production credentials.
11. minimum CI token permissions.
12. OIDC path if selected.
13. narrow deployment scope.
14. web release tied to commit/run.
15. worker tied to same release context.
16. migration-from-zero.
17. representative upgrade migration.
18. migration failure blocks rollout.
19. one migration runner.
20. no startup migration race.
21. web/worker rolling compatibility.
22. worker graceful deployment.
23. production approval protection.
24. concurrent releases do not race.
25. post-deploy web/API smoke.
26. post-deploy worker health.
27. request telemetry release version.
28. job telemetry release version.
29. failed web deploy recovery.
30. failed worker deploy recovery.
31. destructive migration rollback limitation.
32. secret rotation rehearsal.
33. leaked credential revocation rehearsal.
34. planted fake secret detection.
35. no secrets in logs/artifacts/caches.
36. sandbox provider integration.
37. webhook contract regression.
38. payment exactly-once regression.
39. cross-tenant authz regression.
40. hosting deployment integration.
41. provider exit/redeploy.

No validation was implemented.

## Files Changed

Created:

```text
docs/adr/ADR-0017-ci-cd-release-secrets.md
.ai/task/0025-draft-ci-cd-release-secrets-adr.md
```

Governance continuity updates:

```text
docs/adr/README.md
docs/README.md
.ai/current-state.md
```

## Open Questions

- final CI vendor;
- GitHub private-repository plan/protection capabilities;
- exact branch/review policy;
- final host/deployment executor;
- OIDC support for selected host;
- narrow fallback deployment credential;
- persistent staging need;
- exact test tools;
- package manager/runtime;
- database/migration tool;
- migration network path;
- scanner capability/severity policy;
- artifact attestation availability/value;
- SBOM/compliance trigger;
- release metadata retention;
- break-glass authority/process;
- observability release-marker integration;
- IaC/drift threshold.

## Result

Task 0025 creates a review-ready proposal:

```text
Split release architecture

GitHub Actions
  -> leading CI/release orchestrator candidate

Hosting platform
  -> replaceable deployment executor

Runtime secret facility
  -> runtime application/provider secret owner

OIDC/federated identity
  -> preferred deployment credential when supported

Controlled migration identity
  -> one release-time schema mutation path
```

ADR-0017 remains `Proposed`.

Canonical `D-ARCH-019` remains `OPEN`.

Explicitly not created/selected:

```text
No .github/workflows file
No GitHub Actions workflow
No branch protection
No ruleset
No GitHub environment
No repository/environment secret
No OIDC trust policy
No deployment token
No production credential
No migration credential
No Dockerfile
No IaC
No Terraform/Pulumi
No hosting config
No cloud resource
No CI service account
No release tag
No build artifact
No SBOM
No attestation
No deployment
No migration
No production/staging/preview environment
No scanner/tool installation
No GitHub Actions acceptance
No hosting provider acceptance
No D-ARCH-019 promotion to DECIDED
No previous ADR promotion to Accepted
```

## Next Recommended Task

After governance synchronization, fresh-read:

- `docs/adr/README.md`
- `docs/00-overview/assumptions.md`
- `.ai/current-state.md`

and record the actual next bounded task.

The pre-task queue suggests `D-ARCH-018` Core Automated Testing Toolchain, likely Task 0026 / `docs/adr/ADR-0018-testing-toolchain.md`.

Do not execute the next task as part of Task 0025.
