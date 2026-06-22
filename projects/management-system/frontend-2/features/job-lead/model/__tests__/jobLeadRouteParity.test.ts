import { describe, expect, it } from "vitest";

import { JobLeadTypeSegment, PermissionCode } from "@/constants";
import {
  JOB_ROUTE_CONFIGS,
  LEAD_ROUTE_CONFIGS,
} from "@/features/job-lead/model/jobLeadRouteConfig";
import { PERMISSION_RESOURCES } from "@/hooks/permissions/constants";
import { jobPageResourceForJobType } from "@/hooks/permissions/jobPageResource";
import { matchAppRoutePermission } from "@/hooks/permissions/matchAppRoutePermission";
import { parsePermissionCodes } from "@/hooks/permissions/parsePermissionCodes";

const JOB_TYPE_SEGMENTS = [
  JobLeadTypeSegment.REPAIR,
  JobLeadTypeSegment.EXCAVATION,
  JobLeadTypeSegment.TILING,
] as const;

describe("job-lead route config ↔ permissions parity", () => {
  it("maps each job list route to the same resource as its permissionCode", () => {
    const permissions = parsePermissionCodes([
      `${PERMISSION_RESOURCES.JOBS_REPAIR_PAGE}_read`,
      `${PERMISSION_RESOURCES.JOBS_EXCAVATION_PAGE}_read`,
      `${PERMISSION_RESOURCES.JOBS_TILING_PAGE}_read`,
      `${PERMISSION_RESOURCES.LEADS_PAGE}_read`,
    ]);

    for (const segment of JOB_TYPE_SEGMENTS) {
      const jobConfig = JOB_ROUTE_CONFIGS[segment];
      const leadConfig = LEAD_ROUTE_CONFIGS[segment];

      expect(jobConfig.formId).toBeTruthy();
      expect(jobConfig.listTitle).toBeTruthy();
      expect(jobConfig.Card).toBeTruthy();
      expect(leadConfig.leadSourcePlaceholder).toBeTruthy();

      const jobPath = `/jobs/${jobConfig.currentPathSegment}`;
      const leadPath = `/leads/${leadConfig.currentPathSegment}`;

      expect(matchAppRoutePermission(jobPath, permissions)?.resource).toBe(
        jobPageResourceForJobType(jobConfig.jobType)
      );
      expect(matchAppRoutePermission(leadPath, permissions)?.resource).toBe(
        PERMISSION_RESOURCES.LEADS_PAGE
      );
    }
  });

  it("uses leads_page_read for all lead types", () => {
    for (const segment of JOB_TYPE_SEGMENTS) {
      expect(LEAD_ROUTE_CONFIGS[segment].permissionCode).toBe(
        PermissionCode.LEADS_PAGE_READ
      );
    }
  });

  it("includes equipment write permission on job forms that support equipment", () => {
    expect(JOB_ROUTE_CONFIGS.repair.equipmentWritePermission).toBe(
      PermissionCode.JOBS_REPAIR_EQUIPMENT_MANAGEMENT_WRITE
    );
    expect(JOB_ROUTE_CONFIGS.excavation.equipmentWritePermission).toBe(
      PermissionCode.JOBS_EXCAVATION_EQUIPMENT_MANAGEMENT_WRITE
    );
    expect(JOB_ROUTE_CONFIGS.tiling.equipmentWritePermission).toBe(
      PermissionCode.JOBS_TILING_EQUIPMENT_MANAGEMENT_WRITE
    );
  });
});
