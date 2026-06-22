export interface MapPinCategoryRef {
  id: number;
  name: string;
  color: string;
}

export interface MapPinCategory {
  id: number;
  name: string;
  color: string;
  pin_count?: number;
}

export interface MapPinCategoryCreatePayload {
  name: string;
  color: string;
}

export type MapPinCategoryUpdatePayload = Partial<MapPinCategoryCreatePayload>;

export interface MapPinCategoryListParams {
  search?: string;
  page?: number;
  page_size?: number;
}
