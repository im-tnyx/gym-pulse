# ADR-0023: Messaging Provider and Notification Delivery Strategy

## Status

Proposed

## Decision Metadata

- ADR: ADR-0023
- Primary Decision ID: D-PROVIDER-002
- Related Decision IDs: D-PROVIDER-003, D-PROVIDER-004, D-PROVIDER-005, D-PROVIDER-006, D-ARCH-003, D-ARCH-007, D-ARCH-009, D-ARCH-015, D-ARCH-018, D-ARCH-019, D-SEC-001, D-SEC-004, D-SEC-005, D-SEC-006, D-BIZ-014
- Decision Owner: Open
- Technical Owner: Architecture / Backend / Messaging / Security
- Business Owner: Open / Product + Gym Owner
- Date Proposed: 2026-09-27
- Date Accepted: Not accepted
- Supersedes: None
- Superseded By: None

## 1. Context

GymPulse Phase 1 requires notification intent types for no-show care, renewal reminder, payment success, payment failure, and owner daily summary.

The unresolved decision is not merely Twilio versus Gupshup.

It is:

> What provider and integration model should GymPulse use for approved Phase 1 service/transactional messaging—especially India/WhatsApp-oriented workflows—while preserving GymPulse-owned notification policy, consent separation, tenant isolation, deduplication, stale-message suppression, provider-observed delivery truth, operational diagnosability, and future provider/channel portability?

This decision covers:

~~~text
launch channel model
+
sender / business-account ownership
+
provider / BSP strategy
+
template ownership
+
delivery callback architecture
+
consent / policy boundary
+
retry / dedupe semantics
+
tenant isolation
+
provider exit
~~~

Fresh repository audit confirms that the canonical requirements define notification intents and correctness constraints, but do not yet decide which external channel launches.

The technology evaluation explicitly keeps provider selection open until launch channels and service-versus-marketing policy are confirmed.

A second material gap also remains unresolved:

~~~text
Whose WhatsApp Business Account / business sender / phone number
sends a tenant's messages?
~~~

Because both launch-channel policy and sender ownership materially change provider fit, this ADR proposes the integration architecture but defers production provider selection.

Canonical D-PROVIDER-002 remains P1 OPEN.

## 2. Requirements and Decision Drivers

### Functional requirements

- FR-NOTIFICATION-001 — Phase 1 supports service/transactional notification intent types for no-show care, renewal reminder, payment success, payment failure, and owner daily summary.
- FR-NOTIFICATION-002 — notification job retries must not create duplicate business-stage messages.
- FR-NOTIFICATION-003 — only provider delivery states actually supported/observed may be represented.
- FR-NOTIFICATION-004 — future renewal reminders are suppressed after applicable renewal completion, cancellation, or preference policy.
- FR-CONSENT-001 — marketing consent/preferences remain separate from service/transactional communication policy.
- FR-CONSENT-002 — supported communication preferences/opt-outs are persisted and consulted by relevant workflows.
- FR-RENEWAL-001, FR-RENEWAL-002, FR-RENEWAL-007 — renewal scheduling/stages and suppression after verified renewal/cancellation.
- FR-PAYMENT-001..009 — payment-result messaging must never become payment truth.
- FR-CROSS-002..004 — replay safety, explicit tenant context, and gym-local business time.

### Non-functional requirements

- NFR-AVAILABILITY-001 — a non-critical integration failure must not corrupt canonical business data.
- NFR-AVAILABILITY-002 — messaging failure leaves visible intent/state for retry or diagnosis rather than silent discard.
- NFR-AVAILABILITY-003 — failed jobs are operator-visible and recoverable.
- NFR-PRIVACY-001..006 — minimization, purpose separation, protected exports, analytics minimization, open retention, and future access/deletion support.
- NFR-SECURITY-004 — provider secrets remain out of source/client bundles.
- NFR-SECURITY-005 — protected/provider traffic uses secure transport.
- NFR-SECURITY-009 — sensitive actions are attributable.
- NFR-SECURITY-011 — logs/errors minimize secrets and unnecessary PII.
- NFR-RELIABILITY-003 — scheduled jobs are retry-safe.
- NFR-RELIABILITY-006 — gym-local time governs business scheduling.
- NFR-RELIABILITY-007 — deduplicated retries remain diagnosable.
- NFR-MAINTAINABILITY-003 — provider integration stays behind stable internal boundaries.
- NFR-TESTABILITY-002..005 — provider simulation, failure injection, authorization/tenant tests, and controlled time.
- NFR-OBSERVABILITY-001..007 — structured, safe, correlated request/job/provider telemetry.
- NFR-OPERATIONS-001..005 — environment separation, production-secret separation, safe releases, and operator usability.

### Decision drivers

The architecture must prioritize:

1. GymPulse-owned notification eligibility and policy;
2. channel choice independent from provider choice;
3. sender/WABA ownership explicit rather than inferred;
4. service/transactional versus marketing separation;
5. current-state and preference recheck before every delayed send;
6. deterministic business-stage dedupe;
7. tenant-safe sender/template configuration;
8. provider-observed delivery truth;
9. authenticated callbacks where supported;
10. bounded retry and permanent-error handling;
11. privacy-safe external content/logging;
12. India/WhatsApp operational fit if WhatsApp is approved;
13. onboarding/template/account operations;
14. support and account-suspension recovery;
15. transparent provider/upstream pricing;
16. provider exit without rewriting business rules.

## 3. Launch Channel Dependencies

Fresh canonical evidence does not approve a complete external launch-channel set.

Current classification:

| Channel | Current classification | Reason |
|---|---|---|
| WhatsApp | Unresolved; leading external candidate | Project context and technology evaluation make it important, but no canonical decision makes it mandatory. |
| SMS | Optional/fallback candidate only | No canonical launch requirement; fallback policy and India telecom obligations would need separate validation. |
| Email | Optional/fallback candidate only | No canonical launch requirement; D-PROVIDER-003 remains separately OPEN. |
| In-app state | Required at pilot launch as canonical product state, not as an external-provider channel | Member/Owner flows must expose authoritative GymPulse state; a dedicated notification-center feature is not implied. |
| Push | Future / not currently justified as baseline | ADR-0013 does not require push; D-PROVIDER-004 remains separately OPEN. |

