"use client";

import { useEffect, useMemo, useRef } from "react";

import { cn } from "@fieldflow360/org-ui";

import { ResourceType } from "@/constants";

import { getCalendarItemCardDisplayLines } from "../lib/ClientCardLine";
import { onActivation } from "../lib/activation";
import { formatDateRange } from "../lib/dates";
import { KIND_LABEL } from "../model/labels";
import { STATUS_BG_CLASS } from "../model/status";
import type { CalendarItem } from "../model/types";
import { Pill } from "./Pill";
import {
  ProjectTypeBadge,
  calendarItemHasProjectType,
} from "./ProjectTypeBadge";

export interface ItemCardProps {
  item: CalendarItem;
  onClick?: (item: CalendarItem) => void;
  className?: string;
}

export function ItemCard({ item, onClick, className }: ItemCardProps) {
  const dateRange = useMemo(
    () => formatDateRange(item.startDate, item.endDate),
    [item.startDate, item.endDate]
  );

  const { primaryLine, subtitleLine } = useMemo(
    () => getCalendarItemCardDisplayLines(item),
    [item]
  );

  const handleClick = onClick ? () => onClick(item) : undefined;
  const isInteractive = Boolean(handleClick);

  const badgesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = badgesRef.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let scrollStart = 0;
    let moved = false;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      isDown = true;
      moved = false;
      startX = e.clientX;
      scrollStart = el.scrollLeft;
      el.style.cursor = "grabbing";
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 3) moved = true;
      el.scrollLeft = scrollStart - dx;
    };

    const onMouseUp = () => {
      if (!isDown) return;
      isDown = false;
      el.style.cursor = "";
    };

    // Swallow the click that follows a drag so the parent card's onClick
    // doesn't fire when the user only meant to scroll the badges row.
    const onClickCapture = (e: MouseEvent) => {
      if (moved) {
        e.stopPropagation();
        e.preventDefault();
        moved = false;
      }
    };

    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    el.addEventListener("click", onClickCapture, true);

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("click", onClickCapture, true);
    };
  }, []);

  return (
    <div
      aria-label={isInteractive ? `View details for ${primaryLine}` : undefined}
      className={cn(
        "relative flex flex-col gap-1.5 p-3",
        isInteractive &&
          "hover:bg-bg-surface/50 cursor-pointer transition-colors",
        className
      )}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={handleClick ? onActivation(handleClick) : undefined}
    >
      {/* Scrollable via click-drag, trackpad swipe, or shift+wheel. Native
          scrollbar is hidden; a right-edge mask fades cropped tags as an
          affordance that more content is reachable. */}
      <div
        ref={badgesRef}
        className="flex cursor-grab items-start gap-1 overflow-x-auto pb-1 select-none [&::-webkit-scrollbar]:hidden"
        style={{
          scrollbarWidth: "none",
          maskImage:
            "linear-gradient(to right, black 0%, black 92%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, black 0%, black 92%, transparent 100%)",
        }}
      >
        <Pill
          colorOverride={item.workflowStatus.color}
          size="sm"
          tone={item.workflowStatus.tone}
        >
          {item.workflowStatus.label}
        </Pill>
        <Pill size="sm" tone={item.kind}>
          {KIND_LABEL[item.kind]}
        </Pill>
        <Pill className="capitalize" size="sm" tone="outlined">
          {item.category}
        </Pill>
        {calendarItemHasProjectType(item) ? (
          <ProjectTypeBadge
            color={item.projectType.color}
            name={item.projectType.name}
            size="sm"
          />
        ) : null}
        {item.kind === ResourceType.LEAD && item.leadSource ? (
          <Pill size="sm" tone="outlined">
            {item.leadSource}
          </Pill>
        ) : null}
        {item.pattern ? (
          <Pill size="sm" tone="outlined">
            {item.pattern}
          </Pill>
        ) : null}
      </div>

      <h4 className="text-text-primary truncate text-[13px] leading-[18px] font-semibold">
        {primaryLine}
      </h4>
      {subtitleLine ? (
        <p className="text-text-muted truncate text-[11px] leading-[14px]">
          {subtitleLine}
        </p>
      ) : null}
      {/* pr-6 leaves room for the absolute-positioned status dot. */}
      <p className="text-text-muted truncate pr-6 text-[11px] leading-[14px]">
        {dateRange}
      </p>

      <span
        aria-hidden
        className={cn(
          "absolute right-3 bottom-3 h-3 w-3 shrink-0 rounded-full",
          STATUS_BG_CLASS[item.barStatus]
        )}
      />
    </div>
  );
}
