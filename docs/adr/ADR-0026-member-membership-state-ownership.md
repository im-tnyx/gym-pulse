# ADR-0026: Member and Membership State Ownership

## Status

Proposed

## Decision Metadata

- ADR: ADR-0026
- Primary Decision ID: D-DATA-007
- Related Decision IDs: D-DATA-004, D-ARCH-002, D-ARCH-003, D-ARCH-004, D-ARCH-015, D-ARCH-017, D-ARCH-018, D-SEC-003, D-SEC-005, D-SEC-006, D-SEC-008, D-BIZ-005, D-BIZ-006, D-BIZ-007, D-BIZ-010, D-BIZ-011
- Decision Owner: Open
- Technical Owner: Architecture / Domain / Data / Backend
- Product Owner: Open / Product + Gym Owner where applicable
- Date Proposed: 2026-09-27
- Date Accepted: Not accepted
- Supersedes: None
- Superseded By: None

## 1. Context

GymPulse currently has two separate domain concepts whose canonical requirements assign overlapping lifecycle-like states.

Current Member requirement:

~~~text
FR-MEMBER-004

Member.status:
Active
Paused
Expired
Cancelled
Blocked
~~~

Current Membership requirement:

~~~text
FR-MEMBERSHIP-002

Membership.status:
Pending
Active
Frozen
Expired
Cancelled
~~~

The overlap is not merely a naming problem.

It creates two possible owners for the same apparent fact:

~~~text
Active
Paused / Frozen
Expired
Cancelled
~~~

and therefore makes ordinary questions ambiguous:

~~~text
Does Member.status = Active mean:
- the member record is administratively usable?
- the person has a current paid entitlement?
- both?

If Membership = Expired but Member = Active:
- is check-in allowed?
- is the Member inconsistent?
- is renewal expected?

If Membership = Active but Member = Blocked:
- does the commercial entitlement still exist?
- is operational use denied?
- should Membership history be rewritten?
~~~

The architecture already requires one canonical owner for each business state and already warns that entitlement must not be inferred from Member.status alone.

This ADR resolves ownership at proposal level.

It does not create schema, migrations, enums, code, API implementation, or production behavior.

Canonical D-DATA-007 remains P1 PROPOSED / unresolved until explicit authorized acceptance evidence exists.

FR-MEMBER-004 remains unchanged by this Proposed ADR.

## 2. Current Conflict

### 2.1 Current Member state

FR-MEMBER-004 currently requires:

~~~text
Active
Paused
Expired
Cancelled
Blocked
~~~

FR-MEMBER-002 also currently requires the Phase 1 Member model to support a status field.

### 2.2 Current Membership state

FR-MEMBERSHIP-001 requires a Membership to link:

~~~text
member
plan / commercial context
start date
expiry date
status
tenant scope
~~~

FR-MEMBERSHIP-002 requires:

~~~text
Pending
Active
Frozen
Expired
Cancelled
~~~

FR-MEMBERSHIP-004 further requires attendance, renewal, and other entitlement-sensitive flows to determine Membership eligibility server-side.

FR-MEMBERSHIP-005 places approved freeze/pause explicitly on a Membership reference.

FR-MEMBERSHIP-006 excludes a Member from standard no-show detection when the relevant Membership is frozen/paused.

FR-MEMBERSHIP-007 keeps freeze-expiry extension behavior separately Open.

### 2.3 Why the overlap is unsafe

The current overlap permits ambiguous combinations such as:

~~~text
Member.status = Expired
Membership.status = Active
~~~

or mirrored-state designs such as:

~~~text
Membership Expired
-> copy Expired to Member.status

Membership Frozen
-> copy Paused to Member.status

Membership Active
-> copy Active to Member.status
~~~

That creates:

- dual-write risk;
- drift;
- unclear entitlement authority;
- difficult import mapping;
- ambiguous reporting;
- unclear API filters;
- unclear operator language;
- contradictory historical periods;
- migration complexity;
- fragile authorization/business predicates.

The decision must therefore separate meanings, not synchronize labels.

## 3. Requirements and Decision Drivers

### Functional requirements

Member:

- FR-MEMBER-001 — stable opaque Member with explicit tenant/gym/branch context.
- FR-MEMBER-002 — Member supports required operational fields including current status.
- FR-MEMBER-003 — optional operational references.
- FR-MEMBER-004 — current overlapping Member states.
- FR-MEMBER-005 — authorized scoped Member search.
- FR-IMPORT-001 — controlled import with validation, duplicate handling, source traceability, and reconciliation.
- FR-IMPORT-002 — imports must not fabricate missing expiry, Membership state, or material business facts.

Membership:

- FR-MEMBERSHIP-001 — Membership owns plan/commercial context, dates, status, tenant scope, and Member link.
- FR-MEMBERSHIP-002 — Pending / Active / Frozen / Expired / Cancelled.
- FR-MEMBERSHIP-003 — expiry cannot precede start.
- FR-MEMBERSHIP-004 — entitlement-sensitive eligibility is server-side.
- FR-MEMBERSHIP-005 — freeze/pause is explicitly Membership-scoped.
- FR-MEMBERSHIP-006 — frozen relevant Membership is excluded from standard no-show.
- FR-MEMBERSHIP-007 — freeze-to-expiry policy is Open.

Attendance:

- FR-ATTENDANCE-001..006 — verified QR/session input, verified Member identity, Membership eligibility, duplicate protection, exactly one Attendance, retry safety.
- FR-ATTENDANCE-007..011 — assisted attendance, staff actor/reason, scoped history, auditable correction, preserved history.

Retention and follow-up:

- FR-RETENTION-001..007 — no-show threshold, Membership-state exclusions, canonical last attendance, one active case, scoped operational queue.
- FR-FOLLOWUP-001..006 — append-oriented contact attempts, outcomes, history, next actions, duplicate-contact mitigation.
- FR-RETURN-001..002 — valid return Attendance can resolve an eligible case while preserving linkage/history.

