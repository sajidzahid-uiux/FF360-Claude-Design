import type { Contact } from "@/api/types";
import type { FarmContactFormData } from "@/features/contacts/model";

import {
  hydrateContactDetailsForForm,
  mapContactDetailsToApi,
  syncLegacyFieldsFromDetails,
} from "./contactDetails";

/** Keep legacy home phone on PATCH when the field is no longer edited in the UI. */
export function preserveLegacyHomePhone(homePhone: string | null | undefined): {
  home_phone_number?: string;
} {
  const trimmed = homePhone?.trim();
  return trimmed ? { home_phone_number: trimmed } : {};
}

export function contactToFarmFormData(contact: Contact): FarmContactFormData {
  return {
    full_name: contact.full_name,
    email: contact.email || "",
    phone_number: "",
    home_phone_number: "",
    company_name: contact.company_name || "",
    description: contact.description || "",
    website_link: contact.website_link || "",
    street_address: contact.street_address || "",
    city: contact.city || "",
    state: contact.state || "",
    zip_code: contact.zip_code || "",
    mapData: {
      location:
        contact.latitude && contact.longitude
          ? { lat: contact.latitude, lng: contact.longitude }
          : null,
      vertices: Array.isArray(contact.vertices)
        ? contact.vertices.map((v) =>
            Array.isArray(v)
              ? { lat: v[1], lng: v[0] }
              : {
                  lat: (v as { lat: number }).lat,
                  lng: (v as { lng: number }).lng,
                }
          )
        : [],
    },
    category_ids: contact.categories.map((cat) => cat.id),
    contact_details: hydrateContactDetailsForForm(contact.contact_details, {
      full_name: contact.full_name,
      phone_number: contact.phone_number,
    }),
  };
}

export function farmFormDataToUpdatePayload(formData: FarmContactFormData) {
  const legacy = syncLegacyFieldsFromDetails(formData.contact_details);

  return {
    full_name: legacy.full_name,
    phone_number: legacy.phone_number || undefined,
    contact_details: mapContactDetailsToApi(formData.contact_details),
    email: formData.email || undefined,
    company_name: formData.company_name || undefined,
    description: formData.description || undefined,
    website_link: formData.website_link || undefined,
    street_address: formData.street_address || undefined,
    city: formData.city || undefined,
    state: formData.state || undefined,
    zip_code: formData.zip_code || undefined,
    category_ids: formData.category_ids,
    latitude: formData.mapData.location?.lat,
    longitude: formData.mapData.location?.lng,
    vertices:
      formData.mapData.vertices.length > 0
        ? formData.mapData.vertices.map((v) => [v.lng, v.lat])
        : formData.mapData.location
          ? [
              [
                formData.mapData.location.lng - 0.001,
                formData.mapData.location.lat - 0.001,
              ],
              [
                formData.mapData.location.lng + 0.001,
                formData.mapData.location.lat - 0.001,
              ],
              [
                formData.mapData.location.lng + 0.001,
                formData.mapData.location.lat + 0.001,
              ],
              [
                formData.mapData.location.lng - 0.001,
                formData.mapData.location.lat + 0.001,
              ],
            ]
          : undefined,
  };
}
