# Task 0021: Draft Member Client Framework / Delivery ADR

## Goal

Draft one `Proposed` ADR for canonical architecture decision `D-ARCH-013`, selecting a safe, low-friction Phase 1 Member delivery direction while preserving a clean path to native delivery if later requirements or measured pilot evidence justify it.

Canonical target:

`docs/adr/ADR-0013-member-client-strategy.md`

This task is architecture/governance only. It creates no Member application or runtime implementation.

## Inputs Read

Fresh current-`main` structured inputs reviewed:

- `.ai/README.md`
- `.ai/current-state.md`
- `.ai/task/0020-draft-owner-staff-web-framework-adr.md`
- `docs/README.md`
- `docs/00-overview/assumptions.md`
- `docs/01-product/functional-requirements.md`
- `docs/01-product/non-functional-requirements.md`
- `docs/01-product/personas.md`
- `docs/01-product/user-roles.md`
- `docs/01-product/user-journeys.md`
- `docs/02-architecture/architecture-principles.md`
- `docs/02-architecture/architecture-overview.md`
- `docs/02-architecture/system-context.md`
- `docs/02-architecture/container-architecture.md`
- `docs/02-architecture/component-architecture.md`
- `docs/02-architecture/data-flow.md`
- `docs/02-architecture/technology-stack.md`
- `docs/adr/README.md`
- `docs/adr/ADR-0007-authentication-session-architecture.md`
- `docs/adr/ADR-0008-member-authentication-method.md`
- `docs/adr/ADR-0009-authorization-implementation.md`
- `docs/adr/ADR-0010-data-layer-tenant-isolation-rls.md`
- `docs/adr/ADR-0011-api-contract-architecture.md`
- `docs/adr/ADR-0012-owner-staff-web-framework.md`

Legacy evidence reviewed without treating it as canonical:

- `docs/03-user-flows.md`
- `docs/04-screen-specifications.md`
- `docs/05-system-architecture.md`
- `docs/07-api-contracts.md`
- `docs/15-engineering-workflow.md`
- `docs/16-open-decisions.md`

Current official external research was limited to decision-relevant web/PWA, Expo/React Native, Apple, and Android platform capabilities.

## Repository State Verified

Before ADR-0013 creation:

- `docs/adr/ADR-0013-member-client-strategy.md` did not exist.
- `.ai/task/0021-draft-member-client-strategy-adr.md` did not exist.
- current `.ai/current-state.md`, `docs/README.md`, and `docs/adr/README.md` identified Task 0021 / `D-ARCH-013` as the next bounded ADR item.
- `D-ARCH-013` remained `P1 PROPOSED` in `docs/00-overview/assumptions.md`.
- repository search found no explicit approval evidence promoting `D-ARCH-013` to `DECIDED`.
- no decision ADR was `Accepted`.
- no newer canonical Member requirement promoted native delivery, native push, background client execution, or offline-first Member workflows into Phase 1.
- `D-PROD-001` still defines Phase 1 as an operations/retention MVP rather than a generic fitness super-app.
- `D-PROD-002` still proposes intentionally minimal Member repeated actions centered on check-in and renewal.
- direct browser/mobile canonical database access remained unapproved.
- `D-ARCH-004`, `D-SEC-002`, `D-SEC-004`, `D-ARCH-006`, payment/messaging/push/observability provider choices remained separately governed.

## Canonical Decision State

```text
D-ARCH-013
Priority: P1
Status: PROPOSED
Decision: Member client delivery/framework strategy
Current direction: responsive web/PWA vs Expo/React Native must follow validated delivery needs; Expo/RN is not accepted
```

ADR-0013 is drafted as `Proposed`. Task 0021 does not change `D-ARCH-013` to `DECIDED`.

## Member Journeys Evaluated

Primary journeys:

- `JRN-001` Member Entry and Home.
- `JRN-002` QR Check-in.
- `JRN-009` Member Renewal Purchase.
- `JRN-010` Verified Payment Applies Renewal.
- `JRN-011` Failed Payment Recovery.
- `JRN-013` Add-on Purchase and Fulfillment.
- `JRN-016` Communication Preference Change.

These journeys are link/session/API oriented and do not currently require continuous background execution, broad offline business state, wearable access, or a rich native fitness runtime.

## Phase 1 Client Requirements

The active Member client must support:

```text
open
verify identity
membership state + exact expiry
attendance/history + weekly progress
QR check-in
renewal options
payment checkout
canonical payment status
receipt
relevant add-on state
communication preferences
```

It must preserve:

```text
Client State != Canonical Business Truth
QR token != Member identity
QR scan != Attendance truth
Payment return != Payment proof
Notification delivery != Business success
```

## Delivery Options Evaluated

1. Responsive Browser-First Web.
2. Responsive Web + progressive PWA capabilities.
3. Expo / React Native native client.
4. Credible hybrid native wrapper category.

The evaluation covered:

- Phase 1 journey fit,
- install/onboarding friction,
- QR/camera,
- authentication/session security,
- hosted payment/return behavior,
- deep links,
- push,
- offline usefulness,
- device APIs,
- low-end Android,
- iPhone/Safari,
- accessibility,
- release speed,
- app-store dependency,
- operations/support,
- observability,
- security surface,
- testing complexity,
- ADR-0011 compatibility,
- provider independence,
- future native evolution,
- reversibility,
- Phase 1 cost/complexity.

## QR Entry Models Evaluated

### A. Browser/PWA camera scanner

```text
open GymPulse
-> request camera permission
-> obtain video stream
-> decode QR
-> submit opaque token
-> server verifies canonical result
```

Browser camera access is technically viable, but QR-decoder compatibility and target-device behavior require evidence.

### B. OS Camera -> HTTPS link

```text
phone camera
-> HTTPS GymPulse link
-> browser
-> verify/restore Member identity
-> submit opaque QR/session input
-> server verification
-> canonical check-in result
```

This materially reduces the need for in-app camera permission and QR-decoder code.

### C. Native in-app scanner

Native camera/barcode APIs offer stronger device integration, but the benefit must justify mandatory install plus app-store/native operations.

Current proposed QR order:

```text
OS Camera -> HTTPS baseline
browser in-app scanner after target-device validation
native scanner only after native escalation evidence
```

## Current Web/PWA Research

Research date: `2026-09-22`.

Authoritative material reviewed:

- MDN `MediaDevices.getUserMedia()`.
- MDN Barcode Detection API.
- MDN PWA installability and Web App Manifest.
- MDN Service Worker API.
- MDN Push API.
- WebKit Web Push for Home Screen web apps on iOS/iPadOS.

Material findings:

- `getUserMedia()` is broadly available but requires HTTPS/secure context and user camera permission.
- camera facing-mode constraints exist, but real mobile-device behavior still requires testing.
- the browser-native Barcode Detection API remains limited/experimental and cannot be assumed as the sole cross-browser production QR decoder.
- PWA installability is manifest-driven on supporting browsers.
- a service worker is not inherently required merely to provide every installability scenario and should be justified separately.
- service workers can intercept/cache requests and therefore create update/private-cache risk.
- web push requires service-worker/permission machinery.
- iOS/iPadOS supports Web Push for Home Screen web apps, making installation a meaningful platform condition for that channel.

No QR/camera library, manifest, service worker, or push integration was created.

## Current Native/Expo Research

Research date: `2026-09-22`.

Official material reviewed:

- Expo Camera.
- Expo linking / Universal Links / Android App Links.
- Expo notifications/push setup.
- Expo SecureStore documentation as storage-category evidence.
- Expo EAS Build/store distribution documentation.
- Expo EAS Update/runtime-version documentation.
- React Native Linking.
- React Native security guidance.
- Apple Universal Links / associated domains.
- Android App Links / verification documentation.

Material findings:

- Expo exposes native camera preview and barcode scanning.
- native verified HTTPS linking requires Apple/Android app-to-domain association.
- incoming links remain untrusted and must be validated.
- native push requires platform permission and credentials/configuration.
- OS-protected secure storage categories exist for reusable native credentials.
- public native distribution adds developer accounts, signing, store release/review, versioning, and device support.
- OTA updates can update compatible non-native layers but do not remove binary/runtime compatibility constraints when native code changes.

No native project, SecureStore implementation, push setup, deep-link configuration, EAS config, signing, or store metadata was created.

## Target-Device Findings

Current platform capability is sufficient to justify a browser-first validation path, but not sufficient to waive real-device evidence.

Acceptance still requires at least:

- current Android Chrome,
- representative older/low-end Android,
- current iPhone Safari,
- installed PWA mode if proposed,
- slow/unstable network,
- camera permission granted/denied/unavailable,
- OS-camera HTTPS QR entry,
- browser scanner if proposed.

