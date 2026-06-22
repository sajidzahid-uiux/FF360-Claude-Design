import type { OrganizationCreateFormValues } from '../components/widgets/OrganizationSwitcher/OrganizationCreateForm';

/** Builds multipart form data for `POST/PATCH ms/organizations/`. */
export function toOrganizationCreateFormData(
  values: OrganizationCreateFormValues
): FormData {
  const formData = new FormData();
  formData.append('name', values.name);
  formData.append('email', values.email);
  formData.append('phone_number', values.phoneNumber);
  formData.append('address', values.address);

  if (values.latitude != null) {
    formData.append('latitude', String(values.latitude));
  }
  if (values.longitude != null) {
    formData.append('longitude', String(values.longitude));
  }
  if (values.logo) {
    formData.append('logo', values.logo);
  }

  return formData;
}
