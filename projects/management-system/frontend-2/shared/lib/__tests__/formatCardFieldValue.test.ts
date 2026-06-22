import { describe, expect, it } from "vitest";

import { formatCardFieldValue } from "../formatCardFieldValue";

describe("formatCardFieldValue", () => {
  it("returns N/A for empty values", () => {
    expect(formatCardFieldValue(null)).toBe("N/A");
    expect(formatCardFieldValue(undefined)).toBe("N/A");
    expect(formatCardFieldValue("")).toBe("N/A");
    expect(formatCardFieldValue("   ")).toBe("N/A");
  });

  it("returns short values unchanged", () => {
    expect(formatCardFieldValue("Short name")).toBe("Short name");
    expect(formatCardFieldValue(12345)).toBe("12345");
  });

  it("truncates values longer than 15 characters", () => {
    expect(formatCardFieldValue("abcdefghijklmnop")).toBe(
      "abcdefghijklmno ... "
    );
  });
});
