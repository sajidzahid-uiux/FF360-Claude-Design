import { JobLeadEntityType, ResourceType } from "@/constants";
import { orgScopedPath } from "@/lib/auth-routes";

import type { CalendarItem } from "../model/types";
import { calendarCategoryToRouteSegment } from "./jobLeadTypeMapping";

export function getEntityRoute(item: CalendarItem, orgId: string): string {
  const id = String(item.id);
  if (item.kind === ResourceType.JOB && item.isCompleted) {
    return orgScopedPath(orgId, "completed", id);
  }
  const slug = calendarCategoryToRouteSegment(item.category);
  const root =
    item.kind === ResourceType.JOB
      ? JobLeadEntityType.JOBS
      : JobLeadEntityType.LEADS;
  return orgScopedPath(orgId, root, slug, id);
}
