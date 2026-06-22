import type { ContactSubtype } from "@/api/types";

export const CONTACT_SUBTYPE = {
  STANDARD: "standard",
  FARM_MANAGEMENT: "farm_management",
} as const satisfies Record<string, ContactSubtype>;
