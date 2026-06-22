import { type Ref, useCallback, useImperativeHandle } from "react";

import type { GeoLatLng, GeoLatLngHandler } from "@/api/types/geo";
import type { XmlMapData } from "@/shared/ui/common/XmlGeometriesLayer";
import type { BoundaryMapRef } from "@/shared/ui/common/map";
import { parseBackendKml } from "@/utils/kml.utils";

import type {
  MapPointPath,
  MapXmlSection,
  ShpLayerData,
} from "../../model/types";
import { boundsFromPoints } from "../mapBounds";

interface ShpMapData {
  id: number;
  file: string;
  data: ShpLayerData;
}

interface KmlMapData {
  id: number;
  file: string;
  data?: unknown;
}

export interface UseDeckMapRefOptions {
  mapRef: React.RefObject<google.maps.Map | null>;
  userLocation: GeoLatLng | null;
  organizationLocation?: GeoLatLng | null;
  isCorePointMode: () => boolean;
  startCorePointMode: () => void;
  cancelCorePointMode: () => void;
  prepareCorePointAtLocation: GeoLatLngHandler;
}

export function useDeckMapRef(
  ref: Ref<BoundaryMapRef>,
  {
    mapRef,
    userLocation,
    organizationLocation,
    isCorePointMode,
    startCorePointMode,
    cancelCorePointMode,
    prepareCorePointAtLocation,
  }: UseDeckMapRefOptions
): void {
  const centerOnLocation = useCallback(
    (lat: number, lng: number) => {
      if (!mapRef.current) return;
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(15);
    },
    [mapRef]
  );

  const centerOnUserLocation = useCallback(() => {
    if (!mapRef.current || !userLocation) return;
    mapRef.current.panTo(userLocation);
    mapRef.current.setZoom(15);
  }, [mapRef, userLocation]);

  const centerOnOrganizationLocation = useCallback(() => {
    if (!mapRef.current || !organizationLocation) return;
    mapRef.current.panTo(organizationLocation);
    mapRef.current.setZoom(15);
  }, [mapRef, organizationLocation]);

  const centerOnXmlMap = useCallback(
    (xml: XmlMapData) => {
      if (!mapRef.current || !xml?.data) return;
      const pts: MapPointPath = [];
      const raw = xml.data as Record<string, unknown>;
      const dp = raw.design_points;
      if (Array.isArray(dp)) {
        for (const p of dp) {
          if (Array.isArray(p) && p.length >= 2) {
            pts.push([p[1], p[0]]);
          }
        }
      } else {
        for (const sec of Object.values(
          xml.data as Record<string, MapXmlSection>
        )) {
          if (sec?.points) pts.push(...sec.points);
        }
      }
      const bounds = boundsFromPoints(pts, true);
      if (bounds) mapRef.current.fitBounds(bounds);
    },
    [mapRef]
  );

  const centerOnShpMap = useCallback(
    (shp: ShpMapData) => {
      if (!mapRef.current || !shp?.data) return;
      const pts: MapPointPath = [];
      for (const ring of Object.values(shp.data)) {
        if (Array.isArray(ring)) pts.push(...ring);
      }
      const bounds = boundsFromPoints(pts, false);
      if (bounds) mapRef.current.fitBounds(bounds);
    },
    [mapRef]
  );

  const centerOnKmlMap = useCallback(
    (kml: KmlMapData) => {
      if (!mapRef.current || !kml?.data) return;
      try {
        const geoms = parseBackendKml(kml.data);
        const pts: MapPointPath = [];
        for (const g of geoms) {
          if (Array.isArray(g.coordinates)) {
            pts.push(...(g.coordinates as MapPointPath));
          }
        }
        const bounds = boundsFromPoints(pts, false);
        if (bounds) mapRef.current.fitBounds(bounds);
      } catch {
        // ignore parse errors
      }
    },
    [mapRef]
  );

  useImperativeHandle(
    ref,
    () => ({
      centerOnLocation,
      centerOnUserLocation,
      centerOnOrganizationLocation,
      centerOnXmlMap,
      centerOnShpMap,
      centerOnKmlMap,
      startCorePointMode,
      cancelCorePointMode,
      isCorePointMode,
      prepareCorePointAtLocation,
    }),
    [
      centerOnLocation,
      centerOnUserLocation,
      centerOnOrganizationLocation,
      centerOnXmlMap,
      centerOnShpMap,
      centerOnKmlMap,
      startCorePointMode,
      cancelCorePointMode,
      isCorePointMode,
      prepareCorePointAtLocation,
    ]
  );
}
