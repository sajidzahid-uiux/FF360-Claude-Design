import { JobLeadEntityType } from "@/constants";
import { ORG_ROUTE_PREFIX } from "@/lib/auth-routes";

/**
 * Path segments immediately after `/organizations/[orgId]/` in the app router.
 * Used to detect whether web_url already includes an org-scoped segment.
 */
const ORG_SCOPED_FIRST_SEGMENTS = new Set([
  JobLeadEntityType.JOBS,
  JobLeadEntityType.LEADS,
  "org",
  "map",
  "contact",
  "equipment",
  "completed",
  "dashboard",
  "messages",
  "subscribe",
  "crew-management",
  "quick-actions",
  "order-pipe",
  "maintenance",
  "footage",
  "book-keeping",
  "upcoming-features",
  "task-management",
  "system-settings",
  "preferences",
  "pending",
  "favorites",
  "industry-specialists",
]);

/**
 * Builds an in-app href from API web_url, always scoping to the current org.
 * Preserves query string and hash (e.g. #jobtype) as returned by the backend.
 */
export function notificationTargetHref(
  webUrl: string | null | undefined,
  orgId: string
): string | null {
  if (!orgId || !webUrl?.trim()) return null;

  let raw = webUrl.trim();
  let hash = "";
  const hashIdx = raw.indexOf("#");
  if (hashIdx !== -1) {
    hash = raw.slice(hashIdx);
    raw = raw.slice(0, hashIdx);
  }

  let pathname = "";
  let search = "";
  try {
    if (/^https?:\/\//i.test(raw)) {
      const u = new URL(raw);
      pathname = u.pathname || "/";
      search = u.search;
    } else {
      const pathOnly = raw.split("?")[0] ?? "";
      const queryIdx = raw.indexOf("?");
      search = queryIdx >= 0 ? raw.slice(queryIdx) : "";
      pathname = pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;
    }
  } catch {
    return null;
  }

  const segments = pathname.split("/").filter(Boolean);

  if (segments[0] === "organizations" && segments[1] === String(orgId)) {
    return pathname.replace(/\/+/g, "/") + search + hash;
  }

  if (segments.length === 0) {
    return `${ORG_ROUTE_PREFIX}/${orgId}${search}${hash}`;
  }

  const first = segments[0].toLowerCase();
  const rest = ORG_SCOPED_FIRST_SEGMENTS.has(first)
    ? segments
    : segments.length > 1 && /^\d+$/.test(segments[0])
      ? segments.slice(1)
      : segments;

  const path = `${ORG_ROUTE_PREFIX}/${orgId}/${rest.join("/")}`;
  return path.replace(/\/+/g, "/") + search + hash;
}
