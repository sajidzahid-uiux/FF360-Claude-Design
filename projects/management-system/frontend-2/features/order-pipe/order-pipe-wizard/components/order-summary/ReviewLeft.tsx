import { useMemo, useState } from "react";

import type { VendorMarker } from "@/shared/ui/common/map";
import { Card } from "@/shared/ui/primitives";

import { useOrderDetailsContext, useVendorContext } from "../../context";
import { useOrderPipeMapData } from "../../hooks/useOrderPipeMapData";
import { MapGoToButtons } from "../MapGoToButtons";
import { OrderPipeDeckMap } from "../OrderPipeDeckMap";
import { useMapRef } from "./MapRefContext";

export function ReviewLeft() {
  const { boundaryMapRef } = useMapRef();
  const { order } = useOrderDetailsContext();
  const { selectedVendor } = useVendorContext();
  const { boundaryProps, vendorMarkers } = useOrderPipeMapData();

  const contractorName = order.contractor_name || "—";
  const contactPhone = order.contact_info?.phone_number || "—";
  const contactEmail = order.contact_info?.email || "—";
  const vendorName = selectedVendor?.name || order.vendor?.name || "—";
  const vendorPhone =
    selectedVendor?.phone_number || order.vendor?.phone_number || "—";

  const [userLocationAvailable, setUserLocationAvailable] = useState(false);
  const numberLabel = order.estimate_number ? "Estimate Number:" : "PO Number:";
  const numberValue = order.estimate_number || order.po_number || "—";

  const allMarkers = useMemo(() => {
    const markers = [...vendorMarkers];

    if (order.vendor?.lat != null && order.vendor?.long != null) {
      const vendorMarker: VendorMarker = {
        id: -1,
        lat: order.vendor.lat,
        long: order.vendor.long,
        name: order.vendor.name || "Vendor",
        markerType: "exact" as const,
      };
      markers.push(vendorMarker);
    }

    return markers;
  }, [vendorMarkers, order.vendor]);

  return (
    <Card className="border-border-subtle bg-bg-surface-elevated flex h-full flex-col rounded-lg border p-4 shadow-sm lg:p-5">
      {/* Order Details + Vendor Details side by side */}
      <div className="grid flex-shrink-0 grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
        <div className="min-w-0">
          <h2 className="text-text-primary mb-2 text-xl leading-tight font-semibold tracking-tight lg:text-2xl">
            Order Details
          </h2>
          <div className="space-y-1 text-sm font-normal lg:text-[15px]">
            <div>
              <span className="text-text-muted">Organization Name: </span>
              <span className="text-text-primary">{contractorName}</span>
            </div>
            <div>
              <span className="text-text-muted">Job Name: </span>
              <span className="text-text-primary">{order.job_name || "—"}</span>
            </div>
            <div>
              <span className="text-text-muted">{numberLabel} </span>
              <span className="text-text-primary">{numberValue}</span>
            </div>
            <div>
              <span className="text-text-muted">Phone Number: </span>
              <span className="text-text-primary">{contactPhone}</span>
            </div>
          </div>
        </div>
        <div className="min-w-0">
          <h2 className="text-text-primary mb-2 text-xl leading-tight font-semibold tracking-tight lg:text-2xl">
            Vendor Details
          </h2>
          <div className="space-y-1 text-sm font-normal lg:text-[15px]">
            <div>
              <span className="text-text-muted">Vendor Name: </span>
              <span className="text-text-primary">{vendorName}</span>
            </div>
            <div>
              <span className="text-text-muted">Phone Number: </span>
              <span className="text-text-primary">{vendorPhone}</span>
            </div>
            <div className="min-w-0">
              <span className="text-text-muted">Email: </span>
              <span className="text-text-primary break-all">
                {contactEmail}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Location - full width map */}
      <div className="mt-6 flex min-h-0 flex-1 flex-col">
        <h2 className="text-text-primary mb-2 flex-shrink-0 text-xl leading-tight font-semibold tracking-tight lg:text-2xl">
          Delivery Location
        </h2>
        <MapGoToButtons
          boundaryMapRef={boundaryMapRef}
          kmlmap={order.job_kmlmap ?? undefined}
          shpmap={order.job_shpmap ?? undefined}
          userLocationAvailable={userLocationAvailable}
          xmlmap={order.job_xmlmap ?? undefined}
        />
        <div className="relative h-[350px] overflow-hidden rounded-lg lg:min-h-0 lg:flex-1">
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
            vendorMarkers={allMarkers}
            vertexRings={boundaryProps.vertexRings}
            xmlmap={order.job_xmlmap}
            onUserLocationChange={(loc) => setUserLocationAvailable(!!loc)}
          />
        </div>
      </div>
    </Card>
  );
}
