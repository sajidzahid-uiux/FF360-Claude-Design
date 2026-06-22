/** Minimal Google Maps Places/Geocoder shapes (no @types/google.maps). */

export interface GooglePlacePrediction {
  description: string;
  place_id: string;
}

export interface GoogleLatLngAccessor {
  lat: () => number;
  lng: () => number;
}

export interface GooglePlaceGeometry {
  location?: GoogleLatLngAccessor;
}

export interface GooglePlaceResult {
  geometry?: GooglePlaceGeometry;
  name?: string;
}

export type GooglePlacesServiceStatus = string;

export interface GoogleGeocodeResult {
  geometry: { location: GoogleLatLngAccessor };
}

export interface GoogleDrawingManager {
  getDrawingMode: () => unknown;
  setDrawingMode: (mode: unknown) => void;
}
