# Task 0015: Draft Authentication / Session Architecture ADR

## Goal

Draft one `Proposed` ADR under canonical decision `D-ARCH-004` that defines a secure provider-independent authentication, identity-mapping, principal-resolution, and session architecture for GymPulse Phase 1 without selecting/provisioning an authentication provider, selecting a member authentication method, or inventing exact session policy.

Canonical target:

`docs/adr/ADR-0007-authentication-session-architecture.md`

## Inputs Read

Current repository inputs:

- `.ai/README.md`
- `.ai/current-state.md`
- `.ai/task/0014-draft-managed-backend-responsibilities-adr.md`
- `docs/README.md`
- `docs/00-overview/assumptions.md`
- `docs/01-product/functional-requirements.md`
- `docs/01-product/non-functional-requirements.md`
- `docs/01-product/user-roles.md`
- `docs/01-product/personas.md`
- `docs/01-product/user-journeys.md`
- `docs/02-architecture/architecture-principles.md`
- `docs/02-architecture/architecture-overview.md`
- `docs/02-architecture/system-context.md`
- `docs/02-architecture/container-architecture.md`
- `docs/02-architecture/component-architecture.md`
- `docs/02-architecture/data-flow.md`
- `docs/02-architecture/technology-stack.md`
- `docs/adr/README.md`
- `docs/adr/ADR-0002-primary-language-runtime.md`
- `docs/adr/ADR-0003-monorepo-strategy.md`
- `docs/adr/ADR-0006-managed-backend-responsibilities.md`

Other existing ADRs were considered through the current ADR index/dependency state where their proposed decisions matter. Legacy flat sources were not required to change the bounded architecture because current structured docs already contained the controlling identity/authorization rules; they remain migration/evidence sources only.

Current official research was checked on `2026-09-06` using primary OWASP/IETF guidance and representative provider documentation for Supabase Auth, Clerk, Auth0, and Keycloak.

## Repository State Verified

Before creation:

- `docs/adr/ADR-0007-authentication-session-architecture.md` did not exist on latest `main`.
- `.ai/task/0015-draft-authentication-session-architecture-adr.md` did not exist.
- `D-ARCH-004` remained `P0 OPEN` in `docs/00-overview/assumptions.md`.
- `D-ARCH-004` remained the next bounded item in the ordered ADR backlog after `ADR-0006`.
- `ADR-0001` through `ADR-0006` remained `Proposed`; none was Accepted.
- repository search found no newer authorized approval evidence for `D-ARCH-004`.
- `D-SEC-002` remained `P0 OPEN`.
- `D-SEC-004` remained `P1 OPEN`.
- `D-ARCH-015` remained `P0 PROPOSED`.
- `D-ARCH-014` remained canonically `P0 OPEN` even though `ADR-0006` is Proposed.
- `D-DATA-004` remained `P1 PROPOSED`.
- no newer requirement change contradicted the existing identity/principal/authorization architecture.

Actual repository state matched the Task 0015 instruction.

## Canonical Decision State

```text
D-ARCH-004
Priority: P0
Status: OPEN
Decision: Authentication/session strategy supporting staff web and member access
Required capabilities: revocation, expiry, server-side identity verification, server-side principal resolution
```

`ADR-0007` is drafted as `Proposed`, but this task does not change `D-ARCH-004` to `PROPOSED` or `DECIDED`.

## Identity Requirements

The architecture preserves:

```text
Authentication Evidence
  -> Authentication Verification
  -> External Identity Resolution
  -> GymPulse AuthIdentity Mapping
  -> GymPulse Principal Resolution
  -> Current Account / Tenant Relationship Check
  -> Tenant / Resource / Capability Authorization
  -> Application Use Case
```

Key requirements:

- provider identity is not GymPulse authorization,
- provider subject IDs are mapping references, not domain IDs,
- `AuthIdentity`, internal Principal/User, and Member are distinct concepts,
- mutable email/phone values do not become stable canonical business identity,
- tenant assignments and capabilities come from current GymPulse-controlled state,
- a cryptographically valid provider session cannot preserve business access after staff/account/scope/capability removal,
- identity linking is explicit and must not silently merge accounts based only on matching mutable contact fields,
- stable GymPulse principal IDs support audit attribution and provider migration.

## Session Requirements

