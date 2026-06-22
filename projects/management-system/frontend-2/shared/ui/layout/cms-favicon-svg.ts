import { CMS_BRAND_DEFAULT_ACCENT_HEX } from "@/lib/cms-theme";

/** Lucide HardHat paths (24×24) — same icon as CMS sidebar logo. */
const HARD_HAT_PATHS = [
  '<path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/>',
  '<path d="M14 6a6 6 0 0 1 6 6v3"/>',
  '<path d="M4 15v-3a6 6 0 0 1 6-6"/>',
  '<rect x="2" y="15" width="20" height="4" rx="1"/>',
].join("");

const FAVICON_DISPLAY_SIZE = 16;

export function buildCmsHardHatFaviconSvg(accentColor: string): string {
  const safeAccent = accentColor || CMS_BRAND_DEFAULT_ACCENT_HEX;
  return `<svg width="${FAVICON_DISPLAY_SIZE}" height="${FAVICON_DISPLAY_SIZE}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g stroke="${safeAccent}" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" fill="none">${HARD_HAT_PATHS}</g></svg>`;
}

export function buildCmsHardHatFaviconDataUrl(accentColor: string): string {
  return `data:image/svg+xml,${encodeURIComponent(buildCmsHardHatFaviconSvg(accentColor))}`;
}
