# GymPulse — Isolated Real PostgreSQL RLS Isolation Validation

**Status:** validation-only, non-production. User authorization for this bounded synthetic GitHub Actions run was provided on 2026-10-15. This directory is NOT a production schema, migration framework, provider configuration, authorization implementation, or accepted architecture decision.

## Scope

- Real disposable PostgreSQL 17 Docker instance on an authorized GitHub-hosted ephemeral runner.
- Two synthetic tenants (A/B), tenant-aware foreign keys, independent login roles for runtime/worker/admin, and validation-only RLS.
- SELECT / INSERT / UPDATE / DELETE isolation, fail-closed absent/invalid context, broad SQL, role bypass and ownership/FORCE RLS.
- Transaction-local GUC, actual backend PID/pool reuse A-to-B, rollback, overlapping sessions, worker/callback simulations.
- Independent validation-layer capability and member-self checks, security-invoker view, FK constraints, migration-from-zero, forward policy change, drift detection, bounded query plans.

## Reproduce

The authorized GitHub Actions workflow is .github/workflows/rls-isolation-validation.yml. It runs on an explicit validation branch push (or manual workflow_dispatch). It does NOT run on normal main pushes. For an independently authorized local container runner with Docker, Node.js, npm, and OpenSSL:

    bash validation/security/rls/scripts/run-validation.sh

The workflow uploads results/ as a temporary Actions artifact even on failures. The script traps exit and removes only its uniquely named container, volume and local package-installation directory. A short-lived PostgreSQL password and role passwords are generated per run and never committed.

## Critical trust boundary

    Verified server principal -> current eligibility -> tenant/resource scope ->
    GymPulse capability/member-self authorization -> explicit tenant SQL ->
    selective database RLS -> synthetic persistence

The gympulse.tenant_id transaction-local PostgreSQL setting is **not** trusted user identity by itself. Arbitrary SQL executed under the same restricted role could still set the custom GUC to another tenant. RLS is defense in depth against accidental broad SQL, not a substitute for trusted application authorization, a complete SQL-injection defense or database privilege compromise.

The callback verifier and independent authorization checks are validation-only adapters, **not** proof of payment-provider signature verification or final GymPulse roles. A security-invoker view is exercised; arbitrary privileged SECURITY DEFINER functions are **not** approved or exhaustively tested. FK/unique constraint error behavior may reveal existence and needs separate production threat review. Synthetic EXPLAIN plans cannot establish production-scale performance.

## Evidence and governance

- Execution truth comes from a **completed** GitHub Actions run, its logs and uploaded test-results.json / test-matrix.md / cleanup.txt. A committed harness alone is **NOT RUN**, not PASS.
- Preserve tested SHA, image digest, Node/pg versions, SQL migration and policy catalog results and failing checks.
- ADR-0010 remains **Proposed**; D-SEC-008 remains **OPEN**. Other governance unchanged; production gate stays **CLOSED**.
- No Task 0035, ADR-0027, production schema, secrets or managed infrastructure is introduced.

## Executed evidence (2026-10-15)

The bounded disposable PostgreSQL RLS suite **executed successfully** on GitHub Actions: **29/29 real-PostgreSQL scenarios PASS**, cleanup **PASS**, tested SHA `239e334af3fed69fee97c0b198916722c84b2b79`, [workflow run](https://github.com/im-tnyx/gym-pulse/actions/runs/38772742264). See [EVIDENCE.md](EVIDENCE.md) for the observed results, failed first attempt and unresolved risks. **Overall architecture acceptance-readiness remains PARTIAL**: runtime-defined GUC authority, production provider pooler, privileged functions, production performance, provider signature verification, static deployed-policy drift and human approval are not validated. ADR-0010 stays Proposed and D-SEC-008 OPEN.
