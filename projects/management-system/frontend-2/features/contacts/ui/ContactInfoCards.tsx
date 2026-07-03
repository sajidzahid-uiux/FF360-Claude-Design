"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";

import { Input, LocationPicker } from "@fieldflow360/org-ui";
import { Building2, Globe, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

import type { Contact } from "@/api/types";
import {
  type ContactDetailFormRow,
  ensureLockedCategoryIds,
  fromLocationPoint,
  getLockedClientContactCategoryIds,
  hydrateContactDetailsForForm,
  mapContactDetailsToApi,
  syncLegacyFieldsFromDetails,
  toLocationPoint,
} from "@/features/contacts/lib";
import { CONTACT_FIELD_LIMITS } from "@/features/contacts/model";
import { useContactCategories, useContactMutations } from "@/hooks";

import { ContactCategoryDropdown } from "./ContactCategoryDropdown";
import { ContactDetailsEditor } from "./ContactDetailsEditor";
import { EditableDetailCard } from "./EditableDetailCard";

interface CardProps {
  contact: Contact;
  canEdit: boolean;
}

function ViewGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function ViewField({
  label,
  value,
  full = false,
}: {
  label: string;
  value?: string | null;
  full?: boolean;
}) {
  return (
    <div className={full ? "min-w-0 space-y-1 sm:col-span-2" : "min-w-0 space-y-1"}>
      <p className="text-text-muted text-xs font-medium">{label}</p>
      <p className="text-text-primary text-sm break-words">
        {value?.trim() ? value : "—"}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function ContactDetailsCard({ contact, canEdit }: CardProps) {
  const { update } = useContactMutations();
  const makeRows = useMemo(
    () => () =>
      hydrateContactDetailsForForm(contact.contact_details, {
        full_name: contact.full_name,
        phone_number: contact.phone_number,
      }),
    [contact]
  );
  const [rows, setRows] = useState<ContactDetailFormRow[]>(makeRows);
  useEffect(() => setRows(makeRows()), [makeRows]);

  const handleSave = async () => {
    const legacy = syncLegacyFieldsFromDetails(rows);
    await update.mutateAsync({
      id: contact.id,
      data: {
        full_name: legacy.full_name,
        phone_number: legacy.phone_number || undefined,
        contact_details: mapContactDetailsToApi(rows),
      },
    });
    toast.success("Contact details updated");
  };

  return (
    <EditableDetailCard
      canEdit={canEdit}
      description="Names and phone numbers; mark one as primary for lists and search."
      isSaving={update.isPending}
      title="Contact details"
      onCancel={() => setRows(makeRows())}
      onSave={handleSave}
    >
      {(editing) => (
        <ContactDetailsEditor
          readOnly={!editing}
          value={rows}
          variant="modal"
          onChange={setRows}
        />
      )}
    </EditableDetailCard>
  );
}

/* -------------------------------------------------------------------------- */

function BasicInfoCard({ contact, canEdit }: CardProps) {
  const { update } = useContactMutations();
  const initial = useMemo(
    () => () => ({
      email: contact.email ?? "",
      home_phone_number: contact.home_phone_number ?? "",
      company_name: contact.company_name ?? "",
    }),
    [contact]
  );
  const [draft, setDraft] = useState(initial);
  useEffect(() => setDraft(initial()), [initial]);

  const handleSave = async () => {
    await update.mutateAsync({
      id: contact.id,
      data: {
        email: draft.email || undefined,
        home_phone_number: draft.home_phone_number || undefined,
        company_name: draft.company_name || undefined,
      },
    });
    toast.success("Basic information updated");
  };

  return (
    <EditableDetailCard
      canEdit={canEdit}
      description="Additional contact and company information."
      isSaving={update.isPending}
      title="Basic information"
      onCancel={() => setDraft(initial())}
      onSave={handleSave}
    >
      {(editing) =>
        editing ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Email"
              leftIcon={<Mail aria-hidden className="h-4 w-4" strokeWidth={2} />}
              maxLength={CONTACT_FIELD_LIMITS.email}
              placeholder="email@example.com"
              type="email"
              value={draft.email}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
            />
            <Input
              label="Home phone"
              leftIcon={<Phone aria-hidden className="h-4 w-4" strokeWidth={2} />}
              maxLength={CONTACT_FIELD_LIMITS.home_phone_number}
              placeholder="Home phone (optional)"
              type="tel"
              value={draft.home_phone_number}
              onChange={(e) =>
                setDraft({ ...draft, home_phone_number: e.target.value })
              }
            />
            <Input
              className="sm:col-span-2"
              label="Company"
              leftIcon={
                <Building2 aria-hidden className="h-4 w-4" strokeWidth={2} />
              }
              maxLength={CONTACT_FIELD_LIMITS.company_name}
              placeholder="Company name"
              value={draft.company_name}
              onChange={(e) =>
                setDraft({ ...draft, company_name: e.target.value })
              }
            />
          </div>
        ) : (
          <ViewGrid>
            <ViewField label="Email" value={contact.email} />
            <ViewField label="Home phone" value={contact.home_phone_number} />
            <ViewField full label="Company" value={contact.company_name} />
          </ViewGrid>
        )
      }
    </EditableDetailCard>
  );
}

/* -------------------------------------------------------------------------- */

function AdditionalDetailsCard({ contact, canEdit }: CardProps) {
  const { update } = useContactMutations();
  const initial = useMemo(
    () => () => ({
      description: contact.description ?? "",
      website_link: contact.website_link ?? "",
    }),
    [contact]
  );
  const [draft, setDraft] = useState(initial);
  useEffect(() => setDraft(initial()), [initial]);

  const handleSave = async () => {
    await update.mutateAsync({
      id: contact.id,
      data: {
        description: draft.description || undefined,
        website_link: draft.website_link || undefined,
      },
    });
    toast.success("Additional details updated");
  };

  return (
    <EditableDetailCard
      canEdit={canEdit}
      isSaving={update.isPending}
      title="Additional details"
      onCancel={() => setDraft(initial())}
      onSave={handleSave}
    >
      {(editing) =>
        editing ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <label
                className="text-text-primary block text-sm font-medium"
                htmlFor="edit-contact-description"
              >
                Description
              </label>
              <textarea
                className="border-border-subtle bg-bg-surface-elevated text-text-primary focus:ring-accent/35 min-h-[88px] w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none focus:ring-2"
                id="edit-contact-description"
                maxLength={CONTACT_FIELD_LIMITS.description}
                placeholder="Notes about this contact"
                value={draft.description}
                onChange={(e) =>
                  setDraft({ ...draft, description: e.target.value })
                }
              />
            </div>
            <Input
              className="sm:col-span-2"
              helperText="Include https://"
              label="Website"
              leftIcon={<Globe aria-hidden className="h-4 w-4" strokeWidth={2} />}
              maxLength={CONTACT_FIELD_LIMITS.website_link}
              placeholder="https://example.com"
              type="url"
              value={draft.website_link}
              onChange={(e) =>
                setDraft({ ...draft, website_link: e.target.value })
              }
            />
          </div>
        ) : (
          <ViewGrid>
            <ViewField full label="Description" value={contact.description} />
            <ViewField full label="Website" value={contact.website_link} />
          </ViewGrid>
        )
      }
    </EditableDetailCard>
  );
}

/* -------------------------------------------------------------------------- */

function AddressCard({ contact, canEdit }: CardProps) {
  const { update } = useContactMutations();
  const initial = useMemo(
    () => () => ({
      street_address: contact.street_address ?? "",
      city: contact.city ?? "",
      state: contact.state ?? "",
      zip_code: contact.zip_code ?? "",
    }),
    [contact]
  );
  const [draft, setDraft] = useState(initial);
  useEffect(() => setDraft(initial()), [initial]);

  const handleSave = async () => {
    await update.mutateAsync({
      id: contact.id,
      data: {
        street_address: draft.street_address || undefined,
        city: draft.city || undefined,
        state: draft.state || undefined,
        zip_code: draft.zip_code || undefined,
      },
    });
    toast.success("Address updated");
  };

  return (
    <EditableDetailCard
      canEdit={canEdit}
      description="Used for mailing labels and location context."
      isSaving={update.isPending}
      title="Address"
      onCancel={() => setDraft(initial())}
      onSave={handleSave}
    >
      {(editing) =>
        editing ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              className="sm:col-span-2"
              label="Street address"
              leftIcon={<MapPin aria-hidden className="h-4 w-4" strokeWidth={2} />}
              maxLength={CONTACT_FIELD_LIMITS.street_address}
              placeholder="Street address"
              value={draft.street_address}
              onChange={(e) =>
                setDraft({ ...draft, street_address: e.target.value })
              }
            />
            <Input
              label="City"
              maxLength={CONTACT_FIELD_LIMITS.city}
              placeholder="City"
              value={draft.city}
              onChange={(e) => setDraft({ ...draft, city: e.target.value })}
            />
            <Input
              label="State"
              maxLength={CONTACT_FIELD_LIMITS.state}
              placeholder="State"
              value={draft.state}
              onChange={(e) => setDraft({ ...draft, state: e.target.value })}
            />
            <Input
              label="Zip code"
              maxLength={CONTACT_FIELD_LIMITS.zip_code}
              placeholder="Zip code"
              value={draft.zip_code}
              onChange={(e) => setDraft({ ...draft, zip_code: e.target.value })}
            />
          </div>
        ) : (
          <ViewGrid>
            <ViewField full label="Street address" value={contact.street_address} />
            <ViewField label="City" value={contact.city} />
            <ViewField label="State" value={contact.state} />
            <ViewField label="Zip code" value={contact.zip_code} />
          </ViewGrid>
        )
      }
    </EditableDetailCard>
  );
}

