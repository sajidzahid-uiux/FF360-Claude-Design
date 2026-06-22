/** Build a map-pin SVG data URL for deck.gl IconLayer. */
export function buildDeckPinIcon(hex: string): {
  url: string;
  width: number;
  height: number;
  anchorY: number;
  mask: boolean;
} {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">` +
    `<ellipse cx="16" cy="30" rx="4" ry="1.5" fill="rgba(0,0,0,0.2)"/>` +
    `<path fill-rule="evenodd" fill="${hex}" stroke="white" stroke-width="1.5" stroke-linejoin="round" d="M16 2C11.03 2 7 6.03 7 11c0 6.75 9 18 9 18s9-11.25 9-18c0-4.97-4.03-9-9-9z M19.5 11A3.5 3.5 0 1 0 12.5 11A3.5 3.5 0 1 0 19.5 11z"/>` +
    `</svg>`;
  return {
    url: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg),
    width: 32,
    height: 32,
    anchorY: 30,
    mask: false,
  };
}

export const DECK_BLUE_PIN = buildDeckPinIcon("#3B82F6");
export const DECK_GRAY_PIN = buildDeckPinIcon("#6B7280");
export const DECK_BLACK_PIN = buildDeckPinIcon("#1F2937");
export const DECK_GOLD_PIN = buildDeckPinIcon("#F59E0B");
export const DECK_RED_PIN = buildDeckPinIcon("#EF4444");
export const DECK_LOCATION_PIN = buildDeckPinIcon("#EA4335");

/** Circular map-pin marker: colored disc with white pin silhouette in the center. */
export function buildDeckCirclePinIcon(hex: string): {
  url: string;
  width: number;
  height: number;
  anchorY: number;
  mask: boolean;
} {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">` +
    `<defs>` +
    `<filter id="pin-shadow" x="-25%" y="-25%" width="150%" height="150%">` +
    `<feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-color="#000000" flood-opacity="0.22"/>` +
    `</filter>` +
    `</defs>` +
    `<circle cx="16" cy="16" r="14" fill="${hex}" filter="url(#pin-shadow)"/>` +
    `<path fill="#FFFFFF" d="M16 8C12.2 8 9.5 10.8 9.5 14.5C9.5 17.3 12.8 20.8 16 23.6C19.2 20.8 22.5 17.3 22.5 14.5C22.5 10.8 19.8 8 16 8Z"/>` +
    `</svg>`;
  return {
    url: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg),
    width: 32,
    height: 32,
    anchorY: 16,
    mask: false,
  };
}

export function getMapPinSvgUrl(pinName: string): string {
  const num = pinName.replace(/^Pin\s*/i, "");
  return `data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36"><path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22S28 23.333 28 14C28 6.268 21.732 0 14 0z" fill="%2310b981" stroke="%23fff" stroke-width="1.5"/><text x="14" y="14" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="bold" fill="%23fff" font-family="Arial,sans-serif">${num}</text></svg>`;
}

export function mapPinIconForDeck(pinName: string) {
  return {
    url: getMapPinSvgUrl(pinName),
    width: 28,
    height: 36,
    anchorY: 36,
    mask: false,
  };
}
