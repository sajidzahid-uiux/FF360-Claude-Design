"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { ComponentSizeEnum, Loader } from "@fieldflow360/org-ui";
import { GoogleMap } from "@react-google-maps/api";
import { ExternalLink } from "lucide-react";

import type {
  VendorFormJobKmlMap,
  VendorFormJobShpMap,
  VendorFormJobXmlMap,
} from "@/api/types";
import {
  adaptKmlGeometries,
  adaptShpToDraw,
  adaptXmlToDraw,
} from "@/features/map/lib";
import { useDeckMapRef } from "@/features/map/lib/deck";
import type { LatLng, MapLatLngHandler } from "@/features/map/model/types";
import { DeckGeometryLayers, FarmSelectorButton } from "@/features/map/ui";
import { useGoogleMapsApi } from "@/providers";
import type {
  BoundaryMapRef,
  CorePoint,
  HoveredLine,
  HoveredXmlLine,
  VendorMarker,
} from "@/shared/ui/common/map";
import { KmlLineHoverPopup, XmlLineHoverPopup } from "@/shared/ui/common/map";

import type { FarmSelectorItem } from "../utils/jobFarmMapUtils";
import { CorePointMarkers } from "./CorePointMarkers";

export interface OrderPipeDeckMapProps {
  vertexRings?: Array<LatLng[]>;
  primaryRingIndex?: number;
  vertices?: LatLng[];
  shpmap?: VendorFormJobShpMap | null;
  xmlmap?: VendorFormJobXmlMap | null;
  kmlmap?: VendorFormJobKmlMap | null;
  location?: LatLng;
  vendorMarkers?: VendorMarker[];
  secondaryFarmPins?: LatLng[];
  farmSelectorItems?: FarmSelectorItem[];
  selectedVendorId?: number;
  favoriteVendorIds?: number[];
  corePoints?: CorePoint[];
  showCorePoints?: boolean;
  userLocation?: LatLng | null;
  onUserLocationChange?: (loc: LatLng | null) => void;
  onMapClick?: MapLatLngHandler;
  onVendorMarkerClick?: (marker: VendorMarker) => void;
  showVendorMarkerLabels?: boolean;
}

const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };
const US_CENTER = { lat: 39.8283, lng: -98.5795 };
const MAP_OPTIONS = {
  disableDefaultUI: true,
  minZoom: 3,
};

export const OrderPipeDeckMap = forwardRef<
  BoundaryMapRef,
  OrderPipeDeckMapProps
