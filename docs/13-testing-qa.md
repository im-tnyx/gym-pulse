# GymPulse Testing and QA

## 1. Purpose

Define the test strategy required to safely pilot GymPulse with real gym members, attendance, renewals, payments, and staff workflows.

Phase 1 QA must focus on business integrity, not only whether screens render.

## 2. Testing principles

- Critical business rules require automated tests below the UI layer.
- Tenant isolation is tested as a feature.
- Payment and attendance retries are tested deliberately.
- Failure states are first-class product states.
- Every scheduled automation is tested for duplicate execution.
- Dashboard metrics must reconcile with source records.
- Production release requires smoke tests and rollback/forward-fix planning.

## 3. Test layers

### Unit tests

Best for:

- membership eligibility,
- date calculations,
- pricing calculations,
- weekly-goal rules,
- no-show eligibility,
- state transition validation,
- notification policy,
- money math.

### Integration tests

Best for:

- repositories,
- tenant filters,
- database constraints,
- payment event processing,
- attendance transaction,
- no-show case uniqueness,
- add-on entitlement consumption,
- API authorization.

### Contract tests

Best for:

- API request/response schemas,
- provider adapter normalization,
- webhook payload handling,
- shared mobile/web contracts.

### End-to-end tests

Best for:

- member QR flow,
- front-desk assisted flow,
- owner red-list follow-up,
- renewal checkout sandbox flow,
- key settings/admin flows.

### Manual exploratory QA

Best for:

- mobile camera/QR behavior,
- confusing edge-state copy,
- real staff workflow speed,
- device/browser differences,
- accessibility review,
- pilot operational rehearsal.

## 4. Test environments

### Local

- deterministic seed data,
- fake/sandbox providers,
- fast reset.

### CI

- isolated database,
- migration from zero,
- deterministic time where possible,
- no production credentials.

### Staging

- production-like configuration,
- payment sandbox,
- test messaging recipients,
- realistic gym seed data,
- scheduled job testing.

### Production

- no destructive test data mixed with real records unless clearly flagged and approved,
- post-deploy smoke checks.

## 5. Seed dataset

Recommended staging seed aligned with source prototype concept:

- 1 organization,
- 1 gym,
- 1 branch,
- 30 members,
- 3 trainers represented as future/limited staff if needed,
- 1 front-desk user,
- 1 owner,
- monthly/quarterly/half-yearly/yearly plans,
- 6 members absent 10–20 days,
- 5 memberships expiring within 7 days,
- PT/nutrition/product add-ons,
- paid/pending/failed payment examples.

Add edge records:

- frozen membership,
- expired membership,
- cancelled membership,
- duplicate phone candidate,
- missing expiry staging error,
- out-of-stock product,
- exhausted PT package.

## 6. Time control

Many GymPulse rules depend on time.

Tests should be able to freeze/advance clock for:

- QR expiry,
- duplicate attendance window,
- no-show threshold,
- renewal stages,
- membership expiry,
- weekly goal boundaries,
- daily summary.

Avoid tests that depend on actual wall-clock sleep.

## 7. Tenant isolation tests

Required:

### API

- Tenant A owner requests Tenant B member ID -> denied/not disclosed,
- Tenant A front desk searches Tenant B phone -> no result,
- Tenant A cannot update Tenant B membership,
- Tenant A cannot fetch Tenant B payment,
- Tenant A cannot export Tenant B data.

### Database/RLS

Where RLS is used:

- tenant credentials cannot select other tenant rows,
- tenant credentials cannot insert spoofed tenant ID,
- update policy cannot move row between tenants,
- service worker queries require explicit tenant filter.

### Jobs

- malformed job payload with wrong tenant/resource combination fails safely.

## 8. Role and permission tests

Member:

- own membership allowed,
- another member denied,
- staff audit denied.

Front desk:

- assisted check-in allowed when capability exists,
- plan price edit denied,
- role assignment denied,
- unauthorized branch denied.

Owner:

- plan/settings allowed within gym,
- platform role assignment denied,
- cross-tenant denied.

## 9. Membership tests

### Valid lifecycle

- pending -> active,
- active -> frozen,
- frozen -> active according to policy,
- active -> expired,
- active -> cancelled.

### Invalid

- expiry before start,
- unauthorized backdate,
- overlapping freeze,
- freeze outside allowed membership range if policy blocks,
- invalid state transition,
- plan from another tenant.

### Renewal

- renew before expiry,
- renew on expiry,
- late renewal,
- freeze-expiry interaction according to configured policy.

## 10. QR session tests

- valid token,
- invalid token,
- tampered token,
- expired token,
- revoked session,
- wrong branch,
- same screenshot after expiry,
- token from Tenant A used by Tenant B member,
- token rotation boundary.

## 11. QR attendance tests

### Happy path

- eligible active member,
- valid QR,
- attendance created,
- goal updated,
- dashboard updated,
- response correct.

### Duplicate behavior

- identical request idempotency key repeated,
- same QR rescanned immediately,
- two concurrent check-in requests,
- retry after network timeout,
- valid later visit according to configured policy.

