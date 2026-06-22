/** First id in the array is treated as primary for API payloads. */
export function orderWithPrimaryFirst(
  ids: number[],
  primaryId: number
): number[] {
  if (!ids.includes(primaryId)) return ids;
  return [primaryId, ...ids.filter((id) => id !== primaryId)];
}

export function getPrimaryId(ids: number[]): number | undefined {
  return ids.length > 0 ? ids[0] : undefined;
}

export function toggleStakeholderId(ids: number[], id: number): number[] {
  if (ids.includes(id)) {
    return ids.filter((item) => item !== id);
  }
  return [...ids, id];
}

export function setStakeholderPrimary(
  ids: number[],
  primaryId: number
): number[] {
  return orderWithPrimaryFirst(ids, primaryId);
}
