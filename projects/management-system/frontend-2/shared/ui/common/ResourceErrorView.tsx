"use client";

import { useRouter } from "next/navigation";

import { Button } from "@fieldflow360/org-ui";

import { APP_ROUTES, orgRoute } from "@/shared/config/routes";

interface ResourceErrorViewProps {
  /** HTTP status of the failed request, if known */
  status?: number;
  /** Human-readable label for the resource, e.g. "job", "equipment" */
  resourceLabel?: string;
  /**
   * When set, the back button always goes to the org notifications page.
   * Prefer this for all `[orgId]` detail pages.
   */
  orgId?: string | null;
  /** Fallback link when `orgId` is not available */
  backHref?: string;
  /** Back button label (defaults to "Back to notifications" with orgId, else "Go back") */
  backLabel?: string;
}

/**
 * Generic error screen for detail pages whose fetch-by-id call failed.
 * Renders a 403-aware "no permission" message or a 404-aware "not found" message
 * without requiring knowledge of how the user navigated here.
 */
export function ResourceErrorView({
  status,
  resourceLabel = "resource",
  orgId,
  backHref,
  backLabel,
}: ResourceErrorViewProps) {
  const router = useRouter();
  const isPermission = status === 403;
  const isGone = status === 404 || status === 410;

  const heading = isPermission
    ? "You don't have permission to view this"
    : isGone
      ? `This ${resourceLabel} no longer exists`
      : `Unable to load ${resourceLabel}`;

  const body = isPermission
    ? `Your account doesn't have access to this ${resourceLabel}. Contact an admin if you think this is a mistake.`
    : isGone
      ? `This ${resourceLabel} may have been deleted or moved. If you expected it to be here, contact an admin.`
      : `Something went wrong loading this ${resourceLabel}. Please try again later.`;

  const linkHref = orgId
    ? orgRoute(orgId, APP_ROUTES.userNotifications)
    : backHref;
  const linkLabel =
    linkHref == null
      ? null
      : (backLabel ?? (orgId ? "Back to notifications" : "Go back"));

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <h1 className="text-text-primary text-xl font-semibold capitalize sm:text-2xl">
        {heading}
      </h1>
      <p className="text-text-muted max-w-md text-sm sm:text-base">{body}</p>
      {linkHref && linkLabel ? (
        <Button
          aria-label={linkLabel}
          title={linkLabel}
          onClick={() => router.push(linkHref)}
        />
      ) : null}
    </div>
  );
}
