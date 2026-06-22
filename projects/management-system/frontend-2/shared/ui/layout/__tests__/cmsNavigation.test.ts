import { describe, expect, it } from "vitest";

import { PERMISSION_RESOURCES } from "@/hooks/permissions";
import { APP_ROUTES } from "@/shared/config/routes";

import {
  type CmsNavigationPermissions,
  buildCmsNavBreadcrumbLookup,
  buildCmsSidebarNavigation,
  deriveCmsNavigationPermissions,
  resolveCmsNavBreadcrumbEntry,
} from "../cmsNavigation";

function collectLinkIds(
  groups: ReturnType<typeof buildCmsSidebarNavigation>
): string[] {
  const ids: string[] = [];
  const visit = (links: { id: string; children?: { id: string }[] }[]) => {
    for (const link of links) {
      ids.push(link.id);
      if (link.children) visit(link.children);
    }
  };
  for (const group of groups) {
    visit(group.links);
  }
  return ids;
}

function hasLink(
  groups: ReturnType<typeof buildCmsSidebarNavigation>,
  linkId: string
) {
  return collectLinkIds(groups).includes(linkId);
}

const noAccess: CmsNavigationPermissions = {
  isAdmin: false,
  isBookkeeper: false,
  hasMajorRoleAccess: false,
  hasContactsAccess: false,
  hasSettingsAccess: false,
  hasEquipmentAccess: false,
  hasLeadVisibility: false,
  hasRepairJobAccess: false,
  hasExcavationJobAccess: false,
  hasTilingJobAccess: false,
  hasCrewManagementAccess: false,
  hasCompletedCanceledAccess: false,
  hasTodoAccess: false,
  hasOrderPipesAccess: false,
};

describe("deriveCmsNavigationPermissions", () => {
  it("maps permission resources and role names like the legacy sidebar", () => {
    const resources = [
      PERMISSION_RESOURCES.CONTACT_ACCESS,
      PERMISSION_RESOURCES.SETTINGS_PAGE,
      PERMISSION_RESOURCES.EQUIPMENT_PAGE,
      PERMISSION_RESOURCES.LEADS_PAGE,
      PERMISSION_RESOURCES.JOBS_REPAIR_PAGE,
      PERMISSION_RESOURCES.JOBS_EXCAVATION_PAGE,
      PERMISSION_RESOURCES.JOBS_TILING_PAGE,
      PERMISSION_RESOURCES.CREW_MANAGEMENT_PAGE,
      PERMISSION_RESOURCES.COMPLETED_CANCELED_PAGE,
      PERMISSION_RESOURCES.TODO_LIST,
      PERMISSION_RESOURCES.ORDER_PIPES_LIST,
    ];

    expect(deriveCmsNavigationPermissions(resources, "Admin")).toEqual({
      isAdmin: true,
      isBookkeeper: false,
      hasMajorRoleAccess: true,
      hasContactsAccess: true,
      hasSettingsAccess: true,
      hasEquipmentAccess: true,
      hasLeadVisibility: true,
      hasRepairJobAccess: true,
      hasExcavationJobAccess: true,
      hasTilingJobAccess: true,
      hasCrewManagementAccess: true,
      hasCompletedCanceledAccess: true,
      hasTodoAccess: true,
      hasOrderPipesAccess: true,
    });

    expect(
      deriveCmsNavigationPermissions(resources, "Bookkeeper").isBookkeeper
    ).toBe(true);
    expect(
      deriveCmsNavigationPermissions(resources, "Bookkeeper").isAdmin
    ).toBe(false);

    expect(
      deriveCmsNavigationPermissions(resources, {
        name: "Custom Admin",
        is_admin: true,
      }).isAdmin
    ).toBe(true);

    expect(
      deriveCmsNavigationPermissions(resources, "Project Manager")
        .hasMajorRoleAccess
    ).toBe(true);
    expect(
      deriveCmsNavigationPermissions(resources, "User").hasMajorRoleAccess
    ).toBe(false);
  });
});

