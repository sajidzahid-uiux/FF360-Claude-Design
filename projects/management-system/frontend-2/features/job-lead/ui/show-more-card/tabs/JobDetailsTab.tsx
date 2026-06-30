"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  Dropdown,
  Input,
  Textarea,
} from "@fieldflow360/org-ui";
import { formatDate } from "date-fns";
import { MapPin } from "lucide-react";
import { toast } from "sonner";

import type { TeamMember } from "@/api/types/team";
import { JobType, PermissionCode, ResourceType } from "@/constants";
import { ON_SITE_OPERATION_LABEL } from "@/features/contacts/model/constants";
import { useDesignRequestSharedMapLayers } from "@/features/design-request/hooks/useDesignRequestSharedMapLayers";
import {
  useShowMoreCardEntity,
  useShowMoreCardMapUi,
  useShowMoreCardScopeKey,
} from "@/features/job-lead/model/show-more-card-store";
import type { MapPinItem } from "@/features/map/model/mapPinItem";
import type { DeckMapLayerContext } from "@/features/map/model/types";
import {
  DeckBoundaryMap,
  JobDetailMapControls,
  MapPinsPanel,
} from "@/features/map/ui";
import { deriveStakeholderFarmMapProps } from "@/features/order-pipe/order-pipe-wizard/utils/jobFarmMapUtils";
import { getSystemSettingsPinCategoriesPath } from "@/features/pin-categories/lib/systemSettingsNavigation";
import {
  buildJobPrimaryDesignerOptions,
  jobPrimaryDesignerPlaceholder,
} from "@/features/team";
import { orgUrl } from "@/shared/config/routes";
import {
  collectKmlMaps,
  collectShpMaps,
  collectXmlMaps,
} from "@/shared/lib/mapFilesV2";
import { DetailFormSection, DetailViewEditActions } from "@/shared/ui/common";
import type { BoundaryMapRef } from "@/shared/ui/common/map";
import { CenterOnLocation } from "@/shared/ui/common/map";
import { PermissionCodeGate } from "@/shared/ui/permissions";
import { buildTeamMemberLabel } from "@/utils/team/assignmentOrder";
import { sanitizeText } from "@/utils/validation";

import type { EntityDataState } from "../entityDataState";
import type { ShowMoreCardConfig } from "../types";
import {
  JobDetailsTabData,
  JobDetailsTabHandlers,
  JobDetailsTabPermissions,
  JobDetailsTabUtils,
} from "../types";
import { DesignerSelection } from "./DesignerSelection";

/** Parsed value for `job_lead_acre`, or `undefined` if the raw string should be ignored. */
function jobLeadAcreFromRawInput(raw: string): number | null | undefined {
  if (raw === "") return null;
  const n = parseFloat(raw);
  if (!Number.isFinite(n)) return undefined;
  return n < 0 ? 0 : n;
}

interface JobDetailsTabProps {
  config: ShowMoreCardConfig;
  entityType: ResourceType;
  isDisabled: boolean;
  isTrashed?: boolean;
  boundaryMapRef: React.RefObject<BoundaryMapRef | null>;
  organizationLocation?: { lat: number; lng: number } | null;
  data: JobDetailsTabData;
  permissions: JobDetailsTabPermissions;
  handlers: JobDetailsTabHandlers;
  utils: JobDetailsTabUtils;
}

