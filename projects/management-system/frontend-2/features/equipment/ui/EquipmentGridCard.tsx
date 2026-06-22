"use client";

import { Avatar, TableActions, TableGridCard } from "@fieldflow360/org-ui";

import type { EquipmentPageData } from "@/features/equipment";
import {
  EquipmentStatusBadge,
  getEquipmentTypeLabel,
} from "@/features/equipment";
import {
  type EquipmentOrgUiColumnHandlers,
  buildEquipmentTableActions,
} from "@/features/equipment/lib/columns";
import { formatTableLocaleDate } from "@/shared/lib/table/org-ui";

function getEquipmentName(equipment: EquipmentPageData): string {
  return equipment.machine_name || `Equipment #${equipment.id}`;
}

function getEquipmentImage(equipment: EquipmentPageData): string | undefined {
  return equipment.equipment_image ?? undefined;
}

export interface EquipmentGridCardProps {
  equipment: EquipmentPageData;
  handlers: EquipmentOrgUiColumnHandlers;
  selected: boolean;
  onSelectedChange: (selected: boolean) => void;
  selectable?: boolean;
  onDoubleClick?: () => void;
}

export function EquipmentGridCard({
  equipment,
  handlers,
  selected,
  onSelectedChange,
  selectable = false,
  onDoubleClick,
}: EquipmentGridCardProps) {
  const name = getEquipmentName(equipment);
  const imageUrl = getEquipmentImage(equipment);
  const typeLabel = getEquipmentTypeLabel(equipment.equipment_type);

  return (
    <div className="h-full cursor-pointer" onDoubleClick={onDoubleClick}>
      <TableGridCard
        actions={
          <TableActions
            actions={buildEquipmentTableActions(equipment, handlers)}
            item={equipment}
            maxVisibleActions={0}
          />
        }
        headerContent={`Last updated: ${formatTableLocaleDate(equipment.last_updated, "N/A")}`}
        selectable={selectable}
        selected={selected}
        title={
          <div className="flex min-w-0 items-center gap-2.5">
            <Avatar
              alt={name}
              fallback={name.slice(0, 1)}
              size={40}
              src={imageUrl}
            />
            <span className="truncate">{name}</span>
          </div>
        }
        onSelectedChange={onSelectedChange}
      >
        <dl className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <dt className="text-text-muted text-xs">Type</dt>
            <dd className="text-text-primary text-xs font-medium">
              {typeLabel}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="text-text-muted text-xs">Status</dt>
            <dd>
              <EquipmentStatusBadge serviceStatus={equipment.service_status} />
            </dd>
          </div>
        </dl>
      </TableGridCard>
    </div>
  );
}
