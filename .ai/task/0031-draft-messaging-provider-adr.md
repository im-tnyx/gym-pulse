# Task 0031: Draft Messaging Provider ADR

## Goal

Draft one Proposed ADR for D-PROVIDER-002 defining GymPulse's Phase 1 messaging-provider and notification-delivery architecture without creating any provider account, WABA, sender/phone registration, template, credential, SDK integration, callback route, notification job, test/production message, campaign, IaC, or deployment.

Target:

docs/adr/ADR-0023-messaging-provider.md

Continuity:

.ai/task/0031-draft-messaging-provider-adr.md

## Inputs Read

Fresh latest-main repository/governance inputs included:

- .ai/README.md
- .ai/current-state.md
- .ai/task/0030-draft-payment-provider-adr.md
- docs/README.md
- docs/00-overview/assumptions.md
- docs/00-overview/project-overview.md
- docs/00-overview/glossary.md
- docs/01-product/functional-requirements.md
- docs/01-product/non-functional-requirements.md
- docs/01-product/personas.md
- docs/01-product/user-roles.md
- docs/01-product/user-journeys.md
- docs/02-architecture/architecture-principles.md
- docs/02-architecture/architecture-overview.md
- docs/02-architecture/system-context.md
- docs/02-architecture/container-architecture.md
- docs/02-architecture/component-architecture.md
- docs/02-architecture/data-flow.md
- docs/02-architecture/technology-stack.md
- docs/adr/README.md
- docs/adr/ADR-0008-member-authentication-method.md
- docs/adr/ADR-0009-authorization-implementation.md
- docs/adr/ADR-0011-api-contract-architecture.md
- docs/adr/ADR-0013-member-client-strategy.md
- docs/adr/ADR-0015-background-jobs-scheduler.md
- docs/adr/ADR-0016-hosting-deployment-platform.md
- docs/adr/ADR-0017-ci-cd-release-secrets.md
- docs/adr/ADR-0018-testing-toolchain.md
- docs/adr/ADR-0020-observability-provider.md
- docs/adr/ADR-0022-payment-provider.md

Legacy evidence only:

- docs/08-automations.md
- docs/10-notifications-whatsapp.md
- docs/12-security-audit.md
- docs/16-open-decisions.md

Canonical structured documentation controlled where legacy wording differed.

## Repository State Verified

At Task 0031 start:

- latest main was 423e62f49a246dcf2895af6e1df7884e54a6d787;
- Task 0030 / ADR-0022 were synchronized;
- docs/adr/ADR-0023-messaging-provider.md did not exist;
- .ai/task/0031-draft-messaging-provider-adr.md did not exist;
- ADR backlog order 23 remained D-PROVIDER-002 Messaging provider OPEN;
- canonical D-PROVIDER-002 remained P1 OPEN;
- no ADR was Accepted;
- no provider acceptance evidence was found;
- no TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, GUPSHUP_API_KEY, WHATSAPP_ACCESS_TOKEN, WABA_ID, PHONE_NUMBER_ID or equivalent current implementation credential evidence was found;
- no Twilio/Gupshup/Meta API SDK/import endpoint evidence was found;
- legacy WHATSAPP_SEND_ENABLED text was documentation-only and not implementation evidence.

Task 0031 was the actual next bounded governance task.

## Canonical Decision State

~~~text
D-PROVIDER-002
Priority: P1
Status: OPEN
Decision: WhatsApp/messaging provider
Acceptance: none
~~~

ADR-0023 = Proposed.

Creating it does not promote D-PROVIDER-002 to DECIDED.

## Launch Channel Finding

Current canonical evidence does not approve a complete external launch-channel set.

Classification:

~~~text
WhatsApp
  -> Unresolved; leading external candidate only

SMS
  -> Optional/fallback candidate only; not a canonical launch requirement

email
  -> Optional/fallback candidate only; provider separately governed by D-PROVIDER-003

