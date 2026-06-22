"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import {
  AppFormModal,
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  Input,
  TabsSwitcher,
  type TabsSwitcherItem,
  cn,
} from "@fieldflow360/org-ui";
import { MapPin, Navigation } from "lucide-react";

import {
  isMapCoordinateError,
  parseAndValidateMapCoordinates,
} from "@/features/map/lib/validateMapCoordinates";
import type {
  DeckMapLayerContext,
  LatLng,
  MapPinCreateSubmitHandler,
  MapPinPlacementMode,
} from "@/features/map/model/types";
import { DEFAULT_PIN_CATEGORY_COLOR } from "@/features/pin-categories/lib/pinCategoryColors";
import { MapPinCategoryPills } from "@/features/pin-categories/ui/MapPinCategoryPills";
import { useMapPinCategories } from "@/hooks/queries/useMapPinCategories";
import { useIsMobile } from "@/hooks/useIsMobile";

import { DeckPointPickerMap } from "./DeckPointPickerMap";

const PLACEMENT_TABS: TabsSwitcherItem<MapPinPlacementMode>[] = [
  { value: "map", label: "Place on Map" },
  { value: "current", label: "Current Location" },
  { value: "manual", label: "Manual Coordinates" },
];

function MapPinCoordinatesPreview({
  lat,
  lng,
}: {
  lat?: number | null;
  lng?: number | null;
}) {
  const hasCoordinates = lat != null && lng != null;

  return (
    <div
      aria-disabled
      className="bg-bg-surface/60 text-text-muted border-border-subtle/60 pointer-events-none flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm"
    >
      <MapPin aria-hidden className="h-4 w-4 shrink-0 opacity-70" />
      {hasCoordinates ? (
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span>Lat: {lat.toFixed(6)}</span>
          <span>Lng: {lng.toFixed(6)}</span>
        </div>
      ) : (
        <span className="text-text-muted/70">
          Selected coordinates will appear here
        </span>
      )}
    </div>
  );
}

export interface MapPinAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disabled?: boolean;
  defaultMapCenter?: LatLng | null;
  userLocation?: LatLng | null;
  mapLayerContext?: DeckMapLayerContext;
  onSubmit?: MapPinCreateSubmitHandler;
}

