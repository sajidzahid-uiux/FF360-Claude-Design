"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { ResourceType, jobLeadTypeSegmentToJobType } from "@/constants";
import type { CalendarItem } from "@/entities/calendar-item";
import { jobLeadSegmentFromCalendarCategory } from "@/entities/calendar-item";
import { StorageKey } from "@/hooks/storage-data";
import { isValidPermissionCode } from "@/utils/validation";

import { useIsAdmin } from "../queries/useIsAdmin";
import { usePersistentStorage } from "../usePersistentStorage";
import { PERMISSION_RESOURCES, type PermissionResource } from "./constants";
import { jobPageResourceForJobType } from "./jobPageResource";
import {
  type PermissionCodeMap,
  parsePermissionCodes,
} from "./parsePermissionCodes";
import { canEditCalendarScheduleForItem } from "./permissionRules";
import type { CalendarEntityPermissionFlags } from "./types";

export function calendarItemPageResource(
  item: CalendarItem
): PermissionResource {
  if (item.kind === ResourceType.LEAD) {
    return PERMISSION_RESOURCES.LEADS_PAGE;
  }
  const jobType = jobLeadTypeSegmentToJobType(
    jobLeadSegmentFromCalendarCategory(item.category)
  );
  return jobPageResourceForJobType(jobType);
}

function isTerminalCalendarItem(item: CalendarItem): boolean {
  return (
    item.calendarStatus === "completed" ||
    item.isCompleted === true ||
    item.isCancelled === true
  );
}

export function useCalendarEntityPermissions(): CalendarEntityPermissionFlags {
  const isAdmin = useIsAdmin();
  const storage = usePersistentStorage();
  const [storageTick, setStorageTick] = useState(0);

  useEffect(() => {
    const onStorage = () => setStorageTick((v) => v + 1);
    window.addEventListener("app-storage", onStorage);
    return () => window.removeEventListener("app-storage", onStorage);
  }, []);

  const { permissionCodesHydrated, permissionMap } = useMemo(() => {
    void storageTick;

    try {
      const raw = storage.getItem(StorageKey.PERM_CODES);
      if (raw === null) {
        return {
          permissionCodesHydrated: false,
          permissionMap: null as PermissionCodeMap | null,
        };
      }

      const parsed: unknown = JSON.parse(raw);

      if (!Array.isArray(parsed)) {
        return { permissionCodesHydrated: true, permissionMap: {} };
      }

      const codes = parsed.filter(
        (code): code is string =>
          typeof code === "string" && isValidPermissionCode(code)
      );

      return {
        permissionCodesHydrated: true,
        permissionMap: parsePermissionCodes(codes),
      };
    } catch {
      return { permissionCodesHydrated: true, permissionMap: {} };
    }
  }, [storage, storageTick]);

  const resolveRead = useCallback(
    (item: CalendarItem): boolean => {
      if (isAdmin) return true;
      if (!permissionCodesHydrated || !permissionMap) return true;
      const resource = calendarItemPageResource(item);
      return permissionMap[resource]?.read === true;
    },
    [isAdmin, permissionCodesHydrated, permissionMap]
  );

  const resolveWrite = useCallback(
    (item: CalendarItem): boolean => {
      if (isAdmin) return true;
      if (!permissionCodesHydrated || !permissionMap) return false;
      const resource = calendarItemPageResource(item);
      return permissionMap[resource]?.write === true;
    },
    [isAdmin, permissionCodesHydrated, permissionMap]
  );

  const canViewItem = useCallback(
    (item: CalendarItem) => resolveRead(item),
    [resolveRead]
  );

  const canEditScheduleForItem = useCallback(
    (item: CalendarItem) => {
      const hasRead = resolveRead(item);
      const hasPageWrite = resolveWrite(item);
      const hasCompletedCanceledPageWrite =
        permissionMap?.[PERMISSION_RESOURCES.COMPLETED_CANCELED_PAGE]?.write ===
        true;

      return canEditCalendarScheduleForItem({
        isAdmin,
        permissionsHydrated: permissionCodesHydrated,
        hasRead,
        hasPageWrite,
        hasCompletedCanceledPageWrite,
        isTerminal: isTerminalCalendarItem(item),
        isLead: item.kind === ResourceType.LEAD,
      });
    },
    [isAdmin, permissionCodesHydrated, permissionMap, resolveRead, resolveWrite]
  );

  const filterViewableItems = useCallback(
    (items: CalendarItem[]) => items.filter(canViewItem),
    [canViewItem]
  );

  return useMemo(
    () => ({
      permissionCodesHydrated,
      canViewItem,
      canEditScheduleForItem,
      filterViewableItems,
    }),
    [
      canEditScheduleForItem,
      canViewItem,
      filterViewableItems,
      permissionCodesHydrated,
    ]
  );
}
