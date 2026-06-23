"use client";

import { type ReactNode, memo, useMemo, useState } from "react";

import { TabsSwitcher, cn } from "@fieldflow360/org-ui";

import type { DashboardChartData } from "@/api/types";
import {
  type DashboardPeriod,
  DEFAULT_DASHBOARD_PERIOD,
} from "@/features/dashboard/hooks/useDashboardData";
import { useDashboardData, useInvoicesData } from "@/hooks";

import {
  DashboardAcreageTabsChart,
  EquipmentMetricsBarChart,
  InvoiceStatusRadialChart,
  JobStatusGroupedBarChart,
  JobsMetricsBarChart,
  LegendRadialChart,
  PendingApprovalBarChart,
} from "../charts";
import { DASHBOARD_CONSTANTS } from "../constants";
import {
  useDashboardDataFiltering,
  useDashboardPermissions,
} from "../permissions";
import { dataToDashboardData, hasBarCountData, hasLegendData } from "../utils";
import { DashboardInvoiceTable } from "./DashboardInvoiceTable";
import { DashboardLoading } from "./DashboardLoading";
import { DesignsNeededCard } from "./DesignsNeededCard";
import {
  dashboardBentoCell,
  dashboardCellInvoice,
  dashboardPriorityCardClassName,
} from "./dashboard-grid";

// Uniform 3-column bento. Goes 1 → 3 columns at `md` with no intermediate
// 2-col utility — mixing grid-cols-2 and grid-cols-3 hits a Tailwind ordering
// quirk in this build where the 2-col rule wins at every breakpoint.
const DASHBOARD_GRID_CLASS =
  "grid grid-cols-1 items-stretch gap-4 sm:gap-5 md:grid-cols-3 md:grid-flow-dense";

interface DashboardProps {
  className?: string;
}

interface DashboardBentoEntry {
  id: string;
  cellClass: string;
  content: ReactNode;
}

const DASHBOARD_PERIOD_ITEMS: { value: DashboardPeriod; label: string }[] = [
  { value: "current_month", label: "This Month" },
  { value: "all_time", label: "All Time" },
];

