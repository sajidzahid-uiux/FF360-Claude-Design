import type { TableAction } from "@fieldflow360/org-ui";
import { Archive, Pencil, RotateCcw } from "lucide-react";

import type { CrewGroupDetail } from "@/api/types";

export interface CrewGroupActionHandlers {
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (group: CrewGroupDetail) => void;
  onDeactivate: (group: CrewGroupDetail) => void;
  onReactivate: (group: CrewGroupDetail) => void;
}

export function buildCrewGroupTableActions(
  group: CrewGroupDetail,
  handlers: CrewGroupActionHandlers
): TableAction<CrewGroupDetail>[] {
  const { canEdit, canDelete, onEdit, onDeactivate, onReactivate } = handlers;
  const isActive = group.is_active ?? true;
  const isDefault = group.is_default ?? false;
  const actions: TableAction<CrewGroupDetail>[] = [];

  if (canEdit && isActive) {
    actions.push({
      label: "Edit group",
      icon: <Pencil aria-hidden className="h-4 w-4" strokeWidth={2} />,
      onClick: () => onEdit(group),
    });
  }

  const canManageActivation = isActive ? !isDefault && canDelete : canEdit;

  if (canManageActivation) {
    if (isActive) {
      actions.push({
        label: "Deactivate",
        variant: "danger",
        icon: <Archive aria-hidden className="h-4 w-4" strokeWidth={2} />,
        onClick: () => onDeactivate(group),
      });
    } else {
      actions.push({
        label: "Reactivate",
        icon: <RotateCcw aria-hidden className="h-4 w-4" strokeWidth={2} />,
        onClick: () => onReactivate(group),
      });
    }
  }

  return actions;
}
