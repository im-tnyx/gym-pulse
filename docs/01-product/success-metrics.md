# GymPulse Success Metrics

## Document Control

- Status: `Draft v1.0`
- Scope: Phase 1 Operations MVP and 30-day pilot
- Audience: Product, Analytics, Engineering, QA, Pilot Operations
- Migration source: `../11-analytics-kpis.md`

## 1. Purpose

Define how GymPulse measures whether Phase 1 is useful, operationally correct, and ready for further investment.

The product must distinguish between:

- usage,
- operational completion,
- retention outcomes,
- renewal/payment outcomes,
- add-on delivery,
- technical quality.

Metrics must not convert pipeline, estimates, or client-side UI events into claimed revenue or business outcomes.

## 2. Measurement Principles

### MET-PRIN-001 Canonical records are source of truth

Attendance, membership, payment, follow-up, and add-on outcome metrics MUST be computed from canonical server-side business records.

### MET-PRIN-002 Gym-local time

Daily and weekly business metrics MUST use the configured gym timezone.

### MET-PRIN-003 Explicit cohorts

Every rate MUST define:

- numerator,
- denominator,
- cohort,
- time window,
- included states,
- excluded states.

### MET-PRIN-004 Revenue truth

`Pending`, `due`, `expected`, and `pipeline` amounts are not collected revenue.

### MET-PRIN-005 Pilot baseline

Before the pilot, baseline quality and available historical data MUST be recorded. Missing historical data must be labeled missing rather than reconstructed without evidence.

## 3. North-Star Phase 1 Outcomes

GymPulse Phase 1 exists to prove four outcomes:

1. **Attendance Visibility**: reliable attendance becomes available for daily operations.
2. **Early Retention Action**: at-risk members are surfaced and contacted before churn is only discovered at renewal time.
3. **Renewal Discipline**: renewals and payment exceptions are visible and handled more consistently.
4. **Staff Operability**: staff can run the workflow without developer intervention.

No single metric replaces these four outcome areas.

## 4. Metric Definition Template

Every production KPI should eventually document:

```text
Metric ID
Name
Business question
Formula
Numerator
Denominator
Time grain
Timezone
Included states
Excluded states
Source tables/events
Known limitations
Target/baseline
```

## 5. Attendance Metrics

### KPI-ATTENDANCE-001 Valid Check-ins

**Question:** How many valid attendance events occurred in the period?

```text
Valid Check-ins = count(canonical valid attendance records in period)
```

Exclude voided/superseded records according to the final correction model.

### KPI-ATTENDANCE-002 Unique Members Checked In

**Question:** How many distinct members attended?

```text
Unique Members Checked In = distinct(member_id) with valid attendance in period
```

Use this separately from visit count when multiple visits per member are allowed.

### KPI-ATTENDANCE-003 Attendance Activity Rate

```text
Attendance Activity Rate =
eligible active members with >= 1 valid visit in period
/
eligible active members in the defined cohort
```

The denominator definition must stay stable within a report.

### KPI-ATTENDANCE-004 7-Day Active Members

Distinct eligible members with at least one valid attendance during the defined seven-day window.

### KPI-ATTENDANCE-005 Average Visits per Attending Member

```text
Average Visits =
valid attendance visits in period
/
distinct members with >= 1 visit in period
```

If the denominator is all active members, use a different metric name.

### KPI-ATTENDANCE-006 QR Adoption Rate

```text
QR Adoption Rate =
valid QR-source attendance
/
all valid attendance
```

Assisted attendance remains in the denominator.

### KPI-ATTENDANCE-007 Attendance Correction Rate

```text
Correction Rate =
attendance records requiring correction
/
attendance records created
```

A high rate is a quality signal, not a member-performance score.

## 6. Retention Metrics

### KPI-RETENTION-001 Open No-show Cases

Count cases still requiring action under the canonical active status set.

### KPI-RETENTION-002 New No-show Cases

Count cases whose threshold crossing/creation occurs in the reporting period.

### KPI-RETENTION-003 Red-list Contact Rate

```text
Contact Rate =
no-show cases with >= 1 qualifying contact attempt
/
eligible no-show cases in the cohort
```

Recommended pilot cohort: cases opened during the measurement period.

### KPI-RETENTION-004 Contact-to-Return Rate

```text
Contact-to-Return Rate =
contacted cases followed by valid member return within attribution window
/
contacted cases eligible for outcome measurement
```

**Open decision:** exact attribution window.

### KPI-RETENTION-005 Average Days to Return

```text
Average Days to Return =
average(return_attendance_at - first_qualifying_contact_at)
```

Median may also be reported to reduce skew.

