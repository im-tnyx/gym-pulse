# ADR-0024: Product Analytics Provider and Instrumentation Strategy

## Status

Proposed

## Decision Metadata

- ADR: ADR-0024
- Primary Decision ID: D-PROVIDER-005
- Related Decision IDs: D-PROVIDER-006, D-ARCH-012, D-ARCH-013, D-ARCH-018, D-ARCH-019, D-SEC-001, D-SEC-005, D-SEC-006, D-DATA-001, D-DATA-002
- Decision Owner: Open
- Technical Owner: Architecture / Product / Data / Security
- Date Proposed: 2026-09-27
- Date Accepted: Not accepted
- Supersedes: None
- Superseded By: None

## 1. Context

GymPulse Phase 1 is an operations/retention pilot whose primary success questions are already grounded in canonical Attendance, Membership, NoShowCase/follow-up, RenewalOrder, Payment, and add-on records.

The first decision is therefore not:

~~~text
PostHog vs Mixpanel vs Amplitude
~~~

It is:

> Which Phase 1 pilot questions cannot be answered safely and credibly from canonical GymPulse business records and therefore justify separate behavioral product analytics?

Current canonical technology evaluation explicitly says:

~~~text
No provider required for architecture completion.
~~~

and recommends deferring provider selection until concrete pilot behavior/funnel questions justify it.

The repository already distinguishes:

~~~text
Analytics Event != Canonical Business Record
Client Event != Payment Truth
Client Event != Attendance Truth
Client Event != Membership Truth
Analytics Funnel != Financial Ledger
Analytics Conversion != Verified Business Outcome
~~~

Most Phase 1 pilot outcome metrics can be derived from trusted canonical records.

Behavioral product analytics may later be useful for questions such as:

- whether Members reach/open QR scan UI;
- whether Members view renewal options;
- where a user abandons before provider checkout;
- whether Owners open the daily operational dashboard;
- whether Members inspect add-on details before purchase.

Those questions are useful, but current governance does not establish them as release-blocking enough to justify a production analytics provider before the pilot starts.

Therefore this ADR defines a privacy-minimized, provider-neutral future instrumentation posture while proposing no external product-analytics provider for the initial Phase 1 pilot.

Canonical D-PROVIDER-005 remains P2 OPEN.

## 2. Pilot Measurement Questions

### 2.1 Questions already answered by canonical business records

The following pilot questions do not require a third-party product-analytics provider:

| Pilot question | Canonical evidence |
|---|---|
| How many active Members exist? | Membership/member canonical state |
| How many valid check-ins occurred? | Attendance records |
| What is QR adoption among valid check-ins? | Attendance source |
| How many Members were active in seven days? | Attendance + eligibility |
| How many no-show cases remain open? | NoShowCase canonical state |
| How many contacted Members returned? | Follow-up + return attendance |
| What is the renewal rate? | Membership/RenewalOrder/verified Payment |
| What amount was actually collected? | canonical Paid payment records |
| What amount was refunded/reversed? | financial event/history |
| What payment exceptions remain? | canonical Payment state |
| What add-on revenue was collected? | verified add-on payments |
| How many follow-up actions were completed? | canonical follow-up records |
| Are staff completing the pilot workflow without developer help? | canonical workflow evidence plus manual pilot observation |

### 2.2 Behavioral questions that may require explicit events

Potential questions that canonical outcome records do not answer directly:

~~~text
Do Members open the Member Home?
Do Members reach/open the QR scan UI?
Do Members view renewal options?
Where do they abandon before payment checkout?
Does the Owner open the daily dashboard?
Do Members view add-on catalog/detail before purchase?
~~~

These questions are candidates for later instrumentation.

They are not currently all required.

### 2.3 Event-need rule

Every analytics event must map:

~~~text
Pilot/Product Question
-> Metric / Funnel
-> Minimal Required Event(s)
-> Minimal Approved Properties
~~~

Reject:

~~~text
track everything now, decide later
~~~

If an event has no concrete decision/use case, do not collect it.

## 3. Canonical Metrics vs Product Analytics

### 3.1 Canonical operational metrics

Canonical operational metrics come from trusted GymPulse state:

~~~text
Active Members
Today Check-ins
7-Day Active Members
Open No-show Cases
Returned Members
Renewals Due
Renewal Amount Collected
Refund Amount
Payment Failure / Exception state
Add-on Revenue
Follow-up Completion
QR Adoption from canonical attendance source
~~~

These metrics remain valid even if every analytics request is blocked.

### 3.2 Product usage analytics

Product usage analytics is non-authoritative behavioral evidence:

~~~text
screen / page viewed
flow UI started
option viewed
CTA/action invoked
checkout UI opened
dashboard opened
catalog/detail viewed
~~~

It may explain UX behavior.

