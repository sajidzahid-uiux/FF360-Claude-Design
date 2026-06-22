"use client";

import { useState } from "react";

import { MarkerF, OverlayView } from "@react-google-maps/api";

import type { CorePoint } from "@/shared/ui/common/map";

interface CorePointMarkersProps {
  corePoints: CorePoint[];
  showCorePoints?: boolean;
  onCorePointClick?: (corePoint: CorePoint) => void;
}

const CORE_POINT_ICON_URL =
  'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="%23ef4444" stroke="%23fff" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="%23fff"/></svg>';

export function CorePointMarkers({
  corePoints,
  showCorePoints = false,
  onCorePointClick,
}: CorePointMarkersProps) {
  const [selectedCorePoint, setSelectedCorePoint] = useState<CorePoint | null>(
    null
  );

  if (!showCorePoints) return null;

  const handleMarkerClick = (corePoint: CorePoint) => {
    if (onCorePointClick) {
      onCorePointClick(corePoint);
      return;
    }
    setSelectedCorePoint(corePoint);
  };

  return (
    <>
      {corePoints.map((cp, i) => (
        <MarkerF
          key={cp.id ?? i}
          options={{
            icon: {
              url: CORE_POINT_ICON_URL,
              scaledSize: new google.maps.Size(24, 24),
              anchor: new google.maps.Point(12, 12),
            },
            clickable: true,
            title: cp.name,
          }}
          position={{ lat: cp.latitude, lng: cp.longitude }}
          onClick={() => handleMarkerClick(cp)}
        />
      ))}

      {!onCorePointClick && selectedCorePoint ? (
        <OverlayView
          getPixelPositionOffset={() => ({ x: 8, y: -60 })}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          position={{
            lat: selectedCorePoint.latitude,
            lng: selectedCorePoint.longitude,
          }}
        >
          <div
            className="bg-bg-surface-elevated border-border-subtle z-[1000] max-w-[280px] min-w-[180px] rounded-xl border p-3 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-1 flex items-start justify-between gap-2">
              <span className="text-text-primary text-sm leading-tight font-semibold">
                {selectedCorePoint.name}
              </span>
              <button
                className="text-text-muted hover:text-text-primary ml-2 flex-shrink-0 text-base leading-none"
                type="button"
                onClick={() => setSelectedCorePoint(null)}
              >
                ✕
              </button>
            </div>
            {selectedCorePoint.description ? (
              <p className="text-text-muted mt-1 text-xs">
                {selectedCorePoint.description}
              </p>
            ) : null}
          </div>
        </OverlayView>
      ) : null}
    </>
  );
}
