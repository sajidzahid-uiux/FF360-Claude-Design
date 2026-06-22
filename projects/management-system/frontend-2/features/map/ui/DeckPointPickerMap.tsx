"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { IconLayer, ScatterplotLayer } from "@deck.gl/layers";
import { Button, ButtonVariantEnum } from "@fieldflow360/org-ui";
import { GoogleMap } from "@react-google-maps/api";
import { Navigation } from "lucide-react";

import {
  adaptKmlGeometries,
  adaptShpToDraw,
  adaptXmlToDraw,
  useMapCursorCoordinates,
} from "@/features/map/lib";
import {
  useDeckGeometryLayers,
  useDeckGlOverlay,
  useDeckMapPinsLayer,
} from "@/features/map/lib/deck";
import { buildDeckCirclePinIcon } from "@/features/map/lib/deck/deckPinIcons";
import type {
  DeckMapLayerContext,
  LatLng,
  MapLatLngHandler,
  MapPoint,
} from "@/features/map/model/types";
import { DEFAULT_PIN_CATEGORY_COLOR } from "@/features/pin-categories/lib/pinCategoryColors";
import { useGoogleMapsApi } from "@/providers";
import type { BoundaryMapRef } from "@/shared/ui/common/map";

import { CursorCoordinates } from "./shared/CursorCoordinates";

export interface DeckPointPickerMapProps {
  className?: string;
  lat?: number;
  lng?: number;
  onChange?: MapLatLngHandler;
  onMapLoad?: (map: google.maps.Map) => void;
  mapHeight?: string | number;
  showMyLocationButton?: boolean;
  defaultCenter?: LatLng;
  layerContext?: DeckMapLayerContext;
  placementPinColor?: string;
}

const DEFAULT_CENTER = { lat: 64.8401, lng: -147.72 };

function useNoopPathHover() {
  return useCallback(() => {}, []);
}

export const DeckPointPickerMap = forwardRef<
  BoundaryMapRef,
  DeckPointPickerMapProps
