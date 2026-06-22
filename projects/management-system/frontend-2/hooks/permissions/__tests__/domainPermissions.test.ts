import { describe, expect, it } from "vitest";

import { JobType, PermissionCode, ResourceType } from "@/constants";
import { getJobEquipmentPermissionCodes } from "@/features/jobs/lib/jobEquipmentPermissions";
import { jobPageResourceForJobType } from "@/hooks/permissions/jobPageResource";
import { calendarItemPageResource } from "@/hooks/permissions/useCalendarEntityPermissions";

import { PERMISSION_RESOURCES } from "../constants";
import type { DashboardChartDataForFiltering } from "../permissionRules";
import {
  JOB_TAB_READ_CODES,
  JOB_TAB_WRITE_CODES,
  crewManagementResourceForJobType,
  editStatusResourceForJobType,
  extractActionsForResource,
  extractResourcesWithReadPermission,
  filterDashboardChartDataByPermissions,
  resolveCompletedJobPageAccess,
  resolveContactPermissionFlags,
  resolveCrewManagementFlags,
  resolveDashboardPermissionFlags,
  resolveDesignRequestAccess,
  resolveFarmPermissionFlags,
  resolveHasPermissionFromCodes,
  resolveJobProgressPermissionFlags,
  resolveJobTabPermissionFromCodes,
  resolveOrderPipePermissionFlags,
  resolveOrganizationSettingsFlags,
  resolveSettingsPermissionFlags,
  resolveTodoPermissionFlags,
} from "../permissionRules";

describe("resource CRUD hooks parity (frontend v1)", () => {
  it("maps contact permissions", () => {
    expect(resolveContactPermissionFlags(["read", "write"])).toEqual({
      canRead: true,
      canAdd: true,
      canDelete: false,
    });
  });

  it("maps farm permissions with edit", () => {
    expect(resolveFarmPermissionFlags(["read", "write", "delete"])).toEqual({
      canRead: true,
      canAdd: true,
      canEdit: true,
      canDelete: true,
    });
  });

  it("maps settings permissions", () => {
    expect(resolveSettingsPermissionFlags(["read"])).toEqual({
      canRead: true,
      canAdd: false,
      canDelete: false,
    });
  });

  it("maps order pipe permissions with canWrite", () => {
    expect(resolveOrderPipePermissionFlags(["write"])).toEqual({
      canRead: false,
      canWrite: true,
      canDelete: false,
    });
  });

  it("maps crew management write only", () => {
    expect(resolveCrewManagementFlags(["write"])).toEqual({
      canManageCrew: true,
    });
    expect(resolveCrewManagementFlags(["read"])).toEqual({
      canManageCrew: false,
    });
  });
});

describe("job type resource mapping", () => {
  it("maps page, edit status, and crew resources per job type", () => {
    expect(jobPageResourceForJobType(JobType.REPAIR)).toBe(
      PERMISSION_RESOURCES.JOBS_REPAIR_PAGE
    );
    expect(editStatusResourceForJobType(JobType.TILING)).toBe(
      PERMISSION_RESOURCES.JOBS_TILING_EDIT_STATUS
    );
    expect(crewManagementResourceForJobType(JobType.EXCAVATION)).toBe(
      PERMISSION_RESOURCES.JOBS_EXCAVATION_CREW_MANAGEMENT
    );
  });
});

describe("todo permissions", () => {
  it("matches v1 todo and edit-status split", () => {
    expect(
      resolveTodoPermissionFlags(["read", "write"], ["write"], "Crew", [])
    ).toEqual({
      canRead: true,
      canEdit: true,
      canDelete: false,
      canEditStatus: true,
      isAdmin: false,
    });

    expect(
      resolveTodoPermissionFlags([], [], "Admin", ["is_admin"])
    ).toMatchObject({ isAdmin: true });
  });
});

