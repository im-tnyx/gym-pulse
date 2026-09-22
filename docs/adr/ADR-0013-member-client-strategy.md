# ADR-0013: Member Client Framework and Delivery Strategy

## Status

`Proposed`

## Decision Metadata

- ADR: `ADR-0013`
- Primary Decision ID: `D-ARCH-013`
- Related Decision IDs: `D-ARCH-003`, `D-ARCH-004`, `D-SEC-002`, `D-SEC-004`, `D-ARCH-015`, `D-SEC-008`, `D-ARCH-012`, `D-ARCH-016`, `D-ARCH-001`, `D-ARCH-006`, `D-ARCH-009`, `D-ARCH-018`, `D-PROVIDER-001`, `D-PROVIDER-002`, `D-PROVIDER-004`, `D-PROVIDER-006`
- Decision Owner: `Open`
- Technical Owner: `Architecture / Client / Mobile / Security`
- Date Proposed: `2026-09-22`
- Date Accepted: `Not accepted`
- Supersedes: `None`
- Superseded By: `None`

## 1. Context

GymPulse Phase 1 is an operations/retention MVP, not a fitness super-app. The canonical decision register already states that Member repeated actions should remain intentionally narrow, centered on check-in and renewal.

The active Member experience is therefore focused on:

```text
open GymPulse
-> verify identity
-> view membership state
-> view exact expiry
-> view attendance / weekly progress
-> check in
-> renew
-> view canonical payment state
-> view receipt
-> view relevant purchased/add-on state
-> manage supported communication preferences
```

Future capabilities such as workout programming, nutrition tracking, AI coaching, wearables, rich fitness tracking, community, continuous background sensing, and advanced offline workouts remain outside the active Phase 1 scope unless separately promoted through canonical product requirements.

The decision question is:

> What Member-client delivery architecture gives GymPulse the safest, lowest-friction Phase 1 experience while preserving a clean path to native delivery if real product requirements later justify it?

This is broader than a simple PWA-versus-React-Native choice. It must compare:

- responsive browser-first web,
- progressively enhanced PWA behavior,
- Expo / React Native native delivery,
- a credible hybrid native-wrapper category,
- and future coexistence of web and native clients against one stable GymPulse backend contract.

The Member Client remains untrusted for canonical business truth. Delivery technology does not change the core boundary:

```text
Member Client
  -> ADR-0011 JSON HTTP Contract
  -> Trusted GymPulse Runtime
  -> Application Authorization
  -> Application / Domain Rules
  -> Canonical Persistence
```

The client does not become authoritative for attendance, membership eligibility, payment success, renewal entitlement, tenant/resource scope, or Member-self authorization.

`D-ARCH-013` is currently `P1 PROPOSED`. The current technology evaluation suggests responsive web/PWA first if target-device camera, authentication, payment, performance, accessibility, and security validation succeeds. Expo / React Native remains a candidate native evolution path. This ADR independently evaluates that hypothesis and does not change the canonical decision to `DECIDED`.

## 2. Requirements and Decision Drivers

### 2.1 Functional requirements

Primary Member identity and authorization drivers:

- `FR-IDENTITY-003`: Member access to protected self-service requires verified identity; a raw mobile number is not authorization proof.
- `FR-AUTHZ-001`: every protected operation must be authorized against applicable tenant/gym/branch scope.
- `FR-AUTHZ-003`: a Member must not access another Member's protected records.
- `FR-CROSS-001`: clients are not trusted to determine final authorization, attendance eligibility, payment success, or membership entitlement.
- `FR-CROSS-002`: critical mutations must be replay-safe.
- `FR-CROSS-003`: tenant/gym/branch context remains explicit where relevant.
- `FR-CROSS-004`: gym-local business time remains server-correct.

Primary Member attendance drivers:

- `FR-ATTENDANCE-001`: QR input must use a time-constrained/server-verifiable token or equivalent, not an indefinitely reusable public identifier.
- `FR-ATTENDANCE-002`: check-in validates token/session integrity, expiry, branch, verified Member identity, membership eligibility, and duplicate policy.
- `FR-ATTENDANCE-003`: successful check-in creates exactly one canonical attendance record and returns server-confirmed success.
- `FR-ATTENDANCE-005`: duplicate attendance policy is enforced.
- `FR-ATTENDANCE-006`: retrying the same logical successful check-in must not create another attendance effect.
- `FR-ATTENDANCE-009`: Members can view their own valid attendance history.
- `FR-MOTIVATION-001`: Phase 1 supports a weekly visit target or equivalent fair goal model.

Renewal, payment, receipt, add-on, and preference drivers:

- `FR-RENEWAL-001..007`.
- `FR-PAYMENT-001..009`.
- `FR-RECEIPT-001..002`.
- `FR-ADDON-001..008`.
- `FR-NOTIFICATION-001..004`.
- `FR-CONSENT-001..002`.

Important payment invariant:

```text
client/provider-facing success
!=
canonical Payment success
```

Canonical online payment success remains based on verified provider evidence.

### 2.2 Non-functional requirements

Security/privacy:

- `NFR-SECURITY-001..005`, `NFR-SECURITY-007..011`.
- `NFR-PRIVACY-001..004`.

Reliability/availability:

- `NFR-RELIABILITY-001..002`, `NFR-RELIABILITY-005..008`.
- `NFR-AVAILABILITY-001..003`.

Performance/mobile behavior:

- `NFR-PERFORMANCE-001`: Member check-in should feel immediate under normal conditions; hard SLO remains unapproved.
- `NFR-PERFORMANCE-005`: external-provider latency should not hold correctness-sensitive transactions open.
- `NFR-PERFORMANCE-006`: Member-facing APIs should return bounded purpose-specific DTOs.
- `NFR-UX-001`: Member flows must be usable on mobile-sized screens with minimal repeated interaction.
- `NFR-UX-003`: critical flows define loading, success, validation, authorization, business rejection, and retry states.

Accessibility/compatibility:

- `NFR-ACCESSIBILITY-001..003`.
- `NFR-COMPATIBILITY-001..002`.

Maintainability/testability/observability:

- `NFR-MAINTAINABILITY-001..003`, `NFR-MAINTAINABILITY-005..006`.
- `NFR-TESTABILITY-001..005`.
- `NFR-OBSERVABILITY-001..007`.
- `NFR-SCALABILITY-003..005`.

### 2.3 Product drivers

The Member persona needs low-friction access at moments where speed matters, especially gym arrival, membership checks, renewal, and payment status. Phase 1 does not require a high-engagement daily native fitness platform.

Installation friction is therefore a first-class architecture criterion:

```text
link / QR
-> browser
-> verify or restore session
-> use
```

must be compared against:

```text
find store listing
-> install binary
-> launch
-> permissions
-> verify
-> use
```

For a Member who primarily checks in and occasionally renews, native installation must demonstrate material additional value rather than being assumed because the product is mobile-first.

## 3. Constraints and Assumptions

1. `D-ARCH-013` remains `P1 PROPOSED`; this ADR is `Proposed` and does not make it `DECIDED`.
2. `D-ARCH-003` remains `PROPOSED`; ADR-0011 remains the primary client/server contract proposal.
3. `D-ARCH-004` remains `OPEN`; authentication/session provider and final session implementation are not selected.
4. `D-SEC-002` remains `OPEN`; ADR-0008's managed phone OTP/passwordless proposal is not accepted by this ADR.
5. `D-SEC-004` remains `OPEN`; exact session/token lifetime, inactivity, device, remember-me, and revocation policy remain unresolved.
6. `D-ARCH-015` remains `PROPOSED`; authorization stays server-owned.
7. `D-SEC-008` remains `OPEN`; this ADR does not approve RLS or direct-client database access.
8. `D-ARCH-012` remains `PROPOSED`; the Owner/Staff framework decision does not force the Member client framework.
9. `D-ARCH-016` remains `PROPOSED`; strict TypeScript/Node.js remains unaccepted.
10. `D-ARCH-001` remains `PROPOSED`; repository layout is separately governed.
11. `D-ARCH-006` remains `OPEN`; Member delivery must work whether the trusted API is co-hosted or independently deployed.
12. `D-ARCH-009` remains `OPEN`; no web/native hosting or distribution provider is selected.
13. `D-ARCH-018` remains `PROPOSED`; this ADR defines validation categories, not test tooling.
14. `D-PROVIDER-001`, `D-PROVIDER-002`, `D-PROVIDER-004`, and `D-PROVIDER-006` remain separately governed.
15. Both browser and native clients are untrusted.
16. Direct browser/mobile canonical database access remains unapproved.
17. Client-local state may improve presentation but never establishes authorization, attendance, payment, membership, renewal, or entitlement truth.
18. Phase 1 has no approved offline-first canonical workflow.
19. Phase 1 has no accepted requirement making native push mandatory.
20. Phase 1 has no accepted requirement for continuous background sensing or background client execution.
21. A PWA is a progressive enhancement category, not a requirement to add every PWA capability.
22. A responsive Member web experience must remain usable without installation.
23. Future web and native Member clients must be able to coexist against the same API, Principal model, Member-self authorization, and business rules.
24. Supported browser/mobile OS minimum versions remain open under `NFR-COMPATIBILITY-001`.

## 4. Member Journey and Delivery Model

The delivery strategy is evaluated against the canonical Member journeys.

### JRN-001 Member Entry and Home

The Member opens GymPulse, verifies identity when required, then sees membership state, exact expiry, weekly progress, check-in, renewal, and purchased/add-on state.

Delivery implication:

- direct HTTPS entry is valuable,
- returning-session restoration should be low-friction,
- no installation should be required for the first successful use,
- stale local state must refresh from canonical server state.

### JRN-002 QR Check-in

The Member submits an opaque QR/session token. Server-side logic verifies QR/session validity, branch, Member identity, membership eligibility, duplicate policy, and idempotency before creating one attendance effect.

Delivery implication:

- native camera access is not itself the business requirement,
- the requirement is a reliable way to obtain/submit the opaque QR input,
- OS-camera HTTPS entry may avoid in-app camera permission entirely,
- browser scanner or native scanner can be enhancements if measured value justifies them.

### JRN-009 Member Renewal Purchase

The client displays current expiry, eligible plans, commercial terms, creates a renewal order/payment, launches provider checkout, and treats client-facing provider success only as a transition to processing until canonical verification arrives.

Delivery implication:

- hosted browser checkout is naturally compatible with browser-first delivery,
- native delivery adds app-return/link handling but does not change financial truth.

### JRN-010 Verified Payment Applies Renewal

Verified provider evidence drives canonical Payment state and exactly-once renewal effect.

Delivery implication:

- Member client receives refreshed canonical state,
- notification, redirect, return URL, or app link is never proof of payment.

### JRN-011 Failed Payment Recovery

The Member sees a safe failed state and a retry/help path.

Delivery implication:

- browser/native should survive cancellation, provider app switching, network interruption, and restart without inventing success.

### JRN-013 Add-on Purchase and Fulfillment

The client shows transparent add-on terms, creates an order/payment, waits for verified success, then shows canonical fulfillment/usage state.

Delivery implication:

- same payment and idempotency constraints as renewal,
- no native-specific entitlement path is needed.

### JRN-016 Communication Preference Change

The client changes supported preferences, which are persisted and consulted by later notification workflows.

Delivery implication:

- push registration, if ever added, remains separate from service/marketing consent semantics,
- notification capability does not become canonical business truth.

## 5. QR / Camera Entry Model

QR attendance must be decomposed into input acquisition and server-side check-in truth.

### 5.1 Model A: browser/PWA in-app camera scanner

```text
Member opens GymPulse
  -> taps Scan
  -> browser requests camera permission
  -> client obtains camera stream
  -> client decodes QR token
  -> client submits opaque token
  -> server verifies and records canonical result
```

Current web-platform evidence confirms `MediaDevices.getUserMedia()` is broadly available, requires a secure context, and requires user permission. Mobile-facing camera constraints are available, but actual target-device behavior still requires real-device validation.

