import { type FilterState, FilterType } from "@/shared/ui/common";

export function getFarmManagementIdFromFilters(
  filters: FilterState
): number | undefined {
  const raw = filters[FilterType.FARM_MANAGEMENT_CONTACT];
  if (!Array.isArray(raw) || raw.length === 0) {
    return undefined;
  }
  const parsed = Number(raw[0]);
  return Number.isFinite(parsed) ? parsed : undefined;
}
