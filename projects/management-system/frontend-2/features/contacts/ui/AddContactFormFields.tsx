"use client";

import { type ReactNode } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  Input,
  LocationPicker,
} from "@fieldflow360/org-ui";
import {
  Building2,
  Globe,
  Mail,
  MapPin,
  Phone,
  PlusCircle,
} from "lucide-react";

import {
  CONTACT_FIELD_LIMITS,
  ContactDetailsEditor,
  type ContactFormData,
  ContactFormErrorSummary,
  DEFAULT_CONTACT_FORM_DATA,
} from "@/features/contacts";

import { ContactCategoryDropdown } from "./ContactCategoryDropdown";
import {
  type ContactDetailFormRow,
  fromLocationPoint,
  syncLegacyFieldsFromDetails,
  toLocationPoint,
} from "@/features/contacts/lib";
import { useContactCategories } from "@/hooks";

function CharCount({ current, max }: { current: number; max: number }) {
  return (
    <p className="text-text-muted text-xs">
      {current}/{max}
    </p>
  );
}

function FormSection({
  title,
  description,
  children,
  layout = "modal",
}: {
  title: string;
  description?: string;
  children: ReactNode;
  layout?: "modal" | "detail";
}) {
  return (
    <section
      className={
        layout === "detail"
          ? "border-border-subtle bg-bg-surface-elevated space-y-4 rounded-xl border p-4 sm:p-5"
          : "space-y-4"
      }
    >
      <div>
        <h3 className="text-text-primary text-base font-semibold">{title}</h3>
        {description ? (
          <p className="text-text-muted mt-0.5 text-sm">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function ReadOnlyValue({ label, value }: { label: string; value: string }) {
  const displayValue = value.trim() || "—";

  return (
    <div className="min-w-0 space-y-1">
      <p className="text-text-muted text-xs font-medium">{label}</p>
      <p className="text-text-primary text-sm break-words">{displayValue}</p>
    </div>
  );
}

export interface AddContactFormFieldsProps {
  value: ContactFormData;
  onChange: (value: ContactFormData) => void;
  fieldErrors: Record<string, string>;
  onFieldChange?: (field: string) => void;
  onOpenCategoryDialog?: () => void;
  readOnly?: boolean;
  categoriesMode?: "checkbox" | "pills";
  layout?: "modal" | "detail";
  hideCategoryField?: boolean;
  mapHeight?: number;
}

export function AddContactFormFields({
  value,
  onChange,
  fieldErrors,
  onFieldChange,
  onOpenCategoryDialog,
  readOnly = false,
  layout = "modal",
  hideCategoryField = false,
  mapHeight: mapHeightProp,
}: AddContactFormFieldsProps) {
  const formData = value ?? DEFAULT_CONTACT_FORM_DATA;
  const isDetailView = layout === "detail" && readOnly;
  const mapHeight =
    mapHeightProp ?? (isDetailView ? 240 : layout === "detail" ? 280 : 320);

  const {
    categories,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useContactCategories();

  const updateField = (field: keyof ContactFormData, nextValue: string) => {
    if (readOnly) return;

    const limit =
      CONTACT_FIELD_LIMITS[field as keyof typeof CONTACT_FIELD_LIMITS];
    if (typeof limit === "number" && nextValue.length > limit) return;

    onChange({ ...formData, [field]: nextValue });
    onFieldChange?.(field);
  };

  const toggleCategory = (categoryId: number, checked: boolean) => {
    if (readOnly) return;

    const nextIds = checked
      ? [...formData.category_ids, categoryId]
      : formData.category_ids.filter((id) => id !== categoryId);

    onChange({ ...formData, category_ids: nextIds });
    onFieldChange?.("category_ids");
  };

  const inputDisabled = readOnly && !isDetailView;

  const contactDetailsError =
    fieldErrors.contact_details ??
    (typeof fieldErrors.contact_details === "string"
      ? fieldErrors.contact_details
      : undefined);

  const handleContactDetailsChange = (rows: ContactDetailFormRow[]) => {
    if (readOnly) return;

    const legacy = syncLegacyFieldsFromDetails(rows);
    onChange({
      ...formData,
      contact_details: rows,
      full_name: legacy.full_name,
      phone_number: legacy.phone_number,
    });
    onFieldChange?.("contact_details");
  };

  const contactDetailsSection = (
    <FormSection
      description="Add one or more names and phone numbers; mark one as primary for lists and search."
      layout={layout}
      title="Contact details"
    >
      <ContactDetailsEditor
        errors={contactDetailsError}
        readOnly={readOnly}
        value={formData.contact_details}
        variant="modal"
        onChange={handleContactDetailsChange}
      />
    </FormSection>
  );

  const basicInfoSection = (
      <FormSection
        description="Additional contact and company information."
        layout={layout}
        title="Basic information"
      >
        {isDetailView ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <ReadOnlyValue label="Email" value={formData.email} />
            <ReadOnlyValue
              label="Home phone"
              value={formData.home_phone_number}
            />
            <div className="sm:col-span-2">
              <ReadOnlyValue label="Company" value={formData.company_name} />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              disabled={inputDisabled}
              error={fieldErrors.email}
              label="Email"
              leftIcon={
                <Mail aria-hidden className="h-4 w-4" strokeWidth={2} />
              }
              maxLength={CONTACT_FIELD_LIMITS.email}
              placeholder="email@example.com"
              type="email"
              value={formData.email}
              onChange={(event) => updateField("email", event.target.value)}
            />
            <Input
              disabled={inputDisabled}
              error={fieldErrors.home_phone_number}
              label="Home phone"
              leftIcon={
                <Phone aria-hidden className="h-4 w-4" strokeWidth={2} />
              }
              maxLength={CONTACT_FIELD_LIMITS.home_phone_number}
              placeholder="Home phone (optional)"
              type="tel"
              value={formData.home_phone_number}
              onChange={(event) =>
                updateField("home_phone_number", event.target.value)
              }
            />
            <Input
              className="sm:col-span-2"
              disabled={inputDisabled}
              error={fieldErrors.company_name}
              label="Company"
              leftIcon={
                <Building2 aria-hidden className="h-4 w-4" strokeWidth={2} />
              }
              maxLength={CONTACT_FIELD_LIMITS.company_name}
              placeholder="Company name"
              value={formData.company_name}
              onChange={(event) =>
                updateField("company_name", event.target.value)
              }
            />
          </div>
        )}
      </FormSection>
  );

  const additionalSection = (
      <FormSection layout={layout} title="Additional details">
        {isDetailView ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <ReadOnlyValue label="Description" value={formData.description} />
            </div>
            <div className="sm:col-span-2">
              <ReadOnlyValue label="Website" value={formData.website_link} />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <label
                className="text-text-primary block text-sm font-medium"
                htmlFor="contact-description"
              >
                Description
              </label>
              <textarea
                className="border-border-subtle bg-bg-surface-elevated text-text-primary focus:ring-accent/35 min-h-[88px] w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={inputDisabled}
                id="contact-description"
                maxLength={CONTACT_FIELD_LIMITS.description}
                placeholder="Notes about this contact"
                value={formData.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
              />
              <CharCount
                current={formData.description.length}
                max={CONTACT_FIELD_LIMITS.description}
              />
            </div>
            <Input
              className="sm:col-span-2"
              disabled={inputDisabled}
              error={fieldErrors.website_link}
              helperText="Include https://"
              label="Website"
              leftIcon={
                <Globe aria-hidden className="h-4 w-4" strokeWidth={2} />
              }
              maxLength={CONTACT_FIELD_LIMITS.website_link}
              placeholder="https://example.com"
              type="url"
              value={formData.website_link}
              onChange={(event) =>
                updateField("website_link", event.target.value)
              }
            />
          </div>
        )}
      </FormSection>
  );

  const addressSection = (
      <FormSection
        description="Used for mailing labels and location context."
        layout={layout}
        title="Address"
      >
        {isDetailView ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <ReadOnlyValue
                label="Street address"
                value={formData.street_address}
              />
            </div>
            <ReadOnlyValue label="City" value={formData.city} />
            <ReadOnlyValue label="State" value={formData.state} />
            <ReadOnlyValue label="Zip code" value={formData.zip_code} />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              className="sm:col-span-2"
              disabled={inputDisabled}
              label="Street address"
              leftIcon={
                <MapPin aria-hidden className="h-4 w-4" strokeWidth={2} />
              }
              maxLength={CONTACT_FIELD_LIMITS.street_address}
              placeholder="Street address"
              value={formData.street_address}
              onChange={(event) =>
                updateField("street_address", event.target.value)
              }
            />
            <Input
              disabled={inputDisabled}
              label="City"
              maxLength={CONTACT_FIELD_LIMITS.city}
              placeholder="City"
              value={formData.city}
              onChange={(event) => updateField("city", event.target.value)}
            />
            <Input
              disabled={inputDisabled}
              label="State"
              maxLength={CONTACT_FIELD_LIMITS.state}
              placeholder="State"
              value={formData.state}
              onChange={(event) => updateField("state", event.target.value)}
            />
            <Input
              disabled={inputDisabled}
              error={fieldErrors.zip_code}
              label="Zip code"
              maxLength={CONTACT_FIELD_LIMITS.zip_code}
              placeholder="Zip code"
              value={formData.zip_code}
              onChange={(event) => updateField("zip_code", event.target.value)}
            />
          </div>
        )}
      </FormSection>
  );

  const locationSection = (
      <FormSection layout={layout} title="Location">
        <div className={isDetailView ? "contact-location-readonly" : undefined}>
          <LocationPicker
            label={layout === "detail" ? undefined : "Map location"}
            location={toLocationPoint(formData.mapData.location)}
            mapHeight={mapHeight}
            readOnly={isDetailView}
            onLocationChange={(point) => {
              if (readOnly) return;

              onChange({
                ...formData,
                mapData: {
                  location: fromLocationPoint(point),
                  vertices: [],
                },
              });
              onFieldChange?.("mapData");
            }}
          />
        </div>
      </FormSection>
  );

  const categoriesSection = hideCategoryField ? null : (
    <FormSection
      description="Client Contact is assigned automatically when none are selected."
      layout={layout}
      title="Categories"
    >
      <ContactCategoryDropdown
        categories={categories}
        hasError={!!categoriesError}
        isLoading={categoriesLoading}
        readOnly={readOnly}
        selectedIds={formData.category_ids.map(Number)}
        onToggle={(id) =>
          toggleCategory(
            Number(id),
            !formData.category_ids.includes(Number(id))
          )
        }
      />
      {!readOnly ? (
        <Button
          aria-label="Add new category"
          className="mt-1.5 h-auto px-0 text-xs"
          leftIcon={
            <PlusCircle aria-hidden className="h-3.5 w-3.5" strokeWidth={2} />
          }
          size={ComponentSizeEnum.SM}
          title="Add new category"
          variant={ButtonVariantEnum.GHOST}
          onClick={onOpenCategoryDialog}
        />
      ) : null}
    </FormSection>
  );

  if (layout === "modal") {
    return (
      <div className="space-y-6">
        <ContactFormErrorSummary fieldErrors={fieldErrors} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
          <div className="space-y-6">
            {contactDetailsSection}
            {locationSection}
          </div>
          <div className="space-y-6">
            {basicInfoSection}
            {additionalSection}
            {addressSection}
            {categoriesSection}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">
      <ContactFormErrorSummary fieldErrors={fieldErrors} />
      {contactDetailsSection}
      {basicInfoSection}
      {additionalSection}
      {addressSection}
      {locationSection}
      {categoriesSection}
    </div>
  );
}
