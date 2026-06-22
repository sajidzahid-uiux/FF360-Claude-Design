"use client";

import { useCallback, useEffect, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  cn,
} from "@fieldflow360/org-ui";
import { Save } from "lucide-react";

import type { CalendarItem } from "@/entities/calendar-item";
import { toInputDate } from "@/entities/calendar-item";
import { DateField, NumberField } from "@/shared/ui";

import type { CalendarSchedulePayload } from "../model/types";
import { calendarSaveButtonProps } from "./calendarOrgUiButtons";

export type ScheduleEditFormLayout = "stacked" | "inline";

export interface ScheduleEditFormProps {
  item: CalendarItem;
  onSave: (item: CalendarItem, payload: CalendarSchedulePayload) => void;
  onCancel: () => void;
  layout?: ScheduleEditFormLayout;
  displayFormat?: string;
  fieldPlaceholder?: string;
  fieldWidthClassName?: string;
  className?: string;
}

export function ScheduleEditForm({
  item,
  onSave,
  onCancel,
  layout = "stacked",
  displayFormat,
  fieldPlaceholder,
  fieldWidthClassName,
  className,
}: ScheduleEditFormProps) {
  const [editStart, setEditStart] = useState(() => toInputDate(item.startDate));
  const [editEnd, setEditEnd] = useState(() => toInputDate(item.endDate));
  const [editExtra, setEditExtra] = useState(() =>
    item.extraDays && item.extraDays > 0 ? String(item.extraDays) : ""
  );

  useEffect(() => {
    setEditStart(toInputDate(item.startDate));
    setEditEnd(toInputDate(item.endDate));
    setEditExtra(
      item.extraDays && item.extraDays > 0 ? String(item.extraDays) : ""
    );
  }, [item.id, item.startDate, item.endDate, item.extraDays]);

  const handleSave = useCallback(() => {
    if (!editStart || !editEnd) return;
    const parsed = editExtra ? parseInt(editExtra, 10) : 0;
    const extraDays =
      Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
    onSave(item, {
      startDate: editStart,
      endDate: editEnd,
      extraDays,
    });
  }, [editStart, editEnd, editExtra, item, onSave]);

  const fieldClass = cn(
    fieldWidthClassName ??
      (layout === "inline" ? "w-full sm:w-[150px]" : "flex-1")
  );

  return (
    <div
      className={cn(
        layout === "inline"
          ? "flex flex-col items-stretch gap-2 sm:items-end"
          : "border-border-subtle bg-bg-app flex flex-col gap-3 rounded-[10px] border px-3 py-3",
        className
      )}
    >
      {layout === "inline" ? (
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-end">
          <DateField
            className={fieldClass}
            displayFormat={displayFormat}
            label="Start Date (Day of Month)"
            placeholder={fieldPlaceholder}
            value={editStart}
            onChange={setEditStart}
          />
          <DateField
            className={fieldClass}
            displayFormat={displayFormat}
            label="End Date (Day of Month)"
            placeholder={fieldPlaceholder}
            value={editEnd}
            onChange={setEditEnd}
          />
          <NumberField
            className={fieldClass}
            label="Extra Days (Optional)"
            placeholder="0"
            value={editExtra}
            onChange={setEditExtra}
          />
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <DateField
              className={fieldClass}
              displayFormat={displayFormat}
              label="Start Date (Day of Month)"
              placeholder={fieldPlaceholder}
              value={editStart}
              onChange={setEditStart}
            />
            <DateField
              className={fieldClass}
              displayFormat={displayFormat}
              label="End Date (Day of Month)"
              placeholder={fieldPlaceholder}
              value={editEnd}
              onChange={setEditEnd}
            />
          </div>
          <div className="flex gap-2">
            <NumberField
              className={fieldClass}
              label="Extra Days (Optional)"
              placeholder="0"
              value={editExtra}
              onChange={setEditExtra}
            />
            <div aria-hidden className="flex-1" />
          </div>
        </>
      )}

      <div className="flex items-center justify-end gap-3">
        <Button
          disabled={!editStart || !editEnd}
          leftIcon={
            <Save aria-hidden className="h-3.5 w-3.5" strokeWidth={2.25} />
          }
          size={ComponentSizeEnum.SM}
          title="Save Dates"
          {...calendarSaveButtonProps}
          onClick={handleSave}
        />
        <Button
          aria-label="Cancel"
          size={ComponentSizeEnum.SM}
          title="Cancel"
          variant={ButtonVariantEnum.SURFACE}
          onClick={onCancel}
        />
      </div>
    </div>
  );
}
