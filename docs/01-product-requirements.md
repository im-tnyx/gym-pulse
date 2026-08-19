# GymPulse Product Requirements

## Document status

- Status: `Draft v1.0`
- Scope: Phase 1 Operations MVP
- Audience: Product, Design, Engineering, QA, Pilot Operations

## 1. Objective

Define the product behavior required for a production-capable GymPulse Phase 1 MVP.

The MVP must prove three outcomes before broader fitness-management features are added:

1. attendance is reliably visible,
2. retention risk is acted on earlier,
3. renewals and payment state are handled more consistently.

## 2. Requirement conventions

- `MUST`: required for MVP acceptance
- `SHOULD`: expected unless an implementation constraint is documented
- `MAY`: optional within Phase 1
- `FR-*`: functional requirement
- `NFR-*`: non-functional requirement
- `AC-*`: acceptance criterion

## 3. Primary users

### Member

A member MUST be able to:

- access their own membership state,
- see exact expiry date,
- check in using an eligible QR flow,
- see attendance history,
- see the configured weekly goal / streak state,
- review renewal options,
- see payment result and receipt when available,
- browse optional add-ons,
- review communication preferences where supported.

### Owner / Manager

An owner or manager MUST be able to:

- view the daily operating dashboard,
- review and filter no-show cases,
- assign or perform follow-ups,
- search members,
- manage plans and memberships,
- review renewal pipeline,
- inspect payment exceptions,
- manage add-on availability,
- inspect audit history appropriate to role,
- review core KPIs,
- receive or view a daily operating summary.

### Front Desk Staff

Front-desk staff MUST be able to:

- search a member,
- inspect membership eligibility,
- perform assisted check-in with reason,
- perform explicitly authorized membership operations,
- record follow-up outcomes,
- inspect payment status relevant to member service,
- share receipt or payment status when available.

## 4. Functional requirements

## FR-001 Tenant context

The system MUST maintain an explicit tenant context for every operational record.

Requirements:

- users MUST not access data outside authorized organization / gym / branch boundaries,
- tenant identifiers MUST be assigned server-side where possible,
- client-provided tenant IDs MUST not be trusted without authorization checks,
- background jobs MUST execute with explicit tenant context,
- audit records MUST include tenant and branch context where relevant.

Acceptance:

- a user from Tenant A cannot query, mutate, export, or infer protected records from Tenant B,
- a branch-scoped user cannot access another branch unless explicitly granted.

## FR-002 Authentication

Operational users MUST authenticate before accessing protected staff or owner functionality.

The system MUST support:

- session creation,
- session revocation,
- logout,
- protected route enforcement,
- role-aware authorization,
- secure passwordless or password-based strategy selected during implementation.

Member authentication MAY use OTP, verified mobile lookup, or another approved method. The final method is an open implementation decision.

## FR-003 Role-based authorization

Every protected operation MUST be checked against role and scope.

Examples:

- member may view only own member records,
- front desk may create assisted attendance but may not change tenant-level settings,
- owner may manage gym-level plans and rules,
- platform admin access MUST be isolated from normal tenant roles.

Detailed rules are defined in `02-user-roles-permissions.md`.

## FR-004 Member profile

The system MUST store a canonical member record containing at minimum:

- tenant context,
- branch association,
- display name,
- mobile number or other verified contact identifier,
- join date,
- member status,
- assigned trainer where applicable,
- communication preferences,
- timestamps.

The system SHOULD support:

- photo / avatar,
- emergency contact,
- notes with permission controls,
- external member reference used during migration.

## FR-005 Member status

Supported Phase 1 member status values MUST include:

- `Active`
- `Paused`
- `Expired`
- `Cancelled`
- `Blocked`

State changes MUST be authorized and auditable.

## FR-006 Plans

Owners or authorized managers MUST be able to manage membership plans.

A plan MUST support:

- name,
- duration,
- base price,
- active/inactive state,
- benefits / inclusions,
- optional discount metadata,
- applicable gym / branch scope.

Historical memberships MUST continue to reference the original commercial terms or a stored snapshot even if a plan is later edited.

## FR-007 Membership lifecycle

A membership MUST support:

- member reference,
- plan reference,
- start date,
- expiry date,
- status,
- freeze intervals,
- renewal source,
- pricing snapshot where required,
- audit timestamps.

Supported states:

- `Pending`
- `Active`
- `Frozen`
- `Expired`
- `Cancelled`

Rules:

- expiry MUST not precede start,
- active eligibility MUST be calculated server-side,
- a verified renewal MUST not create overlapping unintended membership periods,
- freeze behavior MUST be explicitly defined by gym policy.

## FR-008 Membership freeze / pause

Authorized staff MUST be able to record an approved freeze when policy allows.

A freeze MUST include:

- membership,
- start date,
- end date or open state if policy allows,
- reason,
- approving actor,
- timestamps.

Frozen periods MUST exclude the member from standard no-show risk logic.

Whether freeze extends expiry is a configurable policy and MUST not be assumed globally.

## FR-009 QR session generation

The gym MUST be able to expose a QR session suitable for check-in.

The QR mechanism SHOULD be rotating or session-bound rather than indefinitely reusable.

A QR session MUST support:

- branch,
- issued time,
- expiry time,
- status,
- opaque token / signed identifier,
- optional rotation sequence.

The QR payload MUST not expose sensitive internal identifiers unnecessarily.

## FR-010 QR check-in validation

A member check-in MUST validate:

1. QR/session integrity,
2. QR/session expiry,
3. branch context,
4. member identity,
5. membership eligibility,
6. duplicate-scan rule.

On success the system MUST:

- create exactly one attendance record,
- return check-in success,
- update weekly goal/streak,
- trigger eligible no-show case resolution,
- make the attendance visible to owner metrics.

## FR-011 Duplicate attendance protection

The system MUST reject accidental duplicate check-ins inside a configurable time window.

Duplicate protection MUST distinguish:

- a retry of the same client request,
- a repeated QR scan,
- a legitimate later visit if the gym permits multiple visits per day.

The selected policy MUST be configurable or documented per gym.

## FR-012 Assisted check-in

Authorized staff MUST be able to create an assisted attendance record when normal QR flow cannot be used.

Required fields:

- member,
- branch,
- staff actor,
- reason,
- timestamp,
- source = `assisted`.

Assisted attendance MUST be auditable.

## FR-013 Attendance history

Members MUST be able to view their own valid attendance history.

Authorized staff MUST be able to view member attendance history.

Records SHOULD show:

- date,
- time,
- source,
- branch,
- correction state if relevant.

## FR-014 Attendance correction

Attendance MUST NOT be silently edited or deleted when a correction affects operational reporting.

A correction MUST retain:

- actor,
- reason,
- original value or reference,
- corrected value or compensating record,
- timestamp.

Financially or operationally relevant history must remain reconstructable.

## FR-015 Weekly goal / streak

The system MUST support a fair attendance motivation rule.

Phase 1 MUST support at least:

- weekly visit target.

The data model SHOULD allow later support for:

- planned-visit streak,
- challenge-specific calendar streak.

Approved rest days and freezes MUST not create misleading streak behavior.

## FR-016 No-show rule configuration

Owner or authorized manager MUST be able to configure the inactivity threshold.

Sample default: `10 days`.

The rule MUST identify eligible members based on last valid attendance and membership state.

## FR-017 No-show eligibility

The standard no-show scan MUST exclude members whose relevant membership is:

- frozen,
- paused according to policy,
- expired,
- cancelled.

Blocked members SHOULD be excluded unless the business explicitly requires a separate workflow.

## FR-018 No-show case creation

When an eligible member crosses the configured threshold, the system MUST create no more than one active case for the applicable rule context.

A case MUST include:

- member,
- tenant / branch,
- threshold date,
- last valid attendance,
- absent-day count or derivable value,
- status,
- assignee where used,
- next action date,
- timestamps.

## FR-019 Red-list queue

Owner and authorized staff MUST have an actionable risk queue.

The queue MUST support at least:

- member name,
- contact action,
- plan,
- expiry,
- last visit,
- absent days,
- latest follow-up outcome,
- next action,
- status.

Filters SHOULD include:

- inactivity range,
- expiring soon,
- follow-up due,
- assignee,
- branch.

## FR-020 Follow-up history

Staff MUST be able to record contact attempts and outcomes.

Initial outcomes:

- `WillReturn`
- `Injured`
- `Travelling`
- `TimingIssue`
- `Unhappy`
- `NoResponse`
- `Cancelled`

Each follow-up MUST store:

- case,
- channel,
- outcome,
- note if provided,
- actor,
- timestamp,
- next action date where applicable.

Past follow-up entries MUST remain available.

## FR-021 Follow-up concurrency

The product SHOULD reduce the chance that multiple staff contact the same member simultaneously.

At minimum the system SHOULD expose:

- current assignee,
- recent contact state,
- next action date.

