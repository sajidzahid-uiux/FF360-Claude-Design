// ============================================
// AUTH
// ============================================
export type {
  AuthUser,
  AuthUserUpdatePayload,
  DeviceSession,
  DeviceSessionsResponse,
  LoginActivityEvent,
  LoginActivityResponse,
  RequestPasswordChangeResponse,
} from "./auth";

// ============================================
// ENUMS (Re-exported from constants for convenience)
// ============================================
export {
  EquipmentType,
  JobType,
  LeadType,
  ServiceStatus,
  SortOrder,
  TrackerStatus,
  UserRole,
} from "@/constants/enums";

// ============================================
// COMMON TYPES
// ============================================
export type {
  ApiErrorResponse,
  ApiSuccessResponse,
  Author,
  BaseListParams,
  CrewGroupIdUpdatePayload,
  EntityIdField,
  IdNumberUpdatePayload,
  IdOf,
  IdUpdatePayload,
  JobStatus,
  LeadStatus,
  ObjectType,
  EntityStatusOption,
  OrganizationJobStatus,
  PaginatedResponse,
  PaginatedResponseAlt,
  RoleIdUpdatePayload,
  Status,
  UserInfo,
  Vertex,
} from "./common";
export type {
  GeoBoundsLiteral,
  GeoCoordinate,
  GeoCoordinateParseResult,
  GeoCoordinatePartial,
  GeoLatLng,
  GeoLatLngAsyncHandler,
  GeoLatLngClickHandler,
  GeoLatLngHandler,
  GeoLatLngNullable,
  GeoLngLatPath,
  GeoLngLatTuple,
  VertexRing,
  VertexRings,
} from "./geo";

// ============================================
// ORGANIZATION SETTINGS
// ============================================
export type {
  OrganizationJobStatusCreateArgs,
  OrganizationJobStatusCreatePayload,
  OrganizationJobStatusUpdateVariables,
  OrganizationJobStatusWritePayload,
  OrganizationLeadStatusCreatePayload,
  OrganizationLeadStatusSetting,
  OrganizationLeadStatusUpdateVariables,
  OrganizationLeadStatusWritePayload,
  OrganizationLeadTypeCreatePayload,
  OrganizationLeadTypeSetting,
  OrganizationLeadTypeUpdateVariables,
  OrganizationLeadTypeWritePayload,
  PaymentStatus,
} from "./settings";

// ============================================
// MAINTENANCE
// ============================================
export type {
  Maintenance,
  MaintenanceCreatePayload,
  MaintenanceUpdatePayload,
  MaintenanceWorkItem,
  MaintenanceWorkItemCreatePayload,
  MaintenanceWorkItemUpdatePayload,
} from "./maintenance";

// ============================================
// RECORD LOOKUPS (job/lead form dropdowns)
// ============================================
export type {
  RecordContact,
  RecordEquipment,
  RecordFarm,
  RecordJobStatus,
  RecordLeadStatus,
  RecordLeadType,
} from "./records";

// ============================================
// DASHBOARD
// ============================================
export type {
  DashboardChartData,
  DashboardDesignNeededRow,
  DashboardInvoiceDisplayRow,
  DashboardInvoiceStatusCounts,
  DashboardInvoiceTableSource,
  DashboardJobStatusRow,
  DashboardJobStatusType,
  DashboardLeadTypeData,
  DashboardPendingApprovalRow,
  DesignsNeededByYouApiRecord,
  DesignsNeededByYouLegacyTuple,
  DesignsNeededByYouMapValue,
  OrganizationDashboardResponse,
} from "./dashboard";

// ============================================
// INVOICES
// ============================================
export type {
  InvoiceCardRow,
  InvoiceContactInfo,
  InvoiceDetailRow,
  InvoiceListRow,
  OrganizationInvoiceLineItem,
  OrganizationInvoiceListItem,
} from "./invoices";

// ============================================
// MAP PINS
// ============================================
export type {
  MapPin,
  MapPinCreateArgs,
  MapPinCreatePayload,
  MapPinDeleteArgs,
} from "./mapPin";
export type {
  MapPinCategory,
  MapPinCategoryCreatePayload,
  MapPinCategoryListParams,
  MapPinCategoryRef,
  MapPinCategoryUpdatePayload,
} from "./mapPinCategory";

