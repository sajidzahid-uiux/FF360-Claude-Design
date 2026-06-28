"use client";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

import { Button, ButtonVariantEnum } from "@fieldflow360/org-ui";
import { AlertCircle, Info } from "lucide-react";
import { z } from "zod";

import {
  CONTACT_FIELD_LIMITS,
  DEFAULT_FARM_CONTACT_FORM_DATA,
  type FarmContactFormData,
} from "@/features/contacts/model";
import { CategoryDialog } from "@/features/contacts/ui/CategoryDialog";
import { ContactCategoryDropdown } from "@/features/contacts/ui/ContactCategoryDropdown";
import { ContactDetailsEditor } from "@/features/contacts/ui/ContactDetailsEditor";
import { ContactFormErrorSummary } from "@/features/contacts/ui/ContactFormErrorSummary";
import { extractFormFieldErrors } from "@/features/forms";
import type { FormSchema } from "@/features/forms/ui";
import { DeckBoundaryMap } from "@/features/map/ui";
import {
  useCategoryMutations,
  useContactCategories,
  useOrganizationData,
  useRouteIds,
} from "@/hooks";
import { useModalStack } from "@/shared/model/use-modal-stack";
import { type BoundaryMapRef, CenterOnLocation } from "@/shared/ui/common/map";
import { Label, SanitizedInput } from "@/shared/ui/primitives";
import { validateZipCode } from "@/utils/validation/contactValidation";

import {
  getContactDetailsErrorMessage,
  mapApiContactDetailsToForm,
  normalizeContactDetailRows,
  validateContactDetails,
} from "./contactDetails";
import {
  contactDetailRowSchema,
  contactFormCategoryIdsSchema,
  contactFormMapDataSchema,
} from "./contactFormZodSchemas";

const farmContactFormValidation = z
  .object({
    full_name: z.string().optional(),
    email: z
      .string()
      .max(CONTACT_FIELD_LIMITS.email)
      .optional()
      .or(z.literal(""))
      .refine(
        (val) =>
          !val || !val.trim() || z.string().email().safeParse(val).success,
        { message: "Please enter a valid email address" }
      ),
    company_name: z
      .string()
      .max(CONTACT_FIELD_LIMITS.company_name)
      .optional()
      .or(z.literal("")),
    description: z
      .string()
      .max(CONTACT_FIELD_LIMITS.description)
      .optional()
      .or(z.literal("")),
    website_link: z
      .string()
      .max(CONTACT_FIELD_LIMITS.website_link)
      .optional()
      .or(z.literal(""))
      .refine((val) => !val || !val.trim() || /^https?:\/\/.+/.test(val), {
        message: "Website link must start with http:// or https://",
      }),
    street_address: z
      .string()
      .max(CONTACT_FIELD_LIMITS.street_address)
      .optional()
      .or(z.literal("")),
    city: z
      .string()
      .max(CONTACT_FIELD_LIMITS.city)
      .optional()
      .or(z.literal("")),
    state: z
      .string()
      .max(CONTACT_FIELD_LIMITS.state)
      .optional()
      .or(z.literal("")),
    zip_code: z
      .string()
      .max(CONTACT_FIELD_LIMITS.zip_code)
      .optional()
      .or(z.literal(""))
      .superRefine((val, ctx) => {
        if (typeof val !== "string" || !val.trim()) return;
        const err = validateZipCode(val);
        if (err) ctx.addIssue({ code: z.ZodIssueCode.custom, message: err });
      }),
    mapData: contactFormMapDataSchema,
    category_ids: contactFormCategoryIdsSchema,
    contact_details: z.array(contactDetailRowSchema).min(1),
  })
  .superRefine((data, ctx) => {
    const detailsError = validateContactDetails(
      normalizeContactDetailRows(data.contact_details)
    );
    if (detailsError) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: getContactDetailsErrorMessage(detailsError),
        path: ["contact_details"],
      });
    }
  });

