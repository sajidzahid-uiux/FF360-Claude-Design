"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useAuth0 } from "@auth0/auth0-react";
import {
  FieldFlowProduct,
  OrganizationWelcomePageContent,
  useOrganizationPickerFromQuery,
} from "@fieldflow360/org-ui";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { OrganizationSwitcherModal } from "@/features/auth/ui/OrganizationSwitcherModal";
import { useInvitation, useOrganizationData } from "@/hooks";
import { AUTH_ROUTES, isOrganizationScopedPath } from "@/lib/auth-routes";

const CMS_HERO = {
  heroImageSrc: "/images/log-in-2.webp",
  heroImageAlt: "Authentication background",
} as const;

export function OrganizationsPageContent() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuth0Loading } = useAuth0();
  const { logout } = useAuth();
  const { data: organizations = [], isLoading } = useOrganizationData();
  const { hasInvitation, handleInvitation } = useInvitation();
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const openPicker = useCallback(() => setIsPickerOpen(true), []);
  const closePicker = useCallback(() => setIsPickerOpen(false), []);

  const replacePath = useCallback(
    (path: string) => {
      router.replace(path);
    },
    [router]
  );

  useOrganizationPickerFromQuery({
    pathname,
    welcomePath: AUTH_ROUTES.organizations,
    isAuthenticated,
    isInitializing: isAuth0Loading,
    organizationsCount: organizations.length,
    openPicker,
    replacePath,
    isOrgScopedPath: isOrganizationScopedPath,
  });

  useEffect(() => {
    if (!hasInvitation) return;
    void handleInvitation();
  }, [hasInvitation, handleInvitation]);

  return (
    <OrganizationWelcomePageContent
      product={FieldFlowProduct.CMS}
      {...CMS_HERO}
      isLoading={isLoading && organizations.length === 0}
      onBack={logout}
      onGetStarted={openPicker}
    >
      <OrganizationSwitcherModal open={isPickerOpen} onClose={closePicker} />
    </OrganizationWelcomePageContent>
  );
}

export default OrganizationsPageContent;
