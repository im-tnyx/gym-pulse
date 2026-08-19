# GymPulse Functional Requirements

## Document Control

- Status: `Draft v1.0`
- Scope: Phase 1 Operations MVP
- Audience: Product, Design, Backend, Frontend, Mobile, QA, Security
- Parent: `product-requirements.md`

## 1. Purpose

Define atomic, traceable functional requirements for GymPulse Phase 1.

Each requirement ID is intended to map forward into architecture, API, database, test cases, and release acceptance.

## 2. Requirement Language

- `MUST`: required for Phase 1 acceptance.
- `SHOULD`: expected unless a documented exception is approved.
- `MAY`: optional behavior.

Status labels:

- `Confirmed`
- `Assumed`
- `Conditional`
- `Open`

## 3. Identity and Access

### FR-IDENTITY-001 Staff authentication

**Status:** Confirmed

Protected owner, manager, and staff functionality MUST require an authenticated identity.

### FR-IDENTITY-002 Session termination

Authenticated users MUST be able to terminate their current session, and the system MUST support revocation/expiry semantics suitable for the selected authentication provider.

### FR-IDENTITY-003 Member identity verification

**Status:** Confirmed need, method Open

Member access to protected self-service data MUST use a verified identity mechanism. A raw mobile number by itself MUST NOT be treated as authorization proof.

### FR-AUTHZ-001 Tenant-scoped authorization

Every protected operation MUST be authorized against organization/gym/branch scope where applicable.

### FR-AUTHZ-002 Named capability enforcement

Protected mutations MUST be guarded by named capabilities rather than only UI visibility or client-side role checks.

### FR-AUTHZ-003 Self-only member access

A member MUST NOT access another member's protected records through normal member-facing APIs.

### FR-AUTHZ-004 Sensitive action attribution

Sensitive staff actions MUST record the authenticated actor.

## 4. Member Management

### FR-MEMBER-001 Canonical member record

A member record MUST have a stable opaque identifier and MUST belong to explicit tenant/gym/branch context.

### FR-MEMBER-002 Member minimum fields

The Phase 1 member model MUST support:

- display name,
- contact identifier,
- join date,
- status,
- branch context,
- created/updated timestamps.

### FR-MEMBER-003 Member optional operational fields

The model SHOULD support assigned trainer reference, avatar/photo reference, external migration reference, and communication-preference linkage where applicable.

### FR-MEMBER-004 Member statuses

Supported Phase 1 member statuses MUST include:

```text
Active
Paused
Expired
Cancelled
Blocked
```

State changes MUST be authorized and auditable when operationally material.

### FR-MEMBER-005 Staff member search

Authorized staff MUST be able to search in-scope members by at least name, contact identifier, and internal/external member reference where available.

### FR-IMPORT-001 Controlled member import

The pilot SHOULD support controlled import with validation, duplicate detection, preview/error reporting, source-row traceability, and reconciliation count.

### FR-IMPORT-002 No silent import fabrication

Import MUST NOT silently invent missing expiry dates, membership states, or other material business facts.

## 5. Plans and Memberships

### FR-PLAN-001 Plan management

Authorized owner/manager roles MUST be able to create, view, update, activate, and deactivate membership plans according to permission policy.

### FR-PLAN-002 Plan commercial fields

A plan MUST support name, duration, base price, active state, and benefits/inclusions.

### FR-PLAN-003 Historical commercial traceability

Editing a reusable plan MUST NOT make historical membership/order commercial terms unreconstructable.

### FR-MEMBERSHIP-001 Membership record

A membership MUST link member, plan/commercial context, start date, expiry date, status, and tenant scope.

### FR-MEMBERSHIP-002 Membership states

Supported membership states MUST include:

```text
Pending
Active
Frozen
Expired
Cancelled
```

### FR-MEMBERSHIP-003 Valid date range

Membership expiry MUST NOT precede membership start.

### FR-MEMBERSHIP-004 Server-side eligibility

Attendance, renewal, and other entitlement-sensitive flows MUST determine membership eligibility server-side.

### FR-MEMBERSHIP-005 Freeze record

An approved freeze/pause MUST be represented explicitly with membership reference, interval or effective state, reason, and approving actor where policy requires it.

### FR-MEMBERSHIP-006 Freeze exclusion from standard no-show

