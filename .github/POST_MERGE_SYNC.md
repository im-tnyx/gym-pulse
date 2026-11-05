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

### Step 1: Fetch Remote References

```bash
git fetch origin
```

This retrieves the latest remote commit objects and updates `origin/*` references without modifying your local working tree or current branch HEAD.

### Step 2: Verify Branch & Upstream State Before Switching

Ensure the repository is not in an abnormal Git state:
- Confirm you are not in a **detached HEAD** state (`git status` reports `HEAD detached at ...`).
- Confirm no active merge, rebase, cherry-pick, or revert operation is in progress (`git status` reports `rebase in progress` or similar). If an operation is in progress, do not proceed with synchronization.

### Step 3: Switch to Local `main`

```bash
git switch main
```

*(If using an older Git version where `git switch` is unavailable, fallback to `git checkout main`.)*

### Step 4: Fast-Forward Only Update

```bash
git pull --ff-only origin main
```

#### Why `--ff-only` is Mandatory:
- **Linear & Predictable History:** It ensures local `main` advances strictly as a linear fast-forward to match `origin/main`.
- **Fails Closed on Divergence:** If local `main` contains unpushed local commits or has diverged from `origin/main`, `git pull --ff-only` aborts immediately with an error instead of creating an unwanted, recursive merge commit.

---

## 4. Verify Local and Remote Commit SHAs

Verify that local `main` and remote `origin/main` point to the exact same commit:

```bash
git rev-parse HEAD
git rev-parse origin/main
```

**Expected Result:** Both commands output the exact same 40-character hexadecimal commit SHA.

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
  ```bash
  git diff --check
  ```
- **Commit Attribution Guard Check:**
  ```bash
  & "G:\dev\git\bin\bash.exe" scripts/check_commit_attribution_test.sh
  ```
  *(Or `bash scripts/check_commit_attribution_test.sh` on POSIX environments.)*
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
  2. Switch back to a named branch: `git switch main` (or the relevant feature branch).
  3. If detached commits were made, do not discard them; create a temporary branch pointer (`git branch temp-recovery`) and report to the owner.

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
