# ADR-0020: Observability Provider

## Status

`Proposed`

## Decision Metadata

- ADR: `ADR-0020`
- Primary Decision ID: `D-PROVIDER-006`
- Related Decision IDs: `D-ARCH-009`, `D-ARCH-006`, `D-ARCH-007`, `D-ARCH-016`, `D-ARCH-019`, `D-ARCH-018`, `D-SEC-001`, `D-PROVIDER-001`, `D-PROVIDER-002`, `D-PROVIDER-005`
- Decision Owner: `Open`
- Technical Owner: `Architecture / Reliability / Security / Engineering`
- Date Proposed: `2026-09-27`
- Date Accepted: `Not accepted`
- Supersedes: `None`
- Superseded By: `None`

## 1. Context

GymPulse needs production diagnostics across interactive requests, background jobs, payment/webhook flows, provider integrations, and browser journeys. The observability requirement is not merely "store logs". It must help operators follow:

```text
request
-> trusted application operation
-> canonical transaction
-> durable continuation/job
-> provider call or callback
-> business effect
-> retry/reconciliation
```

without turning telemetry into another source of business truth or leaking secrets and unnecessary personal data.

Canonical `D-PROVIDER-006` is `P1 OPEN`. Current structured architecture already requires structured logs, correlation identifiers, centralized error visibility, payment/job diagnostics, business-health signals, and OpenTelemetry-compatible server instrumentation where practical. Exact provider selection remained intentionally open until the runtime/job/hosting direction was clearer.

The current architecture now provides enough context to draft a provider recommendation while keeping hosting, jurisdiction/privacy, runtime, CI/CD, payment/messaging providers, and product analytics independently governed.

Decision question:

> Which managed observability provider and instrumentation posture should GymPulse use for Phase 1 to provide privacy-safe correlated logs, errors, traces, metrics, browser/server visibility, payment/job diagnostics, and actionable alerts while preserving provider portability and ensuring observability failure never blocks canonical business operations?

This ADR does not provision an observability account, create credentials, install an SDK, create dashboards/alerts, enable session replay, or make `D-PROVIDER-006` `DECIDED`.

## 2. Requirements and Decision Drivers

Canonical requirements:

- `NFR-OBSERVABILITY-001` — production server/job logs should be structured and include request/job correlation.
- `NFR-OBSERVABILITY-002` — operational tenant/gym/branch context may be included where useful and privacy-safe; secrets and unnecessary PII are forbidden.
- `NFR-OBSERVABILITY-003` — API exceptions, web/mobile crashes, worker failures, and webhook-processing errors should be centralized.
- `NFR-OBSERVABILITY-004` — operators must diagnose webhook verification failures, duplicate provider events, stuck pending payments, business-effect failures, and reconciliation attempts.
- `NFR-OBSERVABILITY-005` — scheduled/background jobs must expose run status, failure state, tenant context, and sufficient safe metadata.
- `NFR-OBSERVABILITY-006` — production should expose health signals for notification failures, no-show job failures, payment exceptions, and data-quality issues.
- `NFR-OBSERVABILITY-007` — external requests and asynchronous continuations should preserve correlation/request identifiers where practical.

Related drivers:

- `NFR-SECURITY-004` — no secrets in source/client bundles.
- `NFR-SECURITY-011` — sensitive error detail must not leak to unauthorized users.
- `NFR-PRIVACY-001..004` — minimize personal data and avoid unnecessary secondary use.
- `NFR-RELIABILITY-001..008` — idempotency, payment effects, retries, canonical truth, diagnosis, and reconciliation.
- `NFR-AVAILABILITY-003` — provider dependency failure must degrade visibly and recoverably.
- `NFR-OPERATIONS-001..005` — environment separation, secret separation, safe releases, smoke validation, staff operability.
- `NFR-TESTABILITY-003` — provider/network/job failure paths must be testable.

Architecture drivers:

1. trace/correlate a request into jobs and provider effects;
2. strong structured-log support;
3. centralized exception/error grouping;
4. distributed tracing and performance visibility;
5. metrics/health signals and actionable alerting;
6. web/browser error and performance evidence without broad tracking by default;
7. OpenTelemetry-compatible server instrumentation for portability;
8. explicit privacy/redaction controls;
9. configurable retention and sampling;
10. region/residency flexibility while `D-SEC-001` remains open;
11. bounded cost/cardinality;
12. ordinary service/worker/serverless compatibility;
13. observability exporter failure must not block canonical operations;
14. provider SDK details must not leak into domain/application logic;
15. product analytics must remain separate from operational observability.

## 3. Constraints and Assumptions

1. `D-PROVIDER-006` remains `P1 OPEN`.
2. `ADR-0020` is `Proposed`, not `Accepted`.
3. `D-SEC-001` remains `P0 OPEN`; no production telemetry region is approved here.
4. `D-ARCH-009` remains `OPEN`; ADR-0016 proposes hosting direction but no host is accepted.
5. `D-ARCH-006` and `D-ARCH-007` remain `OPEN`; request/worker topology is still Proposed through ADR drafts.
6. `D-ARCH-016` remains `PROPOSED`; Node.js/TypeScript is not accepted by this ADR.
7. `D-ARCH-019` remains `OPEN`; CI/CD/release integration is separate.
8. `D-PROVIDER-001` and `D-PROVIDER-002` remain `OPEN`; payment/messaging providers are not selected.
9. `D-PROVIDER-005` remains `OPEN`; product analytics is not folded into observability.
10. Audit history is canonical business/security evidence; observability telemetry is diagnostic evidence.
11. No observability provider outage may prevent attendance, payment reconciliation, authorization, durable jobs, or other canonical business operations.
12. No exact SLO, retention duration, sampling rate, alert threshold, or telemetry budget is accepted here.
13. No session replay is a Phase 1 requirement.
14. Current OpenTelemetry JavaScript server traces and metrics are stable, while JavaScript logs remain Development and browser instrumentation remains experimental. The architecture must not pretend those maturities are uniform.
15. Provider-native infrastructure logs do not replace application-level structured telemetry.

## 4. Decision Boundaries

```text
Observability != Audit Log
Observability != Product Analytics
Metric != Canonical Business Truth
Trace != Transaction Record
Log != Authorization Evidence
Provider Dashboard != Operational Runbook
Error Monitoring != Application Error Response
Session Replay != Required Diagnostics
OpenTelemetry != Observability Backend
Hosting Logs != Complete Application Observability
Correlation ID != Tenant Authority
Telemetry Export Failure != Business Operation Failure
```

## 5. Telemetry Architecture and Evidence Model

GymPulse should standardize semantics before provider SDK details.

Conceptual model:

```text
application/browser/worker
  -> structured diagnostic events
  -> correlation context
  -> traces/metrics where useful
  -> privacy filter / sampling / batching
  -> managed observability backend
  -> dashboards / search / alerts / incident diagnosis
```

The managed backend is diagnostic infrastructure only.

Canonical state remains in the application/database/provider reconciliation boundaries.

### Core signals

1. structured logs;
2. exceptions/error events;
3. distributed traces;
4. operational metrics;
5. browser performance/error telemetry where justified;
6. release/deployment identity;
7. alert state.

Profiles/session replay/synthetics can be added later where evidence justifies them.

## 6. Options Considered

### Option A — Grafana Cloud

Current official documentation provides:

- managed OTLP ingestion for metrics, logs, and traces;
- OpenTelemetry-native Application Observability;
- Loki/Mimir/Tempo-backed correlated telemetry;
- service inventory/maps and RED-style application health;
- Grafana Alerting and SLO tooling;
- Frontend Observability through Grafana Faro for browser errors, logs, performance, and client traces;
- configurable frontend privacy/settings controls;
- usage-based metrics/logs/traces pricing and cost-management tooling;
- multiple cloud regions including currently operating India stacks;
- provider-neutral OpenTelemetry instrumentation paths and optional collector/Alloy pipeline.

Tradeoffs:

- Application Observability and raw telemetry have multiple billing dimensions;
- cardinality, trace volume, and log volume require deliberate governance;
- its error workflow is broad observability rather than purely error-tracker-first;
- Faro is provider-specific browser instrumentation;
- collector/Alloy deployment adds operational surface if introduced prematurely.