/* -------------------------------------------------------------------------- */

function LocationCard({ contact, canEdit }: CardProps) {
  const { update } = useContactMutations();
  const initial = useMemo(
    () => () =>
      contact.latitude != null && contact.longitude != null
        ? { lat: contact.latitude, lng: contact.longitude }
        : null,
    [contact]
  );
  const [location, setLocation] = useState(initial);
  useEffect(() => setLocation(initial()), [initial]);

  const handleSave = async () => {
    await update.mutateAsync({
      id: contact.id,
      data: {
        latitude: location?.lat,
        longitude: location?.lng,
        vertices: location
          ? [
              [location.lng - 0.001, location.lat - 0.001],
              [location.lng + 0.001, location.lat - 0.001],
              [location.lng + 0.001, location.lat + 0.001],
              [location.lng - 0.001, location.lat + 0.001],
            ]
          : undefined,
      },
    });
    toast.success("Location updated");
  };

  return (
    <EditableDetailCard
      canEdit={canEdit}
      isSaving={update.isPending}
      title="Location"
      onCancel={() => setLocation(initial())}
      onSave={handleSave}
    >
      {(editing) => (
        <LocationPicker
          label=""
          location={toLocationPoint(location)}
          mapHeight={280}
          readOnly={!editing}
          onLocationChange={(point) => setLocation(fromLocationPoint(point))}
        />
      )}
    </EditableDetailCard>
  );
}

