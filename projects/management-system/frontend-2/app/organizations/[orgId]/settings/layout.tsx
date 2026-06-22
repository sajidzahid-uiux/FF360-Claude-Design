"use client";

import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useCallback, useMemo } from "react";

import { useAuth0 } from "@auth0/auth0-react";
import type { FieldFlowSettingsConfig } from "@fieldflow360/org-ui";
import {
  FieldFlowSettingsLayout,
  FieldFlowSettingsPageLayout,
} from "@fieldflow360/org-ui";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useRouteIds } from "@/hooks";
import {
  PERMISSION_RESOURCES,
  usePermissionsFromStorage,
} from "@/hooks/permissions";
import { useIsAdmin } from "@/hooks/queries";
import {
  APP_ROUTES,
  APP_ROUTE_LABELS,
  SETTINGS_PAGE_METADATA,
  orgRoute,
} from "@/shared/config/routes";
import { escapeRegExp } from "@/shared/lib/escapeRegExp";

type SettingsPageConfig = {
  key: string;
  match: RegExp;
  title: string;
  description: string;
};

const settingsPageConfigs: SettingsPageConfig[] = Object.entries(
  SETTINGS_PAGE_METADATA
).map(([key, metadata]) => {
  const isExact = "exact" in metadata && metadata.exact === true;

  return {
    key,
    match: new RegExp(
      `${escapeRegExp(metadata.route)}${isExact ? "/?$" : "(?:/|$)"}`
    ),
    title: metadata.title,
    description: metadata.description,
  };
});

