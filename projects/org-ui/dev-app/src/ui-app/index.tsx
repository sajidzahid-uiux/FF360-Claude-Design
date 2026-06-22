"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AppBreadcrumbs,
  CreateOrganizationModal,
  DeleteOrganization,
  DeleteDialog,
  DynamicFavicon,
  FieldFlowAppLayout,
  createFieldFlowSettingsConfigFromTools,
  createFieldFlowToolsConfig,
  FieldFlowSettingsLayout,
  FieldFlowSettingsPageLayout,
  OrganizationInfo,
  ThemeControls,
} from "@fieldflow360/org-ui";
import { ReactNode, useCallback, useMemo, useState } from "react";
import {
  AppBreadcrumbsRenderer,
  AppLayoutRenderer,
  AppFormModalRenderer,
  AvatarRenderer,
  ButtonRenderer,
  ChartsRenderer,
  ControlsRenderer,
  DeleteOrganizationRenderer,
  DialogRenderer,
  DropdownRenderer,
  FileUploadRenderer,
  InputRenderer,
  LoaderRenderer,
  MapComponentsRenderer,
  ModalRenderer,
  NotFoundRenderer,
  OrganizationSwitcherRenderer,
  SearchInputRenderer,
  SidebarPrimitivesRenderer,
  SliderColorPickerRenderer,
  TableRenderer,
  TabsSwitcherRenderer,
  ThemeControlsRenderer,
  ThemeTokensRenderer,
  UploadedFileRenderer,
} from "../renderers";
import { AppHeader, Sidebar, sidebarItems, userSettingsItems, organizationSettingsItems } from "./ui-app-components";


export interface UIAppProps {
  mode: string;
}

type RouteSection = "components" | "user-settings" | "organization-settings";

