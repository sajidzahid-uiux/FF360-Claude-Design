import { FavoriteVendorList } from "./FavoriteVendorList";
import { SelectedVendor } from "./SelectedVendor";
import { VendorsNearYou } from "./VendorsNearYou";

function VendorSelectionLeft() {
  return <VendorsNearYou />;
}

function VendorSelectionRight() {
  return (
    <>
      <div className="border-border-subtle bg-bg-surface-elevated flex-shrink-0 rounded-lg border p-6 shadow-sm">
        <SelectedVendor />
      </div>
      <div className="min-h-0 flex-1">
        <FavoriteVendorList />
      </div>
    </>
  );
}

// Mobile layout: single column with proper order per Figma design
function VendorSelectionMobile() {
  return (
    <div className="flex flex-col gap-4">
      {/* Favorite Vendors */}
      <FavoriteVendorList />

      {/* Selected Vendor / Instructions */}
      <div className="border-border-subtle bg-bg-surface-elevated rounded-lg border p-4 shadow-sm">
        <SelectedVendor />
      </div>

      {/* Vendors Near You with Map */}
      <VendorsNearYou />
    </div>
  );
}

export const VendorSelection = {
  Left: VendorSelectionLeft,
  Right: VendorSelectionRight,
  Mobile: VendorSelectionMobile,
};
