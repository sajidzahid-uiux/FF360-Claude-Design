import { describe, expect, it } from "vitest";

import { MaterialStatus } from "@/constants";

import { formatMaterialStatusLabel } from "../formatMaterialStatusLabel";

describe("formatMaterialStatusLabel", () => {
  it("returns empty string for null or blank", () => {
    expect(formatMaterialStatusLabel(null)).toBe("");
    expect(formatMaterialStatusLabel(undefined)).toBe("");
    expect(formatMaterialStatusLabel("")).toBe("");
    expect(formatMaterialStatusLabel("   ")).toBe("");
  });

  it("returns canonical labels for known status values", () => {
    expect(formatMaterialStatusLabel(MaterialStatus.DELIVERED)).toBe(
      "Delivered"
    );
    expect(formatMaterialStatusLabel(MaterialStatus.IN_PROGRESS)).toBe(
      "In Progress"
    );
  });

  it("returns raw value when unknown but non-empty", () => {
    expect(formatMaterialStatusLabel("Custom")).toBe("Custom");
  });
});
