# GymPulse — Phase 1 UI Design System (Proposal)

## Document Control

| Field | Value |
| --- | --- |
| Document maturity | **Draft / Proposed** |
| Scope | **Phase 1 Member and Owner/Staff experience only** |
| Audit baseline | `main` at `d41bbca92dbc49d1f40f987391ddb527a3f32bee` (2026-10-17) |
| Design decision owner | **Open — Product / Design / Gym operations input required** |
| Architecture decision dependencies | [Owner/Staff web ADR-0012](../adr/ADR-0012-owner-staff-web-framework.md), [Member client ADR-0013](../adr/ADR-0013-member-client-strategy.md) — **Proposed**, not accepted |
| Canonical product and accessibility drivers | [Screen specifications](../04-screen-specifications.md), [User flows](../03-user-flows.md), [User journeys](../01-product/user-journeys.md), [NFRs](../01-product/non-functional-requirements.md) |
| Tracking | [Issue #4 — Design System](https://github.com/im-tnyx/gym-pulse/issues/4) |
| Implementation permission | **None.** This document does not choose a framework, ship UI, approve branding, or open production gates. |

## 1. Purpose and source hierarchy

A reviewable starting language for GymPulse's operational interfaces, not an approved brand style guide or a runnable component library. This file organizes layout, states, semantic design tokens, accessibility and component contracts so design-to-code reviews do not have to infer behavior from visuals.

The authoritative business behavior is described in [`docs/04-screen-specifications.md`](../04-screen-specifications.md) and [`docs/01-product/`](../01-product/). [`docs/README.md`](../README.md) establishes source precedence. [`docs/00-overview/assumptions.md`](../00-overview/assumptions.md) remains the canonical decision register; design proposals cannot change it.

**Status labels throughout:** `REQUIRED` = traceable to existing behavior/NFRs; `PROPOSED` = optional design direction to validate; `OPEN` = actual product/brand/technical decision not yet approved. Numbers in PROPOSED token examples are **not frozen specifications**.

## 2. Product surfaces and information priorities — REQUIRED

| Surface | Primary users | High-priority tasks from canonical screens | Information hierarchy |
| --- | --- | --- | --- |
| Member interface (delivery method OPEN) | Member / Self scope | Membership status/expiry, `Scan QR`, attendance, renewals, payment status, preferences | Primary action → current entitlement/status → next contextual action → detailed history |
| Owner/Staff web (framework OPEN) | Owner, Manager, Front Desk / controlled scope | Member search, assisted check-in, no-show follow-up, renewals, payment exceptions, owner action queues | Current authorized gym/branch context → action queues → contextual details → audit-worthy mutations |
| Shared verification screens | Members and authorized staff | Identity verification/session feedback | Clear identity step → permitted action → safe rejection/recovery |

**Do not invent a trainer application** as Phase 1. Product scope, actual permissions, data and screen inventory are governed by [screen specifications](../04-screen-specifications.md), [user roles](../01-product/user-roles.md), and [journeys](../01-product/user-journeys.md).

## 3. Interaction principles

1. **REQUIRED — Staff workflow speed:** show the next safe task first, not decorative metrics. Member search → result → contextual operation should require predictable steps. Owner action queues precede analytics embellishments.
2. **REQUIRED — Mobile-first for Members:** Member home gives a prominent `Scan QR` when eligible, current membership status/expiry and progress; checkout and consent use readable summaries.
3. **REQUIRED — Server-authoritative results:** client UI cannot claim check-in, payment success, expiry changes or permissions before trusted server confirmation. Retry/timeout states must not encourage duplicate effects.
4. **REQUIRED — No color-only meaning:** each critical state needs a visible word/label and accessible announcement; icon/color can reinforce the same text.
5. **REQUIRED — Honest empty/loading/error states:** include authorization and business-rule rejections, not just generic spinner/success.
6. **PROPOSED — Calm operational density:** higher density for staff data tables; fewer decisions, comfortable reading and high-salience action for Members.
7. **PROPOSED — Contextual assistance:** short explanation + next step (retry, contact gym, filter, return) instead of unexplained technical errors.

## 4. Proposed semantic token architecture — NOT approved brand tokens

Use semantic roles so individual screens do not independently pick contrast, spacing, radius and state colors. **No final palette, logo, typeface, typography scale, dark mode or brand direction has been approved.**

### 4.1 Color roles — PROPOSED nomenclature only

| Token role (example, names not final) | Use | Constraint |
| --- | --- | --- |
| `surface.page`, `surface.panel`, `surface.raised` | App shells, action cards, overlays | Clear hierarchy without masking content |
| `text.primary`, `text.secondary`, `text.muted` | Text hierarchy | Contrast against actual paired surfaces must be checked |
| `border.default`, `border.focus`, `focus.ring` | Fields, selection, keyboard focus | Focus must not rely only on subtle color change |
| `action.primary`, `action.secondary`, `action.destructive` | Calls to action | Do not use destructive style for ordinary navigation |
| `status.success`, `status.warning`, `status.danger`, `status.info`, `status.neutral` | Attendance/payment/membership/queue feedback | Never equate generic green with verified payment without explicit trusted state |
| `state.disabled`, `state.loading` | Unavailable/pending interactions | Explain reason, preserve readability |

**OPEN:** Actual light/dark themes; dark-mode commitment; brand colors; marketing vs operations styling; precise contrast/conformance version/target. Test selected candidate values against [NFR-ACCESSIBILITY-001..003](../01-product/non-functional-requirements.md) before approval.

### 4.2 Typography, spacing and surfaces — PROPOSED options

- Typography roles: `heading.page`, `heading.section`, `body.default`, `body.supporting`, `label.input`, `metric.value`, `tabular.money`; use semantic structure and readable numeric alignment. **Typeface and pixel sizes OPEN.**
- Candidate spacing rhythm for prototyping only: `4 / 8 / 12 / 16 / 24 / 32 / 48` arbitrary design units pending physical-device testing. **Not a canonical CSS/token implementation.**
- Candidate interactive states: default, hover (pointer surfaces), pressed, focus-visible, disabled, loading, selected, error, success. Native touch equivalents depend on final client selection.
- Candidate surfaces: page shell, sidebar/tab bar, panel, table row, card, modal/drawer, status banner, list filter, toast.
- **OPEN:** Corner radii, elevation/shadows, motion preferences, logo/assets, illustration system, exact spacing/pixel/touch-target minimums and supported breakpoints.

## 5. Core component inventory and required behavior

| Component contract | Required state/interaction design | Traceability |
| --- | --- | --- |
| Navigation / App shell | Current authorized context; active destination; skip-to-content/focus path for web; responsive navigation without exposing unauthorized links as security control | Screens §3–4, §14–15; user roles |
| Status chip + text | Text status, semantic type, optional context; do not use just red/green | Screens §5, §9–10, §16–17 |
| Primary / destructive button | Label, focus, disabled reason, progress handling, double-submit safety | Screens §6, §9–10, §18, §22 |
| Data field / select | Label, hint, input constraints, inline validation and announced error; never display credentials/tokens | Screens §14, §18, §21–22 |
| Search / filter + directory results | Debounced where helpful, authorized scoped search, clear empty state, pagination, keyboard navigation | Screens §16 |
| Queue item / table / card | Member/context, status, owner, next action, due time; filtered deep-link to canonical records | Screens §15, §19–20 |
| Confirmation / audit reason | Explicit subject/action/consequences, actor immutable, reason required when policy dictates, server response and audit reference | Screens §18, §22; user roles |
| QR scanner / permission fallback | Camera permission, active scanning, validating, invalid/expired/wrong-branch/duplicate/ineligible/network states, clear retry | Screens §6; JRN-002 |
| Membership card / summary | Plan, expiry, eligibility, freeze and renewal CTA only when supported; Member and Membership state must not be conflated | Screens §5, §8–9; ADR-0026 Proposed |
| Payment status panel | Paid/pending/failed/refunded/reversed from trusted server; pending verification after provider return, safe retry/help | Screens §10; JRN-009–012 |
| Progress indicator | Accessible label/description; no confetti/progress metric masquerading as eligibility | Screen §5; JRN-001 |
| Notification preference | Distinguish transactional/service from marketing, reflect persisted backend policy and consent | Screen §13; JRN-016 |
| Inline feedback / banner / empty state | Explain what happened, preserved changes, retry path and contact route; accessibility announcement | Screens §2, §23; NFR-UX-003 |

**Proposed component delivery order:** primitives (tokens, labels, fields, buttons, status) → Member home/QR and Staff search/queue → membership/renewal/payment → confirmations and audit-heavy screens. This is a documentation proposal, not a release plan.

## 6. Screen-specific composition guidelines

### 6.1 Member home, check-in and attendance

**REQUIRED:** Member home shows current membership status and accurate expiry, weekly goal, visible `Scan QR` action and contextual alerts. Prior check-in must not invite duplicate attendance. On permission denial offer an alternative/help path. On a valid scan, show **server-confirmed** gym/branch and local time; do not expose raw QR or session identifier. Failure labels distinguish invalid, expired, wrong-branch, duplicate, membership-inactive and offline states.

**PROPOSED layout:** one-column home with primary status/action near top, progress beneath and history in a lower-priority region. Mobile camera viewport should preserve a clear back/close and status instruction. Test on low-end devices; exact breakpoints OPEN.

### 6.2 Owner dashboard, front desk and no-show queue

**REQUIRED:** Owner sees prioritized overdue follow-up, new no-show cases, expiring renewals, payment exceptions, fulfillment and data quality. Each summary card links to the **correct filtered source records**. Front desk can search authorized members and perform **assisted check-in with mandatory reason**, actor attribution and eligibility validation.

**PROPOSED layout:** actionable queue on the first view, compact metrics after or alongside; wide screens use table with clear headers; narrow screens use cards preserving full action/assignment context. Filter ranges (e.g., 10–14 days) are examples, **not fixed policy**. Never show cross-branch records just because a filter or route is present.

### 6.3 Membership, renewal and payment

**REQUIRED:** Membership summary distinguishes Member administrative state from Membership entitlement; outstanding [ADR-0026](../adr/ADR-0026-member-membership-state-ownership.md) must not be pre-decided by UI labels. Renewal options show duration, payable total, terms and explicit selection. A redirect or callback does not justify `Paid` display until canonical confirmation. Pending/failed/reversed/refunded states need distinct words and contextual assistance; money-sensitive actions require confirmation and audit cues.

**PROPOSED layout:** comparison cards → exact payable summary → secure payment provider entry → server-verification outcome panel; never pre-select paid add-ons.

## 7. Accessibility, responsive behavior and failure states

| Area | Minimum traceable behavior | Proposed review method (not recorded PASS) |
| --- | --- | --- |
| Semantics and labels | Meaningful accessible names, headings, status announcements, input labels and errors; keyboard/focus behavior appropriate to platform | Keyboard-only navigation and screen-reader walkthrough for critical member and staff flows |
| Contrast and non-color cues | Text and non-text states remain recognizable without relying on hue alone | Review the actual paired foreground/background palette; run contrast checks once tokens chosen |
| Target/conformance policy | **Formal accessibility conformance target OPEN** under `NFR-ACCESSIBILITY-003` | Product/design owner selects documented target before broad release; do not claim WCAG compliance today |
| Mobile member workflow | Essential check-in/membership/payment on mobile-sized screen without repeated navigation | Real device/dim screen/rotation/zoom and low-end network checks |
| Staff responsive behavior | Authorized context, search, action and audit reason remain operable at narrow widths | Keyboard + responsive table/card tests at selected breakpoints |
| Loading/retry | Distinguish idempotent pending operation, saved but sync pending, validation reject, auth reject and network unknown | Disconnect/reconnect, duplicate tap, expired identity, stale state and denied-access scenarios |
| Reduced motion and focus | Essential meaning works without animation; visible focus and sensible reading order | Proposed preference-aware motion and focus test |
| Error privacy | No tenant/existence disclosure, raw token/QR/session leak, payment credential or verbose internal stack trace | Negative authorization cases with safe error copy |

**State contract:** every asynchronously mutating screen describes `idle → editing → submitting/validating → server-confirmed success OR recoverable rejection OR unknown/pending state`. In unknown/pending state, do **not** assume success or retry a financial/attendance mutation without idempotency and current-state lookup.

## 8. Design-to-code / QA review checklist

- [ ] Confirm the underlying screen and journey (link the exact requirement or section); do not invent new capabilities.
- [ ] Identify screen actor and `Self/Branch/Gym` scope and the trusted authorization check; UI visibility is not enforcement.
- [ ] Use approved brand/typography/token values only **after** a human design signoff; until then clearly tag sample visuals/tokens as Proposed.
- [ ] Check keyboard/touch flow, labels, focus, readable contrast, non-color status cues and responsive behavior.
- [ ] Capture empty, loading, validated success, field validation error, authorization denied, business-rule rejection, network retry and conflict states.
- [ ] Confirm client never determines final attendance, membership entitlement or payment success.
- [ ] Review irreversible/money-sensitive actions for explicit confirmation, safe retry and audit fields.
- [ ] Verify source links, screenshot/device QA evidence, accessible test results and any documented exceptions.
- [ ] Review with Product / Design / Staff/Gym operations, Security / Architecture for sensitive boundaries, then record approval reference. **No approval recorded yet.**

## 9. Open design decisions and accountability (not approvals)

| Decision | Current status | Suggested accountable reviewers / evidence |
| --- | --- | --- |
| Brand identity, logo, palette, primary typeface | **OPEN** | Product/Design + Gym owner; visual identity options and contrast samples |
| Token names/scale and component library strategy | **PROPOSED / OPEN** | Design + Frontend; prototypes and implementation constraints |
| Light/dark themes and motion policy | **OPEN** | Product/Design; user/device research |
| Accessibility conformance version/level | **OPEN** | Product/Accessibility/Security; documented chosen target and tested criteria |
| Responsive breakpoints, support matrix, touch target sizes | **OPEN** | Design/QA; actual supported browser/mobile/device evidence; `NFR-COMPATIBILITY-001` |
| Member web/PWA/native delivery; Owner/Staff web framework | **PROPOSED ADR-0013 / ADR-0012** | Authorized architecture decision owners; not decided in design document |
| User testing with real front-desk and members | **NOT RUN** | Product + pilot gym operations; tasks, success/error comprehension and evidence |
| Design-system final approval, rollout and Figma/library assets | **MISSING / NOT AUTHORIZED** | Human product/design decision and review before implementation |

## 10. Sources and relationship to future artifacts

- [Legacy screen behavior specs](../04-screen-specifications.md), [legacy user flows](../03-user-flows.md) — behavior inputs; structured canonical docs take precedence where available.
- [Product requirements](../01-product/product-requirements.md), [User roles](../01-product/user-roles.md), [User journeys](../01-product/user-journeys.md), [NFR accessibility and UX](../01-product/non-functional-requirements.md).
- [ADR-0012](../adr/ADR-0012-owner-staff-web-framework.md) and [ADR-0013](../adr/ADR-0013-member-client-strategy.md) — both **Proposed**.
- [ADR-0026](../adr/ADR-0026-member-membership-state-ownership.md) — **Proposed**.
- [Root design entry](../../DESIGN.md), [Docs index](../README.md), [Issue #4](https://github.com/im-tnyx/gym-pulse/issues/4).

**This document is a proposed design-system foundation only.** No application component, Figma file, UI token implementation, chosen color, provider, framework, permission, production data or launch conformance claim was created.
