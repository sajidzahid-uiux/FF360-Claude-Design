import type { VendorFormV2 } from "@/api/types";

// Vendor forms are transformed to add job_status (alias for vendor_status) for
// Kanban grouping; this type represents the enriched shape used in renderers.
export type TransformedVendorForm = VendorFormV2 & {
  job_status?: string | null;
};
