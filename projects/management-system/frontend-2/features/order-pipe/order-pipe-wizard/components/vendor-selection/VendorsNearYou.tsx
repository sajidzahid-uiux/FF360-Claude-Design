"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button, ComponentSizeEnum, Input, cn } from "@fieldflow360/org-ui";
import { ArrowRight, Search } from "lucide-react";

import {
  VendorInfoDialog,
  VendorLegend,
} from "@/features/order-pipe/components";
import { getStateCentroid } from "@/features/order-pipe/utils/stateCentroids";
import { useDialogManager } from "@/hooks";
import { useOrderPipePermissions } from "@/hooks/permissions";
import { useVendors } from "@/hooks/queries";
import { DialogManager } from "@/shared/ui/common";
import type { BoundaryMapRef, VendorMarker } from "@/shared/ui/common/map";
import { Card } from "@/shared/ui/primitives";

import { useOrderDetailsContext, useVendorContext } from "../../context";
import { getOrderPipeBoundaryMapProps } from "../../utils/getOrderPipeBoundaryMapProps";
import { MapGoToButtons } from "../MapGoToButtons";
import { OrderPipeDeckMap } from "../OrderPipeDeckMap";

function hasValidLocation(v: {
  lat: number | null | undefined;
  long: number | null | undefined;
}): boolean {
  if (v.lat == null || v.long == null) return false;
  const lat = Number(v.lat);
  const lng = Number(v.long);
  return Number.isFinite(lat) && Number.isFinite(lng);
}

