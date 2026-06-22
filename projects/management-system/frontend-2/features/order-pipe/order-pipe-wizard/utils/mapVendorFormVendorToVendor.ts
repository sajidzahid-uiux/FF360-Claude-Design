import type { Vendor, VendorFormVendorInfo } from "@/api/types";

/**
 * Maps API vendor form vendor info to the Vendor type used in VendorContext
 * so we can restore the selected vendor when the wizard loads with a saved vendor.
 */
export function mapVendorFormVendorToVendor(v: VendorFormVendorInfo): Vendor {
  return {
    id: v.vendor_id,
    provider: { id: v.provider_id, name: v.provider_name },
    name: v.name,
    address: v.address,
    state: v.state,
    email: v.email,
    phone_number: v.phone_number,
    lat: v.lat,
    long: v.long,
    google_link: v.google_link,
  };
}
