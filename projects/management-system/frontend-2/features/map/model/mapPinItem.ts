import type { MapPin } from "@/api/types/mapPin";
import { DEFAULT_PIN_CATEGORY_COLOR } from "@/features/pin-categories/lib/pinCategoryColors";

export interface MapPinItem {
  id: number;
  name: string;
  label?: string;
  latitude: number;
  longitude: number;
  categoryId: number;
  categoryName: string;
  categoryColor: string;
}

export function mapPinToMapPinItem(pin: MapPin): MapPinItem {
  const trimmedLabel = pin.label?.trim();
  return {
    id: pin.id,
    name: pin.name,
    label: trimmedLabel || undefined,
    latitude: pin.latitude,
    longitude: pin.longitude,
    categoryId: pin.category_id ?? pin.category?.id ?? 0,
    categoryName: pin.category?.name ?? "Uncategorized",
    categoryColor: pin.category?.color ?? DEFAULT_PIN_CATEGORY_COLOR,
  };
}
