# GymPulse — Historical Branch Merge Audit (2026-10-16)

## Scope and result

User-requested reconciliation of the three remaining source branches into the existing main branch. This is a Git history reconciliation, not authorization for a release, ADR acceptance, tests, or production implementation.

Main source baseline: 48eeefb4637cc0fa37e42929262178665f118445.
Baseline main tree: c505f7426680580d008993d6be1ac11916a34c5e.

| Source branch | Original source SHA | Initial comparison against main | Final disposition |
| --- | --- | --- | --- |
| docs/phase-2-architecture | 262e4cb5e3ab2b3368f942a217b8991045e2abef | Diverged, 79 ahead and 241 behind | MERGED via second-parent history merge: 174be6be94333b6747962d1f288a32205d2e6c18, [PR #7](https://github.com/im-tnyx/gym-pulse/pull/7) |
| validation/postgres-foundation-20260929 | 05785ecb92e2537aaf2ae58be3aa5f5afa3a833d | Diverged, 7 ahead and 35 behind | MERGED via second-parent history merge: 1e2b877d437b7e9ce1fc9120e8487c6172f45d36, [PR #8](https://github.com/im-tnyx/gym-pulse/pull/8) |
| validation/rls-isolation-20261015 | 6431efb84aa1cd202e33f88b781d668927459291 | Already ancestor, 0 ahead | ALREADY MERGED; duplicate PR/merge avoided |

After reconciliation, independently repeated comparisons main...each-branch returned zero ahead commits for all three. PR #7 and PR #8 are CLOSED/MERGED by GitHub. All three original branch tips are in main ancestry.

## Exact conflict resolution

Two diverged branches carried stale documentation: a conventional file merge could regress newer governance. Both merge commits were deliberately created as two-parent Git commits using the existing current-main tree unchanged. This is the functional equivalent of git merge -s ours: branch history enters the ancestry while obsolete files do not replace active canonical source.

The foundation source has five PostgreSQL validation files with blob-identical versions already present on main. The source's September 29 green real PostgreSQL [Actions run #36554395928](https://github.com/im-tnyx/gym-pulse/actions/runs/36554395928) remains historical evidence. Its later tip removed a temporary Actions workflow. Its 25 older governance/documentation blobs were not substituted for current main.

The phase-2 source has 11 historical-only file paths, 12 paths with stale/different content, 30 identical file blobs, and lacks 102 current main paths. Historical-only paths include older AI context/memory/task/rules/templates and an August 2026 draft named docs/adr/ADR-0001-use-monorepo.md. That legacy draft conflicts in numbering with active Accepted ADR-0001-modular-monolith.md. No obsolete ADR number, proposed statuses, or old AI task instructions were promoted into current main. All such records remain recoverable from the branch's original Git commit in the now-merged history.

The RLS validation branch was already included in main before reconciliation. Its exact-tip [GitHub Actions run #38773398231](https://github.com/im-tnyx/gym-pulse/actions/runs/38773398231) was 29/29 synthetic PASS, cleanup PASS.

## Merge verification

| Item | Result |
| --- | --- |
| Foundation two-parent merge | 1e2b877d437b7e9ce1fc9120e8487c6172f45d36 |
| Documentation two-parent merge | 174be6be94333b6747962d1f288a32205d2e6c18 |
| Tree in original main and BOTH merge commits | c505f7426680580d008993d6be1ac11916a34c5e (identical) |
| Three source heads ahead of latest main | 0 / 0 / 0 |
| Pull requests | #7 MERGED, #8 MERGED |
| Source harness/schema migration modifications | NONE |
| New validation run or provider deployment | NONE |

The two old branch references still exist; merging Git history does not delete branches. No ref was force-reset, deleted, or overwritten. If branch housekeeping is wanted, delete those refs manually through the GitHub branches page only after checking any consumers. Branch deletion was not performed with this merge.

## Security and project governance boundaries

Foundation ADR-0001 through ADR-0004 remain Accepted. ADR-0010 remains Proposed; D-SEC-008 remains OPEN; its 12 risk/evidence-gap dispositions still await the authorized human owner's separate review in [Issue #2](https://github.com/im-tnyx/gym-pulse/issues/2). Production implementation remains CLOSED. A merged historical branch does not imply authorization to deploy or approve obsolete architecture.
