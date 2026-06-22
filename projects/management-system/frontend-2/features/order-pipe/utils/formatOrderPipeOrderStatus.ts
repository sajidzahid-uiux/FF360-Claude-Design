import {
  ORDER_PIPE_STATUSES,
  ORDER_PIPE_STATUS_LABELS,
  type OrderPipeStatus,
} from "@/constants";

const STATUS_LOOKUP: Record<string, OrderPipeStatus> = Object.fromEntries(
  ORDER_PIPE_STATUSES.map((s) => [s.toLowerCase(), s])
);

/**
 * Maps API order_status values to UI labels and strips backend suffix noise
 * (e.g. "Contact supplier .P" → "Contact Supplier").
 */
export function formatOrderPipeOrderStatusForDisplay(
  raw: string | null | undefined
): string | null {
  if (!raw) return null;

  const cleaned = String(raw)
    .trim()
    .replace(/\s*\.[A-Za-z0-9_-]+$/, "")
    .trim();

  if (!cleaned) return null;

  const direct = ORDER_PIPE_STATUS_LABELS[cleaned as OrderPipeStatus];
  if (direct) return direct;

  const normalized = STATUS_LOOKUP[cleaned.toLowerCase()];
  return normalized ? ORDER_PIPE_STATUS_LABELS[normalized] : cleaned;
}