// ============================================
// JOBS
// ============================================
export type {
  ContactInfo,
  ContactSummary,
  ContactSummaryPartial,
  CorePoint,
  CorePointSummary,
  CorePointCreatePayload,
  CorePointListParams,
  CorePointUpdatePayload,
  Equipment,
  EquipmentAssignment,
  FinancialMachineAssignment,
  FinancialMachineAssignmentCreatePayload,
  FinancialMachineAssignmentUpdatePayload,
  Job,
  JobActiveInvoice,
  JobCreatePayload,
  JobEstimate,
  JobFinancial,
  JobFinancialUpdatePayload,
  JobListParams,
  JobMapUpdatePayload,
  JobResponse,
  JobUpdatePayload,
  Member,
  OperatorInfo,
  PaginatedJobResponse,
  StakeholderContact,
  StakeholderFarm,
  StakeholderPayloadFields,
  StakeholderPrimaryUpdatePayload,
  JobEquipmentHoursUpdatePayload,
  EquipmentHoursBreakdown,
  EquipmentHoursFarmBreakdown,
  FinancialMachineAssignmentCreateArgs,
  FinancialMachineAssignmentDeleteArgs,
  FinancialMachineAssignmentId,
  FinancialMachineAssignmentUpdateArgs,
  CorePointId,
  JobCorePointCreateArgs,
  JobCorePointDeleteArgs,
  JobCorePointUpdateArgs,
  JobEstimateUpdateArgs,
  JobFinancialUpdateArgs,
  JobId,
  JobIdArgs,
  JobPatchArgs,
  JobTrashIdArgs,
  JobTypedEntityIdArgs,
  JobTypedIdArgs,
} from "./jobs";

export type {
  JobListAssignedFilterMember,
  JobListAssignedFilterPreferenceResponse,
} from "./jobAssignedFilterPreference";

export type {
  TimeEntry,
  TimeEntryPayload,
  TimeEntryResponse,
  UpdateTimeEntryPayload,
} from "./jobTimeEntries";

export type {
  InstalledFootageLogEntry,
  InstalledFootageLogType,
  LateralInstalledFootageLogEntry,
  MainInstalledFootageLogEntry,
  PaginatedInstalledFootageLogs,
  RaisersInstalledFootageLogEntry,
  UpdateInstalledFootageLogBody,
  UpdateInstalledFootageLogArgs,
  DeleteInstalledFootageLogArgs,
  UpdateInstalledFootageLogResponse,
} from "./installedFootageLogs";

export type {
  ActivityLogApiEntry,
  ListActivityLogsParams,
  PaginatedActivityLogs,
} from "./activityLogs";

// ============================================
// LEADS
// ============================================
export type {
  ConvertLeadToJobArgs,
  ConvertLeadToJobPayload,
  ConvertLeadToJobResponse,
  JobOrLeadId,
  Lead,
  LeadCorePointCreateArgs,
  LeadCorePointDeleteArgs,
  LeadCorePointUpdateArgs,
  LeadCreatePayload,
  LeadId,
  LeadListParams,
  LeadMapUpdatePayload,
  LeadPatchArgs,
  LeadResponse,
  LeadTrashIdArgs,
  LeadTypedEntityIdArgs,
  LeadTypedIdArgs,
  LeadTypeInfo,
  LeadUpdatePayload,
  PaginatedLeadResponse,
} from "./leads";

// ============================================
// EQUIPMENT
// ============================================
export {
  EQUIPMENT_TYPE_ENUM_LABELS,
  EQUIPMENT_TYPE_OPTIONS,
  EquipmentTypeEnum,
} from "./equipment";

export type {
  BaseEquipmentV2,
  EquipmentCreatePayload,
  EquipmentListParams,
  EquipmentListRow,
  EquipmentV2,
  MachineCreatePayload,
  MachineUpdatePayload,
  MachineV2,
  MaintenanceAttribute,
  MaintenanceAttributeCreatePayload,
  PaginatedEquipmentResponse,
  PaginatedMachineResponse,
  PaginatedTrailerResponse,
  PaginatedVehicleResponse,
  TrailerCreatePayload,
  TrailerUpdatePayload,
  TrailerV2,
  VehicleCreatePayload,
  VehicleUpdatePayload,
  VehicleV2,
} from "./equipment";

