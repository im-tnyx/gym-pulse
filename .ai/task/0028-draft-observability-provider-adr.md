# Task 0028: Draft Observability Provider ADR

## Goal

Draft one `Proposed` ADR for canonical decision `D-PROVIDER-006` defining GymPulse's Phase 1 observability provider and instrumentation direction without provisioning a provider, installing an SDK, creating credentials, enabling telemetry, or changing the canonical decision to `DECIDED`.

Target:

`docs/adr/ADR-0020-observability-provider.md`

## Inputs Read

Fresh latest-`main` repository/governance inputs included:

- `.ai/README.md`
- `.ai/current-state.md`
- `.ai/task/0027-draft-package-manager-adr.md`
- `docs/README.md`
- `docs/00-overview/assumptions.md`
- `docs/01-product/non-functional-requirements.md`
- `docs/02-architecture/architecture-principles.md`
- `docs/02-architecture/architecture-overview.md`
- `docs/02-architecture/container-architecture.md`
- `docs/02-architecture/component-architecture.md`
- `docs/02-architecture/data-flow.md`
- `docs/02-architecture/technology-stack.md`
- `docs/adr/README.md`
- `docs/adr/ADR-0016-hosting-deployment-platform.md`
- `docs/adr/ADR-0017-ci-cd-release-secrets.md`
- `docs/adr/ADR-0018-testing-toolchain.md`
- `docs/adr/ADR-0019-package-manager.md`

Legacy migration/evidence inputs included:

- `docs/12-security-audit.md`
- `docs/15-engineering-workflow.md`
- `docs/16-open-decisions.md`

Canonical structured documentation controls over legacy recommendations.

## Repository State Verified

At Task 0028 start:

- latest `main` already contained `ADR-0019` and completed Task 0027 governance synchronization;
- `docs/adr/ADR-0020-observability-provider.md` did not exist;
- `.ai/task/0028-draft-observability-provider-adr.md` did not exist;
- structured `docs/11-observability/` documentation did not exist;
- `D-PROVIDER-006` remained `P1 OPEN`;
- no observability provider had explicit acceptance evidence;
- no current ADR was `Accepted`;
- no observability provider/SDK configuration was treated as architectural acceptance.

Task 0028 remained the next ordered bounded ADR task.

## Canonical Decision State

```text
D-PROVIDER-006
Priority: P1
Status: OPEN
Decision: Error monitoring / observability provider
Acceptance: none
```

`ADR-0020` is `Proposed`. Creating it does not convert `D-PROVIDER-006` to `DECIDED`.

## Canonical Observability Requirements

Verified:

- `NFR-OBSERVABILITY-001` structured logs + request/job correlation.
- `NFR-OBSERVABILITY-002` safe operational context; no secrets/unnecessary PII.
- `NFR-OBSERVABILITY-003` centralized API/browser/worker/webhook error visibility.
- `NFR-OBSERVABILITY-004` payment/webhook/reconciliation diagnostics.
- `NFR-OBSERVABILITY-005` background-job status/failure/tenant context.
- `NFR-OBSERVABILITY-006` business-health signals.
- `NFR-OBSERVABILITY-007` correlation across external requests and async continuations.

Related `NFR-SECURITY`, `NFR-PRIVACY`, `NFR-RELIABILITY`, `NFR-AVAILABILITY`, `NFR-OPERATIONS`, and `NFR-TESTABILITY` requirements also constrain telemetry.

## Architecture Boundaries Preserved

```text
Observability != Audit Log
Observability != Product Analytics
Metric != Canonical Business Truth
Trace != Transaction Record
OpenTelemetry != Observability Backend
Telemetry Export Failure != Business Operation Failure
```

Canonical DB/audit/provider reconciliation remains authoritative.

## Options Evaluated

Compared:

1. Grafana Cloud.
2. Sentry.
3. Datadog.
4. Better Stack.
5. hosting-native logs/metrics only.

Self-hosting remains a future/compliance alternative but is not proposed as the Phase 1 baseline because it adds operational ownership without current evidence.

## Current Official Research

Research date: `2026-09-27`.

### OpenTelemetry JavaScript

Reviewed:

