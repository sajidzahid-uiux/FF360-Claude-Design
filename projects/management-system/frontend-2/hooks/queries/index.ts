export { useDevices } from "./useDevices";
export { useSeatUsage, type SeatUsageResponse } from "./useSeatUsage";
export { useLoginActivity } from "./useLoginActivity";
export { useContactCategories } from "./useContactCategories";
export type { ContactCategoryListParams } from "./useContactCategories";
export { useContact, useContacts } from "./useContacts";
export {
  QUICK_ACTIONS_QUERY_KEY,
  quickActionsKeys,
  useQuickAction,
  useQuickActionContactLookup,
  useQuickActions,
} from "./useQuickActions";

export { useFarm, useFarms } from "./useFarms";

export { useCalendarItems } from "./useCalendarItems";
export { useCalendarStatistics } from "./useCalendarStatistics";
export { useCalendarUnscheduledRecords } from "./useCalendarUnscheduledRecords";
export { useCalendarFilterOptions } from "./useCalendarFilterOptions";
export { useJobStatusesQuery } from "./useJobStatusesQuery";
export { useLeadStatusesQuery } from "./useLeadStatusesQuery";
export { useLeadTypesQuery } from "./useLeadTypesQuery";
export { useProjectTypesQuery } from "./useProjectTypesQuery";
export { useAllJobsQuery } from "./useAllJobsQuery";
export { useJobCommentsQuery, useJobFilesQuery } from "./useJobFilesQueries";
export { useLeadCommentsQuery, useLeadFilesQuery } from "./useLeadFilesQueries";
export { useJobStatusesSettingsQuery } from "./useJobStatusesSettingsQuery";
export { useLeadStatusesSettingsQuery } from "./useLeadStatusesSettingsQuery";
export { useLeadTypesSettingsQuery } from "./useLeadTypesSettingsQuery";
export { useLeadStatuses } from "./useLeadStatuses";
export { useLeadTypes } from "./useLeadTypes";
export { useLeadStatusesSettings } from "./useLeadStatusesSettings";
export { useLeadTypesSettings } from "./useLeadTypesSettings";
export { useOrganizationStatuses } from "./useOrganizationStatuses";
export { useOrganizationStatusesSettings } from "./useOrganizationStatusesSettings";

export {
  MAP_DATA_V2_QUERY_KEY,
  MAP_LEGENDS_QUERY_KEY,
  MAP_PIN_CATEGORIES_QUERY_KEY,
  MAP_PINS_QUERY_KEY,
} from "./mapQueryKeys";
export { useMapDataV2, type UseMapDataV2Options } from "./useMapDataV2";
export { useMapLegends } from "./useMapLegends";
export {
  useMapPinCategories,
  type UseMapPinCategoriesOptions,
} from "./useMapPinCategories";
export { useJobPins, useLeadPins } from "./useMapPins";

export { useTask, useTasks } from "./useTasks";
export { useTaskStatuses } from "./useTaskStatuses";
export { useTaskType, useTaskTypes } from "./useTaskTypes";

export { useIsAdmin } from "./useIsAdmin";

export { usePermission, usePermissions } from "./usePermissions";
export { useImportantNotificationSettings } from "./useImportantNotificationSettings";
export { useFyiNotificationSettings } from "./useFyiNotificationSettings";
export { useNewNotifications } from "./useNewNotifications";
export { useRole, useRoles } from "./useRoles";

export { useTeamMember, useTeamMembers } from "./useTeamMembers";

export {
  useActiveCrewGroups,
  useAllCrewGroups,
  useAvailableMembers,
  useCrewGroupById,
  useCrewGroupsList,
} from "./useCrewGroupsQueries";
export {
  useCrewDirectoryList,
  useCrewMemberById,
} from "./useCrewDirectoryQueries";
export {
  useAvailableCrewGroups,
  useAvailableIndividuals,
  useJobTeamList,
} from "./useJobCrewQueries";

