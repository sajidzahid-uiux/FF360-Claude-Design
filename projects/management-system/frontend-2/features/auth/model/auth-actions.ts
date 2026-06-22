import type { AuthRuntimeActions } from "./auth-types";

let authRuntimeActions: AuthRuntimeActions | null = null;

export function registerAuthRuntimeActions(
  actions: AuthRuntimeActions | null
): void {
  authRuntimeActions = actions;
}

export function getAuthRuntimeActions(): AuthRuntimeActions | null {
  return authRuntimeActions;
}
