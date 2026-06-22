import type { Maintenance, RecordEquipment, TeamMember } from "@/api/types";
import { buildRowActions } from "@/utils/actions";

import { GenericCardField, GenericCardProps } from "../types";

export type MaintenanceCardData = Pick<
  Maintenance,
  "id" | "date" | "assigned_to" | "service_contacted" | "equipment"
> & {
  equipment_name: string;
  equipment_data?: RecordEquipment;
  maintenance_contacted?: boolean;
};

export interface MaintenanceCardCallbacks {
  onAction: (action: string) => void;
  onSelect: (id: number) => void;
  onDeselect: (id: number) => void;
}

export interface MaintenanceCardOptions {
  selected: boolean;
  isAdmin: boolean;
  userMap?: Record<string | number, TeamMember["user"]>;
  equipmentMap?: RecordEquipment[];
}

/**
 * Maintenance card preset - generates GenericCard props from maintenance data
 */
export function getMaintenanceCardProps(
  data: MaintenanceCardData,
  callbacks: MaintenanceCardCallbacks,
  options: MaintenanceCardOptions
): GenericCardProps {
  const { onAction, onSelect, onDeselect } = callbacks;
  const { selected, isAdmin, userMap = {} } = options;

  // Get assigned user info
  const assignedId = data.assigned_to?.[0];
  const user = assignedId != null ? userMap[assignedId] : undefined;

  // Build subtitle with user info
  const subtitle = user?.username
    ? `Assigned to: ${user.username}`
    : "Assigned to: Unassigned";

  // Determine maintenance contacted status
  const maintenanceContacted =
    data.service_contacted || data.maintenance_contacted;

  // Build fields - return plain values, styling will be handled by the component
  const fields: GenericCardField[] = [
    {
      label: "Maintenance Contacted",
      value: maintenanceContacted ? "Yes" : "No",
    },
    {
      label: "Date",
      value: new Date(data.date).toLocaleString(),
    },
  ];

  // Build action items
  const actionItems = buildRowActions({
    canView: true,
    canDelete: isAdmin,
    canEdit: false,
    canArchive: false,
    canTrack: false,
    isArchived: false,
    onView: () => onAction("view"),
    onDelete: isAdmin ? () => onAction("delete") : undefined,
  });

  return {
    title: data.equipment_name || "Unknown Equipment",
    subtitle,
    fields,
    selected,
    onSelect: () => onSelect(data.id),
    onDeselect: () => onDeselect(data.id),
    showCheckbox: isAdmin,
    onDoubleClick: () => onAction("view"),
    actionItems,
  };
}
