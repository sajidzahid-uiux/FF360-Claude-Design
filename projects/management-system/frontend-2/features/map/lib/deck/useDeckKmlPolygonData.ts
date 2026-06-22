import { useMemo } from "react";

import { hexToRgba } from "@/shared/lib";
import type { KmlGeometry } from "@/utils/kml.utils";

import {
  EMPTY_POLYGON_DATA,
  type PolygonRing,
  buildPolygonBinary,
  isValidCoord,
} from "./deckPolygonBinary";
import type { DeckPolygonData } from "./useDeckPolygonData";

export type DeckKmlPolygonData = DeckPolygonData;

export function useDeckKmlPolygonData(
  kmlGeometries: KmlGeometry[]
): DeckPolygonData {
  return useMemo(() => {
    const rings: PolygonRing[] = [];

    for (const geo of kmlGeometries) {
      if (geo.type !== "Polygon" || !geo.coordinates.length) continue;

      const verts: number[][] = [];
      for (const coord of geo.coordinates) {
        if (
          Array.isArray(coord) &&
          coord.length >= 2 &&
          isValidCoord(coord[0], coord[1])
        ) {
          verts.push([coord[0], coord[1]]);
        }
      }

      if (verts.length < 3) continue;

      const [r, g, b, a] = hexToRgba(geo.color || "#FF0000");
      rings.push({
        verts,
        fill: [r, g, b, 77],
        line: [r, g, b, a],
      });
    }

    if (rings.length === 0) return EMPTY_POLYGON_DATA;

    return buildPolygonBinary(rings);
  }, [kmlGeometries]);
}