export type {
  BatteryLifetimeYears,
  BatteryReplacementApiResponse,
  BatteryReplacementData,
  BatteryReplacementFiles,
  BatteryReplacementMutationApiResponse,
  BatteryReplacementRecord,
  BatteryType,
  BatteryTypeApiResponse,
  BatteryTypeCreatePayload,
  BatteryTypeDeleteApiResponse,
  BatteryTypeDeletePayload,
  BatteryTypeListApiResponse,
  BatteryTypeUpdatePayload,
  EquipmentBatteryReplacementCreateArgs,
  EquipmentBatteryReplacementDeleteArgs,
  EquipmentBatteryReplacementUpdateArgs,
  MachineBatteryReplacementCreateArgs,
  MachineBatteryReplacementDeleteArgs,
  MachineBatteryReplacementUpdateArgs,
  VehicleBatteryReplacementCreateArgs,
  VehicleBatteryReplacementDeleteArgs,
  VehicleBatteryReplacementUpdateArgs,
} from "./equipmentBattery";

// ============================================
// CONTACTS
// ============================================
export type {
  CategoryCreatePayload,
  CategoryUpdatePayload,
  Contact,
  ContactCategory,
  ContactCreatePayload,
  ContactDetail,
  ContactListParams,
  ContactResponse,
  ContactsApiResponse,
  ContactSubtype,
  ContactUpdatePayload,
  Farm,
  FarmCreatePayload,
  FarmListParams,
  FarmManagementContactNameEntry,
  FarmManagementContactRef,
  FarmUpdatePayload,
  JobHistoryItem,
  JobHistoryListParams,
  JobHistoryResponse,
  JobProgress,
  PaginatedContactsResponse,
  PaginatedSubContactsResponse,
  SubContactCreateAndLinkPayload,
  SubContactLinkArgs,
  SubContactLinkPayload,
  SubContactListParams,
  SubContactSummary,
  SubContactUnlinkArgs,
} from "./contacts";

// ============================================
// TEAM
// ============================================
export type {
  AddMembersPayload,
  AddMemberToGroupPayload,
  AddMemberToGroupResponse,
  AssignCrewGroupPayload,
  AssignIndividualPayload,
  AvailableMember,
  AvailableMembersResponse,
  CreateCrewGroupPayload,
  CrewAssignment,
  CrewAssignmentResponse,
  CrewCreatePayload,
  CrewDirectoryGroup,
  CrewDirectoryMember,
  CrewDirectoryResponse,
  CrewDirectoryStats,
  CrewGroup,
  CrewGroupCreatePayload,
  CrewGroupDetail,
  CrewGroupListItem,
  CrewGroupMember,
  CrewGroupResponse,
  CrewGroupUpdatePayload,
  CrewMember,
  CrewUpdatePayload,
  DeactivateAssignmentPayload,
  DeactivateMembersPayload,
  IndividualMember,
  InvitationPayload,
  InvitationResponse,
  JobTeamListResponse,
  MemberIdGroupUpdateArgs,
  MemberRoleUpdateArgs,
  MemberUpdatePayload,
  OnlineMember,
  ReactivateAssignmentPayload,
  ReactivateMembersPayload,
  TeamMember,
  UpdateCrewGroupPayload,
} from "./team";

// ============================================
// FILES & COMMENTS
// ============================================
export type {
  Comment,
  CommentCreatePayload,
  CommentUpdatePayload,
  FileAttachment,
  FileUploadPayload,
  FileUploadWithProgressPayload,
  OrganizationCommentCreatePayload,
  OrganizationCommentUpdatePayload,
} from "./files";

export type {
  NoteComment,
  NoteCommentMember,
  NoteCommentMemberUser,
  NoteCommentDeletePayload,
  NoteCommentPatchPayload,
  NoteCommentPatchVariables,
  NoteCommentPostPayload,
  NotesExportContext,
  NotesExportPdfPayload,
  NotesExportResourceKind,
  NotesExportType,
  NotesTabAccess,
} from "./notes";

