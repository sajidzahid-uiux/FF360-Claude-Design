import { describe, expect, it } from "vitest";

import type { Contact } from "@/api/types";

import {
  buildContactTableRows,
  isFarmManagementContact,
  toggleExpandedParentId,
} from "../contactTableRows";

const farmParent: Contact = {
  id: 1,
  full_name: "AgriCorp",
  contact_subtype: "farm_management",
  categories: [],
  created_at: "2025-01-01T00:00:00Z",
  sub_contacts: [
    {
      id: 10,
      full_name: "John Farm",
      categories: [{ id: 1, name: "Client Contact", color: "#f00" }],
      created_at: "2025-01-02T00:00:00Z",
    },
    {
      id: 11,
      full_name: "Jane Farm",
      categories: [{ id: 1, name: "Client Contact", color: "#f00" }],
      created_at: "2025-01-03T00:00:00Z",
    },
  ],
};

const standardContact: Contact = {
  id: 2,
  full_name: "Single Person",
  contact_subtype: "standard",
  categories: [],
  created_at: "2025-01-01T00:00:00Z",
};

describe("contactTableRows", () => {
  it("isFarmManagementContact detects subtype", () => {
    expect(isFarmManagementContact(farmParent)).toBe(true);
    expect(isFarmManagementContact(standardContact)).toBe(false);
  });

  it("buildContactTableRows shows only parent when collapsed", () => {
    const rows = buildContactTableRows(
      [farmParent, standardContact],
      new Set()
    );
    expect(rows).toHaveLength(2);
    expect(rows[0].rowKind).toBe("parent");
    expect(rows[0].isExpandable).toBe(true);
    expect(rows.find((r) => r.rowKind === "sub")).toBeUndefined();
  });

  it("buildContactTableRows injects sub-rows when expanded", () => {
    const rows = buildContactTableRows([farmParent], new Set([1]));
    expect(rows).toHaveLength(3);
    expect(rows[1].rowKind).toBe("sub");
    expect(rows[1].parentId).toBe(1);
    expect(rows[1].full_name).toBe("John Farm");
    expect(rows[2].full_name).toBe("Jane Farm");
  });

  it("toggleExpandedParentId adds and removes ids", () => {
    let set = toggleExpandedParentId(new Set(), 1);
    expect(set.has(1)).toBe(true);
    set = toggleExpandedParentId(set, 1);
    expect(set.has(1)).toBe(false);
  });
});