Important distinction:

~~~text
supported NotificationIntent type
!=
enabled external delivery channel
~~~

FR-NOTIFICATION-001 means the product architecture can represent those service/transactional intents. It does not mean every intent must be sent over WhatsApp, SMS, or email on day one.

Legacy D-039 remains OPEN evidence only:

~~~text
candidate: WhatsApp + in-app
SMS/email optional
~~~

Task 0031 does not promote it into canonical truth.

Decision-register gap identified:

~~~text
initial launch communication channels
~~~

No canonical decision ID is invented by this ADR.

A related product/policy gap remains:

~~~text
which service notification intents are externally enabled at pilot launch
~~~

Legacy D-041 records that question but is not a normalized canonical decision.

## 4. Sender / Business Account Ownership

Fresh audit found no canonical decision for sender ownership.

### Model A — GymPulse-Owned Shared Sender

~~~text
GymPulse WABA / business sender
-> service messages on behalf of gyms
~~~

Potential advantages:

- one central integration;
- fewer onboarding paths;
- consistent GymPulse operations.

Risks:

- member-visible sender may not match the gym relationship;
- shared sender/account suspension can affect many tenants;
- one account becomes a cross-tenant operational blast radius;
- template/account policy becomes centralized;
- offboarding/branding/provider-exit become harder;
- business-account policy may not fit acting on behalf of many independent gyms.

This model is not selected.

### Model B — Gym-Owned Sender

~~~text
Gym owns its business account / phone number
-> GymPulse integrates delivery
~~~

Potential advantages:

- gym identity remains member-visible;
- tenant-specific account/sender ownership is clearer;
- offboarding and long-term portability can align with the gym.

Costs:

- per-gym onboarding;
- per-gym configuration/credentials or delegated access;
- template/account lifecycle operations;
- support and quality issues become tenant-specific.

This model is not selected.

### Model C — Provider / Platform Multi-Tenant Onboarding

~~~text
GymPulse
-> provider / BSP / Meta Tech Provider model
-> tenant-specific WABA / sender onboarding
~~~

Potential advantages:

- preserves tenant-specific brand/sender identity;
- embedded onboarding can reduce manual platform operations;
- provider subaccount/account hierarchy can isolate tenants.

Costs:

- deeper provider/platform coupling;
- onboarding and credential/account mapping complexity;
- provider exit can require sender/WABA/template migration;
- support ownership and account suspension recovery must be designed.

This model is not selected.

### Decision-register gap

~~~text
sender / WABA / phone-number ownership
~~~

This is a provider-acceptance gate.

No canonical ID is invented.

Sender ownership affects:

- member-visible identity;
- business verification;
- phone-number ownership;
- template ownership;
- billing;
- credential isolation;
- tenant offboarding;
- account suspension blast radius;
- support;
- provider migration;
- data isolation;
- branding.

## 5. Consent and Communication Policy Boundary

Canonical D-BIZ-014 remains P1 OPEN:

~~~text
How is member communication consent currently captured?
~~~

Preserve:

~~~text
Marketing Consent
!=
Service / Transactional Communication Policy
~~~

And:

~~~text
Provider template category
!=
GymPulse communication policy category
~~~

Current WhatsApp Business Messaging Policy states that a business may contact a person through WhatsApp only after the person provided their mobile number and opted in to receive subsequent WhatsApp messages from the named business; opt-out/stop requests must be respected. It also requires approved templates for business-initiated messaging outside the customer-service window.

This upstream requirement makes the sender/business identity decision material.

GymPulse may impose stricter product/privacy rules than a provider requires.

Because D-BIZ-014 remains unresolved and no reliable marketing-consent source is canonically established:

~~~text
Phase 1 marketing campaigns = not enabled by this ADR
~~~

No legal conclusion is made.

## 6. Constraints and Assumptions

1. D-PROVIDER-002 remains P1 OPEN.
2. ADR-0023 is Proposed, not Accepted.
3. WhatsApp is a leading external candidate, not a mandatory launch channel.
4. Sender/WABA/phone-number ownership is unresolved.
5. D-BIZ-014 remains OPEN.
6. Marketing is outside Task 0031's enabled delivery scope.
7. Authentication OTP transport remains separate under ADR-0008 and D-SEC-002.
8. Email-provider selection remains D-PROVIDER-003 OPEN.
9. Push-provider selection remains D-PROVIDER-004 OPEN.
10. Product analytics remains D-PROVIDER-005 OPEN.
11. Observability provider remains D-PROVIDER-006 OPEN.
12. Background-job technology remains D-ARCH-007 OPEN.
13. Provider dispatch stays outside long correctness-sensitive DB transactions.
14. A queued intent is not irrevocable permission to send.
15. A contact destination is not an authorization identity.
16. Phone number does not uniquely identify Member.
17. Provider delivery state is operational evidence, not canonical business truth.
18. Exact quiet hours remain unresolved.
19. Exact language/localization policy remains unresolved.
20. Cross-channel fallback remains unresolved.
21. No provider-specific status or template identifier becomes a domain enum/key.
22. No production account, credential, sender, template, callback, or message is created by this ADR.

## 7. Notification Trust and State Model

Canonical notification architecture:

~~~text
Business Event / Schedule
-> NotificationIntent
-> current eligibility / policy
-> current preference / destination
-> channel + business template key
-> tenant sender/template configuration
-> provider adapter
-> provider
-> provider observation callback
~~~

Provider APIs do not decide:

- who should receive a message;
- whether the message remains relevant;
- whether renewal already completed;
- whether the Member opted out;
- whether the selected destination is still current;
- whether a tenant may use a sender/template;
- whether marketing consent exists.

GymPulse decides these from canonical state and approved policy.

