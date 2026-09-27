# ADR-0022: Payment Provider and Integration Strategy

## Status

`Proposed`

## Decision Metadata

- ADR: `ADR-0022`
- Primary Decision ID: `D-PROVIDER-001`
- Related Decision IDs: `D-ARCH-003`, `D-ARCH-006`, `D-ARCH-007`, `D-ARCH-009`, `D-ARCH-010`, `D-ARCH-015`, `D-ARCH-018`, `D-ARCH-019`, `D-SEC-001`, `D-SEC-005`, `D-SEC-006`, `D-DATA-003`, `D-DATA-005`, `D-DATA-006`, `D-BIZ-011`, `D-BIZ-012`, `D-BIZ-013`
- Decision Owner: `Open`
- Technical Owner: `Architecture / Payments / Backend / Security`
- Business Owner: `Open / Product + Gym Owner`
- Date Proposed: `2026-09-27`
- Date Accepted: `Not accepted`
- Supersedes: `None`
- Superseded By: `None`

## 1. Context

GymPulse Phase 1 needs online member payments for renewal and optional add-on purchases in India, while preserving server-authoritative financial truth and exactly-once business effects.

The decision is broader than choosing a popular gateway.

It must answer:

> Which payment-provider direction best supports GymPulse Phase 1 member renewal/add-on payments in India while preserving server-authoritative financial truth, secure checkout, verified provider evidence, retry-safe exactly-once business effects, refunds/reversals, reconciliation, operational support, and provider replaceability?

The decision covers:

```text
provider shortlist / selection posture
+
provider-independent integration architecture
```

The current repository shortlist is Razorpay and Cashfree. Both are freshly re-evaluated in this ADR using current first-party documentation.

A material business/fund-flow dependency remains unresolved:

```text
Whose merchant account receives member funds?
```

Current canonical documentation does not establish whether:

1. each pilot gym owns the payment-provider merchant account;
2. GymPulse owns a merchant account and later handles funds for gyms; or
3. GymPulse operates a platform/sub-merchant model.

This ADR must not invent that legal/commercial role.

Therefore the provider decision can be narrowed and architected, but not safely accepted for production yet.

Canonical `D-PROVIDER-001` remains `P1 OPEN`.

## 2. Requirements and Decision Drivers

### Functional requirements

- `FR-PAYMENT-001` — canonical payment states: `Created`, `Pending`, `Paid`, `Failed`, `Refunded`, `Reversed`.
- `FR-PAYMENT-002` — online payment success is based on verified provider evidence, not a client success screen.
- `FR-PAYMENT-003` — provider callbacks are authenticated/verified.
- `FR-PAYMENT-004` — provider references/events needed for reconciliation and idempotency are retained.
- `FR-PAYMENT-005` — repeated callbacks cannot duplicate a business effect.
- `FR-PAYMENT-006` — successful renewal payment applies its membership effect exactly once.
- `FR-PAYMENT-007` — successful add-on payment applies its add-on effect exactly once.
- `FR-PAYMENT-008` — GymPulse stores no raw card or raw UPI credentials.
- `FR-PAYMENT-009` — refund/reversal history remains reconstructable.
- `FR-PAYMENT-010` — offline payment, if enabled, is a separate authorized workflow.
- `FR-RECEIPT-001..002` — receipt record/truth follows canonical verified payment state.
- `FR-RENEWAL-003..007` — server-owned commercial terms/order/payment and post-success renewal behavior.
- `FR-CROSS-001..004` — server authority, replay safety, tenant context, and time correctness.

### Non-functional requirements

- `NFR-SECURITY-007` — no raw card/UPI credentials.
- `NFR-SECURITY-008` — security-sensitive webhooks are verified before canonical mutation.
- `NFR-SECURITY-009..011` — attributable sensitive actions, abuse controls, safe errors/logging.
- `NFR-PRIVACY-001` — minimize retained personal/provider data.
- `NFR-PRIVACY-005` — retention remains open.
- `NFR-RELIABILITY-001` — retry-safe critical effects.
- `NFR-RELIABILITY-002` — verified payment effect exactly once.
- `NFR-RELIABILITY-004` — DB backstops where practical for provider-event/business-effect uniqueness.
- `NFR-RELIABILITY-005` — canonical payment truth is server-side.
- `NFR-RELIABILITY-007` — deduplicated retries remain diagnosable.
- `NFR-RELIABILITY-008` — reconciliation after provider/network interruption.
- `NFR-AVAILABILITY-001` — integration failure must not corrupt canonical data.
- `NFR-PERFORMANCE-005` — slow provider calls stay outside long correctness-sensitive DB transactions.
- `NFR-OBSERVABILITY-004` — webhook/payment/reconciliation failures must be diagnosable.
- `NFR-MAINTAINABILITY-003` — provider-specific integration stays behind internal abstraction.
- `NFR-TESTABILITY-002..003` — provider simulation and failure injection.
- `NFR-OPERATIONS-001..002` — environment and production-secret separation.

### Primary decision drivers

