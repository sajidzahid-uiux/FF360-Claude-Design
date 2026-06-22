"use client";

import { MapPin } from "lucide-react";

/**
 * Legend for vendor maps: blue = exact, gray = approximate (state-only), golden = selected/favorite.
 */
const COLORS = {
  exact: "#3B82F6",
  approximate: "#6B7280",
  selectedFavorite: "#F59E0B",
} as const;

export interface VendorLegendProps {
  /** "Selected" for VendorsNearYou, "Favorite" for Favorites page */
  selectedOrFavoriteLabel?: string;
  isMobile?: boolean;
  className?: string;
}

export function VendorLegend({
  selectedOrFavoriteLabel = "Selected / Favorite",
  isMobile = false,
  className = "",
}: VendorLegendProps) {
  const size = isMobile ? "h-6 w-6" : "h-7 w-7";
  const iconSize = isMobile ? "h-3 w-3" : "h-4 w-4";
  const textSize = isMobile ? "text-xs" : "text-base";

  return (
    <div
      className={`absolute bottom-4 left-4 z-10 flex w-auto flex-col gap-2 rounded-lg bg-black/70 p-3 shadow lg:bottom-4 lg:left-4 lg:min-w-[200px] lg:p-4 ${className}`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`flex ${size} flex-shrink-0 items-center justify-center rounded-full`}
          style={{ backgroundColor: COLORS.exact }}
        >
          <MapPin className={`${iconSize} text-white`} />
        </span>
        <span className={`font-medium text-white ${textSize}`}>
          Vendors (exact location)
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`flex ${size} flex-shrink-0 items-center justify-center rounded-full`}
          style={{ backgroundColor: COLORS.approximate }}
        >
          <MapPin className={`${iconSize} text-white`} />
        </span>
        <span className={`font-medium text-white ${textSize}`}>
          Vendors (state only)
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`flex ${size} flex-shrink-0 items-center justify-center rounded-full`}
          style={{ backgroundColor: COLORS.selectedFavorite }}
        >
          <MapPin className={`${iconSize} text-white`} />
        </span>
        <span className={`font-medium text-white ${textSize}`}>
          {selectedOrFavoriteLabel}
        </span>
      </div>
    </div>
  );
}
