import { ResourceType } from "@/constants";

export function buildShowMoreCardScopeKey(
  organizationId: string | number | null | undefined,
  entityType: ResourceType,
  entityId: number | string | null | undefined
): string | null {
  if (organizationId == null || entityId == null) return null;
  return `show-more_${organizationId}_${entityType}_${entityId}`;
}
