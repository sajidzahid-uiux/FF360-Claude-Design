"use client";

import { useMemo } from "react";

import { usePipeDropPayload } from "@/hooks/queries";

import {
  useOrderDetailsContext,
  useVendorContext,
  useVendorFormContext,
} from "../context";
import {
  getOrderPipeBoundaryMapProps,
  getSelectedVendorMapLocation,
} from "../utils/getOrderPipeBoundaryMapProps";
import { mapDeliveryLocationsToVendorMarkers } from "../utils/mapDeliveryLocationsToVendorMarkers";

//Single source of truth for Order Pipe map data (Steps 3 and 4).
//Composes pipe-drop payload, boundary props, and delivery-location markers
//so both PipeDropLocationMap and ReviewLeft consume the same data without duplication.

export function useOrderPipeMapData() {
  const { order } = useOrderDetailsContext();
  const { vendorFormId } = useVendorFormContext();
  const { selectedVendor } = useVendorContext();
  const pipeDrop = usePipeDropPayload(vendorFormId, !!vendorFormId);

  const fallbackLocation = useMemo(
    () => getSelectedVendorMapLocation(selectedVendor),
    [selectedVendor]
  );

  const boundaryProps = useMemo(
    () => getOrderPipeBoundaryMapProps(order, fallbackLocation),
    [order, fallbackLocation]
  );

  const vendorMarkers = useMemo(
    () => mapDeliveryLocationsToVendorMarkers(pipeDrop.deliveryLocations),
    [pipeDrop.deliveryLocations]
  );

  return {
    ...pipeDrop,
    boundaryProps,
    vendorMarkers,
  };
}
