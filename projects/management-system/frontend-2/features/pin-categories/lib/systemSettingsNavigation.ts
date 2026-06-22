import { orgUrl } from "@/shared/config/routes";

export const SYSTEM_SETTINGS_PIN_CATEGORIES_TAB_PARAM = "pin-categories";

export function getSystemSettingsPinCategoriesPath(orgId: string): string {
  return orgUrl(orgId, "/system-settings", "tab=pin-categories");
}
