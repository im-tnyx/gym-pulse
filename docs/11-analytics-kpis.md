# GymPulse Analytics and KPIs

## 1. Purpose

Define the operational metrics GymPulse uses to measure attendance, retention, renewals, payments, add-ons, and staff workflow quality.

The owner dashboard must prioritize actionable operational data. Analytics must not convert estimates or pipeline value into claimed revenue.

## 2. Measurement principles

- Canonical business tables are the source of truth for attendance, payments, memberships, and follow-ups.
- Client analytics events are useful for UX behavior but not financial truth.
- Every metric must define numerator, denominator, time period, tenant scope, and exclusion rules.
- Gym-local calendar boundaries use the gym timezone.
- Financial metrics distinguish expected, gross collected, refunded, and net values.
- Pilot metrics should be compared with a recorded pre-pilot baseline.

## 3. Metric dimensions

Common dimensions:

```text
organization
gym
branch
business_date
week
month
plan
membership_status
member_segment
no_show_outcome
payment_status
add_on_type
staff_actor
```

Only expose dimensions allowed by caller permissions.

# Attendance metrics

## 4. Active members

Definition:

Number of members with an eligible active membership at the measurement instant/day.

Exclude according to product policy:

- cancelled,
- expired,
- optionally frozen depending on dashboard wording.

If frozen members are excluded, label metric clearly as `currently eligible active members` or document the definition.

## 5. Today's check-ins

Definition:

Count of valid attendance records whose gym-local business date is today.

Exclude:

- voided attendance,
- corrected records superseded by a correction policy.

Formula:

```text
Today Check-ins = count(valid attendance on business_date)
```

## 6. Unique members checked in today

If multiple same-day visits are permitted:

```text
Unique Check-ins = distinct(member_id) with valid attendance today
```

Keep this separate from total visit count.

## 7. Attendance activity rate

Source-aligned concept:

```text
Attendance Activity Rate =
active members with >= 1 valid visit in period
/
eligible active members in period
```

Period must be specified, e.g. 7 days or calendar week.

## 8. Weekly active members

Definition:

Distinct eligible members with at least one valid attendance during the configured seven-day/calendar-week period.

## 9. Average visits per active member

```text
Average Visits per Active Member =
valid attendance visits in period
/
distinct members with >=1 visit in period
```

If reporting per all active members instead, use a different label.

## 10. QR adoption rate

```text
QR Adoption Rate =
valid QR-source check-ins
/
all valid check-ins
```

Assisted check-ins remain in denominator.

## 11. Attendance correction rate

```text
Attendance Correction Rate =
attendance records requiring correction
/
all attendance records created
```

A rising correction rate may indicate QR, staff, or data-quality problems.

# Retention metrics

## 12. Open no-show cases

Count active no-show cases:

```text
open + contacted + follow_up_due
```

Exact active statuses should remain consistent with state model.

## 13. New no-show cases

Cases whose `threshold_crossed_at` or created business date falls inside the reporting period.

## 14. Red-list contact rate

```text
Red-list Contact Rate =
no-show cases with >=1 qualifying contact attempt in period/cohort
/
eligible no-show cases in cohort
```

Cohort definition must be consistent. Recommended pilot cohort: cases opened during the period.

## 15. Contact-to-return rate

Source-aligned concept:

```text
Contact-to-Return Rate =
contacted no-show cases followed by valid member return
/
contacted no-show cases
```

Define an attribution window, for example return within N days of contact. The exact window is an open product decision.

## 16. No-show recovery rate

Can be equivalent to contact-to-return if denominator is contacted cases.

Do not alternate between `all red-list members` and `contacted red-list members` without changing the label.

Recommended definition:

```text
No-show Recovery Rate =
contacted cases resolved as returned within attribution window
/
contacted cases eligible for outcome measurement
```

## 17. Average days to return

```text
Average Days to Return =
average(return_attendance_at - first_qualifying_contact_at)
```

May also report from threshold crossing. If so, name it separately.

## 18. Churn reason distribution

Count / percentage by latest or final recorded outcome:

- injured,
- travelling,
- timing issue,
- unhappy,
- no response,
- cancelled,
- other future categories.

Do not treat `No response` as confirmed churn reason.

## 19. Recovered membership value

This is an estimate, not guaranteed profit.

