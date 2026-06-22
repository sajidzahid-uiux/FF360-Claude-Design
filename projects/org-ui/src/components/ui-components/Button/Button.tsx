
import {
  ButtonHTMLAttributes,
  CSSProperties,
  forwardRef,
  ReactNode,
} from 'react';
import {
  ButtonVariantEnum,
  ComponentSizeEnum,
  type ButtonVariant,
  type ComponentSize,
} from '../../../constants';
import { cn } from '../../../utils/cn';

let didWarnStringChildrenUsage = false;
let didWarnInlineHandlerUsage = false;
let didWarnIconOnlyTitleUsage = false;

/** Preset names resolve to CSS colors; any other string is used as-is (hex, rgb(), hsl(), var(--token), etc.). */
const BACKGROUND_PRESETS: Record<string, string> = {
  white: '#ffffff',
  black: '#18181b',
  accent: 'var(--color-accent)',
  'zinc-800': '#27272a',
};

function resolveBackgroundToken(value: string): string {
  const key = value.trim().toLowerCase();
  return BACKGROUND_PRESETS[key] ?? value.trim();
}

interface ButtonCommonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'title'> {
  /**
   * Size of the button
   */
  size?: ComponentSize;

  /**
   * Whether the button takes full width of its container
   */
  fullWidth?: boolean;

  /**
   * Whether the button is in loading state
   */
  loading?: boolean;

  /**
   * Icon to display on the left side of the button
   */
  leftIcon?: ReactNode;

  /**
   * Icon to display on the right side of the button
   */
  rightIcon?: ReactNode;
}

/** Default: text or icon+text. `title` sets visible label (not the HTML tooltip). */
interface ButtonTextModeProps extends ButtonCommonProps {
  iconOnly?: false | undefined;
  /**
   * Visible button text (preferred over string `children`).
   */
  title?: string;
}

/** Square control: no visible label prop — use `aria-label` (and optional `className`) for accessibility. */
interface ButtonIconOnlyModeProps extends ButtonCommonProps {
  iconOnly: true;
  title?: never;
}

type ButtonBaseProps = ButtonTextModeProps | ButtonIconOnlyModeProps;

type NonColoredButtonVariant = Exclude<ButtonVariant, ButtonVariantEnum.COLORED>;

type ColoredButtonProps = ButtonBaseProps & {
  /**
   * Visual style variant of the button.
   * Use `colored` with `backgroundColor` (and optional `darkBackgroundColor`) for arbitrary fills.
   */
  variant: ButtonVariantEnum.COLORED;
  /**
   * Background when `variant` is `colored`. Hex, rgb/hsl, `var(...)`, or preset: `white`, `black`, `accent`, `zinc-800`.
   * Defaults to `white` when `variant` is `colored` and this is omitted.
   */
  backgroundColor?: string;
  /**
   * Dark-mode background for `colored` (same formats as `backgroundColor`).
   * Defaults to the same value as `backgroundColor`.
   */
  darkBackgroundColor?: string;
  /**
   * Text color on light background for `colored` (hex, rgb(), etc.).
   */
  foregroundColor?: string;
  /**
   * Text color on dark background for `colored`.
   * Defaults to light gray when light and dark backgrounds differ, otherwise matches `foregroundColor` / black.
   */
  darkForegroundColor?: string;
};

type NonColoredButtonProps = ButtonBaseProps & {
  variant?: NonColoredButtonVariant;
  backgroundColor?: never;
  darkBackgroundColor?: never;
  foregroundColor?: never;
  darkForegroundColor?: never;
};

export type ButtonProps = ColoredButtonProps | NonColoredButtonProps;

