/**
 * Parse user agent string to extract browser and OS for display.
 * Uses simple pattern matching - no external dependencies.
 */
export function parseUserAgent(ua: string | null | undefined): string {
  if (!ua) return "Unknown device";

  const browser = getBrowser(ua);
  const os = getOS(ua);
  return [browser, os].filter(Boolean).join(" on ") || "Unknown device";
}

function getBrowser(ua: string): string {
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("Chrome/") && !ua.includes("Chromium")) return "Chrome";
  if (ua.includes("Firefox/")) return "Firefox";
  if (ua.includes("Safari/") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("Opera") || ua.includes("OPR/")) return "Opera";
  return "Browser";
}

function getOS(ua: string): string {
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac OS")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  return "Unknown";
}
