# ADR-0007: Authentication and Session Architecture

## Status

`Proposed`

## Decision Metadata

- ADR: `ADR-0007`
- Primary Decision ID: `D-ARCH-004`
- Related Decision IDs: `D-ARCH-014`, `D-SEC-002`, `D-SEC-004`, `D-ARCH-015`, `D-SEC-008`, `D-ARCH-006`, `D-ARCH-012`, `D-ARCH-013`, `D-ARCH-009`, `D-SEC-001`, `D-SEC-005`, `D-SEC-006`, `D-DATA-004`, `D-ARCH-016`
- Decision Owner: `Open`
- Technical Owner: `Architecture / Security / Identity`
- Date Proposed: `2026-09-06`
- Date Accepted: `Not accepted`
- Supersedes: `None`
- Superseded By: `None`

## 1. Context

GymPulse Phase 1 requires authenticated staff access and verified member access while preserving a strict separation between identity proof, GymPulse actor identity, tenant/resource authorization, and business rules.

The canonical architecture already requires this trust chain:

```text
Authentication
  proves identity evidence

Principal Resolution
  maps verified evidence to a GymPulse actor

Authorization
  evaluates current tenant/resource scope + named capability

Business Operation
  executes only after authorization and domain validation
```

Equivalently:

```text
provider identity evidence
        ↓
GymPulse principal
        ↓
server-validated tenant/resource scope
        ↓
current named capability
        ↓
allow / deny
        ↓
application use case / domain rule
```

A successful login therefore does **not** establish permanent or unrestricted business access. Staff assignments, account state, branch scope, roles, and capabilities can change while provider-issued identity/session evidence remains cryptographically valid. Current GymPulse-controlled state must continue to govern access.

`D-ARCH-004` is currently `P0 OPEN`. It asks for an authentication/session strategy that supports staff web and member access, including revocation, expiry, server-side identity verification, and server-side principal resolution.

This ADR creates a concrete architectural proposal for review. Its ADR status is `Proposed`; it does **not** change the canonical decision to `DECIDED`.

Two related security decisions remain intentionally separate:

- `D-SEC-002` (`P0 OPEN`) decides the member authentication/verification method.
- `D-SEC-004` (`P1 OPEN`) decides exact session lifetime, revocation, device/session-management, inactivity, remember-me, and similar policy details.

This ADR defines the architecture those policies must fit. It does not invent numerical token/session/OTP lifetimes, maximum device counts, inactivity windows, MFA mandates, or a member OTP provider.

It also preserves `D-ARCH-015`, currently `PROPOSED`, under which GymPulse authorization is based on a server-side principal plus tenant/resource scope plus named capability.

The current Phase 1 client picture is:

- an Owner/Manager/Front Desk staff web experience,
- a mobile-first member experience whose exact delivery strategy remains separately governed under `D-ARCH-013`,
- a trusted GymPulse application/API boundary whose deployment topology remains open under `D-ARCH-006`.

The authentication architecture must therefore support a secure browser model now without preventing a future native member client if that delivery model is later approved.

## 2. Requirements and Decision Drivers

### 2.1 Functional requirements

Primary identity and authorization requirements:

- `FR-IDENTITY-001` protected Owner, Manager, and staff functionality requires an authenticated identity.
- `FR-IDENTITY-002` authenticated users must be able to terminate their current session, and the system must support revocation/expiry semantics suitable for the selected authentication provider.
- `FR-IDENTITY-003` protected member self-service requires a verified identity mechanism; a raw mobile number alone is not authorization proof.
- `FR-AUTHZ-001` every protected operation is authorized against organization/gym/branch scope where applicable.
- `FR-AUTHZ-002` protected mutations use named capabilities rather than client visibility or role-name checks alone.
- `FR-AUTHZ-003` a member cannot access another member's protected records through normal member-facing APIs.
- `FR-AUTHZ-004` sensitive staff actions record the authenticated actor.
- `FR-AUDIT-001` defined sensitive actions require an audit record.
- `FR-AUDIT-003` audit history preserves actor, action, resource, time, and tenant context.
- `FR-CROSS-001` clients are not trusted to determine final authorization or other canonical business truth.
- `FR-CROSS-003` tenant/gym/branch context is explicit in protected requests and relevant data relationships.

### 2.2 Non-functional requirements

Security and privacy:

- `NFR-SECURITY-001` tenant isolation.
- `NFR-SECURITY-002` least privilege.
- `NFR-SECURITY-003` server-side authorization for every protected operation.
- `NFR-SECURITY-004` protection of secrets, signing keys, provider credentials, and other privileged material.
- `NFR-SECURITY-005` encrypted transport for authenticated/personal/financial/operational production traffic.
- `NFR-SECURITY-009` sensitive action attribution.
- `NFR-SECURITY-010` provider-appropriate and/or application abuse controls for authentication/verification-sensitive endpoints.
- `NFR-SECURITY-011` sensitive error minimization.
- `NFR-PRIVACY-001` data minimization.
- `NFR-PRIVACY-005` retention policy remains Open.
- `NFR-PRIVACY-006` future export/correction/deletion support without corrupting required records.

Testability and operations:

- `NFR-TESTABILITY-004` positive and negative authorization matrix tests.
- `NFR-OBSERVABILITY-001` structured operational logs.
- `NFR-OBSERVABILITY-002` safe operational context without secrets/unnecessary PII.
- `NFR-OBSERVABILITY-003` centralized production error visibility.
- `NFR-OBSERVABILITY-007` correlation identifiers where practical.
- `NFR-OPERATIONS-001` separate lifecycle environments.
- `NFR-OPERATIONS-002` production secret separation.
- `NFR-OPERATIONS-004` release smoke validation includes authentication.
- `NFR-MAINTAINABILITY-005` Docs-as-Code synchronization.
- `NFR-MAINTAINABILITY-006` ADR governance for major architecture choices.

### 2.3 Architecture principles

This decision is especially constrained by:

- `ARCH-PRIN-001` Tenant Isolation by Design.
- `ARCH-PRIN-002` Authentication and Authorization Are Separate Responsibilities.
- `ARCH-PRIN-003` Capability-Based Permissions.
- `ARCH-PRIN-004` Deterministic Server-Side Business Truth.
- `ARCH-PRIN-007` Auditable Sensitive Mutations.
- `ARCH-PRIN-012` Provider Abstraction at Integration Boundaries.
- `ARCH-PRIN-013` Failure Visibility and Reconciliation.
- `ARCH-PRIN-014` Observability by Design.
- `ARCH-PRIN-015` Data Minimization and Purpose Separation.
- `ARCH-PRIN-016` Secure Defaults and Least Privilege.
- `ARCH-PRIN-019` Evolution Through Explicit Decisions.

## 3. Constraints and Assumptions

