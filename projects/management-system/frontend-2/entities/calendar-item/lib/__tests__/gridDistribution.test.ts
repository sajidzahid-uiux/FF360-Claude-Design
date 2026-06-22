import { parseISO } from "date-fns";
import { describe, expect, it } from "vitest";

import { ResourceType } from "@/constants";

import type { CalendarItem } from "../../model/types";
import {
  buildCalendarGrid,
  buildWeekGrid,
  isContinuationDay,
  itemContainsDay,
  sortByStartDate,
} from "../gridDistribution";

function item(
  overrides: Pick<CalendarItem, "id" | "startDate" | "endDate"> &
    Partial<CalendarItem>
): CalendarItem {
  return {
    kind: ResourceType.JOB,
    title: "Test",
    location: "Farm",
    category: "tile",
    workflowStatus: { label: "Active", tone: "blue" },
    barStatus: "inprogress",
    ...overrides,
  };
}

describe("itemContainsDay", () => {
  const span = item({
    id: 1,
    startDate: "2026-04-10",
    endDate: "2026-04-12",
  });

  it("includes start, end, and interior days", () => {
    expect(itemContainsDay(span, parseISO("2026-04-10"))).toBe(true);
    expect(itemContainsDay(span, parseISO("2026-04-11"))).toBe(true);
    expect(itemContainsDay(span, parseISO("2026-04-12"))).toBe(true);
  });

  it("excludes days outside the range", () => {
    expect(itemContainsDay(span, parseISO("2026-04-09"))).toBe(false);
    expect(itemContainsDay(span, parseISO("2026-04-13"))).toBe(false);
  });
});

describe("isContinuationDay", () => {
  const span = item({
    id: 1,
    startDate: "2026-04-10",
    endDate: "2026-04-12",
  });

  it("is true only for interior days", () => {
    expect(isContinuationDay(span, parseISO("2026-04-10"))).toBe(false);
    expect(isContinuationDay(span, parseISO("2026-04-11"))).toBe(true);
    expect(isContinuationDay(span, parseISO("2026-04-12"))).toBe(false);
  });
});

describe("sortByStartDate", () => {
  it("sorts ascending without mutating the input", () => {
    const items = [
      item({ id: 2, startDate: "2026-04-20", endDate: "2026-04-21" }),
      item({ id: 1, startDate: "2026-04-01", endDate: "2026-04-02" }),
    ];
    const sorted = sortByStartDate(items);
    expect(sorted.map((i) => i.id)).toEqual([1, 2]);
    expect(items.map((i) => i.id)).toEqual([2, 1]);
  });
});

describe("buildCalendarGrid", () => {
  const activeMonth = parseISO("2026-04-01");
  const items = [
    item({ id: 1, startDate: "2026-04-05", endDate: "2026-04-05" }),
    item({ id: 2, startDate: "2026-04-05", endDate: "2026-04-06" }),
    item({ id: 3, startDate: "2026-04-05", endDate: "2026-04-07" }),
  ];

  it("caps visible items and reports overflow on a busy day", () => {
    const grid = buildCalendarGrid(activeMonth, items, { visibleLimit: 2 });
    const april5 = grid.find((cell) => cell.date.getDate() === 5);
    expect(april5?.visibleItems).toHaveLength(2);
    expect(april5?.overflowCount).toBe(1);
  });

  it("leaves outside-month cells empty", () => {
    const grid = buildCalendarGrid(activeMonth, items, { visibleLimit: 5 });
    const outside = grid.filter((cell) => cell.isOutsideMonth);
    expect(outside.length).toBeGreaterThan(0);
    expect(outside.every((cell) => cell.visibleItems.length === 0)).toBe(true);
  });
});

describe("buildWeekGrid", () => {
  it("returns exactly seven day cells", () => {
    const weekStart = parseISO("2026-04-05");
    const grid = buildWeekGrid(weekStart, [], { visibleLimit: 3 });
    expect(grid).toHaveLength(7);
    expect(grid.every((cell) => cell.isOutsideMonth === false)).toBe(true);
  });
});
