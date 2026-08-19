# GymPulse Goals

## Document Control

- Status: `Confirmed Phase 1 goals; later-phase goals proposed`
- Scope: Product and technical outcomes

## 1. Purpose

Define measurable outcomes that guide product prioritization and technical design. Goals describe the outcome to achieve; they do not prescribe a technology unless the technology itself is a required architectural property.

## 2. Phase 1 Product Goals

### G-PRODUCT-001 Reliable attendance visibility

**Status:** `Confirmed`

The gym can determine each eligible member's most recent valid attendance and distinguish QR, assisted, corrected, or invalid attendance states.

**Evidence:**

- valid check-ins appear consistently,
- duplicate protection behaves according to policy,
- corrections are reconstructable,
- owner metrics reconcile to attendance records.

### G-PRODUCT-002 Earlier retention intervention

**Status:** `Confirmed`

The gym identifies eligible inactive members before missed renewal is the first signal of disengagement.

**Evidence:**

- configurable threshold works,
- exclusions work,
- one active case exists per applicable member/rule context,
- staff can complete and record follow-up.

### G-PRODUCT-003 Measurable recovery workflow

**Status:** `Confirmed`

The system can connect an intervention to a subsequent member return without erasing the historical case.

### G-PRODUCT-004 Renewal discipline

**Status:** `Confirmed`

The gym has a visible renewal pipeline before expiry and can distinguish created, pending, paid, failed, refunded, and reversed payment outcomes.

### G-PRODUCT-005 Correct financial side effects

**Status:** `Confirmed`

Membership extension or add-on activation happens exactly once from an authoritative payable event.

### G-PRODUCT-006 Low-friction member experience

**Status:** `Confirmed direction`

Repeated Phase 1 member behavior remains simple. Check-in, membership review, and renewal should require minimal unnecessary interaction.

### G-PRODUCT-007 Staff self-sufficiency

**Status:** `Confirmed`

A trained gym team can operate the daily Phase 1 workflow without developer assistance.

### G-PRODUCT-008 Operationally useful owner view

**Status:** `Confirmed`

The owner dashboard prioritizes actions and exceptions rather than decorative reporting.

## 3. Phase 1 Technical Goals

### G-TECH-001 Tenant-safe access

**Status:** `Proposed architecture requirement`

All protected data access is scoped by authenticated identity and authorized organization/gym/branch context.

### G-TECH-002 Idempotent critical workflows

**Status:** `Confirmed architectural requirement`

Retries must not create duplicate business effects in attendance, payments, notification stages, scheduled jobs, or membership extension.

### G-TECH-003 Auditable sensitive changes

**Status:** `Confirmed architectural requirement`

Sensitive state changes retain actor, reason, timestamp, and before/after context when relevant.

### G-TECH-004 Consistent canonical state

**Status:** `Confirmed architectural requirement`

Operational metrics derive from canonical business records rather than client analytics events or UI state.

### G-TECH-005 Controlled complexity

**Status:** `Proposed`

Prefer clear modular boundaries over premature distributed services. Deployment boundaries should follow demonstrated operational need.

### G-TECH-006 Observable failures

**Status:** `Proposed`

Payment callbacks, scheduled jobs, messaging, and critical API failures must be diagnosable in production.

### G-TECH-007 Safe evolution

**Status:** `Proposed`

Schema, API, and domain changes should support backward-compatible rollout where practical and use reviewed migrations for persistent data changes.

## 4. Pilot Goals

A 30-day pilot should test whether GymPulse creates measurable operational improvement.

Primary pilot questions:

1. Is attendance accurate enough for daily operational use?
2. Can staff complete the red-list workflow consistently?
3. Do contacted at-risk members return at a measurable rate?
4. Are renewal reminders and payment states understandable?
5. Does on-time renewal improve relative to baseline?
6. Can payment exceptions be reconciled reliably?
7. Can staff operate without developer support?
8. Are add-ons actually delivered or used after purchase?

## 5. Later-Phase Goals

The following are `Future` until requirements are approved:

### G-FUTURE-001 Member fitness value

Support structured workout, exercise, progress, and potentially nutrition experiences without weakening the gym-operations core.

### G-FUTURE-002 Human coaching workflow

Support trainer/coach assignment, scheduling, plans, communication, and service delivery with clear permissions.

### G-FUTURE-003 Multi-branch SaaS

Support organizations with multiple gyms/branches, cross-branch roles, consolidated reporting, and commercial SaaS administration.

### G-FUTURE-004 AI decision support

Use permission-aware, curated operational and fitness context to assist users while keeping deterministic business truth outside the model.

## 6. Non-Goals for Phase 1

Phase 1 is not required to deliver:

- full trainer mobile app,
- workout program builder,
- exercise library,
- wearable integrations,
- detailed meal logging,
- AI-generated workout plans,
- AI-generated diet plans,
- medical diagnosis,
- transformation prediction,
- complex inventory procurement,
- payroll,
- advanced commissions,
- community feed,
- referral rewards,
- advanced multi-branch analytics,
- white-label applications.

## 7. Goal Conflicts and Priority

When goals conflict, prioritize in this order for Phase 1:

1. security and tenant isolation,
2. financial and attendance correctness,
3. auditability and recoverability,
4. core workflow completion,
5. user simplicity,
6. observability,
7. optimization and visual polish,
8. future extensibility.

Future extensibility must not justify unnecessary complexity that harms pilot reliability.

## 8. Related Documents

- `vision.md`
- `scope.md`
- `../01-product/product-requirements.md`
- future: `../01-product/success-metrics.md`
