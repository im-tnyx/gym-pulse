# GymPulse — Real PostgreSQL RLS Validation Evidence

## Initial execution control

- Authorization: user instructed proceeding with GitHub-hosted disposable validation after scope and safeguards were explained, 2026-10-15.
- Initial audited main: 9a39f71a8dcc31c4cb311694df474396c8e5f660.
- Source branch: validation/rls-isolation-20261015.
- Target: GitHub Actions disposable Ubuntu runner + isolated Docker PostgreSQL, synthetic fixtures only. No production resources.
- **Recorded test execution: NOT RUN until actual runner evidence is fetched and inspected.**
- PostgreSQL version / image digest / client versions: **NOT RUN**.
- Restricted runtime/catalog evidence: **NOT RUN**.
- A/B CRUD isolation and fail-closed context: **NOT RUN**.
- Transactions, pool reuse, rollback, parallel workload: **NOT RUN**.
- Worker/callback, application authorization, view and FK: **NOT RUN**.
- Migration from zero, forward policy change, drift and query plans: **NOT RUN**.
- Cleanup: **NOT RUN**.
- Overall: **NOT RUN**. Workflow existence does not justify PASS.

## Evidence collection

After workflow finishes, record the **actual** run URL, tested SHA, conclusion and job logs. Inspect the gympulse-rls-security-evidence artifact including test-results.json, test-matrix.md, tool-versions.txt, summary.txt and cleanup.txt. Keep failing checks FAIL and missing checks NOT RUN. Never broaden security policies merely to get green results.

## Unresolved architecture and human approval

RLS does not prove that a client-supplied custom GUC is trustworthy, does not replace tenant-scoped SQL or independent application authorization, and does not secure privileged SQL, dumps or backups. Final provider, pooler, production role model, Member/Membership ownership and real authorization policy remain separately governed.

    ADR-0010 = Proposed
    D-SEC-008 = OPEN
    Foundation ADR-0001 through ADR-0004 = Accepted
    Production Implementation Gate = CLOSED
