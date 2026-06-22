"use client";

import { useMemo } from "react";

import type { DashboardChartData } from "@/api/types";
import { useIsAdmin } from "@/hooks/queries";
import { StorageKey } from "@/hooks/storage-data";
import { usePersistentStorage } from "@/hooks/usePersistentStorage";

import { usePermissionsFromStorage } from "./usePermissionsFromStorage";
import {
  filterDashboardChartDataByPermissions,
  resolveDashboardPermissionFlags,
} from "./permissionRules";
import type { DashboardPermissionFlags } from "./types";

export function useGetParsedStorageItem() {
  const storage = usePersistentStorage();

  const getParsedStorageItem = useMemo(() => {
    return <T>(key: string, defaultValue: T): T => {
      try {
        const item = storage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch {
        return defaultValue;
      }
    };
  }, [storage]);

  return getParsedStorageItem;
}

export function useDashboardPermissions(): DashboardPermissionFlags {
  const { permissionCodes, isLoading } = usePermissionsFromStorage();
  const getParsedStorageItem = useGetParsedStorageItem();
  const isAdmin = useIsAdmin();

  const permissions = useMemo(() => {
    const userRole = getParsedStorageItem<{
      name: string;
      role?: string;
      is_admin?: boolean;
    }>(StorageKey.USER_ROLE, { name: "", role: "" });
    const userPermissionCodes = getParsedStorageItem<string[]>(
      "userPermissionCodes",
      []
    );

    return {
      ...resolveDashboardPermissionFlags({
        permissionResources: permissionCodes,
        roleName: userRole.name,
        userPermissionCodes,
        isAdmin,
      }),
      isLoading,
    };
  }, [permissionCodes, isLoading, getParsedStorageItem, isAdmin]);

  return permissions;
}

export function useDashboardDataFiltering(
  dashboardData: DashboardChartData | null | undefined
) {
  const {
    hasRepairJobAccess,
    hasExcavationJobAccess,
    hasTilingJobAccess,
    hasLeadsAccess,
    hasCompletedAccess,
  } = useDashboardPermissions();

  const filteredData = useMemo(() => {
    // Return empty data if no dashboardData provided
    if (
      !dashboardData ||
      !dashboardData.jobStatusData ||
      !dashboardData.pendingApprovalData ||
      !dashboardData.leadTypeData
    ) {
      return {
        filteredJobStatusData: [],
        filteredPendingApprovalData: [],
        filteredLeadTypeData: { title: "", legend: {} },
      };
    }

    return filterDashboardChartDataByPermissions(
      {
        jobStatusData: dashboardData.jobStatusData,
        pendingApprovalData: dashboardData.pendingApprovalData,
        leadTypeData: dashboardData.leadTypeData,
      },
      {
        hasRepairJobAccess,
        hasExcavationJobAccess,
        hasTilingJobAccess,
        hasLeadsAccess,
        hasCompletedAccess,
      }
    );
  }, [
    dashboardData,
    hasRepairJobAccess,
    hasExcavationJobAccess,
    hasTilingJobAccess,
    hasLeadsAccess,
    hasCompletedAccess,
  ]);

  return filteredData;
}
