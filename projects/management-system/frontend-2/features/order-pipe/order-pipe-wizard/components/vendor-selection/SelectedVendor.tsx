"use client";

import { useEffect, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
} from "@fieldflow360/org-ui";
import { MapPin, X } from "lucide-react";

import { DISTANCE_UNITS, GEOLOCATION_OPTIONS } from "@/constants";
import { useUnitSystem } from "@/hooks";
import { useUpdateVendorForm } from "@/hooks/mutations";
import { useOrderPipePermissions } from "@/hooks/permissions";
import { distanceBetween } from "@/lib/geo";
import { Card } from "@/shared/ui/primitives";

import { useVendorContext } from "../../context/VendorContext";
import { useVendorFormContext } from "../../context/VendorFormContext";

// Shared across instances so we only patch once when SelectedVendor is mounted in multiple layouts (Right + Mobile).
const lastPatchedRef = {
  vendorFormId: null as number | string | null,
  vendorId: null as number | null,
};

function hasValidLocation(v: {
  lat: number | null | undefined;
  long: number | null | undefined;
}): boolean {
  if (v.lat == null || v.long == null) return false;
  const lat = Number(v.lat);
  const lng = Number(v.long);
  return Number.isFinite(lat) && Number.isFinite(lng);
}

export function SelectedVendor() {
  const { selectedVendor, setSelectedVendor } = useVendorContext();
  const { vendorFormId } = useVendorFormContext();
  const updateVendorForm = useUpdateVendorForm();
  const { canWrite } = useOrderPipePermissions();
  const unitSystem = useUnitSystem();
  const distanceLabel = DISTANCE_UNITS.LONG[unitSystem];
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Patch vendor form when user selects a vendor (so backend is updated on selection, not on Next).
  useEffect(() => {
    if (!selectedVendor || vendorFormId == null) {
      if (!selectedVendor) {
        lastPatchedRef.vendorFormId = null;
        lastPatchedRef.vendorId = null;
      }
      return;
    }
    if (
      lastPatchedRef.vendorFormId === vendorFormId &&
      lastPatchedRef.vendorId === selectedVendor.id
    ) {
      return;
    }
    lastPatchedRef.vendorFormId = vendorFormId;
    lastPatchedRef.vendorId = selectedVendor.id;
    updateVendorForm.mutate({
      vendorFormId,
      payload: { vendor_id: selectedVendor.id },
    });
  }, [selectedVendor, vendorFormId, updateVendorForm]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => {},
      GEOLOCATION_OPTIONS
    );
  }, []);

  if (!selectedVendor) {
    return (
      <>
        <h2 className="text-2xl leading-none font-semibold tracking-tight lg:text-[30px]">
          Selected Vendor
        </h2>
        <p className="text-text-muted mt-2 text-[15px] leading-[1.29] font-medium tracking-tight lg:text-[25px]">
          Please select a vendor from your list of favorites or directly from
          the map in order to proceed.
        </p>
      </>
    );
  }

  const hasLocation = hasValidLocation(selectedVendor);
  const distanceText = !hasLocation
    ? "Has no specified location"
    : userLocation != null
      ? `${Number(distanceBetween(userLocation.lat, userLocation.lng, Number(selectedVendor.lat), Number(selectedVendor.long), unitSystem)).toFixed(1)} ${distanceLabel} away from you`
      : `— ${distanceLabel} away from you`;

  return (
    <>
      <h2 className="text-2xl leading-none font-semibold tracking-tight lg:text-[30px]">
        Selected Vendor
      </h2>
      <Card className="border-border-subtle mt-2 flex flex-col justify-center gap-1 rounded-lg border p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-text-primary line-clamp-1 text-lg leading-tight font-semibold tracking-tight">
              {selectedVendor.name} - {selectedVendor.provider.name}
            </p>
            <p className="text-text-muted line-clamp-1 flex items-center gap-2 text-base leading-5 font-normal">
              <MapPin aria-hidden className="h-4 w-4 shrink-0" />
              {selectedVendor.phone_number
                ? `${selectedVendor.phone_number} • ${distanceText}`
                : distanceText}
            </p>
          </div>
          {canWrite && (
            <Button
              iconOnly
              aria-label="Clear selected vendor"
              leftIcon={<X className="h-4 w-4" />}
              size={ComponentSizeEnum.SM}
              variant={ButtonVariantEnum.GHOST}
              onClick={() => setSelectedVendor(null)}
            />
          )}
        </div>
      </Card>
    </>
  );
}