### Option B — Sentry

Current official material provides:

- strong application error grouping and developer-centric issue workflows;
- first-class Next.js/browser/server/edge instrumentation;
- tracing and performance visibility;
- centralized logs alongside errors/traces;
- session replay with privacy masking controls;
- OpenTelemetry trace ingestion/integration paths;
- release health and alerting.

Tradeoffs:

- the platform is more error/application-debugging centered than a broad metrics/logs/infrastructure telemetry system;
- direct OpenTelemetry ingestion has capability differences compared with native SDK integration;
- current hosted data-storage regions are US and Germany, which may constrain a future jurisdiction/residency outcome;
- deep Sentry SDK use increases provider-specific instrumentation unless deliberately wrapped.

### Option C — Datadog

Current official documentation provides:

- broad logs, APM/traces, metrics, RUM, error tracking, synthetics, and alerting;
- OpenTelemetry Collector/OTLP support for metrics/logs/traces;
- cross-signal correlation between RUM, traces, logs, metrics, and profiling;
- sensitive-data scanning/redaction capabilities;
- multiple hosted sites including US, Germany/EU, Japan, Australia, UK, and government environments.

Tradeoffs:

- broad platform surface and pricing dimensions can be heavy for a Phase 1 team;
- provider-native tagging/agents and product-specific capabilities can create coupling if adopted pervasively;
- no India site is listed in the current standard Datadog site matrix;
- privacy scanners can be a defense layer but should not replace source-side minimization.

### Option D — Better Stack

Current official documentation provides:

- OTLP metrics/logs/traces ingestion;
- correlated telemetry and distributed tracing;
- error grouping/tracking including Sentry-SDK-compatible ingestion;
- frontend errors, Web Vitals, session replay, and browser telemetry;
- integrated incident/on-call capabilities;
- relatively simple usage-based telemetry model.

Tradeoffs:

- current common data-region choices are US, Germany, and Singapore rather than India;
- frontend defaults can capture broad telemetry and therefore need explicit privacy hardening;
- ecosystem/integration depth is smaller than Grafana Cloud or Datadog;
- error/Sentry compatibility can be useful but should not define GymPulse internal contracts.

### Option E — Hosting-Native Logs/Metrics Only

Examples include provider dashboards/log streams and platform-native metrics.

Advantages:

- low setup;
- useful infrastructure/process diagnostics;
- may be included with the hosting platform.

Limitations:

- weaker cross-runtime correlation;
- weaker provider portability;
- browser/error grouping may be absent;
- payment/job diagnostics still need application semantics;
- hosting choice would become an accidental observability architecture.

Hosting-native telemetry remains complementary, not the sole Phase 1 evidence model.

## 7. Evaluation

| Criterion | Grafana Cloud | Sentry | Datadog | Better Stack | Hosting-native only |
|---|---|---|---|---|---|
| Structured logs | Strong | Strong/current app-log support | Strong | Strong | Varies |
| Error grouping | Strong enough | Very strong | Strong | Strong | Usually limited |
| Metrics | Strong | More application/error centered | Very strong | Strong | Varies |
| Distributed traces | Strong | Strong | Very strong | Strong | Varies |
| OTLP metrics/logs/traces backend | Strong | Partial/different by signal/integration | Strong | Strong | Usually provider-specific |
| Browser errors/performance | Faro Frontend Observability | Very strong SDK fit | Strong RUM | Strong | Usually limited |
| Worker/job diagnostics | Strong with app semantics | Strong error/tracing | Strong | Strong | Host-dependent |
| Alerting | Strong | Strong issue/metric alerting | Very strong | Strong | Varies |
| OpenTelemetry portability | Very strong server fit | Good if carefully integrated | Strong | Strong | Weak/varies |
| India-hosted cloud option visible today | Yes, current Grafana stacks | No, hosted storage currently US/DE | No, standard sites list Japan/Australia in APAC | No, common regions include Singapore | Depends on host |
| Privacy controls | Strong but source minimization still required | Strong masking/scrubbing controls | Strong scanners/RUM controls | Configurable; defaults need review | Varies |
| Phase 1 operational complexity | Medium | Low-Medium | Medium-High | Low-Medium | Low |
| Broad future observability coverage | Very strong | Strong application focus | Very strong | Strong | Limited |
| Portability/reversibility | Strong with OTLP/internal contracts | Medium-Strong with wrappers | Medium-Strong with OTel | Strong with OTLP | Low if host-coupled |
| Cost control visibility | Strong but multi-dimensional | Usage-plan dependent | Powerful but multi-product | Relatively simple | Host-dependent |

