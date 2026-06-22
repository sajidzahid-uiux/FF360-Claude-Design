import { describe, expect, it } from "vitest";

import { ResourceType } from "@/constants";

import type { CalendarItem } from "../../model/types";
import { getEntityRoute } from "../getEntityRoute";

function calendarItem(
  overrides: Partial<CalendarItem> &
    Pick<CalendarItem, "id" | "kind" | "category">
): CalendarItem {
  return {
    title: "Test",
    location: "Farm",
    startDate: "2026-04-01",
    endDate: "2026-04-02",
    workflowStatus: { label: "Active", tone: "blue" },
    barStatus: "inprogress",
    ...overrides,
  };
}

describe("getEntityRoute", () => {
  const orgId = "org-1";

  it("routes completed jobs to the completed detail page", () => {
    const route = getEntityRoute(
      calendarItem({
        id: 10,
        kind: ResourceType.JOB,
        category: "tile",
        isCompleted: true,
      }),
      orgId
    );
    expect(route).toBe("/organizations/org-1/completed/10");
  });

  it("routes active jobs by category slug", () => {
    expect(
      getEntityRoute(
        calendarItem({ id: 5, kind: ResourceType.JOB, category: "excavation" }),
        orgId
      )
    ).toBe("/organizations/org-1/jobs/excavation/5");
  });

  it("routes leads by category slug", () => {
    expect(
      getEntityRoute(
        calendarItem({ id: 7, kind: ResourceType.LEAD, category: "repair" }),
        orgId
      )
    ).toBe("/organizations/org-1/leads/repair/7");
  });
});