export function JobDetailsTab({
  config,
  entityType,
  isDisabled,
  isTrashed,
  boundaryMapRef,
  organizationLocation,
  data,
  permissions,
  handlers,
  utils,
}: JobDetailsTabProps) {
  const scopeKey = useShowMoreCardScopeKey();
  const { entityDataState, setEntityDataState } =
    useShowMoreCardEntity(scopeKey);
  const {
    editingMap,
    isCorePointMode,
    isPinMode,
    tempVertices,
    tempLocation,
    triggerBoundaryMapCenter,
    userLocation,
    locationError,
    setTempVertices,
    setTempLocation,
    patch,
  } = useShowMoreCardMapUi(scopeKey);

  const { allTeam, corePoints, mapPins } = data;

  const {
    canEdit,
    canEditLeadPage,
    canEditFarm,
    canEditCorePoints,
    canViewInstalledFootage,
    canViewInstalledRisers,
    canUpdateInstalledFootage,
    canUpdateInstalledRisers,
    jobPageReadPermissionCode,
  } = permissions;

  const {
    handleCustomerPatch,
    handleCorePointSubmit,
    handleCorePointDelete,
    handleMapEditSave,
    handleMapEditCancel,
    handlePinAdd,
    handlePinCreate,
    handlePinDelete,
    openFarmAssignmentDialog,
  } = handlers;

  const { router, transformVertices, orgId } = utils;

  // --- Job/Lead information section: explicit Edit → Save/Cancel ---------------
  // Fields in the "information" section buffer their changes locally and only
  // persist on Save, matching every other detail-page section (Financial,
  // Scheduling, Estimate). The map section keeps its own dedicated edit flow.
  const canEditInfo =
    !isDisabled &&
    (entityType === ResourceType.JOB ? canEdit : canEditLeadPage);
  const [isInfoEditing, setIsInfoEditing] = useState(false);
  const [isInfoSaving, setIsInfoSaving] = useState(false);
  const infoDisabled = isDisabled || !isInfoEditing;

  type InfoSnapshot = {
    description: string;
    designers: number[];
    job_lead_acre: number | null;
    job_footage: number | null;
    raisers_installed: number | null;
  };
  const infoSnapshotRef = useRef<InfoSnapshot | null>(null);

  const captureInfoSnapshot = useCallback(
    (): InfoSnapshot => ({
      description: entityDataState.description ?? "",
      designers: [...(entityDataState.designers ?? [])],
      job_lead_acre: entityDataState.job_lead_acre ?? null,
      job_footage: entityDataState.job_footage ?? null,
      raisers_installed: entityDataState.raisers_installed ?? null,
    }),
    [entityDataState]
  );

  const handleInfoEdit = useCallback(() => {
    infoSnapshotRef.current = captureInfoSnapshot();
    setIsInfoEditing(true);
  }, [captureInfoSnapshot]);

  const handleInfoCancel = useCallback(() => {
    const snap = infoSnapshotRef.current;
    if (snap) {
      setEntityDataState((prev: EntityDataState) => ({
        ...prev,
        description: snap.description,
        designers: snap.designers,
        job_lead_acre: snap.job_lead_acre,
        job_footage: snap.job_footage,
        raisers_installed: snap.raisers_installed,
      }));
    }
    setIsInfoEditing(false);
  }, [setEntityDataState]);

  const handleInfoSave = useCallback(async () => {
    const snap = infoSnapshotRef.current;
    const current = captureInfoSnapshot();
    const changes: Record<string, unknown> = {};
    if (snap) {
      if (current.description !== snap.description)
        changes.description = current.description;
      if (JSON.stringify(current.designers) !== JSON.stringify(snap.designers))
        changes.designers = current.designers;
      if (current.job_lead_acre !== snap.job_lead_acre)
        changes.job_lead_acre = current.job_lead_acre;
      if (current.job_footage !== snap.job_footage)
        changes.job_footage = current.job_footage;
      if (current.raisers_installed !== snap.raisers_installed)
        changes.raisers_installed = current.raisers_installed;
    }
    if (Object.keys(changes).length === 0) {
      setIsInfoEditing(false);
      return;
    }
    setIsInfoSaving(true);
    try {
      await handleCustomerPatch("all", changes);
      setIsInfoEditing(false);
    } finally {
      setIsInfoSaving(false);
    }
  }, [captureInfoSnapshot, handleCustomerPatch]);

  const canMutateMapPins =
    Boolean(config.features.mapPins) && !isDisabled && !isTrashed;

  const handleOpenManageCategories = useCallback(() => {
    if (!orgId) return;
    router.push(getSystemSettingsPinCategoriesPath(orgId));
  }, [orgId, router]);

  // "Place on Map" hands placement off to the real boundary map: remember the
  // chosen category, arm pin mode, and prompt the user to click the field.
  const [pendingPinCategoryId, setPendingPinCategoryId] = useState<
    number | null
  >(null);

  const handleArmPlacePinOnMap = useCallback(
    (categoryId: number) => {
      setPendingPinCategoryId(categoryId);
      boundaryMapRef.current?.cancelCorePointMode();
      patch({ isPinMode: true });
      toast.info("Click on the map to place the pin.");
    },
    [boundaryMapRef, patch]
  );

  const handlePlacePinOnMap = useCallback(
    async (lat: number, lng: number) => {
      if (pendingPinCategoryId == null) return;
      await handlePinCreate({ categoryId: pendingPinCategoryId, lat, lng });
      setPendingPinCategoryId(null);
      patch({ isPinMode: false });
    },
    [handlePinCreate, patch, pendingPinCategoryId]
  );

  const farmMapProps = useMemo(
    () => deriveStakeholderFarmMapProps(entityDataState.farms ?? []),
    [entityDataState.farms]
  );

  const xmlMaps = useMemo(
    () => collectXmlMaps(entityDataState),
    [entityDataState]
  );
  const { supplementalXmlMaps } = useDesignRequestSharedMapLayers({
    organizationId: orgId ?? undefined,
    sourceType: entityType === ResourceType.JOB ? "job" : "lead",
    sourceId: entityDataState.id,
    enabled:
      config.jobType === JobType.TILING && Boolean(orgId && entityDataState.id),
  });
  const mergedXmlMaps = useMemo(
    () => [...xmlMaps, ...supplementalXmlMaps],
    [supplementalXmlMaps, xmlMaps]
  );
  const shpMaps = useMemo(
    () => collectShpMaps(entityDataState),
    [entityDataState]
  );
  const kmlMaps = useMemo(
    () => collectKmlMaps(entityDataState),
    [entityDataState]
  );

  const mapLocation = useMemo(() => {
    const primaryFarm =
      farmMapProps.farmSelectorItems.find((f) => f.isPrimary) ??
      farmMapProps.farmSelectorItems[0];
    if (primaryFarm) {
      return { lat: primaryFarm.lat, lng: primaryFarm.lng };
    }
    if (
      entityDataState.farm_info?.latitude != null &&
      entityDataState.farm_info?.longitude != null
    ) {
      return {
        lat: Number(entityDataState.farm_info.latitude),
        lng: Number(entityDataState.farm_info.longitude),
      };
    }
    return undefined;
  }, [farmMapProps.farmSelectorItems, entityDataState.farm_info]);

  const addPinMapLayerContext = useMemo<DeckMapLayerContext>(
    () => ({
      location: mapLocation,
      vertexRings:
        farmMapProps.vertexRings.length > 0
          ? farmMapProps.vertexRings
          : undefined,
      vertices:
        farmMapProps.vertexRings.length === 0
          ? transformVertices(entityDataState.farm_info?.vertices)
          : undefined,
      primaryRingIndex: farmMapProps.primaryRingIndex,
      secondaryFarmPins: farmMapProps.secondaryFarmPins,
      shpmaps: shpMaps,
      xmlmaps: mergedXmlMaps,
      kmlmaps: kmlMaps,
      mapPins,
      organizationLocation,
    }),
    [
      mapLocation,
      farmMapProps.vertexRings,
      farmMapProps.primaryRingIndex,
      farmMapProps.secondaryFarmPins,
      entityDataState.farm_info?.vertices,
      shpMaps,
      mergedXmlMaps,
      kmlMaps,
      mapPins,
      organizationLocation,
      transformVertices,
    ]
  );

  const handlePinFocus = useCallback(
    (pin: MapPinItem) => {
      boundaryMapRef.current?.centerOnLocation(pin.latitude, pin.longitude);
    },
    [boundaryMapRef]
  );

  const designerIds = entityDataState.designers ?? [];

  const infoTitle =
    entityType === ResourceType.JOB ? "Job information" : "Lead information";
  const lastUpdatedLabel = entityDataState.last_updated
    ? formatDate(new Date(entityDataState.last_updated), "MM/dd/yyyy")
    : null;
  const farmSectionTitle =
    entityDataState.farm_info?.name ?? `${ON_SITE_OPERATION_LABEL} & location`;
  const farmSectionDescription = entityDataState.farm_info
    ? undefined
    : `Add an ${ON_SITE_OPERATION_LABEL.toLowerCase()} to display the boundary map.`;

  const mapViewportClass =
    "relative min-h-[min(440px,50vh)] w-full overflow-hidden rounded-xl border border-border-subtle bg-bg-surface";

  const jobMapHeight = "min(440px, 50vh)";
  const jobMapEditHeight = "min(520px, 65vh)";

  return (
    // Notes moved to a floating widget, so the body spans full width. Split the
    // information and the on-site/location map into two columns on large screens
    // to use the freed space instead of leaving a wide, sparse single column.
    <div className="grid w-full grid-cols-1 items-start gap-5 lg:grid-cols-2">
      <DetailFormSection
        actions={
          <div className="flex items-center gap-2">
            {lastUpdatedLabel ? (
              <span className="text-text-muted text-sm">
                {lastUpdatedLabel}
              </span>
            ) : null}
            <DetailViewEditActions
              canEdit={canEditInfo}
              editAriaLabel={`Edit ${infoTitle}`}
              editLabel="Edit"
              isEditing={isInfoEditing}
              isSaving={isInfoSaving}
              saveLabel="Save"
              size={ComponentSizeEnum.SM}
              onCancel={handleInfoCancel}
              onEdit={handleInfoEdit}
              onSave={handleInfoSave}
            />
          </div>
        }
        title={infoTitle}
      >
        {/* For tiling leads: Description first, then farm acres / lead acre and Designers */}
        {config.features.designerAssignment &&
        entityType === ResourceType.LEAD ? (
          <>
            <Textarea
              className="h-[150px] w-full resize-none"
              disabled={infoDisabled}
              label="Description"
              placeholder="Description"
              value={entityDataState.description || ""}
              onChange={(e) =>
                setEntityDataState((prev: EntityDataState) => ({
                  ...prev,
                  description: sanitizeText(e.target.value),
                }))
              }
            />

            {/* Farm acres and Lead Acre; Designers side by side */}
            <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:gap-8">
              {config.features.acreage && (
                <div className="flex w-full min-w-0 flex-col gap-3 sm:w-1/2">
                  <div>
                    <Input
                      className="bg-bg-surface"
                      disabled={true}
                      label="Acres"
                      placeholder="Acres"
                      type="text"
                      value={
                        entityDataState.farm_info?.acreage ||
                        entityDataState.acers ||
                        "N/A"
                      }
                    />
                  </div>
                  {config.jobType === JobType.TILING && (
                    <div>
                      <Input
                        disabled={infoDisabled}
                        label="Lead acre"
                        min={0}
                        placeholder="Optional"
                        type="number"
                        value={entityDataState.job_lead_acre ?? ""}
                        onChange={(e) => {
                          const next = jobLeadAcreFromRawInput(e.target.value);
                          if (next === undefined) return;
                          setEntityDataState((prev: EntityDataState) => ({
                            ...prev,
                            job_lead_acre: next,
                          }));
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="w-full min-w-0 sm:w-1/2">
                <DesignerSelection
                  allTeam={allTeam}
                  deferPatch={isInfoEditing}
                  entityDataState={entityDataState}
                  handleCustomerPatch={handleCustomerPatch}
                  isDisabled={infoDisabled}
                  permissionCodes={[
                    jobPageReadPermissionCode,
                    PermissionCode.JOBS_REPAIR_PAGE_READ,
                    PermissionCode.LEADS_PAGE_READ,
                    PermissionCode.LEADS_PAGE_WRITE,
                  ].filter((code): code is PermissionCode => code != null)}
                  setEntityDataState={setEntityDataState}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* For jobs: Grid layout */}
            {config.features.designerAssignment && (
              <div className="mb-4 grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2">
                {/* Assigned Designer — full-width row so the dropdown has room */}
                <div className="w-full min-w-0 md:col-span-2">
                  <div className="text-md mb-2 flex flex-col gap-2 font-medium whitespace-nowrap">
                    Assigned Designer
                  </div>
                  {isInfoEditing ? (
                    <PermissionCodeGate
                      permissionCodes={
                        [
                          jobPageReadPermissionCode,
                          PermissionCode.JOBS_REPAIR_PAGE_READ,
                        ] as PermissionCode[]
                      }
                    >
                      <Dropdown
                        fullWidth
                        disabled={infoDisabled}
                        options={buildJobPrimaryDesignerOptions(
                          allTeam,
                          designerIds
                        )}
                        placeholder={jobPrimaryDesignerPlaceholder(
                          allTeam,
                          designerIds
                        )}
                        value={
                          designerIds.length > 0
                            ? designerIds[0].toString()
                            : undefined
                        }
                        onChange={(value) => {
                          if (!value || value === "empty") return;

                          const designerId = parseInt(value, 10);
                          if (Number.isNaN(designerId)) return;
                          const hasExistingDesigner = designerIds.length > 0;
                          const isCurrentDesigner =
                            designerIds[0] === designerId;
                          const isOtherAssignedDesigner =
                            designerIds.includes(designerId) &&
                            !isCurrentDesigner;

                          // Buffer the change locally; persisted on Save.
                          if (isCurrentDesigner) {
                            const remainingDesigners = designerIds.filter(
                              (id: number) => id !== designerId
                            );
                            setEntityDataState((prev: EntityDataState) => ({
                              ...prev,
                              designers: remainingDesigners,
                            }));
                          } else if (isOtherAssignedDesigner) {
                            const updatedDesigners = designerIds.filter(
                              (id: number) => id !== designerId
                            );
                            setEntityDataState((prev: EntityDataState) => ({
                              ...prev,
                              designers: updatedDesigners,
                            }));
                          } else if (!hasExistingDesigner) {
                            setEntityDataState((prev: EntityDataState) => ({
                              ...prev,
                              designers: [designerId],
                            }));
                          } else {
                            setEntityDataState((prev: EntityDataState) => ({
                              ...prev,
                              designers: [designerId],
                            }));
                          }
                        }}
                      />
                    </PermissionCodeGate>
                  ) : (
                    <Input
                      className="bg-bg-surface"
                      disabled={true}
                      type="text"
                      value={
                        designerIds.length > 0
                          ? (() => {
                              const designer = allTeam?.find(
                                (member) => member.id === designerIds[0]
                              ) as TeamMember | undefined;
                              return designer
                                ? buildTeamMemberLabel(designer, true, true)
                                : "Designer assigned";
                            })()
                          : "No designer assigned"
                      }
                    />
                  )}
                </div>

                {/* Farm acres (read-only) */}
                {config.features.acreage && (
                  <div className="w-full min-w-0">
                    <Input
                      className="bg-bg-surface"
                      disabled={true}
                      label="Acres"
                      placeholder="Acres"
                      type="text"
                      value={
                        entityDataState.farm_info?.acreage ||
                        entityDataState.acers ||
                        "N/A"
                      }
                    />
                  </div>
                )}

                {config.features.acreage &&
                  config.jobType === JobType.TILING && (
                    <div className="w-full min-w-0">
                      <Input
                        disabled={infoDisabled}
                        label="Job acre"
                        min={0}
                        placeholder="Optional"
                        type="number"
                        value={entityDataState.job_lead_acre ?? ""}
                        onChange={(e) => {
                          const next = jobLeadAcreFromRawInput(e.target.value);
                          if (next === undefined) return;
                          setEntityDataState((prev: EntityDataState) => ({
                            ...prev,
                            job_lead_acre: next,
                          }));
                        }}
                      />
                    </div>
                  )}

                {/* Job Footage (for tiling jobs) */}
                {entityType === ResourceType.JOB &&
                  config.jobType === JobType.TILING &&
                  canViewInstalledFootage && (
                    <div className="w-full min-w-0">
                      <Input
                        disabled={infoDisabled || !canUpdateInstalledFootage}
                        label="Job footage"
                        placeholder="Enter footage"
                        step="0.01"
                        type="number"
                        value={entityDataState.job_footage ?? ""}
                        onChange={(e) => {
                          const value =
                            e.target.value === ""
                              ? null
                              : parseFloat(e.target.value);
                          setEntityDataState((prev: EntityDataState) => ({
                            ...prev,
                            job_footage: value,
                          }));
                        }}
                      />
                    </div>
                  )}

                {/* Raisers Installed (for tiling jobs) */}
                {entityType === ResourceType.JOB &&
                  config.jobType === JobType.TILING &&
                  canViewInstalledRisers && (
                    <div className="w-full min-w-0">
                      <Input
                        disabled={infoDisabled || !canUpdateInstalledRisers}
                        label="Raisers installed"
                        placeholder="Enter count"
                        step="1"
                        type="number"
                        value={entityDataState.raisers_installed ?? ""}
                        onChange={(e) => {
                          const value =
                            e.target.value === ""
                              ? null
                              : parseInt(e.target.value);
                          setEntityDataState((prev: EntityDataState) => ({
                            ...prev,
                            raisers_installed: value,
                          }));
                        }}
                      />
                    </div>
                  )}
              </div>
            )}

            <Textarea
              className={
                config.features.designerAssignment
                  ? "min-h-[150px] w-full resize-none"
                  : entityType === ResourceType.LEAD
                    ? "h-[150px] w-full resize-none"
                    : "min-h-[100px] w-full resize-none"
              }
              disabled={infoDisabled}
              label="Description"
              placeholder="Description"
              rows={config.features.designerAssignment ? 6 : undefined}
              value={entityDataState.description || ""}
              onChange={(e) =>
                setEntityDataState((prev: EntityDataState) => ({
                  ...prev,
                  description: sanitizeText(e.target.value),
                }))
              }
            />
          </>
        )}
      </DetailFormSection>
      <DetailFormSection
        description={farmSectionDescription}
        title={farmSectionTitle}
      >
        <div className="border-border-subtle bg-bg-surface/30 space-y-3 rounded-lg border p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              {!editingMap ? (
                <>
                  {!entityDataState.farm_info ? (
                    <Button
                      aria-label={`Add ${ON_SITE_OPERATION_LABEL}`}
                      disabled={isDisabled}
                      title={`Add ${ON_SITE_OPERATION_LABEL}`}
                      variant={ButtonVariantEnum.SURFACE}
                      onClick={openFarmAssignmentDialog}
                    />
                  ) : null}
                  {entityDataState.farm_info && canEditFarm ? (
                    <Button
                      aria-label={`Edit ${ON_SITE_OPERATION_LABEL}`}
                      disabled={isDisabled}
                      title={`Edit ${ON_SITE_OPERATION_LABEL}`}
                      variant={ButtonVariantEnum.SURFACE}
                      onClick={() => {
                        router.push(
                          `${orgUrl(orgId, `/contact/${entityDataState.contact_info?.id}`, `farmId=${entityDataState.farm_info?.id}`)}`
                        );
                      }}
                    />
                  ) : null}
                </>
              ) : null}
              {/* My location moves onto the map overlay in the read-only view;
                  keep it in the toolbar only while editing (no overlay there). */}
              <CenterOnLocation
                boundaryMapRef={boundaryMapRef}
                organizationLocationAvailable={!!organizationLocation}
                showUserLocationButton={editingMap}
                userLocationAvailable={!!userLocation}
              />
            </div>

            {!editingMap ? (
              <div className="flex min-w-0 flex-wrap items-center gap-2 sm:ml-auto">
                {xmlMaps.map((mapFile, index) => (
                  <Button
                    key={`xml-center-${mapFile.id}`}
                    leftIcon={<MapPin aria-hidden className="h-3.5 w-3.5" />}
                    title={
                      xmlMaps.length > 1
                        ? `Go to XML ${index + 1}`
                        : "Go to XML"
                    }
                    variant={ButtonVariantEnum.SURFACE}
                    onClick={() => {
                      boundaryMapRef.current?.centerOnXmlMap(
                        mapFile as Parameters<
                          NonNullable<
                            typeof boundaryMapRef.current
                          >["centerOnXmlMap"]
                        >[0]
                      );
                    }}
                  />
                ))}
                {shpMaps.map((mapFile, index) => (
                  <Button
                    key={`shp-center-${mapFile.id}`}
                    leftIcon={<MapPin aria-hidden className="h-3.5 w-3.5" />}
                    title={
                      shpMaps.length > 1
                        ? `Go to shapefile ${index + 1}`
                        : "Go to shapefile"
                    }
                    variant={ButtonVariantEnum.SURFACE}
                    onClick={() => {
                      boundaryMapRef.current?.centerOnShpMap(
                        mapFile as Parameters<
                          NonNullable<
                            typeof boundaryMapRef.current
                          >["centerOnShpMap"]
                        >[0]
                      );
                    }}
                  />
                ))}
                {kmlMaps.map((mapFile, index) => (
                  <Button
                    key={`kml-center-${mapFile.id}`}
                    leftIcon={<MapPin aria-hidden className="h-3.5 w-3.5" />}
                    title={
                      kmlMaps.length > 1
                        ? `Go to KML ${index + 1}`
                        : "Go to KML"
                    }
                    variant={ButtonVariantEnum.SURFACE}
                    onClick={() => {
                      boundaryMapRef.current?.centerOnKmlMap(
                        mapFile as Parameters<
                          NonNullable<
                            typeof boundaryMapRef.current
                          >["centerOnKmlMap"]
                        >[0]
                      );
                    }}
                  />
                ))}
                {/* Add Core moved onto the map overlay (JobDetailMapControls). */}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 sm:ml-auto">
                <Button
                  aria-label="Save map"
                  title="Save map"
                  onClick={handleMapEditSave}
                />
                <Button
                  aria-label="Cancel"
                  title="Cancel"
                  variant={ButtonVariantEnum.SURFACE}
                  onClick={handleMapEditCancel}
                />
              </div>
            )}
          </div>

          {locationError ? (
            <p className="text-feedback-error text-sm" role="alert">
              {locationError}
            </p>
          ) : null}
          {config.features.mapPins && !isTrashed ? (
            <MapPinsPanel
              defaultMapCenter={organizationLocation}
              disabled={!canMutateMapPins}
              hideHeaderActions={!editingMap}
              mapLayerContext={addPinMapLayerContext}
              pins={mapPins}
              userLocation={userLocation}
              onManageCategories={handleOpenManageCategories}
              onPinCreate={canMutateMapPins ? handlePinCreate : undefined}
              onPinFocus={handlePinFocus}
            />
          ) : null}
        </div>

        <div
          className={
            editingMap && !isTrashed
              ? "border-border-subtle bg-bg-surface relative min-h-[min(520px,65vh)] w-full overflow-hidden rounded-xl border"
              : mapViewportClass
          }
          style={
            editingMap && !isTrashed
              ? { minHeight: "min(520px, 65vh)" }
              : { minHeight: jobMapHeight }
          }
        >
          {editingMap && !isTrashed ? (
            <DeckBoundaryMap
              ref={boundaryMapRef}
              canEditCorePoints={canEditCorePoints}
              className="h-full w-full"
              corePoints={corePoints}
              isPinMode={isPinMode}
              kmlmaps={kmlMaps}
              location={tempLocation ?? undefined}
              mapHeight={jobMapEditHeight}
              mapPins={mapPins}
              organizationLocation={organizationLocation}
              readOnly={isDisabled}
              showCorePoints={config.features.corePoints}
              shpmaps={shpMaps}
              triggerCenterOnUserLocation={triggerBoundaryMapCenter}
              userLocation={userLocation}
              vertices={tempVertices}
              xmlmaps={mergedXmlMaps}
              onChangeLocation={setTempLocation}
              onChangeVertices={setTempVertices}
              onCoreDelete={handleCorePointDelete}
              onCoreSubmit={handleCorePointSubmit}
              onPinAdd={canMutateMapPins ? handlePinAdd : undefined}
              onPinDelete={canMutateMapPins ? handlePinDelete : undefined}
            />
          ) : (
            <>
              {!entityDataState.farm_info &&
              farmMapProps.vertexRings.length === 0 ? (
                <p className="bg-bg-surface/50 text-text-muted pointer-events-none absolute inset-0 z-[1] flex max-w-sm items-center justify-center px-4 text-center text-sm">
                  {`Add an ${ON_SITE_OPERATION_LABEL.toLowerCase()} to show the boundary map and field location.`}
                </p>
              ) : null}
              <DeckBoundaryMap
                ref={boundaryMapRef}
                hideActionMenu
                hideFloatingControls
                hideSearch
                readOnly
                canEditCorePoints={canEditCorePoints}
                className="h-full w-full"
                corePoints={corePoints}
                farmSelectorItems={farmMapProps.farmSelectorItems}
                isPinMode={isPinMode}
                kmlmaps={kmlMaps}
                location={mapLocation}
                mapHeight={jobMapHeight}
                mapPins={mapPins}
                organizationLocation={organizationLocation}
                primaryRingIndex={farmMapProps.primaryRingIndex}
                secondaryFarmPins={farmMapProps.secondaryFarmPins}
                showCorePoints={config.features.corePoints}
                shpmaps={shpMaps}
                triggerCenterOnUserLocation={triggerBoundaryMapCenter}
                userLocation={userLocation}
                vertexRings={
                  farmMapProps.vertexRings.length > 0
                    ? farmMapProps.vertexRings
                    : undefined
                }
                vertices={
                  farmMapProps.vertexRings.length === 0
                    ? transformVertices(entityDataState.farm_info?.vertices)
                    : undefined
                }
                xmlmaps={mergedXmlMaps}
                onChangeLocation={() => {}}
                onChangeVertices={() => {}}
                onCoreDelete={handleCorePointDelete}
                onCoreSubmit={handleCorePointSubmit}
                onPinAdd={canMutateMapPins ? handlePlacePinOnMap : undefined}
                onPinDelete={canMutateMapPins ? handlePinDelete : undefined}
              />
              <JobDetailMapControls
                boundaryMapRef={boundaryMapRef}
                canMutatePins={canMutateMapPins}
                coreDisabled={isDisabled}
                isCorePointMode={isCorePointMode}
                showAddCore={
                  Boolean(config.features.corePoints) &&
                  canEditCorePoints &&
                  Boolean(entityDataState.farm_info)
                }
                showPins={Boolean(config.features.mapPins)}
                userLocation={userLocation}
                onCreatePin={handlePinCreate}
                onManageCategories={handleOpenManageCategories}
                onPlacePinOnMap={handleArmPlacePinOnMap}
              />
            </>
          )}
        </div>
      </DetailFormSection>
    </div>
  );
}
