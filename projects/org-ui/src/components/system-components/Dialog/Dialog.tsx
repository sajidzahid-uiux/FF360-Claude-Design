import { cloneElement, isValidElement, ReactElement, ReactNode } from 'react';
import { ButtonVariantEnum } from '../../../constants';
import { useTheme } from '../../../theme';
import { getAccentTextColor, toAccentLight } from '../../../utils/accent';
import { cn } from '../../../utils/cn';
import { dialogMobileActionsClassName, dialogMobileShellClassName } from '../../../utils/modalShell';
import { Button } from '../../ui-components/Button';
import { Overlay } from '../../system-components/Overlay';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  variant?: 'default' | 'danger';
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
  icon?: ReactNode;
}

const CloseIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="h-5 w-5"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  variant = 'default',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  isLoading = false,
  icon,
}: DialogProps) {
  const { accentColor } = useTheme();
  const accentIconColor = getAccentTextColor(
    toAccentLight(accentColor || '#D7F27A')
  );
  const dialogIcon =
    variant !== 'danger' && isValidElement(icon)
      ? cloneElement(icon as ReactElement<{ className?: string; style?: React.CSSProperties }>, {
          className: `${(icon.props as { className?: string }).className ?? ''} !text-current`,
          style: {
            ...((icon.props as { style?: React.CSSProperties }).style ?? {}),
            color: accentIconColor,
          },
        })
      : icon;

  const handleConfirm = async () => {
    await onConfirm();
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Overlay
      isOpen={isOpen}
      onClose={handleClose}
      closeOnBackdrop={!isLoading}
      closeOnEscape={!isLoading}
    >
      <div
        className={cn(
          'relative flex w-full max-w-md flex-col rounded-lg bg-white shadow-xl dark:bg-zinc-800 night:bg-[#111f2c]',
          dialogMobileShellClassName
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        {!isLoading ? (
          <Button
            onClick={onClose}
            variant={ButtonVariantEnum.GHOST}
            iconOnly
            leftIcon={CloseIcon}
            className="absolute right-4 top-4"
            aria-label="Close"
          />
        ) : null}

        <div className="p-4 sm:p-6">
          {icon ? (
            <div
              className={cn(
                'mx-auto flex h-12 w-12 items-center justify-center rounded-full [&_svg]:!text-current',
                variant === 'danger'
                  ? 'bg-[var(--color-feedback-error-soft)] text-[var(--color-feedback-error-strong)]'
                  : 'bg-[color-mix(in_oklch,var(--color-accent)_25%,white)]'
              )}
              style={variant === 'danger' ? undefined : { color: accentIconColor }}
            >
              {dialogIcon}
            </div>
          ) : null}

          <div className={cn('text-center', icon ? 'mt-4' : '')}>
            <h3
              id="dialog-title"
              className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 night:text-white"
            >
              {title}
            </h3>
            {description ? (
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 night:text-slate-400">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        <div className={cn('flex gap-3 px-4 py-4 sm:px-6', dialogMobileActionsClassName)}>
          <Button
            onClick={onClose}
            disabled={isLoading}
            title={cancelLabel}
            variant={ButtonVariantEnum.SURFACE}
            fullWidth
          />

          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            fullWidth
            variant={
              variant === 'danger'
                ? ButtonVariantEnum.DELETE
                : ButtonVariantEnum.DEFAULT
            }
            title={confirmLabel}
            loading={isLoading}
          />
        </div>
      </div>
    </Overlay>
  );
}

