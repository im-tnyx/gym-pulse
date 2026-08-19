# GymPulse Security and Audit

## 1. Purpose

Define the baseline security, tenant isolation, privacy, auditability, and operational controls required for GymPulse Phase 1.

This document is an engineering security baseline, not legal/compliance advice. Jurisdiction-specific privacy, tax, health-data, and messaging obligations must be reviewed before production launch.

## 2. Security objectives

GymPulse must protect:

- tenant isolation,
- member identity and contact data,
- attendance history,
- membership state,
- payment metadata,
- receipts,
- staff role assignments,
- audit history,
- provider credentials,
- future fitness/progress data.

Critical integrity goals:

- staff cannot fake online payment success,
- duplicate webhooks cannot double-renew,
- unauthorized users cannot view another tenant,
- attendance corrections remain attributable,
- background jobs cannot escape tenant scope,
- client apps never receive server secrets.

## 3. Threat model summary

Primary threats:

1. cross-tenant data exposure,
2. broken object-level authorization,
3. stolen staff/member session,
4. leaked API/provider credentials,
5. forged payment webhook,
6. duplicate/replayed payment event,
7. QR replay/screenshot abuse,
8. unauthorized attendance correction,
9. unauthorized membership expiry manipulation,
10. notification abuse/spam,
11. sensitive data in logs/analytics,
12. insecure file/storage access,
13. vulnerable dependency/build pipeline,
14. excessive platform-support access,
15. accidental production-data exposure in staging.

## 4. Authentication

Requirements:

- protected staff/owner routes require authenticated session,
- member access requires verified identity method,
- authentication tokens/sessions use secure provider-supported storage,
- logout/revocation supported,
- disabled users cannot continue protected operations indefinitely,
- password reset/OTP flows must prevent account enumeration where practical.

The exact auth provider is open, but security behavior is not optional.

## 5. Session handling

### Web

Prefer secure, HTTP-only cookies when compatible with selected auth architecture.

Required cookie/session protections where applicable:

- Secure,
- HttpOnly,
- appropriate SameSite,
- CSRF protection for cookie-authenticated state-changing endpoints,
- rotation/expiry.

### Mobile

Use platform secure storage for refresh/session secrets according to chosen provider.

Do not persist sensitive tokens in plain AsyncStorage/local storage when avoidable.

## 6. Authorization

Every protected resource request must enforce:

```text
authenticated principal
  + tenant scope
  + branch scope
  + named permission
  + resource business rule
```

Never rely on:

- hidden UI button,
- client role string,
- client-submitted tenant ID,
- obscurity of record IDs.

## 7. Tenant isolation

### Application layer

Repositories/services require tenant context.

### Database layer

Use RLS or equivalent database protection where supported, especially for client-accessible Supabase patterns.

### Storage

Objects use tenant-scoped paths and signed/private access.

### Jobs

Queue payload includes explicit tenant/gym ID and worker verifies scope before data access.

### Analytics

Tenant IDs required on server events; cross-tenant aggregate access reserved for platform-level authorized systems.

## 8. IDOR/BOLA protection

Request:

```text
GET /members/{memberId}
```

must not mean:

```text
SELECT * FROM members WHERE id = memberId
```

without scope.

It should effectively mean:

```text
SELECT authorized member within principal scope
```

If a record exists but caller cannot access it, error behavior should avoid leaking sensitive existence information.

## 9. Role assignment security

Role changes are high impact.

Requirements:

- `roles.manage` permission,
- prevent user from granting scope above their own authority,
- audit actor and before/after assignment,
- revoke access promptly,
- platform roles unavailable through tenant role editor.

## 10. Payment security

### Never store

- raw card number,
- CVV,
- raw UPI PIN/credential,
- payment-provider secret in browser/mobile bundle.

### Webhook

- verify provider signature,
- preserve raw body only as required for verification,
- reject untrusted events,
- dedupe provider event ID,
- validate amount/currency/reference,
- apply effect exactly once.

### Staff UI

No generic `Mark Online Payment Paid` button.

Offline payment is a separate permissioned and audited workflow.

## 11. QR security

Threat:

Permanent QR screenshot reused remotely/indefinitely.

Mitigations:

- short-lived/session-bound QR,
- opaque signed/random token,
- server validation,
- expiry,
- branch binding,
- duplicate visit policy,
- optional future proximity/device controls only if needed.