Possible definition:

```text
Recovered Membership Value =
sum(verified renewal amounts from members whose no-show case was recovered)
```

This is stronger than extrapolating long-term hypothetical lifetime value.

If projected value is shown, label it clearly as projected and document assumptions.

# Renewal metrics

## 20. Eligible expiring memberships

Memberships whose expiry enters the configured reporting cohort and are eligible for renewal measurement.

Exclude cancellations or other states only according to documented policy.

## 21. Renewal rate

Source-aligned formula:

```text
Renewal Rate =
verified renewed memberships
/
eligible expiring memberships
```

A renewal is counted only after canonical success/effect.

## 22. On-time renewal rate

```text
On-time Renewal Rate =
memberships renewed before or by expiry cutoff
/
renewed memberships in cohort
```

The exact cutoff must be defined.

## 23. Renewal-before-expiry rate

Equivalent or similar to on-time renewal depending on policy.

Use one canonical label to avoid duplicate metrics.

Recommended:

```text
Renewal Before Expiry Rate
```

## 24. Reminder-to-payment conversion

```text
Reminder Conversion =
renewal cycles with verified payment after reminder
/
renewal cycles receiving that reminder stage
```

Attribution must account for multiple stages.

Recommended reporting:

- conversion after D-14,
- conversion after D-7,
- conversion after D-3,
- overall assisted conversion.

Avoid claiming a specific stage caused payment when multiple reminders were received unless attribution model supports it.

## 25. Average renewal delay

For late renewals:

```text
Average Renewal Delay =
average(verified renewal effective date - previous expiry date)
```

Can also report median because a small number of very late renewals can skew average.

## 26. Renewal plan mix

Distribution of verified renewed memberships by selected plan/duration.

## 27. Renewal pipeline value

```text
Expected Renewal Pipeline =
sum(final amounts of eligible pending renewal orders/offers according to definition)
```

This is not revenue.

Label it `pipeline`, `due`, or `expected`, never `collected`.

# Payment metrics

## 28. Gross collected

```text
Gross Collected =
sum(amount of successful canonical paid payments in period)
```

Define whether this uses payment verification date or business-effective date.

## 29. Refund amount

```text
Refund Amount =
sum(verified refunds in period)
```

## 30. Net collected

Simplified operational definition:

```text
Net Collected = Gross Collected - Verified Refunds/Reversals
```

Accounting treatment should be validated separately.

## 31. Payment failure rate

```text
Payment Failure Rate =
failed payment attempts
/
terminal payment attempts
```

If member can retry multiple times, this is attempt-level. Also consider order-level failure metric separately.

## 32. Failed-payment recovery rate

```text
Failed Payment Recovery Rate =
commercial orders with a failed attempt that later reach verified paid
/
commercial orders with at least one failed attempt and sufficient observation time
```

## 33. Pending payment aging

Buckets:

```text
< 5 min
5-30 min
30 min-2 hr
2-24 hr
>24 hr
```

Exact buckets depend on provider behavior.

This is an operational exception metric, not a member-performance metric.

# Add-on metrics

## 34. Add-on view-to-purchase rate

```text
Add-on Conversion =
members purchasing add-on after a relevant recorded view/offer
/
members shown/viewing that add-on
```

Requires reliable product analytics events. If view tracking is not implemented, do not report this metric.

## 35. Add-on revenue

```text
Add-on Gross Collected =
sum(successful payments where purpose_type=addon)
```

Separate by:

- PT,
- nutrition,
- products.

## 36. Add-on revenue per active member

```text
Add-on Revenue per Active Member =
add-on gross collected in period
/
average or period-defined active member denominator
```

The denominator convention must be documented.

## 37. PT package utilization

```text
PT Utilization =
sessions used
/
sessions purchased and available for measurement
```

Can report per package and aggregate.

## 38. Add-on refund/cancellation rate

```text
Add-on Refund Rate =
refunded add-on orders
/
paid add-on orders
```

## 39. Repeat add-on purchase rate

Percentage of purchasing members with more than one verified add-on purchase during defined period.

# Staff operations

## 40. Follow-up completion rate

```text
Follow-up Completion Rate =
required follow-up actions completed by due time
/
follow-up actions due
```

## 41. Overdue follow-ups

Count cases whose `next_action_at < now` and remain unresolved/actionable.

