# Task 0034: Resolve / Draft Member vs Membership State Ownership ADR

## Goal

Resolve the existing Member/Membership lifecycle ownership conflict at ADR proposal level without changing canonical requirements, schema, migrations, code, or production behavior.

Target:

docs/adr/ADR-0026-member-membership-state-ownership.md

Continuity:

.ai/task/0034-resolve-member-membership-state-ownership-adr.md

Primary decision:

D-DATA-007

## Inputs Read

Fresh latest-main audit included:

- .ai/README.md
- .ai/current-state.md
- .ai/task/0033-draft-redis-cache-requirement-adr.md
- docs/README.md
- docs/00-overview/assumptions.md
- docs/00-overview/scope.md
- docs/00-overview/glossary.md
- docs/01-product/functional-requirements.md
- docs/01-product/non-functional-requirements.md
- docs/01-product/product-requirements.md
- docs/01-product/feature-catalog.md
- docs/01-product/user-journeys.md
- docs/01-product/user-roles.md
- docs/01-product/success-metrics.md
- docs/02-architecture/architecture-principles.md
- docs/02-architecture/architecture-overview.md
- docs/02-architecture/system-context.md
- docs/02-architecture/container-architecture.md
- docs/02-architecture/component-architecture.md
- docs/02-architecture/data-flow.md
- docs/02-architecture/technology-stack.md
- docs/adr/README.md
- docs/adr/ADR-0001-modular-monolith.md
- docs/adr/ADR-0004-database-engine.md
- docs/adr/ADR-0005-data-access-migration-strategy.md
- docs/adr/ADR-0007-authentication-session-architecture.md
- docs/adr/ADR-0008-member-authentication-method.md
- docs/adr/ADR-0009-authorization-implementation.md
- docs/adr/ADR-0010-data-layer-tenant-isolation-rls.md
- docs/adr/ADR-0011-api-contract-architecture.md
- docs/adr/ADR-0015-background-jobs-scheduler.md
- docs/adr/ADR-0018-testing-toolchain.md
- docs/adr/ADR-0022-payment-provider.md
- docs/adr/ADR-0025-redis-cache-requirement.md

Legacy evidence only:

- docs/06-database-schema.md
- docs/01-product-requirements.md
- docs/00-product-blueprint.md
- docs/16-open-decisions.md

Structured canonical docs controlled.

## Repository State Verified

At Task 0034 start:

~~~text
latest main:
2eba680b68673d280d4cd604cbc1f996fc45d954

ADR-0026 absent
Task 0034 continuity file absent

Task 0034 = actual next bounded task

D-DATA-007 = P1 PROPOSED / unresolved

FR-MEMBER-004 unchanged:
Active / Paused / Expired / Cancelled / Blocked

FR-MEMBERSHIP-002 unchanged:
Pending / Active / Frozen / Expired / Cancelled

no newer approval resolved the conflict
no current ADR Accepted
~~~

## Canonical Decision State

~~~text
D-DATA-007
Priority: P1
Status: PROPOSED / unresolved
~~~

Canonical assumptions already propose that Membership owns entitlement state and that Member state should become a distinct member-record/relationship concept.

That proposal is not acceptance.

ADR-0026 = Proposed.

Task 0034 does not promote D-DATA-007 to DECIDED.

## Current State Conflict

Current Member:

~~~text
Active
Paused
Expired
Cancelled
Blocked
~~~

Current Membership:

~~~text
Pending
Active
Frozen
Expired
Cancelled
~~~

Duplicated semantics:

~~~text
Active
Paused / Frozen
Expired
Cancelled
~~~

This creates two apparent owners for entitlement/lifecycle facts.

Current architecture already says entitlement must not be inferred from Member.status alone.

## Domain Definitions

Proposed conceptual separation:

~~~text
Member
=
tenant-scoped GymPulse member relationship / operational record

Membership
=
time-bounded commercial entitlement to gym services
~~~

A Member may exist before, during, and after any one Membership period.

Multiple historical Membership periods remain reconstructable.

Preserve:

~~~text
AuthIdentity / Principal
!=
Member
!=
Membership
~~~

## Member State Options

### Option 1

~~~text
Enabled / Blocked / Archived
~~~

Strongest current recommendation.

Benefits:

- does not reuse Membership Active;
- keeps administrative axis explicit;
- keeps Blocked as independent concern;
- allows history-preserving archival;
- remains compatible conceptually with FR-MEMBER-002 status field.

### Option 2

~~~text
Active / Blocked / Archived
~~~

Technically possible but rejected as leading recommendation because Active remains ambiguous beside Membership Active.

### Option 3

~~~text
no Member status enum
explicit block/archive facts
~~~

Credible alternative.

