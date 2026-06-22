/** REST job URLs / mutations (`drainage_tiling`, `excavation`, `repair`). */
export enum JobType {
  TILING = "drainage_tiling",
  EXCAVATION = "excavation",
  REPAIR = "repair",
}

/** REST lead URLs / mutations — same slug values as {@link JobType}. */
export enum LeadType {
  TILING = "drainage_tiling",
  EXCAVATION = "excavation",
  REPAIR = "repair",
}

/** URL segment under `/organizations/[orgId]/` for jobs vs leads routes. */
export enum JobLeadEntityType {
  JOBS = "jobs",
  LEADS = "leads",
}

export function isJobLeadEntityType(
  value: string | null | undefined
): value is JobLeadEntityType {
  return value === JobLeadEntityType.JOBS || value === JobLeadEntityType.LEADS;
}

export enum MapViewTab {
  JOBS_LEADS = "jobs-leads",
  CONTACTS = "contacts",
}

export enum ResourceType {
  JOB = "job",
  LEAD = "lead",
}

/** Singular job vs lead entity (calendar, forms, ShowMoreCard, list actions). */
export type JobLeadEntity = ResourceType;

export const JOB_LEAD_ENTITIES = [ResourceType.JOB, ResourceType.LEAD] as const;

export function isJobLeadEntity(
  value: string | null | undefined
): value is JobLeadEntity {
  return value === ResourceType.JOB || value === ResourceType.LEAD;
}

/** Active vs archived tab on job/lead list pages. */
export type JobLeadArchiveTab = "active" | "archived";

export function isJobLeadArchiveTab(value: string): value is JobLeadArchiveTab {
  return value === "active" || value === "archived";
}

/** Activity log API `module` (backend `ActivityLog.MODULE_*`). */
export enum ActivityLogModule {
  JOB = "job",
  LEAD = "lead",
  COMPLETED_CANCELED = "co_ca",
  CONTACT = "contact",
  EQUIPMENT = "equipment",
  ORDER_PIPE = "orderpipe",
}

/** Job/lead activity log entities — same values as {@link ResourceType}. */
export type ActivityLogEntityKind =
  | ActivityLogModule.JOB
  | ActivityLogModule.LEAD;

export type JobActivityLogModule =
  | ActivityLogModule.JOB
  | ActivityLogModule.COMPLETED_CANCELED;

export enum ConversionType {
  CONTACT = "contact",
  LEAD = "lead",
  JOB = "job",
}

export const CONVERSION_TYPES = [
  ConversionType.CONTACT,
  ConversionType.LEAD,
  ConversionType.JOB,
] as const;

export const CONVERSION_TYPE_LABELS: Record<ConversionType, string> = {
  [ConversionType.CONTACT]: "Contact",
  [ConversionType.LEAD]: "Lead",
  [ConversionType.JOB]: "Job",
};

export const JOB_TYPES = [
  JobType.TILING,
  JobType.EXCAVATION,
  JobType.REPAIR,
] as const;

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  [JobType.TILING]: "Drainage Tiling",
  [JobType.EXCAVATION]: "Excavation",
  [JobType.REPAIR]: "Repair",
};

export enum UserRole {
  ADMIN = "A",
  MANAGER = "M",
  CREW = "C",
  BOOKKEEPER = "B",
  VIEWER = "R",
  OWNER = "O",
  USER = "U", // Legacy/fallback role
}

/**
 * Maps UserRole enum values to their display names (role names in RBAC system)
 */
export const USER_ROLE_NAME_MAP: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Admin",
  [UserRole.MANAGER]: "Project Manager",
  [UserRole.CREW]: "Project Crew",
  [UserRole.BOOKKEEPER]: "Bookkeeper",
  [UserRole.VIEWER]: "Viewer",
  [UserRole.OWNER]: "Owner",
  [UserRole.USER]: "User",
};

export const MANAGEMENT_ROLES = [
  UserRole.ADMIN,
  UserRole.MANAGER,
  UserRole.OWNER,
] as UserRole[];

export const MAJOR_ROLES = [
  UserRole.ADMIN,
  UserRole.MANAGER,
  UserRole.BOOKKEEPER,
  UserRole.VIEWER,
  UserRole.CREW,
  UserRole.OWNER,
] as UserRole[];

export enum EquipmentType {
  MACHINES = "machines",
  VEHICLES = "vehicles",
  TRAILERS = "trailers",
  ALL = "all",
}