Renewal and payment:

- FR-RENEWAL-001..007 — renewal windows derive from Memberships, renewal order is distinct from Payment, initiation does not extend Membership, reminder suppression is explicit.
- FR-PAYMENT-006 — verified successful renewal payment applies its intended Membership effect exactly once.

Authorization / cross-domain:

- FR-AUTHZ-001..004 — scoped authorization, named capabilities, Member-self isolation, actor attribution.
- FR-CROSS-001..004 — server truth, idempotent effects, explicit tenant context, gym-local time.

### Non-functional requirements

- NFR-SECURITY-001..003 — tenant isolation, least privilege, server-side authorization.
- NFR-SECURITY-009 — sensitive actions are attributable.
- NFR-PRIVACY-005..006 — retention/deletion and data-subject workflows remain separately governed.
- NFR-RELIABILITY-001..005 — retry safety, exactly-once effects, database backstops, canonical source of truth.
- NFR-RELIABILITY-008 — payment/Membership state supports reconciliation.
- NFR-MAINTAINABILITY-001 — shared domain rules are not duplicated.
- NFR-MAINTAINABILITY-004..006 — migration discipline, docs synchronization, ADR governance.
- NFR-TESTABILITY-001 — Membership/Attendance eligibility and state transitions must be deterministically testable.
- NFR-TESTABILITY-004 — authorization matrices require positive and negative tests.
- NFR-TESTABILITY-005 — expiry/renewal/no-show time edges require controlled time.
- NFR-DATA-003 — UTC event timestamps plus gym timezone for business-time calculations.
- NFR-DATA-004 — relevant history remains reconstructable.
- NFR-DATA-005 — delete/archive/void semantics are domain-specific and cannot be applied indiscriminately.

### Decision drivers

1. one source of truth for entitlement;
2. clear separation between long-lived Member relationship and time-bounded Membership;
3. multiple historical Membership periods;
4. safe attendance eligibility;
5. safe no-show/retention population;
6. renewal-after-expiry without destroying Member identity;
7. exactly-once renewal Membership effect;
8. authentication/Member-self separation;
9. administrative block independent from commercial entitlement;
10. import mapping without fabricated meaning;
11. explicit reporting terminology;
12. read models without duplicate write authority;
13. future schema constraints that reinforce, rather than reconcile, semantics;
14. minimal developer/operator ambiguity;
15. reversible evolution.

## 4. Domain Definitions

### 4.1 Member

Proposed conceptual definition:

~~~text
Member
=
the tenant-scoped GymPulse member relationship / operational record
for a person within the gym context
~~~

A Member can exist:

- before a current Membership is assigned;
- after a Membership expires;
- after a historical Membership is cancelled;
- while renewal is pending;
- while historical attendance/payment/follow-up records remain relevant;
- while no current commercial entitlement exists.

A Member is not itself the time-bounded entitlement.

### 4.2 Membership

Proposed conceptual definition:

~~~text
Membership
=
a time-bounded commercial entitlement to gym services,
linked to a Member and its plan/commercial/date context
~~~

A Member may have:

~~~text
Member
-> historical Membership A
-> historical/current Membership B
-> future/pending Membership C
~~~

depending on approved business policy.

Membership history must remain independently reconstructable.

### 4.3 Identity is a separate concept

Preserve D-DATA-004:

~~~text
AuthIdentity / Principal
!=
Member
!=
Membership
~~~

Therefore:

~~~text
Membership Expired
!=
AuthIdentity Deleted

Membership Cancelled
!=
Member-self Link Deleted

Member Archived
!=
Auth Provider Account Deleted

Member Blocked
!=
AuthIdentity Disabled
~~~

unless a separately approved security/product policy explicitly requires a coordinated effect.

This ADR does not resolve D-ARCH-004 or D-SEC-004.

## 5. State-Ownership Principles

### 5.1 Entitlement belongs to Membership

The proposed ownership rule is:

~~~text
Membership owns time-bounded entitlement lifecycle.
~~~

Membership therefore owns the meaning of:

~~~text
Pending
Active
Frozen
Expired
Cancelled
~~~

and the entitlement implications of:

- activation/effective period;
- freeze/pause;
- expiry;
- Membership cancellation;
- renewal-window context;
- attendance entitlement;
- no-show Membership eligibility.

### 5.2 Member state is administrative / relationship state only

If Member.status remains, it has a different semantic axis:

~~~text
Member state
=
Member-record / gym-relationship administrative state
~~~

It must not encode:

- Membership freeze;
- Membership expiry;
- Membership cancellation;
- current paid entitlement;
- renewal eligibility.

### 5.3 No mirrored lifecycle

Prohibit:

~~~text
Membership state change
-> automatically mirror equivalent label into Member state
~~~

unless the business event independently causes a separately approved Member-relationship transition.

### 5.4 Current Membership is a query/relationship resolution

Prefer:

~~~text
resolve relevant/current Membership
~~~

over:

~~~text
copy Membership.status into Member.status
~~~

The application/read layer may derive a composite presentation.

Canonical write ownership remains separate.

### 5.5 Read model is not write authority

Preserve:

~~~text
Derived Member Summary
!=
Canonical Member state
!=
Canonical Membership state
~~~

A read model may combine:

~~~text
Member relationship/admin state
+
current/relevant Membership state
+
expiry date
+
freeze context
~~~

for UX/reporting.

It must not become a second lifecycle authority.

## 6. Options Considered

### Option A — Keep Current Overlapping States

Member:

~~~text
Active
Paused
Expired
Cancelled
Blocked
~~~

Membership:

~~~text
Pending
Active
Frozen
Expired
Cancelled
~~~

Strengths:

- smallest wording change;
- preserves legacy labels.

Weaknesses:

- two entitlement-like state owners;
- ambiguous Active;
- Paused/Frozen duplication;
- Expired duplication;
- Cancelled ambiguity;
- mirrored-state pressure;
- multiple-Membership history conflicts;
- unsafe import shortcuts;
- harder constraints, APIs, reports, and tests.

