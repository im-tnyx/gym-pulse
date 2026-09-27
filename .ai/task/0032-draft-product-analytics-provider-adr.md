# Task 0032: Draft Product Analytics Provider ADR

## Goal

Draft one Proposed ADR for D-PROVIDER-005 that first decides whether GymPulse needs an external product-analytics provider for the initial Phase 1 pilot, while preserving canonical business truth, privacy minimization, provider neutrality, and explicit future adoption gates.

Target:

docs/adr/ADR-0024-product-analytics-provider.md

Continuity:

.ai/task/0032-draft-product-analytics-provider-adr.md

## Inputs Read

Fresh latest-main repository/governance inputs included:

- .ai/README.md
- .ai/current-state.md
- .ai/task/0031-draft-messaging-provider-adr.md
- docs/README.md
- docs/00-overview/assumptions.md
- docs/00-overview/goals.md
- docs/00-overview/project-overview.md
- docs/01-product/functional-requirements.md
- docs/01-product/non-functional-requirements.md
- docs/01-product/success-metrics.md
- docs/01-product/user-journeys.md
- docs/01-product/personas.md
- docs/02-architecture/architecture-principles.md
- docs/02-architecture/architecture-overview.md
- docs/02-architecture/system-context.md
- docs/02-architecture/container-architecture.md
- docs/02-architecture/component-architecture.md
- docs/02-architecture/data-flow.md
- docs/02-architecture/technology-stack.md
- docs/11-analytics-kpis.md
- docs/adr/README.md
- docs/adr/ADR-0011-api-contract-architecture.md
- docs/adr/ADR-0012-owner-staff-web-framework.md
- docs/adr/ADR-0013-member-client-strategy.md
- docs/adr/ADR-0017-ci-cd-release-secrets.md
- docs/adr/ADR-0018-testing-toolchain.md
- docs/adr/ADR-0020-observability-provider.md
- docs/adr/ADR-0022-payment-provider.md
- docs/adr/ADR-0023-messaging-provider.md

Canonical structured documentation controlled over legacy analytics material.

## Repository State Verified

At Task 0032 start:

- latest main was 3c601ba1d1f0b504fd1d1b6c8f450bf3bc80543e;
- Task 0031 / ADR-0023 were synchronized;
- docs/adr/ADR-0024-product-analytics-provider.md did not exist;
- .ai/task/0032-draft-product-analytics-provider-adr.md did not exist;
- ADR backlog order 24 remained D-PROVIDER-005 Product analytics provider OPEN;
- canonical D-PROVIDER-005 remained P2 OPEN;
- no ADR was Accepted;
- no PostHog, Mixpanel, or Amplitude implementation/account/project evidence was found;
- no POSTHOG_KEY, MIXPANEL_TOKEN, AMPLITUDE_API_KEY or equivalent analytics credential evidence was found;
- no analytics.track implementation evidence was found;
- no canonical approval evidence promoted product analytics to a required Phase 1 dependency.

Task 0032 was the actual next bounded governance task.

## Canonical Decision State

~~~text
D-PROVIDER-005
Priority: P2
Status: OPEN
Decision: Product analytics provider
Acceptance: none
~~~

ADR-0024 = Proposed.

Creating it does not promote D-PROVIDER-005 to DECIDED.

## Pilot Measurement Questions

Canonical data already answers most pilot outcomes:

- active members;
- valid check-ins;
- QR-source adoption;
- seven-day active members;
- no-show cases;
- contacted-member returns;
- renewal rate;
- verified collected amount;
- refunds/reversals;
- payment exceptions;
- add-on revenue;
- follow-up completion.

Potential behavioral questions that may later justify explicit product events:

- Member Home use;
- QR scan UI entry;
- renewal options viewed;
- abandonment before provider checkout;
- Owner dashboard use;
- add-on catalog/detail views.

Rule preserved:

~~~text
question
-> metric/funnel
-> minimal event
-> minimal approved properties
~~~

No track-everything posture.

## Canonical KPI Findings

Preserve:

~~~text
Analytics Event != Canonical Business Record
Client Event != Payment Truth
Client Event != Attendance Truth
Client Event != Membership Truth
Analytics Funnel != Financial Ledger
Analytics Conversion != Verified Business Outcome
~~~

Owner-facing operational KPIs continue to query canonical/read-model state.

## Behavioral Analytics Needs

Current evidence supports possible future behavioral measurement but does not establish any such funnel as necessary for initial pilot correctness or outcome evaluation.

Strongest plausible future questions:

