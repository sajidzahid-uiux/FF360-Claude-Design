"use client";

import { type ComponentType, type ReactNode, createElement } from "react";

import type {
  FieldFlowSidebarGroup,
  FieldFlowSidebarLink,
} from "@fieldflow360/org-ui";
import {
  BookOpen,
  Building2,
  Calendar,
  ClipboardList,
  File,
  FileText,
  Film,
  Hammer,
  HardDrive,
  Heart,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  ListChecks,
  Mail,
  Package,
  RefreshCw,
  Settings,
  Sparkles,
  UserRound,
  Users,
  Wrench,
  Zap,
} from "lucide-react";

import { JobType } from "@/constants/enums";
import { JOB_TYPES } from "@/constants/jobTypes";
import { PERMISSION_RESOURCES } from "@/hooks/permissions";
import { APP_ROUTES, APP_ROUTE_LABELS } from "@/shared/config/routes";
import { isMajorRoleName } from "@/shared/lib";

const SIDEBAR_ICON_CLASS = "h-5 w-5 shrink-0";

export interface CmsNavigationPermissions {
  isAdmin: boolean;
  isBookkeeper: boolean;
  hasMajorRoleAccess: boolean;
  hasContactsAccess: boolean;
  hasSettingsAccess: boolean;
  hasEquipmentAccess: boolean;
  hasLeadVisibility: boolean;
  hasRepairJobAccess: boolean;
  hasExcavationJobAccess: boolean;
  hasTilingJobAccess: boolean;
  hasCrewManagementAccess: boolean;
  hasCompletedCanceledAccess: boolean;
  hasTodoAccess: boolean;
  hasOrderPipesAccess: boolean;
}

function icon(Icon: ComponentType<{ className?: string }>) {
  return createElement(Icon, { className: SIDEBAR_ICON_CLASS });
}

export type CmsSidebarLink = FieldFlowSidebarLink & {
  badgeCount?: number;
};

function link(
  id: string,
  title: string,
  href: string,
  Icon: ComponentType<{ className?: string }>,
  children?: CmsSidebarLink[],
  badgeCount?: number
): CmsSidebarLink {
  return {
    id,
    title,
    href,
    icon: icon(Icon),
    children,
    ...(badgeCount != null && badgeCount > 0 ? { badgeCount } : {}),
  };
}

export type CmsNavigationRoleInput =
  | string
  | { name?: string | null; is_admin?: boolean }
  | null
  | undefined;

function resolveNavigationRole(role: CmsNavigationRoleInput) {
  if (typeof role === "string") {
    return { name: role, is_admin: role === "Admin" };
  }
  return role ?? null;
}

function hasMajorRole(roleName: string | null): boolean {
  return isMajorRoleName(roleName);
}

export function deriveCmsNavigationPermissions(
  permissionResources: string[],
  role?: CmsNavigationRoleInput
): CmsNavigationPermissions {
  const has = (resource: string) => permissionResources.includes(resource);
  const resolvedRole = resolveNavigationRole(role);
  const roleName = resolvedRole?.name ?? null;
  const isAdmin = resolvedRole?.is_admin === true || roleName === "Admin";

  return {
    isAdmin,
    isBookkeeper: roleName === "Bookkeeper",
    hasMajorRoleAccess: hasMajorRole(roleName),
    hasContactsAccess: has(PERMISSION_RESOURCES.CONTACT_ACCESS),
    hasSettingsAccess: has(PERMISSION_RESOURCES.SETTINGS_PAGE),
    hasEquipmentAccess: has(PERMISSION_RESOURCES.EQUIPMENT_PAGE),
    hasLeadVisibility: has(PERMISSION_RESOURCES.LEADS_PAGE),
    hasRepairJobAccess: has(PERMISSION_RESOURCES.JOBS_REPAIR_PAGE),
    hasExcavationJobAccess: has(PERMISSION_RESOURCES.JOBS_EXCAVATION_PAGE),
    hasTilingJobAccess: has(PERMISSION_RESOURCES.JOBS_TILING_PAGE),
    hasCrewManagementAccess: has(PERMISSION_RESOURCES.CREW_MANAGEMENT_PAGE),
    hasCompletedCanceledAccess: has(
      PERMISSION_RESOURCES.COMPLETED_CANCELED_PAGE
    ),
    hasTodoAccess: has(PERMISSION_RESOURCES.TODO_LIST),
    hasOrderPipesAccess: has(PERMISSION_RESOURCES.ORDER_PIPES_LIST),
  };
}

