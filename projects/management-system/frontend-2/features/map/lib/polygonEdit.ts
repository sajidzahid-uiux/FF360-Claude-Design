import type { GeoLatLng, VertexRing } from "@/api/types/geo";

/** ~11 m at equator — matches BoundaryMap first-vertex close tolerance. */
export const POLYGON_CLOSE_TOLERANCE_DEG = 0.0001;

export function isNearFirstVertex(
  vertices: VertexRing,
  clickLat: number,
  clickLng: number,
  tolerance = POLYGON_CLOSE_TOLERANCE_DEG
): boolean {
  if (vertices.length < 3) return false;
  const first = vertices[0];
  return (
    Math.abs(clickLat - first.lat) < tolerance &&
    Math.abs(clickLng - first.lng) < tolerance
  );
}

export function addVertex(
  vertices: VertexRing,
  lat: number,
  lng: number
): VertexRing {
  return [...vertices, { lat, lng }];
}

export function undoVertex(vertices: VertexRing): VertexRing {
  return vertices.slice(0, -1);
}

export function shouldRenderClosedPolygon(
  vertices: VertexRing,
  isPolygonClosed: boolean,
  isCustomPolygonMode: boolean
): boolean {
  return isPolygonClosed || (!isCustomPolygonMode && vertices.length >= 3);
}

export type { GeoLatLng };
