/**
 * Approximate geographic centroids for US states (and DC).
 * Used to display vendors that only have state-level location on the map.
 */
export const STATE_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  AL: { lat: 32.3182, lng: -86.9023 },
  AK: { lat: 64.8378, lng: -153.4937 },
  AZ: { lat: 34.0489, lng: -111.0937 },
  AR: { lat: 35.201, lng: -91.8318 },
  CA: { lat: 36.7783, lng: -119.4179 },
  CO: { lat: 39.113, lng: -105.3111 },
  CT: { lat: 41.6032, lng: -73.0877 },
  DE: { lat: 38.9108, lng: -75.5277 },
  DC: { lat: 38.9072, lng: -77.0369 },
  FL: { lat: 27.6648, lng: -81.5158 },
  GA: { lat: 32.1574, lng: -82.9071 },
  HI: { lat: 19.8968, lng: -155.5828 },
  ID: { lat: 44.0682, lng: -114.742 },
  IL: { lat: 40.6331, lng: -89.3985 },
  IN: { lat: 40.2672, lng: -86.1349 },
  IA: { lat: 41.878, lng: -93.0977 },
  KS: { lat: 38.5266, lng: -96.7265 },
  KY: { lat: 37.6681, lng: -84.6701 },
  LA: { lat: 31.1695, lng: -91.8678 },
  ME: { lat: 45.2538, lng: -69.4455 },
  MD: { lat: 39.0458, lng: -76.6413 },
  MA: { lat: 42.4072, lng: -71.3824 },
  MI: { lat: 43.3266, lng: -84.5361 },
  MN: { lat: 46.7296, lng: -94.6859 },
  MS: { lat: 32.3547, lng: -89.3985 },
  MO: { lat: 37.9643, lng: -91.8318 },
  MT: { lat: 46.8797, lng: -110.3626 },
  NE: { lat: 41.4925, lng: -99.9018 },
  NV: { lat: 38.8026, lng: -116.4194 },
  NH: { lat: 43.1939, lng: -71.5724 },
  NJ: { lat: 40.0583, lng: -74.4057 },
  NM: { lat: 34.5199, lng: -105.8701 },
  NY: { lat: 43.2994, lng: -74.2179 },
  NC: { lat: 35.7596, lng: -79.0193 },
  ND: { lat: 47.5515, lng: -101.002 },
  OH: { lat: 40.4173, lng: -82.9071 },
  OK: { lat: 35.0078, lng: -97.0929 },
  OR: { lat: 43.8041, lng: -120.5542 },
  PA: { lat: 41.2033, lng: -77.1945 },
  RI: { lat: 41.5801, lng: -71.4774 },
  SC: { lat: 33.8361, lng: -81.1637 },
  SD: { lat: 43.9695, lng: -99.9018 },
  TN: { lat: 35.5175, lng: -86.5804 },
  TX: { lat: 31.9686, lng: -99.9018 },
  UT: { lat: 39.321, lng: -111.0937 },
  VT: { lat: 44.5588, lng: -72.5778 },
  VA: { lat: 37.4316, lng: -78.6569 },
  WA: { lat: 47.7511, lng: -120.7401 },
  WV: { lat: 38.5976, lng: -80.4549 },
  WI: { lat: 43.7844, lng: -88.7879 },
  WY: { lat: 43.076, lng: -107.2903 },
};

export function getStateCentroid(
  stateCode: string
): { lat: number; lng: number } | null {
  if (!stateCode || typeof stateCode !== "string") return null;
  const key = stateCode.trim().toUpperCase();
  return STATE_CENTROIDS[key] ?? null;
}