- https://opentelemetry.io/docs/languages/js/
- https://opentelemetry.io/docs/languages/js/getting-started/browser/

Current status:

```text
Traces  Stable
Metrics Stable
Logs    Development
Browser instrumentation Experimental
```

This materially shaped the ADR: use OTel strongly for server traces/metrics, but do not force immature JS logs/browser instrumentation.

### Grafana Cloud

Reviewed current official material for:

- OTLP metrics/logs/traces ingestion;
- Application Observability;
- Frontend Observability/Faro;
- alerting/SLOs;
- pricing/retention;
- current regional stack availability.

Current evidence includes:

- managed OTLP metrics/logs/traces;
- OpenTelemetry-native application views;
- correlated logs/traces/metrics;
- browser errors/performance/client traces through Faro;
- privacy/settings controls;
- Grafana Alerting;
- usage/cost controls;
- currently operating India stacks on AWS/GCP plus many other regions.

### Sentry

Reviewed current official material for:

- error monitoring;
- tracing;
- Next.js/browser/server coverage;
- logs;
- session replay/privacy;
- hosted region/API behavior.

Current evidence:

- very strong error-centric developer workflow;
- strong Next.js/browser/server fit;
- logs/traces/error correlation;
- current hosted storage locations identified as US and Germany;
- provider SDK gives richer Sentry behavior than purely portable OTLP.

### Datadog

Reviewed current official material for:

- OpenTelemetry metrics/logs/traces;
- OTLP ingestion;
- RUM and backend correlation;
- sensitive-data scanning;
- hosted site locations.

Current evidence:

- very broad full-stack platform;
- strong OTel and RUM correlation;
- strong privacy/security controls;
- standard sites currently include US/EU/Japan/Australia/UK, not India;
- broader product/cost/operational surface than currently required.

### Better Stack

Reviewed current official material for:

- OpenTelemetry ingestion;
- distributed tracing;
- error tracking;
- browser telemetry;
- data regions;
- telemetry pricing.

Current evidence:

- straightforward OTLP logs/metrics/traces;
- integrated error/browser capabilities;
- common regions include US, Germany, Singapore;
- attractive lower-complexity alternative but less regional/integration breadth than the leading proposal.

## Evaluation Summary

Current GymPulse fit favors:

```text
Grafana Cloud
+
GymPulse-owned structured telemetry semantics
+
OpenTelemetry server traces/metrics
+
structured correlated logs
+
focused alerts
+
optional privacy-reviewed Faro browser telemetry
```

Reasons:

- broad coverage across API + worker + payments/jobs + browser;
- direct fit with existing OpenTelemetry portability requirement;
- strong log/trace/metric correlation;
- current India-region optionality while jurisdiction remains open;
- provider-independent server instrumentation is practical;
- alerting/dashboard capabilities cover operational requirements without another required provider.

This direction is not accepted.

## Structured Logging Posture

Application-owned structured log fields should include:

- severity/event code;
- service/environment/version;
- request/correlation identifiers;
- trace/span identifiers when present;
- job/attempt context where applicable;
- safe tenant/resource/provider category;
- error category/duration.

Do not dump arbitrary objects or full payloads.

## Privacy / Sensitive Data Posture

Do not intentionally emit:

```text
OTP
password
cookie
authorization header
bearer/refresh token
provider secret
database credential
raw payment credential
full webhook body
unnecessary member phone/email
free-text staff/member notes
full request/response body
browser storage contents
```

Provider-side redaction is defense in depth only.

## Correlation Posture

Preserve request/correlation context across:

```text
HTTP request
-> application
-> transaction
-> job
-> worker
-> provider call/callback
-> reconciliation/business effect
```

Correlation IDs are never authority.

## OpenTelemetry Posture

Phase 1 proposed split:

```text
server traces/metrics -> OpenTelemetry
structured logs -> application logging + correlation
browser telemetry -> provider-specific SDK only after privacy review
```

Do not force OTel JS logs/browser instrumentation solely for uniformity.

## Payment / Job Diagnostics

Payment diagnostics must support:

- webhook verification outcome;
- duplicate/replay classification;
- pending/stuck state diagnosis;
- business-effect status;
- reconciliation attempts;
- safe provider/internal references;
- correlation.