Assertions:

- one effective attendance,
- stable response for idempotent retry,
- no double goal increment,
- no duplicate no-show resolution.

## 12. Assisted attendance tests

- authorized front desk success,
- missing reason rejected,
- missing actor impossible from client,
- unauthorized role rejected,
- inactive membership rejected according to policy,
- duplicate window enforced,
- audit row created,
- wrong branch rejected.

## 13. Attendance correction tests

- authorized correction,
- unauthorized correction,
- missing reason,
- original attendance retained,
- correction audit contains actor,
- dashboard recalculates correctly,
- weekly goal recalculates correctly,
- no negative/duplicate derived metrics.

## 14. Weekly goal tests

- week start boundary,
- target 4, completed 0..4+,
- duplicate attendance does not overcount if policy counts visits uniquely,
- freeze behavior,
- timezone boundary,
- new membership midweek,
- invalid attendance excluded.

## 15. No-show scan tests

### Eligible

- exact threshold day,
- threshold + 1,
- no recent attendance.

### Excluded

- frozen,
- paused,
- expired,
- cancelled,
- blocked if policy excludes,
- invalid membership record creates quality issue rather than false case.

### Idempotency

- job run twice,
- concurrent job run,
- worker retry after insert ambiguity.

Assertion:

- one active case only.

## 16. No-show first-attendance edge case

Test each chosen policy for member with no attendance:

- use membership start,
- use join date,
- exclude until first visit.

Only the approved policy should be enabled.

## 17. Follow-up tests

- each outcome saves,
- outcome requiring next action rejects missing date,
- append-only history,
- closed case rejects new normal follow-up if policy says so,
- assignee scope enforced,
- simultaneous staff updates handled predictably,
- follow-up timeline ordered correctly.

## 18. Return resolution tests

- member with open case checks in -> returned,
- member with no case -> no false resolution,
- duplicate attendance -> one resolution,
- already returned case remains stable,
- returned attendance reference correct,
- return metric updates once.

## 19. Renewal eligibility tests

- D-14,
- D-7,
- D-3,
- D-0,
- post-expiry if enabled,
- already renewed excluded,
- cancelled excluded,
- timezone/day boundary,
- expiry changed after reminder queued.

## 20. Renewal order pricing tests

- correct base price,
- valid discount,
- final amount,
- client attempts amount tampering,
- plan price changes after order creation,
- plan disabled after order creation,
- duplicate create with same idempotency key.

Order snapshot must remain stable.

## 21. Payment webhook tests

Mandatory:

- valid success,
- valid failure,
- pending,
- forged signature,
- malformed payload,
- unknown payment reference,
- amount mismatch,
- currency mismatch,
- duplicate same provider event,
- different success events for same payment,
- webhook before client return,
- client return before webhook,
- worker crash after event insert,
- worker crash after payment update but before side effect,
- replay after full completion.

Assertions:

- membership effect exactly once,
- event retained,
- invalid event cannot grant access,
- receipt created once.

## 22. Pending payment reconciliation tests

- pending becomes paid,
- pending becomes failed,
- provider remains pending,
- provider unavailable,
- retry limit,
- already paid skipped,
- canonical event processor reused.

## 23. Offline payment tests

If enabled:

- authorized role success,
- unauthorized role denied,
- amount mismatch blocked/approved per policy,
- audit created,
- duplicate request idempotent,
- cannot masquerade as online provider reference.

## 24. Refund/reversal tests

If enabled:

- full refund,
- duplicate refund webhook,
- reversal,
- invalid refund amount,
- unauthorized refund request,
- membership/add-on consequence follows approved policy,
- reporting distinguishes gross/refund/net.

## 25. Add-on tests

### Catalogue

- active visible,
- inactive hidden from member,
- no preselection in UI.

### Product

- stock available,
- stock zero,
- concurrent final-unit purchase/fulfillment,
- no negative stock.

### PT

- 12 sessions purchased,
- usage 1,
- final session,
- extra usage rejected,
- concurrent usage cannot produce negative balance.

### Payment

- duplicate callback activates once.

## 26. Notification tests

- correct template variables,
- duplicate scheduled job -> one notification,
- renewal completed after queue -> send skipped,
- member returned after queue -> no-show send skipped,
- marketing opt-out,
- channel disabled,
- transient provider retry,
- permanent failure no blind loop,
- duplicate delivery webhook,
- provider does not support Delivered -> system does not fabricate,
- link expired/revalidated.

## 27. Owner dashboard tests

For each metric create known records and reconcile exact result.

- active members,
- today's check-ins,
- 7-day active,
- open no-show,
- returned members,
- renewals due,
- collected amount,
- failed/pending payment exceptions,
- add-on revenue.

Test:

- gym timezone midnight,
- invalid/voided records excluded,
- cross-branch filters,
- unauthorized branch filter rejected.

## 28. Data-quality tests

Detect:

- missing expiry,
- expiry before start,
- paid online payment missing provider ref,
- payment without effect,
- effect without valid payment,
- assisted attendance missing audit context,
- negative entitlement attempt,
- duplicate active case attempt.

