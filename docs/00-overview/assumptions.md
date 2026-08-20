# GymPulse Assumptions and Open Decisions

## Document Control

- Document Maturity: `Draft`
- Scope: Product, architecture, pilot, security, provider, data, and operational assumptions
- Canonical Decision Register: `This document`
- Migration Source: `../16-open-decisions.md`

## 1. Purpose

Track information that is not yet confirmed so the project does not silently convert uncertainty into business logic or infrastructure commitments.

This document is the canonical high-level decision register. Detailed architecture choices receive ADRs when they are reviewed and accepted or rejected.

## 2. Decision Status Model

```text
OPEN      unresolved question
ASSUMED   temporary working assumption
PROPOSED  recommended direction awaiting approval
DECIDED   explicitly approved; link to ADR or decision evidence
DEFERRED  intentionally postponed
BLOCKED   work cannot safely continue until resolved
```

These are decision statuses, not document maturity or product scope labels.

## 3. Priority Model

```text
P0  blocks safe architecture or production security/correctness
P1  blocks a Phase 1 workflow or important architecture path
P2  safe temporary default may be used for prototype/pilot
P3  later-phase decision
```

## 4. Pilot Business Decisions

| ID | Priority | Status | Question / Assumption | Decision Owner |
|---|---:|---|---|---|
| D-BIZ-001 | P1 | OPEN | What is the exact pilot gym and verified baseline member count by status? | Product + Gym Owner |
| D-BIZ-002 | P1 | OPEN | What attendance method is currently used: register, biometric, card, spreadsheet, QR, or another app? | Gym Owner |
| D-BIZ-003 | P1 | ASSUMED | First no-show threshold uses `10 days` as a sample. Confirm exact policy. | Gym Owner |
| D-BIZ-004 | P1 | OPEN | For a new member with zero attendance, when does inactivity begin? | Product + Gym Owner |
| D-BIZ-005 | P1 | OPEN | Which pause/freeze reasons are allowed? | Gym Owner |
| D-BIZ-006 | P1 | OPEN | Who can approve a pause/freeze? | Gym Owner |
| D-BIZ-007 | P1 | OPEN | Does a freeze extend membership expiry? If yes, by what rule? | Gym Owner |
| D-BIZ-008 | P1 | OPEN | Can a member have multiple visits per day, and what duplicate window applies? | Gym Owner |
| D-BIZ-009 | P1 | OPEN | Which renewal reminder windows are enabled? | Gym Owner |
| D-BIZ-010 | P1 | OPEN | When a renewal succeeds early, does the new period begin from existing expiry or payment date? | Product + Gym Owner |
| D-BIZ-011 | P1 | OPEN | Which cancellation and refund rules apply to memberships? | Gym Owner |
| D-BIZ-012 | P1 | OPEN | Which offline payment methods are allowed and who can record/approve them? | Gym Owner |
| D-BIZ-013 | P1 | OPEN | What receipt/invoice fields are legally/business-required for the pilot? | Business Owner/Advisor |
| D-BIZ-014 | P1 | OPEN | How is member communication consent currently captured? | Gym Owner |
| D-BIZ-015 | P1 | OPEN | Which five operational numbers are most important to the owner each day? | Gym Owner |

## 5. Product Boundary Decisions

| ID | Priority | Status | Question / Assumption |
|---|---:|---|---|
| D-PROD-001 | P1 | DECIDED | Phase 1 is an operations/retention MVP, not a generic fitness super-app. |
| D-PROD-002 | P2 | PROPOSED | Member repeated actions in Phase 1 should stay minimal, centered on check-in and renewal. |
| D-PROD-003 | P3 | OPEN | Is workout programming a gym-owned trainer feature, a member self-service feature, or both? |
| D-PROD-004 | P3 | OPEN | What exactly does the Nutrition domain include: tracking, plans, professional service delivery, AI guidance, or combinations? |
| D-PROD-005 | P3 | OPEN | What health data will GymPulse collect, for what purpose, and with what retention rules? |
| D-PROD-006 | P3 | OPEN | Is Human Coaching limited to gym trainers or intended as a broader coaching platform? |
| D-PROD-007 | P3 | OPEN | What is the primary AI value proposition: owner analytics, trainer assistance, member coach, or a phased combination? |
| D-PROD-008 | P3 | OPEN | Which countries/regions are targeted after the initial pilot? |
| D-PROD-009 | P3 | OPEN | Is white-labeling a strategic requirement or optional enterprise feature? |

## 6. Architecture Decisions Requiring ADRs

The following must not become final merely because they appear in a legacy architecture or engineering recommendation.

