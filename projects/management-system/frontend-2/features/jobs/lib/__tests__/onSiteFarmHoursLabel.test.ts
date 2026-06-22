import { describe, expect, it } from "vitest";

import {
  formatOnSiteFarmAcreage,
  formatOnSiteFarmOptionLabel,
} from "@/features/jobs";

describe("formatOnSiteFarmAcreage", () => {
  it("formats acres in parentheses", () => {
    expect(formatOnSiteFarmAcreage(120)).toBe(" (120 acres)");
    expect(formatOnSiteFarmAcreage("45.5")).toBe(" (45.5 acres)");
  });

  it("returns empty when acreage is missing", () => {
    expect(formatOnSiteFarmAcreage(undefined)).toBe("");
    expect(formatOnSiteFarmAcreage("")).toBe("");
  });
});

describe("formatOnSiteFarmOptionLabel", () => {
  it("combines name and acreage", () => {
    expect(
      formatOnSiteFarmOptionLabel({
        id: 1,
        name: "North Field",
        contact_id: 2,
        is_primary: true,
        acreage: 80,
      })
    ).toBe("North Field (80 acres)");
  });
});