/* -------------------------------------------------------------------------- */

function CategoriesCard({
  contact,
  canEdit,
  isFarm,
}: CardProps & { isFarm: boolean }) {
  const { update } = useContactMutations();
  const { categories, isLoading, isError } = useContactCategories();
  const lockedCategoryIds = useMemo(
    () => getLockedClientContactCategoryIds(contact.categories),
    [contact.categories]
  );
  const initial = useMemo(
    () => () => contact.categories.map((c) => c.id),
    [contact.categories]
  );
  const [selected, setSelected] = useState<number[]>(initial);
  useEffect(() => setSelected(initial()), [initial]);

  const handleToggle = (categoryId: number) => {
    const id = Number(categoryId);
    if (selected.includes(id)) {
      if (isFarm && lockedCategoryIds.includes(id)) return;
      setSelected(selected.filter((existing) => existing !== id));
      return;
    }
    setSelected([...selected, id]);
  };

  const handleSave = async () => {
    await update.mutateAsync({
      id: contact.id,
      data: {
        category_ids: isFarm
          ? ensureLockedCategoryIds(selected, lockedCategoryIds)
          : selected,
      },
    });
    toast.success("Categories updated");
  };

  return (
    <EditableDetailCard
      canEdit={canEdit}
      isSaving={update.isPending}
      title="Categories"
      onCancel={() => setSelected(initial())}
      onSave={handleSave}
    >
      {(editing) =>
        editing ? (
          <ContactCategoryDropdown
            categories={categories}
            hasError={isError}
            isLoading={isLoading}
            lockedCategoryIds={isFarm ? lockedCategoryIds : []}
            selectedIds={selected}
            onToggle={handleToggle}
          />
        ) : contact.categories.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {contact.categories.map((category) => (
              <span
                key={category.id}
                className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                style={{ backgroundColor: category.color || "#3b82f6" }}
              >
                {category.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-text-muted text-sm">No categories selected.</p>
        )
      }
    </EditableDetailCard>
  );
}

/* -------------------------------------------------------------------------- */

export interface ContactInfoCardsProps {
  contact: Contact;
  canEdit: boolean;
  isFarmManagement: boolean;
}

/** Contact-detail info tab: each section is an independently editable card. */
export function ContactInfoCards({
  contact,
  canEdit,
  isFarmManagement,
}: ContactInfoCardsProps) {
  return (
    <div className="w-full space-y-5">
      <ContactDetailsCard canEdit={canEdit} contact={contact} />
      <BasicInfoCard canEdit={canEdit} contact={contact} />
      <AdditionalDetailsCard canEdit={canEdit} contact={contact} />
      <AddressCard canEdit={canEdit} contact={contact} />
      <LocationCard canEdit={canEdit} contact={contact} />
      <CategoriesCard
        canEdit={canEdit}
        contact={contact}
        isFarm={isFarmManagement}
      />
    </div>
  );
}
