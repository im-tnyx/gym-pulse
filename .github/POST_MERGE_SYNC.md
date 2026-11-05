# GymPulse — Post-Merge Git Synchronization Guide

> **Contributor execution aid, not a decision authority.** Follow [root `AGENTS.md`](../AGENTS.md), the [canonical documentation hierarchy](../docs/README.md), [decision register](../docs/00-overview/assumptions.md), and [ADR governance](../docs/adr/README.md). This guide provides safe operational instructions for local Git worktree synchronization; it does not authorize production deployment, direct pushes to `main`, automatic PR merges, or architecture/ADR decisions.

---

## 1. When to Synchronize

Execute this synchronization workflow:
- Immediately after a pull request has been merged into `main` on GitHub.
- Prior to creating a new task branch from `main`.
- When resuming work in a local checkout after remote changes have landed on `main`.

**Strict Negative Invariant:** Never use this synchronization workflow to overwrite, discard, or silently bypass uncommitted or in-progress work. If the working tree is dirty, resolve worktree ownership first.

---

## 2. Working-Tree Safety & Ownership Check

Before running any fetch, switch, or pull operations, inspect the local status:

```bash
git status -sb
```

### Expected Clean Baseline

For a clean working tree on `main`:
```text
## main...origin/main
```

Or for a clean working tree on a task branch:
```text
## docs/your-branch...origin/docs/your-branch
```

### Safety Rules & Dirty Worktree Constraints

1. **Fail-Closed on Uncommitted Changes:** If modified files, staged changes, or untracked files are reported:
   - **Do NOT run destructive reset commands:** Never execute `git reset --hard` or `git checkout -- <file>` unless the repository owner explicitly instructs you to do so.
   - **Do NOT silently stash:** Never run `git stash` automatically, as stashes can mask lost changes across multi-agent or multi-developer sessions.
   - **Stop and Clarify Ownership:** If uncommitted changes belong to another contributor or an unfinished session, stop and seek human clarification.
   - **Safe Resolution:** Commit intentional changes to a dedicated task branch or obtain explicit owner confirmation before discarding.

---

## 3. Standard Safe Synchronization Sequence

When the working tree is confirmed clean (`git status -sb` shows no uncommitted changes):

### Step 1: Verify Remote Configuration

Before issuing network fetch commands, confirm that `origin` points to the authorized repository URL:

```bash
git remote -v
```

**Expected:** `origin` resolves to `https://github.com/im-tnyx/gym-pulse.git` (or the approved SSH remote `git@github.com:im-tnyx/gym-pulse.git`). If `origin` is unverified, missing, or points to an untrusted fork, stop and correct the remote configuration before proceeding.

### Step 2: Fetch Remote References

```bash
git fetch origin
```

This retrieves the latest remote commit objects and updates `origin/*` references without modifying your local working tree or current branch HEAD.

### Step 3: Verify Branch State Before Switching

