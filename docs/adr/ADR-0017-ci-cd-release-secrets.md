
# ADR-0017: CI/CD, Production Release, and Secrets Architecture

## Status

`Proposed`

## Decision Metadata

- ADR: `ADR-0017`
- Primary Decision ID: `D-ARCH-019`
- Related Decision IDs: `D-ARCH-009`, `D-ARCH-006`, `D-ARCH-007`, `D-ARCH-001`, `D-ARCH-011`, `D-ARCH-016`, `D-ARCH-018`, `D-ARCH-002`, `D-ARCH-017`, `D-ARCH-014`, `D-ARCH-004`, `D-ARCH-015`, `D-SEC-008`, `D-SEC-001`, `D-PROVIDER-006`
- Decision Owner: `Open`
- Technical Owner: `Architecture / Platform / Security / Release Engineering`
- Date Proposed: `2026-09-26`
- Date Accepted: `Not accepted`
- Supersedes: `None`
- Superseded By: `None`

## 1. Context

GymPulse needs a release-security architecture that makes production changes reproducible, reviewable, least-privileged, test-gated, auditable, and recoverable.

The current architecture already proposes several independently governed boundaries:

- a monorepo with deliberate application/package boundaries under ADR-0003;
- a trusted HTTP/API runtime that may initially be co-hosted with the Owner/Staff web runtime under ADR-0014;
- a separate Background Worker Runtime under ADR-0015;
- a conventional regional managed service/worker hosting model under ADR-0016;
- explicit database migration discipline under ADR-0005;
- server-side authorization, tenant isolation, provider verification, idempotency, and observability expectations across the canonical architecture.

The release architecture must support at least these conceptual deployables:

```text
Owner/Staff Web + Trusted HTTP/API Runtime
Background Worker Runtime
future Member web runtime if independently deployed
database migration/release runner
shared packages/contracts
```

Repository topology does not imply one production artifact, and deployment topology does not change domain ownership.

Canonical `D-ARCH-019` remains `P1 OPEN`. Current technology evaluation names GitHub-native CI as a leading candidate, but no CI/CD product, production workflow, secret store, hosting provider, or production environment is accepted or implemented.

The decision question is:

> What CI/CD, production-release, artifact-provenance, environment-promotion, migration-gate, and secret-management architecture should GymPulse use so every production change is reproducible, reviewable, least-privileged, test-gated, auditable, and recoverable?

This ADR defines the release-security architecture first. Vendor choice remains secondary and conditional.

## 2. Requirements and Decision Drivers

### 2.1 Security drivers

Current requirements include:

- `NFR-SECURITY-001`: cross-tenant access is forbidden and must have negative tests.
- `NFR-SECURITY-002`: least privilege.
- `NFR-SECURITY-003`: server-side authorization.
- `NFR-SECURITY-004`: secrets, provider credentials, signing keys, DB credentials, and webhook secrets must not be committed or exposed to clients.
- `NFR-SECURITY-005`: production sensitive traffic requires encrypted transport.
- `NFR-SECURITY-008`: security-sensitive provider webhooks must be verified.
- `NFR-SECURITY-009`: sensitive actions must be attributable.
- `NFR-SECURITY-011`: logs/errors must not expose secrets or unnecessary private data.

Release infrastructure itself is privileged. CI jobs that can alter source, artifacts, environments, infrastructure, database schema, runtime secrets, or deployments are part of the production trust boundary.

### 2.2 Reliability and availability drivers

- `NFR-RELIABILITY-001`: critical workflows tolerate retries without duplicate business effects.
- `NFR-RELIABILITY-002`: verified payment effects happen at most once.
- `NFR-RELIABILITY-003`: scheduled jobs are retry-safe.
- `NFR-RELIABILITY-004`: correctness-critical DB invariants are reinforced where practical.
- `NFR-RELIABILITY-005`: canonical truth remains server-side.
- `NFR-RELIABILITY-008`: payment/membership reconciliation is supported.
- `NFR-AVAILABILITY-003`: failed jobs are operationally visible and recoverable.
- `NFR-AVAILABILITY-004`: production requires automated backup capability and tested restore.
- `NFR-AVAILABILITY-005`: formal RPO/RTO remains Open.

### 2.3 Maintainability, testability, and operations drivers

- `NFR-MAINTAINABILITY-001`: business rules are not duplicated across web/member/worker.
- `NFR-MAINTAINABILITY-002`: typed/runtime-validated boundaries are preferred if TypeScript is accepted.
- `NFR-MAINTAINABILITY-004`: schema changes use committed/auditable migrations.
- `NFR-MAINTAINABILITY-005`: material changes synchronize documentation.
- `NFR-MAINTAINABILITY-006`: major architecture decisions use ADR governance.
- `NFR-TESTABILITY-001..005`: deterministic domain tests, provider simulation, failure injection, authorization matrix tests, and controlled time.
- `NFR-OPERATIONS-001`: environment separation.
- `NFR-OPERATIONS-002`: production credentials are not reused casually in development/preview.
- `NFR-OPERATIONS-003`: migration plans avoid unsafe destructive one-step changes.
- `NFR-OPERATIONS-004`: production releases include safe smoke validation.
- `NFR-OPERATIONS-005`: routine operations must not require developer intervention.

### 2.4 Observability drivers

`NFR-OBSERVABILITY-001..007` require structured/correlated runtime and job telemetry, privacy-safe context, error monitoring, payment/job diagnostics, business health, and request/job correlation.

Release identity must be observable alongside runtime failures so operators can connect regressions to the source revision and deployment.

### 2.5 Functional correctness drivers

Release gates must preserve the correctness of:

- `FR-AUTHZ-001..004` tenant scope, named capabilities, Member-self isolation, and sensitive-action attribution;
- `FR-ATTENDANCE-002..006` server-verified QR/check-in, exactly one attendance record, duplicate protection, and retry safety;
- `FR-PAYMENT-002..009` provider verification, webhook authenticity, provider-event persistence, duplicate safety, exactly-once membership/add-on effects, payment credential boundary, and immutable financial history;
- `FR-AUDIT-003` actor/action/resource/time/tenant integrity;
- `FR-CROSS-001..004` server truth, idempotent critical effects, explicit tenant context, and gym-local time.

### 2.6 Primary decision drivers

The release architecture should optimize for:

1. fail-closed quality/security gates;
2. untrusted-PR isolation from production credentials;
3. least-privileged CI identity;
4. reviewable/protected production promotion;
5. source/build/artifact/deployment provenance;
6. reproducible dependency/runtime resolution;
7. web/API/worker compatibility during rolling releases;
8. controlled migration sequencing;
9. runtime-vs-migration privilege separation;
10. safe rollback/forward-fix behavior;
11. secret minimization and rotation;
12. supply-chain risk reduction;
13. provider-neutral hosting integration;
14. auditable production changes;
15. low Phase 1 operational burden;
16. future monorepo/affected-scope optimization without skipping correctness gates.

## 3. Constraints and Assumptions

1. `D-ARCH-019` remains `OPEN`; this ADR is only `Proposed`.
2. `D-ARCH-009` remains `OPEN`; ADR-0016 is Proposed and does not accept Render or another host.
3. `D-ARCH-006` remains `OPEN`; ADR-0014 is Proposed.
4. `D-ARCH-007` remains `OPEN`; ADR-0015 is Proposed.
5. `D-ARCH-001` is `DECIDED`; the monorepo strategy is accepted, while exact CI/workspace tooling remains separate.
6. `D-ARCH-011` remains `ASSUMED`; no package manager is accepted.
7. `D-ARCH-016` is `DECIDED`; strict TypeScript + supported Node.js LTS is accepted, but no exact Node.js production version is pinned.
8. `D-ARCH-018` remains `PROPOSED`; exact test tools are separate.
9. `D-ARCH-002` is `DECIDED`; PostgreSQL is accepted as the engine category, while provider/version/recovery choices remain separate.
10. `D-ARCH-017` remains `PROPOSED`; no migration/query tool is accepted.
11. `D-ARCH-014` and `D-ARCH-004` remain `OPEN`.
12. `D-ARCH-015` remains `PROPOSED`.
13. `D-SEC-008` remains `OPEN`; RLS-specific migration gates remain conditional.
14. `D-SEC-001` remains `P0 OPEN`.
15. `D-PROVIDER-006` remains `OPEN`.
16. No `.github/workflows` directory exists in the freshly audited repository.
17. No production workflow exists as architecture evidence.
18. No CI/CD product is accepted.
19. The repository is currently private.
20. Current repository ruleset capability is plan-gated in the audit; production review architecture therefore must not depend on one GitHub plan-specific feature without validation.
21. Current branch-protection state could not be used as decision evidence because the connector could not read that administrative endpoint.
22. No persistent staging environment is assumed.
23. No self-hosted CI runner is assumed.
24. No IaC platform is required by this ADR.
25. Git SHA remains the minimum canonical source provenance identifier even when a provider rebuilds from source.
26. Production migration is one controlled release action, never a race from every replica startup.

## 4. Release Trust Boundary

### 4.1 Trust progression

```text
Unreviewed Source / Pull Request
  -> reviewed source revision
  -> verified CI
  -> reproducible build
  -> tested release identity / artifact
  -> explicit production promotion gate
  -> controlled migration
  -> application/worker deployment
  -> post-deploy smoke
  -> operational watch
  -> complete / rollback / forward-fix
```

Production must not be:

```text
developer laptop
-> ad-hoc production deploy
```

or:

```text
unreviewed git push
-> production mutation
```

### 4.2 Pull-request code is untrusted

PR/fork code may execute arbitrary repository scripts and dependency lifecycle code.

Therefore untrusted PR jobs must not receive:

- production environment credentials,
- production DB/migration credentials,
- payment/Auth/messaging production secrets,
- production deployment credentials,
- write access to production environments,
- privileged cache write capability that can poison trusted jobs.

Avoid privileged workflow patterns that check out untrusted PR code in a context carrying secrets/write privileges.

### 4.3 CI runner is a privileged execution boundary

A CI step can read its environment, manipulate workspace/artifacts, call network endpoints, and invoke third-party actions.

Every pipeline step receives only the permissions and secrets it needs.

## 5. Source, Build, and Artifact Model

### 5.1 Build once, promote deliberately

Preferred model where the hosting/runtime permits:

```text
reviewed commit SHA
-> deterministic/frozen dependency resolution
-> tested build
-> immutable artifact/digest
-> deliberate environment promotion
```

If the hosting provider rebuilds from source instead of promoting the exact binary artifact, equivalent provenance is required:

- exact Git commit SHA,
- CI run/build identifier,
- hosting-provider build/deploy identifier,
- target environment,
- deployment timestamp,
- actor/approval where available.

A provider rebuild must not silently deploy a different source revision from the one that passed release gates.

### 5.2 Release identity

Every production deployable should be attributable to:

```text
Git commit SHA
CI/release run identifier
deployable name
artifact digest/version where applicable
provider deployment/build identifier
target environment
deployment time
initiating/approving actor where available
```

Git SHA is canonical source provenance. Human-readable release tags may be added later but do not replace SHA provenance.

### 5.3 Artifact boundaries

Potential release artifacts:

- web/API runtime artifact,
- worker runtime artifact,
- migration/release artifact,
- shared package build output where material.

Separate artifacts may belong to one release context and one source revision.

### 5.4 Runtime/dependency reproducibility

After `D-ARCH-011` is accepted and an exact supported Node.js production version is selected within the already accepted `D-ARCH-016` category:

- CI uses an explicitly declared supported runtime version;
- dependency installation uses the package manager's frozen/lockfile-respecting mode;
- production builds do not rely on mutable CI runner defaults.

This ADR does not accept pnpm or Node.js.

## 6. Options Considered

### Option A — GitHub Actions as Primary CI / Release Orchestrator

Use GitHub Actions for PR validation, security checks, build/provenance, release orchestration, and provider deployment invocation.

Current official GitHub capabilities relevant to the architecture include:

- repository-native PR/status-check integration;
- explicit `GITHUB_TOKEN` permissions;
- GitHub Environments with secrets and deployment protection features, subject to repository plan/visibility constraints;
- OIDC tokens for short-lived federated cloud credentials when the target provider supports them;
- reusable workflows;
- workflow artifacts;
- concurrency controls;
- dependency review/security integrations;
- artifact attestations, with private-repository availability depending on GitHub plan;
- repository/branch/ruleset integrations where plan supports them.

Strengths:

- source/PR/release history in one system;
- low Phase 1 operational overhead;
- natural status-check integration;
- strong audit linkage to source SHA and workflow run;
- supports provider-neutral deployment invocation;
- reusable workflows can centralize repeated gates;
- broad security ecosystem.

Tradeoffs:

- workflow code itself becomes security-sensitive;
- environment reviewer/protection capabilities vary by plan/visibility;
- third-party actions increase supply-chain risk;
- hosting/runtime secrets can be over-centralized into GitHub if discipline is weak;
- provider-specific deployment authentication may still require a secret when OIDC is unavailable.

### Option B — Hosting-Provider-Native Build / Deploy Pipeline

Conceptually:

```text
Git merge/push
-> hosting provider build
-> hosting provider deploy
```

Representative current hosting candidate from ADR-0016: Render, still unaccepted.

Current Render documentation supports:

- automatic deploys after CI checks pass;
- manual deployment of a specific commit;
- secret deploy hooks that can be triggered by CI;
- API/CLI deployment paths;
- pre-deploy commands suitable for migration-like release steps;
- provider deploy history.

Strengths:

- simple deployment executor;
- tight runtime integration;
- minimal release plumbing;
- good preview/build ergonomics where provider supports them.

Tradeoffs:

- provider build/deploy lifecycle can become the release authority rather than an executor;
- production approval, cross-deployable orchestration, supply-chain checks, and migration gating may be weaker or provider-specific;
- web/worker coordination may require multiple service deploys;
- provider coupling makes exit harder;
- a secret deploy hook/API token may be required when no federated identity path exists;
- automatic `On Commit` production deployment is too permissive as the only production gate.

### Option C — Independent CI Platform

Use a separate mature CI service such as Buildkite, CircleCI, GitLab CI, or equivalent.

Strengths:

- independent from source host and application host;
- flexible runners and deployment integrations;
- may suit later enterprise/compliance/private-network needs.

Tradeoffs:

- another account/control plane;
- additional secrets/identity integration;
- separate audit/billing/incident surface;
- little current GymPulse evidence that GitHub-native CI is insufficient;
- higher Phase 1 operational cost.

No independent CI vendor is selected by this ADR.

### Option D — Split Model

Use:

```text
GitHub Actions
  -> PR CI / tests / security / release orchestration

Hosting platform
  -> deployment execution

Target runtime secret facility
  -> application runtime secrets

Database/runtime provider
  -> narrowly scoped migration/runtime identities
```

Strengths:

- keeps release policy near source/PR governance;
- keeps runtime secrets near runtime;
- preserves hosting replaceability;
- allows OIDC/federation where supported and narrow deployment secrets where not;
- keeps hosting provider as executor rather than policy authority;
- enables controlled web + worker + migration coordination.

Tradeoffs:

- requires deliberate ownership boundaries;
- some metadata exists in both GitHub and hosting provider;
- provider integration must be tested per host;
- environment approval capability may be split if GitHub plan limitations apply.

## 7. Evaluation

| Criterion | GitHub Actions primary | Hosting-native pipeline | Independent CI | Split model |
|---|---|---|---|---|
| GitHub repository fit | **Strong** | Moderate | Moderate | **Strong** |
| PR checks | **Strong** | Moderate | Strong | **Strong** |
| branch/protection integration | **Strong, plan-dependent features** | Weak/Moderate | Moderate | **Strong** |
| environment approvals | Strong but plan/visibility dependent | Provider-dependent | Vendor-dependent | **Flexible across controls** |
| least privilege | Strong if explicit | Provider-dependent | Strong if configured | **Strongest boundary separation** |
| OIDC/federation | Strong where target supports | Provider-dependent | Vendor-dependent | **Strong where supported** |
| secret isolation | Moderate if overused | Runtime-friendly | Vendor-dependent | **Strong: runtime secrets stay runtime-owned** |
| preview safety | Strong if configured | Often strong | Strong if configured | **Strong** |
| web + worker coordination | Strong orchestrator | Provider-specific | Strong | **Strong** |
| migration sequencing | Strong | Provider-specific | Strong | **Strong** |
| artifact provenance | Strong | Provider-build dependent | Strong | **Strong** |
| rollback support | Orchestrates, host executes | Strong provider-specific | Orchestrates | **Strong combined model** |
| hosting portability | Strong | Weak | Strong | **Strong** |
| DB-provider portability | Strong | Moderate | Strong | **Strong** |
| auditability | **Strong source/run linkage** | Split from PR governance | Strong | **Strong cross-system linkage** |
| developer experience | **Strong** | Strong for simple deploys | Moderate | Strong |
| security ecosystem | **Strong** | Provider-limited | Strong | **Strong** |
| cost/operational burden | Low/Moderate | **Lowest simple path** | Medium/High | Low/Moderate |
| monorepo fit | Strong | Provider-specific | Strong | Strong |
| reusable release logic | Strong | Provider-specific | Strong | **Strong** |
| vendor lock-in | Moderate | High | Moderate | **Lowest practical coupling** |
| Phase 1 simplicity | Strong | Strong but weaker policy boundary | Moderate | **Strong** |
| reversibility | Strong | Moderate | Strong | **Strongest practical** |
| overall GymPulse fit | Strong | Credible deployment executor | Credible future option | **Strongest current architecture** |

