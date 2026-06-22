// ============================================
// ORDER PIPE CATEGORIES (for order details step)
// ============================================

export interface OrderPipeOption {
  id: number;
  value: string;
  label: string;
  display_order: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface OrderPipeType {
  id: number;
  code: string;
  name: string;
  display_order: number;
  options: OrderPipeOption[];
  created_at: string | null;
  updated_at: string | null;
}

export interface OrderPipeCategory {
  id: number;
  code: string;
  name: string;
  type: string;
  provider: unknown | null;
  display_order: number;
  types: OrderPipeType[];
  options: OrderPipeOption[];
  created_at: string | null;
  updated_at: string | null;
}

export type OrderPipeCategoriesResponse = OrderPipeCategory[];

/** One line item for submission (job order items) */
export interface OrderPipeItemPayload {
  pipe_type: string;
  sub_type?: string;
  size: string;
  quantity: number;
}
