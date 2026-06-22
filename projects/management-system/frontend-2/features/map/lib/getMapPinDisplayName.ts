/** User-facing pin title: prefer non-empty label, otherwise backend `name` (e.g. "Pin 20"). */
export function getMapPinDisplayName(pin: {
  name: string;
  label?: string | null;
}): string {
  const trimmedLabel = pin.label?.trim();
  return trimmedLabel ? trimmedLabel : pin.name;
}
