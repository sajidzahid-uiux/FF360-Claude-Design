import type { ReactNode } from "react";

export const DASHBOARD_CHART_ROW_SIZES = [3, 4, 2] as const;

export interface DashboardGridEntry {
  id: string;
  cellClass: string;
  content: ReactNode;
}

export interface DashboardChartRow {
  entries: DashboardGridEntry[];
  maxCols: number;
}

export function partitionDashboardChartRows(
  entries: DashboardGridEntry[]
): DashboardChartRow[] {
  const rows: DashboardChartRow[] = [];
  let index = 0;

  for (const size of DASHBOARD_CHART_ROW_SIZES) {
    if (index >= entries.length) {
      break;
    }

    const slice = entries.slice(index, index + size);
    rows.push({
      entries: slice,
      maxCols: slice.length,
    });
    index += slice.length;
  }

  if (index < entries.length) {
    const slice = entries.slice(index);
    rows.push({
      entries: slice,
      maxCols: slice.length,
    });
  }

  return rows;
}
