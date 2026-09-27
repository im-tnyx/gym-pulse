# Task 0030: Draft Payment Provider ADR

## Goal

Draft one `Proposed` ADR for `D-PROVIDER-001` defining GymPulse's Phase 1 payment-provider and integration direction without creating a provider account, credentials, SDK integration, checkout/webhook/refund code, database migration, payment transaction, or production acceptance.

Target:

`docs/adr/ADR-0022-payment-provider.md`

Continuity:

`.ai/task/0030-draft-payment-provider-adr.md`

## Inputs Read

Fresh latest-`main` repository/governance inputs included:

- `.ai/README.md`
- `.ai/current-state.md`
- `.ai/task/0029-draft-object-storage-adr.md`
- `docs/README.md`
- `docs/00-overview/assumptions.md`
- `docs/00-overview/project-overview.md`
- `docs/00-overview/glossary.md`
- `docs/01-product/functional-requirements.md`
- `docs/01-product/non-functional-requirements.md`
- `docs/01-product/user-roles.md`
- `docs/01-product/user-journeys.md`
- `docs/01-product/personas.md`
- `docs/02-architecture/architecture-principles.md`
- `docs/02-architecture/architecture-overview.md`
- `docs/02-architecture/system-context.md`
- `docs/02-architecture/container-architecture.md`
- `docs/02-architecture/component-architecture.md`
- `docs/02-architecture/data-flow.md`
- `docs/02-architecture/technology-stack.md`
- `docs/adr/README.md`
- `docs/adr/ADR-0009-authorization-implementation.md`
- `docs/adr/ADR-0011-api-contract-architecture.md`
- `docs/adr/ADR-0013-member-client-strategy.md`
- `docs/adr/ADR-0014-api-deployment-boundary.md`
- `docs/adr/ADR-0015-background-jobs-scheduler.md`
- `docs/adr/ADR-0016-hosting-deployment-platform.md`
- `docs/adr/ADR-0017-ci-cd-release-secrets.md`
- `docs/adr/ADR-0018-testing-toolchain.md`
- `docs/adr/ADR-0020-observability-provider.md`
- `docs/adr/ADR-0021-object-storage.md`

Legacy evidence only:

- `docs/07-api-contracts.md`
- `docs/09-payments-billing.md`
- `docs/12-security-audit.md`
- `docs/16-open-decisions.md`

Canonical structured documentation controls.

## Repository State Verified

At Task 0030 start:

- latest `main` was `85a12bb731ce79585b05361afcf64728df42e5af`;
- Task 0029 / ADR-0021 were synchronized;
- `docs/adr/ADR-0022-payment-provider.md` did not exist;
- `.ai/task/0030-draft-payment-provider-adr.md` did not exist;
- ADR queue order 22 remained `D-PROVIDER-001 Payment provider OPEN`;
- canonical `D-PROVIDER-001` remained `P1 OPEN`;
- no prior ADR was `Accepted`;
- no provider acceptance evidence was found;
- no Razorpay/Cashfree production credential or payment SDK implementation evidence was found.

Task 0030 was the actual next bounded governance task.

## Canonical Decision State

```text
D-PROVIDER-001
Priority: P1
Status: OPEN
Decision: Online payment provider
Acceptance: none
```

`ADR-0022 = Proposed`.

No provider becomes `Accepted`.

## Merchant / Settlement Ownership Finding

No canonical structured decision specifies who owns the merchant account or receives settlement.

Unresolved models:

```text
A. gym-owned merchant account
B. GymPulse-owned merchant account
C. platform/sub-merchant model
```

Task 0030 does not select B or C and does not claim A is accepted.

Decision-register gap identified:

```text
merchant account / settlement ownership
```

Do not invent a canonical ID in this task.

Business/legal validation is required.

## Pilot Payment Method Findings

Current canonical scope requires secure online payment capability but does not fully fix the launch method set.

UPI is strategically important in the India-focused technology evaluation.

Cards/netbanking/wallets/other methods should be weighted only after pilot requirements confirm them.

UPI AutoPay/automatic renewal is not a Phase 1 baseline.

## Open Business Dependencies

