# GymPulse User Flows

## 1. Purpose

Define the end-to-end operational journeys that Phase 1 must support. These flows are the behavioral contract between product, design, backend, frontend, automations, and QA.

## 2. Flow conventions

- Client screens never decide financial or authorization truth.
- Server validates membership, tenant, QR, payment, and state transitions.
- Retried requests must not duplicate business effects.
- Audit events are written for sensitive staff actions.
- Background automations must be tenant and timezone aware.

## 3. Member entry flow

```mermaid
flowchart TD
  A[Open GymPulse] --> B{Authenticated?}
  B -- Yes --> C[Member Home]
  B -- No --> D[Verify member identity]
  D --> E{Verification valid?}
  E -- No --> F[Show retry/help state]
  E -- Yes --> C
```

Member Home should prioritize:

1. current membership state,
2. exact expiry date,
3. weekly attendance goal,
4. primary check-in action,
5. renewal action when relevant,
6. next service / add-on action when applicable.

## 4. QR check-in flow

```mermaid
flowchart TD
  A[Member scans QR] --> B[Read opaque QR token]
  B --> C[Send check-in request]
  C --> D{QR signature/token valid?}
  D -- No --> X1[Invalid QR]
  D -- Yes --> E{QR session active?}
  E -- No --> X2[Expired QR]
  E -- Yes --> F{Branch allowed?}
  F -- No --> X3[Wrong branch]
  F -- Yes --> G{Member authenticated/verified?}
  G -- No --> X4[Verification required]
  G -- Yes --> H{Membership eligible?}
  H -- No --> X5[Membership inactive/expired]
  H -- Yes --> I{Duplicate within policy window?}
  I -- Yes --> X6[Already checked in]
  I -- No --> J[Create attendance exactly once]
  J --> K[Update weekly goal/streak]
  K --> L[Resolve eligible no-show case]
  L --> M[Update dashboard/event stream]
  M --> N[Show success]
```

### Successful result

Return:

- attendance ID,
- check-in time,
- branch,
- current weekly goal/streak value,
- optional contextual message.

### Required errors

- invalid QR,
- expired QR,
- branch mismatch,
- inactive membership,
- expired membership,
- duplicate scan,
- authentication required,
- temporary server/network failure.

### Retry behavior

If the client resends the same request after a timeout, the server should return the existing successful attendance result rather than create another attendance record.

## 5. Assisted check-in flow

```mermaid
flowchart TD
  A[Front desk searches member] --> B[Open member summary]
  B --> C{Membership eligible?}
  C -- No --> D[Show reason and allowed next actions]
  C -- Yes --> E[Choose Assisted Check-in]
  E --> F[Select/enter mandatory reason]
  F --> G[Submit]
  G --> H[Authorize staff capability]
  H --> I[Apply duplicate policy]
  I --> J[Create attendance source=assisted]
  J --> K[Write audit record]
  K --> L[Update weekly goal]
  L --> M[Resolve eligible no-show case]
  M --> N[Show confirmation]
```

Example reasons:

- member phone unavailable,
- QR camera issue,
- accessibility assistance,
- front-desk operational exception.

The reason list should be configurable later, but free-form context may be allowed with audit safeguards.

## 6. Attendance correction flow

```mermaid
flowchart TD
  A[Authorized staff opens attendance] --> B[Choose Correct]
  B --> C[Enter correction reason]
  C --> D[Show before/after summary]
  D --> E[Confirm]
  E --> F[Authorize attendance.correct]
  F --> G[Write correction/compensating state]
  G --> H[Write audit record]
  H --> I[Recalculate affected metrics if required]
```

Normal UI must not silently delete historical attendance.

## 7. Daily no-show scan

```mermaid
flowchart TD
  A[Scheduled job in gym timezone] --> B[Load eligible active memberships]
  B --> C[Exclude frozen/paused/expired/cancelled]
  C --> D[Find last valid attendance]
  D --> E[Calculate inactivity]
  E --> F{Threshold crossed?}
  F -- No --> G[No action]
  F -- Yes --> H{Active case already exists?}
  H -- Yes --> I[Refresh derived risk data if needed]
  H -- No --> J[Create one open NoShowCase]
  J --> K[Surface in owner/staff queue]
```