in-app state
  -> Required as authoritative product state
     but not an external-provider channel
     and not necessarily a dedicated notification center

push
  -> Future / not currently justified as Phase 1 baseline
     D-PROVIDER-004 remains OPEN
~~~

Legacy D-039 candidate "WhatsApp + in-app; SMS/email optional" remains legacy OPEN evidence only.

It was not silently promoted.

## Sender / WABA Ownership Finding

No canonical structured decision answers:

~~~text
Whose WhatsApp Business Account / sender / phone number
sends tenant messages?
~~~

Models evaluated:

~~~text
A. GymPulse-owned shared sender
B. gym-owned sender/WABA
C. provider/platform multi-tenant onboarding
~~~

None is selected.

Sender ownership affects branding, member-visible identity, account/business verification, phone ownership, template ownership, credential isolation, billing, account-suspension blast radius, tenant offboarding, support and provider migration.

## Decision-Register Gaps Found

No canonical IDs were invented.

Gaps:

~~~text
initial launch communication channels

sender / WABA / phone-number ownership

which supported service notification intents
are externally enabled at pilot launch
~~~

Legacy D-039 and D-041 remain supporting evidence, not normalized decisions.

## Consent / Policy Findings

Canonical:

~~~text
D-BIZ-014 = P1 OPEN
How is member communication consent currently captured?
~~~

Preserve:

~~~text
Marketing Consent
!=
Service / Transactional Communication Policy

Provider Template Category
!=
GymPulse Policy Category
~~~

Current WhatsApp policy requires WhatsApp opt-in for subsequent business messaging and respect for stop/opt-out requests.

Task 0031 does not decide applicable legal consent requirements.

## Service vs Marketing Findings

FR-NOTIFICATION-001 defines service/transactional intent types.

It does not authorize marketing campaigns.

Because marketing consent/source remains unresolved:

~~~text
No Phase 1 marketing campaign is enabled by Task 0031.
~~~

Provider/BSP campaign UI was not treated as a GymPulse requirement.

## Notification Intent Requirements

Canonical exact behavior preserved:

- FR-NOTIFICATION-001: no-show care, renewal reminder, payment success, payment failure, owner daily summary intent types.
- FR-NOTIFICATION-002: retry cannot duplicate a business-stage message.
- FR-NOTIFICATION-003: only supported/observed provider delivery states may be represented.
- FR-NOTIFICATION-004: stale future renewal reminders are suppressed after applicable renewal/cancellation/preference policy.
- FR-CONSENT-001: marketing separation.
- FR-CONSENT-002: supported preference/opt-out persistence and consultation.

## Providers Evaluated

Active bounded comparison:

1. Direct Meta WhatsApp Business Platform / Cloud API.
2. Twilio WhatsApp / Messaging Platform.
3. Gupshup.

No fourth candidate was added because these three already span the direct-platform, global BSP/multi-channel, and India-focused BSP/Tech-Provider models.

MSG91, Interakt, AiSensy or another provider should enter only if later evidence exposes a material gap.

## Official Research Date

2026-09-27.

Current first-party WhatsApp/Meta Business policy, Twilio and Gupshup documentation was reviewed.

## WhatsApp Platform Findings

Current official WhatsApp Business Messaging Policy confirms:

- Cloud API is part of WhatsApp Business Platform;
- recipient mobile number + WhatsApp opt-in are required for subsequent business messaging;
- business-initiated messaging uses approved templates;
- user-initiated messaging opens a 24-hour service window;
- stop/opt-out must be respected;
- templates/accounts remain subject to platform review/restriction.

Direct Meta technical docs were attempted but were not reliably retrievable in the research environment.

Therefore direct Meta webhook-authentication, retry, rate-limit and exact onboarding technical mechanics are acceptance-time proof gates rather than inferred from BSP docs.

## Template Findings

Provider-independent requirement:

~~~text
GymPulse Business Template Key
!=
Provider Template ID
~~~

