import { describe, expect, it } from "vitest";

import { parseEntityId, tryParseEntityId } from "../parseEntityId";

describe("tryParseEntityId", () => {
  it("returns safe integers for numbers", () => {
    expect(tryParseEntityId(42)).toBe(42);
    expect(tryParseEntityId(0)).toBe(0);
  });

  it("rejects non-integer numbers", () => {
    expect(tryParseEntityId(1.5)).toBeNull();
    expect(tryParseEntityId(Number.NaN)).toBeNull();
    expect(tryParseEntityId(Number.POSITIVE_INFINITY)).toBeNull();
  });

  it("parses integer strings", () => {
    expect(tryParseEntityId("42")).toBe(42);
    expect(tryParseEntityId("  7  ")).toBe(7);
  });

  it("rejects empty, whitespace-only, and invalid strings", () => {
    expect(tryParseEntityId(null)).toBeNull();
    expect(tryParseEntityId(undefined)).toBeNull();
    expect(tryParseEntityId("")).toBeNull();
    expect(tryParseEntityId("   ")).toBeNull();
    expect(tryParseEntityId("abc")).toBeNull();
    expect(tryParseEntityId("1.5")).toBeNull();
    expect(tryParseEntityId("1e3")).toBeNull();
  });
});

describe("parseEntityId", () => {
  it("returns parsed safe integers", () => {
    expect(parseEntityId(99)).toBe(99);
    expect(parseEntityId("12")).toBe(12);
  });

  it("throws when id is required but missing", () => {
    expect(() => parseEntityId(null)).toThrow("id is required");
    expect(() => parseEntityId(undefined)).toThrow("id is required");
    expect(() => parseEntityId("")).toThrow("id is required");
    expect(() => parseEntityId("   ")).toThrow("id is required");
  });

  it("throws for invalid ids with custom field name", () => {
    expect(() => parseEntityId("1.5", "jobId")).toThrow("Invalid jobId");
    expect(() => parseEntityId("nope", "contactId")).toThrow(
      "Invalid contactId"
    );
  });
});
