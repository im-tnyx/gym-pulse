# GymPulse Engineering Workflow

## 1. Purpose

Define repository conventions and delivery practices so GymPulse can move from specification to implementation without losing product integrity.

## 2. Repository strategy

GymPulse should use a monorepo so web, mobile, API, shared domain rules, database contracts, and integrations evolve together.

Recommended structure:

```text
apps/
  web/
  member-mobile/
  api/

packages/
  auth/
  database/
  domain/
  contracts/
  validation/
  payments/
  notifications/
  jobs/
  analytics/
  audit/
  ui/
  config/
  observability/

docs/
```

The exact scaffold can be simplified initially, but shared business rules must not be copied independently into web and mobile apps.

## 3. Package responsibilities

### `packages/domain`

Owns:

- membership eligibility,
- attendance rules,
- no-show rules,
- renewal rules,
- state machines,
- pricing decisions after inputs are resolved,
- add-on entitlement rules.

Must not depend on React/Next.js/Expo UI.

### `packages/database`

Owns:

- schema,
- migrations,
- repositories,
- generated database types,
- seed utilities,
- transaction helpers.

### `packages/contracts`

Owns:

- request schemas,
- response schemas,
- shared DTOs,
- stable error codes.

### `packages/auth`

Owns:

- principal resolution,
- role/capability checks,
- scope helpers.

### `packages/payments`

Owns:

- canonical payment types,
- provider interface,
- provider adapters,
- webhook normalization,
- reconciliation helpers.

### `packages/notifications`

Owns:

- template business keys,
- provider interface,
- dispatch contracts,
- policy/dedupe helpers.

### `packages/jobs`

Owns:

- scheduled workflow definitions,
- job payload schemas,
- retry/idempotency helpers.

## 4. Branching model

Recommended simple model:

```text
main          protected, releasable
feature/*     normal feature branches
fix/*         bug fixes
chore/*       maintenance
```

Avoid long-lived environment branches unless deployment platform requires them.

## 5. Pull requests

Every non-trivial change should use a pull request.

PR should include:

- problem/requirement,
- implementation summary,
- affected docs,
- screenshots for UI,
- migration notes,
- tests added/changed,
- security/tenant impact,
- rollout notes.

## 6. Suggested PR template

```markdown
## What

## Why

## Product requirement

## Changes

## Tenant/security impact

## Database/migration impact

## Payment/notification impact

## Tests

## Screenshots

## Rollout / rollback

## Docs updated
```

## 7. Commit convention

Use conventional-style prefixes where practical:

```text
feat:
fix:
docs:
refactor:
test:
chore:
ci:
perf:
```

Examples:

```text
feat: add assisted attendance endpoint
fix: prevent duplicate no-show case creation
docs: clarify renewal effect policy
test: cover duplicate payment webhook
```

## 8. TypeScript rules

- strict TypeScript,
- avoid `any` without documented reason,
- external payloads are `unknown` until validated,
- domain enums/types shared,
- API responses typed from contract schemas where possible,
- money type should prevent accidental floating math.

Conceptual money type:

```ts
type Money = {
  amountMinor: number;
  currency: "INR" | string;
};
```

For values exceeding JS safe integer ranges, choose bigint/string transport intentionally.

## 9. Validation

Validate at boundaries:

- API request,
- environment config,
- provider webhook,
- import row,
- job payload.

Do not repeatedly validate trusted internal objects at every function, but never trust unvalidated external data.

## 10. Error handling

Use stable domain/application error codes.

Examples:

```text
MEMBERSHIP_NOT_ELIGIBLE
ATTENDANCE_DUPLICATE
QR_EXPIRED
PAYMENT_EVENT_INVALID
INSUFFICIENT_STOCK
FORBIDDEN
```

Expected business failures are not generic exceptions.

Unexpected failures should reach error monitoring with request/job correlation ID.

## 11. Database development

Rules:

- all schema changes through migrations,
- migrations committed with feature,
- local reset from zero works,
- seed is deterministic where possible,
- production manual schema edits prohibited except controlled emergency procedure,
- RLS/constraints included in tests.

## 12. Migration PR checklist

- new column nullable/default strategy safe?
- existing rows backfilled?
- tenant scope included?
- index needed?
- unique constraint concurrency-safe?
- destructive change staged?
- rollback/forward-fix considered?
- application compatible during deployment order?

## 13. Environment configuration

Use typed config module.

Example categories:

```text
DATABASE_URL
AUTH_*
PAYMENT_*
MESSAGING_*
STORAGE_*
ANALYTICS_*
OBSERVABILITY_*
```

Public client variables must use explicit prefix/convention and contain no secrets.

## 14. Local development

Expected commands after scaffold:

```text
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration
pnpm build
```

Exact package manager is an implementation decision, though `pnpm` is recommended for Turborepo efficiency.

## 15. Seed profiles

Provide named seed scenarios:

```text
seed:basic
seed:pilot
seed:payments
seed:retention
seed:edge-cases
```

This improves reproducibility for design, QA, and demos.

## 16. Test ownership

Feature author owns:

- domain tests,
- API tests,
- tenant permission tests,
- relevant E2E update,
- migration tests.

QA/manual review supplements automated tests rather than replacing them.

## 17. CI pipeline

