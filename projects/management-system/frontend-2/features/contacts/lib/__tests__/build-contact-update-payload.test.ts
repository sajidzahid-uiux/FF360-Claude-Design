import { describe, expect, it } from "vitest";

import { DEFAULT_CONTACT_FORM_DATA } from "@/features/contacts";
import { buildContactUpdatePayload } from "@/features/contacts/lib";

describe("buildContactUpdatePayload", () => {
  it("filters invalid category ids before patch", () => {
    const payload = buildContactUpdatePayload({
      ...DEFAULT_CONTACT_FORM_DATA,
      full_name: "Lera",
      category_ids: [3, Number.NaN, undefined as unknown as number],
    });

    expect(payload.category_ids).toEqual([3]);
  });

  it("derives vertices from location when vertices array is empty", () => {
    const payload = buildContactUpdatePayload({
      ...DEFAULT_CONTACT_FORM_DATA,
      full_name: "Lera",
      category_ids: [1],
      mapData: {
        location: { lat: 42.619399, lng: -94.862754 },
        vertices: [],
      },
    });

    expect(payload.latitude).toBe(42.619399);
    expect(payload.longitude).toBe(-94.862754);
    expect(payload.vertices).toHaveLength(4);
  });

  it("clears derived vertices when location is removed", () => {
    const payload = buildContactUpdatePayload({
      ...DEFAULT_CONTACT_FORM_DATA,
      full_name: "Lera",
      category_ids: [1],
      mapData: {
        location: null,
        vertices: [],
      },
    });

    expect(payload.latitude).toBeUndefined();
    expect(payload.longitude).toBeUndefined();
    expect(payload.vertices).toBeUndefined();
  });
});
