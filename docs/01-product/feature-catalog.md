# GymPulse Feature Catalog

## Document Control

- Status: `Draft v1.0`
- Scope: Phase 1 capabilities and future product expansion
- Audience: Product, Design, Engineering, QA, Roadmap Planning

## 1. Purpose

Provide a canonical inventory of GymPulse product features, their phase, status, primary users, dependencies, requirement families, and explicit boundaries.

This catalog prevents future ideas from silently entering MVP scope.

## 2. Status Convention

- `Confirmed`: supported by the source blueprint and current Phase 1 product definition.
- `Proposed`: architectural/product extension requiring validation or decision.
- `Conditional`: only implemented if a specific pilot/business decision enables it.
- `Future`: intentionally outside Phase 1.
- `Out of Scope`: explicitly excluded for the referenced phase.

## 3. Phase Convention

- `P1`: Operations MVP
- `P2`: Gym Management Expansion
- `P3`: Member Fitness Experience
- `P4`: Multi-tenant SaaS Expansion
- `P5`: Intelligence / AI

## 4. Phase 1 Feature Summary

| ID | Feature | Status | Primary User | Requirement Family |
| --- | --- | --- | --- | --- |
| FEAT-IDENTITY-001 | Staff authentication | Confirmed | Staff/Owner | FR-IDENTITY |
| FEAT-IDENTITY-002 | Member identity verification | Proposed method, confirmed need | Member | FR-IDENTITY |
| FEAT-AUTHZ-001 | Scoped RBAC/capabilities | Confirmed need | All protected users | FR-AUTHZ |
| FEAT-MEMBER-001 | Member profile | Confirmed | Staff/Member | FR-MEMBER |
| FEAT-MEMBER-002 | Member search | Confirmed | Staff | FR-MEMBER |
| FEAT-MEMBER-003 | Controlled member import | Confirmed for pilot | Owner | FR-IMPORT |
| FEAT-PLAN-001 | Membership plan management | Confirmed | Owner | FR-PLAN |
| FEAT-MEMBERSHIP-001 | Membership lifecycle | Confirmed | Owner/Staff/Member | FR-MEMBERSHIP |
| FEAT-MEMBERSHIP-002 | Freeze/pause records | Confirmed | Owner/Staff | FR-MEMBERSHIP |
| FEAT-ATTENDANCE-001 | QR check-in | Confirmed | Member | FR-ATTENDANCE |
| FEAT-ATTENDANCE-002 | Assisted check-in | Confirmed | Staff | FR-ATTENDANCE |
| FEAT-ATTENDANCE-003 | Attendance history | Confirmed | Member/Staff | FR-ATTENDANCE |
| FEAT-ATTENDANCE-004 | Attendance correction audit | Confirmed | Authorized staff | FR-ATTENDANCE |
| FEAT-MOTIVATION-001 | Weekly attendance goal | Confirmed | Member | FR-MOTIVATION |
| FEAT-RETENTION-001 | No-show rule | Confirmed | Owner | FR-RETENTION |
| FEAT-RETENTION-002 | Red-list action queue | Confirmed | Owner/Staff | FR-RETENTION |
| FEAT-FOLLOWUP-001 | Follow-up outcome/history | Confirmed | Owner/Staff | FR-FOLLOWUP |
| FEAT-FOLLOWUP-002 | Next-action scheduling | Confirmed | Owner/Staff | FR-FOLLOWUP |
| FEAT-RETURN-001 | Return-based case resolution | Confirmed | System/Staff | FR-RETENTION |
| FEAT-RENEWAL-001 | Renewal eligibility/reminders | Confirmed | Member/Owner | FR-RENEWAL |
| FEAT-RENEWAL-002 | Renewal plan selection | Confirmed | Member | FR-RENEWAL |
| FEAT-RENEWAL-003 | Renewal order | Confirmed | System | FR-RENEWAL |
| FEAT-PAYMENT-001 | Online payment lifecycle | Confirmed | Member/Owner | FR-PAYMENT |
| FEAT-PAYMENT-002 | Provider webhook verification | Confirmed | System | FR-PAYMENT |
| FEAT-PAYMENT-003 | Offline payment recording | Conditional | Staff/Owner | FR-PAYMENT |
| FEAT-RECEIPT-001 | Receipt record | Confirmed, legal fields open | Member/Staff | FR-RECEIPT |
| FEAT-ADDON-001 | Add-on catalog | Confirmed | Member/Owner | FR-ADDON |
| FEAT-ADDON-002 | Add-on order | Confirmed | Member/System | FR-ADDON |
| FEAT-ADDON-003 | PT/product usage or fulfillment | Confirmed basic scope | Staff/Owner | FR-ADDON |
| FEAT-DASHBOARD-001 | Owner operational dashboard | Confirmed | Owner | FR-DASHBOARD |
| FEAT-DASHBOARD-002 | Action queues | Confirmed | Owner/Staff | FR-DASHBOARD |
| FEAT-SUMMARY-001 | Daily owner summary | Confirmed/SHOULD | Owner | FR-NOTIFICATION |
| FEAT-NOTIFY-001 | Transactional notifications | Confirmed | Member/Owner | FR-NOTIFICATION |
| FEAT-CONSENT-001 | Communication preferences | Confirmed | Member | FR-CONSENT |
| FEAT-AUDIT-001 | Audit log | Confirmed | Authorized staff | FR-AUDIT |
| FEAT-DQ-001 | Data-quality alerts | Confirmed/SHOULD | Owner/Operations | FR-DATA-QUALITY |

