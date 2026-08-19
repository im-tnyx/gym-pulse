# GymPulse Roadmap

## 1. Purpose

Define the order in which GymPulse should be specified, implemented, tested, piloted, and expanded.

The roadmap is outcome-gated. Later phases should not automatically start because earlier code is complete. They start when the previous phase demonstrates usable operational value.

## 2. Roadmap principles

- Build the retention operating loop before the fitness super-app.
- Protect tenant, payment, and attendance integrity from the first production build.
- Keep the first pilot narrow enough to diagnose failures.
- Measure real staff usage and member outcomes.
- Avoid adding AI before the underlying business data is reliable.
- Avoid multi-branch complexity before single-gym workflows are stable.

# Phase 0: Product and architecture foundation

## 3. Goal

Remove ambiguity before implementation.

## 4. Deliverables

- Product Blueprint
- Product Requirements
- Roles and Permissions
- User Flows
- Screen Specifications
- System Architecture
- Database Schema
- API Contracts
- Automations
- Payments and Billing
- Notifications
- Analytics and KPIs
- Security and Audit
- Testing and QA
- Roadmap
- Engineering Workflow
- Open Decisions

## 5. Blocking decisions

Before production implementation is locked:

- member authentication method,
- staff authentication provider,
- initial hosting/runtime,
- database/managed backend setup,
- job runner,
- payment provider,
- messaging provider,
- pilot gym timezone,
- membership freeze rules,
- renewal date calculation policy,
- duplicate attendance policy,
- weekly-goal rule,
- offline payment policy,
- receipt requirements.

Implementation may begin with explicit temporary assumptions, but each assumption must be recorded in `16-open-decisions.md`.

## 6. Phase 0 exit criteria

- all critical docs reviewed,
- database model accepted,
- tenant model accepted,
- API direction accepted,
- payment integrity pattern accepted,
- open blockers have owner or explicit implementation assumptions,
- first pilot scope frozen.

# Phase 1: Operations MVP

## 7. Outcome goal

Prove:

1. attendance visibility,
2. early retention intervention,
3. timely renewal/payment workflow.

## 8. Core scope

### Foundation

- monorepo scaffold,
- environments,
- authentication,
- tenant context,
- roles/capabilities,
- database migrations,
- observability baseline.

### Member and membership

- member directory,
- member profile,
- plans,
- memberships,
- membership status,
- pause/freeze,
- member mobile home.

### Attendance

- QR session,
- member scanner,
- membership validation,
- duplicate protection,
- assisted front-desk check-in,
- attendance history,
- attendance correction audit.

### Retention

- inactivity rule,
- daily no-show scan,
- red list,
- filters,
- assignment,
- follow-up outcomes,
- next action,
- return resolution.

### Engagement

- weekly visit target,
- member progress state.

### Renewal and payment

- expiry pipeline,
- renewal offers,
- renewal order,
- online payment adapter,
- webhook verification,
- payment state,
- exactly-once membership effect,
- failed/pending states,
- receipt.

### Add-ons

- PT,
- nutrition,
- product catalogue,
- optional purchase,
- verified payment activation,
- simple utilization/fulfillment state.

### Owner operations

- dashboard cards,
- action queues,
- data-quality alerts,
- daily owner summary.

### Communication

- notification model,
- renewal reminders,
- no-show care message,
- payment messages,
- preference/opt-out controls.

## 9. Suggested sprint sequence

### Sprint 0: Repository and platform foundation

Deliver:

- Turborepo workspace,
- TypeScript config,
- lint/typecheck/test commands,
- environment configuration,
- CI,
- database connection,
- migration system,
- observability skeleton,
- staging environment.

Exit:

- empty app deploys,
- migration runs,
- CI blocks broken type/tests,
- staging has no production secrets.

### Sprint 1: Identity, tenancy, members

Deliver:

- organizations/gyms/branches,
- staff users,
- role assignments,
- member records,
- member search,
- basic member profile,
- tenant isolation tests.

Exit:

- owner/front desk can access only authorized gym/branch,
- member data is searchable and isolated.

### Sprint 2: Plans and memberships

Deliver:

- plan CRUD,
- membership creation,
- membership state,
- expiry,
- pause/freeze,
- member membership view,
- audit for sensitive changes.

Exit:

- valid membership eligibility can be calculated deterministically,
- freeze behavior matches pilot decision.

### Sprint 3: Attendance