export {
  ORDER_PIPE_CATEGORIES_QUERY_KEY,
  useOrderPipeCategories,
  type UseOrderPipeCategoriesOptions,
} from "./useOrderPipeQueries";
export {
  MAX_FAVORITE_VENDORS,
  normalizeFavoriteVendors,
  useFavoriteVendors,
  useVendors,
} from "./useVendorsQueries";
export {
  useCanProceed,
  useDeliveryLocation,
  usePipeDropPayload,
  useVendorForm,
  useVendorFormForOrderPipeView,
  useVendorFormsV2,
  type UseVendorFormOptions,
} from "./useVendorFormsQueries";

export {
  useHasPermission,
  useInvalidateUserPermissions,
  useUserPermissions,
  useUserRole,
} from "./useUserPermissions";

export { default as useSettings } from "./useSettings";
export { useWebActivityHeartbeat } from "./useWebActivityHeartbeat";

export { invalidateSubContactQueriesForParent } from "./invalidateSubContactQueries";
export { prefetchAllEquipment } from "./useEquipmentV2Queries";

export { INSTALLED_FOOTAGE_LOGS_QUERY_KEY } from "./installedFootageLogsQueryKeys";
export { useInstalledFootageLogs } from "./useInstalledFootageLogs";

export {
  FOOTAGE_ALL_JOBS_QUERY_KEY,
  FOOTAGE_TOTAL_QUERY_KEY,
  FOOTAGE_JOB_PAGE_QUERY_KEY,
} from "./footageQueryKeys";
export { useAllFootage, useTotalFootage } from "./footageQueries";

export { JOB_TIME_ENTRIES_QUERY_KEY } from "./timeTrackingQueryKeys";
export {
  JOB_TIME_ENTRIES_PREVIEW_PAGE_SIZE,
  jobTypeToTimeEntryApiParam,
  useJobTimeEntries,
  useJobTimeEntriesModalPage,
} from "./useJobTimeEntries";
export {
  INSTALLED_FOOTAGE_LOGS_MODAL_PAGE_SIZE,
  useInstalledFootageLogsPage,
} from "./useInstalledFootageLogsPage";

export {
  useBatteryTypeById,
  useBatteryTypes,
  useMachineBattery,
  useVehicleBattery,
} from "./useEquipmentBatteryQueries";
export {
  useAllEquipment,
  useMachineById,
  useMachines,
  useTrailerById,
  useTrailers,
  useVehicleById,
  useVehicles,
} from "./useEquipmentV2Queries";

export {
  useFinancialMachineAssignments,
  useJobById,
  useJobCorePointById,
  useJobCorePoints,
  useJobEstimate,
  useJobFinancial,
  useJobsByType,
  useJobsList,
} from "./useJobV2Queries";
export {
  equipmentHoursBreakdownQueryKey,
  useEquipmentHoursBreakdown,
} from "./useEquipmentHoursBreakdown";
export {
  useLeadById,
  useLeadCorePointById,
  useLeadCorePoints,
  useLeadsByType,
  useLeadsList,
} from "./useLeadV2Queries";

export { ACTIVITY_LOGS_QUERY_KEY } from "./activityLogsQueryKeys";
export {
  invalidateAllActivityLogsForOrg,
  invalidateContactActivityLogs,
  invalidateEquipmentActivityLogs,
  invalidateJobActivityLogs,
  invalidateLeadActivityLogs,
  invalidateOrderPipeActivityLogs,
} from "./invalidateActivityLogs";
export { useContactActivityLogs } from "./useContactActivityLogs";
export { useEquipmentActivityLogs } from "./useEquipmentActivityLogs";
export { useJobActivityLogs } from "./useJobActivityLogs";
export { useLeadActivityLogs } from "./useLeadActivityLogs";
export { useOrderPipeActivityLogs } from "./useOrderPipeActivityLogs";
