import { format } from "date-fns";

import type { TimeEntry } from "@/api/types/jobTimeEntries";

import type { InstalledHoursLogRow } from "./model/types";

export function mapTimeEntriesToInstalledHoursRows(
  entries: TimeEntry[]
): InstalledHoursLogRow[] {
  return entries.map((e) => ({
    id: String(e.id),
    enteredByMemberId: Number(e.entered_by),
    member: e.entered_by_name,
    date: format(new Date(e.timestamp), "MM/dd/yyyy"),
    hours: e.hours,
    description: e.description ?? "",
  }));
}
