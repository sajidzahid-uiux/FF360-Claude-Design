"use client";

import { type MouseEvent, memo } from "react";

import { TableActions, TableGridCard } from "@fieldflow360/org-ui";

import type { QuickAction } from "@/api/types";
import {
  type QuickActionOrgUiColumnHandlers,
  QuickActionModuleBadges,
  buildQuickActionTableActions,
} from "@/features/quick-actions/lib/columns";
import {
  getQuickActionDisplaySubtitle,
  getQuickActionDisplayTitle,
} from "@/features/quick-actions/lib/getQuickActionDisplayTitle";
import { INLINE_TABLE_ROW_ACTIONS_PROPS } from "@/shared/lib/table/columns";
import { isInteractiveRowTarget } from "@/shared/lib/table/row-activation";

export interface QuickActionGridCardProps {
  quickAction: QuickAction;
  handlers: QuickActionOrgUiColumnHandlers;
  selected: boolean;
  onSelectedChange: (selected: boolean) => void;
  selectable?: boolean;
  /** Navigate into the quick action's detail view (single click on the card body). */
  onActivate?: () => void;
}

export const QuickActionGridCard = memo(function QuickActionGridCard({
  quickAction,
  handlers,
  selected,
  onSelectedChange,
  selectable = false,
  onActivate,
}: QuickActionGridCardProps) {
  const title = getQuickActionDisplayTitle(quickAction);
  const subtitle = getQuickActionDisplaySubtitle(quickAction);
  const phone = quickAction.phone_number?.trim() || "N/A";
  const email = quickAction.email?.trim() || "N/A";

  const handleActivate = (event: MouseEvent<HTMLDivElement>) => {
    if (!onActivate || isInteractiveRowTarget(event.target)) return;
    onActivate();
  };

  return (
    <div
      className="h-full cursor-pointer"
      role={onActivate ? "button" : undefined}
      tabIndex={onActivate ? 0 : undefined}
      onClick={handleActivate}
      onKeyDown={(event) => {
        if (!onActivate) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onActivate();
        }
      }}
    >
      <TableGridCard
        actions={
          <TableActions
            actions={buildQuickActionTableActions(quickAction, handlers)}
            item={quickAction}
            {...INLINE_TABLE_ROW_ACTIONS_PROPS}
          />
        }
        headerContent={
          subtitle ? <p className="text-text-muted truncate">{subtitle}</p> : undefined
        }
        selectable={selectable}
        selected={selected}
        title={title}
        onSelectedChange={onSelectedChange}
      >
        <dl className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <dt className="text-text-muted text-xs">Phone</dt>
            <dd className="text-text-primary text-xs font-medium tabular-nums">
              {phone}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="text-text-muted text-xs">Email</dt>
            <dd className="text-text-primary min-w-0 truncate text-xs font-medium">
              {email}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="text-text-muted text-xs">Module</dt>
            <dd>
              <QuickActionModuleBadges quickAction={quickAction} />
            </dd>
          </div>
        </dl>
      </TableGridCard>
    </div>
  );
});
