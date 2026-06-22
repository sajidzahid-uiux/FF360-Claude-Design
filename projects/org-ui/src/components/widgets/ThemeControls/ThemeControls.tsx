import { forwardRef, useCallback, useId } from 'react';
import {
  SurfaceVariantEnum,
  ThemeControlsAppearanceStyleEnum,
  ThemeControlsOrientationEnum,
  ThemeModeEnum,
} from '../../../constants';
import { useTheme, type ThemeTransitionOptions } from '../../../theme';
import { cn } from '../../../utils/cn';
import { ThemeAccentSection } from './ThemeAccentSection';
import { ThemeAppearanceSection } from './ThemeAppearanceSection';
import type { ThemeControlsProps } from './ThemeControls.types';
import { ThemeControlsSeparator } from './ThemeControlsSeparator';
import { DEFAULT_ACCENT_PRESETS } from './themeControlsUtils';

export type {
  ThemeControlsAppearanceStyle,
  ThemeControlsProps
} from './ThemeControls.types';

export const ThemeControls = forwardRef<HTMLDivElement, ThemeControlsProps>(
  function ThemeControls(
    {
      className,
      orientation = ThemeControlsOrientationEnum.HORIZONTAL,
      showAppearance = true,
      showAccent = true,
      appearanceStyle = ThemeControlsAppearanceStyleEnum.SEGMENTED,
      appearanceLabel = 'Theme Mode',
      accentLabel = 'Accent color',
      accentPresets,
      showHexInput = false,
      surface = SurfaceVariantEnum.ELEVATED,
      onAppearanceChange,
      onAccentChange,
      ...rest
    },
    ref
  ) {
    const appearanceGroupId = useId();
    const accentGroupId = useId();
    const { mode, setMode, accentColor, setAccentColor } = useTheme();

    const presets =
      accentPresets === undefined ? [...DEFAULT_ACCENT_PRESETS] : accentPresets;

    const applyAccent = useCallback(
      (next: string) => {
        setAccentColor(next);
        onAccentChange?.(next);
      },
      [setAccentColor, onAccentChange]
    );

    const selectLight = (options?: ThemeTransitionOptions) => {
      setMode(ThemeModeEnum.LIGHT, options);
      onAppearanceChange?.(ThemeModeEnum.LIGHT);
    };

    const selectDark = (options?: ThemeTransitionOptions) => {
      setMode(ThemeModeEnum.DARK, options);
      onAppearanceChange?.(ThemeModeEnum.DARK);
    };

    const selectNight = (options?: ThemeTransitionOptions) => {
      setMode(ThemeModeEnum.NIGHT, options);
      onAppearanceChange?.(ThemeModeEnum.NIGHT);
    };

    const selectSystem = (options?: ThemeTransitionOptions) => {
      setMode(ThemeModeEnum.SYSTEM, options);
      onAppearanceChange?.(ThemeModeEnum.SYSTEM);
    };

    const toggleAppearance = (options?: ThemeTransitionOptions) => {
      const order = [
        ThemeModeEnum.LIGHT,
        ThemeModeEnum.DARK,
        ThemeModeEnum.NIGHT,
        ThemeModeEnum.SYSTEM,
      ] as const;
      const i = order.indexOf(mode);
      const next = order[(i + 1) % order.length];
      setMode(next, options);
      onAppearanceChange?.(next);
    };

    const bothPanels = showAppearance && showAccent;
    const rowLayout =
      orientation === ThemeControlsOrientationEnum.HORIZONTAL && bothPanels
        ? 'sm:flex-row sm:items-stretch'
        : '';

    const shell =
      surface === SurfaceVariantEnum.ELEVATED
        ? cn(
            'rounded-2xl border border-zinc-200/90 bg-white/90 shadow-xl shadow-zinc-950/[0.07] ring-1 ring-black/[0.03] backdrop-blur-md',
            'dark:border-zinc-700/80 dark:bg-zinc-900/85 dark:shadow-black/40 dark:ring-white/[0.06]',
            'night:border-[#2d4a48]/90 night:bg-[#111f2c]/92 night:shadow-[0_0_48px_-24px_rgba(223,255,134,0.08)] night:ring-accent/15'
          )
        : '';

    const innerPadding = surface === SurfaceVariantEnum.ELEVATED ? 'p-5 sm:p-6' : '';

    return (
      <div
        ref={ref}
        className={cn(shell, innerPadding, className)}
        {...rest}
      >
        <div className={cn('flex min-w-0 flex-col gap-8', rowLayout)}>
          {showAppearance && (
            <ThemeAppearanceSection
              headingId={appearanceGroupId}
              label={appearanceLabel}
              appearanceStyle={appearanceStyle}
              mode={mode}
              onSelectLight={selectLight}
              onSelectDark={selectDark}
              onSelectNight={selectNight}
              onSelectSystem={selectSystem}
              onToggleMode={toggleAppearance}
              sectionClassName={
                orientation === ThemeControlsOrientationEnum.HORIZONTAL && bothPanels
                  ? 'sm:flex-1 sm:pr-8'
                  : undefined
              }
            />
          )}

          {bothPanels && orientation === ThemeControlsOrientationEnum.HORIZONTAL && (
            <ThemeControlsSeparator />
          )}

          {showAccent && (
            <ThemeAccentSection
              headingId={accentGroupId}
              label={accentLabel}
              presets={presets}
              showHexInput={showHexInput}
              accentColor={accentColor}
              onAccentApply={applyAccent}
              sectionClassName={
                orientation === ThemeControlsOrientationEnum.HORIZONTAL && bothPanels
                  ? 'sm:flex-1 sm:pl-0'
                  : undefined
              }
            />
          )}
        </div>
      </div>
    );
  }
);

ThemeControls.displayName = 'ThemeControls';