Repeated scan should not create duplicate issue rows for same unresolved issue.

## 29. Import tests

- valid 30-member import,
- duplicate phone,
- missing name,
- missing expiry,
- invalid date,
- unknown plan,
- duplicate source row,
- partial invalid batch,
- preview counts,
- final reconciliation,
- retry after failure.

Do not silently guess missing business-critical values.

## 30. API contract tests

For every endpoint:

- schema validation,
- auth,
- authorization,
- tenant scope,
- expected status code,
- error code,
- response schema,
- pagination where relevant,
- idempotency where relevant.

## 31. Mobile tests

Member app:

- camera permission allowed/denied,
- background/foreground during scan,
- slow network,
- app killed after payment return,
- deep-link from message,
- expired session,
- older supported devices,
- accessibility text scaling where practical.

## 32. Web tests

Owner/staff:

- common browsers,
- mobile viewport,
- keyboard navigation,
- large tables pagination,
- refresh after mutation,
- stale tab state,
- concurrent edits.

## 33. Accessibility QA

Check:

- form labels,
- error association,
- focus order,
- keyboard interaction,
- focus visibility,
- screen-reader-friendly status labels where possible,
- contrast,
- status not color-only,
- touch target size.

## 34. Performance tests

Pilot-scale targets should test:

- member search with realistic dataset,
- owner red-list query,
- renewal pipeline query,
- dashboard aggregation,
- QR check-in transaction,
- no-show scan for projected member volume.

Measure before adding caches.

## 35. Load/concurrency tests

Important concurrency cases:

- morning check-in burst,
- two simultaneous scans by same member,
- payment webhook bursts,
- scheduled renewal scan across tenants,
- concurrent PT usage,
- concurrent stock fulfillment.

## 36. Security QA

See `12-security-audit.md`.

Minimum pre-pilot:

- cross-tenant denial,
- privilege escalation attempts,
- payment webhook forgery,
- secret leak scan,
- QR replay,
- protected storage access,
- staging/prod credential separation.

## 37. Migration tests

CI should test:

- fresh migration from zero,
- schema generation/types,
- constraints,
- seed data,
- migration on representative previous schema once production begins.

Destructive migrations require separate review.

## 38. Backup/restore rehearsal

Before depending on production:

- confirm automated backup exists,
- restore into isolated environment,
- verify core tables/counts,
- document restore time/owner.

## 39. Seven-day prototype QA mapping

Source-aligned sequence:

### Day 1

Gym setup/data model validation.

### Day 2

Member/membership states.

### Day 3

QR, duplicate, expired, assisted check-in.

### Day 4

No-show calculation and follow-up.

### Day 5

Weekly goal and renewal/payment states.

### Day 6

Add-ons and owner dashboard.

### Day 7

Failure-state day:

- duplicate QR,
- expired membership,
- approved pause,
- wrong expiry,
- failed payment,
- duplicate callback,
- refund,
- trainer unavailable where applicable,
- out-of-stock product,
- opt-out.

## 40. Pilot UAT

User acceptance testing should include actual owner/front-desk staff with test data before real-member activation.

Tasks:

1. find member,
2. assist check-in,
3. identify red-list member,
4. record follow-up,
5. set next action,
6. verify return closes case,
7. inspect renewal due,
8. inspect failed payment,
9. share receipt,
10. inspect owner summary.

Observe whether staff can do these without developer prompts.

## 41. Release severity

### Blocker

- cross-tenant data exposure,
- payment can be forged/double-applied,
- attendance duplication corrupts workflow,
- data loss,
- auth bypass.

### Critical

- paused members falsely contacted at scale,
- renewals extended incorrectly,
- incorrect collected revenue,
- notifications repeatedly spam members.

### Major

- important workflow broken with workaround,
- dashboard wrong but source records safe.

### Minor

- cosmetic/non-blocking UX issue.

## 42. Definition of done for a feature

A feature is done when:

- requirement linked,
- UX states implemented,
- server validation implemented,
- permission rules implemented,
- tenant scope verified,
- unit/integration tests pass,
- relevant E2E path passes,
- audit/event behavior added,
- observability added,
- docs updated,
- accessibility basics checked,
- no known blocker/critical issue remains.

## 43. Pilot launch checklist

Do not activate real gym data until:

- member import reconciles,
- QR integrity passes,
- duplicate attendance passes,
- pause/freeze exclusion passes,
- no-show idempotency passes,
- payment sandbox + webhook passes,
- duplicate payment callback passes,
- receipt flow passes,
- notification dedupe/opt-out passes,
- dashboard reconciliation passes,
- tenant isolation passes,
- backup plan exists,
- staff UAT passes.

## 44. Post-deploy smoke test

After each production deployment:

- login,
- tenant context,
- member search,
- read member profile,
- non-destructive attendance readiness check,
- owner dashboard load,
- job health,
- provider webhook health,
- notification provider health,
- error monitoring review.

Real payment/check-in smoke actions must use designated test accounts/process to avoid corrupting production metrics.