A future implementation MAY add explicit case locking or claim semantics.

## FR-022 No-show resolution

A valid return attendance MUST resolve an eligible open no-show case according to configured rules.

The case MUST preserve history and record:

- resolution type,
- resolution time,
- return attendance reference where applicable.

An approved pause MAY close or suspend the case according to gym policy.

## FR-023 Renewal eligibility

The system MUST identify memberships approaching expiry using configured windows.

Typical windows:

- 14 days before,
- 7 days before,
- 3 days before,
- expiry day,
- optional post-expiry service follow-up.

The exact schedule MUST be configurable.

## FR-024 Renewal offer

The member MUST be shown sufficient information before payment:

- current plan / expiry context,
- available renewal options,
- duration,
- base price,
- discount if any,
- final payable amount,
- included benefits,
- applicable cancellation / refund terms,
- secure payment action.

## FR-025 Renewal order

Selecting a renewal option MUST create or identify a renewal order separate from the payment record.

The renewal order SHOULD snapshot:

- selected plan,
- amount,
- discount,
- member,
- membership being renewed,
- commercial terms,
- status.

## FR-026 Payment lifecycle

Online payment states MUST include:

- `Created`
- `Pending`
- `Paid`
- `Failed`
- `Refunded`
- `Reversed`

Payment initiation MUST NOT extend a membership.

Only a verified success MUST produce the membership effect.

## FR-027 Payment verification

For online payments, the payment provider or a verified provider API result is the source of truth.

The system MUST:

- verify webhook authenticity using provider-supported mechanism,
- persist provider references,
- process duplicate callbacks idempotently,
- preserve provider event history relevant to reconciliation.

## FR-028 Payment idempotency

A verified payment MUST activate or extend the relevant membership or add-on exactly once.

Repeated webhook delivery, retries, or worker retries MUST NOT:

- extend expiry twice,
- issue multiple effective receipts,
- duplicate add-on quantity,
- double count collected revenue.

## FR-029 Offline payment support

If cash or manually verified offline payment is enabled, it MUST use a separate authorized flow.

The flow MUST record:

- method,
- amount,
- collecting actor,
- timestamp,
- optional reference,
- approval requirement if configured.

Offline payment MUST not reuse online provider-verification semantics deceptively.

## FR-030 Receipt

A successful payable transaction SHOULD generate a receipt record containing:

- receipt number,
- member,
- payment,
- amount,
- method,
- issued timestamp,
- gym legal / display information required by configured policy.

Receipt and invoice requirements must be validated for the target business before production rollout.

## FR-031 Add-on catalogue

The system MUST support initial categories:

- Personal Training,
- Diet / Nutrition Service,
- Product / Supplement.

An add-on MUST support:

- title,
- category,
- description / outcome,
- price,
- validity,
- stock or capacity where applicable,
- active status.

## FR-032 Add-on trust rules

The system MUST NOT pre-select paid add-ons.

Before purchase it SHOULD show relevant:

- price,
- validity,
- session count,
- trainer / professional information,
- stock,
- cancellation / expiry terms.

Medical or nutrition claims MUST not be represented as guarantees.

## FR-033 Add-on order and usage

An add-on purchase MUST create an order separate from catalog configuration.

The system MUST prevent:

- negative product stock,
- negative PT remaining sessions,
- duplicate activation from repeated payment events.

Owner reporting SHOULD distinguish purchase from actual usage / fulfillment.

## FR-034 Owner dashboard

The owner dashboard MUST prioritize actions.

Required cards / summaries:

- active members,
- today's check-ins,
- recent active members,
- open no-show cases,
- returned members,
- renewals due,
- renewal collection,
- payment exceptions,
- add-on revenue / usage alerts.

Required queues:

- members to contact,
- overdue follow-ups,
- renewal actions,
- failed / pending payment actions,
- fulfillment actions,
- data-quality alerts.

## FR-035 Daily owner summary

The system SHOULD generate a daily summary in the gym timezone containing:

- check-ins,
- new risk cases,
- follow-ups completed and due,
- renewals paid and pending,
- payment exceptions,
- add-on orders / usage alerts,
- upcoming PT actions when scheduling exists.

## FR-036 Notification templates

The system MUST support transactional templates for at least:

- no-show care,
- renewal reminder,
- payment success,
- payment failure,
- owner daily summary.

PT reminder becomes required when PT scheduling enters the enabled scope.

## FR-037 Notification deduplication

The system MUST avoid duplicate business messages caused by job retries.

