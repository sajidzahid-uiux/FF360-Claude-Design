import type {
  GeoLatLng,
  GeoLatLngHandler,
  GeoLatLngNullable,
  VertexRings,
} from "@/api/types/geo";
import type { MapPinItem } from "@/features/map/model/mapPinItem";
import type { FarmSelectorItem } from "@/features/map/model/types";
import type { XmlMapData } from "@/shared/ui/common/XmlGeometriesLayer";

export interface ShpMapData {
  id: number;
  file: string;
  data: {
    [key: string]: [number, number][];
  };
}

export interface KmlMapData {
  id: number;
  file: string;
  data?: unknown;
}

export interface CorePoint {
  id?: number;
  name?: string;
  description?: string;
  latitude: number;
  longitude: number;
}

export type VendorMarkerType = "exact" | "approximate";

export interface VendorMarker {
  id: number;
  lat: number;
  long: number;
  name: string;
  markerType?: VendorMarkerType;
}

export interface BoundaryMapProps {
  vertices?: GeoLatLng[];
  location?: GeoLatLng;
  onChangeVertices: (vertices: GeoLatLng[]) => void;
  onChangeLocation: (location: GeoLatLng) => void;
  shpmap?: ShpMapData;
  xmlmap?: XmlMapData;
  kmlmap?: KmlMapData;
  className?: string;
  mapHeight?: string | number;
  hideSearch?: boolean;
  hideActionMenu?: boolean;
  readOnly?: boolean;
  triggerCenterOnUserLocation?: boolean;
  userLocation?: GeoLatLngNullable;
  organizationLocation?: GeoLatLngNullable;
  showCorePoints?: boolean;
  corePoints?: CorePoint[];
  onCoreSubmit?: (corePoint: CorePoint) => void;
  onCoreDelete?: (coreId: number) => void;
  canEditCorePoints?: boolean;
  children?: React.ReactNode;
  vendorMarkers?: VendorMarker[];
  selectedVendorId?: number;
  favoriteVendorIds?: number[];
  goldenOnlyWhenFavorite?: boolean;
  onVendorMarkerClick?: (marker: VendorMarker) => void;
  onMapClick?: GeoLatLngHandler;
  showVendorMarkerLabels?: boolean;
  showLocationWithVendorMarkers?: boolean;
  onUserLocationChange?: (location: GeoLatLngNullable) => void;
  mapPins?: MapPinItem[];
  isPinMode?: boolean;
  onPinAdd?: GeoLatLngHandler;
  onPinDelete?: (pinId: number) => void;
  vertexRings?: VertexRings;
  primaryRingIndex?: number;
  secondaryFarmPins?: GeoLatLng[];
  farmSelectorItems?: FarmSelectorItem[];
}

export interface BoundaryMapRef {
  centerOnShpMap: (shpmap: ShpMapData) => void;
  centerOnXmlMap: (xmlmap: XmlMapData) => void;
  centerOnKmlMap: (kmlmap: KmlMapData) => void;
  centerOnUserLocation: () => void;
  centerOnOrganizationLocation: () => void;
  centerOnLocation: GeoLatLngHandler;
  startCorePointMode: () => void;
  cancelCorePointMode: () => void;
  isCorePointMode: () => boolean;
  prepareCorePointAtLocation: GeoLatLngHandler;
}

export type { MapPinItem, XmlMapData };