// ============================================
// CHAT
// ============================================
export type {
  ChatAuthor,
  ChatGroup,
  ChatMessage,
  ChatUser,
  ChatWindowProps,
  Conversation,
  MessagePreview,
  WebSocketChatEvent,
} from "./chat";

// ============================================
// MAP
// ============================================
export type {
  FilterCategory,
  FilterOption,
  DeleteMapFileVariables,
  MapContactInfo,
  MapDataApiResult,
  MapDataParams,
  MapDataResponse,
  MapFarmEntry,
  MapFarmInfo,
  MapFarmManagementContact,
  MapJob,
  MapKmlMap,
  MapLead,
  MapLegend,
  MapLegendCreatePayload,
  MapLegendResponse,
  MapLegendUpdatePayload,
  MapLegendUpdateResponse,
  MapShpMap,
  MapXmlMap,
  UploadMapFilesVariables,
} from "./map";

// ============================================
// ROLES & PERMISSIONS
// ============================================
export type {
  Permission,
  Role,
  RoleCreatePayload,
  RoleUpdatePayload,
  UserPermissionsResponse,
} from "./roles";

// ============================================
// NOTIFICATION SETTINGS
// ============================================
export type {
  FyiAssignedUser,
  FyiNotificationSetting,
  ImportantNotificationSetting,
  PatchFyiNotificationPayload,
  PatchImportantNotificationPayload,
} from "./notificationSettings";

export {
  getNotificationCategory,
  getNotificationPriorityBadgeClass,
  getNotificationPriorityBorderClass,
  getNotificationPriorityCardClass,
  getNotificationPriorityTitleClass,
  isPaginatedResponse,
  NOTIFICATION_PRIORITY_BORDER_CLASS,
} from "./newNotifications";
export type {
  DeleteAllResponse,
  MarkAllReadResponse,
  MarkNewNotificationReadArgs,
  NewNotificationItem,
  NewNotificationPatchPayload,
  NewNotificationsPaginatedResponse,
  NewNotificationsParams,
  NewNotificationsResponse,
  NotificationCategory,
} from "./newNotifications";

export {
  jobTypeToProjectTypeCategory,
  PROJECT_TYPE_CATEGORY_LABELS,
} from "./projectTypes";
export type {
  PaginatedProjectTypesResponse,
  ProjectType,
  ProjectTypeCategory,
  ProjectTypeCreatePayload,
  ProjectTypeUpdatePayload,
} from "./projectTypes";

// ============================================
// SCHEDULING / CALENDAR
// ============================================
export type {
  SchedulingCalendarStatus,
  SchedulingItem,
  SchedulingItemContactInfo,
  SchedulingItemEntityType,
  SchedulingItemPatchPayload,
  SchedulingItemUpdateArgs,
  SchedulingItemsListParams,
  SchedulingItemsListResponse,
  SchedulingItemStatus,
  SchedulingItemTypeCode,
  SchedulingStatisticsResponse,
} from "./scheduling";

// ============================================
// TASKS
// ============================================
export type {
  AssigneeInfo,
  PaginatedTaskResponse,
  PaginatedTaskStatusResponse,
  PaginatedTaskTypeResponse,
  Task,
  TaskCreatePayload,
  TaskIdUpdateArgs,
  TaskListParams,
  TaskPriority,
  TaskStatus,
  TaskStatusInfo,
  TaskStatusListParams,
  TaskType,
  TaskTypeCreatePayload,
  TaskTypeIdUpdateArgs,
  TaskTypeInfo,
  TaskTypeListParams,
  TaskTypeUpdatePayload,
  TaskUpdatePayload,
} from "./tasks";

// ============================================
// ORDER PIPE
// ============================================
export type {
  OrderPipeCategoriesResponse,
  OrderPipeCategory,
  OrderPipeItemPayload,
  OrderPipeOption,
  OrderPipeType,
} from "./orderPipe";

// ============================================
// VENDORS
// ============================================
export type {
  Vendor,
  VendorFavorite,
  VendorFavoriteCreatePayload,
  VendorFavoritesResponse,
  VendorListParams,
  VendorProvider,
  VendorsResponse,
} from "./vendors";

