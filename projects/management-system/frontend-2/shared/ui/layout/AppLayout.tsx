"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ReactNode,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";

import {
  FieldFlowAppLayout,
  type FieldFlowUserMenuAction,
} from "@fieldflow360/org-ui";
import { useMediaQuery } from "@mantine/hooks";
import { Building2, CirclePlus, HardHat, LogOut } from "lucide-react";

import type { OrganizationListRow } from "@/api/types";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  PERMISSION_RESOURCES,
  usePermissionsFromStorage,
} from "@/hooks/permissions";
import {
  useIsAdmin,
  useUserPermissions,
  useWebActivityHeartbeat,
} from "@/hooks/queries";
import { StorageKey, useDataFromStorageByKey } from "@/hooks/storage-data";
import { useBilling } from "@/hooks/useBilling";
import { useOrganizationById } from "@/hooks/useOrganizationData";
import { useRouteIds } from "@/hooks/useRouteIds";
import { APP_ROUTES, orgRoute } from "@/shared/config/routes";
import { getInitials } from "@/shared/lib";
import {
  useSidebarActions,
  useSidebarCollapsed,
} from "@/shared/model/sidebar-store";
import LazyChatBot from "@/shared/ui/layout/LazyChatBot";

import { CmsAppBreadcrumbs } from "./CmsAppBreadcrumbs";
import { CmsAppTopBar, CmsAppTopBarMobileShellActions } from "./CmsAppTopBar";
import { FreeTrialSpan } from "./FreeTrialSpan";
import { RouteContentLoading } from "./RouteContentLoading";
import {
  CmsAppLayoutSidebarNavProvider,
  renderCmsAppLayoutSidebarNav,
} from "./cmsAppLayoutSidebarNav";
import { CmsBreadcrumbOverrideProvider } from "./cmsBreadcrumbOverrides";
import {
  buildCmsSidebarNavigation,
  deriveCmsNavigationPermissions,
} from "./cmsNavigation";

const SIDEBAR_COLLAPSE_STORAGE_KEY = "cms-sidebar-collapsed";

function AppLogo() {
  return (
    <HardHat
      aria-hidden
      className="h-[18px] w-[18px] shrink-0"
      strokeWidth={2.25}
    />
  );
}

