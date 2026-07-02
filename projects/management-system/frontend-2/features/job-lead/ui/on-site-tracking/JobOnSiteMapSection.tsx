"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  cn,
} from "@fieldflow360/org-ui";
import { MapPin, Maximize2 } from "lucide-react";
import { toast } from "sonner";

import { JobType } from "@/constants";
import { useDesignRequestSharedMapLayers } from "@/features/design-request/hooks/useDesignRequestSharedMapLayers";
import { transformVertices } from "@/features/job-lead/ui/show-more-card/utils/vertexTransform";
import { mapPinToMapPinItem } from "@/features/map/model/mapPinItem";
import type { MapPinItem } from "@/features/map/model/mapPinItem";
import type { DeckMapLayerContext, LatLng } from "@/features/map/model/types";
import {
  DeckBoundaryMap,
  JobDetailMapControls,
  MapPinsPanel,
  MapResizeHandle,
  useResizableMapHeight,
} from "@/features/map/ui";
import { deriveStakeholderFarmMapProps } from "@/features/order-pipe/order-pipe-wizard/utils/jobFarmMapUtils";
import { getSystemSettingsPinCategoriesPath } from "@/features/pin-categories/lib/systemSettingsNavigation";
import {
  useCreateJobCorePoint,
  useCreateJobPin,
  useDeleteJobCorePoint,
  useDeleteJobPin,
} from "@/hooks/mutations";
import { useJobCorePoints, useJobPins } from "@/hooks/queries";
import {
  collectKmlMaps,
  collectShpMaps,
  collectXmlMaps,
  getMapFileDisplayName,
} from "@/shared/lib/mapFilesV2";
import { DetailFormSection } from "@/shared/ui/common";
import type { BoundaryMapRef } from "@/shared/ui/common/map";
import { CenterOnLocation } from "@/shared/ui/common/map";
import { ON_SITE_OPERATION_LABEL } from "@/features/contacts/model/constants";

interface CorePointSubmitPayload {
  id?: number;
  name?: string;
  description?: string;
  latitude: number;
  longitude: number;
}

interface JobMapFileEntry {
  id: number;
  file: string;
  data?: unknown;
}

/** Minimal shape of the job record needed to render the boundary map. */
export interface JobOnSiteMapJob {
  id: number;
  farm_info?: {
    name?: string;
    latitude?: number | string | null;
    longitude?: number | string | null;
    vertices?: unknown;
  } | null;
  farms?: unknown[];
  xmlmap?: JobMapFileEntry | null;
  xmlmap_v2?: JobMapFileEntry[];
  shpmap?: JobMapFileEntry | null;
  shpmap_v2?: JobMapFileEntry[];
  kmlmap?: JobMapFileEntry | null;
  kmlmap_v2?: JobMapFileEntry[];
}

export interface JobOnSiteMapSectionProps {
  job: JobOnSiteMapJob;
  jobType: JobType;
  orgId: string | undefined;
  organizationLocation?: LatLng | null;
  disabled?: boolean;
  canMutatePins?: boolean;
  canEditCorePoints?: boolean;
  showPins?: boolean;
  showCorePoints?: boolean;
}

/**
 * Read-only boundary map with the same interactive controls as the job detail
 * page (My location, Add Pin, Add Category, Add Core, Full view) plus the
 * per-file "Go to <name>" quick buttons. Self-contained: it loads its own pins
 * / core points and drives the map mutations directly, so it can live on the
 * On-Site Tracking page without the ShowMoreCard store.
 */
