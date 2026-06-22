import type { QueryClient } from "@tanstack/react-query";

import type { JobUpdatePayload } from "@/api/types";

const STAKEHOLDER_JOB_UPDATE_KEYS = [
  "primary_contact_id",
  "primary_farm_id",
  "contact_ids",
  "farm_ids",
  "contact",
  "farm",
] as const;

export function jobUpdateAffectsStakeholderListViews(
  updatedJob: JobUpdatePayload
): boolean {
  return STAKEHOLDER_JOB_UPDATE_KEYS.some((key) => key in updatedJob);
}

/** Bookkeeping and Order Pipes list contact/farm labels come from job primary stakeholders. */
export function invalidateJobStakeholderDependentCaches(
  queryClient: QueryClient
): void {
  void queryClient.invalidateQueries({ queryKey: ["invoices"] });
  void queryClient.invalidateQueries({ queryKey: ["vendorFormsV2"] });
}