| ID | Priority | Status | Decision Required | Current Direction / Constraint |
|---|---:|---|---|---|
| D-ARCH-001 | P0 | PROPOSED | Repository strategy and package boundaries. | Monorepo is recommended; no repository tool is accepted yet. |
| D-ARCH-002 | P0 | PROPOSED | Canonical database engine. | PostgreSQL is the current recommendation, not an accepted decision. |
| D-ARCH-003 | P0 | PROPOSED | Primary client/server contract architecture. | JSON HTTP with typed/runtime-validated contracts is recommended. |
| D-ARCH-004 | P0 | OPEN | Authentication/session strategy supporting staff web and member access. | Must support revocation and server-side principal resolution. |
| D-ARCH-005 | P1 | PROPOSED | System decomposition style for Phase 1. | Modular monolith before microservices is recommended. |
| D-ARCH-006 | P1 | OPEN | API deployment boundary. | Decide web-runtime API vs independently deployed API while preserving domain separation. |
| D-ARCH-007 | P1 | OPEN | Durable background-job/scheduler technology. | Must support retries, visibility, tenant scope, and deterministic dedupe. |
| D-ARCH-008 | P2 | OPEN | Whether Redis/cache/ephemeral coordination is required in Phase 1. | Do not add without demonstrated need. |
| D-ARCH-009 | P1 | OPEN | Hosting/deployment platform. | No provider selected. |
| D-ARCH-010 | P1 | OPEN | Object storage provider and protected-access model. | No provider selected. |
| D-ARCH-011 | P1 | ASSUMED | Package manager for a future workspace/monorepo. | Legacy working assumption is `pnpm`; not accepted. |
| D-ARCH-012 | P0 | PROPOSED | Owner/Staff web application framework. | Next.js + TypeScript is a candidate recommendation only. |
| D-ARCH-013 | P1 | PROPOSED | Member client delivery/framework strategy. | Responsive web/PWA vs Expo/React Native must follow validated delivery needs; Expo/RN is not accepted. |
| D-ARCH-014 | P0 | OPEN | Whether to use a managed backend platform and which responsibilities it owns. | Database/Auth/Storage/RLS responsibilities must not be bundled implicitly. |
| D-ARCH-015 | P0 | PROPOSED | Authorization implementation boundary. | Central server-side capability + tenant/resource-scope enforcement is required; exact policy/library/storage implementation remains open. |

## 7. Provider Decisions

| ID | Priority | Status | Decision Required |
|---|---:|---|---|
| D-PROVIDER-001 | P1 | OPEN | Online payment provider |
| D-PROVIDER-002 | P1 | OPEN | WhatsApp/messaging provider |
| D-PROVIDER-003 | P2 | OPEN | Email provider |
| D-PROVIDER-004 | P2 | OPEN | Push notification provider |
| D-PROVIDER-005 | P2 | OPEN | Product analytics provider |
| D-PROVIDER-006 | P1 | OPEN | Error monitoring/observability provider |
| D-PROVIDER-007 | P3 | OPEN | AI model/provider strategy |
| D-PROVIDER-008 | P3 | OPEN | Wearable/health integration providers |

## 8. Security and Privacy Decisions

| ID | Priority | Status | Decision Required |
|---|---:|---|---|
| D-SEC-001 | P0 | OPEN | Launch jurisdiction and applicable privacy/legal obligations |
| D-SEC-002 | P0 | OPEN | Member authentication/verification method |
| D-SEC-003 | P0 | PROPOSED | Tenant isolation must be enforced server-side and reinforced at data layer where practical. |
| D-SEC-004 | P1 | OPEN | Session lifetime, revocation, and device/session management policy |
| D-SEC-005 | P1 | OPEN | Data deletion/export workflow and authority |
| D-SEC-006 | P1 | OPEN | Retention periods for audit, attendance, payment, notification, and future health data |
| D-SEC-007 | P3 | OPEN | Whether future health data requires additional encryption, consent, access controls, or regional hosting |
| D-SEC-008 | P0 when client-accessible database patterns are used | OPEN | Define data-layer tenant-isolation/RLS strategy and its relationship to application capability authorization. |

## 9. Data Model Assumptions and Decisions

