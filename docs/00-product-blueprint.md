# GymPulse Product Blueprint

## Document status

- Status: `Draft v1.0`
- Product: `GymPulse`
- Repository: `im-tnyx/gym-pulse`
- Purpose: master product definition for product, design, engineering, QA, pilot, and commercial planning

## 1. Executive summary

GymPulse is a gym operations and member-retention platform designed for local gyms, fitness studios, and eventually multi-branch fitness businesses.

The initial product is not intended to become a generic fitness super-app. Its first responsibility is to make the daily gym operating loop measurable and actionable:

`Record attendance -> detect disengagement -> contact early -> recover member -> collect renewal -> deliver relevant add-ons -> measure outcome`

The platform should reduce dependence on paper registers, spreadsheets, staff memory, disconnected WhatsApp conversations, and manual renewal chasing.

The first production milestone is successful when a real gym can run its daily attendance, retention, follow-up, renewal, and basic add-on workflow without developer assistance.

## 2. Source basis and GymPulse extensions

### 2.1 Source-derived foundation

The uploaded Gym App Blueprint defines the following core ideas that GymPulse keeps:

- QR-based attendance
- configurable inactivity detection
- no-show / red-list workflow
- follow-up outcomes and next actions
- member streak / weekly attendance goal
- renewal reminders before expiry
- verified payment state before membership extension
- PT, diet, and product add-ons
- owner operational dashboard
- daily owner summary
- data-quality alerts
- auditability for attendance, payment, and follow-up history
- seven-day prototype sequence
- thirty-day real-gym pilot

### 2.2 GymPulse product extensions

The following are deliberate extensions beyond the source blueprint:

- standalone commercial product positioning
- multi-tenant SaaS architecture
- organizations, gyms, and branches
- platform administration
- stronger role and permission model
- lead CRM and trial conversion
- trainer scheduling and class booking
- member 360 profile
- workout and progress modules
- SaaS subscription billing
- rules-based churn scoring
- AI-assisted analytics after reliable operational data exists

These extensions must not expand Phase 1 scope unless explicitly approved.

## 3. Product vision

GymPulse should become the operating system for a gym's member lifecycle, from joining through attendance, engagement, renewal, services, and retention.

The product should answer operational questions before analytical ones. A gym owner should open GymPulse and immediately know what needs action today.

### Vision statement

> Give every gym a reliable, auditable operating loop that makes member activity visible, catches retention risk early, and improves the consistency of renewals and service delivery.

## 4. Primary business problems

### P-01 Silent member churn

A member can stop attending for days or weeks before staff notices. By the time the missed renewal reveals the problem, the member may already have disengaged mentally.

GymPulse response:

- record reliable attendance
- calculate inactivity
- surface eligible at-risk members
- assign follow-up
- track contact outcome
- resolve the case when the member returns

### P-02 Attendance without action

Many gyms can record attendance but cannot convert it into a daily retention workflow.

GymPulse response:

- attendance becomes an input to risk detection
- owner sees actionable queues, not only totals
- attendance corrections remain auditable

### P-03 Late and manual renewals

Membership renewals are often chased manually after expiry.

GymPulse response:

- configurable pre-expiry reminder windows
- clear renewal offers
- verified payment lifecycle
- renewal pipeline for owner and staff
- failed-payment recovery workflow

### P-04 Fragmented member operations

Memberships, attendance, payments, PT usage, follow-up notes, and communication can exist in separate tools.

GymPulse response:

- a common member identity
- linked operational records
- visible history
- consistent role permissions

### P-05 Unmeasured retention work

Staff may call members without recording outcomes, making it impossible to know whether follow-up actually works.

GymPulse response:

- mandatory outcomes
- next-action date
- return attribution
- recovery metrics

### P-06 Add-on sales without delivery visibility

A PT package or product sale can be recorded without tracking utilization or fulfillment.

GymPulse response:

- add-on order lifecycle
- usage / fulfillment state
- capacity and stock checks
- revenue and utilization reported separately

## 5. Product goals

### G-01 Attendance visibility

The gym can reliably determine the last valid attendance of every active member.

### G-02 Early retention intervention

Eligible inactive members enter a clear follow-up queue before renewal loss is discovered.

### G-03 Renewal discipline

Upcoming expiries, payment states, and renewal outcomes remain visible and auditable.

### G-04 Simple member behavior

The repeated member action in Phase 1 should remain lightweight. QR check-in is the primary repeated behavior.

### G-05 Staff operability

Front-desk and management staff can complete common tasks without developer assistance.

### G-06 Data integrity

Financial, attendance correction, and follow-up history cannot be silently rewritten to make reports cleaner.

### G-07 Commercial extensibility

The core domain should be capable of evolving into a multi-tenant SaaS without redesigning identity and tenancy later.

## 6. Non-goals for Phase 1