Feature count alone does not determine the proposal.

## 8. Proposed Decision

### 8.1 Release architecture

**Propose the Split Model with GitHub Actions as the primary CI/release-policy orchestrator and the hosting platform as a replaceable deployment executor.**

Conceptually:

```text
Pull Request
  -> required CI/security checks
  -> review
  -> protected default branch

Reviewed commit SHA
  -> release candidate CI
  -> build/test/security/provenance
  -> pre-production validation
  -> explicit production promotion gate
  -> production release concurrency lock
  -> migration compatibility + controlled migration when required
  -> deploy web/API + worker with version compatibility
  -> post-deploy smoke
  -> operational watch
  -> release complete / rollback / forward-fix
```

GitHub Actions is the leading CI candidate, not an accepted product.

### 8.2 Hosting integration

The hosting provider remains separately governed.

For the current Render candidate, current official documentation supports:

- deploying only after external CI checks pass;
- manual/specific-commit deploys;
- deploy hooks suitable for CI invocation;
- pre-deploy commands;
- provider deploy history.

A future Render implementation should prefer a release path that deploys the exact approved commit and does not make `On Commit` auto-deploy the sole production control.

If another host is selected, the same release gates and provenance requirements remain.

### 8.3 Production approval

Production release requires an explicit protection mechanism appropriate to the selected GitHub plan/provider:

- protected default branch plus required checks;
- a protected production environment/reviewer gate where current GitHub plan supports it; or
- an equivalent auditable hosting/release approval if GitHub environment reviewer protection is unavailable.

Do not hard-code the architecture to a plan-dependent GitHub feature that the current private repository may not have.

### 8.4 Staging posture

This ADR does not mandate a permanently running staging environment.

It requires a pre-production validation class satisfying `NFR-OPERATIONS-001`. That may be:

- isolated CI/integration environment,
- ephemeral preview environment,
- controlled staging/pre-production environment when deployment/provider behavior requires it.

Persistent staging becomes justified when provider integrations, migrations, operational rehearsal, or release-risk evidence requires it.

### 8.5 Explicit non-decisions

This ADR does not accept:

- GitHub Actions,
- Render,
- Vercel,
- Fly.io,
- Google Cloud,
- a GitHub plan,
- branch protection configuration,
- GitHub environment configuration,
- a secret manager,
- an OIDC trust policy,
- pnpm,
- Node.js,
- PostgreSQL,
- Drizzle,
- pg-boss,
- a testing framework,
- an observability provider,
- IaC,
- semantic-release,
- changesets,
- a scanner,
- an SBOM tool,
- an artifact registry.

## 9. Pull Request and CI Gate Model

### 9.1 PR gate

Production-bound code should normally flow through reviewed PRs into the default branch.

Conceptual protections:

- default branch protected from uncontrolled direct mutation;
- required status checks;
- review before merge for non-trivial production-bound changes;
- no release from an unreviewed feature/fork branch;
- no exact reviewer count invented here.

Sensitive areas should later support ownership/review controls for:

- database migrations,
- authorization/security code,
- payment/provider adapters,
- hosting/release configuration,
- workflow files,
- infrastructure configuration,
- security policy.

This ADR does not create CODEOWNERS or branch settings.

### 9.2 Pipeline capability model

A production-capable pipeline should support:

```text
checkout
-> deterministic dependency install
-> lint/static quality checks where accepted
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
-> preview/pre-production validation where applicable
-> production approval
-> controlled migration
-> deploy
-> post-deploy smoke
-> observability check
```

Affected-package optimization is allowed later only after dependency-impact logic is proven not to skip required correctness/security gates.

### 9.3 Fail closed

Required release gates block promotion on failure.

Examples:

- failed tests -> no production promotion;
- failed build -> no promotion;
- failed migration validation -> no production migration/deploy;
- failed authorization negative test -> no promotion;
- unresolved critical release-security issue -> no automatic bypass.

Emergency override, if later supported, must be rare, authorized, logged, minimal, and post-reviewed.

### 9.4 Token permissions

If GitHub Actions is implemented:

- set explicit minimum `GITHUB_TOKEN` permissions;
- elevate per job only where required;
- do not use blanket write-all defaults for ordinary jobs;
- deployment jobs are separated from read-only PR validation jobs.

Current GitHub documentation explicitly recommends least-privilege `GITHUB_TOKEN` permissions.

## 10. Environment and Promotion Model

### 10.1 Environment classes

At minimum distinguish:

```text
local/development
CI/test
preview
pre-production/staging where adopted
production
```

Each environment deliberately owns its:

- database/data boundary,
- Auth credentials,
- payment credentials,
- messaging credentials,
- webhook endpoints/secrets,
- runtime secrets,
- deployment permissions.

Preview does not connect to production dependencies merely for convenience.

### 10.2 Promotion model

Preferred flow:

```text
PR
-> required checks
-> review/merge
-> reviewed main commit SHA
-> release candidate validation
-> pre-production validation where applicable
-> production approval
-> controlled production release
```

Exact manual versus automatic timing may vary, but production must never be promoted merely because a developer pushed unreviewed code.

### 10.3 Release concurrency

Where migration/deployment sequencing requires it:

```text
one production release mutation at a time
```

Two pipelines must not race production migration and rollout.

GitHub Actions concurrency groups are one current implementation capability, not the architecture itself.

## 11. Secret and Credential Model

### 11.1 Secret categories

Classify separately:

| Category | Preferred owner/location | CI exposure |
|---|---|---|
| CI-only credentials | CI/repository environment facility | only exact CI jobs |
| deployment credentials | CI production environment or federated identity | production deploy job only |
| application runtime secrets | target runtime/environment secret facility or approved secret manager | generally not needed in CI |
| runtime DB credentials | runtime secret facility | not general CI |
| migration DB credentials | controlled release/migration facility | migration job only |
| provider runtime secrets | target runtime secret facility | only provider integration validation where needed |
| webhook verification secrets | runtime secret facility | only relevant test/sandbox jobs |
| public client-safe config | build/runtime public configuration | not secret |

Preserve:

```text
Production Secret
!=
Repository Variable
!=
Client Environment Variable
!=
Preview Secret
```

A value embedded in browser output is public regardless of environment-variable naming.

### 11.2 Runtime secret ownership

Runtime application secrets should live at the runtime/provider boundary or an approved secret manager rather than being copied unnecessarily into CI.

CI receives only the secrets needed for the current step.

### 11.3 OIDC/federation

Preferred where safely supported:

```text
GitHub Actions job identity
-> OIDC token
-> short-lived provider credential
-> narrowly scoped deployment permission
```

Benefits:

- no long-lived cloud deployment secret stored in GitHub;
- short credential lifetime;
- repository/environment/audience conditions;
- easier revocation.

Current GitHub documentation requires explicit `id-token: write` to request an OIDC token; that permission alone does not grant resource write access.

OIDC is not mandatory when the selected hosting provider lacks a safe federation path.

### 11.4 Long-lived deployment credentials

When unavoidable:

- scope to one environment/service where possible;
- store in protected production release context;
- rotate;
- audit;
- never expose to fork/preview jobs;
- do not share one production admin token across all CI jobs.

For the current unaccepted Render candidate, current official deployment docs describe secret deploy hooks/API keys rather than establishing a GymPulse-approved OIDC path. If Render remains selected later, the exact credential method requires a dedicated least-privilege validation.

### 11.5 Rotation/revocation

Architecture must support:

```text
introduce replacement
-> deploy/transition
-> verify
-> revoke old credential
```

Incident flow:

```text
suspected exposure
-> identify scope
-> revoke/rotate
-> redeploy if required
-> verify access/logs
-> invalidate related sessions/tokens where relevant
-> preserve incident evidence
```

No key/secret is created here.

## 12. Database Migration Release Model

### 12.1 Controlled migration

Preserve ADR-0016:

```text
production migration
=
one controlled release action
```

not:

```text
every replica starts
-> migration race
```

### 12.2 Privilege separation

Where topology supports:

```text
Runtime DB Role
!=
Migration DB Role
```

The routine application/worker should not hold schema-owner privileges merely because a migration job needs them.

### 12.3 Validation

Future release gates should validate:

- migration history from empty DB -> current schema where feasible;
- representative previous supported schema -> new schema;
- migration failure blocks application rollout;
- only one migration runner executes;
- migration and runtime role permissions;
- if RLS later accepted, policy/runtime/worker/admin role behavior and Tenant A -> Tenant B negative isolation.

### 12.4 Rolling schema compatibility

Prefer compatible evolution:

```text
expand
-> deploy code compatible with old + new shape
-> migrate/backfill if required
-> observe
-> contract/remove old representation in later release
```

Avoid destructive one-step migrations that make rollback/forward-fix unsafe.

### 12.5 Test data

CI/pre-production uses synthetic/non-production data by default.

Production PII is not copied into CI/developer environments merely for realism.

## 13. Web / API / Worker Deployment Coordination

Separate runtime units may temporarily run different versions during rollout.

Release design must tolerate:

```text
old web + new worker
new web + old worker
old job payload + new worker
new code + old schema
old code + expanded schema
```

Required principles:

- job payloads have stable type/version contracts where needed;
- shared contracts evolve compatibly;
- schema change is compatible with rolling versions;
- application/business idempotency remains independent of rollout ordering;
- web and worker deploys are separately observable;
- one runtime can be stopped/restarted without destroying canonical state.

Worker deployment follows ADR-0015 semantics:

```text
stop claiming new work
-> finish or safely abandon/lease-expire current work
-> deploy
-> resume
```

Do not treat process termination as successful job completion.

Deployment order is release-specific. A normal compatible release may use:

```text
validate
-> migration compatibility
-> expand-safe migration if needed
-> deploy web/API and worker in compatible order
-> smoke/observe
```

No universal web-before-worker or worker-before-web rule is imposed.

## 14. Rollback and Forward-Fix Model

### 14.1 Separate rollback domains

“Rollback” means different things for:

- application code,
- worker code,
- configuration,
- database schema,
- transformed production data.

A code rollback may be safe while a destructive data/schema change may not be reversible.

### 14.2 Forward fix

For many production data/schema incidents:

```text
stop promotion
-> stabilize compatible version
-> deploy forward fix
```

is safer than attempting to reverse irreversible transformations.

### 14.3 Backup is not routine rollback

Preserve:

```text
database backup restore
!=
routine deployment rollback
```

Restoring a production DB can discard valid post-backup transactions and requires explicit incident/recovery procedures.

### 14.4 Automatic rollback

Automatic rollback may be appropriate for clear runtime health failure before irreversible state change.

It is not universally enabled after migrations/business effects.

## 15. Supply-Chain Security

### 15.1 Dependencies

Release CI should eventually include:

- lockfile/frozen install;
- dependency vulnerability review/scanning;
- dependency-change review where available;
- license/policy review where required;
- explicit security finding suppression with reason/scope/owner/review trigger.

No scanner or policy threshold is selected here.

### 15.2 Third-party CI actions/plugins

Third-party actions execute code in the release trust boundary.

Posture:

- use trusted/approved sources;
- minimize third-party actions;
- review permissions/secrets before use;
- prefer full immutable commit-SHA pinning for third-party/high-risk production actions where practical;
- review/update pinned revisions deliberately;
- use organization/repository action allowlists if later justified.

