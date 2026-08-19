# GymPulse Glossary

## Document Control

- Status: `Canonical terminology`
- Scope: Shared product and engineering language

## 1. Purpose

Define terms that must be used consistently across product, architecture, data, API, UI, analytics, and operations documentation.

## 2. Product and Tenant Terms

### Platform

The GymPulse product and control plane as a whole.

### Organization

A commercial or administrative tenant boundary that may own one or more gyms. `Proposed` as part of the multi-tenant architecture path.

### Gym

A fitness business managed within GymPulse. A gym may contain one or more branches in future phases.

### Branch

A physical operating location. Attendance, staff scope, timezone-sensitive operations, and some inventory/capacity may be branch-specific.

### Tenant Context

The authorized organization/gym/branch scope attached to a request, job, or domain operation. Tenant context must not be inferred only from client-provided IDs.

## 3. Identity Terms

### User

An authenticated system identity for owner, manager, staff, trainer, platform operator, or another operational actor.

### Member

A gym customer whose membership, attendance, renewal, services, and future fitness data may be managed by GymPulse.

A `Member` is a business-domain entity and should not be treated as identical to an authentication-provider identity.

### Principal

The authenticated actor plus resolved authorization context used to evaluate permissions.

### Role

A named grouping of capabilities such as `Owner`, `Manager`, or `FrontDesk`.

### Permission

A specific allowed capability such as `attendance.checkin.assisted`.

## 4. Membership Terms

### Plan

Reusable commercial configuration describing duration, price, benefits, active state, and other plan-level terms.

### Membership

A member's actual entitlement period associated with a plan or snapshotted commercial terms.

### Membership Freeze / Pause

An approved interval during which normal attendance/no-show eligibility may be suspended. Whether a freeze extends expiry is a gym policy and must not be assumed universally.

### Renewal Offer

The set of options and commercial terms presented to an eligible member before a renewal order is created.

### Renewal Order

The business record representing a selected renewal option. It is separate from the payment record.

## 5. Attendance Terms

### QR Session

A temporary or otherwise controlled QR check-in context for a branch. It should prevent indefinite screenshot reuse.

### Check-in

The domain operation that creates a valid attendance record after eligibility and duplicate rules are evaluated.

### Assisted Check-in

Attendance created by an authorized staff actor with a required reason when the normal member QR flow is unavailable or inappropriate.

### Attendance Correction

An auditable correction to attendance state. The original operational history must remain reconstructable.

### Duplicate Window

The configured period in which repeated check-in attempts may be treated as accidental duplicates rather than separate legitimate visits.

## 6. Retention Terms

### Inactivity Threshold

The configured number of days or policy condition used to identify a member who may require retention follow-up.

### No-show Case

An operational case created when an eligible member crosses the configured inactivity rule.

### Red List

The owner/staff action queue of members who require retention follow-up. The canonical data object is a `No-show Case`; `Red List` is primarily a UX/business term.

### Follow-up

A recorded staff contact attempt or interaction related to a retention case.

### Outcome

The result of a follow-up, for example `WillReturn`, `Injured`, `Travelling`, `TimingIssue`, `Unhappy`, `NoResponse`, or `Cancelled`.

### Next Action

The scheduled date/time or operational instruction for the next follow-up step.

### Return Resolution

Closure/resolution of a no-show case because the member has returned through a valid attendance event or another approved resolution path.

## 7. Payment Terms

### Payment

GymPulse's canonical record of a payable transaction and its lifecycle.

### Payment Provider

An external regulated payment processor used to create/verify online transactions.

### Provider Event

A provider callback/webhook event that has been authenticity-verified and translated into a canonical internal event.

### Payment Effect

The business side effect applied because of a verified successful payment, for example membership renewal or add-on activation.

### Idempotency

The property that repeating the same request/event/job does not create duplicate effective business state.

### Refund

A payment amount returned through an authorized process.

### Reversal

A payment state indicating previously successful funds/effect have been reversed according to provider or business semantics. Exact provider mapping must be specified in payment documentation.

## 8. Add-on Terms

### Add-on

An optional paid or configured gym service/product outside the base membership, initially PT, diet/nutrition service, or product/supplement.

### Add-on Order

A member-specific purchase/order of an add-on.

### Usage

Consumption of a service entitlement, such as completed PT sessions.

### Fulfillment

Delivery of a purchased product or service obligation.

## 9. Communication Terms

### Transactional / Service Communication

Communication necessary or reasonably related to the member's service, membership, payment, appointment, or operational support.

### Marketing Communication

Promotional communication that must remain separate from transactional/service preference concepts.

### Notification Intent

A canonical business request to communicate before provider-specific dispatch occurs.

### Delivery State

Provider-supported status such as scheduled, sent, delivered, failed, clicked, or converted. Unsupported states must not be fabricated.

## 10. Technical Terms

### Canonical Record

The authoritative internal business record used for deterministic state and reporting.

### Domain Event

A named internal event describing a business fact such as `attendance.created` or `payment.succeeded`.

### Background Job

Server-side scheduled or asynchronous work with explicit retry, observability, and tenant context.

### Correlation ID

Identifier used to trace related requests, jobs, logs, and integration operations.

### ADR

Architecture Decision Record documenting context, decision, alternatives, consequences, risks, and date for a major technical decision.

## 11. AI Terms

### AI Coach

A future GymPulse capability that may generate probabilistic coaching or guidance within explicitly defined safety and permission boundaries.

### Deterministic Logic

Business logic whose output is governed by explicit rules, constraints, and state. Examples include authorization, payment effect application, membership eligibility, and attendance validation.

### Probabilistic AI Behavior

Model-generated output that may vary and must not be treated as authoritative deterministic business truth.

### Guardrail

A system control that constrains AI input, tool access, output, actionability, or safety behavior.

## 12. Status Labels

### Confirmed

Approved or directly supported by current product/source decisions.

### Proposed

Recommended but not yet formally approved.

### Assumed

Temporary working assumption requiring validation.

### Future

Intentionally deferred to a later phase.

### Out of Scope

Explicitly excluded from the referenced scope.

### Deprecated

Retained for history but no longer canonical.

## 13. Naming Consistency Rules

- Use `Member`, not `customer`, when referring to a gym membership holder unless discussing commercial acquisition/CRM.
- Use `Membership` for entitlement and `Plan` for reusable commercial configuration.
- Use `No-show Case` as the canonical domain object; `Red List` is a UI queue.
- Use `Payment` for internal canonical state and `Provider Event` for external callback facts.
- Use `Organization`, `Gym`, and `Branch` only where the tenancy model applies.
- Do not use `user_id` to refer to a member identifier unless the member is explicitly represented by an authentication user relation.

## 14. Related Documents

- `project-overview.md`
- `scope.md`
- future domain documents under `../07-domains/`