It never becomes membership, attendance, payment, audit, entitlement, or authorization truth.

### 3.3 Observability boundary

Preserve ADR-0020:

~~~text
Observability != Product Analytics
~~~

Observability asks:

~~~text
Why did this request fail?
Why is latency high?
Why did a job retry?
Why did a webhook fail?
~~~

Product analytics asks:

~~~text
Did users open this surface?
Where do they abandon this flow?
Which product option do they inspect?
~~~

Do not duplicate logs/traces into product analytics by default.

### 3.4 Audit boundary

Preserve:

~~~text
Product Analytics != Audit Log
~~~

Analytics events cannot prove who:

- changed a permission;
- corrected attendance;
- issued a refund;
- altered membership;
- changed a sensitive setting.

Canonical audit remains authoritative.

## 4. Requirements and Decision Drivers

### Requirements

- NFR-PRIVACY-001 — collect only information required for approved capabilities.
- NFR-PRIVACY-002 — preserve purpose separation.
- NFR-PRIVACY-003 — protected exports remain scoped/auditable.
- NFR-PRIVACY-004 — general analytics avoids raw phone, email, free-text notes, payment secrets, and health-related details unless explicitly justified/protected.
- NFR-PRIVACY-005 — retention policy is open.
- NFR-PRIVACY-006 — architecture should support future access/correction/deletion without corrupting required records.
- NFR-RELIABILITY-005 — canonical attendance, payment, membership, and follow-up truth comes from server-side system-of-record data, not client analytics events.
- NFR-OBSERVABILITY-006 — operational business-health signals remain an observability/operations concern.
- NFR-SECURITY-004 — server secrets stay out of client code/bundles.
- NFR-SECURITY-005 — protected/provider traffic uses secure transport.
- NFR-SECURITY-011 — logs/errors avoid secrets, cross-tenant identifiers, and unnecessary PII.
- NFR-MAINTAINABILITY-003 — provider boundaries remain internal/provider-neutral where applicable.
- NFR-TESTABILITY-002..005 — provider/failure/time/tenant behavior remains testable.
- NFR-OPERATIONS-001..003 — environment/secret/migration discipline.
- D-DATA-001 — opaque string identifiers remain the proposed direction.
- D-DATA-002 — UTC event timestamps plus explicit gym timezone remain the proposed direction.

### Decision drivers

1. answer actual pilot questions rather than maximize event volume;
2. canonical outcomes remain outside analytics;
3. data minimization;
4. explicit event/property governance;
5. low client performance overhead;
6. tenant-safe context;
7. pseudonymous identity where sufficient;
8. analytics outage never blocks product use;
9. no session replay/autocapture baseline;
10. no feature-flag/experimentation coupling;
11. D-SEC-001 privacy/jurisdiction gate;
12. D-SEC-005 deletion/export gate;
13. D-SEC-006 retention gate;
14. provider exit/export;
15. low Phase 1 operational complexity.

## 5. Constraints and Assumptions

1. D-PROVIDER-005 remains P2 OPEN.
2. ADR-0024 is Proposed, not Accepted.
3. No external product-analytics provider is required for architecture completion.
4. Canonical business KPIs are independent of analytics provider availability.
5. Browser instrumentation is untrusted, incomplete, blockable, forgeable, and duplicable.
6. General analytics avoids direct identifiers and sensitive payloads.
7. D-SEC-001 remains P0 OPEN.
8. D-SEC-005 remains P1 OPEN.
9. D-SEC-006 remains P1 OPEN.
10. No exact analytics retention period is chosen.
11. No anonymous acquisition funnel is a Phase 1 requirement.
12. GymPulse is primarily an authenticated operational/member product in Phase 1.
13. No session replay baseline.
14. No autocapture baseline.
15. No heatmap baseline.
16. No feature flag baseline from analytics-provider bundling.
17. No experimentation/A-B testing baseline.
18. No CDP/warehouse/event-streaming platform baseline.
19. No marketing attribution infrastructure.
20. No analytics-derived financial or entitlement effects.
21. No durable correctness-critical queue is introduced solely for analytics.
22. Provider-specific event/person/group semantics do not become canonical domain contracts.

## 6. Analytics Trust Boundary

Preserve:

~~~text
Analytics Event != Canonical Business Record
Client Event != Payment Truth
Client Event != Attendance Truth
Client Event != Membership Truth
Analytics Funnel != Financial Ledger
Analytics Conversion != Verified Business Outcome
Analytics tenant_id != Application Authorization
Provider Session != GymPulse Login Session
Provider Group != GymPulse Tenant Authority
~~~

A browser user may:

- block tracking;
- forge/replay events;
- change event properties;
- use a privacy extension;
- go offline;
- clear provider identifiers.

Therefore analytics never drives:

- membership entitlement;
- attendance validity;
- payment state;
- billing;
- authorization;
- audit;
- provider callback trust.