Phase 1 must not be blocked by:

- full trainer mobile application
- workout program builder
- exercise library
- wearables
- AI-generated workouts
- AI-generated diet plans
- transformation photo workflows
- payroll
- advanced trainer commissions
- complex inventory procurement
- community feed
- referral rewards
- advanced multi-branch analytics
- white-label mobile apps

## 7. Target customers

### Initial ideal customer profile

- one local Indian gym or fitness studio
- one location or a very small number of locations
- owner-operated or manager-operated
- attendance currently managed by register, spreadsheet, biometric, card, or a basic app
- renewal follow-up is partially manual
- WhatsApp and phone calls are common communication channels
- PT or other add-ons are sold

### Future customer segments

- gym chains
- boutique fitness studios
- yoga studios
- personal-training studios
- CrossFit-style boxes
- wellness clubs

Support for these future segments must be validated before product-specific behavior is generalized.

## 8. User roles

### Phase 1

#### Member

Primary goals:

- check in
- see membership and expiry
- see attendance / weekly goal
- review renewal options
- make or review payment
- browse relevant optional add-ons
- control communication preferences

#### Owner / Manager

Primary goals:

- know what requires action today
- review at-risk members
- review renewals and payment exceptions
- review returns after follow-up
- manage plans, memberships, add-ons, and staff access
- understand operational KPIs

#### Front Desk Staff

Primary goals:

- find member quickly
- assist check-in
- activate or update membership when authorized
- record payment-related operational actions
- record follow-up outcomes

### Later roles

- Trainer
- Sales Staff
- Branch Manager
- Organization Admin
- Finance / Accountant
- Platform Support
- Platform Admin

Role behavior is specified in `02-user-roles-permissions.md`.

## 9. Product principles

### 9.1 Action before decoration

Operational lists are more important than decorative charts.

A metric should help answer questions such as:

- who should be contacted?
- which membership expires soon?
- which payment failed?
- who returned after intervention?
- what still needs fulfillment?

### 9.2 Verified state before financial effect

Payment initiation is not payment success.

Membership extension, add-on activation, and receipt issuance must only happen after a verified provider result or an explicitly authorized offline-payment workflow.

### 9.3 Idempotency by design

QR, payment webhook, notification, automation, and membership-extension workflows must tolerate retries without creating duplicate business effects.

### 9.4 Audit operational mutations

Sensitive corrections and state transitions must preserve actor, timestamp, reason, and before/after context where relevant.

### 9.5 Fair motivation

Streaks must not punish normal rest days or approved pauses. The default motivation model should prefer weekly planned-visit completion over a daily calendar streak.

### 9.6 Consent separation

Transactional or service communication and marketing communication must use separate consent concepts.

### 9.7 Progressive complexity

Advanced fitness, AI, and multi-branch features are added only after reliable operational behavior is established.

## 10. Phase 1 domain

### Tenant hierarchy

```text
Platform
  -> Organization
      -> Gym
          -> Branch
              -> Staff
              -> Members
```

For the first pilot, `Organization`, `Gym`, and `Branch` may represent a simple one-to-one structure. They still exist in the data model so tenant isolation is explicit from day one.

### Core entities

- Organizations
- Gyms
- Branches
- Users
- UserRoles
- Members
- Plans
- Memberships
- MembershipFreezes
- Attendance
- QRSession
- Streaks / WeeklyGoals
- NoShowCases
- FollowUps
- RenewalOffers / RenewalOrders
- Payments
- PaymentEvents
- Receipts
- AddOns
- AddOnOrders
- AddOnUsage
- Notifications
- NotificationPreferences
- Settings
- AuditLogs

Detailed schema is defined in `06-database-schema.md`.

## 11. Phase 1 functional modules

### 11.1 Authentication and tenant context

- authenticated operational users
- member authentication or verified member lookup flow
- tenant-scoped access
- branch-scoped permissions
- session management
- least-privilege access

### 11.2 Member management

- member identity and contact details
- join date
- member status
- current membership
- assigned trainer where applicable
- communication preferences
- operational notes with controlled access

### 11.3 Plans and memberships

- plan name
- duration
- base price
- discount rules where supported
- benefits
- membership start and expiry
- pause / freeze intervals
- membership state
- renewal source

### 11.4 QR attendance

Member flow:

1. member scans the current gym QR
2. server validates QR session
3. server validates membership eligibility
4. duplicate window is checked
5. attendance is recorded exactly once
6. streak / weekly goal is recalculated
7. eligible open no-show case is resolved
8. success state is returned

Required failure states:

- invalid QR
- expired QR session
- inactive membership
- expired membership
- duplicate scan
- branch mismatch
- temporary network failure
- offline queued state if offline mode is implemented

### 11.5 Assisted check-in

Front desk can record attendance only with:

- authenticated staff actor
- member selection
- explicit source `assisted`
- mandatory reason
- audit record