Critical semantic boundaries:

~~~text
Notification Sent != Member Contacted
Provider Accepted != Delivered
Delivered != Read
Read != Payment Succeeded
Delivered != Membership Renewed
Delivered != Member Returned
~~~

Business intent, provider attempt, and provider observation remain distinct concepts.

A conceptual attempt/observation model may include:

~~~text
Intent Created
Suppressed
Dispatch Pending
Submitted / Accepted
Provider Observed Sent
Provider Observed Delivered
Provider Observed Failed
Provider Observed Read    // only where supported/observed
~~~

This ADR does not finalize persistence enums/schema.

## 8. Provider Integration Boundary

Proposed provider-neutral port:

~~~text
MessagingProvider
  sendApprovedTemplate(...)
  normalizeSendResult(...)
  verifyCallback(...)
  normalizeCallback(...)
~~~

Channel-specific adapters may refine this later.

Provider-specific payloads, template IDs, sender IDs, account IDs, error codes, and callback shapes remain inside integration adapters/configuration.

Preserve:

~~~text
GymPulse Template Key
!=
Provider Template ID
~~~

Example business keys:

~~~text
no_show.care
renewal.reminder.primary
payment.success
payment.failure
owner.daily_summary
~~~

Provider configuration maps a tenant/channel/business key to the current approved provider template identity and language.

## 9. Options Considered

### Option A — Direct Meta WhatsApp Business Platform / Cloud API

Current first-party WhatsApp policy confirms:

- WhatsApp Business Platform includes the Cloud API hosted by Meta;
- business-initiated conversations require approved templates;
- a 24-hour customer-service window exists after a user message;
- opt-in and opt-out responsibilities remain with the business;
- Meta/WhatsApp may review, pause, reject, or restrict templates/accounts.

Potential strengths:

- fewest BSP layers;
- direct upstream relationship;
- direct ownership/control of Meta assets where the accepted sender model permits;
- no additional BSP abstraction required.

Potential costs/risks:

- GymPulse owns more onboarding/account/template/webhook operations;
- sender/WABA ownership must be solved first;
- multi-tenant onboarding may require becoming/operating as a Meta Tech Provider;
- upstream policy is unavoidable;
- support/escalation posture must be validated;
- current Meta Developers technical documentation was not reliably retrievable from the research environment, so direct webhook-authentication, rate-limit, and migration mechanics remain explicit acceptance-time evidence gaps rather than inferred facts.

### Option B — Twilio WhatsApp / Messaging Platform

Current Twilio documentation shows:

- direct-customer WhatsApp Self Sign-up;
- WhatsApp Tech Provider program for ISVs onboarding customers;
- customer WABAs can be mapped to dedicated Twilio subaccounts;
- one Twilio account/subaccount maps to one WABA in the current model;
- sender ownership is verified through Meta OTP/business onboarding;
- approved content/templates support business-initiated messaging;
- WhatsApp status callbacks expose channel delivery observations including read where supported;
- status callbacks can arrive out of order;
- Twilio signs webhooks with X-Twilio-Signature and documents validation;
- a WhatsApp Sandbox/test environment exists for approved test recipients;
- current public pricing is Twilio handling fee plus upstream Meta template fees.

Strengths:

- strong current documentation;
- cryptographically authenticated callback model;
- mature sandbox;
- clear ISV/subaccount multi-tenant onboarding path;
- one API platform can also support SMS if SMS is later separately approved.

Costs/risks:

- BSP fee layer;
- Twilio account/subaccount structure becomes operational coupling;
- Meta policy/template restrictions remain upstream;
- WhatsApp sender migration can involve WABA/template movement and review;
- additional channel breadth must not drive unwanted product scope.

### Option C — Gupshup

Current Gupshup documentation shows:

- direct-customer Embedded Signup;
- separate ISV/Tech Provider onboarding via Meta's Tech Provider program;
- WABA and phone-number onboarding;
- template create/approval/status/category/language lifecycle;
- template edits are re-submitted for approval;
- asynchronous send response returns a Gupshup message ID;
- message events include enqueued, failed, sent, delivered, and read where observed;
- event order may not reflect real chronology; timestamps are provided;
- webhook delivery expects quick 2xx acknowledgement and documents retry after failure;
- current public webhook guidance explicitly recommends IP allowlisting through support;
- current partner material advertises a Gupshup per-message fee starting around USD 0.001 plus upstream WhatsApp fees.

Strengths:

- India-focused BSP/partner posture;
- direct and ISV/Tech Provider onboarding models;
- strong template and delivery-event documentation;
- low public headline provider fee relative to Twilio, subject to real contract/volume/support terms.

Risks/open validation:

- public webhook material reviewed did not expose a cryptographic callback-signature contract comparable to Twilio's X-Twilio-Signature; authenticity controls therefore require explicit provider confirmation and security review;
- account/sender/template portability needs proof;
- support/escalation quality needs pilot evidence;
- public pricing is not a merchant/partner contract;
- Meta upstream policy still applies.

### Option D — Another India-focused BSP

No fourth provider is added to the active Task 0031 comparison.

Reason:

~~~text
Direct Meta + Twilio + Gupshup already span:
direct platform
global BSP / multi-channel platform
India-focused BSP / ISV partner model
~~~

The current blockers are launch channels, sender ownership, consent/service policy, and validation—not lack of candidates.

MSG91, Interakt, AiSensy, or another provider should enter only if later requirements expose a material gap.

## 10. Provider Evaluation

### Architecture / correctness

