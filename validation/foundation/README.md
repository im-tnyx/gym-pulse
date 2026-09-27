# GymPulse Foundation Validation Harness

Status: validation-only / non-production.

This directory exists only to gather technical acceptance evidence for ADR-0001 through ADR-0004. It is not the GymPulse production scaffold and does not accept Node.js, TypeScript, a package manager, a web framework, a job runner, a data-access tool, PostgreSQL provider, CI platform, or hosting provider.

The harness intentionally uses no third-party runtime dependencies. `package.json` only marks the validation files as ESM; it is not a production package-manager decision.

## What this harness proves now

- strict TypeScript compilation for separate client/request/worker validation artifacts;
- client-safe/server-only import boundary checks;
- cycle detection including deliberate negative fixtures;
- protected command path with tenant/branch/capability checks;
- runtime validation of untrusted input;
- request and worker adapters reusing the same application/domain behavior;
- replay-safe attendance result using validation-only durable file state;
- separate-process replay after restart-style handoff;
- gym-timezone date boundary behavior;
- raw-byte HMAC webhook verification and tamper rejection;
- provider-event replay dedupe in validation-only durable state.

## What this harness does not prove

- PostgreSQL transactions, constraints, concurrency, backup/restore, pooling, or restart behavior;
- production schema;
- Member/Membership final state model;
- production performance;
- production hosting/region/jurisdiction;
- decision-owner approval.

Real PostgreSQL evidence remains required by `docs/adr/foundation-acceptance-evidence-plan.md`.

## Reproduce in a compatible environment

```text
tsc -p tsconfig.client.json
tsc -p tsconfig.request.json
tsc -p tsconfig.worker.json
node scripts/check-boundaries.mjs .
node scripts/check-boundaries.mjs . --fixtures
node scripts/run-tests.mjs
node scripts/request-once.mjs <temporary-state-file>
node scripts/worker-replay.mjs <same-temporary-state-file>
```

Compiled output and state files are disposable and are not committed.
