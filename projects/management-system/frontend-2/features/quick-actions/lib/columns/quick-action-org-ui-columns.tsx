"use client";

import {
  type Column,
  Eye,
  type TableAction,
  TableActions,
  TableHeaderLabel,
  Trash2,
} from "@fieldflow360/org-ui";
import { Layers, Mail, Pencil, User } from "lucide-react";

import type { QuickAction } from "@/api/types";
import { CONVERSION_TYPE_LABELS } from "@/constants/enums";
import {
  orgUiTouchSlideTextColumn,
  tableActionsColumnShell,
} from "@/shared/lib/table/org-ui";
import { TableStatusBadge } from "@/shared/ui";

import {
  MODULE_BADGE_COLOR,
  UNCONVERTED_BADGE_COLOR,
  getQuickActionModules,
} from "../quickActionModules";
import {
  type QuickActionOrgUiColumnHandlers,
  buildQuickActionRowActions,
} from "./quick-action-org-ui-row-actions";

export type { QuickActionOrgUiColumnHandlers };

/** Module badge(s) for a quick action — shared by the list column and grid card. */
export function QuickActionModuleBadges({
  quickAction,
}: {
  quickAction: QuickAction;
}) {
  const modules = getQuickActionModules(quickAction);

  if (modules.length === 0) {
    return <TableStatusBadge color={UNCONVERTED_BADGE_COLOR} title="Unconverted" />;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {modules.map((type) => (
        <TableStatusBadge
          key={type}
          color={MODULE_BADGE_COLOR[type]}
          title={CONVERSION_TYPE_LABELS[type]}
        />
      ))}
    </div>
  );
}

export function buildQuickActionTableActions(
  quickAction: QuickAction,
  handlers: QuickActionOrgUiColumnHandlers
): TableAction<QuickAction>[] {
  const iconByKey = {
    view: <Eye aria-hidden className="h-4 w-4" strokeWidth={2} />,
    edit: <Pencil aria-hidden className="h-4 w-4" strokeWidth={2} />,
    delete: <Trash2 aria-hidden className="h-4 w-4" strokeWidth={2} />,
  } as const;

  return buildQuickActionRowActions(quickAction, handlers).map((action) => ({
    label: action.label,
    icon: iconByKey[action.key],
    variant: action.variant,
    onClick: action.onClick,
  }));
}

export function getQuickActionOrgUiColumns(
  handlers: QuickActionOrgUiColumnHandlers
): Column<QuickAction>[] {
  return [
    orgUiTouchSlideTextColumn<QuickAction>({
      key: "name",
      label: "Name",
      icon: User,
      sortable: true,
      width: "260px",
      maxWidth: "w-[240px]",
      getText: (quickAction) => quickAction.name,
      onDoubleClick: (quickAction) => handlers.onView(quickAction),
    }),
    orgUiTouchSlideTextColumn<QuickAction>({
      key: "phone_number",
      label: "Phone",
      sortable: true,
      width: "180px",
      maxWidth: "w-[160px]",
      truncateHeader: false,
      getText: (quickAction) => quickAction.phone_number,
    }),
    orgUiTouchSlideTextColumn<QuickAction>({
      key: "email",
      label: "Email",
      icon: Mail,
      sortable: true,
      width: "220px",
      maxWidth: "w-[200px]",
      truncateHeader: false,
      getText: (quickAction) => quickAction.email,
    }),
    {
      key: "module",
      label: "Module",
      header: <TableHeaderLabel icon={Layers} label="Module" />,
      width: "160px",
      render: (quickAction: QuickAction) => (
        <QuickActionModuleBadges quickAction={quickAction} />
      ),
    },
    {
      ...tableActionsColumnShell<QuickAction>({
        render: (quickAction) => (
          <TableActions
            actions={buildQuickActionTableActions(quickAction, handlers)}
            item={quickAction}
            maxVisibleActions={0}
          />
        ),
      }),
    },
  ];
}