Twilio and Gupshup both document current template approval/lifecycle behavior.

Gupshup documents category/language fields, approval, rejection and editing/reapproval behavior.

Template updates are not assumed instant.

GymPulse retains enough mapping/history to know which approved provider template/language was used.

No template is created.

## Localization Findings

Language remains an open product policy.

Task 0031 does not decide:

~~~text
English
Hindi
Hinglish
tenant-configured locale
~~~

Provider evaluation confirms approved language variants are operationally possible.

## Tenant / Sender Model Findings

Trusted configuration concept:

~~~text
tenant/gym
-> approved messaging config
-> channel
-> provider/account/sender
-> approved business-template mappings
~~~

Client/user input cannot select arbitrary sender/provider credential/template.

Tenant A -> Tenant B sender/template/config negative tests are required later.

## Webhook / Callback Findings

Twilio current docs:

- X-Twilio-Signature signs HTTP callbacks;
- signature validation is documented;
- MessageStatus/ErrorCode callbacks are supported;
- WhatsApp read observations are exposed where available;
- callbacks may arrive out of order.

Gupshup current docs:

- webhook callbacks carry user/message/system events;
- 2xx should be returned quickly;
- failed acknowledgement may be retried;
- current public guidance recommends IP allowlisting;
- audited public docs did not expose a cryptographic signature contract comparable to Twilio.

Therefore Gupshup callback authenticity is an explicit security validation gate.

Direct Meta callback technical proof remains required before acceptance.

## Delivery-State Findings

Preserve:

~~~text
Provider Accepted != Delivered
Delivered != Read
~~~

Twilio current test/status material exposes queued/failed/sent/delivered/read where supported.

Gupshup exposes enqueued/failed/sent/delivered/read and documents that event arrival order may not reflect chronology; timestamps must guide observation ordering.

GymPulse cannot fabricate a read state when the provider does not provide one.

## Retry / Dedupe Findings

Separate:

~~~text
GymPulse job retry
Provider API retry
Provider internal delivery retry
Provider callback retry
~~~

Also:

~~~text
Notification Intent Dedupe
!=
Provider Attempt ID

Provider Callback Dedupe
!=
Business Notification Dedupe
~~~

Permanent errors do not receive blind retry.

Retryable errors use bounded backoff/visibility under ADR-0015.

## Preference / Stale-State Findings

Before every delayed send or retry, reload:

~~~text
current business state
current policy
current preferences
current allowed contact destination
current tenant sender/template config
~~~

A renewal reminder created before a successful renewal is suppressed when later dispatched.

A preference or destination change after intent creation is respected.

## SMS Findings

SMS is not established as a serious pilot-launch requirement by canonical evidence.

Task 0031 therefore does not select an SMS provider and does not convert WhatsApp consent/template semantics into SMS policy.

If SMS becomes a real launch/fallback requirement, conduct fresh TRAI/provider research for sender/header, DLT/template, classification, delivery receipts, opt-out and pricing.

## Email Findings

Email is optional/fallback only in current evidence.

Actual email provider remains D-PROVIDER-003 P2 OPEN.

No email provider is selected by ADR-0023.

## Authentication-OTP Separation

Preserved:

~~~text
Authentication OTP Channel
!=
Business Messaging Provider / Consent Policy
~~~

ADR-0023 does not select an authentication OTP provider.

## Pricing Findings

Current public evidence is time-sensitive.

Twilio:

~~~text
USD 0.005 per WhatsApp message handling fee
+
Meta template fees
~~~

Twilio labels its public pricing current as of August 2026.

Gupshup partner material publicly advertises a fixed per-message fee starting around USD 0.001, plus upstream WhatsApp fees.

Direct Meta has no BSP handling layer but creates more direct operational ownership.

No provider is chosen from headline price.

Realistic pilot service-message volume is the commercial comparison basis, not bulk marketing volume.

