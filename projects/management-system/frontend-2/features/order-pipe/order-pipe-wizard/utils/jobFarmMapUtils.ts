import type { StakeholderFarm, VendorFormJobFarm } from "@/api/types";
import type { GeoLatLng, VertexRings } from "@/api/types/geo";
import { transformVertices } from "@/features/job-lead/ui/show-more-card/utils/vertexTransform";
import type { FarmSelectorItem } from "@/features/map/types";

export type { FarmSelectorItem };

export interface JobFarmMapDerivedProps {
  secondaryFarmPins: GeoLatLng[];
  primaryRingIndex: number | undefined;
  farmSelectorItems: FarmSelectorItem[];
  vertexRings: VertexRings;
}

function deriveFromFarmList(
  farms: {
    id: number;
    name: string;
    is_primary: boolean;
    latitude?: number | null;
    longitude?: number | null;
    vertices?: unknown;
  }[]
): JobFarmMapDerivedProps {
  const secondaryFarmPins: GeoLatLng[] = [];
  const farmSelectorItems: FarmSelectorItem[] = [];
  const vertexRings: VertexRings = [];
  let primaryRingIndex: number | undefined;

  for (const farm of farms) {
    const rawVertices = Array.isArray(farm.vertices) ? farm.vertices : [];
    const transformedVertices =
      rawVertices.length >= 3 ? transformVertices(rawVertices) : undefined;
    const hasRing =
      transformedVertices != null && transformedVertices.length >= 3;

    const hasCenter =
      farm.latitude != null &&
      farm.longitude != null &&
      Number.isFinite(farm.latitude) &&
      Number.isFinite(farm.longitude);

    if (hasCenter) {
      const lat = Number(farm.latitude);
      const lng = Number(farm.longitude);
      if (farm.is_primary) {
        farmSelectorItems.unshift({
          id: farm.id,
          name: farm.name,
          isPrimary: true,
          lat,
          lng,
          vertices: hasRing ? transformedVertices : undefined,
        });
      } else {
        secondaryFarmPins.push({ lat, lng });
        farmSelectorItems.push({
          id: farm.id,
          name: farm.name,
          isPrimary: false,
          lat,
          lng,
          vertices: hasRing ? transformedVertices : undefined,
        });
      }
    }

    if (hasRing) {
      if (farm.is_primary) {
        primaryRingIndex = vertexRings.length;
      }
      vertexRings.push(transformedVertices);
    }
  }

  return {
    secondaryFarmPins,
    primaryRingIndex,
    farmSelectorItems,
    vertexRings,
  };
}

export function deriveJobFarmMapProps(
  jobFarms: VendorFormJobFarm[]
): JobFarmMapDerivedProps {
  return deriveFromFarmList(jobFarms);
}

export function deriveStakeholderFarmMapProps(
  farms: StakeholderFarm[]
): JobFarmMapDerivedProps {
  return deriveFromFarmList(farms);
}