No exact supported browser/OS minimum was invented.

## Evaluation Summary

Strongest current Phase 1 fit:

```text
responsive HTTPS Member Web
+
standard HTTPS link entry
+
OS-camera HTTPS QR baseline
+
ADR-0011 JSON HTTP contract
+
server-owned Member-self authorization
+
hosted payment/navigation compatibility
+
optional progressive PWA installability
+
no offline canonical business truth
+
no mandatory push
```

PWA capabilities are individually justified rather than bundled.

Expo / React Native remains the leading native evolution category, but native delivery is not currently justified strongly enough to impose mandatory installation and store/native operations on the narrow Phase 1 Member journeys.

Hybrid wrapping was evaluated as credible but not preferred because it adds native lifecycle cost while retaining web/WebView/bridge complexity.

## Proposed Direction

ADR-0013 proposes:

```text
Responsive browser-first Member web as Phase 1 baseline

PWA capabilities:
  progressive and optional
  manifest/installability only when useful
  service worker only for a concrete requirement
  no broad authenticated-data caching baseline
  web push only if separately justified

QR:
  OS Camera -> HTTPS link baseline
  browser scanner after target-device validation
  native scanner only after escalation evidence

Future native:
  Expo / React Native remains candidate
  same ADR-0011 API
  same Principal / Member-self authorization
  same canonical domain rules
```

This is a proposal only.

## Installation / Onboarding Posture

Baseline Member path:

```text
scan/tap HTTPS link
-> browser
-> verify or restore session
-> use
```

Native path adds:

```text
find/store listing
-> install
-> launch
-> permissions
-> verify
-> use
```

For check-in plus occasional renewal, native must prove material value before this extra friction becomes mandatory.

## Authentication / Session Relationship

Preserved status:

```text
D-ARCH-004 OPEN
ADR-0007 Proposed
D-SEC-002 OPEN
ADR-0008 Proposed
D-SEC-004 OPEN
```

Architecture remains:

```text
Authentication Evidence
-> AuthIdentity
-> GymPulse Principal
-> explicit Member-self relationship
-> authorization
```

Browser/PWA remains compatible with the current first-party server-mediated secure-cookie direction using `HttpOnly` where compatible, `Secure`, topology-appropriate `SameSite`, explicit CSRF protection, logout/revocation, and fixation/rotation controls.

Long-lived reusable browser bearer credentials in `localStorage` are not the baseline.

Native, if later accepted, may use short-lived access evidence plus stronger refresh/re-authentication credentials in OS-protected storage. No token format, TTL, provider SDK, or storage package is selected.

## API / Authorization Relationship

All Member clients remain:

```text
Member Client
-> ADR-0011 JSON HTTP
-> Trusted GymPulse Runtime
```

No native-specific backend and no direct database access is approved.

Every protected Member operation remains:

```text
verified Principal
+
explicit Member-self relationship
+
current authorization/resource relationship
-> allow / deny
```

Member ID, phone number, cached ID, provider identity, route state, or hidden UI never establishes authority.

## QR / Camera Posture

```text
QR token != Member identity
QR scan != Attendance truth
```

Server remains authoritative for identity, QR/session validity, expiry, branch, membership eligibility, duplicate policy, and idempotency.

Browser camera is an optional acquisition mechanism, not the attendance security boundary.

## Payment Return Posture

Hosted checkout/browser/app handoff is delivery behavior only.

A return URL, custom scheme, Universal Link, App Link, or query string may navigate to a processing/status screen.

It never proves payment.

```text
return/deep link
-> refresh canonical Payment
-> render Pending/Paid/Failed/etc.
```

Tampered `success=true` / `paid=true` input must have no financial authority.

## Offline Posture

No offline-first Phase 1 architecture is proposed.

Rejected ordinary pattern:

```text
scan offline
-> store canonical attendance locally
-> sync later
```

Safe low-risk offline behavior may include shell/static assets, connection status, retry guidance, and carefully reviewed non-authoritative last-known presentation.

No cached/local state may authorize attendance, membership, payment, renewal, entitlement, or Member access.

## Push / Notification Posture

Push is optional and separately governed.

`D-PROVIDER-002` messaging and `D-PROVIDER-004` push remain open.

Web push, native push, WhatsApp, SMS, email, and in-app refresh may coexist as channels later.

```text
notification delivered
!= canonical business state
```

No push provider was selected.

## Deep-Link Posture

