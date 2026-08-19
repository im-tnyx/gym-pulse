# GymPulse Open Decisions

## 1. Purpose

Track all unresolved product, gym-policy, provider, architecture, security, and pilot decisions that can materially change implementation.

Nothing in this file should be silently guessed in production.

## 2. Decision statuses

```text
OPEN        not decided
ASSUMED     temporary implementation assumption
DECIDED     approved decision
DEFERRED    intentionally postponed
BLOCKED     cannot proceed until external input exists
```

## 3. Priority levels

```text
P0  blocks core architecture/production safety
P1  blocks a Phase 1 workflow
P2  can use a safe default for prototype but needs pilot confirmation
P3  future phase
```

# Pilot gym discovery decisions

## D-001 Active member baseline

- Priority: P1
- Status: OPEN
- Question: How many `Active`, `Paused/Frozen`, `Expired`, and `Cancelled` members exist at pilot start?
- Why it matters: import reconciliation and KPI denominator.
- Required evidence: owner-confirmed source record.

## D-002 Existing attendance method

- Priority: P1
- Status: OPEN
- Question: Is attendance currently register, biometric, card, QR, spreadsheet, or another app?
- Why it matters: migration, assisted workflow, adoption baseline.

## D-003 No-show threshold

- Priority: P1
- Status: ASSUMED
- Temporary assumption: 10 days.
- Question: How many consecutive inactive days should trigger first follow-up?
- Source sample: 10+ days.
- Decision owner: pilot gym owner.

## D-004 No-attendance reference date

- Priority: P1
- Status: OPEN
- Question: For a new member with zero attendance, when does inactivity start?
- Options:
  - membership activation date,
  - join date,
  - expected first visit,
  - exclude until first attendance.
- Risk: false red-list cases.

## D-005 Pause reasons

- Priority: P1
- Status: OPEN
- Question: Which pause/freeze reasons are valid?
- Candidate source-aligned reasons:
  - medical,
  - travel,
  - approved break,
  - other owner-approved reason.

## D-006 Pause approval authority

- Priority: P1
- Status: OPEN
- Question: Who may approve a freeze?
- Options:
  - owner only,
  - manager,
  - authorized front desk.

## D-007 Freeze expiry effect

- Priority: P0
- Status: OPEN
- Question: Does a freeze extend membership expiry?
- Options:
  - yes, by frozen duration,
  - no,
  - plan-specific.
- Implementation impact: membership calculation and renewal timing.

## D-008 Membership plan catalogue

- Priority: P1
- Status: OPEN
- Question: What are all Phase 1 plans, durations, prices, discounts, and benefits?
- Required evidence: owner-confirmed list.

## D-009 Discount authority

- Priority: P1
- Status: OPEN
- Question: Who may create or apply discounts?
- Risk: revenue leakage and inconsistent pricing.

## D-010 Renewal reminder windows

- Priority: P1
- Status: ASSUMED
- Temporary assumption: 14, 7, 3, 0 days; post-expiry optional.
- Question: Which stages should the pilot use?

## D-011 Post-expiry follow-up

- Priority: P2
- Status: OPEN
- Question: Should a service reminder be sent after expiry, and after how many days?

## D-012 Renewal effective-date policy

- Priority: P0
- Status: OPEN
- Question: When a member renews, what date does the new period start?
- Cases:
  - early renewal,
  - expiry-day renewal,
  - late renewal.
- Options:
  - extend from existing expiry,
  - start from payment date,
  - configurable grace window.

## D-013 Overlapping memberships

- Priority: P1
- Status: OPEN
- Question: Can one member have multiple simultaneously active memberships?
- Recommendation for Phase 1: prevent accidental overlap unless a clear bundle use case exists.

## D-014 Cancellation policy

- Priority: P1
- Status: OPEN
- Question: Who can cancel membership and what happens to access/payment history?

# Attendance decisions

## D-015 QR session duration

- Priority: P1
- Status: OPEN
- Question: How long is a displayed QR valid?
- Requirement: screenshot must not work indefinitely.

## D-016 QR rotation strategy

- Priority: P1
- Status: OPEN
- Options:
  - short-lived signed token,
  - persisted session token,
  - rotating code.
- Recommendation: simplest server-validated short-lived/session-bound mechanism.

## D-017 Duplicate attendance window

