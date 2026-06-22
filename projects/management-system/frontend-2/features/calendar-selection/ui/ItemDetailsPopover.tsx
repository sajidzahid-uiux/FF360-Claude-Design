"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  cn,
} from "@fieldflow360/org-ui";
import {
  differenceInCalendarDays,
  format,
  isAfter,
  isBefore,
  parseISO,
} from "date-fns";
import { Briefcase, CalendarDays, Users as UsersIcon, X } from "lucide-react";

import { ResourceType } from "@/constants";
import {
  type CalendarItem,
  KIND_LABEL,
  Pill,
  ProjectTypeBadge,
  calendarItemHasProjectType,
  formatCalendarClientCardLine,
} from "@/entities/calendar-item";
import {
  type CalendarSchedulePayload,
  ScheduleEditForm,
  calendarDarkButtonProps,
  calendarPrimaryButtonProps,
} from "@/features/calendar-schedule-edit";

export interface ItemDetailsPopoverProps {
  item: CalendarItem;
  onClose: () => void;
  /** Called with the new dates when the user saves the edit form. */
  onSaveSchedule?: (
    item: CalendarItem,
    payload: CalendarSchedulePayload
  ) => void;
  onView?: (item: CalendarItem) => void;
  /** When false, schedule editing controls are hidden (requires write on the backing resource). */
  allowScheduleEdit?: boolean;
  className?: string;
}