Ensure the repository is not in an abnormal Git state:
- Confirm you are not in a **detached HEAD** state (`git status` reports `HEAD detached at ...`). If detached, follow [Scenario B in Section 9](#scenario-b-detached-head-state) to preserve any detached commits before switching.
- Confirm no active merge, rebase, cherry-pick, or revert operation is in progress (`git status` reports `rebase in progress` or similar). If an operation is in progress, do not proceed with synchronization.

### Step 4: Inspect Fetched Upstream Changes

Before applying changes to `main`, inspect what `git fetch origin` retrieved from the remote, then pin the inspected tip so later integration cannot silently advance past that review:

```bash
git log --oneline main..origin/main
git diff --stat main..origin/main
```

Record the exact inspected tip:

- *POSIX / Git Bash:*
  ```bash
  INSPECTED_ORIGIN_MAIN=$(git rev-parse origin/main)
  ```
- *Windows PowerShell:*
  ```powershell
  $INSPECTED_ORIGIN_MAIN = git rev-parse origin/main
  ```

**Safety Invariant:** Review the incoming commit subjects and touched paths. If the fetched commits contain unexpected, unexplained, or unauthorized changes (e.g. unintended file modifications, unexpected branch merges, or diverged history), stop immediately and seek clarification from the repository owner before updating local `main`.

### Step 5: Switch to Local `main` and Record Pre-Sync Baseline

Switch to local `main`:

```bash
git switch main
```

*(If using an older Git version where `git switch` is unavailable, fallback to `git checkout main`.)*

Record the pre-sync commit SHA before integrating so that post-sync validations can check the exact incoming commit range:

- *POSIX / Git Bash:*
  ```bash
  PRE_SYNC_SHA=$(git rev-parse HEAD)
  ```
- *Windows PowerShell:*
  ```powershell
  $PRE_SYNC_SHA = git rev-parse HEAD
  ```

### Step 6: Fast-Forward Only Update of the Inspected Tip

Integrate **only** the commit tip inspected in Step 4. Do **not** run `git pull` here: a pull re-fetches and can silently integrate commits that were not part of the Step 4 review.

- *POSIX / Git Bash:*
  ```bash
  git merge --ff-only "$INSPECTED_ORIGIN_MAIN"
  ```
- *Windows PowerShell:*
  ```powershell
  git merge --ff-only $INSPECTED_ORIGIN_MAIN
  ```

#### Why `--ff-only` against the inspected tip is Mandatory:
- **Linear & Predictable History:** Local `main` advances strictly as a linear fast-forward to the reviewed tip.
- **Fails Closed on Divergence:** If local `main` contains unpushed local commits or has diverged from the inspected tip, `git merge --ff-only` aborts immediately instead of creating an unwanted merge commit.
- **No Inspect/Integrate Race:** Capturing `$INSPECTED_ORIGIN_MAIN` after fetch, then merging that exact SHA, prevents a later network refresh from integrating unreviewed commits.

---

## 4. Verify Local and Remote Commit SHAs

Verify that local `main` reached the inspected tip and still matches the fetched remote-tracking tip:

```bash
git rev-parse HEAD
git rev-parse origin/main
```

- *POSIX / Git Bash:* also confirm `test "$(git rev-parse HEAD)" = "$INSPECTED_ORIGIN_MAIN"`.
- *Windows PowerShell:* also confirm `(git rev-parse HEAD) -eq $INSPECTED_ORIGIN_MAIN`.

**Expected Result:** `HEAD`, `origin/main`, and `$INSPECTED_ORIGIN_MAIN` are the exact same 40-character hexadecimal commit SHA. If `HEAD` advanced past `$INSPECTED_ORIGIN_MAIN`, stop and treat the sync as invalid.

---

## 5. Verify Merged PR & Commit Ancestry

GymPulse requires truthful verification of merged pull requests and their commit ancestry in the Git tree:

### Inspect Recent Commits

```bash
git log --oneline -5 --decorate
```

### Accounting for GitHub Merge Strategies

GitHub repositories may use different merge mechanisms. Verify ancestry according to the merge method used:

1. **Merge Commit (Standard GitHub Merge PR):**
   - Creates a merge commit with two parent commits.
   - Verify the merge commit exists and links the PR branch:
     ```bash
     git log -1 --merges --oneline
     ```
   - Verify that local `main` contains the specific merged commit SHA:
     ```bash
     git branch --contains <commit-sha>
     ```
2. **Squash and Merge:**
   - Combines all PR commits into a single commit on `main`. The original PR branch commits are not in `main`'s ancestry, but the squash commit message references the PR number:
     ```bash
     git log --grep="(#<PR-number>)" -n 1 --oneline
     ```
3. **Rebase and Merge:**
   - Re-applies individual commits onto `main` with new SHAs. Verify the PR's commit subject lines appear in:
     ```bash
     git log -n 5 --oneline
     ```

---

## 6. Optional Local Branch Cleanup

Once a pull request has been confirmed merged into `main` and verified:

```bash
# Delete the merged local branch safely
git branch -d <branch-name>
```

### Branch Cleanup Invariants:
- **Non-Destructive Deletion Only:** Always use `-d` (lowercase), which requires that the branch is fully merged upstream.
- **Strict Prohibition on Force Deletion:** **Never** execute `git branch -D` (uppercase) unless the repository owner gives explicit, documented authorization for that specific unmerged branch.
- **No Unauthorized Remote Deletion:** Do not execute `git push origin --delete <branch>` unless specifically requested by the owner and authorized by repository workflow rules.

---

## 7. Starting Subsequent Work from Fresh `main`

To start the next bounded task:

1. Ensure you are on updated `main` with a clean working tree:
   ```bash
   git status -sb
   ```
2. Create and switch to a new task branch:
   ```bash
   git switch -c <type>/<task-name>
   ```
   *Follow GymPulse branch naming standards (e.g., `docs/your-task`, `fix/your-fix`, `test/your-test`).*
3. Link the branch and forthcoming work directly to an approved GitHub issue or task brief.

---

## 8. Relevant Post-Sync Validation

Run only the validations relevant to the current repository state and task scope:

- **Whitespace & Conflict Check:**
  - *Incoming Synchronized Commits (validates commits pulled into `main`):*
    If new commits were integrated (`$PRE_SYNC_SHA` does not match `HEAD`):
    ```bash
    git diff --check $PRE_SYNC_SHA..HEAD
    ```
  - *Working Tree (Uncommitted Modifications):*
    ```bash
    git diff --check
    ```
    *(Note: Plain `git diff --check` inspects uncommitted working-tree modifications only. In a clean worktree after sync, it returns 0. To validate newly integrated commits, check the commit range `$PRE_SYNC_SHA..HEAD`.)*
- **Commit Attribution Guard Check:**
  The attribution guard validates that commits in the specified range do not contain prohibited AI co-author trailers. Run the real guard **only when incoming commits exist**. When `$PRE_SYNC_SHA` equals `HEAD`, record `N/A — no incoming commits` and do **not** invent a substitute range such as `HEAD~1 HEAD` (that audits an unrelated prior commit and fails in depth-1 checkouts where `HEAD~1` is missing). Keep the two branches mutually exclusive so both checks cannot run.
  - *POSIX / Git Bash:*
    ```bash
    bash scripts/check_commit_attribution_test.sh
    if [ "$PRE_SYNC_SHA" != "$(git rev-parse HEAD)" ]; then
      bash scripts/check_commit_attribution.sh "$PRE_SYNC_SHA" HEAD
    else
      echo "N/A — no incoming commits"
    fi
    ```
  - *Windows PowerShell:*
    ```powershell
    # If bash is available on PATH:
    bash scripts/check_commit_attribution_test.sh
    if ($PRE_SYNC_SHA -ne (git rev-parse HEAD)) {
      bash scripts/check_commit_attribution.sh $PRE_SYNC_SHA HEAD
    } else {
      Write-Output 'N/A — no incoming commits'
    }

    # Alternatively, dynamically locate Git's bash binary from git.exe in PATH:
    $gitBash = Join-Path (Split-Path (Split-Path (Get-Command git).Source)) 'bin\bash.exe'
    & $gitBash scripts/check_commit_attribution_test.sh
    if ($PRE_SYNC_SHA -ne (git rev-parse HEAD)) {
      & $gitBash scripts/check_commit_attribution.sh $PRE_SYNC_SHA HEAD
    } else {
      Write-Output 'N/A — no incoming commits'
    }
    ```
- **Documentation Integrity Fixtures:**
  ```bash
  node tools/ci/tests/docs-integrity-fixtures.mjs
  ```
- **Documentation Integrity Pilot Checker (Scoped invocation):**
  Follow documented invocation from `.github/workflows/docs-integrity-pilot.yml` using trusted base checkouts.

**Evidence Reporting Standard:** Truthfully record exact commands executed, exit codes, pass/fail counts, and explicit reasons for any tests `NOT RUN`. Never infer test passage from absence of checks.

---

## 9. Blocked & Recovery Procedures

If the synchronization flow encounters unexpected states, fail closed and follow these recovery steps:

### Scenario A: Dirty Working Tree / Modified Files Detected
* **Condition:** `git status -sb` shows untracked or modified files before switching or pulling.
* **Recovery:**
  1. Do not proceed with `git switch` or `git pull`.
  2. Inspect modified files using `git status` and `git diff`.
  3. If changes are valuable, preserve them on their appropriate branch or ask the owner.
  4. Never run `git reset --hard` or `git stash` without explicit instruction.

### Scenario B: Detached HEAD State
* **Condition:** `git status` reports `HEAD detached at <commit-sha>`.
* **Recovery:**
  1. Check if uncommitted work exists: `git status -sb`.
  2. If detached commits were made, **create a recovery branch pointer immediately before switching branches**:
     ```bash
     git branch temp-recovery-detached
     ```
     *(Or pass the explicit detached commit SHA: `git branch temp-recovery-detached <detached-commit-sha>`.)*
  3. Switch back to a named branch:
     ```bash
     git switch main
     ```
  4. Report the recovery pointer (`temp-recovery-detached`) and its commit SHA to the repository owner.

### Scenario C: Fast-Forward Pull Fails (`fatal: Not possible to fast-forward, aborting.`)
* **Condition:** Local `main` has diverged from `origin/main` (e.g., local commits were accidentally committed to `main`).
* **Recovery:**
  1. Do NOT force push (`git push --force`) or run a recursive merge.
  2. Inspect the divergence:
     ```bash
     # Commits only on local main:
     git log origin/main..main --oneline
     # Commits only on remote origin/main:
     git log main..origin/main --oneline
     ```
  3. If local commits are accidental, move them to a new branch:
     ```bash
     git branch my-local-commits
     git switch main
     ```
     Then consult the owner before resetting local `main` to `origin/main` (`git reset --keep origin/main`).

### Scenario D: Remote Tracking Mismatch or Missing Upstream
* **Condition:** `origin` does not point to the expected repository.
* **Recovery:**
  1. Inspect configured remotes:
     ```bash
     git remote -v
     ```
  2. Confirm `origin` points to `https://github.com/im-tnyx/gym-pulse.git` (or the approved remote).
  3. Report any remote configuration discrepancy before executing write or fetch operations.

---

## 10. Governance & Safety Invariants

- **No Direct Push to `main`:** Contributors and AI agents must never push directly to `main`. All changes must arrive via a reviewed Pull Request.
- **No Auto-Merge:** Automatic merges are prohibited. Every PR requires explicit human review or owner authorization.
- **AI Commit Attribution Policy:** AI coding tools must never append `Co-Authored-By` AI trailers in Git commit messages. Preserving genuine human commit authorship is strictly enforced by [`scripts/check_commit_attribution.sh`](../scripts/check_commit_attribution.sh).
- **Production & Security Gates Closed:** Synchronizing local documentation never alters ADR statuses, backend authorization, tenant isolation policies, or production access boundaries.
