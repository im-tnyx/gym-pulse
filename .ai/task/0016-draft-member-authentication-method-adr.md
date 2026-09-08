# Task 0016: Draft Member Authentication / Verification Method ADR

## Goal

Draft one `Proposed` ADR for canonical security decision `D-SEC-002` defining the Phase 1 member verification method inside the authentication/principal architecture proposed by `ADR-0007`, without provisioning providers, implementing authentication, creating schema, or inventing exact OTP/session policy.

Canonical target:

`docs/adr/ADR-0008-member-authentication-method.md`

## Inputs Read

Current structured repository inputs reviewed from latest `main`:

- `.ai/README.md`
- `.ai/current-state.md`
- `.ai/task/0015-draft-authentication-session-architecture-adr.md`
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
- `docs/adr/ADR-0006-managed-backend-responsibilities.md`
- `docs/adr/ADR-0007-authentication-session-architecture.md`

Legacy flat docs remain evidence/migration sources only. No legacy evidence overrode current structured documentation.

Current primary security/provider research was reviewed on `2026-09-08` from NIST SP 800-63B-4, OWASP Authentication/MFA/Forgot Password/Session guidance, and representative current official provider documentation for Supabase Auth, Clerk, and Auth0.

## Repository State Verified

Before creating `ADR-0008`:

- `docs/adr/ADR-0008-member-authentication-method.md` did not exist on `main`.
- `.ai/task/0016-draft-member-authentication-method-adr.md` did not exist.
- `D-SEC-002` remained `P0 OPEN` in the canonical decision register.
- `D-SEC-002` remained the next bounded item in the ordered ADR queue after `ADR-0007`.
- no newer approval evidence for `D-SEC-002` was found.
- `D-ARCH-004` remained `P0 OPEN` with `ADR-0007` only `Proposed`.
- `D-SEC-004` remained `P1 OPEN`.
- `D-ARCH-015` remained `P0 PROPOSED`.
- `D-DATA-004` remained `P1 PROPOSED`.
- `D-DATA-007` remained `P1 PROPOSED` and unresolved.
- member identity, persona, role, journey, attendance, security, privacy, observability, and operations requirements remained compatible with Task 0016.
- no decision ADR was `Accepted`.

Actual repository evidence matched the Task 0016 instruction.

## Canonical Decision State

```text
D-SEC-002
Priority: P0
Status: OPEN
Decision: Member authentication / verification method
```

Primary functional requirement:

```text
FR-IDENTITY-003
Protected member self-service requires a verified identity mechanism.
A raw mobile number alone is not authorization proof.
```

`ADR-0008` is drafted as `Proposed`. Task 0016 does not promote `D-SEC-002` to `PROPOSED` or `DECIDED`.

## Requirements Verified

Functional requirements used:

- `FR-IDENTITY-003`
- `FR-AUTHZ-003`
- `FR-AUTHZ-004`
- `FR-CROSS-001`
- `FR-CROSS-003`
- `FR-MEMBER-001`
- `FR-IMPORT-001`
- `FR-IMPORT-002`
- `FR-ATTENDANCE-001..006`

Non-functional requirements used:

- `NFR-SECURITY-001..005`
- `NFR-SECURITY-009..011`
- `NFR-PRIVACY-001`
- `NFR-TESTABILITY-004`
- `NFR-OBSERVABILITY-001..003`
- `NFR-OPERATIONS-001..002`

No requirement definition changed.

## Current Authentication Architecture

`ADR-0007` remains the governing Proposed architecture context:

```text
Authentication Evidence
  -> Authentication Verification
  -> provider + immutable subject/reference
  -> AuthIdentity mapping
  -> stable GymPulse Principal
  -> explicit Member access link
  -> current GymPulse authorization
```

Task 0016 preserves:

```text
Authentication != Authorization
Provider Identity != GymPulse Principal
GymPulse Principal != Member
Phone/Email != Authorization
Valid Session != Permanent Business Access
```

The member verification method feeds this chain rather than replacing it.

## Member Verification vs Linking Boundary

Two operations are explicit:

```text
Verification
  -> proves current control of a phone/email/provider authentication channel

Member linking / claiming
  -> decides which specific tenant-scoped Member record the verified Principal may access
```

