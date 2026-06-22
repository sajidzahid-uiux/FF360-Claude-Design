"use client";

import {
  type Column,
  Eye,
  type TableAction,
  TableActions,
  TableHeaderLabel,
  Trash2,
} from "@fieldflow360/org-ui";
import { Calendar, CheckCircle2, Users, Wrench } from "lucide-react";

import type { TeamMember } from "@/api/types/team";
import type { EnrichedMaintenanceItem } from "@/features/maintenance";
import { TouchSlideText } from "@/shared/ui/common";

// Normalize "assigned_to" which comes back as an array but with loose typing.
function getFirstAssignedMemberId(
  assignedTo: unknown
): string | number | undefined {
  if (!Array.isArray(assignedTo) || assignedTo.length === 0) return undefined;
  const first = assignedTo[0] as unknown;
  if (typeof first === "string" || typeof first === "number") return first;
  const asNumber = Number(first);
  return Number.isNaN(asNumber) ? undefined : asNumber;
}

export function formatMaintenanceDate(item: EnrichedMaintenanceItem): string {
  const raw = item.date;
  if (!raw) return "—";
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

export interface MaintenanceOrgUiColumnsOptions {
  userMap: Record<string | number, TeamMember["user"]>;
  isAdmin: boolean;
  onAction: (row: EnrichedMaintenanceItem, action: string) => void;
}

export function buildMaintenanceTableActions(
  item: EnrichedMaintenanceItem,
  {
    isAdmin,
    onAction,
  }: Pick<MaintenanceOrgUiColumnsOptions, "isAdmin" | "onAction">
): TableAction<EnrichedMaintenanceItem>[] {
  const base: TableAction<EnrichedMaintenanceItem>[] = [
    {
      label: "View",
      icon: <Eye aria-hidden className="h-4 w-4" strokeWidth={2} />,
      onClick: () => onAction(item, "view"),
    },
  ];

  if (!isAdmin) return base;

  return [
    ...base,
    {
      label: "Delete",
      icon: <Trash2 aria-hidden className="h-4 w-4" strokeWidth={2} />,
      variant: "danger",
      onClick: () => onAction(item, "delete"),
    },
  ];
}

export function getMaintenanceOrgUiColumns(
  options: MaintenanceOrgUiColumnsOptions
): Column<EnrichedMaintenanceItem>[] {
  const { userMap, isAdmin, onAction } = options;

  return [
    {
      key: "equipment_name",
      label: "Equipment Name",
      header: <TableHeaderLabel truncate icon={Wrench} label="Equipment" />,
      width: "320px",
      render: (row) => (
        <div
          className="cursor-default"
          onDoubleClick={() => onAction(row, "view")}
        >
          <TouchSlideText
            className="font-medium"
            maxWidth="w-[260px]"
            text={row.equipment_name || "Unknown Equipment"}
          />
        </div>
      ),
    },
    {
      key: "maintenance_contacted",
      label: "Maintenance Contacted",
      header: (
        <TableHeaderLabel
          truncate
          icon={CheckCircle2}
          label="Maintenance Contacted"
        />
      ),
      width: "200px",
      render: (row) =>
        row.service_contacted ? (
          <span className="font-semibold text-green-600 dark:text-green-400">
            Yes
          </span>
        ) : (
          <span className="font-semibold text-red-500 dark:text-red-400">
            No
          </span>
        ),
    },
    {
      key: "assigned_to",
      label: "Assigned to",
      header: <TableHeaderLabel truncate icon={Users} label="Assigned to" />,
      width: "220px",
      render: (row) => {
        const firstAssigned = getFirstAssignedMemberId(
          (row as EnrichedMaintenanceItem & { assigned_to?: unknown })
            .assigned_to
        );

        if (firstAssigned === undefined) {
          return <span className="text-text-muted">Not assigned</span>;
        }

        const keyStr = String(firstAssigned);
        const keyNum = Number(firstAssigned);
        const user = userMap[keyStr] ?? userMap[keyNum];

        if (!user) {
          return <span className="text-text-muted italic">Unassigned</span>;
        }

        const name =
          user.username || (user as { email?: string }).email || "Unknown";
        const profileImage = (user as { profile_image?: string }).profile_image;

        return (
          <div className="flex items-center gap-2">
            {profileImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt={name}
                className="h-7 w-7 rounded-full object-cover"
                src={profileImage}
              />
            ) : (
              <span className="bg-bg-surface inline-block h-7 w-7 rounded-full" />
            )}
            <span className="text-sm">{name}</span>
          </div>
        );
      },
    },
    {
      key: "date",
      label: "Date",
      header: <TableHeaderLabel truncate icon={Calendar} label="Date" />,
      width: "170px",
      render: (row) => (
        <span className="text-sm">{formatMaintenanceDate(row)}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      hideable: false,
      header: "",
      width: "90px",
      align: "right",
      render: (row) => (
        <TableActions
          actions={buildMaintenanceTableActions(row, { isAdmin, onAction })}
          item={row}
          maxVisibleActions={0}
        />
      ),
    },
  ];
}