This option is not recommended.

### Option B — Membership Owns Entitlement; Member Gets Distinct Administrative State

Representative Member states:

~~~text
Enabled
Blocked
Archived
~~~

Membership remains:

~~~text
Pending
Active
Frozen
Expired
Cancelled
~~~

Strengths:

- explicit two-axis model;
- Membership remains the sole entitlement lifecycle owner;
- preserves a compact Member status required by current FR-MEMBER-002;
- Blocked retains a distinct existing administrative concern;
- Archived can represent relationship/history disposition without deletion;
- Enabled avoids the overloaded word Active;
- easy for operators/APIs/read models to distinguish;
- supports multiple Membership periods.

Tradeoffs:

- requires FR-MEMBER-004 change if accepted;
- exact Blocked and Archived consequences need product/security review;
- historical migration needs classification of legacy statuses.

This is the proposed direction.

### Option C — Membership Owns Entitlement; Remove Member Enum and Use Explicit Facts

Conceptual examples only:

~~~text
blocked_at
archived_at
~~~

Strengths:

- avoids forcing orthogonal concerns into one enum;
- independently records blocking and archival if they may overlap;
- can reduce artificial state-transition coupling.

Tradeoffs:

- current FR-MEMBER-002 requires a Member status field;
- current product/operator semantics appear to need a concise Member administrative state;
- independent flags can create combinations requiring their own precedence rules;
- schema choice would be prematurely implied if this ADR selected timestamps/flags.

This is a credible future alternative but is not the current recommendation.

### Option D — Member Owns Composite Lifecycle; Membership Becomes Historical Detail

Member would hold the effective lifecycle while Membership periods become subordinate history.

Strengths:

- one top-level label can look simple in UI.

Weaknesses:

- conflicts with current Membership-centered attendance/renewal requirements;
- fails naturally with multiple historical Membership periods;
- couples person/relationship state to one entitlement period;
- makes expired-Membership renewal awkward;
- freeze/pause loses explicit Membership ownership;
- payment effect would need to mutate a composite Member state;
- historical corrections become risky;
- current requirements already use Membership as the eligibility unit.

This option is not recommended.

## 7. Evaluation

| Criterion | Current Overlap | Distinct Member Administrative State | No Member Enum / Explicit Facts | Member Composite State |
|---|---|---|---|---|
| Single source of entitlement truth | Weak | Strong | Strong | Weak/Moderate |
| Multiple historical Memberships | Weak | Strong | Strong | Weak |
| Renewal behavior | Ambiguous | Strong | Strong | Weak/Moderate |
| Expired-member renewal | Confusing | Natural | Natural | Coupled |
| Freeze semantics | Duplicated | Membership-only | Membership-only | Composite ambiguity |
| Cancellation semantics | Ambiguous | Clear axes | Clear axes | Coupled |
| Attendance eligibility | Ambiguous if Member Active is used | Strong | Strong | Moderate |
| No-show eligibility | Ambiguous | Strong | Strong | Moderate |
| Authorization clarity | Weak | Strong separation | Strong separation | Moderate |
| Identity separation | Moderate | Strong | Strong | Moderate |
| Import mapping | High ambiguity | Clearer classification | Clear but schema-specific | High ambiguity |
| Reporting clarity | Weak | Strong | Strong | Moderate |
| Member 360 UX | One overloaded badge | Separate purposeful fields | Separate derived fields | Simple but misleading |
| Auditability | Duplicate transitions | Clear owning transitions | Clear facts/events | Composite transition burden |
| Schema constraints | Drift-prone | Clear future constraints | Clear but more combinatorial | Complex |
| Query simplicity | Superficially simple, semantically unsafe | Strong | Moderate | Moderate |
| Future multi-branch compatibility | Weak/Moderate | Stronger | Stronger | Moderate |
| Migration complexity | Hidden drift | Moderate but explicit | Moderate/High | High |
| Developer misunderstanding risk | Highest | Lowest | Low/Moderate | High |
| Reversibility | Low once mirrored | High | High | Low/Moderate |

The strongest current fit is Option B.

## 8. Proposed Decision

Propose:

~~~text
Member
owns stable tenant-scoped member relationship / operational identity
+
distinct administrative/relationship state

Membership
owns time-bounded commercial entitlement lifecycle
~~~

### Proposed Member state model

~~~text
Enabled
Blocked
Archived
~~~

### Membership entitlement states

Preserve current FR-MEMBERSHIP-002 states:

~~~text
Pending
Active
Frozen
Expired
Cancelled
~~~

### Ownership summary

~~~text
Membership owns:
- Pending/Active/Frozen/Expired/Cancelled entitlement state
- start/expiry period context
- freeze/pause
- attendance entitlement
- no-show Membership eligibility
- renewal window context
- verified renewal Membership effect

Member owns:
- durable tenant-scoped member relationship/record
- administrative/relationship state
- block/unblock
- archive/restore if later approved by product policy
~~~

### Explicit non-equivalences

~~~text
Member Enabled
!=
Membership Active

Member Blocked
!=
Membership Cancelled

Member Archived
!=
Membership Expired

Membership Frozen
!=
Member Paused

Membership Expired
!=
Member Expired

Membership Cancelled
!=
Member Cancelled
~~~

### Status qualification

This is Proposed only.

~~~text
ADR-0026 = Proposed
D-DATA-007 = P1 PROPOSED / unresolved
FR-MEMBER-004 = unchanged
~~~

No state name becomes final product behavior merely by drafting this ADR.

## 9. Member Administrative / Relationship State

### 9.1 Enabled

Proposed meaning:

~~~text
Member record / gym relationship may participate in ordinary workflows
subject to authorization and each workflow's independent business eligibility.
~~~

Important:

~~~text
Member Enabled
!=
current Membership entitlement
~~~

