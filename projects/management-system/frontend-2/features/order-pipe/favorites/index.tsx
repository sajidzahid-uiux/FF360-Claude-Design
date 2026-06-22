"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button, ComponentSizeEnum, Input } from "@fieldflow360/org-ui";
import { ArrowRight, Search } from "lucide-react";
import { toast } from "sonner";

import { GEOLOCATION_OPTIONS } from "@/constants";
import {
  VendorInfoDialog,
  VendorLegend,
} from "@/features/order-pipe/components";
import { OrderPipeDeckMap } from "@/features/order-pipe/order-pipe-wizard/components/OrderPipeDeckMap";
import { getStateCentroid } from "@/features/order-pipe/utils/stateCentroids";
import { useDialogManager } from "@/hooks";
import { useFavoriteVendorMutations } from "@/hooks/mutations";
import { useRoutePermissions } from "@/hooks/permissions";
import {
  MAX_FAVORITE_VENDORS,
  useFavoriteVendors,
  useVendors,
} from "@/hooks/queries";
import { DialogManager, PageRenderer } from "@/shared/ui/common";
import type { BoundaryMapRef, VendorMarker } from "@/shared/ui/common/map";
import { CenterOnLocation } from "@/shared/ui/common/map";
import { AccessDeniedView } from "@/shared/ui/permissions";
import { Card } from "@/shared/ui/primitives";

import { FavoriteVendorsList, VendorsList } from "./components";

function hasValidLocation(v: {
  lat: number | null | undefined;
  long: number | null | undefined;
}): boolean {
  if (v.lat == null || v.long == null) return false;
  const lat = Number(v.lat);
  const lng = Number(v.long);
  return Number.isFinite(lat) && Number.isFinite(lng);
}