A member whose relevant membership is frozen/paused MUST be excluded from standard no-show detection during the approved pause.

### FR-MEMBERSHIP-007 Freeze expiry policy

**Status:** Open

Whether a freeze extends membership expiry MUST be controlled by an explicit gym policy. The system MUST NOT assume one global behavior.

## 6. QR Attendance

### FR-ATTENDANCE-001 QR session/token

The check-in QR mechanism MUST use a session-bound, rotating, signed, or otherwise time-constrained server-verifiable token rather than an indefinitely reusable public identifier.

### FR-ATTENDANCE-002 QR validation

A QR check-in MUST validate:

1. token/session integrity,
2. session expiry,
3. branch context,
4. verified member identity,
5. membership eligibility,
6. duplicate policy.

### FR-ATTENDANCE-003 Successful attendance

A successful check-in MUST create exactly one canonical attendance record and return server-confirmed success.

### FR-ATTENDANCE-004 Attendance source

Attendance MUST record its source, at minimum `qr` or `assisted`.

### FR-ATTENDANCE-005 Duplicate protection

The system MUST reject accidental duplicate attendance according to a documented policy while allowing legitimate later visits if gym policy permits them.

### FR-ATTENDANCE-006 Retry safety

Retrying the same logical successful check-in MUST NOT create another attendance effect.

### FR-ATTENDANCE-007 Assisted check-in

Authorized staff MUST be able to create assisted attendance when policy allows.

### FR-ATTENDANCE-008 Assisted check-in reason

Assisted attendance MUST capture staff actor and mandatory reason.

### FR-ATTENDANCE-009 Attendance history

Members MUST be able to view their own valid attendance history. Authorized staff MUST be able to view in-scope member attendance.

### FR-ATTENDANCE-010 Attendance correction

Material attendance correction MUST preserve actor, reason, and original/corrected context or compensating history.

### FR-ATTENDANCE-011 No silent destructive correction

Normal operational correction MUST NOT silently hard-delete history in a way that makes audit/reconciliation impossible.

## 7. Motivation

### FR-MOTIVATION-001 Weekly visit goal

Phase 1 MUST support a weekly visit target or equivalent fair attendance-goal model.

### FR-MOTIVATION-002 Pause fairness

Approved pauses MUST NOT cause misleading goal/streak behavior.

### FR-MOTIVATION-003 Calendar streak boundary

Daily calendar streak behavior MAY exist for future challenge-specific use but is not the default Phase 1 motivation model.

## 8. Retention and Follow-up

### FR-RETENTION-001 Configurable no-show threshold

Owner/authorized manager MUST be able to configure inactivity threshold according to gym policy.

### FR-RETENTION-002 Sample threshold assumption

**Status:** Assumed

The initial prototype/pilot MAY use 10 days until pilot policy is confirmed.

### FR-RETENTION-003 Eligibility exclusions

Standard no-show detection MUST exclude relevant memberships that are frozen/paused, expired, or cancelled.

### FR-RETENTION-004 Last valid attendance

No-show logic MUST use the member's last valid attendance according to the canonical attendance model.

### FR-RETENTION-005 Single active case

The system MUST prevent duplicate active no-show cases for the same member and rule context.

### FR-RETENTION-006 Red-list queue

Authorized owner/staff users MUST have an actionable no-show queue containing at least member, last visit, absent days, membership/expiry context, latest follow-up, and next action.

### FR-RETENTION-007 Red-list filters

The queue SHOULD support filters for inactivity range, follow-up due, expiry proximity, branch, status, and assignee where applicable.

### FR-FOLLOWUP-001 Record contact attempt

Authorized staff MUST be able to append a follow-up/contact record to a no-show case.

### FR-FOLLOWUP-002 Follow-up outcomes

Initial supported outcome values MUST include:

```text
WillReturn
Injured
Travelling
TimingIssue
Unhappy
NoResponse
Cancelled
```

### FR-FOLLOWUP-003 Follow-up fields

A follow-up MUST store case, channel, outcome, actor, timestamp, optional note, and next-action date where applicable.

### FR-FOLLOWUP-004 Preserve history

Past follow-up history MUST remain available after later contact attempts.

### FR-FOLLOWUP-005 Next action

The workflow MUST support scheduling a next action when the selected outcome/policy requires one.

### FR-FOLLOWUP-006 Duplicate staff contact mitigation