| ID | Priority | Status | Assumption / Decision |
|---|---:|---|---|
| D-DATA-001 | P1 | PROPOSED | Use opaque string identifiers such as UUIDs consistently rather than integer public IDs. |
| D-DATA-002 | P1 | PROPOSED | Store event timestamps in UTC and store gym timezone explicitly. |
| D-DATA-003 | P1 | PROPOSED | Represent money in integer minor units plus currency code. |
| D-DATA-004 | P1 | PROPOSED | `Member` and authenticated `User/AuthIdentity` are separate concepts linked explicitly. |
| D-DATA-005 | P1 | PROPOSED | Critical provider events retain immutable external references for reconciliation. |
| D-DATA-006 | P1 | PROPOSED | Financial and sensitive operational history is not hard-deleted merely for reporting cleanliness. |
| D-DATA-007 | P1 | PROPOSED | Clarify state ownership so `Membership` owns entitlement states (`Pending`, `Active`, `Frozen`, `Expired`, `Cancelled`) and `Member` status represents an independent member-record/relationship state rather than duplicating entitlement. `FR-MEMBER-004` requires review before this becomes decided. |

### D-DATA-007 clarification note

Current structured requirements define `Member.status` as `Active`, `Paused`, `Expired`, `Cancelled`, `Blocked`, while `Membership.status` separately defines `Pending`, `Active`, `Frozen`, `Expired`, `Cancelled`.

This creates ambiguous ownership for `Paused/Expired/Cancelled` and can cause contradictory states such as an administratively active member with an expired membership or a member with historical/renewed membership periods.

Cleaner proposed ownership:

- `Membership` determines entitlement and attendance/renewal eligibility.
- `Member` status should describe the member record/relationship or administrative access state only.
- No-show eligibility should derive from the relevant membership plus explicit member-level administrative exclusions, not from duplicated expiry/pause semantics.

This is a proposal only. `FR-MEMBER-004` must be explicitly revised if the decision is approved.

## 10. AI Assumptions

All AI items are `Future` unless explicitly promoted into a product phase.

| ID | Priority | Status | Assumption / Decision |
|---|---:|---|---|
| D-AI-001 | P3 | PROPOSED | Deterministic authorization, payment, membership, attendance, and balance logic stays outside AI. |
| D-AI-002 | P3 | PROPOSED | AI receives permission-filtered context rather than unrestricted database access. |
| D-AI-003 | P3 | OPEN | Define model(s), routing, structured output, memory, tool access, and cost budgets. |
| D-AI-004 | P3 | OPEN | Define health/nutrition safety boundaries before AI member guidance is enabled. |
| D-AI-005 | P3 | OPEN | Define evaluation datasets and acceptance thresholds per AI capability. |

## 11. Legacy Architecture Decision Mapping

`../16-open-decisions.md` remains a migration source. These legacy IDs map to the canonical decisions above and must not be introduced into new structured architecture documents.

| Legacy ID | Canonical ID | Topic |
|---|---|---|
| D-030 | D-PROVIDER-001 | Payment provider |
| D-038 | D-PROVIDER-002 | Messaging provider |
| D-049 | D-ARCH-004 | Staff authentication/session architecture |
| D-050 | D-SEC-002 | Member authentication method |
| D-054 | D-ARCH-011 | Package manager |
| D-055 | D-ARCH-001 | Monorepo/repository strategy |
| D-056 | D-ARCH-012 | Owner/Staff web framework |
| D-057 | D-ARCH-013 | Member mobile/client framework |
| D-058 | D-ARCH-002 | Database engine |
| D-059 | D-ARCH-014 | Managed backend platform |
| D-060 | D-ARCH-006 | API deployment boundary |
| D-061 | D-ARCH-007 | Background jobs |
| D-062 | D-ARCH-008 | Redis/cache requirement |
| D-063 | D-ARCH-010 | Object storage |
| D-064 | D-ARCH-009 | Hosting |
| D-065 | D-PROVIDER-006 | Observability provider |
| D-066 | D-PROVIDER-005 | Product analytics provider |
| D-068 | D-SEC-008 | RLS/data-layer tenant isolation |

## 12. Decision Workflow

For each unresolved P0/P1 item:

1. assign a decision owner,
2. document options,
3. record evidence/constraints,
4. choose a decision or explicit temporary assumption,
5. create an ADR when the decision is architectural,
6. update every affected canonical document,
7. add validation/test implications,
8. record the decision date.

## 13. Rules for Assumptions

- An assumption must never be described as a universal fact.
- Assumptions affecting money, access control, data deletion, or health safety require explicit resolution before production.
- A prototype may use a safe temporary default only when the behavior is visibly configurable or clearly marked.
- No assumption can silently become `DECIDED` because implementation exists.

## 14. Related Documents

- `project-overview.md`
- `scope.md`
- `../README.md`
- legacy migration source: `../16-open-decisions.md`
- ADR governance: `../adr/README.md`