export function ItemDetailsPopover({
  item,
  onClose,
  onSaveSchedule,
  onView,
  allowScheduleEdit = true,
  className,
}: ItemDetailsPopoverProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  /** Reset edit toggle whenever the selected item changes or schedule editing is disallowed. */
  useEffect(() => {
    setIsEditing(false);
  }, [item.id, allowScheduleEdit]);

  /**
   * Close on Escape and on outside click. Outside click is gated on mousedown
   * so dragging/selecting text starting inside the popover never triggers a
   * close when the mouse releases outside.
   */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onMouseDown = (e: MouseEvent) => {
      const node = containerRef.current;
      if (!node) return;
      if (e.target instanceof Node && !node.contains(e.target)) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [onClose]);

  const { rangeLabel, daysProgressLabel, progressPct } = useMemo(() => {
    const start = parseISO(item.startDate);
    const end = parseISO(item.endDate);
    const totalDays = Math.max(1, differenceInCalendarDays(end, start) + 1);
    const today = new Date();
    let elapsed: number;
    if (isBefore(today, start)) elapsed = 0;
    else if (isAfter(today, end)) elapsed = totalDays;
    else elapsed = differenceInCalendarDays(today, start) + 1;

    return {
      rangeLabel: `${format(start, "MMM d")} - ${format(end, "MMM d")}`,
      daysProgressLabel: `${elapsed}/${totalDays} days`,
      progressPct: Math.min(100, Math.max(0, (elapsed / totalDays) * 100)),
    };
  }, [item.startDate, item.endDate]);

  const kindLabel = KIND_LABEL[item.kind];

  const clientCardLine = useMemo(
    () => formatCalendarClientCardLine(item),
    [item]
  );

  const handleSaveSchedule = (
    target: CalendarItem,
    payload: CalendarSchedulePayload
  ) => {
    onSaveSchedule?.(target, payload);
    setIsEditing(false);
  };

  return (
    <div
      ref={containerRef}
      aria-modal="true"
      className={cn(
        "border-border-subtle bg-bg-app fixed inset-x-0 bottom-0 z-50 flex max-h-[90dvh] flex-col overflow-y-auto rounded-t-[16px] border shadow-[0_-12px_32px_-12px_rgba(0,0,0,0.20)]",
        "md:inset-x-auto md:right-6 md:bottom-6 md:max-h-[calc(100dvh-3rem)] md:w-[360px] md:rounded-none md:shadow-[0_24px_48px_-16px_rgba(0,0,0,0.20),0_8px_16px_-8px_rgba(0,0,0,0.08)]",
        className
      )}
      role="dialog"
    >
      {/* Header */}
      <div className="border-border-subtle flex items-center justify-between border-b px-5 pt-5 pb-4">
        <h3 className="text-text-primary text-[18px] leading-[22px] font-bold">
          Schedule Details
        </h3>
        <Button
          iconOnly
          aria-label="Close details"
          leftIcon={
            <X aria-hidden className="h-3.5 w-3.5" strokeWidth={2.25} />
          }
          size={ComponentSizeEnum.SM}
          variant={ButtonVariantEnum.GHOST}
          onClick={onClose}
        />
      </div>

      <div className="flex flex-col gap-4 px-5 pt-4 pb-2">
        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2">
          <Pill
            colorOverride={item.workflowStatus.color}
            tone={item.workflowStatus.tone}
          >
            {item.workflowStatus.label}
          </Pill>
          <Pill tone={item.kind}>{kindLabel}</Pill>
          <Pill className="capitalize" tone="outlined">
            {item.category}
          </Pill>
          {calendarItemHasProjectType(item) ? (
            <ProjectTypeBadge
              color={item.projectType.color}
              name={item.projectType.name}
              size="md"
            />
          ) : null}
          {item.kind === ResourceType.LEAD && item.leadSource ? (
            <Pill tone="outlined">{item.leadSource}</Pill>
          ) : null}
          {item.pattern ? <Pill tone="outlined">{item.pattern}</Pill> : null}
        </div>

        {/* Client card */}
        <div className="bg-bg-surface/40 flex flex-col gap-1 rounded-[12px] px-6 py-6">
          <div className="text-text-muted flex items-center gap-2 text-[13px] leading-none font-medium">
            <UsersIcon className="h-[15px] w-[15px]" strokeWidth={1.75} />
            <span>Client</span>
          </div>
          <p className="text-text-primary text-[16px] leading-[22px] font-bold break-words">
            {clientCardLine}
          </p>
        </div>

        {/* Schedule card */}
        <div className="bg-bg-surface/40 flex flex-col gap-2 rounded-[12px] px-6 py-6">
          <div className="text-text-muted flex items-center gap-2 text-[13px] leading-none font-medium">
            <CalendarDays className="h-[15px] w-[15px]" strokeWidth={1.75} />
            <span>Schedule</span>
          </div>
          <p className="text-text-primary text-[16px] leading-[22px] font-bold">
            {rangeLabel}
          </p>
          <div className="mt-1 flex flex-col gap-1.5">
            <span className="text-text-muted self-end text-[12px] leading-none font-medium">
              {daysProgressLabel}
            </span>
            <div
              aria-label={`Schedule progress: ${daysProgressLabel}`}
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={Math.round(progressPct)}
              className="bg-bg-surface relative h-1.5 w-full overflow-hidden rounded-full"
              role="progressbar"
            >
              <span
                className="bg-accent-blue-bright absolute inset-y-0 left-0 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2.5 px-5 pt-2 pb-5">
        {allowScheduleEdit ? (
          isEditing ? (
            <ScheduleEditForm
              displayFormat="d MMMM yyyy"
              item={item}
              layout="stacked"
              onCancel={() => setIsEditing(false)}
              onSave={handleSaveSchedule}
            />
          ) : (
            <Button
              fullWidth
              leftIcon={
                <CalendarDays
                  aria-hidden
                  className="h-[18px] w-[18px]"
                  strokeWidth={2}
                />
              }
              size={ComponentSizeEnum.LG}
              title="Edit Schedule"
              {...calendarPrimaryButtonProps}
              onClick={() => setIsEditing(true)}
            />
          )
        ) : null}
        <Button
          fullWidth
          aria-label={`View ${kindLabel}`}
          leftIcon={
            <Briefcase
              aria-hidden
              className="h-[18px] w-[18px]"
              strokeWidth={2}
            />
          }
          size={ComponentSizeEnum.LG}
          title={`View ${kindLabel}`}
          {...calendarDarkButtonProps}
          onClick={() => onView?.(item)}
        />
      </div>
    </div>
  );
}
