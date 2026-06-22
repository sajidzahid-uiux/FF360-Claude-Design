"use client";

import { useCallback } from "react";

import { Button, ButtonVariantEnum } from "@fieldflow360/org-ui";
import { OverlayView } from "@react-google-maps/api";
import { ChevronRight, X } from "lucide-react";

import type { DeckMarkerDatum, StackedGroup } from "../lib/deck";
import type { MapMarkerData } from "../model/types";

interface StackedGroupPopupProps {
  group: StackedGroup;
  onItemClick: (item: MapMarkerData) => void;
  onClose: () => void;
}

function resolveTitle(marker: DeckMarkerDatum): string {
  const item = marker.originalItem;
  if (!item) return "Unknown";
  if (item.object_type === "contact") return item.full_name ?? "Contact";
  const name = item.title && item.title !== "N/A" ? item.title : "Untitled";
  return item.farm_name ? `${name} — ${item.farm_name}` : name;
}

function resolveStatus(marker: DeckMarkerDatum): string | null {
  const item = marker.originalItem;
  if (!item) return null;
  return item.job_status?.title ?? item.lead_status?.title ?? null;
}

export function StackedGroupPopup({
  group,
  onItemClick,
  onClose,
}: StackedGroupPopupProps) {
  const [lng, lat] = group.position;

  const stopPropagation = useCallback((e: React.SyntheticEvent) => {
    e.stopPropagation();
  }, []);

  const handleItemClick = useCallback(
    (marker: DeckMarkerDatum) => {
      if (!marker.originalItem) return;
      onItemClick(marker.originalItem);
    },
    [onItemClick]
  );

  return (
    <OverlayView
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      position={{ lat, lng }}
    >
      <div
        className="bg-bg-surface-elevated border-accent/40 relative left-1/2 z-1000 w-[280px] -translate-x-1/2 rounded-xl border shadow-xl sm:left-auto sm:translate-x-0"
        onClick={stopPropagation}
        onTouchEnd={stopPropagation}
        onTouchStart={stopPropagation}
      >
        <div className="border-accent/40 flex items-center justify-between border-b px-4 py-3">
          <span className="text-text-primary text-sm font-semibold">
            {group.items.length} items at this location
          </span>
          <Button
            iconOnly
            aria-label="Close popup"
            leftIcon={<X aria-hidden className="h-3.5 w-3.5" />}
            variant={ButtonVariantEnum.GHOST}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
          />
        </div>

        <ul
          className="max-h-[240px] overflow-y-auto py-1"
          onWheel={(e) => e.stopPropagation()}
        >
          {group.items.map((marker, idx) => (
            <li
              key={
                marker.originalItem
                  ? `${marker.originalItem.id}-${marker.originalItem.highlighted_farm_id ?? idx}`
                  : idx
              }
            >
              <button
                className="hover:bg-bg-hover active:bg-bg-hover flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleItemClick(marker);
                }}
              >
                <img
                  alt=""
                  aria-hidden="true"
                  className="flex-shrink-0 object-contain"
                  height={28}
                  src={marker.iconUrl}
                  style={{ width: 20, height: 28 }}
                  width={20}
                />

                <span className="min-w-0 flex-1">
                  <span className="text-text-primary block truncate text-sm font-medium">
                    {resolveTitle(marker)}
                  </span>
                  {resolveStatus(marker) ? (
                    <span className="text-text-muted block truncate text-xs">
                      {resolveStatus(marker)}
                    </span>
                  ) : null}
                </span>

                <ChevronRight
                  aria-hidden
                  className="text-text-muted h-4 w-4 flex-shrink-0"
                />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </OverlayView>
  );
}
