import type { UseQueryResult } from "@tanstack/react-query";

import type { OrganizationLeadTypeSetting } from "@/api/types";

import { useLeadTypeSettingsMutations } from "../mutations/useLeadTypeMutations";
import { useLeadTypesSettingsQuery } from "./useLeadTypesSettingsQuery";

type LeadTypeSettingsMutations = ReturnType<
  typeof useLeadTypeSettingsMutations
>;

type UseLeadTypesSettingsResult = UseQueryResult<
  OrganizationLeadTypeSetting[]
> &
  LeadTypeSettingsMutations;

export function useLeadTypesSettings({
  enabled = true,
}: { enabled?: boolean } = {}) {
  const typesQuery = useLeadTypesSettingsQuery({ enabled });
  const { updateLeadType, deleteLeadType, addLeadType } =
    useLeadTypeSettingsMutations();

  return {
    ...typesQuery,
    updateLeadType,
    deleteLeadType,
    addLeadType,
  } as UseLeadTypesSettingsResult;
}

export default useLeadTypesSettings;
