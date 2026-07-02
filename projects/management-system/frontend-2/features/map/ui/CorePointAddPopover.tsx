"use client";

import { useCallback, useEffect, useState } from "react";
import type { RefObject } from "react";

import {
  Button,
  ComponentSizeEnum,
  Input,
  TableToolbarPanel,
  TabsSwitcher,
  type TabsSwitcherItem,
} from "@fieldflow360/org-ui";
import { MapPin, Navigation, Plus } from "lucide-react";

import {
  isMapCoordinateError,
  parseAndValidateMapCoordinates,
} from "@/features/map/lib/validateMapCoordinates";
import type { LatLng, MapPinPlacementMode } from "@/features/map/model/types";
import type { BoundaryMapRef } from "@/shared/ui/common/map";

const PLACEMENT_TABS: TabsSwitcherItem<MapPinPlacementMode>[] = [
  { value: "map", label: "Place on Map" },
  { value: "current", label: "Current Location" },
  { value: "manual", label: "Manual" },
];

export interface CorePointAddPopoverProps {
  open: boolean;
  onClose: () => void;
  /** Element the floating panel is positioned against (the Add Core trigger). */
  anchorRef: RefObject<HTMLElement | null>;
  disabled?: boolean;
  userLocation?: LatLng | null;
  boundaryMapRef: RefObject<BoundaryMapRef | null>;
}

/**
 * Compact "Add Core" menu shown as a floating panel anchored to the on-map
 * Add Core button. Mirrors the Add Pin popover, minus the category step: a
 * core point has no category, so the user only picks a placement method.
 * "Place on Map" arms click-to-place on the real boundary map; "Current
 * Location" / "Manual" prepare the core point at fixed coordinates directly.
 */
export function CorePointAddPopover({
  open,
  onClose,
  anchorRef,
  disabled = false,
  userLocation = null,
  boundaryMapRef,
}: CorePointAddPopoverProps) {
  const [placementMode, setPlacementMode] =
    useState<MapPinPlacementMode>("map");
  const [latitudeInput, setLatitudeInput] = useState("");
  const [longitudeInput, setLongitudeInput] = useState("");
  const [coordinateError, setCoordinateError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear transient state whenever the panel closes.
  useEffect(() => {
    if (!open) {
      setPlacementMode("map");
      setLatitudeInput("");
      setLongitudeInput("");
      setCoordinateError(null);
      setIsSubmitting(false);
    }
  }, [open]);

  const applyCorePointLocation = useCallback(
    (lat: number, lng: number) => {
      boundaryMapRef.current?.prepareCorePointAtLocation(lat, lng);
      boundaryMapRef.current?.centerOnLocation(lat, lng);
      onClose();
    },
    [boundaryMapRef, onClose]
  );

  const handlePlaceOnMap = useCallback(() => {
    boundaryMapRef.current?.startCorePointMode();
    onClose();
  }, [boundaryMapRef, onClose]);

  const handleLocateMe = useCallback(() => {
    if (userLocation) {
      applyCorePointLocation(userLocation.lat, userLocation.lng);
      return;
    }
    if (!navigator.geolocation) {
      setCoordinateError("Geolocation is not available in this browser.");
      return;
    }
    setIsSubmitting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsSubmitting(false);
        applyCorePointLocation(
          position.coords.latitude,
          position.coords.longitude
        );
      },
      () => {
        setCoordinateError("Could not get your current location.");
        setIsSubmitting(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [applyCorePointLocation, userLocation]);

  const handleAddManual = useCallback(() => {
    const result = parseAndValidateMapCoordinates(latitudeInput, longitudeInput);
    if (isMapCoordinateError(result)) {
      setCoordinateError(result.error);
      return;
    }
    setCoordinateError(null);
    applyCorePointLocation(result.lat, result.lng);
  }, [applyCorePointLocation, latitudeInput, longitudeInput]);

  const canAct = !disabled && !isSubmitting;

  return (
    <TableToolbarPanel anchorRef={anchorRef} open={open} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="space-y-3">
          <p className="text-text-primary text-sm font-semibold">
            Core Location
          </p>
          <TabsSwitcher
            fullWidth
            items={PLACEMENT_TABS}
            size={ComponentSizeEnum.SM}
            value={placementMode}
            onChange={setPlacementMode}
          />

          {placementMode === "map" ? (
            <div className="space-y-3">
              <p className="text-text-muted flex items-center gap-1.5 text-xs">
                <MapPin aria-hidden className="h-3.5 w-3.5 shrink-0" />
                Click anywhere on the map to place the core point.
              </p>
              <Button
                fullWidth
                disabled={!canAct}
                leftIcon={<MapPin aria-hidden className="h-4 w-4" />}
                title="Place on map"
                onClick={handlePlaceOnMap}
              />
            </div>
          ) : null}

          {placementMode === "current" ? (
            <Button
              fullWidth
              disabled={!canAct}
              leftIcon={<Navigation aria-hidden className="h-4 w-4" />}
              loading={isSubmitting}
              title="Locate me"
              onClick={handleLocateMe}
            />
          ) : null}

          {placementMode === "manual" ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  disabled={disabled || isSubmitting}
                  label="Latitude"
                  placeholder="27.07793"
                  value={latitudeInput}
                  onChange={(event) => setLatitudeInput(event.target.value)}
                />
                <Input
                  disabled={disabled || isSubmitting}
                  label="Longitude"
                  placeholder="-81.897308"
                  value={longitudeInput}
                  onChange={(event) => setLongitudeInput(event.target.value)}
                />
              </div>
              <Button
                fullWidth
                disabled={!canAct || !latitudeInput || !longitudeInput}
                leftIcon={<Plus aria-hidden className="h-4 w-4" />}
                title="Add"
                onClick={handleAddManual}
              />
            </div>
          ) : null}

          {coordinateError ? (
            <p className="text-feedback-error text-xs">{coordinateError}</p>
          ) : null}
        </div>
      </div>
    </TableToolbarPanel>
  );
}
