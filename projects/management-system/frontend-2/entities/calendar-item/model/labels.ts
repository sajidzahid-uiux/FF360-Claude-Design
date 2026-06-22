import { ResourceType } from "@/constants";

import type { CalendarBarStatus, CalendarItemKind } from "./types";

/** Display label for the kind enum, shown in pills and modal rows. */
export const KIND_LABEL: Record<CalendarItemKind, string> = {
  [ResourceType.JOB]: "Job",
  [ResourceType.LEAD]: "Lead",
};

/** Display label for the timeline-bar status enum. */
export const STATUS_LABEL_TEXT: Record<CalendarBarStatus, string> = {
  overdue: "Overdue",
  inprogress: "Inprogress",
  completed: "Completed",
  lead: "Lead",
  not_started: "Not Started",
};
