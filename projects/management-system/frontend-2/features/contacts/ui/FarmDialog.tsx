"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { AppFormModal, Input } from "@fieldflow360/org-ui";
import { Gauge, Sprout } from "lucide-react";

import type { Farm, FarmCreatePayload, FarmUpdatePayload } from "@/api/types";
import type { GeoLatLng, VertexRing } from "@/api/types/geo";
import { ON_SITE_OPERATION_LABEL } from "@/features/contacts/model/constants";
import { DeckBoundaryMap } from "@/features/map/ui";
import { useFarmMutations, useOrganizationData, useRouteIds } from "@/hooks";
import { type BoundaryMapRef, CenterOnLocation } from "@/shared/ui/common/map";

const FARM_NAME_MAX_LENGTH = 100;

const EMPTY_FORM = {
  farm_name: "",
  acreage: "",
};

function normalizeFarmVertices(raw: Farm["vertices"] | undefined): VertexRing {
  if (!raw?.length) return [];

  return raw
    .map((vertex): GeoLatLng | null => {
      if (Array.isArray(vertex) && vertex.length >= 2) {
        return { lat: Number(vertex[1]), lng: Number(vertex[0]) };
      }
      if (
        vertex &&
        typeof vertex === "object" &&
        "lat" in vertex &&
        "lng" in vertex
      ) {
        const point = vertex as GeoLatLng;
        return { lat: point.lat, lng: point.lng };
      }
      return null;
    })
    .filter((vertex): vertex is GeoLatLng => vertex !== null);
}

interface FarmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contactId: number;
  farm?: Farm | null;
  onSuccess?: () => void;
}