The automation must be safe to rerun without duplicate active cases.

## 8. Owner no-show follow-up flow

```mermaid
flowchart TD
  A[Owner opens Red List] --> B[Filter/sort cases]
  B --> C[Open member case]
  C --> D[Review last visit, expiry, previous follow-up]
  D --> E[Call/WhatsApp/member contact]
  E --> F[Record outcome]
  F --> G{Outcome needs next action?}
  G -- Yes --> H[Set next action date]
  G -- No --> I[Save outcome]
  H --> I
  I --> J[Update case status]
  J --> K[Append follow-up history]
```

Initial outcomes:

- Will return,
- Injured,
- Travelling,
- Timing issue,
- Unhappy,
- No response,
- Cancelled.

## 9. Return-after-follow-up flow

```mermaid
flowchart TD
  A[Member returns] --> B[Valid attendance created]
  B --> C{Eligible open no-show case?}
  C -- No --> D[Normal attendance flow]
  C -- Yes --> E[Set case Returned]
  E --> F[Store return attendance reference]
  F --> G[Capture recovery timestamp]
  G --> H[Update retention metrics]
```

Case history remains available after resolution.

## 10. Approved pause during no-show case

```mermaid
flowchart TD
  A[Member explains travel/medical/approved break] --> B[Authorized staff reviews policy]
  B --> C{Pause approved?}
  C -- No --> D[Keep case active / set next action]
  C -- Yes --> E[Create membership freeze/pause]
  E --> F[Update or close no-show case per policy]
  F --> G[Exclude from future standard scans during pause]
```

The exact relationship between a pause and membership expiry is a gym policy decision.

## 11. Renewal reminder flow

```mermaid
flowchart TD
  A[Scheduled renewal scan] --> B[Find memberships in configured window]
  B --> C{Already renewed/cancelled/opted out for stage?}
  C -- Yes --> D[Skip]
  C -- No --> E{Stage already sent?}
  E -- Yes --> D
  E -- No --> F[Create notification intent]
  F --> G[Dispatch through configured channel]
  G --> H[Track delivery result]
```

Reminder stages may include 14, 7, 3, 0 days and an approved post-expiry service follow-up.

## 12. Member renewal purchase flow

```mermaid
flowchart TD
  A[Member opens Renewal] --> B[Show current membership and expiry]
  B --> C[Show eligible plan options]
  C --> D[Member selects plan]
  D --> E[Show price, discount, final amount, terms]
  E --> F[Confirm]
  F --> G[Create RenewalOrder]
  G --> H[Create Payment]
  H --> I[Open provider checkout]
  I --> J{Provider result in client}
  J -- Success-looking --> K[Show Processing until server verifies]
  J -- Failed/cancelled --> L[Show appropriate state]
  K --> M[Await verified server event]
```

Client success alone must never extend the membership.

## 13. Verified payment flow

```mermaid
flowchart TD
  A[Provider webhook/API verification] --> B[Verify authenticity]
  B --> C{Event already processed?}
  C -- Yes --> D[Return idempotent success]
  C -- No --> E[Persist provider event]
  E --> F{Payment success?}
  F -- No --> G[Update failed/pending state]
  F -- Yes --> H[Mark payment Paid]
  H --> I{Business effect already applied?}
  I -- Yes --> J[Do not apply twice]
  I -- No --> K[Extend/activate membership exactly once]
  K --> L[Create receipt]
  L --> M[Mark effect applied]
  M --> N[Stop future renewal reminders]
  N --> O[Update dashboard and notify member]
```

## 14. Failed payment recovery flow

```mermaid
flowchart TD
  A[Payment becomes Failed] --> B[Store failure details safe for UI]
  B --> C[Show retry/help action]
  C --> D{Member retries?}
  D -- No --> E[Remain actionable in pipeline]
  D -- Yes --> F[Create/reuse approved new payment attempt]
  F --> G[Provider flow]
```

A failed payment is not equivalent to no response and should remain a distinct owner action state.

## 15. Refund/reversal flow

