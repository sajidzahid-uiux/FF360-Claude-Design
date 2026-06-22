import { ReactNode } from 'react';
import { ButtonVariantEnum } from '../../../constants';
import { cn } from '../../../utils/cn';
import { modalMobileFullscreenClassName } from '../../../utils/modalShell';
import { Button } from '../../ui-components/Button';
import { Overlay } from '../../system-components/Overlay';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
  closeOnOverlayClick?: boolean;
  size?: ModalSize;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'mx-4 max-w-full',
};

const CloseIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="h-5 w-5"
    aria-hidden
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
  closeOnOverlayClick = true,
  size = 'md',
}: ModalProps) {
  return (
    <Overlay
      isOpen={isOpen}
      onClose={onClose}
      closeOnBackdrop={closeOnOverlayClick}
      closeOnEscape
      fullscreenOnMobile
    >
      <div
        className={cn(
          'relative z-10 flex h-[90vh] max-h-[900px] w-full flex-col rounded-lg bg-bg-surface-elevated shadow-2xl',
          modalMobileFullscreenClassName,
          sizeClasses[size],
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="relative flex shrink-0 items-center justify-center border-b border-border-subtle px-4 py-3 sm:px-6 sm:py-4">
          <h2
            id="modal-title"
            className="text-text-primary max-[820px]:pr-10 text-center text-xl font-bold sm:text-2xl"
          >
            {title}
          </h2>
          <Button
            onClick={onClose}
            variant={ButtonVariantEnum.GHOST}
            aria-label="Close modal"
            iconOnly
            leftIcon={CloseIcon}
            className="absolute top-1/2 right-4 -translate-y-1/2 sm:right-6"
          />
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">{children}</div>
      </div>
    </Overlay>
  );
}