Worker diagnostics must support:

- job type/ID;
- attempt;
- start/finish;
- failure category;
- retry/terminal state;
- safe tenant context;
- correlation/release identity.

Neither telemetry path is canonical state.

## Browser Posture

Browser monitoring is optional/minimal Phase 1 evidence.

Potentially collect:

- browser errors;
- failed API/navigation categories;
- Web Vitals/performance;
- release/environment;
- safe backend correlation.

Do not enable unrestricted session replay, broad interaction capture, browser fingerprinting, or product-analytics-like tracking by default.

## Alerting Posture

Validate alerts for:

- API degradation;
- worker failures/backlog;
- webhook verification failures;
- payment-effect/reconciliation failures;
- notification failure spikes;
- data-quality failure spikes;
- telemetry export/pipeline failure.

Thresholds and SLOs remain evidence-driven and separately configured.

## Residency / Cost Posture

`D-SEC-001` remains open.

Grafana Cloud's current India stack availability is favorable evidence only, not region approval.

Before provider acceptance:

- validate exact residency;
- validate retention;
- validate RBAC/support/subprocessor implications;
- model representative logs/traces/metrics/browser cost;
- validate cardinality/sampling controls.

## Failure Posture

Observability is best-effort and bounded.

```text
telemetry unavailable
!=
business operation unavailable
```

Exporter retry/buffering must not create a secondary outage.

## Validation Required

Before acceptance require at least:

1. request correlation;
2. request -> job correlation;
3. payment webhook/effect correlation;
4. worker retry diagnosis;
5. centralized server exception;
6. centralized worker exception;
7. webhook verification diagnosis without raw payload;
8. no OTP/cookie/token/secret leakage;
9. release identity;
10. OTel server trace export;
11. bounded-cardinality metrics;
12. useful payment/job dashboard;
13. actionable alert delivery;
14. provider outage does not break business path;
15. bounded exporter retries/buffering;
16. retention validation;
17. RBAC validation;
18. `D-SEC-001` region validation;
19. representative cost measurement;
20. browser privacy validation if frontend telemetry enabled;
21. no session replay without explicit review;
22. migration/export path understood;
23. explicit decision-owner approval.

## Decisions Kept Separate

```text
D-SEC-001 jurisdiction/privacy
D-ARCH-009 hosting
D-ARCH-006 API topology
D-ARCH-007 jobs
D-ARCH-016 runtime
D-ARCH-019 CI/CD
D-PROVIDER-001 payment
D-PROVIDER-002 messaging
D-PROVIDER-005 product analytics
```

No decision above is accepted by Task 0028.

## Files Changed

Created:

- `docs/adr/ADR-0020-observability-provider.md`
- `.ai/task/0028-draft-observability-provider-adr.md`

Governance continuity updates:

- `docs/adr/README.md`
- `docs/README.md`
- `.ai/current-state.md`

No canonical requirement/architecture source required contradiction correction.

## Implementation Status

Task 0028 creates no:

```text
observability account
Grafana Cloud stack
Sentry/Datadog/Better Stack project
SDK dependency
OpenTelemetry package
Grafana Faro package
Grafana Alloy/Collector process
API/ingestion token
dashboard
alert rule
SLO
session replay
log drain
telemetry pipeline
CI workflow
production telemetry
```

No prior ADR is accepted.

## Result

Expected synchronized state:

```text
ADR-0020 = Proposed
D-PROVIDER-006 = P1 OPEN
Grafana Cloud = leading provider proposal only
OpenTelemetry server traces/metrics = proposed portable direction
Browser telemetry = optional/privacy-gated
No observability implementation
```

## Next Recommended Task

After Task 0028 synchronization, the ordered ADR backlog points to:

```text
Task 0029: Draft Object Storage ADR
Primary decision: D-ARCH-010
Likely target: docs/adr/ADR-0021-object-storage.md
Canonical status: P1 OPEN
```

`docs/adr/ADR-0021-object-storage.md` and `.ai/task/0029-draft-object-storage-adr.md` were verified absent at Task 0028 time.

Do not execute Task 0029 as part of Task 0028.
