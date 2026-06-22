import { FieldFlowSettingsConfig, FieldFlowSettingsLink } from './FieldFlowSettingsLayout';

export interface CreateSettingsConfigOptions {
  organizationBasePath: string;
  userBasePath: string;
  pathname?: string;
  includeAppearance?: boolean;
  organizationLinks?: FieldFlowSettingsLink[];
  userLinks?: FieldFlowSettingsLink[];
  extraUserLinks?: FieldFlowSettingsLink[];
}

function markActive(pathname: string | undefined, link: FieldFlowSettingsLink): FieldFlowSettingsLink {
  if (!pathname) return link;
  return {
    ...link,
    isActive: pathname === link.href || pathname.startsWith(`${link.href}/`),
  };
}

export function createDefaultSettingsConfig({
  organizationBasePath,
  userBasePath,
  pathname,
  includeAppearance = true,
  organizationLinks,
  userLinks,
  extraUserLinks = [],
}: CreateSettingsConfigOptions): FieldFlowSettingsConfig {
  const orgDefaults: FieldFlowSettingsLink[] = [
    { id: 'organization', title: 'Organization', href: `${organizationBasePath}/organization` },
  ];

  const userDefaults: FieldFlowSettingsLink[] = includeAppearance
    ? [{ id: 'appearance', title: 'Appearance', href: `${userBasePath}/appearance` }]
    : [];

  return {
    organization: {
      id: 'organization-settings',
      title: 'Organization Settings',
      links: (organizationLinks ?? orgDefaults).map((link) => markActive(pathname, link)),
    },
    user: {
      id: 'user-settings',
      title: 'User Settings',
      links: [...(userLinks ?? userDefaults), ...extraUserLinks].map((link) => markActive(pathname, link)),
    },
  };
}