| Criterion | Direct Meta | Twilio | Gupshup |
|---|---|---|---|
| India / WhatsApp fit | Strong platform fit; operational proof required | Strong global platform fit | Strong India-oriented BSP fit |
| Sender/WABA ownership fit | Depends entirely on accepted direct/Tech Provider model | Direct customer + Tech Provider/subaccount paths documented | Direct customer + ISV/TP paths documented |
| Multi-tenant onboarding | Possible but more direct operational ownership | Strong documented customer-WABA/subaccount model | Supported ISV/TP model |
| Template lifecycle | Upstream source of truth | Twilio Content/template workflow + Meta approval | Detailed Gupshup template lifecycle + Meta approval |
| Template languages | Upstream capability; prove exact workflow | Supported via content/template variants | Supported; language selected per template |
| GymPulse service-policy independence | Strong if adapter discipline holds | Strong if adapter discipline holds | Strong if adapter discipline holds |
| Webhook authenticity | Direct technical proof required before acceptance | Strong documented X-Twilio-Signature validation | Public docs reviewed emphasize IP allowlisting; cryptographic verification requires provider proof |
| Delivery/status callbacks | Direct technical proof required | Strong; sent/delivered/read where supported | Strong; sent/delivered/read where observed |
| Out-of-order handling | Must be designed regardless | Explicitly documented possible | Explicitly documented possible |
| Message/reference IDs | Expected; acceptance proof required | Twilio Message SID | Gupshup + WhatsApp message references |
| Test model | Acceptance-time proof required | Strong sandbox/test-recipient model | Sandbox/test events documented; validate exact safe-recipient workflow |
| Credential isolation | Architecture-dependent | Parent/subaccount model can isolate tenants | Architecture-dependent; validate partner model |
| Provider portability | Highest API directness, but Meta asset lock-in remains | Medium; BSP + Meta asset migration | Medium; BSP + Meta asset migration |
| Phase 1 operational simplicity | Low-Medium | Medium-High if sender model fits | Medium-High if sender model fits |
| Current architecture conclusion | Credible candidate | Credible candidate | Credible candidate with callback-auth validation gate |

### Product / channel fit

| Criterion | Direct Meta | Twilio | Gupshup |
|---|---|---|---|
| WhatsApp service messages | Strong | Strong | Strong |
| SMS capability if later approved | Separate integration/provider choice | Available on same platform, but policy remains separate | Available through broader platform products, but policy remains separate |
| Owner summary channel flexibility | Provider-neutral design required | Can support WhatsApp; do not force channel | Can support WhatsApp; do not force channel |
| Localization/template variants | Platform-supported; exact workflow proof | Supported through approved content/template variants | Supported with template language variants |
| Marketing separation | Upstream categories exist but GymPulse policy stays separate | Upstream categories surfaced by Twilio | Upstream categories surfaced by Gupshup |
| Current product conclusion | No channel mandate | No channel mandate | No channel mandate |

### Operations / commercial

| Criterion | Direct Meta | Twilio | Gupshup |
|---|---|---|---|
| Onboarding burden | Highest direct ownership | Strong managed onboarding docs | Strong self-serve/partner onboarding docs |
| Support/escalation | Must validate Meta path | Mature support ecosystem; actual tier must be validated | India-oriented partner/support positioning; actual SLA/tier must be validated |
| Account suspension blast radius | Depends on shared vs per-gym WABA | Depends on WABA/subaccount design | Depends on WABA/app/partner design |
| Public pricing clarity | Upstream Meta rate cards; direct current technical pricing must be rechecked | High: current public fee + Meta pass-through | Medium: public partner fee + Meta fees; contract still required |
| Current public provider fee evidence | No BSP fee layer, but direct ops cost remains | USD 0.005/message handling fee + Meta fees as of Aug 2026 | Partner page advertises from about USD 0.001/message + WhatsApp fees |
| Final commercial conclusion | Quote/current rate-card review required | Merchant/ISV contract review required | Partner/merchant contract review required |

This table is GymPulse-specific and is not a universal provider ranking.

## 11. Proposed Decision

Choose Outcome D — Provider Selection Deferred.

~~~text
Production messaging provider selection
=
deferred

Reason:
launch channels unresolved
+
sender / WABA / phone ownership unresolved
+
D-BIZ-014 consent source unresolved
+
service-message external enablement unresolved
+
provider callback / onboarding / pricing / support validation still required
~~~

If WhatsApp becomes an approved pilot external channel, keep this bounded comparison set:

~~~text
Direct Meta Cloud API
Twilio WhatsApp
Gupshup WhatsApp
~~~

No leading production provider is declared.

The architecture direction is nevertheless strong:

~~~text
GymPulse-owned NotificationIntent + policy
+
canonical in-app business state
+
external channel selected by approved policy
+
business template keys independent from provider IDs
+
durable async dispatch
+
current-state / preference / destination recheck
+
deterministic business-stage dedupe
+
tenant-safe sender/template config
+
provider adapter
+
authenticated callback where provider supports it
+
provider-observed delivery truth only
+
provider-neutral history / exit
~~~

Decision confidence:

~~~text
Notification integration architecture     High
WhatsApp as serious external candidate    High
Launch external channel set               Low / unresolved
Sender/WABA ownership                     Low / unresolved
Direct Meta production preference         None
Twilio production preference              None
Gupshup production preference             None
Provider acceptance                       None
~~~

## 12. WhatsApp Delivery Model

If WhatsApp is approved:

~~~text
canonical business event / scheduled stage
-> durable NotificationIntent
-> worker reloads current canonical state
-> evaluate service-policy / preference / destination
-> resolve tenant-approved sender configuration
-> resolve GymPulse business template key
-> map to approved provider template + language
-> provider adapter send
-> persist safe attempt/provider reference
-> callback / observation processing
~~~

Business-initiated WhatsApp messaging is constrained by upstream WhatsApp template/policy rules even when using a BSP.

Preserve:

~~~text
BSP abstraction
!=
freedom from upstream WhatsApp policy
~~~

No two-way inbox/chatbot/AI-reply requirement is created.

## 13. Template and Localization Model

Preserve:

~~~text
GymPulse business template key
!=
Meta / Twilio / Gupshup template identifier
~~~

Example:

~~~text
business key: renewal.reminder.primary
channel: whatsapp
locale: approved configured locale
provider mapping: tenant-specific approved template identity
~~~

Template lifecycle is a production operational concern:

~~~text
create
-> submit
-> approve / reject
-> map
-> send
-> monitor quality/status
-> pause/disable/change
-> reapprove where required
~~~

Twilio and Gupshup both expose current template approval/lifecycle operations. Gupshup documents that edited templates are submitted again for approval and that language/template metadata have constraints.

Exact copy/language policy remains separate.

Do not decide English, Hindi, Hinglish, or tenant-configured localization through provider choice.

If multiple languages are approved later, configuration must map business template key + locale to the appropriate approved provider template.

Retain enough operational history to know which template mapping/version produced an attempt.

No template schema is finalized here.

## 14. Tenant / Sender Configuration Model

Conceptually:

~~~text
tenant / gym
-> approved messaging configuration
-> channel
-> sender / WABA / provider account
-> business-template mappings
-> allowed locale variants
~~~

This is trusted server configuration.

Callers cannot provide arbitrary:

- provider credential;
- sender;
- WABA/account;
- template ID;
- tenant mapping.

If per-gym senders are later approved:

~~~text
Gym A
must not use
Gym B sender / template / credential
~~~

Required negative validation:

~~~text
Tenant A -> Tenant B sender mapping denied
Tenant A -> Tenant B template mapping denied
~~~

Provider account/subaccount IDs are configuration locators, not authorization.

## 15. Dispatch, Retry, and Deduplication

Separate four retry layers:

~~~text
GymPulse job retry
Provider API retry
Provider internal delivery retry
Provider callback retry
~~~

They are not interchangeable.

Preserve:

~~~text
Notification Intent Dedupe
!=
Provider Attempt ID

Provider Callback Dedupe
!=
Business Notification Dedupe
~~~

A business dedupe identity may conceptually include:

~~~text
tenant/gym
recipient/member internal reference
business resource / renewal cycle
stage
channel
business intent/template key
~~~

Schema remains open.

Safe send flow:

~~~text
canonical state commit
-> durable notification intent
-> worker later evaluates
-> provider call outside long DB transaction
~~~

Failure categories should normalize to bounded internal categories such as:

- retryable/transient;
- permanent;
- policy/template;
- invalid recipient;
- rate limited;
- provider outage;
- configuration/authentication;
- unknown.

Permanent failures are not blindly retried.

Retryable failures use bounded attempts/backoff and visible terminal/dead-letter-equivalent state under ADR-0015.

Ambiguous send timeout must not automatically create a duplicate message; provider attempt/reference/idempotency capabilities should be used where available.

## 16. Delivery Callback / Status Model

Conceptual flow:

~~~text
Provider
-> callback endpoint
-> verify provider-supported authenticity
-> normalize event
-> resolve NotificationAttempt / trusted tenant config
-> dedupe callback
-> apply provider observation idempotently
~~~

Twilio:

- all Twilio HTTP requests to the application are signed with X-Twilio-Signature;
- current docs require signature validation;
- status callbacks expose MessageStatus / ErrorCode and channel-specific read events;
- callbacks may arrive out of order.

Gupshup:

- current docs expose webhook callbacks for message/user/system events;
- 2xx acknowledgement is expected quickly;
- failed acknowledgement may be retried;
- current public docs reviewed recommend inbound-IP allowlisting through support;
- no equivalent cryptographic webhook-signature contract was found in the audited public pages, so authenticity architecture remains a provider-validation gate.

Direct Meta:

- direct callback authenticity, replay, event IDs, retry semantics, and current rate-limit mechanics must be proven from retrievable current Meta technical documentation before acceptance; they are not inferred from BSP behavior.

No callback may create arbitrary Member/tenant records or select a tenant merely from a sender/template/provider account supplied in the payload.

## 17. Preference and Stale-State Suppression

Before every delayed dispatch or retry:

~~~text
reload current canonical state
+
reload current allowed contact destination
+
evaluate current preference
+
evaluate current policy
+
evaluate current business relevance
~~~

Examples:

Renewal:

~~~text
intent created yesterday
-> Member renews today
-> worker runs
-> suppress stale reminder
~~~

Preference:

~~~text
intent created
-> Member changes supported preference / opts out
-> worker runs
-> re-evaluate
-> suppress where policy requires
~~~

Contact:

~~~text
intent created for old phone data
-> verified contact changes
-> dispatch runs
-> do not blindly use stale destination
~~~

Phone number is contact data, not identity proof.

Shared/recycled numbers must not create Member-self authorization.

## 18. SMS / Email / Channel-Fallback Posture

### SMS

SMS is not established as a serious pilot-launch requirement by current canonical evidence.

Therefore Task 0031 does not select an SMS provider or create an India DLT/sender/template architecture.

If SMS is later promoted to launch/fallback scope, perform a fresh authoritative TRAI/provider review for:

- sender/header registration;
- template registration;
- service/transactional/promotional classification;
- DLT/telecom requirements;
- delivery receipts;
- opt-out/policy;
- pricing.

Do not assume WhatsApp opt-in/templates transfer to SMS.

### Email

Email remains separately governed by D-PROVIDER-003 P2 OPEN.

ADR-0023 does not select an email provider.

### Push

Push remains separately governed by D-PROVIDER-004 P2 OPEN and is not a baseline requirement under ADR-0013.

### Cross-channel fallback

No automatic:

~~~text
WhatsApp failure -> SMS
WhatsApp failure -> email
~~~

is accepted.

Fallback is a product/policy decision requiring channel eligibility, consent/preference, duplicate semantics, and message-class rules.

## 19. Authentication-OTP Separation

Preserve ADR-0008 boundary:

~~~text
Authentication OTP Channel
!=
Business Messaging Provider / Consent Policy
~~~

D-PROVIDER-002 does not select Member OTP transport.

Even if a future provider can technically deliver both, authentication verification and business/service messaging remain separately governed.

Provider Authentication template categories do not merge those responsibilities.

## 20. Security and Privacy Impact

### Threat/control matrix

