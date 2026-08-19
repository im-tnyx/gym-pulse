# GymPulse Automations

## 1. Purpose

Define scheduled and event-driven automations required for Phase 1, including eligibility, idempotency, retry behavior, observability, and failure recovery.

Automations must never create duplicate financial, attendance, case, or notification effects simply because a job is retried.

## 2. Automation principles

- Run business-day schedules in the gym timezone.
- Store canonical timestamps in UTC.
- Every job has a deterministic business key.
- Database constraints back critical uniqueness.
- Retries are expected, not exceptional.
- A job failure must be visible to operators.
- One tenant's failure must not block all tenants where practical.
- Workers must use explicit tenant context.
- Client devices are not reliable schedulers for business-critical workflows.

## 3. Automation inventory

Phase 1:

1. Daily no-show scan
2. Valid attendance post-processing
3. Renewal reminder scan
4. Payment event processing
5. Payment reconciliation / pending recovery
6. Notification dispatch
7. Daily owner summary
8. Data-quality scan
9. Notification delivery-status processing

Future:

- PT session reminders,
- trainer availability alerts,
- lead CRM follow-ups,
- churn scoring,
- automated insight generation.

## 4. Job metadata

Every job execution should expose:

```text
job_id
job_type
tenant_id
gym_id
branch_id nullable
scheduled_for
started_at
finished_at
attempt
status
error_code nullable
correlation_id
```

Job payloads should contain identifiers, not large copies of mutable business records.

# Automation A: Daily no-show scan

## 5. Goal

Identify members whose valid attendance inactivity has crossed the gym's configured threshold and open one actionable case.

## 6. Schedule

Run once per gym-local morning or configured operating time.

The scheduler should resolve the gym timezone rather than using server timezone.

## 7. Eligibility

Candidate member must satisfy:

- member is operationally active,
- relevant membership is active/eligible,
- membership is not frozen/paused at evaluation time,
- membership is not expired,
- membership is not cancelled,
- no explicit policy exclusion applies.

## 8. Calculation

For each eligible member:

```text
last_valid_attendance = latest valid attendance
inactivity_days = gym-local date difference
```

If no attendance exists, the product must define whether the effective reference is:

- membership activation date,
- join date,
- first expected visit,
- excluded until first visit.

This is an open decision and must not be guessed in production.

## 9. Case creation

When threshold is crossed:

- create one active `NoShowCase`,
- store threshold crossing context,
- link membership/rule,
- surface in owner/staff queue.

### Idempotency key

Conceptual:

```text
noshow:{ruleId}:{memberId}:{membershipId}:{thresholdCycle}
```

The database should also prevent duplicate active cases using a partial unique constraint or equivalent.

## 10. Existing case behavior

If an active case exists:

- do not create another,
- update only derived fields if explicitly persisted,
- preserve existing follow-up state and assignment.

## 11. Failure behavior

If one member evaluation fails because of corrupt data:

- record a data-quality issue,
- continue other members where safe,
- mark job execution partially failed if needed.

# Automation B: Attendance post-processing

## 12. Trigger

Successful canonical attendance creation.

## 13. Effects

- update/recalculate weekly goal,
- resolve eligible open no-show case,
- emit operational analytics event,
- refresh/cache dashboard if caching exists.

## 14. Case resolution

If an open case is eligible:

```text
status -> returned
returned_attendance_id -> attendance.id
resolved_at -> now
resolution_type -> member_returned
```

Do not delete the case or follow-up history.

## 15. Idempotency

Attendance ID is the natural event key.

Conceptual processing key:

```text
attendance-postprocess:{attendanceId}
```

Repeated processing must return the same final state.

# Automation C: Renewal reminder scan

## 16. Goal

Send the correct reminder stage before/at expiry without duplicate messages.

## 17. Schedule

Run at least daily in gym timezone. More frequent dispatch may be used if exact local send times are configured.

## 18. Configurable stages

Typical:

```text
D-14 optional
D-7 primary
D-3 reminder
D-0 expiry day
D+3 optional service follow-up
```

