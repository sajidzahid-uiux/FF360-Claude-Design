import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { ComponentType } from "react";

import type {
  ConvertLeadToJobPayload,
  CorePointCreatePayload,
  CorePointSummary,
  EntityStatusOption,
  FileAttachment,
  Job,
  JobEstimate,
  JobUpdatePayload,
  Lead,
  LeadTypeInfo,
  LeadUpdatePayload,
  NoteComment,
  NotesTabAccess,
  ProjectType,
} from "@/api/types";
import type { GeoLatLng, GeoLatLngAsyncHandler } from "@/api/types/geo";
import type { TeamMember } from "@/api/types/team";
import { JobType, PermissionCode, ResourceType } from "@/constants";
import type { MapPinItem } from "@/features/map/model/mapPinItem";
import type { MapPinCreateSubmitHandler } from "@/features/map/model/types";
import { useJobComments, useJobFiles } from "@/hooks/mutations";
import { useJobEstimate } from "@/hooks/queries";
import { useRecordEquipment, useRecordFarms } from "@/hooks/useRecordData";
import type { BoundaryMapRef } from "@/shared/ui/common/map";

import type { EntityDataState } from "./entityDataState";
import type { HandleCustomerPatchValue } from "./handleCustomerPatchValue";
import type { SpecialFileType } from "./publicTypes";

export type { EntityContactInfo, EntityDataState } from "./entityDataState";

/** Return shape of `useJobComments` / `useLeadComments` for ShowMoreCard hook config. */
export type CommentsHookResult = ReturnType<typeof useJobComments>;

/** Return shape of `useJobFiles` / `useDrainageLeadFiles` for ShowMoreCard hook config. */
export type ShowMoreCardFilesHookResult = ReturnType<typeof useJobFiles>;

/** Patch hook surface used by ShowMoreCard (job/lead adapters in hookFactories). */
export interface ShowMoreCardPatchHookResult {
  mutateAsync: (
    params:
      | {
          id: number | string;
          updatedJob: JobUpdatePayload;
          notApproved?: boolean;
        }
      | {
          id: number | string;
          data: LeadUpdatePayload;
        }
  ) => Promise<unknown>;
}

/** Delete hook surface used by ShowMoreCard (job/lead adapters in hookFactories). */
export interface ShowMoreCardDeleteHookResult {
  mutateAsync: (params: { id: number | string }) => Promise<unknown>;
}

/** Convert hook surface used by ShowMoreCard (lead adapter in hookFactories). */
export interface ShowMoreCardConvertHookResult {
  mutateAsync: (
    params: { leadId: number } & Partial<ConvertLeadToJobPayload>
  ) => Promise<unknown>;
  isPending: boolean;
}

export type ShowMoreCardEstimateHookResult = ReturnType<typeof useJobEstimate>;

export type ShowMoreCardEquipmentHookResult = ReturnType<
  typeof useRecordEquipment
>;

export type ShowMoreCardFarmsHookResult = ReturnType<typeof useRecordFarms>;

/** Google Maps lat/lng (same as API `Vertex`). */
export type LatLng = GeoLatLng;

/** File attachment / job file as used in ShowMoreCard */
export type JobFileItem = FileAttachment & {
  designer_file?: boolean;
};

/** Filtered files map: keys contractor, one_call, farmer, designer, special */
export type FilteredFilesMap = Record<string, JobFileItem[]>;

/** One Call state site entry shown in SitesPopUp */
export interface OneCallSite {
  state?: string;
  state_province?: string;
  message?: string;
  website?: string;
  website1?: string;
  website2?: string;
  website3?: string;
}

export interface UploadFileParams {
  fileName: string;
  description?: string;
  file: File | File[];
  _fileType?: string;
}

/** Status option in job/lead status dropdowns (ShowMoreCard) */
export type StatusItem = EntityStatusOption;

/** Core point passed to BoundaryMap from ShowMoreCard tabs */
export type CorePointItem = CorePointSummary;

export type EntityType = ResourceType;

export type TabName =
  | "Job Details"
  | "Lead Details"
  | "Production Tracking"
  | "Machine"
  | "Files"
  | "Financial"
  | "Financial & Scheduling"
  | "Scheduling"
  | "Estimate";

export type FileType =
  | "contractor"
  | "one_call"
  | "farmer"
  | "designer"
  | "special"
  | "pro_map_file"
  | "design_file"
  | "delivered_file"
  | "shape_file"
  | "xml_file"
  | "farm_parameter"
  | "farm_visualization";

export type { SpecialFileType } from "./publicTypes";

export interface FileTypeConfig {
  special?: (FileType | SpecialFileType)[];
  regular: FileType[];
}

