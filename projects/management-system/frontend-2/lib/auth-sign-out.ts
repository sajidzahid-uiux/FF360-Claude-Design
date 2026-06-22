import { AUTH_ROUTES, SIGN_IN_FRESH_QUERY } from "@/lib/auth-routes";
import { getCookie, removeCookie, setCookie } from "@/lib/cookies";

export const SIGN_OUT_FRESH_COOKIE = "ff_sign_out_fresh";

const SIGN_OUT_FRESH_STORAGE_KEY = "ff_sign_out_fresh";

function canUseSessionStorage(): boolean {
  return typeof window !== "undefined";
}

export function setSignOutFreshMarker(): void {
  if (canUseSessionStorage()) {
    sessionStorage.setItem(SIGN_OUT_FRESH_STORAGE_KEY, "1");
  }
  setCookie(SIGN_OUT_FRESH_COOKIE, "1", 1);
}

export function hasSignOutFreshMarker(): boolean {
  if (
    canUseSessionStorage() &&
    sessionStorage.getItem(SIGN_OUT_FRESH_STORAGE_KEY) === "1"
  ) {
    return true;
  }
  return getCookie(SIGN_OUT_FRESH_COOKIE) === "1";
}

export function clearSignOutFreshMarker(): void {
  if (canUseSessionStorage()) {
    sessionStorage.removeItem(SIGN_OUT_FRESH_STORAGE_KEY);
  }
  removeCookie(SIGN_OUT_FRESH_COOKIE);
}

export function isFreshSignOutSession(
  pathname: string,
  search: URLSearchParams
): boolean {
  if (pathname !== AUTH_ROUTES.signIn) {
    return false;
  }
  return search.get(SIGN_IN_FRESH_QUERY) === "1" || hasSignOutFreshMarker();
}
