"use client";

import { useCallback, useEffect, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  cn,
} from "@fieldflow360/org-ui";
import { CalendarDays, Eye, X } from "lucide-react";

import { ResourceType } from "@/constants";
import {
  type CalendarItem,
  KIND_LABEL,
  Pill,
  ProjectTypeBadge,
  calendarItemHasProjectType,
  getCalendarItemCardDisplayLines,
} from "@/entities/calendar-item";

import type { CalendarSchedulePayload } from "../model/types";
import { ScheduleEditForm } from "./ScheduleEditForm";
import {
  calendarDarkButtonProps,
  calendarPrimaryButtonProps,
} from "./calendarOrgUiButtons";

export interface MissingSchedulesModalProps {
  items: CalendarItem[];
  onClose: () => void;
  onSaveSchedule?: (
    item: CalendarItem,
    payload: CalendarSchedulePayload
  ) => void;
  onViewDetails?: (item: CalendarItem) => void;
  /** When false for an item, the add-schedule action is disabled for that row. */
  canEditSchedule?: (item: CalendarItem) => boolean;
}

export function MissingSchedulesModal({
  items,
  onClose,
  onSaveSchedule,
  onViewDetails,
  canEditSchedule = () => true,
}: MissingSchedulesModalProps) {
  const [editingId, setEditingId] = useState<number | null>(null);

  /** Close on Escape. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  /** Lock body scroll while modal is open. */
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const handleEnterEdit = useCallback((item: CalendarItem) => {
    setEditingId(item.id);
  }, []);

  const handleCancelEdit = useCallback(() => setEditingId(null), []);

  const handleSaveEdit = useCallback(
    (item: CalendarItem, payload: CalendarSchedulePayload) => {
      onSaveSchedule?.(item, payload);
      setEditingId(null);
    },
    [onSaveSchedule]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center sm:items-center sm:p-4">
      {/* Overlay */}
      <button
        aria-label="Close modal"
        className="absolute inset-0 cursor-default bg-black/40"
        type="button"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        aria-labelledby="missing-schedules-title"
        aria-modal="true"
        className="bg-bg-app relative flex h-[100dvh] w-full flex-col overflow-hidden shadow-[0_24px_48px_-12px_rgba(0,0,0,0.18),0_8px_16px_-8px_rgba(0,0,0,0.10)] sm:h-[85vh] sm:w-[85vw] sm:max-w-[1200px] sm:rounded-[16px]"
        role="dialog"
      >
        {/* Header */}
        <div className="border-border-subtle flex items-center justify-between border-b px-4 py-4 sm:px-6 sm:py-5">
          <h2
            className="text-text-primary text-[16px] leading-[22px] font-semibold sm:text-[18px] sm:leading-[24px]"
            id="missing-schedules-title"
          >
            <span className="font-bold">{items.length}</span>
            {" Missing Schedules"}
          </h2>
          <Button
            iconOnly
            aria-label="Close"
            leftIcon={<X aria-hidden className="h-4 w-4" strokeWidth={2.25} />}
            size={ComponentSizeEnum.SM}
            variant={ButtonVariantEnum.GHOST}
            onClick={onClose}
          />
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="text-text-muted flex h-32 items-center justify-center text-[13px]">
              No missing schedules.
            </div>
          ) : (
            items.map((item, idx) => {
              const isEditing = editingId === item.id;
              const scheduleEditable = canEditSchedule(item);
              const { primaryLine, subtitleLine } =
                getCalendarItemCardDisplayLines(item);
              return (
                <div
                  key={item.id}
                  className={cn(
                    "border-border-subtle flex items-center justify-between gap-4 px-4 py-4 sm:px-6",
                    idx !== items.length - 1 && "border-b"
                  )}
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
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
                    <h3 className="text-text-primary truncate text-[15px] leading-[20px] font-semibold">
                      {primaryLine}
                    </h3>
                    {subtitleLine ? (
                      <p className="text-text-muted truncate text-[12px] leading-[16px]">
                        {subtitleLine}
                      </p>
                    ) : null}
                  </div>

                  {isEditing ? (
                    <ScheduleEditForm
                      className="shrink-0"
                      fieldPlaceholder="Select"
                      item={item}
                      layout="inline"
                      onCancel={handleCancelEdit}
                      onSave={handleSaveEdit}
                    />
                  ) : (
                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        disabled={!scheduleEditable}
                        leftIcon={
                          <CalendarDays
                            aria-hidden
                            aria-label={
                              scheduleEditable
                                ? "Add Schedule"
                                : "You do not have permission to edit this schedule."
                            }
                            className="h-3.5 w-3.5"
                            strokeWidth={2.25}
                          />
                        }
                        size={ComponentSizeEnum.SM}
                        title={
                          scheduleEditable
                            ? "Add Schedule"
                            : "You do not have permission to edit this schedule."
                        }
                        {...calendarPrimaryButtonProps}
                        onClick={() => {
                          if (scheduleEditable) {
                            handleEnterEdit(item);
                          }
                        }}
                      />
                      <Button
                        leftIcon={
                          <Eye
                            aria-hidden
                            className="h-3.5 w-3.5"
                            strokeWidth={2.25}
                          />
                        }
                        size={ComponentSizeEnum.SM}
                        title="View Details"
                        {...calendarDarkButtonProps}
                        onClick={() => onViewDetails?.(item)}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
