# GymPulse API Contracts

## 1. Purpose

Define the Phase 1 API contract shape, resource boundaries, endpoint conventions, idempotency requirements, errors, pagination, and webhook behavior.

The exact transport implementation may evolve, but client applications must consume stable domain contracts rather than database tables directly.

## 2. API principles

- JSON over HTTPS for application APIs.
- Server-side authentication and authorization.
- Tenant scope derived/verified from authenticated principal.
- Request validation at the API boundary.
- Stable machine-readable error codes.
- Idempotency for retryable mutations.
- No raw provider payloads exposed to clients.
- Money represented in minor units plus currency.
- UTC timestamps in API, localized by client using gym timezone context.
- Pagination for list endpoints.

## 3. Base response conventions

### Success resource

```json
{
  "data": {
    "id": "resource_id"
  },
  "meta": {
    "requestId": "req_..."
  }
}
```

### List

```json
{
  "data": [],
  "page": {
    "nextCursor": null,
    "hasMore": false
  },
  "meta": {
    "requestId": "req_..."
  }
}
```

### Error

```json
{
  "error": {
    "code": "MEMBERSHIP_NOT_ELIGIBLE",
    "message": "Membership is not eligible for check-in.",
    "details": null
  },
  "meta": {
    "requestId": "req_..."
  }
}
```

User-facing messages may be localized at the client. Clients should branch on `error.code`, not parse human text.

## 4. HTTP status guidance

```text
200 OK                    successful read/update
201 Created               resource created
202 Accepted              async processing accepted
204 No Content            successful action without body
400 Bad Request           malformed request
401 Unauthorized          unauthenticated
403 Forbidden             authenticated but unauthorized
404 Not Found             missing or intentionally undisclosed resource
409 Conflict              state/idempotency/business conflict
422 Unprocessable Entity  valid shape but business validation failure
429 Too Many Requests     rate limited
500 Internal Server Error unexpected server error
503 Service Unavailable   temporary provider/system dependency issue
```

## 5. Headers

### Request ID

Server should return:

```text
X-Request-Id: req_...
```

Client may send its own trace identifier if supported, but server must validate format.

### Idempotency

For retryable mutation endpoints:

```text
Idempotency-Key: <opaque-client-generated-key>
```

Server scopes the key by tenant + operation.

## 6. Authentication endpoints

Exact auth provider contract may be external. GymPulse application API requires an authenticated principal for protected routes.

Recommended app-level endpoint:

### GET `/v1/me`

Returns the resolved principal and accessible scopes.

```json
{
  "data": {
    "principalType": "staff",
    "userId": "usr_...",
    "displayName": "Front Desk",
    "assignments": [
      {
        "role": "front_desk",
        "scopeType": "branch",
        "organizationId": "org_...",
        "gymId": "gym_...",
        "branchId": "br_..."
      }
    ]
  }
}
```

Do not return the full permission implementation unless client behavior requires it. Server remains authoritative.

# Member endpoints

## 7. GET `/v1/members`

Staff search/list endpoint.

Query examples:

```text
?q=rahul
?phone=98...
?status=active
?branchId=...
?cursor=...
```

Server ignores/rejects branch filters outside authorized scope.

Response summary:

```json
{
  "id": "mem_...",
  "displayName": "Rahul",
  "phoneMasked": "+91 ******1234",
  "status": "active",
  "primaryBranchId": "br_...",
  "currentMembership": {
    "status": "active",
    "planName": "Quarterly",
    "expiresAt": "2026-09-30T18:29:59Z"
  },
  "lastAttendanceAt": "2026-08-18T12:15:00Z"
}
```

## 8. POST `/v1/members`

Creates member when caller has permission.

Request:

```json
{
  "displayName": "Rahul Sharma",
  "phone": "+9198...",
  "email": null,
  "primaryBranchId": "br_...",
  "joinDate": "2026-08-19"
}
```

Possible errors:

- `MEMBER_PHONE_CONFLICT`
- `BRANCH_FORBIDDEN`
- `VALIDATION_ERROR`

## 9. GET `/v1/members/{memberId}`

Returns member 360 summary appropriate to caller permissions.

The response should not include unrestricted internal notes for member-facing callers.

## 10. PATCH `/v1/members/{memberId}`

Updates allowed profile fields only.

Sensitive status changes may use dedicated endpoints instead of generic PATCH.

# Membership endpoints

## 11. GET `/v1/members/{memberId}/memberships`

Returns membership history.

## 12. POST `/v1/members/{memberId}/memberships`

Creates authorized membership.

Request:

