"use client";

import { Button, ButtonVariantEnum, Overlay } from "@fieldflow360/org-ui";
import { MapPin, MousePointerClick, Navigation } from "lucide-react";

import { useIsMobile } from "@/hooks/useIsMobile";

export type MapLocationMyLocationVisibility = "hidden" | "mobile" | "always";

export interface MapLocationAddMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  disabled?: boolean;
  userLocationAvailable?: boolean;
  myLocationVisibility?: MapLocationMyLocationVisibility;
  mapSelectionLabel?: string;
  myLocationLabel?: string;
  manualEntryLabel?: string;
  onChooseMapClick: () => void;
  onChooseManual: () => void;
  onChooseMyLocation?: () => void;
}

export function MapLocationAddMethodDialog({
  open,
  onOpenChange,
  title = "Add location",
  description = "Choose how you want to set the location.",
  disabled = false,
  userLocationAvailable = false,
  myLocationVisibility = "mobile",
  mapSelectionLabel = "Select on map",
  myLocationLabel = "Use current location",
  manualEntryLabel = "Enter coordinates manually",
  onChooseMapClick,
  onChooseManual,
  onChooseMyLocation,
}: MapLocationAddMethodDialogProps) {
  const isMobile = useIsMobile();

  const showMyLocationOption =
    onChooseMyLocation != null &&
    myLocationVisibility !== "hidden" &&
    (myLocationVisibility === "always" || isMobile);

  const handleChooseMapClick = () => {
    onChooseMapClick();
    onOpenChange(false);
  };

  const handleChooseManual = () => {
    onChooseManual();
    onOpenChange(false);
  };

  const handleChooseMyLocation = () => {
    onChooseMyLocation?.();
    onOpenChange(false);
  };

  return (
    <Overlay isOpen={open} onClose={() => onOpenChange(false)}>
      <div className="bg-bg-surface-elevated border-border-subtle w-full max-w-md rounded-lg border p-6 shadow-xl">
        <h2 className="text-text-primary text-lg font-semibold">{title}</h2>
        <p className="text-text-muted mt-2 text-sm">{description}</p>
        <div className="mt-4 flex flex-col gap-2">
          <Button
            className="justify-start"
            disabled={disabled}
            leftIcon={<MousePointerClick aria-hidden className="h-4 w-4" />}
            title={mapSelectionLabel}
            variant={ButtonVariantEnum.SURFACE}
            onClick={handleChooseMapClick}
          />
          {showMyLocationOption ? (
            <Button
              className="justify-start"
              disabled={disabled || !userLocationAvailable}
              leftIcon={<Navigation aria-hidden className="h-4 w-4" />}
              title={
                userLocationAvailable
                  ? myLocationLabel
                  : "Location not available"
              }
              variant={ButtonVariantEnum.SURFACE}
              onClick={handleChooseMyLocation}
            />
          ) : null}
          <Button
            className="justify-start"
            disabled={disabled}
            leftIcon={<MapPin aria-hidden className="h-4 w-4" />}
            title={manualEntryLabel}
            variant={ButtonVariantEnum.SURFACE}
            onClick={handleChooseManual}
          />
        </div>
      </div>
    </Overlay>
  );
}