Do not place sensitive member or secret data in QR payload.

QR design should reduce abuse without making normal gym entry unreliable.

## 12. Attendance integrity

Valid attendance must contain:

- member,
- membership context,
- branch,
- timestamp,
- source.

Assisted attendance additionally requires:

- staff actor,
- reason.

Corrections require:

- permission,
- reason,
- audit record,
- retained original history.

## 13. Membership integrity

Sensitive membership actions:

- backdate,
- change expiry,
- freeze,
- cancel,
- reactivate,
- manual renewal.

Controls:

- named permissions,
- server validation,
- audit,
- optional reason requirement,
- conflict/version protection for concurrent edits.

## 14. Input validation

Validate at API boundary:

- type,
- length,
- format,
- enum,
- money bounds,
- date ranges,
- IDs,
- URLs,
- file metadata.

Then validate domain rules separately.

Client validation improves UX but is not security.

## 15. Output encoding and injection prevention

- use framework-safe rendering,
- sanitize/escape user-provided rich content if introduced,
- use parameterized database queries/ORM safely,
- never concatenate untrusted input into SQL,
- avoid untrusted shell execution,
- validate redirect/deep-link targets.

## 16. Rate limiting

Candidate endpoints for tighter rate limits:

- member OTP/login,
- staff login,
- QR check-in,
- member search,
- payment creation,
- webhook endpoints using provider-aware strategy,
- password reset,
- export generation.

Rate limiting must not become the sole defense against authorization flaws.

## 17. Brute-force and enumeration resistance

For member verification:

- cap OTP requests,
- cap verification attempts,
- expire codes,
- avoid clear `phone exists` disclosure where not required,
- log abuse signals,
- consider device/IP risk only when useful.

## 18. Secrets management

Secrets include:

- database service credentials,
- auth provider secrets,
- payment secrets,
- webhook signing secrets,
- messaging secrets,
- storage signing credentials,
- encryption keys.

Rules:

- store in deployment secret manager/environment,
- never commit,
- never expose in client bundle,
- rotate after suspected exposure,
- separate staging and production credentials,
- minimize developer access.

## 19. Environment separation

At minimum:

```text
local
staging
production
```

Rules:

- separate databases,
- separate provider credentials,
- test payment/messaging modes in staging,
- no automatic production-data clone into preview,
- production secrets unavailable to pull-request preview builds.

## 20. Logs

Structured logs should include safe operational context:

- request ID,
- route/action,
- job ID,
- tenant ID where appropriate,
- error code,
- provider event ID/reference when safe.

Do not log by default:

- passwords,
- OTP values,
- auth tokens,
- payment secrets,
- raw card/UPI data,
- full message bodies,
- sensitive notes,
- full webhook payload when unnecessary.

## 21. Error handling

Client errors should be safe and machine-readable.

Do not expose:

- SQL error details,
- stack traces,
- internal file paths,
- secrets,
- cross-tenant identifiers,
- provider secret responses.

Full diagnostic context belongs in protected server error monitoring.

## 22. Audit logging

Sensitive actions create audit records.

Minimum actions:

- assisted attendance,
- attendance correction,
- membership date/status changes,
- freeze changes,
- plan pricing changes,
- offline payment,
- refund action,
- role assignment,
- risk/renewal configuration change,
- bulk import,
- sensitive export.

## 23. Audit record shape

```text
tenant
gym
branch nullable
actor_type
actor_id
action
resource_type
resource_id
reason nullable
before_summary nullable
after_summary nullable
request_id
created_at
```

Audit summary must redact secrets and avoid duplicating entire sensitive records unnecessarily.

## 24. Audit immutability

Normal tenant UI must not edit/delete audit rows.

Database/admin access still technically can, so operational controls should restrict direct production database access.

For higher assurance later, consider append-only permissions/external audit sinks.

## 25. Data classification

Suggested classes:

### Public

- public gym name/address when intentionally published,
- public plan marketing content.

### Internal

- internal IDs,
- non-sensitive operational configuration.

### Confidential

- member contact details,
- attendance,
- membership history,
- payment metadata,
- follow-up notes.

### Restricted

- provider secrets,
- auth secrets,
- privileged support access,
- security logs with sensitive context.

Future progress/health-like data may require a stricter classification and policy review.

## 26. Data minimization

Phase 1 should not collect:

- detailed medical records,
- diagnoses,
- unnecessary government IDs,
- extensive health metrics,
- transformation photos,

unless a specific product requirement, consent model, retention policy, and security design is approved.

## 27. Follow-up notes privacy

Follow-up notes may include sensitive member context.

Rules:

- keep notes concise,
- restrict to authorized staff,
- discourage recording unnecessary health details,
- do not expose internal notes to member app by default,
- do not send notes to general analytics.

## 28. File uploads

When uploads are introduced:

- validate allowed file type/size,
- use random object keys,
- private bucket by default,
- signed access,
- tenant scope,
- malware scanning where risk warrants,
- strip dangerous metadata if appropriate.

Phase 1 may avoid general member uploads entirely.

## 29. Exports

Sensitive exports should:

- require explicit permission,
- enforce tenant/branch scope,
- record audit event,
- expire download links,
- avoid emailing raw exports automatically,
- minimize fields.

## 30. Backup security

Backups contain production data and require equivalent protection.

- encrypted storage where platform provides it,
- restricted access,
- retention policy,
- restore testing,
- no casual download to developer laptops.

## 31. Dependency security

Repository workflow should include:

- lockfile,
- dependency review/alerts,
- regular updates,
- avoid abandoned high-risk packages,
- CI checks,
- minimal production dependencies.

Do not auto-merge breaking security updates without tests, but do not leave critical issues untriaged.

## 32. CI/CD security

- protected production deployment path,
- secrets unavailable to untrusted PR code,
- least-privilege CI tokens,
- environment approvals if needed,
- build provenance/log retention where supported,
- no plaintext secrets in build output.

## 33. Database access

Production database direct access should be restricted.

Prefer:

- audited/admin tooling,
- read-only roles for diagnostics,
- time-limited elevated access,
- migrations through CI/release process.

Do not use shared root credentials across developers.

## 34. Support access

Future platform support access should require:

- support ticket/reason,
- target tenant,
- limited scope,
- start/end time,
- audit record,
- no default access to all tenant data.

Impersonation, if ever added, needs prominent visual indication and audit.

## 35. Notification security

- provider credentials server-only,
- signed/verified provider callbacks,
- links use opaque short-lived tokens,
- avoid sensitive member data in message content,
- enforce recipient preference/policy,
- limit staff ability to send arbitrary bulk messages.

## 36. Analytics privacy

External analytics should use IDs/pseudonymous identifiers and avoid unnecessary:

- phone,
- email,
- notes,
- payment provider payload,
- message body.

Operational dashboards inside GymPulse can display authorized member identity based on role.

## 37. Incident response baseline

Before production, assign owners for:

- security incident triage,
- payment incident,
- data exposure,
- provider secret rotation,
- production rollback,
- user notification/legal escalation decision.

Minimum incident workflow:

```text
detect -> contain -> preserve evidence -> assess scope -> fix -> recover -> document -> prevent recurrence
```

## 38. Security events worth alerting

Examples:

- repeated cross-tenant authorization failures,
- unusual role changes,
- webhook signature failures spike,
- payment amount mismatch,
- repeated OTP abuse,
- export volume spike,
- background job accessing invalid tenant scope,
- secrets accidentally detected in logs/build.

Avoid alert fatigue. Start with high-confidence signals.

## 39. Privacy/retention policy decisions

Before production define:

- member record retention,
- audit retention,
- payment/receipt retention,
- notification log retention,
- inactive account handling,
- data export/deletion process,
- support access retention,
- backup retention.

These policies require business/legal confirmation and should not be invented by engineering.

## 40. Security testing

Required tests:

- cross-tenant API access,
- cross-branch access,
- member-to-member access,
- privilege escalation,
- direct API action despite hidden UI,
- forged payment webhook,
- duplicate payment webhook,
- QR replay/expiry,
- assisted check-in without permission/reason,
- attendance correction without permission,
- role assignment above actor scope,
- expired signed link,
- staging cannot use production secrets.

## 41. Production security gate

Do not launch real member/payment data until:

- tenant isolation tests pass,
- auth/session design reviewed,
- provider secrets are server-only,
- payment webhook verification works,
- RLS/application authorization tests pass,
- audit events exist for critical mutations,
- logs are reviewed for sensitive leakage,
- backups and restore ownership are defined,
- staging and production are separated,
- privacy/retention open decisions are acknowledged.
