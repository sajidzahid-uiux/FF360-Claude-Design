"use client";

import {
  Avatar,
  type Column,
  Eye,
  type TableAction,
  TableActions,
  TableHeaderLabel,
  Trash2,
} from "@fieldflow360/org-ui";
import { CalendarClock, FileClock, Tag, Wrench } from "lucide-react";

import type { EquipmentPageData } from "@/features/equipment";
import {
  EquipmentStatusBadge,
  getEquipmentDisplayName,
  getEquipmentTypeLabel,
} from "@/features/equipment";
import {
  orgUiLocaleDateColumn,
  tableActionsColumnShell,
} from "@/shared/lib/table/org-ui";
import { TouchSlideText } from "@/shared/ui/common";

export interface EquipmentOrgUiColumnHandlers {
  canViewEquipment: boolean;
  canDeleteEquipment: boolean;
  onView: (equipment: EquipmentPageData) => void;
  onDelete: (equipment: EquipmentPageData) => void;
  onLogs: (equipment: EquipmentPageData) => void;
}

function getEquipmentImage(equipment: EquipmentPageData): string | undefined {
  return equipment.equipment_image ?? undefined;
}

export function buildEquipmentTableActions(
  equipment: EquipmentPageData,
  handlers: EquipmentOrgUiColumnHandlers
): TableAction<EquipmentPageData>[] {
  const actions: TableAction<EquipmentPageData>[] = [];

  if (handlers.canViewEquipment) {
    actions.push(
      {
        label: "View details",
        icon: <Eye aria-hidden className="h-4 w-4" strokeWidth={2} />,
        onClick: () => handlers.onView(equipment),
      },
      {
        label: "View logs",
        icon: <FileClock aria-hidden className="h-4 w-4" strokeWidth={2} />,
        onClick: () => handlers.onLogs(equipment),
      }
    );
  }

  if (handlers.canDeleteEquipment) {
    actions.push({
      label: "Move to Trash",
      icon: <Trash2 aria-hidden className="h-4 w-4" strokeWidth={2} />,
      variant: "danger",
      onClick: () => handlers.onDelete(equipment),
    });
  }

  return actions;
}

export function getEquipmentOrgUiColumns(
  handlers: EquipmentOrgUiColumnHandlers
): Column<EquipmentPageData>[] {
  return [
    {
      key: "machine_name",
      label: "Name",
      sortable: true,
      header: <TableHeaderLabel truncate icon={<Wrench />} label="Name" />,
      width: "320px",
      render: (equipment) => {
        const name = getEquipmentDisplayName(equipment);
        return (
          <div
            className="flex cursor-pointer items-center gap-3"
            role="button"
            tabIndex={0}
            onClick={() => handlers.onView(equipment)}
            onDoubleClick={() => handlers.onView(equipment)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handlers.onView(equipment);
              }
            }}
          >
            <Avatar
              alt={name}
              fallback={name.slice(0, 1)}
              size={44}
              src={getEquipmentImage(equipment)}
            />
            <TouchSlideText
              className="font-medium"
              maxWidth="w-[220px]"
              text={name}
            />
          </div>
        );
      },
    },
    {
      key: "equipment_type",
      label: "Type",
      header: <TableHeaderLabel icon={<Tag />} label="Type" />,
      width: "150px",
      render: (equipment) => getEquipmentTypeLabel(equipment.equipment_type),
    },
    {
      key: "service_status",
      label: "Status",
      header: <TableHeaderLabel icon={<Wrench />} label="Status" />,
      width: "150px",
      render: (equipment) => (
        <EquipmentStatusBadge serviceStatus={equipment.service_status} />
      ),
    },
    orgUiLocaleDateColumn<EquipmentPageData>({
      key: "last_updated",
      label: "Last Updated",
      icon: CalendarClock,
      width: "170px",
      getValue: (equipment) => equipment.last_updated,
    }),
    {
      ...tableActionsColumnShell<EquipmentPageData>({
        width: "90px",
        render: (equipment) => (
          <TableActions
            actions={buildEquipmentTableActions(equipment, handlers)}
            item={equipment}
            maxVisibleActions={0}
          />
        ),
      }),
    },
  ];
}