An Enabled Member can legitimately have:

- Active Membership;
- Frozen Membership;
- Expired Membership;
- Cancelled historical Membership;
- no current Membership.

### 9.2 Blocked

Proposed meaning:

~~~text
an administrative/member-level restriction exists
~~~

Blocked is not:

- Membership expiry;
- Membership freeze;
- Membership cancellation;
- AuthIdentity disabled;
- privacy deletion.

The exact operations affected by Blocked remain product/security policy.

Potentially affected operations may include:

- attendance eligibility;
- Member self-service;
- renewal initiation;
- selected staff operations.

This ADR does not decide those exact effects.

### 9.3 Archived

Proposed meaning:

~~~text
the Member relationship/record is no longer active in normal operational workflows,
while required history remains retained and reconstructable.
~~~

Archived is not hard deletion.

Archived does not itself erase:

- Membership history;
- Attendance;
- Payments;
- Renewals;
- Follow-ups;
- Audit records.

Data deletion/export remains D-SEC-005.

Retention remains D-SEC-006.

### 9.4 Why Enabled instead of Active

Retaining Member.status = Active is technically definable, but creates a recurring ambiguity beside Membership.status = Active.

~~~text
Active Member
~~~

could mean:

- administratively available Member record; or
- Member with a current Active Membership.

The proposed label Enabled is clearer because it describes administrative/relationship availability without implying paid entitlement.

### 9.5 Why remove Paused / Expired / Cancelled from Member semantics

Paused:

- current requirements explicitly place freeze/pause on Membership;
- keeping Member Paused creates dual ownership.

Expired:

- expiry is a time-bounded Membership fact;
- the Member relationship can persist after expiry.

Cancelled:

- current product contains at least three materially different concepts:
  - Membership Cancelled;
  - FollowUpOutcome.Cancelled;
  - possible Member relationship end.
- one Member Cancelled label obscures which meaning applies.

If the product later needs a distinct relationship-end reason/status beyond Archived, it requires explicit product semantics rather than inheriting the Membership word Cancelled.

### 9.6 Conceptual transition table

This table defines ownership, not final business workflow.

| From | To | Current evidence |
|---|---|---|
| Enabled | Blocked | Conceptually supported by existing Blocked Member requirement; exact authority/effects remain policy-dependent |
| Blocked | Enabled | Required counterpart if blocking is reversible; exact authority/audit policy remains to be approved |
| Enabled | Archived | Proposed relationship/admin transition; exact business trigger remains Open |
| Archived | Enabled | Restore may be useful but is policy-dependent |
| Blocked | Archived | Open / policy-dependent |
| Archived | Blocked | No current need established; Open |

No transition method, endpoint, schema, or event is created.

## 10. Membership Entitlement State

Current Membership states remain the stronger canonical entitlement model.

### Pending

~~~text
Membership entitlement record exists
but is not yet active/effective according to approved business/date rules.
~~~

### Active

~~~text
Membership is currently entitled according to approved policy/date/state rules.
~~~

### Frozen

~~~text
Membership entitlement is temporarily suspended under an approved freeze/pause.
~~~

Freeze reason and approval remain D-BIZ-005 / D-BIZ-006.

Whether freeze extends expiry remains D-BIZ-007 and FR-MEMBERSHIP-007.

### Expired

~~~text
the relevant Membership entitlement period ended.
~~~

It does not imply:

- Member record expired;
- AuthIdentity deleted;
- Member history unavailable;
- renewal prohibited;
- Principal deleted.

### Cancelled

~~~text
the Membership entitlement/commercial period is cancelled according to approved policy.
~~~

Cancellation/refund effects remain D-BIZ-011.

This ADR does not decide:

- cancellation effective date;
- refund entitlement;
- reactivation;
- proration;
- exact legal/commercial effect.

### State/date consistency

Membership state cannot be designed independently from:

~~~text
start date
expiry date
gym-local business date
freeze period
explicit state
~~~

Future accepted schema/state-machine work must define consistency rules.

This ADR does not decide generated columns, constraints, transition triggers, or exact derivation rules.

### Membership transition ownership

Conceptually, the Membership domain owns operations such as:

~~~text
activate
freeze
unfreeze
expire
cancel
apply verified renewal effect
~~~

Exact transition graph remains subject to accepted business policies.

## 11. Attendance Eligibility Impact

FR-ATTENDANCE-002 already requires:

~~~text
verified Member identity
+
Membership eligibility
+
branch context
+
duplicate policy
~~~

The proposed model makes the lifecycle portion explicit:

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

Do not use:

~~~text
if Member.status == Active
  allow check-in
~~~

as the entitlement model.

### Representative combinations

| Member State | Membership State | Attendance Entitlement | Renewal Context | Notes |
|---|---|---|---|---|
| Enabled | Active | Eligible only after all independent checks pass | Normal/current | Member state does not itself grant entitlement |
| Enabled | Frozen | Not eligible due to Membership during approved freeze | Policy-dependent | Standard no-show excluded |
| Enabled | Expired | Not eligible due to Membership | Renewal/history context may remain | Normal post-expiry Member scenario |
| Enabled | No current Membership | No Membership entitlement | New/renewal flow may be available by policy | Member record remains valid |
| Blocked | Active | Administratively restricted where approved policy requires | Policy-dependent | Active commercial entitlement is not rewritten |
| Blocked | Expired | No entitlement + administrative restriction | Policy-dependent | Two independent facts |
| Archived | Expired/history | Not normal operational attendance | History-only / reactivation policy open | History retained |
| Archived | Active | Requires explicit operational/data-quality review | Policy-dependent | Do not silently cancel/rewrite Membership |

### Blocked + Active Membership

This is a meaningful representable combination:

~~~text
Member = Blocked
Membership = Active
~~~

It can mean:

~~~text
commercial entitlement exists
+
an independent administrative restriction applies
~~~

The model must preserve both facts.

