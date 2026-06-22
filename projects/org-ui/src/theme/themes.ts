/**
 * Theme token definitions: light, dark (neutral zinc), and night (neon-aligned canvas).
 */

import { colors } from './colors';

const BUTTON_DANGER = {
  bg: colors.feedback.error.base,
  text: colors.white,
  hover: '#E63027',
} as const;

const semantic = colors.semantic;

export const lightTheme = {
  // Background colors
  background: {
    primary: semantic.light.bgApp,
    secondary: semantic.light.bgMain,
    elevated: semantic.light.bgSurfaceElevated,
  },
  
  // Text colors
  text: {
    primary: semantic.light.textPrimary,
    secondary: semantic.light.textSecondary,
    tertiary: semantic.light.textMuted,
    inverse: semantic.light.textInverse,
  },
  
  // Button colors
  button: {
    default: {
      bg: colors.black,
      text: colors.white,
      hover: '#27272A',
    },
    white: {
      bg: '#FFFFFF',
      text: colors.black,
      hover: '#F9FAFB',
      border: colors.border,
    },
    ghost: {
      bg: 'transparent',
      text: colors.black,
      hover: '#F9FAFB',
    },
    delete: {
      bg: colors.white,
      text: colors.feedback.error.base,
      hover: '#FFF1F0',
      border: colors.border,
    },
    danger: BUTTON_DANGER,
  },
  
  // Border colors
  border: {
    default: semantic.light.borderSubtle,
    light: '#f3f4f6',
    dark: semantic.light.borderStrong,
  },
  
  // Focus rings
  focus: {
    default: colors.black,
    border: colors.border,
    error: colors.feedback.error.base,
  },

  accent: {
    bg: colors.accent,
    foreground: colors.black,
  },
} as const;

export const darkTheme = {
  // Background colors
  background: {
    primary: semantic.dark.bgApp,
    secondary: semantic.dark.bgMain,
    elevated: semantic.dark.bgSurfaceElevated,
  },
  
  // Text colors
  text: {
    primary: semantic.dark.textPrimary,
    secondary: semantic.dark.textSecondary,
    tertiary: semantic.dark.textMuted,
    inverse: semantic.dark.textInverse,
  },
  
  // Button colors
  button: {
    default: {
      bg: '#FAFAFA',
      text: colors.black,
      hover: '#E4E4E7',
    },
    white: {
      bg: '#27272A',
      text: '#FAFAFA',
      hover: '#3F3F46',
      border: '#3F3F46',
    },
    ghost: {
      bg: 'transparent',
      text: '#FAFAFA',
      hover: '#27272A',
    },
    delete: {
      bg: '#27272A',
      text: colors.feedback.error.base,
      hover: '#3F3F46',
      border: '#3F3F46',
    },
    danger: BUTTON_DANGER,
  },
  
  // Border colors
  border: {
    default: semantic.dark.borderSubtle,
    light: '#27272a',
    dark: semantic.dark.borderStrong,
  },
  
  // Focus rings
  focus: {
    default: semantic.dark.textPrimary,
    border: '#3F3F46',
    error: colors.feedback.error.base,
  },

  accent: {
    bg: colors.accent,
    foreground: colors.black,
  },
} as const;

/**
 * Night surfaces tuned for Tile Design.
 */
export const nightTheme = {
  background: {
    primary: semantic.night.bgApp,
    secondary: semantic.night.bgMain,
    elevated: semantic.night.bgSurfaceElevated,
  },

  text: {
    primary: semantic.night.textPrimary,
    secondary: semantic.night.textSecondary,
    tertiary: semantic.night.textMuted,
    inverse: semantic.night.textInverse,
  },

  button: {
    default: {
      bg: colors.accent,
      text: colors.black,
      hover: '#d0f96f',
    },
    white: {
      bg: '#142433',
      text: colors.white,
      hover: '#1a3044',
      border: '#2d4a48',
    },
    ghost: {
      bg: 'transparent',
      text: colors.white,
      hover: 'rgba(247, 255, 224, 0.08)',
    },
    delete: {
      bg: '#142433',
      text: colors.feedback.error.base,
      hover: '#1a3044',
      border: '#374151',
    },
    danger: BUTTON_DANGER,
  },

  border: {
    default: semantic.night.borderSubtle,
    light: '#223a49',
    dark: semantic.night.borderStrong,
  },

  focus: {
    default: colors.accent,
    border: '#243548',
    error: colors.feedback.error.base,
  },

  accent: {
    bg: colors.accent,
    foreground: colors.black,
  },
} as const;

export interface Theme {
  background: {
    primary: string;
    secondary: string;
    elevated: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  button: {
    default: { bg: string; text: string; hover: string; };
    white: { bg: string; text: string; hover: string; border: string; };
    ghost: { bg: string; text: string; hover: string; };
    delete: { bg: string; text: string; hover: string; border: string; };
    danger: { bg: string; text: string; hover: string; };
  };
  border: {
    default: string;
    light: string;
    dark: string;
  };
  focus: {
    default: string;
    border: string;
    error: string;
  };

  accent: {
    bg: string;
    foreground: string;
  };
}

