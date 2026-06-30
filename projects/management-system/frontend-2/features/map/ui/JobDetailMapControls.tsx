"use client";

import { useCallback, useRef, useState } from "react";
import type { RefObject } from "react";

import { Button, ButtonVariantEnum, ComponentSizeEnum } from "@fieldflow360/org-ui";
import { Navigation, Plus, Tag } from "lucide-react";

import type { BoundaryMapRef } from "@/shared/ui/common/map";

import type { LatLng, MapPinCreateSubmitHandler } from "../model/types";
import { CorePointLocationActions } from "./CorePointLocationActions";
import { MapPinAddPopover } from "./MapPinAddPopover";

const OVERLAY_BUTTON_CLASS =
  "border-border-subtle/80 bg-bg-surface-elevated/95 shadow-md backdrop-blur-sm";

export interface JobDetailMapControlsProps {
  boundaryMapRef: RefObject<BoundaryMapRef | null>;
  userLocation?: LatLng | null;
  // Map pins
  showPins: boolean;
  canMutatePins: boolean;
  onCreatePin: MapPinCreateSubmitHandler;
  onPlacePinOnMap: (categoryId: number) => void;
  onManageCategories: () => void;
  // Core points
  showAddCore: boolean;
  isCorePointMode: boolean;
  coreDisabled: boolean;
}

/**
 * Floating control cluster rendered on top of the boundary map in the
 * job/lead detail "On-Site Operation" card. Hosts the actions that used to
 * live in the toolbar above the map — My location, Add Pin (+ its menu),
 * Categories, and Add Core — so they sit directly over the field.
 */
export function JobDetailMapControls({
  boundaryMapRef,
  userLocation = null,
  showPins,
  canMutatePins,
  onCreatePin,
  onPlacePinOnMap,
  onManageCategories,
  showAddCore,
  isCorePointMode,
  coreDisabled,
}: JobDetailMapControlsProps) {
  const [isPinPopoverOpen, setIsPinPopoverOpen] = useState(false);
  const addPinAnchorRef = useRef<HTMLDivElement>(null);

  const handleMyLocation = useCallback(() => {
    boundaryMapRef.current?.centerOnUserLocation();
  }, [boundaryMapRef]);

  return (
    <div className="absolute top-3 right-3 z-20 flex flex-wrap items-start justify-end gap-2">
      <Button
        iconOnly
        aria-label={userLocation ? "My location" : "Location not available"}
        className={OVERLAY_BUTTON_CLASS}
        disabled={!userLocation}
        leftIcon={<Navigation className="h-5 w-5" />}
        size={ComponentSizeEnum.MD}
        variant={ButtonVariantEnum.SURFACE}
        onClick={handleMyLocation}
      />

      {showPins ? (
        <>
          <div ref={addPinAnchorRef} className="inline-flex">
            <Button
              className={OVERLAY_BUTTON_CLASS}
              disabled={!canMutatePins}
              leftIcon={<Plus aria-hidden className="h-4 w-4" />}
              title="Add Pin"
              variant={ButtonVariantEnum.SURFACE}
              onClick={() => setIsPinPopoverOpen((open) => !open)}
            />
          </div>
          <Button
            className={OVERLAY_BUTTON_CLASS}
            leftIcon={<Tag aria-hidden className="h-4 w-4" />}
            title="Categories"
            variant={ButtonVariantEnum.SURFACE}
            onClick={onManageCategories}
          />
          <MapPinAddPopover
            anchorRef={addPinAnchorRef}
            disabled={!canMutatePins}
            open={isPinPopoverOpen}
            userLocation={userLocation}
            onClose={() => setIsPinPopoverOpen(false)}
            onCreatePin={onCreatePin}
            onManageCategories={onManageCategories}
            onPlaceOnMap={onPlacePinOnMap}
          />
        </>
      ) : null}

      {showAddCore ? (
        <CorePointLocationActions
          boundaryMapRef={boundaryMapRef}
          buttonClassName={OVERLAY_BUTTON_CLASS}
          disabled={coreDisabled}
          isCorePointMode={isCorePointMode}
          userLocation={userLocation}
        />
      ) : null}
    </div>
  );
}
