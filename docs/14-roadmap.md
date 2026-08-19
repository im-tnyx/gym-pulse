# GymPulse Roadmap

## Phase 0: Product foundation

Goal: remove ambiguity before implementation.

Deliverables:

- Product blueprint
- Product requirements
- Role and permission model
- User flows
- Screen specifications
- System architecture
- Database schema
- API contracts
- Automation definitions
- Testing strategy

## Phase 1: Operations MVP

Goal: prove attendance visibility, early intervention, and renewal collection.

### Core scope

- Authentication and tenant context
- Members
- Plans and memberships
- QR check-in
- Assisted check-in
- Attendance history
- No-show red list
- Follow-up outcomes and next actions
- Weekly goal / streak
- Renewal options
- Payment lifecycle
- Receipts
- Add-on catalogue
- Basic PT / diet / product order state
- Owner dashboard
- Daily summary
- Consent and audit logs

### MVP milestone

A single gym can operate the daily workflow without developer assistance.

## Phase 2: Gym management

Goal: expand from retention workflow into day-to-day gym management.

- Lead CRM
- Trial passes
- Lead source tracking
- Sales follow-ups
- Trainer management
- PT session scheduling
- Class booking
- Member 360 profile
- Billing and invoices
- Coupons and discounts
- Staff permissions
- Operational reports

## Phase 3: Member fitness experience

Goal: increase product value for members and trainers.

- Workout programming
- Exercise library
- Workout logging
- Strength progress
- Measurements
- Progress photos
- Goal tracking
- Challenges
- Referral flows

## Phase 4: Multi-tenant SaaS

Goal: support multiple gyms and gym chains as a commercial platform.

- Organizations
- Multiple gyms
- Multiple branches
- Organization-level roles
- Branch-level permissions
- Cross-branch analytics
- SaaS subscriptions
- Platform admin
- Tenant onboarding
- White-label configuration

## Phase 5: Intelligence and automation

Goal: add decision support only after reliable operational data exists.

- Rules-based churn score
- Retention risk segmentation
- Renewal-risk signals
- Owner AI assistant
- Trainer AI assistant
- Natural-language analytics
- Automated CRM recommendations
- Revenue and retention insights

## Suggested implementation order for Phase 1

### Sprint 1: Foundation

- Tenant model
- Authentication
- Roles
- Members
- Plans
- Memberships
- Seed data

### Sprint 2: Attendance

- QR sessions
- Check-in validation
- Duplicate protection
- Assisted check-in
- Attendance history

### Sprint 3: Retention

- Inactivity calculation
- No-show cases
- Red-list filters
- Follow-up outcomes
- Next actions
- Return resolution

### Sprint 4: Renewal and payments

- Renewal offers
- Reminder scheduling
- Payment order lifecycle
- Provider verification abstraction
- Idempotent payment processing
- Receipts

### Sprint 5: Add-ons and dashboard

- Add-on catalogue
- Order / usage state
- Owner cards
- Action queues
- Daily owner summary

### Sprint 6: Pilot hardening

Test and fix:

- Duplicate QR
- Expired membership
- Approved pause
- Offline synchronization
- Wrong expiry data
- Failed payment
- Duplicate payment callback
- Refund / reversal
- Trainer unavailable
- Out-of-stock product
- Notification opt-out

## Pilot

Run a 30-day pilot with a real gym and compare against a recorded baseline.

Continue expanding only when a feature produces at least one of:

- Measurable daily usage
- Measurable member recovery
- Better on-time renewal
- Saved staff / owner time
- Reliable additional revenue