>(function DeckPointPickerMapInner(
  {
    className = "",
    lat,
    lng,
    onChange,
    onMapLoad,
    mapHeight = "250px",
    showMyLocationButton = true,
    defaultCenter = DEFAULT_CENTER,
    layerContext,
    placementPinColor = DEFAULT_PIN_CATEGORY_COLOR,
  },
  ref
) {
  const { isLoaded, loadError } = useGoogleMapsApi();
  const mapRef = useRef<google.maps.Map | null>(null);
  const hasInitialFocusDone = useRef(false);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<LatLng | null>(
    lat != null && lng != null ? { lat, lng } : null
  );
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const {
    coordinates: cursorCoordinates,
    handleMouseMove,
    handleMouseOut,
  } = useMapCursorCoordinates();
  const onPathHover = useNoopPathHover();

  useEffect(() => {
    if (lat != null && lng != null) setMarker({ lat, lng });
  }, [lat, lng]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (pos) =>
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => setUserLocation(null),
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  const verticesToDraw = useMemo(() => {
    if (layerContext?.vertexRings?.length) return layerContext.vertexRings;
    if (layerContext?.vertices?.length) return [layerContext.vertices];
    return [];
  }, [layerContext?.vertexRings, layerContext?.vertices]);

  const shpToDraw = useMemo(
    () => adaptShpToDraw(layerContext?.shpmap),
    [layerContext?.shpmap]
  );
  const xmlToDraw = useMemo(
    () => adaptXmlToDraw(layerContext?.xmlmap),
    [layerContext?.xmlmap]
  );
  const kmlGeometries = useMemo(
    () => adaptKmlGeometries(layerContext?.kmlmap),
    [layerContext?.kmlmap]
  );

  const geometryLayers = useDeckGeometryLayers({
    layerIdPrefix: "picker",
    verticesToDraw,
    shpToDraw,
    xmlToDraw,
    kmlGeometries,
    onPathHover,
    secondaryFarmPins: layerContext?.secondaryFarmPins,
    primaryRingIndex: layerContext?.primaryRingIndex,
    jobLocation: layerContext?.location,
    organizationLocation: layerContext?.organizationLocation,
  });

  const existingPinLayers = useDeckMapPinsLayer({
    mapPins: layerContext?.mapPins ?? [],
  });

  const pickerLayers = useMemo(() => {
    const result = [];
    if (marker) {
      result.push(
        new IconLayer({
          id: "point-picker-marker",
          data: [{ position: [marker.lng, marker.lat] as MapPoint }],
          getPosition: (d) => d.position,
          getIcon: () => buildDeckCirclePinIcon(placementPinColor),
          getSize: 36,
          sizeUnits: "pixels",
          pickable: false,
        })
      );
    }
    if (userLocation) {
      result.push(
        new ScatterplotLayer({
          id: "point-picker-user",
          data: [
            { position: [userLocation.lng, userLocation.lat] as MapPoint },
          ],
          getPosition: (d) => d.position,
          getFillColor: [66, 133, 244, 255],
          getRadius: 8,
          radiusUnits: "pixels",
          stroked: true,
          getLineColor: [255, 255, 255, 255],
          getLineWidth: 3,
          lineWidthUnits: "pixels",
          pickable: false,
        })
      );
    }
    return result;
  }, [marker, placementPinColor, userLocation]);

  const allLayers = useMemo(
    () => [...geometryLayers, ...existingPinLayers, ...pickerLayers],
    [geometryLayers, existingPinLayers, pickerLayers]
  );

  useDeckGlOverlay(mapInstance, allLayers);

  const focusOnContext = useCallback(() => {
    if (!mapRef.current) return;

    const rings = verticesToDraw.filter((ring) => ring.length >= 3);
    if (rings.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      for (const ring of rings) {
        for (const v of ring) {
          bounds.extend(v);
        }
      }
      mapRef.current.fitBounds(bounds, 40);
      return;
    }

    if (layerContext?.location) {
      mapRef.current.panTo(layerContext.location);
      mapRef.current.setZoom(15);
    }
  }, [layerContext?.location, verticesToDraw]);

  useEffect(() => {
    if (!mapInstance || hasInitialFocusDone.current) return;
    hasInitialFocusDone.current = true;
    focusOnContext();
  }, [focusOnContext, mapInstance]);

  useImperativeHandle(
    ref,
    () => ({
      centerOnLocation(latVal: number, lngVal: number) {
        mapRef.current?.panTo({ lat: latVal, lng: lngVal });
        mapRef.current?.setZoom(15);
      },
      centerOnUserLocation() {
        if (!userLocation || !mapRef.current) return;
        mapRef.current.panTo(userLocation);
        mapRef.current.setZoom(15);
      },
      centerOnOrganizationLocation() {},
      centerOnXmlMap() {},
      centerOnShpMap() {},
      centerOnKmlMap() {},
      startCorePointMode() {},
      cancelCorePointMode() {},
      isCorePointMode: () => false,
      prepareCorePointAtLocation() {},
    }),
    [userLocation]
  );

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();
      setMarker({ lat: newLat, lng: newLng });
      onChange?.(newLat, newLng);
    },
    [onChange]
  );

  const handleMapLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      map.setMapTypeId("hybrid");
      setMapInstance(map);
      onMapLoad?.(map);
    },
    [onMapLoad]
  );

  const centerOnUser = useCallback(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.panTo(userLocation);
      mapRef.current.setZoom(15);
    }
  }, [userLocation]);

  const containerStyle = useMemo(
    () => ({ width: "100%", height: mapHeight }),
    [mapHeight]
  );

  if (loadError) {
    return (
      <div
        className="text-feedback-error flex items-center justify-center px-4 text-center text-sm"
        style={{ height: mapHeight }}
      >
        Could not load Google Maps. Check the API key and try again.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className="text-text-muted flex items-center justify-center text-sm"
        style={{ height: mapHeight }}
      >
        Loading map…
      </div>
    );
  }

  return (
    <div className={className}>
      {showMyLocationButton ? (
        <div className="mb-2 flex items-center gap-2">
          <Button
            disabled={!userLocation}
            leftIcon={<Navigation aria-hidden className="h-3 w-3" />}
            title="My Location"
            variant={ButtonVariantEnum.SURFACE}
            onClick={centerOnUser}
          />
        </div>
      ) : null}
      <div className="border-border-subtle relative w-full overflow-hidden rounded border">
        <CursorCoordinates coordinates={cursorCoordinates} />
        <GoogleMap
          center={marker ?? defaultCenter}
          mapContainerStyle={containerStyle}
          options={{
            mapTypeId: "hybrid",
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            zoomControl: true,
          }}
          zoom={marker ? 15 : 8}
          onClick={handleMapClick}
          onLoad={handleMapLoad}
          onMouseMove={(e) => {
            if (e.latLng) {
              handleMouseMove({
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
              });
            }
          }}
          onMouseOut={handleMouseOut}
        />
      </div>
    </div>
  );
});