The product SHOULD expose current assignee/recent contact/next action state to reduce simultaneous duplicate contact.

### FR-RETURN-001 Return resolution

A valid return attendance MUST be capable of resolving an eligible open no-show case.

### FR-RETURN-002 Preserve recovery linkage

Resolved cases SHOULD retain resolution type/time and the return attendance reference when applicable.

## 9. Renewal

### FR-RENEWAL-001 Renewal eligibility

The system MUST identify memberships entering configured renewal windows.

### FR-RENEWAL-002 Configurable reminder stages

The renewal schedule MUST support configurable stages. Source-aligned examples include D-14, D-7, D-3, D0, and optional post-expiry service follow-up.

### FR-RENEWAL-003 Renewal offer detail

Before payment, a member MUST be shown applicable plan duration, base price, discount, final payable amount, benefits, and applicable terms.

### FR-RENEWAL-004 Renewal order separation

Selecting a renewal option MUST create or identify a renewal business record separate from the payment record.

### FR-RENEWAL-005 Commercial snapshot

The renewal order SHOULD preserve sufficient commercial terms for later reconciliation.

### FR-RENEWAL-006 No extension on initiation

Creating a renewal order or initiating payment MUST NOT extend membership.

### FR-RENEWAL-007 Reminder stop conditions

Future reminder stages MUST stop after verified successful renewal, cancellation, or another approved suppressing condition.

## 10. Payments and Receipts

### FR-PAYMENT-001 Canonical payment states

Online payment lifecycle MUST support:

```text
Created
Pending
Paid
Failed
Refunded
Reversed
```

### FR-PAYMENT-002 Provider verification

For online payments, canonical success MUST be based on verified provider evidence, not a client success screen.

### FR-PAYMENT-003 Webhook authenticity

Provider callbacks MUST be authenticated/verified according to the selected provider's supported mechanism.

### FR-PAYMENT-004 Provider event persistence

Provider references/events required for reconciliation and idempotency MUST be retained.

### FR-PAYMENT-005 Duplicate callback safety

Repeated delivery of the same provider event MUST NOT apply a business effect twice.

### FR-PAYMENT-006 Exactly-once membership effect

A verified successful renewal payment MUST extend/activate its intended membership effect exactly once.

### FR-PAYMENT-007 Exactly-once add-on effect

A verified successful add-on payment MUST activate/increment its intended add-on effect exactly once.

### FR-PAYMENT-008 No raw payment credentials

GymPulse MUST NOT store raw card credentials or raw UPI credentials.

### FR-PAYMENT-009 Refund/reversal history

Refund and reversal events MUST remain visible in financial history and MUST NOT be represented as silent deletion of the original payment.

### FR-PAYMENT-010 Offline payment

**Status:** Conditional

If offline payment is enabled, it MUST use a separate authorized workflow recording method, amount, actor, timestamp, and reference/approval metadata as applicable.

### FR-RECEIPT-001 Receipt record

A successful payable transaction SHOULD produce a stable receipt record where business/jurisdiction policy requires it.

### FR-RECEIPT-002 Receipt truth

A receipt MUST NOT be issued as a confirmed paid receipt before canonical payment success.

## 11. Add-ons

### FR-ADDON-001 Initial categories

Phase 1 add-on catalog MUST support Personal Training, Diet/Nutrition Service, and Product/Supplement categories.

### FR-ADDON-002 Catalog fields

An add-on MUST support title, description/outcome, price, active state, and applicable validity/capacity/stock metadata.

### FR-ADDON-003 No pre-selection

Paid add-ons MUST NOT be pre-selected for the member.

### FR-ADDON-004 Commercial transparency

Relevant price, validity, session count, stock/capacity, and terms SHOULD be visible before purchase.

### FR-ADDON-005 Order separation

An add-on purchase MUST create an order separate from reusable catalog configuration.

### FR-ADDON-006 Usage/fulfillment

The product MUST support basic post-purchase usage or fulfillment state rather than recording only the sale.

### FR-ADDON-007 No negative balance

PT/session usage and product stock MUST NOT become negative through normal workflows.

### FR-ADDON-008 Availability validation

When purchase depends on trainer capacity or product stock, the system SHOULD validate applicable availability before final activation/payment flow according to the chosen design.

## 12. Dashboard and Operational Analytics

