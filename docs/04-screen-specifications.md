# GymPulse Screen Specifications

## 1. Purpose

Define the Phase 1 screen inventory, information hierarchy, actions, states, and validation requirements. This document describes product behavior, not final visual design.

## 2. UX principles

- Mobile-first for members.
- Fast operational use for front desk.
- Actionable queues before decorative analytics for owners.
- High-contrast status communication.
- Do not rely on color alone.
- Keep destructive or financially sensitive actions explicit.
- Every async screen needs loading, success, empty, and error states.
- Server state is canonical for membership, payment, attendance, and permissions.

## 3. App surfaces

Recommended Phase 1 surfaces:

```text
Member App / Member Web
Staff + Owner Web App
Shared Authentication / Verification
```

A dedicated trainer app is deferred.

## 4. Member navigation

Recommended Phase 1 navigation:

```text
Home
Attendance
Membership
Add-ons
Profile
```

Payment and renewal can be contextual subflows rather than permanent top-level tabs.

## 5. Member Home

### Purpose

Show the member's current operational state with minimal taps.

### Required sections

#### Membership card

- plan name,
- status,
- exact expiry date,
- days remaining when useful,
- renewal CTA when in configured window.

#### Weekly goal

- target visits,
- completed visits,
- current week context,
- fair explanatory copy.

#### Check-in

Primary CTA:

`Scan QR`

If already checked in recently, show the most recent valid state without encouraging duplicate action.

#### Contextual alert area

Examples:

- membership expires soon,
- payment is pending,
- payment failed,
- membership frozen,
- add-on action required.

### States

- active membership,
- frozen membership,
- expired membership,
- no active membership,
- loading,
- temporary failure.

## 6. QR Scanner

### Purpose

Capture the gym QR and start a server-validated check-in.

### Components

- camera viewport,
- permission explanation,
- scan target,
- fallback action if camera permission is unavailable,
- help text.

### States

- camera permission required,
- camera unavailable,
- scanning,
- QR detected / validating,
- success,
- invalid QR,
- expired QR,
- wrong branch,
- duplicate check-in,
- membership inactive,
- offline/network failure.

### Success screen

Show:

- successful check-in,
- gym/branch,
- local time,
- updated weekly goal,
- close/return Home action.

Do not expose raw QR/session identifiers.

## 7. Attendance History

### Purpose

Give members transparent visibility into recorded attendance.

### Components

- chronological visit list,
- date,
- local time,
- branch where applicable,
- source label if useful,
- weekly summary.

### Optional filters

- month,
- date range.

### Empty state

Explain that valid check-ins will appear here.

## 8. Membership Details

### Required information

- membership status,
- current plan,
- start date,
- expiry date,
- active freeze information if relevant,
- included benefits,
- renewal eligibility,
- recent receipt link where applicable.

### Actions

- renew,
- view payment status,
- view receipt,
- contact gym for pause/cancellation if self-service is not enabled.

Phase 1 should not expose unsupported self-service freeze or cancellation actions.

## 9. Renewal Options

### Purpose

Allow informed selection of a renewal plan.

### Each option shows

- plan name,
- duration,
- base price,
- discount,
- final payable amount,
- benefits,
- applicable terms.

### Required behavior

- no hidden pre-selection that commits the member,
- final amount shown before checkout,
- clear back action,
- payment CTA only after selection.

### States

- eligible options,
- no available renewal option,
- membership already renewed,
- loading/error.

## 10. Payment Processing

### Pre-payment

Show:

- selected product/renewal,
- amount,
- terms summary,
- secure payment CTA.

### Processing

After returning from provider, do not immediately claim membership extension from client result.

Show:

`Payment received for verification` or equivalent processing state until server confirms.

### Payment result states

- paid,
- pending,
- failed,
- refunded,
- reversed.

### Paid state

Show:

- amount,
- new membership expiry or activated add-on,
- payment reference safe for display,
- receipt action.

### Failed state

Show:

- safe failure message,
- retry action,
- support action.

## 11. Add-on Catalogue

### Purpose

Display optional relevant services/products without aggressive upsell.

### Categories

- Personal Training,
- Diet / Nutrition,
- Products / Supplements.

### Card fields

- title,
- short description,
- price,
- validity / session count / quantity,
- availability where useful,
- `View` action.

No paid add-on may be pre-selected.

## 12. Add-on Detail

### Required content by type

#### PT

- package name,
- session count,
- validity,
- trainer / assignment information where known,
- price,
- cancellation / expiry terms.

