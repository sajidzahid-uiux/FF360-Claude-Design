import Link from "next/link";
import { useMemo, useState } from "react";

import {
  type Column,
  TableDataModeEnum,
  TableHeaderLabel,
  TableToolbar,
  TableVariantEnum,
  useTablePreferences,
} from "@fieldflow360/org-ui";
import { Briefcase, Gauge, ListChecks, Tags } from "lucide-react";

import type { JobHistoryItem } from "@/api/types";
import { AssignedToFilterSelect } from "@/features/jobs";
import { useJobAssignedToFilter } from "@/features/jobs/hooks/useJobAssignedToFilter";
import { useJobHistory, useRouteIds } from "@/hooks";
import { orgPath } from "@/shared/config/routes";
import { formatContactWithFarm } from "@/shared/lib/formatContactWithFarm";
import { CmsOrgUiTable } from "@/shared/ui";
import { Progress } from "@/shared/ui/primitives";

export default function JobHistory({ contactId }: { contactId: number }) {
  const { filterActive } = useJobAssignedToFilter();
  const { data: jobHistory, isLoading, error } = useJobHistory(contactId);
  const { orgId } = useRouteIds();
  const [searchTerm, setSearchTerm] = useState("");

  const columns = useMemo(
    (): Column<JobHistoryItem>[] => [
      {
        key: "job_name",
        label: "Name",
        sortable: true,
        header: <TableHeaderLabel truncate icon={Briefcase} label="Name" />,
        render: (job) => {
          const url =
            job.job_type === "Tiling Job"
              ? orgPath(orgId, `/jobs/drainage-tiling/${job.id}`)
              : job.job_type === "Repair Job"
                ? orgPath(orgId, `/jobs/repair/${job.id}`)
                : orgPath(orgId, `/jobs/excavation/${job.id}`);

          const displayName = formatContactWithFarm(
            job.job_name,
            job.farm_name
          );

          return (
            <Link className="text-blue-300 underline" href={url}>
              {displayName}
            </Link>
          );
        },
      },
      {
        key: "job_type",
        label: "Type",
        header: <TableHeaderLabel truncate icon={Tags} label="Type" />,
        render: (job) => job.job_type,
      },
      {
        key: "job_status",
        label: "Status",
        header: <TableHeaderLabel truncate icon={ListChecks} label="Status" />,
        render: (job) => (
          <span
            className="rounded px-2 py-1 text-xs font-semibold text-white"
            style={{ backgroundColor: job.job_status_color }}
          >
            {job.job_status}
          </span>
        ),
      },
      {
        key: "job_progress",
        label: "Progress",
        header: <TableHeaderLabel truncate icon={Gauge} label="Progress" />,
        render: (job) => {
          const progress = job.job_progress;
          return (
            <div className="flex items-center gap-2">
              <Progress className="w-[100px]" value={progress.percentage} />{" "}
              <span>
                {progress.current_step}/{progress.total_steps}
              </span>
            </div>
          );
        },
      },
    ],
    [orgId]
  );

  const filteredJobHistory = useMemo(() => {
    const rows = jobHistory ?? [];
    const query = searchTerm.trim().toLowerCase();
    if (!query) return rows;

    return rows.filter((job) =>
      [job.job_name, job.job_type, job.job_status, job.farm_name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [jobHistory, searchTerm]);

  const tablePreferences = useTablePreferences(columns, {
    storageKey: orgId
      ? `contact-job-history-table-columns:${orgId}`
      : undefined,
    defaultVariant: TableVariantEnum.PLAIN,
  });

  const tableColumns = tablePreferences.applyColumns(columns);

  const search = useMemo(
    () => ({
      value: searchTerm,
      onChange: setSearchTerm,
      placeholder: "Search job history...",
    }),
    [searchTerm]
  );

  // Show loading state
  if (isLoading) {
    return (
      <div className="mt-6">
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-500">Loading job history...</div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="mt-6">
        <div className="flex items-center justify-center p-8">
          <div className="text-red-500">Error loading job history</div>
        </div>
      </div>
    );
  }

  // Show no jobs message if no jobs available
  if (!jobHistory || jobHistory.length === 0) {
    return (
      <div className="mt-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <AssignedToFilterSelect compact />
        </div>
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-500">
            {filterActive
              ? "No jobs found for the selected filter."
              : "No jobs available for this client."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <AssignedToFilterSelect compact />
      </div>
      <CmsOrgUiTable
        columns={tableColumns}
        data={filteredJobHistory}
        dataMode={TableDataModeEnum.CLIENT}
        emptyState={{
          title: "No job history found",
          description: filterActive
            ? "No jobs found for the selected filter."
            : "No jobs available for this client.",
        }}
        toolbar={
          <TableToolbar
            search={search}
            showViewSwitcher={false}
            sortableColumns={[{ key: "job_name", label: "Name" }]}
            tableSettings={tablePreferences.tableSettings}
            variant={tablePreferences.variant}
          />
        }
        variant={tablePreferences.variant}
      />
    </div>
  );
}
