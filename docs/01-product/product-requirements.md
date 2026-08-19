# GymPulse Product Requirements

## Document Control

- Status: `Draft v1.0 - Phase 1 Operations MVP`
- Product: `GymPulse`
- Audience: Product, Design, Engineering, QA, Security, Pilot Operations
- Canonical Requirement Detail: future `functional-requirements.md` and `non-functional-requirements.md`
- Migration Source: `../01-product-requirements.md`

## 1. Purpose

Define the user problems, approved Phase 1 capabilities, business behavior, acceptance boundaries, and later-phase product separation for GymPulse.

This document is intentionally product-oriented. Detailed endpoint design, schemas, provider choices, and infrastructure decisions belong in architecture and technical documents.

## 2. Product Objective

The Phase 1 Operations MVP must prove three outcomes before broader fitness-management features are promoted into active scope:

1. attendance is reliably visible,
2. retention risk is acted on earlier,
3. renewals and payment state are handled more consistently.

A fourth operational criterion applies to all three: gym staff must be able to operate the workflow without developer intervention.

## 3. Product Positioning

### Confirmed Phase 1

GymPulse is a gym operations and member-retention product.

### Proposed long-term direction

GymPulse may evolve into a broader fitness operating platform covering:

- gym management,
- workouts,
- exercise library,
- nutrition,
- health metrics,
- progress,
- human coaching,
- AI coaching/insights,
- multi-branch SaaS,
- subscription management.

These future domains do not become requirements through this document. They require their own product specifications.

## 4. Primary Users

### 4.1 Member

**Status:** `Confirmed`

Primary Phase 1 needs:

- know whether membership is active,
- know exact expiry,
- check in reliably,
- review attendance/weekly goal,
- understand renewal choices,
- complete or inspect payment,
- receive a valid receipt when available,
- browse optional relevant add-ons,
- control applicable communication preferences.

### 4.2 Owner / Manager

**Status:** `Confirmed`

Primary Phase 1 needs:

- know what requires action today,
- see inactive at-risk members,
- ensure follow-ups happen,
- understand why members are absent,
- see upcoming renewals,
- identify failed/pending payment exceptions,
- manage core plans/memberships/add-ons,
- see members who returned after intervention,
- understand a small set of operational KPIs,
- receive a daily summary.

### 4.3 Front Desk Staff

**Status:** `Confirmed`

Primary Phase 1 needs:

- find a member quickly,
- inspect membership eligibility,
- assist check-in when authorized,
- record reason for assisted actions,
- record follow-up outcome and next action,
- inspect relevant payment/receipt state,
- complete authorized membership operations.

### 4.4 Trainer / Coach

**Status:** `Future / partial operational reference only`

A trainer may be referenced for member assignment or add-on service delivery, but a full trainer/coach application is not required for Phase 1.

## 5. Product Principles

### PRIN-001 Actionable operations

Owner/staff views prioritize work queues and exceptions over decorative charts.

### PRIN-002 Verified payment truth

A payment initiation event must never be presented as confirmed payment success.

### PRIN-003 Idempotent critical effects

Retries must not duplicate attendance, membership extension, add-on activation, or business-stage notifications.

### PRIN-004 Auditable operational history

Sensitive corrections and financial/retention history must remain reconstructable.

### PRIN-005 Fair motivation

Attendance goals/streaks must avoid penalizing approved pauses or normal training schedules unfairly.

### PRIN-006 Consent separation

Marketing preferences and service/transactional communication must not be modeled as one undifferentiated consent flag.

### PRIN-007 Optional add-ons

Paid add-ons must not be pre-selected and must expose relevant commercial terms before purchase.

### PRIN-008 Deterministic business rules

Authorization, attendance eligibility, membership entitlement, payment truth, and balances are deterministic system responsibilities.

## 6. Phase 1 Capability Requirements

The identifiers below group requirements. Detailed atomic requirements will be normalized in `functional-requirements.md`.

## CAP-IDENTITY Identity and Access

**Status:** `In Scope`

### Requirements

- Protected owner/staff functionality requires authenticated identity.
- The system must resolve role and authorized tenant/branch scope server-side.
- Member access must be restricted to the member's own data unless explicitly authorized otherwise.
- Session revocation/logout must be supported.
- Sensitive actions must be attributable to an authenticated actor.

### Open decisions

- exact authentication provider,
- member OTP/passwordless/login strategy,
- final role set for pilot.

## CAP-MEMBER Member Management

**Status:** `In Scope`

### Requirements

A member record must support, at minimum:

- stable member identifier,
- tenant/gym/branch context,
- display name,
- mobile/contact identifier,
- join date,
- member status,
- communication preferences,
- assigned trainer where relevant,
- creation/update timestamps.

The product should support controlled import/migration with source traceability for the pilot.

## CAP-PLAN Plans

**Status:** `In Scope`

### Requirements

A plan must support:

- name,
- duration,
- commercial price,
- active/inactive state,
- benefits/inclusions,
- gym/branch applicability where relevant.

Historical member commercial terms must remain understandable if the reusable plan is edited later.

## CAP-MEMBERSHIP Membership Lifecycle

**Status:** `In Scope`

### Required states

```text
Pending
Active
Frozen
Expired
Cancelled
```

### Requirements

- start and expiry must be explicit,
- eligibility must be evaluated server-side,
- freeze/pause must be recorded as explicit state/interval rather than hidden notes,
- no-show logic must exclude ineligible frozen/expired/cancelled memberships,
- renewal must not accidentally create unintended overlapping entitlement,
- membership state changes must be auditable.

### Decision required

Whether and how freeze extends expiry.

## CAP-ATTENDANCE QR Attendance

**Status:** `In Scope`

### Member flow

```text
scan QR
  -> validate QR/session
  -> validate member identity
  -> validate branch
  -> validate membership eligibility
  -> evaluate duplicate rule
  -> create one valid attendance record
  -> update weekly goal/streak
  -> resolve applicable no-show case
  -> show success
```

### Required failure states

- invalid QR,
- expired QR/session,
- branch mismatch,
- inactive/expired membership,
- duplicate scan,
- authorization/identity failure,
- temporary server/network failure.

### Security/trust requirement

A permanently reusable public QR screenshot is not an acceptable long-term check-in design.

## CAP-ATTENDANCE-ASSISTED Assisted Check-in

**Status:** `In Scope`

An authorized staff actor may create attendance manually when permitted.

Required information:

- member,
- branch,
- staff actor,
- reason,
- source = assisted,
- timestamp,
- audit reference.

## CAP-ATTENDANCE-HISTORY Attendance History and Corrections

**Status:** `In Scope`

- member can view own valid attendance,
- authorized staff can view member attendance,
- correction must preserve original/corrected context or compensating history,
- material attendance history must not be silently hard-deleted to improve reports.

## CAP-MOTIVATION Weekly Goal / Streak

**Status:** `In Scope`

Phase 1 must support a fair weekly visit target.

Example:

```text
3 of 4 planned visits completed this week
```

The model may later support planned-visit streaks or challenge-specific calendar streaks. Approved pauses/rest policy must not create misleading behavior.

## CAP-RETENTION No-show Detection

**Status:** `In Scope`

### Requirements

- inactivity threshold configurable by gym,
- sample threshold may begin at `10 days`,
- eligibility based on valid attendance and membership state,
- exclude frozen/paused, expired, cancelled memberships,
- avoid duplicate active cases for same member/rule context,
- calculate absent duration consistently in gym-local business time.

## CAP-RETENTION-QUEUE Red List / Action Queue

**Status:** `In Scope`

The owner/staff queue must expose enough information to take action:

- member,
- contact action,
- plan,
- expiry,
- last valid visit,
- absent days,
- latest follow-up outcome,
- next action,
- assignee/status where used.

Useful filters should include inactivity range, expiring soon, follow-up due, branch, and assignee where applicable.

## CAP-FOLLOWUP Follow-up Workflow

**Status:** `In Scope`

Initial outcomes:

```text
WillReturn
Injured
Travelling
TimingIssue
Unhappy
NoResponse
Cancelled
```

Each follow-up must retain:

- case,
- channel,
- outcome,
- actor,
- timestamp,
- optional note,
- next action where applicable.

Past follow-ups remain visible. The product should reduce concurrent duplicate staff contact through assignee/recent-contact visibility; stronger locking may be added if pilot evidence requires it.

## CAP-RETURN Return Resolution

**Status:** `In Scope`

A valid return attendance must be capable of resolving the relevant open no-show case while preserving:

- original case,
- follow-up history,
- resolution time,
- resolution reason/type,
- return attendance reference where applicable.

## CAP-RENEWAL Renewal Eligibility and Offers

**Status:** `In Scope`

Typical configurable stages:

```text
14 days before - optional heads-up
7 days before  - primary reminder
3 days before  - reminder
expiry day     - expiry state/action
post-expiry    - optional service follow-up
```

Before payment the member should see:

- current membership/expiry context,
- available renewal options,
- duration,
- base price,
- discount if any,
- final payable amount,
- benefits,
- applicable cancellation/refund terms.

## CAP-RENEWAL-ORDER Renewal Order

**Status:** `In Scope`

A selected renewal must create or identify a renewal business record separate from the payment record.

The order should preserve the selected commercial terms required for later reconciliation.

## CAP-PAYMENT Payment Lifecycle

**Status:** `In Scope`

Required canonical states:

```text
Created
Pending
Paid
Failed
Refunded
Reversed
```

### Requirements

- payment initiation does not extend membership,
- online provider confirmation must be verified,
- raw card/UPI credentials are not stored by GymPulse,
- provider event references are retained for reconciliation,
- duplicate callbacks are safe,
- a successful payment applies its intended business effect exactly once,
- refund/reversal remains visible in financial history.

## CAP-PAYMENT-OFFLINE Offline Payments

**Status:** `Conditional / Decision Required`

If the pilot accepts cash or manually verified payment, it requires a separate authorized workflow recording method, amount, actor, time, reference where applicable, and approval semantics if needed.

Offline payment must not impersonate online provider-verification semantics.

## CAP-RECEIPT Receipts

**Status:** `In Scope, exact legal/business fields unresolved`

A successful payable transaction should produce a stable receipt record where applicable.

The project must confirm target-business and jurisdictional receipt/invoice requirements before production.

## CAP-ADDON Add-on Catalogue

**Status:** `In Scope`

Initial categories:

- Personal Training,
- Diet / Nutrition Service,
- Product / Supplement.

An add-on must expose relevant:

- title,
- description/outcome,
- price,
- validity,
- session count/capacity where relevant,
- stock where relevant,
- active state,
- applicable terms.

## CAP-ADDON-ORDER Add-on Orders and Usage

**Status:** `In Scope`

- purchase/order is separate from catalogue configuration,
- payment effect must be idempotent,
- product stock and PT/service balances must not become negative,
- owner reporting should distinguish sale from usage/fulfillment,
- trainer/service availability should be validated where the commercial flow depends on it.

## CAP-DASHBOARD Owner Dashboard

**Status:** `In Scope`

Required operational summaries:

- active members,
- today's valid check-ins,
- recent active members,
- open no-show cases,
- returned members,
- renewals due,
- renewal amount collected,
- pending/failed payment exceptions,
- add-on revenue,
- pending usage/fulfillment.

Required action queues:

- contact today,
- follow-up overdue,
- renewals due,
- payment exception,
- add-on fulfillment/usage,
- data-quality issue.

## CAP-OWNER-SUMMARY Daily Owner Summary

**Status:** `In Scope / SHOULD`

The system should generate a daily summary using gym-local business time with:

- check-ins,
- new risk cases,
- follow-ups complete/due,
- renewals paid/pending,
- payment exceptions,
- add-on actions,
- future PT schedule alerts when scheduling exists.

## CAP-NOTIFICATION Notifications

**Status:** `In Scope`

Initial transactional/service templates:

- no-show care,
- renewal reminder,
- payment success,
- payment failure,
- owner daily summary.

Requirements:

- deterministic business-stage deduplication,
- provider delivery state where supported,
- relevant preference/consent check,
- do not fabricate unavailable delivery states,
- stop future renewal reminders after applicable completion/cancellation/opt-out policy.

## CAP-CONSENT Communication Preferences

**Status:** `In Scope`

Service/transactional and marketing communication must be represented separately. Exact jurisdictional compliance requirements remain an open security/privacy decision.

## CAP-AUDIT Audit History

**Status:** `In Scope`

Minimum auditable actions include:

- assisted attendance,
- attendance correction,
- membership state change,
- freeze changes,
- price-sensitive renewal changes,
- staff payment-state intervention,
- refund/reversal processing,
- follow-up correction,
- permission changes,
- configuration changes affecting retention/renewal behavior.

## CAP-DATA-QUALITY Data Quality

**Status:** `In Scope / SHOULD`

The product should detect material inconsistencies such as:

- membership missing expiry,
- invalid membership date range,
- paid online payment missing expected provider reference,
- attendance correction missing reason,
- negative product stock,
- negative service balance,
- unsupported state transition.

## CAP-SEARCH Staff Search

**Status:** `In Scope`

Authorized staff must be able to search members by at least:

- name,
- mobile/contact identifier,
- internal/external member reference where available.

Search results must enforce tenant/branch authorization.

## CAP-IMPORT Pilot Import

**Status:** `In Scope / SHOULD`

Controlled import should provide:

- validation errors,
- duplicate strategy,
- source-row traceability,
- explicit tenant/branch assignment,
- reconciliation count.

## 7. Phase 1 Non-Functional Product Requirements

Detailed NFR IDs will live in `non-functional-requirements.md`.

### Security

- protected operations require server-side authorization,
- tenant isolation is mandatory,
- secrets are never exposed to clients or committed,
- payment/webhook authenticity must be validated,
- sensitive actions must be attributable.

### Reliability

- critical jobs and webhooks are retry-safe,
- duplicate business effects are prevented,
- canonical state can be reconciled after provider/network failure.

### Performance

- check-in should feel immediate under normal network conditions,
- owner action queues must remain responsive for pilot-scale data,
- list endpoints must support server-side filtering/pagination where required.

### Observability

Production-critical flows must expose enough telemetry to diagnose:

- API failures,
- job failures,
- webhook failures,
- stuck payment state,
- messaging failures,
- data-quality issues.

### Mobile usability

Member workflows and high-priority staff actions should work cleanly on mobile-sized displays even when the initial staff experience is web-based.

### Accessibility

The final UI system should define accessible semantics, focus behavior, contrast, form labeling, and error messaging. Exact conformance target will be defined in application/UI documentation.

## 8. MVP Acceptance Gate

A real pilot should not begin until the following behavior is demonstrated in a staging/test environment:

1. valid, invalid, and expired QR states work,
2. duplicate attendance behavior is correct,
3. assisted attendance captures actor and reason,
4. frozen/expired/cancelled memberships are excluded from standard no-show workflow,
5. follow-up outcome and next action persist,
6. return attendance resolves eligible case without deleting history,
7. renewal initiation does not extend membership,
8. verified successful payment applies membership effect exactly once,
9. duplicate provider callback does not duplicate effect,
10. failed/refunded/reversed states are represented,
11. notification retries do not duplicate business-stage messages,
12. communication preferences behave according to approved policy,
13. dashboard metrics reconcile with canonical records,
14. audit events exist for defined sensitive actions,
15. staff can complete daily workflow without developer assistance.

## 9. Future Domain Requirements

The following domains are placeholders in the documentation architecture, not approved implementation scope.

### Workouts and Exercises

`Future`

Requires decisions about program ownership, progression model, trainer/member editing, workout logging, exercise metadata, safety, and scheduling.

### Nutrition and Meals

`Future`

Requires decisions about tracking versus planning, professional involvement, dietary restrictions, health claims, units, food database source, and AI boundaries.

### Health Data

`Future`

Requires explicit data minimization, purpose limitation, consent, access, retention, deletion, export, jurisdiction, and security requirements before collection.

### Progress

`Future`

Requires measurement definitions, unit handling, photo privacy, history/correction rules, and member/coach permissions.

### Human Coaching

`Future`

Requires a defined business model, coach identity, member assignment, scheduling, communication, plan ownership, service entitlement, and audit rules.

### AI

`Future`

Every AI feature requires a separate capability specification defining user problem, AI responsibility, deterministic responsibility, inputs, context, tools, memory, structured output, safety, evaluation, monitoring, cost, and fallback behavior.

## 10. Requirement Traceability Strategy

The next product documentation phase will convert capability groups into stable atomic IDs such as:

```text
FR-IDENTITY-001
FR-MEMBER-001
FR-MEMBERSHIP-001
FR-ATTENDANCE-001
FR-RETENTION-001
FR-RENEWAL-001
FR-PAYMENT-001
FR-NOTIFICATION-001
NFR-SECURITY-001
NFR-RELIABILITY-001
```

Each requirement should map to:

- owning domain,
- user/persona,
- acceptance criteria,
- architecture component,
- API/data contract where applicable,
- tests.

## 11. Open Questions

See `../00-overview/assumptions.md` for the canonical register. Highest-priority unresolved product items include:

- pilot gym policy,
- freeze semantics,
- renewal effective-date semantics,
- payment provider and offline-payment policy,
- member authentication,
- messaging/consent policy,
- legal receipt/invoice requirements,
- launch jurisdiction.

## 12. Related Documents

- `../00-overview/project-overview.md`
- `../00-overview/vision.md`
- `../00-overview/goals.md`
- `../00-overview/scope.md`
- `../00-overview/assumptions.md`
- legacy source: `../01-product-requirements.md`
- future: `personas.md`
- future: `user-roles.md`
- future: `user-journeys.md`
- future: `feature-catalog.md`
- future: `functional-requirements.md`
- future: `non-functional-requirements.md`
- future: `success-metrics.md`
