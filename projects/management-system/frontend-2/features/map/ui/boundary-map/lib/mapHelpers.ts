export const isGoogleMapsLink = (text: string): boolean =>
  text.includes("goo.gl") ||
  text.includes("maps.app.goo.gl") ||
  text.includes("/search/") ||
  text.includes("@") ||
  text.includes("/place/");

export const isGoogleMapsReady = (): boolean =>
  Boolean(window.google?.maps?.drawing && window.google?.maps?.places);

export const getMapContainerStyle = (
  mapHeight: string | number
): { width: string; height: string } => ({
  width: "100%",
  height: typeof mapHeight === "number" ? `${mapHeight}px` : mapHeight,
});