Actual stages are gym settings.

## 19. Eligibility

A membership stage is eligible when:

- membership is in target expiry window,
- renewal is not already verified/completed,
- membership is not cancelled,
- recipient is eligible for that communication category/channel,
- stage has not already been completed for current cycle.

## 20. Renewal cycle key

A stable key is required so an extended membership starts a new cycle rather than reusing old stages.

Example:

```text
renewalCycleKey = membershipId + currentExpiryAt
```

## 21. Notification dedupe key

```text
renewal:{membershipId}:{currentExpiryAt}:{stageKey}:{channel}
```

Unique constraint prevents job retry duplicates.

## 22. Stop conditions

Future stages stop after:

- verified renewal,
- cancellation,
- applicable opt-out/policy block.

Failed payment is not equivalent to no response. It should trigger a payment recovery path.

# Automation D: Payment event processing

## 23. Trigger

Verified provider webhook or verified provider status fetch.

## 24. Pipeline

```text
receive raw provider event
  -> verify authenticity
  -> normalize event
  -> insert provider event uniquely
  -> load payment
  -> validate amount/currency/purpose
  -> transition canonical payment state
  -> apply business effect exactly once
  -> create receipt when applicable
  -> enqueue notification
  -> update operational reporting
```

## 25. Provider-event idempotency

Unique:

```text
(provider, provider_event_id)
```

A duplicate event must return successful acknowledgment after confirming it was already processed.

## 26. Business-effect idempotency

Even different provider events may refer to the same successful payment. Protect the effect separately.

Example:

```text
payment:{paymentId}:renewal:{renewalOrderId}
```

Unique `payment_effects.effect_key` ensures membership is extended once.

## 27. Transaction boundary

Where possible, canonical payment state and effect ledger should update in one database transaction.

External side effects such as message dispatch should happen after commit through an outbox/job pattern or retry-safe enqueue.

# Automation E: Pending payment reconciliation

## 28. Goal

Resolve payments stuck in `Pending` when client did not receive final provider state or webhook delivery was delayed.

## 29. Candidate selection

Example:

- pending longer than configured threshold,
- provider reference exists,
- not already terminal,
- retry count below policy.

## 30. Processing

- fetch status using provider adapter,
- normalize result,
- process through same canonical payment event path,
- do not create a second custom state-transition path.

## 31. Backoff

Use bounded retry/backoff.

Do not poll every pending payment indefinitely.

# Automation F: Notification dispatch

## 32. Trigger

A `NotificationIntent` / scheduled notification reaches dispatch time.

## 33. Pre-send checks

Immediately before provider call:

- notification still eligible,
- business condition still valid,
- relevant preference/consent allows it,
- dedupe key not already completed,
- recipient address/channel valid.

This protects against stale queued reminders after a member renews.

## 34. Dispatch

- render approved template variables,
- send through provider adapter,
- store provider message reference,
- mark state,
- emit event.

## 35. Retry policy

Retry only transient provider/network failures.

Do not retry permanent failures blindly, such as:

- invalid recipient,
- opted out,
- rejected template,
- forbidden channel.

## 36. Dedupe

Notification dedupe must be database-backed.

A provider timeout after accepted delivery can create ambiguity. Prefer provider idempotency/message reference support where available and reconcile before resending when possible.

# Automation G: Daily owner summary

## 37. Goal

Give owner a concise close-of-day operational summary.

## 38. Schedule

Configured gym-local closing time or default daily summary time.

## 39. Data

Include:

- today's valid check-ins,
- new no-show cases,
- follow-ups completed,
- follow-ups due/overdue,
- renewals paid,
- renewals pending,
- failed payment count,
- add-on purchases,
- usage/fulfillment alerts,
- next-day PT actions if enabled.

## 40. Storage

Prefer storing a summary record or enough event metadata to explain what was sent.

## 41. Dedupe key

```text
owner-summary:{gymId}:{businessDate}:{channel}:{recipient}
```

# Automation H: Data-quality scan

## 42. Goal

Detect records that can break operational logic.

