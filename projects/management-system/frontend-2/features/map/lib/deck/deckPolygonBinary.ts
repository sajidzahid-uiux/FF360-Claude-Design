import type { RgbaColor } from "@/shared/lib";

import type {
  DeckPolygonBinary,
  DeckPolygonData,
  DeckPolygonOutline,
} from "./useDeckPolygonData";

export function isValidCoord(a: number, b: number): boolean {
  return Number.isFinite(a) && Number.isFinite(b) && a !== 0 && b !== 0;
}

export const EMPTY_POLYGON_DATA: DeckPolygonData = {
  binary: {
    length: 0,
    startIndices: new Uint32Array([0]),
    positions: new Float32Array(0),
    fillColors: new Uint8Array(0),
  },
  outlines: [],
};

export interface PolygonRing {
  verts: number[][];
  fill: [number, number, number, number];
  line: RgbaColor;
}

export function buildPolygonBinary(rings: PolygonRing[]): DeckPolygonData {
  if (rings.length === 0) return EMPTY_POLYGON_DATA;

  const numRings = rings.length;
  const totalVertices = rings.reduce((sum, r) => sum + r.verts.length, 0);

  const startIndices = new Uint32Array(numRings + 1);
  const positions = new Float32Array(totalVertices * 2);
  const fillColors = new Uint8Array(totalVertices * 4);
  const outlines: DeckPolygonOutline[] = [];

  let vertexOffset = 0;

  for (let i = 0; i < numRings; i++) {
    const { verts, fill, line } = rings[i];

    startIndices[i] = vertexOffset;

    for (const [lng, lat] of verts) {
      positions[vertexOffset * 2] = lng;
      positions[vertexOffset * 2 + 1] = lat;
      fillColors[vertexOffset * 4] = fill[0];
      fillColors[vertexOffset * 4 + 1] = fill[1];
      fillColors[vertexOffset * 4 + 2] = fill[2];
      fillColors[vertexOffset * 4 + 3] = fill[3];
      vertexOffset++;
    }

    const closedPath =
      verts[0][0] === verts[verts.length - 1][0] &&
      verts[0][1] === verts[verts.length - 1][1]
        ? verts
        : [...verts, verts[0]];
    outlines.push({ path: closedPath, color: line });
  }

  startIndices[numRings] = vertexOffset;

  return {
    binary: {
      length: numRings,
      startIndices,
      positions,
      fillColors,
    } satisfies DeckPolygonBinary,
    outlines,
  };
}