The table is GymPulse-specific and does not claim a universal product ranking.

## 8. Proposed Decision

Propose **Grafana Cloud** as the leading Phase 1 managed observability provider, conditional on later validation of `D-SEC-001`, exact stack region, retention, privacy controls, cost, and accepted hosting/runtime compatibility.

Proposed architecture:

```text
GymPulse-owned telemetry semantics
+
structured privacy-safe application/job logs
+
request/job/correlation propagation
+
OpenTelemetry server traces + metrics where mature/useful
+
managed Grafana Cloud OTLP ingestion
+
Application Observability / Loki / Tempo / Mimir views as needed
+
focused Grafana Alerting
+
optional privacy-reviewed Faro browser instrumentation
```

Important qualification:

```text
Grafana Cloud = leading provider proposal
D-PROVIDER-006 = still OPEN
```

No provider is accepted or provisioned by this ADR.

## 9. Structured Logging Contract

GymPulse should define an application-owned structured logging/context surface independent from the backend vendor.

Representative fields:

```text
timestamp
severity
event_name / event_code
service.name
service.version
deployment.environment
correlation_id
trace_id / span_id when present
request_id when present
job_id when present
operation category
safe tenant/gym/branch reference when necessary
safe resource reference when necessary
provider category
retry/attempt classification
error category
duration where useful
```

Avoid arbitrary free-form logging of application objects.

Event names/codes should be stable enough for dashboards/alerts without becoming public API contracts.

## 10. Forbidden Telemetry Content

Do not intentionally emit:

```text
passwords
OTPs
session cookies
authorization headers
bearer/refresh tokens
private keys
provider secrets
database credentials
raw card/UPI credentials
full payment-provider payloads
full webhook signed body
member phone/email unless specifically approved and minimized
staff/member free-text notes
raw notification message body
full request/response body by default
unredacted query strings containing sensitive values
browser local/session storage dumps
```

Source-side prevention is the primary control.

Provider-side scrubbing/scanning is defense in depth, not permission to emit sensitive content.

## 11. Correlation and Distributed Tracing

Correlation semantics are provider-independent.

Required propagation where practical:

```text
external request
-> request/correlation context
-> application command/query
-> database/provider span
-> durable continuation/job metadata
-> worker reload
-> provider call
-> reconciliation/effect
```

Use W3C Trace Context/OpenTelemetry-compatible propagation on server boundaries where compatible.

A correlation ID may be preserved even when trace sampling drops spans.

Correlation identifiers are diagnostic references only. They never authorize a tenant/resource.

## 12. OpenTelemetry Posture

For the proposed TypeScript/Node direction:

- OpenTelemetry JavaScript traces: suitable leading server instrumentation direction.
- OpenTelemetry JavaScript metrics: suitable leading server instrumentation direction.
- OpenTelemetry JavaScript logs: currently Development; do not require the OTel JS logs SDK as the only structured logging path.
- OpenTelemetry browser instrumentation: currently experimental; do not force it merely for uniformity.

Phase 1 may therefore use:

```text
server traces/metrics -> OpenTelemetry
structured logs -> application logger + backend-compatible ingestion/correlation
browser telemetry -> privacy-reviewed provider SDK only if justified
```

This preserves portability without overstating current OTel JavaScript maturity.

## 13. Collector / Telemetry Pipeline

Do not require a dedicated Collector/Alloy process on day one if direct secure OTLP export from the accepted runtime is sufficient.

Introduce a Collector/Alloy layer when one or more are justified:

- central redaction/transformation;
- tail sampling;
- multi-destination routing;
- environment/provider metadata enrichment;
- batching/backpressure control;
- private-network egress;
- several services need one standardized exporter path;
- provider migration/dual shipping.

