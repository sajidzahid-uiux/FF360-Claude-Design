"use client";

import { TableActions, TableGridCard } from "@fieldflow360/org-ui";

import type { TeamMember } from "@/api/types/team";
import type { EnrichedMaintenanceItem } from "@/features/maintenance";
import {
  type MaintenanceOrgUiColumnsOptions,
  buildMaintenanceTableActions,
  formatMaintenanceDate,
} from "@/features/maintenance/lib/columns";

function getAssignedLabel(
  item: EnrichedMaintenanceItem,
  userMap: Record<string | number, TeamMember["user"]>
): string {
  const assignedTo = (
    item as EnrichedMaintenanceItem & { assigned_to?: unknown }
  ).assigned_to;

  if (!Array.isArray(assignedTo) || assignedTo.length === 0) {
    return "Assigned to: Not assigned";
  }

  const first = assignedTo[0];
  const keyStr = String(first);
  const keyNum = Number(first);
  const user = userMap[keyStr] ?? userMap[keyNum];

  if (!user) {
    return "Assigned to: Unassigned";
  }

  const name = user.username || (user as { email?: string }).email || "Unknown";
  return `Assigned to: ${name}`;
}

function MaintenanceContactedValue({ contacted }: { contacted?: boolean }) {
  if (contacted) {
    return (
      <span className="font-semibold text-green-600 dark:text-green-400">
        Yes
      </span>
    );
  }

  return (
    <span className="font-semibold text-red-500 dark:text-red-400">No</span>
  );
}

export interface MaintenanceGridCardProps {
  item: EnrichedMaintenanceItem;
  handlers: Pick<MaintenanceOrgUiColumnsOptions, "isAdmin" | "onAction">;
  userMap: Record<string | number, TeamMember["user"]>;
  selected: boolean;
  onSelectedChange: (selected: boolean) => void;
  selectable?: boolean;
  onDoubleClick?: () => void;
}

export function MaintenanceGridCard({
  item,
  handlers,
  userMap,
  selected,
  onSelectedChange,
  selectable = false,
  onDoubleClick,
}: MaintenanceGridCardProps) {
  const title = item.equipment_name || "Unknown Equipment";
  const maintenanceContacted =
    item.service_contacted || item.maintenance_contacted;

  return (
    <div className="h-full cursor-pointer" onDoubleClick={onDoubleClick}>
      <TableGridCard
        actions={
          <TableActions
            actions={buildMaintenanceTableActions(item, handlers)}
            item={item}
            maxVisibleActions={0}
          />
        }
        headerContent={getAssignedLabel(item, userMap)}
        selectable={selectable}
        selected={selected}
        title={title}
        onSelectedChange={onSelectedChange}
      >
        <dl className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <dt className="text-text-muted text-xs">Maintenance Contacted</dt>
            <dd>
              <MaintenanceContactedValue contacted={maintenanceContacted} />
            </dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="text-text-muted text-xs">Date</dt>
            <dd className="text-text-primary text-xs font-medium">
              {formatMaintenanceDate(item)}
            </dd>
          </div>
        </dl>
      </TableGridCard>
    </div>
  );
}