Analytics is an optional side effect.

## 7. Event Taxonomy Principles

### 7.1 Candidate event review

Current canonical success-metrics candidate events are reviewed below.

| Existing candidate | Classification | Proposed posture |
|---|---|---|
| member.home_viewed | Useful behavioral event | Client-derived only if Member Home adoption becomes a prioritized pilot question. |
| attendance.scan_started | Useful behavioral event but naming should be precise | Prefer a UI observation such as attendance.scan_ui_opened if the question is whether Members reach scan entry. |
| attendance.checkin_succeeded | Redundant/dangerously ambiguous | Canonical Attendance proves success. If UX display behavior matters, use a name such as attendance.success_ui_shown. |
| attendance.checkin_failed | Potentially ambiguous | Operational failure belongs primarily to application/observability. Add a behavioral UI event only for a concrete UX question and safe bounded error category. |
| renewal.options_viewed | Useful behavioral event | Strong future client event for renewal-funnel questions. |
| renewal.order_created | Redundant with canonical state | Derive from canonical RenewalOrder; no duplicate analytics event baseline. |
| payment.checkout_started | Useful behavioral event with clearer naming | Prefer payment.checkout_ui_opened when measuring UI handoff; payment success remains canonical. |
| addon.catalog_viewed | Useful behavioral event | Optional if add-on browsing becomes a pilot question. |
| addon.detail_viewed | Useful behavioral event | Required only if view-to-purchase becomes a prioritized KPI. |
| owner.dashboard_viewed | Useful behavioral event | Optional client event for Owner dashboard adoption. |
| followup.recorded | Redundant with canonical state | FollowUp canonical record is the stronger adoption/completion source. |

Legacy docs also mention server-outcome-style analytics names such as payment.server_verified, addon.order_created, and noshow.case_opened.

These are not copied into the Phase 1 behavioral vocabulary because canonical records already prove them.

### 7.2 Minimal future candidate vocabulary

If a behavioral pilot question later justifies instrumentation, begin with the smallest relevant subset such as:

~~~text
member.home_viewed
attendance.scan_ui_opened
renewal.options_viewed
payment.checkout_ui_opened
addon.catalog_viewed
addon.detail_viewed
owner.dashboard_viewed
~~~

This is candidate taxonomy documentation only.

Nothing is instrumented by this ADR.

### 7.3 Event definition fields

Document each future event with:

~~~text
event name
event version
question answered
source: client/server
allowed properties
privacy classification
authority status: non-authoritative
~~~

### 7.4 Property allowlist

Prefer explicit properties.

Never:

~~~text
spread entire API DTO into analytics
track all component props
capture arbitrary form values
~~~

Potential safe categories may include:

- pseudonymous analytics subject;
- pseudonymous tenant/gym analytics identity;
- coarse actor type;
- surface/client type;
- approved source category;
- approved bounded option/category;
- application release/version.

Do not finalize schema in this ADR.

## 8. Identity and Tenant Model

### 8.1 Identity

Preserve:

~~~text
Provider Identity != GymPulse Principal
GymPulse Principal != Member
~~~

Analytics identity must not collapse those concepts.

Default analytics identity is not:

~~~text
phone
email
auth-provider subject
display name
~~~

Preferred future direction:

~~~text
opaque analytics subject
+
opaque tenant/gym analytics identity where needed
+
safe coarse actor type
~~~

Do not expose canonical internal IDs if a pseudonymous mapping satisfies the question.

### 8.2 Anonymous identity

Phase 1 does not currently justify complex anonymous-to-authenticated acquisition funnel merging.

Add identity stitching only if a concrete question needs it.

### 8.3 Shared-device reset

Owner/Staff devices may be shared.

Any future browser provider must support a logout/reset path so Staff A and Staff B are not silently merged.

The same principle applies to Member sessions on shared/recycled devices.

### 8.4 Tenant context

Relevant events carry trusted tenant/gym context where required.

Do not trust arbitrary browser-supplied tenantId/gymId/branchId.

Prefer trusted server-issued safe analytics context where practical.

### 8.5 Provider project structure

If a provider is later accepted, compare:

~~~text
one GymPulse analytics project + safe tenant property/group
vs
multiple projects
~~~

Do not create project-per-gym complexity without evidence.

Provider groups/properties remain measurement metadata, not authorization.

## 9. Options Considered

### Option A — No External Product Analytics During Initial Pilot

~~~text
canonical operational metrics
+
limited application/observability diagnostics
+
manual pilot observation
+
documented provider-neutral future events
~~~

Strengths:

- lowest privacy surface;
- no browser analytics SDK;
- no third-party event retention;
- no event-volume vendor cost;
- no provider identity bleed;
- no autocapture/replay risk;
- no feature-flag/experiment coupling;
- no early taxonomy lock-in;
- core pilot KPIs remain fully measurable.

