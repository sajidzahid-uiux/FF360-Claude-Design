import { describe, expect, it } from "vitest";

import { isValidPermissionCode } from "@/utils/validation/securityValidation";

describe("isValidPermissionCode", () => {
  it("accepts resource_action codes used by the permissions system", () => {
    expect(isValidPermissionCode("jobs_repair_page_read")).toBe(true);
    expect(isValidPermissionCode("completed_canceled_page_write")).toBe(true);
    expect(isValidPermissionCode("contact_farm_tab_delete")).toBe(true);
  });

  it("rejects pseudo-codes and malformed values", () => {
    expect(isValidPermissionCode("is_admin")).toBe(false);
    expect(isValidPermissionCode("jobs_repair_page_edit")).toBe(false);
    expect(isValidPermissionCode("")).toBe(false);
  });

  it("accepts format-valid legacy codes (filtered later by resource allowlist)", () => {
    expect(isValidPermissionCode("equipment_read")).toBe(true);
  });
});