Deliver:

- QR session generation,
- member scan,
- validation,
- duplicate protection,
- assisted check-in,
- history,
- correction path,
- weekly-goal base.

Exit:

- duplicate QR/check-in tests pass,
- assisted record requires actor/reason,
- owner count reconciles.

### Sprint 4: Retention

Deliver:

- no-show rule,
- daily job,
- active-case uniqueness,
- red-list UI,
- follow-up,
- next action,
- return resolution,
- retention KPIs.

Exit:

- repeated job cannot duplicate case,
- paused/frozen/expired members excluded,
- return check-in resolves case once.

### Sprint 5: Renewal and payments

Deliver:

- renewal pipeline,
- member renewal options,
- renewal order,
- payment provider sandbox adapter,
- webhook endpoint,
- pending/failed/paid,
- effect ledger,
- receipt,
- payment diagnostics.

Exit:

- client success cannot renew membership,
- forged webhook cannot renew,
- duplicate webhook cannot double-renew,
- failed/pending states actionable.

### Sprint 6: Notifications

Deliver:

- notification records,
- template keys,
- provider adapter,
- renewal stages,
- no-show care,
- payment messages,
- dedupe,
- preference/opt-out,
- delivery diagnostics.

Exit:

- retry does not duplicate message,
- stale renewal reminder skips after payment,
- opt-out/policy tested.

### Sprint 7: Add-ons and owner dashboard

Deliver:

- add-on catalogue,
- PT/service/product order,
- payment linkage,
- entitlement/stock rules,
- owner dashboard,
- action queues,
- daily summary.

Exit:

- no negative entitlement,
- add-on activation exactly once,
- dashboard reconciles with data.

### Sprint 8: Import and pilot hardening

Deliver:

- controlled member import,
- validation/reconciliation,
- data-quality scan,
- full staging seed,
- staff UAT,
- backup/restore rehearsal,
- performance checks,
- critical security checks.

Exit:

- launch checklist passes.

## 10. Seven-day prototype option

For a fast interactive prototype before full production engineering, preserve the source sequence:

### Day 1

Gym setup + data model.

### Day 2

Member + membership.

### Day 3

QR attendance.

### Day 4

Red list + follow-up.

### Day 5

Weekly goal + renewal/payment states.

### Day 6

Add-ons + owner dashboard.

### Day 7

Failure-state testing.

The seven-day build is a prototype target, not permission to bypass production security/payment integrity.

# Phase 1 Pilot

## 11. Pre-pilot baseline

Capture:

- active paid members,
- average weekly check-ins,
- members absent >= selected threshold,
- renewal rate,
- on-time renewal rate if historical data supports it,
- average renewal delay,
- PT/add-on sales,
- existing follow-up method,
- follow-up response rate if measurable.

## 12. Pilot Week 1: Setup and staff habit

- import verified members,
- train owner/front desk,
- use QR and assisted check-in,
- reconcile attendance each evening,
- fix membership dates quickly,
- no broad marketing automation.

Success signal:

- staff can capture attendance accurately.

## 13. Pilot Week 2: Retention recovery

- enable inactivity threshold,
- contact manageable daily batch,
- record every outcome,
- use next-action dates,
- validate pause/freeze handling.

Success signal:

- owner uses red list daily and outcomes are recorded consistently.

## 14. Pilot Week 3: Renewal and add-ons

- enable renewal reminder stages,
- run real approved payment flow,
- validate receipts,
- expose only 2–3 relevant add-ons,
- measure PT/service usage, not just purchase.

Success signal:

- renewal state is trusted by staff and payment exceptions are clear.

## 15. Pilot Week 4: Measure and decide

Review:

- how many risk members returned,
- which outcomes/reasons occurred,
- whether on-time renewal improved,
- whether failed payments recovered,
- whether member weekly-goal rule was understood,
- whether add-ons were used/fulfilled,
- whether staff operated without developer help.

## 16. Phase 1 success gate

Phase 2 should start only when Phase 1 demonstrates at least several of:

- reliable daily attendance,
- consistent use of red list,
- measurable member recovery,
- improved renewal timing,
- lower manual follow-up effort,
- clear payment exception handling,
- owner dashboard used as daily operating tool.

If the pilot fails, fix the core loop before adding scope.

# Phase 2: Gym Management

## 17. Goal

Expand from retention workflow into broader daily business operations.

## 18. Candidate scope

