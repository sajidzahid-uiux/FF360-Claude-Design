import {
  ButtonVariantEnum,
  ComponentSizeEnum,
  CornerRadiusEnum,
  ThemeControlsAppearanceStyleEnum,
  ThemeModeEnum,
} from '../../../constants';
import type { ThemeMode, ThemeTransitionOptions } from '../../../theme';
import { cn } from '../../../utils/cn';
import { Button } from '../../ui-components/Button';
import { TabsSwitcher } from '../../ui-components/TabsSwitcher';
import type { ThemeControlsAppearanceStyle } from './ThemeControls.types';
import { MoonIcon, NightSkyIcon, SunIcon, SystemIcon } from './ThemeControlsIcons';

export interface ThemeAppearanceSectionProps {
  headingId: string;
  label: string;
  appearanceStyle: ThemeControlsAppearanceStyle;
  mode: ThemeMode;
  onSelectLight: (options?: ThemeTransitionOptions) => void;
  onSelectDark: (options?: ThemeTransitionOptions) => void;
  onSelectNight: (options?: ThemeTransitionOptions) => void;
  onSelectSystem: (options?: ThemeTransitionOptions) => void;
  onToggleMode: (options?: ThemeTransitionOptions) => void;
  sectionClassName?: string;
}

export function ThemeAppearanceSection({
  headingId,
  label,
  appearanceStyle,
  mode,
  onSelectLight,
  onSelectDark,
  onSelectNight,
  onSelectSystem,
  onToggleMode,
  sectionClassName,
}: ThemeAppearanceSectionProps) {
  return (
    <section
      className={cn('flex min-w-0 flex-col gap-3', sectionClassName)}
      aria-labelledby={headingId}
    >
      <header className="space-y-1">
        <h3
          id={headingId}
          className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 night:text-white"
        >
          {label}
        </h3>
        <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 night:text-slate-400">
          Light, dark, night, or match your OS appearance. System uses light or dark only (not night).
        </p>
      </header>

      {appearanceStyle === ThemeControlsAppearanceStyleEnum.SEGMENTED ? (
        <TabsSwitcher
          fullWidth
          className="w-full"
          value={mode}
          size={ComponentSizeEnum.MD}
          radius={CornerRadiusEnum.FULL}
          onChange={(next, sourceEvent) => {
            const opts: ThemeTransitionOptions | undefined = sourceEvent
              ? { origin: { clientX: sourceEvent.clientX, clientY: sourceEvent.clientY } }
              : undefined;
            if (next === ThemeModeEnum.LIGHT) {
              onSelectLight(opts);
            } else if (next === ThemeModeEnum.DARK) {
              onSelectDark(opts);
            } else if (next === ThemeModeEnum.NIGHT) {
              onSelectNight(opts);
            } else {
              onSelectSystem(opts);
            }
          }}
          items={[
            { value: ThemeModeEnum.LIGHT, label: 'Light', icon: <SunIcon /> },
            { value: ThemeModeEnum.DARK, label: 'Dark', icon: <MoonIcon /> },
            { value: ThemeModeEnum.NIGHT, label: 'Night', icon: <NightSkyIcon /> },
            { value: ThemeModeEnum.SYSTEM, label: 'System', icon: <SystemIcon /> },
          ]}
        />
      ) : (
        <Button
          onClick={(event) =>
            onToggleMode({
              origin: { clientX: event.clientX, clientY: event.clientY },
            })
          }
          title={
            mode === ThemeModeEnum.LIGHT
              ? 'Switch to dark mode'
              : mode === ThemeModeEnum.DARK
                ? 'Switch to night mode'
                : mode === ThemeModeEnum.NIGHT
                  ? 'Use system theme'
                  : 'Switch to light mode'
          }
          variant={ButtonVariantEnum.SURFACE}
          leftIcon={
            mode === ThemeModeEnum.LIGHT ? (
              <MoonIcon className="h-4 w-4" />
            ) : mode === ThemeModeEnum.DARK ? (
              <NightSkyIcon className="h-4 w-4" />
            ) : mode === ThemeModeEnum.NIGHT ? (
              <SystemIcon className="h-4 w-4" />
            ) : (
              <SunIcon className="h-4 w-4" />
            )
          }
        />
      )}
    </section>
  );
}