Each scheduled notification SHOULD have a deterministic deduplication key based on:

- tenant,
- member / recipient,
- template stage,
- business object,
- cycle / effective date.

## FR-038 Consent and preferences

The system MUST keep service / transactional communication separate from marketing preferences.

The product MUST support opt-out controls where required by channel and policy.

Notification workers MUST consult relevant preference state before dispatch.

## FR-039 Notification delivery tracking

Notification status SHOULD support:

- `Scheduled`
- `Sent`
- `Delivered`
- `Failed`
- `Clicked`
- `Converted`
- `OptedOut`

Provider capabilities may limit some states. Unsupported states MUST not be fabricated.

## FR-040 Audit log

Sensitive actions MUST produce audit records.

Minimum auditable actions:

- attendance correction,
- assisted check-in,
- membership state change,
- freeze creation / change,
- price-sensitive renewal changes,
- payment state change performed by staff,
- refund / reversal processing,
- follow-up correction,
- permission change,
- configuration change affecting risk or renewal logic.

## FR-041 Data-quality alerts

The system SHOULD detect operational inconsistencies, including:

- membership missing expiry,
- invalid membership date range,
- paid online payment lacking expected provider reference,
- attendance correction missing reason,
- negative stock,
- negative session balance,
- unsupported state transitions.

## FR-042 Search

Authorized staff MUST be able to search members by at least:

- name,
- mobile number,
- internal member reference where available.

Search results MUST respect tenant and branch authorization.

## FR-043 Import

The pilot SHOULD support controlled import of existing member data.

Import MUST provide:

- validation errors,
- duplicate detection strategy,
- source-row traceability where practical,
- reconciliation count.

The final imported active-member count MUST be compared with the gym source record before pilot activation.

## FR-044 Export

Owner-authorized exports MAY be supported for operational data.

If enabled, exports MUST:

- respect tenant scope,
- be auditable for sensitive datasets,
- avoid exposing unnecessary protected data.

## FR-045 Settings

Gym-level settings MUST support at least:

- timezone,
- inactivity threshold,
- duplicate attendance window,
- weekly-goal rule,
- renewal reminder windows,
- communication configuration,
- basic receipt / business profile configuration.

Settings that affect historical calculations MUST have clear effective behavior.

## 5. Non-functional requirements

## NFR-001 Tenant isolation

Tenant isolation is mandatory across:

- API queries,
- database access,
- exports,
- jobs,
- storage paths,
- analytics events,
- admin tooling.

## NFR-002 Security

The system MUST implement:

- least privilege,
- secure secret handling,
- protected staff routes,
- server-side authorization,
- secure webhook validation,
- sensitive-action auditability.

Security details are defined in `12-security-audit.md`.

## NFR-003 Reliability

Critical workflows MUST tolerate retries.

Idempotency is mandatory for:

- QR request retries,
- payment callbacks,
- membership extension,
- add-on activation,
- scheduled reminders,
- daily no-show case creation.

## NFR-004 Data consistency

Business state transitions MUST occur atomically where partial completion would create inconsistent records.

Examples:

- payment success + effect ledger,
- attendance + deduplication marker,
- no-show case creation uniqueness.

## NFR-005 Performance

Target behavior:

- QR check-in should feel immediate under normal mobile connectivity,
- member search should return quickly for normal gym-scale datasets,
- owner risk and renewal queues should use indexed queries,
- dashboard should avoid expensive unbounded scans.

Exact SLOs will be set after implementation environment and pilot volume are known.

## NFR-006 Mobile-first UX

Phase 1 member interactions MUST be optimized for mobile.

Staff and owner critical actions SHOULD remain usable on small screens even if the primary owner interface is web-based.

## NFR-007 Accessibility

UI SHOULD provide:

- readable contrast,
- keyboard accessibility for web workflows,
- meaningful labels,
- touch targets suitable for mobile,
- non-color-only status communication.

## NFR-008 Observability

Production MUST expose:

- structured application logs,
- error reporting,
- job execution visibility,
- payment webhook diagnostics,
- notification failure diagnostics,
- traceable request or correlation identifiers for critical workflows.

## NFR-009 Timezone correctness

Gym-local business rules MUST use the gym timezone.

Examples:

- daily no-show scan,
- renewal reminder schedule,
- dashboard day boundaries,
- daily summary.

Timestamps SHOULD be stored in UTC and rendered in authorized local timezone.

## NFR-010 Audit retention

Audit-sensitive records MUST not be destructively removed through normal product flows.

