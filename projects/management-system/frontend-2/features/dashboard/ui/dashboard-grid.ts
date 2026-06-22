/** Priority row: designs needed + job status by type (max two columns). */
export const dashboardPriorityRowClassName =
  "grid grid-cols-1 items-stretch gap-4 sm:gap-5 md:grid-cols-2";

/** Secondary widgets (lead sources, bookkeeping, etc.). */
export const dashboardBentoGridClassName =
  "grid grid-cols-1 items-start gap-4 sm:gap-5 md:grid-cols-2 md:grid-flow-dense xl:grid-cols-4 xl:grid-flow-dense";

/**
 * All permission-filtered charts in one row flow — avoids stacking when each
 * former section (bento / insights / metrics) only had one widget.
 */
export const dashboardChartsGridClassName =
  "grid items-start gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-[repeat(auto-fill,minmax(min(100%,20rem),1fr))]";

/** Metrics bar charts (total jobs, equipment). */
export const dashboardMetricsRowClassName =
  "grid grid-cols-1 items-start gap-4 sm:gap-5 sm:grid-cols-2 xl:grid-cols-2";

/** Job statistics charts share one row (pending approval, completed jobs, total jobs). */
export function dashboardJobStatisticsRowClassName(chartCount: number): string {
  return dashboardChartRowClassName(chartCount);
}

export function dashboardChartRowClassName(maxCols: number): string {
  const base = "grid grid-cols-1 items-start gap-4 sm:gap-5 sm:grid-cols-2";

  if (maxCols === 1) {
    return "grid grid-cols-1 items-start gap-4 sm:gap-5";
  }

  if (maxCols >= 4) {
    return `${base} xl:grid-cols-4 xl:grid-flow-dense`;
  }

  if (maxCols === 3) {
    return `${base} xl:grid-cols-3 xl:grid-flow-dense`;
  }

  return `${base} xl:grid-cols-2`;
}

/** @deprecated Merged into dashboardChartsGridClassName */
export const dashboardPairRowClassName = dashboardChartsGridClassName;

const chartCellMinHeight = "min-h-[300px] xl:min-h-[340px]";

/** Standard chart / table card in the bento or pair rows. */
export const dashboardBentoCell = `h-full w-full ${chartCellMinHeight}`;

/** Priority row cards share height; inner content scrolls instead of growing the row. */
export const dashboardPriorityCardClassName = `${dashboardBentoCell} max-h-[340px] overflow-hidden xl:max-h-[380px]`;

export const dashboardCellInvoice = "h-full min-h-[280px] w-full";

export const dashboardCellPair = `h-full w-full ${chartCellMinHeight}`;

/** When only one widget in a pair row, span full width */
export const dashboardCellPairSolo = `${dashboardCellPair} md:col-span-2`;

/** @deprecated Use dashboardBentoGridClassName */
export const dashboardGridClassName = dashboardBentoGridClassName;

/** @deprecated Use dashboardBentoCell */
export const dashboardCellThird = dashboardBentoCell;

/** @deprecated Use dashboardBentoCell */
export const dashboardCellQuarter = dashboardBentoCell;

/** @deprecated Use dashboardBentoCell */
export const dashboardCellPrimaryChart = dashboardBentoCell;

/** @deprecated Use dashboardBentoCell */
export const dashboardCellPrimaryChartWide = dashboardBentoCell;

/** @deprecated Use dashboardCellPair */
export const dashboardCellHalf = dashboardCellPair;
