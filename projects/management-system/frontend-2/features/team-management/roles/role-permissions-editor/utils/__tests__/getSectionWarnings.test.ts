import { describe, expect, it } from "vitest";

import type { Permission } from "@/api/types";
import { PERMISSION_RESOURCES, permFor } from "@/hooks/permissions";

import { getSectionWarnings } from "../getSectionWarnings";

function permission(id: number, code: string): Permission {
  return {
    id,
    code,
    name: code,
    action_type: code.endsWith("_write")
      ? "write"
      : code.endsWith("_delete")
        ? "delete"
        : "read",
  };
}

describe("getSectionWarnings", () => {
  const permissions: Permission[] = [
    permission(
      1,
      permFor(PERMISSION_RESOURCES.COMPLETED_CANCELED_PAGE, "read")
    ),
    permission(
      2,
      permFor(PERMISSION_RESOURCES.COMPLETED_CANCELED_PAGE, "write")
    ),
    permission(3, permFor(PERMISSION_RESOURCES.JOBS_REPAIR_PAGE, "read")),
    permission(
      4,
      permFor(PERMISSION_RESOURCES.JOBS_REPAIR_EDIT_STATUS, "write")
    ),
    permission(5, permFor(PERMISSION_RESOURCES.TRASH_PAGE, "read")),
    permission(6, permFor(PERMISSION_RESOURCES.LEADS_PAGE, "read")),
  ];

  it("warns when CO&CA read is selected without any job read", () => {
    const warnings = getSectionWarnings(
      "completedCanceled",
      new Set([1]),
      permissions
    );
    expect(warnings[0]).toContain("at least one job type");
  });

  it("does not warn when CO&CA read and a job read are both selected", () => {
    expect(
      getSectionWarnings("completedCanceled", new Set([1, 3]), permissions)
    ).toEqual([]);
  });

  it("warns when CO&CA write is selected without full job access", () => {
    const warnings = getSectionWarnings(
      "completedCanceled",
      new Set([2]),
      permissions
    );
    expect(warnings[0]).toContain("edit status permission");
  });

  it("warns when trash read is selected without dependent read permissions", () => {
    const warnings = getSectionWarnings("trash", new Set([5]), permissions);
    expect(warnings[0]).toContain("Jobs");
    expect(warnings[0]).toContain("Equipment");
  });
});
