import type { QuickAction } from "@/api/types";
import {
  CONVERSION_TYPES,
  CONVERSION_TYPE_LABELS,
  ConversionType,
  isConversionType,
} from "@/constants/enums";

/** Badge tint per converted-into module, mirroring the notification module badge. */
export const MODULE_BADGE_COLOR: Record<ConversionType, string> = {
  [ConversionType.CONTACT]: "#3b82f6",
  [ConversionType.LEAD]: "#8b5cf6",
  [ConversionType.JOB]: "#22c55e",
};

/** Filter id + value used for quick actions that haven't been converted yet. */
export const QUICK_ACTION_UNCONVERTED = "unconverted";
export const QUICK_ACTION_MODULE_FILTER_ID = "module";

/** Neutral grey badge tint for unconverted rows. */
export const UNCONVERTED_BADGE_COLOR = "#6b7280";

/**
 * Which module(s) a quick action has been converted into. `conversion_type` may
 * arrive as a single value or an array (multi-target), so normalize both, and
 * back-fill from the linked contact/lead and the derived `converted_to`.
 */
export function getQuickActionModules(
  quickAction: QuickAction
): ConversionType[] {
  const found = new Set<ConversionType>();
  const add = (value: unknown) => {
    if (typeof value === "string" && isConversionType(value)) {
      found.add(value);
    }
  };

  const raw = quickAction.conversion?.conversion_type;
  if (Array.isArray(raw)) raw.forEach(add);
  else add(raw);

  add(quickAction.converted_to);
  if (quickAction.conversion?.contact != null) found.add(ConversionType.CONTACT);
  if (quickAction.conversion?.lead != null || quickAction.conversion?.lead_done) {
    found.add(ConversionType.LEAD);
  }

  // Stable display order: Contact, Lead, Job.
  return CONVERSION_TYPES.filter((type) => found.has(type));
}

/** Display labels for a quick action's converted modules (empty → unconverted). */
export function getQuickActionModuleLabels(quickAction: QuickAction): string[] {
  return getQuickActionModules(quickAction).map(
    (type) => CONVERSION_TYPE_LABELS[type]
  );
}

/**
 * Matches a quick action against the selected "Module" filter values
 * (conversion types plus the synthetic `unconverted` bucket).
 */
export function quickActionMatchesModuleFilter(
  quickAction: QuickAction,
  values: string[]
): boolean {
  const modules = getQuickActionModules(quickAction);
  if (modules.length === 0) return values.includes(QUICK_ACTION_UNCONVERTED);
  return modules.some((type) => values.includes(type));
}
