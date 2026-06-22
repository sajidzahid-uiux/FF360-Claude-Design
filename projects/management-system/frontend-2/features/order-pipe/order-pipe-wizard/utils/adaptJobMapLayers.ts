import type {
  VendorFormJobKmlMap,
  VendorFormJobShpMap,
  VendorFormJobXmlMap,
} from "@/api/types";
import type { XmlMapData } from "@/shared/ui/common/XmlGeometriesLayer";

/**
 * BoundaryMap expects XmlMapData with data: Record<string, XmlSectionData> (points, color?, pipe_size?).
 * Vendor form API returns either:
 * - Section-based: data: { "FW...": { points: [[lat,lng],...], color, pipe_size } } — pass through (cast to XmlMapData).
 * - Legacy: data: { design_points: number[][] } — adapt to one section with points (swap [lng,lat]→[lat,lng] if needed).
 */
export function adaptJobXmlMap(
  jobXmlmap: VendorFormJobXmlMap | null | undefined
): XmlMapData | undefined {
  if (!jobXmlmap?.data || typeof jobXmlmap.data !== "object") return undefined;

  const data = jobXmlmap.data as Record<string, unknown> & {
    design_points?: number[][];
  };

  // Section-based format (e.g. "FW48562873": { points, color, pipe_size }) — use as-is
  if (!("design_points" in data) || !Array.isArray(data.design_points)) {
    const sections = data as Record<
      string,
      { points?: Array<[number, number]>; color?: string; pipe_size?: unknown }
    >;
    const hasPoints = Object.values(sections).some(
      (s) => s && Array.isArray(s.points) && s.points.length >= 2
    );
    if (hasPoints) {
      return {
        id: jobXmlmap.id,
        file: jobXmlmap.file,
        data: sections,
      } as XmlMapData;
    }
    return undefined;
  }

  // Legacy design_points format
  const raw = data.design_points;
  if (!Array.isArray(raw) || raw.length === 0) return undefined;
  const points: Array<[number, number]> = [];
  for (const p of raw) {
    if (
      Array.isArray(p) &&
      p.length >= 2 &&
      typeof p[0] === "number" &&
      typeof p[1] === "number"
    ) {
      points.push([p[1], p[0]]);
    }
  }
  if (points.length === 0) return undefined;
  return {
    id: jobXmlmap.id,
    file: jobXmlmap.file,
    data: { default: { points } },
  } as XmlMapData;
}

/**
 * BoundaryMap expects ShpMapData with data: { [key: string]: [number, number][] }.
 * Vendor form may return geometry_type only or full geometry; cast for BoundaryMap.
 */
export function adaptJobShpMap(
  jobShpmap: VendorFormJobShpMap | null | undefined
):
  | { id: number; file: string; data: { [key: string]: [number, number][] } }
  | undefined {
  if (!jobShpmap) return undefined;
  return jobShpmap as unknown as {
    id: number;
    file: string;
    data: { [key: string]: [number, number][] };
  };
}

/**
 * KML is passed through; BoundaryMap accepts data: unknown.
 */
export function adaptJobKmlMap(
  jobKmlmap: VendorFormJobKmlMap | null | undefined
): VendorFormJobKmlMap | undefined {
  return jobKmlmap ?? undefined;
}
