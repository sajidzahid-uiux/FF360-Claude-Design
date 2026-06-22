# Git workflow for org-ui

## Why pushes are rejected

Every merge/push to `main` triggers **Auto Release** (`.github/workflows/auto-release.yml`), which:

1. Bumps `package.json` patch version
2. Pushes `chore: bump version to X.Y.Z [skip ci]` to `main`
3. Creates tag `vX.Y.Z` and a GitHub Release
4. Publishes to GitHub Packages

If you push while that bot commit is only on GitHub, Git rejects with **fetch first**. That is expected—not a broken repo.

## Daily workflow

```bash
# Before starting work on main
git pull --rebase origin main

# Commit your changes as usual
git add ...
git commit -m "feat: ..."

# Push (pre-push hook rebases onto origin/main if needed)
git push
```

Prefer feature branches + PR into `main` so you rarely commit directly on `main`.

## Automation in this repo

| When | What |
|------|------|
| `git push` on `main` | Husky **pre-push** runs `git pull --rebase origin main` if remote is ahead |
| Push to `main` (your commit) | GitHub Actions: test, bump version, tag, release, publish |
| Push with `[skip ci]` | Auto-release **skipped** (bot version commits) |

Tags and GitHub releases are **automatic**—do not create version tags manually.

## If push still fails

```bash
git fetch origin
git pull --rebase origin main
git push
```

Resolve conflicts in the rebase, then `git rebase --continue` and push again.
