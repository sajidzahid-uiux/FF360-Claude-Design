import type { Job, JobStatus, Status } from "@/api/types";
import { JobType } from "@/constants";
import { ClientsAndFarmsCardField } from "@/features/contacts/ui";
import { formatMaterialStatusLabel } from "@/features/jobs/lib/formatMaterialStatusLabel";
import { formatCardFieldValue, getJobOrLeadListName } from "@/shared/lib";
import { isTerminalStatusTitle } from "@/shared/lib/filterExternalStatusOptions";
import { buildRowActions } from "@/utils/actions";

import { JOB_CARD_FIELDS_MIN_HEIGHT } from "../lib/cardFieldLayout";
import { optionalGenericCardTextField } from "../lib/optionalGenericCardTextField";
import { GenericCardField, GenericCardProps } from "../types";

function formatTopoCardValue(topo: string): string {
  if (topo === "Yes" || topo === "yes") return "Yes";
  if (topo === "No" || topo === "no") return "No";
  return topo.trim();
}

export type JobCardData = Pick<
  Job,
  | "id"
  | "description"
  | "po_number"
  | "contact_info"
  | "last_updated"
  | "update_by_username"
  | "progress_bar"
  | "on_hold"
  | "cancelled"
  | "farm_name"
  | "contacts_count"
  | "farms_count"
  | "estimate_number"
  | "topo"
  | "material_status"
> & {
  title?: Job["title"];
  job_status?: Pick<JobStatus, "id" | "title" | "color">;
};

function resolveJobCardCurrentStatus(
  jobStatus: NonNullable<JobCardData["job_status"]>,
  statusTypes: Status[]
): { id: number; title: string; color?: string } | undefined {
  if (jobStatus.id != null) {
    return {
      id: jobStatus.id,
      title: jobStatus.title,
      color: jobStatus.color,
    };
  }

  const matched = statusTypes.find(
    (status) => status.title === jobStatus.title
  );
  if (!matched) return undefined;

  return {
    id: matched.id,
    title: matched.title,
    color: matched.color ?? jobStatus.color,
  };
}

export interface JobCardCallbacks {
  onShowMore: () => void;
  onTrash: (id: number) => void;
  onArchive: (id: number) => void;
  onUnarchive: (id: number) => void;
  onSelect: (id: number) => void;
  onDeselect: (id: number) => void;
  onRowDoubleClick?: (id: number, isArchived: boolean) => void;
  onOnSiteTracking?: (id: number) => void;
  onLogs?: (id: number, isArchived?: boolean) => void;
}

export interface JobCardOptions {
  jobType: JobType;
  isArchived: boolean;
  isSelected: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canEditStatus?: boolean;
  statusTypes?: Status[];
  onStatusChange?: (statusId: number) => void;
}

/**
 * Job card preset - generates GenericCard props from job data
 */
export function getJobCardProps(
  data: JobCardData,
  callbacks: JobCardCallbacks,
  options: JobCardOptions
): GenericCardProps {
  const {
    onShowMore,
    onTrash,
    onArchive,
    onUnarchive,
    onSelect,
    onDeselect,
    onRowDoubleClick,
    onOnSiteTracking,
    onLogs,
  } = callbacks;

  const {
    jobType,
    isArchived,
    isSelected,
    canEdit,
    canDelete,
    canEditStatus = false,
    statusTypes = [],
    onStatusChange,
  } = options;

  const title = getJobOrLeadListName(data, "Job");
  const lastUpdated = data.last_updated
    ? new Date(data.last_updated).toLocaleDateString()
    : "";
  const updatedBy = data.update_by_username || "N/A";
  const phone =
    data.contact_info?.phone_number ||
    data.contact_info?.home_phone_number ||
    null;

  const fields: GenericCardField[] = [];

  if (jobType === JobType.TILING || jobType === JobType.EXCAVATION) {
    const estimateField = optionalGenericCardTextField(
      "Estimate Number",
      data.estimate_number
    );
    if (estimateField) fields.push(estimateField);
  }

  fields.push(
    ClientsAndFarmsCardField(
      data.contact_info,
      data.farm_name,
      data.contacts_count,
      data.farms_count
    )
  );

  const phoneField = optionalGenericCardTextField("Phone", phone);
  if (phoneField) fields.push(phoneField);

  if (jobType === JobType.TILING) {
    const topoField = data.topo?.trim()
      ? optionalGenericCardTextField("Topo", formatTopoCardValue(data.topo))
      : null;
    if (topoField) fields.push(topoField);

    const materialStatusLabel = formatMaterialStatusLabel(data.material_status);
    const materialField = optionalGenericCardTextField(
      "Material Status",
      materialStatusLabel
    );
    if (materialField) fields.push(materialField);
  }

  // Progress calculation
  let progress: GenericCardProps["progress"] = undefined;
  const pageNumber = String(data.progress_bar || "");
  if (pageNumber && pageNumber.includes("/")) {
    const [num, denom] = pageNumber.split("/").map(Number);
    if (!isNaN(num) && !isNaN(denom) && denom > 0) {
      progress = {
        value: (num / denom) * 100,
        label: pageNumber,
      };
    }
  }

  // Build action items
  const actionItems = buildRowActions({
    canView: true,
    canEdit: canEdit && !isArchived,
    canDelete,
    canArchive: canEdit,
    canTrack: !!onOnSiteTracking,
    isArchived,
    onView: onShowMore,
    onLogs: onLogs ? () => onLogs(data.id, isArchived) : undefined,
    onArchive: () => onArchive(data.id),
    onUnarchive: () => onUnarchive(data.id),
    onTrash: () => onTrash(data.id),
    onTrack: onOnSiteTracking ? () => onOnSiteTracking(data.id) : undefined,
  });

  const resolvedCurrentStatus = data.job_status
    ? resolveJobCardCurrentStatus(data.job_status, statusTypes)
    : undefined;

  return {
    title,
    status: data.job_status
      ? {
          label: data.job_status.title || "",
          color: data.job_status.color || "#ccc",
        }
      : undefined,
    statusEditable:
      resolvedCurrentStatus && onStatusChange && statusTypes.length > 0
        ? {
            statusTypes,
            currentStatus: resolvedCurrentStatus,
            onStatusChange,
            disabled:
              !canEditStatus ||
              isArchived ||
              data.cancelled === true ||
              isTerminalStatusTitle(resolvedCurrentStatus.title || ""),
          }
        : undefined,
    fields,
    fieldsMinHeight: JOB_CARD_FIELDS_MIN_HEIGHT[jobType],
    progress,
    metadata: `Last updated: ${lastUpdated} by ${formatCardFieldValue(updatedBy)}`,
    borderHighlight: data.on_hold,
    borderColor: "#eab308",
    selected: isSelected,
    onSelect: () => onSelect(data.id),
    onDeselect: () => onDeselect(data.id),
    showCheckbox: true,
    onDoubleClick: onRowDoubleClick
      ? () => onRowDoubleClick(data.id, isArchived)
      : undefined,
    actionItems,
  };
}
