"use client";

import { useMemo, useState } from "react";

import { JobLeadTypeSegment } from "@/constants";
import { ResourceType } from "@/constants/enums";
import { parseUrlIdParam } from "@/features/jobs/lib";

import { useStakeholderCreateFarms } from "./StakeholderCreateFields";

export function useStakeholderCreateFormState(
  contactIdParam: string | null,
  farmIdParam: string | null,
  jobType: JobLeadTypeSegment,
  resourceType: ResourceType
) {
  const initialContactIds = useMemo(() => {
    const id = parseUrlIdParam(contactIdParam);
    return id != null ? [id] : [];
  }, [contactIdParam]);

  const initialFarmIds = useMemo(() => {
    const id = parseUrlIdParam(farmIdParam);
    return id != null ? [id] : [];
  }, [farmIdParam]);

  const [draftContactIds, setDraftContactIds] =
    useState<number[]>(initialContactIds);
  const [draftFarmIds, setDraftFarmIds] = useState<number[]>(initialFarmIds);

  const { farms } = useStakeholderCreateFarms(
    draftContactIds,
    jobType,
    resourceType
  );

  const stakeholderInitialValues = useMemo(
    () => ({
      selectedContactIds: initialContactIds,
      selectedFarmIds: initialFarmIds,
    }),
    [initialContactIds, initialFarmIds]
  );

  return {
    initialContactIds,
    initialFarmIds,
    stakeholderInitialValues,
    draftContactIds,
    setDraftContactIds,
    draftFarmIds,
    setDraftFarmIds,
    farms,
  };
}
