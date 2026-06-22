import { useQuery } from "@tanstack/react-query";

import type { OrganizationDashboardResponse } from "@/api/types/dashboard";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useRouteIds } from "@/hooks/useRouteIds";
import axiosInstance from "@/lib/axios";

export const useDashboardData = () => {
  const { orgId: organization } = useRouteIds();
  const { getAccessToken, loading: authLoading } = useAuth();

  const dashboardQuery = useQuery<OrganizationDashboardResponse>({
    queryKey: ["dashboardData", organization],
    enabled: Boolean(organization) && !authLoading,
    queryFn: async () => {
      if (!organization) {
        throw new Error("Missing required organization data");
      }

      const token = await getAccessToken();
      if (!token) {
        throw new Error("Missing required authentication");
      }

      const { data } = await axiosInstance.get<OrganizationDashboardResponse>(
        `ms/organizations/${organization}/dashboard`,
        {
          params: {
            include_archived: true,
          },
        }
      );

      return data;
    },
  });

  return {
    ...dashboardQuery,
  };
};
