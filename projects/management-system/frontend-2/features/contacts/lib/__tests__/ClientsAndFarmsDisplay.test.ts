import { describe, expect, it } from "vitest";

import type { ContactInfo } from "@/api/types";

import {
  buildClientsAndFarmsDisplay,
  buildClientsAndFarmsInlineSegments,
  buildClientsAndFarmsInlineText,
  truncateClientsAndFarmsLabel,
} from "../ClientsAndFarmsDisplay";

const standardContact: ContactInfo = {
  id: 1,
  full_name: "Ed Sheeran",
  phone_number: "555",
  email: "ed@example.com",
  contact_subtype: "standard",
};

describe("buildClientsAndFarmsDisplay", () => {
  it("returns N/A when contact is missing", () => {
    expect(buildClientsAndFarmsDisplay({})).toMatchObject({
      contactPrimary: "N/A",
      hasContact: false,
      showFarmRow: false,
    });
  });

  it("shows standard contact and farm", () => {
    expect(
      buildClientsAndFarmsDisplay({
        contactInfo: standardContact,
        farmName: "UK Orchard 34",
      })
    ).toMatchObject({
      contactPrimary: "Ed Sheeran",
      farmPrimary: "UK Orchard 34",
      showFarmRow: true,
      isFarmManagementContact: false,
    });
  });

  it("shows farm management row above client for standard sub-contact", () => {
    expect(
      buildClientsAndFarmsDisplay({
        contactInfo: {
          ...standardContact,
          farm_management_names: ["AgriCorp", "Other Farm Mgmt"],
        },
        farmName: "Field A",
      })
    ).toMatchObject({
      farmManagementPrimary: "AgriCorp",
      farmManagementExtraCount: 1,
      showFarmManagementRow: true,
      contactPrimary: "Ed Sheeran",
      contactExtraCount: 0,
      showFarmRow: true,
      farmPrimary: "Field A",
      isFarmManagementContact: false,
    });
  });

  it("uses API contacts_count and farms_count for +N badges", () => {
    expect(
      buildClientsAndFarmsDisplay({
        contactInfo: standardContact,
        farmName: "North 80",
        contactsCount: 3,
        farmsCount: 2,
      })
    ).toMatchObject({
      contactExtraCount: 2,
      farmExtraCount: 1,
    });
  });

  it("hides farm row for farm management contact and counts labels from farm_management_names", () => {
    expect(
      buildClientsAndFarmsDisplay({
        contactInfo: {
          id: 45,
          full_name: "Tylor Swift",
          phone_number: "555",
          email: "t@example.com",
          contact_subtype: "farm_management",
          farm_management_names: ["Sub A", "Sub B", "Sub C"],
        },
        farmName: "Should Not Show",
      })
    ).toMatchObject({
      contactPrimary: "Tylor Swift",
      contactExtraCount: 3,
      showFarmRow: false,
      isFarmManagementContact: true,
    });
  });
});

describe("buildClientsAndFarmsInlineText", () => {
  it("joins farm management, contact, and farm with +N counts", () => {
    const display = buildClientsAndFarmsDisplay({
      contactInfo: {
        ...standardContact,
        farm_management_names: ["AgriCorp", "Other Farm Mgmt"],
      },
      farmName: "Field A",
      contactsCount: 3,
      farmsCount: 2,
    });
    expect(buildClientsAndFarmsInlineText(display)).toBe(
      "AgriCorp +1 · Ed Sheeran +2 · Field A +1"
    );
  });

  it("returns N/A when contact is missing", () => {
    expect(
      buildClientsAndFarmsInlineText(buildClientsAndFarmsDisplay({}))
    ).toBe("N/A");
  });

  it("builds ordered inline segments with extra counts", () => {
    const display = buildClientsAndFarmsDisplay({
      contactInfo: {
        ...standardContact,
        farm_management_names: ["AgriCorp", "Other Farm Mgmt"],
      },
      farmName: "Field A",
      contactsCount: 3,
      farmsCount: 2,
    });
    expect(buildClientsAndFarmsInlineSegments(display)).toEqual([
      {
        kind: "farm_management",
        primary: "AgriCorp",
        extraCount: 1,
      },
      {
        kind: "contact",
        primary: "Ed Sheeran",
        extraCount: 2,
      },
      {
        kind: "farm",
        primary: "Field A",
        extraCount: 1,
      },
    ]);
  });

  it("shows farm management contact with sub-contact count only", () => {
    const display = buildClientsAndFarmsDisplay({
      contactInfo: {
        id: 45,
        full_name: "Tylor Swift",
        phone_number: "555",
        email: "t@example.com",
        contact_subtype: "farm_management",
        farm_management_names: ["Sub A", "Sub B", "Sub C"],
      },
    });
    expect(buildClientsAndFarmsInlineText(display)).toBe("Tylor Swift +3");
  });
});

describe("truncateClientsAndFarmsLabel", () => {
  it("truncates long labels", () => {
    expect(truncateClientsAndFarmsLabel("USA Farm 21 Long Name Here")).toBe(
      "USA Farm 21 Long Nam..."
    );
  });
});