Current GitHub security guidance recommends full commit-SHA pinning for third-party actions because mutable tags can move.

### 15.3 Untrusted input

Do not interpolate untrusted issue/PR/ref metadata directly into shell/code execution.

Avoid `pull_request_target` or similar privileged patterns that check out untrusted PR code while retaining write/secrets privileges.

### 15.4 CI caches

Caches are performance accelerators, not trusted artifacts.

Rules:

- never cache secrets/tokens/credential files;
- restored cache content is treated as untrusted;
- untrusted/fork PR jobs do not receive privileged cache-write access;
- preserve GitHub's low-trust read-only defaults rather than overriding them casually;
- trusted release jobs should not execute attacker-controlled cached output without validation.

### 15.5 Artifact attestations

GitHub artifact attestations can cryptographically link artifacts to workflow/repository/commit metadata.

They are a useful defense-in-depth capability when GymPulse produces deployable binaries/images/artifacts and has an applicable GitHub plan.

They are not required for every test build and do not prove that an artifact is secure.

Current GitHub documentation states that private/internal repository attestation availability is plan-dependent. Because GymPulse is currently private, this ADR does not make attestations a Phase 1 acceptance requirement.

### 15.6 SBOM

SBOM generation is a recommended future capability/compliance trigger, not a Phase 1 mandatory gate absent an artifact/compliance requirement.

## 16. Security and Privacy Impact

| Threat | Control / posture |
|---|---|
| Untrusted PR receives production secret | separate low-trust PR jobs; no production environment/secrets |
| Compromised CI action steals token | minimal permissions/secrets; trusted sources; immutable pinning |
| `GITHUB_TOKEN` overprivileged | explicit minimum permissions; per-job elevation |
| Long-lived cloud key leaks | OIDC/federation preferred where supported |
| Deployment secret leaks | narrow environment/service scope; rotate; no previews |
| Runtime secrets copied into CI | runtime store is preferred owner |
| Migration credential used routinely | separate migration identity/job |
| Preview connects to production | environment-specific credentials/data/endpoints |
| Secret committed to repo | scanning + review + immediate revocation/rotation; scanning is not permission to commit |
| Secret printed in logs | no echo; masking as defense in depth; safe command design |
| Secret stored in artifact/cache | prohibited; artifact/cache review |
| Cache poisoning | low-trust read-only defaults; treat restored cache as untrusted |
| Malicious PR workflow edit | PR workflow is untrusted; production job requires trusted revision/promotion gate |
| Mutable third-party action compromised | pin/review high-risk actions and minimize dependencies |
| Unreviewed production mutation | protected source path + release approval/audit |
| CI runner compromise | least privilege + short-lived credentials + no broad production network |
| Production DB overexposed to CI | migration-only identity/network path |
| Cross-tenant regression ships | required negative authorization regression gates |
| Payment regression ships | provider-verification/duplicate-effect regression gates |
| Job replay regression ships | retry/dedupe/tenant/job-failure regression gates |
| Sensitive data in test env | synthetic/non-production data; no default production snapshot |
| Release metadata leaks PII | release telemetry contains version/service metadata, not Member data |

## 17. Reliability and Availability Impact

### 17.1 Fail closed

Required checks must fail release closed.

The pipeline must not convert test, build, migration, or security gate failures into successful production promotion automatically.

### 17.2 Rolling compatibility

Release architecture must assume web/API and worker may briefly overlap versions during rolling deployments.

Compatibility is designed, not assumed.

### 17.3 Deployment interruption

If request/worker deployment interrupts execution:

- request idempotency protects retried commands;
- durable jobs recover from worker interruption;
- canonical state remains in persistence;
- release tooling does not declare a killed worker job “successful.”

### 17.4 Migration safety

Schema migrations and code deployment are coordinated. Destructive contraction happens only after old code no longer depends on the removed representation.

### 17.5 Production incident mode

Future operations should be able to pause production promotion during incidents.

A break-glass release path, if later implemented, remains rare, authorized, logged, minimal, and post-reviewed.

## 18. Operations and Observability Impact

### 18.1 Production change audit

Every production change should be attributable to:

```text
source commit SHA
CI/release run
target environment
deployable/service
deployment/build identifier
actor
approval where available
result
timestamp
```

Ad-hoc hosting-console changes should be minimized and documented when emergency intervention occurs.

### 18.2 Release telemetry

Application/runtime telemetry should expose safe release metadata such as:

- commit/release identifier;
- runtime service/deployable;
- deployment timestamp/build identifier where practical.

Operators should correlate release events with:

- error-rate changes,
- auth failures,
- webhook failures,
- worker/job failures,
- migration errors,
- latency regressions.

`D-PROVIDER-006` remains Open.

### 18.3 Post-deploy smoke/watch

After production deploy, validate safe signals such as:

- liveness/readiness,
- public web entry,
- safe authenticated path where feasible,
- API reachability,
- DB connectivity,
- worker health,
- webhook callback path health,
- error/latency anomalies,
- job failures.

Sensitive financial/attendance flows should be verified end-to-end in sandbox/non-production rather than creating destructive synthetic production transactions.

No fixed watch duration is invented here.

### 18.4 Hosting configuration drift

If hosting configuration is manually editable, later operations should constrain/document drift through:

- restricted production console access,
- change audit,
- configuration inventory/export,
- periodic review,
- future IaC when justified.

Full IaC is not required for Phase 1 while provider configuration remains small and auditable.

IaC revisit triggers include multiple environments/resources, network complexity, compliance evidence, drift incidents, provider migration, or team growth.

## 19. Testing and Validation

Before acceptance, future non-production evidence must cover at least:

1. PR receives required checks.
2. failing lint/static gate blocks release when that gate is required.
3. failing typecheck blocks release where applicable.
4. failing unit/domain test blocks release.
5. failing authorization negative test blocks release.
6. failing real-database integration test blocks release.
7. failed production build blocks release.
8. frozen dependency install succeeds.
9. untrusted PR cannot access production secrets.
10. preview uses only non-production credentials.
11. CI token has minimum permissions.
12. OIDC/federated deploy path works if selected.
13. deployment identity cannot access unrelated resources.
14. web artifact/build is tied to source commit/run.
15. worker artifact/build is tied to the same release context.
16. migration from zero succeeds.
17. representative previous-schema upgrade succeeds.
18. migration failure blocks rollout.
19. one controlled migration runner executes.
20. replicas do not race migrations on startup.
21. web/worker rolling compatibility.
22. worker graceful deployment/retry behavior.
23. production approval protection.
24. concurrent production release attempts do not race.
25. post-deploy web/API health smoke.
26. post-deploy worker health.
27. request telemetry exposes release version.
28. job telemetry exposes release version.
29. failed web deploy rollback/forward-fix.
30. failed worker deploy recovery.
31. destructive migration rollback limitation is documented/tested.
32. secret rotation rehearsal.
33. leaked credential revocation rehearsal.
34. secret scanning detects a planted fake credential.
35. logs/artifacts/caches contain no secret.
36. sandbox provider integration.
37. provider webhook contract regression.
38. payment exactly-once regression.
39. cross-tenant authorization regression.
40. hosting-provider deployment integration spike.
41. provider exit/redeploy path.

No tests/workflows/scanners are implemented by this ADR.

## 20. Migration and Adoption Plan

If this ADR is later accepted:

1. resolve the final CI/vendor/hosting integration choice;
2. confirm available GitHub plan features for private-repository branch/environment protection;
3. define protected default-branch policy;
4. implement low-privilege PR CI without production secrets;
5. define deterministic runtime/dependency setup after `D-ARCH-011`/`D-ARCH-016` acceptance;
6. implement unit/application/authorization/integration/contract gates using the separately accepted testing toolchain;
7. add dependency/secret security gates appropriate to available platform capabilities;
8. define release identity/provenance;
9. define pre-production validation environment;
10. implement production promotion protection;
11. implement OIDC federation where supported or a narrow deployment credential where not;
12. separate runtime vs migration DB credentials;
13. implement one controlled migration step;
14. implement compatible web/worker rollout;
15. add post-deploy smoke/watch;
16. rehearse rollback/forward-fix;
17. rehearse secret rotation/revocation;
18. document hosting/provider exit;
19. only then treat production release automation as ready.

## 21. Reversibility and Provider Exit

Release policy must survive CI/hosting provider changes.

Preserve outside any single vendor:

- repository/source history;
- required-check definitions in documentation;
- build/test commands;
- deployable boundaries;
- release identity convention;
- environment model;
- secret classification/ownership inventory;
- migration command/process;
- rollback/forward-fix procedures;
- post-deploy smoke requirements;
- provider integration adapters/scripts/config where later implemented;
- release/audit correlation model.

A migration from GitHub Actions to an independent CI system should not require changing application/domain semantics or production credential ownership.

A hosting-provider change should replace only the deployment executor/credential path while preserving the release gate model.

## 22. Risks and Mitigations

### Risk: GitHub Actions becomes silently accepted because repository is on GitHub

Mitigation: ADR remains Proposed; the architecture is provider-neutral and alternatives are evaluated.

### Risk: hosting provider auto-deploy bypasses explicit release approval

Mitigation: production host integration must respect approved source revision and release gate; `On Commit` alone is insufficient as the only production control.

### Risk: GitHub private-repository plan lacks desired environment/ruleset protection

Mitigation: validate plan capabilities before implementation and permit equivalent hosting/release approval controls without weakening the invariant.

### Risk: production secrets accumulate in GitHub

Mitigation: keep runtime secrets in runtime/approved secret store; CI receives only deployment/migration credentials it needs.

### Risk: static deployment credentials become permanent

Mitigation: prefer OIDC where supported; otherwise narrow scope, environment isolation, rotation, and revocation rehearsal.

### Risk: third-party action compromise

Mitigation: minimize dependencies, review sources, pin high-risk third-party actions immutably, restrict token permissions, and avoid unnecessary secrets.

### Risk: cache poisoning crosses trust levels

Mitigation: preserve low-trust read-only cache posture and treat restored caches as untrusted.

### Risk: monorepo optimization skips a required test

Mitigation: start conservative; introduce affected-scope optimization only with verified dependency graph/coverage.

### Risk: code rollback after destructive migration corrupts expectations

Mitigation: expand/contract evolution and explicit rollback-vs-forward-fix decision.

### Risk: web and worker versions are incompatible

Mitigation: versioned payload/contracts, rolling compatibility tests, and release-specific ordering.

### Risk: migration job has broad permanent access

Mitigation: separate migration identity and controlled release-time access.

### Risk: security scanners create noisy bypass culture

Mitigation: auditable suppression with reason, scope, owner, and review trigger; no global ignore policy.

## 23. Revisit Triggers

Revisit the release architecture if:

- hosting provider changes;
- GitHub plan/organization model changes materially;
- deployment count/team size grows;
- compliance/security certification begins;
- enterprise customers require stronger evidence;
- regulated health data enters active scope;
- self-hosted runner/private-network requirements appear;
- artifact/container publishing becomes central;
- native Member releases require mobile-store pipeline;
- multiple regions/environments increase orchestration complexity;
- monorepo affected-scope CI becomes materially expensive;
- provider federation/OIDC capabilities change;
- repeated hosting-console drift justifies IaC;
- independent CI offers required security/network functionality unavailable in GitHub Actions.

## 24. Open Questions

