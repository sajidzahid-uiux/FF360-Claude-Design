/**
 * Design System Colors
 * 
 * ⚠️ SINGLE SOURCE OF TRUTH for all color values
 * 
 * Used by:
 * - Button component (TypeScript)
 * - Theme tokens (TypeScript)
 * - CSS files: src/styles.css and tailwind-preset.css
 * 
 * Note: CSS cannot import TypeScript, so values must be manually synced.
 */

export const colors = {
  // Primary Colors
  black: '#18181b',
  white: '#ffffff',
  // Brand accent (lime, slightly softened from legacy neon)
  accent: '#d9f46e',
  
  // Border & Dividers
  border: '#e4e4e7',

  feedback: {
    error: {
      base: '#ff3b30',
      soft: '#ffc9c9',
      strong: '#82181a',
    },
    success: {
      base: '#16a34a',
      soft: '#b9f8cf',
      text: '#0d542b',
    },
  },

  semantic: {
    light: {
      bgApp: '#ffffff',
      bgMain: '#ffffff',
      bgSurface: '#fafafa',
      bgSurfaceElevated: '#ffffff',
      bgHover: '#f3f4f6',
      textPrimary: '#0a0a0a',
      textSecondary: '#404040',
      textMuted: '#737373',
      textInverse: '#f5f5f5',
      borderSubtle: '#e5e7eb',
      borderStrong: '#d4d4d8',
    },
    dark: {
      bgApp: '#09090b',
      bgMain: '#09090b',
      bgSurface: '#18181b',
      bgSurfaceElevated: '#18181b',
      bgHover: '#27272a',
      textPrimary: '#f4f4f5',
      textSecondary: '#d4d4d8',
      textMuted: '#a1a1aa',
      textInverse: '#0a0a0a',
      border: '#3f3f46',
      borderSubtle: '#3f3f46',
      borderStrong: '#52525b',
    },
    night: {
      bgApp: '#0b1722',
      bgMain: '#0f1d2a',
      bgSurface: '#132331',
      bgSurfaceElevated: '#1a2f3d',
      bgHover: '#223a49',
      textPrimary: '#f2fbff',
      textSecondary: '#d5e5f0',
      textMuted: '#9bb2c4',
      textInverse: '#0b1722',
      border: '#2d4a48',
      borderSubtle: '#274252',
      borderStrong: '#315166',
    },
  },
} as const;

export type Colors = typeof colors;

