import { ComponentSizeEnum, type ComponentSize } from '../../../constants';
import { cn } from '../../../utils/cn';

export interface LoaderProps {
  size?: ComponentSize;
  text?: string;
  className?: string;
  /**
   * When true (default), applies `mx-auto my-auto` and grows to center in flex/grid parents.
   * Pass `centerInContainer={false}` for inline chip-style usage.
   */
  centerInContainer?: boolean;
}

export function Loader({
  size = ComponentSizeEnum.MD,
  text,
  className,
  centerInContainer = true,
}: LoaderProps) {
  const frameSizeClass =
    size === ComponentSizeEnum.SM
      ? 'h-8 w-8'
      : size === ComponentSizeEnum.LG
        ? 'h-14 w-14'
        : 'h-11 w-11';

  const pipeThicknessClass =
    size === ComponentSizeEnum.SM
      ? 'h-[3px] w-[3px]'
      : size === ComponentSizeEnum.LG
        ? 'h-[5px] w-[5px]'
        : 'h-1 w-1';

  const flowDotSizeClass =
    size === ComponentSizeEnum.SM
      ? 'h-1.5 w-1.5'
      : size === ComponentSizeEnum.LG
        ? 'h-2.5 w-2.5'
        : 'h-2 w-2';

  const externalPipeClass =
    size === ComponentSizeEnum.SM
      ? 'right-[-14%] bottom-[22%] w-[22%] h-[3px]'
      : size === ComponentSizeEnum.LG
        ? 'right-[-16%] bottom-[22%] w-[24%] h-[5px]'
        : 'right-[-15%] bottom-[22%] w-[23%] h-1';

  const pipeHorizontalClass =
    size === ComponentSizeEnum.SM
      ? 'h-[3px]'
      : size === ComponentSizeEnum.LG
        ? 'h-[5px]'
        : 'h-1';

  const pipeVerticalClass =
    size === ComponentSizeEnum.SM
      ? 'w-[3px]'
      : size === ComponentSizeEnum.LG
        ? 'w-[5px]'
        : 'w-1';

  const textSizeClass =
    size === ComponentSizeEnum.SM
      ? 'text-xs'
      : size === ComponentSizeEnum.LG
        ? 'text-base'
        : 'text-sm';

  return (
    <div
      aria-live="polite"
      role="status"
      className={cn(
        'mx-auto flex w-full justify-center',
        centerInContainer && 'my-auto h-full min-h-[8rem] flex-1 self-center',
        text ? 'flex-col items-center gap-3 text-center' : 'items-center gap-2.5',
        className
      )}
    >
      <span
        className={cn(
          'relative inline-flex shrink-0 items-center justify-center rounded-lg border border-accent/25 bg-bg-surface-elevated',
          frameSizeClass
        )}
      >
        <span className="absolute inset-[16%] rounded-md border border-border-subtle/60" />

        <span className={cn('absolute left-[22%] top-[22%] rounded-sm bg-accent/80 animate-[loader-pipe-build_2.2s_ease-in-out_infinite]', pipeThicknessClass)} />
        <span className={cn('absolute left-[22%] top-[22%] w-[58%] origin-left rounded-sm bg-accent/80 animate-[loader-pipe-horizontal_2.2s_ease-in-out_infinite]', pipeHorizontalClass)} />
        <span className={cn('absolute left-[79%] top-[22%] h-[56%] origin-top rounded-sm bg-border-strong/85 animate-[loader-pipe-vertical_2.2s_ease-in-out_infinite]', pipeVerticalClass)} />
        <span className={cn('absolute left-[79%] bottom-[22%] w-[20%] origin-left rounded-sm bg-border-strong/85 animate-[loader-pipe-tail_2.2s_ease-in-out_infinite]', pipeHorizontalClass)} />

        <span className="absolute inset-[16%]">
          <span className={cn('absolute left-[6%] top-[6%] rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)] animate-[loader-pipe-flow_2.2s_linear_infinite]', flowDotSizeClass)} />
        </span>

        <span
          className={cn(
            'absolute rounded-r-sm bg-border-strong/85 shadow-[0_0_10px_-3px_var(--color-border-strong)] animate-[loader-pipe-external_2.2s_ease-in-out_infinite]',
            'origin-left',
            externalPipeClass
          )}
        />
        <span
          className={cn(
            'absolute rounded-full bg-accent shadow-[0_0_10px_var(--color-accent)] animate-[loader-pipe-external-flow_2.2s_linear_infinite]',
            'origin-left',
            flowDotSizeClass,
            size === ComponentSizeEnum.SM
              ? 'right-[-14%] bottom-[22%]'
              : size === ComponentSizeEnum.LG
                ? 'right-[-16%] bottom-[22%]'
                : 'right-[-15%] bottom-[22%]'
          )}
        />
      </span>
      {text ? (
        <span className={cn('text-text-secondary font-medium', textSizeClass)}>
          {text}
        </span>
      ) : (
        <span className="sr-only">Loading</span>
      )}
    </div>
  );
}
