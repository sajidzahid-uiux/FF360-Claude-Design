"use client";

import { Fragment, type ReactNode, useMemo } from "react";

import { cn } from "@fieldflow360/org-ui";

import { JobLeadEntityType, ResourceType } from "@/constants";
import {
  type BarPosition,
  type CalendarItem,
  type CalendarTabCounterValue,
  ItemCard,
} from "@/entities/calendar-item";

import { TabCounter } from "./TabCounter";
import { TimelineBar } from "./TimelineBar";
import { TimelineOverlay } from "./TimelineOverlay";

const LEFT_COL_WIDTH_PX = 260;
const TIMELINE_MIN_WIDTH_PX = 780;
const HEADER_ROW_HEIGHT_PX = 38;

export interface TimelineFrameProps {
  /** Day-axis header rendered in the top-right cell (monthly or weekly). */
  header: ReactNode;
  items: CalendarItem[];
  /** Number of day cells across the timeline (28-31 for month, 7 for week). */
  daysCount: number;
  /** Position of the "today" line in 0–100, or null if today is outside range. */
  todayLineLeftPct: number | null;
  /** Compute the bar's horizontal position for a given item. */
  getBarPosition: (item: CalendarItem) => BarPosition;
  activeTab?: CalendarTabCounterValue;
  onTabChange?: (value: CalendarTabCounterValue) => void;
  onItemClick?: (item: CalendarItem) => void;
  className?: string;
}

/**
 * Shared layout chrome for the monthly + weekly timeline views: 2-column
 * grid (item cards left, day axis right), tab counter, item rows, today
 * line overlay. Day-axis header content and bar-position math come from
 * the consumer so the frame stays scale-agnostic.
 */
export function TimelineFrame({
  header,
  items,
  daysCount,
  todayLineLeftPct,
  getBarPosition,
  activeTab = JobLeadEntityType.JOBS,
  onTabChange,
  onItemClick,
  className,
}: TimelineFrameProps) {
  const { leadCount, jobCount } = useMemo(
    () => ({
      leadCount: items.filter((i) => i.kind === ResourceType.LEAD).length,
      jobCount: items.filter((i) => i.kind === ResourceType.JOB).length,
    }),
    [items]
  );

  // `repeat(0, …)` is invalid CSS and drops the entire grid-template-rows
  // declaration — rows fall back to auto+stretch and push the tab counter
  // into the middle of the side panel. Keep the empty-items case explicit.
  const gridStyle = {
    gridTemplateColumns: `${LEFT_COL_WIDTH_PX}px minmax(${TIMELINE_MIN_WIDTH_PX}px, 1fr)`,
    gridTemplateRows:
      items.length > 0
        ? `${HEADER_ROW_HEIGHT_PX}px repeat(${items.length}, auto) 1fr`
        : `${HEADER_ROW_HEIGHT_PX}px 1fr`,
  } as const;

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col px-4 pb-4 sm:px-6",
        className
      )}
    >
      <div className="border-border-subtle bg-bg-app flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border shadow-sm">
        <div
          className="flex min-h-0 flex-1 flex-col overflow-auto [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none" }}
        >
          {/* `min-w-max` forces the grid's border box to its intrinsic content
              width (280 + 780). Without it the flex parent stretches the
              border box to the scroll container's width while the grid
              columns still resolve to their min size, leaving the timeline
              column overflowing the box. The overlay's `right: 0` then
              anchors to the truncated box and partition lines stop short of
              the day axis once the user scrolls horizontally. */}
          <div className="relative grid min-w-max flex-1" style={gridStyle}>
            <div className="border-border-subtle from-muted/50 to-muted sticky top-0 z-50 flex items-center border-r bg-gradient-to-r px-3">
              <TabCounter
                active={activeTab}
                jobCount={jobCount}
                leadCount={leadCount}
                onChange={onTabChange}
              />
            </div>
            <div className="from-muted/50 to-muted sticky top-0 z-10 bg-gradient-to-r">
              {header}
            </div>

            {items.map((item) => (
              <Fragment key={item.id}>
                <ItemCard
                  className="border-border-subtle border-t border-r"
                  item={item}
                  onClick={onItemClick}
                />
                <div className="relative">
                  <TimelineBar
                    item={item}
                    position={getBarPosition(item)}
                    onClick={onItemClick}
                  />
                </div>
              </Fragment>
            ))}

            {/* Filler cells fill the remaining vertical space below the last
                item so the timeline card extends to the bottom of the page,
                preserving the left column's right border. */}
            <div className="border-border-subtle border-t border-r" />
            <div />

            <TimelineOverlay
              daysCount={daysCount}
              headerHeightPx={HEADER_ROW_HEIGHT_PX}
              leftOffsetPx={LEFT_COL_WIDTH_PX}
              todayLineLeftPct={todayLineLeftPct}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
