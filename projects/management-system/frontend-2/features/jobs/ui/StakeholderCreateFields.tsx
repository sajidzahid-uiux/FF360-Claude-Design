"use client";

import type { RecordFarm } from "@/api/types";
import { JobLeadTypeSegment } from "@/constants";
import { ResourceType } from "@/constants/enums";
import { getPrimaryFarmGeo } from "@/features/jobs";
import { normalizeIdArray } from "@/features/jobs/lib";
import { useRecordFarmsForContacts } from "@/hooks/useRecordData";

export { useStakeholderCreateFormState } from "./useStakeholderCreateFormState";

export function resolveStakeholderFormValues(
  values: Record<string, unknown>,
  farms: RecordFarm[]
): {
  contactIds: number[];
  farmIds: number[];
  geo: {
    latitude?: number;
    longitude?: number;
    vertices?: [number, number][] | null;
  };
} {
  const contactIds = normalizeIdArray(values.selectedContactIds);
  const farmIds = normalizeIdArray(values.selectedFarmIds);
  return {
    contactIds,
    farmIds,
    geo: getPrimaryFarmGeo(farmIds, farms),
  };
}

export function useStakeholderCreateFarms(
  contactIds: number[],
  jobType: JobLeadTypeSegment,
  resourceType: ResourceType
) {
  return useRecordFarmsForContacts(contactIds, { resourceType, jobType });
}
