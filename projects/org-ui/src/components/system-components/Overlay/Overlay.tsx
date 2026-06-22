import { ReactNode, useEffect } from 'react';
import { cn } from '../../../utils/cn';
import { overlayMobileFullscreenClassName } from '../../../utils/modalShell';

export interface OverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  /** Stretch children to viewport edges on small screens (modals, switcher). Default false. */
  fullscreenOnMobile?: boolean;
}

export function Overlay({
  isOpen,
  onClose,
  children,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className = '',
  fullscreenOnMobile = false,
}: OverlayProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && closeOnEscape) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeOnEscape, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm',
        fullscreenOnMobile && overlayMobileFullscreenClassName,
        className
      )}
      onClick={handleBackdropClick}
    >
      {children}
    </div>
  );
}