### 11.6 No-show risk and red list

Default sample threshold: `10 days`, configurable per gym.

Eligibility rules:

- active member
- active eligible membership
- not paused / frozen
- not cancelled
- not expired
- inactivity threshold crossed

Each open case contains:

- member
- branch
- threshold date
- last valid attendance
- current absent days
- assignee
- status
- most recent outcome
- next action date

No duplicate active case may exist for the same member and rule context.

### 11.7 Follow-up workflow

Initial outcomes:

- Will return
- Injured
- Travelling
- Timing issue
- Unhappy
- No response
- Cancelled

Rules:

- contact history is append-only
- correction creates a new correction/audit action rather than silently deleting history
- next action may be required based on outcome
- return attendance can resolve a relevant case
- approved pause may transition the case out of active follow-up according to policy

### 11.8 Weekly goal / streak

Supported policy types:

- planned-visit streak
- weekly visit target
- calendar streak for challenge-specific use only

Phase 1 recommendation:

`weekly visit target`

Example: `3 of 4 planned visits completed this week`.

### 11.9 Renewal

Typical reminder stages:

- optional 14 days before
- main reminder 7 days before
- reminder 3 days before
- expiry day
- service follow-up after expiry if allowed

Rules:

- each stage sends at most once per renewal cycle unless a deliberate retry is required for delivery failure
- stop future reminders after verified renewal, cancellation, or relevant opt-out
- show final payable amount and terms before payment
- renewal order and payment are separate records

### 11.10 Payments

Required payment states:

- Created
- Pending
- Paid
- Failed
- Refunded
- Reversed

Rules:

- provider result is authoritative for online payments
- never store raw card or UPI credentials
- duplicate provider callbacks are idempotent
- payment event history is retained
- membership effect occurs exactly once
- refund and reversal remain visible as separate financial history

### 11.11 Add-ons

Initial categories:

- Personal Training
- Diet / nutrition service
- Products / supplements

Rules:

- never pre-select an add-on
- show price and validity
- show session count / capacity where applicable
- show stock where applicable
- validate trainer availability before relevant payment when scheduling is required
- track utilization or fulfillment after purchase

### 11.12 Owner dashboard

Top operational cards:

- active members
- today's valid check-ins
- active members in recent period
- open no-show cases
- members returned after follow-up
- renewals due in configured window
- renewal amount collected
- failed / pending payments
- add-on revenue
- fulfillment / usage alerts

Action queues:

- contact today
- follow-up overdue
- renewals due
- payment exceptions
- add-on fulfillment
- data-quality issues

### 11.13 Notifications

Initial transactional message types:

- no-show care message
- renewal reminder
- payment success
- payment failed
- PT session reminder
- owner daily summary

All communication must respect channel availability, relevant consent policy, deduplication, and delivery state.

### 11.14 Data-quality alerts

Examples:

- membership missing expiry
- active membership with invalid date range
- paid online payment without provider reference
- attendance correction without reason
- negative stock
- negative PT usage balance
- trainer double booking when scheduling exists

## 12. State models

### Member

`Active | Paused | Expired | Cancelled | Blocked`

### Membership

`Pending | Active | Frozen | Expired | Cancelled`

### No-show case

`Open | Contacted | FollowUpDue | Returned | Closed`

### Payment

`Created | Pending | Paid | Failed | Refunded | Reversed`

### Add-on order

`Pending | Paid | Active | Completed | Cancelled | Refunded`

### Notification

`Scheduled | Sent | Delivered | Failed | Clicked | Converted | OptedOut`

State transitions must be validated server-side, not trusted from client UI.

## 13. Core end-to-end journeys

### Healthy active member

`Check-in -> attendance recorded -> weekly goal updated -> renewal reminder -> verified payment -> membership extended`

### Silent churn risk

`No attendance -> threshold crossed -> no-show case -> staff contact -> outcome -> next action / pause -> return check-in -> case resolved`

### Renewal exception

`Renewal order -> payment pending -> failed -> retry/help -> provider success -> idempotent membership extension -> receipt`

### Add-on purchase

`Relevant optional offer -> details -> availability/stock check -> payment -> activation -> usage/fulfillment -> owner visibility`

### Front-desk assisted member

`Search member -> assisted check-in -> mandatory reason -> attendance record -> member confirmation -> audit trail`

Detailed diagrams are in `03-user-flows.md`.

## 14. Success metrics

### Attendance

- QR check-in adoption
- attendance correction rate
- weekly active member rate
- average valid visits per active member

### Retention

- red-list contact rate
- contact-to-return rate
- average days from contact to return
- churn reason distribution
- recovered membership value

### Renewal

- renewal-before-expiry rate
- reminder-to-payment conversion
- failed-payment recovery rate
- average renewal delay
- renewal plan mix

