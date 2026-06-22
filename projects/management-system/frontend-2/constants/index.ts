export { US_STATES } from "./usStates";
export { JOB_KANBAN_COLUMN_WIDTH } from "./jobKanban";

export {
  API_URL,
  AUTH0_AUDIENCE,
  AUTH0_CLIENT_ID,
  AUTH0_DOMAIN,
  AUTH0_REDIRECT_URI,
  AUTH0_SCOPE,
  GOOGLE_MAPS_API_KEY,
  POSTHOG_HOST,
  POSTHOG_KEY,
  STRIPE_PUBLISHABLE_KEY,
  VENDOR_API_URL,
  WS_URL,
} from "./env";

export {
  // Dates
  DATE_FORMATS,
  EQUIPMENT_TYPE_LABELS,
  EQUIPMENT_TYPES,
  // Equipment
  EquipmentType,
  // Files & Map
  FILE_TYPES,
  isEquipmentType,
  // Type Guards
  isJobType,
  isServiceStatus,
  isUserRole,
  JOB_TYPE_LABELS,
  JOB_TYPES,
  ActivityLogModule,
  isJobLeadEntityType,
  JobLeadEntityType,
  JobOrLeadType,
  // Job & Lead Types
  JobType,
  LeadType,
  MAJOR_ROLES,
  MANAGEMENT_ROLES,
  MAP_DEFAULTS,
  MapViewTab,
  MATERIAL_STATUS_LABELS,
  MATERIAL_STATUS_OPTIONS,
  MATERIAL_STATUSES,
  MaterialStatus,
  NOTE_SECTION_LABELS,
  NoteSection,
  ORDER_PIPE_STATUS_COLORS,
  ORDER_PIPE_STATUS_LABELS,
  ORDER_PIPE_STATUSES,
  OrderPipeStatus,
  PAGINATION,
  ResourceType,
  isJobLeadEntity,
  JOB_LEAD_ENTITIES,
  isJobLeadArchiveTab,
  type JobLeadArchiveTab,
  // Permissions
  PermissionCode,
  // Query Keys & Cache
  QUERY_KEYS,
  SERVICE_STATUS_LABELS,
  // Status
  ServiceStatus,
  SortOrder,
  ThemeModeEnum,
  TopoStatus,
  TRACKER_STATUS_LABELS,
  TrackerStatus,
  // User Roles
  UserRole,
  ViewMode,
  WALL_TYPE_LABELS,
  // Pipe Wall Types
  WallType,
} from "./enums";
export type {
  ActivityLogEntityKind,
  JobActivityLogModule,
  JobLeadEntity,
  NotKanbanView,
  ResolvedThemeMode,
  ThemeMode,
} from "./enums";

export {
  CACHE_TIME,
  CONVERSION_FACTORS,
  DISTANCE_UNITS,
  FILE_SIZE_LIMITS,
  GEOGRAPHY_CONSTANTS,
  GEOLOCATION_OPTIONS,
  UnitSystem,
} from "./units";

// Job type configuration (separate from enum JOB_TYPES)
export {
  getJobTypeByLabel,
  getJobTypePathSegment,
  getJobTypePermissionCodes,
  JOB_TYPES as JOB_TYPE_CONFIG,
  type JobTypeKey,
} from "./jobTypes";

export {
  apiJobTypeToJobLeadTypeSegment,
  apiJobTypeToRouteSegment,
  coerceJobLeadTypeSegment,
  isJobLeadTypeRouteSegment,
  isJobLeadTypeSegment,
  JOB_LEAD_TYPE_SEGMENTS_ALL,
  JobLeadTypeRouteSegment,
  JobLeadTypeSegment,
  jobLeadTypeSegmentToJobOrLeadType,
  jobLeadTypeSegmentToJobType,
  jobOrLeadTypeToJobLeadTypeSegment,
  jobTypeToJobLeadTypeSegment,
  jobTypeToRecordApiJobType,
  jobTypeToRouteSegment,
  type RecordApiJobType,
  normalizeJobLeadTypeSegment,
  parseJobLeadTypeRouteSegment,
  toJobLeadTypeRouteSegment,
} from "./jobLeadTypeSegments";
