"use client";

import { useCallback, useState } from "react";
import type { RefObject } from "react";

import { Button, ButtonVariantEnum } from "@fieldflow360/org-ui";
import { Plus } from "lucide-react";

import type { BoundaryMapRef } from "@/shared/ui/common/map";

import type {
  LatLng,
  MapLatLngAsyncHandler,
  MapLatLngHandler,
} from "../model/types";
import { MapLocationAddMethodDialog } from "./MapLocationAddMethodDialog";
import { MapLocationManualEntryDialog } from "./MapLocationManualEntryDialog";

export interface CorePointLocationActionsProps {
  disabled?: boolean;
  isCorePointMode?: boolean;
  userLocation?: LatLng | null;
  boundaryMapRef: RefObject<BoundaryMapRef | null>;
}

export function CorePointLocationActions({
  disabled = false,
  isCorePointMode = false,
  userLocation = null,
  boundaryMapRef,
}: CorePointLocationActionsProps) {
  const [isAddMethodDialogOpen, setIsAddMethodDialogOpen] = useState(false);
  const [isManualEntryDialogOpen, setIsManualEntryDialogOpen] = useState(false);

  const handleOpenAddCore = useCallback(() => {
    setIsAddMethodDialogOpen(true);
  }, []);

  const handleCancelCorePointMode = useCallback(() => {
    boundaryMapRef.current?.cancelCorePointMode();
  }, [boundaryMapRef]);

  const handleChooseMapSelection = useCallback(() => {
    boundaryMapRef.current?.startCorePointMode();
  }, [boundaryMapRef]);

  const handleChooseManual = useCallback(() => {
    setIsManualEntryDialogOpen(true);
  }, []);

  const applyCorePointLocation = useCallback<MapLatLngHandler>(
    (lat, lng) => {
      boundaryMapRef.current?.prepareCorePointAtLocation(lat, lng);
      boundaryMapRef.current?.centerOnLocation(lat, lng);
    },
    [boundaryMapRef]
  );

  const handleChooseMyLocation = useCallback(() => {
    if (!userLocation) return;
    applyCorePointLocation(userLocation.lat, userLocation.lng);
  }, [applyCorePointLocation, userLocation]);

  const handleManualSubmit = useCallback<MapLatLngAsyncHandler>(
    async (lat, lng) => {
      applyCorePointLocation(lat, lng);
    },
    [applyCorePointLocation]
  );

  return (
    <>
      <div className="flex items-center gap-2">
        {isCorePointMode ? (
          <Button
            aria-label="Cancel"
            className="w-full lg:w-auto"
            title="Cancel"
            variant={ButtonVariantEnum.SURFACE}
            onClick={handleCancelCorePointMode}
          />
        ) : (
          <Button
            className="w-full lg:w-auto"
            disabled={disabled}
            leftIcon={<Plus aria-hidden className="h-3 w-3" />}
            title="Add Core"
            variant={ButtonVariantEnum.SURFACE}
            onClick={handleOpenAddCore}
          />
        )}
      </div>

      <MapLocationAddMethodDialog
        description="Choose how you want to place the core point on the map."
        disabled={disabled}
        manualEntryLabel="Enter coordinates manually"
        mapSelectionLabel="Select on map"
        myLocationLabel="Use current location"
        myLocationVisibility="always"
        open={isAddMethodDialogOpen}
        title="Add core point"
        userLocationAvailable={userLocation != null}
        onChooseManual={handleChooseManual}
        onChooseMapClick={handleChooseMapSelection}
        onChooseMyLocation={handleChooseMyLocation}
        onOpenChange={setIsAddMethodDialogOpen}
      />

      <MapLocationManualEntryDialog
        description="Enter the latitude and longitude where the core point should be placed."
        disabled={disabled}
        open={isManualEntryDialogOpen}
        submitLabel="Continue"
        title="Add core point at coordinates"
        onOpenChange={setIsManualEntryDialogOpen}
        onSubmit={handleManualSubmit}
      />
    </>
  );
}