describe("dashboard permissions", () => {
  const allResources = [
    PERMISSION_RESOURCES.JOBS_REPAIR_PAGE,
    PERMISSION_RESOURCES.JOBS_EXCAVATION_PAGE,
    PERMISSION_RESOURCES.JOBS_TILING_PAGE,
    PERMISSION_RESOURCES.COMPLETED_CANCELED_PAGE,
    PERMISSION_RESOURCES.CONTACT_ACCESS,
    PERMISSION_RESOURCES.EQUIPMENT_PAGE,
    PERMISSION_RESOURCES.LEADS_PAGE,
  ];

  it("derives access flags like frontend v1 sidebar", () => {
    expect(
      resolveDashboardPermissionFlags({
        permissionResources: allResources,
        roleName: "Bookkeeper",
        userPermissionCodes: ["is_bookkeeper"],
        isAdmin: false,
      })
    ).toMatchObject({
      hasRepairJobAccess: true,
      hasLeadsAccess: true,
      isBookkeeper: true,
      isAdmin: false,
      hasNoDashboardAccess: false,
    });
  });

  it("marks dashboard empty without jobs, equipment, or leads", () => {
    expect(
      resolveDashboardPermissionFlags({
        permissionResources: [PERMISSION_RESOURCES.CONTACT_ACCESS],
        roleName: "User",
        userPermissionCodes: [],
        isAdmin: false,
      }).hasNoDashboardAccess
    ).toBe(true);
  });

  it("filters chart data by job and completed access", () => {
    const dashboardData: DashboardChartDataForFiltering = {
      jobStatusData: [
        { type: "Repair", Active: 1, Completed: 2, Cancelled: 1 },
        { type: "Tile", Active: 3, Completed: 4, Cancelled: 2 },
      ],
      pendingApprovalData: [{ type: "Repair", Count: 1 }],
      leadTypeData: { title: "Leads", legend: { Repair: 1 } },
    };

    const filtered = filterDashboardChartDataByPermissions(dashboardData, {
      hasRepairJobAccess: true,
      hasExcavationJobAccess: false,
      hasTilingJobAccess: false,
      hasLeadsAccess: true,
      hasCompletedAccess: false,
    });

    expect(filtered.filteredJobStatusData).toEqual([
      { type: "Repair", Active: 1 },
    ]);
    expect(filtered.filteredPendingApprovalData).toHaveLength(1);
    expect(filtered.filteredLeadTypeData.legend).toEqual({ Repair: 1 });
  });
});

describe("completed job page access", () => {
  it("requires page read and any job read to view", () => {
    expect(
      resolveCompletedJobPageAccess({ read: true, write: true, delete: true }, [
        { canRead: false, canEdit: false, canDelete: false },
        { canRead: true, canEdit: false, canDelete: false },
      ])
    ).toEqual({
      canViewPage: true,
      hasAnyWritePermission: false,
      hasAnyDeletePermission: false,
    });
  });
});

describe("job progress permissions", () => {
  it("grants admin full on-site updates", () => {
    expect(
      resolveJobProgressPermissionFlags({
        isAdmin: true,
        canAccessOnSiteTracking: false,
        jobType: JobType.REPAIR,
        canRead: false,
        canEdit: false,
      })
    ).toMatchObject({
      canUpdateEquipmentHours: true,
      canUpdateTimeTracking: true,
      canViewInstalledFootage: false,
    });
  });

  it("requires tiling read for footage view and write for update", () => {
    expect(
      resolveJobProgressPermissionFlags({
        isAdmin: false,
        canAccessOnSiteTracking: false,
        jobType: JobType.TILING,
        canRead: true,
        canEdit: false,
      })
    ).toMatchObject({
      canViewInstalledFootage: true,
      canUpdateInstalledFootage: false,
    });

    expect(
      resolveJobProgressPermissionFlags({
        isAdmin: false,
        canAccessOnSiteTracking: true,
        jobType: JobType.TILING,
        canRead: false,
        canEdit: false,
      }).canUpdateInstalledFootage
    ).toBe(true);
  });
});

describe("organization settings permissions", () => {
  it("maps team_organization_info actions", () => {
    expect(
      resolveOrganizationSettingsFlags({
        read: true,
        write: false,
        delete: false,
      })
    ).toEqual({ canView: true, canEdit: false, canDelete: false });
  });
});

