export function toAccentLight(accentColor: string): string {
  const hex = accentColor.trim();
  const match = /^#([a-f\d]{6})$/i.exec(hex) || /^#([a-f\d]{3})$/i.exec(hex);

  if (!match) return accentColor;

  const normalized =
    match[1].length === 3
      ? match[1]
          .split('')
          .map((ch) => ch + ch)
          .join('')
      : match[1];

  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);

  const mix = (channel: number) =>
    Math.round(channel * 0.22 + 255 * 0.78)
      .toString(16)
      .padStart(2, '0');

  return `#${mix(r)}${mix(g)}${mix(b)}`;
}

export function getAccentTextColor(
  accentColor: string,
  lightText = '#FFFFFF',
  darkText = '#111111'
): string {
  const hex = accentColor.trim();
  const match = /^#([a-f\d]{6})$/i.exec(hex) || /^#([a-f\d]{3})$/i.exec(hex);

  if (!match) return darkText;

  const normalized =
    match[1].length === 3
      ? match[1]
          .split('')
          .map((ch) => ch + ch)
          .join('')
      : match[1];

  const r = Number.parseInt(normalized.slice(0, 2), 16) / 255;
  const g = Number.parseInt(normalized.slice(2, 4), 16) / 255;
  const b = Number.parseInt(normalized.slice(4, 6), 16) / 255;

  const linearize = (channel: number) =>
    channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);

  const luminance =
    0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);

  return luminance > 0.45 ? darkText : lightText;
}
