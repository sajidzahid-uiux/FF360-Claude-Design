import { describe, expect, it } from "vitest";

import { JobType, PermissionCode } from "@/constants";

import { PERMISSION_RESOURCES } from "../constants";
import {
  canEditCalendarScheduleForItem,
  canEditTerminalJobSchedulingFromCodes,
  combineCompletedJobPermissionFlags,
  resolveJobPermissionFlags,
  resolveResourceCrudFlags,
  terminalJobSchedulingPermissionCodes,
} from "../permissionRules";

describe("resolveResourceCrudFlags", () => {
  it("maps write to canAdd and canEdit", () => {
    expect(resolveResourceCrudFlags(["write"])).toEqual({
      canRead: false,
      canAdd: true,
      canEdit: true,
      canDelete: false,
    });
  });

  it("maps read and delete independently", () => {
    expect(resolveResourceCrudFlags(["read", "delete"])).toEqual({
      canRead: true,
      canAdd: false,
      canEdit: false,
      canDelete: true,
    });
  });
});

describe("resolveJobPermissionFlags", () => {
  it("keeps edit status separate from page write", () => {
    expect(resolveJobPermissionFlags(["read"], ["write"])).toEqual({
      canRead: true,
      canAdd: false,
      canEdit: false,
      canDelete: false,
      canEditStatus: true,
    });

    expect(resolveJobPermissionFlags(["write"], [])).toEqual({
      canRead: false,
      canAdd: true,
      canEdit: true,
      canDelete: false,
      canEditStatus: false,
    });
  });
});

describe("combineCompletedJobPermissionFlags", () => {
  const jobTypePerms = {
    canRead: true,
    canEdit: true,
    canDelete: true,
    canEditStatus: true,
    isLoading: false,
  };

  it("requires both page and job-type permissions", () => {
    expect(
      combineCompletedJobPermissionFlags(
        { read: true, write: true, delete: true },
        jobTypePerms
      )
    ).toEqual({
      canRead: true,
      canEdit: true,
      canDelete: true,
      canEditStatus: true,
      isLoading: false,
    });
  });

  it("denies when page permission is missing", () => {
    expect(
      combineCompletedJobPermissionFlags(
        { read: true, write: false, delete: false },
        jobTypePerms
      )
    ).toEqual({
      canRead: true,
      canEdit: false,
      canDelete: false,
      canEditStatus: false,
      isLoading: false,
    });
  });

  it("denies when job-type permission is missing", () => {
    expect(
      combineCompletedJobPermissionFlags(
        { read: true, write: true, delete: true },
        {
          canRead: false,
          canEdit: false,
          canDelete: false,
          canEditStatus: false,
        }
      )
    ).toEqual({
      canRead: false,
      canEdit: false,
      canDelete: false,
      canEditStatus: false,
      isLoading: false,
    });
  });
});

describe("terminalJobSchedulingPermissionCodes", () => {
  it("requires completed_canceled_page_write and job-type page write", () => {
    expect(terminalJobSchedulingPermissionCodes(JobType.REPAIR)).toEqual([
      PermissionCode.COMPLETED_CANCELED_PAGE_WRITE,
      PermissionCode.JOBS_REPAIR_PAGE_WRITE,
    ]);
    expect(terminalJobSchedulingPermissionCodes(JobType.EXCAVATION)).toEqual([
      PermissionCode.COMPLETED_CANCELED_PAGE_WRITE,
      PermissionCode.JOBS_EXCAVATION_PAGE_WRITE,
    ]);
    expect(terminalJobSchedulingPermissionCodes(JobType.TILING)).toEqual([
      PermissionCode.COMPLETED_CANCELED_PAGE_WRITE,
      PermissionCode.JOBS_TILING_PAGE_WRITE,
    ]);
  });
});

describe("canEditTerminalJobSchedulingFromCodes", () => {
  it("allows admins without explicit codes", () => {
    expect(
      canEditTerminalJobSchedulingFromCodes(true, [], JobType.REPAIR)
    ).toBe(true);
  });

  it("requires both CO&CA and job page write for non-admins", () => {
    expect(
      canEditTerminalJobSchedulingFromCodes(
        false,
        [PermissionCode.COMPLETED_CANCELED_PAGE_WRITE],
        JobType.REPAIR
      )
    ).toBe(false);

    expect(
      canEditTerminalJobSchedulingFromCodes(
        false,
        [
          PermissionCode.COMPLETED_CANCELED_PAGE_WRITE,
          PermissionCode.JOBS_REPAIR_PAGE_WRITE,
        ],
        JobType.REPAIR
      )
    ).toBe(true);
  });

  it("denies when permission codes are unavailable", () => {
    expect(
      canEditTerminalJobSchedulingFromCodes(false, undefined, JobType.TILING)
    ).toBe(false);
  });
});

describe("canEditCalendarScheduleForItem", () => {
  it("allows active job schedule edits with page write", () => {
    expect(
      canEditCalendarScheduleForItem({
        isAdmin: false,
        permissionsHydrated: true,
        hasRead: true,
        hasPageWrite: true,
        hasCompletedCanceledPageWrite: false,
        isTerminal: false,
        isLead: false,
      })
    ).toBe(true);
  });

  it("requires CO&CA write and job page write on terminal jobs", () => {
    expect(
      canEditCalendarScheduleForItem({
        isAdmin: false,
        permissionsHydrated: true,
        hasRead: true,
        hasPageWrite: true,
        hasCompletedCanceledPageWrite: false,
        isTerminal: true,
        isLead: false,
      })
    ).toBe(false);

    expect(
      canEditCalendarScheduleForItem({
        isAdmin: false,
        permissionsHydrated: true,
        hasRead: true,
        hasPageWrite: true,
        hasCompletedCanceledPageWrite: true,
        isTerminal: true,
        isLead: false,
      })
    ).toBe(true);
  });

  it("blocks terminal lead schedule edits", () => {
    expect(
      canEditCalendarScheduleForItem({
        isAdmin: true,
        permissionsHydrated: true,
        hasRead: true,
        hasPageWrite: true,
        hasCompletedCanceledPageWrite: true,
        isTerminal: true,
        isLead: true,
      })
    ).toBe(false);
  });

  it("allows admins to edit terminal job schedules", () => {
    expect(
      canEditCalendarScheduleForItem({
        isAdmin: true,
        permissionsHydrated: true,
        hasRead: true,
        hasPageWrite: false,
        hasCompletedCanceledPageWrite: false,
        isTerminal: true,
        isLead: false,
      })
    ).toBe(true);
  });

  it("denies when item is not readable", () => {
    expect(
      canEditCalendarScheduleForItem({
        isAdmin: false,
        permissionsHydrated: true,
        hasRead: false,
        hasPageWrite: true,
        hasCompletedCanceledPageWrite: true,
        isTerminal: false,
        isLead: false,
      })
    ).toBe(false);
  });
});

describe("permission resource keys parity", () => {
  it("uses the same completed canceled resource key as frontend v1", () => {
    expect(PERMISSION_RESOURCES.COMPLETED_CANCELED_PAGE).toBe(
      "completed_canceled_page"
    );
  });
});
