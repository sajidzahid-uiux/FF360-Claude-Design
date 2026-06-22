import type { VendorFormJobCorePoint, VendorFormV2 } from "@/api/types";
import type {
  GeoLatLng,
  GeoLatLngNullable,
  VertexRings,
} from "@/api/types/geo";
import { transformVertices } from "@/features/job-lead/ui/show-more-card/utils/vertexTransform";

import {
  type FarmSelectorItem,
  deriveJobFarmMapProps,
} from "./jobFarmMapUtils";

export type { FarmSelectorItem };

export interface OrderPipeBoundaryMapProps {
  vertexRings: VertexRings;
  primaryRingIndex: number | undefined;
  location: GeoLatLng | undefined;
  secondaryFarmPins: GeoLatLng[];
  farmSelectorItems: FarmSelectorItem[];
  corePoints: Array<
    Pick<
      VendorFormJobCorePoint,
      "id" | "name" | "description" | "latitude" | "longitude"
    >
  >;
}

export type OrderPipeLocationFallback = GeoLatLngNullable | undefined;

type VendorWithLocation =
  | { lat?: number | null; long?: number | null }
  | null
  | undefined;

export function getSelectedVendorMapLocation(
  vendor: VendorWithLocation
): OrderPipeLocationFallback {
  if (vendor?.lat == null || vendor?.long == null) return undefined;
  const lat = Number(vendor.lat);
  const lng = Number(vendor.long);
  return Number.isFinite(lat) && Number.isFinite(lng)
    ? { lat, lng }
    : undefined;
}

function getPrimaryFarmLocation(order: VendorFormV2): GeoLatLng | undefined {
  const farms = order.job_farms;
  if (farms?.length) {
    const primary = farms.find((f) => f.is_primary) ?? farms[0];
    if (
      primary.latitude != null &&
      primary.longitude != null &&
      Number.isFinite(primary.latitude) &&
      Number.isFinite(primary.longitude)
    ) {
      return { lat: primary.latitude, lng: primary.longitude };
    }
  }

  const boundaries = order.job_field_boundaries;
  if (
    boundaries?.latitude != null &&
    boundaries?.longitude != null &&
    Number.isFinite(boundaries.latitude) &&
    Number.isFinite(boundaries.longitude)
  ) {
    return { lat: boundaries.latitude, lng: boundaries.longitude };
  }

  return undefined;
}

export function getOrderPipeBoundaryMapProps(
  order: VendorFormV2 | null | undefined,
  fallbackLocation?: OrderPipeLocationFallback
): OrderPipeBoundaryMapProps {
  const empty: OrderPipeBoundaryMapProps = {
    vertexRings: [],
    primaryRingIndex: undefined,
    location: undefined,
    secondaryFarmPins: [],
    farmSelectorItems: [],
    corePoints: [],
  };
  if (!order) return empty;

  const jobFarms = order.job_farms ?? [];
  const {
    secondaryFarmPins,
    farmSelectorItems,
    primaryRingIndex,
    vertexRings: farmVertexRings,
  } = deriveJobFarmMapProps(jobFarms);

  let vertexRings = farmVertexRings;
  if (!jobFarms.length) {
    const boundaries = order.job_field_boundaries;
    const rawVertices = Array.isArray(boundaries?.vertices)
      ? boundaries.vertices
      : [];
    const transformedVertices =
      rawVertices.length >= 3 ? transformVertices(rawVertices) : undefined;
    if (transformedVertices != null && transformedVertices.length >= 3) {
      vertexRings = [transformedVertices];
    }
  }

  const locationFromPrimary = getPrimaryFarmLocation(order);
  const locationFromVendor =
    order.vendor?.lat != null && order.vendor?.long != null
      ? { lat: order.vendor.lat, lng: order.vendor.long }
      : undefined;
  const hasValidFallback =
    fallbackLocation != null &&
    typeof fallbackLocation.lat === "number" &&
    typeof fallbackLocation.lng === "number" &&
    Number.isFinite(fallbackLocation.lat) &&
    Number.isFinite(fallbackLocation.lng);
  const location =
    locationFromPrimary ??
    locationFromVendor ??
    (hasValidFallback
      ? { lat: fallbackLocation.lat, lng: fallbackLocation.lng }
      : undefined);

  const corePoints = (order.job_core_points ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description ?? undefined,
    latitude: p.latitude,
    longitude: p.longitude,
  }));

  return {
    vertexRings,
    primaryRingIndex,
    location,
    secondaryFarmPins,
    farmSelectorItems,
    corePoints,
  };
}