OTP verification alone cannot safely perform Member claiming.

Unsafe pattern rejected:

```text
verified phone
  -> global Member lookup by phone
  -> first match
  -> grant access
```

Phone/email equality is not sufficient because of shared/family contact, duplicate imports, stale data, telecom reassignment, cross-tenant duplicates, already-claimed accounts, and contact changes.

## Threat Model

Threats explicitly evaluated:

- SIM swap,
- recycled/reassigned phone number,
- shared/family phone,
- email compromise,
- OTP interception,
- OTP brute force,
- OTP bombing/SMS-cost abuse,
- enumeration,
- account takeover through automatic Member linking,
- recovery abuse,
- staff social engineering,
- cross-tenant account linking,
- provider/control-plane compromise,
- session theft,
- static QR/member-reference theft,
- QR/member-auth confusion,
- phone/email change hijack,
- duplicate verification completion,
- weak knowledge-factor recovery.

Core mitigation is separation of channel verification, stable Principal identity, explicit Member-self link, current tenant/resource authorization, and sensitive recovery/re-link handling.

## Options Evaluated

1. **Managed phone OTP / SMS passwordless** for routine member verification.
2. **Managed email OTP / magic link** as a credible alternative/fallback channel.
3. **Managed password-based member login** using provider-owned credential infrastructure.
4. **Hybrid / step-up enrollment** adding higher assurance for selected first-claim/recovery/re-link states.
5. **Staff-assisted activation/recovery** as a controlled auditable exception rather than normal login.

All options still require safe Member claiming/linking.

## Current Provider Research

Research date: `2026-09-08`.

Security sources:

- NIST SP 800-63B-4: PSTN out-of-band authentication is restricted and risk indicators such as SIM change, device swap, and number porting should be considered.
- OWASP Authentication Cheat Sheet: generic authentication/recovery responses reduce enumeration risk.
- OWASP MFA Cheat Sheet: OTP controls should include bounded validity, single use, attempt control, invalidation after use, and no OTP logging.
- OWASP Forgot Password Cheat Sheet: recovery requires protected tokens/codes, consistent responses, and anti-automation controls.
- OWASP Session Management Cheat Sheet: high-risk recovery/security changes may require reauthentication; exact session policy remains separate.

Representative provider sources:

- Supabase Auth phone sign-in, Auth rate limits, identity linking.
- Clerk phone/email verification code flows, bot protection, user-enumeration protection, reverification.
- Auth0 passwordless SMS/email OTP and magic-link capability.

Provider research confirms credible managed support for phone/email/passwordless verification but does not select a provider.

No canonical evidence establishes the launch jurisdiction, so no jurisdiction-specific SMS/telecom rule was asserted.

## Evaluation Summary

Phone OTP/passwordless is the strongest current **routine member-verification candidate** because:

- the member experience is intentionally minimal/mobile-first,
- existing persona evidence includes phone/mobile-centric operational lookup,
- it avoids password creation/reset friction,
- credible managed providers support it for web and future native flows.

However, phone OTP is not sufficient as a historical Member-ownership proof because:

- telecom numbers can be reassigned,
- SIM swap/porting/interception exists,
- contacts may be shared,
- imported phone data may be stale or duplicated,
- OTP bombing and SMS spend abuse are real operational risks.

Therefore routine phone verification must be paired with explicit GymPulse-controlled account claim/recovery logic rather than direct `phone -> Member` authorization.

Email verification remains a credible fallback/alternative where phone data or delivery is unsuitable. Password login remains credible but creates greater member friction/recovery burden. Staff-assisted activation remains an exception path because it transfers risk to human process/social engineering.

## Proposed Direction

`ADR-0008` proposes:

```text
managed phone OTP/passwordless
for routine Phase 1 member verification
+
provider-independent AuthIdentity -> Principal resolution
+
explicit tenant-aware Principal -> Member-self linking
+
risk-sensitive hybrid enrollment/recovery
for ambiguous, reassigned, already-claimed, or high-risk cases
```

This is a Proposed recommendation only. `D-SEC-002` remains canonically `OPEN`.

No authentication provider or SMS provider is selected.

## Account Claim Model

Required outcomes:

```text
No eligible Member match
  -> no silent Member creation; generic no-link/support/enrollment path

One safe unclaimed candidate
  -> explicit one-time claim/link after verification + tenant/context + claim eligibility + concurrency protection

Multiple candidates
  -> no guess/no mass disclosure; controlled disambiguation/recovery

Already-claimed candidate
  -> no overwrite; recovery/security workflow

Existing Principal reauthenticating
  -> normal existing AuthIdentity -> Principal -> Member link resolution

Phone/email changed
  -> current/recovery authority + verify new channel + intentional re-link while preserving stable Principal/Member

Reassigned-number suspicion
  -> higher-assurance recovery/re-link
```

Initial Member claiming must be durable and concurrency-safe. Two Principals must not successfully claim the same Member-self relationship.

No schema/index/migration was created.

## Recovery Model

Recovery covers lost phone, changed phone, lost email if used, provider account/session loss, device loss, duplicate/ambiguous account, already-claimed Member, suspected phone reassignment, and provider migration.

Preferred authority order depends on later policy but may use:

- existing authenticated session,
- previously verified secondary channel,
- provider-supported recovery/reverification,
- authorized staff-assisted process with a documented identity-verification procedure.

Recovery cannot be substantially weaker than normal authentication.

Staff-assisted recovery, if retained, requires:

```text
named capability
correct tenant scope
explicit target Member/Principal
reason/source
approved verification procedure
no cross-tenant disclosure
no silent link overwrite
audit record
```

No role is granted this capability by Task 0016.

## Phone-Reassignment / SIM-Swap Findings

Current NIST guidance treats PSTN out-of-band authentication as restricted and recommends considering SIM change, number porting, device swap, and abnormal behavior.

GymPulse therefore treats SMS OTP as current phone-channel control, not immutable identity.

Key architectural consequences:

- an already-claimed Member is never transferred solely because another person can now receive OTPs for the same phone string,
- suspicious reassignment/re-link enters controlled recovery,
- previous/secondary verified channel or staff-assisted higher-assurance verification may be used where later policy permits,
- provider/network risk indicators can inform risk policy when available but are not assumed universally available,
- phone/auth-channel changes are sensitive auditable binding operations.

Task 0016 does not mandate MFA for every member action.

## Abuse-Control Requirements

Architecture must support controls for:

- OTP bombing,
- SMS-cost amplification,
- verification brute force,
- phone-number spraying,
- enumeration,
- automated/bot claim attempts,
- resend abuse,
- recovery abuse.

Control dimensions may include:

```text
destination
challenge
IP/network
device/client signals where appropriate
provider controls
application controls
progressive delay/friction
CAPTCHA/challenge where justified
monitoring/spend alerts
```

No numerical OTP length, TTL, attempt count, resend delay, request limit, IP threshold, lockout, or spend threshold was invented.

## Tenant-Isolation Findings

A verified identifier cannot become a cross-gym discovery mechanism.

Claim resolution must preserve explicit/safely resolved tenant/gym context and must not disclose other tenant Member matches.

Member authorization remains self-only after linking:

```text
verified Principal
  -> explicit Member-self link
  -> current tenant/resource authorization
```

A valid member session cannot read `/member/{arbitraryMemberId}` merely because the requester is authenticated.

Authentication remains separate from QR/session-token validation, membership eligibility, branch checks, and payment verification.

## Provider Portability

Provider-specific subjects remain behind AuthIdentity mapping.

Provider exit should preserve where practical:

- stable Principal IDs,
- Principal -> Member-self links,
- tenant/gym relationships,
- business history,
- audit history,
- authorization state.

Provider changes may require AuthIdentity remapping, factor/channel migration, forced re-verification, and session invalidation, but should not rewrite business-domain identity.

## Decisions Kept Separate

```text
D-ARCH-004  authentication/session architecture          OPEN / ADR-0007 Proposed
D-SEC-004   exact session lifecycle/device policy        OPEN
D-ARCH-015  authorization implementation boundary        PROPOSED
D-ARCH-014  managed backend responsibilities             OPEN / ADR-0006 Proposed
D-ARCH-013  member client strategy                       PROPOSED
D-SEC-001   jurisdiction/privacy                         OPEN
D-SEC-005   deletion/export authority                    OPEN
D-SEC-006   retention                                    OPEN
D-DATA-004  Member vs User/AuthIdentity separation       PROPOSED
D-DATA-007  Member vs Membership lifecycle ownership     PROPOSED
D-PROVIDER-002 business messaging provider               OPEN
D-PROVIDER-003 email provider                            OPEN
```

