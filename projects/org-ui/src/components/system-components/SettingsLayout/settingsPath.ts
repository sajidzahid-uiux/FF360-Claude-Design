/** True when `path` is a settings area (dev-app `/settings/...`, tile `/organizations/:id/settings/...`). */
export function isFieldFlowSettingsPath(path?: string): boolean {
  if (!path) return false;
  return path === '/settings' || path.startsWith('/settings/') || /\/settings(\/|$)/.test(path);
}
