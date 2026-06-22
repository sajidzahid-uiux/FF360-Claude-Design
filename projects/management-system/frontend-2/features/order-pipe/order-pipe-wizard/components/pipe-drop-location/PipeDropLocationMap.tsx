"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { GEOLOCATION_OPTIONS } from "@/constants";
import { useDialogManager } from "@/hooks";
import {
  useCreateDeliveryLocation,
  useDeleteDeliveryLocation,
} from "@/hooks/mutations";
import { useOrderPipePermissions } from "@/hooks/permissions";
import { DialogManager } from "@/shared/ui/common";
import type { BoundaryMapRef, VendorMarker } from "@/shared/ui/common/map";
import { Card } from "@/shared/ui/primitives";

import { useOrderDetailsContext, useVendorFormContext } from "../../context";
import { useOrderPipeMapData } from "../../hooks/useOrderPipeMapData";
import { MapGoToButtons } from "../MapGoToButtons";
import { OrderPipeDeckMap } from "../OrderPipeDeckMap";
import { AssignItemsToLocationModal } from "./AssignItemsToLocationModal";

export function PipeDropLocationMap() {
  const { order } = useOrderDetailsContext();
  const { vendorFormId } = useVendorFormContext();
  const { canWrite } = useOrderPipePermissions();
  const readOnly = !canWrite;
  const boundaryMapRef = useRef<BoundaryMapRef>(null);
  const dialogManager = useDialogManager();
  const {
    boundaryProps,
    deliveryLocations,
    orderItems,
    remainedOrderedItems,
    vendorMarkers,
  } = useOrderPipeMapData();
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

  const createLocation = useCreateDeliveryLocation(vendorFormId);
  const deleteLocation = useDeleteDeliveryLocation(vendorFormId);
  const markerJustClickedRef = useRef(false);

  const handleRequestDelete = useCallback(
    (loc: (typeof deliveryLocations)[number]) => {
      dialogManager.closeDialog();
      const hasItems = loc.items.length > 0;
      if (hasItems) {
        dialogManager.openConfirmationDialog({
          title: "Delete delivery location?",
          description:
            'Items assigned to this location will return to "Remained Ordered Items".',
          confirmButtonText: "Delete",
          cancelButtonText: "Cancel",
          variant: "destructive",
          confirmationType: "delete",
          trash: true,
          onConfirm: async () => {
            await deleteLocation.mutateAsync(loc.id);
          },
        });
      } else {
        void deleteLocation.mutateAsync(loc.id);
      }
    },
    [dialogManager, deleteLocation]
  );

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      if (markerJustClickedRef.current) return;
      if (!canWrite || !vendorFormId || createLocation.isPending) return;
      createLocation.mutate(
        { lat, lng },
        {
          onSuccess: (newLocation) => {
            dialogManager.openDialog({
              type: "AssignItemsToLocationModal",
              component: AssignItemsToLocationModal,
              props: {
                location: newLocation,
                orderItems,
                remainedOrderedItems,
                vendorFormId: vendorFormId!,
                readOnly,
                onClose: () => dialogManager.closeDialog(),
                onRequestDelete: () => handleRequestDelete(newLocation),
              },
            });
          },
        }
      );
    },
    [
      canWrite,
      vendorFormId,
      createLocation,
      dialogManager,
      orderItems,
      remainedOrderedItems,
      handleRequestDelete,
      readOnly,
    ]
  );

  const handleMarkerClick = useCallback(
    (marker: VendorMarker) => {
      markerJustClickedRef.current = true;
      setTimeout(() => {
        markerJustClickedRef.current = false;
      }, 0);

      const loc = deliveryLocations.find((l) => l.id === marker.id);
      if (!loc) return;
      dialogManager.openDialog({
        type: "AssignItemsToLocationModal",
        component: AssignItemsToLocationModal,
        props: {
          location: loc,
          orderItems,
          remainedOrderedItems,
          vendorFormId: vendorFormId!,
          readOnly,
          onClose: () => dialogManager.closeDialog(),
          onRequestDelete: () => handleRequestDelete(loc),
        },
      });
    },
    [
      deliveryLocations,
      dialogManager,
      handleRequestDelete,
      orderItems,
      remainedOrderedItems,
      vendorFormId,
      readOnly,
    ]
  );

  return (
    <Card className="flex h-full flex-col p-4">
      <div className="flex flex-shrink-0 flex-col">
        <h2 className="text-xl leading-none font-semibold tracking-tight lg:text-2xl">
          Delivery Location
        </h2>
        <p className="text-text-muted my-3 text-[18px] font-normal">
          Tap anywhere on the map to add a delivery pin (Location 1, Location 2,
          …). Click a pin to assign items or delete the location.
        </p>
      </div>
      <MapGoToButtons
        boundaryMapRef={boundaryMapRef}
        deliveryLocations={deliveryLocations}
        kmlmap={order.job_kmlmap ?? undefined}
        shpmap={order.job_shpmap ?? undefined}
        userLocationAvailable={userLocation != null}
        xmlmap={order.job_xmlmap ?? undefined}
      />
      <div className="relative h-[280px] overflow-hidden rounded-lg lg:min-h-0 lg:flex-1">
        <OrderPipeDeckMap
          ref={boundaryMapRef}
          showVendorMarkerLabels
          corePoints={boundaryProps.corePoints}
          farmSelectorItems={boundaryProps.farmSelectorItems}
          kmlmap={order.job_kmlmap}
          location={boundaryProps.location}
          primaryRingIndex={boundaryProps.primaryRingIndex}
          secondaryFarmPins={boundaryProps.secondaryFarmPins}
          showCorePoints={boundaryProps.corePoints.length > 0}
          shpmap={order.job_shpmap}
          userLocation={userLocation}
          vendorMarkers={vendorMarkers}
          vertexRings={boundaryProps.vertexRings}
          xmlmap={order.job_xmlmap}
          onMapClick={canWrite ? handleMapClick : undefined}
          onVendorMarkerClick={handleMarkerClick}
        />
      </div>
      <DialogManager manager={dialogManager} />
    </Card>
  );
}