A collector is telemetry infrastructure, not a business application dependency.

## 14. Error Monitoring

Centralized error monitoring should capture:

- unhandled API/runtime exceptions;
- background worker failures;
- webhook-processing failures;
- provider adapter failures;
- browser crashes/errors when browser monitoring is enabled;
- release/version/environment identity;
- correlation context sufficient to pivot to related logs/traces.

Error events must use safe exception metadata.

Do not automatically attach full request objects, authorization/session data, provider payloads, database rows, or arbitrary locals.

Application clients continue to receive safe ADR-0011 error contracts regardless of what internal diagnostics capture.

## 15. Payment and Webhook Diagnostics

`NFR-OBSERVABILITY-004` requires diagnosability without exposing sensitive payment material.

Capture safe facts such as:

```text
payment internal ID/reference
provider category
safe provider event reference where approved
verification outcome category
duplicate/replay classification
canonical payment state
business-effect application status
reconciliation attempt/result
correlation ID
attempt/latency category
```

Do not log:

- raw signed webhook body;
- verification secret;
- complete provider credential/token;
- raw payment credential;
- unnecessarily identifying payer data.

`Client Success != Canonical Payment Success` remains unchanged.

Observability cannot set payment state.

## 16. Worker / Job Diagnostics

Each durable job execution should make it possible to diagnose:

```text
job type
job ID
scheduled/created time
attempt
claim/start/finish
success/failure category
retryable/permanent classification
tenant context where safe
correlation/causation context
current release/service version
duration
terminal/dead-letter state
```

Provider dashboards must not become the authoritative job state store.

Canonical job/business state remains in the accepted durable continuation architecture.

## 17. Operational Metrics and Business Health

Operational metrics should include low-cardinality signals for:

- request rate/error/latency;
- worker success/failure/retry;
- job backlog/age where available;
- webhook verification failures;
- duplicate provider event rate;
- payment pending/reconciliation exception count;
- notification provider failures;
- no-show/renewal job failures;
- data-quality issue counts;
- resource/runtime saturation where the host exposes it.

Metrics are diagnostic aggregates, not canonical business records.

Do not encode `member_id`, `payment_id`, `request_id`, phone, email, or other high-cardinality identifiers as metric labels.

## 18. Browser / Frontend Observability

Phase 1 browser monitoring should be deliberately narrower than backend observability.

Useful evidence:

- unhandled browser errors;
- failed API/navigation categories;
- Web Vitals/performance;
- release/version/environment;
- correlation with backend requests where safe.

Do not enable by default:

- unrestricted session replay;
- broad user interaction capture;
- full DOM/form content capture;
- browser fingerprinting;
- automatic product-analytics-style event capture.

If Grafana Faro Frontend Observability is later enabled, configure collection and privacy controls explicitly and validate Member/staff flows.

Browser telemetry must never contain:

- session cookies/tokens;
- OTPs;
- payment secrets;
- sensitive form input;
- internal staff notes;
- unrestricted Member personal data.

Session replay remains an optional future capability requiring explicit privacy/security review.

## 19. Alerting and Operational Ownership

Alerts should be actionable and tied to user/business impact where possible.

Initial categories to validate:

- API error-rate/latency degradation;
- recurring worker failures;
- durable job backlog/stuck age;
- payment webhook verification failures;
- payment-effect/reconciliation failures;
- notification dispatch failure spikes;
- data-quality failure spikes;
- observability pipeline/export failure itself.

Avoid alerting on every individual exception.

Exact thresholds/SLOs/escalation/on-call schedules remain separately configured and evidence-based.

Every production alert needs:

- owner;
- severity/impact definition;
- dashboard/query link;
- diagnosis/runbook path;
- suppression/dedup behavior;
- recovery condition.

## 20. Environment and Release Identity

Telemetry must distinguish at least:

```text
development/local
test/staging
production
```

Production data and credentials must not be casually reused outside production.

Every server/worker error and trace should expose the deployed source/release identity where practical so ADR-0017 release events can be correlated with regressions.

Environment names and service identities should follow stable internal conventions, not a provider-specific taxonomy embedded throughout domain code.

## 21. Data Residency, Retention, and Access

`D-SEC-001` remains unresolved.