export const EQUIPMENT_TYPES = [
  EquipmentType.MACHINES,
  EquipmentType.VEHICLES,
  EquipmentType.TRAILERS,
] as const;

export const EQUIPMENT_TYPE_LABELS: Record<EquipmentType, string> = {
  [EquipmentType.MACHINES]: "Machines",
  [EquipmentType.VEHICLES]: "Vehicles",
  [EquipmentType.TRAILERS]: "Trailers",
  [EquipmentType.ALL]: "All Equipment",
};

export enum ServiceStatus {
  ACTIVE = "A",
  UNAVAILABLE = "U",
}

export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export const TASK_PRIORITIES = [
  TaskPriority.URGENT,
  TaskPriority.HIGH,
  TaskPriority.MEDIUM,
  TaskPriority.LOW,
] as const;

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  [TaskPriority.URGENT]: "Urgent",
  [TaskPriority.HIGH]: "High",
  [TaskPriority.MEDIUM]: "Medium",
  [TaskPriority.LOW]: "Low",
};

export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  [TaskPriority.URGENT]: "text-red-500",
  [TaskPriority.HIGH]: "text-yellow-500",
  [TaskPriority.MEDIUM]: "text-blue-500",
  [TaskPriority.LOW]: "text-gray-400",
};

export const TASK_PRIORITY_FLAG_COLORS: Record<TaskPriority, string> = {
  [TaskPriority.URGENT]: "fill-red-500 text-red-500",
  [TaskPriority.HIGH]: "fill-yellow-500 text-yellow-500",
  [TaskPriority.MEDIUM]: "fill-blue-500 text-blue-500",
  [TaskPriority.LOW]: "fill-gray-400 text-gray-400",
};

export const SERVICE_STATUS_LABELS: Record<ServiceStatus, string> = {
  [ServiceStatus.ACTIVE]: "Active",
  [ServiceStatus.UNAVAILABLE]: "Unavailable",
};

export enum TrackerStatus {
  YES = "Y",
  NO = "N",
}

export const TRACKER_STATUS_LABELS: Record<TrackerStatus, string> = {
  [TrackerStatus.YES]: "Yes",
  [TrackerStatus.NO]: "No",
};

export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

export const ViewMode = {
  LIST: "list",
  GRID: "grid",
  KANBAN: "kanban",
} as const;
export type ViewMode = (typeof ViewMode)[keyof typeof ViewMode];
export type NotKanbanView = Exclude<ViewMode, typeof ViewMode.KANBAN>;

export {
  ThemeModeEnum,
  type ResolvedThemeMode,
  type ThemeMode,
} from "@/lib/theme-enums";

/** Short status/filter codes (T/E/R) — not URL slugs; see {@link JobType} for API paths. */
export const JobOrLeadType = {
  TILING: "T",
  EXCAVATION: "E",
  REPAIR: "R",
} as const;
export type JobOrLeadType = (typeof JobOrLeadType)[keyof typeof JobOrLeadType];

export enum TopoStatus {
  YES = "Yes",
  NO = "No",
}

export enum MaterialStatus {
  IN_PROGRESS = "In Progress",
  DELIVERED = "Delivered",
  COMPLETED_DAYS = "Completed Days",
}

export const MATERIAL_STATUSES = [
  MaterialStatus.IN_PROGRESS,
  MaterialStatus.DELIVERED,
  MaterialStatus.COMPLETED_DAYS,
] as const;

export const MATERIAL_STATUS_LABELS: Record<MaterialStatus, string> = {
  [MaterialStatus.IN_PROGRESS]: "In Progress",
  [MaterialStatus.DELIVERED]: "Delivered",
  [MaterialStatus.COMPLETED_DAYS]: "Completed Days",
};

export enum WallType {
  SINGLE_WALL = "single_wall",
  DUAL_WALL = "dual_wall",
}

export const WALL_TYPE_LABELS: Record<WallType, string> = {
  [WallType.SINGLE_WALL]: "Single Wall",
  [WallType.DUAL_WALL]: "Dual Wall",
};

export const MATERIAL_STATUS_OPTIONS = [
  {
    value: MaterialStatus.IN_PROGRESS,
    label: MATERIAL_STATUS_LABELS[MaterialStatus.IN_PROGRESS],
  },
  {
    value: MaterialStatus.DELIVERED,
    label: MATERIAL_STATUS_LABELS[MaterialStatus.DELIVERED],
  },
  {
    value: MaterialStatus.COMPLETED_DAYS,
    label: MATERIAL_STATUS_LABELS[MaterialStatus.COMPLETED_DAYS],
  },
] as const;