describe("buildCmsSidebarNavigation", () => {
  it("includes dashboard, coming soon, and tools; gates upkeep and industry specialists by major role", () => {
    const groups = buildCmsSidebarNavigation(noAccess);
    const ids = collectLinkIds(groups);

    expect(ids).toContain("dashboard");
    expect(ids).not.toContain("maintenance");
    expect(ids).toContain("upcoming-features");
    expect(ids).not.toContain("industry-specialists");
    expect(ids).toContain("organization-settings");
    expect(ids).toContain("user-settings");
    expect(groups.find((group) => group.id === "tools")).toBeDefined();
    expect(groups.find((group) => group.id === "upkeep")).toBeUndefined();

    const majorRoleGroups = buildCmsSidebarNavigation({
      ...noAccess,
      hasMajorRoleAccess: true,
    });
    expect(collectLinkIds(majorRoleGroups)).toContain("maintenance");
    expect(collectLinkIds(majorRoleGroups)).toContain("industry-specialists");
  });

  it("hides equipment in upkeep without major role even when equipment access is granted", () => {
    expect(
      hasLink(
        buildCmsSidebarNavigation({
          ...noAccess,
          hasEquipmentAccess: true,
        }),
        "equipment"
      )
    ).toBe(false);

    expect(
      hasLink(
        buildCmsSidebarNavigation({
          ...noAccess,
          hasEquipmentAccess: true,
          hasMajorRoleAccess: true,
        }),
        "equipment"
      )
    ).toBe(true);
  });

  it("shows task management with todo access regardless of major role", () => {
    expect(
      hasLink(
        buildCmsSidebarNavigation({ ...noAccess, hasTodoAccess: true }),
        "task-management"
      )
    ).toBe(true);
    expect(
      hasLink(buildCmsSidebarNavigation(noAccess), "task-management")
    ).toBe(false);
  });

  it("hides calendar, footage, and work links without job or lead access", () => {
    const ids = collectLinkIds(buildCmsSidebarNavigation(noAccess));

    expect(ids).not.toContain("calendar");
    expect(ids).not.toContain("footage");
    expect(ids).not.toContain("leads");
    expect(ids).not.toContain("jobs");
    expect(ids).not.toContain("completed");
    expect(ids).not.toContain("contact");
    expect(ids).not.toContain("status-management");
    expect(ids).not.toContain("equipment");
    expect(ids).not.toContain("task-management");
  });

  it("shows calendar when the user has leads or any job type access", () => {
    expect(
      hasLink(
        buildCmsSidebarNavigation({
          ...noAccess,
          hasLeadVisibility: true,
        }),
        "calendar"
      )
    ).toBe(true);

    expect(
      hasLink(
        buildCmsSidebarNavigation({
          ...noAccess,
          hasRepairJobAccess: true,
        }),
        "calendar"
      )
    ).toBe(true);
  });

  it("shows all lead children when leads are visible and only permitted job children", () => {
    const tilingOnly = buildCmsSidebarNavigation({
      ...noAccess,
      hasLeadVisibility: true,
      hasTilingJobAccess: true,
    });

    expect(hasLink(tilingOnly, "leads-tiling")).toBe(true);
    expect(hasLink(tilingOnly, "leads-repair")).toBe(true);
    expect(hasLink(tilingOnly, "leads-excavation")).toBe(true);
    expect(hasLink(tilingOnly, "jobs-tiling")).toBe(true);
    expect(hasLink(tilingOnly, "jobs-repair")).toBe(false);
    expect(hasLink(tilingOnly, "jobs-excavation")).toBe(false);
    expect(hasLink(tilingOnly, "footage")).toBe(true);
  });

  it("gates completed jobs, contacts, settings, equipment, and todo by resource access", () => {
    const partial = buildCmsSidebarNavigation({
      ...noAccess,
      hasCompletedCanceledAccess: true,
      hasContactsAccess: true,
      hasSettingsAccess: true,
      hasEquipmentAccess: true,
      hasMajorRoleAccess: true,
      hasTodoAccess: true,
    });

    expect(hasLink(partial, "completed")).toBe(true);
    expect(hasLink(partial, "contact")).toBe(true);
    expect(hasLink(partial, "status-management")).toBe(true);
    expect(hasLink(partial, "system-settings")).toBe(true);
    expect(hasLink(partial, "favorites")).toBe(true);
    expect(hasLink(partial, "equipment")).toBe(true);
    expect(hasLink(partial, "task-management")).toBe(true);
  });

  it("shows quick actions in its own group above analysis for admins only", () => {
    const adminGroups = buildCmsSidebarNavigation({
      ...noAccess,
      isAdmin: true,
    });

    expect(adminGroups[0]?.id).toBe("quick-actions");
    expect(hasLink(adminGroups, "quick-actions")).toBe(true);

    const actionGroup = adminGroups.find((group) => group.id === "action");
    expect(actionGroup?.links.some((link) => link.id === "quick-actions")).toBe(
      false
    );

    expect(hasLink(buildCmsSidebarNavigation(noAccess), "quick-actions")).toBe(
      false
    );

    expect(
      hasLink(
        buildCmsSidebarNavigation({ ...noAccess, hasOrderPipesAccess: true }),
        "order-pipe"
      )
    ).toBe(true);
    expect(hasLink(buildCmsSidebarNavigation(noAccess), "order-pipe")).toBe(
      false
    );
  });

  it("shows book keeping for admin or bookkeeper roles", () => {
    expect(
      hasLink(
        buildCmsSidebarNavigation({ ...noAccess, isAdmin: true }),
        "book-keeping"
      )
    ).toBe(true);
    expect(
      hasLink(
        buildCmsSidebarNavigation({ ...noAccess, isBookkeeper: true }),
        "book-keeping"
      )
    ).toBe(true);
    expect(hasLink(buildCmsSidebarNavigation(noAccess), "book-keeping")).toBe(
      false
    );
  });

  it("shows pending approval for admins in the work group", () => {
    expect(
      hasLink(
        buildCmsSidebarNavigation({ ...noAccess, isAdmin: true }),
        "pending-approval"
      )
    ).toBe(true);
    expect(
      hasLink(buildCmsSidebarNavigation(noAccess), "pending-approval")
    ).toBe(false);
  });

  it("uses the first available job child href for the jobs parent link", () => {
    const groups = buildCmsSidebarNavigation({
      ...noAccess,
      hasExcavationJobAccess: true,
      hasTilingJobAccess: true,
    });
    const workGroup = groups.find((group) => group.id === "work");
    const jobsLink = workGroup?.links.find((link) => link.id === "jobs");

    expect(jobsLink?.href).toBe(APP_ROUTES.jobsExcavation);
    expect(jobsLink?.children?.map((child) => child.id)).toEqual([
      "jobs-excavation",
      "jobs-tiling",
    ]);
  });

  it("pins organization and user settings in the tools group", () => {
    const tools = buildCmsSidebarNavigation(noAccess).find(
      (group) => group.id === "tools"
    );

    expect(tools?.links.map((link) => link.href)).toEqual([
      APP_ROUTES.organizationSettings,
      APP_ROUTES.userSettings,
    ]);
  });

  it("does not show trash in the main tools sidebar", () => {
    const tools = buildCmsSidebarNavigation({
      ...noAccess,
    }).find((group) => group.id === "tools");

    expect(tools?.links.map((link) => link.id)).toEqual([
      "organization-settings",
      "user-settings",
    ]);
  });
});

describe("cms navigation breadcrumbs", () => {
  it("builds lookup entries for parent and child routes", () => {
    const lookup = buildCmsNavBreadcrumbLookup(
      buildCmsSidebarNavigation({
        ...noAccess,
        hasLeadVisibility: true,
        hasRepairJobAccess: true,
      })
    );

    expect(resolveCmsNavBreadcrumbEntry("leads/repair", lookup)?.label).toBe(
      "Repair"
    );
    expect(resolveCmsNavBreadcrumbEntry("leads", lookup)?.label).toBe("Leads");
  });
});
