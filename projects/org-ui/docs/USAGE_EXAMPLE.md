# Usage Example (Next.js + Enum-based API)

This guide reflects the current `@fieldflow360/org-ui` API, including reusable components and shared enums.

## 1) Install

```bash
npm install /path/to/org-ui
```

## 2) Tailwind config

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
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

## 4) Wrap with ThemeProvider

```tsx
import { ThemeProvider, ThemeModeEnum } from '@fieldflow360/org-ui';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider
          defaultMode={ThemeModeEnum.LIGHT}
          defaultAccentColor="#DFFF86"
          accentStorageKey="ff-accent"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

## 5) Full component usage example

```tsx
import { useState } from 'react';
import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  CornerRadiusEnum,
  Dropdown,
  Input,
  TabsSwitcher,
  TabsSwitcherViewEnum,
  ThemeControls,
  ThemeControlsOrientationEnum,
  SurfaceVariantEnum,
} from '@fieldflow360/org-ui';

const tabs = [
  { value: 'overview', label: 'Overview' },
  { value: 'activity', label: 'Activity' },
  { value: 'settings', label: 'Settings' },
];

const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
];

export default function Page() {
  const [tab, setTab] = useState('overview');
  const [status, setStatus] = useState('open');

  return (
    <main className="space-y-6 p-6">
      <ThemeControls
        orientation={ThemeControlsOrientationEnum.HORIZONTAL}
        surface={SurfaceVariantEnum.GLASS}
      />

      <div className="flex flex-wrap gap-3">
        <Button
          title="Accent"
          variant={ButtonVariantEnum.ACCENT}
          size={ComponentSizeEnum.MD}
        />
        <Button
          title="Custom Colored"
          variant={ButtonVariantEnum.COLORED}
          style={{ ['--btn-colored-bg' as string]: '#7dd3fc', ['--btn-colored-fg' as string]: '#0b1623' }}
        />
        <Button
          title="Danger"
          variant={ButtonVariantEnum.DANGER}
          size={ComponentSizeEnum.SM}
        />
      </div>

      <TabsSwitcher
        items={tabs}
        value={tab}
        onChange={setTab}
        size={ComponentSizeEnum.MD}
        radius={CornerRadiusEnum.MD}
        view={TabsSwitcherViewEnum.PILL}
      />

      <TabsSwitcher
        items={tabs}
        value={tab}
        onChange={setTab}
        size={ComponentSizeEnum.SM}
        radius={CornerRadiusEnum.SM}
        view={TabsSwitcherViewEnum.UNDERLINED}
      />

      <div className="max-w-sm">
        <Input
          label="Accent hex"
          placeholder="#DFFF86"
          helperText={['Format: #RRGGBB', 'Example: #6EE7B7']}
        />
      </div>

      <div className="max-w-xs">
        <Dropdown
          label="Status"
          value={status}
          onChange={setStatus}
          options={statusOptions}
          size={ComponentSizeEnum.MD}
        />
      </div>
    </main>
  );
}
```

## 6) What to import

```tsx
import {
  // Components
  Button,
  Input,
  TabsSwitcher,
  Dropdown,
  ThemeControls,
  ThemeProvider,
  useTheme,

  // Enums
  ThemeModeEnum,
  ComponentSizeEnum,
  CornerRadiusEnum,
  ButtonVariantEnum,
  TabsSwitcherViewEnum,
  ThemeControlsAppearanceStyleEnum,
  ThemeControlsOrientationEnum,
  SurfaceVariantEnum,
} from '@fieldflow360/org-ui';
```

## 7) AppLayout with top slots + org mapping

```tsx
import {
  FieldFlowAppLayout,
  FieldFlowOrganizationSourceEnum,
  mapOrganizationToFieldFlow,
  createFieldFlowToolsConfig,
} from '@fieldflow360/org-ui';

const toolsConfig = createFieldFlowToolsConfig({
  organizationSettings: {
    enabled: true,
    options: [
      { id: 'organization-danger-zone', title: 'Danger Zone', href: '/settings/organization/danger-zone' },
    ],
  },
});

const organization = mapOrganizationToFieldFlow(
  rawOrganization,
  FieldFlowOrganizationSourceEnum.CMS
);

<FieldFlowAppLayout
  appTitle="@fieldflow360/org-ui"
  logo={<span>FF</span>}
  sidebarHeaderContent={<div>Sidebar context block</div>}
  mainTopBar={<div>CMS top bar area</div>}
  user={{ fullName: 'Developer', subtitle: 'UI Engineer' }}
  userMenuActions={[]}
  toolsConfig={toolsConfig}
>
  <OrganizationInfo
    organization={organization}
    canEdit={canEditOrganization}
    onEdit={canEditOrganization ? openEditModal : undefined}
  />
  <DeleteOrganization
    canDelete={Boolean(organization.canDeleteOrganization)}
    onDelete={organization.canDeleteOrganization ? openDeleteDialog : undefined}
  />
</FieldFlowAppLayout>;
```

## Notes

- Prefer enums instead of string literals for reusable props like `size`, `variant`, `radius`, `view`, `mode`, and surface/orientation values.
- `Input.helperText` supports both `string` and `string[]`.
- `Dropdown` supports default field trigger and custom trigger rendering.

