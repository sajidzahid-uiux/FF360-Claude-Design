# UI/UX Prototyping Branch Guidelines

This repo is a living design/prototyping tool. We run a SINGLE server — the CMS on **:3000**. Projects under `projects/`:
- `projects/management-system/frontend-2/` — the CMS (Next.js 16, React 19), the only thing we run (port **:3000**) and the prototyping hub. **The Django backend was removed; the CMS runs entirely on dummy data.** The design system is embedded at `/design-system` (renders the same `@fieldflow360/org-ui` components the CMS uses).
- `projects/org-ui/` — source of the `@fieldflow360/org-ui` design system. It is NOT run as its own server; it's the library the CMS consumes (via the `vendor/*.tgz` tarball) and a prop reference. Its `dev-app/` showcase exists but we don't run it (port 3010 was retired — use `/design-system` on :3000 instead).

Unless a path says otherwise, file paths below are relative to `projects/management-system/frontend-2/`.

## Architecture & Routing
- The CMS acts as a prototyping hub. Visiting `localhost:3000/` redirects to `localhost:3000/hub`.
- Prototyping hub routes live in `/hub`, `/design-system`, and `/flows/*`.
- These routes MUST be exempted from auth via `isPublicAppShellPath()` in `lib/auth-routes.ts` (so they render standalone, no org sidebar, no auth redirect).
- Use `app/_prototype/PrototypeChrome.tsx` for shared headers/nav on hub/flows pages.
- `/design-system` is its own full-width page with a left component menu; it renders ported renderers from `app/design-system/renderers/` (one per component), each wrapped in `app/design-system/RendererBoundary.tsx`.
- The `/` → `/hub` redirect and the `@auth0/auth0-react` mock alias are in `next.config.js`, gated on `NEXT_PUBLIC_USE_MOCK_DATA` — so production behavior is unchanged. **`next.config.js` changes require a dev-server restart.**

## Component Library Rules
- Strictly use the internal bespoke library: `@fieldflow360/org-ui`.
- Do not use standard HTML or generic React elements unless no `org-ui` alternative exists.
- Adhere strictly to the TypeScript definitions and interfaces for `@fieldflow360/org-ui` props (e.g., `xKey`, `yKey`, `series` for Charts; `title`/`variant`/`iconOnly` for Button; `isOpen`/`onClose`/`title` for Modal).
- For correct, copy-pasteable prop usage, reference the renderers in `projects/org-ui/dev-app/src/renderers/*` (or the already-ported copies in `app/design-system/renderers/`).
- If a design needs a component that doesn't exist in org-ui, ASK whether to build it or reuse an existing one — don't invent one silently.
- **Always build from design-system components.** Before hand-rolling markup (custom pill/tab buttons, toggles, badges, menus, etc.), check `@fieldflow360/org-ui` for an existing component and use it. Only fall back to bespoke elements when nothing fits — and in that case ASK first. E.g. filter/segmented tabs → `TabsSwitcher` (two views: `PILL` and `UNDERLINED`); don't reinvent them with `<button>` chips.

## Maps
- **Every map must have the bottom drag-to-resize-height handle** (the "latest" map behavior, as in org-ui `LocationPickerMap`). Whenever you add or embed a map, include it — don't ship a fixed-height map.
- Reusable helper lives at `features/map/ui/MapResizeHandle.tsx`: `useResizableMapHeight()` (returns `{ height, isResized, containerRef, onResizeStart }`) + `<MapResizeHandle onPointerDown={onResizeStart} />`. Put `containerRef` on the map container and render `<MapResizeHandle>` inside it (container must be `relative`). Reference usage: `features/job-lead/ui/on-site-tracking/JobOnSiteMapSection.tsx`.
- Boundary/pins/core maps use `DeckBoundaryMap` (`@/features/map/ui`); the single-location picker is org-ui `LocationPickerMap` (already has the handle built in).

## Dummy Data (no backend)
- Mock mode is on via `NEXT_PUBLIC_USE_MOCK_DATA=true` in `.env.local`.
- `mocks/auth0-react.tsx` — always-authenticated demo user (aliased over `@auth0/auth0-react`).
- `mocks/mockApi.ts` — axios adapter attached to both `api/client.ts` and `lib/axios.ts`. It handles the auth/org/members/permissions/dashboard chain explicitly and returns DRF-style empty pages for everything else. **To add data for a new flow, add an explicit URL handler here** (watch the browser console for `[mockApi] unmatched GET` lines — that's the to-do list).
- The demo admin is granted every permission code; the demo org id is `1`.

## Workflow Instructions
- Do not scan the entire repository unless explicitly asked.
- Only read the specific files required to execute a prompt.
- If an error occurs: run the build/dev server, read the specific compiler/runtime errors, and fix only the affected files. Verify by reading the live DOM (`preview_eval`) — `preview_screenshot` times out on chart/canvas-heavy pages here.

## Running it (Node is NOT on PATH — use full paths)
Node 24 lives at `C:\Program Files\nodejs\node.exe`; npm at `C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js`.
- The dev server is defined in `.claude/launch.json` (`cms-frontend` → 3000). Start with `preview_start`. It invokes Next's JS entry directly via the full `node.exe` path (the preview process has a stale PATH without Node).
- **Preview viewport default: 1920×1080.** After starting/first using the preview each session, call `preview_resize` with `{ width: 1920, height: 1080 }` — the CMS layout is designed for a 1920-wide desktop.
- org-ui build quirk: `npm run build` fails on Windows (`rm -rf` in the `clean` script). Run `npm run build:js` then `npm run build:css` instead.
- The CMS consumes org-ui from a local tarball (`vendor/fieldflow360-org-ui-*.tgz`, a `file:` dependency) because the published package is on GitHub Packages (auth-gated). npm `overrides` pin the deck.gl family to a single 9.3.3 (avoids a multi-version runtime crash). After changing org-ui source: rebuild → `npm pack` → reinstall.