Tradeoff:

- limited behavioral funnel/abandonment evidence;
- more manual UX observation during pilot;
- add-on view-to-purchase cannot be reported without reliable view events.

### Option B — Lightweight Managed Product Analytics

Serious current candidates:

- PostHog;
- Mixpanel;
- Amplitude.

All can support behavioral funnels and explicit event capture.

Their broader bundled capabilities are not Phase 1 requirements.

### Option C — Privacy-Focused / Minimal Web Analytics

This category is useful when the primary question is:

~~~text
public page usage
basic traffic
coarse adoption
~~~

Current GymPulse questions are primarily authenticated product workflow behavior.

A simple traffic-only product is therefore not the leading requirement.

No specific privacy-web-analytics provider is selected.

### Option D — First-Party Event Capture / Warehouse Later

Conceptually:

~~~text
provider-neutral event contract
-> first-party sink / warehouse later
~~~

This maximizes ownership but introduces event storage, schema evolution, query tooling, operations, retention, and privacy work before evidence requires it.

Do not build it for the initial pilot.

## 10. Provider Evaluation

Because the external-provider need is not established, provider research is intentionally bounded to proving that credible future paths exist.

This is not a production vendor-selection scorecard.

Research date: 2026-09-27.

| Criterion | No Provider | PostHog | Mixpanel | Amplitude |
|---|---|---|---|---|
| Current pilot KPI fit | Strong for canonical outcomes | Strong if behavioral funnels later needed | Strong if behavioral funnels later needed | Strong if behavioral funnels later needed |
| Explicit events | Not applicable; future internal contract only | Supported | Supported via SDK/API/server paths | Supported |
| Browser/server support | No SDK | Browser + server/Next.js paths | Browser/mobile plus direct server/API ingestion | Browser + Node/server SDKs |
| Funnels/retention | Manual/canonical queries only | Supported | Supported | Supported |
| Identity model | GymPulse-owned only | distinct/person identity; reset required on shared devices | ID merge/identify/reset model | user/device identity; reset supported |
| Tenant/group analytics | canonical records | groups/person properties available | group/account analysis available depending plan | groups/accounts available depending plan |
| Autocapture | None | Available; should remain disabled for GymPulse baseline | Available; should remain disabled for GymPulse baseline | Available; should remain disabled for GymPulse baseline |
| Session replay | None | Available; not approved | Available; not approved | Available; not approved |
| Deletion controls | Canonical policies only | Person/events/replay deletion available | End-user delete/export tooling available | User Privacy API available |
| Retention controls | Canonical only | Plan/project retention capabilities exist | Retention controls available | TTL controls available |
| Current region evidence | GymPulse hosting/persistence decisions only | Cloud material currently exposes US/EU regions | Current first-party program exposes US/EU/India, including Mumbai | Current first-party material exposes US/EU |
| Feature flags/experiments | No coupling | Bundled/available but out of scope | Bundled/available but out of scope | Bundled/available but out of scope |
| Phase 1 privacy surface | Lowest | Higher | Higher | Higher |
| Client runtime impact | None | Browser SDK/network if adopted | Browser SDK/network if adopted | Browser SDK/network if adopted |
| Provider lock-in | None | Manageable with internal event contract | Manageable with internal event contract | Manageable with internal event contract |
| Initial-pilot conclusion | Best fit to current evidence | Defer | Defer | Defer |

Notes:

- PostHog current product docs expose product analytics, funnels/retention/paths, browser/server integration, autocapture, replay, person deletion, and US/EU cloud routing.
- Mixpanel current first-party material exposes behavioral analytics, server/API ingestion, identity reset/merge, autocapture/replay, end-user deletion/export, and a data-residency program with US/EU/India options.
- Amplitude current docs expose browser/server SDKs, groups, autocapture, replay, EU/default data regions, TTL, and User Privacy deletion APIs.

Provider region availability is technical evidence only:

~~~text
provider region availability
!=
legal/privacy approval
~~~

D-SEC-001 remains OPEN.

### Pricing snapshot

Pricing is time-sensitive and is not a selection basis here.

Current public evidence on 2026-09-27:

- PostHog Product Analytics advertises the first 1,000,000 events/month free, then usage pricing beginning at USD 0.00005/event with volume reductions.
- Mixpanel Free advertises up to 1,000,000 events/month; paid Growth scales by event volume.
- Amplitude Free advertises 2,000,000 events/month; paid plans scale by usage/features.

Zero-price/free tiers do not justify collection that has no product question.

## 11. Proposed Decision

Choose Outcome A:

~~~text
Defer external product analytics for the initial Phase 1 pilot.
~~~

Proposed Phase 1 direction:

~~~text
canonical KPIs from trusted business records
+
manual pilot observation where appropriate
+
no external product-analytics provider
+
no analytics browser/server SDK
+
no autocapture
+
no session replay
+
no feature flags/experiments through analytics
+
small documented provider-neutral event vocabulary
only when a concrete pilot behavioral question appears
~~~

Important qualification:

~~~text
No external analytics for initial pilot
!=
Product analytics is forbidden forever
~~~

Revisit only when a concrete pilot question cannot be answered adequately from canonical data/manual observation.

Canonical D-PROVIDER-005 remains P2 OPEN because this ADR proposes deferral; it does not permanently reject provider adoption.

### Decision confidence

~~~text
Canonical KPI independence            High
No-provider initial-pilot fit          High
Need for behavioral funnel tooling     Not yet proven
PostHog future suitability             Credible, not selected
Mixpanel future suitability            Credible, not selected
Amplitude future suitability           Credible, not selected
Provider acceptance                    None
~~~

## 12. Client-Side Instrumentation

No client-side analytics instrumentation is created in Task 0032.

If later justified:

- instrument explicit named events only;
- use property allowlists;
- keep browser tenant context non-authoritative;
- do not copy API DTOs;
- sanitize URLs/query strings/referrers;
- review provider automatic device/browser/IP/geo properties;
- use pseudonymous identity;
- reset provider identity on logout/account change;
- isolate test/preview traffic;
- avoid blocking check-in/renewal;
- evaluate low-end Android bundle/startup/network impact.

Client events are suitable for:

~~~text
surface viewed
scan UI opened
renewal options displayed
checkout UI opened
catalog/detail viewed
~~~

Client events are not suitable as authoritative proof of:

~~~text
Paid
Checked In
Renewed
Returned
Authorized
~~~

## 13. Server-Side Instrumentation

Server-side analytics may be useful for non-authoritative workflow milestones when a concrete question needs them.

However, do not emit duplicate analytics events merely because canonical state changed.

Prefer:

~~~text
query canonical records for canonical outcome metrics
~~~

over:

~~~text
canonical outcome
-> duplicate product analytics event
-> use analytics event as reported truth
~~~

If a later behavioral funnel genuinely needs a server boundary step, emit it through the provider-neutral analytics abstraction with an explicit non-authoritative meaning.

No server analytics SDK is installed.

## 14. Privacy and Data Minimization

### 14.1 Forbidden baseline content

Do not send:

~~~text
raw phone
raw email
OTP
session cookie
bearer/auth token
auth-provider token
payment-provider secret
webhook secret
card/UPI credential
raw payment/provider payload
private staff/follow-up note
health/medical detail
full notification/message body
arbitrary free text
~~~

### 14.2 URL/referrer safety

Before any future browser SDK:

- verify paths do not expose Member IDs/tokens/payment refs unnecessarily;
- strip/sanitize unsafe query strings;
- review referrer capture;
- do not enable generic full-URL capture blindly.

### 14.3 Device/IP properties

SDK defaults are not GymPulse-approved data collection.

Explicitly review:

- IP capture;
- geo enrichment;
- user agent;
- device/browser attributes;
- persistent browser identifiers.

Avoid unnecessary precise location or persistent identity.

### 14.4 Staff surveillance

Product analytics should measure product adoption, not create fine-grained employee surveillance.

Track staff behavior only for a concrete product/operational question with proportionate granularity.

## 15. Autocapture / Session Replay / Behavioral Capture

### 15.1 Autocapture

Baseline:

~~~text
explicit event instrumentation
>
capture every click/input/DOM interaction
~~~

Autocapture can introduce:

- PII leakage;
- unstable DOM-derived schemas;
- event noise;
- unexpected form/URL capture;
- cost/volume growth.

PostHog, Mixpanel, and Amplitude all currently offer autocapture-like capabilities.

GymPulse does not enable them.

### 15.2 Session replay

Session replay is not a Phase 1 baseline.

It may capture:

- member data;
- staff notes;
- payment-related UI;
- contact details;
- tenant-sensitive operational data.

PostHog, Mixpanel, and Amplitude expose replay/masking controls, but:

~~~text
masking capability != zero privacy risk
~~~

Replay requires a separate future review with:

- explicit product need;
- masking proof on representative Member/Staff screens;
- sampling policy;
- retention;
- deletion;
- D-SEC-001 jurisdiction/privacy review;
- security review.

### 15.3 Heatmaps

Not required.

### 15.4 Feature flags and experiments

Provider-bundled flags/experiments are not adopted.

No Phase 1 requirement establishes:

- A/B testing;
- multivariate experiments;
- bandits;
- analytics-owned rollout architecture.

These remain separate future decisions.

## 16. Environment and Access Model

If a provider is later adopted:

~~~text
development / local
preview
staging/test
production
~~~

