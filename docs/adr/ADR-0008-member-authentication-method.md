# ADR-0008: Member Authentication and Verification Method

## Status

`Proposed`

## Decision Metadata

- ADR: `ADR-0008`
- Primary Decision ID: `D-SEC-002`
- Related Decision IDs: `D-ARCH-004`, `D-SEC-004`, `D-ARCH-015`, `D-ARCH-014`, `D-ARCH-013`, `D-SEC-001`, `D-SEC-005`, `D-SEC-006`, `D-DATA-004`, `D-DATA-007`, `D-PROVIDER-002`, `D-PROVIDER-003`
- Decision Owner: `Open`
- Technical Owner: `Security / Identity / Architecture`
- Date Proposed: `2026-09-08`
- Date Accepted: `Not accepted`
- Supersedes: `None`
- Superseded By: `None`

## 1. Context

GymPulse Phase 1 requires a member to prove control of an identity before accessing protected member self-service. The canonical requirement is `FR-IDENTITY-003`:

> Member access to protected self-service data MUST use a verified identity mechanism. A raw mobile number by itself MUST NOT be treated as authorization proof.

The decision under `D-SEC-002` is therefore narrower than the authentication/session architecture established as a proposal in `ADR-0007`.

`ADR-0007` proposes this provider-independent chain:

```text
Authentication Evidence
        ↓
Authentication Verification
        ↓
provider + immutable subject/reference
        ↓
GymPulse AuthIdentity mapping
        ↓
stable GymPulse Principal
        ↓
explicit Member access linkage
        ↓
current GymPulse authorization
        ↓
application/domain operation
```

This ADR chooses and evaluates the **member verification method inside that architecture**. It does not replace the architecture.

The following invariants remain mandatory:

```text
Authentication != Authorization
Provider Identity != GymPulse Principal
GymPulse Principal != Member
Phone Number != Authorization
Email Address != Authorization
Valid Session != Permanent Business Access
```

The problem has two separate security questions:

```text
Verification
  "Does this person currently control the claimed authentication channel?"

Member claiming / linking
  "Which GymPulse Member record, if any, may this verified Principal access?"
```

A one-time code sent to a phone or email can establish control of that channel at that moment. It does not by itself prove that the channel uniquely and permanently identifies the correct historical GymPulse Member record.

This distinction is material because Phase 1 may import or pre-create Member business records before member self-service is enabled. Those records can contain stale, shared, mistyped, or reassigned contact information. An unsafe implementation such as:

```text
phone verified
  -> globally query Member by phone
  -> automatically attach whatever record matches
```

would create account-takeover, cross-tenant, shared-number, recycled-number, and data-quality risks.

`D-SEC-002` is currently `P0 OPEN`. This ADR creates a concrete proposal for review. `ADR-0008` is `Proposed`; the canonical decision remains `OPEN` until explicit review/approval evidence and normal governance change it.

## 2. Requirements and Decision Drivers

### 2.1 Functional requirements

- `FR-IDENTITY-003` requires a verified identity mechanism for protected member self-service and prohibits raw mobile number as authorization proof.
- `FR-AUTHZ-003` requires self-only member access.
- `FR-AUTHZ-004` requires sensitive staff action attribution, relevant to staff-assisted account recovery/linking.
- `FR-CROSS-001` keeps final authorization and canonical business truth server-side.
- `FR-CROSS-003` requires explicit tenant/gym/branch context where relevant.
- `FR-ATTENDANCE-001` requires a server-verifiable, time-constrained QR/session token rather than an indefinitely reusable public identifier.
- `FR-ATTENDANCE-002` requires QR check-in to validate verified member identity separately from QR/session integrity, branch context, membership eligibility, and duplicate policy.
- `FR-ATTENDANCE-003` requires exactly one canonical attendance result.
- `FR-ATTENDANCE-004` records attendance source.
- `FR-ATTENDANCE-005` requires duplicate protection.
- `FR-ATTENDANCE-006` requires retry safety.
- `FR-MEMBER-001` requires a stable opaque Member identifier and explicit tenant/gym/branch context.
- `FR-IMPORT-001` requires validation, duplicate detection, source-row traceability, and reconciliation for controlled pilot import.
- `FR-IMPORT-002` prohibits fabricating material missing facts during import.

### 2.2 Non-functional requirements

Security and privacy:

- `NFR-SECURITY-001` tenant isolation.
- `NFR-SECURITY-002` least privilege.
- `NFR-SECURITY-003` server-side authorization.
- `NFR-SECURITY-004` secret protection.
- `NFR-SECURITY-005` encrypted transport for authenticated/personal/operational data.
- `NFR-SECURITY-009` attributable sensitive actions.
- `NFR-SECURITY-010` abuse controls for authentication, verification, QR, and other sensitive endpoints without hard-coding policy values here.
- `NFR-SECURITY-011` sensitive error minimization.
- `NFR-PRIVACY-001` data minimization.
- `NFR-TESTABILITY-004` positive and negative authorization matrix tests.
- `NFR-OBSERVABILITY-001` structured operational logs.
- `NFR-OBSERVABILITY-002` safe operational context without secrets/unnecessary PII.
- `NFR-OBSERVABILITY-003` centralized production error visibility.
- `NFR-OPERATIONS-001` separate lifecycle environments.
- `NFR-OPERATIONS-002` production secret separation.

### 2.3 Product and UX drivers

Canonical product evidence describes a mobile-first member experience in which the member primarily needs to:

```text
open member experience
view current membership / expiry
check in
review attendance / weekly goal
renew / initiate payment
view canonical payment/receipt state
```

The member persona explicitly prioritizes minimal repeated interaction and fast check-in. Authentication should therefore avoid unnecessary installation, account-administration, or support overhead while still providing real identity verification.

### 2.4 Architecture drivers

Especially relevant principles are:

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