1. financial correctness before checkout convenience;
2. server-side order/payment creation using canonical amount/currency/purpose;
3. provider-managed payment credential handling where practical;
4. browser-first Member delivery;
5. current India/UPI fit;
6. raw webhook verification;
7. duplicate and out-of-order event safety;
8. status lookup/reconciliation;
9. refund/reversal visibility;
10. settlement traceability;
11. sandbox quality;
12. operational support/escalation;
13. merchant onboarding/KYC fit;
14. commercial terms;
15. provider replaceability;
16. no provider semantics in domain state.

## 3. Business and Merchant-Settlement Dependencies

### 3.1 Merchant / settlement ownership finding

Fresh repository audit found no canonical decision establishing merchant-account ownership or settlement beneficiary.

This gap is decision-critical.

Possible models remain:

#### Model A — Gym-Owned Merchant Account

```text
Member
-> payment provider
-> pilot gym merchant account
-> settlement to gym
```

GymPulse acts as the software/integration layer.

This is the least legally expansive model to use as an **evaluation assumption only**, but it is not accepted by this ADR.

#### Model B — GymPulse-Owned Merchant Account

```text
Member
-> provider
-> GymPulse merchant account
-> funds later handled for gym
```

This could materially change commercial, regulatory, accounting, tax, refund, settlement, onboarding, and operational obligations.

It is not selected.

#### Model C — Platform / Sub-Merchant Model

```text
GymPulse platform
-> provider platform/marketplace capability
-> onboard gym/sub-merchant
-> route/settle funds under approved model
```

This is a distinct payments architecture and is not selected.

### 3.2 Decision-register gap

```text
New decision-register gap identified:
merchant account / settlement ownership
```

This ADR does **not** invent a new canonical decision ID.

Canonical governance should register this gap in a later bounded task if the existing business decision model does not gain an explicit owner/question first.

### 3.3 Other open business dependencies

- `D-BIZ-011` — cancellation/refund policy remains `OPEN`.
- `D-BIZ-012` — offline payment methods/authority remains `OPEN`.
- `D-BIZ-013` — receipt/invoice fields remain `OPEN`.
- launch online payment methods are not canonically fixed;
- merchant-specific commercial terms are not confirmed;
- settlement/support expectations are not confirmed;
- exact pilot merchant legal entity/onboarding documents are not confirmed.

Business/legal validation is required before production provider acceptance.

## 4. Constraints and Assumptions

1. `D-PROVIDER-001` remains `P1 OPEN`.
2. `ADR-0022` is `Proposed`, not `Accepted`.
3. No provider is selected for production.
4. No merchant-of-record role is assigned to GymPulse.
5. No merchant/sub-merchant/platform fund-flow model is accepted.
6. `D-BIZ-011`, `D-BIZ-012`, and `D-BIZ-013` remain independently governed.
7. `D-SEC-001` remains `P0 OPEN`; this ADR makes no legal/privacy conclusion.
8. `D-SEC-005` and `D-SEC-006` remain open for deletion/export authority and retention.
9. `D-DATA-003` remains Proposed: money uses integer minor units plus currency code.
10. `D-DATA-005` remains Proposed: critical provider events retain immutable external references.
11. `D-DATA-006` remains Proposed: financial history is not hard-deleted for reporting cleanliness.
12. No raw card number, CVV, UPI PIN, or raw UPI credential is stored/logged.
13. Payment-provider network calls stay outside long local DB transactions.
14. Client callbacks/return URLs are UX/navigation signals only.
15. Webhook verification uses provider-supported authenticity material before canonical mutation.
16. Provider dashboard state may support investigation but is not an automatic GymPulse mutation source.
17. Automatic active-active gateway failover is not a Phase 1 baseline.
18. UPI AutoPay/subscription mandates are not a confirmed Phase 1 requirement.
19. Native SDK capability is not a selection driver for the browser-first Member baseline.
20. Exact provider API/SDK version is not pinned by this ADR.
21. Public pricing is evidence only; negotiated/commercial terms may differ.
22. Sandbox success is not production reliability proof.

## 5. Canonical Payment Trust Model

Canonical payment states remain:

```text
Created
Pending
Paid
Failed
Refunded
Reversed
```

Core invariants:

```text
Provider Payment State
!=
GymPulse Payment State

Client Success
!=
Canonical Payment Success

Payment Return / Redirect
=
navigation + UX signal

Customer Payment Success
!=
Merchant Bank Settlement Complete

Provider Event Dedupe
!=
Business Effect Exactly Once
```

Canonical flow:

```text
Member selects renewal/add-on
-> trusted server re-evaluates eligibility/price/terms
-> canonical order + Payment Created/Pending
-> commit local correctness transaction
-> create provider checkout/order context
-> Member completes provider-managed checkout
-> verified provider evidence arrives or is fetched
-> validate payment identity + amount + currency + purpose + tenant/resource
-> normalize provider evidence
-> legal GymPulse payment transition
-> exactly-once membership/add-on effect
-> receipt/business continuation
```

A provider outage, callback delay, client refresh, or lost return must never cause GymPulse to guess `Paid`.

## 6. Provider Integration Boundary

GymPulse should depend on a narrow provider-independent port, conceptually:

```text
PaymentProvider
  createCheckout(...)
  verifyCallback(...)
  normalizeEvent(...)
  fetchPaymentStatus(...)
  initiateRefund(...)       // only if approved
  fetchRefundStatus(...)    // where required
```

