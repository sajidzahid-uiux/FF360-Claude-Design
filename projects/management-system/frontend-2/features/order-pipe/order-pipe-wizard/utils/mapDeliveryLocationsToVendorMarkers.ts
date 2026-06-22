import type { DeliveryLocation } from "@/api/types";
import type { VendorMarker } from "@/shared/ui/common/map";

export function mapDeliveryLocationsToVendorMarkers(
  deliveryLocations: DeliveryLocation[]
): VendorMarker[] {
  return deliveryLocations.map((loc) => ({
    id: loc.id,
    lat: loc.lat,
    long: loc.lng,
    name: `Location ${loc.sequence}`,
  }));
}
