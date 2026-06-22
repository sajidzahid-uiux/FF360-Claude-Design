import { useMemo } from "react";

import {
  FARM_BOUNDARY_FILL_RGBA,
  FARM_BOUNDARY_STROKE_RGBA,
  SHP_FILL_RGBA,
  SHP_STROKE_RGBA,
} from "@/constants/mapPolygonColors";
import type { RgbaColor } from "@/shared/lib";

import type { MapLocation, MapPoint } from "../../model/types";
import {
  EMPTY_POLYGON_DATA,
  type PolygonRing,
  buildPolygonBinary,
  isValidCoord,
} from "./deckPolygonBinary";

export interface DeckPolygonBinary {
  length: number;
  startIndices: Uint32Array;
  positions: Float32Array;
  fillColors: Uint8Array;
}

export interface DeckPolygonOutline {
  path: number[][];
  color: RgbaColor;
}

export interface DeckPolygonData {
  binary: DeckPolygonBinary;
  outlines: DeckPolygonOutline[];
}

export interface PrimaryRingOverride {
  index: number;
  fill: [number, number, number, number];
  line: [number, number, number, number];
}

export function useDeckPolygonData(
  verticesToDraw: Array<Array<MapLocation>>,
  shpToDraw: Array<{ data?: Record<string, Array<MapPoint>> }>,
  primaryRingOverride?: PrimaryRingOverride
): DeckPolygonData {
  return useMemo(() => {
    const rings: PolygonRing[] = [];
    let ringIndex = 0;

    for (const verts of verticesToDraw) {
      if (!verts || verts.length < 3) continue;
      const valid = verts.filter((v) => isValidCoord(v.lat, v.lng));
      if (valid.length < 3) continue;
      const isPrimary =
        primaryRingOverride != null && primaryRingOverride.index === ringIndex;
      rings.push({
        verts: valid.map((v) => [v.lng, v.lat]),
        fill: isPrimary ? primaryRingOverride!.fill : FARM_BOUNDARY_FILL_RGBA,
        line: isPrimary ? primaryRingOverride!.line : FARM_BOUNDARY_STROKE_RGBA,
      });
      ringIndex++;
    }

    for (const shpmap of shpToDraw) {
      if (!shpmap?.data || typeof shpmap.data !== "object") continue;
      for (const points of Object.values(shpmap.data)) {
        if (!Array.isArray(points) || points.length < 2) continue;
        const valid = points.filter(
          (p) => Array.isArray(p) && p.length >= 2 && isValidCoord(p[0], p[1])
        );
        if (valid.length < 2) continue;
        rings.push({
          verts: valid as number[][],
          fill: SHP_FILL_RGBA,
          line: SHP_STROKE_RGBA,
        });
      }
    }

    if (rings.length === 0) return EMPTY_POLYGON_DATA;

    return buildPolygonBinary(rings);
  }, [verticesToDraw, shpToDraw, primaryRingOverride]);
}
