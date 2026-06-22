import { describe, expect, it } from "vitest";

import type { TeamMember } from "@/api/types";

import {
  canChangeRole,
  canEditMemberProfile,
  isOwner,
} from "../ownerProtection";

const baseMember: TeamMember = {
  id: 1,
  user: {
    id: 10,
    email: "crew@example.com",
    first_name: "Crew",
    last_name: "Member",
    username: "crew1",
    phone_number: "5551234567",
  },
  is_active: true,
  owner: false,
  created_at: "",
  last_updated: "",
};

describe("canEditMemberProfile", () => {
  it("allows editing a regular active member", () => {
    expect(canEditMemberProfile(baseMember)).toEqual({ allowed: true });
  });

  it("blocks organization owners", () => {
    const result = canEditMemberProfile({ ...baseMember, owner: true });
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("organization owner");
  });

  it("allows editing active non-owner members", () => {
    expect(
      canEditMemberProfile({
        ...baseMember,
        owner: false,
        is_active: true,
      })
    ).toEqual({ allowed: true });
  });

  it("blocks removed members", () => {
    const result = canEditMemberProfile({
      ...baseMember,
      is_removed: true,
    });
    expect(result.allowed).toBe(false);
  });

  it("blocks inactive members", () => {
    const result = canEditMemberProfile({
      ...baseMember,
      is_active: false,
    });
    expect(result.allowed).toBe(false);
  });
});

describe("isOwner", () => {
  it("returns true when owner flag is set", () => {
    expect(isOwner({ ...baseMember, owner: true })).toBe(true);
  });
});

describe("canChangeRole", () => {
  it("blocks owners from role changes", () => {
    expect(canChangeRole({ ...baseMember, owner: true }).allowed).toBe(false);
  });
});