Current research shows Grafana Cloud operates India stacks as well as multiple other regions. This is favorable optionality but is not legal/compliance approval.

Before acceptance/provisioning:

- confirm allowed production telemetry region;
- confirm what signals are stored in-region;
- confirm support/admin/subprocessor implications;
- confirm backup/replication behavior relevant to policy;
- define retention per signal;
- define export/deletion requirements;
- configure least-privilege team access;
- confirm browser telemetry residency separately if the product path differs.

No country or region is selected by this ADR.

## 22. Cost, Sampling, and Cardinality

Observability volume is controlled deliberately.

Rules:

- keep metric labels low cardinality;
- sample ordinary high-volume traces where necessary;
- preserve sufficient diagnostic evidence for critical errors/payment/job paths;
- avoid debug logs in production by default;
- avoid recording large payloads;
- set retention by operational need rather than "keep everything";
- track telemetry volume/cost;
- use collector/backend filtering only after source-side signal quality is understood.

Grafana Cloud currently bills different telemetry/application products by different dimensions. Phase 1 acceptance requires a representative cost model, not only free-tier fit.

## 23. Reliability and Failure Behavior

Telemetry code must be best-effort and bounded.

Required behavior:

- exporter timeout/buffer is bounded;
- telemetry failure does not fail a successful canonical business operation;
- exporter retry does not create runaway memory/disk/network pressure;
- app continues when provider is unavailable;
- critical local error handling still happens even when remote reporting fails;
- telemetry outage itself becomes visible through health/fallback diagnostics where practical.

Never wrap core business correctness around:

```text
await observabilityProvider.success()
```

as a required transaction condition.

## 24. Security and Privacy Impact

Positive effects:

- better incident diagnosis;
- faster discovery of payment/job/provider failures;
- correlation without opening production DB rows casually;
- release-to-regression traceability;
- centralized error review;
- ability to monitor telemetry leakage and access.

Material risks:

- telemetry can become a shadow PII store;
- stack traces/locals/request metadata can leak secrets;
- browser telemetry can over-collect user behavior;
- high-cardinality tenant/resource identifiers can increase privacy and cost risk;
- provider admin/support access becomes part of the threat model;
- overly broad retention extends exposure.

Primary mitigation is data minimization at source.

## 25. Reliability, Maintainability, and Developer Experience

Application/domain code should depend on a small GymPulse telemetry abstraction or common conventions, not on Grafana SDK APIs.

Where direct OpenTelemetry APIs are used, keep semantic attribute naming centralized.

Useful shared support may include:

- context propagation;
- structured logger construction;
- error reporting adapter;
- metric naming/registration;
- safe attribute sanitizer;
- release/environment metadata.

Do not create a giant cross-domain logging utility that understands business internals from every module.

## 26. Migration and Adoption Plan

After explicit acceptance and implementation authorization:

1. approve telemetry region/residency;
2. create a non-production provider stack/project;
3. create least-privilege ingestion credentials;
4. define service/environment/resource naming;
5. implement source-side telemetry redaction policy;
6. add structured server/worker logging;
7. add request/job correlation propagation;
8. add server traces using OpenTelemetry where compatible;
9. add minimal operational metrics;
10. export to the managed backend;
11. build focused payment/job/error dashboards;
12. configure actionable alerts;
13. validate release identity;
14. measure telemetry overhead and cost;
15. validate provider outage behavior;
16. consider browser/Faro instrumentation only after privacy review;
17. enable production only after validation and explicit governance approval.

No step is executed by this ADR.

## 27. Validation Before Acceptance

Require evidence for at least:

1. one request correlated through application logs;
2. one request correlated into a background job;
3. one payment webhook correlated to canonical processing/effect;
4. one retrying worker diagnosis;
5. centralized server exception capture;
6. centralized worker exception capture;
7. webhook verification-failure diagnosis without raw signed payload;
8. safe tenant context without Member PII;
9. no cookie/authorization header/OTP/secret in telemetry;
10. release/version visible in errors/traces;
11. server trace export through OpenTelemetry;
12. metrics visible with bounded cardinality;
13. payment/job dashboard usefulness;
14. actionable alert delivery;
15. observability provider outage does not fail canonical operations;
16. exporter buffering/retry remains bounded;
17. sampling preserves useful critical-path diagnosis;
18. retention configuration verified;
19. least-privilege access/RBAC verified;
20. allowed region/residency validated under `D-SEC-001`;
21. representative telemetry cost measured;
22. browser error capture validated if enabled;
23. browser privacy policy validated if enabled;
24. no session replay enabled without explicit review;
25. provider migration/export path understood;
26. explicit decision-owner approval recorded.

