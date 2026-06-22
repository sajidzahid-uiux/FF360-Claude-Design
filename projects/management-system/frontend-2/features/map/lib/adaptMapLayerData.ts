import type { KmlGeometry } from "@/utils/kml.utils";
import { parseBackendKml } from "@/utils/kml.utils";

import type {
  MapPoint,
  MapPointPath,
  MapXmlSection,
  MapXmlSections,
  ShpLayerData,
} from "../model/types";

interface RawXmlSection {
  points?: unknown;
  color?: unknown;
  pipe_size?: unknown;
}

function isMapPoint(value: unknown): value is MapPoint {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number"
  );
}

function parseXmlSection(section: unknown): MapXmlSection | null {
  if (!section || typeof section !== "object") return null;
  const raw = section as RawXmlSection;
  if (!Array.isArray(raw.points)) return null;

  const points = raw.points.filter(isMapPoint);
  const entry: MapXmlSection = { points };

  if (typeof raw.color === "string") entry.color = raw.color;

  const pipeSize = raw.pipe_size;
  if (
    pipeSize !== null &&
    pipeSize !== undefined &&
    typeof pipeSize === "object"
  ) {
    entry.pipe_size = pipeSize as Record<string, unknown>;
  }

  return entry;
}

export function adaptXmlToDraw(xmlmap?: { data?: unknown } | null) {
  if (!xmlmap?.data) return [];
  const raw = xmlmap.data as Record<string, unknown>;
  const dp = raw.design_points;

  if (Array.isArray(dp)) {
    const pts: MapPointPath = dp
      .filter(
        (p): p is number[] =>
          Array.isArray(p) &&
          p.length >= 2 &&
          typeof p[0] === "number" &&
          typeof p[1] === "number"
      )
      .map((p) => [p[1], p[0]] as MapPoint);

    const defaultSection: MapXmlSection = { points: pts };
    return pts.length >= 2
      ? [{ data: { default: defaultSection } satisfies MapXmlSections }]
      : [];
  }

  const sections: MapXmlSections = {};
  for (const [key, section] of Object.entries(raw)) {
    const entry = parseXmlSection(section);
    if (entry) sections[key] = entry;
  }

  return [{ data: sections }];
}

export function adaptShpToDraw(shpmap?: { data?: unknown } | null) {
  return shpmap?.data ? [{ data: shpmap.data as ShpLayerData }] : [];
}

export function adaptKmlGeometries(
  kmlmap?: { data?: unknown } | null
): KmlGeometry[] {
  if (!kmlmap?.data) return [];
  try {
    return parseBackendKml(kmlmap.data);
  } catch {
    return [];
  }
}

export function adaptShpMapsToDraw(
  maps: Array<{ data?: unknown } | null | undefined>
) {
  return maps.flatMap((map) => adaptShpToDraw(map));
}

export function adaptXmlMapsToDraw(
  maps: Array<{ data?: unknown } | null | undefined>
) {
  return maps.flatMap((map) => adaptXmlToDraw(map));
}

export function adaptKmlMapsGeometries(
  maps: Array<{ data?: unknown } | null | undefined>
): KmlGeometry[] {
  return maps.flatMap((map) => adaptKmlGeometries(map));
}
