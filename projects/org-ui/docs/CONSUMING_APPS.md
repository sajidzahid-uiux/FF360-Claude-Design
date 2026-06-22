# Consuming `@fieldflow360/org-ui` in CMS and Tile Design

This package is published to **GitHub Packages** on every merge to `main` (patch bump + `npm publish`). You do **not** need to edit the version number in each app’s `package.json` for every org-ui change.

## Two workflows

| Goal | Approach |
|------|----------|
| Active org-ui development | Local `file:` link + rebuild (or watch) |
| Use a published release | Keep `^0.1.x` in `package.json` and run `npm update` |

---

## Local development (no version bumps)

Clone repos as siblings under the same parent (example):

```
FF/
  FF-org-UI/
  FF-management-system/frontend/
  tile_design/frontend/
```

### 1. Link the local package

From **CMS** or **Tile** frontend:

```bash
npm run org-ui:local
```

This runs `npm install file:../../FF-org-UI` and updates the lockfile. The dependency resolves to your local `dist/` after you build.

Or set manually in `package.json`:

```json
"@fieldflow360/org-ui": "file:../../FF-org-UI"
```

### 2. Build org-ui

In `FF-org-UI`:

```bash
npm run build
```

For continuous rebuilds while editing `src/`:

```bash
# terminal 1
npm run dev:package

# terminal 2 (when changing styles / @layer components)
npm run dev:css
```

### 3. Run the consumer app

Restart the Next.js dev server after org-ui `dist/` changes (recommended).

### 4. Before opening a CMS/Tile PR

Restore the registry dependency so CI and other developers do not need a sibling `FF-org-UI` folder:

```bash
npm run org-ui:registry
```

Commit **registry** `package.json` / lockfile, not `file:` paths.

---

## Published package (registry)

Keep a semver range in consumer `package.json`:

```json
"@fieldflow360/org-ui": "^0.1.36"
```

After org-ui merges to `main` and CI publishes a new patch:

```bash
npm update @fieldflow360/org-ui
```

That updates the lockfile to the latest matching `0.1.x`. You usually **do not** change `0.1.36` to `0.1.39` by hand.

Ensure `.npmrc` includes:

```
@fieldflow360:registry=https://npm.pkg.github.com
```

and a token with `read:packages` for installs.

Dependabot can open update PRs automatically (see `.github/dependabot.yml` in CMS and Tile repos).

---

## Quick checks without CMS/Tile

Inside `FF-org-UI`:

- `npm run dev` — dev-app on port 3010
- `npm run preview` — consumer-app with `file:..` on port 3002

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Changes not visible in CMS/Tile | Run `npm run build` in org-ui; restart consumer dev server |
| `file:` install fails in CI | Run `org-ui:registry` before push; CI must use GitHub Packages |
| Tailwind classes from org-ui missing | Ensure `@source "../node_modules/@fieldflow360/org-ui/dist/**/*.{js,mjs}"` in app `globals.css` (path is from `app/`, one `../` to `frontend/node_modules`) |
| Wrong org-ui version installed | `npm ls @fieldflow360/org-ui` and reinstall with `org-ui:local` or `org-ui:registry` |