## 5. Identity and Access

### FEAT-IDENTITY-001 Staff Authentication

**Phase:** P1

**Status:** Confirmed requirement, provider undecided.

**Description:** Owner, manager, and staff access protected operational functionality only after authentication.

**Dependencies:**

- user identity store,
- session/token strategy,
- role assignments,
- tenant scope.

**Non-goals:** final provider choice is not a product feature.

### FEAT-IDENTITY-002 Member Identity Verification

**Phase:** P1

**Status:** Need confirmed; exact mechanism proposed/open.

Potential methods include OTP/passwordless or another approved verified flow. Mobile number alone is not authorization proof.

### FEAT-AUTHZ-001 Scoped Authorization

Role assignment plus capability plus resource scope. Branch/gym boundaries must be enforced server-side.

## 6. Member and Membership Operations

### FEAT-MEMBER-001 Member Profile

Minimum Phase 1 profile:

- stable ID,
- display name,
- contact identifier,
- join date,
- status,
- branch context,
- communication preference linkage,
- assigned trainer reference if applicable.

### FEAT-MEMBER-002 Member Search

Authorized staff can search by:

- name,
- mobile/contact identifier,
- internal/external reference.

Search is tenant/branch scoped.

### FEAT-MEMBER-003 Controlled Import

Pilot onboarding supports validation, duplicate detection, preview, controlled write, and reconciliation.

The import process must not invent missing expiry or membership state.

### FEAT-PLAN-001 Plan Management

Owner manages reusable plan configuration while historical membership/order commercial terms remain reconstructable.

### FEAT-MEMBERSHIP-001 Membership Lifecycle

Canonical Phase 1 states:

```text
Pending
Active
Frozen
Expired
Cancelled
```

### FEAT-MEMBERSHIP-002 Freeze/Pause

Explicit interval/reason/approver where policy allows. Freeze-expiry interaction remains a business decision.

## 7. Attendance and Motivation

### FEAT-ATTENDANCE-001 QR Check-in

Core validation:

1. token/session integrity,
2. session expiry,
3. branch,
4. member identity,
5. membership eligibility,
6. duplicate policy.

Success creates one canonical attendance record.

### FEAT-ATTENDANCE-002 Assisted Check-in

Authorized staff can create assisted attendance with mandatory actor and reason.

### FEAT-ATTENDANCE-003 Attendance History

Member sees own valid attendance; authorized staff sees in-scope member attendance.

### FEAT-ATTENDANCE-004 Attendance Correction Audit

Material attendance changes retain correction context and actor. Silent hard-delete is not the normal correction mechanism.

### FEAT-MOTIVATION-001 Weekly Goal

Default Phase 1 motivation model is a weekly visit target rather than an always-on daily calendar streak.

## 8. Retention and Follow-up

### FEAT-RETENTION-001 No-show Detection

Configurable inactivity threshold. Sample starting assumption: 10 days.

Standard exclusions:

- frozen/paused,
- expired,
- cancelled.

### FEAT-RETENTION-002 Red-list Queue

Action-oriented list containing:

- member,
- last attendance,
- absent days,
- plan/expiry,
- latest follow-up,
- next action,
- assignee/status.

### FEAT-FOLLOWUP-001 Follow-up History

Initial outcomes:

- WillReturn,
- Injured,
- Travelling,
- TimingIssue,
- Unhappy,
- NoResponse,
- Cancelled.

History is append-oriented and auditable.

### FEAT-FOLLOWUP-002 Next Action

Follow-up can schedule next action, enabling overdue/actionable queues.

### FEAT-RETURN-001 Return Resolution

A valid attendance can resolve an eligible no-show case while retaining history.

## 9. Renewal, Payments, and Receipts

### FEAT-RENEWAL-001 Renewal Windows

Typical configurable stages:

```text
D-14 optional
D-7 primary
D-3 reminder
D0 expiry day
post-expiry optional service follow-up
```

### FEAT-RENEWAL-002 Renewal Offer

Member reviews duration, base price, discount, final payable amount, benefits, and applicable terms.

### FEAT-RENEWAL-003 Renewal Order

Commercial selection is persisted separately from payment.

