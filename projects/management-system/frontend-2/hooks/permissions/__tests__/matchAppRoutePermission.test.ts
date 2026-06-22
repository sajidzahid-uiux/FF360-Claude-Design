import { describe, expect, it } from "vitest";

import { APP_ROUTES, LEGACY_APP_ROUTES } from "@/shared/config/routes";

import { PERMISSION_RESOURCES } from "../constants";
import {
  matchAppRoutePermission,
  matchPathnameRoutePermission,
  normalizeAppPathname,
} from "../matchAppRoutePermission";
import { parsePermissionCodes } from "../parsePermissionCodes";

const trashReadCodes = [
  `${PERMISSION_RESOURCES.TRASH_PAGE}_read`,
  `${PERMISSION_RESOURCES.TEAM_ORGANIZATION_INFO}_read`,
  `${PERMISSION_RESOURCES.SETTINGS_PAGE}_read`,
];

describe("normalizeAppPathname", () => {
  it("strips /organizations/:orgId and legacy numeric org prefixes", () => {
    expect(normalizeAppPathname("/organizations/99/settings/org/trash")).toBe(
      "/settings/org/trash"
    );
    expect(normalizeAppPathname("/99/settings/org/trash")).toBe(
      "/settings/org/trash"
    );
    expect(normalizeAppPathname("/dashboard")).toBe("/dashboard");
  });
});

describe("matchAppRoutePermission", () => {
  const permissions = parsePermissionCodes(trashReadCodes);

  it("matches new and legacy trash routes to trash_page", () => {
    expect(
      matchAppRoutePermission(APP_ROUTES.trash, permissions)?.resource
    ).toBe(PERMISSION_RESOURCES.TRASH_PAGE);
    expect(
      matchAppRoutePermission(LEGACY_APP_ROUTES.orgTrash, permissions)?.resource
    ).toBe(PERMISSION_RESOURCES.TRASH_PAGE);
    expect(matchAppRoutePermission("/trash", permissions)?.resource).toBe(
      PERMISSION_RESOURCES.TRASH_PAGE
    );
  });

  it("matches organization settings and legacy org routes to team_organization_info", () => {
    expect(
      matchAppRoutePermission(APP_ROUTES.organizationSettings, permissions)
        ?.resource
    ).toBe(PERMISSION_RESOURCES.TEAM_ORGANIZATION_INFO);
    expect(
      matchAppRoutePermission(LEGACY_APP_ROUTES.orgInfo, permissions)?.resource
    ).toBe(PERMISSION_RESOURCES.TEAM_ORGANIZATION_INFO);
    expect(
      matchAppRoutePermission(LEGACY_APP_ROUTES.org, permissions)?.resource
    ).toBe(PERMISSION_RESOURCES.TEAM_ORGANIZATION_INFO);
  });

  it("matches standalone status management to settings_page", () => {
    expect(
      matchAppRoutePermission(APP_ROUTES.statusManagement, permissions)
        ?.resource
    ).toBe(PERMISSION_RESOURCES.SETTINGS_PAGE);
    expect(
      matchAppRoutePermission(LEGACY_APP_ROUTES.orgSettings, permissions)
        ?.resource
    ).toBe(PERMISSION_RESOURCES.SETTINGS_PAGE);
    expect(
      matchAppRoutePermission(APP_ROUTES.legacyStatusSettings, permissions)
        ?.resource
    ).toBe(PERMISSION_RESOURCES.SETTINGS_PAGE);
  });

  it("returns read/write/delete flags from parsed permission codes", () => {
    const result = matchPathnameRoutePermission(
      "/organizations/12/settings/org/trash",
      permissions
    );

    expect(result).toEqual({
      resource: PERMISSION_RESOURCES.TRASH_PAGE,
      read: true,
      write: false,
      delete: false,
    });
  });

  it("returns null for routes without a permission mapping", () => {
    expect(
      matchAppRoutePermission(APP_ROUTES.dashboard, permissions)
    ).toBeNull();
  });

  it("maps frontend v1 job, contact, equipment, and work routes", () => {
    const allReadCodes = [
      `${PERMISSION_RESOURCES.JOBS_REPAIR_PAGE}_read`,
      `${PERMISSION_RESOURCES.JOBS_EXCAVATION_PAGE}_read`,
      `${PERMISSION_RESOURCES.JOBS_TILING_PAGE}_read`,
      `${PERMISSION_RESOURCES.CONTACT_ACCESS}_read`,
      `${PERMISSION_RESOURCES.EQUIPMENT_PAGE}_read`,
      `${PERMISSION_RESOURCES.COMPLETED_CANCELED_PAGE}_read`,
      `${PERMISSION_RESOURCES.CREW_MANAGEMENT_PAGE}_read`,
      `${PERMISSION_RESOURCES.LEADS_PAGE}_read`,
      `${PERMISSION_RESOURCES.ORDER_PIPES_LIST}_read`,
    ];
    const parsed = parsePermissionCodes(allReadCodes);

    expect(
      matchAppRoutePermission(APP_ROUTES.jobsRepair, parsed)?.resource
    ).toBe(PERMISSION_RESOURCES.JOBS_REPAIR_PAGE);
    expect(
      matchAppRoutePermission(APP_ROUTES.jobsExcavation, parsed)?.resource
    ).toBe(PERMISSION_RESOURCES.JOBS_EXCAVATION_PAGE);
    expect(
      matchAppRoutePermission(APP_ROUTES.jobsTiling, parsed)?.resource
    ).toBe(PERMISSION_RESOURCES.JOBS_TILING_PAGE);
    expect(matchAppRoutePermission(APP_ROUTES.contact, parsed)?.resource).toBe(
      PERMISSION_RESOURCES.CONTACT_ACCESS
    );
    expect(
      matchAppRoutePermission(APP_ROUTES.equipment, parsed)?.resource
    ).toBe(PERMISSION_RESOURCES.EQUIPMENT_PAGE);
    expect(
      matchAppRoutePermission(APP_ROUTES.completed, parsed)?.resource
    ).toBe(PERMISSION_RESOURCES.COMPLETED_CANCELED_PAGE);
    expect(
      matchAppRoutePermission(APP_ROUTES.crewManagement, parsed)?.resource
    ).toBe(PERMISSION_RESOURCES.CREW_MANAGEMENT_PAGE);
    expect(
      matchAppRoutePermission(APP_ROUTES.leadsRepair, parsed)?.resource
    ).toBe(PERMISSION_RESOURCES.LEADS_PAGE);
    expect(
      matchAppRoutePermission(APP_ROUTES.orderPipe, parsed)?.resource
    ).toBe(PERMISSION_RESOURCES.ORDER_PIPES_LIST);
  });
});
