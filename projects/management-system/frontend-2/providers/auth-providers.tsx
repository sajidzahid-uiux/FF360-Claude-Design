"use client";

import { ReactNode } from "react";

import { Auth0Provider } from "@auth0/auth0-react";

import {
  AUTH0_AUDIENCE,
  AUTH0_CLIENT_ID,
  AUTH0_DOMAIN,
  AUTH0_REDIRECT_URI,
  AUTH0_SCOPE,
} from "@/constants";
import { AuthSync } from "@/features/auth/ui/AuthSync";

export function AuthProviders({ children }: { children: ReactNode }) {
  // Safe access to window object in client component
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  // Use the environment variable with fallback to current origin
  const redirectUri = AUTH0_REDIRECT_URI || `${origin}/auth/callback`;

  return (
    <Auth0Provider
      authorizationParams={{
        redirect_uri: redirectUri,
        scope: AUTH0_SCOPE,
        audience: AUTH0_AUDIENCE,
        prompt: "consent",
      }}
      cacheLocation="localstorage"
      clientId={AUTH0_CLIENT_ID}
      domain={AUTH0_DOMAIN}
      useRefreshTokens={true}
      useRefreshTokensFallback={true}
      onRedirectCallback={(appState) => {
        window.history.replaceState(
          {},
          document.title,
          appState?.returnTo || "/"
        );
      }}
    >
      <AuthSync>{children}</AuthSync>
    </Auth0Provider>
  );
}