### FEAT-PAYMENT-001 Online Payment Lifecycle

Canonical states:

```text
Created
Pending
Paid
Failed
Refunded
Reversed
```

Client payment initiation or success screen does not establish canonical success.

### FEAT-PAYMENT-002 Verified Provider Events

Webhook/API result is verified and processed idempotently. Business effect is applied exactly once.

### FEAT-PAYMENT-003 Offline Payment

Conditional feature for gyms that accept cash/manual collection. Requires explicit authority and audit semantics.

### FEAT-RECEIPT-001 Receipt

Stable receipt record linked to canonical paid transaction. Exact tax/legal requirements remain jurisdiction-dependent.

## 10. Add-ons

### FEAT-ADDON-001 Catalog

Initial categories:

- Personal Training,
- Diet/Nutrition Service,
- Product/Supplement.

### FEAT-ADDON-002 Order

Purchase creates an order distinct from reusable catalog definition.

### FEAT-ADDON-003 Usage/Fulfillment

Track operational delivery, not only payment.

Examples:

- PT sessions used/remaining,
- product fulfillment,
- service activation/validity.

Negative stock or session balance is forbidden.

## 11. Owner Operations

### FEAT-DASHBOARD-001 Operational Dashboard

Required summary areas:

- active members,
- today's check-ins,
- recent active members,
- open no-show cases,
- returned members,
- renewals due,
- amount collected,
- payment exceptions,
- add-on revenue/fulfillment.

### FEAT-DASHBOARD-002 Action Queues

- contact today,
- follow-up overdue,
- renewals due,
- payment exceptions,
- add-on fulfillment,
- data-quality issues.

### FEAT-SUMMARY-001 Daily Owner Summary

Gym-local daily summary of major operational changes and pending actions.

## 12. Communications, Audit, and Data Quality

### FEAT-NOTIFY-001 Transactional Notifications

Initial templates:

- no-show care,
- renewal reminder,
- payment success,
- payment failure,
- owner daily summary.

### FEAT-CONSENT-001 Preferences

Transactional/service communication and marketing preference are separate concepts.

### FEAT-AUDIT-001 Audit History

Sensitive operational/financial/permission mutations are attributable and reconstructable.

### FEAT-DQ-001 Data-quality Alerts

Examples:

- missing membership expiry,
- invalid date range,
- paid online record missing expected provider reference,
- correction without reason,
- negative stock/session balance.

## 13. Phase 2 Proposed Features

| ID | Feature | Status |
| --- | --- | --- |
| FEAT-CRM-001 | Lead CRM | Future/Proposed |
| FEAT-CRM-002 | Trial passes | Future/Proposed |
| FEAT-CRM-003 | Lead source/conversion | Future/Proposed |
| FEAT-TRAINER-001 | Trainer management | Future |
| FEAT-PT-001 | PT scheduling | Future |
| FEAT-CLASS-001 | Class scheduling/booking | Future |
| FEAT-BILLING-001 | Extended billing/invoices | Future |
| FEAT-MEMBER360-001 | Member 360 workspace | Future |

## 14. Phase 3 Future Features

- workout programs,
- exercise library,
- workout logging,
- measurements,
- progress photos,
- goal tracking,
- challenges,
- referrals.

These require domain-specific requirements before implementation.

## 15. Phase 4 Future SaaS Features

- multi-gym organization administration,
- multi-branch policies,
- cross-branch analytics,
- GymPulse SaaS subscriptions,
- platform administration,
- tenant onboarding,
- white-label configuration.

The data model may anticipate these boundaries, but Phase 1 UI/business behavior must remain focused.

## 16. Phase 5 Future Intelligence

- rules-based churn score,
- retention segmentation,
- renewal-risk signals,
- owner AI assistant,
- trainer AI assistant,
- natural-language analytics,
- automated CRM recommendations.

AI must not become authoritative for payment, entitlement, attendance, authorization, or medical facts.

## 17. Explicit Phase 1 Non-features

Do not block Phase 1 on:

- full trainer mobile app,
- workout program builder,
- wearables,
- AI-generated workout/diet plans,
- body transformation photo workflow,
- payroll,
- advanced commissions,
- community feed,
- referral rewards,
- advanced multi-branch reporting,
- complex inventory procurement.

## 18. Feature Entry Gate

A proposed feature enters active implementation scope only when:

1. user/business problem is documented,
2. phase/status is approved,
3. functional requirements exist,
4. permissions are defined,
5. data ownership is defined,
6. success metric exists where meaningful,
7. failure/edge cases are documented,
8. architecture impact is reviewed.

## 19. Related Documents

- `product-requirements.md`
- `functional-requirements.md`
- `non-functional-requirements.md`
- `user-journeys.md`
- `success-metrics.md`
- `../15-roadmap/mvp.md` (future canonical roadmap)
