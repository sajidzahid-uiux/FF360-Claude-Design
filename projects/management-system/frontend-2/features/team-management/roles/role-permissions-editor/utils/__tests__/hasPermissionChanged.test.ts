import { describe, expect, it } from "vitest";

import type { Permission } from "@/api/types";

import { hasPermissionChanged } from "../hasPermissionChanged";

const original: Permission[] = [
  { id: 1, code: "a_read", name: "A", action_type: "read" },
  { id: 2, code: "b_read", name: "B", action_type: "read" },
];

describe("hasPermissionChanged", () => {
  it("returns false when selection matches original", () => {
    expect(hasPermissionChanged(original, new Set([1, 2]))).toBe(false);
  });

  it("returns true when ids are added or removed", () => {
    expect(hasPermissionChanged(original, new Set([1]))).toBe(true);
    expect(hasPermissionChanged(original, new Set([1, 2, 3]))).toBe(true);
  });
});
