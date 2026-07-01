"use client";

import { useCallback, useMemo, useState } from "react";

import { Button, ButtonVariantEnum, Input, cn } from "@fieldflow360/org-ui";
import { MapPin, Plus, Search } from "lucide-react";

import { getMapPinDisplayName } from "@/features/map/lib/getMapPinDisplayName";
import type { MapPinItem } from "@/features/map/model/mapPinItem";
import type {
  DeckMapLayerContext,
  LatLng,
  MapPinCreateSubmitHandler,
} from "@/features/map/model/types";
import { useModalStack } from "@/shared/model/use-modal-stack";

import { MapPinAddDialog } from "./MapPinAddDialog";

function CategoryDot({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      className="inline-block h-3 w-3 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

const PIN_ROW_TEXT_CLASS = "text-base font-medium leading-tight";

export interface MapPinsPanelProps {
  pins: MapPinItem[];
  disabled?: boolean;
  defaultMapCenter?: LatLng | null;
  userLocation?: LatLng | null;
  mapLayerContext?: DeckMapLayerContext;
  onPinCreate?: MapPinCreateSubmitHandler;
  onPinFocus?: (pin: MapPinItem) => void;
  onManageCategories?: () => void;
  /** Hides the Add Pin / Manage Categories header buttons when those actions
   * are surfaced elsewhere (e.g. as on-map overlay controls). */
  hideHeaderActions?: boolean;
  /** Renders as an elevated floating panel (for overlaying the map) rather
   * than an inline card. */
  overlay?: boolean;
}

export function MapPinsPanel({
  pins,
  disabled = false,
  defaultMapCenter = null,
  userLocation = null,
  mapLayerContext,
  onPinCreate,
  onPinFocus,
  onManageCategories,
  hideHeaderActions = false,
  overlay = false,
}: MapPinsPanelProps) {
  const { stack, openModal, closeModalKey } = useModalStack();
  const [search, setSearch] = useState("");
  const isAddPinDialogOpen = stack.some((f) => f.key === "add-map-pin");

  const filteredPins = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pins;
    return pins.filter((pin) => {
      const label = getMapPinDisplayName(pin).toLowerCase();
      return label.includes(q) || pin.categoryName.toLowerCase().includes(q);
    });
  }, [pins, search]);

  const handleOpenAddPin = useCallback(() => {
    openModal("add-map-pin");
  }, [openModal]);

  const handleManageCategories = useCallback(() => {
    onManageCategories?.();
  }, [onManageCategories]);

  const handlePinDoubleClick = useCallback(
    (pin: MapPinItem) => {
      onPinFocus?.(pin);
    },
    [onPinFocus]
  );

  return (
    <>
      <div
        className={cn(
          "overflow-hidden rounded-lg border",
          overlay
            ? "border-border-subtle/80 bg-bg-surface-elevated/95 shadow-md backdrop-blur-sm"
            : "border-border-subtle bg-bg-surface mb-3"
        )}
      >
        <div className="border-border-subtle flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <MapPin aria-hidden className="text-text-muted h-4 w-4" />
            <span className="text-text-primary text-sm font-semibold">
              Pins
            </span>
          </div>
          {hideHeaderActions ? null : (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                disabled={disabled}
                leftIcon={<Plus aria-hidden className="h-3 w-3" />}
                title="Add Pin"
                variant={ButtonVariantEnum.SURFACE}
                onClick={handleOpenAddPin}
              />
              <Button
                aria-label="Manage Categories →"
                disabled={disabled}
                title="Manage Categories →"
                variant={ButtonVariantEnum.GHOST}
                onClick={handleManageCategories}
              />
            </div>
          )}
        </div>

        <div className="border-border-subtle border-b px-4 py-2">
          <Input
            autoComplete="off"
            leftIcon={<Search aria-hidden className="h-4 w-4" />}
            placeholder="Search by label..."
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <ul
          className={cn(
            "divide-border-subtle divide-y overflow-y-auto",
            overlay ? "max-h-44" : "max-h-60"
          )}
        >
          {filteredPins.length === 0 ? (
            <li className="text-text-muted px-4 py-6 text-center text-sm">
              {pins.length === 0
                ? "No pins yet."
                : "No pins match your search."}
            </li>
          ) : (
            filteredPins.map((pin) => (
              <li
                key={pin.id}
                className={cn(
                  "flex items-center justify-between gap-3 px-4 py-3",
                  onPinFocus && "hover:bg-bg-surface/60 cursor-pointer"
                )}
                onDoubleClick={() => handlePinDoubleClick(pin)}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <CategoryDot color={pin.categoryColor} />
                  <span
                    className={cn(
                      "text-text-primary truncate",
                      PIN_ROW_TEXT_CLASS
                    )}
                  >
                    {getMapPinDisplayName(pin)}
                  </span>
                </div>
                <div className="text-text-muted flex shrink-0 items-center gap-2.5">
                  <CategoryDot color={pin.categoryColor} />
                  <span className={PIN_ROW_TEXT_CLASS}>{pin.categoryName}</span>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      <MapPinAddDialog
        defaultMapCenter={defaultMapCenter}
        disabled={disabled}
        mapLayerContext={mapLayerContext}
        open={isAddPinDialogOpen}
        userLocation={userLocation}
        onOpenChange={(o) => {
          if (!o) closeModalKey("add-map-pin");
        }}
        onSubmit={onPinCreate}
      />
    </>
  );
}
