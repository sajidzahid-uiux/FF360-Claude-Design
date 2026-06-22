import type { FarmManagementContactNameEntry } from "@/api/types";

export interface ParsedFarmManagementContactRef {
  id: number | null;
  full_name: string;
}

/** Normalize API entries (object or legacy string) for display and navigation. */
export function parseFarmManagementContactRef(
  entry: FarmManagementContactNameEntry
): ParsedFarmManagementContactRef {
  if (typeof entry === "string") {
    return { id: null, full_name: entry };
  }
  return {
    id: entry.id ?? null,
    full_name: entry.full_name,
  };
}

export function parseFarmManagementContactRefs(
  entries: FarmManagementContactNameEntry[] | undefined
): ParsedFarmManagementContactRef[] {
  if (!entries?.length) return [];
  return entries.map(parseFarmManagementContactRef);
}
