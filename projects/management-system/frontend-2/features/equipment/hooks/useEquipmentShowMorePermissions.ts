import { useEquipmentPermissions } from "@/hooks/permissions";

interface UseEquipmentShowMorePermissionsArgs {
  canRead?: boolean;
  canWrite?: boolean;
  isTrashed?: boolean;
}

export function useEquipmentShowMorePermissions({
  canRead = true,
  canWrite = true,
  isTrashed = false,
}: UseEquipmentShowMorePermissionsArgs) {
  const equipmentPerms = useEquipmentPermissions();
  const effectiveCanRead = equipmentPerms.canRead && canRead;
  const effectiveCanWrite = equipmentPerms.canWrite && canWrite && !isTrashed;
  const isDisabled = isTrashed || !effectiveCanRead;

  return {
    effectiveCanRead,
    effectiveCanWrite,
    isDisabled,
  };
}