export enum OrderPipeStatus {
  PENDING = "Pending",
  CONTACT_SUPPLIER = "Contact supplier",
  DELIVERED = "Delivered",
}

export const ORDER_PIPE_STATUSES = [
  OrderPipeStatus.PENDING,
  OrderPipeStatus.CONTACT_SUPPLIER,
  OrderPipeStatus.DELIVERED,
] as const;

export const ORDER_PIPE_STATUS_LABELS: Record<OrderPipeStatus, string> = {
  [OrderPipeStatus.PENDING]: "Pending",
  [OrderPipeStatus.CONTACT_SUPPLIER]: "Contact Supplier",
  [OrderPipeStatus.DELIVERED]: "Delivered",
};

export const ORDER_PIPE_STATUS_COLORS: Record<OrderPipeStatus, string> = {
  [OrderPipeStatus.PENDING]:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  [OrderPipeStatus.CONTACT_SUPPLIER]:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  [OrderPipeStatus.DELIVERED]:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100] as const,
} as const;

export const DATE_FORMATS = {
  DISPLAY: "MM/dd/yyyy",
  DISPLAY_WITH_TIME: "MM/dd/yyyy HH:mm",
  API: "yyyy-MM-dd",
  ISO: "yyyy-MM-dd'T'HH:mm:ss",
} as const;

export const QUERY_KEYS = {
  // Jobs & Leads
  JOBS: "jobs",
  JOB: "job",
  LEADS: "leads",
  LEAD: "lead",
  ALL_JOBS: "allJobs",
  JOB_HISTORY: "jobHistory",
  JOB_ASSIGNED_FILTER_PREFERENCE: "jobAssignedFilterPreference",
  // Contacts
  CONTACTS: "contacts",
  CONTACT: "contact",
  CONTACT_CATEGORIES: "contactCategories",
  SUB_CONTACTS: "subContacts",
  FARMS: "farms",
  FARM: "farm",
  RECORD_FARMS: "recordFarms",
  RECORD_CONTACTS: "recordContacts",
  EQUIPMENT_MAINTENANCE_CHECK: "equipmentMaintenanceCheck",
  // Tasks
  TASKS: "tasks",
  TASK: "task",
  TASK_STATUSES: "taskStatuses",
  TASK_TYPES: "taskTypes",
  TASK_TYPE: "taskType",
  // Equipment
  EQUIPMENT: "equipment",
  EQUIPMENT_V2: "equipmentV2",
  RECORD_EQUIPMENT: "recordEquipment",
  UNIFIED_EQUIPMENT: "unified-equipment",
  // Maintenance
  MAINTENANCE: "maintenance",
  IS_ACTIVE_MAINTENANCE: "is_active_maintenance",
  ACTIVE_EQUIPMENT_COUNTS: "active_equipment_counts",
  // Team
  TEAM: "team",
  TEAM_MEMBERS: "teamMembers",
  CREW: "crew",
  ROLES: "roles",
  PERMISSIONS: "permissions",
  USER_PERMISSIONS: "userPermissions",
  NOTIFICATION_SETTINGS_IMPORTANT: "notificationSettingsImportant",
  NOTIFICATION_SETTINGS_FYI: "notificationSettingsFyi",
  NEW_NOTIFICATIONS: "newNotifications",
  // Map
  MAP: "map",
  // Calendar / Scheduling
  CALENDAR_ITEMS: "calendarItems",
  CALENDAR_STATISTICS: "calendarStatistics",
  CALENDAR_UNSCHEDULED: "calendarUnscheduled",
  JOB_STATUSES: "jobStatuses",
  LEAD_STATUSES: "leadStatuses",
  LEAD_TYPES: "leadTypes",
  PROJECT_TYPES: "projectTypes",
  // Auth
  LOGIN_ACTIVITY: "loginActivity",
  DEVICES: "devices",
  SEAT_USAGE: "seatUsage",
  // Other
  INVOICES: "invoices",
  FILES: "files",
  COMMENTS: "comments",
  STATUSES: "statuses",
  FINANCIAL: "jobFinancial",
  CORE_POINTS: "corePoints",
  FOOTAGE: "footage",
  ORG_DESIGN_PARAMETERS: "orgDesignParameters",
  DESIGN_REQUEST_STATUS: "designRequestStatus",
  DESIGN_REQUEST_SNAPSHOT: "designRequestSnapshot",
  DESIGN_REQUEST_NOTES: "designRequestNotes",
  DESIGN_REQUEST_SHARED_OUTPUT: "designRequestSharedOutput",
} as const;

