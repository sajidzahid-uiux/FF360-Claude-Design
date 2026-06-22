"use client";

import { Button, ButtonVariantEnum, Overlay } from "@fieldflow360/org-ui";

import { getMapPinDisplayName } from "@/features/map/lib/getMapPinDisplayName";
import type { MapPinItem } from "@/features/map/model/mapPinItem";

export interface DeckMapPinInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pin: MapPinItem | null;
  canDelete: boolean;
  onRequestDelete: () => void;
}

export function DeckMapPinInfoDialog({
  open,
  onOpenChange,
  pin,
  canDelete,
  onRequestDelete,
}: DeckMapPinInfoDialogProps) {
  const displayName = pin ? getMapPinDisplayName(pin) : "";

  return (
    <Overlay isOpen={open} onClose={() => onOpenChange(false)}>
      <div className="bg-bg-surface-elevated border-border-subtle w-full max-w-md rounded-lg border p-6 shadow-xl">
        <div className="flex items-start gap-3">
          {pin ? (
            <span
              aria-hidden
              className="mt-1 inline-block h-4 w-4 shrink-0 rounded-full"
              style={{ backgroundColor: pin.categoryColor }}
            />
          ) : null}
          <div className="min-w-0 flex-1">
            <h2 className="text-text-primary text-lg font-semibold">
              {displayName}
            </h2>
            {pin?.label ? (
              <p className="text-text-muted mt-1 text-sm">{pin.name}</p>
            ) : null}
            {pin ? (
              <p className="text-text-muted mt-1 text-sm">{pin.categoryName}</p>
            ) : null}
          </div>
        </div>
        <p className="text-text-muted mt-3 text-sm">
          Lat: {pin?.latitude?.toFixed(6)}, Lng: {pin?.longitude?.toFixed(6)}
        </p>
        {canDelete ? (
          <div className="mt-6 flex justify-end">
            <Button
              aria-label="Delete"
              title="Delete"
              variant={ButtonVariantEnum.DELETE}
              onClick={onRequestDelete}
            />
          </div>
        ) : null}
      </div>
    </Overlay>
  );
}
