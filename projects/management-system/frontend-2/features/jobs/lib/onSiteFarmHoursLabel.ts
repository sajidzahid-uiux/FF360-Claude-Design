import type { StakeholderFarm } from "@/api/types/jobs";

export function formatOnSiteFarmAcreage(
  acreage: number | string | undefined
): string {
  if (acreage == null || acreage === "") {
    return "";
  }
  return ` (${acreage} acres)`;
}

export function formatOnSiteFarmOptionLabel(farm: StakeholderFarm): string {
  return `${farm.name}${formatOnSiteFarmAcreage(farm.acreage)}`;
}
