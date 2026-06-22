"use client";

import { Button, ButtonVariantEnum, Dropdown } from "@fieldflow360/org-ui";
import { Crosshair } from "lucide-react";

import type { FarmSelectorItem } from "../model/types";

export type { FarmSelectorItem };

interface FarmSelectorButtonProps {
  farms: FarmSelectorItem[];
  mapRef: React.RefObject<google.maps.Map | null>;
}

function focusFarm(farm: FarmSelectorItem, map: google.maps.Map) {
  if (farm.vertices && farm.vertices.length >= 3) {
    const bounds = new google.maps.LatLngBounds();
    farm.vertices.forEach((v) => bounds.extend(v));
    map.fitBounds(bounds, 40);
  } else {
    map.panTo({ lat: farm.lat, lng: farm.lng });
    map.setZoom(15);
  }
}

const triggerClassName = "absolute top-2 left-2 z-10 shadow-md";

function FarmFocusTrigger({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      iconOnly
      aria-label={label}
      className={triggerClassName}
      leftIcon={<Crosshair aria-hidden className="h-4 w-4" />}
      variant={ButtonVariantEnum.ACCENT}
      onClick={onClick}
    />
  );
}

export function FarmSelectorButton({ farms, mapRef }: FarmSelectorButtonProps) {
  if (farms.length === 0) return null;

  if (farms.length === 1) {
    return (
      <FarmFocusTrigger
        label={`Focus on ${farms[0].name}`}
        onClick={() => {
          if (mapRef.current) focusFarm(farms[0], mapRef.current);
        }}
      />
    );
  }

  return (
    <Dropdown
      className={triggerClassName}
      fullWidth={false}
      menuMinWidth={208}
      options={farms.map((farm) => ({
        value: String(farm.id),
        label: farm.name,
        icon: (
          <span
            aria-hidden
            className={`h-3 w-3 shrink-0 rounded-full ${
              farm.isPrimary ? "bg-feedback-error" : "bg-text-accent"
            }`}
          />
        ),
      }))}
      placeholder="Select farm"
      trigger={
        <Button
          iconOnly
          aria-label="Select farm to focus"
          leftIcon={<Crosshair aria-hidden className="h-4 w-4" />}
          variant={ButtonVariantEnum.ACCENT}
        />
      }
      onChange={(farmId) => {
        const farm = farms.find((item) => String(item.id) === farmId);
        if (farm && mapRef.current) {
          focusFarm(farm, mapRef.current);
        }
      }}
    />
  );
}
