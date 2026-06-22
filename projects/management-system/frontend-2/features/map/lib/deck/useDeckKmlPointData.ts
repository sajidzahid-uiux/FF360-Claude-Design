import { useMemo } from "react";

import { hexToRgba } from "@/shared/lib";
import type { RgbaColor } from "@/shared/lib";
import type { KmlGeometry } from "@/utils/kml.utils";

import type { MapPoint } from "../../model/types";
import { isValidCoord } from "./deckPolygonBinary";

export interface DeckKmlPointDatum {
  position: MapPoint; // [lng, lat]
  color: RgbaColor;
  radius: number;
}

/**
 * Transforms KML Point geometries into data for deck.gl ScatterplotLayer.
 */
export function useDeckKmlPointData(
  kmlGeometries: KmlGeometry[]
): DeckKmlPointDatum[] {
  return useMemo(() => {
    const result: DeckKmlPointDatum[] = [];

    for (const geo of kmlGeometries) {
      if (geo.type !== "Point" || !geo.coordinates.length) continue;
      const coord = geo.coordinates[0];
      if (
        !Array.isArray(coord) ||
        coord.length < 2 ||
        !isValidCoord(coord[0], coord[1])
      )
        continue;

      result.push({
        position: [coord[0], coord[1]], // already [lng, lat]
        color: hexToRgba(geo.color || "#FF0000"),
        radius: 10,
      });
    }

    return result;
  }, [kmlGeometries]);
}
