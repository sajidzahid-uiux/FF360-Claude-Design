import type { Lead, Status, TeamMember } from "@/api/types";
import { ClientsAndFarmsCardField } from "@/features/contacts/ui";
import { formatCardFieldValue, getJobOrLeadListName } from "@/shared/lib";
import { buildRowActions } from "@/utils/actions";

import { LEAD_CARD_FIELDS_MIN_HEIGHT } from "../lib/cardFieldLayout";
import { optionalGenericCardTextField } from "../lib/optionalGenericCardTextField";
import {
  GenericCardField,
  GenericCardProps,
  GenericCardStatus,
} from "../types";

export type LeadCardData = Pick<
  Lead,
  | "id"
  | "title"
  | "description"
  | "po_number"
  | "farm_name"
  | "contacts_count"
  | "farms_count"
  | "contact_info"
  | "last_updated"
  | "estimate_number"
> & {
  last_updated_by?: number;
  lead_type?: Lead["lead_type"] | number;
  lead_status?:
    | Lead["lead_status"]
    | number
    | Pick<Status, "id" | "title" | "color">;
};

export interface LeadCardCallbacks {
  onShowMore: () => void;
  onLogs?: (id: number, isArchived?: boolean) => void;
  onTrash: (id: number) => void;
  onArchive: (id: number) => void;
  onUnarchive: (id: number) => void;
  onSelect: (id: number) => void;
  onDeselect: (id: number) => void;
  onRowDoubleClick?: (id: number, isArchived: boolean) => void;
}

export interface LeadCardOptions {
  isArchived: boolean;
  isSelected: boolean;
  readOnly: boolean;
  leadTypes?: Status[];
  leadStatuses?: Status[];
  teamData?: TeamMember[];
  onStatusChange?: (statusId: number) => void;
}

/**
 * Lead card preset - generates GenericCard props from lead data
 */
export function getLeadCardProps(
  data: LeadCardData,
  callbacks: LeadCardCallbacks,
  options: LeadCardOptions
): GenericCardProps {
  const {
    onShowMore,
    onLogs,
    onTrash,
    onArchive,
    onUnarchive,
    onSelect,
    onDeselect,
    onRowDoubleClick,
  } = callbacks;

  const {
    isArchived,
    isSelected,
    readOnly,
    leadTypes = [],
    leadStatuses = [],
    teamData = [],
    onStatusChange,
  } = options;

  const title = getJobOrLeadListName(data, "Lead");
  const phone =
    data.contact_info?.phone_number ||
    data.contact_info?.home_phone_number ||
    null;

  // Get lead type and status
  const leadTypeId =
    typeof data.lead_type === "object" ? data.lead_type?.id : data.lead_type;
  const leadType = leadTypes.find((t) => t.id === leadTypeId);
  const leadStatus =
    typeof data.lead_status === "object"
      ? data.lead_status
      : leadStatuses.find((s) => s.id === data.lead_status);

  // Get username for last updated
  const username =
    teamData.find((t) => t.id === data.last_updated_by)?.user?.username ||
    "N/A";

  const fields: GenericCardField[] = [];

  const estimateField = optionalGenericCardTextField(
    "Estimate Number",
    data.estimate_number
  );
  if (estimateField) fields.push(estimateField);

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

  // Build status badges
  const statuses: GenericCardStatus[] = [];
  if (leadType) {
    statuses.push({
      label: `Lead Source: ${leadType.title || ""}`,
      color: leadType.color || "#3b82f6",
    });
  }
  if (leadStatus) {
    statuses.push({
      label: `Lead Status: ${leadStatus.title || ""}`,
      color: leadStatus.color || "#3b82f6",
    });
  }

  // Build action items
  const actionItems = buildRowActions({
    canView: true,
    canEdit: !readOnly && !isArchived,
    canDelete: !readOnly,
    canArchive: !readOnly,
    canTrack: false,
    isArchived,
    onView: onShowMore,
    onLogs: onLogs ? () => onLogs(data.id, isArchived) : undefined,
    onTrash: () => onTrash(data.id),
    onArchive: () => onArchive(data.id),
    onUnarchive: () => onUnarchive(data.id),
  });

  const lastUpdatedDate = data.last_updated
    ? new Date(data.last_updated).toLocaleDateString()
    : "N/A";

  return {
    title,
    status: statuses,
    statusEditable:
      leadStatus && onStatusChange && leadStatuses.length > 0
        ? {
            statusTypes: leadStatuses,
            currentStatus: leadStatus,
            onStatusChange,
            disabled: readOnly || isArchived,
            labelMatch: "Lead Status",
          }
        : undefined,
    fields,
    fieldsMinHeight: LEAD_CARD_FIELDS_MIN_HEIGHT,
    metadata: `Last updated: ${lastUpdatedDate} by ${formatCardFieldValue(username)}`,
    selected: isSelected,
    onSelect: () => onSelect(data.id),
    onDeselect: () => onDeselect(data.id),
    showCheckbox: true,
    checkboxDisabled: readOnly,
    onDoubleClick: onRowDoubleClick
      ? () => onRowDoubleClick(data.id, isArchived)
      : undefined,
    actionItems,
  };
}
