# GymPulse Personas

## Document Control

- Status: `Draft v1.0`
- Scope: Product personas for Phase 1 and future expansion
- Audience: Product, UX, Engineering, QA, Customer Success
- Source basis: uploaded Gym App Blueprint plus approved GymPulse product extensions

## 1. Purpose

Define the people GymPulse is designed for, the jobs they need to complete, their operational context, pain points, success criteria, and design implications.

These personas are not demographic stereotypes. They represent workflow archetypes used to validate requirements, screens, permissions, analytics, and rollout decisions.

## 2. Persona Status Convention

- `Confirmed`: directly supported by the source blueprint and current Phase 1 scope.
- `Proposed`: useful GymPulse extension that still requires customer discovery.
- `Future`: outside Phase 1 and must not silently expand MVP scope.

## 3. Phase 1 Persona Summary

| Persona | Status | Primary Surface | Primary Job |
| --- | --- | --- | --- |
| Gym Member | Confirmed | Member mobile/web | Check in, understand membership, renew, use purchased services |
| Owner-Operator | Confirmed | Owner dashboard | Know what needs action today and protect retention/revenue |
| Front Desk Operator | Confirmed | Staff web/mobile | Handle member service quickly and correctly |
| Gym Manager | Confirmed role variant | Owner/staff dashboard | Run daily operations under delegated authority |

## 4. Persona P-01: Gym Member

**Status:** `Confirmed`

### Context

The member primarily interacts with GymPulse at moments where speed matters: arriving at the gym, checking membership state, renewing, or reviewing a purchased service.

The Phase 1 product must not assume that members want to spend significant time managing gym administration.

### Primary jobs to be done

- confirm that membership is active,
- check in quickly,
- see recent attendance and weekly goal,
- know exact membership expiry,
- understand renewal choices and payable amount,
- complete a secure payment,
- receive confirmation and receipt,
- browse optional PT, nutrition, or product add-ons,
- control applicable communication preferences.

### Pain points GymPulse addresses

- uncertain membership expiry,
- slow/manual attendance entry,
- renewal requests arriving too late,
- unclear payment state,
- disconnected service purchases,
- motivation features that punish legitimate rest days.

### Success criteria

The member should be able to answer within seconds:

1. Am I active?
2. Did my check-in work?
3. When does my membership expire?
4. What is my current weekly attendance progress?
5. If I paid, is the payment actually verified?
6. What did I purchase and what remains to be used?

### Design implications

- mobile-first layout,
- minimal repeated taps,
- large check-in affordance,
- exact dates rather than vague labels,
- payment `Processing` state until server verification,
- clear failure recovery,
- no dark patterns around add-ons,
- streak wording must be supportive rather than shaming.

### Security/privacy expectations

- member can access only their own protected records,
- private staff notes are not member-visible unless explicitly designed for sharing,
- payment credentials are handled by payment provider, not stored by GymPulse,
- communication preferences are explicit.

### Phase 1 exclusions

The member persona does not require in Phase 1:

- advanced workout programming,
- wearable sync,
- AI coach,
- community feed,
- detailed health records.

## 5. Persona P-02: Owner-Operator

**Status:** `Confirmed`

### Context

A local gym owner often combines commercial, operational, and member-service responsibilities. They may currently rely on a register, spreadsheet, biometric system, staff memory, calls, and WhatsApp conversations.

The owner does not need more charts merely because data exists. They need a prioritized operating queue.

### Primary jobs to be done

- know who stopped attending,
- ensure the right members are contacted,
- know which follow-ups are overdue,
- understand upcoming membership expiry,
- see payment failures and pending exceptions,
- confirm what was actually collected,
- manage plans, memberships, and selected policies,
- understand which members returned after intervention,
- review add-on sales and actual fulfillment/utilization,
- spot data-quality problems before they become member-service issues.

### Pain points GymPulse addresses

- silent churn discovered only after missed renewal,
- staff follow-up without recorded outcome,
- manual renewal chasing,
- mismatch between payment state and membership state,
- no clear daily priority list,
- inability to measure whether retention work helped,
- add-on revenue recorded without delivery visibility.

### Success criteria

At the start of the day, the owner should be able to answer:

- who needs contact today?
- what follow-up is overdue?
- which renewals are due soon?
- which payments failed or remain unresolved?
- which recovered members returned?
- which add-ons still need delivery or usage action?

At the end of the pilot, the owner should be able to compare operational outcomes against a baseline.

### Design implications

- actionable lists before decorative charts,
- drill-down from KPI card to underlying records,
- strong filters for branch, risk, due date, assignee, and status,
- clear distinction between `pipeline`, `pending`, `paid`, `refunded`, and `net`,
- configuration changes affecting risk/renewal logic require auditability.

### Permission implications

Owner-level access is broad but not automatically unrestricted. Sensitive operations should still use named permissions and audit records, including:

- role changes,
- refund actions,
- attendance correction,
- membership backdating,
- plan price changes,
- data export.