### FR-DASHBOARD-001 Owner dashboard

Owner/authorized manager MUST have a daily operational dashboard.

### FR-DASHBOARD-002 Required cards

Dashboard MUST expose, directly or through concise summary, at least:

- active members,
- today's valid check-ins,
- recent active members,
- open no-show cases,
- returned members,
- renewals due,
- renewal amount collected,
- payment exceptions,
- add-on revenue/fulfillment signal.

### FR-DASHBOARD-003 Action queues

Dashboard MUST link to actionable queues for retention, renewal, payment exceptions, fulfillment, and data-quality issues where those modules are enabled.

### FR-DASHBOARD-004 Metric drill-down

Important operational metrics SHOULD be traceable to the underlying records used to calculate them.

### FR-SUMMARY-001 Daily owner summary

The system SHOULD generate a gym-local daily operational summary.

## 13. Notifications and Consent

### FR-NOTIFICATION-001 Transactional templates

Phase 1 MUST support transactional/service notification intent types for no-show care, renewal reminder, payment success, payment failure, and owner daily summary.

### FR-NOTIFICATION-002 Deduplication

Notification job retries MUST NOT create duplicate business-stage messages.

### FR-NOTIFICATION-003 Delivery state truth

The system MUST only represent provider delivery states actually supported/observed. Unsupported states MUST NOT be fabricated.

### FR-NOTIFICATION-004 Renewal suppression

Future renewal reminders MUST be suppressed after applicable renewal completion/cancellation/preference policy.

### FR-CONSENT-001 Marketing separation

Marketing consent/preferences MUST be represented separately from service/transactional communication policy.

### FR-CONSENT-002 Preference persistence

Supported member communication preferences/opt-outs MUST be persisted and consulted by relevant notification workflows.

## 14. Audit and Data Quality

### FR-AUDIT-001 Sensitive action log

The system MUST create an audit record for defined sensitive actions.

### FR-AUDIT-002 Minimum audit actions

Minimum auditable actions include:

- assisted attendance,
- attendance correction,
- membership state/freeze changes,
- permission changes,
- retention/renewal configuration changes,
- staff financial interventions,
- refund/reversal actions.

### FR-AUDIT-003 Audit integrity

Audit records MUST preserve actor, action, resource, time, and tenant context. Reason/before-after context MUST be included where relevant.

### FR-DATA-QUALITY-001 Operational inconsistency detection

The system SHOULD identify material issues including missing membership expiry, invalid date range, paid-online state without expected provider reference, correction without reason, and negative stock/session balance.

### FR-DATA-QUALITY-002 Actionable issue state

Data-quality issues SHOULD be visible to an authorized operational user and support resolution tracking where practical.

## 15. Cross-Domain Invariants

### FR-CROSS-001 Server truth

Clients MUST NOT be trusted to determine final authorization, attendance eligibility, payment success, or membership entitlement.

### FR-CROSS-002 Idempotent critical effects

Critical mutations and automation effects MUST be designed so retry/replay cannot duplicate business outcomes.

### FR-CROSS-003 Tenant context

Tenant/gym/branch context MUST be explicit in requests, data relationships, and background jobs where relevant.

### FR-CROSS-004 Timezone correctness

Gym-local business-day logic MUST use the configured gym timezone rather than server machine timezone.

## 16. Deferred Functional Domains

The following do not yet have active Phase 1 functional requirements:

- full workout programming,
- exercise library,
- meal tracking,
- health metrics,
- human coaching workspace beyond basic PT reference,
- AI coach,
- wearables,
- community,
- advanced multi-branch operations,
- GymPulse SaaS subscription billing.

They require separate future domain requirements.

## 17. Traceability Expectations

Future documents should reference these IDs.

Examples:

```text
FR-ATTENDANCE-002
  -> C4 component: Attendance Service
  -> API: POST /api/v1/attendance/check-ins
  -> DB: attendance, qr_sessions
  -> Tests: ATT-E2E-001..n
```

```text
FR-PAYMENT-006
  -> Payment webhook component
  -> payment_events/payment_effects
  -> idempotency integration tests
```

## 18. Related Documents

- `product-requirements.md`
- `feature-catalog.md`
- `user-journeys.md`
- `non-functional-requirements.md`
- `user-roles.md`
- `success-metrics.md`