Important limitation: the native web `BarcodeDetector` API is still limited/experimental and not Baseline across widely used browsers. A production browser QR scanner therefore cannot assume one universally supported built-in QR decoder. This ADR does not select or install a QR decoding package.

Benefits:

- no app-store installation,
- in-product guided scanning UX,
- can use the same responsive web application,
- can offer explicit permission-denied fallback.

Costs/risks:

- camera permission friction,
- browser/device variation,
- decoder compatibility/performance,
- low-end device performance,
- iPhone/Safari behavior must be tested,
- more client code than OS-camera URL entry.

### 5.2 Model B: OS Camera -> HTTPS GymPulse link

```text
Member opens phone camera
  -> scans gym QR
  -> OS opens HTTPS GymPulse URL
  -> browser opens Member experience
  -> restore/verify identity if required
  -> client submits opaque QR/session input
  -> server verifies current QR/session + Member + branch + eligibility + duplicate/idempotency rules
  -> canonical attendance result
```

This model is the lowest-friction baseline candidate because it can avoid:

- app installation,
- in-app camera permissions,
- browser camera integration,
- browser QR-decoder dependency.

The QR URL/token remains untrusted input. It must not contain authoritative Member identity or attendance truth.

Security constraints:

```text
QR token != Member identity
QR scan != attendance truth
URL query/path != authorization
```

The server still verifies:

- Member identity,
- explicit Member-self authorization,
- QR/session integrity,
- expiry,
- branch,
- current membership eligibility,
- duplicate policy,
- idempotency.

### 5.3 Model C: native in-app scanner

A native Expo/React Native client can use native camera/barcode capabilities and may provide more consistent scanner control, permission UX, torch/lens handling, and device integration.

That is a real benefit, but Phase 1 must prove that this benefit outweighs:

- mandatory installation,
- app-store lifecycle,
- signing/release operations,
- native credential transport,
- two-platform testing,
- old installed client versions,
- higher support burden.

Native scanning therefore remains an escalation path, not a Phase 1 prerequisite.

### 5.4 QR posture

Proposed order of preference:

```text
1. OS Camera -> HTTPS GymPulse link as the baseline entry model
2. Browser/PWA in-app scanner only after real target-device validation proves value/reliability
3. Native in-app scanner only if native escalation triggers are met
```

Authorized assisted attendance remains the operational fallback where product policy permits it; client camera failure must not pressure the architecture into bypassing server eligibility/audit rules.

## 6. Options Considered

### Option A: Responsive Browser-First Web

Characteristics:

- HTTPS link entry,
- no installation requirement,
- responsive Member UI,
- browser session/auth transport,
- ADR-0011 JSON HTTP consumption,
- OS-camera HTTPS QR entry,
- optional browser camera scanner after validation,
- hosted payment/redirect compatibility.

Strengths:

- lowest onboarding and installation friction,
- one centrally deployed client,
- rapid release without app-store review,
- standard HTTPS links naturally support QR, reminders, recovery, and payment return navigation,
- compatible with current secure-cookie browser-session direction,
- preserves future native path through stable API/identity boundaries.

Tradeoffs:

- camera/scanner behavior varies by browser/device and needs target-device testing,
- iOS/Android web platform behavior must be continuously validated,
- browser push/offline/device APIs are not as uniformly capable as native,
- browser support matrix becomes an explicit operational responsibility.

### Option B: Responsive Web + Progressive PWA

Use the same responsive web application and progressively add only justified PWA capabilities.

Possible enhancements:

- web app manifest,
- optional home-screen installation,
- standalone display,
- service worker only for a documented need,
- carefully bounded asset caching,
- web push only if later requirements justify it.

A PWA does not imply offline-first architecture.

Current platform research supports installability through a manifest on supporting browsers. Service workers are not universally required merely to have installability and should not be introduced only to attach the PWA label.

Strengths:

- retains link-first onboarding,
- optional app-like launcher presence,
- can later add web push where platform/user-install conditions fit,
- can reuse the same responsive web code and API contract.

Tradeoffs:

- service workers add update/cache/security complexity,
- authenticated/private response caching can create Member A -> Member B leakage risk on shared devices,
- stale PWA assets can create compatibility issues,
- iOS Web Push requires a Home Screen web app and user permission/interaction,
- platform install UX varies.

### Option C: Expo / React Native native client

Use a native Android/iOS application, with Expo/React Native as the current candidate category.

Decision-relevant capabilities verified in current official documentation include:

- camera preview and barcode scanning,
- platform permission handling,
- native secure-storage primitives/categories,
- standard HTTPS Universal Links / Android App Links,
- native notifications,
- app-store builds/signing,
- over-the-air update mechanisms constrained by native-runtime compatibility.

Strengths:

- strongest device API access,
- strong in-app scanner capability,
- native push and deep-link integration,
- OS-protected credential storage options,
- richer future background/offline/device features if approved.

Tradeoffs:

- mandatory install and store discovery friction,
- Apple/Google developer-account and signing lifecycle,
- store review/release tracks/privacy declarations,
- binary versioning and old clients remaining installed,
- two-platform device testing,
- native crash/support surface,
- urgent security updates cannot assume every user immediately installs a new binary,
- OTA updates do not remove native-runtime compatibility constraints.

Expo can reduce engineering ceremony but does not remove native platform/store operations.

### Option D: Hybrid Native Wrapper

Category: package the responsive web experience inside a native shell and selectively bridge native capabilities where needed.

Potential benefits:

- reuse much of the web UI,
- gain store distribution,
- selectively add native camera/push/linking bridges,
- lower initial UI rewrite than full native.

Costs/risks:

- inherits both web and native operational surfaces,
- app-store installation/signing/release burden still exists,
- WebView/session/cookie/deep-link/payment behavior becomes another security/testing boundary,
- native bridge/plugin supply-chain and permission complexity remain,
- can become a transitional architecture with poor long-term ownership if the native need grows.

A hybrid wrapper is credible only when a narrowly defined native capability becomes necessary before a full native application is justified. No current Phase 1 requirement demonstrates that condition.

## 7. Evaluation