The port represents GymPulse-required capabilities, not every feature offered by every gateway.

Provider-specific objects remain inside adapters:

```text
Razorpay Order / Payment / Refund
Cashfree Order / Payment / Refund
!=
GymPulse domain entities
```

Provider-specific statuses/enums never become canonical domain enums by direct import.

## 7. Providers Considered

### 7.1 Razorpay

Current official documentation reviewed shows:

- server-side Orders API before checkout;
- Standard Checkout for browser integration;
- checkout-return payment/order/signature fields;
- server-side signature verification;
- webhook HMAC verification using the raw request body;
- unique `x-razorpay-event-id` for duplicate detection;
- at-least-once webhook behavior;
- events may arrive out of order;
- webhook retry with exponential backoff for up to 24 hours after event creation;
- provider payment/order/refund fetch APIs can supplement asynchronous webhook confirmation;
- refund APIs/webhooks plus normal/instant refund products;
- settlement views/reports/APIs;
- India UPI support including Intent/QR-oriented flows;
- test mode and test webhooks;
- public standard pricing/commercial material, subject to current offers and merchant-specific terms.

Strengths for GymPulse:

- unusually explicit webhook failure/retry/order documentation;
- straightforward order/payment reference model;
- strong server-verification story;
- good fit with the browser-first Member flow;
- mature reconciliation and settlement evidence.

Open validation:

- actual pilot UPI behavior on Android and iPhone/Safari;
- merchant onboarding eligibility;
- merchant-specific fees/settlement;
- support/escalation quality;
- refund behavior under pilot policy;
- exact merchant/fund-flow model.

### 7.2 Cashfree

Current official documentation reviewed shows:

- server-side order creation;
- client `payment_session_id` used for hosted/JS checkout;
- after redirect/callback, server fetches order-payment status;
- payment outcomes include success/pending/failure categories;
- webhook signature and timestamp verification;
- current first-party guidance requires raw-body verification and idempotent processing;
- duplicate/delayed event handling is expected;
- UPI Intent and Dynamic QR are supported; current provider materials also describe Collect, but current 2026 guidance warns that Collect is being deprecated/restricted for most use cases;
- refund/status capabilities exist;
- settlement/reconciliation reports and merchant settlement flows exist;
- sandbox/test integration is available;
- merchant onboarding/KYC and bank-account verification are required for production;
- current public pricing includes promotional terms and mutually agreed platform fees.

Strengths for GymPulse:

- clear browser checkout + server status verification flow;
- strong UPI product coverage;
- strong settlement/reconciliation positioning;
- sandbox/dev-studio tooling;
- provider migration guidance aligns with preserving internal order/payment/provider references.

Open validation:

- exact production webhook retry schedule/timeout contract;
- actual pilot UPI behavior on Android and iPhone/Safari;
- merchant-specific pricing and settlement;
- onboarding eligibility;
- support/escalation quality;
- refund lifecycle under pilot requirements;
- merchant/fund-flow model.

### 7.3 Third candidate

No third provider is added to the active Phase 1 shortlist.

Reason:

```text
Razorpay + Cashfree already cover the required technical decision space,
while the dominant blockers are business/fund-flow/commercial validation,
not lack of a technically credible India gateway.
```

PhonePe Payment Gateway, PayU, or another India-capable provider should be added only if later evidence exposes a material shortcoming in this shortlist or a merchant/commercial requirement creates a clear advantage.

## 8. Provider Evaluation

### Architecture / correctness scorecard

| Criterion | Razorpay | Cashfree |
|---|---|---|
| Server-side order/payment context | Strong | Strong |
| Browser-first checkout | Strong | Strong |
| Canonical status can be server-verified | Strong | Strong |
| Webhook authenticity | Strong; HMAC/raw-body documented | Strong; signature + timestamp/raw-body guidance |
| Duplicate-event handling | Strong; event ID + at-least-once explicit | Strong; idempotent duplicate handling required |
| Out-of-order guidance | Explicitly documented | Must be handled; validate exact event-order semantics in sandbox/docs |
| Webhook retry contract | Explicit 24-hour exponential-backoff documentation | Confirm exact production contract during validation |
| Status/reconciliation API | Strong | Strong |
| Refund capability | Strong | Strong |
| Settlement/reconciliation evidence | Strong | Strong |
| Provider-reference model | Strong | Strong |
| Provider adapter fit | Strong | Strong |
| Architecture conclusion | Suitable for bounded sandbox | Suitable for bounded sandbox |

### Product / UX scorecard

| Criterion | Razorpay | Cashfree |
|---|---|---|
| India / UPI fit | Strong | Strong |
| Mobile UPI Intent | Supported | Supported |
| Desktop/dynamic QR | Supported | Supported |
| Browser checkout | Strong | Strong |
| Android UPI handoff | Must device-test | Must device-test |
| iPhone/Safari path | Must device-test | Must device-test |
| Collect-flow reliance | Do not use as baseline | Do not use as baseline despite currently marketed support |
| Native SDK importance for Phase 1 | Low | Low |
| Payment-method breadth | Broad; only pilot methods matter | Broad; only pilot methods matter |
| Product conclusion | Suitable for browser-first pilot validation | Suitable for browser-first pilot validation |