1. **Authentication is not authorization.** Authentication proves identity evidence; GymPulse authorization evaluates current internal scope and capabilities.
2. Provider roles, groups, custom JWT claims, profile metadata, or client-side role values are not the sole canonical authority for GymPulse business permissions.
3. A provider session may remain technically valid after a staff account is disabled, a gym assignment is removed, a branch scope changes, or capabilities are revoked. Current GymPulse access state must still deny future protected operations.
4. `D-ARCH-015` remains separately governed and `PROPOSED`. This ADR supplies the principal to authorization but does not re-decide the full authorization policy implementation.
5. `D-SEC-002` remains `OPEN`. Phone OTP/passwordless is a current candidate only; this ADR does not select it.
6. `D-SEC-004` remains `OPEN`. Exact access-token/session/refresh lifetimes, inactivity windows, remember-me policy, concurrent-device limits, session-visibility requirements, and revocation propagation targets are not selected here.
7. `D-DATA-004` remains `PROPOSED`. This ADR aligns with its separation of `Member` and authenticated `User/AuthIdentity` concepts but does not accept or finalize a schema/cardinality model.
8. External provider subject identifiers are integration identity references, not universal domain identifiers.
9. Mutable email addresses, phone numbers, and display names cannot be the only stable key linking external authentication identity to GymPulse business identity.
10. A Member is a gym business record. An authenticated principal is an actor identity. They may be linked for member self-service but are not the same concept.
11. The same person may eventually be both staff and member. The architecture should not require duplicate credentials solely because business roles differ, but identity linking must never merge authorization scopes automatically.
12. `D-ARCH-006` remains `OPEN`. Authentication semantics must work whether the trusted application/API is co-hosted with a web runtime or independently deployed.
13. `D-ARCH-012` and `D-ARCH-013` remain `PROPOSED`. Authentication must not depend on Next.js middleware, a native framework, or another specific client framework as the canonical security boundary.
14. `D-ARCH-014` remains canonically `OPEN`; `ADR-0006` only proposes selective managed infrastructure. This ADR may recommend a managed authentication category without accepting an integrated platform or provider.
15. `D-SEC-008` remains `OPEN`; authentication does not decide database RLS or direct-client database access. The default business trust path remains `Client -> Trusted GymPulse Runtime -> Canonical Persistence`.
16. Human sessions, trusted background job/system contexts, and provider webhook authenticity are different trust models and must not be conflated.
17. Provider SDKs may be used at integration/client authentication boundaries when later approved, but application/domain modules should not depend on provider-specific SDK objects.
18. Long-lived browser bearer credentials in `localStorage` are not an acceptable default. Any exception would require explicit security evidence and threat review.
19. Authentication/principal caching is not required. Cryptographic key caches, principal mapping caches, and authorization caches are separate concerns and must preserve revocation semantics if later introduced. No Redis dependency follows from this ADR.
20. `D-SEC-001`, `D-SEC-005`, and `D-SEC-006` remain separately governed for jurisdiction/privacy, deletion/export authority, and retention.

## 4. Identity and Principal Model

### 4.1 Conceptual identity layers

GymPulse should preserve four distinct concepts:

```text
External Auth Identity
  provider-owned identity/session evidence
        ↓
AuthIdentity Mapping
  provider + immutable provider subject/reference
        ↓
GymPulse Principal / User
  stable internal actor identity
        ↓
Business Access Links
  staff tenant/scope assignments and/or member-self link
        ↓
Member Record / other business resources
```

This is a conceptual model only. It does not finalize table names, schema, cardinality, indexes, or migration structure.

### 4.2 External authentication identity

An external authentication provider may own credential verification and produce signed/session-bound identity evidence.

Conceptual verified evidence may contain only what is needed to establish identity/session context, for example:

```text
VerifiedIdentityEvidence
  provider
  issuer
  immutable provider subject/reference
  verified_at
  authentication method / assurance context where relevant
  provider session/reference metadata where safe and needed
```

Raw provider payloads remain untrusted until verified through the authentication boundary.

### 4.3 AuthIdentity mapping

GymPulse should maintain a provider-independent mapping concept equivalent to:

```text
AuthIdentity
  provider
  immutable_provider_subject
  internal_principal_reference
```

A provider subject ID should not be spread through Members, Memberships, Attendance, Payments, Retention, or other business-domain tables as the universal actor ID.

Email/phone changes must not require rewriting business identity across domains.

### 4.4 Internal GymPulse principal

A provider-independent principal concept should expose only trusted internal actor context needed by downstream security/application components, conceptually:

```text
Principal
  principal_id
  actor_type
  internal user/member linkage references where applicable
  verified identity context
  authentication/session reference metadata where useful
  current account eligibility state
```

A Principal must not contain an authorization conclusion copied blindly from provider claims.

Authorization separately resolves:

```text
principal
  + current tenant/resource scope
  + current named capability
  -> allow / deny
```

### 4.5 Member self-service linkage

A Member is a business record and may exist before or without an interactive authentication identity.

Member self-service should conceptually follow:

```text
Auth Identity
  -> Internal Principal
  -> explicit Member Access Link
  -> Member business record
```

The Member ID is not the current phone number, email, or provider subject.

`D-SEC-002` will later decide how a member proves/recovers identity. This ADR only requires the chosen method to resolve to a stable internal principal/member link.

### 4.6 Staff and member overlap

If one person is both staff and a member, one verified human identity may map to an internal principal that has both:

- explicit staff assignments/scopes/capabilities, and
- an explicit member-self linkage.

These relationships remain independent. A member link does not create staff authority; a staff role does not grant self access to a different member record.

### 4.7 Multi-tenant identity

A valid login never selects or grants a tenant implicitly.

One staff principal may hold multiple assignments such as:

```text
Principal
  -> Gym A / Branch 1 / capability set X
  -> Gym A / Branch 2 / capability set Y
  -> Gym B / capability set Z
```

The requested tenant/resource context is resolved and validated by GymPulse for the current request. Provider metadata is not the canonical source for those assignments.

### 4.8 Disabled/removed staff and stale sessions

A currently valid provider session cannot override current GymPulse account or assignment state.

Before a protected business operation executes, GymPulse must be able to deny access when:

- the internal account is disabled,
- the staff user is removed from the gym,
- a role/capability is revoked,
- branch/gym scope changes,
- the requested resource no longer belongs to an authorized scope.

This is required even if the external access token/session has not expired yet.

### 4.9 Principal resolution algorithm

A protected human request should conceptually execute this identity phase:

1. receive authentication/session evidence from the client transport,
2. cryptographically/provider-verify the evidence,
3. validate the expected issuer, audience, expiry, algorithm/key and other token/session rules where applicable,
4. resolve the provider plus immutable subject/reference,
5. map that identity to an internal GymPulse identity/principal,
6. verify the internal account is active/eligible for access,
7. load or resolve current tenant/member relationships required for the requested operation,
8. construct the provider-independent Principal,
9. pass the Principal to current tenant/resource resolution and named-capability authorization.

Any invalid, expired, unverifiable, unmapped, ambiguous, or disabled condition fails closed for protected operations.

### 4.10 Identity linking and recovery-sensitive changes

Linking another authentication method to an existing principal is a sensitive security operation.

Required posture:

- do not automatically merge accounts solely because mutable email/phone values match,
- require appropriate re-verification according to the selected provider/method,
- detect ambiguous/duplicate mappings rather than guessing,
- record security-sensitive linkage/recovery actions with stable actor attribution where applicable,
- treat provider migration as explicit subject remapping rather than changing every business-domain identifier,
- treat email/phone changes as contact/authentication changes, not as changes to the stable GymPulse principal or Member ID.

Exact linking/recovery workflows remain subject to the selected provider, `D-SEC-002`, and later security policy.

### 4.11 Non-human identities

Background jobs and provider callbacks do not impersonate a human session.

Conceptually distinguish:

```text
Human Principal
System Principal / Trusted Job Context
Verified Provider Callback Context
```

A trusted job context has only the bounded job type and explicit tenant/gym scope needed for that execution. Provider webhooks use provider-specific authenticity verification, not interactive login semantics.

## 5. Session Architecture

### 5.1 Identity provider architecture and session architecture are separate axes

Selecting a managed identity provider does not automatically determine how staff browser sessions should be transported or whether GymPulse should introduce its own server-side session state.

This ADR evaluates:

- who owns credential verification and provider identity/session infrastructure, and
- how verified session evidence is securely transported and validated across GymPulse clients/runtimes.

### 5.2 Required session capabilities

Regardless of implementation, the selected architecture must support:

- authentication evidence expiry,
- renewal/refresh where applicable,
- current-session logout,
- revocation where supported by the provider/session model,
- session/token rotation where appropriate,
- secure credential/token storage,
- concurrent sessions where later policy permits,
- future device/session visibility if later required,
- provider key rotation,
- failure-safe verification,
- current GymPulse account/scope/capability checks independent of session lifetime.

