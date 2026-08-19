# GymPulse Product Blueprint

## 1. Product vision

GymPulse is a gym operations and member-retention platform designed to help gyms make attendance visible, detect disengagement early, recover at-risk members, collect renewals on time, and manage relevant add-on services.

The core operating loop is:

`Record attendance -> detect risk -> contact early -> bring the member back -> collect renewal -> deliver useful add-ons -> measure what worked`

## 2. Primary business problems

GymPulse focuses first on operational problems that directly affect retention and cash flow:

1. Members quietly stop attending before the gym notices.
2. Attendance data exists but is not converted into an actionable follow-up queue.
3. Renewals are chased manually and often after expiry.
4. Payment state, membership state, and receipt state can drift apart.
5. PT, diet, and product add-ons are often managed outside the member journey.
6. Owners lack a concise daily view of what needs action.

## 3. Product principles

- Actionable lists before decorative dashboards.
- Verified payment state before membership activation or extension.
- Fair attendance and streak rules.
- Auditability for attendance corrections, payments, and follow-ups.
- Marketing consent separated from transactional communication.
- Add-ons are optional and never pre-selected.
- Phase 1 proves daily operational value before advanced fitness features are added.

## 4. Users and roles

### Phase 1

- `Member`
- `Owner / Manager`
- `Front Desk Staff`

### Later phases

- `Trainer`
- `Sales Staff`
- `Branch Manager`
- `Organization Admin`
- `Platform Admin`

## 5. Phase 1 MVP

### Member management

- Member profile
- Active membership
- Plan and expiry
- Pause / freeze state
- Attendance history
- Communication preferences

### Attendance

- Session-bound or rotating QR check-in
- Active-membership validation
- Duplicate scan protection
- Assisted front-desk check-in with mandatory reason
- Offline-sync audit stamp where applicable

### No-show / retention workflow

- Configurable inactivity threshold
- Red-list of eligible members
- Exclude paused, frozen, expired, and cancelled memberships
- Call / WhatsApp / outcome actions
- Mandatory follow-up outcome
- Next-action date
- Automatic resolution when a member returns

### Renewal workflow

- Configurable reminder windows
- Renewal plan choices
- Final payable amount and terms
- Payment states: `Created`, `Pending`, `Paid`, `Failed`, `Refunded`, `Reversed`
- Membership extends only after verified provider confirmation
- Receipt generation

### Add-ons

- Personal Training
- Diet / nutrition services
- Products / supplements
- Price, validity, capacity / stock, and fulfillment state
- Usage visibility, not just sale visibility

### Owner dashboard

Prioritize operational cards and queues:

- Active members
- Today's check-ins
- 7-day active members
- Open no-show cases
- Returned members
- Renewals due
- Renewal collection
- Failed payments
- Add-on revenue
- Pending fulfillment / usage alerts

### Notifications

- No-show care message
- Renewal reminder
- Payment success / failure
- PT session reminder
- Daily owner summary
- Opt-out controls

### Audit and data quality

- Attendance corrections retain actor and reason
- Payment reversals remain auditable
- Follow-up history is append-only
- Data-quality alerts for invalid or missing operational data

## 6. Core domain model

Initial entities:

- `Organizations`
- `Gyms`
- `Branches`
- `Users`
- `Members`
- `Plans`
- `Memberships`
- `Attendance`
- `Streaks`
- `NoShowCases`
- `FollowUps`
- `Payments`
- `RenewalOrders`
- `AddOns`
- `AddOnOrders`
- `Notifications`
- `Settings`
- `AuditLogs`

The source blueprint starts with a single local gym. GymPulse extends the model with `Organizations`, `Gyms`, and `Branches` so the product can grow into a multi-tenant SaaS without redesigning the domain later.

## 7. Core automations

### Daily no-show scan

- Run in gym timezone.
- Calculate last valid attendance.
- Open one case when the threshold is crossed.
- Never create duplicate open cases.

### Valid QR check-in

- Validate QR session.
- Validate membership.
- Reject duplicate scans.
- Save attendance.
- Update streak / weekly goal.
- Resolve eligible no-show case.

### Renewal reminders

- Select memberships in configured windows.
- Send each stage once.
- Stop after verified payment, cancellation, or opt-out.
- Treat failed payment separately from no response.

### Payment confirmation

- Trust verified provider state.
- Mark payment paid exactly once.
- Extend membership or activate add-on exactly once.
- Generate receipt.
- Update owner view.

### Daily owner summary

- Check-ins
- New risk cases
- Follow-ups due / completed
- Renewals paid / pending
- Failed payments
- Add-on usage / fulfillment alerts

### Data-quality alerts

Examples:

- Membership missing expiry
- Paid order without provider reference
- Attendance correction without reason
- Negative stock
- Trainer double booking

## 8. Product expansion

These are GymPulse product extensions beyond the initial source blueprint.

### Phase 2: Gym management

- Lead CRM
- Trial passes
- Sales pipeline
- Trainer management
- PT scheduling
- Class scheduling and booking
- Billing and invoices
- Staff roles and permissions
- Better member 360 profile

### Phase 3: Fitness experience

- Workout programs
- Exercise library
- Workout logging
- Body measurements
- Progress photos
- Goal tracking
- Challenges
- Referrals

### Phase 4: SaaS and intelligence

- Multi-branch management
- Organization-level reporting
- SaaS subscriptions
- White-label options
- Churn risk scoring
- Revenue / retention insights
- Owner AI assistant
- Trainer AI assistant
- Automated CRM recommendations

## 9. Non-goals for Phase 1

Do not block the MVP on:

- Full trainer mobile app
- Wearable integrations
- Complex inventory procurement
- Payroll and commissions
- Community feed
- AI-generated workout or diet plans
- Advanced multi-branch reporting

The MVP should prove three things first:

1. Attendance is reliably visible.
2. At-risk members are followed up earlier.
3. Renewals are collected more reliably.

## 10. Success metrics

- QR check-in adoption
- Weekly active members
- No-show contact rate
- Contact-to-return rate
- Average days to return
- Renewal-before-expiry rate
- Reminder-to-payment conversion
- Failed-payment recovery
- Add-on conversion
- PT package utilization
- Staff workflow completion rate

## 11. Pilot strategy

### Week 1

- Import verified active members.
- Train front desk.
- Validate attendance accuracy daily.

### Week 2

- Activate red-list workflow.
- Contact manageable batches.
- Record reason and outcome for each contact.

### Week 3

- Activate renewal reminders.
- Verify payment and receipt states.
- Introduce only a small number of relevant add-ons.

### Week 4

Compare baseline and pilot:

- Returned members
- Churn reasons
- On-time renewals
- Failed-payment recovery
- Add-on utilization
- Staff ability to operate without developer help

## 12. Source basis

Initial product direction is derived from the uploaded **Gym App Blueprint by Roy Digital App Studio**. GymPulse intentionally keeps its retention, QR attendance, renewal, add-on, automation, KPI, and pilot concepts while expanding the architecture toward a standalone multi-tenant SaaS product.