| Threat | Control / status |
|---|---|
| Provider credential leakage | server-only secrets; ADR-0017 environment isolation |
| Callback forgery | provider-supported signature/request validation; weak/unclear mechanisms become acceptance risk |
| Callback replay | callback idempotency + attempt/reference correlation |
| Cross-tenant sender substitution | trusted tenant sender mapping + negative tests |
| Cross-tenant template substitution | trusted tenant template mapping + negative tests |
| Arbitrary recipient substitution | destination resolved from current approved canonical contact/policy |
| Marketing without valid consent | no Phase 1 marketing enablement; D-BIZ-014 gate |
| Stale renewal reminder | mandatory current-state recheck before send/retry |
| Duplicate message on retry | deterministic business-stage dedupe |
| Provider dashboard bypass | restrict dashboard roles; routine sends go through GymPulse policy |
| Shared sender compromise | blast-radius review before shared model acceptance |
| Tenant credential confusion | explicit tenant-account credential mapping |
| Template injection/misconfiguration | approved business-template map + restricted template administration |
| Sensitive message content | minimize external content; no private notes/health detail unless explicitly approved |
| PII in logs | no full phone/body by default; safe internal references |
| Malicious message link | link is locator only; normal auth/authorization still required |
| Account suspension | sender-model blast-radius + support/recovery gate |
| Test environment sends real messages | non-production send-disable/test-recipient controls required before implementation |
| Wrong language/template | approved mapping + locale validation |
| Fabricated status | FR-NOTIFICATION-003 provider-observed truth only |

### Message privacy

External messages can appear on lock screens/shared devices.

Avoid unnecessary:

- health-related detail;
- private follow-up notes;
- detailed financial history;
- sensitive membership reasons;
- internal staff context.

### Logging

Prefer:

~~~text
intent type
business template key
tenant/gym safe reference
channel
provider
safe attempt reference
result/error category
retry count
latency
callback observation category
~~~

Avoid by default:

~~~text
full phone number
full message body
provider secret
callback signature
personal notes
raw provider payload
~~~

### Links

Possession of a message link is not authorization.

Opening a link still requires applicable authentication, Principal/Member-self resolution, tenant/resource authorization, and canonical business checks.

URL shorteners/click tracking are not enabled by default. Product analytics remains D-PROVIDER-005.

### Privacy/regulatory posture

D-SEC-001 remains OPEN.

No claim is made that any provider or region satisfies Indian privacy/telecom law.

Provider data locations, subprocessors, retention, and contracts require privacy/legal review before production acceptance.

## 21. Reliability and Failure Handling

Preserve:

~~~text
Messaging Provider Failure
!=
Payment Failure

Messaging Provider Failure
!=
Renewal Reversal

Messaging Provider Failure
!=
Attendance Reversal
~~~

Provider outage:

~~~text
intent remains visible
-> classify failure
-> retry according to policy
-> suppress if stale before retry
-> terminal-fail visibly if appropriate
~~~

Canonical business state remains intact.

Provider API calls never hold correctness-critical DB transactions open.

An old retry always rechecks:

- business state;
- preferences;
- current contact destination;
- current tenant sender/template mapping;
- policy.

## 22. Operations and Observability

Safe telemetry should cover:

- notification intent type;
- tenant/gym safe reference;
- channel;
- provider;
- attempt reference;
- provider message reference where safe;
- suppressed/submitted/failed category;
- callback state;
- retry count;
- latency;
- error category;
- template/business key;
- configuration/sender mapping category.

Operational queues should eventually distinguish:

~~~text
intent pending
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

Raw provider errors are translated to safe operator categories.

Provider dashboards help diagnosis but do not own notification eligibility, consent, payment truth, membership truth, or retention outcomes.

Manual dashboard sends can bypass GymPulse policy/dedupe/audit and are not the routine operating model.

## 23. Pricing and Support Evaluation

Research date: 2026-09-27.

Pricing is time-sensitive.

### Upstream WhatsApp model

Current WhatsApp/BSP material reflects per-message pricing for template categories such as Utility, Authentication, and Marketing, with customer-service-window rules.

GymPulse internal service-versus-marketing policy remains independent from provider billing/category terminology.

### Twilio

Current public Twilio pricing, explicitly current as of August 2026, states:

- USD 0.005 Twilio handling fee per WhatsApp message;
- upstream Meta template fees are passed through;
- template fees vary by category/use case.

This is public evidence, not a GymPulse contract.

### Gupshup

Current Gupshup partner material advertises a fixed per-message fee starting around USD 0.001, with WhatsApp fees charged separately/at actuals.

Gupshup pricing documentation also reflects current Meta per-message category pricing.

This is public headline evidence, not a GymPulse contract.

### Direct Meta

Direct Meta avoids a BSP message-handling layer but creates greater operational ownership.

Do not infer that it is cheaper overall.

Acceptance requires a current Meta rate-card/commercial review and operational-cost assessment.

### Cost drivers

Use realistic service-message volume:

- no-show care;
- renewal reminders;
- payment success/failure;
- selected owner summaries.

Do not forecast bulk marketing volume.

### Support/escalation

Before acceptance validate:

- onboarding/business verification;
- template rejection/reclassification;
- sender/account suspension;
- API incident;
- callback delivery incident;
- billing dispute;
- credential/account security;
- migration/offboarding;
- India-hours/escalation where material.

A cheap provider with weak callback security, support, diagnostics, or tenant onboarding may be operationally more expensive.

## 24. Testing and Provider Validation

Align with ADR-0018.

Deterministic application fake should model only normalized behavior:

~~~text
accepted submission
temporary failure
permanent failure
safe provider reference
sent/delivered/read observation where supported
duplicate callback
out-of-order callback
~~~

Required later validation includes at minimum:

1. launch channel policy confirmed;
2. sender/WABA/phone ownership confirmed;
3. pilot externally enabled service-message types confirmed;
4. D-BIZ-014 consent source understood;
5. no marketing send without approved policy;
6. provider onboarding path proven;
7. safe test sender/recipient workflow proven;
8. approved template lifecycle proven;
9. template rejection/change workflow proven;
10. localization/template variants where required;
11. correct tenant sender selected;
12. cross-tenant sender denied;
13. correct provider template selected;
14. cross-tenant template/config denied;
15. valid service notification send in approved sandbox/test flow;
16. API timeout;
17. rate limit;
18. transient retry;
19. permanent failure stops blind retry;
20. duplicate job does not duplicate business-stage message;
21. renewed-before-dispatch reminder is suppressed;
22. preference change is rechecked;
23. contact change does not use stale destination;
24. valid callback;
25. forged callback rejected where supported;
26. duplicate callback is idempotent;
27. out-of-order callback is safe;
28. accepted is not represented as delivered;
29. unsupported read state is not fabricated;
30. provider outage leaves visible state;
31. payment/renewal truth survives messaging outage;
32. owner summary uses tenant-owned recipient configuration;
33. links still require GymPulse authorization;
34. provider secret absent from client;
35. provider secret absent from logs;
36. message body/contact minimized in telemetry;
37. non-production cannot message production members;
38. credential rotation procedure;
39. provider-dashboard least-privilege review;
40. shared-account/sender blast-radius review;
41. suspension recovery/support evidence;
42. realistic-volume pricing review;
43. support/escalation review;
44. sender/provider migration analysis;
45. provider exit plan.

Task 0031 executes none of these provider-resource tests.

## 25. Migration and Adoption Plan

After product/governance gates are resolved:

1. confirm initial external launch channels;
2. confirm which service intents are enabled externally;
3. confirm sender/WABA/phone ownership;
4. confirm D-BIZ-014 consent evidence;
5. choose the relevant provider comparison branch;
6. obtain sandbox/test access only after approval;
7. establish safe test recipients/senders;
8. validate template lifecycle/localization;
9. validate callback authenticity/status semantics;
10. validate dedupe/retry/stale suppression;
11. validate tenant sender/template isolation;
12. validate pricing/support/suspension recovery;
13. complete security/privacy/legal review;
14. select one provider through explicit governance;
15. provision production account/sender/credentials only after acceptance;
16. implement through the provider adapter and ADR-0017 secrets/environment boundaries;
17. perform controlled production-readiness validation.

## 26. Provider Exit and Reversibility

Keep GymPulse-owned:

~~~text
NotificationIntent
business template key
communication policy
preference/consent record
business dedupe identity
attempt/history
tenant messaging configuration identity
~~~

Keep provider-specific metadata bounded:

~~~text
provider account / subaccount
WABA / sender reference
provider template ID
provider message ID
provider callback/error fields
~~~

Sender/number/template portability is not assumed to be frictionless.

Twilio's current migration guidance shows WhatsApp sender migration can involve a new WABA and Meta template duplication/re-review, with some duplicated templates potentially rejected.

Gupshup supports phone-number migration/Embedded Signup, but exact migration/ownership behavior must be validated for the accepted model.

Provider exit plan must cover:

- phone/sender ownership;
- WABA ownership/admin access;
- template migration/reapproval;
- historical provider references;
- opt-in/preference evidence;
- callback cutover;
- tenant configuration cutover;
- rollback window;
- support/escalation.

No active-active multi-provider failover is a Phase 1 baseline.

## 27. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Provider chosen before channel policy | defer production selection |
| Shared sender silently chosen | explicit sender-ownership decision gate |
| WhatsApp assumed mandatory from legacy docs | classify it as unresolved leading candidate only |
| Marketing launched without consent evidence | no marketing enablement; D-BIZ-014 gate |
| Provider category becomes GymPulse policy | keep internal policy semantics independent |
| OTP and business messaging collapse | ADR-0008 separation |
| Stale reminder after renewal | pre-send canonical recheck |
| Opt-out after queueing ignored | pre-send preference recheck |
| Stale/recycled phone used | current allowed destination re-resolution |
| Duplicate job sends twice | business-stage dedupe |
| Provider retry multiplies sends | separate retry layers + provider attempt correlation |
| Forged callback | verify provider-supported authenticity; reject weak evidence |
| Gupshup callback authenticity unclear | acceptance-time security proof/compensating controls |
| Out-of-order status regresses state | timestamp/legal observation progression |
| Accepted shown as delivered | normalized evidence states |
| Unsupported read shown | represent only observed/supported state |
| Cross-tenant sender/template leak | trusted mappings + negative tests |
| Shared WABA suspension impacts all gyms | blast-radius analysis before model selection |
| Test sends production messages | environment/test-recipient guardrails |
| BSP marketing UI expands scope | evaluate API correctness, not campaign features |
| Provider outage corrupts business state | async isolation |
| Provider lock-in | business keys + narrow adapter + migration plan |
| Pricing changes | dated current research + pre-acceptance quote/rate review |

## 28. Revisit Triggers

Revisit when:

- pilot launch channels are canonically confirmed;
- sender/WABA ownership is approved;
- D-BIZ-014 consent source is understood;
- externally enabled service-message types are approved;
- marketing is proposed;
- SMS becomes a serious launch/fallback channel;
- email becomes launch-critical;
- push is promoted;
- multilingual requirements are approved;
- quiet-hours policy is approved;
- two-way messaging/shared inbox becomes Phase 1 scope;
- provider sandbox evidence distinguishes candidates;
- one candidate cannot satisfy callback-auth/security requirements;
- one provider materially improves per-gym onboarding/offboarding;
- commercial/support evidence changes;
- Meta policy/pricing/onboarding changes materially.

## 29. Open Questions

