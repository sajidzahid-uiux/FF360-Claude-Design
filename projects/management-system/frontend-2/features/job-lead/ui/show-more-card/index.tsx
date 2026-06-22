"use client";

import { useCallback, useMemo, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  type TabsSwitcherItem,
} from "@fieldflow360/org-ui";
import { ComponentSizeEnum, Loader } from "@fieldflow360/org-ui";
import { CheckCircle, Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { JobUpdatePayload } from "@/api/types";
import {
  JobLeadEntityType,
  JobOrLeadType,
  JobType,
  PermissionCode,
  ResourceType,
  getJobTypePathSegment,
} from "@/constants";
import { DesignRequestJobLeadIntegration } from "@/features/design-request";
import {
  JobDetailOverflowMenu,
  JobLeadDetailLayout,
  JobLeadNotesDialog,
  getJobLeadRecordBreadcrumbLabel,
} from "@/features/job-lead";
import { useCmsJobLeadDetailBreadcrumb } from "@/features/job-lead/hooks/useCmsJobLeadDetailBreadcrumb";
import {
  PERMISSION_RESOURCES,
  usePermissionsFromStorage,
} from "@/hooks/permissions";
import { orgPath } from "@/shared/config/routes";
import { DialogManager } from "@/shared/ui/common/DialogManager";
import {
  DetailsActionsDropdown,
  MaterialStatusDropdown,
  OrderStatusBadge,
  ProjectTypeDropdown,
  ShowMoreExtraActionsDropdown,
  StatusDropdown,
} from "@/shared/ui/common/Dropdown";
import { UploadFile } from "@/shared/ui/common/UploadFile";
import { PermissionCodeGate } from "@/shared/ui/permissions";

import { ShowMoreCardDetailMeta } from "./ShowMoreCardDetailMeta";
import { getConfig } from "./configs";
import type { EntityDataState } from "./entityDataState";
import { useShowMoreCard } from "./hooks/useShowMoreCard";
import { JobDetailsTab, TabRenderer } from "./tabs";
import { ShowMoreCardProps, TabName } from "./types";

export default function ShowMoreCard(props: ShowMoreCardProps) {
  const { onClose, cancelled, completedJob, toggleArchive } = props;

  // Determine entity type and job type from props
  const entityData = useMemo((): EntityDataState | undefined => {
    const raw = props.job ?? props.leadData;
    return raw as EntityDataState | undefined;
  }, [props.job, props.leadData]);
  const entityType: ResourceType = props.job
    ? ResourceType.JOB
    : ResourceType.LEAD;

  // Get configuration for this entity type and job type
  const config = useMemo(() => {
    if (props.config) return props.config;

    let detectedJobType: JobType = JobType.REPAIR;
    if (entityData) {
      const subclass =
        entityData.job_object_subclass || entityData.object_type || "";
      if (subclass.includes("Tiling") || subclass.includes(JobType.TILING))
        detectedJobType = JobType.TILING;
      else if (
        subclass.includes("Excavation") ||
        subclass.includes(JobType.EXCAVATION)
      )
        detectedJobType = JobType.EXCAVATION;
      else if (subclass.includes("Repair") || subclass.includes(JobType.REPAIR))
        detectedJobType = JobType.REPAIR;
      else if (entityData.jobType)
        detectedJobType = entityData.jobType as JobType;
    }
    return getConfig(entityType, detectedJobType);
  }, [props.config, entityData, entityType]);

  // Use the unified hook for all state, effects, and handlers
  const {
    data,
    entity,
    ui,
    map,
    permissions,
    computed,
    mutations,
    handlers,
    dialogs,
    utils,
  } = useShowMoreCard({
    config,
    entityType,
    entityData,
    props,
  });

  // Destructure all values from hook for easier access
  const {
    comments,
    filteredFiles,
    statuses,
    projectTypes,
    corePoints,
    mapPins,
    estimateData,
    allTeam,
  } = data;
  const {
    entityDataState,
    setEntityDataState,
    loading,
    hasExistingVendorFormV2,
    activeOrderPipeStatus,
  } = entity;

  const { permissionCodes: orderPipesPermissions } = usePermissionsFromStorage(
    PERMISSION_RESOURCES.ORDER_PIPES_LIST
  );
  const hasOrderPipesRead = orderPipesPermissions.includes("read");
  const hasOrderPipesWrite = orderPipesPermissions.includes("write");
  const hasExistingPipeOrder =
    hasExistingVendorFormV2 || !!entityDataState.vendor_page;
  const showOrderPipeOption =
    !!config.features.pipeOrdering &&
    hasOrderPipesRead &&
    (hasOrderPipesWrite || hasExistingPipeOrder);

  const {
    activeTab,
    setActiveTab,
    visibleTabs,
    showUploadFile,
    setShowUploadFile,
    uploading,
    uploadFileProgress,
    checkedFiles,
    selectedFileType,
    setSelectedFileType,
    selectedFileName,
    setSelectedFileName,
    isFixedTitle,
    setIsFixedTitle,
    pendingUploadFile,
    setPendingUploadFile,
    invoiceCheckLoading,
    entityInvoice,
  } = ui;
  const { boundaryMapRef, organizationLocation } = map;
  const {
    canRead,
    canEdit,
    canEditLeadPage,
    canDelete,
    canEditStatus,

    canEditFarm,
    canEditCorePoints,
    canViewStakeholders,
    canViewInstalledFootage,
    canViewInstalledRisers,
    canUpdateInstalledFootage,
    canUpdateInstalledRisers,
    jobPageReadPermissionCode,
    leadPageReadPermissionCode,
    permissionCode,
    requiresPermissionCheck,
    canOrderPipe,
  } = permissions;
  const {
    isDisabled,
    isFinancialEstimateDisabled,
    isStatusDisabled,
    schedulingSectionDisabled,
    commentsReadOnly,
    farmerEntity,
    currentProjectType,
    currentStatus,
    orderPipeButtonText,
  } = computed;

  const { patchHook, convertHook, commentsHook } = mutations;
  const {
    handleCustomerPatch,
    handleDeleteEntity,
    handleArchive,
    handleStatusChange,
    handleFileDelete,
    handleCheck,
    handleUploadFile,
    handleInlineFileSelect,
    handleCorePointSubmit,
    handleCorePointDelete,
    handleMapEditSave,
    handleMapEditCancel,
    handleToggleOneCall,
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
  } = handlers;
  const {
    dialogManager,
    openReshareDialog,
    openConvertDialog,

    openFarmAssignmentDialog,
  } = dialogs;
  const { router, queryClient, transformVertices, currentUser, orgId } = utils;

  const [notesOpen, setNotesOpen] = useState(false);
  const handleOpenNotes = useCallback(() => setNotesOpen(true), []);

  const completedJobTypeQueryParam = useMemo((): JobOrLeadType => {
    if (config.jobType === JobType.EXCAVATION) return JobOrLeadType.EXCAVATION;
    if (config.jobType === JobType.REPAIR) return JobOrLeadType.REPAIR;
    return JobOrLeadType.TILING;
  }, [config.jobType]);

  const navigateToEntityLogs = useCallback(() => {
    if (!orgId || entityDataState?.id == null) return;
    const seg = getJobTypePathSegment(config.jobType);
    const archived = props.toggleArchive ? "true" : "false";
    const base =
      entityType === ResourceType.JOB
        ? orgPath(orgId, `/jobs/${seg}/${entityDataState.id}/logs`)
        : orgPath(orgId, `/leads/${seg}/${entityDataState.id}/logs`);
    const completedSuffix =
      props.fromCompleted && entityType === ResourceType.JOB
        ? `&fromCompleted=true&type=${completedJobTypeQueryParam}`
        : "";
    router.push(`${base}?archived=${archived}${completedSuffix}`);
  }, [
    orgId,
    entityDataState?.id,
    config.jobType,
    entityType,
    props.toggleArchive,
    props.fromCompleted,
    completedJobTypeQueryParam,
    router,
  ]);

  const entityLogsAction =
    canRead && orgId && entityDataState?.id != null
      ? navigateToEntityLogs
      : undefined;

  const invalidateJobList = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["allJobs"] });
  }, [queryClient]);

  const handleJobResume = useCallback(async () => {
    if (entityDataState.id == null) return;
    await patchHook.mutateAsync({
      id: entityDataState.id,
      updatedJob: { cancelled: false } as JobUpdatePayload,
    });
    invalidateJobList();
    onClose();
  }, [entityDataState.id, patchHook, invalidateJobList, onClose]);

  const handleJobToggleHold = useCallback(async () => {
    if (entityDataState.id == null) return;
    await patchHook.mutateAsync({
      id: entityDataState.id,
      updatedJob: { on_hold: !entityDataState.on_hold } as JobUpdatePayload,
    });
    invalidateJobList();
    onClose();
  }, [
    entityDataState.id,
    entityDataState.on_hold,
    patchHook,
    invalidateJobList,
    onClose,
  ]);

  const handleJobCancel = useCallback(async () => {
    if (entityDataState.id == null) return;
    await patchHook.mutateAsync({
      id: entityDataState.id,
      updatedJob: { cancelled: true } as JobUpdatePayload,
    });
    invalidateJobList();
    onClose();
  }, [entityDataState.id, patchHook, invalidateJobList, onClose]);

  /** Leads: gate on lead page read. Jobs: job-type read (repair gate kept for parity). */
  const detailsActionsPermissionCodes = useMemo(() => {
    const codes: Array<PermissionCode | null> =
      entityType === ResourceType.LEAD
        ? [leadPageReadPermissionCode]
        : [jobPageReadPermissionCode, PermissionCode.JOBS_REPAIR_PAGE_READ];
    return codes.filter((code): code is PermissionCode => code != null);
  }, [entityType, jobPageReadPermissionCode, leadPageReadPermissionCode]);

  // Helper function for entity type label
  const getEntityTypeLabel = () => {
    const jobTypeLabels: Record<string, string> = {
      [JobType.TILING]: "Tile",
      [JobType.EXCAVATION]: "Excavation",
      [JobType.REPAIR]: "Repair",
    };
    const typeLabel = jobTypeLabels[config.jobType] || "Job";
    return entityType === ResourceType.JOB
      ? `${typeLabel} Jobs`
      : `${typeLabel} Lead`;
  };

  const pageTitle = entityDataState.contact_info
    ? `${entityDataState.contact_info.full_name} - ${
        entityDataState.contact_info.phone_number ||
        entityDataState.contact_info.home_phone_number ||
        "N/A"
      }`
    : "No contact information";

  const pathSegment = getJobTypePathSegment(config.jobType);
  const breadcrumbEntity =
    entityType === ResourceType.JOB
      ? JobLeadEntityType.JOBS
      : JobLeadEntityType.LEADS;

  useCmsJobLeadDetailBreadcrumb(
    getJobLeadRecordBreadcrumbLabel(
      entityDataState.contact_info,
      entityDataState.farm_info?.name
    ),
    breadcrumbEntity,
    pathSegment,
    entityDataState.id != null ? String(entityDataState.id) : undefined
  );

  const tabItems = useMemo(
    (): readonly TabsSwitcherItem<TabName>[] =>
      visibleTabs.map((tab) => ({ value: tab, label: tab })),
    [visibleTabs]
  );

  const detailMeta = (
    <ShowMoreCardDetailMeta
      badgeLabel={getEntityTypeLabel()}
      contactInfo={entityDataState.contact_info}
      contractSent={entityDataState.contract_sent || false}
      estimateSent={entityDataState.estimate_sent || false}
      poNumber={entityDataState.po_number}
      progressBar={entityDataState.progress_bar}
      trailing={
        config.jobType === JobType.TILING && activeOrderPipeStatus ? (
          <OrderStatusBadge
            status={activeOrderPipeStatus}
            onClick={handleOrderPipes}
          />
        ) : null
      }
    />
  );

  const tabToolbar = undefined;

  const headerToolbar = props.isTrashed ? (
    <div className="flex max-w-full flex-nowrap items-center gap-2 overflow-x-auto">
      {statuses && statuses.length > 0 ? (
        <StatusDropdown
          disabled
          currentStatus={currentStatus}
          statusTypes={statuses}
          width={280}
          onStatusChange={handleStatusChange}
        />
      ) : null}
      {props.hasRestorePermission !== false ? (
        <Button
          leftIcon={
            <CheckCircle aria-hidden className="h-4 w-4" strokeWidth={2} />
          }
          title="Restore"
          onClick={props.onRestore}
        />
      ) : null}
      {props.hasDeletePermission !== false ? (
        <Button
          leftIcon={<Trash2 aria-hidden className="h-4 w-4" strokeWidth={2} />}
          title="Delete"
          variant={ButtonVariantEnum.DANGER}
          onClick={() => {
            if (props.onDeleteJob) {
              props.onDeleteJob(entityDataState);
            } else if (props.onDelete) {
              props.onDelete({
                model: config.stateDataKey,
                id: entityDataState.id!,
              });
            }
          }}
        />
      ) : null}
    </div>
  ) : (
    <PermissionCodeGate
      permissionCodes={
        [
          jobPageReadPermissionCode,
          leadPageReadPermissionCode,
          PermissionCode.JOBS_REPAIR_PAGE_READ,
        ] as PermissionCode[]
      }
    >
      <div className="flex max-w-full flex-nowrap items-center gap-2 overflow-x-auto">
        {statuses && statuses.length > 0 ? (
          <StatusDropdown
            currentStatus={currentStatus}
            disabled={isStatusDisabled || !canEditStatus}
            statusTypes={statuses}
            width={280}
            onStatusChange={handleStatusChange}
          />
        ) : null}
        {projectTypes && projectTypes.length > 0 ? (
          <ProjectTypeDropdown
            currentProjectType={currentProjectType}
            disabled={isDisabled || !canEditStatus}
            projectTypes={projectTypes}
            width={260}
            onProjectTypeChange={handleProjectTypeChange}
          />
        ) : null}
        {config.jobType === JobType.TILING &&
        entityType === ResourceType.LEAD ? (
          <Button
            leftIcon={
              <Share2 aria-hidden className="h-4 w-4" strokeWidth={2} />
            }
            title="Share to Designer"
            variant={ButtonVariantEnum.SURFACE}
            onClick={() => toast.message("Feature Coming Soon!")}
          />
        ) : null}
        {entityType === ResourceType.LEAD && convertHook ? (
          <Button
            aria-label="Convert to Job"
            title="Convert to Job"
            variant={ButtonVariantEnum.SURFACE}
            onClick={openConvertDialog}
          />
        ) : null}
        {farmerEntity ? (
          <Button
            leftIcon={
              <Share2 aria-hidden className="h-4 w-4" strokeWidth={2} />
            }
            title="Re-Share with Farmer"
            variant={ButtonVariantEnum.SURFACE}
            onClick={openReshareDialog}
          />
        ) : null}
        {config.jobType === JobType.TILING &&
          canRead &&
          entityType === ResourceType.JOB && (
            <MaterialStatusDropdown
              currentStatus={
                entityDataState.material_status as string | null | undefined
              }
              disabled={isDisabled}
              width={280}
              onStatusChange={handleMaterialStatusChange}
            />
          )}
        <PermissionCodeGate permissionCodes={detailsActionsPermissionCodes}>
          <DetailsActionsDropdown
            canOrderPipe={canOrderPipe}
            canToggleInvoiceStatus={!!currentUser?.roleDetails?.is_admin}
            contractSent={entityDataState.contract_sent || false}
            disabled={isDisabled}
            entityInvoice={entityInvoice}
            estimateSent={entityDataState.estimate_sent || false}
            hasExistingPipeOrder={
              hasExistingVendorFormV2 || !!entityDataState.vendor_page
            }
            invoiceDisabled={
              props.isTrashed ||
              props.toggleArchive ||
              props.cancelled ||
              props.completedJob
            }
            invoiceLoading={invoiceCheckLoading}
            orderPipeButtonText={orderPipeButtonText}
            showInvoice={
              requiresPermissionCheck && entityType === ResourceType.JOB
            }
            showOrderPipe={
              showOrderPipeOption && entityType === ResourceType.JOB
            }
            width={200}
            onCreateInvoice={handleInvoiceClick}
            onCreatePipeOrder={handleOrderPipes}
            onToggleContractSent={handleToggleContractSent}
            onToggleEstimateSent={handleToggleEstimateSent}
            onToggleInvoiceStatus={handleToggleInvoiceStatus}
            onViewPipeOrder={handleOrderPipes}
          />
        </PermissionCodeGate>
        {entityType === ResourceType.LEAD ? (
          <ShowMoreExtraActionsDropdown
            isArchived={props.toggleArchive}
            onArchive={handleArchive}
            onDelete={!isDisabled ? handleDeleteEntity : undefined}
          />
        ) : (
          <JobDetailOverflowMenu
            cancelled={!!cancelled}
            canDelete={canDelete}
            canEdit={canEdit}
            completedJob={!!completedJob}
            isArchived={!!toggleArchive}
            onArchive={handleArchive}
            onCancel={handleJobCancel}
            onHold={!!entityDataState.on_hold}
            onResume={handleJobResume}
            onToggleHold={handleJobToggleHold}
            onTrashOrDelete={handleDeleteEntity}
          />
        )}
      </div>
    </PermissionCodeGate>
  );

  if (loading) {
    return (
      <Loader
        className="min-h-[40vh]"
        size={ComponentSizeEnum.SM}
        text="Loading…"
      />
    );
  }

  return (
    <div className="bg-bg-app flex h-full min-h-0 w-full max-w-full min-w-0 flex-1 flex-col">
      {/* Upload File Dialog - use config's upload component when present (e.g. tiling has XML/Shape/KML validation) */}
      {showUploadFile &&
        (() => {
          const UploadComponent = config.components?.uploadFile ?? UploadFile;
          return (
            <UploadComponent
              initialFile={pendingUploadFile}
              initialFileName={selectedFileName}
              initialFileType={
                selectedFileType === "farmer" ||
                selectedFileType === "contractor" ||
                selectedFileType === "one_call"
                  ? selectedFileType
                  : "contractor"
              }
              isFixedTitle={isFixedTitle}
              uploadProgress={uploadFileProgress}
              onCancel={() => {
                setShowUploadFile(false);
                setSelectedFileName("");
                setIsFixedTitle(false);
                setPendingUploadFile(null);
              }}
              onUpload={(data) => {
                if (!data.file) return;
                void handleUploadFile({
                  fileName: data.fileName,
                  description: data.description,
                  file: data.file,
                  _fileType: data.fileType,
                });
              }}
            />
          );
        })()}

      {canViewStakeholders ? (
        <JobLeadNotesDialog
          canEdit={canEdit}
          canEditLeadPage={canEditLeadPage}
          comments={comments ?? []}
          commentsHook={commentsHook}
          commentsReadOnly={commentsReadOnly}
          entityDataState={entityDataState}
          entityType={entityType}
          isDisabled={isDisabled}
          isTrashed={props.isTrashed}
          open={notesOpen}
          toggleArchive={toggleArchive}
          onOpenChange={setNotesOpen}
        />
      ) : null}

      <JobLeadDetailLayout
        activeTab={activeTab}
        backLabel={
          entityType === ResourceType.JOB ? "Back to jobs" : "Back to leads"
        }
        footer={
          orgId && entityDataState.id != null ? (
            <DesignRequestJobLeadIntegration
              canEdit={canEdit}
              clientName={entityDataState.contact_info?.full_name ?? ""}
              entityId={entityDataState.id}
              entityType={entityType}
              farmName={entityDataState.farm_info?.name ?? ""}
              isTiling={config.jobType === JobType.TILING}
              jobTitle={
                getJobLeadRecordBreadcrumbLabel(
                  entityDataState.contact_info,
                  entityDataState.farm_info?.name
                ) ?? pageTitle
              }
              oneCallActive={entityDataState.one_call === true}
              oneCallDate={entityDataState.one_call_date ?? null}
              organizationId={orgId}
              onLogs={entityLogsAction}
              onOneCall={handleToggleOneCall}
              onOpenNotes={canViewStakeholders ? handleOpenNotes : undefined}
            />
          ) : undefined
        }
        meta={detailMeta}
        subtitle={pageTitle}
        tabs={tabItems}
        tabToolbar={tabToolbar}
        toolbar={headerToolbar}
        onBack={props.onClose}
        onTabChange={(tab) => setActiveTab(tab)}
      >
        {entityDataState.on_hold ? (
          <div
            className="rounded-lg border border-orange-500/40 bg-orange-500/15 px-4 py-2 text-center text-sm font-semibold text-orange-200"
            role="status"
          >
            This {entityType === ResourceType.JOB ? "job" : "lead"} is on hold
          </div>
        ) : null}
        {activeTab === "Job Details" || activeTab === "Lead Details" ? (
          // Job/Lead Details tab rendered as separate component
          <JobDetailsTab
            boundaryMapRef={boundaryMapRef}
            config={config}
            data={{ comments, allTeam, corePoints, mapPins }}
            entityType={entityType}
            handlers={{
              handleCustomerPatch,
              handleCorePointSubmit,
              handleCorePointDelete,
              handleMapEditSave,
              handleMapEditCancel,
              handlePinAdd,
              handlePinCreate,
              handlePinDelete,
              handleTogglePinMode,
              handleStartCorePointMode,
              openFarmAssignmentDialog,
            }}
            isDisabled={isDisabled}
            isTrashed={props.isTrashed}
            organizationLocation={organizationLocation}
            permissions={{
              canEdit,
              canEditLeadPage,
              canEditFarm,
              canEditCorePoints,
              canViewInstalledFootage,
              canViewInstalledRisers,
              canUpdateInstalledFootage,
              canUpdateInstalledRisers,
              jobPageReadPermissionCode,
            }}
            utils={{
              router,
              transformVertices,
              orgId,
            }}
          />
        ) : (
          // Other tabs rendered through TabRenderer
          <TabRenderer
            activeTab={activeTab}
            computed={{
              isFinancialEstimateDisabled,
            }}
            data={{
              filteredFiles,
              estimateData,
            }}
            entity={{
              config,
              entityType,
              entityDataState,
              setEntityDataState,
              isDisabled,
              schedulingSectionDisabled,
              isTrashed: props.isTrashed,
            }}
            handlers={{
              handleFileDelete,
              handleCheck,
              setSelectedFileType,
              setSelectedFileName,
              setIsFixedTitle,
              setShowUploadFile,
              handleInlineFileSelect,
            }}
            permissions={{
              canEdit,
              farmerEntity,
              permissionCode,
              jobPageReadPermissionCode,
              leadPageReadPermissionCode,
            }}
            ui={{
              uploading,
              checkedFiles,
            }}
          />
        )}
      </JobLeadDetailLayout>

      {/* Dialog Manager */}
      <DialogManager manager={dialogManager} />
    </div>
  );
}