export function JobOnSiteMapSection({
  job,
  jobType,
  orgId,
  organizationLocation = null,
  disabled = false,
  canMutatePins = true,
  canEditCorePoints = true,
  showPins = true,
  showCorePoints = true,
}: JobOnSiteMapSectionProps) {
  const router = useRouter();
  const boundaryMapRef = useRef<BoundaryMapRef | null>(null);

  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [isPinMode, setIsPinMode] = useState(false);
  const [pendingPinCategoryId, setPendingPinCategoryId] = useState<
    number | null
  >(null);
  const [isPinsPanelOpen, setIsPinsPanelOpen] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  // Bottom drag handle to expand/shrink the map height (org-ui LocationPickerMap
  // behaviour). Until dragged, the map keeps its default stretched height.
  const {
    height: draggedMapHeight,
    isResized: isMapResized,
    containerRef: mapContainerRef,
    onResizeStart,
  } = useResizableMapHeight();

  // Detect the user's location once so "My location" works like the detail page.
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) =>
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
      () => {
        /* location unavailable — My location button stays disabled */
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  // Escape exits full view.
  useEffect(() => {
    if (!isMapExpanded) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMapExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMapExpanded]);

  const { data: pinsData } = useJobPins(showPins ? job.id : undefined, {});
  const { data: coreData } = useJobCorePoints(
    showCorePoints ? job.id : undefined,
    {}
  );

  const createJobPin = useCreateJobPin();
  const deleteJobPin = useDeleteJobPin();
  const createCorePoint = useCreateJobCorePoint();
  const deleteCorePoint = useDeleteJobCorePoint();

  const mapPins = useMemo<MapPinItem[]>(() => {
    if (!pinsData || !showPins) return [];
    const pins = Array.isArray(pinsData)
      ? pinsData
      : (pinsData.results ?? []);
    return pins.map(mapPinToMapPinItem);
  }, [pinsData, showPins]);

  const corePoints = useMemo(() => {
    if (!coreData || !showCorePoints) return [];
    const cores = Array.isArray(coreData) ? coreData : (coreData.results ?? []);
    return cores.map((core) => ({
      id: core.id,
      name: core.name,
      description: core.description || "",
      latitude: core.latitude,
      longitude: core.longitude,
    }));
  }, [coreData, showCorePoints]);

  const farmMapProps = useMemo(
    () => deriveStakeholderFarmMapProps((job.farms as never[]) ?? []),
    [job.farms]
  );

  const xmlMaps = useMemo(() => collectXmlMaps(job), [job]);
  const { supplementalXmlMaps } = useDesignRequestSharedMapLayers({
    organizationId: orgId ?? undefined,
    sourceType: "job",
    sourceId: job.id,
    enabled: jobType === JobType.TILING && Boolean(orgId && job.id),
  });
  const mergedXmlMaps = useMemo(
    () => [...xmlMaps, ...supplementalXmlMaps],
    [supplementalXmlMaps, xmlMaps]
  );
  const shpMaps = useMemo(() => collectShpMaps(job), [job]);
  const kmlMaps = useMemo(() => collectKmlMaps(job), [job]);

  const mapLocation = useMemo(() => {
    const primaryFarm =
      farmMapProps.farmSelectorItems.find((f) => f.isPrimary) ??
      farmMapProps.farmSelectorItems[0];
    if (primaryFarm) return { lat: primaryFarm.lat, lng: primaryFarm.lng };
    if (
      job.farm_info?.latitude != null &&
      job.farm_info?.longitude != null
    ) {
      return {
        lat: Number(job.farm_info.latitude),
        lng: Number(job.farm_info.longitude),
      };
    }
    return undefined;
  }, [farmMapProps.farmSelectorItems, job.farm_info]);

  const addPinMapLayerContext = useMemo<DeckMapLayerContext>(
    () => ({
      location: mapLocation,
      vertexRings:
        farmMapProps.vertexRings.length > 0
          ? farmMapProps.vertexRings
          : undefined,
      vertices:
        farmMapProps.vertexRings.length === 0
          ? transformVertices(job.farm_info?.vertices)
          : undefined,
      primaryRingIndex: farmMapProps.primaryRingIndex,
    }),
    [mapLocation, farmMapProps, job.farm_info]
  );

  const handleOpenManageCategories = useCallback(() => {
    if (!orgId) return;
    router.push(getSystemSettingsPinCategoriesPath(orgId));
  }, [orgId, router]);

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
      try {
        await createJobPin.mutateAsync({
          id: job.id,
          data: {
            latitude: lat,
            longitude: lng,
            category_id: categoryId,
            ...(label ? { label } : {}),
          },
        });
        setIsPinMode(false);
        toast.success("Pin added");
      } catch {
        // Error toast surfaced by the mutation.
      }
    },
    [createJobPin, job.id]
  );

  const handleArmPlacePinOnMap = useCallback(
    (categoryId: number) => {
      setPendingPinCategoryId(categoryId);
      boundaryMapRef.current?.cancelCorePointMode();
      setIsPinMode(true);
      toast.info("Click on the map to place the pin.");
    },
    []
  );

  const handlePlacePinOnMap = useCallback(
    async (lat: number, lng: number) => {
      if (pendingPinCategoryId == null) return;
      await handlePinCreate({ categoryId: pendingPinCategoryId, lat, lng });
      setPendingPinCategoryId(null);
      setIsPinMode(false);
    },
    [handlePinCreate, pendingPinCategoryId]
  );

  const handlePinDelete = useCallback(
    async (pinId: number) => {
      try {
        await deleteJobPin.mutateAsync({ id: job.id, pinId });
        toast.success("Pin deleted");
      } catch {
        // Error toast surfaced by the mutation.
      }
    },
    [deleteJobPin, job.id]
  );

  const handleCorePointSubmit = useCallback(
    async (corePoint: CorePointSubmitPayload) => {
      try {
        await createCorePoint.mutateAsync({
          jobId: job.id,
          data: {
            description: corePoint.description,
            latitude: corePoint.latitude,
            longitude: corePoint.longitude,
          },
        });
      } catch {
        // Error toast surfaced by the mutation.
      }
    },
    [createCorePoint, job.id]
  );

  const handleCorePointDelete = useCallback(
    async (coreId: number) => {
      await deleteCorePoint.mutateAsync({ jobId: job.id, coreId });
    },
    [deleteCorePoint, job.id]
  );

  const handlePinFocus = useCallback((pin: MapPinItem) => {
    boundaryMapRef.current?.centerOnLocation(pin.lat, pin.lng);
  }, []);

  const hasFarm = Boolean(job.farm_info);
  const farmSectionTitle =
    job.farm_info?.name ?? `${ON_SITE_OPERATION_LABEL} & location`;
  // The container owns the height (stretched to the column, or dragged); the
  // map fills it 100% so there's no white space below the canvas.
  const jobMapHeight = isMapExpanded ? "100dvh" : "100%";

  const goToButtons = (
    <>
      {xmlMaps.map((mapFile, index) => (
        <Button
          key={`xml-center-${mapFile.id}`}
          leftIcon={<MapPin aria-hidden className="h-3.5 w-3.5" />}
          size={ComponentSizeEnum.SM}
          title={`Go to ${getMapFileDisplayName(
            mapFile.file,
            xmlMaps.length > 1 ? `XML ${index + 1}` : "XML"
          )}`}
          variant={ButtonVariantEnum.SURFACE}
          onClick={() =>
            boundaryMapRef.current?.centerOnXmlMap(
              mapFile as Parameters<BoundaryMapRef["centerOnXmlMap"]>[0]
            )
          }
        />
      ))}
      {shpMaps.map((mapFile, index) => (
        <Button
          key={`shp-center-${mapFile.id}`}
          leftIcon={<MapPin aria-hidden className="h-3.5 w-3.5" />}
          size={ComponentSizeEnum.SM}
          title={`Go to ${getMapFileDisplayName(
            mapFile.file,
            shpMaps.length > 1 ? `shapefile ${index + 1}` : "shapefile"
          )}`}
          variant={ButtonVariantEnum.SURFACE}
          onClick={() =>
            boundaryMapRef.current?.centerOnShpMap(
              mapFile as Parameters<BoundaryMapRef["centerOnShpMap"]>[0]
            )
          }
        />
      ))}
      {kmlMaps.map((mapFile, index) => (
        <Button
          key={`kml-center-${mapFile.id}`}
          leftIcon={<MapPin aria-hidden className="h-3.5 w-3.5" />}
          size={ComponentSizeEnum.SM}
          title={`Go to ${getMapFileDisplayName(
            mapFile.file,
            kmlMaps.length > 1 ? `KML ${index + 1}` : "KML"
          )}`}
          variant={ButtonVariantEnum.SURFACE}
          onClick={() =>
            boundaryMapRef.current?.centerOnKmlMap(
              mapFile as Parameters<BoundaryMapRef["centerOnKmlMap"]>[0]
            )
          }
        />
      ))}
    </>
  );

  const farmActions = (
    <>
      <CenterOnLocation
        boundaryMapRef={boundaryMapRef}
        organizationLocationAvailable={!!organizationLocation}
        showUserLocationButton={false}
        size={ComponentSizeEnum.SM}
        userLocationAvailable={!!userLocation}
      />
      <Button
        aria-label="Full view"
        leftIcon={<Maximize2 aria-hidden className="h-3.5 w-3.5" />}
        size={ComponentSizeEnum.SM}
        title="Full view"
        variant={ButtonVariantEnum.SURFACE}
        onClick={() => setIsMapExpanded(true)}
      />
      {goToButtons}
    </>
  );

  return (
    <DetailFormSection
      actions={hasFarm ? farmActions : undefined}
      className={cn(
        "flex min-w-0 flex-col",
        !isMapResized && "h-full"
      )}
      description={
        hasFarm
          ? undefined
          : `Add an ${ON_SITE_OPERATION_LABEL.toLowerCase()} to display the boundary map.`
      }
      title={farmSectionTitle}
    >
      <div
        ref={mapContainerRef}
        className={cn(
          isMapExpanded
            ? "bg-bg-app fixed inset-0 z-50 w-full overflow-hidden border-0"
            : "border-border-subtle bg-bg-surface relative w-full overflow-hidden rounded-xl border",
          !isMapExpanded && !isMapResized && "min-h-[min(440px,50vh)] flex-1"
        )}
        style={
          isMapExpanded
            ? { minHeight: "100dvh" }
            : isMapResized
              ? { height: draggedMapHeight ?? undefined }
              : { minHeight: "min(440px, 50vh)" }
        }
      >
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
          showCorePoints={showCorePoints}
          shpmaps={shpMaps}
          userLocation={userLocation}
          vertexRings={
            farmMapProps.vertexRings.length > 0
              ? farmMapProps.vertexRings
              : undefined
          }
          vertices={
            farmMapProps.vertexRings.length === 0
              ? transformVertices(job.farm_info?.vertices)
              : undefined
          }
          xmlmaps={mergedXmlMaps}
          onCoreDelete={handleCorePointDelete}
          onCoreSubmit={handleCorePointSubmit}
          onPinAdd={canMutatePins ? handlePlacePinOnMap : undefined}
          onPinDelete={canMutatePins ? handlePinDelete : undefined}
        />
        <JobDetailMapControls
          boundaryMapRef={boundaryMapRef}
          canMutatePins={canMutatePins}
          coreDisabled={disabled}
          isCorePointMode={false}
          isMapExpanded={isMapExpanded}
          isPinsListOpen={isPinsPanelOpen}
          showAddCore={showCorePoints && canEditCorePoints && hasFarm}
          showPins={showPins}
          userLocation={userLocation}
          onCreatePin={handlePinCreate}
          onManageCategories={handleOpenManageCategories}
          onPlacePinOnMap={handleArmPlacePinOnMap}
          onToggleMapExpand={() => setIsMapExpanded((open) => !open)}
          onTogglePinsList={
            showPins ? () => setIsPinsPanelOpen((open) => !open) : undefined
          }
        />
        {showPins && isPinsPanelOpen ? (
          <div className="absolute top-16 left-3 z-20 w-[min(280px,calc(100%-1.5rem))]">
            <MapPinsPanel
              hideHeaderActions
              overlay
              defaultMapCenter={organizationLocation}
              disabled={!canMutatePins}
              mapLayerContext={addPinMapLayerContext}
              pins={mapPins}
              userLocation={userLocation}
              onManageCategories={handleOpenManageCategories}
              onPinCreate={canMutatePins ? handlePinCreate : undefined}
              onPinFocus={handlePinFocus}
            />
          </div>
        ) : null}
        {!isMapExpanded ? (
          <MapResizeHandle onPointerDown={onResizeStart} />
        ) : null}
      </div>
    </DetailFormSection>
  );
}
