"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  Loader,
} from "@fieldflow360/org-ui";
import { GoogleMap } from "@react-google-maps/api";
import { Building2, Navigation, WrenchIcon } from "lucide-react";

import type { MapFarmEntry, MapJob, MapLead } from "@/api/types";
import {
  MapViewTab,
  ResourceType,
  apiJobTypeToJobLeadTypeSegment,
  coerceJobLeadTypeSegment,
  jobLeadTypeSegmentToJobType,
} from "@/constants";
import {
  collectMapItemFarmVertices,
  resolveMapFarmManagementContactName,
  toMapMarkerFarms,
  useMapFiltering,
} from "@/features/map/lib";
import type { StackedGroup } from "@/features/map/lib/deck";
import type { MapMarkerData } from "@/features/map/model/types";
import {
  useContacts,
  useIsMobile,
  useOrganizationById,
  usePersistentStorage,
  useRouteIds,
} from "@/hooks";
import { useContactPermissions } from "@/hooks/permissions";
import { useMapDataV2, useMapLegends } from "@/hooks/queries";
import { useGoogleMapsApi } from "@/providers";
import { useModalStack } from "@/shared/model/use-modal-stack";
import {
  type BoundaryMapRef,
  CustomizeMapLegendDialog,
  type HoveredLine,
  type HoveredXmlLine,
  KmlLineHoverPopup,
  XmlLineHoverPopup,
  getIconByNumber,
} from "@/shared/ui/common/map";
import { Card } from "@/shared/ui/primitives";
import {
  type BackendKmlData,
  type KmlGeometry,
  parseBackendKml,
} from "@/utils/kml.utils";

import { DeckGlMapLayers } from "./DeckGlMapLayers";
import { MapBreadcrumbToolbar } from "./MapBreadcrumbToolbar";
import { MapInfoPopup } from "./MapInfoPopup";
import { MapLegend } from "./MapLegend";
import { MapSearch } from "./MapSearch";
import { StackedGroupPopup } from "./StackedGroupPopup";
import { CursorCoordinates } from "./shared/CursorCoordinates";

const US_CENTER = { lat: 39.8283, lng: -98.5795 };

// Stable references so React Query doesn't see new param objects each render
// on the Map page (the map only ever needs all contacts, unfiltered).
const MAP_CONTACTS_PARAMS = { search: "", categories: [] as number[] };
const MAP_CONTACTS_QUERY_OVERRIDES = {
  staleTime: 60 * 1000,
  refetchOnMount: false as const,
  refetchOnWindowFocus: false as const,
};

const addMarkerWithFarms = (
  base: MapMarkerData,
  farms: MapFarmEntry[] | undefined,
  result: MapMarkerData[]
) => {
  const validFarms = (farms ?? []).filter(
    (f): f is MapFarmEntry & { latitude: number; longitude: number } =>
      f.latitude != null &&
      f.longitude != null &&
      Number.isFinite(f.latitude) &&
      Number.isFinite(f.longitude)
  );

  if (validFarms.length > 0) {
    for (const farm of validFarms) {
      result.push({
        ...base,
        latitude: farm.latitude,
        longitude: farm.longitude,
        highlighted_farm_id: farm.farm_id,
      });
    }
  } else {
    result.push(base);
  }
};

