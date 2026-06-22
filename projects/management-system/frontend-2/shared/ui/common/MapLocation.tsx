"use client";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
} from "@fieldflow360/org-ui";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { useOrganizationData, useShortenGoogleUrl } from "@/hooks";
import type {
  GoogleGeocodeResult,
  GooglePlacePrediction,
  GooglePlaceResult,
  GooglePlacesServiceStatus,
} from "@/shared/lib";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  SanitizedInput,
} from "@/shared/ui/primitives";

interface MapLocationProps {
  className?: string;
  lat?: number;
  lng?: number;
  onChange?: (lat: number, lng: number) => void;
  editable?: boolean;
  noShadow?: boolean;
  noPadding?: boolean;
  height?: string;
  width?: string;
  autoSave?: boolean; // New prop for auto-save mode
}

type Prediction = GooglePlacePrediction;

const defaultCenter = {
  lat: 64.8401, // Centered on Alaska
  lng: -147.72,
};

const getMapContainerStyle = (width: string, height: string) => ({
  width,
  height,
});

export default function MapLocation({
  className,
  lat,
  lng,
  onChange,
  noShadow = false,
  noPadding = false,
  height = "400px",
  width = "100%",
  autoSave = false,
}: MapLocationProps) {
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
    lat && lng ? { lat, lng } : null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [originalMarker, setOriginalMarker] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [googleMapLink, setGoogleMapLink] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { expandGoogleUrl } = useShortenGoogleUrl();
  const { patchOrganization } = useOrganizationData();

  // Update marker if lat/lng props change (when not editing)
  useEffect(() => {
    if (!isEditing && lat !== undefined && lng !== undefined) {
      setMarker({ lat, lng });
    }
  }, [lat, lng, isEditing]);

  // Autocomplete logic
  useEffect(() => {
    if (!window.google || !window.google.maps || !window.google.maps.places)
      return;
    if (!googleMapLink.trim() || googleMapLink.startsWith("http")) {
      setPredictions([]);
      return;
    }
    const autocompleteService =
      new window.google.maps.places.AutocompleteService();
    autocompleteService.getPlacePredictions(
      { input: googleMapLink },
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
  }, [googleMapLink]);

  const handlePredictionClick = (prediction: Prediction) => {
    setGoogleMapLink(prediction.description);
    setPredictions([]);
    setShowDropdown(false);
    // Get place details
    if (
      window.google &&
      window.google.maps &&
      window.google.maps.places &&
      mapRef.current
    ) {
      const service = new window.google.maps.places.PlacesService(
        mapRef.current
      );
      service.getDetails(
        { placeId: prediction.place_id },
        (
          place: GooglePlaceResult | null,
          status: GooglePlacesServiceStatus
        ) => {
          if (
            status === "OK" &&
            place &&
            place.geometry &&
            place.geometry.location
          ) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            setMarker({ lat, lng });
            onChange?.(lat, lng);
            mapRef.current?.panTo({ lat, lng });
          } else {
            toast.error(
              "Could not get location details for the selected place."
            );
          }
        }
      );
    }
  };

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!isEditing && !autoSave) return;
      if (!e.latLng) return;
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();
      setMarker({ lat: newLat, lng: newLng });

      // Auto-save mode: immediately call onChange
      if (autoSave) {
        onChange?.(newLat, newLng);
      }
    },
    [isEditing, autoSave, onChange]
  );

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

      let lat, lng;

      // Handle /search/lat,lng and @lat,lng formats
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
      } else if (expandedUrl.includes("/place/")) {
        const atIndex = expandedUrl.indexOf("@");
        if (atIndex !== -1) {
          const coordsPart = expandedUrl.substring(atIndex + 1).split(",");
          if (coordsPart.length >= 2) {
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
        setMarker({ lat, lng });
        onChange?.(lat, lng);
        if (mapRef.current) {
          mapRef.current.panTo({ lat, lng });
        }
      } else if (googleMapLink.trim() !== "") {
        // Try geocoding the input as a place name/address
        if (
          window.google &&
          window.google.maps &&
          window.google.maps.Geocoder
        ) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode(
            { address: googleMapLink },
            (
              results: GoogleGeocodeResult[] | null,
              status: GooglePlacesServiceStatus
            ) => {
              if (status === "OK" && results && results[0]) {
                const location = results[0].geometry.location;
                const lat = location.lat();
                const lng = location.lng();
                setMarker({ lat, lng });
                onChange?.(lat, lng);
                if (mapRef.current) {
                  mapRef.current.panTo({ lat, lng });
                }
              } else {
                toast.error(
                  "Could not find location for the given place name or address."
                );
              }
            }
          );
        } else {
          toast.error("Google Maps API is not loaded.");
        }
        return;
      } else {
        toast.error(
          "Invalid Google Maps link. Please ensure the URL contains location coordinates."
        );
      }
    } catch (error) {
      console.error("Error processing Google Maps link:", error);
      toast.error("Failed to process the link. Please check the URL.");
    }
  };

  const handleEdit = () => {
    setOriginalMarker(marker);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setMarker(originalMarker);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (marker) {
      // Patch location to API
      const formData = new FormData();
      formData.append("latitude", marker.lat.toString());
      formData.append("longitude", marker.lng.toString());
      await patchOrganization.mutateAsync(formData);
      onChange?.(marker.lat, marker.lng);
    }
    setIsEditing(false);
  };

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  return (
    <div className={`my-4 flex flex-col ${className}`}>
      <Card
        className={`flex h-full flex-col justify-between ${
          noShadow ? "border-none shadow-none" : ""
        }`}
      >
        <CardHeader className={`${noPadding ? "p-4" : ""}`}>
          <div className="mb-2 flex w-full items-center justify-between gap-2">
            <h2 className="text-text-primary text-3xl leading-7 font-semibold">
              <CardTitle>Location</CardTitle>
            </h2>
            {!autoSave && (
              <div className="flex gap-2">
                {!isEditing && (
                  <Button aria-label="Edit" title="Edit" onClick={handleEdit} />
                )}
                {isEditing && (
                  <Button
                    aria-label="Cancel"
                    title="Cancel"
                    variant={ButtonVariantEnum.SURFACE}
                    onClick={handleCancel}
                  />
                )}
                {isEditing && (
                  <Button
                    aria-label="Save Changes"
                    title="Save Changes"
                    onClick={handleSave}
                  />
                )}
              </div>
            )}
          </div>
          <p>Manage your organization&apos;s details and location</p>
        </CardHeader>
        <CardContent>
          {(isEditing || autoSave) && (
            <div className="relative mb-4 flex w-full items-center gap-2">
              <SanitizedInput
                ref={inputRef}
                autoComplete="off"
                className="h-12 w-full rounded border px-3"
                placeholder="Search / Paste Location Link"
                type="text"
                value={googleMapLink}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                onChange={(e) => {
                  setGoogleMapLink(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
              />
              <Button
                iconOnly
                aria-label="Go to location"
                leftIcon={<ArrowRight className="h-5 w-5" />}
                size={ComponentSizeEnum.LG}
                onClick={handleGoogleMapLink}
              />
              {showDropdown && predictions.length > 0 && (
                <div className="absolute top-full left-0 z-10 max-h-60 w-full overflow-y-auto rounded border border-gray-200 bg-white shadow-md">
                  {predictions.map((pred) => (
                    <div
                      key={pred.place_id}
                      className="cursor-pointer px-4 py-2 text-black hover:bg-gray-100"
                      onMouseDown={() => handlePredictionClick(pred)}
                    >
                      {pred.description}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <GoogleMap
            center={marker || defaultCenter}
            mapContainerStyle={getMapContainerStyle(width, height)}
            options={{
              mapTypeId: "hybrid", // Same as BoundaryMap - shows satellite with street names
              streetViewControl: false,
              mapTypeControl: false, // Same as BoundaryMap
              fullscreenControl: false,
              zoomControl: true,
            }}
            zoom={marker ? 15 : 8}
            onClick={handleMapClick}
            onLoad={onMapLoad}
          >
            {marker && <Marker position={marker} />}
          </GoogleMap>
        </CardContent>
      </Card>
    </div>
  );
}
