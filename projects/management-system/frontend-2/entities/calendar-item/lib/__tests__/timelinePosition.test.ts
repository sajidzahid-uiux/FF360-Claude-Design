import { parseISO } from "date-fns";
import { describe, expect, it } from "vitest";

import type { CalendarItem } from "../../model/types";
import {
  computeBarPosition,
  computeBarPositionInWeek,
  getWeekStart,
  itemOverlapsMonth,
  itemOverlapsWeek,
} from "../timelinePosition";

type DateRange = Pick<CalendarItem, "startDate" | "endDate">;

describe("itemOverlapsMonth", () => {
  it("detects overlap with the active month", () => {
    const item: DateRange = {
      startDate: "2026-04-22",
      endDate: "2026-05-08",
    };
    expect(itemOverlapsMonth(item, parseISO("2026-04-01"))).toBe(true);
    expect(itemOverlapsMonth(item, parseISO("2026-05-01"))).toBe(true);
    expect(itemOverlapsMonth(item, parseISO("2026-06-01"))).toBe(false);
  });
});

describe("itemOverlapsWeek", () => {
  it("detects overlap with the Sunday-first week window", () => {
    const item: DateRange = {
      startDate: "2026-04-08",
      endDate: "2026-04-22",
    };
    const weekStart = getWeekStart(parseISO("2026-04-12"));
    expect(itemOverlapsWeek(item, weekStart)).toBe(true);
    expect(itemOverlapsWeek(item, getWeekStart(parseISO("2026-04-27")))).toBe(
      false
    );
  });
});

describe("getWeekStart", () => {
  it("aligns to Sunday", () => {
    const wednesday = parseISO("2026-04-08");
    expect(getWeekStart(wednesday).getDay()).toBe(0);
    expect(getWeekStart(wednesday).getDate()).toBe(5);
  });
});

describe("computeBarPosition", () => {
  const activeMonth = parseISO("2026-04-01");

  it("hides items entirely outside the month", () => {
    const position = computeBarPosition(
      { startDate: "2026-05-01", endDate: "2026-05-10" },
      activeMonth
    );
    expect(position.visible).toBe(false);
  });

  it("shows items within the month with positive width", () => {
    const position = computeBarPosition(
      { startDate: "2026-04-10", endDate: "2026-04-12" },
      activeMonth
    );
    expect(position.visible).toBe(true);
    expect(position.widthPct).toBeGreaterThan(0);
    expect(position.leftPct).toBeGreaterThanOrEqual(0);
  });

  it("extends date-only end dates through the full end day", () => {
    const singleDay = computeBarPosition(
      { startDate: "2026-04-15", endDate: "2026-04-15" },
      activeMonth
    );
    const timedEnd = computeBarPosition(
      {
        startDate: "2026-04-15T00:00:00",
        endDate: "2026-04-15T12:00:00",
      },
      activeMonth
    );
    expect(singleDay.widthPct).toBeGreaterThan(timedEnd.widthPct);
  });
});

describe("computeBarPositionInWeek", () => {
  const weekStart = getWeekStart(parseISO("2026-04-12"));

  it("hides items entirely outside the week", () => {
    const position = computeBarPositionInWeek(
      { startDate: "2026-04-01", endDate: "2026-04-05" },
      weekStart
    );
    expect(position.visible).toBe(false);
  });

  it("clamps multi-week items to the visible week segment", () => {
    const position = computeBarPositionInWeek(
      { startDate: "2026-04-08", endDate: "2026-04-22" },
      weekStart
    );
    expect(position.visible).toBe(true);
    expect(position.leftPct).toBe(0);
    expect(position.widthPct).toBeGreaterThan(0);
    expect(position.widthPct).toBeLessThanOrEqual(100);
  });
});
