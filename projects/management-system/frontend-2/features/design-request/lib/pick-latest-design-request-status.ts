import type { DesignRequestStatusItem } from "@/api/types/designRequest";

export function pickLatestDesignRequestStatus(
  items: DesignRequestStatusItem[]
): DesignRequestStatusItem | null {
  if (!items.length) return null;
  return [...items].sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  )[0];
}
