"use client";
// components/layout/ClientRootLayoutContent.tsx
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

import { useAuth0 } from "@auth0/auth0-react";

import { useTokenRefreshService } from "@/hooks/useTokenRefreshService";
import { GlobalDialogManager } from "@/shared/ui/layout/GlobalDialogManager";
import GoogleMapsClientWrapper from "@/shared/ui/layout/GoogleMapsClientWrapper";

export default function ClientRootLayoutContent({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "";

  // Initialize token refresh service
  useTokenRefreshService();

  // Get auth state for potential redirects
  useAuth0();

  return (
    <GoogleMapsClientWrapper pathname={pathname}>
      {children}
      <GlobalDialogManager />
    </GoogleMapsClientWrapper>
  );
}
