import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { useRouteIds } from "@/hooks/lib/useRouteIds";
import { AUTH_ROUTES, orgScopedPath } from "@/lib/auth-routes";
import { getCookie } from "@/lib/cookies";

export function useOrgNavigation() {
  const router = useRouter();
  const { orgId } = useRouteIds();

  const getOrgId = useCallback((): string | null => {
    if (orgId) return orgId;

    const lastOrgId = getCookie("lastOrgId");
    return lastOrgId || null;
  }, [orgId]);

  const navigateWithOrg = useCallback(
    (path: string, forceOrgId?: string) => {
      const targetOrgId = forceOrgId || getOrgId();

      if (!targetOrgId) {
        console.warn(
          "No orgId available for navigation, redirecting to organizations"
        );
        router.push(AUTH_ROUTES.organizations);
        return;
      }

      const cleanPath = path.startsWith("/") ? path.slice(1) : path;

      router.push(orgScopedPath(targetOrgId, cleanPath));
    },
    [router, getOrgId]
  );

  const navigate = useCallback(
    (path: string) => {
      router.push(path);
    },
    [router]
  );

  return {
    navigateWithOrg,
    navigate,
    getOrgId,
    orgId,
  };
}