```json
{
  "planId": "plan_...",
  "branchId": "br_...",
  "startAt": "2026-08-20T00:00:00Z",
  "source": "front_desk"
}
```

Server calculates/validates expiry according to plan and approved override rules.

## 13. POST `/v1/memberships/{membershipId}/freeze`

Request:

```json
{
  "startsAt": "2026-08-25T00:00:00Z",
  "endsAt": "2026-09-05T00:00:00Z",
  "reasonCode": "travel",
  "reasonNote": "Optional note"
}
```

Errors:

- `MEMBERSHIP_NOT_FREEZABLE`
- `FREEZE_OVERLAP`
- `INVALID_FREEZE_RANGE`
- `FORBIDDEN`

## 14. POST `/v1/memberships/{membershipId}/cancel`

Requires explicit permission and audit reason.

# Plan endpoints

## 15. GET `/v1/plans`

Returns active or filtered plans within scope.

## 16. POST `/v1/plans`

Owner/manager only.

Money request example:

```json
{
  "name": "Quarterly",
  "duration": {
    "unit": "month",
    "value": 3
  },
  "basePrice": {
    "amountMinor": 300000,
    "currency": "INR"
  },
  "benefits": ["Gym access"],
  "active": true
}
```

## 17. PATCH `/v1/plans/{planId}`

Plan edits affect future offers, not historical membership snapshots.

# QR and attendance

## 18. GET `/v1/branches/{branchId}/qr-session`

Authorized gym display/staff endpoint to obtain current display QR payload.

Response:

```json
{
  "data": {
    "payload": "opaque-or-signed-token",
    "expiresAt": "2026-08-19T04:05:00Z"
  }
}
```

Do not expose server signing secrets.

## 19. POST `/v1/attendance/check-in`

Member QR check-in.

Headers:

```text
Idempotency-Key: chk_...
```

Request:

```json
{
  "qrToken": "opaque-token"
}
```

Success:

```json
{
  "data": {
    "attendanceId": "att_...",
    "checkInAt": "2026-08-19T03:50:00Z",
    "branch": {
      "id": "br_...",
      "name": "Main Branch"
    },
    "goal": {
      "completed": 3,
      "target": 4,
      "periodStart": "2026-08-17"
    },
    "noShowCaseResolved": true
  }
}
```

Possible errors:

- `QR_INVALID`
- `QR_EXPIRED`
- `QR_BRANCH_NOT_ALLOWED`
- `MEMBERSHIP_NOT_ELIGIBLE`
- `ATTENDANCE_DUPLICATE`
- `MEMBER_NOT_VERIFIED`

If the same idempotency key already succeeded, return the original result.

## 20. POST `/v1/attendance/assisted`

Staff-only.

Headers:

```text
Idempotency-Key: ast_...
```

Request:

```json
{
  "memberId": "mem_...",
  "branchId": "br_...",
  "reason": "phone_unavailable",
  "note": null
}
```

Server derives staff actor from authenticated session.

## 21. GET `/v1/members/{memberId}/attendance`

Query:

```text
?from=2026-08-01
?to=2026-08-31
?cursor=...
```

## 22. POST `/v1/attendance/{attendanceId}/corrections`

Request:

```json
{
  "type": "void",
  "reason": "Duplicate manual entry"
}
```

A correction never silently deletes the original audit history.

# No-show and follow-ups

## 23. GET `/v1/no-show-cases`

Filters:

```text
?status=open
?riskBand=15-21
?followUpDue=true
?expiringSoon=true
?assigneeId=...
?branchId=...
?cursor=...
```

Response row:

```json
{
  "id": "nsc_...",
  "member": {
    "id": "mem_...",
    "displayName": "Rahul Sharma"
  },
  "membership": {
    "planName": "Quarterly",
    "expiresAt": "2026-09-01T18:29:59Z"
  },
  "lastAttendanceAt": "2026-08-01T12:00:00Z",
  "absentDays": 18,
  "status": "open",
  "latestOutcome": "no_response",
  "nextActionAt": "2026-08-20T05:00:00Z"
}
```

`absentDays` may be computed at read time.

## 24. GET `/v1/no-show-cases/{caseId}`

Returns case, member summary, and follow-up timeline.

## 25. POST `/v1/no-show-cases/{caseId}/follow-ups`

Request:

```json
{
  "channel": "phone",
  "outcome": "will_return",
  "notes": "Plans to return Monday",
  "nextActionAt": "2026-08-24T05:00:00Z"
}
```

Errors:

- `FOLLOW_UP_OUTCOME_INVALID`
- `NEXT_ACTION_REQUIRED`
- `CASE_CLOSED`
- `FORBIDDEN`