| Criterion | Responsive Web | Web + PWA | Expo / React Native | Hybrid |
|---|---|---|---|---|
| Phase 1 journey fit | Strong | Strong | Strong but more than required | Moderate-Strong |
| Installation friction | Lowest | Low; install optional | Highest; store/binary install | High; binary install |
| Onboarding friction | Lowest link-first | Low | Higher | Higher |
| QR entry | Strong via OS-camera HTTPS; optional scanner | Strong; same + optional installed UX | Strong native scanner | Moderate-Strong with bridge |
| Camera reliability | Requires real browser/device validation | Same web runtime; installed-mode validation too | Strong device-native candidate | Depends on bridge/WebView design |
| Authentication UX | Strong for first-party browser session | Strong; same session model | Strong, but separate native credential transport | More complex mixed model |
| Session security | Strong with secure-cookie/CSRF discipline | Strong plus service-worker/cache risks | Strong with OS-protected credential storage design | Mixed browser/native risk surface |
| Payment checkout | Strong for hosted browser flow | Strong | Strong, with app switching/link-return setup | More complex if WebView/native handoff involved |
| Payment return | Standard HTTPS return is natural | Standard HTTPS return is natural | Universal/App Links are strong but require setup | Requires wrapper/link handling |
| Deep links | Standard HTTPS | Standard HTTPS | Strong verified HTTPS links | Possible but additional bridge/config |
| Push capability | Conditional/browser-dependent | Stronger progressive option; iOS Home Screen constraint | Strong native capability | Strong with native bridge, extra complexity |
| Offline usefulness for current scope | Low need | Potential exists but canonical offline flows intentionally rejected | Potential exists but current need low | Potential exists, current need low |
| Device API access | Moderate | Moderate | Strong | Moderate-Strong via plugins/bridge |
| Low-end Android performance | Potentially strong with small web payload; must measure | Similar; service-worker/startup effects must measure | Must measure bundle/startup/device behavior | Must measure WebView + bridge overhead |
| iPhone/Safari behavior | Good candidate; real-device validation required | Install/push/service-worker behavior requires dedicated validation | Native iOS behavior strongest but higher ops cost | Requires iOS wrapper validation |
| Accessibility | Strong standards base; implementation-dependent | Same | Strong native semantics possible; implementation-dependent | Harder mixed-surface validation |
| Release speed | Highest; central deploy | High, but service-worker rollout can complicate updates | Lower; binary/store lifecycle | Lower; binary/store lifecycle |
| App-store dependency | None | None for web distribution | Yes for normal public native distribution | Yes |
| Operational burden | Lowest | Low-Moderate | High | High |
| Support burden | Low-Moderate browser compatibility | Moderate | High across versions/devices/stores | High across web + native layers |
| Observability | Straightforward web telemetry + API correlation | Adds service-worker/install-state diagnostics | Requires mobile crash/version/device diagnostics | Requires web + native bridge diagnostics |
| Security surface | Smallest client surface | Larger: SW/cache/push/install state | Larger: tokens, deep links, binaries, native deps | Largest combined surface |
| Testing complexity | Lowest of options, still multi-browser/device | Moderate | High Android+iOS/version/link/storage tests | High mixed-layer tests |
| ADR-0011 compatibility | Direct | Direct | Direct | Direct if wrapper does not bypass API |
| Provider independence | Strong | Strong | Strong if provider SDKs remain adapters | Moderate-Strong |
| Future native evolution | Strong through stable API/identity | Strong | Already native | May help transition but can become dead-end |
| Reversibility | High | High-Medium | Medium | Low-Medium |
| Phase 1 cost/complexity | Lowest | Low-Moderate | Highest | Medium-High |

The matrix does not treat native as inferior in general. It shows that native's strongest benefits currently solve requirements that are mostly absent from the Phase 1 Member scope, while browser-first delivery directly reduces the most immediate friction: opening, verifying, checking in, and renewing.

## 8. Proposed Decision

**Propose a responsive browser-first Member web experience as the required Phase 1 delivery baseline, with PWA capabilities treated as optional progressive enhancements and Expo / React Native retained as the leading native evolution path only when explicit product/device evidence justifies native delivery.**

The proposal has these rules:

1. A Member must be able to use the core Phase 1 experience from a normal HTTPS browser session without installing an app.
2. Standard HTTPS links are the primary entry mechanism for QR, reminders, payment return, recovery, and other Member navigation.
3. OS Camera -> HTTPS GymPulse QR entry is the baseline QR acquisition strategy because it minimizes installation and camera-permission friction.
4. An in-browser camera scanner may be added only after current target-device validation proves reliable QR decode, camera permission UX, performance, and accessibility.
5. PWA installability may be added progressively if it materially improves repeat access.
6. A service worker is not required merely to call the product a PWA.
7. No broad authenticated API caching or offline canonical business behavior is part of the Phase 1 baseline.
8. Web push is not required by this ADR and remains separately governed.
9. Expo / React Native is not accepted for Phase 1 by this ADR; it remains the leading native candidate category if native escalation triggers are met.
10. A hybrid wrapper is not proposed as the baseline because it adds binary/store operations without a current requirement strong enough to justify the mixed web/native surface.
11. Browser and future native clients consume the same ADR-0011 JSON HTTP contract and the same GymPulse Principal/Member-self/business architecture.
12. Client delivery does not select authentication, payment, messaging, push, observability, database, hosting, or API deployment providers.
13. Direct browser/native database access remains unapproved.
14. Client-local caches remain presentation aids only and cannot authorize business effects.
15. A future native client can coexist with Member web/PWA rather than replacing the backend architecture.

Conceptually:

```text
Phase 1 baseline:
HTTPS Member Web
  + optional progressive PWA installability
  + OS-camera HTTPS QR entry
  + optional validated browser scanner

Future, evidence-triggered:
Expo / React Native Member App
  -> same ADR-0011 API
  -> same Principal / Member-self model
  -> same canonical business rules
```

## 9. Authentication and Session Relationship

### 9.1 Identity architecture remains separate

This ADR does not accept the authentication/session architecture or Member verification method.

Preserved flow:

```text
Authentication Evidence
  -> AuthIdentity
  -> GymPulse Principal
  -> explicit Member-self relationship
  -> authorization
```

A verified phone/email/provider identity is not itself Member authorization.

`D-ARCH-004` remains `OPEN`. `ADR-0007` remains Proposed.

`D-SEC-002` remains `OPEN`. `ADR-0008` remains Proposed. Managed phone OTP/passwordless is not accepted by this ADR.

### 9.2 Browser/PWA session posture

The browser-first proposal is compatible with the current leading architecture:

- first-party,
- server-mediated,
- secure-cookie-compatible,
- `HttpOnly` where compatible,
- `Secure` in production,
- deliberate `SameSite` posture appropriate to topology,
- HTTPS-only transport,
- explicit CSRF protection for cookie-authenticated mutations,
- logout and revocation support,
- session fixation/rotation defenses.

Exact lifetimes and device/session policy remain under `D-SEC-004`.

Long-lived reusable browser bearer credentials in `localStorage` are not the baseline.

### 9.3 Native session posture

If native delivery is later accepted, browser cookies need not be forced onto the native client.

Conceptual native posture may use:

```text
short-lived access evidence
+ refresh/re-authentication credential where required
+ OS-protected secure credential storage
+ rotation
+ revocation
+ logout
+ safe HTTPS universal/app-link callback handling
```

No token format, TTL, secure-storage package, Keychain wrapper, Keystore wrapper, provider SDK, or refresh policy is selected here.

Current Expo documentation demonstrates a secure-storage category backed by Android Keystore encryption and iOS Keychain, but that implementation/package is research evidence only and is not selected.

## 10. API and Authorization Relationship

ADR-0011 remains the Member-client boundary:

```text
Member Web / PWA / Future Native
  -> versioned JSON HTTPS contract
  -> Trusted GymPulse Runtime
  -> Principal resolution
  -> Member-self authorization
  -> application/domain logic
  -> canonical persistence
```

No delivery option gets a separate native-specific backend architecture.

No delivery option is permitted to bypass the trusted runtime through direct database or provider Data API access.

Protected Member operations remain:

```text
verified Principal
+
explicit Member-self relationship
+
current authorization/resource relationship
-> allow / deny
```

The client must not derive authorization from:

- Member ID in a URL,
- cached Member ID,
- phone number,
- provider subject,
- navigation state,
- a hidden screen,
- a successful QR decode,
- a deep-link parameter.

All URL, route, deep-link, and QR parameters are untrusted locators/input until server verification.

## 11. Offline, Push, and Device Capability Posture

### 11.1 Offline policy

No Phase 1 requirement justifies offline-first canonical business behavior.

Explicitly not proposed:

```text
scan now
-> save canonical attendance locally
-> sync later
```

Ordinary offline canonical QR attendance is unsafe because current truth requires:

- fresh QR/session validation,
- expiry checks,
- verified Member identity,
- branch validation,
- current membership eligibility,
- duplicate/concurrency checks,
- idempotent canonical write.

Likewise, offline client state cannot establish:

- membership eligibility,
- renewal eligibility,
- payment success,
- add-on entitlement,
- current authorization.

Potential low-risk offline behavior may include:

- application shell where justified,
- connection-status UI,
- retry guidance,
- limited non-sensitive static assets,
- carefully reviewed last-known presentation where privacy/freshness semantics are explicit.

Any last-known protected state must be visibly non-authoritative and must refresh before a protected mutation relies on current state.

### 11.2 Service-worker posture

If a service worker is later added, it is a security/reliability boundary because it can intercept requests, cache resources, and remain active across navigations.

Required controls include:

- narrow intended scope,
- explicit version/update lifecycle,
- no broad authenticated API response caching by default,
- logout cleanup where private cached material exists,
- Member A logout -> Member B same-device isolation,
- stale-session/revocation behavior,
- stale membership/payment presentation controls,
- offline fallback behavior that never fabricates business success.

A Phase 1 PWA may intentionally use a manifest/installability without aggressive authenticated-data caching.

### 11.3 Push posture

Push is not required to make the Phase 1 Member client viable.

Existing notification channels and future choices remain separately governed:

```text
WhatsApp / business messaging
SMS
email
web push
native push
in-app refresh on next open
```

`D-PROVIDER-002` and `D-PROVIDER-004` remain open.

Current platform research confirms:

- Web Push requires a service worker and permission.
- On iOS/iPadOS, Web Push is supported for Home Screen web apps and requires user-granted permission initiated through user interaction.
- Native Expo/React Native can use native notification capabilities but requires platform credentials/configuration and permissions.

None of these capabilities is selected by this ADR.

### 11.4 Notifications are never canonical truth

```text
notification delivered
!= payment succeeded
!= membership renewed
!= attendance recorded
```

Opening from any notification must resolve current canonical state through GymPulse.

## 12. Security and Privacy Impact

### 12.1 Threat/control map

| Threat | Architecture control | Implementation/test posture |
|---|---|---|
| XSS | minimize browser secrets; server authorization on every protected action; purpose-specific DTOs | output/script/CSP/dependency review and browser security tests |
| CSRF | server-mediated cookie sessions require explicit CSRF posture | origin/token/framework controls validated in deployed topology |
| Stolen browser session | bounded/revocable session architecture; current authorization rechecked | logout/revocation/fixation/rotation tests |
| Native token theft | reusable native credentials only in OS-protected storage category | secure-storage/revocation/device-loss spike if native is pursued |
| Insecure local storage | no reusable secrets in localStorage/ordinary cache/AsyncStorage | storage inspection in security validation |
| Service-worker/private cache leakage | private-by-default protected state; narrow cache policy | Member A -> Member B same-device and revocation-cache tests |
| Member ID substitution | Member-self server authorization | tampered URL/body/resource-ID negative tests |
| Cross-tenant link manipulation | trusted resource relationship and tenant scope resolved server-side | cross-tenant link/QR/deep-link negative tests |
| QR replay | short-lived/server-verifiable QR + duplicate/idempotency controls | expired/replayed/concurrent QR tests |
| QR token leakage | opaque/time-constrained token; token alone grants no Member identity | copied/screenshot/replay tests |
| Malicious deep link | HTTPS association where native exists; all params untrusted | malformed/tampered-link tests |
| Payment-return spoofing | return navigation never establishes payment truth | `paid=true`/success query tamper tests + canonical refresh |
| Push-token misuse | push tokens treated as provider/device routing metadata, not identity | ownership/revocation/privacy tests if push is adopted |
| Outdated native client | ADR-0011 compatibility/version policy and supported-client gating | old-version compatibility/deprecation tests if native exists |
| Stale PWA assets | controlled service-worker lifecycle and backwards-compatible API evolution | update/rollback/stale-asset tests |
| Dependency/supply-chain risk | minimize client dependencies; server truth; reviewed lockfile/dependency policy later | dependency review/scanning in later tooling |
| Rooted/jailbroken device | no client device considered a trusted business authority | document residual risk; server checks remain mandatory |