must be separated by project, source, environment tag with enforced filtering, or another proven isolation model.

Test/E2E users must not pollute production metrics.

Differentiate:

~~~text
public/browser ingestion identifier
!=
private management/export/admin secret
~~~

A browser project token may be public by provider design.

That does not make event ingestion trusted business input.

Administrative/export keys remain server/operator-only.

Internal product-analytics access should be least-privilege.

Gym tenants do not gain global cross-tenant product analytics access by default.

## 17. Reliability and Performance

Preserve:

~~~text
Analytics Provider Failure
!=
GymPulse Business Failure
~~~

Analytics failure must never block:

- check-in;
- renewal;
- payment;
- staff follow-up;
- member update;
- dashboard operations.

Default future delivery semantics may be:

- best effort;
- provider batching/retry;
- at-least-once where natural.

Do not engineer payment-grade exactly-once analytics.

Duplicates may be handled with provider/query-side dedupe only where the actual metric requires it.

No Redis/durable queue is introduced solely for product analytics.

### Performance

If a browser SDK is later used, validate:

- bundle size;
- startup cost;
- extra network calls;
- batching;
- failure behavior;
- low-end Android Member experience;
- CSP/network destinations;
- third-party script/runtime supply-chain surface.

Do not loosen CSP broadly merely to accommodate analytics.

## 18. Observability / Audit Separation

### Observability

Use ADR-0020 for:

- exceptions;
- latency;
- worker failures;
- webhook diagnostics;
- request/job correlation;
- provider incidents.

Do not ship traces/logs wholesale to product analytics.

Avoid adding trace/request IDs to product events unless one specific use case justifies the privacy expansion.

### Audit

Sensitive mutations remain canonical audit records.

Never use a product event as proof of:

- refund authorization;
- permission change;
- attendance correction;
- membership change;
- privileged configuration change.

## 19. Security Impact

| Threat | Control |
|---|---|
| Raw PII leakage | explicit event/property allowlists |
| Payment data leakage | no full payment/provider objects or secrets |
| Future health data leakage | no Phase 1 health instrumentation; revisit future scope |
| Free-text leakage | bounded categories only |
| URL/query leakage | sanitization + explicit URL policy |
| Cross-tenant property mixup | trusted tenant analytics context + tests |
| Wrong identity merge | opaque subject + controlled identify/reset |
| Shared-device identity bleed | logout/account-change reset validation |
| Admin API key exposed to browser | separate browser/public ingestion vs admin secrets |
| Replay captures secrets | replay disabled |
| Autocapture captures fields | autocapture disabled |
| Test events pollute production | environment isolation/filtering |
| Forged browser events treated as truth | analytics non-authoritative by architecture |
| Provider account compromise | least-privilege access/MFA/audit where provider supports |
| Overbroad internal access | role/project access review |
| Indefinite retention | D-SEC-006 gate + provider retention review |
| Deletion/export gap | D-SEC-005 gate + provider API/export validation |
| Analytics outage blocks UI | async/non-blocking side effect |
| Third-party SDK compromise | dependency/CSP/network governance under ADR-0017/release controls |

## 20. Testing and Validation

Future analytics implementation must align with ADR-0018.

Require tests/evidence for:

1. each event maps to a concrete pilot question;
2. canonical metrics remain independent of analytics;
3. payment truth does not rely on analytics;
4. attendance truth does not rely on analytics;
5. no raw phone;
6. no raw email;
7. no OTP/token;
8. no payment secret/provider payload;
9. no free-text staff notes;
10. no health data;
11. correct safe tenant context;
12. forged browser event cannot affect business state;
13. correct analytics identity;
14. logout/reset prevents identity bleed;
15. shared-device account change is safe;
16. preview/test traffic is isolated;
17. provider outage does not block critical flow;
18. low-end Member client performance is acceptable;
19. safe URL/query/referrer handling;
20. browser storage behavior is understood;
21. autocapture remains disabled unless separately approved;
22. replay remains disabled unless separately approved;
23. provider account access is reviewed;
24. retention behavior is understood;
25. deletion/export capability is understood;
26. provider data location/privacy is reviewed;
27. raw event export/provider exit is validated;
28. representative event volume/cost is reviewed;
29. one pilot funnel proves real decision value before broad instrumentation;
30. explicit approval exists before provider acceptance.

Task 0032 executes none of these provider-resource validations.

## 21. Data Retention / Deletion Dependencies

D-SEC-006 remains OPEN.

Do not invent:

~~~text
30 days
90 days
1 year
forever
~~~

as GymPulse analytics retention.

Any future provider must support an approved minimization/retention approach.

D-SEC-005 remains OPEN.

If future deletion/export policy includes third-party analytics, GymPulse must be able to:

- map the analytics subject safely;
- locate/delete applicable provider data;
- stop future tracking where required by policy;
- avoid immediate re-ingestion from upstream sources;
- export necessary event data for provider exit/authorized requests where applicable.

