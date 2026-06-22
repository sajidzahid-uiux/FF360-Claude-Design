"use client";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
} from "@fieldflow360/org-ui";
import { MapPin, Navigation } from "lucide-react";

import type {
  DeliveryLocation,
  VendorFormJobKmlMap,
  VendorFormJobShpMap,
  VendorFormJobXmlMap,
} from "@/api/types";
import type { BoundaryMapRef } from "@/shared/ui/common/map";

export interface MapGoToButtonsProps {
  boundaryMapRef: React.RefObject<BoundaryMapRef | null>;
  xmlmap?: VendorFormJobXmlMap | null;
  shpmap?: VendorFormJobShpMap | null;
  kmlmap?: VendorFormJobKmlMap | null;
  /** When set, shows a "My Location" button that centers the map on user location. */
  userLocationAvailable?: boolean;
  /** Delivery locations (e.g. from step 3) - each gets a "Go to Location N" button. */
  deliveryLocations?: DeliveryLocation[];
}

/**
 * Buttons placed above BoundaryMap to center the map on XML, SHP, KML, or user location.
 * Renders only buttons for which map data is present (or My Location when userLocationAvailable is passed).
 */
export function MapGoToButtons({
  boundaryMapRef,
  xmlmap,
  shpmap,
  kmlmap,
  userLocationAvailable,
  deliveryLocations = [],
}: MapGoToButtonsProps) {
  const hasMapData = xmlmap || shpmap || kmlmap;
  const showMyLocation = userLocationAvailable !== undefined;
  const hasDeliveryLocations = deliveryLocations.length > 0;
  if (!hasMapData && !showMyLocation && !hasDeliveryLocations) return null;

  return (
    <div className="mb-2 flex flex-wrap items-center gap-2">
      {showMyLocation && (
        <Button
          disabled={!userLocationAvailable}
          leftIcon={<Navigation className="h-3 w-3" />}
          size={ComponentSizeEnum.SM}
          title={
            userLocationAvailable ? "My Location" : "Location not available"
          }
          variant={ButtonVariantEnum.SURFACE}
          onClick={() => {
            if (boundaryMapRef?.current) {
              boundaryMapRef.current.centerOnUserLocation();
            }
          }}
        />
      )}
      {xmlmap && (
        <Button
          leftIcon={<MapPin className="h-3 w-3" />}
          size={ComponentSizeEnum.SM}
          title="Go to XML"
          variant={ButtonVariantEnum.SURFACE}
          onClick={() => {
            if (boundaryMapRef.current && xmlmap) {
              boundaryMapRef.current.centerOnXmlMap(
                xmlmap as Parameters<BoundaryMapRef["centerOnXmlMap"]>[0]
              );
            }
          }}
        />
      )}
      {shpmap && (
        <Button
          leftIcon={<MapPin className="h-3 w-3" />}
          size={ComponentSizeEnum.SM}
          title="Go to Shape"
          variant={ButtonVariantEnum.SURFACE}
          onClick={() => {
            if (boundaryMapRef.current && shpmap) {
              boundaryMapRef.current.centerOnShpMap(
                shpmap as Parameters<BoundaryMapRef["centerOnShpMap"]>[0]
              );
            }
          }}
        />
      )}
      {kmlmap && (
        <Button
          leftIcon={<MapPin className="h-3 w-3" />}
          size={ComponentSizeEnum.SM}
          title="Go to KML"
          variant={ButtonVariantEnum.SURFACE}
          onClick={() => {
            if (boundaryMapRef.current && kmlmap) {
              boundaryMapRef.current.centerOnKmlMap(
                kmlmap as Parameters<BoundaryMapRef["centerOnKmlMap"]>[0]
              );
            }
          }}
        />
      )}
      {deliveryLocations.map((loc) => (
        <Button
          key={loc.id}
          leftIcon={<MapPin className="h-3 w-3" />}
          size={ComponentSizeEnum.SM}
          title={`Go to Location ${loc.sequence}`}
          variant={ButtonVariantEnum.SURFACE}
          onClick={() => {
            if (boundaryMapRef.current?.centerOnLocation) {
              boundaryMapRef.current.centerOnLocation(loc.lat, loc.lng);
            }
          }}
        />
      ))}
    </div>
  );
}
