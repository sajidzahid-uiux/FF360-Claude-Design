/** Builds a stable key for per-table Zustand state (route + org + optional tab). */
export function createCmsTableStateKey(options: {
  pathname: string;
  orgId: number | null | undefined;
  tabKey?: string;
}): string | null {
  if (options.orgId == null) return null;

  const pageKey = options.pathname.replace(/\//g, "-").replace(/^-/, "");
  const tabPart = options.tabKey ? `_tab_${options.tabKey}` : "";
  return `table_${pageKey}${tabPart}_org_${options.orgId}`;
}
