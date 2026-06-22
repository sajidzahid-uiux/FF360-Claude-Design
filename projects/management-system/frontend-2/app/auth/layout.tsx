"use client";

import { ReactNode, useEffect } from "react";

import { useAuth0 } from "@auth0/auth0-react";

import { useDebounceNavigation } from "@/hooks";
import {
  AUTH_ROUTES,
  orgDashboardPath,
  withOrganizationPickerAfterAuth,
} from "@/lib/auth-routes";
import { getCookie } from "@/lib/cookies";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { navigateTo } = useDebounceNavigation();
  const { user } = useAuth0();

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (user?.email_verified) {
      const lastOrgId = getCookie("lastOrgId");
      const redirectPath = lastOrgId
        ? orgDashboardPath(lastOrgId)
        : withOrganizationPickerAfterAuth(AUTH_ROUTES.organizations);
      navigateTo(redirectPath);
    }
  }, [user, navigateTo]);

  // if (isMobile) {
  //     return <MobileComingSoon />;
  // }

  return children;
}
