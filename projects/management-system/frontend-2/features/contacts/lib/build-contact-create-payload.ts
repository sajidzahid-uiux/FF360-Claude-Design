import type { ContactCategory, ContactCreatePayload } from "@/api/types";
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

/** Builds the contacts API create payload — same rules as the legacy add-contact form. */
export function buildContactCreatePayload(
  formData: ContactFormData,
  categories: ContactCategory[] | undefined
): ContactCreatePayload {
  const legacy = syncLegacyFieldsFromDetails(formData.contact_details);

  const categoryIds = formData.category_ids.filter(
    (id): id is number => typeof id === "number" && !Number.isNaN(id)
  );
  let finalCategoryIds = categoryIds;

  if (categoryIds.length === 0) {
    const clientContactCategory = categories?.find(
      (cat) => cat.name.toLowerCase() === "client contact"
    );
    if (clientContactCategory) {
      finalCategoryIds = [clientContactCategory.id];
    }
  }

  const payload: ContactCreatePayload = {
    full_name: legacy.full_name,
    contact_details: mapContactDetailsToApi(formData.contact_details),
    category_ids: finalCategoryIds,
  };

  if (formData.email.trim()) payload.email = formData.email.trim();
  if (legacy.phone_number) payload.phone_number = legacy.phone_number;
  if (formData.home_phone_number.trim()) {
    payload.home_phone_number = formData.home_phone_number.trim();
  }
  if (formData.company_name.trim())
    payload.company_name = formData.company_name.trim();
  if (formData.description.trim())
    payload.description = formData.description.trim();
  if (formData.website_link.trim())
    payload.website_link = formData.website_link.trim();
  if (formData.street_address.trim()) {
    payload.street_address = formData.street_address.trim();
  }
  if (formData.city.trim()) payload.city = formData.city.trim();
  if (formData.state.trim()) payload.state = formData.state.trim();
  if (formData.zip_code.trim()) payload.zip_code = formData.zip_code.trim();

  if (formData.mapData.location) {
    payload.longitude = formData.mapData.location.lng;
    payload.latitude = formData.mapData.location.lat;
  }

  if (formData.mapData.vertices.length > 0) {
    payload.vertices = formData.mapData.vertices.map((vertex) => [
      vertex.lng,
      vertex.lat,
    ]);
  } else if (formData.mapData.location) {
    payload.vertices = buildDefaultVertices(formData.mapData.location);
  }

  return payload;
}
