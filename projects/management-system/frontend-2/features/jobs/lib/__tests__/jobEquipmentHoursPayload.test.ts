import { describe, expect, it } from "vitest";

import {
  buildJobEquipmentHoursUpdatePayload,
  shouldShowOnSiteFarmHoursSelect,
} from "../jobEquipmentHoursPayload";

describe("buildJobEquipmentHoursUpdatePayload", () => {
  it("omits farm_id for job-level hours", () => {
    expect(buildJobEquipmentHoursUpdatePayload(10, 12, 5, null)).toEqual({
      start: 10,
      end: 12,
      equipment: 5,
    });
  });

  it("omits farm_id when farmId is undefined", () => {
    expect(buildJobEquipmentHoursUpdatePayload(1, 2, 3)).toEqual({
      start: 1,
      end: 2,
      equipment: 3,
    });
  });

  it("includes farm_id when a farm is selected", () => {
    expect(buildJobEquipmentHoursUpdatePayload(10, 12, 5, 99)).toEqual({
      start: 10,
      end: 12,
      equipment: 5,
      farm_id: 99,
    });
  });
});

describe("shouldShowOnSiteFarmHoursSelect", () => {
  it("returns false for undefined or empty farms", () => {
    expect(shouldShowOnSiteFarmHoursSelect(undefined)).toBe(false);
    expect(shouldShowOnSiteFarmHoursSelect([])).toBe(false);
  });

  it("returns true for one or multiple farms", () => {
    expect(shouldShowOnSiteFarmHoursSelect([{ id: 1 }])).toBe(true);
    expect(shouldShowOnSiteFarmHoursSelect([{ id: 1 }, { id: 2 }])).toBe(true);
  });
});