export function MapPinAddDialog({
  open,
  onOpenChange,
  disabled = false,
  defaultMapCenter = null,
  userLocation = null,
  mapLayerContext,
  onSubmit,
}: MapPinAddDialogProps) {
  const { categories, isLoading } = useMapPinCategories();
  const isMobile = useIsMobile();
  const [pinLabel, setPinLabel] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [placementMode, setPlacementMode] =
    useState<MapPinPlacementMode>("map");
  const [coordinates, setCoordinates] = useState<LatLng | null>(null);
  const [latitudeInput, setLatitudeInput] = useState("");
  const [longitudeInput, setLongitudeInput] = useState("");
  const [coordinateError, setCoordinateError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [liveUserLocation, setLiveUserLocation] = useState<LatLng | null>(
    userLocation
  );

  const mapDefaultCenter = useMemo(
    () => defaultMapCenter ?? userLocation ?? { lat: 39.8283, lng: -98.5795 },
    [defaultMapCenter, userLocation]
  );

  const placementTabs = useMemo(
    () =>
      isMobile
        ? PLACEMENT_TABS
        : PLACEMENT_TABS.filter((tab) => tab.value !== "current"),
    [isMobile]
  );

  const mapHeight = isMobile ? 220 : 260;

  const placementPinColor = useMemo(() => {
    const category = categories.find((item) => item.id === selectedCategoryId);
    return category?.color ?? DEFAULT_PIN_CATEGORY_COLOR;
  }, [categories, selectedCategoryId]);

  const resetForm = useCallback(() => {
    setPinLabel("");
    setSelectedCategoryId(null);
    setPlacementMode("map");
    setCoordinates(null);
    setLatitudeInput("");
    setLongitudeInput("");
    setCoordinateError(null);
    setIsSubmitting(false);
    setLiveUserLocation(userLocation);
  }, [userLocation]);

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  useEffect(() => {
    if (open && categories.length > 0 && selectedCategoryId == null) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [open, categories, selectedCategoryId]);

  useEffect(() => {
    setLiveUserLocation(userLocation);
  }, [userLocation]);

  useEffect(() => {
    if (!isMobile && placementMode === "current") {
      setPlacementMode("map");
    }
  }, [isMobile, placementMode]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      resetForm();
      onOpenChange(false);
    }
  }, [isSubmitting, onOpenChange, resetForm]);

  const handleMapCoordinateChange = useCallback((lat: number, lng: number) => {
    setCoordinates({ lat, lng });
    setCoordinateError(null);
  }, []);

  const handleUseCurrentLocation = useCallback(() => {
    const applyLocation = (location: LatLng) => {
      setCoordinates(location);
      setLatitudeInput(String(location.lat));
      setLongitudeInput(String(location.lng));
      setCoordinateError(null);
    };

    if (liveUserLocation) {
      applyLocation(liveUserLocation);
      return;
    }

    if (!navigator.geolocation) {
      setCoordinateError("Geolocation is not available in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLiveUserLocation(location);
        applyLocation(location);
      },
      () => {
        setCoordinateError("Could not get your current location.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [liveUserLocation]);

  const syncManualCoordinates = useCallback(
    (latValue: string, lngValue: string) => {
      const result = parseAndValidateMapCoordinates(latValue, lngValue);
      if (isMapCoordinateError(result)) {
        setCoordinateError(result.error);
        setCoordinates(null);
        return;
      }
      setCoordinateError(null);
      setCoordinates(result);
    },
    []
  );

  const handleLatitudeChange = useCallback(
    (value: string) => {
      setLatitudeInput(value);
      syncManualCoordinates(value, longitudeInput);
    },
    [longitudeInput, syncManualCoordinates]
  );

  const handleLongitudeChange = useCallback(
    (value: string) => {
      setLongitudeInput(value);
      syncManualCoordinates(latitudeInput, value);
    },
    [latitudeInput, syncManualCoordinates]
  );

  const canSubmit =
    !disabled &&
    !isSubmitting &&
    selectedCategoryId != null &&
    coordinates != null &&
    !coordinateError;

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (
        !onSubmit ||
        !canSubmit ||
        selectedCategoryId == null ||
        !coordinates
      ) {
        return;
      }

      setIsSubmitting(true);
      try {
        const trimmedLabel = pinLabel.trim();
        await onSubmit({
          categoryId: selectedCategoryId,
          lat: coordinates.lat,
          lng: coordinates.lng,
          label: trimmedLabel || undefined,
        });
        handleClose();
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      canSubmit,
      coordinates,
      handleClose,
      onSubmit,
      pinLabel,
      selectedCategoryId,
    ]
  );

  if (!open) {
    return null;
  }

  return (
    <AppFormModal
      showCancel
      isOpen={open}
      isSubmitting={isSubmitting}
      maxHeight="calc(100dvh - 1rem)"
      submitDisabled={!canSubmit || !onSubmit}
      submitLabel={isSubmitting ? "Creating..." : "Create"}
      title="Add Pin"
      width={740}
      onClose={handleClose}
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-4">
        <Input
          disabled={disabled || isSubmitting}
          label="Pin label"
          placeholder="e.g. Water Source, Main Valve"
          value={pinLabel}
          onChange={(event) => setPinLabel(event.target.value)}
        />

        <div className="space-y-2">
          <p className="text-text-primary text-sm font-medium">Color</p>
          {isLoading ? (
            <p className="text-text-muted text-sm">Loading categories...</p>
          ) : categories.length === 0 ? (
            <p className="text-text-muted text-sm">
              No pin categories yet. Create one in Manage Categories before
              adding pins.
            </p>
          ) : (
            <MapPinCategoryPills
              categories={categories}
              disabled={disabled || isSubmitting}
              value={selectedCategoryId}
              onChange={setSelectedCategoryId}
            />
          )}
        </div>

        <div className="space-y-3">
          <p className="text-text-primary text-sm font-medium">Pin location</p>
          <TabsSwitcher
            className={cn(isMobile && "w-full")}
            fullWidth={isMobile}
            items={placementTabs}
            size={ComponentSizeEnum.SM}
            value={placementMode}
            onChange={setPlacementMode}
          />

          {placementMode === "map" ? (
            <div className="space-y-2">
              <p className="text-text-muted text-xs">
                Click anywhere on the map to place or move the pin.
              </p>
              <DeckPointPickerMap
                defaultCenter={mapDefaultCenter}
                lat={coordinates?.lat}
                layerContext={mapLayerContext}
                lng={coordinates?.lng}
                mapHeight={mapHeight}
                placementPinColor={placementPinColor}
                showMyLocationButton={false}
                onChange={handleMapCoordinateChange}
              />
            </div>
          ) : null}

          {placementMode === "current" ? (
            <div className="space-y-3">
              <Button
                disabled={disabled || isSubmitting}
                leftIcon={<Navigation aria-hidden className="h-4 w-4" />}
                title="Use Current Location"
                variant={ButtonVariantEnum.SURFACE}
                onClick={handleUseCurrentLocation}
              />
              <MapPinCoordinatesPreview
                lat={coordinates?.lat}
                lng={coordinates?.lng}
              />
            </div>
          ) : null}

          {placementMode === "manual" ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  disabled={disabled || isSubmitting}
                  label="Latitude"
                  placeholder="27.07793"
                  value={latitudeInput}
                  onChange={(event) => handleLatitudeChange(event.target.value)}
                />
                <Input
                  disabled={disabled || isSubmitting}
                  label="Longitude"
                  placeholder="-81.897308"
                  value={longitudeInput}
                  onChange={(event) =>
                    handleLongitudeChange(event.target.value)
                  }
                />
              </div>
              <MapPinCoordinatesPreview
                lat={coordinates?.lat}
                lng={coordinates?.lng}
              />
            </div>
          ) : null}

          {coordinateError ? (
            <p className="text-feedback-error text-xs">{coordinateError}</p>
          ) : null}
        </div>
      </div>
    </AppFormModal>
  );
}
