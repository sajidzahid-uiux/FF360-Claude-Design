import { useMemo } from "react";

import type { RgbaColor } from "@/shared/lib";
import { hexToRgba } from "@/shared/lib";
import type { KmlGeometry } from "@/utils/kml.utils";

import type { MapPoint } from "../../model/types";
import { isValidCoord } from "./deckPolygonBinary";

/** KmlGeometry extended with a stable uniqueId stamped by the caller */
type KmlGeometryWithId = KmlGeometry & { uniqueId?: string };

export interface DeckPathDatum {
  path: MapPoint[];
  color: RgbaColor;
  width: number;
  /** Pipe size metadata for hover popup */
  pipeSize: Record<string, unknown> | null;
  name?: string;
  /** Precomputed midpoint [lng, lat] for popup positioning */
  midpoint: MapPoint;
  sourceType: "xml" | "kml";
  sectionId: string;
}

interface XmlSectionData {
  points: Array<MapPoint>;
  color?: string;
  pipe_size?: Record<string, unknown>;
}

interface XmlMapItem {
  data?: Record<string, XmlSectionData>;
}

/**
 * Transforms XML polyline data and KML LineString geometries
 * into a flat array for deck.gl PathLayer.
 */
export function useDeckPathData(
  xmlToDraw: XmlMapItem[],
  kmlGeometries: KmlGeometryWithId[]
): DeckPathDatum[] {
  return useMemo(() => {
    const result: DeckPathDatum[] = [];

    // XML polylines — points are [lat, lng], swap to [lng, lat]
    for (let mi = 0; mi < xmlToDraw.length; mi++) {
      const xmlmap = xmlToDraw[mi];
      if (!xmlmap?.data || typeof xmlmap.data !== "object") continue;

      for (const [sectionId, section] of Object.entries(xmlmap.data)) {
        if (!section?.points || !Array.isArray(section.points)) continue;

        const path: MapPoint[] = [];
        for (const p of section.points) {
          if (Array.isArray(p) && p.length >= 2 && isValidCoord(p[0], p[1])) {
            path.push([p[1], p[0]]); // swap lat,lng → lng,lat
          }
        }

        if (path.length < 2) continue;

        const mid = path[Math.floor(path.length / 2)];
        result.push({
          path,
          color: hexToRgba(section.color || "#2545fa"),
          width: 2,
          pipeSize: section.pipe_size ?? null,
          midpoint: [mid[0], mid[1]],
          sourceType: "xml",
          sectionId: `xml-${mi}-${sectionId}`,
        });
      }
    }

    // KML LineStrings — coordinates are [lng, lat], use directly
    for (let i = 0; i < kmlGeometries.length; i++) {
      const geo = kmlGeometries[i];
      if (geo.type !== "LineString" || !geo.coordinates.length) continue;

      const path: MapPoint[] = [];
      for (const coord of geo.coordinates) {
        if (
          Array.isArray(coord) &&
          coord.length >= 2 &&
          isValidCoord(coord[0], coord[1])
        ) {
          path.push([coord[0], coord[1]]); // already [lng, lat]
        }
      }

      if (path.length < 2) continue;

      const mid = path[Math.floor(path.length / 2)];
      result.push({
        path,
        color: hexToRgba(geo.color || "#FF0000"),
        width: 2,
        pipeSize: (geo.pipe_size as Record<string, unknown>) ?? null,
        name: geo.name,
        midpoint: [mid[0], mid[1]],
        sourceType: "kml",
        sectionId: `kml-line-${geo.uniqueId ?? i}`,
      });
    }

    return result;
  }, [xmlToDraw, kmlGeometries]);
}
