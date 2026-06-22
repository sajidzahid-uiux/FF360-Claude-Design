import { describe, expect, it } from "vitest";

import type { SchedulingItem } from "@/api/types";
import { ResourceType } from "@/constants";

import { mapSchedulingItemToCalendarItem } from "../mapSchedulingItem";

function schedulingItem(
  overrides: Partial<SchedulingItem> = {}
): SchedulingItem {
  return {
    id: 42,
    entity_type: ResourceType.JOB,
    type: "T",
    title: "Field drainage",
    start_date: "2026-04-10",
    end_date: "2026-04-12",
    extra_days: null,
    project_type: null,
    status: { id: 1, title: "In progress", color: "#3366ff" },
    contact_info: {
      id: 9,
      full_name: "Jane Farmer",
      address: "123 County Rd",
    },
    farm_name: "North Field",
    farm_id: 3,
    lead_source: null,
    url: "/jobs/42",
    is_completed: false,
    is_cancelled: false,
    is_archived: false,
    calendar_status: "in_progress",
    ...overrides,
  };
}

describe("mapSchedulingItemToCalendarItem", () => {
  it("returns null when dates are missing by default", () => {
    expect(
      mapSchedulingItemToCalendarItem(
        schedulingItem({ start_date: null, end_date: null })
      )
    ).toBeNull();
  });

  it("allows empty dates when explicitly opted in", () => {
    const mapped = mapSchedulingItemToCalendarItem(
      schedulingItem({ start_date: null, end_date: null }),
      { allowEmptyDates: true }
    );
    expect(mapped?.startDate).toBe("");
    expect(mapped?.endDate).toBe("");
  });

  it("returns null when type code is missing", () => {
    expect(
      mapSchedulingItemToCalendarItem(schedulingItem({ type: null }))
    ).toBeNull();
  });

  it("maps scheduling fields to calendar item shape", () => {
    const mapped = mapSchedulingItemToCalendarItem(schedulingItem());
    expect(mapped).toMatchObject({
      id: 42,
      kind: ResourceType.JOB,
      title: "Field drainage",
      category: "tile",
      client: "Jane Farmer",
      farmName: "North Field",
      location: "North Field",
      startDate: "2026-04-10",
      endDate: "2026-04-12",
      calendarStatus: "in_progress",
      barStatus: "inprogress",
      workflowStatus: {
        label: "In progress",
        tone: "blue",
        color: "#3366ff",
      },
    });
  });

  it("includes lead source only for leads", () => {
    const lead = mapSchedulingItemToCalendarItem(
      schedulingItem({
        entity_type: ResourceType.LEAD,
        lead_source: "Referral",
      })
    );
    expect(lead?.leadSource).toBe("Referral");

    const job = mapSchedulingItemToCalendarItem(
      schedulingItem({
        entity_type: ResourceType.JOB,
        lead_source: "Referral",
      })
    );
    expect(job?.leadSource).toBeUndefined();
  });
});