## 28. Reversibility

Reversibility is preserved by:

- stable internal structured-log fields;
- W3C/OpenTelemetry trace context on server boundaries;
- application-owned correlation IDs;
- OpenTelemetry traces/metrics where mature;
- backend-independent event names;
- provider SDKs confined to adapters/runtime bootstrap;
- no provider query language in domain/business logic;
- dashboards/alerts treated as operational config rather than business state.

A future migration may require re-creating dashboards/alerts and changing browser instrumentation, but should not require rewriting domain rules or changing canonical data.

## 29. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| PII/secrets leak into telemetry | source minimization, explicit allowlisted context, tests, provider-side defense-in-depth |
| High-cardinality cost explosion | metric-label policy, trace/log sampling, cost dashboards |
| Provider outage affects requests/jobs | bounded async exporters; never make telemetry transaction-critical |
| Grafana-specific coupling | OpenTelemetry server signals + internal logger/context conventions |
| Browser over-collection | browser telemetry optional/minimal; replay off by default; privacy review |
| OTel JS logs/browser immaturity | do not force them; use structured logs/provider browser SDK where justified |
| Alert fatigue | actionable symptom/business-failure alerts, ownership and runbooks |
| Residency mismatch | keep `D-SEC-001` gate; validate exact stack/product data location |
| Diagnostics become source of truth | canonical DB/audit/provider reconciliation remain authoritative |
| Raw provider payload leakage | safe event references/categories only; no full payloads |
| Collector adds operational burden too early | direct OTLP first where sufficient; introduce collector on evidence |
| Telemetry cost hides in multiple SKUs | representative volume model and cost monitoring before acceptance |

## 30. Revisit Triggers

Revisit the provider direction if:

- `D-SEC-001` requires a region/country Grafana Cloud cannot satisfy;
- accepted hosting provides equivalent integrated capability at materially lower cost;
- error-tracking workflow quality becomes more important than broad telemetry and Sentry fits materially better;
- infrastructure/security scale justifies Datadog's broader platform;
- telemetry cost becomes disproportionate;
- a future native client materially changes mobile crash/RUM requirements;
- compliance requires self-hosted/BYOC observability;
- OpenTelemetry maturity changes enough to simplify the architecture;
- product analytics requirements are incorrectly leaking into operational telemetry.

## 31. Open Questions

1. What jurisdiction/data-residency constraints will `D-SEC-001` establish?
2. Which exact Grafana Cloud region would be approved if the proposal is accepted?
3. What retention period is needed for logs, traces, metrics, and errors?
4. What Phase 1 telemetry monthly budget is acceptable?
5. Which metrics/alerts are required before pilot release?
6. Is Grafana Application Observability needed initially, or are raw logs/traces/metrics + dashboards sufficient?
7. Is a Collector/Alloy process justified at launch or only later?
8. Is browser Frontend Observability required before pilot, or can server/API diagnostics cover Phase 1?
9. Which tenant/gym/branch identifiers are permitted in telemetry?
10. Who owns alert triage and incident escalation?
11. Are source-map uploads required, and what CI credential model will ADR-0017 permit?

## 32. Decision Evidence

Research date: `2026-09-27`.

Repository evidence:

- `docs/01-product/non-functional-requirements.md` defines `NFR-OBSERVABILITY-001..007`.
- `docs/02-architecture/technology-stack.md` requires structured correlation, centralized errors, payment/job diagnostics, performance telemetry, alerts, and OpenTelemetry-compatible traces/metrics where practical.
- ADR-0014/0015 require correlated API/worker diagnostics.
- ADR-0017 requires release identity to be correlatable with runtime failures.
- ADR-0018 requires observability assertions to avoid secret leakage and brittle log snapshots.
- `D-PROVIDER-006` remains canonically `OPEN`.

