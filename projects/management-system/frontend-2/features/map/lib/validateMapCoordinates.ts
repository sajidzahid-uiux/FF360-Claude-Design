import type { GeoCoordinateParseResult, GeoLatLng } from "@/api/types/geo";

export type { GeoCoordinateParseResult as MapCoordinateParseResult } from "@/api/types/geo";

export function parseMapCoordinate(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export function validateMapCoordinates(
  lat: number,
  lng: number
): string | null {
  if (lat < -90 || lat > 90) {
    return "Latitude must be between -90 and 90.";
  }
  if (lng < -180 || lng > 180) {
    return "Longitude must be between -180 and 180.";
  }
  return null;
}

export function validateMapCoordinatesLatLng(
  location: GeoLatLng
): string | null {
  return validateMapCoordinates(location.lat, location.lng);
}

export function parseAndValidateMapCoordinates(
  latitude: string,
  longitude: string
): GeoCoordinateParseResult {
  const lat = parseMapCoordinate(latitude);
  const lng = parseMapCoordinate(longitude);

  if (lat == null || lng == null) {
    return { error: "Enter valid latitude and longitude values." };
  }

  const validationError = validateMapCoordinates(lat, lng);
  if (validationError) {
    return { error: validationError };
  }

  return { lat, lng };
}

export function isMapCoordinateError(
  result: GeoCoordinateParseResult
): result is { error: string } {
  return "error" in result;
}
