import { useQuery } from "@tanstack/react-query";

import type { OrganizationDashboardResponse } from "@/api/types/dashboard";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useRouteIds } from "@/hooks/useRouteIds";
import axiosInstance from "@/lib/axios";

/**
 * Bounded time window the dashboard reports on.
 * `current_month` is the default landing paradigm — immediately actionable
 * context scoped to the active calendar month. `all_time` restores the
 * historical aggregate (the previous behaviour).
 */
export type DashboardPeriod = "current_month" | "all_time";

export const DEFAULT_DASHBOARD_PERIOD: DashboardPeriod = "current_month";

/** First/last calendar day of the month `reference` falls in, as `YYYY-MM-DD`. */
export function getCurrentMonthRange(reference: Date = new Date()): {
  startDate: string;
  endDate: string;
} {
  const year = reference.getFullYear();
  const month = reference.getMonth();
  const toIso = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };
  return {
    startDate: toIso(new Date(year, month, 1)),
    endDate: toIso(new Date(year, month + 1, 0)),
  };
}

export const useDashboardData = (
  period: DashboardPeriod = DEFAULT_DASHBOARD_PERIOD
) => {
  const { orgId: organization } = useRouteIds();
  const { getAccessToken, loading: authLoading } = useAuth();

  const dashboardQuery = useQuery<OrganizationDashboardResponse>({
    queryKey: ["dashboardData", organization, period],
    enabled: Boolean(organization) && !authLoading,
    queryFn: async () => {
      if (!organization) {
        throw new Error("Missing required organization data");
      }

      const token = await getAccessToken();
      if (!token) {
        throw new Error("Missing required authentication");
      }

      // Current-month is bounded to the active calendar month; all-time keeps
      // the historical aggregate (which also surfaces archived records).
      const params =
        period === "current_month"
          ? { period, ...getCurrentMonthRange() }
          : { period, include_archived: true };

      const { data } = await axiosInstance.get<OrganizationDashboardResponse>(
        `ms/organizations/${organization}/dashboard`,
        { params }
      );

      return data;
    },
  });

  return {
    ...dashboardQuery,
  };
};
