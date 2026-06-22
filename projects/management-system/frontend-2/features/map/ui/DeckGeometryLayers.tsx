"use client";

import { memo } from "react";

import {
  type UseDeckGeometryLayersOptions,
  useDeckGeometryLayers,
  useDeckGlOverlay,
} from "../lib/deck";

export type DeckGeometryLayersProps = UseDeckGeometryLayersOptions & {
  mapInstance: google.maps.Map | null;
};

/** Renders farm/SHP/XML/KML geometry via deck.gl on a Google Maps instance. */
export const DeckGeometryLayers = memo(function DeckGeometryLayers({
  mapInstance,
  ...options
}: DeckGeometryLayersProps) {
  const layers = useDeckGeometryLayers(options);
  useDeckGlOverlay(mapInstance, layers);
  return null;
});

/** @deprecated Use DeckGeometryLayers from @/features/map/ui/DeckGeometryLayers */
export const DeckGeometryOverlay = DeckGeometryLayers;