## 26. POST `/v1/no-show-cases/{caseId}/assign`

Request:

```json
{
  "assigneeUserId": "usr_..."
}
```

## 27. POST `/v1/no-show-cases/{caseId}/close`

Used only for authorized explicit closure reasons that are not automatically handled by return attendance.

# Renewal

## 28. GET `/v1/me/renewal-options`

Member endpoint returning currently eligible options.

Response:

```json
{
  "data": {
    "membershipId": "ms_...",
    "currentExpiryAt": "2026-09-01T18:29:59Z",
    "options": [
      {
        "planId": "plan_3m",
        "name": "3 Months",
        "basePrice": {"amountMinor": 300000, "currency": "INR"},
        "discount": {"amountMinor": 10000, "currency": "INR"},
        "finalPrice": {"amountMinor": 290000, "currency": "INR"},
        "benefits": ["Gym access"],
        "termsVersion": "v1"
      }
    ]
  }
}
```

## 29. POST `/v1/renewal-orders`

Headers:

```text
Idempotency-Key: ren_...
```

Request:

```json
{
  "membershipId": "ms_...",
  "planId": "plan_3m"
}
```

Server computes final price from authoritative pricing rules. Client does not submit trusted final amount.

## 30. GET `/v1/renewal-orders/{orderId}`

Returns selected plan snapshot and current payment state.

## 31. GET `/v1/renewals/pipeline`

Staff/owner endpoint.

Filters:

```text
?window=7d
?paymentStatus=failed
?branchId=...
```

# Payments

## 32. POST `/v1/payments`

Creates payment checkout for a renewal/add-on order.

Headers:

```text
Idempotency-Key: pay_...
```

Request:

```json
{
  "purposeType": "renewal",
  "purposeId": "ren_..."
}
```

Response:

```json
{
  "data": {
    "paymentId": "pay_...",
    "status": "created",
    "checkout": {
      "provider": "configured_provider",
      "publicPayload": {}
    }
  }
}
```

The `publicPayload` must contain only provider fields safe for client checkout.

## 33. GET `/v1/payments/{paymentId}`

Returns canonical server payment state.

## 34. POST `/v1/payments/{paymentId}/refresh`

Optional authorized endpoint to reconcile status with provider when needed.

Must not accept an arbitrary client-supplied success state.

## 35. POST `/v1/offline-payments`

Only if offline payments are enabled.

Request:

```json
{
  "purposeType": "renewal",
  "purposeId": "ren_...",
  "method": "cash",
  "amountMinor": 290000,
  "currency": "INR",
  "reference": null,
  "note": "Collected at front desk"
}
```

Server validates amount against authorized order/policy.

## 36. POST `/v1/payments/{paymentId}/refunds`

Authorized only if refund capability and provider/policy allow.

Request:

```json
{
  "amountMinor": 290000,
  "reason": "Approved cancellation"
}
```

# Webhooks

## 37. POST `/v1/webhooks/payments/{provider}`

Raw request is verified using provider-specific signature rules.

Processing contract:

1. verify authenticity,
2. translate to canonical provider event,
3. insert provider event uniquely,
4. update payment state if valid,
5. apply business effect exactly once,
6. create receipt if applicable,
7. enqueue notifications,
8. return success for already-processed duplicate event.

Webhook endpoint must not use a logged-in user session as authorization.

# Add-ons

## 38. GET `/v1/add-ons`

Member returns active purchasable catalogue.

Owner may use extended query to include inactive records.

## 39. GET `/v1/add-ons/{addOnId}`

Returns detailed type-specific information.

## 40. POST `/v1/add-ons`

Owner/manager only.

Request example:

```json
{
  "type": "personal_training",
  "title": "12 PT Sessions",
  "price": {"amountMinor": 600000, "currency": "INR"},
  "sessionCount": 12,
  "validityDays": 60,
  "active": true
}
```

## 41. PATCH `/v1/add-ons/{addOnId}`

Must not rewrite purchased-order snapshots.

## 42. POST `/v1/add-on-orders`

Headers:

```text
Idempotency-Key: addon_...
```

Request:

```json
{
  "addOnId": "addon_...",
  "quantity": 1
}
```

Server validates stock/capacity before creating payable order.

## 43. GET `/v1/members/{memberId}/add-on-orders`

Owner/staff/member access according to scope.

## 44. POST `/v1/add-on-orders/{orderId}/usage`

Authorized PT/service usage.

Request:

```json
{
  "quantity": 1,
  "occurredAt": "2026-08-19T05:30:00Z",
  "note": null
}
```

