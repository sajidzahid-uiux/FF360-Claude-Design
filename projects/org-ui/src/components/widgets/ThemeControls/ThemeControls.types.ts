import type { HTMLAttributes } from 'react';
import type {
  SurfaceVariant,
  ThemeControlsAppearanceStyle,
  ThemeControlsOrientation,
  ThemeMode,
} from '../../../constants';

export type { ThemeControlsAppearanceStyle } from '../../../constants';

export interface ThemeControlsProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> {
  orientation?: ThemeControlsOrientation;
  showAppearance?: boolean;
  showAccent?: boolean;
  appearanceStyle?: ThemeControlsAppearanceStyle;
  appearanceLabel?: string;
  accentLabel?: string;
  accentPresets?: string[];
  showHexInput?: boolean;
  onAppearanceChange?: (mode: ThemeMode) => void;
  onAccentChange?: (color: string) => void;
  surface?: SurfaceVariant;
}
