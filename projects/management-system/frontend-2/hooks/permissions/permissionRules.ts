import type {
  DashboardChartData,
  DashboardJobStatusRow,
  DashboardJobStatusType,
  DashboardLeadTypeData,
  DashboardPendingApprovalRow,
} from "@/api/types";
import { JobType, PermissionCode } from "@/constants";

import { PERMISSION_RESOURCES } from "./constants";
import type { PermissionAction, PermissionResource } from "./constants";
import type { PagePermissions } from "./parsePermissionCodes";
import type {
  CompletedJobPermissionFlags,
  ContactPermissionFlags,
  DashboardPermissionFlags,
  FarmPermissionFlags,
  JobPermissionFlags,
  JobProgressPermissionFlags,
  OrderPipePermissionFlags,
  SettingsPermissionFlags,
  TodoPermissionFlags,
} from "./types";

export function resolveResourceCrudFlags(
  actions: readonly PermissionAction[]
): {
  canRead: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
} {
  const hasRead = actions.includes("read");
  const hasWrite = actions.includes("write");
  const hasDelete = actions.includes("delete");

  return {
    canRead: hasRead,
    canAdd: hasWrite,
    canEdit: hasWrite,
    canDelete: hasDelete,
  };
}

export function resolveJobPermissionFlags(
  pageActions: readonly PermissionAction[],
  editStatusActions: readonly PermissionAction[]
): Omit<JobPermissionFlags, "isLoading"> {
  return {
    ...resolveResourceCrudFlags(pageActions),
    canEditStatus: editStatusActions.includes("write"),
  };
}

export function resolveContactPermissionFlags(
  actions: readonly PermissionAction[]
): Pick<ContactPermissionFlags, "canRead" | "canAdd" | "canDelete"> {
  const crud = resolveResourceCrudFlags(actions);
  return {
    canRead: crud.canRead,
    canAdd: crud.canAdd,
    canDelete: crud.canDelete,
  };
}

export function resolveFarmPermissionFlags(
  actions: readonly PermissionAction[]
): Pick<FarmPermissionFlags, "canRead" | "canAdd" | "canEdit" | "canDelete"> {
  return resolveResourceCrudFlags(actions);
}

export function resolveSettingsPermissionFlags(
  actions: readonly PermissionAction[]
): Pick<SettingsPermissionFlags, "canRead" | "canAdd" | "canDelete"> {
  const crud = resolveResourceCrudFlags(actions);
  return {
    canRead: crud.canRead,
    canAdd: crud.canAdd,
    canDelete: crud.canDelete,
  };
}

export function resolveOrderPipePermissionFlags(
  actions: readonly PermissionAction[]
): Pick<OrderPipePermissionFlags, "canRead" | "canWrite" | "canDelete"> {
  return {
    canRead: actions.includes("read"),
    canWrite: actions.includes("write"),
    canDelete: actions.includes("delete"),
  };
}

export function resolveCrewManagementFlags(
  actions: readonly PermissionAction[]
): {
  canManageCrew: boolean;
} {
  return { canManageCrew: actions.includes("write") };
}

export function crewManagementResourceForJobType(
  jobType: JobType
): PermissionResource {
  switch (jobType) {
    case JobType.REPAIR:
      return PERMISSION_RESOURCES.JOBS_REPAIR_CREW_MANAGEMENT;
    case JobType.EXCAVATION:
      return PERMISSION_RESOURCES.JOBS_EXCAVATION_CREW_MANAGEMENT;
    case JobType.TILING:
      return PERMISSION_RESOURCES.JOBS_TILING_CREW_MANAGEMENT;
    default:
      return PERMISSION_RESOURCES.JOBS_REPAIR_CREW_MANAGEMENT;
  }
}

export function editStatusResourceForJobType(
  jobType: JobType
): PermissionResource {
  switch (jobType) {
    case JobType.REPAIR:
      return PERMISSION_RESOURCES.JOBS_REPAIR_EDIT_STATUS;
    case JobType.EXCAVATION:
      return PERMISSION_RESOURCES.JOBS_EXCAVATION_EDIT_STATUS;
    case JobType.TILING:
      return PERMISSION_RESOURCES.JOBS_TILING_EDIT_STATUS;
    default:
      return PERMISSION_RESOURCES.JOBS_REPAIR_EDIT_STATUS;
  }
}