### 12.2 Storage rules

Reusable secrets must not be placed in ordinary:

- `localStorage`,
- unprotected `AsyncStorage`,
- generic browser cache storage,
- logs,
- analytics,
- URL parameters.

If native reusable credentials are later required, they require an OS-protected storage category and explicit threat-model validation.

### 12.3 Privacy minimization

Member clients receive only purpose-specific data required for the current journey. Do not expose owner-only analytics, internal follow-up notes, provider secrets, raw payment evidence, authorization internals, or cross-tenant identifiers.

Camera usage should be permission-driven and limited to the immediate scanning purpose. No image/video retention is implied by QR scanning.

## 13. Reliability, Performance, and Accessibility Impact

### 13.1 Reliability

Client delivery technology does not own canonical correctness.

Attendance reliability remains:

```text
identity
+ QR/session verification
+ membership eligibility
+ duplicate policy
+ idempotency
+ canonical transaction
```

Payment reliability remains:

```text
provider authenticity/verification
+ provider-event dedupe
+ business-effect uniqueness
+ reconciliation
```

A timeout after a successful server mutation is recovered through same-logical-operation idempotency/canonical refresh, not by guessing from local state.

### 13.2 Performance validation

Do not invent new thresholds. Measure representative flows on real devices:

- cold open,
- returning authenticated open,
- Member Home,
- QR entry,
- QR check-in completion,
- renewal-options load,
- checkout launch,
- payment return,
- poor-network retry.

Target environments must include:

- current Android Chrome,
- representative older/low-end Android,
- current iPhone Safari,
- installed PWA mode if proposed,
- slow/unstable network,
- camera permission denied,
- camera unavailable.

The browser-first recommendation is conditional on these measurements passing acceptable product/NFR review.

### 13.3 Low-end Android posture

Browser-first delivery can be lightweight if the Member bundle and API responses remain bounded. It can also perform poorly if a large SPA bundle, heavy QR decoder, unnecessary UI dependencies, or excessive client hydration is introduced.

Therefore:

- keep the Member surface narrow,
- code-split scanner/payment-only paths,
- avoid shipping owner/staff code to Member clients,
- measure startup and scanner behavior on real low-end hardware,
- avoid requiring install/background machinery without measured benefit.

### 13.4 iPhone/Safari posture

Current web platform support is sufficient to justify a browser-first spike, not to skip testing. Camera permission, browser scanner decoding, payment redirects, installed Home Screen behavior, service-worker updates, and web push have platform-specific behavior and require real iPhone validation.

### 13.5 Accessibility

Neither web nor native is accessible automatically.

Required Member validation includes:

- screen-reader semantics,
- text scaling / zoom behavior appropriate to platform,
- touch-target sizing,
- readable contrast,
- clear validation/authorization/business errors,
- visible loading/retry states,
- camera permission explanation and denial recovery,
- non-camera operational fallback where product policy permits,
- payment processing state that does not rely on color alone.

Authorized assisted check-in remains a valid operational fallback when policy allows it.

## 14. Operations, Release, and Observability Impact

### 14.1 Browser-first operational model

Benefits:

- one deployed Member client,
- link-based onboarding,
- no mandatory store review,
- rapid central rollout,
- immediate compatibility fixes for supported browsers.

Operational responsibilities:

- browser/device compatibility,
- HTTPS/TLS,
- session/cookie/CSRF correctness,
- camera permission/scanner validation if used,
- service-worker rollout safety if enabled,
- web-client error monitoring and request correlation.

### 14.2 Native operational model

Native delivery adds explicit operational work:

- Apple Developer Program / Google Play developer accounts,
- signing keys/certificates/provisioning,
- App Store / Play release lifecycle,
- store review,
- privacy/store declarations,
- release tracks/beta distribution,
- binary/app versioning,
- minimum supported OS decisions,
- Android/iOS device matrix,
- crash diagnostics,
- urgent security-release process,
- old client versions remaining installed.

Current Expo documentation confirms EAS can automate portions of signing/build/update workflow, but store memberships, signing identities, platform credentials, and binary compatibility still exist.

OTA/update capability does not eliminate native release management. Expo's update model uses runtime compatibility; changes to native code/runtime require a compatible/new binary/runtime version.

### 14.3 Observability

Whichever client exists, preserve request/correlation context where practical across:

```text
Member client
-> ADR-0011 request
-> trusted runtime
-> provider call / async continuation
-> protected telemetry
```

Web/PWA diagnostics may include:

- browser/version/device class,
- camera permission/scanner failure category,
- service-worker/install state if applicable,
- route/use-case,
- request ID,
- safe network error category.

Native diagnostics additionally need:

- app version/build/runtime version,
- OS/device family,
- deep-link handling,
- secure-storage/session failure category,
- native crash state,
- push-registration state if push exists.

Logs/analytics must not contain reusable secrets, raw tokens, payment credentials, QR secrets beyond safe diagnostic identifiers, or unnecessary PII.

## 15. Testing and Validation

