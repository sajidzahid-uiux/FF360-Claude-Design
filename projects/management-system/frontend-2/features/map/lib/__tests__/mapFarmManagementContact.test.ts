import { describe, expect, it } from "vitest";

import { resolveMapFarmManagementContactName } from "../mapFarmManagementContact";

describe("resolveMapFarmManagementContactName", () => {
  it("returns primary name from farm_management_names", () => {
    expect(
      resolveMapFarmManagementContactName({
        farm_management_names: ["John Smith", "Other Mgmt"],
      })
    ).toBe("John Smith");
  });

  it("falls back to farm_management_contacts when names are missing", () => {
    expect(
      resolveMapFarmManagementContactName({
        farm_management_contacts: [
          { id: 1, full_name: "AgriCorp", phone_number: "555" },
        ],
      })
    ).toBe("AgriCorp");
  });

  it("returns null when no farm management data", () => {
    expect(resolveMapFarmManagementContactName({})).toBeNull();
  });
});