Exact policy values remain under `D-SEC-004`.

### 5.3 Recommended staff web posture

For the Phase 1 staff web experience, the leading posture is a **first-party, server-mediated, secure cookie-compatible session transport** backed by managed authentication/session evidence when the selected provider supports it safely.

Preferred browser properties:

- authentication secret/session material is transported through a cookie that is `HttpOnly` where compatible,
- `Secure` in production,
- an explicit `SameSite` posture appropriate to the final origin/deployment model,
- HTTPS-only transport,
- narrow host/domain/path scope,
- session identifier/credential rotation around authentication and relevant privilege/security transitions,
- logout removes local browser session material and invalidates the underlying current session/provider credential where supported,
- session fixation defenses reject/rotate attacker-supplied or pre-authentication session state,
- browser JavaScript does not hold a long-lived reusable bearer credential by default.

Where topology permits, a host-only session cookie (for example a `__Host-`-compatible shape) is preferable because it reduces subdomain scope. Exact cookie naming and deployment-specific domain/path configuration are implementation details.

### 5.4 Cookie authentication and CSRF

`HttpOnly` protects against direct JavaScript reads of the cookie, but it does **not** solve CSRF.

Cookie-authenticated state-changing endpoints must use an explicit CSRF posture appropriate to the final framework/topology. Defense may include:

- `SameSite` as defense in depth,
- strict Origin validation and Referer fallback where applicable,
- framework-provided CSRF protection,
- server-generated CSRF tokens where needed,
- custom-header / fetch-metadata approaches when they satisfy the complete browser threat model,
- no state-changing `GET` endpoints.

The final implementation must not rely on `SameSite` alone unless the deployed origin/subdomain/browser model has been explicitly demonstrated to satisfy the narrow conditions under which that residual risk is accepted.

### 5.5 XSS impact

`HttpOnly` reduces direct theft of a cookie secret but does not make XSS harmless. Malicious same-origin JavaScript can still invoke authenticated actions through the victim's browser.

Therefore:

- avoid exposing long-lived reusable authentication secrets to browser JavaScript when possible,
- treat output encoding/content security/frontend dependency hygiene as part of the web security implementation,
- require authorization and sensitive-operation controls on the server regardless of browser credential storage,
- consider re-authentication/step-up capability for later high-risk security actions where policy requires it.

This ADR does not select a frontend security framework or CSP implementation.

### 5.6 Token-based evidence and JWT verification

JWT is a valid provider/session evidence format, not a requirement.

When JWT evidence is used, verification must include provider-appropriate checks such as:

- cryptographic signature verification,
- explicit allowed-algorithm policy,
- issuer validation,
- audience validation where applicable,
- expiry validation,
- `not-before` validation where applicable,
- issuer/subject binding to an expected provider identity namespace,
- token-type/use separation when an issuer creates different JWT classes,
- key ID/signing-key selection and rotation handling.

Base64-decoding claims without cryptographic validation is never authentication.

### 5.7 Provider signing-key rotation and JWKS

When the provider exposes asymmetric signing keys/JWKS, the verification adapter should support safe key caching and rotation.

Expected behavior:

- cache known public keys according to provider/cache semantics rather than making a network request on every protected request,
- refresh when a previously unknown key identifier appears according to a bounded policy,
- reject evidence that remains unverifiable,
- tolerate expected key overlap during rotation,
- do not silently fall back to an unverified claim payload during provider/JWKS outage.

Exact cache duration and retry behavior depend on the selected provider and later operational policy.

### 5.8 Logout

`FR-IDENTITY-002` requires current-session termination.

A compliant logout must conceptually:

```text
logout request
  -> identify current authenticated session
  -> request server/provider current-session invalidation where supported
  -> invalidate any GymPulse-owned current-session state if introduced
  -> clear browser-held session credential/cookie
  -> clear client-visible sensitive state
  -> return a signed-out application state
```

Logout is not satisfied by hiding the authenticated UI while a reusable session credential remains active.

### 5.9 Revocation model

Revocation has two related layers:

1. **Authentication/session revocation**: provider or GymPulse session infrastructure prevents future use/refresh of the affected session where the chosen model supports it.
2. **Business-access revocation**: current GymPulse account/tenant/capability state denies the protected operation even if authentication evidence remains technically valid for a period.

Required revocation triggers include support for later policy around:

- current-session logout,
- administrative account disable,
- staff removal from a tenant,
- credential compromise/security response,
- account recovery,
- provider session revocation,
- user deactivation/deletion where permitted by policy.

This ADR intentionally does not specify a numerical revocation SLA. Provider/session validation must prove acceptable propagation before acceptance.

### 5.10 Provider access and refresh tokens

If the selected provider/session architecture uses access and refresh credentials:

- access evidence should be bounded in lifetime according to `D-SEC-004` and provider capability,
- refresh credentials require stronger storage protection than ordinary client state,
- rotation/reuse detection should be used when the provider supports it and the final policy requires it,
- refresh/session revocation must be testable,
- signing keys/issuer/audience must be validated on access evidence,
- long-lived refresh credentials must not be stored in browser `localStorage` as the baseline design.

The ADR does not specify exact access or refresh lifetimes.

### 5.11 Future native member compatibility

`D-ARCH-013` remains `PROPOSED`; no native member app is selected.

If a native client is later approved, the same managed-provider + GymPulse-principal architecture can support a native-specific session transport using, conceptually:

- short-lived access evidence,
- a refresh/re-authentication credential protected in OS secure credential storage,
- provider-recommended PKCE when an OAuth/OIDC authorization-code flow is used,
- strict deep-link/universal-link/app-link callback validation,
- rotation/revocation,
- logout/session termination,
- server-side GymPulse principal resolution and authorization on every protected API interaction.

The native client must not rely on browser-cookie assumptions, and no native TTL or credential-storage implementation is chosen here.

### 5.12 Authentication dependency outage

Authentication-provider degradation must be classified rather than bypassed.

Examples:

- **new login unavailable:** new authentication may fail safely until the provider recovers,
- **refresh unavailable:** a session that cannot be safely refreshed must eventually require re-authentication according to provider/policy behavior,
- **provider administration API unavailable:** administrative revocation/recovery actions may be temporarily unavailable and must be visible operationally,
- **JWKS/provider verification endpoint unavailable:** locally verifiable evidence may continue only when verification can be completed safely using cached, still-valid trusted keys/configuration; unknown/unverifiable evidence fails closed.

An authentication outage must not modify or corrupt canonical attendance, payment, membership, retention, or audit state.

### 5.13 Session state and horizontal runtimes

The architecture must work with horizontally scalable trusted runtimes and cannot depend on one process's memory as permanent session/revocation truth.

A GymPulse opaque server-side session store remains a valid session model if later selected, but its durable implementation is not chosen by this ADR.

No Redis/cache dependency is introduced.

## 6. Options Considered

### 6.1 Identity provider architecture options

#### Option A: Managed authentication provider + GymPulse principal mapping

Delegate credential verification, authentication protocol implementation, provider identity/session infrastructure, recovery primitives, key rotation, and related commodity security mechanisms to a managed authentication provider.

GymPulse owns:

- `AuthIdentity` mapping,
- internal Principal resolution,
- current account eligibility,
- tenant/gym/branch relationships,
- role/capability assignments,
- business authorization,
- Member linkage,
- audit semantics,
- application/domain behavior.

This is the leading architecture category because it reduces direct credential-security operations while preserving provider-independent GymPulse business identity and authorization.

It does not select a vendor.

#### Option B: Integrated managed-backend authentication