No tests are implemented by this ADR. Acceptance requires evidence at least for:

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
28. Client-visible checkout success while canonical state remains Pending.
29. Eventual verified Paid state.
30. Browser/app restart during payment.
31. Tampered return/deep link.
32. Member ID substitution.
33. Cross-tenant link manipulation.
34. Sensitive local-storage/cache review.
35. Screen reader/text scale/touch target review.
36. Request/error correlation.
37. Supported-client compatibility evidence.
38. PWA update rollout if a service worker is used.
39. Native secure-storage/revocation spike if native remains a candidate.
40. Native release/store operations spike if native remains a candidate.

Additional evidence by delivery category:

Web/PWA:

- real mobile-browser E2E,
- camera/QR tests,
- cross-browser tests,
- service-worker/cache tests if applicable,
- installability tests if applicable.

Native:

- Android/iOS device tests,
- verified deep-link tests,
- secure-storage/revocation tests,
- app-version compatibility tests,
- push tests only if push is actually adopted.

Exact test tools remain governed by `D-ARCH-018`.

## 16. Native Escalation Triggers

The web/PWA-first proposal must be reconsidered when evidence shows one or more of these conditions materially matter:

1. Target-device browser QR/camera fails acceptance.
2. Native push becomes business-critical rather than optional engagement.
3. Background client execution becomes a real approved requirement.
4. Meaningful offline workflows become approved.
5. Required device APIs are unreliable or unavailable on supported web clients.
6. App-store distribution becomes a business requirement.
7. Browser payment/authentication experience is materially unacceptable on target devices.
8. Later workout/progress/health capabilities move into active scope and materially benefit from native APIs.
9. Measured adoption, retention, support, or reliability evidence favors native delivery.

These are triggers to reopen the decision, not automatic approval of Expo/React Native.

Likewise, PWA features may be de-escalated. If normal responsive browser use provides sufficient repeat access, GymPulse may remain responsive web without installability, service workers, or web push.

## 17. Migration and Rollout

No Member application implementation is created by this ADR.

If the proposal is later accepted, rollout should proceed in bounded evidence-producing stages:

1. Implement only after relevant architecture gates allow it.
2. Start with responsive HTTPS Member web consuming ADR-0011.
3. Validate first-use and returning-session flows.
4. Validate OS Camera -> HTTPS QR check-in on target devices.
5. Validate hosted payment launch/return and canonical Pending/Paid behavior.
6. Add an in-browser scanner only if it measurably improves QR UX and passes target-device validation.
7. Add manifest/installability only if repeat access benefits are demonstrated.
8. Add a service worker only for a specific approved capability with explicit cache/update/logout isolation tests.
9. Add web push only if notification requirements justify it and `D-PROVIDER-004` is separately resolved.
10. Reassess native delivery only when one or more escalation triggers have evidence.
11. If native is later accepted, keep Member web available where it remains useful and migrate no backend business truth into the native client.

## 18. Reversibility

The proposed browser-first strategy is **High** reversibility because it keeps the durable architecture outside the client framework:

- ADR-0011 contracts,
- Principal/AuthIdentity model,
- Member-self authorization,
- domain/application rules,
- payment verification,
- attendance idempotency,
- provider abstractions,
- canonical persistence.

A future native application can be added without replacing these boundaries.

PWA installability is reversible when progressive features are isolated and service-worker scope/caching remain conservative.

Native delivery has **Medium** reversibility because app-store identity, deep-link associations, push registrations, native credentials, installed old versions, and binary release processes create persistent operational commitments.

Hybrid wrappers have **Low-Medium** reversibility if native bridges and WebView-specific assumptions become widespread.

## 19. Risks and Mitigations

### Risk: browser-first is chosen without real QR evidence

**Mitigation:** acceptance requires OS-camera HTTPS and any proposed browser scanner to pass real Android/iPhone/low-end testing.

### Risk: PWA label drives unnecessary service-worker/offline complexity

**Mitigation:** treat every progressive capability independently; manifest/installability does not imply authenticated-data caching.

### Risk: stale/private service-worker cache leaks Member data

**Mitigation:** private-by-default protected responses, conservative caching, logout cleanup, same-device account-switch tests, revocation/stale-cache tests.

### Risk: browser session token theft/XSS

**Mitigation:** secure-cookie-compatible architecture, no baseline reusable bearer token in localStorage, server authorization, CSP/output/dependency controls.

### Risk: native credentials stored insecurely

**Mitigation:** native reusable credentials require OS-protected storage category and explicit secure-storage/revocation validation; ordinary AsyncStorage is not acceptable for reusable secrets.

### Risk: QR URL/token is treated as identity

**Mitigation:** token remains opaque/untrusted and server verification includes identity, branch, expiry, eligibility, duplicate/idempotency.

### Risk: return/deep link says payment succeeded

**Mitigation:** return is navigation only; client fetches canonical Payment state.

### Risk: push becomes implicit architecture dependency

**Mitigation:** keep push provider/need separate; current Member journeys remain usable without push.

### Risk: native app is justified by future super-app scope

**Mitigation:** native escalation requires active canonical requirements or measured pilot evidence, not speculative future fitness features.

### Risk: old native client breaks API evolution

**Mitigation:** ADR-0011 compatibility policy, supported-client policy, explicit version telemetry/gating, and deprecation evidence before native launch.

### Risk: browser centrally updates but stale PWA assets remain

**Mitigation:** service-worker/version rollout tests, backwards-compatible API changes, conservative update strategy.

### Risk: hybrid wrapper becomes permanent accidental architecture

**Mitigation:** use hybrid only for a narrowly documented requirement with explicit exit/review criteria.

## 20. Open Questions

The following remain outside this ADR:

- final authentication/session provider and implementation (`D-ARCH-004`),
- final Member verification method and provider (`D-SEC-002`),
- exact session lifecycle/device/revocation policy (`D-SEC-004`),
- final API deployment topology (`D-ARCH-006`),
- hosting/platform choice (`D-ARCH-009`),
- exact testing toolchain (`D-ARCH-018`),
- payment provider and its hosted-checkout/app-handoff semantics (`D-PROVIDER-001`),
- messaging provider/channels (`D-PROVIDER-002`),
- push provider and whether push is needed (`D-PROVIDER-004`),
- observability provider (`D-PROVIDER-006`),
- supported browser/OS minimum versions (`NFR-COMPATIBILITY-001`),
- formal accessibility conformance target (`NFR-ACCESSIBILITY-003`),
- exact QR URL/token format and lifetime,
- whether browser in-app scanner materially improves pilot UX over OS-camera HTTPS entry,
- whether Members value home-screen installation,
- whether any service worker is needed in Phase 1,
- whether any last-known protected state may be retained locally and under what privacy/freshness rules,
- whether future business requirements require App Store / Play distribution,
- whether later native push/background/offline/device requirements become active,
- whether a hybrid wrapper ever provides enough value to justify its dual surface.

## 21. Decision Evidence

### 21.1 Repository evidence

Current canonical repository evidence supports:

- Phase 1 as an operations/retention MVP rather than a generic fitness super-app.
- Member repeated actions centered on check-in, membership state, renewal/payment, attendance progress, add-on state, and preferences.
- a mobile-first Member experience with minimal repeated interaction.
- server-authoritative attendance/payment/membership truth.
- explicit Member-self authorization.
- a framework-independent JSON HTTPS contract under ADR-0011.
- current technology evaluation favoring responsive web/PWA first only if real target-device validation passes.
- no accepted native, push, background-execution, or offline-first Member requirement.
- no direct browser/mobile database access approval.

### 21.2 Current official platform research

Research date: `2026-09-22`.

Web/PWA material reviewed:

- MDN `MediaDevices.getUserMedia()`: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
- MDN Barcode Detection API: https://developer.mozilla.org/en-US/docs/Web/API/Barcode_Detection_API
- MDN PWA installability: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable
- MDN Web App Manifest: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest
- MDN Service Worker API: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- MDN Push API: https://developer.mozilla.org/en-US/docs/Web/API/Push_API
- WebKit Web Push for Home Screen web apps on iOS/iPadOS: https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/

Material findings:

- browser camera capture is broadly available through `getUserMedia()`, but requires HTTPS/secure context and user permission,
- browser-native barcode detection remains limited/experimental and cannot be assumed as the only cross-browser QR decoder,
- PWA installability is manifest-driven on supporting browsers,
- a service worker is optional for many installability scenarios and should be added for a real requirement,
- service workers can intercept requests/cache resources and therefore create a meaningful private-state/update security surface,
- Web Push depends on service workers/permission, with iOS/iPadOS Web Push specifically tied to Home Screen web apps.

Expo/React Native/native-platform material reviewed:

- Expo Camera: https://docs.expo.dev/versions/latest/sdk/camera/
- Expo linking overview: https://docs.expo.dev/linking/overview/
- Expo notifications: https://docs.expo.dev/push-notifications/what-you-need-to-know/
- Expo push setup: https://docs.expo.dev/push-notifications/push-notifications-setup/
- Expo SecureStore documentation: https://docs.expo.dev/versions/latest/sdk/securestore/
- Expo EAS Build/store distribution: https://docs.expo.dev/deploy/build-project/
- Expo runtime versions/EAS Update: https://docs.expo.dev/eas-update/runtime-versions/
- React Native Linking: https://reactnative.dev/docs/linking
- React Native security guidance: https://reactnative.dev/docs/security
- Apple Universal Links: https://developer.apple.com/documentation/xcode/supporting-universal-links-in-your-app
- Apple associated domains: https://developer.apple.com/documentation/xcode/supporting-associated-domains
- Android App Links: https://developer.android.com/training/app-links/about
- Android App Links verification: https://developer.android.com/training/app-links/verify-applinks

Material findings:

- Expo provides native camera/barcode capability on Android/iOS and also exposes a web path,
- native verified HTTPS linking uses iOS Universal Links / Android App Links and requires website/app association,
- all incoming link parameters still require application validation,
- native notification support adds platform permission/credential/configuration responsibilities,
- OS-protected secure storage categories exist for native reusable credentials,
- public native distribution still requires store accounts, signing, binary release lifecycle, and platform operations,
- OTA update capability remains constrained by native runtime compatibility and does not eliminate binary releases when native code/runtime changes.

No current framework/library/package version is accepted or pinned by this ADR.

### 21.3 Evidence still missing for acceptance

- decision-owner approval,
- real target-device OS-camera HTTPS QR results,
- browser scanner results if scanner is proposed,
- browser authentication/session validation,
- payment checkout/return validation with the eventually selected provider,
- representative low-end Android performance,
- current iPhone Safari validation,
- browser/PWA accessibility evidence,
- Member A -> Member B same-device isolation evidence if local/service-worker state exists,
- PWA service-worker/update evidence if a service worker is proposed,
- supported-client policy,
- pilot adoption/support evidence sufficient to confirm or challenge browser-first delivery,
- native secure-storage/release-store spike only if native remains under active consideration.

Therefore ADR-0013 remains `Proposed`.

## 22. Related Documents

- `../README.md`
- `../00-overview/assumptions.md`
- `../01-product/functional-requirements.md`
- `../01-product/non-functional-requirements.md`
- `../01-product/personas.md`
- `../01-product/user-roles.md`
- `../01-product/user-journeys.md`
- `../02-architecture/architecture-principles.md`
- `../02-architecture/architecture-overview.md`
- `../02-architecture/system-context.md`
- `../02-architecture/container-architecture.md`
- `../02-architecture/component-architecture.md`
- `../02-architecture/data-flow.md`
- `../02-architecture/technology-stack.md`
- `ADR-0007-authentication-session-architecture.md`
- `ADR-0008-member-authentication-method.md`
- `ADR-0009-authorization-implementation.md`
- `ADR-0010-data-layer-tenant-isolation-rls.md`
- `ADR-0011-api-contract-architecture.md`
- `ADR-0012-owner-staff-web-framework.md`
- legacy migration source: `../03-user-flows.md`
- legacy migration source: `../04-screen-specifications.md`
- legacy migration source: `../05-system-architecture.md`
- legacy migration source: `../07-api-contracts.md`
- legacy migration source: `../15-engineering-workflow.md`
- legacy migration source: `../16-open-decisions.md`