describe("design request access", () => {
  it("allows submit for admin or TD integration write", () => {
    expect(
      resolveDesignRequestAccess({
        isAdmin: false,
        hasTdIntegrationWrite: true,
        routeRead: false,
      })
    ).toEqual({ canSubmit: true, canView: true });

    expect(
      resolveDesignRequestAccess({
        isAdmin: false,
        hasTdIntegrationWrite: false,
        routeRead: true,
      })
    ).toEqual({ canSubmit: false, canView: true });
  });
});

describe("job tab permissions", () => {
  it("returns false while loading", () => {
    expect(
      resolveJobTabPermissionFromCodes(
        [JOB_TAB_READ_CODES.excavationEstimateFinancial],
        JOB_TAB_READ_CODES.excavationEstimateFinancial,
        true
      )
    ).toBe(false);
  });

  it("checks estimate/financial read and write codes", () => {
    expect(
      resolveJobTabPermissionFromCodes(
        [PermissionCode.JOBS_TILING_ESTIMATE_FINANCIAL_READ],
        JOB_TAB_READ_CODES.tilingEstimateFinancial,
        false
      )
    ).toBe(true);

    expect(
      resolveJobTabPermissionFromCodes(
        [PermissionCode.JOBS_EXCAVATION_ESTIMATE_FINANCIAL_WRITE],
        JOB_TAB_WRITE_CODES.excavationEstimateFinancial,
        false
      )
    ).toBe(true);
  });
});

describe("storage parsing helpers", () => {
  const codes = [
    `${PERMISSION_RESOURCES.CONTACT_ACCESS}_read`,
    `${PERMISSION_RESOURCES.CONTACT_ACCESS}_write`,
    `${PERMISSION_RESOURCES.LEADS_PAGE}_read`,
  ];

  it("extracts actions for a resource", () => {
    expect(
      extractActionsForResource(codes, PERMISSION_RESOURCES.CONTACT_ACCESS)
    ).toEqual(["read", "write"]);
  });

  it("extracts resources with read permission", () => {
    expect(extractResourcesWithReadPermission(codes)).toEqual([
      PERMISSION_RESOURCES.CONTACT_ACCESS,
      PERMISSION_RESOURCES.LEADS_PAGE,
    ]);
  });
});

describe("hasPermission resolution", () => {
  it("supports any and all modes", () => {
    const codes = ["a_read", "b_write"];
    expect(
      resolveHasPermissionFromCodes(codes, ["a_read", "c_delete"], "any")
    ).toBe(true);
    expect(
      resolveHasPermissionFromCodes(codes, ["a_read", "b_write"], "all")
    ).toBe(true);
    expect(
      resolveHasPermissionFromCodes(codes, ["a_read", "c_delete"], "all")
    ).toBe(false);
    expect(resolveHasPermissionFromCodes(undefined, "a_read")).toBe(false);
  });
});

describe("job equipment permission codes", () => {
  it("matches frontend v1 getEquipmentPermissionCodes mapping", () => {
    expect(getJobEquipmentPermissionCodes(JobType.EXCAVATION)).toEqual({
      read: PermissionCode.JOBS_EXCAVATION_PAGE_READ,
      write: PermissionCode.JOBS_EXCAVATION_EQUIPMENT_MANAGEMENT_WRITE,
      delete: PermissionCode.JOBS_EXCAVATION_EQUIPMENT_MANAGEMENT_DELETE,
    });
  });
});

describe("calendar item page resource", () => {
  const baseCalendarItem = {
    title: "Item",
    location: "",
    startDate: "2026-01-01",
    endDate: "2026-01-02",
    workflowStatus: { label: "New", tone: "blue" as const },
    barStatus: "inprogress" as const,
  };

  it("maps leads and job categories to page resources", () => {
    expect(
      calendarItemPageResource({
        ...baseCalendarItem,
        id: 1,
        kind: ResourceType.LEAD,
        category: "repair",
      })
    ).toBe(PERMISSION_RESOURCES.LEADS_PAGE);

    expect(
      calendarItemPageResource({
        ...baseCalendarItem,
        id: 2,
        kind: ResourceType.JOB,
        category: "tile",
      })
    ).toBe(PERMISSION_RESOURCES.JOBS_TILING_PAGE);
  });
});
