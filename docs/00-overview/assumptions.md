# GymPulse Assumptions and Open Decisions

## Document Control

- Status: `Active decision register`
- Scope: Product, architecture, pilot, security, provider, and operational assumptions
- Migration Source: `../16-open-decisions.md`

## 1. Purpose

Track information that is not yet confirmed so the project does not silently convert uncertainty into business logic or infrastructure commitments.

This document is the canonical high-level register. Detailed architecture choices will also receive ADRs when decided.

## 2. Status Model

```text
OPEN      unresolved question
ASSUMED   temporary working assumption
PROPOSED  recommended direction awaiting approval
DECIDED   explicitly approved; link to ADR or decision evidence
DEFERRED  intentionally postponed
BLOCKED   work cannot safely continue until resolved
```

## 3. Priority Model

```text
P0  blocks safe architecture or production security/correctness
P1  blocks a Phase 1 product workflow
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

The following must not become final merely because they appear in a design proposal.

| ID | Priority | Status | Decision Required | Planned ADR |
|---|---:|---|---|---|
| D-ARCH-001 | P0 | PROPOSED | Use a monorepo and define package boundaries. | `ADR-0001-use-monorepo.md` |
| D-ARCH-002 | P0 | PROPOSED | Use PostgreSQL as canonical relational store. | `ADR-0002-database-selection.md` |
| D-ARCH-003 | P0 | PROPOSED | Use JSON HTTP API with typed contracts for primary client/server interface. | `ADR-0003-api-architecture.md` |
| D-ARCH-004 | P0 | OPEN | Select authentication/session strategy supporting web and mobile. | `ADR-0004-authentication-strategy.md` |
| D-ARCH-005 | P1 | PROPOSED | Use a modular monolith before microservices. | future ADR |
| D-ARCH-006 | P1 | OPEN | Decide whether the initial API is deployed independently or within the web runtime while retaining domain separation. | future ADR |
| D-ARCH-007 | P1 | OPEN | Select durable background-job/scheduler technology. | future ADR |
| D-ARCH-008 | P2 | OPEN | Determine whether Redis is required in Phase 1. | future ADR if selected |
| D-ARCH-009 | P1 | OPEN | Select hosting/deployment platform. | future ADR |
| D-ARCH-010 | P1 | OPEN | Select object storage provider. | future ADR |

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

## 9. Data Model Assumptions

| ID | Priority | Status | Assumption / Decision |
|---|---:|---|---|
| D-DATA-001 | P1 | PROPOSED | Use opaque string identifiers such as UUIDs consistently rather than integer public IDs. |
| D-DATA-002 | P1 | PROPOSED | Store event timestamps in UTC and store gym timezone explicitly. |
| D-DATA-003 | P1 | PROPOSED | Represent money in integer minor units plus currency code. |
| D-DATA-004 | P1 | PROPOSED | `Member` and authenticated `User/AuthIdentity` are separate concepts linked explicitly. |
| D-DATA-005 | P1 | PROPOSED | Critical provider events retain immutable external references for reconciliation. |
| D-DATA-006 | P1 | PROPOSED | Financial and sensitive operational history is not hard-deleted merely for reporting cleanliness. |

## 10. AI Assumptions

All AI items are `Future` unless explicitly promoted into a product phase.

| ID | Priority | Status | Assumption / Decision |
|---|---:|---|---|
| D-AI-001 | P3 | PROPOSED | Deterministic authorization, payment, membership, attendance, and balance logic stays outside AI. |
| D-AI-002 | P3 | PROPOSED | AI receives permission-filtered context rather than unrestricted database access. |
| D-AI-003 | P3 | OPEN | Define model(s), routing, structured output, memory, tool access, and cost budgets. |
| D-AI-004 | P3 | OPEN | Define health/nutrition safety boundaries before AI member guidance is enabled. |
| D-AI-005 | P3 | OPEN | Define evaluation datasets and acceptance thresholds per AI capability. |

## 11. Decision Workflow

For each unresolved P0/P1 item:

1. assign a decision owner,
2. document options,
3. record evidence/constraints,
4. choose a decision or explicit temporary assumption,
5. create an ADR when the decision is architectural,
6. update every affected canonical document,
7. add validation/test implications,
8. record the decision date.

## 12. Rules for Assumptions

- An assumption must never be described as a universal fact.
- Assumptions affecting money, access control, data deletion, or health safety require explicit resolution before production.
- A prototype may use a safe temporary default only when the behavior is visibly configurable or clearly marked.
- No assumption can silently become `DECIDED` because implementation exists.

## 13. Related Documents

- `project-overview.md`
- `scope.md`
- `../README.md`
- legacy: `../16-open-decisions.md`
- future: `../adr/README.md`
