import type { CalendarItem } from "@/entities/calendar-item";

/**
 * Client-side capability flags derived from stored permission_codes.
 * These are not backend API types — use Permission / UserPermissionsResponse from `@/api/types`.
 */

export type JobPermissionFlags = {
  canRead: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canEditStatus: boolean;
  canDelete: boolean;
  isLoading: boolean;
};

/** Page + job-type permissions attached to completed/cancelled job table rows. */
export type CompletedJobPermissionFlags = {
  canRead: boolean | undefined;
  canEdit: boolean | undefined;
  canDelete: boolean | undefined;
  canEditStatus: boolean | undefined;
  isLoading: boolean | undefined;
};

export type ContactPermissionFlags = {
  canRead: boolean;
  canAdd: boolean;
  canDelete: boolean;
  isLoading: boolean;
};

export type FarmPermissionFlags = {
  canRead: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  isLoading: boolean;
};

export type SettingsPermissionFlags = {
  canRead: boolean;
  canAdd: boolean;
  canDelete: boolean;
  isLoading: boolean;
};

export type OrderPipePermissionFlags = {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  isLoading: boolean;
};

export type JobProgressPermissionFlags = {
  canUpdateEquipmentHours: boolean;
  canUpdateTimeTracking: boolean;
  canUpdateInstalledFootage: boolean;
  canUpdateInstalledRisers: boolean;
  canViewInstalledFootage: boolean;
  canViewInstalledRisers: boolean;
  isLoading: boolean;
};

export type JobCrewPermissionFlags = {
  canManageCrew: boolean;
  isLoading: boolean;
};

export type DashboardPermissionFlags = {
  hasRepairJobAccess: boolean;
  hasExcavationJobAccess: boolean;
  hasTilingJobAccess: boolean;
  hasCompletedAccess: boolean;
  hasContactAccess: boolean;
  hasEquipmentAccess: boolean;
  hasLeadsAccess: boolean;
  isAdmin: boolean;
  isBookkeeper: boolean;
  hasAnyJobAccess: boolean;
  hasNoDashboardAccess: boolean;
  isLoading: boolean;
};

export type TodoPermissionFlags = {
  canRead: boolean;
  canEdit: boolean;
  canEditStatus: boolean;
  canDelete: boolean;
  isAdmin: boolean;
  isLoading: boolean;
};

export type CalendarEntityPermissionFlags = {
  permissionCodesHydrated: boolean;
  canViewItem: (item: CalendarItem) => boolean;
  canEditScheduleForItem: (item: CalendarItem) => boolean;
  filterViewableItems: (items: CalendarItem[]) => CalendarItem[];
};
