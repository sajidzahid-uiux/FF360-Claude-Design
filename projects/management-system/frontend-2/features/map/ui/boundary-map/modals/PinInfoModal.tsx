"use client";

import { Button, ButtonVariantEnum, Modal } from "@fieldflow360/org-ui";

import type { MapPinItem } from "@/features/map/model/mapPinItem";

export interface PinInfoModalProps {
  open: boolean;
  pin: MapPinItem | null;
  onClose: () => void;
  onDelete?: () => void;
}

export function PinInfoModal({
  open,
  pin,
  onClose,
  onDelete,
}: PinInfoModalProps) {
  if (!open || !pin) {
    return null;
  }

  return (
    <Modal isOpen={open} size="md" title={pin.name ?? "Pin"} onClose={onClose}>
      <p className="text-text-muted text-sm">
        Lat: {pin.latitude?.toFixed(6)}, Lng: {pin.longitude?.toFixed(6)}
      </p>
      {onDelete ? (
        <div className="mt-6 flex justify-end">
          <Button
            aria-label="Delete"
            title="Delete"
            variant={ButtonVariantEnum.DELETE}
            onClick={onDelete}
          />
        </div>
      ) : null}
    </Modal>
  );
}
