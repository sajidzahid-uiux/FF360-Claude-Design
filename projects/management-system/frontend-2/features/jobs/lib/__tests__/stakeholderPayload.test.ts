import { describe, expect, it } from "vitest";

import {
  buildPrimaryOnlyPayload,
  buildStakeholderPayload,
  normalizeIdArray,
  validateFarmsBelongToContacts,
} from "../stakeholderPayload";

describe("buildStakeholderPayload", () => {
  it("uses first ids as primary when primary omitted", () => {
    expect(
      buildStakeholderPayload({
        contactIds: [10, 11],
        farmIds: [201, 202],
      })
    ).toEqual({
      contact_ids: [10, 11],
      farm_ids: [201, 202],
      primary_contact_id: 10,
      primary_farm_id: 201,
    });
  });

  it("respects explicit primary ids", () => {
    expect(
      buildStakeholderPayload({
        contactIds: [10, 11],
        farmIds: [201, 202],
        primaryContactId: 11,
        primaryFarmId: 202,
      })
    ).toEqual({
      contact_ids: [10, 11],
      farm_ids: [201, 202],
      primary_contact_id: 11,
      primary_farm_id: 202,
    });
  });

  it("omits farm_ids when empty", () => {
    expect(buildStakeholderPayload({ contactIds: [10] })).toEqual({
      contact_ids: [10],
      primary_contact_id: 10,
    });
  });
});

describe("validateFarmsBelongToContacts", () => {
  it("returns true when all farms match contacts", () => {
    expect(
      validateFarmsBelongToContacts(
        [
          { farmId: 1, contactId: 10 },
          { farmId: 2, contactId: 11 },
        ],
        [10, 11]
      )
    ).toBe(true);
  });

  it("returns false when a farm contact is not selected", () => {
    expect(
      validateFarmsBelongToContacts([{ farmId: 1, contactId: 12 }], [10, 11])
    ).toBe(false);
  });
});

describe("buildPrimaryOnlyPayload", () => {
  it("includes only provided primary fields", () => {
    expect(buildPrimaryOnlyPayload(11, undefined)).toEqual({
      primary_contact_id: 11,
    });
  });
});

describe("normalizeIdArray", () => {
  it("parses string and number arrays", () => {
    expect(normalizeIdArray(["1", 2, "bad", 0])).toEqual([1, 2]);
  });
});
