import type { ContactInfo } from "./jobs";

/**
 * Organization invoice resources (list / CRUD).
 */

export interface OrganizationInvoiceLineItem {
  activity: string;
  description: string;
  quantity: number;
  unit_price: number;
}

/** Row from GET /ms/organizations/{orgId}/invoices/ */
export interface OrganizationInvoiceListItem {
  id: string;
  title: string;
  description: string;
  job: number;
  sent_to_client: boolean;
  paid: boolean;
  invoice_number?: string;
  checked_by_admin?: boolean;
  invoice_items: OrganizationInvoiceLineItem[];
  contact_info?: ContactInfo;
  farm_name?: string | null;
}

export type InvoiceContactInfo = Pick<ContactInfo, "full_name">;

/** Invoice list row with derived workflow status for table/grid views. */
export type InvoiceListRow = OrganizationInvoiceListItem & {
  invoice_status?: string;
  contact_info?: InvoiceContactInfo;
};

/** Invoice detail panel / show-more card payload. */
export type InvoiceDetailRow = InvoiceListRow & {
  client_name?: string;
  client_address?: string;
  client_contact?: string;
  due_date?: string;
  created_at?: string;
  created_by?: string;
};

export type InvoiceCardRow = Pick<
  InvoiceListRow,
  | "id"
  | "title"
  | "invoice_number"
  | "invoice_items"
  | "checked_by_admin"
  | "sent_to_client"
  | "paid"
  | "contact_info"
  | "farm_name"
>;
