// Main Dashboard Feature Export
export { default as Dashboard } from "./ui/Dashboard";

// Domain Exports
export {
  DashboardAcreageTabsChart,
  DashboardChartCard,
  EquipmentMetricsBarChart,
  InvoiceStatusRadialChart,
  JobStatusGroupedBarChart,
  JobsMetricsBarChart,
  LegendRadialChart,
  PendingApprovalBarChart,
  mapLegendToRadialData,
} from "./charts";
export type {
  DashboardAcreageTabsChartProps,
  EquipmentMetricsBarChartProps,
  InvoiceStatusChartData,
  InvoiceStatusRadialChartProps,
  JobStatusChartRow,
  JobStatusGroupedBarChartProps,
  JobsMetricsBarChartProps,
  LegendRadialChartProps,
  PendingApprovalBarChartProps,
} from "./charts";
export { ACREAGE_LEGEND_LABELS } from "./model";
export type { AcreageTabId } from "./model";
export { useDesignsTableNavigation } from "./hooks";
export type { DesignNavigationTarget } from "./hooks";
export {
  useDashboardDataFiltering,
  useDashboardPermissions,
} from "./permissions";

// Utils
export {
  canOpenDesignsNeededRow,
  dataToDashboardData,
  hasBarCountData,
  hasLegendData,
  hrefFromDetailApiPath,
  inferDesignHref,
  isDesignsNeededApiRow,
  isDesignsNeededLegacyTuple,
  legendForAcreageTab,
  parseDesignEntryId,
  parseMsOrganizationsDetailPath,
} from "./utils";
export type {
  DesignsNavPermissions,
  DesignsNeededByYouApiRow,
  DesignsNeededEntry,
} from "./utils";

// Constants
export { DASHBOARD_CONSTANTS, DASHBOARD_QUERY_KEYS } from "./constants";