#### Diet / Nutrition

- service description,
- duration,
- professional qualification where relevant,
- price,
- scope / exclusions,
- terms.

#### Product

- product name,
- quantity,
- price,
- stock status,
- fulfillment information,
- return / expiry information where applicable.

### Actions

- buy,
- ask a question,
- view plan/details.

Purchase must be disabled when the relevant capacity/stock rule blocks fulfillment.

## 13. Member Profile / Preferences

### Sections

- basic profile,
- contact information,
- communication settings,
- logout,
- help/support.

### Communication preferences

Clearly distinguish:

- service / transactional communication,
- marketing communication.

Only expose controls that are actually enforced by backend policy.

# Staff and Owner Screens

## 14. Staff / Owner Login

### Requirements

- secure authentication,
- branch/tenant context after login,
- clear error on revoked/unauthorized account,
- no tenant selection by arbitrary ID.

## 15. Owner Dashboard

### Purpose

Answer what needs action today.

### Top cards

- Active Members,
- Today's Check-ins,
- Recent Active Members,
- Open No-show Cases,
- Returned Members,
- Renewals Due,
- Renewal Collection,
- Payment Exceptions,
- Add-on Revenue.

### Action queues

#### Retention

- new no-show cases,
- overdue follow-ups,
- next actions due today.

#### Renewal

- expiring soon,
- payment pending,
- payment failed.

#### Fulfillment

- active PT packages needing action,
- product orders pending fulfillment,
- data-quality alerts.

### Design rule

Cards must navigate to the filtered source records behind the metric.

## 16. Member Directory

### Search

- name,
- mobile number,
- member/reference ID.

### Filters

- active,
- paused/frozen,
- expiring soon,
- expired,
- branch where authorized.

### Row/card fields

- member name,
- mobile,
- membership status,
- plan,
- expiry,
- last attendance,
- risk indicator where relevant.

### Actions

- open member,
- assisted check-in,
- renewal context,
- follow-up context.

## 17. Member 360 Summary

Phase 1 version should remain operational, not overbuilt.

### Header

- member identity,
- member status,
- assigned branch,
- contact actions.

### Membership section

- current plan,
- start,
- expiry,
- freeze state,
- renewal history summary.

### Attendance section

- last visit,
- recent attendance,
- weekly goal.

### Retention section

- open no-show case,
- latest outcome,
- next action,
- follow-up timeline.

### Payment section

- recent payments,
- pending/failed state,
- receipts.

### Add-on section

- active PT / service orders,
- usage / fulfillment summary.

## 18. Assisted Check-in Modal/Screen

### Fields

- selected member,
- membership eligibility summary,
- branch,
- mandatory reason,
- optional note.

### Validation

- blocked if membership is ineligible unless an explicitly authorized exception flow exists,
- duplicate policy applies,
- staff identity is not editable.

### Result

Show created attendance time and audit confirmation context.

## 19. Red List / No-show Queue

### Purpose

Make the daily retention workload explicit.

### Table/card fields

- member,
- mobile,
- plan,
- expiry,
- last visit,
- absent days,
- assigned trainer if applicable,
- last follow-up,
- next action,
- assignee,
- case status.

### Filters

- 10–14 days,
- 15–21 days,
- 22+ days,
- expiring soon,
- follow-up due,
- assignee,
- branch.

The ranges are examples and should adapt to configured threshold.

### Actions

- Call,
- WhatsApp/contact,
- Mark Outcome,
- Assign,
- Open Member.

## 20. Follow-up Outcome

### Required fields

- outcome,
- contact channel,
- note when useful,
- next action date when required.

### Outcome values

- Will return,
- Injured,
- Travelling,
- Timing issue,
- Unhappy,
- No response,
- Cancelled.

### UX rule

Do not let users save an outcome that logically requires a next action without satisfying policy validation.

## 21. Plans Management

### List

- plan name,
- duration,
- current price,
- active status,
- scope.

### Plan editor

- name,
- duration,
- base price,
- benefits,
- active status,
- optional discount fields.

Editing a plan must not silently rewrite historical membership/payment snapshots.

## 22. Membership Editor

### Display

- member,
- current plan,
- status,
- start,
- expiry,
- freeze intervals,
- source.

### Sensitive actions

- change expiry,
- cancel,
- freeze,
- reactivate where policy allows.

Sensitive date changes should show confirmation and require audit reason where configured.

## 23. Freeze / Pause Screen

### Required