export function VendorsNearYou() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userLocationAvailable, setUserLocationAvailable] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const boundaryMapRef = useRef<BoundaryMapRef>(null);
  const dialogManager = useDialogManager();
  const { order } = useOrderDetailsContext();
  const boundaryProps = useMemo(
    () => getOrderPipeBoundaryMapProps(order),
    [order]
  );

  const vendorListParams = useMemo(
    () => ({ search: searchQuery }),
    [searchQuery]
  );
  const { vendors } = useVendors(vendorListParams);
  const { selectedVendor, setSelectedVendor } = useVendorContext();
  const { canWrite } = useOrderPipePermissions();

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

  const vendorMarkers: VendorMarker[] = useMemo(() => {
    const exact: VendorMarker[] = vendorsWithExactLocation.map((v) => ({
      id: v.id,
      lat: Number(v.lat),
      long: Number(v.long),
      name: v.name || v.provider?.name || "",
      markerType: "exact" as const,
    }));
    const approximate: VendorMarker[] = vendorsWithStateOnly
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
    return [...exact, ...approximate];
  }, [vendorsWithExactLocation, vendorsWithStateOnly]);

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

  const handleVendorMarkerClick = useCallback(
    (marker: VendorMarker) => {
      const vendor = vendors.find((v) => v.id === marker.id);
      if (!vendor) return;
      dialogManager.openDialog({
        type: "VendorInfoDialog",
        component: VendorInfoDialog,
        props: {
          vendor,
          showFavoriteButton: false,
          selectDisabled: !canWrite,
          onConfirm: () => {
            setSelectedVendor(vendor);
            dialogManager.closeDialog();
          },
        },
      });
    },
    [vendors, setSelectedVendor, dialogManager, canWrite]
  );

  const handleDropdownResultClick = useCallback(
    (vendor: (typeof vendors)[0]) => {
      let vendorLocation: { lat: number; lng: number } | null = null;

      if (hasValidLocation(vendor)) {
        vendorLocation = {
          lat: Number(vendor.lat),
          lng: Number(vendor.long),
        };
      } else if (vendor.state) {
        const centroid = getStateCentroid(vendor.state);
        if (centroid) {
          vendorLocation = { lat: centroid.lat, lng: centroid.lng };
        }
      }

      if (vendorLocation && boundaryMapRef.current) {
        boundaryMapRef.current.centerOnLocation(
          vendorLocation.lat,
          vendorLocation.lng
        );
      }

      setSearchQuery("");
      setDropdownOpen(false);
    },
    []
  );

  const selectedVendorLocation = useMemo(() => {
    if (!selectedVendor) return undefined;
    if (hasValidLocation(selectedVendor))
      return {
        lat: Number(selectedVendor.lat),
        lng: Number(selectedVendor.long),
      };
    if (selectedVendor.state) {
      const c = getStateCentroid(selectedVendor.state);
      return c ?? undefined;
    }
    return undefined;
  }, [selectedVendor]);

  const showDropdown = dropdownOpen && searchQuery.length > 0;

  return (
    <Card className="flex h-full w-full flex-col overflow-y-auto p-4 lg:p-6">
      <h2 className="flex-shrink-0 text-base leading-none font-semibold tracking-tight lg:text-[30px]">
        Vendors Near You
      </h2>
      <p className="text-text-muted mt-2 flex-shrink-0 text-sm leading-5 font-normal lg:text-[18px]">
        Search vendors and click on map pins to{" "}
        {canWrite ? "select" : "view details"}
      </p>
      <div
        ref={containerRef}
        className="relative mt-3 mb-4 flex w-full max-w-[500px] flex-shrink-0 items-center"
      >
        <div className="relative min-w-0 flex-1">
          <Input
            className="min-w-0 flex-1 text-[11px] placeholder:text-[11px] lg:max-w-none lg:text-base lg:placeholder:text-[18px]"
            leftIcon={<Search className="h-[12px] w-[12px]" />}
            placeholder="Search vendor name, provider, or state"
            value={searchQuery}
            onChange={(event) => handleSearch(event.target.value)}
          />
          {showDropdown && (
            <div className="border-border-subtle bg-bg-surface-elevated absolute top-full left-0 z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border shadow-md">
              {vendors.length === 0 ? (
                <div className="text-text-muted px-4 py-3 text-sm">
                  No vendors found
                </div>
              ) : (
                vendors.map((vendor) => (
                  <button
                    key={vendor.id}
                    className={cn(
                      "hover:bg-bg-hover flex w-full flex-col items-start gap-0.5 px-4 py-3 text-left text-sm transition-colors",
                      selectedVendor?.id === vendor.id && "bg-accent/50"
                    )}
                    type="button"
                    onClick={() => handleDropdownResultClick(vendor)}
                  >
                    <span className="font-medium">
                      {vendor.name} - {vendor.provider.name}
                    </span>
                    <span className="text-text-muted">
                      {vendor.phone_number && (
                        <>
                          {vendor.phone_number}
                          {(vendor.address || !hasValidLocation(vendor)) &&
                            " • "}
                        </>
                      )}
                      {vendor.address ? vendor.address : ""}
                      {!hasValidLocation(vendor) ? " • State only" : ""}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        <Button
          iconOnly
          aria-label="Search vendors"
          className="-ml-px"
          leftIcon={<ArrowRight className="h-5 w-5" />}
          size={ComponentSizeEnum.SM}
          onClick={() => handleSearch(searchQuery)}
        />
      </div>

      <MapGoToButtons
        boundaryMapRef={boundaryMapRef}
        kmlmap={order.job_kmlmap ?? undefined}
        shpmap={order.job_shpmap ?? undefined}
        userLocationAvailable={userLocationAvailable}
        xmlmap={order.job_xmlmap ?? undefined}
      />
      <div className="relative h-[296px] min-h-0 w-full overflow-hidden rounded-lg lg:h-auto lg:flex-1">
        <OrderPipeDeckMap
          ref={boundaryMapRef}
          corePoints={boundaryProps.corePoints}
          farmSelectorItems={boundaryProps.farmSelectorItems}
          kmlmap={order.job_kmlmap}
          location={boundaryProps.location ?? selectedVendorLocation}
          primaryRingIndex={boundaryProps.primaryRingIndex}
          secondaryFarmPins={boundaryProps.secondaryFarmPins}
          selectedVendorId={selectedVendor?.id}
          showCorePoints={boundaryProps.corePoints.length > 0}
          shpmap={order.job_shpmap}
          vendorMarkers={vendorMarkers}
          vertexRings={boundaryProps.vertexRings}
          xmlmap={order.job_xmlmap}
          onUserLocationChange={(loc) => setUserLocationAvailable(!!loc)}
          onVendorMarkerClick={handleVendorMarkerClick}
        />
        <VendorLegend selectedOrFavoriteLabel="Selected" />
      </div>
      <DialogManager manager={dialogManager} />
    </Card>
  );
}