const Maps = () => {
  const storage = usePersistentStorage();
  const { orgId: organization } = useRouteIds();
  const [position, setPosition] = useState<{ lat: number; lng: number }>(
    US_CENTER
  );

  const [selectedMarker, setSelectedMarker] = useState<MapMarkerData | null>(
    null
  );
  const [selectedGroup, setSelectedGroup] = useState<StackedGroup | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [organizationLocation, setOrganizationLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const boundaryMapRef = useRef<BoundaryMapRef>({
    centerOnShpMap: () => {},
    centerOnXmlMap: () => {},
    centerOnUserLocation: () => {
      if (userLocation && mapRef.current) {
        mapRef.current.panTo(userLocation);
        mapRef.current.setZoom(15);
      }
    },
    centerOnOrganizationLocation: () => {
      if (organizationLocation && mapRef.current) {
        mapRef.current.panTo(organizationLocation);
        mapRef.current.setZoom(15);
      }
    },
    centerOnLocation: () => {},
    startCorePointMode: () => {},
    cancelCorePointMode: () => {},
    isCorePointMode: () => false,
    prepareCorePointAtLocation: () => {},
    centerOnKmlMap: () => {},
  });

  useEffect(() => {
    boundaryMapRef.current.centerOnUserLocation = () => {
      if (userLocation && mapRef.current) {
        mapRef.current.panTo(userLocation);
        mapRef.current.setZoom(15);
      }
    };
  }, [userLocation]);

  useEffect(() => {
    boundaryMapRef.current.centerOnOrganizationLocation = () => {
      if (organizationLocation && mapRef.current) {
        mapRef.current.panTo(organizationLocation);
        mapRef.current.setZoom(15);
      }
    };
  }, [organizationLocation]);

  const [searchLink, setSearchLink] = useState("");
  const [cursorCoordinates, setCursorCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<MapViewTab>(MapViewTab.JOBS_LEADS);
  const { stack, openModal, closeModalKey } = useModalStack();
  const isLegendDialogOpen = stack.some((f) => f.key === "customize-map-legend");

  const { canRead: hasContactAccess } = useContactPermissions();
  const { isLoaded, loadError } = useGoogleMapsApi();

  // Hover state for popups
  const [hoveredXmlLine, setHoveredXmlLine] = useState<HoveredXmlLine | null>(
    null
  );
  const [hoveredKmlLine, setHoveredKmlLine] = useState<HoveredLine | null>(
    null
  );

  const { filters, setFilters, debouncedFilterParams } = useMapFiltering({
    onClearNonFilterSearch: () => setSearchLink(""),
  });
  const { orgId: routeOrgId } = useRouteIds();

  const mapViewTabKey = `mapViewTab_org_${routeOrgId || "default"}`;

  useEffect(() => {
    const savedViewTab = storage.getItem(mapViewTabKey);
    if (
      savedViewTab &&
      [MapViewTab.JOBS_LEADS, MapViewTab.CONTACTS].includes(
        savedViewTab as MapViewTab
      )
    ) {
      setActiveTab(savedViewTab as MapViewTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    storage.setItem(mapViewTabKey, activeTab);
  }, [activeTab, storage, mapViewTabKey]);

  const { data: mapData } = useMapDataV2(debouncedFilterParams, {
    queryEnabled: activeTab === MapViewTab.JOBS_LEADS,
  });
  const { data: mapLegends } = useMapLegends();
  const { data: currentOrganization } = useOrganizationById(organization);

  useEffect(() => {
    if (currentOrganization?.latitude && currentOrganization?.longitude) {
      setOrganizationLocation({
        lat: Number(currentOrganization.latitude),
        lng: Number(currentOrganization.longitude),
      });
    }
  }, [currentOrganization, organization]);

  const getLegendData = useCallback(
    (type: string) => {
      if (!mapLegends) return null;
      const normalizedType = apiJobTypeToJobLeadTypeSegment(type) ?? type;
      const leadLegend = mapLegends.find(
        (legend) => legend.legend_type === `${normalizedType}_leads`
      );
      const jobLegend = mapLegends.find(
        (legend) => legend.legend_type === `${normalizedType}_jobs`
      );
      return { lead: leadLegend, job: jobLegend };
    },
    [mapLegends]
  );

  const { contacts } = useContacts(
    MAP_CONTACTS_PARAMS,
    activeTab === MapViewTab.CONTACTS,
    MAP_CONTACTS_QUERY_OVERRIDES
  );

  // User location tracking
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    const options = { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 };

    const handleSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = position.coords;
      setUserLocation({ lat: latitude, lng: longitude });
      setLocationError(
        accuracy <= 100
          ? null
          : "Low accuracy. Using network, try GPS for better results."
      );
    };

    const handleError = (error: GeolocationPositionError) => {
      const messages: Record<number, string> = {
        [error.PERMISSION_DENIED]:
          "Location access denied. Please enable location permissions.",
        [error.POSITION_UNAVAILABLE]:
          "GPS unavailable. Enable location services and try outdoor location.",
        [error.TIMEOUT]:
          "GPS timeout. Move to an open area with clear sky view.",
      };
      setLocationError(
        messages[error.code] ||
          "Location error. Enable GPS and location permissions."
      );
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
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  const handleMapMouseMove = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      setCursorCoordinates({
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      });
    }
  };

  const handleMapMouseLeave = () => setCursorCoordinates(null);
  const deckClickRef = useRef(false);
  const handleMapClick = () => {
    // Ignore map click if a deck.gl marker was just clicked
    if (deckClickRef.current) {
      deckClickRef.current = false;
      return;
    }
    setSelectedMarker(null);
  };

  // Raw API items — used for geometry extraction (vertices, shp, xml, kml)
  const rawJobs = useMemo(() => mapData?.jobs ?? [], [mapData]);
  const rawLeads = useMemo(() => mapData?.leads ?? [], [mapData]);

  // Marker data — typed for the popup and deck.gl click flow
  const toJobMarker = (job: MapJob): MapMarkerData => ({
    id: job.id,
    object_type: ResourceType.JOB,
    latitude: job.latitude ?? 0,
    longitude: job.longitude ?? 0,
    title: job.customer_name,
    farm_name: job.farm_name,
    farms: toMapMarkerFarms(job),
    farm_management_contact_name: resolveMapFarmManagementContactName(job),
    po_number: job.po_number,
    customer_phone_number: job.phone_number,
    job_type: job.job_type,
    job_status:
      job.job_status ??
      (job.status != null
        ? { id: 0, title: job.status, color: "" }
        : undefined),
    state: job.state,
    project_type: job.project_type ?? null,
  });

  const toLeadMarker = (lead: MapLead): MapMarkerData => ({
    id: lead.id,
    object_type: ResourceType.LEAD,
    latitude: lead.latitude ?? 0,
    longitude: lead.longitude ?? 0,
    title: lead.customer_name,
    farm_name: lead.farm_name,
    farms: toMapMarkerFarms(lead),
    farm_management_contact_name: resolveMapFarmManagementContactName(lead),
    po_number: lead.po_number,
    customer_phone_number: lead.phone_number,
    lead_type: lead.lead_type,
    lead_status:
      lead.lead_status ??
      (lead.status != null
        ? { id: 0, title: lead.status, color: "" }
        : undefined),
    state: lead.state,
    project_type: lead.project_type ?? null,
  });

  const filteredData: MapMarkerData[] = useMemo(() => {
    const result: MapMarkerData[] = [];

    for (const lead of rawLeads) {
      addMarkerWithFarms(toLeadMarker(lead), lead.farms, result);
    }

    for (const job of rawJobs) {
      addMarkerWithFarms(toJobMarker(job), job.farms, result);
    }

    return result;
  }, [rawLeads, rawJobs]);

  const contactData: MapMarkerData[] = useMemo(() => {
    if (!contacts || !Array.isArray(contacts) || contacts.length === 0)
      return [];
    return contacts
      .filter((contact) => {
        const lat = Number(contact.latitude);
        const lng = Number(contact.longitude);
        return (
          Number.isFinite(lat) &&
          Number.isFinite(lng) &&
          lat >= -90 &&
          lat <= 90 &&
          lng >= -180 &&
          lng <= 180
        );
      })
      .map((contact) => ({
        id: contact.id,
        full_name: contact.full_name,
        company_name: contact.company_name,
        phone_number: contact.phone_number || contact.home_phone_number,
        email: contact.email,
        street_address: contact.street_address,
        city: contact.city,
        state: contact.state,
        latitude: Number(contact.latitude),
        longitude: Number(contact.longitude),
        object_type: "contact" as const,
      }));
  }, [contacts]);

  // Geometry data for deck.gl.
  //
  // `filteredData` is just `leads ∪ jobs`, so the previous `.find(...)` check
  // against it was redundant and O(n²). We iterate the source arrays directly
  // which is O(n) and produces the same result.
  const verticesToDraw = useMemo(() => {
    const result: Array<Array<{ lat: number; lng: number }>> = [];
    for (const job of rawJobs) {
      result.push(...collectMapItemFarmVertices(job));
    }
    for (const lead of rawLeads) {
      result.push(...collectMapItemFarmVertices(lead));
    }
    return result;
  }, [rawJobs, rawLeads]);

  const shpToDraw = useMemo(() => {
    const result: Array<{ data?: Record<string, Array<[number, number]>> }> =
      [];
    const pushShp = (item: {
      shpmap?: { data?: Record<string, unknown> };
      shpmap_v2?: Array<{ data?: Record<string, unknown> }>;
    }) => {
      if (item.shpmap) result.push(item.shpmap as (typeof result)[number]);
      for (const mapFile of item.shpmap_v2 ?? []) {
        if (mapFile) result.push(mapFile as (typeof result)[number]);
      }
    };
    rawJobs.forEach(pushShp);
    rawLeads.forEach(pushShp);
    return result;
  }, [rawJobs, rawLeads]);

  const xmlToDraw = useMemo(() => {
    const result: Array<{
      data?: Record<
        string,
        {
          points: Array<[number, number]>;
          color?: string;
          pipe_size?: Record<string, unknown>;
        }
      >;
    }> = [];
    const pushXml = (item: {
      xmlmap?: { data?: Record<string, unknown> };
      xmlmap_v2?: Array<{ data?: Record<string, unknown> }>;
    }) => {
      if (item.xmlmap) result.push(item.xmlmap as (typeof result)[number]);
      for (const mapFile of item.xmlmap_v2 ?? []) {
        if (mapFile) result.push(mapFile as (typeof result)[number]);
      }
    };
    rawJobs.forEach(pushXml);
    rawLeads.forEach(pushXml);
    return result;
  }, [rawJobs, rawLeads]);

  // Cache parsed KML geometries keyed by the raw `kmlmap.data` reference.
  // `parseBackendKml` is an expensive walk over the Placemark tree; when
  // unrelated state (filters, cursor, hover) causes the page to re-render we
  // should not re-parse KML we've already parsed.
  const kmlParseCacheRef = useRef<WeakMap<object, KmlGeometry[]>>(
    new WeakMap()
  );

  const kmlGeometries = useMemo(() => {
    const allGeometries: (KmlGeometry & { uniqueId: string })[] = [];
    const cache = kmlParseCacheRef.current;

    const pushKml = (item: {
      kmlmap?: { data?: unknown };
      kmlmap_v2?: Array<{ data?: unknown }>;
      object_type: string;
      id: number;
    }) => {
      const mapEntries = [
        ...(item.kmlmap ? [item.kmlmap] : []),
        ...(item.kmlmap_v2 ?? []),
      ];

      for (
        let mapEntryIndex = 0;
        mapEntryIndex < mapEntries.length;
        mapEntryIndex++
      ) {
        const mapEntry = mapEntries[mapEntryIndex];
        const raw = mapEntry?.data as BackendKmlData | undefined;
        if (!raw || typeof raw !== "object") continue;

        let parsed = cache.get(raw as object);
        if (!parsed) {
          try {
            parsed = parseBackendKml(raw);
          } catch {
            parsed = [];
          }
          cache.set(raw as object, parsed);
        }

        for (let index = 0; index < parsed.length; index++) {
          allGeometries.push({
            ...parsed[index],
            uniqueId: `${item.object_type}-${item.id}-${mapEntry === item.kmlmap ? "legacy" : "v2"}-${mapEntryIndex}-${index}`,
          });
        }
      }
    };

    rawJobs.forEach(pushKml);
    rawLeads.forEach(pushKml);
    return allGeometries;
  }, [rawJobs, rawLeads]);

  // Icon helpers for popup
  const getPopupIconAndColor = useCallback(
    (
      objectType: string,
      jobType?: string,
      leadType?: string,
      iconNumber?: string
    ) => {
      if (leadType) {
        const iconType = jobLeadTypeSegmentToJobType(
          coerceJobLeadTypeSegment(leadType)
        );
        const legendData = getLegendData(iconType);
        return {
          color: legendData?.lead?.color || "#ef4444",
          icon: getIconByNumber(
            iconType,
            legendData?.lead?.icon_svg || iconNumber || "1"
          ),
        };
      }
      if (jobType) {
        const iconType = jobLeadTypeSegmentToJobType(
          coerceJobLeadTypeSegment(jobType)
        );
        const legendData = getLegendData(iconType);
        return {
          color: legendData?.job?.color || "#3b82f6",
          icon: getIconByNumber(
            iconType,
            legendData?.job?.icon_svg || iconNumber || "1"
          ),
        };
      }
      return { color: "#3b82f6", icon: <WrenchIcon color="#fff" size={20} /> };
    },
    [getLegendData]
  );

  const handlePathHover = useCallback(
    (xmlHover: HoveredXmlLine | null, kmlHover: HoveredLine | null) => {
      setHoveredXmlLine(xmlHover);
      setHoveredKmlLine(kmlHover);
    },
    []
  );

  const handleMarkerClick = useCallback((item: MapMarkerData) => {
    deckClickRef.current = true;
    setSelectedGroup(null);
    setSelectedMarker(item);
  }, []);

  const handleGroupClick = useCallback((group: StackedGroup) => {
    deckClickRef.current = true;
    setSelectedMarker(null);
    setSelectedGroup(group);
  }, []);

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    map.setMapTypeId("hybrid");
    setMapInstance(map);
  };

  const isMobile = useIsMobile();

  const mapContainerStyleMemo = useMemo(
    () => ({ height: "100%", width: "100%" }),
    []
  );

  if (loadError) return <div>Error loading maps</div>;

  if (!isLoaded) {
    return (
      <Loader
        className="min-h-[40vh]"
        size={ComponentSizeEnum.LG}
        text="Loading map..."
      />
    );
  }

  return (
    <>
      <MapBreadcrumbToolbar
        activeTab={activeTab}
        filters={filters}
        hasContactAccess={hasContactAccess}
        onFilterChange={setFilters}
        onTabChange={setActiveTab}
      />

      <Card className="flex h-[calc(100dvh-8.5rem)] flex-col overflow-hidden rounded-none border-none p-0">
        <div className="relative min-h-0 flex-1">
          <div className="pointer-events-none absolute top-3 left-3 z-10 w-[min(calc(100%-6rem),28rem)]">
            <MapSearch
              overlay
              className="pointer-events-auto"
              locationError={locationError}
              mapRef={mapRef}
              searchLink={searchLink}
              onPositionChange={setPosition}
              onSearchLinkChange={setSearchLink}
            />
          </div>

          <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
            <Button
              iconOnly
              aria-label={
                userLocation ? "My location" : "Location not available"
              }
              className="border-border-subtle/80 bg-bg-surface-elevated/95 shadow-md backdrop-blur-sm"
              disabled={!userLocation}
              leftIcon={<Navigation className="h-5 w-5" />}
              size={ComponentSizeEnum.MD}
              variant={ButtonVariantEnum.SURFACE}
              onClick={() => boundaryMapRef.current?.centerOnUserLocation()}
            />
            {organizationLocation ? (
              <Button
                iconOnly
                aria-label="Organization location"
                className="border-border-subtle/80 bg-bg-surface-elevated/95 shadow-md backdrop-blur-sm"
                leftIcon={<Building2 className="h-5 w-5" />}
                size={ComponentSizeEnum.MD}
                variant={ButtonVariantEnum.SURFACE}
                onClick={() =>
                  boundaryMapRef.current?.centerOnOrganizationLocation()
                }
              />
            ) : null}
          </div>

          <GoogleMap
            center={position}
            mapContainerStyle={mapContainerStyleMemo}
            mapTypeId="hybrid"
            options={{
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false,
              minZoom: 3,
            }}
            zoom={8}
            onClick={handleMapClick}
            onLoad={onMapLoad}
            onMouseMove={handleMapMouseMove}
            onMouseOut={handleMapMouseLeave}
          >
            {mapInstance && (
              <>
                {/* deck.gl WebGL layers — single instance, tab controls which layers render */}
                <DeckGlMapLayers
                  activeTab={activeTab}
                  contactData={contactData}
                  filteredData={filteredData}
                  getLegendData={getLegendData}
                  kmlGeometries={kmlGeometries}
                  mapInstance={mapInstance}
                  organizationLocation={organizationLocation}
                  shpToDraw={shpToDraw}
                  userLocation={userLocation}
                  verticesToDraw={verticesToDraw}
                  xmlToDraw={xmlToDraw}
                  onGroupClick={handleGroupClick}
                  onMarkerClick={handleMarkerClick}
                  onPathHover={handlePathHover}
                />

                {/* KML Line Hover Popup */}
                {hoveredKmlLine &&
                  (hoveredKmlLine.geometry?.pipe_size ||
                    hoveredKmlLine.geometry?.name) && (
                    <KmlLineHoverPopup
                      hovered={hoveredKmlLine}
                      onClose={() => setHoveredKmlLine(null)}
                    />
                  )}

                {/* XML Line Hover Popup */}
                {hoveredXmlLine && hoveredXmlLine.pipeSize && (
                  <XmlLineHoverPopup
                    hovered={hoveredXmlLine}
                    onClose={() => setHoveredXmlLine(null)}
                  />
                )}

                {/* Cursor Coordinates Display */}
                <CursorCoordinates coordinates={cursorCoordinates} />

                {/* Stacked Group Popup — drill-down list for exact-coordinate stacks */}
                {selectedGroup && (
                  <StackedGroupPopup
                    group={selectedGroup}
                    onClose={() => setSelectedGroup(null)}
                    onItemClick={(item: MapMarkerData) => {
                      setSelectedGroup(null);
                      handleMarkerClick(item);
                    }}
                  />
                )}

                {/* Selected Marker Info Popup */}
                {selectedMarker && (
                  <MapInfoPopup
                    getPopupIconAndColor={getPopupIconAndColor}
                    organization={organization ?? ""}
                    selectedMarker={selectedMarker}
                    onClose={() => setSelectedMarker(null)}
                  />
                )}

                {/* Map Legend */}
                <MapLegend
                  activeTab={activeTab}
                  getLegendData={getLegendData}
                  isMobile={isMobile}
                  onLegendClick={() => openModal("customize-map-legend")}
                />
              </>
            )}
          </GoogleMap>
        </div>

        <CustomizeMapLegendDialog
          isOpen={isLegendDialogOpen}
          onClose={() => closeModalKey("customize-map-legend")}
        />
      </Card>
    </>
  );
};

export default Maps;
