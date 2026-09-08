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
ADR-0001  D-ARCH-005  Phase 1 architecture style                 Proposed
ADR-0002  D-ARCH-016  Primary language/runtime                   Proposed
ADR-0003  D-ARCH-001  Repository/workspace strategy              Proposed
ADR-0004  D-ARCH-002  Canonical database engine                  Proposed
ADR-0005  D-ARCH-017  Data access/query/transaction/migrations   Proposed
ADR-0006  D-ARCH-014  Managed backend/platform responsibilities  Proposed
ADR-0007  D-ARCH-004  Authentication/session architecture        Proposed
ADR-0008  D-SEC-002   Member authentication/verification method  Proposed
```

No authorized approval evidence exists for these ADRs. None is `Accepted`.

Canonical decision status remains controlled by `docs/00-overview/assumptions.md` rather than ADR draft status.

Relevant current canonical status:

```text
D-ARCH-004 remains OPEN
D-ARCH-014 remains OPEN
D-ARCH-015 remains PROPOSED
D-ARCH-013 remains PROPOSED
D-SEC-001 remains OPEN
D-SEC-002 remains OPEN
D-SEC-004 remains OPEN
D-SEC-008 remains OPEN when applicable
D-DATA-004 remains PROPOSED
D-DATA-007 remains PROPOSED
D-PROVIDER-002 remains OPEN
D-PROVIDER-003 remains OPEN
```

A `Proposed` ADR does not itself promote its canonical decision to `PROPOSED` or `DECIDED`.

## Current Authentication Architecture Position

`ADR-0007` remains `Proposed`; canonical `D-ARCH-004` remains `P0 OPEN`.

Current proposed trust chain:

```text
Authentication Evidence
  -> Authentication Verification
  -> provider + immutable subject/reference
  -> GymPulse AuthIdentity mapping
  -> stable GymPulse Principal
  -> current internal account eligibility
  -> explicit staff assignments and/or Member-self link
  -> server-validated tenant/resource scope
  -> current named capability / self policy
  -> allow / deny
  -> application/domain operation
```

Mandatory boundaries remain:

```text
Authentication != Authorization
Provider Identity != GymPulse Principal
GymPulse Principal != Member
Valid Authentication Session != Permanent Business Access
```

No authentication provider is selected or provisioned.

## Current Member Authentication Proposal

`ADR-0008` now exists as `Proposed` for `D-SEC-002`.

Canonical `D-SEC-002` remains `P0 OPEN`.

The ADR proposes this Phase 1 direction for review:

```text
managed phone OTP/passwordless
for routine member verification
+
provider-independent AuthIdentity -> Principal resolution
+
explicit tenant-aware Principal -> Member-self linking
+
risk-sensitive claim/recovery/re-link handling
for ambiguous, reassigned, already-claimed, or high-risk states
```

This proposal is not acceptance of phone OTP/passwordless or any provider.

### Verification vs linking

The architecture explicitly separates:

```text
Verification
  -> proves current control of the authentication channel

Member claiming/linking
  -> decides which specific GymPulse Member record the verified Principal may access
```

Unsafe behavior remains prohibited:

```text
verified phone/email
  -> global Member lookup
  -> first match
  -> grant access
```

Phone/email equality is not authorization and cannot silently transfer or create Member access.

## Account Claim / Link Posture

Required outcome categories:

```text
No eligible Member match
  -> no silent Member creation; generic controlled enrollment/support path

One safe unclaimed candidate
  -> explicit one-time claim/link after verification + tenant/context + eligibility + concurrency protection

Multiple candidates
  -> no guessing or disclosure; controlled disambiguation/recovery

Already-claimed candidate
  -> no overwrite; recovery/security workflow

Existing linked Principal
  -> normal AuthIdentity -> Principal -> Member-self resolution

Phone/email changed
  -> current/recovery authority + verify new channel + intentional re-link while preserving stable identities

Reassigned-number suspicion
  -> higher-assurance recovery/re-link