The selected session model must support:

- expiry,
- renewal/refresh where applicable,
- current-session logout,
- revocation,
- rotation where applicable,
- secure browser/native storage appropriate to the client,
- provider signing-key rotation,
- fail-closed verification,
- future concurrent-session/device policy,
- horizontally scalable trusted runtimes,
- current GymPulse account/scope/capability checks independent of provider token/session lifetime.

Exact lifetime, inactivity, remember-me, active-device, MFA, and revocation-SLA values remain outside Task 0015.

## Related Security Decisions

Kept separate:

```text
D-SEC-002  Member authentication/verification method       P0 OPEN
D-SEC-004  Exact session lifecycle/device policy           P1 OPEN
D-ARCH-015 Authorization implementation boundary           P0 PROPOSED
D-SEC-008  Data-layer/RLS tenant isolation                 OPEN when applicable
D-SEC-001  Jurisdiction/privacy                            P0 OPEN
D-SEC-005  Data deletion/export workflow                   P1 OPEN
D-SEC-006  Retention policy                                P1 OPEN
```

Task 0015 does not select phone OTP, exact TTLs, MFA mandates, device limits, RLS, or a privacy/retention policy.

## Architecture Options Evaluated

1. **Managed authentication provider + GymPulse Principal mapping**: managed credential/session infrastructure with GymPulse-owned AuthIdentity mapping, principal resolution, tenant assignments, capabilities, Member links, authorization, and audit semantics.
2. **Integrated managed-backend Auth**: Supabase Auth as a representative integrated candidate if later platform decisions support it; no Supabase acceptance.
3. **Specialized managed IdP**: Clerk/Auth0 as representative managed identity candidates; provider selection remains open.
4. **Self-hosted identity platform**: Keycloak as representative capability model; greater patching/availability/key/recovery/security operations transfer to GymPulse.
5. **Custom GymPulse credentials/OTP/session implementation**: full direct ownership of security-sensitive commodity infrastructure; not justified by current Phase 1 evidence.

The strongest current architecture category is managed authentication with explicit GymPulse identity/principal mapping, independent of exact provider.

## Session Models Evaluated

1. provider-backed secure web session,
2. GymPulse opaque server-side session,
3. signed access evidence + refresh credential model,
4. direct browser bearer-token-heavy model.

The strongest Phase 1 staff-web posture is provider-backed identity/session evidence transported through a first-party server-mediated secure cookie-compatible boundary.

A GymPulse opaque server session remains a strong fallback/hybrid if later `D-SEC-004` revocation/device/session guarantees cannot be met safely by provider-backed semantics alone.

Signed access/refresh evidence is particularly relevant for a possible future native client. A browser bearer-heavy/localStorage baseline is not recommended.

## Current Provider Research

Research date: `2026-09-06`.

Primary security guidance reviewed:

- OWASP Authentication Cheat Sheet,
- OWASP Session Management Cheat Sheet,
- OWASP CSRF Prevention Cheat Sheet,
- IETF RFC 8725 JWT Best Current Practices,
- IETF RFC 9700 OAuth 2.0 Security Best Current Practice.

Representative provider documentation reviewed:

- Supabase Auth sessions, signout, signing keys/JWT verification, MFA, phone/passwordless capability, Auth migration,
- Clerk server-side JWT/session verification, session revocation, MFA recovery, passwordless and migration guidance,
- Auth0 JWKS/token verification, refresh-token revocation, passwordless/MFA and user export/import capability,
- Keycloak current server administration/session revocation/timeouts/refresh-token/OTP/WebAuthn capability.

Research establishes credible managed/self-hosted options, not a selected provider.

## Proposed Direction

`ADR-0007` proposes:

```text
Managed Authentication Provider
  + provider-independent AuthIdentity mapping
  + GymPulse Principal resolution
  + current GymPulse account/tenant/resource/capability checks
  + server-owned GymPulse business authorization
  + secure first-party staff web session transport
  + future native token path if native is later approved
```

No vendor is selected.

## Principal Mapping Model

Conceptually:

```text
External Provider Identity
  -> provider + immutable subject
  -> AuthIdentity mapping
  -> stable GymPulse Principal
  -> explicit staff assignments and/or Member self link
  -> current tenant/resource/capability authorization
```