Current official research:

### OpenTelemetry

- https://opentelemetry.io/docs/languages/js/
- https://opentelemetry.io/docs/languages/js/getting-started/browser/

Current JavaScript status reviewed: traces Stable, metrics Stable, logs Development; browser instrumentation experimental.

### Grafana Cloud

- https://grafana.com/docs/grafana-cloud/observe-and-act/monitor-applications/application-observability/
- https://grafana.com/docs/grafana-cloud/observe-and-act/monitor-applications/application-observability-kg/
- https://grafana.com/docs/grafana-cloud/send-data/otlp/otlp-format-considerations/
- https://grafana.com/docs/grafana-cloud/observe-and-act/monitor-applications/frontend-observability/
- https://grafana.com/docs/grafana-cloud/observe-and-act/monitor-applications/frontend-observability/settings-and-policies/
- https://grafana.com/docs/grafana-cloud/observe-and-act/alert-and-measure-reliability/
- https://grafana.com/docs/grafana-cloud/platform/pricing-and-usage/
- https://grafana.com/docs/grafana-cloud/platform/pricing-and-usage/application-observability/
- https://status.grafana.com/

Current research confirms OTLP ingestion for metrics/logs/traces, OpenTelemetry-native application observability, frontend observability, alerting, usage-based telemetry pricing, and currently operating India stacks.

### Sentry

- https://sentry.io/product/error-monitoring/
- https://sentry.io/product/tracing/
- https://sentry.io/for/nextjs/
- https://sentry.io/product/session-replay/
- https://docs.sentry.io/api/

Current research confirms strong Next.js/browser/server error/tracing workflows, logs, privacy-masked replay options, and hosted API/data storage regions currently identified as US and Germany.

### Datadog

- https://docs.datadoghq.com/opentelemetry/
- https://docs.datadoghq.com/opentelemetry/setup/otlp_ingest/
- https://docs.datadoghq.com/opentelemetry/correlate/
- https://docs.datadoghq.com/real_user_monitoring/application_monitoring/browser/
- https://docs.datadoghq.com/security/sensitive_data_scanner/
- https://docs.datadoghq.com/getting_started/site/

Current research confirms broad OTel metrics/logs/traces support, RUM/backend correlation, sensitive-data tooling, and multiple regional sites.

### Better Stack

- https://betterstack.com/docs/logs/open-telemetry/
- https://betterstack.com/docs/logs/tracing/
- https://betterstack.com/docs/errors/start/
- https://betterstack.com/docs/errors/js-tag/start/
- https://betterstack.com/docs/logs/api/create-a-source/
- https://betterstack.com/docs/logs/billing-for-metrics/

Current research confirms OTLP logs/metrics/traces, error tracking/browser capabilities, and common hosted data-region choices including US, Germany, and Singapore.

All product capabilities, regions, and prices are time-sensitive research evidence only. No provider SKU, plan, region, retention, SDK version, or price is accepted or pinned by this ADR.

## 33. Related Documents

- `../00-overview/assumptions.md`
- `../01-product/non-functional-requirements.md`
- `../02-architecture/architecture-principles.md`
- `../02-architecture/architecture-overview.md`
- `../02-architecture/container-architecture.md`
- `../02-architecture/component-architecture.md`
- `../02-architecture/data-flow.md`
- `../02-architecture/technology-stack.md`
- `README.md`
- `ADR-0006-managed-backend-responsibilities.md`
- `ADR-0011-api-contract-architecture.md`
- `ADR-0012-owner-staff-web-framework.md`
- `ADR-0013-member-client-strategy.md`
- `ADR-0014-api-deployment-boundary.md`
- `ADR-0015-background-jobs-scheduler.md`
- `ADR-0016-hosting-deployment-platform.md`
- `ADR-0017-ci-cd-release-secrets.md`
- `ADR-0018-testing-toolchain.md`
- `ADR-0019-package-manager.md`
- legacy migration source: `../12-security-audit.md`
- legacy migration source: `../15-engineering-workflow.md`
- legacy migration source: `../16-open-decisions.md`
