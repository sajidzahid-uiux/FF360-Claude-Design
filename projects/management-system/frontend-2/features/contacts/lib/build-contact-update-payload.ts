import type { ContactUpdatePayload } from "@/api/types";
import type { ContactFormData } from "@/features/contacts/model";

import {
  mapContactDetailsToApi,
  syncLegacyFieldsFromDetails,
} from "./contactDetails";

function buildDefaultVertices(location: { lat: number; lng: number }) {
  return [
    [location.lng - 0.001, location.lat - 0.001],
    [location.lng + 0.001, location.lat - 0.001],
    [location.lng + 0.001, location.lat + 0.001],
    [location.lng - 0.001, location.lat + 0.001],
  ] as [number, number][];
}

/** Builds the contacts API patch payload — same rules as the legacy contact detail form. */
export function buildContactUpdatePayload(
  formData: ContactFormData
): ContactUpdatePayload {
  const legacy = syncLegacyFieldsFromDetails(formData.contact_details);
  const categoryIds = formData.category_ids.filter(
    (id): id is number => typeof id === "number" && !Number.isNaN(id)
  );

  return {
    full_name: legacy.full_name,
    phone_number: legacy.phone_number || undefined,
    contact_details: mapContactDetailsToApi(formData.contact_details),
    email: formData.email || undefined,
    home_phone_number: formData.home_phone_number || undefined,
    company_name: formData.company_name || undefined,
    description: formData.description || undefined,
    website_link: formData.website_link || undefined,
    street_address: formData.street_address || undefined,
    city: formData.city || undefined,
    state: formData.state || undefined,
    zip_code: formData.zip_code || undefined,
    category_ids: categoryIds,
    latitude: formData.mapData.location?.lat,
    longitude: formData.mapData.location?.lng,
    vertices:
      formData.mapData.vertices.length > 0
        ? formData.mapData.vertices.map((v) => [v.lng, v.lat])
        : formData.mapData.location
          ? buildDefaultVertices(formData.mapData.location)
          : undefined,
  };
}
