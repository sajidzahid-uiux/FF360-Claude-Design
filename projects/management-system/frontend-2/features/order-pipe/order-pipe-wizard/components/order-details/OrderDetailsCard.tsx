import { useMemo, useRef, useState } from "react";

import type { BoundaryMapRef } from "@/shared/ui/common/map";
import { Card } from "@/shared/ui/primitives";

import { useOrderDetailsContext, useVendorContext } from "../../context";
import {
  getOrderPipeBoundaryMapProps,
  getSelectedVendorMapLocation,
} from "../../utils/getOrderPipeBoundaryMapProps";
import { MapGoToButtons } from "../MapGoToButtons";
import { OrderPipeDeckMap } from "../OrderPipeDeckMap";

export function OrderDetailsCard() {
  const boundaryMapRef = useRef<BoundaryMapRef>(null);
  const { order } = useOrderDetailsContext();
  const { selectedVendor } = useVendorContext();

  const fallbackLocation = useMemo(
    () => getSelectedVendorMapLocation(selectedVendor),
    [selectedVendor]
  );

  const contactPhone = order.contact_info?.phone_number || "—";
  const boundaryProps = useMemo(
    () => getOrderPipeBoundaryMapProps(order, fallbackLocation),
    [order, fallbackLocation]
  );
  const [userLocationAvailable, setUserLocationAvailable] = useState(false);

  return (
    <Card className="flex h-full flex-col p-4 lg:p-4">
      {/* Order Details Section */}
      <h2 className="flex-shrink-0 text-2xl leading-none font-semibold tracking-tight lg:text-[28px]">
        Order Details
      </h2>
      <p className="mt-2 flex-shrink-0 space-y-1 text-[18px] font-normal lg:mt-3 lg:space-y-1.5">
        <span className="text-text-muted">Name: </span>
        <span>{order.job_name || "—"}</span>
      </p>
      <p className="font-normal">
        <span className="text-text-muted">PO Number: </span>
        <span>{order.po_number || "—"}</span>
      </p>
      <p className="font-normal">
        <span className="text-text-muted">Phone Number: </span>
        <span>{contactPhone}</span>
      </p>

      {/* Delivery Location Section */}
      <div className="mt-3 flex min-h-0 flex-1 flex-col">
        <div className="mb-2 flex flex-shrink-0 items-center justify-between">
          <h2 className="text-lg leading-none font-semibold tracking-tight lg:text-xl">
            Delivery Location
          </h2>
        </div>

        <MapGoToButtons
          boundaryMapRef={boundaryMapRef}
          kmlmap={order.job_kmlmap ?? undefined}
          shpmap={order.job_shpmap ?? undefined}
          userLocationAvailable={userLocationAvailable}
          xmlmap={order.job_xmlmap ?? undefined}
        />
        <div className="relative h-[300px] overflow-hidden rounded-lg lg:min-h-0 lg:flex-1">
          <OrderPipeDeckMap
            ref={boundaryMapRef}
            corePoints={boundaryProps.corePoints}
            farmSelectorItems={boundaryProps.farmSelectorItems}
            kmlmap={order.job_kmlmap}
            location={boundaryProps.location}
            primaryRingIndex={boundaryProps.primaryRingIndex}
            secondaryFarmPins={boundaryProps.secondaryFarmPins}
            showCorePoints={boundaryProps.corePoints.length > 0}
            shpmap={order.job_shpmap}
            vertexRings={boundaryProps.vertexRings}
            xmlmap={order.job_xmlmap}
            onUserLocationChange={(loc) => setUserLocationAvailable(!!loc)}
          />
        </div>
      </div>
    </Card>
  );
}