```mermaid
flowchart TD
  A[Refund/reversal initiated or provider event received] --> B[Authorize/verify]
  B --> C[Persist financial event]
  C --> D[Update payment/refund state]
  D --> E[Apply configured membership/add-on policy]
  E --> F[Write audit trail]
  F --> G[Update reporting]
```

Whether a refund changes membership access immediately is a business policy that must be defined, not assumed.

## 16. Add-on purchase flow

```mermaid
flowchart TD
  A[Member views optional add-ons] --> B[Open add-on]
  B --> C[Show price, validity, terms, capacity/stock]
  C --> D{Available?}
  D -- No --> E[Disable purchase / offer inquiry]
  D -- Yes --> F[Member confirms]
  F --> G[Create AddOnOrder]
  G --> H[Create payment]
  H --> I[Verified success]
  I --> J[Activate order exactly once]
  J --> K[Reserve/decrement applicable capacity or stock]
  K --> L[Expose usage/fulfillment state]
```

Add-ons must never be pre-selected.

## 17. PT usage flow

Applicable when PT sessions are enabled.

```mermaid
flowchart TD
  A[Active PT package] --> B[Book/assign session]
  B --> C[Session occurs]
  C --> D[Authorized trainer/staff marks completed]
  D --> E{Remaining sessions > 0?}
  E -- No --> F[Reject invalid decrement]
  E -- Yes --> G[Record usage]
  G --> H[Update remaining balance]
  H --> I[Show owner/member utilization]
```

No workflow may produce a negative session balance.

## 18. Owner daily dashboard flow

```mermaid
flowchart TD
  A[Owner opens dashboard] --> B[Load tenant/branch context]
  B --> C[Show key cards]
  C --> D[Show action queues]
  D --> E[Owner selects priority action]
  E --> F[Open contextual workflow]
  F --> G[Complete action]
  G --> H[Refresh affected metric/queue]
```

Priority queues:

1. follow-ups due,
2. new no-show cases,
3. renewals due,
4. failed/pending payment exceptions,
5. add-on fulfillment alerts,
6. data-quality issues.

## 19. Member import flow

```mermaid
flowchart TD
  A[Owner uploads/imports source data] --> B[Parse into staging]
  B --> C[Validate required fields]
  C --> D[Detect duplicates/conflicts]
  D --> E[Show import preview]
  E --> F[Owner confirms]
  F --> G[Write records in controlled batch]
  G --> H[Produce success/error report]
  H --> I[Reconcile imported active count]
```

Import should not silently guess missing expiry or membership states.

## 20. Notification preference flow

```mermaid
flowchart TD
  A[Member opens communication settings] --> B[View available preferences]
  B --> C[Change marketing preference]
  C --> D[Persist consent/opt-out record]
  D --> E[Future jobs evaluate current policy]
```

Transactional communication behavior must remain policy-aware and separate from marketing consent.

## 21. Daily owner summary automation

```mermaid
flowchart TD
  A[Closing-time scheduled job] --> B[Aggregate gym-local day]
  B --> C[Check-ins]
  B --> D[New risk cases]
  B --> E[Follow-ups due/completed]
  B --> F[Renewals paid/pending]
  B --> G[Payment exceptions]
  B --> H[Add-on actions]
  C --> I[Compose summary]
  D --> I
  E --> I
  F --> I
  G --> I
  H --> I
  I --> J[Store summary]
  J --> K[Deliver on configured channel if enabled]
```

## 22. Error recovery principles

### Network timeout after mutation

Client retries with same idempotency key or request identifier. Server returns existing result if effect already completed.

### Background job retry

Jobs use deterministic business keys and upsert/unique constraints rather than relying only on in-memory locks.

### Provider webhook replay

Provider event ID and business-effect ledger prevent duplicate state transitions.

### Stale client state

Server rejects invalid state transition and returns current canonical resource state.

## 23. Flow acceptance checklist

A user flow is complete only when design and implementation include:

- entry state,
- loading state,
- success state,
- empty state where relevant,
- validation error,
- authorization error,
- business-rule rejection,
- network retry behavior,
- duplicate/replay behavior for mutations,
- audit behavior for sensitive staff actions.