Current provider capability evidence:

- PostHog exposes person/event/replay deletion controls.
- Mixpanel exposes end-user deletion/export mechanisms.
- Amplitude exposes User Privacy deletion APIs and TTL controls.

These capabilities do not decide legal obligations.

## 22. Migration and Adoption Plan

No analytics provider is introduced for initial pilot.

Adoption trigger flow:

~~~text
pilot/product question appears
-> prove canonical records/manual observation cannot answer it adequately
-> define one minimal funnel/question
-> define minimal events/properties
-> privacy/security review
-> evaluate current provider options
-> validate one provider in non-production
-> validate identity/reset/tenant isolation
-> validate data payloads
-> validate retention/deletion/export/region/cost
-> explicit approval
-> production instrumentation
~~~

Do not instrument a broad taxonomy before one real question proves value.

## 23. Provider Exit and Reversibility

Keep outside provider configuration:

~~~text
GymPulse event names
GymPulse event versions
question answered
property allowlists
privacy classification
authority status
identity mapping rules
tenant-context rules
~~~

Provider replacement should mainly change:

~~~text
ProductAnalytics adapter
browser/server SDK or transport
project/configuration
export/import mapping where needed
~~~

Provider dashboards must not be the only place metric/event definitions live.

Before provider acceptance validate:

- raw-event export/API;
- identity mapping;
- deletion behavior;
- event schema migration;
- historical data retention need;
- new-provider cutover;
- rollback/dual-write only if explicitly justified.

Active-active analytics providers are not a Phase 1 baseline.

## 24. Cost and Operations

### No-provider option

Initial provider/event cost:

~~~text
zero external analytics event ingestion
~~~

Operational benefits:

- no analytics account administration;
- no analytics billing;
- no new incident dependency;
- no retention/deletion operations;
- no event-volume monitoring;
- no third-party analytics access administration.

Tradeoff:

- behavioral funnel questions rely on manual observation until prioritized instrumentation exists.

### Future managed provider

Current free tiers make technical experimentation inexpensive, but price is not the primary gate.

The primary gate is whether collected data answers a concrete pilot/product question with acceptable privacy/operations cost.

Future operational ownership includes:

- event taxonomy review;
- property/privacy review;
- identity/reset bugs;
- environment/test-data isolation;
- provider access;
- cost/volume monitoring;
- retention/deletion/export;
- SDK/release compatibility;
- provider incident handling.

## 25. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Analytics added without a decision question | question -> metric -> event gate |
| Canonical outcome copied into third-party truth | derive operational outcomes from canonical records |
| Ambiguous success event | precise behavioral naming or no event |
| PII leaked via DTO spread/autocapture | allowlists; autocapture disabled |
| URL/query leaks identifiers/tokens | sanitize/disable unsafe automatic capture |
| Browser event forged | non-authoritative trust boundary |
| Tenant mixup | trusted tenant context + negative tests |
| Shared-device identity bleed | provider reset/account-change tests |
| Replay captures sensitive data | replay disabled |
| Staff behavior becomes surveillance | purpose/granularity review |
| Bundled flags/experiments expand scope | keep separate governance |
| Provider SDK hurts low-end clients | defer + performance validation |
| Analytics outage blocks flows | non-blocking side effect |
| Retention becomes indefinite | D-SEC-006 gate |
| Deletion impossible | D-SEC-005 + provider deletion validation |
| Provider lock-in | provider-neutral taxonomy/adapter/export |
| Free tier encourages overcollection | collect only events tied to a question |
| Product analytics duplicates observability | explicit boundary |
| Product analytics replaces audit | explicit boundary |

## 26. Revisit Triggers

Revisit D-PROVIDER-005 when one or more become true:

~~~text
a pilot question cannot be answered from canonical records

renewal-flow abandonment needs repeatable measurement

Member QR-entry UX needs funnel diagnosis

Owner/Staff product adoption needs behavioral measurement

add-on view-to-purchase becomes a prioritized Phase 1 KPI

manual pilot observation becomes insufficient

product team needs repeatable behavioral cohort analysis
~~~

These reopen evaluation.

They do not accept a provider automatically.

## 27. Open Questions

1. Which behavioral question, if any, is important enough during the initial pilot to require instrumentation?
2. Is renewal-options abandonment a decision-changing metric?
3. Is QR scan-entry abandonment needed beyond canonical QR adoption?
4. Does Owner dashboard usage require an explicit event or can authenticated request/server evidence answer it adequately?
5. Is add-on view-to-purchase a Phase 1 priority?
6. What pseudonymous analytics-subject mapping should be used if instrumentation is approved?
7. Which tenant/group analysis is actually needed internally?
8. What browser storage/consent behavior is approved under D-SEC-001?
9. What provider region/processing model is acceptable under D-SEC-001?
10. What retention is approved under D-SEC-006?
11. What deletion/export scope is approved under D-SEC-005?
12. Which internal roles may access cross-tenant product analytics?
13. What one-funnel experiment would prove that an external provider creates enough decision value?
14. Which provider should be evaluated at acceptance time after those gates close?

