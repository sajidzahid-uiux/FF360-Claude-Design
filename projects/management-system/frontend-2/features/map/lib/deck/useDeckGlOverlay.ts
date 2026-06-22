import { useEffect, useRef } from "react";

import type { Layer, PickingInfo } from "@deck.gl/core";
import { GoogleMapsOverlay } from "@deck.gl/google-maps";

/**
 * Manages a deck.gl GoogleMapsOverlay lifecycle on a Google Maps instance.
 * Creates the overlay once, updates layers reactively, and cleans up on unmount.
 *
 * Cursor handling: `GoogleMapsOverlay` paints to a canvas that Google Maps
 * stacks above its tiles, but the cursor on that canvas is hidden because
 * pointer events are handled by the map container underneath. Deck.gl's own
 * `getCursor` therefore has no visible effect. We instead toggle Google
 * Maps' `draggableCursor` option from a top-level `onHover` so the pointer
 * cursor shows whenever the mouse is over any pickable deck.gl feature
 * (pin markers, XML/KML paths).
 */
export function useDeckGlOverlay(
  mapInstance: google.maps.Map | null,
  layers: Layer[]
): void {
  const overlayRef = useRef<GoogleMapsOverlay | null>(null);
  const isHoveringRef = useRef<boolean>(false);

  const layersRef = useRef<Layer[]>(layers);
  layersRef.current = layers;

  // Create / destroy overlay when mapInstance changes (or on unmount).
  useEffect(() => {
    if (!mapInstance) return;

    const setHoverCursor = (hovering: boolean) => {
      if (hovering === isHoveringRef.current) return;
      isHoveringRef.current = hovering;
      mapInstance.setOptions({
        draggableCursor: hovering ? "pointer" : null,
      });
    };

    const overlay = new GoogleMapsOverlay({
      layers: [],
      onHover: (info: PickingInfo) => {
        setHoverCursor(Boolean(info?.picked));
      },
    });
    overlay.setMap(mapInstance);
    overlayRef.current = overlay;

    if (layersRef.current.length > 0) {
      overlay.setProps({ layers: layersRef.current });
    }

    let destroyed = false;
    return () => {
      if (destroyed) return;
      destroyed = true;
      overlay.finalize();
      overlay.setMap(null);
      overlayRef.current = null;
      isHoveringRef.current = false;
      mapInstance.setOptions({ draggableCursor: null });
    };
  }, [mapInstance]);

  // Sync layers reactively after the overlay exists.
  useEffect(() => {
    if (!overlayRef.current) return;
    overlayRef.current.setProps({ layers });
  }, [layers]);
}
