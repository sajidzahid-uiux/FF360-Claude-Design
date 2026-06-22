import { GEOGRAPHY_CONSTANTS, UnitSystem } from "@/constants";

/**
 * Haversine distance in miles between two lat/lng points.
 */
export function milesBetween(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = GEOGRAPHY_CONSTANTS.EARTH_RADIUS_MILES;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Haversine distance in kilometers between two lat/lng points.
 */
export function kmBetween(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = GEOGRAPHY_CONSTANTS.EARTH_RADIUS_KILOMETERS;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Haversine distance between two lat/lng points in the given unit system.
 */
export function distanceBetween(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  unit: UnitSystem = UnitSystem.IMPERIAL
): number {
  return unit === UnitSystem.METRIC
    ? kmBetween(lat1, lng1, lat2, lng2)
    : milesBetween(lat1, lng1, lat2, lng2);
}
