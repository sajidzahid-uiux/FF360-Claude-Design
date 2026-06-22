import { useEffect } from 'react';
import { useTheme } from '../../../theme';

const FALLBACK_ACCENT = '#D7F27A';

function buildFaviconDataUrl(accentColor: string): string {
  const safeAccent = accentColor || FALLBACK_ACCENT;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect x="3" y="3" width="58" height="58" rx="17" fill="#111827"/><text x="32" y="49" text-anchor="middle" font-size="54" font-weight="900" font-family="Inter, Arial, sans-serif" letter-spacing=".15" fill="${safeAccent}">FF</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function upsertFavicon(href: string) {
  const iconLinks = document.querySelectorAll<HTMLLinkElement>(
    'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]'
  );

  if (iconLinks.length === 0) {
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    link.href = href;
    document.head.appendChild(link);
    return;
  }

  iconLinks.forEach((iconLink) => {
    iconLink.type = 'image/svg+xml';
    iconLink.href = href;
  });
}

export interface DynamicFaviconProps {
  color?: string;
}

export function DynamicFavicon({ color }: DynamicFaviconProps) {
  const { accentColor } = useTheme();

  useEffect(() => {
    const nextColor = color || accentColor || FALLBACK_ACCENT;
    upsertFavicon(buildFaviconDataUrl(nextColor));
  }, [accentColor, color]);

  return null;
}
