# Build Modes

`@fieldflow360/org-ui` uses separate build modes for package release and app-level rendering checks.

## 1) Release Build (package artifacts only)

```bash
npm run build:release
```

What it does:

- Cleans `dist`
- Builds JS bundles (`cjs` + `esm`) and type declarations from `src/index.ts`
- Builds `dist/styles.css`

Use for:

- publish/release
- CI artifact generation

Important:

- `dev-app` and `consumer-app` are **not** included in package output
- package `files` only publish `dist`

## 2) App Verification Build (rendering/integration)

```bash
npm run build:verify-apps
```

What it does:

- Builds `dev-app` (Next.js)
- Builds `consumer-app` (Next.js)

Use for:

- validating UI rendering with real app shells
- checking integration behavior (layouts, breadcrumbs, settings navigation)

## 3) Default `build` command

```bash
npm run build
```

Alias to:

```bash
npm run build:release
```

So CI/release pipelines using `npm run build` automatically produce pure package artifacts.