### KPI-RETENTION-006 Churn/Absence Reason Distribution

Distribution of recorded outcomes such as:

- Injured,
- Travelling,
- TimingIssue,
- Unhappy,
- NoResponse,
- Cancelled.

`NoResponse` MUST NOT be presented as a confirmed churn reason.

### KPI-RETENTION-007 Recovered Renewal Value

Preferred conservative definition:

```text
Recovered Renewal Value =
sum(verified renewal amounts from members whose relevant no-show case was resolved by return/recovery according to attribution policy)
```

This is not guaranteed profit or lifetime value.

## 7. Renewal Metrics

### KPI-RENEWAL-001 Eligible Expiring Memberships

Count memberships entering the defined expiry cohort and eligible for renewal measurement.

### KPI-RENEWAL-002 Renewal Rate

```text
Renewal Rate =
verified renewed memberships
/
eligible expiring memberships
```

A renewal counts only after its canonical membership effect is applied.

### KPI-RENEWAL-003 Renewal Before Expiry Rate

```text
Renewal Before Expiry Rate =
renewed memberships verified by the approved expiry cutoff
/
renewed memberships in cohort
```

The exact cutoff must be documented.

### KPI-RENEWAL-004 Reminder-to-Payment Conversion

For a reminder stage:

```text
Stage Conversion =
renewal cycles with verified payment after stage
/
renewal cycles receiving that stage
```

Do not claim causal attribution to one reminder if multiple stages were received unless the analytics model explicitly supports it.

### KPI-RENEWAL-005 Average Renewal Delay

For late renewals:

```text
Average Renewal Delay =
average(verified renewal effective date - previous expiry date)
```

Median SHOULD also be considered.

### KPI-RENEWAL-006 Renewal Plan Mix

Distribution of verified renewals by plan/duration.

### KPI-RENEWAL-007 Renewal Pipeline Value

```text
Renewal Pipeline Value =
sum(final amounts of defined eligible pending renewal orders)
```

Label as `pipeline`, `due`, or `expected`. Never label as `collected`.

## 8. Payment Metrics

### KPI-PAYMENT-001 Gross Collected

```text
Gross Collected =
sum(canonical successful paid amounts in period)
```

The reporting timestamp basis must be documented.

### KPI-PAYMENT-002 Refund/Reversal Amount

```text
Refund/Reversal Amount =
sum(verified refund/reversal financial events in period)
```

### KPI-PAYMENT-003 Net Collected

Simplified operational view:

```text
Net Collected = Gross Collected - verified refunds/reversals
```

This is an operational metric, not a substitute for formal accounting treatment.

### KPI-PAYMENT-004 Payment Attempt Failure Rate

```text
Failure Rate =
failed terminal payment attempts
/
terminal payment attempts
```

This is attempt-level. Order-level recovery is separate.

### KPI-PAYMENT-005 Failed Payment Recovery Rate

```text
Failed Payment Recovery =
orders with a failed attempt that later reach verified paid
/
orders with >= 1 failed attempt and sufficient observation time
```

### KPI-PAYMENT-006 Pending Payment Aging

Operational buckets MAY include:

```text
< 5 min
5-30 min
30 min-2 hr
2-24 hr
>24 hr
```

Final buckets should reflect actual provider behavior.

## 9. Add-on Metrics

### KPI-ADDON-001 Add-on Gross Collected

```text
Add-on Gross Collected =
sum(successful payments where purpose = addon)
```

Segment by:

- PT,
- nutrition,
- product.

### KPI-ADDON-002 Add-on View-to-Purchase Rate

```text
View-to-Purchase =
members purchasing after a recorded relevant view/offer
/
members with a reliable relevant view/offer event
```

Do not report if reliable view tracking does not exist.

### KPI-ADDON-003 PT Package Utilization

```text
PT Utilization =
completed/used sessions
/
sessions purchased and available for measurement
```

### KPI-ADDON-004 Add-on Refund/Cancellation Rate

```text
Refund Rate =
refunded add-on orders
/
paid add-on orders
```

### KPI-ADDON-005 Fulfillment Backlog

Count paid/active add-on orders still requiring delivery or service action beyond the expected operational window.

Exact SLA/window is an open business rule.

## 10. Staff Operations Metrics

### KPI-OPS-001 Follow-up Completion Rate

```text
Follow-up Completion Rate =
required follow-up actions completed by due time
/
follow-up actions due
```

### KPI-OPS-002 Overdue Follow-ups

Count unresolved/actionable cases where `next_action_at` is in the past.

### KPI-OPS-003 Staff Workflow Independence

Pilot-oriented measure of whether routine daily operational work is completed without developer intervention.