Provider roles/groups/custom claims do not become canonical business authorization.

A Member remains a gym business record separate from authentication identity.

## Staff Web Session Posture

Recommended posture:

- first-party server-mediated session transport,
- `HttpOnly` cookie where compatible,
- `Secure` production cookie,
- explicit SameSite posture,
- narrow domain/path scope,
- HTTPS only,
- session rotation/fixation controls,
- current-session invalidation on logout where provider/server supports it,
- explicit CSRF protection using origin/framework/token/fetch-metadata controls as appropriate,
- no long-lived reusable bearer/refresh credential in browser `localStorage` as the baseline.

Exact cookie/session expiration remains governed by `D-SEC-004`.

## Future Native Compatibility

No native member client is selected.

If later approved under `D-ARCH-013`, the identity architecture remains compatible with:

- short-lived access evidence,
- refresh/re-auth credential in OS secure storage,
- PKCE where OAuth/OIDC authorization-code flows are used,
- deep-link/universal-link/app-link validation,
- rotation/revocation/logout,
- the same server-side GymPulse Principal and authorization model.

## Revocation / Logout Model

Two layers remain distinct:

1. authentication/session revocation at the provider or any later GymPulse session layer,
2. immediate/current business-access denial from current GymPulse account/tenant/capability state.

`FR-IDENTITY-002` requires current-session termination. Logout must not be UI-only; it must invalidate the applicable current provider/server session where supported and remove browser credentials.

Provider access-token revocation semantics must be validated because an already-issued stateless access token may remain cryptographically valid until expiry even after refresh/session revocation. Current GymPulse account/scope/capability checks remain mandatory.

No numerical revocation SLA or token TTL was defined.

## Recovery Boundary

Recovery is security-sensitive and must not become an undocumented bypass.

Required posture:

- use provider-supported verified recovery where possible,
- require appropriate reverification for sensitive contact/credential changes,
- admin-assisted recovery requires explicit authorization and auditability,
- identity linking is explicit,
- mutable email/phone matching alone does not merge accounts,
- recovery may trigger session revocation/reauthentication according to later policy.

No manual bypass procedure was authorized.

## Threat Model Findings

Primary threats considered:

- credential compromise,
- session theft,
- token/session replay,
- session fixation,
- CSRF,
- XSS impact on auth material,
- account enumeration,
- credential stuffing,
- OTP abuse,
- recovery abuse/account takeover,
- automatic account-linking takeover,
- cross-tenant access after valid login,
- stale authorization after role/scope change,
- provider-role/claim overreach,
- provider signing-key rotation,
- provider outage,
- provider control-plane compromise,
- server secret leakage,
- browser cookie tampering,
- future native credential theft,
- custom-auth security maintenance risk.

The core mitigation is to keep authentication evidence, stable GymPulse identity, current authorization, and business operation as separate verified boundaries.

## Abuse-Control Requirements

`NFR-SECURITY-010` requires architecture support for provider/application abuse controls around login, verification, password reset/recovery, magic-link request, future OTP request/verification if selected, and other auth-sensitive endpoints.

Possible controls include IP/network, account/identifier and device/browser dimensions, progressive delay, provider protections, challenge/CAPTCHA where justified, and anomaly monitoring.

No numerical rate limits or lockout thresholds were invented.

## Provider Portability

Provider exit should preserve:

- internal principal IDs,
- tenant/gym/branch assignments,
- capabilities,
- Member links,
- audit history,
- business/domain data.

Provider-specific migration should be concentrated in AuthIdentity subject mappings, credential/factor migration where technically possible, session invalidation, forced reauthentication where needed, and provider adapter/client UX integration.

A provider change must not require rewriting business-domain actor identity from one provider subject to another.

## Decisions Kept Separate

```text
D-ARCH-014  managed backend responsibilities       OPEN / ADR-0006 Proposed
D-SEC-002   member authentication method           OPEN
D-SEC-004   exact session lifecycle policy         OPEN
D-ARCH-015  authorization implementation           PROPOSED
D-SEC-008   RLS/data-layer tenant isolation        OPEN when applicable
D-ARCH-006  API deployment topology                OPEN
D-ARCH-012  Owner/Staff web framework              PROPOSED
D-ARCH-013  member client strategy                 PROPOSED
D-ARCH-009  hosting                                OPEN
D-SEC-001   jurisdiction/privacy                   OPEN
D-DATA-004  Member vs User/AuthIdentity separation PROPOSED
```

