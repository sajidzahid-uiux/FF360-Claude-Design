"use client";

import { useMemo } from "react";

import {
  TableDataModeEnum,
  TableVariantEnum,
  useTablePreferences,
} from "@fieldflow360/org-ui";

import type { LeadLogRow } from "@/features/activity-log";
import { getActivityLogOrgUiColumns } from "@/features/activity-log/lib/columns/activity-log-org-ui-columns";
import { CmsOrgUiTable } from "@/shared/ui";

export interface ActivityLogTableProps {
  rows: LeadLogRow[];
  isLoading?: boolean;
  storageKey?: string;
}

export function ActivityLogTable({
  rows,
  isLoading = false,
  storageKey,
}: ActivityLogTableProps) {
  const columns = useMemo(() => getActivityLogOrgUiColumns(), []);
  const tablePreferences = useTablePreferences(columns, {
    storageKey,
    defaultVariant: TableVariantEnum.PLAIN,
  });

  return (
    <CmsOrgUiTable
      compact
      className="max-h-none"
      columns={tablePreferences.applyColumns(columns)}
      data={rows}
      dataMode={TableDataModeEnum.CLIENT}
      emptyState={{
        title: "No activity yet",
        description: "Changes to this record will appear here.",
      }}
      isLoading={isLoading}
      variant={tablePreferences.variant}
    />
  );
}
