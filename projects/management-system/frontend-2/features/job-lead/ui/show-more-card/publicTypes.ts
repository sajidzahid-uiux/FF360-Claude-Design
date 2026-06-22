export type { EntityContactInfo, EntityDataState } from "./entityDataState";
export type { HandleCustomerPatchValue } from "./handleCustomerPatchValue";
export type { EntityStatusOption as StatusItem } from "@/api/types";

export interface SpecialFileType {
  value: string;
  label: string;
  prefix: string;
  uploadType: "regular" | "map";
  mapField?: string;
}
