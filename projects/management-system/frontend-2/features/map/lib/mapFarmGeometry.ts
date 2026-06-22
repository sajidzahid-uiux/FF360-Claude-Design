import type { MapFarmEntry } from "@/api/types";
import type { VertexRings } from "@/api/types/geo";
import { transformVertices } from "@/features/job-lead/ui/show-more-card/utils/vertexTransform";

import type { MapMarkerFarm } from "../model/types";

export type MapItemWithFarms = {
  vertices?: unknown;
  farm_id?: number;
  farm_name?: string;
  farms?: MapFarmEntry[];
};

/** Polygon rings for deck.gl — all farms when `farms` is set, else legacy top-level `vertices`. */
export function collectMapItemFarmVertices(
  item: MapItemWithFarms
): VertexRings {
  const result: VertexRings = [];

  if (item.farms?.length) {
    for (const farm of item.farms) {
      if (
        !farm.vertices ||
        !Array.isArray(farm.vertices) ||
        farm.vertices.length < 3
      ) {
        continue;
      }
      const ring = transformVertices(farm.vertices);
      if (ring.length >= 3) {
        result.push(ring);
      }
    }
    return result;
  }

  if (
    item.vertices &&
    Array.isArray(item.vertices) &&
    item.vertices.length >= 3
  ) {
    const ring = transformVertices(item.vertices);
    if (ring.length >= 3) {
      result.push(ring);
    }
  }

  return result;
}

export function toMapMarkerFarms(
  item: MapItemWithFarms
): MapMarkerFarm[] | undefined {
  if (item.farms?.length) {
    return item.farms.map((farm) => ({
      farm_id: farm.farm_id,
      farm_name: farm.farm_name,
      is_primary: farm.is_primary,
    }));
  }

  if (item.farm_id != null && item.farm_name) {
    return [
      {
        farm_id: item.farm_id,
        farm_name: item.farm_name,
        is_primary: true,
      },
    ];
  }

  return undefined;
}

/** Primary farm first, then alphabetical by name. */
export function sortMapMarkerFarms(farms: MapMarkerFarm[]): MapMarkerFarm[] {
  return [...farms].sort((a, b) => {
    if (a.is_primary !== b.is_primary) {
      return a.is_primary ? -1 : 1;
    }
    return a.farm_name.localeCompare(b.farm_name);
  });
}
