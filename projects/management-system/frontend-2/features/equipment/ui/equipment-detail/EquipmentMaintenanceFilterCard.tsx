"use client";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  Input,
  type TableAction,
  TableActions,
  cn,
} from "@fieldflow360/org-ui";
import { Pencil, Trash2, Wrench } from "lucide-react";

export interface EquipmentMaintenanceFilterCardProps {
  title: string;
  lastChanged: string | number;
  threshold: string | number;
  countdown: string | number;
  maintenanceRequired: boolean;
  filterNumber?: string | null;
  usageUnitLabel: string;
  isEditing?: boolean;
  disabled?: boolean;
  canWrite?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  onChange?: (
    field: "lastChanged" | "threshold" | "filterNumber",
    value: string
  ) => void;
  currentUsage: number;
}

export function EquipmentMaintenanceFilterCard({
  title,
  lastChanged,
  threshold,
  countdown,
  maintenanceRequired,
  filterNumber,
  usageUnitLabel,
  isEditing = false,

  canWrite = true,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  onChange,
  currentUsage,
}: EquipmentMaintenanceFilterCardProps) {
  const actions: TableAction<{ id: string }>[] = [];

  if (canWrite && onEdit && !isEditing) {
    actions.push({
      label: "Edit",
      icon: <Pencil aria-hidden className="h-4 w-4" strokeWidth={2} />,
      onClick: () => onEdit(),
    });
  }
  if (canWrite && onDelete) {
    actions.push({
      label: "Remove",
      icon: <Trash2 aria-hidden className="h-4 w-4" strokeWidth={2} />,
      variant: "danger",
      onClick: () => onDelete(),
    });
  }

  return (
    <div
      className={cn(
        "border-border-subtle bg-bg-app flex flex-col gap-2.5 rounded-lg border p-3",
        maintenanceRequired && "border-feedback-error/80"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Wrench
            aria-hidden
            className="text-text-muted h-3.5 w-3.5 shrink-0"
          />
          <span className="text-text-primary truncate text-xs font-semibold">
            {title}
          </span>
          {maintenanceRequired ? (
            <span className="bg-feedback-error text-text-inverse shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium">
              Due
            </span>
          ) : null}
        </div>
        {actions.length > 0 ? (
          <TableActions actions={actions} item={{ id: title }} />
        ) : null}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Input
              label="Filter #"
              placeholder="Optional"
              size={ComponentSizeEnum.SM}
              value={filterNumber ?? ""}
              onChange={(e) => onChange?.("filterNumber", e.target.value)}
            />
            <Input
              label={`Last (${usageUnitLabel})`}
              max={currentUsage}
              placeholder="Last"
              size={ComponentSizeEnum.SM}
              type="number"
              value={String(lastChanged)}
              onChange={(e) => {
                const next = e.target.value;
                if (Number(next) <= currentUsage) {
                  onChange?.("lastChanged", next);
                }
              }}
            />
            <Input
              label="Threshold"
              min={0}
              placeholder="Limit"
              size={ComponentSizeEnum.SM}
              type="number"
              value={String(threshold)}
              onChange={(e) => onChange?.("threshold", e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-1">
            <Button
              aria-label="Cancel"
              size={ComponentSizeEnum.SM}
              title="Cancel"
              variant={ButtonVariantEnum.GHOST}
              onClick={onCancel}
            />
            <Button
              aria-label="Save"
              size={ComponentSizeEnum.SM}
              title="Save"
              onClick={onSave}
            />
          </div>
        </div>
      ) : (
        <>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
            <dt className="text-text-muted">Filter #</dt>
            <dd className="text-text-primary text-right font-medium">
              {filterNumber || "—"}
            </dd>
            <dt className="text-text-muted">Last changed</dt>
            <dd className="text-text-primary text-right font-medium tabular-nums">
              {lastChanged} {usageUnitLabel}
            </dd>
            <dt className="text-text-muted">Threshold</dt>
            <dd className="text-text-primary text-right font-medium tabular-nums">
              {threshold} {usageUnitLabel}
            </dd>
            <dt className="text-text-muted">Countdown</dt>
            <dd
              className={cn(
                "text-right font-medium tabular-nums",
                Number(countdown) < 0
                  ? "text-feedback-error"
                  : "text-text-primary"
              )}
            >
              {countdown} {usageUnitLabel}
            </dd>
          </dl>
          <p
            className={cn(
              "text-xs font-medium",
              maintenanceRequired ? "text-feedback-error" : "text-text-muted"
            )}
          >
            Maintenance required: {maintenanceRequired ? "Yes" : "No"}
          </p>
        </>
      )}
    </div>
  );
}
