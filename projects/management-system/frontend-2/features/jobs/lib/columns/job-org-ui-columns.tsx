"use client";

import { useMemo } from "react";

import {
  type Column,
  type TableAction,
  TableActions,
  TableHeaderLabel,
} from "@fieldflow360/org-ui";
import {
  Archive,
  Eye,
  FileClock,
  Gauge,
  Hash,
  ListChecks,
  MapPinned,
  Trash2,
  Undo2,
  User,
  Users,
} from "lucide-react";

import type { DesignRequestStatus, JobType, Status } from "@/api/types";
import { ClientsAndFarmsCell } from "@/features/contacts";
import { ON_SITE_OPERATIONS_LABEL } from "@/features/contacts/model/constants";
import { DesignRequestListStatusBadge } from "@/features/design-request";
import { formatMaterialStatusLabel } from "@/features/jobs/lib/formatMaterialStatusLabel";
import { JobStatusCell } from "@/features/jobs/ui/JobStatusCell";
import { useJobPermissions } from "@/hooks/permissions";
import { INLINE_TABLE_ROW_ACTIONS_PROPS } from "@/shared/lib/table/columns";
import {
  orgUiLastUpdatedWithUsernameColumn,
  orgUiPhoneColumn,
  resolveContactPhone,
} from "@/shared/lib/table/org-ui";
import { JobOrLeadListNameWithDescriptionCell } from "@/shared/ui";

import type { JobTableRow } from "./types";

export interface JobOrgUiColumnHandlers {
  isArchived?: boolean;
  jobType: JobType;
  statusTypes: Status[];
  getDesignRequestStatus?: (jobId: number) => DesignRequestStatus | undefined;
  onShowMore: (id: number, isArchived?: boolean) => void;
  onLogs?: (id: number, isArchived?: boolean) => void;
  onTrash: (id: number) => void;
  onUnarchive: (id: number) => void;
  onArchive: (id: number) => void;
  onOnSiteTracking?: (id: number) => void;
  designRequestStatusMap?: Map<number, DesignRequestStatus>;
}

function JobNameCell({
  job,
  designRequestStatus,
}: {
  job: JobTableRow;
  designRequestStatus?: DesignRequestStatus;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <JobOrLeadListNameWithDescriptionCell
        highlightClassName={job.on_hold ? "text-yellow-500" : ""}
        row={job}
        typeLabel="Job"
      />
      {designRequestStatus ? (
        <DesignRequestListStatusBadge status={designRequestStatus} />
      ) : null}
    </div>
  );
}

function ProgressCell({ progress }: { progress: string | null | undefined }) {
  const value = String(progress ?? "");
  const [current, total] = value.split("/").map(Number);
  const percent = total > 0 ? Math.min((current / total) * 100, 100) : 0;

  return (
    <div className="min-w-28">
      <div className="bg-bg-surface h-2 overflow-hidden rounded-full">
        <div
          className="bg-accent h-full rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-text-muted mt-1 block text-xs">
        {value || "N/A"}
      </span>
    </div>
  );
}

export function buildJobTableActions(
  job: JobTableRow,
  handlers: JobOrgUiColumnHandlers,
  permissions: { canEdit: boolean; canDelete: boolean }
): TableAction<JobTableRow>[] {
  const isArchived = Boolean(handlers.isArchived);
  const { canEdit, canDelete } = permissions;
  const viewActions: TableAction<JobTableRow>[] = [
    {
      label: "View details",
      icon: <Eye aria-hidden className="h-4 w-4" strokeWidth={2} />,
      onClick: () => handlers.onShowMore(job.id, isArchived),
    },
  ];

  if (handlers.onLogs) {
    viewActions.push({
      label: "View logs",
      icon: <FileClock aria-hidden className="h-4 w-4" strokeWidth={2} />,
      onClick: () => handlers.onLogs?.(job.id, isArchived),
    });
  }

  if (handlers.onOnSiteTracking && !isArchived) {
    viewActions.push({
      label: "On-site tracking",
      icon: <MapPinned aria-hidden className="h-4 w-4" strokeWidth={2} />,
      onClick: () => handlers.onOnSiteTracking?.(job.id),
    });
  }

  const manageActions: TableAction<JobTableRow>[] = [];

  if (isArchived) {
    if (canEdit) {
      manageActions.push({
        label: "Unarchive",
        icon: <Undo2 aria-hidden className="h-4 w-4" strokeWidth={2} />,
        onClick: () => handlers.onUnarchive(job.id),
      });
    }
    if (canDelete) {
      manageActions.push({
        label: "Move to Trash",
        icon: <Trash2 aria-hidden className="h-4 w-4" strokeWidth={2} />,
        variant: "danger",
        onClick: () => handlers.onTrash(job.id),
      });
    }
  } else {
    if (canEdit) {
      manageActions.push({
        label: "Archive",
        icon: <Archive aria-hidden className="h-4 w-4" strokeWidth={2} />,
        onClick: () => handlers.onArchive(job.id),
      });
    }
    if (canDelete) {
      manageActions.push({
        label: "Move to Trash",
        icon: <Trash2 aria-hidden className="h-4 w-4" strokeWidth={2} />,
        variant: "danger",
        onClick: () => handlers.onTrash(job.id),
      });
    }
  }

  if (manageActions.length === 0) {
    return viewActions;
  }

  return [...manageActions, ...viewActions];
}

