/**
 * KML file validation error result
 */
export interface KmlValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Pipe size metadata from KML placemarks
 */
export interface PipeSize {
  length?: number;
  pipe_od?: number;
  pipe_size?: number;
  pipe_type?: string;
  min_depth?: number;
  max_depth?: number;
  min_slope?: number;
  max_slope?: number;
  optimal_depth?: number;
  outlet_depth?: number;
  outlet_elevation?: number;
  tile_perforation?: string;
}

/**
 * Geometry type for KML features
 */
export type GeometryType = "Point" | "LineString" | "Polygon";

/**
 * Parsed KML geometry ready for rendering
 */
export interface KmlGeometry {
  type: GeometryType;
  coordinates: number[][];
  name?: string;
  description?: string;
  color?: string;
  uniqueId?: string;
  pipe_size?: PipeSize;
}

/**
 * Backend geometry structure
 */
export type BackendGeom = {
  type: GeometryType;
  coordinates: Array<[number, number]>; // [longitude, latitude]
};

/**
 * Style information for KML placemarks
 */
export type KmlStyle = {
  color?: string; // Hex color (e.g., "#FF0000")
  width?: number; // Line width (usually in pixels)
  opacity?: number; // Stroke opacity (0-1)
};

/**
 * Backend placemark structure (Variant 2: Direct Placemark Feature Object)
 */
export type BackendPlacemark = {
  name?: string;
  description?: string;
  pipe_size?: PipeSize;
  style?: KmlStyle;
  geometry?: BackendGeom;
};

/**
 * Backend KML data can be in three formats:
 * 1. Single placemark object (Variant 2)
 * 2. Array of placemarks (Variant 2)
 * 3. Keyed object with placemark keys (Variant 1: "placemark_1_geom_1": { ... })
 */
export type BackendKmlData =
  | BackendPlacemark
  | BackendPlacemark[]
  | Record<string, BackendPlacemark>;

/**
 * Maximum allowed file size for KML files (50MB)
 */
const MAX_KML_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

/**
 * Number of bytes to read for initial structure validation
 */
const STRUCTURE_CHECK_SIZE = 1024; // 1KB

/**
 * Validates KML file extension
 * @param fileName - Name of the file to validate
 * @returns Error message if invalid, undefined if valid
 */
export const validateKmlFileExtension = (
  fileName: string
): string | undefined => {
  if (!fileName.toLowerCase().endsWith(".kml")) {
    return "Invalid file type. Only .kml files are allowed.";
  }
  return undefined;
};

/**
 * Validates KML file size
 * @param fileSize - Size of the file in bytes
 * @param maxSize - Maximum allowed size in bytes (default: 50MB)
 * @returns Error message if invalid, undefined if valid
 */
export const validateKmlFileSize = (
  fileSize: number,
  maxSize: number = MAX_KML_FILE_SIZE
): string | undefined => {
  if (fileSize > maxSize) {
    return "File size exceeds 50MB limit. Please upload a smaller file.";
  }
  return undefined;
};

/**
 * Validates KML file structure by checking XML format and KML elements
 * @param file - File object to validate
 * @returns Promise resolving to error message if invalid, undefined if valid
 */
export const validateKmlFileStructure = async (
  file: File
): Promise<string | undefined> => {
  try {
    // Read first 1KB to check structure without consuming the entire file
    const fileSlice = file.slice(0, STRUCTURE_CHECK_SIZE);
    const fileText = await fileSlice.text();
    const kmlContent = fileText.trim();

    // Check if it's valid XML structure
    if (!kmlContent.startsWith("<?xml") && !kmlContent.startsWith("<kml")) {
      return "Invalid KML file. File must be valid XML format.";
    }

    // Check for KML namespace or kml element
    if (!kmlContent.includes("kml") && !kmlContent.includes("xmlns")) {
      return "Invalid KML file. File must contain KML elements.";
    }

    return undefined;
  } catch (error) {
    console.error(error);
    return "Failed to validate KML file structure. Please check the file format.";
  }
};

/**
 * Validates a KML file (extension, size, and structure)
 * @param file - File object to validate
 * @param options - Optional validation options
 * @returns Promise resolving to validation result with error message if invalid
 */
export const validateKmlFile = async (
  file: File,
  options?: {
    maxSize?: number;
    skipStructureCheck?: boolean;
  }
): Promise<KmlValidationResult> => {
  // Validate file extension
  const extensionError = validateKmlFileExtension(file.name);
  if (extensionError) {
    return { isValid: false, error: extensionError };
  }

  // Validate file size
  const maxSize = options?.maxSize ?? MAX_KML_FILE_SIZE;
  const sizeError = validateKmlFileSize(file.size, maxSize);
  if (sizeError) {
    return { isValid: false, error: sizeError };
  }

  // Validate file structure (unless skipped)
  if (!options?.skipStructureCheck) {
    const structureError = await validateKmlFileStructure(file);
    if (structureError) {
      return { isValid: false, error: structureError };
    }
  }

  return { isValid: true };
};

/**
 * Supported geometry types for KML rendering
 */
const SUPPORTED_TYPES: readonly GeometryType[] = [
  "Point",
  "LineString",
  "Polygon",
] as const;

/**
 * Type guard to check if value is an object
 */
const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

/**
 * Type guard to check if value is a supported geometry type
 */
const isSupportedType = (t: unknown): t is GeometryType =>
  typeof t === "string" && (SUPPORTED_TYPES as readonly string[]).includes(t);

/**
 * Converts backend KML data to an array of placemarks
 * Handles all three data variants: single object, array, or keyed object
 */
const toPlacemarkArray = (data: unknown): BackendPlacemark[] => {
  if (!data) return [];

  if (Array.isArray(data)) {
    return data.filter(isObject) as BackendPlacemark[];
  }

  if (!isObject(data)) return [];

  if ("geometry" in data) return [data as BackendPlacemark];

  // Keyed placemarks
  return Object.values(data).filter(isObject) as BackendPlacemark[];
};

/**
 * Normalizes coordinates based on geometry type
 * @param type - Geometry type (Point, LineString, or Polygon)
 * @param coords - Raw coordinates from backend
 * @returns Normalized coordinate array or null if invalid
 */
const normalizeCoordinates = (
  type: GeometryType,
  coords: unknown
): number[][] | null => {
  if (type === "Point") {
    if (
      Array.isArray(coords) &&
      coords.length === 2 &&
      coords.every((n) => typeof n === "number")
    ) {
      return [coords as number[]]; // wrap single pair
    }
    return null;
  }

  if (!Array.isArray(coords)) return null;

  // LineString/Polygon: array of [lng, lat] pairs
  const pairs = coords.filter(
    (p) =>
      Array.isArray(p) &&
      p.length === 2 &&
      p.every((n) => typeof n === "number")
  ) as number[][];

  return pairs.length ? pairs : null;
};

/**
 * Parses backend KML data and extracts geometries for rendering
 * @param data - Backend KML data (can be single placemark, array, or keyed object)
 * @returns Array of parsed KML geometries ready for map rendering
 */
export const parseBackendKml = (data: unknown): KmlGeometry[] => {
  const placemarks = toPlacemarkArray(data);

  return placemarks.flatMap((p) => {
    const g = p.geometry;
    if (!g || !isSupportedType(g.type)) return [];

    const coords = normalizeCoordinates(g.type, g.coordinates);
    if (!coords) return [];

    return [
      {
        type: g.type,
        coordinates: coords,
        name: p.name,
        description: p.description,
        color: p.style?.color,
        pipe_size: p.pipe_size,
      } satisfies KmlGeometry,
    ];
  });
};
