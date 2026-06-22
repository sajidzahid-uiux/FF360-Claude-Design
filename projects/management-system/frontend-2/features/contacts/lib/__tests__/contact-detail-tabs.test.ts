import { describe, expect, it } from "vitest";

import type { ContactCategory } from "@/api/types";
import {
  CONTACT_DETAIL_TAB_CONTACT,
  CONTACT_DETAIL_TAB_FARMS,
  CONTACT_DETAIL_TAB_JOBS,
  FARM_CONTACT_INFO_TAB,
  SUB_CONTACTS_TAB,
  getContactDetailTabs,
  isClientContact,
} from "@/features/contacts/lib";

const clientCategories: ContactCategory[] = [
  {
    id: 1,
    name: "Client Contact",
    color: "#f00",
    is_default: true,
  },
];

const vendorCategories: ContactCategory[] = [
  {
    id: 2,
    name: "Vendor",
    color: "#0f0",
    is_default: false,
  },
];

describe("getContactDetailTabs", () => {
  it("shows only contact tab for non-client contacts", () => {
    expect(getContactDetailTabs(vendorCategories, ["read"])).toEqual([
      CONTACT_DETAIL_TAB_CONTACT,
    ]);
  });

  it("includes farms only when user has farm read permission", () => {
    expect(getContactDetailTabs(clientCategories, [])).toEqual([
      CONTACT_DETAIL_TAB_CONTACT,
      CONTACT_DETAIL_TAB_JOBS,
    ]);

    expect(getContactDetailTabs(clientCategories, ["read"])).toEqual([
      CONTACT_DETAIL_TAB_CONTACT,
      CONTACT_DETAIL_TAB_FARMS,
      CONTACT_DETAIL_TAB_JOBS,
    ]);
  });

  it("shows FM contact tabs when contact is farm management", () => {
    expect(
      getContactDetailTabs(vendorCategories, [], { isFarmManagement: true })
    ).toEqual([
      FARM_CONTACT_INFO_TAB,
      SUB_CONTACTS_TAB,
      CONTACT_DETAIL_TAB_JOBS,
    ]);
  });
});

describe("isClientContact", () => {
  it("detects client contact category by exact name", () => {
    expect(isClientContact(clientCategories)).toBe(true);
    expect(isClientContact(vendorCategories)).toBe(false);
  });
});
