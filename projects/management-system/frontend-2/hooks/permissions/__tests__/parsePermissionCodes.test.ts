import { describe, expect, it } from "vitest";

import { PERMISSION_RESOURCES } from "../constants";
import { parsePermissionCodes } from "../parsePermissionCodes";

describe("parsePermissionCodes", () => {
  it("maps resource_action codes to read/write/delete flags", () => {
    expect(
      parsePermissionCodes([
        `${PERMISSION_RESOURCES.JOBS_REPAIR_PAGE}_read`,
        `${PERMISSION_RESOURCES.JOBS_REPAIR_PAGE}_write`,
        `${PERMISSION_RESOURCES.CONTACT_ACCESS}_delete`,
      ])
    ).toEqual({
      [PERMISSION_RESOURCES.JOBS_REPAIR_PAGE]: {
        read: true,
        write: true,
        delete: false,
      },
      [PERMISSION_RESOURCES.CONTACT_ACCESS]: {
        read: false,
        write: false,
        delete: true,
      },
    });
  });

  it("ignores invalid actions and unknown resources", () => {
    expect(
      parsePermissionCodes([
        "jobs_repair_page_edit",
        "unknown_resource_read",
        "not-a-permission",
        "equipment_read",
      ])
    ).toEqual({});
  });

  it("handles multi-segment resource names", () => {
    expect(
      parsePermissionCodes([
        `${PERMISSION_RESOURCES.COMPLETED_CANCELED_PAGE}_write`,
        `${PERMISSION_RESOURCES.JOBS_TILING_EQUIPMENT_MANAGEMENT}_delete`,
      ])
    ).toEqual({
      [PERMISSION_RESOURCES.COMPLETED_CANCELED_PAGE]: {
        read: false,
        write: true,
        delete: false,
      },
      [PERMISSION_RESOURCES.JOBS_TILING_EQUIPMENT_MANAGEMENT]: {
        read: false,
        write: false,
        delete: true,
      },
    });
  });

  it("returns an empty map for empty input", () => {
    expect(parsePermissionCodes([])).toEqual({});
  });
});