export interface FeatureConfig {
  corePoints?: boolean;
  mapPins?: boolean;
  pipeOrdering?: boolean;
  dailyProgress?: boolean;
  equipmentSelection?: boolean;
  designerAssignment?: boolean;
  acreage?: boolean;
  machineTab?: boolean;
}

/** Tab/upload components accept varying prop shapes; `object` avoids `any`. */
export type ShowMoreCardTabComponent = ComponentType<Record<string, unknown>>;

/** Coerce a typed tab component into ShowMoreCard config slots. */
export function toShowMoreCardTabComponent<P extends object>(
  component: ComponentType<P>
): ShowMoreCardTabComponent {
  return component as unknown as ShowMoreCardTabComponent;
}

export interface ComponentConfig {
  uploadFile?: ShowMoreCardTabComponent;
  uploadDelivered?: ShowMoreCardTabComponent;
  dailyProgress?: ShowMoreCardTabComponent;
  productionTracking?: ShowMoreCardTabComponent;
  financialTab?: ShowMoreCardTabComponent;
  estimateTab?: ShowMoreCardTabComponent;
  machineTab?: ShowMoreCardTabComponent;
}

export interface HookConfig {
  useComments: (
    id: number,
    notesTabAccess?: NotesTabAccess
  ) => CommentsHookResult;
  useFiles: (id: number) => ShowMoreCardFilesHookResult;
  useStatuses: (params?: { jobType?: string }) => {
    data?: StatusItem[];
  };
  useEstimate?: (id: number) => ShowMoreCardEstimateHookResult;
  usePatch: () => ShowMoreCardPatchHookResult;
  useDelete: () => ShowMoreCardDeleteHookResult;
  useArchive?: () => ShowMoreCardDeleteHookResult;
  useRestore?: () => ShowMoreCardDeleteHookResult;
  useConvertToJob?: () => ShowMoreCardConvertHookResult;
  useEquipment?: () => ShowMoreCardEquipmentHookResult;
  useFarms?: (params: { contactId: number }) => ShowMoreCardFarmsHookResult;
}

export interface ShowMoreCardConfig {
  entityType: EntityType;
  jobType: JobType;
  tabs: TabName[];
  fileTypes: FileTypeConfig;
  features: FeatureConfig;
  components: ComponentConfig;
  hooks: HookConfig;
  stateDataKey: string; // e.g., "drainage_tilingjob", "repairjob", etc.
}

// Props interface for the generic ShowMoreCard component
export interface ShowMoreCardProps {
  // Entity data (job or lead)
  job?: Job | EntityDataState;
  leadData?: Lead | EntityDataState;

  // Callbacks
  onClose: () => void;
  onArchive?: (params?: { model: string; id: number }) => void;
  onArchiveJob?: (jobData: EntityDataState) => void;
  onArchiveLead?: () => void;
  onDelete?: (params?: { model: string; id: number }) => void;
  onDeleteJob?: (jobData: EntityDataState) => void;
  onRestore?: () => void;

  // State flags
  toggleArchive?: boolean;
  completedJob?: boolean;
  cancelled?: boolean;
  fromCompleted?: boolean;
  isTrashed?: boolean;

  // Optional pre-loaded data
  jobFiles?: FileAttachment[];
  jobComments?: NoteComment[];
  leadFiles?: FileAttachment[];
  leadComments?: NoteComment[];
  leadStatuses?: StatusItem[];
  leadTypes?: LeadTypeInfo[];
  projectTypes?: ProjectType[];
  isLoadingFiles?: boolean;
  isLoadingComments?: boolean;

  // Configuration (optional - will be auto-detected if not provided)
  config?: ShowMoreCardConfig;

  // Permission props for conditional button rendering
  hasRestorePermission?: boolean;
  hasDeletePermission?: boolean;
}

// Job Details tab: grouped props for cleaner passing
export interface JobDetailsTabEntity {
  config: ShowMoreCardConfig;
  entityType: EntityType;
  entityDataState: EntityDataState;
  setEntityDataState: React.Dispatch<React.SetStateAction<EntityDataState>>;
  isDisabled: boolean;
  commentsReadOnly: boolean;
  isTrashed?: boolean;
  toggleArchive?: boolean;
}

export interface JobDetailsTabData {
  comments: NoteComment[];
  allTeam: TeamMember[];
  corePoints: CorePointItem[];
  mapPins: MapPinItem[];
}

export interface JobDetailsTabMap {
  boundaryMapRef: React.RefObject<BoundaryMapRef | null>;
  userLocation: GeoLatLng | null;
  organizationLocation: GeoLatLng | null;
  locationError: string | null;
  triggerBoundaryMapCenter: boolean;
  tempVertices: GeoLatLng[];
  tempLocation: GeoLatLng | null;
  setTempVertices: (vertices: GeoLatLng[]) => void;
  setTempLocation: (location: GeoLatLng | null) => void;
  editingMap: boolean;
  isCorePointMode: boolean;
  isPinMode: boolean;
}

