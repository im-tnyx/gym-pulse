# GymPulse Payments and Billing

## 1. Purpose

Define how GymPulse handles member-facing payments in Phase 1 and how future SaaS subscription billing remains separate from gym-member commerce.

The most important rule is simple:

> A payment attempt is not a successful payment. Membership or add-on value is granted only after an authorized and verified payment result.

## 2. Scope

Phase 1 member commerce:

- membership renewal orders,
- online payment attempts,
- payment verification,
- failed/pending payment handling,
- optional authorized offline payment,
- receipts,
- refunds/reversals where enabled,
- add-on purchases.

Future platform commerce:

- GymPulse SaaS subscription charged to gym/organization,
- usage-based messaging charges,
- premium modules.

These must use separate billing domains and accounting records.

## 3. Payment actors

```text
Member
Gym Staff / Owner
GymPulse Application
Payment Provider
Background Worker
```

No human-facing role should be able to fake a successful online provider state through a generic UI action.

## 4. Payment objects

Separate:

```text
Commercial object
  RenewalOrder or AddOnOrder

Payment
  Attempt / canonical financial state

PaymentEvent
  Provider event history

PaymentEffect
  Business value applied exactly once

Receipt
  Evidence generated from successful transaction
```

This separation prevents payment state from being conflated with membership state.

## 5. Renewal order lifecycle

Suggested states:

```text
created
payment_pending
paid
cancelled
expired
```

A renewal order snapshots:

- member,
- membership being renewed,
- selected plan,
- duration,
- base amount,
- discount,
- final amount,
- currency,
- terms/version,
- creation time.

Editing a plan later must not silently change an already-created order.

## 6. Payment lifecycle

Required canonical states:

```text
Created
Pending
Paid
Failed
Refunded
Reversed
```

### Created

Internal payment record exists and provider checkout may be initialized.

### Pending

Provider has not reached a reliable terminal result or confirmation is delayed.

### Paid

Provider success is verified or an approved offline-payment workflow records a valid payment.

### Failed

Provider reports failure/cancellation according to adapter mapping.

### Refunded

Funds were returned according to verified refund process.

### Reversed

Provider/banking lifecycle reversed a previously successful payment according to supported provider semantics.

Implementation may need finer-grained internal event types while preserving these product-facing states.

## 7. Online payment creation

Flow:

1. server validates renewal/add-on order,
2. server validates final amount,
3. server creates internal `Payment`,
4. server creates provider order/checkout,
5. server stores provider order reference,
6. client receives only provider fields safe for checkout.

Client must not supply authoritative amount.

## 8. Client checkout result

A provider SDK/browser redirect may tell the client that a payment appears successful.

Client behavior:

- show `Verifying payment...`,
- query canonical GymPulse payment state,
- never extend membership locally,
- never show a new expiry as final until server effect is applied.

## 9. Webhook verification

Provider webhook endpoint must:

1. receive raw request as required by provider verification,
2. verify signature/authenticity,
3. reject malformed/untrusted event,
4. normalize into canonical event,
5. persist unique provider event ID,
6. process idempotently.

Provider-specific signature logic lives inside the payment adapter.

## 10. Amount validation

Before applying payment success, verify where provider supports it:

- expected payment/order reference,
- amount,
- currency,
- merchant/account context,
- event/payment relationship.

An event that claims success for a mismatched amount must not renew membership automatically.

## 11. Exactly-once membership effect

A payment can produce its business effect only once.

Example:

```text
Payment pay_123
RenewalOrder ren_456
Effect key = payment:pay_123:renewal:ren_456
```

Database uniqueness on effect key protects against:

- repeated webhook delivery,
- worker retry,
- multiple success events,
- manual replay.

## 12. Membership extension calculation

The exact renewal date policy must be explicit.

Possible policies include:

### Policy A: extend current expiry

If member renews before expiry:

```text
new_start = current_expiry
new_expiry = current_expiry + plan duration
```

### Policy B: start from payment/activation date

May be used for already-expired membership.

### Policy C: gym-specific grace logic

Could preserve continuity for a limited late-renewal window.

GymPulse must not guess. Pilot gym policy must be recorded in settings/decision log.

## 13. Membership representation after renewal

Recommended approach:

Create a new membership period linked to the previous membership rather than destructively rewriting historical commercial terms.

Alternative:

Extend same membership row if business model is simple.

If same-row extension is chosen, renewal history and pricing snapshots must still be preserved separately.

The implementation decision should optimize for clear history and reporting.

## 14. Payment pending

Pending state must be visible in:

- member payment screen,
- renewal pipeline,
- owner payment exceptions if pending exceeds normal window.

A pending state must not be displayed as paid.

## 15. Pending reconciliation

A background job may query provider for payments pending beyond a threshold.

Rules:

- bounded retries,
- use provider reference,
- feed result into same canonical event processor,
- no separate direct membership mutation.

## 16. Failed payment

A failed payment should:

- remain linked to renewal/add-on order,
- expose safe failure message,
- allow retry when appropriate,
- be visible to owner as payment exception,
- remain distinct from `member ignored renewal`.

A retry may create a new payment attempt under the same commercial order.

## 17. Multiple payment attempts

A renewal order may have multiple payment attempts.

Rules:

- only one effective successful payment should satisfy the order,
- if multiple provider successes unexpectedly occur, flag reconciliation issue,
- do not extend membership multiple times,
- operator must have a clear resolution path for duplicate charge scenario.

## 18. Offline payment

If enabled, offline payments use explicit methods such as:

```text
cash
manual_upi_reference
bank_transfer
other_approved_method
```