Use authentication included in an integrated managed platform, with Supabase Auth as the current representative candidate because `ADR-0006` already evaluated Supabase as an integrated platform candidate.

Potential benefits:

- fewer control planes when database/Auth/local tooling are intentionally combined,
- integrated session/user administration,
- provider-supported passwordless/phone/email/MFA capabilities,
- standard server-side token verification/session primitives,
- potentially simpler environment setup when the platform is already selected for other responsibilities.

Tradeoffs:

- stronger provider coupling across Auth + platform control plane,
- identity/session migration is less portable than standard database hosting,
- risk that provider JWT roles/metadata/RLS conventions leak into business authorization,
- Auth must remain optional and separately governed even if the platform is later used for database hosting.

Supabase Auth is **not selected** by this ADR.

#### Option C: Specialized managed identity provider

Use a dedicated managed identity provider, with Clerk and Auth0 as small representative candidates for current architecture research.

Potential benefits:

- focused identity/session/recovery product surface,
- mature server-side verification/session-management APIs,
- broader identity feature sets and dedicated identity operations,
- independence from database/managed-backend selection.

Tradeoffs:

- another provider/control plane/credential set,
- provider-specific session/user models and SDKs,
- potentially higher identity migration coupling,
- cost/region/support/feature fit must be evaluated separately from architecture.

No specialized IdP is selected by this ADR.

#### Option D: Self-hosted authentication platform / framework

Operate a credible identity platform such as Keycloak or another reviewed self-hosted IdP.

Potential benefits:

- strong protocol/configuration control,
- reduced SaaS dependency for the identity control plane,
- mature support for sessions, logout, OTP/WebAuthn/MFA/passwordless capabilities depending configuration.

Costs transferred to GymPulse include:

- deployment and high availability,
- patching/security updates,
- signing-key lifecycle,
- database/storage/backup operations for identity data,
- monitoring and incident response,
- email/SMS integration,
- recovery configuration,
- upgrade/migration compatibility,
- authentication abuse/availability operations.

Self-hosting increases operational ownership; it is not automatically simpler, cheaper, or safer for Phase 1.

#### Option E: Custom GymPulse credential / OTP / session system

Build credential storage/verification, password reset, OTP generation/verification, account recovery, refresh/session tokens, revocation, key rotation, abuse controls, and security incident tooling directly in GymPulse.

Advantages:

- maximum behavioral control,
- no provider API/session-model dependency,
- domain-specific UX can be tailored exactly.

Disadvantages:

- GymPulse becomes directly responsible for security-sensitive commodity authentication infrastructure,
- much larger attack surface and test burden,
- password/OTP/recovery/session implementation and abuse defense become ongoing product infrastructure,
- greater incident-response and key/credential maintenance burden,
- no current Phase 1 requirement justifies taking this ownership.

This option is not recommended for Phase 1 absent a hard requirement a managed provider cannot satisfy.

### 6.2 Staff authentication method posture

Within a managed-provider architecture, the staff sign-in method should remain a provider-managed credential/verification method suitable for web use and recovery.

Credible Phase 1-compatible approaches include:

- managed email/password with provider-owned password storage/recovery,
- email magic-link/passwordless or code-based sign-in where operational UX and abuse risk are acceptable,
- stronger factors/MFA capability for later policy or sensitive-account needs.

Enterprise SSO/social identity is not introduced as a Phase 1 baseline because no current requirement establishes it.

This ADR values MFA/strong-factor **capability** but does not impose an MFA mandate; exact policy remains a separate security decision.

### 6.3 Member authentication method posture

Member verification remains explicitly outside this decision under `D-SEC-002`.

The architecture must be able to support a later approved method such as:

- phone OTP,
- email magic link/code,
- another passwordless verified mechanism,
- another explicitly reviewed member identity method.

Phone OTP remains a candidate, **not an accepted GymPulse member authentication method**.

### 6.4 Session architecture options

#### Session Model 1: Provider-backed secure web session

Use provider-managed identity/session state and server-verifiable provider evidence, transported for staff web through a first-party secure cookie-compatible server boundary.

GymPulse resolves the provider identity to an internal Principal and performs current authorization on every protected request.

#### Session Model 2: GymPulse opaque server session

After provider authentication, create a GymPulse-owned opaque random session identifier stored in a secure browser cookie; GymPulse server-side session state maps to the internal Principal/provider identity.

Benefits include strong local revocation control and limited provider-token exposure to the browser/runtime surface.

Costs include additional durable session storage, cleanup/rotation/availability design, and operational state GymPulse must own.

This remains a strong fallback/hybrid option if provider session semantics cannot meet revocation/browser/topology requirements.

#### Session Model 3: Signed access token + refresh credential

Use signed short-lived access evidence plus a longer-lived refresh credential with rotation/revocation according to the issuer/provider model.

This works well for API/native clients and can support horizontally scaled runtimes, but browser refresh-token storage and revocation semantics require careful design.

It is suitable as a future native path and may also be provider internals behind a secure server-mediated browser session.

#### Session Model 4: Direct browser bearer-token-heavy model

Expose reusable access/refresh credentials directly to browser JavaScript and send them as Authorization bearer tokens to protected APIs, with long-lived credentials persisted in browser-accessible storage.

This avoids cookie CSRF in some topologies but materially increases XSS/token-theft exposure, shifts credential handling to browser JavaScript, and complicates secure refresh/revocation.

This is not recommended as the default staff web architecture.

## 7. Evaluation

### 7.1 Identity provider architecture matrix

| Criterion | A: Managed IdP + GymPulse mapping | B: Integrated managed Auth | C: Specialized managed IdP | D: Self-hosted IdP | E: Custom GymPulse Auth |
|---|---|---|---|---|---|
| Credential-risk ownership | Mostly provider | Mostly provider | Mostly provider | GymPulse operates platform | GymPulse directly owns |
| Server-side verification | Strong provider capability expected | Strong | Strong | Strong if correctly operated | Must be built/maintained |
| Staff web fit | **Strong** | **Strong** | **Strong** | Strong | Possible, highest burden |
| Future native fit | **Strong** with provider support | Strong | **Strong** | Strong | Must be designed |
| Session revocation capability | Provider-dependent, must validate | Supported category; semantics must validate | Supported category; semantics must validate | Configurable/operated by GymPulse | Must be built |
| Recovery capability | Provider-managed primitives | Integrated provider primitives | Dedicated provider primitives | GymPulse config/operations | Must be built securely |
| OTP/passwordless capability | Common provider capability; method still governed | Available candidate capability | Available candidate capability | Available depending configuration | Must be built/integrated |
| MFA capability | Common; policy still separate | Available candidate capability | Available candidate capability | Available depending configuration | Must be built/integrated |
| Abuse-control capability | Provider + app layers | Provider + app layers | Provider + app layers | GymPulse config/edge controls | GymPulse owns full burden |
| Principal mapping independence | **Strong when designed explicitly** | Strong if provider metadata is contained | Strong if provider metadata is contained | Strong | Strong |
| Provider coupling | Moderate | Moderate/High across platform | Moderate/High to identity provider | Runtime/protocol/config coupling | Low vendor coupling, highest code/ops coupling |
| Operational burden | **Low/Moderate** | **Low/Moderate** | Low/Moderate | High | **Highest** |
| Local/test support | Provider-dependent; sandbox/test tenant needed | Often strong integrated tooling | Provider test/development instances | Strong but team-operated | Must be built |
| Security maintenance | Provider + integration review | Provider + integration review | Provider + integration review | GymPulse patch/operate responsibility | GymPulse full responsibility |
| Exit path | Moderate; preserve internal IDs | Moderate; Auth more coupled than DB | Moderate | Moderate; data/config export under team control | High code ownership, difficult security migration |
| Phase 1 complexity | **Strongest overall balance** | Strong if integrated platform later selected | Strong if specialist fit justifies extra provider | Higher than current evidence justifies | Not justified |
| Overall GymPulse fit | **Recommended architecture category** | Strong provider category candidate | Strong provider category candidate | Credible fallback, higher ops | Weak Phase 1 fit |