- Priority: P1
- Status: OPEN
- Question: How soon should a second scan be rejected?
- Example options: 30, 60, 120 minutes or same business day depending on gym policy.

## D-018 Multiple visits per day

- Priority: P1
- Status: OPEN
- Question: Can a member have more than one valid attendance in a day?
- Impact: duplicate logic and visit KPIs.

## D-019 Cross-branch check-in

- Priority: P3 for single-branch pilot
- Status: DEFERRED
- Question: Can a member check in at any branch?

## D-020 Offline attendance

- Priority: P2
- Status: OPEN
- Question: Is offline queue/sync required for pilot?
- Recommendation: omit unless venue connectivity makes it necessary.

## D-021 Attendance correction permission

- Priority: P1
- Status: OPEN
- Question: Who can correct/void attendance?
- Recommendation: owner/manager or explicitly permitted staff with mandatory reason.

# Streak/goal decisions

## D-022 Phase 1 motivation rule

- Priority: P1
- Status: ASSUMED
- Temporary assumption: weekly visit target.
- Source reasoning: daily calendar streak may be unfair because members do not train seven days/week.

## D-023 Default weekly target

- Priority: P2
- Status: OPEN
- Question: Is target member-specific, plan-specific, or gym default?

## D-024 Week start day

- Priority: P2
- Status: OPEN
- Options: Monday, Sunday, gym-configured.

# Follow-up decisions

## D-025 Who owns red-list calls

- Priority: P1
- Status: OPEN
- Question: owner, front desk, trainer, or assignment queue?

## D-026 Follow-up outcome list

- Priority: P1
- Status: ASSUMED
- Temporary list:
  - Will return,
  - Injured,
  - Travelling,
  - Timing issue,
  - Unhappy,
  - No response,
  - Cancelled.
- Question: any pilot-specific category required?

## D-027 Next-action requirement

- Priority: P1
- Status: OPEN
- Question: Which outcomes require a next-action date?
- Recommendation:
  - Will return: usually yes,
  - No response: yes,
  - Travelling/Injured: configurable future check,
  - Cancelled: no normal follow-up.

## D-028 Case assignment locking

- Priority: P2
- Status: OPEN
- Question: Is visible assignee enough or is explicit `claim/lock` needed to stop simultaneous calls?

## D-029 Return attribution window

- Priority: P2
- Status: OPEN
- Question: How long after contact does return count as recovered?
- Impact: retention KPIs.

# Payment decisions

## D-030 Payment provider

- Priority: P0
- Status: OPEN
- Question: Which provider will handle online member payments?
- Selection criteria:
  - Indian payment methods required by gym,
  - webhook reliability,
  - sandbox quality,
  - refunds,
  - reconciliation,
  - fees,
  - operational support.

## D-031 Online methods

- Priority: P1
- Status: OPEN
- Question: Which methods should appear at launch?
- Examples: UPI, card, net banking/provider-supported methods.

## D-032 Offline payments

- Priority: P1
- Status: OPEN
- Question: Should GymPulse record cash/manual payments?

## D-033 Offline payment authority

- Priority: P1
- Status: OPEN
- Question: Who can record offline payment?
- Options:
  - owner only,
  - front desk,
  - front desk + owner approval.

## D-034 Refund policy

- Priority: P1 if refund UI enabled
- Status: OPEN
- Question: Are refunds supported in Phase 1, by whom, and what happens to membership access?

## D-035 Partial refunds

- Priority: P2
- Status: DEFERRED
- Recommendation: do not support until explicit need.

## D-036 Receipt vs tax invoice

- Priority: P0 before official fiscal documents
- Status: BLOCKED
- Question: What document does the gym need and what fields/numbering are legally/accounting required?
- Required input: gym owner/accountant/legal/tax advisor.
- Engineering must not infer GST treatment from sample blueprint.

## D-037 Receipt numbering

- Priority: P1 if receipts enabled
- Status: OPEN
- Question: sequence and scope per gym/financial period.

# Notification decisions

## D-038 Messaging provider

- Priority: P0/P1
- Status: OPEN
- Question: Which WhatsApp/SMS/email provider will Phase 1 use?

## D-039 Initial channels

- Priority: P1
- Status: OPEN
- Candidate: WhatsApp + in-app; SMS/email optional.

## D-040 Marketing consent source

