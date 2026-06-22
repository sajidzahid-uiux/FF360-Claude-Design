import type { RecordContact, RecordFarm, StakeholderFarm } from "@/api/types";
import type { Vertex } from "@/api/types/common";

import { validateFarmsBelongToContacts } from "./stakeholderPayload";

function toCoordinate(value: number | string | undefined): number | undefined {
  if (value == null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function toLngLatRing(
  vertices: RecordFarm["vertices"]
): [number, number][] | null | undefined {
  if (!vertices?.length) return undefined;

  const ring = vertices.map((vertex): [number, number] => {
    if (Array.isArray(vertex)) {
      return [Number(vertex[0]), Number(vertex[1])];
    }
    const point = vertex as Vertex;
    return [Number(point.lat), Number(point.lng)];
  });

  return ring.every(
    ([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng)
  )
    ? ring
    : undefined;
}

/** Contact that owns the farm shown on the map (`farm_info` matched in `farms[]`). */
export function resolveFarmOwnerContactId(
  farms: StakeholderFarm[] | undefined,
  farmInfoId: number | undefined,
  fallbackContactId?: number
): number | undefined {
  if (farms && farms.length > 0) {
    const byFarmInfo =
      farmInfoId != null ? farms.find((f) => f.id === farmInfoId) : undefined;
    if (byFarmInfo?.contact_id != null) return byFarmInfo.contact_id;

    const primary = farms.find((f) => f.is_primary);
    if (primary?.contact_id != null) return primary.contact_id;
  }

  return fallbackContactId;
}
export function buildContactNameById(
  contacts: RecordContact[],
  selectedIds: number[]
): Record<number, string> {
  const map: Record<number, string> = {};
  for (const id of selectedIds) {
    const contact = contacts.find((c) => c.id === id);
    if (contact) {
      map[id] = contact.full_name?.trim() || `Client #${id}`;
    } else {
      map[id] = `Client #${id}`;
    }
  }
  return map;
}

export function pruneFarmIdsForContacts(
  farmIds: number[],
  farms: RecordFarm[],
  contactIds: number[]
): number[] {
  const contactSet = new Set(contactIds);
  return farmIds.filter((farmId) => {
    const farm = farms.find((f) => f.id === farmId);
    return farm != null && contactSet.has(farm.contact_id);
  });
}

export function getPrimaryFarmGeo(
  farmIds: number[],
  farms: RecordFarm[]
): {
  latitude?: number;
  longitude?: number;
  vertices?: [number, number][] | null;
} {
  const primaryId = farmIds[0];
  if (primaryId == null) return {};
  const farm = farms.find((f) => f.id === primaryId);
  if (!farm) return {};
  return {
    latitude: toCoordinate(farm.latitude),
    longitude: toCoordinate(farm.longitude),
    vertices: toLngLatRing(farm.vertices),
  };
}

export function validateStakeholderFormSelection(
  contactIds: number[],
  farmIds: number[],
  farms: RecordFarm[]
): string | null {
  if (contactIds.length === 0) {
    return "Please select at least one client.";
  }
  if (farmIds.length === 0) return null;
  const valid = validateFarmsBelongToContacts(
    farmIds.map((farmId) => {
      const farm = farms.find((f) => f.id === farmId);
      return {
        farmId,
        contactId: farm?.contact_id ?? -1,
      };
    }),
    contactIds
  );
  if (!valid) {
    return "Each farm must belong to one of the selected clients.";
  }
  return null;
}

export function parseUrlIdParam(param: string | null): number | undefined {
  if (!param) return undefined;
  const id = parseInt(param, 10);
  return Number.isNaN(id) || id <= 0 ? undefined : id;
}
