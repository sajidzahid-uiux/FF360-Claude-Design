# 📝 Commit Guidelines - Frontend

## Overview

This project uses **Husky** + **Commitlint** to enforce [Conventional Commits](https://www.conventionalcommits.org/) for **frontend commits only**.

## ✅ What's Configured

- **Husky**: Git hooks in `frontend/.husky/`
- **Commitlint**: Validates commit messages
- **Scope**: Frontend folder only
- **Auto-validation**: Every commit is checked before creation
- **Pre-commit**: `format` → `lint` → **`npm test`** (commit is rejected if tests fail)

## 🌿 Branching (CMS / sprint work)

During an active sprint, **do not** create feature branches from `dev`.

1. Find the current sprint branch in the repo-root [`RELEASES.md`](../RELEASES.md) (e.g. `release/sprint-06`, `release/sprint-6.1`).
2. Branch from that release branch and open your PR back into it.

```bash
# From repository root (FF-management-system/)
git fetch origin
git checkout release/sprint-07          # use the active sprint from RELEASES.md
git pull origin release/sprint-07
git checkout -b your-initials/feat-short-description
```

**Branch naming:** `initials/type-short-description` — e.g. `th/feat-calendar-filters`, `lb/fix-upload-validation`.

## 🧪 Tests (CMS frontend)

Tests live under `frontend/` and run with **Vitest** (`npm test`).

### Where to add tests

Put files in a **`__tests__/`** directory beside the module you are testing:

| Area            | Example path                                                         |
| --------------- | -------------------------------------------------------------------- |
| Entity helpers  | `entities/calendar-item/lib/__tests__/dates.test.ts`                 |
| Feature helpers | `features/calendar-filter/lib/__tests__/buildDynamicOptions.test.ts` |
| Shared utils    | `shared/lib/__tests__/…`                                             |

Use `*.test.ts` / `*.test.tsx`. Prefer testing **pure functions** (mappers, formatters, grid/date math). Do not add tests under `app/` (routes only).

Husky pre-commit runs `npm test` (Vitest) automatically.

## 🎯 Commit Format

All commits must follow this format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Required Parts

1. **type**: What kind of change (see types below)
2. **description**: Brief summary (min 3 characters, lowercase)

### Optional Parts

3. **scope**: What area of the code (e.g., `auth`, `billing`, `dashboard`)
4. **body**: Detailed explanation
5. **footer**: Breaking changes, issue references

## 📋 Commit Types

| Type       | Description      | Example                               |
| ---------- | ---------------- | ------------------------------------- |
| `feat`     | New feature      | `feat(auth): add OAuth login`         |
| `fix`      | Bug fix          | `fix(form): prevent duplicate submit` |
| `docs`     | Documentation    | `docs(readme): update setup guide`    |
| `style`    | Code formatting  | `style(button): fix indentation`      |
| `refactor` | Code improvement | `refactor(api): centralize endpoints` |
| `perf`     | Performance      | `perf(table): add virtualization`     |
| `test`     | Tests            | `test(auth): add login tests`         |
| `build`    | Build system     | `build(webpack): update config`       |
| `ci`       | CI/CD            | `ci(github): add deploy workflow`     |
| `chore`    | Maintenance      | `chore(deps): update packages`        |
| `revert`   | Revert commit    | `revert: feat(auth): add OAuth`       |

## ✅ Valid Examples

```bash
# Simple feature
git commit -m "feat: add user profile page"

# With scope
git commit -m "feat(auth): add social login support"
git commit -m "fix(dashboard): resolve chart rendering bug"
git commit -m "perf(table): optimize large dataset rendering"

# With body
git commit -m "refactor(hooks): extract common job logic

- Created useJobData hook
- Removed duplicate code from 3 components
- Added proper TypeScript types"

# With issue reference
git commit -m "fix(billing): correct payment calculation

Closes #123"

# Breaking change
git commit -m "feat(api)!: migrate to new auth system

BREAKING CHANGE: All API calls now require Bearer token"
```

## ❌ Invalid Examples (Will be Rejected)

```bash
# No type
git commit -m "added new feature"
❌ type may not be empty

# No description
git commit -m "feat:"
❌ subject may not be empty

# Uppercase subject
git commit -m "feat: Add New Feature"
❌ subject must not be upper-case

# Too short
git commit -m "feat: hi"
❌ subject must not be shorter than 3 characters

# Period at end
git commit -m "feat: add feature."
❌ subject must not end with '.'

# Just a word
git commit -m "typo"
❌ type may not be empty
❌ subject may not be empty
```

## 🔧 Common Commit Scenarios

### Fixing a Bug

```bash
git commit -m "fix(component-name): describe what was fixed"
```

### Adding a Feature

```bash
git commit -m "feat(feature-area): describe the new feature"
```

### Refactoring Code

```bash
git commit -m "refactor(area): describe what was improved"
```

### Updating Documentation

```bash
git commit -m "docs(file-name): describe documentation change"
```

### Fixing Typos

```bash
# Use 'fix' for code typos
git commit -m "fix(component): correct variable name typo"

# Use 'docs' for documentation typos
git commit -m "docs(readme): fix typo in installation section"

# Use 'style' for formatting-only changes
git commit -m "style: fix indentation in utils file"
```

### Updating Dependencies

```bash
git commit -m "chore(deps): update react to v19"
```

### Performance Improvements

```bash
git commit -m "perf(dashboard): optimize query performance"
```

## 🛠️ What Happens When You Commit

### 1. Write Your Commit

```bash
git add .
git commit -m "feat(billing): add payment methods"
```

### 2. Husky Hook Runs Automatically

The hook validates your message against Conventional Commits rules.

### 3a. ✅ Valid Commit - Success

```
[branch-name abc1234] feat(billing): add payment methods
 2 files changed, 50 insertions(+)
```

### 3b. ❌ Invalid Commit - Rejected

```
⧗   input: added payment methods
✖   subject may not be empty [subject-empty]
✖   type may not be empty [type-empty]

✖   found 2 problems, 0 warnings
ⓘ   Get help: https://github.com/conventional-changelog/commitlint/#what-is-commitlint
```

Fix your message and try again:

```bash
git commit -m "feat(billing): add payment methods"
```

## 🎯 Scopes (Recommended)

Using scopes helps organize commits by area:

### Feature Areas

- `auth` - Authentication & authorization
- `billing` - Billing & payments
- `dashboard` - Dashboard pages
- `jobs` - Job management
- `equipment` - Equipment tracking
- `map` - Map features
- `forms` - Form components
- `api` - API integration

### Technical Areas

- `hooks` - Custom React hooks
- `components` - Reusable components
- `utils` - Utility functions
- `types` - TypeScript types
- `config` - Configuration files

### Examples

```bash
git commit -m "feat(auth): add 2FA support"
git commit -m "fix(dashboard): resolve data loading issue"
git commit -m "refactor(hooks): simplify useJobData logic"
git commit -m "perf(map): optimize boundary rendering"
git commit -m "test(billing): add payment form tests"
```

## 🚨 Breaking Changes

For changes that break backward compatibility:

### Method 1: Using `!`

```bash
git commit -m "feat(api)!: change authentication method

BREAKING CHANGE: All API calls now require Bearer token instead of Basic auth"
```

### Method 2: Footer Only

```bash
git commit -m "refactor(hooks): redesign useAuth hook

BREAKING CHANGE: useAuth now returns { user, login, logout } instead of [user, login, logout]"
```

## 💡 Tips & Best Practices

### 1. Use Present Tense

```bash
✅ git commit -m "feat: add feature"
❌ git commit -m "feat: added feature"
```

### 2. Be Specific

```bash
✅ git commit -m "fix(form): prevent duplicate submission on Enter key"
❌ git commit -m "fix: bug fixes"
```

### 3. Keep Subject Short

```bash
✅ git commit -m "feat(auth): add OAuth support"
❌ git commit -m "feat(auth): add OAuth support including Google, GitHub, and Facebook providers with proper error handling"
```

### 4. Use Body for Details

```bash
git commit -m "feat(auth): add OAuth support

- Google OAuth integration
- GitHub OAuth integration
- Facebook OAuth integration
- Proper error handling and fallbacks"
```

### 5. Reference Issues

```bash
git commit -m "fix(dashboard): resolve chart rendering

Fixes #123
Related to #456"
```

## 🔍 Testing Your Commit Message

Before committing, test your message:

```bash
echo "your commit message" | npx commitlint --config frontend/commitlint.config.js
```

Examples:

```bash
# Valid
echo "feat: add new feature" | npx commitlint --config frontend/commitlint.config.js
✔ No problems found

# Invalid
echo "typo fix" | npx commitlint --config frontend/commitlint.config.js
✖ type may not be empty
✖ subject may not be empty
```

## 🛟 Troubleshooting

### Hook Not Running

If commits are not being validated:

```bash
# Check git hooks path
cd /home/morphoix/Projects/FF/FF-management-system
git config core.hooksPath

# Should output: frontend/.husky

# If not, set it:
git config core.hooksPath frontend/.husky
```

### Hook Permission Error

```bash
chmod +x frontend/.husky/commit-msg
```

### Commitlint Not Found

```bash
cd frontend
npm install
```

## 📚 Additional Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Commitlint](https://commitlint.js.org/)
- [Husky](https://typicode.github.io/husky/)

## ❓ FAQ

### Q: Can I bypass the validation?

**A:** Yes, but **not recommended**:

```bash
git commit -m "whatever" --no-verify
```

### Q: What if I'm working on backend?

**A:** This validation only applies to commits in this repository. The hooks are configured for frontend only.

### Q: Can I use emoji in commits?

**A:** It's not recommended as it's not part of the conventional commits spec, but the validator won't reject it if the format is correct:

```bash
git commit -m "feat: ✨ add new feature"  # Will work but not recommended
```

### Q: What about merge commits?

**A:** Merge commits are automatically excluded from validation.

### Q: I made a typo in my last commit message, can I fix it?

**A:** Yes, if you haven't pushed yet:

```bash
git commit --amend -m "feat(auth): add OAuth support"
```

---

**Questions?** Ask the team or check the resources above!
