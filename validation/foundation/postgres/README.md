# Real PostgreSQL Foundation Validation Harness

Status: validation-only / non-production.

This directory extends the existing `validation/foundation/` evidence harness with a disposable real-PostgreSQL slice for Stage 3 and Stage 6 of `docs/adr/foundation-acceptance-evidence-plan.md`.

## Boundaries

```text
Validation Harness
!=
Production Scaffold

Validation PostgreSQL
!=
Production PostgreSQL Provider

Temporary PostgreSQL Driver
!=
D-ARCH-017 Acceptance

Explicit Tenant Query
!=
RLS Acceptance

Validation Schema
!=
Production Schema

Passing Technical Evidence
!=
ADR Acceptance
```

The SQL objects under `sql/` are deliberately generic, synthetic, and disposable. They do not encode final Member/Membership lifecycle semantics, production Attendance/Payment tables, production RLS, production database roles, or a production migration framework.

## Reproduction

The bounded entry command is:

```bash
bash validation/foundation/postgres/scripts/run-validation.sh
```

The script expects an already-authorized runner with Docker, local/private port binding, temporary storage, and permission to stop/restart/delete the validation container.

The default image is:

```text
postgres:17-bookworm
```

Override only for a validation run:

```bash
POSTGRES_IMAGE=postgres:17-bookworm bash validation/foundation/postgres/scripts/run-validation.sh
```

The script:

1. creates a uniquely named PostgreSQL container and volume;
2. proves readiness, create/drop, backup/restore, and restart capability;
3. applies `001-initial.sql` and `002-forward.sql` to a fresh validation database;
4. executes concurrent uniqueness/idempotency tests with independent PostgreSQL sessions;
5. proves rollback, tenant-scoped SQL behavior, a representative relational query, and real SQLSTATE translation;
6. uses a temporary validation-only Node PostgreSQL client under `.node-client/`;
7. creates a real custom-format `pg_dump`, restores it into a separate database, and rechecks invariants;
8. stops/restarts the disposable database and proves reconnect plus idempotent replay;
9. removes only the uniquely named container, volume, temporary dump, and temporary client installation.

## Generated local evidence

Runtime output is written under:

```text
validation/foundation/postgres/results/
```

This directory is generated evidence for the validation run and is not a production artifact. CI may upload it as a short-lived workflow artifact. Credentials and dump files are not written there.

## Cleanup safety

Cleanup targets only names derived from the validation run identifier. The script does not use broad Docker prune commands and does not delete unrelated databases or volumes.

If the runner cannot safely restart the validation PostgreSQL instance, do not run this harness on that runner.