export function resolveTodoPermissionFlags(
  todoActions: readonly PermissionAction[],
  editStatusActions: readonly PermissionAction[],
  roleName: string,
  userPermissionCodes: readonly string[]
): Pick<
  TodoPermissionFlags,
  "canRead" | "canEdit" | "canEditStatus" | "canDelete" | "isAdmin"
> {
  return {
    canRead: todoActions.includes("read"),
    canEdit: todoActions.includes("write"),
    canDelete: todoActions.includes("delete"),
    canEditStatus: editStatusActions.includes("write"),
    isAdmin: roleName === "Admin" || userPermissionCodes.includes("is_admin"),
  };
}

export function resolveIsAdminFromStorage(
  roleName: string,
  userPermissionCodes: readonly string[]
): boolean {
  return roleName === "Admin" || userPermissionCodes.includes("is_admin");
}

export function resolveIsBookkeeperFromStorage(
  roleName: string,
  userPermissionCodes: readonly string[]
): boolean {
  return (
    roleName === "Bookkeeper" || userPermissionCodes.includes("is_bookkeeper")
  );
}

export function resolveDashboardPermissionFlags(input: {
  permissionResources: readonly string[];
  roleName: string;
  userPermissionCodes: readonly string[];
  isAdmin: boolean;
}): Omit<DashboardPermissionFlags, "isLoading"> {
  const { permissionResources, roleName, userPermissionCodes, isAdmin } = input;

  const hasRepairJobAccess = permissionResources.includes(
    PERMISSION_RESOURCES.JOBS_REPAIR_PAGE
  );
  const hasExcavationJobAccess = permissionResources.includes(
    PERMISSION_RESOURCES.JOBS_EXCAVATION_PAGE
  );
  const hasTilingJobAccess = permissionResources.includes(
    PERMISSION_RESOURCES.JOBS_TILING_PAGE
  );
  const hasCompletedAccess = permissionResources.includes(
    PERMISSION_RESOURCES.COMPLETED_CANCELED_PAGE
  );
  const hasContactAccess = permissionResources.includes(
    PERMISSION_RESOURCES.CONTACT_ACCESS
  );
  const hasEquipmentAccess = permissionResources.includes(
    PERMISSION_RESOURCES.EQUIPMENT_PAGE
  );
  const hasLeadsAccess = permissionResources.includes(
    PERMISSION_RESOURCES.LEADS_PAGE
  );

  const hasAnyJobAccess =
    hasRepairJobAccess || hasExcavationJobAccess || hasTilingJobAccess;
  const hasNoDashboardAccess =
    !hasAnyJobAccess && !hasEquipmentAccess && !hasLeadsAccess;

  return {
    hasRepairJobAccess,
    hasExcavationJobAccess,
    hasTilingJobAccess,
    hasCompletedAccess,
    hasContactAccess,
    hasEquipmentAccess,
    hasLeadsAccess,
    isAdmin:
      isAdmin || resolveIsAdminFromStorage(roleName, userPermissionCodes),
    isBookkeeper: resolveIsBookkeeperFromStorage(roleName, userPermissionCodes),
    hasAnyJobAccess,
    hasNoDashboardAccess,
  };
}

export function resolveOrganizationSettingsFlags(teamOrg: PagePermissions): {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
} {
  return {
    canView: teamOrg.read,
    canEdit: teamOrg.write,
    canDelete: teamOrg.delete,
  };
}

export function resolveDesignRequestAccess(input: {
  isAdmin: boolean;
  hasTdIntegrationWrite: boolean;
  routeRead: boolean;
}): { canSubmit: boolean; canView: boolean } {
  const canSubmit = input.isAdmin || input.hasTdIntegrationWrite;
  return {
    canSubmit,
    canView: canSubmit || input.routeRead,
  };
}