Also not accepted: Supabase Auth, Clerk, Auth0, Keycloak, PostgreSQL, Drizzle, Next.js, native member delivery, MFA policy, or phone OTP.

## Requirement IDs Referenced

No requirement definition changed.

Functional requirements referenced:

- `FR-IDENTITY-001..003`
- `FR-AUTHZ-001..004`
- `FR-AUDIT-001,003`
- `FR-CROSS-001,003`

Non-functional requirements referenced:

- `NFR-SECURITY-001..005`
- `NFR-SECURITY-009..011`
- `NFR-PRIVACY-001,005,006`
- `NFR-TESTABILITY-004`
- `NFR-OBSERVABILITY-001..003,007`
- `NFR-OPERATIONS-001,002,004`
- `NFR-MAINTAINABILITY-005,006`

## Validation Required

Before acceptance/provider binding, validate at least:

1. successful staff login,
2. invalid credentials/evidence,
3. logout current session,
4. expired session,
5. revoked session,
6. disabled GymPulse account,
7. staff removed from tenant while session remains valid,
8. capability changed while session remains valid,
9. provider subject with no internal principal,
10. duplicate/ambiguous identity mapping,
11. tenant-switch/scoping negative tests,
12. member self-only access proof,
13. forged token/session evidence,
14. wrong issuer/audience,
15. signing-key rotation,
16. provider outage,
17. cookie tampering,
18. CSRF protection,
19. browser XSS exposure analysis,
20. recovery flow,
21. email/phone identifier change,
22. authentication rate/abuse behavior,
23. concurrent sessions,
24. future native secure-storage feasibility,
25. explicit identity-linking safety,
26. provider migration/subject remapping,
27. secret/log leakage checks,
28. compatibility with the selected future web/API deployment topology.

No validation test or spike was implemented during Task 0015.

## Files Changed

Created:

- `docs/adr/ADR-0007-authentication-session-architecture.md`
- `.ai/task/0015-draft-authentication-session-architecture-adr.md`

Continuity/index updates authorized for this task:

- `docs/adr/README.md`
- `docs/README.md`
- `.ai/current-state.md`

No other canonical file required modification because no contradiction was discovered.

## Open Questions

- Who owns final approval for `D-ARCH-004`?
- Which managed provider/provider category will eventually satisfy GymPulse identity/session requirements?
- What staff sign-in method will be approved?
- Will any staff MFA requirement be approved later?
- What member authentication method will `D-SEC-002` approve?
- What exact session/device/revocation policy will `D-SEC-004` approve?
- Does stronger immediate session invalidation later require a GymPulse opaque server-session/revocation layer?
- Which identity-link/recovery operations can be administrator-assisted and under what authority?
- Which jurisdiction/provider regions are acceptable under `D-SEC-001`?
- What provider administration/audit/support capabilities are required?
- Which `D-ARCH-006` deployment topology will determine final cookie origin/CORS/CSRF configuration?

## Result

`ADR-0007` now exists as a `Proposed` authentication/session architecture recommendation.

The proposed architecture uses a managed authentication provider category, provider-independent AuthIdentity mapping, stable GymPulse Principal resolution, current GymPulse authorization state, and a secure server-mediated staff-web session posture.

Canonical `D-ARCH-004` remains `OPEN`.

`D-SEC-002` and `D-SEC-004` remain `OPEN`.

No authentication provider, member OTP method, exact session policy, MFA requirement, framework, native client, RLS model, SDK, code, schema, migration, secret, callback, or infrastructure was selected/provisioned/created.

## Next Recommended Task

After index/current-state synchronization, re-check `docs/adr/README.md`, `docs/00-overview/assumptions.md`, and `.ai/current-state.md`.

If the dependency queue remains unchanged, the expected next bounded task is:

```text
Task 0016: Draft Member Authentication / Verification Method ADR
Primary decision: D-SEC-002
Likely target: docs/adr/ADR-0008-member-authentication-method.md
Initial ADR status: Proposed
Canonical D-SEC-002 status should remain OPEN unless explicit approval evidence exists
```

Do not create ADR-0008 or execute Task 0016 during Task 0015.
