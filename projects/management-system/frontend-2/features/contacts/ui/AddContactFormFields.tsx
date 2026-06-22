"use client";

import { type ReactNode } from "react";

import {
  Button,
  ButtonVariantEnum,
  Checkbox,
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

import type { ContactCategory } from "@/api/types";
import {
  CONTACT_FIELD_LIMITS,
  ContactDetailsEditor,
  type ContactFormData,
  ContactFormErrorSummary,
  DEFAULT_CONTACT_FORM_DATA,
} from "@/features/contacts";
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
  categoriesMode = "checkbox",
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

  const addCategory = (categoryId: number) => {
    if (readOnly || formData.category_ids.includes(categoryId)) return;

    onChange({
      ...formData,
      category_ids: [...formData.category_ids, categoryId],
    });
    onFieldChange?.("category_ids");
  };

  const removeCategory = (categoryId: number) => {
    if (readOnly) return;

    onChange({
      ...formData,
      category_ids: formData.category_ids.filter((id) => id !== categoryId),
    });
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

  return (
    <div
      className={
        layout === "detail" ? "mx-auto max-w-5xl space-y-5" : "space-y-8"
      }
    >
      <ContactFormErrorSummary fieldErrors={fieldErrors} />
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

      {hideCategoryField ? null : categoriesMode === "checkbox" ? (
        <FormSection
          description="Client Contact is assigned automatically when none are selected."
          layout={layout}
          title="Categories"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-text-muted text-sm">
              Select one or more categories for this contact.
            </p>
            {!readOnly ? (
              <Button
                leftIcon={
                  <PlusCircle aria-hidden className="h-4 w-4" strokeWidth={2} />
                }
                title="Add category"
                onClick={onOpenCategoryDialog}
              />
            ) : null}
          </div>

          {categoriesLoading ? (
            <p className="text-text-muted text-sm">Loading categories…</p>
          ) : null}
          {categoriesError ? (
            <p className="text-feedback-error text-sm">
              Could not load categories.
            </p>
          ) : null}

          {!categoriesLoading && !categoriesError ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {(categories ?? []).map((category: ContactCategory) => {
                const checked = formData.category_ids.includes(category.id);
                const inputId = `add-contact-category-${category.id}`;

                return (
                  <label
                    key={category.id}
                    className="border-border-subtle hover:border-border-subtle/60 hover:bg-bg-hover/40 bg-bg-surface/30 flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60"
                    htmlFor={inputId}
                  >
                    <Checkbox
                      checked={checked}
                      disabled={readOnly}
                      id={inputId}
                      onChange={(event) =>
                        toggleCategory(category.id, event.target.checked)
                      }
                    />
                    <span className="flex min-w-0 flex-1 items-center gap-2">
                      <span
                        aria-hidden
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor: category.color || "#3b82f6",
                        }}
                      />
                      <span className="text-text-primary truncate text-sm font-medium">
                        {category.name}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          ) : null}
        </FormSection>
      ) : isDetailView ? null : (
        <FormSection layout={layout} title="Contact categories">
          <div>
            <p className="text-text-muted mb-2 text-sm">Current categories:</p>
            <div className="flex flex-wrap gap-2">
              {(categories ?? [])
                .filter((cat) => formData.category_ids.includes(cat.id))
                .map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium text-white"
                    style={{ backgroundColor: category.color }}
                  >
                    <span>{category.name}</span>
                    {!readOnly && category.name !== "Client Contact" ? (
                      <button
                        className="ml-1 hover:opacity-80"
                        title="Remove category"
                        type="button"
                        onClick={() => removeCategory(category.id)}
                      >
                        ×
                      </button>
                    ) : null}
                  </div>
                ))}
              {formData.category_ids.length === 0 ? (
                <span className="text-text-muted text-sm">
                  No categories selected
                </span>
              ) : null}
            </div>
          </div>

          {!readOnly && categories && categories.length > 0 ? (
            <div>
              <p className="text-text-muted mb-2 text-sm">
                Available categories:
              </p>
              <div className="flex flex-wrap gap-2">
                {categories
                  .filter((cat) => !formData.category_ids.includes(cat.id))
                  .map((category) => (
                    <button
                      key={category.id}
                      className="hover:bg-bg-surface flex items-center gap-1 rounded-full border-2 px-3 py-1 text-sm font-medium transition-colors"
                      style={{ borderColor: category.color }}
                      type="button"
                      onClick={() => addCategory(category.id)}
                    >
                      <span>+</span>
                      <span>{category.name}</span>
                    </button>
                  ))}
              </div>
              <div className="mt-3">
                <Button
                  aria-label="Add new category"
                  title="Add new category"
                  variant={ButtonVariantEnum.SURFACE}
                  onClick={onOpenCategoryDialog}
                />
              </div>
            </div>
          ) : null}
        </FormSection>
      )}
    </div>
  );
}
