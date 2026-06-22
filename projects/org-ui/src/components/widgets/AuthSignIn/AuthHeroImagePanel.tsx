'use client';

import { CSSProperties, useEffect, useState } from 'react';

export interface AuthHeroImagePanelProps {
  heroImageSrc?: string;
  heroImageAlt?: string;
}

/** Hero image column for auth / org-welcome split layouts (desktop right side). */
export function AuthHeroImagePanel({
  heroImageSrc,
  heroImageAlt = 'Authentication background',
}: AuthHeroImagePanelProps) {
  const [parallaxStyle, setParallaxStyle] = useState<CSSProperties | undefined>(undefined);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) return;

    const handleMove = (event: MouseEvent) => {
      const xOffset = (event.clientX / window.innerWidth - 0.5) * 20;
      const yOffset = (event.clientY / window.innerHeight - 0.5) * 16;

      setParallaxStyle({
        transform: `translate3d(${xOffset.toFixed(2)}px, ${yOffset.toFixed(2)}px, 0) scale(1.06)`,
      });
    };

    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  if (!heroImageSrc) {
    return null;
  }

  return (
    <div className="ff-auth-hero-panel">
      <div className="ff-auth-hero-overlay" aria-hidden />
      <img
        src={heroImageSrc}
        alt={heroImageAlt}
        className="ff-auth-hero-image"
        style={parallaxStyle}
      />
    </div>
  );
}