const renderFieldErrorTooltip = (
  fieldName: string,
  children: ReactNode,
  error: string | undefined,
  openTooltips: Record<string, boolean>,
  toggleTooltip: (fieldName: string) => void
) => {
  if (!error) return children;
  const isOpen = openTooltips[fieldName];
  return (
    <div className="group relative">
      <div className="flex items-center gap-1">
        {children}
        <button
          className="text-feedback-error hover:bg-feedback-error-soft rounded p-1 md:hidden"
          type="button"
          onClick={() => toggleTooltip(fieldName)}
        >
          <Info className="h-3 w-3" />
        </button>
      </div>
      <div className="bg-feedback-error text-text-inverse pointer-events-none absolute bottom-full left-0 z-50 mb-2 hidden rounded px-2 py-1 text-xs whitespace-nowrap opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 md:block">
        <div className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          <span>{error}</span>
        </div>
      </div>
      {isOpen ? (
        <div className="bg-feedback-error text-text-inverse absolute bottom-full left-0 z-50 mb-2 rounded px-2 py-1 text-xs whitespace-nowrap shadow-lg md:hidden">
          <div className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            <span>{error}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const columnCardClass =
  "border-border-subtle bg-bg-surface-elevated flex min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-lg border p-5 shadow-sm";

const columnsGridClass =
  "grid min-h-0 w-full grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch";

const fieldLabel = (text: string, htmlFor?: string) => (
  <Label htmlFor={htmlFor} variant="formMedium">
    {text}
  </Label>
);

interface FarmContactFormContentProps {
  value: FarmContactFormData;
  onChange: (value: FarmContactFormData) => void;
  formMethods?: {
    formState?: {
      errors?: Record<string, unknown>;
      isSubmitting?: boolean;
    };
  };
  readOnly?: boolean;
  inlineActions?: boolean;
  lockedCategoryIds?: number[];
  onCancel?: () => void;
}

function FarmContactFormContent({
  value,
  onChange,
  formMethods,
  readOnly = false,
  inlineActions = false,
  lockedCategoryIds = [],
  onCancel,
}: FarmContactFormContentProps) {
  const formData = value || DEFAULT_FARM_CONTACT_FORM_DATA;
  const [openTooltips, setOpenTooltips] = useState<Record<string, boolean>>({});
  const { stack, openModal, closeModalKey } = useModalStack();
  const showCategoryDialog = stack.some((f) => f.key === "add-category");
  const mapLocationRef = useRef<BoundaryMapRef>(null);

  const {
    categories,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useContactCategories();
  const { create: createCategory } = useCategoryMutations();
  const { data: organizationsData } = useOrganizationData();
  const { orgId: organization } = useRouteIds();

  const formErrors = formMethods?.formState?.errors || {};
  const contactFormErrors = formErrors.contactForm as
    | Record<string, unknown>
    | undefined;
  const fieldErrors = extractFormFieldErrors(contactFormErrors);
  const contactDetailsError =
    typeof contactFormErrors?.contact_details === "object" &&
    contactFormErrors?.contact_details !== null &&
    "message" in (contactFormErrors.contact_details as object)
      ? String(
          (contactFormErrors.contact_details as { message?: string }).message
        )
      : typeof fieldErrors.contact_details === "string"
        ? fieldErrors.contact_details
        : undefined;

  const toggleTooltip = (fieldName: string) => {
    setOpenTooltips((prev) => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".group")) setOpenTooltips({});
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (
    field: keyof FarmContactFormData,
    newValue: string
  ) => {
    const limit =
      CONTACT_FIELD_LIMITS[field as keyof typeof CONTACT_FIELD_LIMITS];
    if (typeof limit === "number" && newValue.length > limit) return;
    onChange({ ...formData, [field]: newValue });
  };

  const normalizedCategoryIds = useMemo(
    () => formData.category_ids.map((id) => Number(id)),
    [formData.category_ids]
  );

  const handleCategoryToggle = (categoryId: number) => {
    const id = Number(categoryId);
    const ids = formData.category_ids.map((cid) => Number(cid));
    const lockedIds = lockedCategoryIds.map((cid) => Number(cid));
    if (ids.includes(id)) {
      if (lockedIds.includes(id)) return;
      onChange({
        ...formData,
        category_ids: ids.filter((existingId) => existingId !== id),
      });
      return;
    }
    onChange({ ...formData, category_ids: [...ids, id] });
  };

  const handleLocationChange = (
    newLocation: { lat: number; lng: number } | null
  ) => {
    onChange({
      ...formData,
      mapData: { ...formData.mapData, location: newLocation },
    });
  };

  const handleVerticesChange = (
    newVertices: { lat: number; lng: number }[]
  ) => {
    onChange({
      ...formData,
      mapData: { ...formData.mapData, vertices: newVertices },
    });
  };

  const isSubmitting = formMethods?.formState?.isSubmitting ?? false;

  return (
    <div className="flex flex-col space-y-4">
      <ContactFormErrorSummary fieldErrors={fieldErrors} />

      <div className={columnsGridClass}>
        {/* Left: contact details and map */}
        <div className={columnCardClass}>
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
            <ContactDetailsEditor
              errors={contactDetailsError}
              readOnly={readOnly}
              value={formData.contact_details}
              onChange={(contact_details) =>
                onChange({ ...formData, contact_details })
              }
            />

            <div className="min-w-0 shrink-0">
              {fieldLabel("Set Location")}
              <CenterOnLocation
                boundaryMapRef={mapLocationRef}
                className="mt-1 mb-2"
                organizationLocationAvailable={
                  !!organizationsData && !!organization
                }
                showOrgLocationButton={true}
                userLocationAvailable={true}
              />
              <div className="max-w-full min-w-0 overflow-hidden rounded-md">
                <DeckBoundaryMap
                  ref={mapLocationRef}
                  className="w-full"
                  hideActionMenu={true}
                  location={formData.mapData.location ?? undefined}
                  mapHeight={340}
                  organizationLocation={
                    organizationsData && organization
                      ? (() => {
                          const currentOrg = organizationsData.find(
                            (org) => org.id === Number(organization)
                          );
                          return currentOrg?.latitude && currentOrg?.longitude
                            ? {
                                lat: currentOrg.latitude,
                                lng: currentOrg.longitude,
                              }
                            : null;
                        })()
                      : null
                  }
                  readOnly={readOnly}
                  vertices={formData.mapData.vertices}
                  onChangeLocation={handleLocationChange}
                  onChangeVertices={handleVerticesChange}
                />
              </div>
            </div>
          </div>

          {inlineActions && onCancel ? (
            <div className="mt-auto flex justify-start pt-6">
              <Button
                aria-label="Cancel"
                disabled={isSubmitting}
                title="Cancel"
                variant={ButtonVariantEnum.SURFACE}
                onClick={onCancel}
              />
            </div>
          ) : null}
        </div>

        {/* Right: email, address, actions */}
        <div className={columnCardClass}>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <div className="space-y-3">
              <div>
                {renderFieldErrorTooltip(
                  "email",
                  fieldLabel("Email", "farm-email"),
                  fieldErrors.email,
                  openTooltips,
                  toggleTooltip
                )}
                <SanitizedInput
                  className="mt-1 w-full"
                  disabled={readOnly}
                  id="farm-email"
                  placeholder="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <ContactCategoryDropdown
                    categories={categories}
                    hasError={!!categoriesError}
                    isLoading={categoriesLoading}
                    lockedCategoryIds={lockedCategoryIds}
                    readOnly={readOnly}
                    selectedIds={normalizedCategoryIds}
                    onToggle={handleCategoryToggle}
                  />
                </div>

                <div>
                  {fieldLabel("Company Name", "farm-company")}
                  <SanitizedInput
                    className="mt-1 w-full"
                    disabled={readOnly}
                    id="farm-company"
                    placeholder="Company Name"
                    value={formData.company_name}
                    onChange={(e) =>
                      handleInputChange("company_name", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  {renderFieldErrorTooltip(
                    "description",
                    fieldLabel("Description", "farm-description"),
                    fieldErrors.description,
                    openTooltips,
                    toggleTooltip
                  )}
                  <SanitizedInput
                    className="mt-1 w-full"
                    disabled={readOnly}
                    id="farm-description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                  />
                </div>

                <div>
                  {renderFieldErrorTooltip(
                    "website_link",
                    fieldLabel("Website Link", "farm-website"),
                    fieldErrors.website_link,
                    openTooltips,
                    toggleTooltip
                  )}
                  <SanitizedInput
                    className="mt-1 w-full"
                    disabled={readOnly}
                    id="farm-website"
                    placeholder="https://example.com"
                    value={formData.website_link}
                    onChange={(e) =>
                      handleInputChange("website_link", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="pt-2" />

              <div className="space-y-3">
                {fieldLabel("Street Address", "farm-street")}
                <SanitizedInput
                  className="mt-1 w-full"
                  disabled={readOnly}
                  id="farm-street"
                  placeholder="Street Address"
                  value={formData.street_address}
                  onChange={(e) =>
                    handleInputChange("street_address", e.target.value)
                  }
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    {fieldLabel("City", "farm-city")}
                    <SanitizedInput
                      className="mt-1 w-full"
                      disabled={readOnly}
                      id="farm-city"
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    {fieldLabel("State", "farm-state")}
                    <SanitizedInput
                      className="mt-1 w-full"
                      disabled={readOnly}
                      id="farm-state"
                      placeholder="State"
                      value={formData.state}
                      onChange={(e) =>
                        handleInputChange("state", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    {fieldLabel("Zip Code", "farm-zip")}
                    <SanitizedInput
                      className="mt-1 w-full"
                      disabled={readOnly}
                      id="farm-zip"
                      placeholder="Zip Code"
                      value={formData.zip_code}
                      onChange={(e) =>
                        handleInputChange("zip_code", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto flex flex-col items-end gap-4 pt-6">
              {!readOnly ? (
                <Button
                  aria-label="Add New Category"
                  title="Add New Category"
                  onClick={() => openModal("add-category")}
                />
              ) : null}

              {inlineActions ? (
                <Button
                  aria-label={isSubmitting ? "Creating..." : "Submit"}
                  disabled={isSubmitting || readOnly}
                  loading={isSubmitting}
                  title={isSubmitting ? "Creating..." : "Submit"}
                  type="submit"
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <CategoryDialog
        categoryColor=""
        categoryName=""
        open={showCategoryDialog}
        title="Add New Category"
        onCancel={() => closeModalKey("add-category")}
        onOpenChange={(o) => {
          if (!o) closeModalKey("add-category");
        }}
        onSave={async (name, color) => {
          await createCategory.mutateAsync({ name, color });
          closeModalKey("add-category");
        }}
      />
    </div>
  );
}

export interface BuildFarmContactFormSchemaOptions {
  isEdit?: boolean;
  hideActionButtons?: boolean;
  inlineActions?: boolean;
  lockedCategoryIds?: number[];
  onCancel?: () => void;
}

export function buildFarmContactFormSchema(
  _initialValues?: Partial<FarmContactFormData>,
  options?: BuildFarmContactFormSchemaOptions
): FormSchema {
  const isEdit = options?.isEdit ?? false;
  const hideActionButtons =
    options?.hideActionButtons ?? options?.inlineActions ?? false;
  const inlineActions = options?.inlineActions ?? false;
  const lockedCategoryIds = options?.lockedCategoryIds ?? [];
  const onCancel = options?.onCancel;

  return {
    id: "farm-contact-form",
    sections: [
      {
        id: "farm-contact-form-section",
        useCard: false,
        className: "",
        fields: [
          {
            name: "contactForm",
            label: "",
            type: "custom",
            required: true,
            hideLabel: true,
            validation: farmContactFormValidation,
            customComponent: ({
              value,
              onChange,
              formMethods,
              disabled: readOnly = false,
            }) => (
              <FarmContactFormContent
                formMethods={formMethods}
                inlineActions={inlineActions}
                lockedCategoryIds={lockedCategoryIds}
                readOnly={readOnly}
                value={value as FarmContactFormData}
                onCancel={onCancel}
                onChange={onChange}
              />
            ),
          },
        ],
      },
    ],
    submitButton: {
      label: isEdit ? "Save Changes" : "Submit",
      loadingLabel: isEdit ? "Saving..." : "Creating...",
      show: !hideActionButtons,
      className:
        "min-w-[100px] bg-accent text-text-inverse hover:bg-accent/90 px-8 transition-colors",
    },
    cancelButton: {
      label: "Cancel",
      show: !hideActionButtons,
      className: "min-w-[100px] px-8 hover:bg-bg-surface/80 transition-colors",
    },
  };
}

export { mapApiContactDetailsToForm };
