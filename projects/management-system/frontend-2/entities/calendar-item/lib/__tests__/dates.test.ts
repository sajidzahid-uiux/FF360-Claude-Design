import { describe, expect, it } from "vitest";

import { formatDateRange, toInputDate } from "../dates";

describe("toInputDate", () => {
  it("returns empty string for empty input", () => {
    expect(toInputDate("")).toBe("");
  });

  it("normalizes ISO datetime to yyyy-MM-dd", () => {
    expect(toInputDate("2026-04-03T14:30:00")).toBe("2026-04-03");
  });

  it("returns empty string for invalid ISO", () => {
    expect(toInputDate("not-a-date")).toBe("");
  });
});

describe("formatDateRange", () => {
  it("formats start and end with the default pattern", () => {
    expect(formatDateRange("2026-04-01", "2026-04-13")).toBe(
      "01 Apr 2026 - 13 Apr 2026"
    );
  });
});
