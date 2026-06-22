"use client";

import { type ReactNode, memo, useMemo } from "react";

import { cn } from "@fieldflow360/org-ui";

import type { DashboardChartData } from "@/api/types";
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
  getDashboardPriorityColSpan,
  getDashboardRowColSpan,
} from "../lib/bento-col-span";
import { partitionDashboardChartRows } from "../lib/dashboard-chart-rows";
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
  dashboardChartRowClassName,
  dashboardJobStatisticsRowClassName,
  dashboardPriorityCardClassName,
  dashboardPriorityRowClassName,
} from "./dashboard-grid";

interface DashboardProps {
  className?: string;
}

interface DashboardBentoEntry {
  id: string;
  cellClass: string;
  content: ReactNode;
}

const Dashboard = memo(function Dashboard({ className }: DashboardProps) {
  const { data, isLoading, error } = useDashboardData();

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

  const secondaryChartEntries = useMemo(
    () => [...bentoEntries, ...insightsEntries, ...metricsEntries],
    [bentoEntries, insightsEntries, metricsEntries]
  );

  const secondaryChartRows = useMemo(
    () => partitionDashboardChartRows(secondaryChartEntries),
    [secondaryChartEntries]
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
      {isBookkeeper && (
        <DashboardInvoiceTable
          className={dashboardCellInvoice}
          data={dashboardData.invoiceData}
        />
      )}

      {priorityEntries.length > 0 && (
        <div className={dashboardPriorityRowClassName}>
          {priorityEntries.map((entry, index) => (
            <div
              key={entry.id}
              className={cn(
                entry.cellClass,
                getDashboardPriorityColSpan(index, priorityEntries.length)
              )}
            >
              {entry.content}
            </div>
          ))}
        </div>
      )}

      {jobStatisticsEntries.length > 0 && (
        <div
          className={dashboardJobStatisticsRowClassName(
            jobStatisticsEntries.length
          )}
        >
          {jobStatisticsEntries.map((entry, index) => (
            <div
              key={entry.id}
              className={cn(
                entry.cellClass,
                getDashboardRowColSpan(
                  index,
                  jobStatisticsEntries.length,
                  jobStatisticsEntries.length
                )
              )}
            >
              {entry.content}
            </div>
          ))}
        </div>
      )}

      {secondaryChartRows.length > 0 && (
        <div className="space-y-5">
          {secondaryChartRows.map((row) => (
            <div
              key={row.entries.map((entry) => entry.id).join("-")}
              className={dashboardChartRowClassName(row.maxCols)}
            >
              {row.entries.map((entry, index) => (
                <div
                  key={entry.id}
                  className={cn(
                    entry.cellClass,
                    getDashboardRowColSpan(
                      index,
                      row.entries.length,
                      row.maxCols
                    )
                  )}
                >
                  {entry.content}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

Dashboard.displayName = "Dashboard";

export default Dashboard;