export function resolveJobProgressPermissionFlags(input: {
  isAdmin: boolean;
  canAccessOnSiteTracking: boolean;
  jobType: JobType;
  canRead: boolean;
  canEdit: boolean;
}): Omit<JobProgressPermissionFlags, "isLoading"> {
  const canUpdate = input.isAdmin || input.canAccessOnSiteTracking;
  const canViewTilingFields = input.canRead && input.jobType === JobType.TILING;
  const canUpdateTilingFields =
    (input.canEdit || canUpdate) && input.jobType === JobType.TILING;

  return {
    canUpdateEquipmentHours: canUpdate,
    canUpdateTimeTracking:
      input.jobType === JobType.TILING ? canUpdateTilingFields : canUpdate,
    canUpdateInstalledFootage: canUpdateTilingFields,
    canUpdateInstalledRisers: canUpdateTilingFields,
    canViewInstalledFootage: canViewTilingFields,
    canViewInstalledRisers: canViewTilingFields,
  };
}

export function combineCompletedJobPermissionFlags(
  pagePermissions: { read?: boolean; write?: boolean; delete?: boolean } | null,
  jobTypePermissions: Partial<JobPermissionFlags>
): CompletedJobPermissionFlags {
  return {
    canRead: Boolean(pagePermissions?.read && jobTypePermissions.canRead),
    canEdit: Boolean(pagePermissions?.write && jobTypePermissions.canEdit),
    canDelete: Boolean(pagePermissions?.delete && jobTypePermissions.canDelete),
    canEditStatus: Boolean(
      pagePermissions?.write && jobTypePermissions.canEditStatus
    ),
    isLoading: jobTypePermissions.isLoading ?? false,
  };
}

export function resolveCompletedJobPageAccess(
  pagePermissions: { read?: boolean; write?: boolean; delete?: boolean } | null,
  jobTypePermissions: Array<
    Pick<JobPermissionFlags, "canRead" | "canEdit" | "canDelete">
  >
): {
  canViewPage: boolean;
  hasAnyWritePermission: boolean;
  hasAnyDeletePermission: boolean;
} {
  const anyJobRead = jobTypePermissions.some((job) => job.canRead);
  const anyJobEdit = jobTypePermissions.some((job) => job.canEdit);
  const anyJobDelete = jobTypePermissions.some((job) => job.canDelete);

  return {
    canViewPage: Boolean(pagePermissions?.read && anyJobRead),
    hasAnyWritePermission: Boolean(pagePermissions?.write && anyJobEdit),
    hasAnyDeletePermission: Boolean(pagePermissions?.delete && anyJobDelete),
  };
}

export function terminalJobSchedulingPermissionCodes(
  jobType: JobType
): PermissionCode[] {
  switch (jobType) {
    case JobType.TILING:
      return [
        PermissionCode.COMPLETED_CANCELED_PAGE_WRITE,
        PermissionCode.JOBS_TILING_PAGE_WRITE,
      ];
    case JobType.EXCAVATION:
      return [
        PermissionCode.COMPLETED_CANCELED_PAGE_WRITE,
        PermissionCode.JOBS_EXCAVATION_PAGE_WRITE,
      ];
    case JobType.REPAIR:
    default:
      return [
        PermissionCode.COMPLETED_CANCELED_PAGE_WRITE,
        PermissionCode.JOBS_REPAIR_PAGE_WRITE,
      ];
  }
}

export function canEditTerminalJobSchedulingFromCodes(
  isAdmin: boolean,
  permissionCodes: string[] | undefined,
  jobType: JobType
): boolean {
  if (isAdmin) return true;
  if (!permissionCodes) return false;
  return terminalJobSchedulingPermissionCodes(jobType).every((code) =>
    permissionCodes.includes(code)
  );
}

export function canEditCalendarScheduleForItem(input: {
  isAdmin: boolean;
  permissionsHydrated: boolean;
  hasRead: boolean;
  hasPageWrite: boolean;
  hasCompletedCanceledPageWrite: boolean;
  isTerminal: boolean;
  isLead: boolean;
}): boolean {
  if (!input.hasRead) return false;

  if (input.isTerminal) {
    if (input.isLead) return false;
    if (input.isAdmin) return true;
    if (!input.permissionsHydrated) return false;
    return input.hasCompletedCanceledPageWrite && input.hasPageWrite;
  }

  return input.hasPageWrite;
}

export function hasCompletedCanceledPageWrite(
  permissionCodes: string[]
): boolean {
  return permissionCodes.includes(
    `${PERMISSION_RESOURCES.COMPLETED_CANCELED_PAGE}_write`
  );
}

