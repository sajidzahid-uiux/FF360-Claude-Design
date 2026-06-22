import { format } from "date-fns";

import type { InstalledFootageLogEntry } from "@/api/types/installedFootageLogs";
import { WALL_TYPE_LABELS, WallType } from "@/constants";

export function memberLabel(e: InstalledFootageLogEntry): string {
  return e.member_name ?? e.entered_by_name ?? "—";
}

export function formatLogDate(iso: string): string {
  try {
    return format(new Date(iso), "MM/dd/yyyy");
  } catch {
    return iso;
  }
}

export function wallTypeLabel(raw: string | null | undefined): string {
  if (!raw) return "—";
  if (raw === WallType.SINGLE_WALL)
    return WALL_TYPE_LABELS[WallType.SINGLE_WALL];
  if (raw === WallType.DUAL_WALL) return WALL_TYPE_LABELS[WallType.DUAL_WALL];
  return raw;
}
