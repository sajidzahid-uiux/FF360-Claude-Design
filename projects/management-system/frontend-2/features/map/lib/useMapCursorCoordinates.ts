import { useCallback, useEffect, useRef, useState } from "react";

import type { GeoLatLng } from "@/api/types/geo";

const CURSOR_THROTTLE_MS = 80;

export function useMapCursorCoordinates() {
  const [coordinates, setCoordinates] = useState<GeoLatLng | null>(null);
  const lastUpdateRef = useRef(0);
  const pendingRef = useRef<GeoLatLng | null>(null);
  const rafRef = useRef<number | null>(null);

  const flushPending = useCallback(() => {
    rafRef.current = null;
    if (pendingRef.current) {
      setCoordinates(pendingRef.current);
      pendingRef.current = null;
    }
  }, []);

  const handleMouseMove = useCallback(
    (latLng: GeoLatLng) => {
      const now = Date.now();
      pendingRef.current = latLng;

      if (now - lastUpdateRef.current >= CURSOR_THROTTLE_MS) {
        lastUpdateRef.current = now;
        setCoordinates(latLng);
        pendingRef.current = null;
        return;
      }

      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(flushPending);
      }
    },
    [flushPending]
  );

  const handleMouseOut = useCallback(() => {
    pendingRef.current = null;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setCoordinates(null);
  }, []);

  useEffect(
    () => () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    },
    []
  );

  return { coordinates, handleMouseMove, handleMouseOut };
}
