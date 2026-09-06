# GymPulse Current State

## Project

`GymPulse` (`im-tnyx/gym-pulse`)

## Current Documentation Phase

`Phase 4 - System Architecture / Architecture Governance`

## Canonical Architecture Completed at Draft Level

```text
docs/02-architecture/architecture-principles.md
docs/02-architecture/architecture-overview.md
docs/02-architecture/system-context.md
docs/02-architecture/container-architecture.md
docs/02-architecture/component-architecture.md
docs/02-architecture/data-flow.md
docs/02-architecture/technology-stack.md
docs/adr/README.md
```

## Current ADR State

```text
ADR-0001  D-ARCH-005  Phase 1 architecture style                Proposed
ADR-0002  D-ARCH-016  Primary language/runtime                  Proposed
ADR-0003  D-ARCH-001  Repository/workspace strategy             Proposed
ADR-0004  D-ARCH-002  Canonical database engine                 Proposed
ADR-0005  D-ARCH-017  Data access/query/transaction/migrations  Proposed
ADR-0006  D-ARCH-014  Managed backend/platform responsibilities Proposed
ADR-0007  D-ARCH-004  Authentication/session architecture       Proposed
```

No authorized approval evidence exists for these ADRs. None is `Accepted`.

Canonical decision status remains controlled by `docs/00-overview/assumptions.md`:

```text
D-ARCH-005 remains PROPOSED
D-ARCH-016 remains PROPOSED
D-ARCH-001 remains PROPOSED
D-ARCH-002 remains PROPOSED
D-ARCH-017 remains PROPOSED
D-ARCH-014 remains OPEN
D-ARCH-004 remains OPEN
```

A `Proposed` ADR does not itself promote its canonical decision to `PROPOSED` or `DECIDED`.

## Current Authentication / Session Position

`ADR-0007` proposes a **managed authentication provider architecture category** while keeping provider identity/session infrastructure separate from GymPulse business identity and authorization.

Proposed trust chain:

```text
Authentication Evidence
  -> Authentication Verification
  -> provider + immutable subject
  -> GymPulse AuthIdentity mapping
  -> stable GymPulse Principal
  -> current internal account eligibility
  -> server-validated tenant/resource scope
  -> current named capability
  -> allow / deny
  -> application/domain operation
```

Mandatory boundaries:

```text
Authentication != Authorization
Provider Identity != GymPulse Principal
GymPulse Principal != Member
Valid Authentication Session != Permanent Business Access
```

Current proposal:

- a managed authentication provider may own credential/identity/session commodity infrastructure,
- exact provider remains unselected,
- `AuthIdentity` maps provider + immutable subject/reference to a stable internal Principal concept,
- provider roles/groups/custom JWT claims/metadata do not become canonical GymPulse business authorization,
- current GymPulse account/tenant/branch/capability state controls access even while provider session evidence remains cryptographically valid,
- Member remains a separate gym business record linked explicitly to an internal Principal for self-service,
- mutable phone/email is not the stable Member/Principal identifier,
- staff and member relationships may coexist for one person without automatically merging authorization scopes,
- identity linking/recovery is explicit and security-sensitive,
- background jobs and provider callbacks retain separate non-human trust contexts.

## Staff Web Session Posture

Leading Phase 1 staff-web posture in `ADR-0007`:

```text
managed provider identity/session evidence
  + first-party trusted GymPulse server boundary
  + HttpOnly cookie where compatible
  + Secure production transport
  + explicit SameSite posture
  + narrow cookie scope
  + explicit CSRF defense
  + session fixation/rotation controls
  + current-session invalidation on logout where supported
```

Long-lived reusable bearer/refresh credentials in browser `localStorage` are not the baseline design.

`HttpOnly` does not solve CSRF. Final implementation must use deployment/framework-appropriate SameSite + Origin/Referer and/or CSRF-token/framework/fetch-metadata controls.

No cookie name, domain, exact expiry, token TTL, inactivity window, remember-me duration, or device count is selected.

## Future Native Compatibility

`D-ARCH-013` remains `PROPOSED`; no native member client is selected.

If native delivery is later approved, the same Principal/authorization architecture can support a native-specific session transport using short-lived access evidence, refresh/re-auth credentials in OS secure storage, provider-recommended PKCE where applicable, callback/deep-link validation, rotation, and revocation.

No native credential TTL or implementation is selected.

## Revocation / Logout Position

Two layers remain distinct:

1. provider/GymPulse session revocation where the selected session model supports it,
2. current GymPulse business-access denial through internal account/tenant/resource/capability state.

`FR-IDENTITY-002` requires current-session termination. Logout must not merely clear visible UI state while leaving reusable credentials active.

Provider revocation semantics must be validated because already-issued stateless access evidence may remain cryptographically valid until expiry after some provider session/refresh revocations.