### Operations / commercial scorecard

| Criterion | Razorpay | Cashfree |
|---|---|---|
| Sandbox/test mode | Strong | Strong |
| Merchant onboarding/KYC | Required | Required |
| Settlement reporting | Strong | Strong |
| Current public standard pricing | Around 2% platform fee + applicable GST; current promotions may apply | Standard/promotional pricing varies; platform fee may be mutually agreed |
| Final commercial terms | Merchant validation required | Merchant validation required |
| Support/escalation | Validate with merchant onboarding/pilot | Validate with merchant onboarding/pilot |
| Merchant ownership model fit | Cannot conclude until fund-flow decision | Cannot conclude until fund-flow decision |
| Production readiness conclusion | Blocked by business/commercial/sandbox gates | Blocked by business/commercial/sandbox gates |

This is a GymPulse-specific evaluation, not a universal provider ranking.

## 9. Proposed Decision

Choose **Outcome B — Sandbox Shortlist**.

```text
Razorpay
+
Cashfree
remain the bounded Phase 1 sandbox shortlist.

No production provider is selected or accepted.
```

Provider preference remains intentionally unresolved because the highest-impact inputs are not yet approved:

- merchant account / settlement ownership;
- launch payment methods;
- refund/cancellation policy;
- receipt/invoice requirements;
- merchant onboarding eligibility;
- negotiated pricing/settlement terms;
- sandbox correctness evidence;
- support/escalation confidence.

Architecture direction is stronger than provider preference:

```text
provider-managed browser checkout
+
server-created provider order/payment context
+
canonical server-owned amount/currency/purpose
+
provider-specific verification adapter
+
raw webhook verification
+
provider event dedupe
+
GymPulse canonical Payment state
+
separate business-effect uniqueness
+
status/reconciliation API
+
provider-neutral application port
```

Decision confidence:

```text
Integration architecture: High
Razorpay suitability for sandbox: High
Cashfree suitability for sandbox: High
Production provider preference: Low / intentionally unresolved
Provider acceptance: None
```

## 10. Merchant / Settlement Model

The evaluation can proceed under a provisional **Model A compatibility test**:

```text
gym-owned merchant account
-> provider settles to gym
-> GymPulse integrates payment workflow
```

This is an evaluation model only, not an accepted business/legal decision.

Do not configure Model B or C until merchant/fund-flow ownership is explicitly approved.

If a future platform/sub-merchant architecture is chosen, reopen provider evaluation for:

- sub-merchant onboarding;
- linked/vendor accounts;
- split settlement;
- platform fees/commissions;
- refund allocation;
- settlement routing;
- KYC/account ownership;
- regulatory/accounting/tax implications.

No legal conclusion is made here.

## 11. Checkout and UPI Model

### Browser-first Phase 1 posture

Prefer provider-managed checkout or provider-managed payment UI that minimizes GymPulse handling of payment credentials.

Prioritize:

```text
responsive Member web
+
Android browser
+
iPhone Safari
+
UPI app handoff
+
safe return-to-browser
```

### UPI posture

Do not implement a legacy/manual-Collect-centric architecture.

Current provider evidence and 2026 guidance support making these the primary sandbox paths:

```text
mobile browser
-> UPI Intent / supported app handoff

desktop / second-device scenario
-> dynamic UPI QR
```

Current Cashfree materials still expose Collect while its 2026 first-party guidance also notes deprecation/restriction for most use cases. Razorpay also exposes multiple UPI flows across current product material.

Because product/regulatory behavior is changing:

```text
UPI Collect historical behavior
!=
safe 2026 implementation assumption
```

Before production, verify the exact allowed/supported UPI flows for the merchant category using current provider documentation and authoritative NPCI/RBI material.

No UPI AutoPay requirement follows from renewal.

## 12. Provider Order / Payment Reference Model

GymPulse preserves canonical identities independently:

```text
RenewalOrder / AddOnOrder
Payment
PaymentAttempt where implementation later requires it
```

Provider references are external evidence:

```text
provider
provider order/reference
provider payment/reference
provider event/reference
provider refund/reference
settlement/reconciliation reference where relevant
```

Do not assume:

```text
GymPulse RenewalOrder ID
=
Provider Payment ID
```

Canonical `D-DATA-005` direction requires critical provider references to remain immutable enough for reconciliation.

Provider IDs must never authorize tenant/member access by themselves.

## 13. Webhook Verification Model

Conceptual path:

```text
Provider
-> raw callback bytes + relevant headers
-> provider-specific authenticity verification
-> normalized verified evidence
-> resolve canonical Payment + tenant/resource
-> validate amount/currency/purpose/reference
-> dedupe provider event
-> apply legal canonical transition
-> apply business effect exactly once
-> persist diagnostics/evidence
```

No canonical mutation is allowed before verification.

Razorpay requires signature verification using the raw body and `X-Razorpay-Signature`.

Cashfree uses a webhook signature plus timestamp and current guidance requires the raw request payload for verification.

Webhook/API architecture must preserve raw verification material before destructive body normalization.

Secrets remain server-only.

## 14. Canonical State Mapping

