export const CMS_V1_DEV_URL = "https://app.dev.fieldflow360.com";
export const CMS_V2_DEV_URL = "https://www.app-new.dev.fieldflow360.com";

export type CmsFrontendId = "v1" | "v2";

export function isDevCmsHost(hostname: string): boolean {
  return hostname.endsWith(".dev.fieldflow360.com");
}

export function getCmsDefaultPath(
  targetFrontend: CmsFrontendId,
  lastOrgId?: string | null
): string {
  if (lastOrgId) {
    return targetFrontend === "v2"
      ? `/organizations/${lastOrgId}/dashboard`
      : `/${lastOrgId}/dashboard`;
  }

  return targetFrontend === "v2" ? "/organizations?pick_org=1" : "/choose-org";
}

export function getAlternateCmsDevUrl(
  currentFrontend: CmsFrontendId,
  hostname: string,
  lastOrgId?: string | null
): string | null {
  if (!isDevCmsHost(hostname)) {
    return null;
  }

  const targetFrontend: CmsFrontendId = currentFrontend === "v1" ? "v2" : "v1";
  const base = targetFrontend === "v2" ? CMS_V2_DEV_URL : CMS_V1_DEV_URL;

  return `${base}${getCmsDefaultPath(targetFrontend, lastOrgId)}`;
}
