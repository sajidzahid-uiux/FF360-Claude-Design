import { colors } from './colors';

export const tokens = {
  // Colors - imported from single source of truth
  colors,
} as const;

export type Tokens = typeof tokens;
