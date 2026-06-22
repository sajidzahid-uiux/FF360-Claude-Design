import { describe, expect, it } from "vitest";

import { resolveFarmOwnerContactId } from "../stakeholderFormHelpers";

describe("resolveFarmOwnerContactId", () => {
  const farms = [
    { id: 23050, name: "a", contact_id: 96769, is_primary: true },
    { id: 23039, name: "b", contact_id: 96649, is_primary: false },
  ];

  it("returns contact_id for farm matching farm_info id", () => {
    expect(resolveFarmOwnerContactId(farms, 23050, 1)).toBe(96769);
    expect(resolveFarmOwnerContactId(farms, 23039, 1)).toBe(96649);
  });

  it("falls back to primary farm when farm_info id is missing", () => {
    expect(resolveFarmOwnerContactId(farms, undefined, 1)).toBe(96769);
  });

  it("falls back to contact_info id when farms list is empty", () => {
    expect(resolveFarmOwnerContactId([], 23050, 999)).toBe(999);
    expect(resolveFarmOwnerContactId(undefined, 23050, 999)).toBe(999);
  });
});