## 42. Staff workflow completion

Pilot metric:

Percentage of daily required operational actions completed without developer intervention.

This may require manual pilot observation initially.

## 43. Data-quality issue count

Track:

- open critical,
- open warning,
- new in period,
- resolved in period,
- average resolution time.

# Owner dashboard metric set

## 44. Recommended top-level cards

Phase 1 owner dashboard:

1. Active Members
2. Today's Check-ins
3. 7-Day Active Members
4. Open No-show Cases
5. Returned Members
6. Renewals Due in 7 Days
7. Renewal Amount Collected
8. Payment Exceptions
9. Add-on Revenue This Month

Keep card count manageable. Lower-priority metrics belong in reports or drill-down views.

## 45. Action queues

Metrics should link to source queues:

```text
Open No-show Cases -> filtered No-show list
Renewals Due -> Renewal pipeline
Payment Exceptions -> Pending/Failed payment list
Data-quality Issues -> Issue list
```

The owner should be able to verify what a number represents.

# Pilot measurement

## 46. Baseline capture

Before pilot record:

- active paid members,
- average weekly check-ins,
- members absent beyond chosen threshold,
- renewal rate,
- on-time renewal rate if available,
- average renewal delay,
- monthly PT/add-on sales,
- current follow-up response rate/process.

If historical data is incomplete, mark baseline quality rather than inventing values.

## 47. 30-day pilot comparison

At pilot end compare:

- QR adoption,
- attendance data accuracy,
- no-show contact rate,
- returned members,
- churn reasons,
- on-time renewals,
- failed-payment recovery,
- add-on utilization,
- staff independence.

## 48. Pilot outcome categories

### Positive signal

- high daily workflow use,
- measurable recovered members,
- improved renewal timing,
- reduced staff manual effort,
- reliable add-on fulfillment data.

### Neutral signal

- system is used but metric impact cannot yet be measured.

### Negative signal

- attendance unreliable,
- staff skip follow-up recording,
- dashboard not actionable,
- payment state requires manual repair,
- notification causes confusion.

# Product analytics events

## 49. Event naming

Use stable dot-separated names:

```text
member.home_viewed
attendance.scan_started
attendance.checkin_succeeded
attendance.checkin_failed
renewal.options_viewed
renewal.order_created
payment.checkout_started
payment.server_verified
addon.catalog_viewed
addon.detail_viewed
addon.order_created
owner.dashboard_viewed
noshow.case_opened
followup.recorded
```

## 50. Event properties

Safe examples:

```text
tenant_id
gym_id
branch_id
member_id or pseudonymous actor reference
plan_id
add_on_id
source
error_code
business_date
```

Avoid putting:

- raw phone,
- email,
- notes,
- provider secrets,
- medical details,
- message bodies

into general analytics properties.

## 51. Business vs product events

### Canonical business events

Derived from server state:

- attendance created,
- payment paid,
- membership renewed,
- no-show returned.

### UX product events

Derived from client behavior:

- screen viewed,
- button clicked,
- QR scanner opened.

Do not calculate revenue from `payment_success_screen_viewed`.

## 52. Event deduplication

Server business events should have stable event/resource identifiers so retry does not inflate analytics.

Client events may include an event ID/session ID where analytics provider supports dedupe.

## 53. Privacy

Analytics should minimize personally identifiable data.

Owner-facing operational reports can use member identity inside authorized product views, but external product analytics does not need full PII.

## 54. Metric quality checks

Before trusting a dashboard metric:

- query reconciles to source records,
- timezone is correct,
- invalid/voided records are excluded correctly,
- payment refunds are treated consistently,
- duplicate webhook/event processing does not inflate numbers,
- cohort denominator is defined.

## 55. KPI documentation requirement

Every production KPI must have a definition block containing:

```text
Name
Business question
Formula
Numerator
Denominator
Time grain
Timezone
Included states
Excluded states
Source tables
Known limitations
```

## 56. Phase 1 analytics release gate

- dashboard cards reconcile with SQL/source records,
- payment revenue uses canonical paid state,
- no-show return metric links to real return attendance,
- renewal rate denominator is documented,
- pipeline and collected revenue are distinct,
- product analytics contains no unnecessary PII,
- baseline quality is documented for pilot comparison.