Could better represent orthogonal facts, but would require explicit revision of current FR-MEMBER-002 and would prematurely imply schema shape if selected now.

## Membership State Findings

Current Membership states remain the strongest entitlement model:

~~~text
Pending
Active
Frozen
Expired
Cancelled
~~~

Membership owns:

- commercial/effective period;
- activation;
- freeze/pause;
- expiry;
- Membership cancellation;
- attendance entitlement;
- standard no-show Membership eligibility;
- renewal-window context;
- verified renewal Membership effect.

Freeze reason / approval / expiry-extension remain separately governed:

~~~text
D-BIZ-005 OPEN
D-BIZ-006 OPEN
D-BIZ-007 OPEN
~~~

Early renewal period start remains D-BIZ-010 OPEN.

Cancellation/refund policy remains D-BIZ-011 OPEN.

## Options Evaluated

~~~text
A. Keep overlapping Member and Membership lifecycle states
B. Membership owns entitlement; Member gets distinct administrative state
C. Membership owns entitlement; no Member enum / explicit facts
D. Member owns composite lifecycle; Membership becomes historical detail
~~~

Option B is the strongest current fit.

Option A preserves ambiguity/drift.

Option C remains credible but implies a larger canonical requirement/schema change.

Option D conflicts with Membership-centered attendance/renewal requirements and multiple Membership periods.

## Evaluation Summary

Option B best satisfies:

- single source of entitlement truth;
- multiple historical Membership periods;
- renewal after expiry;
- freeze semantics;
- attendance safety;
- no-show safety;
- authorization/identity separation;
- import classification;
- reporting clarity;
- future schema constraints;
- operator/developer comprehension;
- reversibility.

## Proposed Ownership

~~~text
Member
owns stable tenant-scoped member relationship / operational identity
+
independent administrative/relationship state

Membership
owns time-bounded entitlement lifecycle
~~~

No mirrored lifecycle synchronization.

No Member expiry from Membership expiry.

No Member pause from Membership freeze.

No Member cancellation from Membership cancellation.

## Proposed Member State Model

Proposed candidate:

~~~text
Enabled
Blocked
Archived
~~~

### Enabled

Member record may participate in ordinary workflows subject to independent authorization and business eligibility.

Enabled does not mean an Active Membership exists.

### Blocked

Independent administrative/member-level restriction.

Not:

- Membership Expired;
- Membership Frozen;
- Membership Cancelled;
- AuthIdentity disabled.

Exact downstream consequences remain policy-dependent.

### Archived

Member relationship/record no longer active in normal operations while history remains.

Archived != deleted.

Data deletion/export remains D-SEC-005.

Retention remains D-SEC-006.

## Membership State Model

Conceptual semantics only:

~~~text
Pending
  entitlement record exists but not yet active/effective

Active
  currently entitled according to approved policy/date/state rules

Frozen
  temporarily suspended by approved Membership freeze

Expired
  entitlement period ended

Cancelled
  Membership entitlement/commercial period cancelled
~~~

Exact transition edges remain policy-dependent where requirements do not decide them.

State/date consistency is a later schema/domain invariant.

## Attendance Impact

Target conceptual gate:

~~~text
verified Member identity / Member-self
+
Member administrative eligibility
+
relevant Membership entitlement
+
branch/context rules
+
duplicate policy
=
attendance eligibility
~~~

Reject:

~~~text
Member.status == Active
-> entitlement
~~~

Representative:

~~~text
Enabled + Active Membership
-> lifecycle gate can pass

Enabled + Frozen Membership
-> no attendance entitlement during approved freeze

Enabled + Expired Membership
-> no attendance entitlement

Enabled + no current Membership
-> no entitlement

Blocked + Active Membership
-> commercial entitlement remains;
   administrative restriction evaluated separately
~~~

## Retention / No-show Impact

FR-RETENTION-003 already excludes relevant Memberships that are:

~~~text
Frozen / Paused
Expired
Cancelled
~~~

No-show population conceptually uses:

~~~text
Member
+
eligible relevant Membership
+
last valid Attendance
+
separate Member administrative exclusion if approved
~~~

Do not use Member Active alone.

Return Attendance does not imply Paused Member -> Active Member transition.

## Renewal Impact

FR-RENEWAL-001 identifies Memberships entering renewal windows.

Therefore:

~~~text
Renewal eligibility
-> Membership
~~~

not Member Expired.

Enabled + Expired Membership is a normal renewal/history/re-engagement scenario.

Early renewal effective-date behavior remains D-BIZ-010 OPEN.

Renewal representation (extend vs new period) remains separately unresolved where legacy evidence identifies it.

## Payment Impact

FR-PAYMENT-006:

~~~text
verified successful renewal payment
-> intended Membership effect exactly once
~~~

Do not mirror Payment effect into Member Active/Expired state.

