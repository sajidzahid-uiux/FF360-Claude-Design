import { describe, expect, it } from "vitest";

import { getDashboardBentoColSpan } from "../bento-col-span";

describe("getDashboardBentoColSpan", () => {
  it("does not stretch a single chart across the full row", () => {
    expect(getDashboardBentoColSpan(0, 1)).not.toContain("col-span-4");
    expect(getDashboardBentoColSpan(0, 1)).toContain("xl:col-span-1");
  });

  it("does not stretch a lone last-row item across four columns", () => {
    expect(getDashboardBentoColSpan(4, 5)).not.toContain("col-span-4");
  });

  it("places two charts side by side on xl", () => {
    expect(getDashboardBentoColSpan(0, 2)).toContain("xl:col-span-2");
    expect(getDashboardBentoColSpan(1, 2)).toContain("xl:col-span-2");
  });
});
