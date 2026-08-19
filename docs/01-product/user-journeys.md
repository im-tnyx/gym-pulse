# GymPulse User Journeys

## Document Control

- Status: `Draft v1.0`
- Scope: Phase 1 end-to-end product journeys
- Audience: Product, UX, Frontend, Backend, QA, Operations
- Migration source: `../03-user-flows.md`

## 1. Purpose

Define the end-to-end journeys GymPulse must support across member, staff, owner, automation, and payment-provider interactions.

These journeys are product contracts. Detailed API payloads and database transitions belong in later technical documents.

## 2. Journey Conventions

- Client screens do not decide authorization, payment truth, membership eligibility, or final business state.
- Critical mutations must tolerate retries without duplicate effects.
- Sensitive staff actions must be attributable.
- Scheduled work uses gym-local business time where relevant.
- Every journey must define success, blocked, error, and retry behavior.

## 3. Journey JRN-001: Member Entry and Home

### Goal

A member opens GymPulse and understands their current operational state immediately.

### Entry conditions

- member account/link exists,
- authentication or verified lookup mechanism is available.

### Happy path

```mermaid
flowchart TD
    A[Open GymPulse] --> B{Authenticated or verified?}
    B -- No --> C[Verify identity]
    C --> D{Verification valid?}
    D -- No --> E[Retry or support state]
    D -- Yes --> F[Member Home]
    B -- Yes --> F
    F --> G[Show membership status]
    F --> H[Show expiry]
    F --> I[Show weekly goal]
    F --> J[Show check-in action]
    F --> K[Show renewal action if relevant]
```

### Home priority

1. membership state,
2. exact expiry,
3. weekly attendance progress,
4. check-in,
5. renewal when relevant,
6. purchased/add-on service state when relevant.

### Acceptance signals

- user can distinguish `Active`, `Frozen`, `Expired`, and other supported states,
- exact expiry is visible,
- inaccessible actions explain why they are unavailable.

## 4. Journey JRN-002: QR Check-in

### Goal

Record one valid attendance event with minimal friction.

### Preconditions

- member identity established,
- QR/session token available,
- membership eligible,
- branch allowed.

```mermaid
flowchart TD
    A[Scan QR] --> B[Submit opaque token]
    B --> C{Token valid?}
    C -- No --> X1[Invalid QR]
    C -- Yes --> D{Session active?}
    D -- No --> X2[Expired QR]
    D -- Yes --> E{Branch allowed?}
    E -- No --> X3[Branch mismatch]
    E -- Yes --> F{Membership eligible?}
    F -- No --> X4[Membership blocked/inactive]
    F -- Yes --> G{Duplicate by policy?}
    G -- Yes --> X5[Already checked in]
    G -- No --> H[Create attendance exactly once]
    H --> I[Update weekly goal]
    I --> J[Resolve eligible no-show case]
    J --> K[Show success]
```

### Required result

- attendance reference,
- server timestamp,
- branch,
- current weekly-goal state.

### Retry behavior

A retry of the same successful logical request must return the canonical result rather than create another attendance record.

### Related requirements

- `FR-ATTENDANCE-001` through `FR-ATTENDANCE-006`
- `NFR-RELIABILITY-001`

## 5. Journey JRN-003: Assisted Check-in

### Actor

Front Desk Staff or another explicitly authorized staff role.

```mermaid
flowchart TD
    A[Search member] --> B[Open member summary]
    B --> C{Membership eligible?}
    C -- No --> D[Show blocked reason]
    C -- Yes --> E[Choose Assisted Check-in]
    E --> F[Provide mandatory reason]
    F --> G[Submit]
    G --> H{Permission allowed?}
    H -- No --> I[Forbidden]
    H -- Yes --> J[Apply duplicate rule]
    J --> K[Create assisted attendance]
    K --> L[Write audit record]
    L --> M[Update goal and retention state]
```

### Business rules

- actor is mandatory,
- reason is mandatory,
- source is `assisted`,
- standard eligibility and duplicate protections still apply unless a separately approved override policy exists.

## 6. Journey JRN-004: Daily No-show Detection

### Actor

Background automation.

### Goal

Create one actionable retention case when an eligible member crosses the configured inactivity threshold.