## 43. Checks

Phase 1 examples:

### Membership

- missing expiry,
- expiry before start,
- invalid active status/date combination,
- overlapping active membership if disallowed.

### Attendance

- assisted record without actor/reason,
- invalid membership link,
- correction lacking required context.

### Payment

- paid online payment without expected provider reference,
- successful payment without expected effect,
- duplicate effect attempt,
- amount mismatch.

### Add-ons

- negative stock,
- negative session balance,
- active order without verified payment where payment required.

### Notifications

- scheduled message for already-completed renewal,
- repeated stage with conflicting dedupe key.

## 44. Alert behavior

Create/upsert `DataQualityIssue` using deterministic issue key.

Do not create thousands of duplicate alerts for the same unresolved record.

Example:

```text
data-quality:{issueType}:{resourceType}:{resourceId}
```

When condition is no longer true, mark resolved automatically only for issue types where automatic resolution is safe.

# Automation I: Notification delivery events

## 45. Trigger

Messaging provider delivery webhook/callback.

## 46. Processing

- verify provider event,
- map to notification,
- reject/replay idempotently,
- update delivery status only through valid state transition,
- preserve failure code safe for operational display.

Do not fabricate `Delivered` if provider does not provide delivery confirmation.

## 47. Scheduler design

Recommended model:

### Global scheduler

Find gyms due for a local-time job and enqueue scoped jobs.

or

### Per-tenant schedules

Maintain schedule registrations per gym.

Either model is acceptable if:

- timezone changes are handled,
- DST behavior is correct where relevant,
- missed schedules can recover,
- duplicate scheduling is safe.

## 48. Job status model

Suggested:

```text
queued
running
succeeded
failed
cancelled
```

Optional:

```text
partially_failed
```

Do not rely solely on provider/job platform UI. Critical execution should have application-level business diagnostics.

## 49. Retry classification

### Retryable

- network timeout,
- temporary provider outage,
- database connection interruption,
- rate limit with known backoff,
- worker crash before transaction commit.

### Usually not retryable without change

- invalid configuration,
- missing required membership expiry,
- invalid recipient,
- permission/policy block,
- malformed provider event,
- permanent provider rejection.

Non-retryable errors should create operator-visible diagnostics where action is possible.

## 50. Concurrency controls

Critical race examples:

- two no-show workers creating same case,
- two payment events applying same renewal,
- two staff actions consuming final PT session,
- two inventory fulfillments consuming final unit.

Use:

- unique constraints,
- transactions,
- row locks/advisory locks only where necessary,
- compare-and-update conditions,
- effect ledgers.

Distributed locks alone are not sufficient protection for permanent data integrity.

## 51. Outbox recommendation

For critical database transition followed by async side effect, consider an outbox table:

```text
outbox_events
  id
  tenant_id
  event_type
  aggregate_type
  aggregate_id
  payload
  created_at
  published_at
  attempts
```

Example:

`payment committed -> outbox payment.succeeded -> notification worker`

This reduces the risk of successful DB commit followed by lost enqueue.

Phase 1 may use a simpler durable queue integration if it provides equivalent guarantees.

## 52. Observability dashboard

Operations should be able to answer:

- did today's no-show scan run for every pilot gym?
- how many cases were created?
- how many renewal stages were scheduled/sent?
- are payment webhooks failing?
- are pending payments stuck?
- are notification failures increasing?
- did the owner summary run?
- what data-quality issues are open?

## 53. Automation test matrix

For every automation test:

1. first successful run,
2. immediate duplicate run,
3. retry after partial failure,
4. concurrency where applicable,
5. tenant isolation,
6. timezone boundary,
7. stale queued job,
8. invalid data,
9. observability record.

## 54. Pilot release gate

Before pilot:

- no-show scan is retry-safe,
- renewal stage is deduplicated,
- payment success effect is exactly-once,
- duplicate webhook replay is safe,
- owner summary deduplicates,
- notification dispatch respects current preference at send time,
- failed jobs are visible,
- data-quality scan identifies critical inconsistencies.
