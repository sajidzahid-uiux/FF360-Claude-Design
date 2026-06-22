import { useQuery } from "@tanstack/react-query";

import type { OrganizationSettings } from "@/api/types";
import { useRouteIds } from "@/hooks/lib/useRouteIds";
import axiosInstance from "@/lib/axios";

export const useOrganizationSettingsData = () => {
  const { orgId: organization } = useRouteIds();
  const organizationSettingsQuery = useQuery<OrganizationSettings>({
    queryKey: ["OrganizationsSettings"],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `ms/organizations/${organization}/settings/`
      );
      return response.data;
    },
  });

  return {
    ...organizationSettingsQuery,
  };
};