### Add-ons

- relevant-offer view-to-purchase rate
- PT package utilization
- add-on revenue per active member
- refund / cancellation rate
- repeat add-on purchase rate

### Operations

- follow-up completion rate
- overdue next actions
- daily staff workflow completion
- data-quality issue count
- time-to-resolution for payment and membership exceptions

Metric formulas are defined in `11-analytics-kpis.md`.

## 15. MVP launch criteria

The first pilot build is not ready until all of the following are true:

- gym profile, timezone, plans, pricing, and membership rules are confirmed
- active-member import reconciles with source records
- expiry and freeze behavior is validated
- QR screenshot cannot be reused indefinitely if rotating/session QR is enabled
- duplicate scans are blocked safely
- assisted attendance captures staff actor and reason
- paused, frozen, cancelled, and expired memberships are excluded correctly from risk workflow
- follow-up outcome and next action persist
- weekly-goal rule is documented for members
- final renewal amount and terms are visible
- online membership renewal occurs only after verified payment
- failed, refunded, and reversed payment paths are tested
- add-ons remain optional
- PT usage and product stock cannot become negative
- notification preference and opt-out behavior works
- dashboard figures reconcile with source records
- staff can operate the daily workflow without developer help

## 16. 30-day pilot

### Before pilot

Record baseline:

- active paid members
- average weekly check-ins
- number of members absent beyond risk threshold
- current renewal rate
- average renewal delay
- monthly PT / add-on sales
- existing follow-up process and response rate

### Week 1: setup and data accuracy

- verified member import
- staff training
- QR and assisted check-in
- nightly attendance reconciliation
- no marketing campaigns yet

### Week 2: retention workflow

- enable no-show rule
- contact manageable daily batch
- record every outcome
- correct pause / expiry data immediately

### Week 3: renewals and limited add-ons

- enable renewal reminder sequence
- validate provider status and receipts
- expose only a small set of relevant add-ons
- measure utilization, not only purchases

### Week 4: outcome comparison

Review:

- returned members
- most common churn reasons
- on-time renewal change
- failed-payment recovery
- staff understanding of streak rule
- add-on usage after purchase
- staff ability to operate independently

## 17. Product expansion roadmap

### Phase 2: Gym management

- lead CRM
- trial passes
- source attribution
- sales follow-ups
- trainer management
- PT sessions
- class scheduling and booking
- billing / invoices
- coupons
- richer member 360

### Phase 3: Fitness experience

- workout programming
- exercise library
- workout logging
- measurements
- progress photos
- goal tracking
- challenges
- referrals

### Phase 4: Multi-tenant SaaS maturity

- multi-gym organizations
- cross-branch access
- organization analytics
- tenant onboarding
- SaaS subscription billing
- platform admin
- white-label configuration where commercially justified

### Phase 5: Intelligence

- rules-based churn score
- retention segmentation
- renewal-risk signals
- natural-language analytics
- owner assistant
- trainer assistant
- automated recommendations with clear human review

## 18. Commercial model hypotheses

These are hypotheses, not confirmed pricing:

- monthly SaaS subscription per gym or branch
- plan tiers based on active-member count or enabled modules
- optional setup / migration fee
- optional WhatsApp / messaging usage pass-through
- optional payment-provider fees handled separately
- optional premium modules for CRM, trainer operations, multi-branch, or AI

Commercial pricing must not be finalized until pilot operating cost and value are measured.

## 19. Key product risks

### Adoption risk

Staff may not consistently record attendance corrections or follow-up outcomes.

Mitigation:

- minimum-tap workflows
- required fields only when operationally necessary
- daily incomplete-action queue

### Data-quality risk

Incorrect expiry or pause data can produce incorrect red-list behavior.

Mitigation:

- data-quality alerts
- controlled state transitions
- reconciliation reports

### Payment-integrity risk

Duplicate callbacks or unverified payment state can extend membership incorrectly.

Mitigation:

- provider verification
- idempotency keys
- immutable payment event history

### Notification fatigue

Poor messaging frequency can damage member trust.

Mitigation:

- stage deduplication
- channel preferences
- service vs marketing separation
- configurable frequency policy

### Scope risk

Workout, AI, multi-branch, and CRM features can distract from the retention MVP.

Mitigation:

- Phase 1 non-goals
- roadmap gates
- pilot evidence required before expansion

## 20. Definition of Phase 1 success

Phase 1 succeeds when the pilot demonstrates that GymPulse can reliably:

1. record attendance,
2. identify relevant inactive members,
3. support consistent follow-up,
4. record returns and reasons,
5. surface renewals before expiry,
6. process verified payment state correctly,
7. show useful optional add-ons,
8. provide an owner with an actionable daily operating view,
9. preserve an auditable history,
10. operate without ongoing developer intervention.

Everything else is secondary until this loop works in a real gym.