export function buildCmsSidebarNavigation({
  isAdmin,
  isBookkeeper,
  hasMajorRoleAccess,
  hasContactsAccess,
  hasSettingsAccess,
  hasEquipmentAccess,
  hasLeadVisibility,
  hasRepairJobAccess,
  hasExcavationJobAccess,
  hasTilingJobAccess,
  hasCrewManagementAccess,
  hasCompletedCanceledAccess,
  hasTodoAccess,
  hasOrderPipesAccess,
}: CmsNavigationPermissions): FieldFlowSidebarGroup[] {
  const hasAnyJobAccess =
    hasRepairJobAccess || hasExcavationJobAccess || hasTilingJobAccess;

  const groups: FieldFlowSidebarGroup[] = [];

  if (isAdmin) {
    groups.push({
      id: "quick-actions",
      title: APP_ROUTE_LABELS.quickActions,
      links: [
        link(
          "quick-actions",
          APP_ROUTE_LABELS.quickActions,
          APP_ROUTES.quickActions,
          Zap
        ),
      ],
    });
  }

  if (hasTodoAccess) {
    groups.push({
      id: "todo",
      title: APP_ROUTE_LABELS.taskManagement,
      links: [
        link(
          "task-management",
          APP_ROUTE_LABELS.taskManagement,
          APP_ROUTES.taskManagement,
          ClipboardList
        ),
      ],
    });
  }

  const analysisLinks: CmsSidebarLink[] = [
    link(
      "dashboard",
      APP_ROUTE_LABELS.dashboard,
      APP_ROUTES.dashboard,
      LayoutDashboard
    ),
  ];

  if (hasLeadVisibility || hasAnyJobAccess) {
    analysisLinks.push(
      link("calendar", APP_ROUTE_LABELS.calendar, APP_ROUTES.calendar, Calendar)
    );
  }

  if (hasTilingJobAccess) {
    analysisLinks.push(
      link("footage", APP_ROUTE_LABELS.footage, APP_ROUTES.footage, Film)
    );
  }

  groups.push({
    id: "analysis",
    title: "Analysis",
    links: analysisLinks,
  });

  const workLinks: CmsSidebarLink[] = [];
  if (hasLeadVisibility) {
    workLinks.push(
      link("leads", APP_ROUTE_LABELS.leads, APP_ROUTES.leads, Users, [
        link("leads-repair", "Repair", APP_ROUTES.leadsRepair, Hammer),
        link(
          "leads-excavation",
          "Excavation",
          APP_ROUTES.leadsExcavation,
          Layers
        ),
        link("leads-tiling", "Tile", APP_ROUTES.leadsTiling, LayoutGrid),
      ])
    );
  }

  if (hasAnyJobAccess) {
    const jobChildren: CmsSidebarLink[] = [];
    if (hasRepairJobAccess) {
      jobChildren.push(
        link("jobs-repair", "Repair", JOB_TYPES[JobType.REPAIR].path, Hammer)
      );
    }
    if (hasExcavationJobAccess) {
      jobChildren.push(
        link(
          "jobs-excavation",
          "Excavation",
          JOB_TYPES[JobType.EXCAVATION].path,
          Layers
        )
      );
    }
    if (hasTilingJobAccess) {
      jobChildren.push(
        link("jobs-tiling", "Tile", JOB_TYPES[JobType.TILING].path, LayoutGrid)
      );
    }

    workLinks.push(
      link(
        "jobs",
        APP_ROUTE_LABELS.jobs,
        jobChildren[0]?.href ?? APP_ROUTES.jobs,
        Wrench,
        jobChildren
      )
    );
  }

  if (isAdmin) {
    workLinks.push(
      link(
        "pending-approval",
        APP_ROUTE_LABELS.pendingApproval,
        APP_ROUTES.pendingApproval,
        ClipboardList
      )
    );
  }

  if (hasCompletedCanceledAccess) {
    workLinks.push(
      link(
        "completed",
        APP_ROUTE_LABELS.completed,
        APP_ROUTES.completed,
        FileText
      )
    );
  }

  if (workLinks.length > 0) {
    groups.push({
      id: "work",
      title: "Work and Opportunities",
      links: workLinks,
    });
  }

  const actionLinks: CmsSidebarLink[] = [];
  if (hasOrderPipesAccess) {
    actionLinks.push(
      link(
        "order-pipe",
        APP_ROUTE_LABELS.orderPipe,
        APP_ROUTES.orderPipe,
        Package
      )
    );
  }
  if (isAdmin || isBookkeeper) {
    actionLinks.push(
      link(
        "book-keeping",
        APP_ROUTE_LABELS.bookKeeping,
        APP_ROUTES.bookKeeping,
        BookOpen
      )
    );
  }

  if (actionLinks.length > 0) {
    groups.push({
      id: "action",
      title: "Action",
      links: actionLinks,
    });
  }

  if (hasContactsAccess) {
    groups.push({
      id: "contacts",
      title: "Contacts",
      links: [
        link("contact", APP_ROUTE_LABELS.contact, APP_ROUTES.contact, Mail),
      ],
    });
  }

  const settingsLinks: CmsSidebarLink[] = [];
  if (hasSettingsAccess) {
    settingsLinks.push(
      link(
        "status-management",
        APP_ROUTE_LABELS.statusManagement,
        APP_ROUTES.statusManagement,
        ListChecks
      ),
      link(
        "system-settings",
        APP_ROUTE_LABELS.systemSettings,
        APP_ROUTES.systemSettings,
        Settings
      ),
      link("favorites", APP_ROUTE_LABELS.favorites, APP_ROUTES.favorites, Heart)
    );
  }
  if (hasCrewManagementAccess) {
    settingsLinks.push(
      link(
        "crew-management",
        APP_ROUTE_LABELS.crewManagement,
        APP_ROUTES.crewManagement,
        Users
      )
    );
  }

  if (settingsLinks.length > 0) {
    groups.push({
      id: "settings",
      title: "Settings",
      links: settingsLinks,
    });
  }

  const upkeepLinks: CmsSidebarLink[] = [];
  if (hasMajorRoleAccess) {
    if (hasEquipmentAccess) {
      upkeepLinks.push(
        link(
          "equipment",
          APP_ROUTE_LABELS.equipment,
          APP_ROUTES.equipment,
          HardDrive
        )
      );
    }
    upkeepLinks.push(
      link(
        "maintenance",
        APP_ROUTE_LABELS.maintenance,
        APP_ROUTES.maintenance,
        RefreshCw
      )
    );
  }

  if (upkeepLinks.length > 0) {
    groups.push({
      id: "upkeep",
      title: "Up Keep",
      links: upkeepLinks,
    });
  }

  groups.push({
    id: "coming-soon",
    title: "Coming Soon",
    links: [
      link(
        "upcoming-features",
        APP_ROUTE_LABELS.upcomingFeatures,
        APP_ROUTES.upcomingFeatures,
        Sparkles
      ),
    ],
  });

  if (hasMajorRoleAccess) {
    groups.push({
      id: "industry-specialists",
      title: APP_ROUTE_LABELS.industrySpecialists,
      links: [
        link(
          "industry-specialists",
          APP_ROUTE_LABELS.industrySpecialists,
          APP_ROUTES.industrySpecialists,
          File
        ),
      ],
    });
  }

  const toolsLinks: CmsSidebarLink[] = [
    link(
      "organization-settings",
      APP_ROUTE_LABELS.organizationSettings,
      APP_ROUTES.organizationSettings,
      Building2
    ),
    link(
      "user-settings",
      APP_ROUTE_LABELS.userSettings,
      APP_ROUTES.userSettings,
      UserRound
    ),
  ];

  groups.push({
    id: "tools",
    title: "Tools",
    links: toolsLinks,
  });

  return groups;
}

