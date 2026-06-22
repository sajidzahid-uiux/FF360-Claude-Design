import { describe, expect, it } from "vitest";

import { JobType, PermissionCode } from "@/constants";
import { PERMISSION_RESOURCES } from "@/hooks/permissions/constants";

import {
  checkFieldPermissions,
  checkPermissionFromAll,
  checkSectionPermissions,
} from "../permissions";

const contactCodes = [
  `${PERMISSION_RESOURCES.CONTACT_ACCESS}_read`,
  `${PERMISSION_RESOURCES.CONTACT_ACCESS}_write`,
];

describe("checkPermissionFromAll", () => {
  it("matches resource_action permission keys", () => {
    expect(
      checkPermissionFromAll(
        contactCodes,
        PERMISSION_RESOURCES.CONTACT_ACCESS,
        "read"
      )
    ).toBe(true);
    expect(
      checkPermissionFromAll(
        contactCodes,
        PERMISSION_RESOURCES.CONTACT_ACCESS,
        "delete"
      )
    ).toBe(false);
  });
});

describe("checkFieldPermissions", () => {
  it("allows access when no field permissions are configured", () => {
    expect(checkFieldPermissions(contactCodes, undefined, undefined)).toEqual({
      canRead: true,
      canWrite: true,
      shouldHide: false,
      shouldDisable: false,
    });
  });

  it("hides fields without read and disables without write by default", () => {
    expect(
      checkFieldPermissions(
        contactCodes,
        { read: "read", write: "write" },
        PERMISSION_RESOURCES.CONTACT_ACCESS
      )
    ).toEqual({
      canRead: true,
      canWrite: true,
      shouldHide: false,
      shouldDisable: false,
    });

    expect(
      checkFieldPermissions(
        [`${PERMISSION_RESOURCES.CONTACT_ACCESS}_read`],
        { read: "read", write: "write" },
        PERMISSION_RESOURCES.CONTACT_ACCESS
      )
    ).toEqual({
      canRead: true,
      canWrite: false,
      shouldHide: false,
      shouldDisable: true,
    });
  });

  it("respects hideIfNoRead and disableIfNoWrite overrides", () => {
    expect(
      checkFieldPermissions(
        [],
        {
          read: "read",
          write: "write",
          hideIfNoRead: false,
          disableIfNoWrite: false,
        },
        PERMISSION_RESOURCES.CONTACT_ACCESS
      )
    ).toEqual({
      canRead: false,
      canWrite: false,
      shouldHide: false,
      shouldDisable: false,
    });
  });
});

describe("checkSectionPermissions", () => {
  it("mirrors field permission defaults for sections", () => {
    expect(
      checkSectionPermissions(
        contactCodes,
        { read: "read", write: "write" },
        PERMISSION_RESOURCES.CONTACT_ACCESS
      )
    ).toEqual({
      canRead: true,
      canWrite: true,
      shouldHide: false,
      shouldDisable: false,
    });
  });
});

describe("job equipment permission codes parity", () => {
  it("maps repair equipment management codes like frontend v1", async () => {
    const { getJobEquipmentPermissionCodes } =
      await import("@/features/jobs/lib/jobEquipmentPermissions");

    expect(getJobEquipmentPermissionCodes(JobType.REPAIR)).toEqual({
      read: PermissionCode.JOBS_REPAIR_PAGE_READ,
      write: PermissionCode.JOBS_REPAIR_EQUIPMENT_MANAGEMENT_WRITE,
      delete: PermissionCode.JOBS_REPAIR_EQUIPMENT_MANAGEMENT_DELETE,
    });
  });
});