export default function AppLayout({
  children,
  onOpenOrganizationSwitcher,
}: {
  children: ReactNode;
  onOpenOrganizationSwitcher?: () => void;
}) {
  const isMobile = useMediaQuery("(max-width: 820px)");
  const isAdmin = useIsAdmin();

  const sidebarCollapsed = useSidebarCollapsed();
  const { setCollapsed, registerToggle } = useSidebarActions();
  const collapseControllerRef = useRef<((collapsed: boolean) => void) | null>(
    null
  );
  const pathname = usePathname();
  const isMessagesPage = pathname?.includes("/messages") ?? false;
  const isMapPage = pathname?.includes("/map") ?? false;

  const { orgId } = useRouteIds();
  const { currentUser, logout } = useAuth();

  useWebActivityHeartbeat();

  const { data: org } = useOrganizationById(orgId);
  const { noActiveSubscription } = useBilling();

  const isOrgOwner = useDataFromStorageByKey(StorageKey.IS_OWNER) === true;
  const isEnterprisePlan = org?.current_plan?.startsWith("enterprise");

  useEffect(() => {
    if (
      orgId &&
      isOrgOwner &&
      noActiveSubscription &&
      !isEnterprisePlan &&
      pathname &&
      !pathname.includes("/subscribe")
    ) {
      window.location.href = orgRoute(orgId, APP_ROUTES.subscribe);
    }
  }, [orgId, isOrgOwner, noActiveSubscription, isEnterprisePlan, pathname]);

  const permissionsQuery = useUserPermissions();
  const storagePerms = usePermissionsFromStorage().permissionCodes;
  const teamOrgPermissionActions = usePermissionsFromStorage(
    PERMISSION_RESOURCES.TEAM_ORGANIZATION_INFO
  ).permissionCodes;

  const permissionResources = useMemo(() => {
    if (permissionsQuery.data?.permission_codes) {
      return permissionsQuery.data.permission_codes
        .map((code) => (code.endsWith("_read") ? code.slice(0, -5) : null))
        .filter((code): code is string => code !== null);
    }

    return storagePerms;
  }, [permissionsQuery.data?.permission_codes, storagePerms]);

  const cachedRole = useDataFromStorageByKey(StorageKey.USER_ROLE) as {
    name?: string | null;
    is_admin?: boolean;
  } | null;
  const navigationRole = useMemo(() => {
    if (permissionsQuery.data?.role) {
      return {
        name: permissionsQuery.data.role.name,
        is_admin: permissionsQuery.data.role.is_admin,
      };
    }
    if (cachedRole) {
      return {
        name: cachedRole.name ?? null,
        is_admin: cachedRole.is_admin,
      };
    }
    if (currentUser?.roleDetails) {
      return {
        name: currentUser.roleDetails.name,
        is_admin: currentUser.roleDetails.is_admin,
      };
    }
    return null;
  }, [permissionsQuery.data?.role, cachedRole, currentUser?.roleDetails]);

  const navigationPermissions = useMemo(
    () => ({
      ...deriveCmsNavigationPermissions(permissionResources, navigationRole),
      isAdmin,
    }),
    [permissionResources, navigationRole, isAdmin]
  );

  const sidebarNavigation = useMemo(
    () => buildCmsSidebarNavigation(navigationPermissions),
    [navigationPermissions]
  );

  const handleCollapsedChange = useCallback(
    (collapsed: boolean) => {
      setCollapsed(collapsed);
    },
    [setCollapsed]
  );

  const setCollapseController = useCallback(
    (controller: (collapsed: boolean) => void) => {
      collapseControllerRef.current = controller;
      registerToggle(controller);
    },
    [registerToggle]
  );

  const userMenuActions = useMemo<FieldFlowUserMenuAction[]>(
    () => [
      {
        id: "switch-organization",
        label: "Switch Organization",
        icon: <Building2 className="h-4 w-4" />,
        onSelect: () => onOpenOrganizationSwitcher?.(),
      },
      {
        id: "logout",
        label: "Logout",
        icon: <LogOut className="h-4 w-4" />,
        tone: "danger",
        onSelect: logout,
      },
    ],
    [logout, onOpenOrganizationSwitcher]
  );

  const displayName =
    currentUser?.name || currentUser?.email || currentUser?.id || "User";
  const organization = org as OrganizationListRow | undefined;
  const shouldShowDesktopTopBar = !isMobile;
  const mobileShellBarEnd = isMobile ? (
    <CmsAppTopBarMobileShellActions />
  ) : undefined;
  const canInviteTeamMember =
    permissionsQuery.data?.permission_codes?.includes(
      `${PERMISSION_RESOURCES.TEAM_ORGANIZATION_INFO}_write`
    ) ?? teamOrgPermissionActions.includes("write");

  const sidebarNavContextValue = useMemo(
    () => ({
      organizationId: orgId,
      navigation: sidebarNavigation,
      onCollapsedChange: handleCollapsedChange,
      setCollapseController,
    }),
    [orgId, sidebarNavigation, handleCollapsedChange, setCollapseController]
  );

  const layoutUser = useMemo(
    () => ({
      fullName: displayName,
      subtitle: organization?.name ?? "No organization",
      avatarSrc: currentUser?.picture,
      avatarFallback: getInitials(displayName, currentUser?.email),
    }),
    [currentUser?.email, currentUser?.picture, displayName, organization?.name]
  );

  const breadcrumbs = useMemo(
    () => <CmsAppBreadcrumbs navigation={sidebarNavigation} />,
    [sidebarNavigation]
  );

  const sidebarHeaderContent =
    canInviteTeamMember && orgId ? (
      <div className={sidebarCollapsed ? "-mt-3 flex justify-center" : "-mt-3"}>
        <Link
          aria-label="Invite"
          className={`night:bg-accent night:text-black night:hover:brightness-[1.03] inline-flex h-10 items-center justify-center rounded-md bg-black text-base font-medium text-white transition-colors hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-zinc-100 ${
            sidebarCollapsed ? "w-10 px-0" : "w-full gap-2 px-4"
          }`}
          href={`${orgRoute(orgId, APP_ROUTES.team)}?invite=true`}
          prefetch={false}
        >
          {!sidebarCollapsed ? <span>Invite</span> : null}
          <CirclePlus className="h-5 w-5" />
        </Link>
      </div>
    ) : null;

  return (
    <>
      <FreeTrialSpan />
      <CmsBreadcrumbOverrideProvider>
        <CmsAppLayoutSidebarNavProvider value={sidebarNavContextValue}>
          <FieldFlowAppLayout
            appTitle="CMS"
            breadcrumbs={breadcrumbs}
            collapseStorageKey={SIDEBAR_COLLAPSE_STORAGE_KEY}
            currentPath={pathname ?? undefined}
            defaultCollapsed={false}
            hideMobileShellTopBar={false}
            logo={<AppLogo />}
            mainTopBar={shouldShowDesktopTopBar ? <CmsAppTopBar /> : undefined}
            mobileShellBarEnd={mobileShellBarEnd}
            sidebarHeaderContent={sidebarHeaderContent}
            sidebarNav={renderCmsAppLayoutSidebarNav}
            user={layoutUser}
            userMenuActions={userMenuActions}
          >
            <div className="h-full min-h-0 overflow-auto">
              <Suspense fallback={<RouteContentLoading />}>{children}</Suspense>
            </div>
          </FieldFlowAppLayout>
        </CmsAppLayoutSidebarNavProvider>
      </CmsBreadcrumbOverrideProvider>
      {!isMessagesPage && !isMapPage && <LazyChatBot />}
    </>
  );
}
