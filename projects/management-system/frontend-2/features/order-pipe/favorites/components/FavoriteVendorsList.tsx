"use client";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
} from "@fieldflow360/org-ui";
import { X } from "lucide-react";

import type { VendorFavorite } from "@/api/types";
import { DISTANCE_UNITS } from "@/constants";
import { useUnitSystem } from "@/hooks";
import { distanceBetween } from "@/lib/geo";

import { VendorCard } from "./VendorCard";

export interface FavoriteVendorsListProps {
  favoriteRecords: VendorFavorite[];
  userLocation: { lat: number; lng: number } | null;
  highlightedVendorId: number | null;
  /** When false, remove button is hidden (e.g. no settings delete permission). */
  canRemove?: boolean;
  removePending: boolean;
  onHighlight: (vendorId: number | null) => void;
  onRemove: (favoriteId: number) => void;
}

export function FavoriteVendorsList({
  favoriteRecords,
  userLocation,
  highlightedVendorId,
  canRemove = true,
  removePending,
  onHighlight,
  onRemove,
}: FavoriteVendorsListProps) {
  const unitSystem = useUnitSystem();
  const distanceLabel = DISTANCE_UNITS.LONG[unitSystem];

  if (favoriteRecords.length === 0) {
    return null;
  }

  return (
    <>
      {favoriteRecords.map((record) => {
        const v = record.vendor;
        if (!v) return null;
        const hasLocation =
          v.lat != null &&
          v.long != null &&
          Number.isFinite(Number(v.lat)) &&
          Number.isFinite(Number(v.long));
        const milesText = !hasLocation
          ? "Has no specified location"
          : userLocation != null
            ? `${Number(distanceBetween(userLocation.lat, userLocation.lng, Number(v.lat), Number(v.long), unitSystem)).toFixed(1)} ${distanceLabel} away from you`
            : `— ${distanceLabel} away from you`;

        return (
          <VendorCard
            key={record.id}
            name={`${v.name} - ${v.provider.name}`}
            rightAction={
              canRemove ? (
                <Button
                  iconOnly
                  aria-label={`Remove ${v.name} from favorites`}
                  disabled={removePending}
                  leftIcon={<X className="h-4 w-4" />}
                  size={ComponentSizeEnum.SM}
                  variant={ButtonVariantEnum.GHOST}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(record.id);
                  }}
                />
              ) : undefined
            }
            selected={highlightedVendorId === v.id}
            subtitle={
              v.phone_number ? `${v.phone_number} • ${milesText}` : milesText
            }
            onClick={() =>
              onHighlight(highlightedVendorId === v.id ? null : v.id)
            }
          />
        );
      })}
    </>
  );
}