Baseline:

```text
checkout
  -> install with frozen lockfile
  -> lint
  -> typecheck
  -> unit tests
  -> integration tests
  -> build
  -> migration validation
  -> contract checks
```

Optional later:

- E2E subset,
- dependency/security scan,
- preview deployment,
- visual regression.

## 18. Path-based CI optimization

Turborepo can limit work based on affected packages, but critical shared package changes should trigger dependent tests.

Example:

`packages/domain` change -> API + web + mobile dependent checks.

## 19. Preview deployments

PR previews are useful for owner/staff UX review.

Rules:

- preview uses non-production database/provider,
- no production secrets,
- seeded test data,
- clearly marked environment.

## 20. Staging

Staging is the final integration environment.

Must include:

- production-like database schema,
- payment sandbox,
- messaging test/sandbox mode,
- scheduled jobs,
- owner/front-desk UAT accounts,
- error monitoring.

## 21. Production release

Recommended release sequence:

1. CI green,
2. migration reviewed,
3. staging smoke test,
4. release notes,
5. production migration/deploy,
6. production smoke test,
7. monitor error/payment/job dashboards.

## 22. Feature flags

Use feature flags/config gates for risky pilot features such as:

- live messaging,
- real payments,
- no-show automation,
- post-expiry reminders,
- add-on purchases.

Feature flags must not become a substitute for permissions.

## 23. Kill switches

Critical provider automations should support rapid disable:

```text
PAYMENTS_CHECKOUT_ENABLED
WHATSAPP_SEND_ENABLED
RENEWAL_REMINDERS_ENABLED
NO_SHOW_MESSAGES_ENABLED
```

A kill switch should stop outbound effect without corrupting canonical data.

## 24. Observability in development

Every critical action should be traceable by:

- request ID,
- job ID,
- payment ID,
- provider event ID,
- attendance ID,
- no-show case ID.

Avoid `console.log` as the final production observability strategy.

## 25. Logging levels

Suggested:

```text
debug   local/diagnostic detail
info    normal significant lifecycle
warn    recoverable abnormal state
error   failed operation requiring attention
```

Do not log secrets/PII casually at debug level.

## 26. Documentation-as-code

A PR must update docs when it changes:

- product behavior,
- state model,
- permissions,
- schema,
- API,
- automation,
- metric definition,
- security control,
- open decision.

Docs should be reviewed like code.

## 27. Architecture Decision Records

For major irreversible/expensive choices, add ADRs later under:

```text
docs/adr/
```

Examples:

- auth provider,
- API deployment model,
- job runner,
- payment provider,
- multi-tenant RLS strategy,
- membership renewal representation.

ADR template:

```markdown
# ADR-XXXX: Decision

## Status

## Context

## Decision

## Alternatives

## Consequences
```

## 28. Code review checklist

Reviewer asks:

### Product

- does this match requirement?
- edge states covered?

### Tenancy

- every query scoped?
- branch permission correct?

### Data

- constraint/index needed?
- history preserved?

### Payments

- can retry duplicate effect?
- client trusted incorrectly?

### Jobs

- idempotent?
- failure observable?

### Security

- secret/PII leakage?
- permission server-side?

### Tests

- critical failure case covered?

## 29. API compatibility

Before mobile app is published widely, API changes should be backward compatible within supported app versions.

Avoid breaking mobile clients by changing enum/value shape without version/rollout plan.

## 30. Generated types

If database/schema tool generates types:

- generation is reproducible,
- committed or generated in CI according to chosen convention,
- domain types do not blindly expose all DB columns to clients.

## 31. Feature folder convention

Application code can organize by domain feature:

```text
features/
  members/
  memberships/
  attendance/
  retention/
  renewals/
  payments/
  addons/
  notifications/
```

Prefer domain grouping over giant generic `utils/` folders.

## 32. Naming conventions

Database:

- snake_case.

TypeScript:

- camelCase variables/functions,
- PascalCase types/components.

API JSON:

- camelCase recommended.

Business event names:

- dot-separated lower-case semantic names.

## 33. Money/date discipline

Review rejects:

- floating-point currency math,
- server-local timezone assumptions,
- ambiguous date-only vs timestamp use,
- client-calculated authoritative expiry.

## 34. Security discipline

Review rejects:

- service keys in client,
- unscoped repository query,
- client-only permission,
- raw provider webhook trusted without verification,
- full secrets/PII in logs.

## 35. Definition of done

A feature is complete only when:

- requirement linked,
- UX states complete,
- authorization implemented,
- tenant tests added,
- domain tests added,
- integration tests added,
- E2E updated where critical,
- audit/analytics events considered,
- observability present,
- docs updated,
- staging verified.

## 36. Hotfix process

For production blocker:

1. create `fix/*` branch,
2. reproduce with test,
3. implement minimal safe fix,
4. CI,
5. focused review,
6. deploy,
7. smoke test,
8. follow-up root-cause issue/doc if broader work required.

Do not skip migration/payment integrity checks because a change is urgent.

## 37. Engineering quality gate before Sprint 1

- package manager selected,
- monorepo scaffold agreed,
- CI created,
- staging environment available,
- database migration tooling selected,
- auth/provider open decisions assigned,
- coding conventions committed,
- branch protection/review approach decided.
