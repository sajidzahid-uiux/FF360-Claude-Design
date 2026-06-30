"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { RefObject } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  Input,
  TableToolbarPanel,
  TabsSwitcher,
  type TabsSwitcherItem,
  cn,
} from "@fieldflow360/org-ui";
import { MapPin, Navigation, Plus, Search } from "lucide-react";

import {
  isMapCoordinateError,
  parseAndValidateMapCoordinates,
} from "@/features/map/lib/validateMapCoordinates";
import type {
  LatLng,
  MapPinCreateSubmitHandler,
  MapPinPlacementMode,
} from "@/features/map/model/types";
import { useMapPinCategories } from "@/hooks/queries/useMapPinCategories";

const PLACEMENT_TABS: TabsSwitcherItem<MapPinPlacementMode>[] = [
  { value: "map", label: "Place on Map" },
  { value: "current", label: "Current Location" },
  { value: "manual", label: "Manual" },
];

export interface MapPinAddPopoverProps {
  open: boolean;
  onClose: () => void;
  /** Element the floating panel is positioned against (the Add Pin trigger). */
  anchorRef: RefObject<HTMLElement | null>;
  disabled?: boolean;
  userLocation?: LatLng | null;
  /** Create a pin immediately at fixed coordinates (current / manual modes). */
  onCreatePin: MapPinCreateSubmitHandler;
  /** Arm click-to-place on the real field map for the chosen category. */
  onPlaceOnMap: (categoryId: number) => void;
  /** Navigate to the Manage Categories screen (offered in the empty state). */
  onManageCategories?: () => void;
}

/**
 * Compact "Add Pin" menu shown as a floating panel anchored to the on-map
 * Add Pin button. Mirrors the legacy two-step flow — pick a category, then a
 * placement method — but renders with org-ui primitives. "Place on Map" hands
 * off to the real boundary map (click to drop); "Current Location" / "Manual"
 * create the pin directly. The pin label is added later by selecting the pin.
 */