1. `D-ARCH-004` remains canonically `OPEN`; `ADR-0007` is only a Proposed authentication/session architecture.
2. `D-SEC-004` remains `OPEN`. This ADR does not select access-token TTL, refresh-token TTL, session lifetime, inactivity timeout, remember-me duration, maximum devices, device-management UX, or an exact revocation SLA.
3. `D-ARCH-015` remains `PROPOSED`. A verified member Principal is still authorized by current GymPulse-controlled scope/resource/capability state.
4. `D-DATA-004` remains `PROPOSED`. This ADR preserves `Member`, `AuthIdentity`, and `Principal/User` as separate concepts but does not finalize schema or cardinalities.
5. `D-DATA-007` remains `PROPOSED` and unresolved. Member authentication cannot use unresolved Member/Membership lifecycle overlap as identity proof or entitlement truth.
6. The Member business record may exist before any interactive authentication identity or self-service claim exists.
7. Phone number and email are mutable contact/authentication channels, not stable business identifiers.
8. Provider-specific user/subject IDs are mapping references behind `AuthIdentity`, not IDs that should spread through Member, Membership, Attendance, Payment, or other business-domain records.
9. A verified phone/email proves current channel control according to the provider contract. It does not prove permanent human identity, historical account ownership, tenant membership, or authorization.
10. One phone/email cannot be assumed to map to exactly one Member across all tenants or even within one tenant. Imported data may contain duplicates, family/shared contact, stale contacts, or data-entry errors.
11. Member verification and Member claiming/linking are separate operations with separate failure states.
12. A normal member login should not require staff intervention or multiple factors merely because stronger recovery/linking controls exist.
13. First-time claim, recovery, authentication-channel change, ambiguous linking, already-claimed linking, and suspected reassignment are higher-risk operations than routine reauthentication to an already-linked Principal.
14. Weak operational facts such as name, date of birth, plan name, membership expiry, gym name, last attendance date, or an openly printed member reference are not sufficient standalone authentication secrets.
15. A static member QR/card/reference is a lookup input unless explicitly designed and separately threat-reviewed as an authenticator. The gym check-in QR/session token is also not the member's identity proof by itself.
16. The member session established after successful verification follows the architecture in `ADR-0007`; the OTP/code itself is not a reusable session secret and should not be required for every API request.
17. Member authentication success does not establish membership eligibility, payment success, or entitlement.
18. An authentication provider outage may block new verification/login/recovery but must not corrupt Member, Membership, Attendance, Payment, or other canonical state.
19. `D-SEC-001` remains `OPEN`; this ADR does not invent jurisdiction-specific SMS, telecom, identity, or data-residency requirements.
20. Authentication OTP transport and business messaging are separate concerns. `D-PROVIDER-002` remains separately governed even if an authentication service later uses an SMS transport provider.
21. Exact OTP length, validity period, maximum attempts, resend delay, daily request count, IP threshold, lockout duration, and other numerical abuse limits are not decided here.
22. Provider-side automatic identity-linking behavior must not be allowed to bypass GymPulse's explicit Principal-to-Member linking rules.
23. All protected member requests continue through the trusted GymPulse runtime; verification does not approve direct client mutation of canonical business data.

## 4. Member Verification vs Member Linking

### 4.1 Verification layer

The verification layer proves control of an authentication channel or provider identity.

For phone OTP, conceptually:

```text
phone entered
  -> provider creates bounded verification challenge
  -> provider/SMS transport delivers one-time code
  -> claimant presents code for the bound challenge
  -> provider verifies challenge
  -> trusted GymPulse boundary verifies resulting identity evidence
  -> AuthIdentity / Principal resolution continues
```

For email code/magic-link, the equivalent proof establishes access to the email channel according to provider semantics.

Verification does **not** choose a Member record.

### 4.2 Linking / claim layer

Member linking decides whether a verified Principal may gain self-service access to one specific Member business record.

Conceptually:

```text
verified external identity/channel
        ↓
AuthIdentity mapping
        ↓
stable Principal
        ↓
known / safely resolved tenant-gym context
        ↓
claim candidate evaluation
        ↓
zero / one-safe-unclaimed / multiple / already-claimed / recovery state
        ↓
explicit Member access link if authorized and safe
```

### 4.3 Why phone equality is insufficient

This architecture explicitly prohibits:

```text
SELECT Member globally WHERE phone = verified_phone
  -> first row
  -> grant access
```

because:

- one phone may be shared by family members,
- imported records can duplicate a number,
- a number may be reassigned by a telecom operator,
- a Member may already be linked to another Principal,
- the same phone could appear in different tenant data,
- a typo can point to another person,
- a phone change/recovery event may intentionally require higher assurance.

### 4.4 Tenant-aware linking

Claim resolution must preserve explicit tenant/gym context or another server-controlled, non-enumerating resolution strategy.

Before sufficient identity and tenant context exist, the member-facing flow must not reveal:

- which gyms contain the phone/email,
- matching Member names,
- membership state,
- whether another Member exists in another tenant,
- whether a particular Member is already claimed.

A global phone/email index may exist internally for identity operations if later architecture requires it, but it cannot become a cross-tenant discovery API or authorization boundary.

### 4.5 Link durability and concurrency

Initial claiming is correctness-sensitive.

Future implementation must guarantee that two concurrent Principals cannot both successfully claim the same Member-self relationship.

Required properties:

- durable uniqueness/concurrency protection,
- retry-safe claim completion,
- duplicate callback/request tolerance,
- deterministic result if the claim already succeeded,
- no partial linkage when delivery/verification fails.

This ADR does not choose table structure, indexes, transaction syntax, or migration design.

## 5. Threat Model

| Threat | Architecture mitigation / policy boundary |
|---|---|
| SIM swap | Treat SMS as proof of current phone-channel control, not immutable identity; use stronger recovery/re-link controls for high-risk changes; consider provider/network risk signals where available; no assumption that SMS alone is sufficient for every sensitive account change |
| Recycled/reassigned phone number | Persistent AuthIdentity/Principal/Member link; do not automatically transfer an already-claimed Member based only on new OTP success; ambiguous/re-link path requires controlled recovery/higher assurance |
| Shared/family phone | Do not assume phone uniqueness; multiple candidate Members never auto-link; use explicit disambiguation/recovery without exposing unrelated records |
| Email compromise | Email possession is channel control only; sensitive re-link/recovery may require additional assurance; protect email-link flows against interception/cross-device confusion according to provider capability |
| OTP interception | Use managed provider transport/verification, TLS, bounded single-use challenges, no OTP logging, and avoid treating OTP as reusable session credential |
| OTP brute force | Provider/application attempt controls, bounded expiry, challenge binding, monitoring; exact thresholds remain implementation/security policy |
| OTP bombing / SMS-cost abuse | Destination/IP/device/challenge controls, resend controls, progressive friction/CAPTCHA where justified, provider controls, spend/volume monitoring |
| Enumeration | Generic/non-disclosing behavior for unknown, known, already-linked, disabled, and ambiguous identifiers until sufficient context exists; avoid timing/state discrepancies where practical |
| Account takeover through automatic Member linking | Separate channel verification from Member claim; explicit claim eligibility; no global first-match linking; already-claimed records go to recovery/security workflow |
| Recovery abuse | Recovery cannot be substantially weaker than ordinary authentication; use existing session/secondary channel/provider recovery/staff-assisted controlled process according to risk |
| Staff social engineering | Staff-assisted recovery requires named capability, tenant scope, explicit target, reason, auditable action, and defined verification procedure; no invisible support bypass |
| Cross-tenant account linking | Tenant-aware claim resolution; no global member disclosure; server-side self-link and authorization enforcement |
| Provider account/control-plane compromise | Provider admin least privilege, strong provider-admin security, environment separation, audit/admin review, provider exit capability; provider still cannot directly grant GymPulse Member scope without internal link |
| Session theft | Session protection remains governed by `ADR-0007`/`D-SEC-004`; current Member/self-service access state is rechecked by GymPulse and can be revoked independently |
| Static QR/member reference theft | Treat static identifiers as lookup/reference data, not standalone authentication secrets |
| QR check-in confusion | Member identity verification, QR/session validity, branch, membership eligibility, and duplicate policy remain separate checks under `FR-ATTENDANCE-002` |
| Phone/email change hijack | Require current session or approved recovery authority plus verification of the new channel; preserve stable Principal; audit sensitive change; review/revoke old path according to later policy |
| Duplicate verification completion | Idempotent linking/claim completion; same successful verification must not create duplicate Principals/AuthIdentity/Member links |
| Weak knowledge-factor recovery | Names, DOB, plan/expiry/attendance/member reference are not sole recovery secrets; any use is supplementary and must be threat-reviewed |

