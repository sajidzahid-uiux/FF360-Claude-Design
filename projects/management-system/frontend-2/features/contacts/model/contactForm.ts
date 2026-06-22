import type { GeoLatLng, VertexRing } from "@/api/types/geo";

import {
  type ContactDetailFormRow,
  createDefaultContactDetails,
} from "../lib/contactDetails";

export const CONTACT_FIELD_LIMITS = {
  full_name: 100,
  email: 254,
  phone_number: 32,
  home_phone_number: 32,
  company_name: 100,
  description: 500,
  website_link: 200,
  street_address: 200,
  city: 100,
  state: 50,
  zip_code: 20,
} as const;

export interface ContactFormData {
  full_name: string;
  email: string;
  phone_number: string;
  home_phone_number: string;
  company_name: string;
  description: string;
  website_link: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  mapData: {
    location: GeoLatLng | null;
    vertices: VertexRing;
  };
  category_ids: number[];
  contact_details: ContactDetailFormRow[];
}

export const DEFAULT_CONTACT_FORM_DATA: ContactFormData = {
  full_name: "",
  email: "",
  phone_number: "",
  home_phone_number: "",
  company_name: "",
  description: "",
  website_link: "",
  street_address: "",
  city: "",
  state: "",
  zip_code: "",
  mapData: {
    location: null,
    vertices: [],
  },
  category_ids: [],
  contact_details: createDefaultContactDetails(),
};
