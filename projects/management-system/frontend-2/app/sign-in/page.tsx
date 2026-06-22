"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

import { useAuth0 } from "@auth0/auth0-react";
import {
  AuthSignInContent,
  AuthSignInLayout,
  Loader,
  type SignInFormData,
} from "@fieldflow360/org-ui";

import {
  CMS_SIGN_IN_BRAND,
  CmsSignInLogo,
} from "@/features/auth/ui/CmsSignInBrand";
import { useInvitation } from "@/hooks/useInvitation";
import { getAuth0ConfigError, isAuth0Configured } from "@/lib/auth-config";
import {
  AUTH_ROUTES,
  orgDashboardPath,
  withOrganizationPickerAfterAuth,
} from "@/lib/auth-routes";
import {
  clearSignOutFreshMarker,
  isFreshSignOutSession,
} from "@/lib/auth-sign-out";
import { getCookie } from "@/lib/cookies";

function SignInPageContent() {
  const { loginWithRedirect, isAuthenticated, user, isLoading } = useAuth0();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleInvitation, hasInvitation } = useInvitation();

  const getRedirectUri = () =>
    `${window.location.origin}${AUTH_ROUTES.authCallback}`;

  const authConfigError = getAuth0ConfigError();

  const startRedirect = useCallback(
    (authorizationParams: Record<string, string>) => {
      if (!isAuth0Configured()) {
        console.error(authConfigError);
        return;
      }
      clearSignOutFreshMarker();
      setIsRedirecting(true);
      loginWithRedirect({
        authorizationParams: {
          ...authorizationParams,
          redirect_uri: getRedirectUri(),
        },
        appState: {
          returnTo: withOrganizationPickerAfterAuth(AUTH_ROUTES.organizations),
        },
      });
    },
    [loginWithRedirect, authConfigError]
  );

  useEffect(() => {
    const handleAuthAndInvitation = async () => {
      if (
        isFreshSignOutSession(
          window.location.pathname,
          new URLSearchParams(window.location.search)
        )
      ) {
        return;
      }

      if (isAuthenticated && user && !isRedirecting) {
        setIsRedirecting(true);

        if (!user.email_verified) {
          router.push(AUTH_ROUTES.verifyEmail);
          return;
        }
        const lastOrgId = getCookie("lastOrgId");
        const redirectPath = lastOrgId
          ? orgDashboardPath(lastOrgId)
          : withOrganizationPickerAfterAuth(AUTH_ROUTES.organizations);

        if (hasInvitation) {
          try {
            const success = await handleInvitation();
            router.push(redirectPath);
            if (!success) {
              console.error("Failed to process invitation");
            }
          } catch (error) {
            console.error("Error handling invitation:", error);
            router.push(redirectPath);
          }
        } else {
          router.push(redirectPath);
        }
      }
    };

    if (!isLoading) {
      void handleAuthAndInvitation();
    }
  }, [
    isAuthenticated,
    user,
    hasInvitation,
    handleInvitation,
    router,
    isLoading,
    isRedirecting,
    searchParams,
  ]);

  const handleEmailSignIn = (data: SignInFormData) => {
    startRedirect({
      screen_hint: "signin",
      login_hint: data.email,
      prompt: "login",
    });
  };

  const handleGoogleSignIn = () => {
    startRedirect({
      connection: "google-oauth2",
      prompt: "select_account",
    });
  };

  const handleAppleSignIn = () => {
    startRedirect({
      connection: "apple",
      prompt: "select_account",
    });
  };

  const handleSignUp = () => {
    startRedirect({
      screen_hint: "signup",
      prompt: "select_account",
    });
  };

  if (
    isAuthenticated &&
    !isRedirecting &&
    !isFreshSignOutSession(
      typeof window !== "undefined"
        ? window.location.pathname
        : AUTH_ROUTES.signIn,
      searchParams
    )
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader text="Signing in" />
      </div>
    );
  }

  return (
    <AuthSignInLayout
      heroImageAlt="Authentication background"
      heroImageSrc="/images/log-in-2.webp"
    >
      <AuthSignInContent
        appTitle={CMS_SIGN_IN_BRAND.appTitle}
        description={authConfigError ?? CMS_SIGN_IN_BRAND.description}
        isRedirecting={isRedirecting}
        logo={<CmsSignInLogo />}
        title={CMS_SIGN_IN_BRAND.title}
        onAppleSignIn={handleAppleSignIn}
        onEmailSubmit={handleEmailSignIn}
        onGoogleSignIn={handleGoogleSignIn}
        onSignUpClick={handleSignUp}
      />
    </AuthSignInLayout>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInPageContent />
    </Suspense>
  );
}
