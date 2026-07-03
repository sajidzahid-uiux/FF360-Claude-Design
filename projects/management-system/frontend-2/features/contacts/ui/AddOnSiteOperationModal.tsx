"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import {
  AppFormModal,
  Button,
  ButtonVariantEnum,
  Input,
  SearchableDropdown,
} from "@fieldflow360/org-ui";
import { ChevronDown, Gauge, Sprout, User } from "lucide-react";

import type { Contact, FarmCreatePayload } from "@/api/types";
import type { GeoLatLng, VertexRing } from "@/api/types/geo";
import { ON_SITE_OPERATION_LABEL } from "@/features/contacts/model/constants";
import { DeckBoundaryMap } from "@/features/map/ui";
import {
  useContacts,
  useFarmMutations,
  useOrganizationData,
  useRouteIds,
} from "@/hooks";
import { type BoundaryMapRef, CenterOnLocation } from "@/shared/ui/common/map";
import { Label } from "@/shared/ui/primitives";

const NAME_MAX = 100;

export interface AddOnSiteOperationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Global "New On-Site Operation" flow. Unlike the contact-detail version
 * (which knows its parent contact), this opens from the top-bar "+ New" menu,
 * so it requires the user to pick the owning contact first.
 */
export function AddOnSiteOperationModal({
  open,
  onOpenChange,
}: AddOnSiteOperationModalProps) {
  const { orgId } = useRouteIds();
  const [contactId, setContactId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [acreage, setAcreage] = useState("");
  const [location, setLocation] = useState<GeoLatLng | undefined>(undefined);
  const [vertices, setVertices] = useState<VertexRing>([]);
  const boundaryMapRef = useRef<BoundaryMapRef>(null);

  const { contacts } = useContacts({ page_size: 100 }, open);
  const { create: createFarm } = useFarmMutations(contactId ?? 0);
  const { data: organizationsData } = useOrganizationData();

  const organizationLocation = useMemo((): GeoLatLng | null => {
    if (!organizationsData || !orgId) return null;
    const currentOrg = organizationsData.find((o) => o.id === Number(orgId));
    if (!currentOrg?.latitude || !currentOrg?.longitude) return null;
    return { lat: currentOrg.latitude, lng: currentOrg.longitude };
  }, [orgId, organizationsData]);

  useEffect(() => {
    if (!open) {
      setContactId(null);
      setName("");
      setAcreage("");
      setLocation(undefined);
      setVertices([]);
    }
  }, [open]);

  const contactOptions = useMemo(
    () =>
      (contacts ?? []).map((c: Contact) => ({
        value: String(c.id),
        label: c.full_name,
      })),
    [contacts]
  );

  const selectedContactLabel =
    contactOptions.find((o) => o.value === String(contactId))?.label ??
    "Select a contact";

  const handleAcreageChange = (value: string) => {
    const numeric = value.replace(/[^0-9.]/g, "");
    const parts = numeric.split(".");
    setAcreage(
      parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : numeric
    );
  };

  const isSubmitDisabled =
    contactId == null ||
    !name.trim() ||
    !acreage.trim() ||
    createFarm.isPending;

  const handleClose = () => {
    if (createFarm.isPending) return;
    onOpenChange(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (contactId == null || !name.trim() || !acreage.trim()) return;

    try {
      await createFarm.mutateAsync({
        name: name.trim(),
        acreage: parseFloat(acreage),
        longitude: location?.lng,
        latitude: location?.lat,
        vertices:
          vertices.length > 0 ? vertices.map((v) => [v.lng, v.lat]) : undefined,
      } as FarmCreatePayload);
      onOpenChange(false);
    } catch {
      // useFarmMutations surfaces errors via toast.
    }
  };

  if (!open) return null;

  return (
    <AppFormModal
      showCancel
      isOpen={open}
      isSubmitting={createFarm.isPending}
      maxHeight="calc(100dvh - 1rem)"
      submitDisabled={isSubmitDisabled}
      submitLabel="Create"
      title={`New ${ON_SITE_OPERATION_LABEL}`}
      width={960}
      onClose={handleClose}
      onSubmit={handleSubmit}
    >
      <div className="flex min-h-0 flex-col gap-5 sm:gap-6">
        <div className="space-y-1.5">
          <Label variant="field">Contact *</Label>
          <SearchableDropdown
            options={contactOptions}
            placeholder="Select a contact"
            searchPlaceholder="Search contacts..."
            trigger={() => (
              <Button
                aria-label={selectedContactLabel}
                className="mt-1 w-full justify-between"
                leftIcon={<User aria-hidden className="h-4 w-4" strokeWidth={2} />}
                rightIcon={
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                }
                title={selectedContactLabel}
                variant={ButtonVariantEnum.SURFACE}
              />
            )}
            value={contactId != null ? String(contactId) : undefined}
            onChange={(value) => setContactId(Number(value))}
          />
          <p className="text-text-muted text-xs">
            An {ON_SITE_OPERATION_LABEL.toLowerCase()} must belong to a contact.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            required
            helperText={`${name.length}/${NAME_MAX} characters`}
            label={`${ON_SITE_OPERATION_LABEL} name`}
            leftIcon={<Sprout aria-hidden className="h-4 w-4" strokeWidth={2} />}
            maxLength={NAME_MAX}
            placeholder="e.g. North Field"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, NAME_MAX))}
          />
          <Input
            required
            inputMode="decimal"
            label="Acreage"
            leftIcon={<Gauge aria-hidden className="h-4 w-4" strokeWidth={2} />}
            placeholder="e.g. 120"
            value={acreage}
            onChange={(e) => handleAcreageChange(e.target.value)}
          />
        </div>

        <div className="flex min-h-0 flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-text-primary text-sm font-medium">
                Draw boundaries
              </p>
              <p className="text-text-muted text-xs">Optional</p>
            </div>
            <CenterOnLocation
              userLocationAvailable
              boundaryMapRef={boundaryMapRef}
              className="mb-0"
              organizationLocationAvailable={organizationLocation !== null}
            />
          </div>

          <div className="border-border-subtle min-h-[min(45vh,24rem)] overflow-hidden rounded-lg border">
            <DeckBoundaryMap
              ref={boundaryMapRef}
              className="h-full min-h-[min(45vh,24rem)] w-full"
              hideActionMenu={false}
              location={location}
              organizationLocation={organizationLocation}
              readOnly={false}
              vertices={vertices}
              onChangeLocation={setLocation}
              onChangeVertices={setVertices}
            />
          </div>
        </div>
      </div>
    </AppFormModal>
  );
}
