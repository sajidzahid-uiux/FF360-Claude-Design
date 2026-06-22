import type { Lead, LeadStatus, LeadTypeInfo } from "@/api/types";

/**
 * Lead row in list/table views — API may send `lead_status` / `lead_type` as ids or objects.
 */
export type LeadTableRow = Omit<Lead, "lead_status" | "lead_type"> & {
  lead_status?: LeadStatus | number | null;
  lead_type?: LeadTypeInfo | number | null;
  last_updated_by?: number;
};