```mermaid
flowchart TD
    A[Scheduled gym-local scan] --> B[Load eligible memberships]
    B --> C[Exclude Frozen/Expired/Cancelled]
    C --> D[Resolve last valid attendance]
    D --> E[Calculate inactivity]
    E --> F{Threshold crossed?}
    F -- No --> G[No action]
    F -- Yes --> H{Active case exists?}
    H -- Yes --> I[Keep single canonical case]
    H -- No --> J[Create NoShowCase]
    J --> K[Expose in action queue]
```

### Failure rules

- rerunning the same scan must not create duplicate active cases,
- a failed tenant scan must be observable and retryable,
- one tenant failure must not leak or mix another tenant's data.

## 7. Journey JRN-005: Staff Follow-up on At-risk Member

### Goal

Turn a red-list entry into a recorded intervention and next action.

```mermaid
flowchart TD
    A[Open Red List] --> B[Filter/sort]
    B --> C[Open case]
    C --> D[Review last visit and expiry]
    D --> E[Contact member]
    E --> F[Record outcome]
    F --> G{Next action required?}
    G -- Yes --> H[Set next action date]
    G -- No --> I[Save]
    H --> I
    I --> J[Append follow-up history]
    J --> K[Update case status]
```

### Initial outcomes

- `WillReturn`
- `Injured`
- `Travelling`
- `TimingIssue`
- `Unhappy`
- `NoResponse`
- `Cancelled`

### Important behavior

Past follow-up history remains visible. Corrections must not silently erase prior contact records.

## 8. Journey JRN-006: Member Returns After Follow-up

```mermaid
flowchart TD
    A[Valid attendance recorded] --> B{Eligible open no-show case?}
    B -- No --> C[Normal attendance only]
    B -- Yes --> D[Mark case Returned]
    D --> E[Store return attendance reference]
    E --> F[Record resolution timestamp]
    F --> G[Update recovery metrics]
```

The system must preserve original risk/follow-up history.

## 9. Journey JRN-007: Approved Pause While At Risk

```mermaid
flowchart TD
    A[Member reports approved reason] --> B[Staff reviews policy]
    B --> C{Pause authorized?}
    C -- No --> D[Keep case actionable]
    C -- Yes --> E[Create freeze/pause record]
    E --> F[Update case according to policy]
    F --> G[Exclude member from standard scan during pause]
```

Whether the pause extends expiry is an open business policy and must not be assumed globally.

## 10. Journey JRN-008: Renewal Reminder

### Actor

Background automation.

```mermaid
flowchart TD
    A[Renewal scan] --> B[Find memberships in stage window]
    B --> C{Already renewed/cancelled/stage suppressed?}
    C -- Yes --> D[Skip]
    C -- No --> E{Stage already created/sent?}
    E -- Yes --> D
    E -- No --> F[Create NotificationIntent]
    F --> G[Evaluate channel policy]
    G --> H[Dispatch]
    H --> I[Track provider-supported delivery state]
```

Typical configurable stages:

- D-14 optional,
- D-7 primary,
- D-3 reminder,
- D0 expiry-day,
- optional post-expiry service follow-up.

## 11. Journey JRN-009: Member Renewal Purchase

```mermaid
flowchart TD
    A[Open Renewal] --> B[Show current expiry]
    B --> C[Show eligible plans]
    C --> D[Select plan]
    D --> E[Show base price, discount, final amount, terms]
    E --> F[Confirm]
    F --> G[Create RenewalOrder]
    G --> H[Create Payment]
    H --> I[Open provider checkout]
    I --> J{Client-facing provider result}
    J -- Looks successful --> K[Show Processing]
    J -- Failed/cancelled --> L[Show retry/help]
    K --> M[Await verified server event]
```

Client-side payment success is never sufficient to extend membership.

## 12. Journey JRN-010: Verified Payment Applies Renewal

```mermaid
flowchart TD
    A[Provider webhook/API verification] --> B[Verify authenticity]
    B --> C{Provider event already processed?}
    C -- Yes --> D[Return idempotent success]
    C -- No --> E[Persist provider event]
    E --> F{Canonical success?}
    F -- No --> G[Update Pending/Failed/etc]
    F -- Yes --> H[Mark Payment Paid]
    H --> I{Business effect already applied?}
    I -- Yes --> J[Do not duplicate]
    I -- No --> K[Apply membership renewal once]
    K --> L[Create receipt]
    L --> M[Stop future renewal stages]
    M --> N[Update owner/member views]
```

