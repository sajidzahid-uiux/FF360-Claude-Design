"use client";

import { Button, ButtonVariantEnum, Overlay } from "@fieldflow360/org-ui";

import type { CorePoint } from "@/shared/ui/common/map";

export interface DeckCorePointInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  corePoint: CorePoint | null;
  canEdit: boolean;
  canDelete: boolean;
  onChangeLocation: () => void;
  onRequestDelete: () => void;
}

export function DeckCorePointInfoDialog({
  open,
  onOpenChange,
  corePoint,
  canEdit,
  canDelete,
  onChangeLocation,
  onRequestDelete,
}: DeckCorePointInfoDialogProps) {
  return (
    <Overlay isOpen={open} onClose={() => onOpenChange(false)}>
      <div className="bg-bg-surface-elevated border-border-subtle w-full max-w-md rounded-lg border p-6 shadow-xl">
        <h2 className="text-text-primary text-lg font-semibold">
          {corePoint?.name}
        </h2>
        <p className="text-text-muted mt-2 text-sm">
          {corePoint?.description || "No description"}
          {corePoint ? (
            <>
              <br />
              Lat: {corePoint.latitude.toFixed(6)}, Lng:{" "}
              {corePoint.longitude.toFixed(6)}
            </>
          ) : null}
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          {canEdit ? (
            <Button
              aria-label="Change location"
              title="Change location"
              variant={ButtonVariantEnum.SURFACE}
              onClick={onChangeLocation}
            />
          ) : null}
          {canDelete ? (
            <Button
              aria-label="Delete"
              title="Delete"
              variant={ButtonVariantEnum.DELETE}
              onClick={onRequestDelete}
            />
          ) : null}
        </div>
      </div>
    </Overlay>
  );
}
