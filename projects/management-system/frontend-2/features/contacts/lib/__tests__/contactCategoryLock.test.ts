import { describe, expect, it } from "vitest";

import {
  ensureLockedCategoryIds,
  getLockedClientContactCategoryIds,
} from "../contactCategoryLock";

describe("getLockedClientContactCategoryIds", () => {
  it("returns client contact id when present", () => {
    expect(
      getLockedClientContactCategoryIds([
        { id: 1, name: "Client Contact" },
        { id: 2, name: "Vendor" },
      ])
    ).toEqual([1]);
  });

  it("is case-insensitive for client contact name", () => {
    expect(
      getLockedClientContactCategoryIds([{ id: 5, name: "client contact" }])
    ).toEqual([5]);
  });

  it("returns empty array when client contact is absent", () => {
    expect(
      getLockedClientContactCategoryIds([{ id: 2, name: "Vendor" }])
    ).toEqual([]);
  });
});

describe("ensureLockedCategoryIds", () => {
  it("merges locked ids into category ids", () => {
    expect(ensureLockedCategoryIds([2, 3], [1])).toEqual([2, 3, 1]);
  });

  it("returns category ids unchanged when no locked ids", () => {
    expect(ensureLockedCategoryIds([2, 3], [])).toEqual([2, 3]);
  });
});