const staticButtonVariants: Record<NonColoredButtonVariant, string> = {
  /** Night: primary accent fill + accent focus. */
  default:
    'bg-black text-white hover:bg-black/90 shadow-sm focus:ring-black focus:ring-offset-2 ' +
    'dark:bg-white dark:text-black dark:hover:bg-zinc-100 dark:focus:ring-white dark:focus:ring-offset-zinc-950 ' +
    'night:bg-accent night:text-black night:hover:brightness-[1.03] night:shadow-[0_0_28px_-12px_rgba(223,255,134,0.55)] night:focus:ring-accent night:focus:ring-offset-[#071018]',
  surface:
    'bg-white text-black border border-border hover:bg-zinc-50 shadow-sm focus:ring-border focus:ring-offset-2 ' +
    'dark:bg-zinc-800 dark:text-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-700 dark:focus:ring-zinc-700 dark:focus:ring-offset-zinc-950 ' +
    'night:bg-[#142433] night:text-slate-100 night:border-[#2d4a48] night:hover:bg-[#1a3044] night:focus:ring-accent/70 night:focus:ring-offset-[#071018]',
  ghost:
    'bg-transparent text-black hover:bg-gray-50 focus:ring-border focus:ring-offset-2 ' +
    'dark:text-white dark:hover:bg-zinc-800 dark:focus:ring-zinc-700 dark:focus:ring-offset-zinc-950 ' +
    'night:text-slate-100 night:hover:bg-[#f7ffe0]/[0.08] night:focus:ring-accent/80 night:focus:ring-offset-[#071018]',
  delete:
    'bg-white text-[var(--color-feedback-error)] border border-border hover:bg-[var(--color-feedback-error-soft)] shadow-sm focus:ring-[var(--color-feedback-error)] focus:ring-offset-2 ' +
    'dark:bg-zinc-800 dark:text-[var(--color-feedback-error)] dark:border-zinc-700 dark:hover:bg-zinc-700 dark:focus:ring-[var(--color-feedback-error)] dark:focus:ring-offset-zinc-950 ' +
    'night:bg-[#142433] night:border-[#2d4a48] night:hover:bg-[#1a3044] night:focus:ring-[var(--color-feedback-error)] night:focus:ring-offset-[#071018]',
  danger:
    'bg-[var(--color-feedback-error)] text-white hover:opacity-90 shadow-sm focus:ring-[var(--color-feedback-error)] focus:ring-offset-2 ' +
    'dark:focus:ring-[var(--color-feedback-error)] dark:focus:ring-offset-zinc-950 ' +
    'night:focus:ring-[var(--color-feedback-error)] night:focus:ring-offset-[#071018]',
  accent:
    'bg-accent text-black shadow-sm hover:shadow-md border-2 border-transparent focus:border-accent focus:ring-accent focus:ring-offset-2 ' +
    'dark:focus:ring-offset-zinc-950 ' +
    'night:shadow-[0_0_26px_-10px_rgba(223,255,134,0.5)] night:focus:ring-accent night:focus:ring-offset-[#071018]',
};

/** `colored`: arbitrary fill via CSS variables + inset hover overlay (no filter). */
const coloredVariantClasses =
  'border border-border shadow-sm focus:ring-offset-2 dark:border-zinc-700 dark:focus:ring-offset-zinc-950 ' +
  'focus:[border-color:var(--btn-colored-bg)] focus:ring-[var(--btn-colored-bg)] ' +
  'dark:focus:[border-color:var(--btn-colored-bg-dark)] dark:focus:ring-[var(--btn-colored-bg-dark)] ' +
  'night:border-[#2d4a48] night:focus:[border-color:var(--btn-colored-bg-dark)] night:focus:ring-[var(--btn-colored-bg-dark)] night:focus:ring-offset-[#071018] ' +
  '[background-color:var(--btn-colored-bg)] dark:[background-color:var(--btn-colored-bg-dark)] [color:var(--btn-colored-fg)] dark:[color:var(--btn-colored-fg-dark)] ' +
  'hover:brightness-95 dark:hover:brightness-105 night:hover:brightness-105';

const buttonSizes = {
  [ComponentSizeEnum.SM]: 'h-8 px-3 text-sm',
  [ComponentSizeEnum.MD]: 'h-10 px-4 text-base',
  [ComponentSizeEnum.LG]: 'h-12 px-6 text-lg',
};

const iconOnlySizes = {
  [ComponentSizeEnum.SM]: 'h-8 w-8 min-h-8 min-w-8 shrink-0',
  [ComponentSizeEnum.MD]: 'h-10 w-10 min-h-10 min-w-10 shrink-0',
  [ComponentSizeEnum.LG]: 'h-12 w-12 min-h-12 min-w-12 shrink-0',
};

