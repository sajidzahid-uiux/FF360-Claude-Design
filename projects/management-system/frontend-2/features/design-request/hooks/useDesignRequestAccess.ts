"use client";

import { PermissionCode } from "@/constants";
import { useRoutePermissions } from "@/hooks/permissions";
import { useIsAdmin } from "@/hooks/queries/useIsAdmin";
import { useHasPermission } from "@/hooks/queries/useUserPermissions";

export function useDesignRequestAccess() {
  const isAdmin = useIsAdmin();
  const routePerms = useRoutePermissions();
  const { hasPermission: hasWrite, isLoading: writeLoading } = useHasPermission(
    PermissionCode.TD_INTEGRATION_WRITE
  );

  const canSubmit = isAdmin || hasWrite();
  const canView = canSubmit || Boolean(routePerms?.read);

  return {
    canSubmit,
    canView,
    isLoading: writeLoading,
  };
}
