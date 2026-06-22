import type { IdOf } from "./common";
import type { JobOrLeadId } from "./leads";
import type { MapPinCategoryRef } from "./mapPinCategory";

export interface MapPin {
  id: number;
  organization: number;
  lead: number | null;
  job: number | null;
  name: string;
  label?: string;
  category_id?: number;
  category?: MapPinCategoryRef;
  latitude: number;
  longitude: number;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface MapPinCreatePayload {
  latitude: number;
  longitude: number;
  category_id: number;
  label?: string;
}

export interface MapPinCreateArgs {
  id: JobOrLeadId;
  data: MapPinCreatePayload;
}

export interface MapPinDeleteArgs {
  id: JobOrLeadId;
  pinId: IdOf<MapPin>;
}