## 6. Options Considered

### Option A: Managed phone OTP / SMS passwordless

A member enters a phone number and proves current control through a one-time SMS verification challenge operated by a managed authentication service and its supported SMS transport.

Potential advantages:

- low account-setup burden,
- aligns with phone-centric operational member lookup already present in the current persona/journey evidence,
- no password creation or password-reset burden for routine member login,
- works in responsive web and future native clients,
- supported by credible managed authentication products,
- straightforward continuation into the session architecture proposed by `ADR-0007`.

Material risks/tradeoffs:

- SMS is a restricted/out-of-band authenticator in current NIST guidance and is exposed to SIM swap, number porting, forwarding/interception, and device/account compromise risks,
- phone numbers are recycled/reassigned and may be shared,
- imported gym data can contain stale/duplicate numbers,
- delivery latency/filtering and international formatting affect UX,
- SMS delivery creates variable cost and OTP-bombing/spend-amplification risk,
- some authentication platforms require a separate SMS transport provider,
- phone change and recovery require higher-assurance design,
- launch-market telecom requirements cannot be assumed while `D-SEC-001` is open.

This option is the **leading routine member-verification candidate**, not an accepted decision.

### Option B: Managed email OTP / magic link

A member proves current control of an email inbox using a one-time code or magic link.

Potential advantages:

- avoids SMS delivery charges and phone-reassignment/SIM-swap risks,
- common managed-provider capability,
- provider-independent verification concept,
- works in web and future native clients.

Tradeoffs:

- current GymPulse requirements do not prove that every pilot Member has a reliable unique email address,
- shared/family email and stale addresses create the same general linking ambiguity problem,
- spam filtering and delivery delay can hurt login UX,
- magic-link flows can be awkward when the link is opened on another device/browser and require careful anti-interception/callback handling,
- compromised email accounts remain an account-takeover path,
- member data import may have lower email completeness than phone completeness; this requires pilot validation rather than assumption.

Email verification remains a credible fallback/alternative, especially where a member lacks a safe individually controlled mobile number.

### Option C: Managed password-based member login

Use phone/email (or another approved username identifier) plus a password, with password storage/verification and recovery delegated to a managed authentication provider.

Potential advantages:

- does not incur SMS cost on every routine login,
- can work during SMS delivery disruption after account creation,
- mature provider support and familiar account model.

Tradeoffs:

- member must create/remember a password for a deliberately minimal Phase 1 experience,
- password reuse and credential stuffing become material threats,
- password reset/recovery becomes a support/security workflow,
- password policy and breached-password protections must be maintained through the provider/security policy,
- first-time Member claiming remains unsolved: a password account still must be safely linked to the correct Member record.

This option is technically credible but currently has worse Phase 1 member-friction/support fit than managed passwordless verification.

### Option D: Hybrid / step-up enrollment

Use a normal verified phone/email method for routine authentication, but require additional controlled evidence for selected first-time claim or recovery states.

Examples of additional evidence categories that may be acceptable after later policy review include:

- a staff-issued one-time activation/invite,
- an explicit in-gym enrollment step,
- an existing verified secondary channel,
- a provider-supported reverification method,
- authorized staff-assisted verification for ambiguous/reassigned/already-claimed cases.

The additional proof must not be an easily discoverable operational fact or predictable member reference.

Strengths:

- keeps normal login low-friction,
- targets stronger assurance at the actual account-takeover boundary,
- handles recycled/shared/ambiguous identifiers more safely.

Tradeoffs:

- more states and support procedure to design,
- staff-assisted paths create social-engineering risk,
- exact evidence policy requires pilot/security validation.

This option is recommended as an **adjunct to the primary verification method**, not as a requirement for every login.

### Option E: Staff-assisted Member activation / recovery

Authorized gym staff approves or establishes the Member self-service link after an identity-verification procedure.

Strengths:

- useful when imported data is ambiguous, old contact is inaccessible, or a number appears reassigned,
- can leverage in-person gym context,
- provides a controlled recovery route for pilot operations.

Tradeoffs:

- operational burden and queueing,
- weak or undocumented front-desk procedures can become the easiest account-takeover path,
- social engineering and insider abuse risk,
- poor remote usability,
- authorization role/capability must be separately decided under `D-ARCH-015`.

This is not recommended as the routine Phase 1 login method. It remains a controlled claim/recovery fallback if a documented verification procedure, named capability, tenant scope, reason, and audit are provided.

## 7. Evaluation

### 7.1 Verification method matrix

| Criterion | Phone OTP | Email OTP / Magic Link | Password | Hybrid / Step-Up Enrollment | Staff-Assisted |
|---|---|---|---|---|---|
| Phase 1 member usability | **Strong** for phone-owning members; no password | Strong when email is current; app-switch/link friction possible | Moderate/Weak; account/password management | Strong for routine login; extra friction only at risky claim/recovery | Weak as routine method |
| Fit with current gym contact evidence | **Strong candidate**; persona explicitly includes mobile lookup, but unique/current phone coverage is not yet measured | Unknown/Moderate; canonical requirements do not prove email coverage | Depends on chosen username/contact | Complements phone/email data quality | Useful for exceptions |
| Verification strength | Proves current telecom-channel control | Proves current inbox control | Proves knowledge of provider-managed secret | Can raise claim/recovery assurance | Depends heavily on staff procedure |
| Initial account claiming | **Insufficient alone** for pre-existing Member | Insufficient alone for pre-existing Member | Insufficient alone | **Strongest fit** for risky/ambiguous first claim | Strong when controlled, high ops cost |
| Recovery | Phone loss/change is challenging | Email loss/change is challenging | Password reset still needs recovery channel | **Strong** when multiple recovery paths exist | Useful fallback |
| Phone reassignment risk | **Material** | None directly | If phone username/recovery is used, still relevant | Designed to mitigate | Can mitigate if procedure is strong |
| SIM-swap exposure | **Material** | None directly | Depends on recovery/MFA channel | Step-up can reduce sensitive-change risk | Procedure-dependent |
| Shared identifier behavior | Must detect ambiguity | Must detect ambiguity | Username can still be shared/mis-keyed if contact-based | Explicit disambiguation | Explicit staff disambiguation |
| Delivery reliability | Carrier/provider dependent | Email provider/spam dependent | Login itself independent after setup | Depends on primary/secondary method | Staff availability dependent |
| Abuse resistance | Requires OTP bombing/brute-force/spend controls | Requires send/brute-force/enumeration controls | Credential stuffing/brute-force controls | More controls but focused on risky flows | Social engineering/insider controls |
| Cost exposure | **Highest variable transport cost** | Lower variable send cost generally; provider dependent | Lower per-login transport cost | Added support/verification cost only on selected flows | High staff labor cost |
| Support burden | Moderate: delivery/number change | Moderate: delivery/email change | Higher: reset/password issues | Moderate, concentrated on edge cases | **Highest** if common |
| Web compatibility | Strong | Strong; magic links need cross-device care | Strong | Strong | Strong operationally |
| Future native compatibility | Strong | Strong | Strong | Strong | Independent of client delivery |
| Managed-provider compatibility | **Strong** | **Strong** | **Strong** | Strong if GymPulse owns link policy | Provider-independent |
| Provider portability | Moderate; retain Principal/Member link, remap provider subject | Moderate | Moderate; credential hash portability may be limited | **Strong architecture portability** | Strong if audit/link state is internal |
| Privacy | Phone disclosed to auth/SMS providers | Email disclosed to auth/email providers | Identifier + credential metadata at provider | May add verification metadata; minimize it | Staff access to sensitive recovery context must be minimized |
| Tenant isolation | Safe only with GymPulse tenant-aware link resolution | Same | Same | **Strong when claim context is explicit** | Must be tenant-scoped |
| Implementation complexity | Moderate | Moderate | Moderate | Moderate/High claim-state complexity | Moderate technology, high process complexity |
| Reversibility | Medium | Medium | Medium; credential migration can be harder | High if Principal/Member links stay provider-independent | High architecturally |
| Overall GymPulse Phase 1 fit | **Best routine candidate, gated by pilot phone/data/SMS validation** | Credible secondary/fallback candidate | Credible but more friction/support than needed | **Recommended companion for claim/recovery risk** | Exception/recovery only |