Must reject usage that would exceed entitlement.

# Dashboard and analytics

## 45. GET `/v1/dashboard/owner`

Query:

```text
?branchId=...
?businessDate=2026-08-19
```

Response:

```json
{
  "data": {
    "cards": {
      "activeMembers": 142,
      "todayCheckIns": 37,
      "openNoShowCases": 12,
      "returnedMembers": 4,
      "renewalsDue": 8,
      "renewalCollectedMinor": 2850000,
      "currency": "INR",
      "paymentExceptions": 3
    },
    "queues": {
      "followUpsDue": [],
      "renewalsDue": [],
      "paymentExceptions": [],
      "dataQuality": []
    }
  }
}
```

Dashboard values must derive from canonical business records, not client analytics events.

# Notifications

## 46. GET `/v1/notifications`

Authorized staff log with pagination and filters.

## 47. GET `/v1/me/communication-preferences`

Member-facing preferences.

## 48. PATCH `/v1/me/communication-preferences`

Request:

```json
{
  "marketing": {
    "whatsapp": "opted_out"
  }
}
```

Do not expose controls that backend does not actually enforce.

# Settings

## 49. GET `/v1/settings/gym`

Owner/manager read.

## 50. PATCH `/v1/settings/gym`

High-impact settings require validation and audit.

Example:

```json
{
  "noShowThresholdDays": 10,
  "attendanceDuplicateWindowMinutes": 120,
  "renewalWindowsDays": [14, 7, 3, 0]
}
```

# Audit and data quality

## 51. GET `/v1/audit-logs`

Restricted.

Filters:

```text
?actorId=...
?resourceType=membership
?resourceId=...
?from=...
?to=...
```

## 52. GET `/v1/data-quality-issues`

Returns open/filtered issues.

## 53. POST `/v1/data-quality-issues/{issueId}/resolve`

Requires authorized actor and resolution context.

# Imports

## 54. POST `/v1/imports/members`

Prefer staged flow rather than immediate canonical mutation.

Possible lifecycle:

```text
upload -> validate -> preview -> confirm -> process -> reconcile
```

Endpoints may be split accordingly once import UI is designed.

## 55. Pagination

Recommended cursor pagination:

```text
?limit=50&cursor=<opaque>
```

Rules:

- max limit enforced server-side,
- cursor opaque,
- stable sort required,
- tenant filters included before pagination.

## 56. Filtering and sorting

Only documented sort/filter fields should be accepted.

Avoid exposing arbitrary SQL-like filtering from public clients.

## 57. Optimistic concurrency

For settings and high-impact mutable resources, consider version/updated-at precondition.

Example:

```text
If-Match: <version>
```

or body:

```json
{
  "expectedVersion": 4
}
```

Server returns `409 RESOURCE_VERSION_CONFLICT` if stale.

## 58. API error codes

Suggested common codes:

```text
UNAUTHENTICATED
FORBIDDEN
NOT_FOUND
VALIDATION_ERROR
TENANT_SCOPE_INVALID
RESOURCE_VERSION_CONFLICT
IDEMPOTENCY_KEY_CONFLICT
MEMBER_NOT_VERIFIED
MEMBERSHIP_NOT_ELIGIBLE
MEMBERSHIP_FROZEN
MEMBERSHIP_EXPIRED
QR_INVALID
QR_EXPIRED
QR_BRANCH_NOT_ALLOWED
ATTENDANCE_DUPLICATE
NO_SHOW_CASE_CLOSED
NEXT_ACTION_REQUIRED
RENEWAL_NOT_ELIGIBLE
RENEWAL_ALREADY_COMPLETED
PAYMENT_ALREADY_PAID
PAYMENT_PENDING
PAYMENT_FAILED
PAYMENT_PROVIDER_UNAVAILABLE
PAYMENT_EVENT_INVALID
ADDON_UNAVAILABLE
INSUFFICIENT_STOCK
INSUFFICIENT_SESSION_BALANCE
NOTIFICATION_OPTED_OUT
RATE_LIMITED
```

## 59. Sensitive data response rules

API should minimize exposure of:

- full phone numbers in list views when not operationally necessary,
- internal notes,
- raw audit payloads,
- raw provider events,
- secrets,
- storage object keys when signed URL abstraction exists.

## 60. Contract testing

Each endpoint requires tests for:

- valid request,
- invalid input,
- unauthenticated request,
- unauthorized scope,
- tenant isolation,
- business conflict,
- retry/idempotency where applicable,
- stable response schema.

Payment webhooks require replay and forged-signature tests.
