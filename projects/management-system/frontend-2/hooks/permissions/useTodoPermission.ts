import { useMemo } from "react";

import { PERMISSION_RESOURCES } from "./constants";
import { resolveTodoPermissionFlags } from "./permissionRules";
import type { TodoPermissionFlags } from "./types";
import { useGetParsedStorageItem } from "./useDashboardPermissions";
import { usePermissionsFromStorage } from "./usePermissionsFromStorage";

export function useTodoPermission(): TodoPermissionFlags {
  const { permissionCodes: todoCodes, isLoading: todoLoading } =
    usePermissionsFromStorage(PERMISSION_RESOURCES.TODO_LIST);
  const { permissionCodes: editStatusCodes, isLoading: editStatusLoading } =
    usePermissionsFromStorage(PERMISSION_RESOURCES.TODO_LIST_EDIT_STATUS);
  const getParsedStorageItem = useGetParsedStorageItem();
  const userRole = getParsedStorageItem<{ name: string; role?: string }>(
    "userRole",
    { name: "", role: "" }
  );
  const userPermissionCodes = getParsedStorageItem<string[]>(
    "userPermissionCodes",
    []
  );

  return useMemo(() => {
    return {
      ...resolveTodoPermissionFlags(
        todoCodes,
        editStatusCodes,
        userRole.name,
        userPermissionCodes
      ),
      isLoading: todoLoading || editStatusLoading,
    };
  }, [
    todoCodes,
    editStatusCodes,
    todoLoading,
    editStatusLoading,
    userRole,
    userPermissionCodes,
  ]);
}