Exact attendance/self-service/renewal behavior remains an approved policy question.

### Enabled + Expired Membership

This should be normal:

~~~text
Member = Enabled
Membership = Expired
~~~

It supports:

- renewal;
- re-engagement;
- history;
- retention/service follow-up;
- future Membership creation.

## 12. Retention / No-Show Impact

FR-RETENTION-003 already says standard no-show detection excludes relevant Memberships that are:

~~~text
Frozen / paused
Expired
Cancelled
~~~

Therefore conceptual no-show population is:

~~~text
Member
+
eligible relevant Membership
+
last valid Attendance
+
approved Member-level administrative predicate if applicable
~~~

not:

~~~text
Member.status == Active
~~~

alone.

A Member-level Blocked or Archived state may additionally exclude a Member from no-show workflows, but the exact policy must be explicitly approved.

Do not copy that administrative state into Membership.

### Return flow

FR-RETURN-001 allows a valid return Attendance to resolve an eligible no-show case.

Return after inactivity does not by itself imply:

~~~text
Member Paused -> Member Active
~~~

because the proposed Member model does not use Membership pause semantics.

## 13. Renewal and Payment Impact

### 13.1 Renewal eligibility

FR-RENEWAL-001 says:

~~~text
identify Memberships entering configured renewal windows
~~~

Therefore:

~~~text
Renewal eligibility
derives from Membership
~~~

not from:

~~~text
Member.status = Expired
~~~

### 13.2 Expired Membership can preserve Member

A Member may remain Enabled with an Expired Membership and continue to have:

- identity relationship;
- history;
- renewal options where policy allows;
- payment history;
- attendance history;
- future Membership potential.

### 13.3 Verified renewal payment

FR-PAYMENT-006 requires:

~~~text
verified successful renewal payment
-> intended Membership effect exactly once
~~~

The canonical effect targets Membership entitlement semantics.

It must not require mirrored Member Active/Expired changes.

### 13.4 Early renewal remains separate

D-BIZ-010 remains Open:

~~~text
new period starts from existing expiry
or
payment date
~~~

This ADR does not decide whether renewal:

- extends an existing Membership; or
- creates a later Membership period.

It only states that the resulting entitlement belongs to Membership.

### 13.5 Cancellation/refund remains separate

D-BIZ-011 remains Open.

Refund/reversal policy may have an approved Membership consequence.

It does not automatically define Member administrative state.

## 14. Authentication / Authorization Impact

### 14.1 Identity separation

Preserve:

~~~text
AuthIdentity / Principal
!=
Member
!=
Membership
~~~

Membership expiry cannot implicitly delete authentication identity.

Member archival/block cannot implicitly disable an auth-provider account without a separately governed security action.

### 14.2 Member-self relationship

A valid:

~~~text
Principal
-> Member-self relationship
~~~

may continue to exist while Membership is:

~~~text
Expired
Cancelled
Frozen
~~~

depending on approved product/security policy.

Membership state does not erase identity linkage.

This permits experiences such as:

- history access;
- renewal options;
- relationship recovery;

where separately authorized.

### 14.3 Authorization checks remain independent

Protected operations still reason about:

~~~text
verified Principal
+
tenant/resource scope
+
named capability or Member-self relationship
+
Member administrative eligibility where relevant
+
Membership entitlement where relevant
+
domain rule
~~~

Do not use Member state as a universal authorization switch.

Do not use Membership state as authentication proof.

### 14.4 Error semantics

Future safe application errors may distinguish:

~~~text
member administratively blocked
membership frozen
membership expired
membership cancelled
no applicable Membership
~~~

where exposing the distinction is appropriate.

No error codes are finalized here.

## 15. Import and Migration Semantics

FR-IMPORT-001/002 require controlled import and prohibit fabrication of missing material facts.

### 15.1 Do not duplicate one source status

Do not map:

~~~text
source status
-> Member state
and
-> Membership state
~~~

automatically.

First classify what the source field actually means.

### 15.2 Conceptual mapping guidance

Source:

~~~text
expired
~~~

Likely classification:

~~~text
Membership entitlement evidence
not automatically Member relationship state
~~~

Source:

~~~text
paused
~~~

Likely classification:

~~~text
possible Membership freeze/pause
requires sufficient meaning/effective-date evidence
~~~

Source:

~~~text
frozen
~~~

Likely classification:

~~~text
Membership state evidence
~~~

Source:

~~~text
blocked
~~~

Likely classification:

~~~text
possible Member administrative state
~~~

Source:

~~~text
cancelled
~~~

is ambiguous:

~~~text
Membership cancelled?
Member relationship ended?
Follow-up outcome?
legacy operator shorthand?
~~~

Require source semantics / reconciliation.

Source:

~~~text
inactive
~~~

is also ambiguous and must not be silently translated into Enabled/Blocked/Archived or Membership Expired.

Missing or ambiguous status:

~~~text
flag for reconciliation
~~~

rather than fabricate a canonical state.

### 15.3 Do not invent Unknown to hide ambiguity

A future production enum named Unknown is not introduced solely to absorb migration uncertainty.

Staging/reconciliation may preserve raw source evidence separately according to the eventual import design.

### 15.4 Historical Membership periods

Import must support conceptual history such as:

~~~text
Member
-> 2025 Membership: Expired
-> 2026 Membership: Active
~~~

without rewriting Member identity for each period.

## 16. Reporting / Read-Model Semantics

### 16.1 Separate Member and Membership fields

Future APIs/read models should use purposeful representation such as:

~~~text
memberState
membershipState
membershipExpiry
freezeContext
~~~

or equivalent.

Avoid an unqualified status field in a composite Member summary when the resource meaning is unclear.

### 16.2 Member 360 / staff UI

A future Member summary should display separate concepts:

~~~text
Member relationship/admin state
Current/relevant Membership state
Expiry date
Freeze context
~~~

rather than one overloaded lifecycle badge.

No UI is implemented here.

