import type {
  Contact,
  MapFarmEntry,
  MapJob,
  MapLead,
  StakeholderFarm,
} from "@/api/types";
import type {
  GeoBoundsLiteral,
  GeoCoordinateParseResult,
  GeoLatLng,
  GeoLatLngAsyncHandler,
  GeoLatLngClickHandler,
  GeoLatLngHandler,
  GeoLngLatPath,
  GeoLngLatTuple,
} from "@/api/types/geo";

import type { MapPinItem } from "./mapPinItem";

export type {
  GeoBoundsLiteral,
  GeoCoordinateParseResult,
  GeoLatLng,
  GeoLatLngAsyncHandler,
  GeoLatLngClickHandler,
  GeoLatLngHandler,
  GeoLngLatPath,
  GeoLngLatTuple,
  VertexRing,
  VertexRings,
} from "@/api/types/geo";

/** @deprecated Prefer `GeoLatLng` from `@/api/types`. */
export type LatLng = GeoLatLng;

/** @deprecated Prefer `GeoLatLng`. */
export type MapLocation = GeoLatLng;

/** @deprecated Prefer `GeoCoordinateParseResult`. */
export type MapCoordinateParseResult = GeoCoordinateParseResult;

/** @deprecated Prefer `GeoLatLngHandler`. */
export type MapLatLngHandler = GeoLatLngHandler;

/** @deprecated Prefer `GeoLatLngClickHandler`. */
export type MapLatLngClickHandler = GeoLatLngClickHandler;

/** @deprecated Prefer `GeoLatLngAsyncHandler`. */
export type MapLatLngAsyncHandler = GeoLatLngAsyncHandler;

/** Async pin placement with required category. */
export type MapPinAddAsyncHandler = (
  lat: number,
  lng: number,
  categoryId: number
) => Promise<void>;

export interface MapPinCreateFormData {
  categoryId: number;
  lat: number;
  lng: number;
  label?: string;
}

export type MapPinCreateSubmitHandler = (
  data: MapPinCreateFormData
) => Promise<void>;

export type MapPinPlacementMode = "map" | "current" | "manual";

/** Read-only map layers shown in the add-pin picker (boundaries, existing pins, etc.). */
export interface DeckMapLayerContext {
  vertices?: GeoLatLng[];
  vertexRings?: GeoLatLng[][];
  primaryRingIndex?: number;
  secondaryFarmPins?: GeoLatLng[];
  location?: GeoLatLng;
  shpmap?: { data?: unknown };
  xmlmap?: { data?: unknown };
  kmlmap?: { data?: unknown };
  mapPins?: MapPinItem[];
  organizationLocation?: GeoLatLng | null;
}

/** Dropdown item from Google Places Autocomplete. */
export interface MapPlacePrediction {
  description: string;
  place_id: string;
}

/** Geographic coordinate tuple [lng, lat] (deck.gl convention). */
export type MapPoint = GeoLngLatTuple;

/** Path or ring of {@link MapPoint} tuples. */
export type MapPointPath = GeoLngLatPath;

/** XML geometry section from backend design files. */
export interface MapXmlSection {
  points: MapPointPath;
  color?: string;
  pipe_size?: Record<string, unknown>;
}

/** XML sections keyed by name (e.g. `default`, pipe run ids). */
export type MapXmlSections = Record<string, MapXmlSection>;

/** SHP layer rings keyed by section name. */
export type ShpLayerData = Record<string, MapPointPath>;

/** @deprecated Prefer `GeoBoundsLiteral`. */
export type MapBounds = GeoBoundsLiteral;

/** Farm pin/selector row — UI aliases over {@link StakeholderFarm}. */
export type FarmSelectorItem = Pick<
  StakeholderFarm,
  "id" | "name" | "vertices"
> & {
  isPrimary: StakeholderFarm["is_primary"];
  lat: NonNullable<StakeholderFarm["latitude"]>;
  lng: NonNullable<StakeholderFarm["longitude"]>;
};

/** Popup farm row derived from {@link MapFarmEntry}. */
export type MapMarkerFarm = Pick<
  MapFarmEntry,
  "farm_id" | "farm_name" | "is_primary"
>;

type MapMarkerJobLeadFields = Partial<
  Pick<
    MapJob,
    | "id"
    | "latitude"
    | "longitude"
    | "farm_name"
    | "po_number"
    | "job_type"
    | "project_type"
    | "farms"
  >
> &
  Partial<Pick<MapJob, "job_status">> &
  Partial<Pick<MapLead, "lead_status" | "lead_type">>;

type MapMarkerContactFields = Partial<
  Pick<
    Contact,
    | "full_name"
    | "company_name"
    | "phone_number"
    | "email"
    | "street_address"
    | "city"
    | "state"
  >
>;

/** Unified marker data shape used across the map feature (popup, layers, click handlers). */
export type MapMarkerData = MapMarkerJobLeadFields &
  MapMarkerContactFields & {
    id: number;
    latitude: number;
    longitude: number;
    object_type: "job" | "lead" | "contact";
    title?: string;
    farm_management_contact_name?: string | null;
    customer_phone_number?: string;
    icon_svg?: string;
    highlighted_farm_id?: number;
  };