Prefer standard HTTPS links where sufficient.

Future native delivery may use verified Universal Links / Android App Links so the same HTTPS URL can open native when installed and web otherwise.

Custom URI schemes are secondary and weaker for general public links.

All link parameters are untrusted.

Potential link use cases:

- QR check-in,
- renewal reminder,
- payment return,
- account claim/recovery.

No deep-link configuration was created.

## Security Findings

Threats explicitly addressed:

- XSS,
- CSRF,
- stolen browser session,
- native token theft,
- insecure local storage,
- service-worker/private-cache leakage,
- Member ID substitution,
- cross-tenant link manipulation,
- QR replay/leakage,
- malicious deep links,
- payment-return spoofing,
- push-token misuse,
- outdated native clients,
- stale PWA assets,
- dependency/supply-chain risk,
- rooted/jailbroken-device limitations.

Reusable secrets must not be stored in ordinary `localStorage`, unprotected `AsyncStorage`, generic cache storage, logs, analytics, or URLs.

Server authorization and canonical state remain the primary trust controls for compromised/untrusted clients.

## Accessibility Findings

Neither web nor native is accessible by default.

Required validation includes:

- screen-reader semantics,
- text scaling/zoom,
- touch targets,
- contrast,
- clear validation and blocked-state errors,
- loading/retry states,
- camera permission explanation/fallback,
- non-camera operational fallback where policy permits.

Authorized assisted check-in remains a legitimate operational fallback where current policy allows it.

## Performance Findings

Measure rather than invent thresholds.

Representative flows:

- cold open,
- returning authenticated open,
- Member Home,
- QR entry,
- check-in completion,
- renewal options,
- checkout launch,
- payment return,
- poor-network retry.

The browser-first recommendation remains conditional on real low-end Android and iPhone/Safari results.

## Operational / Release Findings

Web/PWA:

- one centrally deployed client,
- link-based onboarding,
- no mandatory store approval,
- rapid release,
- browser compatibility responsibility,
- service-worker update risk only if introduced.

Native:

- Apple/Google developer accounts,
- signing/certificates/provisioning/keystore,
- App Store / Play lifecycle,
- store review and privacy metadata,
- release tracks/beta distribution,
- binary/app versions,
- minimum OS support,
- crash support,
- old installed clients,
- urgent security-release process.

Expo may reduce engineering work but does not remove these platform operations.

## Native Escalation Triggers

Revisit native when evidence shows:

1. target-device browser QR/camera fails acceptance,
2. native push becomes business-critical,
3. background client execution becomes an approved requirement,
4. meaningful offline workflows become approved,
5. required device APIs are unreliable on web,
6. app-store distribution becomes a business requirement,
7. browser payment/auth UX is materially unacceptable,
8. later workout/progress/health scope becomes active and materially benefits from native APIs,
9. measured adoption/retention/support/reliability evidence favors native.

Triggers reopen governance; they do not automatically accept Expo/React Native.

## Decisions Kept Separate

Task 0021 does not decide or accept:

```text
D-ARCH-003 API contract acceptance
D-ARCH-004 authentication/session
D-SEC-002 Member authentication method
D-SEC-004 session lifecycle/device policy
D-ARCH-015 authorization acceptance
D-SEC-008 data-layer isolation/RLS
D-ARCH-012 Owner/Staff web framework acceptance
D-ARCH-016 language/runtime acceptance
D-ARCH-001 repository strategy acceptance
D-ARCH-006 API deployment topology
D-ARCH-009 hosting
D-ARCH-018 testing toolchain
D-PROVIDER-001 payment provider
D-PROVIDER-002 messaging provider
D-PROVIDER-004 push provider
D-PROVIDER-006 observability provider
```

It also does not select a QR library, service worker strategy, native secure-storage library, native token format, deep-link library, WebView, UI library, client state/query library, or minimum browser/OS versions.

## Requirement IDs Referenced

Verified current canonical IDs include:

```text
FR-IDENTITY-003
FR-AUTHZ-001
FR-AUTHZ-003
FR-ATTENDANCE-001..009
FR-MOTIVATION-001
FR-RENEWAL-001..007
FR-PAYMENT-001..009
FR-RECEIPT-001..002
FR-ADDON-001..008
FR-NOTIFICATION-001..004
FR-CONSENT-001..002
FR-CROSS-001..004

NFR-SECURITY-001..005
NFR-SECURITY-007..011
NFR-PRIVACY-001..004
NFR-RELIABILITY-001..002
NFR-RELIABILITY-005..008
NFR-AVAILABILITY-001..003
NFR-PERFORMANCE-001
NFR-PERFORMANCE-005..006
NFR-SCALABILITY-003..005
NFR-OBSERVABILITY-001..007
NFR-MAINTAINABILITY-001..003
NFR-MAINTAINABILITY-005..006
NFR-TESTABILITY-001..005
NFR-UX-001
NFR-UX-003
NFR-ACCESSIBILITY-001..003
NFR-COMPATIBILITY-001..002
```

No requirement ID was invented.

## Validation Required

Before acceptance, require at least:

1. HTTPS link opens Member experience.
2. First identity verification.
3. Returning Member.
4. Revoked/expired session.
5. Logout.
6. OS camera -> HTTPS QR flow.
7. Browser/PWA scanner if proposed.
8. Camera permission granted.
9. Camera permission denied.
10. Camera unavailable.
11. Valid QR.
12. Expired QR.
13. Wrong-branch QR.
14. Replayed QR.
15. Duplicate/retried check-in.
16. Timeout after server-successful check-in.
17. Poor network.
18. Current Android Chrome.
19. Representative low-end Android.
20. Current iPhone Safari.
21. Browser-only use without installation.
22. Installed PWA behavior if applicable.
23. Member A logout -> Member B same-device isolation.
24. Stale/offline cache after session revocation.
25. Renewal options.
26. Checkout launch.
27. Payment failure/cancel.
28. Client-visible checkout success while canonical state is Pending.
29. Eventual verified Paid state.
30. Browser/app restart during payment.
31. Tampered return/deep link.
32. Member ID substitution.
33. Cross-tenant link manipulation.
34. Sensitive local-storage/cache review.
35. Screen-reader/text-scale/touch-target review.
36. Request/error correlation.
37. Supported-client compatibility evidence.
38. PWA update rollout if service worker used.
39. Native secure-storage/revocation spike if native remains candidate.
40. Native release/store operations spike if native remains candidate.

No validation tests were implemented by Task 0021.

## Files Changed

Created:

```text
docs/adr/ADR-0013-member-client-strategy.md
.ai/task/0021-draft-member-client-strategy-adr.md
```

Governance continuity updates:

```text
docs/adr/README.md
docs/README.md
.ai/current-state.md
```

## Open Questions

Still open:

- exact supported browser/OS matrix,
- exact QR URL/token encoding/lifetime,
- whether browser in-app scanning materially improves the OS-camera HTTPS path,
- whether installability is valuable for pilot Members,
- whether any service worker is needed,
- whether web/native push becomes required,
- eventual payment-provider redirect/app-handoff behavior,
- exact auth/session provider and session policy,
- exact accessibility target,
- future app-store distribution requirement,
- future offline/background/device-feature requirements.

## Result

Task 0021 produces a review-ready Member delivery proposal:

```text
Responsive browser-first Member web
  as Phase 1 baseline

PWA
  progressive/optional, not automatically offline-first

QR
  OS Camera -> HTTPS baseline

Expo / React Native
  future evidence-triggered native path, not accepted

ADR-0011
  remains the shared client/server boundary
```

ADR-0013 remains `Proposed`; canonical `D-ARCH-013` remains `PROPOSED`.

Explicitly not created/selected:

```text
No Member client implementation
No PWA implementation
No native app
No Expo/React Native acceptance
No hybrid wrapper implementation
No manifest
No service worker
No camera/QR package
No QR scanner implementation
No Auth provider
No authentication SDK integration
No phone OTP acceptance
No API client implementation
No native secure-storage implementation
No push provider/integration
No payment provider/integration
No deep-link/universal-link/app-link configuration
No WebView
No direct database access
No API deployment topology selection
No native build/signing/store configuration
No tests
No CI
No production config
No prior ADR accepted
No D-ARCH-013 promotion to DECIDED
```

## Next Recommended Task

After governance synchronization, fresh-read:

- `docs/adr/README.md`
- `docs/00-overview/assumptions.md`
- `.ai/current-state.md`

and record the actual next bounded task from the repository.

The pre-task queue suggested `D-ARCH-006` API Deployment Boundary, likely Task 0022 / `docs/adr/ADR-0014-api-deployment-boundary.md`, but Task 0021 must not assume that until post-update state is verified.

Do not execute the next task as part of Task 0021.