```

Concurrent claim attempts must not allow two Principals to acquire the same Member-self relationship. Exact schema/constraint/transaction implementation is not defined yet.

## Phone Reassignment / SIM-Swap Position

Phone OTP is treated as evidence of current telecom-channel control, not immutable human identity.

Architecture consequences:

- an already-claimed Member is not transferred solely because a new person verifies the same phone string,
- shared/duplicate phone data never auto-links multiple Members,
- suspected reassignment enters controlled recovery/re-link,
- channel changes are sensitive identity-binding operations,
- provider/network risk signals may inform later policy where available,
- additional assurance may be required for recovery/re-link/high-risk identity changes without imposing MFA on every normal member action.

## Member Recovery Position

Recovery may need to handle lost phone, changed phone, lost email if used, device loss, duplicate/ambiguous account state, already-claimed Member, suspected reassignment, and provider migration.

Possible legitimate authorities, subject to later policy, include:

```text
existing authenticated session
secondary previously verified channel
provider-supported recovery/reverification
authorized staff-assisted recovery with documented identity verification
```

Recovery must not be substantially weaker than ordinary authentication.

If staff-assisted recovery exists, it requires:

```text
named capability
correct tenant/gym scope
explicit target Member/Principal
reason/source
approved verification procedure
no cross-tenant lookup/disclosure
no silent overwrite
audit record
```

Task 0016 does not assign that capability to a role.

## Abuse / Enumeration Position

The member-auth architecture must support controls for:

- OTP bombing,
- SMS-cost amplification,
- verification brute force,
- destination spraying,
- resend abuse,
- automation/bots,
- enumeration,
- recovery abuse.

Control dimensions may include provider controls, destination/challenge limits, IP/network signals, device/client signals where appropriate, progressive friction, CAPTCHA/challenge where justified, and monitoring/spend alerts.

Task 0016 does not select numerical values for:

```text
OTP length
OTP TTL
maximum verification attempts
resend delay
request count
IP threshold
lockout duration
spend threshold
```

Member-facing behavior must avoid unnecessary disclosure of whether an identifier exists, which tenant contains it, Member identity/state, or whether a Member is already claimed before sufficient verification/context.

## Tenant / Authorization Boundary

A verified member identity does not enable cross-gym discovery or arbitrary Member access.

Normal self-service boundary remains:

```text
verified Principal
  -> explicit Member-self link
  -> current tenant/resource scope
  -> current named capability / self policy
  -> allow / deny
```

`D-ARCH-015` remains `P0 PROPOSED` and separately governed.

Member authentication does not decide:

- tenant/resource authorization,
- QR/session-token validity,
- branch eligibility,
- membership entitlement,
- payment success,
- privileged staff actions.

## Session Lifecycle Boundary

`D-SEC-004` remains `P1 OPEN`.

Task 0016 does not define:

```text
access-token TTL
refresh-token TTL
session lifetime
inactivity timeout
remember-me duration
maximum devices
device-management UX
exact revocation SLA
```

After successful member verification, access continues through the session architecture proposed by `ADR-0007`. OTP/code is not a reusable session credential and is not required for every protected request.

## Provider Position

Representative current research covered managed Auth capabilities from Supabase Auth, Clerk, and Auth0 plus NIST/OWASP security guidance.

Provider status remains:

```text
No Supabase Auth selection
No Clerk selection
No Auth0 selection
No authentication provider selection
No SMS/telecom provider selection
No email provider selection
No business messaging provider selection
```

Authentication OTP transport and business messaging remain separate provider/governance concerns. `D-PROVIDER-002` is not decided by Task 0016.

`D-SEC-001` launch jurisdiction/privacy remains `OPEN`; Task 0016 did not invent jurisdiction-specific telecom or data-residency rules.

## D-DATA-004 / D-DATA-007 State

`D-DATA-004` remains `P1 PROPOSED`:

```text
Member != AuthIdentity != Principal
```

Provider-specific subjects remain behind AuthIdentity mapping. Stable Principal and Member identities should survive provider changes where practical.

`D-DATA-007` remains `P1 PROPOSED` and unresolved. Authentication/claim logic must not infer entitlement from overlapping Member/Membership lifecycle states.

## Important Architecture Boundaries

- Clients are untrusted for canonical business truth.
- Authentication evidence is verified before Principal resolution.
- Authentication and GymPulse authorization remain separate.
- Phone/email/provider identity is not authorization.
- Channel verification and Member claiming are separate security operations.
- Provider subject IDs are not universal domain IDs.
- Existing Member records may exist without an authentication account.
- Routine login to an established link should not repeat mutable phone-to-Member inference.
- Multiple/ambiguous/shared identifiers do not auto-link.
- Already-claimed Member links are not overwritten by new OTP verification.
- Recovery/channel-change/re-link operations are security-sensitive and auditable.
- Current GymPulse access state can deny business access while external authentication remains valid.
- Member self-only authorization remains server-side.
- QR token/session verification and member authentication are separate checks.
- Payment success remains based on verified payment-provider evidence, not authentication success.
- OTP/magic-link/session/recovery secrets must never be logged or stored in audit history.
- Provider outage must fail protected member verification safely without mutating canonical business state.
- No Redis/cache dependency is introduced by this task.

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
D-SEC-002   member authentication                P0 OPEN / ADR-0008 drafted
D-SEC-004   session lifecycle                    P1 OPEN
D-SEC-008   RLS/data-layer isolation             conditional P0 OPEN
D-PROVIDER-001 payment provider                  P1 OPEN
D-PROVIDER-002 messaging provider                P1 OPEN
D-PROVIDER-003 email provider                    P2 OPEN
D-PROVIDER-006 observability provider            P1 OPEN
D-DATA-004  Member vs AuthIdentity separation    P1 PROPOSED
D-DATA-007  Member vs Membership state ownership P1 PROPOSED
```

