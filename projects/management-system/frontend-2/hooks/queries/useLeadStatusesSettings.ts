import type { UseQueryResult } from "@tanstack/react-query";

import type { OrganizationLeadStatusSetting } from "@/api/types";

import { useLeadStatusSettingsMutations } from "../mutations/useLeadStatusMutations";
import { useLeadStatusesSettingsQuery } from "./useLeadStatusesSettingsQuery";

type LeadStatusSettingsMutations = ReturnType<
  typeof useLeadStatusSettingsMutations
>;

type UseLeadStatusesSettingsResult = UseQueryResult<
  OrganizationLeadStatusSetting[]
> &
  LeadStatusSettingsMutations;

export function useLeadStatusesSettings() {
  const statusesQuery = useLeadStatusesSettingsQuery();
  const { updateLeadStatus, deleteLeadStatus, addLeadStatus } =
    useLeadStatusSettingsMutations();

  return {
    ...statusesQuery,
    updateLeadStatus,
    deleteLeadStatus,
    addLeadStatus,
  } as UseLeadStatusesSettingsResult;
}

export default useLeadStatusesSettings;
