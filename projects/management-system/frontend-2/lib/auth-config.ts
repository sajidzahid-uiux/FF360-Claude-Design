import { AUTH0_AUDIENCE, AUTH0_CLIENT_ID, AUTH0_DOMAIN } from "@/constants";

export function isAuth0Configured(): boolean {
  return Boolean(AUTH0_DOMAIN && AUTH0_CLIENT_ID && AUTH0_AUDIENCE);
}

export function getAuth0ConfigError(): string | null {
  const missing = [
    !AUTH0_DOMAIN && "NEXT_PUBLIC_AUTH0_DOMAIN",
    !AUTH0_CLIENT_ID && "NEXT_PUBLIC_AUTH0_CLIENT_ID",
    !AUTH0_AUDIENCE && "NEXT_PUBLIC_AUTH0_AUDIENCE",
  ].filter(Boolean);

  if (missing.length === 0) return null;

  return `Missing Auth0 env: ${missing.join(", ")}. Copy frontend/.env.local to frontend-2/.env.local and restart the dev server.`;
}
