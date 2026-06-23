import { MouseEvent, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { ThemeControlsAppearanceStyleEnum } from '../../../constants';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { ThemeControls, type ThemeControlsProps } from '../../widgets/ThemeControls';
import { AppBreadcrumbItem, AppBreadcrumbs } from '../AppBreadcrumbs';
import { NavExpandableMenuItem } from '../NavExpandableMenuItem';
import { NavGroupLink } from '../NavGroupLink';
import type { FieldFlowSettingsConfig, FieldFlowSettingsLink } from '../SettingsLayout';
import { SidebarFooter } from '../SidebarFooter';
import { SidebarHeader } from '../SidebarHeader';
import { isFieldFlowSettingsPath } from '../SettingsLayout/settingsPath';
import { AppLayoutMobileShellBar } from './AppLayoutMobileShellBar';
import { FIELD_FLOW_APP_LAYOUT_MOBILE_MEDIA_QUERY } from './constants';

export type FieldFlowSidebarNavRenderArgs = {
  isCollapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  isMobile: boolean;
  closeMobileSidebar: () => void;
};

type SidebarNavContent = ReactNode | ((args: FieldFlowSidebarNavRenderArgs) => ReactNode);

export interface FieldFlowUserMenuAction {
  id: string;
  label: string;
  onSelect: () => void;
  icon?: ReactNode;
  tone?: 'default' | 'danger';
}

export interface FieldFlowSidebarLink {
  id: string;
  title: string;
  href: string;
  icon: ReactNode;
  isActive?: boolean;
  onSelect?: () => void;
  children?: FieldFlowSidebarLink[];
}

export interface FieldFlowSidebarGroup {
  id: string;
  title?: string;
  links: FieldFlowSidebarLink[];
}

export interface FieldFlowUserSettingsConfig {
  enabled?: boolean;
  link?: FieldFlowSidebarLink;
  showThemeControls?: boolean;
  /** Path prefix used to show default ThemeControls panel. */
  themeControlsPathPrefix?: string;
  themeControlsProps?: Partial<ThemeControlsProps>;
}

export interface FieldFlowOrganizationSettingsConfig {
  enabled?: boolean;
  link?: FieldFlowSidebarLink;
  /**
   * Nested links shown under Organization Settings in the main sidebar.
   * Organization Info is always injected as a required default option.
   */
  options?: FieldFlowSidebarLink[];
}

export interface FieldFlowToolsConfig {
  enabled?: boolean;
  title?: string;
  userSettings?: FieldFlowUserSettingsConfig;
  organizationSettings?: FieldFlowOrganizationSettingsConfig;
}

export interface CreateFieldFlowToolsConfigOptions {
  title?: string;
  userSettings?: {
    enabled?: boolean;
    href?: string;
    showThemeControls?: boolean;
    themeControlsPathPrefix?: string;
    themeControlsProps?: Partial<ThemeControlsProps>;
  };
  organizationSettings?: {
    enabled?: boolean;
    href?: string;
    options?: Array<{
      id: string;
      title: string;
      href: string;
      icon?: ReactNode;
    }>;
  };
}

export interface CreateFieldFlowSettingsConfigFromToolsOptions {
  toolsConfig?: FieldFlowToolsConfig;
  currentPath?: string;
  mode?: 'auto' | 'all';
}

export function createFieldFlowToolsConfig(
  options?: CreateFieldFlowToolsConfigOptions
): FieldFlowToolsConfig {
  return {
    enabled: true,
    title: options?.title ?? "Tools",
    userSettings: {
      enabled: options?.userSettings?.enabled ?? true,
      link: {
        id: "user-settings",
        title: "User Settings",
        href: options?.userSettings?.href ?? "/settings/user/appearance",
        icon: <DefaultSectionIcon symbol="U" />,
      },
      showThemeControls: options?.userSettings?.showThemeControls ?? true,
      themeControlsPathPrefix:
        options?.userSettings?.themeControlsPathPrefix ?? "/settings/user",
      themeControlsProps: options?.userSettings?.themeControlsProps,
    },
    organizationSettings: {
      enabled: options?.organizationSettings?.enabled ?? false,
      link: {
        id: "organization-settings",
        title: "Organization Settings",
        href:
          options?.organizationSettings?.href ??
          "/settings/organization/organization-info",
        icon: <DefaultSectionIcon symbol="O" />,
      },
      options:
        options?.organizationSettings?.options?.map((option) => ({
          id: option.id,
          title: option.title,
          href: option.href,
          icon: option.icon ?? <DefaultSectionIcon symbol="•" />,
        })) ?? [],
    },
  };
}

export function createFieldFlowSettingsConfigFromTools({
  toolsConfig,
  currentPath,
  mode = 'auto',
}: CreateFieldFlowSettingsConfigFromToolsOptions = {}): FieldFlowSettingsConfig {
  const defaultUserSettingsLink: FieldFlowSidebarLink = {
    id: 'user-settings',
    title: 'User Settings',
    href: '/settings/user/appearance',
    icon: <DefaultSectionIcon symbol="U" />,
  };
  const defaultOrgSettingsLink: FieldFlowSidebarLink = {
    id: 'organization-settings',
    title: 'Organization Settings',
    href: '/settings/organization/organization-info',
    icon: <DefaultSectionIcon symbol="O" />,
  };
  const defaultOrgInfoOption: FieldFlowSidebarLink = {
    id: 'organization-info',
    title: 'Organization Info',
    href: '/settings/organization/organization-info',
    icon: <DefaultSectionIcon symbol="•" />,
  };

  const userSettingsEnabled = toolsConfig?.userSettings?.enabled ?? true;
  const organizationSettingsEnabled = toolsConfig?.organizationSettings?.enabled ?? false;

  const userRoot = markActiveByPath(
    toolsConfig?.userSettings?.link ?? defaultUserSettingsLink,
    currentPath
  );
  const organizationRoot = markActiveByPath(
    {
      ...(toolsConfig?.organizationSettings?.link ?? defaultOrgSettingsLink),
      children: [
        defaultOrgInfoOption,
        ...(toolsConfig?.organizationSettings?.options ?? []).filter(
          (option) => option.id !== defaultOrgInfoOption.id
        ),
      ],
    },
    currentPath
  );

  const toSettingsLinks = (root: FieldFlowSidebarLink): FieldFlowSettingsLink[] => {
    const source = root.children?.length ? root.children : [root];
    return source.map((link) => ({
      id: link.id,
      title: link.title,
      href: link.href,
      isActive: Boolean(link.isActive),
      onSelect: link.onSelect,
    }));
  };

  const userSection = userSettingsEnabled
    ? {
        id: 'user-settings',
        title: mode === 'auto' && currentPath?.startsWith('/settings/user') ? '' : 'User Settings',
        links: toSettingsLinks(userRoot),
      }
    : undefined;

  const organizationSection = organizationSettingsEnabled
    ? {
        id: 'organization-settings',
        title:
          mode === 'auto' && currentPath?.startsWith('/settings/organization')
            ? ''
            : 'Organization Settings',
        links: toSettingsLinks(organizationRoot),
      }
    : undefined;

  if (mode === 'all') {
    return {
      organization: organizationSection,
      user: userSection,
    };
  }

  if (currentPath?.startsWith('/settings/organization')) {
    return { organization: organizationSection };
  }
  if (currentPath?.startsWith('/settings/user')) {
    return { user: userSection };
  }

  return {
    organization: organizationSection,
    user: userSection,
  };
}

export interface FieldFlowAppLayoutProps {
  children: ReactNode;
  appTitle: string;
  logo: ReactNode;
  sidebarHeaderContent?: ReactNode;
  mainTopBar?: ReactNode;
  sidebarNav?: SidebarNavContent;
  sidebarGroups?: FieldFlowSidebarGroup[];
  sidebarTopContent?: ReactNode;
  user: {
    fullName: string;
    subtitle?: string;
    avatarSrc?: string;
    avatarFallback?: string;
  };
  userMenuActions: FieldFlowUserMenuAction[];
  breadcrumbs?: ReactNode | AppBreadcrumbItem[];
  breadcrumbRenderer?: (items: AppBreadcrumbItem[]) => ReactNode;
  /** Shown on the right when using default `AppBreadcrumbs` (omit when `breadcrumbRenderer` is set). */
  breadcrumbToolbar?: ReactNode;
  breadcrumbLinkComponent?: (props: {
    href: string;
    children: ReactNode;
    className?: string;
    onClick?: (event: MouseEvent<HTMLElement>) => void;
    'aria-current'?: 'page';
  }) => ReactNode;
  currentPath?: string;
  toolsConfig?: FieldFlowToolsConfig;
  collapseStorageKey?: string;
  defaultCollapsed?: boolean;
  /**
   * CSS media query for the mobile shell (overlay sidebar + optional top bar).
   * Defaults to CMS `AppLayout` breakpoint (`820px`).
   */
  mobileMediaQuery?: string;
  /**
   * Hide the built-in mobile shell bar (menu toggle). Use when `mainTopBar` already
   * provides navigation chrome (e.g. CMS `TopNavBar`).
   */
  hideMobileShellTopBar?: boolean;
  /** Trailing actions in the mobile shell bar (notifications, help, etc.). */
  mobileShellBarEnd?: ReactNode;
  /**
   * Hide breadcrumbs on mobile inside settings routes (default true).
   * Settings uses its own back navigation and page title on small screens.
   */
  hideBreadcrumbsOnMobileInSettings?: boolean;
}

function DefaultSectionIcon({ symbol }: { symbol: string }) {
  return (
    <span
      className="inline-flex h-4 w-4 items-center justify-center text-[10px] leading-none"
      aria-hidden
    >
      {symbol}
    </span>
  );
}

function markActiveByPath(link: FieldFlowSidebarLink, currentPath?: string): FieldFlowSidebarLink {
  const derivedIsActive =
    link.isActive ??
    (currentPath
      ? currentPath === link.href || currentPath.startsWith(`${link.href}/`)
      : false);

  return {
    ...link,
    isActive: derivedIsActive,
    children: link.children?.map((child) => markActiveByPath(child, currentPath)),
  };
}

function renderSidebarLinks(
  links: FieldFlowSidebarLink[],
  isCollapsed: boolean,
  depth = 0,
  onNavigate?: () => void
): ReactNode {
  return links.map((link) => {
    if (link.children?.length) {
      return (
        <NavExpandableMenuItem
          key={link.id}
          id={link.id}
          title={link.title}
          icon={link.icon}
          isCollapsed={isCollapsed}
          defaultExpanded={link.children.some((child) => child.isActive)}
          items={link.children.map((child) => ({
            id: child.id,
            href: child.href,
            title: child.title,
            icon: child.icon,
            isActive: Boolean(child.isActive),
            onClick: () => {
              child.onSelect?.();
              onNavigate?.();
            },
          }))}
        />
      );
    }

    return (
      <div
        key={link.id}
        style={depth > 0 ? { marginLeft: `${Math.min(depth * 12, 36)}px` } : undefined}
      >
        <NavGroupLink
          href={link.href}
          isActive={Boolean(link.isActive)}
          isCollapsed={isCollapsed}
          icon={link.icon}
          title={link.title}
          onClick={() => {
            link.onSelect?.();
            onNavigate?.();
          }}
        />
      </div>
    );
  });
}

export function FieldFlowAppLayout({
  children,
  appTitle,
  logo,
  sidebarHeaderContent,
  mainTopBar,
  sidebarNav,
  sidebarGroups,
  sidebarTopContent,
  user,
  userMenuActions,
  breadcrumbs,
  breadcrumbRenderer,
  breadcrumbToolbar,
  breadcrumbLinkComponent,
  currentPath,
  toolsConfig,
  collapseStorageKey = 'ff-app-layout-collapsed',
  defaultCollapsed = false,
  mobileMediaQuery = FIELD_FLOW_APP_LAYOUT_MOBILE_MEDIA_QUERY,
  hideMobileShellTopBar = false,
  mobileShellBarEnd,
  hideBreadcrumbsOnMobileInSettings = true,
}: FieldFlowAppLayoutProps) {
  const isMobile = useMediaQuery(mobileMediaQuery);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') return defaultCollapsed;
    const stored = window.localStorage.getItem(collapseStorageKey);
    if (stored === null) return defaultCollapsed;
    return stored === '1';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(collapseStorageKey, isCollapsed ? '1' : '0');
  }, [collapseStorageKey, isCollapsed]);

  useEffect(() => {
    if (!isMobile) setIsMobileSidebarOpen(false);
  }, [isMobile]);

  const closeMobileSidebar = useCallback(() => setIsMobileSidebarOpen(false), []);
  const toggleMobileSidebar = useCallback(
    () => setIsMobileSidebarOpen((prev) => !prev),
    []
  );

  const sidebarCollapsedForRender = isMobile ? false : isCollapsed;

  const resolvedToolsConfig = useMemo<FieldFlowToolsConfig>(() => {
    const defaultUserSettingsLink: FieldFlowSidebarLink = {
      id: 'user-settings',
      title: 'User Settings',
      href: '/settings/user/appearance',
      icon: <DefaultSectionIcon symbol="U" />,
    };

    const defaultOrgSettingsLink: FieldFlowSidebarLink = {
      id: 'organization-settings',
      title: 'Organization Settings',
      href: '/settings/organization/organization-info',
      icon: <DefaultSectionIcon symbol="O" />,
    };

    const defaultOrgInfoOption: FieldFlowSidebarLink = {
      id: 'organization-info',
      title: 'Organization Info',
      href: '/settings/organization/organization-info',
      icon: <DefaultSectionIcon symbol="•" />,
    };

    return {
      enabled: toolsConfig?.enabled ?? true,
      title: toolsConfig?.title ?? 'Tools',
      userSettings: {
        enabled: toolsConfig?.userSettings?.enabled ?? true,
        link: markActiveByPath(
          toolsConfig?.userSettings?.link ?? defaultUserSettingsLink,
          currentPath
        ),
        showThemeControls: toolsConfig?.userSettings?.showThemeControls ?? true,
        themeControlsPathPrefix:
          toolsConfig?.userSettings?.themeControlsPathPrefix ?? '/settings/user',
        themeControlsProps: toolsConfig?.userSettings?.themeControlsProps,
      },
      organizationSettings: {
        enabled: toolsConfig?.organizationSettings?.enabled ?? false,
        link: markActiveByPath(
          {
            ...(toolsConfig?.organizationSettings?.link ?? defaultOrgSettingsLink),
            children: [
              defaultOrgInfoOption,
              ...(toolsConfig?.organizationSettings?.options ?? []).filter(
                (option) => option.id !== defaultOrgInfoOption.id
              ),
            ],
          },
          currentPath
        ),
      },
    };
  }, [toolsConfig, currentPath]);

  const resolvedSidebarGroups = useMemo(() => {
    if (sidebarGroups?.length) {
      return sidebarGroups.map((group) => ({
        ...group,
        links: group.links.map((link) => markActiveByPath(link, currentPath)),
      }));
    }
    if (resolvedToolsConfig.enabled === false) return [];

    const toolLinks: FieldFlowSidebarLink[] = [];
    if (resolvedToolsConfig.organizationSettings?.enabled) {
      const orgLink = resolvedToolsConfig.organizationSettings.link;
      if (orgLink) toolLinks.push(orgLink);
    }
    if (resolvedToolsConfig.userSettings?.enabled) {
      const userLink = resolvedToolsConfig.userSettings.link;
      if (userLink) toolLinks.push(userLink);
    }

    return toolLinks.length > 0
      ? [
          {
            id: 'default-tools',
            title: resolvedToolsConfig.title ?? 'Tools',
            links: toolLinks,
          },
        ]
      : [];
  }, [sidebarGroups, currentPath, resolvedToolsConfig]);

  const navContent = useMemo(() => {
    const sidebarNavArgs: FieldFlowSidebarNavRenderArgs = {
      isCollapsed: sidebarCollapsedForRender,
      setCollapsed: setIsCollapsed,
      isMobile,
      closeMobileSidebar,
    };

    if (typeof sidebarNav === 'function') {
      return sidebarNav(sidebarNavArgs);
    }
    if (sidebarNav) return sidebarNav;
    if (!resolvedSidebarGroups.length) return null;

    const onNavigate = isMobile ? closeMobileSidebar : undefined;

    return (
      <div className="flex h-full flex-col">
        {sidebarTopContent ? <div>{sidebarTopContent}</div> : null}
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
          {resolvedSidebarGroups.map((group, groupIndex) => (
            <div key={group.id} className="border-border-subtle/60 border-b p-2 last:border-b-0">
              {!sidebarCollapsedForRender && group.title ? (
                <span className="text-text-muted flex h-[32px] items-center px-2 text-xs font-[500]">
                  {group.title}
                </span>
              ) : null}

              <div className="space-y-1">
                <div
                  className={
                    !sidebarCollapsedForRender && !group.title && groupIndex === 0
                      ? 'mt-1'
                      : undefined
                  }
                >
                  {renderSidebarLinks(group.links, sidebarCollapsedForRender, 0, onNavigate)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }, [
    closeMobileSidebar,
    isMobile,
    resolvedSidebarGroups,
    sidebarCollapsedForRender,
    sidebarNav,
    sidebarTopContent,
  ]);

  const renderedBreadcrumbs = useMemo(() => {
    if (!breadcrumbs) return null;
    if (Array.isArray(breadcrumbs)) {
      if (breadcrumbRenderer) return breadcrumbRenderer(breadcrumbs);
      return (
        <AppBreadcrumbs
          items={breadcrumbs}
          linkComponent={breadcrumbLinkComponent}
          toolbar={breadcrumbToolbar}
        />
      );
    }
    return breadcrumbs;
  }, [breadcrumbs, breadcrumbLinkComponent, breadcrumbRenderer, breadcrumbToolbar]);

  const shouldShowDefaultThemeControls = useMemo(() => {
    const userSettings = resolvedToolsConfig.userSettings;
    if (!userSettings?.enabled) return false;
    if (!userSettings.showThemeControls) return false;
    if (!currentPath) return false;
    const prefix = userSettings.themeControlsPathPrefix;
    return Boolean(prefix && (currentPath === prefix || currentPath.startsWith(`${prefix}/`)));
  }, [resolvedToolsConfig, currentPath]);

  const asideClassName = `border-border-subtle bg-[var(--primary-foreground,#FAFAFA)] dark:bg-bg-surface night:bg-bg-surface relative flex h-full flex-col overflow-hidden border-r transition-[width,min-width] duration-200 ${
    sidebarCollapsedForRender ? 'w-16 min-w-16' : 'w-[255px] min-w-[255px]'
  }`;

  const mainHorizontalPadding = isMobile ? 'px-4' : 'px-6';

  const sidebarPanel = (
    <>
      <SidebarHeader
        title={appTitle}
        logo={logo}
        isCollapsed={sidebarCollapsedForRender}
        showCollapseToggle={!isMobile}
        onToggleCollapsed={() => setIsCollapsed((prev) => !prev)}
      />
      {sidebarHeaderContent ? (
        <div className="border-border-subtle/60 shrink-0 border-b px-2 py-2">
          {sidebarHeaderContent}
        </div>
      ) : null}
      <nav className="min-h-0 flex-1 overflow-auto">{navContent}</nav>
      <SidebarFooter
        isCollapsed={sidebarCollapsedForRender}
        user={user}
        actions={userMenuActions}
        onToggleCollapsed={() => setIsCollapsed((prev) => !prev)}
        showCollapseToggle={false}
      />
    </>
  );

  const handleMainAreaClick = (event: MouseEvent<HTMLElement>) => {
    if (!isMobile || !isMobileSidebarOpen) return;

    const target = event.target as HTMLElement;
    const interactiveTags = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA', 'LABEL'];
    if (
      interactiveTags.includes(target.tagName) ||
      target.closest('button, a, input, select, textarea, label, [tabindex]')
    ) {
      return;
    }

    closeMobileSidebar();
  };

  const showMobileShellBar = isMobile && !hideMobileShellTopBar;

  const shouldRenderBreadcrumbs = Boolean(
    renderedBreadcrumbs &&
      !(
        isMobile &&
        hideBreadcrumbsOnMobileInSettings &&
        isFieldFlowSettingsPath(currentPath)
      )
  );

  return (
    <div className="bg-bg-app flex h-screen overflow-hidden">
      {!isMobile ? <aside className={`${asideClassName} h-screen`}>{sidebarPanel}</aside> : null}

      {isMobile && isMobileSidebarOpen ? (
        <div className="fixed inset-0 z-50 h-screen">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close navigation menu"
            onClick={closeMobileSidebar}
          />
          <aside
            className={`${asideClassName} absolute top-0 left-0 z-50 h-full max-h-screen max-w-[92vw] shadow-xl`}
            style={{ width: 288 }}
          >
            {sidebarPanel}
          </aside>
        </div>
      ) : null}

      <main
        className="bg-bg-main flex min-w-0 flex-1 flex-col overflow-hidden"
        onClick={handleMainAreaClick}
      >
        {showMobileShellBar ? (
          <AppLayoutMobileShellBar
            appTitle={appTitle}
            logo={logo}
            onToggleSidebar={toggleMobileSidebar}
            end={mobileShellBarEnd}
          />
        ) : null}
        {mainTopBar ? (
          <div
            className={`border-border-subtle/60 shrink-0 border-b py-3 ${mainHorizontalPadding}`}
          >
            {mainTopBar}
          </div>
        ) : null}
        {shouldRenderBreadcrumbs ? (
          <div className={`shrink-0 py-3 ${mainHorizontalPadding}`}>{renderedBreadcrumbs}</div>
        ) : null}
        {shouldShowDefaultThemeControls ? (
          <div className={`border-border-subtle/60 shrink-0 border-b py-4 ${mainHorizontalPadding}`}>
            <ThemeControls
              appearanceStyle={ThemeControlsAppearanceStyleEnum.SEGMENTED}
              showHexInput={false}
              {...resolvedToolsConfig.userSettings?.themeControlsProps}
            />
          </div>
        ) : null}
        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
      </main>
    </div>
  );
}