function isSettingsNavLinkActive(
  pathname: string | null,
  href: string,
  exactOnly: boolean
) {
  if (!pathname) return false;
  if (pathname === href) return true;
  if (exactOnly) return false;
  return pathname.startsWith(`${href}/`);
}

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { orgId } = useRouteIds();
  const { user, isLoading: isAuth0Loading } = useAuth0();
  const { currentUser } = useAuth();
  const isAdmin = useIsAdmin();
  const { permissionCodes } = usePermissionsFromStorage();

  const isUserSettingsRoute = pathname?.includes("/settings/user") ?? false;
  const isOrganizationSettingsRoute =
    pathname?.includes("/settings/org") ?? false;

  const createOnSelect = useCallback(
    (href: string) => () => {
      if (pathname === href) return;
      router.push(href);
    },
    [pathname, router]
  );

  const config = useMemo<FieldFlowSettingsConfig>(() => {
    if (!orgId) {
      return {};
    }

    const organizationInfoHref = orgRoute(
      orgId,
      APP_ROUTES.organizationSettings
    );
    const organizationPreferencesHref = orgRoute(
      orgId,
      APP_ROUTES.organizationPreferences
    );
    const ff360DesignParametersHref = orgRoute(
      orgId,
      APP_ROUTES.ff360DesignParameters
    );
    const roleAccessHref = orgRoute(orgId, APP_ROUTES.roleAccess);
    const teamHref = orgRoute(orgId, APP_ROUTES.team);
    const billingHref = orgRoute(orgId, APP_ROUTES.billing);
    const trashHref = orgRoute(orgId, APP_ROUTES.trash);
    const profileHref = orgRoute(orgId, APP_ROUTES.userSettings);
    const userPreferencesHref = orgRoute(orgId, APP_ROUTES.userPreferences);
    const userSecurityHref = orgRoute(orgId, APP_ROUTES.userSecurity);
    const userNotificationsHref = orgRoute(orgId, APP_ROUTES.userNotifications);
    const userThemesHref = orgRoute(orgId, APP_ROUTES.userThemes);
    const userDeleteHref = orgRoute(orgId, APP_ROUTES.userDelete);

    const orgLinks = [
      {
        id: "organization-info",
        title: APP_ROUTE_LABELS.organizationInfo,
        href: organizationInfoHref,
        isActive: isSettingsNavLinkActive(
          pathname,
          organizationInfoHref,
          false
        ),
        onSelect: createOnSelect(organizationInfoHref),
      },
      ...(isAdmin
        ? [
            {
              id: "organization-preferences",
              title: APP_ROUTE_LABELS.organizationPreferences,
              href: organizationPreferencesHref,
              isActive: isSettingsNavLinkActive(
                pathname,
                organizationPreferencesHref,
                false
              ),
              onSelect: createOnSelect(organizationPreferencesHref),
            },
            {
              id: "ff360-design-parameters",
              title: APP_ROUTE_LABELS.ff360DesignParameters,
              href: ff360DesignParametersHref,
              isActive: isSettingsNavLinkActive(
                pathname,
                ff360DesignParametersHref,
                false
              ),
              onSelect: createOnSelect(ff360DesignParametersHref),
            },
          ]
        : []),
      {
        id: "role-access",
        title: APP_ROUTE_LABELS.roleAccess,
        href: roleAccessHref,
        isActive: isSettingsNavLinkActive(pathname, roleAccessHref, false),
        onSelect: createOnSelect(roleAccessHref),
      },
      {
        id: "team",
        title: APP_ROUTE_LABELS.team,
        href: teamHref,
        isActive: isSettingsNavLinkActive(pathname, teamHref, false),
        onSelect: createOnSelect(teamHref),
      },
      ...(currentUser?.roleDetails?.is_owner
        ? [
            {
              id: "billing",
              title: APP_ROUTE_LABELS.billing,
              href: billingHref,
              isActive: isSettingsNavLinkActive(pathname, billingHref, false),
              onSelect: createOnSelect(billingHref),
            },
          ]
        : []),
      ...(permissionCodes.includes(PERMISSION_RESOURCES.TRASH_PAGE)
        ? [
            {
              id: "trash",
              title: APP_ROUTE_LABELS.trash,
              href: trashHref,
              isActive: isSettingsNavLinkActive(pathname, trashHref, false),
              onSelect: createOnSelect(trashHref),
            },
          ]
        : []),
    ];

    const userLinks = [
      {
        id: "profile",
        title: APP_ROUTE_LABELS.profile,
        href: profileHref,
        isActive: isSettingsNavLinkActive(pathname, profileHref, true),
        onSelect: createOnSelect(profileHref),
      },
      {
        id: "preferences",
        title: APP_ROUTE_LABELS.userPreferences,
        href: userPreferencesHref,
        isActive: isSettingsNavLinkActive(pathname, userPreferencesHref, false),
        onSelect: createOnSelect(userPreferencesHref),
      },
      {
        id: "security",
        title: APP_ROUTE_LABELS.security,
        href: userSecurityHref,
        isActive: isSettingsNavLinkActive(pathname, userSecurityHref, false),
        onSelect: createOnSelect(userSecurityHref),
      },
      {
        id: "notifications",
        title: APP_ROUTE_LABELS.notifications,
        href: userNotificationsHref,
        isActive: isSettingsNavLinkActive(
          pathname,
          userNotificationsHref,
          false
        ),
        onSelect: createOnSelect(userNotificationsHref),
      },
      {
        id: "themes",
        title: APP_ROUTE_LABELS.themes,
        href: userThemesHref,
        isActive: isSettingsNavLinkActive(pathname, userThemesHref, false),
        onSelect: createOnSelect(userThemesHref),
      },
      {
        id: "delete-account",
        title: APP_ROUTE_LABELS.deleteAccount,
        href: userDeleteHref,
        isActive: isSettingsNavLinkActive(pathname, userDeleteHref, false),
        onSelect: createOnSelect(userDeleteHref),
      },
    ];

    return {
      organization: isUserSettingsRoute
        ? undefined
        : {
            id: "organization-settings",
            title: "",
            links: orgLinks,
          },
      user: isOrganizationSettingsRoute
        ? undefined
        : {
            id: "user-settings",
            title: "",
            links: userLinks,
          },
    };
  }, [
    createOnSelect,
    currentUser?.roleDetails?.is_owner,
    isAdmin,
    isOrganizationSettingsRoute,
    isUserSettingsRoute,
    orgId,
    pathname,
    permissionCodes,
  ]);

  const activePageConfig = settingsPageConfigs.find((configItem) =>
    configItem.match.test(pathname ?? "")
  );

  if (isAuth0Loading) return null;
  if (user && user.email_verified === false) return null;

  return (
    <FieldFlowSettingsLayout config={config} mobileNavBackLabel="Settings">
      {activePageConfig ? (
        <FieldFlowSettingsPageLayout
          description={activePageConfig.description}
          title={activePageConfig.title}
        >
          {children}
        </FieldFlowSettingsPageLayout>
      ) : (
        children
      )}
    </FieldFlowSettingsLayout>
  );
}
