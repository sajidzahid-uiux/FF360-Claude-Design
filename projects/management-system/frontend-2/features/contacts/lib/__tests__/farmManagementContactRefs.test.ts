import { describe, expect, it } from "vitest";

import {
  parseFarmManagementContactRef,
  parseFarmManagementContactRefs,
} from "../farmManagementContactRefs";

describe("parseFarmManagementContactRef", () => {
  it("parses object entries with id and full_name", () => {
    expect(
      parseFarmManagementContactRef({ id: 42, full_name: "Acme Farm" })
    ).toEqual({ id: 42, full_name: "Acme Farm" });
  });

  it("parses legacy string entries without id", () => {
    expect(parseFarmManagementContactRef("Legacy Farm")).toEqual({
      id: null,
      full_name: "Legacy Farm",
    });
  });
});

describe("parseFarmManagementContactRefs", () => {
  it("returns empty array for undefined", () => {
    expect(parseFarmManagementContactRefs(undefined)).toEqual([]);
  });

  it("maps mixed entries", () => {
    expect(
      parseFarmManagementContactRefs([{ id: 1, full_name: "Farm A" }, "Farm B"])
    ).toEqual([
      { id: 1, full_name: "Farm A" },
      { id: null, full_name: "Farm B" },
    ]);
  });
});
