# Quick Start

## 1) Install

```bash
npm install /path/to/org-ui
```

## 2) Tailwind content

```js
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './node_modules/@fieldflow360/org-ui/dist/**/*.{js,mjs}',
  ],
  theme: { extend: {} },
  plugins: [],
};
```

## 3) Import styles once

```tsx
import '@fieldflow360/org-ui/styles.css';
```

## 4) Wrap app with ThemeProvider

```tsx
import {
  ThemeProvider,
  ThemeModeEnum,
  SurfaceVariantEnum,
} from '@fieldflow360/org-ui';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      defaultMode={ThemeModeEnum.LIGHT}
      defaultAccentColor="#DFFF86"
      accentStorageKey="my-app-accent"
    >
      {children}
    </ThemeProvider>
  );
}
```

## 5) Use enum-based props

```tsx
import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  TabsSwitcher,
  TabsSwitcherViewEnum,
  CornerRadiusEnum,
} from '@fieldflow360/org-ui';

const tabItems = [
  { value: 'overview', label: 'Overview' },
  { value: 'details', label: 'Details' },
];

export function Demo() {
  return (
    <div className="space-y-4">
      <Button
        variant={ButtonVariantEnum.ACCENT}
        size={ComponentSizeEnum.MD}
        title="Accent"
      />

      <TabsSwitcher
        items={tabItems}
        value="overview"
        onChange={(next) => console.log(next)}
        size={ComponentSizeEnum.MD}
        radius={CornerRadiusEnum.MD}
        view={TabsSwitcherViewEnum.UNDERLINED}
      />
    </div>
  );
}
```

## Available reusable components

- `Button`
- `Input`
- `TabsSwitcher`
- `Dropdown`
- `ThemeControls`

## App Layout Extras

`FieldFlowAppLayout` supports:

- `sidebarHeaderContent` (under sidebar header)
- `mainTopBar` (before breadcrumbs in main area)

Use adapter helpers for cross-app organization payloads:

- `FieldFlowOrganizationSourceEnum`
- `mapOrganizationToFieldFlow`
- `mapOrganizationsToFieldFlow`
- `createFieldFlowToolsConfig`

## Build and Release Workflow

`org-ui` has two different build targets:

- **Release build (library only)**  
  `npm run build:release`  
  Generates package output in `dist` from `src` only.

- **App verification build (integration check)**  
  `npm run build:verify-apps`  
  Builds both Next.js apps (`dev-app`, `consumer-app`) to verify rendering behavior.

For publishing, always use the release build path (`build` or `build:release`), not app verification.

