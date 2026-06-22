"use client";

import { useMemo } from "react";

import { cn } from "@fieldflow360/org-ui";
import {
  addDays,
  differenceInCalendarDays,
  endOfWeek,
  format,
  getDate,
  getDaysInMonth,
  parseISO,
} from "date-fns";

import { ResourceType } from "@/constants";
import {
  type CalendarItem,
  KIND_LABEL,
  Pill,
  ProjectTypeBadge,
  STATUS_BG_CLASS,
  calendarItemHasProjectType,
  computeBarPosition,
  computeBarPositionInWeek,
  getCalendarItemCardDisplayLines,
  onActivation,
} from "@/entities/calendar-item";
import type { CalendarTimelineScale } from "@/features/calendar-view-switch";

export interface MobileTimelineListProps {
  items: CalendarItem[];
  /** Active month (used when scale === "month"). */
  activeMonth: Date;
  /** Active week start (used when scale === "week"). */
  weekStart: Date;
  scale: CalendarTimelineScale;
  onItemClick?: (item: CalendarItem) => void;
  className?: string;
}

export function MobileTimelineList({
  items,
  activeMonth,
  weekStart,
  scale,
  onItemClick,
  className,
}: MobileTimelineListProps) {
  return (
    <div
      className={cn("bg-bg-app flex flex-col gap-3 px-4 py-3 pb-6", className)}
    >
      {items.map((item) => (
        <MobileTimelineCard
          key={item.id}
          activeMonth={activeMonth}
          item={item}
          scale={scale}
          weekStart={weekStart}
          onClick={onItemClick}
        />
      ))}
    </div>
  );
}

interface MobileTimelineCardProps {
  item: CalendarItem;
  activeMonth: Date;
  weekStart: Date;
  scale: CalendarTimelineScale;
  onClick?: (item: CalendarItem) => void;
}

function MobileTimelineCard({
  item,
  activeMonth,
  weekStart,
  scale,
  onClick,
}: MobileTimelineCardProps) {
  const start = useMemo(() => parseISO(item.startDate), [item.startDate]);
  const end = useMemo(() => parseISO(item.endDate), [item.endDate]);
  const duration = useMemo(
    () => Math.max(1, differenceInCalendarDays(end, start) + 1),
    [end, start]
  );

  const position = useMemo(
    () =>
      scale === "week"
        ? computeBarPositionInWeek(item, weekStart)
        : computeBarPosition(item, activeMonth),
    [item, scale, weekStart, activeMonth]
  );

  const axisLabels = useMemo(
    () => buildAxisLabels(scale, activeMonth, weekStart),
    [scale, activeMonth, weekStart]
  );

  const { primaryLine, subtitleLine } = useMemo(
    () => getCalendarItemCardDisplayLines(item),
    [item]
  );

  const handleClick = onClick ? () => onClick(item) : undefined;
  const isInteractive = Boolean(handleClick);

  return (
    <div
      aria-label={isInteractive ? `View details for ${primaryLine}` : undefined}
      className={cn(
        "border-border-subtle bg-bg-surface-elevated rounded-[12px] border p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.06)]",
        isInteractive &&
          "hover:bg-bg-surface/50 cursor-pointer transition-colors"
      )}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={handleClick ? onActivation(handleClick) : undefined}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <Pill
          colorOverride={item.workflowStatus.color}
          size="pill"
          tone={item.workflowStatus.tone}
        >
          {item.workflowStatus.label}
        </Pill>
        <Pill size="pill" tone={item.kind}>
          {KIND_LABEL[item.kind]}
        </Pill>
        <Pill className="capitalize" size="pill" tone="outlined">
          {item.category}
        </Pill>
        {calendarItemHasProjectType(item) ? (
          <ProjectTypeBadge
            color={item.projectType.color}
            name={item.projectType.name}
            size="pill"
          />
        ) : null}
        {item.kind === ResourceType.LEAD && item.leadSource ? (
          <Pill size="pill" tone="outlined">
            {item.leadSource}
          </Pill>
        ) : null}
        {item.pattern ? (
          <Pill size="pill" tone="outlined">
            {item.pattern}
          </Pill>
        ) : null}
      </div>

      <h3 className="text-text-primary mt-2 text-[16px] leading-6 font-bold">
        {primaryLine}
      </h3>
      {subtitleLine ? (
        <p className="text-text-muted mt-0.5 text-[13px] leading-5">
          {subtitleLine}
        </p>
      ) : null}

      <div className="bg-bg-surface/40 mt-3 rounded-[8px] p-3">
        <div className="text-text-muted flex items-center justify-between text-[12px] leading-5">
          <span>{format(start, "MMM d")}</span>
          <span className="text-text-primary font-medium">
            {duration} {duration === 1 ? "day" : "days"}
          </span>
          <span>{format(end, "MMM d")}</span>
        </div>

        <div className="bg-bg-surface relative mt-2 h-[6px] w-full overflow-hidden rounded-full">
          {position.visible ? (
            <span
              className={cn(
                "absolute top-0 h-full rounded-full",
                STATUS_BG_CLASS[item.barStatus]
              )}
              style={{
                left: `${position.leftPct}%`,
                width: `${position.widthPct}%`,
              }}
            />
          ) : null}
        </div>

        <div className="text-text-muted mt-2 flex items-center justify-between text-[10px] leading-4">
          {axisLabels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Five evenly-spaced day-of-month markers across the active range.
 * - month: 1, 8, 15, 22, last-day
 * - week: the seven day-of-month numbers (we'll show first/middle/last to keep it readable)
 */
function buildAxisLabels(
  scale: CalendarTimelineScale,
  activeMonth: Date,
  weekStart: Date
): string[] {
  if (scale === "month") {
    const lastDay = getDaysInMonth(activeMonth);
    return ["1", "8", "15", "22", String(lastDay)];
  }
  const start = weekStart;
  const end = endOfWeek(weekStart, { weekStartsOn: 0 });
  return [
    String(getDate(start)),
    String(getDate(addDays(start, 2))),
    String(getDate(addDays(start, 3))),
    String(getDate(addDays(start, 5))),
    String(getDate(end)),
  ];
}
