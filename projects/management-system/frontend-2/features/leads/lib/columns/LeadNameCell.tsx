"use client";

import { JobOrLeadListNameWithDescriptionCell } from "@/shared/ui";

import type { LeadTableRow } from "./types";

/** Lead row label: primary contact/farm with description preview below. */
export function LeadNameWithDescriptionCell({ row }: { row: LeadTableRow }) {
  return <JobOrLeadListNameWithDescriptionCell row={row} typeLabel="Lead" />;
}
