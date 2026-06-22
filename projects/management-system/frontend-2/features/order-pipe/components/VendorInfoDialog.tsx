"use client";

import { Button, ButtonVariantEnum, Modal } from "@fieldflow360/org-ui";

import type { Vendor } from "@/api/types";

export interface VendorInfoDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  vendor: Vendor;
  showFavoriteButton?: boolean;
  isFavorite?: boolean;
  isFavoritePending?: boolean;
  onFavorite?: () => void;
  onConfirm?: () => void;
  selectDisabled?: boolean;
}

export function VendorInfoDialog({
  open = true,
  onOpenChange,
  onClose,
  vendor,
  showFavoriteButton = true,
  isFavorite = false,
  isFavoritePending = false,
  onFavorite,
  onConfirm,
  selectDisabled = false,
}: VendorInfoDialogProps) {
  const handleRequestClose = () => {
    onClose?.();
    onOpenChange?.(false);
  };

  const handleConfirm = () => {
    onConfirm?.();
    handleRequestClose();
  };

  const title =
    vendor.name && vendor.provider?.name
      ? `${vendor.name} - ${vendor.provider.name}`
      : vendor.name || vendor.provider?.name || "Vendor";

  if (!open) {
    return null;
  }

  return (
    <Modal isOpen={open} size="md" title={title} onClose={handleRequestClose}>
      <p className="text-text-muted mb-4 text-sm">Vendor contact information</p>
      <div className="space-y-3">
        {vendor.provider?.name ? (
          <div>
            <span className="text-text-muted text-xs font-medium">
              Provider
            </span>
            <p className="text-sm">{vendor.provider.name}</p>
          </div>
        ) : null}
        {vendor.email ? (
          <div>
            <span className="text-text-muted text-xs font-medium">Email</span>
            <p className="text-sm">{vendor.email}</p>
          </div>
        ) : null}
        {vendor.phone_number ? (
          <div>
            <span className="text-text-muted text-xs font-medium">Phone</span>
            <p className="text-sm">{vendor.phone_number}</p>
          </div>
        ) : null}
        {vendor.address ? (
          <div>
            <span className="text-text-muted text-xs font-medium">Address</span>
            <p className="text-sm">{vendor.address}</p>
          </div>
        ) : null}
        {!vendor.provider?.name &&
        !vendor.email &&
        !vendor.phone_number &&
        !vendor.address ? (
          <p className="text-text-muted text-sm">
            No contact details available.
          </p>
        ) : null}
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button
          aria-label="Close"
          title="Close"
          variant={ButtonVariantEnum.SURFACE}
          onClick={handleRequestClose}
        />
        {showFavoriteButton ? (
          <Button
            aria-label={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
            disabled={isFavoritePending}
            loading={isFavoritePending}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            variant={
              isFavorite ? ButtonVariantEnum.DELETE : ButtonVariantEnum.DEFAULT
            }
            onClick={onFavorite}
          />
        ) : (
          <Button
            aria-label="Select"
            disabled={selectDisabled}
            title="Select"
            onClick={handleConfirm}
          />
        )}
      </div>
    </Modal>
  );
}