function JobActionsCell({
  handlers,
  job,
}: {
  handlers: JobOrgUiColumnHandlers;
  job: JobTableRow;
}) {
  const { canEdit, canDelete } = useJobPermissions(handlers.jobType);
  const actions = useMemo(
    () => buildJobTableActions(job, handlers, { canEdit, canDelete }),
    [canDelete, canEdit, handlers, job]
  );

  return (
    <TableActions
      actions={actions}
      item={job}
      {...INLINE_TABLE_ROW_ACTIONS_PROPS}
    />
  );
}

export function resolveJobItemStatusKey(
  job: Pick<JobTableRow, "job_status">
): string {
  const value = job.job_status;
  if (value == null) return "";
  if (typeof value === "object") return String(value.id);
  return String(value);
}

export function getJobOrgUiColumns(
  handlers: JobOrgUiColumnHandlers
): Column<JobTableRow>[] {
  const columns: Column<JobTableRow>[] = [
    {
      key: "customer_name",
      label: "Job Name",
      sortable: true,
      header: <TableHeaderLabel truncate icon={User} label="Job Name" />,
      render: (job) => (
        <JobNameCell
          designRequestStatus={handlers.getDesignRequestStatus?.(job.id)}
          job={job}
        />
      ),
      width: "220px",
      cellClassName: "min-w-0 max-w-[220px]",
    },
    {
      key: "estimate_number",
      label: "Estimate Number",
      header: <TableHeaderLabel truncate icon={Hash} label="Estimate Number" />,
      render: (job) => (
        <span className="block truncate" title={String(job.estimate_number)}>
          {job.estimate_number || "N/A"}
        </span>
      ),
      width: "128px",
    },
  ];

  if (handlers.jobType === "drainage_tiling") {
    columns.push(
      {
        key: "topo",
        label: "Topo",
        header: "Topo",
        render: (job) => {
          if (job.topo === "Yes" || job.topo === "yes") return "Yes";
          if (job.topo === "No" || job.topo === "no") return "No";
          return "N/A";
        },
      },
      {
        key: "material_status",
        label: "Material Status",
        header: "Material Status",
        render: (job) =>
          formatMaterialStatusLabel(job.material_status) || "N/A",
      }
    );
  }

  columns.push(
    orgUiPhoneColumn<JobTableRow>({
      key: "contact_info",
      getPhone: (job) => resolveContactPhone(job.contact_info),
    }),
    {
      key: "clients_and_farms",
      label: `Clients and ${ON_SITE_OPERATIONS_LABEL}`,
      header: (
        <TableHeaderLabel
          truncate
          icon={Users}
          label={`Clients and ${ON_SITE_OPERATIONS_LABEL}`}
        />
      ),
      render: (job) => (
        <ClientsAndFarmsCell
          contactInfo={job.contact_info}
          farmName={job.farm_name}
        />
      ),
      width: "200px",
      cellClassName: "min-w-0",
    },
    {
      key: "job_status",
      label: "Job Status",
      header: (
        <TableHeaderLabel truncate icon={ListChecks} label="Job Status" />
      ),
      render: (job) => (
        <JobStatusCell
          isArchived={handlers.isArchived}
          job={job}
          jobType={handlers.jobType}
          statusTypes={handlers.statusTypes}
        />
      ),
      width: "136px",
    },
    {
      key: "progress_bar",
      label: "Job Progress",
      header: <TableHeaderLabel truncate icon={Gauge} label="Job Progress" />,
      render: (job) => (
        <ProgressCell progress={String(job.progress_bar ?? "")} />
      ),
      width: "140px",
    },
    orgUiLastUpdatedWithUsernameColumn<JobTableRow>({
      getDate: (job) => job.last_updated,
      getUsername: (job) => job.update_by_username,
    }),
    {
      key: "actions",
      label: "Actions",
      header: "",
      width: "11.5rem",
      align: "right",
      hideable: false,
      cellClassName: "min-w-0 overflow-visible",
      render: (job) => <JobActionsCell handlers={handlers} job={job} />,
    }
  );

  return columns;
}
