export type RgbaColor = [number, number, number, number];
export type RgbColor = [number, number, number];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function normalizeHex(hex: string) {
  return hex.trim().replace(/^#/, "");
}

function componentToHex(component: number) {
  return clamp(Math.round(component), 0, 255).toString(16).padStart(2, "0");
}

export function rgbToHex(red: number, green: number, blue: number): string {
  return `#${componentToHex(red)}${componentToHex(green)}${componentToHex(blue)}`;
}

export function hslToRgb(
  hue: number,
  saturation: number,
  lightness: number
): RgbColor {
  const h = (((hue % 360) + 360) % 360) / 360;
  const s = clamp(saturation, 0, 100) / 100;
  const l = clamp(lightness, 0, 100) / 100;

  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h * 12) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };

  return [
    Math.round(f(0) * 255),
    Math.round(f(8) * 255),
    Math.round(f(4) * 255),
  ];
}

export function hslToHex(
  hue: number,
  saturation: number,
  lightness: number
): string {
  const [red, green, blue] = hslToRgb(hue, saturation, lightness);
  return rgbToHex(red, green, blue);
}

export function hueToHex(hue: number): string {
  return hslToHex(hue, 100, 50);
}

export function hexToRgb(hex: string): RgbColor {
  const value = normalizeHex(hex);

  if (value.length === 3) {
    return [
      parseInt(value[0] + value[0], 16),
      parseInt(value[1] + value[1], 16),
      parseInt(value[2] + value[2], 16),
    ];
  }

  if (value.length >= 6) {
    return [
      parseInt(value.slice(0, 2), 16),
      parseInt(value.slice(2, 4), 16),
      parseInt(value.slice(4, 6), 16),
    ];
  }

  return [0, 0, 0];
}

/**
 * Convert a CSS hex color string to a deck.gl RGBA tuple.
 * Supports 3-char (#RGB), 6-char (#RRGGBB), and 8-char (#RRGGBBAA) formats.
 */
export function hexToRgba(hex: string, alpha = 255): RgbaColor {
  const value = normalizeHex(hex);
  const [red, green, blue] = hexToRgb(value);
  const resolvedAlpha =
    value.length === 8 ? parseInt(value.slice(6, 8), 16) : alpha;

  return [red, green, blue, resolvedAlpha];
}

export function hexToHue(hex: string): number {
  const [red, green, blue] = hexToRgb(hex).map((component) => component / 255);
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  if (delta === 0) return 0;

  let hue = 0;
  if (max === red) {
    hue = ((green - blue) / delta) % 6;
  } else if (max === green) {
    hue = (blue - red) / delta + 2;
  } else {
    hue = (red - green) / delta + 4;
  }

  const degrees = hue * 60;
  return degrees < 0 ? degrees + 360 : degrees;
}
