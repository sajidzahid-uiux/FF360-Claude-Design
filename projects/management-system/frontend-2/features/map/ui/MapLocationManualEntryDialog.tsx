"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

import { AppFormModal, Input } from "@fieldflow360/org-ui";

import {
  isMapCoordinateError,
  parseAndValidateMapCoordinates,
} from "@/features/map/lib";

import type { MapLatLngAsyncHandler } from "../model/types";

export interface MapLocationManualEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  submitLabel?: string;
  errorMessage?: string;
  disabled?: boolean;
  initialLatitude?: string;
  initialLongitude?: string;
  onSubmit?: MapLatLngAsyncHandler;
}

export function MapLocationManualEntryDialog({
  open,
  onOpenChange,
  title = "Enter coordinates",
  description = "Enter the latitude and longitude for this location.",
  submitLabel = "Confirm location",
  errorMessage = "Could not save location. Please try again.",
  disabled = false,
  initialLatitude = "",
  initialLongitude = "",
  onSubmit,
}: MapLocationManualEntryDialogProps) {
  const [latitude, setLatitude] = useState(initialLatitude);
  const [longitude, setLongitude] = useState(initialLongitude);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = useCallback(() => {
    setLatitude(initialLatitude);
    setLongitude(initialLongitude);
    setError(null);
    setIsSubmitting(false);
  }, [initialLatitude, initialLongitude]);

  useEffect(() => {
    if (open) {
      setLatitude(initialLatitude);
      setLongitude(initialLongitude);
      setError(null);
      setIsSubmitting(false);
    }
  }, [initialLatitude, initialLongitude, open]);

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      const parsed = parseAndValidateMapCoordinates(latitude, longitude);
      if (isMapCoordinateError(parsed)) {
        setError(parsed.error);
        return;
      }
      if (!onSubmit) return;

      setError(null);
      setIsSubmitting(true);
      try {
        await onSubmit(parsed.lat, parsed.lng);
        onOpenChange(false);
      } catch {
        setError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [errorMessage, latitude, longitude, onOpenChange, onSubmit]
  );

  return (
    <AppFormModal
      showCancel
      cancelDisabled={isSubmitting}
      isOpen={open}
      isSubmitting={isSubmitting}
      submitDisabled={disabled || !onSubmit}
      submitLabel={submitLabel}
      title={title}
      width={480}
      onClose={() => onOpenChange(false)}
      onSubmit={handleSubmit}
    >
      <p className="text-text-muted text-sm">{description}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          autoComplete="off"
          disabled={disabled || isSubmitting}
          inputMode="decimal"
          label="Latitude"
          placeholder="Latitude"
          value={latitude}
          onChange={(event) => {
            setLatitude(event.target.value);
            setError(null);
          }}
        />
        <Input
          autoComplete="off"
          disabled={disabled || isSubmitting}
          inputMode="decimal"
          label="Longitude"
          placeholder="Longitude"
          value={longitude}
          onChange={(event) => {
            setLongitude(event.target.value);
            setError(null);
          }}
        />
      </div>
      {error ? <p className="text-feedback-error text-sm">{error}</p> : null}
    </AppFormModal>
  );
}
