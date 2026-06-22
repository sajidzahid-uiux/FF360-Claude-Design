"use client";

import { useMemo } from "react";

import { cn } from "@fieldflow360/org-ui";
import { cva } from "class-variance-authority";

import {
  type BarPosition,
  type CalendarItem,
  STATUS_LABEL_TEXT,
  formatCalendarItemPrimaryLabel,
  formatDateRange,
  onActivation,
} from "@/entities/calendar-item";

/**
 * Frame surface — solid status color for active states, white-with-border for
 * the completed state per Figma 43:8467.
 */
const frameVariants = cva(
  "absolute z-40 flex flex-col gap-px rounded-[7px] py-[5px] pl-2 pr-1 shadow-[0_2px_4px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.1)]",
  {
    variants: {
      status: {
        overdue: "bg-feedback-error",
        inprogress: "bg-accent-blue-bold",
        completed: "bg-accent-green-deep",
        lead: "bg-accent-orange-bright",
        not_started: "bg-accent-neutral-mid",
      },
      interactive: {
        true: "cursor-pointer transition-opacity hover:opacity-90",
        false: "",
      },
    },
  }
);

/**
 * Status label pill — inverted contrast on colored frames (white surface +
 * status text); colored surface + white text on the completed (white) frame.
 */
const labelPillVariants = cva(
  "inline-flex h-3 w-fit items-center justify-center rounded-[4px] px-1 text-[8.5px] leading-none font-semibold tracking-[0.1px] whitespace-nowrap",
  {
    variants: {
      status: {
        overdue: "bg-white text-feedback-error",
        inprogress: "bg-white text-accent-blue-bold",
        completed: "bg-white text-accent-green-deep",
        lead: "bg-white text-accent-orange-bright",
        not_started: "bg-white text-accent-neutral-mid",
      },
    },
  }
);

/**
 * Date range pill — same contrast story as the label pill but with a slightly
 * translucent surface. On the completed (white) frame we drop to a neutral
 * dark surface so the green label pill stays the visual focus.
 */
const datePillVariants = cva(
  "inline-flex w-fit items-center justify-start rounded-[4px] px-1.5 py-0.5 text-[7px] leading-[1.4] font-semibold tracking-[0.1px] whitespace-nowrap",
  {
    variants: {
      status: {
        overdue: "bg-white/95 text-feedback-error",
        inprogress: "bg-white/95 text-accent-blue-bold",
        completed: "bg-white/95 text-accent-green-deep",
        lead: "bg-white/95 text-accent-orange-bright",
        not_started: "bg-white/95 text-accent-neutral-mid",
      },
    },
  }
);

const BAR_MIN_HEIGHT_PX = 36;

export interface TimelineBarProps {
  item: CalendarItem;
  /** Pre-computed horizontal position; bar renders nothing when not visible. */
  position: BarPosition;
  onClick?: (item: CalendarItem) => void;
  className?: string;
}

export function TimelineBar({
  item,
  position,
  onClick,
  className,
}: TimelineBarProps) {
  const dateRange = useMemo(
    () => formatDateRange(item.startDate, item.endDate),
    [item.startDate, item.endDate]
  );

  const primaryLabel = useMemo(
    () => formatCalendarItemPrimaryLabel(item),
    [item]
  );

  if (!position.visible) return null;

  const handleClick = onClick ? () => onClick(item) : undefined;
  const interactive = Boolean(handleClick);

  return (
    <div
      aria-label={interactive ? `View details for ${primaryLabel}` : undefined}
      className={cn(
        frameVariants({ status: item.barStatus, interactive }),
        className
      )}
      role={interactive ? "button" : undefined}
      style={{
        top: "50%",
        transform: "translateY(-50%)",
        left: `${position.leftPct}%`,
        minWidth: `${position.widthPct}%`,
        minHeight: BAR_MIN_HEIGHT_PX,
      }}
      tabIndex={interactive ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={handleClick ? onActivation(handleClick) : undefined}
    >
      <span className={labelPillVariants({ status: item.barStatus })}>
        {STATUS_LABEL_TEXT[item.barStatus]}
      </span>
      <span className={datePillVariants({ status: item.barStatus })}>
        {dateRange}
      </span>
    </div>
  );
}
