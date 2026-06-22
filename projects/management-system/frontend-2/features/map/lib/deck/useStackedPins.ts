import { useMemo } from "react";

import type { MapPoint } from "../../model/types";
import type { DeckMarkerDatum } from "./useDeckMarkerData";

export interface StackedGroup {
  position: MapPoint;
  items: DeckMarkerDatum[];
}

export interface UseStackedPinsResult {
  singlePins: DeckMarkerDatum[];
  stackedGroups: StackedGroup[];
}

export function useStackedPins(pins: DeckMarkerDatum[]): UseStackedPinsResult {
  return useMemo(() => {
    const contacts = pins.filter((p) => p.markerKind === "contact");
    const jobLeadPins = pins.filter((p) => p.markerKind !== "contact");

    const byCoord = new Map<string, DeckMarkerDatum[]>();

    for (const pin of jobLeadPins) {
      const [lng, lat] = pin.position;
      const key = `${lng.toFixed(6)},${lat.toFixed(6)}`;
      const existing = byCoord.get(key);
      if (existing) {
        existing.push(pin);
      } else {
        byCoord.set(key, [pin]);
      }
    }

    const singlePins: DeckMarkerDatum[] = [...contacts];
    const stackedGroups: StackedGroup[] = [];

    for (const group of byCoord.values()) {
      if (group.length === 1) {
        singlePins.push(group[0]);
      } else {
        stackedGroups.push({
          position: group[0].position,
          items: group,
        });
      }
    }

    return { singlePins, stackedGroups };
  }, [pins]);
}
