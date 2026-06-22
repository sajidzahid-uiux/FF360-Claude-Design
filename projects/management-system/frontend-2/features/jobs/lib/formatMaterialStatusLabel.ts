import { MATERIAL_STATUS_OPTIONS } from "@/constants";

/**
 * Display label for tiling job `material_status`.
 * Returns empty string when status is null/blank (no placeholder).
 */
export function formatMaterialStatusLabel(
  status: string | null | undefined
): string {
  if (status == null || String(status).trim() === "") {
    return "";
  }

  const normalized = String(status).trim();
  const match = MATERIAL_STATUS_OPTIONS.find((opt) => opt.value === normalized);
  return match?.label ?? normalized;
}