1. Which external channels launch in the pilot?
2. Which FR-NOTIFICATION-001 intents are actually delivered externally at pilot launch?
3. Whose WABA owns the tenant's messaging identity?
4. Who owns the phone number?
5. Is a shared GymPulse sender acceptable at all?
6. Should each gym own its sender/WABA?
7. Is an embedded Tech Provider onboarding model required?
8. How is D-BIZ-014 consent captured and evidenced?
9. What service/transactional messages are allowed without separate marketing consent under approved business/legal policy?
10. Are payment-result messages externally sent or only shown in-app initially?
11. Which channel, if any, receives owner daily summary?
12. What localization is required?
13. Are quiet hours required and for which message classes?
14. Is cross-channel fallback ever allowed?
15. If SMS is promoted, what current TRAI/DLT requirements apply?
16. What callback authenticity guarantee can Gupshup contractually/documentarily provide?
17. What direct Meta technical webhook/security model passes review?
18. Which provider gives acceptable India support/escalation?
19. What sender/account suspension recovery path is acceptable?
20. What provider/admin roles are needed?
21. What retention applies to provider attempts/message metadata?
22. Which data processing/subprocessor terms are acceptable under D-SEC-001?
23. What migration rights exist for WABA, number, and templates?
24. Which candidate should be accepted after gates close?

## 30. Decision Evidence

Research date: 2026-09-27.

### Repository evidence

- docs/01-product/functional-requirements.md — FR-NOTIFICATION-001..004, FR-CONSENT-001..002, FR-SUMMARY-001.
- docs/01-product/non-functional-requirements.md — availability, privacy, reliability, observability, operations.
- docs/01-product/user-journeys.md — renewal NotificationIntent flow and preference-change flow.
- docs/02-architecture/architecture-principles.md — async isolation, provider abstraction, failure visibility, observability, minimization.
- docs/02-architecture/technology-stack.md — D-PROVIDER-002 remains OPEN and provider selection is gated on channel/policy evidence.
- ADR-0008 — authentication OTP messaging remains separately governed.
- ADR-0009 — tenant/resource authorization remains GymPulse-owned.
- ADR-0011 — provider callback boundaries stay controlled and validated.
- ADR-0013 — push is not mandatory and business truth remains server-side.
- ADR-0015 — durable async execution owns retry/recovery semantics.
- ADR-0017 — environment and secret isolation.
- ADR-0018 — provider fake/sandbox/failure testing.
- ADR-0020 — privacy-safe operational telemetry.
- ADR-0022 — provider callbacks and operational evidence never replace canonical business truth.

Legacy evidence used only as migration input:

- docs/08-automations.md
- docs/10-notifications-whatsapp.md
- docs/12-security-audit.md
- docs/16-open-decisions.md

### WhatsApp / Meta first-party research

- https://business.whatsapp.com/policy/preview
- https://developers.facebook.com/docs/whatsapp/

Current WhatsApp Business Messaging Policy confirms Cloud API is part of the WhatsApp Business Platform, opt-in/opt-out expectations, approved templates for business-initiated messaging, the customer-service window, policy enforcement, and business responsibility for required permissions/notices.

Meta Developers technical pages were attempted during research but were not reliably retrievable from the current research environment. Direct Meta technical webhook/rate-limit/onboarding details therefore remain acceptance-time evidence gates rather than inferred facts.

### Twilio first-party research

- https://www.twilio.com/docs/whatsapp/api
- https://www.twilio.com/docs/whatsapp/self-sign-up
- https://www.twilio.com/docs/whatsapp/isv/tech-provider-program
- https://www.twilio.com/docs/whatsapp/isv/tech-provider-program/integration-guide
- https://www.twilio.com/docs/whatsapp/sandbox
- https://www.twilio.com/docs/usage/webhooks/webhooks-security
- https://www.twilio.com/docs/messaging/guides/track-outbound-message-status
- https://www.twilio.com/en-us/whatsapp/pricing
- https://www.twilio.com/docs/whatsapp/migrate-numbers-and-senders

These sources support current onboarding/WABA/subaccount behavior, sandbox constraints, template/session rules, signed webhook validation, callback status/out-of-order behavior, pricing, and migration considerations.

### Gupshup first-party research

- https://docs.gupshup.io/docs/overview
- https://docs.gupshup.io/docs/onboarding-guide
- https://docs.gupshup.io/docs/create-template
- https://docs.gupshup.io/docs/edit-template-1
- https://docs.gupshup.io/docs/message-events
- https://docs.gupshup.io/docs/what-is-a-webhook
- https://docs.gupshup.io/docs/subscriptions-and-notifications
- https://docs.gupshup.io/docs/pricing-updates-on-the-whatsapp-business-platform
- https://www.gupshup.ai/partners

These sources support current direct/ISV onboarding, template lifecycle/language/category behavior, asynchronous message references/statuses, out-of-order observations, webhook acknowledgement/retry guidance, current pricing model context, and partner positioning.

All provider pricing, templates, categories, status semantics, onboarding, rate limits, support, and platform policy are time-sensitive and must be re-verified at acceptance/implementation time.

## 31. Related Documents

- ../00-overview/assumptions.md
- ../00-overview/project-overview.md
- ../00-overview/glossary.md
- ../01-product/functional-requirements.md
- ../01-product/non-functional-requirements.md
- ../01-product/personas.md
- ../01-product/user-roles.md
- ../01-product/user-journeys.md
- ../02-architecture/architecture-principles.md
- ../02-architecture/architecture-overview.md
- ../02-architecture/system-context.md
- ../02-architecture/container-architecture.md
- ../02-architecture/component-architecture.md
- ../02-architecture/data-flow.md
- ../02-architecture/technology-stack.md
- README.md
- ADR-0008-member-authentication-method.md
- ADR-0009-authorization-implementation.md
- ADR-0011-api-contract-architecture.md
- ADR-0013-member-client-strategy.md
- ADR-0015-background-jobs-scheduler.md
- ADR-0016-hosting-deployment-platform.md
- ADR-0017-ci-cd-release-secrets.md
- ADR-0018-testing-toolchain.md
- ADR-0020-observability-provider.md
- ADR-0022-payment-provider.md
- legacy migration source: ../08-automations.md
- legacy migration source: ../10-notifications-whatsapp.md
- legacy migration source: ../12-security-audit.md
- legacy migration source: ../16-open-decisions.md