Offline payment flow requires:

- authorized role,
- exact amount,
- method,
- collecting actor,
- timestamp,
- reference/note if required,
- audit log.

Do not label an offline payment as provider-verified online payment.

Optional stronger control:

- front desk records payment,
- owner/manager approves above configured threshold.

This is an open policy decision.

## 19. Receipt generation

Receipt should be generated after successful payment/effect according to configured policy.

Suggested fields:

- receipt number,
- gym/business identity snapshot,
- member,
- line items,
- amount,
- currency,
- payment method,
- payment reference safe for display,
- issue date/time,
- related membership/add-on.

Legal tax-invoice requirements are jurisdiction/business-specific and must be confirmed before production. GymPulse should not infer GST/tax treatment from the sample source document.

## 20. Receipt numbering

Need a deterministic, unique policy within required business scope.

Possible format:

```text
GP-{GYM_CODE}-{FY_OR_YEAR}-{SEQUENCE}
```

Final format must be owner/accountant-approved if used as an official fiscal document.

## 21. Refunds

A refund is a separate financial action.

Fields:

- original payment,
- amount,
- reason,
- requested actor,
- provider refund reference,
- provider status,
- verified time.

Never rewrite the original payment amount to simulate refund.

## 22. Partial refunds

Do not implement unless explicitly required.

If enabled later:

- track multiple refund rows,
- enforce cumulative refunded amount <= original successful amount,
- define membership/add-on effect for partial refund,
- update reporting to use net/gross definitions clearly.

## 23. Reversal

Provider reversal behavior should map into canonical state while preserving original success history.

A reversal may require:

- access review,
- owner alert,
- reconciliation issue,
- future renewal action.

The exact access consequence is a business policy.

## 24. Add-on payment

Add-on flow mirrors renewal integrity:

```text
AddOnOrder
  -> Payment
  -> Verified success
  -> PaymentEffect
  -> AddOn activation/stock movement
```

Never decrement stock permanently or activate PT entitlement twice because of duplicate callback.

## 25. Inventory and payment transaction boundary

For limited stock:

Potential strategies:

### Reserve before checkout

Pros:

- reduces overselling.

Cons:

- reservation expiry complexity.

### Revalidate at success

Pros:

- simpler.

Cons:

- payment may succeed when stock changed.

Phase 1 should avoid complex e-commerce inventory unless gym product sales require it. For small pilot stock, explicit fulfillment/reconciliation may be acceptable.

## 26. PT package activation

Verified payment creates entitlement:

```text
sessions_purchased
sessions_used = 0
valid_from
valid_until
```

Session consumption is a separate usage operation.

No session balance may become negative.

## 27. Payment security

GymPulse must not store:

- raw card number,
- CVV,
- raw UPI credential/PIN,
- provider secret in client code.

Use provider-hosted/SDK flows appropriate to chosen provider.

## 28. Provider abstraction

Internal application should depend on canonical interface, not provider-specific fields.

Provider adapter responsibilities:

- create checkout/order,
- validate webhook,
- normalize events,
- fetch status,
- refund where supported,
- map provider errors.

## 29. Provider outage behavior

If provider is unavailable:

- do not mark payment paid,
- return temporary error or pending state as appropriate,
- preserve retryable payment record,
- show member a clear non-duplicative retry message,
- surface operational alert if outage affects many payments.

## 30. Webhook endpoint behavior

Webhook endpoint should:

- be publicly reachable only as required,
- authenticate via provider verification,
- rate-limit safely without breaking legitimate provider retries,
- log request ID/provider event ID,
- return fast after durable processing/enqueue when appropriate,
- avoid expensive client-facing work before acknowledgment.

## 31. Reconciliation report

Owner/finance view should eventually reconcile:

- successful internal payments,
- provider references,
- receipts,
- membership/add-on effects,
- refunds/reversals.

Phase 1 data-quality checks should flag:

- paid without provider reference when online,
- successful payment without effect,
- effect without successful payment,
- amount mismatch,
- duplicate successful attempts for same order.

## 32. Revenue reporting definitions

Clearly distinguish:

### Gross collected

Successful payment amount before refunds.

### Refund amount

Verified refunded amount.

### Net collected

Gross successful payments minus verified refunds/reversals according to accounting definition.

### Expected renewal amount

Value of eligible renewal pipeline, not collected revenue.

Do not mix pipeline value and actual paid revenue.

## 33. SaaS billing boundary

Future GymPulse subscription billing is separate:

```text
PlatformCustomer
Subscription
SubscriptionPlan
SubscriptionInvoice
SubscriptionPayment
UsageCharge
```

Never reuse gym member `payments` table for GymPulse's own SaaS invoices without an explicit generalized billing architecture.

## 34. Payment test scenarios

Mandatory:

- successful payment,
- pending payment,
- failed payment,
- client success before server webhook,
- webhook success before client return,
- duplicate webhook,
- two different success events for same payment,
- malformed webhook,
- forged signature,
- amount mismatch,
- currency mismatch,
- provider timeout,
- pending reconciliation success,
- refund,
- reversal,
- duplicate refund event,
- add-on payment duplicate callback,
- offline payment unauthorized,
- offline payment authorized,
- repeated client payment-create request with same idempotency key.

## 35. Payment release gate

Payments are not pilot-ready until:

- provider sandbox/test flow passes,
- webhook verification passes,
- duplicate callback is safe,
- membership effect is exactly-once,
- client cannot mark payment paid,
- failed/pending states are visible,
- receipt maps to payment,
- refund/reversal behavior is tested if enabled,
- reconciliation queries exist,
- secrets are server-only.