## 6. Persona P-03: Front Desk Operator

**Status:** `Confirmed`

### Context

Front desk staff operate under time pressure while members are physically present. They need fast search, clear eligibility, and safe assisted actions.

### Primary jobs to be done

- find a member by name/mobile/reference,
- understand current membership eligibility,
- assist check-in when QR flow fails,
- capture a mandatory reason for assisted attendance,
- inspect attendance or membership history when helping a member,
- record follow-up outcomes if assigned,
- see payment/receipt status relevant to support,
- complete only explicitly authorized membership/payment actions.

### Pain points GymPulse addresses

- searching multiple systems,
- ambiguous membership state,
- manual attendance with no actor trace,
- repeated calls by different staff,
- uncertainty about whether a payment is actually complete,
- accidental over-permission.

### Success criteria

- common member lookup is fast,
- assisted check-in cannot bypass core eligibility rules silently,
- the system explains why an action is blocked,
- actions are attributable to the staff member,
- staff can complete routine work without developer help.

### Design implications

- keyboard-friendly staff screens,
- compact member summary,
- obvious membership state,
- explicit action permissions,
- no need to expose owner-only financial analytics,
- clear `reason required` interaction for sensitive assisted actions.

## 7. Persona P-04: Gym Manager

**Status:** `Confirmed role variant / exact authority unresolved`

### Context

A manager may perform many owner responsibilities but should not automatically inherit all commercial or security authority.

### Primary jobs

- oversee daily operations,
- assign follow-ups,
- review attendance and retention queues,
- manage memberships within delegated policy,
- review renewal and payment exception pipelines,
- supervise staff workflow.

### Open questions

- can a manager change plan pricing?
- can a manager refund payments?
- can a manager manage roles?
- can a manager export data?

These permissions must be configured rather than inferred from the title `Manager`.

## 8. Future Persona P-05: Trainer / Coach

**Status:** `Future`

### Likely jobs

- see assigned clients,
- manage PT sessions,
- record session completion,
- view remaining package usage,
- write training notes,
- later assign workouts and review progress.

### Boundary

Trainer access must not imply access to full tenant finance, unrestricted member records, or owner analytics.

## 9. Future Persona P-06: Sales Staff

**Status:** `Future / Proposed`

### Likely jobs

- capture leads,
- manage trial passes,
- record follow-up,
- view approved offers,
- convert a lead into a member.

This persona requires a dedicated CRM product specification before implementation.

## 10. Future Persona P-07: Branch Manager

**Status:** `Future`

### Likely jobs

- operate one branch,
- manage branch staff,
- view branch attendance/retention,
- review branch renewals,
- handle branch-specific configuration where allowed.

Cross-branch rules remain an open product decision.

## 11. Future Persona P-08: Organization Administrator

**Status:** `Future`

### Likely jobs

- manage multiple gyms/branches,
- manage organization-wide staff access,
- view cross-branch analytics,
- manage organization defaults and subscriptions.

## 12. Future Persona P-09: Finance / Accountant

**Status:** `Future / Proposed`

### Likely jobs

- reconcile payments,
- inspect receipts/refunds,
- export authorized finance data,
- investigate payment exceptions.

This role should not automatically access workout, coaching, health, or unrelated member notes.

## 13. Internal Persona P-10: Platform Support

**Status:** `Future operational role`

Support may need temporary access to troubleshoot tenant issues.

Required principles:

- least privilege,
- explicit tenant/resource scope,
- reason code,
- audit log,
- time-limited elevation where practical,
- no invisible unrestricted impersonation backdoor.

## 14. Persona-to-Capability Mapping

| Capability | Member | Front Desk | Owner/Manager | Future Trainer |
| --- | --- | --- | --- | --- |
| Own membership | Primary | Support | Manage | Limited |
| QR attendance | Primary | Support | Observe | Future support |
| Assisted attendance | No | Primary | Allowed | Conditional |
| Red-list follow-up | No | Operational | Primary | Conditional |
| Renewal | Primary | Support | Primary | No |
| Payment exceptions | Own only | Support | Primary | No |
| Add-ons | Browse/use | Support | Manage | PT delivery |
| Analytics | Own progress only | Minimal | Primary | Assigned clients |
| Settings/roles | No | No | Conditional | No |

## 15. Research Gaps

The current sources do not provide validated qualitative interviews, demographic segmentation, device usage data, or accessibility research.

Before broad commercial rollout, customer discovery should validate:

- member willingness to authenticate and scan QR,
- staff device environment,
- owner reporting preferences,
- common renewal/payment methods,
- actual freeze policies,
- branch portability expectations,
- WhatsApp consent/communication practices,
- accessibility needs.

## 16. Related Documents

- `product-requirements.md`
- `user-roles.md`
- `user-journeys.md`
- `feature-catalog.md`
- `../00-overview/scope.md`
- `../00-overview/assumptions.md`
- legacy migration source: `../02-user-roles-permissions.md`
