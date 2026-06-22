"use client";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  cn,
} from "@fieldflow360/org-ui";

import type { Vendor } from "@/api/types";

export interface VendorsListProps {
  vendors: Vendor[];
  highlightedVendorId: number | null;
  isFavorite: (vendorId: number) => boolean;
  canAddMore: boolean;
  /** When false, add-to-favorites is disabled (e.g. no settings write permission). Default true. */
  canAddFavorite?: boolean;
  addFavoritePending: boolean;
  onVendorClick: (vendor: Vendor) => void;
  onAddFavorite: (vendor: Vendor) => void;
}

export function VendorsList({
  vendors,
  highlightedVendorId,
  isFavorite,

  canAddFavorite = true,
  addFavoritePending,
  onVendorClick,
  onAddFavorite,
}: VendorsListProps) {
  if (vendors.length === 0) {
    return (
      <div className="text-text-muted px-4 py-3 text-sm">No vendors found</div>
    );
  }

  return (
    <>
      {vendors.map((vendor) => {
        const favored = isFavorite(vendor.id);
        return (
          <div
            key={vendor.id}
            className={cn(
              "border-border-subtle hover:bg-accent/50 flex cursor-pointer items-center justify-between gap-2 border-b px-4 py-3 last:border-0",
              highlightedVendorId === vendor.id && "bg-accent/50"
            )}
            role="button"
            tabIndex={0}
            onClick={() => onVendorClick(vendor)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onVendorClick(vendor);
            }}
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium">
                {vendor.name} - {vendor.provider.name}
              </p>
              <p className="text-text-muted text-sm">
                {vendor.phone_number && (
                  <>
                    {vendor.phone_number}
                    {(vendor.address ||
                      vendor.lat == null ||
                      vendor.long == null) &&
                      " • "}
                  </>
                )}
                {vendor.address ? vendor.address : ""}
                {vendor.lat == null || vendor.long == null
                  ? " • No specified location"
                  : ""}
              </p>
            </div>
            {favored ? (
              <span className="text-text-muted text-xs">In favorites</span>
            ) : (
              <Button
                aria-label="Favorite"
                disabled={!canAddFavorite || addFavoritePending}
                size={ComponentSizeEnum.SM}
                title="Favorite"
                variant={ButtonVariantEnum.SURFACE}
                onClick={(e) => {
                  e.stopPropagation();
                  onAddFavorite(vendor);
                }}
              />
            )}
          </div>
        );
      })}
    </>
  );
}
