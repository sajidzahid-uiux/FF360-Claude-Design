import { describe, expect, it } from "vitest";

import { partitionDashboardChartRows } from "../dashboard-chart-rows";

function ids(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: `chart-${index}`,
    cellClass: "cell",
    content: null,
  }));
}

describe("partitionDashboardChartRows", () => {
  it("uses row column count matching visible widgets (no empty grid slots)", () => {
    const rows = partitionDashboardChartRows(ids(5));

    expect(rows).toHaveLength(2);
    expect(rows[0].entries).toHaveLength(3);
    expect(rows[0].maxCols).toBe(3);
    expect(rows[1].entries).toHaveLength(2);
    expect(rows[1].maxCols).toBe(2);
  });

  it("gives a lone remainder chart a full-width row", () => {
    const rows = partitionDashboardChartRows(ids(4));

    expect(rows[1].entries).toHaveLength(1);
    expect(rows[1].maxCols).toBe(1);
  });

  it("fills a full second row when seven charts are visible", () => {
    const rows = partitionDashboardChartRows(ids(7));

    expect(rows[1].entries).toHaveLength(4);
    expect(rows[1].maxCols).toBe(4);
  });
});