1. Which GitHub plan/features will be available for private-repository production environment protection?
2. What exact branch protection/ruleset policy will be used?
3. What reviewer/approval role model is appropriate?
4. Will GitHub Actions be explicitly accepted?
5. Which hosting provider is accepted?
6. Does the final host support secure OIDC/federated deployment identity?
7. If not, what is the narrowest production deployment credential?
8. Is a persistent staging environment needed?
9. What exact test tools are accepted under `D-ARCH-018`?
10. What package manager is accepted under `D-ARCH-011`?
11. Which exact supported Node.js production version is selected within accepted `D-ARCH-016`?
12. What database/migration tool is accepted?
13. What production DB network path can the migration runner use?
14. What security scanner categories/features are available under the chosen GitHub plan?
15. What security finding suppression/review policy is approved?
16. Are artifact attestations useful/available for the eventual artifact model?
17. Is SBOM generation required by a customer/compliance trigger?
18. What release metadata retention period is required?
19. What is the break-glass release authority/process?
20. What observability provider will receive release markers?
21. What production-change drift/IaC threshold is appropriate?

## 25. Decision Evidence

### 25.1 Repository audit

Fresh latest-`main` audit verified:

- `ADR-0017-ci-cd-release-secrets.md` did not exist before Task 0025.
- `.ai/task/0025-draft-ci-cd-release-secrets-adr.md` did not exist.
- `D-ARCH-019` remained the actual next bounded ADR decision.
- canonical `D-ARCH-019 = P1 OPEN`.
- GitHub-native CI remained only a leading candidate.
- no current ADR was `Accepted`.
- no `.github/workflows` directory existed.
- no production workflow existed as decision evidence.
- no hosting provider was accepted.
- ADR-0016 remained Proposed and `D-ARCH-009` remained Open.
- ADR-0015 remained Proposed and `D-ARCH-007` remained Open.
- the repository is private.
- current repository ruleset access returned a plan-gating message; no ruleset was created or assumed.
- branch-protection state was not used as evidence because the integration could not read that administrative endpoint.
- the structured target directories `docs/09-security/` through `docs/14-operations/` listed in the task do not currently exist; legacy flat documents were therefore used only as migration/evidence input where useful.

### 25.2 Official research

Research date: `2026-09-26`.

GitHub Actions / GitHub repository governance:

- GITHUB_TOKEN / least privilege:
  https://docs.github.com/en/actions/tutorials/authenticate-with-github_token
- secure Actions use:
  https://docs.github.com/en/actions/reference/security/secure-use
- deployment environments/protection rules/secrets:
  https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments
- managing environments:
  https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments
- deployment concurrency/history:
  https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/control-deployments
- OIDC:
  https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-cloud-providers
- protected branches:
  https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
- repository rulesets:
  https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets
- reusable workflows:
  https://docs.github.com/en/actions/reference/workflows-and-actions/reusing-workflow-configurations
- workflow artifacts:
  https://docs.github.com/en/actions/tutorials/store-and-share-data
- dependency review:
  https://docs.github.com/en/code-security/concepts/supply-chain-security/dependency-review
- dependency cache security:
  https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching
- artifact attestations:
  https://docs.github.com/en/actions/concepts/security/artifact-attestations

Current Render hosting-integration evidence:

- deploy behavior / CI-check integration:
  https://render.com/docs/deploys
- deploy hooks:
  https://render.com/docs/deploy-hooks

### 25.3 Material current findings

- GitHub recommends minimum necessary `GITHUB_TOKEN` permissions because actions can access the token through the job context.
- GitHub Environments can scope secrets and protection rules, but reviewer/protection availability varies by plan and repository visibility.
- GitHub OIDC enables short-lived cloud credentials without storing long-lived cloud keys when a target provider supports federation.
- GitHub concurrency can serialize deployment jobs.
- Required status checks can protect merges when configured.
- GitHub dependency review can detect vulnerable dependency changes before merge where the repository/plan supports it.
- GitHub's current cache model explicitly treats low-trust triggers differently and warns that caches can be poisoned; sensitive data must never be cached.
- GitHub recommends immutable commit-SHA pinning for third-party actions to prevent mutable-tag substitution.
- Artifact attestations can link artifacts to repository/workflow/commit provenance but are not proof that the artifact is secure and private-repository availability is plan-dependent.
- Render can wait for GitHub CI checks, deploy a specific commit, or be triggered through a secret deploy hook; therefore it can act as a replaceable deployment executor without becoming the CI policy authority.
- Render deploy hooks themselves are secret values and would require protected handling if used.

### 25.4 Missing acceptance evidence

ADR-0017 remains Proposed because the following are unresolved/unvalidated:

- explicit decision-owner approval;
- accepted CI vendor;
- available GitHub plan/protection features;
- final hosting provider/integration;
- final package manager/runtime/test tooling;
- actual required-check list;
- production approval role/process;
- OIDC feasibility for selected host;
- secret-storage/provider choices;
- migration network/credential model;
- representative web/worker release spike;
- rollback/forward-fix rehearsal;
- secret rotation/revocation rehearsal;
- security scanning/suppression governance;
- artifact/provenance implementation;
- post-deploy smoke/observability integration;
- provider exit rehearsal.

## 26. Related Documents

- `../README.md`
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
- `ADR-0003-monorepo-strategy.md`
- `ADR-0004-database-engine.md`
- `ADR-0005-data-access-migration-strategy.md`
- `ADR-0006-managed-backend-responsibilities.md`
- `ADR-0010-data-layer-tenant-isolation-rls.md`
- `ADR-0011-api-contract-architecture.md`
- `ADR-0012-owner-staff-web-framework.md`
- `ADR-0014-api-deployment-boundary.md`
- `ADR-0015-background-jobs-scheduler.md`
- `ADR-0016-hosting-deployment-platform.md`
- legacy migration source: `../12-security-audit.md`
- legacy migration source: `../13-testing-qa.md`
- legacy migration source: `../15-engineering-workflow.md`
- legacy migration source: `../16-open-decisions.md`