### 16.3 Member search

FR-MEMBER-005 requires scoped search.

Future filters should distinguish:

~~~text
memberState
membershipState
~~~

or equivalent purposeful fields.

Avoid:

~~~text
status=Active
~~~

when it is ambiguous which domain is filtered.

### 16.4 Active Members metric

The current phrase:

~~~text
Active Members
~~~

can mean either:

~~~text
administratively Enabled Member records
~~~

or:

~~~text
Members with an Active Membership
~~~

Future metric definitions should use explicit language.

Examples:

~~~text
Members with Active Membership
Administratively Enabled Members
Expired Memberships
Frozen Memberships
~~~

The existing KPI implementation/requirements are not rewritten by this Proposed ADR.

### 16.5 Derived labels are allowed

A query/presentation layer may derive labels such as:

~~~text
Blocked
Membership Frozen
Membership Expired
Active Membership
No Active Membership
~~~

Derived presentation is acceptable.

Duplicated canonical lifecycle state is not.

## 17. Audit and History

Operationally material transitions should be auditable according to approved policy.

Representative future events include:

~~~text
Member blocked
Member unblocked
Member archived
Member restored
Membership frozen
Membership unfrozen
Membership cancelled
Membership renewal effect
~~~

Historical Membership state must remain reconstructable after later Member administrative changes.

Changing Member state must not rewrite historical:

- Membership;
- Attendance;
- Payment;
- Renewal;
- Follow-up.

Follow-up outcome is separately owned:

~~~text
FollowUpOutcome.Cancelled
!=
Membership.status = Cancelled
!=
Member administrative state
~~~

Any cross-domain transition requires explicit approved business logic.

## 18. Security and Privacy Impact

### Security

Benefits:

- prevents Member.status from becoming accidental authorization/entitlement authority;
- clarifies Member-self versus entitlement;
- reduces inconsistent security predicates;
- supports explicit administrative blocking without corrupting commercial history;
- improves future negative-test design.

Security invariants:

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

Application authorization still evaluates Principal, scope, capabilities/Member-self, trusted resource relationships, and business eligibility.

### Privacy

Archived is not deleted.

~~~text
Member Archived
!=
Data Subject Deletion Complete
~~~

Expired/Cancelled Membership does not authorize deleting financial, Attendance, audit, or required operational history.

D-SEC-005 controls deletion/export workflow and authority.

D-SEC-006 controls retention periods.

This ADR makes no legal/privacy retention conclusion.

## 19. Data-Quality and Constraint Implications

### 19.1 Semantically valid combinations

Future data-quality rules must not flag valid combinations merely because labels differ.

Examples under the proposed model:

~~~text
Member Enabled + Membership Active
Member Enabled + Membership Frozen
Member Enabled + Membership Expired
Member Enabled + no current Membership
Member Blocked + Membership Active
historical Cancelled Membership + later Active Membership
~~~

### 19.2 Combinations requiring policy/data-quality review

Examples may include:

~~~text
Archived Member + current Active Membership
multiple simultaneously applicable Active Memberships
overlapping Pending/Active periods
state/date mismatch
freeze interval outside Membership period
~~~

This ADR does not declare every such combination invalid.

Some require separate business invariants.

### 19.3 Current/relevant Membership selection

Future application rules must define how to resolve the relevant Membership using evidence such as:

~~~text
tenant
branch where applicable
effective dates
Membership state
pending/future periods
historical periods
renewal overlap
~~~

Whether multiple simultaneously applicable Memberships are forbidden is not decided here.

### 19.4 Future constraint opportunities

If accepted, the ownership model enables later schema/design work for:

- Membership lifecycle constraints;
- date/status consistency;
- tenant ownership;
- import validation;
- entitlement-query indexes;
- one-current-Membership policy if separately approved.

No CHECK constraint, index, FK, trigger, RLS policy, or migration is created in this task.

## 20. Testing and Validation

Before acceptance/implementation, future examples must prove at least:

1. Member Enabled + Membership Active.
2. Member Enabled + Membership Frozen.
3. Member Enabled + Membership Expired.
4. Member Enabled + no current Membership.
5. Member Blocked + Membership Active.
6. Historical Cancelled Membership + later Active Membership.
7. Expired Membership preserves Member identity/history.
8. Frozen Membership is excluded from standard no-show.
9. Expired Membership is denied attendance entitlement.
10. Member block does not rewrite Membership history.
11. Membership expiry does not delete/expire Member.
12. Renewal eligibility reads Membership.
13. Verified renewal effect changes Membership entitlement exactly once.
14. FollowUpOutcome.Cancelled does not auto-cancel Member/Membership.
15. Import Active is classified using source semantics rather than duplicated.
16. Import Paused/Frozen mapping is Membership-oriented only when evidence supports it.
17. Import Expired maps to Membership evidence, not automatic Member expiry.
18. Import Cancelled ambiguity requires classification.
19. Import Blocked can map to Member administrative state only with source evidence.
20. Ambiguous import is flagged for reconciliation.
21. Member search distinguishes Member and Membership state dimensions.
22. API/read model distinguishes both dimensions.
23. Reporting distinguishes Enabled Members from Members with Active Membership.
24. AuthIdentity remains separate.
25. Member-self linkage can survive Membership expiry according to approved policy.
26. Historical records remain reconstructable.

Additional future tests should include:

- unauthorized Member block/archive changes;
- tenant A -> tenant B state mutation attempts;
- gym-local expiry boundary;
- freeze expiry-edge cases;
- early renewal policy once D-BIZ-010 is resolved;
- concurrent renewal/payment effect;
- multiple Membership period resolution;
- data-quality checks for impossible combinations after final policy is accepted.

No tests are implemented by ADR-0026.

## 21. Requirement Changes Required If Accepted

### 21.1 FR-MEMBER-004 conflicts with this proposal

Current FR-MEMBER-004:

~~~text
Active
Paused
Expired
Cancelled
Blocked
~~~