- membership,
- pause start,
- pause end if known,
- reason,
- policy impact summary,
- approval actor.

### Critical clarity

If the gym policy extends expiry because of a freeze, show the calculated effect before confirmation. If it does not, say so.

## 24. Renewal Pipeline

### Columns/fields

- member,
- current expiry,
- renewal stage,
- selected renewal order if any,
- payment status,
- final amount,
- last notification,
- next action.

### Filters

- due in 14 days,
- due in 7 days,
- due in 3 days,
- expires today,
- expired,
- pending payment,
- failed payment,
- paid.

### Actions

- open member,
- view renewal order,
- view payment,
- contact member.

## 25. Payment Detail

### Show

- internal payment ID,
- provider reference,
- amount,
- method,
- current state,
- created time,
- verified time,
- related renewal/add-on,
- provider event timeline safe for staff,
- receipt.

### Sensitive actions

- record authorized offline payment,
- initiate refund if role/policy allows,
- refresh provider status through approved server action.

Never provide a generic `Mark Paid` action for online payments.

## 26. Add-on Management

### Catalogue list

- category,
- title,
- price,
- validity,
- stock/capacity,
- active state.

### Editor

- category,
- description,
- price,
- validity,
- session/quantity configuration,
- stock/capacity,
- terms,
- active status.

## 27. Add-on Orders / Fulfillment

### Show

- member,
- add-on,
- purchase state,
- payment state,
- usage/fulfillment state,
- remaining sessions or quantity where applicable,
- assigned trainer where applicable.

### Alerts

- low/zero stock,
- expired package,
- unfulfilled paid order,
- session balance inconsistency.

## 28. Notifications Log

### Fields

- recipient,
- message type,
- channel,
- scheduled time,
- sent time,
- delivery status,
- related business object,
- dedupe key/reference.

### Actions

- inspect failure,
- retry only when policy allows,
- never bypass opt-out through a generic retry.

## 29. Settings

Phase 1 settings sections:

### Gym profile

- display name,
- address,
- timezone,
- business details used on receipts if enabled.

### Attendance

- duplicate window,
- QR session duration/rotation policy,
- weekly goal rule.

### Retention

- inactivity threshold,
- case assignment defaults if any.

### Renewal

- reminder windows,
- post-expiry follow-up policy.

### Communication

- enabled channels,
- template mappings,
- consent/opt-out behavior.

### Audit

High-impact changes must be recorded.

## 30. Data-quality Alerts

### Examples

- membership missing expiry,
- invalid membership date range,
- paid online transaction without expected provider reference,
- attendance correction missing reason,
- negative stock/session balance,
- unsupported state transition.

### Actions

Each alert should link directly to the record that can resolve it.

## 31. Audit Log Screen

Restricted to authorized roles.

### Filters

- actor,
- action type,
- resource type,
- member,
- date range,
- branch.

### Row

- actor,
- action,
- resource,
- timestamp,
- reason,
- safe before/after summary.

Audit data should not expose secrets or raw sensitive provider payloads unnecessarily.

## 32. Import Screen

### Steps

1. choose/import file,
2. map fields if required,
3. validate,
4. show duplicate/conflict report,
5. preview counts,
6. confirm,
7. import,
8. reconcile.

### Must not silently infer

- missing expiry,
- ambiguous membership status,
- unknown payment result.

## 33. Common component states

Every data-driven screen should define:

- skeleton/loading,
- empty result,
- permission denied,
- validation failure,
- transient server failure,
- stale data / refresh where relevant.

Mutation controls should define:

- disabled state,
- in-progress state,
- double-submit protection,
- success confirmation,
- retry path.

## 34. Mobile responsiveness

### Member

All Phase 1 member flows are designed mobile-first.

### Staff

Critical workflows must work on a phone:

- member search,
- assisted check-in,
- red-list follow-up,
- renewal lookup.

### Owner

Dashboard and queues must remain usable on mobile, even if dense configuration tables are optimized for desktop.

## 35. Accessibility baseline

- semantic labels,
- keyboard operability on web,
- visible focus state,
- adequate contrast,
- touch-friendly controls,
- errors connected to fields,
- statuses conveyed with icon/text, not color alone.

## 36. Design deliverables required before frontend completion

For every critical screen, design should provide:

- default state,
- empty state,
- loading state,
- validation errors,
- permission error,
- server error,
- success state,
- confirmation dialogs for sensitive actions,
- mobile layout,
- desktop layout where relevant.
