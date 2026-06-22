import type { MapPlacePrediction } from "../model/types";

export function toMapPlacePredictions(
  preds: google.maps.places.AutocompletePrediction[] | null
): MapPlacePrediction[] {
  if (!preds) return [];
  return preds.map((p) => ({
    description: p.description,
    place_id: p.place_id,
  }));
}
