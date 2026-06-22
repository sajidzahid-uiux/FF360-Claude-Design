"use client";

import { useMemo } from "react";

import { PERMISSION_RESOURCES } from "./constants";
import { resolveOrderPipePermissionFlags } from "./permissionRules";
import type { OrderPipePermissionFlags } from "./types";
import { usePermissionsFromStorage } from "./usePermissionsFromStorage";

export function useOrderPipePermissions(): OrderPipePermissionFlags {
  const { permissionCodes, isLoading } = usePermissionsFromStorage(
    PERMISSION_RESOURCES.ORDER_PIPES_LIST
  );

  return useMemo(
    () => ({
      ...resolveOrderPipePermissionFlags(permissionCodes),
      isLoading,
    }),
    [permissionCodes, isLoading]
  );
}
