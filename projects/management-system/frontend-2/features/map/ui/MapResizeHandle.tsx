"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";

const DEFAULT_MIN_MAP_HEIGHT = 280;
const DEFAULT_MAX_MAP_HEIGHT = 900;

export interface UseResizableMapHeightResult {
  /** Explicit dragged height in px, or null while the map uses its default/stretch height. */
  height: number | null;
  /** True once the user has dragged the handle (explicit height in effect). */
  isResized: boolean;
  /** Attach to the element whose height is being dragged (the map container). */
  containerRef: RefObject<HTMLDivElement | null>;
  /** Wire to the resize handle's onPointerDown. */
  onResizeStart: (event: ReactPointerEvent<HTMLDivElement>) => void;
}

/**
 * Drag-to-resize height for a map container. Mirrors the org-ui
 * `LocationPickerMap` behaviour: the map defaults to its normal (or stretched)
 * height until the user drags the bottom handle, after which an explicit height
 * (clamped to [min, max]) takes over. Pair with {@link MapResizeHandle}.
 */
export function useResizableMapHeight(
  min = DEFAULT_MIN_MAP_HEIGHT,
  max = DEFAULT_MAX_MAP_HEIGHT
): UseResizableMapHeightResult {
  const [height, setHeight] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef<{ startY: number; startHeight: number } | null>(null);

  const onMove = useCallback(
    (event: PointerEvent) => {
      const state = stateRef.current;
      if (!state) return;
      const next = Math.min(
        max,
        Math.max(min, state.startHeight + (event.clientY - state.startY))
      );
      setHeight(next);
    },
    [min, max]
  );

  const onEnd = useCallback(() => {
    stateRef.current = null;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onEnd);
  }, [onMove]);

  const onResizeStart = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      const startHeight =
        containerRef.current?.getBoundingClientRect().height ?? min;
      stateRef.current = { startY: event.clientY, startHeight };
      document.body.style.cursor = "ns-resize";
      document.body.style.userSelect = "none";
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onEnd);
    },
    [min, onMove, onEnd]
  );

  useEffect(() => {
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
    };
  }, [onMove, onEnd]);

  return { height, isResized: height != null, containerRef, onResizeStart };
}

export interface MapResizeHandleProps {
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
}

/**
 * The bottom drag affordance (a small pill) for resizing a map's height. Render
 * inside a `relative` map container; wire `onPointerDown` to
 * {@link useResizableMapHeight}'s `onResizeStart`.
 */
export function MapResizeHandle({ onPointerDown }: MapResizeHandleProps) {
  return (
    <div
      aria-label="Resize map"
      aria-orientation="horizontal"
      className="group absolute inset-x-0 bottom-0 z-30 flex h-5 cursor-ns-resize items-end justify-center pb-1"
      role="separator"
      onPointerDown={onPointerDown}
    >
      <div className="bg-bg-surface-elevated border-border-subtle group-hover:border-text-muted flex h-2.5 w-12 items-center justify-center rounded-full border shadow-md transition-colors">
        <div className="bg-text-muted h-0.5 w-6 rounded-full" />
      </div>
    </div>
  );
}