Retention policy must be finalized before production based on operational and legal needs.

## NFR-011 Backup and recovery

Production data MUST have a documented backup and restore strategy.

A backup is not considered sufficient unless restore procedure is tested.

## NFR-012 Configuration safety

High-impact settings SHOULD have:

- validation,
- clear descriptions,
- confirmation for destructive changes,
- audit trail,
- reasonable defaults.

## NFR-013 Privacy minimization

The product SHOULD collect only data required for enabled workflows.

Health-sensitive or medical data MUST not be added casually to Phase 1 simply because the platform operates in fitness.

## NFR-014 Maintainability

Business rules MUST be separated from presentation logic.

Shared validation, domain types, and policy logic SHOULD live in reusable packages or server modules rather than duplicated across clients.

## NFR-015 Testability

Critical business rules MUST be testable without relying only on end-to-end UI tests.

Payment, attendance, no-show, membership, and notification rules require deterministic unit / integration coverage.

## 6. MVP acceptance criteria

The MVP may enter a controlled real-gym pilot only when all critical criteria pass.

### Attendance

- AC-001 valid QR produces exactly one valid attendance record,
- AC-002 expired QR is rejected,
- AC-003 invalid QR is rejected,
- AC-004 inactive membership is rejected,
- AC-005 duplicate scan inside configured window is rejected without losing first valid attendance,
- AC-006 assisted check-in stores staff actor and reason,
- AC-007 attendance correction is auditable.

### Retention

- AC-008 eligible inactive member enters no-show queue at threshold,
- AC-009 frozen / paused / expired / cancelled membership is excluded,
- AC-010 duplicate open cases are not created by repeated scan jobs,
- AC-011 follow-up outcome persists,
- AC-012 required next action persists,
- AC-013 valid return attendance resolves eligible case,
- AC-014 historical case and contact records remain visible.

### Renewal and payment

- AC-015 memberships due in configured windows appear in renewal pipeline,
- AC-016 member sees final payable amount and terms,
- AC-017 payment initiation does not extend membership,
- AC-018 verified success extends membership exactly once,
- AC-019 duplicate callback does not extend membership twice,
- AC-020 failed payment remains failed and actionable,
- AC-021 refund and reversal are represented and auditable,
- AC-022 receipt maps to the successful transaction.

### Add-ons

- AC-023 add-on is never pre-selected,
- AC-024 unavailable / insufficient stock blocks invalid fulfillment,
- AC-025 PT session balance cannot become negative,
- AC-026 duplicate payment callback does not activate add-on twice.

### Notifications

- AC-027 one renewal stage is not repeatedly sent because of job retry,
- AC-028 notification respects relevant opt-out / channel preference,
- AC-029 verified renewal stops future renewal stages for the cycle,
- AC-030 failed delivery remains diagnosable.

### Authorization and security

- AC-031 cross-tenant record access is denied,
- AC-032 branch-scoped user cannot access unauthorized branch data,
- AC-033 member cannot access another member's protected records,
- AC-034 high-impact staff actions are attributable to actor.

### Dashboard and reconciliation

- AC-035 dashboard check-in count reconciles to valid attendance records,
- AC-036 open no-show count reconciles to active cases,
- AC-037 renewal collection reconciles to valid successful payment effects,
- AC-038 owner can identify pending operational actions without opening raw database views.

### Pilot operability

- AC-039 source member count and imported active-member count reconcile,
- AC-040 staff can complete daily check-in and follow-up workflows after training,
- AC-041 owner can review renewals and payment exceptions,
- AC-042 critical workflows can be run without developer intervention.

## 7. Deferred requirements

The following remain deliberately outside Phase 1 unless explicitly promoted:

- lead CRM,
- class booking,
- trainer app,
- workout builder,
- nutrition prescription workflows,
- progress photo storage,
- wearable integration,
- payroll,
- advanced commissions,
- multi-branch analytics,
- AI recommendations,
- white-label mobile applications.

## 8. Open requirements

The following require owner / pilot confirmation before production behavior is finalized:

- check-in duplicate window,
- whether multiple same-day visits are valid,
- exact pause / freeze rules,
- whether freeze extends expiry,
- payment provider,
- offline payment policy,
- receipt / invoice requirements,
- renewal reminder windows,
- approved communication channels,
- marketing consent source,
- fair weekly-goal rule,
- add-on cancellation / expiry policy,
- stock ownership and reconciliation process.

These are tracked in `16-open-decisions.md`.
