# GymPulse Scope

## Document Control

- Status: `Confirmed Phase 1 boundary; future scope proposed`
- Scope Owner: Product

## 1. Purpose

Define what GymPulse currently includes, what is planned later, and what is explicitly excluded from the Phase 1 Operations MVP.

## 2. Scope Classification

Use the following labels:

- `In Scope`: required or approved for the referenced phase.
- `Proposed`: candidate capability requiring approval.
- `Future`: intentionally deferred.
- `Out of Scope`: explicitly excluded from the referenced phase.

## 3. Phase 1 Operations MVP

### 3.1 Identity and access

**In Scope**

- authenticated staff/owner access,
- member identity verification strategy,
- role-aware authorization,
- tenant and branch scope,
- secure sessions,
- audit attribution.

**Decision Required**

- exact auth provider,
- exact member login/verification mechanism.

### 3.2 Members

**In Scope**

- member profile,
- contact identifier,
- member status,
- join date,
- branch association,
- communication preferences,
- assigned trainer reference where needed,
- controlled migration/import reference.

### 3.3 Plans and memberships

**In Scope**

- membership plans,
- start/expiry,
- active/frozen/expired/cancelled states,
- freeze/pause records,
- commercial term snapshot where required,
- renewal relationship,
- authorized lifecycle mutations.

### 3.4 Attendance

**In Scope**

- QR session/check-in,
- active-membership validation,
- branch validation,
- duplicate handling,
- assisted check-in,
- attendance history,
- attendance correction audit trail,
- member weekly goal/streak state.

### 3.5 Retention/no-show

**In Scope**

- configurable inactivity rule,
- eligibility exclusions,
- red-list/action queue,
- assignee/ownership where used,
- follow-up history,
- outcome,
- next action,
- return resolution,
- retention KPIs.

### 3.6 Renewal and payments

**In Scope**

- configurable reminder windows,
- renewal options,
- final payable amount and terms,
- renewal order,
- online payment lifecycle,
- authoritative provider verification,
- idempotent payment effect,
- failure/refund/reversal visibility,
- receipt record where applicable,
- authorized offline payment flow if approved by pilot policy.

### 3.7 Add-ons

**In Scope**

- PT package/service catalogue,
- diet/nutrition service catalogue,
- product/supplement catalogue,
- exact price,
- validity,
- capacity/stock where relevant,
- purchase/order lifecycle,
- usage/fulfillment visibility,
- trust rules such as no preselection.

This scope does not automatically include advanced nutrition tracking or a full trainer platform.

### 3.8 Owner operations

**In Scope**

- operational dashboard,
- actionable queues,
- renewal pipeline,
- payment exceptions,
- return/recovery visibility,
- add-on fulfillment/usage alerts,
- daily owner summary,
- data-quality alerts.

### 3.9 Notifications

**In Scope**

- transactional/service templates,
- no-show care,
- renewal reminders,
- payment status,
- owner daily summary,
- consent/preference checks,
- deduplication,
- provider delivery state where available.

### 3.10 Audit and analytics

**In Scope**

- audit logs for sensitive actions,
- operational KPI definitions,
- canonical-source reporting,
- baseline/pilot comparison.

## 4. Phase 2 Candidate Scope

**Proposed**

- lead CRM,
- trial passes,
- lead source tracking,
- sales follow-up,
- trainer management,
- PT scheduling,
- class scheduling/booking,
- member 360 operational view,
- expanded invoicing/billing,
- coupons/discount management,
- richer operational reports.

Each capability requires its own requirements before implementation.

## 5. Fitness Experience Scope

The following are `Future` until product requirements are approved:

- workout programming,
- exercise library,
- workout logging,
- strength progression,
- body measurements,
- progress photos,
- goal tracking,
- meal logging,
- structured nutrition plans,
- macro/micronutrient tracking,
- wearable integration,
- health metrics,
- challenges,
- referrals.

## 6. Coaching Scope

`Future / Decision Required`

Possible coaching directions include:

1. gym-employed trainer workflow,
2. independent coach workflow,
3. coach-member messaging and plan delivery,
4. appointment/session scheduling,
5. AI-assisted coach productivity,
6. direct AI member coach.

No single coaching model is currently confirmed. Domain design must wait for a product decision.

## 7. AI Scope

### Allowed direction

`Future / Proposed`

Potential AI responsibilities:

- summarize permission-aware operational data,
- identify patterns for human review,
- draft owner or trainer insights,
- support natural-language analytics,
- assist workout/nutrition/coaching workflows after those deterministic domains exist.

### Explicit boundary

AI must not become the canonical source of truth for:

- identity,
- authorization,
- membership state,
- attendance validity,
- payment success,
- balances,
- subscription entitlement,
- medical facts,
- emergency decisions.

Health-related AI functionality requires a dedicated safety specification before launch.

## 8. Multi-Tenant SaaS Scope

### Phase 1 architecture consideration

`Proposed architecture`

The data model should avoid assuming that all records belong to one global gym.

### Future product scope

`Future`

- multiple organizations,
- multiple gyms,
- multiple branches,
- cross-branch staff permissions,
- organization reporting,
- tenant onboarding,
- SaaS plans/subscriptions,
- platform administration,
- white-label configuration.

## 9. Out of Scope for Phase 1

- medical diagnosis,
- emergency triage,
- prescription management,
- guaranteed health/transformation outcomes,
- AI autonomy over financial or access-control decisions,
- payroll,
- complex procurement,
- broad social/community feed,
- advanced wearable ecosystem,
- enterprise data warehouse,
- microservice decomposition solely for anticipated scale.

## 10. Scope Change Rules

A Phase 1 scope change requires:

1. a named product requirement,
2. user/problem justification,
3. acceptance criteria,
4. architecture impact review,
5. security/privacy impact review when applicable,
6. data model/API impact review,
7. QA impact,
8. roadmap decision.

A feature is not in scope merely because a database table or UI concept can support it.

## 11. Related Documents

- `project-overview.md`
- `vision.md`
- `goals.md`
- `assumptions.md`
- `../01-product/product-requirements.md`
