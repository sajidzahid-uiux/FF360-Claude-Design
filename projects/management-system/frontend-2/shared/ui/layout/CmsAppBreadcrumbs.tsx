"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useMemo } from "react";

import {
  type AppBreadcrumbItem,
  AppBreadcrumbs,
  type FieldFlowSidebarGroup,
} from "@fieldflow360/org-ui";

import { JobLeadEntityType, JobLeadTypeRouteSegment } from "@/constants";
import { APP_ROUTES, APP_ROUTE_LABELS, orgRoute } from "@/shared/config/routes";

import { useCmsBreadcrumbToolbarContent } from "./cms-breadcrumb-toolbar/breadcrumb-toolbar-store";
import { useCmsBreadcrumbOverrides } from "./cmsBreadcrumbOverrides";
import {
  type CmsBreadcrumbNavEntry,
  buildCmsNavBreadcrumbLookup,
  resolveCmsNavBreadcrumbEntry,
} from "./cmsNavigation";

const ROUTE_LABELS: Record<string, string> = {
  "book-keeping": APP_ROUTE_LABELS.bookKeeping,
  calendar: APP_ROUTE_LABELS.calendar,
  completed: APP_ROUTE_LABELS.completed,
  contact: APP_ROUTE_LABELS.contact,
  "crew-management": "Crew Management",
  dashboard: APP_ROUTE_LABELS.dashboard,
  [JobLeadTypeRouteSegment.DRAINAGE_TILING]: "Tile",
  equipment: "Equipment",
  [JobLeadTypeRouteSegment.EXCAVATION]: "Excavation",
  favorites: APP_ROUTE_LABELS.favorites,
  footage: APP_ROUTE_LABELS.footage,
  "industry-specialists": APP_ROUTE_LABELS.industrySpecialists,
  jobs: "Jobs",
  leads: "Leads",
  maintenance: "Maintenance",
  logs: "Logs",
  "on-site-tracking": "On-site tracking",
  map: "Map",
  messages: "Messages",
  notifications: "Notifications",
  "order-pipe": APP_ROUTE_LABELS.orderPipe,
  organization: APP_ROUTE_LABELS.organizationInfo,
  org: APP_ROUTE_LABELS.organizationSettings,
  "org-preferences": APP_ROUTE_LABELS.organizationPreferences,
  preferences: APP_ROUTE_LABELS.userPreferences,
  "quick-actions": APP_ROUTE_LABELS.quickActions,
  [JobLeadTypeRouteSegment.REPAIR]: "Repair",
  "role-access": APP_ROUTE_LABELS.roleAccess,
  security: APP_ROUTE_LABELS.security,
  settings: "Settings",
  "status-management": APP_ROUTE_LABELS.statusManagement,
  subscribe: APP_ROUTE_LABELS.subscribe,
  "system-settings": APP_ROUTE_LABELS.systemSettings,
  "task-management": APP_ROUTE_LABELS.taskManagement,
  team: APP_ROUTE_LABELS.team,
  themes: APP_ROUTE_LABELS.themes,
  trash: APP_ROUTE_LABELS.trash,
  "upcoming-features": APP_ROUTE_LABELS.upcomingFeatures,
  user: APP_ROUTE_LABELS.userSettings,
};

