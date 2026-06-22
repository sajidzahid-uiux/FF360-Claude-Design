"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { useAuth0 } from "@auth0/auth0-react";
import { ComponentSizeEnum, Loader } from "@fieldflow360/org-ui";
import { toast } from "sonner";

import {
  useDebounceNavigation,
  usePersistentStorage,
  useTeamData,
} from "@/hooks";
import { AUTH_ROUTES } from "@/lib/auth-routes";
import { getErrorMessage } from "@/utils/apiError";

export default function HomePage() {
  const { navigateTo } = useDebounceNavigation();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuth0();
  const { acceptInvitation } = useTeamData();
  const hasHandled = useRef(false);
  const storage = usePersistentStorage();

  useEffect(() => {
    if (hasHandled.current) return;
    hasHandled.current = true;

    const handleInvitation = async () => {
      const rawToken =
        searchParams.get("token") || storage.getItem("invitationToken");
      const token = rawToken?.replace(/\/$/, ""); // Remove trailing slash if present

      if (token) {
        if (isAuthenticated && user?.email_verified) {
          try {
            await acceptInvitation.mutateAsync(token);
            storage.removeItem("invitationToken");
            navigateTo(AUTH_ROUTES.organizations);
          } catch (error: unknown) {
            console.error("Failed to accept invitation:", error);
            toast.error(getErrorMessage(error, "Failed to accept invitation"));
            navigateTo(AUTH_ROUTES.organizations);
          }
        } else {
          // Store the cleaned token in persistent storage
          storage.setItem("invitationToken", token);
          navigateTo(AUTH_ROUTES.signIn);
        }
      } else {
        navigateTo(AUTH_ROUTES.signIn);
      }
    };

    handleInvitation();
  }, [
    searchParams,
    isAuthenticated,
    user,
    navigateTo,
    acceptInvitation,
    storage,
  ]);

  return <Loader className="min-h-screen" size={ComponentSizeEnum.LG} />;
}
