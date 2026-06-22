import {
  FOOTAGE_CREW_FILTER_GROUP_PREFIX,
  FOOTAGE_CREW_FILTER_MEMBER_PREFIX,
} from "@/api/types/footage";

/** Checkbox id from crew filter options (`crew_group:<id>` / `crew_member:<id>`). */
export type FootageCrewFilterSelectionId =
  | `${typeof FOOTAGE_CREW_FILTER_GROUP_PREFIX}${number}`
  | `${typeof FOOTAGE_CREW_FILTER_MEMBER_PREFIX}${number}`;

/** Selected crew rows stored under footage crew filter. */
export type FootageCrewFilterSelections =
  readonly FootageCrewFilterSelectionId[];

/** Numeric ids derived from selections for `crew_member` / `crew_group` query params. */
export interface ParsedFootageCrewFilters {
  crewMembers: number[];
  crewGroups: number[];
}

/** Maps crew checkbox ids to member/group id lists for `all_jobs` query params. */
export function parseFootageCrewFilterSelections(
  raw: FootageCrewFilterSelections | undefined
): ParsedFootageCrewFilters {
  const crewMembers: number[] = [];
  const crewGroups: number[] = [];

  if (raw === undefined || raw.length === 0) {
    return { crewMembers, crewGroups };
  }

  for (const entry of raw) {
    const s = String(entry).trim();
    if (!s) continue;

    if (s.startsWith(FOOTAGE_CREW_FILTER_GROUP_PREFIX)) {
      const n = parseInt(s.slice(FOOTAGE_CREW_FILTER_GROUP_PREFIX.length), 10);
      if (!Number.isNaN(n)) crewGroups.push(n);
      continue;
    }
    if (s.startsWith(FOOTAGE_CREW_FILTER_MEMBER_PREFIX)) {
      const n = parseInt(s.slice(FOOTAGE_CREW_FILTER_MEMBER_PREFIX.length), 10);
      if (!Number.isNaN(n)) crewMembers.push(n);
    }
  }

  return { crewMembers, crewGroups };
}
