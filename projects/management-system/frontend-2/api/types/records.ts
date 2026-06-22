import type { EquipmentType, ServiceStatus } from "@/constants/enums";

import type { OrganizationJobStatus } from "./common";
import type { ContactDetail, ContactSubtype, Farm } from "./contacts";
import type {
  OrganizationLeadStatusSetting,
  OrganizationLeadTypeSetting,
} from "./settings";

/** `GET /ms/organizations/{id}/records/contacts/` */
export interface RecordContact {
  id: number;
  full_name: string;
  phone_number: string | null;
  contact_subtype?: ContactSubtype;
  contact_details?: ContactDetail[];
}

/** `GET /ms/organizations/{id}/records/farms/` */
export type RecordFarm = Pick<
  Farm,
  "id" | "name" | "acreage" | "longitude" | "latitude" | "vertices"
> & {
  contact_id: number;
};

/** `GET /ms/organizations/{id}/records/equipment/` (`RecordEquipmentList` serializer). */
export interface RecordEquipment {
  id: number;
  name: string;
  serial_number: string;
  service_status: ServiceStatus;
  equipment_type: EquipmentType;
  filters: Record<
    string,
    {
      current_value: number;
      threshold: number;
    }
  > | null;
  current_hours?: number | null;
}

/** `GET /ms/organizations/{id}/settings/job-statuses/` */
export type RecordJobStatus = OrganizationJobStatus;

/** Lead status rows from organization settings / records endpoints. */
export type RecordLeadStatus = OrganizationLeadStatusSetting;

/** Lead type rows from organization settings / records endpoints. */
export type RecordLeadType = OrganizationLeadTypeSetting;