`D-ARCH-008` Redis/cache/broker remains P2 OPEN and is not a baseline dependency.

## Task 0016 Implementation Status

Task `0016-draft-member-authentication-method-adr` completed documentation/governance work only.

Created:

```text
docs/adr/ADR-0008-member-authentication-method.md
.ai/task/0016-draft-member-authentication-method-adr.md
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
No authentication provider account/tenant
No SMS/OTP provider
No email provider
No business messaging provider
No users/member login accounts
No credentials
No OAuth/OIDC application/client
No AuthIdentity table
No Principal table
No member-link table
No session table
No OTP/challenge table
No database schema or migration
No RLS policy
No API endpoint/route
No login/OTP/recovery UI
No middleware
No provider callback
No SDK dependency
No secret/env file
No SMS/email template
No exact OTP length/TTL/attempt/request/resend/lockout policy
No exact session/access/refresh/device policy
No MFA mandate
No native member application
No CI workflow
No deployment configuration
No authentication implementation
No provider accepted
```

## Last Completed Task

`0016-draft-member-authentication-method-adr`

```text
ADR-0008 Status: Proposed
D-SEC-002 canonical status: OPEN
D-ARCH-004 canonical status: OPEN
D-SEC-004 canonical status: OPEN
D-ARCH-015 canonical status: PROPOSED
```

The proposed member verification direction is not accepted merely because ADR-0008 exists.

## Current Task

None in progress.

## Next Task

Post-Task-0016 re-check of `docs/adr/README.md` and `docs/00-overview/assumptions.md` identifies the next bounded item as:

```text
Task 0017: Draft Authorization Implementation Boundary ADR
```

Primary canonical decision:

```text
D-ARCH-015
```

Likely target when explicitly started:

```text
docs/adr/ADR-0009-authorization-implementation.md
```

Initial ADR status should be `Proposed`. Canonical `D-ARCH-015` remains `PROPOSED` unless explicit review/approval changes it.

The task should define the provider-independent implementation boundary for:

```text
verified Principal
  + current tenant/resource scope
  + current named capability / Member-self relationship
  -> allow / deny
```

It should keep authentication/session providers, exact session policy, `D-SEC-008` RLS/data-layer isolation, database engine/tooling, framework, and deployment topology separately governed.

Do not create ADR-0009 or authorization implementation until Task 0017 is explicitly started.

## Files To Read Next

```text
.ai/README.md
.ai/current-state.md
.ai/task/0016-draft-member-authentication-method-adr.md
docs/README.md
docs/00-overview/assumptions.md
docs/01-product/functional-requirements.md
docs/01-product/non-functional-requirements.md
docs/01-product/user-roles.md
docs/01-product/personas.md
docs/02-architecture/architecture-principles.md
docs/02-architecture/architecture-overview.md
docs/02-architecture/component-architecture.md
docs/02-architecture/data-flow.md
docs/adr/README.md
docs/adr/ADR-0007-authentication-session-architecture.md
docs/adr/ADR-0008-member-authentication-method.md
```