### 7.2 Evaluation conclusion

The current evidence does not justify passwords or staff approval as the normal repeated member-login experience.

Phone OTP/passwordless best matches the current Phase 1 member UX and phone-centric operational evidence, **provided** the design does not equate phone control with Member ownership and provided pilot validation demonstrates acceptable phone uniqueness/currentness, delivery, abuse, cost, and recovery behavior.

The risk that makes pure phone lookup unacceptable is not primarily OTP cryptography. It is **account binding**:

```text
current possession of phone X
  !=
permanent ownership of historical Member record associated with phone X
```

Therefore the strongest current direction is Option A for routine verification plus the risk-sensitive claim/recovery controls of Option D, with Option E available only as a controlled audited exception. Email code/magic link remains a credible alternate/fallback verification channel if pilot data or provider/market constraints make phone OTP unsuitable.

## 8. Proposed Decision

**Propose managed phone OTP/passwordless as the primary Phase 1 member verification method, combined with explicit GymPulse Member claiming/linking and stronger controlled enrollment/recovery for ambiguous, reassigned, already-claimed, or high-risk cases.**

This is a **Proposed ADR recommendation only**. Canonical `D-SEC-002` remains `OPEN` until explicit approval evidence changes it.

If later accepted, the architecture rules are:

1. Routine member verification should use a managed authentication service to issue and verify a bounded phone OTP/passwordless challenge. GymPulse does not build custom SMS/OTP credential infrastructure.
2. Successful OTP verification proves current control of the phone channel according to the provider contract. It does not itself grant Member access.
3. Trusted GymPulse code verifies/normalizes provider identity evidence and resolves `provider + immutable subject/reference` through `AuthIdentity` to a stable internal Principal.
4. A Principal gains member self-service only through an explicit Member access link controlled by GymPulse.
5. A raw phone number, email, provider subject, OTP result, provider role, or provider profile does not become the canonical Member ID or business authorization source.
6. Member claiming must operate in explicit/safely resolved tenant/gym context and must not expose cross-tenant matches.
7. Zero-match, multiple-match, and already-claimed cases do not auto-create/guess/overwrite a Member link.
8. One safe unclaimed candidate may proceed through an explicit one-time claim/link operation only after verification, tenant/context validation, claim-eligibility checks, and concurrency-safe persistence.
9. Concurrent claims for the same Member must be durably serialized/rejected so two Principals cannot both acquire the same member-self relationship.
10. Recycled/reassigned-number suspicion, ambiguous mapping, already-claimed records, account recovery, and authentication-channel changes require a controlled higher-assurance path rather than raw phone equality.
11. Staff-assisted activation/recovery may exist as a fallback only with a separately authorized named capability, correct tenant scope, explicit target Member, reason, documented verification procedure, and audit record. This ADR does not assign that capability to a role.
12. Normal member reauthentication to an already-linked Principal should not require staff approval or multiple factors by default.
13. Email OTP/code/magic-link remains an acceptable alternate/fallback channel if later product/provider evidence supports it; this ADR does not require every member to have email.
14. OTP challenges must support bounded validity, single-use semantics, attempt limits, resend/request limits, replay prevention, challenge/purpose binding, safe expiration, generic error behavior, and observable delivery/failure state. Exact values remain later security/provider implementation policy.
15. Verification challenges should be bound to at least the intended destination and verification purpose, plus a server/provider challenge reference. Additional client/session context binding may be used where provider/security evidence justifies it.
16. A code issued for one purpose (for example routine sign-in) must not silently authorize another purpose (for example changing the authentication channel or recovering an already-claimed account) without the required additional policy.
17. Member-facing responses should resist enumeration. Unknown, known, already-linked, disabled, and ambiguous identifier states should not reveal unnecessary tenant/Member details before sufficient verification/context exists.
18. OTP delivery/provider failure creates no AuthIdentity/Principal/Member link and no partial canonical business state.
19. Successful verification transitions into the session architecture proposed by `ADR-0007`; the OTP itself is not a reusable session credential and is not re-sent for every protected API request.
20. Current GymPulse state may revoke self-service access after authentication identity remains valid, such as when a Member is blocked, self-service link is revoked, or another approved account-access restriction applies. Exact business-state semantics remain subject to `D-DATA-007` and authorization policy.
21. Member authentication does not establish QR validity, branch authorization, membership eligibility, or payment success. Those remain separate verified server-side checks.
22. Authentication OTP SMS transport is not automatically the same provider or consent/policy as business WhatsApp/SMS messaging. `D-PROVIDER-002` remains separately governed.
23. Provider-specific automatic account linking must be reviewed and contained. It must never directly create or transfer a GymPulse Member-self link based solely on mutable contact equality.
24. Provider migration should preserve the stable Principal, Member link, tenant relationships, business history, and audit history where practical; provider subject remapping/reverification is isolated to the identity integration boundary.

This proposal does **not** select or accept:

- Supabase Auth,
- Clerk,
- Auth0,
- any SMS/telecom provider,
- any email provider,
- any business messaging provider,
- exact OTP length,
- exact OTP TTL,
- exact resend delay,
- exact request/attempt limit,
- exact lockout duration,
- exact session/access/refresh lifetime,
- exact maximum devices,
- an MFA mandate,
- a native member application,
- Next.js,
- RLS,
- a database engine,
- a persistence library,
- an AuthIdentity/Principal/Member-link schema.

## 9. Account Claim and Recovery Model

### 9.1 Account claim state matrix

