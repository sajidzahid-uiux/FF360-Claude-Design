export {
  permFor,
  PERMISSION_RESOURCES,
  type PermissionKey,
  type PermissionResource,
} from "./constants";
export {
  PageResource,
  parsePermissionCodes,
  type PagePermissions,
  type PermissionCodeMap,
} from "./parsePermissionCodes";
export type { MatchedRoutePermission } from "./matchAppRoutePermission";

export {
  useHasExcavationEstimateFinancialWritePermission,
  useHasExcavationEstimateTabPermission,
  useHasExcavationFinancialTabPermission,
  useHasTilingEstimateFinancialWritePermission,
  useHasTilingEstimateTabPermission,
  useHasTilingFinancialTabPermission,
} from "./useJobTabPermissions";

export { useRoutePermissions } from "./useRoutePermissions";

export { usePermissionsFromStorage } from "./usePermissionsFromStorage";

export {
  useDashboardDataFiltering,
  useDashboardPermissions,
  useGetParsedStorageItem,
} from "./useDashboardPermissions";

export { useJobCrewPermissions } from "./useJobCrewPermissions";
export { useJobPermissions } from "./useJobPermissions";
export { useJobProgressPermissions } from "./useJobProgressPermissions";
export { useCompletedJobPermissions } from "./useCompletedJobPermissions";

export { useSettingsPermissions } from "./useSettingsPermissions";
export { useContactPermissions } from "./useContactPermissions";
export { useFarmPermissions } from "./useFarmPermissions";
export { useTodoPermission } from "./useTodoPermission";
export { useOrderPipePermissions } from "./useOrderPipePermissions";

export {
  calendarItemPageResource,
  useCalendarEntityPermissions,
} from "./useCalendarEntityPermissions";

export { useCanEditTerminalJobScheduling } from "./useCanEditTerminalJobScheduling";

export { useMajorRoleAccess } from "./useMajorRoleAccess";

export {
  getEquipmentNotesTabAccess,
  hasEquipmentPageReadPermission,
  hasEquipmentPageWritePermission,
  resolveEquipmentCommentPermissions,
  useEquipmentPermissions,
} from "./useEquipmentPermissions";

export type {
  CalendarEntityPermissionFlags,
  CompletedJobPermissionFlags,
  ContactPermissionFlags,
  DashboardPermissionFlags,
  FarmPermissionFlags,
  JobCrewPermissionFlags,
  JobPermissionFlags,
  JobProgressPermissionFlags,
  OrderPipePermissionFlags,
  SettingsPermissionFlags,
  TodoPermissionFlags,
} from "./types";

/** @deprecated Use OrderPipePermissionFlags from `./types`. */
export type { OrderPipePermissionFlags as OrderPipePermissions } from "./types";
