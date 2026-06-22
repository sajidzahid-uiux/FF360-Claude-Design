import { useMemo, useState } from "react";

import { ComponentSizeEnum, Input, Loader } from "@fieldflow360/org-ui";

import { usePipeDropPayload } from "@/hooks/queries";
import { EmptyState, ErrorState } from "@/shared/ui/common";
import { Card } from "@/shared/ui/primitives";

import { useVendorFormContext } from "../../context";
import { OrderItemsGrid } from "./components";

export function OrderItemsSummary() {
  const { vendorFormId } = useVendorFormContext();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch pipe drop payload data
  const { orderItems, isLoading, error } = usePipeDropPayload(
    vendorFormId,
    !!vendorFormId
  );

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery) return orderItems;
    const query = searchQuery.toLowerCase();
    return orderItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.size.toLowerCase().includes(query) ||
        item.item_key.toLowerCase().includes(query)
    );
  }, [orderItems, searchQuery]);

  const cardClass =
    "border-border-subtle bg-bg-surface-elevated flex h-full flex-col rounded-lg border p-4 shadow-sm lg:p-5";

  // Loading state
  if (isLoading) {
    return (
      <Card className={cardClass}>
        <Loader
          centerInContainer={false}
          size={ComponentSizeEnum.SM}
          text="Loading order items..."
        />
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={cardClass}>
        <ErrorState
          description={(error as Error).message || "Failed to load order items"}
          error={error instanceof Error ? error : new Error(String(error))}
          title="Error loading items"
        />
      </Card>
    );
  }

  // Empty state
  if (orderItems.length === 0) {
    return (
      <Card className={cardClass}>
        <EmptyState
          description="No items found. Please go back and add items in Step 2."
          title="No order items"
        />
      </Card>
    );
  }

  return (
    <Card className={cardClass}>
      <h2 className="text-text-primary mb-4 flex-shrink-0 text-xl leading-none font-semibold tracking-tight lg:text-2xl">
        Order Items
      </h2>

      {/* Search Field */}
      <Input
        className="mb-4 w-full flex-shrink-0"
        placeholder="Search by name, size, or item key..."
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Order Items Grid — scrolls within the card on desktop */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <OrderItemsGrid items={filteredItems} />

        {/* No results message */}
        {searchQuery && filteredItems.length === 0 && (
          <p className="text-text-muted mt-4 text-center">
            No items match your search.
          </p>
        )}
      </div>
    </Card>
  );
}