### Lead CRM

- lead capture,
- source,
- owner/sales assignment,
- trial pass,
- follow-up,
- lead -> member conversion,
- conversion funnel.

### Trainer operations

- trainer profile,
- availability,
- PT assignments,
- session scheduling,
- session completion,
- package usage,
- trainer performance.

### Classes

- class types,
- schedules,
- capacity,
- booking,
- waitlist,
- cancellation,
- attendance.

### Billing operations

- invoices if required,
- coupons,
- approved discounts,
- daily collection reports,
- finance exports.

### Member 360

- richer timeline,
- interactions,
- services,
- controlled notes.

## 19. Phase 2 gate

Only prioritize modules with confirmed pilot/customer demand.

# Phase 3: Member Fitness Experience

## 20. Goal

Increase product value for member and trainer after gym operations are stable.

## 21. Candidate scope

- exercise library,
- workout program builder,
- assigned programs,
- workout logging,
- sets/reps/load,
- strength progress,
- body measurements,
- goal tracking,
- progress photos with strong privacy controls,
- challenges,
- referrals.

Nutrition prescription requires careful professional/safety scope and should not be treated as a casual content feature.

# Phase 4: Multi-tenant SaaS Maturity

## 22. Goal

Support commercial operation across multiple gyms and chains.

## 23. Scope

- tenant onboarding,
- multiple gyms per organization,
- multiple branches,
- organization admin,
- branch portability policies,
- cross-branch analytics,
- centralized configuration,
- GymPulse SaaS subscriptions,
- platform support tooling,
- platform admin,
- tenant lifecycle,
- optional white-label configuration.

## 24. Required maturity before Phase 4

- proven tenant isolation,
- reliable migrations,
- support operations,
- billing/reconciliation,
- data export/deletion policies,
- backup/restore,
- monitoring/SLOs,
- incident response.

# Phase 5: Intelligence and AI

## 25. Goal

Add decision support after operational data quality is trustworthy.

## 26. Rules-based risk first

Before ML/LLM prediction, implement transparent risk signals:

```text
attendance decline
+ inactivity duration
+ renewal proximity
+ failed payment
+ unresolved complaint/follow-up
+ PT inactivity where applicable
```

Possible segments:

```text
low
medium
high
critical
```

Each score should be explainable to owner.

## 27. Owner AI assistant

Potential queries:

- Which members need attention today?
- Why did renewal rate fall this month?
- Which no-show reasons are most common?
- Which payment exceptions are unresolved?

AI retrieves only authorized structured data.

## 28. Trainer AI assistant

Potential future support:

- session summary drafting,
- workout-plan draft assistance,
- progress summary.

Human review remains required. Medical diagnosis or unsupported guaranteed health claims are outside scope.

## 29. Natural-language analytics

AI should translate user question into permission-aware analytics query, then explain result with source metric definitions.

It must not invent numbers absent from canonical data.

# Technical debt milestones

## 30. After pilot

Review:

- whether modular monolith boundaries held,
- slow queries,
- job failure patterns,
- notification provider complexity,
- payment reconciliation workload,
- mobile crash rates,
- audit volume.

Refactor only based on observed bottlenecks.

## 31. Before multi-branch

Harden:

- branch scope,
- cross-branch membership policy,
- branch transfer,
- revenue attribution,
- organization reporting.

## 32. Before AI

Harden:

- analytics definitions,
- data access layer,
- structured event model,
- permission-aware retrieval,
- privacy controls.

# Roadmap decision framework

## 33. Feature priority score

Candidate feature can be evaluated by:

```text
Priority =
Business Impact
x Frequency of Use
x Customer Demand
x Strategic Fit
/
Implementation + Operational Risk
```

Do not turn this into false mathematical precision. It is a comparison framework.

## 34. Promote a feature when

At least one is true:

- repeated pilot/customer request,
- current workflow cannot be completed reliably without it,
- measurable revenue/retention impact,
- significant staff time saved,
- security/compliance requirement,
- platform foundation requires it now.

## 35. Do not promote a feature only because

- competitor has it,
- AI can generate it,
- database already has a field for it,
- it looks impressive in a demo,
- one hypothetical future chain might need it.

## 36. Current next milestone

After documentation completion:

```text
Resolve Phase 0 blocking decisions
  -> create monorepo scaffold
  -> build tenant/auth foundation
  -> implement database migrations
  -> begin Sprint 1
```