| Verified identifier / current state | Required posture |
|---|---|
| No eligible Member match in the safely resolved tenant context | Do not create a Member silently. Return a generic no-link/support/enrollment outcome; allow a controlled invitation/enrollment/support path without revealing other tenant records. |
| One safe unclaimed candidate | Allow an explicit one-time claim/link operation after verification, tenant/context checks, claim eligibility, and concurrency protection. Do not treat phone equality alone as the authorization decision. |
| Multiple candidate Members | Do not guess, expose all candidates, or link all. Enter controlled disambiguation/recovery. |
| Candidate already linked to another Principal/AuthIdentity | Do not overwrite. Treat as account recovery, transfer/security, or support event requiring explicit controlled handling and audit. |
| Existing linked Principal re-authenticating through its established provider identity | Normal authentication; resolve the existing Principal and Member-self link. Do not re-run historical phone-to-Member guessing on every login. |
| Phone/email changed by authenticated member | Verify the new channel, require current account/recovery authority, update identity linkage intentionally, preserve Principal/Member IDs/history, and review/revoke old path according to later policy. |
| Reassigned-number suspicion or high-risk re-link | Require higher-assurance recovery/re-link rather than OTP-only transfer; use available previous/secondary channel or authorized staff process where policy permits. |
| Verified channel belongs to a disabled/self-service-revoked Member relationship | Authentication may succeed but GymPulse access remains denied according to current internal authorization/business state; do not leak unnecessary reason detail. |

### 9.2 Routine login after a safe link exists

Once an `AuthIdentity -> Principal -> Member` relationship is securely established, routine authentication should resolve the same stable Principal from provider identity evidence.

The runtime should not repeatedly infer the Member relationship from mutable phone/email each time.

Conceptually:

```text
phone OTP verification
  -> provider identity evidence
  -> existing AuthIdentity
  -> stable Principal
  -> existing explicit Member-self link
  -> current authorization
  -> ADR-0007-compatible session
```

### 9.3 First-time claim

First-time claim is a binding operation, not ordinary login.

Minimum architecture checks:

1. authentication channel successfully verified,
2. safe tenant/gym context established without cross-tenant enumeration,
3. claim candidate evaluated,
4. candidate is eligible and not already claimed,
5. ambiguity/reassignment risk assessment does not require higher assurance,
6. explicit claim intent captured,
7. durable concurrency-safe link created exactly once,
8. security/audit event emitted with no OTP secret.

Exact UI, data schema, or staff procedure is not selected here.

### 9.4 Recovery

Recovery covers at least:

- lost phone,
- changed phone,
- lost email access if email is used,
- inaccessible provider account/session,
- device loss,
- duplicate/ambiguous account,
- already-claimed Member,
- suspected number reassignment,
- provider migration/forced reauthentication.

Recovery should use the strongest currently available legitimate authority, potentially:

```text
existing authenticated session
or
secondary previously verified channel
or
provider-supported recovery/reverification
or
authorized staff-assisted process with documented identity verification
```

Recovery must not be substantially weaker than normal authentication and must not rely solely on weak knowledge factors.

### 9.5 Staff-assisted recovery

If retained, staff-assisted recovery/linking must require all of:

```text
named recovery/link capability
current staff Principal
correct tenant/gym scope
explicit target Member/Principal
required reason/source
approved identity-verification procedure
no cross-tenant lookup/disclosure
no silent overwrite of existing link
audit record
```

The exact capability name and which role receives it belong to `D-ARCH-015` and the future authorization policy. This ADR does not grant recovery authority to Front Desk, Manager, or Owner by title.

### 9.6 Phone/email channel change

A channel change is a sensitive authenticator-binding operation.

Required posture:

```text
current account/session or approved recovery authority
  + verify new destination
  + detect collision/ambiguity
  + update AuthIdentity/channel intentionally
  + preserve Principal + Member link + business history
  + review old path/session effects under D-SEC-004
  + auditable security event
```

### 9.7 Recycled/reassigned phone numbers

A newly issued SIM/phone number can allow a different person to receive OTPs previously associated with an old Member's contact information.

Therefore:

- an already-established AuthIdentity/Principal/Member link is not automatically transferred merely because a new claimant verifies the same phone string,
- already-claimed or suspicious re-link states require recovery/higher assurance,
- inactive/stale records may require controlled re-verification before claim,
- previous/secondary verified channel notification may be used where technically available and privacy-safe, but is not mandated by this ADR,
- link/re-link/recovery actions are auditable,
- provider/network risk signals such as recent SIM change/number porting may inform later risk policy when available, but the architecture cannot depend on universal availability of those signals.

### 9.8 SIM swap and high-risk actions

Phone OTP is not assumed to be sufficient for every future sensitive action.

Phase 1 should distinguish routine self-service from higher-risk security operations:

```text
Routine:
  view own membership/attendance
  check in after separate QR + membership validation
  initiate renewal/payment
  view own canonical payment state

Higher-risk identity operations:
  first claim when evidence is ambiguous
  authentication-channel change
  already-claimed account recovery/transfer
  suspected reassignment
  security-response re-link
```

A later security policy may require reauthentication, secondary verification, or staff-assisted controls for selected high-risk identity operations. This ADR does not impose MFA for every normal member action.

## 10. Security and Privacy Impact

### 10.1 Authentication versus authorization

The final trust chain remains:

```text
verified member authentication evidence
  -> GymPulse Principal
  -> explicit Member-self link
  -> current tenant/resource scope
  -> current named capability / self policy
  -> application/domain rule
```

Successful phone/email verification never means unrestricted Member, gym, branch, payment, or staff access.

### 10.2 Member self-only boundary

Normal member authorization should be derived from the explicit Member-self relationship, not an arbitrary member ID supplied by the client.

A protected request shaped conceptually like:

```text
/member/{arbitraryMemberId}
```

must still prove that the requested Member is the one linked to the Principal, or use an equivalent self-scoped server query that does not permit arbitrary cross-member selection.

### 10.3 QR check-in boundary

Member authentication and gym QR/session validation remain distinct:

```text
verified Member Principal
  + server-verifiable QR/session token
  + branch validation
  + membership eligibility
  + duplicate rule
  -> attendance effect
```

Scanning a gym QR code does not authenticate the human by itself. Possession of a static member QR/card/reference is also not sufficient protected self-service authentication unless separately designed and approved.

### 10.4 Payment boundary

Member authentication authorizes the member to attempt permitted self-service actions. It does not establish payment truth:

```text
authenticated Member
  -> may initiate allowed renewal/payment
  -> payment provider evidence verified separately
  -> canonical payment state/effect
```

A return URL, OTP success, or authenticated session cannot grant membership entitlement without verified payment/business rules.

### 10.5 OTP lifecycle control categories

A future provider/configuration must support:

- short/bounded validity,
- single-use verification,
- attempt limits,
- request/resend limits,
- replay prevention,
- challenge and purpose binding,
- expiration,
- provider/application abuse controls,
- safe generic errors,
- no raw OTP logging/audit storage.

Exact values are intentionally not specified.

### 10.6 Enumeration resistance

Before sufficient verification/context, member flows should avoid exposing whether:

- the phone/email exists,
- a Member exists in a named tenant,
- the Member is active/expired/blocked,
- the contact maps to one or several records,
- the Member is already claimed.

Responses may use generic outcomes such as "If this identity is eligible, continue with the verification/link flow" or a generic support path. Exact UX copy is not selected here.