### 7.2 Session architecture matrix

| Criterion | 1: Provider-backed secure web session | 2: GymPulse opaque server session | 3: Signed access + refresh model | 4: Direct browser bearer-heavy |
|---|---|---|---|---|
| Browser XSS exposure of reusable secret | **Low when HttpOnly** | **Low when HttpOnly** | Depends on storage; low only with server mediation | **Highest** when JS-accessible |
| CSRF implications | Requires explicit CSRF posture | Requires explicit CSRF posture | Bearer header reduces classic cookie CSRF, other browser threats remain | Lower classic cookie CSRF; higher token theft/XSS risk |
| Revocation | Provider semantics + GymPulse current access checks | **Strong local control** | Provider/token semantics; access token may remain valid until expiry | Same token limitations plus browser exposure |
| Server-side verification | Strong if provider contract supports | Strong local lookup + provider linkage | Strong cryptographic verification | Strong cryptographic verification if implemented correctly |
| Horizontal runtime support | Strong with stateless verification / shared provider state | Requires shared durable session store | **Strong** | Strong |
| Provider coupling | Moderate | Low/Moderate after initial identity proof | Moderate | Moderate |
| Future native compatibility | Provider architecture reusable; transport differs | Browser-specific session transport; identity architecture reusable | **Strongest direct native fit** | Possible but unsafe browser baseline |
| Logout | Provider current-session invalidation + cookie clear | Server session invalidate + cookie clear | Refresh/session revoke + credential removal | Token removal plus provider revoke; stolen access token may remain |
| Rotation | Provider/session capability | GymPulse-owned | Provider/issuer rotation | Provider/issuer rotation |
| Operational state | Mostly provider | GymPulse session state | Provider/issuer state + token handling | Provider/issuer state + browser token state |
| Failure behavior | Can use local signature verification where safe | Depends on session store availability | Local verification possible; refresh provider dependency | Similar plus larger client exposure |
| Implementation complexity | **Low/Moderate** | Moderate/High | Moderate/High | Moderate, but worse security posture |
| Phase 1 staff web fit | **Recommended** | Strong fallback/hybrid | Useful provider internals/future native; not browser default | Not recommended |

### 7.3 Why managed authentication is preferred

Credential verification, password storage, OTP generation, reset/recovery, session issuance, signing-key lifecycle, MFA primitives, and identity abuse controls are security-sensitive commodity infrastructure. Current GymPulse requirements demand that they work securely, but they do not establish a unique business need to implement those mechanisms from first principles.

A managed provider reduces direct security/operations ownership while GymPulse retains the business-specific responsibilities that cannot safely be delegated: stable internal identity mapping, tenant/resource scope, named capabilities, Member linkage, audit semantics, and business authorization.

### 7.4 Why provider-backed secure web session is preferred for staff

The staff client is browser-based in current Phase 1 architecture. A first-party server-mediated `HttpOnly`/`Secure` cookie posture:

- keeps long-lived reusable authentication material away from ordinary browser JavaScript,
- fits both co-hosted-web/server and independently deployed API topologies when origin/cookie/CORS/CSRF boundaries are designed deliberately,
- allows the trusted runtime to perform canonical principal resolution and authorization,
- remains compatible with a later provider change through the AuthenticationVerifier/identity mapping boundary.

It creates a CSRF responsibility, which is explicitly addressed rather than ignored.

### 7.5 When a GymPulse opaque server session could be preferred

A GymPulse opaque server session may become preferable if provider-backed browser sessions cannot meet approved requirements for:

- immediate/current-session revocation semantics,
- device/session visibility and administration,
- provider-token containment,
- multi-provider identity normalization,
- deployment/topology constraints,
- recovery/security-response behavior.

Adopting it would add durable session-state infrastructure and should be justified by `D-SEC-004` evidence rather than introduced preemptively.

### 7.6 Why a bearer-heavy browser baseline is not recommended

Persisting long-lived reusable bearer/refresh credentials in browser-accessible storage enlarges the consequence of XSS and makes client code responsible for more credential lifecycle behavior.

GymPulse has no requirement that outweighs the safer first-party secure-cookie posture for staff web.

## 8. Proposed Decision

**Propose a managed-authentication-provider architecture with provider-independent GymPulse identity mapping and principal resolution, combined with a server-mediated secure-cookie posture for Phase 1 staff web.**

If later accepted, the architecture rules are:

1. A managed authentication provider should own credential verification and commodity identity/session infrastructure for human authentication. The exact provider is **not selected by this ADR**.
2. Authentication provider evidence enters GymPulse through an `AuthenticationVerifier`-style integration boundary that verifies and normalizes provider/session evidence.
3. GymPulse maps `provider + immutable provider subject/reference` to a stable internal principal through an explicit AuthIdentity concept.
4. Provider subject IDs, email addresses, and phone numbers do not become universal GymPulse domain IDs.
5. A Member remains a separate business record. Member self-service uses an explicit internal principal-to-member linkage.
6. Protected requests resolve current internal account state after authentication; a disabled/removed staff user is denied even if provider evidence remains technically valid.
7. Tenant/resource scope and named capabilities are resolved from current GymPulse-controlled state under `D-ARCH-015`; provider roles/groups/metadata are not business authorization.
8. Phase 1 staff web should prefer a first-party `HttpOnly`, `Secure`, SameSite-appropriate cookie transport with explicit CSRF defenses and session-fixation/rotation controls.
9. Long-lived reusable bearer/refresh credentials in browser `localStorage` are not the baseline design.
10. Logout must invalidate the current provider/server session where supported and remove browser-held session material; clearing UI state alone is insufficient.
11. The architecture must support revocation, expiry, renewal/rotation, and future concurrent-session/device policy, while exact policy values remain under `D-SEC-004`.
12. If provider stateless access evidence may remain cryptographically valid until expiry after logout/revocation, current GymPulse account/tenant/capability checks still revoke business access. Additional provider-status or GymPulse server-session/revocation state may be adopted later if `D-SEC-004` requires stronger session invalidation guarantees.
13. JWT is not mandatory. If used, the trusted runtime validates signature, algorithm, issuer, audience where applicable, expiry, token use/type, and provider key rotation according to the provider contract.
14. Authentication key/JWKS caching may be used to support safe local verification and provider rotation, but unverifiable protected requests fail closed.
15. Account/identity linking is explicit and security-sensitive; mutable email/phone equality alone does not silently merge principals.
16. Staff recovery and identity-change flows use provider-supported secure recovery/reverification plus GymPulse account checks and auditable sensitive operations where applicable. No manual bypass procedure is authorized here.
17. `D-SEC-002` remains `OPEN`; no member authentication method, including phone OTP, is selected.
18. The architecture remains compatible with a later native member client through a secure token/refresh + OS-secure-storage path if `D-ARCH-013` later approves native delivery. Native delivery is not selected here.
19. Background jobs and provider callbacks keep separate non-human trust contexts; they are not human sessions.
20. Authentication semantics remain framework- and deployment-neutral enough to support either `D-ARCH-006` API topology.

This proposal does **not** select or accept:

- Supabase Auth,
- Clerk,
- Auth0,
- Keycloak,
- any other identity provider,
- phone OTP or another member authentication method,
- exact session/access/refresh/OTP lifetimes,
- a maximum active-device/session count,
- an inactivity timeout,
- a remember-me duration,
- an MFA mandate,
- a password policy implementation,
- Next.js,
- a native member application,
- RLS,
- direct browser/mobile canonical database mutation,
- a database engine,
- a persistence library,
- hosting.