const Dashboard = memo(function Dashboard({ className }: DashboardProps) {
  const [period, setPeriod] = useState<DashboardPeriod>(
    DEFAULT_DASHBOARD_PERIOD
  );
  const { data, isLoading, error } = useDashboardData(period);

  const periodLabel = useMemo(() => {
    if (period === "all_time") return "All-time totals";
    return new Date().toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
  }, [period]);

  const {
    hasTilingJobAccess,
    hasRepairJobAccess,
    hasExcavationJobAccess,
    hasCompletedAccess,
    hasEquipmentAccess,
    hasLeadsAccess,
    hasAnyJobAccess,
    hasNoDashboardAccess,
    isAdmin,
    isBookkeeper,
    isLoading: permissionsLoading,
  } = useDashboardPermissions();

  const { data: invoices } = useInvoicesData({
    enabled: isBookkeeper,
  });

  const dashboardData = useMemo(() => {
    if (!data && (!invoices || invoices.length === 0)) return null;
    return dataToDashboardData(data, invoices || [], {
      hasLeadsAccess,
      hasRepairJobAccess,
      hasExcavationJobAccess,
      hasTilingJobAccess,
    });
  }, [
    data,
    invoices,
    hasLeadsAccess,
    hasRepairJobAccess,
    hasExcavationJobAccess,
    hasTilingJobAccess,
  ]);

  const {
    filteredJobStatusData,
    filteredPendingApprovalData,
    filteredLeadTypeData,
  } = useDashboardDataFiltering((dashboardData || {}) as DashboardChartData);

  const showDesignsPanel = hasAnyJobAccess || hasLeadsAccess;

  const showUserTypes =
    isAdmin &&
    !!dashboardData &&
    hasLegendData(dashboardData.userTypeData.legend);

  const showAcreageTabs = !!(
    data?.acreage_tabs?.farm_acres && data?.acreage_tabs?.leads_jobs_acres
  );

  const showAcreagePie =
    !!dashboardData &&
    !showAcreageTabs &&
    hasLegendData(dashboardData.acreTypeData.legend);

  const showAcreageSection =
    (hasTilingJobAccess || hasLeadsAccess) &&
    (showAcreageTabs || showAcreagePie);

  const showBookkeepingChart =
    (isAdmin || isBookkeeper) &&
    !!dashboardData &&
    hasLegendData({
      "Checked by Admin": dashboardData.invoiceStatusData.checkedByAdmin,
      "Sent to Client": dashboardData.invoiceStatusData.sentToClient,
      Paid: dashboardData.invoiceStatusData.paid,
    });

  const showCompletedJobsChart =
    hasCompletedAccess &&
    hasAnyJobAccess &&
    !!dashboardData &&
    hasLegendData(dashboardData.jobTypeData.legend);

  const showJobStatusChart = filteredJobStatusData.length > 0;

  const priorityEntries = useMemo((): DashboardBentoEntry[] => {
    if (!dashboardData) {
      return [];
    }

    const entries: DashboardBentoEntry[] = [];

    if (showDesignsPanel) {
      entries.push({
        id: "designs-needed",
        cellClass: dashboardPriorityCardClassName,
        content: (
          <DesignsNeededCard
            className="h-full min-h-0 w-full"
            data={dashboardData.designsData}
          />
        ),
      });
    }

    if (showJobStatusChart) {
      entries.push({
        id: "job-status",
        cellClass: dashboardPriorityCardClassName,
        content: (
          <JobStatusGroupedBarChart
            className="h-full min-h-0 w-full"
            data={filteredJobStatusData}
            title="Job Status by Type"
          />
        ),
      });
    }

    return entries;
  }, [
    dashboardData,
    filteredJobStatusData,
    showDesignsPanel,
    showJobStatusChart,
  ]);

  const bentoEntries = useMemo((): DashboardBentoEntry[] => {
    if (!dashboardData) {
      return [];
    }

    const entries: DashboardBentoEntry[] = [];

    if (hasLeadsAccess && hasLegendData(filteredLeadTypeData.legend)) {
      entries.push({
        id: "lead-sources",
        cellClass: dashboardBentoCell,
        content: (
          <LegendRadialChart
            legend={filteredLeadTypeData.legend as Record<string, number>}
            title={filteredLeadTypeData.title}
          />
        ),
      });
    }

    if (showBookkeepingChart) {
      entries.push({
        id: "bookkeeping",
        cellClass: dashboardBentoCell,
        content: (
          <InvoiceStatusRadialChart
            data={dashboardData.invoiceStatusData}
            title="Bookkeeping"
          />
        ),
      });
    }

    return entries;
  }, [
    dashboardData,
    filteredLeadTypeData,
    hasLeadsAccess,
    showBookkeepingChart,
  ]);

  const jobStatisticsEntries = useMemo((): DashboardBentoEntry[] => {
    if (!dashboardData) {
      return [];
    }

    const entries: DashboardBentoEntry[] = [];

    if (
      filteredPendingApprovalData.length > 0 &&
      hasBarCountData(filteredPendingApprovalData)
    ) {
      entries.push({
        id: "pending-approval",
        cellClass: dashboardBentoCell,
        content: (
          <PendingApprovalBarChart
            data={filteredPendingApprovalData}
            title="Pending Approval"
          />
        ),
      });
    }

    if (showCompletedJobsChart) {
      entries.push({
        id: "completed-jobs",
        cellClass: dashboardBentoCell,
        content: (
          <LegendRadialChart
            legend={dashboardData.jobTypeData.legend}
            title={dashboardData.jobTypeData.title}
          />
        ),
      });
    }

    if (hasAnyJobAccess) {
      entries.push({
        id: "total-jobs",
        cellClass: dashboardBentoCell,
        content: (
          <JobsMetricsBarChart
            sharedWithDesigners={dashboardData.jobsData.sharedWithDesigners}
            title="Total Jobs"
            totalJobs={dashboardData.jobsData.totalJobs}
          />
        ),
      });
    }

    return entries;
  }, [
    dashboardData,
    filteredPendingApprovalData,
    hasAnyJobAccess,
    showCompletedJobsChart,
  ]);

  const insightsEntries = useMemo((): DashboardBentoEntry[] => {
    if (!dashboardData) {
      return [];
    }

    const entries: DashboardBentoEntry[] = [];

    if (showUserTypes) {
      entries.push({
        id: "user-types",
        cellClass: dashboardBentoCell,
        content: (
          <LegendRadialChart
            legend={dashboardData.userTypeData.legend}
            title={dashboardData.userTypeData.title}
          />
        ),
      });
    }

    if (showAcreageSection && showAcreageTabs && data?.acreage_tabs) {
      entries.push({
        id: "acreage-tabs",
        cellClass: dashboardBentoCell,
        content: <DashboardAcreageTabsChart acreageTabs={data.acreage_tabs} />,
      });
    }

    if (showAcreageSection && showAcreagePie) {
      entries.push({
        id: "acreage-pie",
        cellClass: dashboardBentoCell,
        content: (
          <LegendRadialChart
            legend={dashboardData.acreTypeData.legend}
            title={dashboardData.acreTypeData.title}
          />
        ),
      });
    }

    return entries;
  }, [
    dashboardData,
    data?.acreage_tabs,
    showAcreagePie,
    showAcreageSection,
    showAcreageTabs,
    showUserTypes,
  ]);

  const metricsEntries = useMemo((): DashboardBentoEntry[] => {
    if (!dashboardData) {
      return [];
    }

    const entries: DashboardBentoEntry[] = [];

    if (hasEquipmentAccess) {
      entries.push({
        id: "total-equipment",
        cellClass: dashboardBentoCell,
        content: (
          <EquipmentMetricsBarChart
            inMaintenance={dashboardData.equipmentData.inMaintenance}
            nearingMaintenance={dashboardData.equipmentData.nearingMaintenance}
            title="Total Equipment"
            totalEquipment={dashboardData.equipmentData.totalEquipment}
          />
        ),
      });
    }

    return entries;
  }, [dashboardData, hasEquipmentAccess]);

  const contentEntries = useMemo(
    () => [
      ...priorityEntries,
      ...jobStatisticsEntries,
      ...bentoEntries,
      ...insightsEntries,
      ...metricsEntries,
    ],
    [
      priorityEntries,
      jobStatisticsEntries,
      bentoEntries,
      insightsEntries,
      metricsEntries,
    ]
  );

  if (isLoading || permissionsLoading) {
    return <DashboardLoading />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-500">
        Error: {error.message}
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-text-muted flex items-center justify-center p-8">
        {DASHBOARD_CONSTANTS.LOADING_MESSAGES.NO_DATA}
      </div>
    );
  }

  if (hasNoDashboardAccess) {
    return (
      <p className="text-text-muted flex items-center justify-center p-8">
        {DASHBOARD_CONSTANTS.LOADING_MESSAGES.NO_PERMISSION}
      </p>
    );
  }

  return (
    <div className={cn("space-y-5 pb-6", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-text-primary text-base font-semibold">
            Overview
          </span>
          <span className="text-text-muted text-sm">Showing {periodLabel}</span>
        </div>
        <TabsSwitcher
          items={DASHBOARD_PERIOD_ITEMS}
          value={period}
          onChange={setPeriod}
        />
      </div>

      {isBookkeeper && (
        <DashboardInvoiceTable
          className={dashboardCellInvoice}
          data={dashboardData.invoiceData}
        />
      )}

      {contentEntries.length > 0 && (
        <div className={DASHBOARD_GRID_CLASS}>
          {contentEntries.map((entry, index) => {
            // A single trailing card on the last row spans full width so it
            // doesn't leave the row visibly unbalanced in the 3-up grid.
            const remainder = contentEntries.length % 3;
            const isLast = index === contentEntries.length - 1;
            // Fill the last row so it doesn't leave empty columns in the 3-up
            // grid: a lone trailing card spans all 3; two trailing cards each
            // take 1 (the third column stays empty by design).
            const isLoneLastRow = isLast && remainder === 1;
            return (
              <div
                key={entry.id}
                className={cn(
                  entry.cellClass,
                  isLoneLastRow && "md:col-span-3"
                )}
              >
                {entry.content}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

Dashboard.displayName = "Dashboard";

export default Dashboard;