must not remain canonical if Option B is accepted because it duplicates Membership entitlement semantics.

### 21.2 Proposed replacement wording

If ADR-0026 is explicitly accepted, propose replacing FR-MEMBER-004 with wording equivalent to:

~~~text
### FR-MEMBER-004 Member administrative / relationship state

Member state MUST represent the tenant-scoped Member record/relationship
administrative state independently from Membership entitlement.

Supported Member states MUST include:

Enabled
Blocked
Archived

Enabled MUST NOT imply that an Active Membership exists.

Blocked MUST represent an independent administrative/member restriction;
the exact operations affected by Blocked MUST follow separately approved
product/security policy.

Archived MUST represent a historical/inactive Member relationship/record
state and MUST NOT mean hard deletion.

Member state MUST NOT duplicate Membership Pending, Active, Frozen,
Expired, or Cancelled entitlement semantics.

Operationally material Member-state changes MUST be authorized and auditable.
~~~

This text is a Proposed follow-up requirement change, not an edit performed by Task 0034.

### 21.3 FR-MEMBER-002

FR-MEMBER-002 currently requires a Member status field.

Option B remains compatible with that requirement at conceptual level.

If Option C is selected instead during review, FR-MEMBER-002 would also require explicit revision.

### 21.4 Other docs requiring accepted-decision synchronization

If accepted, review/update at least:

- docs/00-overview/assumptions.md;
- docs/01-product/functional-requirements.md;
- docs/01-product/product-requirements.md;
- docs/01-product/feature-catalog.md;
- docs/01-product/user-journeys.md where ambiguous wording exists;
- docs/01-product/success-metrics.md;
- docs/02-architecture/architecture-principles.md;
- docs/02-architecture/architecture-overview.md;
- docs/02-architecture/system-context.md;
- docs/02-architecture/container-architecture.md;
- docs/02-architecture/component-architecture.md;
- docs/02-architecture/data-flow.md;
- docs/02-architecture/technology-stack.md;
- future API/data/schema documents.

Do not synchronize canonical behavior merely because the ADR is Proposed.

## 22. Schema / Migration Follow-Up If Accepted

Acceptance would unblock a separate data-model/schema task.

That future task may design conceptual relationships such as:

~~~text
Member 1 -> N Memberships
Membership -> Member
~~~

and then define:

- concrete schema;
- columns;
- enum/check strategy;
- indexes;
- foreign keys;
- tenant ownership;
- date/state consistency;
- current/relevant Membership query;
- import migration;
- historical status mapping;
- constraints;
- data-quality migration checks;
- API DTO changes;
- state-transition implementation.

Task 0034 creates none of them.

Do not create:

~~~text
Member table
Membership table
enum
ORM model
TypeScript type
database migration
CHECK constraint
index
trigger
RLS policy
API endpoint
DTO implementation
domain code
state-machine library
import mapper
test implementation
UI badge
~~~

## 23. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Enabled is mistaken for paid entitlement | Explicit non-equivalence; APIs/UI/reporting expose Membership state separately |
| Blocked becomes universal auth disable | Keep AuthIdentity/session/security actions separately governed |
| Archived becomes soft-delete shortcut | Explicitly separate archival, deletion/export, and retention |
| Existing code/imports mirror old states | Acceptance requires migration inventory and explicit mapping/reconciliation |
| Membership expiry still copied to Member | Explicit no-mirrored-lifecycle rule and tests |
| Cancelled remains overloaded | Distinguish FollowUpOutcome, Membership cancellation, and Member relationship archival |
| Freeze semantics leak to Member | Membership exclusively owns freeze/pause entitlement |
| Member Blocked + Active Membership is treated as corruption | Treat as representable independent facts; downstream policy decides restrictions |
| Archived + Active Membership is ignored | Flag for explicit policy/data-quality review, not silent rewrite |
| Multiple current Memberships become ambiguous | Separate invariant/policy must define applicability; do not guess here |
| Active Members KPI stays ambiguous | Require explicit metric definition after acceptance |
| Import fabricates meaning | Classify source semantics; ambiguous rows go to reconciliation |
| Renewal mutates duplicated Member lifecycle | Verified renewal effect targets Membership only |
| Schema finalized before acceptance | Governance gate: ADR remains Proposed and D-DATA-007 unresolved |
| Proposed state names treated as product fact | Docs state clearly that FR-MEMBER-004 is unchanged until approval |

## 24. Reversibility

The proposal is highly reversible before schema implementation because it currently changes documentation only.

If later accepted and implemented, reversibility remains stronger than the current overlapping design because:

- entitlement stays concentrated in Membership;
- Member administrative state has independent semantics;
- read models can change without migrating canonical entitlement;
- provider/auth identity remains separate;
- historical Memberships remain intact.

Migrating from overlapping Member states to distinct administrative semantics will require explicit source classification.

Avoiding mirrored state now reduces future migration burden.

## 25. Revisit Triggers

Revisit the proposal if evidence shows:

- the product does not need a Member administrative state at all;
- Blocked and Archived are truly independent facts that cannot fit one enum safely;
- a distinct relationship-ended state needs richer semantics than Archived;
- future multi-branch membership/relationship semantics require a different Member scope;
- multiple concurrent Membership entitlements become a normal approved product model;
- compliance/security requires explicit Member-account suspension semantics distinct from business block;
- accepted product research establishes different operator terminology.

A revisit does not silently restore overlapping entitlement states.

## 26. Open Questions

