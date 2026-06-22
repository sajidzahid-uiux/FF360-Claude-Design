"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { DISTANCE_UNITS, GEOLOCATION_OPTIONS } from "@/constants";
import { VendorCard } from "@/features/order-pipe/favorites/components/VendorCard";
import { useRouteIds, useUnitSystem } from "@/hooks";
import {
  useOrderPipePermissions,
  useSettingsPermissions,
} from "@/hooks/permissions";
import { useFavoriteVendors } from "@/hooks/queries";
import { distanceBetween } from "@/lib/geo";
import { orgPath } from "@/shared/config/routes";

import { useVendorContext } from "../../context/VendorContext";

export function FavoriteVendorList() {
  const router = useRouter();
  const { orgId } = useRouteIds();
  const {
    canRead: canReadSettings,
    canAdd: canWriteSettings,
    canDelete: canDeleteSettings,
  } = useSettingsPermissions();
  const {
    canRead: canReadOrderPipe,
    canWrite,
    canDelete: canDeleteOrderPipe,
  } = useOrderPipePermissions();
  const hasFullOrderPipePermission =
    canReadOrderPipe && canWrite && canDeleteOrderPipe;
  const hasFullSettingsPermission =
    canReadSettings && canWriteSettings && canDeleteSettings;
  const canGoToFavoritesPage =
    hasFullOrderPipePermission && hasFullSettingsPermission;
  const { selectedVendor, setSelectedVendor } = useVendorContext();
  const { favoriteVendors, isLoading } = useFavoriteVendors();
  const unitSystem = useUnitSystem();
  const distanceLabel = DISTANCE_UNITS.LONG[unitSystem];
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => {},
      GEOLOCATION_OPTIONS
    );
  }, []);

  const goToFavoritesPage = () => {
    if (orgId) router.push(orgPath(orgId, `/favorites`));
  };

  const handleCardClick = (vendor: (typeof favoriteVendors)[0]) => {
    if (!canWrite) return;
    setSelectedVendor(vendor);
  };

  const getMilesText = (vendor: (typeof favoriteVendors)[0]) => {
    const hasLocation =
      vendor.lat != null &&
      vendor.long != null &&
      Number.isFinite(Number(vendor.lat)) &&
      Number.isFinite(Number(vendor.long));
    if (!hasLocation) return "Has no specified location";
    if (userLocation == null) return `— ${distanceLabel} away from you`;
    return `${Number(distanceBetween(userLocation.lat, userLocation.lng, Number(vendor.lat), Number(vendor.long), unitSystem)).toFixed(1)} ${distanceLabel} away from you`;
  };

  return (
    <div className="border-border-subtle bg-bg-surface-elevated flex h-full flex-col rounded-lg border p-4 shadow-sm lg:p-6">
      <div className="mb-4 flex-shrink-0">
        {canGoToFavoritesPage ? (
          <button
            className="focus:ring-accent rounded text-left focus:ring-2 focus:ring-offset-2 focus:outline-none"
            type="button"
            onClick={goToFavoritesPage}
          >
            <h2 className="text-2xl leading-none font-semibold tracking-tight hover:underline lg:text-[30px]">
              Favorite Vendors
            </h2>
          </button>
        ) : (
          <h2 className="text-2xl leading-none font-semibold tracking-tight lg:text-[30px]">
            Favorite Vendors
          </h2>
        )}
        <p className="text-text-muted mt-2 text-sm leading-5 lg:text-lg">
          Select your favorite vendor
        </p>

        {canGoToFavoritesPage && (
          <button
            className="text-accent mt-3 flex items-center gap-2 text-sm font-medium hover:underline"
            type="button"
            onClick={goToFavoritesPage}
          >
            Manage favorite vendors
          </button>
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden">
        {isLoading ? (
          <p className="text-text-muted flex flex-1 items-center justify-center text-sm">
            Loading vendors...
          </p>
        ) : favoriteVendors.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2">
            <p className="text-text-muted text-sm">No favorite vendors yet</p>
            {canGoToFavoritesPage && (
              <button
                className="text-accent text-sm font-medium hover:underline"
                type="button"
                onClick={goToFavoritesPage}
              >
                Add favorites
              </button>
            )}
          </div>
        ) : (
          favoriteVendors.map((vendor) => (
            <VendorCard
              key={vendor.id}
              disabled={!canWrite}
              name={`${vendor.name} - ${vendor.provider.name}`}
              selected={selectedVendor?.id === vendor.id}
              subtitle={
                vendor.phone_number
                  ? `${vendor.phone_number} • ${getMilesText(vendor)}`
                  : getMilesText(vendor)
              }
              onClick={() => handleCardClick(vendor)}
              onDoubleClick={
                canGoToFavoritesPage ? goToFavoritesPage : undefined
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
