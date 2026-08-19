# GymPulse Product Requirements

## Status

Draft v0.1

## Objective

Define the minimum product requirements for the first production-capable GymPulse MVP.

## Primary users

### Member

Must be able to:

- View current membership status and expiry.
- Check in using a valid gym QR.
- View attendance history.
- View fair weekly goal / streak information.
- Review renewal options.
- See payment status and receipt.
- Browse optional PT, diet, and product add-ons.
- Control communication preferences where applicable.

### Owner / Manager

Must be able to:

- See daily operational dashboard.
- View and act on no-show cases.
- Search members.
- Manage memberships and plans.
- Review renewal pipeline.
- Review payment state.
- Manage add-ons.
- Review follow-up history.
- Receive a daily owner summary.

### Front Desk Staff

Must be able to:

- Search members.
- Perform assisted check-in with reason.
- Activate valid memberships where authorized.
- Confirm operational payment state after provider verification.
- Record follow-up outcomes.

## Functional requirements

### FR-001 Authentication and tenancy

- Every authenticated operational user belongs to a tenant context.
- Data access must be scoped to organization / gym / branch permissions.
- Member access must be restricted to the member's own records unless explicitly authorized.

### FR-002 Memberships

- Store plan, start date, expiry date, status, and freeze periods.
- Support `Pending`, `Active`, `Frozen`, `Expired`, and `Cancelled` membership states.
- Paused or frozen memberships must not enter no-show risk workflows.

### FR-003 QR attendance

- Accept only a valid QR session.
- Validate active membership.
- Reject duplicate scans within a configured window.
- Record source, timestamp, and QR session identifier.
- Assisted check-in must require staff actor and reason.

### FR-004 No-show detection

- Configurable inactivity threshold.
- Create no more than one active case for the same member and rule.
- Exclude ineligible membership states.
- Store threshold date, last valid attendance, risk days, status, assignee, and next action.

### FR-005 Follow-ups

- Support outcomes including `Will return`, `Injured`, `Travelling`, `Timing issue`, `Unhappy`, `No response`, and `Cancelled`.
- Preserve history instead of overwriting past contacts.
- Support next-action scheduling.
- Resolve relevant open case after a valid member return.

### FR-006 Renewal

- Support configurable reminder windows.
- Show exact plan, discount, final amount, benefits, and terms.
- Do not extend membership from a payment initiation event.
- Extend only after verified provider success.

### FR-007 Payments

- Payment provider is the source of truth for payment result.
- Never store raw card or UPI credentials.
- Handle duplicate callbacks idempotently.
- Store refunds and reversals as separate auditable states.

### FR-008 Add-ons

- Support PT, diet / nutrition services, and product add-ons.
- Add-ons must not be pre-selected.
- Store exact price, validity, capacity / stock, and active status.
- Prevent negative stock or usage balances.

### FR-009 Owner dashboard

Dashboard must prioritize actions and show at least:

- Active members
- Today's check-ins
- Open no-show cases
- Returned members
- Renewals due
- Renewal collection
- Failed payments
- Add-on revenue / utilization alerts

### FR-010 Notifications

- Support transactional communication templates.
- Preserve consent and opt-out controls.
- Avoid sending repeated renewal stages after payment / cancellation / opt-out.
- Marketing and service communication controls must remain separate.

### FR-011 Auditability

Must retain audit data for:

- Attendance corrections
- Membership changes
- Payment state changes
- Refunds / reversals
- Follow-ups
- Staff-assisted actions

## Non-functional requirements

### NFR-001 Security

- Tenant isolation is mandatory.
- Least-privilege role access.
- Sensitive actions must be attributable to an actor.

### NFR-002 Reliability

- Payment and automation workflows must be idempotent.
- Scheduled jobs must tolerate retries.
- Duplicate QR and duplicate payment callback cases must be explicitly tested.

### NFR-003 Observability

Production services should expose:

- Structured logs
- Error reporting
- Job / automation failure visibility
- Payment webhook diagnostics

### NFR-004 Performance

- Member check-in should feel immediate under normal network conditions.
- Owner red-list and daily dashboard queries should be indexed for tenant, branch, membership status, attendance date, and next-action date.

### NFR-005 Mobile-first UX

- Member flows should require very few taps.
- High-priority owner actions must remain usable on mobile screens.

## MVP acceptance criteria

The MVP is ready for a real pilot when:

1. Valid and invalid QR states are tested.
2. Duplicate scans are safely rejected.
3. Paused / frozen members do not enter the red list.
4. Follow-up outcome and next action persist correctly.
5. Return attendance resolves eligible cases.
6. Renewal payment does not extend membership before verification.
7. Failed, refunded, and reversed payment states are tested.
8. Consent and opt-out behavior works.
9. Dashboard metrics reconcile with source records.
10. Front-desk staff can run the daily workflow without developer intervention.
