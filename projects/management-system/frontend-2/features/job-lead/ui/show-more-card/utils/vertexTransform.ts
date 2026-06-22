import type { EntityDataState } from "../entityDataState";
import type { LatLng } from "../types";

type FarmInfoInput = NonNullable<EntityDataState["farm_info"]>;

function isLatLngObject(value: unknown): value is LatLng {
  return (
    typeof value === "object" &&
    value !== null &&
    "lat" in value &&
    "lng" in value &&
    typeof (value as LatLng).lat === "number" &&
    typeof (value as LatLng).lng === "number"
  );
}

/**
 * Transform vertices from [lng, lat] format to {lat, lng} format
 * This is used for Google Maps which expects {lat, lng} format
 */
export function transformVertices(vertices: unknown): LatLng[] {
  if (!vertices || !Array.isArray(vertices)) return [];

  return vertices.map((vertex: unknown) => {
    if (Array.isArray(vertex) && vertex.length >= 2) {
      return { lat: vertex[1], lng: vertex[0] }; // Convert [lng, lat] to {lat, lng}
    }
    if (isLatLngObject(vertex)) {
      return { lat: vertex.lat, lng: vertex.lng };
    }
    return { lat: 0, lng: 0 };
  });
}

/**
 * Transform vertices from {lat, lng} format to [lng, lat] format
 * This is used for backend API which expects [lng, lat] format
 */
export function transformVerticesToBackend(
  vertices: LatLng[] | unknown[]
): Array<[number, number]> {
  if (!vertices || !Array.isArray(vertices)) return [];

  return vertices.map((vertex: unknown) => {
    if (isLatLngObject(vertex)) {
      return [vertex.lng, vertex.lat]; // Convert {lat, lng} to [lng, lat]
    }
    if (Array.isArray(vertex) && vertex.length >= 2) {
      return [vertex[0], vertex[1]] as [number, number];
    }
    return [0, 0];
  });
}

/**
 * Get initial location from farm info
 */
export function getInitialLocation(
  farmInfo: FarmInfoInput | null | undefined
): LatLng | undefined {
  if (!farmInfo) return undefined;

  // Check if vertices exist and use first vertex
  if (
    farmInfo.vertices &&
    Array.isArray(farmInfo.vertices) &&
    farmInfo.vertices.length > 0
  ) {
    const transformed = transformVertices(farmInfo.vertices);
    if (transformed.length > 0) {
      return transformed[0];
    }
  }

  // Fallback to latitude/longitude
  if (farmInfo.latitude && farmInfo.longitude) {
    return {
      lat: parseFloat(String(farmInfo.latitude)),
      lng: parseFloat(String(farmInfo.longitude)),
    };
  }

  return undefined;
}