## Support / Escalation Findings

Acceptance requires real evidence for:

- onboarding/business verification;
- template rejection/category changes;
- sender/account suspension;
- API incident;
- callback issue;
- billing;
- credential/account security;
- migration/offboarding;
- India-relevant support/escalation.

Marketing/sales support claims alone are not sufficient.

## Security Findings

Required controls include:

- server-only provider credentials;
- authenticated callbacks where supported;
- callback dedupe;
- tenant-safe sender/template mapping;
- no arbitrary recipient/sender substitution;
- no marketing without approved consent/policy;
- stale-state suppression;
- deterministic business-stage dedupe;
- restricted provider-dashboard/template administration;
- non-production send guardrails;
- safe links requiring normal GymPulse authorization;
- no raw full message/contact logging by default.

## Privacy / Regulatory Findings

External message content is minimized because it can appear on shared devices/lock screens.

Avoid unnecessary health detail, private staff notes, sensitive financial history and internal reasons.

Operational telemetry should prefer safe internal references over full phone/message body.

D-SEC-001 remains OPEN.

No claim is made that Meta, Twilio or Gupshup satisfies Indian privacy/telecom law merely through technical availability.

## Reliability Findings

Provider failure does not reverse:

~~~text
payment
renewal
attendance
other canonical business truth
~~~

Notification intent remains visible and retryable/diagnosable.

Provider calls execute outside long correctness-sensitive transactions.

Old retries recheck current state before sending.

## Operational Findings

Future operator visibility should distinguish:

~~~text
pending
suppressed
provider accepted
failed retryable
failed permanent
callback delayed
template/config failure
invalid recipient
rate limited
sender/account restricted
~~~

Provider dashboards are diagnostic tools, not canonical eligibility/policy systems.

Manual provider-dashboard sends are not the normal operating model.

## Evaluation Summary

Architecture/correctness:

~~~text
Direct Meta
  credible direct candidate
  higher operational ownership
  direct technical callback/security proof still required

Twilio
  credible BSP candidate
  strongest documented callback signature + multi-tenant subaccount path
  higher public provider fee layer

Gupshup
  credible India-focused BSP candidate
  strong onboarding/template/status model
  callback-authenticity proof is a material security gate
~~~

This is not a universal ranking.

## Proposed Direction

Outcome D — Provider Selection Deferred.

~~~text
provider-neutral notification architecture now

Direct Meta / Twilio / Gupshup
remain a bounded WhatsApp comparison set
only if WhatsApp is approved as launch channel

no production provider selected
~~~

Architecture direction:

~~~text
GymPulse-owned NotificationIntent
+
policy / consent separation
+
canonical in-app state
+
business template keys
+
durable async dispatch
+
current-state / preference / destination recheck
+
business-stage dedupe
+
tenant-safe sender/template config
+
provider adapter
+
provider-observed delivery truth
+
provider exit
~~~

## Decision Confidence

~~~text
Notification integration architecture     High
WhatsApp serious-candidate status         High
External launch channel set               Unresolved
Sender/WABA ownership                     Unresolved
Direct Meta preference                    None
Twilio preference                         None
Gupshup preference                        None
Provider acceptance                       None
~~~

## Decision Gates

Before any provider acceptance require:

1. launch channels confirmed;
2. sender/WABA/phone ownership confirmed;
3. externally enabled service-message types confirmed;
4. D-BIZ-014 consent source understood;
5. no marketing without approved policy;
6. onboarding path proven;
7. test sender/recipient workflow proven;
8. template lifecycle proven;
9. localization behavior proven if needed;
10. tenant sender/template isolation proven;
11. callback authenticity/status semantics proven;
12. retry/dedupe/stale suppression proven;
13. outage/recovery proven;
14. realistic-volume pricing reviewed;
15. support/escalation reviewed;
16. security/privacy review completed;
17. provider-exit implications understood;
18. explicit decision-owner approval.