Initial measurement MAY use manual pilot observation.

### KPI-OPS-004 Data-quality Issue Count

Track at least:

- new issues,
- open issues,
- resolved issues,
- severity where available,
- resolution time where meaningful.

## 11. Product Usage Metrics

Product analytics events may measure behavior but are not canonical business truth.

Candidate events:

```text
member.home_viewed
attendance.scan_started
attendance.checkin_succeeded
attendance.checkin_failed
renewal.options_viewed
renewal.order_created
payment.checkout_started
addon.catalog_viewed
addon.detail_viewed
owner.dashboard_viewed
followup.recorded
```

### KPI-USAGE-001 Member Check-in Flow Adoption

May use a combination of active members and QR check-in source data.

### KPI-USAGE-002 Owner Dashboard Usage

Tracks whether the owner actually opens/uses the daily operational surface.

### KPI-USAGE-003 Follow-up Recording Adoption

Measures whether staff record contact outcomes instead of working outside the system.

These metrics should never be substituted for outcome metrics such as real returns or verified payments.

## 12. Data Quality of Metrics

Before a metric is trusted, verify:

- timezone is correct,
- source records reconcile,
- invalid/voided records are excluded consistently,
- refund/reversal handling is defined,
- duplicate provider events do not inflate counts,
- cohort denominator is explicit,
- tenant scope is correct,
- analytics events do not contain unnecessary PII.

## 13. Phase 1 Owner Dashboard Metric Set

Recommended top-level cards:

1. Active Members
2. Today's Check-ins
3. 7-Day Active Members
4. Open No-show Cases
5. Returned Members
6. Renewals Due in 7 Days
7. Renewal Amount Collected
8. Payment Exceptions
9. Add-on Revenue This Month

Cards should drill into relevant source queues wherever practical.

## 14. 30-Day Pilot Baseline

Before starting the pilot, record the best available baseline for:

- active paid members,
- average weekly check-ins,
- members absent beyond chosen threshold,
- current renewal rate,
- renewal-before-expiry rate if measurable,
- average renewal delay,
- monthly PT/add-on sales,
- existing follow-up method and response rate,
- known attendance data accuracy issues.

Also record baseline confidence:

```text
High    canonical historical records available
Medium  partial records / manual reconciliation
Low     mostly anecdotal / insufficient history
```

## 15. Pilot Outcome Review

At the end of the pilot, compare:

- attendance capture reliability,
- QR adoption,
- no-show contact rate,
- returned members,
- common absence reasons,
- renewal timing,
- failed-payment recovery,
- add-on utilization/fulfillment,
- staff workflow independence,
- data-quality issue trend.

## 16. Pilot Signal Categories

### Positive

Examples:

- daily operational use is consistent,
- measurable members return after intervention,
- renewal timing improves,
- staff manual effort decreases,
- payment state remains reliable,
- add-on fulfillment becomes visible.

### Neutral

The system is used, but the pilot duration/data quality is insufficient to establish outcome improvement.

### Negative

Examples:

- attendance data is unreliable,
- staff do not record follow-ups,
- payment state frequently requires manual repair,
- dashboard is not actionable,
- communication causes repeated confusion,
- routine operation requires developer intervention.

## 17. Metrics That Must Not Be Claimed

Do not claim:

- churn reduction without a defined baseline/cohort,
- revenue caused by GymPulse when attribution is not supported,
- projected lifetime value as collected revenue,
- notification delivery when provider does not expose that state,
- AI-driven outcomes before AI is implemented and evaluated,
- medical/fitness outcomes from operational attendance data alone.

## 18. Success Gate for Phase 2 Investment

Phase 2 expansion should require evidence across multiple dimensions rather than one vanity metric.

Recommended decision questions:

1. Is attendance capture reliable enough to drive retention logic?
2. Do staff consistently act on and record follow-ups?
3. Can recovered members be measured credibly?
4. Are renewal/payment states operationally trustworthy?
5. Can the gym operate daily without developer intervention?
6. Is there evidence that an expansion feature solves a validated problem?

## 19. Open Decisions

- contact-to-return attribution window,
- active-member denominator policy during freeze,
- renewal-before-expiry cutoff,
- revenue timestamp basis,
- add-on fulfillment SLA,
- acceptable attendance correction rate,
- quantitative pilot success thresholds.

The current source material does not provide validated universal target percentages, so this document intentionally does not invent them.

## 20. Related Documents

- `product-requirements.md`
- `functional-requirements.md`
- `non-functional-requirements.md`
- `user-journeys.md`
- `feature-catalog.md`
- future `../07-domains/analytics/`
- future `../11-observability/metrics.md`