~~~text
renewal.options_viewed
payment.checkout_ui_opened
owner.dashboard_viewed
addon.detail_viewed
attendance.scan_ui_opened
~~~

These remain candidate semantics only.

## External Provider Need Finding

Outcome:

~~~text
No external product-analytics provider for initial Phase 1 pilot.
~~~

Reason:

- core success metrics are canonical;
- behavioral questions are useful but not yet prioritized enough to justify new privacy/SDK/provider surface;
- manual pilot observation is acceptable for Staff Workflow Independence and early UX discovery;
- technology-stack guidance already recommends deferral until a concrete funnel question exists.

No provider is rejected forever.

D-PROVIDER-005 remains OPEN for future revisit.

## Candidate Event Review

Current success-metrics candidates were classified:

~~~text
member.home_viewed
  useful behavioral; optional

attendance.scan_started
  useful behavioral but rename precisely if used

attendance.checkin_succeeded
  redundant/ambiguous; canonical Attendance owns success

attendance.checkin_failed
  operational/UX ambiguity; observability first unless a UX question needs it

renewal.options_viewed
  useful behavioral

renewal.order_created
  redundant with canonical RenewalOrder

payment.checkout_started
  useful behavioral; prefer payment.checkout_ui_opened

addon.catalog_viewed
  useful behavioral

addon.detail_viewed
  useful behavioral if view-to-purchase is prioritized

owner.dashboard_viewed
  useful behavioral

followup.recorded
  redundant with canonical FollowUp record
~~~

Legacy outcome-style analytics events were not copied into the proposed behavioral baseline.

## Event Taxonomy Posture

If future instrumentation is approved:

~~~text
event name
event version
question answered
client/server source
allowed property allowlist
privacy classification
authority status = non-authoritative
~~~

Provider-neutral names and definitions remain GymPulse-owned.

## Client vs Server Event Posture

Client events:

~~~text
views
UI opens
scan UI entry
option/catalog/detail views
~~~

are behavioral and untrusted.

Server events may represent non-authoritative funnel boundaries only where canonical state querying does not already answer the question.

Do not duplicate canonical success solely to create a third-party event.

## Identity Posture

Default future analytics subject:

~~~text
opaque pseudonymous analytics subject
+
opaque tenant/gym analytics identity where needed
+
safe coarse actor type
~~~

Do not default to phone/email/provider subject/display name.

Do not collapse Provider Identity, Principal, Member, or provider analytics person identity.

Anonymous-to-authenticated merging is not a Phase 1 requirement.

Shared-device logout/account changes require provider identity reset proof before adoption.

## Tenant Isolation Posture

Analytics tenant/gym metadata is measurement context, not application authority.

Browser-supplied tenant IDs are not trusted.

Prefer trusted server-issued safe context where practical.

Cross-tenant internal analytics access remains privileged/internal.

Project-per-gym complexity is not introduced without evidence.

## Privacy / PII Findings

NFR-PRIVACY-004 remains first-class.

General analytics excludes by default:

~~~text
phone
email
OTP
tokens
session cookies
payment/provider secrets
raw payment payloads
private/free-text staff notes
health details
message bodies
unsafe URLs/query strings
~~~

SDK automatic device/IP/location/referrer capture must be independently reviewed if a provider is ever adopted.

## Autocapture Finding

Not approved.

Explicit event instrumentation is preferred over broad DOM/form/click autocapture.

Reason:

- unstable event semantics;
- PII leakage risk;
- noisy event volume;
- unexpected URL/form collection;
- provider lock-in.

## Session Replay Finding

Not approved.

Replay is a separate high-risk capability requiring explicit need, masking proof, sampling, retention/deletion, jurisdiction/privacy and security review.

Provider masking capability does not imply zero privacy risk.

## Providers Evaluated

Bounded future-capability check only:

- PostHog;
- Mixpanel;
- Amplitude.

No detailed production vendor selection was warranted because external analytics is not justified for the initial pilot.

All three are technically credible future managed product-analytics options.

## Official Research Date

2026-09-27.

Current first-party provider material was reviewed for:

- explicit event/product analytics;
- browser/server ingestion;
- identity/reset/group semantics;
- autocapture;
- replay;
- retention/deletion;
- region evidence;
- pricing;
- provider exit/export-related capability.

## Provider Evaluation

### PostHog

Current official material shows:

- product analytics funnels/retention/paths;
- explicit event capture plus autocapture;
- Next.js browser/server integration;
- person identity/deletion;
- session replay;
- US/EU cloud routing;
- usage-based pricing.

Future fit: credible.

Current decision: defer.