Provider states are normalized into evidence, not copied into GymPulse state.

Illustrative mapping policy:

| Provider evidence category | GymPulse interpretation |
|---|---|
| checkout/order merely created | `Created` or `Pending` according to canonical workflow |
| payment processing/authorized but not final under accepted provider semantics | `Pending` |
| verified final success/captured/success with expected amount/currency/purpose | eligible for `Paid` transition |
| verified final failure | `Failed` if legal from current state |
| verified refund completion/evidence | refund history + legal `Refunded` transition where policy applies |
| provider reversal evidence | reversal history + legal `Reversed` transition where semantics match |
| unknown/ambiguous status | remain `Pending` / reconciliation-required; never guess success |

Exact provider-state mappings must be proven by adapter contract tests and current provider docs before production.

A stale event cannot regress a newer legal state merely because it arrived later.

## 15. Idempotency and Exactly-Once Effects

Three separate layers are required:

```text
1. provider-event identity / duplicate delivery

2. canonical Payment transition

3. payment-purpose business-effect uniqueness
```

Examples:

```text
same successful webhook delivered twice
-> process event at most once
-> membership still extended once

different valid provider events for same successful payment
-> canonical Payment remains one logical success
-> membership/add-on effect still occurs once

reconciliation finds success after lost webhook
-> same canonical transition path
-> same business-effect uniqueness
```

Provider-native idempotency features strengthen integration but do not replace GymPulse logical idempotency.

Checkout creation must also be retry-safe.

Ambiguous provider-create timeout:

```text
timeout
!=
definite failure
```

Do not blindly create a second chargeable attempt until provider/internal state is reconciled.

## 16. Reconciliation Model

Webhooks alone are insufficient.

Required conceptual flow:

```text
Pending / Ambiguous Payment
-> immutable provider references
-> trusted status lookup / provider evidence
-> verify + normalize
-> validate amount/currency/purpose
-> same legal canonical transition
-> same exactly-once business effect
-> record reconciliation result
```

Reconciliation must cover:

- lost callback;
- delayed callback;
- ambiguous checkout/order creation;
- stuck `Pending`;
- provider says success while GymPulse effect failed;
- amount/currency mismatch;
- refund status;
- operator investigation.

Provider dashboard is diagnostic evidence, not an automatic state-mutation mechanism.

## 17. Refund and Reversal Model

Refund **capability** is part of provider evaluation.

Refund **entitlement/policy** remains `D-BIZ-011 OPEN`.

Conceptual flow if refunds are enabled:

```text
authorized GymPulse actor
-> payment.refund capability
-> approved business refund policy
-> canonical refund intent/history
-> provider adapter
-> provider
-> verified refund state/evidence
-> canonical financial history
-> approved membership/add-on consequence
```

Rules:

- original payment is never silently deleted;
- provider dashboard refund capability does not authorize a GymPulse refund;
- provider refund response acceptance does not necessarily mean money has reached the customer;
- refund status must be queryable/reconcilable;
- full versus partial refund support is evaluated only against actual product need;
- partial refunds remain non-baseline unless business policy promotes them;
- provider reversal semantics are not automatically equivalent to GymPulse refund semantics.

No refund implementation is created.

## 18. Settlement and Financial Operations

Settlement is operational/financial evidence separate from customer payment success.

```text
Customer Payment Success
!=
Merchant Bank Settlement Complete
```

A verified successful payment may apply membership/add-on entitlement before bank settlement, unless future approved business rules explicitly say otherwise.

Provider evaluation requires evidence for:

- settlement schedule;
- settlement status/reference;
- payment-to-settlement traceability;
- settlement reports/API;
- fees/taxes/deductions;
- refund/adjustment relationship;
- target bank/merchant account;
- instant/on-demand settlement only if useful.

Current public documentation from both candidates exposes settlement/reporting capabilities.

Exact settlement terms are merchant/business specific and must be validated during onboarding/commercial review.

## 19. Authentication / Authorization Relationship

Payment initiation is an authenticated and authorized GymPulse business operation.

The trusted server controls:

- current Member identity/relationship;
- tenant/resource scope;
- eligible renewal/add-on order;
- canonical amount;
- currency;
- purpose;
- current order state.

If Member web later uses cookie-based sessions, normal CSRF protections still apply to payment-initiation commands.

Provider callbacks are different:

```text
Provider webhook
!=
Member session
!=
Staff role
```

Callback trust is based on provider authenticity verification plus internal reference/resource resolution.

Verified provider context grants no generic application capability.

Refunds, offline payments, manual reconciliation, and sensitive financial operations require separately authorized GymPulse capabilities and audit semantics.

## 20. Client / Member Experience

Payment return is navigation.

After provider UI closes/redirects:

```text
Member returns to GymPulse
-> client shows Processing/Pending where needed
-> refresh canonical GymPulse payment status
-> server may reconcile/provider-fetch if justified
-> render Paid/Failed/Pending from canonical state
```

Test:

- user cancels;
- closes checkout;
- refreshes;
- loses network;
- UPI app switch/return;
- webhook arrives late;
- client misses success callback;
- user returns later.

Never grant membership/add-on value from a browser callback.

## 21. Security and Privacy Impact