Refund/cancellation consequences remain D-BIZ-011 OPEN.

## Authentication Impact

Preserve:

~~~text
Membership Expired
!=
Authentication Identity Deleted

Member Blocked
!=
AuthIdentity Disabled

Member Archived
!=
Auth Provider Account Deleted
~~~

D-ARCH-004 / D-SEC-004 remain separate.

## Authorization Impact

Protected operations continue to evaluate:

~~~text
Principal
+
tenant/resource scope
+
capability or Member-self
+
Member administrative eligibility where relevant
+
Membership entitlement where relevant
+
domain rule
~~~

Member state is not a universal authorization switch.

Membership state is not authentication proof.

Member-self linkage may survive Membership expiry/cancellation/freeze according to separately approved product/security policy.

## Import Mapping Impact

Never map one source status automatically into both Member and Membership.

Guidance:

~~~text
source Expired
-> likely Membership evidence

source Paused / Frozen
-> possible Membership freeze evidence

source Blocked
-> possible Member administrative evidence

source Cancelled
-> ambiguous; classify/reconcile

source Inactive
-> ambiguous; classify/reconcile

missing/ambiguous
-> reconciliation
~~~

Do not fabricate meaning.

Do not add Unknown production enum merely to hide migration uncertainty.

## Reporting Impact

Future APIs/read models should distinguish purposeful dimensions such as:

~~~text
memberState
membershipState
membershipExpiry
freezeContext
~~~

Member Search must not expose one ambiguous status filter.

Member 360 should show separate Member administrative state and Membership entitlement state.

Metric phrase Active Members is ambiguous.

Prefer explicit definitions such as:

~~~text
Members with Active Membership
Administratively Enabled Members
~~~

No KPI implementation changes in Task 0034.

## Data Quality Impact

Semantically valid combinations may include:

~~~text
Enabled + Active Membership
Enabled + Frozen Membership
Enabled + Expired Membership
Enabled + no current Membership
Blocked + Active Membership
historical Cancelled Membership + later Active Membership
~~~

Do not flag them merely because the axes differ.

Potential review cases:

~~~text
Archived + current Active Membership
multiple simultaneously applicable Active Memberships
state/date mismatch
invalid freeze period
~~~

Exact validity remains separate where business requirements are open.

## Requirement Change Required If Accepted

Current FR-MEMBER-004 conflicts with Option B.

Proposed replacement if explicitly accepted:

~~~text
FR-MEMBER-004 Member administrative / relationship state

Member state MUST represent the tenant-scoped Member record/relationship
administrative state independently from Membership entitlement.

Supported Member states MUST include:

Enabled
Blocked
Archived

Enabled MUST NOT imply an Active Membership exists.

Blocked MUST represent an independent administrative/member restriction;
exact affected operations follow separately approved policy.

Archived MUST represent a historical/inactive Member relationship/record
state and MUST NOT mean hard deletion.

Member state MUST NOT duplicate Membership Pending, Active, Frozen,
Expired, or Cancelled entitlement semantics.

Operationally material Member-state changes MUST be authorized and auditable.
~~~

Task 0034 does not modify canonical FR-MEMBER-004.

FR-MEMBER-002 remains conceptually compatible with Option B because it still has a Member status.

If Option C is chosen during review, FR-MEMBER-002 would also require explicit revision.

## Schema Follow-Up Required If Accepted

Acceptance would unblock a separate data-model/schema task for:

- Member 1 -> N Memberships;
- concrete columns/state representation;
- dates;
- tenant ownership;
- indexes;
- constraints;
- Membership applicability/current resolution;
- import migration;
- historical mapping;
- DTOs;
- state transitions;
- tests.

No schema is created in Task 0034.

No migration is created.

No enum/type/code is created.

## Security Findings

Key separations:

~~~text
Member Blocked
!=
AuthIdentity Disabled

Membership Active
!=
Authorization Allowed

Membership Expired
!=
Authentication Revoked
~~~

Authorization stays Principal/scope/capability-or-self plus business eligibility.

Block consequences remain policy-dependent.

State changes remain authorized/auditable where material.

## Privacy Findings

~~~text
Member Archived
!=
Data Subject Deletion Complete
~~~

Membership expiry/cancellation does not justify silent deletion of payment, Attendance, audit, or operational history.

D-SEC-005 remains OPEN.

D-SEC-006 remains OPEN.

## Validation Required

Future acceptance/implementation requires examples proving at least:

1. Enabled + Active Membership.
2. Enabled + Frozen Membership.
3. Enabled + Expired Membership.
4. Enabled + no current Membership.
5. Blocked + Active Membership.
6. Historical Cancelled Membership + later Active Membership.
7. Expired Membership preserves Member identity/history.
8. Frozen Membership excluded from no-show.
9. Expired Membership denied attendance.
10. Member block does not rewrite Membership history.
11. Membership expiry does not delete/expire Member.
12. Renewal eligibility reads Membership.
13. Verified renewal effect changes Membership exactly once.
14. FollowUpOutcome.Cancelled does not auto-cancel Member/Membership.
15. Import Active classification.
16. Import Paused/Frozen classification.
17. Import Expired classification.
18. Import Cancelled ambiguity.
19. Import Blocked classification.
20. Ambiguous import requires reconciliation.
21. Member search distinguishes both state dimensions.
22. API/read model distinguishes both dimensions.
23. Reporting distinguishes Enabled Members vs Active Memberships.
24. AuthIdentity remains separate.
25. Member-self linkage can survive expiry according to approved policy.
26. Historical records remain reconstructable.

No tests are implemented.

## Decisions Kept Separate

~~~text
D-DATA-004  Member/AuthIdentity separation       P1 PROPOSED
D-DATA-007  Member/Membership state ownership    P1 PROPOSED / unresolved

D-ARCH-002  database engine                      PROPOSED
D-ARCH-003  API contract                         PROPOSED
D-ARCH-004  authentication/session               OPEN
D-ARCH-015  authorization                        PROPOSED
D-ARCH-017  data access/migrations               PROPOSED
D-ARCH-018  testing                              PROPOSED

D-SEC-003   tenant isolation principle           PROPOSED
D-SEC-005   deletion/export                      OPEN
D-SEC-006   retention                            OPEN
D-SEC-008   RLS/data-layer isolation             OPEN

D-BIZ-005   freeze reasons                       OPEN
D-BIZ-006   freeze approval                      OPEN
D-BIZ-007   freeze expiry extension              OPEN
D-BIZ-010   early renewal period start           OPEN
D-BIZ-011   cancellation/refund                  OPEN
~~~

No related decision is silently resolved.

## Requirement IDs Referenced

Verified canonical IDs include:

~~~text
FR-MEMBER-001..005
FR-IMPORT-001..002
FR-MEMBERSHIP-001..007
FR-ATTENDANCE-001..011
FR-RETENTION-001..007
FR-FOLLOWUP-001..006
FR-RETURN-001..002
FR-RENEWAL-001..007
FR-PAYMENT-006
FR-AUTHZ-001..004
FR-CROSS-001..004

NFR-SECURITY-001..003
NFR-SECURITY-009
NFR-PRIVACY-005..006
NFR-RELIABILITY-001..005
NFR-RELIABILITY-008
NFR-MAINTAINABILITY-001
NFR-MAINTAINABILITY-004..006
NFR-TESTABILITY-001
NFR-TESTABILITY-004..005
NFR-DATA-003..005
~~~

No requirement ID was invented.

## Files Changed

Created:

- docs/adr/ADR-0026-member-membership-state-ownership.md
- .ai/task/0034-resolve-member-membership-state-ownership-adr.md

Governance continuity updates:

- docs/adr/README.md
- docs/README.md
- .ai/current-state.md

Normally unchanged:

- docs/01-product/functional-requirements.md
- docs/00-overview/assumptions.md

No schema/code/test implementation.

## Open Questions

- exact Blocked operation effects;
- block/unblock authority/reason;
- archive trigger;
- restore policy;
- relationship-end terminology;
- multiple simultaneous Membership policy;
- relevant/current Membership selection;
- Archived + Active Membership policy;
- legacy Active classification;
- Active Members KPI meaning;
- Member-self behavior after expiry/cancellation;
- historical migration of existing legacy state;
- branch impact on relevant Membership selection.

## Result

Expected synchronized end state:

~~~text
ADR-0026 = Proposed
D-DATA-007 = P1 PROPOSED / unresolved

Recommended entitlement owner:
Membership

Recommended Member-state meaning:
administrative / relationship state

Recommended Member-state candidate:
Enabled / Blocked / Archived

Membership entitlement states:
Pending / Active / Frozen / Expired / Cancelled

FR-MEMBER-004:
unchanged in canonical requirements

schema:
not finalized

migration:
not created

code/enums/types:
not created

production behavior:
unchanged
~~~

## Next Recommended Task

D-DATA-007 is currently the final numbered item in the existing ADR dependency queue.

Do not invent Task 0035.

After Task 0034 governance synchronization, fresh-read:

- docs/adr/README.md
- docs/00-overview/assumptions.md
- docs/README.md
- .ai/current-state.md

Then record only the actual next bounded governance action proven by synchronized repository state.

Possible categories include:

- missing ADR;
- decision-acceptance/review batch;
- canonical requirement synchronization after approval;
- business/security blocker;
- data-model/schema phase;
- another governance phase.

Do not execute that next action as part of Task 0034.