### Mixpanel

Current first-party material shows:

- product analytics/funnels/cohorts;
- browser/mobile and direct server/API ingestion;
- identify/reset/ID merge;
- autocapture and session replay;
- end-user data deletion/export controls;
- retention controls;
- data residency program for US/EU/India, including India;
- usage-based pricing.

Future fit: credible, especially if India residency becomes materially useful.

Current decision: defer.

Technical region availability is not legal/privacy approval.

### Amplitude

Current official material shows:

- browser/server SDKs;
- groups/account analytics capabilities;
- explicit events plus autocapture;
- user/device identity and reset;
- session replay;
- US/default and EU regions;
- TTL event retention controls;
- User Privacy deletion APIs;
- usage-based pricing.

Future fit: credible.

Current decision: defer.

### No-provider option

Best fit for current evidence:

- zero browser analytics SDK overhead;
- zero external event retention;
- zero external analytics event cost;
- lowest privacy surface;
- no new provider account/access burden;
- canonical pilot metrics remain measurable.

Tradeoff: limited behavioral funnel evidence until a question is prioritized.

## Environment Model

If a provider is later accepted:

~~~text
development
preview
staging/test
production
~~~

must be separated by project/source or an equivalently reliable environment isolation method.

Synthetic test users must not pollute production analytics.

Public/browser ingestion token != private management/export/admin credential.

No provider key/project is created now.

## Retention / Deletion Dependencies

Canonical:

~~~text
D-SEC-005 = OPEN
D-SEC-006 = OPEN
D-SEC-001 = OPEN
~~~

No retention duration is invented.

Future provider must support approved deletion/export/retention policy and safe analytics-subject mapping.

Provider region availability does not equal legal approval.

## Security Findings

Threats addressed:

- raw PII leakage;
- payment payload leakage;
- free-text leakage;
- unsafe URL/referrer capture;
- cross-tenant event property mixup;
- wrong identity merge;
- shared-device identity bleed;
- admin key exposure;
- replay capture;
- autocapture capture;
- test-data pollution;
- forged browser events;
- provider account compromise;
- overbroad analytics access;
- indefinite retention;
- provider export/deletion gaps;
- analytics outage blocking product;
- third-party SDK/supply-chain risk.

Controls are documented in ADR-0024.

## Reliability Findings

~~~text
Analytics Provider Failure
!=
GymPulse Business Failure
~~~

Analytics never blocks:

- check-in;
- renewal;
- payment;
- follow-up;
- member update;
- Owner/Staff operations.

No payment-grade exactly-once semantics.

No durable queue/Redis baseline solely for analytics.

## Performance Findings

No analytics SDK baseline means no additional initial Member bundle/runtime/network overhead.

Future browser provider must prove acceptable:

- bundle/startup cost;
- network/batching behavior;
- low-end Android performance;
- CSP/network destination impact;
- failure behavior.

## Operational Findings

No initial:

- analytics account admin;
- project access model;
- billing/event-volume monitoring;
- retention/deletion runbook;
- provider incident dependency.

Future adoption adds event-taxonomy, privacy, identity, environment, cost, access and provider-exit operations.

## Cost Findings

No-provider initial external analytics ingestion cost:

~~~text
0
~~~

Current public provider pricing evidence:

- PostHog: first 1M product-analytics events/month free, then usage-based pricing starting at published per-event rates.
- Mixpanel: Free up to 1M events/month; paid usage-based Growth.
- Amplitude: Free up to 2M events/month; paid usage-based plans.

Free tiers do not justify collecting data without a concrete question.

## Provider Exit Findings

Keep GymPulse-owned:

~~~text
event names
event versions
question/metric mapping
allowed properties
privacy classification
authority status
identity rules
tenant context rules
~~~

Provider replacement should mainly change adapter/SDK/transport/config.

Raw event export/deletion/migration must be validated before acceptance.

## Evaluation Summary

~~~text
Initial Phase 1 external product analytics need
  -> not proven

Canonical KPI coverage
  -> strong

Behavioral funnel need
  -> plausible but not yet prioritized

No-provider option
  -> strongest current fit

PostHog
  -> credible future option, not selected

Mixpanel
  -> credible future option, not selected

Amplitude
  -> credible future option, not selected
~~~

## Proposed Direction

Outcome A:

~~~text
Defer external product analytics for initial Phase 1 pilot.
~~~

Preserve only a small documented provider-neutral event vocabulary for future concrete questions.

No provider recommendation.

## Decision Confidence

