import type { FootageCrewFilterSelections } from "@/shared/lib/footage/parseCrewFilterSelections";
import type { FilterState } from "@/shared/ui/common";
import { FilterType } from "@/shared/ui/common";

export type {
  FootageCrewFilterSelectionId,
  FootageCrewFilterSelections,
  ParsedFootageCrewFilters,
} from "@/shared/lib/footage/parseCrewFilterSelections";

/** Narrows multi-filter state to footage crew checkbox ids (other shapes ignored). */
export function footageCrewSelectionsFromFilterState(
  slice: FilterState[string] | undefined
): FootageCrewFilterSelections | undefined {
  return Array.isArray(slice)
    ? (slice as FootageCrewFilterSelections)
    : undefined;
}

/** Convenience: reads `FOOTAGE_CREW` slice from full filter state. */
export function footageCrewSelectionsFromFilters(
  filters: FilterState
): FootageCrewFilterSelections | undefined {
  return footageCrewSelectionsFromFilterState(filters[FilterType.FOOTAGE_CREW]);
}