export default function FarmDialog({
  isOpen,
  onClose,
  contactId,
  farm,
  onSuccess,
}: FarmDialogProps) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [location, setLocation] = useState<GeoLatLng | undefined>(undefined);
  const [vertices, setVertices] = useState<VertexRing>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { create: createFarm, update: updateFarm } =
    useFarmMutations(contactId);
  const isEditing = Boolean(farm);
  const boundaryMapRef = useRef<BoundaryMapRef>(null);
  const { data: organizationsData } = useOrganizationData();
  const { orgId: organizationId } = useRouteIds();

  const organizationLocation = useMemo((): GeoLatLng | null => {
    if (!organizationsData || !organizationId) return null;
    const currentOrg = organizationsData.find(
      (org) => org.id === Number(organizationId)
    );
    if (!currentOrg?.latitude || !currentOrg?.longitude) return null;
    return {
      lat: currentOrg.latitude,
      lng: currentOrg.longitude,
    };
  }, [organizationId, organizationsData]);

  const resetForm = useCallback(() => {
    setFormData(EMPTY_FORM);
    setLocation(undefined);
    setVertices([]);
    setFieldErrors({});
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleFarmNameChange = useCallback(
    (value: string) => {
      if (value.length > FARM_NAME_MAX_LENGTH) return;
      setFormData((prev) => ({ ...prev, farm_name: value }));
      clearFieldError("farm_name");
    },
    [clearFieldError]
  );

  const handleAcreageChange = useCallback(
    (value: string) => {
      const numericValue = value.replace(/[^0-9.]/g, "");
      const parts = numericValue.split(".");
      const cleanValue =
        parts.length > 2
          ? `${parts[0]}.${parts.slice(1).join("")}`
          : numericValue;

      if (
        cleanValue === "" ||
        (parseFloat(cleanValue) > 0 && !Number.isNaN(parseFloat(cleanValue)))
      ) {
        setFormData((prev) => ({ ...prev, acreage: cleanValue }));
        clearFieldError("acreage");
      }
    },
    [clearFieldError]
  );

  useEffect(() => {
    if (!isOpen) return;

    if (farm) {
      setFormData({
        farm_name: farm.name,
        acreage: farm.acreage?.toString() ?? "",
      });
      setLocation(
        farm.latitude && farm.longitude
          ? { lat: Number(farm.latitude), lng: Number(farm.longitude) }
          : undefined
      );
      setVertices(normalizeFarmVertices(farm.vertices));
      setFieldErrors({});
      return;
    }

    resetForm();
  }, [farm, isOpen, resetForm]);

  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};
    const name = formData.farm_name.trim();

    if (!name) {
      errors.farm_name = `${ON_SITE_OPERATION_LABEL} name is required`;
    } else if (name.length > FARM_NAME_MAX_LENGTH) {
      errors.farm_name = `${ON_SITE_OPERATION_LABEL} name must be ${FARM_NAME_MAX_LENGTH} characters or less`;
    }

    const acreageValue = formData.acreage.trim();
    if (!acreageValue) {
      errors.acreage = "Acreage is required";
    } else if (
      Number.isNaN(parseFloat(acreageValue)) ||
      parseFloat(acreageValue) <= 0
    ) {
      errors.acreage = "Acreage must be a valid positive number";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData.acreage, formData.farm_name]);

  const isSubmitting = createFarm.isPending || updateFarm.isPending;
  const isSubmitDisabled =
    !formData.farm_name.trim() || !formData.acreage.trim() || isSubmitting;

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  }, [isSubmitting, onClose, resetForm]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    const farmData = {
      name: formData.farm_name.trim(),
      acreage: parseFloat(formData.acreage),
      longitude: location?.lng,
      latitude: location?.lat,
      vertices:
        vertices.length > 0 ? vertices.map((v) => [v.lng, v.lat]) : undefined,
    };

    try {
      if (isEditing && farm) {
        await updateFarm.mutateAsync({
          id: farm.id,
          data: farmData as FarmUpdatePayload,
        });
      } else {
        await createFarm.mutateAsync(farmData as FarmCreatePayload);
      }
      onSuccess?.();
      resetForm();
      onClose();
    } catch {
      // Mutation hooks surface errors via toast.
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <AppFormModal
      showCancel
      cancelLabel="Cancel"
      isOpen={isOpen}
      isSubmitting={isSubmitting}
      maxHeight="calc(100dvh - 1rem)"
      submitDisabled={isSubmitDisabled}
      submitLabel={isEditing ? "Update" : "Submit"}
      title={
        isEditing
          ? `Edit ${ON_SITE_OPERATION_LABEL}`
          : `Create New ${ON_SITE_OPERATION_LABEL}`
      }
      width={960}
      onClose={handleClose}
      onSubmit={handleSubmit}
    >
      <div className="flex min-h-0 flex-col gap-5 sm:gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            required
            error={fieldErrors.farm_name}
            helperText={`${formData.farm_name.length}/${FARM_NAME_MAX_LENGTH} characters`}
            label={`${ON_SITE_OPERATION_LABEL} name`}
            leftIcon={
              <Sprout aria-hidden className="h-4 w-4" strokeWidth={2} />
            }
            maxLength={FARM_NAME_MAX_LENGTH}
            placeholder="e.g. North Field"
            value={formData.farm_name}
            onChange={(event) => handleFarmNameChange(event.target.value)}
          />
          <Input
            required
            error={fieldErrors.acreage}
            inputMode="decimal"
            label="Acreage"
            leftIcon={<Gauge aria-hidden className="h-4 w-4" strokeWidth={2} />}
            placeholder="e.g. 120"
            value={formData.acreage}
            onChange={(event) => handleAcreageChange(event.target.value)}
          />
        </div>

        <div className="flex min-h-0 flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-text-primary text-sm font-medium">
                Draw farm boundaries
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

          <div
            className="border-border-subtle min-h-[min(55vh,28rem)] overflow-hidden rounded-lg border"
            onClick={(event) => event.stopPropagation()}
          >
            <DeckBoundaryMap
              ref={boundaryMapRef}
              className="h-full min-h-[min(55vh,28rem)] w-full"
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