```text
merchant / settlement ownership          unresolved
launch online payment methods            unresolved
D-BIZ-011 refund/cancellation policy     OPEN
D-BIZ-012 offline payment policy         OPEN
D-BIZ-013 receipt/invoice fields         OPEN
merchant-specific fees                   unconfirmed
settlement expectations                  unconfirmed
support/escalation expectations          unconfirmed
merchant onboarding eligibility          unconfirmed
```

## Canonical Payment Invariants

```text
Provider Payment State != GymPulse Payment State
Client Success != Canonical Payment Success
Payment Return / Redirect = navigation + UX signal
Customer Payment Success != Merchant Bank Settlement Complete
Provider Event Dedupe != Business Effect Exactly Once
```

Canonical states remain:

```text
Created
Pending
Paid
Failed
Refunded
Reversed
```

Canonical amount/currency/purpose is server-owned.

## Providers Evaluated

Primary shortlist:

1. Razorpay.
2. Cashfree.

No third provider was added because the existing shortlist already covers the required India/browser/UPI/webhook/reconciliation decision space and the dominant remaining blockers are business/commercial/fund-flow inputs.

PhonePe/PayU or another provider may be added later if a material requirement exposes a shortlist gap.

## Official Research Date

`2026-09-27`.

Current first-party Razorpay, Cashfree, NPCI, and RBI material was reviewed.

## UPI Findings

Do not design around stale historical Collect tutorials.

Current evaluation posture:

```text
mobile browser -> UPI Intent / supported app handoff
desktop -> Dynamic QR where appropriate
Collect -> not a baseline assumption
```

Provider and network rules continue to evolve.

Cashfree currently markets Intent, Dynamic QR and Collect while its current 2026 guidance also warns that Collect is deprecated/restricted for most use cases.

Razorpay current materials support UPI mobile/desktop flows and current product guidance.

Exact merchant-category UPI behavior must be re-verified with current provider/NPCI evidence during acceptance.

## Checkout Findings

Both candidates support browser-first provider-managed checkout.

Razorpay:

```text
server creates order
-> order_id passed to checkout
-> checkout returns provider fields
-> server verifies signature/status
```

Cashfree:

```text
server creates order
-> payment_session_id passed to checkout
-> browser checkout/return
-> server fetches order/payment status
```

Client return never establishes canonical Paid.

## Webhook Verification Findings

Razorpay current docs explicitly require:

- `X-Razorpay-Signature`;
- HMAC-SHA256;
- raw webhook body;
- unique `x-razorpay-event-id` for duplicate detection;
- out-of-order handling;
- at-least-once semantics;
- exponential-backoff retries for 24 hours after event creation.

Cashfree current docs/tools require:

- webhook signature;
- webhook timestamp;
- raw request payload for current verification guidance;
- verification before business action;
- idempotent duplicate/delayed processing.

Exact Cashfree production retry schedule/timeout expectations remain a sandbox/support validation item.

## Event / Retry Findings

Provider event dedupe and business-effect uniqueness are separate.

Required layers:

```text
provider event identity
-> canonical payment transition
-> payment-purpose business effect
```

Ambiguous provider-create timeout remains Pending/Unknown until status reconciliation.

Do not blindly create a second chargeable attempt.

## State Mapping Findings

Provider-specific states remain adapter-local.

Examples such as:

```text
authorized
captured
SUCCESS
PENDING
FAILED
refund processing
```

are normalized into evidence.

Only legal GymPulse transitions update:

```text
Created / Pending / Paid / Failed / Refunded / Reversed
```

A stale/out-of-order event cannot blindly regress current canonical state.

## Reconciliation Findings

Both candidates expose status/reconciliation paths.

Webhooks alone are insufficient.

Reconciliation must handle:

- stuck Pending;
- lost/delayed webhook;
- ambiguous checkout creation;
- amount/currency/reference mismatch;
- business-effect failure after payment success;
- refund status;
- settlement investigation.

Same canonical transition/effect rules are reused.

## Refund Findings

Both candidates provide refund capabilities.

Refund business entitlement remains `D-BIZ-011 OPEN`.

No provider dashboard/API determines who deserves a refund.

Original financial history remains preserved.

Partial refunds are not a baseline requirement.

Refund API acceptance is not assumed to mean customer funds are already returned; final status remains reconcilable.

## Settlement Findings

Payment success and bank settlement are separate concepts.

