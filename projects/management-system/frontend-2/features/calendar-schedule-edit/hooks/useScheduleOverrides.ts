"use client";

import { useCallback, useMemo, useState } from "react";

import type { CalendarItem } from "@/entities/calendar-item";

import type { CalendarSchedulePayload } from "../model/types";

export interface ScheduleOverridesState {
  /** Base items with any saved overrides applied. Stable identity per override change. */
  items: CalendarItem[];
  /** Persist a schedule edit for the given item. */
  saveSchedule: (item: CalendarItem, payload: CalendarSchedulePayload) => void;
}

/**
 * In-memory schedule overrides applied on top of the base item list.
 *
 * **This entire mechanism goes away when the calendar API lands.** The
 * replacement contract:
 *
 *   PATCH /api/jobs/:id        { start_date, end_date }
 *   PATCH /api/leads/:id       { start_date, end_date }
 *
 * Wire-up plan (TanStack Query, matching `useJobDataForMultipleTypes` etc.):
 *   1. `useUpdateCalendarItemSchedule()` mutation that PATCHes the right
 *      endpoint based on `item.kind` (`ResourceType.JOB` | `ResourceType.LEAD`).
 *   2. On success, invalidate the calendar items query so the timeline
 *      re-renders against fresh server data.
 *   3. Delete this hook entirely; consumers read from the query directly.
 *
 * Backend gaps blocking this: see `memory/project_calendar_wiring.md`.
 */
export function useScheduleOverrides(
  baseItems: CalendarItem[]
): ScheduleOverridesState {
  const [overrides, setOverrides] = useState<
    Record<number, CalendarSchedulePayload>
  >({});

  const items = useMemo<CalendarItem[]>(
    () =>
      baseItems.map((item) => {
        const override = overrides[item.id];
        return override
          ? {
              ...item,
              startDate: override.startDate,
              endDate: override.endDate,
            }
          : item;
      }),
    [baseItems, overrides]
  );

  const saveSchedule = useCallback(
    (item: CalendarItem, payload: CalendarSchedulePayload) => {
      setOverrides((prev) => ({
        ...prev,
        [item.id]: {
          startDate: payload.startDate,
          endDate: payload.endDate,
          extraDays: payload.extraDays,
        },
      }));
    },
    []
  );

  return { items, saveSchedule };
}
