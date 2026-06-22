import { describe, expect, it } from "vitest";

import { UserRole } from "@/constants/enums";

import { isMajorRoleName } from "../isMajorRoleName";

describe("isMajorRoleName", () => {
  it("accepts RBAC display names in MAJOR_ROLES", () => {
    expect(isMajorRoleName("Admin")).toBe(true);
    expect(isMajorRoleName("Project Manager")).toBe(true);
    expect(isMajorRoleName("Bookkeeper")).toBe(true);
    expect(isMajorRoleName("Viewer")).toBe(true);
    expect(isMajorRoleName("Project Crew")).toBe(true);
    expect(isMajorRoleName("Owner")).toBe(true);
  });

  it("accepts legacy role enum codes", () => {
    expect(isMajorRoleName(UserRole.ADMIN)).toBe(true);
    expect(isMajorRoleName(UserRole.CREW)).toBe(true);
  });

  it("rejects legacy User role and unknown names", () => {
    expect(isMajorRoleName("User")).toBe(false);
    expect(isMajorRoleName(UserRole.USER)).toBe(false);
    expect(isMajorRoleName("Guest")).toBe(false);
    expect(isMajorRoleName(null)).toBe(false);
    expect(isMajorRoleName("")).toBe(false);
  });
});
