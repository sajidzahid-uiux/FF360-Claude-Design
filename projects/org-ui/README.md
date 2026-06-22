# @fieldflow360/org-ui

Shared React UI library for FieldFlow360 apps, including theme primitives, accent-aware controls, and reusable form/navigation components.

## Installation

```bash
npm install /path/to/org-ui
```

## Tailwind Setup

```js
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './node_modules/@fieldflow360/org-ui/dist/**/*.{js,mjs}',
  ],
  theme: { extend: {} },
  plugins: [],
};
```

Import library styles once in your app root:

```tsx
import '@fieldflow360/org-ui/styles.css';
```

## Core Exports

- Components: `Button`, `Input`, `TabsSwitcher`, `Dropdown`, `ThemeControls`
- Theme: `ThemeProvider`, `useTheme`, `lightTheme`, `darkTheme`, `nightTheme`
- Enums: `ThemeModeEnum`, `ComponentSizeEnum`, `CornerRadiusEnum`, `ButtonVariantEnum`, `TabsSwitcherViewEnum`, `ThemeControlsOrientationEnum`, `ThemeControlsAppearanceStyleEnum`, `SurfaceVariantEnum`
- Utils: `cn`, `getAccentTextColor`, `toAccentLight`

## Permission-ready Component Pattern

When a component wraps privileged actions, prefer explicit permission gates in the component API:

- `canEdit` / `canDelete` booleans
- handler props (`onEdit`, `onDelete`) kept optional for safe rendering
- fallback text for no-permission states when useful

Example:

```tsx
import { DeleteOrganization } from '@fieldflow360/org-ui';

<DeleteOrganization
  canDelete={permissions.canDelete}
  onDelete={permissions.canDelete ? handleDelete : undefined}
  noPermissionLabel="You do not have permission to delete this organization."
/>;
```

Current behavior:

- If `canDelete` is `false`, delete sections are not rendered.
- If `canEdit` is `false`, edit actions are not rendered.

## AppLayout Extension Slots

`FieldFlowAppLayout` supports two extension points for CMS-style layouts:

- `sidebarHeaderContent`: renders under sidebar header, above nav
- `mainTopBar`: renders in main content before breadcrumbs

```tsx
<FieldFlowAppLayout
  appTitle="FieldFlow"
  logo={<span>FF</span>}
  sidebarHeaderContent={<CustomSidebarPanel />}
  mainTopBar={<CmsTopBar />}
  user={{ fullName: "Developer", subtitle: "UI Engineer" }}
  userMenuActions={[]}
>
  <Page />
</FieldFlowAppLayout>
```

## Organization Mapping Adapter

Use org-ui adapter helpers to normalize consumer payloads (`tile-design`/`cms`) before rendering widgets:

```tsx
import {
  FieldFlowOrganizationSourceEnum,
  mapOrganizationToFieldFlow,
  mapOrganizationsToFieldFlow,
} from "@fieldflow360/org-ui";

const organization = mapOrganizationToFieldFlow(
  rawOrganization,
  FieldFlowOrganizationSourceEnum.CMS
);
const organizations = mapOrganizationsToFieldFlow(
  rawOrganizations,
  FieldFlowOrganizationSourceEnum.TILE_DESIGN
);
```

## Enum-first Usage

```tsx
import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  ThemeProvider,
  ThemeModeEnum,
} from '@fieldflow360/org-ui';

export function Example() {
  return (
    <ThemeProvider defaultMode={ThemeModeEnum.NIGHT}>
      <Button
        variant={ButtonVariantEnum.ACCENT}
        size={ComponentSizeEnum.MD}
        title="Accent action"
      />
    </ThemeProvider>
  );
}
```

## Docs

- `docs/CONSUMING_APPS.md` — local `file:` linking vs registry updates (CMS, Tile Design)
- `docs/QUICK_START.md`
- `docs/USAGE_EXAMPLE.md`
- `docs/BUILD_MODES.md`
- `docs/RELEASE_NOTES_2026-05-07.md`

## Development

```bash
npm run build:release
npm run build:verify-apps
npm run dev
npm run dev:package   # watch rebuild dist/ while editing src/
npm run type-check
npm run lint
```

Consuming apps (CMS, Tile): see [docs/CONSUMING_APPS.md](docs/CONSUMING_APPS.md).

## Build Modes

Use separate build modes depending on your goal:

- `npm run build:release`
  - Builds **only package artifacts** from `src` into `dist`.
  - This is the command to use before publish/release.
  - Dev and consumer apps are not included in `dist` and are never published.

- `npm run build:verify-apps`
  - Builds `dev-app` and `consumer-app` (Next.js) to validate real rendering/integration.
  - Use this as a verification gate after component/layout changes.

- `npm run build`
  - Alias to `npm run build:release`.

