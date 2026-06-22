"use client";

import { RefObject } from "react";

import { Button, ButtonVariantEnum } from "@fieldflow360/org-ui";
import { Building2, Navigation } from "lucide-react";

import { BoundaryMapRef } from "./BoundaryMap";

type MapRef = BoundaryMapRef;

interface CenterOnLocationProps {
  boundaryMapRef: RefObject<MapRef | null>;
  userLocationAvailable: boolean;
  organizationLocationAvailable: boolean;
  showUserLocationButton?: boolean;
  showOrgLocationButton?: boolean;
  className?: string;
}

export function CenterOnLocation({
  boundaryMapRef,
  userLocationAvailable,
  organizationLocationAvailable,
  showUserLocationButton = true,
  showOrgLocationButton = true,
  className = "",
}: CenterOnLocationProps) {
  const handleCenterUser = () => {
    boundaryMapRef?.current?.centerOnUserLocation();
  };

  const handleCenterOrganization = () => {
    boundaryMapRef?.current?.centerOnOrganizationLocation();
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {showUserLocationButton ? (
        <Button
          disabled={!userLocationAvailable}
          leftIcon={<Navigation aria-hidden className="h-3.5 w-3.5" />}
          title="My location"
          variant={ButtonVariantEnum.SURFACE}
          onClick={handleCenterUser}
        />
      ) : null}
      {showOrgLocationButton ? (
        <Button
          disabled={!organizationLocationAvailable}
          leftIcon={<Building2 aria-hidden className="h-3.5 w-3.5" />}
          title="Org location"
          variant={ButtonVariantEnum.SURFACE}
          onClick={handleCenterOrganization}
        />
      ) : null}
    </div>
  );
}