## Decisions Kept Separate

~~~text
D-PROVIDER-002 messaging provider              OPEN
D-PROVIDER-003 email provider                  OPEN
D-PROVIDER-004 push provider                   OPEN
D-PROVIDER-005 product analytics               OPEN
D-PROVIDER-006 observability                   OPEN

D-ARCH-003 API contract
D-ARCH-007 background jobs
D-ARCH-009 hosting
D-ARCH-015 authorization
D-ARCH-018 testing
D-ARCH-019 CI/CD / secrets

D-SEC-001 jurisdiction/privacy                 OPEN
D-SEC-004 session policy                       OPEN
D-SEC-005 deletion/export                      OPEN
D-SEC-006 retention                            OPEN

D-BIZ-014 communication consent capture        OPEN

launch channels                                new decision-register gap
sender/WABA/phone ownership                    new decision-register gap
externally enabled service intents             new product/governance gap
~~~

No new canonical ID was invented.

## Requirement IDs Referenced

~~~text
FR-NOTIFICATION-001..004
FR-CONSENT-001..002
FR-RENEWAL-001
FR-RENEWAL-002
FR-RENEWAL-007
FR-PAYMENT-001..009
FR-CROSS-002..004
FR-SUMMARY-001

NFR-AVAILABILITY-001..003
NFR-PRIVACY-001..006
NFR-SECURITY-004
NFR-SECURITY-005
NFR-SECURITY-009
NFR-SECURITY-011
NFR-RELIABILITY-003
NFR-RELIABILITY-006
NFR-RELIABILITY-007
NFR-MAINTAINABILITY-003
NFR-TESTABILITY-002..005
NFR-OBSERVABILITY-001..007
NFR-OPERATIONS-001..005
~~~

## Validation Required

All 45 acceptance checks recorded in ADR-0023 / Task 0031 brief remain future work.

No provider-resource or send test was executed.

## Files Changed

Created:

- docs/adr/ADR-0023-messaging-provider.md
- .ai/task/0031-draft-messaging-provider-adr.md

Governance continuity updates:

- docs/adr/README.md
- docs/README.md
- .ai/current-state.md

No canonical notification/consent requirement was modified.

No new decision ID was created.

## Open Questions

Primary unresolved:

- initial external launch channels;
- externally enabled service intents;
- sender/WABA/phone ownership;
- D-BIZ-014 consent source;
- language/localization;
- quiet hours;
- owner-summary channel;
- SMS fallback policy;
- callback-auth proof for Gupshup;
- direct Meta technical security/onboarding evidence;
- realistic pricing/support terms;
- provider account/admin model;
- account-suspension recovery;
- migration/number/template portability;
- final production provider.

## Result

Expected synchronized end state:

~~~text
ADR-0023 = Proposed
D-PROVIDER-002 = P1 OPEN

WhatsApp = leading external candidate only, not mandatory
Direct Meta = comparison candidate only
Twilio = comparison candidate only
Gupshup = comparison candidate only

Production provider selected = no
Sender/WABA ownership = unresolved
Marketing enabled = no
~~~

Implementation status:

~~~text
No provider account created
No WABA created
No sender/phone registered
No credential created
No template created
No SDK installed
No callback/webhook route created
No NotificationIntent table/job implemented
No test message sent
No production message sent
No campaign/broadcast created
No CI/environment secret created
No provider dashboard user created
No IaC/deployment created
No prior ADR accepted
~~~

## Next Recommended Task

Fresh-read the synchronized queue after governance updates.

Pre-synchronization queue shows:

~~~text
Order 24
D-PROVIDER-005
Product Analytics Provider
OPEN
~~~

Likely next bounded task:

~~~text
Task 0032: Draft Product Analytics Provider ADR
likely ADR-0024
~~~

Do not assume blindly; verify latest main after Task 0031 synchronization.

Do not execute Task 0032 as part of Task 0031.
