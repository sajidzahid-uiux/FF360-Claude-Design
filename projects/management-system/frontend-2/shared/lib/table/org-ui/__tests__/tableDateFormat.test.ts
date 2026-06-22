import { describe, expect, it } from "vitest";

import {
  formatTableDateIsoPart,
  formatTableIsoDate,
  formatTableLastUpdatedWithMemberId,
  formatTableLastUpdatedWithUsername,
  formatTableLocaleDate,
} from "../tableDateFormat";

describe("tableDateFormat", () => {
  it("formatTableLocaleDate returns locale date or empty label", () => {
    expect(formatTableLocaleDate("2024-06-15T12:00:00Z")).toMatch(/\d/);
    expect(formatTableLocaleDate(undefined)).toBe("—");
  });

  it("formatTableIsoDate returns yyyy-mm-dd", () => {
    expect(formatTableIsoDate("2024-06-15T12:00:00Z")).toBe("2024-06-15");
  });

  it("formatTableDateIsoPart splits ISO strings", () => {
    expect(formatTableDateIsoPart("2024-06-15T12:00:00Z")).toBe("2024-06-15");
    expect(formatTableDateIsoPart(undefined)).toBe("N/A");
  });

  it("formatTableLastUpdatedWithUsername appends username", () => {
    expect(
      formatTableLastUpdatedWithUsername("2024-06-15T12:00:00Z", "admin")
    ).toContain("admin");
  });

  it("formatTableLastUpdatedWithMemberId resolves team member username", () => {
    expect(
      formatTableLastUpdatedWithMemberId("2024-06-15T12:00:00Z", 1, [
        {
          id: 1,
          user: { username: "crew.lead" },
        } as never,
      ])
    ).toContain("crew.lead");
  });
});