### Threat/control matrix

| Threat | Required control |
|---|---|
| Client-forged success | canonical success only from verified server/provider evidence |
| Amount/currency tampering | amount/currency/purpose derived server-side and revalidated on provider evidence |
| Cross-tenant/member payment access | ADR-0009 capability/Member-self + trusted resource scope |
| Webhook forgery | raw-body provider signature/authenticity verification |
| Webhook replay/duplicate | event identity + idempotent processing |
| Out-of-order event | legal state transitions; do not trust arrival order |
| Provider reference substitution | resolve internal Payment + expected provider references/tenant/purpose |
| Unknown provider payment | no entitlement; safe diagnostic/reconciliation path |
| API/webhook secret exposure | server-only secret facilities, no logs/client bundles |
| Provider dashboard compromise | least-privilege team access, MFA/2FA where supported, audit/activity review |
| Manual dashboard refund bypass | restrict dashboard access; reconciliation/audit for emergency actions |
| Duplicate charge after timeout | logical idempotency + status reconciliation before new attempt |
| Raw payload PII leakage | minimize persistence/logging; bounded retention if evidence retained |
| Malicious return parameters | treat as untrusted navigation input |
| Third-party checkout script risk | narrow integration/CSP review; prefer provider-managed credential capture |
| Preview using production keys | environment separation under ADR-0017 |

### Payment credential boundary

Never persist or log:

```text
card number
CVV
UPI PIN
raw UPI credential
provider API secret
webhook secret
```

Provider payloads may include names, emails, phone numbers, bank/payment identifiers, or method metadata. Retain only what is justified for support/reconciliation/history.

No legal PCI-scope conclusion is made by this ADR.

## 22. Reliability and Failure Handling

Required failure behavior:

### Provider order/checkout timeout

```text
unknown outcome
-> Pending / reconciliation
-> status lookup before duplicate attempt
```

### Provider unavailable

```text
Provider Unavailable
!=
Payment Paid
```

Show retry/help/unavailable based on actual state.

### Webhook delayed/lost

Use provider status/reconciliation path.

### Duplicate webhook

Acknowledge/process idempotently; no duplicate business effect.

### Out-of-order webhook

Ignore stale regression; use legal transitions/current provider evidence.

### DB failure during callback

Return failure according to provider contract so retry/reconciliation remains possible; do not lose canonical correctness.

### Response lost after DB commit

Provider retry may occur; dedupe against persisted event/transition/effect evidence.

### No automatic cross-provider failover

Do not perform:

```text
Provider A timeout
-> immediately charge through Provider B
```

This can duplicate charges.

Provider abstraction is for replaceability/evolution, not automatic multi-gateway charging.

## 23. Observability and Operational Support

Safe payment diagnostics should include:

```text
canonical payment ID
provider category/name
safe provider reference
checkout creation outcome
webhook verification category
provider event identity category
duplicate-event outcome
canonical transition result
business-effect result
reconciliation attempt/result
provider latency/error category
refund status
settlement reconciliation status where useful
correlation/request/job ID
```

Do not log:

- API key;
- webhook secret/signature material beyond safe diagnostics;
- raw payment credential;
- full sensitive provider payload;
- unnecessary Member PII.

Operational views later need to surface:

- stuck `Pending`;
- provider success but GymPulse unresolved;
- `Paid` but business effect failed;
- duplicate/invalid provider events;
- amount/currency/reference mismatch;
- refund pending/failure;
- unmatched settlement.

Provider dashboards may assist incident investigation, but routine GymPulse staff must not receive provider-admin credentials.

## 24. Testing and Sandbox Validation

Future deterministic provider fake should model only GymPulse-required semantics:

```text
checkout created
pending
verified success
failure
timeout
duplicate event
out-of-order event
refund result
status reconciliation
```

Each shortlisted provider must later prove in sandbox/test mode:

1. server-created order/checkout context;
2. canonical amount cannot be client-overridden;
3. Android browser UPI Intent/app handoff;
4. iPhone/Safari supported flow;
5. desktop QR where applicable;
6. user cancellation;
7. client false-success attempt;
8. browser refresh/close/network loss;
9. provider create timeout and safe retry/reconciliation;
10. valid webhook;
11. forged/malformed webhook;
12. raw-body signature verification;
13. wrong secret/signature;
14. duplicate event;
15. delayed event;
16. out-of-order event;
17. unknown payment reference;
18. wrong amount/currency/purpose;
19. `Pending -> Paid` canonical transition;
20. stale event cannot regress `Paid`;
21. exactly-once membership effect;
22. exactly-once add-on effect;
23. callback DB failure/retry;
24. response lost after DB commit;
25. status API reconciliation;
26. missing-webhook reconciliation;
27. refund status flow if required;
28. settlement report/payment mapping;
29. sandbox/production config isolation;
30. secrets absent from client/logs;
31. provider exit/reference strategy.

```text
Sandbox Success
!=
Production Reliability Proof
```

No provider account or sandbox transaction is created by this ADR.

## 25. Commercial / Support Evaluation

Architecture and commercial evaluation remain separate.

### Pricing

Current public evidence is time-sensitive:

- Razorpay publicly advertises a standard platform-fee model around 2% plus applicable GST, with changing promotional offers and custom/enterprise terms.
- Cashfree public pages advertise standard/promotional pricing that changes over time; its platform fee may be mutually agreed with the merchant.

Therefore:

```text
public headline pricing
!=
final merchant commercial terms
```

Before provider acceptance, obtain merchant-specific confirmation for:

- transaction/platform fees by required payment method;
- GST/tax treatment of provider fees;
- refund-related charges;
- instant/on-demand settlement charges if relevant;
- setup/maintenance or plan fees where applicable;
- settlement cycle;
- reserve/risk conditions where applicable.

### Support

Validate actual merchant support/escalation for:

- account activation/KYC;
- payment incident;
- webhook delivery;
- settlement mismatch;
- refund issue;
- production outage;
- credential/account security.

Documentation/support marketing is not sufficient proof of pilot escalation quality.

## 26. Migration and Adoption Plan

After required business gates are resolved:

1. confirm merchant account / settlement ownership;
2. confirm launch payment methods;
3. confirm refund/cancellation policy;
4. confirm receipt/invoice requirements;
5. obtain sandbox access for Razorpay and Cashfree;
6. run identical provider contract scenarios;
7. validate Android/iPhone/browser UPI paths;
8. validate raw-body webhook verification;
9. validate duplicate/out-of-order/retry behavior;
10. validate status reconciliation and ambiguous timeout recovery;
11. validate refund lifecycle where in scope;
12. validate settlement reports/payment mapping;
13. compare merchant-specific commercial terms;
14. validate support/escalation;
15. conduct security/privacy review;
16. choose one production provider through explicit governance approval;
17. create production credentials only after acceptance;
18. implement via provider adapter and ADR-0017 environment/secret controls;
19. perform controlled production-readiness checks;
20. monitor first production transactions/reconciliation tightly.

Task 0030 performs none of these implementation steps.

## 27. Provider Exit and Reversibility

Canonical financial history stays GymPulse-owned.

Historical records retain original provider identity:

```text
historical Payment A
provider = Razorpay

future Payment B
provider = Cashfree
```

or vice versa.

Provider migration must not rewrite old references as if historical payments occurred through the new provider.

Preserve:

- canonical Payment/order identity;
- provider identity;
- immutable provider order/payment/event/refund references;
- normalized canonical state/history;
- settlement/reconciliation evidence where required;
- provider adapter boundary;
- exportable reports/reference inventory.

Provider-specific checkout, verification, event, refund, and settlement code stays inside adapters.

No active-active abstraction is required.

## 28. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Provider selected before fund-flow model | keep Razorpay/Cashfree as sandbox shortlist only |
| GymPulse silently becomes merchant of record | explicitly prohibit assumption; business/legal validation required |
| Client success grants entitlement | verified server/provider evidence only |
| Client changes amount/currency | server-derived commercial values + provider evidence validation |
| Webhook forgery | provider-specific raw-body verification |
| Duplicate callback duplicates renewal | provider-event dedupe + separate effect uniqueness |
| Out-of-order callback regresses state | legal transition model + reconciliation |
| Ambiguous timeout creates duplicate charge | Pending/Unknown + lookup before new attempt |
| Provider outage causes fake success | no success without verified evidence |
| Refund semantics overwrite original payment | immutable refund/reversal history |
| Dashboard refund bypasses GymPulse policy | restrict dashboard; reconcile/audit emergency actions |
| UPI integration uses stale Collect tutorial | Intent/QR-first sandbox validation + current regulatory/provider review |
| Fees dominate decision | separate architecture, UX, commercial scorecards |
| Sandbox overconfidence | production-readiness validation after provider acceptance |
| Provider lock-in | narrow adapter + canonical IDs/state/history |
| Sensitive provider payload leaks | minimization + safe logging + retention policy |
| Automatic multi-provider failover double-charges | no Phase 1 active-active charging |

## 29. Revisit Triggers

Revisit provider direction when:

- merchant/settlement ownership is approved;
- pilot launch methods are confirmed;
- refund/cancellation policy is approved;
- receipt/invoice requirements are approved;
- sandbox evidence materially distinguishes Razorpay from Cashfree;
- negotiated pricing/settlement/support materially differs;
- one provider cannot support the approved merchant model;
- production support/escalation evidence is inadequate;
- UPI rules/provider behavior materially change;
- automatic renewal/UPI AutoPay becomes real scope;
- platform/sub-merchant/split-settlement becomes approved product architecture;
- international/cross-border payments become Phase 1 scope;
- reliability evidence justifies multi-provider routing.

## 30. Open Questions

1. Whose merchant account receives member funds?
2. Which legal/business entity is the provider merchant?
3. Does GymPulse remain software-only for fund flow, or is a platform/sub-merchant model required later?
4. Which payment methods are required at pilot launch?
5. Is UPI sufficient initially, or are cards/netbanking required?
6. Which current UPI flows are approved/supported for the actual merchant category?
7. What refund/cancellation policy will `D-BIZ-011` establish?
8. Are partial refunds needed at all?
9. What offline payment policy will `D-BIZ-012` establish?
10. What receipt/invoice fields will `D-BIZ-013` establish?
11. Which merchant-specific Razorpay/Cashfree commercial terms apply?
12. What settlement timing/report detail does the gym/accountant require?
13. Which provider gives acceptable onboarding/support/escalation to the pilot gym?
14. How much raw/sanitized provider event evidence should be retained under `D-SEC-006`?
15. Who may access provider dashboards in production?
16. Does the pilot require finance/accountant operational access beyond Owner views?

