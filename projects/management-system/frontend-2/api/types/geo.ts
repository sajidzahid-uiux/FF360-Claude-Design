import type { Vertex } from "./common";

/**
 * Google Maps lat/lng point. Same shape as API farm `vertices` entries (`Vertex`).
 */
export type GeoLatLng = Vertex;

/** Backend latitude/longitude fields (pins, core points, org/farm centers). */
export interface GeoCoordinate {
  latitude: number;
  longitude: number;
}

export type GeoCoordinatePartial = Partial<GeoCoordinate>;

export type GeoLatLngNullable = GeoLatLng | null;

/** Single boundary ring. */
export type VertexRing = GeoLatLng[];

/** Multiple farm boundary rings. */
export type VertexRings = VertexRing[];

/** Geographic tuple [lng, lat] (deck.gl / SHP / KML). */
export type GeoLngLatTuple = [number, number];

export type GeoLngLatPath = GeoLngLatTuple[];

/** Lat/lng bounds box derived from coordinate pairs. */
export interface GeoBoundsLiteral {
  south: number;
  north: number;
  west: number;
  east: number;
}

export type GeoLatLngHandler = (lat: number, lng: number) => void;

export type GeoLatLngClickHandler = (lat: number, lng: number) => boolean;

export type GeoLatLngAsyncHandler = (lat: number, lng: number) => Promise<void>;

export type GeoCoordinateParseResult = GeoLatLng | { error: string };