function formatSegment(
  segment: string,
  lookup: Map<string, CmsBreadcrumbNavEntry>
): string {
  return (
    lookup.get(segment)?.label ??
    ROUTE_LABELS[segment] ??
    segment
      .split("-")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

function isOpaqueId(segment: string) {
  return /^\d+$/.test(segment) || /^[0-9a-f-]{16,}$/i.test(segment);
}

const SETTINGS_PATH_REGEX =
  /^\/organizations\/(\d+)\/settings\/(org|user)(?:\/([^/]+))?/;

const SETTINGS_PAGE_LABELS: Record<string, string> = {
  organization: APP_ROUTE_LABELS.organizationInfo,
  "org-preferences": APP_ROUTE_LABELS.organizationPreferences,
  "role-access": APP_ROUTE_LABELS.roleAccess,
  team: APP_ROUTE_LABELS.team,
  billing: APP_ROUTE_LABELS.billing,
  trash: APP_ROUTE_LABELS.trash,
  settings: APP_ROUTE_LABELS.organizationSettings,
  preferences: APP_ROUTE_LABELS.userPreferences,
  security: APP_ROUTE_LABELS.security,
  notifications: APP_ROUTE_LABELS.notifications,
  themes: APP_ROUTE_LABELS.themes,
  delete: APP_ROUTE_LABELS.deleteAccount,
};

function getDetailFallbackLabel(parentPath: string): string {
  const parentSegment = parentPath.split("/").pop() ?? parentPath;

  if (parentSegment === "contact") return "Contact";
  if (parentSegment === "equipment") return "Equipment";
  if (
    parentSegment === JobLeadEntityType.JOBS ||
    parentPath.startsWith(`${JobLeadEntityType.JOBS}/`)
  ) {
    return "Job";
  }
  if (
    parentSegment === JobLeadEntityType.LEADS ||
    parentPath.startsWith(`${JobLeadEntityType.LEADS}/`)
  ) {
    return "Lead";
  }

  return "Details";
}

function resolvePathLabelOverride(
  cumulativePath: string,
  orgId: string,
  overrides: Record<string, string>
): string | undefined {
  const orgRelativeHref = orgRoute(orgId, `/${cumulativePath}`);

  return (
    overrides[orgRelativeHref] ??
    overrides[`/${cumulativePath}`] ??
    overrides[cumulativePath]
  );
}

function buildSettingsBreadcrumbs(
  pathname: string,
  lookup: Map<string, CmsBreadcrumbNavEntry>
): AppBreadcrumbItem[] | null {
  const match = pathname.match(SETTINGS_PATH_REGEX);
  if (!match) return null;

  const orgId = match[1];
  const section = match[2];
  const page = match[3];
  const sectionBase = orgRoute(orgId, `/settings/${section}`);
  const sectionLabel =
    section === "org"
      ? APP_ROUTE_LABELS.organizationSettings
      : APP_ROUTE_LABELS.userSettings;
  const sectionHref =
    section === "org"
      ? orgRoute(orgId, APP_ROUTES.organizationSettings)
      : sectionBase;

  const sectionEntry =
    section === "org"
      ? (resolveCmsNavBreadcrumbEntry("settings/org/organization", lookup) ??
        resolveCmsNavBreadcrumbEntry("organization-settings", lookup))
      : (resolveCmsNavBreadcrumbEntry("settings/user", lookup) ??
        resolveCmsNavBreadcrumbEntry("user-settings", lookup));

  if (!page) {
    if (section === "user") {
      return [
        {
          id: "user-root",
          label: sectionLabel,
          href: sectionBase,
        },
        {
          id: "user-profile",
          label: "Profile",
          isCurrent: true,
        },
      ];
    }

    return [
      {
        id: `${section}-root`,
        label: sectionLabel,
        isCurrent: true,
      },
    ];
  }

  const pagePath = `settings/${section}/${page}`;
  const pageEntry = resolveCmsNavBreadcrumbEntry(pagePath, lookup);

  return [
    {
      id: `${section}-root`,
      label: sectionEntry?.label ?? sectionLabel,
      href: sectionHref,
    },
    {
      id: `${section}-${page}`,
      label:
        pageEntry?.label ??
        SETTINGS_PAGE_LABELS[page] ??
        formatSegment(page, lookup),
      isCurrent: true,
    },
  ];
}

function resolveLeadingIcon(
  pathname: string | null,
  items: AppBreadcrumbItem[],
  lookup: Map<string, CmsBreadcrumbNavEntry>
): ReactNode | undefined {
  if (!pathname || items.length === 0) return undefined;

  const settingsMatch = pathname.match(SETTINGS_PATH_REGEX);
  if (settingsMatch) {
    const section = settingsMatch[2];
    const page = settingsMatch[3];
    const pagePath = page
      ? `settings/${section}/${page}`
      : section === "org"
        ? "settings/org/organization"
        : "settings/user";
    return (
      resolveCmsNavBreadcrumbEntry(pagePath, lookup)?.icon ??
      (section === "org"
        ? resolveCmsNavBreadcrumbEntry("organization-settings", lookup)?.icon
        : resolveCmsNavBreadcrumbEntry("user-settings", lookup)?.icon)
    );
  }

  const segments = pathname.split("/").filter(Boolean);
  const orgIndex = segments[0] === "organizations" ? 1 : -1;
  const orgId = orgIndex >= 0 ? segments[orgIndex] : null;
  const routeSegments = orgId ? segments.slice(orgIndex + 1) : segments;
  const visibleSegments = routeSegments.filter(
    (segment) => !isOpaqueId(segment)
  );
  const relativePath = visibleSegments.join("/");

  return resolveCmsNavBreadcrumbEntry(relativePath, lookup)?.icon;
}

export function buildCmsAppBreadcrumbItems(
  pathname: string | null,
  lookup: Map<string, CmsBreadcrumbNavEntry>,
  labelOverrides: Record<string, string> = {}
): AppBreadcrumbItem[] {
  if (!pathname) return [];

  const settingsCrumbs = buildSettingsBreadcrumbs(pathname, lookup);
  if (settingsCrumbs) {
    return settingsCrumbs;
  }

  const segments = pathname.split("/").filter(Boolean);
  const orgIndex = segments[0] === "organizations" ? 1 : -1;
  const orgId = orgIndex >= 0 ? segments[orgIndex] : null;
  const routeSegments = orgId ? segments.slice(orgIndex + 1) : segments;

  if (!orgId || routeSegments.length === 0) {
    return [];
  }

  const items: AppBreadcrumbItem[] = [];
  let visibleCumulative = "";

  routeSegments.forEach((segment, index) => {
    const cumulativePath = routeSegments.slice(0, index + 1).join("/");
    const isLastSegment = index === routeSegments.length - 1;
    const href = isLastSegment
      ? undefined
      : orgRoute(orgId, `/${cumulativePath}`);
    const overrideLabel = resolvePathLabelOverride(
      cumulativePath,
      orgId,
      labelOverrides
    );

    if (isOpaqueId(segment)) {
      const parentPath = routeSegments.slice(0, index).join("/");
      const typeOverrideKey = orgRoute(
        orgId,
        `/${parentPath}/${segment}/@type`
      );
      const typeLabel = labelOverrides[typeOverrideKey];

      if (parentPath === "equipment" && typeLabel) {
        items.push({
          id: `${cumulativePath}-type`,
          label: typeLabel,
          href: orgRoute(orgId, "/equipment"),
          isCurrent: false,
        });
      }

      items.push({
        id: cumulativePath,
        label: overrideLabel ?? getDetailFallbackLabel(parentPath || segment),
        href,
        isCurrent: isLastSegment,
      });
      return;
    }

    visibleCumulative = visibleCumulative
      ? `${visibleCumulative}/${segment}`
      : segment;

    const entry = resolveCmsNavBreadcrumbEntry(visibleCumulative, lookup);
    const label =
      overrideLabel ?? entry?.label ?? formatSegment(segment, lookup);

    items.push({
      id: visibleCumulative,
      label,
      href,
      isCurrent: isLastSegment,
    });
  });

  return items;
}

interface CmsAppBreadcrumbsProps {
  navigation: FieldFlowSidebarGroup[];
}

export function CmsAppBreadcrumbs({ navigation }: CmsAppBreadcrumbsProps) {
  const pathname = usePathname();
  const toolbarContent = useCmsBreadcrumbToolbarContent();
  const labelOverrides = useCmsBreadcrumbOverrides();
  const lookup = useMemo(
    () => buildCmsNavBreadcrumbLookup(navigation),
    [navigation]
  );
  const items = useMemo(
    () => buildCmsAppBreadcrumbItems(pathname, lookup, labelOverrides),
    [pathname, lookup, labelOverrides]
  );
  const leadingIcon = useMemo(
    () => resolveLeadingIcon(pathname, items, lookup),
    [pathname, items, lookup]
  );

  if (items.length === 0) return null;

  return (
    <AppBreadcrumbs
      items={items}
      leadingIcon={leadingIcon}
      linkComponent={(props) => (
        <Link
          aria-current={props["aria-current"]}
          className={props.className}
          href={props.href}
          onClick={props.onClick}
        >
          {props.children}
        </Link>
      )}
      toolbar={toolbarContent ?? undefined}
    />
  );
}
