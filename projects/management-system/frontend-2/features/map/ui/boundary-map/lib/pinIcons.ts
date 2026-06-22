export const getPinSvgUrl = (pinName: string): string => {
  const num = pinName.replace(/^Pin\s*/i, "");
  return `data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36"><path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22S28 23.333 28 14C28 6.268 21.732 0 14 0z" fill="%2310b981" stroke="%23fff" stroke-width="1.5"/><text x="14" y="14" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="bold" fill="%23fff" font-family="Arial,sans-serif">${num}</text></svg>`;
};

export const FIRST_VERTEX_MARKER_ICON =
  'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="%23ff9800" stroke="%23fff" stroke-width="2"/><circle cx="8" cy="8" r="2" fill="%23fff"/></svg>';

export const SECONDARY_FARM_PIN_ICON =
  'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="0 0 24 32"><path d="M12 0C5.373 0 0 5.373 0 12c0 8 12 20 12 20S24 20 24 12C24 5.373 18.627 0 12 0z" fill="%231F2937" stroke="%23fff" stroke-width="1.5"/><circle cx="12" cy="12" r="4" fill="%23fff"/></svg>';

export const CORE_POINT_MARKER_ICON =
  'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="%23ef4444" stroke="%23fff" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="%23fff"/></svg>';

export const USER_LOCATION_MARKER_ICON =
  "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Ccircle%20cx%3D%2210%22%20cy%3D%2210%22%20r%3D%228%22%20fill%3D%22%234285f4%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%223%22/%3E%3Ccircle%20cx%3D%2210%22%20cy%3D%2210%22%20r%3D%223%22%20fill%3D%22%23ffffff%22/%3E%3C/svg%3E";

export const ORGANIZATION_LOCATION_MARKER_ICON =
  "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Ccircle%20cx%3D%2210%22%20cy%3D%2210%22%20r%3D%228%22%20fill%3D%22%23f59e0b%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%223%22/%3E%3Ccircle%20cx%3D%2210%22%20cy%3D%2210%22%20r%3D%223%22%20fill%3D%22%23ffffff%22/%3E%3C/svg%3E";

export const VENDOR_PIN_PATH =
  "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z";