`ADR-0007` remains `Proposed`; canonical `D-ARCH-004` remains `OPEN` until explicit approval evidence is recorded and the decision register is synchronized.

## 9. Security and Privacy Impact

### 9.1 Authentication versus authorization

The most important security boundary remains:

```text
verified provider identity
  -> GymPulse principal
  -> current tenant/resource scope
  -> current named capability
  -> domain rule
```

A provider-issued JWT/session can prove an identity/session fact, but it cannot independently authorize a GymPulse refund, attendance correction, role change, cross-branch read, or other business action.

### 9.2 Credential and session theft

Architecture-level mitigations include:

- TLS for authenticated production traffic,
- `Secure` and `HttpOnly` browser session cookies where compatible,
- narrow cookie scope,
- no long-lived browser `localStorage` bearer baseline,
- provider/server session rotation and revocation capability,
- server-side current account/scope/capability checks,
- re-authentication/step-up capability available for later sensitive-operation policy where justified.

### 9.3 Session fixation

Session state must be accepted/generated through the selected provider/server contract and rotated/re-established across authentication and security-relevant transitions as appropriate. Attacker-chosen pre-authentication session identifiers must not become authenticated sessions without safe regeneration/validation.

### 9.4 CSRF

Cookie-authenticated mutation endpoints require explicit CSRF protection. `HttpOnly` is not a CSRF control, and `SameSite` is defense in depth rather than a universal solution.

Final implementation must validate the complete origin/subdomain/CORS/framework model and use Origin/Referer checks, CSRF tokens/framework mechanisms, fetch metadata, or equivalent controls as appropriate.

### 9.5 XSS

`HttpOnly` limits direct session-cookie theft by JavaScript but cannot prevent malicious same-origin code from acting through the victim's authenticated browser.

Server authorization, safe frontend rendering/dependency controls, CSP where selected later, and sensitive-operation reauthentication capability remain relevant.

### 9.6 Account enumeration

Login, recovery, OTP/magic-link request, member-linking, and reset endpoints should avoid unnecessary disclosure of whether an email/phone/account exists when that would materially aid abuse.

Safe response/error categories should preserve supportability without exposing hidden account/tenant/member relationships.

### 9.7 Abuse controls

`NFR-SECURITY-010` requires an architecture that supports controls around:

- staff login attempts,
- member verification request and verification attempts,
- password reset/recovery,
- magic-link requests,
- OTP requests/verification if later approved,
- QR/auth-sensitive endpoints.

Controls may combine provider and application layers, using appropriate dimensions such as IP/network, account/identifier, device/browser signals, progressive delay, challenge/CAPTCHA when justified, and anomaly monitoring.

This ADR specifies no numerical rate limits or lockout thresholds.

### 9.8 Password handling

If staff password authentication is later selected, credential storage/verification should remain with the managed provider rather than introducing a home-grown GymPulse password database unless a later decision provides exceptional evidence.

This ADR does not design password hashing or password policy implementation.

### 9.9 OTP considerations

If `D-SEC-002` later selects OTP/passwordless for members, the selected architecture must address:

- delivery-provider dependency,
- bounded validity under the later policy,
- single-use/replay resistance,
- attempt/request abuse controls,
- phone reassignment and account-recovery risk,
- SIM-swap/social-engineering risk where relevant,
- delivery failure and support behavior,
- messaging cost abuse,
- identity/contact change verification.

No OTP provider or duration is chosen here.

### 9.10 Account recovery

Recovery must not become a weaker bypass around normal authentication.

Architecture requirements:

- use provider-supported verified recovery where available,
- sensitive contact/credential changes require appropriate re-verification,
- administrative recovery requires explicit authorization and must not be an undocumented impersonation bypass,
- security-sensitive recovery/linking events should be auditable,
- recovery may trigger session revocation/reauthentication according to later policy,
- member phone/email change must preserve stable internal principal/member IDs.

### 9.11 Sensitive logging

Authentication diagnostics must never log:

- passwords,
- OTP codes,
- refresh tokens,
- session secrets,
- Authorization header values,
- complete authentication cookies,
- recovery/magic-link tokens,
- private signing keys.

Safe operational context may include:

- correlation/request ID,
- internal principal ID when known,
- provider/category,
- safe session reference where appropriate,
- redacted/hashed external reference where justified,
- failure category,
- safe tenant/scope context after authorization resolution.

### 9.12 Audit attribution

Sensitive business audit records should identify the stable GymPulse Principal/actor rather than only a mutable email, phone, or display name.

Authentication/session metadata may supplement the audit context when useful, but raw secrets/tokens must never be stored as audit evidence.

### 9.13 Privacy and provider governance

Final provider approval must evaluate:

- email/phone/identity metadata stored by the provider,
- provider regions and residency implications,
- support/admin access,
- provider logs,
- retention/deletion behavior,
- user export/migration capability,
- incident/security terms.

`D-SEC-001`, `D-SEC-005`, and `D-SEC-006` remain unresolved; this ADR does not invent retention or legal policy.

## 10. Reliability, Performance, and Scalability Impact

### 10.1 Valid session does not equal permanent access

GymPulse must not wait for an authentication token to expire before enforcing a changed staff assignment or capability.

Current account/tenant/resource/capability state is checked at the GymPulse boundary for protected operations.

### 10.2 Provider outage isolation

Auth outages can reduce availability of new login, refresh, recovery, or provider administration without corrupting canonical business state.

A protected operation is allowed only when identity evidence can be safely verified and current GymPulse authorization state is available.

No unsafe "temporary trust" mode is introduced.

### 10.3 Local verification and JWKS caching

Where provider evidence is asymmetrically signed, safe local verification using cached current/overlap public keys can reduce provider-call latency and improve tolerance to transient provider/JWKS outages.

Unknown or unverifiable signing keys fail closed after bounded safe refresh attempts according to the selected provider integration.

### 10.4 Revocation consistency

Provider products may have different semantics for revoking refresh/session state versus already-issued access tokens. Acceptance validation must prove the effective GymPulse behavior for:

- logout,
- administrative disable,
- recovery/compromise,
- provider session revoke,
- access token that remains otherwise cryptographically valid.

GymPulse current business authorization is the backstop for removal of tenant/capability access.

### 10.5 Horizontal runtime compatibility

Provider-verified evidence and principal resolution must work across multiple trusted runtime instances without relying on one process's memory.

If a GymPulse opaque server session is later adopted, its durable shared-state availability and cleanup model must be designed before production.

### 10.6 Authentication/principal/authorization caches

Future caching must keep separate:

- public signing-key/JWKS cache,
- external-subject -> internal-principal mapping cache,
- role/capability/scope authorization cache.

The staleness acceptable for one cache is not automatically acceptable for another. Authorization caching in particular must not violate access-removal requirements.

This ADR introduces no cache product.

## 11. Operations and Observability Impact

### 11.1 Authentication events

The eventual implementation should emit privacy-safe operational events/metrics for categories such as:

- login success,
- login failure category,
- logout,
- session/provider revocation,
- expired session denial,
- authentication verification failure,
- unknown signing key / key refresh failure,
- principal-mapping failure,
- duplicate/ambiguous identity mapping,
- internal account-disabled denial,
- recovery/identity-link event,
- abuse/rate-control event.

No observability provider is selected.

### 11.2 Correlation

Authentication/security events should carry request/correlation IDs and stable safe internal identifiers so an incident can be followed across verification, principal resolution, authorization, and the business request without logging credentials/tokens.

### 11.3 Environment separation

Any later provider implementation must separate development/test/staging/production identities, credentials, callback/origin configuration, signing/verifier configuration, and secrets according to `NFR-OPERATIONS-001`/`002`.

Production credentials must not be casually reused in previews or local environments.