- Priority: P1 before marketing
- Status: OPEN
- Question: How did existing members give marketing consent, if at all?
- Recommendation: do not launch marketing campaigns in Phase 1 without reliable consent source.

## D-041 Transactional/service communication policy

- Priority: P1
- Status: OPEN
- Question: Which service messages are enabled at pilot start?
- Candidate:
  - no-show care,
  - renewal,
  - payment result.

## D-042 Quiet hours

- Priority: P2
- Status: OPEN
- Question: What local-time window should suppress/delay non-urgent messages?

## D-043 Message language

- Priority: P2
- Status: OPEN
- Options: English, Hinglish, Hindi, tenant-configured.

# Add-on decisions

## D-044 Phase 1 add-ons

- Priority: P1
- Status: OPEN
- Question: Which 2–3 real offers will pilot use?
- Source categories:
  - PT,
  - diet/nutrition,
  - protein/supplements.

## D-045 PT package rules

- Priority: P1 if PT enabled
- Status: OPEN
- Questions:
  - session count,
  - validity,
  - trainer allocation,
  - reschedule/cancellation,
  - usage confirmation actor.

## D-046 Nutrition professional

- Priority: P1 if nutrition service enabled
- Status: OPEN
- Question: Who is qualified/authorized to deliver the service?
- Product must not imply qualifications that have not been verified.

## D-047 Product stock ownership

- Priority: P1 if products enabled
- Status: OPEN
- Questions:
  - who updates stock,
  - how purchase/returns are recorded,
  - invoice/expiry management,
  - whether Phase 1 needs real inventory or only availability flag.

## D-048 Add-on cancellation/expiry

- Priority: P1
- Status: OPEN
- Question: What happens when purchased package expires unused or is cancelled?

# Authentication and authorization decisions

## D-049 Staff auth provider

- Priority: P0
- Status: OPEN
- Candidates: managed auth compatible with selected stack.
- Requirements:
  - web/mobile sessions,
  - revocation,
  - secure provider integration.

## D-050 Member authentication method

- Priority: P0/P1
- Status: OPEN
- Options:
  - mobile OTP,
  - magic link,
  - gym-assisted verified onboarding plus OTP,
  - other approved method.

## D-051 Owner vs manager role split

- Priority: P2
- Status: OPEN
- Question: Separate roles in Phase 1 or same permission set initially?

## D-052 Front desk member creation

- Priority: P1
- Status: OPEN
- Question: Can front desk create members/memberships or owner only?

## D-053 Platform support access

- Priority: P3 before multi-tenant commercial launch
- Status: DEFERRED
- Requirement: audited, scoped, not permanent unrestricted access.

# Architecture decisions

## D-054 Package manager

- Priority: P1
- Status: ASSUMED
- Recommendation: pnpm.

## D-055 Monorepo

- Priority: P0
- Status: ASSUMED
- Recommendation: Turborepo.

## D-056 Owner/staff web framework

- Priority: P0
- Status: ASSUMED
- Recommendation: Next.js + TypeScript.

## D-057 Member mobile framework

- Priority: P1
- Status: ASSUMED
- Recommendation: Expo / React Native + TypeScript.

## D-058 Database

- Priority: P0
- Status: ASSUMED
- Recommendation: PostgreSQL.

## D-059 Managed backend

- Priority: P0
- Status: OPEN
- Question: Use Supabase for managed PostgreSQL/Auth/Storage or another platform?

## D-060 API deployment model

- Priority: P1
- Status: OPEN
- Options:
  - Next.js server/API initially,
  - separate TypeScript API app from day one.
- Recommendation: choose simplest deployment while keeping domain logic framework-independent.

## D-061 Job runner

- Priority: P0/P1
- Status: OPEN
- Requirements:
  - scheduled jobs,
  - retries,
  - visibility,
  - idempotent payloads,
  - staging/production support.

## D-062 Redis

- Priority: P2
- Status: OPEN
- Recommendation: do not add until queue/cache/coordination need is confirmed.

## D-063 Object storage

- Priority: P2 for Phase 1
- Status: OPEN
- Needed for receipts/export files; future progress photos.

## D-064 Hosting

- Priority: P0/P1
- Status: OPEN
- Question: Where will web/API/jobs/mobile supporting services run?

## D-065 Observability providers

- Priority: P1
- Status: OPEN
- Need:
  - errors,
  - logs,
  - job diagnostics,
  - payment diagnostics.

