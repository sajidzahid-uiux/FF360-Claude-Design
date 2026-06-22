"use client";

import { useEffect, useMemo } from "react";

import type { DesignRequestStatusItem } from "@/api/types/designRequest";

import { pickLatestDesignRequestStatus } from "../lib/pick-latest-design-request-status";
import { useDesignRequestOptimisticStatusSync } from "../model/design-request-panel-store";
import { useDesignRequestTargetStatus } from "./useDesignRequestTargetStatus";

export function useDesignRequestEffectiveStatus(
  organizationId: string | undefined,
  sourceType: "job" | "lead" | undefined,
  sourceId: number | undefined,
  enabled: boolean
): DesignRequestStatusItem | null {
  const { optimisticStatus, setOptimisticStatus } =
    useDesignRequestOptimisticStatusSync();

  const { data: statusItems = [] } = useDesignRequestTargetStatus(
    organizationId,
    sourceType,
    sourceId,
    enabled
  );

  const statusItem = useMemo(
    () => pickLatestDesignRequestStatus(statusItems),
    [statusItems]
  );

  useEffect(() => {
    if (!optimisticStatus || !statusItem) return;
    if (
      statusItem.id === optimisticStatus.id &&
      statusItem.updated_at !== optimisticStatus.updated_at
    ) {
      setOptimisticStatus(statusItem);
    }
  }, [optimisticStatus, setOptimisticStatus, statusItem]);

  return optimisticStatus ?? statusItem;
}