### 11.4 Provider administration

Final provider evaluation should include:

- least-privilege administrative roles,
- strong administrator authentication/MFA capability,
- session/user revocation administration,
- audit/admin logs where available,
- key rotation procedures,
- environment/test support,
- incident/support escalation,
- export/exit tooling.

Provider-control-plane compromise is part of the threat model even when application credentials are secure.

## 12. Testing and Validation

Before this ADR becomes an implementation/acceptance gate, non-production validation must cover at least:

1. **Successful staff login** produces verified provider evidence and the expected internal GymPulse principal.
2. **Invalid credentials/evidence** fails without creating an authenticated principal.
3. **Logout current session** invalidates the applicable current provider/server session where supported and removes browser credentials.
4. **Expired session/evidence** is rejected.
5. **Revoked session** is rejected according to the provider/session model and approved policy.
6. **Disabled GymPulse account** is denied even when provider session evidence is otherwise valid.
7. **Staff removed from tenant while session remains valid** loses business access on future protected requests.
8. **Capability changed while session remains valid** uses the new GymPulse capability state.
9. **Provider subject maps to no internal principal** fails closed without guessing/linking.
10. **Duplicate/ambiguous identity mapping** fails closed and exposes an operator-recoverable security/data-quality condition.
11. **Tenant switch/scoping negative tests** prove login/session cannot cross unauthorized gym/branch scope.
12. **Member self-only access proof** proves a verified member cannot access another member's protected records.
13. **Forged token/session evidence** is rejected.
14. **Wrong issuer/audience** is rejected when those claims are part of the selected token contract.
15. **Signing-key rotation** handles old/new overlap and unknown key IDs safely.
16. **Authentication-provider outage** validates login, refresh, cached verification, and fail-closed behavior without corrupting canonical state.
17. **Cookie tampering** does not create/alter an authenticated identity.
18. **CSRF protection** blocks cross-site state-changing requests under the deployed cookie/origin model.
19. **Browser XSS exposure analysis** verifies reusable auth secrets are not unnecessarily readable by JavaScript and documents remaining same-origin action risk.
20. **Recovery flow** verifies identity/recovery semantics, auditability, and session/revocation effects required by later policy.
21. **Email/phone identifier change** preserves the stable internal principal/Member link and requires appropriate reverification.
22. **Authentication abuse/rate controls** exercise provider/application handling for login/recovery/member-verification abuse without relying on fabricated thresholds.
23. **Concurrent sessions** prove the provider/session architecture can support whichever concurrency policy `D-SEC-004` later adopts.
24. **Future native secure-storage feasibility** proves the provider can support a secure native token/refresh flow without changing GymPulse principal/authorization semantics if native is later approved.
25. **Explicit identity linking** proves a second auth method cannot silently attach to an existing principal merely because mutable contact data matches.
26. **Provider migration proof** demonstrates subject remapping/forced-reauthentication implications without changing internal principal IDs or tenant/member links.
27. **Secret/log scan** verifies passwords, OTPs, tokens, cookies, Authorization headers, recovery tokens, and signing secrets are absent from application logs/client bundles.
28. **Web/API topology proof** demonstrates the same canonical principal/authz semantics in the likely co-hosted and/or independently deployed trusted runtime shape under `D-ARCH-006`.

No tests or implementation spike are created by Task 0015.

## 13. Migration and Rollout

There is no authentication/session implementation to migrate today.

If this ADR and dependent decisions are later approved, rollout should remain evidence-driven:

```text
approve authentication architecture + dependent security policies
  -> select provider through explicit provider evidence/review
  -> create isolated non-production identity environment
  -> implement AuthenticationVerifier adapter
  -> implement AuthIdentity -> Principal mapping
  -> implement staff secure-session transport
  -> verify current account/scope/capability checks
  -> verify logout/revocation/recovery/key rotation/CSRF/XSS posture
  -> run tenant/member negative authorization tests
  -> pilot with non-production/test identities
  -> approve production provider/region/security configuration
  -> production rollout with documented recovery/revocation runbooks
```

Do not auto-link existing Member records to external identities solely by matching mutable phone/email during migration. Linking/import requires an explicit reconciliation/reverification workflow.

Do not introduce direct client mutation of canonical business data as part of authentication rollout.

Member authentication rollout follows the later `D-SEC-002` decision; it is not included here.

## 14. Reversibility and Provider Exit

Authentication has higher migration coupling than ordinary managed database hosting because credentials, identities, factors, sessions, recovery state, provider links, and signing semantics can be provider-specific.

GymPulse should minimize provider migration blast radius by preserving:

```text
internal principal IDs
tenant/gym/branch assignments
named-capability assignments
member-self links
business data
audit history
application/domain rules
```

Provider migration should be localized mainly to:

- AuthIdentity provider/subject mappings,
- credential migration where the provider legally/technically supports it,
- recovery/reverification when credential migration is impossible,
- provider session invalidation,
- forced reauthentication where necessary,
- provider-specific browser/native integration adapters.

A provider change must not require rewriting Attendance, Memberships, Payments, Retention, or Audit actor references from one provider subject ID to another.

Provider exit evaluation must document:

- user/identity export capability,
- credential/hash/factor portability limits,
- session invalidation requirements,
- subject remapping approach,
- signing-key/token consequences,
- member recovery implications,
- administrator/audit export needs,
- deletion/retention requirements.

Forced reauthentication during provider migration is an acceptable architectural possibility and must be planned rather than hidden.

## 15. Threats, Risks, and Mitigations

| Threat / risk | Architecture mitigation / open policy |
|---|---|
| Credential compromise | Prefer managed credential infrastructure; TLS; provider abuse/security controls; recovery and revocation; stronger-factor capability where later policy requires |
| Session theft | `HttpOnly`/`Secure` cookie posture for staff; narrow scope; rotation; no long-lived `localStorage` bearer baseline |
| Token/session replay | Provider/session revocation and rotation where supported; bounded evidence lifetime under `D-SEC-004`; current GymPulse access checks |
| Session fixation | Strict provider/server session acceptance; rotate/regenerate around authentication/security transitions |
| CSRF | SameSite defense in depth plus Origin/Referer/framework/token/fetch-metadata controls appropriate to final topology; no state-changing GET |
| XSS impact on authentication | Keep reusable session secrets out of browser JS when possible; server authz remains mandatory; frontend XSS defenses remain required |
| Account enumeration | Safe/generic login/recovery/member-verification responses where material; minimize tenant/member existence leakage |
| Credential stuffing | Provider + application abuse controls, monitoring, progressive challenge/delay where justified; no invented thresholds |
| OTP request/verification abuse | Govern under `D-SEC-002`; rate/challenge/cost/replay controls required if later selected |
| Recovery abuse / account takeover | Provider-supported recovery, reverification, explicit admin authorization, audit, session revocation/reauth according to later policy |
| Automatic account linking takeover | Never auto-link solely on mutable email/phone equality; require explicit verified linking |
| Cross-tenant access after valid login | Resolve current GymPulse tenant/resource scope + named capability for every protected operation |
| Stale authorization after role removal | Current GymPulse assignments/account state control access; do not wait for provider token expiry |
| Provider role/JWT metadata becomes authorization | Provider claims are identity/session inputs only; canonical business authorization remains GymPulse-owned |
| Provider signing-key rotation | Validate issuer/audience/algorithm; use JWKS/key caching and safe refresh; fail closed when unverifiable |
| Provider outage | Permit only safely verifiable existing evidence where policy/provider contract allows; new login/refresh may fail; no bypass |
| Provider control-plane compromise | Least-privilege admin access, strong admin authentication/MFA capability, environment separation, key/secret rotation, audit/admin review |
| Server secret leakage | Server-only boundaries, environment separation, no client bundle exposure, no secret logging |
| Browser cookie tampering | Cryptographic/provider/server validation of evidence; never trust raw cookie identity fields |
| Native credential theft | If native later approved, OS secure storage + provider-recommended rotation/revocation/PKCE; no native implementation selected here |
| Custom-auth maintenance risk | Do not take on custom password/OTP/session infrastructure without exceptional evidence and separate review |