### Invariants

- no double extension,
- no duplicate effective receipt,
- provider event history retained,
- financial history remains auditable.

## 13. Journey JRN-011: Failed Payment Recovery

```mermaid
flowchart TD
    A[Payment Failed] --> B[Persist canonical failed state]
    B --> C[Show safe failure message]
    C --> D[Expose retry/help action]
    D --> E{Retry requested?}
    E -- No --> F[Remain in payment exception queue]
    E -- Yes --> G[Create/reuse allowed payment attempt]
    G --> H[Provider checkout]
```

A failed payment must remain distinct from `member did not respond`.

## 14. Journey JRN-012: Refund or Reversal

```mermaid
flowchart TD
    A[Refund/reversal initiated or received] --> B[Authorize or verify]
    B --> C[Persist financial event]
    C --> D[Update payment state/history]
    D --> E[Apply approved entitlement policy]
    E --> F[Write audit record]
    F --> G[Update reporting]
```

The effect of a refund on active membership is a business policy decision and must be explicit before production.

## 15. Journey JRN-013: Add-on Purchase and Fulfillment

```mermaid
flowchart TD
    A[Browse optional add-ons] --> B[Open detail]
    B --> C[Show price, validity, terms, availability]
    C --> D{Available?}
    D -- No --> E[Disable purchase or inquiry]
    D -- Yes --> F[Confirm]
    F --> G[Create AddOnOrder]
    G --> H[Create Payment]
    H --> I[Verified success]
    I --> J[Activate exactly once]
    J --> K[Reserve/decrement capacity or stock safely]
    K --> L[Expose fulfillment/usage state]
```

Add-ons are never pre-selected.

## 16. Journey JRN-014: Owner Daily Operations

```mermaid
flowchart TD
    A[Owner opens dashboard] --> B[Load authorized gym/branch context]
    B --> C[Show operational cards]
    C --> D[Show prioritized action queues]
    D --> E[Choose work item]
    E --> F[Open contextual workflow]
    F --> G[Complete action]
    G --> H[Refresh affected queue/metric]
```

Recommended priority order:

1. overdue follow-up,
2. new no-show cases,
3. renewals due,
4. payment exceptions,
5. add-on fulfillment,
6. data-quality issues.

## 17. Journey JRN-015: Member Import for Pilot

```mermaid
flowchart TD
    A[Upload/import source] --> B[Parse into staging]
    B --> C[Validate required fields]
    C --> D[Detect duplicates/conflicts]
    D --> E[Show preview/errors]
    E --> F[Owner confirms]
    F --> G[Write controlled batch]
    G --> H[Produce reconciliation report]
```

Missing expiry or membership state must not be silently fabricated.

## 18. Journey JRN-016: Communication Preference Change

```mermaid
flowchart TD
    A[Open communication settings] --> B[View available preferences]
    B --> C[Change preference]
    C --> D[Persist consent/preference record]
    D --> E[Future notification jobs evaluate current state]
```

Marketing and service/transactional communication must remain separate concepts.

## 19. Cross-Journey Error Recovery

### Network timeout after mutation

Retry using the same logical idempotency key when the operation supports it.

### Stale client state

Server rejects invalid state transition and returns canonical state or conflict information.

### Provider webhook replay

Provider event deduplication plus business-effect uniqueness prevents duplicate effects.

### Job retry

Use deterministic business keys and database constraints rather than only in-memory locks.

## 20. Journey Completion Checklist

A journey is not implementation-ready until it defines:

- entry condition,
- actor,
- permissions,
- happy path,
- loading state,
- empty state where relevant,
- validation failure,
- authorization failure,
- business-rule rejection,
- network failure,
- retry behavior,
- duplicate/replay behavior,
- audit behavior for sensitive actions,
- observable success metric.

## 21. Related Documents

- `personas.md`
- `user-roles.md`
- `functional-requirements.md`
- `success-metrics.md`
- `../04-backend/background-jobs.md` (future)
- `../06-api/endpoints.md` (future)
