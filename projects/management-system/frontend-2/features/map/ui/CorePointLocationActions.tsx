"use client";

import { useCallback, useRef, useState } from "react";
import type { RefObject } from "react";

import { Button, ButtonVariantEnum } from "@fieldflow360/org-ui";
import { Plus } from "lucide-react";

import type { BoundaryMapRef } from "@/shared/ui/common/map";

import type { LatLng } from "../model/types";
import { CorePointAddPopover } from "./CorePointAddPopover";

export interface CorePointLocationActionsProps {
  disabled?: boolean;
  isCorePointMode?: boolean;
  userLocation?: LatLng | null;
  boundaryMapRef: RefObject<BoundaryMapRef | null>;
  /** Overrides the default trigger button styling (e.g. for on-map overlays). */
  buttonClassName?: string;
}

export function CorePointLocationActions({
  disabled = false,
  isCorePointMode = false,
  userLocation = null,
  boundaryMapRef,
  buttonClassName = "w-full lg:w-auto",
}: CorePointLocationActionsProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const addCoreAnchorRef = useRef<HTMLDivElement>(null);

  const handleCancelCorePointMode = useCallback(() => {
    boundaryMapRef.current?.cancelCorePointMode();
  }, [boundaryMapRef]);

  return (
    <>
      <div className="flex items-center gap-2">
        {isCorePointMode ? (
          <Button
            aria-label="Cancel"
            className={buttonClassName}
            title="Cancel"
            variant={ButtonVariantEnum.SURFACE}
            onClick={handleCancelCorePointMode}
          />
        ) : (
          <div ref={addCoreAnchorRef} className="inline-flex">
            <Button
              className={buttonClassName}
              disabled={disabled}
              leftIcon={<Plus aria-hidden className="h-3 w-3" />}
              title="Add Core"
              variant={ButtonVariantEnum.SURFACE}
              onClick={() => setIsPopoverOpen((open) => !open)}
            />
          </div>
        )}
      </div>

      <CorePointAddPopover
        anchorRef={addCoreAnchorRef}
        boundaryMapRef={boundaryMapRef}
        disabled={disabled}
        open={isPopoverOpen}
        userLocation={userLocation}
        onClose={() => setIsPopoverOpen(false)}
      />
    </>
  );
}
