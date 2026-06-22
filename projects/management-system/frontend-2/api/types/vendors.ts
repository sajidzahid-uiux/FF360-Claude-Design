// ============================================
// VENDOR TYPES
// ============================================

export interface VendorProvider {
  id: number;
  name: string;
}

export interface Vendor {
  id: number;
  provider: VendorProvider;
  name: string;
  address: string;
  state: string;
  email: string;
  phone_number: string;
  lat: number | null;
  long: number | null;
  google_link: string;
}

export interface VendorListParams {
  search?: string;
}

export type VendorsResponse = Vendor[];

// Favorite record returned by GET /vendor-favorites/
export interface VendorFavorite {
  id: number;
  vendor_id: number;
  vendor: Vendor;
}

export type VendorFavoritesResponse = VendorFavorite[];

export interface VendorFavoriteCreatePayload {
  vendor_id: number;
}