// ============================================
// VENDOR FORMS V2
// ============================================
export type {
  CanProceedResponse,
  DeliveryLocation,
  DeliveryLocationCreatePayload,
  DeliveryLocationItem,
  DeliveryLocationUpdateArgs,
  DeliveryLocationUpdatePayload,
  GenerateInvoiceResponse,
  JobFieldBoundaries,
  VendorFormJobFarm,
  OrderItem,
  PipeDropPayload,
  RemainedOrderedItem,
  VendorFormCreatePayload,
  VendorFormItemV2,
  VendorFormJobCorePoint,
  VendorFormJobKmlMap,
  VendorFormJobKmlMapData,
  VendorFormJobShpMap,
  VendorFormJobShpMapData,
  VendorFormJobXmlMap,
  VendorFormJobXmlMapData,
  VendorFormKmlPlacemark,
  VendorFormKmlPlacemarkGeometry,
  VendorFormKmlPlacemarkStyle,
  VendorFormListParams,
  VendorFormInvoiceGenerateArgs,
  VendorFormUpdateArgs,
  VendorFormUpdatePayload,
  VendorFormV2,
  VendorFormVendorInfo,
} from "./vendorForms";

// ============================================
// QUICK ACTIONS
// ============================================
export type {
  OrgFileUploadPayload,
  OrgFileUploadResponse,
  QuickAction,
  QuickActionContactLookupResponse,
  QuickActionContactMatch,
  QuickActionConversionType,
  QuickActionConvertToContactPayload,
  QuickActionConvertToContactResponse,
  QuickActionConvertToJobPayload,
  QuickActionConvertToJobResponse,
  QuickActionConvertToLeadPayload,
  QuickActionConvertToLeadResponse,
  QuickActionCreatePayload,
  QuickActionDeleteArgs,
  QuickActionFarmSelectOption,
  QuickActionFile,
  QuickActionFileUploadArgs,
  QuickActionIdUpdateArgs,
  QuickActionJobLeadTypeApi,
  QuickActionLinkedFarm,
  QuickActionLinkedLead,
  QuickActionListParams,
  QuickActionUpdatePayload,
} from "./quickActions";

// ============================================
// ORGANIZATION SETTINGS
// ============================================
export type {
  OrganizationSettings,
  PatchOrganizationSettingsArgs,
  PatchOrganizationSettingsPayload,
} from "./organizationSettings";

export type { OrganizationListRow } from "./organizations";

// ============================================
// FOOTAGE
// ============================================
export {
  FOOTAGE_CREW_FILTER_GROUP_PREFIX,
  FOOTAGE_CREW_FILTER_MEMBER_PREFIX,
} from "./footage";
export type {
  AddDailyProgressLateralBody,
  AddDailyProgressMainBody,
  AddDailyProgressRaisersBody,
  FootageAllJobsApiRow,
  FootageAllJobsParams,
  FootageSortOrder,
  FootageComment,
  FootageCommentCreateArgs,
  FootageCommentListArgs,
  FootageCommentMutationResponse,
  FootageCommentUpdateArgs,
  FootageContactInfo,
  FootageDailyProgressCreatedBy,
  FootageDailyProgressLateralArgs,
  FootageDailyProgressLateralResponse,
  FootageDailyProgressMainArgs,
  FootageDailyProgressMainResponse,
  FootageDailyProgressRaisersArgs,
  FootageDailyProgressRaisersResponse,
  FootageDateFilterMode,
  FootageExcelData,
  FootageJobData,
  FootageJobIdArgs,
  FootageOrganizationTotals,
  FormattedFootageData,
} from "./footage";

export type {
  CreateDesignRequestNoteBody,
  DesignRequestDirection,
  DesignRequestNoteFile,
  DesignRequestPanelTab,
  DesignRequestSourceType,
  DesignRequestStatus,
  DesignRequestStatusItem,
  DesignRequestThreadItem,
  LineTypeParams,
  OrgDesignParameters,
  SharedDesignFile,
  SharedDesignOutput,
  SubmitDesignRequestPayload,
} from "./designRequest";
export {
  DesignRequestDirection as DesignRequestDirectionEnum,
  DesignRequestStatus as DesignRequestStatusEnum,
} from "./designRequest";