export const UIApp = ({ mode }: UIAppProps) => {
  type OrganizationDemoData = {
    name: string;
    email: string;
    phoneNumber: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
    memberCount: number;
    createdAt: string;
    canEditOrganization: boolean;
    canDeleteOrganization: boolean;
  };
  const pathname = usePathname() ?? "/components/ui-components/buttons";
  const router = useRouter();
  const defaultComponentHref = "/components/ui-components/buttons";
  const defaultUserSettingsHref = "/settings/user/appearance";
  const defaultOrganizationSettingsHref = "/settings/organization/organization-info";
  const getItemHref = useCallback(
    (item: (typeof sidebarItems)[number]) => `/components/${item.category}/${item.id}`,
    []
  );
  const getUserSettingsHref = useCallback(
    (item: (typeof userSettingsItems)[number]) => `/settings/user/${item.slug}`,
    []
  );
  const getOrganizationSettingsHref = useCallback(
    (item: (typeof organizationSettingsItems)[number]) =>
      `/settings/organization/${item.slug}`,
    []
  );
  const parsePath = (path: string) => {
    const componentMatch = path.match(/^\/components(?:\/([^/]+))?(?:\/([^/]+))?/);
    if (componentMatch) {
      const categoryFromPath = componentMatch[1] ?? null;
      const itemFromPath = componentMatch[2] ?? null;
      return {
        section: "components" as const,
        category: categoryFromPath as (typeof sidebarItems)[number]["category"] | null,
        item: itemFromPath,
        userSlug: null,
        organizationSlug: null,
      };
    }

    const userSettingsMatch = path.match(/^\/settings\/user(?:\/([^/]+))?/);
    if (userSettingsMatch) {
      return {
        section: "user-settings" as const,
        category: null,
        item: null,
        userSlug: userSettingsMatch[1] ?? null,
        organizationSlug: null,
      };
    }
    const organizationSettingsMatch = path.match(/^\/settings\/organization(?:\/([^/]+))?/);
    if (organizationSettingsMatch) {
      return {
        section: "organization-settings" as const,
        category: null,
        item: null,
        userSlug: null,
        organizationSlug: organizationSettingsMatch[1] ?? null,
      };
    }

    return {
      section: "components" as const,
      category: null,
      item: null,
      userSlug: null,
      organizationSlug: null,
    };
  };

  const firstAvailableTab = useMemo(
    () => sidebarItems.find((item) => item.available !== false)?.id ?? 'buttons',
    []
  );

  const parsedPath = useMemo(() => parsePath(pathname), [pathname]);
  const activeSection: RouteSection = parsedPath.section;
  const categoryItems = useMemo(
    () =>
      parsedPath.category
        ? sidebarItems.filter(
            (item) => item.category === parsedPath.category && item.available !== false
          )
        : [],
    [parsedPath.category]
  );
  const activeTab =
    (parsedPath.item &&
      sidebarItems.some((item) => item.id === parsedPath.item)
      ? parsedPath.item
      : null) ??
    (parsedPath.userSlug
      ? userSettingsItems.find((item) => item.slug === parsedPath.userSlug)?.id ?? null
      : null) ??
    (parsedPath.organizationSlug
      ? organizationSettingsItems.find((item) => item.slug === parsedPath.organizationSlug)?.id ?? null
      : null) ??
    (pathname === "/components" ? firstAvailableTab : null);

  const handleTabChange = (tabId: string) => {
    const item = sidebarItems.find((entry) => entry.id === tabId);
    if (item) {
      router.push(getItemHref(item));
      return;
    }
    const userSettingsItem = userSettingsItems.find((entry) => entry.id === tabId);
    if (userSettingsItem) {
      router.push(getUserSettingsHref(userSettingsItem));
      return;
    }
    const organizationSettingsItem = organizationSettingsItems.find((entry) => entry.id === tabId);
    if (organizationSettingsItem) {
      router.push(getOrganizationSettingsHref(organizationSettingsItem));
    }
  };
  const userMenuActions = [
    { id: 'profile', label: 'Profile', onSelect: () => undefined },
    { id: 'theme', label: 'Theme settings', onSelect: () => undefined },
    { id: 'logout', label: 'Log out', onSelect: () => undefined },
  ] as const;
  const [organizationData, setOrganizationData] = useState<OrganizationDemoData>({
    name: "FieldFlow Demo Org",
    email: "ops@fieldflow.dev",
    phoneNumber: "+1 (555) 0168",
    address: "490 Market Street, San Francisco",
    latitude: 37.78967,
    longitude: -122.39476,
    memberCount: 24,
    createdAt: "2026-05-01T10:30:00.000Z",
    canEditOrganization: true,
    canDeleteOrganization: true,
  });
  const [isEditOrgModalOpen, setIsEditOrgModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletingOrganization, setIsDeletingOrganization] = useState(false);
  const [isSavingOrganization, setIsSavingOrganization] = useState(false);

  const organizationSettingsConfig = useMemo(
    () => ({
      organization: organizationData,
      canEditOrganization: organizationData.canEditOrganization,
      canDeleteOrganization: organizationData.canDeleteOrganization,
      onEditOrganization: () => setIsEditOrgModalOpen(true),
      onDeleteOrganization: async () => {
        if (!organizationData.canDeleteOrganization) {
          return;
        }
        setIsDeleteDialogOpen(true);
      },
    }),
    [organizationData]
  );

  const breadcrumbs = useMemo((): ReactNode => {
    const componentsIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
        <rect x="3" y="3" width="8" height="8" rx="1.5" />
        <rect x="13" y="3" width="8" height="8" rx="1.5" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" />
        <rect x="13" y="13" width="8" height="8" rx="1.5" />
      </svg>
    );
    const userSettingsIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
        <circle cx="12" cy="8" r="3" />
        <path d="M5 20a7 7 0 0 1 14 0" />
      </svg>
    );

    if (activeSection === "user-settings") {
      const activeSetting = userSettingsItems.find((item) => item.id === activeTab);
      return (
        <AppBreadcrumbs
          leadingIcon={userSettingsIcon}
          linkComponent={(props) => (
            <Link href={props.href} className={props.className} onClick={props.onClick} aria-current={props["aria-current"]}>
              {props.children}
            </Link>
          )}
          items={[
            { id: "user-settings", label: "User Settings", href: defaultUserSettingsHref, isCurrent: !activeSetting },
            ...(activeSetting
              ? [
                  {
                    id: activeSetting.id,
                    label: activeSetting.label,
                    href: getUserSettingsHref(activeSetting),
                    isCurrent: true,
                  },
                ]
              : []),
          ]}
        />
      );
    }
    if (activeSection === "organization-settings") {
      const activeSetting = organizationSettingsItems.find((item) => item.id === activeTab);
      return (
        <AppBreadcrumbs
          leadingIcon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
              <path d="M4 7h16v12H4z" />
              <path d="M8 7V4h8v3" />
            </svg>
          }
          linkComponent={(props) => (
            <Link href={props.href} className={props.className} onClick={props.onClick} aria-current={props["aria-current"]}>
              {props.children}
            </Link>
          )}
          items={[
            { id: "organization-settings", label: "Organization Settings", href: defaultOrganizationSettingsHref, isCurrent: !activeSetting },
            ...(activeSetting
              ? [
                  {
                    id: activeSetting.id,
                    label: activeSetting.label,
                    href: getOrganizationSettingsHref(activeSetting),
                    isCurrent: true,
                  },
                ]
              : []),
          ]}
        />
      );
    }

    return (
      <AppBreadcrumbs
        leadingIcon={componentsIcon}
        linkComponent={(props) => (
          <Link href={props.href} className={props.className} onClick={props.onClick} aria-current={props["aria-current"]}>
            {props.children}
          </Link>
        )}
        items={[
          { id: "components", label: "Components", href: defaultComponentHref },
          ...(parsedPath.category
            ? [
                {
                  id: `category-${parsedPath.category}`,
                  label: parsedPath.category,
                  href: `/components/${parsedPath.category}`,
                  isCurrent: !activeTab,
                },
              ]
            : []),
          {
            id: activeTab ?? "overview",
            label: activeTab
              ? sidebarItems.find((item) => item.id === activeTab)?.label ?? activeTab
              : "Overview",
            href: getItemHref(
              sidebarItems.find((item) => item.id === activeTab) ?? sidebarItems[0]
            ),
            isCurrent: Boolean(activeTab),
          },
        ]}
      />
    );
  }, [
    activeSection,
    activeTab,
    defaultComponentHref,
    getItemHref,
    getOrganizationSettingsHref,
    getUserSettingsHref,
    parsedPath.category,
  ]);

  const settingsConfig = useMemo(
    () =>
      createFieldFlowSettingsConfigFromTools({
        currentPath: pathname,
        toolsConfig: createFieldFlowToolsConfig({
          userSettings: {
            enabled: true,
            href: defaultUserSettingsHref,
          },
          organizationSettings: {
            enabled: true,
            href: defaultOrganizationSettingsHref,
            options: organizationSettingsItems
              .filter((item) => item.available !== false)
              .filter(
                (item) =>
                  item.id !== "organization-danger-zone" ||
                  organizationSettingsConfig.canDeleteOrganization
              )
              .map((item) => ({
                id: item.id,
                title: item.label,
                href: getOrganizationSettingsHref(item),
              })),
          },
        }),
      }),
    [
      defaultOrganizationSettingsHref,
      defaultUserSettingsHref,
      getOrganizationSettingsHref,
      organizationSettingsConfig.canDeleteOrganization,
      pathname,
    ]
  );

  const renderToolsContent = () => {
    if (activeTab === "user-appearance") {
      return (
        <FieldFlowSettingsPageLayout
          title="Appearance"
          description="Customize interface appearance and accent color."
        >
          <ThemeControls />
        </FieldFlowSettingsPageLayout>
      );
    }
    if (activeTab === "user-theme-tokens") {
      return (
        <FieldFlowSettingsPageLayout
          title="Theme Tokens"
          description="Inspect semantic theme tokens used in the design system."
        >
          <ThemeTokensRenderer />
        </FieldFlowSettingsPageLayout>
      );
    }
    if (activeTab === "organization-info-settings") {
      return (
        <FieldFlowSettingsPageLayout
          title="Organization Info"
          description="Manage organization profile settings."
        >
          <div className="space-y-6">
            <OrganizationInfo
              organization={organizationSettingsConfig.organization}
              canEdit={organizationSettingsConfig.canEditOrganization}
              onEdit={organizationSettingsConfig.onEditOrganization}
            />
            {organizationSettingsConfig.canDeleteOrganization ? (
              <DeleteOrganization
                canDelete={organizationSettingsConfig.canDeleteOrganization}
                loading={isDeletingOrganization}
                onDelete={organizationSettingsConfig.onDeleteOrganization}
              />
            ) : null}
          </div>
        </FieldFlowSettingsPageLayout>
      );
    }
    if (
      activeTab === "organization-danger-zone" &&
      organizationSettingsConfig.canDeleteOrganization
    ) {
      return (
        <FieldFlowSettingsPageLayout
          title="Danger Zone"
          description="Manage destructive organization actions."
        >
          <DeleteOrganizationRenderer />
        </FieldFlowSettingsPageLayout>
      );
    }
    return (
      <FieldFlowSettingsPageLayout
        title="Appearance"
        description="Customize interface appearance and accent color."
      >
        <ThemeControlsRenderer />
      </FieldFlowSettingsPageLayout>
    );
  };

  return (
    <>
      <DynamicFavicon />
      <FieldFlowAppLayout
        appTitle="@fieldflow360/org-ui"
        logo={
          <span className="text-sm font-black leading-none" aria-hidden="true">
            FF
          </span>
        }
        collapseStorageKey="org-ui-dev-app-layout-collapsed"
        sidebarNav={({ isCollapsed, setCollapsed }) => (
          <Sidebar
            items={sidebarItems}
            userSettingsItems={userSettingsItems}
            organizationSettingsItems={organizationSettingsItems}
            activeTab={activeTab ?? ""}
            activeSection={activeSection}
            onTabChange={handleTabChange}
            getItemHref={getItemHref}
            getOrganizationSettingsHref={getOrganizationSettingsHref}
            userSettingsRootHref={defaultUserSettingsHref}
            shouldAutoSelectFallback={pathname === "/components" || pathname === "/settings/user" || pathname === "/settings/organization"}
            isCollapsed={isCollapsed}
            onRequestExpand={() => setCollapsed(false)}
          />
        )}
        user={{
          fullName: "Developer",
          subtitle: "UI Engineer",
          avatarFallback: "DV",
        }}
        userMenuActions={[...userMenuActions]}
        breadcrumbs={breadcrumbs}
        currentPath={pathname}
        toolsConfig={{
          enabled: true,
          userSettings: {
            enabled: true,
            showThemeControls: false,
            themeControlsPathPrefix: "/settings/user",
          },
          organizationSettings: {
            enabled: false,
          },
        }}
      >
        {activeSection === "components" ? (
          <div className="mx-auto flex h-full max-w-6xl flex-col px-6 py-6">
            <div className="shrink-0 pb-6">
              <AppHeader
                title="@fieldflow360/org-ui"
                mode={mode}
                activeTab={activeTab ?? ""}
                items={sidebarItems}
                onSelectItem={handleTabChange}
              />
            </div>
            <div className="min-h-0 flex-1 overflow-auto pb-6">
              <div className="space-y-8">
                {parsedPath.category && !activeTab ? (
                  <section className="bg-bg-surface border-border-subtle rounded-lg border p-5 shadow-sm">
                    <h2 className="text-text-primary text-xl font-semibold capitalize">
                      {parsedPath.category}
                    </h2>
                    <p className="text-text-muted mt-1 text-sm">
                      Select a component to preview.
                    </p>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {categoryItems.map((item) => (
                        <Link
                          key={item.id}
                          href={getItemHref(item)}
                          className="bg-bg-surface-elevated border-border-subtle hover:bg-bg-hover rounded-md border p-3 transition-colors"
                        >
                          <div className="text-text-primary font-medium">{item.label}</div>
                          <div className="text-text-muted text-sm">{item.description}</div>
                        </Link>
                      ))}
                    </div>
                  </section>
                ) : null}
                {activeTab === 'buttons' && <ButtonRenderer />}
                {activeTab === 'theme-controls' && <ThemeControlsRenderer />}
                {activeTab === 'theme-tokens' && <ThemeTokensRenderer />}
                {activeTab === 'input' && <InputRenderer />}
                {activeTab === 'controls' && <ControlsRenderer />}
                {activeTab === 'slider-color-picker' && <SliderColorPickerRenderer />}
                {activeTab === 'tabs-switcher' && <TabsSwitcherRenderer />}
                {activeTab === 'dropdown' && <DropdownRenderer />}
                {activeTab === 'search-input' && <SearchInputRenderer />}
                {activeTab === 'table' && <TableRenderer />}
                {activeTab === 'file-upload' && <FileUploadRenderer />}
                {activeTab === 'uploaded-file' && <UploadedFileRenderer />}
                {activeTab === 'loader' && <LoaderRenderer />}
                {activeTab === 'charts' && <ChartsRenderer />}
                {activeTab === 'map-components' && <MapComponentsRenderer />}
                {activeTab === 'not-found' && <NotFoundRenderer />}
                {activeTab === 'avatar' && <AvatarRenderer />}
                {activeTab === 'app-breadcrumbs' && <AppBreadcrumbsRenderer />}
                {activeTab === 'app-layout' && <AppLayoutRenderer />}
                {activeTab === 'app-form-modal' && <AppFormModalRenderer />}
                {activeTab === 'modal' && <ModalRenderer />}
                {activeTab === 'organization-switcher' && <OrganizationSwitcherRenderer />}
                {activeTab === 'organization-info' && (
                  <OrganizationInfo
                    organization={organizationSettingsConfig.organization}
                    canEdit
                    onEdit={organizationSettingsConfig.onEditOrganization}
                  />
                )}
                {activeTab === 'delete-organization' && <DeleteOrganizationRenderer />}
                {activeTab === 'sidebar-primitives' && <SidebarPrimitivesRenderer />}
                {activeTab === 'dialog' && <DialogRenderer />}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full min-h-0">
            <FieldFlowSettingsLayout config={settingsConfig}>
              {renderToolsContent()}
            </FieldFlowSettingsLayout>
          </div>
        )}
      </FieldFlowAppLayout>
      <CreateOrganizationModal
        isOpen={isEditOrgModalOpen}
        onClose={() => setIsEditOrgModalOpen(false)}
        title="Edit Organization"
        primaryLabel="Save Changes"
        isSubmitting={isSavingOrganization}
        disableWhenPristine
        initialValues={{
          name: organizationData.name,
          email: organizationData.email ?? "",
          phoneNumber: organizationData.phoneNumber ?? "",
          address: organizationData.address ?? "",
          latitude: organizationData.latitude ?? null,
          longitude: organizationData.longitude ?? null,
        }}
        onSubmit={async (values) => {
          setIsSavingOrganization(true);
          setOrganizationData((prev) => ({
            ...prev,
            name: values.name,
            email: values.email,
            phoneNumber: values.phoneNumber,
            address: values.address,
            latitude: values.latitude,
            longitude: values.longitude,
          }));
          setIsSavingOrganization(false);
          setIsEditOrgModalOpen(false);
        }}
      />
      {organizationSettingsConfig.canDeleteOrganization ? (
        <DeleteDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            if (isDeletingOrganization) return;
            setIsDeleteDialogOpen(false);
          }}
          title="Delete organization?"
          description="This action cannot be undone. All related organization data will be permanently removed."
          confirmLabel="Delete organization"
          cancelLabel="Cancel"
          isLoading={isDeletingOrganization}
          onConfirm={async () => {
            setIsDeletingOrganization(true);
            await new Promise((resolve) => setTimeout(resolve, 900));
            setIsDeletingOrganization(false);
            setIsDeleteDialogOpen(false);
          }}
        />
      ) : null}
    </>
  )
}