export interface JobDetailsTabHooks {
  commentsHook: CommentsHookResult;
}

export interface JobDetailsTabUtils {
  router: AppRouterInstance;
  transformVertices: (vertices: unknown) => GeoLatLng[];
  orgId: string | null;
}

export interface JobDetailsTabPermissions {
  canEdit: boolean;
  canEditLeadPage: boolean;
  canEditFarm: boolean;
  canEditCorePoints: boolean;
  canViewInstalledFootage: boolean;
  canViewInstalledRisers: boolean;
  canUpdateInstalledFootage: boolean;
  canUpdateInstalledRisers: boolean;
  jobPageReadPermissionCode: PermissionCode | null;
}

export interface JobDetailsTabHandlers {
  handleCustomerPatch: (
    field: string,
    value: HandleCustomerPatchValue
  ) => Promise<void>;
  handleCorePointSubmit: (
    corePoint: CorePointCreatePayload & { id?: number }
  ) => Promise<void>;
  handleCorePointDelete: (coreId: number) => void;
  handleMapEditSave: () => Promise<void>;
  handleMapEditCancel: () => void;
  handlePinAdd: GeoLatLngAsyncHandler;
  handlePinCreate: MapPinCreateSubmitHandler;
  handlePinDelete: (pinId: number) => void;
  handleTogglePinMode: () => void;
  handleStartCorePointMode: () => void;
  openFarmAssignmentDialog: () => void;
}

// Base props shared by all tab components
export interface BaseTabProps {
  config: ShowMoreCardConfig;
  entityType: EntityType;
  entityDataState: EntityDataState;
  setEntityDataState: React.Dispatch<React.SetStateAction<EntityDataState>>;
  isDisabled: boolean;
  /** Gating for scheduling-only controls on completed/canceled entities. */
  schedulingSectionDisabled?: boolean;
  isTrashed?: boolean;
}

// TabRenderer: grouped props for cleaner passing (flattened when passed to tab children)
export interface TabRendererEntity {
  config: ShowMoreCardConfig;
  entityType: EntityType;
  entityDataState: EntityDataState;
  setEntityDataState: React.Dispatch<React.SetStateAction<EntityDataState>>;
  isDisabled: boolean;
  schedulingSectionDisabled?: boolean;
  isTrashed?: boolean;
}

export interface TabRendererData {
  filteredFiles?: FilteredFilesMap;
  estimateData?: JobEstimate;
}

export interface TabRendererUI {
  uploading?: boolean;
  checkedFiles?: number[];
}

export interface TabRendererPermissions {
  canEdit?: boolean;
  farmerEntity?: boolean;
  permissionCode?: PermissionCode | null;
  jobPageReadPermissionCode?: PermissionCode | null;
  leadPageReadPermissionCode?: PermissionCode | null;
}

export interface TabRendererComputed {
  isFinancialEstimateDisabled?: boolean;
}

export interface TabRendererHandlers {
  handleFileDelete?: (id: string | number, title: string) => void;
  handleCheck?: (idx: number) => void;
  setSelectedFileType?: (type: string) => void;
  setSelectedFileName?: (name: string) => void;
  setIsFixedTitle?: (fixed: boolean) => void;
  setShowUploadFile?: (show: boolean) => void;
  handleInlineFileSelect?: (file: File) => void;
}

export interface TabRendererInputProps {
  activeTab: TabName;
  entity: TabRendererEntity;
  data?: TabRendererData;
  ui?: TabRendererUI;
  permissions?: TabRendererPermissions;
  computed?: TabRendererComputed;
  handlers?: TabRendererHandlers;
}

// Flat props passed to tab children (FilesTab, FinancialTabWrapper, etc.)
export interface TabRendererProps extends BaseTabProps {
  activeTab: TabName;
  filteredFiles?: FilteredFilesMap;
  estimateData?: JobEstimate;
  uploading?: boolean;
  checkedFiles?: number[];
  canEdit?: boolean;
  farmerEntity?: boolean;
  permissionCode?: PermissionCode | null;
  jobPageReadPermissionCode?: PermissionCode | null;
  leadPageReadPermissionCode?: PermissionCode | null;
  isFinancialEstimateDisabled?: boolean;
  handleFileDelete?: (id: string | number, title: string) => void;
  handleCheck?: (idx: number) => void;
  setSelectedFileType?: (type: string) => void;
  setSelectedFileName?: (name: string) => void;
  setIsFixedTitle?: (fixed: boolean) => void;
  setShowUploadFile?: (show: boolean) => void;
  handleInlineFileSelect?: (file: File) => void;
}
