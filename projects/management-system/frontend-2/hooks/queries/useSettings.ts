import { useQuery } from "@tanstack/react-query";

import { API_ENDPOINTS } from "@/api/endpoints";
import axiosInstance from "@/lib/axios";

import { usePatchSettingsMutation } from "../mutations/useSettingsMutation";
import { useRouteIds } from "../useRouteIds";

function useSettings() {
  const { orgId: organizationId } = useRouteIds();

  const settingsQuery = useQuery({
    queryKey: ["settings", organizationId],
    queryFn: async () => {
      if (!organizationId) throw new Error("No organization");
      const response = await axiosInstance.get(
        API_ENDPOINTS.organizations.settings(organizationId)
      );

      if (response.status !== 200) {
        throw new Error("Failed to fetch settings");
      }

      return response.data;
    },
    enabled: !!organizationId,
  });

  const settingsPatchMutation = usePatchSettingsMutation();

  return { ...settingsQuery, settingsPatchMutation };
}

export default useSettings;
