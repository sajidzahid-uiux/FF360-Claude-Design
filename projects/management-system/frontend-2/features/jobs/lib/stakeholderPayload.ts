import type { StakeholderPayloadFields } from "@/api/types";

export interface BuildStakeholderPayloadInput {
  contactIds?: number[];
  farmIds?: number[];
  primaryContactId?: number | null;
  primaryFarmId?: number | null;
}

export interface FarmContactValidationInput {
  farmId: number;
  contactId: number;
}

/**
 * Ensures every selected farm belongs to one of the selected contacts.
 */
export function validateFarmsBelongToContacts(
  farms: FarmContactValidationInput[],
  contactIds: number[]
): boolean {
  if (farms.length === 0) return true;
  const contactSet = new Set(contactIds);
  return farms.every((f) => contactSet.has(f.contactId));
}

/**
 * Builds API stakeholder fields for create/update.
 * First id in each array is primary when primary_* is omitted.
 */
export function buildStakeholderPayload(
  input: BuildStakeholderPayloadInput
): StakeholderPayloadFields {
  const contactIds = input.contactIds ? [...input.contactIds] : undefined;
  const farmIds = input.farmIds ? [...input.farmIds] : undefined;

  const payload: StakeholderPayloadFields = {};

  if (contactIds !== undefined) {
    payload.contact_ids = contactIds;
    const primaryContactId =
      input.primaryContactId ?? (contactIds.length > 0 ? contactIds[0] : null);
    if (primaryContactId != null) {
      payload.primary_contact_id = primaryContactId;
    }
  }

  if (farmIds !== undefined) {
    payload.farm_ids = farmIds;
    const primaryFarmId =
      input.primaryFarmId ?? (farmIds.length > 0 ? farmIds[0] : null);
    if (primaryFarmId != null) {
      payload.primary_farm_id = primaryFarmId;
    }
  }

  return payload;
}

export function buildPrimaryOnlyPayload(
  primaryContactId?: number | null,
  primaryFarmId?: number | null
): { primary_contact_id?: number | null; primary_farm_id?: number | null } {
  const payload: {
    primary_contact_id?: number | null;
    primary_farm_id?: number | null;
  } = {};
  if (primaryContactId !== undefined) {
    payload.primary_contact_id = primaryContactId;
  }
  if (primaryFarmId !== undefined) {
    payload.primary_farm_id = primaryFarmId;
  }
  return payload;
}

/** Merge stakeholder arrays into a create/update payload. */
export function mergeStakeholderIntoPayload<T extends Record<string, unknown>>(
  payload: T,
  contactIds: number[],
  farmIds: number[]
): T & StakeholderPayloadFields {
  return {
    ...payload,
    ...buildStakeholderPayload({ contactIds, farmIds }),
  };
}

export function normalizeIdArray(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => (typeof v === "number" ? v : parseInt(String(v), 10)))
    .filter((id) => !Number.isNaN(id) && id > 0);
}