Also not accepted: Supabase Auth, Clerk, Auth0, SMS provider, email provider, exact OTP policy, MFA mandate, exact session policy, native member delivery, RLS, PostgreSQL, Drizzle, or Next.js.

## Requirement IDs Referenced

- `FR-IDENTITY-003`
- `FR-AUTHZ-003`
- `FR-AUTHZ-004`
- `FR-CROSS-001`
- `FR-CROSS-003`
- `FR-MEMBER-001`
- `FR-IMPORT-001`
- `FR-IMPORT-002`
- `FR-ATTENDANCE-001..006`
- `NFR-SECURITY-001..005`
- `NFR-SECURITY-009..011`
- `NFR-PRIVACY-001`
- `NFR-TESTABILITY-004`
- `NFR-OBSERVABILITY-001..003`
- `NFR-OPERATIONS-001..002`

All IDs were verified against current structured requirement documents.

## Validation Required

Before acceptance/provider binding, validate at least:

1. normal member verification,
2. wrong OTP/code,
3. expired challenge,
4. reused challenge,
5. excessive verification attempts,
6. excessive requests/resends,
7. provider delivery failure,
8. unknown identifier,
9. zero Member matches,
10. one safe unclaimed match,
11. multiple Member matches,
12. Member already claimed,
13. same phone across multiple records,
14. phone number changed,
15. recycled-number/re-link scenario,
16. lost-phone recovery,
17. staff-assisted recovery,
18. unauthorized staff recovery attempt,
19. cross-tenant linking negative test,
20. member self-only authorization after linking,
21. blocked/deactivated/self-service-revoked Member after valid authentication,
22. provider outage,
23. account enumeration,
24. OTP bombing/cost abuse,
25. concurrent claim race,
26. duplicate verification completion/callback,
27. identity-provider migration/remapping,
28. representative member-device web UX,
29. future native compatibility,
30. QR authentication separation,
31. payment truth separation,
32. secret/log leakage.

No test implementation was created during Task 0016.

## Files Changed

Created:

- `docs/adr/ADR-0008-member-authentication-method.md`
- `.ai/task/0016-draft-member-authentication-method-adr.md`

Continuity/index updates authorized:

- `docs/adr/README.md`
- `docs/README.md`
- `.ai/current-state.md`

No other canonical document required correction because no contradiction was found.

## Open Questions

- Who owns final approval of `D-SEC-002`?
- What is the actual pilot phone/email completeness, uniqueness, and shared-contact rate?
- What is the launch jurisdiction and authoritative SMS/identity/privacy requirement set?
- What exact evidence makes a first claim safe versus higher-risk?
- What staff-assisted recovery authority/procedure is acceptable?
- Is email sufficiently complete/current to be a fallback/secondary recovery channel?
- Which managed authentication provider best fits the approved architecture and launch market?
- Which authentication-specific SMS transport is required, if any?
- What exact OTP controls will later provider/security policy approve?
- What exact session/device/revocation policy will `D-SEC-004` approve?

## Result

`ADR-0008` now exists as a `Proposed` member authentication/verification recommendation.

It proposes managed phone OTP/passwordless for routine Phase 1 member verification, but only within the `ADR-0007` architecture and only with explicit tenant-aware Member claim/linking plus stronger controlled recovery/re-link handling for ambiguous, reassigned, already-claimed, or high-risk states.

No member method is canonically accepted by this task. `D-SEC-002` remains `OPEN`.

No provider, OTP policy, session policy, SDK, account, secret, schema, migration, route, UI, callback, RLS policy, CI workflow, or deployment configuration was created.

## Next Recommended Task

After Task 0016 continuity/index synchronization, re-read the canonical ADR queue.

The expected next bounded decision is:

```text
Task 0017: Draft Authorization Implementation Boundary ADR
Primary decision: D-ARCH-015
Likely target: docs/adr/ADR-0009-authorization-implementation.md
Initial ADR status: Proposed
```

Do not execute Task 0017 as part of Task 0016.