export interface CmsBreadcrumbNavEntry {
  label: string;
  icon: ReactNode;
}

/** Path keys are org-relative (e.g. `calendar`, `leads/repair`, `settings/org/billing`). */
export function buildCmsNavBreadcrumbLookup(
  groups: FieldFlowSidebarGroup[]
): Map<string, CmsBreadcrumbNavEntry> {
  const map = new Map<string, CmsBreadcrumbNavEntry>();

  const register = (path: string, entry: CmsBreadcrumbNavEntry) => {
    const key = path.replace(/^\//, "");
    if (key) {
      map.set(key, entry);
    }
  };

  const visit = (links: FieldFlowSidebarLink[]) => {
    for (const link of links) {
      const entry = { label: link.title, icon: link.icon };
      const normalized = link.href.replace(/^\//, "");
      register(link.href, entry);

      if (link.children?.length) {
        const parentSegment = normalized.split("/")[0];
        if (parentSegment) {
          register(parentSegment, entry);
        }
        visit(link.children);
      }
    }
  };

  for (const group of groups) {
    visit(group.links);
  }

  return map;
}

export function resolveCmsNavBreadcrumbEntry(
  relativePath: string,
  lookup: Map<string, CmsBreadcrumbNavEntry>
): CmsBreadcrumbNavEntry | undefined {
  const normalized = relativePath.replace(/^\//, "");
  if (!normalized) return undefined;

  if (lookup.has(normalized)) {
    return lookup.get(normalized);
  }

  const segments = normalized.split("/");
  for (let index = segments.length - 1; index >= 0; index -= 1) {
    const suffix = segments.slice(index).join("/");
    const hit = lookup.get(suffix);
    if (hit) return hit;
  }

  return undefined;
}