~~~text
Canonical KPI independence            High
No-provider initial-pilot fit          High
Behavioral-provider need               Not yet proven
PostHog acceptance                     None
Mixpanel acceptance                    None
Amplitude acceptance                   None
~~~

## Decision Gates

Before external provider acceptance require:

1. each event maps to a concrete pilot/product question;
2. canonical metrics remain independent;
3. payment/attendance/membership truth remains canonical;
4. property payloads contain no disallowed PII/secrets/free text;
5. tenant context is safe;
6. browser-forged events cannot affect business logic;
7. analytics identity/reset/shared-device behavior proven;
8. environment/test-data isolation proven;
9. analytics outage is non-blocking;
10. low-end Member performance validated;
11. URL/referrer/storage behavior reviewed;
12. autocapture separately approved if ever desired;
13. replay separately approved if ever desired;
14. provider account/access reviewed;
15. retention policy understood;
16. deletion/export capability understood;
17. provider data location/privacy reviewed;
18. raw-event export/provider exit validated;
19. event volume/cost reviewed;
20. one real pilot funnel proves decision value;
21. explicit decision-owner approval.

## Decisions Kept Separate

~~~text
D-PROVIDER-005 product analytics provider     P2 OPEN
D-PROVIDER-006 observability provider         P1 OPEN

D-ARCH-012 Owner/Staff web framework           PROPOSED
D-ARCH-013 Member client                       PROPOSED
D-ARCH-018 testing                             PROPOSED
D-ARCH-019 CI/CD / secrets                     OPEN

D-SEC-001 jurisdiction/privacy                 OPEN
D-SEC-005 deletion/export                      OPEN
D-SEC-006 retention                            OPEN

D-DATA-001 identifier direction                PROPOSED
D-DATA-002 time/timezone                       PROPOSED
~~~

Feature flags, experiments, replay, heatmaps, CDP/warehouse, marketing attribution, and observability remain separate capabilities.

## Requirement IDs Referenced

~~~text
NFR-PRIVACY-001..006
NFR-RELIABILITY-005
NFR-OBSERVABILITY-006
NFR-SECURITY-004
NFR-SECURITY-005
NFR-SECURITY-011
NFR-MAINTAINABILITY-003
NFR-TESTABILITY-002..005
NFR-OPERATIONS-001..003
~~~

No requirement ID was invented.

## Validation Required

All future acceptance checks in ADR-0024 remain future work.

No provider-resource, SDK, event, replay, dashboard, or ingestion validation was executed.

## Files Changed

Created:

- docs/adr/ADR-0024-product-analytics-provider.md
- .ai/task/0032-draft-product-analytics-provider-adr.md

Governance continuity updates:

- docs/adr/README.md
- docs/README.md
- .ai/current-state.md

No canonical success metric or privacy requirement was modified.

## Open Questions

Primary unresolved:

- which behavioral question, if any, needs provider instrumentation in the initial pilot;
- renewal abandonment measurement;
- QR scan-entry abandonment;
- Owner dashboard usage;
- add-on view-to-purchase priority;
- analytics subject identity mapping;
- tenant/group analysis;
- browser storage/consent posture;
- provider region/privacy acceptance;
- retention;
- deletion/export scope;
- internal analytics access;
- provider choice if/when need becomes real.

## Result

Expected synchronized end state:

~~~text
ADR-0024 = Proposed
D-PROVIDER-005 = P2 OPEN

Initial Phase 1 external analytics provider = none

PostHog = future candidate only
Mixpanel = future candidate only
Amplitude = future candidate only

Autocapture = not approved
Session replay = not approved
Feature flags/experiments = not adopted by this ADR
~~~

Implementation status:

~~~text
No analytics account created
No analytics project created
No API/project/management key created
No browser SDK installed
No server SDK installed
No event helper implemented
No ProductAnalytics port implemented
No event instrumented
No dashboard created
No funnel/cohort/report created
No heatmap created
No session replay enabled
No autocapture enabled
No feature flag created
No experiment created
No analytics DB/warehouse/CDP/event pipeline created
No production/test analytics sent
No CI/environment secret created
No deployment created
No prior ADR accepted
~~~

## Next Recommended Task

Fresh-read the synchronized queue after governance updates.

Pre-synchronization queue shows:

~~~text
Order 25
D-ARCH-008
Redis / Cache Requirement
OPEN
~~~

Likely next bounded task:

~~~text
Task 0033: Draft Redis / Cache Requirement ADR
likely ADR-0025
~~~

Do not assume blindly; verify latest main after Task 0032 synchronization.

Do not execute Task 0033 as part of Task 0032.
