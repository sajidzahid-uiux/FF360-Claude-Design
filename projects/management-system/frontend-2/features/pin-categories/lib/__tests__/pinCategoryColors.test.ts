import { describe, expect, it } from "vitest";

import {
  DEFAULT_PIN_CATEGORY_COLOR,
  PIN_CATEGORY_COLOR_OPTIONS,
  canDeletePinCategory,
  getPinCategoryColorLabel,
  isValidPinCategoryColor,
} from "../pinCategoryColors";

describe("pinCategoryColors", () => {
  it("exposes eight preset color options", () => {
    expect(PIN_CATEGORY_COLOR_OPTIONS).toHaveLength(8);
    expect(DEFAULT_PIN_CATEGORY_COLOR).toBe("#6B7280");
  });

  it("resolves color labels case-insensitively", () => {
    expect(getPinCategoryColorLabel("#3b82f6")).toBe("Blue");
    expect(getPinCategoryColorLabel("#3B82F6")).toBe("Blue");
    expect(getPinCategoryColorLabel("6B7280")).toBe("Gray");
    expect(getPinCategoryColorLabel("#6B7280")).toBe("Gray");
    expect(getPinCategoryColorLabel("#808080")).toBe("Gray");
    expect(getPinCategoryColorLabel("808080")).toBe("Gray");
    expect(getPinCategoryColorLabel("#ABCDEF")).toBe("#ABCDEF");
  });

  it("validates preset colors only", () => {
    expect(isValidPinCategoryColor("#22C55E")).toBe(true);
    expect(isValidPinCategoryColor("#22c55e")).toBe(true);
    expect(isValidPinCategoryColor("#FFFFFF")).toBe(false);
  });

  it("blocks delete when pins are assigned", () => {
    expect(canDeletePinCategory(0)).toBe(true);
    expect(canDeletePinCategory(undefined)).toBe(true);
    expect(canDeletePinCategory(1)).toBe(false);
    expect(canDeletePinCategory(42)).toBe(false);
  });
});