export function MapPinAddPopover({
  open,
  onClose,
  anchorRef,
  disabled = false,
  userLocation = null,
  onCreatePin,
  onPlaceOnMap,
  onManageCategories,
}: MapPinAddPopoverProps) {
  const { categories, isLoading } = useMapPinCategories();
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [placementMode, setPlacementMode] =
    useState<MapPinPlacementMode>("map");
  const [latitudeInput, setLatitudeInput] = useState("");
  const [longitudeInput, setLongitudeInput] = useState("");
  const [coordinateError, setCoordinateError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default to the first category once they load / the panel opens.
  useEffect(() => {
    if (open && categories.length > 0 && selectedCategoryId == null) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [open, categories, selectedCategoryId]);

  // Clear transient state whenever the panel closes.
  useEffect(() => {
    if (!open) {
      setSearch("");
      setPlacementMode("map");
      setLatitudeInput("");
      setLongitudeInput("");
      setCoordinateError(null);
      setIsSubmitting(false);
      setSelectedCategoryId(null);
    }
  }, [open]);

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((category) =>
      category.name.toLowerCase().includes(q)
    );
  }, [categories, search]);

  const createPinAt = useCallback(
    async (lat: number, lng: number) => {
      if (selectedCategoryId == null) return;
      setIsSubmitting(true);
      try {
        await onCreatePin({ categoryId: selectedCategoryId, lat, lng });
        onClose();
      } finally {
        setIsSubmitting(false);
      }
    },
    [onClose, onCreatePin, selectedCategoryId]
  );

  const handlePlaceOnMap = useCallback(() => {
    if (selectedCategoryId == null) return;
    onPlaceOnMap(selectedCategoryId);
    onClose();
  }, [onClose, onPlaceOnMap, selectedCategoryId]);

  const handleLocateMe = useCallback(() => {
    if (selectedCategoryId == null) return;
    if (userLocation) {
      void createPinAt(userLocation.lat, userLocation.lng);
      return;
    }
    if (!navigator.geolocation) {
      setCoordinateError("Geolocation is not available in this browser.");
      return;
    }
    setIsSubmitting(true);
    navigator.geolocation.getCurrentPosition(
      (position) =>
        void createPinAt(position.coords.latitude, position.coords.longitude),
      () => {
        setCoordinateError("Could not get your current location.");
        setIsSubmitting(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [createPinAt, selectedCategoryId, userLocation]);

  const handleAddManual = useCallback(() => {
    const result = parseAndValidateMapCoordinates(latitudeInput, longitudeInput);
    if (isMapCoordinateError(result)) {
      setCoordinateError(result.error);
      return;
    }
    setCoordinateError(null);
    void createPinAt(result.lat, result.lng);
  }, [createPinAt, latitudeInput, longitudeInput]);

  const noCategories = !isLoading && categories.length === 0;
  const canAct = selectedCategoryId != null && !disabled && !isSubmitting;

  return (
    <TableToolbarPanel anchorRef={anchorRef} open={open} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <p className="text-text-primary text-sm font-semibold">Category</p>
          {isLoading ? (
            <p className="text-text-muted text-sm">Loading categories…</p>
          ) : noCategories ? (
            <div className="space-y-2">
              <p className="text-text-muted text-sm">
                No pin categories yet. Create one before adding pins.
              </p>
              {onManageCategories ? (
                <Button
                  title="Manage Categories"
                  variant={ButtonVariantEnum.SURFACE}
                  onClick={() => {
                    onManageCategories();
                    onClose();
                  }}
                />
              ) : null}
            </div>
          ) : (
            <>
              <Input
                autoComplete="off"
                leftIcon={<Search aria-hidden className="h-4 w-4" />}
                placeholder="Search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <ul className="border-border-subtle divide-border-subtle max-h-44 divide-y overflow-y-auto rounded-md border">
                {filteredCategories.length === 0 ? (
                  <li className="text-text-muted px-3 py-3 text-center text-sm">
                    No categories match your search.
                  </li>
                ) : (
                  filteredCategories.map((category) => {
                    const selected = category.id === selectedCategoryId;
                    return (
                      <li key={category.id}>
                        <button
                          className={cn(
                            "flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors",
                            selected
                              ? "bg-bg-hover"
                              : "hover:bg-bg-hover/60"
                          )}
                          disabled={disabled}
                          type="button"
                          onClick={() => setSelectedCategoryId(category.id)}
                        >
                          <span
                            aria-hidden
                            className="inline-block h-3 w-3 shrink-0 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-text-primary truncate font-medium">
                            {category.name}
                          </span>
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            </>
          )}
        </div>

        {!noCategories ? (
          <div className="space-y-3">
            <p className="text-text-primary text-sm font-semibold">
              Pin Location
            </p>
            <TabsSwitcher
              fullWidth
              items={PLACEMENT_TABS}
              size={ComponentSizeEnum.SM}
              value={placementMode}
              onChange={setPlacementMode}
            />

            {placementMode === "map" ? (
              <div className="space-y-3">
                <p className="text-text-muted flex items-center gap-1.5 text-xs">
                  <MapPin aria-hidden className="h-3.5 w-3.5 shrink-0" />
                  Click anywhere on the map to place your pin.
                </p>
                <Button
                  fullWidth
                  disabled={!canAct}
                  leftIcon={<MapPin aria-hidden className="h-4 w-4" />}
                  title="Place on map"
                  onClick={handlePlaceOnMap}
                />
              </div>
            ) : null}

            {placementMode === "current" ? (
              <Button
                fullWidth
                disabled={!canAct}
                leftIcon={<Navigation aria-hidden className="h-4 w-4" />}
                loading={isSubmitting}
                title="Locate me"
                onClick={handleLocateMe}
              />
            ) : null}

            {placementMode === "manual" ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    disabled={disabled || isSubmitting}
                    label="Latitude"
                    placeholder="27.07793"
                    value={latitudeInput}
                    onChange={(event) => setLatitudeInput(event.target.value)}
                  />
                  <Input
                    disabled={disabled || isSubmitting}
                    label="Longitude"
                    placeholder="-81.897308"
                    value={longitudeInput}
                    onChange={(event) => setLongitudeInput(event.target.value)}
                  />
                </div>
                <Button
                  fullWidth
                  disabled={!canAct || !latitudeInput || !longitudeInput}
                  leftIcon={<Plus aria-hidden className="h-4 w-4" />}
                  loading={isSubmitting}
                  title="Add"
                  onClick={handleAddManual}
                />
              </div>
            ) : null}

            {coordinateError ? (
              <p className="text-feedback-error text-xs">{coordinateError}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </TableToolbarPanel>
  );
}
