import {
  type ContactDetailFormRow,
  createDefaultContactDetails,
} from "../lib/contactDetails";
import type { ContactFormData } from "./contactForm";

export interface FarmContactFormData extends ContactFormData {
  contact_details: ContactDetailFormRow[];
}

export const DEFAULT_FARM_CONTACT_FORM_DATA: FarmContactFormData = {
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