Exact revocation propagation target and session policy remain governed by `D-SEC-004`.

## Member Authentication Boundary

`D-SEC-002` remains `P0 OPEN`.

Phone OTP/passwordless remains a candidate only. Task 0015 did not select:

```text
phone OTP
email magic link/code
passwordless method
OTP provider
OTP expiry
OTP retry/request limits
member recovery method
```

Task 0016 should decide the member verification method inside the Principal/session architecture proposed by `ADR-0007`.

## Session Lifecycle Boundary

`D-SEC-004` remains `P1 OPEN`.

Task 0015 defines required session capabilities but not exact policy values:

```text
expiry
refresh/renewal where applicable
logout
revocation
rotation
concurrent-session support
future device/session visibility
provider signing-key rotation
fail-closed verification
```

No access-token TTL, refresh-token TTL, inactivity timeout, remember-me duration, maximum active devices, or MFA mandate was selected.

## Current Managed Platform Position

`ADR-0006` remains `Proposed`; canonical `D-ARCH-014` remains `OPEN`.

The managed-platform posture remains:

```text
Managed Infrastructure != Application Architecture
Managed Backend != Domain Layer
Provider Feature != Canonical Business Rule
```

Supabase is an integrated-platform candidate only and is not accepted or provisioned. Task 0015 evaluated Supabase Auth as one representative integrated Auth candidate, Clerk/Auth0 as representative specialized managed identity candidates, and Keycloak as a representative self-hosted alternative. No provider was selected.

Direct browser/mobile canonical database mutation remains unapproved.

## Current Persistence Position

`ADR-0004` proposes PostgreSQL; `D-ARCH-002` remains `PROPOSED`.

`ADR-0005` proposes a Drizzle-oriented SQL-transparent TypeScript persistence strategy; `D-ARCH-017` remains `PROPOSED`.

PostgreSQL and Drizzle remain unaccepted and uninstalled.

## D-DATA-004 / D-DATA-007 State

`D-DATA-004` remains `P1 PROPOSED`: Member and authenticated User/AuthIdentity are separate concepts linked explicitly. `ADR-0007` preserves that boundary but does not finalize schema/cardinality.

`D-DATA-007` remains `P1 PROPOSED` and unresolved. Final Member/Membership lifecycle schema and entitlement state machines remain blocked on that decision.

## Important Architecture Boundaries

- Clients are untrusted for canonical business truth.
- Authentication evidence is verified before Principal resolution.
- Authentication and GymPulse authorization remain separate responsibilities.
- Protected operations require verified Principal + current tenant/resource scope + named capability.
- Provider identity/roles/groups/custom claims/metadata do not become canonical GymPulse business authorization.
- A valid authentication session does not preserve access after account, tenant assignment, branch scope, or capability revocation.
- Member identity and authentication identity remain distinct concepts.
- Mutable email/phone values do not become universal domain identifiers.
- Identity linking/recovery must not auto-merge accounts solely from matching mutable contact fields.
- Staff web should keep reusable authentication material out of ordinary browser JavaScript where possible.
- Cookie-authenticated mutations require explicit CSRF defenses; `HttpOnly` alone is insufficient.
- JWT claims are not trusted merely because they can be decoded; signature/issuer/audience/expiry/algorithm/key semantics must be verified when JWTs are used.
- Provider signing-key rotation must be tolerated safely; unverifiable protected requests fail closed.
- Authentication provider outage must not corrupt canonical business state.
- Background jobs use bounded System Principal/trusted job context, not human sessions.
- Provider callbacks use provider-specific authenticity verification, not human authentication.
- Sensitive audit attribution uses stable GymPulse actor/principal identity rather than only mutable contact/display values.
- Authentication logs must not contain passwords, OTPs, refresh tokens, session secrets, Authorization headers, complete auth cookies, recovery tokens, or private keys.
- No Redis/cache dependency is introduced by authentication/principal verification.
- `D-SEC-001` remains a prerequisite for final provider/region/privacy approval.

## Technology Governance State

Key unresolved decisions include:

```text
D-ARCH-001  repository strategy                  P0 PROPOSED / ADR-0003 drafted
D-ARCH-002  database engine                      P0 PROPOSED / ADR-0004 drafted
D-ARCH-003  API contract architecture            P0 PROPOSED
D-ARCH-004  authentication/session               P0 OPEN / ADR-0007 drafted
D-ARCH-005  architecture style                   P1 PROPOSED / ADR-0001 drafted
D-ARCH-006  API deployment topology              P1 OPEN
D-ARCH-007  background jobs                      P1 OPEN
D-ARCH-009  hosting                              P1 OPEN
D-ARCH-010  object storage                       P1 OPEN
D-ARCH-011  package manager                      P1 ASSUMED
D-ARCH-012  Owner/Staff web framework            P0 PROPOSED
D-ARCH-013  member client strategy               P1 PROPOSED
D-ARCH-014  managed backend responsibilities     P0 OPEN / ADR-0006 drafted
D-ARCH-015  authorization implementation         P0 PROPOSED
D-ARCH-016  primary language/runtime             P0 PROPOSED / ADR-0002 drafted
D-ARCH-017  data access/migrations               P1 PROPOSED / ADR-0005 drafted
D-ARCH-018  testing toolchain                    P1 PROPOSED
D-ARCH-019  CI/CD + release/secrets tooling      P1 OPEN
D-SEC-001   jurisdiction/privacy                 P0 OPEN
D-SEC-002   member authentication                P0 OPEN
D-SEC-004   session lifecycle                    P1 OPEN
D-SEC-008   RLS/data-layer isolation             conditional P0 OPEN
D-PROVIDER-001 payment provider                  P1 OPEN
D-PROVIDER-002 messaging provider                P1 OPEN
D-PROVIDER-006 observability provider            P1 OPEN
D-DATA-004  Member vs AuthIdentity separation    P1 PROPOSED
D-DATA-007  Member vs Membership state ownership P1 PROPOSED
```

`D-ARCH-008` Redis/cache/broker remains P2 OPEN and is not a baseline dependency.

## Task 0015 Implementation Status

Task `0015-draft-authentication-session-architecture-adr` completed documentation/governance work only.

Created:

```text
docs/adr/ADR-0007-authentication-session-architecture.md
.ai/task/0015-draft-authentication-session-architecture-adr.md
```

Updated:

```text
docs/adr/README.md
docs/README.md
.ai/current-state.md
```

Explicitly not created/selected:

```text
No Supabase Auth project
No Clerk/Auth0 tenant
No Keycloak deployment
No authentication provider account/tenant
No OAuth/OIDC application/client
No users or credentials
No OTP provider
No callback URLs
No authentication SDK/package
No login UI
No auth middleware
No API routes
No auth/session tables
No database schema or migration
No RLS policy
No cookie/application implementation
No secrets or environment files
No provider signing key
No session TTL/access-token TTL/refresh-token TTL
No inactivity/remember-me/device-count policy
No MFA mandate
No member authentication method
No phone OTP selection
No application/API/worker implementation
No CI workflow
No deployment configuration
No authentication provider accepted
```

## Last Completed Task

`0015-draft-authentication-session-architecture-adr`

```text
ADR-0007 Status: Proposed
D-ARCH-004 canonical status: OPEN
D-SEC-002 canonical status: OPEN
D-SEC-004 canonical status: OPEN
```

No authentication provider or member method was provisioned or accepted.

## Current Task

None in progress.

## Next Task

Post-Task-0015 synchronization/re-check identifies the next bounded item in the current ADR dependency queue as:

```text
Task 0016: Draft Member Authentication / Verification Method ADR
```

Primary canonical decision:

```text
D-SEC-002
```

Likely target when explicitly started:

```text
docs/adr/ADR-0008-member-authentication-method.md
```

Initial ADR status should be `Proposed` while canonical `D-SEC-002` remains governed by `docs/00-overview/assumptions.md` and stays `OPEN` unless explicit approval evidence exists.

The task should evaluate the actual Phase 1 member verification method within the architecture proposed by `ADR-0007`. It may compare phone OTP/passwordless, email-based verified methods, and other credible options, including abuse, recovery, phone-reassignment/SIM-swap risk, delivery reliability/cost, self-only member linkage, and provider portability.

It must preserve:

- exact session lifetime/device/revocation policy under `D-SEC-004`,
- GymPulse-owned Principal + tenant/resource/capability authorization under `D-ARCH-015`,
- Member/AuthIdentity separation under `D-DATA-004`,
- no provider acceptance/provisioning without explicit evidence.

Do not create ADR-0008 or execute Task 0016 until explicitly started.

## Files To Read Next

```text
.ai/README.md
.ai/current-state.md
.ai/task/0015-draft-authentication-session-architecture-adr.md
docs/README.md
docs/00-overview/assumptions.md
docs/01-product/functional-requirements.md
docs/01-product/non-functional-requirements.md
docs/01-product/user-roles.md
docs/01-product/personas.md
docs/01-product/user-journeys.md
docs/02-architecture/architecture-principles.md
docs/02-architecture/architecture-overview.md
docs/02-architecture/system-context.md
docs/02-architecture/container-architecture.md
docs/02-architecture/component-architecture.md
docs/02-architecture/data-flow.md
docs/02-architecture/technology-stack.md
docs/adr/README.md
docs/adr/ADR-0006-managed-backend-responsibilities.md
docs/adr/ADR-0007-authentication-session-architecture.md
```
