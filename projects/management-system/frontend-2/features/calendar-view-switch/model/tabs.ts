import type { TabsSwitcherItem } from "@fieldflow360/org-ui";

import type { CalendarTimelineMode, CalendarTimelineScale } from "./types";

export const CALENDAR_MODE_TABS: TabsSwitcherItem<CalendarTimelineMode>[] = [
  { value: "timeline", label: "Timeline Mode" },
  { value: "grid", label: "Grid Mode" },
];

export const SCALE_TABS: TabsSwitcherItem<CalendarTimelineScale>[] = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];