## D-066 Product analytics provider

- Priority: P2
- Status: OPEN
- Requirement: keep PII minimal and business truth server-side.

# Database decisions

## D-067 PostgreSQL enum strategy

- Priority: P2
- Status: OPEN
- Options:
  - native enums,
  - constrained text/reference tables.
- Choose based on migration ergonomics.

## D-068 RLS strategy

- Priority: P0 if Supabase/client DB access exists
- Status: OPEN
- Requirement: defense in depth plus application authorization.

## D-069 Membership renewal representation

- Priority: P0/P1
- Status: OPEN
- Options:
  - create new membership period per renewal,
  - extend existing membership + immutable renewal history.
- Recommendation: prefer model with easiest historical reconciliation.

## D-070 Inventory model

- Priority: P2
- Status: OPEN
- Options:
  - simple stock field for pilot,
  - inventory movements ledger.
- Recommendation: movement ledger once inventory becomes financially meaningful.

# Pilot decisions

## D-071 Pilot gym

- Priority: P0 before pilot
- Status: OPEN
- Required:
  - name,
  - timezone,
  - branch,
  - owner contact,
  - staff participants.

## D-072 Pilot success thresholds

- Priority: P1
- Status: OPEN
- Question: What measurable result means continue?
- Candidate dimensions:
  - QR adoption,
  - attendance accuracy,
  - red-list contact rate,
  - member return count/rate,
  - on-time renewal change,
  - staff time saved.

## D-073 Pilot member communication

- Priority: P1
- Status: OPEN
- Question: What members will be told about the new QR/app workflow?

## D-074 Data import owner sign-off

- Priority: P0 before activation
- Status: OPEN
- Requirement: owner confirms imported active-member count, plans, expiry, and pauses.

## D-075 Support during pilot

- Priority: P1
- Status: OPEN
- Need:
  - support contact,
  - issue escalation,
  - payment incident path,
  - data correction path.

# Privacy/security decisions

## D-076 Data retention

- Priority: P1 before full production policy
- Status: BLOCKED
- Need business/legal input for:
  - member records,
  - payment/receipt records,
  - audit logs,
  - notifications,
  - exports,
  - backups.

## D-077 Member deletion/anonymization

- Priority: P2
- Status: OPEN
- Need policy that preserves required financial/audit history while handling privacy requests appropriately.

## D-078 Sensitive health data

- Priority: P0 if proposed
- Status: DECIDED for Phase 1
- Decision: do not collect detailed medical records/diagnoses in Phase 1.
- Follow-up notes should avoid unnecessary health detail.

## D-079 Progress photos

- Priority: P3
- Status: DEFERRED
- Requires dedicated privacy/storage/consent design.

# Commercial decisions

## D-080 SaaS pricing

- Priority: P3 until pilot cost/value measured
- Status: DEFERRED
- Hypotheses:
  - per gym/branch subscription,
  - member-count tier,
  - setup/import fee,
  - messaging pass-through,
  - premium modules.

## D-081 White-labeling

- Priority: P3
- Status: DEFERRED
- Do not design Phase 1 around white-label mobile builds.

## D-082 Target segment after local gyms

- Priority: P3
- Status: OPEN
- Candidates:
  - gym chains,
  - studios,
  - yoga,
  - PT studios,
  - CrossFit-style facilities.

# Decision review process

## 83. How to close a decision

For every decision:

1. collect required owner/technical evidence,
2. record chosen option,
3. record date and decision owner,
4. update status to `DECIDED`,
5. update affected product/technical docs,
6. add ADR if technically significant.

Suggested decision record format:

```markdown
Decision: D-030 Payment Provider
Status: DECIDED
Choice: <provider>
Date: YYYY-MM-DD
Owner: <name/role>
Reason: <short rationale>
Consequences: <implementation impact>
```

## 84. Immediate decisions to resolve before coding deeply

Top sequence:

```text
D-055 Monorepo
D-056 Web framework
D-058 Database
D-059 Managed backend
D-049 Staff auth
D-050 Member auth
D-061 Job runner
D-030 Payment provider
D-038 Messaging provider
D-007 Freeze expiry effect
D-012 Renewal effective-date policy
D-017 Duplicate attendance window
D-022 Weekly goal rule
```

The repository can be scaffolded before all pilot business decisions are closed, but domain implementation should not hard-code unresolved policy as fact.
