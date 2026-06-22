import type { JobActiveInvoice } from "@/api/types";

/** Latest unpaid invoice for a job, or null when none / all paid. */
export function getActiveUnpaidJobInvoice(
  invoices: JobActiveInvoice[] | null | undefined
): JobActiveInvoice | null {
  if (!Array.isArray(invoices) || invoices.length === 0) {
    return null;
  }
  const unpaid = invoices.filter((invoice) => !invoice?.paid);
  if (unpaid.length === 0) {
    return null;
  }
  return unpaid[unpaid.length - 1] ?? null;
}
