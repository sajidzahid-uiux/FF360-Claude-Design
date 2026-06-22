import type { LocationPoint } from "@fieldflow360/org-ui";

import type { GeoLatLng } from "@/api/types/geo";

export function toLocationPoint(
  location: GeoLatLng | null
): LocationPoint | undefined {
  if (!location) return undefined;
  return { type: "Point", coordinates: [location.lng, location.lat] };
}

export function fromLocationPoint(
  point: LocationPoint | undefined
): GeoLatLng | null {
  if (!point) return null;
  return { lat: point.coordinates[1], lng: point.coordinates[0] };
}
