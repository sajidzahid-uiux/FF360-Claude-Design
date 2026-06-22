import type React from 'react';
import { ButtonVariantEnum } from '../../../constants';
import { useTheme } from '../../../theme';
import { getAccentTextColor } from '../../../utils/accent';
import { cn } from '../../../utils/cn';
import { modalMobileFullscreenClassName } from '../../../utils/modalShell';
import { Button } from '../../ui-components/Button';
import { Overlay } from '../../system-components/Overlay';

export interface AppFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
  cancelDisabled?: boolean;
  submitLabel?: string;
  submitIcon?: React.ReactNode;
  cancelLabel?: string;
  showCancel?: boolean;
  width?: number;
  maxHeight?: number | string;
}

const ArrowLeftIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="h-5 w-5"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
  </svg>
);

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

export function AppFormModal({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  isSubmitting = false,
  submitDisabled = false,
  cancelDisabled = false,
  submitLabel = 'Submit',
  submitIcon,
  cancelLabel = 'Cancel',
  showCancel = false,
  width = 635,
  maxHeight = 'calc(100% - 70px)',
}: AppFormModalProps) {
  const { accentColor } = useTheme();
  const accentTextColor = getAccentTextColor(accentColor || '#D7F27A');
  const isLightAccent = accentTextColor.toLowerCase() !== '#ffffff';
  const headerControlClassName = isLightAccent
    ? '!text-current hover:!bg-black/10'
    : '!text-current hover:!bg-white/20';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Overlay
      isOpen={isOpen}
      onClose={handleClose}
      closeOnBackdrop={!isSubmitting}
      closeOnEscape={!isSubmitting}
      fullscreenOnMobile
    >
      <div
        className={cn(
          'bg-bg-surface-elevated text-text-primary relative z-10 flex min-h-0 w-full max-w-full flex-col overflow-hidden rounded-lg shadow-2xl',
          modalMobileFullscreenClassName,
          'max-[820px]:max-h-none! max-[820px]:max-w-full!'
        )}
        style={{
          maxWidth: width,
          maxHeight,
        }}
      >
        <div
          className="bg-accent relative flex shrink-0 items-center justify-center px-4 py-3 sm:px-6 sm:py-4"
          style={{ color: accentTextColor }}
        >
          <Button
            onClick={handleClose}
            aria-label="Close"
            leftIcon={ArrowLeftIcon}
            iconOnly
            variant={ButtonVariantEnum.GHOST}
            className={cn(
              'absolute top-1/2 left-4 -translate-y-1/2 sm:left-6',
              headerControlClassName
            )}
          />

          <h2 className="text-current max-[820px]:px-12 text-center text-base font-semibold sm:text-lg">
            {title}
          </h2>
          <Button
            onClick={handleClose}
            aria-label="Close"
            iconOnly
            leftIcon={CloseIcon}
            className={cn(
              'absolute top-1/2 right-4 -translate-y-1/2 sm:right-6',
              headerControlClassName
            )}
            variant={ButtonVariantEnum.GHOST}
          />
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="bg-bg-surface flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-6 sm:gap-6 sm:px-9 sm:py-6">
            {children}
          </div>

          <div className="border-border-subtle bg-bg-surface-elevated flex shrink-0 items-center justify-between gap-3 border-t px-6 py-5 sm:px-9 sm:py-6">
            {showCancel ? (
              <Button
                onClick={handleClose}
                disabled={isSubmitting || cancelDisabled}
                variant={ButtonVariantEnum.GHOST}
                title={cancelLabel}
              />
            ) : null}
            <Button
              type="submit"
              disabled={submitDisabled || isSubmitting}
              fullWidth={!showCancel}
              rightIcon={submitIcon}
              loading={isSubmitting}
              title={isSubmitting ? 'Submitting...' : submitLabel}
            />
          </div>
        </form>
      </div>
    </Overlay>
  );
}