Both providers expose settlement/reconciliation information.

Current public settlement timing/product claims are provider/merchant dependent and not accepted as contractual GymPulse assumptions.

Merchant account ownership must be resolved before settlement architecture can be finalized.

## Sandbox Findings

Both candidates provide test/sandbox flows.

Razorpay current docs expose test payments/test webhooks.

Cashfree Dev Studio exposes sandbox checkout/status/webhook tooling.

Required future sandbox evidence includes browser/UPI device flows, webhook verification, duplicate/delayed/out-of-order behavior, status reconciliation, refunds where needed, and settlement/report traceability.

`Sandbox Success != Production Reliability Proof`.

No sandbox account or transaction was created.

## Pricing / Commercial Findings

Current public evidence is highly time-sensitive.

Razorpay current public pricing material advertises a standard platform fee around 2% plus applicable GST, with promotions/custom pricing possible.

Cashfree current public pricing includes changing promotional terms and merchant-agreed platform fees.

No provider should be selected from headline price alone.

Merchant-specific quote/terms require business confirmation.

## Support / Escalation Findings

Both providers publish merchant onboarding/support material.

Provider acceptance still requires real evidence for:

- onboarding/KYC help;
- production payment incident;
- webhook issue;
- refund issue;
- settlement mismatch;
- account-security incident;
- escalation responsiveness.

Marketing/support pages are not operational proof.

## Security Findings

Required architecture controls:

- server-owned amount/currency/purpose;
- provider-managed payment credential handling;
- no raw card/UPI credentials in GymPulse;
- raw-body webhook authenticity verification;
- strict tenant/resource resolution;
- immutable provider references;
- provider event dedupe;
- separate exactly-once business effect;
- server-only API/webhook secrets;
- environment isolation;
- safe provider-dashboard access;
- no provider-dashboard refund as implicit GymPulse authorization;
- no automatic active-active gateway failover.

## Privacy / Regulatory Findings

Provider payloads may include personal/payment metadata.

Retain only what is necessary for payment support, reconciliation, financial history, and approved operational purpose.

Do not dump provider payloads into logs/analytics.

`D-SEC-001` and `D-SEC-006` remain open.

Current NPCI/RBI/provider materials were reviewed for ecosystem context, but Task 0030 makes no legal conclusion.

Merchant/fund-flow and current UPI applicability require business/legal/provider validation before production.

## Member UX Findings

Browser-first Member flow remains appropriate.

After checkout return:

```text
show Processing/Pending
-> refresh canonical server status
-> render final state from GymPulse
```

Validate Android UPI handoff and iPhone/Safari behavior on real representative devices.

## Operational Findings

Future operational views must diagnose:

- stuck Pending;
- provider success/GymPulse unresolved;
- Paid/business effect failed;
- duplicate/invalid webhook;
- amount/currency mismatch;
- refund pending/failure;
- settlement mismatch.

Provider dashboard remains privileged financial tooling, not the normal GymPulse staff UI.

## Evaluation Summary

Architecture/correctness fit:

```text
Razorpay  strong sandbox candidate
Cashfree  strong sandbox candidate
```

Razorpay currently has more explicit public webhook retry/order documentation.

Cashfree currently exposes strong web checkout/UPI/settlement tooling and current sandbox/dev-studio flows.

Neither difference is sufficient to override unresolved merchant/fund-flow/commercial requirements.

## Proposed Direction

Outcome:

```text
B. Sandbox Shortlist
```

```text
Razorpay + Cashfree
remain shortlisted
+
provider-managed browser checkout
+
server-created provider context
+
server-owned amount/currency/purpose
+
raw webhook verification
+
normalized GymPulse Payment state
+
provider-event dedupe
+
business-effect uniqueness
+
status/reconciliation APIs
+
provider-neutral PaymentProvider port
```

No production provider is selected.

## Decision Confidence

```text
Payment integration architecture    High
Razorpay sandbox suitability        High
Cashfree sandbox suitability        High
Production provider preference      Intentionally unresolved
Production provider acceptance      None
```

## Decision Gates

Before final provider acceptance require:

1. merchant/settlement ownership;
2. pilot payment methods;
3. merchant onboarding eligibility;
4. refund policy;
5. receipt/invoice requirements;
6. provider commercial terms;
7. sandbox correctness evidence;
8. Android/iPhone UPI UX evidence;
9. webhook/reconciliation evidence;
10. settlement/report evidence;
11. support/escalation confidence;
12. security/privacy review;
13. decision-owner approval.

## Decisions Kept Separate

```text
D-ARCH-003  API contract
D-ARCH-006  API deployment
D-ARCH-007  background jobs
D-ARCH-009  hosting
D-ARCH-010  object storage
D-ARCH-015  authorization
D-ARCH-018  testing
D-ARCH-019  CI/CD / secrets

D-SEC-001   jurisdiction/privacy
D-SEC-005   deletion/export authority
D-SEC-006   retention

D-DATA-003  money representation
D-DATA-005  provider references/events
D-DATA-006  financial history

D-BIZ-011   refund/cancellation
D-BIZ-012   offline payment
D-BIZ-013   receipt/invoice fields

merchant account / settlement ownership = newly identified canonical gap
```

No decision above is silently accepted.

## Requirement IDs Referenced

```text
FR-PAYMENT-001..010
FR-RECEIPT-001..002
FR-RENEWAL-003..007
FR-CROSS-001..004

NFR-SECURITY-007
NFR-SECURITY-008
NFR-SECURITY-009
NFR-SECURITY-010
NFR-SECURITY-011

NFR-PRIVACY-001
NFR-PRIVACY-005

NFR-RELIABILITY-001
NFR-RELIABILITY-002
NFR-RELIABILITY-004
NFR-RELIABILITY-005
NFR-RELIABILITY-007
NFR-RELIABILITY-008

NFR-AVAILABILITY-001
NFR-PERFORMANCE-005
NFR-OBSERVABILITY-004
NFR-MAINTAINABILITY-003
NFR-TESTABILITY-002
NFR-TESTABILITY-003
NFR-OPERATIONS-001
NFR-OPERATIONS-002
```

## Validation Required

Future evidence must cover the 56 acceptance checks listed in the Task 0030 brief, including merchant ownership, required methods, onboarding, browser/device UPI, false client success, ambiguous timeout, raw webhook signatures, duplicates/out-of-order/delayed events, amount/currency/purpose mismatch, exactly-once effects, reconciliation, refunds, settlements, secret isolation, dashboard access, support/escalation, commercial review, provider exit, ADR-0018 test compatibility and ADR-0017 secret compatibility.

No provider resource or transaction is created for validation in this task.

## Files Changed

Created:

- `docs/adr/ADR-0022-payment-provider.md`
- `.ai/task/0030-draft-payment-provider-adr.md`

Governance continuity updates:

- `docs/adr/README.md`
- `docs/README.md`
- `.ai/current-state.md`

No canonical payment requirement was modified.

No new decision ID was created.

## Open Questions

Primary unresolved questions:

- merchant account / settlement ownership;
- launch payment methods;
- refund policy;
- receipt/invoice model;
- exact merchant onboarding entity;
- negotiated Razorpay/Cashfree pricing;
- required settlement/report detail;
- provider support/escalation;
- exact retained provider evidence and retention;
- provider-dashboard access;
- final production provider.

## Result

Expected synchronized state:

```text
ADR-0022 = Proposed
D-PROVIDER-001 = P1 OPEN
Razorpay = sandbox shortlist only
Cashfree = sandbox shortlist only
Production provider selected = no
Merchant-of-record model = not decided
PaymentProvider integration architecture = Proposed
```

Implementation status:

```text
No payment account created
No provider credentials created
No SDK installed
No checkout/payment route created
No webhook route created
No refund implementation created
No reconciliation worker created
No database schema/migration created
No sandbox transaction executed
No real payment executed
No settlement configured
No CI/environment secret created
No provider dashboard user created
No deployment/IaC created
No prior ADR accepted
```

## Next Recommended Task

After governance synchronization, fresh-read the queue and canonical register.

Current pre-synchronization order indicates:

```text
Order 23
D-PROVIDER-002
Messaging Provider
OPEN
```

Likely next bounded task:

```text
Task 0031: Draft Messaging Provider ADR
```

Do not assume ADR filename/number until final fresh-read.

Do not execute Task 0031 as part of Task 0030.