export const FILE_TYPES = {
  CONTRACTOR: "contractor",
  ONE_CALL: "one_call",
  FARMER: "farmer",
  DIGGS: "diggs",
} as const;

export const MAP_DEFAULTS = {
  DEFAULT_ZOOM: 10,
  DEFAULT_CENTER: { lat: 41.5, lng: -93.5 }, // Iowa center
  MIN_ZOOM: 5,
  MAX_ZOOM: 20,
} as const;

export const isJobType = (value: string): value is JobType =>
  Object.values(JobType).includes(value as JobType);

export const isUserRole = (value: string): value is UserRole =>
  Object.values(UserRole).includes(value as UserRole);

export const isEquipmentType = (value: string): value is EquipmentType =>
  Object.values(EquipmentType).includes(value as EquipmentType);

export const isServiceStatus = (value: string): value is ServiceStatus =>
  Object.values(ServiceStatus).includes(value as ServiceStatus);

export const isConversionType = (value: string): value is ConversionType =>
  Object.values(ConversionType).includes(value as ConversionType);

/**
 * Permission code constants for job-related permissions.
 * These values must match the backend permission codes exactly.
 */
export enum PermissionCode {
  // Job page read permissions
  JOBS_REPAIR_PAGE_READ = "jobs_repair_page_read",
  JOBS_EXCAVATION_PAGE_READ = "jobs_excavation_page_read",
  JOBS_TILING_PAGE_READ = "jobs_tiling_page_read",

  // Job page write (used with completed/canceled scheduling edits)
  JOBS_REPAIR_PAGE_WRITE = "jobs_repair_page_write",
  JOBS_EXCAVATION_PAGE_WRITE = "jobs_excavation_page_write",
  JOBS_TILING_PAGE_WRITE = "jobs_tiling_page_write",

  // Completed & canceled jobs listing / edits
  COMPLETED_CANCELED_PAGE_READ = "completed_canceled_page_read",
  COMPLETED_CANCELED_PAGE_WRITE = "completed_canceled_page_write",

  // Job tab permissions (combined Estimate & Financial)
  JOBS_EXCAVATION_ESTIMATE_FINANCIAL_READ = "jobs_excavation_estimate_financial_read",
  JOBS_EXCAVATION_ESTIMATE_FINANCIAL_WRITE = "jobs_excavation_estimate_financial_write",
  JOBS_TILING_ESTIMATE_FINANCIAL_READ = "jobs_tiling_estimate_financial_read",
  JOBS_TILING_ESTIMATE_FINANCIAL_WRITE = "jobs_tiling_estimate_financial_write",

  // Job equipment management permissions
  JOBS_REPAIR_EQUIPMENT_MANAGEMENT_WRITE = "jobs_repair_equipment_management_write",
  JOBS_REPAIR_EQUIPMENT_MANAGEMENT_DELETE = "jobs_repair_equipment_management_delete",
  JOBS_EXCAVATION_EQUIPMENT_MANAGEMENT_WRITE = "jobs_excavation_equipment_management_write",
  JOBS_EXCAVATION_EQUIPMENT_MANAGEMENT_DELETE = "jobs_excavation_equipment_management_delete",
  JOBS_TILING_EQUIPMENT_MANAGEMENT_WRITE = "jobs_tiling_equipment_management_write",
  JOBS_TILING_EQUIPMENT_MANAGEMENT_DELETE = "jobs_tiling_equipment_management_delete",

  LEADS_PAGE_READ = "leads_page_read",
  LEADS_PAGE_WRITE = "leads_page_write",
  SETTINGS_PAGE_READ = "settings_page_read",
  TD_INTEGRATION_READ = "td_integration_read",
  TD_INTEGRATION_WRITE = "td_integration_write",
}

export enum NoteSection {
  GENERAL = "general",
  OFFICE = "office",
  ONSITE = "onsite",
}

export const NOTE_SECTION_LABELS: Record<NoteSection, string> = {
  [NoteSection.GENERAL]: "General",
  [NoteSection.OFFICE]: "Office",
  [NoteSection.ONSITE]: "On-Site",
};

export type NotesTabAccess = {
  general: boolean;
  office: boolean;
  onsite: boolean;
};