1. What exact operations does Member Blocked prevent?
2. Does Blocked prevent Member self-service, renewal initiation, attendance, selected staff operations, or only a subset?
3. Who may block/unblock a Member and what audit reason is required?
4. What exact business event archives a Member relationship?
5. Is restore from Archived allowed?
6. Does GymPulse need a distinct relationship-ended reason beyond Archived?
7. Can one Member have more than one simultaneously applicable Membership in Phase 1?
8. How is the current/relevant Membership selected when future/pending periods overlap renewal?
9. What exact policy applies to Archived + Active Membership?
10. How should imported legacy Active be classified when the source does not distinguish Member relationship from Membership entitlement?
11. Which dashboard/report metric currently named Active Members should mean Members with Active Membership versus administratively Enabled Member records?
12. What Member-self capabilities remain available after Membership expiry/cancellation?
13. Which Blocked consequences belong to product policy versus security/account policy?
14. What migration strategy is used for existing legacy Member Paused/Expired/Cancelled values if/when implementation data exists?
15. How should branch context affect current/relevant Membership selection in future multi-branch evolution?

## 27. Decision Evidence

Research/audit date: 2026-09-27.

### Canonical repository evidence

- docs/00-overview/assumptions.md — D-DATA-007 is P1 PROPOSED; proposed direction already places entitlement states in Membership and requires FR-MEMBER-004 review.
- docs/01-product/functional-requirements.md — exact Member, Membership, Attendance, Retention, Follow-up, Return, Renewal, Payment, Authorization, Import, and cross-domain requirements.
- docs/01-product/non-functional-requirements.md — canonical source-of-truth, testability, historical integrity, security, migration/documentation governance.
- docs/01-product/feature-catalog.md — Membership lifecycle is Pending/Active/Frozen/Expired/Cancelled; freeze/pause is Membership-scoped; no-show excludes frozen/expired/cancelled Memberships.
- docs/01-product/user-journeys.md — Member Home presents Membership state/expiry; attendance requires Membership eligibility; no-show loads eligible Memberships; renewal scans Memberships.
- docs/02-architecture/architecture-principles.md — ARCH-PRIN-009 requires one owner for canonical business state and explicitly identifies current Member/Membership overlap.
- docs/02-architecture/architecture-overview.md — entitlement truth is already treated as Membership-owned while D-DATA-007 remains unresolved.
- docs/02-architecture/system-context.md — entitlement must not be inferred from Member.status alone.
- docs/02-architecture/container-architecture.md — unresolved D-DATA-007 remains visible; runtime boundaries do not resolve state ownership.
- docs/02-architecture/component-architecture.md — entitlement-sensitive components must not derive eligibility from Member.status alone.
- docs/02-architecture/data-flow.md — D-DATA-007 affects attendance/no-show/renewal/import/dashboard/data-quality and forbids silent dual mapping.
- docs/02-architecture/technology-stack.md — final overlapping Member/Membership constraints/state machines must wait for ownership resolution.
- ADR-0001 — domain modules have explicit write ownership; read models are not alternate write authorities.
- ADR-0004 — final Member/Membership tables, constraints, indexes, and transitions wait for D-DATA-007.
- ADR-0005 — final constraints, entitlement queries, and state-machine migrations wait for D-DATA-007.
- ADR-0007 / ADR-0008 — authentication/Principal/Member separation is preserved; Membership lifecycle is not identity proof.
- ADR-0009 — authorization cannot use overlapping Member/Membership lifecycle state as entitlement truth.
- ADR-0010 — RLS does not own entitlement or business-state semantics.
- ADR-0011 — API DTOs/contracts should remain purposeful and server-authoritative.
- ADR-0015 — background workflows reload current business state and preserve domain ownership.
- ADR-0018 — Membership eligibility/state transitions require deterministic tests.
- ADR-0022 — verified renewal payment business effect is provider-independent and must remain canonical/idempotent.
- ADR-0025 — no cache is introduced as alternate lifecycle authority.

### Business/security decisions deliberately left separate

Verified current canonical statuses:

~~~text
D-BIZ-005  P1 OPEN  freeze reasons
D-BIZ-006  P1 OPEN  freeze approval
D-BIZ-007  P1 OPEN  freeze expiry extension
D-BIZ-010  P1 OPEN  early-renewal period start
D-BIZ-011  P1 OPEN  cancellation/refund policy

D-SEC-005  P1 OPEN  data deletion/export workflow and authority
D-SEC-006  P1 OPEN  retention periods
~~~

D-ARCH-004 remains Open for authentication/session.

D-ARCH-015 remains Proposed for authorization implementation.

D-ARCH-002 / D-ARCH-017 / D-ARCH-018 remain Proposed for database, persistence/migration, and testing.

No current ADR is Accepted.

### Legacy evidence

Legacy schema/product/open-decision files were treated as migration evidence only.

Structured canonical docs control where they conflict.

## 28. Related Documents

- ../README.md
- ../00-overview/assumptions.md
- ../00-overview/scope.md
- ../00-overview/glossary.md
- ../01-product/functional-requirements.md
- ../01-product/non-functional-requirements.md
- ../01-product/product-requirements.md
- ../01-product/feature-catalog.md
- ../01-product/user-journeys.md
- ../01-product/user-roles.md
- ../01-product/success-metrics.md
- ../02-architecture/architecture-principles.md
- ../02-architecture/architecture-overview.md
- ../02-architecture/system-context.md
- ../02-architecture/container-architecture.md
- ../02-architecture/component-architecture.md
- ../02-architecture/data-flow.md
- ../02-architecture/technology-stack.md
- README.md
- ADR-0001-modular-monolith.md
- ADR-0004-database-engine.md
- ADR-0005-data-access-migration-strategy.md
- ADR-0007-authentication-session-architecture.md
- ADR-0008-member-authentication-method.md
- ADR-0009-authorization-implementation.md
- ADR-0010-data-layer-tenant-isolation-rls.md
- ADR-0011-api-contract-architecture.md
- ADR-0015-background-jobs-scheduler.md
- ADR-0018-testing-toolchain.md
- ADR-0022-payment-provider.md
- ADR-0025-redis-cache-requirement.md
- legacy migration source: ../06-database-schema.md
- legacy migration source: ../01-product-requirements.md
- legacy migration source: ../00-product-blueprint.md
- legacy migration source: ../16-open-decisions.md
