import { toast } from "sonner";

const MAP_V2_FIELD_KEYS = {
  XML: "xmlmap_v2",
  SHP: "shpmap_v2",
  KML: "kmlmap_v2",
} as const;

type MapV2FieldKey = (typeof MAP_V2_FIELD_KEYS)[keyof typeof MAP_V2_FIELD_KEYS];

export type MapFileType = "xml" | "shp" | "kml";

const FILE_TYPE_TO_V2_KEY: Record<MapFileType, MapV2FieldKey> = {
  xml: MAP_V2_FIELD_KEYS.XML,
  shp: MAP_V2_FIELD_KEYS.SHP,
  kml: MAP_V2_FIELD_KEYS.KML,
};

const MAP_FILE_TYPE_LABELS: Record<MapFileType, string> = {
  xml: "XML",
  shp: "Shape",
  kml: "KML",
};

export function mapFileTypeFromUploadTitle(
  fileName: string
): MapFileType | null {
  const lower = fileName.toLowerCase();
  if (lower.includes("xml_file")) return "xml";
  if (lower.includes("shape_file")) return "shp";
  if (lower.includes("kml_file")) return "kml";
  return null;
}

export function getMapV2FieldKeyForType(fileType: MapFileType): MapV2FieldKey {
  return FILE_TYPE_TO_V2_KEY[fileType];
}

export function getMapFileTypeLabel(fileType: MapFileType): string {
  return MAP_FILE_TYPE_LABELS[fileType];
}

export function getMapFileDeleteSuccessMessage(fileType: MapFileType): string {
  return `${MAP_FILE_TYPE_LABELS[fileType]} file deleted successfully`;
}

interface MapEntitySlice {
  xmlmap?: { id: number } | null;
  shpmap?: { id: number } | null;
  kmlmap?: { id: number } | null;
  xmlmap_v2?: Array<{ id: number }>;
  shpmap_v2?: Array<{ id: number }>;
  kmlmap_v2?: Array<{ id: number }>;
}

type LegacyMapFieldKey = "xmlmap" | "shpmap" | "kmlmap";
type V2MapFieldKey = "xmlmap_v2" | "shpmap_v2" | "kmlmap_v2";

const LEGACY_MAP_FIELD: Record<MapFileType, LegacyMapFieldKey> = {
  xml: "xmlmap",
  shp: "shpmap",
  kml: "kmlmap",
};

const V2_MAP_FIELD: Record<MapFileType, V2MapFieldKey> = {
  xml: "xmlmap_v2",
  shp: "shpmap_v2",
  kml: "kmlmap_v2",
};

export function entityHasMapFileInV2(
  entity: MapEntitySlice,
  fileType: MapFileType,
  mapId: number
): boolean {
  const v2Field = V2_MAP_FIELD[fileType];
  const entries = entity[v2Field];
  return Array.isArray(entries) && entries.some((entry) => entry.id === mapId);
}

export function removeMapFileFromEntityState<T extends MapEntitySlice>(
  prev: T,
  fileType: MapFileType,
  mapId: number,
  deletedViaV2: boolean
): T {
  const legacyKey = LEGACY_MAP_FIELD[fileType];
  const v2Key = V2_MAP_FIELD[fileType];

  if (deletedViaV2) {
    const v2Entries = prev[v2Key];
    const legacyEntry = prev[legacyKey];
    return {
      ...prev,
      [v2Key]: Array.isArray(v2Entries)
        ? v2Entries.filter((entry) => entry.id !== mapId)
        : v2Entries,
      [legacyKey]: legacyEntry?.id === mapId ? null : legacyEntry,
    };
  }

  return { ...prev, [legacyKey]: null };
}

export interface MapFileEntry {
  id: number;
  file: string;
  data?: unknown;
}

interface MapUploadResultEntry {
  file: string;
  message: string;
}

interface MapUploadResultsByField {
  succeeded: MapUploadResultEntry[];
  failed: MapUploadResultEntry[];
}

const LEGACY_MAP_FILE_KEYS: Record<string, string> = {
  xmlmap: "xmlmap.file",
  shpmap: "shpmap.file",
  kmlmap: "kmlmap.file",
};

function dedupeMapEntries(
  legacy: MapFileEntry | null | undefined,
  v2: MapFileEntry[] | undefined
): MapFileEntry[] {
  const maps: MapFileEntry[] = [];
  const seen = new Set<number>();
  if (legacy?.id != null) {
    maps.push(legacy);
    seen.add(legacy.id);
  }
  for (const entry of v2 ?? []) {
    if (entry?.id != null && !seen.has(entry.id)) {
      maps.push(entry);
      seen.add(entry.id);
    }
  }
  return maps;
}

export function collectXmlMaps(entity: {
  xmlmap?: MapFileEntry | null;
  xmlmap_v2?: MapFileEntry[];
}): MapFileEntry[] {
  return dedupeMapEntries(entity.xmlmap, entity.xmlmap_v2);
}

export function collectShpMaps(entity: {
  shpmap?: MapFileEntry | null;
  shpmap_v2?: MapFileEntry[];
}): MapFileEntry[] {
  return dedupeMapEntries(entity.shpmap, entity.shpmap_v2);
}

export function collectKmlMaps(entity: {
  kmlmap?: MapFileEntry | null;
  kmlmap_v2?: MapFileEntry[];
}): MapFileEntry[] {
  return dedupeMapEntries(entity.kmlmap, entity.kmlmap_v2);
}

export function getMapFileDisplayName(
  fileUrl: string | undefined,
  fallback: string
): string {
  if (!fileUrl) return fallback;
  const raw = (fileUrl.split("/").pop() ?? "").split("?")[0];
  const withoutExt = raw.replace(/\.[^.]+$/, "");
  return withoutExt || fallback;
}

export function buildMapUploadFormData(
  values: Record<string, unknown>
): FormData {
  const formData = new FormData();

  Object.keys(values).forEach((key) => {
    const value = values[key];

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item instanceof File) {
          formData.append(key, item);
        }
      });
      return;
    }

    if (value instanceof File) {
      formData.append(LEGACY_MAP_FILE_KEYS[key] ?? key, value);
      return;
    }

    if (
      value === null &&
      (key === "xmlmap" || key === "shpmap" || key === "kmlmap")
    ) {
      formData.append(key, "null");
      return;
    }

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      formData.append(key, String(value));
    }
  });

  return formData;
}

export function showMapUploadResults(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  const results = (
    data as { map_upload_results?: Record<string, MapUploadResultsByField> }
  ).map_upload_results;
  if (!results) return false;

  const failedMessages: string[] = [];
  let anySucceeded = false;

  for (const fieldResults of Object.values(results)) {
    anySucceeded = anySucceeded || fieldResults.succeeded.length > 0;
    for (const entry of fieldResults.failed) {
      failedMessages.push(`${entry.file}: ${entry.message}`);
    }
  }

  if (failedMessages.length > 0) {
    toast.error(`Some files were not uploaded:\n${failedMessages.join("\n")}`);
  }

  return anySucceeded;
}

export function toUploadFileArray(file: File | File[]): File[] {
  return Array.isArray(file) ? file : [file];
}
