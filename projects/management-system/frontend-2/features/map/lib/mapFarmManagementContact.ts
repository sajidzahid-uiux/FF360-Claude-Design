import type { MapFarmManagementContact } from "@/api/types";
import { getPrimaryFarmManagementName } from "@/features/contacts/lib";

export type MapRecordWithFarmManagement = {
  farm_management_names?: string[];
  farm_management_contacts?: MapFarmManagementContact[];
};

/** Primary Farm Management Contact name for a map job/lead record. */
export function resolveMapFarmManagementContactName(
  record: MapRecordWithFarmManagement | null | undefined
): string | null {
  return getPrimaryFarmManagementName(record);
}