## 16. Open Questions

- Who is the authorized decision owner for `D-ARCH-004`?
- Which managed authentication provider category/provider best satisfies the approved architecture after jurisdiction, recovery, session, support, environment, and exit requirements are known?
- What staff primary sign-in method gives the best Phase 1 security/operability tradeoff: managed email/password, magic-link/passwordless, or another verified managed method?
- Will staff MFA be optional, risk-based, required for some sensitive roles, or required broadly? This ADR does not decide it.
- What member verification method will `D-SEC-002` approve?
- What exact access/session/refresh lifetime, inactivity, remember-me, concurrent-device, and revocation policy will `D-SEC-004` approve?
- Does `D-SEC-004` require stronger immediate invalidation than provider-backed stateless access evidence can provide, making a GymPulse opaque server session/revocation registry preferable?
- What identity-linking/recovery authority is allowed when staff and Member relationships overlap?
- What launch jurisdiction/provider region and identity-data obligations will `D-SEC-001` establish?
- What deletion/export/retention rules will `D-SEC-005` and `D-SEC-006` establish for AuthIdentity/provider data and security audit history?
- Which `D-ARCH-006` API deployment shape will determine the final cookie origin/CORS/CSRF configuration?
- What provider admin/audit APIs and operational support level are required before production?
- What account-recovery and security-response runbooks are required for the pilot?

## 17. Decision Evidence

### 17.1 Repository evidence

Current structured GymPulse documentation establishes:

- staff authentication is required,
- member protected access requires verified identity but the method is open,
- session termination/revocation/expiry capability is required,
- authentication and authorization are separate,
- provider identity maps to a GymPulse Principal,
- tenant/resource scope and named capability are evaluated server-side,
- one principal may have multiple scoped assignments,
- provider claims/roles are not canonical business authorization,
- a removed role must deny future operations,
- Member and Auth/User identity are currently proposed as separate concepts,
- API deployment and client frameworks remain unresolved,
- selective managed infrastructure is proposed while Auth remains separately governed.

No repository evidence establishes a provider, phone OTP, exact session TTL, MFA mandate, direct-client database access, or a custom GymPulse credential system as an accepted decision.

### 17.2 Current official security and provider research

Research date: `2026-09-06`.

Security guidance checked:

- OWASP Authentication Cheat Sheet: authentication, recovery, reauthentication, TLS, and account-security guidance.
- OWASP Session Management Cheat Sheet: session-token sensitivity, secure cookies, session rotation/fixation, timeout/termination principles, and cookie scope.
- OWASP Cross-Site Request Forgery Prevention Cheat Sheet: SameSite as defense in depth, Origin/Referer validation, CSRF tokens/framework protections, and the fact that XSS can defeat CSRF mitigations.
- IETF RFC 8725 (JWT Best Current Practices): algorithm verification, issuer/subject binding, audience validation, and token-type validation.
- IETF RFC 9700 (OAuth 2.0 Security Best Current Practice): modern OAuth security guidance including authorization-server metadata, TLS, and token audience/restriction principles.

Representative provider research checked current official documentation for:

- **Supabase Auth**: provider-managed sessions using access/refresh evidence, session termination/sign-out scopes, signing-key/JWT verification and rotation, passwordless/phone authentication capability, MFA capability, and Auth-user migration considerations.
- **Clerk**: server-side session JWT verification, session revocation, MFA/recovery behavior, passwordless email/SMS capabilities, and migration/export guidance.
- **Auth0**: JWKS/token verification support, refresh-token revocation, passwordless/MFA capability, and user import/export tooling.
- **Keycloak**: self-hosted OIDC/session administration, configurable session/token timeout and refresh-revocation capability, logout/session revocation, OTP/WebAuthn/MFA/passwordless options.

Material conclusions:

1. Managed and self-hosted identity products can all provide credible server-verifiable identity/session primitives; the architectural differentiator is responsibility/operational ownership, not whether authentication is technically possible.
2. Session revocation semantics vary. Revoking provider refresh/session state does not universally imply that every already-issued stateless access token becomes unusable immediately. GymPulse must therefore validate provider semantics and separately enforce current internal account/tenant/capability state.
3. Asymmetric JWT verification requires safe issuer/audience/algorithm validation and signing-key/JWKS rotation handling.
4. Passwordless/OTP and MFA are widely available **capabilities** across providers. Their availability is not evidence that GymPulse has selected phone OTP or mandated MFA.
5. Identity/session export and migration are provider-specific and can require session invalidation or forced reauthentication. Stable GymPulse principal IDs materially reduce provider exit impact.
6. Self-hosted identity platforms remain credible but transfer patching, availability, key/session operations, recovery integration, abuse controls, and security maintenance to GymPulse.
7. No current evidence justifies building a custom password/OTP/session system for Phase 1.

Primary references:

- <https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html>
- <https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html>
- <https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html>
- <https://www.rfc-editor.org/rfc/rfc8725.html>
- <https://www.rfc-editor.org/info/rfc9700/>
- <https://supabase.com/docs/guides/auth/sessions>
- <https://supabase.com/docs/guides/auth/signout>
- <https://supabase.com/docs/guides/auth/signing-keys>
- <https://supabase.com/docs/guides/auth/auth-mfa>
- <https://supabase.com/docs/guides/auth/phone-login>
- <https://supabase.com/docs/guides/troubleshooting/migrating-auth-users-between-projects>
- <https://clerk.com/docs/guides/sessions/manual-jwt-verification>
- <https://clerk.com/docs/reference/backend/sessions/revoke-session>
- <https://clerk.com/docs/guides/secure/mfa-recovery>
- <https://auth0.com/docs/api/authentication/revoke-refresh-token/revoke-refresh-token>
- <https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-key-sets>
- <https://auth0.com/docs/authenticate/passwordless/authentication-methods>
- <https://www.keycloak.org/docs/latest/server_admin/>

### 17.3 Missing acceptance evidence

This ADR remains `Proposed` and `D-ARCH-004` remains `OPEN` because:

- no authorized decision owner/approval evidence exists,
- no provider has been selected or validated in a GymPulse non-production integration,
- `D-SEC-002` member authentication remains Open,
- `D-SEC-004` exact session policy remains Open,
- `D-SEC-001` jurisdiction/privacy remains Open,
- no provider-specific revocation/key-rotation/recovery/exit test has been run,
- no cookie/CSRF/deployment topology has been validated,
- no implementation exists to demonstrate the principal mapping and stale-authorization behavior.

## 18. Related Documents

- `../README.md`
- `../00-overview/assumptions.md`
- `../01-product/functional-requirements.md`
- `../01-product/non-functional-requirements.md`
- `../01-product/user-roles.md`
- `../01-product/personas.md`
- `../01-product/user-journeys.md`
- `../02-architecture/architecture-principles.md`
- `../02-architecture/architecture-overview.md`
- `../02-architecture/system-context.md`
- `../02-architecture/container-architecture.md`
- `../02-architecture/component-architecture.md`
- `../02-architecture/data-flow.md`
- `../02-architecture/technology-stack.md`
- `README.md`
- `ADR-0002-primary-language-runtime.md`
- `ADR-0003-monorepo-strategy.md`
- `ADR-0006-managed-backend-responsibilities.md`
- legacy migration sources: `../02-user-roles-permissions.md`, `../03-user-flows.md`, `../05-system-architecture.md`, `../12-security-audit.md`, `../16-open-decisions.md`
