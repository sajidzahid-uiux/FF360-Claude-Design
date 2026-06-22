export interface SidebarItem {
  id: string;
  label: string;
  description: string;
  category: 'ui-components' | 'widgets' | 'system-components';
  group?: 'controls' | 'files' | 'org-widgets' | 'theme';
  available?: boolean;
}

export interface UserSettingsItem {
  id: "user-appearance" | "user-theme-tokens";
  slug: "appearance" | "theme-tokens";
  label: string;
  description: string;
  available?: boolean;
}

export interface OrganizationSettingsItem {
  id: "organization-info-settings" | "organization-danger-zone";
  slug: "organization-info" | "danger-zone";
  label: string;
  description: string;
  available?: boolean;
}

export const sidebarItems: SidebarItem[] = [
  {
    id: 'buttons',
    label: 'Buttons',
    description: 'Variants, sizes, states',
    category: 'ui-components',
    group: 'controls',
    available: true,
  },
  {
    id: 'input',
    label: 'Input',
    description: 'Fields, validation, icons',
    category: 'ui-components',
    available: true,
  },
  {
    id: 'controls',
    label: 'Controls',
    description: 'Checkbox and toggle variants',
    category: 'ui-components',
    group: 'controls',
    available: true,
  },
  {
    id: 'slider-color-picker',
    label: 'Slider + Color Picker',
    description: 'Polished range and accent swatch controls',
    category: 'ui-components',
    group: 'controls',
    available: true,
  },
  {
    id: 'tabs-switcher',
    label: 'Tabs switcher',
    description: 'Segmented tab navigation',
    category: 'ui-components',
    available: true,
  },
  {
    id: 'dropdown',
    label: 'Dropdown',
    description: 'Select menu with keyboard support',
    category: 'ui-components',
    available: true,
  },
  {
    id: 'search-input',
    label: 'Search Input',
    description: 'Search field with clear action',
    category: 'ui-components',
    available: true,
  },
  {
    id: 'table',
    label: 'Table',
    description: 'Data table with row action menu',
    category: 'widgets',
    available: true,
  },
  {
    id: 'file-upload',
    label: 'File Upload',
    description: 'Upload and drag-drop widget',
    category: 'ui-components',
    group: 'files',
    available: true,
  },
  {
    id: 'uploaded-file',
    label: 'Uploaded File',
    description: 'Uploaded file status/actions row',
    category: 'ui-components',
    group: 'files',
    available: true,
  },
  {
    id: 'theme-controls',
    label: 'Theme controls',
    description: 'Appearance & accent picker',
    category: 'widgets',
    group: 'theme',
    available: true,
  },
  {
    id: 'theme-tokens',
    label: 'Theme Tokens',
    description: 'All color tokens aligned with Tile Design',
    category: 'widgets',
    group: 'theme',
    available: true,
  },
  {
    id: 'map-components',
    label: 'Map Components',
    description: 'Location picker map and zoom controls',
    category: 'widgets',
    available: true,
  },
  {
    id: 'loader',
    label: 'Loader',
    description: 'Loading spinner widget',
    category: 'widgets',
    available: true,
  },
  {
    id: 'charts',
    label: 'Charts',
    description: 'Bar, trend, and radial charts with legends',
    category: 'widgets',
    available: true,
  },
  {
    id: 'not-found',
    label: 'Not Found',
    description: 'Empty/not-found state widget',
    category: 'widgets',
    available: true,
  },
  {
    id: 'avatar',
    label: 'Avatar',
    description: 'Image + fallback profile primitive',
    category: 'system-components',
    available: true,
  },
  {
    id: 'app-form-modal',
    label: 'App Form Modal',
    description: 'Shared modal shell for app forms',
    category: 'system-components',
    available: true,
  },
  {
    id: 'modal',
    label: 'Modal',
    description: 'Simple reusable content modal',
    category: 'system-components',
    available: true,
  },
  {
    id: 'organization-switcher',
    label: 'Organization Switcher',
    description: 'Switch and create organization modal',
    category: 'widgets',
    group: 'org-widgets',
    available: true,
  },
  {
    id: 'organization-info',
    label: 'Organization Info',
    description: 'Organization details card for settings pages',
    category: 'widgets',
    group: 'org-widgets',
    available: true,
  },
  {
    id: 'delete-organization',
    label: 'Delete Organization',
    description: 'Danger zone section for organization removal',
    category: 'widgets',
    group: 'org-widgets',
    available: true,
  },
  {
    id: 'app-layout',
    label: 'App Layout',
    description: 'Full app layout and tools config patterns',
    category: 'system-components',
    available: true,
  },
  {
    id: 'app-breadcrumbs',
    label: 'App Breadcrumbs',
    description: 'Breadcrumb trail and optional toolbar row',
    category: 'system-components',
    available: true,
  },
  {
    id: 'sidebar-primitives',
    label: 'Sidebar primitives',
    description: 'NavGroupLink and collapse button',
    category: 'system-components',
    available: true,
  },
  {
    id: 'dialog',
    label: 'Dialog',
    description: 'Confirmation and delete dialog flow',
    category: 'system-components',
    available: true,
  },
];

export const userSettingsItems: UserSettingsItem[] = [
  {
    id: "user-appearance",
    slug: "appearance",
    label: "Appearance",
    description: "Theme mode and accent controls",
    available: true,
  },
  {
    id: "user-theme-tokens",
    slug: "theme-tokens",
    label: "Theme Tokens",
    description: "Preview semantic color tokens",
    available: false,
  },
];

export const organizationSettingsItems: OrganizationSettingsItem[] = [
  {
    id: "organization-info-settings",
    slug: "organization-info",
    label: "Organization Info",
    description: "Organization profile and details",
    available: true,
  },
  {
    id: "organization-danger-zone",
    slug: "danger-zone",
    label: "Danger Zone",
    description: "Organization delete settings section",
    available: false,
  },
];

