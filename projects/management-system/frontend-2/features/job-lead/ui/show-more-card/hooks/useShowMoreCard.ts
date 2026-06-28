import { useRouter } from "next/navigation";
/* eslint-disable react-hooks/exhaustive-deps -- Zustand store setters are stable references */
import {
  type ComponentType,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type {
  CorePoint,
  JobActiveInvoice,
  JobEstimate,
  JobUpdatePayload,
  LeadUpdatePayload,
  MapPin,
  NoteComment,
  OrganizationListRow,
  ProjectType,
  RecordEquipment,
  RecordFarm,
  TeamMember,
  VendorFormV2,
} from "@/api/types";
import {
  JobType,
  LeadType,
  PermissionCode,
  ResourceType,
  UserRole,
} from "@/constants";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { resolveCommentsReadOnly } from "@/features/completed/lib";
import { buildShowMoreCardScopeKey } from "@/features/job-lead/lib/show-more-card-scope";
import { useShowMoreCardEntity } from "@/features/job-lead/model/show-more-card-store";
import { useAssignmentMembershipHelper } from "@/features/jobs";
import { useJobAssignedToFilter } from "@/features/jobs/hooks/useJobAssignedToFilter";
import {
  buildStakeholderPayload,
  mapJobTypeToRecordJobType,
} from "@/features/jobs/lib";
import type { MapPinItem } from "@/features/map/model/mapPinItem";
import { mapPinToMapPinItem } from "@/features/map/model/mapPinItem";
import type { MapPinCreateSubmitHandler } from "@/features/map/model/types";
import {
  useDialogManager,
  useInvoicesData,
  useOrganizationData,
  useRouteIds,
  useStateData,
  useTeamData,
} from "@/hooks";
import {
  useCreateJobCorePoint,
  useCreateJobInvoice,
  useCreateJobPin,
  useCreateLeadCorePoint,
  useCreateLeadPin,
  useCreateVendorForm,
  useDeleteJobCorePoint,
  useDeleteJobPin,
  useDeleteLeadCorePoint,
  useDeleteLeadPin,
  useDeleteMapFile,
  useGetJobActiveInvoices,
  useUpdateJobCorePoint,
  useUpdateLeadCorePoint,
  useUploadMapFiles,
} from "@/hooks/mutations";
import {
  PERMISSION_RESOURCES,
  useCanEditTerminalJobScheduling,
  useContactPermissions,
  useHasExcavationEstimateFinancialWritePermission,
  useHasExcavationEstimateTabPermission,
  useHasExcavationFinancialTabPermission,
  useHasTilingEstimateFinancialWritePermission,
  useHasTilingEstimateTabPermission,
  useHasTilingFinancialTabPermission,
  useJobPermissions,
  useJobProgressPermissions,
  useOrderPipePermissions,
  usePermissionsFromStorage,
} from "@/hooks/permissions";
import {
  useJobCorePoints,
  useJobPins,
  useLeadCorePoints,
  useLeadPins,
  useVendorFormsV2,
} from "@/hooks/queries";
import { StorageKey, useDataFromStorageByKey } from "@/hooks/storage-data";
import axiosInstance from "@/lib/axios";
import { orgPath, orgUrl } from "@/shared/config/routes";
import {
  entityHasMapFileInV2,
  getMapFileDeleteSuccessMessage,
  getMapFileTypeLabel,
  mapFileTypeFromUploadTitle,
  removeMapFileFromEntityState,
  showMapUploadResults,
  toUploadFileArray,
} from "@/shared/lib/mapFilesV2";
import { parseEntityId } from "@/shared/lib/parseEntityId";
import { useModalStack } from "@/shared/model/use-modal-stack";
import { SitesPopUp } from "@/shared/ui/common";
import type { BoundaryMapRef } from "@/shared/ui/common/map";
import { getErrorMessage } from "@/utils/apiError";
import { validateKmlFile } from "@/utils/kml.utils";
import { resolveNotesTabAccessForJob } from "@/utils/notes";

import type {
  ContactAssignmentDialogProps,
  ConvertToJobDialogProps,
  FarmAssignmentDialogProps,
  ReshareDialogProps,
} from "../dialogs";
import { type EntityDataState, mergeEntityDataState } from "../entityDataState";
import type { HandleCustomerPatchValue } from "../handleCustomerPatchValue";
import { getActiveUnpaidJobInvoice } from "../lib/jobActiveInvoice";
import {
  type CommentsHookResult,
  type CorePointItem,
  type FilteredFilesMap,
  type JobFileItem,
  type LatLng,
  type OneCallSite,
  ShowMoreCardConfig,
  type ShowMoreCardConvertHookResult,
  type ShowMoreCardDeleteHookResult,
  type ShowMoreCardFilesHookResult,
  type ShowMoreCardPatchHookResult,
  ShowMoreCardProps,
  type StatusItem,
  TabName,
  type UploadFileParams,
} from "../types";
import { filterFilesByType } from "../utils/fileFiltering";
import {
  getInitialLocation,
  transformVertices,
  transformVerticesToBackend,
} from "../utils/vertexTransform";
import { useShowMoreCardStoreState } from "./useShowMoreCardStoreState";

export type { EntityContactInfo, EntityDataState } from "../entityDataState";
export type {
  CorePointItem,
  FilteredFilesMap,
  JobFileItem,
  LatLng,
  OneCallSite,
  StatusItem,
  UploadFileParams,
} from "../types";

export type { HandleCustomerPatchValue } from "../handleCustomerPatchValue";

// ---------------------------------------------------------------------------
// Data-shape interfaces (from runtime-captured types)
// ---------------------------------------------------------------------------

/** Farmer/contact entity (optional; logs showed undefined) */
export type FarmerEntity = boolean | undefined;

/** Current status (same shape as StatusItem) */
export type CurrentStatusItem = StatusItem | null | undefined;

/**
 * Props for useShowMoreCard hook
 */
export interface UseShowMoreCardProps {
  config: ShowMoreCardConfig;
  entityType: ResourceType;
  entityData?: EntityDataState;
  props: ShowMoreCardProps;
}

function normalizeOneCallSites(data: unknown): OneCallSite[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as OneCallSite[];
  if (
    typeof data === "object" &&
    data !== null &&
    "sites" in data &&
    Array.isArray((data as { sites: unknown }).sites)
  ) {
    return (data as { sites: OneCallSite[] }).sites;
  }
  return [data as OneCallSite];
}

function getAuthRoleName(
  user: ReturnType<typeof useAuth>["currentUser"]
): string | undefined {
  if (!user) return undefined;
  if (user.roleDetails?.name) return user.roleDetails.name;
  const role = user.role;
  if (
    typeof role === "object" &&
    role !== null &&
    "name" in role &&
    typeof role.name === "string"
  ) {
    return role.name;
  }
  return undefined;
}

/**
 * Return type for useShowMoreCard hook - grouped by concern
 */
export interface UseShowMoreCardReturn {
  // Data from hooks
  data: {
    comments: NoteComment[];
    files: JobFileItem[];
    filteredFiles: FilteredFilesMap;
    statuses: StatusItem[];
    projectTypes: ProjectType[];
    corePoints: CorePointItem[];
    mapPins: MapPinItem[];
    estimateData?: JobEstimate | undefined;
    allTeam: TeamMember[];
    allEquipment: RecordEquipment[];
    farms?: RecordFarm[];
    farmsLoading: boolean;
  };

  // Entity state
  entity: {
    entityDataState: EntityDataState;
    setEntityDataState: React.Dispatch<React.SetStateAction<EntityDataState>>;
    loading: boolean;
    hasExistingVendorFormV2: boolean;
    activeOrderPipeStatus: string | null;
  };

  // UI State
  ui: {
    activeTab: TabName;
    setActiveTab: (tab: TabName) => void;
    visibleTabs: TabName[];
    showUploadFile: boolean;
    setShowUploadFile: (show: boolean) => void;
    uploading: boolean;
    setUploading: (uploading: boolean) => void;
    uploadFileProgress: number | null;
    checkedFiles: number[];
    setCheckedFiles: (files: number[]) => void;
    editingMap: boolean;
    setEditingMap: (editing: boolean) => void;
    isCorePointMode: boolean;
    setIsCorePointMode: (mode: boolean) => void;
    isPinMode: boolean;
    setIsPinMode: (mode: boolean) => void;
    selectedFileType: string;
    setSelectedFileType: (type: string) => void;
    selectedFileName: string;
    setSelectedFileName: (name: string) => void;
    isFixedTitle: boolean;
    setIsFixedTitle: (fixed: boolean) => void;
    pendingUploadFile: File | null;
    setPendingUploadFile: (file: File | null) => void;
    sites: OneCallSite[];
    setSites: (sites: OneCallSite[]) => void;
    oneCallError: string | null;
    setOneCallError: (error: string | null) => void;
    invoiceCheckLoading: boolean;
    setInvoiceCheckLoading: (loading: boolean) => void;
    entityInvoice: JobActiveInvoice | null;
    setEntityInvoice: (invoice: JobActiveInvoice | null) => void;
  };

  // Map State
  map: {
    boundaryMapRef: React.RefObject<BoundaryMapRef | null>;
    userLocation: LatLng | null;
    organizationLocation: LatLng | null;
    locationError: string | null;
    triggerBoundaryMapCenter: boolean;
    setTriggerBoundaryMapCenter: (trigger: boolean) => void;
    tempVertices: LatLng[];
    tempLocation: LatLng | null;
    setTempVertices: (vertices: LatLng[]) => void;
    setTempLocation: (location: LatLng | null) => void;
  };

  // Permissions
  permissions: {
    canRead: boolean;
    canEdit: boolean;
    canEditLeadPage: boolean;
    canDelete: boolean;
    canEditStatus: boolean;
    canViewStakeholders: boolean;
    canEditStakeholders: boolean;
    canEditFarm: boolean;
    canEditCorePoints: boolean;
    canAccessContact: boolean;
    canViewInstalledFootage: boolean;
    canViewInstalledRisers: boolean;
    canUpdateInstalledFootage: boolean;
    canUpdateInstalledRisers: boolean;
    canWriteExcavationEquipment: boolean;
    canOrderPipe: boolean;
    jobPageReadPermissionCode: PermissionCode | null;
    leadPageReadPermissionCode: PermissionCode | null;
    permissionCode: PermissionCode | null;
    requiresPermissionCheck: boolean;
  };

  // Computed values
  computed: {
    isDisabled: boolean;
    isFinancialEstimateDisabled: boolean;
    isStatusDisabled: boolean;
    farmerEntity: FarmerEntity;
    contactId?: number;
    currentStatus: CurrentStatusItem;
    currentProjectType?: ProjectType;
    orderPipeButtonText: string;
    /** When stricter than `isDisabled`, only scheduling UIs should use this. */
    schedulingSectionDisabled: boolean;
    /** Notes/comments: may stay editable on completed/canceled jobs when user has write. */
    commentsReadOnly: boolean;
  };

  // Mutations
  mutations: {
    patchHook: ShowMoreCardPatchHookResult;
    deleteHook: ShowMoreCardDeleteHookResult;
    convertHook?: ShowMoreCardConvertHookResult;
    commentsHook: CommentsHookResult;
    filesHook: ShowMoreCardFilesHookResult;
  };

  // Handlers
  handlers: {
    handleCustomerPatch: (
      field: string,
      value: HandleCustomerPatchValue
    ) => Promise<void>;
    handleDeleteEntity: () => void;
    handleArchive: () => Promise<void>;
    handleStatusChange: (newStatusId: number) => Promise<void>;
    handleCreateNewFarm: () => void;
    handleFileDelete: (id: string | number, title: string) => void;
    handleCheck: (idx: number) => void;
    handleUploadFile: (params: UploadFileParams) => Promise<void>;
    handleInlineFileSelect: (file: File) => void;
    handleCorePointSubmit: (corePoint: {
      id?: number;
      name?: string;
      description?: string;
      latitude: number;
      longitude: number;
    }) => Promise<void>;
    handleCorePointDelete: (coreId: number) => void;
    handleMapEditSave: () => Promise<void>;
    handleMapEditCancel: () => void;
    handlePinAdd: (lat: number, lng: number) => Promise<void>;
    handlePinCreate: MapPinCreateSubmitHandler;
    handlePinDelete: (pinId: number) => void;
    handleTogglePinMode: () => void;
    handleStartCorePointMode: () => void;
    handleOneCallPatch: (oneCallStatus: boolean) => Promise<void>;
    handleToggleOneCall: () => void;
    handleOpenSite: (site: OneCallSite) => void;
    handleOrderPipes: () => void;
    handleInvoiceClick: () => Promise<void>;
    handleToggleInvoiceStatus: (
      field: "checked_by_admin" | "sent_to_client" | "paid"
    ) => Promise<void>;
    handleToggleEstimateSent: () => Promise<void>;
    handleToggleContractSent: () => Promise<void>;
    handleMaterialStatusChange: (status: string) => Promise<void>;
    handleProjectTypeChange: (projectTypeId: number | null) => Promise<void>;
  };

  // Dialog helpers
  dialogs: {
    dialogManager: ReturnType<typeof useDialogManager>;
    openReshareDialog: () => void;
    openConvertDialog: () => void;
    openContactAssignmentDialog: () => void;
    openFarmAssignmentDialog: () => void;
    openSitesPopUp: (config?: {
      sites?: OneCallSite[];
      error?: string | null;
    }) => void;
    // URL-driven modals (mounted in ShowMoreCard)
    isReshareDialogOpen: boolean;
    isConvertDialogOpen: boolean;
    isContactAssignmentDialogOpen: boolean;
    isFarmAssignmentDialogOpen: boolean;
    closeReshareDialog: () => void;
    closeConvertDialog: () => void;
    closeContactAssignmentDialog: () => void;
    closeFarmAssignmentDialog: () => void;
    reshareDialogProps: Omit<ReshareDialogProps, "onClose">;
    convertDialogProps: Omit<
      ConvertToJobDialogProps,
      "open" | "onOpenChange"
    >;
    contactAssignmentDialogProps: Omit<
      ContactAssignmentDialogProps,
      "open" | "onOpenChange"
    >;
    farmAssignmentDialogProps: Omit<
      FarmAssignmentDialogProps,
      "open" | "onOpenChange"
    >;
  };

  // Utilities
  utils: {
    router: ReturnType<typeof useRouter>;
    queryClient: ReturnType<typeof useQueryClient>;
    transformVertices: typeof transformVertices;
    orgId: string | null;
    currentUser: ReturnType<typeof useAuth>["currentUser"];
  };
}

/**
 * Unified hook for ShowMoreCard - consolidates all state, hooks, and handlers
 */
export function useShowMoreCard({
  config,
  entityType,
  entityData,
  props,
}: UseShowMoreCardProps): UseShowMoreCardReturn {
  const router = useRouter();
  const queryClient = useQueryClient();
  const dialogManager = useDialogManager();
  const { stack: modalStack, openModal, closeModalKey } = useModalStack();
  const { orgId } = useRouteIds();
  const { resolveFilteredMemberId, evaluateJobAssignmentState } =
    useAssignmentMembershipHelper();
  const { assignedTo } = useJobAssignedToFilter();
  const memberId = useDataFromStorageByKey(StorageKey.MEMBER_ID);
  // Helper to convert JobType to LeadType
  const jobTypeToLeadType = (jobType: JobType): LeadType => {
    return jobType as unknown as LeadType;
  };

  // ============================================
  // PERMISSION HOOKS
  // ============================================
  const hasExcavationEstimateTab = useHasExcavationEstimateTabPermission();
  const hasExcavationFinancialTab = useHasExcavationFinancialTabPermission();
  const hasTilingEstimateTab = useHasTilingEstimateTabPermission();
  const hasTilingFinancialTab = useHasTilingFinancialTabPermission();
  const hasExcavationEstimateFinancialWrite =
    useHasExcavationEstimateFinancialWritePermission();
  const hasTilingEstimateFinancialWrite =
    useHasTilingEstimateFinancialWritePermission();
  const { canRead: canAccessContact } = useContactPermissions();
  const { permissionCodes: excavationEquipmentPermissions } =
    usePermissionsFromStorage(
      PERMISSION_RESOURCES.JOBS_EXCAVATION_EQUIPMENT_MANAGEMENT
    );
  const canWriteExcavationEquipment =
    excavationEquipmentPermissions.includes("write");

  // ============================================
  // CONFIG HOOK CALLS
  // ============================================
  const entityId = entityData?.id;
  const scopeKey = buildShowMoreCardScopeKey(orgId, entityType, entityId);
  const initialVertices = transformVertices(entityData?.farm_info?.vertices);
  const initialLocation = getInitialLocation(entityData?.farm_info) ?? null;

  const {
    activeTab,
    setActiveTab,
    showUploadFile,
    setShowUploadFile,
    selectedFileType,
    setSelectedFileType,
    selectedFileName,
    setSelectedFileName,
    isFixedTitle,
    setIsFixedTitle,
    pendingUploadFile,
    setPendingUploadFile,
    uploading,
    setUploading,
    uploadFileProgress,
    setUploadFileProgress,
    checkedFiles,
    setCheckedFiles,
    invoiceCheckLoading,
    setInvoiceCheckLoading,
    entityInvoice,
    setEntityInvoice,
    sites,
    setSites,
    oneCallError,
    setOneCallError,
    editingMap,
    setEditingMap,
    isCorePointMode,
    setIsCorePointMode,
    isPinMode,
    setIsPinMode,
    triggerBoundaryMapCenter,
    setTriggerBoundaryMapCenter,
    tempVertices,
    setTempVertices,
    tempLocation,
    setTempLocation,
    userLocation,
    setUserLocation,
    locationError,
    setLocationError,
    loading,
    setLoading,
  } = useShowMoreCardStoreState({
    scopeKey,
    defaultTab: config.tabs[0],
    initialVertices,
    initialLocation,
    initialLoading: !!entityData?.url,
    initialEntityDataState: entityData ?? {},
  });

  const { entityDataState, setEntityDataState } =
    useShowMoreCardEntity(scopeKey);
  const resolvedEntityId = entityDataState.id ?? entityId;

  const notesTabAccess = useMemo(() => {
    const raw = entityDataState?.notesTabAccess ?? entityData?.notesTabAccess;
    if (entityType !== "job") {
      return raw;
    }
    const canAccessOnSiteTracking =
      entityDataState?.canAccessOnSiteTracking ??
      entityData?.canAccessOnSiteTracking;
    return resolveNotesTabAccessForJob(raw, canAccessOnSiteTracking);
  }, [
    entityType,
    entityDataState?.notesTabAccess,
    entityData?.notesTabAccess,
    entityDataState?.canAccessOnSiteTracking,
    entityData?.canAccessOnSiteTracking,
  ]);
  const commentsHook = config.hooks.useComments(
    resolvedEntityId || 0,
    notesTabAccess
  );
  const filesHook = config.hooks.useFiles(resolvedEntityId || 0);
  const statusesHook = config.hooks.useStatuses();
  const patchHook = config.hooks.usePatch();
  const deleteHook = config.hooks.useDelete();
  const convertHook = config.hooks.useConvertToJob?.();
  const estimateHook = config.hooks.useEstimate?.(resolvedEntityId || 0);
  const equipmentHook = config.hooks.useEquipment?.();

  // ============================================
  // OTHER HOOKS
  // ============================================
  const { data: allTeam } = useTeamData();
  const { data: organizationsData } = useOrganizationData();
  const { currentUser } = useAuth();
  const { getStateSites } = useStateData(config.stateDataKey);
  const { patchInvoice } = useInvoicesData({
    enabled: entityType === ResourceType.JOB,
  });
  const jobPermissions = useJobPermissions(config.jobType);
  const { permissionCodes: completedCanceledPermissionCodes } =
    usePermissionsFromStorage(PERMISSION_RESOURCES.COMPLETED_CANCELED_PAGE);
  const { permissionCodes: leadPagePermissionCodes } =
    usePermissionsFromStorage(PERMISSION_RESOURCES.LEADS_PAGE);
  const orderPipePermissions = useOrderPipePermissions();
  const { canEdit: canEditTerminalJobScheduling } =
    useCanEditTerminalJobScheduling(config.jobType);

  const createCorePointJob = useCreateJobCorePoint();
  const updateCorePointJob = useUpdateJobCorePoint();
  const deleteCorePointJob = useDeleteJobCorePoint();
  const createJobPin = useCreateJobPin();
  const deleteJobPin = useDeleteJobPin();
  const getJobActiveInvoicesMutation = useGetJobActiveInvoices();
  const createInvoiceForJob = useCreateJobInvoice();
  const deleteMapFile = useDeleteMapFile();
  const uploadMapFiles = useUploadMapFiles();

  // V2 Vendor Forms: used for Order Pipes creation flow and existing-order detection
  const isTilingJob =
    entityType === ResourceType.JOB && config.jobType === JobType.TILING;
  const createVendorFormV2 = useCreateVendorForm();
  const { vendorForms: existingVendorForms, refetch: refetchVendorFormsV2 } =
    useVendorFormsV2(
      { job_id: entityData?.id },
      isTilingJob && !!entityData?.id // enabled only for tiling jobs with an ID
    );
  const hasExistingVendorFormV2 = useMemo(() => {
    return existingVendorForms.some(
      (form) =>
        form.order_status &&
        form.order_status !== "Delivered" &&
        form.order_status !== "Cancelled"
    );
  }, [existingVendorForms]);

  const activeOrderPipeStatus = useMemo(() => {
    if (existingVendorForms.length === 0) return null;

    const mostRecentForm = existingVendorForms.reduce((latest, current) =>
      current.id > latest.id ? current : latest
    );

    return mostRecentForm.order_status;
  }, [existingVendorForms]);

  const updateCorePointLead = useUpdateLeadCorePoint();
  const createCorePointLead = useCreateLeadCorePoint();
  const deleteCorePointLead = useDeleteLeadCorePoint();
  const createLeadPin = useCreateLeadPin();
  const deleteLeadPin = useDeleteLeadPin();

  // Core points hooks
  const corePointsJobId =
    entityType === ResourceType.JOB && config.features.corePoints
      ? resolvedEntityId || 0
      : 0;
  const corePointsLeadId =
    entityType === ResourceType.LEAD && config.features.corePoints
      ? resolvedEntityId || 0
      : 0;
  const corePointsJobQuery = useJobCorePoints(corePointsJobId, {});
  const corePointsLeadQuery = useLeadCorePoints(corePointsLeadId, {});
  const corePointsData =
    entityType === ResourceType.LEAD
      ? corePointsLeadQuery.data
      : corePointsJobQuery.data;

  // Map pins hooks
  const mapPinsJobId =
    entityType === ResourceType.JOB && config.features.mapPins
      ? resolvedEntityId || 0
      : 0;
  const mapPinsLeadId =
    entityType === ResourceType.LEAD && config.features.mapPins
      ? resolvedEntityId || 0
      : 0;
  const mapPinsJobQuery = useJobPins(mapPinsJobId, {});
  const mapPinsLeadQuery = useLeadPins(mapPinsLeadId, {});
  const mapPinsData =
    entityType === ResourceType.LEAD
      ? mapPinsLeadQuery.data
      : mapPinsJobQuery.data;

  // ============================================
  // COMPUTED VALUES
  // ============================================
  const boundaryMapRef = useRef<BoundaryMapRef>(null);
  const permissionCode = useMemo<PermissionCode | null>(() => {
    if (
      entityType !== ResourceType.JOB ||
      (config.jobType !== JobType.EXCAVATION &&
        config.jobType !== JobType.TILING)
    ) {
      return null;
    }
    return config.jobType === JobType.EXCAVATION
      ? PermissionCode.JOBS_EXCAVATION_ESTIMATE_FINANCIAL_READ
      : PermissionCode.JOBS_TILING_ESTIMATE_FINANCIAL_READ;
  }, [entityType, config.jobType]);

  const supportsTilingStyleMapUploads = useMemo(
    () =>
      config.jobType === JobType.TILING ||
      config.jobType === JobType.REPAIR ||
      config.jobType === JobType.EXCAVATION,
    [config.jobType]
  );

  const leadPageReadPermissionCode = useMemo<PermissionCode | null>(() => {
    if (entityType !== ResourceType.LEAD) {
      return null;
    }
    return PermissionCode.LEADS_PAGE_READ;
  }, [entityType]);

  const jobPageReadPermissionCode = useMemo<PermissionCode | null>(() => {
    if (entityType !== ResourceType.JOB) {
      return null;
    }
    if (config.jobType === JobType.REPAIR) {
      return PermissionCode.JOBS_REPAIR_PAGE_READ;
    } else if (config.jobType === JobType.EXCAVATION) {
      return PermissionCode.JOBS_EXCAVATION_PAGE_READ;
    } else if (config.jobType === JobType.TILING) {
      return PermissionCode.JOBS_TILING_PAGE_READ;
    }
    return null;
  }, [entityType, config.jobType]);

  const visibleTabs = useMemo(() => {
    if (entityType !== ResourceType.JOB) {
      return config.tabs;
    }

    return config.tabs.filter((tab) => {
      if (config.jobType === JobType.EXCAVATION) {
        if (tab === "Estimate") {
          return hasExcavationEstimateTab;
        }
        if (tab === "Financial" || tab === "Financial & Scheduling") {
          return hasExcavationFinancialTab;
        }
      }

      if (config.jobType === JobType.TILING) {
        if (tab === "Estimate") {
          return hasTilingEstimateTab;
        }
        if (tab === "Financial" || tab === "Financial & Scheduling") {
          return hasTilingFinancialTab;
        }
      }

      return true;
    });
  }, [
    config.tabs,
    entityType,
    config.jobType,
    hasExcavationEstimateTab,
    hasExcavationFinancialTab,
    hasTilingEstimateTab,
    hasTilingFinancialTab,
  ]);

  const {
    canUpdateInstalledFootage,
    canUpdateInstalledRisers,
    canViewInstalledFootage,
    canViewInstalledRisers,
  } = useJobProgressPermissions(
    entityType === ResourceType.JOB ? entityDataState?.id : undefined,
    config.jobType
  );

  const canEditCorePoints = currentUser?.role !== UserRole.VIEWER;

  const requiresPermissionCheck = useMemo(() => {
    const roleName = getAuthRoleName(currentUser);
    return roleName === "Admin" || roleName === "Bookkeeper";
  }, [currentUser]);

  const organizationLocation = useMemo(() => {
    if (!organizationsData || !orgId) return null;
    const currentOrg = organizationsData.find(
      (org: OrganizationListRow) => org.id === Number(orgId)
    );
    return currentOrg?.latitude && currentOrg?.longitude
      ? {
          lat: currentOrg.latitude,
          lng: currentOrg.longitude,
        }
      : null;
  }, [organizationsData, orgId]);

  const finalJobPermissions = useMemo(() => {
    if (entityType !== ResourceType.JOB) {
      return {
        canRead: true,
        canAdd: true,
        canEdit: true,
        canEditStatus: true,
        canDelete: true,
        isLoading: false,
      };
    }
    return jobPermissions;
  }, [entityType, jobPermissions]);

  const canEditLeadPage = useMemo(
    () => leadPagePermissionCodes.includes("write"),
    [leadPagePermissionCodes]
  );

  const isDisabled =
    props.isTrashed ||
    props.toggleArchive ||
    props.completedJob ||
    props.cancelled ||
    (entityType === ResourceType.JOB
      ? !finalJobPermissions.canEdit
      : !canEditLeadPage);

  const terminalJobStatusTitle = useMemo(() => {
    const status = entityDataState.job_status;
    if (
      status &&
      typeof status === "object" &&
      "title" in status &&
      typeof (status as { title?: string }).title === "string"
    ) {
      return (status as { title: string }).title;
    }
    return null;
  }, [entityDataState.job_status]);

  const commentsReadOnly = useMemo(
    () =>
      resolveCommentsReadOnly({
        isTrashed: props.isTrashed,
        toggleArchive: props.toggleArchive,
        fromCompleted: props.fromCompleted,
        completedJob: props.completedJob,
        cancelled: props.cancelled,
        entityCancelled: entityDataState.cancelled,
        jobStatusTitle: terminalJobStatusTitle,
        hasJobWrite:
          entityType === ResourceType.JOB
            ? finalJobPermissions.canEdit
            : canEditLeadPage,
        hasCompletedCanceledPageWrite:
          completedCanceledPermissionCodes.includes("write"),
      }),
    [
      props.isTrashed,
      props.toggleArchive,
      props.fromCompleted,
      props.completedJob,
      props.cancelled,
      entityDataState.cancelled,
      terminalJobStatusTitle,
      entityType,
      finalJobPermissions.canEdit,
      canEditLeadPage,
      completedCanceledPermissionCodes,
    ]
  );

  const schedulingSectionDisabled = useMemo(() => {
    if (props.isTrashed || props.toggleArchive) return true;
    const terminal = props.completedJob || props.cancelled;
    if (!terminal) return isDisabled;
    if (entityType !== ResourceType.JOB) return isDisabled;
    return !canEditTerminalJobScheduling;
  }, [
    props.isTrashed,
    props.toggleArchive,
    props.completedJob,
    props.cancelled,
    entityType,
    isDisabled,
    canEditTerminalJobScheduling,
  ]);

  const isFinancialEstimateDisabled = useMemo(() => {
    if (entityType !== ResourceType.JOB) {
      return isDisabled;
    }

    if (config.jobType === JobType.EXCAVATION) {
      return (
        props.isTrashed ||
        props.toggleArchive ||
        props.completedJob ||
        props.cancelled ||
        !hasExcavationEstimateFinancialWrite
      );
    } else if (config.jobType === JobType.TILING) {
      return (
        props.isTrashed ||
        props.toggleArchive ||
        props.completedJob ||
        props.cancelled ||
        !hasTilingEstimateFinancialWrite
      );
    }

    return isDisabled;
  }, [
    entityType,
    config.jobType,
    props.isTrashed,
    props.toggleArchive,
    props.completedJob,
    props.cancelled,
    hasExcavationEstimateFinancialWrite,
    hasTilingEstimateFinancialWrite,
    isDisabled,
  ]);

  const isStatusDisabled =
    props.isTrashed || props.toggleArchive || props.cancelled;
  const canRead = finalJobPermissions.canRead;
  const canDelete = finalJobPermissions.canDelete;
  const canEdit = finalJobPermissions.canEdit;
  const canEditStatus = finalJobPermissions.canEditStatus;

  const canViewStakeholders = useMemo(() => {
    if (entityType === "job") {
      return canRead || canEdit;
    }
    return (
      leadPagePermissionCodes.includes("read") ||
      leadPagePermissionCodes.includes("write")
    );
  }, [entityType, canRead, canEdit, leadPagePermissionCodes]);

  const isJobStakeholderEditLocked = useMemo(() => {
    if (entityType !== "job") return false;
    if (props.completedJob || props.cancelled) return true;
    if (entityDataState.cancelled) return true;
    const status = entityDataState.job_status;
    if (
      status &&
      typeof status === "object" &&
      "title" in status &&
      typeof (status as { title?: string }).title === "string"
    ) {
      return (status as { title: string }).title === "Completed";
    }
    return false;
  }, [
    entityType,
    props.completedJob,
    props.cancelled,
    entityDataState.cancelled,
    entityDataState.job_status,
  ]);

  const canEditStakeholders = useMemo(() => {
    if (props.isTrashed || isJobStakeholderEditLocked) return false;
    return entityType === "job" ? canEdit : canEditLeadPage;
  }, [
    entityType,
    canEdit,
    canEditLeadPage,
    props.isTrashed,
    isJobStakeholderEditLocked,
  ]);

  const canEditFarm = canEditStakeholders;

  const canOrderPipe =
    orderPipePermissions.canWrite &&
    !props.isTrashed &&
    !props.cancelled &&
    !props.completedJob &&
    !props.toggleArchive;

  const farmerEntity =
    entityDataState?.job_object_subclass?.includes("Farmer") ||
    entityDataState?.object_type?.includes("Farmer");

  const contactId = entityDataState?.contact_info?.id;

  const farmsHookResult = config.hooks.useFarms?.({
    contactId: contactId || 0,
  });
  const farmsData = farmsHookResult?.data;
  const farmsLoading = farmsHookResult?.isLoading ?? false;

  const farms = useMemo<RecordFarm[] | undefined>(() => {
    if (!farmsData) return undefined;
    return Array.isArray(farmsData) ? farmsData : farmsData.results || [];
  }, [farmsData]);

  const comments = useMemo<NoteComment[]>(() => {
    return props.jobComments || props.leadComments || commentsHook.data || [];
  }, [props.jobComments, props.leadComments, commentsHook.data]);

  const files = useMemo(() => {
    return props.jobFiles || props.leadFiles || filesHook.data || [];
  }, [props.jobFiles, props.leadFiles, filesHook.data]);

  const statusTypes = useMemo<StatusItem[]>(() => {
    return (props.leadStatuses || statusesHook.data || []) as StatusItem[];
  }, [props.leadStatuses, statusesHook.data]);

  const projectTypes = useMemo<ProjectType[]>(() => {
    return props.projectTypes ?? [];
  }, [props.projectTypes]);

  const filteredFiles = useMemo(() => {
    return filterFilesByType(files, config.fileTypes);
  }, [files, config.fileTypes]);

  const estimateData = useMemo(() => estimateHook?.data, [estimateHook?.data]);

  const corePoints = useMemo(() => {
    if (!corePointsData || !config.features.corePoints) return [];
    const cores: CorePoint[] = Array.isArray(corePointsData)
      ? corePointsData
      : corePointsData.results || [];
    return cores.map((core) => ({
      id: core.id,
      name: core.name,
      description: core.description || "",
      latitude: core.latitude,
      longitude: core.longitude,
    }));
  }, [corePointsData, config.features.corePoints]);

  const mapPins = useMemo(() => {
    if (!mapPinsData || !config.features.mapPins) return [];
    const pins: MapPin[] = Array.isArray(mapPinsData)
      ? mapPinsData
      : mapPinsData.results || [];
    return pins.map(mapPinToMapPinItem);
  }, [mapPinsData, config.features.mapPins]);

  const equipmentData = useMemo(
    () => equipmentHook?.data,
    [equipmentHook?.data]
  );

  const allEquipment = useMemo(() => {
    if (!equipmentData) return [];
    return Array.isArray(equipmentData)
      ? equipmentData
      : equipmentData.results || [];
  }, [equipmentData]);

  const currentStatus = useMemo(() => {
    const rawStatus =
      entityDataState?.job_status ?? entityDataState?.lead_status;
    const statusId =
      typeof rawStatus === "object" &&
      rawStatus !== null &&
      "id" in rawStatus &&
      typeof (rawStatus as { id: unknown }).id === "number"
        ? (rawStatus as { id: number }).id
        : rawStatus;
    const numericStatusId = statusId != null ? Number(statusId) : null;
    return statusTypes?.find((s) => Number(s.id) === numericStatusId);
  }, [statusTypes, entityDataState?.job_status, entityDataState?.lead_status]);

  const currentProjectType = useMemo<ProjectType | undefined>(() => {
    const raw = (
      entityDataState as
        | { project_type?: ProjectType | number | null }
        | null
        | undefined
    )?.project_type;
    const id = raw && typeof raw === "object" ? raw.id : (raw ?? undefined);
    if (!id) return undefined;
    return projectTypes.find((pt) => pt.id === id);
  }, [projectTypes, entityDataState]);

  const orderPipeButtonText = useMemo(() => {
    if (entityType !== ResourceType.JOB || config.jobType !== JobType.TILING) {
      return "Order Pipes";
    }

    if (hasExistingVendorFormV2) {
      return "View Order Pipe";
    }

    if (entityDataState.can_create_order_pipe) {
      return "Create Order Pipe";
    }

    return "View Order Pipe";
  }, [
    entityType,
    config.jobType,
    hasExistingVendorFormV2,
    entityDataState.can_create_order_pipe,
  ]);

  // ============================================
  // EFFECTS
  // ============================================
  useEffect(() => {
    if (entityData?.url) {
      setLoading(true);
      axiosInstance
        .get(entityData.url)
        .then((res) => setEntityDataState(res.data as EntityDataState))
        .finally(() => setLoading(false));
    }
  }, [entityData?.url]);

  useEffect(() => {
    if (entityData) {
      setEntityDataState((prev: EntityDataState) => {
        // Always update if ID changed
        if (prev?.id !== entityData.id) {
          return {
            ...prev,
            ...entityData,
          };
        }

        // If ID is same, check if content changed to prevent infinite loops
        // but allow updates from server refetches
        if (JSON.stringify(prev) !== JSON.stringify(entityData)) {
          return {
            ...prev,
            ...entityData,
          };
        }

        return prev;
      });
    }
  }, [entityData]);

  useEffect(() => {
    if (visibleTabs.length === 0) return;

    const fallbackTab = visibleTabs[0];
    if (!visibleTabs.includes(activeTab) && activeTab !== fallbackTab) {
      setActiveTab(fallbackTab);
    }
  }, [activeTab, setActiveTab, visibleTabs]);

  useEffect(() => {
    try {
      if (!navigator.geolocation) {
        setLocationError("Geolocation is not supported by this browser.");
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0,
      };

      const handleSuccess = (position: GeolocationPosition) => {
        const { latitude, longitude, accuracy } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        if (accuracy <= 100) {
          setLocationError(null);
        } else {
          setLocationError(
            "Low accuracy. Using network, try GPS for better results."
          );
        }
      };

      const handleError = (error: GeolocationPositionError) => {
        switch (error?.code) {
          case error.PERMISSION_DENIED:
            setLocationError(
              "Location access denied. Please enable location permissions."
            );
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError(
              "GPS unavailable. Enable location services and try outdoor location."
            );
            break;
          case error.TIMEOUT:
            setLocationError(
              "GPS timeout. Move to an open area with clear sky view."
            );
            break;
          default:
            setLocationError(
              "Location error. Enable GPS and location permissions."
            );
            break;
        }
      };

      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleError,
        options
      );
      const id = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        options
      );

      return () => {
        if (id) {
          navigator.geolocation.clearWatch(id);
        }
      };
    } catch (error) {
      console.error("Unexpected geolocation error:", error);
      setLocationError("Location service unavailable.");
    }
  }, []);

  useEffect(() => {
    if (!config.features.corePoints) return;

    const syncCorePointMode = () => {
      if (document.visibilityState !== "visible") return;
      if (boundaryMapRef.current) {
        setIsCorePointMode(boundaryMapRef.current.isCorePointMode());
      }
    };

    syncCorePointMode();
    const interval = setInterval(syncCorePointMode, 500);
    return () => clearInterval(interval);
  }, [config.features.corePoints]);

  useEffect(() => {
    if (entityType === ResourceType.JOB && entityDataState.id) {
      getJobActiveInvoicesMutation
        .mutateAsync({ id: entityDataState.id })
        .then((res) => {
          setEntityInvoice(
            getActiveUnpaidJobInvoice(res as JobActiveInvoice[])
          );
        })
        .catch(() => {
          setEntityInvoice(null);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, entityDataState.id]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleCheck = useCallback((idx: number) => {
    setCheckedFiles((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  }, []);

  const handleStatusChange = useCallback(
    async (statusId: number): Promise<void> => {
      const updateData: { job_status: number } | { lead_status: number } =
        entityType === ResourceType.JOB
          ? { job_status: statusId }
          : { lead_status: statusId };

      try {
        if (entityType === ResourceType.JOB) {
          await patchHook.mutateAsync({
            id: entityDataState.id!,
            updatedJob: updateData as JobUpdatePayload,
          });
        } else {
          await patchHook.mutateAsync({
            id: entityDataState.id!,
            data: updateData as LeadUpdatePayload,
          });
        }

        let response;
        if (entityType === ResourceType.JOB) {
          response = await axiosInstance.get(
            `ms/organizations/${orgId}/jobs/${config.jobType}/${entityDataState.id}/`
          );
        } else {
          response = await axiosInstance.get(
            `ms/organizations/${orgId}/leads/${config.jobType}/${entityDataState.id}/`
          );
        }

        setEntityDataState(response.data as EntityDataState);

        await queryClient.invalidateQueries({
          queryKey: entityType === ResourceType.JOB ? ["allJobs"] : ["leads"],
        });
        if (entityType === ResourceType.JOB) {
          await queryClient.invalidateQueries({ queryKey: ["completedJob"] });
        }
      } catch (error) {
        console.error("Error updating status:", error);
        toast.error("Failed to update status");
      }
    },
    [entityType, entityDataState, patchHook, orgId, config.jobType, queryClient]
  );

  const reportUploadFileProgress = useCallback((progress: number) => {
    setUploadFileProgress(progress);
  }, []);

  const handleUploadFile = useCallback(
    async ({ fileName, description, file }: UploadFileParams) => {
      if (!file || (Array.isArray(file) && file.length === 0)) return;
      setUploading(true);
      setUploadFileProgress(0);
      try {
        const mapFileType = mapFileTypeFromUploadTitle(fileName);

        if (mapFileType && supportsTilingStyleMapUploads) {
          const filesToUpload = toUploadFileArray(file);

          for (const uploadFile of filesToUpload) {
            const lowerName = uploadFile.name.toLowerCase();

            if (mapFileType === "kml") {
              const validationResult = await validateKmlFile(uploadFile);
              if (!validationResult.isValid) {
                toast.error(
                  `${uploadFile.name}: ${validationResult.error || "Invalid KML file."}`
                );
                setUploadFileProgress(null);
                setUploading(false);
                return;
              }
            } else if (mapFileType === "xml" && !lowerName.endsWith(".xml")) {
              toast.error(`${uploadFile.name}: Please select a .xml file.`);
              setUploadFileProgress(null);
              setUploading(false);
              return;
            } else if (mapFileType === "shp" && !lowerName.endsWith(".shp")) {
              toast.error(`${uploadFile.name}: Please select a .shp file.`);
              setUploadFileProgress(null);
              setUploading(false);
              return;
            }
          }

          const typeParams =
            entityType === ResourceType.LEAD
              ? { leadType: jobTypeToLeadType(config.jobType) }
              : { jobType: config.jobType };

          const mutationResponse = await uploadMapFiles.mutateAsync({
            entityType,
            id: entityDataState.id!,
            fileType: mapFileType,
            files: filesToUpload,
            onProgress: reportUploadFileProgress,
            ...typeParams,
          });

          const anySucceeded = showMapUploadResults(mutationResponse);
          const hadMapUploadResults =
            !!mutationResponse &&
            typeof mutationResponse === "object" &&
            "map_upload_results" in
              (mutationResponse as unknown as Record<string, unknown>);

          const leadType = jobTypeToLeadType(config.jobType);
          const entityUrl =
            entityType === ResourceType.JOB
              ? `ms/organizations/${orgId}/jobs/${config.jobType}/${entityDataState.id}/`
              : `ms/organizations/${orgId}/leads/${leadType}/${entityDataState.id}/`;
          const entityResponse = await axiosInstance.get(entityUrl);
          if (entityResponse?.data) {
            setEntityDataState((prev) =>
              mergeEntityDataState(prev, entityResponse.data)
            );
          }

          if (!hadMapUploadResults || anySucceeded) {
            const label = getMapFileTypeLabel(mapFileType);
            toast.success(
              filesToUpload.length > 1
                ? `${label} files uploaded successfully`
                : `${label} file uploaded successfully`
            );
          }
        } else if (
          config.jobType === JobType.TILING &&
          (fileName === "design_file" || fileName === "delivered_file")
        ) {
          const singleFile = Array.isArray(file) ? file[0] : file;
          const existingFile = files.find(
            (f: JobFileItem) =>
              f.title?.toLowerCase() === fileName.toLowerCase()
          );

          if (existingFile && existingFile.id) {
            await filesHook.deleteFile.mutateAsync(existingFile.id);
          }

          await filesHook.postFile.mutateAsync({
            file: singleFile,
            title: fileName,
            description: description ?? "",
            onProgress: reportUploadFileProgress,
          });

          toast.success(
            `${fileName === "design_file" ? "Design" : "Delivered"} file uploaded successfully`
          );
        }
        // Handle regular files
        else {
          const singleFile = Array.isArray(file) ? file[0] : file;
          await filesHook.postFile.mutateAsync({
            file: singleFile,
            title: fileName,
            description: description ?? "",
            onProgress: reportUploadFileProgress,
          });

          toast.success("File uploaded successfully");
        }

        setShowUploadFile(false);
        setSelectedFileName("");
        setPendingUploadFile(null);
      } catch (error) {
        console.error("Error uploading file:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to upload file";
        toast.error(errorMessage);
      } finally {
        setUploading(false);
        setUploadFileProgress(null);
      }
    },
    [
      entityDataState,
      entityType,
      config.jobType,
      supportsTilingStyleMapUploads,
      uploadMapFiles,
      reportUploadFileProgress,
      filesHook,
      files,
      orgId,
    ]
  );

  const handleInlineFileSelect = useCallback((file: File) => {
    setPendingUploadFile(file);
    setSelectedFileType("contractor");
    setSelectedFileName("");
    setIsFixedTitle(false);
    setShowUploadFile(true);
  }, []);

  const handleCustomerPatch = useCallback(
    async (field: string, value: HandleCustomerPatchValue) => {
      const updateData: Record<string, unknown> = {};

      if (field === "all") {
        const changes = value as Record<string, unknown>;
        if ("name" in changes) updateData.title = changes.name;
        if ("description" in changes)
          updateData.description = changes.description;
        if ("phone" in changes)
          updateData.customer_phone_number = changes.phone;
        if ("designers" in changes) updateData.designers = changes.designers;
        if ("operator" in changes) updateData.operator = changes.operator;
        if ("acers" in changes) updateData.acers = changes.acers;
        if ("job_lead_acre" in changes)
          updateData.job_lead_acre = changes.job_lead_acre;
        if ("job_footage" in changes)
          updateData.job_footage = changes.job_footage;
        if ("raisers_installed" in changes)
          updateData.raisers_installed = changes.raisers_installed;
      } else {
        if (field === "name") updateData.title = value;
        if (field === "description") updateData.description = value;
        if (field === "phone") updateData.customer_phone_number = value;
        if (field === "designers") updateData.designers = value;
        if (field === "operator")
          updateData.operator =
            value === null || value === undefined || value === ""
              ? null
              : (value as number);
        if (field === "acers") updateData.acers = value;
        if (field === "job_lead_acre") updateData.job_lead_acre = value;
        if (field === "job_footage") updateData.job_footage = value;
        if (field === "raisers_installed") updateData.raisers_installed = value;
      }

      if (entityType === ResourceType.JOB) {
        await patchHook.mutateAsync({
          id: entityDataState.id!,
          updatedJob: updateData as JobUpdatePayload,
        });
      } else {
        await patchHook.mutateAsync({
          id: entityDataState.id!,
          data: updateData as LeadUpdatePayload,
        });
      }
      setEntityDataState((prev) => mergeEntityDataState(prev, updateData));

      if (
        entityType === ResourceType.JOB &&
        config.jobType === JobType.TILING &&
        field === "designers" &&
        assignedTo != null &&
        assignedTo !== "all" &&
        orgId
      ) {
        const currentMemberId = resolveFilteredMemberId(assignedTo, memberId);

        const designers = updateData.designers;
        const nextDesignerIds = Array.isArray(designers)
          ? designers
              .map((designer) =>
                typeof designer === "number"
                  ? designer
                  : typeof designer === "object" &&
                      designer !== null &&
                      "id" in designer &&
                      typeof designer.id === "number"
                    ? designer.id
                    : undefined
              )
              .filter((id): id is number => id != null)
          : [];

        const {
          stillAssignedAsDesigner,
          stillAssignedViaIndividual,
          stillAssignedViaGroupMembership,
        } = await evaluateJobAssignmentState({
          orgId,
          jobId: entityDataState.id!,
          memberId: currentMemberId,
          designers: nextDesignerIds,
        });

        const shouldRedirect =
          !stillAssignedAsDesigner &&
          !stillAssignedViaIndividual &&
          !stillAssignedViaGroupMembership;

        if (shouldRedirect) {
          router.push(orgPath(orgId, `/jobs/drainage-tiling`));
        }
      }
    },
    [
      entityType,
      config.jobType,
      assignedTo,
      memberId,
      orgId,
      entityDataState?.id,
      patchHook,
      router,
      resolveFilteredMemberId,
      evaluateJobAssignmentState,
    ]
  );

  const recordJobType = useMemo(
    () => mapJobTypeToRecordJobType(config.jobType),
    [config.jobType]
  );

  const primaryContactId = useMemo(() => {
    const fromList = entityDataState.contacts?.find((c) => c.is_primary)?.id;
    return fromList ?? entityDataState.contact_info?.id;
  }, [entityDataState.contacts, entityDataState.contact_info?.id]);

  const primaryFarmId = useMemo(() => {
    const fromList = entityDataState.farms?.find((f) => f.is_primary)?.id;
    return fromList ?? entityDataState.farm_info?.id;
  }, [entityDataState.farms, entityDataState.farm_info?.id]);

  const refreshEntityDetail = useCallback(async () => {
    if (!entityDataState.id || !orgId) return;
    const entityResponse =
      entityType === "job"
        ? await axiosInstance.get(
            `ms/organizations/${orgId}/jobs/${config.jobType}/${entityDataState.id}/`
          )
        : await axiosInstance.get(
            `ms/organizations/${orgId}/leads/${config.jobType}/${entityDataState.id}/`
          );
    setEntityDataState(entityResponse.data as EntityDataState);
  }, [entityType, entityDataState.id, orgId, config.jobType]);

  const [stakeholderSavePending, setStakeholderSavePending] = useState(false);

  const handleContactsSave = useCallback(
    async (contactIds: number[], primaryContactId: number | null) => {
      if (!entityDataState.id || contactIds.length === 0) return;
      setStakeholderSavePending(true);
      try {
        const payload = buildStakeholderPayload({
          contactIds,
          primaryContactId,
        });

        if (entityType === ResourceType.JOB) {
          await patchHook.mutateAsync({
            id: entityDataState.id,
            updatedJob: payload,
          });
        } else {
          await patchHook.mutateAsync({
            id: entityDataState.id,
            data: payload,
          });
        }
        await refreshEntityDetail();
        closeModalKey("assign-contact");
        toast.success("Contacts updated");
      } catch (error: unknown) {
        console.error("Error updating contacts:", error);
        toast.error(getErrorMessage(error, "Failed to update contacts"));
      } finally {
        setStakeholderSavePending(false);
      }
    },
    [
      entityDataState.id,
      entityType,
      patchHook,
      refreshEntityDetail,
      closeModalKey,
    ]
  );

  const handleFarmsSave = useCallback(
    async (farmIds: number[], primaryFarmId: number | null) => {
      if (!entityDataState.id) return;
      setStakeholderSavePending(true);
      try {
        const payload = buildStakeholderPayload({
          farmIds,
          primaryFarmId,
        });

        if (entityType === "job") {
          await patchHook.mutateAsync({
            id: entityDataState.id,
            updatedJob: payload,
          });
        } else {
          await patchHook.mutateAsync({
            id: entityDataState.id,
            data: payload,
          });
        }
        await refreshEntityDetail();
        closeModalKey("assign-farm");
        toast.success("Farms updated");
      } catch (error: unknown) {
        console.error("Error updating farms:", error);
        toast.error(getErrorMessage(error, "Failed to update farms"));
      } finally {
        setStakeholderSavePending(false);
      }
    },
    [
      entityDataState.id,
      entityType,
      patchHook,
      refreshEntityDetail,
      closeModalKey,
    ]
  );

  const handleCreateNewFarm = useCallback(() => {
    if (contactId && orgId) {
      router.push(`${orgUrl(orgId, `/contact/${contactId}`, `action=add`)}`);
    }
  }, [contactId, router, orgId]);

  const handleOpenSite = useCallback(
    (site: OneCallSite) => {
      if (
        site.website &&
        !site.website.includes("I couldn't find the website")
      ) {
        window.open(site.website, "_blank");
        dialogManager.closeDialog();
      } else {
        setOneCallError(
          "Website not available for this state. Please contact the admin."
        );
      }
    },
    [dialogManager]
  );

  const openSitesPopUp = useCallback(
    (config?: { sites?: OneCallSite[]; error?: string | null }) => {
      dialogManager.openDialog({
        type: "sites",
        component: SitesPopUp as unknown as ComponentType<
          Record<string, unknown>
        >,
        props: {
          sites: config?.sites ?? sites,
          error: config?.error ?? oneCallError,
          handleOpenSite,
          setSitePopUp: () => dialogManager.closeDialog(),
        },
      });
    },
    [dialogManager, sites, oneCallError, handleOpenSite]
  );

  const handleOneCallPatch = useCallback(
    async (oneCallStatus: boolean) => {
      if (
        !entityDataState.farm_info?.latitude ||
        !entityDataState.farm_info?.longitude
      ) {
        setOneCallError("Select Location first");
        openSitesPopUp({ error: "Select Location first" });
        return;
      }

      try {
        if (entityType === ResourceType.JOB) {
          await patchHook.mutateAsync({
            id: entityDataState.id!,
            updatedJob: { one_call: oneCallStatus },
          });
        } else {
          await patchHook.mutateAsync({
            id: entityDataState.id!,
            data: {
              one_call: oneCallStatus ? "true" : "false",
            } as LeadUpdatePayload,
          });
        }

        const entityResponse =
          entityType === ResourceType.JOB
            ? await axiosInstance.get(
                `ms/organizations/${orgId}/jobs/${config.jobType}/${entityDataState.id}/`
              )
            : await axiosInstance.get(
                `ms/organizations/${orgId}/leads/${config.jobType}/${entityDataState.id}/`
              );

        if (entityResponse.data) {
          setEntityDataState(entityResponse.data as EntityDataState);
        } else {
          setEntityDataState((prev: EntityDataState) => ({
            ...prev,
            one_call: oneCallStatus,
          }));
        }

        if (oneCallStatus) {
          const sitesData = await getStateSites.mutateAsync({
            jobId: entityDataState.id!,
          });

          if (sitesData) {
            setOneCallError(null);
            const sitesArray = normalizeOneCallSites(sitesData);
            setSites(sitesArray);
            openSitesPopUp({ sites: sitesArray, error: null });
          } else {
            setOneCallError("No sites found for this location");
          }
        }
      } catch (error) {
        console.error("Error updating one call status:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to update one call status";
        setOneCallError(errorMessage);
        toast.error(errorMessage);
      }
    },
    [
      entityDataState,
      entityType,
      patchHook,
      orgId,
      config.jobType,
      getStateSites,
      openSitesPopUp,
    ]
  );

  const handleToggleOneCall = useCallback(() => {
    const isDisabling =
      entityDataState.one_call === true || entityDataState.one_call === "true";
    const hasDate = !!entityDataState.one_call_date;
    if (isDisabling && hasDate) {
      dialogManager.openConfirmationDialog({
        title: "Disable One Call?",
        description:
          "Disabling One Call will remove the recorded date. Are you sure you want to disable it?",
        confirmButtonText: "Disable",
        variant: "destructive",
        onConfirm: async () => {
          await handleOneCallPatch(false);
        },
      });
      return;
    }
    handleOneCallPatch(!isDisabling);
  }, [entityDataState, dialogManager, handleOneCallPatch]);

  const handleMapEditCancel = useCallback(() => {
    setEditingMap(false);
    setTempVertices(transformVertices(entityDataState?.farm_info?.vertices));
    setTempLocation(getInitialLocation(entityDataState?.farm_info) ?? null);
  }, [entityDataState]);

  const handleMapEditSave = useCallback(async () => {
    try {
      const mapUpdate = {
        farm_info: {
          ...(entityDataState.farm_info ?? {}),
          vertices: transformVerticesToBackend(tempVertices),
          latitude: tempLocation?.lat?.toString(),
          longitude: tempLocation?.lng?.toString(),
        },
      };

      if (entityType === ResourceType.JOB) {
        await patchHook.mutateAsync({
          id: entityDataState.id!,
          updatedJob: mapUpdate as JobUpdatePayload,
        });
      } else {
        await patchHook.mutateAsync({
          id: entityDataState.id!,
          data: mapUpdate as LeadUpdatePayload,
        });
      }

      const entityResponse =
        entityType === ResourceType.JOB
          ? await axiosInstance.get(
              `ms/organizations/${orgId}/jobs/${config.jobType}/${entityDataState.id}/`
            )
          : await axiosInstance.get(
              `ms/organizations/${orgId}/leads/${config.jobType}/${entityDataState.id}/`
            );

      setEntityDataState((prev) =>
        mergeEntityDataState(prev, entityResponse.data)
      );
      setEditingMap(false);

      // Fetch sites after map edit
      try {
        const sitesData = await getStateSites.mutateAsync({
          jobId: entityDataState.id!,
        });

        if (sitesData) {
          setSites(normalizeOneCallSites(sitesData));
        }
      } catch (error) {
        console.error("Error fetching sites after map edit:", error);
        setOneCallError("Failed to fetch sites after map edit");
      }
    } catch (error: unknown) {
      console.error("Error updating map:", error);
      toast.error(
        getErrorMessage(error, "Failed to update map boundaries and location")
      );
    }
  }, [
    entityDataState,
    tempVertices,
    tempLocation,
    entityType,
    patchHook,
    orgId,
    config.jobType,
    getStateSites,
  ]);

  const handleFileDelete = useCallback(
    (id: string | number, title: string) => {
      dialogManager.openConfirmationDialog({
        title: "Delete File",
        confirmationType: "delete",
        itemTitle: title,
        variant: "destructive",
        confirmButtonText: "Delete",
        onConfirm: async () => {
          try {
            const mapId = Number(id);
            const entityId = entityDataState.id!;
            const leadType = jobTypeToLeadType(config.jobType);
            const typeParams =
              entityType === ResourceType.LEAD
                ? { leadType }
                : { jobType: config.jobType };

            const mapFileType = mapFileTypeFromUploadTitle(title);

            if (mapFileType && supportsTilingStyleMapUploads) {
              const deletedViaV2 = entityHasMapFileInV2(
                entityDataState,
                mapFileType,
                mapId
              );
              const hasLegacyMap =
                mapFileType === "xml"
                  ? !!entityDataState.xmlmap
                  : mapFileType === "shp"
                    ? !!entityDataState.shpmap
                    : !!entityDataState.kmlmap;

              if (deletedViaV2 || hasLegacyMap) {
                await deleteMapFile.mutateAsync({
                  entityType,
                  id: entityId,
                  fileType: mapFileType,
                  ...(deletedViaV2 ? { mapId } : {}),
                  ...typeParams,
                });
                setEntityDataState((prev: EntityDataState) =>
                  removeMapFileFromEntityState(
                    prev,
                    mapFileType,
                    mapId,
                    deletedViaV2
                  )
                );
                toast.success(getMapFileDeleteSuccessMessage(mapFileType));
              }
            } else {
              // Regular file deletion
              await filesHook.deleteFile.mutateAsync(id);
              toast.success("File deleted successfully");
            }
          } catch (error) {
            console.error("Error deleting file:", error);
            toast.error("Failed to delete file");
            throw error; // Re-throw to keep dialog open on error
          }
        },
      });
    },
    [
      dialogManager,
      entityDataState,
      entityType,
      config.jobType,
      supportsTilingStyleMapUploads,
      deleteMapFile,
      filesHook,
    ]
  );

  const handleDeleteEntity = useCallback(() => {
    const contactName = entityDataState?.contact_info?.full_name?.trim();
    const entityName =
      contactName ||
      entityDataState?.title ||
      entityDataState?.po_number ||
      `this ${entityType}`;
    const isTrash = !props.isTrashed && !props.completedJob && !props.cancelled;

    dialogManager.openConfirmationDialog({
      title: `${isTrash ? "Trash" : "Delete"} ${entityType === ResourceType.JOB ? "Job" : "Lead"}`,
      confirmationType: "delete",
      itemTitle: entityName,
      trash: isTrash,
      variant: "destructive",
      confirmButtonText: isTrash ? "Move to Trash" : "Delete",
      onConfirm: async () => {
        try {
          const willRedirect = isTrash && entityType === ResourceType.JOB;

          if (entityType === ResourceType.JOB) {
            if (willRedirect) {
              await deleteHook.mutateAsync({
                id: parseEntityId(entityDataState.id),
              });
            } else if (props.onDeleteJob) {
              await props.onDeleteJob(entityDataState);
            } else if (props.onDelete) {
              if (typeof props.onDelete === "function") {
                try {
                  await props.onDelete({
                    model: config.stateDataKey,
                    id: entityDataState.id!,
                  });
                } catch {
                  await props.onDelete?.({
                    model: config.stateDataKey,
                    id: entityDataState.id!,
                  });
                }
              }
            } else {
              await deleteHook.mutateAsync({
                id: parseEntityId(entityDataState.id),
              });
            }
          } else {
            if (props.onDelete) {
              await props.onDelete();
            } else {
              await deleteHook.mutateAsync({
                id: parseEntityId(entityDataState.id),
              });
            }
          }

          toast.success(
            `${entityType === ResourceType.JOB ? "Job" : "Lead"} ${isTrash ? "trashed" : "deleted"} successfully`
          );

          if (isTrash && entityType === ResourceType.JOB) {
            if (config.jobType === JobType.EXCAVATION) {
              router.push(orgPath(orgId, `/jobs/excavation`));
              return;
            } else if (config.jobType === JobType.REPAIR) {
              router.push(orgPath(orgId, `/jobs/repair`));
              return;
            } else if (config.jobType === JobType.TILING) {
              router.push(orgPath(orgId, `/jobs/drainage-tiling`));
              return;
            }
          }

          props.onClose();
        } catch (error: unknown) {
          console.error(`Failed to delete ${entityType}:`, error);
          toast.error(getErrorMessage(error, `Failed to delete ${entityType}`));
          throw error;
        }
      },
    });
  }, [
    dialogManager,
    entityType,
    entityDataState,
    props,
    deleteHook,
    config.stateDataKey,
    config.jobType,
    router,
    orgId,
  ]);

  const handleArchive = useCallback(async () => {
    if (props.onArchive) {
      await props.onArchive({
        model: config.stateDataKey,
        id: entityDataState.id!,
      });
    } else if (entityType === ResourceType.JOB && props.onArchiveJob) {
      await props.onArchiveJob(entityDataState);
    } else if (entityType === ResourceType.LEAD && props.onArchiveLead) {
      await props.onArchiveLead();
    }
  }, [props, config.stateDataKey, entityDataState, entityType]);

  const handleCorePointSubmit = useCallback(
    async (corePoint: {
      id?: number;
      name?: string;
      description?: string;
      latitude: number;
      longitude: number;
    }) => {
      if (!config.features.corePoints) return;

      try {
        if (corePoint.id) {
          if (entityType === ResourceType.LEAD) {
            await updateCorePointLead.mutateAsync({
              leadId: entityDataState.id!,
              coreId: corePoint.id,
              data: {
                ...(corePoint.name != null ? { name: corePoint.name } : {}),
                description: corePoint.description,
                latitude: corePoint.latitude,
                longitude: corePoint.longitude,
              },
            });
          } else {
            await updateCorePointJob.mutateAsync({
              jobId: entityDataState.id!,
              coreId: corePoint.id,
              data: {
                ...(corePoint.name != null ? { name: corePoint.name } : {}),
                description: corePoint.description,
                latitude: corePoint.latitude,
                longitude: corePoint.longitude,
              },
            });
          }
        } else {
          if (entityType === ResourceType.LEAD) {
            await createCorePointLead.mutateAsync({
              leadId: entityDataState.id!,
              data: {
                description: corePoint.description,
                latitude: corePoint.latitude,
                longitude: corePoint.longitude,
              },
            });
          } else {
            await createCorePointJob.mutateAsync({
              jobId: entityDataState.id!,
              data: {
                description: corePoint.description,
                latitude: corePoint.latitude,
                longitude: corePoint.longitude,
              },
            });
          }
        }
      } catch (error: unknown) {
        console.error("Error saving core point:", error);
        toast.error(getErrorMessage(error, "Failed to save core point"));
      }
    },
    [
      config.features.corePoints,
      entityType,
      entityDataState,
      updateCorePointLead,
      updateCorePointJob,
      createCorePointLead,
      createCorePointJob,
    ]
  );

  const handleCorePointDelete = useCallback(
    async (coreId: number) => {
      if (!config.features.corePoints) return;

      try {
        if (entityType === ResourceType.LEAD) {
          await deleteCorePointLead.mutateAsync({
            leadId: entityDataState.id!,
            coreId,
          });
        } else {
          await deleteCorePointJob.mutateAsync({
            jobId: entityDataState.id!,
            coreId,
          });
        }
        // Success toast is shown by the mutation's onSuccess in useLeads/useJobs
      } catch (error: unknown) {
        console.error("Error deleting core point:", error);
        // Error toast is shown by the mutation's onError
        throw error;
      }
    },
    [
      config.features.corePoints,
      entityType,
      entityDataState,
      deleteCorePointLead,
      deleteCorePointJob,
    ]
  );

  const handleTogglePinMode = useCallback(() => {
    const next = !isPinMode;
    if (next) {
      boundaryMapRef.current?.cancelCorePointMode();
    }
    setIsPinMode(next);
  }, [isPinMode, setIsPinMode]);

  const handleStartCorePointMode = useCallback(() => {
    setIsPinMode(false);
    boundaryMapRef.current?.startCorePointMode();
  }, []);

  const handlePinCreate = useCallback(
    async ({
      categoryId,
      lat,
      lng,
      label,
    }: {
      categoryId: number;
      lat: number;
      lng: number;
      label?: string;
    }) => {
      if (!config.features.mapPins) return;
      try {
        const payload = {
          latitude: lat,
          longitude: lng,
          category_id: categoryId,
          ...(label ? { label } : {}),
        };
        if (entityType === ResourceType.LEAD) {
          await createLeadPin.mutateAsync({
            id: entityDataState.id!,
            data: payload,
          });
        } else {
          await createJobPin.mutateAsync({
            id: entityDataState.id!,
            data: payload,
          });
        }
        setIsPinMode(false);
        toast.success("Pin added");
      } catch {
        // Error toast shown by mutation
      }
    },
    [
      config.features.mapPins,
      entityType,
      entityDataState.id,
      createLeadPin,
      createJobPin,
    ]
  );

  const handlePinAdd = useCallback(async () => {
    if (!config.features.mapPins) return;
    toast.error("Use Add Pin to choose a category");
  }, [config.features.mapPins]);

  const handlePinDelete = useCallback(
    async (pinId: number) => {
      if (!config.features.mapPins) return;
      try {
        if (entityType === ResourceType.LEAD) {
          await deleteLeadPin.mutateAsync({
            id: entityDataState.id!,
            pinId,
          });
        } else {
          await deleteJobPin.mutateAsync({
            id: entityDataState.id!,
            pinId,
          });
        }
        toast.success("Pin deleted");
      } catch {
        // Error toast shown by mutation's onError
      }
    },
    [
      config.features.mapPins,
      entityType,
      entityDataState.id,
      deleteLeadPin,
      deleteJobPin,
    ]
  );

  const handleOrderPipes = useCallback(async () => {
    if (entityType !== ResourceType.JOB || config.jobType !== JobType.TILING)
      return;

    try {
      const { data: forms } = await refetchVendorFormsV2();
      const activeForms = forms?.filter(
        (form: VendorFormV2) =>
          form.order_status &&
          form.order_status !== "Delivered" &&
          form.order_status !== "Cancelled"
      );

      if (activeForms && activeForms.length > 0) {
        const mostRecentForm = activeForms.reduce(
          (latest: VendorFormV2, current: VendorFormV2) =>
            current.id > latest.id ? current : latest
        );
        if (orgId)
          router.push(orgPath(orgId, `/order-pipe/${mostRecentForm.id}`));
        return;
      }

      if (entityDataState.vendor_page) {
        if (orgId)
          router.push(orgPath(orgId, `/order-pipe?id=${entityDataState.id}`));
        return;
      }
    } catch (error) {
      console.error("Error checking existing vendor forms:", error);
    }

    if (entityDataState.can_create_order_pipe) {
      dialogManager.openConfirmationDialog({
        title: "Create Pipe Order",
        description: "Are you sure you want to create a pipe order?",
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        onConfirm: async () => {
          try {
            const newForm = await createVendorFormV2.mutateAsync({
              job: Number(entityDataState.id),
            });
            await refetchVendorFormsV2();
            toast.success("Pipe order created successfully");
            if (orgId) router.push(orgPath(orgId, `/order-pipe/${newForm.id}`));
          } catch (error: unknown) {
            console.error("Error ordering pipes:", error);
            toast.error(getErrorMessage(error, "Failed to create pipe order"));
            throw error;
          }
        },
      });
    } else {
      toast.info(
        "No existing pipe orders found. Contact administrator to create a new order."
      );
    }
  }, [
    entityType,
    config.jobType,
    dialogManager,
    entityDataState?.id,
    entityDataState?.can_create_order_pipe,
    entityDataState?.vendor_page,
    createVendorFormV2,
    refetchVendorFormsV2,
    router,
    orgId,
  ]);

  const handleInvoiceClick = useCallback(async () => {
    if (entityType !== ResourceType.JOB) return;
    setInvoiceCheckLoading(true);
    try {
      const res = await getJobActiveInvoicesMutation.mutateAsync({
        id: entityDataState.id!,
      });
      const activeInvoice = getActiveUnpaidJobInvoice(
        res as JobActiveInvoice[]
      );
      setEntityInvoice(activeInvoice);
      if (!activeInvoice) {
        dialogManager.openConfirmationDialog({
          title: "Create Invoice",
          description: "Are you sure you want to create an invoice?",
          confirmButtonText: "Yes",
          cancelButtonText: "No",
          onConfirm: async () => {
            try {
              const jobTypeForInvoice: JobType = config.jobType as JobType;
              const data = await createInvoiceForJob.mutateAsync({
                id: entityDataState.id!,
                jobType: jobTypeForInvoice,
              });

              if (data?.new_invoice?.id && orgId) {
                router.push(
                  orgPath(orgId, `/book-keeping?id=${data.new_invoice.id}`)
                );
              } else if (data?.invoice?.id && orgId) {
                router.push(
                  orgPath(orgId, `/book-keeping?id=${data.invoice.id}`)
                );
              }
            } catch (error) {
              console.error("Error creating invoice:", error);
              toast.error("Failed to create invoice");
              throw error;
            }
          },
        });
      } else if (orgId && activeInvoice.id != null) {
        router.push(orgPath(orgId, `/book-keeping?id=${activeInvoice.id}`));
      }
    } catch (error) {
      console.error("Error fetching invoice:", error);
      toast.error("Failed to fetch invoice");
    } finally {
      setInvoiceCheckLoading(false);
    }
  }, [
    entityType,
    entityDataState,
    getJobActiveInvoicesMutation,
    dialogManager,
    config.jobType,
    createInvoiceForJob,
    router,
    orgId,
  ]);

  const handleToggleInvoiceStatus = useCallback(
    async (field: "checked_by_admin" | "sent_to_client" | "paid") => {
      if (!entityInvoice || entityInvoice.id == null) return;
      try {
        const prevVal = entityInvoice[field] as boolean | undefined;
        await patchInvoice.mutateAsync({
          id: String(entityInvoice.id),
          updatedInvoice: { [field]: !prevVal },
        });
        setEntityInvoice((prev: JobActiveInvoice | null) => {
          if (!prev) return prev;
          const updated = { ...prev, [field]: !prev[field] };
          if (field === "paid" && updated.paid) {
            return null;
          }
          return updated;
        });
        toast.success(`Invoice status updated`);
      } catch (err: unknown) {
        toast.error(getErrorMessage(err, "Failed to update invoice status"));
      }
    },
    [entityInvoice, patchInvoice]
  );

  const handleToggleEstimateSent = useCallback(async () => {
    try {
      const updatedEstimateSent = !entityDataState.estimate_sent;
      if (entityType === ResourceType.JOB) {
        await patchHook.mutateAsync({
          id: entityDataState.id!,
          updatedJob: {
            estimate_sent: updatedEstimateSent,
          } as JobUpdatePayload,
        });
      } else {
        await patchHook.mutateAsync({
          id: entityDataState.id!,
          data: { estimate_sent: updatedEstimateSent } as LeadUpdatePayload,
        });
      }
      setEntityDataState((prev: EntityDataState) => ({
        ...prev,
        estimate_sent: !prev.estimate_sent,
      }));
      toast.success(
        updatedEstimateSent ? "Estimate sent marked" : "Estimate sent unmarked"
      );
    } catch (error: unknown) {
      console.error("Error toggling estimate sent:", error);
      toast.error(
        getErrorMessage(error, "Failed to update estimate sent status")
      );
    }
  }, [
    entityType,
    entityDataState?.id,
    entityDataState?.estimate_sent,
    patchHook,
  ]);

  const handleToggleContractSent = useCallback(async () => {
    try {
      const updatedContractSent = !entityDataState.contract_sent;
      if (entityType === ResourceType.JOB) {
        await patchHook.mutateAsync({
          id: entityDataState.id!,
          updatedJob: {
            contract_sent: updatedContractSent,
          } as JobUpdatePayload,
        });
      } else {
        await patchHook.mutateAsync({
          id: entityDataState.id!,
          data: { contract_sent: updatedContractSent } as LeadUpdatePayload,
        });
      }
      setEntityDataState((prev: EntityDataState) => ({
        ...prev,
        contract_sent: !prev.contract_sent,
      }));
      toast.success(
        updatedContractSent ? "Contract sent marked" : "Contract sent unmarked"
      );
    } catch (error: unknown) {
      console.error("Error toggling contract sent:", error);
      toast.error(
        getErrorMessage(error, "Failed to update contract sent status")
      );
    }
  }, [
    entityType,
    entityDataState?.id,
    entityDataState?.contract_sent,
    patchHook,
  ]);

  const handleMaterialStatusChange = useCallback(
    async (status: string) => {
      try {
        if (entityType === ResourceType.JOB) {
          await patchHook.mutateAsync({
            id: entityDataState.id!,
            updatedJob: { material_status: status } as JobUpdatePayload,
          });
        } else {
          await patchHook.mutateAsync({
            id: entityDataState.id!,
            data: { material_status: status } as LeadUpdatePayload,
          });
        }
        setEntityDataState((prev: EntityDataState) => ({
          ...prev,
          material_status: status,
        }));
      } catch (error: unknown) {
        console.error("Error updating material status:", error);
        toast.error(getErrorMessage(error, "Failed to update material status"));
      }
    },
    [entityType, entityDataState?.id, patchHook]
  );

  const handleProjectTypeChange = useCallback(
    async (projectTypeId: number | null): Promise<void> => {
      try {
        const payload = { project_type: projectTypeId };

        if (entityType === ResourceType.JOB) {
          await patchHook.mutateAsync({
            id: entityDataState.id!,
            updatedJob: payload as JobUpdatePayload,
          });
          queryClient.invalidateQueries({
            queryKey: ["crew", "job_team_list"],
          });
        } else {
          await patchHook.mutateAsync({
            id: entityDataState.id!,
            data: payload as LeadUpdatePayload,
          });
        }

        setEntityDataState((prev) => ({
          ...prev,
          project_type:
            projectTypeId != null
              ? (projectTypes.find((pt) => pt.id === projectTypeId) ??
                prev.project_type ??
                null)
              : null,
        }));
      } catch (error: unknown) {
        console.error("Error updating project type:", error);
        toast.error(getErrorMessage(error, "Failed to update project type"));
      }
    },
    [entityType, entityDataState?.id, patchHook, projectTypes, queryClient]
  );

  // ============================================
  // DIALOG HELPERS
  // ============================================
  // ---------------------------------------------------------------------------
  // URL-driven modal stack (Pattern B). The dialogs below are mounted in
  // ShowMoreCard (index.tsx); here we only expose triggers, open flags, and the
  // prop bundles (built from this hook's internal state/closures).
  // ---------------------------------------------------------------------------
  const RESHARE_MODAL_KEY = "reshare-files";
  const CONVERT_MODAL_KEY = "convert-to-job";
  const CONTACT_MODAL_KEY = "assign-contact";
  const FARM_MODAL_KEY = "assign-farm";

  const isReshareDialogOpen = modalStack.some((f) => f.key === RESHARE_MODAL_KEY);
  const isConvertDialogOpen = modalStack.some((f) => f.key === CONVERT_MODAL_KEY);
  const isContactAssignmentDialogOpen = modalStack.some(
    (f) => f.key === CONTACT_MODAL_KEY
  );
  const isFarmAssignmentDialogOpen = modalStack.some(
    (f) => f.key === FARM_MODAL_KEY
  );

  const openReshareDialog = useCallback(() => {
    openModal(RESHARE_MODAL_KEY);
  }, [openModal]);

  const openConvertDialog = useCallback(() => {
    openModal(CONVERT_MODAL_KEY);
  }, [openModal]);

  const openContactAssignmentDialog = useCallback(() => {
    openModal(CONTACT_MODAL_KEY);
  }, [openModal]);

  const openFarmAssignmentDialog = useCallback(() => {
    openModal(FARM_MODAL_KEY);
  }, [openModal]);

  const closeReshareDialog = useCallback(() => {
    closeModalKey(RESHARE_MODAL_KEY);
  }, [closeModalKey]);

  const closeConvertDialog = useCallback(() => {
    closeModalKey(CONVERT_MODAL_KEY);
  }, [closeModalKey]);

  const closeContactAssignmentDialog = useCallback(() => {
    closeModalKey(CONTACT_MODAL_KEY);
  }, [closeModalKey]);

  const closeFarmAssignmentDialog = useCallback(() => {
    closeModalKey(FARM_MODAL_KEY);
  }, [closeModalKey]);

  const reshareDialogProps = useMemo(
    () => ({
      files,
      entityType,
    }),
    [files, entityType]
  );

  const convertDialogProps = useMemo(
    () => ({
      config,
      entityDataState,
      entityData,
      allTeam: allTeam || [],
      allEquipment,
      convertHook: convertHook as ShowMoreCardConvertHookResult,
      canWriteExcavationEquipment,
      onSuccess: props.onClose,
      leadData: props.leadData,
    }),
    [
      config,
      entityDataState,
      entityData,
      allTeam,
      allEquipment,
      convertHook,
      canWriteExcavationEquipment,
      props.onClose,
      props.leadData,
    ]
  );

  const contactAssignmentDialogProps = useMemo(
    () => ({
      entityType: (entityType === ResourceType.JOB ? "job" : "lead") as
        | "job"
        | "lead",
      recordJobType,
      contacts: entityDataState.contacts,
      primaryContactId,
      fallbackContactName: entityDataState.contact_info?.full_name,
      readOnly: !canEditStakeholders,
      onSave: handleContactsSave,
      isSaving: stakeholderSavePending,
    }),
    [
      entityType,
      recordJobType,
      entityDataState.contacts,
      entityDataState.contact_info?.full_name,
      primaryContactId,
      canEditStakeholders,
      handleContactsSave,
      stakeholderSavePending,
    ]
  );

  const farmAssignmentDialogProps = useMemo(
    () => ({
      entityType: (entityType === ResourceType.JOB ? "job" : "lead") as
        | "job"
        | "lead",
      recordJobType,
      contacts: entityDataState.contacts,
      farms: entityDataState.farms,
      primaryFarmId,
      readOnly: !canEditStakeholders,
      onSave: handleFarmsSave,
      isSaving: stakeholderSavePending,
    }),
    [
      entityType,
      recordJobType,
      entityDataState.contacts,
      entityDataState.farms,
      primaryFarmId,
      canEditStakeholders,
      handleFarmsSave,
      stakeholderSavePending,
    ]
  );

  // ============================================
  // RETURN GROUPED VALUES
  // ============================================

  // Memoize return value groups to prevent infinite re-renders
  const dataGroup = useMemo(() => {
    const group = {
      comments,
      files,
      filteredFiles,
      statuses: statusTypes,
      projectTypes,
      corePoints,
      mapPins,
      estimateData,
      allTeam: allTeam || [],
      allEquipment,
      farms,
      farmsLoading,
    };
    return group;
  }, [
    comments,
    files,
    filteredFiles,
    statusTypes,
    projectTypes,
    corePoints,
    mapPins,
    estimateData,
    allTeam,
    allEquipment,
    farms,
    farmsLoading,
  ]);

  const entityGroup = useMemo(() => {
    const group = {
      entityDataState,
      setEntityDataState,
      loading,
      hasExistingVendorFormV2,
      activeOrderPipeStatus,
    };
    return group;
  }, [
    entityDataState,
    loading,
    hasExistingVendorFormV2,
    activeOrderPipeStatus,
  ]);

  const uiGroup = useMemo(
    () => ({
      activeTab,
      setActiveTab,
      visibleTabs,
      showUploadFile,
      setShowUploadFile,
      uploading,
      setUploading,
      uploadFileProgress,
      checkedFiles,
      setCheckedFiles,
      editingMap,
      setEditingMap,
      isCorePointMode,
      setIsCorePointMode,
      isPinMode,
      setIsPinMode,
      selectedFileType,
      setSelectedFileType,
      selectedFileName,
      setSelectedFileName,
      isFixedTitle,
      setIsFixedTitle,
      pendingUploadFile,
      setPendingUploadFile,
      sites,
      setSites,
      oneCallError,
      setOneCallError,
      invoiceCheckLoading,
      setInvoiceCheckLoading,
      entityInvoice,
      setEntityInvoice,
    }),
    [
      activeTab,
      visibleTabs,
      showUploadFile,
      uploading,
      uploadFileProgress,
      checkedFiles,
      editingMap,
      isCorePointMode,
      isPinMode,
      selectedFileType,
      selectedFileName,
      isFixedTitle,
      pendingUploadFile,
      sites,
      oneCallError,
      invoiceCheckLoading,
      entityInvoice,
    ]
  );

  const mapGroup = useMemo(() => {
    const group = {
      boundaryMapRef,
      userLocation,
      organizationLocation,
      locationError,
      triggerBoundaryMapCenter,
      setTriggerBoundaryMapCenter,
      tempVertices,
      tempLocation,
      setTempVertices,
      setTempLocation,
    };
    return group;
  }, [
    userLocation,
    organizationLocation,
    locationError,
    triggerBoundaryMapCenter,
    tempVertices,
    tempLocation,
  ]);

  const permissionsGroup = useMemo(
    () => ({
      canRead,
      canEdit,
      canEditLeadPage,
      canDelete,
      canEditStatus,
      canViewStakeholders,
      canEditStakeholders,
      canEditFarm,
      canEditCorePoints,
      canAccessContact,
      canViewInstalledFootage,
      canViewInstalledRisers,
      canUpdateInstalledFootage,
      canUpdateInstalledRisers,
      canWriteExcavationEquipment,
      canOrderPipe,
      jobPageReadPermissionCode,
      leadPageReadPermissionCode,
      permissionCode,
      requiresPermissionCheck,
    }),
    [
      canRead,
      canEdit,
      canEditLeadPage,
      canDelete,
      canEditStatus,
      canViewStakeholders,
      canEditStakeholders,
      canEditFarm,
      canEditCorePoints,
      canAccessContact,
      canViewInstalledFootage,
      canViewInstalledRisers,
      canUpdateInstalledFootage,
      canUpdateInstalledRisers,
      canWriteExcavationEquipment,
      canOrderPipe,
      jobPageReadPermissionCode,
      leadPageReadPermissionCode,
      permissionCode,
      requiresPermissionCheck,
    ]
  );

  const computedGroup = useMemo(() => {
    const group = {
      isDisabled,
      isFinancialEstimateDisabled,
      isStatusDisabled: isStatusDisabled || false,
      schedulingSectionDisabled,
      commentsReadOnly,
      farmerEntity,
      contactId,
      currentStatus,
      currentProjectType,
      orderPipeButtonText,
    };
    return group;
  }, [
    isDisabled,
    isFinancialEstimateDisabled,
    isStatusDisabled,
    schedulingSectionDisabled,
    commentsReadOnly,
    farmerEntity,
    contactId,
    currentStatus,
    currentProjectType,
    orderPipeButtonText,
  ]);

  const mutationsGroup = useMemo(
    () => ({
      patchHook,
      deleteHook,
      convertHook,
      commentsHook,
      filesHook,
    }),
    [convertHook, commentsHook, filesHook, deleteHook, patchHook]
  );

  const handlersGroup = useMemo(
    () => ({
      handleCustomerPatch,
      handleDeleteEntity,
      handleArchive,
      handleStatusChange,
      handleCreateNewFarm,
      handleFileDelete,
      handleCheck,
      handleUploadFile,
      handleInlineFileSelect,
      handleCorePointSubmit,
      handleCorePointDelete,
      handleMapEditSave,
      handleMapEditCancel,
      handleOneCallPatch,
      handleToggleOneCall,
      handleOpenSite,
      handleOrderPipes,
      handleInvoiceClick,
      handleToggleInvoiceStatus,
      handleToggleEstimateSent,
      handleToggleContractSent,
      handleMaterialStatusChange,
      handleProjectTypeChange,
      handlePinAdd,
      handlePinCreate,
      handlePinDelete,
      handleTogglePinMode,
      handleStartCorePointMode,
    }),
    [
      handleCustomerPatch,
      handleDeleteEntity,
      handleArchive,
      handleStatusChange,
      handleCreateNewFarm,
      handleFileDelete,
      handleCheck,
      handleUploadFile,
      handleInlineFileSelect,
      handleCorePointSubmit,
      handleCorePointDelete,
      handleMapEditSave,
      handleMapEditCancel,
      handleOneCallPatch,
      handleToggleOneCall,
      handleOpenSite,
      handleOrderPipes,
      handleInvoiceClick,
      handleToggleInvoiceStatus,
      handleToggleEstimateSent,
      handleToggleContractSent,
      handleMaterialStatusChange,
      handleProjectTypeChange,
      handlePinAdd,
      handlePinCreate,
      handlePinDelete,
      handleTogglePinMode,
      handleStartCorePointMode,
    ]
  );

  const dialogsGroup = useMemo(
    () => ({
      dialogManager,
      openReshareDialog,
      openConvertDialog,
      openContactAssignmentDialog,
      openFarmAssignmentDialog,
      openSitesPopUp,
      // URL-driven modal state (mounted in ShowMoreCard)
      isReshareDialogOpen,
      isConvertDialogOpen,
      isContactAssignmentDialogOpen,
      isFarmAssignmentDialogOpen,
      closeReshareDialog,
      closeConvertDialog,
      closeContactAssignmentDialog,
      closeFarmAssignmentDialog,
      reshareDialogProps,
      convertDialogProps,
      contactAssignmentDialogProps,
      farmAssignmentDialogProps,
    }),
    [
      dialogManager,
      openReshareDialog,
      openConvertDialog,
      openContactAssignmentDialog,
      openFarmAssignmentDialog,
      openSitesPopUp,
      isReshareDialogOpen,
      isConvertDialogOpen,
      isContactAssignmentDialogOpen,
      isFarmAssignmentDialogOpen,
      closeReshareDialog,
      closeConvertDialog,
      closeContactAssignmentDialog,
      closeFarmAssignmentDialog,
      reshareDialogProps,
      convertDialogProps,
      contactAssignmentDialogProps,
      farmAssignmentDialogProps,
    ]
  );

  const utilsGroup = useMemo(
    () => ({
      router,
      queryClient,
      transformVertices,
      orgId,
      currentUser,
    }),
    [router, queryClient, orgId, currentUser]
  );

  return useMemo(
    () => ({
      data: dataGroup,
      entity: entityGroup,
      ui: uiGroup,
      map: mapGroup,
      permissions: permissionsGroup,
      computed: computedGroup,
      mutations: mutationsGroup,
      handlers: handlersGroup,
      dialogs: dialogsGroup,
      utils: utilsGroup,
    }),
    [
      dataGroup,
      entityGroup,
      uiGroup,
      mapGroup,
      permissionsGroup,
      computedGroup,
      mutationsGroup,
      handlersGroup,
      dialogsGroup,
      utilsGroup,
    ]
  );
}
