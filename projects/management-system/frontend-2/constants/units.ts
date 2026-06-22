export enum UnitSystem {
  METRIC = "metric",
  IMPERIAL = "imperial",
}

export const CACHE_TIME = {
  DEFAULT: 30 * 1000, // 30 seconds
  STALE: 5 * 60 * 1000, // 5 minutes
  GC: 10 * 60 * 1000, // 10 minutes (garbage collection)
  REAL_TIME: 0, // No caching for real-time data
  LONG: 30 * 60 * 1000, // 30 minutes for rarely changing data
} as const;

export const FILE_SIZE_LIMITS = {
  IMAGE_MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5 MB
} as const;

export const DISTANCE_UNITS = {
  SHORT: {
    [UnitSystem.METRIC]: "km",
    [UnitSystem.IMPERIAL]: "mi",
  },
  LONG: {
    [UnitSystem.METRIC]: "km",
    [UnitSystem.IMPERIAL]: "miles",
  },
  FULL: {
    [UnitSystem.METRIC]: "Kilometers",
    [UnitSystem.IMPERIAL]: "Miles",
  },
} as const;

export const GEOGRAPHY_CONSTANTS = {
  EARTH_RADIUS_MILES: 3959,
  EARTH_RADIUS_KILOMETERS: 6371,
} as const;

export const CONVERSION_FACTORS = {
  METERS_TO_INCHES: 39.3701,
} as const;

export const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10_000,
  maximumAge: 60_000,
};
