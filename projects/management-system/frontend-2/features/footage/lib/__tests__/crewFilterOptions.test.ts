import { describe, expect, it } from "vitest";

import type { CrewGroupListItem, TeamMember } from "@/api/types";
import { FOOTAGE_CREW_FILTER_MEMBER_PREFIX } from "@/api/types/footage";

import { buildCrewFilterOptions } from "../crewFilterOptions";

const baseMember = (id: number, is_removed = false): TeamMember =>
  ({
    id,
    is_removed,
    user: { username: `user-${id}` },
  }) as TeamMember;

describe("buildCrewFilterOptions", () => {
  it("excludes removed members from selectable options", () => {
    const groups: CrewGroupListItem[] = [{ id: 1, name: "Main Crew" }];
    const members = [baseMember(10), baseMember(20, true)];

    const options = buildCrewFilterOptions(groups, members);

    expect(options.map((o) => o.id)).toEqual([
      "crew_group:1",
      `${FOOTAGE_CREW_FILTER_MEMBER_PREFIX}10`,
    ]);
    expect(
      options.some((o) => o.id === `${FOOTAGE_CREW_FILTER_MEMBER_PREFIX}20`)
    ).toBe(false);
  });
});
