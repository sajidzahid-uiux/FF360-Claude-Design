import type { GeoBoundsLiteral, GeoLngLatPath } from "@/api/types/geo";

import type { MapPointPath } from "../model/types";

export type LatLngBoundsLiteral = GeoBoundsLiteral;

export function boundsFromPoints(
  points: MapPointPath,
  latFirst: boolean
): LatLngBoundsLiteral | null {
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  for (const p of points) {
    const lat = latFirst ? p[0] : p[1];
    const lng = latFirst ? p[1] : p[0];
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }

  if (!Number.isFinite(minLat)) return null;
  return { south: minLat, north: maxLat, west: minLng, east: maxLng };
}

export type { GeoLngLatPath };