## 28. Decision Evidence

Research date: 2026-09-27.

### Repository evidence

- docs/00-overview/assumptions.md — D-PROVIDER-005 remains P2 OPEN; D-SEC-001, D-SEC-005, D-SEC-006 remain OPEN.
- docs/00-overview/goals.md — Phase 1 product/operational outcomes.
- docs/01-product/success-metrics.md — canonical measurement principles, pilot KPIs, candidate product-usage events.
- docs/01-product/non-functional-requirements.md — NFR-PRIVACY-004 analytics minimization and NFR-RELIABILITY-005 canonical truth.
- docs/01-product/user-journeys.md — canonical workflow outcomes.
- docs/02-architecture/architecture-principles.md — analytics as secondary/non-canonical, provider abstraction, minimization.
- docs/02-architecture/technology-stack.md — no provider required for architecture completion; defer until concrete pilot funnel questions.
- docs/11-analytics-kpis.md — legacy analytics/KPI detail; canonical business tables remain source of truth.
- ADR-0011 — runtime/trust-boundary contracts.
- ADR-0012 — Owner/Staff browser surface.
- ADR-0013 — browser-first Member delivery and untrusted client state.
- ADR-0017 — dependency/release/secrets governance.
- ADR-0018 — deterministic/integration/browser testing.
- ADR-0020 — Observability != Product Analytics.
- ADR-0022 — payment truth remains verified/canonical.
- ADR-0023 — messaging delivery observations remain separate from canonical business state.

### PostHog first-party research

- https://posthog.com/docs/product-analytics
- https://posthog.com/docs/libraries/next-js
- https://posthog.com/docs/data/persons
- https://posthog.com/docs/session-replay
- https://posthog.com/product-analytics
- https://posthog.com/docs/model-context-protocol

Observed current capabilities include explicit product events/funnels/retention/paths, browser/server Next.js integration, person identity/reset considerations, deletion controls, autocapture, replay, US/EU cloud routing, and usage-based pricing.

### Mixpanel first-party research

- https://mixpanel.com/platform/product-analytics/
- https://mixpanel.com/developer/
- https://mixpanel.com/platform/session-replay/
- https://mixpanel.com/legal/eu-data-residency/
- https://mixpanel.com/legal/mixpanel-security-questionnaire/
- https://mixpanel.com/pricing/

Observed current capabilities include event/funnel/cohort analysis, browser/server/API ingestion, identify/reset/identity merge, autocapture/replay, user deletion/export controls, retention controls, and US/EU/India data-residency options.

### Amplitude first-party research

- https://www.amplitude.com/docs/sdks
- https://www.amplitude.com/docs/get-started/autocapture
- https://www.amplitude.com/docs/sdks/analytics/browser/cookies-and-consent-management
- https://www.amplitude.com/docs/data/time-to-live
- https://www.amplitude.com/docs/apis/analytics/user-privacy-v2
- https://www.amplitude.com/docs/session-replay
- https://www.amplitude.com/pricing

Observed current capabilities include browser/server SDKs, explicit capture and autocapture, identity/reset/storage controls, groups, US/EU region support, event TTL, deletion APIs, replay/privacy controls, and usage-based/free-tier pricing.

All provider pricing, SDK behavior, regions, retention, deletion, replay, default capture, identity, access controls, and exports are time-sensitive and must be re-verified when D-PROVIDER-005 is reopened.

## 29. Related Documents

- ../README.md
- ../00-overview/assumptions.md
- ../00-overview/goals.md
- ../00-overview/project-overview.md
- ../01-product/functional-requirements.md
- ../01-product/non-functional-requirements.md
- ../01-product/success-metrics.md
- ../01-product/user-journeys.md
- ../01-product/personas.md
- ../02-architecture/architecture-principles.md
- ../02-architecture/architecture-overview.md
- ../02-architecture/system-context.md
- ../02-architecture/container-architecture.md
- ../02-architecture/component-architecture.md
- ../02-architecture/data-flow.md
- ../02-architecture/technology-stack.md
- ../11-analytics-kpis.md
- README.md
- ADR-0011-api-contract-architecture.md
- ADR-0012-owner-staff-web-framework.md
- ADR-0013-member-client-strategy.md
- ADR-0017-ci-cd-release-secrets.md
- ADR-0018-testing-toolchain.md
- ADR-0020-observability-provider.md
- ADR-0022-payment-provider.md
- ADR-0023-messaging-provider.md