export function extractActionsForResource(
  codes: readonly string[],
  resource: PermissionResource
): PermissionAction[] {
  const prefix = `${resource}_`;
  return codes
    .filter((code) => code.startsWith(prefix))
    .map((code) => code.slice(prefix.length))
    .filter(
      (action): action is PermissionAction =>
        action === "read" || action === "write" || action === "delete"
    );
}

export function extractResourcesWithReadPermission(
  codes: readonly string[]
): string[] {
  return codes
    .filter((code) => code.endsWith("_read"))
    .map((code) => code.slice(0, -5));
}

export function resolveHasPermissionFromCodes(
  codes: string[] | undefined,
  required: string | readonly string[],
  mode: "any" | "all" = "any"
): boolean {
  const requiredCodes = Array.isArray(required) ? required : [required];
  if (requiredCodes.length === 0 || !codes) return false;
  return mode === "all"
    ? requiredCodes.every((code) => codes.includes(code))
    : requiredCodes.some((code) => codes.includes(code));
}

export type DashboardChartDataForFiltering = Required<
  Pick<
    DashboardChartData,
    "jobStatusData" | "pendingApprovalData" | "leadTypeData"
  >
>;

export type JobStatusChartDataRow = Record<string, string | number>;

export function filterDashboardChartDataByPermissions(
  dashboardData: DashboardChartDataForFiltering,
  access: Pick<
    DashboardPermissionFlags,
    | "hasRepairJobAccess"
    | "hasExcavationJobAccess"
    | "hasTilingJobAccess"
    | "hasLeadsAccess"
    | "hasCompletedAccess"
  >
): {
  filteredJobStatusData: JobStatusChartDataRow[];
  filteredPendingApprovalData: DashboardPendingApprovalRow[];
  filteredLeadTypeData: DashboardLeadTypeData;
} {
  const jobPermissions = {
    Repair: access.hasRepairJobAccess,
    Excavation: access.hasExcavationJobAccess,
    Tile: access.hasTilingJobAccess,
  } as const;

  const filteredJobStatusData = dashboardData.jobStatusData
    .filter(
      (item: DashboardJobStatusRow) =>
        jobPermissions[item.type as DashboardJobStatusType] || false
    )
    .map((item: DashboardJobStatusRow): JobStatusChartDataRow => {
      if (!access.hasCompletedAccess) {
        return {
          type: item.type,
          Active: item.Active,
        };
      }
      return {
        type: item.type,
        Active: item.Active,
        ...(item.Completed !== undefined ? { Completed: item.Completed } : {}),
        ...(item.Cancelled !== undefined ? { Cancelled: item.Cancelled } : {}),
      };
    });

  const filteredPendingApprovalData = dashboardData.pendingApprovalData.filter(
    (item: DashboardPendingApprovalRow) =>
      jobPermissions[item.type as DashboardJobStatusType] || false
  );

  const filteredLeadTypeData = {
    title: dashboardData.leadTypeData.title,
    legend: access.hasLeadsAccess ? dashboardData.leadTypeData.legend : {},
  };

  return {
    filteredJobStatusData,
    filteredPendingApprovalData,
    filteredLeadTypeData,
  };
}

export const JOB_TAB_READ_CODES = {
  excavationEstimateFinancial:
    PermissionCode.JOBS_EXCAVATION_ESTIMATE_FINANCIAL_READ,
  tilingEstimateFinancial: PermissionCode.JOBS_TILING_ESTIMATE_FINANCIAL_READ,
} as const;

export const JOB_TAB_WRITE_CODES = {
  excavationEstimateFinancial:
    PermissionCode.JOBS_EXCAVATION_ESTIMATE_FINANCIAL_WRITE,
  tilingEstimateFinancial: PermissionCode.JOBS_TILING_ESTIMATE_FINANCIAL_WRITE,
} as const;

export function resolveJobTabPermissionFromCodes(
  permissionCodes: string[] | undefined,
  permissionCode: PermissionCode,
  isLoading: boolean
): boolean {
  if (isLoading) return false;
  return resolveHasPermissionFromCodes(permissionCodes, permissionCode);
}
