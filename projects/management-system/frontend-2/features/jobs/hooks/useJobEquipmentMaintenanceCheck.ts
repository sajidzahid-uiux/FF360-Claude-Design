"use client";

import { useEffect, useState } from "react";

import { JobType } from "@/constants";
import useCheckForEquipmentMaintenance from "@/features/equipment/hooks/useCheckForEquipmentMaintenance";
import { getMaintenanceJobTypeParam } from "@/features/jobs";
import type { EquipmentMaintenanceCheckResponse } from "@/features/jobs";

const EMPTY_MAINTENANCE: EquipmentMaintenanceCheckResponse = {
  need_maintenance: [],
  close_to_maintenance: [],
};

export function useJobEquipmentMaintenanceCheck(
  jobId: number,
  jobType: JobType,
  farmerJob: boolean
) {
  const jobTypeParam = getMaintenanceJobTypeParam(jobType, farmerJob);
  const jobIdStr = String(jobId);

  const { maintenanceCheckQuery, maintenanceCheckMutation } =
    useCheckForEquipmentMaintenance({
      jobId: jobIdStr,
      jobType: jobTypeParam,
    });

  const [maintenanceCheck, setMaintenanceCheck] =
    useState<EquipmentMaintenanceCheckResponse>(EMPTY_MAINTENANCE);

  useEffect(() => {
    if (maintenanceCheckQuery.data) {
      setMaintenanceCheck(maintenanceCheckQuery.data);
    }
  }, [maintenanceCheckQuery.data]);

  const refetchMaintenance = async () => {
    try {
      const data = await maintenanceCheckMutation.mutateAsync({
        jobId: jobIdStr,
        jobType: jobTypeParam,
      });
      setMaintenanceCheck(data ?? EMPTY_MAINTENANCE);
      return data ?? EMPTY_MAINTENANCE;
    } catch {
      setMaintenanceCheck(EMPTY_MAINTENANCE);
      return EMPTY_MAINTENANCE;
    }
  };

  return {
    maintenanceCheck,
    maintenanceLoading: maintenanceCheckQuery.isLoading,
    refetchMaintenance,
  };
}