### 10.7 Sensitive logging

Never log or audit:

- OTP codes,
- email magic-link tokens,
- session secrets,
- refresh tokens,
- full Authorization headers,
- raw recovery tokens,
- complete authentication cookies.

Safe diagnostics may contain:

- correlation/request ID,
- provider,
- opaque challenge reference,
- failure category,
- internal Principal after resolution,
- safe tenant context after authorization resolution,
- redacted/masked destination only where operationally required.

### 10.8 Privacy

Phone numbers and email addresses are personal data.

Provider/implementation review must minimize:

- copied identity metadata,
- unnecessary logging,
- support/admin visibility,
- telemetry exposure,
- long-lived challenge/recovery data.

Provider region, retention, export/deletion, and admin-access implications remain governed by `D-SEC-001`, `D-SEC-005`, and `D-SEC-006`. This ADR does not invent retention periods.

## 11. Reliability, Performance, and Abuse Impact

### 11.1 Abuse scenarios

The architecture must tolerate and detect at least:

- OTP bombing,
- SMS-cost amplification,
- verification brute force,
- destination spraying,
- phone-number enumeration,
- automated/bot account-claim attempts,
- recovery abuse,
- repeated resend abuse,
- duplicate verification completion,
- concurrent Member-claim races.

### 11.2 Abuse-control layers

Controls should be composable across:

```text
provider
application edge
verified/unverified destination
challenge
IP/network
client/device/browser signals where appropriate
account/Principal after resolution
tenant after safe resolution
```

Potential control categories:

- provider rate/abuse controls,
- destination-level request/resend controls,
- challenge-level attempt limits,
- IP/network velocity controls,
- device/client risk signals where privacy-appropriate,
- progressive delay/friction,
- CAPTCHA/challenge where justified,
- spend/volume alerts,
- anomaly monitoring,
- operational blocking/recovery controls.

No numerical limit is accepted by this ADR.

### 11.3 Delivery failure

If SMS/email delivery is delayed, duplicated, filtered, or unavailable:

- no Member link is created before verification succeeds,
- retries/resends remain challenge-controlled,
- expired/superseded challenges are rejected according to provider policy,
- duplicate provider/application completion cannot create duplicate identity/member links,
- users receive a safe retry/support outcome,
- canonical Member/Membership/Attendance/Payment state remains unchanged.

### 11.4 Provider outage

A verification-provider or SMS transport outage may make new login/claim/recovery temporarily unavailable.

Protected access fails safely rather than:

- falling back to raw phone lookup,
- granting access from an unverified identifier,
- mutating membership/attendance/payment state,
- auto-linking a Member.

Already-authenticated sessions follow `ADR-0007` and `D-SEC-004`; this ADR does not redefine their lifetime/outage behavior.

### 11.5 Cost architecture

Phone OTP has variable cost driven by:

- verification requests,
- resends,
- destination country/network,
- authentication-provider pricing,
- SMS transport pricing,
- fraud/OTP bombing,
- support/recovery volume.

The architecture must expose enough request/verification/delivery/failure/spend signals to control abuse. Volatile provider prices are not embedded in this ADR because no provider/market is selected.

### 11.6 Performance and UX

Normal member authentication should tolerate:

- slower mobile networks,
- delayed SMS/email delivery,
- resend flows,
- wrong-number correction before binding,
- switching between messaging/email and browser/app,
- low-end/older devices without assuming a specific OS version.

Autofill or one-time-code platform features may be used later where secure and accessible, but no client framework/device dependency is created by this ADR.

## 12. Operations and Observability Impact

### 12.1 Security-sensitive events

The future implementation should emit safe audit/operational events for categories such as:

- member verification requested,
- verification success/failure category,
- member account claimed,
- AuthIdentity linked,
- AuthIdentity re-linked,
- ambiguous/duplicate Member-link condition,
- already-claimed recovery path initiated,
- member authentication channel changed,
- staff-assisted recovery/linking,
- member self-service access revoked,
- recovery completed/failed,
- abuse/rate-control event,
- suspicious repeated verification failure,
- provider delivery/verification outage.

Not every high-volume failed OTP attempt must become a permanent business audit record; security telemetry and durable audit have different purposes. Sensitive state changes such as claim, re-link, channel change, staff-assisted recovery, and self-service revocation should be attributable and auditable according to later audit/security policy.

### 12.2 Audit context

For sensitive link/recovery changes, capture where applicable:

```text
stable actor / Principal or authorized staff actor
target Principal / Member reference
tenant/gym scope
action type
time
reason/source
request/correlation reference
```

Never include OTP/magic-link/recovery secrets.

### 12.3 Provider operations

Provider evaluation should verify:

- separate development/test/staging/production configuration,
- server-side identity evidence verification,
- phone OTP and/or email code capability,
- challenge lifecycle behavior,
- resend/verification rate controls,
- bot/abuse controls,
- session integration compatible with `ADR-0007`,
- phone/email change/reverification capability,
- account/identity-linking behavior and ability to prevent provider defaults from bypassing GymPulse linking,
- recovery/admin APIs and auditability,
- safe provider logs,
- provider subject stability,
- export/migration/exit capability,
- SMS transport configuration and market availability where applicable.

### 12.4 Authentication SMS versus business messaging

An authentication platform may deliver OTP through its own SMS integration or require a separate SMS transport provider.

This does not select the business messaging provider under `D-PROVIDER-002`.

Authentication verification traffic and product communications may have different:

- provider contracts,
- templates,
- consent/legal basis,
- delivery reliability requirements,
- abuse controls,
- pricing,
- retention/logging policy.

## 13. Testing and Validation

Before this ADR can be accepted/provider-bound, non-production validation must cover at least:

1. **Normal member verification** produces verified provider evidence and resolves the intended existing Principal/member link or enters the claim path safely.
2. **Wrong OTP/code** fails without creating authentication/link state.
3. **Expired challenge** is rejected.
4. **Reused challenge/code** is rejected or idempotently resolves the already-completed result without creating another link/session effect.
5. **Excess verification attempts** are controlled by provider/application policy without revealing account existence.
6. **Excess requests/resends** are controlled without hard-coded ADR thresholds.
7. **Provider delivery failure** creates no partial Member link.
8. **Unknown identifier** follows enumeration-resistant behavior.
9. **Zero Member matches** does not auto-create a Member and does not disclose other tenant data.
10. **One safe unclaimed Member match** completes an explicit claim exactly once.
11. **Multiple Member matches** never auto-link and do not disclose sensitive candidate information.
12. **Member already claimed** cannot be overwritten by a new OTP-verified Principal.
13. **Same phone across multiple records** enters controlled ambiguity handling.
14. **Phone number changed** preserves stable Principal/Member identity while verifying and intentionally updating the authentication channel.
15. **Simulated recycled-number/re-link scenario** proves a new phone owner cannot silently inherit an already-claimed historical Member account.
16. **Lost-phone recovery** uses the approved recovery authority and does not reduce security to raw contact lookup.
17. **Staff-assisted recovery** records appropriate actor/scope/reason/audit and follows the approved verification procedure.
18. **Unauthorized staff recovery attempt** is denied and does not reveal cross-tenant account data.
19. **Cross-tenant linking negative test** proves a verified identifier cannot enumerate or claim a Member in an unauthorized gym/tenant.
20. **Member self-only authorization after linking** proves `FR-AUTHZ-003` for all protected member paths.
21. **Blocked/deactivated/self-service-revoked Member after valid authentication** is denied from protected business access according to current internal policy without waiting for the auth session to expire.
22. **Provider outage** fails new verification/claim safely and does not corrupt canonical business data.
23. **Account enumeration test** compares unknown/known/already-linked/disabled/ambiguous flows for unintended disclosure and timing/state discrepancies.
24. **OTP bombing/cost-abuse test** exercises destination/IP/device/challenge/provider controls and spend monitoring without relying on arbitrary ADR limits.
25. **Concurrent claim race** proves two Principals cannot both claim the same Member-self relationship.
26. **Duplicate verification callback/completion request** does not create duplicate AuthIdentity/Principal/Member links.
27. **Identity-provider migration/remapping exercise** preserves internal Principal/Member linkage and documents forced reauthentication/recovery effects.
28. **Representative member-device web UX** covers slow networks, delayed delivery, resend, wrong-number correction, accessibility, and common low-end/mobile browser behavior.
29. **Future native compatibility review** confirms the verification method can feed the same provider-independent Principal/session architecture if native delivery is later approved.
30. **QR separation test** proves a gym QR/session token alone cannot authenticate a Member and an authenticated Member still cannot bypass QR/branch/membership checks.
31. **Payment separation test** proves member authentication or provider return URL cannot mark a payment paid or grant entitlement.
32. **Secret/log test** verifies OTPs, magic-link tokens, session secrets, Authorization headers, refresh tokens, and recovery secrets are absent from logs/audit/client telemetry.

No tests, provider sandbox, SDK, schema, or implementation are created by Task 0016.

## 14. Migration and Rollout

There is no member-authentication implementation to migrate today.

If this ADR and its dependencies are later approved, rollout should remain evidence-driven:

```text
confirm pilot member-contact data quality
  -> approve D-SEC-002 method
  -> approve/define dependent session and recovery policy where required
  -> select managed authentication provider separately
  -> select/configure authentication transport provider if required
  -> create isolated non-production environment
  -> validate phone/email normalization and duplicate/shared/reassigned scenarios
  -> implement provider verification -> AuthIdentity -> Principal boundary
  -> implement explicit Member claim/link workflow
  -> implement controlled recovery/re-link/channel-change workflow
  -> implement abuse/enumeration controls and safe telemetry
  -> run concurrency/tenant/self-only/QR/payment negative tests
  -> pilot with test/non-production identities and representative devices
  -> review delivery reliability/cost/support/abuse evidence
  -> obtain production security/provider/jurisdiction approvals
```

### 14.1 Existing/imported Member records

Do not bulk-create authenticated identities or automatically claim Members from imported phone/email equality.

Existing data must be classified during rollout for at least:

- missing contact,
- invalid/un-normalizable contact,
- duplicate/shared contact,
- unique unclaimed contact,
- already-linked identity,
- suspected stale/reassigned contact,
- cross-tenant duplicate contact.

Data quality informs the claim path; it does not become authentication proof by itself.

### 14.2 No silent Member creation

A successful OTP/email verification with no eligible Member match must not silently create a new canonical Member record. Member creation remains an explicit business workflow governed by Member-domain requirements and authorization.

## 15. Reversibility and Provider Exit

The verification method and provider are related but not identical decisions.

Choosing phone OTP/passwordless as a method does not require storing provider IDs throughout GymPulse.

Provider exit should preserve where practical:

```text
stable GymPulse Principal IDs
explicit Principal -> Member-self links
tenant/gym relationships
business history
audit history
current authorization state
```

Provider-specific migration should be concentrated in:

- `AuthIdentity` provider/subject mappings,
- verification-channel/factor migration where provider support allows,
- forced re-verification where migration is impossible or unsafe,
- provider session invalidation,
- provider adapter/client authentication integration,
- transport/provider configuration.

A provider migration may require members to re-verify a phone/email channel. It must not require rewriting historical Member, Attendance, Membership, Payment, or audit actor identity to a new provider subject ID.

If later evidence shows phone OTP is unsuitable because of phone-data quality, delivery/regulatory constraints, fraud/cost, or recovery risk, the architecture can move to email verification, another managed passwordless method, passkey/stronger-auth method in a later scope, or a different combination while preserving Principal/Member linkage semantics.

## 16. Risks and Mitigations

| Risk | Mitigation / acceptance gate |
|---|---|
| Pilot Member phones are missing/stale/duplicated | Measure real pilot data before acceptance; do not infer uniqueness; keep controlled alternate/recovery path |
| Recycled number takes over historical account | Never transfer already-claimed Member from phone equality alone; require recovery/higher assurance |
| SIM swap compromises routine OTP | Treat SMS as current channel control only; strengthen channel-change/recovery/re-link; consider provider risk signals where available |
| Shared/family contact creates ambiguity | No auto-link on multiple candidate records; controlled disambiguation |
| SMS delivery is unreliable | Validate actual target network/provider delivery; keep safe retry/support/alternate path; no fallback to unverified access |
| OTP bombing creates user harm/cost | Provider + application request/resend/attempt controls, progressive friction/CAPTCHA where justified, monitoring/spend alerts |
| Enumeration leaks tenant/member state | Generic/non-disclosing response behavior and tenant-safe resolution; test timing/state differences |
| Staff recovery becomes takeover bypass | Named capability, tenant scope, explicit target, reason, verification procedure, audit, no silent overwrite |
| Provider automatically links identities unsafely | Keep provider identity linking separate from GymPulse Member linking; review/configure provider defaults before production |
| Phone change loses business identity | Preserve Principal/Member IDs; verify new channel; controlled old-channel/session treatment |
| Provider/SMS outage blocks login | Fail safely; do not corrupt business state or bypass verification |
| Passwordless method creates permanent OTP dependence | OTP only establishes authentication; normal post-verification access uses ADR-0007-compatible session |
| SMS method becomes inappropriate under final jurisdiction | `D-SEC-001` remains Open; final provider/market approval must verify authoritative requirements before production |
| Provider exit traps business identity | Keep provider subjects behind AuthIdentity; preserve stable Principal/Member link and plan re-verification when needed |
| Exact security limits are guessed too early | Define control categories here; choose numerical values later from provider constraints, threat analysis, pilot data, and security review |

## 17. Open Questions

