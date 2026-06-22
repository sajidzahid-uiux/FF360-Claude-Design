import { useCallback, useMemo } from "react";

import { usePipeDropPayload } from "@/hooks/queries";
import { Card } from "@/shared/ui/primitives";

import { useVendorFormContext } from "../../context";
import { useMapRef } from "./MapRefContext";

export function ReviewRight() {
  const { boundaryMapRef } = useMapRef();
  const { vendorFormId } = useVendorFormContext();
  const { orderItems, deliveryLocations } = usePipeDropPayload(vendorFormId);

  const rows = useMemo(() => {
    return deliveryLocations.flatMap((loc) =>
      loc.items.map((locItem) => {
        const orderItem = orderItems.find(
          (oi) => oi.item_key === locItem.item_key
        );
        return {
          id: `${loc.id}-${locItem.item_key}`,
          item: orderItem?.name ?? locItem.item_key,
          quantity: `${locItem.to_install_quantity} (${locItem.unit})`,
          pipeDropLocation: `Location ${loc.sequence}`,
          locationLat: loc.lat,
          locationLng: loc.lng,
        };
      })
    );
  }, [deliveryLocations, orderItems]);

  const handleLocationClick = useCallback(
    (lat: number, lng: number) => {
      if (boundaryMapRef.current?.centerOnLocation) {
        boundaryMapRef.current.centerOnLocation(lat, lng);
      }
    },
    [boundaryMapRef]
  );

  return (
    <Card className="border-border-subtle bg-bg-surface-elevated flex h-full flex-col rounded-lg border p-4 shadow-sm lg:p-5">
      <h2 className="text-text-primary mb-4 flex-shrink-0 text-xl leading-none font-semibold tracking-tight lg:text-2xl">
        Order Items
      </h2>

      <div className="min-h-0 min-w-0 flex-1 overflow-x-auto overflow-y-auto rounded-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border-border-subtle text-text-muted border-t border-b border-l px-3 py-2.5 text-left text-sm font-medium lg:px-4 lg:py-3">
                Item
              </th>
              <th className="border-border-subtle text-text-muted border border-r-0 border-l-0 px-3 py-2.5 text-left text-sm font-medium lg:px-4 lg:py-3">
                Quantity
              </th>
              <th className="border-border-subtle text-text-muted border border-l-0 px-3 py-2.5 text-left text-sm font-medium lg:px-4 lg:py-3">
                Pipe Drop Location
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  className="border-border-subtle text-text-muted border px-3 py-6 text-center text-sm lg:px-4"
                  colSpan={3}
                >
                  No items assigned to delivery locations yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="bg-bg-app">
                  <td className="border-border-subtle text-text-primary border-t border-b border-l px-3 py-2.5 text-sm font-normal lg:px-4 lg:py-3">
                    {row.item}
                  </td>
                  <td className="border-border-subtle text-text-primary border border-r-0 border-l-0 px-3 py-2.5 text-sm font-normal lg:px-4 lg:py-3">
                    {row.quantity}
                  </td>
                  <td className="border-border-subtle border border-l-0 px-3 py-2.5 lg:px-4 lg:py-3">
                    <button
                      className="text-accent text-sm font-normal underline decoration-solid underline-offset-4 hover:opacity-80"
                      type="button"
                      onClick={() =>
                        handleLocationClick(row.locationLat, row.locationLng)
                      }
                    >
                      {row.pipeDropLocation}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