export function FavoriteVendorsView() {
  const routePerms = useRoutePermissions();
  const canRead = routePerms?.read ?? false;
  const canAdd = routePerms?.write ?? false;
  const canDelete = routePerms?.delete ?? false;

  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightedVendorId, setHighlightedVendorId] = useState<number | null>(
    null
  );
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const boundaryMapRef = useRef<BoundaryMapRef>(null);

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

  const { vendors } = useVendors({ search: searchQuery });
  const dialogManager = useDialogManager();
  const {
    favoriteVendors,
    favoriteRecords,
    isLoading: favoritesLoading,
    error: favoritesError,
  } = useFavoriteVendors();
  const { addFavorite, removeFavorite } = useFavoriteVendorMutations();
  const canAddMore = favoriteVendors.length < MAX_FAVORITE_VENDORS;
  const maxFavorites = MAX_FAVORITE_VENDORS;
  const isFavorite = useCallback(
    (vendorId: number) =>
      favoriteRecords.some(
        (record) =>
          record.vendor_id === vendorId || record.vendor?.id === vendorId
      ),
    [favoriteRecords]
  );
  const getFavoriteId = useCallback(
    (vendorId: number) =>
      favoriteRecords.find(
        (record) =>
          record.vendor_id === vendorId || record.vendor?.id === vendorId
      )?.id,
    [favoriteRecords]
  );

  const vendorsWithExactLocation = useMemo(
    () => vendors.filter(hasValidLocation),
    [vendors]
  );
  const vendorsWithStateOnly = useMemo(
    () =>
      vendors.filter(
        (v) => v.state && v.state.trim() !== "" && !hasValidLocation(v)
      ),
    [vendors]
  );

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setDropdownOpen(query.length > 0);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddFromDropdown = useCallback(
    (vendor: (typeof vendors)[0]) => {
      if (!canAdd || isFavorite(vendor.id)) return;
      if (!canAddMore) {
        toast.warning(
          `Maximum number of favorite vendors reached (${maxFavorites}). Remove one to add another.`
        );
        return;
      }
      addFavorite.mutate(vendor.id);
      setSearchQuery("");
      setDropdownOpen(false);
    },
    [canAdd, canAddMore, isFavorite, addFavorite, maxFavorites]
  );

  const handleRemoveFavorite = useCallback(
    (favoriteId: number) => {
      if (!canDelete) return;
      removeFavorite.mutate(favoriteId);
    },
    [canDelete, removeFavorite]
  );

  const vendorMarkers: VendorMarker[] = useMemo(() => {
    const fromSearchExact: VendorMarker[] = vendorsWithExactLocation.map(
      (v) => ({
        id: v.id,
        lat: Number(v.lat),
        long: Number(v.long),
        name: v.name || v.provider?.name || "",
        markerType: "exact" as const,
      })
    );
    const fromSearchApproximate: VendorMarker[] = vendorsWithStateOnly
      .map((v): VendorMarker | null => {
        const centroid = getStateCentroid(v.state);
        if (!centroid) return null;
        return {
          id: v.id,
          lat: centroid.lat,
          long: centroid.lng,
          name: v.name || v.provider?.name || "",
          markerType: "approximate" as const,
        };
      })
      .filter((m): m is VendorMarker => m !== null);
    const searchIds = new Set(
      [...vendorsWithExactLocation, ...vendorsWithStateOnly].map((v) => v.id)
    );
    const fromFavorites: VendorMarker[] = favoriteVendors
      .filter((v) => !searchIds.has(v.id))
      .map((v): VendorMarker | null => {
        if (hasValidLocation(v)) {
          return {
            id: v.id,
            lat: Number(v.lat),
            long: Number(v.long),
            name: v.name || v.provider?.name || "",
            markerType: "exact" as const,
          };
        }
        if (v.state && v.state.trim() !== "") {
          const centroid = getStateCentroid(v.state);
          if (centroid) {
            return {
              id: v.id,
              lat: centroid.lat,
              long: centroid.lng,
              name: v.name || v.provider?.name || "",
              markerType: "approximate" as const,
            };
          }
        }
        return null;
      })
      .filter((m): m is VendorMarker => m !== null);
    const all = [
      ...fromSearchExact,
      ...fromSearchApproximate,
      ...fromFavorites,
    ];

    return all;
  }, [vendorsWithExactLocation, vendorsWithStateOnly, favoriteVendors]);

  const showDropdown = dropdownOpen && searchQuery.length > 0;

  const highlightedVendor =
    highlightedVendorId != null
      ? (vendors.find((v) => v.id === highlightedVendorId) ??
        favoriteVendors.find((v) => v.id === highlightedVendorId) ??
        null)
      : null;
  const mapCenterLocation = useMemo(() => {
    if (!highlightedVendor) return undefined;
    if (hasValidLocation(highlightedVendor))
      return {
        lat: Number(highlightedVendor.lat),
        lng: Number(highlightedVendor.long),
      };
    if (highlightedVendor.state) {
      const c = getStateCentroid(highlightedVendor.state);
      return c ?? undefined;
    }
    return undefined;
  }, [highlightedVendor]);

  const handleDropdownResultClick = useCallback(
    (vendor: (typeof vendors)[0]) => {
      setHighlightedVendorId(vendor.id);
      setDropdownOpen(false);
    },
    []
  );

  const handleHighlightFavorite = useCallback((vendorId: number | null) => {
    setHighlightedVendorId(vendorId);
  }, []);

  const favoriteVendorIds = useMemo(() => {
    const ids = favoriteRecords
      .map((r) => r.vendor_id ?? (r as { vendor?: { id?: number } }).vendor?.id)
      .filter((id): id is number => id != null && Number.isFinite(Number(id)));

    return ids;
  }, [favoriteRecords]);

  const handleVendorMarkerClick = useCallback(
    (marker: VendorMarker) => {
      const vendor =
        vendors.find((v) => v.id === marker.id) ??
        favoriteVendors.find((v) => v.id === marker.id) ??
        null;
      if (!vendor) return;
      setHighlightedVendorId(vendor.id);
      dialogManager.openDialog({
        type: "VendorInfoDialog",
        component: VendorInfoDialog,
        props: {
          vendor,
          isFavorite: isFavorite(vendor.id),
          isFavoritePending: addFavorite.isPending || removeFavorite.isPending,
          onFavorite: () => {
            if (isFavorite(vendor.id)) {
              const fid = getFavoriteId(vendor.id);
              if (fid != null) {
                removeFavorite
                  .mutateAsync(fid)
                  .then(() => dialogManager.closeDialog())
                  .catch(() => {});
              }
            } else if (!canAddMore) {
              toast.warning(
                `Maximum number of favorite vendors reached (${maxFavorites}). Remove one to add another.`
              );
            } else {
              addFavorite
                .mutateAsync(vendor.id)
                .then(() => dialogManager.closeDialog())
                .catch(() => {});
            }
          },
        },
      });
    },
    [
      vendors,
      favoriteVendors,
      dialogManager,
      isFavorite,
      getFavoriteId,
      addFavorite,
      removeFavorite,
      canAddMore,
      maxFavorites,
    ]
  );

  if (!canRead) {
    return (
      <AccessDeniedView message="You do not have permission to view Favorite Vendors." />
    );
  }

  return (
    <PageRenderer
      renderChildrenWhenEmpty
      data={favoriteRecords}
      emptyState={{
        title: "No favorite vendors",
        description: "Search and add vendors to your favorites list.",
      }}
      error={favoritesError ?? null}
      isLoading={favoritesLoading}
      loadingMessage="Loading favorites..."
      title="Favorite Vendors"
    >
      {() => (
        <div className="grid min-h-0 w-full gap-6 lg:grid-cols-[minmax(0,1fr)_min(100%,24rem)] lg:items-stretch lg:gap-6">
          <div className="flex min-h-0 min-w-0 flex-col">
            <Card className="border-border-subtle flex min-h-[28rem] flex-1 flex-col overflow-hidden rounded-xl border p-4 lg:min-h-[calc(100svh-14rem)] lg:p-5">
              <h2 className="text-text-primary shrink-0 text-lg font-semibold">
                Vendors Near You
              </h2>
              <p className="text-text-muted mt-1 shrink-0 text-sm">
                Vendors are displayed based on proximity to your current
                location
              </p>
              <div
                ref={containerRef}
                className="relative mt-3 mb-3 flex w-full max-w-xl shrink-0 items-center"
              >
                <Input
                  className="min-w-0 flex-1"
                  leftIcon={<Search className="h-4 w-4" />}
                  placeholder="Search vendor name, provider, or state"
                  value={searchQuery}
                  onChange={(event) => handleSearch(event.target.value)}
                />
                <Button
                  iconOnly
                  aria-label="Search vendors"
                  className="-ml-px"
                  leftIcon={<ArrowRight className="h-5 w-5" />}
                  size={ComponentSizeEnum.SM}
                  onClick={() => handleSearch(searchQuery)}
                />
                {showDropdown && (
                  <div className="border-border-subtle bg-bg-surface-elevated absolute top-full left-0 z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border shadow-md">
                    <VendorsList
                      addFavoritePending={addFavorite.isPending}
                      canAddFavorite={canAdd}
                      canAddMore={canAddMore}
                      highlightedVendorId={highlightedVendorId}
                      isFavorite={isFavorite}
                      vendors={vendors}
                      onAddFavorite={handleAddFromDropdown}
                      onVendorClick={handleDropdownResultClick}
                    />
                  </div>
                )}
              </div>
              <div className="mb-2 flex shrink-0 flex-wrap items-center gap-2">
                <CenterOnLocation
                  boundaryMapRef={boundaryMapRef}
                  organizationLocationAvailable={false}
                  showOrgLocationButton={false}
                  userLocationAvailable={userLocation !== null}
                />
              </div>
              <div className="relative min-h-[18rem] flex-1 overflow-hidden rounded-lg">
                <OrderPipeDeckMap
                  ref={boundaryMapRef}
                  favoriteVendorIds={favoriteVendorIds}
                  location={mapCenterLocation}
                  selectedVendorId={highlightedVendorId ?? undefined}
                  userLocation={userLocation}
                  vendorMarkers={vendorMarkers}
                  onVendorMarkerClick={handleVendorMarkerClick}
                />
                <VendorLegend selectedOrFavoriteLabel="Favorite" />
              </div>
              <DialogManager manager={dialogManager} />
            </Card>
          </div>

          <aside className="flex min-h-0 min-w-0 flex-col">
            <Card className="border-border-subtle flex min-h-[20rem] flex-1 flex-col overflow-hidden rounded-xl border p-4 lg:min-h-[calc(100svh-14rem)] lg:p-5">
              <h2 className="text-text-primary shrink-0 text-lg font-semibold">
                Your Favorites
              </h2>
              <p className="text-text-muted mb-3 shrink-0 text-sm">
                {favoriteVendors.length} / {maxFavorites} selected
              </p>
              <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
                {favoriteRecords.length === 0 ? (
                  <p className="text-text-muted py-6 text-center text-sm">
                    No favorite vendors yet. Search and add up to {maxFavorites}
                    .
                  </p>
                ) : (
                  <FavoriteVendorsList
                    canRemove={canDelete}
                    favoriteRecords={favoriteRecords}
                    highlightedVendorId={highlightedVendorId}
                    removePending={removeFavorite.isPending}
                    userLocation={userLocation}
                    onHighlight={handleHighlightFavorite}
                    onRemove={handleRemoveFavorite}
                  />
                )}
              </div>
            </Card>
          </aside>
        </div>
      )}
    </PageRenderer>
  );
}
