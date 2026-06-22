import type {
  ContactCreatePayload,
  SubContactCreateAndLinkPayload,
} from "@/api/types";
import type { ContactFormData } from "@/features/contacts/model";

import { CONTACT_SUBTYPE } from "../model/constants";
import {
  mapContactDetailsToApi,
  syncLegacyFieldsFromDetails,
} from "./contactDetails";

/** Map form map section to API vertices ([lng, lat][]). */
export function mapContactFormVertices(
  mapData: ContactFormData["mapData"]
): number[][] | undefined {
  if (mapData.vertices.length > 0) {
    return mapData.vertices.map((v) => [v.lng, v.lat]);
  }
  if (mapData.location) {
    const { lng, lat } = mapData.location;
    return [
      [lng - 0.001, lat - 0.001],
      [lng + 0.001, lat - 0.001],
      [lng + 0.001, lat + 0.001],
      [lng - 0.001, lat + 0.001],
    ];
  }
  return undefined;
}

/** Standard contact form → create-and-link payload (Client Contact category applied by caller). */
export function contactFormDataToSubContactCreateAndLink(
  formData: ContactFormData,
  clientCategoryId: number
): SubContactCreateAndLinkPayload {
  const legacy = syncLegacyFieldsFromDetails(formData.contact_details);

  return {
    full_name: legacy.full_name,
    category_ids: [clientCategoryId],
    email: formData.email || undefined,
    phone_number: legacy.phone_number || undefined,
    company_name: formData.company_name || undefined,
    description: formData.description || undefined,
    website_link: formData.website_link || undefined,
    street_address: formData.street_address || undefined,
    city: formData.city || undefined,
    state: formData.state || undefined,
    zip_code: formData.zip_code || undefined,
    longitude: formData.mapData.location?.lng,
    latitude: formData.mapData.location?.lat,
    vertices: mapContactFormVertices(formData.mapData),
    contact_details: mapContactDetailsToApi(formData.contact_details),
  };
}

/** Map new sub-contact form data to a standard contacts-v2 create payload. */
export function subContactCreateAndLinkToContactCreate(
  data: SubContactCreateAndLinkPayload
): ContactCreatePayload {
  return {
    contact_subtype: CONTACT_SUBTYPE.STANDARD,
    full_name: data.full_name,
    category_ids: data.category_ids,
    email: data.email,
    phone_number: data.phone_number,
    company_name: data.company_name,
    description: data.description,
    website_link: data.website_link,
    street_address: data.street_address,
    city: data.city,
    state: data.state,
    zip_code: data.zip_code,
    longitude: data.longitude,
    latitude: data.latitude,
    vertices: data.vertices,
    contact_details: data.contact_details,
  };
}
