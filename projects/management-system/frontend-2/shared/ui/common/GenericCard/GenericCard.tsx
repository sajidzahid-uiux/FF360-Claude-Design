"use client";

import { useMemo } from "react";

import { Checkbox, cn } from "@fieldflow360/org-ui";

import { InlineEntityStatusDropdown } from "@/shared/ui/InlineEntityStatusDropdown";
import { Dropdown } from "@/shared/ui/common";
import {
  Card,
  CardContent,
  CardHeader,
  Progress,
} from "@/shared/ui/primitives";
import { TruncatedTitle } from "@/shared/ui/truncated";

import { GenericCardProps, GenericCardStatus } from "./types";

/**
 * StatusBadge - Renders a single status badge with color
 * If label contains ":", only shows the part after the colon
 */
function StatusBadge({ status }: { status: GenericCardStatus }) {
  // Extract the value part after colon (e.g., "Lead Source: New Lead" -> "New Lead")
  const displayLabel = status.label.includes(":")
    ? status.label.split(":")[1].trim()
    : status.label;

  return (
    <div
      className="overflow-hidden rounded-full px-3 py-1 text-xs text-white"
      style={{ backgroundColor: status.color }}
    >
      <span className="truncate">{displayLabel}</span>
    </div>
  );
}

/**
 * GenericCard - Configurable card component for grid views
 *
 * Provides a consistent layout for job, lead, equipment, maintenance, and other entity cards.
 * Supports title, subtitle, status badges, fields, progress, selection, and actions.
 */
function shouldRenderEditableStatus(
  status: GenericCardStatus,
  statusEditable: GenericCardProps["statusEditable"],
  isSingleStatus: boolean
): boolean {
  if (!statusEditable) return false;
  if (isSingleStatus) return true;
  if (!statusEditable.labelMatch) return false;
  return status.label.startsWith(statusEditable.labelMatch);
}

export function GenericCard({
  title,
  subtitle,
  status,
  statusEditable,
  fields = [],
  fieldsMinHeight,
  progress,
  leading,
  borderHighlight = false,
  borderColor = "#eab308",
  className,
  onClick,
  onDoubleClick,
  selected = false,
  onSelect,
  onDeselect,
  showCheckbox = false,
  checkboxDisabled = false,
  actionItems,
  metadata,
}: GenericCardProps) {
  // Normalize status to array for consistent rendering
  const statuses = useMemo(
    () => (status ? (Array.isArray(status) ? status : [status]) : []),
    [status]
  );

  const hasMinHeight = statuses.length > 0;

  return (
    <Card
      className={cn(
        "w-full overflow-hidden pt-2",
        hasMinHeight ? "min-h-[160px]" : "min-h-[100px]",
        borderHighlight && "border-2",
        selected && "ring-accent ring-2",
        className
      )}
      style={borderHighlight ? { borderColor } : undefined}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <CardHeader className="m-0 gap-0 overflow-hidden">
        {/* Header Row: Checkbox + Leading + Title + Dropdown */}
        <div className="flex items-center gap-1 overflow-hidden">
          {showCheckbox && (
            <Checkbox
              checked={selected}
              className="mr-1 h-4 w-4 flex-shrink-0"
              disabled={checkboxDisabled}
              onChange={(event) => {
                if (event.target.checked) {
                  onSelect?.();
                } else {
                  onDeselect?.();
                }
              }}
              onClick={(e) => e.stopPropagation()}
            />
          )}

          {leading && <div className="flex-shrink-0">{leading}</div>}

          <div className="flex-1 overflow-hidden">
            {typeof title === "string" ? (
              <TruncatedTitle title={title} />
            ) : (
              title
            )}
            {subtitle && (
              <div className="text-text-muted mt-0.5 text-xs">
                {typeof subtitle === "string" ? (
                  <span className="truncate">{subtitle}</span>
                ) : (
                  subtitle
                )}
              </div>
            )}
          </div>

          <div className="flex-shrink-0">
            <Dropdown align="end" items={actionItems} width={180} />
          </div>
        </div>

        {/* Metadata Row (e.g., "Last updated: ...") */}
        {metadata && (
          <div className="text-text-muted ml-6 flex flex-col gap-0.5 text-[11px]">
            {typeof metadata === "string" ? (
              <div className="flex items-center gap-1">
                <span>{metadata}</span>
              </div>
            ) : (
              metadata
            )}
          </div>
        )}

        {/* Progress Bar */}
        {progress && (
          <div className="ml-6 flex items-center gap-2">
            <Progress className="h-[10px] w-2/3" value={progress.value} />
            {progress.label && (
              <span className="text-text-muted text-[11px]">
                {progress.label}
              </span>
            )}
          </div>
        )}
      </CardHeader>

      {/* Content: Fields + Status Badges */}
      {(fields.length > 0 || statuses.length > 0) && (
        <CardContent className="overflow-hidden border-t pt-1">
          <div className={cn("flex flex-col", fieldsMinHeight)}>
            {fields.map((field, index) => {
              if (field.hideLabel) {
                return (
                  <div key={index} className="mt-1 min-w-0">
                    {field.value}
                  </div>
                );
              }

              const isStacked = field.layout === "stack";

              return (
                <div
                  key={index}
                  className={cn(
                    "mt-1 min-w-0",
                    isStacked
                      ? "flex flex-col gap-1"
                      : "flex min-h-[1.25rem] items-start gap-2"
                  )}
                >
                  <span className="shrink-0 text-sm font-normal">
                    {field.label}:
                  </span>
                  <span
                    className={cn(
                      "text-text-muted min-w-0 text-sm",
                      !isStacked && "flex-1",
                      typeof field.value === "string" && "truncate"
                    )}
                  >
                    {field.value}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Status Badges */}
          {statuses.length > 0 && (
            <div className="mt-2 flex flex-col items-stretch gap-2 overflow-hidden">
              {statuses.length === 1 ? (
                <div className="flex items-center gap-2">
                  <p className="shrink-0 text-sm font-normal">Status:</p>
                  {shouldRenderEditableStatus(
                    statuses[0],
                    statusEditable,
                    true
                  ) && statusEditable ? (
                    <InlineEntityStatusDropdown
                      currentStatus={statusEditable.currentStatus}
                      disabled={statusEditable.disabled}
                      statusTypes={statusEditable.statusTypes}
                      onStatusChange={statusEditable.onStatusChange}
                    />
                  ) : (
                    <StatusBadge status={statuses[0]} />
                  )}
                </div>
              ) : (
                <div className="flex items-start gap-4 overflow-hidden">
                  {statuses.map((s, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-start overflow-hidden"
                    >
                      <p className="text-sm font-normal">
                        {s.label.includes(":")
                          ? s.label.split(":")[0]
                          : "Status"}
                        :
                      </p>
                      {shouldRenderEditableStatus(s, statusEditable, false) &&
                      statusEditable ? (
                        <InlineEntityStatusDropdown
                          currentStatus={statusEditable.currentStatus}
                          disabled={statusEditable.disabled}
                          statusTypes={statusEditable.statusTypes}
                          onStatusChange={statusEditable.onStatusChange}
                        />
                      ) : (
                        <StatusBadge status={s} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
