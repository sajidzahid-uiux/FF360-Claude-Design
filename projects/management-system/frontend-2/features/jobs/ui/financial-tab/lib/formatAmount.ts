export function formatFinancialAmount(
  value: unknown,
  fallback = "0.00"
): string {
  if (value == null || value === "") {
    return fallback;
  }
  return parseFloat(String(value)).toFixed(2);
}
