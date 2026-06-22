export interface ResolveTableToolbarRefinementsOptions {
  /** Force show/hide search, filter, and sort controls. */
  showRefinements?: boolean;
  /** When true (default), hides refinements while the dataset is empty and not loading. */
  hideRefinementsWhenEmpty?: boolean;
  /** Total rows in the dataset (e.g. server `totalCount`). Preferred for server tables. */
  totalCount?: number;
  /** Current page row count — used when `totalCount` is omitted (client tables). */
  rowCount?: number;
  isLoading?: boolean;
  /** Active filter option count — keeps refinements visible when filters yield no rows. */
  activeFilterCount?: number;
  /** Current search query — keeps refinements visible when search yields no rows. */
  searchQuery?: string;
  /** Whether any sort rules are applied. */
  hasActiveSort?: boolean;
}

function hasActiveToolbarRefinements(options: ResolveTableToolbarRefinementsOptions): boolean {
  if ((options.activeFilterCount ?? 0) > 0) return true;
  if (options.searchQuery?.trim()) return true;
  if (options.hasActiveSort) return true;
  return false;
}

/** Whether search, filter, and sort controls should render in {@link TableToolbar}. */
export function resolveTableToolbarRefinements(
  options: ResolveTableToolbarRefinementsOptions
): boolean {
  const {
    showRefinements,
    hideRefinementsWhenEmpty = true,
    totalCount,
    rowCount,
    isLoading,
  } = options;

  if (showRefinements !== undefined) return showRefinements;
  if (!hideRefinementsWhenEmpty) return true;
  if (isLoading) return true;
  if (hasActiveToolbarRefinements(options)) return true;

  if (totalCount !== undefined) return totalCount > 0;
  if (rowCount !== undefined) return rowCount > 0;

  return true;
}