>(function OrderPipeDeckMapInner(
  {
    vertexRings = [],
    primaryRingIndex,
    vertices = [],
    shpmap,
    xmlmap,
    kmlmap,
    location,
    vendorMarkers = [],
    secondaryFarmPins = [],
    farmSelectorItems = [],
    selectedVendorId,
    favoriteVendorIds,
    corePoints = [],
    showCorePoints = false,
    userLocation: propUserLocation,
    onUserLocationChange,
    onMapClick,
    onVendorMarkerClick,
    showVendorMarkerLabels = false,
  },
  ref
) {
  const { isLoaded } = useGoogleMapsApi();
  const mapRef = useRef<google.maps.Map | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

  const [internalUserLoc, setInternalUserLoc] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [hoveredXmlLine, setHoveredXmlLine] = useState<HoveredXmlLine | null>(
    null
  );
  const [hoveredKmlLine, setHoveredKmlLine] = useState<HoveredLine | null>(
    null
  );

  useEffect(() => {
    if (propUserLocation !== undefined) return;
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (pos) =>
        setInternalUserLoc({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => setInternalUserLoc(null),
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [propUserLocation]);

  const effectiveUserLoc =
    propUserLocation !== undefined ? propUserLocation : internalUserLoc;

  useEffect(() => {
    onUserLocationChange?.(effectiveUserLoc ?? null);
  }, [effectiveUserLoc, onUserLocationChange]);

  const verticesToDraw = useMemo(() => {
    if (vertexRings.length > 0) return vertexRings;
    return vertices.length > 0 ? [vertices] : [];
  }, [vertexRings, vertices]);

  const hasMultipleFarmRings = verticesToDraw.length > 1;
  const shpToDraw = useMemo(() => adaptShpToDraw(shpmap), [shpmap]);
  const xmlToDraw = useMemo(() => adaptXmlToDraw(xmlmap), [xmlmap]);
  const kmlGeometries = useMemo(() => adaptKmlGeometries(kmlmap), [kmlmap]);

  useEffect(() => {
    if (!mapInstance) return;
    const shouldFitAllFarms = hasMultipleFarmRings || !location;
    if (!shouldFitAllFarms) return;

    const bounds = new google.maps.LatLngBounds();
    let hasPoints = false;

    const tryAdd = (lat: number, lng: number) => {
      if (
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        (lat !== 0 || lng !== 0)
      ) {
        bounds.extend({ lat, lng });
        hasPoints = true;
      }
    };

    for (const ring of verticesToDraw) {
      for (const v of ring) tryAdd(v.lat, v.lng);
    }

    if (shpmap?.data) {
      for (const ring of Object.values(shpmap.data)) {
        if (Array.isArray(ring)) {
          for (const p of ring) {
            if (Array.isArray(p) && p.length >= 2) tryAdd(p[1], p[0]);
          }
        }
      }
    }

    if (xmlmap?.data) {
      const raw = xmlmap.data as Record<string, unknown>;
      if (Array.isArray(raw.design_points)) {
        for (const p of raw.design_points as number[][]) {
          if (Array.isArray(p) && p.length >= 2) tryAdd(p[1], p[0]);
        }
      } else {
        for (const section of Object.values(raw)) {
          if (section && typeof section === "object") {
            const pts = (section as { points?: unknown }).points;
            if (Array.isArray(pts)) {
              for (const p of pts as number[][]) {
                if (p.length >= 2) tryAdd(p[0], p[1]);
              }
            }
          }
        }
      }
    }

    for (const geo of kmlGeometries) {
      for (const coord of geo.coordinates) {
        if (Array.isArray(coord) && coord.length >= 2)
          tryAdd(coord[1], coord[0]);
      }
    }

    if (hasPoints) {
      mapInstance.fitBounds(bounds, 40);
    }
  }, [
    mapInstance,
    location,
    verticesToDraw,
    hasMultipleFarmRings,
    shpmap,
    xmlmap,
    kmlGeometries,
  ]);

  const handlePathHover = useCallback(
    (xmlHover: HoveredXmlLine | null, kmlHover: HoveredLine | null) => {
      setHoveredXmlLine(xmlHover);
      setHoveredKmlLine(kmlHover);
    },
    []
  );

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    map.setMapTypeId("hybrid");
    setMapInstance(map);
  }, []);

  const handleMapClick = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (!onMapClick || !event.latLng) return;
      onMapClick(event.latLng.lat(), event.latLng.lng());
    },
    [onMapClick]
  );

  const center = useMemo(
    () => (hasMultipleFarmRings ? US_CENTER : (location ?? US_CENTER)),
    [hasMultipleFarmRings, location]
  );
  const zoom = hasMultipleFarmRings ? 5 : location ? 14 : 5;

  useDeckMapRef(ref, {
    mapRef,
    userLocation: effectiveUserLoc,
    isCorePointMode: () => false,
    startCorePointMode: () => {},
    cancelCorePointMode: () => {},
    prepareCorePointAtLocation: () => {},
  });

  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader centerInContainer={false} size={ComponentSizeEnum.MD} />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <FarmSelectorButton farms={farmSelectorItems} mapRef={mapRef} />

      <a
        aria-label="Open in Google Maps"
        className="bg-accent hover:bg-accent/90 absolute top-2 right-2 z-10 flex items-center justify-center rounded p-1.5 shadow-md"
        href={`https://www.google.com/maps?q=${center.lat},${center.lng}`}
        rel="noopener noreferrer"
        target="_blank"
      >
        <ExternalLink className="text-text-inverse h-4 w-4" />
      </a>

      <GoogleMap
        center={center}
        mapContainerStyle={MAP_CONTAINER_STYLE}
        options={MAP_OPTIONS}
        zoom={zoom}
        onClick={handleMapClick}
        onLoad={onMapLoad}
      >
        <DeckGeometryLayers
          favoriteVendorIds={favoriteVendorIds}
          jobLocation={location}
          kmlGeometries={kmlGeometries}
          layerIdPrefix="wizard"
          mapInstance={mapInstance}
          primaryRingIndex={primaryRingIndex}
          secondaryFarmPins={secondaryFarmPins}
          selectedVendorId={selectedVendorId}
          showVendorMarkerLabels={showVendorMarkerLabels}
          shpToDraw={shpToDraw}
          userLocation={effectiveUserLoc}
          vendorMarkers={vendorMarkers}
          verticesToDraw={verticesToDraw}
          xmlToDraw={xmlToDraw}
          onPathHover={handlePathHover}
          onVendorMarkerClick={onVendorMarkerClick}
        />

        {hoveredKmlLine &&
          (hoveredKmlLine.geometry?.pipe_size ||
            hoveredKmlLine.geometry?.name) && (
            <KmlLineHoverPopup
              hovered={hoveredKmlLine}
              onClose={() => setHoveredKmlLine(null)}
            />
          )}

        {hoveredXmlLine && hoveredXmlLine.pipeSize && (
          <XmlLineHoverPopup
            hovered={hoveredXmlLine}
            onClose={() => setHoveredXmlLine(null)}
          />
        )}

        <CorePointMarkers
          corePoints={corePoints}
          showCorePoints={showCorePoints}
        />
      </GoogleMap>
    </div>
  );
});
