"use client";

import { useEffect, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  Input,
  cn,
} from "@fieldflow360/org-ui";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { useShortenGoogleUrl } from "@/hooks";
import type {
  GooglePlacePrediction,
  GooglePlaceResult,
  GooglePlacesServiceStatus,
} from "@/shared/lib";

import type { MapLocation } from "../model/types";

interface MapSearchProps {
  searchLink: string;
  onSearchLinkChange: (value: string) => void;
  mapRef: React.MutableRefObject<google.maps.Map | null>;
  onPositionChange: (position: MapLocation) => void;
  overlay?: boolean;
  locationError?: string | null;
  className?: string;
}

export const MapSearch = ({
  searchLink,
  onSearchLinkChange,
  mapRef,
  onPositionChange,
  overlay = false,
  locationError,
  className,
}: MapSearchProps) => {
  const [predictions, setPredictions] = useState<GooglePlacePrediction[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const { expandGoogleUrl } = useShortenGoogleUrl();

  useEffect(() => {
    if (!window.google?.maps?.places) return;
    if (!searchLink.trim() || searchLink.startsWith("http")) {
      setPredictions([]);
      return;
    }
    const autocompleteService =
      new window.google.maps.places.AutocompleteService();
    autocompleteService.getPlacePredictions(
      { input: searchLink },
      (preds: GooglePlacePrediction[] | null) => {
        setPredictions(
          preds
            ? preds.map((p) => ({
                description: p.description,
                place_id: p.place_id,
              }))
            : []
        );
      }
    );
  }, [searchLink]);

  const isLink = (text: string) => {
    return (
      text.includes("goo.gl") ||
      text.includes("maps.app.goo.gl") ||
      text.includes("/search/") ||
      text.includes("@") ||
      text.includes("/place/")
    );
  };

  const handlePredictionClick = (prediction: GooglePlacePrediction) => {
    onSearchLinkChange(prediction.description);
    setPredictions([]);
    setShowDropdown(false);

    if (!window.google?.maps?.places || !mapRef.current) return;

    const service = new window.google.maps.places.PlacesService(mapRef.current);
    service.getDetails(
      { placeId: prediction.place_id },
      (place: GooglePlaceResult | null, status: GooglePlacesServiceStatus) => {
        if (status === "OK" && place?.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          onPositionChange({ lat, lng });
          mapRef.current?.panTo({ lat, lng });
          mapRef.current?.setZoom(15);
          toast.success("Location found and centered on map");
        } else {
          toast.error("Could not get location details for the selected place.");
        }
      }
    );
  };

  const handleSearchLink = async () => {
    try {
      if (isLink(searchLink)) {
        let expandedUrl = searchLink;
        if (
          searchLink.includes("goo.gl") ||
          searchLink.includes("maps.app.goo.gl")
        ) {
          expandedUrl = await expandGoogleUrl
            .mutateAsync(searchLink)
            .then((data) => data.full_url || data.expanded_url || searchLink);
        }

        let lat: number | undefined;
        let lng: number | undefined;

        if (expandedUrl.includes("/search/")) {
          const coordsPart = expandedUrl.split("/search/")[1].split("?")[0];
          const coords = coordsPart.replace(/\s/g, "").split(",");
          if (coords?.length >= 2) {
            lat = parseFloat(coords[0]);
            lng = parseFloat(coords[1].replace(/^\+/, ""));
          }
        } else if (expandedUrl.includes("@")) {
          const coordsPart = expandedUrl.split("@")[1].split(",");
          if (coordsPart?.length >= 2) {
            lat = parseFloat(coordsPart[0].trim());
            lng = parseFloat(coordsPart[1].trim());
          }
        } else if (expandedUrl.includes("/place/")) {
          const atIndex = expandedUrl.indexOf("@");
          if (atIndex !== -1) {
            const coordsPart = expandedUrl.substring(atIndex + 1).split(",");
            if (coordsPart?.length >= 2) {
              lat = parseFloat(coordsPart[0].trim());
              lng = parseFloat(coordsPart[1].trim());
            }
          }
        }

        if (
          lat !== undefined &&
          lng !== undefined &&
          !isNaN(lat) &&
          !isNaN(lng)
        ) {
          onPositionChange({ lat, lng });
          mapRef.current?.panTo({ lat, lng });
          mapRef.current?.setZoom(15);
          toast.success("Location found and centered on map");
        } else {
          toast.error(
            "Invalid Google Maps link. Please ensure the URL contains location coordinates."
          );
        }
      } else if (window.google?.maps?.places && mapRef.current) {
        const service = new window.google.maps.places.PlacesService(
          mapRef.current
        );
        service.textSearch(
          { query: searchLink },
          (
            results: GooglePlaceResult[] | null,
            status: GooglePlacesServiceStatus
          ) => {
            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              results?.[0]?.geometry?.location
            ) {
              const place = results[0];
              const lat = place.geometry!.location!.lat();
              const lng = place.geometry!.location!.lng();
              onPositionChange({ lat, lng });
              mapRef.current?.panTo({ lat, lng });
              mapRef.current?.setZoom(15);
              toast.success(`Found: ${place.name || searchLink}`);
            } else {
              toast.error(
                "Location not found. Please try a different search term."
              );
            }
          }
        );
      } else {
        toast.error("Google Maps search service not available.");
      }
    } catch {
      toast.error("Failed to process the search. Please try again.");
    }
  };

  return (
    <div
      className={cn(
        "relative w-full",
        overlay &&
          "border-border-subtle/80 bg-bg-surface-elevated/95 rounded-lg border p-1.5 shadow-lg backdrop-blur-sm",
        className
      )}
    >
      <div className="flex w-full items-center gap-1.5">
        <Input
          autoComplete="off"
          className="min-w-0 flex-1"
          placeholder="Search locations or paste Google Maps link"
          size={ComponentSizeEnum.SM}
          value={searchLink}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          onChange={(event) => {
            onSearchLinkChange(event.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && searchLink.trim() !== "") {
              void handleSearchLink();
              setShowDropdown(false);
            }
          }}
        />
        <Button
          iconOnly
          aria-label="Search location"
          disabled={searchLink.trim() === ""}
          leftIcon={<ArrowRight className="h-4 w-4" />}
          size={ComponentSizeEnum.SM}
          variant={ButtonVariantEnum.ACCENT}
          onClick={() => void handleSearchLink()}
        />
      </div>

      {locationError ? (
        <p className="text-feedback-error mt-1.5 px-0.5 text-xs leading-snug">
          {locationError}
        </p>
      ) : null}

      {showDropdown && predictions.length > 0 ? (
        <div className="border-border-subtle bg-bg-surface-elevated absolute top-full right-0 left-0 z-20 mt-1 max-h-60 overflow-y-auto rounded-md border shadow-md">
          {predictions.map((pred) => (
            <button
              key={pred.place_id}
              className="text-text-primary hover:bg-bg-hover w-full cursor-pointer px-3 py-2 text-left text-sm"
              type="button"
              onMouseDown={() => handlePredictionClick(pred)}
            >
              {pred.description}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};
