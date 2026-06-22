import type { GeoLatLng } from "@/api/types/geo";

import type { KmlGeometry } from "./kml.utils";

export type {
  GeoLatLng,
  GeoLatLngAsyncHandler,
  GeoLatLngClickHandler,
  GeoLatLngHandler,
  GeoLatLng as LatLng,
  GeoLatLngHandler as MapLatLngHandler,
  GeoLatLngClickHandler as MapLatLngClickHandler,
  GeoLatLngAsyncHandler as MapLatLngAsyncHandler,
} from "@/api/types/geo";

type CoordInput =
  | number[]
  | readonly number[]
  | { 0?: number; 1?: number; [index: number]: number | undefined };

export const toLatLng = (coord: CoordInput): GeoLatLng => {
  const [lng, lat] = Array.isArray(coord) ? coord : [coord[0], coord[1]];
  return { lat: Number(lat), lng: Number(lng) };
};

export const getColor = (geometry: KmlGeometry): string =>
  geometry.color || "#FF0000";

export const getMidpoint = (path: GeoLatLng[]): GeoLatLng =>
  path[Math.floor(path.length / 2)] ?? path[0];

export const getCircleMarkerSvgUrl = (color: string): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill="${color}" stroke="#fff" stroke-width="2"/>
    <circle cx="12" cy="12" r="4" fill="#fff"/>
  </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const makeMarkerIcon = (color: string) => {
  const url = getCircleMarkerSvgUrl(color);
  if (typeof window === "undefined" || !window.google?.maps) {
    return { url };
  }

  return {
    url,
    scaledSize: new window.google.maps.Size(24, 24),
    anchor: new window.google.maps.Point(12, 12),
  };
};
