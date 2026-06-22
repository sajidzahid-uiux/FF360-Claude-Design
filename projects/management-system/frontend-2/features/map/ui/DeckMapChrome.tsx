"use client";

import { useEffect, useRef, useState } from "react";

import { Button, ButtonVariantEnum, Input } from "@fieldflow360/org-ui";
import {
  ArrowRight,
  ExternalLink,
  MapPin,
  SquarePen,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";

import { toMapPlacePredictions } from "@/features/map/lib";
import { useShortenGoogleUrl } from "@/hooks";

import type { LatLng, MapPlacePrediction } from "../model/types";

function isGoogleMapsLink(text: string): boolean {
  return (
    text.startsWith("http") &&
    (text.includes("google.com/maps") ||
      text.includes("goo.gl") ||
      text.includes("maps.app.goo.gl"))
  );
}

export interface DeckMapChromeProps {
  readOnly?: boolean;
  hideSearch?: boolean;
  hideActionMenu?: boolean;
  mapRef: React.RefObject<google.maps.Map | null>;
  verticesCount: number;
  hasLocation: boolean;
  isCustomPolygonMode: boolean;
  isMarkerMode: boolean;
  onChangeLocation: (location: LatLng) => void;
  onStartPolygon: () => void;
  onStartMarker: () => void;
  onClear: () => void;
}

export function DeckMapChrome({
  readOnly = false,
  hideSearch = false,
  hideActionMenu = false,
  mapRef,
  verticesCount,
  hasLocation,
  isCustomPolygonMode,
  isMarkerMode,
  onChangeLocation,
  onStartPolygon,
  onStartMarker,
  onClear,
}: DeckMapChromeProps) {
  const { expandGoogleUrl } = useShortenGoogleUrl();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [googleMapLink, setGoogleMapLink] = useState("");
  const [predictions, setPredictions] = useState<MapPlacePrediction[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!window.google?.maps?.places) return;
    if (!googleMapLink.trim() || googleMapLink.startsWith("http")) {
      setPredictions([]);
      return;
    }
    const autocompleteService =
      new window.google.maps.places.AutocompleteService();
    autocompleteService.getPlacePredictions(
      { input: googleMapLink },
      (preds: google.maps.places.AutocompletePrediction[] | null) => {
        setPredictions(toMapPlacePredictions(preds));
      }
    );
  }, [googleMapLink]);

  const handlePredictionClick = (prediction: MapPlacePrediction) => {
    setGoogleMapLink(prediction.description);
    setPredictions([]);
    setShowDropdown(false);
    if (!window.google?.maps?.places || !mapRef.current) return;
    const service = new window.google.maps.places.PlacesService(mapRef.current);
    service.getDetails(
      { placeId: prediction.place_id },
      (
        place: google.maps.places.PlaceResult | null,
        status: google.maps.places.PlacesServiceStatus
      ) => {
        if (
          status === google.maps.places.PlacesServiceStatus.OK &&
          place?.geometry?.location
        ) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          onChangeLocation({ lat, lng });
          mapRef.current?.panTo({ lat, lng });
        } else {
          toast.error("Could not get location details for the selected place.");
        }
      }
    );
  };

  const handleGoogleMapLink = async () => {
    try {
      let expandedUrl = googleMapLink;
      if (
        googleMapLink.includes("goo.gl") ||
        googleMapLink.includes("maps.app.goo.gl")
      ) {
        expandedUrl = await expandGoogleUrl
          .mutateAsync(googleMapLink)
          .then((data) => data.full_url || data.expanded_url || googleMapLink);
      }

      let lat: number | undefined;
      let lng: number | undefined;

      if (expandedUrl.includes("/search/")) {
        const coordsPart = expandedUrl.split("/search/")[1].split("?")[0];
        const coords = coordsPart.replace(/\s/g, "").split(",");
        if (coords.length >= 2) {
          lat = parseFloat(coords[0]);
          lng = parseFloat(coords[1].replace(/^\+/, ""));
        }
      } else if (expandedUrl.includes("@")) {
        const coordsPart = expandedUrl.split("@")[1].split(",");
        if (coordsPart.length >= 2) {
          lat = parseFloat(coordsPart[0].trim());
          lng = parseFloat(coordsPart[1].trim());
        }
      }

      if (
        lat !== undefined &&
        lng !== undefined &&
        !isNaN(lat) &&
        !isNaN(lng)
      ) {
        onChangeLocation({ lat, lng });
        mapRef.current?.panTo({ lat, lng });
      } else if (googleMapLink.trim() && window.google?.maps?.Geocoder) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode(
          { address: googleMapLink },
          (
            results: google.maps.GeocoderResult[] | null,
            status: google.maps.GeocoderStatus
          ) => {
            if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
              const loc = results[0].geometry.location;
              const newLat = loc.lat();
              const newLng = loc.lng();
              onChangeLocation({ lat: newLat, lng: newLng });
              mapRef.current?.panTo({ lat: newLat, lng: newLng });
            } else {
              toast.error("Could not find location for the given place.");
            }
          }
        );
      } else {
        toast.error("Invalid Google Maps link or place name.");
      }
    } catch {
      toast.error("Failed to process the link.");
    }
  };

  return (
    <>
      {!hideSearch && (
        <div className="relative mb-4 flex w-full items-center gap-2">
          <Input
            ref={inputRef}
            autoComplete="off"
            placeholder="Search / Paste Location Link"
            type="text"
            value={googleMapLink}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            onChange={(event) => {
              setGoogleMapLink(event.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
          />
          <Button
            iconOnly
            aria-label="Go to location"
            disabled={
              !isGoogleMapsLink(googleMapLink) && googleMapLink.trim() !== ""
            }
            leftIcon={<ArrowRight aria-hidden className="h-5 w-5" />}
            onClick={handleGoogleMapLink}
          />
          {showDropdown && predictions.length > 0 ? (
            <div className="border-border-subtle bg-bg-surface-elevated absolute top-full left-0 z-10 max-h-60 w-full overflow-y-auto rounded border shadow-md">
              {predictions.map((pred) => (
                <button
                  key={pred.place_id}
                  className="text-text-primary hover:bg-bg-hover w-full cursor-pointer px-4 py-2 text-left text-sm"
                  type="button"
                  onMouseDown={() => handlePredictionClick(pred)}
                >
                  {pred.description}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      )}

      {!readOnly && (
        <div className="mb-4 flex flex-wrap gap-2">
          {!hideActionMenu && (
            <Button
              leftIcon={<SquarePen aria-hidden className="h-3 w-3" />}
              title={`Draw Polygon${isCustomPolygonMode ? " ✓" : ""}`}
              variant={
                isCustomPolygonMode
                  ? ButtonVariantEnum.ACCENT
                  : ButtonVariantEnum.SURFACE
              }
              onClick={onStartPolygon}
            />
          )}
          <Button
            leftIcon={<MapPin aria-hidden className="h-3 w-3" />}
            title={`Place Marker${isMarkerMode ? " ✓" : ""}`}
            variant={
              isMarkerMode
                ? ButtonVariantEnum.ACCENT
                : ButtonVariantEnum.SURFACE
            }
            onClick={onStartMarker}
          />
          {!hideActionMenu && (
            <Button
              aria-label="Clear"
              disabled={verticesCount === 0 && !hasLocation}
              title="Clear"
              variant={ButtonVariantEnum.SURFACE}
              onClick={onClear}
            />
          )}
        </div>
      )}
    </>
  );
}

export function DeckMapFloatingControls({
  readOnly,
  verticesCount,
  onUndo,
  openInMapsLocation,
}: {
  readOnly?: boolean;
  verticesCount: number;
  onUndo: () => void;
  openInMapsLocation?: LatLng;
}) {
  return (
    <div className="absolute top-2 right-2 z-[1] flex gap-1">
      {!readOnly && (
        <Button
          iconOnly
          aria-label={`Undo last vertex (${verticesCount} vertices)`}
          disabled={verticesCount === 0}
          leftIcon={<Undo2 aria-hidden className="h-4 w-4" />}
          variant={ButtonVariantEnum.GHOST}
          onClick={onUndo}
        />
      )}
      {openInMapsLocation ? (
        <Button
          iconOnly
          aria-label="Open in Google Maps"
          leftIcon={<ExternalLink aria-hidden className="h-4 w-4" />}
          variant={ButtonVariantEnum.GHOST}
          onClick={() => {
            const url = `https://www.google.com/maps?q=${openInMapsLocation.lat},${openInMapsLocation.lng}`;
            window.open(url, "_blank");
          }}
        />
      ) : null}
    </div>
  );
}