- Who is the authorized decision owner for `D-SEC-002`?
- What percentage of pilot Member records have a current, individually controlled mobile number?
- How many pilot records have duplicate/shared phone numbers or missing/invalid contact data?
- Is phone number the preferred real-world member contact for the actual pilot, and what is the observed SMS delivery environment?
- What launch jurisdiction/market will `D-SEC-001` establish, and what authoritative telecom/identity/privacy requirements apply there?
- What exact claim-assurance rule distinguishes a "safe unclaimed candidate" from an ambiguous/high-risk case?
- What recovery evidence/procedure is acceptable for lost/reassigned phone scenarios?
- Which roles/capabilities, if any, may perform staff-assisted recovery under `D-ARCH-015`?
- Is email available/current enough to serve as a practical fallback or secondary recovery channel?
- Which managed authentication provider best supports the approved method, session architecture, anti-abuse controls, provider exit, test environments, and launch market?
- If an Auth platform requires an external SMS transport provider, which authentication-specific provider is acceptable and how is it kept separate from `D-PROVIDER-002` business messaging?
- What exact OTP/session/revocation/device policy will `D-SEC-004` approve?
- Should selected high-risk identity operations require provider-supported reauthentication/step-up once the normal member method is accepted?
- What support/recovery operational load is acceptable for the pilot?

## 18. Decision Evidence

### 18.1 Repository evidence

Latest structured repository evidence establishes:

- `D-SEC-002` is `P0 OPEN` and is the next bounded ADR item after `ADR-0007`.
- `FR-IDENTITY-003` requires verified member identity and prohibits raw mobile number as authorization proof.
- `FR-AUTHZ-003` requires self-only member access.
- `FR-ATTENDANCE-002` treats verified member identity as a separate prerequisite from QR/session token integrity, branch context, membership eligibility, and duplicate policy.
- the Member persona is mobile-first and values minimal repeated interaction; Front Desk workflow evidence includes member lookup by name/mobile/reference.
- `ADR-0007` proposes managed authentication with provider-independent `AuthIdentity -> Principal -> Member link` architecture and keeps member method separate.
- `D-SEC-004` remains `OPEN`; exact session policy is not decided.
- `D-ARCH-015` remains `PROPOSED`; business authorization remains separately governed.
- `D-DATA-004` remains `PROPOSED`; Member and authenticated User/AuthIdentity remain separate concepts.
- `D-DATA-007` remains unresolved and does not supply identity/entitlement proof.
- `D-SEC-001` remains `OPEN`; the repository does not currently establish a launch jurisdiction whose telecom rules can be assumed here.
- no repository approval evidence selects phone OTP, email OTP, password login, an authentication provider, SMS provider, OTP policy, or member recovery policy.

### 18.2 Current official security research

Research date: `2026-09-08`.

Primary guidance reviewed:

- NIST SP 800-63B-4, *Digital Identity Guidelines: Authentication and Authenticator Management* (final July 2025): PSTN out-of-band authentication is a restricted authenticator category; verifiers should consider risk indicators such as device swap, SIM change, number porting, and abnormal behavior. GymPulse uses this as security design evidence, not as a claim that a specific NIST AAL is legally required.
- OWASP Authentication Cheat Sheet: authentication/recovery responses should avoid user-enumeration discrepancies and use generic behavior where appropriate.
- OWASP Multifactor Authentication Cheat Sheet: OTP handling should use bounded lifetime, single-use behavior, strict attempt control, invalidation after success, and should not log OTP values.
- OWASP Forgot Password Cheat Sheet: recovery should use consistent responses, protected reset codes/tokens, and anti-automation controls; weak recovery can become an account-takeover path.
- OWASP Session Management Cheat Sheet: high-risk account/security changes and recovery can require reauthentication; exact GymPulse session policy remains under `D-SEC-004`.

Primary references:

- <https://pages.nist.gov/800-63-4/sp800-63b/authenticators/>
- <https://csrc.nist.gov/pubs/sp/800/63/B/4/final>
- <https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html>
- <https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html>
- <https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html>
- <https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html>

### 18.3 Representative managed-auth provider research

Current official documentation was reviewed for a small representative set already relevant to `ADR-0007`:

- **Supabase Auth**: supports phone OTP/passwordless and phone-number change verification; its phone-auth documentation requires/configures an SMS provider and explicitly recommends rate-limit/CAPTCHA controls to manage SMS abuse/cost. Supabase also provides configurable Auth rate-limit controls. Its identity-linking documentation shows provider-level linking behavior that reinforces the need to keep GymPulse Member linking separately controlled.
- **Clerk**: supports phone and email verification codes in managed authentication flows, provides bot protection and user-enumeration protections, and supports reverification capabilities for sensitive actions. Provider-level user/account behavior remains separate from GymPulse Member claiming.
- **Auth0**: supports passwordless SMS/email OTP and email magic-link approaches, with tenant/provider controls for passwordless delivery and attack protection. Its exact provider/transport choice is not selected here.

Primary references:

- <https://supabase.com/docs/guides/auth/phone-login>
- <https://supabase.com/docs/guides/auth/rate-limits>
- <https://supabase.com/docs/guides/auth/auth-identity-linking>
- <https://clerk.com/docs/guides/development/custom-flows/authentication/email-sms-otp>
- <https://clerk.com/docs/guides/secure/bot-protection>
- <https://clerk.com/docs/guides/secure/user-enumeration-protection>
- <https://clerk.com/docs/guides/secure/reverification>
- <https://auth0.com/docs/authenticate/login/auth0-universal-login/passwordless-login/email-or-sms>
- <https://auth0.com/docs/authenticate/passwordless/authentication-methods>

Material conclusions from current provider research:

1. Phone OTP, email OTP/magic-link, password, and step-up/reverification primitives are available in credible managed-auth products; provider capability does not itself choose the GymPulse method.
2. SMS transport is not necessarily the authentication service itself; some Auth products require/configure a separate SMS delivery provider. Authentication OTP transport therefore must remain separate from `D-PROVIDER-002` business messaging governance.
3. Providers offer meaningful rate/bot/abuse controls, but GymPulse still needs application/business abuse policy, tenant-safe linking, monitoring, and cost controls.
4. Provider account-linking behavior can differ. GymPulse must not let provider-level identity matching automatically create or transfer a Member-self relationship.
5. SMS OTP has material telecom-channel risk; the architectural mitigation is not to pretend it is immutable human identity, but to separate routine verification from high-risk claim/recovery/re-link operations.
6. No current provider evidence requires GymPulse to build custom OTP/password infrastructure.

### 18.4 Acceptance evidence still missing

`ADR-0008` remains `Proposed` and `D-SEC-002` remains `OPEN` because the following evidence is still missing:

- an authorized decision owner/approval,
- validated pilot phone/email completeness and uniqueness,
- duplicate/shared/reassigned-number handling proof,
- representative launch-market SMS delivery/reliability evidence,
- final jurisdiction/telecom/privacy requirements under `D-SEC-001`,
- selected managed authentication provider and non-production verification tests,
- selected authentication-specific SMS transport where required,
- approved account-claim/recovery procedure,
- approved exact OTP abuse/lifecycle policy values,
- approved session/device/revocation policy under `D-SEC-004`,
- concurrency-safe claim implementation proof,
- tenant/self-only/enumeration/OTP-abuse negative test results,
- representative member-device UX evidence,
- provider exit/remapping validation.

## 19. Related Documents

- `README.md`
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
- `ADR-0006-managed-backend-responsibilities.md`
- `ADR-0007-authentication-session-architecture.md`
- legacy migration sources: `../02-user-roles-permissions.md`, `../03-user-flows.md`, `../05-system-architecture.md`, `../12-security-audit.md`, `../16-open-decisions.md`
