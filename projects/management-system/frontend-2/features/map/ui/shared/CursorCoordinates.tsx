"use client";

import { memo } from "react";

import type { GeoLatLng } from "@/api/types/geo";

interface CursorCoordinatesProps {
  coordinates: GeoLatLng | null;
}

export const CursorCoordinates = memo(function CursorCoordinates({
  coordinates,
}: CursorCoordinatesProps) {
  if (!coordinates) return null;

  return (
    <div className="bg-bg-surface-elevated/95 border-border-subtle text-text-primary absolute top-4 left-4 z-10 rounded-lg border px-3 py-2 font-mono text-xs shadow-lg">
      <div>Lat: {coordinates.lat.toFixed(6)}</div>
      <div>Long: {coordinates.lng.toFixed(6)}</div>
    </div>
  );
});