const iconSizes = {
  [ComponentSizeEnum.SM]: 'h-4 w-4',
  [ComponentSizeEnum.MD]: 'h-5 w-5',
  [ComponentSizeEnum.LG]: 'h-6 w-6',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      title,
      variant = ButtonVariantEnum.DEFAULT,
      backgroundColor: backgroundColorProp,
      darkBackgroundColor,
      foregroundColor,
      darkForegroundColor,
      size = ComponentSizeEnum.MD,
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      iconOnly = false,
      disabled,
      className,
      type = 'button',
      style,
      children,
      ...props
    },
    ref
  ) => {
    const hasStringChildrenOnly =
      typeof children === 'string' && children.trim().length > 0;

    if (
      process.env.NODE_ENV !== 'production' &&
      !didWarnStringChildrenUsage &&
      title === undefined &&
      hasStringChildrenOnly
    ) {
      didWarnStringChildrenUsage = true;
      // eslint-disable-next-line no-console
      console.warn(
        '[org-ui/Button] Detected string children. Prefer `title` prop for button text (e.g. <Button title="Save" />).'
      );
    }

    if (
      process.env.NODE_ENV !== 'production' &&
      !didWarnIconOnlyTitleUsage &&
      iconOnly &&
      title !== undefined
    ) {
      didWarnIconOnlyTitleUsage = true;
      // eslint-disable-next-line no-console
      console.error(
        '[org-ui/Button] `title` sets visible button text and must not be used with `iconOnly`. Use `aria-label` for an accessible name instead.'
      );
    }

    if (
      process.env.NODE_ENV !== 'production' &&
      !didWarnInlineHandlerUsage &&
      typeof props.onClick === 'function' &&
      props.onClick.name === ''
    ) {
      didWarnInlineHandlerUsage = true;
      // eslint-disable-next-line no-console
      console.warn(
        '[org-ui/Button] Detected an anonymous onClick handler. Prefer a named/memoized handler function instead of inline callbacks for better render stability.'
      );
    }

    const iconClasses = iconSizes[size];
    const content = iconOnly
      ? undefined
      : title ?? (hasStringChildrenOnly ? children : undefined);
    const hasText = Boolean(content);

    let coloredVars: CSSProperties | undefined;
    if (variant === ButtonVariantEnum.COLORED) {
      const bgLight = resolveBackgroundToken(backgroundColorProp ?? 'white');
      const bgDark = resolveBackgroundToken(
        darkBackgroundColor ?? backgroundColorProp ?? 'white'
      );
      const fgLight = foregroundColor ?? '#18181b';
      const fgDark =
        darkForegroundColor ??
        (bgDark !== bgLight ? '#fafafa' : fgLight);

      coloredVars = {
        '--btn-colored-bg': bgLight,
        '--btn-colored-bg-dark': bgDark,
        '--btn-colored-fg': fgLight,
        '--btn-colored-fg-dark': fgDark,
      } as CSSProperties;
    }

    const variantClasses =
      variant === ButtonVariantEnum.COLORED
        ? coloredVariantClasses
        : staticButtonVariants[variant];

    return (
      <button
        {...props}
        ref={ref}
        type={type}
        disabled={disabled || loading}
        style={{
          ...coloredVars,
          ...style,
        }}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-md cursor-pointer',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'ring-offset-white dark:ring-offset-zinc-950 night:ring-offset-[#071018]',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-inherit',
          variantClasses,
          iconOnly ? iconOnlySizes[size] : buttonSizes[size],
          fullWidth && 'w-full',
          className
        )}
      >
        {loading && (
          <svg
            className={cn(
              'animate-spin',
              iconClasses,
              hasText && !iconOnly && 'mr-2'
            )}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {!loading && leftIcon && (
          <span
            className={cn(
              'inline-flex items-center justify-center',
              iconClasses,
              hasText && !iconOnly && 'mr-2'
            )}
          >
            {leftIcon}
          </span>
        )}

        {content ? (
          <span className="whitespace-nowrap">{content}</span>
        ) : null}

        {!loading && rightIcon && (
          <span
            className={cn(
              'inline-flex items-center justify-center',
              iconClasses,
              hasText && !iconOnly && 'ml-2'
            )}
          >
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