## 31. Decision Evidence

Research date: `2026-09-27`.

### Repository evidence

- `docs/01-product/functional-requirements.md` — `FR-PAYMENT-001..010`, `FR-RECEIPT-001..002`.
- `docs/01-product/non-functional-requirements.md` — payment security, idempotency, reconciliation, observability, operations.
- `docs/01-product/user-journeys.md` — `JRN-009`, `JRN-010`, `JRN-011`, `JRN-012`, `JRN-013`.
- `docs/01-product/personas.md` — Member secure-payment/server-verification expectations and Owner payment-exception operations.
- `docs/02-architecture/technology-stack.md` — Razorpay/Cashfree current shortlist and sandbox-first recommendation.
- `ADR-0009` — authorization stays GymPulse-owned.
- `ADR-0011` — provider callback verification and provider-independent API contract.
- `ADR-0013` — browser-first Member delivery; client payment result is not proof.
- `ADR-0014` — raw callback verification boundary.
- `ADR-0015` — durable payment reconciliation/recovery.
- `ADR-0017` — environment/secret separation.
- `ADR-0018` — provider fake/sandbox/failure evidence.
- `ADR-0020` — payment diagnostics without secret/payload leakage.
- `ADR-0021` — receipt record/truth does not imply persisted PDF.

### Razorpay official research

- https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/
- https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/
- https://razorpay.com/docs/webhooks/validate-test/
- https://razorpay.com/docs/webhooks/best-practices/
- https://razorpay.com/docs/payments/refunds/
- https://razorpay.com/docs/payments/settlements/
- https://razorpay.com/pricing/
- https://razorpay.com/upi/
- https://razorpay.com/upi-payment-gateway-india/
- https://razorpay.com/payment-gateway/

Current evidence confirms server-side order creation, browser checkout, signature/webhook verification, raw-body requirements, duplicate/out-of-order handling, webhook retry semantics, status API support, refunds, settlements, UPI/browser support, test mode, and current public commercial material.

### Cashfree official research

- https://www.cashfree.com/devstudio/preview/pg/web/checkout
- https://www.cashfree.com/devstudio/preview/pg/tools/webhookVerification
- https://www.cashfree.com/payment-gateway-charges/
- https://www.cashfree.com/upi-payment-gateway/
- https://www.cashfree.com/settlement-and-reconciliation-guide/
- https://www.cashfree.com/instant-settlements/
- https://www.cashfree.com/payment-gateway-india/
- https://www.cashfree.com/blog/payment-gateway-integration-in-php/
- https://www.cashfree.com/blog/payment-timeout/
- https://www.cashfree.com/blog/how-to-migrate-your-payment-gateway-without-downtime/

Current evidence confirms server-side order/session creation, browser checkout, server-side post-return status verification, webhook signature/timestamp verification, raw-body/idempotency guidance, UPI Intent/QR capability, reconciliation/settlement support, sandbox behavior, refunds/status support, and current public commercial material.

### Authoritative ecosystem research

- https://www.npci.org.in/circulars/upi
- https://www.rbi.org.in/

NPCI current circular listings and RBI payment-system material were reviewed for current ecosystem context.

No legal conclusion is drawn from this research.

Material current UPI behavior must be re-verified at implementation/acceptance time because provider/product/network rules evolve quickly.

All provider capabilities, pricing, settlement timings, offers, API versions, retry behavior, and regulatory statements are time-sensitive research evidence only.

## 32. Related Documents

- `../00-overview/assumptions.md`
- `../00-overview/project-overview.md`
- `../00-overview/glossary.md`
- `../01-product/functional-requirements.md`
- `../01-product/non-functional-requirements.md`
- `../01-product/user-roles.md`
- `../01-product/user-journeys.md`
- `../01-product/personas.md`
- `../02-architecture/architecture-principles.md`
- `../02-architecture/architecture-overview.md`
- `../02-architecture/system-context.md`
- `../02-architecture/container-architecture.md`
- `../02-architecture/component-architecture.md`
- `../02-architecture/data-flow.md`
- `../02-architecture/technology-stack.md`
- `README.md`
- `ADR-0009-authorization-implementation.md`
- `ADR-0011-api-contract-architecture.md`
- `ADR-0013-member-client-strategy.md`
- `ADR-0014-api-deployment-boundary.md`
- `ADR-0015-background-jobs-scheduler.md`
- `ADR-0016-hosting-deployment-platform.md`
- `ADR-0017-ci-cd-release-secrets.md`
- `ADR-0018-testing-toolchain.md`
- `ADR-0020-observability-provider.md`
- `ADR-0021-object-storage.md`
- legacy migration source: `../07-api-contracts.md`
- legacy migration source: `../09-payments-billing.md`
- legacy migration source: `../12-security-audit.md`
- legacy migration source: `../16-open-decisions.md`
