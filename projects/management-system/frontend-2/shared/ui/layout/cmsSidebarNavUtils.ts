import type { FieldFlowSidebarLink } from "@fieldflow360/org-ui";

import { orgPath } from "@/shared/config/routes";

export function resolveNavHref(
  baseHref: string,
  organizationId: string | null
) {
  if (!organizationId) return baseHref;
  if (baseHref.startsWith("/organizations/")) return baseHref;
  return orgPath(organizationId, baseHref);
}

export function isPathActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isNavItemActive(
  pathname: string | null,
  href: string,
  children?: FieldFlowSidebarLink[],
  organizationId?: string | null
) {
  if (isPathActive(pathname, href)) return true;
  return Boolean(
    children?.some((child) => {
      const childHref = resolveNavHref(child.href, organizationId ?? null);
      return isPathActive(pathname, childHref);
    })
  );
}

export function collectExpandableParentIds(
  links: FieldFlowSidebarLink[],
  pathname: string | null,
  organizationId: string | null
): string[] {
  const ids: string[] = [];
  for (const link of links) {
    if (!link.children?.length) continue;
    const navHref = resolveNavHref(link.href, organizationId);
    if (isNavItemActive(pathname, navHref, link.children, organizationId)) {
      ids.push(link.id);
    }
  }
  return ids;
}
